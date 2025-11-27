// app/reset-password/page.tsx
"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function ResetPassword() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("لینک نامعتبر است.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("رمزهای عبور مطابقت ندارند");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("رمز عبور باید حداقل ۶ کاراکتر باشد");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("رمز عبور با موفقیت تغییر کرد! در حال انتقال به ورود...");
        setTimeout(() => {
          window.location.href = "/myaccount";
        }, 3000);
      } else {
        setError(data.error || "خطا در تغییر رمز عبور");
      }
    } catch (err) {
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white p-10 rounded-xl shadow-lg text-center">
          <h2 className="text-2xl font-bold text-red-600">لینک نامعتبر یا منقضی شده</h2>
          <p className="mt-4">لطفاً دوباره درخواست بازیابی رمز عبور کنید.</p>
          <a href="/myaccount" className="inline-block mt-6 text-[#805B99] font-bold hover:underline">
            بازگشت به ورود
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-2">تغییر رمز عبور</h2>
        <p className="text-center text-gray-600 mb-8">رمز عبور جدید خود را وارد کنید</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <input
            type="password"
            placeholder="رمز عبور جدید (حداقل ۶ کاراکتر)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-4 border-2 rounded-xl focus:border-[#805B99] outline-none transition"
            required
            minLength={6}
            disabled={loading}
          />
          <input
            type="password"
            placeholder="تکرار رمز عبور جدید"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-5 py-4 border-2 rounded-xl focus:border-[#805B99] outline-none transition"
            required
            disabled={loading}
          />

          {error && <p className="text-red-600 bg-red-50 p-4 rounded-lg text-center font-medium">{error}</p>}
          {message && <p className="text-green-600 bg-green-50 p-4 rounded-lg text-center font-medium">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#805B99] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#6a4d80] transition disabled:opacity-70"
          >
            {loading ? "در حال تغییر..." : "تغییر رمز عبور"}
          </button>
        </form>

        <div className="text-center mt-6">
          <a href="/myaccount" className="text-sm text-gray-600 hover:text-[#805B99]">
            بازگشت به ورود
          </a>
        </div>
      </div>
    </div>
  );
}