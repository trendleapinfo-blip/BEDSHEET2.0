import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Bundle from "@/models/Bundle";
import LaundryLog from "@/models/LaundryLog";

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
    if (!user || !["warehouse", "admin"].includes(user.role)) {
      return NextResponse.json({ error: "Forbidden. Warehouse staff or Admin access required." }, { status: 403 });
    }

    const { action, bundleId, items } = await request.json();
    // action: "SEND" or "RECEIVE"

    if (!bundleId || !items || items.length === 0) {
      return NextResponse.json({ error: "Bundle ID and Items are required" }, { status: 400 });
    }

    const bundle = await Bundle.findOne({ bundleId });
    if (!bundle) {
      return NextResponse.json({ error: "Bundle not found" }, { status: 404 });
    }

    if (action === "SEND") {
      const batchId = `LND-${Date.now().toString().slice(-6)}`;
      await LaundryLog.create({
        bundleId,
        batchId,
        itemsSent: items,
        status: "SENT"
      });

      // Update bundle items
      bundle.items.forEach(item => {
        if (items.some(i => i.qrCode === item.qrCode)) {
          item.laundryStatus = "PENDING_WASH";
        }
      });
      bundle.status = "SENT_TO_LAUNDRY";
      bundle.logisticsHistory.push({ action: `Sent batch ${batchId} to laundry` });
      await bundle.save();

      return NextResponse.json({ success: true, message: "Items sent to laundry", batchId });
    } else if (action === "RECEIVE") {
      const { batchId } = await request.json();
      const log = await LaundryLog.findOne({ batchId });
      if (!log) return NextResponse.json({ error: "Laundry batch not found" }, { status: 404 });

      log.itemsReceived.push(...items);
      log.receivedAt = new Date();
      log.status = log.itemsReceived.length >= log.itemsSent.length ? "FULLY_RECEIVED" : "PARTIAL_RECEIVED";
      await log.save();

      // Update bundle items
      bundle.items.forEach(item => {
        if (items.some(i => i.qrCode === item.qrCode)) {
          item.laundryStatus = "CLEAN_STOCK";
        }
      });
      bundle.status = "CREATED"; // or back to warehouse
      bundle.logisticsHistory.push({ action: `Received items from laundry batch ${batchId}` });
      await bundle.save();

      return NextResponse.json({ success: true, message: "Items received from laundry" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Laundry API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
