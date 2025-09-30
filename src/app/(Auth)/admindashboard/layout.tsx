import Sidebar from '@/Components/Dashboards/AdminDashboardComponents/Sidebar';
import Header from '@/Components/Dashboards/AdminDashboardComponents/Header';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {

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