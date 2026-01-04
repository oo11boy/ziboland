"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import "rc-slider/assets/index.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@/Components/Sliders/TabProductsSlider/TabProductSlider.css";
import "@/Components/Sliders/Sliders.css";
import "./SearchPage.css";
import { useSearchParams, useRouter } from "next/navigation";
import { useCart } from "@/ContextApi/CartContext";
import { Categoryapi, Product, Variant } from "@/types/types";
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
  initialSearchTerm = "",
}: {
  queryParams: QueryParams;
  initialSearchTerm?: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { dispatch } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Categoryapi[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(initialSearchTerm);

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
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000000]);
  const [rating, setRating] = useState(0);
  const [discount, setDiscount] = useState(false);
  const [inStock, setInStock] = useState(false);
  const [brandSearch, setBrandSearch] = useState("");
  const [cartQuantities, setCartQuantities] = useState<{ [key: number]: number }>({});
  const [priceTypes, setPriceTypes] = useState<{ [key: number]: "single" | "wholesale" }>({});
  const [selectedVariants, setSelectedVariants] = useState<{ [key: number]: Variant | null }>({});
  const [showQuantitySelector, setShowQuantitySelector] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState<string>("جدیدترین");

  const productsRef = useRef<HTMLDivElement>(null);

  // تابع آپدیت URL
  const updateSearchQuery = (newValue: string) => {
    const trimmed = newValue.trim();
    const newParams = new URLSearchParams(searchParams.toString());
    if (trimmed) newParams.set("q", encodeURIComponent(trimmed));
    else newParams.delete("q");
    const newUrl = newParams.toString() ? `/search?${newParams.toString()}` : "/search";
    router.push(newUrl, { scroll: false });
  };

  // همگام‌سازی searchTerm از URL
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) {
      try {
        setSearchTerm(decodeURIComponent(q));
      } catch {
        setSearchTerm(q);
      }
    }
  }, [searchParams]);

  // دریافت داده‌ها
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
        setError("خطا در بارگذاری داده‌ها");
        toast.error("خطا در بارگذاری داده‌ها");
      }
    };
    fetchData();
  }, []);

  // Sync فیلترها از URL
  useEffect(() => {
    const mothercatId = searchParams.get("mothercatId");
    const subcatId = searchParams.get("subcatId");
    const itemId = searchParams.get("itemId");
    const brands = searchParams.get("brands");

    if (mothercatId) setSelectedMothercatIds([parseInt(mothercatId)]);
    if (subcatId) setSelectedSubcatIds([parseInt(subcatId)]);
    if (itemId) setSelectedItemIds([parseInt(itemId)]);
    if (brands) setSelectedBrands(brands.split(","));
  }, [searchParams]);

  // مقداردهی اولیه واریانت‌ها
  useEffect(() => {
    if (products.length > 0) {
      const initialPriceTypes: { [key: number]: "single" | "wholesale" } = {};
      const initialVariants: { [key: number]: Variant | null } = {};
      products.forEach((product) => {
        initialPriceTypes[product.id] = "single";
        initialVariants[product.id] = product.variants?.[0] || null;
      });
      setPriceTypes(initialPriceTypes);
      setSelectedVariants(initialVariants);
    }
  }, [products]);

  const handleShowQuantitySelector = (productId: number) => {
    setShowQuantitySelector(showQuantitySelector === productId ? null : productId);
  };

const handleQuantityChange = (productId: number, delta: number) => {
  setCartQuantities((prev) => {
    const currentQty = prev[productId] || 0;
    const activeVariant = selectedVariants[productId];
    const stockQuantity = activeVariant?.stock_quantity ?? 0;
    
    let newQuantity = currentQty + delta;
    if (newQuantity > stockQuantity) {
        toast.warning(`حداکثر موجودی: ${stockQuantity} عدد`);
        newQuantity = stockQuantity;
    }
    newQuantity = Math.max(0, newQuantity);

    if (activeVariant && activeVariant.price_wholesale > 0) {
      const minWholesale = activeVariant.min_wholesale || 1;
      setPriceTypes(prevTypes => ({
        ...prevTypes,
        [productId]: newQuantity >= minWholesale ? "wholesale" : "single"
      }));
    }
    return { ...prev, [productId]: newQuantity };
  });
};

  const handlePriceTypeChange = (productId: number, type: "single" | "wholesale") => {
    const activeVariant = selectedVariants[productId];
    if (type === "wholesale" && (!activeVariant || activeVariant.price_wholesale <= 0)) return;
    setPriceTypes((prev) => ({ ...prev, [productId]: type }));
  };

  const handleVariantSelect = (productId: number, variant: Variant) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variant }));
    setCartQuantities((prev) => ({ ...prev, [productId]: 0 }));
    setPriceTypes(prev => ({ ...prev, [productId]: "single" }));
    setShowQuantitySelector(null);
  };

