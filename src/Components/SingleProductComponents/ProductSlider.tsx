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
import { Close, ZoomIn, PlayCircle } from "@mui/icons-material";
import { Product, Variant } from "@/types/types";
import { Swiper as SwiperType } from "swiper/types";

interface ProductSliderProps {
  infoproduct: Product;
  selectedVariant?: Variant | null;
}

interface MediaItem {
  type: "image" | "video";
  src: string;
  thumbnail?: string;
  alt: string;
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
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // بررسی اینکه آیا آیتم ویدیو است
  const isVideo = (src: string): boolean => {
    const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
    return videoExtensions.some(ext => src.toLowerCase().endsWith(ext));
  };

  // دریافت مدیاها از product و variant
  const getMediaItems = (): MediaItem[] => {
    const items: MediaItem[] = [];
    const processedSrcs = new Set<string>();

    // اضافه کردن تصویر اصلی محصول
    const productMainImage = infoproduct.image?.trim();
    if (productMainImage) {
      items.push({
        type: "image",
        src: productMainImage,
        thumbnail: productMainImage,
        alt: infoproduct.title || "تصویر محصول",
      });
      processedSrcs.add(productMainImage);
    }

    // اضافه کردن تصویر اصلی واریانت
    const variantMainImage = selectedVariant?.image_main?.trim();
    if (variantMainImage && !processedSrcs.has(variantMainImage)) {
      items.push({
        type: "image",
        src: variantMainImage,
        thumbnail: variantMainImage,
        alt: infoproduct.title || "تصویر محصول",
      });
      processedSrcs.add(variantMainImage);
    }

    // اضافه کردن گالری واریانت
    const variantGallery = selectedVariant?.images || [];
    variantGallery.forEach((src) => {
      if (src && !processedSrcs.has(src)) {
        items.push({
          type: isVideo(src) ? "video" : "image",
          src: src,
          thumbnail: isVideo(src) ? src : src,
          alt: infoproduct.title || "تصویر محصول",
        });
        processedSrcs.add(src);
      }
    });

    // اضافه کردن مدیاهای محصول
    if (infoproduct.media) {
      infoproduct.media.forEach((item) => {
        if (item.src && !processedSrcs.has(item.src)) {
          const type = item.type === "video" || isVideo(item.src) ? "video" : "image";
          items.push({
            type: type,
            src: item.src,
            thumbnail: type === "video" ? item.thumbnail || item.src : item.src,
            alt: infoproduct.title || "محتوای محصول",
          });
          processedSrcs.add(item.src);
        }
      });
    }

    return items;
  };

  const allMediaItems = getMediaItems();
  const hasMultipleItems = allMediaItems.length > 1;

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
    // اگر مدیا فعال ویدیو است، در لایت‌باک باز نشود
    const currentMedia = allMediaItems[activeIndex];
    if (currentMedia?.type === "video") return;
    
