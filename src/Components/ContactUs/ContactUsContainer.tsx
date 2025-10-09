"use client";
import React, { useState } from "react";

export default function ContactUsContainer() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [statusMessage, setStatusMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setStatusMessage("");

    try {
      const response = await fetch("/api/contacts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "خطا در ارسال فرم");
      }

      setStatus("success");
      setStatusMessage("پیام شما با موفقیت ارسال شد!");
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch (error) {
      setStatus("error");
      setStatusMessage(error instanceof Error ? error.message : "خطا در ارسال پیام");
    }
  };

  return (
    <section className="py-16 min-h-screen bg-gray-100">
      <div className="container mx-auto px-4">
        {/* بخش اطلاعات تماس */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="text-center bg-[#071c34] p-8 rounded-lg">
            <div className="mb-4">
              <i className="fas fa-map-marked text-[#fda40b] text-5xl"></i>
            </div>
            <div>
              <h2 className="text-white text-xl font-semibold capitalize mb-2">آدرس</h2>
              <span className="block text-gray-400 text-base">تهران، خیابان ولیعصر، پلاک ۱۲۳۴</span>
              <span className="block text-gray-400 text-base">تهران، ایران</span>
            </div>
          </div>
          <div className="text-center bg-[#071c34] p-8 rounded-lg">
            <div className="mb-4">
              <i className="fas fa-envelope text-[#fda40b] text-5xl"></i>
            </div>
            <div>
              <h2 className="text-white text-xl font-semibold capitalize mb-2">ایمیل</h2>
              <span className="block text-gray-400 text-base">info@sample.com</span>
              <span className="block text-gray-400 text-base">yourmail@gmail.com</span>
            </div>
          </div>
          <div className="text-center bg-[#071c34] p-8 rounded-lg">
            <div className="mb-4">
              <i className="fas fa-clock text-[#fda40b] text-5xl"></i>
            </div>
            <div>
              <h2 className="text-white text-xl font-semibold capitalize mb-2">ساعات کاری</h2>
              <span className="block text-gray-400 text-base">شنبه تا چهارشنبه: ۹ صبح - ۴ بعدازظهر</span>
              <span className="block text-gray-400 text-base">پنجشنبه تا جمعه: ۱۰ صبح - ۵ بعدازظهر</span>
            </div>
          </div>
        </div>
        {/* بخش فرم تماس و نقشه */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white p-6 rounded-lg">
            <h2 className="text-[#071c34] text-2xl font-bold capitalize mb-6">با ما در تماس باشید</h2>
            <form onSubmit={handleSubmit} className="p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    type="text"
                    name="name"
                    placeholder="نام شما"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-gray-100 rounded-md border border-gray-100 mb-5 focus:outline-none focus:ring-2 focus:ring-[#071c34]"
                  />
                </div>
                <div>
                  <input
                    type="email"
                    name="email"
                    placeholder="ایمیل"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-gray-100 rounded-md border border-gray-100 mb-5 focus:outline-none focus:ring-2 focus:ring-[#071c34]"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="phone"
                    placeholder="شماره تلفن"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full p-3 bg-gray-100 rounded-md border border-gray-100 mb-5 focus:outline-none focus:ring-2 focus:ring-[#071c34]"
                  />
                </div>
                <div>
                  <input
                    type="text"
                    name="subject"
                    placeholder="موضوع"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-gray-100 rounded-md border border-gray-100 mb-5 focus:outline-none focus:ring-2 focus:ring-[#071c34]"
                  />
                </div>
                <div className="sm:col-span-2">
                  <textarea
                    name="message"
                    placeholder="پیام خود را بنویسید"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-gray-100 rounded-md border border-gray-100 h-32 mb-5 focus:outline-none focus:ring-2 focus:ring-[#071c34]"
                  ></textarea>
                </div>
                <div className="sm:col-span-2">
                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className={`w-36 p-3 font-semibold rounded-md transition-all duration-300 ${
                      status === "loading"
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-[#fda40b] hover:bg-[#071c34] text-white"
                    }`}
                  >
                    {status === "loading" ? "در حال ارسال..." : "ارسال"}
                  </button>
                </div>
              </div>
              {statusMessage && (
                <div
                  className={`mt-4 p-3 rounded-md text-center ${
                    status === "success"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {statusMessage}
                </div>
              )}
            </form>
          </div>
          <div>
            <div className="mt-9">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3526.2702971058033!2d51.38966331504128!3d35.68919798019276!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3f8e00491d7a59c3%3A0x4b9c6e3a7b7f6f3!2sTehran%2C%20Tehran%20Province%2C%20Iran!5e0!3m2!1sen!2s!4v1634567891234"
                width="100%"
                height="450"
                frameBorder="0"
                style={{ border: 0 }}
                allowFullScreen
                className="rounded-lg"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}