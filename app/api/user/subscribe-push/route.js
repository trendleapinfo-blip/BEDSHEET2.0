import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import dbConnect from "../../../../lib/db";
import User from "../../../../models/User";

export async function POST(req) {
  try {
    await dbConnect();
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return NextResponse.json({ success: false, error: "Invalid session" }, { status: 401 });
    }

    const subscription = await req.json();

    const user = await User.findById(decoded.id);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Add subscription if it doesn't already exist
    const exists = user.pushSubscriptions.some(
      (sub) => sub.endpoint === subscription.endpoint
    );

    if (!exists) {
      user.pushSubscriptions.push(subscription);
      await user.save();
    }

    return NextResponse.json({ success: true, message: "Subscribed" });
  } catch (error) {
    console.error("Failed to subscribe push:", error);
    return NextResponse.json({ success: false, error: "Subscription failed" }, { status: 500 });
  }
}
