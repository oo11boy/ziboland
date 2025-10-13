"use client";
import React from "react";
import "./WideHeader.css";
import WideHeaderContactUs from "./WideHeaderContactUs";
import WideHeaderMiddle from "./WideHeaderMiddle";
import MegaMenuWideHeader from "./MegaMenuWideHeader";
import { useAuth } from "@/ContextApi/AuthContext";
import { Categoryapi } from "@/types/types";

interface WideHeaderContainerProps {
  categories: Categoryapi[];
}

export default function WideHeaderContainer({
  categories,
}: WideHeaderContainerProps) {
  const { isAdminDashboard } = useAuth();

  if (isAdminDashboard) {
    return null;
  }

  return (
    <section className="max-lg-none WideHeaderContactUs yekan">
      <WideHeaderContactUs />
      <WideHeaderMiddle />
      <MegaMenuWideHeader categories={categories} />
    </section>
  );
}
