import React from "react";
import "./WideHeader.css";
import WideHeaderContactUs from "./WideHeaderContactUs";
import WideHeaderMiddle from "./WideHeaderMiddle";
import MegaMenuWideHeader from "./MegaMenuWideHeader";
export default function WideHeaderContainer() {
  return (
    <section>
         <WideHeaderContactUs />
      <WideHeaderMiddle />
      <MegaMenuWideHeader />
    </section>
  );
}
