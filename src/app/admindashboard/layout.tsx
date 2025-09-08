import type { Metadata } from 'next'

import Sidebar from '@/Components/AdminDashboardComponents/Sidebar'
import Header from '@/Components/AdminDashboardComponents/Header'

export const metadata: Metadata = {
  title: 'داشبورد مدیریت',
  description: 'داشبورد مدیریت زیبا و ریسپانسیو',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
  )
}