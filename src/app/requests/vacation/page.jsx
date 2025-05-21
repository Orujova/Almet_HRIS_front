// src/app/requests/vacation/page.jsx
"use client";
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ComingSoon from "@/components/common/ComingSoon";
import { useTheme } from "@/components/common/ThemeProvider";

export default function VacationRequestsPage() {
  const { darkMode } = useTheme();

  return (
    <DashboardLayout>
      <ComingSoon
        title="Vacation Requests"
        message="The vacation request management module is coming soon. Check back later for updates."
        darkMode={darkMode}
      />
    </DashboardLayout>
  );
}
