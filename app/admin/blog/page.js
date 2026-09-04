"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Lock,
  Unlock,
  Key,
  CheckCircle,
  AlertCircle,
  FileText,
  Clock,
  Layers,
  Calendar,
  ExternalLink,
  RefreshCw,
  LogOut,
  ChevronLeft,
  Settings,
  ArrowRight,
  BookOpen,
  Send,
  Zap,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import BlogWordEditor from "./BlogWordEditor";

const PRESET_TOPICS = [
  {
    topic: "Why Dirty Bedsheets Cause Acne: The Dermatologist's Sleep Guide",
    category: "Sleep Hygiene",
    tone: "Authoritative Expert",
  },
  {
    topic: "The Truth About 1000 Thread Count: Why 400 TC Cotton is Better",
    category: "Bedding Care",
    tone: "Engaging & Informative",
  },
  {
    topic: "Renting vs Buying Bedding: Saving ₹8,500 Annually in Bengaluru",
    category: "Rental Lifestyle",
    tone: "Actionable Guide",
  },
  {
    topic: "How Dust Mite Allergies Ruin Your Mornings and How 60°C Hot Wash Fixes It",
    category: "Health & Wellness",
    tone: "Authoritative Expert",
  },
];

export default function AdminBlogStudio() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [adminPassword, setAdminPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Studio data state
  const [blogs, setBlogs] = useState([]);
  const [stats, setStats] = useState({
    totalPosts: 0,
    publishedPosts: 0,
    draftPosts: 0,
    totalViews: 0,
  });
  const [loadingBlogs, setLoadingBlogs] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Editor mode state
  const [isEditing, setIsEditing] = useState(false);
  const [savingBlog, setSavingBlog] = useState(false);
  const [activeBlogId, setActiveBlogId] = useState(null); // null = new blog
  const [coverUploading, setCoverUploading] = useState(false);

  // Blog Form State
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "Bedding Care",
    tags: "",
    coverImage: "",
    status: "published",
    featured: false,
    authorName: "ClosetRush Sleep Lab",
    authorRole: "Hygiene & Bedding Specialist",
    seoTitle: "",
    seoDescription: "",
  });

  // AI Generator Modal State
  const [showAiModal, setShowAiModal] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiForm, setAiForm] = useState({
    topic: "",
    category: "Bedding Care",
    tone: "Engaging & Informative",
    length: "medium",
    customKeywords: "",
  });

  // Check auth on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    setAuthChecking(true);
    try {
      const res = await fetch("/api/admin/blogs/auth");
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        fetchBlogs();
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setIsAuthenticated(false);
    } finally {
      setAuthChecking(false);
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!adminPassword.trim()) return;
    setAuthLoading(true);
    setAuthError("");

    try {
      const res = await fetch("/api/admin/blogs/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: adminPassword.trim() }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setAdminPassword("");
        fetchBlogs();
      } else {
        setAuthError(data.error || "Incorrect master admin password. Please try again.");
      }
    } catch (err) {
      setAuthError("Network error. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/blogs/auth", { method: "DELETE" });
      setIsAuthenticated(false);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Fetch blogs list
  const fetchBlogs = async () => {
    setLoadingBlogs(true);
    try {
      let url = `/api/admin/blogs?status=${selectedStatus}&category=${selectedCategory}`;
      if (searchTerm.trim()) {
        url += `&search=${encodeURIComponent(searchTerm.trim())}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.success) {
        setBlogs(data.blogs || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Fetch blogs error:", err);
    } finally {
      setLoadingBlogs(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchBlogs();
    }
  }, [selectedStatus, selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchBlogs();
  };

  // Handle cover image upload to Cloudinary
  const handleCoverImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const res = await fetch("/api/admin/blogs/upload-image", {
        method: "POST",
        body: uploadFormData,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({ ...prev, coverImage: data.url }));
      } else {
        // Direct Cloudinary client-side fallback
        const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || "dnuucbhwa";
        const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || "closet_rush";
        const cloudFormData = new FormData();
        cloudFormData.append("file", file);
        cloudFormData.append("upload_preset", uploadPreset);

        const directRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: cloudFormData,
        });

        if (directRes.ok) {
          const directData = await directRes.json();
          setFormData((prev) => ({ ...prev, coverImage: directData.secure_url }));
        } else {
          alert("Image upload failed. Please try again.");
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error uploading cover image: " + err.message);
    } finally {
      setCoverUploading(false);
    }
  };

  // Clear all mock/test demo blogs
  const handleClearMockBlogs = async () => {
    if (!confirm("Are you sure you want to remove all mock/test demo articles from the database?")) return;
    try {
      const res = await fetch("/api/admin/blogs/seed", { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message || "Mock articles removed!");
        fetchBlogs();
      } else {
        alert("Failed to delete mock articles: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Error: " + err.message);
    }
  };

  // Open editor for new blog
  const handleCreateNew = () => {
    setActiveBlogId(null);
    setFormData({
      title: "",
      slug: "",
      excerpt: "",
      content: "<h2>Start your article here</h2><p>Begin typing your content or generate an article with the AI Writer...</p>",
      category: "Bedding Care",
      tags: "",
      coverImage: "",
      status: "published",
      featured: false,
      authorName: "ClosetRush Sleep Lab",
      authorRole: "Hygiene & Bedding Specialist",
      seoTitle: "",
      seoDescription: "",
    });
    setIsEditing(true);
  };

  // Open editor for existing blog
  const handleEditBlog = (blog) => {
    setActiveBlogId(blog._id);
    setFormData({
      title: blog.title || "",
      slug: blog.slug || "",
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      category: blog.category || "Bedding Care",
      tags: Array.isArray(blog.tags) ? blog.tags.join(", ") : blog.tags || "",
      coverImage: blog.coverImage || "",
      status: blog.status || "published",
      featured: Boolean(blog.featured),
      authorName: blog.author?.name || "ClosetRush Sleep Lab",
      authorRole: blog.author?.role || "Hygiene & Bedding Specialist",
      seoTitle: blog.seoTitle || "",
      seoDescription: blog.seoDescription || "",
    });
    setIsEditing(true);
  };

  // Delete blog
  const handleDeleteBlog = async (id, title) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/blogs/${id}`, { method: "DELETE" });
      if (res.ok) {
        setBlogs(blogs.filter((b) => b._id !== id));
        setStats((prev) => ({
          ...prev,
          totalPosts: Math.max(0, prev.totalPosts - 1),
        }));
      } else {
        const data = await res.json();
        alert("Delete failed: " + data.error);
      }
    } catch (err) {
      alert("Delete error: " + err.message);
    }
  };

  // Save / Publish Blog
  const handleSaveBlog = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert("Please enter a blog title");
      return;
    }
    const cleanContent = formData.content?.replace(/<[^>]*>/g, "").trim();
    if (!formData.content || (!cleanContent && !formData.content.includes("<img") && !formData.content.includes("<table"))) {
      alert("Article body cannot be empty. Please write your article or click 'AI Generate Post'.");
      return;
    }

    setSavingBlog(true);
    try {
      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content,
        category: formData.category,
        tags: formData.tags,
        coverImage: formData.coverImage,
        status: formData.status,
        featured: formData.featured,
        author: {
          name: formData.authorName,
          role: formData.authorRole,
          avatar: "/logo.png",
        },
        seoTitle: formData.seoTitle || formData.title,
        seoDescription: formData.seoDescription || formData.excerpt,
      };

      const url = activeBlogId ? `/api/admin/blogs/${activeBlogId}` : "/api/admin/blogs";
      const method = activeBlogId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(activeBlogId ? "Blog updated successfully!" : "Blog published successfully!");
        setIsEditing(false);
        fetchBlogs();
      } else {
        alert("Failed to save blog: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Save error: " + err.message);
    } finally {
      setSavingBlog(false);
    }
  };

  // AI Generator Trigger
  const handleRunAiGenerator = async (e) => {
    e?.preventDefault();
    if (!aiForm.topic.trim()) {
      alert("Please enter a topic or keyword for the AI generator");
      return;
    }

    setAiGenerating(true);
    try {
      const res = await fetch("/api/admin/blogs/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aiForm),
      });

      const data = await res.json();
      if (res.ok && data.success && data.blog) {
        const b = data.blog;
        setFormData((prev) => ({
          ...prev,
          title: b.title || prev.title || "",
          slug: b.slug || prev.slug || "",
          excerpt: b.excerpt || prev.excerpt || "",
          content: b.content || "",
          category: b.category || aiForm.category || prev.category,
          tags: Array.isArray(b.tags) ? b.tags.join(", ") : b.tags || prev.tags || "",
          coverImage: b.coverImage && !b.coverImage.includes("unsplash") ? b.coverImage : prev.coverImage || "",
          status: "published",
          featured: false,
          authorName: "ClosetRush Sleep Lab",
          authorRole: "Hygiene & Bedding Specialist",
          seoTitle: b.seoTitle || b.title,
          seoDescription: b.seoDescription || b.excerpt,
        }));
        setShowAiModal(false);
        setIsEditing(true);
      } else {
        alert("AI Generation failed: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      alert("Error contacting AI generator: " + err.message);
    } finally {
      setAiGenerating(false);
    }
  };

  // ----------------------------------------------------
  // RENDER: LOADING AUTH
  // ----------------------------------------------------
  if (authChecking) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF9F6] text-[#032026]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#05D4B5]" />
          <p className="text-xs font-bold tracking-widest uppercase text-gray-500">
            Checking ClosetRush Blog Permissions...
          </p>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: MASTER ADMIN PASSWORD LOCK SCREEN
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#032026] via-[#0B2022] to-[#032026] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 border border-white/10 relative overflow-hidden">
          {/* Subtle Top Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#05D4B5] to-[#1A4F54]" />

          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#FAF9F6] border-2 border-[#05D4B5]/40 flex items-center justify-center shadow-inner">
              <Lock className="w-8 h-8 text-[#032026]" />
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl font-serif font-bold text-[#032026]">ClosetRush Blog Studio</h1>
            <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider font-semibold">
              Master Admin Password Gate & AI Writer
            </p>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                Admin Master Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoFocus
                  required
                  placeholder="Enter admin master password..."
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-300 rounded-xl text-sm text-[#032026] focus:bg-white focus:outline-none focus:border-[#05D4B5] focus:ring-2 focus:ring-[#05D4B5]/20 transition"
                />
                <Key className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-gray-400 hover:text-gray-700 absolute right-3 top-3.5 font-medium"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <p className="text-[11px] text-gray-400 mt-1.5">
                Default: <code className="bg-gray-100 px-1 py-0.5 rounded text-gray-600 font-mono">closetrush@admin2026</code>
              </p>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3.5 bg-[#032026] hover:bg-[#1A4F54] text-white rounded-xl text-sm font-bold tracking-wider uppercase transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {authLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#05D4B5]" />
                  <span>Verifying Master Password...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 text-[#05D4B5]" />
                  <span>Unlock Blog Studio</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <Link href="/" className="hover:text-[#05D4B5] transition flex items-center gap-1">
              ← Return to Site
            </Link>
            <Link href="/blog" target="_blank" className="hover:text-[#05D4B5] transition flex items-center gap-1">
              View Public Blog <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // RENDER: MAIN ADMIN BLOG STUDIO
  // ----------------------------------------------------
  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#032026] flex flex-col font-sans">
      {/* STUDIO TOP HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2 text-gray-500 hover:text-black rounded-lg hover:bg-gray-100">
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold text-[#032026]">ClosetRush Blog Studio</span>
                <span className="px-2 py-0.5 bg-[#05D4B5]/15 text-teal-800 text-[10px] font-bold rounded uppercase tracking-wider">
                  Admin Passkey Active
                </span>
              </div>
              <p className="text-[11px] text-gray-500 hidden sm:block">
                AI Article Generator, MS Word-Style Rich Editor & Database Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/blog"
              target="_blank"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 hover:border-gray-400 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
            >
              <span>View Public /blog</span>
              <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
            </Link>

            {!isEditing ? (
              <button
                type="button"
                onClick={handleCreateNew}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-[#05D4B5] hover:bg-[#04bca0] text-[#032026] rounded-lg text-xs font-bold transition shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Write Blog</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-1.5 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Back to List
              </button>
            )}

            <button
              type="button"
              onClick={handleLogout}
              title="Lock Studio / Logout"
              className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* VIEW 1: BLOG EDITOR VIEW */}
      {isEditing ? (
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
          <form onSubmit={handleSaveBlog} className="space-y-6">
            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-gray-500 hover:text-black font-semibold"
                >
                  ← Cancel
                </button>
                <span className="text-gray-300">|</span>
                <span className="text-xs font-bold text-[#032026] uppercase tracking-wider">
                  {activeBlogId ? "Editing Blog Post" : "Creating New Blog Post"}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowAiModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-[#032026] text-xs font-bold rounded-lg transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>AI Generate Post</span>
                </button>

                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="bg-gray-50 border border-gray-300 text-xs font-semibold rounded-lg px-3 py-1.5 text-gray-800"
                >
                  <option value="published">Status: Published</option>
                  <option value="draft">Status: Draft</option>
                </select>

                <button
                  type="submit"
                  disabled={savingBlog}
                  className="flex items-center gap-1.5 px-5 py-2 bg-[#032026] hover:bg-[#1A4F54] text-white text-xs font-bold rounded-lg shadow-sm transition disabled:opacity-50"
                >
                  {savingBlog ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#05D4B5]" />
                  ) : (
                    <CheckCircle className="w-3.5 h-3.5 text-[#05D4B5]" />
                  )}
                  <span>{activeBlogId ? "Update Article" : "Publish Article"}</span>
                </button>
              </div>
            </div>

            {/* Post Metadata Card */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-2xs space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">
                  Article Headline / Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., The Science of Sleep: Why Changing Bedsheets Weekly Prevents Breakouts"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full text-xl sm:text-2xl font-serif font-bold text-[#032026] border-b border-gray-300 pb-2 focus:outline-none focus:border-[#05D4B5] transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-medium focus:outline-none focus:border-[#05D4B5]"
                  >
                    <option value="Bedding Care">Bedding Care</option>
                    <option value="Sleep Hygiene">Sleep Hygiene</option>
                    <option value="Rental Lifestyle">Rental Lifestyle</option>
                    <option value="Health & Wellness">Health & Wellness</option>
                    <option value="Interior Tips">Interior Tips</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">URL Slug (Auto or Custom)</label>
                  <input
                    type="text"
                    placeholder="why-dirty-bedsheets-cause-acne"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#05D4B5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tags (Comma Separated)</label>
                  <input
                    type="text"
                    placeholder="clean sheets, acne, organic cotton"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#05D4B5]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Excerpt (Meta Description)</label>
                  <textarea
                    rows={2}
                    placeholder="Brief 1-2 sentence overview for cards and search engines..."
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#05D4B5]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Featured Cover Image (Cloudinary Upload)
                  </label>
                  {formData.coverImage ? (
                    <div className="relative rounded-xl border border-gray-200 overflow-hidden bg-gray-50 p-2 flex items-center gap-3">
                      <img
                        src={formData.coverImage}
                        alt="Cover Preview"
                        className="w-20 h-14 object-cover rounded-lg border border-gray-300 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-emerald-700 truncate">
                          ✓ Cloudinary Image Attached
                        </p>
                        <p className="text-[10px] text-gray-400 font-mono truncate">
                          {formData.coverImage}
                        </p>
                      </div>
                      <label className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold cursor-pointer transition">
                        <span>{coverUploading ? "Uploading..." : "Change"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCoverImageUpload}
                          disabled={coverUploading}
                          className="sr-only"
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, coverImage: "" })}
                        className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg transition"
                        title="Remove image"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-gray-300 hover:border-[#05D4B5] rounded-xl p-3 text-center flex flex-col items-center justify-center cursor-pointer bg-gray-50/50 hover:bg-teal-50/20 transition">
                      <Upload className="w-5 h-5 text-gray-400 mb-1" />
                      <span className="text-xs font-bold text-[#1A4F54]">
                        {coverUploading ? "Uploading to Cloudinary..." : "Click to Upload Cover Image to Cloudinary"}
                      </span>
                      <span className="text-[10px] text-gray-400 mt-0.5">PNG, JPG, WEBP up to 10MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverImageUpload}
                        disabled={coverUploading}
                        className="sr-only"
                      />
                    </label>
                  )}

                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="featuredCheckbox"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      className="rounded text-[#05D4B5] focus:ring-[#05D4B5]"
                    />
                    <label htmlFor="featuredCheckbox" className="text-xs font-semibold text-gray-700 cursor-pointer">
                      ⭐ Pin as Featured Post on /blog
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* MS Word-Style Rich Text Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">
                  Article Body (MS Word 365 Architecture)
                </label>
                <span className="text-xs text-gray-400">Word-processor ribbon toolbar enabled</span>
              </div>

              <BlogWordEditor
                key={activeBlogId || "editor-session"}
                initialContent={formData.content}
                onChange={(html) => setFormData((prev) => ({ ...prev, content: html }))}
                onOpenAiGenerator={() => setShowAiModal(true)}
              />
            </div>
          </form>
        </main>
      ) : (
        /* VIEW 2: BLOGS DASHBOARD & LIST VIEW */
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Articles</p>
              <h3 className="text-2xl font-serif font-bold text-[#032026] mt-1">{stats.totalPosts}</h3>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Published</p>
              <h3 className="text-2xl font-serif font-bold text-emerald-600 mt-1">{stats.publishedPosts}</h3>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Drafts</p>
              <h3 className="text-2xl font-serif font-bold text-amber-600 mt-1">{stats.draftPosts}</h3>
            </div>
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
              <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Readers</p>
              <h3 className="text-2xl font-serif font-bold text-[#1A4F54] mt-1">{stats.totalViews}</h3>
            </div>
          </div>


          {/* Filter & Search Controls */}
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search articles by title or keyword..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:outline-none focus:border-[#05D4B5]"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-xs font-semibold rounded-lg text-gray-800"
              >
                Search
              </button>
            </form>

            <div className="flex items-center gap-2">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Drafts</option>
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white"
              >
                <option value="all">All Categories</option>
                <option value="Bedding Care">Bedding Care</option>
                <option value="Sleep Hygiene">Sleep Hygiene</option>
                <option value="Rental Lifestyle">Rental Lifestyle</option>
                <option value="Health & Wellness">Health & Wellness</option>
                <option value="Interior Tips">Interior Tips</option>
              </select>

              <button
                type="button"
                onClick={fetchBlogs}
                className="p-1.5 text-gray-500 hover:text-black border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Blogs Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            {loadingBlogs ? (
              <div className="p-12 text-center text-gray-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#05D4B5] mb-2" />
                <p className="text-xs">Loading articles...</p>
              </div>
            ) : blogs.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <BookOpen className="w-10 h-10 mx-auto text-gray-300" />
                <h3 className="text-sm font-bold text-gray-700">No blog articles published yet</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Click &quot;AI Generator&quot; or &quot;Write Blog&quot; in the header to create your article.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4">Article</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Reads / Views</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {blogs.map((blog) => (
                      <tr key={blog._id} className="hover:bg-gray-50/70 transition">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={blog.coverImage || "/banner_1.png"}
                              alt={blog.title}
                              className="w-12 h-10 object-cover rounded-md border border-gray-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-bold text-gray-900 truncate max-w-md">{blog.title}</h4>
                                {blog.featured && (
                                  <span className="bg-amber-100 text-amber-800 text-[9px] font-bold px-1.5 py-0.2 rounded shrink-0">
                                    FEATURED
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-gray-400 font-mono truncate">/blog/{blog.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded text-[10px] font-bold">
                            {blog.category}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              blog.status === "published"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-gray-100 text-gray-600 border border-gray-200"
                            }`}
                          >
                            {blog.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 font-semibold">{blog.views || 0}</td>
                        <td className="py-3 px-4 text-gray-500 text-[11px]">
                          {new Date(blog.createdAt).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Link
                              href={`/blog/${blog.slug}`}
                              target="_blank"
                              className="p-1.5 text-gray-400 hover:text-[#05D4B5] transition"
                              title="View Public Article"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleEditBlog(blog)}
                              className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded"
                              title="Edit in Word Studio"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteBlog(blog._id, blog.title)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      )}

      {/* MODAL: AI BLOG GENERATOR */}
      {showAiModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95 border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#032026] to-[#1A4F54] flex items-center justify-center text-[#05D4B5]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">AI Blog Article Generator</h3>
                  <p className="text-[11px] text-gray-500">Generates full SEO article, tables, & FAQs</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAiModal(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRunAiGenerator} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Article Topic or Keyword *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., How often should you change bedsheets for clear skin?"
                  value={aiForm.topic}
                  onChange={(e) => setAiForm({ ...aiForm, topic: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#05D4B5]"
                />
              </div>

              {/* Quick Preset Topics */}
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Or pick a popular suggested topic:
                </p>
                <div className="space-y-1">
                  {PRESET_TOPICS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() =>
                        setAiForm({
                          ...aiForm,
                          topic: preset.topic,
                          category: preset.category,
                          tone: preset.tone,
                        })
                      }
                      className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-gray-100 text-[11px] text-gray-700 flex items-center justify-between transition"
                    >
                      <span className="truncate">{preset.topic}</span>
                      <span className="text-[9px] text-teal-700 font-bold ml-2 shrink-0">{preset.category}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Category</label>
                  <select
                    value={aiForm.category}
                    onChange={(e) => setAiForm({ ...aiForm, category: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-[#05D4B5]"
                  >
                    <option value="Bedding Care">Bedding Care</option>
                    <option value="Sleep Hygiene">Sleep Hygiene</option>
                    <option value="Rental Lifestyle">Rental Lifestyle</option>
                    <option value="Health & Wellness">Health & Wellness</option>
                    <option value="Interior Tips">Interior Tips</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Tone of Voice</label>
                  <select
                    value={aiForm.tone}
                    onChange={(e) => setAiForm({ ...aiForm, tone: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-[#05D4B5]"
                  >
                    <option value="Engaging & Informative">Engaging & Informative</option>
                    <option value="Authoritative Expert">Authoritative Expert</option>
                    <option value="Actionable Guide">Actionable Guide</option>
                    <option value="Luxury Lifestyle">Luxury Lifestyle</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Article Length</label>
                  <select
                    value={aiForm.length}
                    onChange={(e) => setAiForm({ ...aiForm, length: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs bg-white focus:outline-none focus:border-[#05D4B5]"
                  >
                    <option value="short">Quick Read (~600 words)</option>
                    <option value="medium">Standard Article (~1200 words)</option>
                    <option value="deep-dive">Comprehensive Guide (~1800+ words)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Target Keywords</label>
                  <input
                    type="text"
                    placeholder="e.g., bedsheet rental, acne"
                    value={aiForm.customKeywords}
                    onChange={(e) => setAiForm({ ...aiForm, customKeywords: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#05D4B5]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAiModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={aiGenerating}
                  className="px-5 py-2 bg-gradient-to-r from-[#032026] to-[#1A4F54] hover:from-[#1A4F54] hover:to-[#05D4B5] text-white rounded-lg text-xs font-bold transition shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {aiGenerating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#05D4B5]" />
                      <span>Generating with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-[#05D4B5]" />
                      <span>Generate Full Article</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
