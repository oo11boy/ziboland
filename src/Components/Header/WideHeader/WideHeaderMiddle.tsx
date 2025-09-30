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
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { useCart } from "@/ContextApi/CartContext";
import { Product } from "@/types/types";
import { API } from "@/lib/MainRoutes";
import { useAuth } from "@/ContextApi/AuthContext";
import { User2Icon } from "lucide-react";

export default function WideHeaderMiddle() {
  const { state: { cartItems}, dispatch } = useCart();
  const { isLoggedIn } = useAuth(); // استفاده از Context به‌جای state
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [productsMap, setProductsMap] = useState<Record<number, Product>>({});

  const toggleCartModal = () => setIsCartModalOpen(!isCartModalOpen);

  // دریافت داده‌های محصول از API
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

  const handleRemoveItem = (id: number) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
    toast.success("محصول از سبد خرید حذف شد!", {
      position: "top-center",
      autoClose: 3000,
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
      handleRemoveItem(id);
      return;
    }

    const shouldBeWholesale = newQuantity >= product.minwholesale;
    const newPriceType = shouldBeWholesale ? "wholesale" : "single";

    const newPrice = newPriceType === "single" ? product.discountedPrice.toString() : product.discountwholesalePrice.toString();
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
    } else {
      dispatch({
        type: "UPDATE_QUANTITY",
        payload: {
          ...item,
          quantity: newQuantity,
          price: newPrice,
          discount: newDiscount,
        },
      });
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, y: "-100%" },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: "-100%", transition: { duration: 0.2 } },
  };

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 0.5, transition: { duration: 0.3 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <section className="bg-[#F9F9F9] w-full py-2">
      <div className="flex justify-between h-auto items-center w-[90%] gap-2 m-auto">
        <div className="flex w-[33%] gap-3 items-center">
          <Link href={'../'} className="flex items-center">
            <span className="font-semibold neiriz text-xl ml-1">ز</span>
            <span className="font-semibold neiriz text-xl">یبولند</span>
          </Link>
          <a
            href="../search"
            className="flex w-1/2 items-center border border-[#d9d6d6] rounded-lg overflow-hidden"
          >
            <input className="w-full outline-0 px-2 text-base" type="text" placeholder="جستجو" />
            <button className="bg-[#EDEDED] p-2">
              <SearchOutlined fontSize="medium" />
            </button>
          </a>
        </div>
        <div className="flex w-[33%] text-center justify-center gap-3 items-center">
          <Link href={'../'} className="font-semibold newyork text-xl">ZIBOLAND</Link>
        </div>
        <div className="w-[33%] flex justify-end gap-2">
          <Link
            href={"../myaccount"}
            className="flex items-center gap-2 hover:bg-[#EBEBEB] hover:text-[black] p-2 rounded-lg border border-[#d9d6d6] text-base hover:border-[#C7C7C7]"
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
          <button className="relative flex items-center gap-2 p-2 hover:bg-[#EBEBEB] hover:text-[black] rounded-lg border border-[#d9d6d6] hover:border-[#C7C7C7]">
            <FavoriteBorderOutlined fontSize="medium" />
            <span className="bg-[#805B99] pt-1 text-[#EBEBEB] absolute bottom-0 -right-1 w-4 h-4 flex justify-center items-center text-[10px] rounded-full">
              2
            </span>
          </button>
          <button
            onClick={toggleCartModal}
            className="relative flex items-center gap-2 p-2 hover:bg-[#EBEBEB] hover:text-[black] rounded-lg border border-[#d9d6d6] hover:border-[#C7C7C7]"
          >
            <ShoppingBagOutlined fontSize="medium" />
            <span className="bg-[#805B99] pt-1 text-[#EBEBEB] absolute bottom-0 -right-1 w-4 h-4 flex justify-center items-center text-[10px] rounded-full">
              {cartItems.length}
            </span>
          </button>
        </div>
      </div>

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
              className="fixed top-0 right-0 w-full md:w-96 h-screen bg-white shadow-lg z-[999] overflow-y-auto"
              dir="rtl"
            >
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center p-4 border-b border-[#e5e7eb] bg-[#F9F9F9]">
                  <h2 className="text-lg font-bold text-[#374151] yekan">سبد خرید</h2>
                  <button
                    onClick={toggleCartModal}
                    className="p-2 text-[#805B99] hover:bg-[#EBEBEB] rounded-full"
                  >
                    <Close fontSize="medium" />
                  </button>
                </div>
                <div className="flex-1 p-4">
                  {cartItems.length > 0 ? (
                    <div className="space-y-4">
                      {cartItems.map((item) => (
                        <div
                          key={`${item.id}-${item.priceType}`}
                          className="flex items-center gap-4 border-b border-[#e5e7eb] pb-4"
                        >
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-[#374151] yekan">{item.title}</h3>
                            <p className="text-sm text-[#6b7280] yekan">نوع قیمت: {item.priceType === "single" ? "تکی" : "عمده"}</p>
                            <p className="text-sm text-[#6b7280] yekan">تعداد: {item.quantity}</p>
                            <p className="text-sm text-[#6b7280] yekan">قیمت واحد: {item.price} تومان</p>
                            {item.priceType === "wholesale" && <p className="text-sm text-[#6b7280] yekan">درصد تخفیف عمده: {item.discount}</p>}
                            <p className="text-sm font-bold text-[#805B99] yekan">
                              مجموع: {(parseInt(item.price.replace(/,/g, "")) * item.quantity).toLocaleString("fa-IR")} تومان
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <button onClick={() => handleQuantityChange(item.id, item.priceType, 1)} className="text-[#805B99] hover:text-[#6b4e82]">
                                <AddCircleOutline fontSize="small" />
                              </button>
                              <button onClick={() => handleQuantityChange(item.id, item.priceType, -1)} className="text-[#805B99] hover:text-[#6b4e82]">
                                <RemoveCircleOutline fontSize="small" />
                              </button>
                              <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 text-sm yekan">
                                حذف
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div className="mt-4">
                        <p className="text-lg font-bold text-[#374151] yekan">
                          مجموع کل: {cartItems.reduce((total, item) => {
                            const price = parseInt(item.price.replace(/,/g, ""));
                            return total + price * item.quantity;
                          }, 0).toLocaleString("fa-IR")} تومان
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-[#6b7280] yekan">سبد خرید شما خالی است</p>
                  )}
                </div>
                {cartItems.length > 0 && (
                  <div className="p-4 border-t border-[#e5e7eb] bg-[#F9F9F9]">
                    <Link href="/checkout" className="block w-full text-center bg-[#805B99] text-white py-2 rounded-lg hover:bg-[#6b4e82] transition duration-200 yekan">
                      ادامه خرید
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