"use client";
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ComingSoon from "@/components/common/ComingSoon";
import { useTheme } from "@/components/common/ThemeProvider";

export default function BusinessTripPage() {
  const { darkMode } = useTheme();

  return (
    <DashboardLayout>
      <ComingSoon
        title="Business Trip Requests"
        message="The business trip request management module is coming soon. Check back later for updates."
        darkMode={darkMode}
      />
    </DashboardLayout>
  );
}
