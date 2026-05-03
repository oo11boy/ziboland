import MobileCategoryMegaMenu from "@/Components/Header/MobileHeader/MobileCategoryMegaMenu";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "دسته بندی ها | زیبولند",
  description: "دسته بندی ها",

};

export default function page() {
  return (
    <div>
  
      <MobileCategoryMegaMenu />
    
    </div>
  );
}
