"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/ContextApi/AuthContext";
import Cookies from "js-cookie";
import { Pencil, ArrowRight, CheckCircle } from "lucide-react";

export default function MyAccountContainer() {
  const [step, setStep] = useState<"phone" | "code" | "profile">("phone");

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isEditingPhone, setIsEditingPhone] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/userdashboard";
  const { login } = useAuth();

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const normalizePhone = (p: any) => p.replace(/\D/g, "");

  const redirectWithRefresh = (path: string) => {
    window.location.href = path;
  };

  const handleSendCode = async (e: any) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const cleanPhone = normalizePhone(phone);

    if (cleanPhone.length !== 11 || !cleanPhone.startsWith("09")) {
      setError("شماره موبایل باید با ۰۹ شروع شود و ۱۱ رقم باشد");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 429 && data.remainingSeconds) {
          setError(`لطفاً ${data.remainingSeconds} ثانیه صبر کنید`);
          setResendTimer(data.remainingSeconds);
          if (step === "code") {
            setStep("phone");
          }
        } else {
          setError(data.error || "خطا در ارسال کد تأیید");
        }
        return;
      }

      setSuccess("کد تأیید برای شما ارسال شد");
      setStep("code");
      setResendTimer(60); // تغییر به 60 ثانیه
    } catch (err) {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (code.length !== 6) {
      setError("کد باید دقیقاً ۶ رقم باشد");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "کد تأیید اشتباه یا منقضی شده است");
        return;
      }

      if (data.isNew) {
        setStep("profile");
        setSuccess("لطفاً نام و نام خانوادگی خود را وارد کنید");
      } else {
        setSuccess("ورود با موفقیت انجام شد");
        login?.();
        
        const token = Cookies.get("authToken");
        if (token) {
          setTimeout(() => {
            redirectWithRefresh(redirectPath);
          }, 500);
        } else {
          setTimeout(() => {
            const tokenCheck = Cookies.get("authToken");
            if (tokenCheck) {
              redirectWithRefresh(redirectPath);
            } else {
              router.push(redirectPath);
              setTimeout(() => {
                window.location.reload();
              }, 600);
            }
          }, 300);
        }
      }
    } catch (err) {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteProfile = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!firstName.trim() || !lastName.trim()) {
      setError("نام و نام خانوادگی الزامی است");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/complete-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "خطا در تکمیل ثبت‌نام");
        return;
      }

      setSuccess("ثبت‌نام با موفقیت تکمیل شد");
      login?.();
      
      const token = Cookies.get("authToken");
      if (token) {
        setTimeout(() => {
          redirectWithRefresh(redirectPath);
        }, 500);
      } else {
        setTimeout(() => {
          const tokenCheck = Cookies.get("authToken");
          if (tokenCheck) {
            redirectWithRefresh(redirectPath);
          } else {
            router.push(redirectPath);
            setTimeout(() => {
              window.location.reload();
            }, 600);
          }
        }, 300);
      }
    } catch (err) {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");

    const cleanPhone = normalizePhone(phone);

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone }),
      });

      const data = await res.json();

      if (res.status === 429 && data.remainingSeconds) {
        setError(`لطفاً ${data.remainingSeconds} ثانیه صبر کنید`);
        setResendTimer(data.remainingSeconds);
        return;
      }

      if (res.ok) {
        setSuccess("کد جدید ارسال شد");
        setResendTimer(60); // تغییر به 60 ثانیه
      } else {
        setError(data.error || "خطا در ارسال مجدد");
      }
    } catch {
      setError("خطا در ارتباط با سرور");
    }
  };

  const handleEditPhone = () => {
    setIsEditingPhone(true);
    setStep("phone");
    setError("");
    setSuccess("");
    setCode("");
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh] px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-[#805B99] to-[#9f79c0] p-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">زیبولند</h1>
          <p className="text-purple-100 text-sm">
            {step === "phone" && "ورود / ثبت‌نام سریع با شماره موبایل"}
            {step === "code" && "کد تأیید را وارد کنید"}
            {step === "profile" && "تکمیل اطلاعات کاربری"}
          </p>
        </div>

        <div className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-center text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-center text-sm">
              {success}
            </div>
          )}

          {step === "phone" && (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  شماره موبایل
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="۰۹۱۲xxxxxxx"
                    maxLength={11}
                    pattern="09[0-9]{9}"
                    className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#805B99] focus:border-[#805B99] outline-none text-lg pr-12"
                    required
                    autoFocus
                  />
                </div>
                {isEditingPhone && (
                  <p className="text-xs text-blue-600 mt-2 flex items-center gap-1">
                    <Pencil className="w-3 h-3" />
                    در حال ویرایش شماره تماس
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg transition-all ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#805B99] hover:bg-[#6f4a82] shadow-md hover:shadow-lg"
                }`}
              >
                {loading ? "در حال ارسال ..." : "دریافت کد تأیید"}
              </button>

              {isEditingPhone && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingPhone(false);
                  }}
                  className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  انصراف از ویرایش
                </button>
              )}
            </form>
          )}

          {step === "code" && (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="text-center">
                <p className="text-gray-600 mb-3">کد ۶ رقمی ارسال شده به</p>
                <div className="flex items-center justify-center gap-2">
                  <p className="font-bold text-xl text-[#805B99]">{phone}</p>
                  <button
                    type="button"
                    onClick={handleEditPhone}
                    className="text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1 transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                    ویرایش
                  </button>
                </div>
              </div>

              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                placeholder="──────"
                className="w-full text-center text-5xl tracking-[1.2rem] font-mono border-2 border-gray-300 rounded-xl py-6 focus:border-[#805B99] focus:ring-2 focus:ring-[#805B99] outline-none"
                required
                autoFocus
              />

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg transition-all ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#805B99] hover:bg-[#6f4a82] shadow-md hover:shadow-lg"
                }`}
              >
                {loading ? "در حال بررسی ..." : "تأیید کد"}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={handleEditPhone}
                  className="text-blue-500 hover:text-blue-700 flex items-center gap-1 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                  اصلاح شماره تماس
                </button>
                <div>
                  {resendTimer > 0 ? (
                    <span className="text-gray-500">
                      ارسال مجدد پس از {resendTimer} ثانیه
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      className="text-[#805B99] font-medium hover:underline"
                    >
                      ارسال مجدد کد
                    </button>
                  )}
                </div>
              </div>
            </form>
          )}

          {step === "profile" && (
            <form onSubmit={handleCompleteProfile} className="space-y-6">
              <div className="text-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-gray-600 text-sm">
                  شماره شما تأیید شد. لطفاً اطلاعات خود را تکمیل کنید.
                </p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <p className="text-sm text-gray-500">{phone}</p>
                  <button
                    type="button"
                    onClick={handleEditPhone}
                    className="text-xs text-blue-500 hover:text-blue-700 flex items-center gap-1 transition-colors"
                  >
                    <Pencil className="w-3 h-3" />
                    ویرایش
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نام
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="نام خود را وارد کنید"
                  className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#805B99] focus:border-[#805B99] outline-none"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نام خانوادگی
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="نام خانوادگی خود را وارد کنید"
                  className="w-full px-5 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#805B99] focus:border-[#805B99] outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-4 px-6 rounded-xl text-white font-bold text-lg transition-all ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#805B99] hover:bg-[#6f4a82] shadow-md hover:shadow-lg"
                }`}
              >
                {loading ? "در حال ثبت ..." : "تکمیل ثبت‌نام و ورود"}
              </button>

              <button
                type="button"
                onClick={handleEditPhone}
                className="w-full py-2 text-sm text-blue-500 hover:text-blue-700 flex items-center justify-center gap-1 transition-colors"
              >
                <ArrowRight className="w-4 h-4" />
                اصلاح شماره تماس
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}