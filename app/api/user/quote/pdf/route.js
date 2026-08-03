import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import dbConnect from "@/lib/db";
import Quote from "@/models/Quote";
import Order from "@/models/Order";
import User from "@/models/User";

// ─── Utility helpers ────────────────────────────────────────
function esc(str) {
  // Escape special PDF text chars
  return String(str || "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)")
    .replace(/[^\x20-\x7E]/g, ""); // strip non-ASCII for safety
}

function fmtCurrency(n) {
  return Number(n || 0).toLocaleString("en-IN");
}

function fmtDate(d) {
  if (!d) return "—";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Professional PDF Builder ───────────────────────────────
// All coordinates: origin bottom-left, A4 = 595.28 x 841.89 pt
function buildInvoicePDF({
  docTitle,        // e.g. "SUBSCRIPTION INVOICE"
  invoiceNo,       // order/quote ID
  invoiceDate,
  customerName,
  customerPhone,
  customerEmail,
  customerAddress,
  lineItems,       // [{ description, qty, rate, amount }]
  subtotal,
  gst,
  deposit,
  discount,
  grandTotal,
  paymentId,
  status,
  notes,
}) {
  const W = 595.28;
  const H = 841.89;
  const ML = 50;   // margin left
  const MR = 50;   // margin right
  const CW = W - ML - MR; // content width

  let streams = []; // accumulate drawing streams

  // Helper: add a filled rectangle
  const rect = (x, y, w, h, r, g, b) =>
    `${r} ${g} ${b} rg\n${x} ${y} ${w} ${h} re\nf\n`;

  // Helper: add a stroked line
  const line = (x1, y1, x2, y2, r = 0.78, g = 0.78, b = 0.78, lw = 0.5) =>
    `${lw} w\n${r} ${g} ${b} RG\n${x1} ${y1} m\n${x2} ${y2} l\nS\n`;

  // Helper: text at position
  const text = (x, y, str, font = "/F1", size = 10, r = 0.15, g = 0.15, b = 0.15) =>
    `BT\n${font} ${size} Tf\n${r} ${g} ${b} rg\n${x} ${y} Td\n(${esc(str)}) Tj\nET\n`;

  // Helper: right-aligned text
  const textR = (rightX, y, str, font = "/F1", size = 10, r = 0.15, g = 0.15, b = 0.15) => {
    const approxWidth = esc(str).length * size * 0.52;
    return text(rightX - approxWidth, y, str, font, size, r, g, b);
  };

  let Y = H - 50; // cursor

  // ━━━ HEADER BAR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  streams.push(rect(0, Y - 10, W, 55, 0.15, 0.15, 0.15)); // dark bar
  streams.push(text(ML, Y + 18, "ClosetRush", "/F2", 20, 1, 1, 1));
  streams.push(text(ML + 142, Y + 18, "Bedding Rentals", "/F1", 10, 0.66, 0.57, 0.45));
  streams.push(textR(W - MR, Y + 18, docTitle, "/F2", 14, 1, 1, 1));
  Y -= 30;

  // ━━━ INVOICE META ROW ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Y -= 30;
  streams.push(rect(ML, Y - 5, CW, 24, 0.96, 0.95, 0.93)); // light beige row
  streams.push(text(ML + 8, Y + 3, `Invoice #: ${invoiceNo}`, "/F2", 9, 0.3, 0.3, 0.3));
  streams.push(text(ML + 250, Y + 3, `Date: ${invoiceDate}`, "/F1", 9, 0.3, 0.3, 0.3));
  if (paymentId) {
    streams.push(text(ML + 400, Y + 3, `Payment: ${paymentId}`, "/F1", 8, 0.4, 0.4, 0.4));
  }

  // ━━━ BILL TO SECTION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Y -= 45;
  streams.push(text(ML, Y, "BILL TO", "/F2", 9, 0.66, 0.57, 0.45));
  Y -= 18;
  streams.push(text(ML, Y, customerName, "/F2", 12, 0.15, 0.15, 0.15));
  Y -= 15;
  if (customerPhone && customerPhone !== "—") {
    streams.push(text(ML, Y, `Phone: ${customerPhone}`, "/F1", 9, 0.35, 0.35, 0.35));
    Y -= 13;
  }
  if (customerEmail) {
    streams.push(text(ML, Y, `Email: ${customerEmail}`, "/F1", 9, 0.35, 0.35, 0.35));
    Y -= 13;
  }
  if (customerAddress && customerAddress !== "—") {
    // Wrap address if long
    const addr = String(customerAddress);
    const line1 = addr.substring(0, 75);
    const line2 = addr.substring(75, 150);
    streams.push(text(ML, Y, `Address: ${line1}`, "/F1", 9, 0.35, 0.35, 0.35));
    Y -= 13;
    if (line2) {
      streams.push(text(ML + 48, Y, line2, "/F1", 9, 0.35, 0.35, 0.35));
      Y -= 13;
    }
  }

  // ━━━ TABLE HEADER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Y -= 20;
  streams.push(rect(ML, Y - 5, CW, 22, 0.15, 0.15, 0.15)); // dark header row
  const colDesc = ML + 8;
  const colQty = ML + 290;
  const colRate = ML + 350;
  const colAmt = ML + 430;
  streams.push(text(colDesc, Y + 2, "DESCRIPTION", "/F2", 8, 1, 1, 1));
  streams.push(text(colQty, Y + 2, "QTY", "/F2", 8, 1, 1, 1));
  streams.push(text(colRate, Y + 2, "RATE (Rs)", "/F2", 8, 1, 1, 1));
  streams.push(text(colAmt, Y + 2, "AMOUNT (Rs)", "/F2", 8, 1, 1, 1));

  // ━━━ TABLE ROWS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Y -= 25;
  lineItems.forEach((item, idx) => {
    const bg = idx % 2 === 0 ? [0.98, 0.98, 0.97] : [1, 1, 1];
    streams.push(rect(ML, Y - 8, CW, 22, ...bg));

    // Truncate long descriptions
    const desc = String(item.description).substring(0, 55);
    streams.push(text(colDesc, Y, desc, "/F1", 9, 0.2, 0.2, 0.2));
    streams.push(text(colQty, Y, String(item.qty), "/F1", 9, 0.2, 0.2, 0.2));
    streams.push(text(colRate, Y, fmtCurrency(item.rate), "/F1", 9, 0.2, 0.2, 0.2));
    streams.push(text(colAmt, Y, fmtCurrency(item.amount), "/F2", 9, 0.2, 0.2, 0.2));
    Y -= 22;
  });

  // Divider
  streams.push(line(ML, Y, ML + CW, Y, 0.85, 0.85, 0.85, 0.8));

  // ━━━ TOTALS SECTION ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const labelX = ML + 330;
  const valueX = ML + 450;
  Y -= 20;

  streams.push(text(labelX, Y, "Subtotal", "/F1", 9, 0.4, 0.4, 0.4));
  streams.push(text(valueX, Y, `Rs. ${fmtCurrency(subtotal)}`, "/F1", 9, 0.2, 0.2, 0.2));

  if (discount && discount > 0) {
    Y -= 16;
    streams.push(text(labelX, Y, "Discount", "/F1", 9, 0.13, 0.55, 0.13));
    streams.push(text(valueX, Y, `- Rs. ${fmtCurrency(discount)}`, "/F1", 9, 0.13, 0.55, 0.13));
  }

  Y -= 16;
  streams.push(text(labelX, Y, "GST (18%)", "/F1", 9, 0.4, 0.4, 0.4));
  streams.push(text(valueX, Y, `Rs. ${fmtCurrency(gst)}`, "/F1", 9, 0.2, 0.2, 0.2));

  if (deposit && deposit > 0) {
    Y -= 16;
    streams.push(text(labelX, Y, "Security Deposit", "/F1", 9, 0.4, 0.4, 0.4));
    streams.push(text(valueX, Y, `Rs. ${fmtCurrency(deposit)}`, "/F1", 9, 0.2, 0.2, 0.2));
  }

  // Grand total highlight
  Y -= 22;
  streams.push(rect(labelX - 10, Y - 8, CW - (labelX - 10 - ML), 26, 0.15, 0.15, 0.15));
  streams.push(text(labelX, Y + 2, "GRAND TOTAL", "/F2", 11, 1, 1, 1));
  streams.push(text(valueX, Y + 2, `Rs. ${fmtCurrency(grandTotal)}`, "/F2", 12, 0.93, 0.82, 0.62));

  // ━━━ STATUS BADGE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (status) {
    Y -= 40;
    const isPaid = status.toUpperCase().includes("ACTIVE") || status.toUpperCase().includes("PAID") || status.toUpperCase().includes("CONFIRMED");
    const badgeColor = isPaid ? [0.05, 0.6, 0.35] : [0.85, 0.55, 0.1];
    streams.push(rect(ML, Y - 6, 140, 22, ...badgeColor));
    streams.push(text(ML + 10, Y + 1, `STATUS: ${status.toUpperCase()}`, "/F2", 9, 1, 1, 1));
  }

  // ━━━ NOTES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (notes) {
    Y -= 35;
    streams.push(text(ML, Y, "NOTES", "/F2", 8, 0.66, 0.57, 0.45));
    Y -= 14;
    const noteLines = String(notes).match(/.{1,85}/g) || [notes];
    noteLines.forEach((nl) => {
      streams.push(text(ML, Y, nl, "/F1", 8, 0.45, 0.45, 0.45));
      Y -= 12;
    });
  }

  // ━━━ FOOTER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  streams.push(line(ML, 65, ML + CW, 65, 0.88, 0.88, 0.88, 0.5));
  streams.push(text(ML, 50, "ClosetRush Bedding Rentals  |  Delhi NCR, India  |  support@closetrush.com", "/F1", 7, 0.55, 0.55, 0.55));
  streams.push(text(ML, 38, "Thermodynamic UV-C Sterilized Sheets & Linens  |  GST Registered  |  This is a computer-generated invoice.", "/F1", 6.5, 0.65, 0.65, 0.65));

  // ─── Assemble raw PDF ────────────────────────────────────
  const contentStream = streams.join("");
  const streamBytes = Buffer.byteLength(contentStream, "binary");

  const objs = [];
  const offsets = [];
  let pdf = "%PDF-1.4\n";

  const addObj = (content) => {
    offsets.push(Buffer.byteLength(pdf, "binary"));
    const num = objs.length + 1;
    const s = `${num} 0 obj\n${content}\nendobj\n`;
    objs.push(s);
    pdf += s;
    return num;
  };

  addObj("<< /Type /Catalog /Pages 2 0 R >>");
  addObj("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  addObj(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 4 0 R >>`
  );
  addObj(
    `<< /Length ${streamBytes} >>\nstream\n${contentStream}\nendstream`
  );
  addObj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  addObj("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");

  // Cross-reference table
  const xrefOffset = Buffer.byteLength(pdf, "binary");
  let xref = `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  offsets.forEach((off) => {
    xref += `${String(off).padStart(10, "0")} 00000 n \n`;
  });

  pdf += xref;
  pdf += `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, "binary");
}

