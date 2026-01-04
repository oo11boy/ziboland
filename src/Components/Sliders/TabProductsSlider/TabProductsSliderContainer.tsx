"use client";
import { useState, useRef, useEffect } from "react";
import { Swiper as SwiperCore } from "swiper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import {
  AddCircleOutline,
  AddShoppingCart,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  RemoveCircleOutline,
  VisibilitySharp,
} from "@mui/icons-material";
import Link from "next/link";
import { Product, Variant } from "@/types/types";
import { useCart } from "@/ContextApi/CartContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatPrice } from "@/Components/Utils/formatPrice";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: { xs: 1, md: 3 } }}>{children}</Box>}
    </div>
  );
}

type SortType = "popular" | "cheapest" | "newest" | "none";

interface TabProductsSliderContainerProps {
  title: string;
  sort?: SortType;
}

export default function TabProductsSliderContainer({
  title,
  sort = "none",
}: TabProductsSliderContainerProps) {
  const [value, setValue] = useState(0);
  const { dispatch } = useCart();

  const [cartQuantities, setCartQuantities] = useState<{ [key: number]: number }>({});
  const [priceTypes, setPriceTypes] = useState<{ [key: number]: "single" | "wholesale" }>({});
  const [selectedVariants, setSelectedVariants] = useState<{ [key: number]: Variant | null }>({});
  const [showQuantitySelector, setShowQuantitySelector] = useState<number | null>(null);

  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const swiperRefs = useRef<{ [key: number]: SwiperCore | null }>({});
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
        let sorted = [...data];
        if (sort === "popular") sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        else if (sort === "cheapest") sorted.sort((a, b) => (a.numericPrice || 0) - (b.numericPrice || 0));
        else if (sort === "newest") sorted.sort((a, b) => b.id - a.id);
        setProducts(sorted);
      } catch (err) {
        setError("خطا در بارگذاری محصولات. لطفاً دوباره تلاش کنید.");
        console.error(err);
      }
    };
    fetchProducts();
  }, [sort]);

