"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/ContextApi/CartContext";

interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: number;
  price_type: "single" | "wholesale";
  title: string;
  image?: string;
  color?: {
    persianName?: string;
    englishName?: string;
    hexCode?: string;
  } | null;
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

const formatAddress = (order: Order): string => {
  const parts = [
    order.province,
    order.city,
    order.street,
    order.alley ? `کوچه ${order.alley}` : "",
    order.building_number ? `پلاک ${order.building_number}` : "",
    order.unit ? `واحد ${order.unit}` : "",
    order.postal_code ? `کد پستی: ${order.postal_code}` : "",
  ];
  return parts.filter(Boolean).join("، ");
};

const formatPrice = (priceInRials: number): string => {
  const toman = priceInRials;
  return toman.toLocaleString("fa-IR");
};

export default function PaymentDone() {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
const { dispatch } = useCart();
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("orderId");

    if (!orderId) {
      setLoading(false);
      return;
    }

    fetch(`/api/orders/${orderId}`, { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error("سفارش یافت نشد");
        return res.json();
      })
      .then((data) => {
        setOrder(data);
        setLoading(false);
        dispatch({ type: "CLEAR_CART" });
        localStorage.removeItem("cartItems");
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [dispatch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-red-50 to-white">
        <div className="bg-white p-10 rounded-2xl shadow-2xl text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">سفارش یافت نشد</h2>
          <p className="text-gray-600 mb-8">متأسفانه سفارش شما پیدا نشد. لطفاً کد سفارش را بررسی کنید.</p>
          <Link href="/support" className="text-green-600 font-bold underline hover:text-green-700">
            تماس با پشتیبانی
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-green-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* کارت اصلی */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* هدر سبز موفقیت */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-12 px-8 text-center">
            <div className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-white/20 backdrop-blur mb-6">
              <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-3">پرداخت موفق!</h1>
            <p className="text-xl opacity-90">سفارش شما با موفقیت ثبت شد</p>
          </div>

          {/* محتوای اصلی */}
          <div className="p-8 md:p-12">
            {/* کد سفارش و مبلغ */}
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center mb-10">
              <p className="text-gray-600 mb-2">شماره سفارش</p>
              <p className="text-3xl md:text-4xl font-black text-green-700 tracking-wider">{order.order_code}</p>
              <p className="text-2xl mt-6 text-gray-800">
                مبلغ پرداختی: <span className="font-black text-green-700">{formatPrice(order.total_amount)} هزار تومان</span>
              </p>
            </div>

            {/* اطلاعات ارسال */}
            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-3 text-gray-800 flex items-center">
                  <span className="ml-2">📦</span> روش ارسال
                </h3>
                <p className="text-xl font-semibold text-green-700">
                  {order.shipping_method === "express" ? "ارسال پیشتاز (سریع)" : "ارسال عادی"}
                </p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6">
                <h3 className="font-bold text-lg mb-3 text-gray-800 flex items-center">
                  <span className="ml-2">🏠</span> آدرس تحویل
                </h3>
                <p className="text-gray-700 leading-relaxed">{formatAddress(order)}</p>
              </div>
            </div>

            {/* لیست محصولات */}
            <div className="mb-10">
              <h3 className="font-black text-2xl mb-6 text-gray-800 text-center">محصولات سفارش شما</h3>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6 flex items-center gap-6 shadow-md hover:shadow-lg transition-shadow"
                  >
                    {/* تصویر محصول */}
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-white shadow-sm flex-shrink-0">
                      <Image
                        src={item.image || "/placeholder.jpg"}
                        alt={item.title}
                        fill
                        className="object-contain p-2"
                      />
                    </div>

                    {/* اطلاعات محصول */}
                    <div className="flex-grow">
                      <h4 className="font-bold text-lg text-gray-800 mb-1">{item.title}</h4>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="text-gray-600">تعداد: <strong className="text-gray-900">{item.quantity}</strong></span>
                        {item.color && (
                          <span className="flex items-center gap-2">
                            رنگ:
                            <strong className="text-gray-900">
                              {item.color.persianName || item.color.englishName}
                            </strong>
                            {item.color.hexCode && (
                              <span
                                className="w-6 h-6 rounded-full border-2 border-gray-300 inline-block"
                                style={{ backgroundColor: item.color.hexCode }}
                              />
                            )}
                          </span>
                        )}
                        <span className="text-gray-600">
                          نوع قیمت: <strong className="text-green-700">{item.price_type === "wholesale" ? "عمده" : "تکی"}</strong>
                        </span>
                      </div>
                    </div>

                    {/* قیمت */}
                    <div className="text-left">
                      <p className="text-2xl font-black text-gray-900">{formatPrice(item.unit_price * item.quantity)} تومان</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* دکمه‌های نهایی */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center mt-12">
              <Link
                href="/userdashboard"
                className="px-10 py-5 bg-green-600 hover:bg-green-700 text-white font-bold text-lg rounded-2xl text-center shadow-lg hover:shadow-xl transition-all"
              >
                مشاهده سفارشات من
              </Link>
              <Link
                href="/"
                className="px-10 py-5 bg-gray-700 hover:bg-gray-800 text-white font-bold text-lg rounded-2xl text-center shadow-lg hover:shadow-xl transition-all"
              >
                بازگشت به فروشگاه
              </Link>
            </div>

            {/* پیام تشکر */}
            <p className="text-center text-gray-600 mt-10 text-lg">
              از خرید شما متشکریم 💚 | تیم زیبولند
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}