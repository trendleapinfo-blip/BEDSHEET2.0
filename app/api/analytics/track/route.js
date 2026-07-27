import { NextResponse } from "next/server";
import dbConnect from "../../../../lib/db";
import Analytics from "../../../../models/Analytics";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function POST(req) {
  try {
    await dbConnect();
    let body = {};
    try {
      body = await req.json();
    } catch (e) {
      // Body might be empty
    }
    const { path, referrer, userAgent, isPwaInstall } = body;

    // Assign a temporary session ID using cookies
    const cookieStore = await cookies();
    let sessionId = cookieStore.get("analytics_session")?.value;
    if (!sessionId) {
      sessionId = crypto.randomBytes(16).toString("hex");
      // Setting a basic session cookie
    }

    const newRecord = new Analytics({
      path,
      referrer,
      userAgent,
      isPwaInstall,
      sessionId,
    });

    await newRecord.save();

    const response = NextResponse.json({ success: true });
    
    // If we generated a new session, set the cookie on the response
    if (!cookieStore.get("analytics_session")?.value) {
      response.cookies.set("analytics_session", sessionId, { maxAge: 60 * 60 * 24 }); // 24 hours
    }

    return response;
  } catch (error) {
    console.error("Analytics track error:", error);
    return NextResponse.json({ success: false, error: "Tracking failed" }, { status: 500 });
  }
}
