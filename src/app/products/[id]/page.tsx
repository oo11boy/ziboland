// src/app/products/[id]/page.tsx

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProductById } from "@/lib/products";
import BreadCrumbs from "@/Components/Utils/BreadCrumbs";
import { SingleProductContainer } from "@/Components/SingleProductComponents/SingleProductContainer";
import { Product } from "@/types/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

// تولید متا دیتا برای سئو
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return {
      title: "محصول یافت نشد",
      description: "محصول مورد نظر در حال حاضر در دسترس نیست.",
      robots: { index: false, follow: false },
    };
  }

  const title = `${product.title} | خرید آنلاین با بهترین قیمت`;
  const description =
    product.content?.replace(/<[^>]*>/g, "").substring(0, 160) ||
    `خرید ${product.title} با ارسال سریع و ضمانت اصالت کالا`;

  const image =
    product.image ||
    product.variants?.[0]?.image_main ||
    "https://yourdomain.com/default-og-image.jpg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: product.title,
        },
      ],
      url: `https://yourdomain.com/product/${id}`,
      siteName: "زیبولند",
      locale: "fa_IR",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;

  // دریافت داده مستقیماً از دیتابیس
  const product = await getProductById(id);

  // اگر محصول در دیتابیس نبود، صفحه 404 نمایش داده می‌شود
  if (!product) {
    notFound();
  }

  return (
    <>
      <BreadCrumbs product={product} />
      <SingleProductContainer infoproduct={product} />
    </>
  );
}