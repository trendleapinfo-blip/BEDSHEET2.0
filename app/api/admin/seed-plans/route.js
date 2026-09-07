import { NextResponse } from "next/server";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import Plan from "@/models/Plan";

export async function GET(request) {
  try {
    await dbConnect();

    // Clear mongoose cache for hot-reload
    delete mongoose.models.Plan;

    // Delete old plans only
    await Plan.deleteMany({});

    // Seed 6 new plans
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

    const inserted = await Plan.insertMany(newPlans);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${inserted.length} plans into database!`,
      plans: inserted
    });
  } catch (error) {
    console.error("Seed Plans Only Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
