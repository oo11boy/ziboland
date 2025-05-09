import {

  FavoriteBorderOutlined,
  LoginOutlined,
  SearchOutlined,
  ShoppingBagOutlined,

} from "@mui/icons-material";
import Link from "next/link";
import React from "react";

export default function WideHeaderMiddle() {
  return (
    <section className="bg-[#F9F9F9] w-full py-2">
      <div className="flex justify-between h-auto items-center w-[90%] gap-2 m-auto">
        <div className="flex w-[33%] gap-3 items-center">
          <div className="flex items-center">
            <span className="font-semibold neiriz text-xl ml-1">ز</span>
            <span className="font-semibold neiriz text-xl">یبولند</span>
          </div>
          <form
            action=""
            className="flex w-1/2 items-center border border-[#d9d6d6] rounded-lg overflow-hidden"
          >
            <input
              className="w-full outline-0 px-2 text-base"
              type="text"
              placeholder="جستجو"
            />
            <button className="bg-[#EDEDED] p-2">
              <SearchOutlined fontSize="medium" />
            </button>
          </form>
        </div>
        <div className="flex w-[33%] text-center justify-center gap-3 items-center">
          <p className="font-semibold newyork text-xl">ZIBOLAND</p>
        </div>
        <div className="w-[33%] flex justify-end gap-2">
          <Link
            href={"/login"}
            className="flex items-center gap-2 hover:bg-[#EBEBEB] hover:text-[black] p-2 rounded-lg border border-[#d9d6d6] text-base hover:border-[#C7C7C7]"
          >
            <LoginOutlined fontSize="small" />
            ورود | عضویت
          </Link>
          <button className="relative flex items-center gap-2 p-2 hover:bg-[#EBEBEB] hover:text-[black] rounded-lg border border-[#d9d6d6] hover:border-[#C7C7C7]">
            <FavoriteBorderOutlined fontSize="medium" />
            <span className="bg-[#805B99] pt-1 text-[#EBEBEB] absolute bottom-0 -right-1 w-4 h-4 flex justify-center items-center text-[10px] rounded-full">
              2
            </span>
          </button>
          <button className="relative flex items-center gap-2 p-2 hover:bg-[#EBEBEB] hover:text-[black] rounded-lg border border-[#d9d6d6] hover:border-[#C7C7C7]">
            <ShoppingBagOutlined fontSize="medium" />
            <span className="bg-[#805B99] pt-1 text-[#EBEBEB] absolute bottom-0 -right-1 w-4 h-4 flex justify-center items-center text-[10px] rounded-full">
              2
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}