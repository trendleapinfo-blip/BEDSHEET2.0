import { NextResponse } from "next/server";
import { verifyBlogAdmin } from "@/lib/blogAuth";

export async function POST(request) {
  try {
    const auth = await verifyBlogAdmin(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin credentials or password required." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided." },
        { status: 400 }
      );
    }

    const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || "dnuucbhwa";
    const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || "closet_rush";

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    uploadFormData.append("upload_preset", uploadPreset);

    const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: uploadFormData,
    });

    if (!cloudRes.ok) {
      const errText = await cloudRes.text();
      console.error("Cloudinary upload failed:", errText);
      return NextResponse.json(
        { success: false, error: "Cloudinary upload failed: " + errText },
        { status: cloudRes.status }
      );
    }

    const data = await cloudRes.json();
    return NextResponse.json({
      success: true,
      url: data.secure_url,
      public_id: data.public_id,
    });
  } catch (error) {
    console.error("Image upload route error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to upload image." },
      { status: 500 }
    );
  }
}