    setIsLightboxOpen((prev) => !prev);
    document.body.style.overflow = isLightboxOpen ? "auto" : "hidden";
  }, [isLightboxOpen, activeIndex, allMediaItems]);

  useEffect(() => {
    setIsClient(true);
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  // رندر یک آیتم مدیا (تصویر یا ویدیو)
  const renderMediaItem = (item: MediaItem, index: number, className: string = "") => {
    if (item.type === "video") {
      return (
        <div className={`relative w-full aspect-[3/2] bg-black ${className}`}>
          <video
            ref={videoRef}
            src={item.src}
            className="w-full h-full object-contain"
            controls
            playsInline
            preload="metadata"
            poster={item.thumbnail}
          >
            <source src={item.src} />
            مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
          </video>
          {/* آیکون پلی روی ویدیو */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <PlayCircle className="w-16 h-16 text-white opacity-80 drop-shadow-lg" />
          </div>
        </div>
      );
    }

    return (
      <div 
        className={`relative w-full aspect-[3/2] bg-gray-50 cursor-zoom-in overflow-hidden rounded-xl ${className}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <Image
          src={item.src}
          alt={item.alt}
          fill
          sizes="(max-width: 768px) 100vw, 450px"
          className="object-contain transition-transform duration-300"
          ref={imageRef as any}
          priority={index === 0}
        />
        <button 
          className="absolute top-3 left-3 p-2.5 bg-white bg-opacity-85 rounded-full shadow-md z-10 hover:bg-opacity-100 transition-all"
          onClick={(e) => { 
            e.stopPropagation(); 
            toggleLightbox(); 
          }}
        >
          <ZoomIn className="w-5 h-5 text-gray-800" />
        </button>
      </div>
    );
  };

  // رندر تصویر کوچک برای ناوبری
  const renderThumbnail = (item: MediaItem, index: number) => {
    return (
      <div className={`rounded-lg overflow-hidden border-2 transition-all ${
        activeIndex === index ? "border-blue-500 opacity-100" : "border-transparent opacity-60"
      }`}>
        {item.type === "video" ? (
          <div className="relative w-20 h-20">
            <video
              src={item.src}
              className="w-full h-full object-cover"
              muted
              playsInline
              preload="metadata"
            />
            <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
              <PlayCircle className="w-8 h-8 text-white" />
            </div>
          </div>
        ) : (
          <Image
            src={item.thumbnail || item.src}
            alt={item.alt}
            width={80}
            height={80}
            className="object-cover w-20 h-20"
          />
        )}
      </div>
    );
  };

  if (!isClient) {
    return <div className="woocommerce-product-gallery max-w-[450px] mx-auto aspect-[3/2] bg-gray-200 animate-pulse rounded-xl" />;
  }

  return (
    <div className="woocommerce-product-gallery lg:max-w-[450px] w-full" dir="rtl">
      {!hasMultipleItems ? (
        // حالت تک مدیا
        renderMediaItem(allMediaItems[0], 0)
      ) : (
        <>
          {/* اسلایدر اصلی */}
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
              <SwiperSlide key={index} className="overflow-hidden">
                {item.type === "video" ? (
                  <div className="w-full aspect-[3/2] bg-black overflow-hidden">
                    <video
                      src={item.src}
                      className="w-full h-full object-contain"
                      controls
                      playsInline
                      preload="metadata"
                      poster={item.thumbnail}
                    >
                      <source src={item.src} />
                      مرورگر شما از پخش ویدیو پشتیبانی نمی‌کند.
                    </video>
                  </div>
                ) : (
                  <div className="w-full aspect-[3/2] cursor-zoom-in bg-gray-50 relative overflow-hidden" onClick={toggleLightbox}>
                    <div className="swiper-zoom-container flex items-center justify-center w-full h-full overflow-hidden">
                      <Image
                        src={item.src}
                        alt={item.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 450px"
                        className="object-contain"
                        priority={index === 0}
                      />
                    </div>
                    <button 
                      className="absolute top-3 left-3 p-2.5 bg-white bg-opacity-85 rounded-full shadow-md z-10 hover:bg-opacity-100 transition-all"
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        toggleLightbox(); 
                      }}
                    >
                      <ZoomIn className="w-5 h-5 text-gray-800" />
                    </button>
                  </div>
                )}
              </SwiperSlide>
            ))}
          </Swiper>

          {/* تصاویر کوچک ناوبری */}
          <Swiper 
            className="thumbs-slider mt-4 overflow-hidden" 
            modules={[Thumbs]} 
            onSwiper={setThumbsSwiper} 
            spaceBetween={8} 
            slidesPerView={Math.min(5, allMediaItems.length)} 
            watchSlidesProgress
          >
            {allMediaItems.map((item, index) => (
              <SwiperSlide key={index} className="!w-auto overflow-hidden">
                {renderThumbnail(item, index)}
              </SwiperSlide>
            ))}
          </Swiper>
        </>
      )}

      {/* لایت‌باک - فقط برای تصاویر */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div 
            className="fixed inset-0 bg-black bg-opacity-95 z-[9999] flex items-center justify-center p-4" 
            onClick={toggleLightbox}
          >
            <motion.div 
              className="relative w-full h-full max-w-4xl max-h-[80vh]" 
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={allMediaItems[activeIndex].src}
                alt={allMediaItems[activeIndex].alt}
                fill
                className="object-contain"
                sizes="100vw"
              />
              <button 
                className="absolute top-4 right-4 p-3 bg-white bg-opacity-90 rounded-full shadow-xl z-20 hover:bg-opacity-100 transition-all"
                onClick={toggleLightbox}
              >
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