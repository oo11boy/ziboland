// app/admindashboard/brands/add/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";
import { API } from "@/lib/MainRoutes";
import { toast } from "react-hot-toast";

interface BrandFormData {
  title: string;
  img: string;
  link: string;
}

const AddBrandPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<BrandFormData>({
    title: "",
    img: "",
    link: "#",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof BrandFormData, string>>>({});

  const validateForm = () => {
    const newErrors: Partial<Record<keyof BrandFormData, string>> = {};
    if (!formData.title) newErrors.title = "عنوان برند الزامی است";
    if (!formData.img) newErrors.img = "آدرس تصویر الزامی است";
    if (!formData.link) newErrors.link = "لینک الزامی است";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("لطفاً خطاهای فرم را برطرف کنید");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API}/brands`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "خطا در افزودن برند");
      }
      toast.success("برند با موفقیت اضافه شد");
      router.push("/admindashboard/brands");
    } catch (err) {
      toast.error(`خطا در افزودن برند: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 yekan">
      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold text-center">افزودن برند جدید</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title" className="mb-2 block">
                عنوان برند <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                placeholder="عنوان برند را وارد کنید"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                aria-invalid={!!errors.title}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 ml-1" />
                  {errors.title}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="img" className="mb-2 block">
                آدرس تصویر <span className="text-red-500">*</span>
              </Label>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    id="img"
                    placeholder="https://example.com/image.jpg"
                    value={formData.img}
                    onChange={(e) => setFormData({ ...formData, img: e.target.value })}
                    required
                    aria-invalid={!!errors.img}
                    className={errors.img ? "border-red-500" : ""}
                  />
                  {errors.img && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 ml-1" />
                      {errors.img}
                    </p>
                  )}
                </div>
                {formData.img && (
                  <div className="mt-2 md:mt-0">
                    <img
                      src={formData.img}
                      alt="پیش‌نمایش تصویر"
                      className="h-24 w-24 object-cover rounded border"
                      onError={() => toast.error("تصویر قابل نمایش نیست")}
                    />
                  </div>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="link" className="mb-2 block">
                لینک <span className="text-red-500">*</span>
              </Label>
              <Input
                id="link"
                placeholder="لینک برند را وارد کنید"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                required
                aria-invalid={!!errors.link}
                className={errors.link ? "border-red-500" : ""}
              />
              {errors.link && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 ml-1" />
                  {errors.link}
                </p>
              )}
            </div>
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1"
              >
                بازگشت
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-green-600 hover:bg-green-700 flex items-center justify-center"
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    در حال افزودن...
                  </>
                ) : (
                  "افزودن برند"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddBrandPage;