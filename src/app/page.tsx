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
import FloatingSocialButtons from "@/Components/FloatingSocialButtons";

// 🟢 متادیتا با مدیریت صحیح کانکشن
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
        apple: "/icons/favicon.ico", // یا می‌تونید یه آیکون جدا برای اپل بذارید
      },
    };
  } catch (error) {
    return {
      title: "زیبولند | فروشگاه آنلاین",
      description: "فروشگاه اینترنتی",
    };
  }
}

// 🟢 صفحه اصلی (Server Component)
export default async function Page() {
  // اجرای همزمان تمامی درخواست‌ها (Parallel Data Fetching)
  // این روش سرعت بارگذاری را به شدت افزایش داده و از قفل شدن کانکشن‌های دیتابیس جلوگیری می‌کند
  const [slides, categories] = await Promise.all([
    getSliders(),
    getCategories(),
  ]);

  return (
    <main className="flex flex-col gap-8 pb-10">
      {/* اسلایدر اصلی */}
      <WideSliderContainer slides={slides} />

      {/* بخش‌های دسته‌بندی */}
      <CategoriesContainer categories={categories} />

      {/* بخش‌های ثابت */}
      <BenefitsContainer />
      <Banners />

      {/* اسلایدر محصولات */}
      <ProductSliderContainer vip={true} />

      {/* اسلایدرهای تب‌دار (استفاده از Suspense برای لودینگ بهتر پیشنهاد می‌شود) */}
      <TabProductsSliderContainer title="محبوب‌ترین‌ها" sort="popular" />
      <TabProductsSliderContainer title="ارزان‌ترین‌ها" sort="cheapest" />
      <TabProductsSliderContainer title="جدیدترین‌ها" sort="newest" />

      {/* سایر بخش‌ها */}
      <ArticlesListContainer ispage={false} />
      <BrandsContainer />
       <FloatingSocialButtons />
    </main>
  );
}
