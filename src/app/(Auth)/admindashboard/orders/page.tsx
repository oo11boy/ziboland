// src/app/(Auth)/admindashboard/orders/page.tsx
"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Modal, Box, Typography } from "@mui/material";
import {  View } from "lucide-react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { API } from "@/lib/MainRoutes";
import Cookies from "js-cookie";
import { Order } from "@/types/types";
const InfoItem = ({ label, value }: { label: string; value: string | number }) => (
  <p>
    <span className="font-semibold text-gray-700 dark:text-gray-300">{label}:</span>{" "}
    <span className="text-gray-800 dark:text-gray-100">{value}</span>
  </p>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <h3 className="font-bold text-gray-800 dark:text-gray-200">{title}</h3>
    <div className="text-gray-700 dark:text-gray-300">{children}</div>
  </div>
);

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<{ [key: number]: boolean }>({});



  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = Cookies.get("authToken");
      const response = await fetch(`${API}/admin/orders`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch orders");
      const data = await response.json();
      setOrders(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching orders:", err);
      toast.error("خطا در دریافت سفارشات");
      setLoading(false);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleStatusChange = async (orderId: number, newStatus: Order["status"]) => {
    if (!confirm(`آیا مطمئن هستید که می‌خواهید وضعیت سفارش #${orderId} را به "${translateStatus(newStatus)}" تغییر دهید؟`)) {
      return;
    }
    setStatusUpdating((prev) => ({ ...prev, [orderId]: true }));
    try {
      const token = Cookies.get("authToken");
      const response = await fetch(`${API}/admin/orders/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "خطا در به‌روزرسانی وضعیت");
      }
      setOrders((prev) =>
        prev.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      toast.success("وضعیت سفارش با موفقیت به‌روزرسانی شد");
    } catch (err) {
      toast.error(`خطا در به‌روزرسانی وضعیت: ${(err as Error).message}`);
    } finally {
      setStatusUpdating((prev) => ({ ...prev, [orderId]: false }));
    }
  };

  const translateStatus = (status: Order["status"]) => {
    switch (status) {
      case "pending": return "در انتظار";
      case "processing": return "در حال پردازش";
      case "shipped": return "ارسال شده";
      case "delivered": return "تحویل داده شده";
      case "cancelled": return "لغو شده";
      default: return status;
    }
  };

  const translatePaymentStatus = (status: Order["payment_status"]) => {
    switch (status) {
      case "pending": return "در انتظار پرداخت";
      case "paid": return "پرداخت شده";
      case "failed": return "پرداخت ناموفق";
      case "refunded": return "بازپرداخت شده";
      default: return status;
    }
  };

  if (loading) {
    return <div className="text-center py-8">در حال بارگذاری...</div>;
  }

  return (
    <div className="space-y-6 yekan">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          سفارشات
        </h1>
      </div>

      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle>لیست سفارشات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base table-auto border-collapse">
              <thead className="hidden md:table-header-group">
                <tr className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  <th className="px-4 py-2 text-right">شماره سفارش</th>
                  <th className="px-4 py-2 text-right">کاربر</th>
                  <th className="px-4 py-2 text-right">مبلغ (تومان)</th>
                  <th className="px-4 py-2 text-right">وضعیت</th>
                  <th className="px-4 py-2 text-right">وضعیت پرداخت</th>
                  <th className="px-4 py-2 text-right">روش ارسال</th>
                  <th className="px-4 py-2 text-right">تاریخ</th>
                  <th className="px-4 py-2 text-right">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="block md:table-row border-b md:border-0 border-gray-200 dark:border-gray-700 mb-4 md:mb-0 rounded-lg md:rounded-none shadow-sm md:shadow-none bg-gray-50 md:bg-transparent dark:bg-gray-900 md:dark:bg-transparent"
                  >
                    <td className="px-4 py-2 text-right block md:table-cell">
                      <span className="font-medium md:hidden">شماره سفارش: </span>
                      {order.order_code}
                    </td>
                    <td className="px-4 py-2 text-right block md:table-cell">
                      <span className="font-medium md:hidden">کاربر: </span>
                      {order.first_name} {order.last_name} ({order.username})
                    </td>
                    <td className="px-4 py-2 text-right block md:table-cell">
                      <span className="font-medium md:hidden">مبلغ: </span>
                      {(order.total_amount / 10).toLocaleString()} تومان
                    </td>
                    <td className="px-4 py-2 text-right block md:table-cell">
                      <span className="font-medium md:hidden">وضعیت: </span>
                      <Select
                        value={order.status}
                        onValueChange={(value: Order["status"]) => handleStatusChange(order.id, value)}
                        disabled={statusUpdating[order.id]}
                      >
                        <SelectTrigger className="w-[120px]">
                          <SelectValue>{translateStatus(order.status)}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">در انتظار</SelectItem>
                          <SelectItem value="processing">در حال پردازش</SelectItem>
                          <SelectItem value="shipped">ارسال شده</SelectItem>
                          <SelectItem value="delivered">تحویل داده شده</SelectItem>
                          <SelectItem value="cancelled">لغو شده</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="px-4 py-2 text-right block md:table-cell">
                      <span className="font-medium md:hidden">وضعیت پرداخت: </span>
                      {translatePaymentStatus(order.payment_status)}
                    </td>
                    <td className="px-4 py-2 text-right block md:table-cell">
                      <span className="font-medium md:hidden">روش ارسال: </span>
                      {order.shipping_method === "express" ? "اکسپرس" : "عادی"}
                    </td>
                    <td className="px-4 py-2 text-right block md:table-cell">
                      <span className="font-medium md:hidden">تاریخ: </span>
                      {new Date(order.created_at).toLocaleDateString("fa-IR")}
                    </td>
                    <td className="px-4 py-2 block md:table-cell">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(order)}
                      >
                        <View className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

<Modal
  open={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  aria-labelledby="order-modal-title"
  aria-describedby="order-modal-description"
  closeAfterTransition
  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
>
  <Box
    sx={{
      width: "90%",
      maxWidth: 720,
      bgcolor: "background.paper",
      borderRadius: 3,
      boxShadow: 30,
      maxHeight: "90vh",
      overflowY: "auto",
      p: 4,
      outline: "none",
      fontFamily: "yekannew",
      position: "relative",
    }}
  >
    {/* Header */}
    <Box
      sx={{
        position: "sticky",
        top: 0,
        bgcolor: "background.paper",
        zIndex: 10,
        borderBottom: "1px solid #e5e7eb",
        pb: 2,
        mb: 4,
      }}
    >
      <Typography
        id="order-modal-title"
        variant="h5"
        component="h2"
        className="text-right font-bold text-gray-800 dark:text-white"
      >
        جزئیات سفارش #{selectedOrder?.order_code}
      </Typography>
      <Button
        onClick={() => setIsModalOpen(false)}
        className="absolute top-2 left-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
      >
        ✕
      </Button>
    </Box>

    {selectedOrder && (
      <div className="space-y-6 text-right">
        {/* کاربر و اطلاعات پایه */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <InfoItem label="کاربر" value={`${selectedOrder.first_name} ${selectedOrder.last_name} (${selectedOrder.username})`} />
          <InfoItem label="ایمیل" value={selectedOrder.email ?? '-'} />
          <InfoItem label="شماره تلفن" value={selectedOrder.phone_number ?? '-'} />
          <InfoItem label="شماره سفارش" value={selectedOrder.order_code} />
          <InfoItem label="تاریخ" value={new Date(selectedOrder.created_at).toLocaleDateString("fa-IR")} />
          <InfoItem label="مبلغ کل" value={`${(selectedOrder.total_amount / 10).toLocaleString()} تومان`} />
          <InfoItem label="وضعیت" value={translateStatus(selectedOrder.status)} />
          <InfoItem label="وضعیت پرداخت" value={translatePaymentStatus(selectedOrder.payment_status)} />
          <InfoItem label="روش ارسال" value={selectedOrder.shipping_method === "express" ? "اکسپرس" : "عادی"} />
        </div>

        {/* آدرس */}
        <Section title="آدرس">
          {`${selectedOrder.province}، ${selectedOrder.city}، ${selectedOrder.street}${selectedOrder.alley ? `، ${selectedOrder.alley}` : ""}${selectedOrder.building_number ? `، پلاک ${selectedOrder.building_number}` : ""}${selectedOrder.unit ? `، واحد ${selectedOrder.unit}` : ""}، کدپستی: ${selectedOrder.postal_code}`}
        </Section>

        {/* محصولات */}
        <Section title="محصولات">
          <ul className="space-y-3">
            {selectedOrder.items.map((item) => (
              <li key={item.id} className="border p-3 rounded-lg flex gap-4 items-start hover:shadow-md transition-shadow duration-200">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.title}
                    width={64}
                    height={64}
                    className="object-cover rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-200 flex items-center justify-center rounded text-sm text-gray-500">
                    بدون تصویر
                  </div>
                )}
                <div className="flex-1 space-y-1">
                  <InfoItem label="محصول" value={item.title} />
                  {item.color && <InfoItem label="رنگ" value={`${item.color.persianName} (${item.color.englishName})`} />}
                  <InfoItem label="تعداد" value={item.quantity} />
                  <InfoItem label="قیمت واحد" value={`${(item.unit_price / 10).toLocaleString()} تومان`} />
                  <InfoItem label="نوع قیمت" value={item.price_type === "single" ? "تکی" : "عمده"} />
                </div>
              </li>
            ))}
          </ul>
        </Section>

        {/* دکمه بستن */}
        <div className="flex justify-end mt-6">
          <Button className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md" onClick={() => setIsModalOpen(false)}>
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