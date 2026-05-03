"use client";
import { Categoryapi } from "@/types/types";
import { createContext, useContext, useState, useEffect } from "react";

interface SettingsContextType {

    categories: Categoryapi[];
  loading: boolean;
  error: string | null;

}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);


export function SettingsProvider({ children }: { children: React.ReactNode }) {
   
  return (
    <SettingsContext.Provider
      value={{}}
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