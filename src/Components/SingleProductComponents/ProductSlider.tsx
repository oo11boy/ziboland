
"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs, Autoplay, Zoom } from "swiper/modules";

// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/thumbs";
// @ts-ignore
import "swiper/css/zoom";

import { motion, AnimatePresence } from "framer-motion";
import { Close, ZoomIn } from "@mui/icons-material";
import { Product, Variant } from "@/types/types";
import { Swiper as SwiperType } from "swiper/types";

interface ProductSliderProps {
  infoproduct: Product;
  selectedVariant?: Variant | null;
}

const ProductSlider: React.FC<ProductSliderProps> = ({
  infoproduct,
  selectedVariant = null,
}) => {
  const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
  const [isClient, setIsClient] = useState<boolean>(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const variantMainImage = selectedVariant?.image_main?.trim();
  const variantGallery = selectedVariant?.images || [];
  const productMainImage = infoproduct.image?.trim();

  const featuredImageSrc = variantMainImage || productMainImage;
  const allImages: string[] = [];

  if (featuredImageSrc) allImages.push(featuredImageSrc);

  variantGallery.forEach((src) => {
    if (src && src !== featuredImageSrc) allImages.push(src);
  });

  if (allImages.length === 0 && infoproduct.media) {
    infoproduct.media.forEach((item) => {
      if (item.type === "image" && item.src) allImages.push(item.src);
    });
  }

  const allMediaItems = allImages.map((src) => ({
    type: "image" as const,
    src,
    thumbnail: src,
    alt: infoproduct.title || "تصویر محصول",
  }));

  const hasMultipleImages = allMediaItems.length > 1;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (isLightboxOpen || !imageRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    imageRef.current.style.transform = "scale(2.5)";
    imageRef.current.style.transformOrigin = `${x}% ${y}%`;
  }, [isLightboxOpen]);

  const handleMouseLeave = useCallback(() => {
    if (imageRef.current) {
      imageRef.current.style.transform = "scale(1)";
      imageRef.current.style.transformOrigin = "center center";
    }
  }, []);

  const toggleLightbox = useCallback(() => {
    setIsLightboxOpen((prev) => !prev);
    document.body.style.overflow = isLightboxOpen ? "auto" : "hidden";
  }, [isLightboxOpen]);

  useEffect(() => {
    setIsClient(true);
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  if (!isClient) return <div className="woocommerce-product-gallery max-w-[450px] mx-auto aspect-[3/2] bg-gray-200 animate-pulse rounded-xl" />;

  return (
    <div className="woocommerce-product-gallery lg:max-w-[450px]" dir="rtl">
      {!hasMultipleImages ? (
        <motion.div
          className="relative w-full aspect-[3/2] rounded-xl overflow-hidden bg-gray-50 cursor-zoom-in shadow-lg"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={toggleLightbox}
        >
          <Image
            src={allMediaItems[0].src}
            alt={allMediaItems[0].alt}
            fill
            sizes="(max-width: 768px) 100vw, 450px"
            className="object-contain transition-transform duration-300"
            ref={imageRef as any}
            priority
          />
          <button className="absolute top-3 left-3 p-2.5 bg-white bg-opacity-85 rounded-full shadow-md z-10" onClick={(e) => { e.stopPropagation(); toggleLightbox(); }}>
            <ZoomIn className="w-5 h-5 text-gray-800" />
          </button>
        </motion.div>
      ) : (
        <>
          <Swiper
            className="single-product-slider mb-4 rounded-xl overflow-hidden shadow-lg"
            modules={[Thumbs, Autoplay, Zoom]}
            thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
            spaceBetween={10}
            slidesPerView={1}
            zoom={true}
            onSlideChange={(s) => setActiveIndex(s.realIndex)}
          >
            {allMediaItems.map((item, index) => (
              <SwiperSlide key={index}>
                <div className="w-full aspect-[3/2] cursor-zoom-in bg-gray-50 relative" onClick={toggleLightbox}>
                  <div className="swiper-zoom-container flex items-center justify-center">
                    <Image
                      src={item.src}
                      alt={item.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 450px"
                      className="object-contain"
                      priority={index === 0}
                    />
                  </div>
                  <button className="absolute top-3 left-3 p-2.5 bg-white bg-opacity-85 rounded-full shadow-md z-10" onClick={(e) => { e.stopPropagation(); toggleLightbox(); }}>
                    <ZoomIn className="w-5 h-5 text-gray-800" />
                  </button>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <Swiper className="thumbs-slider mt-4" modules={[Thumbs]} onSwiper={setThumbsSwiper} spaceBetween={8} slidesPerView={Math.min(5, allMediaItems.length)} watchSlidesProgress>
            {allMediaItems.map((item, index) => (
              <SwiperSlide key={index} className="!w-auto">
                <div className={`rounded-lg overflow-hidden border-2 transition-all ${activeIndex === index ? "border-blue-500 opacity-100" : "border-transparent opacity-60"}`}>
                  <Image
                    src={item.thumbnail || item.src}
                    alt={item.alt}
                    width={80}
                    height={80}
                    className="object-cover w-20 h-20"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div className="fixed inset-0 bg-black bg-opacity-95 z-[9999] flex items-center justify-center p-4" onClick={toggleLightbox}>
             <motion.div className="relative w-full h-full max-w-4xl max-h-[80vh]" onClick={(e) => e.stopPropagation()}>
                <Image
                  src={allMediaItems[activeIndex].src}
                  alt={allMediaItems[activeIndex].alt}
                  fill
                  className="object-contain"
                  sizes="100vw"
                />
                <button className="absolute top-4 right-4 p-3 bg-white bg-opacity-90 rounded-full shadow-xl z-20" onClick={toggleLightbox}>
                  <Close className="w-8 h-8 text-gray-800" />
                </button>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductSlider;

