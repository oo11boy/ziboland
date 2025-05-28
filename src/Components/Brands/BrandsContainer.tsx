"use client";
import React, { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperCore } from "swiper";
import "swiper/css";
import { KeyboardArrowLeft, KeyboardArrowRight, VisibilitySharp } from "@mui/icons-material";
import Link from "next/link";

export default function BrandsContainer() {
  const swiperRef = useRef<SwiperCore | null>(null);
  const [showPrev, setShowPrev] = useState(false);
  const [showNext, setShowNext] = useState(true);

  const data = [
    { id: 1, img: "https://abzarreza.com/wp-content/uploads/2022/11/vivarex.png.webp", link: "#" },
    { id: 2, img: "https://abzarreza.com/wp-content/uploads/2022/07/Rabin.png.webp", link: "#" },
    { id: 3, img: "https://abzarreza.com/wp-content/uploads/2021/01/Pm.png.webp", link: "#" },
    { id: 4, img: "https://abzarreza.com/wp-content/uploads/2022/07/Danlex.png.webp", link: "#" },
    { id: 5, img: "https://abzarreza.com/wp-content/uploads/2022/07/AEG.png.webp", link: "#" },
    { id: 6, img: "https://abzarreza.com/wp-content/uploads/2022/07/Metabo.png.webp", link: "#" },
    { id: 7, img: "https://abzarreza.com/wp-content/uploads/2021/01/crown.png.webp", link: "#" },
    { id: 8, img: "https://abzarreza.com/wp-content/uploads/2022/07/Ronix.png.webp", link: "#" },
  ];

  // تابع برای به‌روزرسانی وضعیت دکمه‌ها
  const updateNavigation = () => {
    if (swiperRef.current) {
      const swiper = swiperRef.current;
      setShowPrev(!swiper.isBeginning);
      setShowNext(!swiper.isEnd);
    }
  };

  // تابع برای رفتن به اسلاید بعدی
  const goNext = () => {
    if (swiperRef.current) {
      swiperRef.current.slideNext();
    }
  };

  // تابع برای رفتن به اسلاید قبلی
  const goPrev = () => {
    if (swiperRef.current) {
      swiperRef.current.slidePrev();
    }
  };

  // به‌روزرسانی وضعیت دکمه‌ها هنگام تغییر اسلایدها
  useEffect(() => {
    if (swiperRef.current) {
      swiperRef.current.on("slideChange", updateNavigation);
      updateNavigation();
    }
    return () => {
      if (swiperRef.current) {
        swiperRef.current.off("slideChange", updateNavigation);
      }
    };
  }, []);

  return (
    <div className="w-[90%] yekan mx-auto my-8 bg-white rounded-lg p-4 relative sm:p-6 md:p-8">
      <div className="w-full mb-6 mt-2 flex items-center justify-between">
      <p className="font-semibold yekanh text-sm sm:text-base md:text-lg lg:text-xl">
         برترین برندها
        </p>
        <Link
          href="/"
          className="flex items-center text-xs sm:text-sm gap-1 sm:gap-2 px-2 sm:px-3 py-1 text-black bg-gray-200 border border-[#d1d5dc] rounded-full shadow-sm hover:bg-gray-300 hover:shadow-md transition-all duration-300"
          style={{
            backgroundImage: "linear-gradient(to right, #f3f4f6, #e5e7eb)",
          }}
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
          slidesPerView={3} // تعداد اسلایدها برای موبایل
          spaceBetween={10} // فاصله بین اسلایدها برای موبایل
          breakpoints={{
            640: {
              // sm
              slidesPerView: 3,
              spaceBetween: 15,
            },
            768: {
              // md
              slidesPerView: 4,
              spaceBetween: 20,
            },
            1024: {
              // lg
              slidesPerView: 6,
              spaceBetween: 25,
            },
            1280: {
              // xl
              slidesPerView: 7,
              spaceBetween: 30,
            },
          }}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            updateNavigation();
          }}
          dir="rtl"
        >
          {data.map((item) => (
            <SwiperSlide key={item.id}>
              <a href={item.link}>
                <img
                  src={item.img}
                  alt="brands"
                  className="w-2/3 h-auto object-contain"
                />
              </a>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}