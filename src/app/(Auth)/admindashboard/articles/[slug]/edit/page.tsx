"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { API } from "@/lib/MainRoutes";
import { Editor } from "@tinymce/tinymce-react";

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug;
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    fetch(`${API}/articles/${slug}`)
      .then(res => res.json())
      .then(data => setForm(data));
  }, [slug]);

  if (!form) return <div>در حال بارگذاری...</div>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch(`${API}/articles/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      router.push("/admindashboard/articles");
    } else {
      alert("خطا در ویرایش مقاله");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ویرایش مقاله</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input name="title" value={form.title} onChange={handleChange} required />
          <Input name="slug" value={form.slug} onChange={handleChange} required />
          <Input name="image" value={form.image || ""} onChange={handleChange} />
          <Input name="author" value={form.author || ""} onChange={handleChange} />
          <Input name="tags" value={form.tags || ""} onChange={handleChange} />

          <Editor
            apiKey="no-api-key"
            value={form.content}
            onEditorChange={(newValue) => setForm({ ...form, content: newValue })}
            init={{
              height: 400,
              menubar: false,
              directionality: "rtl",
              plugins: [
                "advlist autolink lists link image charmap preview anchor",
                "searchreplace visualblocks code fullscreen",
                "insertdatetime media table paste code help wordcount"
              ],
              toolbar:
                "undo redo | formatselect | bold italic underline | \
                alignleft aligncenter alignright alignjustify | \
                bullist numlist outdent indent | link image | removeformat | help",
            }}
          />

          <Button type="submit" className="bg-green-500 hover:bg-green-600 text-white">بروزرسانی</Button>
        </form>
      </CardContent>
    </Card>
  );
}
