import ArticlePage from '@/Components/Articles/ArticlePage/ArticlePage'
import FooterContainer from '@/Components/Footer/FooterContainer'
import MobileBottomNavigation from '@/Components/Header/MobileHeader/MobileBottomNavigation'
import MoblieHeaderTopTab from '@/Components/Header/MobileHeader/MoblieHeaderTopTab'
import WideHeaderContainer from '@/Components/Header/WideHeader/WideHeaderContainer'

import React from 'react'

export default function page() {
  return (
    <>
  
          <WideHeaderContainer />
          <MoblieHeaderTopTab />

<ArticlePage
  title="بررسی عناصری که برای صفحه مقالات در یک اپلیکیشن خبری نیاز است."
  author="دی اولیویرا تریستان"
  date="۲۰ خرداد ۱۳۹۸"
  avatar="https://www.w3schools.com/howto/img_avatar.png"
  coverImage="https://images.unsplash.com/photo-1476820865390-c52aeebb9891?auto=format&fit=crop&w=2850&q=80"
  shareLink="https://dribbble.com/shots/11499703-Article-Components"
  content={[
    "این یک متن نمونه برای توضیحات مقاله است.",
    "امکان افزودن پاراگراف‌های بیشتر نیز وجود دارد.",
    "در پایان می‌توان خلاصه‌ای از محتوا یا نتیجه‌گیری کلی قرار داد."
  ]}
/>

     <FooterContainer />
          <MobileBottomNavigation />
            
    </>
  )
}
