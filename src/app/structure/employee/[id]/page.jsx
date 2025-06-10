// src/app/structure/employee/[id]/page.jsx
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
  Clock
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { useEmployees } from "@/hooks/useEmployees";
import EmployeeStatusBadge from "@/components/headcount/EmployeeStatusBadge";
import EmployeeTag from "@/components/headcount/EmployeeTag";

/**
 * Employee Detail Page with Two Column Layout
 */
export default function EmployeeDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { darkMode } = useTheme();
  const { fetchEmployee, currentEmployee, loadingEmployee, employeeError, clearCurrentEmployee } = useEmployees();
  
  const [activeTab, setActiveTab] = useState('overview');

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

  // Fetch employee data
  useEffect(() => {
    if (id) {
      fetchEmployee(id);
    }
    
    return () => {
      clearCurrentEmployee();
    };
  }, [id]);

  // Handler functions
  const handleEditEmployee = () => {
    router.push(`/structure/employee/${id}/edit`);
  };

  const handleDeleteEmployee = () => {
    if (confirm("Are you sure you want to delete this employee? This action cannot be undone.")) {
      alert("Employee deleted successfully!");
      router.push("/structure/headcount-table");
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

  // Get department color for the avatar
  const getDepartmentColor = (department) => {
    if (!department) return "bg-almet-sapphire";
    const dept = department.toUpperCase();
    if (dept.includes("BUSINESS DEVELOPMENT")) return "bg-blue-500";
    if (dept.includes("FINANCE")) return "bg-green-500";
    if (dept.includes("COMPLIANCE")) return "bg-red-500";
    if (dept.includes("HR")) return "bg-purple-500";
    if (dept.includes("ADMINISTRATIVE")) return "bg-yellow-500";
    if (dept.includes("OPERATIONS")) return "bg-orange-500";
    if (dept.includes("PROJECTS MANAGEMENT")) return "bg-teal-500";
    if (dept.includes("TRADE")) return "bg-indigo-500";
    if (dept.includes("STOCK SALES")) return "bg-pink-500";
    return "bg-almet-sapphire";
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

  // Loading state
  if (loadingEmployee) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="w-16 h-16 border-4 border-almet-sapphire border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className={`${textPrimary} text-base font-medium`}>Loading employee details...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state
  if (employeeError || !currentEmployee) {
    return (
      <DashboardLayout>
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
                  {employeeError || "Employee not found"}
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
      </DashboardLayout>
    );
  }

  const InfoItem = ({ icon, label, value, isLink, linkPath }) => (
    <div className="flex items-start py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
      <div className="flex-shrink-0 w-7 h-7 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 rounded-lg flex items-center justify-center mr-2 mt-0.5">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-[10px] font-medium ${textMuted} uppercase tracking-wider`}>{label}</p>
        {isLink && linkPath ? (
          <Link href={linkPath} className={`${textPrimary} hover:text-almet-sapphire dark:hover:text-almet-steel-blue transition-colors font-medium break-all text-xs`}>
            {value || "N/A"}
          </Link>
        ) : (
          <p className={`${textPrimary} font-medium break-all text-xs`}>{value || "N/A"}</p>
        )}
      </div>
    </div>
  );

  return (
    <DashboardLayout>
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
                      alt={currentEmployee.name}
                      className="w-20 h-20 rounded-full object-cover mx-auto border-4 border-white/30"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-xl font-bold mx-auto border-4 border-white/30">
                      {getInitials(currentEmployee.name)}
                    </div>
                  )}
                </div>
                
                {/* Name and Title */}
                <h1 className="text-lg font-bold text-white mb-1">{currentEmployee.name}</h1>
                <p className="text-white/80 text-xs mb-3 line-clamp-2">{currentEmployee.job_title}</p>
                
                {/* Status and Tags */}
                <div className="flex justify-center items-center flex-wrap gap-2 mb-4">
                  <EmployeeStatusBadge 
                    status={currentEmployee.status?.name || currentEmployee.status_name} 
                    color={currentEmployee.status?.color || currentEmployee.status_color}
                  />
                  {currentEmployee.tags && currentEmployee.tags.map((tag, idx) => (
                    <EmployeeTag key={idx} tag={tag} />
                  ))}
                </div>

                {/* Quick Info Badges */}
                <div className="flex flex-wrap justify-center gap-2 text-[10px]">
                  {currentEmployee.employee_id && (
                    <div className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full">
                      ID: {currentEmployee.employee_id}
                    </div>
                  )}
                  {currentEmployee.grade && (
                    <div className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full">
                      Grade: {currentEmployee.grade}
                    </div>
                  )}
                  {currentEmployee.start_date && (
                    <div className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full">
                      Joined: {formatDate(currentEmployee.start_date)}
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
                    className="bg-red-500/80 hover:bg-red-600/80 text-white px-3 py-2 rounded-md flex items-center justify-center text-xs transition-colors"
                  >
                    <UserX size={12} className="mr-1" />
                    Delete
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
                    value={currentEmployee.user?.email || currentEmployee.email}
                    isLink={true}
                    linkPath={`mailto:${currentEmployee.user?.email || currentEmployee.email}`}
                  />
                  <InfoItem 
                    icon={<Phone size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />}
                    label="Phone"
                    value={currentEmployee.phone}
                    isLink={true}
                    linkPath={`tel:${currentEmployee.phone}`}
                  />
                  <InfoItem 
                    icon={<Calendar size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />}
                    label="Birth Date"
                    value={formatDate(currentEmployee.date_of_birth)}
                  />
                  <InfoItem 
                    icon={<MapPin size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />}
                    label="Address"
                    value={currentEmployee.address}
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
                 { id: 'documents', label: 'Documents', icon: <FileText size={14} /> },
                 { id: 'activity', label: 'Activity', icon: <Activity size={14} /> }
               ].map((tab) => (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id)}
                   className={`flex-1 px-4 py-3 text-xs font-medium flex items-center justify-center transition-colors ${
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
                         <p className={`${textPrimary} font-semibold text-xs`}>{currentEmployee.name || "N/A"}</p>
                       </div>
                       <div className={`${bgAccent} rounded-lg p-4`}>
                         <div className="flex items-center mb-2">
                           <Calendar size={14} className="text-almet-sapphire dark:text-almet-steel-blue mr-2" />
                           <span className={`${textMuted} text-xs font-medium`}>Date of Birth</span>
                         </div>
                         <p className={`${textPrimary} font-semibold text-xs`}>{formatDate(currentEmployee.date_of_birth) || "N/A"}</p>
                       </div>
                       <div className={`${bgAccent} rounded-lg p-4`}>
                         <div className="flex items-center mb-2">
                           <MapPin size={14} className="text-almet-sapphire dark:text-almet-steel-blue mr-2" />
                           <span className={`${textMuted} text-xs font-medium`}>Gender</span>
                         </div>
                         <p className={`${textPrimary} font-semibold text-xs`}>{currentEmployee.gender || "N/A"}</p>
                       </div>
                       <div className={`${bgAccent} rounded-lg p-4`}>
                         <div className="flex items-center mb-2">
                           <Mail size={14} className="text-almet-sapphire dark:text-almet-steel-blue mr-2" />
                           <span className={`${textMuted} text-xs font-medium`}>Email Address</span>
                         </div>
                         <p className={`${textPrimary} font-semibold text-xs`}>{currentEmployee.user?.email || currentEmployee.email || "N/A"}</p>
                       </div>
                       <div className={`${bgAccent} rounded-lg p-4`}>
                         <div className="flex items-center mb-2">
                           <Phone size={14} className="text-almet-sapphire dark:text-almet-steel-blue mr-2" />
                           <span className={`${textMuted} text-xs font-medium`}>Phone Number</span>
                         </div>
                         <p className={`${textPrimary} font-semibold text-xs`}>{currentEmployee.phone || "N/A"}</p>
                       </div>
                       <div className={`${bgAccent} rounded-lg p-4`}>
                         <div className="flex items-center mb-2">
                           <MapPin size={14} className="text-almet-sapphire dark:text-almet-steel-blue mr-2" />
                           <span className={`${textMuted} text-xs font-medium`}>Primary Address</span>
                         </div>
                         <p className={`${textPrimary} font-semibold text-xs`}>{currentEmployee.address || "N/A"}</p>
                       </div>
                       <div className={`${bgAccent} rounded-lg p-4`}>
                         <div className="flex items-center mb-2">
                           <AlertTriangle size={14} className="text-almet-sapphire dark:text-almet-steel-blue mr-2" />
                           <span className={`${textMuted} text-xs font-medium`}>Emergency Contact</span>
                         </div>
                         <p className={`${textPrimary} font-semibold text-xs`}>{currentEmployee.emergency_contact || "N/A"}</p>
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
                           icon={<Briefcase size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />}
                           label="HC Number"
                           value={currentEmployee.employee_id || "N/A"}
                         />
                         <InfoItem 
                           icon={<User size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />}
                           label="Name"
                           value={currentEmployee.name || "N/A"}
                         />
                       </div>
                     </div>

                     {/* Role and Structure Section */}
                     <div className={`${bgAccent} rounded-lg p-4 border ${borderColor}`}>
                       <h4 className={`${textPrimary} font-medium mb-3 text-xs uppercase`}>Role & Structure</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <InfoItem 
                           icon={<Building size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />}
                           label="Business Function"
                           value={currentEmployee.business_function?.name || currentEmployee.business_function_name || "N/A"}
                         />
                         <InfoItem 
                           icon={<LayoutGrid size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />}
                           label="Department"
                           value={currentEmployee.department?.name || currentEmployee.department_name || "N/A"}
                         />
                         <InfoItem 
                           icon={<LayoutGrid size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />}
                           label="Unit"
                           value={currentEmployee.unit?.name || currentEmployee.unit_name || "N/A"}
                         />
                         <InfoItem 
                           icon={<Target size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />}
                           label="Job Function"
                           value={currentEmployee.job_function?.name || currentEmployee.job_function_name || "N/A"}
                         />
                         <InfoItem 
                           icon={<Award size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />}
                           label="Job Title"
                           value={currentEmployee.job_title || "N/A"}
                         />
                         <InfoItem 
                           icon={<Award size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />}
                           label="Position Group"
                           value={currentEmployee.position_group?.name || currentEmployee.position_group_name || "N/A"}
                         />
                         <InfoItem 
                           icon={<Award size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />}
                           label="Grade"
                           value={currentEmployee.grade || "N/A"}
                         />
                       </div>
                     </div>

                     {/* Management Section */}
                     <div className={`${bgAccent} rounded-lg p-4 border ${borderColor}`}>
                       <h4 className={`${textPrimary} font-medium mb-3 text-xs uppercase`}>Management</h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <InfoItem 
                           icon={<Users size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />}
                           label="LM HC Number"
                           value={currentEmployee.line_manager?.employee_id || currentEmployee.line_manager_hc_number || "N/A"}
                         />
                         <InfoItem 
                           icon={<Users size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />}
                           label="Line Manager"
                           value={currentEmployee.line_manager?.name || currentEmployee.line_manager_name || "N/A"}
                           isLink={true}
                           linkPath={currentEmployee.line_manager?.id ? `/structure/employee/${currentEmployee.line_manager.id}` : "#"}
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
                           value={formatDate(currentEmployee.start_date) || "N/A"}
                         />
                         <InfoItem 
                           icon={<Calendar size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />}
                           label="End Date"
                           value={formatDate(currentEmployee.end_date) || "N/A"}
                         />
                         <InfoItem 
                           icon={<Calendar size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />}
                           label="Contract Duration"
                           value={currentEmployee.contract_duration_display || currentEmployee.contract_duration || "N/A"}
                         />
                         <InfoItem 
                           icon={<Calendar size={12} className="text-almet-sapphire dark:text-almet-steel-blue" />}
                           label="Contract Start"
                           value={formatDate(currentEmployee.contract_start_date) || "N/A"}
                         />
                       </div>
                     </div>
                   </div>
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
                   {currentEmployee.recent_activities && currentEmployee.recent_activities.length > 0 ? (
                     <div className="space-y-4">
                       {currentEmployee.recent_activities.map((activity) => (
                         <div key={activity.id} className={`flex items-start p-4 rounded-lg ${bgAccent} border ${borderColor}`}>
                           <div className="h-6 w-6 bg-almet-sapphire rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                             <div className="h-2 w-2 bg-white rounded-full"></div>
                           </div>
                           <div className="flex-1">
                             <h4 className={`${textPrimary} font-medium text-xs`}>{activity.activity_type}</h4>
                             <p className={`${textSecondary} text-[10px] mt-1`}>{activity.description}</p>
                             <p className={`${textMuted} text-[9px] mt-1`}>{formatDateTime(activity.timestamp)}</p>
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
     </div>
   </DashboardLayout>
 );
}