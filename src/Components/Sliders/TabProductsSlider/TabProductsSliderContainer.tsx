"use client";
import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./../Sliders.css";
import Link from "next/link";
import { Swiper as SwiperCore } from "swiper";
import {
  AddCircleOutline,
  AddShoppingCart,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  RemoveCircleOutline,
  VisibilitySharp,
} from "@mui/icons-material";
// Add this CSS for custom styling (place in Sliders.css or a new CSS file)
const customStyles = `
  .scroll-title {
    overflow-y: auto;
    max-height: 48px;
    scrollbar-width: thin;
    scrollbar-color: #805B99 #EBEBEB;
  }
  .scroll-title::-webkit-scrollbar {
    width: 4px;
  }
  .scroll-title::-webkit-scrollbar-track {
    background: #EBEBEB;
  }
  .scroll-title::-webkit-scrollbar-thumb {
    background: #805B99;
    border-radius: 4px;
  }
  .price-strikethrough {
    text-decoration: line-through;
    color: #999;
  }
  .quantity-selector {
    transition: opacity 0.2s ease-in-out;
  }
`;

// Append to your Sliders.css
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = customStyles;
  document.head.appendChild(styleSheet);
}

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
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: { xs: 2, md: 3 } }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export const productdata = [
  {
    id: 1,
    brand: "پیکسل",
    title: "ضد آفتاب بدون رنگ مناسب پوست های جوش دار و چرب حجم 50 میلی لیتر",
    image:
      "https://storage.khanoumi.com/ProductImages/5666500020-202491110947692.jpg?w=104",
    originalPrice: "479,000",
    discountedPrice: "431,100",
    wholesalePrice: "400,000",
    discount: "10%",
    category: "مراقبت پوست",
  },
  {
    id: 2,
    brand: "مورینگا",
    title: "سرم ضد چروک صورت حجم 55 میلی لیتر",
    image:
      "https://storage.khanoumi.com/ProductImages/49631-2024619172532356.jpg?w=104",
    originalPrice: "389,400",
    discountedPrice: "298,900",
    wholesalePrice: "270,000",
    discount: "23%",
    category: "مراقبت پوست",
  },
  {
    id: 3,
    brand: "پرایم",
    title: "کرم مرطوب کننده 24 ساعته",
    image:
      "https://storage.khanoumi.com/ProductImages/00-2024415162411605.jpg?w=104",
    originalPrice: "597,000",
    discountedPrice: "537,300",
    wholesalePrice: "500,000",
    discount: "10%",
    category: "مراقبت پوست",
  },
  {
    id: 4,
    brand: "لافارر",
    title:
      "ژل شستشو صورت مدل لایه بردار شماره 1 مناسب پوست چرب و مستعد آکنه حجم 150 میلی لیتر",
    image:
      "https://storage.khanoumi.com/ProductImages/ییث-2024123184526759.jpg?w=104",
    originalPrice: "631,900",
    discountedPrice: "568,710",
    wholesalePrice: "530,000",
    discount: "10%",
    category: "مراقبت پوست",
  },
  {
    id: 5,
    brand: "تکنو درای",
    title: "سشوار حرفه ای مدل Tornado 6000",
    image:
      "https://storage.khanoumi.com/ProductImages/82911-2024122215532624.jpg?w=104",
    originalPrice: "4,510,000",
    discountedPrice: "4,370,000",
    wholesalePrice: "4,100,000",
    discount: "3%",
    category: "مراقبت مو",
  },
  {
    id: 6,
    brand: "دیفکتو",
    title: "ژل ابرو ژلی کاسه ای 25ml",
    image:
      "https://storage.khanoumi.com/ProductImages/71279-2025414155838450.jpg?w=104",
    originalPrice: "177,000",
    discountedPrice: "123,900",
    wholesalePrice: "110,000",
    discount: "30%",
    category: "مراقبت مو",
  },
  {
    id: 7,
    brand: "کلاژینو",
    title: "ساشه Collagen Beauty بسته 30 عددی",
    image:
      "https://storage.khanoumi.com/ProductImages/77211-2025414161656479.jpg?w=104",
    originalPrice: "1,081,800",
    discountedPrice: "749,000",
    wholesalePrice: "700,000",
    discount: "31%",
    category: "مراقبت پوست",
  },
  {
    id: 8,
    brand: "تاپ شاپ",
    title: "ماسک مو با آب کشی حاوی روغن آرگان حجم 500 میلی لیتر",
    image:
      "https://storage.khanoumi.com/ProductImages/DSC00012-202469163231910.jpg?w=104",
    originalPrice: "557,900",
    discountedPrice: "502,110",
    wholesalePrice: "470,000",
    discount: "10%",
    category: "مراقبت مو",
  },
  {
    id: 9,
    brand: "هات لاو",
    title: "ادو پرفیوم زنانه مدل Victoria Secret Bombshell حجم 100 میلی لیتر",
    image:
      "https://storage.khanoumi.com/ProductImages/Birsen-3P-Retinol-Serum-30-ml-2024115141356583.jpg?w=130",
    originalPrice: "990,000",
    discountedPrice: "689,000",
    wholesalePrice: "650,000",
    discount: "30%",
    category: "عطر و ادکلن",
  },
  {
    id: 10,
    brand: "نیوآ",
    title: "کرم ضد آفتاب SPF 50+ حجم 50 میلی لیتر",
    image:
      "https://storage.khanoumi.com/ProductImages/LSNL100006-2024622124819951.jpg?w=130",
    originalPrice: "250,000",
    discountedPrice: "200,000",
    wholesalePrice: "180,000",
    discount: "20%",
    category: "مراقبت پوست",
  },
  {
    id: 11,
    brand: "گارنیر",
    title: "شامپو تقویت کننده موهای ضعیف حجم 400 میلی لیتر",
    image:
      "https://storage.khanoumi.com/ProductImages/06c20775369143469e025270cb4c8c91.jpg?w=130",
    originalPrice: "180,000",
    discountedPrice: "144,000",
    wholesalePrice: "130,000",
    discount: "20%",
    category: "مراقبت مو",
  },
  {
    id: 12,
    brand: "لورآل",
    title: "رژ لب مات سری Rouge Signature",
    image:
      "https://storage.khanoumi.com/ProductImages/36317-(2)-2024818154254290.jpg?w=130",
    originalPrice: "350,000",
    discountedPrice: "280,000",
    wholesalePrice: "260,000",
    discount: "20%",
    category: "آرایشی",
  },
  {
    id: 13,
    brand: "میبلین",
    title: "ریمل حجم دهنده Lash Sensational",
    image:
      "https://storage.khanoumi.com/ProductImages/_DSC9896-202553145317830.jpg?w=130",
    originalPrice: "290,000",
    discountedPrice: "232,000",
    wholesalePrice: "210,000",
    discount: "20%",
    category: "آرایشی",
  },
  {
    id: 14,
    brand: "اوریف لیم",
    title: "عطر مردانه Eclat Homme حجم 75 میلی لیتر",
    image:
      "https://storage.khanoumi.com/ProductImages/1-2025423161754498.jpg?w=130",
    originalPrice: "1,200,000",
    discountedPrice: "960,000",
    wholesalePrice: "900,000",
    discount: "20%",
    category: "عطر و ادکلن",
  },
  {
    id: 15,
    brand: "سفورا",
    title: "پالت سایه چشم Urban Decay Naked3",
    image:
      "https://storage.khanoumi.com/ProductImages/8202400005-20241020143719448.jpg?w=130",
    originalPrice: "2,500,000",
    discountedPrice: "2,000,000",
    wholesalePrice: "1,850,000",
    discount: "20%",
    category: "آرایشی",
  },
  {
    id: 16,
    brand: "دکتر ژیلا",
    title: "کرم دور چشم ضد چروک حجم 20 میلی لیتر",
    image:
      "https://storage.khanoumi.com/ProductImages/1-20241211974877.jpg?w=130",
    originalPrice: "320,000",
    discountedPrice: "256,000",
    wholesalePrice: "240,000",
    discount: "20%",
    category: "مراقبت پوست",
  },
  {
    id: 17,
    brand: "پنتن",
    title: "شامپو ضد ریزش مو حجم 350 میلی لیتر",
    image:
      "https://storage.khanoumi.com/ProductImages/1-20241211974877.jpg?w=130",
    originalPrice: "150,000",
    discountedPrice: "120,000",
    wholesalePrice: "110,000",
    discount: "20%",
    category: "مراقبت مو",
  },
  {
    id: 18,
    brand: "رولون",
    title: "لاک ناخن سری ColorStay",
    image:
      "https://storage.khanoumi.com/ProductImages/76350-2024810143222929.jpg?w=130",
    originalPrice: "200,000",
    discountedPrice: "160,000",
    wholesalePrice: "150,000",
    discount: "20%",
    category: "آرایشی",
  },
  {
    id: 19,
    brand: "کرید",
    title: "عطر Aventus حجم 100 میلی لیتر",
    image:
      "https://storage.khanoumi.com/ProductImages/DSC00012-202469163231910.jpg?w=130",
    originalPrice: "3,800,000",
    discountedPrice: "3,040,000",
    wholesalePrice: "2,800,000",
    discount: "20%",
    category: "عطر و ادکلن",
  },
  {
    id: 20,
    brand: "بیودرما",
    title: "میسلار واتر پاک کننده آرایش حجم 250 میلی لیتر",
    image:
      "https://storage.khanoumi.com/ProductImages/5666500020-202491110947692.jpg?w=130",
    originalPrice: "450,000",
    discountedPrice: "360,000",
    wholesalePrice: "330,000",
    discount: "20%",
    category: "مراقبت پوست",
  },
];

