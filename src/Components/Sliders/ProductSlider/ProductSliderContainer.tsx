"use client";
import React, { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperCore } from "swiper";
import "swiper/css";
import Link from "next/link";
import {  KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";

export default function ProductSliderContainer({
  vip = false,
}: {
  vip?: boolean;
}) {
    const swiperRef = useRef<{ swiper: SwiperCore } | null>(null)
  const [showPrev, setShowPrev] = useState(false); // وضعیت دکمه قبلی
  const [showNext, setShowNext] = useState(true);  // وضعیت دکمه بعدی

  const data = [
    {
        id:1,
      brand: "پیکسل",
      title: "ضد آفتاب بدون رنگ مناسب پوست های جوش دار و چرب حجم 50 میلی لیتر",
      image:
        "https://storage.khanoumi.com/ProductImages/5666500020-202491110947692.jpg?w=104",
      originalPrice: "479,000",
      discountedPrice: "431,100",
      discount: "10%",
    },
    {
        id:2,
      brand: "مورینگا",
      title: "سرم ضد چروک صورت حجم 55 میلی لیتر",
      image:
        "https://storage.khanoumi.com/ProductImages/49631-2024619172532356.jpg?w=104",
      originalPrice: "389,400",
      discountedPrice: "298,900",
      discount: "23%",
    },
    {
        id:3,
      brand: "پرایم",
      title: "کرم مرطوب کننده 24 ساعته",
      image:
        "https://storage.khanoumi.com/ProductImages/00-2024415162411605.jpg?w=104",
      originalPrice: "597,000",
      discountedPrice: "537,300",
      discount: "10%",
    },
    {
        id:4,
      brand: "لافارر",
      title:
        "ژل شستشو صورت مدل لایه بردار شماره 1 مناسب پوست چرب و مستعد آکنه حجم 150 میلی لیتر",
      image:
        "https://storage.khanoumi.com/ProductImages/ییث-2024123184526759.jpg?w=104",
      originalPrice: "631,900",
      discountedPrice: "568,710",
      discount: "10%",
    },
    {
        id:5,
      brand: "تکنو درای",
      title: "سشوار حرفه ای مدل Tornado 6000",
      image:
        "https://storage.khanoumi.com/ProductImages/82911-2024122215532624.jpg?w=104",
      originalPrice: "4,510,000",
      discountedPrice: "4,370,000",
      discount: "3%",
    },
    {
        id:6,
      brand: "دیفکتو",
      title: "ژل ابرو ژلی کاسه ای 25ml",
      image:
        "https://storage.khanoumi.com/ProductImages/71279-2025414155838450.jpg?w=104",
      originalPrice: "177,000",
      discountedPrice: "123,900",
      discount: "30%",
    },
    {
        id:7,
      brand: "کلاژینو",
      title: "ساشه Collagen Beauty بسته 30 عددی",
      image:
        "https://storage.khanoumi.com/ProductImages/77211-2025414161656479.jpg?w=104",
      originalPrice: "1,081,800",
      discountedPrice: "749,000",
      discount: "31%",
    },
    {
        id:8,
      brand: "تاپ شاپ",
      title: "ماسک مو با آب کشی حاوی روغن آرگان حجم 500 میلی لیتر",
      image:
        "https://storage.khanoumi.com/ProductImages/DSC00012-202469163231910.jpg?w=104",
      originalPrice: "557,900",
      discountedPrice: "502,110",
      discount: "10%",
    },
    {
        id:9,
      brand: "هات لاو",
      title: "ادو پرفیوم زنانه مدل Victoria Secret Bombshell حجم 100 میلی لیتر",
      image:
        "https://storage.khanoumi.com/ProductImages/76350-2024810143222929.jpg?w=104",
      originalPrice: "990,000",
      discountedPrice: "689,000",
      discount: "30%",
    },
  ];

  // تابع برای رفتن به اسلاید بعدی
  const goNext = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      if (vip && swiperRef.current.swiper.activeIndex === 0) {
        swiperRef.current.swiper.slideTo(1);
      } else {
        swiperRef.current.swiper.slideNext();
      }
    }
  };

  // تابع برای رفتن به اسلاید قبلی
  const goPrev = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      swiperRef.current.swiper.slidePrev();
    }
  };

  // تابع به‌روزرسانی وضعیت دکمه‌ها
  const updateNavigation = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      const swiper = swiperRef.current.swiper;
      setShowPrev(!swiper.isBeginning); // اگر در اسلاید اول نباشیم، دکمه قبلی نمایش داده شود
      setShowNext(!swiper.isEnd);       // اگر در اسلاید آخر نباشیم، دکمه بعدی نمایش داده شود
    }
  };

  // هوک useEffect برای مدیریت رویداد تغییر اسلاید
  useEffect(() => {
    if (swiperRef.current && swiperRef.current.swiper) {
      const swiper = swiperRef.current.swiper;
      swiper.on("slideChange", updateNavigation); // هر بار که اسلاید تغییر کند، وضعیت دکمه‌ها به‌روزرسانی شود
      updateNavigation(); // بررسی اولیه وضعیت دکمه‌ها
    }
    // تمیز کردن رویداد هنگام unmount
    return () => {
      if (swiperRef.current && swiperRef.current.swiper) {
        swiperRef.current.swiper.off("slideChange", updateNavigation);
      }
    };
  }, []);

  return (
    <div className={`${vip && "bg-[#805B99] p-4 rounded-lg"} w-[90%] m-auto relative my-8`}>
      <div
        className={`w-full mb-2 ${
          vip ? "justify-end" : "justify-between"
        } flex items-center`}
      >
        {!vip && <p className="font-semibold">پرفروش ترین ها</p>}
        <Link
          href="/"
          className={`${vip ? "text-white font-semibold" : "text-black"}`}
        >
          مشاهده همه
        </Link>
      </div>

      {/* دکمه‌های ناوبری با نمایش شرطی */}
      {showPrev && (
        <button
          onClick={goPrev}
          className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-[#EBEBEB] border-[#c7c7c7] border  rounded-lg h-10 w-10  text-[#805B99] z-10"
        >
            <KeyboardArrowRight fontSize="large"/>
        </button>
      )}
      {showNext && (
        <button
          onClick={goNext}
          className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-[#EBEBEB] border-[#c7c7c7] border  rounded-lg h-10 w-10  text-[#805B99] z-10"
        >
        
          <KeyboardArrowLeft fontSize="large"/>
        </button>
      )}

      <Swiper
        slidesPerView={6}
        spaceBetween={30}
        ref={swiperRef}
      >
        {vip && (
          <SwiperSlide>
            <div className="flex  bg-[#805B99] text-white h-[250px] flex-col justify-center items-center">
              <h2 className="yekanh">% تخفیف ویژه %</h2>
            </div>
          </SwiperSlide>
        )}

        {data.map((item) => (
          <SwiperSlide key={item.id}>
            <div className="flex rounded-lg overflow-hidden relative w-full h-[250px] bg-white flex-col text-center items-center justify-between p-2">
              <img
                src={item.image}
                className="w-32 h-32 object-cover"
                alt={item.title}
              />
              <h2
                className="text-sm font-semibold text-right overflow-hidden text-ellipsis"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                }}
              >
                {item.title}
              </h2>
              <div className="flex justify-between items-center w-full">
                <p className="text-gray-500 line-through">
                  {item.originalPrice}
                </p>
                <p className="font-bold">{item.discountedPrice}</p>
              </div>
              <p className="absolute top-2 left-2 text-white p-1 rounded-lg text-sm bg-[#805B99]">
                {item.discount}
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}