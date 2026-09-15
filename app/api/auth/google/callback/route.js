import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { signToken } from "@/lib/jwt";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
      console.error("Google OAuth returned error:", error);
      return NextResponse.redirect(new URL("/login?error=oauth_denied", request.url));
    }

    if (!code) {
      return NextResponse.redirect(new URL("/login?error=no_code", request.url));
    }

    const client_id = process.env.GOOGLE_CLIENT_ID;
    const client_secret = process.env.GOOGLE_CLIENT_SECRET;
    const redirect_uri = process.env.GOOGLE_CALLBACK_URL;

    // Exchange code for token
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id,
        client_secret,
        redirect_uri,
        grant_type: "authorization_code",
      }).toString(),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("Token exchange failed:", tokenData);
      return NextResponse.redirect(new URL("/login?error=token_exchange_failed", request.url));
    }

    const { access_token } = tokenData;

    // Fetch user info from Google API
    const userinfoResponse = await fetch(
      `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`
    );
    const profile = await userinfoResponse.json();

    if (!profile.email) {
      return NextResponse.redirect(new URL("/login?error=email_not_provided", request.url));
    }

    await dbConnect();

    let isNewUser = false;

    // 1. Find user by googleId
    let user = await User.findOne({ googleId: profile.id });

    if (!user) {
      // 2. If not found by googleId, check by email
      user = await User.findOne({ email: profile.email.toLowerCase() });

      if (user) {
        // Link googleId to existing account
        user.googleId = profile.id;
        // Prefill name from Google if missing
        if (!user.name && profile.name) user.name = profile.name;
        await user.save();
      } else {
        // 3. Register a brand new user — profile incomplete (no mobile)
        isNewUser = true;
        user = await User.create({
          name: profile.name || "",
          email: profile.email.toLowerCase(),
          googleId: profile.id,
          accountType: "Individual User",
          address: "",
        });
      }
    }

    // Generate JWT token
    const token = signToken(
      { userId: user._id, email: user.email },
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    // Redirect to onboarding if new or missing mobile, else to shop
    const redirectUrl = new URL(
      isNewUser || !user.mobile ? "/onboarding" : "/shop",
      request.url
    );
    const response = NextResponse.redirect(redirectUrl);

    // Set Cookie directly on the response to ensure it persists across Next.js redirects
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err) {
    console.error("Google OAuth Callback Error:", err);
    return NextResponse.redirect(new URL("/login?error=callback_internal_error", request.url));
  }
}
