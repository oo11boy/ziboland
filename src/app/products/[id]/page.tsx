import React from "react";
import WideHeaderContainer from "@/Components/Header/WideHeader/WideHeaderContainer";
import MoblieHeaderTopTab from "@/Components/Header/MobileHeader/MoblieHeaderTopTab";
import MobileBottomNavigation from "@/Components/Header/MobileHeader/MobileBottomNavigation";
import FooterContainer from "@/Components/Footer/FooterContainer";
import BreadCrumbs from "@/Components/Utils/BreadCrumbs";
import { SingleProductContainer } from "@/Components/SingleProductComponents/SingleProductContainer";

interface MediaItem {
  type: "image" | "video";
  src: string;
  thumbnail: string;
  alt: string;
}

interface Product {
  id: number;
  title: string;
  mothercat: string;
  subcat: string;
  features: string[];
  content: string;
  brand: string;
  originalPrice: string;
  discountedPrice: string;
  wholesalePrice: string;
  discountwholesalePrice: string;
  minwholesale: number;
  discount: string;
  discountwholesale: string;
  media: MediaItem[];
  colors: string[];
  infotable: { id: number; name: string; value: string }[];
}

const infoproduct: Product = {
  id: 44,
  title: "دریل پیچ گوشتی چکشی شارژی براشلس آنکور 12 ولت مدل DCE12 دو باتری",
  mothercat: "ابزار",
  subcat: "ابزار برقی",
  features: [
    "دارای سه نظام اتوماتیک فلزی 10 میلیمتر",
    "دارای باتری لیتیوم یون 12 ولت 2 آمپر",
    "دارای موتور قدرتمند براشلس",
    "دارای گیربکس دو سرعته",
    "سرعت در حالت بی‌باری 600-0 تا 2000-0 دور در دقیقه",
    "دارای قابلیت چپ‌گرد – راست‌گرد",
    "مجهز به نمایشگر میزان شارژ باتری",
  ],
  brand: "آکنور - پی ام",
  originalPrice: "479,000",
  discountedPrice: "431,100",
  wholesalePrice: "400,000",
  discountwholesalePrice: "340,000",
  minwholesale: 2,
  discount: "10%",
  discountwholesale: "15%",
  content: `
دریل شارژی چکشی براشلس ۱۲ ولت آنکور یک باتری دارای سه نظام فلزی سایز ۱۰ دارای سه حالت چکشی و پیچ‌گوشتی و سوراخ کاری دارای ترکمتر مجهز به قفل سه نظام مجهز به موتور براش‌لس ضد آب با عملکرد عالی و طول عمر بالا مجهز به کلاچ با قابلیت تنظیم گشتاور در حالت های مختلف، برای جلوگیری از ورود آسیب به سطح کار دارای حداکثر گشتاور ۴۵ نیوتن‌متر با قدرتی عالی و عملکردی بی‌نظیر قابل تنظیم در دو سرعت متفاوت جهت استفاده در سطوح مختلف دارای طراحی منحصربفرد بدنه با روکشی از جنس لاستیک باکیفیت، مقاوم در برابر انواع ضربات و سقوط از دست کاربر ۱۲ ماه ضمانت و خدمات پس از فروش آنکور ساخت کشور چین
`,
  media: [
    {
      type: "image",
      src: "https://abzarreza.com/wp-content/uploads/2024/04/دریل-چکشی-براشلس-12-ولت-دو-سرعته-آنکور-مدل-DEC12تک-باتری.jpg.webp",
      thumbnail:
        "https://abzarreza.com/wp-content/uploads/2024/04/دریل-چکشی-براشلس-12-ولت-دو-سرعته-آنکور-مدل-DEC12تک-باتری-100x100.jpg.webp",
      alt: "دریل چکشی شارژی آنکور مدل DEC12 تک باتری",
    },
    {
      type: "image",
      src: "https://abzarreza.com/wp-content/uploads/2024/04/dec12-جعبه.webp",
      thumbnail:
        "https://abzarreza.com/wp-content/uploads/2024/04/dec12-جعبه-100x100.webp",
      alt: "دریل پیچ گوشتی چکشی شارژی براشلس آنکور 12 ولت مدل DCE12 دو باتری",
    },
    {
      type: "image",
      src: "https://abzarreza.com/wp-content/uploads/2024/04/dec12-آنکور.webp",
      thumbnail:
        "https://abzarreza.com/wp-content/uploads/2024/04/dec12-آنکور-100x100.webp",
      alt: "dec12 آنکور",
    },
  
  ],
  colors: ["yellow", "black", "white", "red"],
  infotable: [
    { id: 1, name: "برند", value: "آنکور – پی ام | Anchor – P.M" },
    { id: 2, name: "منبع تغذیه", value: "شارژی (باتری)" },
    { id: 3, name: "ولتاژ کاری (ولت)", value: "12" },
    { id: 4, name: "نوع سه نظام", value: "اتوماتیک" },
    { id: 5, name: "ظرفیت سه نظام", value: "10 (میلی‌متر)" },
    { id: 6, name: "سرعت گردش آزاد (دور در دقیقه)", value: "0-600/0-2000" },
    { id: 7, name: "دیمر کنترل سرعت", value: "ندارد" },
    { id: 8, name: "گیربکس چند سرعته", value: "دارد" },
    { id: 9, name: "قابلیت چکشی", value: "دارد" },
    { id: 10, name: "قابلیت پیچ گوشتی", value: "دارد" },
    { id: 11, name: "گارانتی", value: "دارد" },
    { id: 12, name: "مشخصات گارانتی", value: "12 ماه" },
    { id: 13, name: "وزن (کیلوگرم)", value: "0.9" },
  ],
};

const Page: React.FC = () => {
  return (
    <div className="yekan min-h-screen">
      <WideHeaderContainer />
      <MoblieHeaderTopTab />
      <BreadCrumbs />
<SingleProductContainer infoproduct={infoproduct}/>
      <FooterContainer />
      <MobileBottomNavigation />
    </div>
  );
};

export default Page;