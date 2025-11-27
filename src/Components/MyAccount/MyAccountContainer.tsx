"use client";
import React, { useState, useEffect } from "react";
import { Email, Lock, Person, Phone, VpnKey } from "@mui/icons-material";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/ContextApi/AuthContext";

export default function MyAccountContainer() {
  const [formType, setFormType] = useState<"login" | "register" | "forgot" | "verify">("login");
  const [verificationStep, setVerificationStep] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "/userdashboard";
  const { login } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setError("");
  };

  // تایمر ارسال مجدد کد
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.email || !formData.password) {
      setError("ایمیل و رمز عبور الزامی هستند");
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await res.json();

      if (res.ok) {
        login();
        setSuccess("ورود با موفقیت انجام شد. در حال انتقال...");
        setTimeout(() => router.push(redirectPath), 1500);
      } else {
        setError(data.error || "خطا در ورود");
      }
    } catch (err) {
      setError("خطا در ارتباط با سرور");
    }
  };

const handleRegister = async (e: React.FormEvent) => {
  e.preventDefault();
  setError("");
  setSuccess("");

  // اعتبارسنجی سمت کلاینت
  if (!formData.username || !formData.email || !formData.password || !formData.firstName || !formData.lastName) {
    setError("همه فیلدهای الزامی را پر کنید");
    return;
  }

  if (formData.password !== formData.confirmPassword) {
    setError("رمزهای عبور مطابقت ندارند");
    return;
  }

  if (formData.password.length < 6) {
    setError("رمز عبور باید حداقل ۶ کاراکتر باشد");
    return;
  }

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: formData.username,
        password: formData.password,
        email: formData.email,
        phone_number: formData.phoneNumber || null,
        first_name: formData.firstName,
        last_name: formData.lastName,
      }),
    });

    const data = await res.json();

    // فقط اگر ثبت‌نام موفق بود و نیاز به تأیید داشت → برو مرحله verify
    if (res.ok && data.requireVerification) {
      setVerificationEmail(data.email);
      setFormType("verify");
      setSuccess("کد تأیید به ایمیل شما ارسال شد");
      setResendTimer(120);
      return; // مهم: خارج شو تا بقیه اجرا نشه
    }

    // اگر ثبت‌نام موفق بود ولی نیازی به تأیید نداشت (مثلاً ادمین مستقیم فعال کنه)
    if (res.ok) {
      setSuccess("ثبت‌نام با موفقیت انجام شد");
      setTimeout(() => setFormType("login"), 2000);
      return;
    }

    // در همه حالات خطا (تکراری بودن، خطای سرور و...)
    setError(data.error || "خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.");

  } catch (err) {
    setError("خطا در ارتباط با سرور. لطفاً اینترنت خود را بررسی کنید.");
  }
};

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (verificationCode.length !== 6) {
      setError("کد باید ۶ رقمی باشد");
      return;
    }

    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verificationEmail, code: verificationCode }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("حساب شما فعال شد! در حال انتقال به ورود...");
        setTimeout(() => {
          setFormType("login");
          setVerificationStep(false);
          setVerificationCode("");
        }, 2000);
      } else {
        setError(data.error || "کد نامعتبر است");
      }
    } catch (err) {
      setError("خطا در ارتباط با سرور");
    }
  };

  const handleResendCode = async () => {
    setIsResending(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verificationEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("کد جدید ارسال شد");
        setResendTimer(120);
      } else {
        setError(data.error || "خطا در ارسال مجدد");
      }
    } catch (err) {
      setError("خطا در ارتباط با سرور");
    } finally {
      setIsResending(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.email) {
      setError("ایمیل الزامی است");
      return;
    }

    try {
      const res = await fetch("/api/auth/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess("لینک بازیابی رمز عبور به ایمیل شما ارسال شد");
        setTimeout(() => setFormType("login"), 3000);
      } else {
        setError(data.error || "خطا در ارسال لینک");
      }
    } catch (err) {
      setError("خطا در ارتباط با سرور");
    }
  };

  return (
    <div className="flex justify-center items-center mb-4 lg:min-h-[85vh] mx-2 py-10">
      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden w-full max-w-lg">
        <div className="bg-gradient-to-r from-[#805B99] to-[#a078b8] p-6 text-center">
          <h2 className="text-2xl font-bold text-white">
            {formType === "login" && "ورود به حساب"}
            {formType === "register" && "ثبت‌نام در زیبولند"}
            {formType === "forgot" && "بازیابی رمز عبور"}
            {formType === "verify" && "تأیید ایمیل"}
          </h2>
          <p className="text-sm text-purple-100 mt-2">
            {formType === "login" && "خوشحالیم دوباره دیدارتون داریم"}
            {formType === "register" && "همین حالا عضو خانواده زیبولند شوید"}
            {formType === "forgot" && "لینک بازیابی به ایمیل شما ارسال می‌شود"}
            {formType === "verify" && `کد ارسال شده به ${verificationEmail} را وارد کنید`}
          </p>
        </div>

        <div className="p-6 space-y-6">
          {success && <p className="text-green-600 text-center font-medium bg-green-50 py-3 rounded-lg">{success}</p>}
          {error && <p className="text-red-600 text-center font-medium bg-red-50 py-3 rounded-lg">{error}</p>}

          {/* فرم ورود */}
          {formType === "login" && (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="relative">
                <Email className="absolute left-3 top-4 text-gray-400" />
                <input type="email" placeholder="ایمیل" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} className="w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-[#805B99] outline-none" required />
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-4 text-gray-400" />
                <input type="password" placeholder="رمز عبور" value={formData.password} onChange={(e) => handleInputChange("password", e.target.value)} className="w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-[#805B99] outline-none" required />
              </div>
              <button type="submit" className="w-full bg-[#805B99] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#6a4d80] transition">
                ورود
              </button>
              <div className="text-center space-y-3">
                <button type="button" onClick={() => setFormType("forgot")} className="text-sm text-[#805B99] hover:underline">
                  فراموشی رمز عبور؟
                </button>
              </div>
            </form>
          )}

          {/* فرم ثبت‌نام */}
          {formType === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="نام" value={formData.firstName} onChange={(e) => handleInputChange("firstName", e.target.value)} className="w-full px-4 py-4 border rounded-xl" required />
                <input type="text" placeholder="نام خانوادگی" value={formData.lastName} onChange={(e) => handleInputChange("lastName", e.target.value)} className="w-full px-4 py-4 border rounded-xl" required />
              </div>
              <input type="text" placeholder="نام کاربری" value={formData.username} onChange={(e) => handleInputChange("username", e.target.value)} className="w-full px-4 py-4 border rounded-xl" required />
              <input type="email" placeholder="ایمیل" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} className="w-full px-4 py-4 border rounded-xl" required />
              <input type="tel" placeholder="شماره موبایل (اختیاری)" value={formData.phoneNumber} onChange={(e) => handleInputChange("phoneNumber", e.target.value)} className="w-full px-4 py-4 border rounded-xl" />
              <div className="grid grid-cols-2 gap-4">
                <input type="password" placeholder="رمز عبور" value={formData.password} onChange={(e) => handleInputChange("password", e.target.value)} className="w-full px-4 py-4 border rounded-xl" required />
                <input type="password" placeholder="تکرار رمز عبور" value={formData.confirmPassword} onChange={(e) => handleInputChange("confirmPassword", e.target.value)} className="w-full px-4 py-4 border rounded-xl" required />
              </div>
              <button type="submit" className="w-full bg-[#805B99] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#6a4d80] transition">
                ثبت‌نام
              </button>
            </form>
          )}

          {/* فراموشی رمز عبور */}
          {formType === "forgot" && (
            <form onSubmit={handleForgot} className="space-y-5">
              <input type="email" placeholder="ایمیل خود را وارد کنید" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} className="w-full px-4 py-4 border rounded-xl" required />
              <button type="submit" className="w-full bg-[#805B99] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#6a4d80] transition">
                ارسال لینک بازیابی
              </button>
            </form>
          )}

          {/* تأیید کد */}
          {formType === "verify" && (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">کد ۶ رقمی ارسال شده به ایمیل زیر را وارد کنید:</p>
                <p className="font-bold text-[#805B99] break-all">{verificationEmail}</p>
              </div>
              <input
                type="text"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                placeholder="------"
                className="w-full text-center text-3xl tracking-widest letter-spacing-8 py-5 border-2 rounded-xl font-mono"
                autoFocus
              />
              <button type="submit" className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition">
                تأیید و فعال‌سازی حساب
              </button>

              <div className="text-center">
                {resendTimer > 0 ? (
                  <p className="text-sm text-gray-500">ارسال مجدد کد پس از {resendTimer} ثانیه</p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isResending}
                    className="text-sm text-[#805B99] hover:underline disabled:opacity-50"
                  >
                    {isResending ? "در حال ارسال..." : "ارسال مجدد کد"}
                  </button>
                )}
              </div>
            </form>
          )}

          {/* تغییر بین فرم‌ها */}
          <div className="text-center pt-4">
            {formType === "login" && (
              <p className="text-gray-600">
                حساب ندارید؟{" "}
                <button type="button" onClick={() => setFormType("register")} className="text-[#805B99] font-bold hover:underline">
                  ثبت‌نام کنید
                </button>
              </p>
            )}
            {(formType === "register" || formType === "forgot") && (
              <p className="text-gray-600">
                قبلاً ثبت‌نام کردید؟{" "}
                <button type="button" onClick={() => setFormType("login")} className="text-[#805B99] font-bold hover:underline">
                  وارد شوید
                </button>
              </p>
            )}
            {formType === "verify" && (
              <button type="button" onClick={() => setFormType("login")} className="text-sm text-gray-500 hover:underline">
                بازگشت به ورود
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}