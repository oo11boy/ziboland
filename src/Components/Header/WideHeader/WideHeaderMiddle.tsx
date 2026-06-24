"use client";
import {
  FavoriteBorderOutlined,
  LoginOutlined,
  SearchOutlined,
  ShoppingBagOutlined,
  Close,
  AddCircleOutline,
  RemoveCircleOutline,
  AccountCircle,
} from "@mui/icons-material";
import Link from "next/link";
import React, { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { toast } from "react-toastify";
import { useCart } from "@/ContextApi/CartContext";
import { useAuth } from "@/ContextApi/AuthContext";
import { usePathname } from "next/navigation";

export default function WideHeaderMiddle() {
  const {
    state: { cartItems },
    dispatch,
  } = useCart();
  const { isLoggedIn } = useAuth();
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const pathname = usePathname();

  const toggleCartModal = () => setIsCartModalOpen((prev) => !prev);

  // حذف کامل یک آیتم (فقط بر اساس id + رنگ)
  const handleRemoveItem = (item: (typeof cartItems)[0]) => {
    dispatch({
      type: "REMOVE_ITEM_BY_TYPE",
      payload: {
        id: item.id,
        color: item.color || undefined,
      },
    });
    toast.success("محصول از سبد خرید حذف شد!", {
      position: "top-center",
      autoClose: 3000,
      theme: "colored",
    });
  };

  const handleQuantityChange = (item: (typeof cartItems)[0], delta: number) => {
    const itemKey = `${item.id}-${item.color?.englishName || "default"}`;
    const newQuantity = item.quantity + delta;

    if (delta > 0 && newQuantity > item.stock_quantity) {
      toast.warning(`بیشتر از ${item.stock_quantity} عدد در انبار موجود نیست`, {
        position: "top-center",
        autoClose: 2000,
      });
      return;
    }

    if (newQuantity >= 1) {
      dispatch({
        type: "UPDATE_QUANTITY",
        payload: { itemKey, newQuantity },
      });
    } else {
      handleRemoveItem(item);
    }
  };

  const modalVariants: Variants = {
    hidden: { opacity: 0, y: "-100%" },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    exit: { opacity: 0, y: "-100%", transition: { duration: 0.2 } },
  };

  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.5, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  // محاسبه مجموع کل سبد
  const totalCartPrice = cartItems.reduce((total, item) => {
    const unitPrice = parseInt(item.price.replace(/,/g, ""), 10);
    return total + unitPrice * item.quantity;
  }, 0);

  // تعداد کل آیتم‌ها (برای نمایش روی آیکون سبد)
  const totalItemsCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  // بررسی آیا در صفحه search هستیم
  const isSearchPage = pathname === "/search";

  return (
    <section className="bg-[#F9F9F9] w-full py-2">
      <div className="flex justify-between h-auto items-center w-[90%] gap-2 m-auto">
        <div className="flex w-[33%] gap-3 items-center">
          <Link href="/" className="flex items-center">
            <span className="font-semibold neiriz text-xl ml-1">ز</span>
            <span className="font-semibold neiriz text-xl">یبولند</span>
          </Link>
          {/* باکس سرچ - فقط در صفحات غیر از search نمایش داده شود */}
          {!isSearchPage && (
            <a
              href="/search"
              className="flex w-1/2 items-center border border-[#d9d6d6] rounded-lg overflow-hidden"
            >
              <input
                className="w-full outline-0 px-2 text-base"
                type="text"
                placeholder="جستجو"
              />
              <button className="bg-[#EDEDED] p-2">
                <SearchOutlined fontSize="medium" />
              </button>
            </a>
          )}
        </div>
        <div className="flex w-[33%] text-center justify-center gap-3 items-center">
          <Link href="/" className="font-semibold newyork text-xl">
            ZIBOLAND
          </Link>
        </div>
        <div className="w-[33%] flex justify-end gap-2">
          <Link
            href="/myaccount"
            className="flex items-center gap-2 hover:bg-[#EBEBEB] hover:text-black p-2 rounded-lg border border-[#d9d6d6] text-base hover:border-[#C7C7C7]"
          >
            {isLoggedIn ? (
              <>
                <AccountCircle fontSize="small" />
                <span>مدیریت حساب</span>
              </>
            ) : (
              <>
                <LoginOutlined fontSize="small" />
                <span>ورود | عضویت</span>
              </>
            )}
          </Link>
          <button className="relative hidden items-center gap-2 p-2 hover:bg-[#EBEBEB] hover:text-black rounded-lg border border-[#d9d6d6] hover:border-[#C7C7C7]">
            <FavoriteBorderOutlined fontSize="medium" />
            <span className="bg-[#805B99] pt-1 text-[#EBEBEB] absolute bottom-0 -right-1 w-4 h-4 flex justify-center items-center text-[10px] rounded-full">
              2
            </span>
          </button>
          <button
            onMouseEnter={toggleCartModal}
            className="relative flex items-center gap-2 p-2 hover:bg-[#EBEBEB] hover:text-black rounded-lg border border-[#d9d6d6] hover:border-[#C7C7C7]"
          >
            <ShoppingBagOutlined fontSize="medium" />
            <span className="bg-[#805B99] pt-1 text-[#EBEBEB] absolute bottom-0 -right-1 w-4 h-4 flex justify-center items-center text-[10px] rounded-full">
              {totalItemsCount}
            </span>
          </button>
        </div>
      </div>

      {/* مودال سبد خرید */}
      <AnimatePresence>
        {isCartModalOpen && (
          <>
            <motion.div
              variants={backdropVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed inset-0 bg-black z-[990]"
              onClick={toggleCartModal}
            />
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed top-0 left-0 w-full md:w-96 h-screen bg-white shadow-2xl z-[999] overflow-y-auto"
              dir="rtl"
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center p-4 border-b border-[#e5e7eb] bg-[#F9F9F9]">
                  <h2 className="text-lg font-bold text-[#374151] yekan">
                    سبد خرید
                  </h2>
                  <button
                    onClick={toggleCartModal}
                    className="p-2 text-[#805B99] hover:bg-[#EBEBEB] rounded-full"
                  >
                    <Close fontSize="medium" />
                  </button>
                </div>

                <div className="flex-1 p-4 overflow-y-auto">
                  {cartItems.length > 0 ? (
                    <div className="space-y-4">
                      {cartItems.map((item) => {
                        // ۱. استخراج قیمت واحد اصلی (بدون تخفیف) از دیتای ذخیره شده در آیتم
                        const originalUnitPrice = item.priceType === "wholesale" 
                          ? (item.baseWholesalePrice || 0) 
                          : (item.baseRetailPrice || 0);

                        // ۲. استخراج قیمت واحد پرداختی (که تخفیف قبلاً روی آن اعمال شده)
                        const payableUnitPrice = parseInt(item.price.replace(/,/g, ""), 10);

                        // ۳. محاسبه مجموع کل برای این ردیف (تعداد ضربدر قیمت با تخفیف)
                        const itemTotalPayable = payableUnitPrice * item.quantity;

                        return (
                          <div
                            key={`${item.id}-${item.color?.englishName || "default"}`}
                            className="flex items-start gap-4 border-b border-[#e5e7eb] pb-4"
                          >
                            {/* تصویر محصول */}
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-20 h-20 object-cover rounded-lg border flex-shrink-0"
                            />

                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-semibold text-[#374151] yekan line-clamp-2 leading-6">
                                {item.title}
                              </h3>

                              {/* نمایش رنگ انتخاب شده */}
                              {item.color && (
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs text-[#6b7280] yekan">رنگ:</span>
                                  <div className="flex items-center gap-1.5">
                                    <div
                                      className="w-4 h-4 rounded-full border border-gray-300"
                                      style={{ backgroundColor: item.color.hexCode }}
                                    />
                                    <span className="text-xs text-[#6b7280] yekan">
                                      {item.color.persianName || item.color.englishName}
                                    </span>
                                  </div>
                                </div>
                              )}

                              {/* بخش جزئیات قیمت */}
                              <div className="mt-2 space-y-1 text-sm yekan">
                                <div className="flex justify-between items-center text-[#6b7280]">
                                  <span>نوع خرید:</span>
                                  <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                                    {item.priceType === "single" ? "تکی" : "عمده"}
                                  </span>
                                </div>

                                <div className="flex justify-between items-center text-[#6b7280]">
                                  <span>{item.priceType === "single" ? "قیمت واحد اصلی:" : "قیمت واحد عمده"}</span>
                                  <span>{originalUnitPrice.toLocaleString("fa-IR")} تومان</span>
                                </div>

                                {/* نمایش درصد تخفیف فقط اگر وجود داشته باشد */}
                                {item.discount !== "0" && (
                                  <div className="flex justify-between items-center text-green-600 text-xs">
                                    <span>تخفیف:</span>
                                    <span className="font-bold">{item.discount}</span>
                                  </div>
                                )}

                                <div className="flex justify-between items-center font-bold text-[#805B99] pt-1 border-t border-dashed border-gray-200 mt-1">
                                  <span>مجموع آیتم:</span>
                                  <span className="text-base">
                                    {itemTotalPayable.toLocaleString("fa-IR")} تومان
                                  </span>
                                </div>
                              </div>

                              {/* دکمه‌های کنترل تعداد و حذف */}
                              <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-1">
                                  <button
                                    onClick={() => handleQuantityChange(item, 1)}
                                    className="text-[#805B99] hover:scale-110 transition-transform"
                                    title="افزایش"
                                  >
                                    <AddCircleOutline fontSize="small" />
                                  </button>
                                  <span className="font-bold text-base w-6 text-center">
                                    {item.quantity}
                                  </span>
                                  <button
                                    onClick={() => handleQuantityChange(item, -1)}
                                    className="text-[#805B99] hover:scale-110 transition-transform"
                                    title="کاهش"
                                  >
                                    <RemoveCircleOutline fontSize="small" />
                                  </button>
                                </div>

                                <button
                                  onClick={() => handleRemoveItem(item)}
                                  className="text-red-500 hover:text-red-700 text-xs yekan font-medium flex items-center gap-1"
                                >
                                  <Close fontSize="inherit" />
                                  حذف از سبد
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}

                      <div className="mt-6 pt-4 border-t-2 border-[#805B99]">
                        <p className="text-xl font-bold text-[#374151] yekan text-center">
                          مجموع کل سبد: {totalCartPrice.toLocaleString("fa-IR")}{" "}
                          تومان
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-[#6b7280] yekan py-16 text-lg">
                      سبد خرید شما خالی است
                    </p>
                  )}
                </div>

                {cartItems.length > 0 && (
                  <div className="p-4 border-t border-[#e5e7eb] bg-[#F9F9F9]">
                    <Link
                      href="/checkout"
                      className="block w-full text-center bg-[#805B99] text-white py-4 rounded-lg hover:bg-[#6b4e82] transition duration-200 yekan font-bold text-lg shadow-lg"
                      onClick={toggleCartModal}
                    >
                      ادامه خرید و پرداخت
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}