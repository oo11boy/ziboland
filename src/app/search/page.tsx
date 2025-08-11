"use client";
import { useSearchParams } from "next/navigation";
import FooterContainer from "@/Components/Footer/FooterContainer";
import MobileBottomNavigation from "@/Components/Header/MobileHeader/MobileBottomNavigation";
import MoblieHeaderTopTab from "@/Components/Header/MobileHeader/MoblieHeaderTopTab";
import WideHeaderContainer from "@/Components/Header/WideHeader/WideHeaderContainer";
import SearchPageContainer from "@/Components/SearchPageComponents/SearchPageContainer";
import React from "react";

export default function Page() {
  const searchParams = useSearchParams();
  const mothercatId = searchParams.get("mothercatId");
  const subcatId = searchParams.get("subcatId");
  const brands = searchParams.get("brands");

  const queryParams = {
    mothercatId: mothercatId || undefined,
    subcatId: subcatId || undefined,
    brands: brands ? brands.split(",") : [],
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