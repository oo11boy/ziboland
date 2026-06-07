import { Metadata } from "next";
import { API } from "@/lib/MainRoutes";
import BenefitsContainer from "@/Components/Benefits/BenefitsContainer";
import CategoriesContainer from "@/Components/Categories/CategoriesContainer";
import ProductSliderContainer from "@/Components/Sliders/ProductSlider/ProductSliderContainer";
import WideSliderContainer from "@/Components/Sliders/WideSlider/WideSliderContainer";
import TabProductsSliderContainer from "@/Components/Sliders/TabProductsSlider/TabProductsSliderContainer";
import ArticlesListContainer from "@/Components/Articles/ArticlesList/ArticlesListContainer";
import BrandsContainer from "@/Components/Brands/BrandsContainer";
import Banners from "@/Components/Banners/Banners";
// --- تابع کمکی برای فچ با تایم‌اوت جهت جلوگیری از خطای 502 ---
async function fetchWithTimeout(
  url: string,
  options: any = {},
  timeout = 3000,
) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

// 🟢 متادیتا با مدیریت خطا و تایم‌اوت
export async function generateMetadata(): Promise<Metadata> {
  const defaultMeta = {
    title: "زیبولند | فروشگاه آنلاین",
    description: "بهترین فروشگاه اینترنتی برای خرید محصولات باکیفیت",
  };
  try {
    const res = await fetchWithTimeout(
      `/api/settings`,
      {
        next: { revalidate: 3600 },
      },
      2500,
    ); // تایم‌اوت ۲.۵ ثانیه برای متادیتا
    if (!res.ok) return defaultMeta;
    const text = await res.text();
    const settings = JSON.parse(text);
    return {
      title: settings?.site_name || defaultMeta.title,
      description: settings?.site_description || defaultMeta.description,
    };
  } catch (error) {
    return defaultMeta;
  }
}
// 🟢 صفحه اصلی (Server Component)
export default async function Page() {
  return (
    <>
      {/* اسلایدر اصلی */}
      <WideSliderContainer />
      {/* بخش‌های ثابت */}
      <CategoriesContainer />
      <BenefitsContainer />
      <Banners />
      {/* بخش‌های محصولی با قابلیت کش داخلی خودشان */}
      <ProductSliderContainer vip={true} />
      <TabProductsSliderContainer title="محبوب‌ترین‌ها" sort="popular" />
      <TabProductsSliderContainer title="ارزان‌ترین‌ها" sort="cheapest" />
      <TabProductsSliderContainer title="جدیدترین‌ها" sort="newest" />
      <ArticlesListContainer ispage={false} />
      <BrandsContainer />
    </>
  );
}
