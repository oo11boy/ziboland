"use client";
import React, { useState } from "react";
import "./MobileHeader.css";
import { Search } from "@mui/icons-material";
import Link from "next/link";


export default function MobileHeaderTopTab() {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (e: { target: { value: React.SetStateAction<string>; }; }) => {
    setInputValue(e.target.value);
  };

  return (
    <>
      <div className="flex justify-between text-white min-lg-none items-center fixed z-50 w-full h-[60px] p-4 bg-black shadow-md transition-all duration-300">
        <div className="flex justify-start w-full  items-center gap-2">
          <a href="/search" className="w-6/7   relative">
            <input
            
              type="text"
              className="w-full outline-none text-black yekannew pl-8 p-1 rounded-lg bg-gray-200"
              value={inputValue}
              onChange={handleInputChange}
            />
            <Search className="absolute left-2 top-1 text-[#777777]" />
            {!inputValue && (
              <div className="custom-placeholder flex items-center gap-2 yekannew  absolute right-2 top-1 pointer-events-none">
                <p>
                جستجو در
                </p>
              
                <div className="flex items-center">
                  <span className="font-semibold neiriz text-xl ml-1">ز</span>
                  <span className="font-semibold neiriz text-xl">یبولند</span>
                </div>
              </div>
            )}
          </a>
        </div>

        <div className="flex justify-end gap-2 mr-4">
          <Link href={'../'} className="newyork text-lg text-white">ZIBOLAND</Link>
        </div>
      </div>
      <div className="h-[70px] min-lg-none w-full"></div>
    </>
  );
}
