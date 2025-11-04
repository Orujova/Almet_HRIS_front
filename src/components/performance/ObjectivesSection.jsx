import { Target, Plus, Trash2, Save, Send, AlertCircle, CheckCircle, Loader, XCircle } from 'lucide-react';
import { useEffect } from 'react';

export default function ObjectivesSection({
  objectives,
  settings,
  currentPeriod,
  canEdit,
  loading,
  darkMode,
  totalWeight,
  totalScore,
  percentage,
  targetScore,
  performanceData,
  onUpdate,
  onAdd,
  onDelete,
  onSaveDraft,
  onSubmit,
  onCancelObjective
}) {



  const activeObjectives = objectives.filter(obj => !obj.is_cancelled);
  const canAddMore = activeObjectives.length < settings.goalLimits?.max && totalWeight < 100;
  
  const isValidForSubmit = activeObjectives.length >= settings.goalLimits?.min && 
                          totalWeight === 100 &&
                          activeObjectives.every(obj => 
                            obj.title?.trim() && 
                            obj.status && 
                            obj.weight > 0
                          );

  const isGoalsSubmitted = performanceData?.objectives_employee_submitted || false;
  const isGoalsApproved = performanceData?.objectives_manager_approved || false;
  
  const isGoalSettingPeriod = currentPeriod === 'GOAL_SETTING';
  const isMidYearPeriod = currentPeriod === 'MID_YEAR_REVIEW';
  const isEndYearPeriod = currentPeriod === 'END_YEAR_REVIEW';
  
  const isNeedClarification = performanceData?.approval_status === 'NEED_CLARIFICATION';
  const canEditGoals = canEdit && isGoalSettingPeriod && (!isGoalsApproved || isNeedClarification);
  
  const canSaveDraft = canEdit && isGoalSettingPeriod && !isGoalsApproved;
  
  const canSubmitGoals = canEdit && isGoalSettingPeriod && !isGoalsSubmitted && isValidForSubmit;
  
  // ✅ FIX #5: Can cancel AND add goals during mid-year
  const canCancelGoals = canEdit && isMidYearPeriod;
  const canAddMidYearGoal = canEdit && isMidYearPeriod && canAddMore;
  
  const canRateEndYear = canEdit && isEndYearPeriod;
  const formatNumber = (value, decimals = 2) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(decimals);
  };

  const getWeightStatus = () => {
    if (totalWeight === 100) return { color: 'green', icon: CheckCircle, text: 'Perfect!' };
    if (totalWeight > 100) return { color: 'red', icon: AlertCircle, text: 'Exceeded!' };
    return { color: 'yellow', icon: AlertCircle, text: 'Incomplete' };
  };

  const weightStatus = getWeightStatus();

  const getLetterGradeFromScale = (percentage) => {
    if (!settings.evaluationScale || settings.evaluationScale.length === 0) {
      return 'N/A';
    }
    
    const matchingScale = settings.evaluationScale.find(scale => 
      percentage >= scale.range_min && percentage <= scale.range_max
    );
    
    return matchingScale ? matchingScale.name : 'N/A';
  };

  const objectivesGrade = getLetterGradeFromScale(percentage || 0);

  useEffect(() => {
    if (objectives && objectives.length > 0) {
      console.log('📊 Objectives loaded:', objectives.length, 'items');
      console.log('📊 Total score:', totalScore, 'Target:', targetScore);
      console.log('📊 Percentage:', percentage, 'Grade:', objectivesGrade);
    }
  }, [objectives, totalScore, percentage]);

  const getValidationMessage = () => {
    if (objectives.length < settings.goalLimits?.min) {
      return `Add ${settings.goalLimits.min - objectives.length} more objective(s)`;
    }
    if (totalWeight !== 100) {
      return 'Total weight must be 100%';
    }
    const missingTitle = objectives.some(obj => !obj.title?.trim());
    const missingStatus = objectives.some(obj => !obj.status);
    const missingWeight = objectives.some(obj => !obj.weight || obj.weight <= 0);
    
    if (missingTitle) return 'All objectives must have a title';
    if (missingStatus) return '⚠️ All objectives must have a status';
    if (missingWeight) return 'All objectives must have weight > 0';
    
    return '';
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border shadow-sm overflow-hidden`}>
      <div className={`p-4 border-b ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-almet-sapphire flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Employee Objectives
              </h3>
              <p className="text-[10px] text-gray-600 dark:text-gray-400">
                Min: {settings.goalLimits?.min} • Max: {settings.goalLimits?.max} objectives
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 ${
              weightStatus.color === 'green' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
              weightStatus.color === 'red' ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
              'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            }`}>
              <weightStatus.icon className="w-3.5 h-3.5" />
              <span className="text-xs font-semibold">{totalWeight}% • {weightStatus.text}</span>
            </div>
            
            {isGoalsSubmitted && (
              <div className="px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">Submitted</span>
              </div>
            )}
            
            {isGoalsApproved && (
              <div className="px-2.5 py-1.5 rounded-lg bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                <span className="text-xs font-semibold">Approved</span>
              </div>
            )}
            
             {(canEditGoals || canAddMidYearGoal) && (
              <button
                onClick={onAdd}
                disabled={!canAddMore || loading}
                className="px-3 py-1.5 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral text-xs font-medium disabled:opacity-50 flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                {isMidYearPeriod ? 'Add Replacement' : 'Add'}
              </button>
            )}
          </div>
        </div>
      </div>

      {objectives.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">No objectives created yet</p>
          {canEditGoals && (
            <p className="text-[10px] text-gray-400 dark:text-gray-500">
              Click "Add" to get started
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${darkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
              <tr className="text-[10px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                <th className="px-3 py-2 text-left w-10">#</th>
                <th className="px-3 py-2 text-left min-w-[180px]">Title *</th>
                <th className="px-3 py-2 text-left min-w-[200px]">Description</th>
                <th className="px-3 py-2 text-left min-w-[150px]">Dept. Objective</th>
                <th className="px-3 py-2 text-center w-20">Weight % *</th>
                <th className="px-3 py-2 text-center w-20">Progress %</th>
                <th className="px-3 py-2 text-center w-28">End Year Rating</th>
                <th className="px-3 py-2 text-center w-20">Score</th>
                <th className="px-3 py-2 text-center w-24">Status *</th>
                {(canEditGoals || canCancelGoals) && <th className="px-3 py-2 text-center w-16">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {objectives.map((objective, index) => (
                <ObjectiveRow
                  key={objective.id || index}
                  objective={objective}
                  index={index}
                  settings={settings}
                  currentPeriod={currentPeriod}
                  canEditGoals={canEditGoals}
                  canCancelGoals={canCancelGoals}
                  canRateEndYear={canRateEndYear}
                  darkMode={darkMode}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onCancel={onCancelObjective}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {objectives.length > 0 && (
        <div className={`p-4 border-t ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-almet-cloud-burst/20 border-almet-sapphire/30' : 'bg-almet-mystic border-almet-sapphire/20'} border mb-3`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-0.5">
                  Objectives Score Summary
                </h4>
                <p className="text-[10px] text-gray-600 dark:text-gray-400">
                  Based on weighted calculations
                </p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-almet-sapphire dark:text-almet-astral">
                  {formatNumber(totalScore || 0)} <span className="text-xs text-gray-500">/ {targetScore || 21}</span>
                </div>
                <div className="text-[10px] font-semibold text-gray-600 dark:text-gray-400">
                  {formatNumber(percentage || 0, 1)}% • Grade: <span className="text-almet-sapphire dark:text-almet-astral font-bold">{objectivesGrade}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            {/* ✅ FIX #3: Only show Save Draft if NOT approved (locked) */}
            {canSaveDraft && (
              <button
                onClick={() => onSaveDraft(objectives)}
                disabled={loading}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-xs font-medium disabled:opacity-50 flex items-center gap-1.5 transition-colors"
              >
                {loading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Draft
              </button>
            )}
            
            {/* ✅ FIX #1: Submit button sends objectives data with submit */}
            {canSubmitGoals && (
              <button
                onClick={() => onSubmit(objectives)}
                disabled={!isValidForSubmit || loading}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Submit for Approval
              </button>
            )}
            
            {canSubmitGoals && !isValidForSubmit && (
              <div className="flex items-center gap-1.5 px-2.5 py-2 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-lg text-[10px] font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {getValidationMessage()}
              </div>
            )}
            
            {isGoalsSubmitted && !isGoalsApproved && (
              <div className="flex items-center gap-1.5 px-2.5 py-2 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg text-[10px]">
                <AlertCircle className="w-3.5 h-3.5" />
                Waiting for employee approval
              </div>
            )}
            
            {isGoalsApproved && (
              <div className="flex items-center gap-1.5 px-2.5 py-2 bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-lg text-[10px]">
                <CheckCircle className="w-3.5 h-3.5" />
                Goals approved - locked for editing
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ObjectiveRow({ 
  objective, 
  index, 
  settings, 
  currentPeriod, 
  canEditGoals, 
  canCancelGoals,
  canRateEndYear,
  darkMode, 
  onUpdate, 
  onDelete,
  onCancel 
}) {
  const formatNumber = (value, decimals = 2) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(decimals);
  };

  const isCancelled = objective.is_cancelled || false;

  const isTitleMissing = !objective.title?.trim();
  const isStatusMissing = !objective.status;
  const isWeightMissing = !objective.weight || objective.weight <= 0;

  return (
    <tr className={`${darkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'} transition-colors ${isCancelled ? 'opacity-50' : ''}`}>
      <td className="px-3 py-2.5">
        <div className={`w-6 h-6 rounded-md ${isCancelled ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-almet-mystic dark:bg-almet-cloud-burst/30 text-almet-sapphire dark:text-almet-astral'} flex items-center justify-center text-xs font-bold`}>
          {isCancelled ? <XCircle className="w-4 h-4" /> : index + 1}
        </div>
      </td>
      <td className="px-3 py-2.5">
        <input
          type="text"
          value={objective.title || ''}
          onChange={(e) => onUpdate(index, 'title', e.target.value)}
          disabled={!canEditGoals || isCancelled}
          className={`w-full px-2 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-almet-sapphire focus:border-almet-sapphire ${
            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
          } ${isTitleMissing && canEditGoals ? 'border-red-500 dark:border-red-500' : ''} disabled:opacity-50 transition-colors`}
          placeholder="Objective title (required)"
        />
      </td>
      <td className="px-3 py-2.5">
        <textarea
          value={objective.description || ''}
          onChange={(e) => onUpdate(index, 'description', e.target.value)}
          disabled={!canEditGoals || isCancelled}
          rows={2}
          className={`w-full px-2 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-almet-sapphire focus:border-almet-sapphire ${
            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
          } disabled:opacity-50 transition-colors resize-none`}
          placeholder="Description..."
        />
      </td>
      <td className="px-3 py-2.5">
        <select
          value={objective.linked_department_objective || ''}
          onChange={(e) => onUpdate(index, 'linked_department_objective', e.target.value || null)}
          disabled={!canEditGoals || isCancelled}
          className={`w-full px-2 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-almet-sapphire focus:border-almet-sapphire ${
            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
          } disabled:opacity-50 transition-colors`}
        >
          <option value="">-- Optional --</option>
          {settings.departmentObjectives?.map(dept => (
            <option key={dept.id} value={dept.id}>{dept.title}</option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2.5">
        <input
          type="number"
          min="0"
          max="100"
          value={objective.weight || 0}
          onChange={(e) => onUpdate(index, 'weight', parseFloat(e.target.value) || 0)}
          disabled={!canEditGoals || isCancelled}
          className={`w-full px-2 py-1.5 text-xs border rounded-md text-center font-semibold focus:ring-1 focus:ring-almet-sapphire focus:border-almet-sapphire ${
            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
          } ${isWeightMissing && canEditGoals ? 'border-red-500 dark:border-red-500' : ''} disabled:opacity-50 transition-colors`}
        />
      </td>
      <td className="px-3 py-2.5">
        <input
          type="number"
          min="0"
          max="100"
          value={objective.progress || 0}
          onChange={(e) => onUpdate(index, 'progress', parseInt(e.target.value) || 0)}
          disabled={isCancelled}
          className={`w-full px-2 py-1.5 text-xs border rounded-md text-center font-semibold focus:ring-1 focus:ring-almet-sapphire focus:border-almet-sapphire ${
            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
          } disabled:opacity-50 transition-colors`}
        />
      </td>
      <td className="px-3 py-2.5">
        <select
          value={objective.end_year_rating || ''}
          onChange={(e) => {
            const selectedScaleId = e.target.value ? parseInt(e.target.value) : null;
            
            if (selectedScaleId) {
              const selectedScale = settings.evaluationScale?.find(s => s.id === selectedScaleId);
              if (selectedScale) {
                const weight = parseFloat(objective.weight) || 0;
                const targetScore = settings.evaluationTargets?.objective_score_target || 21;
                const calculatedScore = (selectedScale.value * weight * targetScore) / (5 * 100);
                
                onUpdate(index, 'end_year_rating', selectedScaleId);
                setTimeout(() => {
                  onUpdate(index, 'calculated_score', calculatedScore);
                }, 0);
              }
            } else {
              onUpdate(index, 'end_year_rating', null);
              setTimeout(() => {
                onUpdate(index, 'calculated_score', 0);
              }, 0);
            }
          }}
          disabled={!canRateEndYear || isCancelled}
          className={`w-full px-2 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-almet-sapphire focus:border-almet-sapphire ${
            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
          } disabled:opacity-50 transition-colors`}
        >
          <option value="">-- Select --</option>
          {settings.evaluationScale?.map(scale => (
            <option key={scale.id} value={scale.id}>
              {scale.name} • Value: {scale.value} • {scale.range_min}-{scale.range_max}%
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2.5">
        <div className={`px-2 py-1.5 text-xs font-bold text-center rounded-md ${
          darkMode ? 'bg-almet-cloud-burst/30 text-almet-astral border border-almet-sapphire/30' : 'bg-almet-mystic text-almet-sapphire border border-almet-sapphire/20'
        }`}>
          {formatNumber(objective.calculated_score || 0)}
        </div>
      </td>
      <td className="px-3 py-2.5">
        <select
          value={objective.status || ''}
          onChange={(e) => onUpdate(index, 'status', e.target.value ? parseInt(e.target.value) : null)}
          disabled={isCancelled}
          className={`w-full px-2 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-almet-sapphire focus:border-almet-sapphire ${
            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
          } ${isStatusMissing && canEditGoals ? 'border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/10' : ''} disabled:opacity-50 transition-colors`}
        >
          <option value="">⚠️ Select Status (Required)</option>
          {settings.statusTypes?.map(status => (
            <option key={status.id} value={status.id}>{status.label}</option>
          ))}
        </select>
      </td>
      {(canEditGoals || canCancelGoals) && (
        <td className="px-3 py-2.5 text-center">
          {canEditGoals && !isCancelled && (
            <button
              onClick={() => onDelete(index)}
              className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          {canCancelGoals && !isCancelled && objective.id && (
            <button
              onClick={() => onCancel(objective.id, 'Cancelled during mid-year review')}
              className="p-1.5 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-md transition-colors"
              title="Cancel Objective"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
          {isCancelled && (
            <span className="text-[10px] text-red-600 dark:text-red-400 font-medium">Cancelled</span>
          )}
        </td>
      )}
    </tr>
  );
}