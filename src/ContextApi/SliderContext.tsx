"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-toastify";
interface Slide {
  id: number;
  imagewide: string;
  imagemin: string;
  alt: string;
  link: string;
}
interface SliderContextType {

    slides: Slide[];
  loading: boolean;
  error: string | null;

}


const SliderContext = createContext<SliderContextType | undefined>(undefined);


export function SliderProvider({ children }: { children: React.ReactNode }) {
   


     const [slides, setSlider] = useState([]);

   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);


    // Fetch categories from API
  useEffect(() => {
    const fetchSlider = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/sliders");
        if (!response.ok) throw new Error("Failed to fetch Slider");

        const SliderData = await response.json();
        setSlider(SliderData);
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

    fetchSlider();
  }, []);

  return (
    <SliderContext.Provider
      value={{slides,loading,error}}
    >
      {children}
    </SliderContext.Provider>
  );
}

export function useSlider() {
  const context = useContext(SliderContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}