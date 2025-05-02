"use client";
import React from "react";
import {
  Instagram,
  PhoneInTalkOutlined,
  Telegram,
  WhatsApp,
} from "@mui/icons-material";
export default function WideHeaderContactUs() {
  return (
    <section className="bg-black w-full h-auto py-4">
      <div className="w-[95%] flex justify-between m-auto items-center flex-row-reverse">
        <div className="flex justify-end items-center gap-4">
          <p className=" yekan text-[#FFC700]">تماس با کارشناسان:</p>
          <a
            href="tell:02196520"
            className="text-white text-xl flex items-center gap-2 yekanh"
          >
            021-96520{" "}
            <PhoneInTalkOutlined
              fontSize="medium"
              className="text-[#FFC700] phoneicon"
            />
          </a>
        </div>

        <div className="text-white flex items-center gap-2">
          <a
            href=""
            className="border-2 hover:bg-[#FFC700] hover:text-black p-2 rounded-full flex justify-center items-center"
          >
            <Telegram className="!text-[18px]" />
          </a>
          <a
            href=""
            className="border-2 hover:bg-[#FFC700] hover:text-black p-2 rounded-full flex justify-center items-center"
          >
            <WhatsApp className="!text-[18px]" />
          </a>
          <a
            href=""
            className="border-2 hover:bg-[#FFC700] hover:text-black p-2 rounded-full flex justify-center items-center"
          >
            <Instagram className="!text-[18px]" />
          </a>
        </div>
      </div>
    </section>
  );
}
