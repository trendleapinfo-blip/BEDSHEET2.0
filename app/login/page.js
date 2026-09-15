"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const safeParseJson = async (res) => {
  const contentType = res.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    try {
      return await res.json();
    } catch {
      throw new Error("Failed to parse response from server.");
    }
  } else {
    throw new Error(`Server Error (${res.status}). Please try again.`);
  }
};

// ─── Icons ───────────────────────────────────────────────────────────────────
const EmailIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="4" width="20" height="16" rx="2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
  </svg>
);
const LockIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const ShieldIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.952 11.952 0 01-6.118 3.597m.124 10.337A11.954 11.954 0 0112 21.056c1.572 0 3.078-.302 4.462-.848" />
  </svg>
);
const EyeIcon = ({ off }) => off ? (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
  </svg>
) : (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const Spinner = () => (
  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);
const CheckIcon = () => (
  <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

// ─── Alert Banners ────────────────────────────────────────────────────────────
const ErrorBanner = ({ msg }) => (
  <div className="mb-5 p-4 bg-red-50 border border-red-100 text-red-600 text-2xs uppercase tracking-wider font-bold flex items-center gap-2">
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
    {msg}
  </div>
);
const SuccessBanner = ({ msg }) => (
  <div className="mb-5 p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 text-2xs uppercase tracking-wider font-bold flex items-center gap-2">
    <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
    {msg}
  </div>
);

// ─── Primary Button ───────────────────────────────────────────────────────────
const PrimaryBtn = ({ loading, children, onClick, type = "submit", disabled }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={loading || disabled}
    className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-charcoal-ink hover:bg-linen-gold text-alabaster-linen font-bold text-xs uppercase tracking-widest transition-colors duration-300 cursor-pointer disabled:opacity-50"
  >
    {loading ? <Spinner /> : children}
  </button>
);

// ─── Input Field ──────────────────────────────────────────────────────────────
const InputField = ({ icon, rightSlot, ...props }) => (
  <div className="relative">
    {icon && (
      <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-charcoal-ink/35">
        {icon}
      </span>
    )}
    <input
      {...props}
      className={`w-full ${icon ? "pl-12" : "pl-4"} ${rightSlot ? "pr-12" : "pr-4"} py-3.5 bg-white border border-charcoal-ink/15 text-charcoal-ink placeholder-charcoal-ink/30 focus:outline-none focus:border-linen-gold transition-colors text-xs disabled:bg-alabaster-linen disabled:text-charcoal-ink/40`}
    />
    {rightSlot && (
      <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
        {rightSlot}
      </div>
    )}
  </div>
);

// ─── Forgot Password — 3-step wizard ─────────────────────────────────────────
function ForgotPasswordWizard({ onCancel }) {
  // step: "email" → "otp" → "newpass" → "done"
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPass, setNewPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let t;
    if (countdown > 0) t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const stepMeta = [
    { id: "email", label: "Email" },
    { id: "otp",   label: "Verify" },
    { id: "newpass", label: "New Password" },
  ];
  const stepIndex = { email: 0, otp: 1, newpass: 2, done: 2 };

  // Step 1 — send OTP
  const handleSendOtp = async (e) => {
    e?.preventDefault();
    setError(""); setSuccess("");
    if (!email.trim()) { setError("Please enter your email address."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), purpose: "reset_password" }),
      });
      const data = await safeParseJson(res);
      if (!res.ok) throw new Error(data.error || "Could not send verification code.");
      setSuccess("Code sent! Check your inbox.");
      setCountdown(60);
      setStep("otp");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2 — verify OTP
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!otp || otp.length !== 6) { setError("Please enter the 6-digit code."); return; }
    // We just move to step 3 — actual verify happens on final submit with reset-password API
    setStep("newpass");
  };

  // Step 3 — submit new password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (newPass.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: otp, newPassword: newPass }),
      });
      const data = await safeParseJson(res);
      if (!res.ok) {
        // If code is wrong, go back to OTP step
        if (data.error?.toLowerCase().includes("invalid") || data.error?.toLowerCase().includes("expired")) {
          setStep("otp");
          setOtp("");
        }
        throw new Error(data.error || "Could not reset password.");
      }
      setStep("done");
      setSuccess("Password reset successfully! You can now log in.");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Step progress */}
      <div className="flex items-center gap-0 mb-8">
        {stepMeta.map((s, i) => {
          const current = stepIndex[step];
          const done = i < current;
          const active = i === current;
          return (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-300 ${
                  done ? "bg-emerald-500" : active ? "bg-charcoal-ink" : "bg-charcoal-ink/10"
                }`}>
                  {done ? <CheckIcon /> : (
                    <span className={active ? "text-white" : "text-charcoal-ink/40"}>{i + 1}</span>
                  )}
                </div>
                <span className={`text-[9px] font-black uppercase tracking-wider ${
                  active ? "text-charcoal-ink" : done ? "text-emerald-600" : "text-charcoal-ink/30"
                }`}>{s.label}</span>
              </div>
              {i < stepMeta.length - 1 && (
                <div className={`flex-1 h-px mb-5 mx-2 transition-colors duration-300 ${i < current ? "bg-emerald-400" : "bg-charcoal-ink/10"}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step titles */}
      <div className="mb-6">
        {step === "email" && (
          <>
            <h2 className="text-xl font-serif font-bold text-charcoal-ink">Forgot Password?</h2>
            <p className="text-2xs text-charcoal-ink/55 font-bold uppercase tracking-wider mt-1">Enter your email and we&apos;ll send a verification code</p>
          </>
        )}
        {step === "otp" && (
          <>
            <h2 className="text-xl font-serif font-bold text-charcoal-ink">Check Your Inbox</h2>
            <p className="text-2xs text-charcoal-ink/55 font-bold uppercase tracking-wider mt-1">
              Code sent to <span className="text-linen-gold">{email}</span>
            </p>
          </>
        )}
        {step === "newpass" && (
          <>
            <h2 className="text-xl font-serif font-bold text-charcoal-ink">Set New Password</h2>
            <p className="text-2xs text-charcoal-ink/55 font-bold uppercase tracking-wider mt-1">Choose a strong new password for your account</p>
          </>
        )}
        {step === "done" && (
          <>
            <h2 className="text-xl font-serif font-bold text-emerald-600">Password Reset!</h2>
            <p className="text-2xs text-charcoal-ink/55 font-bold uppercase tracking-wider mt-1">Your password has been updated successfully</p>
          </>
        )}
      </div>

      {error && <ErrorBanner msg={error} />}
      {success && step !== "done" && <SuccessBanner msg={success} />}



      {/* ── Step 1: Email ── */}
      {step === "email" && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <InputField
            type="email" required
            value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Your registered email"
            disabled={loading}
            icon={<EmailIcon />}
          />
          <PrimaryBtn loading={loading}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Send Verification Code
          </PrimaryBtn>
        </form>
      )}

      {/* ── Step 2: OTP ── */}
      {step === "otp" && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <InputField
              type="text" required maxLength="6"
              value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit code"
              icon={<ShieldIcon />}
            />
            <div className="flex items-center justify-between mt-2 px-0.5">
              <span className="text-[10px] text-charcoal-ink/40 font-semibold">Expires in 5 minutes</span>
              {countdown > 0 ? (
                <span className="text-[10px] text-charcoal-ink/50 font-bold">Resend in {countdown}s</span>
              ) : (
                <button type="button" onClick={handleSendOtp} disabled={loading}
                  className="text-[10px] font-bold text-linen-gold hover:underline cursor-pointer disabled:opacity-50">
                  Resend Code
                </button>
              )}
            </div>
          </div>
          <PrimaryBtn loading={loading}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Verify Code
          </PrimaryBtn>
          <button type="button" onClick={() => { setStep("email"); setOtp(""); setError(""); setSuccess(""); }}
            className="w-full text-center text-2xs font-bold text-charcoal-ink/40 hover:text-charcoal-ink transition-colors cursor-pointer">
            ← Change email
          </button>
        </form>
      )}

      {/* ── Step 3: New Password ── */}
      {step === "newpass" && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <InputField
            type={showPass ? "text" : "password"} required
            value={newPass} onChange={e => setNewPass(e.target.value)}
            placeholder="New password (min 6 characters)"
            disabled={loading}
            icon={<LockIcon />}
            rightSlot={
              <button type="button" onClick={() => setShowPass(v => !v)}
                className="text-charcoal-ink/35 hover:text-charcoal-ink transition-colors cursor-pointer">
                <EyeIcon off={showPass} />
              </button>
            }
          />
          {/* Password strength bar */}
          {newPass && (
            <div className="space-y-1">
              <div className="flex gap-1">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                    newPass.length >= i * 3
                      ? i <= 1 ? "bg-red-400" : i <= 2 ? "bg-orange-400" : i <= 3 ? "bg-yellow-400" : "bg-emerald-500"
                      : "bg-charcoal-ink/10"
                  }`} />
                ))}
              </div>
              <span className="text-[10px] text-charcoal-ink/40 font-semibold">
                {newPass.length < 3 ? "Too short" : newPass.length < 6 ? "Weak" : newPass.length < 9 ? "Fair" : newPass.length < 12 ? "Good" : "Strong"}
              </span>
            </div>
          )}
          <PrimaryBtn loading={loading}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
            Reset Password
          </PrimaryBtn>
        </form>
      )}

      {/* ── Step 4: Done ── */}
      {step === "done" && (
        <div className="space-y-4">
          <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-none text-center">
            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm font-bold text-emerald-700">Your password has been reset.</p>
            <p className="text-2xs text-emerald-600/70 font-semibold mt-1">You can now log in with your new password.</p>
          </div>
          <button type="button" onClick={onCancel}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-charcoal-ink hover:bg-linen-gold text-alabaster-linen font-bold text-xs uppercase tracking-widest transition-colors duration-300 cursor-pointer">
            Back to Login
          </button>
        </div>
      )}

      {/* Cancel — only show before done */}
      {step !== "done" && (
        <button type="button" onClick={onCancel}
          className="mt-5 w-full text-center text-2xs font-bold text-charcoal-ink/40 hover:text-linen-gold transition-colors cursor-pointer">
          ← Back to login
        </button>
      )}
    </div>
  );
}

// ─── Main Login Form ──────────────────────────────────────────────────────────
function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const oauthError = searchParams.get("error");
  const oauthMsgs = {
    oauth_denied: "Google authentication was denied.",
    email_not_provided: "Email was not provided by Google.",
    token_exchange_failed: "Failed to connect with Google.",
  };

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [error, setError] = useState(oauthError ? (oauthMsgs[oauthError] || "Google sign-in failed. Please try again.") : "");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Store pending checkout
  useEffect(() => {
    const redirect = searchParams.get("redirect");
    if (redirect === "pricing") {
      localStorage.setItem("checkout_pending", JSON.stringify({
        bedType: searchParams.get("bedType"),
        planName: searchParams.get("planName"),
        price: searchParams.get("price"),
        duration: searchParams.get("duration"),
      }));
    }
  }, [searchParams]);

  const handleRedirect = (user) => {
    setTimeout(() => {
      const redirect = searchParams.get("redirect");
      if (redirect === "pricing" || redirect === "checkout") return router.push("/checkout");
      if (redirect) return router.push(redirect.startsWith("/") ? redirect : `/${redirect}`);
      if (user?.role === "admin") return router.push("/admin");
      if (user?.role === "warehouse") return router.push("/warehouse");
      if (user?.role === "logistics") return router.push("/logistics");
      router.push("/shop");
      router.refresh();
    }, 1400);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    if (!email.trim()) { setError("Email is required."); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase(), password }),
      });
      const data = await safeParseJson(res);
      if (!res.ok) throw new Error(data.error || "Login failed. Check your credentials.");
      setSuccess("Logged in! Redirecting…");
      handleRedirect(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (showForgot) {
    return (
      <div className="bg-white p-8 md:p-10 shadow-sm border border-charcoal-ink/10 max-w-[480px] w-full">
        <ForgotPasswordWizard onCancel={() => { setShowForgot(false); setError(""); }} />
      </div>
    );
  }

  return (
    <div className="bg-white p-8 md:p-10 shadow-sm border border-charcoal-ink/10 max-w-[480px] w-full">

      <div className="mb-7 text-center">
        <h2 className="text-2xl font-serif font-bold text-charcoal-ink">Sign In</h2>
        <p className="text-2xs uppercase tracking-wider text-charcoal-ink/55 font-bold mt-1.5">
          Enter your credentials to continue
        </p>
      </div>

      {error && <ErrorBanner msg={error} />}
      {success && <SuccessBanner msg={success} />}

      <form onSubmit={handleLogin} className="space-y-5">
        {/* Email */}
        <InputField
          type="email" required
          value={email} onChange={e => setEmail(e.target.value)}
          placeholder="Email address"
          disabled={loading}
          icon={<EmailIcon />}
        />

        {/* Password */}
        <InputField
          type={showPassword ? "text" : "password"} required
          value={password} onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          disabled={loading}
          icon={<LockIcon />}
          rightSlot={
            <button type="button" onClick={() => setShowPassword(v => !v)}
              className="text-charcoal-ink/35 hover:text-charcoal-ink transition-colors cursor-pointer">
              <EyeIcon off={showPassword} />
            </button>
          }
        />

        {/* Forgot password link — inline, subtle */}
        <div className="flex justify-end -mt-1">
          <button type="button" onClick={() => setShowForgot(true)}
            className="text-[10px] font-bold text-charcoal-ink/40 hover:text-linen-gold transition-colors cursor-pointer">
            Forgot password?
          </button>
        </div>

        <PrimaryBtn loading={loading}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          Login with Email
        </PrimaryBtn>
      </form>

      {/* Divider */}
      <div className="relative my-7">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-charcoal-ink/08" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-4 text-[10px] font-bold text-charcoal-ink/30 uppercase tracking-widest">OR</span>
        </div>
      </div>

      {/* Google Sign-In */}
      <a
        href="/api/auth/google"
        className="w-full flex items-center justify-center gap-3 py-3.5 px-6 bg-white border border-charcoal-ink/15 text-charcoal-ink font-bold text-xs uppercase tracking-wider hover:bg-alabaster-linen transition-colors shadow-sm cursor-pointer"
      >
        <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
          <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.354 0 3.373 2.736 1.5 6.71l3.766 3.055z" />
          <path fill="#34A853" d="M16.04 15.345c-1.077.732-2.432 1.164-4.04 1.164a6.837 6.837 0 0 1-6.734-4.855L1.5 14.71C3.373 18.682 7.354 21.418 12 21.418c3.118 0 5.964-1.09 8.055-2.973l-4.015-3.1z" />
          <path fill="#4285F4" d="M23.836 12.236c0-.8-.073-1.573-.209-2.318H12v4.51h6.636a5.673 5.673 0 0 1-2.463 3.718l4.014 3.1c2.345-2.164 3.65-5.345 3.65-9.01z" />
          <path fill="#FBBC05" d="M5.266 14.236a6.89 6.89 0 0 1-.355-2.236c0-.782.127-1.536.355-2.236L1.5 6.71A11.97 11.97 0 0 0 .5 12c0 1.9.445 3.7 1.236 5.29l3.53-3.054z" />
        </svg>
        Continue with Google
      </a>

      {/* Footer */}
      <div className="mt-8 space-y-4 text-center">
        <p className="text-xs font-bold text-charcoal-ink/60">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-linen-gold hover:underline font-extrabold">
            Sign up for free
          </Link>
        </p>
        <div>
          <Link href="/"
            className="inline-flex items-center gap-1.5 text-2xs uppercase tracking-wider font-extrabold text-charcoal-ink/40 hover:text-charcoal-ink transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Page Wrapper ─────────────────────────────────────────────────────────────
export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-alabaster-linen py-16 px-4 font-sans">
      <div className="w-full flex-grow flex flex-col justify-center items-center">
        <div className="text-center mb-8 space-y-2">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-charcoal-ink tracking-tight">
            Welcome Back
          </h1>
          <p className="text-2xs uppercase tracking-widest font-extrabold text-linen-gold">
            Sign in to your ClosetRush account
          </p>
        </div>

        <Suspense
          fallback={
            <div className="bg-white p-10 shadow-sm border border-charcoal-ink/10 max-w-[480px] w-full min-h-[380px] flex items-center justify-center">
              <svg className="animate-spin h-6 w-6 text-linen-gold" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            </div>
          }
        >
          <LoginFormContent />
        </Suspense>
      </div>

      <div className="w-full flex justify-center items-center gap-8 mt-12 text-2xs uppercase tracking-wider font-extrabold text-charcoal-ink/40">
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-linen-gold" />
          Secure Login
        </span>
        <span className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-linen-gold" />
          Privacy Protected
        </span>
      </div>
    </div>
  );
}
