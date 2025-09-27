"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useCart } from "@/ContextApi/CartContext";
import { AddCircleOutline, RemoveCircleOutline, Close, ShoppingCart } from "@mui/icons-material";
import Link from "next/link";
import { API } from "@/lib/MainRoutes";
import { Product } from "@/types/types";

export default function MobileCartList() {
  const { state: { cartItems }, dispatch } = useCart();
  const [productsMap, setProductsMap] = useState<Record<number, Product>>({});

  const fetchProduct = async (id: number) => {
    if (productsMap[id]) return productsMap[id];
    try {
      const res = await fetch(`${API}/products/${id}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to fetch product ${id}`);
      const product: Product = await res.json();
      setProductsMap(prev => ({ ...prev, [id]: product }));
      return product;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const handleRemoveItem = (id: number) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
    toast.success("محصول از سبد خرید حذف شد!", { position: "top-center", autoClose: 3000, theme: "colored" });
  };

  const handleQuantityChange = async (id: number, priceType: "single" | "wholesale", delta: number) => {
    const item = cartItems.find(i => i.id === id && i.priceType === priceType);
    if (!item) return;

    const newQuantity = item.quantity + delta;
    const product = await fetchProduct(id);
    if (!product) return;

    if (newQuantity <= 0) {
      handleRemoveItem(id);
      return;
    }

    const shouldBeWholesale = newQuantity >= product.minwholesale;
    const newPriceType = shouldBeWholesale ? "wholesale" : "single";

    const newPrice = newPriceType === "single" ? product.discountedPrice.toString() : product.discountwholesalePrice.toString();
    const newDiscount = newPriceType === "single" ? product.discount : product.discountwholesale;

    if (priceType !== newPriceType) {
      dispatch({ type: "REMOVE_ITEM_BY_TYPE", payload: { id, priceType } });
      const existingItem = cartItems.find(i => i.id === id && i.priceType === newPriceType);

      if (existingItem) {
        dispatch({
          type: "UPDATE_QUANTITY",
          payload: { ...existingItem, quantity: existingItem.quantity + newQuantity, price: newPrice, discount: newDiscount },
        });
      } else {
        dispatch({
          type: "ADD_ITEM",
          payload: { id, title: product.title, quantity: newQuantity, priceType: newPriceType, price: newPrice, image: product.media?.[0]?.src || product.image || "/placeholder.jpg", discount: newDiscount },
        });
      }

      toast.info(`نوع قیمت به ${newPriceType === "single" ? "تکی" : "عمده"} تغییر کرد.`, { position: "top-center", autoClose: 3000, theme: "colored" });
    } else {
      dispatch({
        type: "UPDATE_QUANTITY",
        payload: { ...item, quantity: newQuantity, price: newPrice, discount: newDiscount },
      });
    }

    toast.success(`تعداد محصول به ${newQuantity} تغییر کرد!`, { position: "top-center", autoClose: 3000, theme: "colored" });
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
          <h2 className="text-lg font-bold text-[#374151] yekan mb-4">سبد خرید</h2>
          <AnimatePresence>
            {cartItems.length > 0 ? (
              <div className="space-y-4">
                {cartItems.map(item => (
                  <motion.div
                    key={`${item.id}-${item.priceType}`}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="flex items-center gap-3 border-b border-[#e5e7eb] pb-4"
                  >
                    <img src={item.image} alt={item.title} className="w-16 h-16 object-cover rounded-lg" />
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-[#374151] yekan">{item.title}</h3>
                      <p className="text-xs text-[#6b7280] yekan">نوع قیمت: {item.priceType === "single" ? "تکی" : "عمده"}</p>
                      <p className="text-xs text-[#6b7280] yekan">تعداد: {item.quantity}</p>
                      <p className="text-xs text-[#6b7280] yekan">قیمت واحد: {item.price} تومان</p>
                      {item.priceType === "wholesale" && <p className="text-xs text-[#6b7280] yekan">درصد تخفیف عمده: {item.discount}</p>}
                      <p className="text-sm font-bold text-[#805B99] yekan">
                        مجموع: {(parseInt(item.price.replace(/,/g, "")) * item.quantity).toLocaleString("fa-IR")} تومان
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <button onClick={() => handleQuantityChange(item.id, item.priceType, 1)} className="text-[#805B99] hover:text-[#6b4e82] p-1" aria-label="افزایش تعداد">
                          <AddCircleOutline fontSize="small" />
                        </button>
                        <button onClick={() => handleQuantityChange(item.id, item.priceType, -1)} className="text-[#805B99] hover:text-[#6b4e82] p-1" aria-label="کاهش تعداد">
                          <RemoveCircleOutline fontSize="small" />
                        </button>
                        <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 text-xs yekan" aria-label="حذف محصول">
                          حذف
                        </button>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveItem(item.id)} className="text-[#805B99] hover:text-[#6b4e82] p-1" aria-label="حذف محصول">
                      <Close fontSize="small" />
                    </button>
                  </motion.div>
                ))}
                <div className="mt-4">
                  <p className="text-lg font-bold text-[#374151] yekan">
                    مجموع کل: {cartItems.reduce((total, item) => total + parseInt(item.price.replace(/,/g, "")) * item.quantity, 0).toLocaleString("fa-IR")} تومان
                  </p>
                </div>
                <div className="mt-4">
                  <Link href="/checkout" className="block w-full text-center bg-[#805B99] text-white py-3 rounded-lg hover:bg-[#6b4e82] transition duration-200 yekan text-sm">
                    ادامه خرید
                  </Link>
                </div>
              </div>
            ) : (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center text-[#6b7280] gap-4 h-[70vh] flex justify-center items-center yekan text-sm">
                <ShoppingCart fontSize="large" />
                سبد خرید شما خالی است
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
