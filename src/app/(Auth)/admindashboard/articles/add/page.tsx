"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Label } from "@/Components/ui/label";
import { Upload, X, Image as ImageIcon, CheckCircle, Loader2 } from "lucide-react";
import { Editor } from "@tinymce/tinymce-react";
import { toast } from "react-hot-toast";
import { API, SITE } from "@/lib/MainRoutes";

interface ArticleFormData {
  title: string;
  slug: string;
  content: string;
  image: string;
  author: string;
  tags: string;
}

interface UploadedFile {
  url: string;
  name: string;
}

export default function AddArticlePage() {
  const router = useRouter();
  const [form, setForm] = useState<ArticleFormData>({
    title: "",
    slug: "",
    content: "",
    image: "",
    author: "",
    tags: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const openUploadModal = () => {
    setFiles([]);
    setPreviews({});
    setUploadedFiles([]);
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setFiles([]);
    setPreviews({});
    setUploadedFiles([]);
  };

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
        toast.error(`خطا در آپلود ${file.name}: ${error}`);
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
    // Use the first uploaded file as the article image
    setForm((prev) => ({ ...prev, image: uploadedFiles[0].url }));
    closeUploadModal();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!form.title || !form.slug || !form.content) {
      toast.error("لطفاً فیلدهای الزامی (تیتر، اسلاگ، محتوا) را پر کنید.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API}/articles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(",").map((tag) => tag.trim()),
        }),
      });

      if (res.ok) {
        toast.success("مقاله با موفقیت ذخیره شد!");
        router.push("/admindashboard/articles");
      } else {
        const errorData = await res.json();
        toast.error(`خطا در ذخیره مقاله: ${errorData.message || "خطای ناشناخته"}`);
      }
    } catch (error) {
      toast.error("خطایی در ارتباط با سرور رخ داد.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 yekan">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">افزودن مقاله</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title" className="block text-sm font-medium text-gray-700">
                تیتر مقاله <span className="text-red-500">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="تیتر مقاله"
                value={form.title}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                اسلاگ (URL) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="slug"
                name="slug"
                placeholder="اسلاگ (url)"
                value={form.slug}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="image" className="block text-sm font-medium text-gray-700">
                لینک تصویر
              </Label>
              <div className="flex flex-col md:flex-row gap-4 items-end">
                <div className="flex-1 flex gap-2">
                  <Input
                    id="image"
                    name="image"
                    placeholder="لینک تصویر"
                    value={form.image}
                    onChange={handleChange}
                    className="mt-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={openUploadModal}
                    title="آپلود تصویر"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {form.image && (
                <div className="mt-2">
                  <img
                    src={form.image}
                    alt="پیش‌نمایش تصویر"
                    className="h-24 w-24 object-cover rounded border"
                    onError={() => toast.error("تصویر قابل نمایش نیست")}
                  />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="author" className="block text-sm font-medium text-gray-700">
                نویسنده
              </Label>
              <Input
                id="author"
                name="author"
                placeholder="نویسنده"
                value={form.author}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="tags" className="block text-sm font-medium text-gray-700">
                تگ‌ها (با کاما جدا شود)
              </Label>
              <Input
                id="tags"
                name="tags"
                placeholder="تگ‌ها (با کاما جدا شود)"
                value={form.tags}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="content" className="block text-sm font-medium text-gray-700">
                محتوا <span className="text-red-500">*</span>
              </Label>
              <Editor
                apiKey={process.env.TINY_KEY ? process.env.TINY_KEY  : "0nmwzbfoumioikgwvlx61cm3wkm7jzcko2c54ui40nc4850o"}
                value={form.content}
                onEditorChange={(newValue) => setForm({ ...form, content: newValue })}
             init={{
                height: 500,
                menubar: true,
                directionality: "rtl",
                language: "fa", // زبان فارسی
            plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
             toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
                content_style: "body { font-family: yekannew!important; font-size: 16px; direction: rtl; }",
              
              }}
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white disabled:bg-blue-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  در حال ذخیره...
                </>
              ) : (
                "ذخیره"
              )}
            </Button>
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
                آپلود تصویر مقاله
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div
                className="border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-lg p-6 text-center hover:border-purple-400 dark:hover:border-purple-500 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-700"
                onClick={() => document.getElementById("file-input-modal")?.click()}
              >
                <Upload className="mx-auto h-8 w-8 text-purple-500 mb-2" />
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  فایل‌ها را بکشید یا کلیک کنید
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
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white">فایل‌های انتخاب‌شده:</h3>
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
                        آپلود فایل ({files.length})
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-gray-800 dark:text-white">فایل‌های آپلود شده:</h3>
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
                    استفاده به عنوان تصویر مقاله
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
}