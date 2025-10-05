"use client";

import { useState, useEffect } from "react";
import { Bell, User, Moon, Sun, Check } from "lucide-react";
import { Badge } from "@/Components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Button } from "@/Components/ui/button";
import { API } from "@/lib/MainRoutes";
import { toast } from "react-hot-toast";
import Cookies from "js-cookie";
import { useAuth } from "@/ContextApi/AuthContext";

interface Notification {
  id: number;
  type: "comment" | "ticket" | "order";
  message: string;
  created_at: string;
  read: boolean;
  related_id?: number | null;
  related_data?: string | null;
}

const Header = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const token = Cookies.get("authToken");
  const { logout } = useAuth();

  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("darkMode", (!darkMode).toString());
  };

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch(`${API}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to fetch notifications: ${res.status}`);
      const data = await res.json();
      const normalized: Notification[] = data.map((n: any) => ({
        id: n.id,
        type: n.type,
        message: n.message,
        created_at: n.created_at,
        read: Boolean(n.read),
        related_id: n.related_id ?? null,
        related_data: n.related_data ?? null,
      }));
      setNotifications(normalized);
      setUnreadCount(normalized.filter((n) => !n.read).length);
    } catch {
      toast.error("خطا در دریافت اعلان‌ها");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const markAsRead = async (id: number) => {
    if (!token) return toast.error("لطفاً دوباره وارد شوید");
    try {
      const res = await fetch(`${API}/notifications/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 404) {
        toast.error("اعلان یافت نشد");
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        setUnreadCount((prev) => Math.max(0, prev - 1));
        return;
      }
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      toast.error("خطا در به‌روزرسانی اعلان");
    }
  };

  const markAllAsRead = async () => {
    if (!token) return toast.error("لطفاً دوباره وارد شوید");
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0)
      return toast.success("هیچ اعلان خوانده‌نشده‌ای وجود ندارد");

    try {
      const res = await fetch(`${API}/notifications`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error(`Failed: ${res.status}`);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success("تمام اعلان‌ها خوانده شده علامت‌گذاری شدند");
    } catch {
      toast.error("خطا در به‌روزرسانی اعلان‌ها");
    }
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "order":
        return "📦";
      case "comment":
        return "💬";
      case "ticket":
        return "🎫";
      default:
        return "🔔";
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "order":
        return "text-blue-600 dark:text-blue-400";
      case "comment":
        return "text-green-600 dark:text-green-400";
      case "ticket":
        return "text-purple-600 dark:text-purple-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const translateType = (type: Notification["type"]) => {
    switch (type) {
      case "comment":
        return "نظرات";
      case "ticket":
        return "تیکت";
      case "order":
        return "سفارشات";
      default:
        return "اعلان";
    }
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center mr-12 mt-4">
        <div className="text-xl font-bold text-gray-800 dark:text-white">
          Ziboland Admin
        </div>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 relative transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
              <Bell size={20} />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-bold">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            style={{ direction: "rtl" }}
            className="w-96 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                اعلان‌ها
              </span>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-xs h-auto py-1 px-2"
                >
                  همه را خوانده شده کن
                </Button>
              )}
            </div>

            {loading ? (
              <DropdownMenuItem className="p-4 text-center text-gray-500 dark:text-gray-400">
                در حال بارگذاری...
              </DropdownMenuItem>
            ) : notifications.length === 0 ? (
              <DropdownMenuItem className="p-4 text-center text-gray-500 dark:text-gray-400">
                هیچ اعلانی وجود ندارد
              </DropdownMenuItem>
            ) : (
              notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className={`p-4 border-b last:border-b-0 cursor-pointer transition-all rounded-lg hover:shadow-md ${
                    notification.read
                      ? "bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                      : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                  }`}
                  onClick={() =>
                    !notification.read && markAsRead(notification.id)
                  }
                >
                  <div className="flex items-start space-x-3 space-x-reverse text-right" dir="rtl">
                    <span
                      className={`text-lg flex-shrink-0 ${getNotificationColor(
                        notification.type
                      )}`}
                    >
                      {getNotificationIcon(notification.type)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span
                          className={`text-sm font-medium ${getNotificationColor(
                            notification.type
                          )}`}
                        >
                          {translateType(notification.type)}
                        </span>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <p
                        className={`text-sm ${
                          notification.read
                            ? "text-gray-600 dark:text-gray-300"
                            : "text-gray-800 dark:text-gray-200"
                        }`}
                      >
                        {notification.message}
                        {notification.related_data && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">
                            ({notification.related_data})
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.created_at).toLocaleString("fa-IR", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  {notification.read && (
                    <Check className="h-4 w-4 text-green-500 mr-2" />
                  )}
                </DropdownMenuItem>
              ))
            )}

            <DropdownMenuItem className="p-2 text-center border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="link"
                onClick={fetchNotifications}
                className="h-auto p-0 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              >
                به‌روزرسانی اعلان‌ها
              </Button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <button
          onClick={toggleDarkMode}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          title={darkMode ? "روشن کردن" : "تاریک کردن"}
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center space-x-2 space-x-reverse p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              <User size={20} className="text-gray-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">
                مدیر
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 mr-2">
            <DropdownMenuItem className="justify-end">
              <span className="text-sm">پنل مدیریت</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="justify-end text-red-600 dark:text-red-400"
              onClick={logout}
            >
              <span className="text-sm">خروج</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
