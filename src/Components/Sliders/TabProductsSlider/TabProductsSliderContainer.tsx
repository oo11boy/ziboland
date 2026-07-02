"use client";
import { useState, useRef, useEffect } from "react";
import { Swiper as SwiperCore } from "swiper";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { Modal, Typography, TextField, Button } from "@mui/material";

import {
  AddCircleOutline,
  AddShoppingCart,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  NotificationAdd,
  RemoveCircleOutline,
  VisibilitySharp,
} from "@mui/icons-material";
import Link from "next/link";
import { Product, Variant } from "@/types/types";
import { useCart } from "@/ContextApi/CartContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { formatPrice } from "@/Components/Utils/formatPrice";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: { xs: 1, md: 3 } }}>{children}</Box>}
    </div>
  );
}

type SortType = "popular" | "cheapest" | "newest" | "none";

interface TabProductsSliderContainerProps {
  title: string;
  sort?: SortType;
}

export default function TabProductsSliderContainer({
  title,
  sort = "none",
}: TabProductsSliderContainerProps) {
  const [value, setValue] = useState(0);
  const {
    dispatch,
    state: { cartItems },
  } = useCart();

  const [cartQuantities, setCartQuantities] = useState<{
    [key: number]: number;
  }>({});
  const [priceTypes, setPriceTypes] = useState<{
    [key: number]: "single" | "wholesale";
  }>({});
  const [selectedVariants, setSelectedVariants] = useState<{
    [key: number]: Variant | null;
  }>({});
  const [showQuantitySelector, setShowQuantitySelector] = useState<
    number | null
  >(null);

  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const swiperRefs = useRef<{ [key: number]: SwiperCore | null }>({});
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);

  // State برای موجود شد خبرم کن
  const [notifyModalOpen, setNotifyModalOpen] = useState(false);
  const [notifyProductId, setNotifyProductId] = useState<number | null>(null);
  const [notifyName, setNotifyName] = useState("");
  const [notifyPhone, setNotifyPhone] = useState("");
  const [isSubmittingNotify, setIsSubmittingNotify] = useState(false);

  const updateNavigationState = (swiper: SwiperCore) => {
    setIsBeginning(swiper.isBeginning);
    setIsEnd(swiper.isEnd);
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        if (!response.ok) throw new Error("خطا در دریافت محصولات");
        const data: Product[] = await response.json();

        let sorted = [...data];

        // تابع کمکی برای چک کردن اینکه آیا محصول حداقل یک واریانت موجود دارد یا خیر
        const isProductInStock = (p: Product) =>
          p.variants?.some((v) => (v.stock_quantity ?? 0) > 0) ? 1 : 0;

        sorted.sort((a, b) => {
          // ۱. اولویت اول: موجودی (موجودها = ۱، ناموجودها = ۰)
          const aInStock = isProductInStock(a);
          const bInStock = isProductInStock(b);

          if (aInStock !== bInStock) {
            return bInStock - aInStock; // موجودها (۱) قبل از ناموجودها (۰) قرار می‌گیرند
          }

          // ۲. اولویت دوم: بر اساس انتخاب کاربر (ارزان‌ترین، جدیدترین و ...)
          if (sort === "popular") return b.rating - a.rating;
          if (sort === "cheapest") {
            const priceA = a.variants?.[0]?.price_single || 0;
            const priceB = b.variants?.[0]?.price_single || 0;
            return priceA - priceB;
          }
          if (sort === "newest") return b.id - a.id;

          return 0;
        });

        setProducts(sorted);
      } catch (err) {
        setError("خطا در بارگذاری محصولات. لطفاً دوباره تلاش کنید.");
        console.error(err);
      }
    };

    fetchProducts();
  }, [sort]);

  useEffect(() => {
    if (products.length > 0) {
      const initialPriceTypes: { [key: number]: "single" | "wholesale" } = {};
      const initialVariants: { [key: number]: Variant | null } = {};

      products.forEach((product) => {
        initialPriceTypes[product.id] = "single";

        if (product.variants && product.variants.length > 0) {
          // مرتب‌سازی هوشمند: ابتدا موجودها، سپس ارزان‌ترین‌ها
          const sortedVariants = [...product.variants].sort((a, b) => {
            const aStock = (a.stock_quantity ?? 0) > 0 ? 1 : 0;
            const bStock = (b.stock_quantity ?? 0) > 0 ? 1 : 0;
            if (aStock !== bStock) return bStock - aStock;

            const priceA =
              a.price_single * (1 - (a.discount_percent || 0) / 100);
            const priceB =
              b.price_single * (1 - (b.discount_percent || 0) / 100);
            return priceA - priceB;
          });
          initialVariants[product.id] = sortedVariants[0];
        } else {
          initialVariants[product.id] = null;
        }
      });

      setPriceTypes(initialPriceTypes);
      setSelectedVariants(initialVariants);
    }
  }, [products]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const currentSwiper = swiperRefs.current[value];
      if (currentSwiper) {
        currentSwiper.update();
        updateNavigationState(currentSwiper);
      }
    }, 150);
    return () => clearTimeout(timer);
  }, [value, products]);

  const handleShowQuantitySelector = (productId: number) => {
    const cartItem = getCartItem(productId);

    setCartQuantities((prev) => ({
      ...prev,
      [productId]: cartItem ? cartItem.quantity : 1, // 👈 این خط طلاییه
    }));

    setShowQuantitySelector(
      showQuantitySelector === productId ? null : productId,
    );
  };

  const getCartItem = (productId: number) => {
    const activeVariant = selectedVariants[productId];
    if (!activeVariant) return null;

    return cartItems.find(
      (item) =>
        item.id === productId &&
        item.color?.englishName === activeVariant.color_englishName,
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

      if (activeVariant && activeVariant.price_wholesale > 0) {
        const minWholesale = activeVariant.min_wholesale || 1;
        setPriceTypes((prevTypes) => ({
          ...prevTypes,
          [productId]: newQuantity >= minWholesale ? "wholesale" : "single",
        }));
      }
      return { ...prev, [productId]: newQuantity };
    });
  };

  const handlePriceTypeChange = (
    productId: number,
    type: "single" | "wholesale",
  ) => {
    const activeVariant = selectedVariants[productId];
    if (
      type === "wholesale" &&
      (!activeVariant || activeVariant.price_wholesale <= 0)
    )
      return;
    setPriceTypes((prev) => ({ ...prev, [productId]: type }));
  };

  const handleVariantSelect = (productId: number, variant: Variant) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variant }));
    setCartQuantities((prev) => ({ ...prev, [productId]: 0 }));
    setPriceTypes((prev) => ({ ...prev, [productId]: "single" }));
    setShowQuantitySelector(null);
  };

  const handleAddToCart = (productId: number) => {
    const quantity = cartQuantities[productId];
    const activeVariant = selectedVariants[productId];
    const cartItem = getCartItem(productId);

    if (!activeVariant) return;

    // اگر تعداد صفر یا کمتر شد → حذف از سبد
    if (!quantity || quantity <= 0) {
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
      setCartQuantities((prev) => ({ ...prev, [productId]: 0 }));
      setShowQuantitySelector(null);
      return;
    }

    // محاسبه قیمت واحد صحیح (قبل از dispatch)
    const isWholesale =
      quantity >= (activeVariant.min_wholesale || 1) &&
      activeVariant.price_wholesale > 0;

    const unitPrice = isWholesale
      ? activeVariant.price_wholesale
      : Math.round(
          activeVariant.price_single *
            (1 - (activeVariant.discount_percent || 0) / 100),
        );

    // اگر قبلاً در سبد بوده → فقط UPDATE
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
      // اگر جدید بود → ADD با قیمت صحیح
      dispatch({
        type: "ADD_ITEM",
        payload: {
          id: productId,
          title: products.find((p) => p.id === productId)!.title,
          quantity,
          priceType: isWholesale ? "wholesale" : "single",
          price: unitPrice.toString(),
          image:
            activeVariant.image_main ||
            products.find((p) => p.id === productId)?.image ||
            "",
          discount: isWholesale
            ? "0"
            : `${activeVariant.discount_percent || 0}%`,
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
        },
      });
      toast.success("به سبد خرید اضافه شد");
    }

    setShowQuantitySelector(null);
  };

  // تابع باز کردن مودال موجود شد خبرم کن
  const handleNotifyMe = (productId: number) => {
    setNotifyProductId(productId);
    setNotifyName("");
    setNotifyPhone("");
    setNotifyModalOpen(true);
  };

  // تابع ارسال درخواست موجودی
  const handleNotifySubmit = async () => {
    if (!notifyName.trim()) {
      toast.error("لطفاً نام خود را وارد کنید");
      return;
    }
    if (!notifyPhone.trim() || !/^\d{11}$/.test(notifyPhone)) {
      toast.error("لطفاً شماره تماس معتبر (۱۱ رقم) وارد کنید");
      return;
    }

    const product = products.find(p => p.id === notifyProductId);
    const variant = product ? selectedVariants[notifyProductId!] : null;

    setIsSubmittingNotify(true);

    try {
      const res = await fetch("/api/notifications/stock-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: notifyProductId,
          variantId: variant?.id || null,
          productTitle: product?.title || "",
          variantColor: variant?.color_persianName || variant?.color_englishName || null,
          name: notifyName,
          phone: notifyPhone,
        }),
      });

      if (res.ok) {
        toast.success("درخواست شما با موفقیت ثبت شد. به محض موجود شدن، به شما اطلاع‌رسانی می‌شود.", {
          autoClose: 5000,
        });
        setNotifyModalOpen(false);
        setNotifyName("");
        setNotifyPhone("");
      } else {
        const error = await res.json();
        toast.error(error.error || "خطا در ثبت درخواست");
      }
    } catch (err) {
      toast.error("خطا در ارتباط با سرور");
      console.error(err);
    } finally {
      setIsSubmittingNotify(false);
    }
  };

  const categoryCounts = products.reduce(
    (acc, p) => {
      const cat = p.motherCategoryName || "سایر";
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const sortedCategories = Object.keys(categoryCounts).sort(
    (a, b) => categoryCounts[b] - categoryCounts[a],
  );
  const productsByCategory = sortedCategories.map((cat) =>
    products.filter((p) => (p.motherCategoryName || "سایر") === cat),
  );

  // استایل مودال
  const modalStyle = {
    position: "absolute" as const,
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90%",
    maxWidth: 500,
    bgcolor: "white",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    p: 4,
    borderRadius: "16px",
    direction: "rtl",
  };

  if (error) {
    return (
      <div className="text-red-500 text-center py-10 text-xl">{error}</div>
    );
  }

  return (
    <div
      className="w-full max-w-[1440px] mx-auto px-4 py-6 font-[yekannew]"
      dir="rtl"
    >
      <ToastContainer />

      <div className="flex justify-between items-center mb-6 px-1">
        <div className="border-r-4 border-[#805B99] pr-3">
          <h2 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight">
            {title}
          </h2>
        </div>
        <Link
          href="/search"
          className="flex items-center gap-1 text-[#805B99] bg-blue-50 px-4 py-2 rounded-2xl text-xs md:text-sm font-bold hover:bg-blue-100 transition-colors"
        >
          <VisibilitySharp fontSize="inherit" /> مشاهده همه
        </Link>
      </div>

      {sortedCategories.length > 0 && (
        <Tabs
          value={value}
          onChange={(_, v) => setValue(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            mb: 2,
            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: "10px",
              backgroundColor: "#805B99",
            },
            "& .MuiTab-root": {
              fontFamily: "inherit",
              fontWeight: 800,
              fontSize: { xs: "0.8rem", md: "0.95rem" },
              minWidth: "100px",
            },
            "& .Mui-selected": { color: "#805B99 !important" },
          }}
        >
          {sortedCategories.map((cat) => (
            <Tab key={cat} label={cat} />
          ))}
        </Tabs>
      )}

      <div className="relative group">
        {sortedCategories.map((cat, index) => (
          <CustomTabPanel key={cat} value={value} index={index}>
            <Swiper
              dir="rtl"
              key={`${cat}-${productsByCategory[index]?.length}`}
              modules={[Navigation]}
              spaceBetween={16}
              slidesPerView={2.2}
              breakpoints={{
                640: { slidesPerView: 3, spaceBetween: 24 },
                1024: { slidesPerView: 4, spaceBetween: 24 },
                1280: { slidesPerView: 5, spaceBetween: 24 },
              }}
              onSwiper={(swiper) => {
                swiperRefs.current[index] = swiper;
                if (index === value)
                  setTimeout(() => updateNavigationState(swiper), 200);
              }}
              onSlideChange={(swiper) =>
                index === value && updateNavigationState(swiper)
              }
            >
              {productsByCategory[index]?.map((item) => {
                const activeVariant = selectedVariants[item.id];
                const effectivePriceType = priceTypes[item.id] || "single";
                const currentQty = cartQuantities[item.id] || 0;

                const stockQuantity = activeVariant?.stock_quantity ?? 0;
                const isInStock = stockQuantity > 0;

                const baseRetailPrice = activeVariant?.price_single || 0;
                const baseWholesalePrice = activeVariant?.price_wholesale || 0;
                const retailDiscountPercent =
                  activeVariant?.discount_percent || 0;
                const minWholesale = activeVariant?.min_wholesale || 1;

                const hasWholesalePrice =
                  baseWholesalePrice > 0 && minWholesale > 1;

                const wholesaleDifferencePercent =
                  baseRetailPrice > baseWholesalePrice
                    ? Math.round(
                        ((baseRetailPrice - baseWholesalePrice) /
                          baseRetailPrice) *
                          100,
                      )
                    : 0;

                let unitPriceAfterDiscount: number;
                let displayDiscount: number;
                let badgeColor = "bg-red-500";

                if (effectivePriceType === "wholesale" && hasWholesalePrice) {
                  unitPriceAfterDiscount = baseWholesalePrice;
                  displayDiscount = wholesaleDifferencePercent;
                  badgeColor = "bg-green-600";
                } else {
                  unitPriceAfterDiscount = Math.round(
                    baseRetailPrice * (1 - retailDiscountPercent / 100),
                  );
                  displayDiscount = retailDiscountPercent;
                  badgeColor = "bg-red-500";
                }

                return (
                  <SwiperSlide key={item.id} className="py-2">
                    {/* کارت محصول با اندازه و استایل دقیقاً مشابه ProductGrid */}
                    <div
                      className={`flex flex-col bg-white rounded-[0.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 p-3 md:p-4 relative overflow-hidden group/card ${
                        !isInStock ? "opacity-70" : ""
                      }`}
                    >
                      {/* برچسب حداقل تعداد عمده */}
                      {effectivePriceType === "wholesale" &&
                        hasWholesalePrice && (
                          <div className="absolute top-2 left-2 bg-[#c7c7c7] py-1 px-2 rounded-sm text-[11px] flex items-center z-10">
                            <span className="ml-1">+</span>
                            <span>{minWholesale} عدد</span>
                          </div>
                        )}

                      {/* تصویر + بج تخفیف هوشمند + پوشش ناموجود */}
                      <Link href={`/products/${item.id}`} className="block">
                        <div className="relative w-full aspect-square bg-gray-50 rounded-[1.5rem] overflow-hidden mb-3">
                          <img
                            src={
                              activeVariant?.image_main ||
                              item.image ||
                              "/placeholder.jpg"
                            }
                            alt={item.title}
                            className="w-full h-full object-contain p-2 group-hover/card:scale-105 transition-transform duration-500"
                          />
                          {displayDiscount > 0 && isInStock && (
                            <span
                              className={`absolute top-2 right-2 ${badgeColor} text-white text-[10px] md:text-xs font-black px-2 py-0.5 rounded-lg shadow-sm z-10`}
                            >
                              {displayDiscount}%{" "}
                              {effectivePriceType === "wholesale" && "سود"}
                            </span>
                          )}
                          {!isInStock && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-20">
                              <span className="text-white text-lg font-bold">
                                ناموجود
                              </span>
                            </div>
                          )}
                        </div>
                      </Link>

                      {/* عنوان و سوئیچ قیمت */}
                      <div className="flex flex-col flex-grow overflow-hidden">
                        <Link href={`/products/${item.id}`}>
                          <h3 className="text-gray-800 text-[11px] md:text-sm font-bold mb-2 line-clamp-2 h-8 md:h-10 leading-4 md:leading-5 tracking-tight text-center">
                            {item.title}
                          </h3>
                        </Link>

                        <div className="flex bg-gray-100 p-0.5 rounded-xl mb-3">
                          <button
                            onClick={() =>
                              handlePriceTypeChange(item.id, "single")
                            }
                            className={`flex-1 py-1 text-[9px] md:text-[10px] font-bold rounded-lg transition-all ${
                              effectivePriceType === "single"
                                ? "bg-white text-[#805B99] shadow-sm"
                                : "text-gray-400"
                            }`}
                          >
                            تکی
                          </button>
                          {hasWholesalePrice && (
                            <button
                              onClick={() =>
                                handlePriceTypeChange(item.id, "wholesale")
                              }
                              className={`flex-1 py-1 text-[9px] md:text-[10px] font-bold rounded-lg transition-all ${
                                effectivePriceType === "wholesale"
                                  ? "bg-white text-[#805B99] shadow-sm"
                                  : "text-gray-400"
                              }`}
                            >
                              عمده
                            </button>
                          )}
                        </div>

                        {/* انتخاب رنگ */}
                        <div className="flex gap-1.5 justify-center mb-3 h-5 items-center">
                          {[...(item.variants || [])]
                            .sort((a, b) => {
                              // همان منطق مرتب‌سازی برای هماهنگی بصری
                              const aStock =
                                (a.stock_quantity ?? 0) > 0 ? 1 : 0;
                              const bStock =
                                (b.stock_quantity ?? 0) > 0 ? 1 : 0;
                              if (aStock !== bStock) return bStock - aStock;

                              const priceA =
                                a.price_single *
                                (1 - (a.discount_percent || 0) / 100);
                              const priceB =
                                b.price_single *
                                (1 - (b.discount_percent || 0) / 100);
                              return priceA - priceB;
                            })
                            .map((variant) => {
                              const variantInStock =
                                (variant.stock_quantity ?? 0) > 0;
                              const isSelected =
                                activeVariant?.id === variant.id;

                              return (
                                <button
                                  key={variant.id}
                                  onClick={() =>
                                    variantInStock &&
                                    handleVariantSelect(item.id, variant)
                                  }
                                  disabled={!variantInStock}
                                  className={`w-3 h-3 md:w-4 md:h-4 rounded-full border border-gray-200 transition-transform relative ${
                                    isSelected
                                      ? "scale-125 ring-2 ring-[#805B99]"
                                      : ""
                                  } ${!variantInStock ? "opacity-50 cursor-not-allowed" : ""}`}
                                  style={{
                                    backgroundColor: variant.color_hexCode,
                                  }}
                                >
                                  {!variantInStock && (
                                    <span
                                      className="absolute inset-0 flex items-center justify-center"
                                      style={{
                                        background:
                                          "linear-gradient(45deg, transparent 48%, red 49%, red 51%, transparent 52%)",
                                      }}
                                    />
                                  )}
                                </button>
                              );
                            })}
                        </div>
                      </div>

                      {/* پایین کارت: قیمت + عملیات */}
                      <div className="mt-auto pt-2 border-t border-gray-50">
                        {!isInStock ? (
                          <div className="flex items-center justify-between">
                            <p className="text-xs md:text-sm text-gray-600 font-medium">
                              موجود شد خبرم کن
                            </p>
                            <button
                              onClick={() => handleNotifyMe(item.id)}
                              className="p-2 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
                            >
                              <NotificationAdd sx={{ fontSize: { xs: 18, md: 22 } }} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="flex flex-col mb-3">
                              {displayDiscount > 0 && (
                                <span className="text-[10px] md:text-xs text-gray-400 line-through italic font-medium">
                                  {formatPrice(baseRetailPrice)}
                                </span>
                              )}
                              <div className="flex items-baseline gap-1">
                                <span className="text-sm md:text-xl font-black text-gray-900 leading-none">
                                  {formatPrice(unitPriceAfterDiscount)}
                                </span>
                                <span className="text-[9px] md:text-[11px] font-medium text-gray-500">
                                  تومان
                                </span>
                              </div>
                            </div>

                            <div className="h-9 md:h-12 relative">
                              {showQuantitySelector !== item.id ? (
                                <button
                                  onClick={() => handleShowQuantitySelector(item.id)}
                                  className={`w-full h-full rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-gray-200 relative overflow-hidden ${
                                    (getCartItem(item.id)?.quantity ?? 0) > 0
                                      ? "bg-green-700 hover:bg-green-800 text-white"
                                      : "bg-[#805B99] hover:bg-[#6b4e82] text-white"
                                  }`}
                                >
                                  <AddShoppingCart sx={{ fontSize: { xs: 16, md: 22 } }} />

                                  <span className="text-[11px] md:text-sm font-extrabold flex items-center gap-1.5">
                                    {(getCartItem(item.id)?.quantity ?? 0) > 0 ? (
                                      <>
                                        در سبد
                                        <span className="bg-white/30 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold min-w-[1.8rem] text-center">
                                          {getCartItem(item.id)?.quantity}
                                        </span>
                                      </>
                                    ) : (
                                      "افزودن"
                                    )}
                                  </span>
                                </button>
                              ) : (
                                <div className="flex items-center justify-between bg-blue-50 rounded-2xl h-full p-1 border border-blue-100 shadow-inner">
                                  <button
                                    onClick={() => handleQuantityChange(item.id, 1)}
                                    disabled={currentQty >= stockQuantity}
                                    className="w-7 h-7 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-xl text-[#805B99] shadow-sm hover:bg-[#805B99] hover:text-white transition-all disabled:opacity-50"
                                  >
                                    <AddCircleOutline sx={{ fontSize: { xs: 18, md: 20 } }} />
                                  </button>

                                  <div className="flex flex-col items-center">
                                    <span className="text-xs md:text-sm font-black text-blue-900 leading-none">
                                      {currentQty}
                                    </span>

                                    <button
                                      onClick={() => handleAddToCart(item.id)}
                                      className="text-[10px] border rounded bg-green-600 text-white px-2 md:text-[14px] font-black uppercase tracking-tighter mt-0.5 hover:bg-green-700 transition-colors"
                                    >
                                      ثبت
                                    </button>
                                  </div>

                                  <button
                                    onClick={() => handleQuantityChange(item.id, -1)}
                                    disabled={currentQty <= 0}
                                    className="w-7 h-7 md:w-10 md:h-10 flex items-center justify-center bg-white rounded-xl text-red-500 shadow-sm hover:bg-red-500 hover:text-white transition-all disabled:opacity-50"
                                  >
                                    <RemoveCircleOutline sx={{ fontSize: { xs: 18, md: 20 } }} />
                                  </button>
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </CustomTabPanel>
        ))}

        {/* دکمه‌های ناوبری */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-between z-20">
          <div className="relative w-full h-0">
            {!isBeginning && (
              <button
                onClick={() => swiperRefs.current[value]?.slidePrev()}
                className="absolute right-0 lg:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/95 shadow-2xl rounded-full flex items-center justify-center border border-gray-100 hover:bg-[#805B99] hover:text-white transition-all text-gray-700 pointer-events-auto z-30"
              >
                <KeyboardArrowRight className="text-2xl md:text-4xl" />
              </button>
            )}

            {!isEnd && (
              <button
                onClick={() => swiperRefs.current[value]?.slideNext()}
                className="absolute left-0 lg:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 bg-white/95 shadow-2xl rounded-full flex items-center justify-center border border-gray-100 hover:bg-[#805B99] hover:text-white transition-all text-gray-700 pointer-events-auto z-30"
              >
                <KeyboardArrowLeft className="text-2xl md:text-4xl" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* مودال موجود شد خبرم کن */}
      <Modal
        open={notifyModalOpen}
        onClose={() => setNotifyModalOpen(false)}
      >
        <Box sx={modalStyle}>
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontFamily: "yekannew",
              fontWeight: "bold",
              textAlign: "center",
              mb: 2,
              color: "#805b99",
            }}
          >
            🔔 موجود شد خبرم کن
          </Typography>

          <Typography
            variant="body1"
            sx={{
              fontFamily: "yekannew",
              textAlign: "center",
              mb: 3,
              color: "#666",
            }}
          >
            لطفاً نام و شماره تماس خود را وارد کنید تا به محض موجود شدن این محصول، به شما اطلاع‌رسانی کنیم.
          </Typography>

             <div className="gap-4 flex flex-col">
            <TextField
              fullWidth
              label="نام و نام خانوادگی"
              variant="outlined"
              value={notifyName}
              onChange={(e) => setNotifyName(e.target.value)}
           sx={{
                "& .MuiInputLabel-root": { fontFamily: "yekannew",fontSize: "0.775rem" },
              
              }}
            />

            <TextField
              fullWidth
              label="شماره تماس (۱۱ رقم)"
              variant="outlined"
              value={notifyPhone}
              onChange={(e) => setNotifyPhone(e.target.value)}
              sx={{
                "& .MuiInputLabel-root": { fontFamily: "yekannew",fontSize: "0.875rem" },
              
              }}
            />

            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <Button
                fullWidth
                variant="contained"
                onClick={handleNotifySubmit}
                disabled={isSubmittingNotify}
                sx={{
                  fontFamily: "yekannew",
                  bgcolor: "#805b99",
                  "&:hover": { bgcolor: "#6d4c82" },
                  borderRadius: "12px",
                  py: 1.5,
                }}
              >
                {isSubmittingNotify ? "در حال ثبت..." : "ثبت درخواست"}
              </Button>

              <Button
                fullWidth
                variant="outlined"
                onClick={() => setNotifyModalOpen(false)}
                sx={{
                  fontFamily: "yekannew",
                  borderColor: "#ccc",
                  color: "#666",
                  "&:hover": { borderColor: "#999" },
                  borderRadius: "12px",
                  py: 1.5,
                }}
              >
                لغو
              </Button>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
}