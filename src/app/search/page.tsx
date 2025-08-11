"use client";
import { useSearchParams } from "next/navigation"; // برای دریافت query string
import FooterContainer from "@/Components/Footer/FooterContainer";
import MobileBottomNavigation from "@/Components/Header/MobileHeader/MobileBottomNavigation";
import MoblieHeaderTopTab from "@/Components/Header/MobileHeader/MoblieHeaderTopTab";
import WideHeaderContainer from "@/Components/Header/WideHeader/WideHeaderContainer";
import SearchPageContainer from "@/Components/SearchPageComponents/SearchPageContainer";
import React from "react";

export default function Page() {
  const searchParams = useSearchParams(); // دریافت query string
  const cat = searchParams.get("cat"); // دریافت مقدار cat
  const brands = searchParams.get("brands"); // دریافت مقدار brands

  // ساخت شیء برای پاس دادن به SearchPageContainer
  const queryParams = {
    cat: cat ? cat.split(",") : [], // تبدیل به آرایه اگر چند مقدار داشته باشد
    brands: brands ? brands.split(",") : [], // تبدیل به آرایه
  };

  return (
    <>
      <WideHeaderContainer />
      <MoblieHeaderTopTab />
      <SearchPageContainer queryParams={queryParams} />
      <FooterContainer />
      <MobileBottomNavigation />
    </>
  );
}