'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCartOutlined } from '@mui/icons-material';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './SingleProduct.css';
import { Product, Color } from '@/types/types';

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

  const retailPrice = parseInt(infoproduct.discountedPrice.replace(/[^\d]/g, '')) || 0;
  const wholesalePrice = parseInt(infoproduct.discountwholesalePrice.replace(/[^\d]/g, '')) || 0;

  const finalPrice = quantity >= infoproduct.minwholesale ? wholesalePrice * quantity : retailPrice * quantity;

  useEffect(() => {
    if (quantity >= infoproduct.minwholesale && !isWholesale) {
      toast.success(`قیمت عمده‌فروشی (${infoproduct.minwholesale} عدد به بالا) اعمال شد!`, {
        position: "top-center",
        className: "yekan",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      setIsWholesale(true);
    } else if (quantity < infoproduct.minwholesale && isWholesale) {
      toast.info('قیمت به حالت تک‌فروشی بازگشت.', {
        position: "top-center",
        className: "yekan",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
      setIsWholesale(false);
    }
  }, [quantity, infoproduct.minwholesale, isWholesale]);

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 1) {
      setQuantity(value);
    }
  };

  const handleColorSelect = (color: Color) => {
    setSelectedColor(color);
  };

  const handleAddToCart = () => {
    console.log(`محصول با رنگ ${selectedColor?.persianName || 'نامشخص'} (${selectedColor?.englishName || 'نامشخص'}) و تعداد ${quantity} به سبد خرید اضافه شد`);
    toast.success('محصول به سبد خرید اضافه شد!', {
      position: "top-center",
      className: "yekan",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      theme: "colored",
    });
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

  const formatPrice = (price: number) => {
    return `${price.toLocaleString('fa-IR')} تومان`;
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
        <div className="sp-pricing-grid">
          <div className="sp-pricing-item">
            <span className="sp-pricing-label">قیمت تک فروشی</span>
            <div className="sp-pricing-details">
              <span className="sp-pricing-value">{formatPrice(retailPrice)}</span>
              <span className="sp-discount-badge">{infoproduct.discount}</span>
            </div>
          </div>
          <div className="sp-pricing-item">
            <span className="sp-pricing-label">{infoproduct.minwholesale} عدد به بالا</span>
            <div className="sp-pricing-details">
              <span className="sp-pricing-value">{formatPrice(wholesalePrice)}</span>
              <span className="sp-discount-badge">{infoproduct.discountwholesale}</span>
            </div>
          </div>
          <div className="bg-[#F7F7F7] text-xl text-[#6D4C82] text-center p-2 rounded-xl">
            <span>{formatPrice(finalPrice)}</span>
          </div>
        </div>

        {infoproduct.colors && infoproduct.colors.length > 0 && (
          <div className="sp-color-selection">
            <span className="sp-color-label">رنگ‌بندی:</span>
            <div className="sp-color-options">
              {infoproduct.colors.map((color) => {
                const getContrastColor = (hexCode: string) => {
                  const hex = hexCode.replace('#', '');
                  const r = parseInt(hex.substring(0, 2), 16);
                  const g = parseInt(hex.substring(2, 4), 16);
                  const b = parseInt(hex.substring(4, 6), 16);
                  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
                  return luminance > 0.5 ? { tickColor: '#0000004d', borderColor: '#FFFFFF' } : { tickColor: '#FFFFFF', borderColor: '#0000004d' };
                };

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
                      border: selectedColor?.englishName === color.englishName ? '2px solid #805b99' : '1px solid #d1d5db',
                      outline: selectedColor?.englishName === color.englishName ? '2px solid #e9d5ff' : 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                    className="sp-color-button"
                    aria-label={`انتخاب رنگ ${color.persianName} (${color.englishName})`}
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
                        ✔
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <span className="sp-selected-color">{selectedColor?.persianName || 'نامشخص'}</span>
          </div>
        )}

        <div className="sp-quantity-section">
          <div className="sp-quantity-control">
            <p className="sp-quantity-label">تعداد:</p>
            <div className="sp-quantity-input-container">
              <button
                onClick={handleIncrement}
                className="sp-quantity-button"
                aria-label="افزایش تعداد"
              >
                +
              </button>
              <input
                disabled
                type="number"
                value={quantity}
                onChange={handleInputChange}
                className="sp-quantity-input"
                min="1"
                aria-label="تعداد محصول"
              />
              <button
                onClick={handleDecrement}
                className="sp-quantity-button"
                aria-label="کاهش تعداد"
              >
                -
              </button>
            </div>
          </div>
          <button onClick={handleAddToCart} className="sp-add-to-cart-button">
            <ShoppingCartOutlined className="sp-cart-icon" />
            افزودن به سبد خرید
          </button>
        </div>

        <div className="sp-benefits-grid">
          {benefitdata.map((item) => (
            <Link key={item.id} href={item.link} className="sp-benefit-item">
              <img src={item.image} alt={item.title} className="sp-benefit-image" />
              <div className="sp-benefit-text">
                <h2 className="sp-benefit-title">{item.title}</h2>
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