import { Metadata } from "next";
import BreadCrumbs from "@/Components/Utils/BreadCrumbs";
import { SingleProductContainer } from "@/Components/SingleProductComponents/SingleProductContainer";
import { Categoryapi, Product } from "@/types/types";
import { API } from "@/lib/MainRoutes";

// تابع دریافت محصول
async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`${API}/products/${id}`, { cache: "no-store" });
  if (!res.ok) throw new Error("خطا در دریافت محصول");
  return res.json();
} 
// دریافت دسته‌بندی‌ها
async function getCategories(): Promise<Categoryapi[]> {
  const res = await fetch(`${API}/categories`, { cache: "no-store" });
  if (!res.ok) throw new Error("خطا در دریافت دسته‌بندی‌ها");
  return res.json();
}

// نوع Props به صورت آسنکرون
interface PageProps {
  params: Promise<{ id: string }>;
  // اگر خواستی از searchParams استفاده کنی، به همین صورت تعریفش کن:
  // searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}

// تابع متادیتای داینامیک
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params; // حتماً await کردن
  let product: Product | null = null;

  try {
    product = await getProduct(id);
  } catch (err: any) {
    return {
      title: "محصول یافت نشد",
      description:
        "این محصول وجود ندارد یا خطا در بارگذاری داده‌ها. " + err.toString(),
    };
  }

  const title = product.title ?? "محصول";
  const description = product.content?.substring(0, 150) ?? "";

  return {
    title,
    description,
  };
}

// خود صفحه
export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params; // حتماً await کردن
  const product = await getProduct(id);
  const categories = await getCategories();

  return (
    <>
      <BreadCrumbs product={product} categories={categories} />
      <SingleProductContainer infoproduct={product} />
    </>
  );
}
