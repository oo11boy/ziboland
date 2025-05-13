import BenefitsContainer from '@/Components/Benefits/BenefitsContainer'
import CategoriesContainer from '@/Components/Categories/CategoriesContainer'
import WideHeaderContainer from '@/Components/Header/WideHeader/WideHeaderContainer'
import ProductSliderContainer from '@/Components/Sliders/ProductSlider/ProductSliderContainer'
import WideSliderContainer from '@/Components/Sliders/WideSlider/WideSliderContainer'
import React from 'react'
import TabProductsSliderContainer from '@/Components/TabProductsSlider/TabProductsSliderContainer'

export default function page() {
  return (
  <>
  <WideHeaderContainer/>
  <WideSliderContainer/>
  <CategoriesContainer/>
  <BenefitsContainer/>
  <ProductSliderContainer vip={true}/>
  <TabProductsSliderContainer title='پرفروشترین ها'/>
  <TabProductsSliderContainer title='ارزانترین ها'/>
  <TabProductsSliderContainer title='جدیدترین ها'/>
  </>
  )
}
