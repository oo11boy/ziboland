// src\app\(PaymentStatus)\paymentfailed\page.tsx
import PaymentFailed from "@/Components/PaymentComponents/PaymentFailed";
import { Metadata } from "next";
import React from "react";
export const metadata: Metadata = {
  title: "پرداخت ناموفق | زیبولند",
  description: "پرداخت ناموفق",

};
export default function page() {
  return (
    <>
 
      <PaymentFailed />
   
    </>
  );
}
