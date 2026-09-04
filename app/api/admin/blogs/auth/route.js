import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  verifyBlogAdmin,
  createBlogAdminToken,
  getBlogAdminPassword,
  BLOG_ADMIN_COOKIE,
} from "@/lib/blogAuth";

export async function POST(request) {
  try {
    const body = await request.json();
    const { password } = body;

    const expectedPassword = getBlogAdminPassword();

    if (!password || password.trim() !== expectedPassword.trim()) {
      return NextResponse.json(
        { success: false, error: "Invalid admin password." },
        { status: 401 }
      );
    }

    // Password matched: issue secure token cookie
    const token = createBlogAdminToken();
    const cookieStore = await cookies();
    cookieStore.set(BLOG_ADMIN_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Admin authentication successful.",
    });
  } catch (error) {
    console.error("Blog Admin Auth Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error during authentication." },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const auth = await verifyBlogAdmin(request);
    if (!auth) {
      return NextResponse.json({ authenticated: false }, { status: 200 });
    }
    return NextResponse.json({
      authenticated: true,
      role: auth.role,
      method: auth.method,
    });
  } catch (error) {
    console.error("Blog Admin Auth Check Error:", error);
    return NextResponse.json({ authenticated: false }, { status: 200 });
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete(BLOG_ADMIN_COOKIE);
    return NextResponse.json({
      success: true,
      message: "Logged out from Blog Admin successfully.",
    });
  } catch (error) {
    console.error("Blog Admin Logout Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to log out." },
      { status: 500 }
    );
  }
}
