// app/product/[id]/page.tsx (کاملاً درست و بدون خطای TypeScript)
import { Metadata } from "next";
import BreadCrumbs from "@/Components/Utils/BreadCrumbs";
import { SingleProductContainer } from "@/Components/SingleProductComponents/SingleProductContainer";
import { Categoryapi, Product } from "@/types/types";
import { API } from "@/lib/MainRoutes";

async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`${API}/products/${id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("خطا در دریافت محصول");
  }

  return res.json();
}

async function getCategories(): Promise<Categoryapi[]> {
  const res = await fetch(`${API}/categories`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return [];
  }

  return res.json();
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;

  let product: Product | null = null;

  try {
    product = await getProduct(id);
  } catch {
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
      type: "website", // اینجا "website" استفاده شده (مجاز است)
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

  let product: Product;
  let categories: Categoryapi[] = [];

  try {
    [product, categories] = await Promise.all([
      getProduct(id),
      getCategories(),
    ]);
  } catch (error) {
    throw error;
  }

  return (
    <>
      <BreadCrumbs product={product} categories={categories} />
      <SingleProductContainer infoproduct={product}  categories={categories} />
    </>
  );
}