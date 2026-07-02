"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/Components/ui/select";
import { Modal, Box, Typography } from "@mui/material";
import { Search, Filter, Trash2, Eye, CheckCircle, XCircle, Clock } from "lucide-react";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import Link from "next/link";

interface StockRequest {
  id: number;
  product_id: number;
  variant_id: number | null;
  product_title: string;
  variant_color: string | null;
  customer_name: string;
  phone_number: string;
  status: "pending" | "notified" | "cancelled";
  created_at: string;
}

const StockRequestsPage = () => {
  const [requests, setRequests] = useState<StockRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedRequest, setSelectedRequest] = useState<StockRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState<{ [key: number]: boolean }>({});

  // دریافت درخواست‌ها
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const token = Cookies.get("authToken");
      if (!token) {
        toast.error("لطفاً مجدداً وارد شوید");
        return;
      }

      const response = await fetch("/api/admin/stock-requests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("خطا در دریافت درخواست‌ها");
      }

      const data = await response.json();
      // مرتب‌سازی: جدیدترین‌ها اول
      const sortedData = data.sort(
        (a: StockRequest, b: StockRequest) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );

      setRequests(sortedData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching stock requests:", err);
      toast.error("خطا در بارگذاری درخواست‌ها");
      setLoading(false);
    }
  };

  // فیلتر ترکیبی: جستجو + وضعیت
  const filteredRequests = useMemo(() => {
    return requests.filter((request) => {
      const searchLower = searchTerm.toLowerCase();

      const matchesSearch =
        request.product_title.toLowerCase().includes(searchLower) ||
        request.customer_name.toLowerCase().includes(searchLower) ||
        request.phone_number.includes(searchLower);

      const matchesStatus =
        statusFilter === "all" || request.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

  // تغییر وضعیت درخواست
  const handleStatusChange = async (
    requestId: number,
    newStatus: StockRequest["status"],
  ) => {
    const request = requests.find((r) => r.id === requestId);
    if (!request) return;

    if (!confirm(`آیا از تغییر وضعیت درخواست #${requestId} اطمینان دارید؟`)) {
      return;
    }

    setIsUpdating((prev) => ({ ...prev, [requestId]: true }));

    try {
      const token = Cookies.get("authToken");
      const res = await fetch(`/api/admin/stock-requests/${requestId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "خطا در به‌روزرسانی");
      }

      // بروزرسانی محلی
      setRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: newStatus } : r)),
      );

      if (selectedRequest?.id === requestId) {
        setSelectedRequest({ ...selectedRequest, status: newStatus });
      }

      toast.success("وضعیت با موفقیت تغییر کرد");
    } catch (err: any) {
      toast.error(err.message || "خطا در تغییر وضعیت");
    } finally {
      setIsUpdating((prev) => ({ ...prev, [requestId]: false }));
    }
  };

  // حذف درخواست
  const handleDeleteRequest = async (requestId: number) => {
    if (!confirm("آیا از حذف این درخواست اطمینان دارید؟")) {
      return;
    }

    try {
      const token = Cookies.get("authToken");
      const res = await fetch(`/api/admin/stock-requests/${requestId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("خطا در حذف درخواست");

      setRequests((prev) => prev.filter((r) => r.id !== requestId));
      toast.success("درخواست با موفقیت حذف شد");
    } catch (err: any) {
      toast.error(err.message || "مشکلی در حذف رخ داد");
    }
  };

  // مشاهده جزئیات
  const handleViewDetails = (request: StockRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  // ترجمه وضعیت
  const translateStatus = (status: string) => {
    const map: Record<string, string> = {
      pending: "در انتظار",
      notified: "اطلاع‌رسانی شده",
      cancelled: "لغو شده",
    };
    return map[status] || status;
  };

  // رنگ وضعیت
  const getStatusColor = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      notified: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return map[status] || "bg-gray-100 text-gray-800";
  };

  // آیکون وضعیت
  const getStatusIcon = (status: string) => {
    const map: Record<string, React.ReactNode> = {
      pending: <Clock className="w-4 h-4" />,
      notified: <CheckCircle className="w-4 h-4" />,
      cancelled: <XCircle className="w-4 h-4" />,
    };
    return map[status] || <Clock className="w-4 h-4" />;
  };

  // لودینگ
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 yekan">
      {/* عنوان */}
      <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-8 text-center md:text-right">
        📦 درخواست‌های موجودی (موجود شد خبرم کن)
      </h1>

      {/* فیلترها و جستجو */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* جستجو */}
        <div className="relative">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="جستجو در درخواست‌ها..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 bg-white dark:bg-gray-800"
          />
        </div>

        {/* فیلتر وضعیت */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="bg-white dark:bg-gray-800">
            <Filter className="w-4 h-4 ml-2 text-gray-500" />
            <SelectValue placeholder="فیلتر وضعیت" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه</SelectItem>
            <SelectItem value="pending">در انتظار</SelectItem>
            <SelectItem value="notified">اطلاع‌رسانی شده</SelectItem>
            <SelectItem value="cancelled">لغو شده</SelectItem>
          </SelectContent>
        </Select>

        {/* تعداد */}
        <div className="hidden lg:flex items-center justify-center text-sm text-gray-600 bg-gray-100 dark:bg-gray-800 rounded-lg px-4">
          نمایش {filteredRequests.length} از {requests.length} درخواست
        </div>
      </div>

      {/* نمایش موبایل: کارت‌ها */}
      <div className="block lg:hidden space-y-4">
        {filteredRequests.length === 0 ? (
          <Card className="text-center py-16 bg-gray-50 dark:bg-gray-900">
            <p className="text-xl text-gray-500">هیچ درخواستی یافت نشد</p>
            <p className="text-sm text-gray-400 mt-2">فیلترها را تغییر دهید</p>
          </Card>
        ) : (
          filteredRequests.map((request) => (
            <Card
              key={request.id}
              className="shadow-lg hover:shadow-xl transition-shadow"
            >
              <CardContent className="pt-6">
                {/* هدر کارت */}
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-lg font-bold text-purple-600">
                      #{request.id}
                    </p>
                    <p className="text-sm text-gray-600">
                      {request.customer_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {request.phone_number}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${getStatusColor(
                        request.status
                      )}`}
                    >
                      {getStatusIcon(request.status)}
                      {translateStatus(request.status)}
                    </span>
                  </div>
                </div>

                {/* اطلاعات اصلی */}
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>محصول:</strong> {request.product_title}
                  </p>
                  {request.variant_color && (
                    <p>
                      <strong>رنگ:</strong> {request.variant_color}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    {new Date(request.created_at).toLocaleDateString("fa-IR")}
                  </p>
                </div>

                {/* اکشن‌ها */}
                <div className="flex gap-3 mt-5">
                  <Select
                    value={request.status}
                    onValueChange={(newValue) => {
                      if (newValue !== request.status) {
                        handleStatusChange(
                          request.id,
                          newValue as StockRequest["status"]
                        );
                      }
                    }}
                    disabled={isUpdating[request.id]}
                  >
                    <SelectTrigger className="flex-1 text-xs h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">در انتظار</SelectItem>
                      <SelectItem value="notified">اطلاع‌رسانی شده</SelectItem>
                      <SelectItem value="cancelled">لغو شده</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleViewDetails(request)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="hover:bg-red-100 dark:hover:bg-red-900"
                    onClick={() => handleDeleteRequest(request.id)}
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* نمایش دسکتاپ: جدول */}
      <div className="hidden lg:block">
        <Card className="shadow-xl">
          <CardHeader className="text-black rounded-t-lg">
            <CardTitle className="text-xl">لیست درخواست‌های موجودی</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-20 text-gray-500 text-lg">
                هیچ درخواستی با این فیلتر یافت نشد
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">
                        #
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">
                        محصول
                      </th>
                 
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">
                        نام مشتری
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">
                        شماره تماس
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">
                        وضعیت
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">
                        تاریخ
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-700 dark:text-gray-300">
                        عملیات
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredRequests.map((request) => (
                      <tr
                        key={request.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="px-6 py-4 font-mono text-purple-600 font-bold">
                          #{request.id}
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            href={`/products/${request.product_id}`}
                            target="_blank"
                            className="text-blue-600 hover:underline"
                          >
                            {request.product_title}
                          </Link>
                        </td>
                   
                        <td className="px-6 py-4 font-medium">
                          {request.customer_name}
                        </td>
                        <td className="px-6 py-4 font-mono text-sm">
                          {request.phone_number}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-4 py-2 rounded-full text-xs font-bold flex items-center justify-center gap-1 ${getStatusColor(
                              request.status
                            )}`}
                          >
                            {getStatusIcon(request.status)}
                            {translateStatus(request.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(request.created_at).toLocaleDateString(
                            "fa-IR"
                          )}
                        </td>
                        <td className="px-6 py-4 text-center flex gap-2">
                          <Select
                            value={request.status}
                            onValueChange={(newValue) => {
                              if (newValue !== request.status) {
                                handleStatusChange(
                                  request.id,
                                  newValue as StockRequest["status"]
                                );
                              }
                            }}
                            disabled={isUpdating[request.id]}
                          >
                            <SelectTrigger className="w-32 h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">در انتظار</SelectItem>
                              <SelectItem value="notified">
                                اطلاع‌رسانی شده
                              </SelectItem>
                              <SelectItem value="cancelled">لغو شده</SelectItem>
                            </SelectContent>
                          </Select>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="hover:bg-blue-100 dark:hover:bg-blue-900"
                            onClick={() => handleViewDetails(request)}
                          >
                            <Eye className="w-5 h-5 text-blue-600" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="hover:bg-red-100 dark:hover:bg-red-900"
                            onClick={() => handleDeleteRequest(request.id)}
                          >
                            <Trash2 className="w-5 h-5 text-red-600" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* مودال جزئیات درخواست */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        closeAfterTransition
      >
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "95%", sm: "80%", md: "70%", lg: "60%" },
            maxHeight: "90vh",
            overflowY: "auto",
            bgcolor: "background.paper",
            borderRadius: 3,
            boxShadow: 24,
            p: { xs: 3, sm: 4, md: 5 },
            outline: "none",
          }}
        >
          {selectedRequest && (
            <div className="text-right">
              <Button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 left-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </Button>

              <Typography
                variant="h4"
                className="text-center font-bold yekan !text-lg text-purple-700 pb-8"
              >
                جزئیات درخواست موجودی #{selectedRequest.id}
              </Typography>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500">نام مشتری</p>
                  <p className="font-bold text-lg">{selectedRequest.customer_name}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500">شماره تماس</p>
                  <p className="font-bold text-lg font-mono">{selectedRequest.phone_number}</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg col-span-1 md:col-span-2">
                  <p className="text-sm text-gray-500">محصول</p>
                  <p className="font-bold text-lg">{selectedRequest.product_title}</p>
         
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500">وضعیت</p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold  items-center gap-1 inline-flex ${getStatusColor(
                      selectedRequest.status
                    )}`}
                  >
                    {getStatusIcon(selectedRequest.status)}
                    {translateStatus(selectedRequest.status)}
                  </span>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-500">تاریخ ثبت</p>
                  <p className="font-medium">
                    {new Date(selectedRequest.created_at).toLocaleDateString(
                      "fa-IR"
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  
                  variant="secondary"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => {
                    handleStatusChange(selectedRequest.id, "notified");
                    setIsModalOpen(false);
                  }}
                >
                  <CheckCircle className="w-4 h-4 ml-2" />
                  اطلاع‌رسانی شد
                </Button>
                <Button
                  
                  variant="outline"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                  onClick={() => {
                    handleStatusChange(selectedRequest.id, "cancelled");
                    setIsModalOpen(false);
                  }}
                >
                  <XCircle className="w-4 h-4 ml-2" />
                  لغو درخواست
                </Button>
              </div>

              <div className="text-center mt-6">
                <Button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-10 py-3 text-lg rounded-xl"
                >
                  بستن
                </Button>
              </div>
            </div>
          )}
        </Box>
      </Modal>
    </div>
  );
};

export default StockRequestsPage;