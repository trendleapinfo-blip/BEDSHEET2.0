import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { validateCouponServerSide } from "@/lib/couponValidation";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import PartnerLink from "@/models/PartnerLink";

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

    const normalizedCode = couponCode.trim().toUpperCase();

    // 1. Try standard coupon first
    const couponRes = await validateCouponServerSide(normalizedCode, subtotal, user.accountType);

    if (couponRes.valid) {
      return NextResponse.json({
        success: true,
        couponCode: couponRes.coupon.code,
        discountType: couponRes.coupon.discountType,
        discountValue: couponRes.coupon.discountValue,
        discount: couponRes.discount,
      });
    }

    // 2. If not a standard coupon, check if it's a PG / Partner Referral Code
    const partner = await PartnerLink.findOne({ code: normalizedCode, status: "ACTIVE" });
    if (partner) {
      // Attribute partner link to this user
      await User.findByIdAndUpdate(decoded.userId, {
        referredByCode: partner.code,
        partnerLinkId: partner._id,
      });

      // Add to partner signups if not already added
      const alreadyAdded = partner.signups?.some((s) => s.email === user.email.toLowerCase());
      if (!alreadyAdded) {
        await PartnerLink.findByIdAndUpdate(partner._id, {
          $push: {
            signups: {
              userId: user._id,
              name: user.name || "",
              email: user.email.toLowerCase(),
              signedUpAt: new Date(),
            },
          },
        });
      }

      // Partner Promo Discount (Using configured partner.discountPercent, default 10%)
      const discountPct = Number(partner.discountPercent) || 10;
      const rawDiscount = Math.round(subtotal * (discountPct / 100));
      const discount = Math.min(rawDiscount, 1000); // up to max ₹1000

      const response = NextResponse.json({
        success: true,
        couponCode: partner.code,
        discountType: "percentage",
        discountValue: discountPct,
        discount: discount,
        isPartnerCode: true,
        partnerName: partner.name,
        message: `PG Partner Code Applied! (${partner.name}) - ${discountPct}% OFF`,
      });

      // Set cookie for 30 days
      response.cookies.set("ref_code", partner.code, {
        maxAge: 30 * 24 * 60 * 60,
        path: "/",
        sameSite: "lax",
      });

      return response;
    }

    // Neither coupon nor partner code
    return NextResponse.json({ error: couponRes.error || "Invalid promo code." }, { status: 400 });
  } catch (error) {
    console.error("Apply Coupon API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error occurred while validating promo code." },
      { status: 500 }
    );
  }
}
