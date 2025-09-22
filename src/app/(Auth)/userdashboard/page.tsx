import UserDashboardContainer from '@/Components/Dashboards/UserDashboardComponents/UserDashboardContainer'
import FooterContainer from '@/Components/Footer/FooterContainer'
import MobileBottomNavigation from '@/Components/Header/MobileHeader/MobileBottomNavigation'
import MoblieHeaderTopTab from '@/Components/Header/MobileHeader/MoblieHeaderTopTab'
import WideHeaderContainer from '@/Components/Header/WideHeader/WideHeaderContainer'

export default async function page() {
  return (
    <>
      <WideHeaderContainer />
      <MoblieHeaderTopTab />
      <UserDashboardContainer />
      <FooterContainer />
      <MobileBottomNavigation />
    </>
  )
}