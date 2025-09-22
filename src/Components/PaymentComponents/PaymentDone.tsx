"use client";
import { useEffect, useState } from "react";

interface Order {
  id: number;
  order_code: string;
  total_amount: number;
  shipping_method: string;
  province: string;
  city: string;
  street: string;
  alley?: string;
  building_number?: string;
  unit?: string;
  postal_code?: string;
  items: Array<{
    id: number;
    product_id: number;
    quantity: number;
    unit_price: number;
    title: string;
  }>;
}

const formatAddress = (order: Order): string => {
  const parts = [
    order.street,
    order.alley ? `کوچه ${order.alley}` : "",
    order.building_number ? `پلاک ${order.building_number}` : "",
    order.unit ? `واحد ${order.unit}` : "",
    order.city,
    order.province,
    order.postal_code ? `کد پستی ${order.postal_code}` : "",
  ];
  return parts.filter(Boolean).join("، ");
};

export default function PaymentDone() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("orderId");

    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then((res) => {
          if (!res.ok) throw new Error("سفارش یافت نشد");
          return res.json();
        })
        .then((data) => {
          setOrder(data);
          setLoading(false);
        })
        .catch((err) => {
          console.error("خطا در بارگذاری سفارش:", err);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center">
          <p className="text-red-600 mb-4">سفارش یافت نشد</p>
          <p className="text-gray-600">
            لطفاً با{" "}
            <a href="/support" className="text-blue-600 underline">
              پشتیبانی
            </a>{" "}
            تماس بگیرید.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen px-4">
      <div className="bg-white p-8 sm:p-12 rounded-xl shadow-2xl max-w-2xl w-full text-right animate-fade-in-scale">
        <div className="mx-auto flex items-center justify-center h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-green-100 mb-6">
          <svg
            className="h-12 w-12 sm:h-16 sm:w-16 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-6 text-center">
          پرداخت با موفقیت انجام شد 🎉
        </h1>

        <div className="space-y-4 text-sm sm:text-base">
          <p>
            <span className="font-semibold">کد سفارش:</span> {order.order_code}
          </p>
          <p>
            <span className="font-semibold">مبلغ کل:</span>{" "}
            {(order.total_amount / 10).toLocaleString("fa-IR")} تومان
          </p>
          <p>
            <span className="font-semibold">روش ارسال:</span>{" "}
            {order.shipping_method === "normal" ? "ارسال عادی" : "ارسال پیشتاز"}
          </p>
          <p>
            <span className="font-semibold">آدرس:</span> {formatAddress(order)}
          </p>
        </div>

        <div className="mt-6">
          <h2 className="font-semibold text-lg mb-2">محصولات سفارش</h2>
          <ul className="divide-y divide-gray-200">
            {order.items.map((item) => (
              <li key={item.id} className="py-2 flex justify-between">
                <span>
                  {item.title} × {item.quantity}
                </span>
                <span>{(item.unit_price ).toLocaleString("fa-IR")} تومان</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 text-center">
          <a
            href="../userdashboard"
            className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
          >
            رفتن به داشبورد
          </a>
        </div>
      </div>
    </div>
  );
}