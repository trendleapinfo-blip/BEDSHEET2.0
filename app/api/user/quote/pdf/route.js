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
  const num = Number(n || 0);
  if (Number.isNaN(num)) return "0.00";
  return num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(d) {
  if (!d) return "-";
  const dt = new Date(d);
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// Clean and truncate address — remove repeated city/pincode noise
function cleanAddress(addr) {
  if (!addr || addr === "-" || addr === "—") return null;
  // Remove duplicate city fragments and tidy up
  let a = String(addr).trim();
  // Collapse multiple spaces/commas
  a = a.replace(/,\s*,/g, ",").replace(/\s{2,}/g, " ");
  return a;
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
  const ML = 45;   // margin left
  const MR = 45;   // margin right
  const CW = W - ML - MR; // content width = 505.28

  let streams = [];

  const rect = (x, y, w, h, r, g, b) =>
    `${r} ${g} ${b} rg\n${x} ${y} ${w} ${h} re\nf\n`;

  const line = (x1, y1, x2, y2, r = 0.78, g = 0.78, b = 0.78, lw = 0.5) =>
    `${lw} w\n${r} ${g} ${b} RG\n${x1} ${y1} m\n${x2} ${y2} l\nS\n`;

  const text = (x, y, str, font = "/F1", size = 10, r = 0.15, g = 0.15, b = 0.15) =>
    `BT\n${font} ${size} Tf\n${r} ${g} ${b} rg\n${x} ${y} Td\n(${esc(str)}) Tj\nET\n`;

  // Right-aligned — uses character width approximation
  const textR = (rightX, y, str, font = "/F1", size = 10, r = 0.15, g = 0.15, b = 0.15) => {
    const approxWidth = esc(str).length * size * 0.55;
    return text(rightX - approxWidth, y, str, font, size, r, g, b);
  };

  // Wrap a long string into lines of maxChars each
  const wrapText = (str, maxChars) => {
    const s = String(str || "");
    const lines = [];
    let i = 0;
    while (i < s.length) {
      // Try to break at a space
      let end = Math.min(i + maxChars, s.length);
      if (end < s.length) {
        const spaceIdx = s.lastIndexOf(" ", end);
        if (spaceIdx > i) end = spaceIdx;
      }
      lines.push(s.substring(i, end).trim());
      i = end;
      while (i < s.length && s[i] === " ") i++;
    }
    return lines;
  };

  let Y = H - 50; // cursor

  // ━━━ HEADER BAR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  streams.push(rect(0, Y - 10, W, 58, 0.10, 0.12, 0.16));
  streams.push(text(ML, Y + 20, "ClosetRush", "/F2", 22, 1, 1, 1));
  streams.push(text(ML + 158, Y + 20, "Bedding Rentals", "/F1", 10, 0.60, 0.75, 0.72));
  streams.push(text(ML, Y + 5, "Gurugram, Haryana, India  |  support@closetrush.in  |  www.closetrush.in", "/F1", 7.5, 0.55, 0.70, 0.68));
  // Title badge on right
  streams.push(rect(W - MR - 170, Y + 2, 170, 28, 0.05, 0.50, 0.44));
  streams.push(text(W - MR - 162, Y + 10, docTitle, "/F2", 11, 1, 1, 1));
  Y -= 34;

  // ━━━ INVOICE META BAR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Y -= 28;
  streams.push(rect(ML, Y - 6, CW, 26, 0.94, 0.96, 0.96));
  // Teal left accent
  streams.push(rect(ML, Y - 6, 4, 26, 0.05, 0.50, 0.44));

  // Invoice number (left)
  streams.push(text(ML + 12, Y + 5,  "INVOICE NO.", "/F2", 7, 0.05, 0.50, 0.44));
  streams.push(text(ML + 12, Y - 4,  `#${invoiceNo}`, "/F2", 9, 0.10, 0.12, 0.16));

  // Date (center)
  const metaC = ML + CW / 3;
  streams.push(text(metaC, Y + 5,  "DATE", "/F2", 7, 0.05, 0.50, 0.44));
  streams.push(text(metaC, Y - 4,  invoiceDate, "/F1", 9, 0.10, 0.12, 0.16));

  // Payment ref (right) — truncate to 26 chars max to avoid overflow
  if (paymentId) {
    const metaR = ML + (CW * 2) / 3;
    const payShort = String(paymentId).substring(0, 26);
    streams.push(text(metaR, Y + 5, "PAYMENT REF", "/F2", 7, 0.05, 0.50, 0.44));
    streams.push(text(metaR, Y - 4, payShort, "/F1", 8.5, 0.10, 0.12, 0.16));
  }

  // ━━━ BILL TO + FROM (two columns) ━━━━━━━━━━━━━━━━━━━━━━━
  Y -= 32;
  const colW = CW / 2 - 6;
  const billBoxH = 100;

  // Left: Bill To box
  streams.push(rect(ML, Y - billBoxH + 14, colW, billBoxH, 0.96, 0.97, 0.97));
  streams.push(rect(ML, Y + 13, colW, 3, 0.05, 0.50, 0.44)); // teal top stripe
  streams.push(text(ML + 8, Y + 2, "BILL TO", "/F2", 7.5, 0.05, 0.50, 0.44));

  let BY = Y - 12;
  streams.push(text(ML + 8, BY, customerName || "Valued Customer", "/F2", 11, 0.10, 0.12, 0.16));
  BY -= 14;
  if (customerPhone && customerPhone !== "-" && customerPhone !== "—") {
    streams.push(text(ML + 8, BY, `Ph: ${customerPhone}`, "/F1", 8.5, 0.30, 0.32, 0.36));
    BY -= 13;
  }
  if (customerEmail && customerEmail !== "-" && customerEmail !== "—") {
    const emailShort = String(customerEmail).substring(0, 38);
    streams.push(text(ML + 8, BY, emailShort, "/F1", 8.5, 0.30, 0.32, 0.36));
    BY -= 13;
  }
  const cleanAddr = cleanAddress(customerAddress);
  if (cleanAddr) {
    // Wrap address into 2 lines of ~38 chars each
    const addrLines = wrapText(cleanAddr, 38);
    addrLines.slice(0, 2).forEach(al => {
      streams.push(text(ML + 8, BY, al, "/F1", 8, 0.35, 0.37, 0.41));
      BY -= 12;
    });
  }

  // Right: From box
  const FX = ML + colW + 12;
  streams.push(rect(FX, Y - billBoxH + 14, colW, billBoxH, 0.96, 0.97, 0.97));
  streams.push(rect(FX, Y + 13, colW, 3, 0.05, 0.50, 0.44));
  streams.push(text(FX + 8, Y + 2, "FROM", "/F2", 7.5, 0.05, 0.50, 0.44));

  let FY = Y - 12;
  streams.push(text(FX + 8, FY, "ClosetRush Bedding Rentals", "/F2", 10, 0.10, 0.12, 0.16));
  FY -= 14;
  streams.push(text(FX + 8, FY, "support@closetrush.in", "/F1", 8.5, 0.30, 0.32, 0.36));
  FY -= 13;
  streams.push(text(FX + 8, FY, "www.closetrush.in", "/F1", 8.5, 0.30, 0.32, 0.36));
  FY -= 13;
  streams.push(text(FX + 8, FY, "Sector 44, Gurugram, Haryana - 122003", "/F1", 8, 0.35, 0.37, 0.41));
  FY -= 12;
  streams.push(text(FX + 8, FY, "GSTIN: Registered  |  CIN: Registered", "/F1", 7.5, 0.45, 0.47, 0.52));

  Y -= billBoxH + 14;

  // ━━━ TABLE HEADER ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Y -= 16;
  streams.push(rect(ML, Y - 5, CW, 22, 0.10, 0.12, 0.16));
  // Column X positions
  const colDesc  = ML + 8;
  const colQty   = ML + 298;
  const colRate  = ML + 340;
  const colAmt   = ML + 415;
  const colAmtR  = ML + CW - 4; // right edge for amount column
  const colRateR = colAmt - 4;
  streams.push(text(colDesc,  Y + 2, "DESCRIPTION",   "/F2", 8, 1, 1, 1));
  streams.push(text(colQty,   Y + 2, "QTY",           "/F2", 8, 1, 1, 1));
  streams.push(text(colRate,  Y + 2, "RATE (Rs.)",    "/F2", 8, 1, 1, 1));
  streams.push(text(colAmt,   Y + 2, "AMOUNT (Rs.)",  "/F2", 8, 1, 1, 1));

  // ━━━ TABLE ROWS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Y -= 24;
  lineItems.forEach((item, idx) => {
    const descLines = wrapText(String(item.description), 48);
    const rowH = descLines.length > 1 ? 32 : 22;
    const bg = idx % 2 === 0 ? [0.97, 0.98, 0.98] : [1, 1, 1];
    streams.push(rect(ML, Y - rowH + 14, CW, rowH, ...bg));

    // Description — up to 2 lines
    streams.push(text(colDesc, Y, descLines[0], "/F1", 8.5, 0.12, 0.14, 0.18));
    if (descLines[1]) {
      streams.push(text(colDesc, Y - 11, descLines[1], "/F1", 8.5, 0.12, 0.14, 0.18));
    }
    // QTY centered in its column
    streams.push(text(colQty,  Y, String(item.qty || 1), "/F1", 9, 0.12, 0.14, 0.18));
    // Rate and Amount — right-aligned in their columns
    streams.push(textR(colRateR, Y, fmtCurrency(item.rate),   "/F1", 9, 0.20, 0.22, 0.26));
    streams.push(textR(colAmtR,  Y, fmtCurrency(item.amount), "/F2", 9, 0.10, 0.12, 0.16));
    Y -= rowH;
  });

  // Divider below table
  streams.push(line(ML, Y + 6, ML + CW, Y + 6, 0.05, 0.50, 0.44, 0.8));
  Y -= 14;

  // ━━━ TOTALS SECTION (right-aligned block) ━━━━━━━━━━━━━━━━
  const totLX  = ML + 295;       // label left edge
  const totRX  = ML + CW - 4;   // value right edge (right-aligned)

  const totRow = (label, value, color, bold) => {
    const [lr, lg, lb] = color || [0.38, 0.40, 0.44];
    const vFont = bold ? "/F2" : "/F1";
    const lFont = bold ? "/F2" : "/F1";
    streams.push(text(totLX, Y, label, lFont, 9, lr, lg, lb));
    streams.push(textR(totRX, Y, value, vFont, 9, 0.10, 0.12, 0.16));
    Y -= 16;
  };

  // Recalculate on discounted base (prevents GST=0 when discount is high)
  const discountedBase = Math.max(0, subtotal - (discount || 0));
  const gstOnBase = Math.round((discountedBase - (discountedBase / 1.18)) * 100) / 100;
  const finalGst  = (gst && gst > 0) ? gst : gstOnBase;
  const finalGrandTotal = discountedBase + (deposit || 0);

  totRow("Subtotal (Incl. GST)", `Rs. ${fmtCurrency(subtotal)}`);

  if (discount && discount > 0) {
    totRow(`Discount Applied`, `- Rs. ${fmtCurrency(discount)}`, [0.04, 0.55, 0.30]);
  }

  totRow(`GST @ 18% (Included in Total)`, `Rs. ${fmtCurrency(finalGst)}`);

  if (deposit && deposit > 0) {
    totRow("Security Deposit (Refundable)", `Rs. ${fmtCurrency(deposit)}`);
  }

  // Separator line
  Y -= 4;
  streams.push(line(totLX, Y, ML + CW, Y, 0.05, 0.50, 0.44, 0.8));
  Y -= 14;

  // Grand total box
  const gtBoxX = totLX - 10;
  const gtBoxW = CW - (totLX - 10 - ML);
  streams.push(rect(gtBoxX, Y - 10, gtBoxW, 28, 0.10, 0.12, 0.16));
  streams.push(text(totLX, Y + 3, "GRAND TOTAL", "/F2", 11, 1, 1, 1));
  streams.push(textR(totRX, Y + 3, `Rs. ${fmtCurrency(finalGrandTotal)}`, "/F2", 13, 0.95, 0.80, 0.35));

  // ━━━ STATUS BADGE ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Y -= 32;
  if (status) {
    const st = status.toUpperCase();
    const isPaid    = /ACTIVE|PAID|CONFIRMED|SIGNED/.test(st);
    const isPending = /PENDING|AWAITING/.test(st);
    const [br, bg, bb] = isPaid ? [0.04, 0.55, 0.35] : isPending ? [0.80, 0.52, 0.06] : [0.70, 0.10, 0.12];
    streams.push(rect(ML, Y - 7, 160, 24, br, bg, bb));
    streams.push(text(ML + 10, Y + 1, `STATUS: ${st}`, "/F2", 9, 1, 1, 1));
    if (isPaid) {
      streams.push(text(ML + 172, Y + 1, "Payment Verified", "/F1", 8.5, 0.04, 0.55, 0.35));
    }
    Y -= 28;
  }

  // ━━━ NOTES ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (notes) {
    Y -= 8;
    streams.push(rect(ML, Y - 4, CW, 14, 0.94, 0.96, 0.96));
    streams.push(text(ML + 8, Y + 1, "NOTES", "/F2", 7.5, 0.05, 0.50, 0.44));
    Y -= 16;
    const noteLines = wrapText(String(notes), 100);
    noteLines.slice(0, 4).forEach((nl) => {
      streams.push(text(ML + 6, Y, nl, "/F1", 8, 0.35, 0.37, 0.42));
      Y -= 12;
    });
    Y -= 6;
  }

  // ━━━ TERMS ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Y -= 10;
  streams.push(text(ML, Y, "TERMS & CONDITIONS", "/F2", 7.5, 0.05, 0.50, 0.44));
  Y -= 12;
  const terms = [
    "1. Security deposit is 100% refundable on return of bedding in good condition.",
    "2. Swaps are done as per your plan cycle. Please retain this invoice for your records.",
    "3. For queries: support@closetrush.in | Gurugram, Haryana, India - 122003",
  ];
  terms.forEach(t => {
    streams.push(text(ML, Y, t, "/F1", 7.5, 0.44, 0.46, 0.50));
    Y -= 11;
  });

  // ━━━ FOOTER BAR ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  streams.push(rect(0, 0, W, 52, 0.10, 0.12, 0.16));
  streams.push(rect(0, 51, W, 3, 0.05, 0.50, 0.44)); // teal top line
  streams.push(rect(W - 5, 0, 5, 52, 0.05, 0.50, 0.44)); // teal right accent
  streams.push(text(ML, 34, "ClosetRush Bedding Rentals", "/F2", 9, 1, 1, 1));
  streams.push(text(ML, 22, "support@closetrush.in  |  www.closetrush.in  |  Sector 44, Gurugram, Haryana - 122003", "/F1", 7.5, 0.60, 0.70, 0.70));
  streams.push(text(ML, 11, "UV-C Sterilized Linens  |  GST Registered  |  Computer-generated invoice — no physical signature required.", "/F1", 6.5, 0.48, 0.55, 0.55));
  streams.push(textR(W - ML, 34, "Page 1 of 1", "/F1", 7, 0.55, 0.65, 0.65));

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
        gst: Math.round(totalAmt - (totalAmt / 1.18)),
        deposit: 0,
        discount: 0,
        grandTotal: totalAmt,
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
      const gstAmt = order.gst || Math.round(discountedBase - (discountedBase / 1.18));
      const depositAmt = order.depositCharged || order.securityDeposit || 0;
      const total = order.totalAmount || order.finalPrice || (discountedBase + depositAmt);

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
