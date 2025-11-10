"use client";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const [selectedBrands, setSelectedBrands] = useState<string[]>(
    queryParams.brands || []
  );
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
  const [cartQuantities, setCartQuantities] = useState<{
    [key: number]: number;
  }>({});
  const [priceTypes, setPriceTypes] = useState<{
    [key: number]: "single" | "wholesale";
  }>({});
  const [showQuantitySelector, setShowQuantitySelector] = useState<
    number | null
  >(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState<string>("جدیدترین");
  const productsRef = useRef<HTMLDivElement>(null);

  // Fetch products and categories from APIs
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch products
        const productsResponse = await fetch("/api/products");
        if (!productsResponse.ok) {
          throw new Error("Failed to fetch products");
        }
        const productsData: Product[] = await productsResponse.json();
        setProducts(productsData);
        // Fetch categories
        const categoriesResponse = await fetch("/api/categories");
        if (!categoriesResponse.ok) {
          throw new Error("Failed to fetch categories");
        }
        const categoriesData: Categoryapi[] = await categoriesResponse.json();
        setCategories(categoriesData);
      } catch (err) {
        setError("خطا در بارگذاری داده‌ها. لطفاً دوباره تلاش کنید.");
        console.log(err);
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
    selectedItemIds,
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
    setShowQuantitySelector(
      showQuantitySelector === productId ? null : productId
    );
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

  const handlePriceTypeChange = (
    productId: number,
    type: "single" | "wholesale"
  ) => {
    setPriceTypes((prev) => ({ ...prev, [productId]: type }));
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
    const quantity = cartQuantities[productId];
    const priceType = priceTypes[productId];
    const price =
      priceType === "single"
        ? product.discountedPrice
        : product.discountwholesalePrice;
    const discount =
      priceType === "single" ? product.discount : product.discountwholesale;
    // Check minimum quantity for wholesale price
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
          quantity: quantity,
          priceType: priceType,
          price: price.toString(),
          image:
            product.media && product.media.length > 0
              ? product.media[0].src
              : product.image || "/placeholder.jpg",
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

  const handleNotifyMe = () => {
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
    setSelectedItemIds([]);
    setCategorySearch("");
    setExpandedMothercats([]);
    setExpandedSubcats([]);
    setPriceRange([0, 5000000]);
    setRating(0);
    setDiscount(false);
    setInStock(false);
    setBrandSearch("");
    setSortOption("جدیدترین");
  };

  const allBrands = Array.from(
    new Set(products.map((p) => p.brandDetails?.title || ""))
  );

  const allCategories = categories.filter((cat) => cat.mothercat === 1);

  const filteredCategories = allCategories.filter((cat) =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const toggleMothercatExpansion = (id: number) => {
    setExpandedMothercats((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const toggleSubcatExpansion = (id: number) => {
    setExpandedSubcats((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const getSortedProducts = () => {
    const filtered = products.filter(
      (product) =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedBrands.length === 0 ||
          (product.brandDetails &&
            selectedBrands.includes(product.brandDetails.title))) &&
        (selectedMothercatIds.length === 0 ||
          selectedMothercatIds.includes(product.mothercatId)) &&
        (selectedSubcatIds.length === 0 ||
          selectedSubcatIds.includes(product.subcatId)) &&
        (selectedItemIds.length === 0 ||
          selectedItemIds.includes(product.itemId ?? 0)) &&
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
    .map(
      (id) =>
        categories
          .flatMap((cat) => cat.subcat || [])
          .find((sub) => sub.id === id)?.name
    )
    .filter(Boolean)
    .join(", ");

  const selectedItemNames = selectedItemIds
    .map(
      (id) =>
        categories
          .flatMap((cat) => cat.subcat || [])
          .flatMap((sub) => sub.items || [])
          .find((item) => item.id === id)?.name
    )
    .filter(Boolean)
    .join(", ");

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  const filterVariants = {
    hidden: { y: "-100%", opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { y: "-100%", opacity: 0, transition: { duration: 0.2 } },
  };

  if (error) {
    return (
      <div
        dir="rtl"
        className="min-h-screen yekan bg-[#F7F7F7] font-yekan flex items-center justify-center"
      >
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
      <MobileHeader
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />
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
                  filterVariants={filterVariants} searchTerm={""} setSearchTerm={function (value: string): void {
                    throw new Error("Function not implemented.");
                  } }                />
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
              {(selectedSubcatNames ||
                selectedCategoryNames ||
                selectedItemNames) && (
                <div className="text-sm my-9 text-[#374151]">
                  {selectedItemNames ? (
                    <span className="border-2 border-amber-600 p-4 my-4">
                      {selectedItemNames}
                    </span>
                  ) : selectedSubcatNames ? (
                    <span className="border-2 border-amber-600 p-4 my-4">
                      {selectedSubcatNames}
                    </span>
                  ) : (
                    <span>{selectedCategoryNames}</span>
                  )}
                </div>
              )}
              <div className="text-sm my-4 text-[#374151]">
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