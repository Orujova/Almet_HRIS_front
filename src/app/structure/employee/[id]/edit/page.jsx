"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, AlertCircle } from "lucide-react";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EmployeeForm from "@/components/headcount/EmployeeForm";
import { useTheme } from "@/components/common/ThemeProvider";

/**
 * Edit Employee Page with Full Width Design
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
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
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
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-16 h-16 border-4 border-almet-sapphire border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className={`${textPrimary} text-lg font-medium`}>Loading employee data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (error || !employee) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
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
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Full Width Container */}
      <div className="w-full max-w-none px-0">
        {/* Page Header - Only for the top info section */}
        <div className="container mx-auto px-4 py-6">
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
         
          </div>
        </div>
        
        {/* Render the Employee Form in edit mode - Full Width */}
        <EmployeeForm employee={employee} />
      </div>
    </DashboardLayout>
  );
}