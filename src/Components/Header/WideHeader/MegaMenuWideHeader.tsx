"use client";
import { megamenu } from "@/lib/staticDb";
import React, { useState, useEffect, useRef } from "react";
import {
  ArrowDropDown,
  CategoryOutlined,
  ArrowForward,
} from "@mui/icons-material";
import Link from "next/link";

export default function MegaMenuWideHeader() {
  const [activeMenu, setActiveMenu] = useState<number | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const handleMenuClick = (id: number) => {
    if (activeMenu === id) {
      setIsClosing(true);
      setTimeout(() => {
        setActiveMenu(null);
        setIsClosing(false);
      }, 200); // همگام با مدت زمان انیمیشن
    } else {
      setActiveMenu(id);
      setIsClosing(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsClosing(true);
        setTimeout(() => {
          setActiveMenu(null);
          setIsClosing(false);
        }, 200);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <section ref={menuRef} className="bg-gradient-to-r from-gray-900 to-black p-2 w-full shadow-lg">
      {/* Main Menu */}
      <ul className="flex justify-start items-center text-white gap-10 w-[90%] mx-auto">
        {megamenu.map((category) => (
          <li key={category.id} className="relative">
            <button
              onClick={() => handleMenuClick(category.id)}
              className={`text-base font-semibold flex items-center gap-2 transition-colors duration-300 ${
                activeMenu === category.id
                  ? "text-[#EBEBEB]"
                  : "text-white hover:text-[#EBEBEB]"
              }`}
            >
              <span>{category.name}</span>
              <ArrowDropDown
                className={`text-base transition-transform duration-200 ${
                  activeMenu === category.id ? "rotate-180" : ""
                }`}
              />
            </button>
          </li>
        ))}
      </ul>

      {/* Mega Menu Section */}
      <section
        className={`bg-white text-black w-full shadow-xl rounded-b-lg overflow-hidden transition-all duration-200 ease-in-out will-change-[max-height,opacity] ${
          activeMenu !== null && !isClosing
            ? "max-h-[2000px] opacity-100 mt-4 py-10"
            : "max-h-0 opacity-0 mt-0 py-0"
        }`}
      >
        <div className="w-[90%] mx-auto">
          {activeMenu !== null && !isClosing && megamenu.find((category) => category.id === activeMenu)?.subcat ? (
            <>
              {/* All Category Header */}
              <div className="mb-8">
                <Link
                  href={`/${megamenu.find((category) => category.id === activeMenu)?.link}`}
                  className="group inline-flex items-center gap-3 bg-gradient-to-r from-[#C7C7C7] to-[#EBEBEB] text-black font-bold text-lg py-3 px-4 rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-300 ease-in-out"
                >
                  <CategoryOutlined className="text-base text-[#1A1A1A] group-hover:text-[#005B99] transition-colors duration-300" />
                  <span className="group-hover:text-[#005B99]">
                    همه {megamenu.find((category) => category.id === activeMenu)?.name}
                  </span>
                </Link>
              </div>
              {/* Subcategories */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10">
                {megamenu
                  .find((category) => category.id === activeMenu)
                  ?.subcat.map((sub) => (
                    <div key={sub.id} className="mb-8">
                      <h3 className="font-bold text-lg mb-4 pb-3 border-b-2 border-[#C7C7C7]  flex items-center gap-2">
                        <CategoryOutlined className="text-base text-[#005B99]" />
                        {sub.name}
                      </h3>
                      <ul className="space-y-3">
                        {sub.items.map((item) => (
                          <li key={item.id}>
                            <a
                              href={`/${
                                megamenu.find((cat) => cat.id === activeMenu)?.link
                              }/${item.id}`}
                              className="text-base text-black hover:text-[#c7c7c7] hover:translate-x-2 flex items-center gap-2 transition-all duration-300"
                            >
                              <ArrowForward className="text-base text-gray-400" />
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