import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
import dbConnect from "@/lib/db";
import User from "@/models/User";

/**
 * Shared admin authentication helper.
 * Reads the JWT cookie, verifies it, and checks that the user's role === "admin".
 * Returns the admin User document on success, or null on any failure.
 */
export async function verifyAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;

    const decoded = verifyToken(token);
    await dbConnect();
    const user = await User.findById(decoded.userId);
    if (user && user.role === "admin") {
      return user;
    }
    return null;
  } catch (error) {
    return null;
  }
}

