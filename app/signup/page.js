"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const safeParseJson = async (res) => {
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      return await res.json();
    } catch (err) {
      throw new Error("Failed to parse response JSON from server.");
    }
  } else {
    throw new Error(`Server Error (Status ${res.status}). Please check your connection or server logs.`);
  }
};

function SignupFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Dropdown states
  const [accountType, setAccountType] = useState("Individual User");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP States
  const [verificationRequired, setVerificationRequired] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const redirect = searchParams.get("redirect");
    if (redirect === "pricing") {
      const bedType = searchParams.get("bedType");
      const planName = searchParams.get("planName");
      const price = searchParams.get("price");
      const duration = searchParams.get("duration");
      localStorage.setItem(
        "checkout_pending",
        JSON.stringify({ bedType, planName, price, duration })
      );
    }
  }, [searchParams]);

  const accountTypes = [
    {
      name: "Individual User",
      description: "For personal use",
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      name: "Commercial Partner",
      description: "For hotels, Airbnbs, and businesses",
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      ),
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name || !email || !password || !mobile) {
      setError("Please fill in all required fields (Name, Email, Password, Mobile).");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (verificationRequired && !otpCode) {
      setError("Please enter the verification code sent to your email.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name,
        email: email.toLowerCase(),
        mobile: mobile || undefined,
        password,
        address,
        accountType,
        otpCode: verificationRequired ? otpCode : undefined,
      };

      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await safeParseJson(res);

      if (!res.ok) {
        throw new Error(data.error || "Signup failed");
      }

      if (data.verificationRequired) {
        setVerificationRequired(true);
        setSuccess("Verification code sent! Please verify your email to complete signup.");
        setLoading(false);
        return;
      }

      setSuccess("Account created successfully! Redirecting...");
      setTimeout(() => {
        const redirect = searchParams.get("redirect");
        if (redirect === "pricing" || redirect === "checkout") {
          router.push("/checkout");
        } else if (redirect) {
          router.push(redirect.startsWith("/") ? redirect : `/${redirect}`);
        } else {
          router.push("/shop");
        }
        router.refresh();
      }, 1500);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-none p-8 md:p-10 shadow-sm border border-charcoal-ink/10 max-w-[500px] w-full relative">
      {/* Account Type Selector */}
      <div className="mb-6">
        <label className="block text-3xs font-bold text-charcoal-ink/60 uppercase tracking-widest mb-2">
          Select Account Type
        </label>
        <div className="relative">
          <button
            type="button"
            disabled={verificationRequired}
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="w-full flex items-center justify-between p-4 bg-white border border-charcoal-ink/15 rounded-none hover:border-linen-gold transition-colors text-left cursor-pointer disabled:bg-alabaster-linen disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-none bg-linen-gold/10 text-linen-gold">
                {accountTypes.find((t) => t.name === accountType)?.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-charcoal-ink uppercase tracking-wider">{accountType}</p>
                <p className="text-3xs text-charcoal-ink/65 font-bold uppercase tracking-wider mt-0.5">
                  {accountTypes.find((t) => t.name === accountType)?.description}
                </p>
              </div>
            </div>
            {/* Chevron down */}
            <svg className={`w-4 h-4 text-charcoal-ink/40 transition-transform ${dropdownOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && !verificationRequired && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-charcoal-ink/15 rounded-none shadow-md z-30 overflow-hidden py-1 animate-fade-in">
              {accountTypes.map((type) => (
                <button
                  key={type.name}
                  type="button"
                  onClick={() => {
                    setAccountType(type.name);
                    setDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-4 hover:bg-alabaster-linen text-left transition-colors cursor-pointer"
                >
                  <div className="p-2 rounded-none bg-linen-gold/10 text-linen-gold">
                    {type.icon}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-charcoal-ink uppercase tracking-wider">{type.name}</p>
                    <p className="text-3xs text-charcoal-ink/65 font-bold uppercase tracking-wider">{type.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-none bg-red-50 text-red-600 text-2xs uppercase tracking-wider font-bold border border-red-100 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          {error}
        </div>
      )}

      {success && (
        <div className="mb-6 p-4 rounded-none bg-emerald-50 text-emerald-600 text-2xs uppercase tracking-wider font-bold border border-emerald-100 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {success}
        </div>
      )}



      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-charcoal-ink/40">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </span>
          <input
            type="text"
            required
            value={name}
            disabled={verificationRequired || loading}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your full name"
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-charcoal-ink/15 rounded-none text-charcoal-ink placeholder-charcoal-ink/30 focus:outline-none focus:border-linen-gold transition-colors text-xs disabled:bg-alabaster-linen disabled:text-charcoal-ink/40"
          />
        </div>

        {/* Email Address */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-charcoal-ink/40">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </span>
          <input
            type="email"
            required
            value={email}
            disabled={verificationRequired || loading}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-charcoal-ink/15 rounded-none text-charcoal-ink placeholder-charcoal-ink/30 focus:outline-none focus:border-linen-gold transition-colors text-xs disabled:bg-alabaster-linen disabled:text-charcoal-ink/40"
          />
        </div>

        {/* Mobile Number */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-charcoal-ink/40">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </span>
          <input
            type="tel"
            required
            pattern="[0-9]{10}"
            maxLength="10"
            value={mobile}
            disabled={verificationRequired || loading}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter 10-digit mobile number (Required)"
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-charcoal-ink/15 rounded-none text-charcoal-ink placeholder-charcoal-ink/30 focus:outline-none focus:border-linen-gold transition-colors text-xs disabled:bg-alabaster-linen disabled:text-charcoal-ink/40"
          />
        </div>

        {/* Password */}
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-charcoal-ink/40">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </span>
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            disabled={verificationRequired || loading}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a strong password"
            className="w-full pl-12 pr-12 py-3.5 bg-white border border-charcoal-ink/15 rounded-none text-charcoal-ink placeholder-charcoal-ink/30 focus:outline-none focus:border-linen-gold transition-colors text-xs disabled:bg-alabaster-linen disabled:text-charcoal-ink/40"
          />
          <button
            type="button"
            disabled={verificationRequired || loading}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-charcoal-ink/40 hover:text-charcoal-ink transition-colors disabled:opacity-50 cursor-pointer"
          >
            {showPassword ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        </div>

        {/* Address */}
        <div>
          <textarea
            value={address}
            disabled={verificationRequired || loading}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter your complete address for delivery"
            rows="3"
            className="w-full p-4 bg-white border border-charcoal-ink/15 rounded-none text-charcoal-ink placeholder-charcoal-ink/30 focus:outline-none focus:border-linen-gold transition-colors text-xs resize-none disabled:bg-alabaster-linen disabled:text-charcoal-ink/40"
          ></textarea>
        </div>

        {/* OTP Input Field shown step-by-step */}
        {verificationRequired && (
          <div className="space-y-2 p-5 bg-linen-gold/05 border border-linen-gold/25 rounded-none animate-fade-in">
            <label className="block text-3xs font-bold text-linen-gold uppercase tracking-widest">
              Enter 6-Digit Verification Code
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-charcoal-ink/40">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.952 11.952 0 01-6.118 3.597m.124 10.337A11.954 11.954 0 0112 21.056c1.572 0 3.078-.302 4.462-.848M15 12H9m3 3V9" />
                </svg>
              </span>
              <input
                type="text"
                required
                maxLength="6"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter verification code"
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-charcoal-ink/15 rounded-none text-charcoal-ink placeholder-charcoal-ink/30 focus:outline-none focus:border-linen-gold transition-colors text-xs"
              />
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-none bg-charcoal-ink hover:bg-linen-gold text-alabaster-linen font-bold text-xs uppercase tracking-widest transition-colors duration-300 cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              {verificationRequired ? "Verify & Complete Signup" : "Create Account"}
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-charcoal-ink/08"></div>
        </div>
        <div className="relative flex justify-center text-[10px] font-bold text-charcoal-ink/40 uppercase tracking-widest">
          <span className="bg-white px-4">OR</span>
        </div>
      </div>

      {/* Google Sign In */}
      <a
        href="/api/auth/google"
        className="w-full flex items-center justify-center gap-3 py-3.5 px-6 rounded-none bg-white border border-charcoal-ink/15 text-charcoal-ink font-bold text-xs uppercase tracking-wider hover:bg-alabaster-linen transition-colors shadow-sm cursor-pointer"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.354 0 3.373 2.736 1.5 6.71l3.766 3.055z"
          />
          <path
            fill="#34A853"
            d="M16.04 15.345c-1.077.732-2.432 1.164-4.04 1.164a6.837 6.837 0 0 1-6.734-4.855L1.5 14.71C3.373 18.682 7.354 21.418 12 21.418c3.118 0 5.964-1.09 8.055-2.973l-4.015-3.1z"
          />
          <path
            fill="#4285F4"
            d="M23.836 12.236c0-.8-.073-1.573-.209-2.318H12v4.51h6.636a5.673 5.673 0 0 1-2.463 3.718l4.014 3.1c2.345-2.164 3.65-5.345 3.65-9.01z"
          />
          <path
            fill="#FBBC05"
            d="M5.266 14.236a6.89 6.89 0 0 1-.355-2.236c0-.782.127-1.536.355-2.236L1.5 6.71A11.97 11.97 0 0 0 .5 12c0 1.9.445 3.7 1.236 5.29l3.53-3.054z"
          />
        </svg>
        Sign up with Google
      </a>

      {/* Footer Links */}
      <div className="mt-8 space-y-4 text-center">
        <p className="text-xs font-bold text-charcoal-ink/60">
          Already have an account?{" "}
          <Link href="/login" className="text-linen-gold hover:underline font-extrabold">
            Sign in here
          </Link>
        </p>

        <p className="text-2xs font-bold text-charcoal-ink/50 leading-relaxed px-4">
          Registering as a Warehouse Manager or Logistics Partner?{" "}
          <Link href="/signup/staff" className="text-linen-gold hover:underline font-extrabold">
            Sign up here
          </Link>
        </p>
        <p className="text-3xs text-charcoal-ink/40 font-semibold leading-relaxed px-4">
          By creating an account, you agree to our{" "}
          <Link href="/terms" className="text-linen-gold underline font-bold">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-linen-gold underline font-bold">
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-alabaster-linen py-16 px-4 font-sans text-charcoal-ink">
      {/* Header */}
      <div className="text-center mb-8 space-y-2">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-charcoal-ink tracking-tight">
          Join ClosetRush
        </h1>
        <p className="text-2xs uppercase tracking-widest font-extrabold text-linen-gold">
          Create your account and start enjoying fresh bedding
        </p>
      </div>

      {/* Signup Card */}
      <Suspense
        fallback={
          <div className="bg-white rounded-none p-10 shadow-sm border border-charcoal-ink/10 max-w-[500px] w-full min-h-[500px] flex items-center justify-center">
            <svg className="animate-spin h-6 w-6 text-linen-gold" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        }
      >
        <SignupFormContent />
      </Suspense>
    </div>
  );
}
