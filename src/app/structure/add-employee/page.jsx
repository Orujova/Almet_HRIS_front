// src/app/structure/add-employee/page.jsx
"use client";
import { useState } from "react";
import { Info, ChevronLeft, Users, FileText, BookOpen, X } from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import EmployeeForm from "@/components/headcount/EmployeeForm";
import { useTheme } from "@/components/common/ThemeProvider";
import Link from "next/link";

/**
 * Info Modal Component
 */
const InfoModal = ({ isOpen, onClose, title, content, type = "info" }) => {
  const { darkMode } = useTheme();
  
  if (!isOpen) return null;

  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";

  const getIcon = () => {
    switch (type) {
      case 'onboarding':
        return <BookOpen className="text-blue-500" size={20} />;
      case 'documents':
        return <FileText className="text-green-500" size={20} />;
      case 'employees':
        return <Users className="text-purple-500" size={20} />;
      default:
        return <Info className="text-blue-500" size={20} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${bgCard} rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border ${borderColor}`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            {getIcon()}
            <h2 className={`text-lg font-bold ${textPrimary} ml-3`}>
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6">
          {content}
        </div>
      </div>
    </div>
  );
};

/**
 * Add Employee Page
 */
export default function AddEmployeePage() {
  const { darkMode } = useTheme();
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: '',
    title: '',
    content: null
  });

  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";

  const openModal = (type) => {
    let title = '';
    let content = null;

    switch (type) {
      case 'onboarding':
        title = 'Employee Onboarding Guide';
        content = (
          <div className="space-y-4">
            <p className={`${textSecondary} leading-relaxed`}>
              Welcome to the Almet Holding employee onboarding process. This comprehensive guide will help you navigate through adding a new employee.
            </p>
            
            <div className="space-y-6 text-xs">
              <div>
                <h3 className={`text-lg font-semibold ${textPrimary} mb-3`}>Step 1: Basic Information</h3>
                <ul className={`${textSecondary} space-y-2 text-xs`}>
                  <li>• Employee ID must be unique and follow company format (e.g., HLD001)</li>
                  <li>• Full name should match official documents</li>
                  <li>• Company email should follow naming convention</li>
                  <li>• Emergency contact information is mandatory</li>
                </ul>
              </div>
              
              <div>
                <h3 className={`text-lg font-semibold ${textPrimary} mb-3`}>Step 2: Job Information</h3>
                <ul className={`${textSecondary} space-y-2 text-xs`}>
                  <li>• Select appropriate business function and department</li>
                  <li>• Assign correct position group and grade level</li>
                  <li>• Set accurate start date for automatic status management</li>
                  <li>• Choose contract duration for probation period calculation</li>
                </ul>
              </div>
              
              <div>
                <h3 className={`text-lg font-semibold ${textPrimary} mb-3`}>Step 3: Management Structure</h3>
                <ul className={`${textSecondary} space-y-2 text-xs`}>
                  <li>• Assign line manager for reporting structure</li>
                  <li>• Employee status will be set automatically</li>
                  <li>• Add relevant tags for tracking purposes</li>
                  <li>• Include any special notes or requirements</li>
                </ul>
              </div>
              
              <div>
                <h3 className={`text-lg font-semibold ${textPrimary} mb-3`}>Step 4: Documentation</h3>
                <ul className={`${textSecondary} space-y-2 text-xs`}>
                  <li>• Upload employment contract and ID documents</li>
                  <li>• Include educational certificates and CV</li>
                  <li>• Add any compliance or certification documents</li>
                  <li>• Ensure all files are properly named</li>
                </ul>
              </div>
            </div>
          </div>
        );
        break;
        
      case 'documents':
        title = 'Required Documents Checklist';
        content = (
          <div className="space-y-4">
            <p className={`${textSecondary} leading-relaxed`}>
              Please ensure all required documents are collected and uploaded during the employee onboarding process.
            </p>
            
            <div className="space-y-6 text-xs">
              <div>
                <h3 className={`text-lg font-semibold ${textPrimary} mb-3 text-red-600 dark:text-red-400`}>🔴 Mandatory Documents</h3>
                <div className={`${textSecondary} space-y-2 text-xs`}>
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2" disabled />
                    <span>Employment Contract (signed)</span>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2" disabled />
                    <span>National ID Card / Passport copy</span>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2" disabled />
                    <span>Tax Registration Certificate</span>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2" disabled />
                    <span>Social Security Registration</span>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2" disabled />
                    <span>Bank Account Information</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className={`text-lg font-semibold ${textPrimary} mb-3 text-yellow-600 dark:text-yellow-400`}>🟡 Required for Position</h3>
                <div className={`${textSecondary} space-y-2 text-xs`}>
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2" disabled />
                    <span>Educational Certificates / Diploma</span>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2" disabled />
                    <span>Professional Certifications</span>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2" disabled />
                    <span>Previous Employment References</span>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2" disabled />
                    <span>Updated CV/Resume</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className={`text-base font-semibold ${textPrimary} mb-3 text-green-600 dark:text-green-400`}>🟢 Optional Documents</h3>
                <div className={`${textSecondary} space-y-2 text-xs`}>
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2" disabled />
                    <span>Medical Certificate (if required)</span>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2" disabled />
                    <span>Language Proficiency Certificates</span>
                  </div>
                  <div className="flex items-center">
                    <input type="checkbox" className="mr-2" disabled />
                    <span>Non-Disclosure Agreement</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className={`text-xs text-yellow-800 dark:text-yellow-300`}>
                📋 <strong>Note:</strong> All documents should be in PDF format, clearly scanned, and properly named.
              </p>
            </div>
          </div>
        );
        break;
    }

    setModalState({
      isOpen: true,
      type,
      title,
      content
    });
  };

  const closeModal = () => {
    setModalState({
      isOpen: false,
      type: '',
      title: '',
      content: null
    });
  };

  return (
    <>
      <DashboardLayout>
        <div className="w-full max-w-none px-0">
          <div className="container mx-auto px-4 py-6">
            <div className="mb-4">
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
              
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-xs rounded-lg p-2 mb-2">
                <div className="flex items-start">
                  <div className="bg-blue-100 dark:bg-blue-800 p-2 rounded-full mr-4 flex-shrink-0">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-300" />
                  </div>
                  <div>
                    <h3 className={`font-medium text-blue-800 dark:text-blue-300`}>Adding a New Employee</h3>
                    <p className={`text-blue-600 dark:text-blue-400 text-xs mt-1`}>
                      Fill in the employee information using the multi-step form below. Fields marked with an asterisk (*) are required.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      <button 
                        onClick={() => openModal('onboarding')}
                        className="text-xs font-medium px-3 py-1 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      >
                        View onboarding guide
                      </button>
                      <button 
                        onClick={() => openModal('documents')}
                        className="text-xs font-medium px-3 py-1 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      >
                        Required documents
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <EmployeeForm />
        </div>
      </DashboardLayout>

      <InfoModal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        content={modalState.content}
        type={modalState.type}
      />
    </>
  );
}