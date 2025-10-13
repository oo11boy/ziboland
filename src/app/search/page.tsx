import SearchPageClient from "@/Components/SearchPageComponents/SearchPageClient";
import { Metadata } from "next";


// 🟢 متادیتای استاتیک برای صفحه جستجو
export const metadata: Metadata = {
  title: "جستجو محصولات | زیبولند",
  description: "جستجو در جدیدترین محصولات زیبولند",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/search`,
  },
};

export default function Page() {
  return <SearchPageClient />;
}
