"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import { BedIcon, CrownIcon, ArrowRightIcon } from "../../components/Icons";
import { ShieldCheck, Truck, Layers, LockIcon, MailIcon } from "lucide-react";

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

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id || "single";
  const size = id === "double" ? "double" : "single";

  // Configuration States
  const [orderType, setOrderType] = useState("RENT"); // 'RENT' | 'BUY'
  const [rentTier, setRentTier] = useState("BASIC"); // 'BASIC' | 'PREMIUM'
  const [duration, setDuration] = useState("6 Months"); // '1 Month' | '3 Months' | '6 Months' | '12 Months'
  const [isCustom, setIsCustom] = useState(false);
  const [color, setColor] = useState("Classic White");
  const [fabric, setFabric] = useState("400 TC Organic Cotton");
  const [print, setPrint] = useState("Solid / Minimalist");

  // User State for Navbar
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setUser(data.user);
          }
        }
      } catch (err) {
        console.error("Session check error:", err);
      } finally {
        setLoading(false);
      }
    };
    const fetchPlans = async () => {
      try {
        const res = await fetch("/api/plans");
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.plans) {
            setPlans(data.plans);
          }
        }
      } catch (err) {
        console.error("Fetch plans error:", err);
      }
    };
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.settings) {
            setSettings(data.settings);
          }
        }
      } catch (err) {
        console.error("Fetch settings error in product detail:", err);
      }
    };
    fetchSession();
    fetchPlans();
    fetchSettings();
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setUser(null);
        window.location.reload();
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Calculations
  const getPricing = () => {
    if (orderType === "BUY") {
      const base = size === "single" ? 200 : 350;
      const taxableBase = Number((base / 1.18).toFixed(2));
      const gst = Number((base - taxableBase).toFixed(2));
      const total = base;
      return { base, taxableBase, originalPrice: null, discount: 0, deposit: 0, gst, total };
    } else {
      // New Pricing Logic
      let baseMonthly = 0;
      let depositAmt = 0;

      if (rentTier === "BASIC") { // Normal
        baseMonthly = size === "single" ? 300 : 800;
        depositAmt = size === "single" ? 500 : 800;
      } else { // Premium
        baseMonthly = size === "single" ? 750 : 950;
        depositAmt = 0;
      }

      // Duration Discount Logic
      let durationMonths = 1;
      let discountRate = 0;
      if (duration === "3 Months") { durationMonths = 3; discountRate = 0.05; }
      else if (duration === "6 Months") { durationMonths = 6; discountRate = 0.10; }
      else if (duration === "9 Months") { durationMonths = 9; discountRate = 0.10; }
      else if (duration === "12 Months") { durationMonths = 12; discountRate = 0.20; }

      // Calculate rent
      let originalRent = baseMonthly * durationMonths;
      let base = Math.round(originalRent * (1 - discountRate));
      let discount = originalRent - base;
      let deposit = depositAmt;
      let taxableBase = Number((base / 1.18).toFixed(2));
      let gst = Number((base - taxableBase).toFixed(2));
      let total = base + deposit;

      return { base, taxableBase, originalPrice: discount > 0 ? originalRent : null, discount, deposit, gst, total, durationMonths };
    }
  };

  const pricing = getPricing();

  const handleSizeChange = (newSize) => {
    router.push(`/product/${newSize}`);
  };

  const handleCheckout = () => {
    let planName = "";
    if (orderType === "BUY") {
      planName = `${size === "single" ? "Single Bed" : "Double Bed"} Sheets (Purchase)`;
    } else {
      planName = `${size === "single" ? "Single Bed" : "Double Bed"} ${rentTier === "PREMIUM" ? "Premium Rent" : "Basic Rent"} (${duration})`;
    }

    const payload = {
      orderType,
      itemTier: orderType === "BUY" ? "BASIC" : rentTier,
      bedType: size,
      planName,
      price: pricing.base,
      duration: orderType === "BUY" ? "One-Time Purchase" : duration,
      isCustom: orderType === "RENT" ? isCustom : false,
      color,
      fabric: orderType === "RENT" ? fabric : undefined,
      print: orderType === "RENT" ? print : undefined
    };

    localStorage.setItem("checkout_pending", JSON.stringify(payload));
    window.location.href = "/checkout";
  };

  return (
    <div className="min-h-screen bg-alabaster-linen text-charcoal-ink font-sans antialiased">
      {/* Navigation */}
      <Navbar user={user} loading={loading} handleLogout={handleLogout} />

      {/* Main product configuration container */}
      <main className="max-w-[1380px] mx-auto px-6 sm:px-8 py-28 md:py-36 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        
        {/* Left Side: Product Image & Spec Summary */}
        <div className="lg:col-span-5 space-y-8">
          <div className="bg-white/70 backdrop-blur-md border border-white/50 rounded-[32px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[9px] font-black uppercase tracking-widest text-[#B2905F] bg-[#B2905F]/10 px-3 py-1 rounded-full border border-[#B2905F]/20">
                {orderType === "RENT" ? "Linen Swap Service" : "Direct Purchase"}
              </span>
            </div>

            <div className="space-y-4">
              <h2 className="font-serif font-bold text-2xl text-charcoal-ink leading-tight">
                {size === "single" ? "Single Bed Bedding Set" : "Double Bed Bedding Set"}
              </h2>
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[24px] bg-alabaster-linen shadow-inner">
                <img 
                  src={size === "single" ? "/cat_single.png" : "/cat_double.png"}
                  alt={size === "single" ? "Single Bed sheets" : "Double Bed sheets"}
                  className="w-full h-full object-cover pointer-events-none"
                />
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-charcoal-ink/05 mt-6">
              <span className="text-3xs uppercase tracking-widest text-charcoal-ink/40 font-bold block">Spec & Inclusions</span>
              <ul className="space-y-3 text-xs font-semibold text-charcoal-ink/70">
                <li className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4.5 h-4.5 text-[#B2905F] shrink-0" />
                  <span>Thermodynamic UV-C Sanitized</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Truck className="w-4.5 h-4.5 text-[#B2905F] shrink-0" />
                  <span>Free doorstep delivery & scheduling</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Layers className="w-4.5 h-4.5 text-[#B2905F] shrink-0" />
                  {orderType === "RENT" ? (
                    <span>Flexible swap cycles & cancel anytime</span>
                  ) : (
                    <span>Own standard vacuum-sealed bedding set</span>
                  )}
                </li>
              </ul>
            </div>
          </div>

          <div className="p-6 bg-white/40 border border-white/60 rounded-3xl text-[10px] text-charcoal-ink/50 leading-relaxed font-semibold uppercase tracking-wider">
            {orderType === "RENT" 
              ? "Every plan includes hot washing, germ-killing UV treatment, and automatic dispatch delivery."
              : "Direct sales are delivered clean and fresh. No swap schedules required."}
          </div>
        </div>

        {/* Right Side: Configurator Dashboard */}
        <div className="lg:col-span-7 bg-white/90 backdrop-blur-md border border-white rounded-[32px] p-8 md:p-10 flex flex-col justify-between shadow-[0_20px_50px_rgba(0,0,0,0.03)]">
          <div className="space-y-8">
            
            {/* 1. Rent vs Buy Switcher */}
            <div className="space-y-2">
              <span className="text-3xs uppercase tracking-widest text-charcoal-ink/40 font-bold block">Choose Service Option</span>
              <div className="grid grid-cols-2 bg-alabaster-linen p-1.5 rounded-full border border-charcoal-ink/05">
                <button
                  onClick={() => setOrderType("RENT")}
                  className={`py-3.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    orderType === "RENT"
                      ? "bg-charcoal-ink text-white shadow-md"
                      : "text-charcoal-ink/50 hover:text-charcoal-ink"
                  }`}
                >
                  Rent (Swap Service)
                </button>
                <button
                  onClick={() => setOrderType("BUY")}
                  className={`py-3.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                    orderType === "BUY"
                      ? "bg-charcoal-ink text-white shadow-md"
                      : "text-charcoal-ink/50 hover:text-charcoal-ink"
                  }`}
                >
                  Buy & Own
                </button>
              </div>
            </div>

            {/* 2. Mattress Dimensions Selector */}
            <div className="space-y-2">
              <span className="text-3xs uppercase tracking-widest text-charcoal-ink/40 font-bold block">Select Bed Dimensions</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleSizeChange("single")}
                  className={`p-4 border flex items-center justify-center gap-2.5 transition-all cursor-pointer rounded-2xl ${
                    size === "single"
                      ? "border-[#245c77] bg-[#245c77]/05 text-[#245c77] ring-1 ring-[#245c77]"
                      : "border-charcoal-ink/08 bg-white text-charcoal-ink hover:border-charcoal-ink/20"
                  }`}
                >
                  <BedIcon className="w-4 h-4 shrink-0" />
                  <span className="text-2xs font-extrabold uppercase tracking-wider">Single Bed</span>
                </button>
                <button
                  onClick={() => handleSizeChange("double")}
                  className={`p-4 border flex items-center justify-center gap-2.5 transition-all cursor-pointer rounded-2xl ${
                    size === "double"
                      ? "border-[#245c77] bg-[#245c77]/05 text-[#245c77] ring-1 ring-[#245c77]"
                      : "border-charcoal-ink/08 bg-white text-charcoal-ink hover:border-charcoal-ink/20"
                  }`}
                >
                  <BedIcon className="w-4 h-4 shrink-0" />
                  <span className="text-2xs font-extrabold uppercase tracking-wider">Double Bed</span>
                </button>
              </div>
            </div>

            {/* 3. Dynamic Section based on Rent/Buy */}
            {orderType === "RENT" ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-1 duration-200">
                
                {/* Rent service tier */}
                <div className="space-y-2">
                  <span className="text-3xs uppercase tracking-widest text-charcoal-ink/40 font-bold block">Choose Rental Service Tier</span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setRentTier("BASIC")}
                      className={`p-4.5 border text-left flex flex-col justify-between h-24 transition-all cursor-pointer rounded-2xl ${
                        rentTier === "BASIC"
                          ? "border-charcoal-ink bg-charcoal-ink/05 ring-1 ring-charcoal-ink"
                          : "border-charcoal-ink/08 bg-white hover:border-charcoal-ink/20"
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-wider block">Basic Rent</span>
                      <span className="text-[8px] text-charcoal-ink/50 block leading-tight mt-1 font-semibold">Monthly self-swap. ₹{size === "single" ? 500 : 800} deposit.</span>
                      <span className="text-2xs font-bold text-linen-gold mt-1.5 block">
                        {size === "single" ? "₹300/mo" : "₹800/mo"}
                      </span>
                    </button>
                    <button
                      onClick={() => setRentTier("PREMIUM")}
                      className={`p-4.5 border text-left flex flex-col justify-between h-24 transition-all cursor-pointer rounded-2xl ${
                        rentTier === "PREMIUM"
                          ? "border-charcoal-ink bg-charcoal-ink/05 ring-1 ring-charcoal-ink"
                          : "border-charcoal-ink/08 bg-white hover:border-charcoal-ink/20"
                      }`}
                    >
                      <span className="text-[10px] font-black uppercase tracking-wider block">Premium Rent</span>
                      <span className="text-[8px] text-charcoal-ink/50 block leading-tight mt-1 font-semibold">Weekly staff swap. ₹0 deposit.</span>
                      <span className="text-2xs font-bold text-linen-gold mt-1.5 block">
                        {size === "single" ? "₹750/mo" : "₹950/mo"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* Duration Slider */}
                <div className="space-y-2">
                  <span className="text-3xs uppercase tracking-widest text-charcoal-ink/40 font-bold block">Choose Subscription Duration</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { duration: "1 Month", discount: null },
                      { duration: "3 Months", discount: "5% off" },
                      { duration: "6 Months", discount: "10% off" },
                      { duration: "9 Months", discount: "10% off" },
                      { duration: "12 Months", discount: "20% off" }
                    ].map((item) => (
                      <button
                        key={item.duration}
                        onClick={() => setDuration(item.duration)}
                        className={`py-3.5 px-2 border text-center transition-all cursor-pointer rounded-xl ${
                          duration === item.duration
                            ? "bg-charcoal-ink text-white border-charcoal-ink shadow-sm"
                            : "bg-alabaster-linen text-charcoal-ink border-charcoal-ink/05 hover:border-charcoal-ink/20"
                        }`}
                      >
                        <span className="text-[9px] font-black uppercase tracking-wider block">{item.duration}</span>
                        {item.discount && (
                          <span className="text-[8px] font-black text-linen-gold block mt-0.5 uppercase tracking-tight">
                            {item.discount}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Picker — always visible for Rent */}
                <div className="space-y-2">
                  <span className="text-3xs uppercase tracking-widest text-charcoal-ink/40 font-bold block">Choose Bedsheet Color</span>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(CUSTOMIZATION_PRICING.colors).map(([colorName]) => (
                      <button
                        key={colorName}
                        onClick={() => setColor(colorName)}
                        className={`p-3.5 border flex items-center gap-2.5 rounded-2xl transition-all cursor-pointer ${
                          color === colorName
                            ? "border-[#245c77] bg-[#245c77]/05 ring-1 ring-[#245c77]"
                            : "border-charcoal-ink/08 bg-white hover:border-charcoal-ink/20"
                        }`}
                      >
                        <div
                          className="w-4 h-4 rounded-full border border-slate-300 shrink-0"
                          style={{ backgroundColor: CUSTOMIZATION_PRICING.colorsHex[colorName] }}
                        />
                        <span className="text-2xs font-extrabold text-charcoal-ink uppercase tracking-wider">{colorName}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Customization toggle — Fabric & Print only */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-3xs uppercase tracking-widest text-charcoal-ink/40 font-bold block">Fabric & Pattern Options</span>
                    <button
                      onClick={() => setIsCustom(!isCustom)}
                      className={`text-[9px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full border transition-all cursor-pointer ${
                        isCustom
                          ? "bg-[#245c77] text-white border-[#245c77]"
                          : "bg-white text-charcoal-ink border-charcoal-ink/10 hover:border-charcoal-ink/20"
                      }`}
                    >
                      {isCustom ? "Enabled" : "Upgrade Fabric & Print (+₹50/mo)"}
                    </button>
                  </div>

                  {isCustom && (
                    <div className="space-y-4 p-4.5 bg-alabaster-linen border border-charcoal-ink/05 rounded-2xl animate-in zoom-in-95 duration-200">
                      {/* Fabric Choice */}
                      <div className="space-y-2">
                        <span className="text-[8px] font-extrabold uppercase tracking-widest text-charcoal-ink/40">Select Fabric Tier</span>
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(CUSTOMIZATION_PRICING.fabrics).map(([fabricName]) => (
                            <button
                              key={fabricName}
                              onClick={() => setFabric(fabricName)}
                              className={`p-2.5 border text-left rounded-xl transition-all cursor-pointer ${
                                fabric === fabricName
                                  ? "border-[#245c77] bg-[#245c77]/05 ring-1 ring-[#245c77]"
                                  : "border-charcoal-ink/08 bg-white hover:border-charcoal-ink/20"
                              }`}
                            >
                              <span className="text-[9px] font-extrabold block text-slate-800">{fabricName}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Print Choice */}
                      <div className="space-y-2">
                        <span className="text-[8px] font-extrabold uppercase tracking-widest text-charcoal-ink/40">Select Pattern Style</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {Object.entries(CUSTOMIZATION_PRICING.prints).map(([printName]) => (
                            <button
                              key={printName}
                              onClick={() => setPrint(printName)}
                              className={`p-2 border text-center rounded-xl transition-all cursor-pointer ${
                                print === printName
                                  ? "border-[#245c77] bg-[#245c77]/05 ring-1 ring-[#245c77]"
                                  : "border-charcoal-ink/08 bg-white hover:border-charcoal-ink/20"
                              }`}
                            >
                              <span className="text-[9px] font-extrabold block truncate text-slate-800">{printName}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in slide-in-from-top-1 duration-200">
                {/* Color Selection for Direct Purchase */}
                <div className="space-y-3">
                  <span className="text-3xs uppercase tracking-widest text-charcoal-ink/40 font-bold block">Choose Bedsheet Color</span>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(CUSTOMIZATION_PRICING.colors).map(([colorName, colorPrice]) => (
                      <button
                        key={colorName}
                        onClick={() => setColor(colorName)}
                        className={`p-3.5 border flex items-center gap-2.5 rounded-2xl transition-all cursor-pointer ${
                          color === colorName
                            ? "border-[#245c77] bg-[#245c77]/05 ring-1 ring-[#245c77]"
                            : "border-charcoal-ink/08 bg-white hover:border-charcoal-ink/20"
                        }`}
                      >
                        <div 
                          className="w-4 h-4 rounded-full border border-slate-350 shrink-0" 
                          style={{ backgroundColor: CUSTOMIZATION_PRICING.colorsHex[colorName] }}
                        />
                        <span className="text-2xs font-extrabold text-charcoal-ink uppercase tracking-wider">{colorName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Pricing Calculations Summary Card */}
          <div className="mt-12 space-y-6 pt-6 border-t border-charcoal-ink/08">
            <div className="bg-alabaster-linen p-5 rounded-2xl space-y-3 text-xs">
              <div className="flex justify-between items-baseline font-semibold text-charcoal-ink">
                <span>{orderType === "BUY" ? "Flat Sale Price" : "Base Pricing Rate"}</span>
                <span className="text-sm font-bold">
                  ₹{pricing.base}
                  {orderType === "RENT" && (
                    <span className="text-3xs font-medium text-charcoal-ink/50 ml-1">/ {duration}</span>
                  )}
                </span>
              </div>

              {pricing.originalPrice && (
                <div className="flex justify-between text-[10px] text-charcoal-ink/40 font-semibold">
                  <span>Regular Rate</span>
                  <span className="line-through">₹{pricing.originalPrice}</span>
                </div>
              )}

              {pricing.discount > 0 && (
                <div className="flex justify-between text-[10px] text-linen-gold font-bold uppercase tracking-wider">
                  <span>Savings Applied</span>
                  <span>- ₹{pricing.discount}</span>
                </div>
              )}

              <div className="flex justify-between text-[10px] text-charcoal-ink/60 font-semibold">
                <span>Base Amount (Excl. GST)</span>
                <span>₹{pricing.taxableBase}</span>
              </div>
              <div className="flex justify-between text-[10px] text-charcoal-ink/60 font-semibold">
                <span>GST (18%)</span>
                <span>₹{pricing.gst}</span>
              </div>

              {pricing.deposit > 0 && (
                <div className="flex justify-between text-[10px] text-indigo-650 font-bold uppercase tracking-wider">
                  <span>Refundable Security Deposit</span>
                  <span>+ ₹{pricing.deposit}</span>
                </div>
              )}

              <div className="pt-3 border-t border-charcoal-ink/08 flex justify-between items-baseline font-black text-charcoal-ink uppercase tracking-wider text-2xs">
                <span>Total Upfront Amount</span>
                <span className="text-lg font-bold text-charcoal-ink">₹{pricing.total}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              className="w-full py-4 rounded-full bg-charcoal-ink text-white font-bold text-2xs uppercase tracking-widest hover:bg-linen-gold hover:text-charcoal-ink shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              {orderType === "BUY" ? "Buy Bedding Set" : "Reserve Subscription"}
            </button>
          </div>
        </div>
      </main>

      {/* Footer layout */}
      <Footer showWaitlist={true} />
    </div>
  );
}