// ─── GET handler ────────────────────────────────────────────
export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    let quoteId = searchParams.get("quoteId");
    let orderId = searchParams.get("orderId");

    if (quoteId === "undefined" || quoteId === "null" || quoteId === "") quoteId = null;
    if (orderId === "undefined" || orderId === "null" || orderId === "") orderId = null;

    // Check session token for authenticated user fallback
    let sessionUser = null;
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get("token")?.value;
      if (token) {
        const decoded = verifyToken(token);
        if (decoded?.userId) {
          sessionUser = await User.findById(decoded.userId).select("-password");
        }
      }
    } catch (e) {
      // Session optional
    }

    let pdfBuffer;
    let filename = "document.pdf";

    if (quoteId) {
      // ─── B2B Quotation PDF ──────────────────────────────
      const queryConds = [{ _id: quoteId.match(/^[0-9a-fA-F]{24}$/) ? quoteId : null }, { quoteId }].filter(Boolean);
      const quote = await Quote.findOne({ $or: queryConds.length ? queryConds : [{ _id: quoteId }] });
      if (!quote) {
        return NextResponse.json({ error: "Quotation request not found." }, { status: 404 });
      }

      const perBedRate = quote.priceQuote ? Math.round(quote.priceQuote / (quote.bedsCount || 1)) : 250;
      const totalAmt = quote.priceQuote || ((quote.bedsCount || 1) * 250);

      filename = `Quotation_${quote._id.toString().substring(0, 8).toUpperCase()}.pdf`;
      pdfBuffer = buildInvoicePDF({
        docTitle: "QUOTATION PROPOSAL",
        invoiceNo: quote._id.toString().substring(0, 8).toUpperCase(),
        invoiceDate: fmtDate(quote.receivedAt || quote.createdAt),
        customerName: quote.businessName || quote.contactPerson || "Valued Client",
        customerPhone: quote.phone || "—",
        customerEmail: quote.email || "—",
        customerAddress: quote.propertyAddress || "—",
        lineItems: [
          {
            description: `${quote.bedType || "Standard"} Bed Setup (${quote.roomsCount || 1} rooms, ${quote.bedsCount || 1} beds)`,
            qty: quote.bedsCount || 1,
            rate: perBedRate,
            amount: totalAmt,
          },
        ],
        subtotal: totalAmt,
        gst: Math.round(totalAmt * 0.18),
        deposit: 0,
        discount: 0,
        grandTotal: totalAmt + Math.round(totalAmt * 0.18),
        paymentId: null,
        status: quote.signedBy ? "CONTRACT SIGNED" : quote.status || "PENDING",
        notes: quote.signedBy
          ? `E-Signed by ${quote.signedBy} on ${fmtDate(quote.signedAt)}. Requirements: ${(quote.bedsheetRequirements || []).join(", ")}`
          : `Requirements: ${(quote.bedsheetRequirements || []).join(", ")}. Awaiting client approval.`,
      });
    } else {
      // ─── B2C Order Invoice PDF ──────────────────────────
      let order = null;

      if (orderId) {
        const queryConds = [
          { bundleOrderId: orderId },
          { razorpayOrderId: orderId }
        ];
        if (orderId.match(/^[0-9a-fA-F]{24}$/)) {
          queryConds.push({ _id: orderId });
        }
        order = await Order.findOne({ $or: queryConds });
      }

      // Fallback 1: If order not found by orderId, find latest order for logged-in user
      if (!order && sessionUser) {
        order = await Order.findOne({
          $or: [{ userId: sessionUser._id.toString() }, { email: sessionUser.email }]
        }).sort({ createdAt: -1 });
      }

      // Fallback 2: Synthesize order from user.selectedPlan if order document doesn't exist yet
      if (!order && sessionUser?.selectedPlan?.planName) {
        const plan = sessionUser.selectedPlan;
        order = {
          bundleOrderId: `INV-${Date.now().toString().slice(-6)}`,
          userName: sessionUser.name,
          phone: sessionUser.mobile || "—",
          email: sessionUser.email,
          deliveryAddress: sessionUser.address || "—",
          bundleName: `${plan.bedType || "Single"} ${plan.planName || "Subscription"}`,
          duration: plan.duration || "1 Month",
          calculatedRent: plan.price || 0,
          discount: plan.discount || 0,
          depositCharged: plan.securityDeposit || 0,
          totalAmount: plan.totalPrice || ((plan.price || 0) + (plan.securityDeposit || 0)),
          finalPrice: plan.totalPrice || ((plan.price || 0) + (plan.securityDeposit || 0)),
          status: "ACTIVE",
          orderType: plan.orderType || "RENT",
          itemTier: plan.itemTier || "BASIC",
          couponCode: plan.couponCode || null,
          startDate: plan.startDate || new Date(),
        };
      }

      if (!order) {
        return NextResponse.json({ error: "Order not found or no active subscription." }, { status: 404 });
      }

      // Re-derive pricing breakdown from stored values
      const rent = order.calculatedRent || order.finalPrice || 0;
      const discountAmt = order.discount || 0;
      const discountedBase = Math.max(0, rent - discountAmt);
      const gstAmt = order.gst || Math.round(discountedBase * 0.18);
      const depositAmt = order.depositCharged || order.securityDeposit || 0;
      const total = order.totalAmount || order.finalPrice || (discountedBase + gstAmt + depositAmt);

      const lineItems = [
        {
          description: `${order.bundleName || "Bedding Subscription"} — ${order.duration || "Monthly"}`,
          qty: 1,
          rate: rent,
          amount: rent,
        },
      ];

      filename = `Invoice_${order.bundleOrderId || "ClosetRush"}.pdf`;
      pdfBuffer = buildInvoicePDF({
        docTitle: "SUBSCRIPTION INVOICE",
        invoiceNo: order.bundleOrderId || `INV-${Date.now().toString().slice(-6)}`,
        invoiceDate: fmtDate(order.startDate || order.createdAt),
        customerName: order.userName || sessionUser?.name || "Valued Customer",
        customerPhone: order.phone || sessionUser?.mobile || "—",
        customerEmail: order.email || sessionUser?.email || "—",
        customerAddress: order.deliveryAddress || sessionUser?.address || "—",
        lineItems,
        subtotal: rent,
        gst: gstAmt,
        deposit: depositAmt,
        discount: discountAmt,
        grandTotal: total,
        paymentId: order.razorpayPaymentId || null,
        status: order.status || "ACTIVE",
        notes: [
          order.orderType === "RENT" ? "Rental subscription — bedding will be swapped as per your chosen cycle." : "One-time purchase order.",
          order.itemTier === "PREMIUM" ? "Premium tier: weekly swap service included." : "",
          order.couponCode ? `Coupon applied: ${order.couponCode}` : "",
          depositAmt > 0 ? "Security deposit is fully refundable upon subscription completion." : "",
          order.endDate ? `Subscription valid until ${fmtDate(order.endDate)}.` : "",
        ].filter(Boolean).join(" "),
      });
    }

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("PDF generation api error:", error);
    return NextResponse.json({ error: "Internal server error generating PDF." }, { status: 500 });
  }
}
