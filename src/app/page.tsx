// src/app/page.tsx
import { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { getSliders } from "@/lib/sliders";
import { getCategories } from "@/lib/categories";

// کامپوننت‌ها
import BenefitsContainer from "@/Components/Benefits/BenefitsContainer";
import CategoriesContainer from "@/Components/Categories/CategoriesContainer";
import ProductSliderContainer from "@/Components/Sliders/ProductSlider/ProductSliderContainer";
import WideSliderContainer from "@/Components/Sliders/WideSlider/WideSliderContainer";
import TabProductsSliderContainer from "@/Components/Sliders/TabProductsSlider/TabProductsSliderContainer";
import ArticlesListContainer from "@/Components/Articles/ArticlesList/ArticlesListContainer";
import BrandsContainer from "@/Components/Brands/BrandsContainer";
import Banners from "@/Components/Banners/Banners";

// 🟢 متادیتا با دسترسی مستقیم به دیتابیس
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  
  const defaultMeta = {
    title: "زیبولند | فروشگاه آنلاین",
    description: "بهترین فروشگاه اینترنتی برای خرید محصولات باکیفیت",
  };

  return {
    title: settings?.site_name || defaultMeta.title,
    description: settings?.site_description || defaultMeta.description,
  };
}

// 🟢 صفحه اصلی (Server Component)
export default async function Page() {
  // دریافت همزمان داده‌ها برای سرعت بیشتر (Parallel Data Fetching)
  const [slides, categories] = await Promise.all([
    getSliders(),
    getCategories(),
  ]);

  return (
    <>
      {/* اسلایدر اصلی */}
      <WideSliderContainer slides={slides} />
      
      {/* بخش‌های دسته‌بندی */}
      <CategoriesContainer categories={categories} />
      
      {/* بخش‌های ثابت */}
      <BenefitsContainer />
      <Banners />
      
      <ProductSliderContainer vip={true} />
      <TabProductsSliderContainer title="محبوب‌ترین‌ها" sort="popular" />
      <TabProductsSliderContainer title="ارزان‌ترین‌ها" sort="cheapest" />
      <TabProductsSliderContainer title="جدیدترین‌ها" sort="newest" />
      
      {/* سایر بخش‌ها */}
      <ArticlesListContainer ispage={false} />
      <BrandsContainer />
    </>
  );
}