import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import Plan from "@/models/Plan";
import DurationDiscount from "@/models/DurationDiscount";

export async function GET() {
  try {
    await dbConnect();

    // Fetch the pristine data from the new schema
    const rawPlans = await Plan.find({}).lean();
    const rawDiscounts = await DurationDiscount.find({}).sort({ durationMonths: 1 }).lean();

    // If database isn't seeded correctly, return empty instead of crashing
    if (!rawPlans || rawPlans.length === 0) {
      return NextResponse.json({ success: true, plans: [] }, { headers: { "Cache-Control": "no-store, max-age=0" } });
    }

    const normalizedPlans = rawPlans.map(plan => {
      const isSingle = (plan.bedType || "").toLowerCase().includes("single");
      const bedTypeLabel = `Bedsheet + Pillow (${isSingle ? "Single" : "Double"})`;
      const sizeLabel = isSingle ? "6x3 ft" : "6x5 ft";
      const monthlyRate = plan.monthlyRate !== undefined ? plan.monthlyRate : (plan.price || 100);
      const depositAmount = plan.depositAmount !== undefined ? plan.depositAmount : (plan.securityDeposit || 0);

      return {
        _id: plan._id.toString(),
        name: plan.name || `${plan.sheetsPerMonth || 1} Bed Sheet / Month`,
        tier: plan.tier || "Normal",
        bedType: bedTypeLabel,
        bedTypeRaw: isSingle ? "single" : "double",
        sheetsPerMonth: Number(plan.sheetsPerMonth) || 1,
        monthlyRate: Number(monthlyRate),
        depositAmount: Number(depositAmount),
        price: Number(monthlyRate),
        securityDeposit: Number(depositAmount),
        size: sizeLabel,
        duration: plan.duration || "1 Month",
        features: plan.features && plan.features.length > 0 ? plan.features : [
          "Clean Bedsheet Swaps",
          "Premium 400 TC Cotton",
          "Free Doorstep Logistics"
        ],
        cta: "Choose Plan"
      };
    });

    return NextResponse.json({ success: true, plans: normalizedPlans }, {
      headers: {
        "Cache-Control": "no-store, max-age=0"
      }
    });
  } catch (error) {
    console.error("Fetch plans error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
