import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import Refund from "@/models/Refund";
import { verifyAdmin } from "@/lib/adminAuth";

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const secretParam = url.searchParams.get("secret");
    const authHeader = request.headers.get("authorization");
    const expectedSecret = process.env.CRON_SECRET;

    const isCronAuthorized = expectedSecret && (secretParam === expectedSecret || authHeader === `Bearer ${expectedSecret}`);
    const adminUser = await verifyAdmin();

    if (!isCronAuthorized && !adminUser) {
      return NextResponse.json({ error: "Unauthorized. Admin credentials or Cron Secret required." }, { status: 401 });
    }

    await dbConnect();
    const now = new Date();

    const createdClaims = [];

    // 1. Sync expired/cancelled Orders with a security deposit
    const expiredOrders = await Order.find({
      $or: [
        { endDate: { $lte: now } },
        { status: { $in: ["CANCELLED", "EXPIRED"] } }
      ],
      depositCharged: { $gt: 0 }
    });

    for (const order of expiredOrders) {
      const existingRefund = await Refund.findOne({
        $or: [
          { orderId: order._id.toString() },
          { orderId: order.bundleOrderId },
          { $and: [{ $or: [{ userId: order.userId }, { userEmail: order.email }] }, { planName: order.bundleName }, { orderId: { $exists: false } }] }
        ]
      });

      if (!existingRefund) {
        // Query linked Bundle to check for returned item condition (DAMAGED / LOST)
        const linkedBundle = await Bundle.findOne({
          $or: [{ orderId: order._id.toString() }, { orderId: order.bundleOrderId }]
        });

        let damageDeduction = 0;
        if (linkedBundle && linkedBundle.returnedItems && linkedBundle.returnedItems.length > 0) {
          linkedBundle.returnedItems.forEach(item => {
            if (item.condition === "DAMAGED") {
              damageDeduction += 200; // Deduct ₹200 for damaged item
            } else if (item.condition === "LOST") {
              damageDeduction += 500; // Deduct ₹500 for lost item
            }
          });
        }

        const netRefundAmount = Math.max(0, order.depositCharged - damageDeduction);

        const refund = await Refund.create({
          orderId: order._id.toString(),
          userId: order.userId || "GUEST",
          userName: order.userName || "Valued Customer",
          userEmail: order.email,
          userPhone: order.phone || "",
          planName: order.bundleName,
          depositAmount: netRefundAmount,
          status: "PENDING",
          cancelledAt: order.endDate || order.updatedAt || new Date()
        });
        createdClaims.push(refund);
      }
    }

    // 2. Sync expired Users with a selectedPlan security deposit
    const expiredUsers = await User.find({
      "selectedPlan.planName": { $exists: true, $ne: "" },
      "selectedPlan.securityDeposit": { $gt: 0 },
      "selectedPlan.endDate": { $lte: now }
    });

    for (const u of expiredUsers) {
      const existingRefund = await Refund.findOne({
        $or: [{ userId: u._id.toString() }, { userEmail: u.email }],
        planName: u.selectedPlan.planName
      });

      if (!existingRefund) {
        const refund = await Refund.create({
          userId: u._id.toString(),
          userName: u.name,
          userEmail: u.email,
          userPhone: u.mobile || "",
          planName: u.selectedPlan.planName,
          depositAmount: u.selectedPlan.securityDeposit,
          status: "PENDING",
          cancelledAt: u.selectedPlan.endDate || new Date()
        });
        createdClaims.push(refund);
      }
    }

    const totalRefunds = await Refund.find({}).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      message: `Refund sync completed. Created ${createdClaims.length} new deposit return claims. Total claims in database: ${totalRefunds.length}.`,
      createdClaims,
      totalRefunds
    });
  } catch (error) {
    console.error("Sync Refunds Public API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
