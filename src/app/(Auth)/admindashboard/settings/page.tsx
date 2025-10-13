"use client";
import { useState, useEffect } from "react";
import { Input } from "@/Components/ui/input";
import { Button } from "@/Components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/Components/ui/card";
import { Textarea } from "@/Components/ui/textarea";
import { toast } from "react-toastify";
import { Loader2, Save } from "lucide-react";
import { API } from "@/lib/MainRoutes";

export default function SettingsPage() {
  const [form, setForm] = useState({
    site_name: "",
    site_description: "",
    site_icon: "",
    telegram_link: "",
    whatsapp_link: "",
    instagram_link: "",
    email: "",
    phone: "",
    address: "",
    working_hours: "",
    working_days: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // دریافت تنظیمات در ابتدا
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${API}/settings`);
      if (!res.ok) throw new Error("خطا در دریافت تنظیمات");
      const data = await res.json();
      setForm((prev) => ({ ...prev, ...data }));
    } catch (err) {
      toast.error("❌ خطا در دریافت تنظیمات"+err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API}/settings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("خطا در ذخیره تنظیمات");
      toast.success("✅ تنظیمات با موفقیت ذخیره شد");
    } catch (err) {
      toast.error("❌ خطا در ذخیره تنظیمات"+err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
        <span className="mr-2 text-gray-600 dark:text-gray-300">در حال بارگذاری...</span>
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
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">نام سایت</label>
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
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">توضیحات سایت</label>
              <Textarea
                name="site_description"
                value={form.site_description}
                onChange={handleChange}
                placeholder="توضیح کوتاه درباره فروشگاه شما..."
                rows={3}
                className="mt-1"
              />
            </div>

            {/* آیکون سایت */}
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">آیکون سایت (URL)</label>
              <Input
                name="site_icon"
                value={form.site_icon}
                onChange={handleChange}
                placeholder="https://example.com/icon.png"
                className="mt-1"
              />
            </div>

            {/* شبکه‌های اجتماعی */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">تلگرام</label>
                <Input
                  name="telegram_link"
                  value={form.telegram_link}
                  onChange={handleChange}
                  placeholder="https://t.me/yourchannel"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">واتساپ</label>
                <Input
                  name="whatsapp_link"
                  value={form.whatsapp_link}
                  onChange={handleChange}
                  placeholder="https://wa.me/989123456789"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">اینستاگرام</label>
                <Input
                  name="instagram_link"
                  value={form.instagram_link}
                  onChange={handleChange}
                  placeholder="https://instagram.com/yourpage"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ایمیل</label>
                <Input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="info@example.com"
                  className="mt-1"
                />
              </div>
            </div>

            {/* اطلاعات تماس */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">شماره تماس</label>
                <Input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="09123456789"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">آدرس فروشگاه</label>
                <Input
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="تهران، خیابان ..."
                  className="mt-1"
                />
              </div>
            </div>

            {/* ساعت و روز کاری */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ساعت کاری</label>
                <Input
                  name="working_hours"
                  value={form.working_hours}
                  onChange={handleChange}
                  placeholder="9 تا 18"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">روزهای کاری</label>
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
    </div>
  );
}
