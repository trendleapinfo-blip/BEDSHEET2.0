"use client";

import React from "react";
import { CheckIcon, SparklesIcon, BedIcon } from "./Icons";

export default function SubscriptionModal({ plan, onClose }) {
  if (!plan) return null;

  const isSingle = plan.bedType === "single";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-charcoal-ink/60 backdrop-blur-md transition-opacity duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="relative bg-white rounded-[2.5rem] max-w-[500px] w-full p-8 md:p-10 shadow-2xl border border-slate-100 z-10 overflow-hidden transform transition-all duration-300 scale-100 animate-[fadeIn_0.2s_ease-out]">
        
        {/* Sparkles top right */}
        <div className="absolute -top-6 -right-6 w-24 h-24 bg-linen-gold/10 rounded-full flex items-center justify-center opacity-70 pointer-events-none">
          <SparklesIcon className="w-8 h-8 text-linen-gold mt-4 mr-4 animate-pulse" />
        </div>

        {/* Modal Content */}
        <div className="text-center">
          
          {/* Animated Big Checkmark */}
          <div className="mx-auto w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mb-6 relative">
            <span className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping"></span>
            <div className="p-4 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
              <CheckIcon className="w-8 h-8" strokeWidth="3" />
            </div>
          </div>

          <h3 className="text-2xl md:text-3xl font-extrabold text-charcoal-ink mb-2 tracking-tight">
            Subscription Confirmed!
          </h3>
          <p className="text-charcoal-ink/50 text-sm font-semibold mb-8 max-w-sm mx-auto leading-relaxed">
            Thank you for choosing ClosetRush. Your fresh sheet plan is now scheduled.
          </p>

          {/* Details Card */}
          <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 mb-8 text-left space-y-4">
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <BedIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-charcoal-ink/40 font-bold uppercase tracking-wider leading-none mb-1">Mattress Type</p>
                  <p className="text-sm font-black text-charcoal-ink leading-none">
                    {isSingle ? "Single Bed" : "Double Bed"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-charcoal-ink/40 font-bold uppercase tracking-wider leading-none mb-1">Service Option</p>
                  <p className="text-xs font-extrabold text-[#245c77] leading-none uppercase">
                    {(plan.subscriptionType || "monthly") === "weekly" ? "Weekly Change" : "Monthly Kit"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200/60 text-xs font-semibold">
              <div>
                <p className="text-[10px] text-charcoal-ink/40 font-bold uppercase tracking-wider mb-1">Plan Period</p>
                <p className="font-extrabold text-charcoal-ink">{plan.planName} ({plan.duration})</p>
              </div>
              <div>
                <p className="text-[10px] text-charcoal-ink/40 font-bold uppercase tracking-wider mb-1">Base Billing Rate</p>
                <p className="font-extrabold text-charcoal-ink">₹{plan.price}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs font-semibold">
              <div>
                <p className="text-[10px] text-charcoal-ink/40 font-bold uppercase tracking-wider mb-1">Base Amount (Excl. GST)</p>
                <p className="font-extrabold text-slate-600">₹{(plan.price / 1.18).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[10px] text-charcoal-ink/40 font-bold uppercase tracking-wider mb-1">GST (18%)</p>
                <p className="font-extrabold text-slate-600">₹{(plan.price - (plan.price / 1.18)).toFixed(2)}</p>
              </div>
            </div>

            {(plan.color || plan.fabric || plan.print) && (
              <div className="pt-3 border-t border-slate-100 text-xs font-semibold">
                <p className="text-[10px] text-charcoal-ink/40 font-bold uppercase tracking-wider mb-1">Custom Selections</p>
                <p className="font-extrabold text-slate-700">
                  {[
                    plan.color && `Color: ${plan.color}`,
                    plan.fabric && `Fabric: ${plan.fabric}`,
                    plan.print && `Print: ${plan.print}`
                  ].filter(Boolean).join(" | ")}
                </p>
              </div>
            )}

            <div className="pt-4 border-t border-[#245c77]/10 flex justify-between items-baseline">
              <p className="text-2xs font-extrabold text-[#245c77] uppercase tracking-wider">Total Paid Upfront</p>
              <p className="text-lg font-black text-[#245c77]">₹{plan.totalPrice || (plan.price + (plan.securityDeposit !== undefined ? plan.securityDeposit : (isSingle ? 500 : 800)))}</p>
            </div>

            <div className="pt-4 border-t border-charcoal-ink/10">
              <p className="text-[10px] text-linen-gold font-extrabold uppercase tracking-wider mb-1 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-linen-gold animate-ping"></span>
                {(plan.subscriptionType || "monthly") === "weekly" ? "Weekly Change Schedule" : "First Delivery Status"}
              </p>
              <p className="text-xs text-charcoal-ink/60 font-medium">
                {(plan.subscriptionType || "monthly") === "weekly"
                  ? "Our delivery team is preparing your first weekly swap. A support representative will call you to confirm your weekly visit timings."
                  : "Sealed sterile bedding setup dispatching within 24 hours. Our support representative will call you to coordinate timings."}
              </p>
            </div>

          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            className="w-full py-4 px-6 rounded-none bg-charcoal-ink hover:bg-linen-gold text-alabaster-linen font-bold text-sm tracking-wide shadow-md transition-all cursor-pointer hover:scale-101 active:scale-99"
          >
            Awesome, Let's Sleep Fresh!
          </button>

        </div>
      </div>
    </div>
  );
}
