"use client";
import MoblieHeaderTopTab from "@/Components/Header/MobileHeader/MoblieHeaderTopTab";
import React, { useState, useEffect } from "react";

export default function MobileCategoryMegaMenuSkeleton() {
  const [isVisible, setIsVisible] = useState(true);

  // اطمینان از نمایش حداقل 2 ثانیه
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true); // این فقط برای اطمینان از نمایش است، در عمل توسط Suspense کنترل می‌شود
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <>
    <MoblieHeaderTopTab/>
    <div className="relative flex h-screen flex-col bg-white">
      {/* Header Skeleton */}
      <div className="flex h-14 items-center justify-between px-4 text-gray-900 shadow-sm bg-white">
        <div className="w-8 h-8 bg-gray-200 rounded animate-shimmer" />
        <div className="w-32 h-6 bg-gray-200 rounded animate-shimmer yekan mx-auto" />
        <div className="w-8 h-8 bg-gray-200 rounded animate-shimmer" />
      </div>

      {/* Category Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 px-3 pt-6">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="flex flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white p-3 category-card"
          >
            {/* Icon Skeleton */}
            <div className="w-8 h-8 bg-gray-200 rounded-full animate-shimmer" />
            {/* Title Skeleton */}
            <div className="w-20 h-4 bg-gray-200 rounded animate-shimmer" />
          </div>
        ))}
      </div>
    </div>

    
    </>
  );
}