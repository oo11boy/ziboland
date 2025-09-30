"use client";
import Cookies from "js-cookie";
import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation"; // اضافه کردن usePathname

interface AuthContextType {
  isLoggedIn: boolean;
  isAdminDashboard: boolean;
  ismyaccount: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem("islogin") === "true";
  });

  const pathname = usePathname(); // گرفتن مسیر فعلی
  const isAdminDashboard = pathname === "/admindashboard"; // بررسی مسیر
  const ismyaccount = pathname === "/myaccount"; // بررسی مسیر

  // همگام‌سازی isLoggedIn با sessionStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(sessionStorage.getItem("islogin") === "true");
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const login = () => {
    sessionStorage.setItem("islogin", "true");
    setIsLoggedIn(true);
  };

  const logout = () => {
    sessionStorage.setItem("islogin", "false");
    setIsLoggedIn(false);
    Cookies.remove("authToken");
    window.location.href = "/myaccount";
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, isAdminDashboard, ismyaccount, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
