import { cookies } from "next/headers";
import { verifyToken, signToken } from "@/lib/jwt";
import { verifyAdmin } from "@/lib/adminAuth";

export const BLOG_ADMIN_COOKIE = "blog_admin_token";

export function getBlogAdminPassword() {
  return process.env.BLOG_ADMIN_PASSWORD || "closetrush@admin2026";
}

/**
 * Creates a signed JWT specifically for Blog Admin session
 */
export function createBlogAdminToken() {
  return signToken(
    { role: "blog_admin", timestamp: Date.now() },
    { expiresIn: "30d" }
  );
}

/**
 * Verifies if current request is authorized for blog admin operations.
 * Checks:
 * 1. Standard user session admin role (from verifyAdmin)
 * 2. blog_admin_token cookie
 * 3. x-admin-password header directly matching master password
 */
export async function verifyBlogAdmin(request = null) {
  try {
    // 1. Check direct header password if passed
    if (request) {
      const headerPassword = request.headers.get("x-admin-password");
      if (headerPassword && headerPassword === getBlogAdminPassword()) {
        return { authorized: true, role: "master_admin", method: "header_password" };
      }
    }

    // 2. Check blog_admin_token cookie
    const cookieStore = await cookies();
    const blogToken = cookieStore.get(BLOG_ADMIN_COOKIE)?.value;
    if (blogToken) {
      try {
        const decoded = verifyToken(blogToken);
        if (decoded && (decoded.role === "blog_admin" || decoded.role === "admin")) {
          return { authorized: true, role: "blog_admin", method: "cookie_token" };
        }
      } catch (err) {
        // Token invalid or expired, continue to check standard admin
      }
    }

    // 3. Fallback: check standard site admin user session
    const standardAdmin = await verifyAdmin();
    if (standardAdmin) {
      return { authorized: true, role: "admin", user: standardAdmin, method: "admin_user" };
    }

    return null;
  } catch (error) {
    console.error("verifyBlogAdmin error:", error);
    return null;
  }
}
