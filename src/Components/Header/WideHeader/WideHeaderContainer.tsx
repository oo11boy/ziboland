import React from "react";
import "./WideHeader.css";
import WideHeaderContactUs from "./WideHeaderContactUs";
import WideHeaderMiddle from "./WideHeaderMiddle";
import MegaMenuWideHeader from "./MegaMenuWideHeader";
import Image from "next/image";
export default function WideHeaderContainer() {
  return (
    <section>
        <Image src={'/images/takhfifbanner.jpeg'} width={1000} height={100} alt="تخفیف" className="w-full h-[50px] object-cover" />
      <WideHeaderContactUs />
      <WideHeaderMiddle />
      <MegaMenuWideHeader />
    </section>
  );
}
