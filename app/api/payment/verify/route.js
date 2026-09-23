import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import { validateCouponServerSide } from "@/lib/couponValidation";
import crypto from "crypto";
import Razorpay from "razorpay";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import Coupon from "@/models/Coupon";
import BrandSettings from "@/models/BrandSettings";
import Bundle from "@/models/Bundle";
import DurationDiscount from "@/models/DurationDiscount";
import PartnerLink from "@/models/PartnerLink";
import { sendOrderConfirmationEmail } from "@/lib/mailer";

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
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderDetails) {
      return NextResponse.json({ error: "Missing verification parameters." }, { status: 400 });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_secret) {
      return NextResponse.json({ error: "Razorpay key secret configuration is missing on the server." }, { status: 500 });
    }

    // Verify payment signature
    const hmac = crypto.createHmac("sha256", key_secret);
    hmac.update(razorpay_order_id + "|" + razorpay_payment_id);
    const generated_signature = hmac.digest("hex");

    if (generated_signature !== razorpay_signature) {
      return NextResponse.json({ error: "Payment verification failed: Signature mismatch." }, { status: 400 });
    }

    // Signature verified! Save the order to Database
    const {
      bedType,
      planName,
      price,
      duration,
      subscriptionType,
      securityDeposit,
      gst,
      totalPrice,
      address,
      mobile,
      color,
      fabric,
      print,
      isCustom,
      couponCode,
      discount,
      orderType,
      itemTier,
      paymentStyleId
    } = orderDetails;

    await dbConnect();

    // Fetch user
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Server-side Duration Discount verification
    let durationDiscountPercent = 0;
    if (duration) {
      const parsedMonths = duration === "1 Month" ? 1 : duration === "3 Months" ? 3 : duration === "6 Months" ? 6 : duration === "12 Months" ? 12 : parseInt(duration) || 1;
      const durationDiscountDoc = await DurationDiscount.findOne({ durationMonths: parsedMonths });
      if (durationDiscountDoc) {
        durationDiscountPercent = durationDiscountDoc.discountPercent;
      }
    }

    // Server-side validation of Coupon
    let calculatedDiscount = 0;
    let coupon = null;
    if (couponCode) {
      const couponRes = await validateCouponServerSide(couponCode, price, user.accountType);
      if (!couponRes.valid) {
        return NextResponse.json({ error: couponRes.error || "Invalid coupon code." }, { status: 400 });
      }
      calculatedDiscount = couponRes.discount;
      coupon = couponRes.coupon;
    }

    // Fetch Brand Settings to check dynamic security deposits and payment style multipliers
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

    // Check if user has already paid a deposit previously
    const alreadyPaidDeposit = !!user.hasPaidDeposit || !!(await Order.exists({
      $or: [{ userId: user._id.toString() }, { email: user.email }],
      depositCharged: { $gt: 0 },
      status: { $ne: "CANCELLED" }
    }));

    const computedDeposit = (orderType === "BUY" || subscriptionType === "weekly" || alreadyPaidDeposit) ? 0 : Math.round(baseDeposit * depositMultiplier);
    const discountedBase = Number(price) - calculatedDiscount;
    const computedGst = Number((discountedBase - (discountedBase / 1.18)).toFixed(2));
    const computedTotalPrice = discountedBase + computedDeposit;

    // Fetch Razorpay Order and Payment details directly from Razorpay API to prevent amount tampering
    const key_id = process.env.RAZORPAY_KEY_ID;
    if (!key_id) {
      return NextResponse.json({ error: "Razorpay Key ID configuration is missing on the server." }, { status: 500 });
    }
    const razorpay = new Razorpay({ key_id, key_secret });

    let rzpOrder = null;
    let rzpPayment = null;
    try {
      rzpOrder = await razorpay.orders.fetch(razorpay_order_id);
      rzpPayment = await razorpay.payments.fetch(razorpay_payment_id);
    } catch (rzpFetchErr) {
      console.error("Razorpay API fetch error:", rzpFetchErr);
      return NextResponse.json({ error: "Failed to verify transaction details with Razorpay servers." }, { status: 400 });
    }

    const expectedAmountInPaise = Math.round(computedTotalPrice * 100);

    // Verify exact payment amount matches required computed total
    if (!rzpOrder || Math.abs(rzpOrder.amount - expectedAmountInPaise) > 100) {
      return NextResponse.json({
        error: `Payment amount mismatch: Billed amount is ₹${computedTotalPrice}, but Razorpay order was created for ₹${(rzpOrder?.amount || 0) / 100}. Transaction rejected.`
      }, { status: 400 });
    }

    if (!rzpPayment || Math.abs(rzpPayment.amount - expectedAmountInPaise) > 100) {
      return NextResponse.json({
        error: `Payment amount mismatch: Billed amount is ₹${computedTotalPrice}, but actual paid amount on Razorpay was ₹${(rzpPayment?.amount || 0) / 100}. Transaction rejected.`
      }, { status: 400 });
    }

    if (rzpPayment.status !== "captured" && rzpPayment.status !== "authorized") {
      return NextResponse.json({
        error: `Payment verification failed: Razorpay payment status is '${rzpPayment?.status}'.`
      }, { status: 400 });
    }

    // Calculate End Date
    let endDate = new Date();
    if (orderType === "BUY") {
      endDate = null;
    } else {
      const durLower = (duration || "").toLowerCase();
      if (durLower.includes("3 month") || durLower.includes("quarterly")) {
        endDate.setMonth(endDate.getMonth() + 3);
      } else if (durLower.includes("6 month")) {
        endDate.setMonth(endDate.getMonth() + 6);
      } else if (durLower.includes("9 month")) {
        endDate.setMonth(endDate.getMonth() + 9);
      } else if (durLower.includes("12 month") || durLower.includes("yearly") || durLower.includes("annual")) {
        endDate.setFullYear(endDate.getFullYear() + 1);
      } else {
        endDate.setMonth(endDate.getMonth() + 1);
      }
    }

    const updateFields = {
      hasPaidDeposit: alreadyPaidDeposit || computedDeposit > 0,
      selectedPlan: {
        bedType,
        planName,
        price: Number(price),
        duration,
        subscriptionType: subscriptionType || "monthly",
        securityDeposit: computedDeposit,
        gst: computedGst,
        totalPrice: computedTotalPrice,
        startDate: new Date(),
        endDate,
        isCustom: !!isCustom,
        color,
        fabric,
        print,
        couponCode: coupon ? coupon.code : null,
        discount: calculatedDiscount,
        orderType: orderType || "RENT",
        itemTier: itemTier || "BASIC"
      }
    };

    if (address) {
      updateFields.address = address;
    }
    if (mobile) {
      updateFields.mobile = mobile;
    }

    const updatedUser = await User.findByIdAndUpdate(
      decoded.userId,
      updateFields,
      { new: true }
    ).select("-password");

    // Cancel existing active/pending orders for this user
    await Order.updateMany(
      {
        userId: decoded.userId,
        status: { $in: ["ACTIVE", "PENDING"] },
      },
      { $set: { status: "CANCELLED", endDate: new Date() } }
    );


    // Generate bundleOrderId
    const codePrefix = isSingleBed ? "SIN" : "DOU";
    let bundleOrderId = "";
    let bundleName = "";

    if (orderType === "BUY") {
      bundleOrderId = `B${codePrefix}PUR-${Math.floor(10000 + Math.random() * 90000)}`;
      bundleName = `${bedType} Sheets (${itemTier === "PREMIUM" ? "Premium Set" : "Basic Set"})`;
    } else {
      const subPrefix = (subscriptionType || "monthly") === "weekly" ? "WK" : "MO";
      bundleOrderId = `B${codePrefix}BUN-${subPrefix}-${Math.floor(10000 + Math.random() * 90000)}`;
      bundleName = `${bedType} ${
        subscriptionType === "weekly" ? "Weekly Change Service" : "Bundle"
      }`;
    }

    if (color || fabric || print) {
      const customizations = [color, fabric, print].filter(Boolean).join(", ");
      bundleName += ` Custom (${customizations})`;
    }

    // Check for referral code on user or cookies
    const cookieRef = (cookieStore.get("closerush_ref_code")?.value || "").trim().toUpperCase();
    let orderPartnerLinkId = updatedUser.partnerLinkId || null;
    let orderReferredByCode = updatedUser.referredByCode || (cookieRef || null);

    if (!orderPartnerLinkId && orderReferredByCode) {
      const partnerDoc = await PartnerLink.findOne({ code: orderReferredByCode, status: "ACTIVE" });
      if (partnerDoc) {
        orderPartnerLinkId = partnerDoc._id;
      }
    }

    // Create a new Order in Database
    const newOrder = await Order.create({
      bundleOrderId,
      userId: updatedUser._id.toString(),
      userName: updatedUser.name,
      phone: updatedUser.mobile || "—",
      email: updatedUser.email,
      bundleName,
      duration,
      durationMonths: duration === "1 Month" ? 1 : duration === "3 Months" ? 3 : duration === "6 Months" ? 6 : duration === "9 Months" ? 9 : 12,
      calculatedRent: Number(price),
      depositCharged: computedDeposit,
      gst: computedGst,
      totalAmount: computedTotalPrice,
      finalPrice: computedTotalPrice,
      couponCode: coupon ? coupon.code : null,
      discount: calculatedDiscount,
      status: "ACTIVE", // Verified and paid
      orderType: orderType || "RENT",
      itemTier: itemTier || "BASIC",
      orderCategory: "B2C",
      frequency: subscriptionType === "weekly" ? "WEEKLY_SWAP" : "MONTHLY_SWAP",
      startDate: new Date(),
      endDate,
      deliveryAddress: updatedUser.address || "—",
      razorpayPaymentId: razorpay_payment_id,
      referredByCode: orderReferredByCode || undefined,
      partnerLinkId: orderPartnerLinkId || undefined,
    });

    // Record order in PartnerLink if attributed
    if (orderPartnerLinkId) {
      try {
        await PartnerLink.findByIdAndUpdate(orderPartnerLinkId, {
          $inc: { totalRevenue: computedTotalPrice },
          $push: {
            orders: {
              orderId: bundleOrderId,
              userId: updatedUser._id.toString(),
              userEmail: updatedUser.email,
              bundleName,
              amount: computedTotalPrice,
              orderType: orderType || "RENT",
              status: "ACTIVE",
              orderedAt: new Date(),
            },
          },
        });
      } catch (pErr) {
        console.error("[PARTNER ORDER RECORD ERROR]:", pErr);
      }
    }

    if (coupon) {
      await Coupon.findByIdAndUpdate(coupon._id, {
        $inc: { usedCount: 1 },
        $addToSet: { usedBy: user._id }
      });
    }

    // Auto-create matching Bundle for logistics and warehouse tracking
    try {
      await Bundle.create({
        bundleId: newOrder.bundleOrderId,
        orderId: newOrder._id.toString(),
        customerName: updatedUser.name,
        bedType: isSingleBed ? "Single" : "Double",
        color: color || "Classic White",
        status: "READY_TO_DISPATCH",
        items: [
          { sku: `SHT-${Date.now().toString().slice(-4)}`, itemType: "Bedsheet", laundryStatus: "CLEAN_STOCK" },
          { sku: `PIL-${Date.now().toString().slice(-4)}`, itemType: "Pillow Cover", laundryStatus: "CLEAN_STOCK" }
        ],
        logisticsHistory: [
          {
            timestamp: new Date(),
            action: "Subscription Activated — Package Ready for Logistics Dispatch",
            operator: "Automated Dispatch System"
          }
        ]
      });
    } catch (bErr) {
      console.error("Bundle auto-creation error:", bErr);
    }

    // Send beautiful email confirmation to the user
    try {
      await sendOrderConfirmationEmail(updatedUser.email, {
        userName: updatedUser.name,
        bundleOrderId: newOrder.bundleOrderId,
        bundleName: newOrder.bundleName,
        orderType: newOrder.orderType,
        subscriptionType: newOrder.frequency === "WEEKLY_SWAP" ? "weekly" : "monthly",
        price: newOrder.calculatedRent,
        securityDeposit: newOrder.depositCharged,
        gst: computedGst,
        discount: newOrder.discount,
        totalPrice: newOrder.finalPrice,
        deliveryAddress: newOrder.deliveryAddress,
        startDate: newOrder.startDate,
        duration: newOrder.duration,
      });
    } catch (emailErr) {
      console.error("Order Confirmation Email failed to send:", emailErr);
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified and order created successfully.",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobile: updatedUser.mobile,
        address: updatedUser.address,
        accountType: updatedUser.accountType,
        selectedPlan: updatedUser.selectedPlan,
      },
    });

  } catch (error) {
    console.error("Payment Verification API Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error occurred during payment verification." },
      { status: 500 }
    );
  }
}
