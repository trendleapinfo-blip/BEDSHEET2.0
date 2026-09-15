"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  MapPin,
  Phone,
  Check,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Truck,
  Layers,
  Calendar,
  Lock,
  ArrowLeft,
  Crown
} from "lucide-react";
import Navbar from "../components/Navbar";
import SubscriptionModal from "../components/SubscriptionModal";

const CUSTOMIZATION_PRICING = {
  colors: {
    "Classic White": 0,
    "Deep Teal": 100,
    "Linen Gold": 150,
    "Slate Gray": 120,
    "Lavender Mist": 130
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

function CheckoutFormContent() {
  const router = useRouter();

  // Session & Plan States
  const [user, setUser] = useState(null);
  const [plan, setPlan] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);

  // Form States
  const [subscriptionType, setSubscriptionType] = useState("monthly"); // "monthly" or "weekly"
  const [address, setAddress] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [successPlan, setSuccessPlan] = useState(null); // Shows success screen if set

  // Coupon States
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  
  // Load Razorpay script dynamically
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Fetch session and retrieve plan
  useEffect(() => {
    const fetchSessionAndPlan = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setUser(data.user);
            setAddress(data.user.address || "");
            setMobile(data.user.mobile || "");
          } else {
            // Unauthenticated: redirect to login
            const pending = localStorage.getItem("checkout_pending");
            if (pending) {
              const planData = JSON.parse(pending);
              window.location.href = `/login?redirect=checkout&bedType=${planData.bedType}&planName=${planData.planName}&price=${planData.price}&duration=${planData.duration}`;
            } else {
              window.location.href = "/login?redirect=checkout";
            }
            return;
          }
        } else {
          window.location.href = "/login?redirect=checkout";
          return;
        }

        const pendingPlan = localStorage.getItem("checkout_pending");
        if (pendingPlan) {
          const parsed = JSON.parse(pendingPlan);
          setPlan(parsed);
          if (parsed.orderType === "RENT") {
            if (parsed.itemTier === "PREMIUM" || parsed.subscriptionType === "weekly") {
              setSubscriptionType("weekly");
            } else {
              setSubscriptionType("monthly");
            }
          }
        }
      } catch (err) {
        console.error("Checkout setup error:", err);
      } finally {
        setLoadingSession(false);
      }
    };

    fetchSessionAndPlan();
  }, []);

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    setCouponSuccess("");
  };

  // Reset coupon when delivery option changes
  useEffect(() => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    setCouponSuccess("");
  }, [subscriptionType]);

  if (loadingSession) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-charcoal-ink">
        <RefreshCw className="h-10 w-10 animate-spin text-linen-gold mb-3" />
        <p className="text-xs font-bold uppercase tracking-widest text-charcoal-ink/40">Securing checkout session...</p>
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="max-w-md mx-auto bg-white border border-charcoal-ink/10 p-8 text-center shadow-md space-y-6">
        <AlertCircle className="w-16 h-16 text-rose-500 mx-auto animate-pulse" />
        <h2 className="text-xl font-serif font-bold text-charcoal-ink">No Plan Selected</h2>
        <p className="text-xs text-charcoal-ink/60 font-semibold leading-relaxed">
          Please select a bedding plan from our plans catalog before attempting to checkout.
        </p>
        <Link
          href="/#pricing"
          className="block w-full text-center py-3.5 px-6 bg-charcoal-ink hover:bg-linen-gold text-white font-bold text-xs uppercase tracking-widest transition-colors"
        >
          View Bedding Plans
        </Link>
      </div>
    );
  }

  const bedTypeStr = (plan.bedType || "").toLowerCase();
  const planNameStr = (plan.planName || "").toLowerCase();
  const isSingle = bedTypeStr.includes("single") || planNameStr.includes("single");

  // Calculate pricing breakdown
  const getPricing = () => {
    if (plan.orderType === "BUY") {
      const base = Number(plan.price) || 0;
      let couponDiscount = 0;
      if (appliedCoupon) {
        if (appliedCoupon.discountType === "percentage") {
          couponDiscount = Math.round(base * (appliedCoupon.discountValue / 100));
        } else {
          couponDiscount = appliedCoupon.discountValue;
        }
        if (couponDiscount >= base) {
          couponDiscount = Math.max(0, base - 1);
        }
      }
      const discountedBase = base - couponDiscount;
      const taxableBase = Number((discountedBase / 1.18).toFixed(2));
      const gst = Number((discountedBase - taxableBase).toFixed(2));
      const total = discountedBase;
      return { base, couponDiscount, discountedBase, taxableBase, gst, deposit: 0, total };
    }

    // New Pricing Logic for RENT
    const bedTypeLower = (plan.bedType || "").toLowerCase();
    const planNameLower = (plan.planName || "").toLowerCase();
    const isSingle = bedTypeLower.includes("single") || planNameLower.includes("single");

    let baseMonthly = 0;
    if (plan.price && Number(plan.price) > 0) {
      baseMonthly = Number(plan.price);
    } else if (subscriptionType === "weekly") { // Premium
      baseMonthly = isSingle ? 750 : 950;
    } else { // Basic
      baseMonthly = isSingle ? 300 : 500;
    }

    // Check if user already paid deposit or has an existing/expired subscription
    const alreadyPaidDeposit = !!(user?.hasPaidDeposit || (user?.selectedPlan && user.selectedPlan.planName));
    
    let depositAmt = 0;
    if (subscriptionType === "weekly" || plan.itemTier === "PREMIUM" || alreadyPaidDeposit) {
      depositAmt = 0;
    } else {
      depositAmt = isSingle ? 500 : 800;
    }

    let durationMonths = 1;
    let discountRate = 0;
    if (plan.duration === "3 Months") { durationMonths = 3; discountRate = 0.05; }
    else if (plan.duration === "6 Months") { durationMonths = 6; discountRate = 0.10; }
    else if (plan.duration === "9 Months") { durationMonths = 9; discountRate = 0.10; }
    else if (plan.duration === "12 Months") { durationMonths = 12; discountRate = 0.20; }

    const originalRent = baseMonthly * durationMonths;
    let base = Math.round(originalRent * (1 - discountRate));
    let deposit = depositAmt;

    // Apply Checkout Coupon
    let couponDiscount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.discountType === "percentage") {
        couponDiscount = Math.round(base * (appliedCoupon.discountValue / 100));
        if (appliedCoupon.maxDiscount && couponDiscount > appliedCoupon.maxDiscount) {
          couponDiscount = appliedCoupon.maxDiscount;
        }
      } else {
        couponDiscount = appliedCoupon.discountValue;
      }
      if (couponDiscount >= base) {
        couponDiscount = Math.max(0, base - 1);
      }
    }

    const discountedBase = base - couponDiscount;
    const taxableBase = Number((discountedBase / 1.18).toFixed(2));
    const gst = Number((discountedBase - taxableBase).toFixed(2));
    const total = discountedBase + deposit;

    return { base, couponDiscount, discountedBase, taxableBase, gst, deposit, total, durationMonths };
  };

  const pricing = getPricing();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError("");
    setCouponSuccess("");
    try {
      const res = await fetch("/api/user/apply-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couponCode: couponCode.trim(),
          subtotal: pricing.base
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedCoupon({
          couponCode: data.couponCode,
          discountType: data.discountType,
          discountValue: data.discountValue,
          discount: data.discount
        });
        setCouponSuccess(`Coupon '${data.couponCode}' applied! Discount: ₹${data.discount}`);
      } else {
        setAppliedCoupon(null);
        setCouponError(data.error || "Failed to apply coupon.");
      }
    } catch (err) {
      console.error(err);
      setCouponError("Error validating coupon code.");
    } finally {
      setValidatingCoupon(false);
    }
  };



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoadingSubmit(true);

    if (!mobile || mobile.length !== 10) {
      setError("Please provide a valid 10-digit mobile number.");
      setLoadingSubmit(false);
      return;
    }

    if (!address.trim()) {
      setError("Delivery address is required to dispatch fresh linens.");
      setLoadingSubmit(false);
      return;
    }

    // Active Service Area Check (Delhi & Haryana only)
    const pincodeMatch = address.match(/\b\d{6}\b/);
    if (!pincodeMatch) {
      setError("Please include a valid 6-digit delivery pincode in your address.");
      setLoadingSubmit(false);
      return;
    }
    const pin = pincodeMatch[0];
    const pinPrefix = pin.substring(0, 2);
    if (pinPrefix !== "11" && pinPrefix !== "12" && pinPrefix !== "13" && pinPrefix !== "20") {
      setError("ClosetRush is active in Delhi (11xxxx), Gurugram Sectors (12xxxx/13xxxx), and Noida/Ghaziabad NCR (20xxxx). Please enter a supported NCR pincode.");
      setLoadingSubmit(false);
      return;
    }

    try {
      // 1. Create order on backend
      const res = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalPrice: pricing.total,
          orderDetails: {
            bedType: plan.bedType,
            planName: plan.planName,
            price: pricing.base,
            duration: plan.duration,
            subscriptionType: plan.orderType === "BUY" ? "one-time" : subscriptionType,
            securityDeposit: pricing.deposit,
            gst: pricing.gst,
            totalPrice: pricing.total,
            couponCode: appliedCoupon ? appliedCoupon.couponCode : null,
            discount: pricing.couponDiscount,
            orderType: plan.orderType || "RENT",
            itemTier: plan.orderType === "BUY" ? (plan.itemTier || "BASIC") : (subscriptionType === "weekly" ? "PREMIUM" : "BASIC")
          }
        })
      });

      const orderData = await res.json();
      if (!res.ok) {
        throw new Error(orderData.error || "Failed to initialize payment gateway order.");
      }

      // 2. Configure and open Razorpay Checkout Modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ClosetRush",
        description: `${plan.planName} (${plan.duration})`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            setError("");
            setLoadingSubmit(true);

            // 3. Verify signature on backend & create order on success
            const verifyPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderDetails: {
                bedType: plan.bedType,
                planName: plan.planName,
                price: pricing.base,
                duration: plan.duration,
                subscriptionType: plan.orderType === "BUY" ? "one-time" : subscriptionType,
                securityDeposit: pricing.deposit,
                gst: pricing.gst,
                totalPrice: pricing.total,
                address,
                mobile,
                isCustom: !!plan.isCustom,
                color: plan.color,
                fabric: plan.fabric,
                print: plan.print,
                couponCode: appliedCoupon ? appliedCoupon.couponCode : null,
                discount: pricing.couponDiscount,
                orderType: plan.orderType || "RENT",
                itemTier: plan.orderType === "BUY" ? (plan.itemTier || "BASIC") : (subscriptionType === "weekly" ? "PREMIUM" : "BASIC")
              }
            };

            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(verifyPayload)
            });

            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              localStorage.removeItem("checkout_pending");
              setSuccessPlan({
                bedType: plan.bedType,
                planName: plan.planName,
                price: pricing.base,
                duration: plan.duration,
                subscriptionType: plan.orderType === "BUY" ? "one-time" : subscriptionType,
                securityDeposit: pricing.deposit,
                gst: pricing.gst,
                totalPrice: pricing.total,
                address,
                mobile
              });
            } else {
              setError(verifyData.error || "Payment verification failed. Please contact support.");
            }
          } catch (verifyErr) {
            console.error("Signature verification error:", verifyErr);
            setError("Failed to verify payment with server. Please do not close or refresh this page.");
          } finally {
            setLoadingSubmit(false);
          }
        },
        prefill: {
          name: orderData.user.name,
          email: orderData.user.email,
          contact: mobile || orderData.user.mobile,
        },
        theme: {
          color: "#0F172A",
        },
        modal: {
          ondismiss: function () {
            setLoadingSubmit(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("Razorpay submission error:", err);
      setError(err.message || "Something went wrong while connecting with Razorpay.");
      setLoadingSubmit(false);
    }
  };

  // Render Success State directly on Page
  if (successPlan) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <SubscriptionModal
          plan={successPlan}
          onClose={() => {
            router.push("/dashboard");
          }}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-charcoal-ink font-sans">
      {/* Back button link */}
      <div className="mb-8">
        <Link
          href="/#pricing"
          className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-charcoal-ink/50 hover:text-charcoal-ink transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Return to bedding plans
        </Link>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-none flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

        {/* Left Column: Form Details */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white border border-charcoal-ink/08 p-6 sm:p-8 rounded-none space-y-8 shadow-sm">

          {plan.orderType === "BUY" ? (
            <div className="p-6 border border-charcoal-ink/10 bg-charcoal-ink/03 space-y-3">
              <span className="text-3xs uppercase tracking-widest text-[#B2905F] font-black block">Step 01</span>
              <h2 className="text-sm font-bold uppercase tracking-wider mt-1 text-charcoal-ink flex items-center gap-2">
                <Truck className="w-4.5 h-4.5 text-[#B2905F]" /> Direct Purchase & One-Time Delivery
              </h2>
              <p className="text-[10px] text-charcoal-ink/60 font-semibold leading-relaxed">
                You are purchasing this bedding set permanently. We will package, vacuum seal, and deliver your brand new set directly to your address. No returns or recurring swaps required.
              </p>
            </div>
          ) : (
            <>
              <div>
                <span className="text-3xs uppercase tracking-widest text-[#B2905F] font-black block">Step 01</span>
                <h2 className="text-xl font-bold uppercase tracking-wider mt-1 text-charcoal-ink">
                  Choose Service & Delivery Schedule
                </h2>
                <p className="text-2xs text-charcoal-ink/50 font-bold uppercase tracking-wider mt-1">
                  Select how you want to manage swap cycles
                </p>
              </div>

              {/* Service options select buttons */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option A: Monthly Kit */}
                <button
                  type="button"
                  onClick={() => setSubscriptionType("monthly")}
                  className={`text-left p-6 border rounded-none flex flex-col justify-between h-40 transition-all duration-300 cursor-pointer ${subscriptionType === "monthly"
                      ? "bg-charcoal-ink/05 border-charcoal-ink ring-1 ring-charcoal-ink"
                      : "bg-white border-charcoal-ink/10 hover:border-charcoal-ink/25"
                    }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className={`p-2 rounded-none ${subscriptionType === "monthly" ? "bg-charcoal-ink text-white" : "bg-slate-100 text-slate-500"}`}>
                      <Layers className="w-4 h-4" />
                    </span>
                    {subscriptionType === "monthly" && (
                      <span className="w-4.5 h-4.5 rounded-full bg-charcoal-ink text-white flex items-center justify-center p-1">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <div className="mt-4">
                    <h4 className="font-extrabold text-charcoal-ink text-xs uppercase tracking-wider">
                      Monthly Kit (Self Swap)
                    </h4>
                    <p className="text-[10px] text-charcoal-ink/60 mt-1 leading-relaxed font-semibold">
                      We deliver a complete bundle once a month. You swap the linens on your own schedule.
                    </p>
                    <p className="text-[9px] text-[#B2905F] font-black mt-1.5 uppercase tracking-wider">
                      {user?.hasPaidDeposit || (user?.selectedPlan && user?.selectedPlan?.planName)
                        ? "Security Deposit: ₹0 (Already Paid / Renewal)"
                        : `Requires ₹${isSingle ? 500 : 800} Security Deposit`}
                    </p>
                  </div>
                </button>

                {/* Option B: Weekly Service */}
                <button
                  type="button"
                  onClick={() => setSubscriptionType("weekly")}
                  className={`text-left p-6 border rounded-none flex flex-col justify-between h-40 transition-all duration-300 cursor-pointer ${subscriptionType === "weekly"
                      ? "bg-charcoal-ink/05 border-charcoal-ink ring-1 ring-charcoal-ink"
                      : "bg-white border-charcoal-ink/10 hover:border-charcoal-ink/25"
                    }`}
                >
                  <div className="flex justify-between items-start w-full">
                    <span className={`p-2 rounded-none ${subscriptionType === "weekly" ? "bg-charcoal-ink text-white" : "bg-slate-100 text-slate-500"}`}>
                      <Truck className="w-4 h-4" />
                    </span>
                    {subscriptionType === "weekly" && (
                      <span className="w-4.5 h-4.5 rounded-full bg-charcoal-ink text-white flex items-center justify-center p-1">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <div className="mt-4">
                    <h4 className="font-extrabold text-charcoal-ink text-xs uppercase tracking-wider flex items-center gap-1.5">
                      Weekly Swap Service <span className="bg-[#B2905F] text-white text-[8px] px-1 rounded-none uppercase font-bold">Premium</span>
                    </h4>
                    <p className="text-[10px] text-charcoal-ink/60 mt-1 leading-relaxed font-semibold">
                      Our dispatch staff visits weekly to change sheets, make the bed, and retrieve used linen.
                    </p>
                    <p className="text-[9px] text-emerald-600 font-black mt-1.5 uppercase tracking-wider">
                      No Security Deposit Required
                    </p>
                  </div>
                </button>
              </div>
            </>
          )}

          <hr className="border-charcoal-ink/08" />

          {/* Dispatch Details form */}
          <div className="space-y-6">
            <div>
              <span className="text-3xs uppercase tracking-widest text-[#B2905F] font-black block">Step 02</span>
              <h2 className="text-xl font-bold uppercase tracking-wider mt-1 text-charcoal-ink">
                Confirm Delivery Coordinates
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Phone Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-charcoal-ink/50 uppercase tracking-wider flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-charcoal-ink/30" /> Contact Phone Number
                </label>
                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  maxLength="10"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  placeholder="10-digit mobile number"
                  className="w-full px-4 py-3.5 bg-white border border-charcoal-ink/15 rounded-none text-charcoal-ink focus:outline-none focus:border-linen-gold text-xs font-bold"
                />
              </div>

              {/* Account Type info */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-charcoal-ink/50 uppercase tracking-wider flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-[#B2905F]" /> Account Type
                </label>
                <div className="w-full px-4 py-3.5 bg-charcoal-ink/03 border border-charcoal-ink/08 text-charcoal-ink/50 text-xs font-extrabold select-none uppercase tracking-wider">
                  {user?.accountType || "Individual Account"}
                </div>
              </div>
            </div>

            {/* Address Field */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label className="text-[10px] font-bold text-charcoal-ink/50 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-linen-gold" /> Complete Delivery Address
                </label>
                <span className="text-[10px] text-emerald-600 font-extrabold uppercase tracking-wide flex items-center gap-1 bg-emerald-50 px-2.5 py-0.5 border border-emerald-200">
                  <Check className="w-3 h-3 text-emerald-600" /> Active in Delhi, Gurugram Sectors, & Noida NCR
                </span>
              </div>
              <textarea
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Flat / PG room number, building/sector name (e.g. Sector 69 Gurgaon, Sector 62 Noida), city, state, and 6-digit pincode"
                rows="3"
                className="w-full p-4 bg-white border border-charcoal-ink/15 rounded-none text-charcoal-ink focus:outline-none focus:border-linen-gold text-xs font-semibold resize-none leading-relaxed"
              ></textarea>
              <div className="flex flex-wrap gap-2 pt-1 text-[9px] font-bold text-charcoal-ink/60">
                <span className="bg-charcoal-ink/05 px-2 py-0.5 border border-charcoal-ink/10">🟢 Delhi NCR (11xxxx)</span>
                <span className="bg-charcoal-ink/05 px-2 py-0.5 border border-charcoal-ink/10">🟢 Gurugram Sectors (12xxxx / 13xxxx)</span>
                <span className="bg-charcoal-ink/05 px-2 py-0.5 border border-charcoal-ink/10">🟢 Noida & Ghaziabad NCR (20xxxx)</span>
              </div>
            </div>
          </div>

          <hr className="border-charcoal-ink/08" />

          {/* Coupon Code Selection (B2C users) */}
          {user?.accountType === "Individual User" && (
            <div className="space-y-3 bg-charcoal-ink/02 border border-charcoal-ink/05 p-6">
              <label className="text-[10px] font-bold text-charcoal-ink/50 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-linen-gold" /> Have a Coupon Code?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCouponCode(val);
                    setCouponError("");
                    setCouponSuccess("");
                    if (!val.trim()) {
                      setAppliedCoupon(null);
                    }
                  }}
                  placeholder="Enter code (e.g. FRESHBED10)"
                  className="flex-1 px-4 py-3 bg-white border border-charcoal-ink/15 rounded-none text-charcoal-ink focus:outline-none focus:border-linen-gold text-xs font-bold uppercase"
                />
                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-widest rounded-none transition-colors cursor-pointer"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={validatingCoupon || !couponCode.trim()}
                    className="px-6 py-3 bg-charcoal-ink hover:bg-linen-gold text-white font-bold text-xs uppercase tracking-widest rounded-none transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {validatingCoupon ? "Validating..." : "Apply"}
                  </button>
                )}
              </div>
              {couponError && (
                <p className="text-[11px] text-rose-600 font-bold mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" /> {couponError}
                </p>
              )}
              {couponSuccess && (
                <p className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5 shrink-0 text-emerald-500" /> {couponSuccess}
                </p>
              )}
            </div>
          )}
        </form>

        {/* Right Column: Invoice & Summary */}
        <div className="lg:col-span-5 space-y-6">

          {/* Plan Summary Card */}
          <div className="bg-white border border-charcoal-ink/08 p-6 shadow-sm space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-charcoal-ink border-b border-charcoal-ink/08 pb-3">
              Subscription Plan Summary
            </h4>

            <div className="space-y-4 text-xs font-semibold">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-3xs uppercase tracking-wider text-charcoal-ink/40 font-bold block">Plan Category</span>
                  <p className="text-charcoal-ink font-bold text-sm mt-0.5">{plan.planName}</p>
                </div>
                <div className="text-right">
                  <span className="text-3xs uppercase tracking-wider text-charcoal-ink/40 font-bold block">Size</span>
                  <p className="text-charcoal-ink font-bold text-sm mt-0.5 uppercase">{plan.bedType} Bed</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-charcoal-ink/05">
                <div>
                  <span className="text-3xs uppercase tracking-wider text-charcoal-ink/40 font-bold block">Cycle Period</span>
                  <p className="text-charcoal-ink">{plan.duration}</p>
                </div>
                <div>
                  <span className="text-3xs uppercase tracking-wider text-charcoal-ink/40 font-bold block">Washing Process</span>
                  <p className="text-charcoal-ink">60°C Thermodynamic</p>
                </div>
              </div>

              {/* If Custom Selection exists */}
              {plan.isCustom && (plan.color || plan.fabric || plan.print) && (
                <div className="pt-3 border-t border-charcoal-ink/05 space-y-2">
                  <span className="text-3xs uppercase tracking-wider text-charcoal-ink/40 font-bold block">Custom Options</span>
                  <div className="grid grid-cols-3 gap-2 text-[10px] text-charcoal-ink/80 leading-normal">
                    {plan.color && (
                      <div>
                        <span className="text-slate-400 font-bold block">Color</span>
                        <span>{plan.color}</span>
                      </div>
                    )}
                    {plan.fabric && (
                      <div>
                        <span className="text-slate-400 font-bold block">Fabric</span>
                        <span className="truncate block">{plan.fabric.split(" ")[0]} Cotton</span>
                      </div>
                    )}
                    {plan.print && (
                      <div>
                        <span className="text-slate-400 font-bold block">Print</span>
                        <span>{plan.print.split(" ")[0]}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Payment Invoice details */}
          <div className="bg-charcoal-ink text-white p-6 shadow-md space-y-6">
            <div className="flex justify-between items-center border-b border-white/08 pb-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-linen-gold">
                Payment Invoice
              </h4>
              <span className="text-3xs text-white/40 uppercase tracking-widest font-bold">Billing summary</span>
            </div>

            <div className="space-y-3 text-2xs font-semibold text-white/70">
              {pricing.couponDiscount > 0 ? (
                <>
                  <div className="flex justify-between">
                    <span>Plan MRP Rate ({plan.duration}):</span>
                    <span className="text-white">₹{pricing.base}</span>
                  </div>
                  <div className="flex justify-between font-bold text-linen-gold">
                    <span>Coupon Code Discount ({appliedCoupon?.couponCode}):</span>
                    <span>-₹{pricing.couponDiscount}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/08 pt-2">
                    <span>Net Base Amount (Excl. GST):</span>
                    <span className="text-white">₹{pricing.taxableBase}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between">
                  <span>
                    {plan.orderType === "BUY" ? "Base Purchase Amount (Excl. GST)" : (subscriptionType === "weekly" ? "Weekly Base Amount (Excl. GST)" : "Base Rental Amount (Excl. GST)")}:
                  </span>
                  <span className="text-white">₹{pricing.taxableBase}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>GST (18%):</span>
                <span className="text-white">₹{pricing.gst}</span>
              </div>

              {plan.orderType !== "BUY" && (
                <div className="flex justify-between">
                  <span>Refundable Security Deposit:</span>
                  <span className="text-white">
                    {pricing.deposit > 0 ? `₹${pricing.deposit}` : "₹0 (Already Paid / Renewal)"}
                  </span>
                </div>
              )}

              <div className="border-t border-white/08 my-4 pt-4 flex justify-between items-baseline">
                <div>
                  <span className="text-xs font-black text-white uppercase tracking-wider block">
                    {plan.orderType === "BUY" ? "Total Payable Amount:" : "Total Upfront Payable:"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-linen-gold font-serif">
                    ₹{pricing.total}
                  </span>
                  <span className="text-white/40 text-3xs font-bold uppercase tracking-widest block mt-0.5">
                    {plan.orderType === "BUY" ? "/ One-Time" : `/ ${plan.duration}`}
                  </span>
                </div>
              </div>
            </div>

            {/* Pay Button inside invoice */}
            <button
              onClick={handleSubmit}
              disabled={loadingSubmit}
              className="w-full py-4 bg-linen-gold hover:bg-linen-gold/90 text-charcoal-ink font-bold text-xs uppercase tracking-widest shadow-md transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loadingSubmit ? (
                <RefreshCw className="w-4 h-4 animate-spin text-charcoal-ink" />
              ) : (
                <Lock className="w-4 h-4 text-charcoal-ink" />
              )}
              {loadingSubmit ? "Processing Transaction..." : (plan.orderType === "BUY" ? "Confirm & Purchase Now" : "Confirm & Subscribe Now")}
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="bg-white border border-charcoal-ink/08 p-6 text-3xs text-charcoal-ink/50 uppercase tracking-widest font-bold space-y-3.5">
            <span className="flex items-center gap-2"><Truck className="w-4 h-4 text-[#B2905F]" /> {plan.orderType === "BUY" ? "Free Doorstep Delivery" : "Free Doorstep Delivery & Pickup"}</span>
            <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-[#B2905F]" /> 100% Thermodynamic Sanitized standard</span>
            {plan.orderType !== "BUY" && (
              <span className="flex items-center gap-2"><Layers className="w-4 h-4 text-[#B2905F]" /> Pause or Cancel Subscription Anytime</span>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-alabaster-linen flex flex-col justify-between">
      {/* Top Navbar Header */}
      <div>
        <Navbar />
        {/* Spacer for sticky navbar */}
        <div className="h-[80px]" />
      </div>

      {/* Checkout Content Form */}
      <div className="flex-grow">
        <Suspense
          fallback={
            <div className="flex min-h-[60vh] flex-col items-center justify-center text-charcoal-ink">
              <RefreshCw className="h-10 w-10 animate-spin text-linen-gold mb-3" />
              <p className="text-xs font-bold uppercase tracking-widest text-charcoal-ink/40">Securing checkout session...</p>
            </div>
          }
        >
          <CheckoutFormContent />
        </Suspense>
      </div>

      {/* Simple Footer details */}
      <footer className="bg-charcoal-ink text-white/50 text-[10px] font-bold uppercase tracking-widest py-8 border-t border-white/05 text-center">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© 2026 ClosetRush Inc. Secure Gateway.</span>
          <span className="flex items-center gap-1.5 text-linen-gold"><ShieldCheck className="w-4 h-4" /> SSL encrypted transaction routing</span>
        </div>
      </footer>
    </div>
  );
}
