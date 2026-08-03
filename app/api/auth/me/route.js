import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return NextResponse.json({ authenticated: false, error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return NextResponse.json({ authenticated: false, error: "User not found" }, { status: 404 });
    }

    // Check if user has already paid a deposit previously
    let hasPaidDeposit = !!user.hasPaidDeposit;
    if (!hasPaidDeposit) {
      const pastDepositOrder = await Order.findOne({
        $or: [{ userId: user._id.toString() }, { email: user.email }],
        depositCharged: { $gt: 0 },
        status: { $ne: "CANCELLED" }
      });
      if (pastDepositOrder) {
        hasPaidDeposit = true;
        user.hasPaidDeposit = true;
        await user.save();
      }
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        address: user.address,
        accountType: user.accountType,
        role: user.role || "user",
        status: user.status || "ACTIVE",
        hasPaidDeposit: hasPaidDeposit,
        selectedPlan: user.selectedPlan || null,
      },
    });
  } catch (error) {
    console.error("Session fetcher error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
