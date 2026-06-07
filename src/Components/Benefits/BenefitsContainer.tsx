import Link from "next/link";
import React from "react";

export default function BenefitsContainer() {
  const data = [
    {
      id: 1,
      title: "ارسال رایگان سفارشات",
      description: "خرید بالای 4 میلیون",
      image:
        "/images/car.webp",
      link: "/#",
    },
    {
      id: 2,
      title: "ضمانت بازگشت کالا",
      description: "تا 30 روز پس از خرید",
      image:
         "/images/box.webp",
      link: "/#",
    },
    {
      id: 3,
      title: "ضمانت اصالت کالا",
      description: "ابزار آلات اصیل و معتبر",
      image:
    "/images/hand.webp",
      link: "/",
    },
    {
      id: 4,
      title: "مشاوره تخصصی رایگان",
      description: "خرید آگاهانه ابزار آلات",
        image:
    "/images/call.webp",
      link: "/faq",
    },
    {
      id: 5,
      title: "روش های پرداخت متنوع",
      description: "کلیه کارت های عضو شتاب",
          image:
    "/images/cash.webp",
      link: "/faq",
    },
  ];

  return (
    <div className="bg-white p-4 yekan rounded-lg w-[95%] m-auto my-8 overflow-x-auto overflow-y-hidden">
      <div className="flex justify-between max-xl:flex-nowrap gap-4">
        {data.map((item) => (
          <Link
            key={item.id}
            href={item.link}
            className="flex gap-4 transition-all duration-300  hover:scale-[1.1] items-center min-w-[200px] whitespace-nowrap"
          >
            <img
              src={item.image}
              alt={item.title}
              className="w-12 h-12 object-contain"
            />
            <div className="flex flex-col text-sm">
              <h2 className="font-semibold">{item.title}</h2>
              <p className="text-[12px]">{item.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}