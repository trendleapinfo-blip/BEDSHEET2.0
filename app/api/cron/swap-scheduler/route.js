import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import mongoose from "mongoose";
import Order from "@/models/Order";
import Bundle from "@/models/Bundle";
import Refund from "@/models/Refund";
import User from "@/models/User";

// ─── Automated Sheet Swap Scheduler ─────────────────────────
// This endpoint should be called on a schedule (e.g., daily cron via Vercel Cron, external ping, or admin trigger).
// It checks all active RENT orders with WEEKLY_SWAP or MONTHLY_SWAP frequency,
// determines if a swap cycle is due, and auto-creates a fresh bundle for dispatch.

// Protect with CRON_SECRET environment variable
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

// Calculate if a swap is due based on order start date, frequency, and last bundle creation
function isSwapDue(order, latestBundle) {
  const cycleDays = order.frequency === "WEEKLY_SWAP" ? 7 : 30;
  const now = new Date();

  // If no bundle exists at all, swap is due immediately
  if (!latestBundle) return true;

  // Prefer order.lastSwapDate (set by this scheduler) if available, else use bundle creation date
  const lastSwap = order.lastSwapDate ? new Date(order.lastSwapDate) : new Date(latestBundle.createdAt);
  const diffMs = now - lastSwap;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  return diffDays >= cycleDays;
}

// Generate a unique swap bundle ID
function generateSwapBundleId(order, swapNumber) {
  const prefix = order.bundleOrderId || "SWAP";
  const ts = Date.now().toString().slice(-4);
  return `SWAP-${prefix}-W${swapNumber}-${ts}`;
}

export async function GET(request) {
  try {
    // Verify cron secret
    if (!verifyCronSecret(request)) {
      return NextResponse.json({ error: "Unauthorized cron request." }, { status: 401 });
    }

    await dbConnect();

    // 1. Fetch all active RENT orders with a swap frequency
    const swapOrders = await Order.find({
      status: { $in: ["ACTIVE", "DELIVERED"] },
      orderType: "RENT",
      frequency: { $in: ["WEEKLY_SWAP", "MONTHLY_SWAP"] },
    }).sort({ createdAt: -1 });

    if (swapOrders.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No active swap orders found.",
        processed: 0,
        skipped: 0,
        created: [],
      });
    }

    const results = { processed: 0, skipped: 0, created: [], errors: [] };

    for (const order of swapOrders) {
      results.processed++;

      // Check if subscription has expired
      if (order.endDate && new Date(order.endDate) < new Date()) {
        // Auto-create PENDING Deposit Refund claim if deposit was charged
        if (order.depositCharged && order.depositCharged > 0) {
          const existingRefund = await Refund.findOne({
            $or: [
              { orderId: order._id.toString() },
              { orderId: order.bundleOrderId },
              { $and: [{ $or: [{ userId: order.userId }, { userEmail: order.email }] }, { planName: order.bundleName }, { orderId: { $exists: false } }] }
            ]
          });
          if (!existingRefund) {
            await Refund.create({
              orderId: order._id.toString(),
              userId: order.userId || "GUEST",
              userName: order.userName || "Customer",
              userEmail: order.email,
              userPhone: order.phone || "",
              planName: order.bundleName,
              depositAmount: order.depositCharged,
              status: "PENDING",
            });
          }
        }
        results.skipped++;
        continue;
      }

      // Check if user subscription is currently paused (BUG-019)
      const userDoc = await User.findOne({
        $or: [
          { _id: mongoose.isValidObjectId(order.userId) ? order.userId : null },
          { email: order.email }
        ].filter(Boolean)
      });

      if (userDoc?.selectedPlan?.isPaused && userDoc.selectedPlan?.pausedUntil && new Date() < new Date(userDoc.selectedPlan.pausedUntil)) {
        results.skipped++;
        continue;
      }

      const orderIdStr = order._id.toString();

      // 2. Find ALL bundles linked to this order (by orderId or bundleOrderId match)
      const orderBundles = await Bundle.find({
        $or: [
          { orderId: orderIdStr },
          { orderId: order.bundleOrderId },
          { parentOrderId: orderIdStr },
          { parentOrderId: order.bundleOrderId },
          { bundleId: order.bundleOrderId },
        ]
      }).sort({ createdAt: -1 });

      // 3. Get the latest bundle for this order
      const latestBundle = orderBundles.length > 0 ? orderBundles[0] : null;

      // 4. Check if swap is due
      if (!isSwapDue(order, latestBundle)) {
        results.skipped++;
        continue;
      }

      // 5. Mark the old bundle as COLLECTED (used sheets auto-collected)
      if (latestBundle && !["COLLECTED", "SENT_TO_LAUNDRY", "IN_LAUNDRY", "COMPLETED"].includes(latestBundle.status)) {
        latestBundle.status = "COLLECTED";
        latestBundle.logisticsHistory.push({
          timestamp: new Date(),
          action: "Auto-collected by swap scheduler — cycle complete, fresh sheets dispatching.",
          operator: "Swap Scheduler (Automated)"
        });
        await latestBundle.save();
      }

      // 6. Count total swaps for this order (for naming)
      const swapNumber = orderBundles.length + 1;
      const isSingle = (order.bundleName || "").toLowerCase().includes("single");

      // 7. Create a fresh bundle for the new swap cycle
      try {
        const newBundleId = generateSwapBundleId(order, swapNumber);

        const freshBundle = await Bundle.create({
          bundleId: newBundleId,
          orderId: orderIdStr,
          parentOrderId: order.bundleOrderId,
          customerName: order.userName || "Valued Customer",
          bedType: isSingle ? "Single" : "Double",
          color: "Classic White",
          status: "READY_TO_DISPATCH",
          items: [
            {
              sku: `SHT-SWAP-${Date.now().toString().slice(-5)}`,
              itemType: "Bedsheet",
              laundryStatus: "CLEAN_STOCK"
            },
            {
              sku: `PIL-SWAP-${Date.now().toString().slice(-5)}`,
              itemType: "Pillow Cover",
              laundryStatus: "CLEAN_STOCK"
            }
          ],
          logisticsHistory: [
            {
              timestamp: new Date(),
              action: `${order.frequency === "WEEKLY_SWAP" ? "Weekly" : "Monthly"} Swap #${swapNumber} — Fresh bedsheet kit auto-created and ready for dispatch.`,
              operator: "Swap Scheduler (Automated)"
            }
          ]
        });

        results.created.push({
          orderId: order.bundleOrderId,
          customer: order.userName,
          frequency: order.frequency,
          newBundleId: freshBundle.bundleId,
          swapNumber,
          address: order.deliveryAddress || "—",
        });

        // 8. Update the Order's swap tracking fields
        await Order.findByIdAndUpdate(order._id, {
          lastSwapDate: new Date(),
          $inc: { swapCount: 1 },
        });

      } catch (createErr) {
        // Skip duplicate key errors (bundle already created this cycle)
        if (createErr.code === 11000) {
          results.skipped++;
        } else {
          results.errors.push({
            orderId: order.bundleOrderId,
            error: createErr.message
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Swap scheduler completed. Created ${results.created.length} new bundles, skipped ${results.skipped}, processed ${results.processed} orders.`,
      ...results,
    });

  } catch (error) {
    console.error("Swap Scheduler Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
