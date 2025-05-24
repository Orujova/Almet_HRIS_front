"use client";
import { Info, ChevronLeft, Users } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EmployeeForm from "@/components/headcount/EmployeeForm";
import { useTheme } from "@/components/common/ThemeProvider";
import Link from "next/link";

/**
 * Add Employee Page with Full Width Design
 * Page for adding a new employee to the system
 */
export default function AddEmployeePage() {
  const { darkMode } = useTheme();

  // Theme-dependent classes
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";

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
                  Add New Employee
                </h1>
                <p className={`text-sm ${textSecondary} mt-1`}>
                  Create a new employee record in the Almet HRIS system
                </p>
              </div>
              <Link
                href="/structure/headcount-table"
                className="flex items-center text-almet-sapphire hover:text-almet-astral dark:text-almet-steel-blue dark:hover:text-almet-steel-blue/80 transition-colors"
              >
                <ChevronLeft size={16} className="mr-1" />
                <span>Back to Headcount Table</span>
              </Link>
            </div>
            
            {/* Page Info Card */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full mr-4 flex-shrink-0">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                </div>
                <div>
                  <h3 className={`font-medium text-blue-800 dark:text-blue-300`}>Adding a New Employee</h3>
                  <p className={`text-blue-600 dark:text-blue-400 text-sm mt-1`}>
                    Fill in the employee information using the multi-step form below. Fields marked with an asterisk (*) are required.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Link 
                      href="https://intranet.almetholding.com/hr/onboarding" 
                      className="text-sm font-medium px-3 py-1 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      View onboarding guide
                    </Link>
                    <Link 
                      href="https://intranet.almetholding.com/hr/documents" 
                      className="text-sm font-medium px-3 py-1 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      Required documents
                    </Link>
                    <Link 
                      href="/structure/headcount-table" 
                      className="text-sm font-medium px-3 py-1 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <Users size={14} className="inline mr-1" />
                      View all employees
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Render the Employee Form - Full Width */}
        <EmployeeForm />
      </div>
    </DashboardLayout>
  );
}