"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { API, SITE } from "@/lib/MainRoutes";
import { toast } from "react-hot-toast";
import { Upload, X, Image as ImageIcon, CheckCircle, Loader2 } from "lucide-react";

interface BannerFormData {
  image: string;
  alt: string;
  link: string;
  text: string;
  banner_order: number;
}

interface UploadedFile {
  url: string;
  name: string;
}

export default function AddBannerPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<BannerFormData>({
    image: "",
    alt: "",
    link: "",
    text: "",
    banner_order: 0,
  });

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof BannerFormData, string>>>({});

  // اعتبارسنجی فرم
  const validateForm = useCallback(() => {
    const newErrors: Partial<Record<keyof BannerFormData, string>> = {};
    if (!formData.image) newErrors.image = "تصویر بنر الزامی است";
    if (!formData.alt) newErrors.alt = "متن جایگزین (Alt) الزامی است";
    if (formData.banner_order < 0) newErrors.banner_order = "ترتیب باید عدد غیرمنفی باشد";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // مدیریت انتخاب فایل
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
      if (previews[fileName]) URL.revokeObjectURL(previews[fileName]);
    },
    [previews]
  );

  // ارسال فایل به سرور (فرض بر وجود روت /api/media)
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

    if (successful.length > 0) {
      toast.success(`${successful.length} فایل با موفقیت آپلود شد`);
    }
  }, [files]);

  const handleConfirmUpload = () => {
    if (uploadedFiles.length === 0) {
      toast.error("هیچ فایلی آپلود نشده است");
      return;
    }
    // فقط اولین تصویر را استفاده می‌کنیم (بنر تک تصویر است)
    setFormData((prev) => ({ ...prev, image: uploadedFiles[0].url }));
    setShowUploadModal(false);
  };

  const openUploadModal = () => {
    setFiles([]);
    setPreviews({});
    setUploadedFiles([]);
    setShowUploadModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("لطفاً خطاهای فرم را برطرف کنید");
      return;
    }

    try {
      const response = await fetch(`${API}/banners`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "خطا در افزودن بنر");
      }

      toast.success("بنر با موفقیت اضافه شد");
      router.push("/admindashboard/banners");
    } catch (err: any) {
      toast.error(`خطا: ${err.message}`);
    }
  };

  return (
    <div className="container mx-auto p-4 yekan">
      <form onSubmit={handleSubmit} className="space-y-5 max-w-3xl mx-auto">
        {/* تصویر بنر */}
        <div>
          <label className="mb-2 block font-medium">
            تصویر بنر <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            <Input
              placeholder="https://ziboland.co/api/files/..."
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              className={errors.image ? "border-red-500" : ""}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={openUploadModal}
              title="آپلود تصویر بنر"
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
          {formData.image && (
            <div className="mt-3">
              <img
                src={formData.image}
                alt="پیش‌نمایش بنر"
                className="h-32 w-full object-cover rounded border shadow-sm"
                onError={() => toast.error("تصویر قابل نمایش نیست")}
              />
            </div>
          )}
          {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
        </div>

        {/* Alt */}
        <div>
          <label className="mb-2 block font-medium">
            متن جایگزین (Alt) <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="بنر وکس‌های گیاهی"
            value={formData.alt}
            onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
            className={errors.alt ? "border-red-500" : ""}
          />
          {errors.alt && <p className="text-red-500 text-sm mt-1">{errors.alt}</p>}
        </div>

        {/* لینک */}
        <div>
          <label className="mb-2 block font-medium">لینک مقصد</label>
          <Input
            placeholder="/search?q=وکس OR /category/..."
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
          />
        </div>

        {/* متن روی بنر */}
        <div>
          <label className="mb-2 block font-medium">متن روی بنر (اختیاری)</label>
          <Input
            placeholder="وکس‌های گیاهی با کیفیت"
            value={formData.text}
            onChange={(e) => setFormData({ ...formData, text: e.target.value })}
          />
        </div>

        {/* ترتیب */}
        <div>
          <label className="mb-2 block font-medium">
            ترتیب نمایش <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            min="0"
            value={formData.banner_order}
            onChange={(e) =>
              setFormData({ ...formData, banner_order: parseInt(e.target.value) || 0 })
            }
            className={errors.banner_order ? "border-red-500" : ""}
          />
          {errors.banner_order && (
            <p className="text-red-500 text-sm mt-1">{errors.banner_order}</p>
          )}
        </div>

        {/* دکمه‌ها */}
        <div className="flex gap-4 pt-6">
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
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            افزودن بنر
          </Button>
        </div>
      </form>

      {/* ──────────────── Modal آپلود ──────────────── */}
      {showUploadModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <ImageIcon className="h-6 w-6 text-purple-500" />
                آپلود تصویر بنر
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* ناحیه درگ اند دراپ */}
              <div
                className="border-2 border-dashed border-purple-400 dark:border-purple-600 rounded-xl p-8 text-center hover:border-purple-500 transition-colors cursor-pointer bg-purple-50/30 dark:bg-purple-950/20"
                onClick={() => document.getElementById("banner-file-input")?.click()}
              >
                <Upload className="mx-auto h-10 w-10 text-purple-500 mb-3" />
                <p className="font-medium text-gray-700 dark:text-gray-200">
                  فایل را اینجا رها کنید یا کلیک کنید
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  فرمت‌های مجاز: JPG, PNG, WebP — حداکثر ۸ مگابایت
                </p>
                <Input
                  id="banner-file-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* لیست فایل‌های انتخاب شده */}
              {files.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    فایل‌های انتخاب شده ({files.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {files.map((file) => (
                      <div
                        key={file.name}
                        className="relative rounded-lg overflow-hidden border dark:border-gray-700 group bg-white dark:bg-gray-800 shadow-sm"
                      >
                        <img
                          src={previews[file.name]}
                          alt={file.name}
                          className="w-full h-28 object-cover"
                        />
                        <button
                          onClick={() => removeFile(file.name)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                        <p className="text-xs p-2 text-center truncate">
                          {file.name}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        در حال آپلود...
                      </>
                    ) : (
                      "آپلود فایل انتخاب شده"
                    )}
                  </Button>
                </div>
              )}

              {/* فایل‌های آپلود شده موفق */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-4 pt-4 border-t dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-green-700 dark:text-green-400">
                    آپلود موفق
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.name}
                        className="relative rounded-lg overflow-hidden border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30"
                      >
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-28 object-cover"
                        />
                        <p className="text-xs p-2 text-center truncate text-green-800 dark:text-green-300">
                          {file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={handleConfirmUpload}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    استفاده از این تصویر
                  </Button>
                </div>
              )}
            </div>

            <div className="p-6 border-t dark:border-gray-700 flex justify-end">
              <Button variant="outline" onClick={() => setShowUploadModal(false)}>
                بستن
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}