import { motion } from "framer-motion";
import { Close, Search, Tune } from "@mui/icons-material";

interface MobileHeaderProps {
  showFilters: boolean;
  setShowFilters: (value: boolean) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  updateSearchQuery: (value: string) => void; // اضافه شد
}

export default function MobileHeader({
  showFilters,
  setShowFilters,
  searchTerm,
  setSearchTerm,
  updateSearchQuery, // حالا استفاده می‌شه
}: MobileHeaderProps) {
  return (
    <div className="lg:hidden mobile-header">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex items-center justify-between w-[95%] mx-auto rounded-xl shadow-lg"
      >
        <div className="flex items-center gap-2 w-full">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 text-white hover:bg-[#6b4e82] rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label={showFilters ? "بستن فیلترها" : "نمایش فیلترها"}
          >
            {showFilters ? <Close fontSize="medium" /> : <Tune fontSize="medium" />}
          </button>

          <div className="relative flex items-center w-full">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                const value = e.target.value;
                setSearchTerm(value);
                updateSearchQuery(value); // حالا URL همزمان آپدیت می‌شه
              }}
              placeholder="جستجوی محصول..."
              className="w-full p-3 pr-10 bg-white/10 text-white border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/50 transition-all duration-200"
              aria-label="جستجوی محصول"
            />
            <Search
              fontSize="medium"
              className="absolute right-3 text-white/50 pointer-events-none"
              aria-hidden="true"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}