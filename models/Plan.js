import mongoose from "mongoose";

const PlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    tier: {
      type: String,
      default: "Normal",
    },
    bedType: {
      type: String, // "single" | "double" | "corporate"
      required: true,
      trim: true,
    },
    sheetsPerMonth: {
      type: Number, // 1 | 2 | 4
      required: true,
    },
    monthlyRate: {
      type: Number, // MRP for the month
      required: true,
    },
    depositAmount: {
      type: Number, // Security deposit
      required: true,
    },
    price: {
      type: Number,
    },
    securityDeposit: {
      type: Number,
    },
    duration: {
      type: String,
      default: "1 Month",
    },
    features: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Plan || mongoose.model("Plan", PlanSchema);


