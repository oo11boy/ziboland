"use client";
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { Modal, Box, Typography } from "@mui/material";
import { View, Search, Filter, Trash2, Copy, CheckCircle, Clock, XCircle, RefreshCw, Truck, Package, ShoppingBag } from "lucide-react";
import { toast } from "react-toastify";
import Image from "next/image";
import { API } from "@/lib/MainRoutes";
import Cookies from "js-cookie";
import { Order } from "@/types/types";

// کامپوننت‌های کمکی برای مودال
// کامپوننت کمکی برای مودال - اصلاح شده
const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined | React.ReactNode;
}) => (
  <p className="text-sm">
    <span className="font-semibold text-gray-700 dark:text-gray-300">
      {label}:
    </span>{" "}
    <span className="text-gray-800 dark:text-gray-100">
      {value != null ? value : "-"}
    </span>
  </p>
);

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="space-y-3 mt-4">
    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-1">
      {title}
    </h3>
    <div className="text-gray-700 dark:text-gray-300">{children}</div>
  </div>
);

// تابع ترجمه روش ارسال
const translateShippingMethod = (method: string) => {
  const map: Record<string, string> = {
    "normal_free": "عادی (رایگان)",
    "normal_express": "پیشتاز",
    "fast_tehran": "سریع (تهران و مناطق ۲۲ گانه)",
    "fast_other": "سریع (استان تهران به جز شهر تهران)",
    "عادی (رایگان)": "عادی (رایگان)",
    "پیشتاز": "پیشتاز",
    "سریع (تهران و مناطق ۲۲ گانه)": "سریع (تهران و مناطق ۲۲ گانه)",
    "سریع (استان تهران به جز شهر تهران)": "سریع (استان تهران به جز شهر تهران)",
    "عادی": "عادی",
    "express": "اکسپرس",
  };
  return map[method] || method;
};

