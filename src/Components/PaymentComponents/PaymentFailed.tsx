// src/Components/PaymentComponents/PaymentFailed.tsx
"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/ContextApi/CartContext";
import Link from "next/link";

interface Order { order_code: string; }

export default function PaymentFailed() {
  const { state: { cartItems } } = useCart();
  const [countdown, setCountdown] = useState(15);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");
    const error = params.get("error") || "پرداخت ناموفق بود";

    if (orderId) {
      fetch(`/api/orders/${orderId}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => { if (data) setOrder(data); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    localStorage.setItem("cartItems", JSON.stringify(cartItems));

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = "/checkout";
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cartItems]);

  if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-4 border-red-600"></div></div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-gray-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-lg w-full text-center">
        <div className="w-24 h-24 rounded-full bg-red-100 mx-auto mb-6 flex items-center justify-center">
          <svg className="w-16 h-16 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>

        <h1 className="text-4xl font-bold text-gray-800 mb-4">پرداخت ناموفق بود!</h1>
        <p className="text-lg text-gray-600 mb-8">{decodeURIComponent(new URLSearchParams(window.location.search).get("error") || "متأسفانه پرداخت انجام نشد")}</p>

        {order && (
          <div className="bg-red-50 rounded-xl p-6 mb-8">
            <p className="text-2xl font-bold text-red-700">کد سفارش: {order.order_code}</p>
          </div>
        )}

        <div className="bg-yellow-50 rounded-lg p-5 mb-8">
          <p className="text-gray-800">
            تا <span className="font-bold text-red-600 text-xl">{countdown}</span> ثانیه دیگر به سبد خرید بازمی‌گردید...
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/checkout" className="px-8 py-4 bg-purple-700 hover:bg-purple-800 text-white font-bold rounded-xl transition">
            تلاش مجدد برای پرداخت
          </Link>
          <Link href="/support" className="px-8 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-xl transition">
            تماس با پشتیبانی
          </Link>
        </div>
      </div>
    </div>
  );
}