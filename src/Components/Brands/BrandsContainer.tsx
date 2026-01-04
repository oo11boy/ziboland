"use client";
import React, { useRef, useState, useEffect } from "react";
import { Swiper as SwiperCore } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { KeyboardArrowLeft, KeyboardArrowRight, VisibilitySharp } from "@mui/icons-material";
import Link from "next/link";

interface Brand {
  id: number;
  title: string;
  img: string;
}

export default function BrandsContainer() {
  const swiperRef = useRef<SwiperCore | null>(null);
  const [showPrev, setShowPrev] = useState(false);
  const [showNext, setShowNext] = useState(true);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // دریافت داده‌ها از API
  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch("/api/brands");
        if (!response.ok) throw new Error("Failed to fetch brands");
        const data: Brand[] = await response.json();
        setBrands(data);
        setLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  // به‌روزرسانی وضعیت دکمه‌های ناوبری
  const updateNavigation = () => {
    if (swiperRef.current) {
      const swiper = swiperRef.current;
      setShowPrev(!swiper.isBeginning);
      setShowNext(!swiper.isEnd);
    }
  };

  const goNext = () => {
    if (swiperRef.current) swiperRef.current.slideNext();
  };

  const goPrev = () => {
    if (swiperRef.current) swiperRef.current.slidePrev();
  };

  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.on("slideChange", updateNavigation);
      swiperRef.current.on("reachBeginning", updateNavigation);
      swiperRef.current.on("reachEnd", updateNavigation);
      updateNavigation();
    }
    return () => {
      if (swiperRef.current) {
        swiperRef.current.off("slideChange", updateNavigation);
        swiperRef.current.off("reachBeginning", updateNavigation);
        swiperRef.current.off("reachEnd", updateNavigation);
      }
    };
  }, [brands]);

  if (loading) {
    return <div className="w-[90%] yekan mx-auto my-8 text-center">در حال بارگذاری...</div>;
  }

  if (error) {
    return <div className="w-[90%] yekan mx-auto my-8 text-center text-red-500">خطا: {error}</div>;
  }

  if (brands.length === 0) {
    return <div className="w-[90%] yekan mx-auto my-8 text-center">هیچ برندی یافت نشد</div>;
  }

  // اگر تعداد برندها کم باشه (مثلاً کمتر از ۷ تا در صفحه بزرگ)، وسط چین می‌کنیم
  const shouldCenter = brands.length <= 7;

  return (
    <div className="w-[95%] yekan mx-auto my-8 bg-white rounded-lg p-4 relative sm:p-6 md:p-8">
      <div className="w-full mb-6 mt-2 flex items-center justify-between">
        <p className="font-semibold yekan text-sm sm:text-base md:text-lg lg:text-xl">
          برترین برندها
        </p>
        <Link
          href="/search"
          className="flex items-center text-xs sm:text-sm gap-1 sm:gap-2 px-2 sm:px-3 py-1 text-black bg-gray-200 border border-[#d1d5dc] rounded-full shadow-sm hover:bg-gray-300 hover:shadow-md transition-all duration-300"
          style={{ backgroundImage: "linear-gradient(to right, #f3f4f6, #e5e7eb)" }}
        >
          <VisibilitySharp fontSize="inherit" className="text-gray-600" />
          مشاهده همه
        </Link>
      </div>

      <div className="w-full m-auto relative">
        {/* دکمه‌های ناوبری */}
        {showPrev && (
          <button
            onClick={goPrev}
            className="absolute top-1/2 right-0 sm:right-2 transform -translate-y-1/2 bg-[#EBEBEB] border-[#c7c7c7] border rounded-lg h-8 w-8 sm:h-10 sm:w-10 text-[#805B99] z-10"
          >
            <KeyboardArrowRight fontSize="medium" />
          </button>
        )}
        {showNext && (
          <button
            onClick={goNext}
            className="absolute top-1/2 left-0 sm:left-2 transform -translate-y-1/2 bg-[#EBEBEB] border-[#c7c7c7] border rounded-lg h-8 w-8 sm:h-10 sm:w-10 text-[#805B99] z-10"
          >
            <KeyboardArrowLeft fontSize="medium" />
          </button>
        )}

        <Swiper
          slidesPerView={3}
          spaceBetween={10}
          centeredSlides={shouldCenter} // فقط وقتی تعداد کمه، وسط چین می‌شه
          initialSlide={shouldCenter ? Math.floor(brands.length / 2) : 0} // شروع از وسط اگر وسط چین فعال باشه
          breakpoints={{
            640: { slidesPerView: 3, spaceBetween: 15 },
            768: { slidesPerView: 4, spaceBetween: 20 },
            1024: { slidesPerView: 6, spaceBetween: 25 },
            1280: { slidesPerView: 7, spaceBetween: 30 },
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            updateNavigation();
          }}
          dir="rtl"
        >
          {brands.map((item) => (
            <SwiperSlide key={item.id} className="flex flex-col items-center">
              <a
                href={`/search?brands=${encodeURIComponent(item.title)}`}
                className="text-center flex justify-center items-center"
              >
                <img
                  src={item.img}
                  alt={item.title}
                  className="w-2/3 h-auto object-contain"
                />
              </a>
              <p className="mt-2 text-sm sm:text-base text-center">{item.title}</p>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}