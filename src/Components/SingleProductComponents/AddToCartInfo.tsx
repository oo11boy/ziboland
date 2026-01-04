'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCartOutlined } from '@mui/icons-material';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './SingleProduct.css';
import { Product, Variant } from '@/types/types';
import { useCart } from '@/ContextApi/CartContext';

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
  const [quantity, setQuantity] = useState<number>(1);
  const [internalSelectedVariant, setInternalSelectedVariant] = useState<Variant | null>(
    infoproduct.variants && infoproduct.variants.length > 0 ? infoproduct.variants[0] : null
  );
  const [isWholesale, setIsWholesale] = useState<boolean>(false);
  const { dispatch } = useCart();

  const activeVariant = externalSelectedVariant || internalSelectedVariant;

  // موجودی این رنگ
  const stockQuantity = activeVariant?.stock_quantity ?? 0;
  const isInStock = stockQuantity > 0;

  // قیمت تکی (از واریانت یا محصول پایه)
  const retailPrice = activeVariant
    ? activeVariant.price_single
    : parseInt(String(infoproduct.discountedPrice).replace(/[^\d]/g, ''), 10) || 0;

  // قیمت عمده (از واریانت یا محصول پایه)
  const wholesalePrice = activeVariant
    ? activeVariant.price_wholesale
    : parseInt(String(infoproduct.discountwholesalePrice).replace(/[^\d]/g, ''), 10) || 0;

  // حداقل تعداد برای عمده
  const minWholesale = activeVariant?.min_wholesale || infoproduct.minwholesale || 1;

  // آیا قیمت عمده معتبر است؟
  const hasWholesalePrice = wholesalePrice > 0 && minWholesale > 0;

  // آیا کاربر واجد شرایط عمده است؟
  const isEligibleForWholesale = hasWholesalePrice && quantity >= minWholesale;

  // قیمت نهایی
  const finalPrice = isEligibleForWholesale ? wholesalePrice * quantity : retailPrice * quantity;

  // نمایش پیام تغییر قیمت عمده
  useEffect(() => {
    if (!hasWholesalePrice) {
      setIsWholesale(false);
      return;
    }

    if (isEligibleForWholesale && !isWholesale) {
      toast.success(`قیمت عمده‌فروشی (${minWholesale} عدد به بالا) اعمال شد!`, {
        position: 'top-center',
        className: 'yekan',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      });
      setIsWholesale(true);
    } else if (!isEligibleForWholesale && isWholesale) {
      toast.info('قیمت به حالت تک‌فروشی بازگشت.', {
        position: 'top-center',
        className: 'yekan',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      });
      setIsWholesale(false);
    }
  }, [quantity, minWholesale, isWholesale, hasWholesalePrice, isEligibleForWholesale]);

  const handleIncrement = () => {
    if (quantity < stockQuantity) {
      setQuantity(prev => prev + 1);
    } else {
      toast.warning(`حداکثر موجودی: ${stockQuantity} عدد`, {
        position: 'top-center',
        className: 'yekan',
      });
    }
  };

  const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 1) {
      if (value > stockQuantity) {
        toast.warning(`حداکثر موجودی: ${stockQuantity} عدد`, {
          position: 'top-center',
          className: 'yekan',
        });
        setQuantity(stockQuantity);
      } else {
        setQuantity(value);
      }
    }
  };

  const handleVariantSelect = (variant: Variant) => {
    if (onVariantChange) {
      onVariantChange(variant);
    } else {
      setInternalSelectedVariant(variant);
    }
    setQuantity(1); // وقتی رنگ عوض میشه، تعداد رو ریست کن
  };

  const handleAddToCart = () => {
    if (!isInStock) {
      toast.error('این رنگ موجود نیست', {
        position: 'top-center',
        className: 'yekan',
        autoClose: 3000,
        theme: 'colored',
      });
      return;
    }

    if (quantity < 1 || quantity > stockQuantity) {
      toast.error(`تعداد معتبر نیست (موجودی: ${stockQuantity})`, {
        position: 'top-center',
        className: 'yekan',
      });
      return;
    }

    const priceType = hasWholesalePrice && quantity >= minWholesale ? 'wholesale' : 'single';
    const price = priceType === 'wholesale' ? wholesalePrice : retailPrice;
    const discount = priceType === 'wholesale' ? infoproduct.discountwholesale : infoproduct.discount;

    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: infoproduct.id,
        title: infoproduct.title,
        quantity,
        priceType,
        price: price.toString(),
        image: infoproduct.image || '/placeholder.jpg',
        discount,
        color: activeVariant
          ? {
              englishName: activeVariant.color_englishName,
              persianName: activeVariant.color_persianName || '',
              hexCode: activeVariant.color_hexCode,
            }
          : null,
      },
    });

    toast.success('محصول با موفقیت به سبد خرید اضافه شد!', {
      position: 'top-center',
      className: 'yekan',
      autoClose: 3000,
      theme: 'colored',
    });

    setQuantity(1);
  };

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('fa-IR')} تومان`;
  };

  const benefitdata: BenefitItem[] = [
    {
      id: 1,
      title: 'ارسال رایگان سفارشات',
      description: 'خرید بالای 4 میلیون',
      image: 'https://abzarreza.com/wp-content/uploads/2023/09/Delivery.png.webp',
      link: '/faq',
    },
    {
      id: 2,
      title: 'ضمانت بازگشت کالا',
      description: 'تا 30 روز پس از خرید',
      image: 'https://abzarreza.com/wp-content/uploads/2023/09/Free-Return.png.webp',
      link: '/faq',
    },
    {
      id: 3,
      title: 'ضمانت اصالت کالا',
      description: 'ابزار آلات اصیل و معتبر',
      image: 'https://abzarreza.com/wp-content/uploads/2023/09/Warranty.png.webp',
      link: '/faq',
    },
    {
      id: 4,
      title: 'مشاوره تخصصی رایگان',
      description: 'خرید آگاهانه ابزار آلات',
      image: 'https://abzarreza.com/wp-content/uploads/2023/09/Support.png.webp',
      link: '/faq',
    },
  ];

  const getContrastColor = (hexCode: string) => {
    const hex = hexCode.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5
      ? { tickColor: '#0000004d', borderColor: '#FFFFFF' }
      : { tickColor: '#FFFFFF', borderColor: '#0000004d' };
  };

  return (
    <>
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

      <div className="sp-product-info-container">

        {/* بخش قیمت‌ها */}
        <div className="sp-pricing-grid">
          {/* قیمت تک‌فروشی */}
          <div className="sp-pricing-item">
            <span className="sp-pricing-label">قیمت تک فروشی</span>
            <div className="sp-pricing-details">
              <span className="sp-pricing-value">{formatPrice(retailPrice)}</span>
              <span className="sp-discount-badge">{infoproduct.discount}</span>
            </div>
          </div>

          {/* قیمت عمده - فقط اگر معتبر باشد */}
          {hasWholesalePrice && (
            <div className="sp-pricing-item">
              <span className="sp-pricing-label">{minWholesale} عدد به بالا</span>
              <div className="sp-pricing-details">
                <span className="sp-pricing-value">{formatPrice(wholesalePrice)}</span>
                <span className="sp-discount-badge">{infoproduct.discountwholesale}</span>
              </div>
            </div>
          )}

          {/* قیمت نهایی */}
          <div className="bg-[#F7F7F7] text-xl text-[#6D4C82] text-center p-2 rounded-xl">
            <span>{formatPrice(finalPrice)}</span>
          </div>
        </div>

        {/* انتخاب رنگ */}
        {infoproduct.variants && infoproduct.variants.length > 0 && (
          <div className="sp-color-selection">
            <span className="sp-color-label">رنگ‌بندی:</span>
            <div className="sp-color-options">
              {infoproduct.variants.map((variant) => {
                const variantInStock = variant.stock_quantity > 0;
                const { tickColor, borderColor } = getContrastColor(variant.color_hexCode);

                return (
                  <button
                    key={variant.id || variant.color_englishName}
                    onClick={() => handleVariantSelect(variant)}
                    disabled={!variantInStock}
                    style={{
                      backgroundColor: variant.color_hexCode,
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      border:
                        activeVariant?.id === variant.id
                          ? '3px solid #805b99'
                          : '2px solid #d1d5db',
                      outline:
                        activeVariant?.id === variant.id ? '3px solid #e9d5ff' : 'none',
                      cursor: variantInStock ? 'pointer' : 'not-allowed',
                      opacity: variantInStock ? 1 : 0.4,
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    className="sp-color-button"
                    aria-label={`انتخاب رنگ ${variant.color_persianName || variant.color_englishName}`}
                  >
                    {activeVariant?.id === variant.id && variantInStock && (
                      <span
                        style={{
                          color: tickColor,
                          fontSize: '14px',
                          fontWeight: 'bold',
                          backgroundColor: borderColor,
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        
                      </span>
                    )}
                    {!variantInStock && (
                      <span
                        style={{
                          position: 'absolute',
                          width: '2px',
                          height: '32px',
                          backgroundColor: '#ff0000',
                          transform: 'rotate(45deg)',
                        }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
            <span className="sp-selected-color">
              {activeVariant?.color_persianName || 'نامشخص'}
            </span>
          </div>
        )}

        {/* تعداد و افزودن به سبد */}
        <div className="sp-quantity-section">
          <div className="sp-quantity-control">
            <p className="sp-quantity-label">تعداد:</p>
            <div className="sp-quantity-input-container">
              <button onClick={handleIncrement} className="sp-quantity-button" aria-label="افزایش" disabled={!isInStock}>
                +
              </button>
              <input
                type="number"
                value={quantity}
                onChange={handleInputChange}
                className="sp-quantity-input"
                min="1"
                max={stockQuantity}
                disabled={!isInStock}
              />
              <button onClick={handleDecrement} className="sp-quantity-button" aria-label="کاهش" disabled={!isInStock}>
                -
              </button>
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            className="sp-add-to-cart-button"
            disabled={!isInStock}
            style={{
              backgroundColor: !isInStock ? '#cccccc' : '#805b99',
              cursor: !isInStock ? 'not-allowed' : 'pointer',
            }}
          >
            <ShoppingCartOutlined className="sp-cart-icon" />
            {!isInStock ? 'ناموجود' : 'افزودن به سبد خرید'}
          </button>
        </div>

        {/* مزایای خرید */}
        <div className="sp-benefits-grid">
          {benefitdata.map((item) => (
            <Link key={item.id} href={item.link} className="sp-benefit-item">
              <img src={item.image} alt={item.title} className="sp-benefit-image" />
              <div className="sp-benefit-text">
                <h3 className="sp-benefit-title">{item.title}</h3>
                <p className="sp-benefit-description">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default AddToCartInfo;