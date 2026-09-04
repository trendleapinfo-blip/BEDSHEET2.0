"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MenuIcon, CloseIcon } from "./Icons";
import InstallPWA from "./InstallPWA";

export default function Navbar({ forceSolid = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolledState, setScrolled] = useState(false);
  const scrolled = scrolledState || forceSolid;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
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
    fetchSession();
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

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "Home", href: "/" },
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Plans & Subscribe", href: "/shop" },
    { name: "For PG/Hostel", href: "/shop?type=B2B" },
  ];

  return (
    <nav
      className={`fixed z-50 left-1/2 -translate-x-1/2 transition-all duration-500 ease-in-out top-2.5 sm:top-4 w-[calc(100%-1.25rem)] sm:w-[calc(100%-3rem)] md:w-[calc(100%-4rem)] max-w-[1240px] bg-white/95 backdrop-blur-xl border border-charcoal-ink/10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] rounded-full ${
        scrolled ? "py-2 sm:py-2.5" : "py-2.5 sm:py-3.5"
      }`}
    >
      <div className="w-full px-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 lg:gap-6 h-9 sm:h-11">
          {/* Logo / Brand */}
          <div className="flex-shrink-0 flex items-center whitespace-nowrap mr-1 sm:mr-2">
            <Link
              href="/"
              className="flex items-center gap-2 sm:gap-2.5 font-serif text-base sm:text-xl font-black tracking-[0.12em] transition-all duration-500 hover:opacity-80 text-charcoal-ink"
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden flex items-center justify-center shrink-0 border border-[#032026]/20 shadow-md bg-[#032026] p-0.5">
                <img
                  src="/logo.png"
                  alt="ClosetRush Logo"
                  className="h-full w-full object-cover rounded-full transform hover:scale-105 transition-transform"
                />
              </div>
              <span className="text-charcoal-ink font-serif text-sm sm:text-lg font-bold tracking-[0.05em] capitalize">
                ClosetRush
              </span>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center gap-3.5 xl:gap-6 shrink-0">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`font-extrabold tracking-widest uppercase transition-colors duration-300 hover:text-[#05D4B5] whitespace-nowrap text-[10px] xl:text-[11px] ${
                  scrolled ? "text-charcoal-ink/80" : "text-charcoal-ink/70"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop CTA Button */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0 ml-1 sm:ml-2">
            {!loading && user ? (
              <div className="flex items-center gap-2 xl:gap-3">
                <span className="hidden xl:inline-block text-charcoal-ink/60 font-extrabold text-[10px] uppercase tracking-widest whitespace-nowrap pr-1">
                  Hi, {user.name.split(" ")[0]}
                </span>

                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    className="inline-flex items-center justify-center px-3 py-1.5 sm:px-3.5 sm:py-2 border border-charcoal-ink/15 text-charcoal-ink hover:bg-charcoal-ink/05 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest rounded-full transition-all duration-300 whitespace-nowrap"
                  >
                    Admin
                  </Link>
                )}
                
                <InstallPWA />

                {user.role === "warehouse" ? (
                  <Link
                    href="/warehouse"
                    className="inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 bg-charcoal-ink text-white hover:bg-black text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest rounded-full transition-all duration-300 shadow-md whitespace-nowrap"
                  >
                    Warehouse
                  </Link>
                ) : user.role === "logistics" ? (
                  <Link
                    href="/logistics"
                    className="inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 bg-charcoal-ink text-white hover:bg-black text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest rounded-full transition-all duration-300 shadow-md whitespace-nowrap"
                  >
                    Logistics
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 bg-charcoal-ink text-white hover:bg-black text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest rounded-full transition-all duration-300 shadow-md whitespace-nowrap"
                  >
                    Dashboard
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 border border-charcoal-ink/10 text-charcoal-ink/50 hover:text-charcoal-ink hover:border-charcoal-ink/30 hover:bg-charcoal-ink/05 rounded-full transition-all duration-300 focus:outline-none"
                  title="Logout"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 xl:gap-3">
                <Link
                  href="/login"
                  className="text-charcoal-ink/80 hover:text-charcoal-ink font-extrabold text-[10px] uppercase tracking-widest transition-colors whitespace-nowrap px-2 xl:px-3"
                >
                  Login
                </Link>
                <InstallPWA />
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 text-[10px] font-extrabold uppercase tracking-widest rounded-full text-[#032026] bg-[#05D4B5] hover:bg-[#04bca0] transition-all duration-300 shadow-md shadow-[#05D4B5]/20 whitespace-nowrap"
                >
                  Subscribe Now
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-none text-charcoal-ink hover:text-linen-gold focus:outline-none transition-colors"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <div
        className={`lg:hidden absolute top-[calc(100%+0.5rem)] inset-x-0 bg-alabaster-linen/95 backdrop-blur-md border border-charcoal-ink/08 rounded-3xl shadow-xl transition-all duration-300 ease-in-out ${
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
        id="mobile-menu"
      >
        <div className="px-4 pt-4 pb-6 space-y-3 bg-alabaster-linen">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className="block px-3 py-2 text-xs font-bold uppercase tracking-wider text-charcoal-ink/80 hover:text-linen-gold transition-all"
            >
              {item.name}
            </Link>
          ))}
          <div className="pt-4 border-t border-charcoal-ink/08 px-3 space-y-2">
            {!loading && user ? (
              <div className="flex flex-col space-y-2">
                {user.role === "warehouse" ? (
                  <Link
                    href="/warehouse"
                    onClick={() => setIsOpen(false)}
                    className="block text-center px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-alabaster-linen bg-charcoal-ink hover:bg-linen-gold transition-all"
                  >
                    Warehouse
                  </Link>
                ) : user.role === "logistics" ? (
                  <Link
                    href="/logistics"
                    onClick={() => setIsOpen(false)}
                    className="block text-center px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-alabaster-linen bg-charcoal-ink hover:bg-linen-gold transition-all"
                  >
                    Logistics
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block text-center px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-alabaster-linen bg-charcoal-ink hover:bg-linen-gold transition-all"
                  >
                    Dashboard
                  </Link>
                )}
                {user.role === "admin" && (
                  <Link
                    href="/admin"
                    onClick={() => setIsOpen(false)}
                    className="block text-center px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-charcoal-ink bg-transparent border border-charcoal-ink/20 hover:bg-charcoal-ink/10 transition-all"
                  >
                    Admin Panel
                  </Link>
                )}
                <span className="block px-3 py-1 text-2xs uppercase tracking-wider font-semibold text-charcoal-ink/50">
                  Logged in as {user.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="block w-full text-center px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-charcoal-ink bg-transparent border border-charcoal-ink/10 hover:bg-charcoal-ink/05 transition-all"
                >
                  Logout
                </button>
                <div className="flex justify-center mt-2">
                  <InstallPWA />
                </div>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-charcoal-ink bg-transparent border border-charcoal-ink/10 hover:bg-charcoal-ink/05 transition-all"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setIsOpen(false)}
                  className="block text-center px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-[#032026] bg-[#05D4B5] hover:bg-white hover:text-[#032026] transition-all"
                >
                  Subscribe Now
                </Link>
                <div className="flex justify-center mt-4 mb-2">
                  <InstallPWA />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
