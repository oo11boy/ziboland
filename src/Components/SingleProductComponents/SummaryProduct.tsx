import React from 'react';
import { FavoriteBorderOutlined, ShareOutlined } from '@mui/icons-material';
import './SingleProduct.css';

interface SummaryProductProps {
  infoproduct: {
    title: string;
    features: string[];
    mothercat: string;
    subcat: string;
    brand: string;
  };
}

const SummaryProduct: React.FC<SummaryProductProps> = ({ infoproduct }) => {
  return (
    <div className="sp-summary-container">
      <h1 className="sp-summary-title">{infoproduct.title}</h1>
      <h2 className="sp-summary-features-title">ویژگی‌های محصول</h2>
      <ul className="sp-summary-features-list">
        {infoproduct.features.map((item, index) => (
          <li key={index} className="sp-summary-feature-item">{item}</li>
        ))}
      </ul>
      <div className="sp-summary-details">
        <span>دسته: {infoproduct.mothercat} | {infoproduct.subcat}</span>
        <br />
        <span>برند: {infoproduct.brand}</span>
      </div>
      <div className="sp-summary-actions">
        <FavoriteBorderOutlined className="sp-summary-icon" />
        <ShareOutlined className="sp-summary-icon" />
      </div>
    </div>
  );
};

export default SummaryProduct;