const handleAddToCart = (productId: number) => {
  const product = products.find((p) => p.id === productId);
  const quantity = cartQuantities[productId];
  const activeVariant = selectedVariants[productId];
  
  if (!product || !quantity || quantity < 1 || !activeVariant) {
    toast.error("لطفاً تعداد و رنگ محصول را انتخاب کنید");
    return;
  }

  const effectivePriceType = priceTypes[productId] || "single";
  const minWholesale = activeVariant.min_wholesale || 1;
  const retailDiscountPercent = activeVariant.discount_percent || 0;

  // محاسبه قیمت واحد دقیقا مشابه AddToCartInfo
  const unitPriceAfterDiscount = effectivePriceType === "wholesale"
    ? activeVariant.price_wholesale
    : Math.round(activeVariant.price_single * (1 - retailDiscountPercent / 100));

  dispatch({
    type: "ADD_ITEM",
    payload: {
      id: productId,
      title: product.title,
      quantity,
      priceType: effectivePriceType,
      price: unitPriceAfterDiscount.toString(),
      image: activeVariant.image_main || product.image || "/placeholder.jpg",
      discount: effectivePriceType === "wholesale" ? "0" : `${retailDiscountPercent}%`,
      color: {
        englishName: activeVariant.color_englishName,
        persianName: activeVariant.color_persianName || "",
        hexCode: activeVariant.color_hexCode,
      },
      // فیلد‌های زیر برای محاسبات سبد خرید ضروری هستند:
      baseRetailPrice: activeVariant.price_single,
      baseWholesalePrice: activeVariant.price_wholesale,
      retailDiscountPercent: retailDiscountPercent,
      minWholesale: minWholesale,
      stock_quantity: activeVariant.stock_quantity ?? 0,
    },
  });

  toast.success("به سبد خرید اضافه شد");
  setCartQuantities((prev) => ({ ...prev, [productId]: 0 }));
  setShowQuantitySelector(null);
};

  const handleNotifyMe = () => toast.info("اطلاع‌رسانی فعال شد");

  const clearFilters = () => {
    setSearchTerm("");
    updateSearchQuery("");
    setSelectedBrands([]);
    setSelectedMothercatIds([]);
    setSelectedSubcatIds([]);
    setSelectedItemIds([]);
    setPriceRange([0, 100000000]);
    setRating(0);
    setDiscount(false);
    setInStock(false);
  };

  const allBrands = Array.from(new Set(products.map((p) => p.brandDetails?.title).filter(Boolean))) as string[];
  const allCategories = categories.filter((cat) => cat.mothercat === 1);
  const filteredCategories = allCategories.filter((cat) => cat.name.includes(categorySearch));

  const toggleMothercatExpansion = (id: number) =>
    setExpandedMothercats((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const toggleSubcatExpansion = (id: number) =>
    setExpandedSubcats((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const getSortedProducts = () => {
    const filtered = products.filter((p) => {
      const activeVariant = selectedVariants[p.id] || p.variants?.[0];
      const currentPrice = activeVariant ? activeVariant.price_single : 0;

      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesBrand = selectedBrands.length === 0 || (p.brandDetails && selectedBrands.includes(p.brandDetails.title));
      const matchesMothercat = selectedMothercatIds.length === 0 || selectedMothercatIds.includes(p.mothercatId);
      const matchesSubcat = selectedSubcatIds.length === 0 || selectedSubcatIds.includes(p.subcatId);
      const matchesItem = selectedItemIds.length === 0 || (p.itemId && selectedItemIds.includes(p.itemId));
      const matchesPrice = currentPrice >= priceRange[0] && currentPrice <= priceRange[1];
      const matchesDiscount = !discount || (activeVariant && activeVariant.discount_percent > 0);
      const matchesRating = p.rating >= rating;
      const matchesStock = !inStock || p.variants?.some(v => v.stock_quantity > 0);

      return matchesSearch && matchesBrand && matchesMothercat && matchesSubcat &&
             matchesItem && matchesPrice && matchesDiscount && matchesRating && matchesStock;
    });

    switch (sortOption) {
      case "گران‌ترین": return filtered.sort((a, b) => (selectedVariants[b.id]?.price_single || 0) - (selectedVariants[a.id]?.price_single || 0));
      case "ارزان‌ترین": return filtered.sort((a, b) => (selectedVariants[a.id]?.price_single || 0) - (selectedVariants[b.id]?.price_single || 0));
      case "محبوب‌ترین": return filtered.sort((a, b) => b.rating - a.rating);
      case "پرفروش‌ترین": return filtered.sort((a, b) => (b.sales || 0) - (a.sales || 0));
      default: return filtered.sort((a, b) => b.id - a.id);
    }
  };

  const filteredProducts = getSortedProducts();

  // انیمیشن‌ها
  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

  return (
    <div dir="rtl" className="min-h-screen bg-[#F7F7F7] font-yekan">
      <ToastContainer rtl theme="colored" position="top-center" />
      <MobileHeader
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        updateSearchQuery={updateSearchQuery}
      />
      <div className="w-[95%] mx-auto p-4 md:p-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <AnimatePresence>
            {showFilters && (
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
                filterVariants={{}}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                updateSearchQuery={updateSearchQuery}
            
              />
            )}
          </AnimatePresence>

          <FilterPanel
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            updateSearchQuery={updateSearchQuery}
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
              <div className="text-sm my-4 text-gray-600">تعداد نتایج: {filteredProducts.length}</div>
              <ProductGrid
                filteredProducts={filteredProducts}
                cardVariants={cardVariants}
                priceTypes={priceTypes}
                handlePriceTypeChange={handlePriceTypeChange}
                selectedVariants={selectedVariants}
                handleVariantSelect={handleVariantSelect}
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