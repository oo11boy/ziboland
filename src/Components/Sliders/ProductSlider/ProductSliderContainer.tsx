"use client";
import { useRef, useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Swiper as SwiperCore } from "swiper";
import "swiper/css";
import Link from "next/link";
import "./../Sliders.css";
import "./ProductSlider.css";
import {
  KeyboardArrowLeft,
  AddCircleOutline,
  RemoveCircleOutline,
  AddShoppingCart,
} from "@mui/icons-material";
import { Product, Color } from "@/types/types";
import { useCart } from "@/ContextApi/CartContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatPrice } from "@/Components/Utils/formatPrice";

export default function ProductSliderContainer({
  vip = false,
}: {
  vip?: boolean;
}) {
  const swiperRef = useRef<{ swiper: SwiperCore } | null>(null);
  const { dispatch } = useCart();
  const [showNext, setShowNext] = useState(true);
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [cartQuantities, setCartQuantities] = useState<{
    [key: number]: number;
  }>({});
  const [showQuantitySelector, setShowQuantitySelector] = useState<
    number | null
  >(null);
  const [priceTypes, setPriceTypes] = useState<{
    [key: number]: "single" | "wholesale";
  }>({});
  const [selectedColors, setSelectedColors] = useState<{
    [key: number]: Color | null;
  }>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  // دریافت محصولات از API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("خطا در دریافت محصولات");
        const data: Product[] = await response.json();
        setProducts(data);
      } catch (err) {
        setError("خطا در بارگذاری محصولات. لطفاً دوباره تلاش کنید.");
        console.error(err);
      }
    };
    fetchProducts();
  }, []);

  // تنظیمات اولیه برای priceTypes و selectedColors
  useEffect(() => {
    const initialPriceTypes = products.reduce(
      (acc, product) => ({ ...acc, [product.id]: "single" }),
      {}
    );
    setPriceTypes(initialPriceTypes);

    const initialSelectedColors = products.reduce(
      (acc, product) => ({
        ...acc,
        [product.id]:
          product.colors && product.colors.length > 0
            ? product.colors[0]
            : null,
      }),
      {}
    );
    setSelectedColors(initialSelectedColors);
  }, [products]);

  // مدیریت اندازه صفحه
  useEffect(() => {
    const handleResize = () => setIsSmallScreen(window.innerWidth < 1024);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const goNext = () => {
    if (swiperRef.current?.swiper) {
      swiperRef.current.swiper.slideNext();
      setShowNext(false);
    }
  };

  const updateNavigation = () => {
    if (swiperRef.current?.swiper) {
      const swiper = swiperRef.current.swiper;
      setShowNext(swiper.isBeginning);
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

  const handleShowQuantitySelector = (productId: number) => {
    setShowQuantitySelector(
      showQuantitySelector === productId ? null : productId
    );
  };

  const handleQuantityChange = (productId: number, delta: number) => {
    setCartQuantities((prev) => {
      const newQuantity = (prev[productId] || 0) + delta;
      const product = products.find((p) => p.id === productId);

      if (!product) return prev;

      // تنظیم خودکار نوع قیمت
      if (newQuantity >= product.minwholesale) {
        handlePriceTypeChange(productId, "wholesale");
      } else {
        handlePriceTypeChange(productId, "single");
      }

      return { ...prev, [productId]: newQuantity < 0 ? 0 : newQuantity };
    });
  };

  const handlePriceTypeChange = (
    productId: number,
    type: "single" | "wholesale"
  ) => {
    setPriceTypes((prev) => ({ ...prev, [productId]: type }));
  };

  const handleColorSelect = (productId: number, color: Color) => {
    setSelectedColors((prev) => ({ ...prev, [productId]: color }));
  };

  const getContrastColor = (hexCode: string) => {
    const hex = hexCode.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5
      ? { tickColor: "#0000004d", borderColor: "#FFFFFF" }
      : { tickColor: "#FFFFFF", borderColor: "#0000004d" };
  };

  const handleAddToCart = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (
      !product ||
      !cartQuantities[productId] ||
      cartQuantities[productId] < 1
    ) {
      toast.error("لطفاً تعداد محصول را انتخاب کنید", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      return;
    }

    if (!product.inStock) {
      toast.error("محصول موجود نیست", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      return;
    }

    const quantity = cartQuantities[productId];
    const priceType = priceTypes[productId] || "single";
    const price =
      priceType === "single"
        ? product.discountedPrice
        : product.discountwholesalePrice;
    const discount =
      priceType === "single" ? product.discount : product.discountwholesale;
    const selectedColor = selectedColors[productId];

    if (priceType === "wholesale" && quantity < product.minwholesale) {
      toast.error(
        `حداقل تعداد برای قیمت عمده ${product.minwholesale} عدد است.`,
        {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        }
      );
      return;
    }

    try {
      dispatch({
        type: "ADD_ITEM",
        payload: {
          id: productId,
          title: product.title,
          quantity,
          priceType,
          price: price.toString(),
          image: product.image || "/placeholder.jpg",
          discount,
          color: selectedColor, // اضافه کردن رنگ انتخاب شده
        },
      });

      toast.success("محصول به سبد خرید اضافه شد!", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });

      setCartQuantities((prev) => ({ ...prev, [productId]: 0 }));
      setShowQuantitySelector(null);
    } catch (error) {
      toast.error("خطا در اضافه کردن محصول به سبد خرید", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      console.error("Error adding to cart:", error);
    }
  };

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className={`psc-container ${vip ? "psc-vip" : ""}`}>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <div className={`psc-header ${vip ? "psc-header-vip" : ""}`}>
        {!vip && <p className="psc-title">پرفروش‌ترین‌ها</p>}
        <Link
          href="../search"
          className={`psc-view-all ${vip ? "psc-view-all-vip" : ""}`}
        >
          مشاهده همه
        </Link>
      </div>

      {showNext && (
        <button onClick={goNext} className="psc-nav-button psc-next-button">
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
            {products.map((item) => {
              const selectedColor = selectedColors[item.id];
              return (
                <SwiperSlide key={item.id} className="psc-product-slide">
                  <div className="tpsc-product-card">
                    {priceTypes[item.id] === "wholesale" && (
                      <div className="absolute top-[2px] left-[2px] bg-[#c7c7c7] py-1 px-2 rounded-sm text-[11px] flex items-center">
                        <p className="ml-1">+</p>
                        <p>{item.minwholesale} عدد</p>
                      </div>
                    )}
                    <img
                      src={item.image || "/placeholder.jpg"}
                      className="tpsc-product-image"
                      alt={item.title}
                    />
                    <Link
                      href={`../products/${item.id}`}
                      className="tpsc-product-title"
                    >
                      {item.title}
                    </Link>
                    <div className="tpsc-price-buttons">
                      <button
                        className={`tpsc-price-button ${
                          priceTypes[item.id] === "wholesale"
                            ? "tpsc-price-button-active"
                            : ""
                        }`}
                        onClick={() =>
                          handlePriceTypeChange(item.id, "wholesale")
                        }
                      >
                        قیمت عمده
                      </button>
                      <button
                        className={`tpsc-price-button ${
                          priceTypes[item.id] === "single"
                            ? "tpsc-price-button-active"
                            : ""
                        }`}
                        onClick={() => handlePriceTypeChange(item.id, "single")}
                      >
                        قیمت تکی
                      </button>
                    </div>

                    {item.colors && item.colors.length > 0 && (
                      <div className="inline-block bg-gray-500  justify-right p-1 rounded-3xl my-2 items-center">
                        <div className=" flex gap-2 justify-center items-center ">
                          {item.colors.map((color) => {
                            const { tickColor, borderColor } = getContrastColor(
                              color.hexCode
                            );
                            return (
                              <button
                                key={color.englishName}
                                onClick={() =>
                                  handleColorSelect(item.id, color)
                                }
                                style={{
                                  backgroundColor: color.hexCode,
                                  width: "16px",
                                  height: "16px",
                                  borderRadius: "50%",
                                  border:
                                    selectedColor?.englishName ===
                                    color.englishName
                                      ? "2px solid #805b99"
                                      : "1px solid #d1d5db",
                                  outline:
                                    selectedColor?.englishName ===
                                    color.englishName
                                      ? "2px solid #e9d5ff"
                                      : "none",
                                  cursor: "pointer",
                                  transition: "all 0.2s ease",
                                  position: "relative",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  marginRight: "2px",
                                }}
                                className="sp-color-button tpsc-color-button-quick"
                                aria-label={`انتخاب رنگ ${color.persianName} (${color.englishName})`}
                              >
                                {selectedColor?.englishName ===
                                  color.englishName && (
                                  <span
                                    style={{
                                      color: tickColor,
                                      fontSize: "6px",
                                      fontWeight: "bold",
                                      backgroundColor: borderColor,
                                      borderRadius: "50%",
                                      width: "10px",
                                      height: "10px",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      position: "absolute",
                                    }}
                                  >
                                    ✔
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    {item.discount == "0" && item.discountwholesale == "0" ? (
                      ""
                    ) : (
                      <div className="tpsc-price-discount-container">
                        <p className="tpsc-price-strikethrough-text">
                          {formatPrice(
                            priceTypes[item.id] === "single"
                              ? item.originalPrice
                              : item.wholesalePrice
                          )}
                        </p>
                        <p className="tpsc-discount-badge">
                          {priceTypes[item.id] === "single"
                            ? item.discount
                            : item.discountwholesale}
                        </p>
                      </div>
                    )}

                    <div className="tpsc-price-quantity">
                      <p className="tpsc-price">
                        {formatPrice(
                          priceTypes[item.id] === "single"
                            ? item.discountedPrice
                            : item.discountwholesalePrice
                        )}{" "}
                        تومان
                      </p>
                      <div className="tpsc-quantity-selector-mobile relative">
                        {cartQuantities[item.id] > 0 && (
                          <button
                            className="-top-[20px] h-[20px] left-0 bg-[#c7c7c7] text-[11px] px-2 rounded-tr-lg absolute"
                            onClick={() => handleAddToCart(item.id)}
                          >
                            ثبت
                          </button>
                        )}
                        <button
                          onClick={() => handleQuantityChange(item.id, 1)}
                        >
                          <AddCircleOutline fontSize="small" />
                        </button>
                        <input
                          type="text"
                          className="tpsc-quantity-input"
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
                        className="tpsc-add-to-cart"
                        onClick={() => handleShowQuantitySelector(item.id)}
                      >
                        <AddShoppingCart fontSize="small" />
                      </button>
                      {showQuantitySelector === item.id && (
                        <div
                          className="tpsc-quantity-selector relative"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => handleQuantityChange(item.id, 1)}
                          >
                            <AddCircleOutline fontSize="small" />
                          </button>
                          <input
                            type="text"
                            className="tpsc-quantity-input"
                            value={cartQuantities[item.id] || 0}
                            readOnly
                          />
                          <button
                            onClick={() => handleQuantityChange(item.id, -1)}
                          >
                            <RemoveCircleOutline fontSize="small" />
                          </button>
                          {cartQuantities[item.id] > 0 && (
                            <button
                              className="tpsc-confirm-button absolute w-[40px] text-[10px] -top-[25px] left-0 bg-black px-1 rounded-tr-lg text-white h-[30px]"
                              onClick={() => {
                                handleAddToCart(item.id);
                                handleShowQuantitySelector(item.id);
                              }}
                            >
                              ثبت
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </div>
  );
}
