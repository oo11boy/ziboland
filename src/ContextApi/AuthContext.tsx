"use client";
import Cookies from "js-cookie";
import { createContext, useContext, useState, useEffect } from "react";
import { usePathname } from "next/navigation";

interface AuthContextType {
  isLoggedIn: boolean;
  isAdminDashboard: boolean;
  ismyaccount: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false); // Default to false

  const pathname = usePathname();
  const isAdminDashboard = pathname === "/admindashboard";
  const ismyaccount = pathname === "/myaccount";

  // Initialize isLoggedIn from sessionStorage after mounting
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Only access sessionStorage in the browser
      const loggedIn = sessionStorage.getItem("islogin") === "true";
      setIsLoggedIn(loggedIn);
    }
  }, []);

  // Sync isLoggedIn with sessionStorage changes
  useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== "undefined") {
        setIsLoggedIn(sessionStorage.getItem("islogin") === "true");
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const login = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("islogin", "true");
    }
    setIsLoggedIn(true);
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("islogin", "false");
      Cookies.remove("authToken");
      window.location.href = "/myaccount";
    }
    setIsLoggedIn(false);
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