export default function TabProductsSliderContainer({
  title,
}: {
  title: string;
}) {
  const [value, setValue] = React.useState(0);
  const [hoveredProductId, setHoveredProductId] = React.useState<number | null>(
    null
  );
  const [cartQuantities, setCartQuantities] = React.useState<{
    [key: number]: number;
  }>({});
  const [priceTypes, setPriceTypes] = React.useState<{
    [key: number]: "single" | "wholesale";
  }>({});
  const swiperRefs = React.useRef<{
    [key: number]: { swiper: SwiperCore } | null;
  }>({});
  const [navStates, setNavStates] = React.useState<{
    [key: number]: { showPrev: boolean; showNext: boolean };
  }>({});

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

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

  const updateNavigation = (index: number) => {
    if (swiperRefs.current[index]?.swiper) {
      const swiper = swiperRefs.current[index].swiper;
      setNavStates((prev) => ({
        ...prev,
        [index]: {
          showPrev: !swiper.isBeginning,
          showNext: !swiper.isEnd,
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

  React.useEffect(() => {
    // Set default price type to single for all products
    const initialPriceTypes = productdata.reduce(
      (acc, product) => ({
        ...acc,
        [product.id]: "single",
      }),
      {}
    );
    setPriceTypes(initialPriceTypes);

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
          swiperRefs.current[index].swiper.off("slideChange", () =>
            updateNavigation(index)
          );
        }
      });
    };
  }, []);

  const categories = Array.from(
    new Set(productdata.map((product) => product.category))
  );
  const productsByCategory = categories.map((category) =>
    productdata.filter((product) => product.category === category)
  );

  return (
    <div className="w-full max-w-[95%] mx-auto my-4 md:my-6 bg-white rounded-lg p-2 sm:p-4 relative yekan">
      <div className="w-full mb-4 sm:mb-6 mt-2 flex items-center justify-between">
        <p className="font-semibold yekanh text-sm sm:text-base md:text-lg lg:text-xl">
          {title}
        </p>
        <Link
          href="/"
          className="flex items-center text-xs sm:text-sm gap-1 sm:gap-2 px-2 sm:px-3 py-1 text-black bg-gray-200 border border-[#d1d5dc] rounded-full shadow-sm hover:bg-gray-300 hover:shadow-md transition-all duration-300"
          style={{
            backgroundImage: "linear-gradient(to right, #f3f4f6, #e5e7eb)",
          }}
        >
          <VisibilitySharp fontSize="inherit" className="text-gray-600" />
          مشاهده همه
        </Link>
      </div>
      <Box sx={{ width: "100%" }}>
        <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="product categories tabs"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTabs-flexContainer": {
                gap: { xs: "0.5rem", sm: "1rem" },
              },
              "& .MuiTab-root": {
                fontSize: { xs: "0.65rem", sm: "0.75rem", md: "0.85rem" },
                fontWeight: "bold",
                color: "#555",
                fontFamily: "yekannew",
                padding: { xs: "4px 8px", sm: "6px 12px" },
                minWidth: { xs: "60px", sm: "80px", md: "100px" },
                minHeight: { xs: "24px", sm: "28px", md: "32px" },
              },
              "& .Mui-selected": {
                color: "#000 !important",
                borderRadius: 2,
                backgroundColor: "#c7c7c7",
              },
              "& .MuiTabs-indicator": {
                display: "none",
              },
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
                320: { slidesPerView: 2, spaceBetween: 8 },
                400: { slidesPerView: 3, spaceBetween: 10 },
                768: { slidesPerView: 4, spaceBetween: 12 },
                1024: { slidesPerView: 5, spaceBetween: 14 },
                1280: { slidesPerView: 7, spaceBetween: 16 },
              }}
              navigation={false}
              className="mySwiper"
              onSwiper={(swiper) => {
                swiperRefs.current[index] = { swiper };
                updateNavigation(index);
              }}
            >
              {productsByCategory[index].map((item) => (
                <SwiperSlide key={item.id} style={{ width: "auto" }}>
                  <div className="flex border !border-[#EBEBEB] rounded-lg overflow-hidden relative w-full h-[260px] sm:h-[280px] md:h-[300px] bg-white flex-col text-center items-center justify-between pt-2 sm:pt-3">
                    <img
                      src={item.image}
                      className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-cover"
                      alt={item.title}
                    />
                    <h2
                      className="text-[10px] sm:text-[11px] md:text-[12px] px-2 font-bold text-right overflow-hidden text-ellipsis"
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {item.title}
                    </h2>
                    <div className="w-full flex justify-center items-center gap-2">
                      <button
                        className={`shadow-md p-2 border border-gray-200 text-[10px] sm:text-xs md:text-sm transition-all duration-200 ${
                          priceTypes[item.id] === "wholesale"
                            ? "bg-gray-200 text-black"
                            : "bg-white text-black"
                        }`}
                        onClick={() => handlePriceTypeChange(item.id, "wholesale")}
                      >
                        قیمت عمده
                      </button>
                      <button
                        className={`shadow-md p-2 border border-gray-200 text-[10px] sm:text-xs md:text-sm transition-all duration-200 ${
                          priceTypes[item.id] === "single"
                            ? "bg-gray-200 text-black"
                            : "bg-white text-black"
                        }`}
                        onClick={() => handlePriceTypeChange(item.id, "single")}
                      >
                        قیمت تکی
                      </button>
                    </div>
                    <div className="flex justify-between items-center w-full relative">
                      <p className="font-bold text-sm sm:text-xs md:text-sm pr-2">
                        {priceTypes[item.id] === "single"
                          ? item.discountedPrice
                          : item.wholesalePrice}{" "}
                        تومان
                      </p>
                      <button
                        className="bg-[#805B99] text-white rounded-tr-lg p-1.5 sm:p-2"
                        onMouseEnter={() => handleMouseEnter(item.id)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <AddShoppingCart fontSize="small" />
                      </button>
                      {hoveredProductId === item.id && (
                        <div
                          className="w-10 sm:w-12 bg-[#EBEBEB] py-1.5 sm:py-2 rounded-lg text-[#805B99] flex flex-col justify-center items-center absolute z-20"
                          style={{
                            bottom: "80%",
                            left: "10%",
                            transform: "translateX(-50%)",
                            marginBottom: "8px",
                          }}
                        >
                          <button
                            onClick={() => handleQuantityChange(item.id, 1)}
                          >
                            <AddCircleOutline fontSize="small" />
                          </button>
                          <input
                            type="text"
                            className="w-full text-center text-[10px] sm:text-xs"
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
                    <p className="absolute top-1 sm:top-2 left-1 sm:left-2 text-black p-1 rounded-lg text-[10px] sm:text-xs bg-gray-200">
                      {item.discount}
                    </p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            {navStates[index]?.showPrev && (
              <button
                onClick={() => goPrev(index)}
                className="absolute hidden md:inline top-1/2 right-0 sm:right-2 transform -translate-y-1/2 bg-[#EBEBEB] border-[#c7c7c7] border rounded-lg h-8 w-8 sm:h-10 sm:w-10 text-[#805B99] z-10"
              >
                <KeyboardArrowRight fontSize="medium" />
              </button>
            )}
            {navStates[index]?.showNext && (
              <button
                onClick={() => goNext(index)}
                className="absolute top-1/2 hidden md:inline left-0 sm:left-2 transform -translate-y-1/2 bg-[#EBEBEB] border-[#c7c7c7] border rounded-lg h-8 w-8 sm:h-10 sm:w-10 text-[#805B99] z-10"
              >
                <KeyboardArrowLeft fontSize="medium" />
              </button>
            )}
          </CustomTabPanel>
        ))}
      </Box>
    </div>
  );
}