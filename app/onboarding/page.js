"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function OnboardingForm() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [accountType, setAccountType] = useState("Individual User");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const accountTypes = [
    {
      name: "Individual User",
      description: "For personal use",
      icon: (
        <svg className="w-4 h-4 text-linen-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      name: "Commercial Partner",
      description: "For hotels, Airbnbs, and businesses",
      icon: (
        <svg className="w-4 h-4 text-linen-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
  ];

  // Fetch current user session to pre-fill Google data
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            setName(data.user.name || "");
            setEmail(data.user.email || "");
            setMobile(data.user.mobile || "");
            setAccountType(data.user.accountType || "Individual User");
            setAddress(data.user.address || "");
            setCity(data.user.city || "");
            setPincode(data.user.pincode || "");
            // If user already has a mobile, they're complete — skip onboarding
            if (data.user.mobile) {
              router.replace("/shop");
              return;
            }
          } else {
            // Not logged in — go back to login
            router.replace("/login");
            return;
          }
        } else {
          router.replace("/login");
          return;
        }
      } catch {
        router.replace("/login");
        return;
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Full name is required.");
      return;
    }
    if (!/^\d{10}$/.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!address.trim()) {
      setError("Delivery address is required.");
      return;
    }
    if (!city.trim()) {
      setError("City is required.");
      return;
    }
    if (!/^\d{6}$/.test(pincode)) {
      setError("Please enter a valid 6-digit pincode.");
      return;
    }

    const pinPrefix = pincode.substring(0, 2);
    if (pinPrefix !== "11" && pinPrefix !== "12" && pinPrefix !== "13" && pinPrefix !== "20") {
      setError("ClosetRush is active in Delhi (11xxxx), Gurugram Sectors (12xxxx/13xxxx), and Noida NCR (20xxxx).");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/user/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: name.trim(), 
          mobile, 
          accountType, 
          address: address.trim(), 
          city: city.trim(), 
          pincode: pincode.trim() 
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save profile.");
      }
      setSuccess("Profile saved! Taking you to the shop…");
      setTimeout(() => router.push("/shop"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <svg className="animate-spin h-8 w-8 text-linen-gold" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-none p-8 md:p-10 shadow-sm border border-charcoal-ink/10 max-w-[480px] w-full">

      {/* Progress indicator */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600">Google Connected</span>
        </div>
        <div className="flex-1 h-px bg-charcoal-ink/10" />
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-linen-gold flex items-center justify-center">
            <span className="text-[9px] font-black text-white">2</span>
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider text-charcoal-ink">Your Details</span>
        </div>
      </div>

      {/* Title */}
      <div className="mb-7">
        <h2 className="text-2xl font-serif font-bold text-charcoal-ink mb-1.5">Complete Your Profile</h2>
        <p className="text-2xs uppercase tracking-wider text-charcoal-ink/60 font-bold">
          Just one more step — confirm your details
        </p>
      </div>

      {/* Error / Success */}
      {error && (
        <div className="mb-5 p-4 rounded-none bg-red-50 text-red-600 text-2xs uppercase tracking-wider font-bold border border-red-100 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}
      {success && (
        <div className="mb-5 p-4 rounded-none bg-emerald-50 text-emerald-600 text-2xs uppercase tracking-wider font-bold border border-emerald-100 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Account Type Selector */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-charcoal-ink/60 mb-2">
            Select Account Type
          </label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-full flex items-center justify-between p-3.5 bg-white border border-charcoal-ink/15 rounded-none hover:border-linen-gold transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-none bg-linen-gold/10 text-linen-gold shrink-0">
                  {accountTypes.find((t) => t.name === accountType)?.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-charcoal-ink uppercase tracking-wider leading-none">{accountType}</p>
                  <p className="text-[9px] text-charcoal-ink/65 font-bold uppercase tracking-wider mt-1">
                    {accountTypes.find((t) => t.name === accountType)?.description}
                  </p>
                </div>
              </div>
              <svg className={`w-3.5 h-3.5 text-charcoal-ink/40 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {dropdownOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-charcoal-ink/15 rounded-none shadow-md z-30 overflow-hidden py-1">
                {accountTypes.map((type) => (
                  <button
                    key={type.name}
                    type="button"
                    onClick={() => {
                      setAccountType(type.name);
                      setDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 p-3 hover:bg-alabaster-linen text-left transition-colors cursor-pointer"
                  >
                    <div className="p-1.5 rounded-none bg-linen-gold/10 text-linen-gold shrink-0">
                      {type.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-charcoal-ink uppercase tracking-wider leading-none">{type.name}</p>
                      <p className="text-[9px] text-charcoal-ink/65 font-bold uppercase tracking-wider mt-0.5">{type.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-charcoal-ink/60 mb-2">
            Full Name
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-charcoal-ink/35">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </span>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-charcoal-ink/15 rounded-none text-charcoal-ink placeholder-charcoal-ink/30 focus:outline-none focus:border-linen-gold transition-colors text-xs"
            />
          </div>
        </div>

        {/* Email — pre-filled from Google, read-only */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-charcoal-ink/60 mb-2">
            Email Address
            <span className="ml-2 text-emerald-500 font-bold normal-case tracking-normal">✓ Fetched from Google</span>
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-charcoal-ink/35">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path strokeLinecap="round" strokeLinejoin="round" d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </span>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full pl-12 pr-4 py-3.5 bg-alabaster-linen/60 border border-charcoal-ink/10 rounded-none text-charcoal-ink/60 focus:outline-none text-xs cursor-not-allowed"
            />
            <span className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.952 11.952 0 01-6.118 3.597m.124 10.337A11.954 11.954 0 0112 21.056c1.572 0 3.078-.302 4.462-.848" />
              </svg>
            </span>
          </div>
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-charcoal-ink/60 mb-2">
            Mobile Number
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-charcoal-ink/35">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </span>
            <div className="absolute inset-y-0 left-12 flex items-center pointer-events-none">
              <span className="text-xs font-bold text-charcoal-ink/50 pr-2 border-r border-charcoal-ink/10">+91</span>
            </div>
            <input
              type="tel"
              required
              maxLength="10"
              pattern="[0-9]{10}"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
              placeholder="10-digit mobile number"
              className="w-full pl-24 pr-4 py-3.5 bg-white border border-charcoal-ink/15 rounded-none text-charcoal-ink placeholder-charcoal-ink/30 focus:outline-none focus:border-linen-gold transition-colors text-xs"
            />
          </div>
        </div>

        {/* Delivery Address */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-charcoal-ink/60 mb-2">
            Delivery Address
          </label>
          <div className="relative">
            <span className="absolute top-4 left-4 text-charcoal-ink/35">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <textarea
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Your complete address (e.g. House No, Building, Area)"
              rows="2.5"
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-charcoal-ink/15 rounded-none text-charcoal-ink placeholder-charcoal-ink/30 focus:outline-none focus:border-linen-gold transition-colors text-xs resize-none"
            />
          </div>
        </div>

        {/* City and Pincode Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-charcoal-ink/60 mb-2">
              City
            </label>
            <select
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-3.5 bg-white border border-charcoal-ink/15 rounded-none text-charcoal-ink focus:outline-none focus:border-linen-gold transition-colors text-xs font-semibold"
            >
              <option value="">Select City</option>
              <option value="Delhi">Delhi</option>
              <option value="Gurugram">Gurugram</option>
              <option value="Faridabad">Faridabad</option>
              <option value="Noida">Noida</option>
              <option value="Ghaziabad">Ghaziabad</option>
              <option value="Rohtak">Rohtak</option>
              <option value="Panipat">Panipat</option>
              <option value="Sonipat">Sonipat</option>
              <option value="Karnal">Karnal</option>
              <option value="Panchkula">Panchkula</option>
              <option value="Ambala">Ambala</option>
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-wider text-charcoal-ink/60 mb-2">
              Pincode
              <span className="ml-2 text-rose-500 font-bold normal-case tracking-normal">Serving Delhi & Haryana only</span>
            </label>
            <input
              type="text"
              required
              pattern="[0-9]{6}"
              maxLength="6"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
              placeholder="6-digit Pincode"
              className="w-full px-4 py-3.5 bg-white border border-charcoal-ink/15 rounded-none text-charcoal-ink placeholder-charcoal-ink/30 focus:outline-none focus:border-linen-gold transition-colors text-xs"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-none bg-charcoal-ink hover:bg-linen-gold text-alabaster-linen font-bold text-xs uppercase tracking-widest transition-colors duration-300 cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Save & Go to Shop
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 text-center">
        <Link href="/" className="text-2xs uppercase tracking-wider font-extrabold text-charcoal-ink/40 hover:text-charcoal-ink transition-colors">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-alabaster-linen py-16 px-4 font-sans">
      <div className="w-full flex-grow flex flex-col justify-center items-center">

        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <span className="inline-block text-2xl font-serif font-bold text-charcoal-ink tracking-[0.1em] uppercase">
            Closet<span className="text-linen-gold">Rush</span>
          </span>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-charcoal-ink tracking-tight mt-2">
            Welcome Aboard
          </h1>
          <p className="text-2xs uppercase tracking-widest font-extrabold text-linen-gold">
            Let&apos;s set up your account
          </p>
        </div>

        <Suspense
          fallback={
            <div className="bg-white rounded-none p-10 shadow-sm border border-charcoal-ink/10 max-w-[480px] w-full min-h-[400px] flex items-center justify-center">
              <svg className="animate-spin h-6 w-6 text-linen-gold" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          }
        >
          <OnboardingForm />
        </Suspense>
      </div>

      <div className="w-full flex justify-center items-center gap-8 mt-12 text-2xs uppercase tracking-wider font-extrabold text-charcoal-ink/40">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-linen-gold" />
          Secure & Private
        </span>
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-linen-gold" />
          One-Time Setup
        </span>
      </div>
    </div>
  );
}
