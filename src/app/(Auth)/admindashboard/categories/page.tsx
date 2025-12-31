"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Plus, Edit, Trash2, View, Loader2 } from "lucide-react";
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
        setCategories([]); // آرایه خالی برای جلوگیری از خطا در رندر
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
        // نمایش پیام دقیق از سرور (مثل لیست محصولات متعارض)
        alert(errorData.details || errorData.error || "خطا در حذف دسته‌بندی");
        return;
      }

      // حذف موفق → بروزرسانی لیست
      setCategories(categories.filter((c) => c.id !== id));
      alert("دسته‌بندی با موفقیت حذف شد");
    } catch (err) {
      console.error("Error deleting category:", err);
      alert("خطا در ارتباط با سرور");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 yekan text-center py-16">
        <Loader2 className="h-10 w-10 animate-spin mx-auto text-blue-600" />
        <p className="mt-4 text-lg">در حال بارگذاری دسته‌بندی‌ها...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 yekan space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          مدیریت دسته‌بندی‌ها
        </h1>
        <Link href="/admindashboard/categories/add">
          <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center">
            <Plus className="ml-2 h-5 w-5" />
            افزودن دسته‌بندی جدید
          </Button>
        </Link>
      </div>

      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader className="border-b">
          <CardTitle className="text-xl">لیست دسته‌بندی‌ها ({categories.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {categories.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              هیچ دسته‌بندی‌ای یافت نشد.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm md:text-base table-auto border-collapse">
                <thead className="hidden md:table-header-group bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-4 text-right font-medium text-gray-700 dark:text-gray-300">
                      نام دسته‌بندی
                    </th>
                    <th className="px-6 py-4 text-center font-medium text-gray-700 dark:text-gray-300">
                      تصویر
                    </th>
                    <th className="px-6 py-4 text-center font-medium text-gray-700 dark:text-gray-300">
                      دسته اصلی
                    </th>
                    <th className="px-6 py-4 text-center font-medium text-gray-700 dark:text-gray-300">
                      تعداد زیرمجموعه‌ها
                    </th>
                    <th className="px-6 py-4 text-center font-medium text-gray-700 dark:text-gray-300">
                      عملیات
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((category) => (
                    <tr
                      key={category.id}
                      className="block md:table-row border-b md:border-0 border-gray-200 dark:border-gray-700 mb-6 md:mb-0 rounded-lg md:rounded-none shadow-md md:shadow-none bg-white md:bg-transparent dark:bg-gray-900 md:dark:bg-transparent"
                    >
                      <td className="px-6 py-4 text-right block md:table-cell">
                        <span className="font-semibold md:hidden">نام: </span>
                        {category.name.length > 30
                          ? category.name.slice(0, 30) + "..."
                          : category.name}
                      </td>
                      <td className="px-6 py-4 text-center block md:table-cell">
                        <span className="font-semibold md:hidden">تصویر: </span>
                        {category.link ? (
                          <img
                            src={category.link}
                            alt={category.name}
                            className="w-20 h-20 object-cover rounded-lg border shadow mx-auto"
                            onError={(e) => {
                              e.currentTarget.src = "/placeholder-image.png"; // تصویر پیش‌فرض در صورت خطا
                            }}
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mx-auto">
                            <span className="text-xs text-gray-500">بدون تصویر</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center block md:table-cell">
                        <span className="font-semibold md:hidden">دسته اصلی: </span>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            category.mothercat
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                          }`}
                        >
                          {category.mothercat ? "بله" : "خیر"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center block md:table-cell">
                        <span className="font-semibold md:hidden">زیرمجموعه‌ها: </span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                          {category.subcat.length}
                        </span>
                      </td>
                      <td className="px-6 py-4 block md:table-cell text-center">
                        <div className="flex justify-center gap-2 flex-wrap">
                          <Link href={`/admindashboard/categories/${category.id}/edit`}>
                            <Button variant="outline" size="sm" className="border-blue-500 text-blue-600 hover:bg-blue-50">
                              <Edit className="h-4 w-4" />
                              <span className="hidden md:inline ml-1">ویرایش</span>
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-red-500 text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(category.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="hidden md:inline ml-1">حذف</span>
                          </Button>
                          {category.link && (
                            <a href={category.link} target="_blank" rel="noopener noreferrer">
                              <Button variant="outline" size="sm" className="border-green-500 text-green-600 hover:bg-green-50">
                                <View className="h-4 w-4" />
                                <span className="hidden md:inline ml-1">مشاهده</span>
                              </Button>
                            </a>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoriesPage;