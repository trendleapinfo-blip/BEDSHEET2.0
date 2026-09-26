import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { verifyAdmin } from "@/lib/adminAuth";
import PartnerLink from "@/models/PartnerLink";
import User from "@/models/User";
import Order from "@/models/Order";
import { sendPartnerDailyReportEmail } from "@/lib/mailer";

/**
 * Shared helper: gather today's stats + all-time stats for a single partner,
 * then send the digest email.
 */
async function buildAndSendDigest(partner, { isTest = false } = {}) {
  // Today's date boundaries (IST — UTC+5:30)
  const now = new Date();
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istNow = new Date(now.getTime() + istOffset);
  const istStartOfDay = new Date(istNow);
  istStartOfDay.setHours(0, 0, 0, 0);
  const todayStart = new Date(istStartOfDay.getTime() - istOffset);
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  // --- Today's Signups ---
  const todaySignedUpUsers = await User.find({
    $or: [
      { partnerLinkId: partner._id },
      { referredByCode: partner.code },
    ],
    createdAt: { $gte: todayStart, $lt: todayEnd },
  }, "name email createdAt").sort({ createdAt: -1 }).lean();

  const todaySignupsList = todaySignedUpUsers.map((u) => ({
    name: u.name || "New User",
    email: u.email || "—",
    time: new Date(u.createdAt).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "Asia/Kolkata",
    }),
  }));

  // --- Today's Orders ---
  const todayOrders = await Order.find({
    $or: [
      { partnerLinkId: partner._id },
      { referredByCode: partner.code },
    ],
    createdAt: { $gte: todayStart, $lt: todayEnd },
  }, "finalPrice totalAmount").lean();

  const todayRevenue = todayOrders.reduce(
    (sum, o) => sum + (Number(o.finalPrice || o.totalAmount || 0)),
    0
  );

  // --- All-Time Stats ---
  const allTimeSignups = await User.countDocuments({
    $or: [
      { partnerLinkId: partner._id },
      { referredByCode: partner.code },
    ],
  });

  const allTimeOrders = await Order.find({
    $or: [
      { partnerLinkId: partner._id },
      { referredByCode: partner.code },
    ],
  }, "finalPrice totalAmount").lean();

  const allTimeRevenue = allTimeOrders.reduce(
    (sum, o) => sum + (Number(o.finalPrice || o.totalAmount || 0)),
    0
  );

  const rate = partner.commissionRate !== undefined ? partner.commissionRate : 10;
  const discountPercent = partner.discountPercent !== undefined ? partner.discountPercent : 10;
  const allTimeCommission = Math.round(allTimeRevenue * (rate / 100));
  const commissionPaid = Number(partner.commissionPaid) || 0;
  const commissionDue = Math.max(0, allTimeCommission - commissionPaid);
  const todayCommission = Math.round(todayRevenue * (rate / 100));

  // Referral URL
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://closetrush.in";
  const targetPath = partner.targetUrl && partner.targetUrl !== "/" ? partner.targetUrl : "";
  const referralUrl = `${baseUrl}${targetPath}${targetPath.includes("?") ? "&" : "?"}ref=${partner.code}`;

  // Send the email
  await sendPartnerDailyReportEmail(partner.email, {
    partnerName: partner.name,
    code: partner.code,
    referralUrl,
    discountPercent,
    commissionRate: rate,
    todaySignups: todaySignedUpUsers.length,
    todaySignupsList,
    todayOrders: todayOrders.length,
    todayRevenue,
    todayCommission,
    allTimeSignups,
    allTimeOrders: allTimeOrders.length,
    allTimeRevenue,
    allTimeCommission,
    commissionPaid,
    commissionDue,
    isTest,
  });

  return {
    email: partner.email,
    name: partner.name,
    todaySignups: todaySignedUpUsers.length,
    todayOrders: todayOrders.length,
    todayRevenue,
  };
}

// ─── POST: Admin-triggered send (single partner test or all partners) ───
export async function POST(request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const { partnerId, sendAll } = body;

    // Send to a single partner (test/demo mode)
    if (partnerId && !sendAll) {
      const partner = await PartnerLink.findById(partnerId).lean();
      if (!partner) {
        return NextResponse.json({ error: "Partner not found" }, { status: 404 });
      }

      const result = await buildAndSendDigest(partner, { isTest: true });
      return NextResponse.json({
        success: true,
        message: `Test digest email sent to ${partner.email}`,
        result,
      });
    }

    // Send to all active partners
    if (sendAll) {
      const activePartners = await PartnerLink.find({ status: "ACTIVE" }).lean();
      if (activePartners.length === 0) {
        return NextResponse.json({
          success: true,
          message: "No active partners to send to.",
          sent: 0,
        });
      }

      const results = [];
      const errors = [];

      for (const partner of activePartners) {
        try {
          const result = await buildAndSendDigest(partner, { isTest: false });
          results.push(result);
        } catch (err) {
          console.error(`[PARTNER DIGEST] Failed for ${partner.email}:`, err.message);
          errors.push({ email: partner.email, error: err.message });
        }
      }

      return NextResponse.json({
        success: true,
        message: `Digest sent to ${results.length} partner(s).${errors.length ? ` ${errors.length} failed.` : ""}`,
        sent: results.length,
        failed: errors.length,
        results,
        errors,
      });
    }

    return NextResponse.json({ error: "Provide partnerId or sendAll flag" }, { status: 400 });
  } catch (error) {
    console.error("[ADMIN PARTNER SEND-REPORT ERROR]:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

// Export buildAndSendDigest for reuse by the cron endpoint
export { buildAndSendDigest };
