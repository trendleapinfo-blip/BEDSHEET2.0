import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Quote from "@/models/Quote";
import { verifyAdmin } from "@/lib/adminAuth";

export async function GET() {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    const quotes = await Quote.find({}).sort({ receivedAt: -1 });
    return NextResponse.json({ quotes });
  } catch (error) {
    console.error("Fetch Quotes Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    const body = await request.json();
    const newQuote = await Quote.create(body);
    return NextResponse.json({ success: true, quote: newQuote });
  } catch (error) {
    console.error("Create Quote Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    const { quoteId, status, priceQuote, finalPrice, durationMonths, vendorEmail } = await request.json();

    if (!quoteId || !status) {
      return NextResponse.json({ error: "Quote ID and Status are required" }, { status: 400 });
    }

    const updateFields = { status };
    if (priceQuote !== undefined) updateFields.priceQuote = Number(priceQuote) || 0;
    if (finalPrice !== undefined) updateFields.finalPrice = Number(finalPrice) || 0;
    if (durationMonths !== undefined) updateFields.durationMonths = Number(durationMonths) || 0;
    if (vendorEmail !== undefined) updateFields.vendorEmail = vendorEmail;
    
    if (["CONFIRMED", "PAID"].includes(status)) {
      const existingQuote = await Quote.findById(quoteId);
      if (!existingQuote) {
        return NextResponse.json({ error: "Quote not found" }, { status: 404 });
      }
      if (!existingQuote.signatureData) {
        return NextResponse.json({ error: "Cannot mark quote as CONFIRMED or PAID: Digital signature is missing from client." }, { status: 400 });
      }
    }

    if (status === "QUOTE SENT") {
        updateFields.agreementSentAt = new Date();
        // Mock sending email
        console.log(`Sending agreement email to ${vendorEmail || 'vendor'} for Quote ID: ${quoteId}`);
    }

    const updated = await Quote.findByIdAndUpdate(quoteId, updateFields, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, quote: updated });
  } catch (error) {
    console.error("Update Quote Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const quoteId = searchParams.get("quoteId");

    if (!quoteId) {
      return NextResponse.json({ error: "Quote ID is required" }, { status: 400 });
    }

    const deleted = await Quote.findByIdAndDelete(quoteId);
    if (!deleted) {
      return NextResponse.json({ error: "Quote not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Quote deleted successfully" });
  } catch (error) {
    console.error("Delete Quote Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
