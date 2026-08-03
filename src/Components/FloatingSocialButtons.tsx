"use client";
import React, { useState, useEffect } from "react";
import {
  SmsOutlined,
  Close,
  Instagram,
  WhatsApp,
  Telegram,
  Phone,
  Email,
  Link as LinkIcon,
} from "@mui/icons-material";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useSettings } from "@/ContextApi/SettingsContext";

// نگاشت نام آیکون به کامپوننت واقعی
const iconMap: { [key: string]: React.ReactNode } = {
  instagram: <Instagram />,
  whatsapp: <WhatsApp />,
  telegram: <Telegram />,
  phone: <Phone />,
  email: <Email />,
  link: <LinkIcon />,
};

// رنگ‌های پیش‌فرض برای هر پلتفرم
const defaultColors: { [key: string]: string } = {
  instagram: "bg-gradient-to-r from-purple-600 to-pink-500",
  whatsapp: "bg-green-500",
  telegram: "bg-blue-500",
  phone: "bg-red-500",
  email: "bg-gray-600",
  link: "bg-gray-700",
};

// تشخیص نوع لینک برای تنظیم خودکار target
const getLinkType = (link: string) => {
  if (link.startsWith("tel:")) return "phone";
  if (link.startsWith("mailto:")) return "email";
  return "social";
};

export default function FloatingSocialButtons() {
  const { settings, loading } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);

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

  // ترکیب تمام آیتم‌های ارتباطی (شبکه‌های اجتماعی + شماره تماس‌ها)
  const allContactItems = [
    ...activeSocialLinks.map((item: any) => ({
      id: item.id || `social-${item.order}`,
      name: item.title || item.platform || "شبکه اجتماعی",
      icon: iconMap[item.platform?.toLowerCase()] || <LinkIcon />,
      link: item.link,
      color: defaultColors[item.platform?.toLowerCase()] || "bg-gray-500",
      type: getLinkType(item.link),
      order: item.order || 0,
    })),
    ...activePhones.map((phone: any) => ({
      id: phone.id || `phone-${phone.order}`,
      name: phone.label || "شماره تماس",
      icon: <Phone />,
      link: `tel:${phone.number}`,
      color: "bg-red-500",
      type: "phone",
      order: phone.order || 0,
    })),
  ].sort((a, b) => a.order - b.order);

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // واریانت‌های انیمیشن
  const modalVariants: Variants = {
    hidden: { opacity: 0, y: 20, scale: 0.8 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.2, ease: "easeInOut" },
    },
    exit: { opacity: 0, y: 20, scale: 0.8, transition: { duration: 0.15 } },
  };

  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.3, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
  };

  // اگر در حال لودینگ هستیم یا در سرور هستیم، چیزی نمایش نده
  if (!mounted || loading) return null;

  // فقط در موبایل نمایش داده شود
  if (!isMobile) return null;

  // اگر هیچ آیتم ارتباطی وجود نداشت، نمایش نده
  if (allContactItems.length === 0) return null;

  return (
    <>
      {/* دکمه شناور */}
      <div className="fixed bottom-24 right-4 z-50 md:hidden">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-purple-600 text-white shadow-2xl flex items-center justify-center hover:bg-purple-700 transition-colors relative"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: isOpen
              ? "0 0 0 0 rgba(128, 91, 153, 0.4)"
              : "0 0 0 10px rgba(128, 91, 153, 0.2)",
          }}
          transition={{
            boxShadow: {
              repeat: isOpen ? 0 : Infinity,
              duration: 1.5,
              ease: "easeInOut",
            },
          }}
        >
          {isOpen ? (
            <Close fontSize="large" />
          ) : (
            <SmsOutlined fontSize="large" />
          )}
        </motion.button>

        {/* لیست شبکه‌های اجتماعی */}
        <AnimatePresence>
          {isOpen && (
            <>
              {/* پس‌زمینه تیره برای موبایل */}
              <motion.div
                variants={backdropVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="fixed inset-0 bg-black z-[-1]"
                onClick={() => setIsOpen(false)}
              />

              <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="absolute bottom-16 right-0 bg-white rounded-2xl shadow-2xl w-64 overflow-hidden border border-gray-100"
              >
                <div className="p-3">
                  {/* هدر */}
                  <div className="text-center py-2 border-b border-gray-100">
                    <p className="text-sm font-bold text-gray-800 yekan">
                      ارتباط با ما
                    </p>
                    <p className="text-xs text-gray-500 yekan">
                      از طریق شبکه‌های اجتماعی و تماس
                    </p>
                  </div>

                  {/* لیست آیتم‌ها */}
                  <div className="py-1 max-h-80 overflow-y-auto">
                    {allContactItems.map((item, index) => (
                      <motion.a
                        key={item.id || index}
                        href={item.link}
                        target={item.type === "social" ? "_blank" : "_self"}
                        rel={
                          item.type === "social"
                            ? "noopener noreferrer"
                            : undefined
                        }
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 rounded-xl transition-colors group"
                        onClick={() => setIsOpen(false)}
                      >
                        <div
                          className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform flex-shrink-0`}
                        >
                          {item.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 yekan truncate">
                            {item.name}
                          </p>
                          {item.type === "phone" && (
                            <p className="text-xs text-gray-400 yekan truncate">
                              {item.link.replace("tel:", "")}
                            </p>
                          )}
                        </div>
                        {item.type === "social" && (
                          <span className="text-xs text-gray-300">›</span>
                        )}
                      </motion.a>
                    ))}
                  </div>

                  {/* دکمه بستن */}
                  <div className="border-t border-gray-100 pt-2 px-1">
                    <button
                      onClick={() => setIsOpen(false)}
                      className="w-full text-center text-xs text-gray-400 py-1 hover:text-gray-600 yekan"
                    >
                      بستن
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}