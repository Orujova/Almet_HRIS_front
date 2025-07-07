// src/app/structure/add-employee/page.jsx - Complete with API Integration
"use client";
import { useState, useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "../../../store";
import { Info, ChevronLeft, Users, FileText, BookOpen, X, CheckCircle, AlertTriangle } from "lucide-react";
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
      case 'grading':
        return <CheckCircle className="text-indigo-500" size={20} />;
      case 'status':
        return <AlertTriangle className="text-amber-500" size={20} />;
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
 * Add Employee Page with comprehensive guidance and API integration
 */
const AddEmployeePage = () => {
  const { darkMode } = useTheme();
  const [modalState, setModalState] = useState({
    isOpen: false,
    type: '',
    title: '',
    content: null
  });

  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";

  useEffect(() => {
    document.title = "Add New Employee - Almet Holding HRIS";
  }, []);

  const openModal = (type) => {
    let title = '';
    let content = null;

    switch (type) {
      case 'onboarding':
        title = 'Employee Onboarding Guide';
        content = (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3">
                Welcome to Almet Holding Employee Onboarding
              </h3>
              <p className={`${textSecondary} leading-relaxed mb-4`}>
                This comprehensive guide will help you navigate through adding a new employee to our HRIS system. 
                The process is designed to be intuitive while ensuring all necessary information is captured accurately.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium text-green-600 dark:text-green-400">✓ What You'll Need</h4>
                <ul className={`space-y-2 text-sm ${textSecondary}`}>
                  <li>• Employee's personal information (name, email, phone)</li>
                  <li>• Job details (title, department, position group)</li>
                  <li>• Contract information (duration, start date)</li>
                  <li>• Line manager assignment (optional)</li>
                  <li>• Employee documents (optional)</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-amber-600 dark:text-amber-400">⚡ Automated Features</h4>
                <ul className={`space-y-2 text-sm ${textSecondary}`}>
                  <li>• Status automatically assigned based on contract</li>
                  <li>• Grading levels fetched from position group</li>
                  <li>• Contract end dates calculated automatically</li>
                  <li>• Employee ID validation and uniqueness check</li>
                  <li>• Organizational hierarchy maintained</li>
                </ul>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h4 className="font-medium text-green-800 dark:text-green-300 mb-2">
                Step-by-Step Process
              </h4>
              <ol className={`space-y-1 text-sm ${textSecondary} ml-4`}>
                <li>1. <strong>Basic Information:</strong> Enter personal details and contact information</li>
                <li>2. <strong>Job Details:</strong> Set up organizational structure and grading</li>
                <li>3. <strong>Management:</strong> Assign line manager and tags (optional)</li>
                <li>4. <strong>Documents:</strong> Upload any relevant files (optional)</li>
              </ol>
            </div>
          </div>
        );
        break;

      case 'grading':
        title = 'Grading System Integration';
        content = (
          <div className="space-y-6">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-indigo-800 dark:text-indigo-300 mb-3">
                Understanding the Grading System
              </h3>
              <p className={`${textSecondary} leading-relaxed`}>
                Our HRIS uses a comprehensive grading system that automatically assigns appropriate salary levels 
                based on position groups. Each position has specific grading levels with standardized short codes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-indigo-600 dark:text-indigo-400 mb-3">Grading Levels</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span>LD - Lower Decile</span>
                    <span className="text-gray-500">Entry level</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span>LQ - Lower Quartile</span>
                    <span className="text-gray-500">Below average</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span>M - Median</span>
                    <span className="text-gray-500">Standard level</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span>UQ - Upper Quartile</span>
                    <span className="text-gray-500">Above average</span>
                  </div>
                  <div className="flex justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span>UD - Upper Decile</span>
                    <span className="text-gray-500">Top tier</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-indigo-600 dark:text-indigo-400 mb-3">Position Examples</h4>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="font-medium">Vice Chairman</div>
                    <div className="text-gray-500">VC-LD, VC-LQ, VC-M, VC-UQ, VC-UD</div>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="font-medium">Director</div>
                    <div className="text-gray-500">DIR-LD, DIR-LQ, DIR-M, DIR-UQ, DIR-UD</div>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="font-medium">Manager</div>
                    <div className="text-gray-500">MGR-LD, MGR-LQ, MGR-M, MGR-UQ, MGR-UD</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <h4 className="font-medium text-amber-800 dark:text-amber-300 mb-2">
                Important Notes
              </h4>
              <ul className={`space-y-1 text-sm ${textSecondary}`}>
                <li>• Grading levels are automatically fetched based on selected position group</li>
                <li>• Each position has standardized shorthand codes for easy identification</li>
                <li>• Median (M) level is typically assigned as default for new employees</li>
                <li>• Grading affects salary calculations and organizational reporting</li>
              </ul>
            </div>
          </div>
        );
        break;

      case 'status':
        title = 'Automatic Status Management';
        content = (
          <div className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-amber-800 dark:text-amber-300 mb-3">
                Smart Status Assignment
              </h3>
              <p className={`${textSecondary} leading-relaxed`}>
                Employee status is automatically managed by the system based on contract type, start dates, 
                and duration. This ensures consistency and reduces manual errors in status tracking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-amber-600 dark:text-amber-400 mb-3">Status Flow</h4>
                <div className="space-y-3">
                  <div className="flex items-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                    <div className="w-3 h-3 bg-orange-500 rounded-full mr-3"></div>
                    <div>
                      <div className="font-medium text-orange-800 dark:text-orange-300">ONBOARDING</div>
                      <div className="text-sm text-orange-600 dark:text-orange-400">Initial status for new employees</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                    <div>
                      <div className="font-medium text-yellow-800 dark:text-yellow-300">PROBATION</div>
                      <div className="text-sm text-yellow-600 dark:text-yellow-400">Based on contract duration</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <div>
                      <div className="font-medium text-green-800 dark:text-green-300">ACTIVE</div>
                      <div className="text-sm text-green-600 dark:text-green-400">Regular working status</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-amber-600 dark:text-amber-400 mb-3">Contract Types</h4>
                <div className="space-y-2 text-sm">
                  <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="font-medium">Permanent</div>
                    <div className="text-gray-500">No end date, standard progression</div>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="font-medium">Fixed Term (1-3 years)</div>
                    <div className="text-gray-500">Specific end date, status tracking</div>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="font-medium">Probation</div>
                    <div className="text-gray-500">Trial period with review dates</div>
                  </div>
                  <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <div className="font-medium">Internship</div>
                    <div className="text-gray-500">Learning-focused, limited duration</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                Status Update Rules
              </h4>
              <ul className={`space-y-1 text-sm ${textSecondary}`}>
                <li>• Status change durations are configurable per contract type</li>
                <li>• System automatically transitions employees based on time periods</li>
                <li>• Manual status updates are logged for audit purposes</li>
                <li>• Contract end dates trigger automatic status reviews</li>
              </ul>
            </div>
          </div>
        );
        break;

      case 'documents':
        title = 'Document Management';
        content = (
          <div className="space-y-6">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-3">
                Optional Document Upload
              </h3>
              <p className={`${textSecondary} leading-relaxed`}>
                Document upload is completely optional during employee creation. You can add, remove, 
                or modify documents at any time after the employee is created in the system.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-green-600 dark:text-green-400 mb-3">Supported File Types</h4>
                <div className="space-y-2">
                  <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="mr-2">📄</span>
                    <span>PDF Documents (.pdf)</span>
                  </div>
                  <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="mr-2">📝</span>
                    <span>Word Documents (.doc, .docx)</span>
                  </div>
                  <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="mr-2">🖼️</span>
                    <span>Images (.jpg, .png, .gif)</span>
                  </div>
                  <div className="flex items-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <span className="mr-2">📄</span>
                    <span>Text Files (.txt)</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-green-600 dark:text-green-400 mb-3">Common Documents</h4>
                <ul className={`space-y-2 text-sm ${textSecondary}`}>
                  <li>• Employment contracts</li>
                  <li>• ID copies and personal documents</li>
                  <li>• Educational certificates</li>
                  <li>• Professional certifications</li>
                  <li>• Medical certificates</li>
                  <li>• Background check results</li>
                  <li>• Emergency contact forms</li>
                </ul>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">
                File Guidelines
              </h4>
              <ul className={`space-y-1 text-sm ${textSecondary}`}>
                <li>• Maximum file size: 10MB per document</li>
                <li>• Files are securely stored and encrypted</li>
                <li>• Documents can be added/removed anytime after creation</li>
                <li>• Access is controlled based on user permissions</li>
                <li>• All document changes are logged for audit purposes</li>
              </ul>
            </div>
          </div>
        );
        break;

      default:
        title = 'Employee Management Help';
        content = (
          <div className="space-y-4">
            <p className={`${textSecondary} leading-relaxed`}>
              Welcome to the employee management system. Here you can add new employees, 
              manage their information, and track their progress through the organization.
            </p>
          </div>
        );
    }

    setModalState({ isOpen: true, type, title, content });
  };

  const closeModal = () => {
    setModalState({ isOpen: false, type: '', title: '', content: null });
  };

  return (
    <Provider store={store}>
      <DashboardLayout>
        <div className="p-4 max-w-7xl mx-auto">
          {/* Header with navigation and help */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Link 
                  href="/structure/headcount-table"
                  className="flex items-center text-gray-600 dark:text-gray-400 hover:text-almet-sapphire transition-colors mr-4"
                >
                  <ChevronLeft size={20} className="mr-1" />
                  Back to Employee Directory
                </Link>
              </div>

              {/* Help buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openModal('grading')}
                  className={`${bgCard} border ${borderColor} px-3 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-sm flex items-center`}
                >
                  <CheckCircle size={16} className="mr-2 text-indigo-500" />
                  Grading System
                </button>
                
                <button
                  onClick={() => openModal('status')}
                  className={`${bgCard} border ${borderColor} px-3 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-sm flex items-center`}
                >
                  <AlertTriangle size={16} className="mr-2 text-amber-500" />
                  Status Management
                </button>
                
                <button
                  onClick={() => openModal('documents')}
                  className={`${bgCard} border ${borderColor} px-3 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-sm flex items-center`}
                >
                  <FileText size={16} className="mr-2 text-green-500" />
                  Document Guide
                </button>
                
                <button
                  onClick={() => openModal('onboarding')}
                  className="bg-almet-sapphire text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-lg flex items-center"
                >
                  <BookOpen size={16} className="mr-2" />
                  Onboarding Guide
                </button>
              </div>
            </div>

           
          </div>

          {/* Employee Form */}
          <EmployeeForm />

          {/* Info Modal */}
          <InfoModal 
            isOpen={modalState.isOpen}
            onClose={closeModal}
            title={modalState.title}
            content={modalState.content}
            type={modalState.type}
          />
        </div>
      </DashboardLayout>
    </Provider>
  );
};

export default AddEmployeePage;