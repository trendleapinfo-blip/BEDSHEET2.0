import mongoose from "mongoose";

const PartnerLinkSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Partner / PG Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Partner / PG Email is required"],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    code: {
      type: String,
      required: [true, "Unique Referral Code is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    targetUrl: {
      type: String,
      default: "/",
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["ACTIVE", "INACTIVE"],
      default: "ACTIVE",
    },
    clicks: {
      type: Number,
      default: 0,
    },
    signups: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        name: { type: String, default: "" },
        email: { type: String, lowercase: true, trim: true },
        signedUpAt: { type: Date, default: Date.now },
      },
    ],
    orders: [
      {
        orderId: { type: String, trim: true },
        userId: { type: String, trim: true },
        userEmail: { type: String, lowercase: true, trim: true },
        bundleName: { type: String, trim: true },
        amount: { type: Number, default: 0 },
        orderType: { type: String, default: "RENT" },
        status: { type: String, default: "ACTIVE" },
        orderedAt: { type: Date, default: Date.now },
      },
    ],
    totalRevenue: {
      type: Number,
      default: 0,
    },
    commissionRate: {
      type: Number,
      default: 10, // Default 10% commission on orders
    },
    discountPercent: {
      type: Number,
      default: 10, // Default 10% discount for customer using referral code
    },
    commissionPaid: {
      type: Number,
      default: 0,
    },
    payouts: [
      {
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        reference: { type: String, default: "" }, // UPI Ref / Txn ID
        notes: { type: String, default: "" },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.models.PartnerLink || mongoose.model("PartnerLink", PartnerLinkSchema);
