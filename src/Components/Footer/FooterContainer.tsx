"use client";
import { Favorite, Instagram, Telegram, WhatsApp } from "@mui/icons-material";
import React from "react";
import "./Footer.css";
import Link from "next/link";
import { useAuth } from "@/ContextApi/AuthContext";
export default function FooterContainer({ settings }: { settings: any }) {
  const { isAdminDashboard, ismyaccount } = useAuth();

  if (isAdminDashboard) {
    return null;
  }

  const enamadCode = `<a referrerpolicy='origin' target='_blank' href='https://trustseal.enamad.ir/?id=665010&Code=8bOVpOazCIn6m25LT9ROgYztLP5dWra2'><img referrerpolicy='origin' src='https://trustseal.enamad.ir/logo.aspx?id=665010&Code=8bOVpOazCIn6m25LT9ROgYztLP5dWra2' alt='' style='cursor:pointer' code='8bOVpOazCIn6m25LT9ROgYztLP5dWra2'></a>`;

  return (
    <div className={`footer-container ${ismyaccount && "max-lg:hidden"}`}>
      <div className="footer-inner">
        <div className="footer-content">
          {/* Ziboland info section */}
          <div className="ziboland-info">
            <Link href={"../"} className="newyork text-lg">
              ZIBOLAND
            </Link>
            <div className="flex flex-col gap-y-2 mt-4 text-justify">
              <p>{settings.site_description}</p>
            </div>
            <div className="ziboland-contact">
              <p>شماره تماس:</p>
              <p> {settings.phone}</p>
            </div>
            <h3 className="ziboland-hours-title">ساعت کاری</h3>
            <div className="ziboland-hours">
              <p>{settings.working_days}</p>
              <p>{settings.working_hours}</p>
            </div>
          </div>

          {/* Customer service section */}
          <div className="customer-service">
            <h3 className="yekanh">امور مشتریان</h3>
            <div className="flex flex-col gap-y-2">
              <a href="/faq">سوالات متداول</a>
              <a href="/faq">رویه‌های بازگشت کالا</a>
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
              <Link href="../articles">مجله زیبولند</Link>
              <Link href="../contactus">تماس با ما</Link>
            </div>
          </div>

          {/* Trust badge section */}
          <div className="trust-badge">
            <h3 className="yekanh">نماد اعتماد</h3>

            <div className="flex w-full justify-center items-center" dangerouslySetInnerHTML={{ __html: enamadCode }} />
      
          </div>
        </div>

        {/* Social media section */}
        <div className="social-media">
          <div className="social-icons">
            <a href="" className="social-icon-link">
              <Telegram className="!text-[18px] lg:!text-[20px]" />
            </a>
            <a href="" className="social-icon-link">
              <WhatsApp className="!text-[18px] lg:!text-[20px]" />
            </a>
            <a href="" className="social-icon-link">
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
