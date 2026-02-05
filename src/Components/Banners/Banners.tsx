"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { API } from "@/lib/MainRoutes";

interface Banner {
  id: number;
  image: string;
  alt: string;
  link: string;
  text: string | null;
}

export default function Banners() {
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    fetch(`${API}/banners`)
      .then((res) => res.json())
      .then(setBanners)
      .catch((err) => console.error("Error fetching banners:", err));
  }, []);

  if (banners.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 w-[95%] mx-auto gap-5 md:gap-6 lg:gap-8">
      {banners.map((banner) => (
        <Link
          key={banner.id}
          href={banner.link || "#"}
          className="group relative block overflow-hidden rounded-xl shadow-sm transition-all duration-300 hover:shadow-lg active:scale-[0.98]"
        >
          {/* لایه سپسری برای افکت روشن شدن */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 z-10 pointer-events-none" />

          <img
            src={banner.image}
            alt={banner.alt}
            className="w-full h-auto object-cover transition-all duration-500 ease-out group-hover:scale-105 group-hover:brightness-110"
            loading="lazy"
          />

          {banner.text && (
            <div className="absolute bottom-5 left-5 md:bottom-6 md:left-6 bg-white/85 backdrop-blur-sm px-4 py-2.5 rounded-lg text-sm md:text-base font-medium text-gray-800 shadow-sm transition-all duration-300 group-hover:bg-white/95 group-hover:scale-105">
              {banner.text}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
}