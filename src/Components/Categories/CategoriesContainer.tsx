import Link from "next/link";
import React from "react";

export default function CategoriesContainer() {
  const data = [
    {
      id: 1,
      img: "https://abzarreza.com/wp-content/uploads/2023/12/%D8%A7%D8%A8%D8%B2%D8%A7%D8%B1-%D8%A7%D9%86%D8%AF%D8%A7%D8%B2%D9%87-%DA%AF%DB%8C%D8%B1%DB%8C-1-min-1.webp",
      link: "/",
      text: "ابزار اندازه گیری",
    },
    {
      id: 2,
      img: "https://abzarreza.com/wp-content/uploads/2023/12/%D8%A7%D8%A8%D8%B2%D8%A7%D8%B1-%D8%A8%D8%B1%D9%82%DB%8C-%D9%88-%D8%B4%D8%A7%D8%B1%DA%98%DB%8C.webp",
      link: "/",
      text: "ابزار برقی و شارژی",
    },
    {
      id: 3,
      img: "https://abzarreza.com/wp-content/uploads/2023/12/%D8%A7%D8%A8%D8%B2%D8%A7%D8%B1-%D8%AF%D8%B3%D8%AA%DB%8C-min.webp",
      link: "/",
      text: "ابزار دستی",
    },
    {
      id: 4,
      img: "https://abzarreza.com/wp-content/uploads/2024/05/%D9%84%D9%88%D8%A7%D8%B2%D9%85-%D8%AC%D8%A7%D9%86%D8%A8%DB%8C-6-1.png",
      link: "/",
      text: "لوازم جانبی",
    },
    {
      id: 5,
      img: "https://abzarreza.com/wp-content/uploads/2023/12/%D8%A7%D8%A8%D8%B2%D8%A7%D8%B1-%D8%A7%DB%8C%D9%85%D9%86%DB%8C-min-1.webp",
      link: "/",
      text: "ابزار تجهیزات ایمنی",
    },
    {
      id: 6,
      img: "https://abzarreza.com/wp-content/uploads/2023/12/%DB%8C%D8%B1%D8%A7%D9%82-%D8%A2%D9%84%D8%A7%D8%AA1-min.webp",
      link: "/",
      text: "براق آلات",
    },
    {
      id: 7,
      img: "https://abzarreza.com/wp-content/uploads/2023/10/%D8%A7%D8%A8%D8%B2%D8%A7%D8%B1-%D8%A8%D8%A7%D8%AF%DB%8C-%D9%88-%D8%A8%D9%86%D8%B2%DB%8C%D9%86%DB%8C1-1-min.png.webp",
      link: "/",
      text: "ابزار بادی و بنزینی",
    },
    {
      id: 8,
      img: "https://abzarreza.com/wp-content/uploads/2023/12/%D8%A7%D8%A8%D8%B2%D8%A7%D8%B1-%D8%A8%D8%A7%D8%BA%D8%A8%D8%A7%D9%86%DB%8C-min.webp",
      link: "/",
      text: "ابزار باغبانی",
    },
  ];
  return (
    <div className="w-[90%] bg-white rounded-lg p-4 mt-4 m-auto flex justify-center items-center flex-col">
      <h2 className="yekanh text-xl mb-8 mt-4">دسته بندی محصولات</h2>
      <div className="flex justify-between items-center text-center">
        {data.map((item) => (
          <Link href={item.link} className="w-[8%]" >
            <img src={item.img} alt={item.text} /> <p className="text-[14px] mt-2">{item.text}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
