'use client'

import { useState } from 'react'
import { Bell, Search, User, Moon, Sun } from 'lucide-react'

const Header = () => {
  const [darkMode, setDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 dark:text-white hidden sm:block">
          داشبورد
        </h2>
      </div>

      <div className="flex items-center space-x-2 sm:space-x-4">
        <div className="relative w-full max-w-xs sm:max-w-md">
          <Search size={20} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="جستجو..."
            className="w-full pl-4 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
          />
        </div>

        <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <Bell size={20} />
        </button>

        <button
          onClick={toggleDarkMode}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <div className="flex items-center space-x-2">
          <User size={20} className="text-gray-500" />
          <span className="text-sm text-gray-700 dark:text-gray-300 hidden sm:block">مدیر</span>
        </div>
      </div>
    </header>
  )
}

export default Header