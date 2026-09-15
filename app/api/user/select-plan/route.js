import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import Coupon from "@/models/Coupon";
import BrandSettings from "@/models/BrandSettings";
import Bundle from "@/models/Bundle";
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
      status,
      paymentStyleId
    } = await request.json();

    if (!bedType || !planName || price === undefined || !duration) {
      return NextResponse.json(
        { error: "Missing plan configuration details (bedType, planName, price, duration)." },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Server-side validation of Coupon
    let calculatedDiscount = 0;
    let coupon = null;
    if (couponCode) {
      if (user.accountType !== "Individual User") {
        return NextResponse.json(
          { error: "Coupons are only available for B2C Individual Users." },
          { status: 400 }
        );
      }

      const uppercaseCode = couponCode.trim().toUpperCase();
      coupon = await Coupon.findOne({ code: uppercaseCode });
      if (!coupon) {
        return NextResponse.json({ error: "Invalid coupon code." }, { status: 400 });
      }
      if (!coupon.isActive) {
        return NextResponse.json({ error: "This coupon is no longer active." }, { status: 400 });
      }
      const now = new Date();
      if (coupon.startDate && now < new Date(coupon.startDate)) {
        return NextResponse.json({ error: "This coupon is not active yet." }, { status: 400 });
      }
      if (coupon.endDate && now > new Date(coupon.endDate)) {
        return NextResponse.json({ error: "This coupon has expired." }, { status: 400 });
      }
      if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        return NextResponse.json({ error: "This coupon usage limit has been reached." }, { status: 400 });
      }
      if (Number(price) < coupon.minPurchase) {
        return NextResponse.json({ error: `Minimum order value of ₹${coupon.minPurchase} required.` }, { status: 400 });
      }

      if (coupon.discountType === "percentage") {
        calculatedDiscount = Math.round(Number(price) * (coupon.discountValue / 100));
        if (coupon.maxDiscount !== null && calculatedDiscount > coupon.maxDiscount) {
          calculatedDiscount = coupon.maxDiscount;
        }
      } else if (coupon.discountType === "flat") {
        calculatedDiscount = coupon.discountValue;
      }
      if (calculatedDiscount > Number(price)) {
        calculatedDiscount = Math.round(Number(price));
      }
    }

    // Fetch Brand Settings to check dynamic security deposits and payment style multipliers
    const settings = await BrandSettings.findOne();
    const singleDeposit = settings?.singleBedDeposit ?? 500;
    const doubleDeposit = settings?.doubleBedDeposit ?? 800;
    
    const isSingleBed = (bedType || "").toLowerCase().includes("single");
    const baseDeposit = isSingleBed ? singleDeposit : doubleDeposit;

    let depositMultiplier = 1;
    if (paymentStyleId) {
      const matchedStyle = settings?.paymentStyles?.find(s => s.id === paymentStyleId);
      if (matchedStyle) {
        depositMultiplier = matchedStyle.depositMultiplier !== undefined ? matchedStyle.depositMultiplier : 1;
      }
    } else {
      // Fallback: If itemTier is PREMIUM, deposit multiplier is 0 (Advance Plan)
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

    const discountedBase = Number(price) - calculatedDiscount;
    const computedGst = Math.round(discountedBase - (discountedBase / 1.18));
    const computedDeposit = (orderType === "BUY" || subscriptionType === "weekly" || alreadyPaidDeposit) ? 0 : Math.round(baseDeposit * depositMultiplier);
    const computedTotalPrice = discountedBase + computedDeposit;

    // Calculate End Date based on duration
    let endDate = new Date();
    if (orderType === "BUY") {
      endDate = null;
    } else {
      if (duration === "1 Month") {
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (duration === "3 Months") {
        endDate.setMonth(endDate.getMonth() + 3);
      } else if (duration === "6 Months") {
        endDate.setMonth(endDate.getMonth() + 6);
      } else if (duration === "12 Months") {
        endDate.setMonth(endDate.getMonth() + 12);
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


    // Generate dynamic bundleOrderId
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
      calculatedRent: Number(price), // Passed from checkout
      depositCharged: computedDeposit,
      totalAmount: computedTotalPrice,
      finalPrice: computedTotalPrice,
      couponCode: coupon ? coupon.code : null,
      discount: calculatedDiscount,
      status: status || "ACTIVE",
      orderType: orderType || "RENT",
      itemTier: itemTier || "BASIC",
      orderCategory: "B2C",
      frequency: subscriptionType === "weekly" ? "WEEKLY_SWAP" : "MONTHLY_SWAP",
      startDate: new Date(),
      endDate,
      deliveryAddress: updatedUser.address || "—",
    });

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

    if (coupon) {
      await Coupon.findByIdAndUpdate(coupon._id, { $inc: { usedCount: 1 } });
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
      message: "Plan selected successfully and order created",
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
    console.error("Select Plan API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error occurred while selecting plan." },
      { status: 500 }
    );
  }
}
