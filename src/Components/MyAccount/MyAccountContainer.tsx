"use client";
import React, { useState } from "react";
import { Email, Lock, Person, Phone, VpnKey } from "@mui/icons-material";
import { useRouter } from 'next/navigation';

export default function MyAccountContainer() {
  const [formType, setFormType] = useState<"login" | "register" | "forgot">("login");
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
  });
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setError('');
  };
const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setError('ایمیل و رمز عبور الزامی هستند');
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password }),
      });

      const data = await res.json();
      if (res.ok) {
        // Redirect based on user role
        if (data.role === 'admin') {
          router.push('/admindashboard');
        } else {
          router.push('/userdashboard');
        }
      } else {
        setError(data.error || 'خطا در ورود');
      }
    } catch (error) {
      setError('خطا در ارتباط با سرور');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.username || !formData.email || !formData.password || !formData.firstName || !formData.lastName) {
      setError('فیلدهای الزامی پر نشده‌اند');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('رمزهای عبور مطابقت ندارند');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
          email: formData.email,
          phone_number: formData.phoneNumber,
          first_name: formData.firstName,
          last_name: formData.lastName,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        router.push('/userdashboard');
      } else {
        setError(data.error || 'خطا در ثبت‌نام');
      }
    } catch (error) {
      setError('خطا در ارتباط با سرور');
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      setError('ایمیل الزامی است');
      return;
    }

    try {
      const res = await fetch('/api/auth/forgot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();
      if (res.ok) {
        alert('لینک بازیابی رمز عبور به ایمیل شما ارسال شد');
        setFormType('login');
      } else {
        setError(data.error || 'خطا در ارسال لینک بازیابی');
      }
    } catch (error) {
      setError('خطا در ارتباط با سرور');
    }
  };

  return (
    <div className="flex justify-center items-center mb-4 lg:min-h-[85vh] mx-2">
      <div className="bg-white shadow-xl overflow-hidden w-full max-w-lg animate-fade-in">
        <div className="bg-[#805B99] p-4 sm:p-6 text-center relative">
          <h2 className="text-xl sm:text-2xl font-bold text-white relative z-10">
            {formType === "login" ? "ورود به حساب" : formType === "register" ? "ثبت‌نام" : "فراموشی رمز عبور"}
          </h2>
          <p className="text-sm sm:text-base text-blue-100 mt-1 relative z-10">
            {formType === "login" ? "برای ادامه وارد حساب شوید" : formType === "register" ? "لطفا اطلاعات خود را تکمیل کنید" : "ایمیل خود را وارد کنید تا لینک بازیابی ارسال شود"}
          </p>
        </div>

        <div className="p-5 sm:p-8 space-y-6 text-sm sm:text-base">
          {formType === "login" && (
            <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">
              <div className="relative flex items-center">
                <Email className="absolute left-3 text-gray-400 text-base sm:text-lg" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full py-2.5 sm:py-3 pl-10 pr-4 border bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none text-right text-sm sm:text-base"
                  placeholder="ایمیل"
                  required
                />
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 text-gray-400 text-base sm:text-lg" />
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full py-2.5 sm:py-3 pl-10 pr-4 border bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none text-right text-sm sm:text-base"
                  placeholder="رمز عبور"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                className="w-full bg-[#805B99] text-white py-2.5 sm:py-3 font-medium transition-all shadow-md text-sm sm:text-base"
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

          {formType === "register" && (
            <form onSubmit={handleRegister} className="space-y-4 sm:space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative flex items-center">
                  <Person className="absolute left-3 text-gray-400" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className="w-full py-2.5 sm:py-3 pl-4 pr-4 border bg-gray-50 focus:ring-2 focus:ring-green-400 outline-none text-right text-sm sm:text-base"
                    placeholder="نام"
                    required
                  />
                </div>
                <div className="relative flex items-center">
                  <Person className="absolute left-3 text-gray-400" />
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className="w-full py-2.5 sm:py-3 pl-4 pr-4 border bg-gray-50 focus:ring-2 focus:ring-green-400 outline-none text-right text-sm sm:text-base"
                    placeholder="نام خانوادگی"
                    required
                  />
                </div>
              </div>
              <div className="relative flex items-center">
                <Person className="absolute left-3 text-gray-400" />
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                  className="w-full py-2.5 sm:py-3 pl-4 pr-4 border bg-gray-50 focus:ring-2 focus:ring-green-400 outline-none text-right text-sm sm:text-base"
                  placeholder="نام کاربری"
                  required
                />
              </div>
              <div className="relative flex items-center">
                <Email className="absolute left-3 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full py-2.5 sm:py-3 pl-4 pr-4 border bg-gray-50 focus:ring-2 focus:ring-green-400 outline-none text-right text-sm sm:text-base"
                  placeholder="ایمیل"
                  required
                />
              </div>
              <div className="relative flex items-center">
                <Phone className="absolute left-3 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                  className="w-full py-2.5 sm:py-3 pl-4 pr-4 border bg-gray-50 focus:ring-2 focus:ring-green-400 outline-none text-right text-sm sm:text-base"
                  placeholder="09xxxxxxxxx"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative flex items-center">
                  <Lock className="absolute left-3 text-gray-400" />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full py-2.5 sm:py-3 pl-4 pr-4 border bg-gray-50 focus:ring-2 focus:ring-green-400 outline-none text-right text-sm sm:text-base"
                    placeholder="رمز عبور"
                    required
                  />
                </div>
                <div className="relative flex items-center">
                  <VpnKey className="absolute left-3 text-gray-400" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full py-2.5 sm:py-3 pl-4 pr-4 border bg-gray-50 focus:ring-2 focus:ring-green-400 outline-none text-right text-sm sm:text-base"
                    placeholder="تکرار رمز عبور"
                    required
                  />
                </div>
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                className="w-full bg-[#805B99] text-white py-2.5 sm:py-3 font-medium transition-all shadow-md text-sm sm:text-base"
              >
                ثبت‌نام
              </button>
            </form>
          )}

          {formType === "forgot" && (
            <form onSubmit={handleForgot} className="space-y-4 sm:space-y-5">
              <div className="relative flex items-center">
                <Email className="absolute left-3 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full py-2.5 sm:py-3 pl-10 pr-4 border bg-gray-50 focus:ring-2 focus:ring-purple-400 outline-none text-right text-sm sm:text-base"
                  placeholder="ایمیل"
                  required
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                className="w-full bg-[#805B99] text-white py-2.5 sm:py-3 font-medium transition-all shadow-md text-sm sm:text-base"
              >
                ارسال لینک بازیابی
              </button>
            </form>
          )}

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