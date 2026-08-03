import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Refund from "@/models/Refund";
import Order from "@/models/Order";
import User from "@/models/User";
import Bundle from "@/models/Bundle";
import { verifyAdmin } from "@/lib/adminAuth";

export async function GET() {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    await dbConnect();

    // ─── AUTO-SYNC EXPIRED/CANCELLED PLAN DEPOSIT REFUNDS ─────────
    try {
      const now = new Date();

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

          await Refund.create({
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
          await Refund.create({
            userId: u._id.toString(),
            userName: u.name,
            userEmail: u.email,
            userPhone: u.mobile || "",
            planName: u.selectedPlan.planName,
            depositAmount: u.selectedPlan.securityDeposit,
            status: "PENDING",
            cancelledAt: u.selectedPlan.endDate || new Date()
          });
        }
      }
    } catch (syncErr) {
      console.error("Auto-sync refunds warning:", syncErr);
    }

    const refunds = await Refund.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, refunds });
  } catch (error) {
    console.error("Fetch Admin Refunds Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    const { id, status, transactionId } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: "ID and Status are required." }, { status: 400 });
    }

    const updateData = { status };
    if (status === "REFUNDED") {
      updateData.refundedAt = new Date();
      if (transactionId) {
        updateData.transactionId = transactionId;
      }
    }

    const updated = await Refund.findByIdAndUpdate(id, updateData, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "Refund claim not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, refund: updated });
  } catch (error) {
    console.error("Update Admin Refund Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Refund claim ID is required." }, { status: 400 });
    }

    const deleted = await Refund.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Refund claim not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Refund claim deleted successfully." });
  } catch (error) {
    console.error("Delete Admin Refund Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
