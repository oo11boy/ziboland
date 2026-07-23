"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Plus, Edit, Trash2, Search, ExternalLink, X, CheckCircle2, AlertCircle, Layers, Package, ShoppingBag } from "lucide-react";
import { toast } from "react-toastify";
import { Product } from "@/types/types";

// --- دیالوگ حذف محصول ---
const DeleteDialog = ({ productTitle, onCancel, onForceDelete }: { productTitle: string; onCancel: () => void; onForceDelete: () => void; }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Trash2 className="w-8 h-8 text-red-600" />
      </div>
      <h2 className="text-xl font-bold mb-3 text-gray-800">حذف محصول</h2>
      <p className="mb-6 text-gray-600 text-sm leading-relaxed">
        آیا از حذف محصول <span className="font-bold text-gray-800">"{productTitle}"</span> مطمئن هستید؟
        <br />
        <span className="text-red-500 text-xs">⚠️ این عمل غیرقابل بازگشت است و تمام اطلاعات مرتبط حذف می‌شود.</span>
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <Button variant="outline" onClick={onCancel} className="px-6 rounded-xl order-2 sm:order-1">
          لغو
        </Button>
        <Button variant="destructive" onClick={onForceDelete} className="px-6 rounded-xl order-1 sm:order-2">
          بله، حذف شود
        </Button>
      </div>
    </div>
  </div>
);

