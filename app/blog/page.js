import React from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import dbConnect from "@/lib/db";
import Blog from "@/models/Blog";
import {
  Clock,
  Calendar,
  ArrowRight,
  Search,
  Sparkles,
  BookOpen,
  ChevronRight,
  ShieldCheck,
  Tag,
} from "lucide-react";

export const metadata = {
  title: "Sleep & Hygiene Blog | Bedding Care & Rental Lifestyle",
  description:
    "Explore science-backed guides on sleep hygiene, acne prevention from bedsheets, thread count truth, and urban linen rental economics by ClosetRush.",
  openGraph: {
    title: "ClosetRush Journal - Sleep, Hygiene & Organic Bedding Guides",
    description:
      "Expert articles on dermatological bedding care, dust mite prevention, and hassle-free linen rental at ₹10/day.",
    url: "https://www.closetrush.in/blog",
  },
};

const CATEGORIES = [
  "All",
  "Sleep Hygiene",
  "Bedding Care",
  "Rental Lifestyle",
  "Health & Wellness",
  "Interior Tips",
];

async function getBlogData(searchParams) {
  try {
    await dbConnect();
    const resolvedParams = await searchParams;
    const category = resolvedParams?.category?.trim();
    const search = resolvedParams?.search?.trim();

    const filter = { status: "published" };

    if (category && category.toLowerCase() !== "all") {
      filter.category = new RegExp(`^${category}$`, "i");
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { excerpt: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
      ];
    }

    const [blogs, featuredPost, countsByCategory] = await Promise.all([
      Blog.find(filter)
        .select("title slug excerpt category coverImage readTime author createdAt views featured")
        .sort({ createdAt: -1 })
        .limit(24)
        .lean(),
      Blog.findOne({ status: "published", featured: true })
        .select("title slug excerpt category coverImage readTime author createdAt views")
        .lean(),
      Blog.aggregate([
        { $match: { status: "published" } },
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
    ]);

    const categoryCounts = {};
    countsByCategory.forEach((c) => {
      categoryCounts[c._id] = c.count;
    });

    return {
      blogs: JSON.parse(JSON.stringify(blogs)),
      featuredPost: featuredPost ? JSON.parse(JSON.stringify(featuredPost)) : null,
      activeCategory: category || "All",
      searchQuery: search || "",
      categoryCounts,
    };
  } catch (error) {
    console.error("Error fetching blog data:", error);
    return {
      blogs: [],
      featuredPost: null,
      activeCategory: "All",
      searchQuery: "",
      categoryCounts: {},
    };
  }
}

export default async function BlogIndexPage({ searchParams }) {
  const { blogs, featuredPost, activeCategory, searchQuery, categoryCounts } =
    await getBlogData(searchParams);

  // If no explicit featured post found, pick first item
  const heroPost = (!searchQuery && activeCategory.toLowerCase() === "all")
    ? featuredPost || blogs[0]
    : null;

  // Filter out the hero post from the lower grid to prevent duplicate display
  const gridBlogs = heroPost
    ? blogs.filter((b) => b._id !== heroPost._id)
    : blogs;

  return (
    <div className="min-h-screen bg-[#FCFBF9] text-[#032026] flex flex-col font-sans selection:bg-[#05D4B5]/30">
      <Navbar forceSolid={true} />

      {/* HERO SECTION */}
      <section className="pt-28 sm:pt-36 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#05D4B5]/15 border border-[#05D4B5]/30 text-teal-900 text-xs font-bold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 text-[#05D4B5]" />
            <span>The ClosetRush Sleep Journal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-bold text-[#032026] tracking-tight leading-tight">
            Rest Better, Live Cleaner.
          </h1>

          <p className="text-base sm:text-lg text-gray-600 font-sans max-w-2xl mx-auto leading-relaxed">
            Science-backed guides on sleep hygiene, fabric dermatology, dust mite prevention, and smart linen rental from India’s first premium bedding service.
          </p>

          {/* Search Bar */}
          <form
            action="/blog"
            method="GET"
            className="pt-2 max-w-xl mx-auto flex items-center gap-2 bg-white p-2 rounded-2xl border border-gray-200 shadow-sm focus-within:border-[#05D4B5] focus-within:ring-2 focus-within:ring-[#05D4B5]/20 transition"
          >
            <Search className="w-5 h-5 text-gray-400 ml-2 shrink-0" />
            <input
              type="text"
              name="search"
              defaultValue={searchQuery}
              placeholder="Search topics: acne, thread count, dust mites, rental savings..."
              className="w-full bg-transparent px-2 py-1.5 text-sm text-[#032026] placeholder-gray-400 outline-none"
            />
            {activeCategory && activeCategory !== "All" && (
              <input type="hidden" name="category" value={activeCategory} />
            )}
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#032026] hover:bg-[#1A4F54] text-white rounded-xl text-xs font-bold transition shrink-0"
            >
              Search
            </button>
          </form>
        </div>

        {/* CATEGORY FILTER PILLS */}
        <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
          {CATEGORIES.map((cat) => {
            const isSelected = activeCategory.toLowerCase() === cat.toLowerCase();
            const href =
              cat === "All"
                ? searchQuery ? `/blog?search=${encodeURIComponent(searchQuery)}` : "/blog"
                : searchQuery
                ? `/blog?category=${encodeURIComponent(cat)}&search=${encodeURIComponent(searchQuery)}`
                : `/blog?category=${encodeURIComponent(cat)}`;

            return (
              <Link
                key={cat}
                href={href}
                className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-[#032026] text-white shadow-sm"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <span>{cat}</span>
                {cat !== "All" && categoryCounts[cat] > 0 && (
                  <span
                    className={`ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {categoryCounts[cat]}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full space-y-16">
        {/* HERO FEATURED POST BANNER */}
        {heroPost && (
          <div className="group relative bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:h-[380px] xl:h-[400px]">
              {/* Image Container - Constrained, Gracefully Cropped */}
              <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-full overflow-hidden bg-gray-100">
                <img
                  src={heroPost.coverImage || "/banner_1.png"}
                  alt={heroPost.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-[#032026]/90 backdrop-blur-md text-[#05D4B5] text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-md border border-white/10">
                    <Sparkles className="w-3 h-3 text-[#05D4B5]" />
                    Featured Story
                  </span>
                </div>
              </div>

              {/* Text / Metadata Container - Balanced Spacing */}
              <div className="lg:col-span-5 p-6 sm:p-8 lg:p-8 flex flex-col justify-between lg:h-full bg-white">
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5 text-xs">
                    <span className="bg-[#05D4B5]/15 text-teal-900 font-bold px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wider">
                      {heroPost.category}
                    </span>
                    <span className="flex items-center gap-1 text-gray-400 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {heroPost.readTime || "5 min read"}
                    </span>
                  </div>

                  <Link href={`/blog/${heroPost.slug}`} className="block group/title">
                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-[#032026] group-hover/title:text-[#1A4F54] transition line-clamp-3 leading-snug">
                      {heroPost.title}
                    </h2>
                  </Link>

                  <p className="text-xs sm:text-sm text-gray-600 line-clamp-3 sm:line-clamp-4 leading-relaxed">
                    {heroPost.excerpt}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#032026] text-[#05D4B5] flex items-center justify-center font-serif font-bold text-xs shrink-0">
                      {heroPost.author?.name?.charAt(0) || "C"}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 leading-tight">{heroPost.author?.name}</p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(heroPost.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/blog/${heroPost.slug}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#032026] hover:bg-[#1A4F54] text-white rounded-xl text-xs font-bold transition shadow-2xs"
                  >
                    <span>Read Story</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RECENT ARTICLES GRID OR EXPLORE BANNER */}
        {(gridBlogs.length > 0 || searchQuery) ? (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#032026]">
                  {searchQuery
                    ? `Search Results for "${searchQuery}"`
                    : activeCategory !== "All"
                    ? `${activeCategory} Articles`
                    : "More Stories & Guides"}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Showing {gridBlogs.length} {gridBlogs.length === 1 ? "article" : "articles"}
                </p>
              </div>

              {searchQuery && (
                <Link
                  href="/blog"
                  className="text-xs font-semibold text-teal-700 hover:underline"
                >
                  Clear Search
                </Link>
              )}
            </div>

            {gridBlogs.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center space-y-4">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto" />
                <h3 className="text-base font-bold text-gray-800">No matching articles</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  We couldn&apos;t find any published articles matching &quot;{searchQuery}&quot;. Try a different search term.
                </p>
                <Link
                  href="/blog"
                  className="inline-block px-5 py-2.5 bg-[#032026] text-white rounded-xl text-xs font-bold hover:bg-[#1A4F54] transition"
                >
                  Clear Search Filter
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {gridBlogs.map((blog) => (
                <article
                  key={blog._id}
                  className="group bg-white rounded-2xl border border-gray-200 shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden"
                >
                  <Link href={`/blog/${blog.slug}`} className="block relative aspect-16/10 overflow-hidden">
                    <img
                      src={blog.coverImage || "/banner_1.png"}
                      alt={blog.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-white/95 backdrop-blur-xs text-[#032026] text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-xs">
                        {blog.category}
                      </span>
                    </div>
                  </Link>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-[11px] text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(blog.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {blog.readTime || "5 min read"}
                        </span>
                      </div>

                      <Link href={`/blog/${blog.slug}`} className="block group/link">
                        <h3 className="text-lg font-serif font-bold text-[#032026] group-hover/link:text-[#1A4F54] transition line-clamp-2 leading-snug">
                          {blog.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                        {blog.excerpt}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-100 text-[#032026] font-serif font-bold text-xs flex items-center justify-center border">
                          {blog.author?.name?.charAt(0) || "C"}
                        </div>
                        <span className="text-xs font-semibold text-gray-700 truncate max-w-[120px]">
                          {blog.author?.name}
                        </span>
                      </div>

                      <Link
                        href={`/blog/${blog.slug}`}
                        className="text-xs font-bold text-[#1A4F54] group-hover:text-[#05D4B5] transition flex items-center gap-1"
                      >
                        <span>Read</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      ) : null}

        {/* CTA BANNER: SUBSCRIBE TO CLOSETRUSH */}
        <section className="bg-gradient-to-r from-[#032026] via-[#0b292f] to-[#1A4F54] rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#05D4B5]/20 text-[#05D4B5] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Doorstep Linen Hygiene</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold leading-tight">
              Enjoy 400 TC Organic Cotton Sheets for ₹10 per day.
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Stop wasting weekends on laundry and drying racks. Get medical-grade 60°C hot-sanitized bedsheets delivered fresh every month. Zero security deposit. Pause or cancel anytime.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/shop"
                className="px-6 py-3 bg-[#05D4B5] hover:bg-[#04bca0] text-[#032026] font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-lg flex items-center gap-2"
              >
                <span>View Bedding Plans</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/about"
                className="px-6 py-3 border border-white/20 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition"
              >
                Our 60°C Hot Wash Standard
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
