"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

// تعریف نوع داده برای تنظیمات
interface SocialLink {
  id?: number;
  title: string;
  icon: string;
  link: string;
  order: number;
  is_active: boolean;
}

interface PhoneNumber {
  id?: number;
  number: string;
  label: string;
  is_active: boolean;
  order: number;
}

interface Settings {
  site_name: string;
  site_description: string;
  site_icon: string;
  email: string;
  phone_numbers: PhoneNumber[];
  address: string;
  working_hours: string;
  working_days: string;
  social_links: SocialLink[];
  [key: string]: any;
}

interface SettingsContextType {
  settings: Settings;
  loading: boolean;
  error: string | null;
  refetchSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

// مقادیر پیش‌فرض
const defaultSettings: Settings = {
  site_name: "",
  site_description: "",
  site_icon: "",
  email: "",
  phone_numbers: [],
  address: "",
  working_hours: "",
  working_days: "",
  social_links: [],
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // تابع دریافت تنظیمات
  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/settings");
      
      if (!response.ok) {
        throw new Error(`خطا در دریافت تنظیمات: ${response.status}`);
      }

      const settingsData = await response.json();
      
      setSettings({
        ...defaultSettings,
        ...settingsData,
        social_links: settingsData.social_links || [],
        phone_numbers: settingsData.phone_numbers || [],
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "خطا در بارگذاری تنظیمات";
      setError(errorMessage);
      toast.error(`❌ ${errorMessage}`, {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const refetchSettings = async () => {
    await fetchSettings();
  };

  return (
    <SettingsContext.Provider
      value={{
        settings,
        loading,
        error,
        refetchSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}