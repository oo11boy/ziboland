"use client";
import React, { useState, useCallback } from "react";
import { megamenu, MenuItem } from "@/lib/staticDb";
import { JSX } from "@emotion/react/jsx-runtime";
import { ArrowBack } from "@mui/icons-material";
import './MobileHeader.css';
// تابع برای دریافت آیکون Google Material
const getIconComponent = (iconName: string): JSX.Element => {
  // تبدیل نام آیکون از PascalCase به lowercase (مثلاً Build به build)
  const formattedIconName = iconName
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .slice(1); 
  
  return (
    <span className="material-icons h-8 w-8 text-[#805B99]" aria-label={formattedIconName}>
      {formattedIconName}
    </span>
  );
};

export default function MobileCategoryMegaMenu() {
  const [openCategory, setOpenCategory] = useState<number | null>(null);
  const [openSubCategory, setOpenSubCategory] = useState<number | null>(null);

  // Toggle category
  const toggleCategory = useCallback((id: number) => {
    setOpenCategory(openCategory === id ? null : id);
    setOpenSubCategory(null);
  }, [openCategory]);

  // Toggle subcategory
  const toggleSubCategory = useCallback((id: number) => {
    setOpenSubCategory(openSubCategory === id ? null : id);
  }, [openSubCategory]);

  return (
    <div className="relative  lg:mt-4 flex h-screen flex-col bg-white">

      {/* Header */}
      <div className="flex h-14 items-center yekan justify-between px-4 text-gray-900 shadow-sm bg-white">
        <div></div>
        <span className="header-title yekanh text-center w-full">دسته‌بندی‌ها</span>
      </div>

      {/* Category Grid */}
      <div className="grid font-semibold grid-cols-2 lg:grid-cols-4 gap-2 px-3 pt-6">
        {megamenu.map((item: MenuItem) => (
          item.mothercat && (
            <div key={item.id} className="relative">
              <label
                htmlFor={`category-${item.id}`}
                className="flex flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white p-3 text-gray-900 hover:bg-gray-50 cursor-pointer category-card"
              >
                {getIconComponent(item.icon)}
                <span className="text-primary text-center font-semibold">{item.name}</span>
              </label>
              <input
                id={`category-${item.id}`}
                type="checkbox"
                className="peer hidden"
                checked={openCategory === item.id}
                onChange={() => toggleCategory(item.id)}
              />
              <div
                className={`fixed inset-0 z-10 flex flex-col bg-white overflow-auto sub-menu ${
                  openCategory === item.id ? "open" : ""
                }`}
              >
                {/* Sub-Menu Header */}
                <div className="flex h-14 items-center justify-between px-4 text-gray-900 shadow-sm bg-white">
              
               
                </div>
                {/* Sub-Menu Content */}
                <div className="flex w-full flex-col bg-white p-3">
                  <div className="flex items-center justify-between border-b border-gray-200 px-3 py-3">
                    <span className="text-primary">
                      همه محصولات{" "}
                    <a href={`/${item.link}`} className="text-[#805B99] hover:underline">
                        {item.name}
                      </a>
                    </span>
                    <button
                      onClick={() => setOpenCategory(null)}
                      aria-label="بازگشت به دسته‌بندی‌های اصلی"
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      <ArrowBack />
                    </button>
                  </div>
                  {item.subcat.map((sub) => (
                    <div
                      key={sub.id}
                      className={`sub-item ${openCategory === item.id ? "open" : ""}`}
                    >
                      <button
                        onClick={() => toggleSubCategory(sub.id)}
                        className="flex w-full items-center justify-between px-3 py-3 text-gray-900 border-b border-gray-200"
                        aria-expanded={openSubCategory === sub.id}
                      >
                        <span className="text-primary">{sub.name}</span>
                        <span
                          className={`material-icons h-5 w-5 arrow ${
                            openSubCategory === sub.id ? "open" : ""
                          }`}
                        >
                          expand_more
                        </span>
                      </button>
                      {openSubCategory === sub.id && (
                        <div className="pl-4">
                          {sub.items.map((subItem) => (
                            <div key={subItem.id} className="py-1">
                              <a
                                href={`/${item.link}/${subItem.id}`}
                                className="block px-3 py-2 text-secondary hover:text-[#805B99] hover:bg-indigo-50 rounded-md"
                              >
                                {subItem.name}
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}