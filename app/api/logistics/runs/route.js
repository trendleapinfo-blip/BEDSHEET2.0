import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import Bundle from "@/models/Bundle";

// Helper to verify logistics/admin/warehouse role
async function verifyLogisticsAccess() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    await dbConnect();
    const user = await User.findById(decoded.userId);
    if (user && (user.role === "admin" || user.role === "warehouse" || user.role === "logistics")) {
      return user;
    }
    return null;
  } catch (error) {
    return null;
  }
}

// GET: Fetch all bundles with their associated order details for the logistics run sheet
export async function GET() {
  try {
    const user = await verifyLogisticsAccess();
    if (!user) {
      return NextResponse.json({ error: "Forbidden. Logistics access required." }, { status: 403 });
    }

    await dbConnect();

    // 1. Fetch all active/paid orders
    const activeOrders = await Order.find({ status: { $ne: "CANCELLED" } }).sort({ createdAt: -1 });

    // 2. Fetch all existing bundles
    let bundles = await Bundle.find({}).sort({ createdAt: -1 });

    // Build lookup set of all existing bundle order keys
    const existingOrderKeys = new Set();
    bundles.forEach(b => {
      if (b.orderId) existingOrderKeys.add(b.orderId);
      if (b.bundleId) existingOrderKeys.add(b.bundleId);
      if (b.parentOrderId) existingOrderKeys.add(b.parentOrderId);
    });

    // 3. Auto-generate a Bundle document ONLY for an Order that lacks any matching Bundle
    for (const order of activeOrders) {
      const orderIdStr = order._id.toString();
      const bundleOrderIdStr = order.bundleOrderId;

      const hasBundle = existingOrderKeys.has(orderIdStr) || (bundleOrderIdStr && existingOrderKeys.has(bundleOrderIdStr));

      if (!hasBundle) {
        try {
          const isSingle = (order.bundleName || "").toLowerCase().includes("single");
          const newBundleId = order.bundleOrderId || `BNDL-${Math.floor(100000 + Math.random() * 900000)}`;
          const createdBundle = await Bundle.create({
            bundleId: newBundleId,
            orderId: orderIdStr,
            customerName: order.userName || "Valued Customer",
            bedType: isSingle ? "Single" : "Double",
            color: "Classic White",
            status: "READY_TO_DISPATCH",
            items: [
              { sku: `SHT-${Date.now().toString().slice(-4)}`, itemType: "Bedsheet", laundryStatus: "CLEAN_STOCK" },
              { sku: `PIL-${Date.now().toString().slice(-4)}`, itemType: "Pillow Cover", laundryStatus: "CLEAN_STOCK" }
            ],
            logisticsHistory: [
              {
                timestamp: order.createdAt || new Date(),
                action: "Order Activated — Package Ready for Logistics Dispatch",
                operator: "Automated Dispatch System"
              }
            ]
          });
          bundles.push(createdBundle);
          existingOrderKeys.add(orderIdStr);
          if (bundleOrderIdStr) existingOrderKeys.add(bundleOrderIdStr);
        } catch (e) {
          console.error("Auto-bundle creation error for order:", order._id, e);
        }
      }
    }

    // 4. Clean up any auto-created duplicate bundles if a WMS bundle already exists for the same order
    const autoCreatedDupes = bundles.filter(b => 
      activeOrders.some(o => o.bundleOrderId === b.bundleId) &&
      bundles.some(other => other._id.toString() !== b._id.toString() && (other.orderId === b.bundleId || other.parentOrderId === b.bundleId))
    );

    for (const dupe of autoCreatedDupes) {
      try {
        await Bundle.findByIdAndDelete(dupe._id);
        bundles = bundles.filter(b => b._id.toString() !== dupe._id.toString());
      } catch (e) {}
    }

    // 5. Fetch matching orders for orderMap
    const orderKeysToFetch = [];
    bundles.forEach(b => {
      if (b.orderId) orderKeysToFetch.push(b.orderId);
      if (b.bundleId) orderKeysToFetch.push(b.bundleId);
      if (b.parentOrderId) orderKeysToFetch.push(b.parentOrderId);
    });

    const orders = await Order.find({
      $or: [
        { _id: { $in: orderKeysToFetch.filter(id => typeof id === "string" && id.match(/^[0-9a-fA-F]{24}$/)) } },
        { bundleOrderId: { $in: orderKeysToFetch.filter(Boolean) } }
      ]
    });

    const orderMap = {};
    orders.forEach(o => {
      orderMap[o._id.toString()] = o;
      if (o.bundleOrderId) orderMap[o.bundleOrderId] = o;
    });

    // 6. Group and Deduplicate shipments so each order/customer appears ONLY ONCE
    const uniqueShipmentsMap = new Map();

    for (const bundle of bundles) {
      const order = orderMap[bundle.orderId] || orderMap[bundle.bundleId] || orderMap[bundle.parentOrderId] || {};
      
      // Determine canonical order key
      const canonicalKey = order.bundleOrderId || bundle.orderId || bundle.bundleId || bundle.parentOrderId;

      if (!uniqueShipmentsMap.has(canonicalKey)) {
        uniqueShipmentsMap.set(canonicalKey, {
          _id: bundle._id,
          bundleId: bundle.bundleId,
          orderId: bundle.orderId,
          bundleOrderId: order.bundleOrderId || bundle.bundleId || "—",
          bundleName: order.bundleName || `${bundle.bedType} Bedsheet Set`,
          customerName: bundle.customerName || order.userName || "Customer",
          phone: order.phone || "—",
          email: order.email || "—",
          deliveryAddress: order.deliveryAddress || "—",
          color: bundle.color || "Classic White",
          bedType: bundle.bedType || "Single",
          orderType: order.orderType || "RENT",
          finalPrice: order.finalPrice || order.totalAmount || 0,
          startDate: order.startDate || bundle.createdAt,
          orderStatus: order.status || "ACTIVE",
          bundleStatus: bundle.status || "READY_TO_DISPATCH",
          items: bundle.items || [],
          logisticsHistory: bundle.logisticsHistory || [],
          createdAt: bundle.createdAt,
        });
      }
    }

    const shipments = Array.from(uniqueShipmentsMap.values());

    return NextResponse.json({ success: true, shipments });
  } catch (error) {
    console.error("Logistics Runs Fetch Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT: Update shipment/bundle status from logistics panel
export async function PUT(request) {
  try {
    const user = await verifyLogisticsAccess();
    if (!user) {
      return NextResponse.json({ error: "Forbidden. Logistics access required." }, { status: 403 });
    }

    await dbConnect();
    const body = await request.json();
    const { bundleId, action } = body; // action: 'DELIVERED', 'COLLECT_RETURN', 'CANCELLED', etc.

    if (!bundleId || !action) {
      return NextResponse.json({ error: "Missing bundleId or action parameter." }, { status: 400 });
    }

    const bundle = await Bundle.findOne({
      $or: [
        { bundleId },
        { orderId: bundleId },
        { parentOrderId: bundleId },
        { _id: bundleId.match(/^[0-9a-fA-F]{24}$/) ? bundleId : null }
      ].filter(Boolean)
    });

    if (!bundle) {
      return NextResponse.json({ error: "Shipment bundle not found." }, { status: 404 });
    }

    let statusLogMsg = "";
    if (action === "DELIVERED") {
      bundle.status = "DELIVERED";
      statusLogMsg = "Package delivered to customer successfully.";
      
      if (bundle.orderId) {
        try {
          if (bundle.orderId.match(/^[0-9a-fA-F]{24}$/)) {
            await Order.findByIdAndUpdate(bundle.orderId, { status: "ACTIVE" });
          } else {
            await Order.findOneAndUpdate({ bundleOrderId: bundle.orderId }, { status: "ACTIVE" });
          }
        } catch (oErr) {
          console.error("Order status sync error:", oErr);
        }
      }
    } else if (action === "COLLECT_RETURN") {
      bundle.status = "COLLECTED";
      statusLogMsg = "Used sheets collected from customer for laundry recycling.";
    } else if (action === "DISPATCH") {
      bundle.status = "DISPATCHED";
      statusLogMsg = "Package dispatched with logistics agent.";
    } else if (action === "CANCELLED") {
      bundle.status = "COMPLETED";
      statusLogMsg = "Shipment marked as cancelled / returned.";
    } else {
      bundle.status = action;
      statusLogMsg = `Status updated to ${action}`;
    }

    bundle.logisticsHistory.push({
      timestamp: new Date(),
      action: statusLogMsg,
      operator: user.name || "Logistics Agent"
    });

    await bundle.save();

    return NextResponse.json({
      success: true,
      message: `Shipment ${bundle.bundleId} updated to ${bundle.status}!`,
      bundle
    });
  } catch (error) {
    console.error("Logistics Update Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
