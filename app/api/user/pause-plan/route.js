import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import BrandSettings from "@/models/BrandSettings";
import { sendPauseEmailToUser, sendPauseEmailToAdmin } from "@/lib/mailer";

export async function POST(request) {
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

    const { duration, action } = await request.json();
    if (!duration || !action) {
      return NextResponse.json({ error: "Pause duration and linen preference action are required." }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (!user.selectedPlan || !user.selectedPlan.planName) {
      return NextResponse.json({ error: "No active plan found to pause." }, { status: 400 });
    }

    // Calculate resume date based on duration
    let daysToPause = 7; // default 1 week
    if (duration === "2 weeks") daysToPause = 14;
    else if (duration === "1 month") daysToPause = 30;
    else if (duration === "2 months") daysToPause = 60;
    else if (duration === "3 months") daysToPause = 90;

    const resumeDate = new Date();
    resumeDate.setDate(resumeDate.getDate() + daysToPause);

    // Update user plan status to paused
    user.selectedPlan.isPaused = true;
    user.selectedPlan.pausedAt = new Date();
    user.selectedPlan.pausedUntil = resumeDate;
    user.selectedPlan.pauseDuration = duration;
    user.selectedPlan.pauseAction = action;

    await user.save();

    // Send emails
    try {
      const settings = await BrandSettings.findOne();
      const adminEmail = settings?.contactEmail || "support@closetrush.com";

      await sendPauseEmailToUser(user.email, {
        userName: user.name,
        planName: user.selectedPlan.planName,
        duration,
        resumeDate,
        pauseAction: action
      });

      await sendPauseEmailToAdmin(adminEmail, {
        userName: user.name,
        userEmail: user.email,
        userPhone: user.mobile || "",
        planName: user.selectedPlan.planName,
        duration,
        resumeDate,
        pauseAction: action
      });
    } catch (emailErr) {
      console.error("Failed to send pausing notification emails:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Subscription plan paused successfully.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        address: user.address,
        accountType: user.accountType,
        selectedPlan: user.selectedPlan,
      }
    });
  } catch (error) {
    console.error("Pause Plan API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error occurred while pausing plan." },
      { status: 500 }
    );
  }
}
