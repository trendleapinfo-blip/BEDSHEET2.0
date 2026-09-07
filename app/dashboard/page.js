"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../components/Navbar";
import PushNotificationManager from "../components/PushNotificationManager";
import { 
  User, 
  CreditCard, 
  HelpCircle, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Sparkles, 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  ArrowRight, 
  Trash2, 
  Calendar, 
  FileText, 
  Check, 
  Plus, 
  RefreshCw, 
  XCircle,
  X,
  Clock,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
  Package,
  Truck,
  AlertTriangle
} from "lucide-react";

const formatDate = (dateVal) => {
  if (!dateVal) return "—";
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return "—";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

export default function Dashboard() {
  const router = useRouter();
  
  // Auth state
  const [user, setUser] = useState(null);
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Navigation tab: 'overview' | 'subscription' | 'corporate' | 'support' | 'profile'
  const [activeTab, setActiveTab] = useState("overview");

  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
    accountType: "Individual User"
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  // PWA Install Event Listener
  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      window.deferredPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  // Orders, Quotes, and Bundles States
  const [orders, setOrders] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [refunds, setRefunds] = useState([]);
  
  // Pause/Vacation Mode States
  const [showPauseModal, setShowPauseModal] = useState(false);
  const [pauseDuration, setPauseDuration] = useState("1 week");
  const [pauseAction, setPauseAction] = useState("hold");
  const [pauseSubmitting, setPauseSubmitting] = useState(false);
  
  // Support tickets state
  const [tickets, setTickets] = useState([]);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketPriority, setTicketPriority] = useState("MEDIUM");
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketSuccess, setTicketSuccess] = useState("");
  const [ticketError, setTicketError] = useState("");

  // Corporate Quote Estimator state
  const [quoteForm, setQuoteForm] = useState({
    businessName: "",
    businessType: "PG",
    propertiesCount: 1,
    unitsCount: 10,
    bundleSelections: "Single Bed Bundle",
    message: ""
  });
  const [quoteEstimator, setQuoteEstimator] = useState({
    unitPrice: 250,
    bulkDiscount: 0,
    estimatedTotal: 2500
  });
  const [quoteSubmitting, setQuoteSubmitting] = useState(false);
  const [quoteSuccess, setQuoteSuccess] = useState("");
  const [quoteError, setQuoteError] = useState("");

  // Plan changing states
  const [planSubmitting, setPlanSubmitting] = useState(false);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [subscriptionSuccess, setSubscriptionSuccess] = useState("");
  const [subscriptionError, setSubscriptionError] = useState("");
  const [dbPlans, setDbPlans] = useState([]);

  // Check auth and fetch data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/user/profile");
      if (res.ok) {
        const data = await res.json();
        
        let fetchedUser = data.user;
        
        // If mobile is missing, redirect to onboarding (mandatory phone number)
        if (!fetchedUser.mobile) {
          router.replace("/onboarding");
          return;
        }

        const fetchedOrders = data.orders || [];
        
        // Handle B2B confirmed quotes where plan is empty but order is active
        const activeOrder = fetchedOrders.find(o => o.status === "ACTIVE");
        if ((!fetchedUser.selectedPlan || !fetchedUser.selectedPlan.planName) && activeOrder) {
           fetchedUser.selectedPlan = {
              planName: activeOrder.bundleName || "Custom Setup",
              bedType: activeOrder.bundleName?.toLowerCase().includes("single") ? "single" : "double",
              price: activeOrder.finalPrice || 0,
              duration: activeOrder.duration || "12 Months",
              subscriptionType: "monthly",
              orderType: activeOrder.orderType || "RENT",
              itemTier: activeOrder.itemTier || "PREMIUM",
              gst: Math.round((activeOrder.finalPrice || 0) * 0.18),
              totalPrice: (activeOrder.finalPrice || 0) + Math.round((activeOrder.finalPrice || 0) * 0.18),
              startDate: activeOrder.startDate || new Date(),
           };
        }

        setUser(fetchedUser);
        setOrders(fetchedOrders);
        setQuotes(data.quotes || []);
        setBundles(data.bundles || []);
        setRefunds(data.refunds || []);
        
        // Pre-fill profile form
        setProfileForm({
          name: data.user.name || "",
          email: data.user.email || "",
          mobile: data.user.mobile || "",
          address: data.user.address || "",
          accountType: data.user.accountType || "Individual User"
        });

        // Pre-fill B2B business name
        setQuoteForm(prev => ({
          ...prev,
          businessName: data.user.name + " Properties"
        }));
      } else {
        // Not authenticated
        router.push("/login?redirect=dashboard");
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
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
          setDbPlans(data.plans);
        }
      }
    } catch (err) {
      console.error("Error fetching plans:", err);
    }
  };

  // Fetch Tickets
  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/user/support");
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchTickets();
    fetchPlans();
  }, []);

  // Calculate B2B quote estimates automatically
  useEffect(() => {
    const units = Number(quoteForm.unitsCount) || 0;
    const properties = Number(quoteForm.propertiesCount) || 0;
    
    let basePrice = 250; // standard commercial rate
    if (quoteForm.bundleSelections === "Double Bed Bundle") {
      basePrice = 400;
    } else if (quoteForm.bundleSelections === "Premium Set") {
      basePrice = 600;
    }

    // Discount calculations
    let discount = 0;
    if (units >= 100) {
      discount = 0.20; // 20% off
    } else if (units >= 50) {
      discount = 0.15; // 15% off
    } else if (units >= 20) {
      discount = 0.10; // 10% off
    }

    const rawTotal = basePrice * units * properties;
    const finalTotal = Math.round(rawTotal * (1 - discount));

    setQuoteEstimator({
      unitPrice: basePrice,
      bulkDiscount: Math.round(discount * 100),
      estimatedTotal: finalTotal
    });
  }, [quoteForm.unitsCount, quoteForm.propertiesCount, quoteForm.bundleSelections]);

  // Handle Profile Update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");

    if (!profileForm.name.trim() || !profileForm.email.trim() || !profileForm.mobile.trim()) {
      setProfileError("Name, Email, and Mobile number are required fields.");
      return;
    }

    if (!/^\d{10}$/.test(profileForm.mobile)) {
      setProfileError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (profileForm.pincode) {
      if (!/^\d{6}$/.test(profileForm.pincode)) {
        setProfileError("Please enter a valid 6-digit pincode.");
        return;
      }
      const pinPrefix = profileForm.pincode.substring(0, 2);
      if (pinPrefix !== "11" && pinPrefix !== "12" && pinPrefix !== "13" && pinPrefix !== "20") {
        setProfileError("ClosetRush is active in Delhi (11xxxx), Gurugram Sectors (12xxxx/13xxxx), and Noida NCR (20xxxx).");
        return;
      }
    }

    setProfileSaving(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profileForm)
      });
      
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setProfileSuccess("Your profile details have been successfully updated!");
        setTimeout(() => setProfileSuccess(""), 4000);
      } else {
        setProfileError(data.error || "Failed to update profile.");
      }
    } catch (err) {
      setProfileError("Network error occurred. Please try again.");
    } finally {
      setProfileSaving(false);
    }
  };

  const [deletingAccount, setDeletingAccount] = useState(false);

  const handleDeleteAccount = async () => {
    setProfileError("");
    setProfileSuccess("");

    const confirmed = confirm(
      "Are you sure you want to permanently delete your ClosetRush account? This action cannot be undone."
    );
    if (!confirmed) return;

    setDeletingAccount(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "DELETE"
      });
      const data = await res.json();
      if (res.ok) {
        alert("Your account has been deleted successfully.");
        window.location.href = "/";
      } else {
        setProfileError(data.error || "Failed to delete account.");
      }
    } catch (err) {
      setProfileError("Network error occurred while attempting to delete account.");
    } finally {
      setDeletingAccount(false);
    }
  };

  // Handle Support Ticket Submit
  const handleTicketSubmit = async (e) => {
    e.preventDefault();
    setTicketError("");
    setTicketSuccess("");
    setTicketSubmitting(true);

    if (!ticketSubject.trim()) {
      setTicketError("Please describe your request or issue.");
      setTicketSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/user/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: ticketSubject,
          priority: ticketPriority
        })
      });

      const data = await res.json();
      if (res.ok) {
        setTicketSuccess("Support ticket opened successfully. We will contact you soon!");
        setTicketSubject("");
        fetchTickets();
        setTimeout(() => setTicketSuccess(""), 4000);
      } else {
        setTicketError(data.error || "Failed to open support ticket.");
      }
    } catch (err) {
      setTicketError("Network error occurred.");
    } finally {
      setTicketSubmitting(false);
    }
  };

  // Handle Corporate Quote Submit
  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    setQuoteError("");
    setQuoteSuccess("");
    setQuoteSubmitting(true);

    try {
      const res = await fetch("/api/user/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...quoteForm,
          estimatedTotal: quoteEstimator.estimatedTotal
        })
      });

      const data = await res.json();
      if (res.ok) {
        setQuoteSuccess("Corporate quotation request submitted successfully. Check status below!");
        setQuotes(prev => [data.quote, ...prev]);
        setQuoteForm(prev => ({
          ...prev,
          message: ""
        }));
        setTimeout(() => setQuoteSuccess(""), 4000);
      } else {
        setQuoteError(data.error || "Failed to submit quote request.");
      }
    } catch (err) {
      setQuoteError("Network error occurred.");
    } finally {
      setQuoteSubmitting(false);
    }
  };

  const handleUpdateUserQuoteStatus = async (quoteId, status) => {
    try {
      const res = await fetch("/api/user/quote", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quoteId, status })
      });
      if (res.ok) {
        await fetchDashboardData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to update quote status.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error updating quote status.");
    }
  };

  // Open checkout modal instead of immediate submission
  const handleSelectPlan = (bedType, planName, price, duration) => {
    localStorage.setItem("checkout_pending", JSON.stringify({ bedType, planName, price, duration }));
    window.location.href = "/checkout";
  };

  const handleConfirmCheckout = async (finalPlanData) => {
    setSubscriptionError("");
    setSubscriptionSuccess("");
    setPlanSubmitting(true);

    try {
      const res = await fetch("/api/user/select-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPlanData)
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setCheckoutPlan(null);
        setSubscriptionSuccess(`Plan changed to ${finalPlanData.planName} (${finalPlanData.bedType}) successfully!`);
        
        // Auto reload data to fetch updated order status
        const profileRes = await fetch("/api/user/profile");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setOrders(profileData.orders || []);
        }

        setTimeout(() => setSubscriptionSuccess(""), 4000);
      } else {
        setSubscriptionError(data.error || "Failed to select subscription plan.");
      }
    } catch (err) {
      setSubscriptionError("Network error occurred. Please check connection.");
    } finally {
      setPlanSubmitting(false);
    }
  };

  // Handle Subscription Cancel
  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your ClosetRush subscription? This will cancel all scheduled deliveries.")) {
      return;
    }

    setSubscriptionError("");
    setSubscriptionSuccess("");
    setCancelSubmitting(true);

    try {
      const res = await fetch("/api/user/cancel-plan", {
        method: "POST"
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setSubscriptionSuccess("Subscription cancelled. Active orders marked as cancelled.");
        
        // Refresh orders and refunds list
        const profileRes = await fetch("/api/user/profile");
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setOrders(profileData.orders || []);
          setRefunds(profileData.refunds || []);
        }

        setTimeout(() => setSubscriptionSuccess(""), 4000);
      } else {
        setSubscriptionError(data.error || "Failed to cancel subscription.");
      }
    } catch (err) {
      setSubscriptionError("Network error occurred.");
    } finally {
      setCancelSubmitting(false);
    }
  };

  // Handle Pause Subscription
  const handlePauseSubscription = async (e) => {
    e.preventDefault();
    setSubscriptionError("");
    setSubscriptionSuccess("");
    setPauseSubmitting(true);

    try {
      const res = await fetch("/api/user/pause-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ duration: pauseDuration, action: pauseAction })
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setShowPauseModal(false);
        setSubscriptionSuccess("Vacation Mode activated. Your subscription is now paused.");
        setTimeout(() => setSubscriptionSuccess(""), 4000);
      } else {
        setSubscriptionError(data.error || "Failed to pause subscription.");
      }
    } catch (err) {
      setSubscriptionError("Network error occurred.");
    } finally {
      setPauseSubmitting(false);
    }
  };

  // Handle Resume Subscription
  const handleResumeSubscription = async () => {
    setSubscriptionError("");
    setSubscriptionSuccess("");
    setPauseSubmitting(true);

    try {
      const res = await fetch("/api/user/resume-plan", {
        method: "POST"
      });

      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setSubscriptionSuccess("Subscription plan resumed successfully! Welcome back.");
        setTimeout(() => setSubscriptionSuccess(""), 4000);
      } else {
        setSubscriptionError(data.error || "Failed to resume subscription.");
      }
    } catch (err) {
      setSubscriptionError("Network error occurred.");
    } finally {
      setPauseSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
      });
      if (res.ok) {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Helper to calculate days remaining for next swap (weekly: 7 days, monthly: 30 days)
  const getSwapDaysRemaining = (startDateStr, subscriptionType, lastSwapDateStr) => {
    const baseDateStr = lastSwapDateStr || startDateStr;
    if (!baseDateStr) return 0;
    const refDate = new Date(baseDateStr);
    const today = new Date();
    
    const cycleDays = subscriptionType === "weekly" ? 7 : 30;
    const diffTime = Math.abs(today - refDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const daysElapsedInCycle = diffDays % cycleDays;
    const daysRemaining = cycleDays - daysElapsedInCycle;
    
    return daysRemaining;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-alabaster-linen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="animate-spin h-10 w-10 text-linen-gold" />
          <p className="text-charcoal-ink/60 font-bold text-sm tracking-wide">Loading your ClosetRush profile...</p>
        </div>
      </div>
    );
  }

  // Sidebar items definition
  const sidebarItems = [
    { id: "overview", name: "Overview", icon: User },
    { id: "subscription", name: "Subscription Setup", icon: CreditCard },
    { id: "support", name: "Support Tickets", icon: HelpCircle },
    { id: "profile", name: "Manage Profile", icon: Settings },
  ];

  // If corporate user, add Corporate Hub sidebar item
  if (user?.accountType === "Commercial Partner") {
    sidebarItems.splice(2, 0, { id: "corporate", name: "Corporate Hub", icon: Building });
  }

  return (
    <div className="min-h-screen bg-alabaster-linen text-charcoal-ink font-sans pb-16 antialiased">
      <Navbar forceSolid={true} />
      
      {/* Header spacing */}
      <div className="pt-28 pb-6 bg-charcoal-ink text-white border-b border-charcoal-ink/08">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-alabaster-linen">Customer Dashboard</h1>
            <p className="text-alabaster-linen/60 text-xs sm:text-sm mt-1 font-semibold">
              Manage plans, check sheet swaps, and update profile
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-2xs font-bold px-3 py-1.5 rounded-none bg-charcoal-ink border border-alabaster-linen/15 text-linen-gold uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              {user?.accountType}
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 border border-alabaster-linen/20 rounded-none text-xs font-bold text-alabaster-linen/70 hover:border-alabaster-linen hover:bg-alabaster-linen hover:text-charcoal-ink transition-all cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar Menu */}
          <div className="lg:col-span-3 bg-white border border-charcoal-ink/10 rounded-none p-6 shadow-sm space-y-2">
            <div className="flex items-center gap-3 pb-6 border-b border-charcoal-ink/08 mb-4">
              <div className="w-12 h-12 rounded-none bg-linen-gold/10 border border-linen-gold/20 text-linen-gold flex items-center justify-center font-bold text-lg font-serif">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="overflow-hidden">
                <h4 className="font-bold text-charcoal-ink leading-tight truncate">{user?.name}</h4>
                <p className="text-charcoal-ink/40 text-2xs truncate font-bold uppercase tracking-wider mt-0.5">{user?.email}</p>
              </div>
            </div>

            {sidebarItems.map((item) => {
              const IconComp = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setProfileError("");
                    setProfileSuccess("");
                    setTicketError("");
                    setTicketSuccess("");
                    setQuoteError("");
                    setQuoteSuccess("");
                    setSubscriptionError("");
                    setSubscriptionSuccess("");
                  }}
                  className={`w-full flex items-center gap-3.5 px-4.5 py-3 rounded-none text-xs font-bold uppercase tracking-wider text-left transition-all duration-200 cursor-pointer ${
                    activeTab === item.id
                      ? "bg-charcoal-ink text-alabaster-linen"
                      : "text-charcoal-ink/60 hover:bg-alabaster-linen hover:text-charcoal-ink"
                  }`}
                >
                  <IconComp className="w-4.5 h-4.5 shrink-0" />
                  <span>{item.name}</span>
                </button>
              );
            })}

            {/* DOWNLOAD PWA APP BUTTON */}
            <div className="pt-4 mt-4 border-t border-charcoal-ink/10">
              <button
                onClick={() => {
                  if (window.deferredPrompt) {
                    window.deferredPrompt.prompt();
                    window.deferredPrompt.userChoice.then((choiceResult) => {
                      if (choiceResult.outcome === 'accepted') {
                        console.log('User accepted the install prompt');
                      }
                      window.deferredPrompt = null;
                    });
                  } else {
                    alert("App is already installed or your browser doesn't support PWA installation.");
                  }
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shadow-sm"
              >
                <ArrowRight className="w-4 h-4 rotate-90" />
                Install PWA App
              </button>
            </div>
            
            {/* ENABLE PUSH NOTIFICATIONS */}
            <PushNotificationManager />
          </div>

          {/* Main Dashboard Screen Panel */}
          <div className="lg:col-span-9 bg-white border border-charcoal-ink/10 rounded-none p-6 sm:p-8 shadow-sm min-h-[500px]">
            
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-8 animate-fade-in">
                
                {/* Greeting */}
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-charcoal-ink tracking-tight">
                    Hello, {user?.name.split(" ")[0]}!
                  </h2>
                  <p className="text-charcoal-ink/60 text-xs sm:text-sm mt-0.5 font-medium">
                    Here's a summary of your ClosetRush plan and sheet deliveries.
                  </p>
                </div>

                {/* Active Refund Notification */}
                {refunds.length > 0 && (
                  <div className="bg-[#FCFBF9] border border-charcoal-ink/10 p-6 rounded-none shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in border-l-4 border-l-[#05D4B5]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-none text-[9px] font-black uppercase tracking-widest ${
                          refunds[0].status === "PENDING" ? "bg-amber-500/10 text-amber-600 border border-amber-500/20" :
                          refunds[0].status === "REFUNDED" ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                          "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                        }`}>
                          Refund {refunds[0].status}
                        </span>
                        <span className="text-[10px] text-charcoal-ink/40 font-bold uppercase tracking-wider">Security Deposit Claim</span>
                      </div>
                      <h4 className="font-extrabold text-sm text-charcoal-ink">
                        {refunds[0].status === "PENDING" && "Linen Return & Deposit Refund is Pending"}
                        {refunds[0].status === "REFUNDED" && "Security Deposit Refund Completed"}
                        {refunds[0].status === "REJECTED" && "Refund Request Rejected"}
                      </h4>
                      <p className="text-3xs text-charcoal-ink/60 font-semibold leading-relaxed max-w-2xl">
                        {refunds[0].status === "PENDING" && `Your subscription to "${refunds[0].planName}" has been cancelled. Our logistics team will collect the sheets soon. Once inspected, your deposit of ₹${refunds[0].depositAmount} will be refunded.`}
                        {refunds[0].status === "REFUNDED" && `Your security deposit of ₹${refunds[0].depositAmount} was successfully refunded on ${formatDate(refunds[0].refundedAt)}. Transaction Reference: ${refunds[0].transactionId || "Direct Gateway Transfer"}.`}
                        {refunds[0].status === "REJECTED" && `Your refund claim for "${refunds[0].planName}" was rejected. Please contact our support desk for further dispute clarification.`}
                      </p>
                    </div>
                    {refunds[0].status === "PENDING" && (
                      <span className="text-2xs font-mono font-black text-amber-600 animate-pulse bg-amber-50 px-3 py-1.5 border border-amber-200 shrink-0">
                        PENDING COLLECT
                      </span>
                    )}
                  </div>
                )}

                {/* Sub & Status Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Subscription card */}
                  <div className="bg-charcoal-ink text-white rounded-none p-6 shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[220px]">
                    
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-white/40 text-2xs uppercase tracking-widest font-bold">
                          {user?.selectedPlan?.orderType === "BUY" ? "Purchased Collection" : "Current Service Plan"}
                        </span>
                        {(() => {
                          const pStart = user?.selectedPlan?.startDate ? new Date(user.selectedPlan.startDate) : null;
                          let pEnd = user?.selectedPlan?.endDate ? new Date(user.selectedPlan.endDate) : null;
                          if (!pEnd && pStart) {
                            pEnd = new Date(pStart);
                            const dur = (user.selectedPlan.duration || "").toLowerCase();
                            if (dur.includes("3 month")) pEnd.setMonth(pEnd.getMonth() + 3);
                            else if (dur.includes("6 month")) pEnd.setMonth(pEnd.getMonth() + 6);
                            else if (dur.includes("12 month")) pEnd.setFullYear(pEnd.getFullYear() + 1);
                            else pEnd.setMonth(pEnd.getMonth() + 1);
                          }
                          const isExpired = pEnd && new Date() > pEnd;

                          return (
                            <span className={`px-2 py-0.5 rounded-none text-3xs font-bold uppercase tracking-wider ${
                              user?.selectedPlan?.planName 
                                ? (user.selectedPlan.isPaused 
                                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse" 
                                    : isExpired 
                                    ? "bg-rose-500/30 text-rose-200 border border-rose-500/40 font-black"
                                    : "bg-white/10 text-white border border-white/20")
                                : "bg-white/05 text-white/50 border border-white/10"
                            }`}>
                              {user?.selectedPlan?.planName 
                                ? (user.selectedPlan.orderType === "BUY" 
                                    ? "OWNED" 
                                    : (user.selectedPlan.isPaused 
                                        ? "PAUSED" 
                                        : isExpired 
                                        ? "EXPIRED" 
                                        : "ACTIVE")) 
                                : "INACTIVE"}
                            </span>
                          );
                        })()}
                      </div>
                      
                      {user?.selectedPlan?.planName ? (
                        <div>
                          <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">{user.selectedPlan.planName}</h3>
                          <p className="text-white/70 text-xs font-semibold mt-1 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-linen-gold"></span>
                            {(() => {
                              const bType = (user.selectedPlan.bedType || "").toLowerCase();
                              if (bType.includes("single")) return "Single Bed Size";
                              if (bType.includes("double")) return "Double Bed Size";
                              return "Corporate Custom Setup";
                            })()}
                            {" • "}
                            <span className="text-linen-gold font-extrabold uppercase">
                              {user.selectedPlan.orderType === "BUY" ? (user.selectedPlan.itemTier === "PREMIUM" ? "Premium Tier" : "Basic Tier") : (user.selectedPlan.subscriptionType === "weekly" ? "Weekly Change" : "Monthly Kit")}
                            </span>
                          </p>
                          <div className="mt-4 flex items-baseline gap-1.5">
                            <span className="text-2xl sm:text-3xl font-bold font-serif text-white">₹{user.selectedPlan.price}</span>
                            <span className="text-white/50 text-xs font-medium">
                              {user.selectedPlan.orderType === "BUY" ? "One-Time" : `/${user.selectedPlan.duration}`}
                            </span>
                          </div>
                          {user.selectedPlan.isPaused && (
                            <p className="text-[10px] text-amber-400 font-bold mt-2 uppercase tracking-wide">
                              ⏸️ Vacation Pause Active until {formatDate(user.selectedPlan.pausedUntil)}
                            </p>
                          )}
                          {(() => {
                            const pStart = user.selectedPlan.startDate ? new Date(user.selectedPlan.startDate) : new Date();
                            const dur = (user.selectedPlan.duration || "").toLowerCase();
                            let pEnd = null;

                            if (dur.includes("3 month") || dur.includes("quarterly")) {
                              pEnd = new Date(pStart);
                              pEnd.setMonth(pEnd.getMonth() + 3);
                            } else if (dur.includes("6 month")) {
                              pEnd = new Date(pStart);
                              pEnd.setMonth(pEnd.getMonth() + 6);
                            } else if (dur.includes("9 month")) {
                              pEnd = new Date(pStart);
                              pEnd.setMonth(pEnd.getMonth() + 9);
                            } else if (dur.includes("12 month") || dur.includes("yearly") || dur.includes("annual")) {
                              pEnd = new Date(pStart);
                              pEnd.setFullYear(pEnd.getFullYear() + 1);
                            } else if (user.selectedPlan.endDate) {
                              pEnd = new Date(user.selectedPlan.endDate);
                            } else {
                              pEnd = new Date(pStart);
                              pEnd.setMonth(pEnd.getMonth() + 1);
                            }

                            const isExpired = pEnd && new Date() > pEnd;
                            const depositVal = Number(user.selectedPlan.securityDeposit || 0);

                            return (
                              <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                                <div className="flex justify-between items-center text-xs">
                                  <span className="text-white/60 font-semibold">Next Billing Date:</span>
                                  <span className={`font-extrabold px-2 py-0.5 rounded text-2xs uppercase ${isExpired ? "bg-rose-500/20 text-rose-300 border border-rose-500/30" : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"}`}>
                                    {isExpired ? `Expired (${formatDate(pEnd)})` : pEnd ? formatDate(pEnd) : "—"}
                                  </span>
                                </div>
                                <div className="mt-2 space-y-2">
                                  {isExpired ? (
                                    <button
                                      onClick={() => handleSelectPlan(user.selectedPlan.bedType || "single", user.selectedPlan.planName, user.selectedPlan.price, user.selectedPlan.duration || "1 Month")}
                                      className="w-full py-2.5 px-4 rounded-none font-extrabold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer bg-linen-gold hover:bg-white hover:text-charcoal-ink text-white shadow-lg"
                                    >
                                      <CreditCard className="w-4 h-4" />
                                      Renew Now — Pay Next Cycle (₹{user.selectedPlan.price})
                                    </button>
                                  ) : (
                                    <div className="w-full py-2.5 px-4 rounded-none font-bold text-2xs uppercase tracking-widest bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 flex items-center justify-center gap-2">
                                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                                      Prepaid Active Until {pEnd ? formatDate(pEnd) : "—"}
                                    </div>
                                  )}
                                  <button
                                    onClick={handleCancelSubscription}
                                    className="w-full py-2 px-4 rounded-none bg-rose-500/20 hover:bg-rose-500 text-rose-200 hover:text-white border border-rose-500/30 font-bold text-2xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    Cancel Subscription{depositVal > 0 ? ` & Claim ₹${depositVal} Deposit` : ""}
                                  </button>
                                </div>
                              </div>
                            );
                          })()}
                          <div className="mt-2.5 text-[10px] text-white/50 space-y-0.5 border-t border-white/10 pt-2 font-semibold">
                            <p>GST (18%): ₹{user.selectedPlan.gst || 0} {user.selectedPlan.orderType !== "BUY" && `• Deposit: ₹${Number(user.selectedPlan.securityDeposit || 0)}`}</p>
                            <p className="font-extrabold text-linen-gold">Total Amount Paid: ₹{user.selectedPlan.totalPrice !== undefined ? user.selectedPlan.totalPrice : user.selectedPlan.price}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="py-2">
                          <h3 className="text-lg font-bold font-serif text-white/90">No Plan Selected</h3>
                          <p className="text-white/60 text-xs mt-1 leading-relaxed">
                            Subscribe now to receive professional organic sheet cleaning delivered straight to your home.
                          </p>
                        </div>
                      )}
                    </div>
 
                    <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                      {user?.selectedPlan?.planName ? (
                        <>
                          <span className="text-white/40 text-2xs font-semibold">
                            {user.selectedPlan.orderType === "BUY" ? "Purchased on " : "Started "}
                            {formatDate(user.selectedPlan.startDate)}
                          </span>
                          <button 
                            onClick={() => setActiveTab("subscription")}
                            className="text-linen-gold hover:text-white font-bold text-2xs flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            Manage Setup <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setActiveTab("subscription")}
                          className="w-full py-2.5 rounded-none bg-linen-gold hover:bg-white hover:text-charcoal-ink text-white font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          Choose Bed Plan <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
 
                  {/* Hygiene Swap / Purchase Delivery Tracker Card */}
                  <div className="bg-white border border-charcoal-ink/10 rounded-none p-6 shadow-sm flex flex-col justify-between min-h-[220px]">
                    {user?.selectedPlan?.orderType === "BUY" ? (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-1.5 rounded-none bg-linen-gold/10 text-linen-gold">
                            <Package className="w-4.5 h-4.5" />
                          </div>
                          <h4 className="font-extrabold text-charcoal-ink text-sm">Purchase Dispatch Details</h4>
                        </div>
                        <div className="space-y-3 font-semibold text-xs text-charcoal-ink/70">
                          <p>
                            Order Type: <strong className="text-charcoal-ink uppercase">One-Time Buy</strong>
                          </p>
                          <p>
                            Your purchased sheets will be delivered vacuum-sealed. Direct sales are yours permanently and do not require swaps.
                          </p>
                          <p className="text-[10px] text-charcoal-ink/40">
                            Packaging process: Thermodynamic Sanitized & Sealed wrapper.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-1.5 rounded-none bg-linen-gold/10 text-linen-gold">
                            <RefreshCw className="w-4.5 h-4.5" />
                          </div>
                          <h4 className="font-extrabold text-charcoal-ink text-sm">Sheet Swap Cycle</h4>
                        </div>
 
                        {user?.selectedPlan?.planName ? (() => {
                          const pStart = user?.selectedPlan?.startDate ? new Date(user.selectedPlan.startDate) : null;
                          let pEnd = user?.selectedPlan?.endDate ? new Date(user.selectedPlan.endDate) : null;
                          if (!pEnd && pStart) {
                            pEnd = new Date(pStart);
                            const dur = (user.selectedPlan.duration || "").toLowerCase();
                            if (dur.includes("3 month")) pEnd.setMonth(pEnd.getMonth() + 3);
                            else if (dur.includes("6 month")) pEnd.setMonth(pEnd.getMonth() + 6);
                            else if (dur.includes("12 month")) pEnd.setFullYear(pEnd.getFullYear() + 1);
                            else pEnd.setMonth(pEnd.getMonth() + 1);
                          }
                          const isExpired = pEnd && new Date() > pEnd;

                          if (isExpired) {
                            return (
                              <div className="p-3.5 bg-rose-50/70 border border-rose-200 rounded-none text-left space-y-1.5">
                                <div className="flex items-center gap-1.5 text-rose-700 font-extrabold text-xs">
                                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                                  <span>Plan Expired (Swap Services Paused)</span>
                                </div>
                                <p className="text-[11px] text-rose-900/70 font-semibold leading-relaxed">
                                  Your subscription cycle ended on {formatDate(pEnd)}. Automated sheet swap deliveries are currently paused.
                                </p>
                                <p className="text-[10px] text-rose-600 font-bold">
                                  Please renew your subscription to resume automated deliveries.
                                </p>
                              </div>
                            );
                          }

                          return (
                            <div>
                              <div className="flex justify-between items-baseline mb-2">
                                <span className="text-charcoal-ink/50 text-xs font-semibold">Next sheets delivery in</span>
                                <span className="text-lg font-black text-charcoal-ink">{getSwapDaysRemaining(user.selectedPlan.startDate, user.selectedPlan.subscriptionType, user.selectedPlan.lastSwapDate)} Days</span>
                              </div>
                              
                              {/* Progress bar */}
                              <div className="w-full bg-charcoal-ink/08 rounded-none h-2 overflow-hidden">
                                <div 
                                  className="bg-linen-gold h-2 rounded-none transition-all duration-500" 
                                  style={{ width: `${Math.max(10, Math.min(100, ((user.selectedPlan.subscriptionType === "weekly" ? 7 : 30) - getSwapDaysRemaining(user.selectedPlan.startDate, user.selectedPlan.subscriptionType, user.selectedPlan.lastSwapDate)) / (user.selectedPlan.subscriptionType === "weekly" ? 7 : 30) * 100))}%` }}
                                ></div>
                              </div>
                              <p className="text-charcoal-ink/40 text-[10px] mt-2 font-medium">
                                {user.selectedPlan.subscriptionType === "weekly"
                                  ? "Weekly premium swap is scheduled. Our staff will swap and strip your bedding."
                                  : "Auto monthly kit swap is scheduled. Leave used sheets in our ClosetRush bags."}
                              </p>
                            </div>
                          );
                        })() : (
                          <div className="py-2 text-center">
                            <Clock className="w-8 h-8 text-charcoal-ink/20 mx-auto mb-2" />
                            <p className="text-charcoal-ink/40 text-2xs leading-relaxed max-w-[200px] mx-auto">
                              Setup a bed sheet plan to start your regular monthly delivery timeline.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
 
                    <div className="mt-4 pt-3.5 border-t border-charcoal-ink/08 flex items-center justify-between">
                      <span className="text-charcoal-ink/40 text-2xs font-semibold">Delivery address:</span>
                      <span className="text-charcoal-ink font-bold text-2xs max-w-[150px] truncate" title={user?.address || "No address entered"}>
                        {user?.address || "Enter Address"}
                      </span>
                    </div>
                  </div>
 
                </div>
 
                {/* Delivery Timeline / Steps Tracker */}
                {user?.selectedPlan?.planName && (() => {
                  const activeOrder = orders.find(o => o.status === "ACTIVE" || o.status === "DELIVERED");
                  const activeBundle = activeOrder ? bundles.find(b => b.orderId === activeOrder._id?.toString() || b.orderId === activeOrder._id) : null;
                  const bundleStatus = activeBundle?.status || null;
                  
                  // Determine step completion based on real bundle status
                  const step1Done = true; // order is placed
                  const step2Done = bundleStatus && ["READY_TO_DISPATCH", "DISPATCHED", "DELIVERED", "COLLECTED", "SENT_TO_LAUNDRY", "IN_LAUNDRY", "COMPLETED"].includes(bundleStatus);
                  const step3Done = bundleStatus && ["DISPATCHED", "DELIVERED", "COLLECTED", "SENT_TO_LAUNDRY", "IN_LAUNDRY", "COMPLETED"].includes(bundleStatus);
                  const step4Done = bundleStatus && ["DELIVERED", "COLLECTED", "SENT_TO_LAUNDRY", "IN_LAUNDRY", "COMPLETED"].includes(bundleStatus);

                  return (
                  <div className="bg-alabaster-linen rounded-none p-6 border border-charcoal-ink/10">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-extrabold text-charcoal-ink text-sm">
                        {user.selectedPlan.orderType === "BUY" ? "Your Purchase Progress" : "Your Delivery Progress"}
                      </h4>
                      {activeBundle && (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-charcoal-ink text-white px-2.5 py-1 flex items-center gap-1.5">
                          <Package className="w-3 h-3" />
                          {activeBundle.bundleId}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
                      {/* Step 1: Order Confirmed */}
                      <div className="flex gap-3 items-start relative z-10">
                        <div className={`w-7 h-7 rounded-none flex items-center justify-center font-bold text-xs shrink-0 shadow-xs ${step1Done ? "bg-linen-gold text-white" : "bg-charcoal-ink/08 text-charcoal-ink/40"}`}>
                          {step1Done ? <Check className="w-4 h-4" /> : "01"}
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${step1Done ? "text-charcoal-ink" : "text-charcoal-ink/40"}`}>
                            {user.selectedPlan.orderType === "BUY" ? "Order Confirmed" : "Subscription Created"}
                          </p>
                          <p className="text-charcoal-ink/40 text-3xs font-semibold mt-0.5">Activated on {formatDate(user.selectedPlan.startDate)}</p>
                        </div>
                      </div>
 
                      {/* Step 2: Bundle Packed */}
                      <div className="flex gap-3 items-start relative z-10">
                        <div className={`w-7 h-7 rounded-none flex items-center justify-center font-bold text-xs shrink-0 ${step2Done ? "bg-linen-gold text-white shadow-xs" : "bg-linen-gold/10 text-linen-gold border border-linen-gold/20"}`}>
                          {step2Done ? <Check className="w-4 h-4" /> : "02"}
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${step2Done ? "text-charcoal-ink" : "text-charcoal-ink/60"}`}>
                            Bundle Packed
                          </p>
                          <p className="text-charcoal-ink/40 text-3xs font-semibold mt-0.5">
                            {step2Done ? "Vacuum sealed & ready" : "Awaiting warehouse packing"}
                          </p>
                        </div>
                      </div>
  
                      {/* Step 3: Dispatched */}
                      <div className="flex gap-3 items-start relative z-10">
                        <div className={`w-7 h-7 rounded-none flex items-center justify-center font-bold text-xs shrink-0 ${step3Done ? "bg-linen-gold text-white shadow-xs" : "bg-charcoal-ink/08 text-charcoal-ink/40"}`}>
                          {step3Done ? <Check className="w-4 h-4" /> : "03"}
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${step3Done ? "text-charcoal-ink" : "text-charcoal-ink/40"}`}>
                            Dispatched
                          </p>
                          <p className={`text-3xs font-semibold mt-0.5 ${step3Done ? "text-charcoal-ink/40" : "text-charcoal-ink/30"}`}>
                            {step3Done ? "Out for delivery" : "Pending dispatch from warehouse"}
                          </p>
                        </div>
                      </div>

                      {/* Step 4: Delivered */}
                      <div className="flex gap-3 items-start relative z-10">
                        <div className={`w-7 h-7 rounded-none flex items-center justify-center font-bold text-xs shrink-0 ${step4Done ? "bg-emerald-500 text-white shadow-xs" : "bg-charcoal-ink/08 text-charcoal-ink/40"}`}>
                          {step4Done ? <Check className="w-4 h-4" /> : "04"}
                        </div>
                        <div>
                          <p className={`text-xs font-bold ${step4Done ? "text-emerald-600" : "text-charcoal-ink/40"}`}>
                            Delivered
                          </p>
                          <p className={`text-3xs font-semibold mt-0.5 ${step4Done ? "text-emerald-500/70" : "text-charcoal-ink/30"}`}>
                            {step4Done ? "Successfully delivered to you" : "Awaiting delivery"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  );
                })()}

                {/* Recent Orders List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-charcoal-ink text-xs uppercase tracking-widest flex items-center gap-2">
                      <FileText className="w-4.5 h-4.5 text-charcoal-ink/50" />
                      Fresh Sheet Delivery Orders
                    </h4>
                    <span className="text-charcoal-ink/40 text-2xs font-semibold">{orders.length} total orders</span>
                  </div>

                  {orders.length > 0 ? (
                    <div className="border border-charcoal-ink/10 rounded-none overflow-hidden overflow-x-auto shadow-sm">
                      <table className="w-full text-left text-xs min-w-[750px]">
                        <thead className="bg-alabaster-linen text-charcoal-ink/60 font-bold uppercase tracking-widest text-3xs border-b border-charcoal-ink/10">
                          <tr>
                            <th className="py-3.5 px-4">Order ID</th>
                            <th className="py-3.5 px-4">Bundle Item</th>
                            <th className="py-3.5 px-4">Bundle ID</th>
                            <th className="py-3.5 px-4">Type</th>
                            <th className="py-3.5 px-4">Logistics</th>
                            <th className="py-3.5 px-4">Status</th>
                            <th className="py-3.5 px-4 text-right">Price</th>
                            <th className="py-3.5 px-4 text-center">Invoice</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {orders.map((order) => {
                            const matchedBundle = bundles.find(b => b.orderId === order._id?.toString() || b.orderId === order._id);
                            const logisticsLabel = matchedBundle ? matchedBundle.status.replace(/_/g, " ") : null;
                            const logisticsColor = matchedBundle ? (
                              matchedBundle.status === "DELIVERED" || matchedBundle.status === "COMPLETED" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                              matchedBundle.status === "DISPATCHED" ? "bg-teal-50 text-teal-700 border-teal-200" :
                              matchedBundle.status === "READY_TO_DISPATCH" ? "bg-indigo-50 text-indigo-700 border-indigo-200" :
                              matchedBundle.status === "SENT_TO_LAUNDRY" || matchedBundle.status === "IN_LAUNDRY" ? "bg-amber-50 text-amber-700 border-amber-200" :
                              "bg-slate-50 text-slate-600 border-slate-200"
                            ) : null;
                            return (
                            <tr key={order._id} className="hover:bg-slate-50/50">
                              <td className="py-3.5 px-4 font-bold text-charcoal-ink">{order.bundleOrderId}</td>
                              <td className="py-3.5 px-4 text-charcoal-ink/70">{order.bundleName}</td>
                              <td className="py-3.5 px-4">
                                {matchedBundle ? (
                                  <span className="font-mono font-bold text-charcoal-ink text-[10px] bg-charcoal-ink/05 border border-charcoal-ink/10 px-2 py-0.5 inline-flex items-center gap-1">
                                    <Package className="w-3 h-3 text-linen-gold" />
                                    {matchedBundle.bundleId}
                                  </span>
                                ) : (
                                  <span className="text-charcoal-ink/30 text-[10px] italic font-semibold">Pending</span>
                                )}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2 py-0.5 rounded-none text-3xs font-extrabold tracking-wider uppercase border ${
                                  order.orderType === "BUY"
                                    ? "bg-purple-50 text-purple-650 border-purple-200"
                                    : "bg-blue-50 text-blue-650 border-blue-200"
                                }`}>
                                  {order.orderType || "RENT"}
                                </span>
                              </td>
                              <td className="py-3.5 px-4">
                                {matchedBundle ? (
                                  <span className={`px-2 py-0.5 rounded-none text-3xs font-extrabold tracking-wider uppercase border inline-flex items-center gap-1 ${logisticsColor}`}>
                                    <Truck className="w-3 h-3" />
                                    {logisticsLabel}
                                  </span>
                                ) : (
                                  <span className="text-charcoal-ink/30 text-[10px] italic font-semibold">—</span>
                                )}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2 py-0.5 rounded-none text-3xs font-bold tracking-wider uppercase inline-block border ${
                                  order.status === "ACTIVE" 
                                    ? "bg-linen-gold/10 text-linen-gold border-linen-gold/20"
                                    : order.status === "DELIVERED"
                                    ? "bg-emerald-55/10 text-emerald-600 border border-emerald-500/20"
                                    : order.status === "CANCELLED"
                                    ? "bg-red-50 text-red-650 border border-red-150"
                                    : "bg-amber-50 text-amber-600 border border-amber-100"
                                }`}>
                                  {order.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right font-bold text-charcoal-ink">₹{order.finalPrice}</td>
                              <td className="py-3.5 px-4 text-center">
                                <a
                                  href={`/api/user/quote/pdf?orderId=${order.bundleOrderId}`}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 text-3xs font-extrabold uppercase bg-charcoal-ink hover:bg-linen-gold text-white hover:text-charcoal-ink tracking-wider transition-colors duration-200"
                                >
                                  <FileText className="w-3 h-3" /> PDF
                                </a>
                              </td>
                            </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 border border-dashed border-charcoal-ink/15 rounded-none bg-alabaster-linen/30">
                      <Package className="w-8 h-8 text-charcoal-ink/20 mx-auto mb-2" />
                      <p className="text-charcoal-ink/40 text-xs font-semibold uppercase tracking-wider">No fresh sheet swap orders recorded yet.</p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* SUBSCRIPTION SETUP TAB */}
            {activeTab === "subscription" && (
              <div className="space-y-8 animate-fade-in">
                
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-charcoal-ink tracking-tight">
                    Manage Bed Sheet Subscription
                  </h2>
                  <p className="text-charcoal-ink/65 text-xs sm:text-sm mt-0.5 font-medium">
                    Modify your active subscription, upgrade to other packages, or cancel your active deliveries.
                  </p>
                </div>

                {subscriptionSuccess && (
                  <div className="p-4 rounded-none bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 shrink-0 text-emerald-500" />
                    {subscriptionSuccess}
                  </div>
                )}

                {subscriptionError && (
                  <div className="p-4 rounded-none bg-red-50 text-red-600 border border-red-100 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                    {subscriptionError}
                  </div>
                )}

                {/* Current Active Plan Box */}
                {user?.selectedPlan?.planName ? (
                  <div className="bg-white rounded-none p-6 border border-charcoal-ink/10 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-linen-gold text-2xs uppercase tracking-widest font-bold bg-linen-gold/10 px-2.5 py-1 border border-linen-gold/20">
                          Active Plan
                        </span>
                        {user.selectedPlan.isPaused && (
                          <span className="text-amber-600 text-2xs uppercase tracking-widest font-bold bg-amber-50 px-2.5 py-1 border border-amber-200">
                            PAUSED
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg sm:text-xl font-serif font-bold text-charcoal-ink mt-3">
                        {user.selectedPlan.planName} ({user.selectedPlan.bedType === "single" ? "Single Bed" : "Double Bed"})
                      </h3>
                      <p className="text-charcoal-ink/60 text-xs mt-1 leading-normal">
                        Subscribed at ₹{user.selectedPlan.price} / {user.selectedPlan.duration} • Option: <span className="font-extrabold uppercase text-linen-gold">{user.selectedPlan.subscriptionType === "weekly" ? "Weekly Change Service" : "Monthly Kit Delivery"}</span>.
                      </p>
                      <p className="text-charcoal-ink/40 text-[10px] mt-1 font-semibold">
                        GST: ₹{user.selectedPlan.gst || 0} • Deposit: ₹{user.selectedPlan.securityDeposit || 0} • Upfront Paid: <span className="font-extrabold text-charcoal-ink">₹{user.selectedPlan.totalPrice}</span>.
                        {user.selectedPlan.subscriptionType === "weekly" ? " Swaps repeat every 7 days (Weekly)." : " Swaps repeat every 30 days (Monthly)."}
                      </p>
                      {user.selectedPlan.isPaused && (
                        <p className="text-3xs text-amber-600 font-bold uppercase mt-2">
                          Vacation mode resumes automatically on {formatDate(user.selectedPlan.pausedUntil)} ({user.selectedPlan.pauseDuration}) • Action: {user.selectedPlan.pauseAction === "pickup" ? "Linen collection requested" : "Keep sheets at home"}.
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => handleSelectPlan(user.selectedPlan.bedType || "single", user.selectedPlan.planName, user.selectedPlan.price, user.selectedPlan.duration || "1 Month")}
                        className="px-5 py-3 rounded-none bg-linen-gold hover:bg-charcoal-ink text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <CreditCard className="w-4 h-4" />
                        Renew Plan (Pay Next Cycle)
                      </button>
                      {user.selectedPlan.isPaused ? (
                        <button
                          onClick={handleResumeSubscription}
                          disabled={pauseSubmitting}
                          className="px-5 py-3 rounded-none bg-[#05D4B5] hover:bg-charcoal-ink hover:text-white text-white font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className="w-4 h-4 animate-spin-once" />
                          {pauseSubmitting ? "Resuming..." : "Resume Subscription"}
                        </button>
                      ) : (
                        <button
                          onClick={() => setShowPauseModal(true)}
                          disabled={pauseSubmitting}
                          className="px-5 py-3 rounded-none bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Clock className="w-4 h-4" />
                          Pause Plan (Vacation)
                        </button>
                      )}
                      <button
                        onClick={handleCancelSubscription}
                        disabled={cancelSubmitting}
                        className="px-5 py-3 rounded-none bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                        {cancelSubmitting ? "Cancelling..." : "Cancel Subscription"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50/50 rounded-none p-6 border border-amber-100 flex items-start gap-4 animate-fade-in">
                    <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-amber-800 text-xs uppercase tracking-wide">No Active Subscription</h4>
                      <p className="text-amber-700/80 text-xs mt-1 leading-relaxed">
                        Your ClosetRush deliveries are currently inactive. Please choose one of the options below to get fresh bed sheets delivered monthly.
                      </p>
                    </div>
                  </div>
                )}

                {/* Available Plans Selector */}
                {!user?.selectedPlan?.planName && (() => {
                  const singlePlans = dbPlans.filter(p => p.bedType === "single").sort((a, b) => a.price - b.price);
                  const doublePlans = dbPlans.filter(p => p.bedType === "double").sort((a, b) => a.price - b.price);

                  if (singlePlans.length === 0 && doublePlans.length === 0) {
                    return (
                      <div className="text-center py-10 border border-charcoal-ink/10 rounded-none bg-white p-6.5 shadow-sm">
                        <Package className="w-8 h-8 text-charcoal-ink/30 mx-auto mb-3" />
                        <h4 className="font-serif font-bold text-charcoal-ink text-sm">No subscription plans available</h4>
                        <p className="text-charcoal-ink/65 text-xs mt-1">Please configure subscription plans in the admin dashboard.</p>
                      </div>
                    );
                  }

                  return (
                    <div>
                      <h4 className="font-bold text-charcoal-ink text-xs uppercase tracking-widest mb-6 flex items-center gap-2">
                        <TrendingUp className="w-4.5 h-4.5 text-charcoal-ink/50" />
                        Choose Your Plan
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Single Bed Option Card */}
                        <div className="bg-white border border-charcoal-ink/10 rounded-none p-6.5 shadow-sm hover:border-linen-gold transition-all flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <span className="text-charcoal-ink/40 text-3xs font-black uppercase tracking-wider block mb-1">Standard Options</span>
                                <h4 className="font-serif font-bold text-charcoal-ink text-lg">Single Bed Plans</h4>
                              </div>
                            </div>
                            
                            <div className="space-y-3 mb-6">
                              {singlePlans.map((p, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3.5 bg-alabaster-linen hover:bg-white rounded-none border border-charcoal-ink/05 hover:border-charcoal-ink/15 transition-all">
                                  <div>
                                    <span className="font-bold text-charcoal-ink text-xs block">{p.name}</span>
                                    <span className="text-[10px] text-charcoal-ink/50 font-semibold truncate max-w-[160px] inline-block">
                                      Deposit: ₹{p.securityDeposit || p.depositAmount} (Refundable)
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="text-right">
                                      <span className="font-bold text-charcoal-ink text-xs block">₹{p.price}/mo</span>
                                      <span className="text-[9px] text-teal-650 font-bold block">+₹{p.securityDeposit || p.depositAmount} Dep</span>
                                    </div>
                                    <button
                                      onClick={() => handleSelectPlan("single", p.name, Number(p.price), p.duration || "1 Month")}
                                      disabled={planSubmitting}
                                      className="py-1.5 px-3.5 rounded-none bg-charcoal-ink hover:bg-linen-gold text-white font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50"
                                    >
                                      Select
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Double Bed Option Card */}
                        <div className="bg-white border border-charcoal-ink/10 rounded-none p-6.5 shadow-sm hover:border-linen-gold transition-all flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <span className="text-charcoal-ink/40 text-3xs font-black uppercase tracking-wider block mb-1">Family Options</span>
                                <h4 className="font-serif font-bold text-charcoal-ink text-lg">Double Bed Plans</h4>
                              </div>
                            </div>

                            <div className="space-y-3 mb-6">
                              {doublePlans.map((p, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3.5 bg-alabaster-linen hover:bg-white rounded-none border border-charcoal-ink/05 hover:border-charcoal-ink/15 transition-all">
                                  <div>
                                    <span className="font-bold text-charcoal-ink text-xs block">{p.name}</span>
                                    <span className="text-[10px] text-charcoal-ink/50 font-semibold truncate max-w-[160px] inline-block">
                                      Deposit: ₹{p.securityDeposit || p.depositAmount} (Refundable)
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="text-right">
                                      <span className="font-bold text-charcoal-ink text-xs block">₹{p.price}/mo</span>
                                      <span className="text-[9px] text-teal-650 font-bold block">+₹{p.securityDeposit || p.depositAmount} Dep</span>
                                    </div>
                                    <button
                                      onClick={() => handleSelectPlan("double", p.name, Number(p.price), p.duration || "1 Month")}
                                      disabled={planSubmitting}
                                      className="py-1.5 px-3.5 rounded-none bg-charcoal-ink hover:bg-linen-gold text-white font-bold text-[10px] uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50"
                                    >
                                      Select
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>

                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* B2B Upgrade Banner */}
                {user?.accountType !== "Commercial Partner" && (
                  <div className="bg-linen-gold/05 border border-linen-gold/25 rounded-none p-6.5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="space-y-1">
                      <span className="text-linen-gold text-3xs uppercase tracking-widest font-bold block">Running a Hotel, PG, or Airbnb?</span>
                      <h4 className="font-serif font-bold text-charcoal-ink text-base sm:text-lg">Upgrade to Commercial Account</h4>
                      <p className="text-charcoal-ink/60 text-xs leading-relaxed max-w-lg">
                        Get discounted volume rates, unlimited bulk sheet inventory, priority delivery slots, and automated monthly billing.
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setActiveTab("profile");
                        setProfileSuccess("Toggle your Account Type to Commercial Partner below and click Save.");
                      }}
                      className="px-5 py-3 rounded-none bg-charcoal-ink hover:bg-linen-gold text-white font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                    >
                      B2B Setup <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

              </div>
            )}

            {/* B2B CORPORATE HUB TAB */}
            {activeTab === "corporate" && user?.accountType === "Commercial Partner" && (
              <div className="space-y-8 animate-fade-in">
                
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-charcoal-ink tracking-tight flex items-center gap-2">
                    <Building className="w-6 h-6 text-linen-gold" />
                    Commercial Partner Hub
                  </h2>
                  <p className="text-charcoal-ink/65 text-xs sm:text-sm mt-0.5 font-medium">
                    Configure custom bulk rates, calculate billing estimations, and check quote request status.
                  </p>
                </div>

                {quoteSuccess && (
                  <div className="p-4 rounded-none bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 shrink-0 text-emerald-500" />
                    {quoteSuccess}
                  </div>
                )}

                {quoteError && (
                  <div className="p-4 rounded-none bg-red-50 text-red-600 border border-red-100 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                    {quoteError}
                  </div>
                )}



                {/* Submitted Quotes list */}
                <div className="space-y-4 pt-4">
                  <h4 className="font-bold text-charcoal-ink text-xs uppercase tracking-widest">Quote History</h4>
                  
                  {quotes.length > 0 ? (
                    <div className="border border-charcoal-ink/10 rounded-none overflow-hidden overflow-x-auto">
                      <table className="w-full text-left text-xs min-w-[700px]">
                        <thead className="bg-alabaster-linen text-charcoal-ink/65 font-bold uppercase tracking-wider text-3xs border-b border-charcoal-ink/10">
                          <tr>
                            <th className="py-3 px-4">Business</th>
                            <th className="py-3 px-4">Setup</th>
                            <th className="py-3 px-4">Properties</th>
                            <th className="py-3 px-4">Beds</th>
                            <th className="py-3 px-4">Price</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {quotes.map((quote) => (
                            <tr key={quote._id} className="hover:bg-slate-50/50">
                              <td className="py-3.5 px-4 font-bold text-[#0F172A]">{quote.businessName}</td>
                              <td className="py-3.5 px-4 text-slate-655">{quote.bundleSelections}</td>
                              <td className="py-3.5 px-4 text-center text-slate-600">{quote.propertiesCount || quote.roomsCount || 0}</td>
                              <td className="py-3.5 px-4 text-center text-slate-600">{quote.unitsCount || quote.bedsCount || 0}</td>
                              <td className="py-3.5 px-4 font-black text-[#0F172A]">
                                {quote.priceQuote > 0 ? (
                                  <div className="space-y-0.5">
                                    <span className="text-linen-gold font-extrabold block">₹{quote.priceQuote}</span>
                                    <span className="text-[9px] text-slate-400 block font-normal">Final Quote</span>
                                  </div>
                                ) : (
                                  <div className="space-y-0.5">
                                    <span>₹{quote.estimatedTotal}</span>
                                    <span className="text-[9px] text-slate-400 block font-normal">Estimated</span>
                                  </div>
                                )}
                              </td>
                              <td className="py-3.5 px-4">
                                <span className={`px-2.5 py-0.5 rounded-none text-3xs font-bold tracking-wider uppercase border ${
                                  quote.status === "PENDING"
                                    ? "bg-amber-50 text-amber-600 border-amber-100"
                                    : quote.status === "ACCEPTED"
                                    ? "bg-purple-50 text-purple-600 border-purple-100"
                                    : quote.status === "QUOTE SENT"
                                    ? "bg-blue-50 text-blue-600 border-blue-100"
                                    : quote.status === "PAID" || quote.status === "CONFIRMED"
                                    ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                    : "bg-slate-100 text-slate-600 border-slate-200"
                                }`}>
                                  {quote.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <div className="flex gap-2 justify-end">
                                  {quote.status === "QUOTE SENT" && (
                                    <button
                                      onClick={() => handleUpdateUserQuoteStatus(quote._id, "ACCEPTED")}
                                      className="py-1 px-2.5 bg-linen-gold text-charcoal-ink font-bold text-[9px] uppercase tracking-wider hover:bg-charcoal-ink hover:text-white transition-all cursor-pointer"
                                    >
                                      Accept Proposal
                                    </button>
                                  )}
                                  {quote.status === "ACCEPTED" && (
                                    <button
                                      onClick={() => {
                                        const choice = confirm("Proceeding to payment gateway simulation. Click OK to Pay, Cancel to trigger Failed Payment.");
                                        if (choice) {
                                          handleUpdateUserQuoteStatus(quote._id, "CONFIRMED");
                                          alert("Simulated B2B Payment Success! Status updated to Confirmed.");
                                        } else {
                                          alert("Simulated B2B Payment Failed.");
                                        }
                                      }}
                                      className="py-1 px-2.5 bg-emerald-600 text-white font-bold text-[9px] uppercase tracking-wider hover:bg-emerald-700 transition-all cursor-pointer"
                                    >
                                      Pay Now
                                    </button>
                                  )}
                                  {["CONFIRMED", "PAID"].includes(quote.status) && (
                                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                      <Check className="w-3.5 h-3.5" /> Order Confirmed
                                    </span>
                                  )}
                                  {quote.status === "PENDING" && (
                                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Awaiting Review</span>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-10 border border-dashed border-charcoal-ink/15 rounded-none bg-alabaster-linen/30">
                      <Building className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="text-slate-400 text-xs font-semibold">No submitted quotation requests found.</p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* SUPPORT TICKETS TAB */}
            {activeTab === "support" && (
              <div className="space-y-8 animate-fade-in">
                
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-charcoal-ink tracking-tight">
                    Support Ticket Desk
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">
                    Submit concerns regarding torn sheets, schedule swaps modifications, or other service errors.
                  </p>
                </div>

                {ticketSuccess && (
                  <div className="p-4 rounded-none bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 shrink-0 text-emerald-500" />
                    {ticketSuccess}
                  </div>
                )}

                {ticketError && (
                  <div className="p-4 rounded-none bg-red-50 text-red-600 border border-red-100 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                    {ticketError}
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Create support ticket */}
                  <form onSubmit={handleTicketSubmit} className="lg:col-span-6 space-y-4">
                    <h4 className="font-extrabold text-charcoal-ink text-sm">Open a Ticket</h4>
                    
                    <div>
                      <label className="block text-3xs font-black text-charcoal-ink/50 uppercase tracking-wider mb-1.5">What is the issue / request?</label>
                      <textarea
                        required
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        placeholder="Detail your request (e.g. Delivery sheets are dirty, need emergency swap...)"
                        rows="4"
                        className="w-full p-4 bg-white border border-charcoal-ink/15 rounded-none text-charcoal-ink text-xs focus:outline-none focus:border-linen-gold resize-none font-semibold"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-3xs font-black text-charcoal-ink/50 uppercase tracking-wider mb-1.5">Priority Level</label>
                      <select
                        value={ticketPriority}
                        onChange={(e) => setTicketPriority(e.target.value)}
                        className="w-full px-4 py-3 bg-white border border-charcoal-ink/15 rounded-none text-charcoal-ink text-xs focus:outline-none focus:border-linen-gold font-bold"
                      >
                        <option value="LOW">Low (General queries)</option>
                        <option value="MEDIUM">Medium (Scheduled swap edits)</option>
                        <option value="HIGH">High (Defect bedding, torn sheets)</option>
                        <option value="CRITICAL">Critical (Delivery error / urgent)</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      disabled={ticketSubmitting}
                      className="w-full py-3.5 rounded-none bg-charcoal-ink hover:bg-linen-gold text-white font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {ticketSubmitting ? "Submitting Ticket..." : "Submit Ticket"}
                    </button>
                  </form>

                  {/* List of past tickets */}
                  <div className="lg:col-span-6 space-y-4">
                    <h4 className="font-extrabold text-charcoal-ink text-sm">Active Tickets</h4>
                    
                    {tickets.length > 0 ? (
                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                        {tickets.map((t) => (
                          <div key={t._id} className="p-4 bg-alabaster-linen border border-charcoal-ink/08 rounded-none hover:border-charcoal-ink/15 transition-all">
                            <div className="flex justify-between items-start gap-3">
                              <span className="text-[10px] bg-charcoal-ink/05 text-charcoal-ink/60 font-bold px-2 py-0.5 border border-charcoal-ink/08">
                                {t.ticketId}
                              </span>
                              <div className="flex gap-2">
                                <span className={`px-2 py-0.5 rounded-none text-[9px] font-bold uppercase border tracking-wider ${
                                  t.priority === "CRITICAL"
                                    ? "bg-red-50 text-red-700 border-red-200"
                                    : t.priority === "HIGH"
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-slate-100 text-slate-700 border-slate-200"
                                }`}>
                                  {t.priority}
                                </span>
                                <span className={`px-2 py-0.5 rounded-none text-[9px] font-bold uppercase border tracking-wider ${
                                  t.status === "OPEN"
                                    ? "bg-linen-gold/10 text-linen-gold border-linen-gold/20"
                                    : "bg-slate-200 text-slate-600 border-slate-300"
                                }`}>
                                  {t.status}
                                </span>
                              </div>
                            </div>
                            
                            <p className="text-xs font-bold text-charcoal-ink mt-3 leading-relaxed">
                              {t.subject}
                            </p>
                            <p className="text-[10px] text-charcoal-ink/40 font-semibold mt-2.5">
                              Created {formatDate(t.createdAt)}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 border border-dashed border-charcoal-ink/15 rounded-none bg-alabaster-linen/30">
                        <HelpCircle className="w-8 h-8 text-charcoal-ink/20 mx-auto mb-2" />
                        <p className="text-slate-400 text-xs font-semibold">No open support tickets.</p>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* EDIT PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="space-y-8 animate-fade-in">
                
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold font-serif text-charcoal-ink tracking-tight">
                    Manage Profile Details
                  </h2>
                  <p className="text-slate-500 text-xs sm:text-sm mt-0.5 font-medium">
                    Keep your contact email, delivery address, and account category types accurate.
                  </p>
                </div>

                {profileSuccess && (
                  <div className="p-4 rounded-none bg-emerald-50 text-emerald-600 border border-emerald-100 text-xs font-semibold flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 shrink-0 text-emerald-500" />
                    {profileSuccess}
                  </div>
                )}

                {profileError && (
                  <div className="p-4 rounded-none bg-red-50 text-red-600 border border-red-100 text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                    {profileError}
                  </div>
                )}

                <form onSubmit={handleProfileUpdate} className="space-y-5 max-w-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div>
                      <label className="block text-3xs font-black text-charcoal-ink/50 uppercase tracking-wider mb-2">Full Name</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-charcoal-ink/40">
                          <User className="w-4 h-4" />
                        </span>
                        <input
                          type="text"
                          required
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                          placeholder="Your full name"
                          className="w-full pl-11 pr-4 py-3.5 bg-white border border-charcoal-ink/15 rounded-none text-charcoal-ink focus:outline-none focus:border-linen-gold text-xs font-semibold"
                        />
                      </div>
                    </div>

                    {/* Email address */}
                    <div>
                      <label className="block text-3xs font-black text-charcoal-ink/50 uppercase tracking-wider mb-2">Email Address</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-charcoal-ink/40">
                          <Mail className="w-4 h-4" />
                        </span>
                        <input
                          type="email"
                          required
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                          placeholder="Your email address"
                          className="w-full pl-11 pr-4 py-3.5 bg-white border border-charcoal-ink/15 rounded-none text-charcoal-ink focus:outline-none focus:border-linen-gold text-xs font-semibold"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Mobile number */}
                    <div>
                      <label className="block text-3xs font-black text-charcoal-ink/50 uppercase tracking-wider mb-2">Mobile Number</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-charcoal-ink/40">
                          <Phone className="w-4 h-4" />
                        </span>
                        <input
                          type="tel"
                          required
                          pattern="[0-9]{10}"
                          maxLength="10"
                          value={profileForm.mobile}
                          onChange={(e) => setProfileForm({...profileForm, mobile: e.target.value.replace(/\D/g, "")})}
                          placeholder="10-digit mobile number (Required)"
                          className="w-full pl-11 pr-4 py-3.5 bg-white border border-charcoal-ink/15 rounded-none text-charcoal-ink focus:outline-none focus:border-linen-gold text-xs font-bold"
                        />
                      </div>
                    </div>

                    {/* Account Type Category */}
                    <div>
                      <label className="block text-3xs font-black text-charcoal-ink/50 uppercase tracking-wider mb-2">Account Category</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-charcoal-ink/40">
                          <Building className="w-4 h-4" />
                        </span>
                        <select
                          value={profileForm.accountType}
                          onChange={(e) => setProfileForm({...profileForm, accountType: e.target.value})}
                          className="w-full pl-11 pr-4 py-3.5 bg-white border border-charcoal-ink/15 rounded-none text-charcoal-ink focus:outline-none focus:border-linen-gold text-xs font-bold"
                        >
                          <option value="Individual User">Individual User (Single customer)</option>
                          <option value="Commercial Partner">Commercial Partner (B2B business)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Complete Address */}
                  <div>
                    <label className="block text-3xs font-black text-charcoal-ink/50 uppercase tracking-wider mb-2">Complete Delivery Address</label>
                    <div className="relative">
                      <span className="absolute top-4 left-4 text-charcoal-ink/40">
                        <MapPin className="w-4 h-4" />
                      </span>
                      <textarea
                        value={profileForm.address}
                        onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                        placeholder="Complete address (room, building, sector, city, state, pin)"
                        rows="3"
                        className="w-full pl-11 pr-4 py-3.5 bg-white border border-charcoal-ink/15 rounded-none text-charcoal-ink focus:outline-none focus:border-linen-gold text-xs font-semibold resize-none"
                      ></textarea>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="py-3.5 px-8 rounded-none bg-charcoal-ink hover:bg-linen-gold text-white font-bold text-xs uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50"
                  >
                    {profileSaving ? "Saving details..." : "Save Changes"}
                  </button>
                </form>

                {/* DANGER ZONE: DELETE ACCOUNT */}
                <div className="pt-8 border-t border-charcoal-ink/10 max-w-2xl">
                  <div className="bg-red-50/60 border border-red-200/80 p-6 rounded-none space-y-4">
                    <div>
                      <h3 className="text-sm font-bold text-red-900 uppercase tracking-wider flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                        Danger Zone: Delete Account
                      </h3>
                      <p className="text-xs text-red-700/80 mt-1 font-medium leading-relaxed">
                        Permanently remove your account and personal profile data from ClosetRush.
                        <br />
                        <span className="font-bold text-red-900">Note:</span> Account deletion is only allowed if you have no active subscription plan or running orders.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      disabled={deletingAccount}
                      className="py-3 px-6 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                    >
                      {deletingAccount ? "Deleting Account..." : "Delete Account"}
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>
      </div>

      {/* MODAL: PAUSE SUBSCRIPTION (VACATION MODE) */}
      {showPauseModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#FCFBF9] border border-charcoal-ink/10 rounded-none w-full max-w-md p-8 shadow-2xl relative text-charcoal-ink">
            <button
              onClick={() => setShowPauseModal(false)}
              className="absolute top-6 right-6 text-charcoal-ink/40 hover:text-charcoal-ink cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-xs font-black text-charcoal-ink mb-2 uppercase tracking-widest">
              Activate Vacation Pause Mode
            </h2>
            <p className="text-3xs text-charcoal-ink/65 mb-6 font-semibold uppercase">Temporarily stop billing cycles and delivery swaps.</p>

            <form onSubmit={handlePauseSubscription} className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] text-charcoal-ink/50 font-black uppercase block tracking-wider">Pause Duration</label>
                <select
                  value={pauseDuration}
                  onChange={(e) => setPauseDuration(e.target.value)}
                  className="w-full bg-white border border-charcoal-ink/15 rounded-none py-3 px-4 text-xs text-charcoal-ink focus:outline-none focus:border-linen-gold cursor-pointer font-bold"
                >
                  <option value="1 week">1 Week (7 Days Max)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-charcoal-ink/50 font-black uppercase block tracking-wider">Linen Storage Preference</label>
                <select
                  value={pauseAction}
                  onChange={(e) => setPauseAction(e.target.value)}
                  className="w-full bg-white border border-charcoal-ink/15 rounded-none py-3 px-4 text-xs text-charcoal-ink focus:outline-none focus:border-linen-gold cursor-pointer font-bold"
                >
                  <option value="hold">Keep Sheets (Hold sheets at home for holidays)</option>
                  <option value="pickup">Return Sheets (Collect sheets now & inspect at warehouse)</option>
                </select>
                <p className="text-3xs text-charcoal-ink/55 leading-relaxed mt-1 font-semibold">
                  Hold sheets: Keep the linens at your home; swaps will resume automatically when you return. Return sheets: Our logistics staff will collect the rented set before you leave.
                </p>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowPauseModal(false)}
                  className="flex-1 py-3 px-6 rounded-none bg-white border border-charcoal-ink/15 hover:bg-slate-50 text-charcoal-ink text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pauseSubmitting}
                  className="flex-1 py-3 px-6 rounded-none bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-md shadow-amber-500/10 cursor-pointer text-center"
                >
                  {pauseSubmitting ? "Pausing..." : "Activate Pause"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
