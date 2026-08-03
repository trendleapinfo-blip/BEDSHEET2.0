import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Otp from "@/models/Otp";
import { sendOtpEmail } from "@/lib/mailer";

export async function POST(request) {
  try {
    await dbConnect();
    const { email, mobile, emailOrMobile, purpose } = await request.json();

    // Determine target
    let target = emailOrMobile || email || mobile;
    if (!target) {
      return NextResponse.json(
        { error: "Email or mobile number is required." },
        { status: 400 }
      );
    }
    target = target.trim().toLowerCase();

    if (!purpose || !["login", "signup", "reset_password"].includes(purpose)) {
      return NextResponse.json(
        { error: "A valid purpose (login, signup, or reset_password) is required." },
        { status: 400 }
      );
    }

    // Check user existence
    const isEmail = target.includes("@");
    const query = isEmail ? { email: target } : { mobile: target };
    const existingUser = await User.findOne(query);

    if (purpose === "signup" && existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 400 }
      );
    }

    if ((purpose === "login" || purpose === "reset_password") && !existingUser) {
      return NextResponse.json(
        { error: "No account found with this email." },
        { status: 400 }
      );
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    // Save/update OTP in DB (TTL = 5 min via Otp model)
    await Otp.findOneAndUpdate(
      { emailOrMobile: target, purpose },
      { code, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Always log for dev visibility
    console.log("\n========================================");
    console.log(`[OTP] Purpose : ${purpose.toUpperCase()}`);
    console.log(`[OTP] Target  : ${target}`);
    console.log(`[OTP] Code    : ${code}`);
    console.log("========================================\n");

    // Send email if target is an email address
    let emailSent = false;
    if (isEmail) {
      try {
        await sendOtpEmail(target, code, purpose);
        emailSent = true;
        console.log(`[OTP] Email dispatched to ${target}`);
      } catch (mailErr) {
        // Log but don't crash — still return success so dev can use console OTP
        console.error("[OTP] Email send failed:", mailErr.message);
      }
    }

    return NextResponse.json(
      {
        message: "Verification code sent successfully.",
        emailSent,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Send OTP Error:", error);
    return NextResponse.json(
      { error: "Internal server error while sending verification code." },
      { status: 500 }
    );
  }
}
