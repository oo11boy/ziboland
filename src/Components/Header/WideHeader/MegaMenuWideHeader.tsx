"use client";
import { megamenu } from "@/lib/staticDb";
import React, { useState, useEffect, useRef } from "react";
import {
  ArrowDropDown,
  ArrowLeft,
  Close,
} from "@mui/icons-material";
import Link from "next/link";

export default function MegaMenuWideHeader() {
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMenuClick = (id: number) => {
    if (activeMenu === id) {
      setActiveMenu(null); // مستقیماً منو را ببند
    } else {
      setActiveMenu(id); // مستقیماً منو را باز کن
    }
  };

  const handleMouseEnter = (id: number) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current); // لغو تأخیر بسته شدن
    }
    setActiveMenu(id); // باز کردن منو
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null); // بستن منو پس از تأخیر
    }, 200);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null); // بستن منو هنگام کلیک خارج
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current); // پاکسازی تأخیر در cleanup
      }
    };
  }, []);

  return (
    <section ref={menuRef} className="bg-black w-full shadow-lg relative">
      <ul className="flex justify-start items-center text-white h-[35px] gap-10 w-[90%] mx-auto">
        {megamenu.map((category) => (
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
              clearTimeout(timeoutRef.current); // لغو بسته شدن هنگام ورود به منوی بازشو
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
          megamenu.find((category) => category.id === activeMenu)?.subcat ? (
            <>
              <Link
                href={`/${
                  megamenu.find((category) => category.id === activeMenu)?.link
                }`}
                className="mb-2 text-lg text-[#805B99] inline-flex items-center gap-2"
              >
                همه {megamenu.find((category) => category.id === activeMenu)?.name}
                <ArrowLeft />
              </Link>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 md:supports-[not(display:grid)]:flex md:supports-[not(display:grid)]:flex-wrap">
                {megamenu
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
                            <a
                              href={`/${
                                megamenu.find((cat) => cat.id === activeMenu)?.link
                              }/${item.id}`}
                              className="text-base text-[#666] hover:text-[#c7c7c7] flex items-center gap-2"
                            >
                              {item.name}
                            </a>
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