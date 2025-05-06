"use client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EmployeeForm from "@/components/headcount/EmployeeForm";
import { useTheme } from "@/components/common/ThemeProvider";

export default function AddEmployeePage() {
  const { darkMode } = useTheme();

  // Theme-dependent classes
  const textPrimary = darkMode ? "text-white" : "text-gray-900";

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-4">
        <h1 className={`text-2xl font-bold ${textPrimary} mb-6`}>
          Add New Employee
        </h1>
        <EmployeeForm />
      </div>
    </DashboardLayout>
  );
}
