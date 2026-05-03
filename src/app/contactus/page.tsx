import { Metadata } from "next";
import ContactUsContainer from "@/Components/ContactUs/ContactUsContainer";
import { API } from "@/lib/MainRoutes";

export const metadata: Metadata = {
  title: "ارتباط با ما | زیبولند",
  description: "تماس با ما و دریافت پشتیبانی",
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/contactus`,
  },
};

export default async function ContactPage() {



  return <ContactUsContainer />;
}
