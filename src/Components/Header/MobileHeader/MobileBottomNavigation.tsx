"use client";
import { Book, CategoryOutlined, HomeOutlined, PersonOutline, ShoppingBagOutlined } from '@mui/icons-material';
import Link from 'next/link';
import { useCart } from '@/ContextApi/CartContext'; // مسیر را بر اساس پروژه خود تنظیم کنید

export default function MobileBottomNavigation() {
  const {
    state: { cartItems },
  } = useCart();

  // تعداد کل آیتم‌های سبد خرید
  const totalItemsCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <>
      <div className='h-[70px] min-lg-none'></div>
      <div className="flex yekan border-t border-[#c7c7c7c7] min-lg-none justify-between items-center fixed bottom-0 z-50 w-full h-[70px] p-4 bg-black shadow-md text-white text-[13px] transition-all duration-300">
        
        <Link href={'/'} className='flex flex-col justify-center items-center'>
          <HomeOutlined/>
          <p>خانه</p>
        </Link>

        <Link href={'../category'} className='flex flex-col justify-center items-center'>
          <CategoryOutlined/>
          <p>دسته بندی</p>
        </Link>
      
        <Link href={'../cartlist'} className='flex flex-col justify-center items-center relative'>
          <div className="relative">
            <ShoppingBagOutlined/>
            {/* Badge تعداد سبد خرید */}
            {totalItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {totalItemsCount}
              </span>
            )}
          </div>
          <p>سبد خرید</p>
        </Link>

        <Link href={'../articles'} className='flex flex-col justify-center items-center'>
          <Book/>
          <p>وبلاگ</p>
        </Link>

        <Link href={'../myaccount'} className='flex flex-col justify-center items-center'>
          <PersonOutline/>
          <p>حساب</p>
        </Link>
      </div>
    </>
  );
}