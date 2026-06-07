"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { Checkbox } from "@/Components/ui/checkbox";
import { Label } from "@/Components/ui/label";
import {
  Plus,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
  Upload,
  X,
  CheckCircle,
} from "lucide-react";
import { Brand, Category, Subcategory, SubcategoryItem } from "@/types/types";
import { API } from "@/lib/MainRoutes";
import { toast } from "react-hot-toast";
import { SITE } from "@/lib/MainRoutes";
import Image from "next/image";

interface VariantFormData {
  color_englishName: string;
  color_persianName: string;
  color_hexCode: string;
  price_single: string;
  price_wholesale: string;
  discount_percent: string;
  min_wholesale: string;
  in_stock: boolean;
  stock_quantity: string;
  image_main: string;
  images: string[];
  infotable: { name: string; value: string }[];
}

interface ProductFormData {
  brand_id: string;
  title: string;
  image: string;
  category: string;
  mothercatId: string;
  subcatId: string;
  itemId: string;
  rating: string;
  features: string;
  content: string;
  media: { type: string; src: string; thumbnail: string | null; alt: string }[];
  variants: VariantFormData[];
}

interface UploadedFile {
  url: string;
  name: string;
}

const AddProductPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState<ProductFormData>({
    brand_id: "",
    title: "",
    image: "",
    category: "",
    mothercatId: "",
    subcatId: "",
    itemId: "",
    rating: "0",
    features: "",
    content: "",
    media: [],
    variants: [],
  });

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [items, setItems] = useState<SubcategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    media: true,
    category: true,
    variants: true,
    additional: true,
  });

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadTarget, setUploadTarget] = useState<{
    type: "productImage" | "variantImage" | "variantGallery";
    variantIndex?: number;
  } | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const formatNumber = (value: string) => {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "نام محصول الزامی است";
    if (!formData.brand_id) newErrors.brand_id = "انتخاب برند الزامی است";
    if (!formData.mothercatId)
      newErrors.mothercatId = "دسته‌بندی اصلی الزامی است";
    if (!formData.subcatId) newErrors.subcatId = "زیرمجموعه الزامی است";
    if (!formData.itemId) newErrors.itemId = "آیتم زیرمجموعه الزامی است";
    if (!formData.image.trim()) newErrors.image = "تصویر اصلی محصول الزامی است";
    if (formData.variants.length === 0)
      newErrors.variants = "حداقل یک واریانت (رنگ) لازم است";

    formData.variants.forEach((variant, index) => {
      if (!variant.color_englishName.trim())
        newErrors[`variant_${index}_color_englishName`] =
          "نام انگلیسی رنگ الزامی است";
      if (!variant.color_hexCode.trim())
        newErrors[`variant_${index}_hex`] = "کد رنگ الزامی است";
      if (!variant.price_single.trim())
        newErrors[`variant_${index}_price_single`] = "قیمت تکی الزامی است";
      if (!variant.price_wholesale.trim())
        newErrors[`variant_${index}_price_wholesale`] = "قیمت عمده الزامی است";
      if (parseInt(variant.min_wholesale || "1", 10) < 1)
        newErrors[`variant_${index}_min_wholesale`] =
          "حداقل تعداد عمده باید حداقل ۱ باشد";
      if (parseInt(variant.stock_quantity || "0", 10) < 0)
        newErrors[`variant_${index}_stock`] = "موجودی نمی‌تواند منفی باشد";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    Promise.all([
      fetch(`/api/brands`).then((res) => res.json()),
      fetch(`/api/categories?mothercat=1`).then((res) => res.json()),
    ])
      .then(([brandsData, categoriesData]) => {
        setBrands(brandsData);
        setCategories(categoriesData);
      })
      .catch(() => toast.error("خطا در بارگذاری داده‌های اولیه"));
  }, []);

  // مقاوم‌سازی در برابر 404 یا خطا (مانند Edit)
  useEffect(() => {
    if (formData.mothercatId) {
      fetch(`/api/subcategories?category_id=${formData.mothercatId}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setSubcategories(Array.isArray(data) ? data : []))
        .catch(() => setSubcategories([]));
    } else {
      setSubcategories([]);
      setItems([]);
      setFormData((prev) => ({ ...prev, subcatId: "", itemId: "" }));
    }
  }, [formData.mothercatId]);

  useEffect(() => {
    if (formData.subcatId) {
      fetch(`/api/subcategory-items?subcategory_id=${formData.subcatId}`)
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => setItems(Array.isArray(data) ? data : []))
        .catch(() => setItems([]));
    } else {
      setItems([]);
      setFormData((prev) => ({ ...prev, itemId: "" }));
    }
  }, [formData.subcatId]);

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          color_englishName: "",
          color_persianName: "",
          color_hexCode: "#000000",
          price_single: "",
          price_wholesale: "",
          discount_percent: "0",
          min_wholesale: "1",
          in_stock: true,
          stock_quantity: "0",
          image_main: prev.image || "",
          images: [],
          infotable: [],
        },
      ],
    }));
  };

  const updateVariant = (
    index: number,
    field: keyof VariantFormData,
    value: any,
  ) => {
    setFormData((prev) => {
      const newVariants = [...prev.variants];
      newVariants[index] = { ...newVariants[index], [field]: value };

      if (field === "stock_quantity") {
        const qty = parseInt(value || "0", 10);
        newVariants[index].in_stock = qty > 0;
      }

      return { ...prev, variants: newVariants };
    });
  };

const removeVariant = (index: number) => {
  const isConfirmed = window.confirm("آیا مطمئن هستید که می‌خواهید این واریانت را حذف کنید؟");
  
  if (isConfirmed) {
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
    toast.success("واریانت با موفقیت حذف شد");
  }
};

  const addVariantInfo = (variantIndex: number) => {
    setFormData((prev) => {
      const newVariants = [...prev.variants];
      newVariants[variantIndex].infotable.push({ name: "", value: "" });
      return { ...prev, variants: newVariants };
    });
  };

  const updateVariantInfo = (
    variantIndex: number,
    infoIndex: number,
    field: "name" | "value",
    value: string,
  ) => {
    setFormData((prev) => {
      const newVariants = [...prev.variants];
      newVariants[variantIndex].infotable[infoIndex][field] = value;
      return { ...prev, variants: newVariants };
    });
  };

  const removeVariantInfo = (variantIndex: number, infoIndex: number) => {
    setFormData((prev) => {
      const newVariants = [...prev.variants];
      newVariants[variantIndex].infotable.splice(infoIndex, 1);
      return { ...prev, variants: newVariants };
    });
  };

  const openUploadModal = (
    type: "productImage" | "variantImage" | "variantGallery",
    variantIndex?: number,
  ) => {
    setUploadTarget({ type, variantIndex });
    setFiles([]);
    setPreviews({});
    setUploadedFiles([]);
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setUploadTarget(null);
  };

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []);
      setFiles((prev) => [...prev, ...selectedFiles]);
      selectedFiles.forEach((file) => {
        const url = URL.createObjectURL(file);
        setPreviews((prev) => ({ ...prev, [file.name]: url }));
      });
    },
    [],
  );

  const removeFile = (name: string) => {
    setFiles((prev) => prev.filter((f) => f.name !== name));
    if (previews[name]) URL.revokeObjectURL(previews[name]);
    setPreviews((prev) => {
      const newP = { ...prev };
      delete newP[name];
      return newP;
    });
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error("فایلی برای آپلود انتخاب نشده است");
      return;
    }
    setUploading(true);
    const promises = files.map(async (file) => {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/media", { method: "POST", body: fd });
        if (!res.ok) throw new Error("خطا در آپلود");
        const data = await res.json();
        return { url: SITE + data.url, name: file.name };
      } catch (err) {
        toast.error(`آپلود ${file.name} ناموفق بود`);
        return null;
      }
    });

    const results = await Promise.all(promises);
    const successful = results.filter(Boolean) as UploadedFile[];

    if (successful.length === 0) {
      toast.error("هیچ فایلی با موفقیت آپلود نشد");
      setUploading(false);
      return;
    }

    setUploadedFiles(successful);
    // مهم: بعد از آپلود موفق، فایل‌های انتخاب‌شده رو پاک کن تا تکراری نشه
    setFiles([]);
    setPreviews({});
    setUploading(false);
    toast.success(`${successful.length} فایل با موفقیت آپلود شد`);
  };

  const confirmUpload = () => {
    if (uploadedFiles.length === 0) {
      toast.error("هیچ فایلی آپلود نشده است. ابتدا آپلود کنید.");
      closeUploadModal();
      return;
    }

    let hasApplied = false;
    let allDuplicate = false;

    if (uploadTarget?.type === "productImage") {
      setFormData((prev) => ({ ...prev, image: uploadedFiles[0].url }));
      hasApplied = true;
    } else if (
      uploadTarget?.type === "variantImage" &&
      uploadTarget.variantIndex !== undefined
    ) {
      updateVariant(
        uploadTarget.variantIndex,
        "image_main",
        uploadedFiles[0].url,
      );
      hasApplied = true;
    } else if (
      uploadTarget?.type === "variantGallery" &&
      uploadTarget.variantIndex !== undefined
    ) {
      const urls = uploadedFiles.map((f) => f.url);

      setFormData((prev) => {
        const newVariants = [...prev.variants];
        const existingImages = newVariants[uploadTarget.variantIndex!].images;

        // تشخیص تکراری بودن همه عکس‌ها
        const uniqueNewUrls = urls.filter(
          (url) => !existingImages.includes(url),
        );

        if (uniqueNewUrls.length === 0) {
          allDuplicate = true;
          return prev; // هیچ تغییری نده
        }

        newVariants[uploadTarget.variantIndex!].images = [
          ...existingImages,
          ...uniqueNewUrls,
        ];
        return { ...prev, variants: newVariants };
      });

      hasApplied = true;
    }

    // مهم: toastها رو خارج از updater function فراخوانی کن
    if (hasApplied) {
      if (allDuplicate) {
        toast.success("همه عکس‌ها قبلاً اضافه شده‌اند");
      } else {
        toast.success(
          `عکس${uploadedFiles.length > 1 ? "ها" : ""} با موفقیت اعمال شدند`,
        );
      }
    }

    closeUploadModal();
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("لطفاً تمامی فیلدهای الزامی را پر کنید");
      return;
    }

    setLoading(true);
    try {
      const cleanedVariants = formData.variants.map((v) => ({
        color_englishName: v.color_englishName.trim(),
        color_persianName: v.color_persianName.trim() || null,
        color_hexCode: v.color_hexCode,
        price_single: parseInt(v.price_single.replace(/,/g, ""), 10),
        price_wholesale: parseInt(v.price_wholesale.replace(/,/g, ""), 10),
        discount_percent: parseInt(v.discount_percent || "0", 10),
        min_wholesale: parseInt(v.min_wholesale || "1", 10),
        in_stock: v.in_stock,
        stock_quantity: parseInt(v.stock_quantity || "0", 10),
        image_main: v.image_main.trim() || null,
        images: v.images.length > 0 ? v.images : null,
        infotable:
          v.infotable.length > 0
            ? v.infotable.filter((i) => i.name.trim() && i.value.trim())
            : null,
      }));

      const payload = {
        title: formData.title.trim(),
        brand_id: parseInt(formData.brand_id),
        image: formData.image.trim(),
        category: formData.category,
        mothercatId: parseInt(formData.mothercatId),
        subcatId: parseInt(formData.subcatId),
        itemId: parseInt(formData.itemId),
        rating: parseFloat(formData.rating) || 0,
        features: formData.features
          ? formData.features
              .split("\n")
              .map((f) => f.trim())
              .filter(Boolean)
          : null,
        content: formData.content.trim() || null,
        media: formData.media.length > 0 ? formData.media : null,
        variants: cleanedVariants,
      };

      const response = await fetch(`/api/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "خطا در ارتباط با سرور");
      }

      toast.success("محصول با موفقیت اضافه شد");
      router.push("/admindashboard/products");
    } catch (err: any) {
      toast.error(err.message || "خطا در افزودن محصول");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 yekan">
      <Card className="bg-white dark:bg-gray-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            افزودن محصول جدید
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* اطلاعات پایه */}
            <div className="border rounded-lg overflow-hidden">
              <div
                className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-700 cursor-pointer"
                onClick={() => toggleSection("basic")}
              >
                <h3 className="text-lg font-bold">اطلاعات پایه</h3>
                {expandedSections.basic ? <ChevronUp /> : <ChevronDown />}
              </div>
              {expandedSections.basic && (
                <div className="p-6 space-y-6">
                  <div>
                    <Label>نام محصول *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="نام محصول را وارد کنید"
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.title}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>توضیحات محصول</Label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      rows={6}
                      placeholder="توضیحات کامل محصول..."
                    />
                  </div>
                  <div>
                    <Label>ویژگی‌ها (هر خط یک ویژگی)</Label>
                    <Textarea
                      value={formData.features}
                      onChange={(e) =>
                        setFormData({ ...formData, features: e.target.value })
                      }
                      rows={5}
                      placeholder="مثال: ضدآب\nباتری قوی\n..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* تصویر اصلی محصول */}
            <div className="border rounded-lg overflow-hidden">
              <div
                className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-700 cursor-pointer"
                onClick={() => toggleSection("media")}
              >
                <h3 className="text-lg font-bold">
                  تصویر اصلی محصول (پیش‌فرض واریانت‌ها)
                </h3>
                {expandedSections.media ? <ChevronUp /> : <ChevronDown />}
              </div>
              {expandedSections.media && (
                <div className="p-6 space-y-6">
                  <div>
                    <Label>تصویر اصلی محصول *</Label>
                    <div className="flex gap-4 items-end">
                      <Input
                        value={formData.image}
                        onChange={(e) =>
                          setFormData({ ...formData, image: e.target.value })
                        }
                        placeholder="https://..."
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={() => openUploadModal("productImage")}
                      >
                        <Upload className="h-5 w-5" />
                      </Button>
                    </div>
                    {formData.image && (
                      <div className="mt-4">
                        <Image
                          width={160}
                          height={160}
                          src={formData.image}
                          alt="پیش‌نمایش تصویر اصلی"
                          className="h-48 rounded-lg border object-cover"
                          onError={() => toast.error("تصویر بارگذاری نشد")}
                        />
                      </div>
                    )}
                    {errors.image && (
                      <p className="text-red-500 text-sm mt-2">
                        {errors.image}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* دسته‌بندی */}
            <div className="border rounded-lg overflow-hidden">
              <div
                className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-700 cursor-pointer"
                onClick={() => toggleSection("category")}
              >
                <h3 className="text-lg font-bold">دسته‌بندی محصول</h3>
                {expandedSections.category ? <ChevronUp /> : <ChevronDown />}
              </div>
              {expandedSections.category && (
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <Label>دسته‌بندی اصلی *</Label>
                    <Select
                      value={formData.mothercatId}
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          mothercatId: v,
                          subcatId: "",
                          itemId: "",
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب کنید" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.mothercatId && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.mothercatId}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>زیرمجموعه *</Label>
                    <Select
                      value={formData.subcatId}
                      onValueChange={(v) =>
                        setFormData({ ...formData, subcatId: v, itemId: "" })
                      }
                      disabled={!formData.mothercatId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="ابتدا دسته اصلی را انتخاب کنید" />
                      </SelectTrigger>
                      <SelectContent>
                        {subcategories.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id.toString()}>
                            {sub.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.subcatId && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.subcatId}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>آیتم زیرمجموعه *</Label>
                    <Select
                      value={formData.itemId}
                      onValueChange={(v) =>
                        setFormData({ ...formData, itemId: v })
                      }
                      disabled={!formData.subcatId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="ابتدا زیرمجموعه را انتخاب کنید" />
                      </SelectTrigger>
                      <SelectContent>
                        {items.map((item) => (
                          <SelectItem key={item.id} value={item.id.toString()}>
                            {item.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.itemId && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.itemId}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* واریانت‌ها (رنگ‌ها) */}
            <div className="border rounded-lg overflow-hidden">
              <div
                className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-700 cursor-pointer"
                onClick={() => toggleSection("variants")}
              >
                <h3 className="text-lg font-bold">واریانت‌ها (رنگ‌ها)</h3>
                {expandedSections.variants ? <ChevronUp /> : <ChevronDown />}
              </div>
              {expandedSections.variants && (
                <div className="p-6 space-y-10">
                  {formData.variants.map((variant, vIndex) => (
                    <div
                      key={vIndex}
                      className="border-2 border-dashed border-purple-300 rounded-xl p-8 bg-purple-50 dark:bg-purple-900/20"
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h4 className="text-xl font-bold">
                          واریانت {vIndex + 1}:{" "}
                          {variant.color_persianName ||
                            variant.color_englishName ||
                            "جدید"}
                        </h4>
                        <Button
                          variant="destructive"
                          onClick={() => removeVariant(vIndex)}
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>

                      {/* رنگ */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div>
                          <Label>نام انگلیسی رنگ *</Label>
                          <Input
                            value={variant.color_englishName}
                            onChange={(e) =>
                              updateVariant(
                                vIndex,
                                "color_englishName",
                                e.target.value,
                              )
                            }
                            placeholder="مثال: red"
                          />
                        </div>
                        <div>
                          <Label>نام فارسی رنگ</Label>
                          <Input
                            value={variant.color_persianName}
                            onChange={(e) =>
                              updateVariant(
                                vIndex,
                                "color_persianName",
                                e.target.value,
                              )
                            }
                            placeholder="مثال: قرمز"
                          />
                        </div>
                        <div>
                          <Label>کد رنگ *</Label>
                          <div className="flex gap-3">
                            <Input
                              type="color"
                              value={variant.color_hexCode}
                              onChange={(e) =>
                                updateVariant(
                                  vIndex,
                                  "color_hexCode",
                                  e.target.value,
                                )
                              }
                              className="w-20 h-12"
                            />
                            <Input
                              value={variant.color_hexCode}
                              onChange={(e) =>
                                updateVariant(
                                  vIndex,
                                  "color_hexCode",
                                  e.target.value,
                                )
                              }
                              placeholder="#FF0000"
                            />
                          </div>
                        </div>
                      </div>

                      {/* قیمت و ... */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div>
                          <Label>قیمت تکی (تومان) *</Label>
                          <Input
                            value={variant.price_single}
                            onChange={(e) =>
                              updateVariant(
                                vIndex,
                                "price_single",
                                formatNumber(e.target.value.replace(/,/g, "")),
                              )
                            }
                            placeholder="1,200,000"
                          />
                        </div>
                        <div>
                          <Label>درصد تخفیف تکی</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={variant.discount_percent}
                            onChange={(e) =>
                              updateVariant(
                                vIndex,
                                "discount_percent",
                                e.target.value,
                              )
                            }
                          />

                          {variant.price_single &&
                            parseInt(variant.discount_percent) > 0 && (
                              <p className="text-xs text-green-600 mt-2 font-bold">
                                قیمت نهایی تکی:{" "}
                                {formatNumber(
                                  Math.round(
                                    parseInt(
                                      variant.price_single.replace(/,/g, ""),
                                    ) *
                                      (1 -
                                        parseInt(variant.discount_percent) /
                                          100),
                                  ).toString(),
                                )}{" "}
                                تومان
                              </p>
                            )}
                        </div>
                        <div>
                          <Label>قیمت عمده (تومان) *</Label>
                          <Input
                            value={variant.price_wholesale}
                            onChange={(e) =>
                              updateVariant(
                                vIndex,
                                "price_wholesale",
                                formatNumber(e.target.value.replace(/,/g, "")),
                              )
                            }
                            placeholder="1,000,000"
                          />
                        </div>
                        <div>
                          <Label>حداقل تعداد برای عمده *</Label>
                          <Input
                            type="number"
                            min="1"
                            value={variant.min_wholesale}
                            onChange={(e) =>
                              updateVariant(
                                vIndex,
                                "min_wholesale",
                                e.target.value,
                              )
                            }
                            placeholder="1"
                          />
                        </div>
                      </div>

                      {/* موجودی */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                        <div>
                          <Label>تعداد موجودی این رنگ</Label>
                          <Input
                            type="number"
                            min="0"
                            value={variant.stock_quantity}
                            onChange={(e) =>
                              updateVariant(
                                vIndex,
                                "stock_quantity",
                                e.target.value,
                              )
                            }
                            placeholder="0"
                          />
                          <p className="text-sm text-gray-600 mt-2">
                            {parseInt(variant.stock_quantity || "0") > 0
                              ? "موجود"
                              : "ناموجود (خودکار)"}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <Checkbox
                            checked={variant.in_stock}
                            onCheckedChange={(c) =>
                              updateVariant(vIndex, "in_stock", !!c)
                            }
                          />
                          <Label className="text-base">
                            این رنگ موجود است (خودکار بر اساس موجودی)
                          </Label>
                        </div>
                      </div>

                      {/* تصویر اصلی واریانت */}
                      <div className="mb-8">
                        <Label>تصویر اصلی این رنگ</Label>
                        <div className="flex gap-4 items-end">
                          <Input
                            value={variant.image_main}
                            onChange={(e) =>
                              updateVariant(
                                vIndex,
                                "image_main",
                                e.target.value,
                              )
                            }
                            placeholder="URL تصویر"
                            className="flex-1"
                          />
                          <Button
                            type="button"
                            onClick={() =>
                              openUploadModal("variantImage", vIndex)
                            }
                          >
                            <Upload className="h-5 w-5" />
                          </Button>
                        </div>
                        {variant.image_main && (
                          <Image
                            width={160}
                            height={160}
                            src={variant.image_main}
                            alt="تصویر واریانت"
                            className="mt-4 h-48 rounded-lg border object-cover"
                          />
                        )}
                      </div>

                      {/* گالری واریانت */}
                      <div className="mb-8">
                        <div className="flex justify-between items-center mb-4">
                          <Label className="text-lg">
                            گالری تصاویر این رنگ
                          </Label>
                          <Button
                            type="button"
                            onClick={() =>
                              openUploadModal("variantGallery", vIndex)
                            }
                          >
                            <Upload className="h-5 w-5 mr-2" /> آپلود گالری
                          </Button>
                        </div>
                        {variant.images.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {variant.images.map((img, i) => (
                              <div key={i} className="relative group">
                                <Image
                                  width={160}
                                  height={160}
                                  src={img}
                                  alt={`گالری ${i + 1}`}
                                  className="h-32 rounded border object-cover"
                                />
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100"
                                  onClick={() => {
                                    const newImages = variant.images.filter(
                                      (_, idx) => idx !== i,
                                    );
                                    updateVariant(vIndex, "images", newImages);
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* مشخصات فنی واریانت */}
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <Label className="text-lg">مشخصات فنی این رنگ</Label>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => addVariantInfo(vIndex)}
                          >
                            <Plus className="h-5 w-5 mr-2" /> افزودن مشخصه
                          </Button>
                        </div>
                        {variant.infotable.map((info, infoIndex) => (
                          <div
                            key={infoIndex}
                            className="flex gap-4 mb-4 items-center"
                          >
                            <Input
                              placeholder="نام مشخصه (مثال: وزن)"
                              value={info.name}
                              onChange={(e) =>
                                updateVariantInfo(
                                  vIndex,
                                  infoIndex,
                                  "name",
                                  e.target.value,
                                )
                              }
                              className="flex-1"
                            />
                            <Input
                              placeholder="مقدار (مثال: 180 گرم)"
                              value={info.value}
                              onChange={(e) =>
                                updateVariantInfo(
                                  vIndex,
                                  infoIndex,
                                  "value",
                                  e.target.value,
                                )
                              }
                              className="flex-1"
                            />
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() =>
                                removeVariantInfo(vIndex, infoIndex)
                              }
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    onClick={addVariant}
                    className="w-full text-lg py-6"
                  >
                    <Plus className="h-6 w-6 mr-3" /> افزودن واریانت جدید (رنگ)
                  </Button>
                  {errors.variants && (
                    <p className="text-red-500 text-center text-lg">
                      {errors.variants}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* سایر اطلاعات */}
            <div className="border rounded-lg overflow-hidden">
              <div
                className="flex justify-between items-center p-4 bg-gray-100 dark:bg-gray-700 cursor-pointer"
                onClick={() => toggleSection("additional")}
              >
                <h3 className="text-lg font-bold">سایر اطلاعات</h3>
                {expandedSections.additional ? <ChevronUp /> : <ChevronDown />}
              </div>
              {expandedSections.additional && (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>برند *</Label>
                    <Select
                      value={formData.brand_id}
                      onValueChange={(v) =>
                        setFormData({ ...formData, brand_id: v })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب برند" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((b) => (
                          <SelectItem key={b.id} value={b.id.toString()}>
                            {b.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.brand_id && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.brand_id}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label>امتیاز محصول (0 تا 5)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={(e) =>
                        setFormData({ ...formData, rating: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {/* دکمه‌ها */}
            <div className="flex gap-6 pt-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="flex-1 text-lg py-6"
              >
                بازگشت
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-lg py-6"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin mr-3" />
                    در حال افزودن محصول...
                  </>
                ) : (
                  "افزودن محصول"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* مودال آپلود */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-8 border-b">
              <h2 className="text-2xl font-bold text-center">آپلود فایل</h2>
            </div>
            <div className="p-8 space-y-8">
              <div
                className="border-4 border-dashed border-purple-400 rounded-2xl p-12 text-center cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/30 transition"
                onClick={() => document.getElementById("upload-input")?.click()}
              >
                <Upload className="h-16 w-16 mx-auto text-purple-600 mb-6" />
                <p className="text-xl font-bold">
                  فایل‌ها را اینجا بکشید یا کلیک کنید
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  حداکثر 10 مگابایت - تصاویر و ویدئو
                </p>
                <Input
                  id="upload-input"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {files.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-4">
                    فایل‌های انتخاب شده ({files.length})
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {files.map((file) => (
                      <div key={file.name} className="relative group">
                        <Image
                          width={160}
                          height={160}
                          src={previews[file.name]}
                          alt={file.name}
                          className="h-40 rounded-xl border-2 object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition"
                          onClick={() => removeFile(file.name)}
                        >
                          <X className="h-5 w-5" />
                        </Button>
                        <p className="text-center text-sm mt-2 truncate">
                          {file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full mt-6 text-lg py-6"
                  >
                    {uploading
                      ? "در حال آپلود..."
                      : `آپلود ${files.length} فایل`}
                  </Button>
                </div>
              )}

              {uploadedFiles.length > 0 && (
                <div>
                  <h3 className="text-xl font-bold mb-4">
                    فایل‌های آپلود شده ({uploadedFiles.length})
                  </h3>
                  <div className="grid grid-cols-3 md:grid-cols-5 gap-6">
                    {uploadedFiles.map((file) => (
                      <Image
                        width={160}
                        height={160}
                        key={file.name}
                        src={file.url}
                        alt={file.name}
                        className="h-32 rounded-xl border-2 object-cover"
                      />
                    ))}
                  </div>
                  <Button
                    onClick={confirmUpload}
                    className="w-full mt-6 bg-green-600 hover:bg-green-700 text-lg py-6"
                  >
                    <CheckCircle className="h-6 w-6 mr-3" /> تأیید و اعمال
                  </Button>
                </div>
              )}
            </div>
            <div className="p-8 border-t flex justify-end">
              <Button variant="outline" size="lg" onClick={closeUploadModal}>
                بستن
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddProductPage;
