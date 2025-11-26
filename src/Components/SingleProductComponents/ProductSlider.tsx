'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Thumbs, Autoplay, Zoom } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/thumbs';
import 'swiper/css/zoom';
import { motion, AnimatePresence } from 'framer-motion';
import { Close, ZoomIn } from '@mui/icons-material';
import { Product, Media } from '@/types/types';
import { Swiper as SwiperType } from 'swiper/types';

const ProductSlider: React.FC<{ infoproduct: Product }> = ({ infoproduct }) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const featuredImageSrc = infoproduct.image?.trim();
  const featuredMediaItem: Media | null = featuredImageSrc
    ? {
        type: 'image',
        src: featuredImageSrc,
        thumbnail: featuredImageSrc,
        alt: infoproduct.title || 'تصویر اصلی محصول',
      }
    : null;

  const allMediaItems: Media[] = [
    ...(featuredMediaItem &&
    (!infoproduct.media ||
      infoproduct.media.length === 0 ||
      !infoproduct.media.some((m) => m.src === featuredMediaItem.src))
      ? [featuredMediaItem]
      : []),
    ...(infoproduct.media || []),
  ];

  const hasMultipleImages = allMediaItems.length > 1;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isLightboxOpen || !imageRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    imageRef.current.style.transform = 'scale(2.5)';
    imageRef.current.style.transformOrigin = `${x}% ${y}%`;
  }, [isLightboxOpen]);

  const handleMouseLeave = useCallback(() => {
    if (imageRef.current) {
      imageRef.current.style.transform = 'scale(1)';
      imageRef.current.style.transformOrigin = 'center center';
    }
  }, []);

  const toggleLightbox = useCallback(() => {
    setIsLightboxOpen(prev => !prev);
    document.body.style.overflow = isLightboxOpen ? 'auto' : 'hidden';
  }, [isLightboxOpen]);

  useEffect(() => {
    setIsClient(true);
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  if (!isClient) {
    return (
      <div className="woocommerce-product-gallery max-w-[450px] mx-auto" dir="rtl">
        <div className="w-full aspect-[3/2] bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse rounded-xl" />
      </div>
    );
  }

  if (allMediaItems.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500" dir="rtl">
        هیچ تصویری برای این محصول موجود نیست.
      </div>
    );
  }

  return (
    <div className="woocommerce-product-gallery max-w-[450px] mx-auto" dir="rtl">

      {/* حالت ۱: فقط یک تصویر */}
      {!hasMultipleImages ? (
        <motion.div
          className="relative w-full aspect-[3/2] rounded-xl overflow-hidden bg-gray-50 cursor-zoom-in shadow-lg flex items-center justify-center"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={toggleLightbox}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <img
            src={allMediaItems[0].src}
            alt={allMediaItems[0].alt}
            className="max-w-full max-h-full object-contain transition-transform duration-300"
            ref={imageRef}
          />

          <motion.button
            className="absolute top-3 left-3 p-2.5 bg-white bg-opacity-85 rounded-full shadow-md z-10"
            whileHover={{ scale: 1.2 }}
            onClick={(e) => {
              e.stopPropagation();
              toggleLightbox();
            }}
          >
            <ZoomIn className="w-5 h-5 text-gray-800" />
          </motion.button>
        </motion.div>
      ) : (
        <>
          {/* حالت ۲: چند تصویر با Swiper */}
          <Swiper
            className="single-product-slider mb-4 rounded-xl overflow-hidden shadow-lg"
            modules={[Thumbs, Autoplay, Zoom]}
            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
            spaceBetween={10}
            slidesPerView={1}
            loop={allMediaItems.length > 2}
            rewind={allMediaItems.length <= 2}
            speed={600}
            autoplay={{
              delay: 5000,
              disableOnInteraction: true,
              pauseOnMouseEnter: true,
            }}
            zoom={true}
            onSlideChange={(s) => setActiveIndex(s.realIndex)}
          >
            {allMediaItems.map((item, index) => (
              <SwiperSlide key={index}>
                <motion.div
                  className="w-full aspect-[3/2] cursor-zoom-in bg-gray-50"
                  onClick={toggleLightbox}
                >
                  {item.type === 'image' ? (
                    <div className="swiper-zoom-container flex items-center justify-center">
                      <img
                        src={item.src}
                        alt={item.alt || `تصویر ${index + 1}`}
                        className="object-contain"
                        loading={index === 0 ? 'eager' : 'lazy'}
                      />
                    </div>
                  ) : (
                    <video
                      src={item.src}
                      controls
                      className="w-full h-full object-contain"
                      poster={item.thumbnail}
                    />
                  )}

                  <motion.button
                    className="absolute top-3 left-3 p-2.5 bg-white bg-opacity-85 rounded-full shadow-md z-10"
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

          {/* Thumbs */}
          <Swiper
            className="thumbs-slider mt-4"
            modules={[Thumbs]}
            onSwiper={setThumbsSwiper}
            spaceBetween={8}
            slidesPerView={Math.min(5, allMediaItems.length)}
            watchSlidesProgress
            loop={allMediaItems.length > 2}
            rewind={allMediaItems.length <= 2}
          >
            {allMediaItems.map((item, index) => (
              <SwiperSlide key={index} className="!w-auto">
                <div className={`rounded-lg overflow-hidden border-2 transition-all ${
                  activeIndex === index ? 'border-blue-500 opacity-100' : 'border-transparent opacity-60'
                }`}>
                  <img
                    src={item.thumbnail || item.src}
                    alt=""
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </>
      )}

      {/* لایت‌باکس */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-95 z-[9999] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleLightbox}
          >
            <motion.div
              className="relative max-w-[95vw] max-h-[90vh] flex items-center justify-center"
              onClick={e => e.stopPropagation()}
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              {allMediaItems[activeIndex]?.type === 'image' ? (
                <img
                  src={allMediaItems[activeIndex].src}
                  alt={allMediaItems[activeIndex].alt || 'تصویر بزرگ'}
                  className="max-w-full max-h-full object-contain"
                />
              ) : (
                <video
                  src={allMediaItems[activeIndex].src}
                  controls
                  autoPlay
                  className="max-w-full max-h-[90vh] mx-auto rounded-lg"
                  poster={allMediaItems[activeIndex].thumbnail}
                />
              )}

              <motion.button
                className="absolute top-4 right-4 p-3 bg-white bg-opacity-90 rounded-full shadow-xl"
                whileHover={{ scale: 1.1 }}
                onClick={toggleLightbox}
              >
                <Close className="w-8 h-8 text-gray-800" />
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductSlider;
