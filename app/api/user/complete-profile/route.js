import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import dbConnect from "@/lib/db";
import User from "@/models/User";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const body = await request.json();
    const { name, mobile, accountType, address, city, pincode } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Full name is required." }, { status: 400 });
    }
    if (!mobile || !/^\d{10}$/.test(mobile)) {
      return NextResponse.json({ error: "Please enter a valid 10-digit mobile number." }, { status: 400 });
    }
    if (accountType && !["Individual User", "Commercial Partner"].includes(accountType)) {
      return NextResponse.json({ error: "Invalid account type." }, { status: 400 });
    }

    if (!pincode || !/^\d{6}$/.test(pincode)) {
      return NextResponse.json({ error: "Please enter a valid 6-digit pincode." }, { status: 400 });
    }
    const pinPrefix = pincode.substring(0, 2);
    if (pinPrefix !== "11" && pinPrefix !== "12" && pinPrefix !== "13" && pinPrefix !== "20") {
      return NextResponse.json({ error: "ClosetRush is active in Delhi (11xxxx), Gurugram Sectors (12xxxx/13xxxx), and Noida/Ghaziabad NCR (20xxxx)." }, { status: 400 });
    }

    await dbConnect();

    // Check if mobile is already used by another account
    const existing = await User.findOne({ mobile, _id: { $ne: decoded.userId } });
    if (existing) {
      return NextResponse.json({ error: "This mobile number is already registered with another account." }, { status: 409 });
    }

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { 
        name: name.trim(), 
        mobile,
        accountType: accountType || "Individual User",
        address: address || "",
        city: city || "",
        pincode: pincode || ""
      },
      { new: true, select: "-password" }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: { id: user._id, name: user.name, email: user.email, mobile: user.mobile, role: user.role } });
  } catch (err) {
    console.error("Complete profile error:", err);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
