// components/headcount/EmployeeDetailPerformance.jsx - UPDATED with correct API fields
'use client'
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp,
  Award,
  Clock,
  AlertCircle,
  CheckCircle,
  FileText,
  Users,
  AlertTriangle,
  Calendar,
  Target,
  BarChart3,
  Eye,
  Download,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Zap,
  XCircle,
  Activity,
  CheckSquare,
  MessageSquare,
  Send,
} from 'lucide-react';
import { useTheme } from '@/components/common/ThemeProvider';
import performanceApi from '@/services/performanceService';

const EmployeeDetailPerformance = ({ employeeId, employeeData, isManager = false }) => {
  const { darkMode } = useTheme();
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [performanceRecords, setPerformanceRecords] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState(null);
  const [clarificationComment, setClarificationComment] = useState('');
  const [myPermissions, setMyPermissions] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    summary: true,
    pending: true,
    history: true,
    team: true
  });

  // Theme classes
  const bgCard = darkMode ? "bg-almet-san-juan" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-almet-waterloo";
  const textMuted = darkMode ? "text-almet-santas-gray" : "text-almet-bali-hai";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";
  const shadowClass = darkMode ? "shadow-lg shadow-black/10" : "shadow-md shadow-gray-200/50";
  const bgAccent = darkMode ? "bg-almet-comet/30" : "bg-almet-mystic/50";

  useEffect(() => {
    if (employeeId) {
      fetchPerformanceRecords();
      fetchMyPermissions();
    }
  }, [employeeId]);

  // EmployeeDetailPerformance.jsx - FIXED fetchMyPermissions

