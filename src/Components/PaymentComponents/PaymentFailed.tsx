"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/ContextApi/CartContext";
import Link from "next/link";

interface Order {
  order_code: string;
}

export default function PaymentFailed() {
  const { state: { cartItems } } = useCart();
  const [countdown, setCountdown] = useState(15);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("متأسفانه پرداخت انجام نشد");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderId = params.get("orderId");
    const errorParam = params.get("error");

    if (errorParam) {
      setErrorMessage(decodeURIComponent(errorParam));
    }

    if (orderId) {
      fetch(`/api/orders/${orderId}`, { credentials: "include" })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data && data.order_code) {
            setOrder(data);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }

    // ذخیره موقت سبد خرید برای بازگشت کاربر
    localStorage.setItem("cartItemsBackup", JSON.stringify(cartItems));

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = "/checkout";
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [cartItems]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-red-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* هدر قرمز شکست */}
          <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white py-12 px-8 text-center">
            <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-white/20 backdrop-blur mb-6">
              <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-3">پرداخت ناموفق بود</h1>
            <p className="text-xl opacity-90">متأسفانه تراکنش انجام نشد</p>
          </div>

          {/* محتوای اصلی */}
          <div className="p-8 md:p-12 text-center">
            {/* پیام خطا */}
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 mb-10">
              <p className="text-xl md:text-2xl text-red-700 leading-relaxed">
                {errorMessage}
              </p>
            </div>

            {/* کد سفارش اگر موجود باشد */}
            {order && (
              <div className="bg-gray-100 rounded-2xl p-6 mb-10">
                <p className="text-gray-600 mb-2">شماره سفارش موقت</p>
                <p className="text-3xl font-black text-gray-800 tracking-wider">{order.order_code}</p>
                <p className="text-sm text-gray-500 mt-3">این کد را نزد خود نگه دارید</p>
              </div>
            )}

            {/* شمارش معکوس */}
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-2xl p-8 mb-10">
              <p className="text-2xl text-gray-800 mb-4">
                تا <span className="font-black text-red-600 text-4xl mx-2">{countdown}</span> ثانیه دیگر
              </p>
              <p className="text-xl text-gray-700">به سبد خرید بازمی‌گردید تا دوباره تلاش کنید</p>
            </div>

            {/* راهنما */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-10">
              <p className="text-lg text-blue-800 leading-relaxed">
                نگران نباشید! سبد خرید شما حفظ شده و می‌توانید دوباره پرداخت را امتحان کنید.
              </p>
            </div>

            {/* دکمه‌های اقدام */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
              <Link
                href="/checkout"
                className="px-10 py-6 bg-purple-600 hover:bg-purple-700 text-white font-black text-xl rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
              >
                تلاش مجدد برای پرداخت
              </Link>
           
            </div>

            {/* پیام آرامش‌بخش */}
            <p className="text-center text-gray-600 mt-12 text-lg">
              تیم زیبولند همیشه در کنار شماست 💜
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}