"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { toast } from "react-toastify";
import { Brand } from "@/types/types";
import { API } from "@/lib/MainRoutes";

const BrandsPage = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    // فیلتر بر اساس جستجو
    const filtered = brands.filter(
      (brand) =>
        brand.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        brand.link.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredBrands(filtered);
  }, [brands, searchTerm]);

  const fetchBrands = async () => {
    try {
      const res = await fetch(`${API}/brands`);
      if (!res.ok) throw new Error("خطا در دریافت برندها");
      const data: Brand[] = await res.json();
      setBrands(data);
      setFilteredBrands(data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching brands:", err);
      toast.error("خطا در دریافت برندها");
      setLoading(false);
    }
  };

const handleDelete = async (id: number) => {
  if (!confirm("آیا مطمئن هستید که می‌خواهید این برند را حذف کنید؟")) return;

  try {
    const res = await fetch(`${API}/brands/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const errorData = await res.json();
      // نمایش پیام دقیق با نام محصولات
      alert(errorData.details || errorData.error || "خطا در حذف برند");
      return;
    }

    setBrands(brands.filter((b) => b.id !== id));
    setFilteredBrands(filteredBrands.filter((b) => b.id !== id));
    toast.success("برند با موفقیت حذف شد");
  } catch (err) {
    console.error("Error deleting brand:", err);
    toast.error("خطا در ارتباط با سرور");
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
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          برندها
        </h1>
        <Link href="/admindashboard/brands/add">
          <Button className="bg-blue-500 hover:bg-blue-600 text-white">
            <Plus className="mr-2 h-4 w-4" /> افزودن برند
          </Button>
        </Link>
      </div>

      {/* جستجو */}
      <div className="relative mb-6">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          placeholder="جستجو بر اساس عنوان یا لینک..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
            لیست برندها
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredBrands.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              هیچ برندی یافت نشد
            </div>
          ) : (
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
                  {filteredBrands.map((brand) => (
                    <tr
                      key={brand.id}
                      className="block md:table-row border-b md:border-0 border-gray-200 dark:border-gray-700 mb-4 md:mb-0 rounded-lg md:rounded-none shadow-sm md:shadow-none bg-gray-50 md:bg-transparent dark:bg-gray-900 md:dark:bg-transparent transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <td className="px-4 py-2 text-right block md:table-cell">
                        <span className="font-medium md:hidden">عنوان: </span>
                        {brand.title}
                      </td>
                      <td className="px-4 py-2 text-right block md:table-cell">
                        <span className="font-medium md:hidden">تصویر: </span>
                        <img src={brand.img} alt={brand.title} className="w-10 h-10 object-cover inline-block rounded" />
                      </td>
                      <td className="px-4 py-2 text-right block md:table-cell">
                        <span className="font-medium md:hidden">لینک: </span>
                        {brand.link}
                      </td>
                      <td className="px-4 py-2 block md:table-cell">
                        <div className="flex space-x-2 space-x-reverse">
                          <Link href={`/admindashboard/brands/${brand.id}/edit`}>
                            <Button variant="outline" size="sm" title="ویرایش برند" className="hover:bg-blue-50 dark:hover:bg-blue-900">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(brand.id)}
                            title="حذف برند"
                            className="hover:bg-red-50 dark:hover:bg-red-900"
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default BrandsPage;