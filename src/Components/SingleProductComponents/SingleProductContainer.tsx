'use client';

import React, { useState } from 'react';
import ProductSlider from './ProductSlider';
import SummaryProduct from './SummaryProduct';
import { InfoTabs } from './InfoTabs';
import AddToCartInfo from './AddToCartInfo';
import './SingleProduct.css';
import { Product, Variant } from '@/types/types';

export const SingleProductContainer: React.FC<{ infoproduct: Product | null }> = ({ infoproduct }) => {
  // واریانت پیش‌فرض: اولین واریانت موجود یا null
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    infoproduct?.variants && infoproduct.variants.length > 0 
      ? infoproduct.variants[0] 
      : null
  );

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
          {/* اسلایدر تصاویر */}
          <ProductSlider 
            infoproduct={infoproduct} 
            selectedVariant={selectedVariant} 
          />

          {/* خلاصه محصول + انتخاب رنگ */}
          <SummaryProduct 
            infoproduct={infoproduct} 
            selectedVariant={selectedVariant}
            onVariantChange={handleVariantChange}
          />
        </div>

        {/* تب‌ها: مشخصات، توضیحات، نظرات */}
        <InfoTabs 
          infoproduct={infoproduct} 
          selectedVariant={selectedVariant} 
        />
      </div>

      {/* سایدبار: قیمت، افزودن به سبد */}
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