import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PartnerLink from "@/models/PartnerLink";
import User from "@/models/User";
import Order from "@/models/Order";
import { sendPartnerDailyReportEmail } from "@/lib/mailer";

// ─── Automated Partner Daily Report (Cron) ─────────────────
// Scheduled to run daily at 8:00 PM IST (14:30 UTC) via Vercel Cron.
// Sends a performance digest email to every ACTIVE partner.

function verifyCronSecret(request) {
  const url = new URL(request.url);
  const secretParam = url.searchParams.get("secret");
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (process.env.NODE_ENV === "production") {
    if (!cronSecret) return false;
    return secretParam === cronSecret || authHeader === `Bearer ${cronSecret}`;
  }
  if (cronSecret) {
    return secretParam === cronSecret || authHeader === `Bearer ${cronSecret}`;
  }
  return true;
}

export async function GET(request) {
  try {
    // Verify cron secret
    if (!verifyCronSecret(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    console.log("[CRON] Partner Daily Report — Starting...");

    const activePartners = await PartnerLink.find({ status: "ACTIVE" }).lean();

    if (activePartners.length === 0) {
      console.log("[CRON] No active partners found. Skipping.");
      return NextResponse.json({ success: true, message: "No active partners.", sent: 0 });
    }

    const results = [];
    const errors = [];

    for (const partner of activePartners) {
      try {
        // Today's date boundaries (IST — UTC+5:30)
        const now = new Date();
        const istOffset = 5.5 * 60 * 60 * 1000;
        const istNow = new Date(now.getTime() + istOffset);
        const istStartOfDay = new Date(istNow);
        istStartOfDay.setHours(0, 0, 0, 0);
        const todayStart = new Date(istStartOfDay.getTime() - istOffset);
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

        // Today's Signups
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

        // Today's Orders
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

        // All-Time Stats
        const allTimeSignups = await User.countDocuments({
          $or: [
            { partnerLinkId: partner._id },
            { referredByCode: partner.code },
          ],
        });

        const allTimeOrdersDocs = await Order.find({
          $or: [
            { partnerLinkId: partner._id },
            { referredByCode: partner.code },
          ],
        }, "finalPrice totalAmount").lean();

        const allTimeRevenue = allTimeOrdersDocs.reduce(
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
          allTimeOrders: allTimeOrdersDocs.length,
          allTimeRevenue,
          allTimeCommission,
          commissionPaid,
          commissionDue,
          isTest: false,
        });

        results.push({ email: partner.email, name: partner.name });
        console.log(`[CRON] Digest sent to ${partner.name} (${partner.email})`);
      } catch (err) {
        console.error(`[CRON] Failed for ${partner.email}:`, err.message);
        errors.push({ email: partner.email, error: err.message });
      }
    }

    console.log(`[CRON] Partner Daily Report — Done. Sent: ${results.length}, Failed: ${errors.length}`);

    return NextResponse.json({
      success: true,
      message: `Digest sent to ${results.length} partner(s).${errors.length ? ` ${errors.length} failed.` : ""}`,
      sent: results.length,
      failed: errors.length,
    });
  } catch (error) {
    console.error("[CRON PARTNER DAILY REPORT ERROR]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
