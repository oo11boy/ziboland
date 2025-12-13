"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion"; // <-- Variants اضافه شد
import { toast } from "react-toastify";
import { useCart } from "@/ContextApi/CartContext";
import {
  AddCircleOutline,
  RemoveCircleOutline,
  Close,
  ShoppingCart,
} from "@mui/icons-material";
import Link from "next/link";
import { API } from "@/lib/MainRoutes";
import { Product } from "@/types/types";

// کامپوننت موبایل-پسند و با احساس اپلیکیشن
export default function MobileCartList() {
  const {
    state: { cartItems },
    dispatch,
  } = useCart();

  // نگهداری محصولات کش‌شده
  const [productsMap, setProductsMap] = useState<Record<number, Product>>({});

  // رفرنس‌ها برای اسکرول و اندازه‌گیری هدر
  const headerRef = useRef<HTMLDivElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(60);

  useEffect(() => {
    const resize = () => {
      const h = headerRef.current?.offsetHeight ?? 64;
      setHeaderHeight(h);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // فرمت قیمت — ورودی می‌تواند رشته با ویرگول باشد یا عدد
  const parsePrice = (p: string | number) => {
    if (typeof p === "number") return p;
    if (!p) return 0;
    const digits = String(p).replace(/[^0-9]/g, "");
    return digits ? parseInt(digits, 10) : 0;
  };
  const formatPrice = (num: number) => num.toLocaleString("fa-IR");

  // بارگذاری اطلاعات محصول (کش داخلی)
  const fetchProduct = async (id: number) => {
    if (productsMap[id]) return productsMap[id];
    try {
      const res = await fetch(`${API}/products/${id}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to fetch product ${id}`);
      const product: Product = await res.json();
      setProductsMap((prev) => ({ ...prev, [id]: product }));
      return product;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const handleRemoveItem = (id: number, title?: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
    toast.success(title ? `${title} حذف شد` : "محصول حذف شد", {
      position: "top-center",
      autoClose: 2000,
      theme: "colored",
    });
  };

  const handleQuantityChange = async (
    id: number,
    priceType: "single" | "wholesale",
    delta: number
  ) => {
    const item = cartItems.find((i) => i.id === id && i.priceType === priceType);
    if (!item) return;

    const newQuantity = item.quantity + delta;
    const product = await fetchProduct(id);
    if (!product) return;

    if (newQuantity <= 0) {
      handleRemoveItem(id, item.title);
      return;
    }

    const shouldBeWholesale = newQuantity >= product.minwholesale;
    const newPriceType = shouldBeWholesale ? "wholesale" : "single";

    const newPrice =
      newPriceType === "single"
        ? String(product.discountedPrice ?? product.originalPrice ?? 0)
        : String(product.discountwholesalePrice ?? product.wholesalePrice ?? 0);
    const newDiscount = newPriceType === "single" ? product.discount : product.discountwholesale;

    if (priceType !== newPriceType) {
      dispatch({ type: "REMOVE_ITEM_BY_TYPE", payload: { id, priceType } });
      const existingItem = cartItems.find((i) => i.id === id && i.priceType === newPriceType);

      if (existingItem) {
        dispatch({
          type: "UPDATE_QUANTITY",
          payload: {
            ...existingItem,
            quantity: existingItem.quantity + newQuantity,
            price: newPrice,
            discount: newDiscount,
          },
        });
      } else {
        dispatch({
          type: "ADD_ITEM",
          payload: {
            id,
            title: product.title,
            quantity: newQuantity,
            priceType: newPriceType,
            price: newPrice,
            image: product.media?.[0]?.src || product.image || "/placeholder.jpg",
            discount: newDiscount,
          },
        });
      }

      toast.info(`نوع قیمت به ${newPriceType === "single" ? "تکی" : "عمده"} تغییر کرد.`, {
        position: "top-center",
        autoClose: 2000,
        theme: "colored",
      });
    } else {
      dispatch({ type: "UPDATE_QUANTITY", payload: { ...item, quantity: newQuantity, price: newPrice, discount: newDiscount } });
    }

    // نمایش پیام موفق
    toast.success(`تعداد تغییر کرد: ${newQuantity}`, { position: "top-center", autoClose: 1400, theme: "colored" });
  };

  const totalAmount = cartItems.reduce((total, item) => total + parsePrice(item.price) * item.quantity, 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // اسکرول به لیست
  const scrollToList = () => {
    if (!listRef.current) return;
    const top = listRef.current.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
    window.scrollTo({ top, behavior: "smooth" });
  };

  // 🔧 اصلاح شده: انیمیشن کارت با تایپ صحیح
  const cardVariants: Variants = { // <-- تایپ Variants اضافه شد
    hidden: { opacity: 0, y: 12 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
        duration: 0.22, 
        ease: "easeOut" as const // <-- as const اضافه شد
      } 
    },
    exit: { 
      opacity: 0, 
      y: -12, 
      transition: { duration: 0.18 } 
    },
  };

  return (
    <section
      className="bg-[#F7F7FB] w-full min-h-screen text-right"
      dir="rtl"
      style={{ paddingTop: `calc(env(safe-area-inset-top, 0px) + ${headerHeight}px)` }}
    >
      {/* هدر بالا - کوچک، بنفش و حس اپلیکیشن */}
      <div ref={headerRef} className="fixed top-[60px] right-0 left-0 z-50">
        <div className="backdrop-blur-sm bg-gradient-to-r from-[#7f4f95]/95 to-[#8f66b0]/95 text-white shadow-md">
          <div className="flex items-center justify-between px-4 py-3">
            {/* راست: آیکن و تعداد */}
            <button
              onClick={scrollToList}
              aria-label="برو به سبد خرید"
              className="flex items-center gap-2">
              <div className="relative">
                <ShoppingCart fontSize="small" className="text-white" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-3 min-w-[20px] h-5 px-1 rounded-full bg-yellow-400 text-xs font-semibold text-black flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
            </button>

            {/* مرکز: متن */}
            <div className="text-center flex-1 px-2">
              <p className="text-sm font-bold yekan truncate">
                {totalItems} محصول · {formatPrice(totalAmount)} تومان
              </p>
            </div>

            {/* چپ: دکمه ادامه خرید کوچک */}
            <div>
              {cartItems.length > 0 ? (
                <Link href="/checkout" className="inline-block">
                  <button className="bg-white text-[#805B99] px-3 py-1.5 rounded-lg shadow-sm text-xs font-medium yekanh">
                   تکمیل خرید
                  </button>
                </Link>
              ) : (
                <Link href="/search" className="inline-block">
                  <button className="bg-white/90 text-[#805B99] px-3 py-1.5 yekanh rounded-lg shadow-sm text-xs font-medium">
                    خرید کنید
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* محتوا */}
      <div className="w-[94%] mx-auto" ref={listRef}>
        <AnimatePresence>
          {cartItems.length > 0 ? (
            <div className="space-y-3 mt-2 pb-28" style={{ minHeight: `calc(100vh - ${headerHeight}px - env(safe-area-inset-bottom, 64px))` }}>
              {cartItems.map((item) => (
                <motion.article
                  key={`${item.id}-${item.priceType}-${item.color?.englishName || "default"}`}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-white rounded-2xl shadow-md p-3 flex items-center gap-3"
                  aria-labelledby={`cart-item-${item.id}`}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                  />

                  <div className="flex-1 min-w-0">
                    <h3 id={`cart-item-${item.id}`} className="text-sm font-semibold text-[#222] yekan line-clamp-2">
                      {item.title}
                    </h3>
                    {item.color && (
                      <p className="text-xs text-gray-500 yekan mt-1">
                        رنگ: {item.color.persianName} ({item.color.englishName})
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500 yekan">
                        {item.priceType === "single" ? "تکی" : "عمده"} · {item.price} تومان
                      </p>
                      <p className="text-sm font-bold text-[#6b3f88] yekan">
                        {formatPrice(parsePrice(item.price) * item.quantity)} تومان
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.priceType, 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f5edfb]"
                        aria-label={`افزایش ${item.title}`}
                      >
                        <AddCircleOutline fontSize="small" className="text-[#6b3f88]" />
                      </button>

                      <span className="text-sm yekan min-w-[28px] text-center">{item.quantity}</span>

                      <button
                        onClick={() => handleQuantityChange(item.id, item.priceType, -1)}
                        className="w-8 h-8 flex items-center justify-center rounded-full bg-[#f5edfb]"
                        aria-label={`کاهش ${item.title}`}
                      >
                        <RemoveCircleOutline fontSize="small" className="text-[#6b3f88]" />
                      </button>

                      <div className="flex-1" />

                      <button
                        onClick={() => handleRemoveItem(item.id, item.title)}
                        className="p-2 rounded-md"
                        aria-label={`حذف ${item.title}`}
                      >
                        <Close fontSize="small" className="text-gray-400 hover:text-red-500" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              ))}

              {/* کارت مجموع کل */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow p-4 mt-1"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 yekan">مجموع کل</p>
                  <p className="text-lg font-bold yekan">{formatPrice(totalAmount)} تومان</p>
                </div>
                <p className="text-xs text-gray-400 mt-1 yekan">قیمت‌ها با احتساب تخفیف نمایش داده شده‌اند</p>
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col justify-center h-[60vh] items-center text-gray-500 gap-4"
           
            >
              <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 7h10l-1.2 6.4a2 2 0 01-2 1.6H10.2a2 2 0 01-2-1.6L7 7z" stroke="#c4b7d9" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="10" cy="20" r="1" fill="#c4b7d9" />
                <circle cx="14" cy="20" r="1" fill="#c4b7d9" />
              </svg>

              <p className="yekan text-sm">سبد خرید شما خالی است</p>
              <Link href="/search">
                <button className="mt-2 bg-[#805B99] text-white px-4 py-2 rounded-xl yekanh shadow">بازدید محصولات</button>
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* نوار پایین: کال تو اکشن بزرگ برای موبایل */}
      {cartItems.length > 0 && (
        <div className="fixed left-0 right-0 bottom-0 z-50">
          <div className="backdrop-blur bg-white/70 border-t border-white/30 px-4 py-3">
            <div className="max-w-[940px] mx-auto flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm text-gray-600 yekan">مبلغ قابل پرداخت</p>
                <p className="text-lg font-bold yekan">{formatPrice(totalAmount)} تومان</p>
              </div>

              <Link href="/checkout" className="w-40">
                <button className="w-full py-2 rounded-xl bg-gradient-to-r from-[#8f66b0] to-[#6b4e82] text-white font-semibold shadow-lg">
                  پرداخت
                </button>
              </Link>
            </div>
            {/* امن کردن فضای پایین برای آیفون */}
            <div style={{ height: "env(safe-area-inset-bottom, 12px)" }} />
          </div>
        </div>
      )}

      {/* اعلان‌های دسترسی */}
      <div aria-live="polite" className="sr-only" />
    </section>
  );
}