import React from 'react'
import WideHeaderContainer from './WideHeaderContainer'
import { Categoryapi } from '@/types/types';
import { API } from '@/lib/MainRoutes';

export default async function WideHeaderServer() {
      // دریافت داده‌های دسته‌بندی‌ها
  const categoriesData: Categoryapi[] = await fetch(`${API}/categories`, {
    cache: "force-cache",
    next: { revalidate: 60 },
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


        const settings = await fetch(`${API}/settings`, {
             cache: 'force-cache', 
             next: { revalidate: 3600 }, 
           })
             .then((res) => {
               if (!res.ok) {
                 throw new Error('Failed to fetch settings');
               }
               return res.json();
             })
             .catch((error) => {
               console.error('Error fetching settings:', error);
               return []; 
             }); 
  return (
      <WideHeaderContainer categories={categoriesData}  settings={settings}/>
  )
}
