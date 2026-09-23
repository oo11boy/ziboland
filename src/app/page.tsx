import { Metadata } from "next";
import { getSettings } from "@/lib/settings";
import { getSliders } from "@/lib/sliders";
import { getCategories } from "@/lib/categories";

import BenefitsContainer from "@/Components/Benefits/BenefitsContainer";
import CategoriesContainer from "@/Components/Categories/CategoriesContainer";
import ProductSliderContainer from "@/Components/Sliders/ProductSlider/ProductSliderContainer";
import WideSliderContainer from "@/Components/Sliders/WideSlider/WideSliderContainer";
import TabProductsSliderContainer from "@/Components/Sliders/TabProductsSlider/TabProductsSliderContainer";
import ArticlesListContainer from "@/Components/Articles/ArticlesList/ArticlesListContainer";
import BrandsContainer from "@/Components/Brands/BrandsContainer";
import Banners from "@/Components/Banners/Banners";
import FloatingSocialButtons from "@/Components/FloatingSocialButtons";

// ✅ ISR: هر ۵ دقیقه یک بار refresh + امکان On-Demand
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  try {
    const settings = await getSettings();
    return {
      title: settings?.site_name || "زیبولند | فروشگاه آنلاین",
      description:
        settings?.site_description ||
        "بهترین فروشگاه اینترنتی برای خرید محصولات باکیفیت",
      icons: {
        icon: [
          { url: "/icons/favicon.ico", sizes: "any" },
          { url: "/icons/favicon.ico", type: "image/x-icon" },
        ],
        shortcut: "/icons/favicon.ico",
        apple: "/icons/favicon.ico",
      },
    };
  } catch (error) {
    return {
      title: "زیبولند | فروشگاه آنلاین",
      description: "فروشگاه اینترنتی",
    };
  }
}

export default async function Page() {
  const [slides, categories] = await Promise.all([
    getSliders(),
    getCategories(),
  ]);

  return (
    <main className="flex flex-col gap-8 pb-10">
      <WideSliderContainer slides={slides} />
      <CategoriesContainer categories={categories} />
      <BenefitsContainer />
      <Banners />
      <ProductSliderContainer vip={true} />
      <TabProductsSliderContainer title="محبوب‌ترین‌ها" sort="popular" />
      <TabProductsSliderContainer title="ارزان‌ترین‌ها" sort="cheapest" />
      <TabProductsSliderContainer title="جدیدترین‌ها" sort="newest" />
      <ArticlesListContainer ispage={false} />
      <BrandsContainer />
      <FloatingSocialButtons />
    </main>
  );
}