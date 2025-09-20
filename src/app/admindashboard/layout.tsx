// src/app/admindashboard/layout.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { verify } from 'jsonwebtoken';
import Cookies from 'js-cookie';
import Sidebar from '@/Components/AdminDashboardComponents/Sidebar';
import Header from '@/Components/AdminDashboardComponents/Header';

const SECRET_KEY = process.env.JWT_SECRET || '5b139e5c95598b17e8a6064a7f972f4f2b5970801f4cd4118a35cd7d782fa370';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get('authToken');
    if (!token) {
      router.push('/myaccount');
      return;
    }

    try {
      const decoded = verify(token, SECRET_KEY) as { userId: number; email: string; role: string };
      if (decoded.role !== 'admin') {
        router.push('/userdashboard');
      }
    } catch (error) {
      router.push('/myaccount');
    }
  }, [router]);

  return (
    <html lang="fa" dir="rtl">
      <body className="font-yekan min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 flex flex-col">
            <Header />
            <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}