"use client";

import React, { useState, useEffect } from "react";
import ProductSlider from "./ProductSlider";
import SummaryProduct from "./SummaryProduct";
import { InfoTabs } from "./InfoTabs";
import AddToCartInfo from "./AddToCartInfo";
import "./SingleProduct.css";
import { Product, Variant } from "@/types/types";
import RelatedProductSlider from "../Sliders/RelatedProductSlider/RelatedProductSlider";

export const SingleProductContainer: React.FC<{
  infoproduct: Product | null;
}> = ({ infoproduct }) => {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(() => {
    if (infoproduct?.variants && infoproduct.variants.length > 0) {
      return [...infoproduct.variants].sort((a, b) => {
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

  const [isMobile, setIsMobile] = useState(false);

  // تشخیص حالت موبایل
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  if (!infoproduct) {
    return (
      <div className="sp-container-wrapper">
        <p className="text-center text-red-500">
          محصول یافت نشد یا خطایی رخ داده است.
        </p>
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
            infoproduct={infoproduct}
            selectedVariant={selectedVariant}
            onVariantChange={handleVariantChange}
          />
        </div>

        <InfoTabs infoproduct={infoproduct} selectedVariant={selectedVariant} />
        
        {/* در حالت دسکتاپ: محصولات مشابه قبل از سبد خرید */}
        {!isMobile && (
          <RelatedProductSlider
            mothercatId={infoproduct.mothercatId}
            excludeId={infoproduct.id}
          />
        )}
      </div>

      <div className="sp-container-sidebar">
        <AddToCartInfo
          infoproduct={infoproduct}
          selectedVariant={selectedVariant}
          onVariantChange={handleVariantChange}
        />
        
        {/* در حالت موبایل: محصولات مشابه بعد از سبد خرید */}
        {isMobile && (
          <div className="sp-mobile-related-products">
            <RelatedProductSlider
              mothercatId={infoproduct.mothercatId}
              excludeId={infoproduct.id}
            />
          </div>
        )}
      </div>
    </div>
  );
};