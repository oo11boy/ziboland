"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Checkbox } from "@/Components/ui/checkbox";
import { Label } from "@/Components/ui/label";
import {
  AlertCircle,
  Plus,
  Trash2,
  Loader2,
  Upload,
  X,
  Image as ImageIcon,
  CheckCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { toast } from "react-hot-toast";
import { API, SITE } from "@/lib/MainRoutes";
import Image from "next/image";

interface CategoryFormData {
  name: string;
  link: string; // تصویر دسته‌بندی - اختیاری، اگر آپلود نشود "" ارسال می‌شود
  mothercat: boolean;
  subcat: { name: string; items: { name: string }[] }[];
}

interface UploadedFile {
  url: string;
  name: string;
}

const AddCategoryPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    link: "",
    mothercat: false,
    subcat: [],
  });
  const [errors, setErrors] = useState<
    Partial<Record<keyof CategoryFormData, string>>
  >({});
  const [loading, setLoading] = useState(false);

  // حالت‌های مودال آپلود تصویر دسته‌بندی
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const validateForm = () => {
    const newErrors: Partial<Record<keyof CategoryFormData, string>> = {};
    if (!formData.name) newErrors.name = "نام دسته‌بندی الزامی است";

    if (formData.subcat.some((sub) => !sub.name)) {
      newErrors.subcat = "تمامی زیرمجموعه‌ها باید نام داشته باشند";
    }
    if (formData.subcat.some((sub) => sub.items.some((item) => !item.name))) {
      newErrors.subcat = "تمامی آیتم‌های زیرمجموعه باید نام داشته باشند";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // توابع زیرمجموعه‌ها
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
    value: string,
  ) => {
    const newSubcat = [...formData.subcat];
    newSubcat[subcatIndex].items[itemIndex].name = value;
    setFormData({ ...formData, subcat: newSubcat });
  };

  const handleRemoveSubcategoryItem = (
    subcatIndex: number,
    itemIndex: number,
  ) => {
    const newSubcat = [...formData.subcat];
    newSubcat[subcatIndex].items = newSubcat[subcatIndex].items.filter(
      (_, i) => i !== itemIndex,
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
      const response = await fetch(`/api/categories`, {
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

  // توابع آپلود تصویر دسته‌بندی
  const openUploadModal = () => {
    setFiles([]);
    setPreviews({});
    setUploadedFiles([]);
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
  };

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      setFiles((prev) => [...prev, ...selectedFiles]);
      selectedFiles.forEach((file) => {
        const previewUrl = URL.createObjectURL(file);
        setPreviews((prev) => ({ ...prev, [file.name]: previewUrl }));
      });
    },
    [],
  );

  const removeFile = useCallback(
    (fileName: string) => {
      setFiles((prev) => prev.filter((f) => f.name !== fileName));
      setPreviews((prev) => {
        const newPreviews = { ...prev };
        delete newPreviews[fileName];
        return newPreviews;
      });
      if (previews[fileName]) URL.revokeObjectURL(previews[fileName]);
    },
    [previews],
  );

  const handleUpload = useCallback(async () => {
    if (files.length === 0) return;
    setUploading(true);
    const uploadPromises = files.map(async (file) => {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      try {
        const res = await fetch("/api/media", {
          method: "POST",
          body: formDataUpload,
        });
        if (!res.ok) throw new Error("خطا در آپلود");
        const data = await res.json();
        return { url: SITE + data.url, name: file.name };
      } catch (error) {
        toast.error(`خطا در آپلود ${file.name}`);
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const successful = results.filter(Boolean) as UploadedFile[];
    setUploadedFiles(successful);
    setFiles([]);
    setPreviews({});
    setUploading(false);
    toast.success(`${successful.length} تصویر با موفقیت آپلود شد`);
  }, [files]);

  const handleConfirmUpload = () => {
    if (uploadedFiles.length === 0) {
      toast.error("هیچ تصویری آپلود نشده است");
      return;
    }
    // فقط اولین تصویر انتخاب می‌شود
    setFormData((prev) => ({ ...prev, link: uploadedFiles[0].url }));
    closeUploadModal();
    toast.success("تصویر دسته‌بندی با موفقیت انتخاب شد");
  };

  return (
    <div className="container mx-auto p-4 yekan">
      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold text-center">
            افزودن دسته‌بندی جدید
          </CardTitle>
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
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
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
                <Label className="mb-2 block">تصویر دسته‌بندی (اختیاری)</Label>

                <div className="flex gap-4 items-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={openUploadModal}
                    className="flex items-center"
                  >
                    <Upload className="h-4 w-4 ml-2" />
                    آپلود تصویر دسته‌بندی
                  </Button>

                  {formData.link && (
                    <span className="text-sm text-green-600 dark:text-green-400">
                      تصویر انتخاب شد
                    </span>
                  )}
                </div>

                {formData.link && (
                  <div className="mt-4">
                    <Image
                      width={160}
                      height={160}
                      src={formData.link}
                      alt="پیش‌نمایش تصویر دسته‌بندی"
                      className="w-40 h-40 object-cover rounded-lg border shadow-md"
                      onError={() => toast.error("تصویر قابل نمایش نیست")}
                    />
                  </div>
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

            {/* زیرمجموعه‌ها */}
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
                      <div key={itemIndex} className="flex gap-2 items-center">
                        <Input
                          placeholder="نام آیتم"
                          value={item.name}
                          onChange={(e) =>
                            handleSubcategoryItemChange(
                              subcatIndex,
                              itemIndex,
                              e.target.value,
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

      {/* مودال آپلود تصویر */}
      {showUploadModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                آپلود تصویر دسته‌بندی
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div
                className="border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-lg p-8 text-center hover:border-purple-400 dark:hover:border-purple-500 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-700"
                onClick={() =>
                  document.getElementById("image-file-input")?.click()
                }
              >
                <Upload className="mx-auto h-12 w-12 text-purple-500 mb-4" />
                <p className="text-sm font-semibold">
                  فایل را بکشید یا کلیک کنید
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  فقط تصویر (حداکثر ۱۰ مگابایت)
                </p>
                <Input
                  id="image-file-input"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {files.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">تصویر انتخاب‌شده:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {files.map((file) => (
                      <div key={file.name} className="relative group">
                        <Image
                          width={160}
                          height={160}
                          src={previews[file.name]}
                          alt={file.name}
                          className="w-full h-32 object-cover rounded border"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-red-500"
                            onClick={() => removeFile(file.name)}
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                        <p className="text-xs text-center mt-2 truncate">
                          {file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        در حال آپلود...
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 mr-2" />
                        آپلود تصویر ({files.length})
                      </>
                    )}
                  </Button>
                </div>
              )}

              {uploadedFiles.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold">تصویر آپلود شده:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {uploadedFiles.map((file) => (
                      <div key={file.name} className="text-center">
                        <Image
                          width={160}
                          height={160}
                          src={file.url}
                          alt={file.name}
                          className="w-full h-32 object-cover rounded border mx-auto"
                        />
                        <p className="text-xs mt-2 truncate">{file.name}</p>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={handleConfirmUpload}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    استفاده از این تصویر
                  </Button>
                </div>
              )}
            </div>
            <div className="p-6 border-t flex justify-end">
              <Button variant="outline" onClick={closeUploadModal}>
                انصراف
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddCategoryPage;
