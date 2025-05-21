// src/components/headcount/EmployeeForm.jsx
<<<<<<< HEAD
import { useState } from "react";
<<<<<<< Updated upstream
import { ChevronLeft, Save, Check } from "lucide-react";
=======
import { ChevronLeft, Save } from "lucide-react";
>>>>>>> Stashed changes
=======
import { useState, useEffect } from "react";
import { ChevronLeft, Save, Check, Upload, Camera, Calendar, Phone, Mail, Building2, UserCircle, User, Globe, Briefcase, GraduationCap, Users, FileText, Award, BookOpen, Languages, BanknoteIcon, CreditCard, Clock, HardDrive } from "lucide-react";
>>>>>>> 736c5ef91c6a62fd8e955cec333c2a2961025f72
import { useTheme } from "../common/ThemeProvider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StepIndicator from "./FormComponents/StepIndicator";
import { 
  FormStep1BasicInfo, 
  FormStep2JobInfo, 
  FormStep3AdditionalInfo, 
  FormStep4Documents 
} from "./FormSteps";

/**
 * Main employee form component with multi-step process
 * @param {Object} props - Component props
 * @param {Object} props.employee - Employee data for edit mode (optional)
 * @returns {JSX.Element} - Employee form component
 */
const EmployeeForm = ({ employee = null }) => {
  const { darkMode } = useTheme();
  const router = useRouter();
  const isEditMode = !!employee;

  // Step configuration
  const stepLabels = ["Basic Info", "Job Info", "Management", "Documents"];
  const totalSteps = stepLabels.length;
  const [activeStep, setActiveStep] = useState(1);

  // Theme-dependent classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
<<<<<<< Updated upstream
  const inputBg = darkMode ? "bg-gray-700" : "bg-gray-100";
  const btnPrimary = darkMode
<<<<<<< HEAD
    ? "bg-blue-600 hover:bg-blue-700"
    : "bg-blue-500 hover:bg-blue-600";
=======
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white transition duration-150";
>>>>>>> Stashed changes
=======
    ? "bg-almet-sapphire hover:bg-almet-astral text-white"
    : "bg-almet-sapphire hover:bg-almet-astral text-white";
>>>>>>> 736c5ef91c6a62fd8e955cec333c2a2961025f72
  const btnSecondary = darkMode
    ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
    : "bg-gray-100 hover:bg-gray-200 text-gray-700";
  const shadowClass = darkMode ? "" : "shadow-md";

  // Form state
  const [formData, setFormData] = useState({
    empNo: employee?.empNo || "",
    firstName: employee?.firstName || "",
    lastName: employee?.lastName || "",
    middleName: employee?.middleName || "",
    email: employee?.email || "",
<<<<<<< HEAD
<<<<<<< Updated upstream
=======
    phone: employee?.phone || "",
    dateOfBirth: employee?.dateOfBirth || "",
>>>>>>> 736c5ef91c6a62fd8e955cec333c2a2961025f72
    joinDate: employee?.joinDate || "",
    empNo: employee?.empNo || "",
    nationality: employee?.nationality || "",
    gender: employee?.gender || "",
    address: employee?.address || "",
    emergencyContact: employee?.emergencyContact || "",
    bloodGroup: employee?.bloodGroup || "",
    idNumber: employee?.idNumber || "",
    passportNumber: employee?.passportNumber || "",
    businessFunction: employee?.businessFunction || "",
    department: employee?.department || "",
    unit: employee?.unit || "",
    position: employee?.position || "",
    jobTitle: employee?.jobTitle || "",
    jobFunction: employee?.jobFunction || "",
    positionGroup: employee?.positionGroup || "",
    grade: employee?.grade || "",
    office: employee?.office || "",
    lineManager: employee?.lineManager || "",
    lineManagerId: employee?.lineManagerId || "",
    status: employee?.status || "ACTIVE",
    workSchedule: employee?.workSchedule || "",
    salary: employee?.salary || "",
    bankAccount: employee?.bankAccount || "",
    taxInfo: employee?.taxInfo || "",
    education: employee?.education || "",
    certificates: employee?.certificates || "",
    skills: employee?.skills ? employee?.skills.join(", ") : "",
    languages: employee?.languages ? employee?.languages.join(", ") : "",
    notes: employee?.notes || "",
    contractType: employee?.contractType || "permanent",
  });

  const [activeStep, setActiveStep] = useState(1);
  const totalSteps = 4; // Added one more step for additional information
  const [profileImage, setProfileImage] = useState(employee?.profileImage || null);
  const [previewImage, setPreviewImage] = useState(employee?.profileImage || null);
  const [documentsUploaded, setDocumentsUploaded] = useState([]);

=======
    phone: employee?.phone || "",
    dateOfBirth: employee?.dateOfBirth || "",
    address: employee?.address || "",
    emergencyContact: employee?.emergencyContact || "",
    startDate: employee?.startDate || "",
    endDate: employee?.endDate || "",
    businessFunction: employee?.businessFunction || "",
    department: employee?.department || "",
    unit: employee?.unit || "",
    jobFunction: employee?.jobFunction || "",
    jobTitle: employee?.jobTitle || "",
    positionGroup: employee?.positionGroup || "",
    grade: employee?.grade || "",
    lineManager: employee?.lineManager || "",
    lineManagerHcNumber: employee?.lineManagerHcNumber || "",
    office: employee?.office || "",
    status: employee?.status || "ACTIVE",
    tags: employee?.tags || [],
    profileImage: employee?.profileImage || null,
    documents: employee?.documents || [],
    notes: employee?.notes || "",
  });

  // Input change handler
