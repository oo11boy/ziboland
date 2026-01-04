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

export default function WideHeaderMiddle() {
  const {
    state: { cartItems },
    dispatch,
  } = useCart();
  const { isLoggedIn } = useAuth();
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

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
// تابع handleQuantityChange را با این کد جایگزین کنید:
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

  return (
    <section className="bg-[#F9F9F9] w-full py-2">
      <div className="flex justify-between h-auto items-center w-[90%] gap-2 m-auto">
        <div className="flex w-[33%] gap-3 items-center">
          <Link href="/" className="flex items-center">
            <span className="font-semibold neiriz text-xl ml-1">ز</span>
            <span className="font-semibold neiriz text-xl">یبولند</span>
          </Link>
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
            onClick={toggleCartModal}
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
              className="fixed top-0 right-0 w-full md:w-96 h-screen bg-white shadow-2xl z-[999] overflow-y-auto"
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
                        const unitPrice = parseInt(
                          item.price.replace(/,/g, ""),
                          10
                        );
                        const itemTotal = unitPrice * item.quantity;

                        return (
                          <div
                            key={`${item.id}-${
                              item.color?.englishName || "default"
                            }`}
                            className="flex items-start gap-4 border-b border-[#e5e7eb] pb-4"
                          >
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-20 h-20 object-cover rounded-lg border"
                            />
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-[#374151] yekan line-clamp-2">
                                {item.title}
                              </h3>

                              {/* نمایش رنگ */}
                              {item.color && (
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs text-[#6b7280] yekan">
                                    رنگ:
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <div
                                      className="w-6 h-6 rounded-full border-2 border-gray-300"
                                      style={{
                                        backgroundColor: item.color.hexCode,
                                      }}
                                    />
                                    <span className="text-xs text-[#6b7280] yekan">
                                      {item.color.persianName ||
                                        item.color.englishName}
                                    </span>
                                  </div>
                                </div>
                              )}

                              <div className="mt-2 space-y-1 text-sm text-[#6b7280] yekan">
                                <p>
                                  نوع قیمت:{" "}
                                  {item.priceType === "single" ? "تکی" : "عمده"}
                                </p>
                                <p>
                                  قیمت واحد: {unitPrice.toLocaleString("fa-IR")}{" "}
                                  تومان
                                </p>
                                {item.discount !== "0" && (
                                  <p className="text-green-600">
                                    تخفیف: {item.discount}
                                  </p>
                                )}
                                <p className="font-bold text-[#805B99]">
                                  مجموع این آیتم:{" "}
                                  {itemTotal.toLocaleString("fa-IR")} تومان
                                </p>
                              </div>

                              <div className="flex items-center gap-3 mt-3">
                                <button
                                  onClick={() => handleQuantityChange(item, 1)}
                                  className="text-[#805B99] hover:text-[#6b4e82]"
                                  title="افزایش"
                                >
                                  <AddCircleOutline fontSize="small" />
                                </button>
                                <span className="font-bold text-lg w-8 text-center">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => handleQuantityChange(item, -1)}
                                  className="text-[#805B99] hover:text-[#6b4e82]"
                                  title="کاهش"
                                >
                                  <RemoveCircleOutline fontSize="small" />
                                </button>
                                <button
                                  onClick={() => handleRemoveItem(item)}
                                  className="text-red-500 hover:text-red-700 text-sm yekan ml-auto"
                                >
                                  حذف
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
