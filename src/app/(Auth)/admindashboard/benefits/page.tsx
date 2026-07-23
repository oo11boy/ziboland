"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Label } from "@/Components/ui/label";
import { Modal, Box, Typography } from "@mui/material";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { 
  Plus, Edit, Trash2, X, Image as ImageIcon, 
  Upload, Loader2, AlertCircle, CheckCircle 
} from "lucide-react";
import Image from "next/image";
import { SITE } from "@/lib/MainRoutes";

interface Benefit {
  id: number;
  title: string;
  description: string | null;
  image: string;
  link: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

interface UploadedFile {
  url: string;
  name: string;
}

const BenefitsPage = () => {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState<Benefit | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    link: "",
    display_order: "0",
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  // State برای آپلود تصویر
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  useEffect(() => {
    fetchBenefits();
  }, []);

  const fetchBenefits = async () => {
    try {
      const token = Cookies.get("authToken");
      const res = await fetch("/api/admin/benefits", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBenefits(data);
      } else {
        toast.error("خطا در دریافت مزایا");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (benefit?: Benefit) => {
    if (benefit) {
      setEditingBenefit(benefit);
      setFormData({
        title: benefit.title,
        description: benefit.description || "",
        image: benefit.image,
        link: benefit.link || "",
        display_order: benefit.display_order.toString(),
        is_active: benefit.is_active,
      });
    } else {
      setEditingBenefit(null);
      setFormData({
        title: "",
        description: "",
        image: "",
        link: "",
        display_order: "0",
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBenefit(null);
  };

  // توابع آپلود تصویر
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
    toast.success(`${successful.length} فایل با موفقیت آپلود شد`);
  }, [files]);

  const handleConfirmUpload = () => {
    if (uploadedFiles.length === 0) {
      toast.error("هیچ فایلی آپلود نشده است");
      return;
    }
    setFormData((prev) => ({ ...prev, image: uploadedFiles[0].url }));
    setShowUploadModal(false);
    setFiles([]);
    setPreviews({});
    setUploadedFiles([]);
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("عنوان مزیت الزامی است");
      return;
    }

    if (!formData.image.trim()) {
      toast.error("آدرس تصویر الزامی است");
      return;
    }

    setSubmitting(true);
    try {
      const token = Cookies.get("authToken");
      const method = editingBenefit ? "PUT" : "POST";
      const body = {
        ...(editingBenefit && { id: editingBenefit.id }),
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        image: formData.image.trim(),
        link: formData.link.trim() || "#",
        display_order: Number(formData.display_order) || 0,
        is_active: formData.is_active,
      };

      const res = await fetch("/api/admin/benefits", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(
          editingBenefit
            ? "مزیت با موفقیت به‌روزرسانی شد"
            : "مزیت با موفقیت ایجاد شد"
        );
        handleCloseModal();
        fetchBenefits();
      } else {
        const error = await res.json();
        toast.error(error.error || "خطا در ذخیره‌سازی");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`آیا از حذف مزیت "${title}" مطمئن هستید؟`)) return;

    try {
      const token = Cookies.get("authToken");
      const res = await fetch(`/api/admin/benefits?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("مزیت با موفقیت حذف شد");
        fetchBenefits();
      } else {
        const error = await res.json();
        toast.error(error.error || "خطا در حذف");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    }
  };

  const toggleStatus = async (benefit: Benefit) => {
    try {
      const token = Cookies.get("authToken");
      const res = await fetch("/api/admin/benefits", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: benefit.id,
          title: benefit.title,
          description: benefit.description,
          image: benefit.image,
          link: benefit.link,
          display_order: benefit.display_order,
          is_active: !benefit.is_active,
        }),
      });

      if (res.ok) {
        toast.success(
          benefit.is_active ? "مزیت غیرفعال شد" : "مزیت فعال شد"
        );
        fetchBenefits();
      } else {
        const error = await res.json();
        toast.error(error.error || "خطا در تغییر وضعیت");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 yekan">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            مدیریت مزایا
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            مزایای نمایش داده شده در پایین صفحه را مدیریت کنید
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 ml-2" />
          افزودن مزیت جدید
        </Button>
      </div>

      {benefits.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-500">هیچ مزیتی تعریف نشده است</p>
          <p className="text-sm text-gray-400 mt-2">
            برای افزودن مزیت جدید، دکمه "افزودن مزیت جدید" را کلیک کنید
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {benefits.map((benefit) => (
            <Card key={benefit.id} className={`shadow-lg hover:shadow-xl transition-shadow ${!benefit.is_active ? 'opacity-60' : ''}`}>
              <CardHeader className="flex flex-row justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{benefit.title}</CardTitle>
                  {!benefit.is_active && (
                    <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-md inline-block mt-1">
                      غیرفعال
                    </span>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenModal(benefit)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(benefit.id, benefit.title)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={benefit.image}
                    alt={benefit.title}
                    className="w-12 h-12 object-contain"
                  />
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </div>
                </div>

                {benefit.link && benefit.link !== "#" && (
                  <div className="text-sm text-gray-500">
                    لینک: <span className="text-blue-600">{benefit.link}</span>
                  </div>
                )}

                <div className="flex justify-between items-center border-t pt-3">
                  <span className="text-sm text-gray-600">وضعیت:</span>
                  <button
                    onClick={() => toggleStatus(benefit)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                      benefit.is_active
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {benefit.is_active ? "فعال" : "غیرفعال"}
                  </button>
                </div>

                <div className="text-xs text-gray-400">
                  ترتیب: {benefit.display_order}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* مودال افزودن/ویرایش */}
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: 600,
            bgcolor: "white",
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <div className="flex justify-between items-center mb-6">
            <Typography variant="h6" sx={{ fontFamily: "yekannew", fontWeight: "bold" }}>
              {editingBenefit ? "ویرایش مزیت" : "افزودن مزیت جدید"}
            </Typography>
            <button
              onClick={handleCloseModal}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="mb-2 block">
                عنوان <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="مثال: ارسال رایگان سفارشات"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description" className="mb-2 block">
                توضیحات
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="مثال: خرید بالای 4 میلیون"
                className="mt-1"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="image" className="mb-2 block">
                آدرس تصویر <span className="text-red-500">*</span>
              </Label>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 flex gap-2">
                  <Input
                    id="image"
                    placeholder="https://example.com/image.jpg"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setShowUploadModal(true)}
                    title="آپلود تصویر"
                    className="shrink-0"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                {formData.image && (
                  <div className="mt-2 md:mt-0">
                    <Image
                      width={80}
                      height={80}
                      src={formData.image}
                      alt="پیش‌نمایش تصویر"
                      className="h-20 w-20 object-contain rounded border p-1"
                      onError={() => toast.error("تصویر قابل نمایش نیست")}
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="link" className="mb-2 block">
                لینک
              </Label>
              <Input
                id="link"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                placeholder="مثال: /faq"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                اگر خالی بماند، لینک به # (همان صفحه) خواهد رفت
              </p>
            </div>

            <div>
              <Label htmlFor="display_order" className="mb-2 block">
                ترتیب نمایش
              </Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                placeholder="۰"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                عدد کوچکتر، بالاتر نمایش داده می‌شود
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Label className="text-sm font-medium text-gray-700">
                فعال:
              </Label>
              <button
                onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  formData.is_active ? "bg-purple-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    formData.is_active ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <span className="text-sm text-gray-600">
                {formData.is_active ? "فعال" : "غیرفعال"}
              </span>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t">
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {submitting
                  ? "در حال ذخیره..."
                  : editingBenefit
                  ? "به‌روزرسانی"
                  : "ایجاد"}
              </Button>
              <Button
                onClick={handleCloseModal}
                variant="outline"
                className="flex-1 border-gray-300 hover:bg-gray-50"
              >
                لغو
              </Button>
            </div>
          </div>
        </Box>
      </Modal>

{/* مودال آپلود تصویر */}
{showUploadModal && (
  <div 
    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-[1400] p-4"
    onClick={(e) => {
      if (e.target === e.currentTarget) {
        setShowUploadModal(false);
        setFiles([]);
        setPreviews({});
        setUploadedFiles([]);
      }
    }}
  >
    <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-[1401]">
      <div className="p-6 border-b flex justify-between items-center">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          آپلود تصویر
        </h2>
        <button
          onClick={() => {
            setShowUploadModal(false);
            setFiles([]);
            setPreviews({});
            setUploadedFiles([]);
          }}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>
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
            حداکثر 10 مگابایت (فقط تصاویر)
          </p>
          <Input
            id="file-input-modal"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            multiple
          />
        </div>

        {/* Selected Files Preview */}
        {files.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
              فایل‌های انتخاب‌شده:
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {files.map((file) => (
                <div
                  key={file.name}
                  className="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden group"
                >
                  <Image
                    width={100}
                    height={100}
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
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  در حال آپلود...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  آپلود فایل‌ها
                </>
              )}
            </Button>
          </div>
        )}

        {/* Uploaded Files */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
              فایل آپلود شده:
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.name}
                  className="relative bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center"
                >
                  <Image
                    width={100}
                    height={100}
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
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              استفاده به عنوان تصویر مزیت
            </Button>
          </div>
        )}
      </div>
      <div className="p-6 border-t flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => {
            setShowUploadModal(false);
            setFiles([]);
            setPreviews({});
            setUploadedFiles([]);
          }}
        >
          انصراف
        </Button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default BenefitsPage;