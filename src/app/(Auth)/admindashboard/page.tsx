"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/Components/ui/card";
import {
  BarChart3,
  ShoppingBag,
  Users,
  DollarSign,
} from "lucide-react";
import Image from "next/image";



const DashboardPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentTickets, setRecentTickets] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // 📌 helper برای fetch با توکن
  const fetchWithAuth = async (url: string) => {
    const token = Cookies.get("authToken");
    if (!token) {
      setError("توکن یافت نشد. لطفاً دوباره وارد شوید.");
      return null;
    }
    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "خطا در دریافت اطلاعات");
      }
      return res.json();
    } catch (err: any) {
      console.error(`Error fetching ${url}:`, err.message);
      setError(err.message);
      return null;
    }
  };

  // 📊 Stats
  useEffect(() => {
    (async () => {
      const data = await fetchWithAuth("/api/admin/stats");
      if (data) setStats(data);
    })();
  }, []);

  // 🛍 محصولات اخیر
  useEffect(() => {
    (async () => {
      const data = await fetchWithAuth("/api/products/recent");
      if (data) setRecentProducts(data);
    })();
  }, []);

  // 📦 سفارشات اخیر
  useEffect(() => {
    (async () => {
      const data = await fetchWithAuth("/api/admin/orders/recent");
      if (data) setRecentOrders(data);
    })();
  }, []);

  // 🎫 تیکت‌های اخیر
  useEffect(() => {
    (async () => {
      const data = await fetchWithAuth("/api/tickets/recent");
      if (data) setRecentTickets(data);
    })();
  }, []);

  const statCards = [
    {
      title: "کل محصولات",
      value: stats?.totalProducts || "—",
      icon: ShoppingBag,
   
    },
    {
      title: "کل کاربران",
      value: stats?.totalUsers || "—",
      icon: Users,
  
    },
    {
      title: "درآمد",
      value: stats?.totalRevenue
        ? `${stats.totalRevenue} ریال`
        : "0",
      icon: DollarSign,

    },
    {
      title: "دسته‌بندی‌ها",
      value: stats?.totalCategories || "—",
      icon: BarChart3,
 
    },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* نمایش خطا */}
      {error && (
        <div className="p-3 rounded bg-red-100 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* آمار کلی */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow rounded-2xl"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </CardTitle>
                <Icon className="h-6 w-6 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </div>
              
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* محصولات، سفارشات و تیکت‌های اخیر */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* محصولات اخیر */}
        <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <CardHeader className="flex justify-between items-center">
            <CardTitle>محصولات اخیر</CardTitle>
            <Link
              href="/admindashboard/products"
              className="text-xs px-3 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition"
            >
              مشاهده همه
            </Link>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recentProducts.length > 0 ? (
                recentProducts.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div className="flex items-center gap-3">
                      <Image
                      width={80}
                      height={80}
                        src={p.image}
                        alt={p.title}
                        className="w-10 h-10 rounded object-cover"
                      />
                      <span className="font-medium text-sm">{p.title}</span>
                    </div>
                  
                  </li>
                ))
              ) : (
                <p className="text-gray-500 text-sm">
                  هیچ محصولی یافت نشد
                </p>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* سفارشات اخیر */}
        <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <CardHeader className="flex justify-between items-center">
            <CardTitle>سفارشات اخیر</CardTitle>
            <Link
              href="/admindashboard/orders"
              className="text-xs px-3 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition"
            >
              مشاهده همه
            </Link>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recentOrders.length > 0 ? (
                recentOrders.map((o) => (
                  <li
                    key={o.id}
                    className="flex justify-between border-b pb-2"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        سفارش #{o.order_code}
                      </p>
                      <p className="text-xs text-gray-500">
                        {o.first_name} {o.last_name}
                      </p>
                    </div>
                    <span className="text-xs text-gray-700 font-medium">
                   {o.total_amount}   ریال 
                    </span>
                  </li>
                ))
              ) : (
                <p className="text-gray-500 text-sm">
                  سفارشی یافت نشد
                </p>
              )}
            </ul>
          </CardContent>
        </Card>

        {/* تیکت‌های اخیر */}
        <Card className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
          <CardHeader className="flex justify-between items-center">
            <CardTitle>تیکت‌های اخیر</CardTitle>
            <Link
              href="/admindashboard/tickets"
              className="text-xs px-3 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800 transition"
            >
              مشاهده همه
            </Link>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {recentTickets.length > 0 ? (
                recentTickets.map((t) => (
                  <li
                    key={t.id}
                    className="flex justify-between border-b pb-2"
                  >
                    <div>
                      <p className="font-medium text-sm">{t.subject}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(t.created_at).toLocaleDateString("fa-IR")}
                      </p>
                    </div>
                   
                  </li>
                ))
              ) : (
                <p className="text-gray-500 text-sm">
                  هیچ تیکتی یافت نشد
                </p>
              )}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
