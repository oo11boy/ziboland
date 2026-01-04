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
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);
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

  // تابع مشترک برای آپدیت query string مربوط به جستجو (q)
  const updateSearchQuery = (newValue: string) => {
    const trimmed = newValue.trim();
    const newParams = new URLSearchParams(searchParams.toString());

    if (trimmed) {
      newParams.set("q", encodeURIComponent(trimmed));
    } else {
      newParams.delete("q");
    }

    const newSearch = newParams.toString();
    const newUrl = newSearch ? `?${newSearch}` : "";

    if (window.location.search !== newUrl) {
      router.push(`/search${newUrl}`, { scroll: false });
    }
  };

  // همگام‌سازی اولیه searchTerm از URL (هنگام ورود مستقیم یا رفرش)
  useEffect(() => {
    const q = searchParams.get("q");

    if (!q) {
      if (searchTerm) setSearchTerm("");
      return;
    }

    try {
      let decoded = decodeURIComponent(q);
      try {
        const doubleDecoded = decodeURIComponent(decoded);
        if (doubleDecoded !== decoded) {
          decoded = doubleDecoded;
        }
      } catch {}
      if (decoded !== searchTerm) {
        setSearchTerm(decoded);
      }
    } catch {
      if (q !== searchTerm) {
        setSearchTerm(q);
      }
    }
  }, [searchParams]);

  // Fetch داده‌های محصولات و دسته‌بندی‌ها
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

  // Sync سایر فیلترها از URL
  useEffect(() => {
    const mothercatId = searchParams.get("mothercatId");
    const subcatId = searchParams.get("subcatId");
    const itemId = searchParams.get("itemId");
    const brands = searchParams.get("brands");

    setSelectedMothercatIds(mothercatId ? [parseInt(mothercatId)] : []);
    setSelectedSubcatIds(subcatId ? [parseInt(subcatId)] : []);
    setSelectedItemIds(itemId ? [parseInt(itemId)] : []);
    setSelectedBrands(brands ? brands.split(",") : []);
  }, [searchParams]);

  // اسکرول نرم به نتایج بعد از تغییر فیلترها (فقط دسکتاپ)
  useEffect(() => {
    if (window.innerWidth >= 1024 && productsRef.current) {
      productsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [
    searchTerm,
    selectedBrands,
    selectedMothercatIds,
    selectedSubcatIds,
    selectedItemIds,
    priceRange,
    rating,
    discount,
    inStock,
    sortOption,
  ]);

  // مقداردهی اولیه priceTypes و variants
  useEffect(() => {
    if (products.length > 0) {
      const initialPriceTypes: { [key: number]: "single" | "wholesale" } = {};
      const initialVariants: { [key: number]: Variant | null } = {};
      products.forEach((product) => {
        initialPriceTypes[product.id] = "single";
        initialVariants[product.id] =
          product.variants && product.variants.length > 0 ? product.variants[0] : null;
      });
      setPriceTypes(initialPriceTypes);
      setSelectedVariants(initialVariants);
    }
  }, [products]);

  // ==== توابع کمکی (بدون تغییر) ====
  const handleShowQuantitySelector = (productId: number) => {
    setShowQuantitySelector(showQuantitySelector === productId ? null : productId);
  };

  const handleQuantityChange = (productId: number, delta: number) => {
    setCartQuantities((prev) => {
      const newQuantity = (prev[productId] || 0) + delta;
      const product = products.find((p) => p.id === productId);
      const activeVariant = selectedVariants[productId];
      if (!product) return prev;
      const wholesalePriceNum = activeVariant
        ? activeVariant.price_wholesale
        : parseInt(String(product.discountwholesalePrice || "0").replace(/[^\d]/g, ""), 10) || 0;
      const minWholesale = activeVariant?.min_wholesale || product.minwholesale || 1;
      if (wholesalePriceNum > 0 && newQuantity >= minWholesale) {
        setPriceTypes((prev) => ({ ...prev, [productId]: "wholesale" }));
      } else {
        setPriceTypes((prev) => ({ ...prev, [productId]: "single" }));
      }
      return { ...prev, [productId]: newQuantity < 0 ? 0 : newQuantity };
    });
  };

  const handlePriceTypeChange = (productId: number, type: "single" | "wholesale") => {
    const product = products.find((p) => p.id === productId);
    const activeVariant = selectedVariants[productId];
    const wholesalePriceNum = activeVariant
      ? activeVariant.price_wholesale
      : parseInt(String(product?.discountwholesalePrice || "0").replace(/[^\d]/g, ""), 10) || 0;
    if (type === "wholesale" && wholesalePriceNum === 0) return;
    setPriceTypes((prev) => ({ ...prev, [productId]: type }));
  };

  const handleVariantSelect = (productId: number, variant: Variant) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variant }));
    setCartQuantities((prev) => ({ ...prev, [productId]: 0 }));
    setShowQuantitySelector(null);
  };

  const handleAddToCart = (productId: number) => {
    const product = products.find((p) => p.id === productId);
    const quantity = cartQuantities[productId];
    const activeVariant = selectedVariants[productId];
    if (!product || !quantity || quantity < 1) {
      toast.error("لطفاً تعداد محصول را انتخاب کنید");
      return;
    }
    const effectivePriceType = priceTypes[productId] || "single";
    const unitPrice = effectivePriceType === "single"
      ? (activeVariant?.price_single || parseInt(String(product.discountedPrice).replace(/[^\d]/g, ""), 10) || 0)
      : (activeVariant?.price_wholesale || parseInt(String(product.discountwholesalePrice).replace(/[^\d]/g, ""), 10) || 0);
    const discount = effectivePriceType === "single"
      ? (activeVariant?.discount_percent?.toString() || product.discount || "0")
      : (activeVariant?.discount_wholesale_percent?.toString() || product.discountwholesale || "0");
    const minWholesale = activeVariant?.min_wholesale || product.minwholesale || 1;
    if (effectivePriceType === "wholesale" && quantity < minWholesale) {
      toast.error(`حداقل تعداد برای قیمت عمده ${minWholesale} عدد است.`);
      return;
    }
    dispatch({
      type: "ADD_ITEM",
      payload: {
        id: productId,
        title: product.title,
        quantity,
        priceType: effectivePriceType,
        price: unitPrice.toString(),
        image: activeVariant?.image_main || product.image || "/placeholder.jpg",
        discount,
        color: activeVariant
          ? {
              englishName: activeVariant.color_englishName,
              persianName: activeVariant.color_persianName || "",
              hexCode: activeVariant.color_hexCode,
            }
          : null,
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
    updateSearchQuery("");
    setSelectedBrands([]);
    setSelectedMothercatIds([]);
    setSelectedSubcatIds([]);
    setSelectedItemIds([]);
    setPriceRange([0, 50000000]);
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
    setExpandedMothercats((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

  const toggleSubcatExpansion = (id: number) =>
    setExpandedSubcats((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));

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
        (product.itemId && selectedItemIds.includes(product.itemId));
      const matchesPrice = product.numericPrice >= priceRange[0] && product.numericPrice <= priceRange[1];
      const matchesDiscount = !discount || product.discount !== "0";
      const matchesRating = product.rating >= rating;

      // فیلتر "فقط موجود" — چک می‌کنیم آیا حداقل یک واریانت موجود دارد
      const matchesStock = !inStock || product.variants?.some(v => (v.stock_quantity ?? 0) > 0);

      return matchesSearch && matchesBrand && matchesMothercat && matchesSubcat &&
             matchesItem && matchesPrice && matchesDiscount && matchesRating && matchesStock;
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

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

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
                  filterVariants={filterVariants}
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  updateSearchQuery={updateSearchQuery}
                />
              </>
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
              <div className="text-sm my-4 text-gray-600">
                تعداد نتایج: {filteredProducts.length}
              </div>
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