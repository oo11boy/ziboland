import ArticlePage from "@/Components/Articles/ArticlePage/ArticlePage";
import FooterContainer from "@/Components/Footer/FooterContainer";
import MobileBottomNavigation from "@/Components/Header/MobileHeader/MobileBottomNavigation";
import MoblieHeaderTopTab from "@/Components/Header/MobileHeader/MoblieHeaderTopTab";
import WideHeaderContainer from "@/Components/Header/WideHeader/WideHeaderContainer";
import { API } from "@/lib/MainRoutes";

async function getArticle(slug: string) {
  const res = await fetch(`${API}/articles/${slug}`, { cache: "no-store" });
  if (!res.ok) throw new Error("خطا در دریافت مقاله");
  return res.json();
}

export default async function ArticleDetailPage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug);

  return (
    <>
      <WideHeaderContainer />
      <MoblieHeaderTopTab />

      <ArticlePage
        title={article.title}
        author={article.author || "مدیریت"}
        date={new Date(article.created_at).toLocaleDateString("fa-IR")}
        avatar="https://www.w3schools.com/howto/img_avatar.png"
        coverImage={article.image || "https://picsum.photos/1200/600"}
        shareLink={`${process.env.NEXT_PUBLIC_SITE_URL}/articles/${article.slug}`}
        content={article.content}
      />

      <FooterContainer />
      <MobileBottomNavigation />
    </>
  );
}
