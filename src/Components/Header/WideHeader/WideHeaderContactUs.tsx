"use client";
import React, { useState } from "react";
import {
  PhoneInTalkOutlined,
  LocalOffer,
  ExpandMore,
  Close,
} from "@mui/icons-material";
import Link from "next/link";
import { useSettings } from "@/ContextApi/SettingsContext";
import { motion, AnimatePresence, Variants } from "framer-motion";

export default function WideHeaderContactUs() {
  const { settings, loading } = useSettings();
  const [showAllPhones, setShowAllPhones] = useState(false);

  // دریافت لینک‌های اجتماعی از تنظیمات
  const socialLinks = settings?.social_links || [];
  const phoneNumbers = settings?.phone_numbers || [];

  // فیلتر کردن لینک‌های فعال و دارای لینک
  const activeSocialLinks = socialLinks
    .filter((link: any) => link.is_active && link.link)
    .sort((a: any, b: any) => a.order - b.order);

  // فیلتر کردن شماره‌های فعال
  const activePhones = phoneNumbers
    .filter((phone: any) => phone.is_active && phone.number)
    .sort((a: any, b: any) => a.order - b.order);

  // شماره اول برای نمایش اصلی
  const primaryPhone = activePhones.length > 0 ? activePhones[0] : null;
  const otherPhones = activePhones.slice(1);

  // واریانت‌های انیمیشن برای مودال
  const modalVariants: Variants = {
    hidden: { opacity: 0, y: "-100%" },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    exit: { opacity: 0, y: "-100%", transition: { duration: 0.2 } },
  };

  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.5, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  if (loading) {
    return (
      <section className="bg-[#EBEBEB] yekan w-full h-auto py-2 relative overflow-hidden">
        <div className="w-[95%] flex justify-between m-auto items-center flex-row-reverse relative z-10">
          <div className="text-black">در حال بارگذاری...</div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="bg-[#EBEBEB] yekan w-full h-auto py-2 relative overflow-hidden">
        <div className="w-[95%] flex justify-between m-auto items-center flex-row-reverse relative z-10">
          {/* تماس با کارشناسان - با قابلیت نمایش چند شماره */}
          <div className="flex w-[33%] justify-end items-center gap-4">
            <p className="yekan text-black font-medium whitespace-nowrap">تماس با کارشناسان:</p>
            <div className="flex items-center gap-3">
              {primaryPhone && (
                <a
                  href={`tel:${primaryPhone.number}`}
                  className="text-black text-xl flex items-center gap-2 yekan hover:text-blue-600 transition-colors"
                >
                  {primaryPhone.number}
                  <PhoneInTalkOutlined
                    fontSize="medium"
                    className="text-black phoneicon"
                  />
                </a>
              )}
              
              {/* نمایش شماره‌های دیگر با مودال */}
              {otherPhones.length > 0 && (
                <>
                  <button
                    onClick={() => setShowAllPhones(true)}
                    className="text-xs text-gray-600 hover:text-blue-600 flex items-center gap-1 transition-colors whitespace-nowrap"
                  >
                    <ExpandMore className="w-3 h-3" />
                    {otherPhones.length} شماره دیگر
                  </button>
                </>
              )}
            </div>
          </div>

          {/* جشنواره تخفیفات ویژه */}
          <div className="w-[33%] text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-3 px-5 py-3 bg-[#805B99] rounded-lg shadow-xl festival-container"
            >
              <LocalOffer className="text-white animate-pulse-glow" fontSize="large" />
              <div className="flex flex-col">
                <span className="yekan text-white font-bold text-xl transition-colors duration-300">
                  جشنواره تخفیفات ویژه
                </span>
                <span className="yekan text-sm text-white">
                  تا 50% تخفیف محصولات
                </span>
              </div>
            </Link>
          </div>

          {/* شبکه‌های اجتماعی */}
          <div className="text-white w-[33%] flex items-center gap-3 justify-start">
            {activeSocialLinks.length > 0 ? (
              activeSocialLinks.map((link: any, index: number) => (
                <a
                  key={`social-${index}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  href={link.link}
                  className="border-2 hover:border-[#C7C7C7] border-black  hover:bg-[#005B99] rounded-full flex justify-center items-center transition-all duration-300"
                  title={link.title}
                >
                  {link.icon ? (
                    <img
                      src={link.icon}
                      alt={link.title}
                      className="!w-[30px] !h-[30px] object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const span = document.createElement('span');
                          span.className = 'text-sm font-bold text-white';
                          span.textContent = link.title.charAt(0);
                          parent.appendChild(span);
                        }
                      }}
                    />
                  ) : (
                    <span className="text-sm font-bold text-white">
                      {link.title.charAt(0)}
                    </span>
                  )}
                </a>
              ))
            ) : (
              <span className="text-gray-500 text-sm">هیچ شبکه اجتماعی فعال نیست</span>
            )}
          </div>
        </div>
      </section>

      {/* مودال تماس با کارشناسان - مشابه سبد خرید */}
      <AnimatePresence>
        {showAllPhones && (
          <>
            {/* پس‌زمینه تیره */}
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 bg-black z-[990]"
              onClick={() => setShowAllPhones(false)}
            />
            
            {/* محتوای مودال */}
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 left-0 w-full md:w-96 h-screen bg-white shadow-2xl z-[999] overflow-y-auto"
              dir="rtl"
            >
              <div className="flex flex-col h-full">
                {/* هدر مودال */}
                <div className="flex justify-between items-center p-4 border-b border-[#e5e7eb] bg-[#F9F9F9]">
                  <h2 className="text-lg font-bold text-[#374151] yekan">
                    شماره‌های تماس
                  </h2>
                  <button
                    onClick={() => setShowAllPhones(false)}
                    className="p-2 text-[#805B99] hover:bg-[#EBEBEB] rounded-full"
                  >
                    <Close fontSize="medium" />
                  </button>
                </div>

                {/* محتوای اصلی - لیست شماره‌ها */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-3">
                    {/* شماره اصلی */}
                    {primaryPhone && (
                      <a
                        href={`tel:${primaryPhone.number}`}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl hover:shadow-md transition-all duration-300 group"
                        onClick={() => setShowAllPhones(false)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <PhoneInTalkOutlined className="text-purple-600 w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 yekan">شماره اصلی</p>
                            <p className="text-lg font-bold text-gray-800 yekan">
                              {primaryPhone.number}
                            </p>
                          </div>
                        </div>
                        <div className="text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                      </a>
                    )}

                    {/* شماره‌های دیگر */}
                    {otherPhones.map((phone: any, index: number) => (
                      <a
                        key={index}
                        href={`tel:${phone.number}`}
                        className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl hover:shadow-md transition-all duration-300 group"
                        onClick={() => setShowAllPhones(false)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                            <PhoneInTalkOutlined className="text-gray-600 w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-500 yekan">
                              {phone.label || `شماره ${index + 2}`}
                            </p>
                            <p className="text-lg font-bold text-gray-800 yekan">
                              {phone.number}
                            </p>
                          </div>
                        </div>
                        <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                      </a>
                    ))}
                  </div>

                  {/* پیام راهنما در فوتر */}
                  <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                    <p className="text-xs text-gray-400 yekan">
                      برای تماس با کارشناسان، روی شماره مورد نظر کلیک کنید
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* استایل‌های انیمیشن */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}