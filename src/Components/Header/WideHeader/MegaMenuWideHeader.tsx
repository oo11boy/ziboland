"use client";
import { megamenu } from "@/lib/staticDb";
import React, { useState, useEffect, useRef } from "react";
import {
  ArrowDropDown,
  CategoryOutlined,
  ArrowForward,
} from "@mui/icons-material";

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
              className={`text-sm font-semibold flex items-center gap-2 transition-colors duration-300 ${
                activeMenu === category.id
                  ? "text-yellow-400"
                  : "text-white hover:text-yellow-400"
              }`}
            >
              <span>{category.name}</span>
              <ArrowDropDown
                className={`text-lg transition-transform duration-200 ${
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
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-10">
              {megamenu
                .find((category) => category.id === activeMenu)
                ?.subcat.map((sub) => (
                  <div key={sub.id} className="mb-8">
                    <h3 className="font-bold text-2xl mb-4 pb-3 border-b-2 border-yellow-100 flex items-center gap-2">
                      <CategoryOutlined className="text-yellow-600" />
                      {sub.name}
                    </h3>
                    <ul className="space-y-3">
                      {sub.items.map((item) => (
                        <li key={item.id}>
                          <a
                            href={`/${
                              megamenu.find((cat) => cat.id === activeMenu)?.link
                            }/${item.id}`}
                            className="text-gray-600 hover:text-yellow-600 hover:translate-x-2 flex items-center gap-2 transition-all duration-300"
                          >
                            <ArrowForward className="text-sm text-gray-400" />
                            {item.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
            </div>
          ) : null}
        </div>
      </section>
    </section>
  );
}