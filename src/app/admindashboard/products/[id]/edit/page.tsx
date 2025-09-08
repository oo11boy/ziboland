// app/admindashboard/products/[id]/edit/page.tsx (New file for edit product)
'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/Components/ui/button'
import { Input } from '@/Components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card'
import { Textarea } from '@/Components/ui/textarea'
import { Product } from '@/types/types'
import { API } from '@/lib/MainRoutes'


const EditProductPage = () => {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [formData, setFormData] = useState<Product>({
    title: '',
    originalPrice: '0',
    wholesalePrice:'0',
    category: '',
    content: '',
 
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setFormData(data)
        setLoading(false)
      })
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch(`http://localhost:3000/api/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    router.push('/admindashboard/products')
  }

  if (loading) return <div className="text-center py-8">در حال بارگذاری...</div>

  return (
    <div className="max-w-md mx-auto">
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader>
          <CardTitle>ویرایش محصول</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="نام محصول"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <Input
          
              placeholder="قیمت تکی با تخفیف"
              value={formData.discountedPrice}
              onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })}
              required
            />
                 <Input
             
              placeholder="قیمت عمده با تخفیف"
              value={formData.discountwholesalePrice}
              onChange={(e) => setFormData({ ...formData, discountwholesalePrice: e.target.value })}
              required
            />
            <Input
              placeholder="دسته‌بندی"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            />
     
            <Textarea
              placeholder="توضیحات"
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            />
            <Button type="submit" className="w-full bg-green-500 hover:bg-green-600">
              بروزرسانی محصول
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default EditProductPage