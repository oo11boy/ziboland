import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  AddCircleOutline,
  AddShoppingCart,
  NotificationAdd,
  RemoveCircleOutline,
} from "@mui/icons-material";
import Link from "next/link";
import { Product, Variant } from "@/types/types";
import { formatPrice } from "../Utils/formatPrice";

interface ProductGridProps {
  filteredProducts: Product[];
  cardVariants: Variants;
  priceTypes: { [key: number]: "single" | "wholesale" };
  handlePriceTypeChange: (
    productId: number,
    type: "single" | "wholesale"
  ) => void;
  selectedVariants: { [key: number]: Variant | null };
  handleVariantSelect: (productId: number, variant: Variant) => void;
  cartQuantities: { [key: number]: number };
  showQuantitySelector: number | null;
  handleShowQuantitySelector: (productId: number) => void;
  handleQuantityChange: (productId: number, delta: number) => void;
  handleAddToCart: (productId: number) => void;
  handleNotifyMe: () => void;
}

export default function ProductGrid({
  filteredProducts,
  cardVariants,
  priceTypes,
  handlePriceTypeChange,
  selectedVariants,
  handleVariantSelect,
  cartQuantities,
  showQuantitySelector,
  handleShowQuantitySelector,
  handleQuantityChange,
  handleAddToCart,
  handleNotifyMe,
}: ProductGridProps) {
  return (
    <AnimatePresence>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-6">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((item) => {
            const activeVariant = selectedVariants[item.id];
            const effectivePriceType = priceTypes[item.id] || "single";

            // قیمت نهایی (از واریانت یا محصول اصلی)
            const finalPriceNum = effectivePriceType === "single"
              ? (activeVariant?.price_single || parseInt(String(item.discountedPrice).replace(/[^\d]/g, ""), 10) || 0)
              : (activeVariant?.price_wholesale || parseInt(String(item.discountwholesalePrice).replace(/[^\d]/g, ""), 10) || 0);

            // قیمت اصلی برای خط‌خورده
            const originalPriceNum = parseInt(String(item.originalPrice).replace(/[^\d]/g, ""), 10) || 0;

            // تخفیف نمایش‌داده‌شده
            const discountBadge = effectivePriceType === "single"
              ? (activeVariant?.discount_percent?.toString() || item.discount || "0")
              : (activeVariant?.discount_wholesale_percent?.toString() || item.discountwholesale || "0");

            const hasDiscount = discountBadge !== "0";

            // حداقل تعداد عمده
            const minWholesale = activeVariant?.min_wholesale || item.minwholesale || 1;

            return (
              <motion.div
                key={item.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                className="flex flex-col bg-white rounded-[0.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-3 md:p-4 relative overflow-hidden group/card"
              >
                {/* برچسب حداقل تعداد عمده */}
                {effectivePriceType === "wholesale" && (
                  <div className="absolute top-2 left-2 bg-[#c7c7c7] py-1 px-2 rounded-sm text-[11px] flex items-center z-10">
                    <span className="ml-1">+</span>
                    <span>{minWholesale} عدد</span>
                  </div>
                )}

                {/* تصویر + بج تخفیف */}
                <Link href={`/products/${item.id}`} className="block">
                  <div className="relative w-full aspect-square bg-gray-50 rounded-[1.5rem] overflow-hidden mb-3">
                    <img
                      src={activeVariant?.image_main || item.image || "/placeholder.jpg"}
                      alt={item.title}
                      className="w-full h-full object-contain p-2 group-hover/card:scale-105 transition-transform duration-500"
                    />
                    {hasDiscount && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] md:text-xs font-black px-2 py-0.5 rounded-lg shadow-sm z-10">
                        {discountBadge}%
                      </span>
                    )}
                  </div>
                </Link>

                {/* اطلاعات محصول */}
                <div className="flex flex-col flex-grow overflow-hidden">
                  <Link href={`/products/${item.id}`}>
                    <h3 className="text-gray-800 text-[11px] md:text-sm font-bold mb-2 line-clamp-2 h-8 md:h-10 leading-4 md:leading-5 tracking-tight text-center">
                      {item.title}
                    </h3>
                  </Link>

                  {/* سوئیچ قیمت تکی/عمده */}
                  <div className="flex bg-gray-100 p-0.5 rounded-xl mb-3">
                    <button
                      onClick={() => handlePriceTypeChange(item.id, "single")}
                      className={`flex-1 py-1 text-[9px] md:text-[10px] font-bold rounded-lg transition-all ${
                        effectivePriceType === "single"
                          ? "bg-white text-[#805B99] shadow-sm"
                          : "text-gray-400"
                      }`}
                    >
                      تکی
                    </button>
                    {/* نمایش دکمه عمده فقط اگر قیمت عمده > 0 باشد */}
                    {parseInt(String(item.discountwholesalePrice || "0").replace(/[^\d]/g, ""), 10) > 0 && (
                      <button
                        onClick={() => handlePriceTypeChange(item.id, "wholesale")}
                        className={`flex-1 py-1 text-[9px] md:text-[10px] font-bold rounded-lg transition-all ${
                          effectivePriceType === "wholesale"
                            ? "bg-white text-[#805B99] shadow-sm"
                            : "text-gray-400"
                        }`}
                      >
                        عمده
                      </button>
                    )}
                  </div>

                  {/* انتخاب رنگ */}
                  {item.variants && item.variants.length > 0 && (
                    <div className="flex gap-1.5 justify-center mb-3 h-5 items-center">
                      {item.variants.map((variant) => (
                        <button
                          key={variant.id || variant.color_englishName}
                          onClick={() => handleVariantSelect(item.id, variant)}
                          className={`w-3 h-3 md:w-4 md:h-4 rounded-full border border-gray-200 transition-transform ${
                            selectedVariants[item.id]?.id === variant.id
                              ? "scale-125 ring-2 ring-blue-400"
                              : ""
                          }`}
                          style={{ backgroundColor: variant.color_hexCode }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* پایین کارت: قیمت + عملیات */}
                <div className="mt-auto pt-2 border-t border-gray-50">
                  {!item.inStock ? (
                    /* وضعیت ناموجود */
                    <div className="flex items-center justify-between">
                      <p className="text-xs md:text-sm text-gray-600 font-medium">
                        موجود شد خبرم کن
                      </p>
                      <button
                        onClick={handleNotifyMe}
                        className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                        aria-label="اطلاع‌رسانی موجود شدن"
                      >
                        <NotificationAdd sx={{ fontSize: { xs: 18, md: 22 } }} />
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* قیمت با خط‌خورده */}
                      <div className="flex flex-col mb-3">
                        {hasDiscount && (
                          <span className="text-[10px] md:text-xs text-gray-400 line-through italic font-medium">
                            {formatPrice(originalPriceNum)}
                          </span>
                        )}
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm md:text-xl font-black text-gray-900 leading-none">
                            {formatPrice(finalPriceNum)}
                          </span>
                          <span className="text-[9px] md:text-[11px] font-medium text-gray-500">
                            تومان
                          </span>
                        </div>
                      </div>

                      {/* دکمه افزودن / انتخاب تعداد */}
                      <div className="h-9 md:h-12">
                        {showQuantitySelector !== item.id ? (
                          <button
                            onClick={() => handleShowQuantitySelector(item.id)}
                            className="w-full h-full bg-[#805B99] hover:bg-[#805B80] text-white rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-gray-200"
                          >
                            <AddShoppingCart sx={{ fontSize: { xs: 16, md: 22 } }} />
                            <span className="text-[11px] md:text-sm font-extrabold">
                              افزودن
                            </span>
                          </button>
                        ) : (
                          <div className="flex items-center justify-between bg-blue-50 rounded-2xl h-full p-1 border border-blue-100 shadow-inner">
                            <button
                              onClick={() => handleQuantityChange(item.id, 1)}
                              className="w-7 h-7 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-xl text-[#805B99] shadow-sm hover:bg-[#805B99] hover:text-white transition-all"
                            >
                              <AddCircleOutline sx={{ fontSize: { xs: 18, md: 20 } }} />
                            </button>

                            <div className="flex flex-col items-center">
                              <span className="text-xs md:text-sm font-black text-blue-900 leading-none">
                                {cartQuantities[item.id] || 0}
                              </span>
                              {cartQuantities[item.id] > 0 && (
                                <button
                                  onClick={() => handleAddToCart(item.id)}
                                  className="text-[8px] md:text-[10px] font-black text-green-600 uppercase tracking-tighter mt-0.5"
                                >
                                  تایید
                                </button>
                              )}
                            </div>

                            <button
                              onClick={() => handleQuantityChange(item.id, -1)}
                              className="w-7 h-7 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-xl text-red-500 shadow-sm hover:bg-red-500 hover:text-white transition-all"
                            >
                              <RemoveCircleOutline sx={{ fontSize: { xs: 18, md: 20 } }} />
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full text-center text-gray-500 text-lg py-12"
          >
            محصولی یافت نشد
          </motion.p>
        )}
      </div>
    </AnimatePresence>
  );
}