"use client";
import React, { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperCore } from "swiper";
import "swiper/css";
import Link from "next/link";
import "./../Sliders.css";
import "./ProductSlider.css";
import {
  KeyboardArrowLeft,
  KeyboardArrowRight,
  AddCircleOutline,
  RemoveCircleOutline,
  AddShoppingCart,
} from "@mui/icons-material";

export const productdata = [
  {
    id: 1,
    brand: "پیکسل",
    title: "ضد آفتاب بدون رنگ مناسب پوست های جوش دار و چرب حجم 50 میلی لیتر",
    image: "https://storage.khanoumi.com/ProductImages/5666500020-202491110947692.jpg?w=104",
    originalPrice: "479,000",
    discountedPrice: "431,100",
    wholesalePrice: "400,000",
    discountwholesalePrice: "340,000",
    discount: "10%",
    discountwholesale: "15%",
    category: "مراقبت پوست",
  },
  {
    id: 2,
    brand: "مورینگا",
    title: "سرم ضد چروک صورت حجم 55 میلی لیتر",
    image: "https://storage.khanoumi.com/ProductImages/49631-2024619172532356.jpg?w=104",
    originalPrice: "389,500",
    discountedPrice: "298,900",
    wholesalePrice: "270,000",
    discountwholesalePrice: "229,500",
    discount: "23%",
    discountwholesale: "15%",
    category: "مراقبت پوست",
  },
  {
    id: 3,
    brand: "پرایم",
    title: "کرم مرطوب کننده 24 ساعته",
    image: "https://storage.khanoumi.com/ProductImages/00-2024415162411605.jpg?w=104",
    originalPrice: "597,000",
    discountedPrice: "537,300",
    wholesalePrice: "500,000",
    discountwholesalePrice: "450,000",
    discount: "10%",
    discountwholesale: "10%",
    category: "مراقبت پوست",
  },
  {
    id: 4,
    brand: "لافارر",
    title: "ژل شستشو صورت مدل لایه بردار شماره 1 مناسب پوست چرب و مستعد آکنه حجم 150 میلی لیتر",
    image: "https://storage.khanoumi.com/ProductImages/ییث-2024123184526759.jpg?w=104",
    originalPrice: "631,900",
    discountedPrice: "568,710",
    wholesalePrice: "530,000",
    discountwholesalePrice: "450,500",
    discount: "10%",
    discountwholesale: "15%",
    category: "مراقبت پوست",
  },
  {
    id: 5,
    brand: "تکنو درای",
    title: "سشوار حرفه ای مدل Tornado 6000",
    image: "https://storage.khanoumi.com/ProductImages/82911-2024122215532624.jpg?w=104",
    originalPrice: "4,510,000",
    discountedPrice: "4,370,000",
    wholesalePrice: "4,100,000",
    discountwholesalePrice: "3,280,000",
    discount: "3%",
    discountwholesale: "20%",
    category: "مراقبت مو",
  },
  {
    id: 6,
    brand: "دیفکتو",
    title: "ژل ابرو ژلی کاسه ای 25ml",
    image: "https://storage.khanoumi.com/ProductImages/71279-2025414155838450.jpg?w=104",
    originalPrice: "177,000",
    discountedPrice: "123,900",
    wholesalePrice: "110,000",
    discountwholesalePrice: "99,000",
    discount: "30%",
    discountwholesale: "10%",
    category: "مراقبت مو",
  },
  {
    id: 7,
    brand: "کلاژینو",
    title: "ساشه Collagen Beauty بسته 30 عددی",
    image: "https://storage.khanoumi.com/ProductImages/77211-2025414161656479.jpg?w=104",
    originalPrice: "1,081,800",
    discountedPrice: "749,000",
    wholesalePrice: "700,000",
    discountwholesalePrice: "560,000",
    discount: "31%",
    discountwholesale: "20%",
    category: "مراقبت پوست",
  },
  {
    id: 8,
    brand: "تاپ شاپ",
    title: "ماسک مو با آب کشی حاوی روغن آرگان حجم 500 میلی لیتر",
    image: "https://storage.khanoumi.com/ProductImages/DSC00012-202469163231910.jpg?w=104",
    originalPrice: "557,900",
    discountedPrice: "502,110",
    wholesalePrice: "470,000",
    discountwholesalePrice: "423,000",
    discount: "10%",
    discountwholesale: "10%",
    category: "مراقبت مو",
  },
  {
    id: 9,
    brand: "هات لاو",
    title: "ادو پرفیوم زنانه مدل Victoria Secret Bombshell حجم 100 میلی لیتر",
    image: "https://storage.khanoumi.com/ProductImages/Birsen-3P-Retinol-Serum-30-ml-2024115141356583.jpg?w=130",
    originalPrice: "990,000",
    discountedPrice: "689,000",
    wholesalePrice: "650,000",
    discountwholesalePrice: "520,000",
    discount: "30%",
    discountwholesale: "20%",
    category: "عطر و ادکلن",
  },
  {
    id: 10,
    brand: "نیوآ",
    title: "کرم ضد آفتاب SPF 50+ حجم 50 میلی لیتر",
    image: "https://storage.khanoumi.com/ProductImages/LSNL100006-2024622124819951.jpg?w=130",
    originalPrice: "250,000",
    discountedPrice: "200,000",
    wholesalePrice: "180,000",
    discountwholesalePrice: "171,000",
    discount: "20%",
    discountwholesale: "5%",
    category: "مراقبت پوست",
  },
  {
    id: 11,
    brand: "گارنیر",
    title: "شامپو تقویت کننده موهای ضعیف حجم 400 میلی لیتر",
    image: "https://storage.khanoumi.com/ProductImages/06c20775369143469e025270cb4c8c91.jpg?w=130",
    originalPrice: "180,000",
    discountedPrice: "144,000",
    wholesalePrice: "130,000",
    discountwholesalePrice: "123,500",
    discount: "20%",
    discountwholesale: "5%",
    category: "مراقبت مو",
  },
  {
    id: 12,
    brand: "لورآل",
    title: "رژ لب مات سری Rouge Signature",
    image: "https://storage.khanoumi.com/ProductImages/36317-(2)-2024818154254290.jpg?w=130",
    originalPrice: "350,000",
    discountedPrice: "280,000",
    wholesalePrice: "260,000",
    discountwholesalePrice: "221,000",
    discount: "20%",
    discountwholesale: "15%",
    category: "آرایشی",
  },
  {
    id: 13,
    brand: "میبلین",
    title: "ریمل حجم دهنده Lash Sensational",
    image: "https://storage.khanoumi.com/ProductImages/_DSC9896-202553145317830.jpg?w=130",
    originalPrice: "290,000",
    discountedPrice: "232,000",
    wholesalePrice: "210,000",
    discountwholesalePrice: "178,500",
    discount: "20%",
    discountwholesale: "15%",
    category: "آرایشی",
  },
  {
    id: 14,
    brand: "اوریف لیم",
    title: "عطر مردانه Eclat Homme حجم 75 میلی لیتر",
    image: "https://storage.khanoumi.com/ProductImages/1-2025423161754498.jpg?w=130",
    originalPrice: "1,200,000",
    discountedPrice: "960,000",
    wholesalePrice: "900,000",
    discountwholesalePrice: "675,000",
    discount: "20%",
    discountwholesale: "25%",
    category: "عطر و ادکلن",
  },
  {
    id: 15,
    brand: "سفورا",
    title: "پالت سایه چشم Urban Decay Naked3",
    image: "https://storage.khanoumi.com/ProductImages/8202400005-20241020143719448.jpg?w=130",
    originalPrice: "2,500,000",
    discountedPrice: "2,000,000",
    wholesalePrice: "1,850,000",
    discountwholesalePrice: "1,387,500",
    discount: "20%",
    discountwholesale: "25%",
    category: "آرایشی",
  },
  {
    id: 16,
    brand: "دکتر ژیلا",
    title: "کرم دور چشم ضد چروک حجم 20 میلی لیتر",
    image: "https://storage.khanoumi.com/ProductImages/1-20241211974877.jpg?w=130",
    originalPrice: "320,000",
    discountedPrice: "256,000",
    wholesalePrice: "240,000",
    discountwholesalePrice: "216,000",
    discount: "20%",
    discountwholesale: "10%",
    category: "مراقبت پوست",
  },
  {
    id: 17,
    brand: "پنتن",
    title: "شامپو ضد ریزش مو حجم 350 میلی لیتر",
    image: "https://storage.khanoumi.com/ProductImages/1-20241211974877.jpg?w=130",
    originalPrice: "150,000",
    discountedPrice: "120,000",
    wholesalePrice: "110,000",
    discountwholesalePrice: "99,000",
    discount: "20%",
    discountwholesale: "10%",
    category: "مراقبت مو",
  },
  {
    id: 18,
    brand: "رولون",
    title: "لاک ناخن سری ColorStay",
    image: "https://storage.khanoumi.com/ProductImages/76350-2024810143222929.jpg?w=130",
    originalPrice: "200,000",
    discountedPrice: "160,000",
    wholesalePrice: "150,000",
    discountwholesalePrice: "142,500",
    discount: "20%",
    discountwholesale: "5%",
    category: "آرایشی",
  },
  {
    id: 19,
    brand: "کرید",
    title: "عطر Aventus حجم 100 میلی لیتر",
    image: "https://storage.khanoumi.com/ProductImages/DSC00012-202469163231910.jpg?w=130",
    originalPrice: "3,800,000",
    discountedPrice: "3,040,000",
    wholesalePrice: "2,800,000",
    discountwholesalePrice: "2,100,000",
    discount: "20%",
    discountwholesale: "25%",
    category: "عطر و ادکلن",
  },
  {
    id: 20,
    brand: "بیودرما",
    title: "میسلار واتر پاک کننده آرایش حجم 250 میلی لیتر",
    image: "https://storage.khanoumi.com/ProductImages/5666500020-202491110947692.jpg?w=130",
    originalPrice: "450,000",
    discountedPrice: "360,000",
    wholesalePrice: "330,000",
    discountwholesalePrice: "297,000",
    discount: "20%",
    discountwholesale: "10%",
    category: "مراقبت پوست",
  },
];

