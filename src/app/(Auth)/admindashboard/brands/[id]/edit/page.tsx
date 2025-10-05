"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { AlertCircle, Loader2, Upload, X, Image as ImageIcon, CheckCircle } from "lucide-react";
import { API, SITE } from "@/lib/MainRoutes";
import { toast } from "react-hot-toast";

interface BrandFormData {
  title: string;
  img: string;
  link: string;
}

interface UploadedFile {
  url: string;
  name: string;
}

const EditBrandPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [formData, setFormData] = useState<BrandFormData>({
    title: "",
    img: "",
    link: "",
  });
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<keyof BrandFormData, string>>>({});
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const validateForm = () => {
    const newErrors: Partial<Record<keyof BrandFormData, string>> = {};
    if (!formData.title) newErrors.title = "عنوان برند الزامی است";
    if (!formData.img) newErrors.img = "آدرس تصویر الزامی است";
    if (!formData.link) newErrors.link = "لینک الزامی است";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    fetch(`${API}/brands/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("خطا در دریافت برند");
        return res.json();
      })
      .then((data) => {
        setFormData({
          title: data.title,
          img: data.img,
          link: data.link,
        });
        setLoading(false);
      })
      .catch((err) => {
        toast.error("خطا در بارگذاری برند");
        setLoading(false);
        console.log(err);
      });
  }, [id]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selectedFiles]);
    selectedFiles.forEach((file) => {
      const previewUrl = URL.createObjectURL(file);
      setPreviews((prev) => ({ ...prev, [file.name]: previewUrl }));
    });
  }, []);

  const removeFile = useCallback(
    (fileName: string) => {
      setFiles((prev) => prev.filter((f) => f.name !== fileName));
      setPreviews((prev) => {
        const newPreviews = { ...prev };
        delete newPreviews[fileName];
        return newPreviews;
      });
      if (previews[fileName]) {
        URL.revokeObjectURL(previews[fileName]);
      }
    },
    [previews]
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
        toast.error(`خطا در آپلود ${file.name}: ` + error);
        return null;
      }
    });
    const results = await Promise.all(uploadPromises);
    const successful = results.filter(Boolean) as UploadedFile[];
    setUploadedFiles(successful);
    setFiles([]);
    setPreviews({});
    setUploading(false);
    toast.success(`${successful.length} فایل با موفقیت آپلود شد`);
  }, [files]);

  const handleConfirmUpload = () => {
    if (uploadedFiles.length === 0) {
      toast.error("هیچ فایلی آپلود نشده است");
      return;
    }
    setFormData((prev) => ({ ...prev, img: uploadedFiles[0].url }));
    setShowUploadModal(false);
    setFiles([]);
    setPreviews({});
    setUploadedFiles([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("لطفاً خطاهای فرم را برطرف کنید");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API}/brands/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "خطا در بروزرسانی برند");
      }
      toast.success("برند با موفقیت بروزرسانی شد");
      router.push("/admindashboard/brands");
    } catch (err) {
      toast.error(`خطا در بروزرسانی برند: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 yekan text-center py-8">
        <Loader2 className="h-8 w-8 animate-spin mx-auto" />
        <p>در حال بارگذاری...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 yekan">
      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold text-center">ویرایش برند</CardTitle>
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
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 flex gap-2">
                  <Input
                    id="img"
                    placeholder="https://example.com/image.jpg"
                    value={formData.img}
                    onChange={(e) => setFormData({ ...formData, img: e.target.value })}
                    required
                    aria-invalid={!!errors.img}
                    className={errors.img ? "border-red-500" : ""}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowUploadModal(true)}
                    title="آپلود تصویر"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
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
              {errors.img && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 ml-1" />
                  {errors.img}
                </p>
              )}
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
                    در حال بروزرسانی...
                  </>
                ) : (
                  "بروزرسانی برند"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                آپلود تصویر برند
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div
                className="border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-lg p-6 text-center hover:border-purple-400 dark:hover:border-purple-500 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-700"
                onClick={() => document.getElementById("file-input-modal")?.click()}
              >
                <Upload className="mx-auto h-8 w-8 text-purple-500 mb-2" />
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  فایل را بکشید یا کلیک کنید
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  حداکثر 10 مگابایت (فقط تصاویر)
                </p>
                <Input
                  id="file-input-modal"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Selected Files Preview */}
              {files.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white">فایل انتخاب‌شده:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {files.map((file) => (
                      <div key={file.name} className="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden group">
                        <img
                          src={previews[file.name] || ""}
                          alt={file.name}
                          className="w-full h-20 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-white hover:bg-red-500"
                            onClick={() => removeFile(file.name)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="p-1 text-xs text-gray-600 dark:text-gray-300 truncate text-right">
                          {file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={handleUpload}
                    disabled={uploading || files.length === 0}
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
                        آپلود فایل
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white">فایل آپلود شده:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {uploadedFiles.map((file) => (
                      <div key={file.name} className="relative bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center">
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-16 object-cover rounded mb-1"
                        />
                        <p className="text-xs truncate">{file.name}</p>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={handleConfirmUpload}
                    className="w-full bg-green-600 text-white"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    استفاده به عنوان تصویر برند
                  </Button>
                </div>
              )}
            </div>
            <div className="p-6 border-t flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                انصراف
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditBrandPage;