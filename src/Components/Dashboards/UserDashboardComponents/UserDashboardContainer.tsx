// UserDashboardContainer.tsx
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Favorite,
  FireTruck,
  Home,
  Logout,
  Settings,
  ShoppingBag,
  Menu,
  Close,
  Add,
  ShoppingCart,
  Message,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Modal,
  Box,
  Avatar,
} from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import "./UserDashboard.css";

// TypeScript interfaces (unchanged from your provided code)
interface Order {
  id: string;
  date: string;
  total: string;
  status: string;
  product: { name: string; image: string; details?: string };
}

interface WishlistItem {
  id: number;
  name: string;
  price: string;
  image: string;
}

interface Tracking {
  id: string;
  status: string;
  estimatedDelivery: string;
}

interface TrackingResult {
  id: string;
  status: string;
  date: string;
  details?: string;
}

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  date: string;
  response?: string;
}

interface Address {
  id: string;
  userId: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  province: string;
  city: string;
  street: string;
  alley?: string;
  building_number?: string;
  unit?: string;
  postal_code: string;
  extra_details?: string;
  is_default: boolean;
}

interface AccountInfo {
  username: string;
  email: string;
  phone_number: string;
  first_name: string;
  last_name: string;
  role: "admin" | "customer";
  isActive: boolean;
}

interface RecentActivity {
  description: string;
  date: string;
}

