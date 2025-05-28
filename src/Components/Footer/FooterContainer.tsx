import { Favorite, Instagram, Telegram, WhatsApp } from "@mui/icons-material";
import React from "react";
import './Footer.css'
export default function FooterContainer() {
  return (
    <div className="footer-container">
      <div className="footer-inner">
        <div className="footer-content">
          {/* Ziboland info section */}
          <div className="ziboland-info">
            <h3 className="newyork">ZIBOLAND</h3>
            <div className="flex flex-col gap-y-2 text-justify">
              <p>
                زیبولند یک فروشگاه برای خرید انواع وسایل مورد نیاز با قیمت و کیفیت
                مناسب است که بسیار مقرون به صرفه است.
              </p>
            </div>
            <div className="ziboland-contact">
              <p>شماره تماس:</p>
              <p>02195452255</p>
            </div>
            <h3 className="ziboland-hours-title">ساعت کاری</h3>
            <div className="ziboland-hours">
              <p>شنبه تا جمعه</p>
              <p>08:00 - 23:00</p>
            </div>
          </div>

          {/* Customer service section */}
          <div className="customer-service">
            <h3 className="yekanh">امور مشتریان</h3>
            <div className="flex flex-col gap-y-2">
              <a href="/faq">سوالات متداول</a>
              <a href="/faq">رویه‌های بازگشت کالا</a>
              <a href="/faq">شرایط استفاده</a>
              <a href="/faq">سیاست حفظ حریم خصوصی</a>
            </div>
          </div>

          {/* Buying guide section */}
          <div className="buying-guide">
            <h3 className="yekanh">راهنمای خرید</h3>
            <div className="flex flex-col gap-y-2">
              <a href="/faq">روش‌های ارسال کالا</a>
              <a href="/faq">روش‌های پرداخت</a>
            </div>
          </div>

          {/* Ziboland links section */}
          <div className="ziboland-links">
            <h3 className="yekanh">زیبولند</h3>
            <div className="flex flex-col gap-y-2">
              <a href="/faq">مجله زیبولند</a>
              <a href="/faq">تماس با ما</a>
              <a href="/faq">درباره ما</a>
            </div>
          </div>

          {/* Trust badge section */}
          <div className="trust-badge">
            <h3 className="yekanh">نماد اعتماد</h3>
            <div className="flex w-full justify-center items-center">
              <a href="/namad" className="trust-badge-link">
                <img
                  src="https://unicodewebdesign.com/image/enmad.png"
                  alt="نماد اعتماد"
                  className="w-full h-auto object-contain"
                />
              </a>
            </div>
          </div>
        </div>

        {/* Social media section */}
        <div className="social-media">
          <div className="social-icons">
            <a
              href=""
              className="social-icon-link"
            >
              <Telegram className="!text-[18px] lg:!text-[20px]" />
            </a>
            <a
              href=""
              className="social-icon-link"
            >
              <WhatsApp className="!text-[18px] lg:!text-[20px]" />
            </a>
            <a
              href=""
              className="social-icon-link"
            >
              <Instagram className="!text-[18px] lg:!text-[20px]" />
            </a>
          </div>
          <h3>ما را در شبکه‌های اجتماعی دنبال کنید.</h3>
        </div>
      </div>

      {/* Copyright section */}
      <div className="copyright">
        <p>
          طراحی با <Favorite fontSize="small" /> توسط{" "}
          <a href="https://unicodewebdesign.com">یونیکد</a>
        </p>
      </div>
    </div>
  );
}