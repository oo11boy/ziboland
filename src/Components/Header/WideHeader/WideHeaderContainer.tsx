"use client";
import React, { useState, useEffect } from "react";
import "./WideHeader.css";
import WideHeaderContactUs from "./WideHeaderContactUs";
import WideHeaderMiddle from "./WideHeaderMiddle";
import MegaMenuWideHeader from "./MegaMenuWideHeader";
import { useAuth } from "@/ContextApi/AuthContext";

interface WideHeaderContainerProps {

  settings: any;
}

export default function WideHeaderContainer({
  
  settings,
}: WideHeaderContainerProps): React.JSX.Element | null {
  const { isAdminDashboard } = useAuth();
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // اگر بیشتر از 40 پیکسل (ارتفاع تقریبی بخش تماس با ما) اسکرول شد
      if (window.scrollY > 40) {
        setIsSticky(true);
      } else {
        setIsSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isAdminDashboard) {
    return null;
  }

  return (
    <header className="max-lg-none WideHeaderContactUs yekan relative">
      {/* این بخش با اسکرول بالا می‌رود و غیب می‌شود */}
      <WideHeaderContactUs settings={settings} />

      {/* این کانتینر وقتی اسکرول انجام شود، به بالای صفحه می‌چسبد */}
      <div
        className={`w-full z-[1000] transition-all duration-300 ${
          isSticky 
            ? "fixed top-0 left-0 shadow-md animate-slideDown" 
            : "relative"
        }`}
      >
        <WideHeaderMiddle />
        <MegaMenuWideHeader  />
      </div>
      
      {/* ایجاد یک فضای خالی (Spacer) برای جلوگیری از پرش صفحه هنگام چسبنده شدن */}
      {isSticky && <div className="h-[120px]" />} 
    </header>
  );
}