"use client";
import React, { useState, useEffect, useRef } from "react";
import { ArrowDropDown, ArrowLeft, Close } from "@mui/icons-material";
import Link from "next/link";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Categoryapi } from "@/types/types";

interface MegaMenuWideHeaderProps {
  categories: Categoryapi[];
}

export default function MegaMenuWideHeader({ categories }: MegaMenuWideHeaderProps) {
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
        <p className="text-lg">خطا در بارگذاری دسته‌بندی‌ها. لطفاً دوباره تلاش کنید.</p>
      </div>
    );
  }

  return (
    <section ref={menuRef} className="bg-black w-full shadow-lg z-[500] relative">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        style={{ zIndex: 99999, top: 0, width: "100%", padding: "10px" }}
      />
      <ul className="flex justify-start items-center text-white h-[35px] gap-10 w-[90%] mx-auto">
        {categories
          .filter((category) => category.mothercat === 1)
          .map((category) => (
            <li key={category.id} className="relative">
              <button
                onClick={() => handleMenuClick(category.id)}
                onMouseEnter={() => handleMouseEnter(category.id)}
                className={`text-base font-semibold flex items-center gap-2 ${
                  activeMenu === category.id
                    ? "text-[#EBEBEB]"
                    : "text-white hover:text-[#EBEBEB]"
                }`}
              >
                <span className="text-sm">{category.name}</span>
                <ArrowDropDown
                  className={`text-base ${
                    activeMenu === category.id ? "rotate-180" : ""
                  }`}
                />
              </button>
            </li>
          ))}
      </ul>

      <section
        onMouseLeave={handleMouseLeave}
        className={`bg-white text-black w-full shadow-xl rounded-b-lg overflow-hidden absolute top-[35px] left-0 z-10 ${
          activeMenu !== null ? "h-auto py-5" : "h-0 py-0"
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
            className="cursor-pointer absolute top-2 left-2 border-2 rounded-lg border-[#805B99]"
          >
            <Close fontSize="medium" className="text-[#805B99]" />
          </button>
          {activeMenu !== null &&
          categories.find((category) => category.id === activeMenu)?.subcat ? (
            <>
              <Link
                href={`/search?mothercatId=${activeMenu}`}
                className="mb-2 text-lg text-[#805B99] inline-flex items-center gap-2"
              >
                همه {categories.find((category) => category.id === activeMenu)?.name}
                <ArrowLeft />
              </Link>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 md:supports-[not(display:grid)]:flex md:supports-[not(display:grid)]:flex-wrap">
                {categories
                  .find((category) => category.id === activeMenu)
                  ?.subcat.map((sub) => (
                    <div
                      key={sub.id}
                      className="subcategory mb-8 md:supports-[not(display:grid)]:flex-1 md:supports-[not(display:grid)]:min-w-[25%]"
                    >
                      <h3
                        className="font-bold text-md mb-4 flex items-center gap-2"
                        style={{ borderRight: "3px solid #2f2a2a", paddingRight: "12px" }}
                      >
                        {sub.name}
                      </h3>
                      <ul className="space-y-3">
                        {sub.items.map((item) => (
                          <li key={item.id}>
                            <Link
                              href={`/search?mothercatId=${activeMenu}&subcatId=${sub.id}`}
                              className="text-base text-[#666] hover:text-[#c7c7c7] flex items-center gap-2"
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