>>>>>>> Stashed changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

<<<<<<< HEAD
<<<<<<< Updated upstream
  const handleNextStep = () => {
    if (activeStep < totalSteps) {
      setActiveStep(activeStep + 1);
=======
  // File upload handler
  const handleFileUpload = (fieldName, value) => {
    setFormData({
      ...formData,
      [fieldName]: value
    });
  };

  // Document upload handler
  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files || e.dataTransfer.files);
    if (files.length) {
      const newDocuments = files.map(file => ({
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.type,
        size: file.size,
        dateUploaded: new Date().toISOString(),
      }));

      setFormData({
        ...formData,
        documents: [...formData.documents, ...newDocuments]
      });
    }
  };

  // Remove document handler
  const removeDocument = (index) => {
    const updatedDocuments = [...formData.documents];
    updatedDocuments.splice(index, 1);
    
    setFormData({
      ...formData,
      documents: updatedDocuments
    });
  };

  // Tags change handler
  const handleTagsChange = (tags) => {
    setFormData({
      ...formData,
      tags
    });
  };

  // Navigation handlers
  const handleNextStep = () => {
    if (activeStep < totalSteps) {
      setActiveStep(activeStep + 1);
      window.scrollTo(0, 0);
>>>>>>> Stashed changes
=======
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Create a preview URL for the image
    const previewURL = URL.createObjectURL(file);
    setPreviewImage(previewURL);
    
    // In a real application, you would upload the file to a server and get a URL back
    // For this demo, we're just storing the preview URL
    setProfileImage(previewURL);
  };

  const handleDocumentUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    // Create previews for the documents
    const newDocuments = files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      // In a real app, this would be the URL after uploading to server
      url: URL.createObjectURL(file)
    }));
    
    setDocumentsUploaded([...documentsUploaded, ...newDocuments]);
  };

  const handleNextStep = () => {
    if (activeStep < totalSteps) {
      setActiveStep(activeStep + 1);
      // Scroll to top on step change
      window.scrollTo(0, 0);
>>>>>>> 736c5ef91c6a62fd8e955cec333c2a2961025f72
    }
  };

  const handlePrevStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
<<<<<<< HEAD
<<<<<<< Updated upstream
=======
      window.scrollTo(0, 0);
>>>>>>> Stashed changes
=======
      // Scroll to top on step change
      window.scrollTo(0, 0);
