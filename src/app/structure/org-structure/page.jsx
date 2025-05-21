"use client";
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import ComingSoon from "@/components/common/ComingSoon";
import { useTheme } from "@/components/common/ThemeProvider";

export default function OrgStructurePage() {
  const { darkMode } = useTheme();

  return (
    <DashboardLayout>
      <ComingSoon
        title="Organization Structure"
        message="The organization structure visualization is coming soon. Check back later for updates."
        darkMode={darkMode}
      />
    </DashboardLayout>
  );
}
