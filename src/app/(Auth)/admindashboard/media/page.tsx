"use client";

import { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Upload, X, Image as ImageIcon, CheckCircle, Loader2, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { SITE } from "@/lib/MainRoutes";

interface UploadedFile {
  url: string;
  name: string;
}

const MediaPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<UploadedFile | null>(null);

  // 📌 گرفتن لیست فایل‌های قبلی
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch("/api/media");
        if (!res.ok) throw new Error("خطا در دریافت فایل‌ها");
        const data = await res.json();
        setUploadedFiles(data.files || []);
      } catch (err) {
        toast.error("خطا در بارگذاری فایل‌ها");
      }
    };
    fetchFiles();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selectedFiles]);
    selectedFiles.forEach((file) => {
      const previewUrl = URL.createObjectURL(file);
      setPreviews((prev) => ({ ...prev, [file.name]: previewUrl }));
    });
  }, []);

  const removeFile = useCallback((fileName: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== fileName));
    setPreviews((prev) => {
      const newPreviews = { ...prev };
      delete newPreviews[fileName];
      return newPreviews;
    });
    URL.revokeObjectURL(previews[fileName] || "");
  }, [previews]);

  const handleUpload = useCallback(async () => {
    if (files.length === 0) return;
    setUploading(true);
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res = await fetch("/api/media", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("خطا در آپلود");
        const data = await res.json();
        return { url: data.url, name: file.name };
      } catch (error) {
        toast.error(`خطا در آپلود ${file.name}`);
        return null;
      }
    });
    const results = await Promise.all(uploadPromises);
    const successful = results.filter(Boolean) as UploadedFile[];
    setUploadedFiles((prev) => [...successful, ...prev]);
    setFiles([]);
    setPreviews({});
    setUploading(false);
    toast.success(`${successful.length} فایل با موفقیت آپلود شد`);
  }, [files]);

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      const res = await fetch("/api/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: confirmDelete.url }),
      });
      if (!res.ok) throw new Error("خطا در حذف فایل");
      setUploadedFiles((prev) => prev.filter((f) => f.url !== confirmDelete.url));
      toast.success("فایل حذف شد");
    } catch {
      toast.error("خطا در حذف فایل");
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div className="space-y-6 px-2 md:px-6">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white mb-4">
        کتابخانه رسانه
      </h1>

      {/* Upload Section */}
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900 dark:to-indigo-900 shadow-xl rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
            <Upload className="h-6 w-6" />
            آپلود رسانه جدید
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div
            className="border-2 border-dashed border-purple-300 dark:border-purple-600 rounded-2xl p-8 text-center hover:border-purple-400 dark:hover:border-purple-500 transition-colors cursor-pointer bg-white dark:bg-gray-800"
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <Upload className="mx-auto h-12 w-12 text-purple-500 mb-4" />
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-200 mb-2">
              فایل‌ها را بکشید یا کلیک کنید
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              حداکثر 10 مگابایت برای هر فایل (تصاویر، ویدیوها و...)
            </p>
            <Input
              id="file-input"
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Selected Files Preview */}
          {files.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">فایل‌های انتخاب‌شده:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {files.map((file) => (
                  <div key={file.name} className="relative bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden group">
                    <img
                      src={previews[file.name] || ""}
                      alt={file.name}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-red-500"
                        onClick={() => removeFile(file.name)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="p-2 text-xs text-gray-600 dark:text-gray-300 truncate text-right">
                      {file.name}
                    </p>
                  </div>
                ))}
              </div>
              <Button
                onClick={handleUpload}
                disabled={uploading || files.length === 0}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all duration-300"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    در حال آپلود...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    آپلود فایل‌ها ({files.length})
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
          <CardHeader>
            <CardTitle className="text-xl md:text-2xl flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              فایل‌های آپلود شده
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 rounded-xl p-3 text-center shadow-md hover:shadow-lg transition-all">
                  <img
                    src={file.url}
                    alt={file.name}
                    className="w-full h-24 object-cover rounded-lg mb-2"
                  />
                  <p className="text-xs text-gray-700 dark:text-gray-300 truncate">
                    {file.name}
                  </p>
                  <div className="mt-2 flex justify-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-600"
                      onClick={() => navigator.clipboard.writeText(SITE+'/'+ file.url)}
                    >
                      کپی URL
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-600"
                      onClick={() => setConfirmDelete(file)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">آیا مطمئن هستید؟</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              این فایل برای همیشه حذف خواهد شد: <br /> 
              <span className="font-mono text-xs">{confirmDelete.name}</span>
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfirmDelete(null)}>انصراف</Button>
              <Button className="bg-red-600 text-white hover:bg-red-700" onClick={handleDelete}>
                حذف فایل
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MediaPage;
