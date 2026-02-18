"use client";
import { useRef, useState, useEffect } from "react";
import { Swiper as SwiperCore } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";

import Link from "next/link";
import "./../Sliders.css";
import "../ProductSlider/ProductSlider.css";
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  AddCircleOutline,
  RemoveCircleOutline,
  AddShoppingCart,
  NotificationAdd,
} from "@mui/icons-material";
import { Product, Variant } from "@/types/types";
import { useCart } from "@/ContextApi/CartContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatPrice } from "@/Components/Utils/formatPrice";

interface RelatedSliderProps {
  mothercatId?: number;
  excludeId?: number;
  title?: string;
}

export default function RelatedProductSlider({
  mothercatId,
  excludeId,
  title = "محصولات مشابه",
}: RelatedSliderProps) {
  const swiperRef = useRef<SwiperCore | null>(null);
  const { dispatch, state: { cartItems } } = useCart();

  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const [cartQuantities, setCartQuantities] = useState<{ [key: number]: number }>({});
  const [showQuantitySelector, setShowQuantitySelector] = useState<number | null>(null);
  const [priceTypes, setPriceTypes] = useState<{ [key: number]: "single" | "wholesale" }>({});
  const [selectedVariants, setSelectedVariants] = useState<{ [key: number]: Variant | null }>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const updateNavigationState = (swiper: SwiperCore) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("خطا در دریافت محصولات");
        const data: Product[] = await response.json();

        // فیلترینگ محصولات مرتبط بر اساس دسته بندی مادر و حذف محصول فعلی
        const filtered = data.filter(
          (p) => p.mothercatId === mothercatId && p.id !== excludeId
        );

        setProducts(filtered);
      } catch (err) {
        setError("خطا در بارگذاری محصولات.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (mothercatId) fetchRelatedProducts();
  }, [mothercatId, excludeId]);

  useEffect(() => {
    if (products.length > 0) {
      const initialPriceTypes = products.reduce((acc, product) => ({
        ...acc, [product.id]: "single"
      }), {});
      setPriceTypes(initialPriceTypes);

      const initialSelectedVariants = products.reduce((acc, product) => {
        let selected = null;
        if (product.variants && product.variants.length > 0) {
          const availableVariants = product.variants.filter(v => (v.stock_quantity ?? 0) > 0);
          const baseList = availableVariants.length > 0 ? availableVariants : product.variants;
          selected = baseList.reduce((min, current) => {
            const currentPrice = (current.price_single || 0) * (1 - (current.discount_percent || 0) / 100);
            const minPrice = (min.price_single || 0) * (1 - (min.discount_percent || 0) / 100);
            return currentPrice < minPrice ? current : min;
          }, baseList[0]);
        }
        return { ...acc, [product.id]: selected };
      }, {} as { [key: number]: Variant | null });

      setSelectedVariants(initialSelectedVariants);
    }
  }, [products]);

  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- منطق های سبد خرید (دقیقاً کپی شده از کد شما) ---
  const getCartItem = (productId: number) => {
    const activeVariant = selectedVariants[productId];
    if (!activeVariant) return null;
    return cartItems.find(item => item.id === productId && item.color?.englishName === activeVariant.color_englishName);
  };

  const handleShowQuantitySelector = (productId: number) => {
    const cartItem = getCartItem(productId);
    setCartQuantities(prev => ({ ...prev, [productId]: cartItem ? cartItem.quantity : 1 }));
    setShowQuantitySelector(showQuantitySelector === productId ? null : productId);
  };

  const handleQuantityChange = (productId: number, delta: number) => {
    setCartQuantities(prev => {
      const currentQty = (prev[productId] || 0) + delta;
      const activeVariant = selectedVariants[productId];
      const stock = activeVariant?.stock_quantity ?? 0;
      let newQty = Math.max(0, Math.min(currentQty, stock));
      
      if (currentQty > stock) toast.warning(`حداکثر موجودی: ${stock} عدد`);

      if (activeVariant && activeVariant.price_wholesale > 0) {
        setPriceTypes(prevTypes => ({
          ...prevTypes, [productId]: newQty >= (activeVariant.min_wholesale || 1) ? "wholesale" : "single"
        }));
      }
      return { ...prev, [productId]: newQty };
    });
  };

  const handlePriceTypeChange = (productId: number, type: "single" | "wholesale") => {
    if (type === "wholesale" && (selectedVariants[productId]?.price_wholesale || 0) === 0) return;
    setPriceTypes(prev => ({ ...prev, [productId]: type }));
  };

  const handleVariantSelect = (productId: number, variant: Variant) => {
    setSelectedVariants(prev => ({ ...prev, [productId]: variant }));
    setCartQuantities(prev => ({ ...prev, [productId]: 0 }));
    setShowQuantitySelector(null);
  };
  const handleAddToCart = (productId: number) => {
    const quantity = cartQuantities[productId];
    const activeVariant = selectedVariants[productId];
    const product = products.find((p) => p.id === productId);
    const cartItem = getCartItem(productId);

    if (!product || !activeVariant) {
      toast.error("اطلاعات محصول ناقص است");
      return;
    }

    if (!quantity || quantity <= 0) {
      if (cartItem) {
        dispatch({
          type: "REMOVE_ITEM_BY_TYPE",
          payload: {
            id: productId,
            color: cartItem.color,
          },
        });
        toast.info("محصول از سبد خرید حذف شد");
      }
      setShowQuantitySelector(null);
      setCartQuantities((prev) => ({ ...prev, [productId]: 0 }));
      return;
    }

    const isWholesale =
      quantity >= (activeVariant.min_wholesale || 1) &&
      activeVariant.price_wholesale > 0;

    const unitPrice = isWholesale
      ? activeVariant.price_wholesale
      : Math.round(
          activeVariant.price_single * (1 - (activeVariant.discount_percent || 0) / 100)
        );

    const payload = {
      id: productId,
      title: product.title,
      quantity,
   priceType: isWholesale ? "wholesale" as const : "single" as const,
      price: unitPrice.toString(),
      image: activeVariant.image_main || product.image || "/placeholder.jpg",
      discount: isWholesale ? "0" : `${activeVariant.discount_percent || 0}%`,
      color: {
        englishName: activeVariant.color_englishName,
        persianName: activeVariant.color_persianName || "",
        hexCode: activeVariant.color_hexCode,
      },
      baseRetailPrice: activeVariant.price_single,
      baseWholesalePrice: activeVariant.price_wholesale,
      retailDiscountPercent: activeVariant.discount_percent || 0,
      minWholesale: activeVariant.min_wholesale || 1,
      stock_quantity: activeVariant.stock_quantity ?? 0,
    };

    if (cartItem) {
      dispatch({
        type: "UPDATE_QUANTITY",
        payload: {
          itemKey: `${productId}-${cartItem.color?.englishName || "default"}`,
          newQuantity: quantity,
        },
      });
      toast.success("سبد خرید به‌روزرسانی شد");
    } else {
      dispatch({
        type: "ADD_ITEM",
        payload,
      });
      toast.success("محصول به سبد خرید اضافه شد");
    }

    setShowQuantitySelector(null);
  };
  if (loading || products.length === 0) return null;

  return (
    <div className="psc-container mt-12 border-t pt-8">
      <div className="psc-header mt-4">
        <p className="psc-title">{title}</p>
        <Link href="/search" className="psc-view-all">مشاهده همه</Link>
      </div>
             <ToastContainer
              position="top-center" 
              autoClose={3000} 
              theme="colored" 
              rtl={true}
              pauseOnFocusLoss={false} // برای جلوگیری از باگ‌های احتمالی در موبایل
            />
      <div className="psc-content relative">
        <div className="psc-swiper-container">
          <Swiper
            dir="rtl"
            modules={[Navigation]}
            slidesPerView="auto"
            spaceBetween={16}
            breakpoints={{
              0: { slidesPerView: 2.2, spaceBetween: 12 },
              640: { slidesPerView: 3, spaceBetween: 20 },
              1024: { slidesPerView: 4, spaceBetween: 24 },
              1280: { slidesPerView: 4, spaceBetween: 24 },
            }}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
              setTimeout(() => updateNavigationState(swiper), 100);
            }}
            onSlideChange={(swiper) => updateNavigationState(swiper)}
            className="psc-swiper"
          >
            {products.map((item) => {
              const activeVariant = selectedVariants[item.id];
              const effectivePriceType = priceTypes[item.id] || "single";
              const currentQty = cartQuantities[item.id] || 0;
              const stockQuantity = activeVariant?.stock_quantity ?? 0;
              const isInStock = stockQuantity > 0;
              const baseRetailPrice = activeVariant?.price_single || 0;
              const retailDiscountPercent = activeVariant?.discount_percent || 0;
              const minWholesale = activeVariant?.min_wholesale || 1;
              const hasWholesalePrice = (activeVariant?.price_wholesale || 0) > 0 && minWholesale > 1;

              let unitPriceAfterDiscount = effectivePriceType === "wholesale" && hasWholesalePrice
                ? activeVariant!.price_wholesale
                : Math.round(baseRetailPrice * (1 - retailDiscountPercent / 100));

              let displayDiscount = effectivePriceType === "wholesale" ? 
                Math.round(((baseRetailPrice - activeVariant!.price_wholesale) / baseRetailPrice) * 100) : retailDiscountPercent;

              return (
                <SwiperSlide key={item.id} className="psc-product-slide py-2 ">
                  <div className={`flex flex-col bg-white rounded-[0.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all p-3 md:p-4 relative overflow-hidden group/card ${!isInStock ? "opacity-70" : ""}`}>
                    
                    {/* نشان عمده */}
                    {effectivePriceType === "wholesale" && hasWholesalePrice && (
                      <div className="absolute top-2 left-2 bg-[#c7c7c7] py-1 px-2 rounded-sm text-[11px] z-10">+ {minWholesale} عدد</div>
                    )}

                    <Link href={`/products/${item.id}`} className="block relative w-full aspect-square bg-gray-50 rounded-[1.5rem] overflow-hidden mb-3">
                        <img src={activeVariant?.image_main || item.image || "/placeholder.jpg"} className="w-full h-full object-contain p-2 group-hover/card:scale-105 transition-transform duration-500" alt={item.title} />
                        {displayDiscount > 0 && isInStock && (
                          <span className={`absolute top-2 right-2 ${effectivePriceType === 'wholesale' ? 'bg-green-600' : 'bg-red-500'} text-white text-[10px] md:text-xs font-black px-2 py-0.5 rounded-lg z-10`}>
                            {displayDiscount}% {effectivePriceType === "wholesale" && "سود"}
                          </span>
                        )}
                        {!isInStock && <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20"><span className="text-white text-lg font-bold">ناموجود</span></div>}
                    </Link>

                    {/* عنوان */}
                    <Link href={`/products/${item.id}`}>
                        <h3 className="text-gray-800 text-[11px] md:text-sm font-bold mb-2 line-clamp-2 h-8 md:h-10 text-center leading-4">{item.title}</h3>
                    </Link>

                    {/* سوییچ تکی / عمده */}
                    <div className="flex bg-gray-100 p-0.5 rounded-xl mb-3">
                      <button onClick={() => handlePriceTypeChange(item.id, "single")} className={`flex-1 py-1 text-[9px] md:text-[10px] font-bold rounded-lg ${effectivePriceType === "single" ? "bg-white text-[#805B99] shadow-sm" : "text-gray-400"}`}>تکی</button>
                      {hasWholesalePrice && <button onClick={() => handlePriceTypeChange(item.id, "wholesale")} className={`flex-1 py-1 text-[9px] md:text-[10px] font-bold rounded-lg ${effectivePriceType === "wholesale" ? "bg-white text-[#805B99] shadow-sm" : "text-gray-400"}`}>عمده</button>}
                    </div>

                    {/* انتخاب رنگ */}
                    <div className="flex gap-1.5 justify-center mb-3 h-5 items-center">
                      {item.variants?.map((variant) => (
                        (variant.stock_quantity) != 0 && 
                        <button
                          key={variant.id}
                          onClick={() => (variant.stock_quantity ?? 0) > 0 && handleVariantSelect(item.id, variant)}
                          className={`w-3 h-3 md:w-4 md:h-4 rounded-full border border-gray-200 transition-all relative ${activeVariant?.id === variant.id ? "scale-125 ring-2 ring-[#805B99]" : ""} ${(variant.stock_quantity ?? 0) <= 0 ? "opacity-50" : ""}`}
                          style={{ backgroundColor: variant.color_hexCode }}
                        >
     
                        </button>
                      ))}
                    </div>

                    {/* بخش قیمت و دکمه خرید */}
                    <div className="mt-auto pt-2 border-t border-gray-50">
                      {!isInStock ? (
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-600 font-medium">خبرم کن</p>
                          <button onClick={() => toast.info("اطلاع‌رسانی فعال شد")} className="p-2 bg-gray-100 rounded-xl"><NotificationAdd sx={{ fontSize: 18 }} /></button>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-col mb-3">
                            {displayDiscount > 0 && <span className="text-[10px] md:text-xs text-gray-400 line-through italic font-medium">{formatPrice(baseRetailPrice)}</span>}
                            <div className="flex items-baseline gap-1">
                              <span className="text-sm md:text-xl font-black text-gray-900 leading-none">{formatPrice(unitPriceAfterDiscount)}</span>
                              <span className="text-[9px] md:text-[11px] font-medium text-gray-500">تومان</span>
                            </div>
                          </div>
                          <div className="h-9 md:h-12 relative">
                            {showQuantitySelector !== item.id ? (
                              <button onClick={() => handleShowQuantitySelector(item.id)} className={`w-full h-full rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg ${(getCartItem(item.id)?.quantity ?? 0) > 0 ? "bg-green-700 text-white" : "bg-[#805B99] text-white"}`}>
                                <AddShoppingCart sx={{ fontSize: { xs: 16, md: 22 } }} />
                                <span className="text-[11px] md:text-sm font-extrabold">{(getCartItem(item.id)?.quantity ?? 0) > 0 ? `در سبد (${getCartItem(item.id)?.quantity})` : "افزودن"}</span>
                              </button>
                            ) : (
                              <div className="flex items-center justify-between bg-blue-50 rounded-2xl h-full p-1 border border-blue-100 shadow-inner">
                                <button onClick={() => handleQuantityChange(item.id, 1)} className="w-7 h-7 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-xl text-[#805B99] shadow-sm"><AddCircleOutline /></button>
                                <div className="flex flex-col items-center">
                                  <span className="text-xs md:text-sm font-black text-blue-900 leading-none">{currentQty}</span>
                                  <button onClick={() => handleAddToCart(item.id)} className="text-[10px] border rounded px-2 md:text-[14px] font-black bg-green-700 text-white mt-0.5">ثبت</button>
                                </div>
                                <button onClick={() => handleQuantityChange(item.id, -1)} className="w-7 h-7 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-xl text-red-500 shadow-sm"><RemoveCircleOutline /></button>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
{/* دکمه‌های ناوبری Swiper - اصلاح شده برای RTL */}
<div className="pointer-events-none absolute inset-y-0 -left-5 -right-5 flex items-center justify-between px-2 z-20">
  
  {/* سمت راست: دکمه قبلی (فلش راست) */}
  <div className="w-10 h-10 md:w-12 md:h-12">
    {!isBeginning && (
      <button
        onClick={() => swiperRef.current?.slidePrev()}
        className="pointer-events-auto w-full h-full bg-white/90 shadow-xl rounded-full flex items-center justify-center border border-gray-100 hover:bg-[#805B99] hover:text-white transition-all text-gray-700"
      >
        <KeyboardArrowRight className="text-2xl md:text-4xl" />
      </button>
    )}
  </div>

  {/* سمت چپ: دکمه بعدی (فلش چپ) */}
  <div className="w-10 h-10 md:w-12 md:h-12">
    {!isEnd && (
      <button
        onClick={() => swiperRef.current?.slideNext()}
        className="pointer-events-auto w-full h-full bg-white/90 shadow-xl rounded-full flex items-center justify-center border border-gray-100 hover:bg-[#805B99] hover:text-white transition-all text-gray-700"
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