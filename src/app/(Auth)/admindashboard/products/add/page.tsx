"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Checkbox } from "@/Components/ui/checkbox";
import { Label } from "@/Components/ui/label";
import { AlertCircle, Plus, Trash2, Loader2, ChevronDown, ChevronUp, Upload, X, Image as ImageIcon, CheckCircle } from "lucide-react"; 
import { Brand, Category, Subcategory } from "@/types/types";
import { API } from "@/lib/MainRoutes";
import { toast } from "react-hot-toast"; 
import { SITE } from "@/lib/MainRoutes";

interface ProductFormData {
  brand_id: string;
  title: string;
  image: string;
  originalPrice: string;
  discountedPrice: string;
  wholesalePrice: string;
  discountwholesalePrice: string;
  minwholesale: string;
  discount: string;
  discountwholesale: string;
  category: string;
  mothercatId: string;
  subcatId: string;
  rating: string;
  inStock: string;
  numericPrice: string;
  sales: string;
  features: string;
  content: string;
  infotable: { name: string; value: string }[];
  media: { type: string; src: string; thumbnail: string; alt: string }[];
  colors: { englishName: string; persianName: string; hexCode: string }[];
  hasDiscount: boolean;
  hasWholesaleDiscount: boolean;
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
    originalPrice: "",
    discountedPrice: "",
    wholesalePrice: "",
    discountwholesalePrice: "",
    minwholesale: "1",
    discount: "0",
    discountwholesale: "0",
    category: "",
    mothercatId: "",
    subcatId: "",
    rating: "0",
    inStock: "1",
    numericPrice: "0",
    sales: "0",
    features: "",
    content: "",
    infotable: [],
    media: [],
    colors: [],
    hasDiscount: false,
    hasWholesaleDiscount: false,
  });
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormData, string>>>({});
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    pricing: true,
    category: true,
    media: true,
    specs: true,
    colors: true,
    additional: true
  });
  // Modal state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<'image' | 'media' | null>(null);
  // States for upload modal
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // فرمت‌دهی اعداد
  const formatNumber = (value: string) => {
    return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // اعتبارسنجی فرم
  const validateForm = () => {
    const newErrors: Partial<Record<keyof ProductFormData, string>> = {};
    if (!formData.title) newErrors.title = "نام محصول الزامی است";
    if (!formData.brand_id) newErrors.brand_id = "انتخاب برند الزامی است";
    if (!formData.mothercatId) newErrors.mothercatId = "انتخاب دسته‌بندی اصلی الزامی است";
    if (!formData.subcatId) newErrors.subcatId = "انتخاب زیرمجموعه الزامی است";
    if (!formData.originalPrice) newErrors.originalPrice = "قیمت اصلی الزامی است";
    if (!formData.wholesalePrice) newErrors.wholesalePrice = "قیمت عمده الزامی است";
    if (!formData.image) newErrors.image = "آدرس تصویر الزامی است";
    if (formData.infotable.some((item) => !item.name || !item.value)) {
      newErrors.infotable = "تمامی مشخصات فنی باید پر شوند";
    }
    if (
      formData.media.some(
        (item) => !item.type || !item.src || !item.alt || !["image", "video"].includes(item.type)
      )
    ) {
      newErrors.media = "تمامی فیلدهای مدیا باید معتبر باشند";
    }
    if (formData.colors.some((item) => !item.englishName || !item.hexCode)) {
      newErrors.colors = "تمامی رنگ‌ها باید نام انگلیسی و کد هگز داشته باشند";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    fetch(`${API}/brands`)
      .then((res) => {
        if (!res.ok) throw new Error("خطا در دریافت برندها");
        return res.json();
      })
      .then((data: Brand[]) => setBrands(data))
      .catch((err) => toast.error("خطا در دریافت برندها"+err));
    fetch(`${API}/categories?mothercat=1`)
      .then((res) => {
        if (!res.ok) throw new Error("خطا در دریافت دسته‌بندی‌ها");
        return res.json();
      })
      .then((data: Category[]) => setCategories(data))
      .catch((err) => toast.error("خطا در دریافت دسته‌بندی‌ها"+err));
  }, []);

  useEffect(() => {
    if (formData.mothercatId) {
      fetch(`${API}/subcategories?category_id=${formData.mothercatId}`)
        .then((res) => {
          if (!res.ok) throw new Error("خطا در دریافت زیرمجموعه‌ها");
          return res.json();
        })
        .then((data: Subcategory[]) => setSubcategories(data))
        .catch((err) => toast.error("خطا در دریافت زیرمجموعه‌ها"+err));
    } else {
      setSubcategories([]);
    }
  }, [formData.mothercatId]);

  useEffect(() => {
    if (formData.originalPrice && formData.discount && formData.hasDiscount) {
      const original = parseFloat(formData.originalPrice.replace(/,/g, ""));
      const disc = parseFloat(formData.discount) || 0;
      const discounted = original * (1 - disc / 100);
      setFormData({
        ...formData,
        discountedPrice: formatNumber(discounted.toFixed(0)),
        numericPrice: discounted.toFixed(0),
      });
    } else {
      setFormData({
        ...formData,
        discountedPrice: formData.originalPrice,
        numericPrice: formData.originalPrice.replace(/,/g, ""),
      });
    }
  }, [formData.originalPrice, formData.discount, formData.hasDiscount]);

  useEffect(() => {
    if (formData.wholesalePrice && formData.discountwholesale && formData.hasWholesaleDiscount) {
      const wholesale = parseFloat(formData.wholesalePrice.replace(/,/g, ""));
      const disc = parseFloat(formData.discountwholesale) || 0;
      const discounted = wholesale * (1 - disc / 100);
      setFormData({
        ...formData,
        discountwholesalePrice: formatNumber(discounted.toFixed(0)),
      });
    } else {
      setFormData({
        ...formData,
        discountwholesalePrice: formData.wholesalePrice,
      });
    }
  }, [formData.wholesalePrice, formData.discountwholesale, formData.hasWholesaleDiscount]);

  const handleAddInfoTable = () => {
    setFormData({
      ...formData,
      infotable: [...formData.infotable, { name: "", value: "" }],
    });
  };

  const handleInfoTableChange = (index: number, field: "name" | "value", value: string) => {
    const newInfoTable = [...formData.infotable];
    newInfoTable[index][field] = value;
    setFormData({ ...formData, infotable: newInfoTable });
  };

  const handleRemoveInfoTable = (index: number) => {
    setFormData({
      ...formData,
      infotable: formData.infotable.filter((_, i) => i !== index),
    });
  };

  const handleAddMedia = () => {
    setFormData({
      ...formData,
      media: [...formData.media, { type: "image", src: "", thumbnail: "", alt: "" }],
    });
  };

  const handleMediaChange = (
    index: number,
    field: "type" | "src" | "thumbnail" | "alt",
    value: string
  ) => {
    const newMedia = [...formData.media];
    newMedia[index][field] = value;
    setFormData({ ...formData, media: newMedia });
  };

  const handleRemoveMedia = (index: number) => {
    setFormData({
      ...formData,
      media: formData.media.filter((_, i) => i !== index),
    });
  };

  const handleAddColor = () => {
    setFormData({
      ...formData,
      colors: [...formData.colors, { englishName: "", persianName: "", hexCode: "" }],
    });
  };

  const handleColorChange = (
    index: number,
    field: "englishName" | "persianName" | "hexCode",
    value: string
  ) => {
    const newColors = [...formData.colors];
    newColors[index][field] = value;
    setFormData({ ...formData, colors: newColors });
  };

  const handleRemoveColor = (index: number) => {
    setFormData({
      ...formData,
      colors: formData.colors.filter((_, i) => i !== index),
    });
  };

  // Upload modal handlers
  const openUploadModal = (type: 'image' | 'media') => {
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
    if (previews[fileName]) {
      URL.revokeObjectURL(previews[fileName]);
    }
  }, [previews]);

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
        toast.error(`خطا در آپلود ${file.name} `+error);
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
    if (uploadType === 'image') {
      // For main image, take the first uploaded file
      setFormData(prev => ({ ...prev, image: uploadedFiles[0].url }));
    } else if (uploadType === 'media') {
      // For media, add all uploaded files to media array
      const newMediaItems = uploadedFiles.map(file => {
        const mediaType = file.name.toLowerCase().match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' : 'video';
        const alt = file.name.replace(/\.[^/.]+$/, "");
        const thumbnail = mediaType === 'image' ? file.url : '';
        return { type: mediaType, src: file.url, thumbnail, alt };
      });
      setFormData(prev => ({ ...prev, media: [...prev.media, ...newMediaItems] }));
    }
    closeUploadModal();
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("لطفاً خطاهای فرم را برطرف کنید");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          brand_id: parseInt(formData.brand_id),
          image: formData.image,
          originalPrice: formData.originalPrice.replace(/,/g, ""),
          discountedPrice: formData.discountedPrice.replace(/,/g, ""),
          wholesalePrice: formData.wholesalePrice.replace(/,/g, ""),
          discountwholesalePrice: formData.discountwholesalePrice.replace(/,/g, ""),
          numericPrice: parseInt(formData.discountedPrice.replace(/,/g, "")) || 0,
          minwholesale: parseInt(formData.minwholesale) || 1,
          discount: formData.hasDiscount ? formData.discount : "0",
          discountwholesale: formData.hasWholesaleDiscount ? formData.discountwholesale : "0",
          category: formData.category,
          mothercatId: parseInt(formData.mothercatId),
          subcatId: parseInt(formData.subcatId),
          rating: parseFloat(formData.rating) || 0,
          inStock: parseInt(formData.inStock),
          sales: parseInt(formData.sales) || 0,
          features: formData.features
            ? JSON.stringify(formData.features.split("\n").filter((f: string) => f.trim()))
            : null,
          content: formData.content || null,
          infotable: formData.infotable.length > 0 ? formData.infotable : null,
          media: formData.media.length > 0 ? formData.media : null,
          colors: formData.colors.length > 0 ? formData.colors : null,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "خطا در افزودن محصول");
      }
      toast.success("محصول با موفقیت اضافه شد");
      router.push("/admindashboard/products");
    } catch (err) {
      toast.error(`خطا در افزودن محصول: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 yekan">
      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-2xl font-bold text-center">افزودن محصول جدید</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* اطلاعات پایه */}
            <div className="border rounded-lg overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 cursor-pointer"
                onClick={() => toggleSection('basic')}
              >
                <h3 className="text-lg font-semibold">اطلاعات پایه</h3>
                {expandedSections.basic ? <ChevronUp /> : <ChevronDown />}
              </div>
              {expandedSections.basic && (
                <div className="p-4 space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="title" className="mb-2 block">
                      نام محصول <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="title"
                      placeholder="نام محصول را وارد کنید"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                      aria-invalid={!!errors.title}
                      className={errors.title ? "border-red-500" : ""}
                    />
                    {errors.title && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 ml-1" />
                        {errors.title}
                      </p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="content">توضیحات</Label>
                    <Textarea
                      id="content"
                      placeholder="توضیحات محصول را وارد کنید"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="features">ویژگی‌ها (هر ویژگی در یک خط)</Label>
                    <Textarea
                      id="features"
                      placeholder="ویژگی‌ها را وارد کنید (هر ویژگی در یک خط)"
                      value={formData.features}
                      onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                      rows={3}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* قیمت‌گذاری */}
            <div className="border rounded-lg overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 cursor-pointer"
                onClick={() => toggleSection('pricing')}
              >
                <h3 className="text-lg font-semibold">قیمت‌گذاری</h3>
                {expandedSections.pricing ? <ChevronUp /> : <ChevronDown />}
              </div>
              {expandedSections.pricing && (
                <div className="p-4 space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="originalPrice" className="mb-2 block">
                      قیمت اصلی (تومان) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="originalPrice"
                      placeholder="مثال: 1,000,000"
                      value={formData.originalPrice}
                      onChange={(e) =>
                        setFormData({ ...formData, originalPrice: formatNumber(e.target.value.replace(/,/g, "")) })
                      }
                      required
                      aria-invalid={!!errors.originalPrice}
                      className={errors.originalPrice ? "border-red-500" : ""}
                    />
                    {errors.originalPrice && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 ml-1" />
                        {errors.originalPrice}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="wholesalePrice" className="mb-2 block">
                      قیمت عمده (تومان) <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="wholesalePrice"
                      placeholder="مثال: 900,000"
                      value={formData.wholesalePrice}
                      onChange={(e) =>
                        setFormData({ ...formData, wholesalePrice: formatNumber(e.target.value.replace(/,/g, "")) })
                      }
                      required
                      aria-invalid={!!errors.wholesalePrice}
                      className={errors.wholesalePrice ? "border-red-500" : ""}
                    />
                    {errors.wholesalePrice && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 ml-1" />
                        {errors.wholesalePrice}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 md:col-span-2">
                    <Checkbox
                      id="hasDiscount"
                      checked={formData.hasDiscount}
                      onCheckedChange={(checked: any) =>
                        setFormData({ ...formData, hasDiscount: !!checked, discount: checked ? formData.discount : "0" })
                      }
                    />
                    <Label htmlFor="hasDiscount">تخفیف دارد</Label>
                  </div>
                  {formData.hasDiscount && (
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="discount">درصد تخفیف تکی</Label>
                      <div className="flex gap-2">
                        <Input
                          id="discount"
                          type="number"
                          placeholder="مثال: 10"
                          value={formData.discount}
                          onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                          required
                          min="0"
                          max="100"
                          className="flex-1"
                        />
                        <div className="bg-muted rounded-md px-3 py-2 text-sm flex items-center min-w-[120px]">
                          قیمت نهایی: {formData.discountedPrice} تومان
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 md:col-span-2">
                    <Checkbox
                      id="hasWholesaleDiscount"
                      checked={formData.hasWholesaleDiscount}
                      onCheckedChange={(checked: any) =>
                        setFormData({
                          ...formData,
                          hasWholesaleDiscount: !!checked,
                          discountwholesale: checked ? formData.discountwholesale : "0",
                        })
                      }
                    />
                    <Label htmlFor="hasWholesaleDiscount">تخفیف عمده دارد</Label>
                  </div>
                  {formData.hasWholesaleDiscount && (
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="discountwholesale">درصد تخفیف عمده</Label>
                      <div className="flex gap-2">
                        <Input
                          id="discountwholesale"
                          type="number"
                          placeholder="مثال: 15"
                          value={formData.discountwholesale}
                          onChange={(e) => setFormData({ ...formData, discountwholesale: e.target.value })}
                          required
                          min="0"
                          max="100"
                          className="flex-1"
                        />
                        <div className="bg-muted rounded-md px-3 py-2 text-sm flex items-center min-w-[120px]">
                          قیمت عمده: {formData.discountwholesalePrice} تومان
                        </div>
                      </div>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="minwholesale">حداقل تعداد عمده</Label>
                    <Input
                      id="minwholesale"
                      type="number"
                      placeholder="مثال: 10"
                      value={formData.minwholesale}
                      onChange={(e) => setFormData({ ...formData, minwholesale: e.target.value })}
                      min="1"
                      required
                    />
                  </div>
                </div>
              )}
            </div>
            {/* تصویر و مدیا */}
            <div className="border rounded-lg overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 cursor-pointer"
                onClick={() => toggleSection('media')}
              >
                <h3 className="text-lg font-semibold">تصویر و مدیا</h3>
                {expandedSections.media ? <ChevronUp /> : <ChevronDown />}
              </div>
              {expandedSections.media && (
                <div className="p-4 space-y-4">
                  <div>
                    <Label htmlFor="image" className="mb-2 block">
                      آدرس تصویر اصلی <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                      <div className="flex-1 flex gap-2">
                        <Input
                          id="image"
                          placeholder="https://example.com/image.jpg"
                          value={formData.image}
                          onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                          required
                          aria-invalid={!!errors.image}
                          className={errors.image ? "border-red-500" : ""}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => openUploadModal('image')}
                          title="آپلود تصویر"
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                      </div>
                      {errors.image && (
                        <p className="text-red-500 text-sm mt-1 flex items-center">
                          <AlertCircle className="h-4 w-4 ml-1" />
                          {errors.image}
                        </p>
                      )}
                    </div>
                    {formData.image && (
                      <div className="mt-2">
                        <img
                          src={formData.image}
                          alt="پیش‌نمایش تصویر"
                          className="h-24 w-24 object-cover rounded border"
                          onError={() => toast.error("تصویر قابل نمایش نیست")}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => openUploadModal('media')}
                      className="flex items-center"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      آپلود مدیا
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Label>گالری تصاویر محصول (مدیاهای اضافه‌شده)</Label>
                    {formData.media.map((item, index) => (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center p-3 border rounded-md">
                        <div className="md:col-span-2">
                          <Select
                            value={item.type}
                            onValueChange={(value: string) => handleMediaChange(index, "type", value)}
                            required
                          >
                            <SelectTrigger className="text-xs">
                              <SelectValue placeholder="نوع مدیا" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="image">تصویر</SelectItem>
                              <SelectItem value="video">ویدئو</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-3">
                          <Input
                            placeholder="آدرس مدیا"
                            value={item.src}
                            onChange={(e) => handleMediaChange(index, "src", e.target.value)}
                            required
                            className="text-xs"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <Input
                            placeholder="آدرس تصویر کوچک (اختیاری)"
                            value={item.thumbnail}
                            onChange={(e) => handleMediaChange(index, "thumbnail", e.target.value)}
                            className="text-xs"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <Input
                            placeholder="توضیحات (alt)"
                            value={item.alt}
                            onChange={(e) => handleMediaChange(index, "alt", e.target.value)}
                            required
                            className="text-xs"
                          />
                        </div>
                        <div className="md:col-span-1 flex justify-center">
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => handleRemoveMedia(index)}
                            className="h-8 w-8"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        {item.src && (
                          <div className="md:col-span-12 mt-2">
                            <img
                              src={item.src}
                              alt={item.alt}
                              className="h-16 w-16 object-cover rounded border ml-2"
                              onError={() => toast.error("مدیا قابل نمایش نیست")}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                    {errors.media && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 ml-1" />
                        {errors.media}
                      </p>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddMedia}
                      className="flex items-center mt-2"
                    >
                      <Plus className="h-4 w-4 ml-2" />
                      افزودن مدیا دستی
                    </Button>
                  </div>
                </div>
              )}
            </div>
            {/* دسته‌بندی */}
            <div className="border rounded-lg overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 cursor-pointer"
                onClick={() => toggleSection('category')}
              >
                <h3 className="text-lg font-semibold">دسته‌بندی</h3>
                {expandedSections.category ? <ChevronUp /> : <ChevronDown />}
              </div>
              {expandedSections.category && (
                <div className="p-4 space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="mothercatId" className="mb-2 block">
                      دسته‌بندی اصلی <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.mothercatId}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, mothercatId: value, subcatId: "", category: "" })
                      }
                      required
                    >
                      <SelectTrigger id="mothercatId" className={errors.mothercatId ? "border-red-500" : ""}>
                        <SelectValue placeholder="انتخاب دسته‌بندی اصلی" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id.toString()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.mothercatId && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 ml-1" />
                        {errors.mothercatId}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="subcatId" className="mb-2 block">
                      زیرمجموعه <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.subcatId}
                      onValueChange={(value: string) =>
                        setFormData({
                          ...formData,
                          subcatId: value,
                          category: subcategories.find((s) => s.id === parseInt(value))?.name || "",
                        })
                      }
                      required
                      disabled={!formData.mothercatId}
                    >
                      <SelectTrigger id="subcatId" className={errors.subcatId ? "border-red-500" : ""}>
                        <SelectValue placeholder="انتخاب زیرمجموعه" />
                      </SelectTrigger>
                      <SelectContent>
                        {subcategories.map((subcat) => (
                          <SelectItem key={subcat.id} value={subcat.id.toString()}>
                            {subcat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.subcatId && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 ml-1" />
                        {errors.subcatId}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* مشخصات فنی */}
            <div className="border rounded-lg overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 cursor-pointer"
                onClick={() => toggleSection('specs')}
              >
                <h3 className="text-lg font-semibold">مشخصات فنی</h3>
                {expandedSections.specs ? <ChevronUp /> : <ChevronDown />}
              </div>
              {expandedSections.specs && (
                <div className="p-4 space-y-4">
                  {formData.infotable.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                      <div className="md:col-span-5">
                        <Input
                          placeholder="نام مشخصه"
                          value={item.name}
                          onChange={(e) => handleInfoTableChange(index, "name", e.target.value)}
                          required
                        />
                      </div>
                      <div className="md:col-span-5">
                        <Input
                          placeholder="مقدار مشخصه"
                          value={item.value}
                          onChange={(e) => handleInfoTableChange(index, "value", e.target.value)}
                          required
                        />
                      </div>
                      <div className="md:col-span-2 flex justify-center">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => handleRemoveInfoTable(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {errors.infotable && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 ml-1" />
                      {errors.infotable}
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddInfoTable}
                    className="flex items-center"
                  >
                    <Plus className="h-4 w-4 ml-2" />
                    افزودن مشخصه
                  </Button>
                </div>
              )}
            </div>

            {/* رنگ‌ها */}
            <div className="border rounded-lg overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 cursor-pointer"
                onClick={() => toggleSection('colors')}
              >
                <h3 className="text-lg font-semibold">رنگ‌ها</h3>
                {expandedSections.colors ? <ChevronUp /> : <ChevronDown />}
              </div>
              {expandedSections.colors && (
                <div className="p-4 space-y-4">
                  {formData.colors.map((item, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center p-3 border rounded-md">
                      <div className="md:col-span-3">
                        <Input
                          placeholder="نام انگلیسی (مثال: red)"
                          value={item.englishName}
                          onChange={(e) => handleColorChange(index, "englishName", e.target.value)}
                          required
                          className="text-sm"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <Input
                          placeholder="نام فارسی (مثال: قرمز)"
                          value={item.persianName}
                          onChange={(e) => handleColorChange(index, "persianName", e.target.value)}
                          className="text-sm"
                        />
                      </div>
                      <div className="md:col-span-3">
                        <Input
                          type="color"
                          value={item.hexCode}
                          onChange={(e) => handleColorChange(index, "hexCode", e.target.value)}
                          required
                          className="h-10 w-full"
                        />
                        <Input
                          placeholder="#FF0000"
                          value={item.hexCode}
                          onChange={(e) => handleColorChange(index, "hexCode", e.target.value)}
                          className="mt-1 text-sm"
                        />
                      </div>
                      <div className="md:col-span-3 flex justify-center">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          onClick={() => handleRemoveColor(index)}
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {errors.colors && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="h-4 w-4 ml-1" />
                      {errors.colors}
                    </p>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddColor}
                    className="flex items-center"
                  >
                    <Plus className="h-4 w-4 ml-2" />
                    افزودن رنگ
                  </Button>
                </div>
              )}
            </div>

            {/* سایر اطلاعات */}
            <div className="border rounded-lg overflow-hidden">
              <div 
                className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-700 cursor-pointer"
                onClick={() => toggleSection('additional')}
              >
                <h3 className="text-lg font-semibold">سایر اطلاعات</h3>
                {expandedSections.additional ? <ChevronUp /> : <ChevronDown />}
              </div>
              {expandedSections.additional && (
                <div className="p-4 space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="brand_id" className="mb-2 block">
                      برند <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.brand_id}
                      onValueChange={(value: any) => setFormData({ ...formData, brand_id: value })}
                      required
                    >
                      <SelectTrigger id="brand_id" className={errors.brand_id ? "border-red-500" : ""}>
                        <SelectValue placeholder="انتخاب برند" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id.toString()}>
                            {brand.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.brand_id && (
                      <p className="text-red-500 text-sm mt-1 flex items-center">
                        <AlertCircle className="h-4 w-4 ml-1" />
                        {errors.brand_id}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="inStock">وضعیت موجودی</Label>
                    <Select
                      value={formData.inStock}
                      onValueChange={(value: any) => setFormData({ ...formData, inStock: value })}
                      required
                    >
                      <SelectTrigger id="inStock">
                        <SelectValue placeholder="وضعیت موجودی" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">موجود</SelectItem>
                        <SelectItem value="0">ناموجود</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="rating">امتیاز (0-5)</Label>
                    <Input
                      id="rating"
                      type="number"
                      placeholder="مثال: 4.5"
                      value={formData.rating}
                      onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                      min="0"
                      max="5"
                      step="0.1"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4">
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
                className="flex-1 bg-green-600 hover:bg-green-700 flex items-center justify-center"
                disabled={loading}
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    در حال افزودن...
                  </>
                ) : (
                  "افزودن محصول"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                {uploadType === 'image' ? <ImageIcon className="h-5 w-5" /> : <Upload className="h-5 w-5" />}
                آپلود {uploadType === 'image' ? 'تصویر اصلی' : 'مدیا'}
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
                  حداکثر 10 مگابایت (تصاویر، ویدیوها)
                </p>
                <Input
                  id="file-input-modal"
                  type="file"
                  multiple
                  accept="image/*,video/*"
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
                      <div key={file.name} className="relative bg-white dark:bg-gray-800 rounded-lg overflow-hidden group">
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
                        آپلود فایل‌ها ({files.length})
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
                      <div key={file.name} className="relative bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center">
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
                    {uploadType === 'image' ? 'استفاده به عنوان تصویر اصلی' : 'اضافه کردن به مدیا'}
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

export default AddProductPage;