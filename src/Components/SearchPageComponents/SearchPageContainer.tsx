"use client";
import { useEffect, useState, useRef } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AddCircleOutline,
  AddShoppingCart,
  Category,
  Close,
  Filter,
  FilterAlt,
  PriceChange,
  RemoveCircleOutline,
  Search,
  Star,
  Store,
  Tune,
} from '@mui/icons-material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Link from 'next/link';
import '@/Components/Sliders/TabProductsSlider/TabProductSlider.css';
import '@/Components/Sliders/Sliders.css';
import "./SearchPage.css";

interface MediaItem {
  type: 'image' | 'video';
  src: string;
  thumbnail: string;
  alt: string;
}

interface Product {
  id: number;
  title: string;
  mothercat?: string;
  subcat?: string;
  features?: string[];
  content?: string;
  brand: string;
  originalPrice: string;
  discountedPrice: string;
  wholesalePrice: string;
  discountwholesalePrice: string;
  minwholesale: number;
  discount: string;
  discountwholesale: string;
  media?: MediaItem[];
  category: string;
  image?: string;
  rating: number;
  inStock: boolean;
  numericPrice: number;
}

interface CartItem {
  id: number;
  title: string;
  quantity: number;
  priceType: 'single' | 'wholesale';
  price: string;
}

