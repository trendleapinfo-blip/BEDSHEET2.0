import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { signToken } from "@/lib/jwt";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Otp from "@/models/Otp";

export async function POST(request) {
  try {
    await dbConnect();
    const { email, mobile, emailOrMobile, code } = await request.json();

    let target = emailOrMobile || email || mobile;
    if (!target || !code) {
      return NextResponse.json(
        { error: "Credentials and verification code are required." },
        { status: 400 }
      );
    }
    target = target.trim().toLowerCase();

    // Verify OTP code in the database
    const otpRecord = await Otp.findOne({
      emailOrMobile: target,
      code: code.trim(),
      purpose: "login",
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    // Find the corresponding user
    let query = {};
    if (target.includes("@")) {
      query = { email: target };
    } else {
      query = { mobile: target };
    }

    const user = await User.findOne(query);
    if (!user) {
      return NextResponse.json(
        { error: "User account no longer exists." },
        { status: 404 }
      );
    }

    // Delete verified OTP record
    await Otp.deleteOne({ _id: otpRecord._id });

    // Generate JWT token
    const token = signToken(
      { userId: user._id, email: user.email },
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // Set HTTP-Only Cookie
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
      path: "/",
    });

    return NextResponse.json(
      {
        message: "Logged in successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
          address: user.address,
          accountType: user.accountType,
          role: user.role || "user",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("OTP Verify Login Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error occurred during OTP verification." },
      { status: 500 }
    );
  }
}
