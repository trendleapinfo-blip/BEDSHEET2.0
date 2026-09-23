import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import PartnerLink from "@/models/PartnerLink";

export async function POST(request) {
  try {
    const { code } = await request.json();
    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    await dbConnect();
    const cleanCode = code.trim().toUpperCase();

    const partnerLink = await PartnerLink.findOneAndUpdate(
      { code: cleanCode, status: "ACTIVE" },
      { $inc: { clicks: 1 } },
      { new: true }
    );

    if (!partnerLink) {
      return NextResponse.json({ success: false, message: "Link not found or inactive" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      partnerName: partnerLink.name,
      code: partnerLink.code,
      targetUrl: partnerLink.targetUrl || "/"
    });
  } catch (error) {
    console.error("[PARTNER CLICK TRACK ERROR]:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