>>>>>>> 736c5ef91c6a62fd8e955cec333c2a2961025f72
    }
  };

  // Form submission
  const handleSubmit = (e) => {
    e.preventDefault();

<<<<<<< HEAD
<<<<<<< Updated upstream
    // In a real implementation, this would send the data to an API
    console.log("Submitting form data:", formData);
=======
    // Combine first and last name to create the full name
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    
    // In a real implementation, this would send the data to an API
    console.log("Submitting form data:", {
      ...formData,
      name: fullName
    });
>>>>>>> Stashed changes
=======
    // Create full name from first and last name
    const fullData = {
      ...formData,
      name: `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}`,
      profileImage: profileImage,
      // Parse skills and languages from comma-separated strings to arrays
      skills: formData.skills ? formData.skills.split(',').map(skill => skill.trim()) : [],
      languages: formData.languages ? formData.languages.split(',').map(lang => lang.trim()) : [],
    };

    // In a real implementation, this would send the data to an API
    console.log("Submitting form data:", fullData);
>>>>>>> 736c5ef91c6a62fd8e955cec333c2a2961025f72

    // Show success message and redirect
    alert(
      isEditMode
        ? "Employee updated successfully!"
        : "Employee added successfully!"
    );
    router.push("/structure/headcount-table");
  };

  // Cancel form
  const handleCancel = () => {
    if (
      confirm(
        "Are you sure you want to cancel? Any unsaved changes will be lost."
      )
    ) {
      router.push("/structure/headcount-table");
    }
  };

<<<<<<< HEAD
<<<<<<< Updated upstream
=======
  // Helper to format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB';
    else return (bytes / 1048576).toFixed(2) + ' MB';
  };

>>>>>>> 736c5ef91c6a62fd8e955cec333c2a2961025f72
  // Step content
=======
  // Render current step content
>>>>>>> Stashed changes
  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
<<<<<<< Updated upstream
          <div className="space-y-6">
            <h2 className={`text-xl font-semibold ${textPrimary}`}>
              Basic Information
            </h2>

            {/* Profile Image Upload */}
            <div className="flex justify-center mb-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className={`h-24 w-24 rounded-full ${previewImage ? '' : 'bg-almet-sapphire'} flex items-center justify-center text-white text-xl font-bold overflow-hidden border-2 border-almet-sapphire`}>
                    {previewImage ? (
                      <img 
                        src={previewImage} 
                        alt="Profile Preview" 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      formData.firstName && formData.lastName ? 
                        `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}` : 
                        <UserCircle size={40} />
                    )}
                  </div>
                  <label htmlFor="profile-image" className="absolute bottom-0 right-0 bg-almet-sapphire text-white p-1 rounded-full cursor-pointer">
                    <Camera size={16} />
                  </label>
                  <input 
                    type="file" 
                    id="profile-image" 
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>
                <p className={`text-xs ${textMuted} mt-2`}>Upload Profile Photo</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  First Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                    className={`w-full p-2 pl-8 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                  />
                  <User className="absolute left-2 top-2.5 text-gray-400" size={16} />
                </div>
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Middle Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleInputChange}
                    className={`w-full p-2 pl-8 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                  />
                  <User className="absolute left-2 top-2.5 text-gray-400" size={16} />
                </div>
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Last Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                    className={`w-full p-2 pl-8 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                  />
                  <User className="absolute left-2 top-2.5 text-gray-400" size={16} />
                </div>
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Employee ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="empNo"
                    value={formData.empNo}
                    onChange={handleInputChange}
                    required
                    className={`w-full p-2 pl-8 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                    placeholder="e.g. EMP001"
                  />
                  <Briefcase className="absolute left-2 top-2.5 text-gray-400" size={16} />
                </div>
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full p-2 pl-8 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                  />
                  <Mail className="absolute left-2 top-2.5 text-gray-400" size={16} />
                </div>
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className={`w-full p-2 pl-8 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                  />
                  <Phone className="absolute left-2 top-2.5 text-gray-400" size={16} />
                </div>
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Date of Birth
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    className={`w-full p-2 pl-8 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                  />
                  <Calendar className="absolute left-2 top-2.5 text-gray-400" size={16} />
                </div>
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Join Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="joinDate"
                    value={formData.joinDate}
                    onChange={handleInputChange}
                    required
                    className={`w-full p-2 pl-8 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                  />
                  <Calendar className="absolute left-2 top-2.5 text-gray-400" size={16} />
                </div>
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className={`w-full p-2 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Nationality
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="nationality"
                    value={formData.nationality}
                    onChange={handleInputChange}
                    className={`w-full p-2 pl-8 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                  />
                  <Globe className="absolute left-2 top-2.5 text-gray-400" size={16} />
                </div>
              </div>

              <div className="md:col-span-3">
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Address
                </label>
                <div className="relative">
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="2"
                    className={`w-full p-2 pl-8 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                  ></textarea>
                  <Building2 className="absolute left-2 top-2.5 text-gray-400" size={16} />
                </div>
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  ID Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="idNumber"
                    value={formData.idNumber}
                    onChange={handleInputChange}
                    className={`w-full p-2 pl-8 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                  />
                  <FileText className="absolute left-2 top-2.5 text-gray-400" size={16} />
                </div>
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Passport Number
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="passportNumber"
                    value={formData.passportNumber}
                    onChange={handleInputChange}
                    className={`w-full p-2 pl-8 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                  />
                  <FileText className="absolute left-2 top-2.5 text-gray-400" size={16} />
                </div>
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Emergency Contact
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="emergencyContact"
                    value={formData.emergencyContact}
                    onChange={handleInputChange}
                    className={`w-full p-2 pl-8 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                    placeholder="Name: Contact Number"
                  />
                  <Phone className="absolute left-2 top-2.5 text-gray-400" size={16} />
                </div>
              </div>
            </div>
          </div>
=======
          <FormStep1BasicInfo 
            formData={formData} 
            handleInputChange={handleInputChange} 
            handleFileUpload={handleFileUpload} 
          />
>>>>>>> Stashed changes
        );
      case 2:
        return (
<<<<<<< Updated upstream
          <div className="space-y-6">
            <h2 className={`text-xl font-semibold ${textPrimary}`}>
              Job Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  className={`w-full p-2 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                >
                  <option value="">Select Business Function</option>
                  <option value="Holding">Holding</option>
                  <option value="Trading">Trading</option>
                  <option value="Georgia">Georgia</option>
                  <option value="UK">UK</option>
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
                  className={`w-full p-2 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                >
                  <option value="">Select Department</option>
                  <option value="BUSINESS DEVELOPMENT">
                    Business Development
                  </option>
                  <option value="ADMINISTRATIVE">Administrative</option>
                  <option value="FINANCE">Finance</option>
                  <option value="HR">HR</option>
                  <option value="COMPLIANCE">Compliance</option>
                  <option value="OPERATIONS">Operations</option>
                  <option value="PROJECTS MANAGEMENT">Projects Management</option>
                  <option value="TRADE">Trade</option>
                  <option value="STOCK SALES">Stock Sales</option>
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
                  className={`w-full p-2 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                >
                  <option value="">Select Unit</option>
                  <option value="BUSINESS DEVELOPMENT">
                    Business Development
                  </option>
                  <option value="BUSINESS SUPPORT">Business Support</option>
                  <option value="PRODUCT DEVELOPMENT">
                    Product Development
                  </option>
                  <option value="CORE OPERATIONS">Core Operations</option>
                  <option value="COMMERCE">Commerce</option>
                  <option value="STRATEGY EXECUTION">Strategy Execution</option>
                </select>
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Position Group <span className="text-red-500">*</span>
                </label>
                <select
                  name="positionGroup"
                  value={formData.positionGroup}
                  onChange={handleInputChange}
                  required
                  className={`w-full p-2 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                >
                  <option value="">Select Position Group</option>
                  <option value="VC">VC</option>
                  <option value="DIRECTOR">Director</option>
                  <option value="MANAGER">Manager</option>
                  <option value="HEAD OF DEPARTMENT">Head of Department</option>
                  <option value="SENIOR SPECIALIST">Senior Specialist</option>
                  <option value="SPECIALIST">Specialist</option>
                  <option value="JUNIOR SPECIALIST">Junior Specialist</option>
                  <option value="BLUE COLLAR">Blue Collar</option>
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
                  className={`w-full p-2 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
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
                <div className="relative">
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    required
                    className={`w-full p-2 pl-8 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                  />
                  <Briefcase className="absolute left-2 top-2.5 text-gray-400" size={16} />
                </div>
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Job Function <span className="text-red-500">*</span>
                </label>
                <select
                  name="jobFunction"
                  value={formData.jobFunction}
                  onChange={handleInputChange}
                  required
                  className={`w-full p-2 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                >
                  <option value="">Select Job Function</option>
                  <option value="DEPUTY CHAIRMAN ON FINANCE & BUSINESS DEVELOPMENT">Deputy Chairman on Finance & Business Development</option>
                  <option value="ADMINISTRATION">Administration</option>
                  <option value="FINANCE OPERATIONS">Finance Operations</option>
                  <option value="HR OPERATIONS">HR Operations</option>
                  <option value="LEGAL">Legal</option>
                  <option value="LOGISTICS">Logistics</option>
                  <option value="PROJECTS MANAGEMENT">Projects Management</option>
                </select>
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Grade <span className="text-red-500">*</span>
                </label>
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleInputChange}
                  required
                  className={`w-full p-2 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                >
                  <option value="">Select Grade</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                </select>
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Office <span className="text-red-500">*</span>
                </label>
                <select
                  name="office"
                  value={formData.office}
                  onChange={handleInputChange}
                  required
                  className={`w-full p-2 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                >
                  <option value="">Select Office</option>
                  <option value="Baku HQ">Baku HQ</option>
                  <option value="Dubai Office">Dubai Office</option>
                  <option value="Tbilisi Office">Tbilisi Office</option>
                  <option value="London Office">London Office</option>
                </select>
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Line Manager
                </label>
                <select
                  name="lineManager"
                  value={formData.lineManager}
                  onChange={handleInputChange}
                  className={`w-full p-2 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                >
                  <option value="">Select Line Manager</option>
                  <option value="Şirin Camalli Rasad Oglu">Şirin Camalli Rasad Oglu</option>
                  <option value="Safa Nacafova Mammadli Qizi">Safa Nacafova Mammadli Qizi</option>
                  <option value="Eric Johnson">Eric Johnson</option>
                  <option value="Tamara Singh">Tamara Singh</option>
                  <option value="James Kowalski">James Kowalski</option>
                  <option value="Maria Delgado">Maria Delgado</option>
                </select>
              </div>

              <div>
                // src/components/headcount/EmployeeForm.jsx - continued

                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Line Manager ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="lineManagerId"
                    value={formData.lineManagerId}
                    onChange={handleInputChange}
                    className={`w-full p-2 pl-8 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                    placeholder="Manager's HC number"
                  />
                  <Users className="absolute left-2 top-2.5 text-gray-400" size={16} />
                </div>
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Contract Type
                </label>
                <select
                  name="contractType"
                  value={formData.contractType}
                  onChange={handleInputChange}
                  className={`w-full p-2 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                >
                  <option value="permanent">Permanent</option>
                  <option value="contract">Contract</option>
                  <option value="part-time">Part-time</option>
                  <option value="temporary">Temporary</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              
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
                  className={`w-full p-2 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="ON BOARDING">On Boarding</option>
                  <option value="PROBATION">Probation</option>
                  <option value="ON LEAVE">On Leave</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className={`text-xl font-semibold ${textPrimary}`}>
              Additional Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Work Schedule
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="workSchedule"
                    value={formData.workSchedule}
                    onChange={handleInputChange}
                    className={`w-full p-2 pl-8 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                    placeholder="e.g. Monday-Friday, 9:00-18:00"
                  />
                  <Clock className="absolute left-2 top-2.5 text-gray-400" size={16} />
                </div>
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Salary
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="salary"
                    value={formData.salary}
                    onChange={handleInputChange}
                    className={`w-full p-2 pl-8 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                  />
                  <BanknoteIcon className="absolute left-2 top-2.5 text-gray-400" size={16} />
                </div>
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Bank Account
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="bankAccount"
                    value={formData.bankAccount}
                    onChange={handleInputChange}
                    className={`w-full p-2 pl-8 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                  />
                  <CreditCard className="absolute left-2 top-2.5 text-gray-400" size={16} />
                </div>
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Tax Information
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="taxInfo"
                    value={formData.taxInfo}
                    onChange={handleInputChange}
                    className={`w-full p-2 pl-8 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                  />
                  <FileText className="absolute left-2 top-2.5 text-gray-400" size={16} />
                </div>
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Education
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    className={`w-full p-2 pl-8 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                    placeholder="e.g. BSc in Computer Science"
                  />
                  <GraduationCap className="absolute left-2 top-2.5 text-gray-400" size={16} />
                </div>
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Certificates
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="certificates"
                    value={formData.certificates}
                    onChange={handleInputChange}
                    className={`w-full p-2 pl-8 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                    placeholder="e.g. CPA, PMP"
                  />
                  <Award className="absolute left-2 top-2.5 text-gray-400" size={16} />
                </div>
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Skills (comma separated)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    className={`w-full p-2 pl-8 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                    placeholder="e.g. Project Management, Leadership"
                  />
                  <BookOpen className="absolute left-2 top-2.5 text-gray-400" size={16} />
                </div>
              </div>

              <div>
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Languages (comma separated)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="languages"
                    value={formData.languages}
                    onChange={handleInputChange}
                    className={`w-full p-2 pl-8 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                    placeholder="e.g. English, Azerbaijani, Russian"
                  />
                  <Languages className="absolute left-2 top-2.5 text-gray-400" size={16} />
                </div>
              </div>

              <div className="md:col-span-3">
                <label
                  className={`block ${textSecondary} text-sm font-medium mb-2`}
                >
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows="3"
                  className={`w-full p-2 rounded-md border ${borderColor} ${inputBg} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                  placeholder="Additional notes about the employee"
                ></textarea>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className={`text-xl font-semibold ${textPrimary}`}>
              Documents
            </h2>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div 
                className={`border-2 border-dashed ${borderColor} rounded-lg p-6 flex flex-col items-center justify-center`}
              >
                <div className="mb-4">
                  <Upload className="w-16 h-16 text-gray-400" />
                </div>
                <p className={`${textPrimary} text-center mb-2`}>
                  Drag & Drop files here
                </p>
                <p className={`${textMuted} text-center mb-4`}>or</p>
                <label htmlFor="document-upload" className={`${btnPrimary} px-4 py-2 rounded-md cursor-pointer`}>
                  Browse Files
                  <input 
                    type="file" 
                    id="document-upload" 
                    multiple 
                    className="hidden"
                    onChange={handleDocumentUpload}
                  />
                </label>
                <p className={`${textMuted} text-xs mt-2`}>
                  Upload employment contract, CV, certificates, etc.
                </p>
              </div>
            </div>

            {/* Display uploaded documents */}
            {documentsUploaded.length > 0 && (
              <div className="mt-6">
                <h3 className={`text-lg font-medium ${textPrimary} mb-4`}>
                  Uploaded Documents ({documentsUploaded.length})
                </h3>
                <div className="space-y-3">
                  {documentsUploaded.map((doc, index) => (
                    <div 
                      key={index} 
                      className={`flex items-center justify-between p-3 rounded-md border ${borderColor}`}
                    >
                      <div className="flex items-center">
                        <HardDrive className="w-8 h-8 text-almet-sapphire mr-3" />
                        <div>
                          <p className={`font-medium ${textPrimary}`}>{doc.name}</p>
                          <p className={`text-sm ${textMuted}`}>
                            {doc.type} • {formatFileSize(doc.size)}
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          const newDocs = [...documentsUploaded];
                          newDocs.splice(index, 1);
                          setDocumentsUploaded(newDocs);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Review Summary */}
            <div className="mt-8 p-4 rounded-lg border border-almet-sapphire bg-almet-sapphire/10">
              <h3 className={`text-lg font-medium ${textPrimary} mb-2`}>
                Review Summary
              </h3>
              <p className={textMuted}>
                Please review all information before submitting. Make sure all required fields are completed.
              </p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className={`font-medium ${textPrimary} mb-1`}>Personal Information</h4>
                  <p className={textMuted}>
                    <strong>Name:</strong> {formData.firstName} {formData.middleName} {formData.lastName}
                  </p>
                  <p className={textMuted}>
                    <strong>Email:</strong> {formData.email || 'Not provided'}
                  </p>
                  <p className={textMuted}>
                    <strong>Phone:</strong> {formData.phone || 'Not provided'}
                  </p>
                </div>
                
                <div>
                  <h4 className={`font-medium ${textPrimary} mb-1`}>Job Information</h4>
                  <p className={textMuted}>
                    <strong>Position:</strong> {formData.jobTitle || 'Not provided'}
                  </p>
                  <p className={textMuted}>
                    <strong>Department:</strong> {formData.department || 'Not provided'}
                  </p>
                  <p className={textMuted}>
                    <strong>Status:</strong> {formData.status || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
          </div>
=======
          <FormStep2JobInfo 
            formData={formData} 
            handleInputChange={handleInputChange} 
          />
        );
      case 3:
        return (
          <FormStep3AdditionalInfo 
            formData={formData} 
            handleInputChange={handleInputChange} 
            handleTagsChange={handleTagsChange} 
          />
        );
      case 4:
        return (
          <FormStep4Documents 
            formData={formData} 
            handleDocumentUpload={handleDocumentUpload} 
            removeDocument={removeDocument} 
          />
>>>>>>> Stashed changes
        );
      default:
        return null;
    }
  };

  return (
<<<<<<< Updated upstream
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
      <div className="flex items-center mb-6 overflow-x-auto">
        {Array.from({ length: totalSteps }).map((_, index) => (
          <div key={index} className="flex items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                index + 1 === activeStep
                  ? btnPrimary
                  : index + 1 < activeStep
                  ? "bg-green-500 text-white"
                  : btnSecondary + ` ${textPrimary}`
              }`}
=======
    <div className="max-w-4xl mx-auto">
      {/* Form Container */}
      <div className={`${bgCard} rounded-xl ${shadowClass} overflow-hidden transition-all duration-200 hover:shadow-lg border border-gray-100 dark:border-gray-700`}>
        {/* Form Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-almet-sapphire to-almet-astral">
          <div className="flex items-center">
            <Link
              href="/structure/headcount-table"
              className="text-white/90 hover:text-white flex items-center mr-4 transition-colors"
>>>>>>> Stashed changes
            >
              <ChevronLeft size={20} className="mr-1" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <h1 className="text-xl font-bold text-white">
              {isEditMode ? "Edit Employee" : "Add New Employee"}
            </h1>
          </div>
        </div>

<<<<<<< HEAD
<<<<<<< Updated upstream
=======
      {/* Step Labels */}
      <div className="flex items-center mb-6 text-xs overflow-x-auto">
        <div className="w-8 text-center">
          <span className={`${activeStep >= 1 ? textPrimary : textMuted}`}>Basic</span>
        </div>
        <div className="w-12"></div>
        <div className="w-8 text-center">
          <span className={`${activeStep >= 2 ? textPrimary : textMuted}`}>Job</span>
        </div>
        <div className="w-12"></div>
        <div className="w-8 text-center">
          <span className={`${activeStep >= 3 ? textPrimary : textMuted}`}>Details</span>
        </div>
        <div className="w-12"></div>
        <div className="w-8 text-center">
          <span className={`${activeStep >= 4 ? textPrimary : textMuted}`}>Docs</span>
        </div>
      </div>

>>>>>>> 736c5ef91c6a62fd8e955cec333c2a2961025f72
      {/* Main Form */}
      <div className={`${bgCard} rounded-lg p-6 ${shadowClass} mb-6`}>
        <form onSubmit={handleSubmit}>
=======
        {/* Step Indicator */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700">
          <StepIndicator 
            currentStep={activeStep} 
            totalSteps={totalSteps} 
            stepLabels={stepLabels} 
          />
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6">
>>>>>>> Stashed changes
          {renderStepContent()}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-10 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              {activeStep > 1 && (
                <button
                  type="button"
                  className={`${btnSecondary} px-4 py-2.5 rounded-md mr-4 transition-colors`}
                  onClick={handlePrevStep}
                >
                  Previous Step
                </button>
              )}
              <button
                type="button"
                className="text-gray-600 dark:text-gray-300 hover:underline"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
            <div>
              {activeStep < totalSteps ? (
                <button
                  type="button"
<<<<<<< HEAD
<<<<<<< Updated upstream
                  className={`${btnPrimary} text-white px-4 py-2 rounded-md`}
=======
                  className={`${btnPrimary} px-5 py-2.5 rounded-md font-medium shadow-sm hover:shadow`}
>>>>>>> Stashed changes
=======
                  className={`${btnPrimary} px-4 py-2 rounded-md`}
>>>>>>> 736c5ef91c6a62fd8e955cec333c2a2961025f72
                  onClick={handleNextStep}
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
<<<<<<< HEAD
<<<<<<< Updated upstream
                  className={`${btnPrimary} text-white px-4 py-2 rounded-md flex items-center`}
=======
                  className={`${btnPrimary} px-5 py-2.5 rounded-md font-medium shadow-sm hover:shadow flex items-center`}
>>>>>>> Stashed changes
=======
                  className={`${btnPrimary} px-4 py-2 rounded-md flex items-center`}
>>>>>>> 736c5ef91c6a62fd8e955cec333c2a2961025f72
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