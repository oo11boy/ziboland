'use client';

import React from 'react';
import { FavoriteBorderOutlined, ShareOutlined } from '@mui/icons-material';
import './SingleProduct.css';
import { Categoryapi, Product, Variant } from '@/types/types';

interface SummaryProductProps {
  infoproduct: Product;
  selectedVariant?: Variant | null;
  onVariantChange?: (variant: Variant) => void;
  categories:Categoryapi[],
}

const SummaryProduct: React.FC<SummaryProductProps> = ({
  infoproduct,
categories
}) => {

console.log(categories)
  const motherCat = categories.find(c => c.id === infoproduct.mothercatId);

  return (
    <div className="sp-summary-container">
      {/* عنوان محصول */}
      <h1 className="sp-summary-title">{infoproduct.title || 'بدون عنوان'}</h1>



      {/* ویژگی‌های محصول */}
      <h2 className="sp-summary-features-title">ویژگی‌های محصول</h2>
      {Array.isArray(infoproduct.features) && infoproduct.features.length > 0 ? (
        <ul className="sp-summary-features-list">
          {infoproduct.features.map((item, index) => (
            <li key={index} className="sp-summary-feature-item">
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">ویژگی‌ای برای این محصول ثبت نشده است.</p>
      )}

      {/* جزئیات اضافی */}
      <div className="sp-summary-details">
        <span>دسته: {motherCat && motherCat.name || 'نامشخص'}</span>
        <br />
        <span>برند: {infoproduct.brandDetails?.title || 'نامشخص'}</span>
      </div>

      {/* دکمه‌های علاقه‌مندی و اشتراک‌گذاری */}
      <div className="sp-summary-actions">
        <FavoriteBorderOutlined className="sp-summary-icon" />
        <ShareOutlined className="sp-summary-icon" />
      </div>
    </div>
  );
};

export default SummaryProduct;