// --- مودال مشاهده سریع (Quick View) ---
const QuickViewModal = ({ product, onClose }: { product: Product | null; onClose: () => void }) => {
  if (!product) return null;

  const totalStock = product.variants.reduce((acc, v) => acc + Number(v.stock_quantity || 0), 0);
  const availableVariants = product.variants.filter(v => Number(v.stock_quantity || 0) > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-800 line-clamp-1">{product.title}</h3>
            <p className="text-sm text-gray-500 mt-1">
              مجموع موجودی: <span className="font-bold text-gray-700">{totalStock}</span> عدد
            </p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
            <X size={22} />
          </button>
        </div>
        
        <div className="border-t border-gray-100 pt-4 mt-2">
          <h4 className="text-sm font-semibold text-gray-600 mb-3">وضعیت واریانت‌ها:</h4>
          <div className="space-y-2">
            {product.variants.map((v, i) => {
              const stock = Number(v.stock_quantity || 0);
              const isAvailable = stock > 0;
              return (
                <div 
                  key={i} 
                  className={`flex justify-between items-center p-3 rounded-xl border transition ${
                    isAvailable 
                      ? 'bg-green-50 border-green-200 hover:bg-green-100' 
                      : 'bg-red-50 border-red-200 hover:bg-red-100'
                  }`}
                >
                  <span className="font-medium text-gray-700 text-sm">
                    {v.color_persianName || v.color_englishName || 'بدون نام'}
                  </span>
                  <span className={`text-sm font-bold flex items-center gap-2 ${
                    isAvailable ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {isAvailable ? (
                      <>
                        <CheckCircle2 size={16} />
                        موجود <span className="text-xs font-normal">({stock} عدد)</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={16} />
                        ناموجود
                      </>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-gray-100 pt-4 mt-4 flex gap-3">
          <Link href={`/admindashboard/products/${product.id}/edit`} className="flex-1">
            <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white rounded-xl">
              <Edit size={18} className="ml-2" />
              ویرایش
            </Button>
          </Link>
          <Button onClick={onClose} variant="outline" className="flex-1 rounded-xl">
            بستن
          </Button>
        </div>
      </div>
    </div>
  );
};

// --- صفحه اصلی مدیریت محصولات ---
const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState<"all" | "inStock" | "outOfStock">("all");
  const [deleteDialog, setDeleteDialog] = useState<{ visible: boolean; product: Product | null }>({ visible: false, product: null });
  const [viewModalProduct, setViewModalProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/products`);
      if (!res.ok) throw new Error("خطا در دریافت اطلاعات");
      const data: Product[] = await res.json();
      setProducts(data);
    } catch (err) {
      toast.error("خطا در بارگذاری محصولات");
    } finally {
      setLoading(false);
    }
  };

  // تابع برای تعیین وضعیت موجودی محصول
  const getProductStockStatus = (product: Product) => {
    const totalStock = product.variants.reduce((acc, v) => acc + Number(v.stock_quantity || 0), 0);
    
    if (totalStock === 0) return "outOfStock";
    
    const hasOutOfStockVariant = product.variants.some(v => Number(v.stock_quantity || 0) === 0);
    if (hasOutOfStockVariant) return "partiallyOutOfStock";
    
    return "inStock";
  };

  const filteredProducts = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();

    return products.filter((p) => {
      const status = getProductStockStatus(p);
      
      const idMatch = String(p.id || "").includes(searchTerm);
      const titleMatch = (p.title || "").toLowerCase().includes(lowerSearch);
      const brandMatch = (p.brandDetails?.title || "").toLowerCase().includes(lowerSearch);
      const categoryMatch = (p.motherCategoryName || "").toLowerCase().includes(lowerSearch);
      
      const matchesSearch = idMatch || titleMatch || brandMatch || categoryMatch;
      
      if (filter === "inStock") return matchesSearch && status === "inStock";
      if (filter === "outOfStock") return matchesSearch && (status === "outOfStock" || status === "partiallyOutOfStock");
      return matchesSearch;
    });
  }, [products, searchTerm, filter]);

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("خطا در حذف");
      setProducts(prev => prev.filter(p => p.id !== id));
      setDeleteDialog({ visible: false, product: null });
      toast.success("محصول با موفقیت حذف شد");
    } catch (err) {
      toast.error("خطا در عملیات حذف");
    }
  };

  // تابع برای نمایش وضعیت موجودی
  const renderStockStatus = (product: Product) => {
    const status = getProductStockStatus(product);
    const totalStock = product.variants.reduce((acc, v) => acc + Number(v.stock_quantity || 0), 0);
    
    if (status === "inStock") {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
          <CheckCircle2 size={14} />
          موجود
          <span className="bg-green-200 px-1.5 py-0.5 rounded-full text-[10px]">{totalStock}</span>
        </span>
      );
    } else if (status === "partiallyOutOfStock") {
      const inStockCount = product.variants.filter(v => Number(v.stock_quantity || 0) > 0).length;
      const totalVariants = product.variants.length;
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200">
          <AlertCircle size={14} />
          نیاز به شارژ
          <span className="bg-orange-200 px-1.5 py-0.5 rounded-full text-[10px]">
            {inStockCount}/{totalVariants}
          </span>
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-red-700 border border-red-200">
          <AlertCircle size={14} />
          ناموجود
        </span>
      );
    }
  };

  // آمار محصولات
  const stats = useMemo(() => {
    const total = products.length;
    const inStock = products.filter(p => getProductStockStatus(p) === "inStock").length;
    const outOfStock = products.filter(p => getProductStockStatus(p) === "outOfStock").length;
    const partiallyOutOfStock = products.filter(p => getProductStockStatus(p) === "partiallyOutOfStock").length;
    return { total, inStock, outOfStock, partiallyOutOfStock };
  }, [products]);

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-600"></div>
        <p className="text-gray-500 text-sm">در حال بارگذاری محصولات...</p>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 max-w-7xl yekan">
      <QuickViewModal product={viewModalProduct} onClose={() => setViewModalProduct(null)} />
      {deleteDialog.visible && deleteDialog.product && (
        <DeleteDialog
          productTitle={deleteDialog.product.title}
          onCancel={() => setDeleteDialog({ visible: false, product: null })}
          onForceDelete={() => handleDelete(deleteDialog.product!.id)}
        />
      )}

      {/* هدر */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 text-purple-600" />
            مدیریت محصولات
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mt-1">
            {stats.total} محصول در سیستم | {stats.inStock} موجود | {stats.partiallyOutOfStock} نیاز به شارژ | {stats.outOfStock} ناموجود
          </p>
        </div>
        <Link href="/admindashboard/products/add" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-11 sm:h-12 px-4 sm:px-6 shadow-lg transition-all hover:scale-105">
            <Plus className="ml-2" size={18} /> افزودن محصول جدید
          </Button>
        </Link>
      </div>

      {/* ابزار فیلتر و جستجو */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <Input 
            placeholder="جستجو در محصولات (نام، برند، دسته‌بندی یا آیدی)..." 
            className="pr-10 py-5 sm:py-6 rounded-xl border-gray-200 text-sm sm:text-base" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <div className="flex bg-white border border-gray-200 p-1 rounded-xl shadow-sm overflow-x-auto">
          <button 
            onClick={() => setFilter("all")} 
            className={`px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              filter === "all" ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            همه ({stats.total})
          </button>
          <button 
            onClick={() => setFilter("inStock")} 
            className={`px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              filter === "inStock" ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            موجود ({stats.inStock})
          </button>
          <button 
            onClick={() => setFilter("outOfStock")} 
            className={`px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
              filter === "outOfStock" ? 'bg-orange-100 text-orange-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            نیاز به شارژ / ناموجود ({stats.partiallyOutOfStock + stats.outOfStock})
          </button>
        </div>
      </div>

      {/* جدول نمایش محصولات - ریسپانسیو */}
      <Card className="rounded-2xl sm:rounded-3xl border-none shadow-xl bg-white overflow-hidden">
        {/* نمایش موبایل: کارت‌ها */}
        <div className="block lg:hidden">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">محصولی یافت نشد</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {filteredProducts.map((product) => {
                const status = getProductStockStatus(product);
                return (
                  <div 
                    key={product.id} 
                    className={`bg-white rounded-xl border p-4 shadow-sm ${
                      status === "partiallyOutOfStock" ? "border-orange-200 bg-orange-50/30" : 
                      status === "outOfStock" ? "border-red-200 bg-red-50/30" : "border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400">#{product.id}</p>
                        <p className="font-semibold text-gray-800 text-sm truncate">{product.title}</p>
                        <p className="text-xs text-gray-500">{product.brandDetails?.title || '-'}</p>
                      </div>
                      {renderStockStatus(product)}
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setViewModalProduct(product)} 
                        className="text-gray-500 hover:text-purple-600"
                        title="جزئیات"
                      >
                        <Layers size={16} />
                      </Button>
                      <Link href={`/admindashboard/products/${product.id}/edit`}>
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600" title="ویرایش">
                          <Edit size={16} />
                        </Button>
                      </Link>
                      <a href={`/products/${product.id}`} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm" className="text-gray-500 hover:text-purple-600" title="مشاهده">
                          <ExternalLink size={16} />
                        </Button>
                      </a>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-gray-500 hover:text-red-600" 
                        onClick={() => setDeleteDialog({ visible: true, product })} 
                        title="حذف"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* نمایش دسکتاپ: جدول */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-bold text-gray-600">شناسه</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-600">نام محصول</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-600">برند</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-600">دسته‌بندی</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-600">وضعیت موجودی</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-600">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => {
                const status = getProductStockStatus(product);
                return (
                  <tr key={product.id} className={`hover:bg-gray-50 transition-colors ${
                    status === "partiallyOutOfStock" ? "bg-orange-50/30" : 
                    status === "outOfStock" ? "bg-red-50/30" : ""
                  }`}>
                    <td className="px-6 py-4 text-gray-500 font-mono text-sm">{product.id}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{product.title}</td>
                    <td className="px-6 py-4 text-gray-600">{product.brandDetails?.title || "-"}</td>
                    <td className="px-6 py-4 text-gray-600">{product.motherCategoryName}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {renderStockStatus(product)}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setViewModalProduct(product)} 
                          title="مشاهده جزئیات واریانت‌ها"
                          className="text-gray-400 hover:text-gray-700"
                        >
                          <Layers size={18} />
                        </Button>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-1">
                        <Link href={`/admindashboard/products/${product.id}/edit`}>
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-blue-600" title="ویرایش محصول">
                            <Edit size={18} />
                          </Button>
                        </Link>
                        <a href={`/products/${product.id}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" className="text-gray-500 hover:text-purple-600" title="مشاهده در سایت">
                            <ExternalLink size={18} />
                          </Button>
                        </a>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-500 hover:text-red-600" 
                          onClick={() => setDeleteDialog({ visible: true, product })} 
                          title="حذف محصول"
                        >
                          <Trash2 size={18} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-12 sm:py-16">
            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
            <p className="text-gray-500 text-base sm:text-lg">محصولی یافت نشد</p>
            <p className="text-gray-400 text-xs sm:text-sm">با تغییر فیلترها یا جستجو، نتایج را تغییر دهید</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ProductsPage;