
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/ContextApi/CartContext";

// --- اینترفیس‌ها ---
interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  price_type: "single" | "wholesale";
  title: string;
  image?: string;
  color?: { persianName?: string; englishName?: string; hexCode?: string; } | null;
}

interface Order {
  id: number;
  order_code: string;
  total_amount: number;
  shipping_method: string;
  province: string;
  city: string;
  street: string;
  alley?: string;
  building_number?: string;
  unit?: string;
  postal_code?: string;
  items: OrderItem[];
}

// --- توابع کمکی ---
const formatAddress = (order: Order): string => {
  const parts = [
    order.province, order.city, order.street,
    order.alley ? `کوچه ${order.alley}` : "",
    order.building_number ? `پلاک ${order.building_number}` : "",
    order.unit ? `واحد ${order.unit}` : "",
    order.postal_code ? `کد پستی: ${order.postal_code}` : "",
  ];
  return parts.filter(Boolean).join("، ");
};

const rialToToman = (priceInRial: number) => priceInRial / 10;
const formatPrice = (price: number): string => price.toLocaleString("fa-IR");

export default function PaymentDone() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const { dispatch } = useCart();

  const handlePrint = () => window.print();

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("orderId");
    if (!orderId) { setLoading(false); return; }

    fetch(`/api/orders/${orderId}`, { credentials: "include" })
      .then((res) => { if (!res.ok) throw new Error("سفارش یافت نشد"); return res.json(); })
      .then((data) => {
        setOrder(data);
        setLoading(false);
        dispatch({ type: "CLEAR_CART" });
        localStorage.removeItem("cartItems");
      })
      .catch((err) => { console.error(err); setLoading(false); });
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600 mb-4"></div>
        <p className="text-gray-600 font-bold">در حال پردازش اطلاعات سفارش...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center max-w-sm">
          <h2 className="text-2xl font-bold text-red-600 mb-4">خطا در دریافت سفارش</h2>
          <Link href="/" className="block w-full bg-red-600 text-white py-3 rounded-xl font-bold">بازگشت به سایت</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4">
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .printable-area, .printable-area * { visibility: visible; }
          .printable-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0; padding: 0; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* بخش فاکتور (این بخش چاپ می‌شود) */}
      <div className="max-w-3xl mx-auto printable-area bg-white shadow-2xl rounded-3xl overflow-hidden">
        {/* هدر موفقیت */}
        <div className="bg-green-600 text-white py-10 px-8 text-center border-b-4 border-green-700">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h1 className="text-3xl font-black">پرداخت موفق بود!</h1>
          <p className="mt-2 opacity-90">سفارش شما با موفقیت ثبت شد و در صف پردازش قرار گرفت.</p>
        </div>

        {/* اطلاعات سفارش */}
        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-6 rounded-2xl">
            <div>
              <p className="text-gray-500 text-sm">شماره سفارش</p>
              <p className="font-black text-xl text-gray-800">{order.order_code}</p>
            </div>
            <div>
              <p className="text-gray-500 text-sm">مبلغ پرداختی</p>
              <p className="font-black text-xl text-green-700">{formatPrice(rialToToman(order.total_amount))} تومان</p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-gray-800 mb-3 border-b pb-2">محصولات خریداری شده</h3>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-2">
                  <div className="w-16 h-16 rounded-lg overflow-hidden border">
                    <Image src={item.image || "/placeholder.jpg"} alt={item.title} width={64} height={64} className="object-cover" />
                  </div>
                  <div className="flex-grow">
                    <p className="font-bold text-gray-800">{item.title}</p>
                    <p className="text-sm text-gray-500">تعداد: {item.quantity} عدد</p>
                  </div>
                  <p className="font-bold text-gray-700">{formatPrice(item.unit_price * item.quantity)} تومان</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-bold text-gray-800 mb-2">اطلاعات ارسال</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{formatAddress(order)}</p>
          </div>
        </div>
      </div>

      {/* دکمه‌های عملیاتی (در هنگام چاپ مخفی می‌شوند) */}
      <div className="max-w-3xl mx-auto mt-8 flex flex-col sm:flex-row gap-4 no-print">
        <button 
          onClick={handlePrint}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-2"
        >
          <span>🖨️</span> چاپ فاکتور
        </button>
        <Link href="/userdashboard" className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-bold transition-all shadow-lg text-center">
          مشاهده سفارشات
        </Link>
        <Link href="/" className="flex-1 bg-gray-700 hover:bg-gray-800 text-white py-4 rounded-2xl font-bold transition-all shadow-lg text-center">
          بازگشت به فروشگاه
        </Link>
      </div>
    </div>
  );
}

