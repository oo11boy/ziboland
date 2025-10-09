"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/input";
import { Textarea } from "@/Components/ui/textarea"; // اضافه کردن Textarea
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/Components/ui/dialog";
import { Search, Send, Lock, Unlock, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { Ticket } from "@/types/types";

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [response, setResponse] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const token = Cookies.get("authToken");

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    // فیلتر بر اساس جستجو
    const filtered = tickets.filter(
      (ticket) =>
        ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.message.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTickets(filtered);
  }, [tickets, searchTerm]);

  const fetchTickets = async () => {
    try {
      const res = await fetch("/api/tickets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTickets(data);
        setFilteredTickets(data);
      } else {
        setError("خطا در دریافت تیکت‌ها");
        toast.error("خطا در دریافت تیکت‌ها");
      }
    } catch (err) {
      setError("خطا در دریافت تیکت‌ها");
      toast.error("خطا در دریافت تیکت‌ها");
      console.error(err);
    }
  };

  const handleRespond = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setResponse(ticket.response || "");
    setIsModalOpen(true);
  };

  const handleSubmitResponse = async () => {
    if (!response.trim()) {
      setError("لطفاً متن پاسخ را وارد کنید");
      toast.error("لطفاً متن پاسخ را وارد کنید");
      return;
    }
    try {
      const res = await fetch(`/api/tickets/${selectedTicket?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ response, status: "responded" }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setResponse("");
        setSelectedTicket(null);
        setError("");
        fetchTickets();
        toast.success("پاسخ با موفقیت ارسال شد");
      } else {
        setError("خطا در ارسال پاسخ");
        toast.error("خطا در ارسال پاسخ");
      }
    } catch (err) {
      setError("خطا در ارسال پاسخ");
      toast.error("خطا در ارسال پاسخ");
      console.error(err);
    }
  };

  const handleChangeStatus = async (ticketId: number, status: string) => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        fetchTickets();
        toast.success(`وضعیت تیکت به "${status === "open" ? "باز" : "بسته"}" تغییر کرد`);
      } else {
        setError("خطا در تغییر وضعیت تیکت");
        toast.error("خطا در تغییر وضعیت تیکت");
      }
    } catch (err) {
      setError("خطا در تغییر وضعیت تیکت");
      toast.error("خطا در تغییر وضعیت تیکت");
      console.error(err);
    }
  };

  const handleDelete = async (ticketId: number) => {
    if (!confirm("آیا مطمئن هستید که می‌خواهید این تیکت را حذف کنید؟")) {
      return;
    }
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        fetchTickets();
        toast.success("تیکت با موفقیت حذف شد");
      } else {
        setError("خطا در حذف تیکت");
        toast.error("خطا در حذف تیکت");
      }
    } catch (err) {
      setError("خطا در حذف تیکت");
      toast.error("خطا در حذف تیکت");
      console.error(err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 yekannew">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
        مدیریت تیکت‌ها
      </h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      {/* جستجو */}
      <div className="relative mb-6">
        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <Input
          placeholder="جستجو بر اساس موضوع یا متن پیام..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pr-10 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-gray-800 dark:text-white">
            لیست تیکت‌ها
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTickets.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              هیچ تیکتی یافت نشد
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{ticket.subject}</h3>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        ticket.status === "open"
                          ? "bg-yellow-100 text-yellow-800"
                          : ticket.status === "closed"
                          ? "bg-red-100 text-red-800"
                          : ticket.status === "responded"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {ticket.status === "open"
                        ? "باز"
                        : ticket.status === "closed"
                        ? "بسته"
                        : ticket.status === "responded"
                        ? "پاسخ داده شده"
                        : "در انتظار"}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-600 dark:text-gray-300">{ticket.message}</p>
                  {ticket.response && (
                    <p className="mt-2 text-green-600 dark:text-green-400">
                      <strong>پاسخ:</strong> {ticket.response}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-gray-500">
                    تاریخ: {new Date(ticket.created_at).toLocaleDateString("fa-IR")}
                  </p>
                  <div className="mt-4 flex gap-x-2 space-x-reverse">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRespond(ticket)}
                      className="hover:bg-blue-50 dark:hover:bg-blue-900"
                    >
                      <Send className="mr-2 h-4 w-4" /> پاسخ
                    </Button>
                    {ticket.status !== "closed" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleChangeStatus(ticket.id, "closed")}
                        className="hover:bg-red-50 dark:hover:bg-red-900"
                      >
                        <Lock className="mr-2 h-4 w-4" /> بستن
                      </Button>
                    )}
                    {ticket.status !== "open" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleChangeStatus(ticket.id, "open")}
                        className="hover:bg-green-50 dark:hover:bg-green-900"
                      >
                        <Unlock className="mr-2 h-4 w-4" /> باز کردن
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(ticket.id)}
                      className="hover:bg-red-50 dark:hover:bg-red-900"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> حذف
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-800">
          <DialogHeader>
            <DialogTitle className="text-gray-800 dark:text-white">
              پاسخ به تیکت #{selectedTicket?.id}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea // استفاده از Textarea به‌جای Input
              rows={4}
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="پاسخ خود را وارد کنید..."
              className="bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600"
            />
            {error && <p className="text-red-500">{error}</p>}
            <div className="flex justify-end space-x-2 space-x-reverse">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white"
              >
                لغو
              </Button>
              <Button
                onClick={handleSubmitResponse}
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                ارسال پاسخ
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}