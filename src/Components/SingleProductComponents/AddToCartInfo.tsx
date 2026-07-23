"use client";

import React, { useState, useEffect, useRef } from "react";
import { ShoppingCartOutlined, Notifications } from "@mui/icons-material";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./SingleProduct.css";
import { Product, Variant } from "@/types/types";
import { useCart } from "@/ContextApi/CartContext";
import { Modal, Box, Typography, TextField, Button } from "@mui/material";

interface BenefitItem {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
}

interface AddToCartInfoProps {
  infoproduct: Product;
  selectedVariant?: Variant | null;
  onVariantChange?: (variant: Variant) => void;
}

const AddToCartInfo: React.FC<AddToCartInfoProps> = ({
  infoproduct,
  selectedVariant: externalSelectedVariant = null,
  onVariantChange,
}) => {
  const { dispatch, state: { cartItems } } = useCart();

  const [quantity, setQuantity] = useState<number>(1);
  const [internalSelectedVariant, setInternalSelectedVariant] = useState<Variant | null>(null);
  const [isVariantChanging, setIsVariantChanging] = useState<boolean>(false);
  
  // State جدید برای کنترل نمایش دکمه ادامه و پرداخت
  const [showCheckout, setShowCheckout] = useState<boolean>(false);
  const [lastAddedQuantity, setLastAddedQuantity] = useState<number>(1);

  // State برای فرم موجودی شد خبرم کن
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState<boolean>(false);
  const [notifyName, setNotifyName] = useState<string>("");
  const [notifyPhone, setNotifyPhone] = useState<string>("");
  const [isSubmittingNotify, setIsSubmittingNotify] = useState<boolean>(false);

  // State برای مزایای داینامیک
  const [benefits, setBenefits] = useState<BenefitItem[]>([]);
  const [loadingBenefits, setLoadingBenefits] = useState<boolean>(true);

  const wasWholesaleRef = useRef<boolean>(false);
  const prevQuantityRef = useRef<number>(1);
  const hasReachedMaxRef = useRef<boolean>(false);

  const activeVariant = externalSelectedVariant || internalSelectedVariant;

  const stockQuantity = activeVariant?.stock_quantity ?? 0;
  const isInStock = stockQuantity > 0;

  const baseRetailPrice = activeVariant?.price_single ?? 0;
  const baseWholesalePrice = activeVariant?.price_wholesale ?? 0;
  const retailDiscountPercent = activeVariant?.discount_percent ?? 0;
  const minWholesale = activeVariant?.min_wholesale ?? 1;

  const hasWholesalePrice = baseWholesalePrice > 0 && minWholesale > 1;
  const isEligibleForWholesale = hasWholesalePrice && quantity >= minWholesale;

  const unitPriceAfterDiscount = isEligibleForWholesale
    ? baseWholesalePrice
    : Math.round(baseRetailPrice * (1 - retailDiscountPercent / 100));

  const finalTotalPrice = unitPriceAfterDiscount * quantity;

  const wholesaleDifferencePercent =
    baseRetailPrice > baseWholesalePrice
      ? Math.round(((baseRetailPrice - baseWholesalePrice) / baseRetailPrice) * 100)
      : 0;

  const cartItem = cartItems.find(
    (item) =>
      item.id === infoproduct.id &&
      item.color?.englishName === activeVariant?.color_englishName
  );

  // دریافت مزایا از دیتابیس
  useEffect(() => {
    fetchBenefits();
  }, []);

  const fetchBenefits = async () => {
    try {
      const res = await fetch("/api/benefits");
      if (res.ok) {
        const data = await res.json();
        setBenefits(data);
      } else {
        console.error("Error fetching benefits");
      }
    } catch (error) {
      console.error("Error fetching benefits:", error);
    } finally {
      setLoadingBenefits(false);
    }
  };

  // مقداردهی اولیه واریانت پیش‌فرض
  useEffect(() => {
    if (infoproduct.variants && infoproduct.variants.length > 0 && !internalSelectedVariant) {
      const sorted = [...infoproduct.variants].sort((a, b) => {
        const aInStock = a.stock_quantity > 0 ? 1 : 0;
        const bInStock = b.stock_quantity > 0 ? 1 : 0;
        if (aInStock !== bInStock) return bInStock - aInStock;
        const priceA = a.price_single * (1 - (a.discount_percent || 0) / 100);
        const priceB = b.price_single * (1 - (b.discount_percent || 0) / 100);
        return priceA - priceB;
      });
      setInternalSelectedVariant(sorted[0]);
    }
  }, [infoproduct.variants, internalSelectedVariant]);

  // مقداردهی اولیه تعداد و وضعیت عمده از سبد
  useEffect(() => {
    if (cartItem) {
      setQuantity(cartItem.quantity);
      setLastAddedQuantity(cartItem.quantity);
      const shouldBeWholesale =
        cartItem.quantity >= minWholesale &&
        hasWholesalePrice &&
        cartItem.priceType === "wholesale";
      wasWholesaleRef.current = shouldBeWholesale;
      hasReachedMaxRef.current = cartItem.quantity >= stockQuantity;
    } else {
      setQuantity(1);
      setLastAddedQuantity(1);
      wasWholesaleRef.current = false;
      hasReachedMaxRef.current = false;
    }

    prevQuantityRef.current = quantity;
  }, [cartItem, activeVariant?.id, minWholesale, hasWholesalePrice, stockQuantity]);

  // اگر تعداد تغییر کرد، دکمه checkout را مخفی کن
  useEffect(() => {
    if (quantity !== lastAddedQuantity && showCheckout) {
      setShowCheckout(false);
    }
  }, [quantity, lastAddedQuantity, showCheckout]);

  // toast تغییر نوع قیمت (تکی ↔ عمده)
  useEffect(() => {
    if (isVariantChanging) {
      setIsVariantChanging(false);
      return; // skip toast هنگام تغییر رنگ
    }

    if (!hasWholesalePrice) {
      wasWholesaleRef.current = false;
      return;
    }

    const nowEligible = quantity >= minWholesale;
    const wasPreviouslyWholesale = wasWholesaleRef.current;

    if (nowEligible && !wasPreviouslyWholesale) {
      toast.success(`قیمت عمده‌فروشی (${minWholesale} عدد به بالا) اعمال شد`, {
        position: "top-center",
        autoClose: 2600,
        theme: "colored",
        toastId: `wholesale-${activeVariant?.id || "default"}`,
      });
      wasWholesaleRef.current = true;
    } else if (!nowEligible && wasPreviouslyWholesale) {
      toast.info("قیمت به حالت تک‌فروشی بازگشت", {
        position: "top-center",
        autoClose: 2600,
        theme: "colored",
        toastId: `single-${activeVariant?.id || "default"}`,
      });
      wasWholesaleRef.current = false;
    }
  }, [quantity, hasWholesalePrice, minWholesale, activeVariant?.id, isVariantChanging]);

  const showMaxStockToast = () => {
    toast.warning(`حداکثر موجودی این محصول: ${stockQuantity} عدد`, {
      position: "top-center",
      autoClose: 3200,
      theme: "colored",
    });
  };

  const handleIncrement = () => {
    if (quantity < stockQuantity) {
      setQuantity((prev) => {
        const newQty = prev + 1;
        if (newQty === stockQuantity && !hasReachedMaxRef.current) {
          showMaxStockToast();
          hasReachedMaxRef.current = true;
        }
        return newQty;
      });
    } else if (!hasReachedMaxRef.current) {
      showMaxStockToast();
      hasReachedMaxRef.current = true;
    }
  };

  const handleDecrement = () => {
    setQuantity((prev) => {
      const newQty = Math.max(0, prev - 1);
      if (newQty < stockQuantity) {
        hasReachedMaxRef.current = false;
      }
      return newQty;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value)) {
      if (value > stockQuantity) {
        if (!hasReachedMaxRef.current) {
          showMaxStockToast();
          hasReachedMaxRef.current = true;
        }
        setQuantity(stockQuantity);
      } else {
        setQuantity(Math.max(0, value));
        if (value < stockQuantity) {
          hasReachedMaxRef.current = false;
        } else if (value === stockQuantity && !hasReachedMaxRef.current) {
          showMaxStockToast();
          hasReachedMaxRef.current = true;
        }
      }
    }
  };

  const handleVariantSelect = (variant: Variant) => {
    if (onVariantChange) {
      onVariantChange(variant);
    } else {
      setInternalSelectedVariant(variant);
    }
    setIsVariantChanging(true); // flag برای skip toast
    wasWholesaleRef.current = false; // ریست وضعیت عمده
    setShowCheckout(false); // مخفی کردن دکمه checkout هنگام تغییر رنگ
  };

  const handleAddToCart = () => {
    if (!activeVariant) {
      toast.error("لطفاً یک رنگ انتخاب کنید", { position: "top-center" });
      return;
    }

    if (!isInStock) {
      toast.error("این محصول در حال حاضر موجود نیست", { position: "top-center" });
      return;
    }

    const priceType = isEligibleForWholesale ? "wholesale" : "single";
    const discountStr = isEligibleForWholesale ? "0" : `${retailDiscountPercent}%`;

    if (quantity <= 0) {
      if (cartItem) {
        dispatch({
          type: "REMOVE_ITEM_BY_TYPE",
          payload: {
            id: infoproduct.id,
            color: cartItem.color,
          },
        });
        toast.info("محصول از سبد خرید حذف شد", { position: "top-center" });
      }
      return;
    }

    if (cartItem) {
      dispatch({
        type: "UPDATE_QUANTITY",
        payload: {
          itemKey: `${infoproduct.id}-${cartItem.color?.englishName || "default"}`,
          newQuantity: quantity,
        },
      });
      toast.success("سبد خرید به‌روزرسانی شد", { position: "top-center" });
    } else {
      dispatch({
        type: "ADD_ITEM",
        payload: {
          id: infoproduct.id,
          title: infoproduct.title,
          quantity,
          priceType,
          price: unitPriceAfterDiscount.toString(),
          image: activeVariant.image_main || infoproduct.image || "/placeholder.jpg",
          discount: discountStr,
          color: {
            englishName: activeVariant.color_englishName,
            persianName: activeVariant.color_persianName || "",
            hexCode: activeVariant.color_hexCode,
          },
          baseRetailPrice,
          baseWholesalePrice,
          retailDiscountPercent,
          minWholesale,
          stock_quantity: stockQuantity,
        },
      });
      toast.success("به سبد خرید اضافه شد", { position: "top-center" });
    }

    // ذخیره تعداد فعلی و نمایش دکمه checkout
    setLastAddedQuantity(quantity);
    setShowCheckout(true);
  };

  // تابع ارسال درخواست موجودی شد خبرم کن
  const handleNotifySubmit = async () => {
    if (!notifyName.trim()) {
      toast.error("لطفاً نام خود را وارد کنید", { position: "top-center" });
      return;
    }
    if (!notifyPhone.trim() || !/^\d{11}$/.test(notifyPhone)) {
      toast.error("لطفاً شماره تماس معتبر (۱۱ رقم) وارد کنید", { position: "top-center" });
      return;
    }

    setIsSubmittingNotify(true);

    try {
      const res = await fetch("/api/notifications/stock-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: infoproduct.id,
          variantId: activeVariant?.id,
          productTitle: infoproduct.title,
          variantColor: activeVariant?.color_persianName || activeVariant?.color_englishName,
          name: notifyName,
          phone: notifyPhone,
        }),
      });

      if (res.ok) {
        toast.success("درخواست شما با موفقیت ثبت شد. به محض موجود شدن، به شما اطلاع‌رسانی می‌شود.", {
          position: "top-center",
          autoClose: 5000,
        });
        setIsNotifyModalOpen(false);
        setNotifyName("");
        setNotifyPhone("");
      } else {
        const error = await res.json();
        toast.error(error.error || "خطا در ثبت درخواست", { position: "top-center" });
      }
    } catch (err) {
      toast.error("خطا در ارتباط با سرور", { position: "top-center" });
      console.error(err);
    } finally {
      setIsSubmittingNotify(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("fa-IR") + " تومان";
  };

  const getContrastColor = (hexCode: string) => {
    const hex = hexCode.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5
      ? { tickColor: "#0000004d", borderColor: "#FFFFFF" }
      : { tickColor: "#FFFFFF", borderColor: "#0000004d" };
  };

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

  return (
    <>
      <div className="sp-product-info-container overflow-auto">
        {/* بخش قیمت‌ها */}
        <div className="sp-pricing-grid">
          <div className="sp-pricing-item">
            <span className="sp-pricing-label">قیمت تک فروشی</span>
            <div className="sp-pricing-details">
              <span className="sp-pricing-value">{formatPrice(baseRetailPrice)}</span>
              {retailDiscountPercent > 0 && (
                <span className="sp-discount-badge">{retailDiscountPercent}%</span>
              )}
            </div>
          </div>

          {hasWholesalePrice && (
            <div className="sp-pricing-item">
              <span className="sp-pricing-label">{minWholesale} عدد به بالا</span>
              <div className="sp-pricing-details">
                <span className="sp-pricing-value">{formatPrice(baseWholesalePrice)}</span>
                {wholesaleDifferencePercent > 0 && (
                  <span className="sp-discount-badge text-green-600 bg-green-100">
                    {wholesaleDifferencePercent}% ارزان‌تر
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="bg-[#F7F7F7] text-xl text-[#6D4C82] text-center p-2 rounded-xl">
            <span>{formatPrice(finalTotalPrice)}</span>
          </div>
        </div>

        {/* انتخاب رنگ */}
        {infoproduct.variants && infoproduct.variants.length > 0 && (
          <div className="sp-color-selection flex-col flex !items-start">
            <span className="sp-color-label">رنگ‌بندی:</span>
            <div className="sp-color-options">
              {[...infoproduct.variants]
                .sort((a, b) => {
                  const aInStock = a.stock_quantity > 0 ? 1 : 0;
                  const bInStock = b.stock_quantity > 0 ? 1 : 0;
                  if (aInStock !== bInStock) return bInStock - aInStock;
                  const priceA = a.price_single * (1 - (a.discount_percent || 0) / 100);
                  const priceB = b.price_single * (1 - (b.discount_percent || 0) / 100);
                  return priceA - priceB;
                })
                .map((variant) => {
                  const variantInStock = variant.stock_quantity > 0;
                  const isSelected =
                    activeVariant?.id === variant.id ||
                    (activeVariant?.color_englishName === variant.color_englishName &&
                      activeVariant?.color_hexCode === variant.color_hexCode);

                  const { tickColor, borderColor } = getContrastColor(variant.color_hexCode);

                  return (
                    <button
                      key={variant.id || variant.color_englishName}
                      onClick={() => handleVariantSelect(variant)}
                      disabled={!variantInStock}
                      style={{
                        backgroundColor: variant.color_hexCode,
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        border: isSelected ? "3px solid #805b99" : "2px solid #d1d5db",
                        outline: isSelected ? "3px solid #e9d5ff" : "none",
                        cursor: variantInStock ? "pointer" : "not-allowed",
                        opacity: variantInStock ? 1 : 0.4,
                        transition: "all 0.2s ease",
                        position: "relative",
                      }}
                      title={variant.color_persianName || variant.color_englishName}
                    >
                      {isSelected && variantInStock && (
                        <span
                          style={{
                            margin: "auto",
                            color: tickColor,
                            fontSize: "14px",
                            fontWeight: "bold",
                            backgroundColor: borderColor,
                            borderRadius: "50%",
                            width: "20px",
                            height: "20px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          ✓
                        </span>
                      )}
                      {!variantInStock && (
                        <span
                          style={{
                            position: "absolute",
                            width: "2px",
                            height: "24px",
                            backgroundColor: "#ffff",
                            border: "1px solid black",
                            top: "0",
                            transform: "rotate(45deg)",
                          }}
                        />
                      )}
                    </button>
                  );
                })}
            </div>
            
            <div className="flex flex-col mt-2">
              <span className="sp-selected-color text-lg">
                <span className="text-sm">رنگ انتخابی: </span>
                {activeVariant?.color_persianName ||
                  activeVariant?.color_englishName ||
                  "نامشخص"}
              </span>
            </div>
          </div>
        )}

        {/* تعداد و افزودن به سبد */}
        <div className="sp-quantity-section">
          <div className="sp-quantity-control">
            <p className="sp-quantity-label">تعداد:</p>
            <div className="sp-quantity-input-container">
              <button
                onClick={handleIncrement}
                className="sp-quantity-button"
                aria-label="افزایش"
                disabled={!isInStock || quantity >= stockQuantity}
              >
                +
              </button>
              <input
                type="number"
                value={quantity}
                onChange={handleInputChange}
                className="sp-quantity-input"
                min="0"
                max={stockQuantity}
                disabled={!isInStock}
              />
              <button
                onClick={handleDecrement}
                className="sp-quantity-button"
                aria-label="کاهش"
                disabled={!isInStock || quantity <= 0}
              >
                -
              </button>
            </div>
          </div>

          {isInStock ? (
            showCheckout && quantity > 0 ? (
              // وقتی دکمه ثبت در سبد کلیک شد، به لینک ادامه و پرداخت تبدیل میشه با همین استایل
              <Link href="../checkout" style={{ textDecoration: 'none', width: '100%' }}>
                <button
                  className="sp-add-to-cart-button"
                  style={{
                    backgroundColor: "#805b99",
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  <ShoppingCartOutlined className="sp-cart-icon" />
                  ادامه و پرداخت
                </button>
              </Link>
            ) : (
              // حالت عادی - ثبت در سبد
              <button
                onClick={handleAddToCart}
                className="sp-add-to-cart-button"
                style={{
                  backgroundColor: "#805b99",
                  cursor: quantity > 0 ? "pointer" : "not-allowed",
                }}
                disabled={quantity <= 0}
              >
                <ShoppingCartOutlined className="sp-cart-icon" />
                {quantity > 0 ? "ثبت در سبد" : "افزودن به سبد خرید"}
              </button>
            )
          ) : (
            <button
              onClick={() => setIsNotifyModalOpen(true)}
              className="sp-add-to-cart-button"
              style={{
                backgroundColor: "#f59e0b",
                cursor: "pointer",
              }}
            >
              <Notifications className="sp-cart-icon" />
              موجود شد خبرم کن
            </button>
          )}
        </div>

        {/* مزایای خرید - داینامیک */}
        <div className="sp-benefits-grid">
          {loadingBenefits ? (
            // حالت لودینگ
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="sp-benefit-item opacity-50">
                <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="sp-benefit-text">
                  <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded w-16 animate-pulse mt-1"></div>
                </div>
              </div>
            ))
          ) : benefits.length > 0 ? (
            benefits.map((item) => (
              <Link key={item.id} href={item.link || "/#"} className="sp-benefit-item">
                <img
                  src={item.image}
                  alt={item.title}
                  className="sp-benefit-image"
                />
                <div className="sp-benefit-text">
                  <h3 className="sp-benefit-title">{item.title}</h3>
                  <p className="sp-benefit-description">{item.description}</p>
                </div>
              </Link>
            ))
          ) : (
            // اگر مزیتی وجود نداشت، هیچ چیزی نمایش نده
            null
          )}
        </div>
      </div>

      {/* مودال موجود شد خبرم کن */}
      <Modal
        open={isNotifyModalOpen}
        onClose={() => setIsNotifyModalOpen(false)}
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
            لطفاً نام و شماره تماس خود را وارد کنید تا به محض موجود شدن محصول، به شما اطلاع‌رسانی کنیم.
          </Typography>

          <div className="gap-4 flex flex-col">
            <TextField
              fullWidth
              label="نام و نام خانوادگی"
              variant="outlined"
              value={notifyName}
              onChange={(e) => setNotifyName(e.target.value)}
              sx={{
                "& .MuiInputLabel-root": { fontFamily: "yekannew", fontSize: "0.875rem" },
                "& .MuiInputBase-input": { fontFamily: "yekannew", fontSize: "0.875rem" },
              }}
            />

            <TextField
              fullWidth
              label="شماره تماس (۱۱ رقم)"
              variant="outlined"
              value={notifyPhone}
              onChange={(e) => setNotifyPhone(e.target.value)}
              sx={{
                "& .MuiInputLabel-root": { fontFamily: "yekannew", fontSize: "0.875rem" },
                "& .MuiInputBase-input": { fontFamily: "yekannew", fontSize: "0.875rem" },
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
                onClick={() => setIsNotifyModalOpen(false)}
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
    </>
  );
};

export default AddToCartInfo;