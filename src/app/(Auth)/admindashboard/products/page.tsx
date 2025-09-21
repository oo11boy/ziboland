"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Plus, Edit, Trash2, View } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { Product } from "@/types/types";
import { API } from "@/lib/MainRoutes";

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/products`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch products");
        return res.json();
      })
      .then((data: Product[]) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("آیا مطمئن هستید؟")) {
      try {
        const res = await fetch(`${API}/products/${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete product");
        setProducts(products.filter((p) => p.id !== id));
      } catch (err) {
        console.error("Error deleting product:", err);
        alert("خطا در حذف محصول");
      }
    }
  };

  if (loading) return <div className="text-center py-8">در حال بارگذاری...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
          محصولات
        </h1>
        <Link href="/admindashboard/products/add">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            <Plus className="mr-2 h-4 w-4" /> افزودن محصول
          </Button>
        </Link>
      </div>

      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle>لیست محصولات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base table-auto border-collapse">
              <thead className="hidden md:table-header-group">
                <tr className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  <th className="px-4 py-2 text-right">نام</th>
                  <th className="px-4 py-2 text-right">برند</th>
                  <th className="px-4 py-2 text-right">قیمت تک</th>
                  <th className="px-4 py-2 text-right">قیمت عمده</th>
                  <th className="px-4 py-2 text-right">دسته‌بندی</th>
                  <th className="px-4 py-2 text-right">وضعیت</th>
                  <th className="px-4 py-2 text-right">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="block md:table-row border-b md:border-0 border-gray-200 dark:border-gray-700 mb-4 md:mb-0 rounded-lg md:rounded-none shadow-sm md:shadow-none bg-gray-50 md:bg-transparent dark:bg-gray-900 md:dark:bg-transparent"
                  >
                    <td className="px-4 py-2 text-right block md:table-cell">
                      <span className="font-medium md:hidden">نام: </span>
                      {product.title.length > 20
                        ? product.title.slice(0, 20) + "..."
                        : product.title}
                    </td>
                    <td className="px-4 py-2 text-right block md:table-cell">
                      <span className="font-medium md:hidden">برند: </span>
                      {product.brandDetails?.title || "نامشخص"}
                    </td>
                    <td className="px-4 py-2 text-right block md:table-cell">
                      <span className="font-medium md:hidden">قیمت تک: </span>
                      {product.discountedPrice} تومان
                    </td>
                    <td className="px-4 py-2 text-right block md:table-cell">
                      <span className="font-medium md:hidden">قیمت عمده: </span>
                      {product.discountwholesalePrice} تومان
                    </td>
                    <td className="px-4 py-2 text-right block md:table-cell">
                      <span className="font-medium md:hidden">دسته‌بندی: </span>
                      {product.category}
                    </td>
                    <td className="px-4 py-2 text-right block md:table-cell">
                      <span className="font-medium md:hidden">وضعیت: </span>
                      {product.inStock ? "موجود" : "ناموجود"}
                    </td>
                    <td className="px-4 py-2 block md:table-cell">
                      <div className="flex space-x-2 space-x-reverse">
                        <Link href={`/admindashboard/products/${product.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <a
                          href={`/products/${product.id}`}
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

export default ProductsPage;