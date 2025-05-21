// src/pages/structure/employee/[id]/edit/page.jsx
"use client";
import { useState, useEffect } from "react";
<<<<<<< HEAD
<<<<<<< Updated upstream
import { useParams } from "next/navigation";
=======
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
>>>>>>> Stashed changes
=======
import { useParams, useRouter } from "next/navigation";
>>>>>>> 736c5ef91c6a62fd8e955cec333c2a2961025f72
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import EmployeeForm from "@/components/headcount/EmployeeForm";

/**
 * Edit Employee Page
 * Page for editing an existing employee's details
 */
export default function EditEmployeePage() {
  const { id } = useParams();
  const router = useRouter();
  const { darkMode } = useTheme();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Theme-dependent classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
<<<<<<< HEAD
<<<<<<< Updated upstream
=======
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const shadowClass = darkMode ? "" : "shadow-md";
>>>>>>> 736c5ef91c6a62fd8e955cec333c2a2961025f72

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
=======
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";

  // Fetch employee data
  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        setLoading(true);
        
        // Mock API call delay
        await new Promise(resolve => setTimeout(resolve, 600));
        
        // Mock data for two employees
        const mockEmployees = [
          {
            id: "1",
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
            positionGroup: "Executive",
            grade: "P4",
            lineManager: "Linda Campbell",
            lineManagerHcNumber: "HC00",
            status: "ACTIVE",
            address: "123 Business Ave, New York, NY 10001",
            dateOfBirth: "1985-03-22",
            emergencyContact: "Sarah Johnson: Spouse: +1 (555) 987-6543",
            expertise: [
              "Strategic Planning",
              "Brand Development",
              "Team Leadership",
            ],
            tags: [],
            directReports: 5,
            office: "Headquarters - 5th Floor",
            profileImage: null
          },
          {
            id: "2",
            empNo: "AS1023",
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
            positionGroup: "Executive",
            grade: "P4",
            lineManager: "Eric Johnson",
            lineManagerHcNumber: "HC01",
            status: "ACTIVE",
            address: "456 Corporate Blvd, New York, NY 10001",
            dateOfBirth: "1988-07-15",
            emergencyContact: "Michael Sanderson: Brother: +1 (555) 876-5432",
            expertise: [
              "Corporate Strategy",
              "Business Analysis",
              "Market Research",
            ],
            tags: [],
            directReports: 3,
            office: "Headquarters - 5th Floor",
            profileImage: null
          }
        ];
>>>>>>> Stashed changes

        // Find employee by ID
        const foundEmployee = mockEmployees.find((emp) => emp.id === id);
        
        if (foundEmployee) {
          setEmployee(foundEmployee);
        } else {
          setError("Employee not found");
        }
      } catch (err) {
        console.error("Error fetching employee:", err);
        setError("Failed to load employee data");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
<<<<<<< Updated upstream
        <div className="flex justify-center items-center h-full">
<<<<<<< HEAD
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
=======
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-16 h-16 border-4 border-almet-sapphire border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className={`${textPrimary} text-lg font-medium`}>Loading employee data...</p>
          </div>
>>>>>>> Stashed changes
=======
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-almet-sapphire"></div>
>>>>>>> 736c5ef91c6a62fd8e955cec333c2a2961025f72
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !employee) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
<<<<<<< HEAD
<<<<<<< Updated upstream
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900 dark:border-red-700 dark:text-red-300">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline">
              {" "}
              Employee not found. Please return to the headcount table and try
              again.
            </span>
=======
          <div className={`${bgCard} rounded-lg border border-red-300 dark:border-red-700 p-6 shadow-md`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-red-800 dark:text-red-300">
                  Error Loading Employee
                </h3>
                <p className="mt-2 text-red-700 dark:text-red-400">
                  {error || "Employee not found"}
                </p>
                <div className="mt-4">
                  <Link
                    href="/structure/headcount-table"
                    className="inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Return to Headcount Table
                  </Link>
                </div>
              </div>
            </div>
>>>>>>> Stashed changes
=======
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
>>>>>>> 736c5ef91c6a62fd8e955cec333c2a2961025f72
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
<<<<<<< Updated upstream
      <div className="container mx-auto px-4 py-4">
<<<<<<< HEAD
        <h1 className={`text-2xl font-bold ${textPrimary} mb-6`}>
          Edit Employee: {employee.name}
        </h1>
=======
      <div className="container mx-auto px-4 py-6">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className={`text-2xl font-bold ${textPrimary}`}>
                Edit Employee
              </h1>
              <p className={`text-sm ${textMuted} mt-1`}>
                Editing information for: <span className="font-medium text-almet-sapphire dark:text-almet-steel-blue">{employee.name}</span>
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href={`/structure/employee/${id}`}
                className="flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                <ArrowLeft size={16} className="mr-1" />
                Back to Profile
              </Link>
              <Link
                href="/structure/headcount-table"
                className="flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
              >
                Headcount Table
              </Link>
            </div>
          </div>
          
          {/* Edit Info Card */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-amber-500 dark:text-amber-400 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className={`text-sm font-medium text-amber-800 dark:text-amber-300`}>Edit Mode</h3>
                <p className={`text-sm text-amber-600 dark:text-amber-400 mt-0.5`}>
                  Changes you make will be reflected immediately across the system after saving. Edit all fields as needed.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Render the Employee Form in edit mode */}
>>>>>>> Stashed changes
=======
        <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral p-4 text-white rounded-lg mb-6">
          <h1 className="text-2xl font-bold">
            Edit Employee: {employee.name}
          </h1>
          <p className="opacity-80">
            Update employee information | ID: {employee.empNo}
          </p>
        </div>
>>>>>>> 736c5ef91c6a62fd8e955cec333c2a2961025f72
        <EmployeeForm employee={employee} />
      </div>
    </DashboardLayout>
  );
}