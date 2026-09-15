"use client";

import React, { useRef, useEffect } from "react";

export default function HeroThreeDVisual() {
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const badgeRef = useRef(null);
  const glowRef = useRef(null);
  const shineRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const isMobile = window.innerWidth < 640;
    const baseShift = isMobile ? 0 : -40;

    // Set initial 3D transforms for proper depth rendering
    if (badgeRef.current) {
      badgeRef.current.style.transform = `translate3d(${baseShift}px, 0px, 60px) rotateZ(-5deg)`;
    }
    if (glowRef.current) {
      glowRef.current.style.transform = "translate3d(0px, 0px, -20px) scale(1)";
    }

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const width = rect.width;
      const height = rect.height;

      // Normalized coordinates from -0.5 to 0.5
      const normX = (x / width) - 0.5;
      const normY = (y / height) - 0.5;

      const isMob = window.innerWidth < 640;
      const bShift = isMob ? 0 : -40;

      // Card tilting angles
      const rotateX = -normY * 12;
      const rotateY = normX * 12;

      // Apply rotation to the main card
      if (cardRef.current) {
        cardRef.current.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        cardRef.current.style.transition = "transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)";
      }

      // Parallax: badge floats slightly
      if (badgeRef.current) {
        const badgeX = normX * 15 + bShift;
        const badgeY = normY * 15;
        badgeRef.current.style.transform = `translate3d(${badgeX}px, ${badgeY}px, 80px) rotateZ(-5deg)`;
        badgeRef.current.style.transition = "transform 0.15s cubic-bezier(0.25, 1, 0.5, 1)";
      }

      // Dynamic ambient glow movement behind card
      if (glowRef.current) {
        const glowX = normX * 25;
        const glowY = normY * 25;
        glowRef.current.style.transform = `translate3d(${glowX}px, ${glowY}px, -30px) scale(1.08)`;
        glowRef.current.style.opacity = "1";
        glowRef.current.style.transition = "transform 0.15s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.3s ease";
      }

      // Dynamic glare shine overlay on card surface
      if (shineRef.current) {
        const shineX = (x / width) * 100;
        const shineY = (y / height) * 100;
        shineRef.current.style.background = `radial-gradient(circle at ${shineX}% ${shineY}%, rgba(5, 212, 181, 0.12) 0%, rgba(255, 255, 255, 0.2) 30%, rgba(255, 255, 255, 0) 70%)`;
        shineRef.current.style.opacity = "1";
        shineRef.current.style.transition = "opacity 0.1s ease";
      }
    };

    const handleMouseLeave = () => {
      const isMob = window.innerWidth < 640;
      const bShift = isMob ? 0 : -40;

      // Smoothly reset all elements
      if (cardRef.current) {
        cardRef.current.style.transform = "rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
        cardRef.current.style.transition = "transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)";
      }
      if (badgeRef.current) {
        badgeRef.current.style.transform = `translate3d(${bShift}px, 0px, 60px) rotateZ(-5deg)`;
        badgeRef.current.style.transition = "transform 0.8s cubic-bezier(0.25, 1, 0.5, 1)";
      }
      if (glowRef.current) {
        glowRef.current.style.transform = "translate3d(0px, 0px, -20px) scale(1)";
        glowRef.current.style.opacity = "0.7";
        glowRef.current.style.transition = "transform 0.8s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.8s ease";
      }
      if (shineRef.current) {
        shineRef.current.style.opacity = "0";
        shineRef.current.style.transition = "opacity 0.8s ease";
      }
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-[320px] sm:max-w-[500px] aspect-[4/3] select-none cursor-default font-sans mx-auto"
      style={{
        perspective: "1200px",
        transformStyle: "preserve-3d",
      }}
    >
      {/* Decorative background glow (Teal accent) */}
      <div
        ref={glowRef}
        className="absolute inset-0 bg-gradient-to-tr from-[#05D4B5]/20 via-transparent to-transparent rounded-[32px] blur-3xl -z-10 opacity-75 pointer-events-none"
        style={{
          transformStyle: "preserve-3d",
        }}
      />

      {/* Main Card holding Bedding Image */}
      <div
        ref={cardRef}
        className="w-full h-full bg-[#032026]/40 border border-white/10 rounded-2xl sm:rounded-[32px] p-1.5 sm:p-3 shadow-2xl relative overflow-hidden flex items-center justify-center"
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {/* Shine Overlay Layer */}
        <div
          ref={shineRef}
          className="absolute inset-0 pointer-events-none z-50 rounded-[inherit] mix-blend-color-dodge opacity-0"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 60%)",
          }}
        />

        {/* Ambient Waves inside card */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden opacity-20">
          <div className="absolute -right-20 -bottom-20 w-60 h-60 rounded-full bg-[#05D4B5]/10 blur-xl" />
        </div>

        {/* Bedding Graphic Stack */}
        <div 
          className="w-full h-full relative rounded-xl sm:rounded-[24px] overflow-hidden border border-white/10 flex items-center justify-center bg-[#032026] shadow-inner z-10"
          style={{ transform: "translateZ(12px)" }}
        >
          <img
            src="/hero_bedding.png"
            alt="Sterile Bedding Bundle Stack"
            className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
            onError={(e) => {
              // High quality luxury hotel bedding stack fallback
              e.target.src = "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80";
            }}
          />
        </div>
      </div>

      {/* Floating Price Badge (Layered above the image card, inside viewport on mobile) */}
      <div
        ref={badgeRef}
        className="absolute -left-2 sm:-left-10 top-2 sm:top-1/2 sm:-translate-y-1/2 bg-white border-[2.5px] sm:border-[3px] border-[#05D4B5] rounded-full w-20 h-20 sm:w-32 sm:h-32 shadow-2xl flex flex-col items-center justify-center z-30 pointer-events-none select-none"
        style={{
          transform: "translate3d(0px, 0px, 60px) rotateZ(-5deg)",
          transformStyle: "preserve-3d",
        }}
      >
        <span className="text-[6.5px] sm:text-[8px] font-black uppercase text-[#032026]/60 tracking-wider mb-0.5 leading-none">
          AS LOW AS
        </span>
        <span className="text-lg sm:text-3.5xl font-black text-[#05D4B5] font-serif leading-none py-0.5 sm:py-1">
          ₹100
        </span>
        <span className="text-[6.5px] sm:text-[8px] font-black text-[#032026]/60 uppercase tracking-widest leading-none">
          /MONTH
        </span>

        {/* Decorative sunburst rays at top right */}
        <div className="absolute -top-2 -right-2 sm:-top-3.5 sm:-right-3.5 text-[#05D4B5] pointer-events-none">
          <svg className="w-4 h-4 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <line x1="12" y1="6" x2="12" y2="2" />
            <line x1="16.5" y1="7.5" x2="19.5" y2="4.5" />
            <line x1="18" y1="12" x2="22" y2="12" />
          </svg>
        </div>
      </div>
    </div>
  );
}
