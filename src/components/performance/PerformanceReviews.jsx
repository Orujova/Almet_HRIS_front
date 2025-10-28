import { useState } from 'react';
import { FileText, User, UserCheck, Edit2, Save, X, Send } from 'lucide-react';

export default function PerformanceReviews({
  midYearEmployee,
  midYearManager,
  endYearEmployee,
  endYearManager,
  currentPeriod,
  canEdit,
  isManager,
  isEmployee,
  performanceData,
  onSaveMidYearDraft,
  onSubmitMidYearEmployee,
  onSubmitMidYearManager,
  onRequestClarification,
  darkMode
}) {
  const [editMode, setEditMode] = useState({ section: null, role: null });
  const [editComment, setEditComment] = useState('');

  const handleStartEdit = (section, role, currentComment) => {
    setEditMode({ section, role });
    setEditComment(currentComment || '');
  };

  const handleCancelEdit = () => {
    setEditMode({ section: null, role: null });
    setEditComment('');
  };

  const handleSaveDraft = async (section, role) => {
    if (section === 'mid_year') {
      await onSaveMidYearDraft(role, editComment);
    }
    // Can add end_year draft save here if needed
    handleCancelEdit();
  };

  const handleSubmit = async (section, role) => {
    if (section === 'mid_year') {
      if (role === 'employee') {
        await onSubmitMidYearEmployee(editComment);
      } else if (role === 'manager') {
        await onSubmitMidYearManager(editComment);
      }
    }
    handleCancelEdit();
  };

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
    managerSubmitted
  }) => {
    const isEditingEmployee = editMode.section === section && editMode.role === 'employee';
    const isEditingManager = editMode.section === section && editMode.role === 'manager';

    return (
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border shadow-sm overflow-hidden`}>
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
            
            {section === 'mid_year' && performanceData?.approval_status === 'NEED_CLARIFICATION' && (
              <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 font-medium">
                Clarification Needed
              </span>
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
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Submitted
                  </span>
                )}
              </div>
              
              {canEditEmployee && !employeeSubmitted && !isEditingEmployee && (
                <button
                  onClick={() => handleStartEdit(section, 'employee', employeeComment)}
                  className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 flex items-center gap-1 transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  {employeeComment ? 'Edit' : 'Add'}
                </button>
              )}
            </div>

            {isEditingEmployee ? (
              <div className="space-y-2">
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  placeholder="Enter your self-review comments..."
                  className={`w-full px-3 py-2 text-xs rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-750 border-gray-600 text-white placeholder-gray-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                  rows={4}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveDraft(section, 'employee')}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center justify-center gap-1 transition-colors"
                  >
                    <Save className="w-3 h-3" />
                    Save Draft
                  </button>
                  <button
                    onClick={() => handleSubmit(section, 'employee')}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-1 transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    Submit
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1.5 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 flex items-center justify-center gap-1 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className={`${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-lg p-3`}>
                {employeeComment ? (
                  <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {employeeComment}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 dark:text-gray-500 italic">
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
                  Manager Comment
                </h4>
                {managerSubmitted && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                    Submitted
                  </span>
                )}
              </div>
              
              {canEditManager && !isEditingManager && (
                <button
                  onClick={() => handleStartEdit(section, 'manager', managerComment)}
                  className="text-xs px-2 py-1 rounded bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:hover:bg-purple-900/50 flex items-center gap-1 transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  {managerComment ? 'Edit' : 'Add'}
                </button>
              )}
            </div>

            {isEditingManager ? (
              <div className="space-y-2">
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  placeholder="Enter your assessment comments..."
                  className={`w-full px-3 py-2 text-xs rounded-lg border ${
                    darkMode 
                      ? 'bg-gray-750 border-gray-600 text-white placeholder-gray-500' 
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  } focus:ring-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                  rows={4}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSaveDraft(section, 'manager')}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 flex items-center justify-center gap-1 transition-colors"
                  >
                    <Save className="w-3 h-3" />
                    Save Draft
                  </button>
                  <button
                    onClick={() => handleSubmit(section, 'manager')}
                    className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-green-600 text-white hover:bg-green-700 flex items-center justify-center gap-1 transition-colors"
                  >
                    <Send className="w-3 h-3" />
                    {section === 'mid_year' ? 'Complete Review' : 'Submit'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-3 py-1.5 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 flex items-center justify-center gap-1 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              <div className={`${darkMode ? 'bg-gray-750 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-lg p-3`}>
                {managerComment ? (
                  <p className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {managerComment}
                  </p>
                ) : (
                  <p className="text-xs text-gray-400 dark:text-gray-500 italic">
                    No comment provided yet
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Determine edit permissions
  const isMidYearPeriod = currentPeriod === 'MID_YEAR_REVIEW' || currentPeriod === 'SEQUENTIAL';
  const isEndYearPeriod = currentPeriod === 'END_YEAR_REVIEW' || currentPeriod === 'SEQUENTIAL';

  const canEditMidYearEmployee = isEmployee && isMidYearPeriod && !performanceData?.mid_year_employee_submitted;
  const canEditMidYearManager = isManager && isMidYearPeriod && 
    performanceData?.mid_year_employee_submitted && !performanceData?.mid_year_completed;

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
        employeeSubmitted={performanceData?.mid_year_employee_submitted}
        managerSubmitted={performanceData?.mid_year_completed}
      />

      <ReviewSection
        title="End-Year Review"
        icon={FileText}
        employeeComment={endYearEmployee}
        managerComment={endYearManager}
        iconBg="bg-green-600"
        section="end_year"
        canEditEmployee={false} // Will implement later
        canEditManager={false} // Will implement later
        employeeSubmitted={performanceData?.end_year_employee_submitted}
        managerSubmitted={performanceData?.end_year_completed}
      />
    </div>
  );
}