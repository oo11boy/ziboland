import { Metadata } from "next";
import ArticlePage from "@/Components/Articles/ArticlePage/ArticlePage";
import { API } from "@/lib/MainRoutes";

// تابع دریافت مقاله
async function getArticle(slug: string) {
  const res = await fetch(`${API}/articles/${slug}`, { cache: "no-store" });
  if (!res.ok) throw new Error("خطا در دریافت مقاله");
  return res.json();
}

// نوع پارامتر صفحه — params به عنوان Promise تعریف می‌شود
interface PageProps {
  params: Promise<{ slug: string }>;
}

// تابع متادیتای داینامیک
export async function generateMetadata(
  { params }: PageProps,
): Promise<Metadata> {
  const { slug } = await params;  // await کردن params
  let article;

  try {
    article = await getArticle(slug);
  } catch (error) {
    return {
      title: "مقاله یافت نشد",
      description: "متاسفانه مقاله مورد نظر شما پیدا نشد." + error,
    };
  }

  // باقی کد مثل قبل
  const title = article.title || "مقاله";
  const description =
    article.content?.replace(/<[^>]+>/g, "").slice(0, 150) ||
    "مقاله‌ای از سایت ما درباره موضوعات جذاب و آموزشی.";
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/articles/${article.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
  };
}

// صفحه جزئیات مقاله
export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;  // await کردن params
  const article = await getArticle(slug);

  return (
    <ArticlePage
      title={article.title}
      author={article.author || "مدیریت"}
      date={new Date(article.created_at).toLocaleDateString("fa-IR")}
      avatar="https://www.w3schools.com/howto/img_avatar.png"
      coverImage={article.image || "https://picsum.photos/1200/600"}
      shareLink={`${process.env.NEXT_PUBLIC_SITE_URL}/articles/${article.slug}`}
      content={article.content}
    />
  );
}
