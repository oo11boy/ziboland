"use client";
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useCart } from "@/ContextApi/CartContext";
import { products } from "@/lib/staticDb";
import { AddCircleOutline, RemoveCircleOutline, Close, ShoppingCart } from "@mui/icons-material";
import Link from "next/link";

export default function MobileCartList() {
  const { state: { cartItems }, dispatch } = useCart();

  const handleRemoveItem = (id: number) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
    toast.success("محصول از سبد خرید حذف شد!", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
    });
  };

const handleQuantityChange = (id: number, priceType: "single" | "wholesale", delta: number) => {
  const item = cartItems.find((item) => item.id === id && item.priceType === priceType);
  if (!item) return;

  const newQuantity = item.quantity + delta;
  const product = products.find((p) => p.id === id);
  if (!product) return;

  if (newQuantity <= 0) {
    handleRemoveItem(id);
    return;
  }

  // تعیین نوع قیمت جدید بر اساس تعداد
  const shouldBeWholesale = newQuantity >= product.minwholesale;
  const newPriceType = shouldBeWholesale ? "wholesale" : "single";
  
  // اگر نوع قیمت تغییر کرده باشد
  if (priceType !== newPriceType) {
    // حذف آیتم قدیمی
    dispatch({ type: "REMOVE_ITEM_BY_TYPE", payload: { id, priceType } });
    
    // بررسی وجود آیتم با نوع قیمت جدید
    const existingItem = cartItems.find((item) => item.id === id && item.priceType === newPriceType);
    
    // مقادیر قیمت و تخفیف جدید
    const newPrice = newPriceType === "single" 
      ? product.discountedPrice.toString() 
      : product.discountwholesalePrice.toString();
    const newDiscount = newPriceType === "single" 
      ? product.discount 
      : product.discountwholesale;

    if (existingItem) {
      // اگر آیتم با نوع قیمت جدید وجود دارد، فقط مقدار آن را به‌روز کنید
      dispatch({
        type: "UPDATE_QUANTITY",
        payload: {
          ...existingItem,
          quantity: existingItem.quantity + newQuantity,
          price: newPrice,
          discount: newDiscount
        },
      });
    } else {
      // اگر آیتم با نوع قیمت جدید وجود ندارد، یک آیتم جدید اضافه کنید
      dispatch({
        type: "ADD_ITEM",
        payload: {
          id,
          title: product.title,
          quantity: newQuantity,
          priceType: newPriceType,
          price: newPrice,
          image: product.media ? product.media[0].src : product.image || "/placeholder.jpg",
          discount: newDiscount,
        },
      });
    }

    toast.info(`نوع قیمت به ${newPriceType === "single" ? "تکی" : "عمده"} تغییر کرد.`, {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
    });
  } else {
    // اگر نوع قیمت تغییر نکرده، فقط مقدار را به‌روز کنید
    const newPrice = priceType === "single" 
      ? product.discountedPrice.toString() 
      : product.discountwholesalePrice.toString();
    const newDiscount = priceType === "single" 
      ? product.discount 
      : product.discountwholesale;

    dispatch({
      type: "UPDATE_QUANTITY",
      payload: {
        ...item,
        quantity: newQuantity,
        price: newPrice,
        discount: newDiscount
      },
    });
  }

  toast.success(`تعداد محصول به ${newQuantity} تغییر کرد!`, {
    position: "top-center",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    theme: "colored",
  });
};

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  return (
    <section className="bg-[#F9F9F9] w-full py-4 min-h-screen font-yekan" dir="rtl">
      <div className="w-[95%] mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-4">
          <h2 className="text-lg font-bold text-[#374151] yekan mb-4">
            سبد خرید
          </h2>
          <AnimatePresence>
            {cartItems.length > 0 ? (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <motion.div
                    key={`${item.id}-${item.priceType}`}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex items-center gap-3 border-b border-[#e5e7eb] pb-4"
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-[#374151] yekan">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#6b7280] yekan">
                        نوع قیمت: {item.priceType === "single" ? "تکی" : "عمده"}
                      </p>
                      <p className="text-xs text-[#6b7280] yekan">
                        تعداد: {item.quantity}
                      </p>
                      <p className="text-xs text-[#6b7280] yekan">
                        قیمت واحد: {item.price} تومان
                      </p>
                      {item.priceType === "wholesale" && (
                        <p className="text-xs text-[#6b7280] yekan">
                          درصد تخفیف عمده: {item.discount}
                        </p>
                      )}
                      <p className="text-sm font-bold text-[#805B99] yekan">
                        مجموع: {(parseInt(item.price.replace(/,/g, "")) * item.quantity).toLocaleString("fa-IR")} تومان
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.priceType, 1)}
                          className="text-[#805B99] hover:text-[#6b4e82] p-1"
                          aria-label="افزایش تعداد"
                        >
                          <AddCircleOutline fontSize="small" />
                        </button>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.priceType, -1)}
                          className="text-[#805B99] hover:text-[#6b4e82] p-1"
                          aria-label="کاهش تعداد"
                        >
                          <RemoveCircleOutline fontSize="small" />
                        </button>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-500 hover:text-red-700 text-xs yekan"
                          aria-label="حذف محصول"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="text-[#805B99] hover:text-[#6b4e82] p-1"
                      aria-label="حذف محصول"
                    >
                      <Close fontSize="small" />
                    </button>
                  </motion.div>
                ))}
                <div className="mt-4">
                  <p className="text-lg font-bold text-[#374151] yekan">
                    مجموع کل: {cartItems.reduce((total, item) => {
                      const price = parseInt(item.price.replace(/,/g, ""));
                      return total + price * item.quantity;
                    }, 0).toLocaleString("fa-IR")} تومان
                  </p>
                </div>
                <div className="mt-4">
                  <Link
                    href="/checkout"
                    className="block w-full text-center bg-[#805B99] text-white py-3 rounded-lg hover:bg-[#6b4e82] transition duration-200 yekan text-sm"
                  >
                    ادامه خرید
                  </Link>
                </div>
              </div>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-[#6b7280] gap-4 h-[70vh] flex justify-center items-center yekan text-sm"
              >
                <ShoppingCart fontSize="large"/>
                سبد خرید شما خالی است
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}