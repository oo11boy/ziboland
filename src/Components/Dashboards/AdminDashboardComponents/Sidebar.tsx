"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ShoppingBag,
  Tag,
  Building,
  MessageCircle,
  Settings,
  Menu,
  X,
  LogOut,
  Ticket,
  Package,
  Image,
  LucideSliders,
  Mail, // اضافه شده
} from "lucide-react";
import { useAuth } from "@/ContextApi/AuthContext";

const Sidebar = () => {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const toggleMenu = () => {
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
      setIsOpen(true);
    } else {
      setIsOpen(!isOpen);
    }
  };

  const navItems = [
    { href: "/admindashboard", label: "داشبورد", icon: Home },
    { href: "/admindashboard/media", label: "رسانه‌ها", icon: Image },
    { href: "/admindashboard/articles", label: "نوشته‌ها", icon: ShoppingBag },
    { href: "/admindashboard/products", label: "محصولات", icon: ShoppingBag },
    { href: "/admindashboard/orders", label: "سفارشات", icon: Package },
    { href: "/admindashboard/categories", label: "دسته‌بندی‌ها", icon: Tag },
    { href: "/admindashboard/sliders", label: "اسلایدر اصلی", icon: LucideSliders },
       { href: "/admindashboard/stock-requests", label: "درخواست‌های موجودی", icon: Tag },
    { href: "/admindashboard/banners", label: "بنرها", icon: Image },  // اضافه شده
    { href: "/admindashboard/brands", label: "برندها", icon: Building },
    { href: "/admindashboard/comments", label: "نظرات", icon: MessageCircle },
    { href: "/admindashboard/contacts", label: "پیام‌های تماس", icon: Mail }, // اضافه شده
    { href: "/admindashboard/tickets", label: "تیکت‌ها", icon: Ticket },
    { href: "/admindashboard/settings", label: "تنظیمات", icon: Settings },
  ];

  return (
    <>
      {!isMobileMenuOpen && (
        <button
          className="md:hidden fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md"
          onClick={toggleMenu}
        >
          <Menu size={24} />
        </button>
      )}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      <aside
        className={`
          fixed top-0 right-0 h-full z-50
          md:sticky md:top-0 md:h-screen md:z-30
          bg-white dark:bg-gray-800 shadow-lg
          transition-all duration-300 ease-in-out
          ${isOpen ? "w-64" : "w-16"}
          ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"}
          md:translate-x-0
          overflow-y-auto
          scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600
        `}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {isOpen ? (
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              پنل مدیریت
            </h1>
          ) : (
            <button
              className="hidden md:flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={toggleMenu}
            >
              <Menu size={20} />
            </button>
          )}
          <button
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={toggleMenu}
          >
            {isOpen ? (
              <X size={20} />
            ) : (
              <Menu size={20} className="md:hidden" />
            )}
          </button>
        </div>
        <nav className="mt-6">
          <ul className="space-y-2 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg transition-colors duration-200
                      ${
                        isActive
                          ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
                          : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                  >
                    <Icon
                      size={20}
                      className={`${isOpen ? "ml-3" : "mx-auto"} flex-shrink-0`}
                    />
                    {isOpen && <span className="text-sm">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
            <li>
              <button
                onClick={logout}
                className="flex items-center px-3 py-2 rounded-lg text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full"
              >
                <LogOut
                  size={20}
                  className={`${isOpen ? "ml-3" : "mx-auto"} flex-shrink-0`}
                />
                {isOpen && <span className="text-sm">خروج</span>}
              </button>
            </li>
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;