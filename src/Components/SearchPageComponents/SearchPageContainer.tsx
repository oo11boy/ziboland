"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion"; // Variants اضافه شد
import "rc-slider/assets/index.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@/Components/Sliders/TabProductsSlider/TabProductSlider.css";
import "@/Components/Sliders/Sliders.css";
import "./SearchPage.css";
import { useSearchParams } from "next/navigation";
import { useCart } from "@/ContextApi/CartContext";
import { Categoryapi, Product } from "@/types/types";
import FilterPanel from "./FilterPanel";
import MobileFilterPanel from "./MobileFilterPanel";
import MobileHeader from "./MobileHeader";
import SortBar from "./SortBar";
import ProductGrid from "./ProductGrid";

interface QueryParams {
  mothercatId?: string;
  subcatId?: string;
  brands?: string[];
}

export default function SearchPageContainer({
  queryParams,
}: {
  queryParams: QueryParams;
}) {
  const searchParams = useSearchParams();
  const { dispatch } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Categoryapi[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>(queryParams.brands || []);
  const [selectedMothercatIds, setSelectedMothercatIds] = useState<number[]>(
    queryParams.mothercatId ? [parseInt(queryParams.mothercatId)] : []
  );
  const [selectedSubcatIds, setSelectedSubcatIds] = useState<number[]>(
    queryParams.subcatId ? [parseInt(queryParams.subcatId)] : []
  );
  const [selectedItemIds, setSelectedItemIds] = useState<number[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [expandedMothercats, setExpandedMothercats] = useState<number[]>([]);
  const [expandedSubcats, setExpandedSubcats] = useState<number[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]);
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

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch("/api/products"),
          fetch("/api/categories"),
        ]);

        if (!productsRes.ok || !categoriesRes.ok) throw new Error("خطا در دریافت داده‌ها");

        const productsData: Product[] = await productsRes.json();
        const categoriesData: Categoryapi[] = await categoriesRes.json();

        setProducts(productsData);
        setCategories(categoriesData);
      } catch (err) {
        setError("خطا در بارگذاری داده‌ها. لطفاً دوباره تلاش کنید.");
        toast.error("خطا در بارگذاری داده‌ها");
      }
    };
    fetchData();
  }, []);

  // Sync query params
  useEffect(() => {
    const mothercatId = searchParams.get("mothercatId");
    const subcatId = searchParams.get("subcatId");
    const itemId = searchParams.get("itemId"); // اضافه شد
    const brands = searchParams.get("brands");

    setSelectedMothercatIds(mothercatId ? [parseInt(mothercatId)] : []);
    setSelectedSubcatIds(subcatId ? [parseInt(subcatId)] : []);
    setSelectedItemIds(itemId ? [parseInt(itemId)] : []); // اضافه شد
    setSelectedBrands(brands ? brands.split(",") : []);
  }, [searchParams]);

  // Scroll to results on filter change
  useEffect(() => {
    if (window.innerWidth >= 1024 && productsRef.current) {
      productsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [
    searchTerm, selectedBrands, selectedMothercatIds, selectedSubcatIds,
    selectedItemIds, priceRange, rating, discount, inStock, sortOption
  ]);

  // Initialize priceTypes
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

      // فقط اگر قیمت عمده وجود داشته باشد و تعداد کافی باشد → عمده فعال شود
      if (
        product.discountwholesalePrice > 0 &&
        newQuantity >= product.minwholesale
      ) {
        handlePriceTypeChange(productId, "wholesale");
      } else {
        handlePriceTypeChange(productId, "single");
      }

      return { ...prev, [productId]: newQuantity < 0 ? 0 : newQuantity };
    });
  };

  const handlePriceTypeChange = (productId: number, type: "single" | "wholesale") => {
    const product = products.find((p) => p.id === productId);

    // اگر قیمت عمده صفر بود → اجازه تغییر به عمده نده
    if (type === "wholesale" && (!product || product.discountwholesalePrice <= 0)) {
      return;
    }

    setPriceTypes((prev) => ({ ...prev, [productId]: type }));
  };

  const handleAddToCart = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product || !cartQuantities[productId] || cartQuantities[productId] < 1) {
      toast.error("لطفاً تعداد محصول را انتخاب کنید");
      return;
    }

    if (!product.inStock) {
      toast.error("محصول موجود نیست");
      return;
    }

    const quantity = cartQuantities[productId];

    // تعیین نوع قیمت واقعی
    const effectivePriceType =
      product.discountwholesalePrice > 0
        ? priceTypes[productId] || "single"
        : "single";

    const price =
      effectivePriceType === "single"
        ? product.discountedPrice
        : product.discountwholesalePrice;

    const discount =
      effectivePriceType === "single" ? product.discount : product.discountwholesale;

    if (effectivePriceType === "wholesale" && quantity < product.minwholesale) {
      toast.error(`حداقل تعداد برای قیمت عمده ${product.minwholesale} عدد است.`);
      return;
    }

    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: productId,
        title: product.title,
        quantity,
        priceType: effectivePriceType,
        price: price.toString(),
        image: product.image || "/placeholder.jpg",
        discount,
      },
    });

    toast.success("محصول به سبد خرید اضافه شد!");
    setCartQuantities((prev) => ({ ...prev, [productId]: 0 }));
    setShowQuantitySelector(null);
  };

  const handleNotifyMe = () => {
    toast.info("هنگامی که محصول موجود شد، به شما اطلاع خواهیم داد!");
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedBrands([]);
    setSelectedMothercatIds([]);
    setSelectedSubcatIds([]);
    setSelectedItemIds([]);
    setPriceRange([0, 5000000]);
    setRating(0);
    setDiscount(false);
    setInStock(false);
    setSortOption("جدیدترین");
  };

  const allBrands = Array.from(new Set(products.map((p) => p.brandDetails?.title || "")));
  const allCategories = categories.filter((cat) => cat.mothercat === 1);
  const filteredCategories = allCategories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const toggleMothercatExpansion = (id: number) =>
    setExpandedMothercats((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  const toggleSubcatExpansion = (id: number) =>
    setExpandedSubcats((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  const getSortedProducts = () => {
    const filtered = products.filter((product) => {
      const matchesSearch = product.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrand = selectedBrands.length === 0 ||
        (product.brandDetails && selectedBrands.includes(product.brandDetails.title));
      const matchesMothercat = selectedMothercatIds.length === 0 ||
        selectedMothercatIds.includes(product.mothercatId);
      const matchesSubcat = selectedSubcatIds.length === 0 ||
        selectedSubcatIds.includes(product.subcatId);
      const matchesItem = selectedItemIds.length === 0 ||
        selectedItemIds.includes(product.itemId ?? 0);
      const matchesPrice = product.numericPrice >= priceRange[0] && product.numericPrice <= priceRange[1];
      const matchesDiscount = !discount || product.discount !== "0%";
      const matchesStock = !inStock || product.inStock;
      const matchesRating = product.rating >= rating;

      return matchesSearch && matchesBrand && matchesMothercat && matchesSubcat &&
             matchesItem && matchesPrice && matchesDiscount && matchesStock && matchesRating;
    });

    switch (sortOption) {
      case "جدیدترین": return filtered.sort((a, b) => b.id - a.id);
      case "گران‌ترین": return filtered.sort((a, b) => b.numericPrice - a.numericPrice);
      case "ارزان‌ترین": return filtered.sort((a, b) => a.numericPrice - b.numericPrice);
      case "محبوب‌ترین": return filtered.sort((a, b) => b.rating - a.rating);
      case "پرفروش‌ترین": return filtered.sort((a, b) => (b.sales || 0) - (a.sales || 0));
      default: return filtered;
    }
  };

  const filteredProducts = getSortedProducts();

  // اصلاح شده: تعریف cardVariants با تایپ صحیح
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  // اصلاح شده: تعریف filterVariants با تایپ صحیح
  const filterVariants: Variants = {
    hidden: { opacity: 0, x: -100 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -100, transition: { duration: 0.2 } },
  };

  if (error) {
    return (
      <div dir="rtl" className="min-h-screen bg-[#F7F7F7] flex items-center justify-center">
        <p className="text-lg text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[#F7F7F7] font-yekan">
      <ToastContainer rtl theme="colored" position="top-center" autoClose={3000} />

      <MobileHeader showFilters={showFilters} setShowFilters={setShowFilters} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <div className="w-[95%] mx-auto p-4 md:p-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <AnimatePresence>
            {showFilters && (
              <>
                <motion.div
                  className="fixed inset-0 bg-black/50 z-40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowFilters(false)}
                />
                <MobileFilterPanel
                  filteredProducts={filteredProducts}
                  clearFilters={clearFilters}
                  categorySearch={categorySearch}
                  setCategorySearch={setCategorySearch}
                  filteredCategories={filteredCategories}
                  selectedMothercatIds={selectedMothercatIds}
                  setSelectedMothercatIds={setSelectedMothercatIds}
                  expandedMothercats={expandedMothercats}
                  toggleMothercatExpansion={toggleMothercatExpansion}
                  selectedSubcatIds={selectedSubcatIds}
                  setSelectedSubcatIds={setSelectedSubcatIds}
                  expandedSubcats={expandedSubcats}
                  toggleSubcatExpansion={toggleSubcatExpansion}
                  selectedItemIds={selectedItemIds}
                  setSelectedItemIds={setSelectedItemIds}
                  brandSearch={brandSearch}
                  setBrandSearch={setBrandSearch}
                  allBrands={allBrands}
                  selectedBrands={selectedBrands}
                  setSelectedBrands={setSelectedBrands}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  rating={rating}
                  setRating={setRating}
                  discount={discount}
                  setDiscount={setDiscount}
                  inStock={inStock}
                  setInStock={setInStock}
                  filterVariants={filterVariants} // اصلاح شده
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                />
              </>
            )}
          </AnimatePresence>

          <FilterPanel
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            clearFilters={clearFilters}
            categorySearch={categorySearch}
            setCategorySearch={setCategorySearch}
            filteredCategories={filteredCategories}
            selectedMothercatIds={selectedMothercatIds}
            setSelectedMothercatIds={setSelectedMothercatIds}
            expandedMothercats={expandedMothercats}
            toggleMothercatExpansion={toggleMothercatExpansion}
            selectedSubcatIds={selectedSubcatIds}
            setSelectedSubcatIds={setSelectedSubcatIds}
            expandedSubcats={expandedSubcats}
            toggleSubcatExpansion={toggleSubcatExpansion}
            selectedItemIds={selectedItemIds}
            setSelectedItemIds={setSelectedItemIds}
            brandSearch={brandSearch}
            setBrandSearch={setBrandSearch}
            allBrands={allBrands}
            selectedBrands={selectedBrands}
            setSelectedBrands={setSelectedBrands}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            rating={rating}
            setRating={setRating}
            discount={discount}
            setDiscount={setDiscount}
            inStock={inStock}
            setInStock={setInStock}
          />

          <div className="w-full lg:w-3/4">
            <div ref={productsRef}>
              <SortBar sortOption={sortOption} setSortOption={setSortOption} />
              <div className="text-sm my-4 text-gray-600">
                تعداد نتایج: {filteredProducts.length}
              </div>

              <ProductGrid
                filteredProducts={filteredProducts}
                cardVariants={cardVariants}
                priceTypes={priceTypes}
                handlePriceTypeChange={handlePriceTypeChange}
                cartQuantities={cartQuantities}
                showQuantitySelector={showQuantitySelector}
                handleShowQuantitySelector={handleShowQuantitySelector}
                handleQuantityChange={handleQuantityChange}
                handleAddToCart={handleAddToCart}
                handleNotifyMe={handleNotifyMe}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}