// کامپوننت Badge وضعیت پرداخت
const PaymentStatusBadge = ({ status }: { status: string }) => {
  const configs: Record<string, { label: string; icon: any; className: string }> = {
    paid: {
      label: "پرداخت شده",
      icon: CheckCircle,
      className: "bg-green-100 text-green-700 border-green-200"
    },
    pending: {
      label: "در انتظار پرداخت",
      icon: Clock,
      className: "bg-yellow-100 text-yellow-700 border-yellow-200"
    },
    failed: {
      label: "پرداخت ناموفق",
      icon: XCircle,
      className: "bg-red-100 text-red-700 border-red-200"
    },
    refunded: {
      label: "بازپرداخت شده",
      icon: RefreshCw,
      className: "bg-blue-100 text-blue-700 border-blue-200"
    }
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${config.className}`}>
      <Icon size={14} />
      {config.label}
    </span>
  );
};

// کامپوننت Badge وضعیت سفارش
const OrderStatusBadge = ({ status }: { status: string }) => {
  const configs: Record<string, { label: string; icon: any; className: string }> = {
    pending: {
      label: "در انتظار",
      icon: Clock,
      className: "bg-gray-100 text-gray-700 border-gray-200"
    },
    processing: {
      label: "در حال پردازش",
      icon: RefreshCw,
      className: "bg-blue-100 text-blue-700 border-blue-200"
    },
    shipped: {
      label: "ارسال شده",
      icon: Truck,
      className: "bg-purple-100 text-purple-700 border-purple-200"
    },
    delivered: {
      label: "تحویل داده شده",
      icon: Package,
      className: "bg-green-100 text-green-700 border-green-200"
    },
    cancelled: {
      label: "لغو شده",
      icon: XCircle,
      className: "bg-red-100 text-red-700 border-red-200"
    }
  };

  const config = configs[status] || configs.pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${config.className}`}>
      <Icon size={14} />
      {config.label}
    </span>
  );
};

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<{
    [key: number]: boolean;
  }>({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDeleteOrder = async (orderId: number, orderCode: string) => {
    if (
      !confirm(
        `آیا از حذف کامل سفارش #${orderCode} مطمئن هستید؟ این عمل غیرقابل بازگشت است.`,
      )
    ) {
      return;
    }

    try {
      const token = Cookies.get("authToken");
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("خطا در حذف سفارش");

      setOrders((prev) => prev.filter((o) => o.id !== orderId));
      toast.success("سفارش با موفقیت حذف شد");
    } catch (err: any) {
      toast.error(err.message || "مشکلی در حذف رخ داد");
    }
  };

  const fetchOrders = async () => {
    try {
      const token = Cookies.get("authToken");
      if (!token) {
        toast.error("لطفاً مجدداً وارد شوید");
        return;
      }

      const response = await fetch(`/api/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("خطا در دریافت سفارشات");
      }

      const data: Order[] = await response.json();

      const sortedData = data.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      setOrders(sortedData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast.error("خطا در بارگذاری سفارشات");
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const searchLower = searchTerm.toLowerCase();

      const matchesSearch =
        order.order_code.toLowerCase().includes(searchLower) ||
        `${order.first_name} ${order.last_name}`
          .toLowerCase()
          .includes(searchLower) ||
        order.username?.toLowerCase().includes(searchLower) ||
        order.email?.toLowerCase().includes(searchLower);

      const matchesPaymentStatus =
        paymentStatusFilter === "all" ||
        order.payment_status === paymentStatusFilter;

      const matchesOrderStatus =
        orderStatusFilter === "all" ||
        order.status === orderStatusFilter;

      return matchesSearch && matchesPaymentStatus && matchesOrderStatus;
    });
  }, [orders, searchTerm, paymentStatusFilter, orderStatusFilter]);

  const handleStatusChange = async (
    orderId: number,
    newStatus: Order["status"],
  ) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    if (
      order.payment_status !== "paid" &&
      ["shipped", "delivered"].includes(newStatus)
    ) {
      if (
        !confirm(
          `هشدار: این سفارش هنوز پرداخت نشده!\n` +
            `وضعیت پرداخت: ${translatePaymentStatus(order.payment_status)}\n` +
            `آیا مطمئن هستید که می‌خواهید وضعیت را به "${translateStatus(
              newStatus,
            )}" تغییر دهید؟`,
        )
      ) {
        return;
      }
    }

    if (
      !confirm(
        `آیا از تغییر وضعیت سفارش #${order.order_code} به "${translateStatus(
          newStatus,
        )}" مطمئن هستید؟`,
      )
    ) {
      return;
    }

    setStatusUpdating((prev) => ({ ...prev, [orderId]: true }));

    try {
      const token = Cookies.get("authToken");
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "خطا در به‌روزرسانی");
      }

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );

      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }

      toast.success("وضعیت سفارش با موفقیت تغییر کرد");
    } catch (err: any) {
      toast.error(err.message || "خطا در تغییر وضعیت");
    } finally {
      setStatusUpdating((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const translateStatus = (status: string) => {
    const map: Record<string, string> = {
      pending: "در انتظار",
      processing: "در حال پردازش",
      shipped: "ارسال شده",
      delivered: "تحویل داده شده",
      cancelled: "لغو شده",
    };
    return map[status] || status;
  };

  const translatePaymentStatus = (status: string) => {
    const map: Record<string, string> = {
      paid: "پرداخت شده",
      pending: "در انتظار پرداخت",
      failed: "پرداخت ناموفق",
      refunded: "بازپرداخت شده",
    };
    return map[status] || status;
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const copyToClipboard = (text: any) => {
    navigator.clipboard.writeText(text);
    toast.success("شماره کاربر کپی شد", { autoClose: 2000 });
  };

  // آمار سفارشات
  const stats = useMemo(() => {
    const total = orders.length;
    const paid = orders.filter(o => o.payment_status === "paid").length;
    const pending = orders.filter(o => o.payment_status === "pending").length;
    const failed = orders.filter(o => o.payment_status === "failed").length;
    const shipped = orders.filter(o => o.status === "shipped" || o.status === "delivered").length;
    return { total, paid, pending, failed, shipped };
  }, [orders]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-600"></div>
          <p className="text-gray-500 text-sm">در حال بارگذاری سفارشات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-7xl yekan">
      {/* عنوان و آمار */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
            مدیریت سفارشات
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            {stats.total} سفارش | {stats.paid} پرداخت شده | {stats.pending} در انتظار | {stats.failed} ناموفق | {stats.shipped} ارسال شده
          </p>
        </div>
      </div>

      {/* فیلترها و جستجو - ریسپانسیو */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {/* جستجو */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <Input
            placeholder="جستجو در سفارشات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 py-5 sm:py-6 bg-white dark:bg-gray-800 rounded-xl text-sm"
          />
        </div>

        {/* فیلتر وضعیت پرداخت */}
        <div>
          <Select
            value={paymentStatusFilter}
            onValueChange={setPaymentStatusFilter}
          >
            <SelectTrigger className="bg-white dark:bg-gray-800 rounded-xl h-11 sm:h-12">
              <Filter className="w-4 h-4 ml-2 text-gray-500" />
              <SelectValue placeholder="وضعیت پرداخت" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">✅ همه پرداخت‌ها</SelectItem>
              <SelectItem value="paid">✅ پرداخت شده</SelectItem>
              <SelectItem value="pending">⏳ در انتظار پرداخت</SelectItem>
              <SelectItem value="failed">❌ پرداخت ناموفق</SelectItem>
              <SelectItem value="refunded">🔄 بازپرداخت شده</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* فیلتر وضعیت سفارش */}
        <div>
          <Select
            value={orderStatusFilter}
            onValueChange={setOrderStatusFilter}
          >
            <SelectTrigger className="bg-white dark:bg-gray-800 rounded-xl h-11 sm:h-12">
              <Package className="w-4 h-4 ml-2 text-gray-500" />
              <SelectValue placeholder="وضعیت سفارش" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">📦 همه سفارشات</SelectItem>
              <SelectItem value="pending">⏳ در انتظار</SelectItem>
              <SelectItem value="processing">🔄 در حال پردازش</SelectItem>
              <SelectItem value="shipped">🚚 ارسال شده</SelectItem>
              <SelectItem value="delivered">✅ تحویل داده شده</SelectItem>
              <SelectItem value="cancelled">❌ لغو شده</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* تعداد سفارشات */}
        <div className="hidden lg:flex items-center justify-center text-sm text-gray-600 bg-gray-100 dark:bg-gray-800 rounded-xl px-4">
          نمایش {filteredOrders.length} از {orders.length} سفارش
        </div>
      </div>

      {/* نمایش موبایل: کارت‌های زیبا */}
      <div className="block lg:hidden space-y-4">
        {filteredOrders.length === 0 ? (
          <Card className="text-center py-12 bg-gray-50 dark:bg-gray-900 rounded-2xl">
            <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-lg text-gray-500">هیچ سفارشی یافت نشد</p>
            <p className="text-sm text-gray-400 mt-1">فیلترها را تغییر دهید</p>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card
              key={order.id}
              className="shadow-lg hover:shadow-xl transition-shadow rounded-2xl border-0"
            >
              <CardContent className="p-4 sm:p-6">
                {/* هدر کارت */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-lg font-bold text-purple-600">
                      #{order.order_code}
                    </p>
                    <p className="text-sm font-medium text-gray-700">
                      {order.first_name} {order.last_name}
                    </p>
                    <p className="text-xs text-gray-400">@{order.username}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <PaymentStatusBadge status={order.payment_status} />
                    <OrderStatusBadge status={order.status} />
                  </div>
                </div>

                {/* اطلاعات اصلی */}
                <div className="grid grid-cols-2 gap-2 text-sm bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3">
                  <div>
                    <p className="text-gray-500 text-xs">مبلغ</p>
                    <p className="font-bold">{(order.total_amount / 10).toLocaleString()} تومان</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">روش ارسال</p>
                    <p className="text-sm">{translateShippingMethod(order.shipping_method)}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-gray-500 text-xs">تاریخ</p>
                    <p className="text-sm">{new Date(order.created_at).toLocaleDateString("fa-IR")}</p>
                  </div>
                </div>

                {/* اکشن‌ها */}
                <div className="flex flex-wrap gap-2 mt-4">
                  <Select
                    value={order.status}
                    onValueChange={(newValue) => {
                      if (newValue !== order.status) {
                        handleStatusChange(
                          order.id,
                          newValue as Order["status"],
                        );
                      }
                    }}
                    disabled={statusUpdating[order.id]}
                  >
                    <SelectTrigger className="flex-1 min-w-[120px] text-xs h-10 rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">⏳ در انتظار</SelectItem>
                      <SelectItem value="processing">🔄 در حال پردازش</SelectItem>
                      <SelectItem value="shipped">🚚 ارسال شده</SelectItem>
                      <SelectItem value="delivered">✅ تحویل داده شده</SelectItem>
                      <SelectItem value="cancelled">❌ لغو شده</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 rounded-xl"
                      onClick={() => handleViewDetails(order)}
                      title="مشاهده جزئیات"
                    >
                      <View className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="hover:bg-red-100 dark:hover:bg-red-900/20 rounded-xl"
                      onClick={() =>
                        handleDeleteOrder(order.id, order.order_code)
                      }
                      title="حذف سفارش"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* نمایش دسکتاپ: جدول */}
      <div className="hidden lg:block">
        <Card className="shadow-xl rounded-2xl border-0 overflow-hidden">
          <CardHeader className="bg-gray-50 dark:bg-gray-800/50 border-b">
            <CardTitle className="text-xl flex items-center gap-2">
              <Package className="w-5 h-5 text-purple-600" />
              لیست کامل سفارشات
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-20 text-gray-500">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg">هیچ سفارشی با این فیلتر یافت نشد</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800/50">
                    <tr>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">شماره سفارش</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">کاربر</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">مبلغ</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">وضعیت سفارش</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">وضعیت پرداخت</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">روش ارسال</th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">تاریخ</th>
                      <th className="px-6 py-4 text-center text-sm font-bold text-gray-700 dark:text-gray-300">عملیات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <td className="px-6 py-4 font-mono text-purple-600 font-bold">
                          #{order.order_code}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium">
                              {order.first_name} {order.last_name}
                            </p>
                            <button
                              onClick={() => copyToClipboard(order.phone_number)}
                              className="text-sm text-gray-500 hover:text-purple-600 flex items-center gap-1 transition"
                              title="کپی شماره تلفن"
                            >
                              <Copy className="h-3 w-3" />
                              {order.phone_number}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-lg">
                          {(order.total_amount / 10).toLocaleString()} تومان
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <OrderStatusBadge status={order.status} />
                            <Select
                              value={order.status}
                              onValueChange={(newValue) => {
                                if (newValue !== order.status) {
                                  handleStatusChange(
                                    order.id,
                                    newValue as Order["status"],
                                  );
                                }
                              }}
                              disabled={statusUpdating[order.id]}
                            >
                              <SelectTrigger className="w-32 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">⏳ در انتظار</SelectItem>
                                <SelectItem value="processing">🔄 در حال پردازش</SelectItem>
                                <SelectItem value="shipped">🚚 ارسال شده</SelectItem>
                                <SelectItem value="delivered">✅ تحویل داده شده</SelectItem>
                                <SelectItem value="cancelled">❌ لغو شده</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <PaymentStatusBadge status={order.payment_status} />
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {translateShippingMethod(order.shipping_method)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString("fa-IR")}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex justify-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-xl"
                              onClick={() => handleViewDetails(order)}
                              title="مشاهده جزئیات"
                            >
                              <View className="w-5 h-5 text-blue-600" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="hover:bg-red-100 dark:hover:bg-red-900/20 rounded-xl"
                              onClick={() =>
                                handleDeleteOrder(order.id, order.order_code)
                              }
                              title="حذف سفارش"
                            >
                              <Trash2 className="w-5 h-5 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* مودال جزئیات سفارش */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        closeAfterTransition
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95%", sm: "85%", md: "75%", lg: "65%" },
            maxHeight: "90vh",
            overflowY: "auto",
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 24,
            p: { xs: 3, sm: 4, md: 5 },
            outline: "none",
          }}
        >
          {selectedOrder && (
            <div className="text-right">
              <Button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 text-2xl font-bold p-2 hover:bg-gray-100 rounded-full min-w-0 h-auto"
              >
                ✕
              </Button>

              <Typography
                variant="h4"
                className="text-center font-bold yekan text-xl sm:text-2xl text-purple-700 pb-6"
              >
                جزئیات سفارش #{selectedOrder.order_code}
              </Typography>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4">
                <InfoItem
                  label="نام و نام خانوادگی"
                  value={`${selectedOrder.first_name} ${selectedOrder.last_name}`}
                />
                <InfoItem label="ایمیل" value={selectedOrder.email} />
                <InfoItem label="شماره تلفن" value={selectedOrder.phone_number} />
                <InfoItem
                  label="تاریخ سفارش"
                  value={new Date(selectedOrder.created_at).toLocaleDateString("fa-IR")}
                />
                <InfoItem
                  label="مبلغ کل"
                  value={`${(selectedOrder.total_amount / 10).toLocaleString()} تومان`}
                />
                <InfoItem
                  label="وضعیت سفارش"
                  value={<OrderStatusBadge status={selectedOrder.status} />}
                />
                <InfoItem
                  label="وضعیت پرداخت"
                  value={<PaymentStatusBadge status={selectedOrder.payment_status} />}
                />
                <InfoItem
                  label="روش ارسال"
                  value={translateShippingMethod(selectedOrder.shipping_method)}
                />
              </div>

              <Section title="آدرس تحویل">
                <div className="bg-gray-50 dark:bg-gray-800/30 rounded-xl p-4">
                  {`${selectedOrder.province}، ${selectedOrder.city}، ${selectedOrder.street}`}
                  {selectedOrder.alley && `، کوچه ${selectedOrder.alley}`}
                  {selectedOrder.building_number &&
                    `، پلاک ${selectedOrder.building_number}`}
                  {selectedOrder.unit && `، واحد ${selectedOrder.unit}`}
                  {selectedOrder.postal_code &&
                    `، کد پستی: ${selectedOrder.postal_code}`}
                </div>
              </Section>

              <Section title="محصولات سفارش داده شده">
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 items-start p-4 bg-gray-50 dark:bg-gray-800/30 rounded-xl"
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover w-20 h-20"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 text-xs">
                          بدون تصویر
                        </div>
                      )}
                      <div className="flex-1 space-y-1">
                        <p className="font-semibold">{item.title}</p>
                        {item.color && (
                          <p className="text-sm text-gray-600">
                            رنگ: {item.color.persianName} ({item.color.englishName})
                          </p>
                        )}
                        <div className="flex flex-wrap items-center gap-3">
                          <span className="text-sm">تعداد: <span className={`font-bold ${item.quantity > 1 ? 'text-orange-500 text-xl' : ''}`}>{item.quantity}</span></span>
                          <span className="text-sm font-medium">قیمت واحد: {item.unit_price.toLocaleString()} تومان</span>
                          <span className="text-xs text-gray-500 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                            {item.price_type === "single" ? "تکی" : "عمده"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              {selectedOrder.extra_details && (
                <Section title="توضیحات اضافی سفارش">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-blue-700 dark:text-blue-300">
                    {selectedOrder.extra_details}
                  </div>
                </Section>
              )}

              <div className="text-center mt-8">
                <Button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 text-lg rounded-xl"
                >
                  بستن
                </Button>
              </div>
            </div>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default OrdersPage;