import React from 'react';
import WideHeaderContainer from '@/Components/Header/WideHeader/WideHeaderContainer';
import MoblieHeaderTopTab from '@/Components/Header/MobileHeader/MoblieHeaderTopTab';
import MobileBottomNavigation from '@/Components/Header/MobileHeader/MobileBottomNavigation';
import FooterContainer from '@/Components/Footer/FooterContainer';
import BreadCrumbs from '@/Components/Utils/BreadCrumbs';
import { SingleProductContainer } from '@/Components/SingleProductComponents/SingleProductContainer';
import { Product } from '@/types/types';

// Define the props type for the page
interface PageProps {
  params: { id: string };
}

// Server-side data fetching within the page component
async function fetchProduct(id: string): Promise<Product | null> {
  try {
    const response = await fetch(`http://localhost:3000/api/products/${id}`, {
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch product: ${response.status}`);
    }

    const infoproduct: Product = await response.json();
    
    if (!infoproduct || !infoproduct.id) {
      throw new Error('Invalid product data received');
    }

    return infoproduct;
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// The page component
const Page: React.FC<PageProps> = async ({ params }) => {
  const { id } = params;
  const infoproduct = await fetchProduct(id);

  return (
    <div className="yekan min-h-screen">
      <WideHeaderContainer />
      <MoblieHeaderTopTab />
      <BreadCrumbs />
      <SingleProductContainer infoproduct={infoproduct} />
      <FooterContainer />
      <MobileBottomNavigation />
    </div>
  );
};

export default Page;