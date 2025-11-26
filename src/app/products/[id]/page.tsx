import { Metadata } from 'next';
import BreadCrumbs from '@/Components/Utils/BreadCrumbs';
import { SingleProductContainer } from '@/Components/SingleProductComponents/SingleProductContainer';
import { Product, Categoryapi } from '@/types/types';
import { API } from '@/lib/MainRoutes';

// دریافت محصول
async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`${API}/products/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('خطا در دریافت محصول');
  return res.json();
}

// دریافت دسته‌بندی‌ها
async function getCategories(): Promise<Categoryapi[]> {
  const res = await fetch(`${API}/categories`, { cache: 'no-store' });
  if (!res.ok) throw new Error('خطا در دریافت دسته‌بندی‌ها');
  return res.json();
}

interface PageProps {
  params: { id: string };
}

// متادیتای داینامیک
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  let product: Product | null = null;
  try {
    product = await getProduct(params.id);
  } catch (err: any) {
    return {
      title: 'محصول یافت نشد',
      description: 'این محصول وجود ندارد یا خطا در بارگذاری داده‌ها. ' + err.toString(),
    };
  }

  return {
    title: product.title,
    description: product.content?.substring(0, 150) ?? '',
  };
}

// صفحه محصول
export default async function ProductDetailPage({ params }: PageProps) {
  const product = await getProduct(params.id);
  const categories = await getCategories();

  return (
    <>
      <BreadCrumbs product={product} categories={categories} />
      <SingleProductContainer infoproduct={product} />
    </>
  );
}
