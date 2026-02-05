"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { VisibilitySharp } from "@mui/icons-material";

interface Article {
  id: number;
  title: string;
  slug: string;
  image: string;
}

interface Props {
  count?: number;
  ispage: boolean;
}

export default function ArticlesListContainer({ count = 4, ispage = false }: Props) {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    fetch("/api/articles")
      .then(res => res.json())
      .then(data => setArticles(data))
      .catch(err => console.error(err));
  }, []);

  const articlesToShow = count === 0 ? articles : articles.slice(0, count);
  if (articles.length === 0) return null;
  return (
    <div className={`${ispage ? "w-[90%] py-10 px-4 " : "w-[95%] my-8 px-4"} mx-auto yekan bg-white rounded-lg p-2`}>
      <div className="w-full mb-8 mt-2 flex justify-between items-center">
          {ispage &&  
            <div className="min-md:hidden fixed top-[60px] left-0 z-20 flex h-14 w-full items-center justify-center bg-[#805B99] text-white shadow-md">
         
              <span className="yekanh text-lg">
               مقالات
              </span>
            </div>}
         
      
        <p className="font-semibold max-md:hidden text-lg yekanh">مقالات</p>
        {count !== 0 && (
          <Link href="/articles" className="flex items-center gap-2 px-3 py-1 bg-gray-200 rounded-full hover:bg-gray-300 transition-all">
            <VisibilitySharp fontSize="inherit" className="text-gray-600" /> مشاهده همه
          </Link>
        )}
      </div>
      <div className={`flex ${!ispage ? "overflow-x-auto space-x-4 pb-4" : "flex-wrap gap-4"}`}>
        {articlesToShow.map(article => (
          <div key={article.id} className="relative rounded-xl overflow-hidden w-full min-md:w-[23%] min-w-[250px]">
            <img src={article.image} alt={article.title} className="w-full h-40 object-cover" />
            <div className="absolute bottom-0 w-full p-4 bg-gradient-to-t from-black/70 to-transparent">
              <h2 className="text-white font-semibold">{article.title}</h2>
            </div>
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/50 transition">
              <Link href={`/articles/${article.slug}`} className="bg-white px-4 py-2 rounded-lg font-medium">
                مشاهده مقاله
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
