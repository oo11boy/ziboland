"use client";
import Link from "next/link";
import React, { useState, useEffect, JSX } from "react";
import "./CategoriesContainer.css";
import { PulseLoader } from "react-spinners";
import { useCat } from "@/ContextApi/CategoriesContext";

export default function CategoriesContainer() {
  const [showAll, setShowAll] = useState(false);

  const { loading, categories, error } = useCat();
console.log(categories)
  if (loading) {
    return (
      <div className="categories-container">
        <PulseLoader color="#b7adad" speedMultiplier={1} size={10} />
      </div>
    );
  }

  if (error) {
    return <div className="categories-container">خطا: {error}</div>;
  }

  if (categories.length === 0) {
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
              <img
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
