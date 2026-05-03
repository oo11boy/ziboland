import "./globals.css";
import { ReactNode } from "react";
import { CartProvider } from "@/ContextApi/CartContext";

import MobileBottomNavigation from "@/Components/Header/MobileHeader/MobileBottomNavigation";
import MoblieHeaderTopTab from "@/Components/Header/MobileHeader/MoblieHeaderTopTab";
import { AuthProvider } from "@/ContextApi/AuthContext";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { CategoriesProvider } from "@/ContextApi/CategoriesContext";
import { SettingsProvider } from "@/ContextApi/SettingsContext";
import WideHeaderContainer from "@/Components/Header/WideHeader/WideHeaderContainer";
import FooterContainer from "@/Components/Footer/FooterContainer";
import { SliderProvider } from "@/ContextApi/SliderContext";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <head>
        {/* <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
        /> */}
      </head>
      <body>
        <SettingsProvider>
          <SliderProvider>
            <CategoriesProvider>
              <AuthProvider>
                <CartProvider>
                  <ToastContainer
                    position="top-center"
                    autoClose={3000}
                    theme="colored"
                    rtl={true}
                    pauseOnFocusLoss={false}
                  />
                  <WideHeaderContainer />
                  <MoblieHeaderTopTab />
                  {children}
                  <FooterContainer />
                  <MobileBottomNavigation />
                </CartProvider>
              </AuthProvider>
            </CategoriesProvider>
          </SliderProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}
