import MyAccountContainer from "@/Components/MyAccount/MyAccountContainer";
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import jwt from 'jsonwebtoken';
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "حساب کاربری | زیبولند",
  description: "حساب کاربری",

};
export default async function page() {
  const cookieStore = await cookies();
  const token = cookieStore.get('authToken')?.value;

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { role: string };
      if (decoded.role === 'admin') {
        redirect('/admindashboard');
      } else {
        redirect('/userdashboard');
      }
    } catch (error) {
      // توکن نامعتبر: اجازه نمایش صفحه لاگین
      console.log(error)
    }
  }

  return (
    <>
   
      <MyAccountContainer />
   
    </>
  );
}