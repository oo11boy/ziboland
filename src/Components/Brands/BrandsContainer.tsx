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
    <div className="w-[90%] mx-auto my-8 bg-white rounded-lg p-2 relative">
    <div className="w-full mb-8 mt-2 justify-between flex items-center">
      <p className="font-semibold yekanh text-xl">برترین برندها</p>
      <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 text-md text-black bg-gray-200 border border-[#d1d5dc] rounded-full shadow-sm hover:bg-gray-300 hover:shadow-md transition-all duration-300"
          style={{
            backgroundImage: "linear-gradient(to right, #f3f4f6, #e5e7eb)",
          }}
        >
          <VisibilitySharp className="w-5 h-5 text-gray-600" />
          مشاهده همه
        </Link>
      </div>
    <div className="w-full m-auto relative" >
        
        {/* دکمه‌های ناوبری */}
        {showPrev && (
          <button
            onClick={goPrev}
            className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-[#EBEBEB] border-[#c7c7c7] border rounded-lg h-10 w-10 text-[#805B99] z-10"
          >
            <KeyboardArrowRight fontSize="large" />
          </button>
        )}
        {showNext && (
          <button
            onClick={goNext}
            className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-[#EBEBEB] border-[#c7c7c7] border rounded-lg h-10 w-10 text-[#805B99] z-10"
          >
            <KeyboardArrowLeft fontSize="large" />
          </button>
        )}
  
        <Swiper
          slidesPerView={7}
          spaceBetween={30}
          onSwiper={(swiper) => {
            swiperRef.current = swiper;
            updateNavigation();
          }}
          dir="rtl"
         
        >
          {data.map((item) => (
            <SwiperSlide key={item.id}>
              <a href={item.link}>
                <img src={item.img} alt="brands" />
              </a>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
  </div>

  );
}