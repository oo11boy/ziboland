import BenefitsContainer from "@/Components/Benefits/BenefitsContainer";
import CategoriesContainer from "@/Components/Categories/CategoriesContainer";
import ProductSliderContainer from "@/Components/Sliders/ProductSlider/ProductSliderContainer";
import WideSliderContainer from "@/Components/Sliders/WideSlider/WideSliderContainer";
import TabProductsSliderContainer from "@/Components/Sliders/TabProductsSlider/TabProductsSliderContainer";
import ArticlesListContainer from "@/Components/Articles/ArticlesList/ArticlesListContainer";
import BrandsContainer from "@/Components/Brands/BrandsContainer";
import Banners from "@/Components/Banners/Banners";
import { API } from "@/lib/MainRoutes";
import { Metadata } from "next";

interface Slide {
  id: number;
  imagewide: string;
  imagemin: string;
  alt: string;
  link: string;
}

// 🟢 متادیتا داینامیک (در Next.js 15 باید async باشد)
export async function generateMetadata(): Promise<Metadata> {
  try {
    const res = await fetch(`${API}/settings`, {
      cache: "force-cache",
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error("خطا در دریافت تنظیمات سایت");

    const settings = await res.json();

    return {
      title: settings.site_name || "زیبولند",
      description:
        settings.site_description ||
        "بهترین فروشگاه اینترنتی برای خرید محصولات باکیفیت",
    };
  } catch (error) {
    console.error("Error fetching metadata settings:", error);
    return {
      title: "زیبولند",
      description: "بهترین فروشگاه اینترنتی برای خرید محصولات باکیفیت",
    };
  }
}

// 🟢 صفحه اصلی
export default async function Page() {
  let slidersData: Slide[] = [];

  try {
    const res = await fetch(`${API}/sliders`, {
      cache: "force-cache",
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error("Failed to fetch sliders");

    slidersData = await res.json();
  } catch (error) {
    console.error("Error fetching sliders:", error);
  }

  return (
    <>
      <WideSliderContainer slides={slidersData} />
      <CategoriesContainer />
      <BenefitsContainer />
            <Banners />
      <ProductSliderContainer vip={true} />
      <TabProductsSliderContainer title="محبوب‌ترین‌ها" sort="popular" />

      <TabProductsSliderContainer title="ارزان‌ترین‌ها" sort="cheapest" />
  
      <TabProductsSliderContainer title="جدیدترین‌ها" sort="newest" />
      <ArticlesListContainer ispage={false} />
      <BrandsContainer />
    </>
  );
}
