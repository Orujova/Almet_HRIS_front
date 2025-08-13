// src/app/structure/employee/[id]/page.jsx - Fixed Version
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Provider } from "react-redux";
import { store } from "../../../../store";
import Link from "next/link";
import { 
  ChevronLeft, 
  Edit, 
  Download, 
  MessageSquare, 
  UserX, 
  AlertCircle,
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building,
  Briefcase,
  Users,
  Award,
  Target,
  LayoutGrid,
  AlertTriangle,
  FileText,
  Activity,
  Clock,
  Eye,
  EyeOff,
  Loader,
  ClipboardList
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { useEmployees } from "@/hooks/useEmployees";
import EmployeeStatusBadge from "@/components/headcount/EmployeeStatusBadge";
import EmployeeTag from "@/components/headcount/EmployeeTag";
import EmployeeDetailJobDescriptions from "@/components/headcount/EmployeeDetailJobDescriptions";

/**
 * Employee Detail Page Content Component with Job Descriptions Integration
 */
const EmployeeDetailPageContent = () => {
  const { id } = useParams();
  const router = useRouter();
  const { darkMode } = useTheme();
  const { 
    fetchEmployee, 
    currentEmployee, 
    loading, 
    error, 
    clearCurrentEmployee,
    deleteEmployee 
  } = useEmployees();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [deleting, setDeleting] = useState(false);

  // Theme-dependent classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white transition-colors";
  const btnSecondary = darkMode
    ? "bg-gray-700 hover:bg-gray-600 text-gray-200"
    : "bg-gray-100 hover:bg-gray-200 text-gray-700";
  const shadowClass = darkMode ? "" : "shadow-sm";
  const bgAccent = darkMode ? "bg-gray-700" : "bg-gray-50";

  // Current date and time
  const currentDateTime = new Date().toLocaleString('en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Baku'
  });

  // Check if user is a manager (has direct reports)
  const isManager = currentEmployee?.direct_reports && currentEmployee.direct_reports.length > 0;

  // Fetch employee data
  useEffect(() => {
    if (id) {
      fetchEmployee(id);
    }
    
    return () => {
      clearCurrentEmployee();
    };
  }, [id, fetchEmployee, clearCurrentEmployee]);

  // Enhanced field getters with proper nested data extraction
  const getFieldValue = (field, fallback = 'N/A') => {
    if (!currentEmployee) {
      console.log(`getFieldValue: currentEmployee is null/undefined for field "${field}"`);
      return fallback;
    }
    
    // Direct field mappings based on your data structure
    const fieldMappings = {
      // Basic employee info
      'name': currentEmployee.name || currentEmployee.full_name,
      'employee_id': currentEmployee.employee_id,
      'job_title': currentEmployee.job_title,
      'email': currentEmployee.email,
      'phone': currentEmployee.phone,
      'address': currentEmployee.address,
      'date_of_birth': currentEmployee.date_of_birth,
      'gender': currentEmployee.gender,
      'emergency_contact': currentEmployee.emergency_contact,
      'start_date': currentEmployee.start_date,
      'end_date': currentEmployee.end_date,
      'notes': currentEmployee.notes,
      'grading_level': currentEmployee.grading_level,
      'contract_duration': currentEmployee.contract_duration,
      'contract_start_date': currentEmployee.contract_start_date,
      'contract_end_date': currentEmployee.contract_end_date,
      'is_visible_in_org_chart': currentEmployee.is_visible_in_org_chart,
      
      // Business function data
      'business_function_name': currentEmployee.business_function_detail?.name,
      'business_function_code': currentEmployee.business_function_detail?.code,
      'business_function_description': currentEmployee.business_function_detail?.description,
      
      // Department data
      'department_name': currentEmployee.department_detail?.name,
      'department_business_function': currentEmployee.department_detail?.business_function_name,
      
      // Unit data
      'unit_name': currentEmployee.unit_detail?.name,
      'unit_department': currentEmployee.unit_detail?.department_name,
      
      // Job function data
      'job_function_name': currentEmployee.job_function_detail?.name,
      'job_function_description': currentEmployee.job_function_detail?.description,
      
      // Position group data
      'position_group_name': currentEmployee.position_group_detail?.name,
      'position_group_display_name': currentEmployee.position_group_detail?.display_name,
      'hierarchy_level': currentEmployee.position_group_detail?.hierarchy_level,
      'grading_shorthand': currentEmployee.position_group_detail?.grading_shorthand,
      
      // Status data
      'status_name': currentEmployee.status_detail?.name,
      'status_type': currentEmployee.status_detail?.status_type,
      'status_color': currentEmployee.status_detail?.color,
      
      // Line manager data
      'line_manager_name': currentEmployee.line_manager_detail?.name || currentEmployee.line_manager_detail?.full_name,
      'line_manager_id': currentEmployee.line_manager_detail?.id,
      'line_manager_employee_id': currentEmployee.line_manager_detail?.employee_id,
      'line_manager_hc_number': currentEmployee.line_manager_detail?.employee_id,
      
      // Contract duration display
      'contract_duration_display': currentEmployee.contract_duration_display || 
        (currentEmployee.contract_duration === 'PERMANENT' ? 'Permanent' : currentEmployee.contract_duration),
    };
    
    const value = fieldMappings[field];
    
    if (value === undefined || value === null || value === '') {
      console.log(`getFieldValue: field "${field}" is null/undefined/empty`);
      return fallback;
    }
    
    console.log(`getFieldValue: field "${field}" = "${value}"`);
    return value;
  };

  // Handler functions
  const handleEditEmployee = () => {
    router.push(`/structure/employee/${id}/edit`);
  };

  const handleDeleteEmployee = async () => {
    if (!confirm("Are you sure you want to delete this employee? This action cannot be undone.")) {
      return;
    }

    setDeleting(true);
    try {
      const result = await deleteEmployee(id);
      if (result.type.endsWith('/fulfilled')) {
        router.push("/structure/headcount-table");
      } else {
        alert("Failed to delete employee. Please try again.");
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert("Failed to delete employee. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  const handleExportData = () => {
    alert(`Exporting data for ${currentEmployee?.name}`);
  };

  const handleMessageEmployee = () => {
    alert(`Messaging ${currentEmployee?.name}`);
  };

  const handleDownloadDocument = (document) => {
    alert(`Downloading ${document.name}`);
  };
  
  // Generate initials from name for the avatar
  const getInitials = (name) => {
    if (!name) return "NA";
    const names = name.split(" ");
    if (names.length === 1) return names[0].charAt(0);
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-GB", { 
        day: "2-digit", 
        month: "short", 
        year: "numeric" 
      });
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Format date with time for activities
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "UTC",
        timeZoneName: "short"
      }).replace(",", "");
    } catch (error) {
      return "Invalid Date";
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Enhanced display name function
  const getDisplayName = () => {
    if (currentEmployee.name) return currentEmployee.name;
    if (currentEmployee.full_name) return currentEmployee.full_name;
    const firstName = currentEmployee.first_name || '';
    const lastName = currentEmployee.last_name || '';
    const combined = `${firstName} ${lastName}`.trim();
    return combined || 'Unknown Employee';
  };

  // Enhanced email function
  const getEmail = () => {
    return currentEmployee.email || currentEmployee.user?.email || 'No email';
  };

  // Loading state
  if (loading.employee) {
    return (
      <div className="container mx-auto px-4 py-10">
        <div className="flex flex-col items-center justify-center h-64">
          <Loader className="w-16 h-16 text-almet-sapphire animate-spin mb-4" />
          <p className={`${textPrimary} text-base font-medium`}>Loading employee details...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error.employee || !currentEmployee) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className={`${bgCard} rounded-lg border border-red-300 dark:border-red-700 p-6 shadow-md`}>
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-4">
              <h3 className="text-base font-medium text-red-800 dark:text-red-300">
                Error Loading Employee
              </h3>
              <p className="mt-2 text-sm text-red-700 dark:text-red-400">
                {error.employee || "Employee not found"}
              </p>
              <div className="mt-4">
                <Link
                  href="/structure/headcount-table"
                  className="inline-flex items-center px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-800 transition-colors text-sm"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Return to Headcount Table
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const InfoItem = ({ icon, label, value, isLink, linkPath }) => (
    <div className="flex items-start py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <div className="flex-shrink-0 w-7 h-7 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 rounded-lg flex items-center justify-center mr-2 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[10px] font-medium ${textMuted} uppercase tracking-wider`}>{label}</p>
        {isLink && linkPath && value !== 'N/A' ? (
          <Link href={linkPath} className={`${textPrimary} hover:text-almet-sapphire dark:hover:text-almet-steel-blue transition-colors font-medium break-all text-xs`}>
            {value}
          </Link>
        ) : (
          <p className={`${textPrimary} font-medium break-all text-xs`}>{value}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Back button */}
      <div className="mb-6 flex justify-between items-center">
        <Link
          href="/structure/headcount-table"
          className={`inline-flex items-center ${textPrimary} hover:text-almet-sapphire dark:hover:text-almet-steel-blue transition-colors text-sm`}
        >
          <ChevronLeft size={16} className="mr-1" />
          <span>Back to Headcount Table</span>
        </Link>
        <div className={`flex items-center ${textMuted} text-[10px]`}>
          <Clock size={12} className="mr-1" />
          <span>{currentDateTime}</span>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Employee Profile */}
        <div className="lg:col-span-1">
          <div className={`${bgCard} rounded-xl ${shadowClass} overflow-hidden border ${borderColor} sticky top-6`}>
            {/* Profile Header */}
            <div className="bg-gradient-to-br from-almet-sapphire to-almet-astral p-6 text-center">
              {/* Profile Image/Avatar */}
              <div className="mb-4">
                {currentEmployee.profile_image ? (
                  <img
                    src={currentEmployee.profile_image}
                    alt={getDisplayName()}
                    className="w-20 h-20 rounded-full object-cover mx-auto border-4 border-white/30"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl font-bold mx-auto border-4 border-white/30">
                    {getInitials(getDisplayName())}
                  </div>
                )}
              </div>
              
              {/* Name and Title */}
              <h1 className="text-lg font-bold text-white mb-1">{getDisplayName()}</h1>
              <p className="text-white/80 text-xs mb-3 line-clamp-2">{getFieldValue('job_title')}</p>
              
              {/* Status and Tags */}
              <div className="flex justify-center items-center flex-wrap gap-2 mb-4">
                <EmployeeStatusBadge 
                  status={getFieldValue('status_name')} 
                  color={getFieldValue('status_color')}
                />
                {currentEmployee.tag_details && currentEmployee.tag_details.map((tag, idx) => (
                  <EmployeeTag key={idx} tag={tag} />
                ))}
              </div>

              {/* Quick Info Badges */}
              <div className="flex flex-wrap justify-center gap-2 text-[10px]">
                {getFieldValue('employee_id') !== 'N/A' && (
                  <div className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full">
                    ID: {getFieldValue('employee_id')}
                  </div>
                )}
                {(getFieldValue('grading_display') || getFieldValue('grading_level')) !== 'N/A' && (
                  <div className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full">
                    Grade: {getFieldValue('grading_display') || getFieldValue('grading_level')}
                  </div>
                )}
                {getFieldValue('start_date') !== 'N/A' && (
                  <div className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full">
                    Joined: {formatDate(getFieldValue('start_date'))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleEditEmployee}
                  className={`${btnPrimary} px-3 py-2 rounded-md flex items-center justify-center text-xs`}
                >
                  <Edit size={12} className="mr-1" />
                  Edit
                </button>
                <button
                  onClick={handleDeleteEmployee}
                  disabled={deleting}
                  className="bg-red-500/80 hover:bg-red-600/80 text-white px-3 py-2 rounded-md flex items-center justify-center text-xs transition-colors disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <Loader size={12} className="mr-1 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <UserX size={12} className="mr-1" />
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Contact Information */}
            <div className="p-4">
              <h3 className={`${textPrimary} font-semibold mb-3 text-xs`}>Contact Information</h3>
              <div className="space-y-0">
                <InfoItem 
                  icon={<Mail size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />}
                  label="Email"
                  value={getEmail()}
                  isLink={true}
                  linkPath={`mailto:${getEmail()}`}
                />
                <InfoItem 
                  icon={<Phone size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />}
                  label="Phone"
                  value={getFieldValue('phone')}
                  isLink={getFieldValue('phone') !== 'N/A'}
                  linkPath={`tel:${getFieldValue('phone')}`}
                />
                <InfoItem 
                  icon={<Calendar size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />}
                  label="Birth Date"
                  value={formatDate(getFieldValue('date_of_birth'))}
                />
                <InfoItem 
                  icon={<MapPin size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />}
                  label="Address"
                  value={getFieldValue('address')}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Tabbed Content */}
        <div className="lg:col-span-2">
          {/* Tab Navigation */}
          <div className={`${bgCard} rounded-xl ${shadowClass} border ${borderColor} mb-6 overflow-hidden`}>
           <div className="flex border-b border-gray-100 dark:border-gray-700">
             {[
               { id: 'overview', label: 'Overview', icon: <User size={14} /> },
               { id: 'job', label: 'Job Details', icon: <Briefcase size={14} /> },
               { id: 'job-descriptions', label: 'Job Descriptions', icon: <ClipboardList size={14} /> },
               { id: 'documents', label: 'Documents', icon: <FileText size={14} /> },
               { id: 'activity', label: 'Activity', icon: <Activity size={14} /> }
             ].map((tab) => (
               <button
                 key={tab.id}
                 onClick={() => setActiveTab(tab.id)}
                 className={`flex-1 px-3 py-3 text-xs font-medium flex items-center justify-center transition-colors ${
                   activeTab === tab.id
                     ? 'text-almet-sapphire dark:text-almet-steel-blue border-b-2 border-almet-sapphire dark:border-almet-steel-blue bg-almet-sapphire/5 dark:bg-almet-sapphire/10'
                     : `${textMuted} hover:text-almet-sapphire dark:hover:text-almet-steel-blue hover:bg-gray-50 dark:hover:bg-gray-700/50`
                 }`}
               >
                 {tab.icon}
                 <span className="ml-2 hidden sm:inline">{tab.label}</span>
               </button>
             ))}
           </div>

           {/* Tab Content */}
           <div className="p-6">
             {activeTab === 'overview' && (
               <div className="space-y-6">
                 <div>
                   <h3 className={`${textPrimary} text-base font-semibold mb-4`}>Quick Overview</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className={`${bgAccent} rounded-lg p-4`}>
                       <div className="flex items-center mb-2">
                         <User size={14} className="text-almet-sapphire dark:text-almet-steel-blue mr-2" />
                         <span className={`${textMuted} text-xs font-medium`}>Full Name</span>
                       </div>
                       <p className={`${textPrimary} font-semibold text-xs`}>{getDisplayName()}</p>
                     </div>
                     <div className={`${bgAccent} rounded-lg p-4`}>
                       <div className="flex items-center mb-2">
                         <Calendar size={14} className="text-almet-sapphire dark:text-almet-steel-blue mr-2" />
                         <span className={`${textMuted} text-xs font-medium`}>Date of Birth</span>
                       </div>
                       <p className={`${textPrimary} font-semibold text-xs`}>{formatDate(getFieldValue('date_of_birth'))}</p>
                     </div>
                     <div className={`${bgAccent} rounded-lg p-4`}>
                       <div className="flex items-center mb-2">
                         <User size={14} className="text-almet-sapphire dark:text-almet-steel-blue mr-2" />
                         <span className={`${textMuted} text-xs font-medium`}>Gender</span>
                       </div>
                       <p className={`${textPrimary} font-semibold text-xs`}>{getFieldValue('gender')}</p>
                     </div>
                     <div className={`${bgAccent} rounded-lg p-4`}>
                       <div className="flex items-center mb-2">
                         <Mail size={14} className="text-almet-sapphire dark:text-almet-steel-blue mr-2" />
                         <span className={`${textMuted} text-xs font-medium`}>Email Address</span>
                       </div>
                       <p className={`${textPrimary} font-semibold text-xs`}>{getEmail()}</p>
                     </div>
                     <div className={`${bgAccent} rounded-lg p-4`}>
                       <div className="flex items-center mb-2">
                         <Phone size={14} className="text-almet-sapphire dark:text-almet-steel-blue mr-2" />
                         <span className={`${textMuted} text-xs font-medium`}>Phone Number</span>
                       </div>
                       <p className={`${textPrimary} font-semibold text-xs`}>{getFieldValue('phone')}</p>
                     </div>
                     <div className={`${bgAccent} rounded-lg p-4`}>
                       <div className="flex items-center mb-2">
                         <MapPin size={14} className="text-almet-sapphire dark:text-almet-steel-blue mr-2" />
                         <span className={`${textMuted} text-xs font-medium`}>Primary Address</span>
                       </div>
                       <p className={`${textPrimary} font-semibold text-xs`}>{getFieldValue('address')}</p>
                     </div>
                     <div className={`${bgAccent} rounded-lg p-4`}>
                       <div className="flex items-center mb-2">
                         <AlertTriangle size={14} className="text-almet-sapphire dark:text-almet-steel-blue mr-2" />
                         <span className={`${textMuted} text-xs font-medium`}>Emergency Contact</span>
                       </div>
                       <p className={`${textPrimary} font-semibold text-xs`}>{getFieldValue('emergency_contact')}</p>
                     </div>
                   </div>
                 </div>
               </div>
             )}

             {activeTab === 'job' && (
               <div className="space-y-6">
                 <h3 className={`${textPrimary} text-base font-semibold mb-4`}>Job Information</h3>
                 <div className="space-y-6">
                   {/* Identification Section */}
                   <div className={`${bgAccent} rounded-lg p-4 border ${borderColor}`}>
                     <h4 className={`${textPrimary} font-medium mb-3 text-xs uppercase`}>Identification</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <InfoItem 
                         icon={<Users size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />}
                         label="LM HC Number"
                         value={getFieldValue('line_manager_hc_number')}
                       />
                       <InfoItem 
                         icon={<Users size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />}
                         label="Line Manager"
                         value={getFieldValue('line_manager_name')}
                         isLink={getFieldValue('line_manager_id') !== 'N/A'}
                         linkPath={getFieldValue('line_manager_id') !== 'N/A' ? 
                           `/structure/employee/${getFieldValue('line_manager_id')}` : "#"}
                       />
                     </div>
                   </div>

                   {/* Employment Dates Section */}
                   <div className={`${bgAccent} rounded-lg p-4 border ${borderColor}`}>
                     <h4 className={`${textPrimary} font-medium mb-3 text-xs uppercase`}>Employment Dates</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <InfoItem 
                         icon={<Calendar size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />}
                         label="Start Date"
                         value={formatDate(getFieldValue('start_date'))}
                       />
                       <InfoItem 
                         icon={<Calendar size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />}
                         label="End Date"
                         value={formatDate(getFieldValue('end_date'))}
                       />
                       <InfoItem 
                         icon={<Calendar size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />}
                         label="Contract Duration"
                         value={getFieldValue('contract_duration_display')}
                       />
                       <InfoItem 
                         icon={<Calendar size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />}
                         label="Contract Start"
                         value={formatDate(getFieldValue('contract_start_date'))}
                       />
                     </div>
                   </div>

                   {/* Status Information */}
                   <div className={`${bgAccent} rounded-lg p-4 border ${borderColor}`}>
                     <h4 className={`${textPrimary} font-medium mb-3 text-xs uppercase`}>Status Information</h4>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       <InfoItem 
                         icon={<AlertCircle size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />}
                         label="Status"
                         value={getFieldValue('status_name')}
                       />
                       <InfoItem 
                         icon={<AlertCircle size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />}
                         label="Status Type"
                         value={getFieldValue('status_type')}
                       />
                     </div>
                   </div>

                   {/* Visibility Settings */}
                   <div className={`${bgAccent} rounded-lg p-4 border ${borderColor}`}>
                     <h4 className={`${textPrimary} font-medium mb-3 text-xs uppercase`}>Visibility Settings</h4>
                     <div className="flex items-center space-x-3">
                       {getFieldValue('is_visible_in_org_chart', false) ? (
                         <Eye className="text-green-500" size={16} />
                       ) : (
                         <EyeOff className="text-gray-400" size={16} />
                       )}
                       <span className={`text-sm ${textSecondary}`}>
                         {getFieldValue('is_visible_in_org_chart', false)
                           ? 'Visible in organization chart' 
                           : 'Hidden from organization chart'
                         }
                       </span>
                     </div>
                   </div>
                 </div>
               </div>
             )}

             {activeTab === 'job-descriptions' && (
               <div className="space-y-4">
                 <EmployeeDetailJobDescriptions 
                   employeeId={id} 
                   isManager={isManager}
                 />
               </div>
             )}

             {activeTab === 'documents' && (
               <div className="space-y-4">
                 <div className="flex justify-between items-center">
                   <h3 className={`${textPrimary} text-base font-semibold`}>Documents</h3>
                   <button className={`${btnPrimary} px-4 py-2 rounded-md text-xs`}>
                     Upload Document
                   </button>
                 </div>
                 {currentEmployee.documents && currentEmployee.documents.length > 0 ? (
                   <div className="space-y-3">
                     {currentEmployee.documents.map((doc) => (
                       <div 
                         key={doc.id}
                         className={`flex items-center justify-between p-4 rounded-lg ${bgAccent} hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors cursor-pointer border ${borderColor}`}
                         onClick={() => handleDownloadDocument(doc)}
                       >
                         <div className="flex items-center">
                           <div className="h-8 w-8 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 rounded-lg flex items-center justify-center mr-3">
                             <FileText className="h-4 w-4 text-almet-sapphire dark:text-almet-steel-blue" />
                           </div>
                           <div>
                             <p className={`${textPrimary} font-medium text-xs`}>{doc.name}</p>
                             <p className={`${textMuted} text-[10px]`}>
                               {formatFileSize(doc.file_size)} • {formatDate(doc.uploaded_at)}
                             </p>
                           </div>
                         </div>
                         <Download size={14} className={`${textMuted}`} />
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className={`text-center py-8 ${textMuted}`}>
                     <FileText size={40} className="mx-auto mb-3 opacity-50" />
                     <p className="text-xs">No documents available</p>
                   </div>
                 )}
               </div>
             )}

             {activeTab === 'activity' && (
               <div className="space-y-4">
                 <h3 className={`${textPrimary} text-base font-semibold`}>Recent Activity</h3>
                 {currentEmployee.activities && currentEmployee.activities.length > 0 ? (
                   <div className="space-y-4">
                     {currentEmployee.activities.map((activity) => (
                       <div key={activity.id} className={`flex items-start p-4 rounded-lg ${bgAccent} border ${borderColor}`}>
                         <div className="h-6 w-6 bg-almet-sapphire rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                           <div className="h-2 w-2 bg-white rounded-full"></div>
                         </div>
                         <div className="flex-1">
                           <h4 className={`${textPrimary} font-medium text-xs`}>{activity.activity_type}</h4>
                           <p className={`${textSecondary} text-[10px] mt-1`}>{activity.description}</p>
                           <p className={`${textMuted} text-[9px] mt-1`}>
                             By {activity.performed_by_name} • {formatDateTime(activity.created_at)}
                           </p>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className={`text-center py-8 ${textMuted}`}>
                     <Activity size={40} className="mx-auto mb-3 opacity-50" />
                     <p className="text-xs">No recent activity</p>
                   </div>
                 )}
               </div>
             )}
           </div>
         </div>
       </div>
     </div>

     {/* Additional Notes Section */}
     {getFieldValue('notes') !== 'N/A' && (
       <div className={`${bgCard} rounded-xl ${shadowClass} border ${borderColor} p-6`}>
         <h3 className={`${textPrimary} text-base font-semibold mb-3 flex items-center`}>
           <FileText size={16} className="mr-2 text-almet-sapphire dark:text-almet-steel-blue" />
           Additional Notes
         </h3>
         <div className={`${bgAccent} rounded-lg p-4`}>
           <p className={`${textSecondary} text-sm leading-relaxed`}>
             {getFieldValue('notes')}
           </p>
         </div>
       </div>
     )}

     {/* Employee Tags Section */}
     {currentEmployee.tag_details && currentEmployee.tag_details.length > 0 && (
       <div className={`${bgCard} rounded-xl ${shadowClass} border ${borderColor} p-6`}>
         <h3 className={`${textPrimary} text-base font-semibold mb-3 flex items-center`}>
           <FileText size={16} className="mr-2 text-almet-sapphire dark:text-almet-steel-blue" />
           Employee Tags
         </h3>
         <div className="flex flex-wrap gap-2">
           {currentEmployee.tag_details.map((tag, idx) => (
             <span
               key={idx}
               className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium"
               style={{
                 backgroundColor: tag.color ? `${tag.color}20` : '#e5e7eb',
                 color: tag.color || '#374151',
                 border: `1px solid ${tag.color || '#d1d5db'}`
               }}
             >
               {tag.name || tag.label || 'Unknown Tag'}
             </span>
           ))}
         </div>
       </div>
     )}
   </div>
 );
};

export default function EmployeeDetailPage() {
  return (
    <DashboardLayout>
      <Provider store={store}>
        <EmployeeDetailPageContent />
      </Provider>
    </DashboardLayout>
  );
}