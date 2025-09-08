"use client";
import React, { useState } from "react";
import { Email, Lock, Person, Phone, VpnKey } from "@mui/icons-material";

export default function MyAccountContainer() {
  const [formType, setFormType] = useState<"login" | "register" | "forgot">(
    "login"
  );

  return (
    <div className="flex justify-center items-center mb-4 lg:min-h-[85vh] mx-2">
      <div className="bg-white shadow-xl overflow-hidden w-full max-w-lg animate-fade-in ">
        {/* Header */}
        <div className="bg-[#805B99] p-4 sm:p-6 text-center relative">
          <h2 className="text-xl sm:text-2xl font-bold text-white relative z-10">
            {formType === "login"
              ? "ورود به حساب"
              : formType === "register"
              ? "ثبت‌نام"
              : "فراموشی رمز عبور"}
          </h2>
          <p className="text-sm sm:text-base text-blue-100 mt-1 relative z-10">
            {formType === "login"
              ? "برای ادامه وارد حساب شوید"
              : formType === "register"
              ? "لطفا اطلاعات خود را تکمیل کنید"
              : "ایمیل خود را وارد کنید تا لینک بازیابی ارسال شود"}
          </p>
        </div>

        {/* Forms */}
        <div className="p-5 sm:p-8 space-y-6 text-sm sm:text-base">
          {/* فرم ورود */}
          {formType === "login" && (
            <form className="space-y-4 sm:space-y-5">
              <div className="relative flex items-center">
                <Email className="absolute left-3 text-gray-400 text-base sm:text-lg" />
                <input
                  type="email"
                  className="w-full py-2.5 sm:py-3 pl-10 pr-4 border  bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none text-right text-sm sm:text-base"
                  placeholder="ایمیل"
                />
              </div>

              <div className="relative flex items-center">
                <Lock className="absolute left-3 text-gray-400 text-base sm:text-lg" />
                <input
                  type="password"
                  className="w-full py-2.5 sm:py-3 pl-10 pr-4 border  bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none text-right text-sm sm:text-base"
                  placeholder="رمز عبور"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#805B99] text-white py-2.5 sm:py-3  font-medium transition-all shadow-md text-sm sm:text-base"
              >
                ورود
              </button>

              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setFormType("forgot")}
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 transition"
                >
                  فراموشی رمز عبور؟
                </button>
              </div>
            </form>
          )}

          {/* فرم ثبت‌نام */}
          {formType === "register" && (
            <form className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative flex items-center">
                  <Person className="absolute left-3 text-gray-400" />
                  <input
                    type="text"
                    className=" w-full py-2.5 sm:py-3 pl-4 pr-4 border  bg-gray-50 focus:ring-2 focus:ring-green-400 outline-none text-right text-sm sm:text-base"
                    placeholder="نام"
                  />
                </div>
                <div className="relative flex items-center">
                  <Person className="absolute left-3 text-gray-400" />
                  <input
                    type="text"
                    className="py-2.5 sm:py-3 w-full pl-4 pr-4 border  bg-gray-50 focus:ring-2 focus:ring-green-400 outline-none text-right text-sm sm:text-base"
                    placeholder="نام خانوادگی"
                  />
                </div>
              </div>

              <div className="relative flex items-center">
                <Email className="absolute left-3 text-gray-400" />
                <input
                  type="email"
                  className="w-full py-2.5 sm:py-3 pl-4 pr-4 border  bg-gray-50 focus:ring-2 focus:ring-green-400 outline-none text-right text-sm sm:text-base"
                  placeholder="ایمیل"
                />
              </div>

              <div className="relative flex items-center">
                <Phone className="absolute left-3 text-gray-400" />
                <input
                  type="tel"
                  className="w-full py-2.5 sm:py-3 pl-4 pr-4 border  bg-gray-50 focus:ring-2 focus:ring-green-400 outline-none text-right text-sm sm:text-base"
                  placeholder="09xxxxxxxxx"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 text-gray-400" />
                  <input
                    type="password"
                    className="w-full py-2.5 sm:py-3 pl-4 pr-4 border  bg-gray-50 focus:ring-2 focus:ring-green-400 outline-none text-right text-sm sm:text-base"
                    placeholder="رمز عبور"
                  />
                </div>
                <div className="relative flex items-center">
                  <VpnKey className="absolute left-3 text-gray-400" />
                  <input
                    type="password"
                    className="w-full py-2.5 sm:py-3 pl-4 pr-4 border  bg-gray-50 focus:ring-2 focus:ring-green-400 outline-none text-right text-sm sm:text-base"
                    placeholder="تکرار رمز عبور"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#805B99] text-white py-2.5 sm:py-3  font-medium transition-all shadow-md text-sm sm:text-base"
              >
                ثبت‌نام
              </button>
            </form>
          )}

          {/* فرم فراموشی رمز */}
          {formType === "forgot" && (
            <form className="space-y-4 sm:space-y-5">
              <div className="relative flex items-center">
                <Email className="absolute left-3 text-gray-400" />
                <input
                  type="email"
                  className="w-full py-2.5 sm:py-3 pl-10 pr-4 border  bg-gray-50 focus:ring-2 focus:ring-purple-400 outline-none text-right text-sm sm:text-base"
                  placeholder="ایمیل"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#805B99] text-white py-2.5 sm:py-3  font-medium transition-all shadow-md text-sm sm:text-base"
              >
                ارسال لینک بازیابی
              </button>
            </form>
          )}

          {/* Toggle Links */}
          <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm">
            {formType === "login" && (
              <p className="text-gray-600">
                حساب کاربری ندارید؟{" "}
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 font-semibold transition"
                  onClick={() => setFormType("register")}
                >
                  ثبت‌نام
                </button>
              </p>
            )}
            {formType === "register" && (
              <p className="text-gray-600">
                قبلا ثبت‌نام کرده‌اید؟{" "}
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 font-semibold transition"
                  onClick={() => setFormType("login")}
                >
                  ورود
                </button>
              </p>
            )}
            {formType === "forgot" && (
              <p className="text-gray-600">
                بازگشت به{" "}
                <button
                  type="button"
                  className="text-blue-600 hover:text-blue-800 font-semibold transition"
                  onClick={() => setFormType("login")}
                >
                  ورود
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
