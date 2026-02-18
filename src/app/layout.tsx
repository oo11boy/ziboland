
import "./globals.css";
import { ReactNode } from "react";
import { CartProvider } from "@/ContextApi/CartContext";

import MobileBottomNavigation from "@/Components/Header/MobileHeader/MobileBottomNavigation";
import MoblieHeaderTopTab from "@/Components/Header/MobileHeader/MoblieHeaderTopTab";
import { AuthProvider } from "@/ContextApi/AuthContext";
import WideHeaderServer from "@/Components/Header/WideHeader/WideHeaderServer";
import FooterServer from "@/Components/Footer/FooterServer";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // 👈 این خط را اضافه کنید


export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        />
      </head>
      <body>
        <AuthProvider>
          <CartProvider>
            <ToastContainer 
              position="top-center" 
              autoClose={3000} 
              theme="colored" 
              rtl={true}
              pauseOnFocusLoss={false} // برای جلوگیری از باگ‌های احتمالی در موبایل
            />
            <WideHeaderServer />
            <MoblieHeaderTopTab />
            {children}
            <FooterServer />
            <MobileBottomNavigation />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
