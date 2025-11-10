"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Plus, Edit, Trash2, View, Search } from "lucide-react";
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
      <div className="flex justify-around">
        <Button
          variant="outline"
          onClick={onCancel}
          className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          لغو
        </Button>
        <Button
          variant="destructive"
          onClick={onForceDelete}
          className="bg-red-500 hover:bg-red-600 text-white"
        >
          حذف با سفارش‌ها
        </Button>
      </div>
    </div>
  </div>
);

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
    const filtered = products.filter(
      (product) =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.brandDetails?.title &&
          product.brandDetails.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [products, searchTerm]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API}/products`);
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
  // حذف واقعی
const handleDelete = async (id: number, force = false) => {
  console.log("[DELETE] Product ID:", id, "Force:", force);

  try {
    const res = await fetch(`${API}/products/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ force }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "خطا در حذف محصول");
    }

    setProducts(prev => prev.filter(p => p.id !== id));
    setFilteredProducts(prev => prev.filter(p => p.id !== id));
    setDeleteDialog({ visible: false, product: null });
    toast.success("محصول با موفقیت حذف شد");
  } catch (err: any) {
    toast.error(err.message || "خطا در حذف محصول");
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
      {deleteDialog.visible && deleteDialog.product && (
        <DeleteDialog
          productTitle={deleteDialog.product.title}
          onCancel={() => setDeleteDialog({ visible: false, product: null })}
          onForceDelete={() => handleDelete(deleteDialog.product!.id, true)}
        />
      )}

      <div className="flex justify-between items-center flex-wrap gap-2 mb-6">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          محصولات
        </h1>
        <Link href="/admindashboard/products/add">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            <Plus className="mr-2 h-4 w-4" /> افزودن محصول
          </Button>
        </Link>
      </div>

      {/* جستجو */}
      <div className="relative mb-6">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          placeholder="جستجو بر اساس نام محصول، برند یا دسته‌بندی..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
            لیست محصولات
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              هیچ محصولی یافت نشد
            </div>
          ) : (
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
                  {filteredProducts.map((product) => (
                    <tr
                      key={product.id}
                      className="block md:table-row border-b md:border-0 border-gray-200 dark:border-gray-700 mb-4 md:mb-0 rounded-lg md:rounded-none shadow-sm md:shadow-none bg-gray-50 md:bg-transparent dark:bg-gray-900 md:dark:bg-transparent transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
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
                            <Button
                              variant="outline"
                              size="sm"
                              title="ویرایش محصول"
                              className="hover:bg-blue-50 dark:hover:bg-blue-900"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(product)}
                            title="حذف محصول"
                            className="hover:bg-red-50 dark:hover:bg-red-900"
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
                              title="مشاهده محصول"
                              className="hover:bg-blue-50 dark:hover:bg-blue-900"
                            >
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductsPage;