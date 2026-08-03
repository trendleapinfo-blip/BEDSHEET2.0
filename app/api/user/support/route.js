import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import SupportTicket from "@/models/SupportTicket";

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return NextResponse.json({ error: "Invalid session token." }, { status: 401 });
    }

    const { subject, priority } = await request.json();

    if (!subject) {
      return NextResponse.json({ error: "Ticket subject/details are required." }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Generate a unique Ticket ID
    let ticketId = "";
    let isUnique = false;
    while (!isUnique) {
      const rand = Math.floor(1000 + Math.random() * 9000); // 4 digit number
      ticketId = `TKT${rand}`;
      const existing = await SupportTicket.findOne({ ticketId });
      if (!existing) {
        isUnique = true;
      }
    }

    const newTicket = await SupportTicket.create({
      ticketId,
      subject,
      userName: user.name,
      userEmail: user.email,
      priority: priority || "MEDIUM",
      status: "OPEN",
    });

    return NextResponse.json({
      success: true,
      message: "Support ticket opened successfully.",
      ticket: newTicket,
    });
  } catch (error) {
    console.error("Create Support Ticket API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error occurred while opening support ticket." },
      { status: 500 }
    );
  }
}
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return NextResponse.json({ error: "Invalid session token." }, { status: 401 });
    }

    await dbConnect();

    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const tickets = await SupportTicket.find({ userEmail: user.email }).sort({ createdAt: -1 });

    return NextResponse.json({
      success: true,
      tickets,
    });
  } catch (error) {
    console.error("Get Support Tickets API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error occurred while fetching support tickets." },
      { status: 500 }
    );
  }
}
