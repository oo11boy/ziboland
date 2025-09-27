"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Plus, Edit, Trash2, View } from "lucide-react";
import { API } from "@/lib/MainRoutes";

interface Article {
  id: number;
  title: string;
  slug: string;
  image?: string;
  author?: string;
  created_at: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/articles`)
      .then(res => res.json())
      .then(data => {
        setArticles(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching articles:", err);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (slug: string) => {
    if (confirm("آیا مطمئن هستید؟")) {
      try {
        const res = await fetch(`${API}/articles/${slug}`, { method: "DELETE" });
        if (!res.ok) throw new Error("Failed to delete");
        setArticles(articles.filter(a => a.slug !== slug));
      } catch (err) {
        alert("خطا در حذف مقاله");
        console.log(err)
      }
    }
  };

  if (loading) return <div className="text-center py-8">در حال بارگذاری...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">مقالات</h1>
        <Link href="/admindashboard/articles/add">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            <Plus className="mr-2 h-4 w-4" /> افزودن مقاله
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>لیست مقالات</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full text-sm md:text-base table-auto">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700">
                <th className="px-4 py-2 text-right">تیتر</th>
                <th className="px-4 py-2 text-right">نویسنده</th>
                <th className="px-4 py-2 text-right">تاریخ</th>
                <th className="px-4 py-2 text-right">عملیات</th>
              </tr>
            </thead>
            <tbody>
              {articles.map(article => (
                <tr key={article.slug} className="border-b dark:border-gray-700">
                  <td className="px-4 py-2">{article.title}</td>
                  <td className="px-4 py-2">{article.author || "نامشخص"}</td>
                  <td className="px-4 py-2">{new Date(article.created_at).toLocaleDateString("fa-IR")}</td>
                  <td className="px-4 py-2">
                    <div className="flex space-x-2 space-x-reverse">
                      <Link href={`/admindashboard/articles/${article.slug}/edit`}>
                        <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(article.slug)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <a href={`/articles/${article.slug}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm"><View className="h-4 w-4" /></Button>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
