"use client";
import { useState, useEffect, useCallback } from "react";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/Components/ui/card";
import { Textarea } from "@/Components/ui/textarea";
import { toast } from "react-toastify";
import { 
  Loader2, 
  Save, 
  Plus, 
  Trash2, 
  MoveUp, 
  MoveDown,
  Upload,
  X,
  Image as ImageIcon,
  CheckCircle,
  Phone
} from "lucide-react";
import Image from "next/image";

interface SocialLink {
  id?: number;
  title: string;
  icon: string;
  link: string;
  order: number;
  is_active: boolean;
}

interface PhoneNumber {
  id?: number;
  number: string;
  label: string;
  is_active: boolean;
  order: number;
}

interface UploadedFile {
  url: string;
  name: string;
}

export default function SettingsPage() {
  const [form, setForm] = useState({
    site_name: "",
    site_description: "",
    site_icon: "",
    email: "",
    phone_numbers: [] as PhoneNumber[],
    address: "",
    working_hours: "",
    working_days: "",
    social_links: [] as SocialLink[],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State برای آپلود تصویر
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadType, setUploadType] = useState<'site_icon' | 'social_icon'>('site_icon');
  const [uploadTargetIndex, setUploadTargetIndex] = useState<number>(-1);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ [key: string]: string }>({});
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  // شماره‌های تلفن پیش‌فرض
  const defaultPhoneNumbers: PhoneNumber[] = [
    { number: "", label: "دفتر مرکزی", is_active: true, order: 0 },
    { number: "", label: "پشتیبانی", is_active: true, order: 1 },
  ];

  // شبکه‌های اجتماعی پیش‌فرض
  const defaultSocialLinks: SocialLink[] = [
    { title: "تلگرام", icon: "", link: "", order: 0, is_active: true },
    { title: "واتساپ", icon: "", link: "", order: 1, is_active: true },
    { title: "اینستاگرام", icon: "", link: "", order: 2, is_active: true },
  ];

  // دریافت تنظیمات
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`/api/settings`);
      if (!res.ok) throw new Error("خطا در دریافت تنظیمات");
      const data = await res.json();
      
      // پردازش social_links
      let socialLinks = data.social_links || [];
      if (socialLinks.length === 0) {
        socialLinks = defaultSocialLinks;
      } else {
        const existingTitles = socialLinks.map((link: SocialLink) => link.title);
        for (const defaultLink of defaultSocialLinks) {
          if (!existingTitles.includes(defaultLink.title)) {
            socialLinks.push(defaultLink);
          }
        }
        socialLinks = socialLinks.map((link: SocialLink, index: number) => ({
          ...link,
          order: index
        }));
      }
      
      // پردازش phone_numbers
      let phoneNumbers = data.phone_numbers || [];
      if (phoneNumbers.length === 0) {
        phoneNumbers = defaultPhoneNumbers;
      } else {
        phoneNumbers = phoneNumbers.map((phone: PhoneNumber, index: number) => ({
          ...phone,
          order: index
        }));
      }
      
      setForm({
        ...data,
        social_links: socialLinks,
        phone_numbers: phoneNumbers
      });
    } catch (err) {
      toast.error("❌ خطا در دریافت تنظیمات: " + err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // توابع مدیریت شماره تلفن
  const handlePhoneChange = (index: number, field: keyof PhoneNumber, value: any) => {
    const updatedPhones = [...form.phone_numbers];
    updatedPhones[index] = { ...updatedPhones[index], [field]: value };
    setForm({ ...form, phone_numbers: updatedPhones });
  };

  const addPhoneNumber = () => {
    const newPhone: PhoneNumber = {
      number: "",
      label: "",
      is_active: true,
      order: form.phone_numbers.length,
    };
    setForm({ ...form, phone_numbers: [...form.phone_numbers, newPhone] });
  };

  const removePhoneNumber = (index: number) => {
    if (form.phone_numbers.length <= 1) {
      toast.warning("❌ حداقل یک شماره تلفن باید وجود داشته باشد");
      return;
    }
    const updatedPhones = form.phone_numbers.filter((_, i) => i !== index);
    updatedPhones.forEach((phone, i) => phone.order = i);
    setForm({ ...form, phone_numbers: updatedPhones });
  };

  const movePhoneNumber = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === form.phone_numbers.length - 1)
    ) {
      return;
    }
    
    const updatedPhones = [...form.phone_numbers];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [updatedPhones[index], updatedPhones[newIndex]] = [updatedPhones[newIndex], updatedPhones[index]];
    updatedPhones.forEach((phone, i) => phone.order = i);
    setForm({ ...form, phone_numbers: updatedPhones });
  };

  // توابع مدیریت شبکه‌های اجتماعی
  const handleSocialLinkChange = (index: number, field: keyof SocialLink, value: any) => {
    const updatedLinks = [...form.social_links];
    updatedLinks[index] = { ...updatedLinks[index], [field]: value };
    setForm({ ...form, social_links: updatedLinks });
  };

  const addSocialLink = () => {
    const newLink: SocialLink = {
      title: "",
      icon: "",
      link: "",
      order: form.social_links.length,
      is_active: true,
    };
    setForm({ ...form, social_links: [...form.social_links, newLink] });
  };

  const removeSocialLink = (index: number) => {
    const title = form.social_links[index].title;
    if (["تلگرام", "واتساپ", "اینستاگرام"].includes(title)) {
      toast.warning("❌ نمی‌توانید شبکه‌های اجتماعی اصلی را حذف کنید");
      return;
    }
    
    const updatedLinks = form.social_links.filter((_, i) => i !== index);
    updatedLinks.forEach((link, i) => link.order = i);
    setForm({ ...form, social_links: updatedLinks });
  };

  const moveSocialLink = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === form.social_links.length - 1)
    ) {
      return;
    }
    
    const updatedLinks = [...form.social_links];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [updatedLinks[index], updatedLinks[newIndex]] = [updatedLinks[newIndex], updatedLinks[index]];
    updatedLinks.forEach((link, i) => link.order = i);
    setForm({ ...form, social_links: updatedLinks });
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
      if (previews[fileName]) URL.revokeObjectURL(previews[fileName]);
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
        return { url: data.url, name: file.name };
      } catch (error) {
        toast.error(`❌ خطا در آپلود ${file.name}`);
        return null;
      }
    });

    const results = await Promise.all(uploadPromises);
    const successful = results.filter(Boolean) as UploadedFile[];
    setUploadedFiles(successful);
    setFiles([]);
    setPreviews({});
    setUploading(false);

    if (successful.length > 0) {
      toast.success(`✅ ${successful.length} فایل با موفقیت آپلود شد`);
    }
  }, [files]);

  const openUploadModal = (type: 'site_icon' | 'social_icon', index?: number) => {
    setUploadType(type);
    setUploadTargetIndex(index ?? -1);
    setFiles([]);
    setPreviews({});
    setUploadedFiles([]);
    setShowUploadModal(true);
  };

  const handleConfirmUpload = () => {
    if (uploadedFiles.length === 0) {
      toast.error("❌ هیچ فایلی آپلود نشده است");
      return;
    }

    const imageUrl = uploadedFiles[0].url;

    if (uploadType === 'site_icon') {
      setForm((prev) => ({ ...prev, site_icon: imageUrl }));
    } else if (uploadType === 'social_icon' && uploadTargetIndex >= 0) {
      const updatedLinks = [...form.social_links];
      updatedLinks[uploadTargetIndex] = {
        ...updatedLinks[uploadTargetIndex],
        icon: imageUrl
      };
      setForm((prev) => ({ ...prev, social_links: updatedLinks }));
    }

    setShowUploadModal(false);
    toast.success("✅ تصویر با موفقیت انتخاب شد");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // اعتبارسنجی شماره‌های تلفن
      const invalidPhones = form.phone_numbers.filter(p => p.is_active && !p.number.trim());
      if (invalidPhones.length > 0) {
        toast.error("❌ لطفاً شماره تلفن‌های فعال را تکمیل کنید");
        setSaving(false);
        return;
      }

      const res = await fetch(`/api/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("خطا در ذخیره تنظیمات");
      toast.success("✅ تنظیمات با موفقیت ذخیره شد");
    } catch (err) {
      toast.error("❌ خطا در ذخیره تنظیمات: " + err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
        <span className="mr-2 text-gray-600 dark:text-gray-300">
          در حال بارگذاری...
        </span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-2xl">
        <CardHeader className="border-b border-gray-100 dark:border-gray-700 mb-4 pb-4">
          <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
            ⚙️ تنظیمات فروشگاه
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* نام سایت */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                نام سایت
              </label>
              <Input
                name="site_name"
                value={form.site_name}
                onChange={handleChange}
                placeholder="مثلاً فروشگاه زیبا‌لند"
                className="mt-1"
              />
            </div>

            {/* توضیحات سایت */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                توضیحات سایت
              </label>
              <Textarea
                name="site_description"
                value={form.site_description}
                onChange={handleChange}
                placeholder="توضیح کوتاه درباره فروشگاه شما..."
                rows={3}
                className="mt-1"
              />
            </div>

            {/* آیکون سایت با دکمه آپلود */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                آیکون سایت
              </label>
              <div className="flex gap-3 mt-1">
                <Input
                  name="site_icon"
                  value={form.site_icon}
                  onChange={handleChange}
                  placeholder="https://example.com/icon.png"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => openUploadModal('site_icon')}
                  title="آپلود آیکون"
                  className="shrink-0"
                >
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              {form.site_icon && (
                <div className="mt-3">
                  <Image
                    width={80}
                    height={80}
                    src={form.site_icon}
                    alt="آیکون سایت"
                    className="w-20 h-20 object-contain rounded-lg border shadow-sm"
                    onError={() => toast.error("❌ تصویر قابل نمایش نیست")}
                  />
                </div>
              )}
            </div>

            {/* شماره‌های تلفن - جدید */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  شماره‌های تماس
                </label>
                <Button
                  type="button"
                  onClick={addPhoneNumber}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm"
                >
                  <Plus className="w-4 h-4 ml-1" />
                  افزودن شماره
                </Button>
              </div>

              {form.phone_numbers.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                  هیچ شماره تلفنی اضافه نشده است
                </p>
              ) : (
                <div className="space-y-3">
                  {form.phone_numbers.map((phone, index) => (
                    <div
                      key={index}
                      className="flex flex-wrap items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                    >
                      <div className="flex items-center gap-2">
                        <Button
                          type="button"
                          onClick={() => movePhoneNumber(index, 'up')}
                          disabled={index === 0}
                          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                        >
                          <MoveUp className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          onClick={() => movePhoneNumber(index, 'down')}
                          disabled={index === form.phone_numbers.length - 1}
                          className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                        >
                          <MoveDown className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="flex-1 min-w-[120px]">
                        <Input
                          value={phone.label}
                          onChange={(e) => handlePhoneChange(index, 'label', e.target.value)}
                          placeholder="برچسب (مثال: پشتیبانی)"
                          className="mb-1"
                        />
                      </div>

                      <div className="flex-1 min-w-[150px]">
                        <Input
                          value={phone.number}
                          onChange={(e) => handlePhoneChange(index, 'number', e.target.value)}
                          placeholder="شماره تلفن (مثال: 02196520)"
                          dir="ltr"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600 dark:text-gray-400">
                          فعال:
                        </label>
                        <input
                          type="checkbox"
                          checked={phone.is_active}
                          onChange={(e) => handlePhoneChange(index, 'is_active', e.target.checked)}
                          className="w-4 h-4"
                        />
                      </div>

                      <Button
                        type="button"
                        onClick={() => removePhoneNumber(index)}
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg"
                        disabled={form.phone_numbers.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                * حداقل یک شماره تلفن باید وجود داشته باشد
              </p>
            </div>

            {/* شبکه‌های اجتماعی */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  شبکه‌های اجتماعی
                </label>
                <Button
                  type="button"
                  onClick={addSocialLink}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg text-sm"
                >
                  <Plus className="w-4 h-4 ml-1" />
                  افزودن شبکه جدید
                </Button>
              </div>

              {form.social_links.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
                  هیچ شبکه اجتماعی اضافه نشده است
                </p>
              ) : (
                <div className="space-y-3">
                  {form.social_links.map((link, index) => {
                    const isMainSocial = ["تلگرام", "واتساپ", "اینستاگرام"].includes(link.title);
                    return (
                      <div
                        key={index}
                        className="flex flex-wrap items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50"
                      >
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            onClick={() => moveSocialLink(index, 'up')}
                            disabled={index === 0}
                            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                          >
                            <MoveUp className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            onClick={() => moveSocialLink(index, 'down')}
                            disabled={index === form.social_links.length - 1}
                            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                          >
                            <MoveDown className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex-1 min-w-[120px]">
                          <Input
                            value={link.title}
                            onChange={(e) => handleSocialLinkChange(index, 'title', e.target.value)}
                            placeholder="عنوان"
                            className="mb-1"
                            disabled={isMainSocial}
                          />
                        </div>

                        <div className="flex-1 min-w-[150px]">
                          <div className="flex gap-2">
                            <Input
                              value={link.icon}
                              onChange={(e) => handleSocialLinkChange(index, 'icon', e.target.value)}
                              placeholder="آدرس آیکون"
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => openUploadModal('social_icon', index)}
                              title="آپلود آیکون"
                              className="shrink-0"
                            >
                              <Upload className="h-4 w-4" />
                            </Button>
                          </div>
                          {link.icon && (
                            <div className="flex items-center gap-2 mt-1">
                              <img
                                src={link.icon}
                                alt={link.title}
                                className="w-6 h-6 object-contain"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                              <span className="text-xs text-gray-500">پیش‌نمایش</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-[150px]">
                          <Input
                            value={link.link}
                            onChange={(e) => handleSocialLinkChange(index, 'link', e.target.value)}
                            placeholder="لینک (مثال: https://t.me/...)"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-600 dark:text-gray-400">
                            فعال:
                          </label>
                          <input
                            type="checkbox"
                            checked={link.is_active}
                            onChange={(e) => handleSocialLinkChange(index, 'is_active', e.target.checked)}
                            className="w-4 h-4"
                          />
                        </div>

                        {!isMainSocial && (
                          <Button
                            type="button"
                            onClick={() => removeSocialLink(index)}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                        {isMainSocial && (
                          <div className="text-xs text-gray-400 px-2">
                            اصلی
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                * تلگرام، واتساپ و اینستاگرام به عنوان شبکه‌های اصلی قابل حذف نیستند
              </p>
            </div>

            {/* ایمیل */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ایمیل
              </label>
              <Input
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="info@example.com"
                className="mt-1"
              />
            </div>

            {/* آدرس */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                آدرس فروشگاه
              </label>
              <Input
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="تهران، خیابان ..."
                className="mt-1"
              />
            </div>

            {/* ساعت و روز کاری */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  ساعت کاری
                </label>
                <Input
                  name="working_hours"
                  value={form.working_hours}
                  onChange={handleChange}
                  placeholder="9 تا 18"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  روزهای کاری
                </label>
                <Input
                  name="working_days"
                  value={form.working_days}
                  onChange={handleChange}
                  placeholder="شنبه تا پنج‌شنبه"
                  className="mt-1"
                />
              </div>
            </div>

            {/* دکمه ذخیره */}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 flex items-center gap-2 rounded-lg shadow-md transition-all"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" />
                    در حال ذخیره...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    ذخیره تنظیمات
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Modal آپلود تصویر - بدون تغییر */}
      {showUploadModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <ImageIcon className="h-6 w-6 text-purple-500" />
                {uploadType === 'site_icon' ? 'آپلود آیکون سایت' : 'آپلود آیکون شبکه اجتماعی'}
              </h2>
            </div>

            <div className="p-6 space-y-6">
              {/* ناحیه درگ اند دراپ */}
              <div
                className="border-2 border-dashed border-purple-400 dark:border-purple-600 rounded-xl p-8 text-center hover:border-purple-500 transition-colors cursor-pointer bg-purple-50/30 dark:bg-purple-950/20"
                onClick={() =>
                  document.getElementById("icon-file-input")?.click()
                }
              >
                <Upload className="mx-auto h-10 w-10 text-purple-500 mb-3" />
                <p className="font-medium text-gray-700 dark:text-gray-200">
                  فایل را اینجا رها کنید یا کلیک کنید
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  فرمت‌های مجاز: JPG, PNG, WebP, SVG — حداکثر ۵ مگابایت
                </p>
                <Input
                  id="icon-file-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* لیست فایل‌های انتخاب شده */}
              {files.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                    فایل‌های انتخاب شده ({files.length})
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {files.map((file) => (
                      <div
                        key={file.name}
                        className="relative rounded-lg overflow-hidden border dark:border-gray-700 group bg-white dark:bg-gray-800 shadow-sm"
                      >
                        <Image
                          width={200}
                          height={200}
                          src={previews[file.name]}
                          alt={file.name}
                          className="w-full h-28 object-cover"
                        />
                        <button
                          onClick={() => removeFile(file.name)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={14} />
                        </button>
                        <p className="text-xs p-2 text-center truncate">
                          {file.name}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        در حال آپلود...
                      </>
                    ) : (
                      "آپلود فایل انتخاب شده"
                    )}
                  </Button>
                </div>
              )}

              {/* فایل‌های آپلود شده موفق */}
              {uploadedFiles.length > 0 && (
                <div className="space-y-4 pt-4 border-t dark:border-gray-700">
                  <h3 className="text-sm font-semibold text-green-700 dark:text-green-400">
                    آپلود موفق
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {uploadedFiles.map((file) => (
                      <div
                        key={file.name}
                        className="relative rounded-lg overflow-hidden border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/30"
                      >
                        <Image
                          width={200}
                          height={200}
                          src={file.url}
                          alt={file.name}
                          className="w-full h-28 object-cover"
                        />
                        <p className="text-xs p-2 text-center truncate text-green-800 dark:text-green-300">
                          {file.name}
                        </p>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={handleConfirmUpload}
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    استفاده از این تصویر
                  </Button>
                </div>
              )}
            </div>

            <div className="p-6 border-t dark:border-gray-700 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowUploadModal(false)}
              >
                بستن
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}