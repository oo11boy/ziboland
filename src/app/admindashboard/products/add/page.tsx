// app/admindashboard/products/add/page.tsx (Updated with Persian)
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/Components/ui/button";

import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Input } from "@/Components/ui/input";
import { Textarea } from '@/Components/ui/textarea'
import { API } from "@/lib/MainRoutes";

const AddProductPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    brand: "",
    description: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch(`${API}/products`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...formData, price: parseFloat(formData.price) }),
    });
    router.push("/admindashboard/products");
  };

  return (
    <div className="max-w-md mx-auto">
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle>افزودن محصول جدید</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="نام محصول"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <Input
              type="number"
              placeholder="قیمت"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              required
            />
            <Input
              placeholder="دسته‌بندی"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
            />
            <Input
              placeholder="برند"
              value={formData.brand}
              onChange={(e) =>
                setFormData({ ...formData, brand: e.target.value })
              }
              required
            />
            <Textarea
              placeholder="توضیحات"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
            />
            <Button
              type="submit"
              className="w-full bg-blue-500 hover:bg-blue-600"
            >
              افزودن محصول
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProductPage;
