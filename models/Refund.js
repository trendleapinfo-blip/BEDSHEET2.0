import mongoose from "mongoose";

const RefundSchema = new mongoose.Schema(
  {
    orderId: {
      type: String,
      trim: true,
    },
    userId: {
      type: String,
      required: true,
      trim: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    userPhone: {
      type: String,
      trim: true,
    },
    planName: {
      type: String,
      required: true,
      trim: true,
    },
    depositAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ["PENDING", "REFUNDED", "REJECTED"],
      default: "PENDING",
    },
    cancelledAt: {
      type: Date,
      default: Date.now,
    },
    refundedAt: {
      type: Date,
    },
    transactionId: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Refund || mongoose.model("Refund", RefundSchema);
