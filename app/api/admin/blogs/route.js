import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Blog from "@/models/Blog";
import { verifyBlogAdmin } from "@/lib/blogAuth";

function calculateReadTime(htmlContent) {
  if (!htmlContent) return "3 min read";
  const plainText = htmlContent.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  const wordCount = plainText.split(/\s+/).filter(Boolean).length;
  const minutes = Math.ceil(wordCount / 200) || 1;
  return `${minutes} min read`;
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s\W-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(request) {
  try {
    const auth = await verifyBlogAdmin(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin credentials or password required." },
        { status: 401 }
      );
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim();
    const status = searchParams.get("status")?.trim();
    const category = searchParams.get("category")?.trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get("limit") || "20", 10)));

    const filter = {};

    if (status && status.toLowerCase() !== "all") {
      filter.status = status.toLowerCase();
    }

    if (category && category.toLowerCase() !== "all") {
      filter.category = new RegExp(`^${category}$`, "i");
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { slug: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * limit;

    const [blogs, total, stats] = await Promise.all([
      Blog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Blog.countDocuments(filter),
      Blog.aggregate([
        {
          $group: {
            _id: null,
            totalPosts: { $sum: 1 },
            publishedPosts: {
              $sum: { $cond: [{ $eq: ["$status", "published"] }, 1, 0] },
            },
            draftPosts: {
              $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] },
            },
            totalViews: { $sum: "$views" },
          },
        },
      ]),
    ]);

    const dashboardStats = stats[0] || {
      totalPosts: 0,
      publishedPosts: 0,
      draftPosts: 0,
      totalViews: 0,
    };

    return NextResponse.json({
      success: true,
      blogs,
      total,
      pages: Math.ceil(total / limit) || 1,
      currentPage: page,
      stats: dashboardStats,
    });
  } catch (error) {
    console.error("Admin Blogs GET Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blogs." },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const auth = await verifyBlogAdmin(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin credentials or password required." },
        { status: 401 }
      );
    }

    await dbConnect();
    const body = await request.json();
    const {
      title,
      slug: customSlug,
      excerpt,
      content,
      coverImage,
      category,
      tags,
      author,
      status = "published",
      featured = false,
      seoTitle,
      seoDescription,
      seoKeywords,
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { success: false, error: "Blog title is required." },
        { status: 400 }
      );
    }

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, error: "Blog content is required." },
        { status: 400 }
      );
    }

    // Determine unique slug
    let baseSlug = slugify(customSlug || title);
    if (!baseSlug) baseSlug = `post-${Date.now()}`;
    let finalSlug = baseSlug;
    let count = 1;
    while (await Blog.exists({ slug: finalSlug })) {
      finalSlug = `${baseSlug}-${count++}`;
    }

    // Auto-calculate read time
    const readTime = calculateReadTime(content);

    // Clean tags array
    let processedTags = [];
    if (Array.isArray(tags)) {
      processedTags = tags.map((t) => t.trim().toLowerCase()).filter(Boolean);
    } else if (typeof tags === "string") {
      processedTags = tags
        .split(",")
        .map((t) => t.trim().toLowerCase())
        .filter(Boolean);
    }

    const newBlog = await Blog.create({
      title: title.trim(),
      slug: finalSlug,
      excerpt: excerpt ? excerpt.trim() : title.trim(),
      content,
      coverImage:
        coverImage ||
        "https://images.unsplash.com/photo-1631679706909-1844bbd07221?q=80&w=1200&auto=format&fit=crop",
      category: category ? category.trim() : "Bedding Care",
      tags: processedTags,
      author: {
        name: author?.name || "ClosetRush Sleep Lab",
        role: author?.role || "Hygiene & Bedding Specialist",
        avatar: author?.avatar || "/logo.png",
      },
      status: status === "draft" ? "draft" : "published",
      featured: Boolean(featured),
      readTime,
      seoTitle: seoTitle || title.trim(),
      seoDescription: seoDescription || excerpt || title.trim(),
      seoKeywords: Array.isArray(seoKeywords) ? seoKeywords : [],
    });

    return NextResponse.json({
      success: true,
      message: "Blog post published successfully.",
      blog: newBlog,
    });
  } catch (error) {
    console.error("Admin Blogs POST Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create blog post." },
      { status: 500 }
    );
  }
}
