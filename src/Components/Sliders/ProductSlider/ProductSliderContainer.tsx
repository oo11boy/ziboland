"use client";
import React, { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperCore } from "swiper";
import "swiper/css";
import Link from "next/link";
import { KeyboardArrowLeft, KeyboardArrowRight } from "@mui/icons-material";
import "./../Sliders.css"
export default function ProductSliderContainer({
  vip = false,
}: {
  vip?: boolean;
}) {
  const swiperRef = useRef<{ swiper: SwiperCore } | null>(null);
  const [showPrev, setShowPrev] = useState(false);
  const [showNext, setShowNext] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  // دیتای محصولات
  const data = [
    {
      id: 1,
      brand: "پیکسل",
      title: "ضد آفتاب بدون رنگ مناسب پوست های جوش دار و چرب حجم 50 میلی لیتر",
      image:
        "https://storage.khanoumi.com/ProductImages/5666500020-202491110947692.jpg?w=104",
      originalPrice: "479,000",
      discountedPrice: "431,100",
      discount: "10%",
    },
    {
      id: 2,
      brand: "مورینگا",
      title: "سرم ضد چروک صورت حجم 55 میلی لیتر",
      image:
        "https://storage.khanoumi.com/ProductImages/49631-2024619172532356.jpg?w=104",
      originalPrice: "389,400",
      discountedPrice: "298,900",
      discount: "23%",
    },
    {
      id: 3,
      brand: "پرایم",
      title: "کرم مرطوب کننده 24 ساعته",
      image:
        "https://storage.khanoumi.com/ProductImages/00-2024415162411605.jpg?w=104",
      originalPrice: "597,000",
      discountedPrice: "537,300",
      discount: "10%",
    },
    {
      id: 4,
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
      id: 5,
      brand: "تکنو درای",
      title: "سشوار حرفه ای مدل Tornado 6000",
      image:
        "https://storage.khanoumi.com/ProductImages/82911-2024122215532624.jpg?w=104",
      originalPrice: "4,510,000",
      discountedPrice: "4,370,000",
      discount: "3%",
    },
    {
      id: 6,
      brand: "دیفکتو",
      title: "ژل ابرو ژلی کاسه ای 25ml",
      image:
        "https://storage.khanoumi.com/ProductImages/71279-2025414155838450.jpg?w=104",
      originalPrice: "177,000",
      discountedPrice: "123,900",
      discount: "30%",
    },
    {
      id: 7,
      brand: "کلاژینو",
      title: "ساشه Collagen Beauty بسته 30 عددی",
      image:
        "https://storage.khanoumi.com/ProductImages/77211-2025414161656479.jpg?w=104",
      originalPrice: "1,081,800",
      discountedPrice: "749,000",
      discount: "31%",
    },
    {
      id: 8,
      brand: "تاپ شاپ",
      title: "ماسک مو با آب کشی حاوی روغن آرگان حجم 500 میلی لیتر",
      image:
        "https://storage.khanoumi.com/ProductImages/DSC00012-202469163231910.jpg?w=104",
      originalPrice: "557,900",
      discountedPrice: "502,110",
      discount: "10%",
    },
    {
      id: 9,
      brand: "هات لاو",
      title: "ادو پرفیوم زنانه مدل Victoria Secret Bombshell حجم 100 میلی لیتر",
      image:
        "https://storage.khanoumi.com/ProductImages/76350-2024810143222929.jpg?w=104",
      originalPrice: "990,000",
      discountedPrice: "689,000",
      discount: "30%",
    },
  ];
// Handle screen size changes
useEffect(() => {
  const handleResize = () => {
    setIsSmallScreen(window.innerWidth < 1024); // lg breakpoint
  };

  handleResize();
  window.addEventListener("resize", handleResize);

  return () => window.removeEventListener("resize", handleResize);
}, []);

const goNext = () => {
  if (swiperRef.current?.swiper) {
    swiperRef.current.swiper.slideNext();
  }
};

const goPrev = () => {
  if (swiperRef.current?.swiper) {
    swiperRef.current.swiper.slidePrev();
  }
};

const updateNavigation = () => {
  if (swiperRef.current?.swiper) {
    const swiper = swiperRef.current.swiper;
    setShowPrev(!swiper.isBeginning);
    setShowNext(!swiper.isEnd);
  }
};

useEffect(() => {
  if (swiperRef.current?.swiper) {
    const swiper = swiperRef.current.swiper;
    swiper.on("slideChange", updateNavigation);
    updateNavigation();
  }
  return () => {
    if (swiperRef.current?.swiper) {
      swiperRef.current.swiper.off("slideChange", updateNavigation);
    }
  };
}, []);

return (
  <div
    className={`yekan ${vip ? "bg-[#805B99] p-4 rounded-lg" : ""} w-full max-w-[1440px] mx-auto relative my-8 px-4`}
  >
    <div
      className={`w-full mb-4 flex items-center ${
        vip ? "justify-end" : "justify-between"
      }`}
    >
      {!vip && <p className="font-semibold text-lg">پرفروش‌ترین‌ها</p>}
      <Link
        href="/"
        className={`text-sm ${vip ? "text-white font-semibold" : "text-black"} hover:underline`}
      >
        مشاهده همه
      </Link>
    </div>

    {showPrev && (
      <button
        onClick={goPrev}
        className={`absolute hidden lg:flex top-1/2 ${
          vip && !isSmallScreen ? "right-[12%]" : "right-4"
        } transform -translate-y-1/2 bg-[#EBEBEB] border-[#c7c7c7] border rounded-lg h-12 w-12 text-[#805B99] z-10 items-center justify-center`}
      >
        <KeyboardArrowRight fontSize="large" />
      </button>
    )}
    {showNext && (
      <button
        onClick={goNext}
        className="absolute hidden lg:flex top-1/2 left-4 transform -translate-y-1/2 bg-[#EBEBEB] border-[#c7c7c7] border rounded-lg h-12 w-12 text-[#805B99] z-10 items-center justify-center"
      >
        <KeyboardArrowLeft fontSize="large" />
      </button>
    )}

    <div className="flex w-full">
      {vip && !isSmallScreen && (
        <div className="w-40 lg:w-48 shrink-0">
          <div className="flex bg-[#805B99] text-white h-64 lg:h-80 flex-col justify-center items-center rounded-lg">
            <h2 className="yekan text-lg font-semibold">% تخفیف ویژه %</h2>
          </div>
        </div>
      )}
      <div className="swiper-container flex-1 overflow-hidden">
        <Swiper
          slidesPerView="auto"
          spaceBetween={12}
          ref={swiperRef}
          className="mySwiper"
          breakpoints={{
            0: { slidesPerView: 2, spaceBetween: 8 },
            640: { slidesPerView: 3, spaceBetween: 10 },
            1024: { slidesPerView: 4, spaceBetween: 12 },
            1280: { slidesPerView: 5, spaceBetween: 12 },
          }}
        >
          {vip && isSmallScreen && (
            <SwiperSlide className="!w-32 sm:!w-40">
              <div className="flex bg-[#805B99] text-white h-64 flex-col justify-center items-center rounded-lg">
                <h2 className="yekan text-base font-semibold">
                  % تخفیف ویژه %
                </h2>
              </div>
            </SwiperSlide>
          )}
          {data.map((item) => (
            <SwiperSlide
              key={item.id}
              className="!w-36 sm:!w-44 lg:!w-48"
            >
              <div className="flex rounded-lg overflow-hidden relative w-full h-64 sm:h-72 lg:h-80 bg-white flex-col text-center items-center justify-between p-3">
                <img
                  src={item.image}
                  className="w-28 h-28 sm:w-32 sm:h-32 object-contain"
                  alt={item.title}
                />
                <h2
                  className="text-xs sm:text-sm font-semibold text-right overflow-hidden text-ellipsis"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {item.title}
                </h2>
                <div className="flex text-xs sm:text-sm justify-between items-center w-full">
                  <p className="text-gray-500 line-through">
                    {item.originalPrice}
                  </p>
                  <p className="font-bold">{item.discount && item.discountedPrice}</p>
                </div>
                {item.discount && (
                  <p className="absolute top-2 left-2 text-white p-1 rounded-lg text-xs bg-[#805B99]">
                    {item.discount}
                  </p>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  </div>
);
}