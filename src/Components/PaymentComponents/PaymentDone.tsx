// src/Components/PaymentComponents/PaymentDone.tsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  title: string;
  image?: string;
  color?: { persianName?: string } | null;
}

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
  items: OrderItem[];
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

    if (!orderId) {
      setLoading(false);
      return;
    }

    fetch(`/api/orders/${orderId}`, { credentials: "include" })
      .then(res => {
        if (!res.ok) throw new Error("سفارش یافت نشد");
        return res.json();
      })
      .then(data => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-green-600"></div></div>;

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-10 rounded-xl shadow-xl text-center">
          <p className="text-red-600 text-xl mb-4">سفارش یافت نشد</p>
          <Link href="/support" className="text-blue-600 underline">تماس با پشتیبانی</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-3xl w-full text-right">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 mb-6">
            <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-800">پرداخت با موفقیت انجام شد</h1>
        </div>

        <div className="bg-green-50 rounded-xl p-6 mb-8 border border-green-200">
          <p className="text-2xl font-bold text-green-700">کد سفارش: {order.order_code}</p>
          <p className="text-lg mt-2">مبلغ پرداختی: {(order.total_amount / 10).toLocaleString("fa-IR")} تومان</p>
        </div>

        <div className="space-y-4 text-gray-700">
          <p><strong>روش ارسال:</strong> {order.shipping_method === "normal" ? "ارسال عادی" : "ارسال پیشتاز"}</p>
          <p><strong>آدرس تحویل:</strong> {formatAddress(order)}</p>
        </div>

        <div className="mt-8">
          <h3 className="font-bold text-lg mb-4">محصولات سفارش داده شده</h3>
          <div className="space-y-3">
            {order.items.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <div>
                  <p className="font-medium">{item.title} × {item.quantity}</p>
                  {item.color && <p className="text-sm text-gray-600">رنگ: {item.color.persianName}</p>}
                </div>
                <p className="font-semibold">{(item.unit_price / 10).toLocaleString("fa-IR")} تومان</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/userdashboard"
            className="inline-block px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition shadow-lg"
          >
            رفتن به داشبورد کاربری
          </Link>
        </div>
      </div>
    </div>
  );
}