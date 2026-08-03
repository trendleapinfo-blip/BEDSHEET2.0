import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import StaffApproval from "@/models/StaffApproval";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { verifyAdmin } from "@/lib/adminAuth";

export async function GET() {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    const staff = await StaffApproval.find({}).sort({ registeredAt: -1 });
    return NextResponse.json({ staff });
  } catch (error) {
    console.error("Fetch Staff Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const { name, email, mobile, role, address } = await request.json();

    if (!name || !email || !mobile || !role) {
      return NextResponse.json({ error: "Name, email, mobile, and role are required fields." }, { status: 400 });
    }

    const existing = await StaffApproval.findOne({ $or: [{ email: email.toLowerCase() }, { mobile }] });
    if (existing) {
      return NextResponse.json({ error: "Staff member with this email or mobile already registered." }, { status: 400 });
    }

    const staff = await StaffApproval.create({
      name,
      email: email.toLowerCase(),
      mobile,
      role,
      address: address || "",
      status: "PENDING"
    });

    return NextResponse.json({ success: true, staff });
  } catch (error) {
    console.error("Staff Registration Error:", error);
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
    const { staffId, status, password } = await request.json();

    if (!staffId || !status) {
      return NextResponse.json({ error: "Staff ID and status are required" }, { status: 400 });
    }

    const updated = await StaffApproval.findByIdAndUpdate(staffId, { status }, { new: true });
    if (!updated) {
      return NextResponse.json({ error: "Staff record not found" }, { status: 404 });
    }

    let createdTempPassword = null;
    // Auto-create user login account if approved
    if (status === "APPROVED") {
      const existingUser = await User.findOne({ email: updated.email });
      if (!existingUser) {
        createdTempPassword = password || crypto.randomBytes(8).toString("hex");
        const hashedPassword = await bcrypt.hash(createdTempPassword, 10);
        const mappedRole = updated.role === "WH" ? "warehouse" : "logistics";
        await User.create({
          name: updated.name,
          email: updated.email,
          mobile: updated.mobile,
          password: hashedPassword,
          role: mappedRole,
          status: "ACTIVE",
          accountType: "Individual User"
        });
      }
    }

    return NextResponse.json({ success: true, staff: updated, tempPassword: createdTempPassword });
  } catch (error) {
    console.error("Update Staff Error:", error);
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
    const staffId = searchParams.get("staffId");

    if (!staffId) {
      return NextResponse.json({ error: "Staff ID is required" }, { status: 400 });
    }

    const deleted = await StaffApproval.findByIdAndDelete(staffId);
    if (!deleted) {
      return NextResponse.json({ error: "Staff record not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Staff record deleted successfully" });
  } catch (error) {
    console.error("Delete Staff Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
