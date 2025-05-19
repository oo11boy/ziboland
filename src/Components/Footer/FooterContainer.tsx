import { Favorite, Instagram, Telegram, WhatsApp } from "@mui/icons-material";
import React from "react";

export default function FooterContainer() {
  return (
    <div className="w-full bg-[#262626] text-white">
      <div className="flex w-[90%] m-auto  flex-col">
        <div className="flex justify-between py-12 ">
          <div className="w-[80%] flex  justify-between">
          <div className="flex flex-col w-[30%] ">
              <h3 className="mb-4 text-xl font-semibold newyork">
               ZIBOLAND
              </h3>
              <div className="flex flex-col gap-y-2 text-justify">
               <p>زیبولند یک فروشگاه برای خرید انواع وسایل مورد نیاز با قیمت و کیفیت مناسب است
                که بسیار مقرون به صرفه است.
               </p>
              </div>
              <div  className="flex justify-between items-center mt-8"><p>شماره تماس:</p> <p>02195452255</p></div>

              <h3 className="mt-4 mb-2 text-[#77bbe8]">ساعت کاری</h3>
             <div className="flex justify-between items-center"><p>شنبه تا جمعه</p> <p>08:00 - 23:00</p></div>
        
            </div>

     
            <div className="flex flex-col">
              <h3 className="mb-4 text-xl font-semibold yekanh">
                امور مشتریان
              </h3>
              <div className="flex flex-col gap-y-2">
                <a href="/faq">سوالات متداول</a>
                <a href="/faq">رویه‌های بازگشت کالا</a>
                <a href="/faq">شرایط استفاده</a>
                <a href="/faq">سیاست حفظ حریم خصوصی</a>
              </div>
            </div>
            <div className="flex flex-col">
              <h3 className="mb-4 text-xl font-semibold yekanh">
                راهنمای خرید
              </h3>
              <div className="flex flex-col gap-y-2">
                <a href="/faq">روش‌های ارسال کالا</a>
                <a href="/faq">روش‌های پرداخت</a>
              </div>
            </div>
            <div className="flex flex-col">
              <h3 className="mb-4 text-xl font-semibold yekanh">زیبولند</h3>
              <div className="flex flex-col gap-y-2">
                <a href="/faq">مجله زیبولند</a>
                <a href="/faq">تماس با ما</a>
                <a href="/faq">درباره ما</a>
              </div>
            </div>
          </div>
          <div className="w-[50%] flex flex-col justify-start items-center">
          <h3 className="mb-4 text-xl font-semibold yekanh"> نماد اعتماد </h3>
          <div className="flex w-full justify-center items-center gap-2">
          <a href="/namad" className="w-[50%]"><img src="https://unicodewebdesign.com/image/enmad.png" alt="" /></a>

          
          </div>
        
          </div>
        </div>
        <div>
        <div className="flex flex-col justify-center items-center gap-4 pb-8">
          <div className="flex gap-4">
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
            <h3>ما را در شبکه های اجتماعی دنبال کنید.</h3>

             </div>
        </div>
      </div>

      <div className="bg-[#9999] text-center text-[14px] w-full p-2 text-white">  <p>طراحی با <Favorite fontSize="small"/> توسط <a href="https://unicodewebdesign.com">یونیکد</a></p>
      </div>
    </div>
  );
}
