// app/admindashboard/page.tsx (Updated with Persian texts)
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { BarChart3, ShoppingBag, Users, DollarSign } from 'lucide-react'
const DashboardPage = () => {
  const stats = [
    { title: 'کل محصولات', value: '1,234', icon: ShoppingBag, change: '+12%' },
    { title: 'کل کاربران', value: '567', icon: Users, change: '+5%' },
    { title: 'درآمد', value: '$12,345', icon: DollarSign, change: '+8%' },
    { title: 'دسته‌بندی‌ها', value: '23', icon: BarChart3, change: '0%' },
  ]

 
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </CardTitle>
                <Icon className="h-6 w-6 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <p className="text-xs text-green-600 dark:text-green-400 mt-1">تغییر نسبت به ماه قبل: {stat.change}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle>محصولات اخیر</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 dark:text-gray-400">لیست محصولات...</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle>نظرات اخیر</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 dark:text-gray-400">لیست نظرات...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage