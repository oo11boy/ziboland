import {
  LoginOutlined,
  SearchOutlined,
  ShoppingCartOutlined,
} from "@mui/icons-material";
import Link from "next/link";
import React from "react";

export default function WideHeaderMiddle() {
  return (
    <div className="bg-[#F9F9F9] w-full">
      <section className="flex justify-between h-[80px] items-center w-[90%] gap-2 m-auto">
        <div className="flex w-[50%] gap-4 items-center">
          <div>
            <p className="font-semibold text-2xl">ZIBOLAND</p>
          </div>
          <form
            action=""
            className="flex  overflow-hidden w-full items-center border border-[#d9d6d6] rounded-lg"
          >
            <input
              className="w-full  outline-0 p-3"
              type="text"
              placeholder="جستجو"
            />
            <button className="bg-[#EDEDED] p-4">
              <SearchOutlined fontSize="large" />
            </button>
          </form>
        </div>
        <div className="w-[50%] flex justify-end gap-4">
          <Link
            href={"/login"}
            className="gap-4  hover:bg-[#FFC700]  p-5 rounded-lg border border-[#d9d6d6]"
          >
            <LoginOutlined className="ml-2" />
            ورود | عضویت
          </Link>

          <button className="cart-btn-wide-header gap-4 relative p-5 hover:bg-[#FFC700] rounded-lg border border-[#d9d6d6]">
            <ShoppingCartOutlined />
            <span className="bg-[#FFC700]  absolute top-0 right-0 w-[25px] flex justify-center items-center pt-[3px] h-[25px] rounded-3xl">
              2
            </span>
          </button>

          <Link
            href={"/buy"}
            className="gap-4 flex justify-center items-center yekanh bg-[#FFC700]   p-4 rounded-2xl border border-[#d9d6d6]"
          >
            خرید عمده
          </Link>
        </div>
      </section>
    </div>
  );
}