const fetchMyPermissions = async () => {
  try {
    console.log('🔍 Fetching user permissions...');
    const permissions = await performanceApi.performances.getMyPermissions();
    console.log('✅ Permissions loaded:', permissions);
    setMyPermissions(permissions);
  } catch (error) {
    console.error('❌ Error fetching permissions:', error);
    // Set empty permissions to prevent undefined errors
    setMyPermissions({
      is_admin: false,
      permissions: [],
      can_view_all: false,
      accessible_employee_count: 0,
      employee: null
    });
  }
};

  const fetchPerformanceRecords = async () => {
    try {
      setLoading(true);
      const response = await performanceApi.performances.list({ 
        employee: employeeId 
      });
      setPerformanceRecords(Array.isArray(response.results) ? response.results : []);
    } catch (error) {
      console.error('Error fetching performance records:', error);
      setPerformanceRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (recordId) => {
    try {
      const detail = await performanceApi.performances.get(recordId);
      setSelectedRecord(detail);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error fetching performance details:', error);
      alert('Failed to load performance details');
    }
  };

  const handleDownloadExcel = async (recordId) => {
    try {
      await performanceApi.downloadExcel(recordId, `performance-${employeeData?.name}-${new Date().getFullYear()}.xlsx`);
    } catch (error) {
      console.error('Error downloading Excel:', error);
      alert('Failed to download performance report');
    }
  };

  const openApprovalModal = (record, action) => {
    setSelectedRecord(record);
    setApprovalAction(action);
    setShowApprovalModal(true);
    setClarificationComment('');
  };

  const handleApprovalAction = async () => {
    if (!selectedRecord || !approvalAction) return;

    try {
      setActionLoading(true);
      
      switch (approvalAction) {
        case 'approve_objectives_employee':
          await performanceApi.performances.approveObjectivesEmployee(selectedRecord.id);
          break;
        case 'approve_objectives_manager':
          await performanceApi.performances.approveObjectivesManager(selectedRecord.id);
          break;
        case 'submit_mid_year_employee':
          await performanceApi.performances.submitMidYearEmployee(selectedRecord.id, clarificationComment);
          break;
        case 'submit_mid_year_manager':
          await performanceApi.performances.submitMidYearManager(selectedRecord.id, clarificationComment);
          break;
        case 'submit_end_year_employee':
          await performanceApi.performances.submitEndYearEmployee(selectedRecord.id, clarificationComment);
          break;
        case 'complete_end_year':
          await performanceApi.performances.completeEndYear(selectedRecord.id, clarificationComment);
          break;
        case 'approve_final_employee':
          await performanceApi.performances.approveFinalEmployee(selectedRecord.id);
          break;
        case 'approve_final_manager':
          await performanceApi.performances.approveFinalManager(selectedRecord.id);
          break;
        case 'request_clarification':
          if (!clarificationComment.trim()) {
            alert('Please provide a clarification comment');
            return;
          }
          await performanceApi.performances.requestClarification(
            selectedRecord.id, 
            clarificationComment,
            'OBJECTIVES'
          );
          break;
        default:
          throw new Error('Invalid action');
      }

      await fetchPerformanceRecords();
      setShowApprovalModal(false);
      setClarificationComment('');
      setSelectedRecord(null);
      setApprovalAction(null);
      
      alert('Action completed successfully!');
    } catch (error) {
      console.error('Error processing action:', error);
      alert(error.response?.data?.message || 'Failed to process action. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getPeriodLabel = (period) => {
    const labels = {
      'GOAL_SETTING': 'Goal Setting',
      'MID_YEAR': 'Mid-Year Review',
      'END_YEAR': 'End-Year Review',
      'COMPLETED': 'Completed',
      'CLOSED': 'Closed',
      'ARCHIVED': 'Archived'
    };
    return labels[period] || period;
  };

  const getPeriodColor = (period) => {
    switch (period) {
      case 'GOAL_SETTING':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'MID_YEAR':
        return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      case 'END_YEAR':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'COMPLETED':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'CLOSED':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 4.5) return 'text-green-600 dark:text-green-400';
    if (score >= 3.5) return 'text-blue-600 dark:text-blue-400';
    if (score >= 2.5) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };


// EmployeeDetailPerformance.jsx - FIXED getAvailableActions

const getAvailableActions = (record) => {
  const actions = [];
  
  if (!record) {
    console.log('❌ No record provided');
    return actions;
  }

  if (!myPermissions) {
    console.log('❌ No permissions loaded yet');
    return actions;
  }

  // CRITICAL FIX: Check permissions array properly
  const userPermissions = myPermissions?.permissions || [];
  console.log('👤 User Permissions:', userPermissions);
  console.log('📊 Record State:', {
    year: record.year,
    current_period: record.current_period,
    objectives_employee_submitted: record.objectives_employee_submitted,
    objectives_employee_approved: record.objectives_employee_approved,
    objectives_manager_approved: record.objectives_manager_approved,
    mid_year_employee_submitted: record.mid_year_employee_submitted,
    mid_year_manager_submitted: record.mid_year_manager_submitted,
    end_year_employee_submitted: record.end_year_employee_submitted,
    end_year_completed: record.end_year_completed,
    final_employee_approved: record.final_employee_approved,
    final_manager_approved: record.final_manager_approved,
  });

  const currentPeriod = record.current_period;
  
  // CRITICAL FIX: Better permission checking
  const isEmployee = userPermissions.includes('performance.edit_own') || 
                     userPermissions.includes('performance.approve_as_employee');
  const isLineManager = userPermissions.includes('performance.manage_team') || 
                        userPermissions.includes('performance.approve_as_manager');
  const isAdmin = myPermissions?.is_admin === true;

  console.log('🔐 User Roles:', { isEmployee, isLineManager, isAdmin });

  // GOAL_SETTING Period - Objectives Approval
  if (currentPeriod === 'GOAL_SETTING') {
    console.log('📅 Period: GOAL_SETTING');
    
    // Employee approval - ONLY if submitted AND not yet employee-approved
    if ((isEmployee || isAdmin) && 
        record.objectives_employee_submitted === true &&
        record.objectives_employee_approved === false) {
      console.log('✅ Adding: approve_objectives_employee');
      actions.push({
        type: 'approve_objectives_employee',
        label: 'Approve Objectives',
        icon: <CheckSquare size={14} />,
        color: 'green'
      });
    }
    
    // Manager approval - ONLY if employee approved AND manager not yet approved
    else if ((isLineManager || isAdmin) && 
             record.objectives_employee_approved === true &&
             record.objectives_manager_approved === false) {
      console.log('✅ Adding: approve_objectives_manager');
      actions.push({
        type: 'approve_objectives_manager',
        label: 'Approve as Manager',
        icon: <CheckSquare size={14} />,
        color: 'green'
      });
    }

    // Clarification - only if objectives submitted
    if ((isEmployee || isLineManager || isAdmin) && 
        record.objectives_employee_submitted === true) {
      console.log('✅ Adding: request_clarification');
      actions.push({
        type: 'request_clarification',
        label: 'Request Clarification',
        icon: <MessageSquare size={14} />,
        color: 'orange'
      });
    }
  }

  // MID_YEAR Period
  if (currentPeriod === 'MID_YEAR_REVIEW') {
    console.log('📅 Period: MID_YEAR_REVIEW');
    
    // Employee submission - only if NOT submitted
    if ((isEmployee || isAdmin) && !record.mid_year_employee_submitted) {
      console.log('✅ Adding: submit_mid_year_employee');
      actions.push({
        type: 'submit_mid_year_employee',
        label: 'Submit Mid-Year Review',
        icon: <Send size={14} />,
        color: 'blue'
      });
    }
    
    // Manager submission - only if employee submitted AND manager not submitted
    else if ((isLineManager || isAdmin) && 
             record.mid_year_employee_submitted === true &&
             !record.mid_year_manager_submitted) {
      console.log('✅ Adding: submit_mid_year_manager');
      actions.push({
        type: 'submit_mid_year_manager',
        label: 'Submit Manager Review',
        icon: <Send size={14} />,
        color: 'blue'
      });
    }
  }

  // END_YEAR Period
  if (currentPeriod === 'END_YEAR_REVIEW') {
    console.log('📅 Period: END_YEAR_REVIEW');
    
    // Employee submission - only if NOT submitted
    if ((isEmployee || isAdmin) && !record.end_year_employee_submitted) {
      console.log('✅ Adding: submit_end_year_employee');
      actions.push({
        type: 'submit_end_year_employee',
        label: 'Submit End-Year Review',
        icon: <Send size={14} />,
        color: 'purple'
      });
    }
    
    // Manager completion - only if employee submitted AND not yet completed
    else if ((isLineManager || isAdmin) && 
             record.end_year_employee_submitted === true &&
             record.end_year_completed === false) {
      console.log('✅ Adding: complete_end_year');
      actions.push({
        type: 'complete_end_year',
        label: 'Complete End-Year',
        icon: <CheckCircle size={14} />,
        color: 'purple'
      });
    }
  }

  // Final Approval Actions - SEQUENTIAL, not simultaneous
  // Employee final approval - ONLY if end_year completed AND employee not approved
  if (record.end_year_completed === true && 
      record.final_employee_approved === false && 
      (isEmployee || isAdmin)) {
    console.log('✅ Adding: approve_final_employee');
    actions.push({
      type: 'approve_final_employee',
      label: 'Final Approval (Employee)',
      icon: <CheckSquare size={14} />,
      color: 'green'
    });
  }

  // Manager final approval - ONLY if employee approved AND manager not approved
  else if (record.final_employee_approved === true && 
           record.final_manager_approved === false && 
           (isLineManager || isAdmin)) {
    console.log('✅ Adding: approve_final_manager');
    actions.push({
      type: 'approve_final_manager',
      label: 'Final Approval (Manager)',
      icon: <CheckSquare size={14} />,
      color: 'green'
    });
  }

  console.log('🎯 Total Actions Available:', actions.length);
  return actions;
};

  const getActionButtonColor = (color) => {
    switch (color) {
      case 'green':
        return 'bg-green-600 hover:bg-green-700 text-white';
      case 'blue':
        return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'purple':
        return 'bg-purple-600 hover:bg-purple-700 text-white';
      case 'orange':
        return 'bg-orange-600 hover:bg-orange-700 text-white';
      default:
        return 'bg-gray-600 hover:bg-gray-700 text-white';
    }
  };

  const needsCommentActions = ['submit_mid_year_employee', 'submit_mid_year_manager', 'submit_end_year_employee', 'complete_end_year', 'request_clarification'];

  // Collapsible Section Component
  const CollapsibleSection = ({ title, icon, children, sectionKey, badge }) => {
    const isExpanded = expandedSections[sectionKey] ?? true;
    
    return (
      <div className={`${bgCard} rounded-xl ${shadowClass} overflow-hidden border ${borderColor} transition-all duration-300`}>
        <button
          onClick={() => toggleSection(sectionKey)}
          className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-almet-comet/30 transition-all duration-200 ${borderColor} border-b`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 bg-almet-sapphire/10 rounded-lg">
              {icon}
            </div>
            <h3 className={`${textPrimary} font-bold text-sm`}>{title}</h3>
            {badge && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[20px] text-center font-bold">
                {badge}
              </span>
            )}
          </div>
          {isExpanded ? (
            <ChevronUp size={16} className={`${textMuted} transition-transform duration-200`} />
          ) : (
            <ChevronDown size={16} className={`${textMuted} transition-transform duration-200`} />
          )}
        </button>
        <div className={`transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'}`}>
          <div className="p-5">
            {children}
          </div>
        </div>
      </div>
    );
  };

  // Summary Card Component
  const SummaryCard = ({ icon, label, value, sublabel, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
      green: 'bg-green-100 dark:bg-green-900/30 text-green-600',
      orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600',
      purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600',
      red: 'bg-red-100 dark:bg-red-900/30 text-red-600',
    };

    return (
      <div className={`${bgCard} rounded-xl border ${borderColor} p-4 ${shadowClass} hover:shadow-lg transition-all duration-200`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 ${colorClasses[color]} rounded-lg`}>
            {icon}
          </div>
          <div className="flex-1">
            <h4 className={`text-xs font-semibold ${textMuted} uppercase tracking-wide`}>{label}</h4>
            <p className={`text-xl font-bold ${textPrimary} mt-1`}>{value}</p>
          </div>
        </div>
        {sublabel && (
          <p className={`text-xs ${textMuted}`}>{sublabel}</p>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`${bgCard} rounded-xl border ${borderColor} p-12 text-center`}>
        <div className="relative inline-block">
          <RefreshCw className="w-12 h-12 text-almet-sapphire animate-spin" />
        </div>
        <p className={`${textPrimary} text-sm font-medium mt-4`}>Loading performance data...</p>
      </div>
    );
  }

  const currentPerformance = employeeData?.current_performance;
  const performanceSummary = employeeData?.performance_summary;
  const pendingActions = employeeData?.pending_performance_actions;
  const teamOverview = employeeData?.team_performance_overview;



  

  return (
    <div className="space-y-6">
  

{/* Performance Summary Section */}
<CollapsibleSection
  title="Performance Summary"
  icon={<BarChart3 size={18} className="text-almet-sapphire" />}
  sectionKey="summary"
>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {/* Current Year Card */}
    <SummaryCard
      icon={<Calendar size={18} />}
      label="Current Year"
      value={currentPerformance?.active_year || new Date().getFullYear()}
      sublabel={
        currentPerformance?.has_current_performance 
          ? `Active - ${performanceRecords.length || 0} record(s)` 
          : currentPerformance?.message || 'No performance record'
      }
      color={currentPerformance?.has_current_performance ? 'green' : 'orange'}
    />
    
    {/* Total Records Card */}
    <SummaryCard
      icon={<FileText size={18} />}
      label="Total Records"
      value={performanceSummary?.total_records || performanceRecords.length || 0}
      sublabel={
        performanceSummary?.has_performance_data || performanceRecords.length > 0
          ? 'Performance data available' 
          : 'No data'
      }
      color="blue"
    />
    
    {/* Pending Actions Card */}
    <SummaryCard
      icon={<Clock size={18} />}
      label="Pending Actions"
      value={pendingActions?.actions?.length || 0}
      sublabel={
        pendingActions?.has_pending_actions 
          ? 'Action required' 
          : 'No pending actions'
      }
      color={pendingActions?.has_pending_actions ? 'orange' : 'green'}
    />
    
    {/* CRITICAL FIX: Current Period Card with multiple fallbacks */}
    <SummaryCard
      icon={<TrendingUp size={18} />}
      label="Current Period"
      value={(() => {
        // Try multiple sources in priority order
        const sources = [
          currentPerformance?.current_period,                    // From current_performance.current_period
          currentPerformance?.performance?.current_period,       // From current_performance.performance.current_period
          performanceRecords?.[0]?.current_period,              // From first record in list
        ];
        
        for (const source of sources) {
          if (source) {
            return getPeriodLabel(source);
          }
        }
        
        return 'N/A';
      })()}
      sublabel={(() => {
        const year = currentPerformance?.active_year || 
                     currentPerformance?.performance?.year || 
                     performanceRecords?.[0]?.year ||
                     new Date().getFullYear();
        
        return `Year ${year}`;
      })()}
      color="purple"
    />
  </div>
</CollapsibleSection>


<CollapsibleSection
  title="Performance History"
  icon={<FileText size={18} className="text-almet-sapphire" />}
  sectionKey="history"
>
  {performanceRecords.length > 0 ? (
    <div className="space-y-3">
      {performanceRecords.map((record) => {
        const availableActions = getAvailableActions(record);
        
        // Log for debugging
        console.log(`🔍 Record ${record.year} - Available Actions:`, availableActions);
        
        return (
          <div key={record.id} className={`p-4 ${bgAccent} rounded-lg border ${borderColor} hover:shadow-md transition-all group`}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-gradient-to-br from-almet-sapphire to-almet-astral rounded-lg">
                    <Award size={16} className="text-white" />
                  </div>
                  <div>
                    <h5 className={`${textPrimary} font-bold text-sm`}>
                      Performance Year {record.year}
                    </h5>
                    <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${getPeriodColor(record.current_period)}`}>
                      {getPeriodLabel(record.current_period)}
                    </span>
                  </div>
                </div>

                {/* Scores Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  {record.total_objectives_score !== null && record.total_objectives_score !== undefined && (
                    <div>
                      <p className={`text-xs ${textMuted} mb-1`}>Objectives</p>
                      <p className={`text-lg font-bold ${getScoreColor(parseFloat(record.total_objectives_score))}`}>
                        {parseFloat(record.total_objectives_score).toFixed(2)}
                      </p>
                    </div>
                  )}
                  {record.total_competencies_actual_score !== null && record.total_competencies_actual_score !== undefined && (
                    <div>
                      <p className={`text-xs ${textMuted} mb-1`}>Competencies</p>
                      <p className={`text-lg font-bold ${getScoreColor(record.total_competencies_actual_score)}`}>
                        {record.total_competencies_actual_score}
                      </p>
                    </div>
                  )}
                  {record.overall_weighted_percentage !== null && record.overall_weighted_percentage !== undefined && (
                    <div>
                      <p className={`text-xs ${textMuted} mb-1`}>Overall %</p>
                      <p className={`text-xl font-bold ${getScoreColor(parseFloat(record.overall_weighted_percentage) / 20)}`}>
                        {parseFloat(record.overall_weighted_percentage).toFixed(1)}%
                      </p>
                    </div>
                  )}
                  {record.final_rating && (
                    <div>
                      <p className={`text-xs ${textMuted} mb-1`}>Rating</p>
                      <p className={`text-sm font-bold ${textPrimary}`}>
                        {record.final_rating}
                      </p>
                    </div>
                  )}
                </div>

                {/* CRITICAL: Action Buttons with debug info */}
                {availableActions.length > 0 ? (
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-green-600">
                        {availableActions.length} action(s) available
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {availableActions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            console.log('🎯 Button clicked:', action.type);
                            openApprovalModal(record, action.type);
                          }}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-xs font-semibold ${getActionButtonColor(action.color)} shadow-md hover:shadow-lg`}
                        >
                          {action.icon}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mb-3 p-2 bg-gray-100 dark:bg-almet-comet/30 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      No actions available at this time
                    </p>
                  </div>
                )}

                <div className={`flex items-center gap-2 text-xs ${textMuted}`}>
                  <Calendar size={12} />
                  <span>Updated: {formatDate(record.updated_at)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleViewDetails(record.id)}
                  className="p-2 text-almet-sapphire hover:bg-almet-sapphire/10 rounded-lg transition-colors"
                  title="View Details"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => handleDownloadExcel(record.id)}
                  className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                  title="Download Excel"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  ) : (
    <div className="text-center py-8">
      <div className={`w-16 h-16 mx-auto mb-4 ${bgAccent} rounded-2xl flex items-center justify-center`}>
        <FileText className={`h-8 w-8 ${textMuted}`} />
      </div>
      <h4 className={`text-base font-bold ${textPrimary} mb-2`}>
        No Performance Records
      </h4>
      <p className={`${textMuted} text-sm`}>
        {currentPerformance?.can_initialize ? 
          'Ready to initialize performance record for this year' :
          'No performance records found for this employee'}
      </p>
    </div>
  )}
</CollapsibleSection>

      {/* Team Performance Overview (for managers) */}
      {isManager && teamOverview && (
        <CollapsibleSection
          title="Team Performance Overview"
          icon={<Users size={18} className="text-green-600" />}
          sectionKey="team"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`${bgCard} rounded-lg border ${borderColor} p-3 text-center`}>
                <p className={`text-2xl font-bold ${textPrimary}`}>
                  {teamOverview.team_size}
                </p>
                <p className={`text-xs ${textMuted} mt-1`}>Team Size</p>
              </div>
              <div className={`${bgCard} rounded-lg border ${borderColor} p-3 text-center`}>
                <p className={`text-2xl font-bold text-green-600`}>
                  {teamOverview.performance_initiated}
                </p>
                <p className={`text-xs ${textMuted} mt-1`}>Initiated</p>
              </div>
              <div className={`${bgCard} rounded-lg border ${borderColor} p-3 text-center`}>
                <p className={`text-2xl font-bold text-orange-600`}>
                  {teamOverview.not_initiated}
                </p>
                <p className={`text-xs ${textMuted} mt-1`}>Not Initiated</p>
              </div>
              <div className={`${bgCard} rounded-lg border ${borderColor} p-3 text-center`}>
                <p className={`text-2xl font-bold text-blue-600`}>
                  {teamOverview.objectives_submitted}
                </p>
                <p className={`text-xs ${textMuted} mt-1`}>Submitted</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`${bgCard} rounded-lg border ${borderColor} p-3 text-center`}>
                <p className={`text-2xl font-bold text-purple-600`}>
                  {teamOverview.objectives_pending_approval || 0}
                </p>
                <p className={`text-xs ${textMuted} mt-1`}>Pending Approval</p>
              </div>
              <div className={`${bgCard} rounded-lg border ${borderColor} p-3 text-center`}>
                <p className={`text-2xl font-bold text-yellow-600`}>
                  {teamOverview.mid_year_completed || 0}
                </p>
                <p className={`text-xs ${textMuted} mt-1`}>Mid-Year Done</p>
              </div>
              <div className={`${bgCard} rounded-lg border ${borderColor} p-3 text-center`}>
                <p className={`text-2xl font-bold text-indigo-600`}>
                  {teamOverview.end_year_completed || 0}
                </p>
                <p className={`text-xs ${textMuted} mt-1`}>End-Year Done</p>
              </div>
              <div className={`${bgCard} rounded-lg border ${borderColor} p-3 text-center`}>
                <p className={`text-2xl font-bold text-green-600`}>
                  {teamOverview.fully_approved || 0}
                </p>
                <p className={`text-xs ${textMuted} mt-1`}>Fully Approved</p>
              </div>
            </div>

            {teamOverview.needs_attention_count > 0 && (
              <div className={`p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800`}>
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-orange-600" />
                  <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                    {teamOverview.needs_attention_count} team member(s) need attention
                  </span>
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* Approval/Action Modal */}
      {showApprovalModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`${bgCard} rounded-2xl w-full max-w-md border ${borderColor} ${shadowClass} overflow-hidden`}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-almet-comet">
              <h3 className={`text-lg font-bold ${textPrimary}`}>
                {approvalAction === 'approve_objectives_employee' && 'Approve Objectives (Employee)'}
                {approvalAction === 'approve_objectives_manager' && 'Approve Objectives (Manager)'}
                {approvalAction === 'submit_mid_year_employee' && 'Submit Mid-Year Review'}
                {approvalAction === 'submit_mid_year_manager' && 'Submit Manager Mid-Year Review'}
                {approvalAction === 'submit_end_year_employee' && 'Submit End-Year Review'}
                {approvalAction === 'complete_end_year' && 'Complete End-Year Review'}
                {approvalAction === 'approve_final_employee' && 'Final Approval (Employee)'}
                {approvalAction === 'approve_final_manager' && 'Final Approval (Manager)'}
                {approvalAction === 'request_clarification' && 'Request Clarification'}
              </h3>
              <p className={`text-sm ${textMuted} mt-1`}>
                Performance Year {selectedRecord.year}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Record Summary */}
              <div className={`p-4 ${bgAccent} rounded-lg space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${textMuted}`}>Employee</span>
                  <span className={`text-sm font-semibold ${textPrimary}`}>
                    {selectedRecord.employee_name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`text-xs ${textMuted}`}>Period</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getPeriodColor(selectedRecord.current_period)}`}>
                    {getPeriodLabel(selectedRecord.current_period)}
                  </span>
                </div>
                {selectedRecord.objectives_count > 0 && (
                  <div className="flex items-center justify-between">
                    <span className={`text-xs ${textMuted}`}>Objectives</span>
                    <span className={`text-sm font-semibold ${textPrimary}`}>
                      {selectedRecord.objectives_count}
                    </span>
                  </div>
                )}
              </div>

              {/* Comment/Clarification Input (if needed) */}
              {needsCommentActions.includes(approvalAction) && (
                <div>
                  <label className={`block text-sm font-semibold ${textPrimary} mb-2`}>
                    {approvalAction === 'request_clarification' ? 'Clarification Request *' : 'Comment'}
                  </label>
                  <textarea
                    value={clarificationComment}
                    onChange={(e) => setClarificationComment(e.target.value)}
                    placeholder={
                      approvalAction === 'request_clarification' 
                        ? 'Explain what needs clarification...'
                        : 'Add your comments (optional)...'
                    }
                    rows={4}
                    required={approvalAction === 'request_clarification'}
                    className={`w-full px-4 py-3 rounded-lg border ${borderColor} ${bgCard} ${textPrimary} text-sm focus:ring-2 focus:ring-almet-sapphire focus:border-transparent resize-none transition-all`}
                  />
                  {approvalAction === 'request_clarification' && (
                    <p className="text-xs text-orange-600 mt-1">* Required field</p>
                  )}
                </div>
              )}

              {/* Warning Messages */}
              {approvalAction === 'approve_final_manager' && (
                <div className={`p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800`}>
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">
                      This is the final approval step. Once approved, the performance review will be published and cannot be modified.
                    </p>
                  </div>
                </div>
              )}

              {approvalAction === 'complete_end_year' && (
                <div className={`p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800`}>
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="text-purple-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-purple-700 dark:text-purple-300">
                      Completing the end-year review will finalize all scores and send them for final approval.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-4 bg-gray-50 dark:bg-almet-comet/20 border-t border-gray-200 dark:border-almet-comet flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setClarificationComment('');
                  setSelectedRecord(null);
                  setApprovalAction(null);
                }}
                disabled={actionLoading}
                className={`px-4 py-2 rounded-lg border ${borderColor} ${textPrimary} hover:bg-gray-100 dark:hover:bg-almet-comet/50 transition-colors text-sm font-medium disabled:opacity-50`}
              >
                Cancel
              </button>
              <button
                onClick={handleApprovalAction}
                disabled={actionLoading || (approvalAction === 'request_clarification' && !clarificationComment.trim())}
                className={`px-5 py-2 rounded-lg bg-gradient-to-r from-almet-sapphire to-almet-astral text-white hover:shadow-lg transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2`}
              >
                {actionLoading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Confirm
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRecord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className={`${bgCard} rounded-2xl w-full max-w-4xl border ${borderColor} ${shadowClass} my-8`}>
            <div className="px-6 py-4 border-b border-gray-200 dark:border-almet-comet flex items-center justify-between">
              <div>
                <h3 className={`text-xl font-bold ${textPrimary}`}>
                  Performance Details - {selectedRecord.year}
                </h3>
                <p className={`text-sm ${textMuted} mt-1`}>
                  {selectedRecord.employee_name} • {selectedRecord.employee_job_title}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedRecord(null);
                }}
                className={`p-2 hover:bg-gray-100 dark:hover:bg-almet-comet/50 rounded-lg transition-colors ${textMuted}`}
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              {/* Current Status */}
              <div>
                <h4 className={`text-sm font-bold ${textPrimary} mb-3 flex items-center gap-2`}>
                  <Activity size={16} className="text-almet-sapphire" />
                  Current Status
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className={`p-3 ${bgAccent} rounded-lg`}>
                    <p className={`text-xs ${textMuted} mb-1`}>Period</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${getPeriodColor(selectedRecord.current_period)}`}>
                      {getPeriodLabel(selectedRecord.current_period)}
                    </span>
                  </div>
                  <div className={`p-3 ${bgAccent} rounded-lg`}>
                    <p className={`text-xs ${textMuted} mb-1`}>Approval Status</p>
                    <p className={`text-sm font-bold ${textPrimary}`}>
                      {selectedRecord.approval_status || 'Pending'}
                    </p>
                  </div>
                  <div className={`p-3 ${bgAccent} rounded-lg`}>
                    <p className={`text-xs ${textMuted} mb-1`}>Last Updated</p>
                    <p className={`text-sm font-semibold ${textPrimary}`}>
                      {formatDate(selectedRecord.updated_at)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Objectives */}
              {selectedRecord.objectives && selectedRecord.objectives.length > 0 && (
                <div>
                  <h4 className={`text-sm font-bold ${textPrimary} mb-3 flex items-center gap-2`}>
                    <Target size={16} className="text-blue-600" />
                    Objectives ({selectedRecord.objectives.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedRecord.objectives.map((objective) => (
                      <div key={objective.id} className={`p-4 ${bgAccent} rounded-lg border ${borderColor}`}>
                        <div className="flex items-start justify-between mb-2">
                          <h5 className={`text-sm font-bold ${textPrimary} flex-1`}>
                            {objective.title}
                          </h5>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            objective.is_cancelled 
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                              : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          }`}>
                            {objective.is_cancelled ? 'Cancelled' : objective.status_label || 'Active'}
                          </span>
                        </div>
                        <p className={`text-xs ${textMuted} mb-3`}>{objective.description}</p>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <p className={`text-xs ${textMuted} mb-1`}>Weight</p>
                            <p className={`text-sm font-bold ${textPrimary}`}>{objective.weight}%</p>
                          </div>
                          <div>
                            <p className={`text-xs ${textMuted} mb-1`}>Progress</p>
                            <p className={`text-sm font-bold ${textPrimary}`}>{objective.progress}%</p>
                          </div>
                          {objective.calculated_score !== null && (
                            <div>
                              <p className={`text-xs ${textMuted} mb-1`}>Score</p>
                              <p className={`text-sm font-bold ${getScoreColor(objective.calculated_score)}`}>
                                {objective.calculated_score.toFixed(2)}
                              </p>
                            </div>
                          )}
                        </div>
                        {objective.end_year_rating_name && (
                          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-almet-comet">
                            <span className={`text-xs ${textMuted}`}>End-Year Rating: </span>
                            <span className={`text-sm font-bold ${textPrimary}`}>
                              {objective.end_year_rating_name}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Competencies */}
              {selectedRecord.competency_ratings && selectedRecord.competency_ratings.length > 0 && (
                <div>
                  <h4 className={`text-sm font-bold ${textPrimary} mb-3 flex items-center gap-2`}>
                    <Award size={16} className="text-purple-600" />
                    Behavioral Competencies ({selectedRecord.competency_ratings.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedRecord.competency_ratings.map((competency) => (
                      <div key={competency.id} className={`p-4 ${bgAccent} rounded-lg border ${borderColor}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h5 className={`text-sm font-bold ${textPrimary}`}>
                              {competency.competency_name}
                            </h5>
                            {competency.competency_group && (
                              <span className={`text-xs ${textMuted}`}>
                                {competency.competency_group}
                              </span>
                            )}
                          </div>
                          {competency.gap_status && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              competency.gap_status === 'MEETS' 
                                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                                : competency.gap_status === 'EXCEEDS'
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                            }`}>
                              {competency.gap_status}
                            </span>
                          )}
                        </div>
                        <div className="grid grid-cols-3 gap-3 mt-3">
                          <div>
                            <p className={`text-xs ${textMuted} mb-1`}>Required</p>
                            <p className={`text-sm font-bold ${textPrimary}`}>{competency.required_level}</p>
                          </div>
                          <div>
                            <p className={`text-xs ${textMuted} mb-1`}>Actual</p>
                            <p className={`text-sm font-bold ${textPrimary}`}>{competency.actual_value}</p>
                          </div>
                          <div>
                            <p className={`text-xs ${textMuted} mb-1`}>Gap</p>
                            <p className={`text-sm font-bold ${
                              competency.gap > 0 ? 'text-orange-600' : 'text-green-600'
                            }`}>
                              {competency.gap > 0 ? `+${competency.gap}` : competency.gap}
                            </p>
                          </div>
                        </div>
                        {competency.notes && (
                          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-almet-comet">
                            <p className={`text-xs ${textMuted}`}>{competency.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Final Scores */}
              {(selectedRecord.total_objectives_score || selectedRecord.competencies_percentage) && (
                <div>
                  <h4 className={`text-sm font-bold ${textPrimary} mb-3 flex items-center gap-2`}>
                    <BarChart3 size={16} className="text-green-600" />
                    Final Scores
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {selectedRecord.total_objectives_score && (
                      <div className={`p-3 ${bgAccent} rounded-lg text-center`}>
                        <p className={`text-xs ${textMuted} mb-1`}>Objectives</p>
                        <p className={`text-xl font-bold ${getScoreColor(parseFloat(selectedRecord.total_objectives_score))}`}>
                          {parseFloat(selectedRecord.total_objectives_score).toFixed(2)}
                        </p>
                      </div>
                    )}
                    {selectedRecord.competencies_percentage && (
                      <div className={`p-3 ${bgAccent} rounded-lg text-center`}>
                        <p className={`text-xs ${textMuted} mb-1`}>Competencies</p>
                        <p className={`text-xl font-bold ${getScoreColor(parseFloat(selectedRecord.competencies_percentage) / 20)}`}>
                          {parseFloat(selectedRecord.competencies_percentage).toFixed(1)}%
                        </p>
                      </div>
                    )}
                    {selectedRecord.overall_weighted_percentage && (
                      <div className={`p-3 ${bgAccent} rounded-lg text-center`}>
                        <p className={`text-xs ${textMuted} mb-1`}>Overall</p>
                        <p className={`text-xl font-bold ${getScoreColor(parseFloat(selectedRecord.overall_weighted_percentage) / 20)}`}>
                          {parseFloat(selectedRecord.overall_weighted_percentage).toFixed(1)}%
                        </p>
                      </div>
                    )}
                    {selectedRecord.final_rating && (
                      <div className={`p-3 ${bgAccent} rounded-lg text-center`}>
                        <p className={`text-xs ${textMuted} mb-1`}>Rating</p>
                        <p className={`text-lg font-bold ${textPrimary}`}>
                          {selectedRecord.final_rating}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Development Needs */}
              {selectedRecord.development_needs && selectedRecord.development_needs.length > 0 && (
                <div>
                  <h4 className={`text-sm font-bold ${textPrimary} mb-3 flex items-center gap-2`}>
                    <Zap size={16} className="text-orange-600" />
                    Development Needs ({selectedRecord.development_needs.length})
                  </h4>
                  <div className="space-y-2">
                    {selectedRecord.development_needs.map((need) => (
                      <div key={need.id} className={`p-4 ${bgAccent} rounded-lg border ${borderColor}`}>
                        <div className="mb-2">
                          <span className={`text-xs ${textMuted}`}>Gap Area: </span>
                          <span className={`text-sm font-bold ${textPrimary}`}>
                            {need.competency_gap}
                          </span>
                        </div>
                        <p className={`text-xs ${textPrimary} mb-2`}>
                          <span className="font-semibold">Development Activity:</span> {need.development_activity}
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className={`text-xs ${textMuted} mb-1`}>Progress</p>
                            <div className="w-full bg-gray-200 dark:bg-almet-comet rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-almet-sapphire to-almet-astral h-2 rounded-full transition-all"
                                style={{ width: `${need.progress}%` }}
                              />
                            </div>
                            <p className={`text-xs ${textMuted} mt-1`}>{need.progress}%</p>
                          </div>
                          {need.comment && (
                            <div>
                              <p className={`text-xs ${textMuted} mb-1`}>Comment</p>
                              <p className={`text-xs ${textPrimary}`}>{need.comment}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-gray-50 dark:bg-almet-comet/20 border-t border-gray-200 dark:border-almet-comet flex items-center justify-end">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedRecord(null);
                }}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-almet-sapphire to-almet-astral text-white hover:shadow-lg transition-all text-sm font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeDetailPerformance;