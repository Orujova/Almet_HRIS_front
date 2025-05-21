// src/components/headcount/EmployeeDetail/EmployeeDetailHeader.jsx
import Link from "next/link";
import { Edit, Download, MessageSquare, UserX, ChevronLeft } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";
import EmployeeStatusBadge from "../EmployeeStatusBadge";

/**
 * Header component for employee detail page
 * @param {Object} props - Component props
 * @param {Object} props.employee - Employee data
 * @param {Function} props.onEdit - Edit button click handler
 * @param {Function} props.onExport - Export button click handler
 * @param {Function} props.onMessage - Message button click handler
 * @param {Function} props.onDelete - Delete button click handler
 * @returns {JSX.Element} - Employee detail header component
 */
const EmployeeDetailHeader = ({ 
  employee, 
  onEdit, 
  onExport, 
  onMessage, 
  onDelete 
}) => {
  const { darkMode } = useTheme();

  // Theme-dependent classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const btnPrimary = darkMode
    ? "bg-blue-600 hover:bg-blue-700"
    : "bg-blue-500 hover:bg-blue-600";
  const btnSecondary = darkMode
    ? "bg-gray-700 hover:bg-gray-600"
    : "bg-gray-200 hover:bg-gray-300";
  const shadowClass = darkMode ? "" : "shadow-md";

  // Generate initials from employee name
  const getInitials = () => {
    if (!employee.name) return "NA";
    
    const names = employee.name.split(" ");
    if (names.length === 1) return names[0].charAt(0);
    
    // Get first letter of first name and first letter of last name
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`;
  };

  // Get department-based color for the avatar
  const getDepartmentColor = () => {
    if (!employee.department) return "bg-blue-500";
    
    const department = employee.department.toUpperCase();
    
    if (department.includes("BUSINESS DEVELOPMENT")) return "bg-blue-500";
    if (department.includes("FINANCE")) return "bg-green-500";
    if (department.includes("COMPLIANCE")) return "bg-red-500";
    if (department.includes("HR")) return "bg-purple-500";
    if (department.includes("ADMINISTRATIVE")) return "bg-yellow-500";
    if (department.includes("OPERATIONS")) return "bg-orange-500";
    if (department.includes("PROJECTS MANAGEMENT")) return "bg-teal-500";
    if (department.includes("TRADE")) return "bg-indigo-500";
    if (department.includes("STOCK SALES")) return "bg-pink-500";
    
    return "bg-blue-500"; // Default color
  };

  return (
    <div>
      {/* Back button */}
      <div className="mb-4">
        <Link
          href="/structure/headcount-table"
          className={`${textPrimary} flex items-center hover:underline`}
        >
          <ChevronLeft size={18} className="mr-1" />
          <span>Back to Headcount Table</span>
        </Link>
      </div>

      {/* Employee profile header card */}
      <div className={`${bgCard} rounded-lg p-6 ${shadowClass}`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          {/* Profile image or initials */}
          <div className="flex items-center">
            <div className={`w-20 h-20 rounded-full ${getDepartmentColor()} flex items-center justify-center text-white text-2xl font-bold mr-4`}>
              {employee.profileImage ? (
                <img
                  src={employee.profileImage}
                  alt={employee.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                getInitials()
              )}
            </div>

            {/* Name, job title, and status */}
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

          {/* Action buttons */}
          <div className="lg:ml-auto flex flex-wrap gap-2">
            <button
              onClick={onEdit}
              className={`${btnPrimary} text-white px-4 py-2 rounded-md flex items-center`}
            >
              <Edit size={16} className="mr-2" />
              Edit Employee
            </button>
            <button
              onClick={onExport}
              className={`${btnSecondary} ${textPrimary} px-4 py-2 rounded-md flex items-center`}
            >
              <Download size={16} className="mr-2" />
              Export Data
            </button>
            <button
              onClick={onMessage}
              className={`${btnSecondary} ${textPrimary} px-4 py-2 rounded-md flex items-center`}
            >
              <MessageSquare size={16} className="mr-2" />
              Message
            </button>
            <button
              onClick={onDelete}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md flex items-center"
            >
              <UserX size={16} className="mr-2" />
              Delete
            </button>
          </div>
        </div>

        {/* Quick info badges */}
        <div className="flex flex-wrap gap-2 mt-6">
          {employee.empNo && (
            <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs px-2 py-1 rounded-full">
              ID: {employee.empNo}
            </div>
          )}
          {employee.businessFunction && (
            <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded-full">
              {employee.businessFunction}
            </div>
          )}
          {employee.office && (
            <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs px-2 py-1 rounded-full">
              {employee.office}
            </div>
          )}
          {employee.grade && (
            <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 text-xs px-2 py-1 rounded-full">
              Grade: {employee.grade}
            </div>
          )}
          {employee.joinDate && (
            <div className="bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 text-xs px-2 py-1 rounded-full">
              Joined: {new Date(employee.joinDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetailHeader;