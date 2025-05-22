import { Favorite, Instagram, Telegram, WhatsApp } from "@mui/icons-material";
import React from "react";

export default function FooterContainer() {
  return (
    <div className="w-full bg-[#262626] max-lg:hidden text-white">
      <div className="w-[90%] mx-auto flex flex-col">
        <div className="flex flex-col lg:flex-row justify-between py-8 lg:py-12 gap-8">
          {/* بخش اطلاعات زیبولند */}
          <div className="flex flex-col w-full lg:w-[30%]">
            <h3 className="mb-4 text-lg lg:text-xl font-semibold newyork">
              ZIBOLAND
            </h3>
            <div className="flex flex-col gap-y-2 text-justify text-sm lg:text-base">
              <p>
                زیبولند یک فروشگاه برای خرید انواع وسایل مورد نیاز با قیمت و کیفیت
                مناسب است که بسیار مقرون به صرفه است.
              </p>
            </div>
            <div className="flex justify-between items-center mt-6 lg:mt-8 text-sm lg:text-base">
              <p>شماره تماس:</p>
              <p>02195452255</p>
            </div>
            <h3 className="mt-4 mb-2 text-[#77bbe8] text-sm lg:text-base">
              ساعت کاری
            </h3>
            <div className="flex justify-between items-center text-sm lg:text-base">
              <p>شنبه تا جمعه</p>
              <p>08:00 - 23:00</p>
            </div>
          </div>

          {/* بخش امور مشتریان */}
          <div className="flex flex-col w-full lg:w-[15%]">
            <h3 className="mb-4 text-lg lg:text-xl font-semibold yekanh">
              امور مشتریان
            </h3>
            <div className="flex flex-col gap-y-2 text-sm lg:text-base">
              <a href="/faq">سوالات متداول</a>
              <a href="/faq">رویه‌های بازگشت کالا</a>
              <a href="/faq">شرایط استفاده</a>
              <a href="/faq">سیاست حفظ حریم خصوصی</a>
            </div>
          </div>

          {/* بخش راهنمای خرید */}
          <div className="flex flex-col w-full lg:w-[15%]">
            <h3 className="mb-4 text-lg lg:text-xl font-semibold yekanh">
              راهنمای خرید
            </h3>
            <div className="flex flex-col gap-y-2 text-sm lg:text-base">
              <a href="/faq">روش‌های ارسال کالا</a>
              <a href="/faq">روش‌های پرداخت</a>
            </div>
          </div>

          {/* بخش زیبولند */}
          <div className="flex flex-col w-full lg:w-[15%]">
            <h3 className="mb-4 text-lg lg:text-xl font-semibold yekanh">
              زیبولند
            </h3>
            <div className="flex flex-col gap-y-2 text-sm lg:text-base">
              <a href="/faq">مجله زیبولند</a>
              <a href="/faq">تماس با ما</a>
              <a href="/faq">درباره ما</a>
            </div>
          </div>

          {/* بخش نماد اعتماد */}
          <div className="flex yekan flex-col w-full lg:w-[25%] items-center">
            <h3 className="mb-4 text-lg lg:text-xl font-semibold yekanh">
              نماد اعتماد
            </h3>
            <div className="flex w-full justify-center items-center">
              <a href="/namad" className="w-[60%] md:w-[30%] lg:w-[70%]">
                <img
                  src="https://unicodewebdesign.com/image/enmad.png"
                  alt="نماد اعتماد"
                  className="w-full h-auto object-contain"
                />
              </a>
            </div>
          </div>
        </div>

        {/* بخش شبکه‌های اجتماعی */}
        <div className="flex flex-col justify-center items-center gap-4 pb-8">
          <div className="flex gap-4">
            <a
              href=""
              className="border-2 hover:border-[#C7C7C7] bg-black hover:bg-[#005B99] p-2 rounded-full flex justify-center items-center transition-all duration-300"
            >
              <Telegram className="!text-[18px] lg:!text-[20px]" />
            </a>
            <a
              href=""
              className="border-2 hover:border-[#C7C7C7] bg-black hover:bg-[#005B99] p-2 rounded-full flex justify-center items-center transition-all duration-300"
            >
              <WhatsApp className="!text-[18px] lg:!text-[20px]" />
            </a>
            <a
              href=""
              className="border-2 hover:border-[#C7C7C7] bg-black hover:bg-[#005B99] p-2 rounded-full flex justify-center items-center transition-all duration-300"
            >
              <Instagram className="!text-[18px] lg:!text-[20px]" />
            </a>
          </div>
          <h3 className="text-sm lg:text-base">
            ما را در شبکه‌های اجتماعی دنبال کنید.
          </h3>
        </div>
      </div>

      {/* بخش کپی‌رایت */}
      <div className="bg-[#9999] text-center text-xs lg:text-[14px] w-full p-2 text-white">
        <p>
          طراحی با <Favorite fontSize="small" /> توسط{" "}
          <a href="https://unicodewebdesign.com">یونیکد</a>
        </p>
      </div>
    </div>
  );
}