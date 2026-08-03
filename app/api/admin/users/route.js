import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { verifyAdmin } from "@/lib/adminAuth";

export async function GET() {
  try {
    const admin = await verifyAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
    }

    await dbConnect();
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Fetch Users Error:", error);
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
    const {
      name,
      email,
      mobile,
      password,
      address,
      accountType,
      role,
      status,
      selectedPlan,
    } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required fields." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return NextResponse.json({ error: "Email address already registered" }, { status: 400 });
    }

    if (mobile) {
      const existingMobile = await User.findOne({ mobile });
      if (existingMobile) {
        return NextResponse.json({ error: "Mobile number already registered" }, { status: 400 });
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      name,
      email: normalizedEmail,
      mobile: mobile || undefined,
      password: hashedPassword,
      address: address || "",
      accountType: accountType || "Individual User",
      role: role || "user",
      status: status || "ACTIVE",
      selectedPlan: selectedPlan || {
        bedType: "",
        planName: "",
        price: 0,
        duration: "",
        startDate: new Date(),
      },
    });

    const userResponse = newUser.toObject();
    delete userResponse.password;

    return NextResponse.json({ success: true, user: userResponse });
  } catch (error) {
    console.error("Create User Error:", error);
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
    const {
      userId,
      name,
      email,
      mobile,
      accountType,
      role,
      status,
      address,
      password,
      selectedPlan,
    } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email.toLowerCase();
    if (mobile !== undefined) updateData.mobile = mobile || undefined;
    if (accountType) updateData.accountType = accountType;
    if (role) updateData.role = role;
    if (status) updateData.status = status;
    if (address !== undefined) updateData.address = address;
    if (selectedPlan !== undefined) updateData.selectedPlan = selectedPlan;

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Update User Error:", error);
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
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const deleted = await User.findByIdAndDelete(userId);
    if (!deleted) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete User Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
