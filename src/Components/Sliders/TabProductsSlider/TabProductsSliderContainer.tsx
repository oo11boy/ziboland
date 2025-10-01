"use client";
import { useState, useRef, useEffect } from "react";
import { Swiper as SwiperCore } from "swiper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "./../Sliders.css";
import "./TabProductSlider.css";
import {
  AddCircleOutline,
  AddShoppingCart,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  RemoveCircleOutline,
  VisibilitySharp,
} from "@mui/icons-material";
import Link from "next/link";
import { Product, Color } from "@/types/types";
import { useCart } from "@/ContextApi/CartContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tpsc-tabpanel-${index}`}
      aria-labelledby={`tpsc-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ paddingTop: { xs: "16px", md: "24px" }, paddingBottom: { xs: "16px", md: "24px" } }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `tpsc-tab-${index}`,
    "aria-controls": `tpsc-tabpanel-${index}`,
  };
}

export default function TabProductsSliderContainer({ title }: { title: string }) {
  const [value, setValue] = useState(0);
  const { dispatch } = useCart();
  const [cartQuantities, setCartQuantities] = useState<{ [key: number]: number }>({});
  const [priceTypes, setPriceTypes] = useState<{ [key: number]: "single" | "wholesale" }>({});
  const [selectedColors, setSelectedColors] = useState<{ [key: number]: Color | null }>({});
  const [showQuantitySelector, setShowQuantitySelector] = useState<number | null>(null);
  const swiperRefs = useRef<{ [key: number]: { swiper: SwiperCore } | null }>({});
  const [navStates, setNavStates] = useState<{ [key: number]: { showPrev: boolean; showNext: boolean; isBeginning: boolean } }>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  // دریافت محصولات از API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("خطا در دریافت محصولات");
        const data: Product[] = await response.json();

        let sortedProducts = data;
        if (title === "محبوبترین ها") {
          sortedProducts = [...data].sort((a, b) => b.rating - a.rating);
        } else if (title === "ارزانترین ها") {
          sortedProducts = [...data].sort((a, b) => a.numericPrice - b.numericPrice);
        } else if (title === "جدیدترین ها") {
          sortedProducts = [...data].sort((a, b) => b.id - a.id);
        }
        setProducts(sortedProducts);
      } catch (err) {
        setError("خطا در بارگذاری محصولات. لطفاً دوباره تلاش کنید.");
        console.error(err);
      }
    };
    fetchProducts();
  }, [title]);

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
        [product.id]: product.colors && product.colors.length > 0 ? product.colors[0] : null,
      }),
      {}
    );
    setSelectedColors(initialSelectedColors);
  }, [products]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleShowQuantitySelector = (productId: number) => {
    setShowQuantitySelector(showQuantitySelector === productId ? null : productId);
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

  const handlePriceTypeChange = (productId: number, type: "single" | "wholesale") => {
    setPriceTypes((prev) => ({ ...prev, [productId]: type }));
  };

  const handleColorSelect = (productId: number, color: Color) => {
    setSelectedColors((prev) => ({ ...prev, [productId]: color }));
  };

  const getContrastColor = (hexCode: string) => {
    const hex = hexCode.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? { tickColor: '#0000004d', borderColor: '#FFFFFF' } : { tickColor: '#FFFFFF', borderColor: '#0000004d' };
  };

  const handleAddToCart = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product || !cartQuantities[productId] || cartQuantities[productId] < 1) {
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
    const price = priceType === "single" ? product.discountedPrice : product.discountwholesalePrice;
    const discount = priceType === "single" ? product.discount : product.discountwholesale;
    const selectedColor = selectedColors[productId];

    if (priceType === "wholesale" && quantity < product.minwholesale) {
      toast.error(`حداقل تعداد برای قیمت عمده ${product.minwholesale} عدد است.`, {
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

  const updateNavigation = (index: number) => {
    if (swiperRefs.current[index]?.swiper) {
      const swiper = swiperRefs.current[index].swiper;
      setNavStates((prev) => ({
        ...prev,
        [index]: {
          showPrev: !swiper.isBeginning,
          showNext: !swiper.isEnd,
          isBeginning: swiper.isBeginning,
        },
      }));
    }
  };

  const goNext = (index: number) => {
    if (swiperRefs.current[index]?.swiper) {
      swiperRefs.current[index].swiper.slideNext();
    }
  };

  const goPrev = (index: number) => {
    if (swiperRefs.current[index]?.swiper) {
      swiperRefs.current[index].swiper.slidePrev();
    }
  };

  useEffect(() => {
    categories.forEach((_, index) => {
      if (swiperRefs.current[index]?.swiper) {
        const swiper = swiperRefs.current[index].swiper;
        swiper.on("slideChange", () => updateNavigation(index));
        updateNavigation(index);
      }
    });

    return () => {
      categories.forEach((_, index) => {
        if (swiperRefs.current[index]?.swiper) {
          swiperRefs.current[index].swiper.off("slideChange", () => updateNavigation(index));
        }
      });
    };
  }, [products]);

  const categoryCounts = products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const categories = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a]);

  const productsByCategory = categories.map((category) =>
    products.filter((product) => product.category === category)
  );

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="tpsc-container">
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
      <div className="tpsc-header">
        <p className="tpsc-title">{title}</p>
        <Link href="../search" className="tpsc-view-all">
          <VisibilitySharp fontSize="inherit" className="tpsc-view-all-icon" />
          مشاهده همه
        </Link>
      </div>
      <Box sx={{ width: "100%", position: "relative" }}>
        <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="product categories tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTabs-flexContainer": { gap: { xs: "0.5rem", sm: "1rem" } },
              "& .MuiTab-root": {
                fontSize: { xs: "0.65rem", sm: "0.75rem", md: "0.85rem" },
                fontWeight: "bold",
                color: "#555",
                fontFamily: "yekannew",
                padding: { xs: "4px 8px", sm: "6px 12px" },
                minWidth: { xs: "60px", sm: "80px", md: "100px" },
                minHeight: { xs: "24px", sm: "28px", md: "32px" },
              },
              "& .Mui-selected": { color: "#000 !important", borderRadius: 2, backgroundColor: "#c7c7c7" },
              "& .MuiTabs-indicator": { display: "none" },
            }}
          >
            {categories.map((category, index) => (
              <Tab key={index} label={category} {...a11yProps(index)} />
            ))}
          </Tabs>
        </Box>
        {categories.map((category, index) => (
          <CustomTabPanel key={index} value={value} index={index}>
            <Swiper
              modules={[Navigation]}
              spaceBetween={8}
              slidesPerView={2}
              breakpoints={{
                400: { slidesPerView: 2, spaceBetween: 8 },
                500: { slidesPerView: 3, spaceBetween: 10 },
                768: { slidesPerView: 4, spaceBetween: 12 },
                1024: { slidesPerView: 5, spaceBetween: 14 },
                1280: { slidesPerView: 7, spaceBetween: 16 },
              }}
              className="tpsc-swiper"
              onSwiper={(swiper) => {
                swiperRefs.current[index] = { swiper };
                updateNavigation(index);
              }}
            >
              {productsByCategory[index].map((item) => {
                const selectedColor = selectedColors[item.id];
                return (
                  <SwiperSlide key={item.id} style={{ width: "auto" }}>
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
                      <Link href={`../products/${item.id}`} className="tpsc-product-title">
                        {item.title}
                      </Link>
                      <div className="tpsc-price-buttons">
                        <button
                          className={`tpsc-price-button ${
                            priceTypes[item.id] === "wholesale" ? "tpsc-price-button-active" : ""
                          }`}
                          onClick={() => handlePriceTypeChange(item.id, "wholesale")}
                        >
                          قیمت عمده
                        </button>
                        <button
                          className={`tpsc-price-button ${
                            priceTypes[item.id] === "single" ? "tpsc-price-button-active" : ""
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
                              const { tickColor, borderColor } = getContrastColor(color.hexCode);
                              return (
                                <button
                                  key={color.englishName}
                                  onClick={() => handleColorSelect(item.id, color)}
                                  style={{
                                    backgroundColor: color.hexCode,
                                    width: '16px',
                                    height: '16px',
                                    borderRadius: '50%',
                                    border: selectedColor?.englishName === color.englishName ? '2px solid #805b99' : '1px solid #d1d5db',
                                    outline: selectedColor?.englishName === color.englishName ? '2px solid #e9d5ff' : 'none',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '2px',
                                  }}
                                  className="sp-color-button tpsc-color-button-quick"
                                  aria-label={`انتخاب رنگ ${color.persianName} (${color.englishName})`}
                                >
                                  {selectedColor?.englishName === color.englishName && (
                                    <span
                                      style={{
                                        color: tickColor,
                                        fontSize: '6px',
                                        fontWeight: 'bold',
                                        backgroundColor: borderColor,
                                        borderRadius: '50%',
                                        width: '10px',
                                        height: '10px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        position: 'absolute',
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
                      
                      <div className="tpsc-price-discount-container">
                                    {
              item.discount=='0' && item.discountwholesale=='0' ? '' :<div className="tpsc-price-discount-container">
                      <p className="tpsc-price-strikethrough-text">
                        {priceTypes[item.id] === "single" ? item.originalPrice : item.wholesalePrice}
                      </p>
                      <p className="tpsc-discount-badge">
                        {priceTypes[item.id] === "single" ? item.discount : item.discountwholesale}
                      </p>
                    </div>
            }
                       
                      </div>
                      <div className="tpsc-price-quantity">
                  
                        <p className="tpsc-price">
                          {priceTypes[item.id] === "single" ? item.discountedPrice : item.discountwholesalePrice} تومان
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
                          <button onClick={() => handleQuantityChange(item.id, 1)}>
                            <AddCircleOutline fontSize="small" />
                          </button>
                          <input
                            type="text"
                            className="tpsc-quantity-input"
                            value={cartQuantities[item.id] || 0}
                            readOnly
                          />
                          <button onClick={() => handleQuantityChange(item.id, -1)}>
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
                            <button onClick={() => handleQuantityChange(item.id, 1)}>
                              <AddCircleOutline fontSize="small" />
                            </button>
                            <input
                              type="text"
                              className="tpsc-quantity-input"
                              value={cartQuantities[item.id] || 0}
                              readOnly
                            />
                            <button onClick={() => handleQuantityChange(item.id, -1)}>
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
          </CustomTabPanel>
        ))}
        {navStates[value]?.isBeginning && (
          <button onClick={() => goNext(value)} className="tpsc-nav-button tpsc-next-button tpsc-next-button-mobile">
            <KeyboardArrowLeft fontSize="medium" />
          </button>
        )}
        {navStates[value]?.showPrev && (
          <button onClick={() => goPrev(value)} className="tpsc-nav-button tpsc-prev-button tpsc-prev-button-desktop">
            <KeyboardArrowRight fontSize="medium" />
          </button>
        )}
        {navStates[value]?.showNext && (
          <button onClick={() => goNext(value)} className="tpsc-nav-button tpsc-next-button tpsc-next-button-desktop">
            <KeyboardArrowLeft fontSize="medium" />
          </button>
        )}
      </Box>
    </div>
  );
}