import FooterContainer from "@/Components/Footer/FooterContainer";
import MobileBottomNavigation from "@/Components/Header/MobileHeader/MobileBottomNavigation";
import MobileCategoryMegaMenu from "@/Components/Header/MobileHeader/MobileCategoryMegaMenu";
import MoblieHeaderTopTab from "@/Components/Header/MobileHeader/MoblieHeaderTopTab";
import WideHeaderContainer from "@/Components/Header/WideHeader/WideHeaderContainer";
import React from "react";

export default function page() {
  return (
    <div>
      <WideHeaderContainer />
      <MoblieHeaderTopTab />
      <MobileCategoryMegaMenu />
      <MobileBottomNavigation />
      <FooterContainer />
    </div>
  );
}
