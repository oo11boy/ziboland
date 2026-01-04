"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
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

interface VariantFormData {
  id?: number;
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
  id: number;
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

const EditProductPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [formData, setFormData] = useState<ProductFormData>({
    id: parseInt(id),
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
  const [loading, setLoading] = useState(true);
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
    if (!formData.mothercatId) newErrors.mothercatId = "دسته‌بندی اصلی الزامی است";
    if (!formData.subcatId) newErrors.subcatId = "زیرمجموعه الزامی است";
    if (!formData.itemId) newErrors.itemId = "آیتم زیرمجموعه الزامی است";
    if (!formData.image.trim()) newErrors.image = "تصویر اصلی محصول الزامی است";
    if (formData.variants.length === 0) newErrors.variants = "حداقل یک واریانت (رنگ) لازم است";

    formData.variants.forEach((variant, index) => {
      if (!variant.color_englishName.trim())
        newErrors[`variant_${index}_color_englishName`] = "نام انگلیسی رنگ الزامی است";
      if (!variant.color_hexCode.trim())
        newErrors[`variant_${index}_hex`] = "کد رنگ الزامی است";
      if (!variant.price_single.trim())
        newErrors[`variant_${index}_price_single`] = "قیمت تکی الزامی است";
      if (!variant.price_wholesale.trim())
        newErrors[`variant_${index}_price_wholesale`] = "قیمت عمده الزامی است";
      if (parseInt(variant.min_wholesale || "1", 10) < 1)
        newErrors[`variant_${index}_min_wholesale`] = "حداقل تعداد عمده باید حداقل ۱ باشد";
      if (parseInt(variant.stock_quantity || "0", 10) < 0)
        newErrors[`variant_${index}_stock`] = "موجودی نمی‌تواند منفی باشد";
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    fetch(`${API}/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("خطا در دریافت محصول");
        return res.json();
      })
      .then((data) => {
        setFormData({
          id: data.id,
          brand_id: data.brandDetails?.id?.toString() || "",
          title: data.title || "",
          image: data.image || "",
          category: data.category || "",
          mothercatId: data.mothercatId?.toString() || "",
          subcatId: data.subcatId?.toString() || "",
          itemId: data.itemId?.toString() || "",
          rating: data.rating?.toString() || "0",
          features: data.features ? data.features.join("\n") : "",
          content: data.content || "",
          media: data.media || [],
          variants:
            data.variants?.map((v: any) => ({
              id: v.id,
              color_englishName: v.color_englishName || "",
              color_persianName: v.color_persianName || "",
              color_hexCode: v.color_hexCode || "#000000",
              price_single: formatNumber(v.price_single?.toString() || ""),
              price_wholesale: formatNumber(v.price_wholesale?.toString() || ""),
              discount_percent: v.discount_percent?.toString() || "0",
              discount_wholesale_percent: v.discount_wholesale_percent?.toString() || "0",
              min_wholesale: v.min_wholesale?.toString() || "1",
              in_stock: v.in_stock ?? true,
              stock_quantity: v.stock_quantity?.toString() || "0",
              image_main: v.image_main || "",
              images: v.images || [],
              infotable: v.infotable || [],
            })) || [],
        });
        setLoading(false);
      })
      .catch((err) => {
        toast.error("خطا در بارگذاری محصول");
        console.error(err);
        setLoading(false);
      });

    Promise.all([
      fetch(`${API}/brands`).then((res) => res.json()),
      fetch(`${API}/categories?mothercat=1`).then((res) => res.json()),
    ])
      .then(([brandsData, categoriesData]) => {
        setBrands(brandsData);
        setCategories(categoriesData);
      })
      .catch(() => toast.error("خطا در بارگذاری داده‌های اولیه"));
  }, [id]);

  useEffect(() => {
    if (formData.mothercatId) {
      fetch(`${API}/subcategories?category_id=${formData.mothercatId}`)
        .then((res) => res.json())
        .then((data: Subcategory[]) => setSubcategories(data))
        .catch(() => setSubcategories([]));
    } else {
      setSubcategories([]);
      setFormData((prev) => ({ ...prev, subcatId: "", itemId: "" }));
    }
  }, [formData.mothercatId]);

  useEffect(() => {
    if (formData.subcatId) {
      fetch(`${API}/subcategory-items?subcategory_id=${formData.subcatId}`)
        .then((res) => res.json())
        .then((data: SubcategoryItem[]) => setItems(data))
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
          discount_wholesale_percent: "0",
          min_wholesale: "1",
          in_stock: true,
          stock_quantity: "0",
          image_main: prev.image,
          images: [],
          infotable: [],
        },
      ],
    }));
  };

  const updateVariant = (index: number, field: keyof VariantFormData, value: any) => {
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
    setFormData((prev) => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }));
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
    value: string
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
    variantIndex?: number
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
    []
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
    if (files.length === 0) return;
    setUploading(true);
    const promises = files.map(async (file) => {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/media", { method: "POST", body: fd });
        if (!res.ok) throw new Error("خطا");
        const data = await res.json();
        return { url: SITE + data.url, name: file.name };
      } catch {
        toast.error(`آپلود ${file.name} ناموفق بود`);
        return null;
      }
    });
    const results = await Promise.all(promises);
    const successful = results.filter(Boolean) as UploadedFile[];
    setUploadedFiles(successful);
    setFiles([]);
    setPreviews({});
    setUploading(false);
    toast.success(`${successful.length} فایل با موفقیت آپلود شد`);
  };

  const confirmUpload = () => {
    if (uploadedFiles.length === 0) {
      toast.error("هیچ فایلی آپلود نشده است");
      return;
    }

    if (uploadTarget?.type === "productImage") {
      setFormData((prev) => ({ ...prev, image: uploadedFiles[0].url }));
    } else if (uploadTarget?.type === "variantImage" && uploadTarget.variantIndex !== undefined) {
      updateVariant(uploadTarget.variantIndex, "image_main", uploadedFiles[0].url);
    } else if (uploadTarget?.type === "variantGallery" && uploadTarget.variantIndex !== undefined) {
      const urls = uploadedFiles.map((f) => f.url);
      setFormData((prev) => {
        const newVariants = [...prev.variants];
        newVariants[uploadTarget.variantIndex!].images = [
          ...newVariants[uploadTarget.variantIndex!].images,
          ...urls,
        ];
        return { ...prev, variants: newVariants };
      });
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
        id: v.id,
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
          ? formData.features.split("\n").map((f) => f.trim()).filter(Boolean)
          : null,
        content: formData.content.trim() || null,
        media: formData.media.length > 0 ? formData.media : null,
        variants: cleanedVariants,
      };

      const response = await fetch(`${API}/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "خطا در ارتباط با سرور");
      }

      toast.success("محصول با موفقیت بروزرسانی شد");
      router.push("/admindashboard/products");
    } catch (err: any) {
      toast.error(err.message || "خطا در بروزرسانی محصول");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8 text-center yekan">
        <Loader2 className="h-12 w-12 animate-spin mx-auto text-purple-600" />
        <p className="mt-6 text-xl">در حال بارگذاری محصول...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 yekan">
      <Card className="bg-white dark:bg-gray-800 shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-xl">
          <CardTitle className="text-3xl text-center py-4">ویرایش محصول</CardTitle>
        </CardHeader>
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* اطلاعات پایه */}
            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <div
                className="flex justify-between items-center p-6 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                onClick={() => toggleSection("basic")}
              >
                <h3 className="text-2xl font-bold">اطلاعات پایه</h3>
                {expandedSections.basic ? <ChevronUp className="h-8 w-8" /> : <ChevronDown className="h-8 w-8" />}
              </div>
              {expandedSections.basic && (
                <div className="p-8 space-y-8">
                  <div>
                    <Label className="text-lg">نام محصول *</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="نام محصول را وارد کنید"
                      className="text-lg py-6"
                    />
                    {errors.title && <p className="text-red-500 text-sm mt-2">{errors.title}</p>}
                  </div>
                  <div>
                    <Label className="text-lg">توضیحات محصول</Label>
                    <Textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={8}
                      placeholder="توضیحات کامل و جذاب محصول را بنویسید..."
                      className="text-lg"
                    />
                  </div>
                  <div>
                    <Label className="text-lg">ویژگی‌ها (هر خط یک ویژگی)</Label>
                    <Textarea
                      value={formData.features}
                      onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                      rows={6}
                      placeholder="مثال:\nضدآب\nباتری قوی\nدوربین 108 مگاپیکسل"
                      className="text-lg"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* تصویر اصلی محصول */}
            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <div
                className="flex justify-between items-center p-6 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                onClick={() => toggleSection("media")}
              >
                <h3 className="text-2xl font-bold">تصویر اصلی محصول (پیش‌فرض واریانت‌ها)</h3>
                {expandedSections.media ? <ChevronUp className="h-8 w-8" /> : <ChevronDown className="h-8 w-8" />}
              </div>
              {expandedSections.media && (
                <div className="p-8 space-y-8">
                  <div>
                    <Label className="text-xl">تصویر اصلی محصول *</Label>
                    <div className="flex gap-6 items-end">
                      <Input
                        value={formData.image}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="https://example.com/image.jpg"
                        className="text-lg py-7 flex-1"
                      />
                      <Button type="button" size="lg" onClick={() => openUploadModal("productImage")}>
                        <Upload className="h-8 w-8" />
                      </Button>
                    </div>
                    {formData.image && (
                      <div className="mt-8">
                        <img
                          src={formData.image}
                          alt="پیش‌نمایش تصویر اصلی"
                          className="max-h-96 rounded-xl border-4 object-contain mx-auto"
                          onError={() => toast.error("تصویر بارگذاری نشد")}
                        />
                      </div>
                    )}
                    {errors.image && <p className="text-red-500 text-lg mt-4">{errors.image}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* دسته‌بندی */}
            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <div
                className="flex justify-between items-center p-6 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                onClick={() => toggleSection("category")}
              >
                <h3 className="text-2xl font-bold">دسته‌بندی محصول</h3>
                {expandedSections.category ? <ChevronUp className="h-8 w-8" /> : <ChevronDown className="h-8 w-8" />}
              </div>
              {expandedSections.category && (
                <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <Label className="text-xl">دسته‌بندی اصلی *</Label>
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
                      <SelectTrigger className="text-lg py-7">
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
                    {errors.mothercatId && <p className="text-red-500 text-sm mt-2">{errors.mothercatId}</p>}
                  </div>
                  <div>
                    <Label className="text-xl">زیرمجموعه *</Label>
                    <Select
                      value={formData.subcatId}
                      onValueChange={(v) => setFormData({ ...formData, subcatId: v, itemId: "" })}
                      disabled={!formData.mothercatId}
                    >
                      <SelectTrigger className="text-lg py-7">
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
                    {errors.subcatId && <p className="text-red-500 text-sm mt-2">{errors.subcatId}</p>}
                  </div>
                  <div>
                    <Label className="text-xl">آیتم زیرمجموعه *</Label>
                    <Select
                      value={formData.itemId}
                      onValueChange={(v) => setFormData({ ...formData, itemId: v })}
                      disabled={!formData.subcatId || items.length === 0}
                    >
                      <SelectTrigger className="text-lg py-7">
                        <SelectValue
                          placeholder={
                            !formData.subcatId
                              ? "ابتدا زیرمجموعه را انتخاب کنید"
                              : items.length === 0
                              ? "هیچ آیتمی موجود نیست"
                              : "یک آیتم انتخاب کنید"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {items.length > 0 ? (
                          items.map((item) => (
                            <SelectItem key={item.id} value={item.id.toString()}>
                              {item.name}
                            </SelectItem>
                          ))
                        ) : (
                          <div className="py-2 px-4 text-sm text-gray-500 text-center">
                            هیچ آیتمی برای این زیرمجموعه موجود نیست
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    {errors.itemId && <p className="text-red-500 text-sm mt-2">{errors.itemId}</p>}
                  </div>
                </div>
              )}
            </div>

            {/* واریانت‌ها (رنگ‌ها) */}
            <div className="border-2 border-purple-300 dark:border-purple-700 rounded-xl overflow-hidden">
              <div
                className="flex justify-between items-center p-6 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 cursor-pointer hover:opacity-90 transition"
                onClick={() => toggleSection("variants")}
              >
                <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                  واریانت‌ها (رنگ‌ها)
                </h3>
                {expandedSections.variants ? <ChevronUp className="h-8 w-8" /> : <ChevronDown className="h-8 w-8" />}
              </div>
              {expandedSections.variants && (
                <div className="p-8 space-y-12">
                  {formData.variants.map((variant, vIndex) => (
                    <div
                      key={vIndex}
                      className="border-4 border-purple-400 dark:border-purple-600 rounded-2xl p-10 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 shadow-xl"
                    >
                      <div className="flex justify-between items-center mb-8">
                        <h4 className="text-2xl font-bold text-purple-800 dark:text-purple-200">
                          واریانت {vIndex + 1}: {variant.color_persianName || variant.color_englishName || "جدید"}
                        </h4>
                        <Button variant="destructive" size="lg" onClick={() => removeVariant(vIndex)}>
                          <Trash2 className="h-8 w-8" />
                        </Button>
                      </div>

                      {/* رنگ */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                        <div>
                          <Label className="text-xl">نام انگلیسی رنگ *</Label>
                          <Input
                            value={variant.color_englishName}
                            onChange={(e) => updateVariant(vIndex, "color_englishName", e.target.value)}
                            placeholder="مثال: red"
                            className="text-lg py-7"
                          />
                        </div>
                        <div>
                          <Label className="text-xl">نام فارسی رنگ</Label>
                          <Input
                            value={variant.color_persianName}
                            onChange={(e) => updateVariant(vIndex, "color_persianName", e.target.value)}
                            placeholder="مثال: قرمز"
                            className="text-lg py-7"
                          />
                        </div>
                        <div>
                          <Label className="text-xl">کد رنگ *</Label>
                          <div className="flex gap-4">
                            <Input
                              type="color"
                              value={variant.color_hexCode}
                              onChange={(e) => updateVariant(vIndex, "color_hexCode", e.target.value)}
                              className="w-32 h-16"
                            />
                            <Input
                              value={variant.color_hexCode}
                              onChange={(e) => updateVariant(vIndex, "color_hexCode", e.target.value)}
                              placeholder="#FF0000"
                              className="flex-1 text-lg py-7"
                            />
                          </div>
                        </div>
                      </div>

                      {/* قیمت، تخفیف و حداقل عمده */}
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-10">
                        <div>
                          <Label className="text-xl">قیمت تکی (تومان) *</Label>
                          <Input
                            value={variant.price_single}
                            onChange={(e) =>
                              updateVariant(vIndex, "price_single", formatNumber(e.target.value.replace(/,/g, "")))
                            }
                            placeholder="1,200,000"
                            className="text-xl py-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xl">قیمت عمده (تومان) *</Label>
                          <Input
                            value={variant.price_wholesale}
                            onChange={(e) =>
                              updateVariant(vIndex, "price_wholesale", formatNumber(e.target.value.replace(/,/g, "")))
                            }
                            placeholder="1,000,000"
                            className="text-xl py-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xl">حداقل تعداد برای عمده *</Label>
                          <Input
                            type="number"
                            min="1"
                            value={variant.min_wholesale}
                            onChange={(e) => updateVariant(vIndex, "min_wholesale", e.target.value)}
                            placeholder="1"
                            className="text-xl py-8"
                          />
                        </div>
                        <div>
                          <Label className="text-xl">درصد تخفیف تکی</Label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={variant.discount_percent}
                            onChange={(e) => updateVariant(vIndex, "discount_percent", e.target.value)}
                            className="text-xl py-8"
                          />
                        </div>
                 
                      </div>

                      {/* موجودی */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                        <div>
                          <Label className="text-xl">تعداد موجودی این رنگ</Label>
                          <Input
                            type="number"
                            min="0"
                            value={variant.stock_quantity}
                            onChange={(e) => updateVariant(vIndex, "stock_quantity", e.target.value)}
                            className="text-xl py-8"
                          />
                          <p className="text-sm text-gray-600 mt-2">
                            {parseInt(variant.stock_quantity || "0") > 0 ? "موجود" : "ناموجود"}
                          </p>
                        </div>
                        <div className="flex items-center gap-6">
                          <Checkbox
                            checked={variant.in_stock}
                            onCheckedChange={(c) => updateVariant(vIndex, "in_stock", !!c)}
                            className="h-8 w-8"
                          />
                          <Label className="text-2xl">این رنگ موجود است (خودکار بر اساس موجودی)</Label>
                        </div>
                      </div>

                      {/* تصویر اصلی واریانت */}
                      <div className="mb-10">
                        <Label className="text-xl">تصویر اصلی این رنگ</Label>
                        <div className="flex gap-6 items-end">
                          <Input
                            value={variant.image_main}
                            onChange={(e) => updateVariant(vIndex, "image_main", e.target.value)}
                            placeholder="https://..."
                            className="flex-1 text-lg py-7"
                          />
                          <Button type="button" size="lg" onClick={() => openUploadModal("variantImage", vIndex)}>
                            <Upload className="h-8 w-8" />
                          </Button>
                        </div>
                        {variant.image_main && (
                          <div className="mt-8">
                            <img
                              src={variant.image_main}
                              alt="تصویر واریانت"
                              className="max-h-96 rounded-xl border-4 object-contain mx-auto"
                            />
                          </div>
                        )}
                      </div>

                      {/* گالری واریانت */}
                      <div className="mb-10">
                        <div className="flex justify-between items-center mb-6">
                          <Label className="text-2xl">گالری تصاویر این رنگ</Label>
                          <Button type="button" size="lg" onClick={() => openUploadModal("variantGallery", vIndex)}>
                            <Upload className="h-8 w-8 mr-4" /> آپلود گالری
                          </Button>
                        </div>
                        {variant.images.length > 0 && (
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {variant.images.map((img, i) => (
                              <div key={i} className="relative group">
                                <img
                                  src={img}
                                  alt={`گالری ${i + 1}`}
                                  className="h-48 rounded-xl border-4 object-cover"
                                />
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition"
                                  onClick={() => {
                                    const newImages = variant.images.filter((_, idx) => idx !== i);
                                    updateVariant(vIndex, "images", newImages);
                                  }}
                                >
                                  <X className="h-6 w-6" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* مشخصات فنی واریانت */}
                      <div>
                        <div className="flex justify-between items-center mb-6">
                          <Label className="text-2xl">مشخصات فنی این رنگ</Label>
                          <Button type="button" variant="outline" size="lg" onClick={() => addVariantInfo(vIndex)}>
                            <Plus className="h-8 w-8 mr-4" /> افزودن مشخصه
                          </Button>
                        </div>
                        {variant.infotable.map((info, infoIndex) => (
                          <div key={infoIndex} className="flex gap-6 mb-6 items-center">
                            <Input
                              placeholder="نام مشخصه (مثال: وزن)"
                              value={info.name}
                              onChange={(e) => updateVariantInfo(vIndex, infoIndex, "name", e.target.value)}
                              className="flex-1 text-lg py-7"
                            />
                            <Input
                              placeholder="مقدار (مثال: 180 گرم)"
                              value={info.value}
                              onChange={(e) => updateVariantInfo(vIndex, infoIndex, "value", e.target.value)}
                              className="flex-1 text-lg py-7"
                            />
                            <Button
                              variant="destructive"
                              size="lg"
                              onClick={() => removeVariantInfo(vIndex, infoIndex)}
                            >
                              <Trash2 className="h-8 w-8" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    onClick={addVariant}
                    className="w-full text-2xl py-10 bg-purple-600 hover:bg-purple-700"
                  >
                    <Plus className="h-10 w-10 mr-6" /> افزودن واریانت جدید (رنگ)
                  </Button>
                  {errors.variants && <p className="text-red-600 text-center text-2xl">{errors.variants}</p>}
                </div>
              )}
            </div>

            {/* سایر اطلاعات */}
            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <div
                className="flex justify-between items-center p-6 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                onClick={() => toggleSection("additional")}
              >
                <h3 className="text-2xl font-bold">سایر اطلاعات</h3>
                {expandedSections.additional ? <ChevronUp className="h-8 w-8" /> : <ChevronDown className="h-8 w-8" />}
              </div>
              {expandedSections.additional && (
                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <Label className="text-xl">برند *</Label>
                    <Select
                      value={formData.brand_id}
                      onValueChange={(v) => setFormData({ ...formData, brand_id: v })}
                    >
                      <SelectTrigger className="text-lg py-7">
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
                    {errors.brand_id && <p className="text-red-500 text-sm mt-2">{errors.brand_id}</p>}
                  </div>
                  <div>
                    <Label className="text-xl">امتیاز محصول (0 تا 5)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      className="text-xl py-7"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* دکمه‌های نهایی */}
            <div className="flex gap-8 pt-12">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => router.back()}
                className="flex-1 text-2xl py-10"
              >
                بازگشت
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-2xl py-10"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-10 w-10 animate-spin mr-6" />
                    در حال ذخیره تغییرات...
                  </>
                ) : (
                  "بروزرسانی محصول"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* مودال آپلود */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-6">
          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-3xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
            <div className="p-10 border-b-2 border-gray-200 dark:border-gray-700">
              <h2 className="text-3xl font-bold text-center">آپلود فایل</h2>
            </div>
            <div className="p-10 space-y-10">
              <div
                className="border-4 border-dashed border-purple-500 rounded-3xl p-16 text-center cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/30 transition"
                onClick={() => document.getElementById("upload-input")?.click()}
              >
                <Upload className="h-20 w-20 mx-auto text-purple-600 mb-8" />
                <p className="text-2xl font-bold mb-4">فایل‌ها را اینجا بکشید یا کلیک کنید</p>
                <p className="text-lg text-gray-600 dark:text-gray-400">حداکثر 10 مگابایت - تصاویر و ویدئو</p>
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
                  <h3 className="text-2xl font-bold mb-6 text-center">فایل‌های انتخاب شده ({files.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {files.map((file) => (
                      <div key={file.name} className="relative group">
                        <img
                          src={previews[file.name]}
                          alt={file.name}
                          className="h-48 rounded-2xl border-4 object-cover"
                        />
                        <Button
                          variant="destructive"
                          size="icon"
                          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition"
                          onClick={() => removeFile(file.name)}
                        >
                          <X className="h-8 w-8" />
                        </Button>
                        <p className="text-center text-lg mt-4 truncate">{file.name}</p>
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleUpload} disabled={uploading} className="w-full mt-10 text-2xl py-10">
                    {uploading ? (
                      <>
                        <Loader2 className="h-10 w-10 animate-spin mr-6" />
                        در حال آپلود...
                      </>
                    ) : (
                      `آپلود ${files.length} فایل`
                    )}
                  </Button>
                </div>
              )}

              {uploadedFiles.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-6 text-center">فایل‌های آپلود شده ({uploadedFiles.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                    {uploadedFiles.map((file) => (
                      <img
                        key={file.name}
                        src={file.url}
                        alt={file.name}
                        className="h-40 rounded-2xl border-4 object-cover"
                      />
                    ))}
                  </div>
                  <Button onClick={confirmUpload} className="w-full mt-10 bg-green-600 hover:bg-green-700 text-2xl py-10">
                    <CheckCircle className="h-10 w-10 mr-6" />
                    تأیید و اعمال به فرم
                  </Button>
                </div>
              )}
            </div>
            <div className="p-10 border-t-2 border-gray-200 dark:border-gray-700 flex justify-end">
              <Button variant="outline" size="lg" onClick={closeUploadModal} className="text-xl px-12 py-8">
                بستن
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProductPage;