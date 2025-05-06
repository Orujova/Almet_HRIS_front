// src/components/headcount/EmployeeForm.jsx
import { useState } from "react";
import { ChevronLeft, Save, Check } from "lucide-react";
import { useTheme } from "../common/ThemeProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";

const EmployeeForm = ({ employee = null }) => {
  const { darkMode } = useTheme();
  const router = useRouter();
  const isEditMode = !!employee;

  // Theme-dependent classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const inputBg = darkMode ? "bg-gray-700" : "bg-gray-100";
  const btnPrimary = darkMode
    ? "bg-blue-600 hover:bg-blue-700"
    : "bg-blue-500 hover:bg-blue-600";
  const btnSecondary = darkMode
    ? "bg-gray-700 hover:bg-gray-600"
    : "bg-gray-200 hover:bg-gray-300";
  const shadowClass = darkMode ? "" : "shadow-md";

  // Form state
  const [formData, setFormData] = useState({
    firstName: employee?.firstName || "",
    lastName: employee?.lastName || "",
    email: employee?.email || "",
    joinDate: employee?.joinDate || "",
    businessFunction: employee?.businessFunction || "",
    department: employee?.department || "",
    unit: employee?.unit || "",
    position: employee?.position || "",
    jobTitle: employee?.jobTitle || "",
    lineManager: employee?.lineManager || "",
    status: employee?.status || "ACTIVE",
  });

  const [activeStep, setActiveStep] = useState(1);
  const totalSteps = 3;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleNextStep = () => {
    if (activeStep < totalSteps) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // In a real implementation, this would send the data to an API
    console.log("Submitting form data:", formData);

    // Show success message and redirect
    alert(
      isEditMode
        ? "Employee updated successfully!"
        : "Employee added successfully!"
    );
    router.push("/structure/headcount-table");
  };

  const handleCancel = () => {
    if (
      confirm(
        "Are you sure you want to cancel? Any unsaved changes will be lost."
      )
    ) {
      router.push("/structure/headcount-table");
    }
  };

  // Step content
  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className={`text-xl font-semibold ${textPrimary}`}>
              Basic Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className={`w-full p-2 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className={`w-full p-2 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className={`w-full p-2 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Join Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="joinDate"
                  value={formData.joinDate}
                  onChange={handleInputChange}
                  required
                  className={`w-full p-2 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className={`text-xl font-semibold ${textPrimary}`}>
              Job Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Business Function <span className="text-red-500">*</span>
                </label>
                <select
                  name="businessFunction"
                  value={formData.businessFunction}
                  onChange={handleInputChange}
                  required
                  className={`w-full p-2 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select Business Function</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Finance">Finance</option>
                  <option value="HR">HR</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  className={`w-full p-2 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select Department</option>
                  <option value="BUSINESS DEVELOPMENT">
                    Business Development
                  </option>
                  <option value="ADMINISTRATIVE">Administrative</option>
                  <option value="FINANCE">Finance</option>
                  <option value="HR">HR</option>
                  <option value="COMPLIANCE">Compliance</option>
                </select>
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  className={`w-full p-2 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select Department</option>
                  <option value="BUSINESS DEVELOPMENT">
                    Business Development
                  </option>
                  <option value="ADMINISTRATIVE">Administrative</option>
                  <option value="FINANCE">Finance</option>
                  <option value="HR">HR</option>
                  <option value="COMPLIANCE">Compliance</option>
                </select>
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Unit <span className="text-red-500">*</span>
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  required
                  className={`w-full p-2 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select Unit</option>
                  <option value="BUSINESS DEVELOPMENT">
                    Business Development
                  </option>
                  <option value="BUSINESS SUPPORT">Business Support</option>
                  <option value="PRODUCT DEVELOPMENT">
                    Product Development
                  </option>
                </select>
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Position <span className="text-red-500">*</span>
                </label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleInputChange}
                  required
                  className={`w-full p-2 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select Position</option>
                  <option value="Executive">Executive</option>
                  <option value="Senior Specialist">Senior Specialist</option>
                  <option value="Specialist">Specialist</option>
                  <option value="Junior Specialist">Junior Specialist</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  required
                  className={`w-full p-2 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Line Manager <span className="text-red-500">*</span>
                </label>
                <select
                  name="lineManager"
                  value={formData.lineManager}
                  onChange={handleInputChange}
                  required
                  className={`w-full p-2 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="">Select Line Manager</option>
                  <option value="Eric Johnson">Eric Johnson</option>
                  <option value="Tamara Singh">Tamara Singh</option>
                  <option value="James Kowalski">James Kowalski</option>
                  <option value="Maria Delgado">Maria Delgado</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className={`text-xl font-semibold ${textPrimary}`}>
              Additional Settings
            </h2>

            <div className="grid grid-cols-1 gap-6">
              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Employee Status <span className="text-red-500">*</span>
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  required
                  className={`w-full p-2 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="ON BOARDING">On Boarding</option>
                  <option value="PROBATION">Probation</option>
                  <option value="ON LEAVE">On Leave</option>
                </select>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h3 className={`text-lg font-medium ${textPrimary} mb-2`}>
                  Document Upload
                </h3>
                <p className={`${textMuted} mb-4`}>
                  Upload employee documents (optional)
                </p>

                <div
                  className={`border-2 border-dashed ${borderColor} rounded-lg p-6 flex flex-col items-center justify-center`}
                >
                  <div className="mb-4">
                    <svg
                      className="w-16 h-16 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      ></path>
                    </svg>
                  </div>
                  <p className={`${textPrimary} text-center mb-2`}>
                    Drag & Drop files here
                  </p>
                  <p className={`${textMuted} text-center mb-4`}>or</p>
                  <button
                    type="button"
                    className={`${btnSecondary} ${textPrimary} px-4 py-2 rounded-md`}
                  >
                    Browse Files
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Link
          href="/structure/headcount-table"
          className={`${textPrimary} flex items-center mr-4`}
        >
          <ChevronLeft size={20} className="mr-1" />
          <span>Back to Headcount Table</span>
        </Link>
        <h1 className={`text-2xl font-bold ${textPrimary}`}>
          {isEditMode ? "Edit Employee" : "Add New Employee"}
        </h1>
      </div>

      {/* Step Indicators */}
      <div className="flex items-center mb-6">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div key={index} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index + 1 === activeStep
                  ? btnPrimary + " text-white"
                  : index + 1 < activeStep
                  ? "bg-green-500 text-white"
                  : btnSecondary + ` ${textPrimary}`
              }`}
            >
              {index + 1 < activeStep ? <Check size={16} /> : index + 1}
            </div>
            {index < totalSteps - 1 && (
              <div
                className={`h-1 w-12 ${
                  index + 1 < activeStep ? "bg-green-500" : borderColor
                }`}
              ></div>
            )}
          </div>
        ))}
      </div>

      {/* Main Form */}
      <div className={`${bgCard} rounded-lg p-6 ${shadowClass} mb-6`}>
        <form onSubmit={handleSubmit}>
          {renderStepContent()}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              {activeStep > 1 && (
                <button
                  type="button"
                  className={`${btnSecondary} ${textPrimary} px-4 py-2 rounded-md mr-2`}
                  onClick={handlePrevStep}
                >
                  Previous
                </button>
              )}
              <button
                type="button"
                className={`${textPrimary} hover:underline`}
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
            <div>
              {activeStep < totalSteps ? (
                <button
                  type="button"
                  className={`${btnPrimary} text-white px-4 py-2 rounded-md`}
                  onClick={handleNextStep}
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className={`${btnPrimary} text-white px-4 py-2 rounded-md flex items-center`}
                >
                  <Save size={16} className="mr-2" />
                  {isEditMode ? "Update Employee" : "Save Employee"}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
