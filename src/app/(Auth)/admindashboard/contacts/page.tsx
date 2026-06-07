"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/Components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/Components/ui/dialog";
import { Trash2, Eye, Search } from "lucide-react";
import { toast } from "react-toastify";

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  created_at: string;
  status: "pending" | "read" | "responded";
}

const ContactsPage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    // فیلتر و جستجو
    let result = contacts;
    if (searchTerm) {
      result = result.filter(
        (contact) =>
          contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contact.subject.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      result = result.filter((contact) => contact.status === statusFilter);
    }
    setFilteredContacts(result);
  }, [contacts, searchTerm, statusFilter]);

const fetchContacts = async () => {
  setLoading(true);
  try {
    const response = await fetch("/api/contacts");
    if (!response.ok) {
      if (response.status === 404) {
        setContacts([]); // آرایه خالی برای نمایش "هیچ پیامی یافت نشد"
      } else {
        throw new Error("خطا در دریافت پیام‌ها");
      }
    } else {
      const data = await response.json();
      setContacts(data);
    }
    setLoading(false);
  } catch (err) {
    setError(err instanceof Error ? err.message : "خطا در بارگذاری پیام‌ها");
    setLoading(false);
    toast.error("خطا در بارگذاری پیام‌ها");
  }
};

  const handleDelete = async (id: number) => {
    if (confirm("آیا مطمئن هستید که می‌خواهید این پیام را حذف کنید؟")) {
      try {
        const response = await fetch(`/api/contacts/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("خطا در حذف پیام");
        setContacts(contacts.filter((contact) => contact.id !== id));
        toast.success("پیام با موفقیت حذف شد");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "خطا در حذف پیام");
      }
    }
  };

  const handleUpdateStatus = async (id: number, status: "pending" | "read" | "responded") => {
    try {
      const response = await fetch(`/api/contacts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error("خطا در به‌روزرسانی وضعیت");
      setContacts(
        contacts.map((contact) =>
          contact.id === id ? { ...contact, status } : contact
        )
      );
      toast.success(`وضعیت پیام به "${status === "pending" ? "در انتظار" : status === "read" ? "خوانده‌شده" : "پاسخ‌داده‌شده"}" تغییر کرد`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "خطا در به‌روزرسانی وضعیت");
    }
  };

  const openContactDetails = (contact: Contact) => {
    setSelectedContact(contact);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500 font-semibold">{error}</div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
        پیام‌های تماس
      </h1>

      {/* جستجو و فیلتر */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <Input
            placeholder="جستجو بر اساس نام، ایمیل یا موضوع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
            <SelectValue placeholder="فیلتر بر اساس وضعیت" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه</SelectItem>
            <SelectItem value="pending">در انتظار</SelectItem>
            <SelectItem value="read">خوانده‌شده</SelectItem>
            <SelectItem value="responded">پاسخ‌داده‌شده</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
            لیست پیام‌ها
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredContacts.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              هیچ پیامی یافت نشد
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm md:text-base border-collapse">
                <thead className="hidden md:table-header-group bg-gray-50 dark:bg-gray-700">
                  <tr className="text-gray-600 dark:text-gray-300">
                    <th className="px-4 py-3 text-right font-semibold">نام</th>
                    <th className="px-4 py-3 text-right font-semibold">شماره تماس</th>
                    <th className="px-4 py-3 text-right font-semibold">موضوع</th>
                    <th className="px-4 py-3 text-right font-semibold">تاریخ</th>
                    <th className="px-4 py-3 text-right font-semibold">وضعیت</th>
                    <th className="px-4 py-3 text-right font-semibold">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredContacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className="block md:table-row border-b md:border-0 border-gray-200 dark:border-gray-700 mb-4 md:mb-0 rounded-lg md:rounded-none bg-gray-50 md:bg-transparent dark:bg-gray-900 md:dark:bg-transparent transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <td className="px-4 py-3 text-right block md:table-cell">
                        <span className="font-medium md:hidden">نام: </span>
                        {contact.name}
                      </td>
                      <td className="px-4 py-3 text-right block md:table-cell">
                        <span className="font-medium md:hidden">شماره تماس: </span>
                        {contact.phone}
                      </td>
                      <td className="px-4 py-3 text-right block md:table-cell">
                        <span className="font-medium md:hidden">موضوع: </span>
                        {contact.subject.length > 20
                          ? contact.subject.slice(0, 20) + "..."
                          : contact.subject}
                      </td>
                      <td className="px-4 py-3 text-right block md:table-cell">
                        <span className="font-medium md:hidden">تاریخ: </span>
                        {new Date(contact.created_at).toLocaleDateString("fa-IR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-4 py-3 text-right block md:table-cell">
                        <span className="font-medium md:hidden">وضعیت: </span>
                        <Select
                          value={contact.status}
                          onValueChange={(value: "pending" | "read" | "responded") =>
                            handleUpdateStatus(contact.id, value)
                          }
                        >
                          <SelectTrigger className="w-full sm:w-32 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">در انتظار</SelectItem>
                            <SelectItem value="read">خوانده‌شده</SelectItem>
                            <SelectItem value="responded">پاسخ‌داده‌شده</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-4 py-3 block md:table-cell">
                        <div className="flex space-x-2 space-x-reverse justify-end">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openContactDetails(contact)}
                                title="مشاهده جزئیات"
                                className="hover:bg-blue-50 dark:hover:bg-blue-900"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            {selectedContact?.id === contact.id && (
                              <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-800">
                                <DialogHeader>
                                  <DialogTitle className="text-gray-800 dark:text-white">
                                    جزئیات پیام
                                  </DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">نام: </span>
                                    {contact.name}
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">ایمیل: </span>
                                    {contact.email}
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">شماره تلفن: </span>
                                    {contact.phone || "مشخص نشده"}
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">موضوع: </span>
                                    {contact.subject}
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">متن پیام: </span>
                                    <p className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                                      {contact.message}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">تاریخ: </span>
                                    {new Date(contact.created_at).toLocaleDateString("fa-IR", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                  <div>
                                    <span className="font-medium text-gray-700 dark:text-gray-300">وضعیت: </span>
                                    <Select
                                      value={contact.status}
                                      onValueChange={(value: "pending" | "read" | "responded") =>
                                        handleUpdateStatus(contact.id, value)
                                      }
                                    >
                                      <SelectTrigger className="w-full sm:w-48 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="pending">در انتظار</SelectItem>
                                        <SelectItem value="read">خوانده‌شده</SelectItem>
                                        <SelectItem value="responded">پاسخ‌داده‌شده</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </DialogContent>
                            )}
                          </Dialog>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(contact.id)}
                            title="حذف پیام"
                            className="hover:bg-red-50 dark:hover:bg-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
  );
};

export default ContactsPage;