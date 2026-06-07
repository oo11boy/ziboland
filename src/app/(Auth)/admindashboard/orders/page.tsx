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
import { View, Search, Filter, Trash2, Copy } from "lucide-react";
import { toast } from "react-toastify";
import Image from "next/image";
import { API } from "@/lib/MainRoutes";
import Cookies from "js-cookie";
import { Order } from "@/types/types";

// کامپوننت‌های کمکی برای مودال
const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined; // این خط رو اضافه کن
}) => (
  <p className="text-sm">
    <span className="font-semibold text-gray-700 dark:text-gray-300">
      {label}:
    </span>{" "}
    <span className="text-gray-800 dark:text-gray-100">
      {value != null ? value : "-"} {/* این خط رو جایگزین کن */}
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

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<{
    [key: number]: boolean;
  }>({});

  // دریافت سفارشات از سرور
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
      const res = await fetch(`../api/admin/orders/${orderId}`, {
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

      const response = await fetch(`../api/admin/orders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("خطا در دریافت سفارشات");
      }

      const data: Order[] = await response.json();

      // مرتب‌سازی: جدیدترین‌ها اول
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

  // فیلتر ترکیبی: جستجو + وضعیت پرداخت
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

      return matchesSearch && matchesPaymentStatus;
    });
  }, [orders, searchTerm, paymentStatusFilter]);

  // تغییر وضعیت سفارش — نسخه جدید و حرفه‌ای
  const handleStatusChange = async (
    orderId: number,
    newStatus: Order["status"],
  ) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    // اگر پرداخت نشده و می‌خوای وضعیت رو به "ارسال شده" یا "تحویل داده شده" ببری → هشدار بده
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

    // اگر می‌خوای سفارش در انتظار پرداخت رو لغو کنی → اجازه بده
    // اگر می‌خوای به "در حال پردازش" ببری → هم اجازه بده (مثلاً سفارش تلفنی)

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
      const res = await fetch(`../api/admin/orders/${orderId}`, {
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

      // بروزرسانی محلی
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
  // ترجمه وضعیت‌ها
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
  // لودینگ
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 yekan">
      {/* عنوان */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center md:text-right">
        مدیریت سفارشات زیبولند
      </h1>

      {/* فیلترها و جستجو - کاملاً ریسپانسیو */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* جستجو */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="جستجو در سفارشات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 bg-white dark:bg-gray-800"
          />
        </div>

        {/* فیلتر وضعیت پرداخت */}
        <Select
          value={paymentStatusFilter}
          onValueChange={setPaymentStatusFilter}
        >
          <SelectTrigger className="bg-white dark:bg-gray-800">
            <Filter className="w-4 h-4 ml-2 text-gray-500" />
            <SelectValue placeholder="فیلتر وضعیت پرداخت" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه پرداخت‌ها</SelectItem>
            <SelectItem value="paid">پرداخت شده</SelectItem>
            <SelectItem value="pending">در انتظار پرداخت</SelectItem>
            <SelectItem value="failed">پرداخت ناموفق</SelectItem>
            <SelectItem value="refunded">بازپرداخت شده</SelectItem>
          </SelectContent>
        </Select>

        {/* تعداد سفارشات */}
        <div className="hidden lg:flex items-center justify-center text-sm text-gray-600 bg-gray-100 dark:bg-gray-800 rounded-lg px-4">
          نمایش {filteredOrders.length} از {orders.length} سفارش
        </div>
      </div>

      {/* نمایش موبایل: کارت‌های زیبا */}
      <div className="block lg:hidden space-y-4">
        {filteredOrders.length === 0 ? (
          <Card className="text-center py-16 bg-gray-50 dark:bg-gray-900">
            <p className="text-xl text-gray-500">هیچ سفارشی یافت نشد</p>
            <p className="text-sm text-gray-400 mt-2">فیلترها را تغییر دهید</p>
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card
              key={order.id}
              className="shadow-lg hover:shadow-xl transition-shadow"
            >
              <CardContent className="pt-6">
                {/* هدر کارت */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-lg font-bold text-purple-600">
                      #{order.order_code}
                    </p>
                    <p className="text-sm text-gray-600">
                      {order.first_name} {order.last_name}
                    </p>
                    <p className="text-xs text-gray-500">@{order.username}</p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        order.payment_status === "paid"
                          ? "bg-green-100 text-green-800"
                          : order.payment_status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {translatePaymentStatus(order.payment_status)}
                    </span>
                  </div>
                </div>

                {/* اطلاعات اصلی */}
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>مبلغ:</strong>{" "}
                    {(order.total_amount / 10).toLocaleString()} تومان
                  </p>
                  <p>
                    <strong>وضعیت:</strong> {translateStatus(order.status)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.created_at).toLocaleDateString("fa-IR")}
                  </p>
                </div>

                {/* اکشن‌ها */}
                <div className="flex gap-3 mt-5">
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
                    <SelectTrigger className="flex-1 text-xs h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">در انتظار</SelectItem>
                      <SelectItem value="processing">در حال پردازش</SelectItem>
                      <SelectItem value="shipped">ارسال شده</SelectItem>
                      <SelectItem value="delivered">تحویل داده شده</SelectItem>
                      <SelectItem value="cancelled">لغو شده</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleViewDetails(order)}
                  >
                    <View className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="hover:bg-red-100 dark:hover:bg-red-900"
                    onClick={() =>
                      handleDeleteOrder(order.id, order.order_code)
                    }
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* نمایش دسکتاپ: جدول حرفه‌ای */}
      <div className="hidden lg:block">
        <Card className="shadow-xl">
          <CardHeader className=" text-black rounded-t-lg">
            <CardTitle className="text-xl">لیست کامل سفارشات </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-20 text-gray-500 text-lg">
                هیچ سفارشی با این فیلتر یافت نشد
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">
                        شماره سفارش
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">
                        کاربر
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">
                        مبلغ
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">
                        وضعیت سفارش
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">
                        وضعیت پرداخت
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">
                        تاریخ
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">
                        عملیات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredOrders.map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="px-6 py-4 font-mono text-purple-600 font-bold">
                          #{order.order_code}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-right">
                            <p className="font-medium">
                              {order.first_name} {order.last_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              <button
                                onClick={() => {
                                  copyToClipboard(order.phone_number);
                                }}
                                className="text-gray-500 hover:text-purple-600 flex gap-2 transition"
                                title="کپی نام محصول"
                              >
                                <Copy className="h-4 w-4" />{" "}
                                {order.phone_number}
                              </button>
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-bold text-lg">
                          {(order.total_amount / 10).toLocaleString()} تومان
                        </td>
                        <td className="px-6 py-4">
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
                            <SelectTrigger className="w-44">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">در انتظار</SelectItem>
                              <SelectItem value="processing">
                                در حال پردازش
                              </SelectItem>
                              <SelectItem value="shipped">ارسال شده</SelectItem>
                              <SelectItem value="delivered">
                                تحویل داده شده
                              </SelectItem>
                              <SelectItem value="cancelled">لغو شده</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-4 py-2 rounded-full text-xs font-bold ${
                              order.payment_status === "paid"
                                ? "bg-green-100 text-green-800"
                                : order.payment_status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {translatePaymentStatus(order.payment_status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(order.created_at).toLocaleDateString(
                            "fa-IR",
                          )}
                        </td>
                        <td className="px-6 py-4 text-center flex">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="hover:bg-blue-100 dark:hover:bg-blue-900"
                            onClick={() => handleViewDetails(order)}
                          >
                            <View className="w-5 h-5 text-blue-600" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="hover:bg-red-100 dark:hover:bg-red-900"
                            onClick={() =>
                              handleDeleteOrder(order.id, order.order_code)
                            }
                          >
                            <Trash2 className="w-5 h-5 text-red-600" />
                          </Button>
                        </td>
                        <td className="px-6 py-4 text-center"></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* مودال جزئیات سفارش - کامل و ریسپانسیو */}
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
            width: { xs: "95%", sm: "80%", md: "70%", lg: "60%" },
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
              {/* دکمه بستن */}
              <Button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </Button>

              <Typography
                variant="h4"
                className="text-center font-bold yekan !text-lg  text-purple-700 pb-8"
              >
                جزئیات سفارش #{selectedOrder.order_code}
              </Typography>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <InfoItem
                  label="نام و نام خانوادگی"
                  value={`${selectedOrder.first_name} ${selectedOrder.last_name}`}
                />
                <InfoItem
                  label="نام کاربری"
                  value={`@${selectedOrder.username}`}
                />
                <InfoItem label="ایمیل" value={selectedOrder.email} />
                <InfoItem
                  label="شماره تلفن"
                  value={selectedOrder.phone_number}
                />
                <InfoItem
                  label="تاریخ سفارش"
                  value={new Date(selectedOrder.created_at).toLocaleDateString(
                    "fa-IR",
                  )}
                />
                <InfoItem
                  label="مبلغ کل"
                  value={`${(
                    selectedOrder.total_amount / 10
                  ).toLocaleString()} تومان`}
                />
                <InfoItem
                  label="وضعیت سفارش"
                  value={translateStatus(selectedOrder.status)}
                />
                <InfoItem
                  label="وضعیت پرداخت"
                  value={translatePaymentStatus(selectedOrder.payment_status)}
                />
                <InfoItem
                  label="روش ارسال"
                  value={
                    selectedOrder.shipping_method === "express"
                      ? "اکسپرس"
                      : "عادی"
                  }
                />
              </div>

              <Section title="آدرس تحویل">
                {`${selectedOrder.province}، ${selectedOrder.city}، ${selectedOrder.street}`}
                {selectedOrder.alley && `، کوچه ${selectedOrder.alley}`}
                {selectedOrder.building_number &&
                  `، پلاک ${selectedOrder.building_number}`}
                {selectedOrder.unit && `، واحد ${selectedOrder.unit}`}
                {selectedOrder.postal_code &&
                  `، کد پستی: ${selectedOrder.postal_code}`}
              </Section>

              <Section title="محصولات سفارش داده شده">
                <div className="grid gap-4">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 items-start p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          width={80}
                          height={80}
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center text-gray-500 text-xs">
                          بدون تصویر
                        </div>
                      )}
                      <div className="flex-1 space-y-2">
                        <p className="font-semibold">{item.title}</p>
                        {item.color && (
                          <p className="text-sm text-gray-600">
                            رنگ: {item.color.persianName} (
                            {item.color.englishName})
                          </p>
                        )}
                        <p className="text-sm">تعداد: {item.quantity}</p>
                        <p className="text-sm font-medium">
                          قیمت واحد: {item.unit_price.toLocaleString()} تومان
                        </p>
                        <p className="text-xs text-gray-500">
                          نوع قیمت:{" "}
                          {item.price_type === "single" ? "تکی" : "عمده"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              {selectedOrder.extra_details && (
                <Section title="توضیحات اختیاری">
                  {selectedOrder.extra_details}
                </Section>
              )}

              <div className="text-center mt-10">
                <Button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-3 text-lg rounded-xl"
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
