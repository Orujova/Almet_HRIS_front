'use client'
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Award, Clock, AlertCircle, CheckCircle, FileText, Users,
  AlertTriangle, Calendar, Target, BarChart3, Eye, Download, RefreshCw,
  ChevronDown, ChevronUp, Zap, XCircle, Activity, CheckSquare, MessageSquare, Send
} from 'lucide-react';
import { useTheme } from '@/components/common/ThemeProvider';
import performanceApi from '@/services/performanceService';

export default function EmployeeDetailPerformance({ employeeId, employeeData, isManager = false }) {
  const { darkMode } = useTheme();
  
  // State Management
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

  // Load data on mount
  useEffect(() => {
    if (employeeId) {
      fetchPerformanceRecords();
      fetchMyPermissions();
    }
  }, [employeeId]);

  // ==================== API CALLS ====================
  
  const fetchMyPermissions = async () => {
    try {
      const permissions = await performanceApi.performances.getMyPermissions();
      setMyPermissions(permissions);
    } catch (error) {
      console.error('Error fetching permissions:', error);
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
      const response = await performanceApi.performances.list({ employee: employeeId });
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
      
      const actionMap = {
        'approve_objectives_employee': () => performanceApi.performances.approveObjectivesEmployee(selectedRecord.id),
        'approve_objectives_manager': () => performanceApi.performances.approveObjectivesManager(selectedRecord.id),
        'submit_mid_year_employee': () => performanceApi.performances.submitMidYearEmployee(selectedRecord.id, clarificationComment),
        'submit_mid_year_manager': () => performanceApi.performances.submitMidYearManager(selectedRecord.id, clarificationComment),
        'submit_end_year_employee': () => performanceApi.performances.submitEndYearEmployee(selectedRecord.id, clarificationComment),
        'complete_end_year': () => performanceApi.performances.completeEndYear(selectedRecord.id, clarificationComment),
        'approve_final_employee': () => performanceApi.performances.approveFinalEmployee(selectedRecord.id),
        'approve_final_manager': () => performanceApi.performances.approveFinalManager(selectedRecord.id),
        'request_clarification': () => {
          if (!clarificationComment.trim()) throw new Error('Comment required');
          return performanceApi.performances.requestClarification(selectedRecord.id, clarificationComment, 'OBJECTIVES');
        }
      };

      await actionMap[approvalAction]();
      await fetchPerformanceRecords();
      
      setShowApprovalModal(false);
      setClarificationComment('');
      setSelectedRecord(null);
      setApprovalAction(null);
      
      alert('Action completed successfully!');
    } catch (error) {
      console.error('Error processing action:', error);
      alert(error.response?.data?.message || error.message || 'Failed to process action');
    } finally {
      setActionLoading(false);
    }
  };

  // ==================== HELPER FUNCTIONS ====================

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const getPeriodLabel = (period) => {
    const labels = {
      'GOAL_SETTING': 'Goal Setting',
      'MID_YEAR_REVIEW': 'Mid-Year Review',
      'END_YEAR_REVIEW': 'End-Year Review',
      'COMPLETED': 'Completed',
      'CLOSED': 'Closed'
    };
    return labels[period] || period;
  };

  const getPeriodColor = (period) => {
    const colors = {
      'GOAL_SETTING': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      'MID_YEAR_REVIEW': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      'END_YEAR_REVIEW': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      'COMPLETED': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      'CLOSED': 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
    };
    return colors[period] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const getScoreColor = (score) => {
    if (score >= 4.5) return 'text-green-600 dark:text-green-400';
    if (score >= 3.5) return 'text-blue-600 dark:text-blue-400';
    if (score >= 2.5) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getAvailableActions = (record) => {
    const actions = [];
    if (!record || !myPermissions) return actions;

    const userPermissions = myPermissions?.permissions || [];
    const isEmployee = userPermissions.includes('performance.edit_own') || 
                       userPermissions.includes('performance.approve_as_employee');
    const isLineManager = userPermissions.includes('performance.manage_team') || 
                          userPermissions.includes('performance.approve_as_manager');
    const isAdmin = myPermissions?.is_admin === true;
    const currentPeriod = record.current_period;

    // Goal Setting Period
    if (currentPeriod === 'GOAL_SETTING') {
      if ((isEmployee || isAdmin) && 
          record.objectives_employee_submitted === true &&
          record.objectives_employee_approved === false) {
        actions.push({
          type: 'approve_objectives_employee',
          label: 'Approve Objectives',
          icon: <CheckSquare size={14} />,
          color: 'green'
        });
      }
      
      if ((isLineManager || isAdmin) && 
          record.objectives_employee_approved === true &&
          record.objectives_manager_approved === false) {
        actions.push({
          type: 'approve_objectives_manager',
          label: 'Approve as Manager',
          icon: <CheckSquare size={14} />,
          color: 'green'
        });
      }

      if ((isEmployee || isLineManager || isAdmin) && 
          record.objectives_employee_submitted === true) {
        actions.push({
          type: 'request_clarification',
          label: 'Request Clarification',
          icon: <MessageSquare size={14} />,
          color: 'orange'
        });
      }
    }

    // Mid-Year Period
    if (currentPeriod === 'MID_YEAR_REVIEW') {
      if ((isEmployee || isAdmin) && !record.mid_year_employee_submitted) {
        actions.push({
          type: 'submit_mid_year_employee',
          label: 'Submit Mid-Year Review',
          icon: <Send size={14} />,
          color: 'blue'
        });
      }
      
      if ((isLineManager || isAdmin) && 
          record.mid_year_employee_submitted === true &&
          !record.mid_year_manager_submitted) {
        actions.push({
          type: 'submit_mid_year_manager',
          label: 'Submit Manager Review',
          icon: <Send size={14} />,
          color: 'blue'
        });
      }
    }

    // End-Year Period
    if (currentPeriod === 'END_YEAR_REVIEW') {
      if ((isEmployee || isAdmin) && !record.end_year_employee_submitted) {
        actions.push({
          type: 'submit_end_year_employee',
          label: 'Submit End-Year Review',
          icon: <Send size={14} />,
          color: 'purple'
        });
      }
      
      if ((isLineManager || isAdmin) && 
          record.end_year_employee_submitted === true &&
          record.end_year_completed === false) {
        actions.push({
          type: 'complete_end_year',
          label: 'Complete End-Year',
          icon: <CheckCircle size={14} />,
          color: 'purple'
        });
      }
    }

    // Final Approvals
    if (record.end_year_completed === true && 
        record.final_employee_approved === false && 
        (isEmployee || isAdmin)) {
      actions.push({
        type: 'approve_final_employee',
        label: 'Final Approval (Employee)',
        icon: <CheckSquare size={14} />,
        color: 'green'
      });
    }

    if (record.final_employee_approved === true && 
        record.final_manager_approved === false && 
        (isLineManager || isAdmin)) {
      actions.push({
        type: 'approve_final_manager',
        label: 'Final Approval (Manager)',
        icon: <CheckSquare size={14} />,
        color: 'green'
      });
    }

    return actions;
  };

  const getActionButtonColor = (color) => {
    const colors = {
      green: 'bg-green-600 hover:bg-green-700',
      blue: 'bg-blue-600 hover:bg-blue-700',
      purple: 'bg-purple-600 hover:bg-purple-700',
      orange: 'bg-orange-600 hover:bg-orange-700'
    };
    return `${colors[color] || 'bg-gray-600 hover:bg-gray-700'} text-white transition-all shadow-sm hover:shadow-md`;
  };

  const needsCommentActions = ['submit_mid_year_employee', 'submit_mid_year_manager', 'submit_end_year_employee', 'complete_end_year', 'request_clarification'];

  // ==================== COMPONENTS ====================

  const CollapsibleSection = ({ title, icon, children, sectionKey, badge }) => {
    const isExpanded = expandedSections[sectionKey] ?? true;
    
    return (
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-sm overflow-hidden transition-all`}>
        <button
          onClick={() => toggleSection(sectionKey)}
          className={`w-full px-6 py-4 flex items-center justify-between ${darkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'} transition-all`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
              {React.cloneElement(icon, { className: 'w-5 h-5 text-white' })}
            </div>
            <h3 className={`${darkMode ? 'text-white' : 'text-gray-900'} font-bold text-base`}>{title}</h3>
            {badge && (
              <span className="bg-red-500 text-white text-xs rounded-full px-2.5 py-1 font-bold">
                {badge}
              </span>
            )}
          </div>
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        
        {isExpanded && (
          <div className="px-6 py-5 border-t border-gray-200 dark:border-gray-700">
            {children}
          </div>
        )}
      </div>
    );
  };

  const SummaryCard = ({ icon, label, value, sublabel, color = 'blue' }) => {
    const colorClasses = {
      blue: 'from-blue-500 to-blue-600',
      green: 'from-green-500 to-green-600',
      orange: 'from-orange-500 to-orange-600',
      purple: 'from-purple-500 to-purple-600',
      red: 'from-red-500 to-red-600',
    };

    return (
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border p-5 hover:shadow-lg transition-all`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-3 bg-gradient-to-br ${colorClasses[color]} rounded-xl`}>
            {React.cloneElement(icon, { className: 'w-5 h-5 text-white' })}
          </div>
          <div className="flex-1">
            <h4 className={`text-xs font-semibold ${darkMode ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wide mb-1`}>
              {label}
            </h4>
            <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              {value}
            </p>
          </div>
        </div>
        {sublabel && (
          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{sublabel}</p>
        )}
      </div>
    );
  };

  // ==================== LOADING STATE ====================

  if (loading) {
    return (
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border p-16 text-center`}>
        <RefreshCw className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
        <p className={`${darkMode ? 'text-white' : 'text-gray-900'} text-base font-medium`}>
          Loading performance data...
        </p>
      </div>
    );
  }

  // ==================== DATA EXTRACTION ====================

  const currentPerformance = employeeData?.current_performance;
  const performanceSummary = employeeData?.performance_summary;
  const pendingActions = employeeData?.pending_performance_actions;
  const teamOverview = employeeData?.team_performance_overview;

  // ==================== MAIN RENDER ====================

  return (
    <div className="space-y-6">
      {/* Performance Summary */}
      <CollapsibleSection
        title="Performance Summary"
        icon={<BarChart3 />}
        sectionKey="summary"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <SummaryCard
            icon={<Calendar />}
            label="Current Year"
            value={currentPerformance?.active_year || new Date().getFullYear()}
            sublabel={currentPerformance?.has_current_performance 
              ? `Active - ${performanceRecords.length} record(s)` 
              : currentPerformance?.message || 'No performance record'}
            color={currentPerformance?.has_current_performance ? 'green' : 'orange'}
          />
          
          <SummaryCard
            icon={<FileText />}
            label="Total Records"
            value={performanceSummary?.total_records || performanceRecords.length || 0}
            sublabel={performanceSummary?.has_performance_data || performanceRecords.length > 0
              ? 'Performance data available' 
              : 'No data'}
            color="blue"
          />
          
          <SummaryCard
            icon={<Clock />}
            label="Pending Actions"
            value={pendingActions?.actions?.length || 0}
            sublabel={pendingActions?.has_pending_actions ? 'Action required' : 'No pending actions'}
            color={pendingActions?.has_pending_actions ? 'orange' : 'green'}
          />
          
          <SummaryCard
            icon={<TrendingUp />}
            label="Current Period"
            value={(() => {
              const sources = [
                currentPerformance?.current_period,
                currentPerformance?.performance?.current_period,
                performanceRecords?.[0]?.current_period
              ];
              return getPeriodLabel(sources.find(s => s) || 'N/A');
            })()}
            sublabel={`Year ${currentPerformance?.active_year || 
              currentPerformance?.performance?.year || 
              performanceRecords?.[0]?.year ||
              new Date().getFullYear()}`}
            color="purple"
          />
        </div>
      </CollapsibleSection>

      {/* Performance History */}
      <CollapsibleSection
        title="Performance History"
        icon={<FileText />}
        sectionKey="history"
      >
        {performanceRecords.length > 0 ? (
          <div className="space-y-4">
            {performanceRecords.map((record) => {
              const availableActions = getAvailableActions(record);
              
              return (
                <div 
                  key={record.id} 
                  className={`${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'} 
                    rounded-xl border p-5 hover:shadow-md transition-all`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="p-2.5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                          <Award size={18} className="text-white" />
                        </div>
                        <div>
                          <h5 className={`${darkMode ? 'text-white' : 'text-gray-900'} font-bold text-base`}>
                            Performance Year {record.year}
                          </h5>
                          <span className={`text-xs px-3 py-1 rounded-full mt-1 inline-block font-medium ${getPeriodColor(record.current_period)}`}>
                            {getPeriodLabel(record.current_period)}
                          </span>
                        </div>
                      </div>

                      {/* Scores */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        {record.total_objectives_score !== null && (
                          <div>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Objectives</p>
                            <p className={`text-xl font-bold ${getScoreColor(parseFloat(record.total_objectives_score))}`}>
                              {parseFloat(record.total_objectives_score).toFixed(2)}
                            </p>
                          </div>
                        )}
                        {record.total_competencies_actual_score !== null && (
                          <div>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Competencies</p>
                            <p className={`text-xl font-bold ${getScoreColor(record.total_competencies_actual_score)}`}>
                              {record.total_competencies_actual_score}
                            </p>
                          </div>
                        )}
                        {record.overall_weighted_percentage !== null && (
                          <div>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Overall %</p>
                            <p className={`text-xl font-bold ${getScoreColor(parseFloat(record.overall_weighted_percentage) / 20)}`}>
                              {parseFloat(record.overall_weighted_percentage).toFixed(1)}%
                            </p>
                          </div>
                        )}
                        {record.final_rating && (
                          <div>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Rating</p>
                            <p className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {record.final_rating}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {availableActions.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          {availableActions.map((action, idx) => (
                            <button
                              key={idx}
                              onClick={() => openApprovalModal(record, action.type)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${getActionButtonColor(action.color)}`}
                            >
                              {action.icon}
                              {action.label}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className={`flex items-center gap-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        <Calendar size={12} />
                        <span>Updated: {formatDate(record.updated_at)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => handleViewDetails(record.id)}
                        className="p-2.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        onClick={() => handleDownloadExcel(record.id)}
                        className="p-2.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
                        title="Download Excel"
                      >
                        <Download size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className={`w-20 h-20 mx-auto mb-4 ${darkMode ? 'bg-gray-750' : 'bg-gray-100'} rounded-2xl flex items-center justify-center`}>
              <FileText className={`h-10 w-10 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
            </div>
            <h4 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
              No Performance Records
            </h4>
            <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
              {currentPerformance?.can_initialize ? 
                'Ready to initialize performance record for this year' :
                'No performance records found for this employee'}
            </p>
          </div>
        )}
      </CollapsibleSection>

      {/* Team Overview (for managers) */}
      {isManager && teamOverview && (
        <CollapsibleSection
          title="Team Performance Overview"
          icon={<Users />}
          sectionKey="team"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Team Size', value: teamOverview.team_size, color: 'blue' },
                { label: 'Initiated', value: teamOverview.performance_initiated, color: 'green' },
                { label: 'Not Initiated', value: teamOverview.not_initiated, color: 'orange' },
                { label: 'Submitted', value: teamOverview.objectives_submitted, color: 'blue' }
              ].map((stat, idx) => (
                <div key={idx} className={`${darkMode ? 'bg-gray-750' : 'bg-gray-50'} rounded-xl p-4 text-center border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                  <p className={`text-3xl font-bold text-${stat.color}-600 mb-1`}>{stat.value}</p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{stat.label}</p>
                </div>
              ))}
            </div>

            {teamOverview.needs_attention_count > 0 && (
              <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={18} className="text-orange-600" />
                  <span className="text-sm font-semibold text-orange-700 dark:text-orange-300">
                    {teamOverview.needs_attention_count} team member(s) need attention
                  </span>
                </div>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* MODALS */}
      {showApprovalModal && selectedRecord && (
        <ApprovalModal
          darkMode={darkMode}
          selectedRecord={selectedRecord}
          approvalAction={approvalAction}
          clarificationComment={clarificationComment}
          setClarificationComment={setClarificationComment}
          actionLoading={actionLoading}
          needsCommentActions={needsCommentActions}
          getPeriodLabel={getPeriodLabel}
          getPeriodColor={getPeriodColor}
          onClose={() => {
            setShowApprovalModal(false);
            setClarificationComment('');
            setSelectedRecord(null);
            setApprovalAction(null);
          }}
          onConfirm={handleApprovalAction}
        />
      )}

      {showDetailModal && selectedRecord && (
        <DetailModal
          darkMode={darkMode}
          selectedRecord={selectedRecord}
          formatDate={formatDate}
          getPeriodLabel={getPeriodLabel}
          getPeriodColor={getPeriodColor}
          getScoreColor={getScoreColor}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedRecord(null);
          }}
        />
      )}
    </div>
  );
}

// ==================== APPROVAL MODAL COMPONENT ====================

function ApprovalModal({ 
  darkMode, selectedRecord, approvalAction, clarificationComment, 
  setClarificationComment, actionLoading, needsCommentActions,
  getPeriodLabel, getPeriodColor, onClose, onConfirm 
}) {
  const actionTitles = {
    'approve_objectives_employee': 'Approve Objectives (Employee)',
    'approve_objectives_manager': 'Approve Objectives (Manager)',
    'submit_mid_year_employee': 'Submit Mid-Year Review',
    'submit_mid_year_manager': 'Submit Manager Mid-Year Review',
    'submit_end_year_employee': 'Submit End-Year Review',
    'complete_end_year': 'Complete End-Year Review',
    'approve_final_employee': 'Final Approval (Employee)',
    'approve_final_manager': 'Final Approval (Manager)',
    'request_clarification': 'Request Clarification'
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl w-full max-w-lg border shadow-2xl overflow-hidden`}>
        {/* Header */}
        <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            {actionTitles[approvalAction]}
          </h3>
          <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
            Performance Year {selectedRecord.year}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Record Summary */}
          <div className={`p-4 ${darkMode ? 'bg-gray-750' : 'bg-gray-50'} rounded-xl space-y-3`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Employee</span>
              <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                {selectedRecord.employee_name}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Period</span>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${getPeriodColor(selectedRecord.current_period)}`}>
                {getPeriodLabel(selectedRecord.current_period)}
              </span>
            </div>
            {selectedRecord.objectives_count > 0 && (
              <div className="flex items-center justify-between">
                <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Objectives</span>
                <span className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedRecord.objectives_count}
                </span>
              </div>
            )}
          </div>

          {/* Comment Input */}
          {needsCommentActions.includes(approvalAction) && (
            <div>
              <label className={`block text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                {approvalAction === 'request_clarification' ? 'Clarification Request *' : 'Comment'}
              </label>
              <textarea
                value={clarificationComment}
                onChange={(e) => setClarificationComment(e.target.value)}
                placeholder={approvalAction === 'request_clarification' 
                  ? 'Explain what needs clarification...'
                  : 'Add your comments (optional)...'}
                rows={4}
                required={approvalAction === 'request_clarification'}
                className={`w-full px-4 py-3 rounded-xl border ${darkMode ? 'bg-gray-750 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} 
                  text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all`}
              />
              {approvalAction === 'request_clarification' && (
                <p className="text-xs text-orange-600 mt-1">* Required field</p>
              )}
            </div>
          )}

          {/* Warning Messages */}
          {approvalAction === 'approve_final_manager' && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-yellow-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  This is the final approval step. Once approved, the performance review will be published and cannot be modified.
                </p>
              </div>
            </div>
          )}

          {approvalAction === 'complete_end_year' && (
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-purple-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-purple-700 dark:text-purple-300">
                  Completing the end-year review will finalize all scores and send them for final approval.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 ${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'} border-t flex items-center justify-end gap-3`}>
          <button
            onClick={onClose}
            disabled={actionLoading}
            className={`px-5 py-2.5 rounded-xl border ${darkMode ? 'border-gray-700 text-white hover:bg-gray-700' : 'border-gray-300 text-gray-900 hover:bg-gray-100'} 
              transition-colors text-sm font-medium disabled:opacity-50`}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={actionLoading || (approvalAction === 'request_clarification' && !clarificationComment.trim())}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 
              transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
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
  );
}

// ==================== DETAIL MODAL COMPONENT ====================

function DetailModal({ 
  darkMode, selectedRecord, formatDate, getPeriodLabel, 
  getPeriodColor, getScoreColor, onClose 
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl w-full max-w-5xl border shadow-2xl my-8`}>
        {/* Header */}
        <div className={`px-6 py-5 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
          <div>
            <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Performance Details - {selectedRecord.year}
            </h3>
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
              {selectedRecord.employee_name} • {selectedRecord.employee_job_title}
            </p>
          </div>
          <button
            onClick={onClose}
            className={`p-2 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} rounded-xl transition-colors`}
          >
            <XCircle size={24} className={darkMode ? 'text-gray-400' : 'text-gray-600'} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Current Status */}
          <div>
            <h4 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center gap-2`}>
              <Activity size={18} className="text-blue-600" />
              Current Status
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 ${darkMode ? 'bg-gray-750' : 'bg-gray-50'} rounded-xl`}>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Period</p>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${getPeriodColor(selectedRecord.current_period)}`}>
                  {getPeriodLabel(selectedRecord.current_period)}
                </span>
              </div>
              <div className={`p-4 ${darkMode ? 'bg-gray-750' : 'bg-gray-50'} rounded-xl`}>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Approval Status</p>
                <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {selectedRecord.approval_status || 'Pending'}
                </p>
              </div>
              <div className={`p-4 ${darkMode ? 'bg-gray-750' : 'bg-gray-50'} rounded-xl`}>
                <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Last Updated</p>
                <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {formatDate(selectedRecord.updated_at)}
                </p>
              </div>
            </div>
          </div>

          {/* Objectives */}
          {selectedRecord.objectives && selectedRecord.objectives.length > 0 && (
            <div>
              <h4 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center gap-2`}>
                <Target size={18} className="text-blue-600" />
                Objectives ({selectedRecord.objectives.length})
              </h4>
              <div className="space-y-3">
                {selectedRecord.objectives.map((objective) => (
                  <div key={objective.id} className={`p-5 ${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-xl border`}>
                    <div className="flex items-start justify-between mb-3">
                      <h5 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'} flex-1`}>
                        {objective.title}
                      </h5>
                      <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ml-3 ${
                        objective.is_cancelled 
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      }`}>
                        {objective.is_cancelled ? 'Cancelled' : objective.status_label || 'Active'}
                      </span>
                    </div>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
                      {objective.description}
                    </p>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Weight</p>
                        <p className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {objective.weight}%
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Progress</p>
                        <p className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {objective.progress}%
                        </p>
                      </div>
                      {objective.calculated_score !== null && (
                        <div>
                          <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Score</p>
                          <p className={`text-base font-bold ${getScoreColor(objective.calculated_score)}`}>
                            {objective.calculated_score.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                    {objective.end_year_rating_name && (
                      <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          End-Year Rating: 
                        </span>
                        <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'} ml-2`}>
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
              <h4 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center gap-2`}>
                <Award size={18} className="text-purple-600" />
                Behavioral Competencies ({selectedRecord.competency_ratings.length})
              </h4>
              <div className="space-y-3">
                {selectedRecord.competency_ratings.map((competency) => (
                  <div key={competency.id} className={`p-5 ${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-xl border`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h5 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {competency.competency_name}
                        </h5>
                        {competency.competency_group && (
                          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {competency.competency_group}
                          </span>
                        )}
                      </div>
                      {competency.gap_status && (
                        <span className={`text-xs px-2.5 py-1 rounded-lg font-medium ml-3 ${
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
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Required</p>
                        <p className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {competency.required_level}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Actual</p>
                        <p className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {competency.actual_value}
                        </p>
                      </div>
                      <div>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>Gap</p>
                        <p className={`text-base font-bold ${competency.gap > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                          {competency.gap > 0 ? `+${competency.gap}` : competency.gap}
                        </p>
                      </div>
                    </div>
                    {competency.notes && (
                      <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {competency.notes}
                        </p>
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
              <h4 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center gap-2`}>
                <BarChart3 size={18} className="text-green-600" />
                Final Scores
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {selectedRecord.total_objectives_score && (
                  <div className={`p-4 ${darkMode ? 'bg-gray-750' : 'bg-gray-50'} rounded-xl text-center`}>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Objectives</p>
                    <p className={`text-2xl font-bold ${getScoreColor(parseFloat(selectedRecord.total_objectives_score))}`}>
                      {parseFloat(selectedRecord.total_objectives_score).toFixed(2)}
                    </p>
                  </div>
                )}
                {selectedRecord.competencies_percentage && (
                  <div className={`p-4 ${darkMode ? 'bg-gray-750' : 'bg-gray-50'} rounded-xl text-center`}>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Competencies</p>
                    <p className={`text-2xl font-bold ${getScoreColor(parseFloat(selectedRecord.competencies_percentage) / 20)}`}>
                      {parseFloat(selectedRecord.competencies_percentage).toFixed(1)}%
                    </p>
                  </div>
                )}
                {selectedRecord.overall_weighted_percentage && (
                  <div className={`p-4 ${darkMode ? 'bg-gray-750' : 'bg-gray-50'} rounded-xl text-center`}>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Overall</p>
                    <p className={`text-2xl font-bold ${getScoreColor(parseFloat(selectedRecord.overall_weighted_percentage) / 20)}`}>
                      {parseFloat(selectedRecord.overall_weighted_percentage).toFixed(1)}%
                    </p>
                  </div>
                )}
                {selectedRecord.final_rating && (
                  <div className={`p-4 ${darkMode ? 'bg-gray-750' : 'bg-gray-50'} rounded-xl text-center`}>
                    <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>Rating</p>
                    <p className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
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
              <h4 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-gray-900'} mb-4 flex items-center gap-2`}>
                <Zap size={18} className="text-orange-600" />
                Development Needs ({selectedRecord.development_needs.length})
              </h4>
              <div className="space-y-3">
                {selectedRecord.development_needs.map((need) => (
                  <div key={need.id} className={`p-5 ${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'} rounded-xl border`}>
                    <div className="mb-3">
                      <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Gap Area: 
                      </span>
                      <span className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-gray-900'} ml-2`}>
                        {need.competency_gap}
                      </span>
                    </div>
                    <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-3`}>
                      <span className="font-semibold">Development Activity:</span> {need.development_activity}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Progress</span>
                        <span className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {need.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all"
                          style={{ width: `${need.progress}%` }}
                        />
                      </div>
                      {need.comment && (
                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'} mt-2`}>
                          {need.comment}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 ${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'} border-t flex items-center justify-end`}>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 
              transition-all text-sm font-semibold shadow-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}