"use client";
import React, { useState, useRef, useEffect } from "react";
import { Swiper, SwiperSlide, SwiperRef } from "swiper/react";
import {
  Navigation,
  Pagination,
  EffectCoverflow,
  Autoplay,
} from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import "./WideSlider.css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

interface Slide {
  id: number;
  imagewide: string;
  imagemin: string;
  alt: string;
}

const slides: Slide[] = [
  {
    id: 1,
    imagemin:
      "https://cdn.khanoumi.com/cml/carousel-big/d6/f0/d6f0fcda345b4cd0ae7ffbe8b1dd8061.jpeg",
    imagewide:
      "https://cdn.khanoumi.com/cml/carousel-big/db/b7/dbb7a7acf6884a2096a814df6739ee20.jpeg",
    alt: "Slide 1",
  },
  {
    id: 2,
    imagemin:
      "https://cdn.khanoumi.com/cml/carousel-big/1c/02/1c029045ba5c4413a870c7dfab8cb70b.jpeg",
    imagewide:
      "https://cdn.khanoumi.com/cml/carousel-big/87/7b/877b4de4cefa474cb94bdd07a9d496e7.jpeg",
    alt: "Slide 2",
  },
  {
    id: 3,
    imagemin:
      "https://cdn.khanoumi.com/cml/carousel-big/a2/23/a2233746026244b79d2543258bfaad2d.jpeg",
    imagewide:
      "https://cdn.khanoumi.com/cml/carousel-big/b0/0b/b00ba640304d4493805cc09e7d342e8a.jpeg",
    alt: "Slide 3",
  },
  {
    id: 4,
    imagemin:
      "https://cdn.khanoumi.com/cml/carousel-big/1d/72/1d726429ea2349bda6263466bd8820ec.jpeg",
    imagewide:
      "https://cdn.khanoumi.com/cml/carousel-big/05/15/0515677f27fd49538bd86233a76bb159.jpeg",
    alt: "Slide 4",
  },
  {
    id: 5,
    imagemin:
      "https://cdn.khanoumi.com/cml/carousel-big/ca/9f/ca9fbbd4a74d4978bec8803c215e4e81.jpeg",
    imagewide:
      "https://cdn.khanoumi.com/cml/carousel-big/cc/a1/cca15a0f1e8243deb83aa0d3fe2c7211.jpeg",
    alt: "Slide 5",
  },
];

const WideSliderContainer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [windowWidth, setWindowWidth] = useState(0); // مقدار اولیه برای جلوگیری از خطا
  const swiperRef = useRef<SwiperRef>(null);

  // مدیریت عرض صفحه
  useEffect(() => {
    if (typeof window === "undefined") return; // جلوگیری از اجرا در سمت سرور

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    handleResize(); // بررسی اولیه عرض صفحه
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // مدیریت پراگرس بار
  useEffect(() => {
    setStartTime(Date.now());
    setProgress(0);
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTime;
        const total = 6000;
        const newProgress = Math.min(100, (elapsed / total) * 100);
        setProgress(newProgress);

        if (newProgress >= 100) {
          setStartTime(Date.now());
          setProgress(0);
        }
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isPlaying, startTime]);

  const handleSlideChange = () => {
    setStartTime(Date.now());
    setProgress(0);
  };

  const toggleAutoplay = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      if (isPlaying) {
        swiperRef.current.swiper.autoplay.stop();
        setIsPlaying(false);
      } else {
        setStartTime(Date.now());
        setProgress(0);
        swiperRef.current.swiper.autoplay.start();
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="w-full mx-auto py-5 relative">
      <Swiper
        ref={swiperRef}
        modules={[Navigation, Pagination, EffectCoverflow, Autoplay]}
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={windowWidth >= 993 ? 1.1 : 1.13}
        spaceBetween={windowWidth >= 993 ? 150 : 100}
        loop={true}
        autoplay={{
          delay: 6000,
          disableOnInteraction: false,
        }}
        coverflowEffect={{
          rotate: 0,
          stretch: 50,
          depth: 100,
          modifier: 1,
          slideShadows: false,
        }}
        pagination={{ clickable: true }}
        navigation={{
          prevEl: ".swiper-button-prev",
          nextEl: ".swiper-button-next",
        }}
        onSlideChange={handleSlideChange}
        className="py-5"
      >
        {slides.map((slide) => (
          <SwiperSlide
            key={slide.id}
            className="flex justify-center items-center transition-all duration-300"
          >
            <div className="w-full  flex justify-center items-center">
              <img
                src={windowWidth >= 993 ? slide.imagewide : slide.imagemin}
                alt={slide.alt}
                className="w-full h-full rounded-lg object-cover transition-all duration-300 
                           swiper-slide-active:scale-110 swiper-slide-active:h-[550px]
                           swiper-slide-prev:scale-90 swiper-slide-prev:h-[450px]
                           swiper-slide-next:scale-90 swiper-slide-next:h-[450px]"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div
        className="sliderbtns absolute bottom-8 z-50 right-40 flex items-center"
        style={{ display: windowWidth >= 993 ? "flex" : "none" }}
      >
        <div className="swiper-button-prev"></div>
        <div className="progress-circle" onClick={toggleAutoplay}>
          <CircularProgressbar
            value={progress}
            text={isPlaying ? "| |" : "▶"}
            styles={buildStyles({
              pathColor: progress === 0 ? "#000000" : "#000000",
              trailColor: "#d6d6d6",
              backgroundColor: "#ffffff",
              textColor: "#000000",
            })}
          />
        </div>
        <div className="swiper-button-next"></div>
      </div>
    </div>
  );
};

export default WideSliderContainer;