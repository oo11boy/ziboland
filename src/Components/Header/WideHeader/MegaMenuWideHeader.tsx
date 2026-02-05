"use client";
import React, { useState, useEffect, useRef } from "react";
import { ArrowDropDown, ArrowLeft, Close } from "@mui/icons-material";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import { Categoryapi } from "@/types/types";

interface MegaMenuWideHeaderProps {
  categories: Categoryapi[];
}

export default function MegaMenuWideHeader({
  categories,
}: MegaMenuWideHeaderProps) {
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMenuClick = (id: number) => {
    if (activeMenu === id) {
      setActiveMenu(null);
    } else {
      setActiveMenu(id);
    }
  };

  const handleMouseEnter = (id: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setActiveMenu(id);
  };

  // این تابع حالا کل منو را در صورت خروج موس می‌بندد
  const handleGlobalMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 50); // کمی تاخیر برای تجربه کاربری بهتر
  };

  // برای متوقف کردن بسته شدن منو وقتی موس دوباره وارد محیط کامپوننت می‌شود
  const clearCloseTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (categories.length === 0) {
    return (
      <div className="flex h-[35px] items-center justify-center bg-black text-white font-yekan">
        <p>خطا در بارگذاری دسته‌بندی‌ها.</p>
      </div>
    );
  }

  return (
    // تغییر مهم: اضافه شدن onMouseLeave به کانتینر اصلی
    <section
      ref={menuRef}
      onMouseLeave={handleGlobalMouseLeave}
      onMouseEnter={clearCloseTimeout}
      className="bg-black w-full shadow-lg z-[500] relative font-yekan"
    >
      <Toaster position="top-center" reverseOrder={false} />

      {/* نوار اصلی منو */}
      <ul className="flex justify-start items-center text-white h-[35px] gap-10 w-[90%] mx-auto">
        {categories
          .filter((category) => category.mothercat === 1)
          .map((category) => (
            <li key={category.id} className="relative h-full flex items-center">
              <button
                onClick={() => handleMenuClick(category.id)}
                onMouseEnter={() => handleMouseEnter(category.id)}
                className={`text-base font-semibold flex items-center gap-2 transition-colors h-full ${
                  activeMenu === category.id
                    ? "text-[#EBEBEB]"
                    : "text-white hover:text-[#EBEBEB]"
                }`}
              >
                <span className="text-sm">{category.name}</span>
                <ArrowDropDown
                  className={`text-base transition-transform ${
                    activeMenu === category.id ? "rotate-180" : ""
                  }`}
                />
              </button>
            </li>
          ))}
      </ul>

      {/* بخش مگامنو (پنل باز شونده) */}
      <div
        className={`bg-white text-black w-full shadow-xl rounded-b-lg overflow-hidden absolute top-[35px] left-0 z-10 transition-all duration-300 ease-in-out ${
          activeMenu !== null 
            ? "max-h-[80vh] py-8 opacity-100 border-t border-gray-100" 
            : "max-h-0 py-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="w-[90%] mx-auto relative">
          <button
            onClick={() => setActiveMenu(null)}
            className="cursor-pointer absolute top-0 left-0 border-2 rounded-lg border-[#805B99] p-1.5 hover:bg-[#805B99]/10 transition"
          >
            <Close fontSize="small" className="text-[#805B99]" />
          </button>

          {activeMenu !== null && (
            <>
              {(() => {
                const currentCat = categories.find((c) => c.id === activeMenu);
                if (!currentCat) return null;

                return (
                  <>
                    <Link
                      href={`/search?mothercatId=${activeMenu}`}
                      className="mb-6 text-lg font-bold text-[#805B99] inline-flex items-center gap-2 hover:underline"
                    >
                      همه {currentCat.name}
                      <ArrowLeft className="text-xl" />
                    </Link>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                      {currentCat.subcat?.map((sub) => (
                        <div key={sub.id} className="subcategory">
                          <Link
                            href={`/search?mothercatId=${activeMenu}&subcatId=${sub.id}`}
                            className="font-bold text-lg mb-4 block text-black hover:text-[#805B99] transition border-r-4 border-[#805B99] pr-3"
                          >
                            {sub.name}
                          </Link>
                          <ul className="space-y-2.5">
                            {sub.items?.map((item) => (
                              <li key={item.id}>
                                <Link
                                  href={`/search?mothercatId=${activeMenu}&subcatId=${sub.id}&itemId=${item.id}`}
                                  className="text-[15px] text-[#666] hover:text-[#805B99] hover:underline transition block"
                                >
                                  {item.name}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </>
          )}
        </div>
      </div>
    </section>
  );
}