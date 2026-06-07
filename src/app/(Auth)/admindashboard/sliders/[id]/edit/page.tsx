"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
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

interface SliderFormData {
  imagewide: string;
  imagemin: string;
  alt: string;
  link: string;
  slide_order: number;
}

interface UploadedFile {
  url: string;
  name: string;
}

const EditSliderPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  const [formData, setFormData] = useState<SliderFormData>({
    imagewide: "",
    imagemin: "",
    alt: "",
    link: "",
    slide_order: 0,
  });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<"imagewide" | "imagemin" | null>(
    null,
  );
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [errors, setErrors] = useState<
    Partial<Record<keyof SliderFormData, string>>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`../api/sliders/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("خطا در دریافت اطلاعات اسلاید");
        return res.json();
      })
      .then(setFormData)
      .then(() => setLoading(false))
      .catch((err) => {
        toast.error("خطا در دریافت اطلاعات اسلاید");
        console.error(err);
      });
  }, [id]);

  // اعتبارسنجی فرم
  const validateForm = () => {
    const newErrors: Partial<Record<keyof SliderFormData, string>> = {};
    if (!formData.imagewide) newErrors.imagewide = "تصویر دسکتاپ الزامی است";
    if (!formData.imagemin) newErrors.imagemin = "تصویر موبایل الزامی است";
    if (!formData.alt) newErrors.alt = "متن جایگزین (Alt) الزامی است";
    if (formData.slide_order < 0)
      newErrors.slide_order = "ترتیب باید عدد غیرمنفی باشد";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // مدیریت آپلود فایل
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
        toast.error(`خطا در آپلود ${file.name}` + error);
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
    if (uploadType === "imagewide") {
      setFormData((prev) => ({ ...prev, imagewide: uploadedFiles[0].url }));
    } else if (uploadType === "imagemin") {
      setFormData((prev) => ({ ...prev, imagemin: uploadedFiles[0].url }));
    }
    closeUploadModal();
  };

  const openUploadModal = (type: "imagewide" | "imagemin") => {
    setUploadType(type);
    setFiles([]);
    setPreviews({});
    setUploadedFiles([]);
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setUploadType(null);
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
    try {
      const response = await fetch(`../api/sliders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "خطا در ویرایش اسلاید");
      }
      toast.success("اسلاید با موفقیت ویرایش شد");
      router.push("/admindashboard/sliders");
    } catch (err) {
      toast.error(`خطا در ویرایش اسلاید: ${(err as Error).message}`);
    }
  };

  if (loading)
    return (
      <div className="container mx-auto p-4 yekan">در حال بارگذاری...</div>
    );

  return (
    <div className="container mx-auto p-4 yekan">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block">
            تصویر دسکتاپ <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="آدرس تصویر دسکتاپ"
              value={formData.imagewide}
              onChange={(e) =>
                setFormData({ ...formData, imagewide: e.target.value })
              }
              className={errors.imagewide ? "border-red-500" : ""}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => openUploadModal("imagewide")}
              title="آپلود تصویر دسکتاپ"
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
          {formData.imagewide && (
            <img
              src={formData.imagewide}
              alt="پیش‌نمایش تصویر دسکتاپ"
              className="mt-2 h-24 w-24 object-cover rounded border"
              onError={() => toast.error("تصویر دسکتاپ قابل نمایش نیست")}
            />
          )}
          {errors.imagewide && (
            <p className="text-red-500 text-sm mt-1"> {errors.imagewide}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block">
            تصویر موبایل <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2">
            <Input
              placeholder="آدرس تصویر موبایل"
              value={formData.imagemin}
              onChange={(e) =>
                setFormData({ ...formData, imagemin: e.target.value })
              }
              className={errors.imagemin ? "border-red-500" : ""}
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => openUploadModal("imagemin")}
              title="آپلود تصویر موبایل"
            >
              <Upload className="h-4 w-4" />
            </Button>
          </div>
          {formData.imagemin && (
            <img
              src={formData.imagemin}
              alt="پیش‌نمایش تصویر موبایل"
              className="mt-2 h-24 w-24 object-cover rounded border"
              onError={() => toast.error("تصویر موبایل قابل نمایش نیست")}
            />
          )}
          {errors.imagemin && (
            <p className="text-red-500 text-sm mt-1"> {errors.imagemin}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block">
            متن جایگزین (Alt) <span className="text-red-500">*</span>
          </label>
          <Input
            placeholder="متن جایگزین تصویر"
            value={formData.alt}
            onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
            className={errors.alt ? "border-red-500" : ""}
          />
          {errors.alt && (
            <p className="text-red-500 text-sm mt-1"> {errors.alt}</p>
          )}
        </div>

        <div>
          <label className="mb-2 block">لینک</label>
          <Input
            placeholder="لینک اسلاید"
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
          />
        </div>

        <div>
          <label className="mb-2 block">
            ترتیب <span className="text-red-500">*</span>
          </label>
          <Input
            type="number"
            placeholder="ترتیب نمایش"
            value={formData.slide_order}
            onChange={(e) =>
              setFormData({
                ...formData,
                slide_order: parseInt(e.target.value) || 0,
              })
            }
            min="0"
            className={errors.slide_order ? "border-red-500" : ""}
          />
          {errors.slide_order && (
            <p className="text-red-500 text-sm mt-1"> {errors.slide_order}</p>
          )}
        </div>

        <div className="flex gap-4">
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
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            ویرایش اسلاید
          </Button>
        </div>
      </form>

      {/* مدال آپلود */}
      {showUploadModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                آپلود{" "}
                {uploadType === "imagewide" ? "تصویر دسکتاپ" : "تصویر موبایل"}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div
                className="border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-lg p-6 text-center hover:border-purple-400 dark:hover:border-purple-500 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-700"
                onClick={() =>
                  document.getElementById("file-input-modal")?.click()
                }
              >
                <Upload className="mx-auto h-8 w-8 text-purple-500 mb-2" />
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  فایل را بکشید یا کلیک کنید
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  حداکثر 10 مگابایت (فقط تصویر)
                </p>
                <Input
                  id="file-input-modal"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {files.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                    فایل انتخاب‌شده:
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {files.map((file) => (
                      <div
                        key={file.name}
                        className="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden group"
                      >
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

              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                    فایل‌های آپلود شده:
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.name}
                        className="relative bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center"
                      >
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
                    استفاده از تصویر
                  </Button>
                </div>
              )}
            </div>
            <div className="p-6 border-t flex justify-end gap-2">
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

export default EditSliderPage;
