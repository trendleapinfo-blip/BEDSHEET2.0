import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Blog from "@/models/Blog";

export async function GET(request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search")?.trim();
    const category = searchParams.get("category")?.trim();
    const tag = searchParams.get("tag")?.trim();
    const sort = searchParams.get("sort") || "newest";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "9", 10)));

    const filter = { status: "published" };

    if (category && category.toLowerCase() !== "all") {
      filter.category = new RegExp(`^${category}$`, "i");
    }

    if (tag) {
      filter.tags = tag.toLowerCase();
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    let sortOptions = { createdAt: -1 };
    if (sort === "popular") {
      sortOptions = { views: -1, createdAt: -1 };
    } else if (sort === "oldest") {
      sortOptions = { createdAt: 1 };
    }

    const skip = (page - 1) * limit;

    const [blogs, total, categoriesAggregation, featuredBlog] = await Promise.all([
      Blog.find(filter)
        .select("-content") // Exclude heavy HTML body in listing
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(filter),
      Blog.aggregate([
        { $match: { status: "published" } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      // Get 1 featured post if on page 1 with no search filter
      page === 1 && !search && (!category || category.toLowerCase() === "all")
        ? Blog.findOne({ status: "published", featured: true })
            .select("-content")
            .sort({ updatedAt: -1 })
            .lean()
        : null,
    ]);

    const categories = categoriesAggregation.map((c) => ({
      name: c._id,
      count: c.count,
    }));

    return NextResponse.json({
      success: true,
      blogs,
      featuredBlog,
      total,
      pages: Math.ceil(total / limit) || 1,
      currentPage: page,
      categories,
    });
  } catch (error) {
    console.error("Public Blogs API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch blogs." },
      { status: 500 }
    );
  }
}
