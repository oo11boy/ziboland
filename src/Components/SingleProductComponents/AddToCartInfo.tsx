'use client';

import React, { useState } from 'react';
import { ShoppingCartOutlined } from '@mui/icons-material';
import Link from 'next/link';
import './SingleProduct.css';

interface BenefitItem {
  id: number;
  title: string;
  description: string;
  image: string;
  link: string;
}

interface AddToCartInfoProps {
  infoproduct: {
    minwholesale: number;
    discountwholesalePrice: string;
    discountedPrice: string;
    discountwholesale: string;
    discount: string;
    colors: string[];
  };
}

const AddToCartInfo: React.FC<AddToCartInfoProps> = ({ infoproduct }) => {
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedColor, setSelectedColor] = useState<string>(infoproduct.colors[0]);

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

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  const handleAddToCart = () => {
    console.log(`محصول با رنگ ${selectedColor} و تعداد ${quantity} به سبد خرید اضافه شد`);
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

  return (
    <div className="sp-product-info-container">
      <div className="sp-pricing-grid">
        <div className="sp-pricing-item">
          <span className="sp-pricing-label">{infoproduct.minwholesale} عدد به بالا</span>
          <div className="sp-pricing-details">
            <span className="sp-pricing-value">{infoproduct.discountwholesalePrice} تومان</span>
            <span className="sp-discount-badge">{infoproduct.discountwholesale}</span>
          </div>
        </div>
        <div className="sp-pricing-item">
          <span className="sp-pricing-label">قیمت تک فروشی</span>
          <div className="sp-pricing-details">
            <span className="sp-pricing-value">{infoproduct.discountedPrice} تومان</span>
            <span className="sp-discount-badge">{infoproduct.discount}</span>
          </div>
        </div>
      </div>

      <div className="sp-color-selection">
        <span className="sp-color-label">رنگ‌بندی:</span>
        <div className="sp-color-options">
          {infoproduct.colors.map((color) => (
            <button
              key={color}
              onClick={() => handleColorSelect(color)}
              style={{
                backgroundColor: color,
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: selectedColor === color ? '2px solid #805b99' : '1px solid #d1d5db',
                outline: selectedColor === color ? '2px solid #e9d5ff' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              className="sp-color-button"
              aria-label={`انتخاب رنگ ${color}`}
            />
          ))}
        </div>
      </div>

      <div className="sp-quantity-section">
        <div className="sp-quantity-control">
          <p className="sp-quantity-label">تعداد:</p>
          <div className="sp-quantity-input-container">
            <button
              onClick={handleDecrement}
              className="sp-quantity-button"
              aria-label="کاهش تعداد"
            >
              -
            </button>
            <input
              type="number"
              value={quantity}
              onChange={handleInputChange}
              className="sp-quantity-input"
              min="1"
              aria-label="تعداد محصول"
            />
            <button
              onClick={handleIncrement}
              className="sp-quantity-button"
              aria-label="افزایش تعداد"
            >
              +
            </button>
          </div>
        </div>
        <button
          onClick={handleAddToCart}
          className="sp-add-to-cart-button"
        >
          <ShoppingCartOutlined className="sp-cart-icon" />
          افزودن به سبد خرید
        </button>
      </div>

      <div className="sp-benefits-grid">
        {benefitdata.map((item) => (
          <Link
            key={item.id}
            href={item.link}
            className="sp-benefit-item"
          >
            <img src={item.image} alt={item.title} className="sp-benefit-image" />
            <div className="sp-benefit-text">
              <h2 className="sp-benefit-title">{item.title}</h2>
              <p className="sp-benefit-description">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AddToCartInfo;