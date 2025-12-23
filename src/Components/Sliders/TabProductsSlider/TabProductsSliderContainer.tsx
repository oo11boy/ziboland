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
import { Product, Color } from "@/types/types";
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

export default function TabProductsSliderContainer({ title }: { title: string }) {
  const [value, setValue] = useState(0);
  const { dispatch } = useCart();
  const [cartQuantities, setCartQuantities] = useState<{ [key: number]: number }>({});
  const [priceTypes, setPriceTypes] = useState<{ [key: number]: "single" | "wholesale" }>({});
  const [selectedColors, setSelectedColors] = useState<{ [key: number]: Color | null }>({});
  const [showQuantitySelector, setShowQuantitySelector] = useState<number | null>(null);
  const swiperRefs = useRef<{ [key: number]: { swiper: SwiperCore } | null }>({});
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("خطا در دریافت");
        const data: Product[] = await response.json();
        let sorted = data;
        if (title === "محبوبترین ها") sorted = [...data].sort((a, b) => b.rating - a.rating);
        else if (title === "ارزانترین ها") sorted = [...data].sort((a, b) => a.numericPrice - b.numericPrice);
        setProducts(sorted);
      } catch (err) { console.error(err); }
    };
    fetchProducts();
  }, [title]);

  useEffect(() => {
    const initialPriceTypes = products.reduce((acc, p) => ({ ...acc, [p.id]: "single" }), {});
    setPriceTypes(initialPriceTypes);
    const initialColors = products.reduce((acc, p) => ({
      ...acc, [p.id]: p.colors && p.colors.length > 0 ? p.colors[0] : null
    }), {});
    setSelectedColors(initialColors);
  }, [products]);

  const handleQuantityChange = (productId: number, delta: number) => {
    setCartQuantities((prev) => {
      const newQuantity = (prev[productId] || 0) + delta;
      const product = products.find((p) => p.id === productId);
      if (product && product.discountwholesalePrice > 0) {
        setPriceTypes(prevTypes => ({
          ...prevTypes,
          [productId]: newQuantity >= product.minwholesale ? "wholesale" : "single"
        }));
      }
      return { ...prev, [productId]: newQuantity < 0 ? 0 : newQuantity };
    });
  };

  const handleAddToCart = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    const quantity = cartQuantities[productId];
    if (!product || !quantity || quantity < 1) {
      toast.error("تعداد محصول را انتخاب کنید");
      return;
    }
    const type = priceTypes[productId] || "single";
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: productId,
        title: product.title,
        quantity,
        priceType: type,
        price: (type === "single" ? product.discountedPrice : product.discountwholesalePrice).toString(),
        image: product.image || "/placeholder.jpg",
        discount: type === "single" ? product.discount : product.discountwholesale,
        color: selectedColors[productId],
      },
    });
    toast.success("به سبد خرید اضافه شد");
    setCartQuantities(prev => ({ ...prev, [productId]: 0 }));
    setShowQuantitySelector(null);
  };

  const categories = Array.from(new Set(products.map(p => p.category)));
  const productsByCategory = categories.map(cat => products.filter(p => p.category === cat));

  return (
    <div className="w-full max-w-[1440px] mx-auto px-4 py-6 font-[yekannew]" dir="rtl">
      <ToastContainer rtl theme="colored" position="top-center" autoClose={2500} />

      {/* هدر بخش */}
      <div className="flex justify-between items-center mb-6 px-1">
        <div className="border-r-4 border-[#805B99] pr-3">
          <h2 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight">{title}</h2>
        </div>
        <Link href="/search" className="flex items-center gap-1 text-[#805B99] bg-blue-50 px-4 py-2 rounded-2xl text-xs md:text-sm font-bold hover:bg-blue-100 transition-colors">
          <VisibilitySharp fontSize="inherit" /> مشاهده همه
        </Link>
      </div>

      {/* تب‌ها */}
      <Tabs
        value={value}
        onChange={(_, v) => setValue(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          mb: 2,
          "& .MuiTabs-indicator": { height: 3, borderRadius: '10px', backgroundColor: '#805B99' },
          "& .MuiTab-root": { fontFamily: "inherit", fontWeight: 800, fontSize: { xs: "0.8rem", md: "0.95rem" }, minWidth: '100px' },
          "& .Mui-selected": { color: "#805B99 !important" }
        }}
      >
        {categories.map((cat, i) => <Tab key={i} label={cat} />)}
      </Tabs>

      {/* اسلایدر محصولات */}
      <div className="relative group">
        {categories.map((_, index) => (
          <CustomTabPanel key={index} value={value} index={index}>
            <Swiper
              modules={[Navigation]}
              spaceBetween={12}
              slidesPerView={2.2}
              breakpoints={{
                640: { slidesPerView: 3, spaceBetween: 15 },
                1024: { slidesPerView: 5, spaceBetween: 20 },
                1280: { slidesPerView: 6, spaceBetween: 20 }
              }}
              onSwiper={(s) => swiperRefs.current[index] = { swiper: s }}
            >
              {productsByCategory[index].map((item) => {
                const effectivePriceType = priceTypes[item.id] || "single";
                const finalPrice = effectivePriceType === "single" ? item.discountedPrice : item.discountwholesalePrice;

                return (
                  <SwiperSlide key={item.id} className="py-2">
                    {/* کارت اصلی با ارتفاع هماهنگ برای موبایل و دسکتاپ */}
                    <div className="flex flex-col h-[340px] md:h-[430px] bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-2.5 md:p-4 relative overflow-hidden group/card">
                      
                      {/* تصویر محصول */}
                      <div className="relative w-full aspect-square bg-gray-50 rounded-[1.5rem] overflow-hidden mb-3">
                        <img src={item.image} className="w-full h-full object-contain p-2 group-hover/card:scale-105 transition-transform duration-500" alt={item.title} />
                        {item.discount !== "0" && (
                          <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] md:text-xs font-black px-2 py-0.5 rounded-lg shadow-sm">
                            {item.discount}%
                          </span>
                        )}
                      </div>

                      {/* اطلاعات محصول */}
                      <div className="flex flex-col flex-grow overflow-hidden">
                        {/* عنوان با ارتفاع ثابت جهت تراز شدن */}
                        <h3 className="text-gray-800 text-[11px] md:text-sm font-bold mb-2 line-clamp-2 h-8 md:h-10 leading-4 md:leading-5 tracking-tight">
                          <Link href={`/products/${item.id}`}>{item.title}</Link>
                        </h3>

                        {/* سوئیچ قیمت */}
                        <div className="flex bg-gray-100 p-0.5 rounded-xl mb-3">
                          <button 
                            onClick={() => setPriceTypes(p => ({ ...p, [item.id]: "single" }))}
                            className={`flex-1 py-1 text-[9px] md:text-[10px] font-bold rounded-lg transition-all ${effectivePriceType === 'single' ? 'bg-white text-[#805B99] shadow-sm' : 'text-gray-400'}`}
                          >تکی</button>
                          {item.discountwholesalePrice > 0 && (
                            <button 
                              onClick={() => setPriceTypes(p => ({ ...p, [item.id]: "wholesale" }))}
                              className={`flex-1 py-1 text-[9px] md:text-[10px] font-bold rounded-lg transition-all ${effectivePriceType === 'wholesale' ? 'bg-white text-[#805B99] shadow-sm' : 'text-gray-400'}`}
                            >عمده</button>
                          )}
                        </div>

                        {/* انتخاب رنگ */}
                        <div className="flex gap-1.5 justify-center mb-2 h-4 items-center ">
                          {item.colors?.map(c => (
                            <button
                              key={c.hexCode}
                              onClick={() => setSelectedColors(p => ({ ...p, [item.id]: c }))}
                              className={`w-3 h-3 md:w-4 md:h-4 rounded-full border border-gray-200 transition-transform ${selectedColors[item.id]?.hexCode === c.hexCode ? 'scale-125 ring-2 ring-blue-400' : ''}`}
                              style={{ backgroundColor: c.hexCode }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* قیمت و دکمه خرید - همیشه به پایین چسبیده */}
                      <div className="mt-auto pt-2 border-t border-gray-50">
                        <div className="flex flex-col mb-3">
                          <span className="text-[10px] md:text-xs text-gray-400 line-through h-4 leading-none italic font-medium">
                            {item.discount !== "0" ? formatPrice(item.originalPrice) : ""}
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className="text-sm md:text-xl font-black text-gray-900 leading-none">{formatPrice(finalPrice)}</span>
                            <span className="text-[9px] md:text-[11px] font-medium text-gray-500">تومان</span>
                          </div>
                        </div>

                        {/* دکمه عملیات */}
                        <div className="h-9 md:h-12">
                          {showQuantitySelector !== item.id ? (
                            <button 
                              onClick={() => setShowQuantitySelector(item.id)}
                              className="w-full h-full bg-[#805B99] hover:bg-[#805B80] text-white rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-gray-200"
                            >
                              <AddShoppingCart sx={{ fontSize: { xs: 16, md: 22 } }} />
                              <span className="text-[11px] md:text-sm font-extrabold text-white">افزودن</span>
                            </button>
                          ) : (
                            <div className="flex items-center justify-between bg-blue-50 rounded-2xl h-full p-1 border border-blue-100 shadow-inner">
                              <button onClick={() => handleQuantityChange(item.id, 1)} className="w-7 h-7 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-xl text-[#805B99] shadow-sm hover:bg-[#805B99] hover:text-white transition-all"><AddCircleOutline sx={{ fontSize: {xs: 18, md: 20} }}/></button>
                              <div className="flex flex-col items-center">
                                <span className="text-xs md:text-sm font-black text-blue-900 leading-none">{cartQuantities[item.id] || 0}</span>
                                {cartQuantities[item.id] > 0 && <button onClick={() => handleAddToCart(item.id)} className="text-[8px] md:text-[10px] font-black text-green-600 uppercase tracking-tighter">تایید</button>}
                              </div>
                              <button onClick={() => handleQuantityChange(item.id, -1)} className="w-7 h-7 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-xl text-red-500 shadow-sm hover:bg-red-500 hover:text-white transition-all"><RemoveCircleOutline sx={{ fontSize: {xs: 18, md: 20} }}/></button>
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

        {/* دکمه‌های ناوبری دسکتاپ */}
        <button onClick={() => swiperRefs.current[value]?.swiper.slidePrev()} className="absolute top-1/2 -right-6 -translate-y-1/2 z-10 w-12 h-12 bg-white shadow-xl rounded-full hidden lg:flex items-center justify-center border border-gray-100 hover:bg-[#805B99] hover:text-white transition-all text-gray-700">
          <KeyboardArrowRight fontSize="large" />
        </button>
        <button onClick={() => swiperRefs.current[value]?.swiper.slideNext()} className="absolute top-1/2 -left-6 -translate-y-1/2 z-10 w-12 h-12 bg-white shadow-xl rounded-full hidden lg:flex items-center justify-center border border-gray-100 hover:bg-[#805B99] hover:text-white transition-all text-gray-700">
          <KeyboardArrowLeft fontSize="large" />
        </button>
      </div>
    </div>
  );
}