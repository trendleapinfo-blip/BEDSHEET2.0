import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email address is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    mobile: {
      type: String,
      trim: true,
      // Sparse index allows multiple nulls/undefined values for users registering via Google OAuth
      sparse: true,
      unique: true,
    },
    password: {
      type: String,
      // Required only if not registering via Google OAuth
      required: function () {
        return !this.googleId;
      },
    },
    address: {
      type: String,
      trim: true,
    },
    city: {
      type: String,
      trim: true,
    },
    pincode: {
      type: String,
      trim: true,
    },
    accountType: {
      type: String,
      enum: ["Individual User", "Commercial Partner"],
      default: "Individual User",
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
    },
    role: {
      type: String,
      enum: ["user", "admin", "warehouse", "logistics"],
      default: "user",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
    selectedPlan: {
      bedType: { type: String },
      planName: { type: String },
      sheetsPerMonth: { type: Number },
      price: { type: Number },
      duration: { type: String },
      subscriptionType: { type: String, enum: ["monthly", "weekly"], default: "monthly" },
      securityDeposit: { type: Number, default: 0 },
      gst: { type: Number, default: 0 },
      totalPrice: { type: Number, default: 0 },
      startDate: { type: Date, default: Date.now },
      endDate: { type: Date },
      lastSwapDate: { type: Date },
      isCustom: { type: Boolean, default: false },
      color: { type: String },
      fabric: { type: String },
      print: { type: String },
      couponCode: { type: String, default: null },
      discount: { type: Number, default: 0 },
      isPaused: { type: Boolean, default: false },
      pausedAt: { type: Date },
      pausedUntil: { type: Date },
      pauseDuration: { type: String },
      pauseAction: { type: String },
      orderType: { type: String, enum: ["RENT", "BUY"], default: "RENT" },
      itemTier: { type: String, enum: ["BASIC", "PREMIUM"], default: "BASIC" },
    },
    hasPaidDeposit: {
      type: Boolean,
      default: false,
    },
    referredByCode: {
      type: String,
      trim: true,
      uppercase: true,
    },
    partnerLinkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PartnerLink",
    },
    pushSubscriptions: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

// Ensure compilation matches across Next.js API reloads
export default mongoose.models.User || mongoose.model("User", UserSchema);
