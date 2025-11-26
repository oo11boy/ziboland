'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCartOutlined } from '@mui/icons-material';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './SingleProduct.css';
import { Product, Color } from '@/types/types';
import { useCart } from '@/ContextApi/CartContext';

interface BenefitItem {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
}

const AddToCartInfo: React.FC<{ infoproduct: Product }> = ({ infoproduct }) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedColor, setSelectedColor] = useState<Color | null>(
    infoproduct.colors && infoproduct.colors.length > 0 ? infoproduct.colors[0] : null
  );
  const [isWholesale, setIsWholesale] = useState<boolean>(false);
  const { dispatch } = useCart();

  // تبدیل قیمت‌ها به عدد
  const retailPrice = parseInt(String(infoproduct.discountedPrice).replace(/[^\d]/g, ''), 10) || 0;

  const wholesalePriceRaw = String(infoproduct.discountwholesalePrice).replace(/[^\d]/g, '');
  const wholesalePrice = wholesalePriceRaw ? parseInt(wholesalePriceRaw, 10) : 0;

  // آیا قیمت عمده وجود دارد و معتبر است؟
  const hasWholesalePrice = wholesalePrice > 0 && infoproduct.minwholesale > 0;

  // آیا کاربر واجد شرایط قیمت عمده است؟
  const isEligibleForWholesale = hasWholesalePrice && quantity >= infoproduct.minwholesale;

  // قیمت نهایی بر اساس شرایط
  const finalPrice = isEligibleForWholesale ? wholesalePrice * quantity : retailPrice * quantity;

  // نمایش Toast فقط وقتی قیمت عمده معتبر باشد
  useEffect(() => {
    if (!hasWholesalePrice) {
      setIsWholesale(false);
      return;
    }

    if (isEligibleForWholesale && !isWholesale) {
      toast.success(`قیمت عمده‌فروشی (${infoproduct.minwholesale} عدد به بالا) اعمال شد!`, {
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
  }, [quantity, infoproduct.minwholesale, isWholesale, hasWholesalePrice, isEligibleForWholesale]);

  const handleIncrement = () => setQuantity(prev => prev + 1);

  const handleDecrement = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value >= 0) {
      setQuantity(value);
    }
  };

  const handleColorSelect = (color: Color) => {
    setSelectedColor(color);
  };

  const handleAddToCart = () => {
    if (!infoproduct.inStock) {
      toast.error('محصول موجود نیست', {
        position: 'top-center',
        className: 'yekan',
        autoClose: 3000,
        theme: 'colored',
      });
      return;
    }

    if (quantity < 1) {
      toast.error('لطفاً تعداد محصول را انتخاب کنید', {
        position: 'top-center',
        className: 'yekan',
        autoClose: 3000,
        theme: 'colored',
      });
      return;
    }

    // تعیین نوع قیمت
    const priceType = hasWholesalePrice && quantity >= infoproduct.minwholesale ? 'wholesale' : 'single';
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
        color: selectedColor,
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
          {/* قیمت تک‌فروشی - همیشه نمایش داده می‌شود */}
          <div className="sp-pricing-item">
            <span className="sp-pricing-label">قیمت تک فروشی</span>
            <div className="sp-pricing-details">
              <span className="sp-pricing-value">{formatPrice(retailPrice)}</span>
              <span className="sp-discount-badge">{infoproduct.discount}</span>
            </div>
          </div>

          {/* قیمت عمده - فقط اگر قیمت > 0 باشد نمایش داده می‌شود */}
          {hasWholesalePrice && (
            <div className="sp-pricing-item">
              <span className="sp-pricing-label">{infoproduct.minwholesale} عدد به بالا</span>
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
        {infoproduct.colors && infoproduct.colors.length > 0 && (
          <div className="sp-color-selection">
            <span className="sp-color-label">رنگ‌بندی:</span>
            <div className="sp-color-options">
              {infoproduct.colors.map((color) => {
                const { tickColor, borderColor } = getContrastColor(color.hexCode);

                return (
                  <button
                    key={color.englishName}
                    onClick={() => handleColorSelect(color)}
                    style={{
                      backgroundColor: color.hexCode,
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border:
                        selectedColor?.englishName === color.englishName
                          ? '2px solid #805b99'
                          : '1px solid #d1d5db',
                      outline:
                        selectedColor?.englishName === color.englishName ? '2px solid #e9d5ff' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    className="sp-color-button"
                    aria-label={`انتخاب رنگ ${color.persianName}`}
                  >
                    {selectedColor?.englishName === color.englishName && (
                      <span
                        style={{
                          color: tickColor,
                          fontSize: '10px',
                          fontWeight: 'bold',
                          backgroundColor: borderColor,
                          borderRadius: '50%',
                          width: '16px',
                          height: '16px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'absolute',
                        }}
                      >
                        
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <span className="sp-selected-color">
              {selectedColor?.persianName || 'نامشخص'}
            </span>
          </div>
        )}

        {/* تعداد و افزودن به سبد */}
        <div className="sp-quantity-section">
          <div className="sp-quantity-control">
            <p className="sp-quantity-label">تعداد:</p>
            <div className="sp-quantity-input-container">
              <button onClick={handleIncrement} className="sp-quantity-button" aria-label="افزایش">
                +
              </button>
              <input
                disabled
                type="number"
                value={quantity}
                onChange={handleInputChange}
                className="sp-quantity-input"
                min="1"
              />
              <button onClick={handleDecrement} className="sp-quantity-button" aria-label="کاهش">
                -
              </button>
            </div>
          </div>

          <button onClick={handleAddToCart} className="sp-add-to-cart-button">
            <ShoppingCartOutlined className="sp-cart-icon" />
            افزودن به سبد خرید
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