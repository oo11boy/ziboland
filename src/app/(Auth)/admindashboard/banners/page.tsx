
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/Components/ui/card";
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { toast } from "react-hot-toast";

// تابع کمکی برای تبدیل آدرس کامل به نسبی
const getRelativeUrl = (url: string) => {
  if (!url) return '/placeholder-image.jpg';
  return url.replace(/^https?:\/\/[^/]+/, '');
};

interface Banner {
  id: number;
  image: string;
  alt: string;
  banner_order: number;
}

const BannersPage = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const res = await fetch(`/api/banners`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setBanners(data);
    } catch {
      toast.error("خطا در دریافت بنرها");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("آیا از حذف این بنر مطمئن هستید؟")) return;
    setDeletingId(id);
    try {
      const response = await fetch(`/api/banners/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      setBanners(banners.filter((b) => b.id !== id));
      toast.success("بنر حذف شد");
    } catch {
      toast.error("خطا در حذف بنر");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">مدیریت بنرها</h1>
        <Link href="/admindashboard/banners/add">
          <Button><Plus className="ml-2 h-4 w-4" /> افزودن بنر جدید</Button>
        </Link>
      </div>

      <Card className="shadow-lg border-0 dark:bg-gray-800/50">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-4 text-right">تصویر</th>
                  <th className="px-6 py-4 text-right">عنوان</th>
                  <th className="px-6 py-4 text-center">ترتیب</th>
                  <th className="px-6 py-4 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {banners.map((banner) => (
                  <tr key={banner.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-6 py-4">
                      <div className="relative h-16 w-24 rounded-lg overflow-hidden">
                        <Image
                          src={getRelativeUrl(banner.image)}
                          alt={banner.alt}
                          fill
                          className="object-cover hover:scale-110 transition-transform"
                          onError={(e) => (e.currentTarget.src = '/placeholder-image.jpg')}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium">{banner.alt}</td>
                    <td className="px-6 py-4 text-center">{banner.banner_order}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <Link href={`/admindashboard/banners/edit/${banner.id}`}>
                          <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                          onClick={() => handleDelete(banner.id)}
                          disabled={deletingId === banner.id}
                        >
                          {deletingId === banner.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
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

export default BannersPage;
