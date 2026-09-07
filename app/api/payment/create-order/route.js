import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { validateCouponServerSide } from "@/lib/couponValidation";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import BrandSettings from "@/models/BrandSettings";
import Order from "@/models/Order";
import DurationDiscount from "@/models/DurationDiscount";
import Plan from "@/models/Plan";
import Razorpay from "razorpay";

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

    const body = await request.json();
    const { orderDetails } = body;

    if (!orderDetails || orderDetails.price === undefined || isNaN(Number(orderDetails.price)) || Number(orderDetails.price) <= 0) {
      return NextResponse.json({ error: "Valid order details and item price are required." }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const {
      bedType,
      price,
      duration,
      couponCode,
      orderType,
      subscriptionType,
      itemTier,
      paymentStyleId,
      securityDeposit
    } = orderDetails;

    // Server-side Duration Discount verification
    let durationDiscountPercent = 0;
    if (duration) {
      const parsedMonths = duration === "1 Month" ? 1 : duration === "3 Months" ? 3 : duration === "6 Months" ? 6 : duration === "12 Months" ? 12 : parseInt(duration) || 1;
      const durationDiscountDoc = await DurationDiscount.findOne({ durationMonths: parsedMonths });
      if (durationDiscountDoc) {
        durationDiscountPercent = durationDiscountDoc.discountPercent;
      }
    }

    let calculatedDiscount = 0;
    if (couponCode) {
      const couponRes = await validateCouponServerSide(couponCode, price, user.accountType);
      if (!couponRes.valid) {
        return NextResponse.json({ error: couponRes.error || "Invalid coupon code." }, { status: 400 });
      }
      calculatedDiscount = couponRes.discount;
    }

    const settings = await BrandSettings.findOne();
    const singleDeposit = settings?.singleBedDeposit ?? 500;
    const doubleDeposit = settings?.doubleBedDeposit ?? 800;

    const isSingleBed = (bedType || "").toLowerCase().includes("single");
    const baseDeposit = securityDeposit !== undefined && !isNaN(Number(securityDeposit))
      ? Number(securityDeposit)
      : (isSingleBed ? singleDeposit : doubleDeposit);

    let depositMultiplier = 1;
    if (paymentStyleId) {
      const matchedStyle = settings?.paymentStyles?.find(s => s.id === paymentStyleId);
      if (matchedStyle) {
        depositMultiplier = matchedStyle.depositMultiplier !== undefined ? matchedStyle.depositMultiplier : 1;
      }
    } else {
      if (itemTier === "PREMIUM") {
        depositMultiplier = 0;
      }
    }

    const alreadyPaidDeposit = !!user.hasPaidDeposit || !!(await Order.exists({
      $or: [{ userId: user._id.toString() }, { email: user.email }],
      depositCharged: { $gt: 0 },
      status: { $ne: "CANCELLED" }
    }));

    const computedDeposit = (orderType === "BUY" || subscriptionType === "weekly" || alreadyPaidDeposit) ? 0 : Math.round(baseDeposit * depositMultiplier);
    const discountedBase = Number(price) - calculatedDiscount;
    const computedGst = Math.round(discountedBase * 0.18);
    const verifiedTotalPrice = discountedBase + computedGst + computedDeposit;

    if (!verifiedTotalPrice || isNaN(verifiedTotalPrice) || verifiedTotalPrice <= 0) {
      return NextResponse.json({ error: "Invalid payable amount calculated on server." }, { status: 400 });
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return NextResponse.json({ error: "Razorpay API keys (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are not configured in environment variables." }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const options = {
      amount: Math.round(Number(verifiedTotalPrice) * 100), // in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${decoded.userId.toString().slice(-6)}`,
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      keyId: key_id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      user: {
        name: user.name,
        email: user.email,
        mobile: user.mobile || "",
      }
    });

  } catch (error) {
    console.error("Create Razorpay Order Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize Razorpay payment order." },
      { status: 500 }
    );
  }
}