export default function ProductSliderContainer({
  vip = false,
}: {
  vip?: boolean;
}) {
  const swiperRef = useRef<{ swiper: SwiperCore } | null>(null);
  const [showPrev, setShowPrev] = useState(false);
  const [showNext, setShowNext] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [hoveredProductId, setHoveredProductId] = useState<number | null>(null);
  const [cartQuantities, setCartQuantities] = useState<{
    [key: number]: number;
  }>({});
  const [priceTypes, setPriceTypes] = useState<{
    [key: number]: "single" | "wholesale";
  }>({});

  useEffect(() => {
    const handleResize = () => {
      setIsSmallScreen(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const initialPriceTypes = productdata.reduce(
      (acc, product) => ({
        ...acc,
        [product.id]: "single",
      }),
      {}
    );
    setPriceTypes(initialPriceTypes);
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

  const handleMouseEnter = (productId: number) => {
    setHoveredProductId(productId);
  };

  const handleMouseLeave = () => {
    setHoveredProductId(null);
  };

  const handleQuantityChange = (productId: number, delta: number) => {
    setCartQuantities((prev) => {
      const newQuantity = (prev[productId] || 0) + delta;
      return { ...prev, [productId]: newQuantity < 0 ? 0 : newQuantity };
    });
  };

  const handlePriceTypeChange = (
    productId: number,
    type: "single" | "wholesale"
  ) => {
    setPriceTypes((prev) => ({ ...prev, [productId]: type }));
  };

  return (
    <>

      <div className={`psc-container ${vip ? "psc-vip" : ""}`}>
        <div className={`psc-header ${vip ? "psc-header-vip" : ""}`}>
          {!vip && <p className="psc-title">پرفروش‌ترین‌ها</p>}
          <Link
            href="/"
            className={`psc-view-all ${vip ? "psc-view-all-vip" : ""}`}
          >
            مشاهده همه
          </Link>
        </div>

        {showPrev && (
          <button
            onClick={goPrev}
            className={`psc-nav-button psc-prev-button ${
              vip && !isSmallScreen ? "psc-prev-button-vip" : ""
            }`}
          >
            <KeyboardArrowRight fontSize="large" />
          </button>
        )}
        {showNext && (
          <button
            onClick={goNext}
            className="psc-nav-button psc-next-button"
          >
            <KeyboardArrowLeft fontSize="large" />
          </button>
        )}

        <div className="psc-content">
          {vip && !isSmallScreen && (
            <div className="psc-vip-banner">
              <div className="psc-vip-banner-content">
                <h2 className="psc-vip-banner-title">% تخفیف ویژه %</h2>
              </div>
            </div>
          )}
          <div className="psc-swiper-container">
            <Swiper
              slidesPerView="auto"
              spaceBetween={12}
              onSwiper={(swiper) => {
                swiperRef.current = { swiper };
                updateNavigation();
              }}
              className="psc-swiper"
              breakpoints={{
                0: { slidesPerView: 2, spaceBetween: 8 },
                640: { slidesPerView: 3, spaceBetween: 10 },
                1024: { slidesPerView: 4, spaceBetween: 12 },
                1280: { slidesPerView: 5, spaceBetween: 12 },
              }}
            >
              {vip && isSmallScreen && (
                <SwiperSlide className="psc-vip-slide">
                  <div className="psc-vip-banner-mobile">
                    <h2 className="psc-vip-banner-title-mobile">
                      % تخفیف ویژه %
                    </h2>
                  </div>
                </SwiperSlide>
              )}
              {productdata.map((item) => (
                <SwiperSlide
                  key={item.id}
                  className="psc-product-slide"
                >
                  <div className="psc-product-card">
                    <img
                      src={item.image}
                      className="psc-product-image"
                      alt={item.title}
                    />
                    <h2 className="psc-product-title">{item.title}</h2>
                    <div className="psc-price-buttons">
                      <button
                        className={`psc-price-button ${
                          priceTypes[item.id] === "wholesale"
                            ? "psc-price-button-active"
                            : ""
                        }`}
                        onClick={() => handlePriceTypeChange(item.id, "wholesale")}
                      >
                        قیمت عمده
                      </button>
                      <button
                        className={`psc-price-button ${
                          priceTypes[item.id] === "single"
                            ? "psc-price-button-active"
                            : ""
                        }`}
                        onClick={() => handlePriceTypeChange(item.id, "single")}
                      >
                        قیمت تکی
                      </button>
                    </div>
                    <div className="psc-price-discount-container">
                      <p className="psc-price-strikethrough-text">
                        {priceTypes[item.id] === "single" ? item.originalPrice : item.wholesalePrice}
                      </p>
                      <p className="psc-discount-badge">
                        {priceTypes[item.id] === "single" ? item.discount : item.discountwholesale}
                      </p>
                    </div>
                    <div className="psc-price-quantity">
                      <p className="psc-price">
                        {priceTypes[item.id] === "single"
                          ? item.discountedPrice
                          : item.discountwholesalePrice}{" "}
                        تومان
                      </p>
                      <div className="psc-quantity-selector-mobile">
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                        >
                          <AddCircleOutline fontSize="small" />
                        </button>
                        <input
                          type="text"
                          className="psc-quantity-input"
                          value={cartQuantities[item.id] || 0}
                          readOnly
                        />
                        <button
                          onClick={() => handleQuantityChange(item.id, -1)}
                        >
                          <RemoveCircleOutline fontSize="small" />
                        </button>
                      </div>
                      <button
                        className="psc-add-to-cart"
                        onMouseEnter={() => handleMouseEnter(item.id)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <AddShoppingCart fontSize="small" />
                      </button>
                      {hoveredProductId === item.id && (
                        <div className="psc-quantity-selector">
                          <button
                            onClick={() => handleQuantityChange(item.id, 1)}
                          >
                            <AddCircleOutline fontSize="small" />
                          </button>
                          <input
                            type="text"
                            className="psc-quantity-input"
                            value={cartQuantities[item.id] || 0}
                            readOnly
                          />
                          <button
                            onClick={() => handleQuantityChange(item.id, -1)}
                          >
                            <RemoveCircleOutline fontSize="small" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </>
  );
}