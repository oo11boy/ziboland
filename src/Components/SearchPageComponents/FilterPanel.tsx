import { motion, AnimatePresence } from "framer-motion";
import Slider from "rc-slider";
import {
  Category,
  ExpandLess,
  ExpandMore,
  FilterAlt,
  PriceChange,
  Star,
  Store,
} from "@mui/icons-material";
import { Categoryapi } from "@/types/types";
import { memo, useState, useEffect, useRef } from "react";
import "rc-slider/assets/index.css";

interface FilterPanelProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  updateSearchQuery: (value: string) => void; // جدید: برای آپدیت URL
  clearFilters: () => void;
  categorySearch: string;
  setCategorySearch: (value: string) => void;
  filteredCategories: Categoryapi[];
  selectedMothercatIds: number[];
  setSelectedMothercatIds: React.Dispatch<React.SetStateAction<number[]>>;
  expandedMothercats: number[];
  toggleMothercatExpansion: (id: number) => void;
  selectedSubcatIds: number[];
  setSelectedSubcatIds: React.Dispatch<React.SetStateAction<number[]>>;
  expandedSubcats: number[];
  toggleSubcatExpansion: (id: number) => void;
  selectedItemIds: number[];
  setSelectedItemIds: React.Dispatch<React.SetStateAction<number[]>>;
  brandSearch: string;
  setBrandSearch: (value: string) => void;
  allBrands: string[];
  selectedBrands: string[];
  setSelectedBrands: React.Dispatch<React.SetStateAction<string[]>>;
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
  rating: number;
  setRating: (value: number) => void;
  discount: boolean;
  setDiscount: (value: boolean) => void;
  inStock: boolean;
  setInStock: (value: boolean) => void;
}

