import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { verifyAdmin } from "@/lib/adminAuth";
import PartnerLink from "@/models/PartnerLink";
import User from "@/models/User";
import Order from "@/models/Order";

function generateSlug(name) {
  const cleanName = (name || "PARTNER")
    .trim()
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 10);
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${cleanName}-${randomSuffix}`;
}

export async function GET(request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    await dbConnect();

    // Fetch all partner links
    const partnerLinks = await PartnerLink.find().sort({ createdAt: -1 }).lean();

    // Compute live stats for each partner link
    const enrichedLinks = await Promise.all(
      partnerLinks.map(async (link) => {
        // Find all users who signed up with this partner code
        const signedUpUsers = await User.find(
          {
            $or: [
              { partnerLinkId: link._id },
              { referredByCode: link.code }
            ]
          },
          "name email mobile createdAt accountType"
        ).sort({ createdAt: -1 }).lean();

        // Find only orders placed through this partner link/code
        const orders = await Order.find(
          {
            $or: [
              { partnerLinkId: link._id },
              { referredByCode: link.code }
            ]
          },
          "bundleOrderId email userName bundleName finalPrice totalAmount status createdAt orderType"
        ).sort({ createdAt: -1 }).lean();

        const totalRevenue = orders.reduce((sum, ord) => sum + (Number(ord.finalPrice || ord.totalAmount || 0)), 0);
        const rate = link.commissionRate !== undefined ? link.commissionRate : 10;
        const discountPercent = link.discountPercent !== undefined ? link.discountPercent : 10;
        const commissionEarned = Math.round(totalRevenue * (rate / 100));
        const commissionPaid = Number(link.commissionPaid) || 0;
        const commissionDue = Math.max(0, commissionEarned - commissionPaid);

        return {
          ...link,
          commissionRate: rate,
          discountPercent,
          commissionEarned,
          commissionPaid,
          commissionDue,
          signupsCount: signedUpUsers.length,
          signups: signedUpUsers.map(u => ({
            id: u._id,
            name: u.name,
            email: u.email,
            mobile: u.mobile,
            joinedAt: u.createdAt,
            accountType: u.accountType
          })),
          ordersCount: orders.length,
          orders: orders.map(o => ({
            orderId: o.bundleOrderId,
            userName: o.userName,
            email: o.email,
            bundleName: o.bundleName,
            amount: o.finalPrice || o.totalAmount,
            status: o.status,
            orderType: o.orderType,
            orderedAt: o.createdAt
          })),
          totalRevenue
        };
      })
    );

    return NextResponse.json({
      success: true,
      partnerLinks: enrichedLinks
    });
  } catch (error) {
    console.error("[ADMIN PARTNER LINKS GET ERROR]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const { name, email, phone, customCode, targetUrl, notes, commissionRate, discountPercent } = body;

    if (!name || !email) {
      return NextResponse.json(
        { error: "Partner/PG Name and Email are required" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Code generation or custom validation
    let finalCode = (customCode || "").trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
    if (!finalCode) {
      finalCode = generateSlug(name);
    }

    // Check if code already exists
    const existingCode = await PartnerLink.findOne({ code: finalCode });
    if (existingCode) {
      return NextResponse.json(
        { error: `Referral code '${finalCode}' is already taken. Please choose another.` },
        { status: 400 }
      );
    }

    const newPartnerLink = await PartnerLink.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: (phone || "").trim(),
      code: finalCode,
      targetUrl: (targetUrl || "/").trim(),
      notes: (notes || "").trim(),
      commissionRate: commissionRate !== undefined && commissionRate !== "" ? Number(commissionRate) : 10,
      discountPercent: discountPercent !== undefined && discountPercent !== "" ? Number(discountPercent) : 10,
      commissionPaid: 0,
      payouts: [],
      status: "ACTIVE",
      clicks: 0,
      signups: [],
      orders: [],
      totalRevenue: 0,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Referral link created successfully",
        partnerLink: newPartnerLink,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[ADMIN PARTNER LINKS POST ERROR]:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    await dbConnect();
    const body = await request.json();
    const { id, action, status, name, email, phone, code, targetUrl, notes, commissionRate, discountPercent, payoutAmount, reference } = body;

    if (!id) {
      return NextResponse.json({ error: "Link ID is required" }, { status: 400 });
    }

    // Handle recording a payout
    if (action === "payout") {
      const amount = Number(payoutAmount);
      if (!amount || amount <= 0) {
        return NextResponse.json({ error: "Valid payout amount is required" }, { status: 400 });
      }

      const updated = await PartnerLink.findByIdAndUpdate(
        id,
        {
          $inc: { commissionPaid: amount },
          $push: {
            payouts: {
              amount,
              date: new Date(),
              reference: (reference || "").trim(),
              notes: (notes || "").trim(),
            },
          },
        },
        { new: true }
      );

      if (!updated) {
        return NextResponse.json({ error: "Partner link not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, message: "Payout recorded successfully", partnerLink: updated });
    }

    const updateFields = {};
    if (status) updateFields.status = status;
    if (name) updateFields.name = name.trim();
    if (email) {
      const emailTrim = email.trim().toLowerCase();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailTrim)) {
        return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
      }
      updateFields.email = emailTrim;
    }
    if (phone !== undefined) updateFields.phone = phone.trim();
    if (targetUrl !== undefined) updateFields.targetUrl = targetUrl.trim();
    if (notes !== undefined) updateFields.notes = notes.trim();
    if (commissionRate !== undefined && commissionRate !== "") updateFields.commissionRate = Number(commissionRate);
    if (discountPercent !== undefined && discountPercent !== "") updateFields.discountPercent = Number(discountPercent);

    if (code) {
      const cleanCode = code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
      if (cleanCode) {
        const existing = await PartnerLink.findOne({ code: cleanCode, _id: { $ne: id } });
        if (existing) {
          return NextResponse.json({ error: `Referral code '${cleanCode}' is already in use by another partner.` }, { status: 400 });
        }
        updateFields.code = cleanCode;
      }
    }

    const updated = await PartnerLink.findByIdAndUpdate(id, updateFields, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "Partner link not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, partnerLink: updated });
  } catch (error) {
    console.error("[ADMIN PARTNER LINKS PATCH ERROR]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Link ID is required" }, { status: 400 });
    }

    const deleted = await PartnerLink.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json({ error: "Partner link not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Partner link deleted successfully" });
  } catch (error) {
    console.error("[ADMIN PARTNER LINKS DELETE ERROR]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
