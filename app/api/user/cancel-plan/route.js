import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import Refund from "@/models/Refund";
import BrandSettings from "@/models/BrandSettings";
import { sendCancellationEmailToUser, sendCancellationEmailToAdmin } from "@/lib/mailer";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return NextResponse.json({ error: "Invalid session token." }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const activePlan = user.selectedPlan;
    if (!activePlan || !activePlan.planName) {
      return NextResponse.json({ error: "No active plan to cancel." }, { status: 400 });
    }

    const refundAmount = activePlan.securityDeposit || 0;
    const planName = activePlan.planName;

    // Create a Refund request entry
    const refundRecord = await Refund.create({
      userId: user._id.toString(),
      userName: user.name,
      userEmail: user.email,
      userPhone: user.mobile || "",
      planName: planName,
      depositAmount: refundAmount,
      status: "PENDING",
    });

    // Cancel current subscription plan in User model
    user.selectedPlan = undefined;
    await user.save();

    // Cancel active orders for this user in Order model
    await Order.updateMany(
      {
        $or: [{ email: user.email }, { userId: user._id.toString() }],
        status: { $in: ["ACTIVE", "PENDING"] },
      },
      { $set: { status: "CANCELLED", endDate: new Date() } }
    );

    // Send emails
    try {
      const settings = await BrandSettings.findOne();
      const adminEmail = settings?.contactEmail || "support@closetrush.com";

      // Email to user
      await sendCancellationEmailToUser(user.email, {
        userName: user.name,
        planName,
        refundAmount,
      });

      // Email to admin
      await sendCancellationEmailToAdmin(adminEmail, {
        userName: user.name,
        userEmail: user.email,
        userPhone: user.mobile || "",
        planName,
        refundAmount,
      });
    } catch (emailErr) {
      console.error("Failed to send cancellation emails:", emailErr);
      // Don't fail the cancellation request if only email dispatch fails
    }

    return NextResponse.json({
      success: true,
      message: "Subscription plan cancelled successfully, refund request logged, and active orders updated.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        address: user.address,
        accountType: user.accountType,
        selectedPlan: null,
      },
    });
  } catch (error) {
    console.error("Cancel Plan API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error occurred while cancelling plan." },
      { status: 500 }
    );
  }
}
