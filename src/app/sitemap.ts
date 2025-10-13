import { MetadataRoute } from "next";
import { API } from "@/lib/MainRoutes";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://localhost:3000";

  // 🟢 دریافت لیست مقالات از API
  const articlesRes = await fetch(`${API}/articles`, { cache: "no-store" });
  const articles = articlesRes.ok ? await articlesRes.json() : [];

  // 🟢 دریافت لیست محصولات از API
  const productsRes = await fetch(`${API}/products`, { cache: "no-store" });
  const products = productsRes.ok ? await productsRes.json() : [];

  // 🏠 صفحه اصلی
  const urls: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // 📰 اضافه کردن مقالات
  articles.forEach((article: any) => {
    urls.push({
      url: `${baseUrl}/articles/${article.slug}`,
      lastModified: new Date(article.updated_at || article.created_at || Date.now()),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  });

  // 🛍️ اضافه کردن محصولات
  products.forEach((product: any) => {
    urls.push({
      url: `${baseUrl}/products/${product.id}`,
      lastModified: new Date(product.updated_at || product.created_at || Date.now()),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  });

  return urls;
}
