"use client";
import { useSearchParams } from "next/navigation";
import SearchPageContainer from "@/Components/SearchPageComponents/SearchPageContainer";
import React from "react";

export default function SearchPageClient() {
  const searchParams = useSearchParams();
  const mothercatId = searchParams.get("mothercatId");
  const subcatId = searchParams.get("subcatId");
  const brands = searchParams.get("brands");

  const queryParams = {
    mothercatId: mothercatId || undefined,
    subcatId: subcatId || undefined,
    brands: brands ? brands.split(",") : [],
  };

  return <SearchPageContainer queryParams={queryParams} />;
}
