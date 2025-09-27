import WideHeaderContainer from '@/Components/Header/WideHeader/WideHeaderContainer';
import MoblieHeaderTopTab from '@/Components/Header/MobileHeader/MoblieHeaderTopTab';
import MobileBottomNavigation from '@/Components/Header/MobileHeader/MobileBottomNavigation';
import FooterContainer from '@/Components/Footer/FooterContainer';
import BreadCrumbs from '@/Components/Utils/BreadCrumbs';
import { SingleProductContainer } from '@/Components/SingleProductComponents/SingleProductContainer';
import { Product } from '@/types/types';
import { API } from '@/lib/MainRoutes';

// تابع دریافت محصول از API
async function getProduct(id: string) {
  const res = await fetch(`${API}/products/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('خطا در دریافت محصول');
  return res.json() as Promise<Product>;
}

// اصلاح نوع پارامترهای مسیر برای Next.js 15
interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: PageProps) {
  // دریافت id به صورت آسنکرون
  const { id } = await params;
  const product = await getProduct(id);

  return (
    <>
      <WideHeaderContainer />
      <MoblieHeaderTopTab />
      <BreadCrumbs />
      <SingleProductContainer infoproduct={product} />
      <FooterContainer />
      <MobileBottomNavigation />
    </>
  );
}
