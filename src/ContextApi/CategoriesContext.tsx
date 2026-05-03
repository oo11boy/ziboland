"use client";
import { Categoryapi } from "@/types/types";
import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

interface CategoriesContextType {

    categories: Categoryapi[];
  loading: boolean;
  error: string | null;

}

const CategoriesContext = createContext<CategoriesContextType | undefined>(undefined);


export function CategoriesProvider({ children }: { children: React.ReactNode }) {
   const [categories, setCategories] = useState<Categoryapi[]>([]);

   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);


    // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/categories");
        if (!response.ok) throw new Error("Failed to fetch categories");

        const categoriesData: Categoryapi[] = await response.json();
        setCategories(categoriesData);
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

    fetchCategories();
  }, []);

  return (
    <CategoriesContext.Provider
      value={{categories,loading,error}}
    >
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCat() {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}