'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Thumbs, Autoplay, Zoom } from 'swiper/modules';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

import 'swiper/css';
import 'swiper/css/thumbs';
import 'swiper/css/zoom';
import { Swiper as SwiperType } from 'swiper/types';
import { Close, PlayArrow, ZoomIn } from '@mui/icons-material';

interface MediaItem {
  type: 'image' | 'video';
  src: string;
  thumbnail: string;
  alt: string;
}

interface ProductSliderProps {
  infoproduct: {
    media: MediaItem[];
  };
}

const ProductSlider: React.FC<ProductSliderProps> = ({ infoproduct }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const imageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const mainSwiperRef = useRef<SwiperType | null>(null);

  useEffect(() => {
    setIsClient(true);
    imageRefs.current = new Array(infoproduct.media.length).fill(null);
    videoRefs.current = new Array(infoproduct.media.length).fill(null);
  }, [infoproduct.media.length]);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, index: number) => {
      const image = imageRefs.current[index];
      if (image && infoproduct.media[index].type === 'image' && !isLightboxOpen) {
        const { clientX, clientY } = e;
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = ((clientX - left) / width) * 100;
        const y = ((clientY - top) / height) * 100;
        image.style.transform = `scale(2.5)`;
        image.style.transformOrigin = `${x}% ${y}%`;
      }
    },
    [isLightboxOpen, infoproduct.media]
  );

  const handleMouseLeave = useCallback((index: number) => {
    const image = imageRefs.current[index];
    if (image) {
      image.style.transform = 'scale(1)';
      image.style.transformOrigin = 'center center';
    }
  }, []);

  const toggleLightbox = useCallback(() => {
    setIsLightboxOpen((prev) => !prev);
    document.body.style.overflow = isLightboxOpen ? 'auto' : 'hidden';
  }, [isLightboxOpen]);

  const handleSlideChange = (swiper: SwiperType) => {
    setActiveIndex(swiper.realIndex);
  };

  const playVideo = (index: number) => {
    const video = videoRefs.current[index];
    if (video) {
      video.play();
    }
  };

  if (!isClient) {
    return (
      <div className="woocommerce-product-gallery max-w-[450px] mx-auto" dir="rtl">
        <div className="single-product-slider w-full aspect-[3/2] bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-lg shadow-md" />
      </div>
    );
  }

  return (
    <div className="woocommerce-product-gallery max-w-[450px] mx-auto relative touch-pan-y" dir="rtl" ref={containerRef}>
      {/* Main Slider */}
      <Swiper
        className="single-product-slider mb-4 rounded-xl overflow-hidden"
        modules={[Thumbs, Autoplay, Zoom]}
        thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
        spaceBetween={10}
        slidesPerView={1}
        loop={infoproduct.media.length > 2} // حلقه فقط برای بیش از 2 اسلاید
        rewind={infoproduct.media.length <= 2} // برای 1 یا 2 اسلاید از rewind استفاده شود
        speed={500}
        autoplay={{
          delay: 5000,
          disableOnInteraction: true,
          pauseOnMouseEnter: true, // توقف هنگام هاور
        }}
        zoom={true}
        onSlideChange={handleSlideChange}
        onSwiper={(swiper) => (mainSwiperRef.current = swiper)}
        touchRatio={1}
        touchAngle={45}
      >
        {infoproduct.media.map((item, index) => (
          <SwiperSlide key={index} className="swiper-zoom-item relative">
            <motion.div
              className="zoom-container w-full aspect-[3/2] cursor-zoom-in"
              onMouseMove={(e) => handleMouseMove(e, index)}
              onMouseLeave={() => handleMouseLeave(index)}
              onClick={toggleLightbox}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {item.type === 'image' ? (
                <div className="swiper-zoom-container">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="w-full h-full object-contain zoom-target transition-transform duration-300"
                    priority={index === 0}
                    loading={index === 0 ? 'eager' : 'lazy'}
                    ref={(el) => {
                      imageRefs.current[index] = el;
                    }}
                  />
                </div>
              ) : (
                <div className="relative w-full h-full">
                  <video
                    src={item.src}
                    ref={(el) => {
                      videoRefs.current[index] = el;
                    }}
                    controls
                    className="w-full h-full object-contain rounded-lg"
                    poster={item.thumbnail}
                    preload="metadata"
                  />
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg"
                    onClick={() => playVideo(index)}
                    whileHover={{ scale: 1.1 }}
                  >
                    <PlayArrow className="text-white w-12 h-12" />
                  </motion.div>
                </div>
              )}
              <motion.button
                className="absolute top-2 left-2 p-2 bg-white bg-opacity-80 rounded-full shadow-md"
                whileHover={{ scale: 1.2 }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleLightbox();
                }}
              >
                <ZoomIn className="w-5 h-5 text-gray-800" />
              </motion.button>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Thumbnail Slider */}
      {infoproduct.media.length > 1 && (
        <Swiper
          className="thumbs-slider"
          modules={[Thumbs]}
          watchSlidesProgress
          onSwiper={setThumbsSwiper}
          spaceBetween={8}
          slidesPerView={Math.min(3, infoproduct.media.length)}
          loop={infoproduct.media.length > 2} // هماهنگی حلقه با اسلایدر اصلی
          rewind={infoproduct.media.length <= 2} // برای 1 یا 2 اسلاید از rewind استفاده شود
          breakpoints={{
            320: {
              slidesPerView: Math.min(2.5, infoproduct.media.length),
              spaceBetween: 6,
            },
            480: {
              slidesPerView: Math.min(3, infoproduct.media.length),
              spaceBetween: 8,
            },
            640: {
              slidesPerView: Math.min(5, infoproduct.media.length),
              spaceBetween: 16,
            },
          }}
        >
          {infoproduct.media.map((item, index) => (
            <SwiperSlide className="!w-[auto]" key={index}>
              <motion.div
                className={`woocommerce-product-gallery__image rounded-md overflow-hidden border-2 ${
                  activeIndex === index ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                <Image
                  src={item.thumbnail}
                  alt={item.alt}
                  width={80}
                  height={80}
                  className="w-[80px] h-[80px] object-cover cursor-pointer"
                  loading="lazy"
                />
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleLightbox}
          >
            <motion.div
              className="relative max-w-[95vw] w-full h-[80vh] max-h-[90vh] p-4"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
            >
              {infoproduct.media[activeIndex].type === 'image' ? (
                <Image
                  src={infoproduct.media[activeIndex].src}
                  alt={infoproduct.media[activeIndex].alt}
                  fill
                  className="object-contain"
                  priority
                />
              ) : (
                <video
                  src={infoproduct.media[activeIndex].src}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                  poster={infoproduct.media[activeIndex].thumbnail}
                />
              )}
              <motion.button
                className="absolute top-4 right-4 p-3 bg-white bg-opacity-80 rounded-full shadow-md"
                onClick={toggleLightbox}
              >
                <Close className="w-8 h-8 text-gray-800" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx>{`
        .woocommerce-product-gallery {
          direction: rtl;
          opacity: 1;
          transition: opacity 0.3s ease-in-out;
          touch-action: pan-y;
        }
        .single-product-slider {
          width: 100%;
          aspect-ratio: 3 / 2;
          background: linear-gradient(145deg, #f3f4f6, #ffffff);
        }
        .thumbs-slider .swiper-slide {
          opacity: 0.5;
          transition: opacity 0.3s ease, transform 0.2s ease;
        }
        .thumbs-slider .swiper-slide-thumb-active {
          opacity: 1;
          transform: scale(1.1);
        }
        .zoom-container {
          overflow: hidden;
          position: relative;
          cursor: zoom-in;
          width: 100%;
          height: 100%;
        }
        .zoom-target {
          transition: transform 0.3s ease-out;
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }
        .swiper-button-prev,
        .swiper-button-next {
          transition: background 0.2s ease;
          display: flex;
        }
        [dir='rtl'] .swiper-button-prev {
          transform: rotate(180deg);
        }
        [dir='rtl'] .swiper-button-next {
          transform: rotate(180deg);
        }
        @media (max-width: 480px) {
          .woocommerce-product-gallery {
            max-width: 100%;
            padding: 0 0.5rem;
          }
          .swiper-button-prev,
          .swiper-button-next {
            width: 2rem !important;
            height: 2rem !important;
            font-size: 0.75rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductSlider;