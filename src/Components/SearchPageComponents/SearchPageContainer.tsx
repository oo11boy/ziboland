"use client";
import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import {
  AddCircleOutline,
  AddShoppingCart,
  Category,
  Close,
  FilterAlt,
  PriceChange,
  RemoveCircleOutline,
  Search,
  Star,
  Store,
  Tune,
  Sort,
  NotificationAdd,
} from "@mui/icons-material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Link from "next/link";
import "@/Components/Sliders/TabProductsSlider/TabProductSlider.css";
import "@/Components/Sliders/Sliders.css";
import "./SearchPage.css";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/ContextApi/CartContext";
import { Categoryapi, Product } from "@/types/types";

interface QueryParams {
  mothercatId?: string;
  subcatId?: string;
  brands?: string[];
}



export default function SearchPageContainer({ queryParams }: { queryParams: QueryParams }) {
  const searchParams = useSearchParams();
  const { dispatch } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Categoryapi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>(queryParams.brands || []);
  const [selectedMothercatIds, setSelectedMothercatIds] = useState<number[]>(
    queryParams.mothercatId ? [parseInt(queryParams.mothercatId)] : []
  );
  const [selectedSubcatIds, setSelectedSubcatIds] = useState<number[]>(
    queryParams.subcatId ? [parseInt(queryParams.subcatId)] : []
  );
  const [categorySearch, setCategorySearch] = useState("");
  const [subcatSearch, setSubcatSearch] = useState("");
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [rating, setRating] = useState(0);
  const [discount, setDiscount] = useState(false);
  const [inStock, setInStock] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const [cartQuantities, setCartQuantities] = useState<{ [key: number]: number }>({});
  const [priceTypes, setPriceTypes] = useState<{ [key: number]: "single" | "wholesale" }>({});
  const [showQuantitySelector, setShowQuantitySelector] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState<string>("جدیدترین");

  const productsRef = useRef<HTMLDivElement>(null);

  // Fetch products and categories from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch products
        const productsResponse = await fetch("http://localhost:3000/api/products");
        if (!productsResponse.ok) {
          throw new Error("Failed to fetch products");
        }
        const productsData: Product[] = await productsResponse.json();
        setProducts(productsData);

        // Fetch categories
        const categoriesResponse = await fetch("http://localhost:3000/api/categories");
        if (!categoriesResponse.ok) {
          throw new Error("Failed to fetch categories");
        }
        const categoriesData: Categoryapi[] = await categoriesResponse.json();
        setCategories(categoriesData);

        setLoading(false);
      } catch (err) {
        setError("خطا در بارگذاری داده‌ها. لطفاً دوباره تلاش کنید.");
        setLoading(false);
        toast.error("خطا در بارگذاری داده‌ها", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
      }
    };

    fetchData();
  }, []);

  // Apply query string values to states
  useEffect(() => {
    const mothercatId = searchParams.get("mothercatId");
    const subcatId = searchParams.get("subcatId");
    const brands = searchParams.get("brands");

    setSelectedMothercatIds(mothercatId ? [parseInt(mothercatId)] : []);
    setSelectedSubcatIds(subcatId ? [parseInt(subcatId)] : []);
    setSelectedBrands(brands ? brands.split(",") : []);
  }, [searchParams]);

  // Scroll to products on filter change
  useEffect(() => {
    const isDesktop = window.innerWidth >= 1024;
    if (isDesktop && productsRef.current) {
      productsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [
    searchTerm,
    selectedBrands,
    selectedMothercatIds,
    selectedSubcatIds,
    priceRange,
    rating,
    discount,
    inStock,
    sortOption,
  ]);

  // Initialize price types
  useEffect(() => {
    const initialPriceTypes = products.reduce(
      (acc, product) => ({ ...acc, [product.id]: "single" }),
      {}
    );
    setPriceTypes(initialPriceTypes);
  }, [products]);

  const handleShowQuantitySelector = (productId: number) => {
    setShowQuantitySelector(showQuantitySelector === productId ? null : productId);
  };

  const handleQuantityChange = (productId: number, delta: number) => {
    setCartQuantities((prev) => {
      const newQuantity = (prev[productId] || 0) + delta;
      const product = products.find((p) => p.id === productId);

      if (!product) return prev;

      // If quantity meets or exceeds minwholesale, switch to wholesale price
      if (newQuantity >= product.minwholesale) {
        handlePriceTypeChange(productId, "wholesale");
      }
      // If quantity falls below minwholesale, switch to single price
      else if (newQuantity < product.minwholesale) {
        handlePriceTypeChange(productId, "single");
      }

      return { ...prev, [productId]: newQuantity < 0 ? 0 : newQuantity };
    });
  };

  const handlePriceTypeChange = (productId: number, type: "single" | "wholesale") => {
    setPriceTypes((prev) => ({ ...prev, [productId]: type }));
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

    const quantity = cartQuantities[productId];
    const priceType = priceTypes[productId];
    const price = priceType === "single" ? product.discountedPrice : product.discountwholesalePrice;
    const discount = priceType === "single" ? product.discount : product.discountwholesale;

    // Check minimum quantity for wholesale price
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
          quantity: quantity,
          priceType: priceType,
          price: price.toString(),
          image: product.media && product.media.length > 0 ? product.media[0].src : product.image || "/placeholder.jpg",
          discount: discount,
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

      // Reset quantity after adding to cart
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

  const handleNotifyMe = (productId: number) => {
    toast.info("هنگامی که محصول موجود شد، به شما اطلاع خواهیم داد!", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
    });
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedBrands([]);
    setSelectedMothercatIds([]);
    setSelectedSubcatIds([]);
    setCategorySearch("");
    setSubcatSearch("");
    setPriceRange([0, 5000000]);
    setRating(0);
    setDiscount(false);
    setInStock(false);
    setBrandSearch("");
    setSortOption("جدیدترین");
  };

  const allBrands = Array.from(new Set(products.map((p) => p.brandDetails?.img || '')));
  const allCategories = categories.filter((cat) => cat.mothercat === 1);
  const filteredCategories = allCategories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );
  const filteredSubcats = selectedMothercatIds.length > 0
    ? categories
        .filter((cat) => selectedMothercatIds.includes(cat.id))
        .flatMap((cat) => cat.subcat || [])
        .filter((subcat) => subcat.name.toLowerCase().includes(subcatSearch.toLowerCase()))
    : [];

  const getSortedProducts = () => {
    const filtered = products.filter(
      (product) =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedBrands.length === 0 || (product.brandDetails && selectedBrands.includes(product.brandDetails.img))) &&
        (selectedMothercatIds.length === 0 || selectedMothercatIds.includes(product.mothercatId)) &&
        (selectedSubcatIds.length === 0 || selectedSubcatIds.includes(product.subcatId)) &&
        product.numericPrice >= priceRange[0] &&
        product.numericPrice <= priceRange[1] &&
        (!discount || product.discount !== "0%") &&
        (!inStock || product.inStock) &&
        product.rating >= rating
    );

    switch (sortOption) {
      case "جدیدترین":
        return filtered.sort((a, b) => b.id - a.id);
      case "گران‌ترین":
        return filtered.sort((a, b) => b.numericPrice - a.numericPrice);
      case "ارزان‌ترین":
        return filtered.sort((a, b) => a.numericPrice - b.numericPrice);
      case "محبوب‌ترین":
        return filtered.sort((a, b) => b.rating - a.rating);
      case "پرفروش‌ترین":
        return filtered.sort((a, b) => (b.sales || 0) - (a.sales || 0));
      default:
        return filtered;
    }
  };
  const filteredProducts = getSortedProducts();

  const selectedCategoryNames = selectedMothercatIds
    .map((id) => categories.find((cat) => cat.id === id)?.name)
    .filter(Boolean)
    .join(", ");

  const selectedSubcatNames = selectedSubcatIds
    .map((id) =>
      categories
        .filter((cat) => selectedMothercatIds.includes(cat.id))
        .flatMap((cat) => cat.subcat || [])
        .find((sub) => sub.id === id)?.name
    )
    .filter(Boolean)
    .join(", ");

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  const filterVariants = {
    hidden: { y: "-100%", opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { y: "-100%", opacity: 0, transition: { duration: 0.2 } },
  };

  if (loading) {
    return (
      <div dir="rtl" className="min-h-screen yekan bg-[#F7F7F7] font-yekan flex items-center justify-center">
        <p className="text-[#374151] text-lg">در حال بارگذاری...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div dir="rtl" className="min-h-screen yekan bg-[#F7F7F7] font-yekan flex items-center justify-center">
        <p className="text-[#374151] text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen yekan bg-[#F7F7F7] font-yekan">
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
        style={{ zIndex: 99999, top: 0, width: "100%", padding: "10px" }}
      />
      <div className="lg:hidden mobile-header">
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="flex items-center justify-between w-[95%] mx-auto rounded-xl shadow-lg"
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
              <Search fontSize="medium" className="absolute right-3 text-white/50" aria-hidden="true" />
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
                  className="mobile-filter-panel lg:hidden"
                >
                  <div className="">
                    <div className="flex sticky py-4 top-0 bg-white justify-between mb-4 items-center">
                      <h2 className="text-lg font-bold text-[#374151] flex items-center">
                        <FilterAlt className="ml-2 text-[#805b99]" /> فیلترها
                      </h2>
                      <div className="text-sm text-[#374151]">
                        تعداد نتایج: {filteredProducts.length}
                      </div>
                      <button
                        onClick={clearFilters}
                        className="text-[#805b99] font-bold text-sm"
                        aria-label="حذف فیلترها"
                      >
                        حذف فیلترها
                      </button>
                    </div>
                    <div className="my-2">
                      <label className="block text-sm font-medium mb-1 text-[#374151]" htmlFor="category-search">
                        <Category className="ml-2 text-[#805b99] yekan" /> دسته‌بندی
                      </label>
                      <input
                        id="category-search"
                        type="text"
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        placeholder="جستجوی دسته‌بندی..."
                        className="w-full p-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#805b99] transition duration-200"
                        aria-label="جستجوی دسته‌بندی"
                      />
                      <div className="mt-1 max-h-32 overflow-y-auto">
                        {filteredCategories.map((cat) => (
                          <label key={cat.id} className="flex items-center text-sm mb-1">
                            <input
                              type="checkbox"
                              checked={selectedMothercatIds.includes(cat.id)}
                              onChange={() => {
                                setSelectedMothercatIds((prev) =>
                                  prev.includes(cat.id) ? prev.filter((id) => id !== cat.id) : [...prev, cat.id]
                                );
                                if (!selectedMothercatIds.includes(cat.id)) {
                                  setSelectedSubcatIds([]);
                                }
                              }}
                              className="ml-2 accent-[#805b99]"
                              aria-label={`انتخاب دسته‌بندی ${cat.name}`}
                            />
                            {cat.name}
                          </label>
                        ))}
                      </div>
                    </div>
                    {selectedMothercatIds.length > 0 && (
                      <div className="my-2">
                        <label className="block text-sm font-medium mb-1 text-[#374151]" htmlFor="subcat-search">
                          <Category className="ml-2 text-[#805b99] yekan" /> زیرمجموعه
                        </label>
                        <input
                          id="subcat-search"
                          type="text"
                          value={subcatSearch}
                          onChange={(e) => setSubcatSearch(e.target.value)}
                          placeholder="جستجوی زیرمجموعه..."
                          className="w-full p-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#805b99] transition duration-200"
                          aria-label="جستجوی زیرمجموعه"
                        />
                        <div className="mt-1 max-h-32 overflow-y-auto">
                          {filteredSubcats.map((subcat) => (
                            <label key={subcat.id} className="flex items-center text-sm mb-1">
                              <input
                                type="checkbox"
                                checked={selectedSubcatIds.includes(subcat.id)}
                                onChange={() => {
                                  setSelectedSubcatIds((prev) =>
                                    prev.includes(subcat.id) ? prev.filter((id) => id !== subcat.id) : [...prev, subcat.id]
                                  );
                                }}
                                className="ml-2 accent-[#805b99]"
                                aria-label={`انتخاب زیرمجموعه ${subcat.name}`}
                              />
                              {subcat.name}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="my-2">
                      <label className="block text-sm font-medium mb-1 text-[#374151]" htmlFor="brand-search">
                        <Store className="ml-2 text-[#805b99]" /> برند
                      </label>
                      <input
                        id="brand-search"
                        type="text"
                        value={brandSearch}
                        onChange={(e) => setBrandSearch(e.target.value)}
                        placeholder="جستجوی برند..."
                        className="w-full p-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#805b99] transition duration-200"
                        aria-label="جستجوی برند"
                      />
                      <div className="mt-1 max-h-32 overflow-y-auto">
                        {allBrands
                          .filter((brand) => brand.toLowerCase().includes(brandSearch.toLowerCase()))
                          .map((brand) => (
                            <label key={brand} className="flex items-center text-sm mb-1">
                              <input
                                type="checkbox"
                                checked={selectedBrands.includes(brand)}
                                onChange={() => {
                                  setSelectedBrands((prev) =>
                                    prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
                                  );
                                }}
                                className="ml-2 accent-[#805b99]"
                                aria-label={`انتخاب برند ${brand}`}
                              />
                              {brand}
                            </label>
                          ))}
                      </div>
                    </div>
                    <div className="my-2">
                      <label className="block text-sm font-medium mb-1 text-[#374151]" htmlFor="price-range">
                        <PriceChange className="ml-2 text-[#805b99]" /> محدوده قیمت (تومان)
                      </label>
                      <div className="bapf_sfilter bapf_slidr bapf_slidr_jqrui bapf_attr_price bapf_slidr_ready bapf_ccolaps">
                        <div className="bapf_head bapf_colaps_togl">
                          <div className="bapf_hascolarr">
                            قیمت
                            <i className="bapf_colaps_smb fa fa-chevron-up"></i>
                          </div>
                        </div>
                        <div className="bapf_body">
                          <div className="bapf_slidr_all">
                            <span className="bapf_from">
                              <span className="bapf_tbprice">از</span>
                              <input
                                type="text"
                                value={priceRange[0].toLocaleString("fa-IR")}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value.replace(/,/g, "")) || 0;
                                  if (value <= priceRange[1]) {
                                    setPriceRange([value, priceRange[1]]);
                                  }
                                }}
                                className="w-full p-1 border border-[#e5e7eb] rounded-lg text-center"
                                aria-label="حداقل قیمت"
                              />
                              <span className="bapf_taprice">
                                <i className="icon-toman"></i>
                              </span>
                            </span>
                            <span className="bapf_to">
                              <span className="bapf_tbprice">تا</span>
                              <input
                                type="text"
                                value={priceRange[1].toLocaleString("fa-IR")}
                                onChange={(e) => {
                                  const value = parseInt(e.target.value.replace(/,/g, "")) || 5000000;
                                  if (value >= priceRange[0]) {
                                    setPriceRange([priceRange[0], value]);
                                  }
                                }}
                                className="w-full p-1 border border-[#e5e7eb] rounded-lg text-center"
                                aria-label="حداکثر قیمت"
                              />
                              <span className="bapf_taprice">
                                <i className="icon-toman"></i>
                              </span>
                            </span>
                            <div className="bapf_slidr_main bapf_slidr_num mt-4">
                              <Slider
                                range
                                min={0}
                                max={5000000}
                                step={10000}
                                value={priceRange}
                                onChange={(value) => setPriceRange(value as [number, number])}
                                trackStyle={{ backgroundColor: "#805b99" }}
                                handleStyle={{ borderColor: "#805b99", backgroundColor: "#fff" }}
                                railStyle={{ backgroundColor: "#e5e7eb" }}
                              />
                              <div className="flex justify-between mt-2 text-sm text-[#374151]">
                                <span className="price-label">گران‌ترین</span>
                                <span className="price-label">ارزان‌ترین</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="my-2">
                      <label className="block text-sm font-medium mb-1 text-[#374151]" htmlFor="rating-input">
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
                        className="w-full p-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#805b99] transition duration-200"
                        aria-label="حداقل امتیاز محصول"
                      />
                    </div>
                    <div className="flex my-4 items-center text-sm font-medium text-[#374151]">
                      <input
                        type="checkbox"
                        checked={discount}
                        onChange={(e) => setDiscount(e.target.checked)}
                        className="ml-2 accent-[#805b99]"
                        aria-label="فقط محصولات با تخفیف"
                      />
                      فقط محصولات با تخفیف
                    </div>
                    <div className="flex items-center text-sm font-medium text-[#374151]">
                      <input
                        type="checkbox"
                        checked={inStock}
                        onChange={(e) => setInStock(e.target.checked)}
                        className="ml-2 accent-[#805b99]"
                        aria-label="فقط محصولات موجود"
                      />
                      فقط محصولات موجود
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden lg:block w-full lg:w-1/4 bg-white sticky-filters shadow-lg"
          >
            <div className="flex sticky py-[0.8rem] top-0 bg-white justify-between mb-4 items-center">
              <h2 className="text-lg font-bold text-[#374151] flex items-center">
                <FilterAlt className="ml-2 text-[#805b99]" /> فیلترها
              </h2>
              <button
                onClick={clearFilters}
                className="text-[#805b99] font-bold text-sm"
                aria-label="حذف فیلترها"
              >
                حذف فیلترها
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-[#374151]" htmlFor="search-input">
                  <Search className="ml-2 text-[#805b99]" /> جستجو
                </label>
                <input
                  id="search-input"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="نام محصول را وارد کنید"
                  className="w-full p-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#805b99] transition duration-200"
                  aria-label="جستجوی محصول"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[#374151]" htmlFor="category-search">
                  <Category className="ml-2 text-[#805b99]" /> دسته‌بندی
                </label>
                <input
                  id="category-search"
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="جستجوی دسته‌بندی..."
                  className="w-full p-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#805b99] transition duration-200"
                  aria-label="جستجوی دسته‌بندی"
                />
                <div className="mt-1 max-h-32 overflow-y-auto">
                  {filteredCategories.map((cat) => (
                    <label key={cat.id} className="flex items-center text-sm mb-1">
                      <input
                        type="checkbox"
                        checked={selectedMothercatIds.includes(cat.id)}
                        onChange={() => {
                          setSelectedMothercatIds((prev) =>
                            prev.includes(cat.id) ? prev.filter((id) => id !== cat.id) : [...prev, cat.id]
                          );
                          if (!selectedMothercatIds.includes(cat.id)) {
                            setSelectedSubcatIds([]);
                          }
                        }}
                        className="ml-2 accent-[#805b99]"
                        aria-label={`انتخاب دسته‌بندی ${cat.name}`}
                      />
                      {cat.name}
                    </label>
                  ))}
                </div>
              </div>
              {selectedMothercatIds.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-1 text-[#374151]" htmlFor="subcat-search">
                    <Category className="ml-2 text-[#805b99]" /> زیرمجموعه
                  </label>
                  <input
                    id="subcat-search"
                    type="text"
                    value={subcatSearch}
                    onChange={(e) => setSubcatSearch(e.target.value)}
                    placeholder="جستجوی زیرمجموعه..."
                    className="w-full p-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#805b99] transition duration-200"
                    aria-label="جستجوی زیرمجموعه"
                  />
                  <div className="mt-1 max-h-32 overflow-y-auto">
                    {filteredSubcats.map((subcat) => (
                      <label key={subcat.id} className="flex items-center text-sm mb-1">
                        <input
                          type="checkbox"
                          checked={selectedSubcatIds.includes(subcat.id)}
                          onChange={() => {
                            setSelectedSubcatIds((prev) =>
                              prev.includes(subcat.id) ? prev.filter((id) => id !== subcat.id) : [...prev, subcat.id]
                            );
                          }}
                          className="ml-2 accent-[#805b99]"
                          aria-label={`انتخاب زیرمجموعه ${subcat.name}`}
                        />
                        {subcat.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium mb-1 text-[#374151]" htmlFor="brand-search">
                  <Store className="ml-2 text-[#805b99]" /> برند
                </label>
                <input
                  id="brand-search"
                  type="text"
                  value={brandSearch}
                  onChange={(e) => setBrandSearch(e.target.value)}
                  placeholder="جستجوی برند..."
                  className="w-full p-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#805b99] transition duration-200"
                  aria-label="جستجوی برند"
                />
                <div className="mt-1 max-h-32 overflow-y-auto">
                  {allBrands
                    .filter((brand) => brand.toLowerCase().includes(brandSearch.toLowerCase()))
                    .map((brand) => (
                      <label key={brand} className="flex items-center text-sm mb-1">
                        <input
                          type="checkbox"
                          checked={selectedBrands.includes(brand)}
                          onChange={() => {
                            setSelectedBrands((prev) =>
                              prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
                            );
                          }}
                          className="ml-2 accent-[#805b99]"
                          aria-label={`انتخاب برند ${brand}`}
                        />
                        {brand}
                      </label>
                    ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[#374151]" htmlFor="price-range">
                  <PriceChange className="ml-2 text-[#805b99]" /> محدوده قیمت (تومان)
                </label>
                <div className="bapf_sfilter bapf_slidr bapf_slidr_jqrui bapf_attr_price bapf_slidr_ready bapf_ccolaps">
                  <div className="bapf_head bapf_colaps_togl">
                    <div className="bapf_hascolarr">
                      قیمت
                      <i className="bapf_colaps_smb fa fa-chevron-up"></i>
                    </div>
                  </div>
                  <div className="bapf_body">
                    <div className="bapf_slidr_all">
                      <span className="bapf_from">
                        <span className="bapf_tbprice">از</span>
                        <input
                          type="text"
                          value={priceRange[0].toLocaleString("fa-IR")}
                          onChange={(e) => {
                            const value = parseInt(e.target.value.replace(/,/g, "")) || 0;
                            if (value <= priceRange[1]) {
                              setPriceRange([value, priceRange[1]]);
                            }
                          }}
                          className="w-full p-1 border border-[#e5e7eb] rounded-lg text-center"
                          aria-label="حداقل قیمت"
                        />
                        <span className="bapf_taprice">
                          <i className="icon-toman"></i>
                        </span>
                      </span>
                      <span className="bapf_to">
                        <span className="bapf_tbprice">تا</span>
                        <input
                          type="text"
                          value={priceRange[1].toLocaleString("fa-IR")}
                          onChange={(e) => {
                            const value = parseInt(e.target.value.replace(/,/g, "")) || 5000000;
                            if (value >= priceRange[0]) {
                              setPriceRange([priceRange[0], value]);
                            }
                          }}
                          className="w-full p-1 border border-[#e5e7eb] rounded-lg text-center"
                          aria-label="حداکثر قیمت"
                        />
                        <span className="bapf_taprice">
                          <i className="icon-toman"></i>
                        </span>
                      </span>
                      <div className="bapf_slidr_main bapf_slidr_num mt-4">
                        <Slider
                          range
                          min={0}
                          max={5000000}
                          step={10000}
                          value={priceRange}
                          onChange={(value) => setPriceRange(value as [number, number])}
                          trackStyle={{ backgroundColor: "#805b99" }}
                          handleStyle={{ borderColor: "#805b99", backgroundColor: "#fff" }}
                          railStyle={{ backgroundColor: "#e5e7eb" }}
                        />
                        <div className="flex justify-between mt-2 text-sm text-[#374151]">
                          <span className="price-label">گران‌ترین</span>
                          <span className="price-label">ارزان‌ترین</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-[#374151]" htmlFor="rating-input">
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
                  className="w-full p-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#805b99] transition duration-200"
                  aria-label="حداقل امتیاز محصول"
                />
              </div>
              <div className="flex items-center text-sm font-medium text-[#374151]">
                <input
                  type="checkbox"
                  checked={discount}
                  onChange={(e) => setDiscount(e.target.checked)}
                  className="ml-2 accent-[#805b99]"
                  aria-label="فقط محصولات با تخفیف"
                />
                فقط محصولات با تخفیف
              </div>
              <div className="flex items-center text-sm font-medium text-[#374151]">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setInStock(e.target.checked)}
                  className="ml-2 accent-[#805b99]"
                  aria-label="فقط محصولات موجود"
                />
                فقط محصولات موجود
              </div>
            </div>
          </motion.div>
          <div className="w-full lg:w-3/4">
            <div ref={productsRef}>
              <div className="flex items-center border-b overflow-auto border-[#e5e7eb] gap-4 bg-white lg:static z-10 py-3">
                <div className="flex flex-row items-center gap-x-4 grow">
                  <div className="flex items-center">
                    <div className="flex shrink-0 ml-2">
                      <Sort fontSize="medium" className="text-[#374151]" />
                    </div>
                    <p className="cursor-pointer whitespace-nowrap text-[#374151] text-sm font-medium">
                      <span className="relative grow-0">مرتب سازی:</span>
                    </p>
                  </div>
                  <div className="flex gap-x-4">
                    {["جدیدترین", "گران‌ترین", "ارزان‌ترین", "محبوب‌ترین", "پرفروش‌ترین"].map((option) => (
                      <span
                        key={option}
                        className={`cursor-pointer whitespace-nowrap text-sm ${
                          sortOption === option ? "text-[#805b99] font-bold" : "text-[#6b7280]"
                        }`}
                        onClick={() => setSortOption(option)}
                        aria-label={`مرتب‌سازی بر اساس ${option}`}
                      >
                        {option}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {(selectedSubcatNames || selectedCategoryNames) && (
                <div className="text-sm my-9 text-[#374151]">
                  {selectedSubcatNames ? (
                    <span className="border-2 border-amber-600 p-4 my-4">{selectedSubcatNames}</span>
                  ) : (
                    <span>{selectedCategoryNames}</span>
                  )}
                </div>
              )}
              <div className="text-sm my-4 text-[#374151]">
                تعداد نتایج: {filteredProducts.length}
              </div>
              <AnimatePresence>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
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
                        {priceTypes[item.id] === "wholesale" && (
                          <div className="absolute top-[2px] left-[2px] bg-[#c7c7c7] py-1 px-2 rounded-sm text-[11px] flex items-center">
                            <p className="ml-1">+</p>
                            <p>{item.minwholesale} عدد</p>
                          </div>
                        )}
                        <Link href={`/products/${item.id}`} className="flex items-center flex-col">
                          <img
                            src={item.image.length > 0 ? item.image :  "/placeholder.jpg"}
                            alt={item.media && item.media.length > 0 ? item.media[0].alt : item.title}
                            width={200}
                            height={200}
                            className="tpsc-product-image"
                          />
                          <h2 className="tpsc-product-title">{item.title}</h2>
                        </Link>
                        <div className="tpsc-price-buttons">
                          <button
                            className={`tpsc-price-button ${priceTypes[item.id] === "wholesale" ? "tpsc-price-button-active" : ""}`}
                            onClick={() => handlePriceTypeChange(item.id, "wholesale")}
                            aria-label="انتخاب قیمت عمده"
                          >
                            قیمت عمده
                          </button>
                          <button
                            className={`tpsc-price-button ${priceTypes[item.id] === "single" ? "tpsc-price-button-active" : ""}`}
                            onClick={() => handlePriceTypeChange(item.id, "single")}
                            aria-label="انتخاب قیمت تکی"
                          >
                            قیمت تکی
                          </button>
                        </div>
                        {!item.inStock ? (
                          <div className="text-center w-full">ناموجود</div>
                        ) : (
                          <div className="tpsc-price-discount-container">
                            <p className="tpsc-price-strikethrough-text">
                              {priceTypes[item.id] === "single" ? item.originalPrice : item.wholesalePrice}
                            </p>
                            <p className="tpsc-discount-badge">
                              {priceTypes[item.id] === "single" ? item.discount : item.discountwholesale}
                            </p>
                          </div>
                        )}
                        {!item.inStock ? (
                          <div className="w-full flex justify-between items-center">
                            <p className="tpsc-price">موجود شد خبرم کن</p>
                            <button
                              className="tpsc-add-to-nocart"
                              onClick={() => handleNotifyMe(item.id)}
                              aria-label="نمایش انتخابگر تعداد"
                            >
                              <NotificationAdd fontSize="small" />
                            </button>
                          </div>
                        ) : (
                          <div className="tpsc-price-quantity">
                            <p className="tpsc-price">
                              {priceTypes[item.id] === "single" ? item.discountedPrice : item.discountwholesalePrice} تومان
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
                              <button
                                onClick={() => handleQuantityChange(item.id, 1)}
                                aria-label="افزایش تعداد"
                              >
                                <AddCircleOutline fontSize="small" />
                              </button>
                              <input
                                type="text"
                                className="tpsc-quantity-input"
                                value={cartQuantities[item.id] || 0}
                                readOnly
                                aria-label="تعداد محصول"
                              />
                              <button
                                onClick={() => handleQuantityChange(item.id, -1)}
                                aria-label="کاهش تعداد"
                              >
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
                                <button
                                  onClick={() => handleQuantityChange(item.id, 1)}
                                  aria-label="افزایش تعداد"
                                >
                                  <AddCircleOutline fontSize="small" />
                                </button>
                                <input
                                  type="text"
                                  className="tpsc-quantity-input"
                                  value={cartQuantities[item.id] || 0}
                                  readOnly
                                  aria-label="تعداد محصول"
                                />
                                <button
                                  onClick={() => handleQuantityChange(item.id, -1)}
                                  aria-label="کاهش تعداد"
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
                                    aria-label="ثبت تعداد محصول"
                                  >
                                    ثبت
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
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
  );
}