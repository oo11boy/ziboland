import BenefitsContainer from '@/Components/Benefits/BenefitsContainer'
import CategoriesContainer from '@/Components/Categories/CategoriesContainer'
import WideHeaderContainer from '@/Components/Header/WideHeader/WideHeaderContainer'
import WideSliderContainer from '@/Components/Sliders/WideSlider/WideSliderContainer'
import React from 'react'

export default function page() {
  return (
  <>
  <WideHeaderContainer/>
  <WideSliderContainer/>
  <CategoriesContainer/>
  <BenefitsContainer/>
  </>
  )
}
