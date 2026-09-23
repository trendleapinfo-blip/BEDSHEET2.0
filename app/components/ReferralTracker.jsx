"use client";

import { useEffect } from "react";

export default function ReferralTracker() {
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;

      const params = new URLSearchParams(window.location.search);
      const refCode = (params.get("ref") || params.get("partner") || params.get("referral"))?.trim();

      if (refCode) {
        const cleanCode = refCode.toUpperCase();
        
        // Save to localStorage
        localStorage.setItem("closerush_ref_code", cleanCode);
        
        // Save to cookie (30 days)
        document.cookie = `closerush_ref_code=${cleanCode}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;

        // Check if click was already recorded in this session for this specific code
        const sessionKey = `ref_tracked_${cleanCode}`;
        if (!sessionStorage.getItem(sessionKey)) {
          sessionStorage.setItem(sessionKey, "true");

          // Send click beacon to API
          fetch("/api/public/partner-click", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code: cleanCode }),
          }).catch((err) => console.debug("[ReferralTracker Click Record Err]:", err));
        }
      }
    } catch (e) {
      console.debug("[ReferralTracker Error]:", e);
    }
  }, []);

  return null;
}
