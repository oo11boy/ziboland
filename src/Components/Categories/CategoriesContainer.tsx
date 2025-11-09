"use client";
import Link from "next/link";
import React, { useState, useEffect, JSX } from "react";
import "./CategoriesContainer.css";
import { PulseLoader } from "react-spinners";

interface Category {
  id: number;
  name: string;
  link: string;
  icon: string;
}

export default function CategoriesContainer() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getIconComponent = (iconName: string): JSX.Element => {
    const formattedIconName = iconName
      .replace(/([A-Z])/g, "_$1")
      .toLowerCase()
      .slice(1);
    return (
      <span className="material-icons category-icon">
        {formattedIconName}
      </span>
    );
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
     const response = await fetch("/api/categories", { next: { revalidate: 60 } });

        if (!response.ok) {
          throw new Error("خطا در دریافت دسته‌بندی‌ها");
        }
        const data: Category[] = await response.json();
        setCategories(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return <div className="categories-container">
       <PulseLoader color="#b7adad" speedMultiplier={1} size={10} />
     
    </div>;
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
            <Link key={item.id} href={`./search?mothercatId=${item.id}`} className="category-item">
              {getIconComponent(item.icon)}
              <p className="category-text">{item.name}</p>
            </Link>
          ))}
        </div>

        {!showAll && (
          <div className="gradient-overlay">
            <button
              onClick={() => setShowAll(true)}
              className="toggle-button"
            >
              مشاهده بیشتر
            </button>
          </div>
        )}

        {showAll && (
          <div className="close-button-wrapper">
            <button
              onClick={() => setShowAll(false)}
              className="close-button"
            >
              بستن دسته‌ها
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
