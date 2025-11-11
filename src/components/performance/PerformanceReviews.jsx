import { useState } from 'react';
import { FileText, User, UserCheck, Edit2, Save, X, Send, MessageSquare, AlertCircle } from 'lucide-react';

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
  darkMode
}) {
  // ✅ FIXED: Separate state for each section and role
  const [editingState, setEditingState] = useState({
    midYear_employee: { isEditing: false, text: '' },
    midYear_manager: { isEditing: false, text: '' },
    endYear_employee: { isEditing: false, text: '' },
    endYear_manager: { isEditing: false, text: '' }
  });

  const hasPermission = (permissionCode) => {
    if (permissions?.is_admin) return true;
    if (!Array.isArray(permissions?.permissions)) return false;
    return permissions.permissions.includes(permissionCode);
  };

  const isMidYearPeriod = currentPeriod === 'MID_YEAR_REVIEW';
  const isEndYearPeriod = currentPeriod === 'END_YEAR_REVIEW';

  const canActAsEmployee = hasPermission('performance.approve_as_employee') || 
                           hasPermission('performance.edit_own');
  
  const canActAsManager = hasPermission('performance.approve_as_manager') || 
                          hasPermission('performance.manage_team');

  const isEmployeeSubmitted = Boolean(performanceData?.mid_year_employee_submitted);
  const isManagerCompleted = Boolean(performanceData?.mid_year_completed);
  
  const isEndYearEmployeeSubmitted = Boolean(performanceData?.end_year_employee_submitted);
  const isEndYearCompleted = Boolean(performanceData?.end_year_completed);

  // ✅ Mid-Year Permissions
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

  // ✅ End-Year Permissions
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

  // ✅ FIXED: Handle edit mode properly
  const handleStartEdit = (section, role, currentComment) => {
    const key = `${section}_${role}`;
    setEditingState(prev => ({
      ...prev,
      [key]: {
        isEditing: true,
        text: currentComment || ''
      }
    }));
  };

  const handleCancelEdit = (section, role) => {
    const key = `${section}_${role}`;
    setEditingState(prev => ({
      ...prev,
      [key]: {
        isEditing: false,
        text: ''
      }
    }));
  };

  const handleTextChange = (section, role, value) => {
    const key = `${section}_${role}`;
    setEditingState(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        text: value
      }
    }));
  };

  const handleSaveDraft = async (section, role) => {
    const key = `${section}_${role}`;
    const text = editingState[key].text;
    
    if (!text.trim()) {
      alert('Please enter a comment before saving');
      return;
    }
    
    if (section === 'midYear') {
      await onSaveMidYearDraft(role, text);
    }
    
    handleCancelEdit(section, role);
  };

  const handleSubmit = async (section, role) => {
    const key = `${section}_${role}`;
    const text = editingState[key].text;
    
    if (!text.trim()) {
      alert('Please enter a comment before submitting');
      return;
    }

    if (section === 'midYear') {
      if (role === 'employee') {
        await onSubmitMidYearEmployee(text);
      } else if (role === 'manager') {
        await onSubmitMidYearManager(text);
      }
    }
    
    handleCancelEdit(section, role);
  };

  const textareaClass = `w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-almet-sapphire/30 resize-none transition-all ${
    darkMode 
      ? 'bg-almet-san-juan/30 border-almet-comet/30 text-white placeholder-almet-bali-hai/50' 
      : 'bg-white border-almet-bali-hai/20 text-almet-cloud-burst placeholder-almet-waterloo/50'
  }`;

  const ReviewSection = ({ 
    title, 
    icon: Icon, 
    employeeComment, 
    managerComment, 
    iconColor,
    section,
    canEditEmployee,
    canEditManager,
    employeeSubmitted,
    managerSubmitted
  }) => {
    const employeeKey = `${section}_employee`;
    const managerKey = `${section}_manager`;
    
    const isEditingEmployee = editingState[employeeKey]?.isEditing;
    const isEditingManager = editingState[managerKey]?.isEditing;
    
    const employeeText = editingState[employeeKey]?.text || '';
    const managerText = editingState[managerKey]?.text || '';

    return (
      <div className={`${darkMode ? 'bg-almet-cloud-burst/60 border-almet-comet/30' : 'bg-white border-almet-mystic'} rounded-xl border shadow-sm overflow-hidden`}>
        <div className={`p-5 border-b ${darkMode ? 'border-almet-comet/30' : 'border-almet-mystic'}`}>
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${iconColor}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                {title}
              </h3>
              <p className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} mt-0.5`}>
                Employee self-review and manager Comment
              </p>
            </div>
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* ✅ EMPLOYEE COMMENT SECTION */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-almet-sapphire" />
                <h4 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                  Employee Self-Review
                </h4>
                {employeeSubmitted && (
                  <span className="text-xs px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30 font-medium">
                    ✓ Submitted
                  </span>
                )}
              </div>
              
              {canEditEmployee && !isEditingEmployee && (
                <button
                  onClick={() => handleStartEdit(section, 'employee', employeeComment)}
                  className="h-9 px-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 flex items-center gap-2 text-xs font-medium transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  {employeeComment ? 'Edit' : 'Add Review'}
                </button>
              )}
            </div>

            {isEditingEmployee ? (
              <div className="space-y-3">
                <textarea
                  value={employeeText}
                  onChange={(e) => handleTextChange(section, 'employee', e.target.value)}
                  placeholder="Share your self-assessment, achievements, challenges, and progress during this period..."
                  className={textareaClass}
                  rows={6}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveDraft(section, 'employee')}
                    className={`flex-1 h-10 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                      darkMode 
                        ? 'bg-almet-comet/50 hover:bg-almet-comet text-white' 
                        : 'bg-almet-waterloo/10 hover:bg-almet-waterloo/20 text-almet-cloud-burst'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    Save Draft
                  </button>
                  <button
                    onClick={() => handleSubmit(section, 'employee')}
                    className="flex-1 h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    Submit Review
                  </button>
                  <button
                    onClick={() => handleCancelEdit(section, 'employee')}
                    className="h-10 px-4 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 rounded-xl flex items-center justify-center transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className={`${darkMode ? 'bg-almet-san-juan/30 border-almet-comet/30' : 'bg-almet-mystic/50 border-almet-bali-hai/10'} border rounded-xl p-4`}>
                {employeeComment ? (
                  <p className={`text-sm ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} whitespace-pre-wrap leading-relaxed`}>
                    {employeeComment}
                  </p>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-almet-waterloo/50" />
                    <p className={`text-sm ${darkMode ? 'text-almet-bali-hai/50' : 'text-almet-waterloo/50'} italic`}>
                      No self-review provided yet
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ✅ MANAGER COMMENT SECTION */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-purple-600" />
                <h4 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                  Manager Comment
                </h4>
                {managerSubmitted && (
                  <span className="text-xs px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30 font-medium">
                    ✓ Completed
                  </span>
                )}
              </div>
              
              {canEditManager && !isEditingManager && (
                <button
                  onClick={() => handleStartEdit(section, 'manager', managerComment)}
                  className="h-9 px-3 rounded-xl bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400 dark:hover:bg-purple-900/30 flex items-center gap-2 text-xs font-medium transition-all"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  {managerComment ? 'Edit' : 'Add Assessment'}
                </button>
              )}
            </div>

            {isEditingManager ? (
              <div className="space-y-3">
                <textarea
                  value={managerText}
                  onChange={(e) => handleTextChange(section, 'manager', e.target.value)}
                  placeholder="Provide your assessment of employee's performance, strengths, areas for improvement, and feedback on their self-review..."
                  className={textareaClass}
                  rows={6}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveDraft(section, 'manager')}
                    className={`flex-1 h-10 px-4 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all ${
                      darkMode 
                        ? 'bg-almet-comet/50 hover:bg-almet-comet text-white' 
                        : 'bg-almet-waterloo/10 hover:bg-almet-waterloo/20 text-almet-cloud-burst'
                    }`}
                  >
                    <Save className="w-4 h-4" />
                    Save Draft
                  </button>
                  <button
                    onClick={() => handleSubmit(section, 'manager')}
                    className="flex-1 h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-sm"
                  >
                    <Send className="w-4 h-4" />
                    {section === 'midYear' ? 'Complete Review' : 'Submit Assessment'}
                  </button>
                  <button
                    onClick={() => handleCancelEdit(section, 'manager')}
                    className="h-10 px-4 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 rounded-xl flex items-center justify-center transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className={`${darkMode ? 'bg-almet-san-juan/30 border-almet-comet/30' : 'bg-almet-mystic/50 border-almet-bali-hai/10'} border rounded-xl p-4`}>
                {managerComment ? (
                  <p className={`text-sm ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} whitespace-pre-wrap leading-relaxed`}>
                    {managerComment}
                  </p>
                ) : (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-almet-waterloo/50" />
                    <p className={`text-sm ${darkMode ? 'text-almet-bali-hai/50' : 'text-almet-waterloo/50'} italic`}>
                      {employeeSubmitted ? 'Waiting for manager Comment...' : 'No Comment provided yet'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* Current Period Info */}
      {(isMidYearPeriod || isEndYearPeriod) && (
        <div className={`${darkMode ? 'bg-blue-900/20 border-blue-800/30' : 'bg-blue-50 border-blue-200'} border rounded-xl p-4`}>
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-1">
                {isMidYearPeriod ? 'Mid-Year Review Period Active' : 'End-Year Review Period Active'}
              </h4>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                {isMidYearPeriod 
                  ? 'Review performance at the halfway point of the year. Employee submits self-review first, then manager completes assessment.'
                  : 'Complete final year-end review. Employee provides final self-assessment, followed by manager\'s final evaluation.'
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mid-Year Review Section */}
      <ReviewSection
        title="Mid-Year Review"
        icon={FileText}
        employeeComment={midYearEmployee}
        managerComment={midYearManager}
        iconColor="bg-orange-500"
        section="midYear"
        canEditEmployee={canEditMidYearEmployee}
        canEditManager={canEditMidYearManager}
        employeeSubmitted={isEmployeeSubmitted}
        managerSubmitted={isManagerCompleted}
      />

      {/* End-Year Review Section */}
      <ReviewSection
        title="End-Year Review"
        icon={FileText}
        employeeComment={endYearEmployee}
        managerComment={endYearManager}
        iconColor="bg-emerald-600"
        section="endYear"
        canEditEmployee={canEditEndYearEmployee}
        canEditManager={canEditEndYearManager}
        employeeSubmitted={isEndYearEmployeeSubmitted}
        managerSubmitted={isEndYearCompleted}
      />
    </div>
  );
}