export default function UserDashboardContainer() {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [orderTrackingId, setOrderTrackingId] = useState<string>("");
  const [trackingResult, setTrackingResult] = useState<TrackingResult | null>(
    null
  );
  const [trackingError, setTrackingError] = useState<string>("");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddress, setNewAddress] = useState<Address>({
    id: "",
    userId: "",
    first_name: "",
    last_name: "",
    phone_number: "",
    province: "",
    city: "",
    street: "",
    alley: "",
    building_number: "",
    unit: "",
    postal_code: "",
    extra_details: "",
    is_default: false,
  });
  const [addressError, setAddressError] = useState<string>("");
  const [accountInfo, setAccountInfo] = useState<AccountInfo>({
    username: "",
    email: "",
    phone_number: "",
    first_name: "",
    last_name: "",
    role: "customer",
    isActive: false,
  });
  const [showAddressForm, setShowAddressForm] = useState<boolean>(false);
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(
    false
  );
  const [isTicketModalOpen, setIsTicketModalOpen] = useState<boolean>(false);
  const [newTicket, setNewTicket] = useState<{
    subject: string;
    message: string;
  }>({ subject: "", message: "" });
  const [ticketError, setTicketError] = useState<string>("");
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState<boolean>(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState<boolean>(false);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(
    null
  );
  const [ticketReply, setTicketReply] = useState<string>("");
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );

  const router = useRouter();
  const token = Cookies.get("authToken");

  const provinces = ["تهران", "اصفهان", "شیراز", "مشهد"];
  const cities: { [key: string]: string[] } = {
    تهران: ["تهران", "ری", "شمیرانات"],
    اصفهان: ["اصفهان", "کاشان", "نجف‌آباد"],
    شیراز: ["شیراز", "مرودشت", "کازرون"],
    مشهد: ["مشهد", "نیشابور", "سبزوار"],
  };

  useEffect(() => {
    // همیشه fetchها را انجام بده (اگر token نباشد، سرور redirect کرده)
    if (token) {
      fetchAddresses();
      fetchAccountInfo();
      fetchOrders();
      fetchWishlist();
      fetchTickets();
      fetchRecentActivities();
    }
  }, [token]); // dependency نگه داشته شد، اما بدون redirect

  const fetchAddresses = async () => {
    try {
      const res = await fetch("/api/addresses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data);
      }
    } catch (err) {
      console.error("Failed to fetch addresses:", err);
    }
  };

  const fetchAccountInfo = async () => {
    try {
      const res = await fetch("/api/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAccountInfo(data);
        setNewAddress((prev) => ({ ...prev, userId: data.id }));
      }
    } catch (err) {
      console.error("Failed to fetch account info:", err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Failed to fetch orders:", err);
    }
  };

  const fetchWishlist = async () => {
    try {
      const res = await fetch("/api/wishlist", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setWishlist(data);
      }
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    }
  };

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/tickets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSupportTickets(data);
      }
    } catch (err) {
      console.error("Failed to fetch tickets:", err);
    }
  };

  const fetchRecentActivities = async () => {
    try {
      const res = await fetch("/api/activities", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setRecentActivities(data);
      }
    } catch (err) {
      console.error("Failed to fetch activities:", err);
    }
  };

  const handleTrackOrder = async () => {
    if (!orderTrackingId.trim()) {
      setTrackingError("لطفاً شماره سفارش را وارد کنید.");
      setTrackingResult(null);
      return;
    }
    if (!/^\d+$/.test(orderTrackingId)) {
      setTrackingError("شماره سفارش باید فقط شامل اعداد باشد.");
      setTrackingResult(null);
      return;
    }
    try {
      const res = await fetch(`/api/orders/track/${orderTrackingId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTrackingResult(data);
        setTrackingError("");
      } else {
        setTrackingResult(null);
        setTrackingError("سفارش با این شماره یافت نشد.");
      }
    } catch (err) {
      setTrackingResult(null);
      setTrackingError("خطا در پیگیری سفارش.");
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const validateAddress = (address: Address): string | null => {
    if (
      !address.first_name ||
      !address.last_name ||
      !address.phone_number ||
      !address.province ||
      !address.city ||
      !address.postal_code
    ) {
      return "لطفاً تمام فیلدهای الزامی را پر کنید.";
    }
    if (!/^\d{11}$/.test(address.phone_number)) {
      return "شماره همراه باید 11 رقم باشد.";
    }
    if (!/^\d{10}$/.test(address.postal_code)) {
      return "کدپستی باید 10 رقم باشد.";
    }
    return null;
  };

  const handleAddAddress = async () => {
    const error = validateAddress(newAddress);
    if (error) {
      setAddressError(error);
      return;
    }
    try {
      // تبدیل camelCase به snake_case
      const payload = {
        first_name: newAddress.first_name,
        last_name: newAddress.last_name,
        phone_number: newAddress.phone_number,
        province: newAddress.province,
        city: newAddress.city,
        street: newAddress.street,
        alley: newAddress.alley || null,
        building_number: newAddress.building_number || null,
        unit: newAddress.unit || null,
        postal_code: newAddress.postal_code,
        extra_details: newAddress.extra_details || null,
        is_default: newAddress.is_default,
      };

      console.log("Sending payload:", payload); // لاگ کردن داده‌های ارسالی

      const res = await fetch(
        editingAddressId
          ? `/api/addresses/${editingAddressId}`
          : "/api/addresses",
        {
          method: editingAddressId ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        fetchAddresses();
        setShowAddressForm(false);
        setEditingAddressId(null);
        setAddressError("");
      } else {
        const errorData = await res.json();
        console.error("Error response:", errorData); // لاگ کردن پاسخ خطا
        setAddressError(errorData.error || "خطا در ذخیره آدرس");
      }
    } catch (err) {
      console.error("Error in handleAddAddress:", err);
      setAddressError("خطا در ارتباط با سرور");
    }
  };

  const handleEditAddress = (address: Address) => {
    setNewAddress(address);
    setEditingAddressId(address.id);
    setShowAddressForm(true);
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await fetch(`/api/addresses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchAddresses();
      }
    } catch (err) {
      console.error("Failed to delete address:", err);
    }
  };

  const handleAccordionChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpandedAccordion(isExpanded ? panel : false);
    };

  const handleAccountInfoChange = (field: keyof AccountInfo, value: string) => {
    setAccountInfo({ ...accountInfo, [field]: value });
  };

  const handleSubmitTicket = async () => {
    if (!newTicket.subject.trim() || !newTicket.message.trim()) {
      setTicketError("لطفاً موضوع و متن تیکت را پر کنید.");
      return;
    }
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newTicket),
      });
      if (res.ok) {
        fetchTickets();
        setNewTicket({ subject: "", message: "" });
        setIsTicketModalOpen(false);
        setTicketError("");
      } else {
        setTicketError("خطا در ثبت تیکت");
      }
    } catch (err) {
      setTicketError("خطا در ثبت تیکت");
    }
  };

  const handleCloseTicket = async (id: string) => {
    try {
      const res = await fetch(`/api/tickets/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "بسته" }),
      });
      if (res.ok) {
        fetchTickets();
      }
    } catch (err) {
      console.error("Failed to close ticket:", err);
    }
  };

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderModalOpen(true);
  };

  const handleCancelOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}/cancel`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchOrders();
        alert(`سفارش شماره ${id} لغو شد.`);
      }
    } catch (err) {
      console.error("Failed to cancel order:", err);
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: item.id }),
      });
      if (res.ok) {
        alert(`محصول ${item.name} به سبد خرید اضافه شد.`);
      }
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  };

  const handleRemoveFromWishlist = async (id: number) => {
    try {
      const res = await fetch(`/api/wishlist/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        fetchWishlist();
        alert(`محصول با شناسه ${id} از لیست علاقه‌مندی‌ها حذف شد.`);
      }
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
    }
  };

  const handleReplyTicket = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setIsReplyModalOpen(true);
  };

  const handleSubmitReply = async () => {
    if (!ticketReply.trim()) {
      setTicketError("لطفاً متن پاسخ را وارد کنید.");
      return;
    }
    try {
      const res = await fetch(`/api/tickets/${selectedTicket?.id}/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ response: ticketReply }),
      });
      if (res.ok) {
        fetchTickets();
        setTicketReply("");
        setIsReplyModalOpen(false);
        setTicketError("");
        setSelectedTicket(null);
      } else {
        setTicketError("خطا در ارسال پاسخ");
      }
    } catch (err) {
      setTicketError("خطا در ارسال پاسخ");
    }
  };

  const handleSaveAccountInfo = async () => {
    if (!accountInfo.first_name || !accountInfo.email) {
      alert("لطفاً نام و ایمیل را پر کنید.");
      return;
    }
    try {
      const res = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(accountInfo),
      });
      if (res.ok) {
        alert("تغییرات حساب کاربری با موفقیت ذخیره شد.");
      } else {
        alert("خطا در ذخیره تغییرات");
      }
    } catch (err) {
      alert("خطا در ذخیره تغییرات");
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      Cookies.remove("authToken");
      router.push("/myaccount");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const modalStyle = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: 600,
    bgcolor: "white",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
    p: 4,
    borderRadius: "12px",
    direction: "rtl",
  };

  return (
    <div className="ud-container">
      {/* Mobile Hamburger Menu */}
      <div className="ud-mobile-header">
        <div className="ud-mobile-header-user">
          <Avatar alt={accountInfo.first_name} />
          <div>
            <h1 className="ud-mobile-header-title">{accountInfo.first_name}</h1>
            <p className="ud-mobile-header-email">{accountInfo.email}</p>
          </div>
        </div>
        <button
          onClick={toggleSidebar}
          className="ud-mobile-header-button"
          aria-label={isSidebarOpen ? "بستن منو" : "باز کردن منو"}
        >
          {isSidebarOpen ? (
            <Close className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`ud-sidebar ${isSidebarOpen ? "ud-sidebar-open" : ""}`}>
        <div className="ud-sidebar-user">
          <Avatar alt={accountInfo.first_name} />
          <div>
            <h1 className="ud-mobile-header-title">{accountInfo.first_name}</h1>
            <p className="ud-mobile-header-email">{accountInfo.email}</p>
          </div>
        </div>
        <nav className="ud-sidebar-nav">
          {[
            { tab: "dashboard", label: "پیشخوان", Icon: Home },
            { tab: "orders", label: "سفارش‌ها", Icon: ShoppingBag },
            { tab: "wishlist", label: "لیست‌ها", Icon: Favorite },
            { tab: "tickets", label: "تیکت پشتیبانی", Icon: FireTruck },
            { tab: "addresses", label: "آدرس", Icon: Settings },
            { tab: "account", label: "اطلاعات حساب کاربری", Icon: Settings },
          ].map(({ tab, label, Icon }) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setIsSidebarOpen(false);
              }}
              className={`ud-sidebar-button ${
                activeTab === tab ? "ud-sidebar-button-active" : ""
              }`}
              aria-label={`نمایش ${label}`}
            >
              <Icon className="ud-sidebar-icon" />
              {label}
            </button>
          ))}
          <Link
            href="/"
            className="ud-sidebar-button"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="بازگشت به خانه"
          >
            <Home className="ud-sidebar-icon" />
            بازگشت به خانه
          </Link>
          <button
            onClick={handleLogout}
            className="ud-sidebar-button"
            aria-label="خروج از حساب کاربری"
          >
            <Logout className="ud-sidebar-icon" />
            خروج
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ud-main">
        {activeTab === "dashboard" && (
          <div className="ud-animate-slide-in-up">
            <h2 className="ud-main-title">پیشخوان</h2>
            <div className="ud-dashboard-grid">
              <div
                className="ud-card"
                role="region"
                aria-label="تعداد کل سفارش‌ها"
              >
                <div className="ud-card-dot ud-card-dot-teal"></div>
                <h3 className="ud-card-title">تعداد کل سفارش‌ها</h3>
                <p className="ud-card-value">
                  {orders.length.toLocaleString("fa-IR")}
                </p>
                <p className="ud-card-info">
                  آخرین سفارش: {orders[0]?.date || "نامشخص"}
                </p>
              </div>
              <div
                className="ud-card"
                role="region"
                aria-label="تعداد علاقه‌مندی‌ها"
              >
                <div className="ud-card-dot ud-card-dot-yellow"></div>
                <h3 className="ud-card-title">تعداد علاقه‌مندی‌ها</h3>
                <p className="ud-card-value">
                  {wishlist.length.toLocaleString("fa-IR")}
                </p>
                <p className="ud-card-info">
                  آخرین افزودن: {recentActivities[0]?.date || "نامشخص"}
                </p>
              </div>
              <div className="ud-card" role="region" aria-label="وضعیت پروفایل">
                <div className="ud-card-dot ud-card-dot-green"></div>
                <h3 className="ud-card-title">وضعیت پروفایل</h3>
                <p className="ud-card-profile-status">
                  {accountInfo.email ? "تکمیل‌شده" : "ناقص"}
                </p>
                <p className="ud-card-info">ایمیل: {accountInfo.email}</p>
              </div>
              <div
                className="ud-card"
                role="region"
                aria-label="تیکت‌های پشتیبانی"
              >
                <div className="ud-card-dot ud-card-dot-blue"></div>
                <h3 className="ud-card-title">تیکت‌های پشتیبانی</h3>
                <p className="ud-card-value">
                  {supportTickets
                    .filter((t) => t.status === "باز")
                    .length.toLocaleString("fa-IR")}
                </p>
                <p className="ud-card-info">تیکت‌های باز</p>
              </div>
            </div>
            <div className="ud-tracking-container">
              <h3 className="ud-tracking-title">پیگیری وضعیت سفارش</h3>
              <div className="ud-tracking-form">
                <input
                  type="text"
                  value={orderTrackingId}
                  onChange={(e) => setOrderTrackingId(e.target.value)}
                  placeholder="شماره سفارش را وارد کنید"
                  className="ud-tracking-input"
                  aria-label="وارد کردن شماره سفارش برای پیگیری"
                  required
                />
                <button
                  onClick={handleTrackOrder}
                  className="ud-tracking-button"
                  aria-label="پیگیری سفارش"
                >
                  پیگیری
                </button>
              </div>
              {trackingResult && (
                <div className="ud-tracking-result">
                  <p className="ud-tracking-result-title">
                    وضعیت سفارش #{trackingResult.id}
                  </p>
                  <p className="ud-tracking-result-text">
                    <strong>وضعیت:</strong> {trackingResult.status}
                  </p>
                  <p className="ud-tracking-result-text">
                    <strong>تاریخ تحویل تخمینی:</strong> {trackingResult.date}
                  </p>
                  <p className="ud-tracking-result-text">
                    <strong>جزئیات:</strong>{" "}
                    {trackingResult.details || "در حال پردازش"}
                  </p>
                </div>
              )}
              {trackingError && (
                <p className="ud-tracking-error">{trackingError}</p>
              )}
            </div>
            <div className="ud-activities-container">
              <h3 className="ud-activities-title">فعالیت اخیر</h3>
              {recentActivities.length === 0 ? (
                <p className="ud-activities-empty">هیچ فعالیتی ثبت نشده است!</p>
              ) : (
                <ul className="ud-activities-list">
                  {recentActivities.slice(0, 5).map((activity, index) => (
                    <li
                      key={index}
                      className="ud-activities-item"
                      role="listitem"
                    >
                      <span className="ud-activities-description">
                        {activity.description}
                      </span>
                      <span className="ud-activities-date">
                        {new Date(activity.date).toLocaleDateString("fa-IR")}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="ud-shortcuts-container">
              <h3 className="ud-shortcuts-title">میانبرهای سریع</h3>
              <div className="ud-shortcuts-grid">
                <button
                  onClick={() => setActiveTab("orders")}
                  className="ud-shortcuts-button"
                  aria-label="مشاهده سفارش‌ها"
                >
                  <ShoppingCart className="ud-shortcuts-icon" />
                  مشاهده سفارش‌ها
                </button>
                <button
                  onClick={() => setActiveTab("wishlist")}
                  className="ud-shortcuts-button"
                  aria-label="مشاهده علاقه‌مندی‌ها"
                >
                  <Favorite className="ud-shortcuts-icon" />
                  مشاهده علاقه‌مندی‌ها
                </button>
                <button
                  onClick={() => setActiveTab("tickets")}
                  className="ud-shortcuts-button"
                  aria-label="ثبت تیکت جدید"
                >
                  <Message className="ud-shortcuts-icon" />
                  ثبت تیکت جدید
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div className="ud-animate-slide-in-up">
            <h2 className="ud-main-title">سفارش‌های شما</h2>
            <div className="ud-orders-grid">
              {orders.length === 0 ? (
                <p className="ud-orders-empty">هیچ سفارشی ثبت نشده است!</p>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className="ud-order-card"
                    role="article"
                    aria-label={`سفارش ${order.id}`}
                  >
                    <div
                      className={`ud-order-status-dot ${
                        order.status === "ارسال شده"
                          ? "ud-order-status-dot-green"
                          : "ud-order-status-dot-yellow"
                      }`}
                    ></div>
                    <div className="ud-order-content">
                      <Image
                        src={order.product.image}
                        alt={order.product.name}
                        width={64}
                        height={64}
                        className="ud-order-image"
                        loading="lazy"
                      />
                      <div className="ud-order-details">
                        <p className="ud-order-name">{order.product.name}</p>
                        <p className="ud-order-info">شماره سفارش: {order.id}</p>
                        <p className="ud-order-info">
                          تاریخ:{" "}
                          {new Date(order.date).toLocaleDateString("fa-IR")}
                        </p>
                        <p className="ud-order-info">
                          مبلغ: {order.total} تومان
                        </p>
                        <span
                          className={`ud-order-status ${
                            order.status === "ارسال شده"
                              ? "ud-order-status-green"
                              : "ud-order-status-yellow"
                          }`}
                        >
                          <span
                            className={`ud-order-status-dot-status ${
                              order.status === "ارسال شده"
                                ? "ud-order-status-dot-green"
                                : "ud-order-status-dot-yellow"
                            }`}
                          ></span>
                          {order.status}
                        </span>
                      </div>
                    </div>
                    <div className="ud-order-buttons">
                      <button
                        onClick={() => handleViewOrderDetails(order)}
                        className="ud-order-button ud-order-button-details"
                        aria-label={`مشاهده جزئیات سفارش ${order.id}`}
                      >
                        مشاهده جزئیات
                      </button>
                      {order.status === "در حال پردازش" && (
                        <button
                          onClick={() => handleCancelOrder(order.id)}
                          className="ud-order-button ud-order-button-cancel"
                          aria-label={`لغو سفارش ${order.id}`}
                        >
                          لغو سفارش
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            <Modal
              open={isOrderModalOpen}
              onClose={() => setIsOrderModalOpen(false)}
              aria-labelledby="order-modal-title"
              aria-describedby="order-modal-description"
            >
              <Box sx={modalStyle}>
                <Typography
                  sx={{ fontFamily: "yekannew" }}
                  id="order-modal-title"
                  variant="h6"
                  component="h2"
                  className="ud-modal-title"
                >
                  جزئیات سفارش #{selectedOrder?.id}
                </Typography>
                {selectedOrder && (
                  <div className="ud-modal-content">
                    <p>
                      <strong>محصول:</strong> {selectedOrder.product.name}
                    </p>
                    <p>
                      <strong>جزئیات محصول:</strong>{" "}
                      {selectedOrder.product.details || "جزئیات موجود نیست"}
                    </p>
                    <p>
                      <strong>شماره سفارش:</strong> {selectedOrder.id}
                    </p>
                    <p>
                      <strong>تاریخ:</strong>{" "}
                      {new Date(selectedOrder.date).toLocaleDateString("fa-IR")}
                    </p>
                    <p>
                      <strong>مبلغ:</strong> {selectedOrder.total} تومان
                    </p>
                    <p>
                      <strong>وضعیت:</strong> {selectedOrder.status}
                    </p>
                    <div className="ud-modal-buttons">
                      <button
                        onClick={() => setIsOrderModalOpen(false)}
                        className="ud-modal-button-close"
                        aria-label="بستن جزئیات سفارش"
                      >
                        بستن
                      </button>
                    </div>
                  </div>
                )}
              </Box>
            </Modal>
          </div>
        )}

        {activeTab === "wishlist" && (
          <div className="ud-animate-slide-in-up">
            <h2 className="ud-main-title">لیست علاقه‌مندی‌ها</h2>
            <div className="ud-wishlist-container">
              {wishlist.length === 0 ? (
                <p className="ud-wishlist-empty">
                  لیست علاقه‌مندی‌های شما خالی است!
                </p>
              ) : (
                <ul className="ud-wishlist-list">
                  {wishlist.map((item) => (
                    <li
                      key={item.id}
                      className="ud-wishlist-item"
                      role="listitem"
                      aria-label={`محصول ${item.name} در لیست علاقه‌مندی‌ها`}
                    >
                      <div className="ud-wishlist-item-content">
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={48}
                          height={48}
                          className="ud-wishlist-image"
                          loading="lazy"
                        />
                        <div className="ud-wishlist-details">
                          <span className="ud-wishlist-name">{item.name}</span>
                          <span className="ud-wishlist-price">
                            {item.price} تومان
                          </span>
                        </div>
                      </div>
                      <div className="ud-wishlist-buttons">
                        <button
                          onClick={() => handleAddToCart(item)}
                          className="ud-wishlist-button ud-wishlist-button-add"
                          aria-label={`افزودن ${item.name} به سبد خرید`}
                        >
                          افزودن به سبد
                        </button>
                        <button
                          onClick={() => handleRemoveFromWishlist(item.id)}
                          className="ud-wishlist-button ud-wishlist-button-remove"
                          aria-label={`حذف ${item.name} از لیست علاقه‌مندی‌ها`}
                        >
                          حذف
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        {activeTab === "tickets" && (
          <div className="ud-animate-slide-in-up">
            <h2 className="ud-main-title">تیکت‌های پشتیبانی</h2>
            <div className="ud-tickets-container">
              <div className="mb-6 flex justify-end">
                <button
                  onClick={() => setIsTicketModalOpen(true)}
                  className="ud-tickets-button"
                  aria-label="افزودن تیکت جدید"
                >
                  <Add className="ud-tickets-button-icon" />
                  افزودن تیکت جدید
                </button>
              </div>
              <Modal
                open={isTicketModalOpen}
                onClose={() => setIsTicketModalOpen(false)}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
              >
                <Box sx={modalStyle}>
                  <Typography
                    sx={{ fontFamily: "yekannew" }}
                    id="modal-modal-title"
                    variant="h6"
                    component="h2"
                    className="ud-modal-title"
                  >
                    ثبت تیکت جدید
                  </Typography>
                  <div className="ud-ticket-modal-content">
                    <div>
                      <label className="ud-ticket-modal-label">موضوع *</label>
                      <input
                        type="text"
                        value={newTicket.subject}
                        onChange={(e) =>
                          setNewTicket({
                            ...newTicket,
                            subject: e.target.value,
                          })
                        }
                        className="ud-ticket-modal-input"
                        placeholder="موضوع تیکت را وارد کنید"
                        required
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label className="ud-ticket-modal-label">
                        متن تیکت *
                      </label>
                      <textarea
                        value={newTicket.message}
                        onChange={(e) =>
                          setNewTicket({
                            ...newTicket,
                            message: e.target.value,
                          })
                        }
                        placeholder="توضیحات تیکت خود را وارد کنید"
                        className="ud-ticket-modal-textarea"
                        rows={6}
                        required
                        aria-required="true"
                      />
                    </div>
                    {ticketError && (
                      <p className="ud-ticket-modal-error">{ticketError}</p>
                    )}
                    <div className="ud-ticket-modal-buttons">
                      <button
                        onClick={() => {
                          setIsTicketModalOpen(false);
                          setTicketError("");
                        }}
                        className="ud-ticket-modal-button-cancel"
                        aria-label="لغو ثبت تیکت"
                      >
                        لغو
                      </button>
                      <button
                        onClick={handleSubmitTicket}
                        className="ud-ticket-modal-button-submit"
                        aria-label="ارسال تیکت جدید"
                      >
                        ارسال تیکت
                      </button>
                    </div>
                  </div>
                </Box>
              </Modal>
              <Modal
                open={isReplyModalOpen}
                onClose={() => {
                  setIsReplyModalOpen(false);
                  setTicketReply("");
                  setTicketError("");
                }}
                aria-labelledby="reply-modal-title"
                aria-describedby="reply-modal-description"
              >
                <Box sx={modalStyle}>
                  <Typography
                    sx={{ fontFamily: "yekannew" }}
                    id="reply-modal-title"
                    variant="h6"
                    component="h2"
                    className="ud-modal-title"
                  >
                    پاسخ به تیکت #{selectedTicket?.id}
                  </Typography>
                  <div className="ud-ticket-modal-content">
                    <div>
                      <label className="ud-ticket-modal-label">
                        متن پاسخ *
                      </label>
                      <textarea
                        value={ticketReply}
                        onChange={(e) => setTicketReply(e.target.value)}
                        placeholder="پاسخ خود را وارد کنید"
                        className="ud-ticket-modal-textarea"
                        rows={6}
                        required
                        aria-required="true"
                      />
                    </div>
                    {ticketError && (
                      <p className="ud-ticket-modal-error">{ticketError}</p>
                    )}
                    <div className="ud-ticket-modal-buttons">
                      <button
                        onClick={() => {
                          setIsReplyModalOpen(false);
                          setTicketReply("");
                          setTicketError("");
                        }}
                        className="ud-ticket-modal-button-cancel"
                        aria-label="لغو پاسخ به تیکت"
                      >
                        لغو
                      </button>
                      <button
                        onClick={handleSubmitReply}
                        className="ud-ticket-modal-button-submit"
                        aria-label="ارسال پاسخ به تیکت"
                      >
                        ارسال پاسخ
                      </button>
                    </div>
                  </div>
                </Box>
              </Modal>
              <div className="ud-tickets-stats">
                {[
                  {
                    label: "تیکت باز",
                    count: supportTickets.filter((t) => t.status === "باز")
                      .length,
                    color: "ud-ticket-stat-open",
                  },
                  {
                    label: "تیکت بسته",
                    count: supportTickets.filter((t) => t.status === "بسته")
                      .length,
                    color: "ud-ticket-stat-closed",
                  },
                  {
                    label: "پاسخ داده شده",
                    count: supportTickets.filter((t) => t.response).length,
                    color: "ud-ticket-stat-responded",
                  },
                  {
                    label: "اتمام یافته",
                    count: 0,
                    color: "ud-ticket-stat-completed",
                  },
                  {
                    label: "همه",
                    count: supportTickets.length,
                    color: "ud-ticket-stat-all",
                  },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className={`ud-ticket-stat ${stat.color}`}
                    role="region"
                    aria-label={`آمار ${stat.label}`}
                  >
                    <p className="ud-ticket-stat-label">{stat.label}</p>
                    <p className="ud-ticket-stat-count">
                      {stat.count.toLocaleString("fa-IR")}
                    </p>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                {supportTickets.length === 0 ? (
                  <p className="ud-tickets-empty">هیچ تیکتی ثبت نشده است!</p>
                ) : (
                  supportTickets.map((ticket) => (
                    <Accordion
                      key={ticket.id}
                      expanded={expandedAccordion === ticket.id}
                      onChange={handleAccordionChange(ticket.id)}
                      className="ud-ticket-accordion"
                    >
                      <AccordionSummary
                        expandIcon={<Add className="ud-tickets-button-icon" />}
                        aria-controls={`ticket-panel-${ticket.id}`}
                        id={`ticket-header-${ticket.id}`}
                      >
                        <div className="ud-ticket-summary">
                          <Typography
                            sx={{ fontFamily: "yekannew" }}
                            className="ud-ticket-title"
                          >
                            {ticket.subject}
                          </Typography>
                          <span
                            className={`ud-ticket-status ${
                              ticket.status === "باز"
                                ? "ud-ticket-status-open"
                                : "ud-ticket-status-closed"
                            }`}
                          >
                            {ticket.status}
                          </span>
                        </div>
                      </AccordionSummary>
                      <AccordionDetails>
                        <div className="ud-ticket-details">
                          <p>
                            <strong>موضوع:</strong> {ticket.subject}
                          </p>
                          <p>
                            <strong>متن تیکت:</strong> {ticket.message}
                          </p>
                          <p>
                            <strong>وضعیت:</strong> {ticket.status}
                          </p>
                          <p>
                            <strong>تاریخ:</strong>{" "}
                            {new Date(ticket.date).toLocaleDateString("fa-IR")}
                          </p>
                          {ticket.response && (
                            <p>
                              <strong>پاسخ پشتیبانی:</strong> {ticket.response}
                            </p>
                          )}
                          <div className="ud-ticket-buttons">
                            {ticket.status === "باز" && (
                              <button
                                onClick={() => handleReplyTicket(ticket)}
                                className="ud-ticket-button ud-ticket-button-reply"
                                aria-label={`پاسخ به تیکت ${ticket.subject}`}
                              >
                                پاسخ
                              </button>
                            )}
                            <button
                              onClick={() => handleCloseTicket(ticket.id)}
                              className="ud-ticket-button ud-ticket-button-close"
                              aria-label={`بستن تیکت ${ticket.subject}`}
                            >
                              بستن تیکت
                            </button>
                          </div>
                        </div>
                      </AccordionDetails>
                    </Accordion>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "addresses" && (
          <div className="ud-animate-slide-in-up">
            <h2 className="ud-main-title">آدرس‌ها</h2>
            <div className="ud-addresses-container">
              <div className="mb-6 flex justify-end">
                <button
                  onClick={() => {
                    setShowAddressForm(!showAddressForm);
                    setEditingAddressId(null);
                    setAddressError("");
                  }}
                  className="ud-addresses-button"
                  aria-label="افزودن آدرس جدید"
                >
                  <Add className="ud-addresses-button-icon" />
                  افزودن آدرس جدید
                </button>
              </div>
              {showAddressForm && (
                <div className="ud-address-form">
                  <h3 className="ud-address-form-title">
                    {editingAddressId ? "ویرایش آدرس" : "افزودن آدرس جدید"}
                  </h3>
                  <div className="ud-address-form-grid">
                    <div>
                      <label className="ud-address-form-label">نام *</label>
                      <input
                        type="text"
                        value={newAddress.first_name}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            first_name: e.target.value,
                          })
                        }
                        className="ud-address-form-input"
                        placeholder="نام خود را وارد کنید"
                        required
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label className="ud-address-form-label">
                        نام خانوادگی *
                      </label>
                      <input
                        type="text"
                        value={newAddress.last_name}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            last_name: e.target.value,
                          })
                        }
                        className="ud-address-form-input"
                        placeholder="نام خانوادگی خود را وارد کنید"
                        required
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label className="ud-address-form-label">
                        شماره همراه *
                      </label>
                      <input
                        type="text"
                        value={newAddress.phone_number}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            phone_number: e.target.value,
                          })
                        }
                        className="ud-address-form-input"
                        placeholder="شماره همراه خود را وارد کنید"
                        required
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label className="ud-address-form-label">استان *</label>
                      <select
                        value={newAddress.province}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            province: e.target.value,
                            city: "",
                          })
                        }
                        className="ud-address-form-select"
                        required
                        aria-required="true"
                      >
                        <option value="">انتخاب کنید</option>
                        {provinces.map((province) => (
                          <option key={province} value={province}>
                            {province}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="ud-address-form-label">شهر *</label>
                      <select
                        value={newAddress.city}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, city: e.target.value })
                        }
                        className="ud-address-form-select"
                        required
                        disabled={!newAddress.province}
                        aria-required="true"
                      >
                        <option value="">ابتدا استان را انتخاب کنید</option>
                        {newAddress.province &&
                          cities[newAddress.province]?.map((city) => (
                            <option key={city} value={city}>
                              {city}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="ud-address-form-label">خیابان *</label>
                      <input
                        type="text"
                        value={newAddress.street}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            street: e.target.value,
                          })
                        }
                        className="ud-address-form-input"
                        placeholder="خیابان را وارد کنید"
                        required
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label className="ud-address-form-label">کوچه *</label>
                      <input
                        type="text"
                        value={newAddress.alley}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            alley: e.target.value,
                          })
                        }
                        className="ud-address-form-input"
                        placeholder="کوچه را وارد کنید"
                      />
                    </div>
                    <div>
                      <label className="ud-address-form-label">پلاک *</label>
                      <input
                        type="text"
                        value={newAddress.building_number}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            building_number: e.target.value,
                          })
                        }
                        className="ud-address-form-input"
                        placeholder="پلاک را وارد کنید"
                      />
                    </div>
                    <div>
                      <label className="ud-address-form-label">
                        واحد (اختیاری)
                      </label>
                      <input
                        type="text"
                        value={newAddress.unit}
                        onChange={(e) =>
                          setNewAddress({ ...newAddress, unit: e.target.value })
                        }
                        className="ud-address-form-input"
                        placeholder="واحد را وارد کنید"
                      />
                    </div>
                    <div>
                      <label className="ud-address-form-label">کدپستی *</label>
                      <input
                        type="text"
                        value={newAddress.postal_code}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            postal_code: e.target.value,
                          })
                        }
                        className="ud-address-form-input"
                        placeholder="کدپستی را وارد کنید"
                        required
                        aria-required="true"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="ud-address-form-label">
                        جزئیات اضافی (اختیاری)
                      </label>
                      <textarea
                        value={newAddress.extra_details}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            extra_details: e.target.value,
                          })
                        }
                        className="ud-address-form-input"
                        placeholder="جزئیات اضافی (مانند توضیحات تحویل)"
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="ud-address-form-label">
                        آدرس پیش‌فرض
                      </label>
                      <input
                        type="checkbox"
                        checked={newAddress.is_default}
                        onChange={(e) =>
                          setNewAddress({
                            ...newAddress,
                            is_default: e.target.checked,
                          })
                        }
                        className="ud-address-form-checkbox"
                      />
                    </div>
                    {addressError && (
                      <p className="ud-address-form-error">{addressError}</p>
                    )}
                    <div className="ud-address-form-buttons">
                      <button
                        onClick={() => {
                          setShowAddressForm(false);
                          setAddressError("");
                          setEditingAddressId(null);
                        }}
                        className="ud-address-form-button-cancel"
                        aria-label="لغو افزودن آدرس"
                      >
                        لغو
                      </button>
                      <button
                        onClick={handleAddAddress}
                        className="ud-address-form-button-save"
                        aria-label={
                          editingAddressId
                            ? "ذخیره تغییرات آدرس"
                            : "ذخیره آدرس جدید"
                        }
                      >
                        {editingAddressId ? "ذخیره تغییرات" : "ذخیره آدرس"}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-4">
                {addresses.length === 0 ? (
                  <p className="ud-addresses-empty">هیچ آدرسی ثبت نشده است!</p>
                ) : (
                  addresses.map((address) => (
                    <Accordion
                      key={address.id}
                      expanded={expandedAccordion === address.id}
                      onChange={handleAccordionChange(address.id)}
                      sx={{ fontFamily: "yekannew" }}
                      className="ud-address-accordion"
                    >
                      <AccordionSummary
                        expandIcon={
                          <Add className="ud-addresses-button-icon" />
                        }
                        aria-controls={`address-panel-${address.id}`}
                        id={`address-header-${address.id}`}
                      >
                        <div className="ud-address-summary">
                          <Typography
                            sx={{ fontFamily: "yekannew" }}
                            className="ud-address-title"
                          >
                            {address.first_name} {address.last_name} -{" "}
                            {address.city}
                          </Typography>
                          <span
                            className={`ud-address-status ${
                              address.is_default
                                ? "ud-address-status-default"
                                : "ud-address-status-normal"
                            }`}
                          >
                            {address.is_default ? "پیش‌فرض" : "معمولی"}
                          </span>
                        </div>
                      </AccordionSummary>
                      <AccordionDetails>
                        <div className="ud-address-details">
                          <p>
                            <strong>نام:</strong> {address.first_name}
                          </p>
                          <p>
                            <strong>نام خانوادگی:</strong> {address.last_name}
                          </p>
                          <p>
                            <strong>شماره همراه:</strong> {address.phone_number}
                          </p>
                          <p>
                            <strong>استان:</strong> {address.province}
                          </p>
                          <p>
                            <strong>شهر:</strong> {address.city}
                          </p>
                          <p>
                            <strong>خیابان:</strong> {address.street}
                          </p>
                          {address.alley && (
                            <p>
                              <strong>کوچه:</strong> {address.alley}
                            </p>
                          )}
                          {address.building_number && (
                            <p>
                              <strong>پلاک:</strong> {address.building_number}
                            </p>
                          )}
                          {address.unit && (
                            <p>
                              <strong>واحد:</strong> {address.unit}
                            </p>
                          )}
                          <p>
                            <strong>کدپستی:</strong> {address.postal_code}
                          </p>
                          {address.extra_details && (
                            <p>
                              <strong>جزئیات اضافی:</strong>{" "}
                              {address.extra_details}
                            </p>
                          )}
                          <div className="ud-address-buttons">
                            <button
                              onClick={() => handleEditAddress(address)}
                              className="ud-address-button ud-address-button-edit"
                              aria-label={`ویرایش آدرس ${address.first_name} ${address.last_name}`}
                            >
                              ویرایش
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="ud-address-button ud-address-button-delete"
                              aria-label={`حذف آدرس ${address.first_name} ${address.last_name}`}
                            >
                              حذف
                            </button>
                          </div>
                        </div>
                      </AccordionDetails>
                    </Accordion>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "account" && (
          <div className="ud-animate-slide-in-up">
            <h2 className="ud-main-title">اطلاعات حساب کاربری</h2>
            <div className="ud-account-container">
              <div className="ud-account-grid">
                <div>
                  <h3 className="ud-account-title">اطلاعات حساب کاربری</h3>
                  <div className="ud-account-form">
                    <div>
                      <label className="ud-account-label">نام کاربری *</label>
                      <input
                        type="text"
                        value={accountInfo.username}
                        onChange={(e) =>
                          handleAccountInfoChange("username", e.target.value)
                        }
                        className="ud-account-input"
                        placeholder="نام کاربری خود را وارد کنید"
                        required
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label className="ud-account-label">نام *</label>
                      <input
                        type="text"
                        value={accountInfo.first_name}
                        onChange={(e) =>
                          handleAccountInfoChange("first_name", e.target.value)
                        }
                        className="ud-account-input"
                        placeholder="نام خود را وارد کنید"
                        required
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label className="ud-account-label">نام خانوادگی *</label>
                      <input
                        type="text"
                        value={accountInfo.last_name}
                        onChange={(e) =>
                          handleAccountInfoChange("last_name", e.target.value)
                        }
                        className="ud-account-input"
                        placeholder="نام خانوادگی خود را وارد کنید"
                        required
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label className="ud-account-label">آدرس ایمیل *</label>
                      <input
                        type="email"
                        value={accountInfo.email}
                        onChange={(e) =>
                          handleAccountInfoChange("email", e.target.value)
                        }
                        className="ud-account-input"
                        placeholder="ایمیل خود را وارد کنید"
                        required
                        aria-required="true"
                      />
                    </div>
                    <div>
                      <label className="ud-account-label">شماره همراه</label>
                      <input
                        type="text"
                        value={accountInfo.phone_number}
                        onChange={(e) =>
                          handleAccountInfoChange(
                            "phone_number",
                            e.target.value
                          )
                        }
                        className="ud-account-input"
                        placeholder="شماره همراه خود را وارد کنید"
                      />
                    </div>
                    <div className="ud-account-buttons">
                      <button
                        onClick={() => alert("تغییرات لغو شد.")}
                        className="ud-account-button-cancel"
                        aria-label="لغو تغییرات"
                      >
                        لغو
                      </button>
                      <button
                        onClick={handleSaveAccountInfo}
                        className="ud-account-button-save"
                        aria-label="ذخیره تغییرات حساب کاربری"
                      >
                        ذخیره تغییرات
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
