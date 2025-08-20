import React from 'react';
import ProductSlider from './ProductSlider';
import SummaryProduct from './SummaryProduct';
import { InfoTabs } from './InfoTabs';
import AddToCartInfo from './AddToCartInfo';
import './SingleProduct.css';
import { Product } from '@/types/types';

export const SingleProductContainer: React.FC<{ infoproduct: Product | null }> = ({ infoproduct }) => {
  if (!infoproduct) {
    return (
      <div className="sp-container-wrapper">
        <p className="text-center text-red-500">محصول یافت نشد یا خطایی رخ داده است.</p>
      </div>
    );
  }

  return (
    <div className="sp-container-wrapper">
      <div className="sp-container-main">
        <div className="sp-container-product-details">
          <ProductSlider infoproduct={infoproduct} />
          <SummaryProduct infoproduct={infoproduct} />
        </div>
        <InfoTabs infoproduct={infoproduct} />
      </div>
      <div className="sp-container-sidebar">
        <AddToCartInfo infoproduct={infoproduct} />
      </div>
    </div>
  );
};