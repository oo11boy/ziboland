import React from 'react';
import ProductSlider from './ProductSlider';
import SummaryProduct from './SummaryProduct';
import { InfoTabs } from './InfoTabs';
import AddToCartInfo from './AddToCartInfo';
import './SingleProduct.css';

interface MediaItem {
  type: 'image' | 'video';
  src: string;
  thumbnail: string;
  alt: string;
}
interface Color {
  englishName: string;
  persianName: string;
  hexCode: string;
}

interface Product {
  id: number;
  title: string;
  mothercat: string;
  subcat: string;
  features: string[];
  content: string;
  brand: string;
  originalPrice: string;
  discountedPrice: string;
  wholesalePrice: string;
  discountwholesalePrice: string;
  minwholesale: number;
  discount: string;
  discountwholesale: string;
  media: MediaItem[];
  colors: Color[];
  infotable: { id: number; name: string; value: string }[];
}

export const SingleProductContainer: React.FC<{ infoproduct: Product }> = ({ infoproduct }) => {
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