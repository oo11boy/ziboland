"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Cookies from "js-cookie";
import { Card, CardContent, CardHeader, CardTitle } from "@/Components/ui/card";
import { BarChart3, ShoppingBag, Users, DollarSign, Package, AlertOctagon, ClipboardList, MessageSquare } from "lucide-react";
import Image from "next/image";

const DashboardPage = () => {
  const [stats, setStats] = useState<any>(null);
  const [activeProducts, setActiveProducts] = useState<any[]>([]);
  const [outOfStockProducts, setOutOfStockProducts] = useState<any[]>([]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentTickets, setRecentTickets] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchWithAuth = async (url: string) => {
    const token = Cookies.get("authToken");
    if (!token) {
      setError("لطفاً وارد شوید.");
      return null;
    }
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return null;
    return res.json();
  };

useEffect(() => {
    const loadData = async () => {
      const [statData, productData, orderData, ticketData] = await Promise.all([
        fetchWithAuth("/api/admin/stats"),
        fetchWithAuth("/api/products"),
        fetchWithAuth("/api/admin/orders/recent"),
        fetchWithAuth("/api/tickets/recent"), // فرض بر اصلاح نام تابع در صورت نیاز
      ]);

      if (statData) setStats(statData);
      if (orderData) setRecentOrders(orderData);
      if (ticketData) setRecentTickets(ticketData);

      if (productData && Array.isArray(productData)) {
        // محاسبه داینامیک وضعیت موجودی برای هر محصول
        const processedProducts = productData.map((p: any) => {
          const totalStock = (p.variants || []).reduce(
            (sum: number, v: any) => sum + Number(v.stock_quantity || 0),
            0
          );
          return { ...p, isCurrentlyInStock: totalStock > 0 };
        });

        // حالا فیلتر کردن بر اساس isCurrentlyInStock که خودمان محاسبه کردیم
        setActiveProducts(processedProducts.filter((p: any) => p.isCurrentlyInStock).slice(0, 5));
        setOutOfStockProducts(processedProducts.filter((p: any) => !p.isCurrentlyInStock).slice(0, 5));
      }
    };
    loadData();
  }, []);

  const statCards = [
    { title: "کل محصولات", value: stats?.totalProducts, icon: Package, color: "text-blue-600" },
    { title: "کل کاربران", value: stats?.totalUsers, icon: Users, color: "text-purple-600" },
    { title: "درآمد", value: `${stats?.totalRevenue || 0} ریال`, icon: DollarSign, color: "text-green-600" },
    { title: "دسته‌بندی‌ها", value: stats?.totalCategories, icon: BarChart3, color: "text-orange-600" },
  ];

  return (
    <div className="p-6 space-y-8 bg-gray-50 min-h-screen">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow duration-300 border-none rounded-3xl bg-white">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-1 text-gray-800">{stat.value || 0}</h3>
              </div>
              <div className={`p-3 rounded-2xl bg-gray-100 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Active Products */}
        <DashboardListCard 
            title="کالاهای فعال" 
            items={activeProducts} 
            icon={Package} 
            color="text-green-600" 
            href="/admindashboard/products" 
        />
        
        {/* Out of Stock */}
        <DashboardListCard 
            title="کالاهای ناموجود" 
            items={outOfStockProducts} 
            icon={AlertOctagon} 
            color="text-red-600" 
            href="/admindashboard/products" 
        />

        {/* Recent Orders */}
        <DashboardListCard 
            title="سفارشات اخیر" 
            items={recentOrders} 
            icon={ClipboardList} 
            color="text-blue-600" 
            href="/admindashboard/orders" 
            isOrder
        />

        {/* Tickets */}
        <DashboardListCard 
            title="تیکت‌های اخیر" 
            items={recentTickets} 
            icon={MessageSquare} 
            color="text-yellow-600" 
            href="/admindashboard/tickets" 
            isTicket
        />
      </div>
    </div>
  );
};

// کامپوننت کمکی برای کارت‌های لیست
const DashboardListCard = ({ title, items, icon: Icon, color, href, isOrder, isTicket }: any) => (
  <Card className="rounded-3xl border-none shadow-sm hover:shadow-md transition-all h-[400px] flex flex-col bg-white">
    <CardHeader className="flex flex-row justify-between items-center pb-2">
      <CardTitle className="text-lg font-bold flex items-center gap-2">
        <Icon className={color} size={20} /> {title}
      </CardTitle>
      <Link href={href} className="text-xs text-blue-500 hover:underline">مشاهده همه</Link>
    </CardHeader>
    <CardContent className="flex-1 overflow-y-auto p-4 pt-0">
      <ul className="space-y-4">
        {items.length > 0 ? items.map((item: any, i: number) => (
          <li key={i} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition">
            {item.image && <Image src={item.image} width={40} height={40} alt="img" className="rounded-lg w-10 h-10 object-cover" />}
            <div>
              <p className="font-medium text-sm text-gray-800">{isOrder ? `سفارش #${item.order_code}` : isTicket ? item.subject : item.title}</p>
              <p className="text-xs text-gray-400">{isOrder ? `${item.first_name} ${item.last_name}` : ""}</p>
            </div>
          </li>
        )) : <p className="text-gray-400 text-sm text-center mt-10">موردی یافت نشد</p>}
      </ul>
    </CardContent>
  </Card>
);

export default DashboardPage;