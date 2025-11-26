import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  AddCircleOutline,
  AddShoppingCart,
  NotificationAdd,
  RemoveCircleOutline,
} from "@mui/icons-material";
import Link from "next/link";
import { Product } from "@/types/types";
import { formatPrice } from "../Utils/formatPrice";

interface ProductGridProps {
  filteredProducts: Product[];
  cardVariants: Variants;
  priceTypes: { [key: number]: "single" | "wholesale" };
  handlePriceTypeChange: (
    productId: number,
    type: "single" | "wholesale"
  ) => void;
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
  cartQuantities,
  showQuantitySelector,
  handleShowQuantitySelector,
  handleQuantityChange,
  handleAddToCart,
  handleNotifyMe,
}: ProductGridProps) {
  return (
    <AnimatePresence>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((item) => {
            // تعیین نوع قیمت واقعی — اگر عمده صفر بود → همیشه تکی
            const effectivePriceType =
              item.discountwholesalePrice > 0
                ? priceTypes[item.id] || "single"
                : "single";

            const finalPrice =
              effectivePriceType === "single"
                ? item.discountedPrice
                : item.discountwholesalePrice;

            const hasDiscount =
              (effectivePriceType === "single" && item.discount !== "0") ||
              (effectivePriceType === "wholesale" && item.discountwholesale !== "0");

            return (
              <motion.div
                key={item.id}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                className="tpsc-product-card relative"
              >
                {/* برچسب حداقل تعداد عمده — فقط وقتی واقعاً عمده فعاله */}
                {effectivePriceType === "wholesale" && (
                  <div className="absolute top-[2px] left-[2px] bg-[#c7c7c7] py-1 px-2 rounded-sm text-[11px] flex items-center z-10">
                    <span className="ml-1">+</span>
                    <span>{item.minwholesale} عدد</span>
                  </div>
                )}

                <Link
                  href={`/products/${item.id}`}
                  className="flex items-center flex-col"
                >
                  <img
                    src={item.image && item.image.length > 0 ? item.image : "/placeholder.jpg"}
                    alt={item.title}
                    width={200}
                    height={200}
                    className="tpsc-product-image object-cover"
                  />
                  <h2 className="tpsc-product-title text-center mt-2">{item.title}</h2>
                </Link>

                {/* دکمه‌های قیمت — فقط اگر قیمت عمده وجود داشته باشد */}
                <div className="tpsc-price-buttons mt-2">
                  {item.discountwholesalePrice > 0 && (
                    <button
                      className={`tpsc-price-button ${
                        effectivePriceType === "wholesale" ? "tpsc-price-button-active" : ""
                      }`}
                      onClick={() => handlePriceTypeChange(item.id, "wholesale")}
                      aria-label="انتخاب قیمت عمده"
                    >
                      قیمت عمده
                    </button>
                  )}
                  <button
                    className={`tpsc-price-button ${
                      effectivePriceType === "single" ? "tpsc-price-button-active" : ""
                    }`}
                    onClick={() => handlePriceTypeChange(item.id, "single")}
                    aria-label="انتخاب قیمت تکی"
                  >
                    قیمت تکی
                  </button>
                </div>

                {/* وضعیت موجودی */}
                {!item.inStock ? (
                  <div className="w-full flex justify-between items-center mt-3">
                    <p className="tpsc-price text-sm text-gray-600">موجود شد خبرم کن</p>
                    <button
                      className="tpsc-add-to-nocart"
                      onClick={handleNotifyMe}
                      aria-label="اطلاع‌رسانی موجود شدن محصول"
                    >
                      <NotificationAdd fontSize="small" />
                    </button>
                  </div>
                ) : (
                  <>
                    {/* نمایش تخفیف و قیمت خط‌خورده */}
                    {hasDiscount && (
                      <div className="tpsc-price-discount-container mt-2">
                        <p className="tpsc-price-strikethrough-text">
                          {formatPrice(
                            effectivePriceType === "single"
                              ? item.originalPrice
                              : item.wholesalePrice
                          )}
                        </p>
                        <p className="tpsc-discount-badge">
                          {effectivePriceType === "single" ? item.discount : item.discountwholesale}
                        </p>
                      </div>
                    )}

                    {/* قیمت نهایی + انتخاب تعداد */}
                    <div className="tpsc-price-quantity mt-3">
                      <p className="tpsc-price">
                        {formatPrice(finalPrice)} تومان
                      </p>

                      {/* انتخابگر تعداد کوچک (موبایل) */}
                      <div className="tpsc-quantity-selector-mobile relative">
                        {cartQuantities[item.id] > 0 && (
                          <button
                            className="-top-[20px] h-[20px] left-0 bg-[#c7c7c7] text-[11px] px-2 rounded-tr-lg absolute z-20"
                            onClick={() => handleAddToCart(item.id)}
                          >
                            ثبت
                          </button>
                        )}
                        <button onClick={() => handleQuantityChange(item.id, 1)}>
                          <AddCircleOutline fontSize="small" />
                        </button>
                        <input
                          type="text"
                          className="tpsc-quantity-input"
                          value={cartQuantities[item.id] || 0}
                          readOnly
                        />
                        <button onClick={() => handleQuantityChange(item.id, -1)}>
                          <RemoveCircleOutline fontSize="small" />
                        </button>
                      </div>

                      {/* دکمه سبد خرید */}
                      <button
                        className="tpsc-add-to-cart"
                        onClick={() => handleShowQuantitySelector(item.id)}
                      >
                        <AddShoppingCart fontSize="small" />
                      </button>

                      {/* انتخابگر بزرگ تعداد (وقتی کلیک شد) */}
                      {showQuantitySelector === item.id && (
                        <div
                          className="tpsc-quantity-selector relative"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button onClick={() => handleQuantityChange(item.id, 1)}>
                            <AddCircleOutline fontSize="small" />
                          </button>
                          <input
                            type="text"
                            className="tpsc-quantity-input"
                            value={cartQuantities[item.id] || 0}
                            readOnly
                          />
                          <button onClick={() => handleQuantityChange(item.id, -1)}>
                            <RemoveCircleOutline fontSize="small" />
                          </button>

                          {cartQuantities[item.id] > 0 && (
                            <button
                              className="tpsc-confirm-button absolute w-[40px] text-[10px] -top-[25px] left-0 bg-black px-1 rounded-tr-lg text-white h-[30px] z-20"
                              onClick={() => {
                                handleAddToCart(item.id);
                                handleShowQuantitySelector(item.id);
                              }}
                            >
                              ثبت
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            );
          })
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center col-span-full text-[#4b5563] text-lg"
          >
            محصولی یافت نشد
          </motion.p>
        )}
      </div>
    </AnimatePresence>
  );
}