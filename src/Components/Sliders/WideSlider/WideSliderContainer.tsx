"use client";
import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide, SwiperRef } from "swiper/react";
import { Navigation, Pagination, EffectCoverflow, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-coverflow";
import "./WideSlider.css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Link from "next/link";

interface Slide {
  id: number;
  imagewide: string;
  imagemin: string;
  alt: string;
  link: string;
}

interface WideSliderContainerProps {
  slides: Slide[]; // prop جدید برای داده‌ها
}

const WideSliderContainer: React.FC<WideSliderContainerProps> = ({ slides }) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [windowWidth, setWindowWidth] = useState(0);
  const swiperRef = useRef<SwiperRef>(null);

  // useEffect برای fetch حذف شد، چون داده‌ها از props می‌آیند

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  // اگر slides خالی باشد، می‌توانید یک پیام یا loading نشان دهید
  if (slides.length === 0) {
    return <div className="w-full py-5 text-center">در حال بارگذاری اسلایدرها...</div>;
  }

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
            <div className="w-full flex justify-center items-center">
              <Link href={slide.link}>
                <img
                  src={windowWidth >= 993 ? slide.imagewide : slide.imagemin}
                  alt={slide.alt}
                  className="w-full h-full rounded-lg object-cover transition-all duration-300 
                           swiper-slide-active:scale-110 swiper-slide-active:h-[550px]
                           swiper-slide-prev:scale-90 swiper-slide-prev:h-[450px]
                           swiper-slide-next:scale-90 swiper-slide-next:h-[450px]"
                />
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div style={{ display: windowWidth <= 993 ? "flex" : "none" }} className="absolute z-[20] w-10 h-10 bg-white rounded-full top-8 right-[10%]">
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
      </div>
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