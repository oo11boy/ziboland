"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Plus, Edit, Trash2, Search, ExternalLink, X, CheckCircle2, AlertCircle, Layers } from "lucide-react";
import { toast } from "react-toastify";
import { Product } from "@/types/types";

// --- دیالوگ حذف محصول ---
const DeleteDialog = ({ productTitle, onCancel, onForceDelete }: { productTitle: string; onCancel: () => void; onForceDelete: () => void; }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-in zoom-in-95 duration-200">
      <h2 className="text-xl font-bold mb-4 text-gray-800">حذف محصول</h2>
      <p className="mb-6 text-gray-600">آیا مطمئنید می‌خواهید محصول "{productTitle}" را حذف کنید؟ این عمل غیرقابل بازگشت است.</p>
      <div className="flex justify-center gap-4">
        <Button variant="outline" onClick={onCancel} className="px-6 rounded-xl">لغو</Button>
        <Button variant="destructive" onClick={onForceDelete} className="px-6 rounded-xl">تایید حذف</Button>
      </div>
    </div>
  </div>
);

// --- مودال مشاهده سریع (Quick View) ---
const QuickViewModal = ({ product, onClose }: { product: Product | null; onClose: () => void }) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-gray-800">جزئیات واریانت‌ها: {product.title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition"><X size={20} /></button>
        </div>
        
        <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
          {product.variants.map((v, i) => {
            const stock = Number(v.stock_quantity || 0);
            const isAvailable = stock > 0;
            return (
              <div key={i} className={`flex justify-between items-center p-4 rounded-xl border ${isAvailable ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                <span className="font-medium text-gray-700">{v.color_persianName || v.color_englishName || 'بدون نام'}</span>
                <span className={`text-sm font-bold flex items-center gap-1 ${isAvailable ? 'text-green-600' : 'text-red-600'}`}>
                  {isAvailable ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                  {isAvailable ? `موجود (${stock})` : "ناموجود"}
                </span>
              </div>
            );
          })}
        </div>
        <Button onClick={onClose} className="w-full mt-6 bg-gray-900 hover:bg-black text-white rounded-xl">بستن</Button>
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
console.log(products)
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

  const filteredProducts = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();

    return products.filter((p) => {
      const totalStock = p.variants.reduce((acc, v) => acc + Number(v.stock_quantity || 0), 0);
      
      // جستجوی ایمن (جلوگیری از خطای null)
      const idMatch = String(p.id || "").includes(searchTerm);
      const titleMatch = (p.title || "").toLowerCase().includes(lowerSearch);
      const brandMatch = (p.brandDetails?.title || "").toLowerCase().includes(lowerSearch);
      const categoryMatch = (p.motherCategoryName || "").toLowerCase().includes(lowerSearch);
      
      const matchesSearch = idMatch || titleMatch || brandMatch || categoryMatch;
      
      if (filter === "inStock") return matchesSearch && totalStock > 0;
      if (filter === "outOfStock") return matchesSearch && totalStock === 0;
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

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
       <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-600"></div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl yekan">
      <QuickViewModal product={viewModalProduct} onClose={() => setViewModalProduct(null)} />
      {deleteDialog.visible && deleteDialog.product && (
        <DeleteDialog
          productTitle={deleteDialog.product.title}
          onCancel={() => setDeleteDialog({ visible: false, product: null })}
          onForceDelete={() => handleDelete(deleteDialog.product!.id)}
        />
      )}

      {/* هدر */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">مدیریت محصولات</h1>
          <p className="text-gray-500 mt-1">مشاهده، ویرایش و مدیریت موجودی انبار</p>
        </div>
        <Link href="/admindashboard/products/add">
          <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl h-12 px-6 shadow-lg">
            <Plus className="ml-2" size={20} /> افزودن محصول جدید
          </Button>
        </Link>
      </div>

      {/* ابزار فیلتر و جستجو */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-3.5 text-gray-400" size={20} />
          <Input 
            placeholder="جستجو نام محصول، آیدی، برند یا دسته‌بندی..." 
            className="pl-4 pr-10 py-6 rounded-xl border-gray-200" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
        </div>
        <div className="flex bg-white border border-gray-200 p-1 rounded-xl shadow-sm">
          {["all", "inStock", "outOfStock"].map((f) => (
            <button key={f} onClick={() => setFilter(f as any)} className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${filter === f ? 'bg-purple-100 text-purple-700' : 'text-gray-600 hover:bg-gray-50'}`}>
              {f === "all" ? "همه" : f === "inStock" ? "موجود" : "ناموجود"}
            </button>
          ))}
        </div>
      </div>

      {/* جدول نمایش محصولات */}
      <Card className="rounded-3xl border-none shadow-xl bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-sm font-bold text-gray-600">آیدی</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-600">نام محصول</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-600">برند</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-600">دسته‌بندی</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-600">وضعیت موجودی</th>
                <th className="px-6 py-4 text-center text-sm font-bold text-gray-600">عملیات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.map((product) => {
                const totalStock = product.variants.reduce((acc, v) => acc + Number(v.stock_quantity || 0), 0);
                return (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-500 font-mono text-sm">{product.id}</td>
                    <td className="px-6 py-4 font-semibold text-gray-800">{product.title}</td>
                    <td className="px-6 py-4 text-gray-600">{product.brandDetails?.title || "-"}</td>
                    <td className="px-6 py-4 text-gray-600">{product.motherCategoryName}</td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${totalStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {totalStock > 0 ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                        {totalStock > 0 ? "موجود" : "ناموجود"}
                      </span>
                      <Button variant="ghost" size="sm" onClick={() => setViewModalProduct(product)} title="جزئیات واریانت"><Layers size={18} /></Button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <Link href={`/admindashboard/products/${product.id}/edit`}><Button variant="ghost" size="sm" title="ویرایش"><Edit size={18} /></Button></Link>
                        <a href={`/products/${product.id}`} target="_blank" rel="noopener noreferrer"><Button variant="ghost" size="sm" title="مشاهده در سایت"><ExternalLink size={18} /></Button></a>
                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => setDeleteDialog({ visible: true, product })} title="حذف"><Trash2 size={18} /></Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ProductsPage;