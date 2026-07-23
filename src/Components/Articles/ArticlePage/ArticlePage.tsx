// ArticlePage.tsx - نسخه اصلاح شده
"use client";

import React, { useMemo } from "react";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ShareIcon from "@mui/icons-material/Share";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import "./ArticlePage.css";

interface ArticlePageProps {
  title: string;
  author: string;
  date: string;
  avatar: string;
  coverImage: string;
  content: string;
  shareLink: string;
  readingTime?: number;
  tags?: string[] | string; // قبول کردن هر دو نوع
}

const ArticlePage: React.FC<ArticlePageProps> = ({
  title,
  author,
  date,
  avatar,
  coverImage,
  content,
  shareLink,
  readingTime = 3,
  tags = [],
}) => {
  // تبدیل tags به آرایه اگر رشته باشد
  const normalizedTags = useMemo(() => {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    try {
      // اگر tags یک JSON string است
      const parsed = JSON.parse(tags);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      // اگر یک رشته ساده است مثل "tag1,tag2"
      return tags.split(",").map(t => t.trim()).filter(Boolean);
    }
  }, [tags]);

  const socialPlatforms = [
    {
      name: "فیسبوک",
      icon: <FacebookIcon />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`,
      color: "hover:bg-[#1877F2]",
    },
    {
      name: "توییتر",
      icon: <TwitterIcon />,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(title)}`,
      color: "hover:bg-[#000000]",
    },
    {
      name: "لینکدین",
      icon: <LinkedInIcon />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareLink)}`,
      color: "hover:bg-[#0A66C2]",
    },
    {
      name: "واتساپ",
      icon: <WhatsAppIcon />,
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`${title} - ${shareLink}`)}`,
      color: "hover:bg-[#25D366]",
    },
  ];

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      // می‌توانید یک toast notification اضافه کنید
      console.log("لینک کپی شد!");
    } catch (err) {
      console.error("خطا در کپی لینک:", err);
    }
  };

  return (
    <div className="flex flex-col yekannew bg-gray-50 w-full min-h-screen pb-16">
      {/* هدر با تصویر کاور */}
      <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[60vh] overflow-hidden">
        <img
          className="w-full h-full object-cover"
          src={coverImage}
          alt={title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* محتوای اصلی */}
      <div className="flex flex-col items-center z-20 -mt-20 sm:-mt-24 md:-mt-32 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-10 flex flex-col gap-6">
          {/* تگ‌ها */}
          {normalizedTags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {normalizedTags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-50 text-blue-600 text-xs sm:text-sm px-3 py-1 rounded-full font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* عنوان */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight">
            {title}
          </h1>

          {/* اطلاعات نویسنده */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 border-y border-gray-100">
            <div className="flex items-center gap-4">
              <img
                className="h-12 w-12 sm:h-14 sm:w-14 rounded-full object-cover border-2 border-gray-200"
                src={avatar}
                alt={author}
              />
              <div>
                <p className="text-gray-800 font-semibold text-sm sm:text-base flex items-center gap-2">
                  <PersonIcon className="text-gray-400 text-sm" />
                  {author}
                </p>
                <div className="flex flex-wrap items-center gap-3 text-gray-500 text-xs sm:text-sm">
                  <span className="flex items-center gap-1">
                    <CalendarTodayIcon className="text-gray-400 text-sm" />
                    {date}
                  </span>
                  <span className="flex items-center gap-1">
                    <AccessTimeIcon className="text-gray-400 text-sm" />
                    {readingTime} دقیقه مطالعه
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* محتوای مقاله */}
          <div
            className="article-content prose prose-sm sm:prose-base lg:prose-lg max-w-none prose-blue 
            prose-headings:font-yekannew prose-headings:text-gray-800 
            prose-p:text-gray-700 prose-p:leading-relaxed 
            prose-strong:text-gray-900 prose-strong:font-bold
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            prose-ul:list-disc prose-ul:pr-4
            prose-ol:list-decimal prose-ol:pr-4
            prose-img:rounded-lg prose-img:shadow-md
            prose-blockquote:border-r-4 prose-blockquote:border-blue-500 prose-blockquote:pr-4 prose-blockquote:text-gray-600
            prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-lg"
            dangerouslySetInnerHTML={{ __html: content }}
          />

          {/* بخش اشتراک‌گذاری */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-base sm:text-lg font-bold text-gray-800 flex items-center gap-2">
                <ShareIcon className="text-gray-600" />
                اشتراک‌گذاری مقاله
              </h2>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {socialPlatforms.map((p) => (
                  <a
                    key={p.name}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`bg-gray-100 p-2.5 sm:p-3 rounded-xl hover:text-white transition-all duration-300 ${p.color} text-gray-700 hover:scale-110`}
                    aria-label={`اشتراک‌گذاری در ${p.name}`}
                  >
                    {p.icon}
                  </a>
                ))}
                <button
                  onClick={copyToClipboard}
                  className="bg-gray-100 p-2.5 sm:p-3 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300 text-gray-700 hover:scale-110"
                  aria-label="کپی لینک"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 sm:h-6 sm:w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;