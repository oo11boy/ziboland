import Link from 'next/link'
import React from 'react'

export default function Banners() {
  return (
    <div className='flex max-lg:flex-wrap my-8 justify-between w-[95%] m-auto gap-4 items-center'>
        <Link  href={'/'}>
        <img className='rounded-lg' src="https://abzarreza.com/wp-content/uploads/2024/04/Baner-omdeh-D.png" alt="" />
        </Link>
        <Link  href={'/'}>
        <img className='rounded-lg' src="https://abzarreza.com/wp-content/uploads/2024/04/Baner-omdeh-B.png" alt="" />
        </Link>
    </div>
  )
}
