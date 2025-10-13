import ArticlesListContainer from "@/Components/Articles/ArticlesList/ArticlesListContainer";
import { Metadata } from "next";

// 🟢 متادیتای استاتیک برای صفحه مقالات
export const metadata: Metadata = {
  title: "مقالات | زیبولند",
  description:
    "جدیدترین مقالات مجله زیبولند",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/articles`,
  },

};

export default function ArticlesPage() {
  return (
    <>
      <ArticlesListContainer count={0} ispage={true} />
    </>
  );
}
