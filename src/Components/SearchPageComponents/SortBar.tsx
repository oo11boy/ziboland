import { Sort } from "@mui/icons-material";

interface SortBarProps {
  sortOption: string;
  setSortOption: (option: string) => void;
}

export default function SortBar({ sortOption, setSortOption }: SortBarProps) {
  return (
    <div className="flex items-center border-b overflow-auto border-[#e5e7eb] gap-4 bg-white lg:static z-10 py-3">
      <div className="flex flex-row items-center gap-x-4 grow">
        <div className="flex items-center">
          <div className="flex shrink-0 ml-2">
            <Sort fontSize="medium" className="text-[#374151]" />
          </div>
          <p className="cursor-pointer whitespace-nowrap text-[#374151] text-sm font-medium">
            <span className="relative grow-0">مرتب سازی:</span>
          </p>
        </div>
        <div className="flex gap-x-4">
          {[
            "جدیدترین",
            "گران‌ترین",
            "ارزان‌ترین",
            "محبوب‌ترین",
            "پرفروش‌ترین",
          ].map((option) => (
            <span
              key={option}
              className={`cursor-pointer whitespace-nowrap text-sm ${
                sortOption === option
                  ? "text-[#805b99] font-bold"
                  : "text-[#6b7280]"
              }`}
              onClick={() => setSortOption(option)}
              aria-label={`مرتب‌سازی بر اساس ${option}`}
            >
              {option}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}