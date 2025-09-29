import ArticlePage from "@/Components/Articles/ArticlePage/ArticlePage";
import { API } from "@/lib/MainRoutes";

// تابع دریافت مقاله از API
async function getArticle(slug: string) {
  const res = await fetch(`${API}/articles/${slug}`, { cache: "no-store" });
  if (!res.ok) throw new Error("خطا در دریافت مقاله");
  return res.json();
}

// ✅ اصلاح نوع پارامترهای مسیر برای Next.js 15
interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticleDetailPage({ params }: PageProps) {
  // دریافت slug به صورت آسنکرون
  const { slug } = await params;
  const article = await getArticle(slug);

  return (
    <>

      <ArticlePage
        title={article.title}
        author={article.author || "مدیریت"}
        date={new Date(article.created_at).toLocaleDateString("fa-IR")}
        avatar="https://www.w3schools.com/howto/img_avatar.png"
        coverImage={article.image || "https://picsum.photos/1200/600"}
        shareLink={`${process.env.NEXT_PUBLIC_SITE_URL}/articles/${article.slug}`}
        content={article.content}
      />


    </>
  );
}
