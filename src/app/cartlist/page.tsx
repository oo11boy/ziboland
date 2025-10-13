import MobileCartList from "@/Components/MobileCartList/MobileCartList";
import { Metadata } from "next";
import React from "react";
export const metadata: Metadata = {
  title: "سبد خرید | زیبولند",
  description: "سبدخرید زیبولند",

};
export default function page() {
  return (
    <div>
      <MobileCartList />
    </div>
  );
}
