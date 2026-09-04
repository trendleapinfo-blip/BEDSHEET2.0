"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  LayoutDashboard,
  BarChart3,
  Tag,
  Package,
  UserCheck,
  FileText,
  HelpCircle,
  RefreshCcw,
  LogOut,
  Home,
  Plus,
  Edit,
  Trash2,
  Search,
  Check,
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Inbox,
  Bell,
  ChevronRight,
  ShieldAlert,
  Copy,
  Ticket,
  QrCode,
  Download,
  Printer,
  Warehouse,
  Settings,
  BookOpen
} from "lucide-react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [sessionUser, setSessionUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seedingLoading, setSeedingLoading] = useState(false);

  // QR Code state
  const [qrOrder, setQrOrder] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscriptions: 0,
    totalRevenue: 0,
    monthlyGrowth: 0,
    connectionRequests: 0,
    quotationRequests: 0,
    totalQuotes: 0,
    supportTickets: 0
  });
  
  // Custom Analytics State
  const [analyticsData, setAnalyticsData] = useState({
    totalVisitors: 0,
    totalViews: 0,
    pwaInstalls: 0,
    pageBreakdown: [],
    referrers: []
  });

  // Push Notifications State
  const [pushForm, setPushForm] = useState({ title: "", message: "", url: "", image: "" });
  const [pushSending, setPushSending] = useState(false);

  // Data lists
  const [usersList, setUsersList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [ordersList, setOrdersList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [quotesList, setQuotesList] = useState([]);
  const [ticketsList, setTicketsList] = useState([]);
  const [plansList, setPlansList] = useState([]);
  const [couponsList, setCouponsList] = useState([]);
  const [showCouponModal, setShowCouponModal] = useState(false);
  
  // Waitlist data state
  const [waitlistList, setWaitlistList] = useState([]);
  const [waitlistSearch, setWaitlistSearch] = useState("");
  const [waitlistStatusFilter, setWaitlistStatusFilter] = useState("ALL");

  // Refunds data state
  const [refundsList, setRefundsList] = useState([]);
  const [refundsSearch, setRefundsSearch] = useState("");
  const [refundsStatusFilter, setRefundsStatusFilter] = useState("ALL");
  const [editingRefundId, setEditingRefundId] = useState(null);
  const [refundTxId, setRefundTxId] = useState("");

  const [couponSearch, setCouponSearch] = useState("");
  const [couponForm, setCouponForm] = useState({
    id: "",
    code: "",
    discountType: "percentage",
    discountValue: "",
    minPurchase: 0,
    maxDiscount: "",
    startDate: "",
    endDate: "",
    isActive: true,
    usageLimit: ""
  });


  // Filter States
  const [userSearch, setUserSearch] = useState("");
  const [userTypeFilter, setUserTypeFilter] = useState("ALL");
  const [categorySearch, setCategorySearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState("ALL");
  const [staffTypeFilter, setStaffTypeFilter] = useState("WH"); // WH or LP
  const [staffStatusFilter, setStaffStatusFilter] = useState("ALL");
  const [quoteTypeTab, setQuoteTypeTab] = useState("connection"); // connection or quotation
  const [ticketStatusFilter, setTicketStatusFilter] = useState("ALL");
  const [ticketPriorityFilter, setTicketPriorityFilter] = useState("ALL");

  // Modals / Forms States
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ id: "", name: "", description: "", pricePerItem: "", status: "ACTIVE", totalStock: 100, availableStock: 100, rentedStock: 0, laundryStock: 0 });

  const [showStaffModal, setShowStaffModal] = useState(false);
  const [staffForm, setStaffForm] = useState({ name: "", email: "", mobile: "", role: "WH", status: "PENDING" });
  const [transferForm, setTransferForm] = useState({ categoryId: "", fromState: "laundryStock", toState: "availableStock", qty: 5 });

  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketForm, setTicketForm] = useState({ subject: "", userName: "", userEmail: "", priority: "MEDIUM", status: "OPEN" });

  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planForm, setPlanForm] = useState({ id: "", tier: "Normal", bedType: "single", monthlyRate: 0, depositAmount: 0 });

  const [productColorsList, setProductColorsList] = useState([]);
  const [colorBedType, setColorBedType] = useState("");
  const [colorName, setColorName] = useState("");
  const [colorHex, setColorHex] = useState("#FFFFFF");
  const [colorImages, setColorImages] = useState("");

  // WMS States
  const [bundlesList, setBundlesList] = useState([]);
  const [scanInput, setScanInput] = useState("");
  const [activeBundleIdForSkus, setActiveBundleIdForSkus] = useState("");
  const [editingSkus, setEditingSkus] = useState([]);
  const [scannerAction, setScannerAction] = useState("scan_dispatch");
  const [laundryStatusFilter, setLaundryStatusFilter] = useState("ALL");
  const [settings, setSettings] = useState(null);
  const [settingsForm, setSettingsForm] = useState({
    brandName: "",
    heroImage: "/banner_1.png",
    installBannerText: "",
    installBannerActive: true,
    primaryColor: "",
    accentColor: "",
    contactEmail: "",
    singleBedDeposit: 500,
    doubleBedDeposit: 800,
    paymentStyles: []
  });

  const [editingStyleId, setEditingStyleId] = useState(null);
  const [editStyleForm, setEditStyleForm] = useState({ id: "", name: "", description: "", depositMultiplier: 1, commissionRate: 0 });

  // Custom Selection Modals States
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Email replies state
  const [replySubject, setReplySubject] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [replySending, setReplySending] = useState(false);
  const [ticketReplies, setTicketReplies] = useState({});

  // Quote replies state
  const [quoteReplySubject, setQuoteReplySubject] = useState("");
  const [quoteReplyMessage, setQuoteReplyMessage] = useState("");
  const [quoteReplySending, setQuoteReplySending] = useState(false);
  const [quotePrice, setQuotePrice] = useState(0);

  // User edit form state
  const [showUserModal, setShowUserModal] = useState(false);
  const [userStatusFilter, setUserStatusFilter] = useState("ALL");
  const [userPlanFilter, setUserPlanFilter] = useState("ALL");
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    mobile: "",
    address: "",
    password: "",
    accountType: "Individual User",
    status: "ACTIVE",
    role: "user",
    selectedPlan: {
      bedType: "",
      planName: "",
      price: "",
      duration: "",
      startDate: ""
    }
  });


  // Order edit form state
  const [orderForm, orderFormSet] = useState({
    userName: "",
    email: "",
    phone: "",
    bundleName: "",
    finalPrice: 0,
    status: "ACTIVE",
    deliveryAddress: "",
    startDate: "",
    endDate: ""
  });

  // Load ticket replies from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("closet_rush_ticket_replies");
      if (stored) {
        setTicketReplies(JSON.parse(stored));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Load QRCode.js from CDN once on mount
  useEffect(() => {
    if (typeof window !== "undefined" && !window.QRCode) {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // Generate QR code data URL for an order using canvas
  const generateQR = async (order, customText = null) => {
    setQrOrder(order);
    setQrDataUrl("");
    setQrLoading(true);

    const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

    const text = customText || [
      `ORDER ID: ${order.bundleOrderId}`,
      `BUNDLE: ${order.bundleName}`,
      `STATUS: ${order.status}`,
      `CUSTOMER: ${order.userName || "—"}`,
      `PHONE: ${order.phone || "—"}`
    ].join("\n");

    try {
      if (typeof window !== "undefined" && window.QRCode) {
        // Use client-side QRCode.js
        const container = document.createElement("div");
        new window.QRCode(container, {
          text: text,
          width: 280,
          height: 280,
          colorDark: "#0d1117",
          colorLight: "#ffffff",
          correctLevel: window.QRCode.CorrectLevel.M
        });
        
        // Give it a tiny tick to render the canvas
        setTimeout(() => {
          const canvas = container.querySelector("canvas");
          if (canvas) {
            setQrDataUrl(canvas.toDataURL("image/png"));
          } else {
            // Fallback if canvas is not created
            const encoded = encodeURIComponent(text);
            setQrDataUrl(`https://quickchart.io/qr?size=280&text=${encoded}&dark=0d1117&margin=1`);
          }
          setQrLoading(false);
        }, 50);
      } else {
        // Fallback to reliable public API
        const encoded = encodeURIComponent(text);
        setQrDataUrl(`https://quickchart.io/qr?size=280&text=${encoded}&dark=0d1117&margin=1`);
        setQrLoading(false);
      }
    } catch (e) {
      console.error("QR generation failed:", e);
      setQrLoading(false);
    }
  };

  const handlePrintQR = () => {
    const printWindow = window.open("", "_blank", "width=500,height=700");
    const order = qrOrder;
    const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
    printWindow.document.write(`
      <html><head><title>Bundle QR — ${order.bundleOrderId}</title>
      <style>
        body { font-family: 'Courier New', monospace; padding: 32px; background: #fff; color: #0d1117; }
        .header { font-size: 18px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
        .sub { font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 20px; }
        .qr { text-align: center; margin: 16px 0; }
        .qr img { width: 220px; height: 220px; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 16px; }
        td { padding: 5px 8px; border-bottom: 1px solid #eee; }
        td:first-child { font-weight: 700; color: #555; width: 110px; text-transform: uppercase; font-size: 9px; letter-spacing: 1px; }
        td:last-child { font-weight: 600; color: #0d1117; }
        .footer { margin-top: 20px; font-size: 9px; color: #aaa; text-align: center; text-transform: uppercase; letter-spacing: 2px; }
        .status-ACTIVE { color: #16a34a; font-weight: 900; }
        .status-CANCELLED { color: #dc2626; font-weight: 900; }
        .status-PENDING { color: #d97706; font-weight: 900; }
        .status-DELIVERED { color: #0891b2; font-weight: 900; }
      </style></head><body>
      <div class="header">ClosetRush</div>
      <div class="sub">Bundle Tracking QR — Scan to verify</div>
      <div class="qr"><img src="${qrDataUrl}" /></div>
      <table>
        <tr><td>Order ID</td><td>${order.bundleOrderId}</td></tr>
        <tr><td>Customer</td><td>${order.userName || "—"}</td></tr>
        <tr><td>Phone</td><td>${order.phone || "—"}</td></tr>
        <tr><td>Email</td><td>${order.email || "—"}</td></tr>
        <tr><td>Bundle</td><td>${order.bundleName}</td></tr>
        <tr><td>Status</td><td><span class="status-${order.status}">${order.status}</span></td></tr>
        <tr><td>Price</td><td>Rs.${order.finalPrice}</td></tr>
        <tr><td>Start</td><td>${fmt(order.startDate)}</td></tr>
        <tr><td>End</td><td>${fmt(order.endDate)}</td></tr>
        <tr><td>Address</td><td>${order.deliveryAddress || "—"}</td></tr>
      </table>
      <div class="footer">ClosetRush | Clean Sheets, Delivered.</div>
      </body></html>
    `);
    printWindow.document.close();
    setTimeout(() => printWindow.print(), 500);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl || !qrOrder) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `QR_${qrOrder.bundleOrderId}.png`;
    a.click();
  };

  // Load user session
  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.user.role === "admin") {
          setSessionUser(data.user);
        } else {
          setSessionUser(null);
        }
      }
    } catch (err) {
      console.error("Session check error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Dashboard Stats & DB Data
  const fetchData = async () => {
    try {
      const statsRes = await fetch("/api/admin/stats");
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }

      const usersRes = await fetch("/api/admin/users");
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsersList(usersData.users || []);
      }

      const catRes = await fetch("/api/admin/categories");
      if (catRes.ok) {
        const catData = await catRes.json();
        setCategoriesList(catData.categories || []);
      }

      const ordersRes = await fetch("/api/admin/orders");
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        setOrdersList(ordersData.orders || []);
      }

      const staffRes = await fetch("/api/admin/staff");
      if (staffRes.ok) {
        const staffData = await staffRes.json();
        setStaffList(staffData.staff || []);
      }

      const quotesRes = await fetch("/api/admin/quotes");
      if (quotesRes.ok) {
        const quotesData = await quotesRes.json();
        setQuotesList(quotesData.quotes || []);
      }

      const ticketsRes = await fetch("/api/admin/tickets");
      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json();
        setTicketsList(ticketsData.tickets || []);
      }

      const plansRes = await fetch("/api/admin/plans");
      if (plansRes.ok) {
        const plansData = await plansRes.json();
        setPlansList(plansData.plans || []);
      }

      const couponsRes = await fetch("/api/admin/coupons");
      if (couponsRes.ok) {
        const couponsData = await couponsRes.json();
        setCouponsList(couponsData.coupons || []);
      }

      const waitlistRes = await fetch("/api/admin/waitlist");
      if (waitlistRes.ok) {
        const waitlistData = await waitlistRes.json();
        setWaitlistList(waitlistData.waitlist || []);
      }

      const refundsRes = await fetch("/api/admin/refunds");
      if (refundsRes.ok) {
        const refundsData = await refundsRes.json();
        setRefundsList(refundsData.refunds || []);
      }

      const colorsRes = await fetch("/api/colors");
      if (colorsRes.ok) {
        const colorsData = await colorsRes.json();
        if (colorsData.colors) {
          setProductColorsList(colorsData.colors);
        }
      }

      const bundlesRes = await fetch("/api/admin/bundles");
      if (bundlesRes.ok) {
        const bundlesData = await bundlesRes.json();
        setBundlesList(bundlesData.bundles || []);
      }

      const settingsRes = await fetch("/api/admin/settings");
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        if (settingsData.settings) {
          setSettings(settingsData.settings);
          setSettingsForm({
            brandName: settingsData.settings.brandName || "ClosetRush",
            heroImage: settingsData.settings.heroImage || "/banner_1.png",
            installBannerText: settingsData.settings.installBannerText || "",
            installBannerActive: settingsData.settings.installBannerActive ?? true,
            primaryColor: settingsData.settings.primaryColor || "#0F172A",
            accentColor: settingsData.settings.accentColor || "#245c77",
            contactEmail: settingsData.settings.contactEmail || "support@closetrush.com",
            singleBedDeposit: settingsData.settings.singleBedDeposit ?? 500,
            doubleBedDeposit: settingsData.settings.doubleBedDeposit ?? 800,
            paymentStyles: settingsData.settings.paymentStyles || []
          });
        }
      }

      const analyticsRes = await fetch("/api/admin/analytics");
      if (analyticsRes.ok) {
        const analyticsJson = await analyticsRes.json();
        if (analyticsJson.success) {
          setAnalyticsData(analyticsJson.data);
        }
      }

    } catch (err) {
      console.error("Error fetching admin data:", err);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  useEffect(() => {
    if (sessionUser) {
      fetchData();
    }
  }, [sessionUser]);

  useEffect(() => {
    if (categoriesList.length > 0 && !transferForm.categoryId) {
      setTransferForm(prev => ({ ...prev, categoryId: categoriesList[0]._id }));
    }
  }, [categoriesList]);

  const handleStockTransfer = async (e) => {
    e.preventDefault();
    const cat = categoriesList.find(c => c._id === transferForm.categoryId);
    if (!cat) return;

    const qty = Number(transferForm.qty);
    if (qty <= 0) {
      alert("Quantity must be greater than 0");
      return;
    }

    const currentFromVal = cat[transferForm.fromState] || 0;
    if (currentFromVal < qty) {
      alert(`Insufficient stock in ${transferForm.fromState}. Only ${currentFromVal} available.`);
      return;
    }

    const updatedFrom = currentFromVal - qty;
    const updatedTo = (cat[transferForm.toState] || 0) + qty;

    try {
      const res = await fetch("/api/admin/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          categoryId: cat._id,
          [transferForm.fromState]: updatedFrom,
          [transferForm.toState]: updatedTo
        })
      });

      if (res.ok) {
        alert("Stock successfully transferred!");
        fetchData();
      } else {
        const data = await res.json();
        alert("Transfer failed: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Transfer failed: " + err.message);
    }
  };

  // Seeder Trigger
  const triggerSeeder = async () => {
    setSeedingLoading(true);
    try {
      const res = await fetch("/api/admin/seed", {
        method: "POST",
        headers: {
          "x-seed-secret": "closerush_seed_bootstrap_2026"
        }
      });
      if (res.ok) {
        alert("Database successfully seeded with ClosetRush mock data!");
        await fetchSession();
        await fetchData();
      } else {
        const err = await res.json();
        alert("Seeding failed: " + err.error);
      }
    } catch (err) {
      alert("Seeding failed: " + err.message);
    } finally {
      setSeedingLoading(false);
    }
  };

  // User Actions
  const toggleUserStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    if (nextStatus === "INACTIVE") {
      if (!confirm("Are you sure you want to DEACTIVATE this customer account? Deactivating will block portal login access for this user.")) return;
    }
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: nextStatus })
      });
      if (res.ok) {
        setUsersList(usersList.map(u => u._id === userId ? { ...u, status: nextStatus } : u));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, { method: "DELETE" });
      if (res.ok) {
        setUsersList(usersList.filter(u => u._id !== userId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    const isEdit = !!selectedUser;
    const method = isEdit ? "PUT" : "POST";
    
    const body = {
      name: userForm.name,
      email: userForm.email,
      mobile: userForm.mobile || undefined,
      address: userForm.address || "",
      accountType: userForm.accountType,
      status: userForm.status,
      role: userForm.role,
      selectedPlan: {
        bedType: userForm.selectedPlan?.bedType || "",
        planName: userForm.selectedPlan?.planName || "",
        price: userForm.selectedPlan?.price !== "" && userForm.selectedPlan?.price !== undefined ? Number(userForm.selectedPlan.price) : 0,
        duration: userForm.selectedPlan?.duration || "",
        startDate: userForm.selectedPlan?.startDate ? new Date(userForm.selectedPlan.startDate) : new Date()
      }
    };

    if (isEdit) {
      body.userId = selectedUser._id;
    }
    if (userForm.password) {
      body.password = userForm.password;
    }

    try {
      const res = await fetch("/api/admin/users", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      
      if (res.ok) {
        const data = await res.json();
        if (isEdit) {
          setUsersList(usersList.map(u => u._id === selectedUser._id ? data.user : u));
          alert("Customer details updated successfully!");
        } else {
          setUsersList([data.user, ...usersList]);
          alert("Customer account created successfully!");
        }
        setShowUserModal(false);
        setSelectedUser(null);
      } else {
        const err = await res.json();
        alert("Operation failed: " + err.error);
      }
    } catch (err) {
      console.error(err);
      alert("Operation failed: " + err.message);
    }
  };

  // Waitlist Actions
  const updateWaitlistStatus = async (id, nextStatus) => {
    try {
      const res = await fetch("/api/admin/waitlist", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus })
      });
      if (res.ok) {
        setWaitlistList(waitlistList.map(w => w._id === id ? { ...w, status: nextStatus } : w));
      } else {
        const data = await res.json();
        alert("Failed to update status: " + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteWaitlistEntry = async (id) => {
    if (!confirm("Are you sure you want to remove this waitlist entry?")) return;
    try {
      const res = await fetch(`/api/admin/waitlist?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setWaitlistList(waitlistList.filter(w => w._id !== id));
      } else {
        const data = await res.json();
        alert("Failed to delete entry: " + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Refunds Actions
  const updateRefundStatus = async (id, nextStatus, transactionId = "") => {
    try {
      const res = await fetch("/api/admin/refunds", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: nextStatus, transactionId })
      });
      if (res.ok) {
        const data = await res.json();
        setRefundsList(refundsList.map(r => r._id === id ? data.refund : r));
        setEditingRefundId(null);
        setRefundTxId("");
        alert("Refund status updated successfully!");
      } else {
        const data = await res.json();
        alert("Failed to update status: " + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteRefundEntry = async (id) => {
    if (!confirm("Are you sure you want to delete this refund claim record?")) return;
    try {
      const res = await fetch(`/api/admin/refunds?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setRefundsList(refundsList.filter(r => r._id !== id));
        alert("Refund claim record deleted.");
      } else {
        const data = await res.json();
        alert("Failed to delete refund claim: " + data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Category Actions
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const isEdit = !!categoryForm.id;
    const method = isEdit ? "PUT" : "POST";
    const body = isEdit
      ? {
          categoryId: categoryForm.id,
          name: categoryForm.name,
          description: categoryForm.description,
          pricePerItem: Number(categoryForm.pricePerItem),
          status: categoryForm.status,
          totalStock: Number(categoryForm.totalStock),
          availableStock: Number(categoryForm.availableStock),
          rentedStock: Number(categoryForm.rentedStock),
          laundryStock: Number(categoryForm.laundryStock)
        }
      : {
          name: categoryForm.name,
          description: categoryForm.description,
          pricePerItem: Number(categoryForm.pricePerItem),
          status: categoryForm.status,
          totalStock: Number(categoryForm.totalStock),
          availableStock: Number(categoryForm.availableStock),
          rentedStock: Number(categoryForm.rentedStock),
          laundryStock: Number(categoryForm.laundryStock)
        };

    try {
      const res = await fetch("/api/admin/categories", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setShowCategoryModal(false);
        setCategoryForm({ id: "", name: "", description: "", pricePerItem: "", status: "ACTIVE", totalStock: 100, availableStock: 100, rentedStock: 0, laundryStock: 0 });
        fetchData();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save category");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditCategory = (cat) => {
    setCategoryForm({
      id: cat._id,
      name: cat.name,
      description: cat.description || "",
      pricePerItem: cat.pricePerItem,
      status: cat.status,
      totalStock: cat.totalStock !== undefined ? cat.totalStock : 100,
      availableStock: cat.availableStock !== undefined ? cat.availableStock : 100,
      rentedStock: cat.rentedStock !== undefined ? cat.rentedStock : 0,
      laundryStock: cat.laundryStock !== undefined ? cat.laundryStock : 0
    });
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      const res = await fetch(`/api/admin/categories?categoryId=${categoryId}`, { method: "DELETE" });
      if (res.ok) {
        setCategoriesList(categoriesList.filter(c => c._id !== categoryId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Plan Actions
  const handleSavePlan = async (e) => {
    e.preventDefault();
    const isEdit = !!planForm.id;
    const method = isEdit ? "PUT" : "POST";
    const body = {
      tier: planForm.tier,
      bedType: planForm.bedType,
      monthlyRate: Number(planForm.monthlyRate),
      depositAmount: Number(planForm.depositAmount)
    };

    if (isEdit) {
      body.planId = planForm.id;
    }

    try {
      const res = await fetch("/api/admin/plans", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setShowPlanModal(false);
        setPlanForm({ id: "", tier: "Normal", bedType: "single", monthlyRate: 0, depositAmount: 0 });
        fetchData();
        alert(isEdit ? "Plan updated successfully!" : "Plan created successfully!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save plan");
      }
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  const handleEditPlan = (plan) => {
    setPlanForm({
      id: plan._id,
      tier: plan.tier || "Normal",
      bedType: plan.bedType || "single",
      monthlyRate: plan.monthlyRate || 0,
      depositAmount: plan.depositAmount || 0
    });
    setShowPlanModal(true);
  };

  const handleDeletePlan = async (planId) => {
    if (!confirm("Are you sure you want to delete this plan?")) return;
    try {
      const res = await fetch(`/api/admin/plans?planId=${planId}`, { method: "DELETE" });
      if (res.ok) {
        setPlansList(plansList.filter(p => p._id !== planId));
        alert("Plan deleted successfully!");
      } else {
        const data = await res.json();
        alert(data.error || "Failed to delete plan");
      }
    } catch (err) {
      console.error(err);
      alert("Error: " + err.message);
    }
  };

  // Order Actions
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus })
      });
      if (res.ok) {
        setOrdersList(ordersList.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveOrder = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: selectedOrder._id,
          userName: orderForm.userName,
          email: orderForm.email,
          phone: orderForm.phone,
          bundleName: orderForm.bundleName,
          finalPrice: Number(orderForm.finalPrice),
          status: orderForm.status,
          deliveryAddress: orderForm.deliveryAddress,
          startDate: orderForm.startDate,
          endDate: orderForm.endDate
        })
      });
      if (res.ok) {
        const data = await res.json();
        setOrdersList(ordersList.map(o => o._id === selectedOrder._id ? data.order : o));
        setSelectedOrder(null);
        fetchData();
        alert("Order details updated successfully!");
      } else {
        const err = await res.json();
        alert("Update failed: " + err.error);
      }
    } catch (err) {
      console.error(err);
      alert("Update failed: " + err.message);
    }
  };

  const deleteOrder = async (orderId) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      const res = await fetch(`/api/admin/orders?orderId=${orderId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        setOrdersList(ordersList.filter(o => o._id !== orderId));
        alert("Order deleted successfully!");
        fetchData();
      } else {
        const err = await res.json();
        alert("Delete failed: " + err.error);
      }
    } catch (err) {
      console.error(err);
      alert("Delete failed: " + err.message);
    }
  };

  // Staff Approvals Actions
  const updateStaffStatus = async (staffId, status) => {
    try {
      const res = await fetch("/api/admin/staff", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ staffId, status })
      });
      if (res.ok) {
        setStaffList(staffList.map(s => s._id === staffId ? { ...s, status } : s));
        fetchData(); // reload users/staff to reflect user creation if approved
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(staffForm)
      });
      if (res.ok) {
        setShowStaffModal(false);
        setStaffForm({ name: "", email: "", mobile: "", role: "WH", status: "PENDING" });
        fetchData();
        alert("Staff registration added successfully!");
      } else {
        const err = await res.json();
        alert("Addition failed: " + err.error);
      }
    } catch (err) {
      console.error(err);
      alert("Addition failed: " + err.message);
    }
  };

  // Quotes Actions
  const updateQuoteStatus = async (quoteId, status, priceQuote) => {
    try {
      const body = { quoteId, status };
      if (priceQuote !== undefined) {
        body.priceQuote = Number(priceQuote);
      }
      const res = await fetch("/api/admin/quotes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setQuotesList(quotesList.map(q => q._id === quoteId ? { ...q, status, priceQuote: priceQuote !== undefined ? Number(priceQuote) : q.priceQuote } : q));
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Ticket Actions
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    const randomId = "TKT" + Math.floor(100 + Math.random() * 900);
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketId: randomId,
          subject: ticketForm.subject,
          userName: ticketForm.userName,
          userEmail: ticketForm.userEmail,
          priority: ticketForm.priority,
          status: ticketForm.status
        })
      });
      if (res.ok) {
        setShowTicketModal(false);
        setTicketForm({ subject: "", userName: "", userEmail: "", priority: "MEDIUM", status: "OPEN" });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateTicketStatus = async (ticketId, status) => {
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, status })
      });
      if (res.ok) {
        setTicketsList(ticketsList.map(t => t._id === ticketId ? { ...t, status } : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateTicketPriority = async (ticketId, priority) => {
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketId, priority })
      });
      if (res.ok) {
        setTicketsList(ticketsList.map(t => t._id === ticketId ? { ...t, priority } : t));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    const method = couponForm.id ? "PUT" : "POST";
    const payload = {
      couponId: couponForm.id,
      code: couponForm.code,
      discountType: couponForm.discountType,
      discountValue: Number(couponForm.discountValue),
      minPurchase: Number(couponForm.minPurchase || 0),
      maxDiscount: couponForm.maxDiscount ? Number(couponForm.maxDiscount) : null,
      startDate: couponForm.startDate || null,
      endDate: couponForm.endDate || null,
      isActive: couponForm.isActive,
      usageLimit: couponForm.usageLimit ? Number(couponForm.usageLimit) : null
    };

    try {
      const res = await fetch("/api/admin/coupons", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert(couponForm.id ? "Coupon updated successfully!" : "Coupon created successfully!");
        setShowCouponModal(false);
        setCouponForm({ id: "", code: "", discountType: "percentage", discountValue: "", minPurchase: 0, maxDiscount: "", startDate: "", endDate: "", isActive: true, usageLimit: "" });
        fetchData();
      } else {
        const err = await res.json();
        alert("Operation failed: " + (err.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Operation failed: " + err.message);
    }
  };

  const handleEditCoupon = (coupon) => {
    setCouponForm({
      id: coupon._id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minPurchase: coupon.minPurchase || 0,
      maxDiscount: coupon.maxDiscount || "",
      startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : "",
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split('T')[0] : "",
      isActive: coupon.isActive,
      usageLimit: coupon.usageLimit || ""
    });
    setShowCouponModal(true);
  };

  const handleDeleteCoupon = async (couponId) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    try {
      const res = await fetch(`/api/admin/coupons?couponId=${couponId}`, {
        method: "DELETE"
      });

      if (res.ok) {
        alert("Coupon deleted successfully!");
        fetchData();
      } else {
        const err = await res.json();
        alert("Delete failed: " + (err.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Delete failed: " + err.message);
    }
  };

  const handleAddColor = async (e) => {
    e.preventDefault();
    const bedType = colorBedType || (categoriesList[0]?.name || "Bedsheet + Pillow (Single)");
    if (!bedType || !colorName.trim() || !colorHex.trim()) {
      alert("Please fill all color configurations details.");
      return;
    }
    
    const imageList = colorImages.split(",")
      .map(img => img.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bedType,
          colorName: colorName.trim(),
          hexCode: colorHex.trim(),
          images: imageList
        })
      });
      if (res.ok) {
        alert("Color option added successfully!");
        setColorName("");
        setColorHex("#FFFFFF");
        setColorImages("");
        fetchData();
      } else {
        const err = await res.json();
        alert("Failed to add color: " + (err.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to add color: " + err.message);
    }
  };

  const handleDeleteColor = async (colorId) => {
    if (!confirm("Are you sure you want to delete this color option configuration?")) return;
    try {
      const res = await fetch(`/api/colors?id=${colorId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        alert("Color option deleted successfully!");
        fetchData();
      } else {
        const err = await res.json();
        alert("Failed to delete color: " + (err.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete color: " + err.message);
    }
  };

  const handleCreateBundle = async (orderId) => {
    try {
      const res = await fetch("/api/admin/bundles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId })
      });
      if (res.ok) {
        alert("WMS Bundle created successfully!");
        fetchData();
      } else {
        const err = await res.json();
        alert("Failed to create bundle: " + (err.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to create bundle: " + err.message);
    }
  };

  const handleUpdateSkus = async (bundleId, items) => {
    try {
      const res = await fetch("/api/admin/bundles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_skus", bundleId, items })
      });
      if (res.ok) {
        alert("SKUs updated and bundle packed successfully!");
        setActiveBundleIdForSkus("");
        setEditingSkus([]);
        fetchData();
      } else {
        const err = await res.json();
        alert("Failed to update SKUs: " + (err.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update SKUs: " + err.message);
    }
  };

  const handleScanSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!scanInput.trim()) return;

    try {
      const res = await fetch("/api/admin/bundles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: scannerAction, bundleId: scanInput.trim() })
      });
      if (res.ok) {
        const statusText = scannerAction === "scan_dispatch" ? "Dispatched out of Warehouse" : "Collected and Sent to Laundry";
        alert(`Scan Successful: ${scanInput} has been ${statusText}`);
        setScanInput("");
        fetchData();
      } else {
        const err = await res.json();
        alert("Scan Failed: " + (err.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Scan Failed: " + err.message);
    }
  };

  const handleLaundryAdvance = async (bundleId, nextStage) => {
    try {
      const res = await fetch("/api/admin/bundles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_laundry", bundleId, laundryStatus: nextStage })
      });
      if (res.ok) {
        fetchData();
      } else {
        const err = await res.json();
        alert("Failed to update laundry status: " + (err.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to update laundry status: " + err.message);
    }
  };

  const handleDeleteBundle = async (bundleId) => {
    if (!confirm("Are you sure you want to cancel/delete this bundle and return assigned items to stock?")) return;
    try {
      const res = await fetch(`/api/admin/bundles?bundleId=${bundleId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        alert("Bundle cancelled and inventory released.");
        fetchData();
      } else {
        const err = await res.json();
        alert("Failed to delete bundle: " + (err.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete bundle: " + err.message);
    }
  };

  const handleAddPaymentStyle = () => {
    const tempId = `Style_${Date.now()}`;
    const newStyle = { id: tempId, name: "New Payment Style", description: "Requires refundable security deposit of ₹{deposit}", depositMultiplier: 1, commissionRate: 0 };
    setSettingsForm(prev => ({
      ...prev,
      paymentStyles: [...(prev.paymentStyles || []), newStyle]
    }));
    setEditingStyleId(tempId);
    setEditStyleForm(newStyle);
  };

  const handleStartEditStyle = (style) => {
    setEditingStyleId(style.id);
    setEditStyleForm({ ...style });
  };

  const handleSaveStyleEdit = (id) => {
    if (!editStyleForm.name.trim() || !editStyleForm.description.trim()) {
      alert("Name and Description are required.");
      return;
    }
    // Update settingsForm
    setSettingsForm(prev => ({
      ...prev,
      paymentStyles: (prev.paymentStyles || []).map(s => s.id === id ? { ...editStyleForm, id: editStyleForm.id.trim() } : s)
    }));
    setEditingStyleId(null);
  };

  const handleCancelStyleEdit = (id) => {
    // If it's a newly added style that was not saved, remove it
    if (id.startsWith("Style_")) {
      setSettingsForm(prev => ({
        ...prev,
        paymentStyles: (prev.paymentStyles || []).filter(s => s.id !== id)
      }));
    }
    setEditingStyleId(null);
  };

  const handleDeletePaymentStyle = (id) => {
    if (window.confirm("Are you sure you want to delete this payment style?")) {
      setSettingsForm(prev => ({
        ...prev,
        paymentStyles: (prev.paymentStyles || []).filter(s => s.id !== id)
      }));
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settingsForm)
      });
      if (res.ok) {
        alert("Brand Settings updated successfully!");
        fetchData();
      } else {
        const err = await res.json();
        alert("Failed to save settings: " + err.error);
      }
    } catch (err) {
      console.error(err);
      alert("Error saving settings: " + err.message);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-alabaster-linen text-charcoal-ink">
        <div className="flex flex-col items-center gap-3">
          <RefreshCcw className="h-10 w-10 animate-spin text-linen-gold" />
          <p className="text-xs font-bold tracking-widest uppercase text-charcoal-ink/60">Authenticating ClosetRush Admin...</p>
        </div>
      </div>
    );
  }

  // Not authenticated as admin check - redirect cleanly to login page
  if (!sessionUser) {
    if (typeof window !== "undefined") {
      window.location.href = "/login?redirect=/admin";
    }
    return (
      <div className="flex h-screen items-center justify-center bg-[#032026] text-white">
        <div className="flex flex-col items-center gap-3">
          <RefreshCcw className="h-10 w-10 animate-spin text-[#05D4B5]" />
          <p className="text-xs font-bold tracking-widest uppercase text-gray-300">Redirecting to Admin Login...</p>
        </div>
      </div>
    );
  }

  // Sidebar items
  const sidebarItems = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Analytics", icon: BarChart3 },
    { name: "Push Notifications", icon: Bell },
    { name: "Categories", icon: Tag },
    { name: "Plans", icon: DollarSign },
    { name: "Coupons", icon: Ticket },
    { name: "Inventory", icon: Package },
    { name: "Warehouse Manager", icon: Warehouse },
    { name: "Customer Dashboard", icon: Users },
    { name: "Staff Approvals", icon: UserCheck },
    { name: "Quotes", icon: FileText },
    { name: "Support Tickets", icon: HelpCircle },
    { name: "Refunds", icon: RefreshCcw },
    { name: "Waitlist", icon: Inbox },
    { name: "Brand Settings", icon: Settings },
    { name: "Blog Studio", icon: BookOpen, href: "/admin/blog" }
  ];

  return (
    <div className="flex h-screen bg-alabaster-linen text-charcoal-ink font-sans antialiased overflow-hidden admin-theme">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-black/05 flex flex-col justify-between shrink-0 z-20">
        <div>
          {/* Sidebar Header */}
          <div className="p-6 border-b border-black/05 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-serif font-bold bg-gradient-to-r from-linen-gold to-charcoal-ink bg-clip-text text-transparent">
                ClosetRush
              </span>
            </Link>
            <span className="text-[9px] font-bold bg-linen-gold/15 text-linen-gold border border-linen-gold/25 px-1.5 py-0.5 rounded-none uppercase tracking-wider">
              Admin
            </span>
          </div>

          {/* User badge */}
          <div className="p-4 mx-3 my-4 bg-alabaster-linen border border-black/05 rounded-none flex items-center gap-3">
            <div className="h-10 w-10 rounded-none bg-linen-gold text-white flex items-center justify-center font-bold text-sm uppercase font-serif">
              {sessionUser.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-charcoal-ink truncate">{sessionUser.name}</h4>
              <p className="text-[10px] text-linen-gold font-extrabold uppercase tracking-widest">{sessionUser.role}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="px-3 space-y-1">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              if (item.href) {
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-none text-xs font-bold uppercase tracking-wider text-charcoal-ink/65 hover:bg-black/02 hover:text-charcoal-ink border border-transparent transition-all"
                  >
                    <Icon className="h-4.5 w-4.5 shrink-0 text-linen-gold" />
                    <span>{item.name}</span>
                  </Link>
                );
              }
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-none text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer ${isActive
                      ? "bg-linen-gold/10 text-linen-gold border border-linen-gold/20"
                      : "text-charcoal-ink/65 hover:bg-black/02 hover:text-charcoal-ink border border-transparent"
                    }`}
                >
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? "text-linen-gold" : "text-charcoal-ink/40"}`} />
                  <span>{item.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-black/05 space-y-2">
          <Link
            href="/"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-none text-xs font-bold uppercase tracking-wider text-charcoal-ink/60 hover:bg-black/02 hover:text-charcoal-ink border border-transparent transition-all"
          >
            <Home className="h-4.5 w-4.5 text-charcoal-ink/40" />
            <span>Go to Home</span>
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-none text-xs font-bold uppercase tracking-wider text-rose-500 hover:bg-rose-50 hover:text-rose-700 border border-transparent transition-all cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5 text-rose-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 bg-alabaster-linen overflow-y-auto">
        {/* Top Navbar */}
        <header className="h-16 border-b border-black/05 px-8 flex items-center justify-between shrink-0 bg-white/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="text-charcoal-ink/40 font-bold text-xs uppercase tracking-wider">Admin</span>
            <span className="text-black/10 text-xs">/</span>
            <span className="text-charcoal-ink font-bold text-xs uppercase tracking-wider">{activeTab}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={triggerSeeder}
              disabled={seedingLoading}
              className="py-1.5 px-3.5 rounded-none bg-transparent hover:bg-black/05 text-charcoal-ink/75 border border-black/10 text-2xs font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCcw className={`h-3 w-3 text-charcoal-ink/50 ${seedingLoading ? "animate-spin" : ""}`} />
              Reset Seeder Data
            </button>
            <span className="h-4 w-px bg-black/10" />
            <div className="text-2xs font-bold uppercase tracking-wider text-charcoal-ink/40">
              Session Expires in: <span className="text-linen-gold font-extrabold">7d</span>
            </div>
          </div>
        </header>

        {/* Content Container */}
        <div className="p-8 flex-1">
          {/* TAB: DASHBOARD */}
          {activeTab === "Dashboard" && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h1 className="text-2xl font-serif font-bold text-charcoal-ink mb-1">Admin Dashboard</h1>
                <p className="text-xs text-charcoal-ink/50 font-semibold uppercase tracking-wider">Comprehensive system management and analytics overview</p>
              </div>

              {/* KPI Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Metric 1 */}
                <div className="bg-white border border-black/10 rounded-none p-6 relative overflow-hidden group hover:border-linen-gold/50 transition-all duration-200">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-linen-gold/5 rounded-none blur-2xl transition-all" />
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xs font-bold uppercase text-charcoal-ink/40 tracking-widest">Total Users</span>
                    <div className="p-2.5 rounded-none bg-linen-gold/10 text-linen-gold">
                      <Users className="h-5 w-5" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-charcoal-ink mb-1">{stats.totalUsers}</h2>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-ink/40">Registered Accounts</p>
                </div>

                {/* Metric 2 */}
                <div className="bg-white border border-black/10 rounded-none p-6 relative overflow-hidden group hover:border-linen-gold/50 transition-all duration-200">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-linen-gold/5 rounded-none blur-2xl transition-all" />
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xs font-bold uppercase text-charcoal-ink/40 tracking-widest">Active Subscriptions</span>
                    <div className="p-2.5 rounded-none bg-linen-gold/10 text-linen-gold">
                      <Package className="h-5 w-5" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-charcoal-ink mb-1">{stats.activeSubscriptions}</h2>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-linen-gold">Ongoing Bedding Swaps</p>
                </div>

                {/* Metric 3 */}
                <div className="bg-white border border-black/10 rounded-none p-6 relative overflow-hidden group hover:border-linen-gold/50 transition-all duration-200">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-linen-gold/5 rounded-none blur-2xl transition-all" />
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xs font-bold uppercase text-charcoal-ink/40 tracking-widest">Total Revenue</span>
                    <div className="p-2.5 rounded-none bg-linen-gold/10 text-linen-gold">
                      <DollarSign className="h-5 w-5" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-charcoal-ink mb-1">₹{stats.totalRevenue}</h2>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal-ink/40">Aggregated Plan Charges</p>
                </div>

                {/* Metric 4 */}
                <div className="bg-white border border-black/10 rounded-none p-6 relative overflow-hidden group hover:border-linen-gold/50 transition-all duration-200">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-linen-gold/5 rounded-none blur-2xl transition-all" />
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xs font-bold uppercase text-charcoal-ink/40 tracking-widest">Monthly Growth</span>
                    <div className="p-2.5 rounded-none bg-linen-gold/10 text-linen-gold">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                  </div>
                  <h2 className="text-3xl font-serif font-bold text-charcoal-ink mb-1">{stats.monthlyGrowth}%</h2>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-linen-gold">
                    Month-over-month Change
                  </p>
                </div>
              </div>              {/* Navigation Dashboard Sections Toggle */}
              <div className="bg-white border border-black/10 rounded-none p-6 shadow-sm">
                <h3 className="text-sm font-serif font-bold text-charcoal-ink mb-4 uppercase tracking-wider">Control Quick Links</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                  <button onClick={() => setActiveTab("Customer Dashboard")} className="bg-alabaster-linen border border-black/10 hover:border-linen-gold/40 p-4 rounded-none flex flex-col items-start justify-between transition-all hover:shadow-sm cursor-pointer">
                    <span className="text-2xs font-bold text-charcoal-ink/50 uppercase tracking-wider">Customers</span>
                    <span className="text-xl font-serif font-bold text-linen-gold mt-2">{usersList.length}</span>
                  </button>
                  <button onClick={() => setActiveTab("Waitlist")} className="bg-alabaster-linen border border-black/10 hover:border-linen-gold/40 p-4 rounded-none flex flex-col items-start justify-between transition-all hover:shadow-sm cursor-pointer">
                    <span className="text-2xs font-bold text-charcoal-ink/50 uppercase tracking-wider">Waitlist</span>
                    <span className="text-xl font-serif font-bold text-linen-gold mt-2">{waitlistList.length}</span>
                  </button>
                  <button onClick={() => setActiveTab("Categories")} className="bg-alabaster-linen border border-black/10 hover:border-linen-gold/40 p-4 rounded-none flex flex-col items-start justify-between transition-all hover:shadow-sm cursor-pointer">
                    <span className="text-2xs font-bold text-charcoal-ink/50 uppercase tracking-wider">Bundles / Cats</span>
                    <span className="text-xl font-serif font-bold text-linen-gold mt-2">{categoriesList.length}</span>
                  </button>
                  <button onClick={() => setActiveTab("Quotes")} className="bg-alabaster-linen border border-black/10 hover:border-linen-gold/40 p-4 rounded-none flex flex-col items-start justify-between transition-all hover:shadow-sm cursor-pointer">
                    <span className="text-2xs font-bold text-charcoal-ink/50 uppercase tracking-wider">Quotes</span>
                    <span className="text-xl font-serif font-bold text-linen-gold mt-2">{stats.totalQuotes}</span>
                  </button>
                  <button onClick={() => setActiveTab("Support Tickets")} className="bg-alabaster-linen border border-black/10 hover:border-linen-gold/40 p-4 rounded-none flex flex-col items-start justify-between transition-all hover:shadow-sm cursor-pointer">
                    <span className="text-2xs font-bold text-charcoal-ink/50 uppercase tracking-wider">Support Tickets</span>
                    <span className="text-xl font-serif font-bold text-linen-gold mt-2">{ticketsList.length}</span>
                  </button>
                  <button onClick={() => setActiveTab("Inventory")} className="bg-alabaster-linen border border-black/10 hover:border-linen-gold/40 p-4 rounded-none flex flex-col items-start justify-between transition-all hover:shadow-sm cursor-pointer">
                    <span className="text-2xs font-bold text-charcoal-ink/50 uppercase tracking-wider">All Orders</span>
                    <span className="text-xl font-serif font-bold text-linen-gold mt-2">{ordersList.length}</span>
                  </button>
                  <button onClick={() => setActiveTab("Inventory")} className="bg-alabaster-linen border border-black/10 hover:border-amber-500/40 p-4 rounded-none flex flex-col items-start justify-between transition-all hover:shadow-sm cursor-pointer">
                    <span className="text-2xs font-bold text-charcoal-ink/50 uppercase tracking-wider">Pending Orders</span>
                    <span className="text-xl font-serif font-bold text-amber-600 mt-2">{ordersList.filter(o => o.status === 'PENDING').length}</span>
                  </button>
                  <button onClick={() => setActiveTab("Refunds")} className="bg-alabaster-linen border border-black/10 hover:border-[#C5A376]/40 p-4 rounded-none flex flex-col items-start justify-between transition-all hover:shadow-sm cursor-pointer">
                    <span className="text-2xs font-bold text-charcoal-ink/50 uppercase tracking-wider">Refunds</span>
                    <span className="text-xl font-serif font-bold text-amber-600 mt-2">{refundsList.filter(r => r.status === 'PENDING').length}</span>
                  </button>
                </div>
              </div>

              {/* Quick Summary View Table */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Users Panel */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Recent Users</h3>
                    <button onClick={() => setActiveTab("Customer Dashboard")} className="text-teal-600 hover:text-teal-700 text-xs font-bold cursor-pointer">View All</button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {usersList.slice(0, 5).map(u => (
                      <div key={u._id} className="py-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-slate-800">{u.name}</p>
                          <p className="text-[10px] text-slate-400">{u.email}</p>
                        </div>
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${u.accountType === "Commercial Partner" ? "bg-purple-50 text-purple-700 border border-purple-200/50" : "bg-blue-50 text-blue-700 border border-blue-200/50"
                          }`}>
                          {u.accountType === "Commercial Partner" ? "Business" : "Individual"}
                        </span>
                      </div>
                    ))}
                    {usersList.length === 0 && (
                      <p className="text-slate-400 text-xs py-4 text-center">No users found. Try seeding the database!</p>
                    )}
                  </div>
                </div>

                {/* Urgent support tickets */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">Urgent Support Tickets</h3>
                    <button onClick={() => setActiveTab("Support Tickets")} className="text-teal-600 hover:text-teal-700 text-xs font-bold cursor-pointer">View All</button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {ticketsList.slice(0, 5).map(t => (
                      <div key={t._id} className="py-3 flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black text-slate-400">{t.ticketId}</span>
                            <span className={`text-[8px] font-extrabold px-1.5 py-0.2 rounded uppercase ${t.priority === 'CRITICAL' ? 'bg-red-50 text-red-700 border border-red-200/50' :
                                t.priority === 'HIGH' ? 'bg-amber-50 text-amber-700 border border-amber-200/50' : 'bg-slate-100 text-slate-600'
                              }`}>{t.priority}</span>
                          </div>
                          <p className="text-xs font-bold text-slate-800 mt-0.5">{t.subject}</p>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500">{t.status}</span>
                      </div>
                    ))}
                    {ticketsList.length === 0 && (
                      <p className="text-slate-400 text-xs py-4 text-center">No active tickets registered.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ANALYTICS */}
          {activeTab === "Analytics" && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h1 className="text-2xl font-black text-slate-900 leading-none mb-1">Analytics & Usage</h1>
                <p className="text-xs text-slate-500">Real-time metrics on visitors, page views, and PWA installs</p>
              </div>

              {/* KPI metrics row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs relative overflow-hidden">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Visitors</span>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <h3 className="text-2xl font-black text-slate-900">{analyticsData?.totalVisitors || 0}</h3>
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium mt-1">Unique device sessions</p>
                </div>
                <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs relative overflow-hidden">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Page Views</span>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <h3 className="text-2xl font-black text-slate-900">{analyticsData?.totalViews || 0}</h3>
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium mt-1">Across all standard pages</p>
                </div>
                <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs relative overflow-hidden">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">PWA Installs</span>
                  <div className="flex items-baseline gap-1.5 mt-2">
                    <h3 className="text-2xl font-black text-teal-650">{analyticsData?.pwaInstalls || 0}</h3>
                  </div>
                  <p className="text-[9px] text-slate-400 font-medium mt-1">Total app installations tracked</p>
                </div>
              </div>

              {/* Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Popular Pages Table */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 mb-1 uppercase tracking-wider">Most Visited Pages</h3>
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                          <th className="p-3 font-bold">Path</th>
                          <th className="p-3 font-bold text-right">Views</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData?.pageBreakdown && analyticsData.pageBreakdown.length > 0 ? (
                          analyticsData.pageBreakdown.map((p, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/30">
                              <td className="p-3 font-bold text-slate-800">{p._id}</td>
                              <td className="p-3 font-semibold text-slate-500 text-right">{p.count}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="2" className="text-center p-8 text-slate-400 font-semibold">No data available.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Top Referrers */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 mb-1 uppercase tracking-wider">Top Referrers</h3>
                  <div className="overflow-x-auto mt-4">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                          <th className="p-3 font-bold">Source</th>
                          <th className="p-3 font-bold text-right">Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData?.referrers && analyticsData.referrers.length > 0 ? (
                          analyticsData.referrers.map((r, idx) => (
                            <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/30">
                              <td className="p-3 font-bold text-slate-800 truncate max-w-[200px]" title={r._id}>{r._id || "Direct"}</td>
                              <td className="p-3 font-semibold text-slate-500 text-right">{r.count}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="2" className="text-center p-8 text-slate-400 font-semibold">No data available.</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PUSH NOTIFICATIONS */}
          {activeTab === "Push Notifications" && (
            <div className="space-y-8 animate-fadeIn max-w-2xl mx-auto">
              <div>
                <h1 className="text-2xl font-black text-slate-900 leading-none mb-1">Push Notifications</h1>
                <p className="text-xs text-slate-500">Send alerts directly to user devices via PWA</p>
              </div>
              <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setPushSending(true);
                  try {
                    const res = await fetch("/api/admin/send-push", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(pushForm)
                    });
                    const data = await res.json();
                    if(data.success) {
                      alert(data.message);
                      setPushForm({ title: "", message: "", url: "", image: "" });
                    } else {
                      alert(data.error || "Failed to send");
                    }
                  } catch (err) {
                    alert("Network error");
                  } finally {
                    setPushSending(false);
                  }
                }} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Notification Title</label>
                    <input required type="text" value={pushForm.title} onChange={e => setPushForm({...pushForm, title: e.target.value})} className="w-full border p-2.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500/20" placeholder="e.g. New Bedsheets Arrived!" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Message Body</label>
                    <textarea required value={pushForm.message} onChange={e => setPushForm({...pushForm, message: e.target.value})} className="w-full border p-2.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500/20" rows="3" placeholder="Check out our latest collection..."></textarea>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Action URL (Optional)</label>
                    <input type="text" value={pushForm.url} onChange={e => setPushForm({...pushForm, url: e.target.value})} className="w-full border p-2.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500/20" placeholder="e.g. /shop or https://closerush.in/promo" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">Image URL (Optional)</label>
                    <input type="text" value={pushForm.image} onChange={e => setPushForm({...pushForm, image: e.target.value})} className="w-full border p-2.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500/20" placeholder="e.g. https://.../image.jpg" />
                  </div>
                  <button type="submit" disabled={pushSending} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2">
                    {pushSending ? "Broadcasting..." : <><Bell className="w-4 h-4" /> Broadcast to All Users</>}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* TAB: CATEGORIES */}
          {activeTab === "Categories" && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 leading-none mb-1">Categories Management</h1>
                  <p className="text-xs text-slate-500">Configure beddings, towels, sheets, and baseline prices</p>
                </div>
                <button
                  onClick={() => {
                    setCategoryForm({ id: "", name: "", description: "", pricePerItem: "", status: "ACTIVE", totalStock: 100, availableStock: 100, rentedStock: 0, laundryStock: 0 });
                    setShowCategoryModal(true);
                  }}
                  className="py-2.5 px-5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all shadow-md shadow-teal-500/10 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Add Category
                </button>
              </div>

              {/* Alert Box info */}
              <div className="bg-white border border-slate-200/60 p-4.5 rounded-2xl text-xs text-slate-500 leading-relaxed shadow-xs">
                <strong className="text-teal-600">About Categories:</strong> Categories are the basic items like "Single Bed", "Double Bed", "Curtains", "Pillow Covers", etc. After creating categories, you can create bundles that combine multiple categories with pricing.
              </div>

              {/* Categories Cards Layout */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categoriesList.map(cat => {
                  const total = cat.totalStock || 0;
                  const available = cat.availableStock || 0;
                  const rented = cat.rentedStock || 0;
                  const laundry = cat.laundryStock || 0;
                  return (
                    <div key={cat._id} className="bg-white border border-slate-200/60 hover:border-teal-500/20 hover:shadow-md rounded-3xl p-6 flex flex-col justify-between relative group transition-all duration-200">
                      <div>
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-extrabold text-slate-900 text-base">{cat.name}</h3>
                          <button
                            onClick={async () => {
                              const nextStatus = cat.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
                              try {
                                const res = await fetch("/api/admin/categories", {
                                  method: "PUT",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ categoryId: cat._id, name: cat.name, description: cat.description, pricePerItem: cat.pricePerItem, status: nextStatus, totalStock: cat.totalStock, availableStock: cat.availableStock, rentedStock: cat.rentedStock, laundryStock: cat.laundryStock })
                                });
                                if (res.ok) {
                                  fetchData();
                                }
                              } catch (err) {
                                  console.error(err);
                              }
                            }}
                            className={`text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded border transition-all hover:scale-105 active:scale-95 cursor-pointer ${cat.status === "ACTIVE"
                                ? "bg-teal-50 text-teal-650 border-teal-200 hover:bg-teal-100"
                                : "bg-slate-100 text-slate-550 border-slate-200/80 hover:bg-slate-200"
                              }`}
                            title="Click to toggle status"
                          >
                            {cat.status}
                          </button>
                        </div>
                        <p className="text-xs text-slate-500 min-h-[40px] mb-4 leading-relaxed">{cat.description || "No description provided."}</p>
                      </div>

                      <div className="flex flex-col gap-4 pt-4 border-t border-slate-100">
                        <div className="w-full">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">Price & Stock Allocation</span>
                          <div className="flex items-baseline gap-2 mt-0.5 mb-2">
                            <span className="text-base font-black text-teal-650">₹{cat.pricePerItem}</span>
                          </div>
                          
                          <div className="space-y-1.5 w-full">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="text-slate-500 font-medium">Avail: <strong className="text-emerald-600 font-black">{available}</strong></span>
                              <span className="text-slate-500 font-medium">Rent: <strong className="text-teal-700 font-black">{rented}</strong></span>
                              <span className="text-slate-500 font-medium">Laund: <strong className="text-amber-600 font-black">{laundry}</strong></span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 flex overflow-hidden">
                              <div className="bg-emerald-500" style={{ width: `${total > 0 ? (available / total) * 100 : 0}%` }} title={`Available: ${available}`} />
                              <div className="bg-teal-600" style={{ width: `${total > 0 ? (rented / total) * 100 : 0}%` }} title={`Rented: ${rented}`} />
                              <div className="bg-amber-500" style={{ width: `${total > 0 ? (laundry / total) * 100 : 0}%` }} title={`Laundry: ${laundry}`} />
                            </div>
                            <span className="text-[10px] text-slate-450 block font-bold">Total Stock: {total} units</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => {
                              setCategoryForm({
                                id: "",
                                name: `${cat.name} (Copy)`,
                                description: cat.description || "",
                                pricePerItem: cat.pricePerItem,
                                status: cat.status,
                                totalStock: cat.totalStock || 100,
                                availableStock: cat.availableStock || 100,
                                rentedStock: cat.rentedStock || 0,
                                laundryStock: cat.laundryStock || 0
                              });
                              setShowCategoryModal(true);
                            }}
                            className="p-2 bg-slate-50 hover:bg-teal-50 text-slate-605 hover:text-teal-700 rounded-xl transition-all cursor-pointer"
                            title="Duplicate Category"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditCategory(cat)}
                            className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-xl transition-all cursor-pointer"
                            title="Edit Category & Stock"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat._id)}
                            className="p-2 bg-slate-50 hover:bg-red-50 text-slate-650 hover:text-red-700 rounded-xl transition-all cursor-pointer"
                            title="Delete Category"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {categoriesList.length === 0 && (
                  <div className="col-span-3 text-center py-12 text-slate-400 text-xs bg-white border border-slate-200/60 rounded-3xl">
                    No categories found. Click Add Category to create one.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: INVENTORY */}
          {activeTab === "Inventory" && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h1 className="text-2xl font-black text-slate-900 leading-none mb-1">Inventory & Orders Management</h1>
                <p className="text-xs text-slate-500">Complete end-to-end tracking — orders, SKUs, pickups</p>
              </div>

              {/* Mini Metrics */}
              {(() => {
                const totalItemsOut = ordersList
                  .filter(o => o.status === "ACTIVE" || o.status === "DELIVERED")
                  .reduce((acc, o) => {
                    if (o.bundleName && o.bundleName.toLowerCase().includes("double")) {
                      return acc + 4; // 1 double sheet, 2 pillow covers, 1 quilt
                    } else if (o.bundleName && o.bundleName.toLowerCase().includes("single")) {
                      return acc + 3; // 1 single sheet, 1 pillow cover, 1 quilt
                    }
                    return acc + 3; // default
                  }, 0);
                const pickupPending = ordersList.filter(o => o.status === "PENDING").length;

                return (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Orders</span>
                      <h3 className="text-xl font-black text-slate-900 mt-1">{ordersList.length}</h3>
                    </div>
                    <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Subscriptions</span>
                      <h3 className="text-xl font-black text-slate-900 mt-1">{ordersList.filter(o => o.status === 'ACTIVE' || o.status === 'DELIVERED').length}</h3>
                    </div>
                    <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rented Items Out</span>
                      <h3 className="text-xl font-black text-teal-650 mt-1">{totalItemsOut}</h3>
                    </div>
                    <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Delivery/Swap Pending</span>
                      <h3 className="text-xl font-black text-amber-600 mt-1">{pickupPending}</h3>
                    </div>
                  </div>
                );
              })()}

              {/* Stacked Stock Allocation bars and transfer tool */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Live Stock Level stacked bars */}
                <div className="lg:col-span-2 bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-wider">Live Warehouse Stock Status</h3>
                  <p className="text-[10px] text-slate-450 mb-6">Real-time linen stock utilization across warehouse states</p>
                  
                  <div className="space-y-5">
                    {categoriesList.map(cat => {
                      const total = cat.totalStock || 0;
                      const available = cat.availableStock || 0;
                      const rented = cat.rentedStock || 0;
                      const laundry = cat.laundryStock || 0;
                      
                      return (
                        <div key={cat._id} className="space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-800">{cat.name}</span>
                            <span className="text-[10px] font-extrabold text-slate-500">Total: {total} units</span>
                          </div>
                          
                          <div className="w-full bg-slate-100 rounded-full h-3 flex overflow-hidden">
                            <div className="bg-emerald-500 hover:opacity-90 animate-pulse-slow" style={{ width: `${total > 0 ? (available / total) * 100 : 0}%` }} title={`Available: ${available}`} />
                            <div className="bg-teal-600 hover:opacity-90" style={{ width: `${total > 0 ? (rented / total) * 100 : 0}%` }} title={`Rented: ${rented}`} />
                            <div className="bg-amber-500 hover:opacity-90" style={{ width: `${total > 0 ? (laundry / total) * 100 : 0}%` }} title={`Laundry: ${laundry}`} />
                          </div>
                          
                          <div className="flex gap-4 text-[9px] text-slate-400 font-bold">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Available ({available})</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-600 inline-block" /> Rented ({rented})</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Laundry ({laundry})</span>
                          </div>
                        </div>
                      );
                    })}
                    {categoriesList.length === 0 && (
                      <p className="text-slate-400 text-xs py-4 text-center">No inventory categories found.</p>
                    )}
                  </div>
                </div>

                {/* Quick Stock Transfer Form */}
                <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-wider">Quick Stock Transfer</h3>
                    <p className="text-[10px] text-slate-450 mb-6">Log manual logistics adjustments (e.g. laundry release or intake)</p>
                    
                    <form onSubmit={handleStockTransfer} className="space-y-3">
                      <div>
                        <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">Item Category</label>
                        <select
                          value={transferForm.categoryId}
                          onChange={(e) => setTransferForm({ ...transferForm, categoryId: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer"
                        >
                          {categoriesList.map(c => (
                            <option key={c._id} value={c._id}>{c.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">From state</label>
                          <select
                            value={transferForm.fromState}
                            onChange={(e) => setTransferForm({ ...transferForm, fromState: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer"
                          >
                            <option value="availableStock">Available</option>
                            <option value="laundryStock">Laundry</option>
                            <option value="rentedStock">Rented</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">To state</label>
                          <select
                            value={transferForm.toState}
                            onChange={(e) => setTransferForm({ ...transferForm, toState: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer"
                          >
                            <option value="availableStock">Available</option>
                            <option value="laundryStock">Laundry</option>
                            <option value="rentedStock">Rented</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-400 font-extrabold uppercase block mb-1">Linen Quantity</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={transferForm.qty}
                          onChange={(e) => setTransferForm({ ...transferForm, qty: Number(e.target.value) })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-teal-500"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full mt-3 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs transition-all active:scale-98 cursor-pointer text-center shadow-md shadow-slate-700/10"
                      >
                        Submit Stock Adjustment
                      </button>
                    </form>
                  </div>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="bg-white border border-slate-200/60 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Search by ID, Customer Name, or Bundle..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-xs placeholder-slate-400 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xs text-slate-500 font-bold uppercase">Status:</span>
                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs font-bold text-slate-850 focus:outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="ALL">All Orders</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="PENDING">PENDING</option>
                    <option value="DELIVERED">DELIVERED</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-slate-100 bg-slate-50/20">
                  <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">Orders List ({ordersList.length} total orders)</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                        <th className="p-4 font-bold">Bundle Order ID</th>
                        <th className="p-4 font-bold">User Details</th>
                        <th className="p-4 font-bold">Bundle Name</th>
                        <th className="p-4 font-bold">Price</th>
                        <th className="p-4 font-bold">Status</th>
                        <th className="p-4 font-bold">Timeline</th>
                        <th className="p-4 font-bold">Address</th>
                        <th className="p-4 font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ordersList
                        .filter(o => {
                          const query = orderSearch.toLowerCase();
                          const matchesQuery =
                            o.bundleOrderId.toLowerCase().includes(query) ||
                            (o.userName || "").toLowerCase().includes(query) ||
                            (o.email || "").toLowerCase().includes(query) ||
                            o.bundleName.toLowerCase().includes(query);

                          const matchesFilter = orderStatusFilter === "ALL" || o.status === orderStatusFilter;
                          return matchesQuery && matchesFilter;
                        })
                        .map(o => (
                          <tr key={o._id} className="hover:bg-slate-50/40 transition-colors">
                            <td className="p-4 font-black text-slate-900">{o.bundleOrderId}</td>
                            <td className="p-4 space-y-0.5">
                              <p className="font-bold text-slate-800">{o.userName || "N/A"}</p>
                              <p className="text-[10px] text-slate-400">{o.email || "N/A"}</p>
                              <p className="text-[10px] text-slate-400">{o.phone || ""}</p>
                            </td>
                            <td className="p-4 text-slate-650 font-bold">{o.bundleName}</td>
                            <td className="p-4 font-extrabold text-teal-600">₹{o.finalPrice}</td>
                            <td className="p-4">
                              <span className={`text-[9px] font-black uppercase px-2.5 py-0.8 rounded-full border ${o.status === "ACTIVE" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                  o.status === "CANCELLED" ? "bg-rose-50 text-rose-700 border-rose-200" :
                                    o.status === "DELIVERED" ? "bg-teal-50 text-teal-700 border-teal-200" : "bg-amber-50 text-amber-700 border-amber-200"
                                }`}>
                                {o.status}
                              </span>
                            </td>
                            <td className="p-4 space-y-0.5 text-[10px] text-slate-400 font-medium">
                              <p>Start: {new Date(o.startDate).toLocaleDateString()}</p>
                              {o.endDate && <p>End: {new Date(o.endDate).toLocaleDateString()}</p>}
                            </td>
                            <td className="p-4 text-slate-600 max-w-[200px] truncate" title={o.deliveryAddress}>
                              {o.deliveryAddress || "—"}
                            </td>
                            <td className="p-4">
                              <div className="flex gap-1.5 items-center flex-wrap">
                                <button
                                  onClick={() => {
                                    setSelectedOrder(o);
                                    orderFormSet({
                                      userName: o.userName || "",
                                      email: o.email || "",
                                      phone: o.phone || "",
                                      bundleName: o.bundleName || "",
                                      finalPrice: o.finalPrice || 0,
                                      status: o.status || "PENDING",
                                      deliveryAddress: o.deliveryAddress || "",
                                      startDate: o.startDate ? new Date(o.startDate).toISOString().split('T')[0] : "",
                                      endDate: o.endDate ? new Date(o.endDate).toISOString().split('T')[0] : ""
                                    });
                                  }}
                                  className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Edit className="h-3 w-3" /> View & Edit
                                </button>
                                {/* QR CODE BUTTON */}
                                <button
                                  onClick={() => generateQR(o)}
                                  className="px-2 py-1 bg-violet-50 hover:bg-violet-100 text-violet-700 text-[10px] font-bold border border-violet-200 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                                  title="Generate Bundle QR Code"
                                >
                                  <QrCode className="h-3 w-3" /> QR
                                </button>
                                {o.status !== "ACTIVE" && (
                                  <button
                                    onClick={() => updateOrderStatus(o._id, "ACTIVE")}
                                    className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 text-[10px] font-bold rounded-lg border border-teal-200/50 transition-all cursor-pointer"
                                  >
                                    Activate
                                  </button>
                                )}
                                {o.status !== "CANCELLED" && (
                                  <button
                                    onClick={() => updateOrderStatus(o._id, "CANCELLED")}
                                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold rounded-lg border border-rose-200/50 transition-all cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteOrder(o._id)}
                                  className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold border border-rose-200/50 rounded-lg transition-all cursor-pointer flex items-center gap-1"
                                  title="Delete Order"
                                >
                                  <Trash2 className="h-3 w-3" /> Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {ordersList.length === 0 && (
                        <tr>
                          <td colSpan="8" className="text-center p-8 text-slate-400">No orders registered.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CUSTOMER DASHBOARD */}
          {activeTab === "Customer Dashboard" && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 leading-none mb-1">Customer Dashboard</h1>
                  <p className="text-xs text-slate-550">Manage B2B partners, single clients, address books, and active subscription plans</p>
                </div>
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setUserForm({
                      name: "",
                      email: "",
                      mobile: "",
                      address: "",
                      password: "",
                      accountType: "Individual User",
                      status: "ACTIVE",
                      role: "user",
                      selectedPlan: {
                        bedType: "",
                        planName: "",
                        price: "",
                        duration: "",
                        startDate: new Date().toISOString().split('T')[0]
                      }
                    });
                    setShowUserModal(true);
                  }}
                  className="py-2.5 px-5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all shadow-md shadow-teal-500/10 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Add New Customer
                </button>
              </div>

              {/* Customer Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs relative overflow-hidden group hover:border-teal-500/20 hover:shadow-md transition-all duration-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Customers</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{usersList.length}</h3>
                  <p className="text-[9px] text-slate-400 font-medium mt-1">B2B & Single Customers</p>
                </div>
                <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs relative overflow-hidden group hover:border-teal-500/20 hover:shadow-md transition-all duration-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Single Clients</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{usersList.filter(u => u.accountType === 'Individual User' && u.status === 'ACTIVE').length}</h3>
                  <p className="text-[9px] text-teal-600 font-bold mt-1">{usersList.filter(u => u.accountType === 'Individual User' && u.selectedPlan?.planName).length} with active subscription</p>
                </div>
                <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs relative overflow-hidden group hover:border-teal-500/20 hover:shadow-md transition-all duration-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active B2B Partners</span>
                  <h3 className="text-2xl font-black text-slate-900 mt-1">{usersList.filter(u => u.accountType === 'Commercial Partner' && u.status === 'ACTIVE').length}</h3>
                  <p className="text-[9px] text-purple-600 font-bold mt-1">Commercial Partner accounts</p>
                </div>
                <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs relative overflow-hidden group hover:border-teal-500/20 hover:shadow-md transition-all duration-200">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Active Plan Value (MRR)</span>
                  <h3 className="text-2xl font-black text-teal-650 mt-1">
                    ₹{usersList.filter(u => u.status === 'ACTIVE').reduce((sum, u) => sum + (Number(u.selectedPlan?.price) || 0), 0).toLocaleString()}
                  </h3>
                  <p className="text-[9px] text-slate-400 font-medium mt-1">Sum of active subscription pricing</p>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white border border-slate-200/60 p-6 rounded-3xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xs">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search by name, email, mobile, or address..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-xs placeholder-slate-400 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xs text-slate-500 font-bold uppercase">Type:</span>
                    <select
                      value={userTypeFilter}
                      onChange={(e) => setUserTypeFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-2xl py-2 px-3 text-2xs font-bold text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer"
                    >
                      <option value="ALL">All Types</option>
                      <option value="Individual User">Individual</option>
                      <option value="Commercial Partner">B2B Partner</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-2xs text-slate-500 font-bold uppercase">Status:</span>
                    <select
                      value={userStatusFilter}
                      onChange={(e) => setUserStatusFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-2xl py-2 px-3 text-2xs font-bold text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer"
                    >
                      <option value="ALL">All Status</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-2xs text-slate-500 font-bold uppercase">Plan:</span>
                    <select
                      value={userPlanFilter}
                      onChange={(e) => setUserPlanFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-2xl py-2 px-3 text-2xs font-bold text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer"
                    >
                      <option value="ALL">All Plans</option>
                      <option value="ACTIVE_PLAN">Active Non-Expired Plan</option>
                      <option value="EXPIRED_PLAN">Expired Plan</option>
                      <option value="NO_PLAN">No Plan Selected</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-550 bg-slate-50/50">
                        <th className="p-4 font-bold">Customer Details</th>
                        <th className="p-4 font-bold">Contact & Address</th>
                        <th className="p-4 font-bold">Account Type</th>
                        <th className="p-4 font-bold">Subscription Plan</th>
                        <th className="p-4 font-bold">Account Access</th>
                        <th className="p-4 font-bold">Registered</th>
                        <th className="p-4 font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {usersList
                        .filter(u => {
                          const query = userSearch.toLowerCase();
                          const matchesQuery =
                            u.name.toLowerCase().includes(query) ||
                            u.email.toLowerCase().includes(query) ||
                            (u.mobile || "").includes(query) ||
                            (u.address || "").toLowerCase().includes(query);

                          const matchesType = userTypeFilter === "ALL" || u.accountType === userTypeFilter;
                          const matchesStatus = userStatusFilter === "ALL" || (u.status || "ACTIVE") === userStatusFilter;
                          
                          const hasPlan = !!(u.selectedPlan && u.selectedPlan.planName);
                          let startDate = null;
                          let expiryDate = null;
                          let isExpired = false;

                          if (hasPlan && u.selectedPlan.startDate) {
                            startDate = new Date(u.selectedPlan.startDate);
                            if (!isNaN(startDate.getTime())) {
                              expiryDate = new Date(startDate);
                              const dur = (u.selectedPlan.duration || "").toLowerCase();
                              if (dur.includes("3 month") || dur.includes("quarterly")) {
                                expiryDate.setMonth(expiryDate.getMonth() + 3);
                              } else if (dur.includes("6 month") || dur.includes("half")) {
                                expiryDate.setMonth(expiryDate.getMonth() + 6);
                              } else if (dur.includes("12 month") || dur.includes("year") || dur.includes("annual")) {
                                expiryDate.setFullYear(expiryDate.getFullYear() + 1);
                              } else {
                                // Default 1 Month
                                expiryDate.setMonth(expiryDate.getMonth() + 1);
                              }
                              isExpired = new Date() > expiryDate;
                            }
                          }

                          let matchesPlan = true;
                          if (userPlanFilter === "HAS_PLAN" || userPlanFilter === "ACTIVE_PLAN") {
                            matchesPlan = hasPlan && !isExpired;
                          } else if (userPlanFilter === "EXPIRED_PLAN") {
                            matchesPlan = hasPlan && isExpired;
                          } else if (userPlanFilter === "NO_PLAN") {
                            matchesPlan = !hasPlan;
                          }

                          return matchesQuery && matchesType && matchesStatus && matchesPlan;
                        })
                        .map(u => {
                          const b2bQuotesCount = quotesList.filter(q => q.email.toLowerCase() === u.email.toLowerCase()).length;
                          const userOrdersCount = ordersList.filter(o => o.email.toLowerCase() === u.email.toLowerCase()).length;

                          const hasPlan = !!(u.selectedPlan && u.selectedPlan.planName);
                          let startDate = null;
                          let expiryDate = null;
                          let isExpired = false;

                          if (hasPlan && u.selectedPlan.startDate) {
                            startDate = new Date(u.selectedPlan.startDate);
                            if (u.selectedPlan.endDate) {
                              expiryDate = new Date(u.selectedPlan.endDate);
                            } else {
                              // Find matching active order for explicit endDate
                              const activeOrder = ordersList.find(o => o.email.toLowerCase() === u.email.toLowerCase() && (o.status === "ACTIVE" || o.status === "DELIVERED"));
                              if (activeOrder && activeOrder.endDate) {
                                expiryDate = new Date(activeOrder.endDate);
                              } else if (!isNaN(startDate.getTime())) {
                                expiryDate = new Date(startDate);
                                const dur = (u.selectedPlan.duration || "").toLowerCase();
                                if (dur.includes("3 month") || dur.includes("quarterly")) {
                                  expiryDate.setMonth(expiryDate.getMonth() + 3);
                                } else if (dur.includes("6 month") || dur.includes("half")) {
                                  expiryDate.setMonth(expiryDate.getMonth() + 6);
                                } else if (dur.includes("12 month") || dur.includes("year") || dur.includes("annual")) {
                                  expiryDate.setFullYear(expiryDate.getFullYear() + 1);
                                } else {
                                  expiryDate.setMonth(expiryDate.getMonth() + 1);
                                }
                              }
                            }
                            if (expiryDate && !isNaN(expiryDate.getTime())) {
                              isExpired = new Date() > expiryDate;
                            }
                          }

                          return (
                            <tr key={u._id} className="hover:bg-slate-50/40 transition-colors">
                              <td className="p-4 space-y-0.5">
                                <p className="font-bold text-slate-800">{u.name}</p>
                                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                                  <Mail className="h-3.5 w-3.5 text-slate-400 inline shrink-0" /> {u.email}
                                </p>
                              </td>
                              <td className="p-4 space-y-1">
                                <p className="text-slate-650 font-bold flex items-center gap-1">
                                  <Phone className="h-3.5 w-3.5 text-slate-400 inline shrink-0" /> {u.mobile || "—"}
                                </p>
                                <p className="text-[10px] text-slate-400 max-w-[180px] truncate" title={u.address}>
                                  <MapPin className="h-3.5 w-3.5 text-slate-400 inline shrink-0" /> {u.address || "No Address Saved"}
                                </p>
                              </td>
                              <td className="p-4">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${u.accountType === "Commercial Partner"
                                    ? "bg-purple-50 text-purple-750 border-purple-200"
                                    : "bg-blue-50 text-blue-750 border-blue-200"
                                  }`}>
                                  {u.accountType === "Commercial Partner" ? "B2B Partner" : "Individual"}
                                </span>
                                {u.accountType === "Commercial Partner" && b2bQuotesCount > 0 && (
                                  <div className="mt-1">
                                    <span 
                                      onClick={() => {
                                        setQuoteReplyMessage(""); 
                                        setQuoteTypeTab("quotation");
                                        setActiveTab("Quotes");
                                      }}
                                      className="text-[9px] text-purple-700 font-extrabold hover:underline cursor-pointer bg-purple-100/50 border border-purple-200 rounded px-1.5 py-0.2"
                                    >
                                      Quotes: {b2bQuotesCount}
                                    </span>
                                  </div>
                                )}
                                {userOrdersCount > 0 && (
                                  <div className="mt-1">
                                    <span 
                                      onClick={() => {
                                        setOrderSearch(u.email);
                                        setActiveTab("Inventory");
                                      }}
                                      className="text-[9px] text-teal-700 font-extrabold hover:underline cursor-pointer bg-teal-50 border border-teal-200 rounded px-1.5 py-0.2"
                                    >
                                      Orders: {userOrdersCount}
                                    </span>
                                  </div>
                                )}
                              </td>
                              <td className="p-4">
                                {hasPlan ? (
                                  <div className={`border p-2.5 rounded-xl text-[10px] space-y-1 max-w-[200px] ${isExpired ? "bg-rose-50/70 border-rose-200" : "bg-emerald-50/70 border-emerald-200"}`}>
                                    <div className="flex items-center justify-between gap-1">
                                      <p className={`font-extrabold truncate ${isExpired ? "text-rose-900" : "text-emerald-900"}`}>{u.selectedPlan.planName}</p>
                                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded border shrink-0 ${isExpired ? "bg-rose-100 text-rose-700 border-rose-300" : "bg-emerald-100 text-emerald-800 border-emerald-300"}`}>
                                        {isExpired ? "EXPIRED" : "ACTIVE"}
                                      </span>
                                    </div>
                                    <p className="text-slate-600 font-semibold">
                                      Bed: <span className="text-slate-800 font-bold">{u.selectedPlan.bedType || "—"}</span>
                                    </p>
                                    <p className="text-slate-600 font-semibold">
                                      Price: <span className="text-teal-700 font-extrabold">₹{u.selectedPlan.price}</span> ({u.selectedPlan.duration || "1 Month"})
                                    </p>
                                    {startDate && (
                                      <p className="text-[9px] text-slate-500 font-medium">Since {startDate.toLocaleDateString()}</p>
                                    )}
                                    {expiryDate && (
                                      <p className={`text-[9px] font-extrabold pt-0.5 border-t border-slate-200/60 ${isExpired ? "text-rose-600" : "text-emerald-700"}`}>
                                        {isExpired ? `Expired on: ${expiryDate.toLocaleDateString()}` : `Expires: ${expiryDate.toLocaleDateString()}`}
                                      </p>
                                    )}
                                    <button
                                       onClick={async () => {
                                         const newEnd = expiryDate ? new Date(expiryDate) : new Date();
                                         newEnd.setMonth(newEnd.getMonth() + 1);
                                         const updatedPlan = {
                                           ...u.selectedPlan,
                                           startDate: u.selectedPlan.startDate || new Date(),
                                           endDate: newEnd,
                                         };
                                         await fetch("/api/admin/users", {
                                           method: "PUT",
                                           headers: { "Content-Type": "application/json" },
                                           body: JSON.stringify({ userId: u._id, selectedPlan: updatedPlan, status: "ACTIVE" })
                                         });
                                         fetchData();
                                         if (typeof setToast === "function") setToast(`✅ Renewed subscription for ${u.name} (+1 Month)`);
                                       }}
                                       className="mt-1 px-2 py-1 text-[9px] font-extrabold bg-teal-700 hover:bg-teal-800 text-white rounded cursor-pointer transition-all flex items-center gap-1 w-full justify-center shadow-xs"
                                       title="Extend customer subscription by 1 month in database"
                                     >
                                       <RefreshCcw className="w-2.5 h-2.5" /> Extend / Renew (+1 Mo)
                                     </button>
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic font-semibold">No Active Plan</span>
                                )}
                              </td>
                              <td className="p-4 space-y-1">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border block w-fit ${u.status === "ACTIVE" ? "bg-teal-50 text-teal-700 border-teal-200" : "bg-slate-200 text-slate-600 border-slate-300"
                                  }`}>
                                  {u.status === "ACTIVE" ? "ACCOUNT ACTIVE" : "DEACTIVATED"}
                                </span>
                                {hasPlan ? (
                                  <span className={`text-[8px] font-extrabold uppercase block ${isExpired ? "text-rose-600" : "text-emerald-600"}`}>
                                    {isExpired ? "• Plan Expired" : "• Plan Active"}
                                  </span>
                                ) : (
                                  <span className="text-[8px] text-slate-400 block">• No Plan</span>
                                )}
                              </td>
                              <td className="p-4 text-slate-450">{new Date(u.createdAt).toLocaleDateString()}</td>
                              <td className="p-4">
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={() => {
                                      setSelectedUser(u);
                                      setUserForm({
                                        name: u.name,
                                        email: u.email,
                                        mobile: u.mobile || "",
                                        address: u.address || "",
                                        password: "",
                                        accountType: u.accountType || "Individual User",
                                        status: u.status || "ACTIVE",
                                        role: u.role || "user",
                                        selectedPlan: {
                                          bedType: u.selectedPlan?.bedType || "",
                                          planName: u.selectedPlan?.planName || "",
                                          price: u.selectedPlan?.price !== undefined ? u.selectedPlan.price : "",
                                          duration: u.selectedPlan?.duration || "",
                                          startDate: u.selectedPlan?.startDate ? new Date(u.selectedPlan.startDate).toISOString().split('T')[0] : ""
                                        }
                                      });
                                      setShowUserModal(true);
                                    }}
                                    className="p-1 px-2 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-800 border border-slate-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                                    title="Edit Customer Details"
                                  >
                                    <Edit className="h-3 w-3" /> Edit
                                  </button>
                                  <button
                                    onClick={() => toggleUserStatus(u._id, u.status || "ACTIVE")}
                                    className={`px-2.5 py-1 text-[10px] font-bold border rounded-lg transition-all cursor-pointer ${
                                      (u.status || "ACTIVE") === "ACTIVE"
                                        ? "bg-slate-50 hover:bg-rose-50 text-slate-650 hover:text-rose-700 border-slate-200 hover:border-rose-200"
                                        : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300"
                                    }`}
                                  >
                                    {(u.status || "ACTIVE") === "ACTIVE" ? "Deactivate" : "Activate Account"}
                                  </button>
                                  {u.role !== "admin" && (
                                    <button
                                      onClick={() => deleteUser(u._id)}
                                      className="p-1.5 text-slate-450 hover:text-red-650 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                                      title="Delete Customer Account"
                                    >
                                      <Trash2 className="h-4.5 w-4.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      {usersList.length === 0 && (
                        <tr>
                          <td colSpan="7" className="text-center p-8 text-slate-400">No customers registered.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: STAFF APPROVALS */}
          {activeTab === "Staff Approvals" && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 leading-none mb-1">Staff Approvals</h1>
                  <p className="text-xs text-slate-500">Review and approve warehouse manager and logistics partner registrations</p>
                </div>
                <button
                  onClick={() => {
                    setStaffForm({ name: "", email: "", mobile: "", role: "WH", status: "PENDING" });
                    setShowStaffModal(true);
                  }}
                  className="py-2.5 px-5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all shadow-md shadow-teal-500/10 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Add Staff Member
                </button>
              </div>

              {/* Stats overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">WH Pending</span>
                  <h3 className="text-xl font-black text-amber-600 mt-1">{staffList.filter(s => s.role === 'WH' && s.status === 'PENDING').length}</h3>
                </div>
                <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">WH Approved</span>
                  <h3 className="text-xl font-black text-teal-600 mt-1">{staffList.filter(s => s.role === 'WH' && s.status === 'APPROVED').length}</h3>
                </div>
                <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">LP Pending</span>
                  <h3 className="text-xl font-black text-amber-600 mt-1">{staffList.filter(s => s.role === 'LP' && s.status === 'PENDING').length}</h3>
                </div>
                <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">LP Approved</span>
                  <h3 className="text-xl font-black text-teal-600 mt-1">{staffList.filter(s => s.role === 'LP' && s.status === 'APPROVED').length}</h3>
                </div>
              </div>

              {/* Tabs for staff selection */}
              <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div className="flex border-b border-slate-100 gap-6">
                    <button
                      onClick={() => setStaffTypeFilter("WH")}
                      className={`pb-3 text-xs font-extrabold tracking-wider uppercase transition-all cursor-pointer ${staffTypeFilter === "WH" ? "text-teal-600 border-b-2 border-teal-600" : "text-slate-400 hover:text-slate-600"
                        }`}
                    >
                      Warehouse Managers
                    </button>
                    <button
                      onClick={() => setStaffTypeFilter("LP")}
                      className={`pb-3 text-xs font-extrabold tracking-wider uppercase transition-all cursor-pointer ${staffTypeFilter === "LP" ? "text-teal-600 border-b-2 border-teal-600" : "text-slate-400 hover:text-slate-600"
                        }`}
                    >
                      Logistics Partners
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-2xs text-slate-400 font-bold uppercase">Filter Status:</span>
                    <select
                      value={staffStatusFilter}
                      onChange={(e) => setStaffStatusFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-2xs font-bold text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer"
                    >
                      <option value="ALL">All Statuses</option>
                      <option value="PENDING">PENDING</option>
                      <option value="APPROVED">APPROVED</option>
                      <option value="REJECTED">REJECTED</option>
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                        <th className="p-4 font-bold">Name</th>
                        <th className="p-4 font-bold">Email & System Account</th>
                        <th className="p-4 font-bold">Mobile</th>
                        <th className="p-4 font-bold">Status</th>
                        <th className="p-4 font-bold">Registered Date</th>
                        <th className="p-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {staffList
                        .filter(s => s.role === staffTypeFilter && (staffStatusFilter === "ALL" || s.status === staffStatusFilter))
                        .map(s => {
                          const userAcc = usersList.find(u => u.email === s.email);
                          return (
                            <tr key={s._id} className="hover:bg-slate-50/40 transition-colors">
                              <td className="p-4 font-bold text-slate-900">{s.name}</td>
                              <td className="p-4 text-slate-650 space-y-1">
                                <p className="font-semibold text-slate-800">{s.email}</p>
                                {userAcc ? (
                                  <div className="text-[10px] bg-teal-50 text-teal-700 border border-teal-200 px-2 py-0.5 rounded-md inline-block">
                                    <p className="font-extrabold uppercase">Login Account Active ({userAcc.role})</p>
                                  </div>
                                ) : s.status === "APPROVED" ? (
                                  <button
                                    onClick={async () => {
                                      await updateStaffStatus(s._id, "APPROVED");
                                    }}
                                    className="text-[10px] text-teal-600 hover:text-teal-700 font-extrabold flex items-center gap-1 cursor-pointer"
                                    title="Click to manually provision credentials"
                                  >
                                    Provision Login Credentials
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-slate-400 font-medium italic">Awaiting Approval</span>
                                )}
                              </td>
                              <td className="p-4 text-slate-500 font-medium">{s.mobile}</td>
                              <td className="p-4">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${s.status === "APPROVED" ? "bg-teal-50 text-teal-650 border-teal-200" :
                                    s.status === "PENDING" ? "bg-amber-50 text-amber-650 border-amber-200" :
                                      "bg-rose-50 text-rose-700 border-rose-200"
                                  }`}>
                                  {s.status}
                                </span>
                              </td>
                              <td className="p-4 text-slate-450">{new Date(s.registeredAt).toLocaleDateString()}</td>
                              <td className="p-4 text-right">
                                <div className="flex gap-1.5 justify-end">
                                  {s.status !== "APPROVED" && (
                                    <button
                                      onClick={() => updateStaffStatus(s._id, "APPROVED")}
                                      className="p-1 bg-teal-50 text-teal-650 hover:bg-teal-100 border border-teal-200/50 rounded transition-all cursor-pointer"
                                      title="Approve"
                                    >
                                      <Check className="h-4 w-4" />
                                    </button>
                                  )}
                                  {s.status !== "REJECTED" && (
                                    <button
                                      onClick={() => updateStaffStatus(s._id, "REJECTED")}
                                      className="p-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/50 rounded transition-all cursor-pointer"
                                      title="Reject"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      {staffList.filter(s => s.role === staffTypeFilter).length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center p-8 text-slate-400">No staff found for selection.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: QUOTES */}
          {activeTab === "Quotes" && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h1 className="text-2xl font-black text-slate-900 leading-none mb-1">Quotes Management</h1>
                <p className="text-xs text-slate-500">Manage connection requests and quotation submissions from customers</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Connection Requests</span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">{quotesList.filter(q => q.type === 'connection').length}</h3>
                </div>
                <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Quotation Requests</span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">{quotesList.filter(q => q.type === 'quotation').length}</h3>
                </div>
                <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Quotes</span>
                  <h3 className="text-xl font-black text-teal-600 mt-1">{quotesList.length}</h3>
                </div>
              </div>

              {/* Quote Type Toggle Tabs */}
              <div className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
                <div className="flex border-b border-slate-100 gap-6 mb-6">
                  <button
                    onClick={() => setQuoteTypeTab("connection")}
                    className={`pb-3 text-xs font-extrabold tracking-wider uppercase transition-all cursor-pointer ${quoteTypeTab === "connection" ? "text-teal-600 border-b-2 border-teal-600" : "text-slate-400 hover:text-slate-600"
                      }`}
                  >
                    Connection Details ({quotesList.filter(q => q.type === 'connection').length})
                  </button>
                  <button
                    onClick={() => setQuoteTypeTab("quotation")}
                    className={`pb-3 text-xs font-extrabold tracking-wider uppercase transition-all cursor-pointer ${quoteTypeTab === "quotation" ? "text-teal-600 border-b-2 border-teal-600" : "text-slate-400 hover:text-slate-600"
                      }`}
                  >
                    Quotation Details ({quotesList.filter(q => q.type === 'quotation').length})
                  </button>
                </div>

                {quoteTypeTab === "connection" ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                          <th className="p-4 font-bold">Business Name</th>
                          <th className="p-4 font-bold">Contact Person</th>
                          <th className="p-4 font-bold">Email</th>
                          <th className="p-4 font-bold">Phone</th>
                          <th className="p-4 font-bold">Business Type</th>
                          <th className="p-4 font-bold">Message</th>
                          <th className="p-4 font-bold">Received</th>
                          <th className="p-4 font-bold">Status</th>
                          <th className="p-4 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {quotesList
                          .filter(q => q.type === "connection")
                          .map(q => (
                            <tr key={q._id} className="hover:bg-slate-50/40 transition-colors">
                              <td className="p-4 font-black text-slate-900">{q.businessName}</td>
                              <td className="p-4 font-bold text-slate-600">{q.contactPerson}</td>
                              <td className="p-4 text-slate-500">{q.email}</td>
                              <td className="p-4 text-slate-500">{q.phone}</td>
                              <td className="p-4 text-slate-500 font-bold uppercase">{q.businessType}</td>
                              <td className="p-4 text-slate-600 truncate max-w-[150px]" title={q.message}>{q.message || "—"}</td>
                              <td className="p-4 text-slate-450">{new Date(q.receivedAt).toLocaleDateString()}</td>
                              <td className="p-4">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${q.status === "ACCEPTED" ? "bg-teal-50 text-teal-650 border-teal-200" :
                                    q.status === "CONTACTED" ? "bg-blue-50 text-blue-650 border-blue-200" :
                                      "bg-amber-50 text-amber-650 border-amber-200"
                                  }`}>
                                  {q.status}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex gap-2 justify-end items-center">
                                  <button
                                    onClick={() => {
                                      setSelectedQuote(q);
                                      setQuoteReplySubject(`Re: ClosetRush Partnership Inquiry - ${q.businessName}`);
                                      setQuoteReplyMessage(`Hi ${q.contactPerson},\n\nThank you for reaching out to ClosetRush regarding partnership options. We received your request for your business (${q.businessName})...\n\nBest regards,\nClosetRush Corporate Operations`);
                                    }}
                                    className="px-2.5 py-1 bg-teal-650 hover:bg-teal-700 text-white text-[10px] font-bold rounded-lg shadow-xs transition-all active:scale-98 cursor-pointer"
                                  >
                                    Open & Respond
                                  </button>
                                  <select
                                    value={q.status}
                                    onChange={(e) => updateQuoteStatus(q._id, e.target.value)}
                                    className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-2xs text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer"
                                  >
                                    <option value="PENDING">PENDING</option>
                                    <option value="CONTACTED">CONTACTED</option>
                                    <option value="ACCEPTED">ACCEPTED</option>
                                  </select>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                          <th className="p-4 font-bold">Business Name</th>
                          <th className="p-4 font-bold">Contact Person</th>
                          <th className="p-4 font-bold">Email</th>
                          <th className="p-4 font-bold">Phone</th>
                          <th className="p-4 font-bold">Business Type</th>
                          <th className="p-4 font-bold">Properties</th>
                          <th className="p-4 font-bold">Bundles</th>
                          <th className="p-4 font-bold">Est. Total</th>
                          <th className="p-4 font-bold">Status</th>
                          <th className="p-4 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {quotesList
                          .filter(q => q.type === "quotation")
                          .map(q => (
                            <tr key={q._id} className="hover:bg-slate-50/40 transition-colors">
                              <td className="p-4 font-black text-slate-900">{q.businessName}</td>
                              <td className="p-4 font-bold text-slate-600">{q.contactPerson}</td>
                              <td className="p-4 text-slate-500">{q.email}</td>
                              <td className="p-4 text-slate-500">{q.phone}</td>
                              <td className="p-4 text-slate-500 font-bold uppercase">{q.businessType}</td>
                              <td className="p-4 space-y-0.5 text-[10px] text-slate-450 font-medium">
                                <p>{q.propertiesCount || 0} properties</p>
                                <p>{q.unitsCount || 0} units</p>
                              </td>
                              <td className="p-4 text-slate-600">{q.bundleSelections}</td>
                              <td className="p-4 font-black text-teal-600">{q.estimatedTotal ? `₹${q.estimatedTotal.toLocaleString()}` : "N/A"}</td>
                              <td className="p-4">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${q.status === "QUOTE SENT" ? "bg-teal-50 text-teal-650 border-teal-200" :
                                    q.status === "NEGOTIATING" ? "bg-blue-50 text-blue-650 border-blue-200" :
                                      "bg-amber-50 text-amber-650 border-amber-200"
                                  }`}>
                                  {q.status}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex gap-2 justify-end items-center">
                                  <button
                                    onClick={() => {
                                      setSelectedQuote(q);
                                      setQuotePrice(q.priceQuote || 0);
                                      setQuoteReplySubject(`Re: ClosetRush Service Proposal for ${q.businessName}`);
                                      setQuoteReplyMessage(`Hi ${q.contactPerson},\n\nWe have generated a custom proposal for your business (${q.businessName}) consisting of ${q.propertiesCount} properties and ${q.unitsCount} units.\n\nSelections: ${q.bundleSelections}\nEstimated Total: ₹${q.estimatedTotal ? q.estimatedTotal.toLocaleString() : "0"}\n\nLet's connect to finalize the terms!\n\nBest regards,\nClosetRush B2B Sales Team`);
                                    }}
                                    className="px-2.5 py-1 bg-teal-650 hover:bg-teal-700 text-white text-[10px] font-bold rounded-lg shadow-xs transition-all active:scale-98 cursor-pointer"
                                  >
                                    Open & Respond
                                  </button>
                                  <select
                                    value={q.status}
                                    onChange={(e) => updateQuoteStatus(q._id, e.target.value)}
                                    className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-2xs text-slate-805 focus:outline-none focus:border-teal-500 cursor-pointer font-bold animate-pulse-slow"
                                  >
                                    <option value="PENDING">PENDING</option>
                                    <option value="NEGOTIATING">NEGOTIATING</option>
                                    <option value="QUOTE SENT">QUOTE SENT</option>
                                    <option value="ACCEPTED">ACCEPTED</option>
                                    <option value="CONFIRMED">CONFIRMED (Paid)</option>
                                    <option value="CANCELLED">CANCELLED (Rejected)</option>
                                  </select>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: SUPPORT TICKETS */}
          {activeTab === "Support Tickets" && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 leading-none mb-1">Support Tickets</h1>
                  <p className="text-xs text-slate-500">View and respond to client assistance tickets</p>
                </div>
                <button
                  onClick={() => setShowTicketModal(true)}
                  className="py-2.5 px-5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all shadow-md shadow-teal-500/10 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Create Ticket
                </button>
              </div>

              {/* Filters */}
              <div className="bg-white border border-slate-200/60 p-6 rounded-3xl flex flex-wrap items-center gap-4 shadow-xs">
                <div className="flex items-center gap-2">
                  <span className="text-2xs text-slate-500 font-bold uppercase">Status:</span>
                  <select
                    value={ticketStatusFilter}
                    onChange={(e) => setTicketStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-2xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xs text-slate-550 font-bold uppercase">Priority:</span>
                  <select
                    value={ticketPriorityFilter}
                    onChange={(e) => setTicketPriorityFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-2xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="ALL">All Priorities</option>
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 bg-slate-50/50">
                        <th className="p-4 font-bold">Ticket ID</th>
                        <th className="p-4 font-bold">Subject</th>
                        <th className="p-4 font-bold">User Details</th>
                        <th className="p-4 font-bold">Priority</th>
                        <th className="p-4 font-bold">Status</th>
                        <th className="p-4 font-bold">Created</th>
                        <th className="p-4 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ticketsList
                        .filter(t => {
                          const matchesStatus = ticketStatusFilter === "ALL" || t.status === ticketStatusFilter;
                          const matchesPriority = ticketPriorityFilter === "ALL" || t.priority === ticketPriorityFilter;
                          return matchesStatus && matchesPriority;
                        })
                        .map(t => (
                          <tr key={t._id} className="hover:bg-slate-50/40 transition-colors">
                            <td className="p-4 font-black text-slate-900">{t.ticketId}</td>
                            <td className="p-4 text-slate-800 font-semibold">{t.subject}</td>
                            <td className="p-4 space-y-0.5">
                              <p className="font-bold text-slate-700">{t.userName}</p>
                              <p className="text-[10px] text-slate-400">{t.userEmail}</p>
                            </td>
                            <td className="p-4">
                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${t.priority === "CRITICAL" ? "bg-red-50 text-red-750 border-red-200" :
                                  t.priority === "HIGH" ? "bg-amber-50 text-amber-650 border-amber-200" :
                                    t.priority === "MEDIUM" ? "bg-blue-50 text-blue-650 border-blue-200" :
                                      "bg-slate-100 text-slate-550 border-slate-200"
                                }`}>
                                {t.priority}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className={`text-[9px] font-black uppercase px-2.5 py-0.8 rounded-full border ${t.status === "CLOSED" ? "bg-slate-100 text-slate-500 border-slate-200" :
                                  t.status === "IN_PROGRESS" ? "bg-blue-50 text-blue-650 border-blue-200/50" :
                                    "bg-teal-50 text-teal-650 border-teal-200/50"
                                }`}>
                                {t.status}
                              </span>
                            </td>
                            <td className="p-4 text-slate-450">{new Date(t.createdAt).toLocaleDateString()}</td>
                            <td className="p-4 text-right">
                              <div className="flex gap-2 justify-end items-center">
                                <button
                                  onClick={() => {
                                    setSelectedTicket(t);
                                    setReplySubject(`Re: Ticket ${t.ticketId} - ${t.subject}`);
                                    setReplyMessage("");
                                  }}
                                  className="px-2.5 py-1 bg-teal-650 hover:bg-teal-700 text-white text-[10px] font-bold rounded-lg shadow-xs transition-all active:scale-98 cursor-pointer"
                                >
                                  Open & Reply
                                </button>
                                <select
                                  value={t.status}
                                  onChange={(e) => updateTicketStatus(t._id, e.target.value)}
                                  className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-2xs text-slate-800 focus:outline-none cursor-pointer"
                                >
                                  <option value="OPEN">OPEN</option>
                                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                                  <option value="CLOSED">CLOSED</option>
                                </select>
                                <select
                                  value={t.priority}
                                  onChange={(e) => updateTicketPriority(t._id, e.target.value)}
                                  className="bg-slate-50 border border-slate-200 rounded px-2 py-1 text-2xs text-slate-800 focus:outline-none cursor-pointer"
                                >
                                  <option value="LOW">LOW</option>
                                  <option value="MEDIUM">MEDIUM</option>
                                  <option value="HIGH">HIGH</option>
                                  <option value="CRITICAL">CRITICAL</option>
                                </select>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {ticketsList.length === 0 && (
                        <tr>
                          <td colSpan="7" className="text-center p-8 text-slate-400">No support tickets found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: REFUNDS */}
          {activeTab === "Refunds" && (
            <div className="space-y-8 animate-fadeIn text-slate-800">
              <div>
                <h1 className="text-2xl font-black text-slate-900 leading-none mb-1">Refund Requests & Deposit Returns</h1>
                <p className="text-xs text-slate-550">Manage and track security deposit returns for cancelled subscription plans</p>
              </div>

              {/* Stats overview cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Claims</span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">{refundsList.length}</h3>
                </div>
                <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pending Returns</span>
                  <h3 className="text-xl font-black text-amber-600 mt-1">{refundsList.filter(r => r.status === 'PENDING').length}</h3>
                </div>
                <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Refunded Amount</span>
                  <h3 className="text-xl font-black text-teal-650 mt-1">
                    ₹{refundsList.filter(r => r.status === 'REFUNDED').reduce((sum, r) => sum + r.depositAmount, 0).toLocaleString()}
                  </h3>
                </div>
                <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Refunded Claims</span>
                  <h3 className="text-xl font-black text-blue-600 mt-1">{refundsList.filter(r => r.status === 'REFUNDED').length}</h3>
                </div>
              </div>

              {/* Search & Filters */}
              <div className="bg-white border border-slate-200/60 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    value={refundsSearch}
                    onChange={(e) => setRefundsSearch(e.target.value)}
                    placeholder="Search by customer name, email, or phone..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-xs placeholder-slate-400 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xs text-slate-500 font-bold uppercase">Status:</span>
                  <select
                    value={refundsStatusFilter}
                    onChange={(e) => setRefundsStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs font-bold text-slate-850 focus:outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="ALL">All Claims</option>
                    <option value="PENDING">PENDING</option>
                    <option value="REFUNDED">REFUNDED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-550 bg-slate-50/50 font-semibold">
                        <th className="p-4 font-bold">Customer Info</th>
                        <th className="p-4 font-bold">Plan Name</th>
                        <th className="p-4 font-bold">Refund Due</th>
                        <th className="p-4 font-bold">Status</th>
                        <th className="p-4 font-bold">Dates & Reference</th>
                        <th className="p-4 font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {refundsList
                        .filter(r => {
                          const query = refundsSearch.toLowerCase();
                          const matchesQuery =
                            r.userName.toLowerCase().includes(query) ||
                            r.userEmail.toLowerCase().includes(query) ||
                            (r.userPhone || "").includes(query);
                          const matchesStatus = refundsStatusFilter === "ALL" || r.status === refundsStatusFilter;
                          return matchesQuery && matchesStatus;
                        })
                        .map(r => (
                          <tr key={r._id} className="hover:bg-slate-50/40 transition-colors">
                            <td className="p-4 space-y-0.5">
                              <p className="font-bold text-slate-805">{r.userName}</p>
                              <p className="text-[10px] text-slate-400">{r.userEmail}</p>
                              <p className="text-[10px] text-slate-400">{r.userPhone || "—"}</p>
                            </td>
                            <td className="p-4 font-bold text-slate-700">{r.planName}</td>
                            <td className="p-4 font-extrabold text-teal-605">₹{r.depositAmount}</td>
                            <td className="p-4">
                              <span className={`text-[9px] font-black uppercase px-2.5 py-0.8 rounded-full border ${
                                r.status === "PENDING" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                r.status === "REFUNDED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                "bg-rose-50 text-rose-700 border-rose-200"
                              }`}>
                                {r.status}
                              </span>
                            </td>
                            <td className="p-4 space-y-1 text-[10px] text-slate-500 font-medium">
                              <p>Cancelled: {new Date(r.cancelledAt).toLocaleDateString()}</p>
                              {r.refundedAt && <p>Processed: {new Date(r.refundedAt).toLocaleDateString()}</p>}
                              {r.transactionId && <p className="text-teal-600 font-bold">TxID: {r.transactionId}</p>}
                            </td>
                            <td className="p-4">
                              <div className="flex gap-2 items-center">
                                {r.status === "PENDING" && (
                                  <>
                                    {editingRefundId === r._id ? (
                                      <div className="flex gap-1.5 items-center">
                                        <input
                                          type="text"
                                          placeholder="Transaction ID / Ref"
                                          value={refundTxId}
                                          onChange={(e) => setRefundTxId(e.target.value)}
                                          className="bg-white border border-slate-300 rounded px-2 py-1 text-2xs text-slate-800 focus:outline-none"
                                        />
                                        <button
                                          onClick={() => updateRefundStatus(r._id, "REFUNDED", refundTxId)}
                                          className="px-2 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded text-3xs font-extrabold uppercase transition-all cursor-pointer"
                                        >
                                          Save
                                        </button>
                                        <button
                                          onClick={() => setEditingRefundId(null)}
                                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-650 rounded text-3xs font-bold uppercase transition-all cursor-pointer"
                                        >
                                          X
                                        </button>
                                      </div>
                                    ) : (
                                      <>
                                        <button
                                          onClick={() => {
                                            setEditingRefundId(r._id);
                                            setRefundTxId("");
                                          }}
                                          className="px-2 py-1 bg-teal-50 hover:bg-teal-100 text-teal-700 text-[10px] font-bold border border-teal-200 rounded-lg transition-colors cursor-pointer"
                                        >
                                          Mark Refunded
                                        </button>
                                        <button
                                          onClick={() => updateRefundStatus(r._id, "REJECTED")}
                                          className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold border border-rose-200 rounded-lg transition-colors cursor-pointer"
                                        >
                                          Reject
                                        </button>
                                      </>
                                    )}
                                  </>
                                )}
                                <button
                                  onClick={() => deleteRefundEntry(r._id)}
                                  className="p-1 text-slate-450 hover:text-red-650 transition-colors cursor-pointer"
                                  title="Delete Record"
                                >
                                  <Trash2 className="h-4.5 w-4.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {refundsList.length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center p-8 text-slate-400">No refund requests found.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: WAITLIST */}
          {activeTab === "Waitlist" && (
            <div className="space-y-8 animate-fadeIn text-slate-800">
              <div>
                <h1 className="text-2xl font-black text-slate-900 leading-none mb-1">Priority Waitlist</h1>
                <p className="text-xs text-slate-550">Manage waitlist subscriptions and client leads</p>
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total waitlist</span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">{waitlistList.length}</h3>
                </div>
                <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Pending</span>
                  <h3 className="text-xl font-black text-amber-600 mt-1">{waitlistList.filter(w => w.status === 'PENDING').length}</h3>
                </div>
                <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Contacted</span>
                  <h3 className="text-xl font-black text-blue-600 mt-1">{waitlistList.filter(w => w.status === 'CONTACTED').length}</h3>
                </div>
                <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Converted</span>
                  <h3 className="text-xl font-black text-teal-650 mt-1">{waitlistList.filter(w => w.status === 'CONVERTED').length}</h3>
                </div>
              </div>

              {/* Search and Filters */}
              <div className="bg-white border border-slate-200/60 p-6 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
                  <input
                    type="text"
                    value={waitlistSearch}
                    onChange={(e) => setWaitlistSearch(e.target.value)}
                    placeholder="Search by email or phone number..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-11 pr-4 py-2.5 text-xs placeholder-slate-400 text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xs text-slate-500 font-bold uppercase">Status:</span>
                  <select
                    value={waitlistStatusFilter}
                    onChange={(e) => setWaitlistStatusFilter(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs font-bold text-slate-850 focus:outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="ALL">All Entries</option>
                    <option value="PENDING">PENDING</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="CONVERTED">CONVERTED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white border border-slate-200/60 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-550 bg-slate-50/50 font-semibold">
                        <th className="p-4 font-bold">Email Address</th>
                        <th className="p-4 font-bold">Phone Number</th>
                        <th className="p-4 font-bold">Status</th>
                        <th className="p-4 font-bold">Joined Date</th>
                        <th className="p-4 font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {waitlistList
                        .filter(w => {
                          const query = waitlistSearch.toLowerCase();
                          const matchesQuery =
                            w.email.toLowerCase().includes(query) ||
                            w.phone.includes(query);
                          const matchesStatus = waitlistStatusFilter === "ALL" || w.status === waitlistStatusFilter;
                          return matchesQuery && matchesStatus;
                        })
                        .map(w => (
                          <tr key={w._id} className="hover:bg-slate-50/40 transition-colors">
                            <td className="p-4 font-bold text-slate-805">{w.email}</td>
                            <td className="p-4 font-bold text-slate-600">{w.phone}</td>
                            <td className="p-4">
                              <select
                                value={w.status}
                                onChange={(e) => updateWaitlistStatus(w._id, e.target.value)}
                                className={`text-[9px] font-black uppercase px-2.5 py-1 rounded-full border cursor-pointer focus:outline-none ${
                                  w.status === "PENDING" ? "bg-amber-50 text-amber-700 border-amber-250" :
                                  w.status === "CONTACTED" ? "bg-blue-50 text-blue-750 border-blue-250" :
                                  w.status === "CONVERTED" ? "bg-emerald-50 text-emerald-700 border-emerald-250" :
                                  "bg-rose-50 text-rose-700 border-rose-250"
                                }`}
                              >
                                <option value="PENDING">PENDING</option>
                                <option value="CONTACTED">CONTACTED</option>
                                <option value="CONVERTED">CONVERTED</option>
                                <option value="CANCELLED">CANCELLED</option>
                              </select>
                            </td>
                            <td className="p-4 text-slate-400 font-semibold">
                              {new Date(w.joinedAt || w.createdAt).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => deleteWaitlistEntry(w._id)}
                                className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-650 font-bold border border-rose-200/50 rounded-lg transition-colors cursor-pointer text-[10px] flex items-center gap-1"
                                title="Delete Waitlist Entry"
                              >
                                <Trash2 className="h-3 w-3" /> Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      {waitlistList.length === 0 && (
                        <tr>
                          <td colSpan="5" className="text-center p-8 text-slate-400">No waitlist entries registered.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BRAND SETTINGS */}
          {activeTab === "Brand Settings" && (
            <div className="space-y-8 animate-fadeIn">
              <div>
                <h1 className="text-2xl font-black text-slate-900 leading-none mb-1">Brand & Deposit Configurations</h1>
                <p className="text-xs text-slate-500">Edit dynamic system parameters, client deposits, color palettes, and contact email settings</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Form configuration card */}
                <form onSubmit={handleSaveSettings} className="lg:col-span-8 bg-white border border-slate-200/60 rounded-3xl p-8 shadow-sm space-y-6">
                  <h3 className="font-extrabold text-slate-950 text-sm uppercase tracking-wider">System Settings Form</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-2xs text-slate-450 font-bold uppercase block">Brand Name</label>
                      <input
                        type="text"
                        required
                        value={settingsForm.brandName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, brandName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-semibold"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-2xs text-slate-450 font-bold uppercase block">Contact Support Email</label>
                      <input
                        type="email"
                        required
                        value={settingsForm.contactEmail}
                        onChange={(e) => setSettingsForm({ ...settingsForm, contactEmail: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-semibold"
                      />
                    </div>
                  </div>


                  <div className="space-y-1.5 border-t border-slate-100 pt-6">
                    <label className="text-2xs text-slate-450 font-bold uppercase block">PWA Install Banner Text</label>
                    <input
                      type="text"
                      value={settingsForm.installBannerText}
                      onChange={(e) => setSettingsForm({ ...settingsForm, installBannerText: e.target.value })}
                      placeholder="Add to home screen for a better experience"
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-semibold"
                    />
                  </div>

                  <div className="flex items-center gap-2.5 py-2">
                    <input
                      type="checkbox"
                      id="installBannerActive"
                      checked={settingsForm.installBannerActive}
                      onChange={(e) => setSettingsForm({ ...settingsForm, installBannerActive: e.target.checked })}
                      className="rounded text-teal-600 focus:ring-teal-500 h-4.5 w-4.5 cursor-pointer"
                    />
                    <label htmlFor="installBannerActive" className="text-xs text-slate-600 font-bold select-none cursor-pointer">
                      Enable PWA installation banner prompt on client browsers
                    </label>
                  </div>

                  {/* Plan Payment Styles Section */}
                  <div className="border-t border-slate-100 pt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider">Plan Payment Styles</h4>
                        <p className="text-[10px] text-slate-400 font-medium">Configure base deposit amounts, payment models, descriptions, and commission rates</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddPaymentStyle}
                        className="py-1.5 px-3 bg-teal-50 text-teal-750 hover:bg-teal-100 rounded-xl font-bold text-2xs uppercase flex items-center gap-1 transition-all cursor-pointer border border-teal-200/50"
                      >
                        <Plus className="h-3 w-3" /> Add Style
                      </button>
                    </div>

                    {/* Base Deposit Amounts */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-900 rounded-2xl">
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 font-bold uppercase block">Single Bed Base Deposit (₹)</label>
                        <input
                          type="number"
                          value={settingsForm.singleBedDeposit}
                          onChange={(e) => setSettingsForm({ ...settingsForm, singleBedDeposit: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white font-black focus:outline-none focus:border-teal-500 transition-all"
                        />
                        <p className="text-[9px] text-slate-500 font-medium">Deposit charged for Single bed sizes when multiplier is 1x</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] text-slate-400 font-bold uppercase block">Double Bed Base Deposit (₹)</label>
                        <input
                          type="number"
                          value={settingsForm.doubleBedDeposit}
                          onChange={(e) => setSettingsForm({ ...settingsForm, doubleBedDeposit: e.target.value })}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-3 text-sm text-white font-black focus:outline-none focus:border-teal-500 transition-all"
                        />
                        <p className="text-[9px] text-slate-500 font-medium">Deposit charged for Double/Queen/King bed sizes when multiplier is 1x</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {(settingsForm.paymentStyles || [
                        { id: "Monthly", name: "Standard Monthly", description: "Requires refundable security deposit of ₹{deposit}", depositMultiplier: 1 },
                        { id: "Advance", name: "Advance Plan", description: "Pay full subscription upfront. Zero security deposit required.", depositMultiplier: 0 }
                      ]).map((style) => {
                        const isEditing = editingStyleId === style.id;
                        return (
                          <div key={style.id} className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl transition-all relative">
                            {isEditing ? (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div className="space-y-1">
                                    <label className="text-[9px] text-slate-405 font-bold uppercase block">Style ID (Unique)</label>
                                    <input
                                      type="text"
                                      value={editStyleForm.id}
                                      onChange={(e) => setEditStyleForm({ ...editStyleForm, id: e.target.value })}
                                      placeholder="e.g. Monthly"
                                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-[11px] text-slate-800 font-bold focus:outline-none focus:border-teal-500"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] text-slate-405 font-bold uppercase block">Display Name</label>
                                    <input
                                      type="text"
                                      value={editStyleForm.name}
                                      onChange={(e) => setEditStyleForm({ ...editStyleForm, name: e.target.value })}
                                      placeholder="e.g. Standard Monthly"
                                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-[11px] text-slate-800 font-bold focus:outline-none focus:border-teal-500"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] text-slate-405 font-bold uppercase block">Deposit Multiplier</label>
                                    <input
                                      type="number"
                                      step="0.1"
                                      value={editStyleForm.depositMultiplier}
                                      onChange={(e) => setEditStyleForm({ ...editStyleForm, depositMultiplier: parseFloat(e.target.value) || 0 })}
                                      placeholder="1 for 100%, 0 for zero deposit"
                                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-[11px] text-slate-800 font-bold focus:outline-none focus:border-teal-500"
                                    />
                                  </div>
                                  <div className="space-y-1">
                                    <label className="text-[9px] text-slate-405 font-bold uppercase block">Commission Rate (%)</label>
                                    <input
                                      type="number"
                                      step="1"
                                      min="0"
                                      max="100"
                                      value={editStyleForm.commissionRate ?? 0}
                                      onChange={(e) => setEditStyleForm({ ...editStyleForm, commissionRate: parseFloat(e.target.value) || 0 })}
                                      placeholder="e.g. 10"
                                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-[11px] text-slate-800 font-bold focus:outline-none focus:border-teal-500"
                                    />
                                  </div>
                                </div>

                                <div className="space-y-1">
                                  <label className="text-[9px] text-slate-455 font-bold uppercase block">Description</label>
                                  <input
                                    type="text"
                                    value={editStyleForm.description}
                                    onChange={(e) => setEditStyleForm({ ...editStyleForm, description: e.target.value })}
                                    placeholder="Use {deposit} placeholder for dynamic deposit display"
                                    className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-[11px] text-slate-800 font-semibold focus:outline-none focus:border-teal-500"
                                  />
                                  <p className="text-[9px] text-slate-400 font-medium">Tip: Use <code>{"{deposit}"}</code> inside the text. It will dynamically calculate and show the deposit value (e.g. ₹800).</p>
                                </div>

                                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200/50">
                                  <button
                                    type="button"
                                    onClick={() => handleCancelStyleEdit(style.id)}
                                    className="py-1.5 px-3 text-slate-500 hover:bg-slate-200 rounded-xl text-3xs uppercase font-bold cursor-pointer"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveStyleEdit(style.id)}
                                    className="py-1.5 px-3 bg-teal-650 hover:bg-teal-700 text-white rounded-xl text-3xs uppercase font-bold cursor-pointer"
                                  >
                                    Done
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-between items-start">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-extrabold text-slate-800 text-[11px] uppercase tracking-wide">{style.name}</span>
                                    <span className="text-[9px] bg-slate-200 text-slate-600 font-bold px-1.5 py-0.5 rounded-md">ID: {style.id}</span>
                                    {style.depositMultiplier === 0 ? (
                                      <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-250 font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                                        Zero Deposit
                                      </span>
                                    ) : (
                                      <span className="text-[9px] bg-blue-50 text-blue-700 border border-blue-250 font-bold px-1.5 py-0.5 rounded-md">
                                        {style.depositMultiplier}x Deposit
                                      </span>
                                    )}
                                    <span className="text-[9px] bg-purple-50 text-purple-700 border border-purple-200 font-bold px-1.5 py-0.5 rounded-md">
                                      {style.commissionRate ?? 0}% Commission
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-550 font-semibold leading-relaxed">
                                    {(() => {
                                      let previewDesc = style.description || "";
                                      const doubleDepAmt = settingsForm.doubleBedDeposit * (style.depositMultiplier !== undefined ? style.depositMultiplier : 1);
                                      const singleDepAmt = settingsForm.singleBedDeposit * (style.depositMultiplier !== undefined ? style.depositMultiplier : 1);
                                      const replacementText = `${doubleDepAmt} (Double) / ₹${singleDepAmt} (Single)`;
                                      return previewDesc.includes("₹{deposit}")
                                        ? previewDesc.replace("₹{deposit}", `₹${replacementText}`)
                                        : previewDesc.replace("{deposit}", `₹${replacementText}`);
                                    })()}
                                  </p>
                                </div>

                                <div className="flex gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditStyle(style)}
                                    className="p-1 rounded-lg border border-slate-200 text-slate-500 hover:text-slate-805 bg-white cursor-pointer"
                                    title="Edit payment style"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeletePaymentStyle(style.id)}
                                    className="p-1 rounded-lg border border-slate-200 text-red-500 hover:text-red-700 bg-white cursor-pointer"
                                    title="Delete payment style"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex justify-end">
                    <button
                      type="submit"
                      className="py-3 px-8 bg-teal-650 hover:bg-teal-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all rounded-2xl shadow-md cursor-pointer"
                    >
                      Save Brand Configurations
                    </button>
                  </div>
                </form>

                {/* Right Column Help Notice card */}
                <div className="lg:col-span-4 space-y-6">
                  <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-sm border border-slate-800 space-y-3 font-sans">
                    <h4 className="font-extrabold text-xs uppercase tracking-widest text-linen-gold">Subscription Deposit Logic</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
                      Security deposits protect your linen inventory. These settings dynamically control:
                    </p>
                    <ul className="text-[10px] text-slate-300 space-y-2 list-disc list-inside leading-relaxed font-medium">
                      <li>B2C pricing breakdowns shown in checkout calculations.</li>
                      <li>Standard Monthly checkout upfront deposit totals.</li>
                      <li>Advance plan payment style bypasses deposits completely.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: COUPONS */}
          {activeTab === "Coupons" && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 leading-none mb-1">Coupon Manager</h1>
                  <p className="text-xs text-slate-500">Create, edit, toggle, and delete promotional discount coupons for B2C plans</p>
                </div>
                <button
                  onClick={() => {
                    setCouponForm({ id: "", code: "", discountType: "percentage", discountValue: "", minPurchase: 0, maxDiscount: "", startDate: "", endDate: "", isActive: true, usageLimit: "" });
                    setShowCouponModal(true);
                  }}
                  className="py-2.5 px-5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-500/10 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Add New Coupon
                </button>
              </div>

              {/* Coupons Search and List */}
              <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 shadow-sm space-y-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search coupon code..."
                      value={couponSearch}
                      onChange={(e) => setCouponSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:border-teal-500 focus:bg-white text-slate-800 placeholder-slate-400 font-semibold"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 uppercase tracking-wider font-extrabold text-[10px]">
                        <th className="pb-3.5 font-bold">Code</th>
                        <th className="pb-3.5 font-bold">Type</th>
                        <th className="pb-3.5 font-bold">Discount Value</th>
                        <th className="pb-3.5 font-bold">Min Purchase</th>
                        <th className="pb-3.5 font-bold">Expiry Date</th>
                        <th className="pb-3.5 font-bold">Usage Count / Limit</th>
                        <th className="pb-3.5 font-bold text-center">Status</th>
                        <th className="pb-3.5 text-right font-bold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
                      {couponsList
                        .filter(c => c.code.toLowerCase().includes(couponSearch.toLowerCase()))
                        .map((coupon) => (
                          <tr key={coupon._id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="py-4.5 font-black text-slate-900 tracking-wide text-sm">{coupon.code}</td>
                            <td className="py-4.5 capitalize text-slate-500">{coupon.discountType}</td>
                            <td className="py-4.5 text-slate-800 font-bold">
                              {coupon.discountType === "percentage" ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                              {coupon.maxDiscount ? ` (Max ₹${coupon.maxDiscount})` : ""}
                            </td>
                            <td className="py-4.5 text-slate-500">₹{coupon.minPurchase || 0}</td>
                            <td className="py-4.5 text-slate-500">
                              {coupon.endDate ? new Date(coupon.endDate).toLocaleDateString() : "Never Expires"}
                            </td>
                            <td className="py-4.5 text-slate-500">
                              {coupon.usedCount} / {coupon.usageLimit !== null ? coupon.usageLimit : "∞"}
                            </td>
                            <td className="py-4.5 text-center">
                              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                coupon.isActive 
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/50" 
                                  : "bg-slate-100 text-slate-500 border border-slate-200/50"
                              }`}>
                                {coupon.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="py-4.5 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleEditCoupon(coupon)}
                                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-855 shadow-xs cursor-pointer transition-colors"
                                  title="Edit Coupon"
                                >
                                  <Edit className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCoupon(coupon._id)}
                                  className="p-1.5 rounded-lg bg-white border border-slate-200 text-red-500 hover:text-red-700 shadow-xs cursor-pointer transition-colors"
                                  title="Delete Coupon"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      {couponsList.length === 0 && (
                        <tr>
                          <td colSpan="8" className="text-center p-8 text-slate-400">No promotional coupons configured yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PLANS */}
          {activeTab === "Plans" && (
            <div className="space-y-8 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 leading-none mb-1">Plans & Pricing</h1>
                  <p className="text-xs text-slate-500">Configure client bedding plans, pricing, features, and popularity highlights</p>
                </div>
                <button
                  onClick={() => {
                    setPlanForm({ id: "", bedType: categoriesList[0]?.name || "single", size: "", name: "", duration: "", price: "", originalPrice: "", discount: "", features: "", cta: "Choose Plan", popular: false, badge: "", securityDeposit: 0 });
                    setShowPlanModal(true);
                  }}
                  className="py-2.5 px-5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-500/10 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="h-4 w-4" /> Add New Plan
                </button>
              </div>

              {/* Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {(() => {
                  const allUniquePlanTypes = Array.from(new Set([
                    ...categoriesList.map(c => c.name),
                    ...plansList.map(p => p.bedType)
                  ])).filter(Boolean);

                  if (allUniquePlanTypes.length === 0) {
                    return (
                      <div className="col-span-full text-center py-20 text-slate-405 text-xs font-bold bg-white border border-slate-200/60 rounded-3xl">
                        No active categories or plans found. Click "Add New Plan" to configure plans.
                      </div>
                    );
                  }

                  return allUniquePlanTypes.map((type) => {
                    const filteredPlans = plansList.filter(p => p.bedType === type);
                    return (
                      <div key={type} className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-sm space-y-6 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                              <span className="h-2.5 w-2.5 rounded-full bg-teal-500"></span>
                              {type} Plans
                            </h3>
                            <span className="text-3xs font-black bg-slate-100 text-slate-650 px-2 py-0.5 rounded uppercase">
                              {filteredPlans.length} Plans
                            </span>
                          </div>

                          <div className="space-y-4">
                            {filteredPlans.map((plan) => (
                              <div key={plan._id} className="p-4 bg-slate-50 border border-slate-150 rounded-2xl relative hover:border-slate-250 transition-colors flex justify-between items-start">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-800 text-sm">{plan.tier} Tier</span>
                                    <span className="text-[10px] bg-slate-200 text-slate-600 font-extrabold px-1.5 py-0.5 rounded capitalize">{plan.bedType} Bed</span>
                                  </div>
                                  <div className="flex items-baseline gap-2 text-xs text-slate-500">
                                    <span className="text-slate-800 font-black text-sm">₹{plan.monthlyRate}/mo Rent</span>
                                    <span className="text-teal-600 font-extrabold text-[10px]">₹{plan.depositAmount} Deposit</span>
                                  </div>
                                </div>

                                <div className="flex gap-2 shrink-0">
                                  <button
                                    onClick={() => handleEditPlan(plan)}
                                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-slate-850 shadow-xs cursor-pointer transition-colors"
                                    title="Edit Plan"
                                  >
                                    <Edit className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeletePlan(plan._id)}
                                    className="p-1.5 rounded-lg bg-white border border-slate-200 text-red-500 hover:text-red-700 shadow-xs cursor-pointer transition-colors"
                                    title="Delete Plan"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                            {filteredPlans.length === 0 && (
                              <div className="text-center py-12 text-slate-400 text-xs">No {type} plans configured yet. Click "Add New Plan" to start.</div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

          {activeTab === "Warehouse Manager" && (
            <div className="space-y-8 animate-fadeIn text-slate-800">
              {/* Header */}
              <div>
                <h1 className="text-2xl font-serif font-bold text-charcoal-ink mb-1">Warehouse WMS Manager</h1>
                <p className="text-xs text-charcoal-ink/50 font-semibold uppercase tracking-wider">Linen packaging, SKU updates, QR logistics routing & thermodynamic laundry stages</p>
              </div>

              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Bundles</span>
                  <h3 className="text-xl font-black text-slate-900 mt-1">{bundlesList.length}</h3>
                </div>
                <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Docks Dispatch Pending</span>
                  <h3 className="text-xl font-black text-amber-600 mt-1">{bundlesList.filter(b => b.status === 'CREATED' || b.status === 'READY_TO_DISPATCH').length}</h3>
                </div>
                <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Ongoing Rented Load</span>
                  <h3 className="text-xl font-black text-teal-600 mt-1">{bundlesList.filter(b => b.status === 'DISPATCHED' || b.status === 'DELIVERED').length}</h3>
                </div>
                <div className="bg-white border border-slate-200/60 rounded-3xl p-5 shadow-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Laundry Wash Load</span>
                  <h3 className="text-xl font-black text-rose-600 mt-1">{bundlesList.filter(b => b.status === 'SENT_TO_LAUNDRY' || b.status === 'IN_LAUNDRY').length}</h3>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left side: QR code logistics scanning & Laundry controller */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Scanner terminal simulation */}
                  <div className="bg-slate-900 text-white rounded-3xl p-6.5 shadow-md border border-slate-850">
                    <div className="flex items-center gap-2 mb-4">
                      <QrCode className="h-5 w-5 text-linen-gold animate-pulse" />
                      <h3 className="font-extrabold text-xs uppercase tracking-wider text-white">Logistics Barcode Terminal</h3>
                    </div>
                    <p className="text-[10px] text-slate-440 font-medium leading-relaxed mb-4">
                      Simulate a barcode/QR gun scanning physically printed bundle labels at warehouse docks.
                    </p>
                    
                    <form onSubmit={handleScanSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Select Scan Event Action</label>
                        <div className="grid grid-cols-2 gap-2 bg-slate-800 p-1 rounded-xl">
                          <button
                            type="button"
                            onClick={() => setScannerAction("scan_dispatch")}
                            className={`py-2 text-[9px] font-extrabold uppercase rounded-lg transition-colors cursor-pointer ${
                              scannerAction === "scan_dispatch" ? "bg-teal-650 text-white" : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            Scan Out (Dispatch)
                          </button>
                          <button
                            type="button"
                            onClick={() => setScannerAction("scan_return")}
                            className={`py-2 text-[9px] font-extrabold uppercase rounded-lg transition-colors cursor-pointer ${
                              scannerAction === "scan_return" ? "bg-rose-650 text-white" : "text-slate-400 hover:text-slate-200"
                            }`}
                          >
                            Scan In (Return/Wash)
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest">Select Bundle ID</label>
                        <select
                          value={scanInput}
                          onChange={(e) => setScanInput(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-linen-gold cursor-pointer"
                        >
                          <option value="">— Select Target Bundle —</option>
                          {bundlesList.map(b => (
                            <option key={b.bundleId} value={b.bundleId}>{b.bundleId} ({b.bedType} - {b.status})</option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="submit"
                        disabled={!scanInput}
                        className={`w-full py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                          scannerAction === "scan_dispatch"
                            ? "bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50"
                            : "bg-rose-650 hover:bg-rose-700 text-white disabled:opacity-50"
                        }`}
                      >
                        {scannerAction === "scan_dispatch" ? "Simulate Dispatch Scan" : "Simulate Return Scan"}
                      </button>
                    </form>
                  </div>

                  {/* Laundry Disinfection Monitor */}
                  <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 shadow-sm space-y-6">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">Thermodynamic Laundry Disinfection</h3>
                      <p className="text-2xs text-slate-450 mt-1">Linen returned from customers undergoes 60°C+ thermodynamic heat sanitation cycles.</p>
                    </div>

                    <div className="space-y-4">
                      {bundlesList.filter(b => b.status === "SENT_TO_LAUNDRY" || b.status === "IN_LAUNDRY").map(b => {
                        const activeItemStage = b.items[0]?.laundryStatus || "PENDING_WASH";
                        return (
                          <div key={b.bundleId} className="border border-slate-100 rounded-2xl p-4 bg-slate-50 space-y-3.5">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-slate-850 text-2xs uppercase">{b.bundleId}</span>
                              <span className="text-[9px] bg-amber-50 text-amber-700 font-extrabold uppercase px-1.5 py-0.5 rounded border border-amber-200">
                                {activeItemStage.replace("_", " ")}
                              </span>
                            </div>

                            {/* Stepper Pipeline */}
                            <div className="flex justify-between items-center gap-1">
                              {[
                                { stage: "PENDING_WASH", name: "Wash Pnd" },
                                { stage: "WASHING", name: "60°C Wash" },
                                { stage: "SANITIZING", name: "UV Sanit." },
                                { stage: "STEAM_PRESSING", name: "Pressing" },
                                { stage: "VACUUM_PACKING", name: "Seal Pack" },
                                { stage: "CLEAN_STOCK", name: "Completed" }
                              ].map((step, idx, arr) => {
                                const isCurrent = activeItemStage === step.stage;
                                const isPassed = arr.findIndex(x => x.stage === activeItemStage) > idx;
                                return (
                                  <div key={step.stage} className="flex-1 flex flex-col items-center relative">
                                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black z-10 ${
                                      isCurrent ? "bg-amber-500 text-white animate-pulse" :
                                      isPassed ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-400"
                                    }`}>
                                      {isPassed ? "✓" : idx + 1}
                                    </div>
                                    <span className="text-[7px] text-slate-450 font-bold uppercase tracking-tighter mt-1 text-center truncate w-full">{step.name}</span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Action to advance stage */}
                            <div className="pt-2">
                              {activeItemStage !== "CLEAN_STOCK" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const stages = ["PENDING_WASH", "WASHING", "SANITIZING", "STEAM_PRESSING", "VACUUM_PACKING", "CLEAN_STOCK"];
                                    const currentIdx = stages.indexOf(activeItemStage);
                                    const nextStage = stages[currentIdx + 1] || "CLEAN_STOCK";
                                    handleLaundryAdvance(b.bundleId, nextStage);
                                  }}
                                  className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white text-3xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                                >
                                  Advance to Next Laundry Stage
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {bundlesList.filter(b => b.status === "SENT_TO_LAUNDRY" || b.status === "IN_LAUNDRY").length === 0 && (
                        <p className="text-2xs text-slate-400 italic">No linen bundles currently in laundry sanitation pipeline.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Orders listing, bundle configuration and SKU updates */}
                <div className="lg:col-span-8 space-y-6">
                  
                  {/* Bundle Generator Panel */}
                  <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 shadow-sm space-y-6">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">WMS Bundle Generator & SKU Registry</h3>
                      <p className="text-2xs text-slate-450 mt-1">Generate physical tracking bundles for subscription orders and configure SKU bar-codes.</p>
                    </div>

                    <div className="space-y-4">
                      {(() => {
                        return ordersList.map(order => {
                          const matchingBundle = bundlesList.find(b => b.orderId === order._id.toString());
                          return (
                            <div key={order._id} className="border border-slate-150 hover:border-slate-250 p-4.5 rounded-2xl bg-white transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div className="space-y-2">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-black text-slate-900 text-2xs uppercase">{order.bundleOrderId}</span>
                                  <span className="text-[10px] bg-slate-100 text-slate-600 font-extrabold px-1.5 py-0.5 rounded">{order.bundleName}</span>
                                  <span className="text-[10px] font-bold text-slate-500">{order.userName}</span>
                                  {order.status === "CANCELLED" && (
                                    <span className="text-[8px] bg-rose-50 text-rose-700 font-black uppercase px-2 py-0.5 rounded">Cancelled</span>
                                  )}
                                </div>
                                <div className="text-[10px] text-slate-400 font-semibold leading-relaxed font-sans">
                                  Color: <span className="text-slate-800 font-extrabold uppercase">{order.deliveryAddress?.split("|")[1] || "Classic White"}</span> | Duration: {order.duration}
                                </div>
                                
                                {matchingBundle && (
                                  <div className="mt-3 bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-2 max-w-lg">
                                    <div className="flex justify-between items-center">
                                      <span className="text-3xs font-extrabold text-slate-500 uppercase">Physical WMS Bundle: <strong className="text-slate-800">{matchingBundle.bundleId}</strong></span>
                                      <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded border ${
                                        matchingBundle.status === 'CREATED' ? 'bg-slate-50 text-slate-650 border-slate-200' :
                                        matchingBundle.status === 'READY_TO_DISPATCH' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                        matchingBundle.status === 'DISPATCHED' ? 'bg-teal-50 text-teal-705 border-teal-200' :
                                        matchingBundle.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-707 border-emerald-200' :
                                        matchingBundle.status === 'SENT_TO_LAUNDRY' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                        matchingBundle.status === 'IN_LAUNDRY' ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' :
                                        'bg-slate-100 text-slate-450'
                                      }`}>{matchingBundle.status}</span>
                                    </div>
                                    
                                    {/* SKU listing */}
                                    <div className="space-y-1.5 pt-1.5 border-t border-slate-200/50">
                                      {matchingBundle.items.map((item, itemIdx) => (
                                        <div key={itemIdx} className="flex justify-between items-center text-[10px]">
                                          <span className="font-bold text-slate-600">{item.itemType}</span>
                                          {activeBundleIdForSkus === matchingBundle.bundleId ? (
                                            <input
                                              type="text"
                                              value={editingSkus[itemIdx]?.sku || ""}
                                              onChange={(e) => {
                                                const updated = [...editingSkus];
                                                updated[itemIdx] = { ...updated[itemIdx], sku: e.target.value };
                                                setEditingSkus(updated);
                                              }}
                                              className="bg-white border border-slate-200 rounded py-0.5 px-1.5 font-bold font-mono text-[9px] w-48 focus:outline-none focus:border-teal-500"
                                            />
                                          ) : (
                                            <span className="font-mono font-bold text-slate-800">{item.sku}</span>
                                          )}
                                        </div>
                                      ))}
                                    </div>

                                    {/* Edit SKUs action triggers */}
                                    <div className="flex gap-2 pt-2 justify-end">
                                      {activeBundleIdForSkus === matchingBundle.bundleId ? (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => setActiveBundleIdForSkus("")}
                                            className="px-2 py-1 bg-transparent hover:bg-slate-100 text-slate-500 text-3xs font-extrabold uppercase rounded-lg transition-colors cursor-pointer"
                                          >
                                            Cancel
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() => handleUpdateSkus(matchingBundle.bundleId, editingSkus)}
                                            className="px-4 py-1.5 bg-[#032026] hover:bg-[#05D4B5] hover:text-[#032026] text-white text-xs font-bold uppercase rounded-lg transition-all shadow-md cursor-pointer"
                                          >
                                            SAVE SKUS
                                          </button>
                                        </>
                                      ) : (
                                        <>
                                          {matchingBundle.status === "CREATED" && (
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setActiveBundleIdForSkus(matchingBundle.bundleId);
                                                setEditingSkus(matchingBundle.items);
                                              }}
                                              className="px-2.5 py-1 bg-slate-800 hover:bg-slate-900 text-white text-3xs font-extrabold uppercase rounded-lg transition-colors cursor-pointer"
                                            >
                                              Assign SKU Barcodes
                                            </button>
                                          )}
                                        </>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="flex gap-2 shrink-0">
                                {!matchingBundle ? (
                                  order.status !== "CANCELLED" && (
                                    <button
                                      type="button"
                                      onClick={() => handleCreateBundle(order._id.toString())}
                                      className="py-2.5 px-4 bg-teal-600 hover:bg-teal-700 text-white text-3xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                                    >
                                      Generate WMS Bundle
                                    </button>
                                  )
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        // Open print QR modal
                                        generateQR(order, `CLOSE-WMS-${matchingBundle.bundleId}`);
                                      }}
                                      className="p-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-650 rounded-xl transition-all cursor-pointer"
                                      title="Print Logistics QR label"
                                    >
                                      <QrCode className="w-4 h-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteBundle(matchingBundle.bundleId)}
                                      className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl transition-all cursor-pointer"
                                      title="Cancel Bundle / Release Stock"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Cancelled orders and return release monitor */}
                  <div className="bg-white border border-slate-200/60 rounded-3xl p-6.5 shadow-sm space-y-6">
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-sm">Cancellations & Return Monitoring</h3>
                      <p className="text-2xs text-slate-450 mt-1">Review orders that have been cancelled to ensure inventory is correctly returned to stock.</p>
                    </div>

                    <div className="space-y-4">
                      {ordersList.filter(o => o.status === "CANCELLED").map(order => {
                        const matchingBundle = bundlesList.find(b => b.orderId === order._id.toString());
                        return (
                          <div key={order._id} className="p-4 bg-rose-50/30 border border-rose-200/50 rounded-2xl flex justify-between items-center text-xs">
                            <div className="space-y-1">
                              <span className="font-black text-rose-800 text-2xs uppercase tracking-wider">{order.bundleOrderId}</span>
                              <p className="text-[10px] text-slate-500 font-bold">Linen Set: {order.bundleName}</p>
                              {matchingBundle ? (
                                <p className="text-[10px] text-amber-700 font-bold">WMS Bundle ID: {matchingBundle.bundleId} ({matchingBundle.status})</p>
                              ) : (
                                <p className="text-[10px] text-slate-455 italic">No bundle generated</p>
                              )}
                            </div>

                            {matchingBundle && (
                              <button
                                type="button"
                                onClick={() => handleDeleteBundle(matchingBundle.bundleId)}
                                className="py-2 px-3.5 bg-rose-650 hover:bg-rose-700 text-white text-3xs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                              >
                                Release Bundle Stock
                              </button>
                            )}
                          </div>
                        );
                      })}
                      {ordersList.filter(o => o.status === "CANCELLED").length === 0 && (
                        <p className="text-2xs text-slate-400 italic">No cancelled orders found.</p>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL: ADD / EDIT PLAN */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-8 shadow-2xl relative animate-scaleUp text-slate-800 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPlanModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-wider">
              {planForm.id ? "Edit Pricing Plan" : "Add New Pricing Plan"}
            </h2>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">Tier</label>
                  <select
                    value={planForm.tier}
                    onChange={(e) => setPlanForm({ ...planForm, tier: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white font-bold transition-all"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">Bed Type</label>
                  <select
                    value={planForm.bedType}
                    onChange={(e) => setPlanForm({ ...planForm, bedType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white font-bold transition-all"
                  >
                    <option value="single">Single Bed</option>
                    <option value="double">Double Bed</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">Monthly Rate (₹)</label>
                  <input
                    type="number"
                    required
                    value={planForm.monthlyRate}
                    onChange={(e) => setPlanForm({ ...planForm, monthlyRate: e.target.value })}
                    placeholder="e.g. 300"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-3.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-semibold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">Deposit Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={planForm.depositAmount}
                    onChange={(e) => setPlanForm({ ...planForm, depositAmount: e.target.value })}
                    placeholder="e.g. 500"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-3.5 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="flex-1 py-3 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-all shadow-md shadow-teal-500/10 cursor-pointer"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT CATEGORY */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-8 shadow-2xl relative animate-scaleUp text-slate-800">
            <button
              onClick={() => setShowCategoryModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-wider">
              {categoryForm.id ? "Edit Category" : "Add New Category"}
            </h2>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div className="space-y-2">
                <label className="text-2xs text-slate-450 font-bold uppercase block">Name</label>
                <input
                  type="text"
                  required
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="e.g. Quilt"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-2xs text-slate-450 font-bold uppercase block">Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  placeholder="e.g. Premium Cotton Quilts"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white min-h-[80px] transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-2xs text-slate-450 font-bold uppercase block">Price per item (₹)</label>
                <input
                  type="number"
                  required
                  value={categoryForm.pricePerItem}
                  onChange={(e) => setCategoryForm({ ...categoryForm, pricePerItem: e.target.value })}
                  placeholder="e.g. 500"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">Total Stock</label>
                  <input
                    type="number"
                    required
                    value={categoryForm.totalStock}
                    onChange={(e) => setCategoryForm({ ...categoryForm, totalStock: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">Available Stock</label>
                  <input
                    type="number"
                    required
                    value={categoryForm.availableStock}
                    onChange={(e) => setCategoryForm({ ...categoryForm, availableStock: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">Rented Stock</label>
                  <input
                    type="number"
                    required
                    value={categoryForm.rentedStock}
                    onChange={(e) => setCategoryForm({ ...categoryForm, rentedStock: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">Laundry Stock</label>
                  <input
                    type="number"
                    required
                    value={categoryForm.laundryStock}
                    onChange={(e) => setCategoryForm({ ...categoryForm, laundryStock: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-2xs text-slate-450 font-bold uppercase block">Status</label>
                <select
                  value={categoryForm.status}
                  onChange={(e) => setCategoryForm({ ...categoryForm, status: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                </select>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="flex-1 py-3 px-6 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-teal-500/10 cursor-pointer"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE SUPPORT TICKET */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-8 shadow-2xl relative animate-scaleUp text-slate-800">
            <button
              onClick={() => setShowTicketModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-wider">Create Support Ticket</h2>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div className="space-y-2">
                <label className="text-2xs text-slate-450 font-bold uppercase block">Subject / Issue Description</label>
                <input
                  type="text"
                  required
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                  placeholder="e.g. Delivery Delay or Damaged Bedsheet"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-2xs text-slate-450 font-bold uppercase block">User Full Name</label>
                <input
                  type="text"
                  required
                  value={ticketForm.userName}
                  onChange={(e) => setTicketForm({ ...ticketForm, userName: e.target.value })}
                  placeholder="e.g. Prasad Shaswat"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-2xs text-slate-450 font-bold uppercase block">User Email</label>
                <input
                  type="email"
                  required
                  value={ticketForm.userEmail}
                  onChange={(e) => setTicketForm({ ...ticketForm, userEmail: e.target.value })}
                  placeholder="e.g. prasad@gmail.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">Priority</label>
                  <select
                    value={ticketForm.priority}
                    onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                    <option value="CRITICAL">CRITICAL</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">Status</label>
                  <select
                    value={ticketForm.status}
                    onChange={(e) => setTicketForm({ ...ticketForm, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowTicketModal(false)}
                  className="flex-1 py-3 px-6 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-650 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-teal-500/10 cursor-pointer"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW & REPLY SUPPORT TICKET */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl p-8 shadow-2xl relative animate-scaleUp text-slate-800 my-8">
            <button
              onClick={() => setSelectedTicket(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border mr-2 ${selectedTicket.priority === "CRITICAL" ? "bg-red-50 text-red-750 border-red-200" :
                  selectedTicket.priority === "HIGH" ? "bg-amber-50 text-amber-650 border-amber-200" :
                    selectedTicket.priority === "MEDIUM" ? "bg-blue-50 text-blue-650 border-blue-200" :
                      "bg-slate-100 text-slate-550 border-slate-200"
                }`}>
                {selectedTicket.priority}
              </span>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${selectedTicket.status === "CLOSED" ? "bg-slate-100 text-slate-500 border-slate-200" :
                  selectedTicket.status === "IN_PROGRESS" ? "bg-blue-50 text-blue-650 border-blue-200/50" :
                    "bg-teal-50 text-teal-650 border-teal-200/50"
                }`}>
                {selectedTicket.status}
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-3">{selectedTicket.subject}</h2>
              <p className="text-2xs text-slate-400 mt-1">Ticket ID: {selectedTicket.ticketId} • Created: {new Date(selectedTicket.createdAt).toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Customer Details</p>
                <p className="text-xs font-bold text-slate-800 mt-1">{selectedTicket.userName}</p>
                <p className="text-[10px] text-slate-500">{selectedTicket.userEmail}</p>
              </div>
              <div className="flex flex-col justify-between items-end">
                <div className="flex gap-2">
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => {
                      updateTicketStatus(selectedTicket._id, e.target.value);
                      setSelectedTicket({ ...selectedTicket, status: e.target.value });
                    }}
                    className="bg-white border border-slate-200 rounded-xl px-2 py-1 text-2xs text-slate-800 focus:outline-none cursor-pointer"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Conversation History */}
            <div className="mb-6">
              <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider mb-3">Conversation Log</h3>
              <div className="space-y-4 max-h-48 overflow-y-auto border border-slate-100 rounded-2xl p-4 bg-slate-50/50">
                <div className="p-3 bg-white border border-slate-100 rounded-2xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-2xs font-extrabold text-slate-700">{selectedTicket.userName}</span>
                    <span className="text-[9px] text-slate-400">{new Date(selectedTicket.createdAt).toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-slate-650 leading-relaxed font-medium">
                    Opened ticket with subject: <strong>{selectedTicket.subject}</strong>. Needs support regarding bedding and linen service.
                  </p>
                </div>

                {/* Simulated Replies */}
                {(ticketReplies[selectedTicket.ticketId] || []).map((reply, idx) => (
                  <div key={idx} className="p-3 bg-teal-50/40 border border-teal-100/50 rounded-2xl ml-6">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-2xs font-extrabold text-teal-750">Admin Support (You)</span>
                      <span className="text-[9px] text-slate-450">{new Date(reply.sentAt).toLocaleString()}</span>
                    </div>
                    <p className="text-2xs text-teal-650 font-bold uppercase mb-1">Subject: {reply.subject}</p>
                    <p className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed">{reply.message}</p>
                  </div>
                ))}

                {(!ticketReplies[selectedTicket.ticketId] || ticketReplies[selectedTicket.ticketId].length === 0) && (
                  <p className="text-center text-slate-400 text-2xs py-2">No replies sent yet. Send a direct mail reply below.</p>
                )}
              </div>
            </div>

            {/* Reply Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setReplySending(true);

                // Simulate email sending API delay
                await new Promise((resolve) => setTimeout(resolve, 800));

                const newReply = {
                  subject: replySubject,
                  message: replyMessage,
                  sentAt: new Date().toISOString()
                };

                const updatedReplies = {
                  ...ticketReplies,
                  [selectedTicket.ticketId]: [...(ticketReplies[selectedTicket.ticketId] || []), newReply]
                };

                setTicketReplies(updatedReplies);
                localStorage.setItem("closet_rush_ticket_replies", JSON.stringify(updatedReplies));

                // Auto-update ticket status to IN_PROGRESS if it was OPEN
                if (selectedTicket.status === "OPEN") {
                  updateTicketStatus(selectedTicket._id, "IN_PROGRESS");
                  setSelectedTicket({ ...selectedTicket, status: "IN_PROGRESS" });
                }

                alert(`Email successfully dispatched to ${selectedTicket.userEmail}!\nSubject: ${replySubject}`);

                setReplyMessage("");
                setReplySending(false);
              }}
              className="space-y-4 pt-4 border-t border-slate-100"
            >
              <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">Direct Mail Reply</h3>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-450 font-bold uppercase block">Subject</label>
                <input
                  type="text"
                  required
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-450 font-bold uppercase block">Message</label>
                <textarea
                  required
                  rows="3"
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply here. This will be sent as an email to the client."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white min-h-[80px]"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={replySending}
                  className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-teal-500/10 cursor-pointer text-center"
                >
                  {replySending ? "Sending Email..." : "Send Reply"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW & RESPOND TO QUOTE */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl p-8 shadow-2xl relative animate-scaleUp text-slate-800 my-8">
            <button
              onClick={() => setSelectedQuote(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded border border-teal-200 bg-teal-50 text-teal-650 mr-2">
                {selectedQuote.type === "connection" ? "Connection Request" : "Quotation Request"}
              </span>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${selectedQuote.status === "ACCEPTED" ? "bg-teal-50 text-teal-650 border-teal-200" :
                  selectedQuote.status === "CONTACTED" || selectedQuote.status === "QUOTE SENT" ? "bg-blue-50 text-blue-650 border-blue-200" :
                    "bg-amber-50 text-amber-650 border-amber-200"
                }`}>
                {selectedQuote.status}
              </span>
              <h2 className="text-xl font-black text-slate-900 mt-3">{selectedQuote.businessName}</h2>
              <p className="text-2xs text-slate-400 mt-1">Requested on: {selectedQuote.receivedAt ? new Date(selectedQuote.receivedAt).toLocaleString() : ""}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 border border-slate-100 rounded-2xl p-6 mb-6">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1.5">Contact Details</p>
                <div className="space-y-1 text-xs">
                  <p><strong>Contact Person:</strong> {selectedQuote.contactPerson}</p>
                  {selectedQuote.ownerName && <p><strong>Owner Name:</strong> {selectedQuote.ownerName}</p>}
                  {selectedQuote.propertyName && <p><strong>Property Name:</strong> {selectedQuote.propertyName}</p>}
                  <p><strong>Email:</strong> {selectedQuote.email}</p>
                  <p><strong>Phone:</strong> {selectedQuote.phone}</p>
                  {selectedQuote.gstNumber && <p><strong>GST Number:</strong> {selectedQuote.gstNumber}</p>}
                  <p><strong>Business Type:</strong> <span className="uppercase font-bold">{selectedQuote.businessType}</span></p>
                </div>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1.5">Request Specifications</p>
                {selectedQuote.type === "connection" ? (
                  <div className="text-xs">
                    <p><strong>Message / Inquiry:</strong></p>
                    <p className="text-slate-650 bg-white border border-slate-100 rounded-xl p-3 mt-1.5 leading-relaxed font-medium italic">
                      "{selectedQuote.message || "—"}"
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1.5 text-xs">
                    {selectedQuote.propertyAddress && <p><strong>Property Address:</strong> {selectedQuote.propertyAddress}</p>}
                    {selectedQuote.roomsCount !== undefined && <p><strong>Rooms Count:</strong> {selectedQuote.roomsCount}</p>}
                    {selectedQuote.bedsCount !== undefined && <p><strong>Beds Count:</strong> {selectedQuote.bedsCount}</p>}
                    {selectedQuote.bedType && <p><strong>Bed Type:</strong> {selectedQuote.bedType}</p>}
                    {selectedQuote.bedsheetRequirements && selectedQuote.bedsheetRequirements.length > 0 && (
                      <p><strong>Requirements:</strong> {selectedQuote.bedsheetRequirements.join(", ")}</p>
                    )}
                    {!selectedQuote.roomsCount && (
                      <>
                        <p><strong>Properties Count:</strong> {selectedQuote.propertiesCount || 0}</p>
                        <p><strong>Units Count:</strong> {selectedQuote.unitsCount || 0}</p>
                      </>
                    )}
                    <p><strong>Selected Bundles:</strong> {selectedQuote.bundleSelections}</p>
                    <div className="pt-2 border-t border-slate-200 mt-2 space-y-1">
                      <p className="text-sm font-black text-teal-600 bg-white border border-slate-100 p-2 rounded-xl text-center">
                        Estimated: ₹{selectedQuote.estimatedTotal ? selectedQuote.estimatedTotal.toLocaleString() : "0"}
                      </p>
                      {selectedQuote.priceQuote > 0 && (
                        <p className="text-sm font-black text-linen-gold bg-charcoal-ink text-white p-2 rounded-xl text-center">
                          Prepared Quote: ₹{selectedQuote.priceQuote.toLocaleString()}
                        </p>
                      )}
                      {selectedQuote.signatureData && (
                        <div className="pt-2.5 border-t border-slate-200 mt-2.5 text-center">
                          <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Customer E-Signature</p>
                          {selectedQuote.signatureData.startsWith("TYPED:") ? (
                            <p className="text-base font-serif italic font-black border border-slate-200 p-2 bg-slate-50 mt-1 select-all text-charcoal-ink">
                              {selectedQuote.signatureData.replace("TYPED:", "")}
                            </p>
                          ) : (
                            <img src={selectedQuote.signatureData} alt="E-Signature" className="max-h-[50px] mx-auto border border-slate-200 bg-white mt-1 shadow-xs" />
                          )}
                          <p className="text-[9px] text-slate-500 font-semibold mt-1">Signed by {selectedQuote.signedBy} on {new Date(selectedQuote.signedAt).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Response Draft Form */}
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setQuoteReplySending(true);

                // Simulate email sending API delay
                await new Promise((resolve) => setTimeout(resolve, 800));

                // Auto-update status depending on type
                const newStatus = selectedQuote.type === "connection" ? "CONTACTED" : "QUOTE SENT";
                await updateQuoteStatus(selectedQuote._id, newStatus, selectedQuote.type === "quotation" ? quotePrice : undefined);
                setSelectedQuote({ ...selectedQuote, status: newStatus, priceQuote: selectedQuote.type === "quotation" ? quotePrice : selectedQuote.priceQuote });

                alert(`Email response successfully dispatched to ${selectedQuote.email}!\nSubject: ${quoteReplySubject}`);

                setQuoteReplyMessage("");
                setQuoteReplySending(false);
                setSelectedQuote(null);
              }}
              className="space-y-4 pt-4 border-t border-slate-100"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">Send Corporate Email Response</h3>
                <div className="flex items-center gap-2">
                  <span className="text-2xs text-slate-450 font-bold uppercase">Change Status:</span>
                  <select
                    value={selectedQuote.status}
                    onChange={(e) => {
                      updateQuoteStatus(selectedQuote._id, e.target.value, selectedQuote.type === "quotation" ? quotePrice : undefined);
                      setSelectedQuote({ ...selectedQuote, status: e.target.value });
                    }}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-2xs text-slate-805 focus:outline-none cursor-pointer"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="CONTACTED">CONTACTED</option>
                    <option value="NEGOTIATING">NEGOTIATING</option>
                    <option value="QUOTE SENT">QUOTE SENT</option>
                    <option value="ACCEPTED">ACCEPTED</option>
                    <option value="PAID">PAID</option>
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              {selectedQuote.type === "quotation" && (
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-450 font-bold uppercase block">Prepare Quote Pricing (₹)</label>
                  <input
                    type="number"
                    required
                    value={quotePrice}
                    onChange={(e) => setQuotePrice(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white font-bold"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] text-slate-450 font-bold uppercase block">Subject</label>
                <input
                  type="text"
                  required
                  value={quoteReplySubject}
                  onChange={(e) => setQuoteReplySubject(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] text-slate-450 font-bold uppercase block">Message Body</label>
                <textarea
                  required
                  rows="4"
                  value={quoteReplyMessage}
                  onChange={(e) => setQuoteReplyMessage(e.target.value)}
                  placeholder="Draft your response proposal or connection follow-up here."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white min-h-[100px]"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedQuote(null)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={quoteReplySending}
                  className="flex-1 py-2.5 rounded-xl bg-teal-650 hover:bg-teal-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-md shadow-teal-500/10 cursor-pointer text-center"
                >
                  {quoteReplySending ? "Sending Email..." : "Send Response & Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW, CREATE & EDIT CUSTOMER */}
      {showUserModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-8 shadow-2xl relative animate-scaleUp text-slate-800 my-8">
            <button
              onClick={() => {
                setShowUserModal(false);
                setSelectedUser(null);
              }}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-wider">
              {selectedUser ? "Edit Customer Details" : "Create New Customer"}
            </h2>

            <form onSubmit={handleSaveUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">Full Name</label>
                  <input
                    type="text"
                    required
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">Email Address</label>
                  <input
                    type="email"
                    required
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="e.g. john@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">Mobile Phone</label>
                  <input
                    type="text"
                    value={userForm.mobile}
                    onChange={(e) => setUserForm({ ...userForm, mobile: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">
                    {selectedUser ? "Password (Leave blank to keep same)" : "Password"}
                  </label>
                  <input
                    type="password"
                    required={!selectedUser}
                    value={userForm.password || ""}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    placeholder={selectedUser ? "••••••••" : "e.g. securepassword"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-2xs text-slate-450 font-bold uppercase block">Delivery & Billing Address</label>
                <textarea
                  value={userForm.address || ""}
                  onChange={(e) => setUserForm({ ...userForm, address: e.target.value })}
                  placeholder="e.g. Flat 301, Courtyard, Gurugram"
                  rows="2"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs text-slate-800 placeholder-slate-405 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">Account Type</label>
                  <select
                    value={userForm.accountType}
                    onChange={(e) => setUserForm({ ...userForm, accountType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="Individual User">Individual</option>
                    <option value="Commercial Partner">B2B Partner</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">Role</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">Status</label>
                  <select
                    value={userForm.status}
                    onChange={(e) => setUserForm({ ...userForm, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              {/* NESTED PLAN FORM */}
              <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/55 space-y-3 text-left">
                <h3 className="text-2xs font-extrabold text-slate-500 uppercase tracking-wider">Subscription Plan Configuration</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-450 font-bold uppercase block">Bed Type</label>
                    <select
                      value={userForm.selectedPlan?.bedType || ""}
                      onChange={(e) => setUserForm({
                        ...userForm,
                        selectedPlan: { ...userForm.selectedPlan, bedType: e.target.value }
                      })}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer"
                    >
                      <option value="">No Plan / Select</option>
                      <option value="Single">Single Bed</option>
                      <option value="Double">Double Bed</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-455 font-bold uppercase block">Plan Name</label>
                    <input
                      type="text"
                      value={userForm.selectedPlan?.planName || ""}
                      onChange={(e) => setUserForm({
                        ...userForm,
                        selectedPlan: { ...userForm.selectedPlan, planName: e.target.value }
                      })}
                      placeholder="e.g. Deluxe Single Plan"
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-450 font-bold uppercase block">Price (₹)</label>
                    <input
                      type="number"
                      value={userForm.selectedPlan?.price !== undefined ? userForm.selectedPlan.price : ""}
                      onChange={(e) => setUserForm({
                        ...userForm,
                        selectedPlan: { ...userForm.selectedPlan, price: e.target.value }
                      })}
                      placeholder="e.g. 500"
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-450 font-bold uppercase block">Duration</label>
                    <select
                      value={userForm.selectedPlan?.duration || ""}
                      onChange={(e) => setUserForm({
                        ...userForm,
                        selectedPlan: { ...userForm.selectedPlan, duration: e.target.value }
                      })}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer"
                    >
                      <option value="">No Duration</option>
                      <option value="Monthly">Monthly</option>
                      <option value="Quarterly">Quarterly</option>
                      <option value="Half-Yearly">Half-Yearly</option>
                      <option value="Yearly">Yearly</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-450 font-bold uppercase block">Start Date</label>
                    <input
                      type="date"
                      value={userForm.selectedPlan?.startDate || ""}
                      onChange={(e) => setUserForm({
                        ...userForm,
                        selectedPlan: { ...userForm.selectedPlan, startDate: e.target.value }
                      })}
                      className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 py-3 px-6 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-650 text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-teal-500/10 cursor-pointer text-center"
                >
                  {selectedUser ? "Save Changes" : "Create Customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW & EDIT ORDER */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl p-8 shadow-2xl relative animate-scaleUp text-slate-800 my-8">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-wider">
              Order Details & Editing
            </h2>
            <p className="text-2xs text-slate-400 mb-6">Order ID: {selectedOrder.bundleOrderId}</p>

            <form onSubmit={handleSaveOrder} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">Customer Name</label>
                  <input
                    type="text"
                    required
                    value={orderForm.userName}
                    onChange={(e) => orderFormSet({ ...orderForm, userName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">Customer Phone</label>
                  <input
                    type="text"
                    value={orderForm.phone}
                    onChange={(e) => orderFormSet({ ...orderForm, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">Customer Email</label>
                  <input
                    type="email"
                    required
                    value={orderForm.email}
                    onChange={(e) => orderFormSet({ ...orderForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">Final Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={orderForm.finalPrice}
                    onChange={(e) => orderFormSet({ ...orderForm, finalPrice: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">Bundle Name</label>
                  <input
                    type="text"
                    required
                    value={orderForm.bundleName}
                    onChange={(e) => orderFormSet({ ...orderForm, bundleName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">Order Status</label>
                  <select
                    value={orderForm.status}
                    onChange={(e) => orderFormSet({ ...orderForm, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-2xs text-slate-450 font-bold uppercase block">Delivery Address</label>
                <textarea
                  rows="2"
                  value={orderForm.deliveryAddress}
                  onChange={(e) => orderFormSet({ ...orderForm, deliveryAddress: e.target.value })}
                  placeholder="Address details..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white min-h-[50px] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">Subscription Start Date</label>
                  <input
                    type="date"
                    required
                    value={orderForm.startDate}
                    onChange={(e) => orderFormSet({ ...orderForm, startDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all cursor-pointer"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">Subscription End Date</label>
                  <input
                    type="date"
                    value={orderForm.endDate}
                    onChange={(e) => orderFormSet({ ...orderForm, endDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 px-4 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white transition-all cursor-pointer"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 py-3 px-6 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-650 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-teal-500/10 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD STAFF */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-8 shadow-2xl relative animate-scaleUp text-slate-800">
            <button
              onClick={() => setShowStaffModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-wider">
              Add New Staff Registration
            </h2>

            <form onSubmit={handleCreateStaff} className="space-y-4">
              <div className="space-y-2">
                <label className="text-2xs text-slate-450 font-bold uppercase block">Full Name</label>
                <input
                  type="text"
                  required
                  value={staffForm.name}
                  onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                  placeholder="e.g. John Manager"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-2xs text-slate-450 font-bold uppercase block">Email Address</label>
                <input
                  type="email"
                  required
                  value={staffForm.email}
                  onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                  placeholder="e.g. manager@closetrush.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-2xs text-slate-450 font-bold uppercase block">Mobile Phone</label>
                <input
                  type="text"
                  required
                  value={staffForm.mobile}
                  onChange={(e) => setStaffForm({ ...staffForm, mobile: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">Role</label>
                  <select
                    value={staffForm.role}
                    onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="WH">Warehouse Manager (WH)</option>
                    <option value="LP">Logistics Partner (LP)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">Initial Status</label>
                  <select
                    value={staffForm.status}
                    onChange={(e) => setStaffForm({ ...staffForm, status: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowStaffModal(false)}
                  className="flex-1 py-3 px-6 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-650 text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-teal-500/10 cursor-pointer"
                >
                  Register Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT COUPON */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-8 shadow-2xl relative text-slate-800 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCouponModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-sm font-black text-slate-900 mb-6 uppercase tracking-wider">
              {couponForm.id ? "Edit Promo Coupon" : "Add Promo Coupon"}
            </h2>

            <form onSubmit={handleSaveCoupon} className="space-y-4">
              <div className="space-y-2">
                <label className="text-2xs text-slate-450 font-bold uppercase block">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={couponForm.code}
                  onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value })}
                  placeholder="e.g. WELCOME10"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-bold uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">Discount Type</label>
                  <select
                    value={couponForm.discountType}
                    onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer font-bold"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Cash (₹)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={couponForm.discountValue}
                    onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                    placeholder="e.g. 10 or 200"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">Min Purchase (₹)</label>
                  <input
                    type="number"
                    value={couponForm.minPurchase}
                    onChange={(e) => setCouponForm({ ...couponForm, minPurchase: e.target.value })}
                    placeholder="e.g. 1000"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">Max Discount (₹)</label>
                  <input
                    type="number"
                    value={couponForm.maxDiscount}
                    onChange={(e) => setCouponForm({ ...couponForm, maxDiscount: e.target.value })}
                    placeholder="e.g. 500"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-bold"
                    disabled={couponForm.discountType !== "percentage"}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">Start Date</label>
                  <input
                    type="date"
                    value={couponForm.startDate}
                    onChange={(e) => setCouponForm({ ...couponForm, startDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">End Date (Expiry)</label>
                  <input
                    type="date"
                    value={couponForm.endDate}
                    onChange={(e) => setCouponForm({ ...couponForm, endDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">Usage Limit</label>
                  <input
                    type="number"
                    value={couponForm.usageLimit}
                    onChange={(e) => setCouponForm({ ...couponForm, usageLimit: e.target.value })}
                    placeholder="Unlimited"
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:bg-white transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-2xs text-slate-450 font-bold uppercase block">Is Active</label>
                  <select
                    value={couponForm.isActive ? "true" : "false"}
                    onChange={(e) => setCouponForm({ ...couponForm, isActive: e.target.value === "true" })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-xs text-slate-800 focus:outline-none focus:border-teal-500 cursor-pointer font-bold"
                  >
                    <option value="true">ACTIVE</option>
                    <option value="false">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowCouponModal(false)}
                  className="flex-1 py-3 px-6 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-650 text-xs font-bold transition-all cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-md shadow-teal-500/10 cursor-pointer text-center"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* QR CODE MODAL */}
      {qrOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-none border border-black/10 shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-black/08 bg-charcoal-ink text-white">
              <div className="flex items-center gap-2.5">
                <QrCode className="h-5 w-5 text-linen-gold" />
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-widest">Bundle QR Code</h3>
                  <p className="text-[10px] text-white/50 font-semibold">{qrOrder.bundleOrderId}</p>
                </div>
              </div>
              <button
                onClick={() => { setQrOrder(null); setQrDataUrl(""); }}
                className="p-1.5 rounded-none hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* QR Image Area */}
            <div className="px-6 pt-6 pb-4 flex flex-col items-center">
              {qrLoading ? (
                <div className="w-[280px] h-[280px] flex items-center justify-center bg-slate-50 border border-slate-200">
                  <RefreshCcw className="h-8 w-8 animate-spin text-slate-400" />
                </div>
              ) : qrDataUrl ? (
                <div className="border-4 border-charcoal-ink p-2 bg-white shadow-lg">
                  <img
                    src={qrDataUrl}
                    alt={`QR for ${qrOrder.bundleOrderId}`}
                    width={280}
                    height={280}
                    className="block"
                  />
                </div>
              ) : (
                <div className="w-[280px] h-[280px] flex items-center justify-center bg-slate-50 border border-dashed border-slate-300 text-slate-400 text-xs">
                  Failed to generate QR
                </div>
              )}

              {/* Scan Hint */}
              <p className="mt-3 text-[10px] text-charcoal-ink/40 font-bold uppercase tracking-widest text-center">
                Scan to verify bundle details
              </p>
            </div>

            {/* Order Details Grid */}
            <div className="mx-6 mb-4 bg-alabaster-linen border border-black/06 divide-y divide-black/06 text-[11px]">
              {[
                ["Order ID", qrOrder.bundleOrderId],
                ["Customer", qrOrder.userName || "—"],
                ["Phone", qrOrder.phone || "—"],
                ["Email", qrOrder.email || "—"],
                ["Bundle", qrOrder.bundleName],
                ["Status", qrOrder.status],
                ["Price", `₹${qrOrder.finalPrice}`],
                ["Start", qrOrder.startDate ? new Date(qrOrder.startDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"],
                ["End", qrOrder.endDate ? new Date(qrOrder.endDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—"],
                ["Address", qrOrder.deliveryAddress || "—"],
              ].map(([label, value]) => (
                <div key={label} className="flex px-4 py-2.5 gap-3">
                  <span className="text-charcoal-ink/40 font-extrabold uppercase tracking-wider w-24 shrink-0">{label}</span>
                  <span className="text-charcoal-ink font-semibold break-all leading-relaxed">
                    {label === "Status" ? (
                      <span className={`font-extrabold uppercase px-1.5 py-0.5 text-[9px] ${
                        value === "ACTIVE" ? "bg-emerald-50 text-emerald-700" :
                        value === "CANCELLED" ? "bg-rose-50 text-rose-700" :
                        value === "DELIVERED" ? "bg-teal-50 text-teal-700" :
                        "bg-amber-50 text-amber-700"
                      }`}>{value}</span>
                    ) : value}
                  </span>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="px-6 pb-6 flex gap-3">
              <button
                onClick={handlePrintQR}
                disabled={!qrDataUrl}
                className="flex-1 py-3 px-4 bg-charcoal-ink hover:bg-charcoal-ink/90 text-white text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 rounded-none"
              >
                <Printer className="h-4 w-4" /> Print QR
              </button>
              <button
                onClick={handleDownloadQR}
                disabled={!qrDataUrl}
                className="flex-1 py-3 px-4 bg-linen-gold hover:bg-[#9a7c5a] text-white text-xs font-extrabold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 rounded-none"
              >
                <Download className="h-4 w-4" /> Download PNG
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
