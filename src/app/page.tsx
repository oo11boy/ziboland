import BenefitsContainer from "@/Components/Benefits/BenefitsContainer";
import CategoriesContainer from "@/Components/Categories/CategoriesContainer";
import ProductSliderContainer from "@/Components/Sliders/ProductSlider/ProductSliderContainer";
import WideSliderContainer from "@/Components/Sliders/WideSlider/WideSliderContainer";
import React from "react";
import TabProductsSliderContainer from "@/Components/Sliders/TabProductsSlider/TabProductsSliderContainer";
import ArticlesListContainer from "@/Components/Articles/ArticlesList/ArticlesListContainer";
import BrandsContainer from "@/Components/Brands/BrandsContainer";
import Banners from "@/Components/Banners/Banners";

export default function page() {
  return (
    <>
      <WideSliderContainer />
      <CategoriesContainer />
      <BenefitsContainer />
      <ProductSliderContainer vip={true} />
      <TabProductsSliderContainer title="پرفروشترین ها" />
      <Banners />
      <TabProductsSliderContainer title="ارزانترین ها" />
      <Banners />
      <TabProductsSliderContainer title="جدیدترین ها" />
      <ArticlesListContainer ispage={false} />
      <BrandsContainer />
    </>
  );
}
