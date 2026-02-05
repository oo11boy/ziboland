'use client';

import React, { useState } from 'react';
import ProductSlider from './ProductSlider';
import SummaryProduct from './SummaryProduct';
import { InfoTabs } from './InfoTabs';
import AddToCartInfo from './AddToCartInfo';
import './SingleProduct.css';
import { Categoryapi, Product, Variant } from '@/types/types';

export const SingleProductContainer: React.FC<{ infoproduct: Product | null, categories: Categoryapi[] }> = ({ infoproduct, categories }) => {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(() => {
    if (infoproduct?.variants && infoproduct.variants.length > 0) {
      return [...infoproduct.variants]
        .sort((a, b) => {
          const aInStock = a.stock_quantity > 0 ? 1 : 0;
          const bInStock = b.stock_quantity > 0 ? 1 : 0;
          if (aInStock !== bInStock) return bInStock - aInStock;
          const priceA = a.price_single * (1 - (a.discount_percent || 0) / 100);
          const priceB = b.price_single * (1 - (b.discount_percent || 0) / 100);
          return priceA - priceB;
        })[0];
    }
    return null;
  });

  if (!infoproduct) {
    return (
      <div className="sp-container-wrapper">
        <p className="text-center text-red-500">محصول یافت نشد یا خطایی رخ داده است.</p>
      </div>
    );
  }

  const handleVariantChange = (variant: Variant) => {
    setSelectedVariant(variant);
  };

  return (
    <div className="sp-container-wrapper">
      <div className="sp-container-main">
        <div className="sp-container-product-details">
          <ProductSlider 
            infoproduct={infoproduct} 
            selectedVariant={selectedVariant} 
          />

          <SummaryProduct 
            categories={categories}
            infoproduct={infoproduct} 
            selectedVariant={selectedVariant}
            onVariantChange={handleVariantChange}
          />
        </div>

        <InfoTabs 
          infoproduct={infoproduct} 
          selectedVariant={selectedVariant} 
        />
      </div>

      <div className="sp-container-sidebar">
        <AddToCartInfo 
          infoproduct={infoproduct} 
          selectedVariant={selectedVariant}
          onVariantChange={handleVariantChange}
        />
      </div>
    </div>
  );
};