export default function FilterPanel({
  searchTerm,
  setSearchTerm,
  updateSearchQuery,
  clearFilters,
  categorySearch,
  setCategorySearch,
  filteredCategories,
  selectedMothercatIds,
  setSelectedMothercatIds,
  expandedMothercats,
  toggleMothercatExpansion,
  selectedSubcatIds,
  setSelectedSubcatIds,
  expandedSubcats,
  toggleSubcatExpansion,
  selectedItemIds,
  setSelectedItemIds,
  brandSearch,
  setBrandSearch,
  allBrands,
  selectedBrands,
  setSelectedBrands,
  priceRange,
  setPriceRange,
  rating,
  setRating,
  discount,
  setDiscount,
  inStock,
  setInStock,
}: FilterPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="hidden lg:flex flex-col gap-4 w-full lg:w-1/4 h-fit rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)] p-4 sticky top-4 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300"
    >
      {/* Header */}
      <div className="flex justify-between items-center pb-2 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-700 flex items-center gap-2">
          <FilterAlt className="text-[#805B99]" />
          فیلترها
        </h2>
        <button
          onClick={clearFilters}
          className="text-[#805B99] hover:text-[#7C3AED] transition-colors text-sm font-semibold"
        >
          حذف
        </button>
      </div>

      {/* Search */}
      <div className="bg-gray-50 p-3 rounded-xl hover:shadow-sm transition">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
          <Category className="text-[#805B99]" /> جستجو
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            const value = e.target.value;
            setSearchTerm(value);
            updateSearchQuery(value); // آپدیت URL همزمان با تایپ کاربر
          }}
          placeholder="نام محصول..."
          className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#805B99] outline-none transition"
        />
      </div>

      {/* Category Section (سه سطحی) */}
      <div className="bg-gray-50 p-3 rounded-xl hover:shadow-sm transition">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
          <Category className="text-[#805B99]" /> دسته‌بندی‌ها
        </label>
        <input
          type="text"
          value={categorySearch}
          onChange={(e) => setCategorySearch(e.target.value)}
          placeholder="جستجو در دسته‌ها..."
          className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg mb-3 focus:ring-2 focus:ring-[#805B99] outline-none"
        />
        <div className="max-h-[45vh] overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
          {filteredCategories.map((cat) => (
            <div key={cat.id} className="bg-white rounded-lg border border-gray-100 p-2">
              {/* سطح اول - مادر */}
              <div className="flex justify-between items-center">
                <label className="text-sm flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedMothercatIds.includes(cat.id)}
                    onChange={() => {
                      setSelectedMothercatIds((prev) =>
                        prev.includes(cat.id)
                          ? prev.filter((id) => id !== cat.id)
                          : [...prev, cat.id]
                      );
                      if (!selectedMothercatIds.includes(cat.id)) {
                        setSelectedSubcatIds([]);
                        setSelectedItemIds([]);
                      }
                    }}
                    className="accent-[#805B99]"
                  />
                  {cat.name}
                </label>
                {cat.subcat?.length > 0 && (
                  <button
                    onClick={() => toggleMothercatExpansion(cat.id)}
                    className="text-[#805B99]"
                  >
                    {expandedMothercats.includes(cat.id) ? (
                      <ExpandLess fontSize="small" />
                    ) : (
                      <ExpandMore fontSize="small" />
                    )}
                  </button>
                )}
              </div>

              {/* سطح دوم - زیر‌دسته */}
              <AnimatePresence>
                {expandedMothercats.includes(cat.id) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pl-4 mt-2 space-y-1 border-l border-gray-100"
                  >
                    {cat.subcat?.map((subcat) => (
                      <div key={subcat.id} className="mb-1">
                        <div className="flex justify-between items-center">
                          <label className="text-sm flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedSubcatIds.includes(subcat.id)}
                              onChange={() => {
                                setSelectedSubcatIds((prev) =>
                                  prev.includes(subcat.id)
                                    ? prev.filter((id) => id !== subcat.id)
                                    : [...prev, subcat.id]
                                );
                                if (!selectedSubcatIds.includes(subcat.id)) {
                                  setSelectedItemIds([]);
                                }
                              }}
                              className="accent-[#805B99]"
                            />
                            {subcat.name}
                          </label>
                          {subcat.items?.length > 0 && (
                            <button
                              onClick={() => toggleSubcatExpansion(subcat.id)}
                              className="text-[#805B99]"
                            >
                              {expandedSubcats.includes(subcat.id) ? (
                                <ExpandLess fontSize="small" />
                              ) : (
                                <ExpandMore fontSize="small" />
                              )}
                            </button>
                          )}
                        </div>

                        {/* سطح سوم - آیتم‌ها */}
                        <AnimatePresence>
                          {expandedSubcats.includes(subcat.id) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              className="pl-4 mt-2 space-y-1 border-l border-gray-100"
                            >
                              {subcat.items?.map((item) => (
                                <label key={item.id} className="text-sm flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={selectedItemIds.includes(item.id)}
                                    onChange={() => {
                                      setSelectedItemIds((prev) =>
                                        prev.includes(item.id)
                                          ? prev.filter((id) => id !== item.id)
                                          : [...prev, item.id]
                                      );
                                    }}
                                    className="accent-[#805B99]"
                                  />
                                  {item.name}
                                </label>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Brand */}
      <div className="bg-gray-50 p-3 rounded-xl hover:shadow-sm transition">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
          <Store className="text-[#805B99]" /> برند
        </label>
        <input
          type="text"
          value={brandSearch}
          onChange={(e) => setBrandSearch(e.target.value)}
          placeholder="جستجوی برند..."
          className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg mb-3 focus:ring-2 focus:ring-[#805B99] outline-none"
        />
        <div className="max-h-32 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
          {allBrands
            .filter((b) => b.toLowerCase().includes(brandSearch.toLowerCase()))
            .map((brand) => (
              <label key={brand} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={selectedBrands.includes(brand)}
                  onChange={() =>
                    setSelectedBrands((prev) =>
                      prev.includes(brand)
                        ? prev.filter((b) => b !== brand)
                        : [...prev, brand]
                    )
                  }
                  className="accent-[#805B99]"
                />
                {brand}
              </label>
            ))}
        </div>
      </div>

      {/* Price Range (Fixed Scroll) */}
      <StablePriceRange priceRange={priceRange} setPriceRange={setPriceRange} />

      {/* Rating */}
      <div className="bg-gray-50 p-3 rounded-xl hover:shadow-sm transition">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
          <Star className="text-[#805B99]" /> حداقل امتیاز
        </label>
        <input
          type="number"
          min="0"
          max="5"
          step="0.5"
          value={rating}
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            setRating(!isNaN(value) ? value : 0);
          }}
          className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#805B99] text-center outline-none"
        />
      </div>

      {/* Toggles */}
      <div className="flex flex-col gap-2 bg-gray-50 p-3 rounded-xl hover:shadow-sm transition">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={discount}
            onChange={(e) => setDiscount(e.target.checked)}
            className="accent-[#805B99]"
          />
          فقط تخفیف‌دار
        </label>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => setInStock(e.target.checked)}
            className="accent-[#805B99]"
          />
          فقط موجود
        </label>
      </div>
    </motion.div>
  );
}

/* کامپوننت محدوده قیمت – بدون مشکل scroll jump و با تجربه کاربری عالی */
const StablePriceRange = memo(function StablePriceRange({
  priceRange,
  setPriceRange,
}: {
  priceRange: [number, number];
  setPriceRange: (range: [number, number]) => void;
}) {
  const [tempRange, setTempRange] = useState<[number, number]>(priceRange);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTempRange(priceRange);
  }, [priceRange]);

  return (
    <div
      ref={containerRef}
      className="bg-gray-50 p-3 rounded-xl hover:shadow-sm transition"
    >
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
        <PriceChange className="text-[#805B99]" /> محدوده قیمت
      </label>
      <Slider
        range
        min={0}
        max={5000000}
        step={10000}
        value={tempRange}
        onChange={(v) => setTempRange(v as [number, number])}
        onAfterChange={(v) => setPriceRange(v as [number, number])}
        trackStyle={{ backgroundColor: "#805B99", height: 6 }}
        handleStyle={{
          borderColor: "#805B99",
          backgroundColor: "#fff",
          width: 18,
          height: 18,
        }}
        railStyle={{ backgroundColor: "#E5E7EB", height: 6 }}
      />
      <div className="flex justify-between text-xs text-gray-600 mt-3">
        <span>{tempRange[0].toLocaleString("fa-IR")} تومان</span>
        <span>{tempRange[1].toLocaleString("fa-IR")} تومان</span>
      </div>
    </div>
  );
});