"use client";
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
    type: "single" | "wholesale",
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
  // ۱. منطق مرتب‌سازی محصولات: موجودها اول، ناموجودها آخر
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const aInStock = a.variants?.some((v) => (v.stock_quantity ?? 0) > 0)
      ? 1
      : 0;
    const bInStock = b.variants?.some((v) => (v.stock_quantity ?? 0) > 0)
      ? 1
      : 0;
    return bInStock - aInStock;
  });

  return (
    <AnimatePresence>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mt-6">
        {sortedProducts.length > 0 ? (
          sortedProducts.map((item) => {
            // ۲. مرتب‌سازی واریانت‌ها: موجودترین و ارزان‌ترین در ابتدا
            const sortedVariants = item.variants
              ? [...item.variants].sort((a, b) => {
                  const aStock = (a.stock_quantity ?? 0) > 0 ? 1 : 0;
                  const bStock = (b.stock_quantity ?? 0) > 0 ? 1 : 0;

                  if (aStock !== bStock) return bStock - aStock; // موجودها قبل از ناموجودها

                  const aPrice =
                    (a.price_single || 0) *
                    (1 - (a.discount_percent || 0) / 100);
                  const bPrice =
                    (b.price_single || 0) *
                    (1 - (b.discount_percent || 0) / 100);
                  return aPrice - bPrice; // ارزان‌ترها قبل از گران‌ترها
                })
              : [];

            // استفاده از واریانت انتخاب شده یا اولین واریانت از لیست مرتب شده
            const activeVariant =
              selectedVariants[item.id] || sortedVariants[0];
            const effectivePriceType = priceTypes[item.id] || "single";
            const currentQty = cartQuantities[item.id] || 0;

            const stockQuantity = activeVariant?.stock_quantity ?? 0;
            const isInStock = stockQuantity > 0;

            const baseRetailPrice = activeVariant?.price_single || 0;
            const baseWholesalePrice = activeVariant?.price_wholesale || 0;
            const retailDiscountPercent = activeVariant?.discount_percent || 0;
            const minWholesale = activeVariant?.min_wholesale || 1;

            const hasWholesalePrice =
              baseWholesalePrice > 0 && minWholesale > 1;

            const wholesaleDifferencePercent =
              baseRetailPrice > baseWholesalePrice
                ? Math.round(
                    ((baseRetailPrice - baseWholesalePrice) / baseRetailPrice) *
                      100,
                  )
                : 0;

            let unitPriceAfterDiscount: number;
            let displayDiscount: number;
            let badgeColor = "bg-red-500";

            if (effectivePriceType === "wholesale" && hasWholesalePrice) {
              unitPriceAfterDiscount = baseWholesalePrice;
              displayDiscount = wholesaleDifferencePercent;
              badgeColor = "bg-green-600";
            } else {
              unitPriceAfterDiscount = Math.round(
                baseRetailPrice * (1 - retailDiscountPercent / 100),
              );
              displayDiscount = retailDiscountPercent;
              badgeColor = "bg-red-500";
            }

            return (
              <motion.div
                key={item.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                className={`flex flex-col bg-white rounded-[0.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-3 md:p-4 relative overflow-hidden group/card ${
                  !isInStock ? "opacity-70" : ""
                }`}
              >
                {/* برچسب حداقل تعداد عمده */}
                {effectivePriceType === "wholesale" && hasWholesalePrice && (
                  <div className="absolute top-2 left-2 bg-[#c7c7c7] py-1 px-2 rounded-sm text-[11px] flex items-center z-10">
                    <span className="ml-1">+</span>
                    <span>{minWholesale} عدد</span>
                  </div>
                )}

                {/* تصویر + بج تخفیف هوشمند */}
                <Link href={`/products/${item.id}`} className="block">
                  <div className="relative w-full aspect-square bg-gray-50 rounded-[1.5rem] overflow-hidden mb-3">
                    <img
                      src={
                        activeVariant?.image_main ||
                        item.image ||
                        "/placeholder.jpg"
                      }
                      alt={item.title}
                      className="w-full h-full object-contain p-2 group-hover/card:scale-105 transition-transform duration-500"
                    />
                    {displayDiscount > 0 && isInStock && (
                      <span
                        className={`absolute top-2 right-2 ${badgeColor} text-white text-[10px] md:text-xs font-black px-2 py-0.5 rounded-lg shadow-sm z-10`}
                      >
                        {displayDiscount}%{" "}
                        {effectivePriceType === "wholesale" && "سود"}
                      </span>
                    )}
                    {!isInStock && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                        <span className="text-white text-lg font-bold">
                          ناموجود
                        </span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* عنوان و سوئیچ قیمت */}
                <div className="flex flex-col flex-grow overflow-hidden">
                  <Link href={`/products/${item.id}`}>
                    <h3 className="text-gray-800 text-[11px] md:text-sm font-bold mb-2 line-clamp-2 h-8 md:h-10 leading-4 md:leading-5 tracking-tight text-center">
                      {item.title}
                    </h3>
                  </Link>

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
                    {hasWholesalePrice && (
                      <button
                        onClick={() =>
                          handlePriceTypeChange(item.id, "wholesale")
                        }
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

                  {/* انتخاب رنگ - نمایش بر اساس لیست مرتب شده */}
                  <div className="flex gap-1.5 justify-center mb-3 h-5 items-center">
                    {sortedVariants.map((variant) => {
                      const variantInStock = (variant.stock_quantity ?? 0) > 0;
                      return (
                        <button
                          key={variant.id}
                          onClick={() =>
                            variantInStock &&
                            handleVariantSelect(item.id, variant)
                          }
                          disabled={!variantInStock}
                          className={`w-3 h-3 md:w-4 md:h-4 rounded-full border border-gray-200 transition-transform relative ${
                            activeVariant?.id === variant.id
                              ? "scale-125 ring-2 ring-[#805B99]"
                              : ""
                          } ${!variantInStock ? "opacity-50 cursor-not-allowed" : ""}`}
                          style={{ backgroundColor: variant.color_hexCode }}
                        >
                          {!variantInStock && (
                            <span
                              className="absolute inset-0 flex items-center justify-center"
                              style={{
                                background:
                                  "linear-gradient(45deg, transparent 48%, red 49%, red 51%, transparent 52%)",
                              }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* پایین کارت: قیمت + عملیات */}
                <div className="mt-auto pt-2 border-t border-gray-50">
                  {!isInStock ? (
                    <div className="flex items-center justify-between">
                      <p className="text-xs md:text-sm text-gray-600 font-medium">
                        موجود شد خبرم کن
                      </p>
                      <button
                        onClick={handleNotifyMe}
                        className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        <NotificationAdd
                          sx={{ fontSize: { xs: 18, md: 22 } }}
                        />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col mb-3">
                        {displayDiscount > 0 && (
                          <span className="text-[10px] md:text-xs text-gray-400 line-through italic font-medium">
                            {formatPrice(baseRetailPrice)}
                          </span>
                        )}
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm md:text-xl font-black text-gray-900 leading-none">
                            {formatPrice(unitPriceAfterDiscount)}
                          </span>
                          <span className="text-[9px] md:text-[11px] font-medium text-gray-500">
                            تومان
                          </span>
                        </div>
                      </div>

                      <div className="h-9 md:h-12">
                        {showQuantitySelector !== item.id ? (
                          <button
                            onClick={() => handleShowQuantitySelector(item.id)}
                            className="w-full h-full bg-[#805B99] hover:bg-[#6b4e82] text-white rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-gray-200"
                          >
                            <AddShoppingCart
                              sx={{ fontSize: { xs: 16, md: 22 } }}
                            />
                            <span className="text-[11px] md:text-sm font-extrabold">
                              افزودن
                            </span>
                          </button>
                        ) : (
                          <div className="flex items-center justify-between bg-blue-50 rounded-2xl h-full p-1 border border-blue-100 shadow-inner">
                            <button
                              onClick={() => handleQuantityChange(item.id, 1)}
                              disabled={currentQty >= stockQuantity}
                              className="w-7 h-7 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-xl text-[#805B99] shadow-sm hover:bg-[#805B99] hover:text-white transition-all disabled:opacity-50"
                            >
                              <AddCircleOutline
                                sx={{ fontSize: { xs: 18, md: 20 } }}
                              />
                            </button>

                            <div className="flex flex-col items-center">
                              <span className="text-xs md:text-sm font-black text-blue-900 leading-none">
                                {currentQty || 0}
                              </span>
                              {currentQty > 0 && (
                                <button
                                  onClick={() => handleAddToCart(item.id)}
                                  className="text-[10px] border rounded bg-green-600 text-white px-2 md:text-[14px] font-black uppercase tracking-tighter mt-0.5"
                                >
                                  ثبت
                                </button>
                              )}
                            </div>

                            <button
                              onClick={() => handleQuantityChange(item.id, -1)}
                              disabled={currentQty <= 0}
                              className="w-7 h-7 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-xl text-red-500 shadow-sm hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                            >
                              <RemoveCircleOutline
                                sx={{ fontSize: { xs: 18, md: 20 } }}
                              />
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
