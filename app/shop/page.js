"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bed,
  Layers,
  Truck,
  ShieldCheck,
  Check,
  X,
  User as UserIcon,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Lock,
  Sparkles,
  AlertCircle,
  RefreshCw,
  FileText,
  Building,
  ArrowRight,
  ChevronRight,
  ClipboardList,
  Download,
  Maximize,
  ListChecks,
  ChevronDown
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const BED_SIZES = [
  { id: "6x3", name: "6x3 (Single)", label: "Single" },
  { id: "6x4", name: "6x4 (Double)", label: "Double" },
  { id: "6x5", name: "6x5 (Queen)", label: "Queen" },
  { id: "6x6", name: "6x6 (King)", label: "King" }
];

export default function ShopPage() {
  const router = useRouter();

  // Configuration States (Rentickle Configurator)
  const [customerType, setCustomerType] = useState("B2C"); // "B2C" (Individual) | "B2B" (Business)
  const [selectedBedType, setSelectedBedType] = useState("Bedsheet + Pillow (Single)");
  const [color, setColor] = useState("Classic White");
  const [selectedSheets, setSelectedSheets] = useState(1); // 1 | 2 | 4 sheets per month
  const [selectedDuration, setSelectedDuration] = useState("Monthly"); // Monthly, Quarterly, 6 Months, 9 Months, Yearly

  // User session state
  const [user, setUser] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [plans, setPlans] = useState([]);
  const [productColors, setProductColors] = useState([]);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [settings, setSettings] = useState(null);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings");
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (err) {
      console.error("Fetch settings error in shop:", err);
    }
  };

  const fetchColors = async () => {
    try {
      const res = await fetch("/api/colors");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.colors) {
          setProductColors(data.colors);
        }
      }
    } catch (err) {
      console.error("Fetch product colors error in shop:", err);
    }
  };

  // Fetch plans from database
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
      console.error("Fetch plans error in shop:", err);
    } finally {
      setLoadingPlans(false);
    }
  };

  // Fetch user session
  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
          // Auto-fill profile states from user details
          setProfileName(data.user.name || "");
          setProfileEmail(data.user.email || "");
          setProfilePhone(data.user.mobile || "");
          setProfileAddress(data.user.address || "");
          setProfilePincode(data.user.pincode || "");

          // B2B Auto-fills
          setB2bOwnerName(data.user.name || "");
          setB2bContactPerson(data.user.name || "");
          setB2bPropertyName((data.user.name || "") + " Hospitality");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSession(false);
    }
  };

  useEffect(() => {
    fetchSession();
    fetchPlans();
    fetchColors();
    fetchSettings();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const type = params.get("type");
      if (type === "B2B") {
        setCustomerType("B2B");
      }
    }
    // Load Razorpay checkout script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  // Ensure selectedBedType is set appropriately
  useEffect(() => {
    if (!selectedBedType.includes("Single") && !selectedBedType.includes("Double")) {
      setSelectedBedType("Bedsheet + Pillow (Single)");
    }
  }, [selectedBedType]);

  const getFallbackColors = () => {
    const isSingle = selectedBedType.toLowerCase().includes("single");
    const isDouble = selectedBedType.toLowerCase().includes("double");
    const isBlanket = selectedBedType.toLowerCase().includes("blanket");
    const isQuilt = selectedBedType.toLowerCase().includes("quilt");

    if (isBlanket) {
      return [
        { colorName: "Slate Gray", hexCode: "#64748B", images: ["/cat_blankets.png", "/banner_1.png"] },
        { colorName: "Deep Teal", hexCode: "#1A4F54", images: ["/cat_blankets.png", "/banner_1.png"] }
      ];
    } else if (isQuilt) {
      return [
        { colorName: "Classic White", hexCode: "#FFFFFF", images: ["/cat_quilt.png", "/banner_1.png"] },
        { colorName: "Lavender Mist", hexCode: "#E9E3FF", images: ["/cat_quilt.png", "/banner_1.png"] }
      ];
    } else if (isSingle) {
      return [
        { colorName: "Classic White", hexCode: "#FFFFFF", images: ["/cat_single.png", "/banner_1.png"] },
        { colorName: "Deep Teal", hexCode: "#1A4F54", images: ["/cat_single.png", "/banner_1.png"] },
        { colorName: "Turquoise Mist", hexCode: "#05D4B5", images: ["/cat_single.png", "/banner_1.png"] }
      ];
    } else {
      return [
        { colorName: "Classic White", hexCode: "#FFFFFF", images: ["/cat_double.png", "/banner_1.png"] },
        { colorName: "Deep Teal", hexCode: "#1A4F54", images: ["/cat_double.png", "/banner_1.png"] }
      ];
    }
  };

  const availableColors = productColors.filter(c => c.bedType === selectedBedType);
  const activeColorsToRender = availableColors.length > 0 ? availableColors : getFallbackColors();

  // Sync color selection and activeImgIdx when bedType or productColors load
  useEffect(() => {
    if (activeColorsToRender.length > 0) {
      const colorNames = activeColorsToRender.map(c => c.colorName);
      if (!colorNames.includes(color)) {
        setColor(activeColorsToRender[0].colorName);
        setActiveImgIdx(0);
      }
    }
  }, [selectedBedType, productColors]);

  // Sync image index when color changes
  useEffect(() => {
    setActiveImgIdx(0);
  }, [color]);

  const getBedSizeLabel = (type) => {
    return type;
  };

  const getTenureDetails = (dur) => {
    const matchingPlan = plans.find(p => p.bedType === selectedBedType && p.duration === dur);
    const discountText = matchingPlan?.discount || null;

    let displayName = dur;
    if (dur === "1 Month") displayName = "Monthly";
    else if (dur === "3 Months") displayName = "Quarterly";
    else if (dur === "12 Months") displayName = "Yearly";

    return { displayName, discountText };
  };

  // Step Tracker State
  const [activeStep, setActiveStep] = useState(1);

  // Step 2: Auth Form States
  const [authMode, setAuthMode] = useState("login");
  const [authMethod, setAuthMethod] = useState("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Step 3: Complete Profile States
  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [profileCity, setProfileCity] = useState("Delhi NCR");
  const [profilePincode, setProfilePincode] = useState("");

  // B2B Business Profile Fields
  const [b2bOwnerName, setB2bOwnerName] = useState("");
  const [b2bPropertyName, setB2bPropertyName] = useState("");
  const [b2bContactPerson, setB2bContactPerson] = useState("");
  const [b2bGSTNumber, setB2bGSTNumber] = useState("");

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");

  // B2B RFQ Specifications
  const [b2bRoomsCount, setB2bRoomsCount] = useState(10);
  const [b2bBedsCount, setB2bBedsCount] = useState(15);
  const [b2bBedType, setB2bBedType] = useState("Double");
  const [b2bBedsheetReqs, setB2bBedsheetReqs] = useState(["White Bedsheet", "Premium Cotton"]);

  // Step 4: Checkout / Review RFQ States
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("Pending");
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Step 5: Confirmation States
  const [orderId, setOrderId] = useState("");
  const [b2bQuoteId, setB2bQuoteId] = useState("");
  const [b2bQuoteStatus, setB2bQuoteStatus] = useState("PENDING");
  const [b2bQuotePrice, setB2bQuotePrice] = useState(0);

  // E-Sign states
  const [showESignModal, setShowESignModal] = useState(false);
  const [signatureName, setSignatureName] = useState("");
  const [signatureType, setSignatureType] = useState("draw");

  // Calculate dynamic B2C pricing based on selection
  const getB2CPricing = () => {
    const isSingle = selectedBedType.toLowerCase().includes("single");
    const numSheets = Number(selectedSheets) || 1;

    const matchedPlan = plans.find(p => {
      const pIsSingle = (p.bedType && p.bedType.toLowerCase().includes("single")) || (p.bedTypeRaw === "single");
      return (isSingle ? pIsSingle : !pIsSingle) && Number(p.sheetsPerMonth) === numSheets;
    });

    let baseMRP = isSingle ? 100 : 200;
    let depositAmt = isSingle ? 200 : 400;

    if (matchedPlan) {
      if (matchedPlan.monthlyRate !== undefined && matchedPlan.monthlyRate !== null) {
        baseMRP = Number(matchedPlan.monthlyRate);
      } else if (matchedPlan.price !== undefined && matchedPlan.price !== null) {
        baseMRP = Number(matchedPlan.price);
      }

      if (matchedPlan.depositAmount !== undefined && matchedPlan.depositAmount !== null) {
        depositAmt = Number(matchedPlan.depositAmount);
      } else if (matchedPlan.securityDeposit !== undefined && matchedPlan.securityDeposit !== null) {
        depositAmt = Number(matchedPlan.securityDeposit);
      }
    }

    let discountPercent = 0;
    let durationMonths = 1;

    if (selectedDuration === "Quarterly" || selectedDuration === "3 Months") {
      discountPercent = 5;
      durationMonths = 3;
    } else if (selectedDuration === "6 Months") {
      discountPercent = 10;
      durationMonths = 6;
    } else if (selectedDuration === "9 Months") {
      discountPercent = 10;
      durationMonths = 9;
    } else if (selectedDuration === "Yearly" || selectedDuration === "12 Months") {
      discountPercent = 20;
      durationMonths = 12;
    } else {
      discountPercent = 0;
      durationMonths = 1;
    }

    const effectiveMonthlyRate = Math.round(baseMRP * (1 - discountPercent / 100));
    const subtotal = effectiveMonthlyRate * durationMonths;

    let couponDiscount = 0;
    if (appliedCoupon) {
      if (appliedCoupon.discountType === "percentage") {
        couponDiscount = Math.round(subtotal * (appliedCoupon.discountValue / 100));
      } else {
        couponDiscount = appliedCoupon.discountValue;
      }
      if (couponDiscount >= subtotal) {
        couponDiscount = Math.max(0, subtotal - 1);
      }
    }

    const discountedBase = Math.max(1, subtotal - couponDiscount);
    const taxableBase = Number((discountedBase / 1.18).toFixed(2));
    const gst = Number((discountedBase - taxableBase).toFixed(2));
    const deposit = depositAmt;
    const total = discountedBase + deposit;

    return {
      baseMRP,
      effectiveMonthlyRate,
      durationMonths,
      subtotal,
      couponDiscount,
      discountedBase,
      taxableBase,
      gst,
      deposit,
      total,
      discountPercent,
      planExists: true
    };
  };

  const b2cPricing = getB2CPricing();

  const uniqueBedTypes = ["Bedsheet + Pillow (Single)", "Bedsheet + Pillow (Double)"];
  const availableDurationsForBed = ["Monthly", "Quarterly", "6 Months", "9 Months", "Yearly"];

  // Send OTP handler
  const handleSendOtp = async () => {
    setAuthError("");
    setAuthSuccess("");
    const target = email || mobile;
    if (!target) {
      setAuthError("Email or Mobile is required to send verification code.");
      return;
    }
    setAuthLoading(true);
    try {
      const purpose = authMode === "signup" ? "signup" : "login";
      const payload = {};
      if (target.includes("@")) {
        payload.email = target;
      } else {
        payload.mobile = target;
      }
      payload.purpose = purpose;

      const res = await fetch("/api/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSent(true);
        setAuthSuccess("Verification code sent successfully.");
      } else {
        setAuthError(data.error || "Failed to send code.");
      }
    } catch (err) {
      setAuthError("Network error occurred.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Auth Submit handler (Login or Signup)
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setAuthLoading(true);

    try {
      if (authMode === "login") {
        let res, data;
        if (authMethod === "email") {
          res = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
          });
        } else {
          res = await fetch("/api/auth/otp/verify-login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              [email.includes("@") ? "email" : "mobile"]: email,
              code: otpCode
            })
          });
        }
        data = await res.json();
        if (res.ok) {
          setAuthSuccess("Logged in successfully!");
          setUser(data.user);
          setProfileName(data.user.name || "");
          setProfileEmail(data.user.email || "");
          setProfilePhone(data.user.mobile || "");
          setProfileAddress(data.user.address || "");
          setTimeout(() => {
            setActiveStep(3);
            setAuthSuccess("");
          }, 1000);
        } else {
          setAuthError(data.error || "Authentication failed.");
        }
      } else {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            email,
            mobile,
            password,
            accountType: customerType === "B2C" ? "Individual User" : "Commercial Partner",
            otpCode: otpCode || undefined
          })
        });
        const data = await res.json();
        if (res.ok) {
          if (data.verificationRequired) {
            setOtpSent(true);
            setAuthSuccess("Verification code sent! Enter code to complete signup.");
          } else {
            setAuthSuccess("Registered successfully!");
            setUser(data.user);
            setProfileName(data.user.name || "");
            setProfileEmail(data.user.email || "");
            setProfilePhone(data.user.mobile || "");
            setProfileAddress(data.user.address || "");
            setTimeout(() => {
              setActiveStep(3);
              setAuthSuccess("");
            }, 1000);
          }
        } else {
          setAuthError(data.error || "Signup failed.");
        }
      }
    } catch (err) {
      setAuthError("Network error occurred.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Complete Profile Submit handler
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSaving(true);

    try {
      const payload = {
        name: profileName,
        email: profileEmail,
        mobile: profilePhone,
        address: `${profileAddress}, ${profileCity} - ${profilePincode}`,
        accountType: customerType === "B2C" ? "Individual User" : "Commercial Partner"
      };

      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setActiveStep(4);
      } else {
        setProfileError(data.error || "Failed to save profile.");
      }
    } catch (err) {
      setProfileError("Network error saving profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  // Apply Coupon handler
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    setCouponError("");
    setCouponSuccess("");
    try {
      const res = await fetch("/api/user/apply-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          couponCode: couponCode.trim(),
          subtotal: b2cPricing.subtotal
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedCoupon({
          couponCode: data.couponCode,
          discountType: data.discountType,
          discountValue: data.discountValue,
          discount: data.discount
        });
        setCouponSuccess(`Coupon code '${data.couponCode}' applied! Discount: ₹${data.discount}`);
      } else {
        setAppliedCoupon(null);
        setCouponError(data.error || "Invalid coupon code.");
      }
    } catch (err) {
      setCouponError("Error validating coupon code.");
    } finally {
      setValidatingCoupon(false);
    }
  };

  // B2C Plan Checkout submit
  const handleB2CCheckout = async () => {
    setCheckoutError("");
    setCheckoutLoading(true);

    try {
      const itemTier = "BASIC";
      const sizeLabel = selectedBedType;

      const orderRes = await fetch("/api/payment/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalPrice: b2cPricing.total,
          orderDetails: {
            bedType: selectedBedType,
            planName: `${sizeLabel} (${selectedSheets} Bed Sheet${selectedSheets > 1 ? 's' : ''}/Mo - ${selectedDuration})`,
            price: b2cPricing.subtotal,
            duration: selectedDuration,
            sheetsPerMonth: selectedSheets,
            subscriptionType: "monthly",
            securityDeposit: b2cPricing.deposit,
            gst: b2cPricing.gst,
            totalPrice: b2cPricing.total,
            couponCode: appliedCoupon ? appliedCoupon.couponCode : null,
            discount: b2cPricing.couponDiscount,
            orderType: "RENT",
            itemTier
          }
        })
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || "Failed to initialize payment gateway.");
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "ClosetRush",
        description: `${sizeLabel} Sheets (${selectedDuration})`,
        order_id: orderData.orderId,
        handler: async function (response) {
          try {
            setCheckoutLoading(true);
            const verifyPayload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderDetails: {
                bedType: selectedBedType,
                planName: `${sizeLabel} (${selectedSheets} Bed Sheet${selectedSheets > 1 ? 's' : ''}/Mo - ${selectedDuration})`,
                price: b2cPricing.subtotal,
                duration: selectedDuration,
                sheetsPerMonth: selectedSheets,
                subscriptionType: "monthly",
                securityDeposit: b2cPricing.deposit,
                gst: b2cPricing.gst,
                totalPrice: b2cPricing.total,
                address: `${profileAddress}, ${profileCity} - ${profilePincode}`,
                mobile: profilePhone,
                color,
                isCustom: color !== "Classic White",
                couponCode: appliedCoupon ? appliedCoupon.couponCode : null,
                discount: b2cPricing.couponDiscount,
                orderType: "RENT",
                itemTier,
              }
            };
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(verifyPayload)
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok && verifyData.success) {
              setOrderId(response.razorpay_payment_id);
              setActiveStep(5);
            } else {
              setCheckoutError(verifyData.error || "Payment verification failed.");
            }
          } catch (verifyErr) {
            setCheckoutError("Failed to verify payment. Please contact support.");
          } finally {
            setCheckoutLoading(false);
          }
        },
        prefill: {
          name: orderData.user.name,
          email: orderData.user.email,
          contact: profilePhone || orderData.user.mobile,
        },
        theme: { color: "#032026" },
        modal: {
          ondismiss: function () {
            setCheckoutLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("Razorpay error:", err);
      setCheckoutError(err.message || "Something went wrong connecting to Razorpay.");
      setCheckoutLoading(false);
    }
  };

  // B2B RFQ Quote submit
  const handleB2BQuoteSubmit = async () => {
    setCheckoutError("");
    setCheckoutLoading(true);

    try {
      const requirementsText = b2bBedsheetReqs.join(", ");
      const payload = {
        propertyName: b2bPropertyName,
        ownerName: b2bOwnerName,
        contactPerson: b2bContactPerson,
        mobile: profilePhone,
        email: profileEmail,
        gstNumber: b2bGSTNumber,
        propertyAddress: `${profileAddress}, ${profileCity} - ${profilePincode}`,
        roomsCount: b2bRoomsCount,
        bedsCount: b2bBedsCount,
        bedType: b2bBedType,
        bedsheetRequirements: b2bBedsheetReqs,
        businessType: "Hotel/PG/Hostel",
        bundleSelections: `${b2bBedType} Bed sheets, setup count: ${b2bBedsCount}`,
        message: `Quotation requested for Property Name: ${b2bPropertyName}. Requirements: ${requirementsText}. GST: ${b2bGSTNumber || 'None'}.`,
        estimatedTotal: b2bBedsCount * 250
      };

      const res = await fetch("/api/user/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setB2bQuoteId(data.quote._id);
        setB2bQuoteStatus("PENDING");
        setActiveStep(5);
      } else {
        setCheckoutError(data.error || "Failed to submit quotation request.");
      }
    } catch (err) {
      setCheckoutError("Network error submitting RFQ.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleB2BPayQuote = async () => {
    try {
      const res = await fetch("/api/user/quote", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteId: b2bQuoteId,
          status: "CONFIRMED"
        })
      });
      if (res.ok) {
        setB2bQuoteStatus("CONFIRMED");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setUser(null);
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // E-Sign Canvas Event Listeners
  useEffect(() => {
    if (showESignModal && signatureType === "draw") {
      const canvas = document.getElementById("sig-canvas");
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let drawing = false;
      const getPos = (e) => {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
          x: clientX - rect.left,
          y: clientY - rect.top
        };
      };

      const start = (e) => {
        drawing = true;
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
      };
      const move = (e) => {
        if (!drawing) return;
        e.preventDefault();
        const pos = getPos(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
      };
      const stop = () => { drawing = false; };

      canvas.addEventListener("mousedown", start);
      canvas.addEventListener("mousemove", move);
      window.addEventListener("mouseup", stop);

      canvas.addEventListener("touchstart", start);
      canvas.addEventListener("touchmove", move, { passive: false });
      window.addEventListener("touchend", stop);

      return () => {
        canvas.removeEventListener("mousedown", start);
        canvas.removeEventListener("mousemove", move);
        window.removeEventListener("mouseup", stop);
        canvas.removeEventListener("touchstart", start);
        canvas.removeEventListener("touchmove", move);
        window.removeEventListener("touchend", stop);
      };
    }
  }, [showESignModal, signatureType]);

  const handleClearSignature = () => {
    const canvas = document.getElementById("sig-canvas");
    if (canvas) {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const handleB2BEsignSubmit = async () => {
    if (!signatureName.trim()) {
      alert("Please enter your name to verify the signature.");
      return;
    }

    let signatureImg = "";
    if (signatureType === "draw") {
      const canvas = document.getElementById("sig-canvas");
      if (canvas) {
        signatureImg = canvas.toDataURL();
      }
    } else {
      signatureImg = `TYPED:${signatureName}`;
    }

    try {
      const res = await fetch("/api/user/quote", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteId: b2bQuoteId,
          status: "ACCEPTED",
          signatureData: signatureImg,
          signedBy: signatureName
        })
      });
      if (res.ok) {
        setB2bQuoteStatus("ACCEPTED");
        setShowESignModal(false);
      } else {
        const err = await res.json();
        alert("E-sign failed: " + err.error);
      }
    } catch (err) {
      console.error(err);
      alert("Network error executing e-signature.");
    }
  };

  const currentColorObj = activeColorsToRender.find(c => c.colorName === color) || activeColorsToRender[0];
  const galleryImages = currentColorObj && currentColorObj.images && currentColorObj.images.length > 0
    ? currentColorObj.images
    : [selectedBedType.toLowerCase().includes("single") ? "/cat_single.png" : "/cat_double.png"];

  const mainImage = galleryImages[activeImgIdx] || galleryImages[0];

  if (loadingSession || loadingPlans) {
    return (
      <div className="min-h-screen bg-[#032026] text-white flex flex-col items-center justify-center font-sans antialiased relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#05D4B5]/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="text-center space-y-8 max-w-md px-6 relative z-10">
          <div className="relative w-32 h-32 mx-auto bg-white/5 border border-[#05D4B5]/30 shadow-2xl rounded-full overflow-hidden flex items-center justify-center backdrop-blur-xl">
            <div className="relative z-10 flex flex-col items-center justify-center space-y-2 animate-pulse">
              <Bed className="w-10 h-10 text-[#05D4B5]" />
              <span className="text-[9px] font-black uppercase tracking-widest text-[#05D4B5]">Sanitizing</span>
            </div>
          </div>

          <div className="space-y-4">
            <img
              src="/image.png"
              alt="ClosetRush Logo"
              className="h-12 w-auto mx-auto object-contain shrink-0"
            />
            <h1 className="font-serif font-bold text-2xl uppercase tracking-[0.2em] text-white">
              CLOSET RUSH
            </h1>

            <div className="space-y-1.5">
              <span className="text-[11px] text-[#05D4B5] font-black uppercase tracking-widest block animate-pulse">
                Thermodynamic Sanitization Active
              </span>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest leading-relaxed">
                Loading luxury linen collections...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FCFBF9] text-[#0D1518] font-sans antialiased flex flex-col justify-between" id="shop-page">
      {/* Navigation */}
      <Navbar user={user} loading={loadingSession} handleLogout={handleLogout} />

      {/* Hero Header Section */}
      <header className="relative w-full pt-24 md:pt-36 pb-8 sm:pb-16 bg-[#032026] text-white overflow-hidden">
        {/* Glows and grid backdrop */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-teal-950/20 via-transparent to-transparent pointer-events-none z-0 opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#05D4B5]/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-[1380px] mx-auto px-5 sm:px-12 text-center space-y-3 sm:space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 sm:px-5 sm:py-2 bg-[#05D4B5]/10 border border-[#05D4B5]/20 rounded-full backdrop-blur-md shadow-[0_0_20px_rgba(5,212,181,0.15)]">
            <span className="text-[#05D4B5] text-xs">✦</span>
            <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-[#05D4B5] font-mono">
              {customerType === "B2C" ? "Luxury Bedding Subscription" : "Commercial B2B Linen Supply"}
            </span>
          </div>

          <h1 className="text-2xl sm:text-6xl font-serif font-medium text-white tracking-tight leading-tight max-w-4xl mx-auto">
            {customerType === "B2C" ? (
              <>Choose your plan & <span className="text-[#05D4B5] italic font-normal">sleep in luxury.</span></>
            ) : (
              <>Bulk linen supply for <span className="text-[#05D4B5] italic font-normal">Hotels & Hostels.</span></>
            )}
          </h1>

          <p className="text-gray-300 max-w-2xl mx-auto text-xs sm:text-base font-light leading-relaxed">
            {customerType === "B2C"
              ? "Select your bed size, choose your preferred swap tenure, and get 100% UV-sanitized organic cotton sheets delivered directly to your doorstep."
              : "Get custom volume-discounted quotes for your commercial property with zero laundry hassle."}
          </p>

          {/* Channel Selector Pills inside Header */}
          <div className="pt-2 sm:pt-4 flex justify-center">
            <div className="inline-flex p-1 sm:p-1.5 bg-white/10 border border-white/15 rounded-full backdrop-blur-xl shadow-inner">
              <button
                type="button"
                onClick={() => setCustomerType("B2C")}
                className={`px-4 py-2 sm:px-6 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                  customerType === "B2C"
                    ? "bg-[#05D4B5] text-[#032026] shadow-lg shadow-[#05D4B5]/20 scale-105"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Individual (B2C)
              </button>
              <button
                type="button"
                onClick={() => setCustomerType("B2B")}
                className={`px-4 py-2 sm:px-6 sm:py-2.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest transition-all duration-300 cursor-pointer ${
                  customerType === "B2B"
                    ? "bg-[#05D4B5] text-[#032026] shadow-lg shadow-[#05D4B5]/20 scale-105"
                    : "text-white/70 hover:text-white"
                }`}
              >
                Hotels/PGs (B2B)
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1380px] mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12 flex-grow w-full">

        {/* Step Indicator Header */}
        <div className="mb-6 sm:mb-14 max-w-4xl mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-between text-center relative">
            <div className="absolute top-4 sm:top-1/2 left-0 right-0 h-[2px] bg-[#032026]/10 -translate-y-1/2 z-0" />

            {[
              { num: 1, text: "Configure" },
              { num: 2, text: "Register" },
              { num: 3, text: "Profile" },
              { num: 4, text: customerType === "B2C" ? "Checkout" : "RFQ Review" },
              { num: 5, text: "Confirmation" }
            ].map((s) => (
              <div key={s.num} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-8 h-8 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-extrabold text-[10px] sm:text-xs uppercase tracking-wider transition-all duration-500 border-2 ${
                    activeStep === s.num
                      ? "bg-[#05D4B5] text-[#032026] border-[#05D4B5] shadow-[0_0_15px_rgba(5,212,181,0.4)] scale-105 sm:scale-110"
                      : activeStep > s.num
                      ? "bg-[#032026] text-[#05D4B5] border-[#032026] shadow-md"
                      : "bg-[#FCFBF9] text-[#032026]/30 border-[#032026]/15"
                  }`}
                >
                  {activeStep > s.num ? <Check className="w-4 h-4 sm:w-5 sm:h-5 text-[#05D4B5]" /> : s.num}
                </div>
                <span className={`text-[8px] sm:text-[10px] uppercase tracking-wider font-extrabold mt-1 sm:mt-2.5 transition-colors ${
                  activeStep === s.num
                    ? "text-[#05D4B5] font-black"
                    : activeStep > s.num
                    ? "text-[#032026] font-bold"
                    : "text-[#032026]/30"
                }`}>
                  {s.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* STEP 1: CONFIGURE BEDDING SYSTEM */}
        {activeStep === 1 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Column: Product Image Gallery Card */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-28">
              <div className="bg-white border border-[#032026]/10 p-6 sm:p-8 rounded-[28px] shadow-[0_15px_40px_rgba(0,0,0,0.03)] space-y-6 transition-all">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#05D4B5] bg-[#05D4B5]/10 px-4 py-1.5 rounded-full border border-[#05D4B5]/20 inline-block">
                    {customerType === "B2C" ? "Premium Bedding Rentals" : "Bulk B2B Linen Supply"}
                  </span>
                  <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#032026] leading-tight mt-4">
                    {selectedBedType} Linen Set
                  </h2>
                </div>

                <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#FCFBF9] border border-[#032026]/10 rounded-2xl shadow-inner">
                  <img
                    src={mainImage}
                    alt="Bed Sheets"
                    className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
                  />
                  {(!currentColorObj || !currentColorObj.images || currentColorObj.images.length === 0) && (
                    <div
                      className="absolute inset-0 mix-blend-multiply opacity-20 pointer-events-none"
                      style={{ backgroundColor: currentColorObj?.hexCode || "#FFFFFF" }}
                    />
                  )}
                </div>

                {/* Image Gallery Thumbnails Row */}
                {galleryImages.length > 1 && (
                  <div className="flex gap-3 justify-center">
                    {galleryImages.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImgIdx(idx)}
                        className={`w-14 h-11 rounded-xl border overflow-hidden transition-all cursor-pointer ${
                          activeImgIdx === idx 
                            ? "border-[#05D4B5] ring-2 ring-[#05D4B5]/30 scale-105 shadow-md" 
                            : "border-[#032026]/10 hover:border-[#032026]/30"
                        }`}
                      >
                        <img src={img} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="space-y-4 pt-6 border-t border-[#032026]/10">
                  <span className="text-3xs uppercase tracking-widest text-[#032026]/40 font-black block">Linen Kit Package Contents</span>
                  <div className="bg-[#FCFBF9] p-4 rounded-2xl border border-[#032026]/10 text-3xs text-[#032026]/80 space-y-2 uppercase tracking-wider font-extrabold font-sans">
                    {selectedBedType.toLowerCase().includes("single") ? (
                      <>
                        <p className="flex justify-between"><span>Premium Bed Sheets:</span> <span className="text-[#032026] font-black">{selectedSheets} Single Sheet{selectedSheets > 1 ? 's' : ''}</span></p>
                        <p className="flex justify-between"><span>Sanitized Pillow Covers:</span> <span className="text-[#032026] font-black">{selectedSheets} Pillow Cover{selectedSheets > 1 ? 's' : ''}</span></p>
                      </>
                    ) : (
                      <>
                        <p className="flex justify-between"><span>Premium Bed Sheets:</span> <span className="text-[#032026] font-black">{selectedSheets} Double Sheet{selectedSheets > 1 ? 's' : ''}</span></p>
                        <p className="flex justify-between"><span>Sanitized Pillow Covers:</span> <span className="text-[#032026] font-black">{selectedSheets * 2} Pillow Cover{selectedSheets * 2 > 1 ? 's' : ''}</span></p>
                      </>
                    )}
                    <p className="flex justify-between"><span>Thread Count (TC):</span> <span className="text-[#05D4B5] font-black">400 TC Organic Cotton</span></p>
                  </div>

                  <span className="text-3xs uppercase tracking-widest text-[#032026]/40 font-black block">Sanitary & Delivery Guarantees</span>
                  <ul className="space-y-3 text-3xs font-extrabold uppercase tracking-widest text-[#032026]/70">
                    <li className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-[#05D4B5]/10 text-[#05D4B5] rounded-lg">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <span>Thermodynamic UV-C Sterilized</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-[#05D4B5]/10 text-[#05D4B5] rounded-lg">
                        <Truck className="w-4 h-4" />
                      </div>
                      <span>Free Doorstep Swap Logistics</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Configurator Panel */}
            <div className="lg:col-span-7 bg-white border border-[#032026]/10 p-6 sm:p-8 rounded-[28px] shadow-[0_15px_40px_rgba(0,0,0,0.03)] space-y-8">
              
              {/* Type (Select Bed Dimensions) */}
              <div className="space-y-3">
                <span className="text-3xs uppercase tracking-widest text-[#032026]/50 font-black block">Type (Select Bed Dimensions)</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: "Bedsheet + Pillow (Single)", label: "Bedsheet + Pillow (Single)" },
                    { id: "Bedsheet + Pillow (Double)", label: "Bedsheet + Pillow (Double)" }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedBedType(item.id)}
                      className={`py-3.5 px-4 border rounded-2xl text-center transition-all duration-300 cursor-pointer text-xs font-black uppercase tracking-wider ${
                        selectedBedType === item.id
                          ? "bg-[#032026] text-[#05D4B5] border-[#032026] shadow-lg shadow-[#032026]/10 scale-[1.02]"
                          : "bg-[#FCFBF9] border-[#032026]/10 hover:border-[#032026]/30 text-[#032026]"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* B2C specific options: Sheet Quantity & Tenure */}
              {customerType === "B2C" ? (
                <>
                  {/* Sheets Quantity Selection (Dynamic from DB Plans) */}
                  <div className="space-y-3">
                    <span className="text-3xs uppercase tracking-widest text-[#032026]/50 font-black block">Select Sheets Quantity (Per Month)</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {(() => {
                        const isSingle = selectedBedType.toLowerCase().includes("single");
                        const filteredPlans = plans.filter(p => {
                          const pIsSingle = (p.bedType && p.bedType.toLowerCase().includes("single")) || (p.bedTypeRaw === "single");
                          return isSingle ? pIsSingle : !pIsSingle;
                        });

                        const activeOptions = filteredPlans.length > 0
                          ? filteredPlans.sort((a, b) => (a.sheetsPerMonth || 1) - (b.sheetsPerMonth || 1))
                          : [
                              { sheetsPerMonth: 1, name: "1 Bed Sheet", monthlyRate: isSingle ? 100 : 200 },
                              { sheetsPerMonth: 2, name: "2 Bed Sheets", monthlyRate: isSingle ? 200 : 400 },
                              { sheetsPerMonth: 4, name: "4 Bed Sheets", monthlyRate: isSingle ? 800 : 800 }
                            ];

                        return activeOptions.map((opt, idx) => {
                          const numSheets = opt.sheetsPerMonth || 1;
                          const mrp = opt.monthlyRate !== undefined ? opt.monthlyRate : (opt.price || 100);
                          const effectiveRate = Math.round(mrp * (1 - (b2cPricing.discountPercent || 0) / 100));
                          const isSelected = selectedSheets === numSheets;
                          const displayLabel = opt.name || `${numSheets} Bed Sheet${numSheets > 1 ? 's' : ''}`;

                          return (
                            <button
                              key={opt._id || `${numSheets}_${idx}`}
                              type="button"
                              onClick={() => setSelectedSheets(numSheets)}
                              className={`py-3.5 px-2 border rounded-2xl text-center transition-all duration-300 cursor-pointer ${
                                isSelected
                                  ? "bg-[#032026] text-[#05D4B5] border-[#032026] shadow-lg shadow-[#032026]/10 scale-[1.02]"
                                  : "bg-[#FCFBF9] border-[#032026]/10 hover:border-[#032026]/30 text-[#032026]"
                              }`}
                            >
                              <span className="text-[10px] font-black uppercase block tracking-wider">{displayLabel}</span>
                              <span className={`text-[9px] font-bold block mt-0.5 ${isSelected ? "text-[#05D4B5]" : "text-[#032026]/60"}`}>
                                {b2cPricing.discountPercent > 0 ? (
                                  <>
                                    <span className="line-through opacity-50 mr-1">₹{mrp}</span>
                                    ₹{effectiveRate} / mo
                                  </>
                                ) : (
                                  `₹${mrp} / mo`
                                )}
                              </span>
                            </button>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Subscription Duration Tenure */}
                  <div className="space-y-3">
                    <span className="text-3xs uppercase tracking-widest text-[#032026]/50 font-black block">Subscription Duration Tenure</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {[
                        { id: "Monthly", label: "Monthly", discount: null },
                        { id: "Quarterly", label: "Quarterly", discount: "5% off" },
                        { id: "6 Months", label: "6 Months", discount: "10% off" },
                        { id: "9 Months", label: "9 Months", discount: "10% off" },
                        { id: "Yearly", label: "Yearly", discount: "20% off" }
                      ].map((tenure) => {
                        const isSelected = selectedDuration === tenure.id;
                        return (
                          <button
                            key={tenure.id}
                            type="button"
                            onClick={() => setSelectedDuration(tenure.id)}
                            className={`py-3.5 px-3 border rounded-2xl text-center transition-all duration-300 cursor-pointer ${
                              isSelected
                                ? "bg-[#032026] text-[#05D4B5] border-[#032026] shadow-lg shadow-[#032026]/10 scale-[1.02]"
                                : "bg-[#FCFBF9] border-[#032026]/10 hover:border-[#032026]/30 text-[#032026]"
                            }`}
                          >
                            <span className="text-[10px] font-black uppercase block tracking-wider">{tenure.label}</span>
                            {tenure.discount && (
                              <span className="text-[9px] font-bold text-[#05D4B5] block mt-0.5">{tenure.discount}</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                /* B2B Intro Notice */
                <div className="p-6 rounded-2xl border border-[#05D4B5]/30 bg-[#05D4B5]/10 text-[#032026] space-y-3 shadow-sm">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-[#032026]">
                    <Building className="w-5 h-5 text-[#05D4B5]" /> B2B Bulk Proposal Route
                  </div>
                  <p className="text-xs text-[#032026]/80 leading-relaxed font-medium">
                    For businesses like Hostels, PGs, and Hotels. Instead of standard monthly checkout rates, we process corporate applications via RFQ proposals. Provide property counts in next steps to request a volume-based discount quote.
                  </p>
                </div>
              )}

              {/* Footer configurator: Pricing or RFQ button */}
              <div className="pt-6 border-t border-[#032026]/10 space-y-6">
                {customerType === "B2C" ? (
                  <div className="bg-[#FCFBF9] p-6 rounded-2xl border border-[#032026]/10 space-y-3.5 text-xs shadow-inner">
                    <div className="flex justify-between items-baseline font-bold text-[#032026] uppercase tracking-widest text-3xs">
                      <div>
                        <span>Base Plan Cost Excl. GST ({b2cPricing.durationMonths} Month{b2cPricing.durationMonths > 1 ? 's' : ''})</span>
                        {b2cPricing.discountPercent > 0 && (
                          <span className="text-[9px] text-[#05D4B5] block font-normal lowercase tracking-normal font-sans">
                            ₹{b2cPricing.effectiveMonthlyRate}/mo ({b2cPricing.discountPercent}% off)
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-black">
                        {b2cPricing.discountPercent > 0 && (
                          <span className="line-through text-gray-400 font-normal mr-1.5">
                            ₹{Number(((b2cPricing.baseMRP * b2cPricing.durationMonths) / 1.18).toFixed(2))}
                          </span>
                        )}
                        ₹{b2cPricing.taxableBase}
                      </span>
                    </div>
                    {b2cPricing.couponDiscount > 0 && (
                      <div className="flex justify-between text-3xs text-[#05D4B5] font-bold uppercase tracking-widest">
                        <span>Coupon Discount ({appliedCoupon?.couponCode})</span>
                        <span>- ₹{b2cPricing.couponDiscount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-3xs text-[#032026]/75 font-bold uppercase tracking-widest">
                      <span>GST (18%)</span>
                      <span>₹{b2cPricing.gst}</span>
                    </div>
                    {b2cPricing.deposit > 0 && (
                      <div className="flex justify-between text-3xs text-[#032026]/75 font-bold uppercase tracking-widest">
                        <span>Security Deposit (Refundable)</span>
                        <span>+ ₹{b2cPricing.deposit}</span>
                      </div>
                    )}
                    <div className="border-t border-[#032026]/10 pt-4 flex justify-between items-baseline font-black uppercase text-2xs tracking-widest text-[#05D4B5]">
                      <span>Total Checkout Upfront</span>
                      <span className="text-2xl font-black text-[#032026] font-serif">₹{b2cPricing.total}</span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#FCFBF9] p-5 rounded-2xl border border-[#032026]/10 text-3xs flex justify-between items-center font-bold text-[#032026] uppercase tracking-widest">
                    <span>B2B pricing range</span>
                    <span className="text-[#05D4B5] text-xs font-black">Custom volume quotes</span>
                  </div>
                )}

                {customerType === "B2C" && !user && (
                  <div className="flex items-center justify-center gap-2 text-center text-rose-650 bg-rose-50 border border-rose-150 p-3.5 rounded-2xl">
                    <Lock className="w-4 h-4 text-rose-600 shrink-0 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest leading-none">
                      Note: User login is required & mandatory to subscribe
                    </span>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (user) {
                      setActiveStep(3);
                    } else {
                      setActiveStep(2);
                    }
                  }}
                  className="w-full py-4.5 bg-[#05D4B5] hover:bg-[#032026] text-[#032026] hover:text-white font-extrabold text-xs uppercase tracking-[0.15em] transition-all duration-300 rounded-full shadow-xl shadow-[#05D4B5]/20 hover:scale-[1.02] active:scale-95 cursor-pointer"
                >
                  {customerType === "B2C" ? "Rent bedding set" : "Request quotation proposal"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: REGISTRATION / LOGIN */}
        {activeStep === 2 && (
          <div className="max-w-md mx-auto bg-white border border-[#032026]/10 p-8 sm:p-10 rounded-[28px] shadow-[0_15px_40px_rgba(0,0,0,0.04)] space-y-6">
            <div className="bg-rose-50 border border-rose-150 p-4 flex items-center gap-2.5 text-rose-700 rounded-2xl">
              <Lock className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="text-[10px] font-black uppercase tracking-widest leading-relaxed">
                Security Policy: User login is required & mandatory to subscribe to bedding sets.
              </span>
            </div>

            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold font-serif uppercase tracking-tight text-[#032026]">
                {authMode === "login" ? "Customer Login" : "Create Account"}
              </h2>
              <p className="text-3xs text-[#032026]/40 uppercase tracking-widest font-black">
                Select your credentials to authenticate and finalize subscription
              </p>
            </div>

            {authError && (
              <div className="p-3.5 bg-red-50 text-red-650 border border-red-150 text-[10px] font-bold uppercase tracking-wider rounded-2xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                {authError}
              </div>
            )}

            {authSuccess && (
              <div className="p-3.5 bg-emerald-50 text-emerald-650 border border-emerald-150 text-[10px] font-bold uppercase tracking-wider rounded-2xl flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                {authSuccess}
              </div>
            )}



            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authMode === "signup" && (
                <div>
                  <label className="block text-3xs font-black text-[#032026]/50 uppercase tracking-widest mb-1.5">Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#032026]/40">
                      <UserIcon className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                      className="w-full pl-11 pr-4 py-3.5 bg-[#FCFBF9] border border-[#032026]/15 rounded-2xl text-[#032026] text-xs focus:outline-none focus:border-[#05D4B5] focus:ring-2 focus:ring-[#05D4B5]/20 font-bold transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-3xs font-black text-[#032026]/50 uppercase tracking-widest mb-1.5">
                  {authMethod === "email" ? "Email Address" : "Mobile Phone"}
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#032026]/40">
                    {authMethod === "email" ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                  </span>
                  <input
                    type={authMethod === "email" ? "email" : "tel"}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={authMethod === "email" ? "email@example.com" : "10-digit phone number"}
                    className="w-full pl-11 pr-4 py-3.5 bg-[#FCFBF9] border border-[#032026]/15 rounded-2xl text-[#032026] text-xs focus:outline-none focus:border-[#05D4B5] focus:ring-2 focus:ring-[#05D4B5]/20 font-bold transition-all"
                  />
                </div>
              </div>

              {authMode === "signup" && (
                <div>
                  <label className="block text-3xs font-black text-[#032026]/50 uppercase tracking-widest mb-1.5">Phone Number</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#032026]/40">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength="10"
                      pattern="[0-9]{10}"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                      placeholder="10-digit mobile number"
                      className="w-full pl-11 pr-4 py-3.5 bg-[#FCFBF9] border border-[#032026]/15 rounded-2xl text-[#032026] text-xs focus:outline-none focus:border-[#05D4B5] focus:ring-2 focus:ring-[#05D4B5]/20 font-bold transition-all"
                    />
                  </div>
                </div>
              )}

              {authMethod === "email" && (
                <div>
                  <label className="block text-3xs font-black text-[#032026]/50 uppercase tracking-widest mb-1.5">Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#032026]/40">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                      className="w-full pl-11 pr-4 py-3.5 bg-[#FCFBF9] border border-[#032026]/15 rounded-2xl text-[#032026] text-xs focus:outline-none focus:border-[#05D4B5] focus:ring-2 focus:ring-[#05D4B5]/20 font-bold transition-all"
                    />
                  </div>
                </div>
              )}

              {authMethod === "otp" && otpSent && (
                <div>
                  <label className="block text-3xs font-black text-[#032026]/50 uppercase tracking-widest mb-1.5">Enter 6-Digit OTP</label>
                  <input
                    type="text"
                    required
                    maxLength="6"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter verification code"
                    className="w-full px-4 py-3.5 bg-[#FCFBF9] border border-[#032026]/15 rounded-2xl text-[#032026] text-xs focus:outline-none focus:border-[#05D4B5] font-bold text-center tracking-[0.5em]"
                  />
                </div>
              )}

              {authMethod === "otp" && !otpSent ? (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={authLoading}
                  className="w-full py-4 bg-[#05D4B5] hover:bg-[#032026] text-[#032026] hover:text-white font-extrabold text-xs uppercase tracking-widest rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#05D4B5]/20"
                >
                  {authLoading ? <RefreshCw className="w-4 h-4 animate-spin text-[#032026]" /> : "Send OTP code"}
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-4 bg-[#05D4B5] hover:bg-[#032026] text-[#032026] hover:text-white font-extrabold text-xs uppercase tracking-widest rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#05D4B5]/20"
                >
                  {authLoading ? <RefreshCw className="w-4 h-4 animate-spin text-[#032026]" /> : (authMode === "login" ? "Login to account" : "Complete Registration")}
                </button>
              )}
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#032026]/10"></div>
              </div>
              <div className="relative flex justify-center text-[10px] font-bold text-[#032026]/40 uppercase tracking-widest">
                <span className="bg-white px-3">OR</span>
              </div>
            </div>

            <a
              href="/api/auth/google"
              className="w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white border border-[#032026]/15 rounded-full text-[#032026] font-bold text-xs uppercase tracking-widest hover:bg-[#FCFBF9] transition-all shadow-xs cursor-pointer"
            >
              <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.354 0 3.373 2.736 1.5 6.71l3.766 3.055z" />
                <path fill="#34A853" d="M16.04 15.345c-1.077.732-2.432 1.164-4.04 1.164a6.837 6.837 0 0 1-6.734-4.855L1.5 14.71C3.373 18.682 7.354 21.418 12 21.418c3.118 0 5.964-1.09 8.055-2.973l-4.015-3.1z" />
                <path fill="#4285F4" d="M23.836 12.236c0-.8-.073-1.573-.209-2.318H12v4.51h6.636a5.673 5.673 0 0 1-2.463 3.718l4.014 3.1c2.345-2.164 3.65-5.345 3.65-9.01z" />
                <path fill="#FBBC05" d="M5.266 14.236a6.89 6.89 0 0 1-.355-2.236c0-.782.127-1.536.355-2.236L1.5 6.71A11.97 11.97 0 0 0 .5 12c0 1.9.445 3.7 1.236 5.29l3.53-3.054z" />
              </svg>
              Sign up with Google (Recommended)
            </a>

            <div className="text-center mt-6">
              <button
                onClick={() => {
                  setAuthMode(authMode === "login" ? "signup" : "login");
                  setAuthError("");
                  setAuthSuccess("");
                  setOtpSent(false);
                  setDevOtp("");
                }}
                className="text-2xs font-extrabold text-[#05D4B5] uppercase tracking-widest hover:underline cursor-pointer"
              >
                {authMode === "login" ? "Need an account? Sign up here" : "Already have an account? Sign in"}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: COMPLETE PROFILE */}
        {activeStep === 3 && (
          <div className="max-w-xl mx-auto bg-white border border-[#032026]/10 p-8 sm:p-10 rounded-[28px] shadow-[0_15px_40px_rgba(0,0,0,0.04)] space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-2xl font-bold font-serif uppercase tracking-tight text-[#032026]">
                Complete Customer Profile
              </h2>
              <p className="text-3xs text-[#032026]/40 uppercase tracking-widest font-black">
                Provide accurate delivery coordinates and billing identifiers
              </p>
            </div>

            {profileError && (
              <div className="p-3.5 bg-red-50 text-red-650 border border-red-155 text-xs font-semibold rounded-2xl">
                {profileError}
              </div>
            )}

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-3xs font-black text-[#032026]/50 uppercase tracking-widest mb-1.5">Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#032026]/40">
                      <UserIcon className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full pl-11 pr-4 py-3.5 bg-[#FCFBF9] border border-[#032026]/15 rounded-2xl text-[#032026] text-xs focus:outline-none focus:border-[#05D4B5] font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-3xs font-black text-[#032026]/50 uppercase tracking-widest mb-1.5">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#032026]/40">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      required
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full pl-11 pr-4 py-3.5 bg-[#FCFBF9] border border-[#032026]/15 rounded-2xl text-[#032026] text-xs focus:outline-none focus:border-[#05D4B5] font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-3xs font-black text-[#032026]/50 uppercase tracking-widest mb-1.5">Mobile Phone</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#032026]/40">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="tel"
                      required
                      maxLength="10"
                      pattern="[0-9]{10}"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="10-digit mobile number"
                      className="w-full pl-11 pr-4 py-3.5 bg-[#FCFBF9] border border-[#032026]/15 rounded-2xl text-[#032026] text-xs focus:outline-none focus:border-[#05D4B5] font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-3xs font-black text-[#032026]/50 uppercase tracking-widest mb-1.5">Service Region City</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#032026]/40">
                      <MapPin className="w-4 h-4" />
                    </span>
                    <select
                      value={profileCity}
                      onChange={(e) => setProfileCity(e.target.value)}
                      className="w-full pl-11 pr-4 py-3.5 bg-[#FCFBF9] border border-[#032026]/15 rounded-2xl text-[#032026] text-xs focus:outline-none focus:border-[#05D4B5] font-bold appearance-none cursor-pointer"
                    >
                      <option value="Delhi">Delhi NCR</option>
                      <option value="Gurugram">Gurugram</option>
                      <option value="Noida">Noida</option>
                      <option value="Faridabad">Faridabad</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#032026]/40 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-3xs font-black text-[#032026]/50 uppercase tracking-widest mb-1.5">Zip Pincode</label>
                <input
                  type="text"
                  required
                  maxLength="6"
                  pattern="[0-9]{6}"
                  value={profilePincode}
                  onChange={(e) => setProfilePincode(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 110001 (Must start with 11, 12, or 13)"
                  className="w-full px-4 py-3.5 bg-[#FCFBF9] border border-[#032026]/15 rounded-2xl text-[#032026] text-xs focus:outline-none focus:border-[#05D4B5] font-bold"
                />
              </div>

              <div>
                <label className="block text-3xs font-black text-[#032026]/50 uppercase tracking-widest mb-1.5">Linen Delivery Address Details</label>
                <textarea
                  required
                  value={profileAddress}
                  onChange={(e) => setProfileAddress(e.target.value)}
                  placeholder="House/Room No, Building Name, Street Address, Landmark..."
                  rows="3"
                  className="w-full px-4 py-3.5 bg-[#FCFBF9] border border-[#032026]/15 rounded-2xl text-[#032026] text-xs focus:outline-none focus:border-[#05D4B5] font-semibold resize-none"
                />
              </div>

              {/* B2B Commercial Fields */}
              {customerType === "B2B" && (
                <div className="pt-4 border-t border-[#032026]/10 space-y-4">
                  <h4 className="text-xs font-serif font-bold text-[#05D4B5] uppercase tracking-wider">B2B Commercial Properties Details</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-3xs font-black text-[#032026]/50 uppercase tracking-widest mb-1.5">Commercial Property/Hotel Name</label>
                      <input
                        type="text"
                        required={customerType === "B2B"}
                        value={b2bPropertyName}
                        onChange={(e) => setB2bPropertyName(e.target.value)}
                        placeholder="e.g. ClosetRush Inn"
                        className="w-full px-4 py-3.5 bg-[#FCFBF9] border border-[#032026]/15 rounded-2xl text-[#032026] text-xs focus:outline-none focus:border-[#05D4B5] font-bold"
                      />
                    </div>

                    <div>
                      <label className="block text-3xs font-black text-[#032026]/50 uppercase tracking-widest mb-1.5">Business GSTIN (Optional)</label>
                      <input
                        type="text"
                        value={b2bGSTNumber}
                        onChange={(e) => setB2bGSTNumber(e.target.value)}
                        placeholder="e.g. 07AAAAA1111A1Z1"
                        className="w-full px-4 py-3.5 bg-[#FCFBF9] border border-[#032026]/15 rounded-2xl text-[#032026] text-xs focus:outline-none focus:border-[#05D4B5] font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={profileSaving}
                className="w-full py-4 bg-[#05D4B5] hover:bg-[#032026] text-[#032026] hover:text-white font-extrabold text-xs uppercase tracking-widest rounded-full transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-[#05D4B5]/20"
              >
                {profileSaving ? <RefreshCw className="w-4 h-4 animate-spin text-[#032026]" /> : "Save Profile & Continue"}
              </button>
            </form>
          </div>
        )}

        {/* STEP 4: CHECKOUT / REVIEW RFQ */}
        {activeStep === 4 && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* Left Side: Order Config Preview */}
            <div className="lg:col-span-7 bg-white border border-[#032026]/10 p-6 sm:p-8 rounded-[28px] shadow-[0_15px_40px_rgba(0,0,0,0.03)] space-y-8">
              <div>
                <h2 className="text-2xl font-bold font-serif uppercase tracking-tight text-[#032026]">
                  {customerType === "B2C" ? "Confirm Subscription Setup" : "Review Request for Quotation"}
                </h2>
                <p className="text-3xs text-[#032026]/40 uppercase tracking-widest font-black mt-1">
                  Double check selected parameters before initiating transaction
                </p>
              </div>

              {checkoutError && (
                <div className="p-4 bg-red-50 text-red-650 border border-red-150 text-[10px] font-bold uppercase tracking-wider rounded-2xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  {checkoutError}
                </div>
              )}

              {customerType === "B2C" ? (
                /* B2C Preview */
                <div className="space-y-6">
                  <div className="bg-[#FCFBF9] border border-[#032026]/10 p-6 rounded-2xl space-y-4 shadow-inner">
                    <h3 className="text-xs font-serif font-bold text-[#032026] uppercase tracking-wider border-b border-[#032026]/10 pb-2">Subscription Summary</h3>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-[10px] text-[#032026]/40 font-bold uppercase tracking-wider block">Linen Package</span>
                        <strong className="text-[#032026] font-bold">{selectedBedType}</strong>
                      </div>

                      <div>
                        <span className="text-[10px] text-[#032026]/40 font-bold uppercase tracking-wider block">Duration Tenure</span>
                        <strong className="text-[#032026] font-bold">{selectedDuration}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#032026]/40 font-bold uppercase tracking-wider block">Sheets / Month</span>
                        <strong className="text-[#05D4B5] font-bold uppercase">{selectedSheets} Bed Sheet{selectedSheets > 1 ? 's' : ''}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Promo Coupons Form */}
                  <div className="bg-[#FCFBF9] border border-[#032026]/10 p-6 rounded-2xl space-y-4">
                    <h3 className="text-xs font-serif font-bold text-[#032026] uppercase tracking-wider border-b border-[#032026]/10 pb-2">Apply Promo Code</h3>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="ENTER COUPON CODE"
                        className="flex-grow px-4 py-3 bg-white border border-[#032026]/15 rounded-2xl text-xs text-[#032026] focus:outline-none focus:border-[#05D4B5] font-bold uppercase"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={validatingCoupon || !couponCode.trim()}
                        className="px-6 bg-[#032026] hover:bg-[#05D4B5] text-white hover:text-[#032026] text-xs font-bold uppercase tracking-widest transition-all rounded-2xl cursor-pointer disabled:opacity-50"
                      >
                        {validatingCoupon ? "Checking..." : "Apply"}
                      </button>
                    </div>
                    {couponError && <p className="text-3xs text-rose-600 font-extrabold uppercase mt-1">{couponError}</p>}
                    {couponSuccess && <p className="text-3xs text-emerald-600 font-extrabold uppercase mt-1">{couponSuccess}</p>}
                  </div>
                </div>
              ) : (
                /* B2B Preview */
                <div className="space-y-6">
                  <div className="bg-[#FCFBF9] border border-[#032026]/10 p-6 rounded-2xl space-y-6 shadow-inner">
                    <h3 className="text-xs font-serif font-bold text-[#032026] uppercase tracking-wider border-b border-[#032026]/10 pb-2">Properties & Swaps Requirements</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <span className="text-[10px] text-[#032026]/40 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-[#05D4B5]" /> Rooms
                        </span>
                        <input
                          type="number"
                          min="1"
                          value={b2bRoomsCount}
                          onChange={(e) => setB2bRoomsCount(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full px-4 py-3 bg-white border border-[#032026]/15 rounded-xl text-[#032026] font-bold text-xs focus:outline-none focus:border-[#05D4B5]"
                        />
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] text-[#032026]/40 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Bed className="w-3.5 h-3.5 text-[#05D4B5]" /> Beds
                        </span>
                        <input
                          type="number"
                          min="1"
                          value={b2bBedsCount}
                          onChange={(e) => setB2bBedsCount(Math.max(1, parseInt(e.target.value) || 1))}
                          className="w-full px-4 py-3 bg-white border border-[#032026]/15 rounded-xl text-[#032026] font-bold text-xs focus:outline-none focus:border-[#05D4B5]"
                        />
                      </div>
                      <div className="space-y-2">
                        <span className="text-[10px] text-[#032026]/40 font-bold uppercase tracking-wider flex items-center gap-1">
                          <Maximize className="w-3.5 h-3.5 text-[#05D4B5]" /> Bed Type
                        </span>
                        <div className="relative">
                          <select
                            value={b2bBedType}
                            onChange={(e) => setB2bBedType(e.target.value)}
                            className="w-full pl-4 pr-10 py-3 bg-white border border-[#032026]/15 rounded-xl text-[#032026] font-bold text-xs focus:outline-none focus:border-[#05D4B5] appearance-none cursor-pointer"
                          >
                            <option value="Single">Single</option>
                            <option value="Double">Double</option>
                            <option value="Queen">Queen</option>
                            <option value="King">King</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#032026]/40 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Bed Requirement Checklist */}
                    <div className="pt-2">
                      <span className="text-[10px] text-[#032026]/40 font-bold uppercase tracking-wider block mb-3 flex items-center gap-1.5">
                        <ListChecks className="w-3.5 h-3.5 text-[#05D4B5]" /> Configuration Needs
                      </span>
                      <div className="flex flex-wrap gap-2.5">
                        {["White Bedsheet", "Premium Cotton", "Pillow Covers", "Comforter"].map((req) => {
                          const isChecked = b2bBedsheetReqs.includes(req);
                          return (
                            <button
                              key={req}
                              type="button"
                              onClick={() => {
                                if (isChecked) {
                                  setB2bBedsheetReqs(b2bBedsheetReqs.filter(r => r !== req));
                                } else {
                                  setB2bBedsheetReqs([...b2bBedsheetReqs, req]);
                                }
                              }}
                              className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 transition-all duration-300 cursor-pointer rounded-full border ${
                                isChecked
                                  ? "bg-[#032026] text-[#05D4B5] border-[#032026] shadow-xs"
                                  : "bg-[#FCFBF9] text-[#032026]/50 border-[#032026]/15 hover:border-[#032026]/20"
                              }`}
                            >
                              {isChecked && <Check className="w-3 h-3 text-[#05D4B5]" />} {req}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Side: Invoice & Summary */}
            <div className="lg:col-span-5 space-y-6">
              {customerType === "B2C" ? (
                <div className="bg-[#032026] text-white p-8 rounded-[28px] shadow-2xl space-y-6 border border-[#05D4B5]/20">
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-[#05D4B5]">
                      Payment Invoice
                    </h4>
                    <span className="text-3xs text-white/50 uppercase tracking-widest font-bold">Billing summary</span>
                  </div>

                  <div className="space-y-4 text-3xs font-bold uppercase tracking-wider text-white/70">
                    <div className="flex justify-between">
                      <span>Base Rental Amount (Excl. GST):</span>
                      <span className="text-white">₹{b2cPricing.taxableBase}</span>
                    </div>

                    {b2cPricing.couponDiscount > 0 && (
                      <div className="flex justify-between text-[#05D4B5]">
                        <span>Coupon Discount ({appliedCoupon?.couponCode}):</span>
                        <span>-₹{b2cPricing.couponDiscount}</span>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <span>GST (18%):</span>
                      <span className="text-white">₹{b2cPricing.gst}</span>
                    </div>

                    {b2cPricing.deposit > 0 && (
                      <div className="flex justify-between">
                        <span>Security Deposit (Refundable):</span>
                        <span className="text-white">₹{b2cPricing.deposit}</span>
                      </div>
                    )}

                    <div className="border-t border-white/10 my-4 pt-4 flex justify-between items-baseline">
                      <span className="text-2xs font-black text-white uppercase tracking-widest">
                        Total Upfront Payable:
                      </span>
                      <div className="text-right">
                        <span className="text-3xl font-black text-[#05D4B5] font-serif">
                          ₹{b2cPricing.total}
                        </span>
                        <span className="text-white/40 text-3xs font-bold uppercase tracking-widest block mt-0.5">
                          / {getTenureDetails(selectedDuration).displayName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleB2CCheckout}
                    disabled={checkoutLoading}
                    className="w-full py-4.5 bg-[#05D4B5] hover:bg-white text-[#032026] font-extrabold text-xs uppercase tracking-widest rounded-full shadow-xl shadow-[#05D4B5]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {checkoutLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin text-[#032026]" />
                    ) : (
                      <Lock className="w-4 h-4 text-[#032026]" />
                    )}
                    {checkoutLoading ? "Processing transaction..." : "Confirm & Pay Now"}
                  </button>
                </div>
              ) : (
                /* B2B Pricing Invoice Mock */
                <div className="bg-[#032026] text-white p-8 rounded-[28px] shadow-2xl space-y-6 border border-[#05D4B5]/20">
                  <div className="flex justify-between items-center border-b border-white/10 pb-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-[#05D4B5] flex items-center gap-2">
                      <FileText className="w-4 h-4 text-[#05D4B5]" /> RFQ Estimate
                    </h4>
                    <span className="text-[8px] px-2.5 py-1 bg-white/5 border border-white/10 text-white/50 uppercase tracking-widest font-bold rounded-full">Rate Card</span>
                  </div>

                  <div className="space-y-4 text-3xs font-bold uppercase tracking-wider text-white/70">
                    <div className="flex justify-between items-center bg-white/5 p-3.5 rounded-2xl border border-white/5">
                      <span>Rate per bed/mo:</span>
                      <span className="text-white font-black font-serif">₹250</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-3.5 rounded-2xl border border-white/5">
                      <span>Properties Count:</span>
                      <span className="text-white font-black font-serif">1</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/5 p-3.5 rounded-2xl border border-white/5">
                      <span>Beds/Units Selected:</span>
                      <span className="text-white font-black font-serif">{b2bBedsCount}</span>
                    </div>

                    <div className="my-4 pt-6 flex flex-col items-center justify-center bg-white/5 border border-white/10 p-6 rounded-2xl">
                      <span className="text-[9px] font-black text-[#05D4B5] uppercase tracking-widest mb-2">
                        Estimated Monthly Price
                      </span>
                      <div className="flex items-end gap-1">
                        <span className="text-4xl font-black text-white font-serif">
                          ₹{b2bBedsCount * 250}
                        </span>
                        <span className="text-white/40 text-[9px] font-bold uppercase tracking-widest pb-1">
                          / month
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleB2BQuoteSubmit}
                    disabled={checkoutLoading}
                    className="w-full py-4.5 bg-[#05D4B5] hover:bg-white text-[#032026] font-black text-xs uppercase tracking-widest rounded-full shadow-xl shadow-[#05D4B5]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {checkoutLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin text-[#032026]" />
                    ) : (
                      <ClipboardList className="w-5 h-5 text-[#032026]" />
                    )}
                    {checkoutLoading ? "Submitting RFQ..." : "Submit RFQ Application"}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 5: CONFIRMATION OUTCOMES */}
        {activeStep === 5 && (
          <div className="max-w-2xl mx-auto py-10">
            {customerType === "B2C" ? (
              /* B2C ORDER CONFIRMATION */
              <div className="bg-white border border-[#032026]/10 p-10 text-center rounded-[28px] shadow-[0_15px_40px_rgba(0,0,0,0.04)] space-y-6">
                <div className="w-20 h-20 bg-[#05D4B5]/10 text-[#05D4B5] border border-[#05D4B5]/30 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-[#05D4B5]/10">
                  <Check className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <span className="text-[#05D4B5] text-3xs font-black uppercase tracking-widest">Transaction Successful</span>
                  <h2 className="text-3xl font-bold font-serif text-[#032026]">Order Confirmed!</h2>
                  <p className="text-xs text-[#032026]/50 font-bold uppercase tracking-wider">Order ID: <strong className="text-[#032026]">{orderId}</strong></p>
                </div>

                <div className="p-6 bg-[#FCFBF9] border border-[#032026]/10 rounded-2xl text-3xs leading-relaxed font-semibold text-left text-[#032026]/80 space-y-2.5 uppercase tracking-wider">
                  <p className="font-extrabold uppercase text-[#032026] text-xs tracking-widest border-b border-[#032026]/10 pb-2 flex items-center gap-2"><Mail className="w-4 h-4 text-[#05D4B5]" /> Dispatch Notifications</p>
                  <p>✔ <strong>Email confirmation sent to:</strong> {profileEmail}</p>
                  <p>✔ <strong>SMS dispatch scheduled for:</strong> {profilePhone}</p>
                  <p>✔ <strong>Invoice PDF prepared for download</strong></p>
                </div>

                <div className="pt-6 border-t border-[#032026]/10 flex flex-col sm:flex-row gap-4">
                  <a
                    href={`/api/user/quote/pdf?orderId=${orderId || ""}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    download
                    className="flex-1 py-4 px-6 bg-[#05D4B5] hover:bg-[#032026] text-[#032026] hover:text-white rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 text-center flex items-center justify-center gap-2 shadow-lg shadow-[#05D4B5]/20 cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download PDF Invoice
                  </a>
                  <Link
                    href="/dashboard"
                    className="flex-1 py-4 px-6 bg-[#032026] hover:bg-[#05D4B5] text-white hover:text-[#032026] rounded-full font-bold text-xs uppercase tracking-widest transition-all duration-300 text-center"
                  >
                    Go to User Dashboard
                  </Link>
                </div>
              </div>
            ) : (
              /* B2B RFQ STATUS TRACKER & SIMULATOR */
              <div className="bg-white border border-[#032026]/10 p-10 rounded-[28px] shadow-[0_15px_40px_rgba(0,0,0,0.04)] space-y-6">
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 bg-blue-50 text-blue-600 border border-blue-200 rounded-full flex items-center justify-center mx-auto shadow-md">
                    <ClipboardList className="w-10 h-10" />
                  </div>
                  <span className="text-blue-600 text-3xs font-black uppercase tracking-widest">RFQ Submitted</span>
                  <h2 className="text-3xl font-bold font-serif text-[#032026]">Quotation Request Filed</h2>
                  <p className="text-xs text-[#032026]/60 leading-relaxed font-medium max-w-md mx-auto">
                    Your Request for Quotation is stored in the database. Sales and Admin staff will audit details and compile a volume-based discount proposal shortly.
                  </p>
                </div>

                {/* RFQ Status Tracker Visualizer */}
                <div className="bg-[#FCFBF9] border border-[#032026]/10 p-6 rounded-2xl space-y-6">
                  <h4 className="text-3xs uppercase tracking-widest font-black text-[#032026]/40 block border-b border-[#032026]/10 pb-2">Active RFQ Tracker (Live status: {b2bQuoteStatus})</h4>

                  <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-center">
                    {[
                      { st: "PENDING", label: "1. Review" },
                      { st: "QUOTE SENT", label: "2. Quote Sent" },
                      { st: "ACCEPTED", label: "3. Accepted" },
                      { st: "CONFIRMED", label: "4. Confirmed" }
                    ].map((step, idx) => {
                      const isActive = b2bQuoteStatus === step.st;
                      const isDone = (idx === 0) ||
                        (idx === 1 && ["QUOTE SENT", "ACCEPTED", "CONFIRMED"].includes(b2bQuoteStatus)) ||
                        (idx === 2 && ["ACCEPTED", "CONFIRMED"].includes(b2bQuoteStatus)) ||
                        (idx === 3 && b2bQuoteStatus === "CONFIRMED");
                      return (
                        <div key={step.st} className="flex flex-col items-center">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${isDone
                              ? "bg-[#05D4B5] text-[#032026] border-[#05D4B5] shadow-md shadow-[#05D4B5]/20"
                              : "bg-white text-[#032026]/30 border-[#032026]/10"
                              }`}
                          >
                            {isDone ? "✔" : idx + 1}
                          </div>
                          <span className={`text-[9px] uppercase tracking-widest font-extrabold mt-1.5 ${isActive ? "text-[#05D4B5]" : (isDone ? "text-[#032026]" : "text-[#032026]/30")
                            }`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Pricing feedback if quote sent */}
                  {b2bQuotePrice > 0 && (
                    <div className="p-6 bg-[#032026] text-white rounded-2xl border border-[#05D4B5]/30 text-center space-y-2">
                      <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest">Prepared B2B Pricing Proposal</p>
                      <h3 className="text-3xl font-serif font-black text-[#05D4B5]">₹{b2bQuotePrice.toLocaleString()}</h3>
                      <p className="text-[9px] text-white/40 uppercase tracking-widest font-bold">Includes complete sateen sheets setup for {b2bBedsCount} units</p>
                    </div>
                  )}

                  {/* Real Workflow Actions */}
                  <div className="p-4 bg-[#05D4B5]/10 border border-[#05D4B5]/20 rounded-2xl space-y-3">
                    {b2bQuoteStatus === "PENDING" && (
                      <div className="text-center p-4 border border-dashed border-[#032026]/20 rounded-xl bg-white/50">
                        <p className="text-[10px] font-bold text-[#032026]/60 uppercase tracking-widest">
                          ⏳ Waiting for Admin to prepare your quotation...
                        </p>
                      </div>
                    )}

                    {b2bQuoteStatus === "QUOTE SENT" && (
                      <button
                        onClick={() => setShowESignModal(true)}
                        className="w-full py-4 bg-[#05D4B5] text-[#032026] hover:bg-[#032026] hover:text-white rounded-full font-extrabold text-xs uppercase tracking-widest transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
                      >
                        <FileText className="w-4 h-4" /> View & E-Sign Quotation Contract
                      </button>
                    )}

                    {b2bQuoteStatus === "ACCEPTED" && (
                      <button
                        onClick={handleB2BPayQuote}
                        className="w-full py-4 bg-emerald-500 text-white font-extrabold text-xs uppercase tracking-widest hover:bg-emerald-600 rounded-full transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 animate-pulse"
                      >
                        <Lock className="w-4 h-4" /> Proceed to Secure Payment
                      </button>
                    )}

                    {b2bQuoteStatus === "CONFIRMED" && (
                      <div className="text-center p-4 bg-emerald-50 text-emerald-700 text-xs font-bold flex flex-col items-center justify-center gap-2 border border-emerald-200 rounded-xl">
                        <Check className="w-6 h-6 bg-emerald-600 text-white p-1 rounded-full" />
                        <span className="uppercase tracking-widest text-[10px]">B2B Order Confirmed and Dispatched!</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 mt-6">
                  {(b2bQuoteStatus === "ACCEPTED" || b2bQuoteStatus === "CONFIRMED") && (
                    <a
                      href={`/api/user/quote/pdf?quoteId=${b2bQuoteId}`}
                      download
                      className="flex-1 py-4 px-6 bg-[#05D4B5] hover:bg-[#032026] text-[#032026] hover:text-white rounded-full font-bold text-xs uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <Download className="w-4 h-4" /> Download signed PDF Contract
                    </a>
                  )}
                  <Link
                    href="/dashboard"
                    className="flex-1 py-4 px-6 bg-[#032026] hover:bg-[#05D4B5] text-white hover:text-[#032026] rounded-full font-bold text-xs uppercase tracking-widest text-center transition-all"
                  >
                    Go to B2B Dashboard Hub
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* E-SIGN MODAL */}
      {showESignModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-[#FCFBF9] border border-[#032026]/10 shadow-2xl w-full max-w-lg rounded-[28px] overflow-hidden text-[#032026]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#032026]/15 bg-[#032026] text-white">
              <div className="flex items-center gap-2.5">
                <FileText className="h-5 w-5 text-[#05D4B5]" />
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-widest">E-Sign quotation proposal</h3>
                  <p className="text-[10px] text-white/50 font-semibold">Review terms and sign below</p>
                </div>
              </div>
              <button
                onClick={() => setShowESignModal(false)}
                className="p-1.5 hover:bg-white/10 transition-colors cursor-pointer rounded-full"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-[#FCFBF9] border border-[#032026]/10 p-5 rounded-2xl text-3xs font-semibold leading-relaxed space-y-2 uppercase tracking-wider">
                <p className="font-extrabold uppercase text-[10px] text-[#05D4B5] tracking-widest border-b border-[#032026]/10 pb-1.5">Corporate Contract Summary</p>
                <p><strong>Property Name:</strong> {b2bPropertyName}</p>
                <p><strong>Items:</strong> {b2bBedType} Bed Setup for {b2bBedsCount} Beds</p>
                <p><strong>Proposed Monthly Rate:</strong> Rs.{b2bQuotePrice.toLocaleString()}</p>
                <p className="text-[9px] text-[#032026]/50 italic leading-relaxed normal-case">By signing this contract, you authorize ClosetRush to deploy sanitized bedding swaps under commercial rental terms.</p>
              </div>

              <div className="space-y-4">
                {/* Switch Sign Type */}
                <div className="flex border-b border-[#032026]/10">
                  <button
                    type="button"
                    onClick={() => setSignatureType("draw")}
                    className={`flex-1 pb-2 text-[10px] font-black uppercase tracking-widest text-center border-b-2 cursor-pointer transition-all ${signatureType === "draw" ? "border-[#032026] text-[#032026]" : "border-transparent text-[#032026]/40"
                      }`}
                  >
                    Draw Signature
                  </button>
                  <button
                    type="button"
                    onClick={() => setSignatureType("type")}
                    className={`flex-1 pb-2 text-[10px] font-black uppercase tracking-widest text-center border-b-2 cursor-pointer transition-all ${signatureType === "type" ? "border-[#032026] text-[#032026]" : "border-transparent text-[#032026]/40"
                      }`}
                  >
                    Type Signature
                  </button>
                </div>

                {signatureType === "draw" ? (
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#032026]/40 uppercase tracking-widest">Draw Signature in Canvas</label>
                    <canvas
                      id="sig-canvas"
                      width="450"
                      height="120"
                      className="border border-dashed border-[#032026]/15 rounded-xl w-full h-[120px] bg-white cursor-crosshair touch-none"
                    />
                    <button
                      type="button"
                      onClick={handleClearSignature}
                      className="text-3xs text-rose-600 font-extrabold uppercase hover:underline cursor-pointer"
                    >
                      Clear Drawing
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-[#032026]/40 uppercase tracking-widest">Type Your Full Name</label>
                    <input
                      type="text"
                      value={signatureName}
                      onChange={(e) => setSignatureName(e.target.value)}
                      placeholder="e.g. Johnathan Doe"
                      className="w-full px-4 py-3.5 bg-[#FCFBF9] border border-[#032026]/15 rounded-xl text-[#032026] focus:outline-none focus:border-[#05D4B5] text-xs font-bold font-serif italic"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-bold text-[#032026]/40 uppercase tracking-widest mb-1.5">Authorized Signatory Name</label>
                  <input
                    type="text"
                    value={signatureName}
                    onChange={(e) => setSignatureName(e.target.value)}
                    placeholder="Enter full legal name"
                    className="w-full px-4 py-3.5 bg-white border border-[#032026]/15 rounded-xl text-[#032026] focus:outline-none focus:border-[#05D4B5] text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="px-6 pb-6 flex gap-4">
              <button
                type="button"
                onClick={() => setShowESignModal(false)}
                className="flex-1 py-3.5 px-4 bg-transparent border border-[#032026]/20 rounded-full text-[#032026] text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleB2BEsignSubmit}
                className="flex-1 py-3.5 px-4 bg-[#05D4B5] hover:bg-[#032026] text-[#032026] hover:text-white rounded-full text-xs font-extrabold uppercase tracking-widest transition-all cursor-pointer shadow-md"
              >
                Approve & Sign
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer layout */}
      <Footer showWaitlist={true} />
    </div>
  );
}
