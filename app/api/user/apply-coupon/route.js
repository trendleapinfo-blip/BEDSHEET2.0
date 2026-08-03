import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { validateCouponServerSide } from "@/lib/couponValidation";
import dbConnect from "@/lib/db";
import User from "@/models/User";

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

    const { couponCode, subtotal } = await request.json();

    if (!couponCode || subtotal === undefined) {
      return NextResponse.json({ error: "Coupon code and subtotal are required." }, { status: 400 });
    }

    await dbConnect();

    // Verify user and ensure B2C (Individual User) account type
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const couponRes = await validateCouponServerSide(couponCode, subtotal, user.accountType);

    if (!couponRes.valid) {
      return NextResponse.json({ error: couponRes.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      couponCode: couponRes.coupon.code,
      discountType: couponRes.coupon.discountType,
      discountValue: couponRes.coupon.discountValue,
      discount: couponRes.discount,
    });
  } catch (error) {
    console.error("Apply Coupon API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error occurred while validating coupon." },
      { status: 500 }
    );
  }
}
