import BenefitsContainer from "@/Components/Benefits/BenefitsContainer";
import CategoriesContainer from "@/Components/Categories/CategoriesContainer";
import WideHeaderContainer from "@/Components/Header/WideHeader/WideHeaderContainer";
import ProductSliderContainer from "@/Components/Sliders/ProductSlider/ProductSliderContainer";
import WideSliderContainer from "@/Components/Sliders/WideSlider/WideSliderContainer";
import React from "react";
import TabProductsSliderContainer from "@/Components/Sliders/TabProductsSlider/TabProductsSliderContainer";
import ArticlesListContainer from "@/Components/Articles/ArticlesList/ArticlesListContainer";
import BrandsContainer from "@/Components/Brands/BrandsContainer";
import FooterContainer from "@/Components/Footer/FooterContainer";
import MoblieHeaderTopTab from "@/Components/Header/MobileHeader/MoblieHeaderTopTab";
import MobileBottomNavigation from "@/Components/Header/MobileHeader/MobileBottomNavigation";
import Banners from "@/Components/Banners/Banners";

export default function page() {
  return (
 <>
 <WideHeaderContainer/>
   <MoblieHeaderTopTab/>
   <WideSliderContainer />
   <CategoriesContainer />
   <BenefitsContainer />
   <ProductSliderContainer vip={true} />
   <TabProductsSliderContainer title="پرفروشترین ها" />
   <Banners/>
   <TabProductsSliderContainer title="ارزانترین ها" />
   <Banners/>
   <TabProductsSliderContainer title="جدیدترین ها" />
   <ArticlesListContainer />
   <BrandsContainer />
   <FooterContainer />
   <MobileBottomNavigation/>
   </>
      /* 
         <WideHeaderContainer/> 
      */
  
  );
}
