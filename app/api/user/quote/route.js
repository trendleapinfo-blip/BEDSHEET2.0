import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Quote from "@/models/Quote";

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
      businessName,
      ownerName,
      propertyName,
      contactPerson,
      mobile,
      email,
      gstNumber,
      propertyAddress,
      roomsCount,
      bedsCount,
      bedType,
      bedsheetRequirements,
      businessType,
      propertiesCount,
      unitsCount,
      bundleSelections,
      message,
      estimatedTotal,
    } = await request.json();

    const finalBusinessName = businessName || propertyName || "Unnamed Business";

    await dbConnect();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const newQuote = await Quote.create({
      type: "quotation",
      businessName: finalBusinessName,
      ownerName: ownerName || user.name,
      propertyName: propertyName || finalBusinessName,
      gstNumber: gstNumber || "",
      propertyAddress: propertyAddress || "—",
      roomsCount: Number(roomsCount) || Number(propertiesCount) || 0,
      bedsCount: Number(bedsCount) || Number(unitsCount) || 0,
      bedType: bedType || "Single",
      bedsheetRequirements: bedsheetRequirements || [],
      contactPerson: contactPerson || user.name,
      email: email ? email.toLowerCase() : user.email,
      phone: mobile || user.mobile || "—",
      businessType: businessType || "Hotel/PG/Hostel",
      message: message || "—",
      propertiesCount: Number(propertiesCount) || Number(roomsCount) || 1,
      unitsCount: Number(unitsCount) || Number(bedsCount) || 1,
      bundleSelections: bundleSelections || "No bundles",
      estimatedTotal: Number(estimatedTotal) || 0,
      status: "PENDING",
    });

    return NextResponse.json({
      success: true,
      message: "Quotation request submitted successfully.",
      quote: newQuote,
    });
  } catch (error) {
    console.error("Create Quote API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error occurred while submitting quote request." },
      { status: 500 }
    );
  }
}

export async function GET() {
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

    await dbConnect();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const quotes = await Quote.find({ email: user.email }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      quotes,
    });
  } catch (error) {
    console.error("Get Quotes API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error occurred while fetching quote requests." },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
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

    const { quoteId, status, signatureData, signedBy } = await request.json();
    if (!quoteId || !status) {
      return NextResponse.json({ error: "Quote ID and Status are required" }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const quote = await Quote.findById(quoteId);
    if (!quote) {
      return NextResponse.json({ error: "Quote not found." }, { status: 404 });
    }

    // Allow user to update their own quote
    if (quote.email !== user.email) {
      return NextResponse.json({ error: "You do not have permission to modify this quote." }, { status: 403 });
    }

    // Allowed status transitions for user
    if (!["ACCEPTED", "PAID", "CONFIRMED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status update" }, { status: 400 });
    }

    quote.status = status;
    if (status === "ACCEPTED") {
      quote.signatureData = signatureData || "";
      quote.signedBy = signedBy || user.name;
      quote.signedAt = new Date();
    }

    // Auto-create active corporate order once paid / confirmed
    if (status === "CONFIRMED") {
      const Order = (await import("@/models/Order")).default;
      const codePrefix = quote.bedType.toLowerCase().includes("single") ? "SIN" : "DOU";
      const bundleOrderId = `B${codePrefix}B2B-${Math.floor(10000 + Math.random() * 90000)}`;
      await Order.create({
        bundleOrderId,
        userId: user._id.toString(),
        userName: quote.contactPerson || user.name,
        phone: quote.phone || user.mobile || "—",
        email: quote.email,
        bundleName: `${quote.bedType} Corporate Set (${quote.bedsCount} Beds)`,
        duration: "12 Months",
        finalPrice: quote.priceQuote || (quote.bedsCount * 250),
        status: "ACTIVE",
        orderType: "RENT",
        itemTier: "PREMIUM",
        startDate: new Date(),
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 12)),
        deliveryAddress: quote.propertyAddress || user.address || "—",
      });
    }

    await quote.save();

    return NextResponse.json({
      success: true,
      message: `Quote status updated to ${status} successfully.`,
      quote
    });
  } catch (error) {
    console.error("Update User Quote Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error occurred while updating quote." },
      { status: 500 }
    );
  }
}
