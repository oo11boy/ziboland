"use client";
import { useRef, useState, useEffect } from "react";
import { Swiper as SwiperCore } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import Link from "next/link";
import "./../Sliders.css";
import "./ProductSlider.css";
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  AddCircleOutline,
  RemoveCircleOutline,
  AddShoppingCart,
} from "@mui/icons-material";
import { Product, Variant } from "@/types/types";
import { useCart } from "@/ContextApi/CartContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatPrice } from "@/Components/Utils/formatPrice";

export default function ProductSliderContainer({
  vip = false,
}: {
  vip?: boolean;
}) {
  const swiperRef = useRef<SwiperCore | null>(null);
  const { dispatch } = useCart();

  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const [cartQuantities, setCartQuantities] = useState<{ [key: number]: number }>({});
  const [showQuantitySelector, setShowQuantitySelector] = useState<number | null>(null);
  const [priceTypes, setPriceTypes] = useState<{ [key: number]: "single" | "wholesale" }>({});
  const [selectedVariants, setSelectedVariants] = useState<{ [key: number]: Variant | null }>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  const updateNavigationState = (swiper: SwiperCore) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("خطا در دریافت محصولات");
        const data: Product[] = await response.json();
        setProducts(data);
      } catch (err) {
        setError("خطا در بارگذاری محصولات. لطفاً دوباره تلاش کنید.");
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      const initialPriceTypes = products.reduce<{ [key: number]: "single" | "wholesale" }>(
        (acc, product) => ({
          ...acc,
          [product.id]: "single",
        }),
        {}
      );
      setPriceTypes(initialPriceTypes);

      const initialSelectedVariants = products.reduce(
        (acc, product) => ({
          ...acc,
          [product.id]: product.variants && product.variants.length > 0 ? product.variants[0] : null,
        }),
        {} as { [key: number]: Variant | null }
      );
      setSelectedVariants(initialSelectedVariants);

      if (swiperRef.current) {
        setTimeout(() => {
          swiperRef.current?.update();
          updateNavigationState(swiperRef.current!);
        }, 300);
      }
    }
  }, [products]);

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleShowQuantitySelector = (productId: number) => {
    setShowQuantitySelector(showQuantitySelector === productId ? null : productId);
  };

  const handleQuantityChange = (productId: number, delta: number) => {
    setCartQuantities((prev) => {
      const currentQty = prev[productId] || 0;
      const newQty = currentQty + delta;

      const product = products.find((p) => p.id === productId);
      const activeVariant = selectedVariants[productId];

      if (!product) return prev;

      // موجودی رنگ انتخاب‌شده
      const stockQuantity = activeVariant?.stock_quantity ?? 0;

      // اگر ناموجود باشه یا تعداد بیشتر از موجودی بشه → جلوگیری
      if (stockQuantity <= 0 || newQty > stockQuantity) {
        toast.warning(`حداکثر موجودی: ${stockQuantity} عدد`);
        return prev;
      }

      // تغییر خودکار نوع قیمت (تکی/عمده)
      const wholesalePriceNum = activeVariant
        ? activeVariant.price_wholesale
        : parseInt(String(product.discountwholesalePrice || "0").replace(/[^\d]/g, ""), 10) || 0;

      const minWholesale = activeVariant?.min_wholesale || product.minwholesale || 1;

      if (wholesalePriceNum > 0 && newQty >= minWholesale) {
        setPriceTypes((prev) => ({ ...prev, [productId]: "wholesale" }));
      } else if (newQty < minWholesale) {
        setPriceTypes((prev) => ({ ...prev, [productId]: "single" }));
      }

      return { ...prev, [productId]: newQty < 1 ? 1 : newQty };
    });
  };

  const handlePriceTypeChange = (productId: number, type: "single" | "wholesale") => {
    const product = products.find((p) => p.id === productId);
    const activeVariant = selectedVariants[productId];

    const wholesalePriceNum = activeVariant
      ? activeVariant.price_wholesale
      : parseInt(String(product?.discountwholesalePrice || "0").replace(/[^\d]/g, ""), 10) || 0;

    if (type === "wholesale" && wholesalePriceNum === 0) return;

    setPriceTypes((prev) => ({ ...prev, [productId]: type }));
  };

  const handleVariantSelect = (productId: number, variant: Variant) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variant }));
    setCartQuantities((prev) => ({ ...prev, [productId]: 0 }));
    setShowQuantitySelector(null);
  };

  const handleAddToCart = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    const quantity = cartQuantities[productId];
    const activeVariant = selectedVariants[productId];

    if (!product || !quantity || quantity < 1) {
      toast.error("لطفاً تعداد محصول را انتخاب کنید");
      return;
    }

    // چک نهایی موجودی قبل از افزودن
    const stockQuantity = activeVariant?.stock_quantity ?? 0;
    if (quantity > stockQuantity) {
      toast.error("موجودی کافی نیست!");
      return;
    }

    const priceType = priceTypes[productId] || "single";

    const unitPrice = priceType === "single"
      ? (activeVariant?.price_single || parseInt(String(product.discountedPrice).replace(/[^\d]/g, ""), 10) || 0)
      : (activeVariant?.price_wholesale || parseInt(String(product.discountwholesalePrice).replace(/[^\d]/g, ""), 10) || 0);

    const discount = priceType === "single"
      ? (activeVariant?.discount_percent?.toString() || product.discount || "0")
      : (activeVariant?.discount_wholesale_percent?.toString() || product.discountwholesale || "0");

    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: productId,
        title: product.title,
        quantity,
        priceType,
        price: unitPrice.toString(),
        image: activeVariant?.image_main || product.image || "/placeholder.jpg",
        discount,
        color: activeVariant
          ? {
              englishName: activeVariant.color_englishName,
              persianName: activeVariant.color_persianName || "",
              hexCode: activeVariant.color_hexCode,
            }
          : null,
      },
    });

    toast.success("محصول به سبد خرید اضافه شد!");
    setCartQuantities((prev) => ({ ...prev, [productId]: 0 }));
    setShowQuantitySelector(null);
  };

  if (error) {
    return <div className="text-red-500 text-center py-10 text-xl">{error}</div>;
  }

  return (
    <div className={`psc-container ${vip ? "psc-vip" : ""}`}>
      <ToastContainer position="top-center" autoClose={3000} theme="colored" rtl={true} />

      <div className={`psc-header ${vip ? "psc-header-vip" : ""}`}>
        {!vip && <p className="psc-title">پرفروش‌ترین‌ها</p>}
        <Link href="/search" className={`psc-view-all ${vip ? "psc-view-all-vip" : ""}`}>
          مشاهده همه
        </Link>
      </div>

      <div className="psc-content relative">
        {vip && !isSmallScreen && (
          <div className="psc-vip-banner">
            <div className="psc-vip-banner-content">
              <h2 className="psc-vip-banner-title">% تخفیف ویژه %</h2>
            </div>
          </div>
        )}

        <div className="psc-swiper-container">
          <Swiper
            key={products.length}
            dir="rtl"
            modules={[Navigation]}
            slidesPerView="auto"
            spaceBetween={12}
            breakpoints={{
              0: { slidesPerView: 2, spaceBetween: 8 },
              640: { slidesPerView: 3, spaceBetween: 10 },
              1024: { slidesPerView: 4, spaceBetween: 12 },
              1280: { slidesPerView: 5, spaceBetween: 12 },
            }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              setTimeout(() => updateNavigationState(swiper), 100);
            }}
            onSlideChange={(swiper) => updateNavigationState(swiper)}
            className="psc-swiper"
          >
            {vip && isSmallScreen && (
              <SwiperSlide className="psc-vip-slide">
                <div className="psc-vip-banner-mobile">
                  <h2 className="psc-vip-banner-title-mobile">% تخفیف ویژه %</h2>
                </div>
              </SwiperSlide>
            )}

            {products.map((item) => {
              const activeVariant = selectedVariants[item.id];
              const effectivePriceType = priceTypes[item.id] || "single";

              // موجودی رنگ انتخاب‌شده
              const stockQuantity = activeVariant?.stock_quantity ?? 0;
              const isInStock = stockQuantity > 0;

              const finalPriceNum = effectivePriceType === "single"
                ? (activeVariant?.price_single || parseInt(String(item.discountedPrice).replace(/[^\d]/g, ""), 10) || 0)
                : (activeVariant?.price_wholesale || parseInt(String(item.discountwholesalePrice).replace(/[^\d]/g, ""), 10) || 0);

              const originalPriceNum = effectivePriceType === "single"
                ? parseInt(String(item.originalPrice).replace(/[^\d]/g, ""), 10) || 0
                : parseInt(String(item.wholesalePrice || "0").replace(/[^\d]/g, ""), 10) || 0;

              const discountBadge = effectivePriceType === "single"
                ? (activeVariant?.discount_percent?.toString() || item.discount || "0")
                : (activeVariant?.discount_wholesale_percent?.toString() || item.discountwholesale || "0");

              const minWholesale = activeVariant?.min_wholesale || item.minwholesale || 1;

              const hasWholesalePrice = parseInt(String(item.discountwholesalePrice || "0").replace(/[^\d]/g, ""), 10) > 0;

              return (
                <SwiperSlide key={item.id} className="psc-product-slide py-2">
                  <div className={`flex flex-col h-[340px] md:h-[430px] bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-2.5 md:p-4 relative overflow-hidden group/card ${!isInStock ? "opacity-70" : ""}`}>
                    {/* برچسب عمده */}
                    {effectivePriceType === "wholesale" && hasWholesalePrice && (
                      <div className="absolute top-[2px] left-[2px] bg-[#c7c7c7] py-1 px-2 rounded-sm text-[11px] flex items-center z-10">
                        <p className="ml-1">+</p>
                        <p>{minWholesale} عدد</p>
                      </div>
                    )}

                    {/* تصویر + بج تخفیف + پوشش ناموجود */}
                    <div className="relative w-full aspect-square bg-gray-50 rounded-[1.5rem] overflow-hidden mb-3">
                      <img
                        src={activeVariant?.image_main || item.image || "/placeholder.jpg"}
                        className="w-full h-full object-contain p-2 group-hover/card:scale-105 transition-transform duration-500"
                        alt={item.title}
                      />
                      {discountBadge !== "0" && (
                        <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] md:text-xs font-black px-2 py-0.5 rounded-lg shadow-sm z-10">
                          {discountBadge}%
                        </span>
                      )}
                      {!isInStock && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20">
                          <span className="text-white font-bold text-lg">ناموجود</span>
                        </div>
                      )}
                    </div>

                    {/* عنوان و سوئیچ قیمت */}
                    <div className="flex flex-col flex-grow overflow-hidden">
                      <h3 className="text-gray-800 text-[11px] md:text-sm font-bold mb-2 line-clamp-2 h-14 leading-4 md:leading-5 tracking-tight">
                        <Link href={`/products/${item.id}`}>{item.title}</Link>
                      </h3>

                      <div className="flex bg-gray-100 p-0.5 rounded-xl mb-3">
                        <button
                          onClick={() => handlePriceTypeChange(item.id, "single")}
                          className={`flex-1 py-1 text-[9px] md:text-[10px] font-bold rounded-lg transition-all ${effectivePriceType === "single" ? "bg-white text-[#805B99] shadow-sm" : "text-gray-400"}`}
                        >
                          تکی
                        </button>
                        {hasWholesalePrice && (
                          <button
                            onClick={() => handlePriceTypeChange(item.id, "wholesale")}
                            className={`flex-1 py-1 text-[9px] md:text-[10px] font-bold rounded-lg transition-all ${effectivePriceType === "wholesale" ? "bg-white text-[#805B99] shadow-sm" : "text-gray-400"}`}
                          >
                            عمده
                          </button>
                        )}
                      </div>

                      {/* انتخاب رنگ */}
                      {item.variants && item.variants.length > 0 && (
                        <div className="flex gap-1.5 justify-center mb-2 h-4 items-center">
                          {item.variants.map((variant) => {
                            const variantInStock = (variant.stock_quantity ?? 0) > 0;
                            return (
                              <button
                                key={variant.id || variant.color_englishName}
                                onClick={() => variantInStock && handleVariantSelect(item.id, variant)}
                                disabled={!variantInStock}
                                className={`w-3 h-3 md:w-4 md:h-4 rounded-full border border-gray-200 transition-transform relative ${selectedVariants[item.id]?.id === variant.id ? "scale-125 ring-2 ring-[#805B99]" : ""} ${!variantInStock ? "opacity-50 cursor-not-allowed" : ""}`}
                                style={{ backgroundColor: variant.color_hexCode }}
                              >
                                {!variantInStock && (
                                  <span className="absolute inset-0 bg-red-500" style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)", transform: "rotate(45deg) scale(1.4)" }} />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* نمایش موجودی رنگ انتخاب‌شده */}
                      {activeVariant && (
                        <div className="text-center text-[9px] text-gray-600 mb-1">
                          موجودی: {stockQuantity > 0 ? `${stockQuantity} عدد` : "ناموجود"}
                        </div>
                      )}
                    </div>

                    {/* قیمت و دکمه */}
                    <div className="mt-auto pt-2 border-t border-gray-50">
                      <div className="flex flex-col mb-3">
                        {discountBadge !== "0" && (
                          <span className="text-[10px] md:text-xs text-gray-400 line-through italic font-medium">
                            {formatPrice(originalPriceNum)}
                          </span>
                        )}
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm md:text-xl font-black text-gray-900 leading-none">
                            {formatPrice(finalPriceNum)}
                          </span>
                          <span className="text-[9px] md:text-[11px] font-medium text-gray-500">تومان</span>
                        </div>
                      </div>

                      <div className="h-9 md:h-12">
                        {showQuantitySelector !== item.id ? (
                          <button
                            onClick={() => isInStock && handleShowQuantitySelector(item.id)}
                            disabled={!isInStock}
                            className={`w-full h-full rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${isInStock ? "bg-[#805B99] hover:bg-[#6b4e82] text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                          >
                            <AddShoppingCart sx={{ fontSize: { xs: 16, md: 22 } }} />
                            <span className="text-[11px] md:text-sm font-extrabold">
                              {isInStock ? "افزودن" : "ناموجود"}
                            </span>
                          </button>
                        ) : (
                          <div className="flex items-center justify-between bg-blue-50 rounded-2xl h-full p-1 border border-blue-100 shadow-inner">
                            <button
                              onClick={() => handleQuantityChange(item.id, 1)}
                              disabled={(cartQuantities[item.id] || 0) >= stockQuantity}
                              className="w-7 h-7 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-xl text-[#805B99] shadow-sm hover:bg-[#805B99] hover:text-white disabled:opacity-50"
                            >
                              <AddCircleOutline sx={{ fontSize: { xs: 18, md: 20 } }} />
                            </button>

                            <div className="flex flex-col items-center">
                              <span className="text-xs md:text-sm font-black text-blue-900">
                                {cartQuantities[item.id] || 0}
                              </span>
                              {cartQuantities[item.id] > 0 && (
                                <button
                                  onClick={() => handleAddToCart(item.id)}
                                  className="text-[8px] md:text-[10px] font-black text-green-600 uppercase mt-0.5"
                                >
                                  تایید
                                </button>
                              )}
                            </div>

                            <button
                              onClick={() => handleQuantityChange(item.id, -1)}
                              disabled={(cartQuantities[item.id] || 0) <= 1}
                              className="w-7 h-7 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-xl text-red-500 shadow-sm hover:bg-red-500 hover:text-white disabled:opacity-50"
                            >
                              <RemoveCircleOutline sx={{ fontSize: { xs: 18, md: 20 } }} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>

        {/* دکمه‌های ناوبری */}
        <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2">
          {!isBeginning && (
            <button
              onClick={() => swiperRef.current?.slidePrev()}
              className="pointer-events-auto w-10 h-10 md:w-12 md:h-12 bg-white/90 shadow-xl rounded-full flex items-center justify-center border border-gray-100 hover:bg-[#805B99] hover:text-white transition-all text-gray-700 z-20"
            >
              <KeyboardArrowRight className="text-2xl md:text-4xl" />
            </button>
          )}

          {!isEnd && (
            <button
              onClick={() => swiperRef.current?.slideNext()}
              className="pointer-events-auto w-10 h-10 md:w-12 md:h-12 bg-white/90 shadow-xl rounded-full flex items-center justify-center border border-gray-100 hover:bg-[#805B99] hover:text-white transition-all text-gray-700 z-20"
            >
              <KeyboardArrowLeft className="text-2xl md:text-4xl" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}