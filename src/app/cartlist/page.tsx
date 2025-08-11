import FooterContainer from "@/Components/Footer/FooterContainer";
import MobileBottomNavigation from "@/Components/Header/MobileHeader/MobileBottomNavigation";
import MoblieHeaderTopTab from "@/Components/Header/MobileHeader/MoblieHeaderTopTab";
import WideHeaderContainer from "@/Components/Header/WideHeader/WideHeaderContainer";
import MobileCartList from "@/Components/MobileCartList/MobileCartList";
import React from "react";

export default function page() {
  return (
    <div>
      <WideHeaderContainer />
      <MoblieHeaderTopTab />
      <MobileCartList />
      <MobileBottomNavigation />
      <FooterContainer />
    </div>
  );
}
