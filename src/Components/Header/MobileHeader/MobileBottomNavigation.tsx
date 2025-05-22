import { CategoryOutlined, FavoriteBorderOutlined, HomeOutlined, PersonOutline, Search, SearchOutlined, ShoppingBagOutlined } from '@mui/icons-material'
import Link from 'next/link'
import React from 'react'

export default function MobileBottomNavigation() {
  return (
    <>
 <div className='h-[70px] min-lg:hidden'></div>
    <div className="flex yekan min-lg:hidden justify-between items-center fixed bottom-0 z-50 w-full h-[70px] p-4 bg-black  shadow-md  text-white text-[13px] transition-all duration-300">
    
         <Link href={'/'} className='flex flex-col justify-center items-center'>
            <HomeOutlined/>
            <p>خانه</p>
        </Link>


        <Link href={'/category'} className='flex flex-col justify-center items-center'>
            <CategoryOutlined/>
            <p>دسته بندی</p>
        </Link>
        <Link href={'/'} className='flex flex-col justify-center items-center'>
        
        <SearchOutlined/>
        <p>جستجو</p>
    </Link>
        <Link href={'/'} className='flex flex-col justify-center items-center'>
        
            <ShoppingBagOutlined/>
            <p>سبد خرید</p>
        </Link>
       
        <Link href={'/'} className='flex flex-col justify-center items-center'>
        
            <PersonOutline/>
            <p>حساب</p>
        </Link>
    </div>
    
    </>
  )
}
