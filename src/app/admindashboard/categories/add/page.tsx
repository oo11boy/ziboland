"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Checkbox } from "@/Components/ui/checkbox";
import { Label } from "@/Components/ui/label";
import { AlertCircle, Plus, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { toast } from "react-hot-toast";
import { API } from "@/lib/MainRoutes";

interface CategoryFormData {
  name: string;
  link: string;
  mothercat: boolean;
  icon: string;
  subcat: { name: string; items: { name: string }[] }[];
}

const AddCategoryPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    link: "",
    mothercat: false,
    icon: "",
    subcat: [],
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CategoryFormData, string>>>({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors: Partial<Record<keyof CategoryFormData, string>> = {};
    if (!formData.name) newErrors.name = "نام دسته‌بندی الزامی است";
    if (!formData.link) newErrors.link = "لینک دسته‌بندی الزامی است";
    if (!formData.icon) newErrors.icon = "آیکون الزامی است";
    if (formData.subcat.some((sub) => !sub.name)) {
      newErrors.subcat = "تمامی زیرمجموعه‌ها باید نام داشته باشند";
    }
    if (
      formData.subcat.some((sub) =>
        sub.items.some((item) => !item.name)
      )
    ) {
      newErrors.subcat = "تمامی آیتم‌های زیرمجموعه باید نام داشته باشند";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddSubcategory = () => {
    setFormData({
      ...formData,
      subcat: [...formData.subcat, { name: "", items: [] }],
    });
  };

  const handleSubcategoryChange = (index: number, value: string) => {
    const newSubcat = [...formData.subcat];
    newSubcat[index].name = value;
    setFormData({ ...formData, subcat: newSubcat });
  };

  const handleRemoveSubcategory = (index: number) => {
    setFormData({
      ...formData,
      subcat: formData.subcat.filter((_, i) => i !== index),
    });
  };

  const handleAddSubcategoryItem = (subcatIndex: number) => {
    const newSubcat = [...formData.subcat];
    newSubcat[subcatIndex].items.push({ name: "" });
    setFormData({ ...formData, subcat: newSubcat });
  };

  const handleSubcategoryItemChange = (
    subcatIndex: number,
    itemIndex: number,
    value: string
  ) => {
    const newSubcat = [...formData.subcat];
    newSubcat[subcatIndex].items[itemIndex].name = value;
    setFormData({ ...formData, subcat: newSubcat });
  };

  const handleRemoveSubcategoryItem = (subcatIndex: number, itemIndex: number) => {
    const newSubcat = [...formData.subcat];
    newSubcat[subcatIndex].items = newSubcat[subcatIndex].items.filter(
      (_, i) => i !== itemIndex
    );
    setFormData({ ...formData, subcat: newSubcat });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("لطفاً خطاهای فرم را برطرف کنید");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API}/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "خطا در افزودن دسته‌بندی");
      }
      toast.success("دسته‌بندی با موفقیت اضافه شد");
      router.push("/admindashboard/categories");
    } catch (err) {
      toast.error(`خطا در افزودن دسته‌بندی: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 yekan">
      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold text-center">افزودن دسته‌بندی جدید</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="mb-2 block">
                  نام دسته‌بندی <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="نام دسته‌بندی را وارد کنید"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  aria-invalid={!!errors.name}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 ml-1" />
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="link" className="mb-2 block">
                  لینک <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="link"
                  placeholder="لینک دسته‌بندی را وارد کنید"
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
              <div>
                <Label htmlFor="icon" className="mb-2 block">
                  آیکون <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="icon"
                  placeholder="آدرس آیکون را وارد کنید"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  required
                  aria-invalid={!!errors.icon}
                  className={errors.icon ? "border-red-500" : ""}
                />
                {errors.icon && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 ml-1" />
                    {errors.icon}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="mothercat"
                  checked={formData.mothercat}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, mothercat: !!checked })
                  }
                />
                <Label htmlFor="mothercat">دسته اصلی</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label>زیرمجموعه‌ها</Label>
              {formData.subcat.map((subcat, subcatIndex) => (
                <div
                  key={subcatIndex}
                  className="border p-4 rounded-md space-y-4"
                >
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="نام زیرمجموعه"
                      value={subcat.name}
                      onChange={(e) =>
                        handleSubcategoryChange(subcatIndex, e.target.value)
                      }
                      required
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveSubcategory(subcatIndex)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>آیتم‌های زیرمجموعه</Label>
                    {subcat.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex gap-2 items-center"
                      >
                        <Input
                          placeholder="نام آیتم"
                          value={item.name}
                          onChange={(e) =>
                            handleSubcategoryItemChange(
                              subcatIndex,
                              itemIndex,
                              e.target.value
                            )
                          }
                          required
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() =>
                            handleRemoveSubcategoryItem(subcatIndex, itemIndex)
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleAddSubcategoryItem(subcatIndex)}
                      className="flex items-center mt-2"
                    >
                      <Plus className="h-4 w-4 ml-2" />
                      افزودن آیتم
                    </Button>
                  </div>
                </div>
              ))}
              {errors.subcat && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 ml-1" />
                  {errors.subcat}
                </p>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={handleAddSubcategory}
                className="flex items-center mt-2"
              >
                <Plus className="h-4 w-4 ml-2" />
                افزودن زیرمجموعه
              </Button>
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
                  "افزودن دسته‌بندی"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddCategoryPage;