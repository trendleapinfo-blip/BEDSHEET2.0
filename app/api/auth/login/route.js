import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function POST(request) {
  try {
    await dbConnect();
    const { email, mobile, password } = await request.json();

    if ((!email && !mobile) || !password) {
      return NextResponse.json(
        { error: "Credentials (email or mobile) and password are required." },
        { status: 400 }
      );
    }

    let user;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
    } else if (mobile) {
      user = await User.findOne({ mobile });
    }

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials. User not found." },
        { status: 400 }
      );
    }

    // Google-only users don't have passwords set
    if (!user.password) {
      return NextResponse.json(
        { error: "This account is registered via Google. Please log in using Google." },
        { status: 400 }
      );
    }

    // Match Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid credentials. Incorrect password." },
        { status: 400 }
      );
    }

    // Generate JWT token
    const token = signToken(
      { userId: user._id, email: user.email },
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // Set Cookie
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
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error occurred during login." },
      { status: 500 }
    );
  }
}
