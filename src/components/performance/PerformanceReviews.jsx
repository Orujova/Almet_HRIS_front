import { useState } from 'react';
import { FileText, User, UserCheck, Edit2, Save, X, Send, AlertCircle } from 'lucide-react';

export default function PerformanceReviews({
  midYearEmployee,
  midYearManager,
  endYearEmployee,
  endYearManager,
  currentPeriod,
  performanceData,
  permissions,
  onSaveMidYearDraft,
  onSubmitMidYearEmployee,
  onSubmitMidYearManager,
  onRequestClarification,
  darkMode
}) {
  const [editMode, setEditMode] = useState({ section: null, role: null });
  const [editComment, setEditComment] = useState('');
  const [clarificationText, setClarificationText] = useState('');
  const [showClarificationInput, setShowClarificationInput] = useState(false);

  // ✅ PERMISSION CHECKER
  const hasPermission = (permissionCode) => {
    if (permissions?.is_admin) return true;
    if (!Array.isArray(permissions?.permissions)) return false;
    return permissions.permissions.includes(permissionCode);
  };

  // ============================================
  // 🔐 PERMISSION-BASED ACCESS CONTROL
  // ============================================
  
  const isMidYearPeriod = currentPeriod === 'MID_YEAR_REVIEW';
  const isEndYearPeriod = currentPeriod === 'END_YEAR_REVIEW';

  // Role-based permissions
  const canActAsEmployee = hasPermission('performance.approve_as_employee') || 
                           hasPermission('performance.edit_own');
  
  const canActAsManager = hasPermission('performance.approve_as_manager') || 
                          hasPermission('performance.manage_team');

  // Convert backend datetime strings to boolean
  const isEmployeeSubmitted = Boolean(performanceData?.mid_year_employee_submitted);
  const isManagerCompleted = Boolean(performanceData?.mid_year_completed);
  const isEndYearEmployeeSubmitted = Boolean(performanceData?.end_year_employee_submitted);
  const isEndYearCompleted = Boolean(performanceData?.end_year_completed);

  const hasEmployeePermission = hasPermission('performance.midyear.submit_employee');
  const canEditMidYearEmployee = 
    canActAsEmployee &&
    isMidYearPeriod && 
    hasEmployeePermission &&
    !isEmployeeSubmitted;


  const hasManagerPermission = hasPermission('performance.midyear.submit_manager');
  const canEditMidYearManager = 
    canActAsManager &&
    isMidYearPeriod && 
    hasManagerPermission &&
    isEmployeeSubmitted &&
    !isManagerCompleted;

  // CLARIFICATION REQUEST
  const hasClarificationPermission = hasPermission('performance.midyear.request_clarification');
  const isClarificationResolved = Boolean(performanceData?.mid_year_clarification_resolved);
  const showMidYearClarification = 
    canActAsEmployee &&
    hasClarificationPermission &&
    isManagerCompleted &&
    !isClarificationResolved;

  const midYearNeedsClarification = performanceData?.approval_status === 'NEED_CLARIFICATION';

  // END-YEAR PERMISSIONS
  const hasEndYearEmployeePermission = hasPermission('performance.endyear.submit_employee');
  const canEditEndYearEmployee = 
    canActAsEmployee &&
    isEndYearPeriod && 
    hasEndYearEmployeePermission &&
    !isEndYearEmployeeSubmitted;

  const hasEndYearManagerPermission = hasPermission('performance.endyear.submit_manager');
  const canEditEndYearManager = 
    canActAsManager &&
    isEndYearPeriod && 
    hasEndYearManagerPermission &&
    isEndYearEmployeeSubmitted && 
    !isEndYearCompleted;



  // ============================================
  // 🎬 EVENT HANDLERS
  // ============================================

  const handleStartEdit = (section, role, currentComment) => {
    setEditMode({ section, role });
    setEditComment(currentComment || '');
  };

  const handleCancelEdit = () => {
    setEditMode({ section: null, role: null });
    setEditComment('');
  };

  const handleSaveDraft = async (section, role) => {
    if (!editComment.trim()) {
      alert('Please enter a comment before saving');
      return;
    }
    
    if (section === 'mid_year') {
      await onSaveMidYearDraft(role, editComment);
    }
    handleCancelEdit();
  };

  const handleSubmit = async (section, role) => {
    if (!editComment.trim()) {
      alert('Please enter a comment before submitting');
      return;
    }

    if (section === 'mid_year') {
      if (role === 'employee') {
        await onSubmitMidYearEmployee(editComment);
      } else if (role === 'manager') {
        await onSubmitMidYearManager(editComment);
      }
    }
    handleCancelEdit();
  };

  const handleSubmitClarification = async () => {
    if (!clarificationText.trim()) {
      alert('Please enter a clarification message');
      return;
    }
    
    await onRequestClarification(clarificationText);
    setClarificationText('');
    setShowClarificationInput(false);
  };

  // ============================================
  // 🎨 REVIEW SECTION COMPONENT
  // ============================================

  const ReviewSection = ({ 
    title, 
    icon: Icon, 
    employeeComment, 
    managerComment, 
    iconBg,
    section,
    canEditEmployee,
    canEditManager,
    employeeSubmitted,
    managerSubmitted,
    needsClarification,
    showClarificationOption
  }) => {
    const isEditingEmployee = editMode.section === section && editMode.role === 'employee';
    const isEditingManager = editMode.section === section && editMode.role === 'manager';

    return (
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border shadow-sm overflow-hidden`}>
        {/* Header */}
        <div className={`p-4 border-b ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{title}</h3>
                <p className="text-[10px] text-gray-600 dark:text-gray-400">
                  Employee and manager feedback
                </p>
              </div>
            </div>
            
            {needsClarification && (
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                <AlertCircle className="w-3 h-3" />
                <span className="text-xs font-medium">Clarification Needed</span>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* Employee Comment */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-almet-sapphire" />
                <h4 className="text-xs font-semibold text-gray-900 dark:text-white">
                  Employee Comment
                </h4>
                {employeeSubmitted && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">
                    Submitted
                  </span>
                )}
              </div>
              
              {canEditEmployee && !isEditingEmployee && (
                <button
                  onClick={() => handleStartEdit(section, 'employee', employeeComment)}
                  className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 flex items-center gap-1 transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  {employeeComment ? 'Edit' : 'Add Comment'}
                </button>
              )}
            </div>

            {isEditingEmployee ? (
              <div className="space-y-2">
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  placeholder="Share your self-assessment, achievements, and challenges during this period..."
                  className={`w-full px-3 py-2.5 text-sm rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-750 border-gray-600 text-white placeholder-gray-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none`}
                  rows={6}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveDraft(section, 'employee')}
                    className="flex-1 px-3 py-2 text-xs rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center justify-center gap-1.5 transition-colors font-medium"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Draft
                  </button>
                  <button
                    onClick={() => handleSubmit(section, 'employee')}
                    className="flex-1 px-3 py-2 text-xs rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-1.5 transition-colors font-medium"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit Review
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-2 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 flex items-center justify-center transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className={`${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-lg p-3`}>
                {employeeComment ? (
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {employeeComment}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                    No comment provided yet
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Manager Comment */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-purple-600" />
                <h4 className="text-xs font-semibold text-gray-900 dark:text-white">
                  Manager Assessment
                </h4>
                {managerSubmitted && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 font-medium">
                    Completed
                  </span>
                )}
              </div>
              
              {canEditManager && !isEditingManager && (
                <button
                  onClick={() => handleStartEdit(section, 'manager', managerComment)}
                  className="text-xs px-2 py-1 rounded bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50 flex items-center gap-1 transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  {managerComment ? 'Edit' : 'Add Assessment'}
                </button>
              )}
            </div>

            {isEditingManager ? (
              <div className="space-y-2">
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  placeholder="Provide your assessment of employee's performance, strengths, and areas for improvement..."
                  className={`w-full px-3 py-2.5 text-sm rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-750 border-gray-600 text-white placeholder-gray-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  } focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none`}
                  rows={6}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveDraft(section, 'manager')}
                    className="flex-1 px-3 py-2 text-xs rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center justify-center gap-1.5 transition-colors font-medium"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Draft
                  </button>
                  <button
                    onClick={() => handleSubmit(section, 'manager')}
                    className="flex-1 px-3 py-2 text-xs rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-1.5 transition-colors font-medium"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {section === 'mid_year' ? 'Complete Review' : 'Submit Assessment'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-2 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 flex items-center justify-center transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className={`${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-lg p-3`}>
                {managerComment ? (
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {managerComment}
                  </p>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                    {employeeSubmitted ? 'Waiting for manager assessment...' : 'No assessment provided yet'}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Clarification Request */}
          {showClarificationOption && !showClarificationInput && (
            <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={() => setShowClarificationInput(true)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:hover:bg-amber-900/50 flex items-center justify-center gap-1.5 transition-colors font-medium"
              >
                <AlertCircle className="w-3.5 h-3.5" />
                Request Clarification from Manager
              </button>
            </div>
          )}

          {showClarificationInput && (
            <div className={`mt-3 pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} space-y-2`}>
              <textarea
                value={clarificationText}
                onChange={(e) => setClarificationText(e.target.value)}
                placeholder="Explain what clarification you need from your manager..."
                className={`w-full px-3 py-2.5 text-sm rounded-lg border ${
                  darkMode 
                    ? 'bg-gray-750 border-gray-600 text-white placeholder-gray-500' 
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                } focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none`}
                rows={3}
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitClarification}
                  className="flex-1 px-3 py-2 text-xs rounded-lg bg-amber-600 text-white hover:bg-amber-700 flex items-center justify-center gap-1.5 transition-colors font-medium"
                >
                  <Send className="w-3.5 h-3.5" />
                  Send Clarification Request
                </button>
                <button
                  onClick={() => {
                    setShowClarificationInput(false);
                    setClarificationText('');
                  }}
                  className="px-3 py-2 text-xs rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ============================================
  // 🎨 RENDER
  // ============================================

  return (
    <div className="space-y-4">
      <ReviewSection
        title="Mid-Year Review"
        icon={FileText}
        employeeComment={midYearEmployee}
        managerComment={midYearManager}
        iconBg="bg-orange-600"
        section="mid_year"
        canEditEmployee={canEditMidYearEmployee}
        canEditManager={canEditMidYearManager}
        employeeSubmitted={isEmployeeSubmitted}
        managerSubmitted={isManagerCompleted}
        needsClarification={midYearNeedsClarification}
        showClarificationOption={showMidYearClarification}
      />

      <ReviewSection
        title="End-Year Review"
        icon={FileText}
        employeeComment={endYearEmployee}
        managerComment={endYearManager}
        iconBg="bg-green-600"
        section="end_year"
        canEditEmployee={canEditEndYearEmployee}
        canEditManager={canEditEndYearManager}
        employeeSubmitted={isEndYearEmployeeSubmitted}
        managerSubmitted={isEndYearCompleted}
        needsClarification={false}
        showClarificationOption={false}
      />
    </div>
  );
}