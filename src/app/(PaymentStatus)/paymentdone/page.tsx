//src\app\(PaymentStatus)\paymentdone\page.tsx
import PaymentDone from "@/Components/PaymentComponents/PaymentDone";
import { Metadata } from "next";
import React from "react";
export const metadata: Metadata = {
  title: "پرداخت موفق | زیبولند",
  description: "پرداخت موفق",

};
export default function page() {
  return (
    <>
   
      <PaymentDone />
   
    </>
  );
}
