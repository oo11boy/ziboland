"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Plus, Edit, Trash2, View, Loader2, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { ImageAspectRatio } from "@mui/icons-material";

interface Slide {
  id: number;
  imagewide: string;
  imagemin: string;
  alt: string;
  link: string;
  slide_order: number;
}

const SlidersPage = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      const res = await fetch(`/api/sliders`);
      if (!res.ok) throw new Error("خطا در دریافت اسلایدها");
      const data = await res.json();
      setSlides(data);
    } catch (err) {
      toast.error("خطا در دریافت اسلایدها");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("آیا از حذف این اسلاید مطمئن هستید؟ این عمل غیرقابل بازگشت است.")) {
      setDeletingId(id);
      try {
        const response = await fetch(`/api/sliders/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("خطا در حذف اسلاید");
        setSlides(slides.filter((s) => s.id !== id));
        toast.success("اسلاید با موفقیت حذف شد");
      } catch (err) {
        toast.error(`خطا در حذف اسلاید: ${(err as Error).message}`);
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-gray-500 dark:text-gray-400 text-lg">در حال بارگذاری اسلایدها...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            مدیریت اسلایدرها
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            مدیریت و سازماندهی اسلایدهای نمایش داده شده در صفحه اصلی
          </p>
        </div>
        <Link href="/admindashboard/sliders/add" className="w-full sm:w-auto">
          <Button className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-all duration-300">
            <Plus className="ml-2 h-4 w-4" />
            افزودن اسلاید جدید
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">تعداد کل اسلایدها</p>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{slides.length}</p>
              </div>
              <div className="h-12 w-12 bg-blue-500/10 rounded-lg flex items-center justify-center">
                <View className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 dark:text-green-400 mb-1">آخرین ترتیب</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                  {slides.length > 0 ? Math.max(...slides.map(s => s.slide_order)) : 0}
                </p>
              </div>
              <div className="h-12 w-12 bg-green-500/10 rounded-lg flex items-center justify-center">
                <ChevronLeft className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-none shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">اسلایدهای فعال</p>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{slides.length}</p>
              </div>
              <div className="h-12 w-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
                <ImageAspectRatio className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desktop Table View */}
      <Card className="hidden md:block shadow-lg border-0 dark:bg-gray-800/50 backdrop-blur-sm">
        <CardHeader className="border-b border-gray-200 dark:border-gray-700">
          <CardTitle className="text-xl">لیست اسلایدها</CardTitle>
          <p className="text-sm text-gray-500 mt-1">مجموع {slides.length} اسلاید</p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">پیش‌نمایش</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">عنوان (Alt)</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-gray-300 hidden lg:table-cell">لینک</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">ترتیب</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {slides.length > 0 ? (
                  slides.map((slide) => (
                    <tr key={slide.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="relative h-16 w-24 rounded-lg overflow-hidden shadow-md">
                          <Image
                            src={slide.imagemin}
                            alt={slide.alt}
                            fill
                            className="object-cover hover:scale-110 transition-transform duration-300"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = '/placeholder-image.jpg';
                            }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900 dark:text-white">{slide.alt}</p>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        {slide.link ? (
                          <a href={slide.link} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-600 hover:text-blue-800 dark:text-blue-400 flex items-center gap-1">
                            <span className="truncate max-w-[200px]">{slide.link}</span>
                            <ExternalLink className="h-3 w-3 flex-shrink-0" />
                          </a>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 shadow-sm">
                          {slide.slide_order}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link href={`/admindashboard/sliders/${slide.id}/edit`}>
                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 w-9 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            onClick={() => handleDelete(slide.id)}
                            disabled={deletingId === slide.id}
                          >
                            {deletingId === slide.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                          <a href={slide.imagewide} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                              <View className="h-4 w-4" />
                            </Button>
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <Image src="/empty-state.svg" alt="No data" width={120} height={120} className="opacity-50" />
                        <p className="text-gray-500 dark:text-gray-400">هیچ اسلایدی برای نمایش وجود ندارد</p>
                        <Link href="/admindashboard/sliders/add">
                          <Button variant="outline" className="mt-2">
                            <Plus className="ml-2 h-4 w-4" />
                            افزودن اولین اسلاید
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile Cards View */}
      <div className="md:hidden space-y-4">
        {slides.length > 0 ? (
          slides.map((slide) => (
            <Card key={slide.id} className="overflow-hidden shadow-lg border-0 dark:bg-gray-800/50">
              <CardContent className="p-0">
                <div className="relative h-48 w-full">
                  <Image
                    src={slide.imagewide || slide.imagemin}
                    alt={slide.alt}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/placeholder-image.jpg';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <p className="text-lg font-bold">{slide.alt}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs bg-black/50 px-2 py-1 rounded-full">
                        ترتیب: {slide.slide_order}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 space-y-3">
                  {slide.link && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">لینک:</span>
                      <a href={slide.link} target="_blank" rel="noopener noreferrer" 
                         className="text-blue-600 dark:text-blue-400 flex items-center gap-1 truncate">
                        <span className="truncate">{slide.link}</span>
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex gap-2">
                      <Link href={`/admindashboard/sliders/${slide.id}/edit`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="h-4 w-4 ml-1" />
                          ویرایش
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(slide.id)}
                        disabled={deletingId === slide.id}
                        className="flex-1"
                      >
                        {deletingId === slide.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 ml-1" />
                            حذف
                          </>
                        )}
                      </Button>
                    </div>
                    <a href={slide.imagewide} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm">
                        <View className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="shadow-lg border-0">
            <CardContent className="py-16 text-center">
              <div className="flex flex-col items-center gap-3">
                <Image src="/empty-state.svg" alt="No data" width={100} height={100} className="opacity-50" />
                <p className="text-gray-500 dark:text-gray-400">هیچ اسلایدی برای نمایش وجود ندارد</p>
                <Link href="/admindashboard/sliders/add">
                  <Button variant="outline" className="mt-2">
                    <Plus className="ml-2 h-4 w-4" />
                    افزودن اولین اسلاید
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default SlidersPage;