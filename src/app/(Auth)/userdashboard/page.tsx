import UserDashboardContainer from '@/Components/Dashboards/UserDashboardComponents/UserDashboardContainer'
import FooterContainer from '@/Components/Footer/FooterContainer'
import MobileBottomNavigation from '@/Components/Header/MobileHeader/MobileBottomNavigation'
import MoblieHeaderTopTab from '@/Components/Header/MobileHeader/MoblieHeaderTopTab'
import WideHeaderContainer from '@/Components/Header/WideHeader/WideHeaderContainer'
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';

export default async function page() {
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;

  if (!token) {
    redirect('/myaccount');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role: string };
    if (decoded.role === 'admin') {
      redirect('/admindashboard');
    }
    // اگر نقش customer باشد، ادامه می‌دهد
  } catch (error) {
    redirect('/myaccount');
  }

  return (
    <>
      <WideHeaderContainer />
      <MoblieHeaderTopTab />
      <UserDashboardContainer />
      <FooterContainer />
      <MobileBottomNavigation />
    </>
  )
}