import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import BrandSettings from "@/models/BrandSettings";
import { sendResumeEmailToUser, sendResumeEmailToAdmin } from "@/lib/mailer";

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

    if (!user.selectedPlan || !user.selectedPlan.planName) {
      return NextResponse.json({ error: "No active plan found to resume." }, { status: 400 });
    }

    // Reset pausing parameters
    user.selectedPlan.isPaused = false;
    user.selectedPlan.pausedAt = undefined;
    user.selectedPlan.pausedUntil = undefined;
    user.selectedPlan.pauseDuration = undefined;
    user.selectedPlan.pauseAction = undefined;

    await user.save();

    // Send emails
    try {
      const settings = await BrandSettings.findOne();
      const adminEmail = settings?.contactEmail || "support@closetrush.com";

      await sendResumeEmailToUser(user.email, {
        userName: user.name,
        planName: user.selectedPlan.planName,
      });

      await sendResumeEmailToAdmin(adminEmail, {
        userName: user.name,
        userEmail: user.email,
        userPhone: user.mobile || "",
        planName: user.selectedPlan.planName,
      });
    } catch (emailErr) {
      console.error("Failed to send resume notification emails:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Subscription plan resumed successfully.",
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
    console.error("Resume Plan API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error occurred while resuming plan." },
      { status: 500 }
    );
  }
}
