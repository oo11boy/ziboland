"use client"
import { VisibilitySharp } from "@mui/icons-material";
import Link from "next/link";
import React, { useState } from "react";

export default function ArticlesListContainer() {
  const data = [
    {
      id: 1,
      img: "https://abzarreza.com/wp-content/uploads/2025/04/%D8%AA%D8%B5%D9%88%DB%8C%D8%B1-%D8%B9%DA%A9%D8%B3-%D8%B4%D8%A7%D8%AE%D8%B5-4.jpg",
      title: "بهترین مارک آچار بکس کدام است؟ + جدول مقایسه",
    },
    {
      id: 2,
      img: "https://abzarreza.com/wp-content/uploads/2025/04/%D8%AA%D8%B5%D9%88%DB%8C%D8%B1-%D8%B9%DA%A9%D8%B3-%D8%B4%D8%A7%D8%AE%D8%B5-3.jpg",
      title: "بهترین اره پروفیل بر؛ قدرتمندترین اره برای برش انواع پروفیل",
    },
    {
      id: 3,
      img: "https://abzarreza.com/wp-content/uploads/2025/04/%D8%AA%D8%B5%D9%88%DB%8C%D8%B1-%D8%B9%DA%A9%D8%B3-%D8%B4%D8%A7%D8%AE%D8%B5-9.jpg",
      title: "بهترین مارک اینورتر جوشکاری",
    },
    {
      id: 4,
      img: "https://abzarreza.com/wp-content/uploads/2025/04/%D8%AA%D8%B5%D9%88%DB%8C%D8%B1-%D8%B9%DA%A9%D8%B3-%D8%B4%D8%A7%D8%AE%D8%B5-8.jpg",
      title: "بهترین گریس پمپ سطلی کدام است؟",
    },
  ];

  const [hoveredId, setHoveredId] = useState<number | null>(null);

  return (
    <div className="w-[90%] mx-auto my-8 bg-white rounded-lg p-2">
      <div className="w-full my-8 flex justify-between items-center">
        <h2 className="text-2xl font-bold yekanh text-gray-800">مقالات</h2>
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 text-md text-black bg-gray-200 border border-[#d1d5dc] rounded-full shadow-sm hover:bg-gray-300 hover:shadow-md transition-all duration-300"
          style={{ backgroundImage: "linear-gradient(to right, #f3f4f6, #e5e7eb)" }}
        >
          <VisibilitySharp className="w-5 h-5 text-gray-600" />
          مشاهده همه
        </Link>
      </div>

      <div className="flex justify-between w-full">
        {data.map((item) => (
          <div
            key={item.id}
            className="relative rounded-xl overflow-hidden w-[23%]"
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <img
              className="w-full h-full object-cover transition-transform duration-300"
              src={item.img}
              alt={item.title}
            />
            <div
              className="absolute bottom-0 w-full p-4"
              style={{ backgroundImage: "linear-gradient(to top, #000, transparent)" }}
            >
              <h2 className="text-white text-md font-semibold font-vazir">
                {item.title}
              </h2>
            </div>
            <div
              className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${
                hoveredId === item.id ? "opacity-100" : "opacity-0"
              } bg-[#0000007c] backdrop-blur-sm`}
            >
              <Link
                href={`/article/${item.id}`}
                className="bg-white text-black px-4 py-2 rounded-lg font-vazir font-medium hover:bg-gray-200 transition-colors"
              >
                مشاهده مقاله
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}