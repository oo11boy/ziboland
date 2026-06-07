"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Plus, Edit, Trash2, View, Search, Copy } from "lucide-react";
import { toast } from "react-toastify";
import { Product } from "@/types/types";
import { API } from "@/lib/MainRoutes";

// دیالوگ حذف محصول
const DeleteDialog = ({
  productTitle,
  onCancel,
  onForceDelete,
}: {
  productTitle: string;
  onCancel: () => void;
  onForceDelete: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-96 p-6 text-center">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">
        حذف محصول
      </h2>
      <p className="mb-6 text-gray-600 dark:text-gray-300">
        محصول "{productTitle}" سفارش دارد. آیا می‌خواهید با سفارش‌ها حذف شود؟
      </p>
      <div className="flex justify-around gap-4">
        <Button variant="outline" onClick={onCancel} className="px-6">
          لغو
        </Button>
        <Button variant="destructive" onClick={onForceDelete} className="px-6">
          حذف با سفارش‌ها
        </Button>
      </div>
    </div>
  </div>
);

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success("نام محصول کپی شد", { autoClose: 2000 });
};

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialog, setDeleteDialog] = useState<{
    visible: boolean;
    product: Product | null;
  }>({ visible: false, product: null });

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = products.filter(
      (product) =>
        product.title.toLowerCase().includes(lowerSearch) ||
        (product.brandDetails?.title &&
          product.brandDetails.title.toLowerCase().includes(lowerSearch)) ||
        product.category.toLowerCase().includes(lowerSearch),
    );
    setFilteredProducts(filtered);
  }, [products, searchTerm]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`../api/products`);
      if (!res.ok) throw new Error("خطا در دریافت محصولات");
      const data: Product[] = await res.json();
      setProducts(data);
      setFilteredProducts(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching products:", err);
      toast.error("خطا در دریافت محصولات");
      setLoading(false);
    }
  };

  // کلیک روی دکمه حذف
  const handleDeleteClick = (product: Product) => {
    setDeleteDialog({ visible: true, product });
  };

  // حذف واقعی (با یا بدون force)
  const handleDelete = async (id: number, force = false) => {
    try {
      const res = await fetch(`../api/products/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "خطا در حذف محصول");
      }

      setProducts((prev) => prev.filter((p) => p.id !== id));
      setFilteredProducts((prev) => prev.filter((p) => p.id !== id));
      setDeleteDialog({ visible: false, product: null });
      toast.success("محصول با موفقیت حذف شد");
    } catch (err: any) {
      toast.error(err.message || "خطا در حذف محصول");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 yekan">
      {/* دیالوگ حذف */}
      {deleteDialog.visible && deleteDialog.product && (
        <DeleteDialog
          productTitle={deleteDialog.product.title}
          onCancel={() => setDeleteDialog({ visible: false, product: null })}
          onForceDelete={() => handleDelete(deleteDialog.product!.id, true)}
        />
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          مدیریت محصولات ({filteredProducts.length})
        </h1>
        <Link href="/admindashboard/products/add">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <Plus className="ml-2 h-5 w-5" /> افزودن محصول جدید
          </Button>
        </Link>
      </div>

      {/* جستجو */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          placeholder="جستجو در نام محصول، برند یا دسته‌بندی..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4 py-6 text-lg border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <Card className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardTitle className="text-2xl">لیست محصولات</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400 text-xl">
              هیچ محصولی یافت نشد
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm md:text-base">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr className="text-gray-700 dark:text-gray-300">
                    <th className="px-6 py-4 text-right">نام محصول</th>
                    <th className="px-6 py-4 text-right">برند</th>
                    <th className="px-6 py-4 text-right">دسته‌بندی</th>
                    <th className="px-6 py-4 text-right">تعداد واریانت</th>
                    <th className="px-6 py-4 text-right">وضعیت موجودی</th>
                    <th className="px-6 py-4 text-right">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => {
                    const totalStock = product.variants.reduce(
                      (sum, v) => sum + v.stock_quantity,
                      0,
                    );
                    const hasStock = totalStock > 0;

                    return (
                      <tr
                        key={product.id}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-start gap-2">
                            <button
                              onClick={() => copyToClipboard(product.title)}
                              className="text-gray-500 hover:text-purple-600 transition"
                              title="کپی نام محصول"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            <span className="font-medium text-right">
                              {product.title}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          {product.brandDetails?.title || "-"}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {product.motherCategoryName}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-block px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 text-sm">
                            {product.variants.length} واریانت
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm ${
                              hasStock
                                ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                                : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                            }`}
                          >
                            {hasStock ? "موجود" : "ناموجود"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-3">
                            <Link
                              href={`/admindashboard/products/${product.id}/edit`}
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="hover:bg-blue-50 dark:hover:bg-blue-900"
                                title="ویرایش"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </Link>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(product)}
                              className="hover:bg-red-50 dark:hover:bg-red-900"
                              title="حذف"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>

                            <a
                              href={`/products/${product.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="hover:bg-green-50 dark:hover:bg-green-900"
                                title="مشاهده در سایت"
                              >
                                <View className="h-4 w-4" />
                              </Button>
                            </a>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductsPage;