useEffect(() => {
  if (products.length > 0) {
    // نوع دقیق را با initialValue صریح مشخص می‌کنیم
    const initialPriceTypes: { [key: number]: "single" | "wholesale" } = {};
    products.forEach((p) => {
      initialPriceTypes[p.id] = "single";
    });
    setPriceTypes(initialPriceTypes);

    const initialVariants: { [key: number]: Variant | null } = {};
    products.forEach((p) => {
      initialVariants[p.id] =
        p.variants && p.variants.length > 0 ? p.variants[0] : null;
    });
    setSelectedVariants(initialVariants);
  }
}, [products]);

  // بروزرسانی ناوبری هنگام تغییر تب
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentSwiper = swiperRefs.current[value];
      if (currentSwiper) {
        currentSwiper.update();
        updateNavigationState(currentSwiper);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [value, products]);

  const handleQuantityChange = (productId: number, delta: number) => {
    setCartQuantities((prev) => {
      const currentQty = prev[productId] || 0;
      const newQty = currentQty + delta;

      const product = products.find((p) => p.id === productId);
      const activeVariant = selectedVariants[productId];

      if (!product) return prev;

      // موجودی رنگ انتخاب‌شده
      const stockQuantity = activeVariant?.stock_quantity ?? 0;

      // جلوگیری از اضافه کردن بیشتر از موجودی
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

    // چک نهایی موجودی
    const stockQuantity = activeVariant?.stock_quantity ?? 0;
    if (quantity > stockQuantity) {
      toast.error("موجودی کافی نیست!");
      return;
    }

    const type = priceTypes[productId] || "single";

    const unitPrice = type === "single"
      ? (activeVariant?.price_single || parseInt(String(product.discountedPrice).replace(/[^\d]/g, ""), 10) || 0)
      : (activeVariant?.price_wholesale || parseInt(String(product.discountwholesalePrice).replace(/[^\d]/g, ""), 10) || 0);

    const discount = type === "single"
      ? (activeVariant?.discount_percent?.toString() || product.discount || "0")
      : (activeVariant?.discount_wholesale_percent?.toString() || product.discountwholesale || "0");

    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: productId,
        title: product.title,
        quantity,
        priceType: type,
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

    toast.success("به سبد خرید اضافه شد");
    setCartQuantities((prev) => ({ ...prev, [productId]: 0 }));
    setShowQuantitySelector(null);
  };

  const categoryCounts = products.reduce((acc, p) => {
    const cat = p.category || "سایر";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedCategories = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a]);
  const productsByCategory = sortedCategories.map(cat => products.filter(p => (p.category || "سایر") === cat));

  if (error) {
    return <div className="text-red-500 text-center py-10 text-xl">{error}</div>;
  }

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 py-6 font-[yekannew]" dir="rtl">
      <ToastContainer rtl theme="colored" position="top-center" autoClose={2500} />

      <div className="flex justify-between items-center mb-6 px-1">
        <div className="border-r-4 border-[#805B99] pr-3">
          <h2 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight">{title}</h2>
        </div>
        <Link href="/search" className="flex items-center gap-1 text-[#805B99] bg-blue-50 px-4 py-2 rounded-2xl text-xs md:text-sm font-bold hover:bg-blue-100 transition-colors">
          <VisibilitySharp fontSize="inherit" /> مشاهده همه
        </Link>
      </div>

      {sortedCategories.length > 0 && (
        <Tabs
          value={value}
          onChange={(_, v) => setValue(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mb: 2,
            "& .MuiTabs-indicator": { height: 3, borderRadius: "10px", backgroundColor: "#805B99" },
            "& .MuiTab-root": { fontFamily: "inherit", fontWeight: 800, fontSize: { xs: "0.8rem", md: "0.95rem" }, minWidth: "100px" },
            "& .Mui-selected": { color: "#805B99 !important" },
          }}
        >
          {sortedCategories.map((cat) => (
            <Tab key={cat} label={cat} />
          ))}
        </Tabs>
      )}

      <div className="relative group">
        {sortedCategories.map((cat, index) => (
          <CustomTabPanel key={cat} value={value} index={index}>
            <Swiper
              dir="rtl"
              key={`${cat}-${productsByCategory[index]?.length}`}
              modules={[Navigation]}
              spaceBetween={12}
              slidesPerView={2.2}
              breakpoints={{
                640: { slidesPerView: 3, spaceBetween: 15 },
                1024: { slidesPerView: 5, spaceBetween: 20 },
                1280: { slidesPerView: 6, spaceBetween: 20 },
              }}
              onSwiper={(swiper) => {
                swiperRefs.current[index] = swiper;
                if (index === value) setTimeout(() => updateNavigationState(swiper), 200);
              }}
              onSlideChange={(swiper) => index === value && updateNavigationState(swiper)}
            >
              {productsByCategory[index]?.map((item) => {
                const activeVariant = selectedVariants[item.id];
                const effectivePriceType = priceTypes[item.id] || "single";

                // موجودی رنگ انتخاب‌شده
                const stockQuantity = activeVariant?.stock_quantity ?? 0;
                const isInStock = stockQuantity > 0;

                const finalPriceNum = effectivePriceType === "single"
                  ? (activeVariant?.price_single || parseInt(String(item.discountedPrice).replace(/[^\d]/g, ""), 10) || 0)
                  : (activeVariant?.price_wholesale || parseInt(String(item.discountwholesalePrice).replace(/[^\d]/g, ""), 10) || 0);

                const originalPriceNum = parseInt(String(item.originalPrice).replace(/[^\d]/g, ""), 10) || 0;

                const currentDiscount = effectivePriceType === "single"
                  ? (activeVariant?.discount_percent?.toString() || item.discount || "0")
                  : (activeVariant?.discount_wholesale_percent?.toString() || item.discountwholesale || "0");

                const minWholesale = activeVariant?.min_wholesale || item.minwholesale || 1;

                const hasWholesalePrice = parseInt(String(item.discountwholesalePrice || "0").replace(/[^\d]/g, ""), 10) > 0;

                return (
                  <SwiperSlide key={item.id} className="py-2">
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
                        {currentDiscount !== "0" && (
                          <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] md:text-xs font-black px-2 py-0.5 rounded-lg shadow-sm z-10">
                            {currentDiscount}%
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
                        <h3 className="text-gray-800 text-[11px] md:text-sm font-bold mb-2 line-clamp-2 h-12 md:h-12 leading-4 md:leading-5 tracking-tight">
                          <Link href={`/products/${item.id}`}>{item.title}</Link>
                        </h3>

                        <div className="flex bg-gray-100 p-0.5 rounded-xl mb-3">
                          <button
                            onClick={() => setPriceTypes((p) => ({ ...p, [item.id]: "single" }))}
                            className={`flex-1 py-1 text-[9px] md:text-[10px] font-bold rounded-lg transition-all ${effectivePriceType === "single" ? "bg-white text-[#805B99] shadow-sm" : "text-gray-400"}`}
                          >
                            تکی
                          </button>
                          {hasWholesalePrice && (
                            <button
                              onClick={() => setPriceTypes((p) => ({ ...p, [item.id]: "wholesale" }))}
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
                          {currentDiscount !== "0" && (
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
                              onClick={() => isInStock && setShowQuantitySelector(item.id)}
                              disabled={!isInStock}
                              className={`w-full h-full rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg ${isInStock ? "bg-[#805B99] hover:bg-[#6b4e82] text-white" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
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
          </CustomTabPanel>
        ))}

        {/* دکمه‌های ناوبری */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-between z-20">
          <div className="relative w-full h-0">
            {!isBeginning && (
              <button
                onClick={() => swiperRefs.current[value]?.slidePrev()}
                className="absolute right-0 lg:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/95 shadow-2xl rounded-full flex items-center justify-center border border-gray-100 hover:bg-[#805B99] hover:text-white transition-all text-gray-700 pointer-events-auto z-30"
              >
                <KeyboardArrowRight className="text-2xl md:text-4xl" />
              </button>
            )}

            {!isEnd && (
              <button
                onClick={() => swiperRefs.current[value]?.slideNext()}
                className="absolute left-0 lg:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/95 shadow-2xl rounded-full flex items-center justify-center border border-gray-100 hover:bg-[#805B99] hover:text-white transition-all text-gray-700 pointer-events-auto z-30"
              >
                <KeyboardArrowLeft className="text-2xl md:text-4xl" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}