"use client";
import React, { useState, useEffect } from "react";

export default function HomePageSkeleton() {
  const [isVisible, setIsVisible] = useState(true);

  // اطمینان از نمایش حداقل 2 ثانیه
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true); // توسط Suspense مدیریت می‌شود
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="w-full bg-white">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center fixed z-50 w-full h-[60px] p-4 bg-black shadow-md">
        <div className="flex justify-start items-center gap-2">
          <div className="w-24 h-6 bg-gray-300 rounded animate-shimmer yekan" />
        </div>
        <div className="flex justify-end gap-2">
          <div className="w-8 h-8 bg-gray-300 rounded-full animate-shimmer" />
          <div className="w-8 h-8 bg-gray-300 rounded-full animate-shimmer" />
          <div className="w-8 h-8 bg-gray-300 rounded-full animate-shimmer" />
        </div>
      </div>
      <div className="h-[70px] w-full" />

      {/* Wide Slider Skeleton */}
      <div className="w-full mx-auto py-5 relative">
        <div className="w-full h-[300px] md:h-[450px] lg:h-[550px] bg-gray-200 rounded-lg animate-shimmer" />
        <div className="absolute bottom-8 right-40 flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-300 rounded-full animate-shimmer" />
          <div className="w-10 h-10 bg-gray-300 rounded-full animate-shimmer" />
          <div className="w-10 h-10 bg-gray-300 rounded-full animate-shimmer" />
        </div>
      </div>

      {/* Tab Products Slider Skeleton */}
      <div className="w-[90%] mx-auto my-8 bg-white rounded-lg p-2 relative">
        <div className="w-full mb-8 mt-2 flex justify-between items-center">
          <div className="w-32 h-6 bg-gray-200 rounded animate-shimmer yekan" />
          <div className="w-24 h-8 bg-gray-200 rounded-full animate-shimmer" />
        </div>
        <div className="flex gap-2 mb-4">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="w-20 h-8 bg-gray-200 rounded animate-shimmer" />
          ))}
        </div>
        <div className="flex gap-2">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="w-[165px] h-[250px] bg-white border border-[#EBEBEB] rounded-lg flex flex-col items-center justify-between p-2"
            >
              <div className="w-32 h-32 bg-gray-200 rounded animate-shimmer" />
              <div className="w-24 h-4 bg-gray-200 rounded animate-shimmer" />
              <div className="w-20 h-4 bg-gray-200 rounded animate-shimmer" />
              <div className="flex justify-between w-full">
                <div className="w-16 h-4 bg-gray-200 rounded animate-shimmer" />
                <div className="w-10 h-8 bg-gray-200 rounded animate-shimmer" />
              </div>
              <div className="absolute top-2 left-2 w-10 h-4 bg-gray-300 rounded animate-shimmer" />
            </div>
          ))}
        </div>
      </div>

      {/* Product Slider Skeleton (VIP) */}
      <div className="w-[90%] mx-auto my-8 bg-[#805B99] rounded-lg p-4 relative">
        <div className="w-full mb-2 flex justify-end">
          <div className="w-24 h-6 bg-gray-300 rounded animate-shimmer yekan" />
        </div>
        <div className="flex gap-2">
          <div className="w-[120px] h-[250px] bg-gray-300 rounded-lg animate-shimmer flex items-center justify-center">
            <div className="w-24 h-6 bg-gray-200 rounded animate-shimmer yekan" />
          </div>
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="w-[140px] h-[250px] bg-white rounded-lg flex flex-col items-center justify-between p-2"
            >
              <div className="w-32 h-32 bg-gray-200 rounded animate-shimmer" />
              <div className="w-24 h-4 bg-gray-200 rounded animate-shimmer" />
              <div className="flex justify-between w-full">
                <div className="w-16 h-4 bg-gray-200 rounded animate-shimmer" />
                <div className="w-10 h-8 bg-gray-200 rounded animate-shimmer" />
              </div>
              <div className="absolute top-2 left-2 w-10 h-4 bg-gray-300 rounded animate-shimmer" />
            </div>
          ))}
        </div>
        <div className="absolute top-1/2 right-2 transform -translate-y-1/2 w-10 h-10 bg-gray-300 rounded-lg animate-shimmer" />
        <div className="absolute top-1/2 left-2 transform -translate-y-1/2 w-10 h-10 bg-gray-300 rounded-lg animate-shimmer" />
      </div>
    </div>
  );
}