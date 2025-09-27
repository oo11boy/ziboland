"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { API } from "@/lib/MainRoutes";
import { Editor } from "@tinymce/tinymce-react";
import { toast } from "react-hot-toast"; // برای نمایش پیام‌های اطلاع‌رسانی

export default function AddArticlePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    image: "",
    author: "",
    tags: "",
  });
  const [isLoading, setIsLoading] = useState(false); // برای مدیریت وضعیت لودینگ

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // اعتبارسنجی ساده
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
          tags: form.tags.split(",").map((tag) => tag.trim()), // تبدیل تگ‌ها به آرایه
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
    <Card className="max-w-4xl mx-auto yekan">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">افزودن مقاله</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">تیتر مقاله</label>
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
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">اسلاگ (URL)</label>
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
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">لینک تصویر</label>
            <Input
              id="image"
              name="image"
              placeholder="لینک تصویر"
              value={form.image}
              onChange={handleChange}
              className="mt-1"
            />
          </div>

          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700">نویسنده</label>
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
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700">تگ‌ها (با کاما جدا شود)</label>
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
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">محتوا</label>
            <Editor
              apiKey="5kozx5x8g9baw4r6kzplxy823yuwnq80gb7coiu263qxf6j8"
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
            {isLoading ? "در حال ذخیره..." : "ذخیره"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}