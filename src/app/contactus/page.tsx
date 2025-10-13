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

    const settings = await fetch(`${API}/settings`, {
      cache: 'force-cache', 
      next: { revalidate: 3600 }, 
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch settings');
        }
        return res.json();
      })
      .catch((error) => {
        console.error('Error fetching settings:', error);
        return []; 
      });



  return <ContactUsContainer settings={settings} />;
}
