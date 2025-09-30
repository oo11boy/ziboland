"use client";
import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import "./UserDashboard.css";
import Sidebar from "./Sidebar";
import DashboardContent from "./DashboardContent";
import OrdersContent from "./OrdersContent";
import WishlistContent from "./WishlistContent";
import TicketsContent from "./TicketsContent";
import AddressesContent from "./AddressesContent";
import AccountContent from "./AccountContent";
import {
  AccountInfo,
  Address,
  Order,
  RecentActivity,
  SupportTicket,
  TrackingResult,
  WishlistItem,
} from "@/types/types";
import { useAuth } from "@/ContextApi/AuthContext";

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
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>(
    []
  );
  const { logout } = useAuth();

  const token = Cookies.get("authToken");

  const provinces = ["تهران", "اصفهان", "شیراز", "مشهد"];
  const cities: { [key: string]: string[] } = {
    تهران: ["تهران", "ری", "شمیرانات"],
    اصفهان: ["اصفهان", "کاشان", "نجف‌آباد"],
    شیراز: ["شیراز", "مرودشت", "کازرون"],
    مشهد: ["مشهد", "نیشابور", "سبزوار"],
  };

  useEffect(() => {
    if (token) {
      fetchAddresses();
      fetchAccountInfo();
      fetchOrders();
      fetchWishlist();
      fetchTickets();
      fetchRecentActivities();
    }
  }, [token]);

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
        setSupportTickets(
          data.map((ticket: any) => ({
            id: ticket.id.toString(),
            subject: ticket.subject,
            message: ticket.message,
            status:
              ticket.status === "open"
                ? "باز"
                : ticket.status === "closed"
                ? "بسته"
                : ticket.status === "responded"
                ? "پاسخ داده شده"
                : "در انتظار",
            date: ticket.created_at,
            response: ticket.response,
          }))
        );
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
    setTrackingResult(null);
    setTrackingError("");
    if (!orderTrackingId.trim()) {
      setTrackingError("لطفاً شماره سفارش را وارد کنید.");
      return;
    }
    if (!/^\d+$/.test(orderTrackingId)) {
      setTrackingError("شماره سفارش باید فقط شامل اعداد باشد.");
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
        const errorData = await res.json();
        setTrackingResult(null);
        setTrackingError(errorData.error || "سفارش با این شماره یافت نشد.");
      }
    } catch (err) {
      setTrackingResult(null);
      setTrackingError("خطا در پیگیری سفارش.");
      console.log(err);
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
        setAddressError(errorData.error || "خطا در ذخیره آدرس");
      }
    } catch (err) {
      setAddressError("خطا در ارتباط با سرور");
      console.log(err);
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
      console.log(err);
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
        body: JSON.stringify({ status: "closed" }),
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
      console.log(err);
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
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        accountInfo={accountInfo}
        handleLogout={logout} // استفاده از logout از Context
      />
      <main className="ud-main">
        {activeTab === "dashboard" && (
          <DashboardContent
            orders={orders}
            wishlist={wishlist}
            accountInfo={accountInfo}
            supportTickets={supportTickets}
            recentActivities={recentActivities}
            orderTrackingId={orderTrackingId}
            setOrderTrackingId={setOrderTrackingId}
            trackingResult={trackingResult}
            trackingError={trackingError}
            handleTrackOrder={handleTrackOrder}
            setActiveTab={setActiveTab}
          />
        )}
        {activeTab === "orders" && (
          <OrdersContent
            orders={orders}
            selectedOrder={selectedOrder}
            isOrderModalOpen={isOrderModalOpen}
            setIsOrderModalOpen={setIsOrderModalOpen}
            handleViewOrderDetails={handleViewOrderDetails}
            modalStyle={modalStyle}
          />
        )}
        {activeTab === "wishlist" && (
          <WishlistContent
            wishlist={wishlist}
            handleAddToCart={handleAddToCart}
            handleRemoveFromWishlist={handleRemoveFromWishlist}
          />
        )}
        {activeTab === "tickets" && (
          <TicketsContent
            supportTickets={supportTickets}
            isTicketModalOpen={isTicketModalOpen}
            setIsTicketModalOpen={setIsTicketModalOpen}
            newTicket={newTicket}
            setNewTicket={setNewTicket}
            ticketError={ticketError}
            setTicketError={setTicketError}
            handleSubmitTicket={handleSubmitTicket}
            handleCloseTicket={handleCloseTicket}
            expandedAccordion={expandedAccordion}
            handleAccordionChange={handleAccordionChange}
            modalStyle={modalStyle}
          />
        )}
        {activeTab === "addresses" && (
          <AddressesContent
            addresses={addresses}
            newAddress={newAddress}
            setNewAddress={setNewAddress}
            addressError={addressError}
            setAddressError={setAddressError}
            showAddressForm={showAddressForm}
            setShowAddressForm={setShowAddressForm}
            editingAddressId={editingAddressId}
            setEditingAddressId={setEditingAddressId}
            provinces={provinces}
            cities={cities}
            handleAddAddress={handleAddAddress}
            handleEditAddress={handleEditAddress}
            handleDeleteAddress={handleDeleteAddress}
            expandedAccordion={expandedAccordion}
            handleAccordionChange={handleAccordionChange}
          />
        )}
        {activeTab === "account" && (
          <AccountContent
            accountInfo={accountInfo}
            handleAccountInfoChange={handleAccountInfoChange}
            handleSaveAccountInfo={handleSaveAccountInfo}
          />
        )}
      </main>
    </div>
  );
}
