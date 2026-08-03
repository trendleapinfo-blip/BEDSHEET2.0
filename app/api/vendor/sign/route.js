import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Quote from "@/models/Quote";
import Order from "@/models/Order";
import Bundle from "@/models/Bundle";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized. Session token missing." }, { status: 401 });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return NextResponse.json({ error: "Invalid or expired session token." }, { status: 401 });
    }

    await dbConnect();
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const { quoteId, signatureData } = await request.json();

    if (!quoteId || !signatureData) {
      return NextResponse.json({ error: "Quote ID and signature data are required" }, { status: 400 });
    }

    const quote = await Quote.findById(quoteId);
    if (!quote) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    if (quote.email !== user.email && user.role !== "admin") {
      return NextResponse.json({ error: "Forbidden. You are not authorized to sign this quote." }, { status: 403 });
    }

    if (quote.status === "CONFIRMED") {
      return NextResponse.json({ error: "Quote is already signed and confirmed" }, { status: 400 });
    }

    // Update Quote
    quote.status = "CONFIRMED";
    quote.signatureData = signatureData;
    quote.signedAt = new Date();
    quote.signedBy = quote.contactPerson;
    await quote.save();

    // Generate Order
    const orderId = `ORD-B2B-${Date.now().toString().slice(-6)}`;
    const newOrder = await Order.create({
      bundleOrderId: orderId,
      userId: quote.email, // using email as identifier for now
      userName: quote.businessName,
      phone: quote.phone,
      email: quote.email,
      bundleName: `B2B Bundle - ${quote.businessName}`,
      duration: `${quote.durationMonths || 1} Months`,
      finalPrice: quote.finalPrice || quote.priceQuote,
      status: "ACTIVE",
      orderCategory: "B2B",
      frequency: "WEEKLY_SWAP", // Assuming B2B prefers weekly swaps, this could be customized
      agreementSignedAt: new Date(),
      agreementSignedBy: quote.contactPerson,
      deliveryAddress: quote.propertyAddress
    });

    // Create Initial Bundle
    const bundleId = `BUN-${Date.now().toString().slice(-6)}`;
    await Bundle.create({
      bundleId: bundleId,
      orderId: newOrder.bundleOrderId,
      customerName: newOrder.userName,
      bedType: quote.bedType || "Mixed",
      color: "Assorted",
      status: "CREATED",
      items: [], // Would be populated by warehouse
      logisticsHistory: [{ action: "Bundle Created from Signed Quote" }]
    });

    return NextResponse.json({ success: true, message: "Agreement signed successfully", orderId: newOrder.bundleOrderId });
  } catch (error) {
    console.error("Sign Agreement Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
