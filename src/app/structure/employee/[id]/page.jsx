"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Edit,
  Download,
  MessageSquare,
  UserX,
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import EmployeeStatusBadge from "@/components/headcount/EmployeeStatusBadge";

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { darkMode } = useTheme();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  // Theme-dependent classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const btnPrimary = darkMode
    ? "bg-blue-600 hover:bg-blue-700"
    : "bg-blue-500 hover:bg-blue-600";
  const btnSecondary = darkMode
    ? "bg-gray-700 hover:bg-gray-600"
    : "bg-gray-200 hover:bg-gray-300";
  const bgAccent = darkMode ? "bg-gray-700" : "bg-gray-100";
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
        lineManagerId: "HC00",
        status: "ACTIVE",
        address: "123 Business Ave, New York, NY 10001",
        dateOfBirth: "1985-03-22",
        emergencyContact: "Sarah Johnson: +1 (555) 987-6543",
        expertise: [
          "Strategic Planning",
          "Brand Development",
          "Team Leadership",
        ],
        directReports: 5,
        officeLocation: "Headquarters - 5th Floor",
        profileImage: null, // Would be an image URL in a real app
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
        lineManagerId: "HC01",
        status: "ACTIVE",
        address: "456 Corporate Blvd, New York, NY 10001",
        dateOfBirth: "1988-07-15",
        emergencyContact: "Michael Sanderson: +1 (555) 876-5432",
        expertise: [
          "Corporate Strategy",
          "Business Analysis",
          "Market Research",
        ],
        directReports: 3,
        officeLocation: "Headquarters - 5th Floor",
        profileImage: null,
      },
    ];

    // Find employee by ID
    const foundEmployee = mockEmployees.find((emp) => emp.id === id);
    setEmployee(foundEmployee || null);
    setLoading(false);
  }, [id]);

  const handleEditEmployee = () => {
    router.push(`/structure/employee/${id}/edit`);
  };

  const handleDeleteEmployee = () => {
    if (
      confirm(
        "Are you sure you want to delete this employee? This action cannot be undone."
      )
    ) {
      // In a real app, this would be an API call
      alert("Employee deleted successfully!");
      router.push("/structure/headcount-table");
    }
  };

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
          <div
            className={`${bgCard} rounded-lg p-8 text-center ${shadowClass}`}
          >
            <h2 className={`text-2xl font-bold ${textPrimary} mb-4`}>
              Employee Not Found
            </h2>
            <p className={`${textSecondary} mb-6`}>
              The employee you're looking for doesn't exist or has been removed.
            </p>
            <Link
              href="/structure/headcount-table"
              className={`${btnPrimary} text-white px-4 py-2 rounded-md inline-block`}
            >
              Return to Headcount Table
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-4">
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          <Link
            href="/structure/headcount-table"
            className={`${textPrimary} flex items-center mr-4`}
          >
            <ChevronLeft size={20} className="mr-1" />
            <span>Back to Headcount Table</span>
          </Link>
          <h1 className={`text-2xl font-bold ${textPrimary}`}>
            Employee Details
          </h1>
        </div>

        {/* Employee Profile Header */}
        <div className={`${bgCard} rounded-lg p-6 mb-6 ${shadowClass}`}>
          <div className="flex flex-col md:flex-row items-start md:items-center">
            <div className="flex items-center mb-4 md:mb-0">
              {/* Profile Image or Initials */}
              <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold mr-4">
                {employee.firstName.charAt(0)}
                {employee.lastName.charAt(0)}
              </div>

              <div>
                <h2 className={`text-2xl font-bold ${textPrimary}`}>
                  {employee.name}
                </h2>
                <p className={`${textSecondary}`}>{employee.jobTitle}</p>
                <div className="mt-2">
                  <EmployeeStatusBadge status={employee.status} />
                </div>
              </div>
            </div>

            <div className="md:ml-auto flex flex-wrap gap-2">
              <button
                onClick={handleEditEmployee}
                className={`${btnPrimary} text-white px-4 py-2 rounded-md flex items-center`}
              >
                <Edit size={16} className="mr-2" />
                Edit Employee
              </button>
              <button
                className={`${btnSecondary} ${textPrimary} px-4 py-2 rounded-md flex items-center`}
              >
                <Download size={16} className="mr-2" />
                Export Data
              </button>
              <button
                className={`${btnSecondary} ${textPrimary} px-4 py-2 rounded-md flex items-center`}
              >
                <MessageSquare size={16} className="mr-2" />
                Message
              </button>
              <button
                onClick={handleDeleteEmployee}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center"
              >
                <UserX size={16} className="mr-2" />
                Delete
              </button>
            </div>
          </div>
        </div>

        {/* Employee Information Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information */}
          <div className={`${bgCard} rounded-lg p-6 ${shadowClass}`}>
            <h3
              className={`text-lg font-semibold ${textPrimary} mb-4 border-b ${borderColor} pb-2`}
            >
              Personal Information
            </h3>

            <div className="space-y-4">
              <div>
                <p className={`${textMuted} text-sm`}>Employee ID</p>
                <p className={`${textPrimary}`}>{employee.empNo}</p>
              </div>

              <div>
                <p className={`${textMuted} text-sm`}>Full Name</p>
                <p className={`${textPrimary}`}>{employee.name}</p>
              </div>

              <div>
                <p className={`${textMuted} text-sm`}>Email</p>
                <p className={`${textPrimary}`}>{employee.email}</p>
              </div>

              <div>
                <p className={`${textMuted} text-sm`}>Phone</p>
                <p className={`${textPrimary}`}>{employee.phone}</p>
              </div>

              <div>
                <p className={`${textMuted} text-sm`}>Date of Birth</p>
                <p className={`${textPrimary}`}>
                  {new Date(employee.dateOfBirth).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className={`${textMuted} text-sm`}>Address</p>
                <p className={`${textPrimary}`}>{employee.address}</p>
              </div>

              <div>
                <p className={`${textMuted} text-sm`}>Emergency Contact</p>
                <p className={`${textPrimary}`}>{employee.emergencyContact}</p>
              </div>
            </div>
          </div>

          {/* Job Information */}
          <div className={`${bgCard} rounded-lg p-6 ${shadowClass}`}>
            <h3
              className={`text-lg font-semibold ${textPrimary} mb-4 border-b ${borderColor} pb-2`}
            >
              Job Information
            </h3>

            <div className="space-y-4">
              <div>
                <p className={`${textMuted} text-sm`}>Join Date</p>
                <p className={`${textPrimary}`}>
                  {new Date(employee.joinDate).toLocaleDateString()}
                </p>
              </div>

              <div>
                <p className={`${textMuted} text-sm`}>Position</p>
                <p className={`${textPrimary}`}>{employee.position}</p>
              </div>

              <div>
                <p className={`${textMuted} text-sm`}>Job Title</p>
                <p className={`${textPrimary}`}>{employee.jobTitle}</p>
              </div>

              <div>
                <p className={`${textMuted} text-sm`}>Department</p>
                <p className={`${textPrimary}`}>{employee.department}</p>
              </div>

              <div>
                <p className={`${textMuted} text-sm`}>Business Function</p>
                <p className={`${textPrimary}`}>{employee.businessFunction}</p>
              </div>

              <div>
                <p className={`${textMuted} text-sm`}>Unit</p>
                <p className={`${textPrimary}`}>{employee.unit}</p>
              </div>

              <div>
                <p className={`${textMuted} text-sm`}>Grade</p>
                <p className={`${textPrimary}`}>{employee.grade}</p>
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className={`${bgCard} rounded-lg p-6 ${shadowClass}`}>
            <h3
              className={`text-lg font-semibold ${textPrimary} mb-4 border-b ${borderColor} pb-2`}
            >
              Additional Information
            </h3>

            <div className="space-y-4">
              <div>
                <p className={`${textMuted} text-sm`}>Line Manager</p>
                <Link href={`/structure/employee/${employee.lineManagerId}`}>
                  <p className={`${textPrimary} hover:underline`}>
                    {employee.lineManager}
                  </p>
                </Link>
              </div>

              <div>
                <p className={`${textMuted} text-sm`}>Office Location</p>
                <p className={`${textPrimary}`}>{employee.officeLocation}</p>
              </div>

              <div>
                <p className={`${textMuted} text-sm`}>Direct Reports</p>
                <p className={`${textPrimary}`}>
                  {employee.directReports} employee(s)
                </p>
              </div>

              <div>
                <p className={`${textMuted} text-sm`}>Status</p>
                <div className="mt-1">
                  <EmployeeStatusBadge status={employee.status} />
                </div>
              </div>

              <div>
                <p className={`${textMuted} text-sm mb-2`}>Expertise</p>
                <div className="flex flex-wrap gap-2">
                  {employee.expertise.map((skill, index) => (
                    <span
                      key={index}
                      className={`${bgAccent} ${textPrimary} px-2 py-1 rounded-md text-xs`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Documents and Activity Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          {/* Documents */}
          <div className={`${bgCard} rounded-lg p-6 ${shadowClass}`}>
            <h3
              className={`text-lg font-semibold ${textPrimary} mb-4 border-b ${borderColor} pb-2`}
            >
              Documents
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                <div className="flex items-center">
                  <svg
                    className="w-8 h-8 text-blue-500 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                  <div>
                    <p className={`font-medium ${textPrimary}`}>Job Contract</p>
                    <p className={`text-sm ${textMuted}`}>
                      PDF • 2.3 MB • Uploaded Jan 15, 2023
                    </p>
                  </div>
                </div>
                <button
                  className={`${btnSecondary} ${textPrimary} p-2 rounded-md`}
                >
                  <Download size={16} />
                </button>
              </div>

              <div className="flex items-center justify-between p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
                <div className="flex items-center">
                  <svg
                    className="w-8 h-8 text-green-500 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    ></path>
                  </svg>
                  <div>
                    <p className={`font-medium ${textPrimary}`}>Resume</p>
                    <p className={`text-sm ${textMuted}`}>
                      PDF • 1.8 MB • Uploaded Jan 10, 2023
                    </p>
                  </div>
                </div>
                <button
                  className={`${btnSecondary} ${textPrimary} p-2 rounded-md`}
                >
                  <Download size={16} />
                </button>
              </div>

              <div className="text-center mt-6">
                <button
                  className={`${btnPrimary} text-white px-4 py-2 rounded-md`}
                >
                  Upload New Document
                </button>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className={`${bgCard} rounded-lg p-6 ${shadowClass}`}>
            <h3
              className={`text-lg font-semibold ${textPrimary} mb-4 border-b ${borderColor} pb-2`}
            >
              Recent Activity
            </h3>

            <div className="space-y-4">
              <div className="relative pb-4 pl-6 border-l-2 border-blue-500">
                <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-blue-500"></div>
                <p className={`font-medium ${textPrimary}`}>
                  Completed Training
                </p>
                <p className={`${textSecondary}`}>
                  Leadership Development Program
                </p>
                <p className={`text-sm ${textMuted}`}>April 15, 2025</p>
              </div>

              <div className="relative pb-4 pl-6 border-l-2 border-green-500">
                <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-green-500"></div>
                <p className={`font-medium ${textPrimary}`}>
                  Performance Review
                </p>
                <p className={`${textSecondary}`}>
                  Q1 2025 - Excellent Performance
                </p>
                <p className={`text-sm ${textMuted}`}>March 31, 2025</p>
              </div>

              <div className="relative pb-4 pl-6 border-l-2 border-purple-500">
                <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-purple-500"></div>
                <p className={`font-medium ${textPrimary}`}>Promotion</p>
                <p className={`${textSecondary}`}>
                  Promoted to Senior Position
                </p>
                <p className={`text-sm ${textMuted}`}>January 01, 2025</p>
              </div>

              <div className="relative pl-6 border-l-2 border-gray-300 dark:border-gray-600">
                <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                <p className={`font-medium ${textPrimary}`}>Joined Company</p>
                <p className={`${textSecondary}`}>
                  Started as {employee.position}
                </p>
                <p className={`text-sm ${textMuted}`}>
                  {new Date(employee.joinDate).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
