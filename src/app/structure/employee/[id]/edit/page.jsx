// src/pages/structure/employee/[id]/edit/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import EmployeeForm from "@/components/headcount/EmployeeForm";

export default function EditEmployeePage() {
  const { id } = useParams();
  const router = useRouter();
  const { darkMode } = useTheme();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  // Theme-dependent classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const shadowClass = darkMode ? "" : "shadow-md";

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
        middleName: "",
        email: "eric.johnson@almetholding.com",
        phone: "+1 (555) 123-4567",
        joinDate: "2023-01-15",
        businessFunction: "Marketing",
        department: "BUSINESS DEVELOPMENT",
        unit: "BUSINESS DEVELOPMENT",
        jobFunction: "DEPUTY CHAIRMAN OF PRODUCT REPOSITIONING",
        jobTitle: "DEPUTY CHAIRMAN OF PRODUCT REPOSITIONING",
        positionGroup: "DIRECTOR",
        position: "Executive",
        grade: "P4",
        lineManager: "Linda Campbell",
        lineManagerId: "HC00",
        status: "ACTIVE",
        address: "123 Business Ave, New York, NY 10001",
        dateOfBirth: "1985-03-22",
        emergencyContact: "Sarah Johnson: +1 (555) 987-6543",
        nationality: "American",
        idNumber: "US-12345678",
        passportNumber: "P12345678",
        gender: "male",
        bloodGroup: "O+",
        contractType: "permanent",
        workSchedule: "Monday-Friday, 9:00-18:00",
        salary: "$120,000/year",
        bankAccount: "Chase Bank **** 5678",
        taxInfo: "TIN: 123-45-6789",
        education: "MBA from Harvard Business School",
        certificates: "Project Management Professional (PMP)",
        skills: ["Strategic Planning", "Brand Development", "Team Leadership", "Budget Management", "Market Analysis"],
        languages: ["English", "Spanish", "French"],
        notes: "Eric is a valuable member of our team with exceptional leadership qualities.",
        office: "Headquarters - 5th Floor",
        profileImage: null, // Would be an image URL in a real app
      },
      {
        id: "HC02",
        empNo: "AN1023",
        name: "Aria Sanderson",
        firstName: "Aria",
        lastName: "Sanderson",
        middleName: "",
        email: "aria.sanderson@almetholding.com",
        phone: "+1 (555) 234-5678",
        joinDate: "2023-03-10",
        businessFunction: "Marketing",
        department: "BUSINESS DEVELOPMENT",
        unit: "PRODUCT MANAGEMENT",
        jobFunction: "DEPUTY CHAIRMAN OF CORPORATE ACTIVITIES",
        jobTitle: "DEPUTY CHAIRMAN OF CORPORATE ACTIVITIES",
        positionGroup: "DIRECTOR",
        position: "Executive",
        grade: "P4",
        lineManager: "Eric Johnson",
        lineManagerId: "HC01",
        status: "ACTIVE",
        address: "456 Corporate Blvd, New York, NY 10001",
        dateOfBirth: "1988-07-15",
        emergencyContact: "Michael Sanderson: +1 (555) 876-5432",
        nationality: "British",
        idNumber: "UK-87654321",
        passportNumber: "P87654321",
        gender: "female",
        bloodGroup: "A+",
        contractType: "permanent",
        workSchedule: "Monday-Friday, 9:00-18:00",
        salary: "$110,000/year",
        bankAccount: "Bank of America **** 4321",
        taxInfo: "TIN: 987-65-4321",
        education: "MSc in Business Administration from London Business School",
        certificates: "Certified Business Analyst Professional (CBAP)",
        skills: ["Corporate Strategy", "Business Analysis", "Market Research", "Product Development", "Stakeholder Management"],
        languages: ["English", "German"],
        notes: "Aria has shown exceptional performance in developing corporate strategies.",
        office: "Headquarters - 5th Floor",
        profileImage: null,
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-almet-sapphire"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!employee) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <div className={`${bgCard} rounded-lg p-8 text-center ${shadowClass}`}>
            <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-300 p-4 rounded-lg mb-6">
              <h2 className="text-xl font-bold mb-2">Employee Not Found</h2>
              <p>The employee you're trying to edit doesn't exist or has been removed.</p>
            </div>
            <button
              onClick={() => router.push("/structure/headcount-table")}
              className="bg-almet-sapphire hover:bg-almet-astral text-white px-4 py-2 rounded-md"
            >
              Return to Headcount Table
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-4">
        <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral p-4 text-white rounded-lg mb-6">
          <h1 className="text-2xl font-bold">
            Edit Employee: {employee.name}
          </h1>
          <p className="opacity-80">
            Update employee information | ID: {employee.empNo}
          </p>
        </div>
        <EmployeeForm employee={employee} />
      </div>
    </DashboardLayout>
  );
}