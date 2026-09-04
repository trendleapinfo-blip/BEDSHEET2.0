import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import dbConnect from "@/lib/db";
import Blog from "@/models/Blog";
import {
  Clock,
  Calendar,
  Eye,
  ArrowLeft,
  Share2,
  ChevronRight,
  Bookmark,
  ShieldCheck,
  Check,
  Sparkles,
} from "lucide-react";
import BlogShareBar from "./BlogShareBar";

export async function generateMetadata({ params }) {
  try {
    await dbConnect();
    const resolvedParams = await params;
    const slug = resolvedParams?.slug?.toLowerCase();
    const post = await Blog.findOne({ slug, status: "published" }).lean();

    if (!post) {
      return { title: "Blog Post Not Found | ClosetRush" };
    }

    return {
      title: post.seoTitle || `${post.title} | ClosetRush Blog`,
      description: post.seoDescription || post.excerpt,
      keywords: post.seoKeywords?.length ? post.seoKeywords : post.tags,
      openGraph: {
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.excerpt,
        url: `https://www.closetrush.in/blog/${post.slug}`,
        type: "article",
        publishedTime: post.createdAt,
        modifiedTime: post.updatedAt,
        authors: [post.author?.name || "ClosetRush Sleep Lab"],
        images: [
          {
            url: post.coverImage,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.excerpt,
        images: [post.coverImage],
      },
    };
  } catch (err) {
    return { title: "Blog | ClosetRush" };
  }
}

// Extract Table of Contents from <h2> tags in content HTML
function extractHeadings(html) {
  if (!html) return [];
  const headings = [];
  const regex = /<h2[^>]*>(.*?)<\/h2>/gi;
  let match;
  let index = 0;
  while ((match = regex.exec(html)) !== null) {
    const rawText = match[1].replace(/<[^>]*>/g, "").trim();
    if (rawText) {
      const id = `section-${index++}`;
      headings.push({ id, text: rawText });
    }
  }
  return headings;
}

// Inject IDs into <h2> elements for scroll targets
function injectHeadingIds(html) {
  if (!html) return "";
  let index = 0;
  return html.replace(/<h2([^>]*)>(.*?)<\/h2>/gi, (match, attrs, content) => {
    const id = `section-${index++}`;
    return `<h2 id="${id}" ${attrs}>${content}</h2>`;
  });
}

export default async function SingleBlogPage({ params }) {
  await dbConnect();
  const resolvedParams = await params;
  const slug = resolvedParams?.slug?.toLowerCase();

  // Fetch post and atomically increment views
  const post = await Blog.findOneAndUpdate(
    { slug, status: "published" },
    { $inc: { views: 1 } },
    { new: true }
  ).lean();

  if (!post) {
    notFound();
  }

  // Fetch related posts
  const relatedPosts = await Blog.find({
    _id: { $ne: post._id },
    category: post.category,
    status: "published",
  })
    .select("title slug excerpt coverImage category readTime createdAt")
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  const headings = extractHeadings(post.content);
  const processedContent = injectHeadingIds(post.content);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage,
    datePublished: post.createdAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: post.author?.name || "ClosetRush Sleep Specialist",
    },
    publisher: {
      "@type": "Organization",
      name: "ClosetRush",
      logo: {
        "@type": "ImageObject",
        url: "https://www.closetrush.in/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.closetrush.in/blog/${post.slug}`,
    },
  };

  return (
    <div className="min-h-screen bg-[#FCFBF9] text-[#032026] flex flex-col font-sans selection:bg-[#05D4B5]/30">
      {/* JSON-LD for Google Article Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar forceSolid={true} />

      <main className="flex-1 pt-28 sm:pt-36 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* BREADCRUMB & BACK NAVIGATION */}
        <div className="flex items-center justify-between gap-4 mb-8 text-xs text-gray-500">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Link href="/" className="hover:text-black transition">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <Link href="/blog" className="hover:text-black transition">
              Blog
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <Link
              href={`/blog?category=${encodeURIComponent(post.category)}`}
              className="text-[#1A4F54] font-semibold hover:underline"
            >
              {post.category}
            </Link>
          </div>

          <Link
            href="/blog"
            className="inline-flex items-center gap-1 font-bold text-gray-700 hover:text-black transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>All Articles</span>
          </Link>
        </div>

        {/* ARTICLE HEADER */}
        <header className="max-w-4xl mx-auto text-center space-y-5 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#05D4B5]/15 border border-[#05D4B5]/30 text-teal-900 text-xs font-bold uppercase tracking-wider">
            <span>{post.category}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#032026] tracking-tight leading-tight sm:leading-snug">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-base sm:text-lg text-gray-600 font-sans max-w-2xl mx-auto leading-relaxed">
              {post.excerpt}
            </p>
          )}

          {/* Author & Meta Bar */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-gray-500 border-t border-b border-gray-200 py-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#032026] text-[#05D4B5] font-serif font-bold text-xs flex items-center justify-center">
                {post.author?.name?.charAt(0) || "C"}
              </div>
              <div className="text-left">
                <p className="font-bold text-gray-900 leading-tight">{post.author?.name}</p>
                <p className="text-[10px] text-gray-400">{post.author?.role}</p>
              </div>
            </div>

            <div className="h-4 w-px bg-gray-300 hidden sm:block" />

            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span>
                {new Date(post.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>{post.readTime || "5 min read"}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-gray-400" />
              <span>{post.views || 1} reads</span>
            </div>
          </div>
        </header>

        {/* HERO COVER IMAGE */}
        <div className="max-w-5xl mx-auto mb-12 rounded-3xl overflow-hidden shadow-lg border border-gray-200 bg-gray-100 aspect-16/9 sm:aspect-21/9 max-h-[460px]">
          <img
            src={post.coverImage || "/banner_1.png"}
            alt={post.title}
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* ARTICLE BODY & SIDEBAR GRID */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* MAIN ARTICLE CONTENT */}
          <article className="lg:col-span-8 bg-white p-6 sm:p-12 rounded-3xl border border-gray-200 shadow-2xs">
            <div
              className="blog-content-body prose prose-teal max-w-none text-[#1F2937] leading-relaxed font-sans"
              dangerouslySetInnerHTML={{ __html: processedContent }}
            />

            {/* TAGS */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-6 border-t border-gray-100">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Topic Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-medium transition"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* AUTHOR PROFILE CARD */}
            <div className="mt-10 p-6 bg-[#FAF9F6] border border-gray-200 rounded-2xl flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-[#032026] text-[#05D4B5] font-serif font-bold text-lg flex items-center justify-center shrink-0 shadow-xs">
                {post.author?.name?.charAt(0) || "C"}
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-[#032026]">{post.author?.name}</h4>
                <p className="text-xs text-teal-800 font-semibold">{post.author?.role}</p>
                <p className="text-xs text-gray-600 leading-relaxed pt-1">
                  Dedicated to improving sleep wellness, fabric science education, and hygienic linen access for modern urban households across India.
                </p>
              </div>
            </div>
          </article>

          {/* RIGHT STICKY SIDEBAR */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Table of Contents */}
            {headings.length > 0 && (
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs sticky top-28">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-[#05D4B5]" />
                  <span>Table of Contents</span>
                </h3>
                <nav className="space-y-2 text-xs">
                  {headings.map((h) => (
                    <a
                      key={h.id}
                      href={`#${h.id}`}
                      className="block text-gray-600 hover:text-[#05D4B5] transition py-0.5 line-clamp-1 border-l-2 border-transparent hover:border-[#05D4B5] pl-2"
                    >
                      {h.text}
                    </a>
                  ))}
                </nav>

                {/* Social Share Bar */}
                <div className="mt-6 pt-5 border-t border-gray-100">
                  <BlogShareBar
                    title={post.title}
                    url={`https://www.closetrush.in/blog/${post.slug}`}
                  />
                </div>
              </div>
            )}

            {/* ClosetRush Rental Mini Card */}
            <div className="bg-gradient-to-br from-[#032026] to-[#1A4F54] text-white p-6 rounded-2xl shadow-md space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#05D4B5]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#05D4B5]">
                  ClosetRush Service
                </span>
              </div>
              <h4 className="text-lg font-serif font-bold leading-snug">
                Rent Fresh 400 TC Sheets at ₹10/Day
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Hot-washed at 60°C+, 100% dust-mite free, delivered to your door monthly. Zero deposit.
              </p>
              <Link
                href="/shop"
                className="block text-center py-2.5 bg-[#05D4B5] hover:bg-[#04bca0] text-[#032026] font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-xs"
              >
                Choose Bedding Plan
              </Link>
            </div>
          </aside>
        </div>

        {/* RELATED ARTICLES */}
        {relatedPosts.length > 0 && (
          <section className="max-w-5xl mx-auto mt-20 pt-12 border-t border-gray-200">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-serif font-bold text-[#032026]">
                  Related Stories in {post.category}
                </h3>
                <p className="text-xs text-gray-500 mt-1">Recommended reading from our sleep lab</p>
              </div>
              <Link
                href={`/blog?category=${encodeURIComponent(post.category)}`}
                className="text-xs font-bold text-[#1A4F54] hover:text-[#05D4B5] transition"
              >
                View Category →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((related) => (
                <article
                  key={related._id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <Link href={`/blog/${related.slug}`} className="block aspect-16/10 overflow-hidden">
                    <img
                      src={related.coverImage}
                      alt={related.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </Link>
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                        {related.category}
                      </span>
                      <Link href={`/blog/${related.slug}`}>
                        <h4 className="font-serif font-bold text-sm text-[#032026] hover:text-[#1A4F54] transition line-clamp-2">
                          {related.title}
                        </h4>
                      </Link>
                    </div>
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                      <span>{related.readTime || "4 min read"}</span>
                      <Link
                        href={`/blog/${related.slug}`}
                        className="font-bold text-[#1A4F54] hover:text-[#05D4B5]"
                      >
                        Read →
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
