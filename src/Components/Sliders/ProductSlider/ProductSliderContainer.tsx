"use client";
import { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Swiper as SwiperCore } from "swiper";
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
import { Product, Color } from "@/types/types";
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
  const [selectedColors, setSelectedColors] = useState<{ [key: number]: Color | null }>({});
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
    [product.id]: "single" // TypeScript now knows "single" is the specific literal allowed
  }),
  {}
);
setPriceTypes(initialPriceTypes);

      const initialSelectedColors = products.reduce(
        (acc, product) => ({
          ...acc,
          [product.id]: product.colors && product.colors.length > 0 ? product.colors[0] : null,
        }),
        {} as { [key: number]: Color | null }
      );
      setSelectedColors(initialSelectedColors);
      
      // بروزرسانی وضعیت دکمه‌ها بلافاصله بعد از لود محصولات
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
      const newQuantity = (prev[productId] || 0) + delta;
      const product = products.find((p) => p.id === productId);
      if (!product) return prev;

      if (product.discountwholesalePrice > 0 && newQuantity >= product.minwholesale) {
        setPriceTypes((prev) => ({ ...prev, [productId]: "wholesale" }));
      } else {
        setPriceTypes((prev) => ({ ...prev, [productId]: "single" }));
      }
      return { ...prev, [productId]: newQuantity < 0 ? 0 : newQuantity };
    });
  };

  const handlePriceTypeChange = (productId: number, type: "single" | "wholesale") => {
    const product = products.find((p) => p.id === productId);
    if (type === "wholesale" && product?.discountwholesalePrice === 0) return;
    setPriceTypes((prev) => ({ ...prev, [productId]: type }));
  };

  const handleColorSelect = (productId: number, color: Color) => {
    setSelectedColors((prev) => ({ ...prev, [productId]: color }));
  };

  const handleAddToCart = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product || !cartQuantities[productId] || cartQuantities[productId] < 1) {
      toast.error("لطفاً تعداد محصول را انتخاب کنید");
      return;
    }
    const quantity = cartQuantities[productId];
    const priceType = product.discountwholesalePrice > 0 ? priceTypes[productId] : "single";
    const price = priceType === "single" ? product.discountedPrice : product.discountwholesalePrice;
    const discount = priceType === "single" ? product.discount : product.discountwholesale;
    const selectedColor = selectedColors[productId];

    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: productId,
        title: product.title,
        quantity,
        priceType,
        price: price.toString(),
        image: product.image || "/placeholder.jpg",
        discount,
        color: selectedColor,
      },
    });

    toast.success("محصول به سبد خرید اضافه شد!");
    setCartQuantities((prev) => ({ ...prev, [productId]: 0 }));
    setShowQuantitySelector(null);
  };

  if (error) return <div className="text-red-500 text-center py-10">{error}</div>;

  return (
    <div className={`psc-container ${vip ? "psc-vip" : ""}`}>
      <ToastContainer position="top-center" autoClose={3000} theme="colored" rtl={true} />

      <div className={`psc-header ${vip ? "psc-header-vip" : ""}`}>
        {!vip && <p className="psc-title">پرفروش‌ترین‌ها</p>}
        <Link href="../search" className={`psc-view-all ${vip ? "psc-view-all-vip" : ""}`}>
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
            key={products.length} // ترفند برای رندر مجدد وقتی داده‌ها می‌رسند
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
              const effectivePriceType = item.discountwholesalePrice > 0 ? priceTypes[item.id] || "single" : "single";
              const finalPrice = effectivePriceType === "single" ? item.discountedPrice : item.discountwholesalePrice;
              const originalPrice = effectivePriceType === "single" ? item.originalPrice : item.wholesalePrice;
              const discountBadge = effectivePriceType === "single" ? item.discount : item.discountwholesale;

              return (
                <SwiperSlide key={item.id} className="psc-product-slide py-2">
                  <div className="flex flex-col h-[340px] md:h-[430px] bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-2.5 md:p-4 relative overflow-hidden group/card">
                    {effectivePriceType === "wholesale" && (
                      <div className="absolute top-[2px] left-[2px] bg-[#c7c7c7] py-1 px-2 rounded-sm text-[11px] flex items-center z-10">
                        <p className="ml-1">+</p>
                        <p>{item.minwholesale} عدد</p>
                      </div>
                    )}
                    <div className="relative w-full aspect-square bg-gray-50 rounded-[1.5rem] overflow-hidden mb-3">
                      <img src={item.image || "/placeholder.jpg"} className="w-full h-full object-contain p-2 group-hover/card:scale-105 transition-transform duration-500" alt={item.title} />
                      {discountBadge !== "0" && (
                        <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] md:text-xs font-black px-2 py-0.5 rounded-lg shadow-sm z-10">{discountBadge}%</span>
                      )}
                    </div>
                    <div className="flex flex-col flex-grow overflow-hidden">
                      <h3 className="text-gray-800 text-[11px] md:text-sm font-bold mb-2 line-clamp-2 h-14 leading-4 md:leading-5 tracking-tight">
                        <Link href={`../products/${item.id}`}>{item.title}</Link>
                      </h3>
                      <div className="flex bg-gray-100 p-0.5 rounded-xl mb-3">
                        <button onClick={() => handlePriceTypeChange(item.id, "single")} className={`flex-1 py-1 text-[9px] md:text-[10px] font-bold rounded-lg transition-all ${effectivePriceType === 'single' ? 'bg-white text-[#805B99] shadow-sm' : 'text-gray-400'}`}>تکی</button>
                        {item.discountwholesalePrice > 0 && (
                          <button onClick={() => handlePriceTypeChange(item.id, "wholesale")} className={`flex-1 py-1 text-[9px] md:text-[10px] font-bold rounded-lg transition-all ${effectivePriceType === 'wholesale' ? 'bg-white text-[#805B99] shadow-sm' : 'text-gray-400'}`}>عمده</button>
                        )}
                      </div>
                      <div className="flex gap-1.5 justify-center mb-2 h-4 items-center">
                        {item.colors?.map((color) => (
                          <button key={color.hexCode} onClick={() => handleColorSelect(item.id, color)} className={`w-3 h-3 md:w-4 md:h-4 rounded-full border border-gray-200 transition-transform ${selectedColors[item.id]?.hexCode === color.hexCode ? 'scale-125 ring-2 ring-blue-400' : ''}`} style={{ backgroundColor: color.hexCode }} />
                        ))}
                      </div>
                    </div>
                    <div className="mt-auto pt-2 border-t border-gray-50">
                      <div className="flex flex-col mb-3">
                        <span className="text-[10px] md:text-xs text-gray-400 line-through h-4 leading-none italic font-medium">{discountBadge !== "0" ? formatPrice(originalPrice) : ""}</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-sm md:text-xl font-black text-gray-900 leading-none">{formatPrice(finalPrice)}</span>
                          <span className="text-[9px] md:text-[11px] font-medium text-gray-500">تومان</span>
                        </div>
                      </div>
                      <div className="h-9 md:h-12">
                        {showQuantitySelector !== item.id ? (
                          <button onClick={() => handleShowQuantitySelector(item.id)} className="w-full h-full bg-[#805B99] hover:bg-[#805B80] text-white rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-gray-200">
                            <AddShoppingCart sx={{ fontSize: { xs: 16, md: 22 } }} />
                            <span className="text-[11px] md:text-sm font-extrabold text-white">افزودن</span>
                          </button>
                        ) : (
                          <div className="flex items-center justify-between bg-blue-50 rounded-2xl h-full p-1 border border-blue-100 shadow-inner">
                            <button onClick={() => handleQuantityChange(item.id, 1)} className="w-7 h-7 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-xl text-[#805B99] shadow-sm"><AddCircleOutline sx={{ fontSize: { xs: 18, md: 20 } }} /></button>
                            <div className="flex flex-col items-center">
                              <span className="text-xs md:text-sm font-black text-blue-900 leading-none">{cartQuantities[item.id] || 0}</span>
                              {cartQuantities[item.id] > 0 && (
                                <button onClick={() => handleAddToCart(item.id)} className="text-[8px] md:text-[10px] font-black text-green-600 uppercase">تایید</button>
                              )}
                            </div>
                            <button onClick={() => handleQuantityChange(item.id, -1)} className="w-7 h-7 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-xl text-red-500 shadow-sm"><RemoveCircleOutline sx={{ fontSize: { xs: 18, md: 20 } }} /></button>
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

  {/* دکمه‌های ناوبری - نمایش در همه نمایشگرها */}
<div className="pointer-events-none">
  {/* دکمه راست (قبلی) */}
  {!isBeginning && (
    <button
      onClick={() => swiperRef.current?.slidePrev()}
      className="absolute top-1/2 right-0 lg:-right-6 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/90 shadow-xl rounded-full flex items-center justify-center border border-gray-100 hover:bg-[#805B99] hover:text-white transition-all text-gray-700 pointer-events-auto"
      style={{ right: vip && !isSmallScreen ? "12px" : "" }}
    >
      <KeyboardArrowRight fontSize="medium" className="md:text-[2.1rem]" />
    </button>
  )}

  {/* دکمه چپ (بعدی) */}
  {(products.length > 2 || !isEnd) && (
    <button
      onClick={() => swiperRef.current?.slideNext()}
      className="absolute top-1/2 left-0 lg:-left-6 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/90 shadow-xl rounded-full flex items-center justify-center border border-gray-100 hover:bg-[#805B99] hover:text-white transition-all text-gray-700 pointer-events-auto"
    >
      <KeyboardArrowLeft fontSize="medium" className="md:text-[2.1rem]" />
    </button>
  )}
</div>
      </div>
    </div>
  );
}