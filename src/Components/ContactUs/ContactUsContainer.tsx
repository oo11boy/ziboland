"use client";
import React, { useState } from "react";
import { toast } from "react-toastify";
import { Loader2, Send } from "lucide-react";
import { useSettings } from "@/ContextApi/SettingsContext";

export default function ContactUsContainer() {
  const { settings } = useSettings();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("خطا در ارسال پیام");
      toast.success("✅ پیام شما با موفقیت ارسال شد");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (err) {
      toast.error("❌ ارسال پیام با خطا مواجه شد" + err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-16 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4">
        {/* بخش اطلاعات تماس */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* آدرس */}
          <div className="bg-[#071c34] p-8 rounded-2xl text-center text-white shadow-md hover:shadow-lg transition-all">
            <i className="fas fa-map-marker-alt text-[#fda40b] text-5xl mb-4"></i>
            <h3 className="text-xl font-semibold mb-2">آدرس فروشگاه</h3>
            <p className="text-gray-300">
              {settings.address || "آدرس ثبت نشده"}
            </p>
          </div>

          {/* ایمیل */}
          <div className="bg-[#071c34] p-8 rounded-2xl text-center text-white shadow-md hover:shadow-lg transition-all">
            <i className="fas fa-envelope text-[#fda40b] text-5xl mb-4"></i>
            <h3 className="text-xl font-semibold mb-2">ایمیل پشتیبانی</h3>
            <p className="text-gray-300">
              {settings.email || "example@email.com"}
            </p>
          </div>

          {/* ساعت کاری */}
          <div className="bg-[#071c34] p-8 rounded-2xl text-center text-white shadow-md hover:shadow-lg transition-all">
            <i className="fas fa-clock text-[#fda40b] text-5xl mb-4"></i>
            <h3 className="text-xl font-semibold mb-2">ساعات کاری</h3>
            <p className="text-gray-300">
              {settings.working_hours || "9 تا 18"}
            </p>
            <p className="text-gray-300 mt-1">
              {settings.working_days || "شنبه تا پنج‌شنبه"}
            </p>
          </div>
        </div>

        {/* بخش فرم تماس و نقشه */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* فرم تماس */}
          <div className="md:col-span-2 bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-all">
            <h2 className="text-[#071c34] text-2xl font-bold mb-6 border-b pb-3">
              ارسال پیام به ما
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="نام شما"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-md bg-gray-100 border focus:ring-2 focus:ring-[#071c34]"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="ایمیل"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 rounded-md bg-gray-100 border focus:ring-2 focus:ring-[#071c34]"
                />
                <input
                  type="text"
                  name="phone"
                  placeholder="شماره تماس"
                  value={formData.phone}
                  required
                  onChange={handleChange}
                  className="w-full p-3 rounded-md bg-gray-100 border focus:ring-2 focus:ring-[#071c34]"
                />
                <input
                  type="text"
                  name="subject"
                  placeholder="موضوع پیام"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full p-3 rounded-md bg-gray-100 border focus:ring-2 focus:ring-[#071c34]"
                />
              </div>
              <textarea
                name="message"
                placeholder="متن پیام شما"
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full p-3 h-32 rounded-md bg-gray-100 border focus:ring-2 focus:ring-[#071c34]"
              ></textarea>
              <button
                type="submit"
                disabled={loading}
                className={`flex items-center justify-center gap-2 w-full sm:w-40 py-3 rounded-lg font-semibold transition-all ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#fda40b] hover:bg-[#071c34] text-white shadow"
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-5 h-5" /> در حال ارسال...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" /> ارسال پیام
                  </>
                )}
              </button>
            </form>
          </div>

          {/* نقشه */}
          <div>
            <iframe
              src={
                settings.map_link ||
                "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3311.204!2d51.389!3d35.689!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1sTehran!2sIran!5e0!3m2!1sen!2s!4v1634567891234"
              }
              width="100%"
              height="450"
              loading="lazy"
              allowFullScreen
              className="rounded-2xl border-0 shadow-md"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
