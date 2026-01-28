// src/app/structure/employee/[id]/page.jsx - UPDATED with Resignation & Probation
"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Provider } from "react-redux";
import { store } from "../../../../store";
import Link from "next/link";
import { 
  ChevronLeft, 
  Edit, 
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
  ClipboardList,
  Settings,
  TrendingUp,
  ExternalLink,
  Package,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
  LogOut,
  UserX,
  CheckCircle,
  AlertCircle,
  Send,
  MessageSquare
} from "lucide-react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { useEmployees } from "@/hooks/useEmployees";
import EmployeeStatusBadge from "@/components/headcount/EmployeeStatusBadge";
import EmployeeTag from "@/components/headcount/EmployeeTag";
import EmployeeDetailJobDescriptions from "@/components/headcount/EmployeeDetailJobDescriptions";
import EmployeeAssetManagement from "@/components/headcount/EmployeeAssetManagement";
import EmployeeDetailPerformance from "@/components/headcount/EmployeeDetailPerformance";
import EmployeeProfilePhotoManager from "@/components/headcount/EmployeeProfilePhotoManager";
import EmployeeDocumentManager from "@/components/headcount/EmployeeDocumentManager";
import ResignationSubmissionModal from "@/components/resignation/ResignationSubmissionModal";
import ProbationReviewModal from "@/components/resignation/ProbationReviewModal";
import resignationExitService from '@/services/resignationExitService';
import { apiService } from '@/services/api';

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
  } = useEmployees();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentProfilePhoto, setCurrentProfilePhoto] = useState(null);
  const [sectionsExpanded, setSectionsExpanded] = useState({
    contact: true,
    organization: true,
    employment: true,
    status: true
  });

  // 🆕 Resignation & Probation States
  const [showResignationModal, setShowResignationModal] = useState(false);
  const [showProbationModal, setShowProbationModal] = useState(false);
  const [probationInfo, setProbationInfo] = useState(null);
  const [pendingProbationReviews, setPendingProbationReviews] = useState([]);
  const [loadingProbation, setLoadingProbation] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [contractConfigs, setContractConfigs] = useState({});

  // Theme classes
  const bgPrimary = darkMode ? "bg-almet-cloud-burst" : "bg-almet-mystic";
  const bgCard = darkMode ? "bg-almet-san-juan" : "bg-white";
  const bgCardHover = darkMode ? "bg-almet-comet" : "bg-gray-50";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-almet-waterloo";
  const textMuted = darkMode ? "text-almet-santas-gray" : "text-almet-bali-hai";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";
  const btnPrimary = "bg-almet-sapphire hover:bg-almet-astral text-white transition-all duration-200";
  const btnSecondary = darkMode
    ? "bg-almet-comet hover:bg-almet-san-juan text-almet-bali-hai border border-almet-comet"
    : "bg-white hover:bg-almet-mystic text-almet-waterloo border border-gray-300";
  const shadowClass = darkMode ? "shadow-lg shadow-black/10" : "shadow-md shadow-gray-200/50";
  const bgAccent = darkMode ? "bg-almet-comet/30" : "bg-almet-mystic/50";
  const bgGradient = "bg-gradient-to-br from-almet-sapphire to-almet-steel-blue";

  const isManager = currentEmployee?.direct_reports && currentEmployee.direct_reports.length > 0;

  // 🆕 Load initial data
  useEffect(() => {
    if (id) {
      fetchEmployee(id);
      loadUserInfo();
      loadContractConfigs();
    }
    
    return () => {
      clearCurrentEmployee();
    };
  }, [id]);

  // 🆕 Load probation info when employee data changes
  useEffect(() => {
    if (currentEmployee) {
      setCurrentProfilePhoto(
        currentEmployee.profile_image || 
        currentEmployee.profile_image_url || 
        null
      );
      
      // Check if employee is in probation
      if (currentEmployee.status_name?.toUpperCase().includes('PROBATION')) {
        loadProbationData();
      }
    }
  }, [currentEmployee]);

  // 🆕 Load user info
  const loadUserInfo = async () => {
    try {
      const userInfo = await resignationExitService.getCurrentUser();
      const userProfile = await resignationExitService.getUser();
      
      const fullUserData = {
        ...userInfo,
        ...userProfile,
        id: userProfile.employee?.id || userInfo.id,
        employee_id: userProfile.employee?.employee_id || userInfo.username,
        full_name: userProfile.employee?.full_name || `${userInfo.first_name} ${userInfo.last_name}`,
      };
      
      setCurrentUser(fullUserData);
    } catch (error) {
      console.error('Error loading user info:', error);
    }
  };

  // 🆕 Load contract configs
  const loadContractConfigs = async () => {
    try {
      const contractResponse = await apiService.getContractConfigs();
      const contracts = contractResponse.data.results || contractResponse.data || [];
      
      const configMap = {};
      contracts.forEach(config => {
        configMap[config.contract_type] = {
          probation_days: config.probation_days || 0,
          total_days_until_active: config.total_days_until_active || 0,
          display_name: config.display_name || config.contract_type
        };
      });
      
      setContractConfigs(configMap);
    } catch (error) {
      console.error('Error loading contract configs:', error);
    }
  };

  // 🆕 Load probation data
  const loadProbationData = async () => {
    try {
      setLoadingProbation(true);
      
      // Calculate probation info
      if (currentEmployee.start_date && currentEmployee.contract_duration) {
        const contractConfig = contractConfigs[currentEmployee.contract_duration];
        const totalProbationDays = contractConfig?.probation_days || 90;
        
        const startDate = new Date(currentEmployee.start_date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const probationEndDate = new Date(startDate);
        probationEndDate.setDate(probationEndDate.getDate() + totalProbationDays);
        
        const daysCompleted = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
        const daysRemaining = Math.ceil((probationEndDate - today) / (1000 * 60 * 60 * 24));
        const progressPercent = Math.min(100, Math.round((daysCompleted / totalProbationDays) * 100));
        
        let urgencyLevel = 'normal';
        if (daysRemaining <= 7) urgencyLevel = 'critical';
        else if (daysRemaining <= 14) urgencyLevel = 'warning';
        else if (daysRemaining <= 30) urgencyLevel = 'attention';
        
        setProbationInfo({
          probationEndDate: probationEndDate.toISOString().split('T')[0],
          daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
          daysCompleted,
          totalProbationDays,
          progressPercent,
          urgencyLevel
        });
      }
      
      // Load pending probation reviews for this employee
      const response = await resignationExitService.probationReview.getProbationReviews({
        employee: id,
        status: 'PENDING'
      });
      
      setPendingProbationReviews(response.results || []);
      
    } catch (error) {
      console.error('Error loading probation data:', error);
    } finally {
      setLoadingProbation(false);
    }
  };

  // 🆕 Check if current user is viewing their own profile
  const isOwnProfile = currentUser?.id === currentEmployee?.id;

  // Enhanced field getters
  const getFieldValue = (field, fallback = 'N/A') => {
    if (!currentEmployee) return fallback;
    
    const fieldMappings = {
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
      'business_function_name': currentEmployee.business_function_detail?.name,
      'business_function_code': currentEmployee.business_function_detail?.code,
      'department_name': currentEmployee.department_detail?.name,
      'unit_name': currentEmployee.unit_detail?.name,
      'job_function_name': currentEmployee.job_function_detail?.name,
      'position_group_name': currentEmployee.position_group_detail?.name,
      'position_group_display_name': currentEmployee.position_group_detail?.display_name,
      'hierarchy_level': currentEmployee.position_group_detail?.hierarchy_level,
      'status_name': currentEmployee.status_detail?.name,
      'status_type': currentEmployee.status_detail?.status_type,
      'status_color': currentEmployee.status_detail?.color,
      'line_manager_name': currentEmployee.line_manager_detail?.name || currentEmployee.line_manager_detail?.full_name,
      'line_manager_id': currentEmployee.line_manager_detail?.id,
      'line_manager_employee_id': currentEmployee.line_manager_detail?.employee_id,
      'contract_duration_display': currentEmployee.contract_duration_display || 
        (currentEmployee.contract_duration === 'PERMANENT' ? 'Permanent' : currentEmployee.contract_duration),
    };
    
    const value = fieldMappings[field];
    return (value === undefined || value === null || value === '') ? fallback : value;
  };

  const handleEditEmployee = () => {
    router.push(`/structure/employee/${id}/edit`);
  };

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

  const getDisplayName = () => {
    if (currentEmployee.name) return currentEmployee.name;
    if (currentEmployee.full_name) return currentEmployee.full_name;
    const firstName = currentEmployee.first_name || '';
    const lastName = currentEmployee.last_name || '';
    const combined = `${firstName} ${lastName}`.trim();
    return combined || 'Unknown Employee';
  };

  const getEmail = () => {
    return currentEmployee.email || currentEmployee.user?.email || 'No email';
  };

  const toggleSection = (section) => {
    setSectionsExpanded(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleProfilePhotoUpdate = (newPhotoUrl) => {
    setCurrentProfilePhoto(newPhotoUrl);
    if (id) {
      fetchEmployee(id);
    }
  };

  // 🆕 Get urgency badge color for probation
  const getUrgencyBadgeColor = (urgencyLevel) => {
    const colors = {
      'critical': 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',
      'warning': 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800',
      'attention': 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
      'normal': 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
    };
    return colors[urgencyLevel] || colors.normal;
  };

  // 🆕 Get progress bar color
  const getProgressBarColor = (urgencyLevel) => {
    const colors = {
      'critical': 'bg-red-500',
      'warning': 'bg-amber-500',
      'attention': 'bg-orange-500',
      'normal': 'bg-almet-sapphire',
    };
    return colors[urgencyLevel] || colors.normal;
  };

  // Enhanced Info Item Component
  const InfoItem = ({ icon, label, value, isLink, linkPath }) => (
    <div className={`group flex items-start py-2 px-1 rounded-lg transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-700/30`}>
      <div className={`flex-shrink-0 w-7 h-7 rounded-xl flex items-center justify-center mr-3 transition-all duration-200 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 group-hover:bg-almet-sapphire/20`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold ${textMuted} uppercase tracking-wider mb-1`}>{label}</p>
        {isLink && linkPath && value !== 'N/A' ? (
          <Link 
            href={linkPath} 
            className={`${textPrimary} hover:text-almet-sapphire dark:hover:text-almet-steel-blue transition-colors font-medium break-all text-[10px] flex items-center gap-2 group`}
          >
            {value}
            <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
          </Link>
        ) : (
          <p className={`${textPrimary} font-medium break-all text-[10px] ${value === 'N/A' ? 'text-gray-400 italic' : ''}`}>
            {value}
          </p>
        )}
      </div>
    </div>
  );

  // Collapsible Section Component
  const CollapsibleSection = ({ title, icon, children, sectionKey, defaultExpanded = true }) => {
    const isExpanded = sectionsExpanded[sectionKey] ?? defaultExpanded;
    
    return (
      <div className={`${bgCard} rounded-lg ${shadowClass} overflow-hidden border ${borderColor} transition-all duration-300`}>
        <button
          onClick={() => toggleSection(sectionKey)}
          className={`w-full px-3 py-2 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-almet-comet/30 transition-all duration-200 ${borderColor} border-b`}
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-almet-sapphire/10 rounded-md">
              {icon}
            </div>
            <h3 className={`${textPrimary} font-semibold text-[10px]`}>{title}</h3>
          </div>
          {isExpanded ? (
            <ChevronUp size={12} className={`${textMuted} transition-transform duration-200`} />
          ) : (
            <ChevronDown size={12} className={`${textMuted} transition-transform duration-200`} />
          )}
        </button>
        <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-3">
            {children}
          </div>
        </div>
      </div>
    );
  };

  // Tab Component
  const TabButton = ({ id, label, icon, isActive, onClick, badge }) => (
    <button
      onClick={() => onClick(id)}
      className={`relative flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 text-xs ${
        isActive
          ? 'bg-almet-sapphire text-white shadow-lg transform scale-105'
          : `${textMuted} hover:text-almet-sapphire hover:bg-almet-sapphire/5 hover:scale-102`
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
      {badge && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center font-bold">
          {badge}
        </span>
      )}
    </button>
  );

  // Loading state
  if (loading.employee) {
    return (
      <div className={`min-h-screen ${bgPrimary}`}>
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col items-center justify-center h-64">
            <div className="relative">
              <Loader className="w-16 h-16 text-almet-sapphire animate-spin" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-almet-sapphire/20 rounded-full"></div>
            </div>
            <p className={`${textPrimary} text-lg font-medium mt-4`}>Loading employee details...</p>
            <p className={`${textMuted} text-sm mt-2`}>Please wait while we fetch the information</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error.employee || !currentEmployee) {
    return (
      <div className={`min-h-screen ${bgPrimary}`}>
        <div className="container mx-auto px-4 py-8">
          <div className={`${bgCard} rounded-xl border border-red-300 dark:border-red-700 p-8 ${shadowClass}`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-bold text-red-800 dark:text-red-300 mb-2">
                  Error Loading Employee
                </h3>
                <p className="text-sm text-red-700 dark:text-red-400 mb-4">
                  {error.employee || "Employee not found"}
                </p>
                <Link
                  href="/structure/headcount-table"
                  className="inline-flex items-center px-6 py-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-xl hover:bg-red-200 dark:hover:bg-red-800 transition-all duration-200 font-semibold text-sm"
                >
                  <ChevronLeft className="h-5 w-5 mr-2" />
                  Return to Headcount Table
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgPrimary}`}>
      <div className="container mx-auto px-3 py-4">
        {/* Enhanced Header */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Link
                href="/structure/headcount-table"
                className={`inline-flex items-center px-3 py-2 ${btnSecondary} rounded-lg transition-all duration-200 text-xs font-medium`}
              >
                <ChevronLeft size={16} className="mr-1" />
                <span>Back</span>
              </Link>
              
              <div className="hidden sm:block w-px h-6 bg-gray-300 dark:bg-almet-comet"></div>
              
              <div>
                <h1 className={`text-base font-bold ${textPrimary} mb-0.5`}>Employee Profile</h1>
                <p className={`${textMuted} text-[10px]`}>Comprehensive employee information</p>
              </div>
            </div>

            {/* 🆕 Quick Actions - Resignation & Probation */}
            {isOwnProfile && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowResignationModal(true)}
                  className="px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-all text-xs font-medium flex items-center gap-2"
                >
                  <LogOut size={14} />
                  Submit Resignation
                </button>
                
                {probationInfo && (
                  <span className={`px-3 py-2 rounded-lg text-xs font-semibold border ${getUrgencyBadgeColor(probationInfo.urgencyLevel)} flex items-center gap-2`}>
                    <Clock size={14} />
                    Probation: {probationInfo.daysRemaining}d left
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 🆕 Probation Alert Banner */}
        {probationInfo && probationInfo.urgencyLevel === 'critical' && (
          <div className="mb-6 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <AlertTriangle size={20} className="text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-red-800 dark:text-red-300 mb-1">
                  Probation Period Ending Soon!
                </h3>
                <p className="text-xs text-red-700 dark:text-red-400 mb-3">
                  Your probation period will end in {probationInfo.daysRemaining} days. Please complete your self-assessment reviews.
                </p>
                <div className="flex items-center gap-2">
                  <Link
                    href="/hr/contract-probation-management"
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-medium inline-flex items-center gap-2"
                  >
                    <Eye size={12} />
                    View Probation Details
                  </Link>
                  {pendingProbationReviews.length > 0 && (
                    <button
                      onClick={() => {
                        setShowProbationModal(true);
                      }}
                      className="px-3 py-1.5 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-xs font-medium inline-flex items-center gap-2"
                    >
                      <MessageSquare size={12} />
                      Complete Review ({pendingProbationReviews.length})
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Layout */}
        <div className={`grid grid-cols-1 ${sidebarCollapsed ? 'lg:grid-cols-1' : 'lg:grid-cols-12'} gap-4 transition-all duration-300`}>
          
          {/* Sidebar */}
          <div className={`${sidebarCollapsed ? 'hidden' : 'lg:col-span-4 xl:col-span-3'} transition-all duration-300`}>
            <div className={`${bgCard} rounded-lg ${shadowClass} overflow-hidden border ${borderColor} sticky top-4`}>
              
              {/* Profile Header */}
              <div className={`${bgGradient} p-4 text-center relative overflow-hidden`}>
                <div className="absolute inset-0 bg-black/5"></div>
                <div className="relative z-10">
                  <button
                    onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                    className="absolute top-2 right-2 p-1.5 bg-white/20 hover:bg-white/30 rounded-md transition-all duration-200"
                  >
                    <Minimize2 size={14} className="text-white" />
                  </button>

                  <div className="mb-3">
                    <EmployeeProfilePhotoManager
                      employeeId={id}
                      currentPhotoUrl={currentProfilePhoto}
                      employeeName={getDisplayName()}
                      onPhotoUpdate={handleProfilePhotoUpdate}
                      editable={isOwnProfile}
                      size="lg"
                    />
                  </div>
                  
                  <h1 className="text-sm font-bold text-white mb-1">{getDisplayName()}</h1>
                  <p className="text-white/90 text-[10px] mb-3 line-clamp-2">{getFieldValue('job_title')}</p>
                  
                  <div className="flex justify-center items-center flex-wrap gap-1.5 mb-3">
                    <EmployeeStatusBadge 
                      status={getFieldValue('status_name')} 
                      color={getFieldValue('status_color')}
                    />
                    {currentEmployee.tag_details && currentEmployee.tag_details.map((tag, idx) => (
                      <EmployeeTag key={idx} tag={tag} />
                    ))}
                  </div>

                  <div className="flex flex-wrap justify-center gap-1.5 text-[9px]">
                    {getFieldValue('employee_id') !== 'N/A' && (
                      <div className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full font-medium">
                        ID: {getFieldValue('employee_id')}
                      </div>
                    )}
                    {getFieldValue('grading_level') !== 'N/A' && (
                      <div className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full font-medium">
                        Grade: {getFieldValue('grading_level')}
                      </div>
                    )}
                    {getFieldValue('start_date') !== 'N/A' && (
                      <div className="bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full font-medium">
                        Since: {formatDate(getFieldValue('start_date'))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 🆕 Probation Progress (if in probation) */}
              {probationInfo && (
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-semibold text-blue-800 dark:text-blue-300">
                          Probation Period
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${getUrgencyBadgeColor(probationInfo.urgencyLevel)}`}>
{probationInfo.daysRemaining}d left
</span>
</div>
<div className="mb-2">
                  <div className="flex items-center justify-between text-[9px] text-blue-700 dark:text-blue-400 mb-1">
                    <span>{probationInfo.daysCompleted} / {probationInfo.totalProbationDays} days</span>
                    <span className="font-bold">{probationInfo.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-blue-200 dark:bg-blue-900/50 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all ${getProgressBarColor(probationInfo.urgencyLevel)}`}
                      style={{ width: `${probationInfo.progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                {pendingProbationReviews.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                    <p className="text-[9px] text-blue-700 dark:text-blue-400 mb-2">
                      {pendingProbationReviews.length} pending review(s)
                    </p>
                    {pendingProbationReviews.map((review) => (
                      <button
                        key={review.id}
                        onClick={() => setShowProbationModal(true)}
                        className="w-full px-2 py-1.5 bg-blue-600 text-white rounded text-[9px] font-medium hover:bg-blue-700 transition-colors mb-1 flex items-center justify-center gap-1"
                      >
                        <MessageSquare size={10} />
                        Complete {review.review_period.replace('_', '-')} Review
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={`p-3 border-b ${borderColor}`}>
            <div className="grid grid-cols-1 gap-2">
              {!isOwnProfile && (
                <button
                  onClick={handleEditEmployee}
                  className={`${btnPrimary} px-3 py-2 rounded-md flex items-center justify-center text-[10px] font-semibold`}
                >
                  <Edit size={12} className="mr-1" />
                  Edit Profile
                </button>
              )}
              
              {/* 🆕 Own Profile Actions */}
              {isOwnProfile && (
                <>
                  <button
                    onClick={() => setShowResignationModal(true)}
                    className="px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-[10px] font-semibold flex items-center justify-center"
                  >
                    <LogOut size={12} className="mr-1" />
                    Submit Resignation
                  </button>
                  
                  <Link
                    href="/hr/contract-probation-management"
                    className="px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-[10px] font-semibold flex items-center justify-center"
                  >
                    <Clock size={12} className="mr-1" />
                    View My Reviews
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="p-3 space-y-3">
            <CollapsibleSection
              title="Contact Information"
              icon={<Mail size={14} className="text-almet-sapphire" />}
              sectionKey="contact"
            >
              <div className="space-y-1">
                <InfoItem 
                  icon={<Mail size={12} className="text-almet-sapphire" />}
                  label="Email"
                  value={getEmail()}
                  isLink={true}
                  linkPath={`mailto:${getEmail()}`}
                />
                <InfoItem 
                  icon={<Phone size={12} className="text-almet-sapphire" />}
                  label="Phone"
                  value={getFieldValue('phone')}
                  isLink={getFieldValue('phone') !== 'N/A'}
                  linkPath={`tel:${getFieldValue('phone')}`}
                />
                <InfoItem 
                  icon={<Calendar size={12} className="text-almet-sapphire" />}
                  label="Birth Date"
                  value={formatDate(getFieldValue('date_of_birth'))}
                />
                <InfoItem 
                  icon={<MapPin size={12} className="text-almet-sapphire" />}
                  label="Address"
                  value={getFieldValue('address')}
                />
              </div>
            </CollapsibleSection>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`${sidebarCollapsed ? 'lg:col-span-12' : 'lg:col-span-8 xl:col-span-9'} transition-all duration-300`}>
        
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className={`${btnPrimary} p-3 rounded-xl mb-6 shadow-lg hover:shadow-xl transition-all duration-300`}
          >
            <Maximize2 size={18} />
          </button>
        )}

        {/* Tab Navigation */}
        <div className={`${bgCard} rounded-2xl ${shadowClass} border ${borderColor} mb-6 overflow-hidden`}>
          <div className="p-4">
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'overview', label: 'Overview', icon: <User size={16} /> },
                { id: 'job', label: 'Job Details', icon: <Briefcase size={16} /> },
                { 
                  id: 'job-descriptions', 
                  label: 'Job Descriptions', 
                  icon: <ClipboardList size={16} />
                },
                { 
                  id: 'performance', 
                  label: 'Performance', 
                  icon: <TrendingUp size={16} />,
                  badge: currentEmployee?.pending_performance_actions?.has_pending_actions ? 
                    currentEmployee.pending_performance_actions.actions.length : null
                },
                { 
                  id: 'assets', 
                  label: 'Assets', 
                  icon: <Package size={16} />
                },
                { id: 'documents', label: 'Documents', icon: <FileText size={16} /> },
                { id: 'activity', label: 'Activity', icon: <Activity size={16} /> }
              ].map((tab) => (
                <TabButton
                  key={tab.id}
                  id={tab.id}
                  label={tab.label}
                  icon={tab.icon}
                  isActive={activeTab === tab.id}
                  onClick={setActiveTab}
                  badge={tab.badge}
                />
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="border-t border-gray-200 dark:border-gray-700">
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className={`${textPrimary} text-lg font-bold`}>Personal Overview</h3>
                    <div className="flex items-center gap-2">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-medium ${
                        getFieldValue('is_visible_in_org_chart', false)
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }`}>
                        {getFieldValue('is_visible_in_org_chart', false) ? (
                          <>
                            <Eye className="inline w-3 h-3 mr-1" />
                            Visible in Org Chart
                          </>
                        ) : (
                          <>
                            <EyeOff className="inline w-3 h-3 mr-1" />
                            Hidden from Org Chart
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[
                      { label: 'Full Name', value: getDisplayName(), icon: <User size={14} /> },
                      { label: 'Date of Birth', value: formatDate(getFieldValue('date_of_birth')), icon: <Calendar size={14} /> },
                      { label: 'Gender', value: getFieldValue('gender'), icon: <User size={14} /> },
                      { label: 'Email Address', value: getEmail(), icon: <Mail size={14} /> },
                      { label: 'Phone Number', value: getFieldValue('phone'), icon: <Phone size={14} /> },
                      { label: 'Primary Address', value: getFieldValue('address'), icon: <MapPin size={14} /> },
                      { label: 'Emergency Contact', value: getFieldValue('emergency_contact'), icon: <AlertTriangle size={14} /> }
                    ].map((item, index) => (
                      <div key={index} className={`${bgAccent} rounded-xl p-4 border ${borderColor} hover:shadow-md transition-all duration-200 group`}>
                        <div className="flex items-center mb-3">
                          <div className="p-1.5 bg-almet-sapphire/10 rounded-lg mr-3 group-hover:bg-almet-sapphire/20 transition-colors">
                            {item.icon}
                          </div>
                          <span className={`${textMuted} text-xs font-semibold uppercase tracking-wide`}>{item.label}</span>
                        </div>
                        <p className={`${textPrimary} font-semibold text-xs ${item.value === 'N/A' ? 'text-gray-400 italic text-xs' : ''}`}>
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'job' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className={`${textPrimary} text-sm font-bold`}>Job Information</h3>
                    <div className={`px-3 py-1 rounded-lg ${bgAccent} border ${borderColor}`}>
                      <span className={`text-[9px] font-semibold ${textMuted}`}>
                        Employee ID: {getFieldValue('employee_id')}
                      </span>
                    </div>
                  </div>

                  {/* Rest of job tab content... */}
                  {/* (Keep existing organizational structure, management, employment, status sections) */}
                </div>
              )}

              {activeTab === 'job-descriptions' && (
                <div className="space-y-6">
                  <EmployeeDetailJobDescriptions 
                    employeeId={id} 
                    isManager={isManager}
                  />
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className={`${textPrimary} text-lg font-bold`}>Performance Management</h3>
                    <div className={`px-4 py-2 rounded-xl ${bgAccent} border ${borderColor} flex items-center gap-2`}>
                      <TrendingUp size={16} className="text-almet-sapphire" />
                      <span className={`text-xs font-semibold ${textMuted}`}>
                        Annual Review & Goals
                      </span>
                    </div>
                  </div>
                  <EmployeeDetailPerformance 
                    employeeId={id} 
                    employeeData={currentEmployee}
                    isManager={isManager}
                  />
                </div>
              )}

              {activeTab === 'assets' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className={`${textPrimary} text-lg font-bold`}>Asset Management</h3>
                    <div className={`px-4 py-2 rounded-xl ${bgAccent} border ${borderColor} flex items-center gap-2`}>
                      <Package size={16} className="text-almet-sapphire" />
                      <span className={`text-xs font-semibold ${textMuted}`}>
                        Assigned Assets
                      </span>
                    </div>
                  </div>
                  <EmployeeAssetManagement 
                    employeeId={id} 
                    employeeData={currentEmployee}
                    darkMode={darkMode}
                  />
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-6">
                  <EmployeeDocumentManager 
                    employeeId={id} 
                    employeeData={currentEmployee}
                    darkMode={darkMode}
                  />
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-6">
                  {/* Keep existing activity content */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Modals */}
    {showResignationModal && isOwnProfile && (
      <ResignationSubmissionModal
        onClose={() => setShowResignationModal(false)}
        onSuccess={() => {
          setShowResignationModal(false);
          alert('Resignation submitted successfully!');
        }}
        currentEmployee={currentEmployee}
      />
    )}

    {showProbationModal && pendingProbationReviews.length > 0 && (
      <ProbationReviewModal
        review={pendingProbationReviews[0]}
        onClose={() => setShowProbationModal(false)}
        onSuccess={() => {
          setShowProbationModal(false);
          loadProbationData();
        }}
        respondentType="EMPLOYEE"
      />
    )}
  </div>
</div>  )}
export default function EmployeeDetailPage() {
return (
<DashboardLayout>
<Provider store={store}>
<EmployeeDetailPageContent />
</Provider>
</DashboardLayout>
);
}