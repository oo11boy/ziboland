import { CategoryOutlined, FavoriteBorderOutlined, HomeOutlined, PersonOutline, ShoppingBagOutlined } from '@mui/icons-material'
import Link from 'next/link'
import React from 'react'

export default function MobileBottomNavigation() {
  return (
    <>
 <div className='h-[70px] min-lg-none'></div>
    <div className="flex yekan border-t  border-[#c7c7c7c7] min-lg-none justify-between items-center fixed bottom-0 z-50 w-full h-[70px] p-4 bg-black shadow-md text-white text-[13px] transition-all duration-300">
    
         <Link href={'/'} className='flex flex-col justify-center items-center'>
            <HomeOutlined/>
            <p>خانه</p>
        </Link>


        <Link href={'/category'} className='flex flex-col justify-center items-center'>
            <CategoryOutlined/>
            <p>دسته بندی</p>
        </Link>
    
        <Link href={'/'} className='flex flex-col justify-center items-center'>
        
            <ShoppingBagOutlined/>
            <p>سبد خرید</p>
        </Link>
        <Link href={'/'} className='flex flex-col justify-center items-center'>
        
        <FavoriteBorderOutlined/>
        <p>علاقه مندی</p>
    </Link>
        <Link href={'/'} className='flex flex-col justify-center items-center'>
        
            <PersonOutline/>
            <p>حساب</p>
        </Link>
    </div>
    
    </>
  )
}
