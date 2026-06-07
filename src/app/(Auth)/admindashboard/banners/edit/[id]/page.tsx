"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { API, SITE } from "@/lib/MainRoutes";
import { toast } from "react-hot-toast";
import {
  Upload,
  X,
  Image as ImageIcon,
  CheckCircle,
  Loader2,
} from "lucide-react";

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

export default function EditBannerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [formData, setFormData] = useState<BannerFormData>({
    image: "",
    alt: "",
    link: "",
    text: "",
    banner_order: 0,
  });

  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [errors, setErrors] = useState<
    Partial<Record<keyof BannerFormData, string>>
  >({});

  // بارگذاری اطلاعات بنر موجود
  useEffect(() => {
    if (!id) return;

    const fetchBanner = async () => {
      try {
        const res = await fetch(`../api/banners/${id}`);
        if (!res.ok) {
          throw new Error("بنر یافت نشد");
        }
        const data = await res.json();

        setFormData({
          image: data.image || "",
          alt: data.alt || "",
          link: data.link || "",
          text: data.text || "",
          banner_order: Number(data.banner_order) || 0,
        });
      } catch (err: any) {
        toast.error(err.message || "خطا در بارگذاری بنر");
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, [id]);

  // اعتبارسنجی فرم
  const validateForm = useCallback(() => {
    const newErrors: Partial<Record<keyof BannerFormData, string>> = {};
    if (!formData.image) newErrors.image = "تصویر بنر الزامی است";
    if (!formData.alt) newErrors.alt = "متن جایگزین (Alt) الزامی است";
    if (formData.banner_order < 0)
      newErrors.banner_order = "ترتیب باید عدد غیرمنفی باشد";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // انتخاب فایل
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
      if (previews[fileName]) {
        URL.revokeObjectURL(previews[fileName]);
      }
    },
    [previews],
  );

  // آپلود فایل‌ها به سرور
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
    const successful = results.filter((r): r is UploadedFile => r !== null);

    setUploadedFiles(successful);
    setFiles([]);
    setPreviews({});
    setUploading(false);

    if (successful.length > 0) {
      toast.success(`${successful.length} فایل با موفقیت آپلود شد`);
    }
  }, [files]);

  const handleConfirmUpload = useCallback(() => {
    if (uploadedFiles.length === 0) {
      toast.error("هیچ فایلی آپلود نشده است");
      return;
    }
    // فقط اولین تصویر موفق را استفاده می‌کنیم
    setFormData((prev) => ({ ...prev, image: uploadedFiles[0].url }));
    setShowUploadModal(false);
    setUploadedFiles([]);
  }, [uploadedFiles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("لطفاً خطاهای فرم را برطرف کنید");
      return;
    }

    try {
      const response = await fetch(`../api/banners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "خطا در ویرایش بنر");
      }

      toast.success("بنر با موفقیت ویرایش شد");
      router.push("/admindashboard/banners");
      router.refresh();
    } catch (err: any) {
      toast.error(`خطا در ویرایش بنر: ${err.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 yekan max-w-4xl">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* تصویر بنر */}
        <div>
          <label className="mb-2 block font-medium">
            تصویر بنر <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            <Input
              placeholder="https://ziboland.co/api/files/..."
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
              }
              className={errors.image ? "border-red-500" : ""}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowUploadModal(true)}
              title="آپلود تصویر جدید"
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>

          {formData.image && (
            <div className="mt-4">
              <img
                src={formData.image}
                alt="پیش‌نمایش بنر فعلی"
                className="max-h-48 w-full object-contain rounded border shadow-sm mx-auto"
                onError={() => toast.error("تصویر فعلی قابل نمایش نیست")}
              />
              <p className="text-xs text-gray-500 mt-1 text-center">
                تصویر فعلی
              </p>
            </div>
          )}

          {errors.image && (
            <p className="text-red-500 text-sm mt-1">{errors.image}</p>
          )}
        </div>

        {/* Alt */}
        <div>
          <label className="mb-2 block font-medium">
            متن جایگزین (Alt) <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="بنر پارافین‌های گیاهی"
            value={formData.alt}
            onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
            className={errors.alt ? "border-red-500" : ""}
          />
          {errors.alt && (
            <p className="text-red-500 text-sm mt-1">{errors.alt}</p>
          )}
        </div>

        {/* لینک */}
        <div>
          <label className="mb-2 block font-medium">لینک مقصد (اختیاری)</label>
          <Input
            placeholder="/search?mothercatId=17&subcatId=59&itemId=115"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
          />
        </div>

        {/* متن روی بنر */}
        <div>
          <label className="mb-2 block font-medium">
            متن روی بنر (اختیاری)
          </label>
          <Input
            placeholder="پارافین‌های گیاهی – رفع ترک پا"
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
              setFormData({
                ...formData,
                banner_order: Number(e.target.value) || 0,
              })
            }
            className={errors.banner_order ? "border-red-500" : ""}
          />
          {errors.banner_order && (
            <p className="text-red-500 text-sm mt-1">{errors.banner_order}</p>
          )}
        </div>

        {/* دکمه‌های اقدام */}
        <div className="flex gap-4 pt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1 border-gray-300"
          >
            انصراف
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            ذخیره تغییرات
          </Button>
        </div>
      </form>

      {/* ────────────────────────────── Modal آپلود ────────────────────────────── */}
      {showUploadModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <ImageIcon className="h-6 w-6 text-blue-500" />
                تغییر / آپلود تصویر بنر
              </h2>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Drag & Drop area */}
              <div
                className="border-2 border-dashed border-blue-400 dark:border-blue-600 rounded-xl p-10 text-center hover:border-blue-500 transition-colors cursor-pointer bg-blue-50/40 dark:bg-blue-950/20"
                onClick={() =>
                  document.getElementById("edit-banner-file")?.click()
                }
              >
                <Upload className="mx-auto h-12 w-12 text-blue-500 mb-4" />
                <p className="font-semibold text-gray-700 dark:text-gray-200 text-lg">
                  فایل را اینجا رها کنید یا کلیک کنید
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  JPG ، PNG ، WebP — حداکثر ۸ مگابایت
                </p>
                <Input
                  id="edit-banner-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* فایل‌های انتخاب شده */}
              {files.length > 0 && (
                <div className="space-y-5">
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
                    فایل‌های انتخاب شده ({files.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {files.map((file) => (
                      <div
                        key={file.name}
                        className="relative rounded-lg overflow-hidden border dark:border-gray-700 group bg-white dark:bg-gray-800 shadow"
                      >
                        <img
                          src={previews[file.name] || ""}
                          alt={file.name}
                          className="w-full h-32 object-cover"
                        />
                        <button
                          onClick={() => removeFile(file.name)}
                          className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                          <X size={16} />
                        </button>
                        <p className="text-xs p-2 text-center truncate bg-gray-50 dark:bg-gray-800/80">
                          {file.name}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        در حال آپلود...
                      </>
                    ) : (
                      "آپلود فایل‌های انتخاب شده"
                    )}
                  </Button>
                </div>
              )}

              {/* تصاویر آپلود شده موفق */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-5 pt-6 border-t dark:border-gray-700">
                  <h3 className="text-base font-semibold text-green-700 dark:text-green-400">
                    تصاویر آپلود شده موفق
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.name}
                        className="relative rounded-lg overflow-hidden border border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/30 shadow-sm"
                      >
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-full h-32 object-cover"
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
                    <CheckCircle className="mr-2 h-5 w-5" />
                    استفاده از تصویر انتخاب شده
                  </Button>
                </div>
              )}
            </div>

            <div className="p-6 border-t dark:border-gray-700 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowUploadModal(false)}
              >
                بستن پنجره
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
