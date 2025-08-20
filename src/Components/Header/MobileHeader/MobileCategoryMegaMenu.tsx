"use client";
import React, { useState, useCallback, useEffect, JSX } from "react";
import { ArrowBack } from "@mui/icons-material";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./MobileHeader.css";
import { Categoryapi } from "@/types/types";


// Function to get Google Material Icon
const getIconComponent = (iconName: string): JSX.Element => {
  const formattedIconName = iconName
    .replace(/([A-Z])/g, "_$1")
    .toLowerCase()
    .slice(1);

  return (
    <span className="material-icons h-8 w-8 text-[#805B99]" aria-label={formattedIconName}>
      {formattedIconName}
    </span>
  );
};

export default function MobileCategoryMegaMenu() {
  const [openCategory, setOpenCategory] = useState<number | null>(null);
  const [openSubCategory, setOpenSubCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<Categoryapi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/api/categories");
        if (!response.ok) {
          throw new Error("Failed to fetch categories");
        }
        const categoriesData: Categoryapi[] = await response.json();
        setCategories(categoriesData);
        setLoading(false);
      } catch (err) {
        setError("خطا در بارگذاری دسته‌بندی‌ها. لطفاً دوباره تلاش کنید.");
        setLoading(false);
        toast.error("خطا در بارگذاری دسته‌بندی‌ها", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "colored",
        });
      }
    };

    fetchCategories();
  }, []);

  // Toggle category
  const toggleCategory = useCallback(
    (id: number) => {
      setOpenCategory(openCategory === id ? null : id);
      setOpenSubCategory(null);
    },
    [openCategory]
  );

  // Toggle subcategory
  const toggleSubCategory = useCallback(
    (id: number) => {
      setOpenSubCategory(openSubCategory === id ? null : id);
    },
    [openSubCategory]
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <p className="text-[#374151] text-lg">در حال بارگذاری...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-white">
        <p className="text-[#374151] text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative lg:mt-4 flex h-screen flex-col bg-white">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        style={{ zIndex: 99999, top: 0, width: "100%", padding: "10px" }}
      />
      {/* Header */}
      <div className="flex h-14 items-center yekan justify-between px-4 text-gray-900 shadow-sm bg-white">
        <div></div>
        <span className="header-title yekan text-center w-full">دسته‌بندی‌ها</span>
      </div>

      {/* Category Grid */}
      <div className="grid font-semibold grid-cols-2 lg:grid-cols-4 gap-2 px-3 pt-6">
        {categories.map(
          (item: Categoryapi) =>
            item.mothercat === 1 && (
              <div key={item.id} className="relative">
                <label
                  htmlFor={`category-${item.id}`}
                  className="flex flex-col items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white p-3 text-gray-900 hover:bg-gray-50 cursor-pointer category-card"
                >
                  {getIconComponent(item.icon)}
                  <span className="text-primary text-center font-semibold">{item.name}</span>
                </label>
                <input
                  id={`category-${item.id}`}
                  type="checkbox"
                  className="peer hidden"
                  checked={openCategory === item.id}
                  onChange={() => toggleCategory(item.id)}
                />
                <div
                  className={`fixed inset-0 z-10 flex flex-col bg-white overflow-auto sub-menu ${
                    openCategory === item.id ? "open" : ""
                  }`}
                >
                  {/* Sub-Menu Header */}
                  <div className="flex h-14 items-center justify-between px-4 text-gray-900 shadow-sm bg-white">
                    <span className="text-primary">
                      همه محصولات{" "}
                      <a href={`/search?mothercatId=${item.id}`} className="text-[#805B99] hover:underline">
                        {item.name}
                      </a>
                    </span>
                    <button
                      onClick={() => setOpenCategory(null)}
                      aria-label="بازگشت به دسته‌بندی‌های اصلی"
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      <ArrowBack />
                    </button>
                  </div>
                  {/* Sub-Menu Content */}
                  <div className="flex w-full flex-col bg-white p-3">
                    {item.subcat.map((sub) => (
                      <div
                        key={sub.id}
                        className={`sub-item ${openCategory === item.id ? "open" : ""}`}
                      >
                        <button
                          onClick={() => toggleSubCategory(sub.id)}
                          className="flex w-full items-center justify-between px-3 py-3 text-gray-900 border-b border-gray-200"
                          aria-expanded={openSubCategory === sub.id}
                        >
                          <span className="text-primary">
                            <a
                              href={`/search?mothercatId=${item.id}&subcatId=${sub.id}`}
                              className="text-gray-900 hover:text-[#805B99]"
                            >
                              {sub.name}
                            </a>
                          </span>
                          <span
                            className={`material-icons h-5 w-5 arrow ${
                              openSubCategory === sub.id ? "open" : ""
                            }`}
                          >
                            expand_more
                          </span>
                        </button>
                        {openSubCategory === sub.id && (
                          <div className="pl-4">
                            {sub.items.map((subItem) => (
                              <div key={subItem.id} className="py-1">
                                <a
                                  href={`/search?mothercatId=${item.id}&subcatId=${sub.id}`}
                                  className="block px-3 py-2 text-secondary hover:text-[#805B99] hover:bg-indigo-50 rounded-md"
                                >
                                  {subItem.name}
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )
        )}
      </div>
    </div>
  );
}