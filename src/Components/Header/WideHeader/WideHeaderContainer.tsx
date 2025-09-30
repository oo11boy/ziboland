"use client"
import React from "react";
import "./WideHeader.css";
import WideHeaderContactUs from "./WideHeaderContactUs";
import WideHeaderMiddle from "./WideHeaderMiddle";
import MegaMenuWideHeader from "./MegaMenuWideHeader";
import { useAuth } from "@/ContextApi/AuthContext";

export default function WideHeaderContainer() {
  const { isAdminDashboard } = useAuth();

  // اگر isAdminDashboard true باشد، چیزی رندر نشود
  if (isAdminDashboard) {
    return null;
  }

  // در غیر این صورت، کامپوننت رندر شود
  return (
    <section className="max-lg-none WideHeaderContactUs yekan">
      <WideHeaderContactUs />
      <WideHeaderMiddle />
      <MegaMenuWideHeader />
    </section>
  );
}