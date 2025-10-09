"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Plus, Edit, Trash2, View, Search } from "lucide-react";
import { toast } from "react-toastify";
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
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    // فیلتر بر اساس جستجو
    const filtered = articles.filter(
      (article) =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (article.author && article.author.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredArticles(filtered);
  }, [articles, searchTerm]);

  const fetchArticles = async () => {
    try {
      const res = await fetch(`${API}/articles`);
      if (!res.ok) throw new Error("خطا در دریافت مقالات");
      const data = await res.json();
      setArticles(data);
      setFilteredArticles(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching articles:", err);
      toast.error("خطا در دریافت مقالات");
      setLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (confirm("آیا مطمئن هستید؟")) {
      try {
        const res = await fetch(`${API}/articles/${slug}`, { method: "DELETE" });
        if (!res.ok) throw new Error("خطا در حذف مقاله");
        setArticles(articles.filter((a) => a.slug !== slug));
        setFilteredArticles(filteredArticles.filter((a) => a.slug !== slug));
        toast.success("مقاله با موفقیت حذف شد");
      } catch (err) {
        toast.error("خطا در حذف مقاله");
        console.error(err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center flex-wrap gap-2 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">مقالات</h1>
        <Link href="/admindashboard/articles/add">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            <Plus className="mr-2 h-4 w-4" /> افزودن مقاله
          </Button>
        </Link>
      </div>

      {/* جستجو */}
      <div className="relative mb-6">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          placeholder="جستجو بر اساس عنوان یا نویسنده..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
            لیست مقالات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredArticles.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              هیچ مقاله‌ای یافت نشد
            </div>
          ) : (
            <table className="w-full text-sm md:text-base table-auto">
              <thead className="hidden md:table-header-group">
                <tr className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  <th className="px-4 py-2 text-right">تیتر</th>
                  <th className="px-4 py-2 text-right">نویسنده</th>
                  <th className="px-4 py-2 text-right">تاریخ</th>
                  <th className="px-4 py-2 text-right">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map((article) => (
                  <tr
                    key={article.slug}
                    className="block md:table-row border-b md:border-0 border-gray-200 dark:border-gray-700 mb-4 md:mb-0 rounded-lg md:rounded-none shadow-sm md:shadow-none bg-gray-50 md:bg-transparent dark:bg-gray-900 md:dark:bg-transparent transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <td className="px-4 py-2 text-right block md:table-cell">
                      <span className="font-medium md:hidden">تیتر: </span>
                      {article.title}
                    </td>
                    <td className="px-4 py-2 text-right block md:table-cell">
                      <span className="font-medium md:hidden">نویسنده: </span>
                      {article.author || "نامشخص"}
                    </td>
                    <td className="px-4 py-2 text-right block md:table-cell">
                      <span className="font-medium md:hidden">تاریخ: </span>
                      {new Date(article.created_at).toLocaleDateString("fa-IR")}
                    </td>
                    <td className="px-4 py-2 block md:table-cell">
                      <div className="flex space-x-2 space-x-reverse">
                        <Link href={`/admindashboard/articles/${article.slug}/edit`}>
                          <Button variant="outline" size="sm" title="ویرایش مقاله" className="hover:bg-blue-50 dark:hover:bg-blue-900">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(article.slug)}
                          title="حذف مقاله"
                          className="hover:bg-red-50 dark:hover:bg-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <a
                          href={`/articles/${article.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm" title="مشاهده مقاله" className="hover:bg-blue-50 dark:hover:bg-blue-900">
                            <View className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}