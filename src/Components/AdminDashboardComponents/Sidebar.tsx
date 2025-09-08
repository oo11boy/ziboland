'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Home,
  ShoppingBag,
  Tag,
  Building,
  MessageCircle,
  BarChart3,
  Settings,
  Menu,
  X
} from 'lucide-react'

const Sidebar = () => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(true) // حالت باز/بسته در دسکتاپ
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // بستن منوی موبایل هنگام تغییر مسیر
  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // تابع برای مدیریت باز/بسته کردن منو
  const toggleMenu = () => {
    if (window.innerWidth < 768) {
      setIsMobileMenuOpen(!isMobileMenuOpen)
      setIsOpen(true) // در موبایل همیشه فول باز باشه
    } else {
      setIsOpen(!isOpen)
    }
  }

  const navItems = [
    { href: '/admindashboard', label: 'داشبورد', icon: Home },
    { href: '/admindashboard/products', label: 'محصولات', icon: ShoppingBag },
    { href: '/admindashboard/categories', label: 'دسته‌بندی‌ها', icon: Tag },
    { href: '/admindashboard/brands', label: 'برندها', icon: Building },
    { href: '/admindashboard/comments', label: 'نظرات', icon: MessageCircle },
    { href: '/admindashboard/analytics', label: 'تحلیل‌ها', icon: BarChart3 },
    { href: '/admindashboard/settings', label: 'تنظیمات', icon: Settings },
  ]

  return (
    <>
      {/* دکمه منوی موبایل (وقتی منو بسته است) */}
      {!isMobileMenuOpen && (
        <button
          className="md:hidden fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md"
          onClick={toggleMenu}
        >
          <Menu size={24} />
        </button>
      )}

      {/* لایه overlay در موبایل */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* سایدبار */}
      <aside
        className={`
          fixed top-0 right-0 h-full z-50
          md:sticky md:top-0 md:h-screen md:z-30
          bg-white dark:bg-gray-800 shadow-lg
          transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64' : 'w-16'}
          ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}
          md:translate-x-0
          overflow-y-auto
          scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600
        `}
      >
        {/* هدر */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          {isOpen ? (
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">پنل مدیریت</h1>
          ) : (
            // وقتی بسته است فقط دکمه باز کردن دوباره نشون بده
            <button
              className="hidden md:flex items-center justify-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={toggleMenu}
            >
              <Menu size={20} />
            </button>
          )}

          <button
            className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            onClick={toggleMenu}
          >
            {isOpen ? <X size={20} /> : <Menu size={20} className="md:hidden" />}
          </button>
        </div>

        {/* لینک‌ها */}
        <nav className="mt-6">
          <ul className="space-y-2 px-3">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`flex items-center px-3 py-2 rounded-lg transition-colors duration-200
                      ${isActive
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                  >
                    <Icon size={20} className={`${isOpen ? 'ml-3' : 'mx-auto'} flex-shrink-0`} />
                    {isOpen && <span className="text-sm">{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </aside>
    </>
  )
}

export default Sidebar
