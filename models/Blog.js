import mongoose from "mongoose";

const BlogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    excerpt: {
      type: String,
      trim: true,
      default: "",
    },
    content: {
      type: String,
      required: [true, "Blog content is required"],
    },
    coverImage: {
      type: String,
      default: "/logo.png",
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      default: "Bedding Care",
      trim: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    author: {
      name: {
        type: String,
        default: "ClosetRush Sleep Lab",
      },
      role: {
        type: String,
        default: "Hygiene & Bedding Specialist",
      },
      avatar: {
        type: String,
        default: "/logo.png",
      },
    },
    status: {
      type: String,
      enum: ["published", "draft"],
      default: "published",
      index: true,
    },
    readTime: {
      type: String,
      default: "5 min read",
    },
    views: {
      type: Number,
      default: 0,
    },
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },
    seoTitle: {
      type: String,
      default: "",
      trim: true,
    },
    seoDescription: {
      type: String,
      default: "",
      trim: true,
    },
    seoKeywords: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

// Search index on title, excerpt, and category
BlogSchema.index({ title: "text", excerpt: "text", category: "text" });

export default mongoose.models.Blog || mongoose.model("Blog", BlogSchema);
