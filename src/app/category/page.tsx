import MobileBottomNavigation from "@/Components/Header/MobileHeader/MobileBottomNavigation";
import MobileCategoryMegaMenu from "@/Components/Header/MobileHeader/MobileCategoryMegaMenu";
import MoblieHeaderTopTab from "@/Components/Header/MobileHeader/MoblieHeaderTopTab";
import React from "react";

export default function page() {
  return (
    <div>
      <MoblieHeaderTopTab />
      <MobileCategoryMegaMenu/>
      <MobileBottomNavigation />
    </div>
  );
}
