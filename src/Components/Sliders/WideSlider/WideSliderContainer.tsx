"use client";
import React, { useState, useRef, useEffect } from 'react';
import { Swiper, SwiperSlide, SwiperRef } from 'swiper/react';
import { Navigation, Pagination, EffectCoverflow, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-coverflow';
import './WideSlider.css';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface Slide {
  id: number;
  image: string;
  alt: string;
}

const slides: Slide[] = [
  { id: 1, image: 'https://cdn.khanoumi.com/cml/carousel-big/db/b7/dbb7a7acf6884a2096a814df6739ee20.jpeg', alt: 'Slide 1' },
  { id: 2, image: 'https://cdn.khanoumi.com/cml/carousel-big/87/7b/877b4de4cefa474cb94bdd07a9d496e7.jpeg', alt: 'Slide 2' },
  { id: 3, image: 'https://cdn.khanoumi.com/cml/carousel-big/b0/0b/b00ba640304d4493805cc09e7d342e8a.jpeg', alt: 'Slide 3' },
  { id: 4, image: 'https://cdn.khanoumi.com/cml/carousel-big/05/15/0515677f27fd49538bd86233a76bb159.jpeg', alt: 'Slide 3' },
  { id: 5, image: 'https://cdn.khanoumi.com/cml/carousel-big/cc/a1/cca15a0f1e8243deb83aa0d3fe2c7211.jpeg', alt: 'Slide 3' },


];

const WideSliderContainer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(100);
  const [startTime, setStartTime] = useState(Date.now());
  const swiperRef = useRef<SwiperRef>(null);

  useEffect(() => {
    setStartTime(Date.now());
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        const now = Date.now();
        const elapsed = now - startTime;
        const total = 6000;
        const newProgress = Math.max(0, 100 * (1 - elapsed / total));
        setProgress(newProgress);
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isPlaying, startTime]);

  const handleSlideChange = () => {
    setStartTime(Date.now());
    setProgress(100);
  };

  const toggleAutoplay = () => {
    if (swiperRef.current && swiperRef.current.swiper) {
      if (isPlaying) {
        swiperRef.current.swiper.autoplay.stop();
        setIsPlaying(false);
      } else {
        setStartTime(Date.now());
        setProgress(100);
        swiperRef.current.swiper.autoplay.start();
        setIsPlaying(true);
      }
    }
  };

  return (
    <div className="w-full  mx-auto py-5 relative">
      <Swiper
        ref={swiperRef}
        modules={[Navigation, Pagination, EffectCoverflow, Autoplay]}
        effect="coverflow"
        grabCursor={true}
        centeredSlides={true}
        slidesPerView={1.2}
        spaceBetween={20}
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
          prevEl: '.swiper-button-next',
          nextEl: '.swiper-button-prev',
        }}
        onSlideChange={handleSlideChange}
        className="py-5 h-[480px]"
      >
        {slides.map((slide) => (
          <SwiperSlide
            key={slide.id}
            className="flex WideSlider justify-center items-center transition-all duration-300"
          >
            <div className="w-full h-full flex justify-center items-center">
              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-cover transition-all duration-300 
                           swiper-slide-active:scale-110 swiper-slide-active:h-[550px]
                           swiper-slide-prev:scale-90 swiper-slide-prev:h-[450px]
                           swiper-slide-next:scale-90 swiper-slide-next:h-[450px]"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="sliderbtns absolute bottom-8 z-50 right-50 flex items-center">
        <div className="swiper-button-prev"></div>
        <div className="progress-circle" onClick={toggleAutoplay}>
          <CircularProgressbar
            value={progress}
            text={isPlaying ? '| |' : '▶'}
            styles={{
              background: { fill: 'white' },
            }}
          />
        </div>
        <div className="swiper-button-next"></div>
      </div>
    </div>
  );
};

export default WideSliderContainer;