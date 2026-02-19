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
  const { dispatch, state: { cartItems } } = useCart();

  const lastPriceTypeRef = useRef<{ [key: number]: "single" | "wholesale" }>({});

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
// تابع آپدیت URL - اصلاح شده برای جلوگیری از حذف فاصله در هنگام تایپ
  const updateSearchQuery = (newValue: string) => {
    // برای نمایش در URL فواصل ابتدا و انتها را حذف می‌کنیم
    const trimmedValue = newValue.trim();
    const newParams = new URLSearchParams(searchParams.toString());
    
    if (trimmedValue) {
      newParams.set("q", encodeURIComponent(trimmedValue));
    } else {
      newParams.delete("q");
    }
    
    // استفاده از { scroll: false } برای جلوگیری از پرش صفحه به بالا
    const newUrl = newParams.toString() ? `/search?${newParams.toString()}` : "/search";
    router.push(newUrl, { scroll: false });
  };
// این useEffect را جایگزین منطق قبلی آپدیت URL کنید
useEffect(() => {
  // اگر مقدار جدید با مقدار فعلی URL یکی نیست، آپدیت کن
  const delayDebounceFn = setTimeout(() => {
    const currentQ = searchParams.get("q") || "";
    if (searchTerm.trim() !== decodeURIComponent(currentQ).trim()) {
      updateSearchQuery(searchTerm);
    }
  }, 200); // تاخیر برای اینکه کاربر بتواند Space بزند و کلمه بعدی را بنویسد

  return () => clearTimeout(delayDebounceFn);
}, [searchTerm]);
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

  // مقداردهی اولیه هوشمند واریانت‌ها (ارزان‌ترین و موجودترین)
  useEffect(() => {
    if (products.length > 0) {
      const initialPriceTypes: { [key: number]: "single" | "wholesale" } = {};
      const initialVariants: { [key: number]: Variant | null } = {};

      products.forEach((product) => {
        initialPriceTypes[product.id] = "single";

        if (product.variants && product.variants.length > 0) {
          const availableVariants = product.variants.filter(
            (v) => (v.stock_quantity ?? 0) > 0
          );

          const baseList = availableVariants.length > 0 ? availableVariants : product.variants;

          const cheapest = baseList.reduce((min, current) => {
            const currentFinalPrice = (current.price_single || 0) * (1 - (current.discount_percent || 0) / 100);
            const minFinalPrice = (min.price_single || 0) * (1 - (min.discount_percent || 0) / 100);
            return currentFinalPrice < minFinalPrice ? current : min;
          }, baseList[0]);

          initialVariants[product.id] = cheapest;
        } else {
          initialVariants[product.id] = null;
        }
      });

      setPriceTypes(initialPriceTypes);
      setSelectedVariants(initialVariants);
    }
  }, [products]);

  const getCartItem = (productId: number) => {
    const activeVariant = selectedVariants[productId];
    if (!activeVariant) return null;

    return cartItems.find(
      (item) =>
        item.id === productId &&
        item.color?.englishName === activeVariant.color_englishName
    );
  };

  const handleShowQuantitySelector = (productId: number) => {
    const activeVariant = selectedVariants[productId];
    if (!activeVariant) return;

    const cartItem = getCartItem(productId);

    setCartQuantities((prev) => ({
      ...prev,
      [productId]: cartItem ? cartItem.quantity : 1,
    }));

    setShowQuantitySelector(
      showQuantitySelector === productId ? null : productId
    );
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

      let newPriceType: "single" | "wholesale" = "single";

      if (activeVariant && activeVariant.price_wholesale > 0) {
        const minWholesale = activeVariant.min_wholesale || 1;
        newPriceType = newQuantity >= minWholesale ? "wholesale" : "single";

        // چک تغییر نوع قیمت
        const prevType = priceTypes[productId] || "single";
        const lastShownType = lastPriceTypeRef.current[productId] || prevType;

        if (newPriceType !== prevType && newPriceType !== lastShownType) {
          if (newPriceType === "wholesale") {
            toast.success(`قیمت عمده (${minWholesale} عدد به بالا) اعمال شد`, {
              position: "top-center",
              autoClose: 2800,
              theme: "colored",
              toastId: `wholesale-${productId}`,
            });
          } else {
            toast.info("قیمت به حالت تکی بازگشت", {
              position: "top-center",
              autoClose: 2800,
              theme: "colored",
              toastId: `single-${productId}`,
            });
          }

          lastPriceTypeRef.current = {
            ...lastPriceTypeRef.current,
            [productId]: newPriceType,
          };
        }
      }

      setPriceTypes((prevTypes) => ({
        ...prevTypes,
        [productId]: newPriceType,
      }));

      return { ...prev, [productId]: newQuantity };
    });
  };

  const handlePriceTypeChange = (productId: number, type: "single" | "wholesale") => {
    const activeVariant = selectedVariants[productId];
    if (type === "wholesale" && (!activeVariant || activeVariant.price_wholesale <= 0)) return;

    const prevType = priceTypes[productId] || "single";
    if (type !== prevType) {
      if (type === "wholesale") {
        toast.success(`قیمت به حالت عمده تغییر کرد`, {
          position: "top-center",
          autoClose: 2800,
          theme: "colored",
          toastId: `wholesale-manual-${productId}`,
        });
      } else {
        toast.info("قیمت به حالت تکی بازگشت", {
          position: "top-center",
          autoClose: 2800,
          theme: "colored",
          toastId: `single-manual-${productId}`,
        });
      }

      lastPriceTypeRef.current = {
        ...lastPriceTypeRef.current,
        [productId]: type,
      };
    }

    setPriceTypes((prev) => ({ ...prev, [productId]: type }));
  };

  const handleVariantSelect = (productId: number, variant: Variant) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variant }));
    setCartQuantities((prev) => ({ ...prev, [productId]: 0 }));
    setPriceTypes(prev => ({ ...prev, [productId]: "single" }));
    setShowQuantitySelector(null);
  };

  const handleAddToCart = (productId: number) => {
    const quantity = cartQuantities[productId] ?? 0;
    const activeVariant = selectedVariants[productId];
    if (!activeVariant) return;

    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const cartItem = getCartItem(productId);

    if (quantity <= 0) {
      if (cartItem) {
        dispatch({
          type: "REMOVE_ITEM_BY_TYPE",
          payload: {
            id: productId,
            color: cartItem.color,
          },
        });
        toast.info("محصول از سبد خرید حذف شد");
      }
      setShowQuantitySelector(null);
      setCartQuantities((prev) => ({ ...prev, [productId]: 0 }));
      return;
    }

    const isWholesale =
      quantity >= (activeVariant.min_wholesale || 1) &&
      activeVariant.price_wholesale > 0;

    const unitPrice = isWholesale
      ? activeVariant.price_wholesale
      : Math.round(
          activeVariant.price_single * (1 - (activeVariant.discount_percent || 0) / 100)
        );

    const newPriceType = isWholesale ? "wholesale" : "single";

    const prevType = priceTypes[productId] || "single";
    const lastShownType = lastPriceTypeRef.current[productId] || prevType;

    if (newPriceType !== prevType && newPriceType !== lastShownType) {
      if (newPriceType === "wholesale") {
        toast.success(`قیمت عمده اعمال شد`, {
          position: "top-center",
          autoClose: 2800,
          theme: "colored",
          toastId: `wholesale-cart-${productId}`,
        });
      } else {
        toast.info("قیمت به تکی بازگشت", {
          position: "top-center",
          autoClose: 2800,
          theme: "colored",
          toastId: `single-cart-${productId}`,
        });
      }

      lastPriceTypeRef.current = {
        ...lastPriceTypeRef.current,
        [productId]: newPriceType,
      };
    }

    setPriceTypes((prev) => ({ ...prev, [productId]: newPriceType }));

    const payloadBase = {
      id: productId,
      title: product.title,
      image: activeVariant.image_main || product.image || "",
      color: {
        englishName: activeVariant.color_englishName,
        persianName: activeVariant.color_persianName || "",
        hexCode: activeVariant.color_hexCode,
      },
      baseRetailPrice: activeVariant.price_single,
      baseWholesalePrice: activeVariant.price_wholesale,
      retailDiscountPercent: activeVariant.discount_percent || 0,
      minWholesale: activeVariant.min_wholesale || 1,
      stock_quantity: activeVariant.stock_quantity ?? 0,
    };

    if (cartItem) {
      dispatch({
        type: "UPDATE_QUANTITY",
        payload: {
          itemKey: `${productId}-${cartItem.color?.englishName || "default"}`,
          newQuantity: quantity,
        },
      });
      toast.success("سبد خرید به‌روزرسانی شد");
    } else {
      dispatch({
        type: "ADD_ITEM",
        payload: {
          ...payloadBase,
          quantity,
          priceType: newPriceType,
          price: unitPrice.toString(),
          discount: isWholesale ? "0" : `${activeVariant.discount_percent || 0}%`,
        },
      });
      toast.success("به سبد خرید اضافه شد");
    }

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
    // ۲. پاکسازی کامل URL (حذف تمام پارامترها و بازگشت به مسیر /search)
    router.push("/search", { scroll: false });
    
    // ۳. اختیاری: نمایش پیام به کاربر
    toast.info("تمام فیلترها پاک شدند");
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
    // نرمال‌سازی متن جستجو (حذف فضاها و کوچک کردن حروف)
    const searchLower = searchTerm.trim().toLowerCase();

    const filtered = products.filter((p) => {
      // ۱. منطق جستجوی فوق پیشرفته (Omnisearch)
      // اگر کادر جستجو خالی باشد، همه محصولات تایید می‌شوند
      const matchesSearch = searchLower === "" || (
        p.title?.toLowerCase().includes(searchLower) ||
        p.brandDetails?.title?.toLowerCase().includes(searchLower) ||
        p.motherCategoryName?.toLowerCase().includes(searchLower) ||
        p.category?.toLowerCase().includes(searchLower) ||
        p.content?.toLowerCase().includes(searchLower) ||
        p.features?.some(f => f.toLowerCase().includes(searchLower)) ||
        // جستجو در تمام واریانت‌ها (رنگ و رایحه/مشخصات فنی)
        p.variants?.some(v => 
          v.color_persianName?.toLowerCase().includes(searchLower) || 
          v.color_englishName?.toLowerCase().includes(searchLower) ||
          v.infotable?.some(info => 
            info.name.toLowerCase().includes(searchLower) || 
            info.value.toLowerCase().includes(searchLower)
          )
        )
      );

      // ۲. مدیریت قیمت و واریانت فعال
      const activeVariant = selectedVariants[p.id] || p.variants?.[0];
      const currentPrice = activeVariant?.price_single || p.numericPrice || 0;
      
      // ۳. بررسی فیلترهای انتخابی (اگر آرایه خالی باشد یعنی فیلتر اعمال نشده)
      const matchesBrand = selectedBrands.length === 0 || (p.brandDetails && selectedBrands.includes(p.brandDetails.title));
      const matchesMothercat = selectedMothercatIds.length === 0 || selectedMothercatIds.includes(p.mothercatId);
      const matchesSubcat = selectedSubcatIds.length === 0 || selectedSubcatIds.includes(p.subcatId);
      const matchesItem = selectedItemIds.length === 0 || (p.itemId !== null && selectedItemIds.includes(p.itemId));
      
      // ۴. فیلترهای بازه‌ای و وضعیتی
      const matchesPrice = currentPrice >= priceRange[0] && currentPrice <= priceRange[1];
      const matchesDiscount = !discount || (activeVariant && activeVariant.discount_percent > 0);
      const matchesRating = p.rating >= rating;
      const matchesStock = !inStock || p.variants?.some(v => v.stock_quantity > 0);

      // ترکیب نهایی تمام شرط‌ها
      return (
        matchesSearch && 
        matchesBrand && 
        matchesMothercat && 
        matchesSubcat && 
        matchesItem && 
        matchesPrice && 
        matchesDiscount && 
        matchesRating && 
        matchesStock
      );
    });

    // ۵. عملیات مرتب‌سازی (Sorting)
    return [...filtered].sort((a, b) => {
      const priceA = selectedVariants[a.id]?.price_single || a.numericPrice || 0;
      const priceB = selectedVariants[b.id]?.price_single || b.numericPrice || 0;

      switch (sortOption) {
        case "ارزان‌ترین":
          return priceA - priceB;
        case "گران‌ترین":
          return priceB - priceA;
        case "محبوب‌ترین":
          return (b.rating || 0) - (a.rating || 0);
        case "پرفروش‌ترین":
          return (b.sales || 0) - (a.sales || 0);
        case "جدیدترین":
        default:
          return b.id - a.id;
      }
    });
  };

  const filteredProducts = getSortedProducts();

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (error) return <div className="text-center p-10 text-red-500">{error}</div>;

  return (
    <div dir="rtl" className="min-h-screen bg-[#F7F7F7] font-yekan">
      <ToastContainer rtl theme="colored" position="top-center" limit={3} />
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
                getCartItem={getCartItem}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}