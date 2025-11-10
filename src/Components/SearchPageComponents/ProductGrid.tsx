import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  AddCircleOutline,
  AddShoppingCart,
  NotificationAdd,
  RemoveCircleOutline,
} from "@mui/icons-material";
import Link from "next/link";
import { Product } from "@/types/types";

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
          filteredProducts.map((item) => (
            <motion.div
              key={item.id}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="tpsc-product-card"
            >
              {priceTypes[item.id] === "wholesale" && (
                <div className="absolute top-[2px] left-[2px] bg-[#c7c7c7] py-1 px-2 rounded-sm text-[11px] flex items-center">
                  <p className="ml-1">+</p>
                  <p>{item.minwholesale} عدد</p>
                </div>
              )}
              <Link
                href={`/products/${item.id}`}
                className="flex items-center flex-col"
              >
                <img
                  src={
                    item.image.length > 0
                      ? item.image
                      : "/placeholder.jpg"
                  }
                  alt={
                    item.media && item.media.length > 0
                      ? item.media[0].alt
                      : item.title
                  }
                  width={200}
                  height={200}
                  className="tpsc-product-image"
                />
                <h2 className="tpsc-product-title">{item.title}</h2>
              </Link>
              <div className="tpsc-price-buttons">
                <button
                  className={`tpsc-price-button ${
                    priceTypes[item.id] === "wholesale"
                      ? "tpsc-price-button-active"
                      : ""
                  }`}
                  onClick={() =>
                    handlePriceTypeChange(item.id, "wholesale")
                  }
                  aria-label="انتخاب قیمت عمده"
                >
                  قیمت عمده
                </button>
                <button
                  className={`tpsc-price-button ${
                    priceTypes[item.id] === "single"
                      ? "tpsc-price-button-active"
                      : ""
                  }`}
                  onClick={() =>
                    handlePriceTypeChange(item.id, "single")
                  }
                  aria-label="انتخاب قیمت تکی"
                >
                  قیمت تکی
                </button>
              </div>
              {!item.inStock ? (
                <div className="text-center w-full">ناموجود</div>
              ) : (
                <div className="tpsc-price-discount-container">
                  <p className="tpsc-price-strikethrough-text">
                    {priceTypes[item.id] === "single"
                      ? item.originalPrice
                      : item.wholesalePrice}
                  </p>
                  <p className="tpsc-discount-badge">
                    {priceTypes[item.id] === "single"
                      ? item.discount
                      : item.discountwholesale}
                  </p>
                </div>
              )}
              {!item.inStock ? (
                <div className="w-full flex justify-between items-center">
                  <p className="tpsc-price">موجود شد خبرم کن</p>
                  <button
                    className="tpsc-add-to-nocart"
                    onClick={() => handleNotifyMe()}
                    aria-label="نمایش انتخابگر تعداد"
                  >
                    <NotificationAdd fontSize="small" />
                  </button>
                </div>
              ) : (
                <div className="tpsc-price-quantity">
                  <p className="tpsc-price">
                    {priceTypes[item.id] === "single"
                      ? item.discountedPrice
                      : item.discountwholesalePrice}{" "}
                    تومان
                  </p>
                  <div className="tpsc-quantity-selector-mobile relative">
                    {cartQuantities[item.id] > 0 && (
                      <button
                        className="-top-[20px] h-[20px] left-0 bg-[#c7c7c7] text-[11px] px-2 rounded-tr-lg absolute"
                        onClick={() => handleAddToCart(item.id)}
                        aria-label="ثبت تعداد محصول"
                      >
                        ثبت
                      </button>
                    )}
                    <button
                      onClick={() => handleQuantityChange(item.id, 1)}
                      aria-label="افزایش تعداد"
                    >
                      <AddCircleOutline fontSize="small" />
                    </button>
                    <input
                      type="text"
                      className="tpsc-quantity-input"
                      value={cartQuantities[item.id] || 0}
                      readOnly
                      aria-label="تعداد محصول"
                    />
                    <button
                      onClick={() =>
                        handleQuantityChange(item.id, -1)
                      }
                      aria-label="کاهش تعداد"
                    >
                      <RemoveCircleOutline fontSize="small" />
                    </button>
                  </div>
                  <button
                    className="tpsc-add-to-cart"
                    onClick={() =>
                      handleShowQuantitySelector(item.id)
                    }
                    aria-label="نمایش انتخابگر تعداد"
                  >
                    <AddShoppingCart fontSize="small" />
                  </button>
                  {showQuantitySelector === item.id && (
                    <div
                      className="tpsc-quantity-selector relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() =>
                          handleQuantityChange(item.id, 1)
                        }
                        aria-label="افزایش تعداد"
                      >
                        <AddCircleOutline fontSize="small" />
                      </button>
                      <input
                        type="text"
                        className="tpsc-quantity-input"
                        value={cartQuantities[item.id] || 0}
                        readOnly
                        aria-label="تعداد محصول"
                      />
                      <button
                        onClick={() =>
                          handleQuantityChange(item.id, -1)
                        }
                        aria-label="کاهش تعداد"
                      >
                        <RemoveCircleOutline fontSize="small" />
                      </button>
                      {cartQuantities[item.id] > 0 && (
                        <button
                          className="tpsc-confirm-button absolute w-[40px] text-[10px] -top-[25px] left-0 bg-black px-1 rounded-tr-lg text-white h-[30px]"
                          onClick={() => {
                            handleAddToCart(item.id);
                            handleShowQuantitySelector(item.id);
                          }}
                          aria-label="ثبت تعداد محصول"
                        >
                          ثبت
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))
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