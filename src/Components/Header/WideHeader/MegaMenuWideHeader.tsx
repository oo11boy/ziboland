"use client";
import React, { useState, useEffect, useRef } from "react";
import { ArrowDropDown, ArrowLeft, Close } from "@mui/icons-material";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";
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

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 200);
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

  // در صورت خالی بودن دسته‌بندی‌ها، پیام خطا نمایش داده شود
  if (categories.length === 0) {
    return (
      <div className="flex h-[35px] items-center justify-center bg-black text-white">
        <p className="text-lg">
          خطا در بارگذاری دسته‌بندی‌ها. لطفاً دوباره تلاش کنید.
        </p>
      </div>
    );
  }

  return (
    <section
      ref={menuRef}
      className="bg-black w-full shadow-lg z-[500] relative"
    >
      {/* Toaster جدید با react-hot-toast (هماهنگ با بقیه پروژه) */}
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 5000,
          style: {
            background: "#333",
            color: "#fff",
            maxWidth: "600px",
            fontSize: "14px",
            whiteSpace: "pre-line",
            textAlign: "right" as const,
            direction: "rtl",
          },
          error: {
            duration: 8000,
            style: {
              background: "#ef4444",
            },
          },
          success: {
            style: {
              background: "#22c55e",
            },
          },
        }}
      />

      <ul className="flex justify-start items-center text-white h-[35px] gap-10 w-[90%] mx-auto">
        {categories
          .filter((category) => category.mothercat === 1)
          .map((category) => (
            <li key={category.id} className="relative">
              <button
                onClick={() => handleMenuClick(category.id)}
                onMouseEnter={() => handleMouseEnter(category.id)}
                className={`text-base font-semibold flex items-center gap-2 transition-colors ${
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

      {/* مگامنو */}
      <section
        onMouseLeave={handleMouseLeave}
        className={`bg-white text-black w-full shadow-xl rounded-b-lg overflow-hidden absolute top-[35px] left-0 z-10 transition-all duration-300 ease-in-out ${
          activeMenu !== null ? "h-auto py-8 opacity-100" : "h-0 py-0 opacity-0 pointer-events-none"
        }`}
      >
        <div
          className="w-[90%] mx-auto relative"
          onMouseEnter={() => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
          }}
        >
          <button
            onClick={() => setActiveMenu(null)}
            className="cursor-pointer absolute top-4 left-4 border-2 rounded-lg border-[#805B99] p-2 hover:bg-[#805B99]/10 transition"
            aria-label="بستن منو"
          >
            <Close fontSize="medium" className="text-[#805B99]" />
          </button>

          {activeMenu !== null &&
          categories.find((category) => category.id === activeMenu)?.subcat ? (
            <>
              <Link
                href={`/search?mothercatId=${activeMenu}`}
                className="mb-6 text-lg font-bold text-[#805B99] inline-flex items-center gap-2 hover:underline"
              >
                همه{" "}
                {
                  categories.find((category) => category.id === activeMenu)
                    ?.name
                }
                <ArrowLeft className="text-xl" />
              </Link>

              <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
                {categories
                  .find((category) => category.id === activeMenu)
                  ?.subcat.map((sub) => (
                    <div key={sub.id} className="subcategory">
                      <Link
                        href={`/search?mothercatId=${activeMenu}&subcatId=${sub.id}`}
                        className="font-bold text-lg mb-5 inline-flex items-center gap-3 text-black hover:text-[#805B99] transition"
                        style={{
                          borderRight: "4px solid #805B99",
                          paddingRight: "14px",
                        }}
                      >
                        {sub.name}
                      </Link>
                      <ul className="space-y-3 mt-4">
                        {sub.items.map((item) => (
                          <li key={item.id}>
                            <Link
                              href={`/search?mothercatId=${activeMenu}&subcatId=${sub.id}&itemId=${item.id}`}
                              className="text-base text-[#666] hover:text-[#805B99] hover:underline transition flex items-center gap-2"
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
          ) : null}
        </div>
      </section>
    </section>
  );
}