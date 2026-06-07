import SearchPageClient from "@/Components/SearchPageComponents/SearchPageClient";
import { Metadata } from "next";

// دینامیک کردن متادیتا بر اساس پارامتر q (جستجو)
export async function generateMetadata(
  { searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }
): Promise<Metadata> {
  // در Next.js 14+، searchParams یک Promise هست → await می‌کنیم
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q.trim() : undefined;


  if (q) {
    // decode می‌کنیم تا متن واقعی فارسی (مثل "ی" یا "تستی") به دست بیاد
    const decodedQuery = decodeURIComponent(q);

    return {
      title: `${decodedQuery} | جستجوی محصولات در زیبولند`,
      description: `نتایج جستجو برای "${decodedQuery}" در فروشگاه آنلاین زیبولند – جدیدترین و بهترین محصولات`,
      alternates: {
        canonical: `/search?q=${encodeURIComponent(decodedQuery)}`,
      },
      openGraph: {
        title: `${decodedQuery} | جستجوی محصولات در زیبولند`,
        description: `نتایج جستجو برای "${decodedQuery}" در زیبولند`,
        url: `/search?q=${encodeURIComponent(decodedQuery)}`,
      },
    };
  }

  // حالت پیش‌فرض: وقتی هیچ جستجویی انجام نشده
  return {
    title: "جستجو محصولات | زیبولند",
    description: "جستجو در جدیدترین و متنوع‌ترین محصولات زیبولند – سریع و آسان",
    alternates: {
      canonical: `/search`,
    },
    openGraph: {
      title: "جستجو محصولات | زیبولند",
      description: "جستجو در جدیدترین و متنوع‌ترین محصولات زیبولند",
      url: `/search`,
    },
  };
}

export default function Page() {
  return <SearchPageClient />;
}