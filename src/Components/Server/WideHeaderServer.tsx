import React from 'react'
import WideHeaderContainer from '../Header/WideHeader/WideHeaderContainer'
import { Categoryapi } from '@/types/types';
import { API } from '@/lib/MainRoutes';

export default async function WideHeaderServer() {
      // دریافت داده‌های دسته‌بندی‌ها
  const categoriesData: Categoryapi[] = await fetch(`${API}/categories`, {
    cache: "force-cache",
    next: { revalidate: 3600 },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error("Failed to fetch categories");
      }
      return res.json();
    })
    .catch((error) => {
      console.error("Error fetching categories:", error);
      return [];
    });

  return (
      <WideHeaderContainer categories={categoriesData} />
  )
}
