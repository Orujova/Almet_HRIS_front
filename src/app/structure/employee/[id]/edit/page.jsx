"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EmployeeForm from "@/components/headcount/EmployeeForm";
import { useTheme } from "@/components/common/ThemeProvider";

export default function EditEmployeePage() {
  const { id } = useParams();
  const { darkMode } = useTheme();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  // Theme-dependent classes
  const textPrimary = darkMode ? "text-white" : "text-gray-900";

  // Fetch employee data
  useEffect(() => {
    // In a real app, this would be an API call
    // For now, using mock data
    const mockEmployees = [
      {
        id: "HC01",
        empNo: "EJ2023",
        name: "Eric Johnson",
        firstName: "Eric",
        lastName: "Johnson",
        email: "eric.johnson@almetholding.com",
        phone: "+1 (555) 123-4567",
        joinDate: "2023-01-15",
        businessFunction: "Marketing",
        department: "BUSINESS DEVELOPMENT",
        unit: "BUSINESS DEVELOPMENT",
        jobFunction: "DEPUTY CHAIRMAN OF PRODUCT REPOSITIONING",
        jobTitle: "DEPUTY CHAIRMAN OF PRODUCT REPOSITIONING",
        position: "Executive",
        grade: "P4",
        lineManager: "Linda Campbell",
        status: "ACTIVE",
        address: "123 Business Ave, New York, NY 10001",
        dateOfBirth: "1985-03-22",
      },
      {
        id: "HC02",
        empNo: "AN1023",
        name: "Aria Sanderson",
        firstName: "Aria",
        lastName: "Sanderson",
        email: "aria.sanderson@almetholding.com",
        phone: "+1 (555) 234-5678",
        joinDate: "2023-03-10",
        businessFunction: "Marketing",
        department: "BUSINESS DEVELOPMENT",
        unit: "PRODUCT MANAGEMENT",
        jobFunction: "DEPUTY CHAIRMAN OF CORPORATE ACTIVITIES",
        jobTitle: "DEPUTY CHAIRMAN OF CORPORATE ACTIVITIES",
        position: "Executive",
        grade: "P4",
        lineManager: "Eric Johnson",
        status: "ACTIVE",
        address: "456 Corporate Blvd, New York, NY 10001",
        dateOfBirth: "1988-07-15",
      },
    ];

    // Find employee by ID
    const foundEmployee = mockEmployees.find((emp) => emp.id === id);
    setEmployee(foundEmployee || null);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!employee) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900 dark:border-red-700 dark:text-red-300">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline">
              {" "}
              Employee not found. Please return to the headcount table and try
              again.
            </span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-4">
        <h1 className={`text-2xl font-bold ${textPrimary} mb-6`}>
          Edit Employee: {employee.name}
        </h1>
        <EmployeeForm employee={employee} />
      </div>
    </DashboardLayout>
  );
}
