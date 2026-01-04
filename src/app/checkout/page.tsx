import Checkout from "@/Components/PaymentComponents/Checkout";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "صورتحساب | زیبولند",
  description: "صورتحساب",

};

export default function page() {
  return (
    <>

      <Checkout />

    </>
  );
}
