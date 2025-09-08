"use client"
import React, { useEffect, useState } from "react";

export default function PaymentDone() {
  const [countdown, setCountdown] = useState(1000);
  const [orderCode, setOrderCode] = useState("");

  // تولید کد سفارش رندوم
  useEffect(() => {
    const code = "ORD-" + Math.floor(100000 + Math.random() * 900000);
    setOrderCode(code);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev === 1) {
          clearInterval(timer);
          // اینجا می‌تونی ریدایرکت به داشبورد بزنی
          window.location.href = "/dashboard";
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-gray-100 flex items-center justify-center min-h-screen px-4">
      <div className="bg-white p-8 sm:p-12 rounded-xl shadow-2xl max-w-lg w-full text-center animate-fade-in-scale">
        <div className="mx-auto flex items-center justify-center h-20 w-20 sm:h-24 sm:w-24 rounded-full bg-green-100 mb-6">
          <svg
            className="h-12 w-12 sm:h-16 sm:w-16 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"></path>
          </svg>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
          پرداخت با موفقیت انجام شد!
        </h1>

        <p className="text-gray-600 text-lg mb-6">
          از خرید شما سپاسگزاریم. سفارش شما در حال پردازش است و به‌زودی تاییدیه
          آن برایتان ارسال خواهد شد.
        </p>

        <div className="bg-gray-50 p-4 rounded-md mb-6">
          <p className="text-gray-700">
            کد سفارش شما:
            <span className="font-semibold text-green-600"> {orderCode} </span>
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-md mb-8">
          <p className="text-gray-700">
            به صورت خودکار تا{" "}
            <span
              id="countdown-timer"
              className="font-semibold text-red-600">
              {countdown}
            </span>{" "}
            ثانیه دیگر به داشبورد منتقل خواهید شد.
          </p>
        </div>

        <a
          href="/dashboard"
          id="manual-redirect-link"
          className="text-red-600 hover:text-red-700 font-medium transition-colors duration-200 underline">
          رفتن به داشبورد
        </a>
      </div>
    </div>
  );
}
