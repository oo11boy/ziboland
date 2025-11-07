import UserDashboardContainer from "@/Components/Dashboards/UserDashboardComponents/UserDashboardContainer";
import { cookies } from "next/headers"; // برای دریافت کوکی‌ها در سمت سرور
import { API } from "@/lib/MainRoutes";
import {
  AccountInfo,
  Address,
  Order,
  RecentActivity,
  SupportTicket,
  // WishlistItem,
} from "@/types/types";
import { Metadata } from "next";

// تابع کمکی برای دریافت داده‌ها با مدیریت خطا
async function fetchData<T>(
  endpoint: string,
  token: string | undefined
): Promise<T> {
  try {
    const res = await fetch(`${API}${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store", 
     
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch data from ${endpoint}`);
    }
    return await res.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return [] as T; // در صورت خطا، آرایه خالی یا مقدار پیش‌فرض
  }
}
export const metadata: Metadata = {
  title: "داشبورد کاربر | زیبولند",
  description: "داشبورد کاربر",

};
export default async function page() {
  // دریافت توکن از کوکی‌ها در سمت سرور
  const cookieStore = cookies();
  const token = (await cookieStore).get("authToken")?.value;

  // دریافت داده‌ها
  const addresses: Address[] = await fetchData<Address[]>("/addresses", token);
  const accountInfo: AccountInfo = await fetchData<AccountInfo>(
    "/users/me",
    token
  );
  const orders: Order[] = await fetchData<Order[]>("/orders", token);
  // const wishlist: WishlistItem[] = await fetchData<WishlistItem[]>(
  //   "/wishlist",
  //   token
  // );
  const supportTickets: SupportTicket[] = await fetchData<SupportTicket[]>(
    "/tickets",
    token
  );
  // const recentActivities: RecentActivity[] = await fetchData<RecentActivity[]>(
  //   "/activities",
  //   token
  // );

  // تبدیل فرمت تیکت‌ها (مشابه کد اصلی)
  const formattedTickets = supportTickets.map((ticket) => ({
    ...ticket,
    status:
      ticket.status === "open"
        ? "باز"
        : ticket.status === "closed"
        ? "بسته"
        : ticket.status === "responded"
        ? "پاسخ داده شده"
        : "در انتظار",
  }));

  return (
    <UserDashboardContainer
      initialAddresses={addresses}
      initialAccountInfo={{
        ...accountInfo,
        userId: accountInfo.id, // برای استفاده در newAddress
      }}
      initialOrders={orders}
      // initialWishlist={wishlist}
      initialSupportTickets={formattedTickets}
      // initialRecentActivities={recentActivities}
    />
  );
}