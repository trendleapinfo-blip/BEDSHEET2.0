import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import Bundle from "@/models/Bundle";
import Category from "@/models/Category";
import Refund from "@/models/Refund";
import { verifyAdmin } from "@/lib/adminAuth";

export async function GET() {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    const orders = await Order.find({}).sort({ startDate: -1 });
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Fetch Orders Error:", error);
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
    const { bundleOrderId, userId, userName, phone, email, bundleName, duration, finalPrice, status, startDate, endDate, deliveryAddress } = await request.json();

    if (!bundleOrderId || !bundleName || finalPrice === undefined) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    const newOrder = await Order.create({
      bundleOrderId,
      userId,
      userName,
      phone,
      email,
      bundleName,
      duration,
      finalPrice,
      status: status || "ACTIVE",
      startDate: startDate || new Date(),
      endDate,
      deliveryAddress,
    });

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error) {
    console.error("Create Order Error:", error);
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
    const { orderId, status, deliveryAddress, userName, phone, email, bundleName, finalPrice, startDate, endDate } = await request.json();

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (deliveryAddress !== undefined) updateData.deliveryAddress = deliveryAddress;
    if (userName !== undefined) updateData.userName = userName;
    if (phone !== undefined) updateData.phone = phone;
    if (email !== undefined) updateData.email = email;
    if (bundleName !== undefined) updateData.bundleName = bundleName;
    if (finalPrice !== undefined) updateData.finalPrice = finalPrice;
    if (startDate !== undefined) updateData.startDate = startDate;
    if (endDate !== undefined) updateData.endDate = endDate;

    const updated = await Order.findByIdAndUpdate(orderId, updateData, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // --- WMS BUNDLE SYNC LOGIC ---
    if (status === "DELIVERED" || status === "CANCELLED") {
      const bundle = await Bundle.findOne({ orderId: updated._id.toString() });
      if (bundle) {
        if (status === "DELIVERED") {
          bundle.status = "DELIVERED";
          bundle.logisticsHistory.push({
            action: "Delivered to Customer by Courier (via App)",
            operator: "Logistics Partner"
          });
          await bundle.save();
        } else if (status === "CANCELLED") {
          bundle.status = "SENT_TO_LAUNDRY";
          // Mark all items as pending wash for safety processing
          bundle.items = bundle.items.map(item => ({
            ...item.toObject(),
            laundryStatus: "PENDING_WASH"
          }));
          bundle.logisticsHistory.push({
            action: "Delivery failed/cancelled. Bundle routed to receiving dock (via App).",
            operator: "Logistics Partner"
          });
          await bundle.save();

          // Adjust category inventory (decrement rented, increment laundry)
          const category = await Category.findOne({ name: bundle.bedType });
          if (category) {
            category.rentedStock = Math.max(0, (category.rentedStock || 0) - 1);
            category.laundryStock = (category.laundryStock || 0) + 1;
            await category.save();
          }
        }
      }
    }
    // -----------------------------

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("Update Order Error:", error);
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
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
    }

    const deleted = await Order.findByIdAndDelete(orderId);
    if (!deleted) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Cascading deletions for linked Bundle and Refund claims
    await Bundle.deleteMany({
      $or: [
        { orderId: deleted._id.toString() },
        { orderId: deleted.bundleOrderId },
        { parentOrderId: deleted._id.toString() },
        { parentOrderId: deleted.bundleOrderId }
      ]
    });

    await Refund.deleteMany({
      $or: [
        { orderId: deleted._id.toString() },
        { orderId: deleted.bundleOrderId }
      ]
    });

    return NextResponse.json({ success: true, message: "Order and linked bundle/refund records deleted successfully" });
  } catch (error) {
    console.error("Delete Order Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
