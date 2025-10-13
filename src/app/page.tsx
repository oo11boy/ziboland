import BenefitsContainer from "@/Components/Benefits/BenefitsContainer";
import CategoriesContainer from "@/Components/Categories/CategoriesContainer";
import ProductSliderContainer from "@/Components/Sliders/ProductSlider/ProductSliderContainer";
import WideSliderContainer from "@/Components/Sliders/WideSlider/WideSliderContainer";
import React from "react";
import TabProductsSliderContainer from "@/Components/Sliders/TabProductsSlider/TabProductsSliderContainer";
import ArticlesListContainer from "@/Components/Articles/ArticlesList/ArticlesListContainer";
import BrandsContainer from "@/Components/Brands/BrandsContainer";
import Banners from "@/Components/Banners/Banners";
import { API } from "@/lib/MainRoutes"; // فرض بر این است که API اینجا تعریف شده

// نوع داده برای اسلایدها (از کد شما برداشته شده)
interface Slide {
  id: number;
  imagewide: string;
  imagemin: string;
  alt: string;
  link: string;
}

export default async function page() {

  const slidersData: Slide[] = await fetch(`${API}/sliders`, {
    cache: 'force-cache', // برای کشینگ استاتیک (در production مفید است)
    next: { revalidate: 3600 }, // revalidate هر ساعت (اختیاری، برای ISR)
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error('Failed to fetch sliders');
      }
      return res.json();
    })
    .catch((error) => {
      console.error('Error fetching sliders:', error);
      return []; // در صورت خطا، آرایه خالی برگردان
    });


  return (
    <>
    
      <WideSliderContainer slides={slidersData} /> {/* پاس props */}
      <CategoriesContainer />
      <BenefitsContainer />
      <ProductSliderContainer vip={true} />
      <TabProductsSliderContainer title="محبوبترین ها" />
      <Banners />
      <TabProductsSliderContainer title="ارزانترین ها" />
      <Banners />
      <TabProductsSliderContainer title="جدیدترین ها" />
      <ArticlesListContainer ispage={false} />
      <BrandsContainer />
    </>
  );
}