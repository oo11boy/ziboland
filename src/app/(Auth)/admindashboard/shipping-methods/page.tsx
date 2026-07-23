"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea";
import { Modal, Box, Typography } from "@mui/material";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { Plus, Edit, Trash2, X, Truck } from "lucide-react";

interface ShippingMethod {
  id: number;
  name: string;
  key: string | null;
  description: string | null;
  cost: number;
  is_active: boolean;
  delivery_time: string | null;
  extra_note: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

const ShippingMethodsPage = () => {
  const [methods, setMethods] = useState<ShippingMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<ShippingMethod | null>(
    null,
  );
  const [formData, setFormData] = useState({
    name: "",
    key: "",
    description: "",
    cost: "",
    delivery_time: "",
    extra_note: "",
    display_order: "0",
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchMethods();
  }, []);

  const fetchMethods = async () => {
    try {
      const token = Cookies.get("authToken");
      const res = await fetch("/api/admin/shipping-methods", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMethods(data);
      } else {
        toast.error("خطا در دریافت روش‌های ارسال");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (method?: ShippingMethod) => {
    if (method) {
      setEditingMethod(method);
      setFormData({
        name: method.name,
        key: method.key || "",
        description: method.description || "",
        cost: method.cost.toString(),
        delivery_time: method.delivery_time || "",
        extra_note: method.extra_note || "",
        display_order: method.display_order.toString(),
        is_active: method.is_active,
      });
    } else {
      setEditingMethod(null);
      setFormData({
        name: "",
        key: "",
        description: "",
        cost: "",
        delivery_time: "",
        extra_note: "",
        display_order: "0",
        is_active: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMethod(null);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("نام روش ارسال الزامی است");
      return;
    }

    if (!formData.cost || isNaN(Number(formData.cost))) {
      toast.error("هزینه ارسال باید یک عدد معتبر باشد");
      return;
    }

    setSubmitting(true);
    try {
      const token = Cookies.get("authToken");
      const method = editingMethod ? "PUT" : "POST";
      const body = {
        ...(editingMethod && { id: editingMethod.id }),
        name: formData.name.trim(),
        key: formData.key.trim() || null,
        description: formData.description.trim() || null,
        cost: Number(formData.cost),
        delivery_time: formData.delivery_time.trim() || null,
        extra_note: formData.extra_note.trim() || null,
        display_order: Number(formData.display_order) || 0,
        is_active: formData.is_active,
      };

      const res = await fetch("/api/admin/shipping-methods", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(
          editingMethod
            ? "روش ارسال با موفقیت به‌روزرسانی شد"
            : "روش ارسال با موفقیت ایجاد شد",
        );
        handleCloseModal();
        fetchMethods();
      } else {
        const error = await res.json();
        toast.error(error.error || "خطا در ذخیره‌سازی");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`آیا از حذف روش ارسال "${name}" مطمئن هستید؟`)) return;

    try {
      const token = Cookies.get("authToken");
      const res = await fetch(`/api/admin/shipping-methods?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        toast.success("روش ارسال با موفقیت حذف شد");
        fetchMethods();
      } else {
        const error = await res.json();
        toast.error(error.error || "خطا در حذف");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    }
  };

  const toggleStatus = async (method: ShippingMethod) => {
    try {
      const token = Cookies.get("authToken");
      const res = await fetch("/api/admin/shipping-methods", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          id: method.id,
          name: method.name,
          key: method.key,
          description: method.description,
          cost: method.cost,
          delivery_time: method.delivery_time,
          extra_note: method.extra_note,
          display_order: method.display_order,
          is_active: !method.is_active,
        }),
      });

      if (res.ok) {
        toast.success(
          method.is_active ? "روش ارسال غیرفعال شد" : "روش ارسال فعال شد",
        );
        fetchMethods();
      } else {
        const error = await res.json();
        toast.error(error.error || "خطا در تغییر وضعیت");
      }
    } catch (error) {
      toast.error("خطا در ارتباط با سرور");
    }
  };

  const formatCost = (cost: number) => {
    return cost === 0 ? "رایگان" : `${cost.toLocaleString("fa-IR")} تومان`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 yekan">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            مدیریت روش‌های ارسال
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            روش‌های ارسال نمایش داده شده در صفحه تسویه حساب را مدیریت کنید
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-purple-600 hover:bg-purple-700 text-white w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 ml-2" />
          افزودن روش جدید
        </Button>
      </div>

      {methods.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
          <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl text-gray-500">هیچ روش ارسالی تعریف نشده است</p>
          <p className="text-sm text-gray-400 mt-2">
            برای افزودن روش ارسال جدید، دکمه "افزودن روش جدید" را کلیک کنید
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {methods.map((method) => (
            <Card
              key={method.id}
              className={`shadow-lg hover:shadow-xl transition-shadow ${!method.is_active ? "opacity-60" : ""}`}
            >
              <CardHeader className="flex flex-row justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {method.name}
                    {method.key && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-normal">
                        {method.key}
                      </span>
                    )}
                  </CardTitle>
                  {!method.is_active && (
                    <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-md inline-block mt-1">
                      غیرفعال
                    </span>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleOpenModal(method)}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(method.id, method.name)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">هزینه:</span>
                  <span className="font-bold text-purple-600">
                    {formatCost(method.cost)}
                  </span>
                </div>

                {method.delivery_time && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">زمان تحویل:</span>
                    <span className="text-sm font-medium">
                      {method.delivery_time}
                    </span>
                  </div>
                )}

                {method.description && (
                  <div className="text-sm text-gray-600 border-t pt-2">
                    {method.description}
                  </div>
                )}

                {method.extra_note && (
                  <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded-lg">
                    {method.extra_note}
                  </div>
                )}

                <div className="flex justify-between items-center border-t pt-3">
                  <span className="text-sm text-gray-600">وضعیت:</span>
                  <button
                    onClick={() => toggleStatus(method)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                      method.is_active
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {method.is_active ? "فعال" : "غیرفعال"}
                  </button>
                </div>

                <div className="text-xs text-gray-400">
                  ترتیب: {method.display_order}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* مودال افزودن/ویرایش */}
      <Modal open={isModalOpen} onClose={handleCloseModal}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: 600,
            bgcolor: "white",
            borderRadius: 3,
            boxShadow: 24,
            p: 4,
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <div className="flex justify-between items-center mb-6">
            <Typography
              variant="h6"
              sx={{ fontFamily: "yekannew", fontWeight: "bold" }}
            >
              {editingMethod ? "ویرایش روش ارسال" : "افزودن روش ارسال جدید"}
            </Typography>
            <button
              onClick={handleCloseModal}
              className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">
                نام روش ارسال <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="مثال: ارسال عادی"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                کلید (اختیاری)
              </label>
              <Input
                value={formData.key}
                onChange={(e) =>
                  setFormData({ ...formData, key: e.target.value })
                }
                placeholder="مثال: normal_free"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                کلید یکتا برای شناسایی روش ارسال. اگر خالی بماند، از ID استفاده
                می‌شود. برای روش‌های فعلی از کلیدهای normal_free،
                normal_express، fast_tehran، fast_other استفاده کنید.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                توضیحات
              </label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="توضیحات روش ارسال"
                className="mt-1"
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                هزینه (تومان) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={formData.cost}
                onChange={(e) =>
                  setFormData({ ...formData, cost: e.target.value })
                }
                placeholder="مثال: ۱۲۹۹۰۰"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                برای ارسال رایگان، عدد 0 را وارد کنید
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                زمان تحویل
              </label>
              <Input
                value={formData.delivery_time}
                onChange={(e) =>
                  setFormData({ ...formData, delivery_time: e.target.value })
                }
                placeholder="مثال: ۳-۵ روز کاری"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                توضیحات اضافی
              </label>
              <Textarea
                value={formData.extra_note}
                onChange={(e) =>
                  setFormData({ ...formData, extra_note: e.target.value })
                }
                placeholder="توضیحات ویژه یا شرایط ارسال"
                className="mt-1"
                rows={2}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                ترتیب نمایش
              </label>
              <Input
                type="number"
                value={formData.display_order}
                onChange={(e) =>
                  setFormData({ ...formData, display_order: e.target.value })
                }
                placeholder="۰"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                عدد کوچکتر، بالاتر نمایش داده می‌شود
              </p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">فعال:</label>
              <button
                onClick={() =>
                  setFormData({ ...formData, is_active: !formData.is_active })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  formData.is_active ? "bg-purple-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    formData.is_active ? "-translate-x-1" : "-translate-x-6"
                  }`}
                />
              </button>
              <span className="text-sm text-gray-600">
                {formData.is_active ? "فعال" : "غیرفعال"}
              </span>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t">
              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
              >
                {submitting
                  ? "در حال ذخیره..."
                  : editingMethod
                    ? "به‌روزرسانی"
                    : "ایجاد"}
              </Button>
              <Button
                onClick={handleCloseModal}
                variant="outline"
                className="flex-1 border-gray-300 hover:bg-gray-50"
              >
                لغو
              </Button>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
};

export default ShippingMethodsPage;
