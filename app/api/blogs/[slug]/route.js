import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Blog from "@/models/Blog";

export async function GET(request, { params }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const slug = resolvedParams.slug?.toLowerCase();

    if (!slug) {
      return NextResponse.json(
        { success: false, error: "Slug parameter is required." },
        { status: 400 }
      );
    }

    // Find and atomically increment view count
    const post = await Blog.findOneAndUpdate(
      { slug, status: "published" },
      { $inc: { views: 1 } },
      { new: true }
    ).lean();

    if (!post) {
      return NextResponse.json(
        { success: false, error: "Blog post not found." },
        { status: 404 }
      );
    }

    // Fetch related articles from same category
    const relatedPosts = await Blog.find({
      _id: { $ne: post._id },
      category: post.category,
      status: "published",
    })
      .select("title slug excerpt coverImage category readTime createdAt")
      .sort({ createdAt: -1 })
      .limit(3)
      .lean();

    return NextResponse.json({
      success: true,
      post,
      relatedPosts,
    });
  } catch (error) {
    console.error("Get Single Blog Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blog post." },
      { status: 500 }
    );
  }
}
