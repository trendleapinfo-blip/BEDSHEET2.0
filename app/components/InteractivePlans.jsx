"use client";

import React, { useState, useEffect } from "react";
import {
  BedIcon,
  CrownIcon,
  TruckIcon,
  SparklesIcon,
  CancelIcon,
  CheckIcon,
  ArrowRightIcon,
  StarIcon,
} from "./Icons";

const CUSTOMIZATION_PRICING = {
  colors: {
    "Classic White": 0,
    "Deep Teal": 100,
    "Linen Gold": 150,
    "Slate Gray": 120,
    "Lavender Mist": 130
  },
  colorsHex: {
    "Classic White": "#FFFFFF",
    "Deep Teal": "#245c77",
    "Linen Gold": "#A89276",
    "Slate Gray": "#64748B",
    "Lavender Mist": "#E9E3FF"
  },
  fabrics: {
    "400 TC Organic Cotton": 0,
    "600 TC Egyptian Cotton": 250,
    "Organic Bamboo Linen": 350,
    "Mulberry Silk Blend": 500
  },
  prints: {
    "Solid / Minimalist": 0,
    "Classic Stripes": 100,
    "Modern Geometric": 120,
    "Floral Bloom": 150
  }
};

export default function InteractivePlans({ handleSelectPlan, submittingPlan }) {
  const [orderType, setOrderType] = useState("RENT"); // 'RENT' | 'BUY'
  const [buySize, setBuySize] = useState("single"); // 'single' | 'double'
  const [buyColor, setBuyColor] = useState("Classic White");

  const [selectedSuite, setSelectedSuite] = useState("atelier"); // 'atelier' (Single) | 'residence' (Double) | 'corporate' | 'custom'
  const [selectedSheets, setSelectedSheets] = useState(1); // 1 | 2 | 4 sheets per month
  const [selectedDuration, setSelectedDuration] = useState("1 Month");
  const [customBedType, setCustomBedType] = useState("single");
  const [customColor, setCustomColor] = useState("Classic White");
  const [customFabric, setCustomFabric] = useState("400 TC Organic Cotton");
  const [customPrint, setCustomPrint] = useState("Solid / Minimalist");

  const [dbPlansList, setDbPlansList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPlans() {
      try {
        const res = await fetch("/api/plans");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.plans) {
            setDbPlansList(data.plans);
          }
        }
      } catch (err) {
        console.error("Failed to fetch dynamic plans:", err);
      } finally {
        setLoading(false);
      }
    }
    loadPlans();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-charcoal-ink mx-auto" />
      </div>
    );
  }

  // Helper to find specific plan by bedType and sheetsPerMonth
  const getActivePlan = (bedType, sheets) => {
    const isSingle = bedType === "single" || bedType === "atelier";
    const targetBed = isSingle ? "single" : "double";
    
    const matched = dbPlansList.find(
      p => (p.bedTypeRaw === targetBed || (p.bedType && p.bedType.toLowerCase().includes(targetBed))) &&
           (p.sheetsPerMonth === sheets)
    );

    if (matched) return matched;

    // Fallback defaults matching requested pricing
    if (isSingle) {
      if (sheets === 2) return { name: "2 Bed Sheets / Month", price: 200, securityDeposit: 350, sheetsPerMonth: 2, bedTypeRaw: "single" };
      if (sheets === 4) return { name: "4 Bed Sheets / Month", price: 800, securityDeposit: 800, sheetsPerMonth: 4, bedTypeRaw: "single" };
      return { name: "1 Bed Sheet / Month", price: 100, securityDeposit: 200, sheetsPerMonth: 1, bedTypeRaw: "single" };
    } else {
      if (sheets === 2) return { name: "2 Bed Sheets / Month", price: 400, securityDeposit: 650, sheetsPerMonth: 2, bedTypeRaw: "double" };
      if (sheets === 4) return { name: "4 Bed Sheets / Month", price: 800, securityDeposit: 800, sheetsPerMonth: 4, bedTypeRaw: "double" };
      return { name: "1 Bed Sheet / Month", price: 200, securityDeposit: 400, sheetsPerMonth: 1, bedTypeRaw: "double" };
    }
  };

  // Resolve the dynamic selected plan based on Suite and Sheets count
  const getSelectedPlanData = () => {
    if (orderType === "BUY") {
      const baseBuyPrice = buySize === "single" ? 200 : 350;
      return {
        orderType: "BUY",
        itemTier: "BASIC",
        bedType: buySize,
        planName: `${buySize === "single" ? "Single Bed" : "Double Bed"} Sheets (Purchase)`,
        price: baseBuyPrice,
        securityDeposit: 0,
        duration: "One-Time Purchase",
        title: `${buySize === "single" ? "Single Bed Set" : "Double Bed Set"}`,
        subtitle: `Buy and own permanently. No swap cycles or security deposits.`,
        cottonType: "Standard Bedding Weave",
        frequency: "One-Time Delivery",
        image: buySize === "single" ? "/hero_bedding.png" : "/about_bedding.png",
        cta: "Buy Bedding Set",
        color: buyColor,
        isCustom: false
      };
    }

    if (selectedSuite === "corporate") {
      return {
        name: "Business Plan",
        subtitle: "For hotels, Airbnbs, or shared rooms.",
        price: "Custom Quote",
        securityDeposit: 0,
        duration: "Custom Schedule",
        cottonType: "Strong Business Cotton",
        frequency: "Flexible Deliveries",
        cta: "Call Us to Order"
      };
    }

    const bedKey = selectedSuite === "atelier" ? "single" : "double";
    const currentActivePlan = getActivePlan(bedKey, selectedSheets);

    const activePrice = currentActivePlan.price !== undefined && currentActivePlan.price !== null
      ? Number(currentActivePlan.price)
      : Number(currentActivePlan.monthlyRate || 0);

    const activeDeposit = currentActivePlan.depositAmount !== undefined && currentActivePlan.depositAmount !== null
      ? Number(currentActivePlan.depositAmount)
      : (currentActivePlan.securityDeposit !== undefined && currentActivePlan.securityDeposit !== null
        ? Number(currentActivePlan.securityDeposit)
        : 0);

    return {
      bedType: bedKey,
      planName: currentActivePlan.name,
      price: activePrice,
      securityDeposit: activeDeposit,
      totalPrice: activePrice + activeDeposit,
      duration: "1 Month",
      sheetsPerMonth: currentActivePlan.sheetsPerMonth,
      title: bedKey === "single" ? "Single Bed Subscription" : "Double Bed Subscription",
      subtitle: bedKey === "single" ? "Sanitized single bedsheets delivered on autopilot." : "Sanitized double bedsheets delivered on autopilot.",
      cottonType: "100% Super Soft Clean Cotton",
      frequency: `${currentActivePlan.sheetsPerMonth} Clean Bedsheet Swap${currentActivePlan.sheetsPerMonth > 1 ? 's' : ''} per Month`,
      image: bedKey === "single" ? "/hero_bedding.png" : "/about_bedding.png",
      cta: `Select ${currentActivePlan.name}`,
      itemTier: "BASIC",
      orderType: "RENT",
      features: currentActivePlan.features || []
    };
  };

  const currentPlan = getSelectedPlanData();

  const handleReserve = () => {
    if (orderType === "BUY") {
      handleSelectPlan({
        orderType: "BUY",
        itemTier: currentPlan.itemTier,
        bedType: currentPlan.bedType,
        planName: currentPlan.planName,
        price: currentPlan.price,
        securityDeposit: 0,
        duration: currentPlan.duration,
        color: currentPlan.color,
        isCustom: false
      });
      return;
    }

    if (selectedSuite === "corporate") {
      handleSelectPlan({
        orderType: "RENT",
        bedType: "corporate",
        planName: "Corporate Plan",
        price: 0,
        duration: "Custom"
      });
      return;
    }

    handleSelectPlan({
      orderType: "RENT",
      itemTier: "BASIC",
      bedType: currentPlan.bedType,
      planName: currentPlan.planName,
      sheetsPerMonth: currentPlan.sheetsPerMonth,
      price: currentPlan.price,
      securityDeposit: currentPlan.securityDeposit,
      totalPrice: currentPlan.totalPrice,
      duration: "1 Month"
    });
  };


  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-16 font-sans">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <p className="text-micro-label">Our Plans</p>
        <h2 className="text-section-header">Choose Your Bedding.</h2>
        <p className="text-body text-charcoal-ink/65">
          Pick whether you want to subscribe to a rental cleaning plan or purchase the bedding set permanently.
        </p>
      </div>

      {/* Rent vs Buy Toggle */}
      <div className="flex justify-center">
        <div className="bg-charcoal-ink/05 p-1.5 rounded-none border border-charcoal-ink/10 flex gap-2">
          <button
            onClick={() => setOrderType("RENT")}
            className={`px-8 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 rounded-none cursor-pointer border-none outline-none ${
              orderType === "RENT"
                ? "bg-charcoal-ink text-white shadow-md"
                : "text-charcoal-ink/60 hover:text-charcoal-ink bg-transparent"
            }`}
          >
            Rent (Clean Sheet Swaps)
          </button>
          <button
            onClick={() => setOrderType("BUY")}
            className={`px-8 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-300 rounded-none cursor-pointer border-none outline-none ${
              orderType === "BUY"
                ? "bg-charcoal-ink text-white shadow-md"
                : "text-charcoal-ink/60 hover:text-charcoal-ink bg-transparent"
            }`}
          >
            Buy & Own (One-Time Purchase)
          </button>
        </div>
      </div>
 
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Suite Selectors */}
        <div className="lg:col-span-5 space-y-4">
          {(orderType === "RENT" ? [
            {
              id: "atelier",
              num: "01",
              title: "Single Bed Plan",
              desc: "Clean sheets for one person.",
            },
            {
              id: "residence",
              num: "02",
              title: "Double Bed Plan",
              desc: "Clean sheets for couples or larger beds.",
            },
            {
              id: "corporate",
              num: "03",
              title: "Business Plan",
              desc: "For hotels, Airbnbs, or shared rooms.",
            },
            {
              id: "custom",
              num: "04",
              title: "Design Your Plan",
              desc: "Pick your own colors, fabrics, and prints.",
            },
          ] : [
            {
              id: "single",
              num: "01",
              title: "Single Bed Set",
              desc: "Buy single bedsheets permanently.",
            },
            {
              id: "double",
              num: "02",
              title: "Double Bed Set",
              desc: "Buy double bedsheets permanently.",
            }
          ]).map((suite) => (
            <button
              key={suite.id}
              onClick={() => {
                if (orderType === "RENT") {
                  setSelectedSuite(suite.id);
                  if (suite.id !== "corporate") {
                    setSelectedDuration("6 Months"); // reset to default professional duration
                  }
                } else {
                  setBuySize(suite.id);
                }
              }}
              className={`w-full text-left p-6 border transition-all duration-300 flex items-start gap-6 cursor-pointer rounded-none ${
                (orderType === "RENT" ? selectedSuite === suite.id : buySize === suite.id)
                  ? "bg-charcoal-ink text-alabaster-linen border-charcoal-ink shadow-md"
                  : "bg-white text-charcoal-ink border-charcoal-ink/08 hover:border-charcoal-ink/20"
              }`}
            >
              <span className={`font-serif text-lg font-bold ${
                (orderType === "RENT" ? selectedSuite === suite.id : buySize === suite.id) 
                  ? "text-linen-gold" 
                  : "text-charcoal-ink/40"
              }`}>
                {suite.num}
              </span>
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold uppercase tracking-wider">{suite.title}</h4>
                <p className={`text-2xs ${
                  (orderType === "RENT" ? selectedSuite === suite.id : buySize === suite.id)
                    ? "text-alabaster-linen/70"
                    : "text-charcoal-ink/50"
                }`}>
                  {suite.desc}
                </p>
              </div>
            </button>
          ))}
 
          {/* Value note */}
          <div className="p-6 border border-linen-gold/20 bg-linen-gold/05 space-y-2">
            <span className="text-2xs font-extrabold text-linen-gold uppercase tracking-wider flex items-center gap-1.5">
              <CrownIcon className="w-3.5 h-3.5" /> {orderType === "RENT" ? "Guaranteed Fresh Sleep" : "Premium Bedding Quality"}
            </span>
            <p className="text-3xs text-charcoal-ink/60 leading-relaxed uppercase tracking-wider">
              {orderType === "RENT" 
                ? "Every plan includes hot washing, germ-killing treatment, and delivery to your door."
                : "Own hotel-grade organic long-staple cotton sheets permanently."}
            </p>
          </div>
        </div>

        {/* Right Column: Suite Details Dashboard */}
        <div className="lg:col-span-7 bg-white border border-charcoal-ink/08 p-8 space-y-8">
          {orderType === "BUY" ? (
            <div className="space-y-6">
              {/* Buy Title and Sub */}
              <div className="space-y-2 border-b border-charcoal-ink/08 pb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold uppercase tracking-wider text-charcoal-ink">
                    Buy & Own: {buySize === "single" ? "Single Bed Sheets" : "Double Bed Sheets"}
                  </h3>
                  <span className="text-2xs font-bold bg-[#B2905F]/10 text-[#B2905F] px-2.5 py-1 uppercase tracking-wider">
                    One-Time Purchase
                  </span>
                </div>
                <p className="text-xs text-charcoal-ink/60 leading-relaxed">
                  Purchase a premium organic cotton bedsheet set permanently. No returns or swap schedules required.
                </p>
              </div>
              {/* Step 1: Choose Color */}
              <div className="space-y-3">
                <span className="text-3xs uppercase tracking-widest text-charcoal-ink/40 font-bold block">
                  Step 1: Choose Color
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {Object.entries(CUSTOMIZATION_PRICING.colors).map(([colorName, colorPrice]) => (
                    <button
                      key={colorName}
                      onClick={() => setBuyColor(colorName)}
                      className={`p-2.5 border flex flex-col items-center justify-between gap-2 text-center transition-all cursor-pointer h-20 rounded-none ${
                        buyColor === colorName
                          ? "border-[#245c77] bg-[#245c77]/05 ring-1 ring-[#245c77]"
                          : "border-charcoal-ink/08 bg-white hover:border-charcoal-ink/20"
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-slate-350"
                        style={{ backgroundColor: CUSTOMIZATION_PRICING.colorsHex[colorName] }}
                      />
                      <div>
                        <span className="text-[8px] font-extrabold uppercase tracking-tight block truncate w-full max-w-[80px]">
                          {colorName}
                        </span>
                        <span className="text-[8px] text-[#245c77] font-bold">
                          Free
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Specs display for Buy */}
              <div className="bg-[#B2905F]/05 border border-[#B2905F]/10 p-5 rounded-none space-y-2 text-xs">
                <span className="text-[10px] uppercase tracking-widest text-[#B2905F] font-extrabold block">
                  Delivery Inclusions
                </span>
                <p className="text-charcoal-ink/70 font-semibold leading-relaxed">
                  {buySize === "single" 
                    ? "Includes: 1 Single Bedsheet + 1 Pillow Cover (Vacuum Sealed Shield)." 
                    : "Includes: 1 Double Bedsheet + 2 Pillow Covers (Vacuum Sealed Shield)."}
                </p>
              </div>

            </div>
          ) : selectedSuite === "custom" ? (
            <div className="space-y-6">
              {/* Suite Title and Sub */}
              <div className="space-y-2 border-b border-charcoal-ink/08 pb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold uppercase tracking-wider text-charcoal-ink">
                    Design Your Plan
                  </h3>
                  <span className="text-2xs font-bold bg-[#245c77]/10 text-[#245c77] px-2.5 py-1 uppercase tracking-wider">
                    Custom Bed Setup
                  </span>
                </div>
                <p className="text-xs text-charcoal-ink/60 leading-relaxed">
                  Pick your size, time length, colors, fabric type, and print styles to design sheets you love.
                </p>
              </div>
 
              {/* Step 1: Base Bed Size */}
              <div className="space-y-3">
                <span className="text-3xs uppercase tracking-widest text-charcoal-ink/40 font-bold block">
                  Step 1: Pick Your Bed Size
                </span>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setCustomBedType("single")}
                    className={`p-4 border flex items-center gap-3 transition-all cursor-pointer rounded-none ${
                      customBedType === "single"
                        ? "border-[#245c77] bg-[#245c77]/05 text-[#245c77] ring-1 ring-[#245c77]"
                        : "border-charcoal-ink/08 bg-white text-charcoal-ink hover:border-charcoal-ink/20"
                    }`}
                  >
                    <BedIcon className="w-5 h-5 text-[#245c77]" />
                    <div className="text-left">
                      <span className="text-2xs font-extrabold uppercase tracking-wider block">Single Bed</span>
                      <span className="text-[10px] opacity-60">Single Bed base</span>
                    </div>
                  </button>
 
                  <button
                    onClick={() => setCustomBedType("double")}
                    className={`p-4 border flex items-center gap-3 transition-all cursor-pointer rounded-none ${
                      customBedType === "double"
                        ? "border-[#245c77] bg-[#245c77]/05 text-[#245c77] ring-1 ring-[#245c77]"
                        : "border-charcoal-ink/08 bg-white text-charcoal-ink hover:border-charcoal-ink/20"
                    }`}
                  >
                    <BedIcon className="w-5 h-5 text-[#245c77]" />
                    <div className="text-left">
                      <span className="text-2xs font-extrabold uppercase tracking-wider block">Double Bed</span>
                      <span className="text-[10px] opacity-60">Double Bed base</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Step 2: Subscription Duration */}
              <div className="space-y-3">
                <span className="text-3xs uppercase tracking-widest text-charcoal-ink/40 font-bold block">
                  Step 2: Choose How Many Months
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { duration: "1 Month", discount: null },
                    { duration: "3 Months", discount: "5% off" },
                    { duration: "6 Months", discount: "10% off" },
                    { duration: "12 Months", discount: "20% off" }
                  ].map((item) => (
                    <button
                      key={item.duration}
                      onClick={() => setSelectedDuration(item.duration)}
                      className={`py-3 px-2 border text-center transition-all cursor-pointer rounded-none ${
                        selectedDuration === item.duration
                          ? "bg-charcoal-ink text-alabaster-linen border-charcoal-ink"
                          : "bg-alabaster-linen text-charcoal-ink border-charcoal-ink/05 hover:border-charcoal-ink/20"
                      }`}
                    >
                      <span className="text-3xs font-extrabold uppercase tracking-wider block">{item.duration}</span>
                      {item.discount && (
                        <span className="text-[8px] font-black text-linen-gold block mt-0.5 uppercase tracking-tight">
                          {item.discount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
 
              {/* Step 3: Color Customization */}
              <div className="space-y-3">
                <span className="text-3xs uppercase tracking-widest text-charcoal-ink/40 font-bold block">
                  Step 3: Choose Your Color
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                  {Object.entries(CUSTOMIZATION_PRICING.colors).map(([colorName, colorPrice]) => (
                    <button
                      key={colorName}
                      onClick={() => setCustomColor(colorName)}
                      className={`p-2.5 border flex flex-col items-center justify-between gap-2 text-center transition-all cursor-pointer h-20 rounded-none ${
                        customColor === colorName
                          ? "border-[#245c77] bg-[#245c77]/05 ring-1 ring-[#245c77]"
                          : "border-charcoal-ink/08 bg-white hover:border-charcoal-ink/20"
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded-full border border-slate-350"
                        style={{ backgroundColor: CUSTOMIZATION_PRICING.colorsHex[colorName] }}
                      />
                      <div>
                        <span className="text-[8px] font-extrabold uppercase tracking-tight block truncate w-full max-w-[80px]">
                          {colorName}
                        </span>
                        <span className="text-[8px] text-slate-400 font-bold">
                          {colorPrice === 0 ? "Free" : `+₹${colorPrice}/mo`}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
 
              {/* Step 4: Fabric Premium Options */}
              <div className="space-y-3">
                <span className="text-3xs uppercase tracking-widest text-charcoal-ink/40 font-bold block">
                  Step 4: Choose Your Fabric
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(CUSTOMIZATION_PRICING.fabrics).map(([fabricName, fabricPrice]) => {
                    let desc = "";
                    if (fabricName === "400 TC Organic Cotton") desc = "Cool, soft organic cotton sheets.";
                    else if (fabricName === "600 TC Egyptian Cotton") desc = "Thicker, luxury Egyptian cotton sheets.";
                    else if (fabricName === "Organic Bamboo Linen") desc = "Super cool bamboo sheets, great for allergies.";
                    else if (fabricName === "Mulberry Silk Blend") desc = "Softest silk sheets, very gentle on your skin.";
 
                    return (
                      <button
                        key={fabricName}
                        onClick={() => setCustomFabric(fabricName)}
                        className={`p-4 border text-left flex flex-col justify-between h-28 transition-all cursor-pointer rounded-none ${
                          customFabric === fabricName
                            ? "border-[#245c77] bg-[#245c77]/05 ring-1 ring-[#245c77]"
                            : "border-charcoal-ink/08 bg-white hover:border-charcoal-ink/20"
                        }`}
                      >
                        <div>
                          <span className="text-2xs font-extrabold uppercase tracking-wider block text-slate-800">
                            {fabricName}
                          </span>
                          <span className="text-[9px] text-slate-400 font-medium block mt-1 leading-tight">
                            {desc}
                          </span>
                        </div>
                        <span className="text-[9px] text-[#245c77] font-bold mt-2">
                          {fabricPrice === 0 ? "Basic Fabric (Free)" : `+₹${fabricPrice}/mo`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
 
              {/* Step 5: Print Style */}
              <div className="space-y-3">
                <span className="text-3xs uppercase tracking-widest text-charcoal-ink/40 font-bold block">
                  Step 5: Choose Your Design
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {Object.entries(CUSTOMIZATION_PRICING.prints).map(([printName, printPrice]) => (
                    <button
                      key={printName}
                      onClick={() => setCustomPrint(printName)}
                      className={`p-3 border text-center transition-all cursor-pointer flex flex-col justify-between h-16 rounded-none ${
                        customPrint === printName
                          ? "border-[#245c77] bg-[#245c77]/05 ring-1 ring-[#245c77]"
                          : "border-charcoal-ink/08 bg-white hover:border-charcoal-ink/20"
                      }`}
                    >
                      <span className="text-[9px] font-extrabold uppercase tracking-wider block truncate text-slate-800">
                        {printName}
                      </span>
                      <span className="text-[8px] text-slate-400 font-bold mt-1">
                        {printPrice === 0 ? "Free" : `+₹${printPrice}/mo`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
 
              {/* Step 6: Pricing Breakdown Formula Card */}
              <div className="bg-[#245c77]/05 border border-[#245c77]/10 p-5 rounded-none space-y-3 text-xs">
                <span className="text-[10px] uppercase tracking-widest text-[#245c77] font-extrabold block">
                  How Your Price is Calculated
                </span>
                
                <div className="space-y-2 text-charcoal-ink font-semibold">
                  <div className="flex justify-between">
                    <span className="text-charcoal-ink/60 font-bold">Bed Size Price ({selectedDuration}):</span>
                    <span>₹{currentPlan.basePlanPrice}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-charcoal-ink/60 font-bold">Extra Choices Price (per Month):</span>
                    <span className="text-right">
                      ₹{CUSTOMIZATION_PRICING.colors[customColor]} (Color) + ₹{CUSTOMIZATION_PRICING.fabrics[customFabric]} (Fabric) + ₹{CUSTOMIZATION_PRICING.prints[customPrint]} (Print) = +₹{CUSTOMIZATION_PRICING.colors[customColor] + CUSTOMIZATION_PRICING.fabrics[customFabric] + CUSTOMIZATION_PRICING.prints[customPrint]}/mo
                    </span>
                  </div>
 
                  {selectedDuration !== "1 Month" && (
                    <div className="flex justify-between text-[#A89276]">
                      <span className="font-bold">Discount Applied:</span>
                      <span>
                        {selectedDuration === "3 Months" && "3 Months (5% off)"}
                        {selectedDuration === "6 Months" && "6 Months (10% off)"}
                        {selectedDuration === "12 Months" && "12 Months (20% off)"}
                      </span>
                    </div>
                  )}
 
                  <div className="border-t border-slate-200 pt-2 flex justify-between font-bold text-slate-900 uppercase tracking-wide">
                    <span>Extras Total Price:</span>
                    <span>
                      ₹{currentPlan.price - currentPlan.basePlanPrice}
                    </span>
                  </div>
                </div>
              </div>            </div>
          ) : (
            <>
              {/* Suite Title and Sub */}
              <div className="space-y-2 border-b border-charcoal-ink/08 pb-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold uppercase tracking-wider text-charcoal-ink">
                    {selectedSuite === "corporate" ? "Maison Corporate" : currentPlan.title}
                  </h3>
                  {selectedSuite !== "corporate" && (
                    <span className="text-2xs font-bold bg-linen-gold/10 text-linen-gold px-2.5 py-1 uppercase tracking-wider">
                      Hotel Grade Standard
                    </span>
                  )}
                </div>
                <p className="text-xs text-charcoal-ink/60 leading-relaxed">
                  {selectedSuite === "corporate" ? currentPlan.subtitle : currentPlan.subtitle}
                </p>
              </div>

              {/* Plan Options Selector (1 Sheet / 2 Sheets / 4 Sheets per Month) */}
              {selectedSuite !== "corporate" && (
                <div className="space-y-4 border-b border-charcoal-ink/08 pb-6">
                  <span className="text-3xs uppercase tracking-widest text-charcoal-ink/40 font-bold block">
                    Choose Your Bedsheet Plan ({selectedSuite === "atelier" ? "Single Bed" : "Double Bed"})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { sheets: 1, label: "1 Bed Sheet", desc: "1 clean sheet swap per month" },
                      { sheets: 2, label: "2 Bed Sheets", desc: "2 clean sheet swaps per month" },
                      { sheets: 4, label: "4 Bed Sheets", desc: "4 clean sheet swaps per month", popular: true }
                    ].map((opt) => {
                      const p = getActivePlan(selectedSuite === "atelier" ? "single" : "double", opt.sheets);
                      const isSelected = selectedSheets === opt.sheets;

                      return (
                        <button
                          key={opt.sheets}
                          onClick={() => setSelectedSheets(opt.sheets)}
                          className={`p-4 border text-left flex flex-col justify-between transition-all cursor-pointer relative ${
                            isSelected
                              ? "border-charcoal-ink bg-charcoal-ink/05 ring-2 ring-charcoal-ink shadow-md"
                              : "border-charcoal-ink/10 bg-white hover:border-charcoal-ink/30"
                          }`}
                        >
                          {opt.popular && (
                            <span className="absolute -top-2.5 right-3 bg-linen-gold text-white text-[8px] font-black uppercase px-2 py-0.5 tracking-wider shadow-sm">
                              Best Value
                            </span>
                          )}
                          <div className="space-y-1">
                            <span className="text-xs font-black text-charcoal-ink uppercase tracking-wider block">
                              {opt.sheets} Sheet{opt.sheets > 1 ? "s" : ""} / Mo
                            </span>
                            <span className="text-[10px] text-charcoal-ink/60 font-medium block">
                              {opt.desc}
                            </span>
                          </div>

                          <div className="mt-4 pt-3 border-t border-charcoal-ink/10 space-y-1">
                            <div className="flex justify-between items-baseline">
                              <span className="text-[10px] text-charcoal-ink/50 uppercase font-bold">MRP:</span>
                              <span className="text-sm font-extrabold text-charcoal-ink">₹{p.price || p.monthlyRate}/mo</span>
                            </div>
                            <div className="flex justify-between items-baseline">
                              <span className="text-[10px] text-teal-650 uppercase font-bold">Deposit:</span>
                              <span className="text-xs font-bold text-teal-650">₹{p.depositAmount !== undefined && p.depositAmount !== null ? p.depositAmount : (p.securityDeposit !== undefined ? p.securityDeposit : 0)}</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Specifications Grid */}
              <div className="grid grid-cols-2 gap-4 border-b border-charcoal-ink/08 pb-6 text-xs">
                <div className="space-y-1">
                  <span className="text-3xs uppercase tracking-widest text-charcoal-ink/40 font-bold block">Fabric Type</span>
                  <p className="font-bold text-charcoal-ink">{currentPlan.cottonType}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-3xs uppercase tracking-widest text-charcoal-ink/40 font-bold block">Included Swaps</span>
                  <p className="font-bold text-charcoal-ink">{currentPlan.frequency}</p>
                </div>
              </div>
            </>

          )}

          {/* Pricing Panel */}
          <div className="bg-alabaster-linen p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left space-y-1">
              <span className="text-3xs uppercase tracking-widest text-charcoal-ink/40 font-bold block">
                {orderType === "BUY" ? "Total Price" : "Plan Breakdown"}
              </span>
              <div className="flex items-baseline justify-center sm:justify-start gap-2">
                <span className="text-2xl font-bold font-serif text-charcoal-ink">
                  {orderType === "RENT" && selectedSuite === "corporate" ? "Custom Quote" : `₹${currentPlan.price}`}
                </span>
                {orderType === "RENT" && selectedSuite !== "corporate" && (
                  <span className="text-3xs text-charcoal-ink/50 uppercase tracking-widest font-bold">
                    / Month (MRP)
                  </span>
                )}
                {orderType === "BUY" && (
                  <span className="text-3xs text-charcoal-ink/50 uppercase tracking-widest font-bold">
                    + 18% GST
                  </span>
                )}
              </div>
              {orderType === "RENT" && selectedSuite !== "corporate" && (
                <p className="text-[11px] text-teal-650 font-bold">
                  + ₹{currentPlan.securityDeposit} Refundable Deposit (Initial Total: ₹{currentPlan.totalPrice})
                </p>
              )}
            </div>


            <button
              onClick={handleReserve}
              disabled={submittingPlan}
              className="w-full sm:w-auto py-4 px-8 bg-charcoal-ink text-alabaster-linen font-bold text-2xs uppercase tracking-widest hover:bg-linen-gold transition-colors duration-300 cursor-pointer disabled:opacity-50"
            >
              {submittingPlan ? "Processing..." : (orderType === "RENT" && selectedSuite === "corporate" ? "Contact Us" : currentPlan.cta)}
            </button>
          </div>

          {/* Details footer */}
          <div className="flex flex-wrap items-center justify-between gap-4 text-3xs text-charcoal-ink/50 uppercase tracking-widest font-bold">
            <span className="flex items-center gap-1"><TruckIcon className="w-3.5 h-3.5" /> Free Delivery</span>
            <span className="flex items-center gap-1"><SparklesIcon className="w-3.5 h-3.5" /> {orderType === "RENT" ? "Hot Wash Guarantee" : "Sanitized & Sealed"}</span>
            <span className="flex items-center gap-1"><CancelIcon className="w-3.5 h-3.5" /> {orderType === "RENT" ? "Change Plans Anytime" : "Quality Assured"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
