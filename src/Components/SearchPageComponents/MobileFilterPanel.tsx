import { motion, AnimatePresence, Variants } from "framer-motion";
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
import { Categoryapi, Product } from "@/types/types";

interface MobileFilterPanelProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
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
  filteredProducts: Product[];
  filterVariants: Variants;
}

export default function MobileFilterPanel({
  filteredProducts,
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
  filterVariants,
  searchTerm,
  setSearchTerm,
}: MobileFilterPanelProps) {
  return (
    <motion.div
      variants={filterVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="fixed inset-x-0 bottom-0 top-16 bg-white z-50 overflow-y-auto pb-20 lg:hidden"
    >
      <div className="p-4">
        {/* هدر فیلتر موبایل */}
        <div className="flex sticky top-0 bg-white py-4 justify-between items-center border-b border-gray-200 mb-4">
          <h2 className="text-lg font-bold text-[#374151] flex items-center">
            <FilterAlt className="ml-2 text-[#805b99]" /> فیلترها
          </h2>
          <div className="text-sm text-[#374151]">
            تعداد نتایج: {filteredProducts.length}
          </div>
          <button
            onClick={clearFilters}
            className="text-[#805b99] font-bold text-sm"
            aria-label="حذف همه فیلترها"
          >
            حذف فیلترها
          </button>
        </div>

        {/* جستجوی کلی محصولات (اضافه شده برای هماهنگی با دسکتاپ) */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
            <Category className="text-[#805b99]" /> جستجو
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="نام محصول..."
            className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#805b99] outline-none transition"
          />
        </div>

        {/* دسته‌بندی‌ها */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-[#374151] flex items-center">
            <Category className="ml-2 text-[#805b99]" /> دسته‌بندی‌ها
          </label>
          <input
            type="text"
            value={categorySearch}
            onChange={(e) => setCategorySearch(e.target.value)}
            placeholder="جستجو در دسته‌بندی‌ها..."
            className="w-full p-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#805b99] mb-3"
          />
          <div className="max-h-[50vh] overflow-y-auto space-y-3">
            {filteredCategories.map((cat) => (
              <div key={cat.id} className="border-b border-gray-100 pb-3 last:border-0">
                <div className="flex items-center justify-between">
                  <label className="flex items-center text-sm">
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
                      className="ml-2 accent-[#805b99]"
                    />
                    {cat.name}
                  </label>
                  {cat.subcat && cat.subcat.length > 0 && (
                    <button
                      onClick={() => toggleMothercatExpansion(cat.id)}
                      className="text-[#805b99]"
                    >
                      {expandedMothercats.includes(cat.id) ? (
                        <ExpandLess fontSize="small" />
                      ) : (
                        <ExpandMore fontSize="small" />
                      )}
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {expandedMothercats.includes(cat.id) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="ml-6 mt-3 space-y-3 overflow-hidden"
                    >
                      {cat.subcat?.map((subcat) => (
                        <div key={subcat.id} className="border-b border-gray-100 pb-3 last:border-0">
                          <div className="flex items-center justify-between">
                            <label className="flex items-center text-sm">
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
                                className="ml-2 accent-[#805b99]"
                              />
                              {subcat.name}
                            </label>
                            {subcat.items && subcat.items.length > 0 && (
                              <button
                                onClick={() => toggleSubcatExpansion(subcat.id)}
                                className="text-[#805b99]"
                              >
                                {expandedSubcats.includes(subcat.id) ? (
                                  <ExpandLess fontSize="small" />
                                ) : (
                                  <ExpandMore fontSize="small" />
                                )}
                              </button>
                            )}
                          </div>

                          <AnimatePresence>
                            {expandedSubcats.includes(subcat.id) && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="ml-6 mt-3 space-y-2 overflow-hidden"
                              >
                                {subcat.items?.map((item) => (
                                  <label key={item.id} className="flex items-center text-sm">
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
                                      className="ml-2 accent-[#805b99]"
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

        {/* برند */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-[#374151] flex items-center">
            <Store className="ml-2 text-[#805b99]" /> برند
          </label>
          <input
            type="text"
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            placeholder="جستجوی برند..."
            className="w-full p-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#805b99] mb-3"
          />
          <div className="max-h-40 overflow-y-auto space-y-2">
            {allBrands
              .filter((brand) => brand.toLowerCase().includes(brandSearch.toLowerCase()))
              .map((brand) => (
                <label key={brand} className="flex items-center text-sm">
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
                    className="ml-2 accent-[#805b99]"
                  />
                  {brand}
                </label>
              ))}
          </div>
        </div>

        {/* محدوده قیمت */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-[#374151] flex items-center">
            <PriceChange className="ml-2 text-[#805b99]" /> محدوده قیمت
          </label>
          <Slider
            range
            min={0}
            max={5000000}
            step={10000}
            value={priceRange}
            onChange={(v) => setPriceRange(v as [number, number])}
            trackStyle={{ backgroundColor: "#805b99", height: 6 }}
            handleStyle={{
              borderColor: "#805b99",
              backgroundColor: "#fff",
              width: 18,
              height: 18,
            }}
            railStyle={{ backgroundColor: "#e5e7eb", height: 6 }}
          />
          <div className="flex justify-between mt-3 text-xs text-gray-600">
            <span>{priceRange[0].toLocaleString("fa-IR")} تومان</span>
            <span>{priceRange[1].toLocaleString("fa-IR")} تومان</span>
          </div>
        </div>

        {/* حداقل امتیاز */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 text-[#374151] flex items-center">
            <Star className="ml-2 text-[#805b99]" /> حداقل امتیاز
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
            className="w-full p-2 border border-[#e5e7eb] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#805b99] text-center"
          />
        </div>

        {/* توگل‌ها */}
        <div className="space-y-4">
          <label className="flex items-center text-sm font-medium text-[#374151]">
            <input
              type="checkbox"
              checked={discount}
              onChange={(e) => setDiscount(e.target.checked)}
              className="ml-2 accent-[#805b99]"
            />
            فقط تخفیف‌دار
          </label>
          <label className="flex items-center text-sm font-medium text-[#374151]">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => setInStock(e.target.checked)}
              className="ml-2 accent-[#805b99]"
            />
            فقط موجود
          </label>
        </div>
      </div>
    </motion.div>
  );
}