"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";

interface Benefit {
  id: number;
  title: string;
  description: string | null;
  image: string;
  link: string;
  is_active: boolean;
  display_order: number;
}

export default function BenefitsContainer() {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBenefits();
  }, []);

  const fetchBenefits = async () => {
    try {
      const res = await fetch("/api/benefits");
      if (res.ok) {
        const data = await res.json();
        setBenefits(data);
      } else {
        setError("خطا در دریافت مزایا");
      }
    } catch (error) {
      console.error("Error fetching benefits:", error);
      setError("خطا در ارتباط با سرور");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-4 yekan rounded-lg w-[95%] m-auto my-8 overflow-x-auto overflow-y-hidden">
        <div className="flex justify-center items-center h-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (error || benefits.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-4 yekan rounded-lg w-[95%] m-auto my-8 overflow-x-auto overflow-y-hidden">
      <div className="flex justify-between max-xl:flex-nowrap gap-4">
        {benefits.map((item) => (
          <Link
            key={item.id}
            href={item.link || "/#"}
            className="flex gap-4 transition-all duration-300 hover:scale-[1.1] items-center min-w-[200px] whitespace-nowrap"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-12 h-12 object-contain"
            />
            <div className="flex flex-col text-sm">
              <h2 className="font-semibold">{item.title}</h2>
              {item.description && (
                <p className="text-[12px]">{item.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}