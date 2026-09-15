"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Phone, ShieldCheck, Check, ArrowRight } from "lucide-react";

export const LinkedInIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

export const InstagramIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

export const YoutubeIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export const FacebookIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);

export const WhatsAppIcon = ({ className = "w-4 h-4" }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

export const mandatorySocialLinks = [
  {
    name: "LinkedIn",
    label: "LinkedIn",
    handle: "ClosetRush",
    href: "https://www.linkedin.com/company/closet-rush/",
    icon: LinkedInIcon,
    hoverClass: "hover:bg-[#0A66C2]/20 hover:border-[#0A66C2] hover:text-white",
    colorText: "text-[#0A66C2]",
  },
  {
    name: "Instagram",
    label: "Instagram",
    handle: "@closetrush_official",
    href: "https://www.instagram.com/closetrush_official?igsh=bTN1ZHhhN2Fvdzdv",
    icon: InstagramIcon,
    hoverClass: "hover:bg-[#E4405F]/20 hover:border-[#E4405F] hover:text-white",
    colorText: "text-[#E4405F]",
  },
  {
    name: "YouTube",
    label: "YouTube",
    handle: "@Closetrush_official",
    href: "https://www.youtube.com/@Closetrush_official",
    icon: YoutubeIcon,
    hoverClass: "hover:bg-[#FF0000]/20 hover:border-[#FF0000] hover:text-white",
    colorText: "text-[#FF0000]",
  },
  {
    name: "Facebook",
    label: "Facebook",
    handle: "ClosetRush",
    href: "https://www.facebook.com/share/1HHX3sAgZG/",
    icon: FacebookIcon,
    hoverClass: "hover:bg-[#1877F2]/20 hover:border-[#1877F2] hover:text-white",
    colorText: "text-[#1877F2]",
  },
  {
    name: "WhatsApp",
    label: "WhatsApp",
    handle: "+91 75248 88707",
    href: "https://wa.me/+917524888707",
    icon: WhatsAppIcon,
    hoverClass: "hover:bg-[#25D366]/20 hover:border-[#25D366] hover:text-white",
    colorText: "text-[#25D366]",
  },
];

export default function Footer({ showWaitlist = true }) {
  const [leadEmail, setLeadEmail] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [claimedWaitlist, setClaimedWaitlist] = useState(false);

  const handleWaitlistSubmit = (e) => {
    e.preventDefault();
    if (leadEmail && leadPhone) {
      setClaimedWaitlist(true);
    }
  };

  return (
    <footer id="footer" className="relative bg-[#032026] text-[#FCFBF9] pt-10 pb-8 mt-12 border-t border-white/10 z-20">
      {/* Thin Wave Top Accent */}
      <div className="absolute top-0 left-0 w-full overflow-hidden leading-none z-0 transform -translate-y-[98%] pointer-events-none opacity-80">
        <svg className="relative block w-full h-[32px] sm:h-[48px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M0,0 V46.29 C142.14,14.61 284.28,14.61 426.42,46.29 C568.57,77.96 710.71,77.96 852.86,46.29 C995,14.61 1137.14,14.61 1200,0 L1200,120 L0,120 Z" fill="#032026" />
        </svg>
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 space-y-8">
        {/* Compact Waitlist Bar (if enabled) */}
        {showWaitlist && (
          <div className="bg-white/05 border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="w-2 h-2 rounded-full bg-[#05D4B5] animate-pulse" />
                <h3 className="text-sm font-serif font-bold text-white tracking-wide">Join Priority Waitlist</h3>
                <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#05D4B5] bg-[#05D4B5]/10 px-2 py-0.5 rounded-full">Active</span>
              </div>
              <p className="text-3xs text-gray-300 font-normal">
                Gurugram & Noida • Clean Bed Sheets Delivered to Doorstep @ ₹100/month
              </p>
            </div>

            <div id="signup" className="w-full md:w-auto">
              {claimedWaitlist ? (
                <div className="flex items-center gap-2 text-xs text-[#10B981] font-bold bg-[#10B981]/15 border border-[#10B981]/30 px-4 py-2 rounded-xl">
                  <Check className="w-4 h-4" /> Waitlist Spot Secured!
                </div>
              ) : (
                <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <div className="relative flex items-center bg-black/20 border border-white/15 rounded-xl px-3 py-1.5 focus-within:border-[#05D4B5]">
                    <Mail className="w-3.5 h-3.5 text-[#05D4B5] shrink-0" />
                    <input
                      type="email"
                      required
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      placeholder="Email address"
                      className="w-full sm:w-36 pl-2 pr-1 bg-transparent text-white placeholder-white/40 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="relative flex items-center bg-black/20 border border-white/15 rounded-xl px-3 py-1.5 focus-within:border-[#05D4B5]">
                    <Phone className="w-3.5 h-3.5 text-[#05D4B5] shrink-0" />
                    <input
                      type="tel"
                      required
                      value={leadPhone}
                      onChange={(e) => setLeadPhone(e.target.value)}
                      placeholder="Phone number"
                      className="w-full sm:w-32 pl-2 pr-1 bg-transparent text-white placeholder-white/40 text-xs focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="py-2 px-4 bg-[#05D4B5] hover:bg-white text-[#032026] font-extrabold text-[11px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 shrink-0 cursor-pointer shadow-sm"
                  >
                    Join <ArrowRight className="w-3 h-3" />
                  </button>
                </form>
              )}
            </div>
          </div>
        )}

        {/* Compact Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 pt-2">
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-[#05D4B5]/30 shadow-md bg-[#032026] p-0.5">
                <img src="/logo.png" alt="ClosetRush Logo" className="h-full w-full object-cover rounded-full" />
              </div>
              <span className="text-lg font-serif font-bold text-[#05D4B5] tracking-wider uppercase">
                ClosetRush
              </span>
            </div>
            <p className="text-3xs text-gray-300 leading-relaxed max-w-xs font-normal">
              India&apos;s 1st bedsheet rental service. Pure organic luxury linens, 100°C sanitized, delivered at ₹100/month.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#05D4B5]/10 border border-[#05D4B5]/20 rounded-full text-[9px] text-[#05D4B5] font-bold">
              <ShieldCheck className="w-3 h-3" />
              <span>100°C Sanitized Standard</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#05D4B5]">Explore</p>
            <ul className="space-y-1.5 text-2xs text-gray-300 font-medium">
              <li><Link href="/" className="hover:text-[#05D4B5] transition-colors">Home</Link></li>
              <li><Link href="/blog" className="hover:text-[#05D4B5] transition-colors">Blog & Sleep Guides</Link></li>
              <li><Link href="/shop" className="hover:text-[#05D4B5] transition-colors">Shop Bedding</Link></li>
              <li><Link href="/about" className="hover:text-[#05D4B5] transition-colors">About Us</Link></li>
              <li><Link href="/location" className="hover:text-[#05D4B5] transition-colors">Service Locations</Link></li>
            </ul>
          </div>

          {/* Policies & Terms */}
          <div className="space-y-2">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#05D4B5]">Policies & Terms</p>
            <ul className="space-y-1.5 text-2xs text-gray-300 font-medium">
              <li><Link href="/terms" className="hover:text-[#05D4B5] transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-[#05D4B5] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/shipping" className="hover:text-[#05D4B5] transition-colors">Shipping & Delivery</Link></li>
              <li><Link href="/cancellation" className="hover:text-[#05D4B5] transition-colors">Cancellations & Refunds</Link></li>
              <li><Link href="/login" className="hover:text-[#05D4B5] transition-colors">Member Sign In</Link></li>
            </ul>
          </div>

          {/* MANDATORY PROPER SOCIAL LINKS (Compact & Stylish) */}
          <div className="space-y-2">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-[#05D4B5]">Follow Us</p>
            <p className="text-3xs text-gray-400 font-normal">Connect with ClosetRush official handles:</p>
            <div className="flex flex-col gap-1.5 pt-1">
              {mandatorySocialLinks.map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg border border-white/10 bg-white/05 transition-all text-xs font-medium text-white group ${social.hoverClass}`}
                  >
                    <div className="flex items-center gap-2">
                      <IconComponent className={`w-3.5 h-3.5 ${social.colorText} group-hover:text-white transition-colors`} />
                      <span className="text-2xs font-semibold">{social.label}</span>
                    </div>
                    <span className="text-[10px] text-white/50 group-hover:text-white/90 font-mono">
                      {social.handle}
                    </span>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-3xs text-white/50">
          <div>
            © {new Date().getFullYear()} ClosetRush. All rights reserved. • Pure Bedding, Fresh Everyday.
          </div>

          <div className="flex items-center gap-2">
            <span className="uppercase font-bold tracking-widest text-[9px] text-white/40 mr-1">Socials:</span>
            {mandatorySocialLinks.map((social) => {
              const IconComponent = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className="w-7 h-7 rounded-full border border-white/10 bg-white/05 flex items-center justify-center text-white/70 hover:text-[#05D4B5] hover:border-[#05D4B5] hover:bg-[#05D4B5]/10 transition-all"
                >
                  <IconComponent className="w-3.5 h-3.5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
