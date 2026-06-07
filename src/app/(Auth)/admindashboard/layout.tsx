import Sidebar from '@/Components/Dashboards/AdminDashboardComponents/Sidebar';
import Header from '@/Components/Dashboards/AdminDashboardComponents/Header';
import { Metadata } from 'next';
import { AuthProvider } from '@/ContextApi/AuthContext';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "داشبورد مدیریت | زیبولند",
  description: "داشبورد مدیریت",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>  
      <Toaster
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 8000,
          style: {
            background: "#333",
            color: "#fff",
            maxWidth: "600px",
            fontSize: "14px",
            whiteSpace: "pre-line",
            textAlign: "right" as const,
            direction: "rtl",
          },
          error: {
            duration: 12000,
            style: {
              background: "#ef4444",
              color: "#fff",
            },
          },
          success: {
            style: {
              background: "#22c55e",
            },
          },
        }}
      />
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col w-full md:w-auto">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}