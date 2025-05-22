import {
  DarkMode,
  DarkModeOutlined,
  FavoriteBorderOutlined,
  Menu,
  PersonOutline,
  SearchOutlined,
  ShoppingBagOutlined,
} from "@mui/icons-material";
import React from "react";

export default function MoblieHeaderTopTab() {
  return (
    <>
      <div className="flex justify-between min-lg:hidden items-center fixed z-50 w-full h-[60px] p-4 bg-black shadow-md  text-white transition-all duration-300">
        <div className="flex justify-start items-center gap-2">
       
          <h3 className="newyork text-xl text-white">ZIBOLAND</h3>
        </div>

        <div className="flex justify-end gap-2">
         <button><FavoriteBorderOutlined fontSize="large"/></button>
       
        </div>
      </div>
      <div className="h-[70px] min-lg:hidden w-full "></div>
    </>
  );
}