export default function ProductSearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [brand, setBrand] = useState('');
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [rating, setRating] = useState(0);
  const [discount, setDiscount] = useState(false);
  const [inStock, setInStock] = useState(false);
  const [category, setCategory] = useState('');
  const [cartQuantities, setCartQuantities] = useState<{ [key: number]: number }>({});
  const [priceTypes, setPriceTypes] = useState<{ [key: number]: 'single' | 'wholesale' }>({});
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showQuantitySelector, setShowQuantitySelector] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false); // State برای نمایش/مخفی کردن فیلترها در موبایل

  const productsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // بررسی عرض صفحه برای تشخیص حالت دسکتاپ (بزرگ‌تر از 1024px)
    const isDesktop = window.innerWidth >= 1024;
  
    if (isDesktop && productsRef.current) {
      productsRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [searchTerm, brand, priceRange, rating, discount, inStock, category]);
  const products: Product[] = [
    {
      id: 1,
      brand: "پیکسل",
      title: "ضد آفتاب بدون رنگ مناسب پوست های جوش دار و چرب حجم 50 میلی لیتر",
      image: "https://storage.khanoumi.com/ProductImages/5666500020-202491110947692.jpg?w=104",
      originalPrice: "479,000",
      discountedPrice: "431,100",
      wholesalePrice: "400,000",
      discountwholesalePrice: "340,000",
      minwholesale: 2,
      discount: "10%",
      discountwholesale: "15%",
      category: "مراقبت پوست",
      rating: 3.5,
      inStock: true,
      numericPrice: 431100,
    },
    {
      id: 2,
      brand: "مورینگا",
      title: "سرم ضد چروک صورت حجم 55 میلی لیتر",
      image: "https://storage.khanoumi.com/ProductImages/49631-2024619172532356.jpg?w=104",
      originalPrice: "389,400",
      discountedPrice: "298,900",
      wholesalePrice: "270,000",
      discountwholesalePrice: "229,500",
      discount: "23%",
      minwholesale: 6,
      discountwholesale: "15%",
      category: "مراقبت پوست",
      rating: 4.0,
      inStock: true,
      numericPrice: 298900,
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
      minwholesale: 2,
      discount: "10%",
      discountwholesale: "10%",
      category: "مراقبت پوست",
      rating: 4.2,
      inStock: true,
      numericPrice: 537300,
    },
    {
      id: 4,
      brand: "لافارر",
      title: "ژل شستشو صورت مدل لایه بردار شماره 1 مناسب پوست چرب و مستعد آکنه حجم 150 میلی لیت",
      image: "https://storage.khanoumi.com/ProductImages/ییث-2024123184526759.jpg?w=104",
      originalPrice: "631,900",
      discountedPrice: "568,710",
      wholesalePrice: "530,000",
      discountwholesalePrice: "450,500",
      minwholesale: 2,
      discount: "10%",
      discountwholesale: "15%",
      category: "مراقبت پوست",
      rating: 4.3,
      inStock: false,
      numericPrice: 568710,
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
      minwholesale: 2,
      discount: "3%",
      discountwholesale: "20%",
      category: "مراقبت مو",
      rating: 4.5,
      inStock: true,
      numericPrice: 4370000,
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
      minwholesale: 2,
      discount: "30%",
      discountwholesale: "10%",
      category: "مراقبت مو",
      rating: 3.8,
      inStock: true,
      numericPrice: 123900,
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
      minwholesale: 2,
      discount: "31%",
      discountwholesale: "20%",
      category: "مراقبت پوست",
      rating: 4.1,
      inStock: true,
      numericPrice: 749000,
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
      minwholesale: 2,
      discount: "10%",
      discountwholesale: "10%",
      category: "مراقبت مو",
      rating: 4.0,
      inStock: false,
      numericPrice: 502110,
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
      minwholesale: 2,
      discount: "30%",
      discountwholesale: "20%",
      category: "عطر و ادکلن",
      rating: 4.4,
      inStock: true,
      numericPrice: 689000,
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
      minwholesale: 4,
      discount: "20%",
      discountwholesale: "5%",
      category: "مراقبت پوست",
      rating: 4.2,
      inStock: true,
      numericPrice: 200000,
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
      minwholesale: 3,
      discount: "20%",
      discountwholesale: "5%",
      category: "مراقبت مو",
      rating: 3.9,
      inStock: true,
      numericPrice: 144000,
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
      minwholesale: 3,
      discount: "20%",
      discountwholesale: "15%",
      category: "آرایشی",
      rating: 4.5,
      inStock: true,
      numericPrice: 280000,
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
      minwholesale: 4,
      discount: "20%",
      discountwholesale: "15%",
      category: "آرایشی",
      rating: 4.3,
      inStock: false,
      numericPrice: 232000,
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
      minwholesale: 5,
      discount: "20%",
      discountwholesale: "25%",
      category: "عطر و ادکلن",
      rating: 4.6,
      inStock: true,
      numericPrice: 960000,
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
      minwholesale: 2,
      discount: "20%",
      discountwholesale: "25%",
      category: "آرایشی",
      rating: 4.7,
      inStock: true,
      numericPrice: 2000000,
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
      minwholesale: 2,
      discount: "20%",
      discountwholesale: "10%",
      category: "مراقبت پوست",
      rating: 4.0,
      inStock: true,
      numericPrice: 256000,
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
      minwholesale: 2,
      discount: "20%",
      discountwholesale: "10%",
      category: "مراقبت مو",
      rating: 3.8,
      inStock: true,
      numericPrice: 120000,
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
      minwholesale: 2,
      discount: "20%",
      discountwholesale: "5%",
      category: "آرایشی",
      rating: 4.1,
      inStock: true,
      numericPrice: 160000,
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
      minwholesale: 2,
      discount: "20%",
      discountwholesale: "25%",
      category: "عطر و ادکلن",
      rating: 4.8,
      inStock: true,
      numericPrice: 3040000,
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
      minwholesale: 2,
      discount: "20%",
      discountwholesale: "10%",
      category: "مراقبت پوست",
      rating: 4.3,
      inStock: true,
      numericPrice: 360000,
    },
  ];

  const handleShowQuantitySelector = (productId: number) => {
    setShowQuantitySelector(showQuantitySelector === productId ? null : productId);
  };

  const handleQuantityChange = (productId: number, delta: number) => {
    setCartQuantities((prev) => {
      const newQuantity = (prev[productId] || 0) + delta;
      return { ...prev, [productId]: newQuantity < 0 ? 0 : newQuantity };
    });
  };

  const handlePriceTypeChange = (productId: number, type: 'single' | 'wholesale') => {
    setPriceTypes((prev) => ({ ...prev, [productId]: type }));
  };

  const handleAddToCart = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product || !cartQuantities[productId]) return;

    const quantity = cartQuantities[productId];
    const priceType = priceTypes[productId] || 'single';

    if (priceType === 'wholesale' && quantity < product.minwholesale) {
      toast.error(`حداقل تعداد برای قیمت عمده ${product.minwholesale} عدد است.`, {
        position: 'top-center',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      });
      return;
    }

    const cartItem: CartItem = {
      id: productId,
      title: product.title,
      quantity,
      priceType,
      price: priceType === 'single' ? product.discountedPrice : product.discountwholesalePrice,
    };

    setCart((prev) => {
      const existingItem = prev.find((item) => item.id === productId && item.priceType === priceType);
      if (existingItem) {
        return prev.map((item) =>
          item.id === productId && item.priceType === priceType
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, cartItem];
    });

    toast.success('محصول به سبد خرید اضافه شد!', {
      position: 'top-center',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: 'colored',
    });

    setCartQuantities((prev) => ({ ...prev, [productId]: 0 }));
    setShowQuantitySelector(null);
  };

  useEffect(() => {
    const initialPriceTypes = products.reduce(
      (acc, product) => ({ ...acc, [product.id]: 'single' }),
      {}
    );
    setPriceTypes(initialPriceTypes);
  }, []);

  const filteredProducts = products.filter(
    (product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (brand === '' || product.brand === brand) &&
      product.numericPrice >= priceRange[0] &&
      product.numericPrice <= priceRange[1] &&
      (!discount || product.discount !== '0%') &&
      (!inStock || product.inStock) &&
      (category === '' || product.category === category) &&
      product.rating >= rating
  );

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  const filterVariants = {
    hidden: { y: '-100%', opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { y: '-100%', opacity: 0, transition: { duration: 0.2 } },
  };

  return (
    <>
      <Head>
        <title>جستجوی محصولات</title>
        <meta name="description" content="صفحه جستجوی محصولات با فیلترهای پیشرفته و طراحی مدرن" />
        <link href="https://cdn.jsdelivr.net/npm/yekan-bakh@1.0.0/css/yekan-bakh.min.css" rel="stylesheet" />
      </Head>
      <div dir="rtl" className="min-h-screen bg-[#F7F7F7] font-yekan">
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
          style={{ zIndex: 99999, top: 0, width: '100%', padding: '10px' }}
        />
   
          <div className="md:hidden mobile-header">
  <motion.div
    initial={{ y: -50, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ duration: 0.3, ease: 'easeOut' }}
    className="flex items-center justify-between w-[95%] mx-auto  rounded-xl shadow-lg"
  >
    <div className="flex items-center gap-2 w-full">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="p-2 text-white hover:bg-[#6b4e82] rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label={showFilters ? "بستن فیلترها" : "نمایش فیلترها"}
      >
        {showFilters ? <Close fontSize="medium" /> : <Tune fontSize="medium" />}
      </button>
      <div className="relative flex items-center w-full">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="جستجوی محصول..."
          className="w-full p-3 pr-10 bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/50 transition-all duration-200"
          aria-label="جستجوی محصول"
        />
        <Search
          fontSize="medium"
          className="absolute right-3 text-white/50"
          aria-hidden="true"
        />
      </div>
    </div>
  </motion.div>
</div>
 
        <div className="w-[95%] mx-auto p-4 md:p-8 main-container">
          <div className="flex flex-col lg:flex-row gap-6 relative">
          <AnimatePresence>
  {showFilters && (
    <>
      <motion.div
        className="mobile-filter-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowFilters(false)}
      />
      <motion.div
        variants={filterVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="mobile-filter-panel md:hidden"
      >
        <button
          onClick={() => setShowFilters(false)}
          className="absolute top-4 left-4 text-[#805b99] font-bold"
          aria-label="بستن فیلترها"
        >
          بستن
        </button>
        <h2 className="text-xl font-bold mb-6 text-[#374151] flex items-center">
          <FilterAlt className="ml-2 text-[#805b99]" /> فیلترها
        </h2>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-[#374151]" htmlFor="category-select">
            <Category className="ml-2 text-[#805b99]" /> دسته‌بندی
          </label>
          <select
            id="category-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#805b99] transition duration-200"
            aria-label="انتخاب دسته‌بندی"
          >
            <option value="">همه</option>
            <option value="مراقبت پوست">مراقبت پوست</option>
            <option value="مراقبت مو">مراقبت مو</option>
            <option value="آرایشی">آرایشی</option>
            <option value="عطر و ادکلن">عطر و ادکلن</option>
            <option value="ابزار">ابزار</option>
          </select>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-[#374151]" htmlFor="brand-select">
            <Store className="ml-2 text-[#805b99]" /> برند
          </label>
          <select
            id="brand-select"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="w-full p-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#805b99] transition duration-200"
            aria-label="انتخاب برند"
          >
            <option value="">همه</option>
            {Array.from(new Set(products.map((p) => p.brand))).map((brand) => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-[#374151]" htmlFor="price-range">
            <PriceChange className="ml-2 text-[#805b99]" /> محدوده قیمت (تومان)
          </label>
          <input
            id="price-range"
            type="range"
            min="0"
            max="5000000"
            step="10000"
            value={priceRange[1]}
            onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
            className="w-full accent-[#805b99]"
            aria-label="محدوده قیمت"
          />
          <div className="flex justify-between text-sm text-[#4b5563]">
            <span>0</span>
            <span>{priceRange[1].toLocaleString('fa-IR')}</span>
          </div>
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-[#374151]" htmlFor="rating-input">
            <Star className="ml-2 text-[#805b99]" /> حداقل امتیاز
          </label>
          <input
            id="rating-input"
            type="number"
            min="0"
            max="5"
            step="0.5"
            value={rating}
            onChange={(e) => {
              const value = parseFloat(e.target.value);
              if (!isNaN(value) && value >= 0 && value <= 5) {
                setRating(value);
              } else {
                setRating(0);
              }
            }}
            className="w-full p-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#805b99] transition duration-200"
            aria-label="حداقل امتیاز محصول"
          />
        </div>
        <div className="mb-6">
          <label className="flex items-center text-sm font-medium text-[#374151]">
            <input
              type="checkbox"
              checked={discount}
              onChange={(e) => setDiscount(e.target.checked)}
              className="ml-2 accent-[#805b99]"
              aria-label="فقط محصولات با تخفیف"
            />
            فقط محصولات با تخفیف
          </label>
        </div>
        <div className="mb-6">
          <label className="flex items-center text-sm font-medium text-[#374151]">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
              className="ml-2 accent-[#805b99]"
              aria-label="فقط محصولات موجود"
            />
            فقط محصولات موجود
          </label>
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="hidden lg:block w-full lg:w-1/4 bg-white p-6 sticky-filters rounded-xl shadow-lg"
            >
              <h2 className="text-xl font-bold mb-6 text-[#374151] flex items-center">
                <FilterAlt className="ml-2 text-[#805b99]" /> فیلترها
              </h2>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-[#374151]" htmlFor="search-input">
                  <Search className="ml-2 text-[#805b99]" /> جستجو
                </label>
                <input
                  id="search-input"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="نام محصول را وارد کنید"
                  className="w-full p-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#805b99] transition duration-200"
                  aria-label="جستجوی محصول"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-[#374151]" htmlFor="category-select">
                  <Category className="ml-2 text-[#805b99]" /> دسته‌بندی
                </label>
                <select
                  id="category-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full p-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#805b99] transition duration-200"
                  aria-label="انتخاب دسته‌بندی"
                >
                  <option value="">همه</option>
                  <option value="مراقبت پوست">مراقبت پوست</option>
                  <option value="مراقبت مو">مراقبت مو</option>
                  <option value="آرایشی">آرایشی</option>
                  <option value="عطر و ادکلن">عطر و ادکلن</option>
                  <option value="ابزار">ابزار</option>
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-[#374151]" htmlFor="brand-select">
                  <Store className="ml-2 text-[#805b99]" /> برند
                </label>
                <select
                  id="brand-select"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full p-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#805b99] transition duration-200"
                  aria-label="انتخاب برند"
                >
                  <option value="">همه</option>
                  {Array.from(new Set(products.map((p) => p.brand))).map((brand) => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-[#374151]" htmlFor="price-range">
                  <PriceChange className="ml-2 text-[#805b99]" /> محدوده قیمت (تومان)
                </label>
                <input
                  id="price-range"
                  type="range"
                  min="0"
                  max="5000000"
                  step="10000"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  className="w-full accent-[#805b99]"
                  aria-label="محدوده قیمت"
                />
                <div className="flex justify-between text-sm text-[#4b5563]">
                  <span>0</span>
                  <span>{priceRange[1].toLocaleString('fa-IR')}</span>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2 text-[#374151]" htmlFor="rating-input">
                  <Star className="ml-2 text-[#805b99]" /> حداقل امتیاز
                </label>
                <input
                  id="rating-input"
                  type="number"
                  min="0"
                  max="5"
                  step="0.5"
                  value={rating}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value) && value >= 0 && value <= 5) {
                      setRating(value);
                    } else {
                      setRating(0);
                    }
                  }}
                  className="w-full p-3 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#805b99] transition duration-200"
                  aria-label="حداقل امتیاز محصول"
                />
              </div>
              <div className="mb-6">
                <label className="flex items-center text-sm font-medium text-[#374151]">
                  <input
                    type="checkbox"
                    checked={discount}
                    onChange={(e) => setDiscount(e.target.checked)}
                    className="ml-2 accent-[#805b99]"
                    aria-label="فقط محصولات با تخفیف"
                  />
                  فقط محصولات با تخفیف
                </label>
              </div>
              <div className="mb-6">
                <label className="flex items-center text-sm font-medium text-[#374151]">
                  <input
                    type="checkbox"
                    checked={inStock}
                    onChange={(e) => setInStock(e.target.checked)}
                    className="ml-2 accent-[#805b99]"
                    aria-label="فقط محصولات موجود"
                  />
                  فقط محصولات موجود
                </label>
              </div>
            </motion.div>
            <div className="w-full lg:w-3/4">
              <div ref={productsRef}>
                <AnimatePresence>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((item) => (
                        <motion.div
                          key={item.id}
                          variants={cardVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          className="tpsc-product-card"
                        >
                          {priceTypes[item.id] === 'wholesale' && (
                            <div className="absolute top-[2px] left-[2px] bg-[#c7c7c7] py-1 px-2 rounded-sm text-[11px] flex items-center">
                              <p className="ml-1">+</p>
                              <p>{item.minwholesale} عدد</p>
                            </div>
                          )}
                          <Link href={`/product/${item.id}`} className="flex items-center flex-col">
                            <Image
                              src={item.media ? item.media[0].src : item.image || '/placeholder.jpg'}
                              alt={item.media ? item.media[0].alt : item.title}
                              width={200}
                              height={200}
                              className="tpsc-product-image"
                            />
                            <h2 className="tpsc-product-title">{item.title}</h2>
                          </Link>
                          <div className="tpsc-price-buttons">
                            <button
                              className={`tpsc-price-button ${priceTypes[item.id] === 'wholesale' ? 'tpsc-price-button-active' : ''}`}
                              onClick={() => handlePriceTypeChange(item.id, 'wholesale')}
                              aria-label="انتخاب قیمت عمده"
                            >
                              قیمت عمده
                            </button>
                            <button
                              className={`tpsc-price-button ${priceTypes[item.id] === 'single' ? 'tpsc-price-button-active' : ''}`}
                              onClick={() => handlePriceTypeChange(item.id, 'single')}
                              aria-label="انتخاب قیمت تکی"
                            >
                              قیمت تکی
                            </button>
                          </div>
                          <div className="tpsc-price-discount-container">
                            <p className="tpsc-price-strikethrough-text">
                              {priceTypes[item.id] === 'single' ? item.originalPrice : item.wholesalePrice}
                            </p>
                            <p className="tpsc-discount-badge">
                              {priceTypes[item.id] === 'single' ? item.discount : item.discountwholesale}
                            </p>
                          </div>
                          <div className="tpsc-price-quantity">
                            <p className="tpsc-price">
                              {priceTypes[item.id] === 'single' ? item.discountedPrice : item.discountwholesalePrice} تومان
                            </p>
                            <div className="tpsc-quantity-selector-mobile relative">
                              {cartQuantities[item.id] > 0 && (
                                <button
                                  className="-top-[20px] h-[20px] left-0 bg-[#c7c7c7] text-[11px] px-2 rounded-tr-lg absolute"
                                  onClick={() => handleAddToCart(item.id)}
                                  aria-label="ثبت تعداد محصول"
                                >
                                  ثبت
                                </button>
                              )}
                              <button onClick={() => handleQuantityChange(item.id, 1)} aria-label="افزایش تعداد">
                                <AddCircleOutline fontSize="small" />
                              </button>
                              <input
                                type="text"
                                className="tpsc-quantity-input"
                                value={cartQuantities[item.id] || 0}
                                readOnly
                                aria-label="تعداد محصول"
                              />
                              <button onClick={() => handleQuantityChange(item.id, -1)} aria-label="کاهش تعداد">
                                <RemoveCircleOutline fontSize="small" />
                              </button>
                            </div>
                            <button
                              className="tpsc-add-to-cart"
                              onClick={() => handleShowQuantitySelector(item.id)}
                              aria-label="نمایش انتخابگر تعداد"
                            >
                              <AddShoppingCart fontSize="small" />
                            </button>
                            {showQuantitySelector === item.id && (
                              <div className="tpsc-quantity-selector relative" onClick={(e) => e.stopPropagation()}>
                                <button onClick={() => handleQuantityChange(item.id, 1)} aria-label="افزایش تعداد">
                                  <AddCircleOutline fontSize="small" />
                                </button>
                                <input
                                  type="text"
                                  className="tpsc-quantity-input"
                                  value={cartQuantities[item.id] || 0}
                                  readOnly
                                  aria-label="تعداد محصول"
                                />
                                <button onClick={() => handleQuantityChange(item.id, -1)} aria-label="کاهش تعداد">
                                  <RemoveCircleOutline fontSize="small" />
                                </button>
                                {cartQuantities[item.id] > 0 && (
                                  <button
                                    className="tpsc-confirm-button absolute w-[40px] text-[10px] -top-[25px] left-0 bg-black px-1 rounded-tr-lg text-white h-[30px]"
                                    onClick={() => {
                                      handleAddToCart(item.id);
                                      handleShowQuantitySelector(item.id);
                                    }}
                                    aria-label="ثبت تعداد محصول"
                                  >
                                    ثبت
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center col-span-full text-[#4b5563] text-lg"
                      >
                        محصولی یافت نشد
                      </motion.p>
                    )}
                  </div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}