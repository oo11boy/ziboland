// app/admindashboard/brands/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Brand } from "@/types/types";
import { API } from "@/lib/MainRoutes";

const BrandsPage = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/brands`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch brands");
        return res.json();
      })
      .then((data: Brand[]) => {
        setBrands(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching brands:", err);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("آیا مطمئن هستید؟")) {
      try {
        const res = await fetch(`${API}/brands/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete brand");
        setBrands(brands.filter((b) => b.id !== id));
      } catch (err) {
        console.error("Error deleting brand:", err);
        alert("خطا در حذف برند");
      }
    }
  };

  if (loading) return <div className="text-center py-8">در حال بارگذاری...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          برندها
        </h1>
        <Link href="/admindashboard/brands/add">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            <Plus className="mr-2 h-4 w-4" /> افزودن برند
          </Button>
        </Link>
      </div>

      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle>لیست برندها</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base table-auto border-collapse">
              <thead className="hidden md:table-header-group">
                <tr className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  <th className="px-4 py-2 text-right">عنوان</th>
                  <th className="px-4 py-2 text-right">تصویر</th>
                  <th className="px-4 py-2 text-right">لینک</th>
                  <th className="px-4 py-2 text-right">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {brands.map((brand) => (
                  <tr
                    key={brand.id}
                    className="block md:table-row border-b md:border-0 border-gray-200 dark:border-gray-700 mb-4 md:mb-0 rounded-lg md:rounded-none shadow-sm md:shadow-none bg-gray-50 md:bg-transparent dark:bg-gray-900 md:dark:bg-transparent"
                  >
                    <td className="px-4 py-2 text-right block md:table-cell">
                      <span className="font-medium md:hidden">عنوان: </span>
                      {brand.title}
                    </td>
                    <td className="px-4 py-2 text-right block md:table-cell">
                      <span className="font-medium md:hidden">تصویر: </span>
                      <img src={brand.img} alt={brand.title} className="w-10 h-10 object-cover inline-block" />
                    </td>
                    <td className="px-4 py-2 text-right block md:table-cell">
                      <span className="font-medium md:hidden">لینک: </span>
                      {brand.link}
                    </td>
                    <td className="px-4 py-2 block md:table-cell">
                      <div className="flex space-x-2 space-x-reverse">
                        <Link href={`/admindashboard/brands/${brand.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(brand.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

export default BrandsPage;