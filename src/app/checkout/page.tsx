import FooterContainer from "@/Components/Footer/FooterContainer";
import MobileBottomNavigation from "@/Components/Header/MobileHeader/MobileBottomNavigation";
import MoblieHeaderTopTab from "@/Components/Header/MobileHeader/MoblieHeaderTopTab";
import WideHeaderContainer from "@/Components/Header/WideHeader/WideHeaderContainer";
import Checkout from "@/Components/PaymentComponents/Checkout";
import React from "react";

export default function page() {
  return (
    <>
      <WideHeaderContainer />
      <MoblieHeaderTopTab />
      <Checkout />
      <FooterContainer />
      <MobileBottomNavigation />
    </>
  );
}
