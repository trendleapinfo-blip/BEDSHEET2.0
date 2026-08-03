import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    bundleOrderId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    userId: {
      type: String,
      trim: true,
    },
    userName: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
    },
    bundleName: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      default: "—",
    },
    finalPrice: {
      type: Number,
      required: true,
    },
    planId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plan',
    },
    durationMonths: {
      type: Number,
    },
    calculatedRent: {
      type: Number,
    },
    depositCharged: {
      type: Number,
    },
    gst: {
      type: Number,
      default: 0,
    },
    depositStatus: {
      type: String,
      default: "PENDING",
    },
    subscriptionStatus: {
      type: String,
      default: "PENDING",
    },
    totalAmount: {
      type: Number,
    },
    wmsBundleId: {
      type: String,
      trim: true,
    },
    dispatchedAt: {
      type: Date,
    },
    dispatchStatus: {
      type: String,
      default: "DISPATCHED",
    },
    couponCode: {
      type: String,
      default: null,
      trim: true,
    },
    discount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "CANCELLED", "PENDING", "DELIVERED", "EXPIRED"],
      default: "ACTIVE",
    },
    swapCycle: {
      type: String,
      default: "Monthly Swap",
    },
    paymentStyle: {
      type: String,
      default: "Monthly",
    },
    orderCategory: {
      type: String,
      enum: ["B2C", "B2B"],
      default: "B2C",
    },
    frequency: {
      type: String,
      enum: ["ALL_AT_ONCE", "WEEKLY_SWAP", "MONTHLY_SWAP"],
      default: "ALL_AT_ONCE",
    },
    agreementSignedAt: {
      type: Date,
    },
    agreementSignedBy: {
      type: String,
      trim: true,
    },
    orderType: {
      type: String,
      enum: ["RENT", "BUY"],
      default: "RENT",
    },
    itemTier: {
      type: String,
      enum: ["BASIC", "PREMIUM"],
      default: "BASIC",
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
    },
    deliveryAddress: {
      type: String,
      trim: true,
    },
    razorpayPaymentId: {
      type: String,
      trim: true,
    },
    razorpayOrderId: {
      type: String,
      trim: true,
    },
    lastSwapDate: {
      type: Date,
    },
    swapCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
