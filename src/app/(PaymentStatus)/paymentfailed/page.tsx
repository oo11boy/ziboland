// src\app\(PaymentStatus)\paymentfailed\page.tsx
import FooterContainer from "@/Components/Footer/FooterContainer";
import MobileBottomNavigation from "@/Components/Header/MobileHeader/MobileBottomNavigation";
import MoblieHeaderTopTab from "@/Components/Header/MobileHeader/MoblieHeaderTopTab";
import WideHeaderContainer from "@/Components/Header/WideHeader/WideHeaderContainer";
import PaymentFailed from "@/Components/PaymentComponents/PaymentFailed";
import React from "react";

export default function page() {
  return (
    <>
      <WideHeaderContainer />
      <MoblieHeaderTopTab />
      <PaymentFailed />
      <FooterContainer />
      <MobileBottomNavigation />
    </>
  );
}
