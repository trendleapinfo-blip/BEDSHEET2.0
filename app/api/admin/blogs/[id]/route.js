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

export async function GET(request, { params }) {
  try {
    const auth = await verifyBlogAdmin(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin credentials or password required." },
        { status: 401 }
      );
    }

    await dbConnect();
    const resolvedParams = await params;
    const blog = await Blog.findById(resolvedParams.id).lean();

    if (!blog) {
      return NextResponse.json(
        { success: false, error: "Blog not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, blog });
  } catch (error) {
    console.error("Admin Blog GET [id] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blog post." },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const auth = await verifyBlogAdmin(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin credentials or password required." },
        { status: 401 }
      );
    }

    await dbConnect();
    const resolvedParams = await params;
    const body = await request.json();

    const existing = await Blog.findById(resolvedParams.id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Blog post not found." },
        { status: 404 }
      );
    }

    // Process Slug if changed
    if (body.slug && body.slug !== existing.slug) {
      let candidateSlug = slugify(body.slug);
      const conflict = await Blog.findOne({
        slug: candidateSlug,
        _id: { $ne: existing._id },
      });
      if (conflict) {
        candidateSlug = `${candidateSlug}-${Date.now().toString().slice(-4)}`;
      }
      existing.slug = candidateSlug;
    }

    if (body.title !== undefined) existing.title = body.title.trim();
    if (body.excerpt !== undefined) existing.excerpt = body.excerpt.trim();
    if (body.content !== undefined) {
      existing.content = body.content;
      existing.readTime = calculateReadTime(body.content);
    }
    if (body.coverImage !== undefined) existing.coverImage = body.coverImage;
    if (body.category !== undefined) existing.category = body.category.trim();
    if (body.status !== undefined) existing.status = body.status;
    if (body.featured !== undefined) existing.featured = Boolean(body.featured);
    if (body.seoTitle !== undefined) existing.seoTitle = body.seoTitle;
    if (body.seoDescription !== undefined) existing.seoDescription = body.seoDescription;

    if (body.tags !== undefined) {
      if (Array.isArray(body.tags)) {
        existing.tags = body.tags.map((t) => t.trim().toLowerCase()).filter(Boolean);
      } else if (typeof body.tags === "string") {
        existing.tags = body.tags
          .split(",")
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean);
      }
    }

    if (body.author && typeof body.author === "object") {
      existing.author = {
        name: body.author.name || existing.author.name,
        role: body.author.role || existing.author.role,
        avatar: body.author.avatar || existing.author.avatar,
      };
    }

    await existing.save();

    return NextResponse.json({
      success: true,
      message: "Blog post updated successfully.",
      blog: existing,
    });
  } catch (error) {
    console.error("Admin Blog PUT [id] Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update blog post." },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const auth = await verifyBlogAdmin(request);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin credentials or password required." },
        { status: 401 }
      );
    }

    await dbConnect();
    const resolvedParams = await params;
    const deleted = await Blog.findByIdAndDelete(resolvedParams.id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Blog post not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Blog post deleted successfully.",
    });
  } catch (error) {
    console.error("Admin Blog DELETE [id] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete blog post." },
      { status: 500 }
    );
  }
}
