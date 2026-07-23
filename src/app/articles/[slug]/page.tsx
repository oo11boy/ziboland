// page.tsx
import { Metadata } from "next";
import ArticlePage from "@/Components/Articles/ArticlePage/ArticlePage";
import { API } from "@/lib/MainRoutes";

// تابع دریافت مقاله با آدرس کامل
async function getArticle(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/articles/${slug}`, { 
    cache: "no-store",
    next: { revalidate: 0 }
  });
  
  if (!res.ok) {
    throw new Error(`خطا در دریافت مقاله: ${res.status}`);
  }
  return res.json();
}

// نوع پارامتر صفحه
interface PageProps {
  params: Promise<{ slug: string }>;
}

// تابع متادیتای داینامیک
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  let article;

  try {
    article = await getArticle(slug);
  } catch (error) {
    return {
      title: "مقاله یافت نشد",
      description: "متاسفانه مقاله مورد نظر شما پیدا نشد.",
    };
  }

  const title = article.title || "مقاله";
  const description =
    article.content?.replace(/<[^>]+>/g, "").slice(0, 150) ||
    "مقاله‌ای از سایت ما درباره موضوعات جذاب و آموزشی.";
  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/articles/${article.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      images: article.image ? [{ url: article.image }] : undefined,
    },
  };
}

// صفحه جزئیات مقاله
export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticle(slug);

  return (
    <ArticlePage
      title={article.title}
      author={article.author || "مدیریت"}
      date={new Date(article.created_at).toLocaleDateString("fa-IR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}
      avatar={article.author_avatar || "https://www.w3schools.com/howto/img_avatar.png"}
      coverImage={article.image || "https://picsum.photos/1200/600"}
      shareLink={`${process.env.NEXT_PUBLIC_SITE_URL}/articles/${article.slug}`}
      content={article.content}
      readingTime={article.reading_time || Math.ceil(article.content?.split(/\s+/).length / 200) || 3}
      tags={article.tags || []}
    />
  );
}