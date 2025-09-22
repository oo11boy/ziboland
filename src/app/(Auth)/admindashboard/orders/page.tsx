"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Modal, Box, Typography } from "@mui/material";
import { Package, View } from "lucide-react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { API } from "@/lib/MainRoutes";
import Cookies from "js-cookie";

interface Order {
  id: number;
  order_code: string;
  user_id: number;
  username: string;
  email: string;
  first_name: string; // Added
  last_name: string; // Added
  phone_number: string; // Added
  total_amount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  payment_status: "pending" | "paid" | "failed" | "refunded";
  shipping_method: string;
  created_at: string;
  province: string;
  city: string;
  street: string;
  alley: string | null;
  building_number: string | null;
  unit: string | null;
  postal_code: string;
  items: {
    id: number;
    product_id: number;
    title: string;
    image: string | null;
    quantity: number;
    unit_price: number;
    price_type: "single" | "wholesale";
  }[];
}

const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<{ [key: number]: boolean }>({});

  const modalStyle = {
    position: "absolute" as "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: 600,
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    borderRadius: 2,
    maxHeight: "90vh",
    overflowY: "auto",
  };

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

  const handleStatusChange = async (orderId: number, newStatus: string) => {
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

  const translateStatus = (status: string) => {
    switch (status) {
      case "pending": return "در انتظار";
      case "processing": return "در حال پردازش";
      case "shipped": return "ارسال شده";
      case "delivered": return "تحویل داده شده";
      case "cancelled": return "لغو شده";
      default: return status;
    }
  };

  const translatePaymentStatus = (status: string) => {
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
                        onValueChange={(value) => handleStatusChange(order.id, value)}
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
      >
        <Box sx={modalStyle}>
          <Typography
            sx={{ fontFamily: "yekannew" }}
            id="order-modal-title"
            variant="h6"
            component="h2"
            className="text-right"
          >
            جزئیات سفارش #{selectedOrder?.order_code}
          </Typography>
          {selectedOrder && (
            <div className="space-y-4 text-right">
              <p>
                <strong>کاربر:</strong> {selectedOrder.first_name} {selectedOrder.last_name} ({selectedOrder.username})
              </p>
              <p>
                <strong>ایمیل:</strong> {selectedOrder.email}
              </p>
              <p>
                <strong>شماره تلفن:</strong> {selectedOrder.phone_number}
              </p>
              <p>
                <strong>شماره سفارش:</strong> {selectedOrder.order_code}
              </p>
              <p>
                <strong>تاریخ:</strong>{" "}
                {new Date(selectedOrder.created_at).toLocaleDateString("fa-IR")}
              </p>
              <p>
                <strong>مبلغ کل:</strong>{" "}
                {(selectedOrder.total_amount / 10).toLocaleString()} تومان
              </p>
              <p>
                <strong>وضعیت:</strong> {translateStatus(selectedOrder.status)}
              </p>
              <p>
                <strong>وضعیت پرداخت:</strong>{" "}
                {translatePaymentStatus(selectedOrder.payment_status)}
              </p>
              <p>
                <strong>روش ارسال:</strong>{" "}
                {selectedOrder.shipping_method === "express" ? "اکسپرس" : "عادی"}
              </p>
              <p>
                <strong>آدرس:</strong>{" "}
                {`${selectedOrder.province}، ${selectedOrder.city}، ${selectedOrder.street}${
                  selectedOrder.alley ? `، ${selectedOrder.alley}` : ""
                }${selectedOrder.building_number ? `، پلاک ${selectedOrder.building_number}` : ""}${
                  selectedOrder.unit ? `، واحد ${selectedOrder.unit}` : ""
                }، کدپستی: ${selectedOrder.postal_code}`}
              </p>
              <h3 className="font-semibold">محصولات:</h3>
              <ul className="space-y-2">
                {selectedOrder.items.map((item) => (
                  <li key={item.id} className="border-b py-2">
                    <div className="flex items-center gap-4">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.title}
                          width={48}
                          height={48}
                          className="object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded">
                          بدون تصویر
                        </div>
                      )}
                      <div>
                        <p>
                          <strong>محصول:</strong> {item.title}
                        </p>
                        <p>
                          <strong>تعداد:</strong> {item.quantity}
                        </p>
                        <p>
                          <strong>قیمت واحد:</strong>{" "}
                          {(item.unit_price / 10).toLocaleString()} تومان
                        </p>
                        <p>
                          <strong>نوع قیمت:</strong>{" "}
                          {item.price_type === "single" ? "تکی" : "عمده"}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => setIsModalOpen(false)}
                className="mt-4 bg-gray-500 hover:bg-gray-600 text-white"
              >
                بستن
              </Button>
            </div>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default OrdersPage;