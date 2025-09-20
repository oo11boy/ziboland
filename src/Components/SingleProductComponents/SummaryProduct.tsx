import React from 'react';
import { FavoriteBorderOutlined, ShareOutlined } from '@mui/icons-material';
import './SingleProduct.css';
import { Product } from '@/types/types';

const SummaryProduct: React.FC<{ infoproduct: Product }> = ({ infoproduct }) => {
  return (
    <div className="sp-summary-container">
      <h1 className="sp-summary-title">{infoproduct.title || 'بدون عنوان'}</h1>
      <h2 className="sp-summary-features-title">ویژگی‌های محصول</h2>
      {infoproduct.features && infoproduct.features.length > 0 ? (
        <ul className="sp-summary-features-list">
          {infoproduct.features.map((item, index) => (
            <li key={index} className="sp-summary-feature-item">{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">ویژگی‌ای برای این محصول ثبت نشده است.</p>
      )}
      <div className="sp-summary-details">
        <span>دسته: {infoproduct.category || 'نامشخص'}</span>
        <br />
        <span>برند: {infoproduct.brandDetails?.title || 'نامشخص'}</span>
      </div>
      <div className="sp-summary-actions">
        <FavoriteBorderOutlined className="sp-summary-icon" />
        <ShareOutlined className="sp-summary-icon" />
      </div>
    </div>
  );
};

export default SummaryProduct;