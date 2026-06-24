"use client";
import { Favorite } from "@mui/icons-material";
import "./Footer.css";
import Link from "next/link";
import { useAuth } from "@/ContextApi/AuthContext";
import { useSettings } from "@/ContextApi/SettingsContext";

interface SocialLink {
  id?: number;
  title: string;
  icon: string;
  link: string;
  order: number;
  is_active: boolean;
}

interface PhoneNumber {
  id?: number;
  number: string;
  label: string;
  is_active: boolean;
  order: number;
}

export default function FooterContainer() {
  const { settings, loading } = useSettings();
  const { isAdminDashboard, ismyaccount } = useAuth();

  if (isAdminDashboard) {
    return null;
  }

  const enamadCode = `<a referrerpolicy='origin' target='_blank' href='https://trustseal.enamad.ir/?id=665010&Code=8bOVpOazCIn6m25LT9ROgYztLP5dWra2'><img referrerpolicy='origin' src='https://trustseal.enamad.ir/logo.aspx?id=665010&Code=8bOVpOazCIn6m25LT9ROgYztLP5dWra2' alt='' style='cursor:pointer' code='8bOVpOazCIn6m25LT9ROgYztLP5dWra2'></a>`;

  // دریافت لینک‌های اجتماعی از تنظیمات
  const socialLinks = settings?.social_links || [];
  const phoneNumbers = settings?.phone_numbers || [];

  // فیلتر کردن لینک‌های فعال
  const activeSocialLinks = socialLinks
    .filter((link: SocialLink) => link.is_active && link.link)
    .sort((a: SocialLink, b: SocialLink) => a.order - b.order);

  // فیلتر کردن شماره‌های فعال
  const activePhones = phoneNumbers
    .filter((phone: PhoneNumber) => phone.is_active && phone.number)
    .sort((a: PhoneNumber, b: PhoneNumber) => a.order - b.order);

  if (loading) {
    return (
      <div className={`footer-container ${ismyaccount && "max-lg:hidden"}`}>
        <div className="footer-inner">
          <div className="copyright">
            <p>در حال بارگذاری...</p>
          </div>
        </div>
      </div>
    );
  }

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
              <p>{settings?.site_description || "فروشگاه زیبولند"}</p>
            </div>
            
            {/* نمایش چند شماره تلفن */}
            <div className="ziboland-contact">
              <p>شماره تماس:</p>
              <div className="flex flex-col gap-1 items-end">
                {activePhones.length > 0 ? (
                  activePhones.map((phone: PhoneNumber, index: number) => (
                    <a
                      key={index}
                      href={`tel:${phone.number}`}
                      className="hover:text-blue-600 transition-colors"
                    >
                      {phone.label && <span className="text-xs text-gray-500 ml-1">({phone.label})</span>}
                      {phone.number}
                    </a>
                  ))
                ) : (
                  <p>---</p>
                )}
              </div>
            </div>
            
            <span className="ziboland-hours-title">ساعت کاری</span>
            <div className="ziboland-hours">
              <p>{settings?.working_days || "---"}</p>
              <p>{settings?.working_hours || "---"}</p>
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
            <div 
              className="flex w-full justify-center items-center" 
              dangerouslySetInnerHTML={{ __html: enamadCode }} 
            />
          </div>
        </div>

        {/* Social media section */}
        <div className="social-media">
          <div className="social-icons">
            {activeSocialLinks.map((link: SocialLink, index: number) => (
              <a
                key={`social-${index}`}
                href={link.link}
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-link"
                title={link.title}
              >
                {link.icon ? (
                  <img
                    src={link.icon}
                    alt={link.title}
                    className="w-5 h-5 lg:w-6 lg:h-6 object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const span = document.createElement('span');
                        span.className = 'text-sm font-bold';
                        span.textContent = link.title.charAt(0);
                        parent.appendChild(span);
                      }
                    }}
                  />
                ) : (
                  <span className="text-sm font-bold">
                    {link.title.charAt(0)}
                  </span>
                )}
              </a>
            ))}
          </div>
          {activeSocialLinks.length > 0 && (
            <h3>ما را در شبکه‌های اجتماعی دنبال کنید.</h3>
          )}
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