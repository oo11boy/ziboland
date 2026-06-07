"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Plus, Edit, Trash2, View } from "lucide-react";
import { Button } from "@/Components/ui/button";
import { toast } from "react-hot-toast";
import Image from "next/image";

interface Banner {
  id: number;
  image: string;
  alt: string;
  link: string;
  text: string | null;
  banner_order: number;
}

const BannersPage = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/banners`)
      .then((res) => {
        if (!res.ok) throw new Error("خطا در دریافت بنرها");
        return res.json();
      })
      .then(setBanners)
      .then(() => setLoading(false))
      .catch((err) => {
        toast.error("خطا در دریافت بنرها");
        console.error(err);
      });
  }, []);

  const handleDelete = async (id: number) => {
    if (confirm("آیا مطمئن هستید؟")) {
      try {
        const response = await fetch(`/api/banners/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("خطا در حذف بنر");
        setBanners(banners.filter((b) => b.id !== id));
        toast.success("بنر با موفقیت حذف شد");
      } catch (err) {
        toast.error(`خطا در حذف بنر: ${(err as Error).message}`);
      }
    }
  };

  if (loading) return <div>در حال بارگذاری...</div>;

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>بنرها</CardTitle>
        </CardHeader>
        <CardContent>
          <Link href="/admindashboard/banners/add">
            {" "}
            {/* اگر صفحه افزودن دارید، لینک دهید */}
            <Button className="mb-4">
              <Plus className="ml-2" /> افزودن بنر
            </Button>
          </Link>
          <h2 className="text-xl font-bold mb-4">لیست بنرها</h2>
          <div className="grid gap-4">
            {banners.map((banner) => (
              <Card key={banner.id}>
                <CardContent className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Image
                      width={80}
                      height={80}
                      src={banner.image}
                      alt={banner.alt}
                      className="w-20 h-20 object-cover mr-4"
                   
                      onError={() =>
                        toast.error(`تصویر بنر ${banner.alt} قابل نمایش نیست`)
                      }
                    />
                    <div>
                      <h3 className="font-bold">{banner.alt}</h3>
                      <p>لینک: {banner.link || "-"}</p>
                      <p>متن: {banner.text || "-"}</p>
                      <p>ترتیب: {banner.banner_order}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Link href={`/admindashboard/banners/${banner.id}`}>
                      <Button variant="outline" size="icon">
                        <View className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/admindashboard/banners/edit/${banner.id}`}>
                      <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(banner.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BannersPage;
