import React from "react";
import "./WideHeader.css";
import WideHeaderContactUs from "./WideHeaderContactUs";
import WideHeaderMiddle from "./WideHeaderMiddle";
export default function WideHeaderContainer() {
  return (
    <section>
      <WideHeaderContactUs />
      <WideHeaderMiddle/>
    </section>
  );
}
