"use client";
import { useEffect, useState } from "react";
import { useCart } from "@/ContextApi/CartContext";

interface Order {
  order_code: string;
}

export default function PaymentFailed() {
  const { state: { cartItems } } = useCart();
  const [countdown, setCountdown] = useState(15);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string>("");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("orderId");
    const error = urlParams.get("error") || "unknown";

    setErrorMessage(
      error === "missing_params"
        ? "اطلاعات پرداخت ناقص است."
        : error === "server_error"
        ? "خطای سرور رخ داد."
        : error === "پرداخت لغو شده توسط کاربر"
        ? "شما پرداخت را لغو کردید. لطفاً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید."
        : decodeURIComponent(error)
    );

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

    localStorage.setItem("cartItems", JSON.stringify(cartItems));

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen px-4">
      <div className="bg-white p-8 sm:p-12 rounded-xl shadow-2xl max-w-lg w-full text-center animate-fade-in-scale">
        <div className="mx-auto flex items-center justify-center h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-red-100 mb-6">
          <svg
            className="h-12 w-12 sm:h-16 sm:w-16 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
          پرداخت ناموفق بود!
        </h1>

        <p className="text-gray-600 text-lg mb-4">
          {errorMessage || "متأسفانه پرداخت شما انجام نشد. لطفاً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید."}
        </p>

        {order && (
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <p className="text-gray-700">
              کد سفارش شما:
              <span className="font-semibold text-red-600"> {order.order_code} </span>
            </p>
          </div>
        )}

        <div className="bg-gray-50 p-4 rounded-md mb-8">
          <p className="text-gray-700">
            تا{" "}
            <span id="countdown-timer" className="font-semibold text-red-600">
              {countdown}
            </span>{" "}
            ثانیه دیگر به صفحه پرداخت هدایت خواهید شد.
          </p>
        </div>

        <div className="flex justify-center gap-4">
          <a
            href="/checkout"
            id="manual-redirect-link"
            className="text-red-600 hover:text-red-700 font-medium transition-colors duration-200 underline"
          >
            تلاش مجدد برای پرداخت
          </a>
          <a
            href="/support"
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200 underline"
          >
            تماس با پشتیبانی
          </a>
        </div>
      </div>
    </div>
  );
}