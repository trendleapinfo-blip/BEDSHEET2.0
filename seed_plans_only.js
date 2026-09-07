const mongoose = require("mongoose");
require("dotenv").config({ path: ".env.local" });
require("dotenv").config();

const MONGO_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/close";

const PlanSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    tier: { type: String, default: "Normal" },
    bedType: { type: String, required: true, enum: ["single", "double"] },
    sheetsPerMonth: { type: Number, required: true },
    monthlyRate: { type: Number, required: true },
    depositAmount: { type: Number, required: true },
    duration: { type: String, default: "1 Month" },
    features: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Plan = mongoose.models.Plan || mongoose.model("Plan", PlanSchema);

async function seedPlansOnly() {
  try {
    console.log("Connecting to MongoDB...", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("Connected successfully.");

    console.log("Deleting OLD pricing plans from MongoDB...");
    const deleteResult = await Plan.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} old plans.`);

    console.log("Inserting NEW 6 pricing plans into MongoDB...");
    const newPlans = [
      // Single Bed Sheet Plans
      {
        name: "1 Bed Sheet / Month",
        tier: "Normal",
        bedType: "single",
        sheetsPerMonth: 1,
        monthlyRate: 100,
        depositAmount: 200,
        duration: "1 Month",
        features: [
          "1 Clean Single Bedsheet per month",
          "Refundable Security Deposit: ₹200",
          "Free Doorstep Delivery & Swaps"
        ]
      },
      {
        name: "2 Bed Sheets / Month",
        tier: "Normal",
        bedType: "single",
        sheetsPerMonth: 2,
        monthlyRate: 200,
        depositAmount: 350,
        duration: "1 Month",
        features: [
          "2 Clean Single Bedsheets per month",
          "Refundable Security Deposit: ₹350",
          "Free Doorstep Delivery & Swaps"
        ]
      },
      {
        name: "4 Bed Sheets / Month",
        tier: "Normal",
        bedType: "single",
        sheetsPerMonth: 4,
        monthlyRate: 800,
        depositAmount: 800,
        duration: "1 Month",
        features: [
          "4 Clean Single Bedsheets per month",
          "Refundable Security Deposit: ₹800",
          "Free Doorstep Delivery & Swaps"
        ]
      },
      // Double Bed Sheet Plans
      {
        name: "1 Bed Sheet / Month",
        tier: "Normal",
        bedType: "double",
        sheetsPerMonth: 1,
        monthlyRate: 200,
        depositAmount: 400,
        duration: "1 Month",
        features: [
          "1 Clean Double Bedsheet set per month",
          "Refundable Security Deposit: ₹400",
          "Free Doorstep Delivery & Swaps"
        ]
      },
      {
        name: "2 Bed Sheets / Month",
        tier: "Normal",
        bedType: "double",
        sheetsPerMonth: 2,
        monthlyRate: 400,
        depositAmount: 650,
        duration: "1 Month",
        features: [
          "2 Clean Double Bedsheet sets per month",
          "Refundable Security Deposit: ₹650",
          "Free Doorstep Delivery & Swaps"
        ]
      },
      {
        name: "4 Bed Sheets / Month",
        tier: "Normal",
        bedType: "double",
        sheetsPerMonth: 4,
        monthlyRate: 800,
        depositAmount: 800,
        duration: "1 Month",
        features: [
          "4 Clean Double Bedsheet sets per month",
          "Refundable Security Deposit: ₹800",
          "Free Doorstep Delivery & Swaps"
        ]
      }
    ];

    const insertedPlans = await Plan.insertMany(newPlans);
    console.log(`Successfully inserted ${insertedPlans.length} new plans into MongoDB!`);
    console.log("Newly seeded plans:");
    insertedPlans.forEach((p, idx) => {
      console.log(`${idx + 1}. [${p.bedType.toUpperCase()}] ${p.name} - MRP: ₹${p.monthlyRate}, Deposit: ₹${p.depositAmount}`);
    });
  } catch (error) {
    console.error("Error seeding plans:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB disconnected.");
  }
}

seedPlansOnly();
