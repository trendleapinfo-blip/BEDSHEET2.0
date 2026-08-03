import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { signToken } from "@/lib/jwt";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Otp from "@/models/Otp";
import { sendOtpEmail } from "@/lib/mailer";

export async function POST(request) {
  try {
    await dbConnect();
    const { name, email, mobile, password, address, accountType, otpCode } = await request.json();

    // Basic Validations
    if (!name || !email || !password || !mobile) {
      return NextResponse.json(
        { error: "Name, email, password, and mobile number are required fields." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(mobile)) {
      return NextResponse.json(
        { error: "Please enter a valid 10-digit mobile number." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return NextResponse.json(
        { error: "A user with this email address already exists." },
        { status: 400 }
      );
    }

    // Check if mobile already exists
    const existingMobile = await User.findOne({ mobile });
    if (existingMobile) {
      return NextResponse.json(
        { error: "A user with this mobile number already exists." },
        { status: 400 }
      );
    }

    // OTP VERIFICATION STEP
    if (!otpCode) {
      // Generate 6-digit random code
      const code = Math.floor(100000 + Math.random() * 900000).toString();

      // Save/update OTP in database
      await Otp.findOneAndUpdate(
        { emailOrMobile: email.toLowerCase(), purpose: "signup" },
        { code, createdAt: new Date() },
        { upsert: true, new: true }
      );

      // Dispatch email to user inbox
      try {
        await sendOtpEmail(email.toLowerCase(), code, "signup");
        console.log(`[OTP SIGNUP SERVICE] Dispatched email to ${email.toLowerCase()}`);
      } catch (mailErr) {
        console.error("[OTP SIGNUP SERVICE] Mail dispatch error:", mailErr.message);
      }

      // Print to console for development testing
      console.log("\n========================================");
      console.log(`[OTP SIGNUP SERVICE] Send To: ${email.toLowerCase()}`);
      console.log(`[OTP SIGNUP SERVICE] Verification Code: ${code}`);
      console.log("========================================\n");

      return NextResponse.json(
        {
          verificationRequired: true,
          message: "Verification code sent to email."
        },
        { status: 200 }
      );
    }

    // If otpCode is provided, verify it first
    const otpRecord = await Otp.findOne({
      emailOrMobile: email.toLowerCase(),
      code: otpCode.trim(),
      purpose: "signup",
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Invalid or expired verification code." },
        { status: 400 }
      );
    }

    // Delete verified OTP record
    await Otp.deleteOne({ _id: otpRecord._id });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the User
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      mobile: mobile || undefined,
      password: hashedPassword,
      address: address || "",
      accountType: accountType || "Individual User",
    });

    // Generate JWT token
    const token = signToken(
      { userId: newUser._id, email: newUser.email },
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

    // Return user info (except password)
    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          mobile: newUser.mobile,
          address: newUser.address,
          accountType: newUser.accountType,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error occurred during sign up." },
      { status: 500 }
    );
  }
}
