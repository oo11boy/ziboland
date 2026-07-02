import UserDashboardContainer from "@/Components/Dashboards/UserDashboardComponents/UserDashboardContainer";
import { cookies, headers } from "next/headers";
import {
  AccountInfo,
  Address,
  Order,
  SupportTicket,
  WishlistItem,
} from "@/types/types";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "داشبورد کاربر | زیبولند",
  description: "داشبورد کاربر",
};

// تابع کمکی برای دریافت داده‌ها
async function fetchData<T>(
  endpoint: string,
  token?: string,
): Promise<T> {
  try {
    const headerList = await headers();

    const host = headerList.get("host");
    const protocol =
      process.env.NODE_ENV === "development" ? "http" : "https";

    const baseUrl = `${protocol}://${host}`;

    const res = await fetch(`${baseUrl}/api${endpoint}`, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error(
        `Failed to fetch ${endpoint}: ${res.status} ${res.statusText}`,
      );
    }

    return (await res.json()) as T;
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return [] as T;
  }
}

export default async function Page() {
  // دریافت کوکی
  const cookieStore = await cookies();
  const token = cookieStore.get("authToken")?.value;

  // دریافت اطلاعات
  const addresses = await fetchData<Address[]>("/addresses", token);
  const accountInfo = await fetchData<AccountInfo>("/users/me", token);
  const orders = await fetchData<Order[]>("/orders", token);
  const supportTickets = await fetchData<SupportTicket[]>("/tickets", token);
  const wishlist = await fetchData<WishlistItem[]>("/wishlist", token);

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
        userId: accountInfo?.id,
      }}
      initialOrders={orders}
      initialSupportTickets={formattedTickets}
      initialWishlist={wishlist}
    />
  );
}