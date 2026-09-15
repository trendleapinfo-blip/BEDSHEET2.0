"use client";

import React, { useState, useEffect } from "react";
import Script from "next/script";
import Link from "next/link";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import HeroThreeDVisual from "./components/HeroThreeDVisual";
import InteractiveScience from "./components/InteractiveScience";
import LifeChangeComparison from "./components/LifeChangeComparison";
import SavingsTable from "./components/SavingsTable";
import StaircaseWorkflow from "./components/StaircaseWorkflow";

import {
  Mail,
  Lock,
  ArrowRight,
  Star,
  ChevronDown,
  Check,
  X,
  Sparkles,
  Bed,
  Phone,
  Clock,
  Heart,
  Smile,
  Shield,
  Coffee,
  Truck,
  ShieldCheck,
  Recycle,
  DollarSign,
  Calendar,
  Leaf,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Download
} from "lucide-react";

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState([]);

  // Lead magnet form states
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [claimedDiscount, setClaimedDiscount] = useState(false);

  // FAQ state
  const [openFaq, setOpenFaq] = useState(null);

  // B2B Savings Calculator state
  const [b2bBedsCount, setB2bBedsCount] = useState(25);

  // Fetch session & plans
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

    fetchSession();
    fetchPlans();
  }, []);



  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (res.ok) {
        setUser(null);
        window.location.reload();
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleClaimDiscount = async (e) => {
    e.preventDefault();
    if (!leadEmail.trim() || !leadPhone.trim()) return;

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: leadEmail, phone: leadPhone }),
      });

      if (res.ok) {
        setClaimedDiscount(true);
        setLeadEmail("");
        setLeadPhone("");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to join the priority waitlist. Please try again.");
      }
    } catch (err) {
      console.error("Waitlist join error:", err);
      alert("An error occurred. Please try again.");
    }
  };

  const handleScrollTo = (e, href) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const faqs = [
    {
      q: "Is it hygienic?",
      a: "Yes, absolutely. Every sheets pack goes through our 6-stage clinical sanitization process: washed at exactly 60°C to dissolve cosmetics and body oils, sterilized with high-frequency UV-C rays to neutralize 99.9% of bacteria, and sealed in sterile packaging before delivery."
    },
    {
      q: "Can dirty bedsheets cause acne or pimples?",
      a: "Dermatologists agree that sleeping on dirty pillowcases and bedsheets can worsen skin conditions. Sweat, dead skin cells, and bacteria on bedsheets may contribute to blocked pores, which can trigger facial and body acne. Washing your sheets every week is a highly recommended acne hygiene tip."
    },
    {
      q: "Can dirty bedsheets trigger asthma or allergies?",
      a: "Yes, dirty bedding is a prime breeding ground for dust mites. Dust mites in your mattress and pillow can cause allergic reactions like morning sneezing, itchy skin, and can trigger asthma flare-ups during the night. A clean sleeping environment reduces these bedroom allergens."
    },
    {
      q: "How often should you wash your bedsheets?",
      a: "For optimal sleep hygiene and to prevent bacteria and dust mite buildup, experts recommend a weekly bedsheet change. If you have sensitive skin, eczema, or sweat often, changing your bedding frequently is crucial for skin health and reducing infections."
    },
    {
      q: "Are there side effects to sleeping on dirty bedding?",
      a: "Sleeping on unwashed sheets can lead to various skin problems. Long-term exposure to microbes in bedding may contribute to contact dermatitis, fungal skin infections, and poor sleep quality due to allergens. Clean bedding is essential for a healthy bedroom."
    },
    {
      q: "Can I cancel or pause anytime?",
      a: "Yes. There are zero long-term commitments or lock-in contracts. You can pause, adjust your exchange cycles, upgrade/downgrade tiers, or cancel your subscription directly from your account dashboard with a single click."
    },
    {
      q: "What if the sheets tear or stain?",
      a: "We expect normal wear and tear. Fabric thinning, minor lint, or standard sleep sweat stains are completely covered by us. For any major accidental damage or tears, our friendly support team resolves it quickly through your dashboard."
    },
    {
      q: "What bedding sizes are supported?",
      a: "We support standard Single beds (6x3 ft) and Double beds (6x5 ft) for single and double plans. You can select your specific size and details on our plan configurator."
    }
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a
      }
    }))
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FCFBF9] flex flex-col items-center justify-center font-sans antialiased relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#05D4B5]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="flex flex-col items-center space-y-8 relative z-10">
          <div className="relative flex items-center justify-center w-24 h-24">
            {/* Spinning outer ring */}
            <svg className="absolute inset-0 w-full h-full text-[#0D1518]/10 animate-spin" viewBox="0 0 100 100" style={{ animationDuration: '2s' }}>
              <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M50 2 a48 48 0 0 1 48 48" fill="none" stroke="#05D4B5" strokeWidth="2.5" strokeLinecap="round" />
            </svg>

            {/* Logo */}
            <img
              src="/image.png"
              alt="ClosetRush Logo"
              className="h-10 w-auto object-contain animate-pulse"
              style={{ animationDuration: '2s' }}
            />
          </div>

          <div className="space-y-4 text-center">
            <h1 className="font-serif font-bold text-2xl uppercase tracking-[0.25em] text-[#0D1518]">
              ClosetRush
            </h1>
            <div className="flex items-center justify-center gap-1.5 opacity-70">
              <div className="w-1.5 h-1.5 bg-[#05D4B5] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-1.5 h-1.5 bg-[#05D4B5] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-1.5 h-1.5 bg-[#05D4B5] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFBF9] text-[#0D1518] font-sans antialiased" id="home">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Navigation Bar */}
      <Navbar user={user} loading={loading} handleLogout={handleLogout} />
      <header className="relative w-full min-h-[90vh] md:min-h-screen pt-16 sm:pt-32 pb-16 md:pb-28 flex items-center bg-[#032026] overflow-hidden">

        {/* Luxury grid & ambient light glows */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-950/15 via-transparent to-transparent pointer-events-none z-0 opacity-40" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] pointer-events-none" />

        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-[#05D4B5]/5 rounded-full blur-[130px] pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[500px] h-[500px] bg-[#05D4B5]/10 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#032026]/95 via-[#032026]/80 to-[#032026]/95" />

        {/* Floating watermarked text background */}
        <div className="absolute -left-12 bottom-12 z-10 pointer-events-none select-none opacity-[0.02] hidden lg:block">
          <span className="text-[15rem] font-serif font-black tracking-[0.2em] text-transparent uppercase leading-none" style={{ WebkitTextStroke: "1px white" }}>
            LUXE
          </span>
        </div>

        {/* Content container */}
        <div className="relative w-full max-w-[1380px] mx-auto px-5 sm:px-12 lg:px-20 z-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">

            {/* Left Column: Editorial Typography & Copy */}
            <div className="lg:col-span-7 text-left space-y-3 sm:space-y-9">

              <div className="inline-flex items-center gap-2 px-3.5 py-1 sm:px-4 sm:py-1.5 bg-[#05D4B5]/10 border border-[#05D4B5]/20 rounded-full backdrop-blur-sm shadow-inner">
                <span className="text-[#05D4B5] font-semibold text-xs leading-none">✦</span>
                <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-white">
                  FRESH BED. FRESH YOU.
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-6xl md:text-7.5xl text-white font-medium leading-[1.08] tracking-tight">
                Fresh bedsheets <br />
                <span className="text-[#05D4B5] italic font-normal font-serif relative">
                  Every week.
                </span>
              </h1>

              <div className="text-lg sm:text-3xl font-bold text-[#05D4B5] tracking-wide">
                At just <span className="text-white font-black text-2xl sm:text-4xl">₹100</span>/month
              </div>

              <div className="inline-block mt-1 sm:mt-2">
                <p className="text-xs sm:text-base text-white max-w-lg leading-relaxed font-medium bg-[#05D4B5]/10 border border-[#05D4B5]/20 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full shadow-[0_0_20px_rgba(5,212,181,0.15)]">
                  <span className="text-gray-300">We deliver, we wash, we replace.</span> <span className="text-[#05D4B5] font-bold">You enjoy.</span>
                </p>
              </div>

              {/* Features checklist row from design */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2 sm:pt-4 pb-1 sm:pb-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 sm:p-2 bg-[#05D4B5]/10 text-[#05D4B5] rounded-xl shrink-0">
                    <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h4 className="text-[9px] sm:text-[11px] font-extrabold uppercase text-white tracking-wider leading-tight">100% Hygienic</h4>
                    <p className="text-[8px] sm:text-[9px] text-gray-400 font-medium mt-0.5 leading-none">Washed with care</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-1.5 sm:p-2 bg-[#05D4B5]/10 text-[#05D4B5] rounded-xl shrink-0">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h4 className="text-[9px] sm:text-[11px] font-extrabold uppercase text-white tracking-wider leading-tight">Weekly / Monthly</h4>
                    <p className="text-[8px] sm:text-[9px] text-gray-400 font-medium mt-0.5 leading-none">Flexible plans</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-1.5 sm:p-2 bg-[#05D4B5]/10 text-[#05D4B5] rounded-xl shrink-0">
                    <Leaf className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h4 className="text-[9px] sm:text-[11px] font-extrabold uppercase text-white tracking-wider leading-tight">Sustainable</h4>
                    <p className="text-[8px] sm:text-[9px] text-gray-400 font-medium mt-0.5 leading-none">Better for planet</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 sm:pt-4 flex flex-wrap gap-3 sm:gap-5 items-center">
                <a
                  href="/shop"
                  className="inline-flex items-center justify-center px-7 sm:px-9 py-3.5 sm:py-4.5 bg-[#05D4B5] text-[#032026] hover:bg-white hover:text-[#032026] font-sans text-2xs font-extrabold tracking-widest uppercase transition-all duration-300 rounded-full shadow-xl shadow-[#05D4B5]/10 hover:scale-105 active:scale-95"
                >
                  Start Renting
                </a>

                <a
                  href="#how-it-works"
                  onClick={(e) => handleScrollTo(e, "#how-it-works")}
                  className="inline-flex items-center gap-2.5 sm:gap-3.5 text-white hover:text-[#05D4B5] font-sans text-2xs font-extrabold tracking-widest uppercase transition-all duration-300 hover:scale-105"
                >
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full border border-white/20 flex items-center justify-center bg-white/5 hover:border-[#05D4B5] transition-all">
                    <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white fill-white translate-x-[0.5px]" />
                  </div>
                  <span>Watch Video</span>
                </a>
              </div>

            </div>

            {/* Right Column: Interactive 3D Visual Card (Redesigned folded bedding stack) */}
            <div className="hidden lg:flex lg:col-span-5 justify-end w-full">
              <HeroThreeDVisual />
            </div>
          </div>
        </div>

        {/* Scroll indicator pointing to How it works */}
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1.5 animate-bounce opacity-70 hover:opacity-100 transition-opacity">
          <a
            href="#how-it-works"
            onClick={(e) => handleScrollTo(e, "#how-it-works")}
            className="text-[9px] font-black uppercase tracking-[0.25em] text-[#05D4B5] hover:text-white transition-colors"
          >
            How it works
          </a>
          <ChevronDown className="w-4 h-4 text-[#05D4B5]" />
        </div>

        {/* Curved Wave Divider to transition to the light section */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-10 pointer-events-none">
          <svg className="relative block w-full h-[35px] sm:h-[50px] md:h-[80px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path d="M0,80 C300,130 600,30 1200,70 L1200,120 L0,120 Z" fill="#FCFBF9"></path>
          </svg>
        </div>
      </header>

      {/* 2. SOCIAL PROOF ROW */}
      <section className="bg-white py-6 sm:py-12 border-b border-[#0D1518]/05 shadow-sm text-center">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 text-center divide-y-0 md:divide-x divide-[#0D1518]/08">
            <div className="p-2.5 sm:p-4">
              <p className="text-base sm:text-2xl font-serif font-bold text-[#0D1518]">★★★★★ 4.9/5 Rating</p>
              <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider mt-1 sm:mt-2">Verified Member Reviews</p>
            </div>
            <div className="p-2.5 sm:p-4">
              <p className="text-base sm:text-2xl font-serif font-bold text-[#0D1518]">500+ Beds Swaps</p>
              <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider mt-1 sm:mt-2">Delivered and Collected</p>
            </div>
            <div className="p-2.5 sm:p-4">
              <p className="text-base sm:text-2xl font-serif font-bold text-[#0D1518]">99.9% Sanitized</p>
              <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider mt-1 sm:mt-2">Professionally Sterilized</p>
            </div>
            <div className="p-2.5 sm:p-4">
              <p className="text-base sm:text-2xl font-serif font-bold text-[#0D1518]">Free Swaps</p>
              <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider mt-1 sm:mt-2">Contactless collection</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW CLOSETRUSH WORKS — 3-Step Lifecycle Timeline */}
      <StaircaseWorkflow />

      {/* 4. PRICING PLANS */}
      <div id="pricing-plans" className="relative z-30">
        <SavingsTable />
      </div>

      {/* 5. WHO IT'S FOR (Target Personas Grid) */}
      <section className="py-12 sm:py-28 bg-[#FCFBF9] border-b border-[#0D1518]/05" id="who-it-is-for">
        <div className="max-w-[1380px] mx-auto px-5 sm:px-12 space-y-8 sm:space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-2 sm:space-y-4">
            <p className="text-micro-label">Designed for You</p>
            <h2 className="text-section-header">Who Is ClosetRush For?</h2>
            <p className="text-body text-[#0D1518]/60">
              We handle the sheets, you get back your weekends. See where you fit in.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-6">
            {[
              { title: "Students", desc: "Living away from home? Ditch poor hostel washing setups and sleep like royalty.", icon: Coffee },
              { title: "Working Professionals", desc: "Reclaim your weekends. Save hours spent washing, drying, and ironing sheets.", icon: Clock },
              { title: "PG Residents", desc: "Say goodbye to damp laundry, dirty shared lines, and smelly sheets.", icon: Smile },
              { title: "Rental Apartments", desc: "Perfect for flatmates and co-living spaces looking to split laundry efforts.", icon: Bed },
              { title: "Busy Families", desc: "Keep everyone's bedding fresh on autopilot. One less chore to manage.", icon: Heart }
            ].map((persona, idx) => {
              const IconComponent = persona.icon;
              return (
                <div key={idx} className="bg-white border border-[#0D1518]/05 p-3.5 sm:p-6 rounded-2xl sm:rounded-[28px] hover:border-[#05D4B5]/20 transition-all duration-300 flex flex-col justify-between shadow-[0_15px_40px_rgba(0,0,0,0.01)] hover:shadow-lg">
                  <div className="space-y-2 sm:space-y-4">
                    <div className="p-2.5 sm:p-4 bg-[#05D4B5]/05 text-[#05D4B5] border border-[#05D4B5]/10 rounded-xl sm:rounded-2xl w-fit">
                      <IconComponent className="w-5 h-5 sm:w-8 sm:h-8" />
                    </div>
                    <h3 className="font-sans font-extrabold text-xs sm:text-lg md:text-xl text-[#0D1518] leading-tight tracking-wider">{persona.title}</h3>
                    <p className="text-[11px] sm:text-base text-[#0D1518]/80 leading-relaxed font-medium">{persona.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* 7. LIFE CHANGE COMPARISON */}
      <LifeChangeComparison />

      {/* 8. OUR CLEANING PROCESS — 6-Stage Trust Facility Wash */}
      <InteractiveScience />

      {/* 8.5 HEALTH & HYGIENE SEO SECTION */}
      <section className="py-12 sm:py-24 bg-white border-b border-[#0D1518]/05 overflow-hidden" id="health-benefits">
        <div className="max-w-[1380px] mx-auto px-5 sm:px-12 space-y-10 sm:space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#05D4B5] font-mono">Medical Perspectives</p>
            <h2 className="font-serif text-3xl sm:text-5xl font-medium text-[#0D1518] leading-tight">
              Why Clean Bedding Matters For Your Health
            </h2>
            <p className="text-sm sm:text-base text-gray-600 leading-relaxed font-medium">
              We spend a third of our lives in bed. Discover how our weekly sanitized bedsheet swaps help create a germ-free sleeping environment, protecting you from common skin and respiratory issues.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#FCFBF9] p-6 sm:p-8 rounded-3xl border border-[#0D1518]/05 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-sans font-bold text-lg text-[#0D1518] mb-3">Acne & Skin Health</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Wondering if <strong>dirty pillowcases cause acne</strong>? Bacteria, sweat, and dead skin cells trap in fabric overnight. This contamination may contribute to face acne, back acne, and pimples. Regular swaps are the best bedding habit for acne-prone skin.
              </p>
            </div>
            
            <div className="bg-[#FCFBF9] p-6 sm:p-8 rounded-3xl border border-[#0D1518]/05 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-sans font-bold text-lg text-[#0D1518] mb-3">Asthma & Allergies</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                <strong>Dust mites in bedding</strong> are a primary trigger for morning allergy symptoms and nighttime asthma flare-ups. Our high-temperature commercial wash destroys allergens that cause allergic rhinitis and sneezing at night, ensuring you breathe easy.
              </p>
            </div>
            
            <div className="bg-[#FCFBF9] p-6 sm:p-8 rounded-3xl border border-[#0D1518]/05 shadow-sm hover:shadow-md transition-shadow">
              <h3 className="font-sans font-bold text-lg text-[#0D1518] mb-3">Eczema & Infections</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Sensitive skin requires hygienic bedsheets. Unwashed sheets harbor microbes that can worsen eczema (atopic dermatitis) or lead to fungal skin infections and itchy skin. Trust our clinical sanitization for true bed hygiene.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 9. REAL EMOTIONAL STORIES (Testimonials) */}
      <section className="py-12 sm:py-28 bg-[#032026] text-white border-y border-white/5 overflow-hidden relative" id="testimonials-section">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#05D4B5]/5 rounded-full blur-[120px] pointer-events-none" />
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee {
            display: flex;
            width: max-content;
            animation: marquee 30s linear infinite;
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}} />
        <div className="max-w-[1380px] mx-auto px-5 sm:px-12 space-y-6 sm:space-y-12 relative z-10">
          <div className="text-center max-w-2xl mx-auto space-y-2 sm:space-y-4">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#05D4B5] font-mono">Customer Stories</p>
            <h2 className="font-serif text-3xl sm:text-5xl font-medium text-white">What Our Members Say</h2>
          </div>

          <div className="relative w-full overflow-hidden pb-4">
            <div className="animate-marquee">
              {[
                { name: "Rohit K.", role: "Software Engineer", quote: "I used to wash bedsheets every Sunday. Now I haven't done sheets laundry in 4 months. The doorstep swap takes less than a minute." },
                { name: "Ananya S.", role: "Consultant", quote: "My rental apartment dryer is terrible. sheets take forever to dry. ClosetRush delivers crisp, vacuum-sealed hotel sheets every month on auto-pilot." },
                { name: "Kunal M.", role: "PG Resident", quote: "Hostel/PG laundry is a absolute mess. Now my bed smells amazing and looks clean. My roommates are already ordering subscriptions." },
                { name: "Rohit K.", role: "Software Engineer", quote: "I used to wash bedsheets every Sunday. Now I haven't done sheets laundry in 4 months. The doorstep swap takes less than a minute." },
                { name: "Ananya S.", role: "Consultant", quote: "My rental apartment dryer is terrible. sheets take forever to dry. ClosetRush delivers crisp, vacuum-sealed hotel sheets every month on auto-pilot." },
                { name: "Kunal M.", role: "PG Resident", quote: "Hostel/PG laundry is a absolute mess. Now my bed smells amazing and looks clean. My roommates are already ordering subscriptions." }
              ].map((review, idx) => (
                <div key={idx} className="w-[260px] sm:w-[400px] shrink-0 bg-white/5 border border-white/10 p-5 sm:p-8 rounded-2xl sm:rounded-[32px] shadow-2xl hover:border-[#05D4B5]/30 transition-all duration-300 flex flex-col justify-between min-h-0 sm:min-h-[180px] mr-4 sm:mr-8 backdrop-blur-sm">
                  <div className="space-y-3">
                    <div className="flex text-[#05D4B5] gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-gray-300 italic leading-relaxed font-light">
                      “{review.quote}”
                    </p>
                  </div>
                  <div className="pt-4 sm:pt-6 border-t border-white/10 mt-4 sm:mt-6">
                    <p className="font-serif text-xs sm:text-sm font-bold text-white">{review.name}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">{review.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 10. FAQ SECTION — Accordions */}
      <section className="py-12 sm:py-28 bg-[#FCFBF9] border-b border-[#0D1518]/05" id="faq-section-container">
        <div className="max-w-[780px] mx-auto px-5 space-y-8 sm:space-y-16">
          <div className="text-center space-y-2 sm:space-y-4">
            <p className="text-micro-label">Objections Solved</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium leading-tight">Got Questions?</h2>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-[#0D1518]/06 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between p-4 sm:p-6 text-left font-sans font-bold text-xs sm:text-base md:text-lg text-[#0D1518] hover:text-[#05D4B5] transition-all duration-300 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  <div
                    className={`transition-all duration-300 overflow-hidden ${isOpen ? "max-h-60 border-t border-gray-100" : "max-h-0"
                      }`}
                  >
                    <p className="p-4 sm:p-6 text-xs sm:text-sm text-gray-600 leading-relaxed font-medium">
                      {faq.a}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-6 sm:py-12 bg-[#FCFBF9] border-b border-[#0D1518]/05">
        <div className="max-w-[1380px] mx-auto px-5 sm:px-12">
          <div className="bg-[#032026] rounded-2xl sm:rounded-3xl p-5 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 text-white relative overflow-hidden shadow-lg border border-white/5">
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-64 h-64 bg-[#05D4B5]/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="relative z-10 space-y-2 sm:space-y-3 flex-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2.5">
                <span className="inline-block text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-[#032026] bg-[#05D4B5] px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full font-mono">
                  B2B
                </span>
                <p className="text-[10px] sm:text-[11px] font-extrabold tracking-widest text-[#05D4B5] uppercase">
                  For Hotels, Hostels & PGs
                </p>
              </div>
              <h2 className="font-serif text-xl sm:text-3xl font-bold leading-tight">Linen Swaps For Property Owners</h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-3 sm:gap-4 items-center text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#05D4B5]" />
                  <span className="text-gray-300 font-medium">Free delivery & returns</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#05D4B5]" />
                  <span className="text-gray-300 font-medium">Custom billing</span>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 shrink-0 bg-white/5 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-white/10 w-full sm:w-auto">
              <div className="text-center sm:text-right">
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-gray-400">Plans starting at</p>
                <p className="text-xl sm:text-2xl font-black text-[#05D4B5]">₹750<span className="text-xs sm:text-sm font-medium text-white/70">/mo</span></p>
              </div>
              <a
                href="/shop?type=B2B"
                className="inline-flex items-center justify-center w-full sm:w-auto px-6 sm:px-8 py-3 bg-white text-[#032026] hover:bg-[#05D4B5] font-sans text-2xs font-extrabold tracking-widest uppercase transition-all duration-300 rounded-xl shadow-md hover:scale-105 active:scale-95"
              >
                Request Quote
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 13. FOOTER & LEAD MAGNET */}
      <Footer showWaitlist={true} />

    </div>
  );
}
