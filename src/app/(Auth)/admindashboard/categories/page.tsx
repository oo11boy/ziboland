"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Plus, Edit, Trash2, View } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Categoryapi } from "@/types/types";
import { API } from "@/lib/MainRoutes";

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Categoryapi[]>([]);
  const [loading, setLoading] = useState(true);

useEffect(() => {
  fetch(`${API}/categories`)
    .then((res) => {
      if (res.status >= 400) {
        throw new Error("خطا در دریافت دسته‌بندی‌ها");
      }
      return res.json();
    })
    .then((data: Categoryapi[]) => {
      setCategories(data);
      setLoading(false);
    })
    .catch((err) => {
      console.error("Error fetching categories:", err);
      setCategories([]); // مهم: آرایه خالی بگذارید
      setLoading(false);
    });
}, []);

const handleDelete = async (id: number) => {
  if (!confirm("آیا مطمئن هستید که می‌خواهید این دسته‌بندی را حذف کنید؟")) return;

  try {
    const res = await fetch(`${API}/categories/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const errorData = await res.json();
      // نمایش پیام دقیق
      alert(errorData.details || errorData.error || "خطا در حذف دسته‌بندی");
      return;
    }

    setCategories(categories.filter((c) => c.id !== id));
    alert("دسته‌بندی با موفقیت حذف شد");
  } catch (err) {
    console.error("Error deleting category:", err);
    alert("خطا در ارتباط با سرور");
  }
};

  if (loading) return <div className="text-center py-8">در حال بارگذاری...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          دسته‌بندی‌ها
        </h1>
        <Link href="/admindashboard/categories/add">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            <Plus className="mr-2 h-4 w-4" /> افزودن دسته‌بندی
          </Button>
        </Link>
      </div>

      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle>لیست دسته‌بندی‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base table-auto border-collapse">
              <thead className="hidden md:table-header-group">
                <tr className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  <th className="px-4 py-2 text-right">نام</th>
                  <th className="px-4 py-2 text-right">لینک</th>
                  <th className="px-4 py-2 text-right">دسته اصلی</th>
                  <th className="px-4 py-2 text-right">تعداد زیرمجموعه‌ها</th>
                  <th className="px-4 py-2 text-right">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    className="block md:table-row border-b md:border-0 border-gray-200 dark:border-gray-700 mb-4 md:mb-0 rounded-lg md:rounded-none shadow-sm md:shadow-none bg-gray-50 md:bg-transparent dark:bg-gray-900 md:dark:bg-transparent"
                  >
                    <td className="px-4 py-2 text-right block md:table-cell">
                      <span className="font-medium md:hidden">نام: </span>
                      {category.name.length > 20
                        ? category.name.slice(0, 20) + "..."
                        : category.name}
                    </td>
                    <td className="px-4 py-2 text-right block md:table-cell">
                      <span className="font-medium md:hidden">لینک: </span>
                      {category.link}
                    </td>
                    <td className="px-4 py-2 text-right block md:table-cell">
                      <span className="font-medium md:hidden">دسته اصلی: </span>
                      {category.mothercat ? "بله" : "خیر"}
                    </td>
                    <td className="px-4 py-2 text-right block md:table-cell">
                      <span className="font-medium md:hidden">زیرمجموعه‌ها: </span>
                      {category.subcat.length}
                    </td>
                    <td className="px-4 py-2 block md:table-cell">
                      <div className="flex space-x-2 space-x-reverse">
                        <Link href={`/admindashboard/categories/${category.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(category.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <a
                          href={category.link}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="sm">
                            <View className="h-4 w-4" />
                          </Button>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoriesPage;