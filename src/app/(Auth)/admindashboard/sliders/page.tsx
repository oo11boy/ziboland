"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Plus, Edit, Trash2, View } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { toast } from "react-hot-toast";
import Image from "next/image";

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

  useEffect(() => {
    fetch(`/api/sliders`)
      .then((res) => {
        if (!res.ok) throw new Error("خطا در دریافت اسلایدها");
        return res.json();
      })
      .then(setSlides)
      .then(() => setLoading(false))
      .catch((err) => {
        toast.error("خطا در دریافت اسلایدها");
        console.error(err);
      });
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("آیا مطمئن هستید؟")) {
      try {
        const response = await fetch(`/api/sliders/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("خطا در حذف اسلاید");
        setSlides(slides.filter((s) => s.id !== id));
        toast.success("اسلاید با موفقیت حذف شد");
      } catch (err) {
        toast.error(`خطا در حذف اسلاید: ${(err as Error).message}`);
      }
    }
  };

  if (loading)
    return (
      <div className="container mx-auto p-4 yekan">در حال بارگذاری...</div>
    );

  return (
    <div className="container mx-auto p-4 yekan space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">اسلایدرها</h1>
        <Link href="/admindashboard/sliders/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> افزودن اسلاید
          </Button>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>لیست اسلایدها</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm md:text-base table-auto border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  <th className="px-4 py-2 text-right">پیش‌نمایش</th>

                  <th className="px-4 py-2 text-right">Alt</th>
                  <th className="px-4 py-2 text-right">لینک</th>
                  <th className="px-4 py-2 text-right">ترتیب</th>
                  <th className="px-4 py-2 text-right">عملیات</th>
                </tr>
              </thead>
              <tbody>
                {slides.map((slide) => (
                  <tr
                    key={slide.id}
                    className="border-b border-gray-200 dark:border-gray-700"
                  >
                    <td className="px-4 py-2 text-right">
                      <Image
                        width={64}
                        height={64}
                        src={slide.imagemin}
                        alt={slide.alt}
                        className="h-16 w-16 object-cover rounded border"
                        onError={() =>
                          toast.error(
                            `تصویر اسلاید ${slide.alt} قابل نمایش نیست`,
                          )
                        }
                      />
                    </td>

                    <td className="px-4 py-2 text-right">{slide.alt}</td>
                    <td className="px-4 py-2 text-right">
                      {slide.link || "-"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {slide.slide_order}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <div className="flex space-x-2 space-x-reverse">
                        <Link href={`/admindashboard/sliders/${slide.id}/edit`}>
                          <Button variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          onClick={() => handleDelete(slide.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <a
                          href={slide.imagewide}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost">
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

export default SlidersPage;
