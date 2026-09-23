"use client";
import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide, SwiperRef } from "swiper/react";
import {
  Navigation,
  Pagination,
  EffectCoverflow,
  Autoplay,
} from "swiper/modules";
import "./WideSlider.css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import Link from "next/link";
import Image from "next/image";

interface Slide {
  id: number;
  link: string | null;
  imagewide: string;
  imagemin: string;
  alt: string;
}

interface Props {
  slides: Slide[];
}

const AUTOPLAY_DELAY = 6000;

const WideSliderContainer = ({ slides }: Props) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);
  const swiperRef = useRef<SwiperRef>(null);
  const progressRef = useRef(0);
  const isPlayingRef = useRef(true);

  // sync refs
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => setWindowWidth(window.innerWidth);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ استفاده از یک interval ثابت بدون وابستگی به startTime
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isPlayingRef.current) return;

      progressRef.current += 100 / (AUTOPLAY_DELAY / 100);

      if (progressRef.current >= 100) {
        progressRef.current = 0;
      }
      setProgress(progressRef.current);
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleSlideChange = () => {
    progressRef.current = 0;
    setProgress(0);
  };

  const toggleAutoplay = () => {
    if (!swiperRef.current?.swiper) return;

    if (isPlaying) {
      swiperRef.current.swiper.autoplay.stop();
      setIsPlaying(false);
    } else {
      progressRef.current = 0;
      setProgress(0);
      swiperRef.current.swiper.autoplay.start();
      setIsPlaying(true);
    }
  };

  const renderSlideContent = (slide: Slide) => {
    const imageElement = (
      <Image
        width={1500}
        height={500}
        src={windowWidth >= 993 ? slide.imagewide : slide.imagemin}
        alt={slide.alt}
        className="w-full h-full rounded-lg object-cover transition-all duration-300 
                   swiper-slide-active:scale-110 swiper-slide-active:h-[550px]
                   swiper-slide-prev:scale-90 swiper-slide-prev:h-[450px]
                   swiper-slide-next:scale-90 swiper-slide-next:h-[450px]"
      />
    );

    if (slide.link) {
      return <Link href={slide.link}>{imageElement}</Link>;
    }
    return imageElement;
  };

  if (!slides || slides.length === 0) return null;

  return (
    <div className="w-full mx-auto py-5 relative">
      <Swiper
        ref={swiperRef}
        modules={[Navigation, Pagination, EffectCoverflow, Autoplay]}
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={windowWidth >= 993 ? 1.2 : 1.13}
        spaceBetween={windowWidth >= 993 ? 80 : 100}
        loop={slides.length > 2}
        autoplay={
          slides.length > 2
            ? { delay: AUTOPLAY_DELAY, disableOnInteraction: false }
            : false
        }
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
              {renderSlideContent(slide)}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div
        style={{ display: windowWidth <= 993 ? "flex" : "none" }}
        className="absolute z-[20] w-10 h-10 bg-white rounded-full top-8 right-[10%]"
      >
        <div className="progress-circle" onClick={toggleAutoplay}>
          <CircularProgressbar
            value={progress}
            text={isPlaying ? "| |" : "▶"}
            styles={buildStyles({
              pathColor: "#000000",
              trailColor: "#d6d6d6",
              backgroundColor: "#ffffff",
              textColor: "#000000",
            })}
          />
        </div>
      </div>

      <div
        className="sliderbtns absolute bottom-8 z-50 right-60 flex items-center"
        style={{ display: windowWidth >= 993 ? "flex" : "none" }}
      >
        <div className="swiper-button-prev"></div>
        <div className="progress-circle" onClick={toggleAutoplay}>
          <CircularProgressbar
            value={progress}
            text={isPlaying ? "| |" : "▶"}
            styles={buildStyles({
              pathColor: "#000000",
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