import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import Sidebar from '@/Components/Dashboards/AdminDashboardComponents/Sidebar';
import Header from '@/Components/Dashboards/AdminDashboardComponents/Header';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;

  if (!token) {
    redirect('/myaccount');
    return null; // redirect خودش هندل می‌کند
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role: string };
    if (decoded.role !== 'admin') {
      redirect(decoded.role === 'customer' ? '/userdashboard' : '/myaccount');
    }
  } catch (error) {
    redirect('/myaccount');
  }

  // حذف <html> و <body> چون sub-layout است؛ root layout مدیریت می‌کند
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}