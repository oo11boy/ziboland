"use client";
import Link from "next/link";
import React, { useState } from "react";
import "./CategoriesContainer.css";
import { Categoryapi } from "@/types/types";
import Image from "next/image";

interface Props {
  categories: Categoryapi[];
}

export default function CategoriesContainer({ categories }: Props) {
  const [showAll, setShowAll] = useState(false);

  if (!categories || categories.length === 0) {
    return <div className="categories-container">هیچ دسته‌بندی یافت نشد</div>;
  }

  return (
    <div className="categories-container">
      <h2 className="categories-title yekanh">دسته‌بندی محصولات</h2>
      <div className="categories-wrapper">
        <div
          className={`categories-grid yekan ${
            !showAll ? "categories-grid--limited" : ""
          }`}
        >
          {categories.map((item) => (
            <Link
              key={item.id}
              href={`./search?mothercatId=${item.id}`}
              className="category-item"
            >
              <Image
                width={60}
                height={60}
                className="w-[60px] h-[60px] object-cover"
                src={item.link}
                alt={item.name}
              />
              <p className="category-text mt-2">{item.name}</p>
            </Link>
          ))}
        </div>

        {!showAll && (
          <div className="gradient-overlay">
            <button onClick={() => setShowAll(true)} className="toggle-button">
              مشاهده بیشتر
            </button>
          </div>
        )}

        {showAll && (
          <div className="close-button-wrapper">
            <button onClick={() => setShowAll(false)} className="close-button">
              بستن دسته‌ها
            </button>
          </div>
        )}
      </div>
    </div>
  );
}