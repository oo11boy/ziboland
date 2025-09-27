import React from "react";
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import "./ArticlePage.css";
interface ArticlePageProps {
  title: string;
  author: string;
  date: string;
  avatar: string;
  coverImage: string;
  content: string; // حالا رشته HTML
  shareLink: string;
}

const ArticlePage: React.FC<ArticlePageProps> = ({
  title, author, date, avatar, coverImage, content, shareLink
}) => {
  const socialPlatforms = [
    { name: "Facebook", icon: <FacebookIcon />, url: `https://www.facebook.com/sharer/sharer.php?u=${shareLink}` },
    { name: "Twitter", icon: <TwitterIcon />, url: `https://twitter.com/intent/tweet?url=${shareLink}` },
    { name: "LinkedIn", icon: <LinkedInIcon />, url: `https://www.linkedin.com/sharing/share-offsite/?url=${shareLink}` },
    { name: "WhatsApp", icon: <WhatsAppIcon />, url: `https://api.whatsapp.com/send?text=${shareLink}` }
  ];

  return (
    <div className="flex flex-col bg-gray-100 w-full min-h-screen pb-16">
      <div className="relative w-full h-[40vh] md:h-[60vh] overflow-hidden">
        <img className="w-full h-full object-cover" src={coverImage} alt={title} />
      </div>
      <div className="flex flex-col items-center z-[99] -mt-40 px-4">
        <div className="w-full lg:w-[90%] bg-white rounded-xl shadow-lg p-6 sm:p-10 flex flex-col gap-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">{title}</h1>
          <div className="flex items-center gap-4">
            <img className="h-12 w-12 rounded-full" src={avatar} alt={author} />
            <div>
              <p className="text-gray-800 font-medium">{author}</p>
              <p className="text-gray-500 text-sm">{date}</p>
            </div>
          </div>
          {/* رندر HTML واقعی */}
          <div
            className="flex article-content-tags flex-col gap-4 text-gray-800 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content }}
          ></div>
        </div>
        <div className="w-full lg:w-[90%] mt-8 bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-bold">اشتراک‌گذاری مقاله</h2>
          <div className="flex gap-4 mt-2">
            {socialPlatforms.map(p => (
              <a key={p.name} href={p.url} target="_blank" className="bg-gray-200 p-3 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors">
                {p.icon}
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticlePage;
