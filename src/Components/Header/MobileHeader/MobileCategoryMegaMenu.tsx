"use client";
import React, { useState, useCallback, useEffect, JSX } from "react";
import { ArrowBack } from "@mui/icons-material";
import { ToastContainer, toast } from "react-toastify";
import { PulseLoader } from "react-spinners";
import { motion, AnimatePresence } from "framer-motion";
import "react-toastify/dist/ReactToastify.css";
import { Categoryapi } from "@/types/types";
import { useCat } from "@/ContextApi/CategoriesContext";

export default function MobileCategoryMegaMenu() {
  const [openCategory, setOpenCategory] = useState<Categoryapi | null>(null);
  const [openSubCategory, setOpenSubCategory] = useState<number | null>(null);
const {loading,categories,error}=useCat()


  // Toggle category
  const toggleCategory = useCallback((cat: Categoryapi) => {
    setOpenCategory(cat);
    setOpenSubCategory(null);
  }, []);

  // Toggle subcategory
  const toggleSubCategory = useCallback(
    (id: number) => {
      setOpenSubCategory(openSubCategory === id ? null : id);
    },
    [openSubCategory]
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <PulseLoader color="#805B99" size={12} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <p className="text-[#374151] text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen flex-col bg-white" dir="rtl">
      {/* Toast */}
      <ToastContainer rtl position="top-center" theme="colored" />

      {/* Header */}
      <div className="fixed top-[60px] z-20 flex h-14 w-full items-center justify-center bg-[#805B99] text-white shadow-md">
        {openCategory ? (
          <button
            onClick={() => setOpenCategory(null)}
            className="absolute right-4 p-1 rounded-full hover:bg-white/20"
            aria-label="بازگشت"
          >
            <ArrowBack />
          </button>
        ) : null}
        <span className="yekanh text-lg">
          {openCategory ? openCategory.name : "دسته‌بندی‌ها"}
        </span>
      </div>

      {/* Category Grid */}
      <div className="mt-16 flex-1 overflow-auto yekan px-3 pb-20">
        <AnimatePresence initial={false} mode="wait">
          {!openCategory ? (
            <motion.div
              key="categories"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-2 gap-4"
            >
              {categories
                .filter((item) => item.mothercat === 1)
                .map((item) => (
                  <button
                    key={item.id}
                    onClick={() => toggleCategory(item)}
                    className="flex flex-col items-center justify-center gap-2 rounded-xl bg-white p-4 shadow hover:shadow-md transition"
                  >
      <img className="w-[60px] h-[60px] object-cover" src={item.link} alt={item.name}  />
            
                    <span className="text-sm mt-2 font-semibold">{item.name}</span>
                  </button>
                ))}
            </motion.div>
          ) : (
            <motion.div
              key="subcategories"
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-2"
            >
              {openCategory.subcat.map((sub) => (
                <div key={sub.id} className="rounded-lg bg-white shadow">
                  <button
                    onClick={() => toggleSubCategory(sub.id)}
                    className="flex w-full items-center justify-between px-4 py-3 text-right text-gray-900"
                  >
                    <span>{sub.name}</span>
                    <span className="material-icons">
                      {openSubCategory === sub.id ? "expand_less" : "expand_more"}
                    </span>
                  </button>
                  <AnimatePresence>
               {openSubCategory === sub.id && (
  <motion.div
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: "auto", opacity: 1 }}
    exit={{ height: 0, opacity: 0 }}
    transition={{ duration: 0.25 }}
    className="px-4 pb-3"
  >
    {sub.items.map((subItem) => (
      <a
        key={subItem.id}
        href={`/search?mothercatId=${openCategory.id}&subcatId=${sub.id}&itemId=${subItem.id}`}
        className="block rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-[#805B99]"
      >
        {subItem.name}
      </a>
    ))}
  </motion.div>
)}

                  </AnimatePresence>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
