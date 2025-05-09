"use client";
import React from "react";
import {
  Instagram,
  PhoneInTalkOutlined,
  Telegram,
  WhatsApp,
  LocalOffer,
} from "@mui/icons-material";
import Link from "next/link";



export default function WideHeaderContactUs() {
  return (
    <>
      {/* تزریق استایل‌های CSS */}
  
      <section className="bg-[#EBEBEB] w-full h-auto py-2 relative overflow-hidden">
        <div className="w-[95%] flex justify-between m-auto items-center flex-row-reverse relative z-10">
          {/* تماس با کارشناسان */}
          <div className="flex w-[33%] justify-end items-center gap-4">
            <p className="yekan text-black font-medium">تماس با کارشناسان:</p>
            <a
              href="tel:02196520"
              className="text-black text-xl flex items-center gap-2 yekan"
            >
              021-96520
              <PhoneInTalkOutlined
                fontSize="medium"
                className="text-black phoneicon"
              />
            </a>
          </div>

          {/* جشنواره تخفیفات ویژه */}
          <div className="w-[33%] text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-3 px-5 py-3 bg-[#805B99] rounded-lg shadow-xl festival-container"
          >
            <LocalOffer className="text-white animate-pulse-glow" fontSize="large" />
            <div className="flex flex-col">
              <span className="yekan text-white font-bold text-xl transition-colors duration-300">
                جشنواره تخفیفات ویژه
              </span>
              <span className="yekan text-sm text-white">
                تا 50% تخفیف محصولات
              </span>
            </div>
          </Link>
          </div>
   

          {/* شبکه‌های اجتماعی */}
          <div className="text-white  w-[33%]  flex items-center gap-3">
            <a
              href=""
              className="border-2 hover:border-[#C7C7C7] bg-black hover:bg-[#005B99] p-2 rounded-full flex justify-center items-center transition-all duration-300"
            >
              <Telegram className="!text-[20px]" />
            </a>
            <a
              href=""
              className="border-2 hover:border-[#C7C7C7] bg-black hover:bg-[#005B99] p-2 rounded-full flex justify-center items-center transition-all duration-300"
            >
              <WhatsApp className="!text-[20px]" />
            </a>
            <a
              href=""
              className="border-2 hover:border-[#C7C7C7] bg-black hover:bg-[#005B99] p-2 rounded-full flex justify-center items-center transition-all duration-300"
            >
              <Instagram className="!text-[20px]" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}