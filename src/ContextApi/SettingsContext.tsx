"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

interface SettingsContextType {

    settings: any;
  loading: boolean;
  error: string | null;

}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);


export function SettingsProvider({ children }: { children: React.ReactNode }) {
   


     const [settings, setSettings] = useState([]);

   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);


    // Fetch categories from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/settings");
        if (!response.ok) throw new Error("Failed to fetch Settings");

        const settingsData = await response.json();
        setSettings(settingsData);
      } catch (err) {
        
        setError("خطا در بارگذاری دسته‌بندی‌ها. لطفاً دوباره تلاش کنید."+err);
        toast.error(" بارگذاری دسته‌بندی‌ها", {
          position: "top-center",
          autoClose: 3000,
          theme: "colored",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider
      value={{settings,loading,error}}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}