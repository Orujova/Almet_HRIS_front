import { Target, Plus, Trash2, Save, Send, AlertCircle, CheckCircle, Loader, XCircle, TrendingUp } from 'lucide-react';

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
  const canCancelGoals = canEdit && isMidYearPeriod;
  const canAddMidYearGoal = canEdit && isMidYearPeriod && canAddMore;
  const canRateEndYear = canEdit && isEndYearPeriod;

  const formatNumber = (value, decimals = 2) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(decimals);
  };

  const getWeightStatus = () => {
    if (totalWeight === 100) return { color: 'emerald', icon: CheckCircle, text: 'Perfect!' };
    if (totalWeight > 100) return { color: 'red', icon: AlertCircle, text: 'Exceeded!' };
    return { color: 'amber', icon: AlertCircle, text: 'Incomplete' };
  };

  const weightStatus = getWeightStatus();

  const getLetterGradeFromScale = (percentage) => {
    if (!settings.evaluationScale || settings.evaluationScale.length === 0) return 'N/A';
    const matchingScale = settings.evaluationScale.find(scale => 
      percentage >= scale.range_min && percentage <= scale.range_max
    );
    return matchingScale ? matchingScale.name : 'N/A';
  };

  const objectivesGrade = getLetterGradeFromScale(percentage || 0);

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
    if (missingStatus) return 'All objectives must have a status';
    if (missingWeight) return 'All objectives must have weight > 0';
    
    return '';
  };

  return (
    <div className={`${darkMode ? 'bg-almet-cloud-burst/60' : 'bg-white'} border ${darkMode ? 'border-almet-comet/30' : 'border-almet-mystic'} rounded-xl overflow-hidden shadow-sm`}>
      <div className={`p-5 border-b ${darkMode ? 'border-almet-comet/30' : 'border-almet-mystic'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-almet-sapphire/10 dark:bg-almet-sapphire/20">
              <Target className="w-5 h-5 text-almet-sapphire" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                Employee Objectives
              </h3>
              <p className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} mt-0.5`}>
                Min: {settings.goalLimits?.min} • Max: {settings.goalLimits?.max} objectives
              </p>
            </div>
          </div>
          
          {(canEditGoals || canAddMidYearGoal) && (
            <button
              onClick={onAdd}
              disabled={!canAddMore || loading}
              className="h-10 px-4 bg-almet-sapphire hover:bg-almet-astral text-white rounded-xl text-sm font-medium disabled:opacity-40 flex items-center gap-2 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              {isMidYearPeriod ? 'Add Replacement' : 'Add Objective'}
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className={`px-3 py-2 rounded-xl flex items-center gap-2 ${
            weightStatus.color === 'emerald' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30' :
            weightStatus.color === 'red' ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30' :
            'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/30'
          }`}>
            <weightStatus.icon className="w-4 h-4" />
            <span className="text-xs font-semibold">{totalWeight}% • {weightStatus.text}</span>
          </div>
          
          {isGoalsSubmitted && (
            <div className="px-3 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-semibold">Submitted</span>
            </div>
          )}
          
          {isGoalsApproved && (
            <div className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span className="text-xs font-semibold">Approved</span>
            </div>
          )}
        </div>
      </div>

      {objectives.length === 0 ? (
        <div className="text-center py-16">
          <Target className="w-16 h-16 mx-auto mb-4 text-almet-waterloo/30" />
          <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai font-medium mb-1">
            No objectives created yet
          </p>
          {canEditGoals && (
            <p className="text-xs text-almet-waterloo/60 dark:text-almet-bali-hai/60">
              Click "Add Objective" to get started
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${darkMode ? 'bg-almet-san-juan/30' : 'bg-almet-mystic/50'}`}>
              <tr className="text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai uppercase tracking-wide">
                <th className="px-4 py-3 text-left w-12">#</th>
                <th className="px-4 py-3 text-left min-w-[200px]">Title</th>
                <th className="px-4 py-3 text-left min-w-[250px]">Description</th>
                <th className="px-4 py-3 text-left min-w-[180px]">Dept. Objective</th>
                <th className="px-4 py-3 text-center w-24">Weight %</th>
                <th className="px-4 py-3 text-center w-24">Progress</th>
                <th className="px-4 py-3 text-center w-32">Rating</th>
                <th className="px-4 py-3 text-center w-24">Score</th>
                <th className="px-4 py-3 text-center w-28">Status</th>
                {(canEditGoals || canCancelGoals) && <th className="px-4 py-3 text-center w-20">Action</th>}
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-almet-comet/20' : 'divide-almet-mystic'}`}>
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
        <div className={`p-5 border-t ${darkMode ? 'border-almet-comet/30' : 'border-almet-mystic'}`}>
          <div className={`p-4 rounded-xl mb-4 ${darkMode ? 'bg-almet-sapphire/10 border border-almet-sapphire/20' : 'bg-almet-sapphire/5 border border-almet-sapphire/10'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`text-sm font-bold mb-1 ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                  Objectives Score Summary
                </h4>
                <p className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'}`}>
                  Based on weighted calculations
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-almet-sapphire">
                    {formatNumber(totalScore || 0)}
                  </span>
                  <span className={`text-sm ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'}`}>
                    / {targetScore || 21}
                  </span>
                </div>
                <div className={`text-xs font-semibold mt-1 ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'}`}>
                  {formatNumber(percentage || 0, 1)}% • Grade: <span className="text-almet-sapphire">{objectivesGrade}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {canSaveDraft && (
              <button
                onClick={() => onSaveDraft(objectives)}
                disabled={loading}
                className={`h-10 px-4 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
                  darkMode 
                    ? 'bg-almet-comet/50 hover:bg-almet-comet text-white' 
                    : 'bg-almet-waterloo/10 hover:bg-almet-waterloo/20 text-almet-cloud-burst'
                } disabled:opacity-40`}
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Draft
              </button>
            )}
            
            {canSubmitGoals && (
              <button
                onClick={() => onSubmit(objectives)}
                disabled={!isValidForSubmit || loading}
                className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-40 transition-all shadow-sm"
              >
                <Send className="w-4 h-4" />
                Submit for Approval
              </button>
            )}
            
            {canSubmitGoals && !isValidForSubmit && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 rounded-xl text-xs font-medium">
                <AlertCircle className="w-4 h-4" />
                {getValidationMessage()}
              </div>
            )}
            
            {isGoalsSubmitted && !isGoalsApproved && (
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-xl text-xs">
                <AlertCircle className="w-4 h-4" />
                Waiting for manager approval
              </div>
            )}
            
            {isGoalsApproved && (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 rounded-xl text-xs">
                <CheckCircle className="w-4 h-4" />
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

  const inputClass = `h-10 px-3 text-xs border rounded-xl focus:outline-none focus:ring-2 focus:ring-almet-sapphire/30 transition-all ${
    darkMode 
      ? 'bg-almet-san-juan/30 border-almet-comet/30 text-white placeholder-almet-bali-hai/50' 
      : 'bg-white border-almet-bali-hai/20 text-almet-cloud-burst placeholder-almet-waterloo/50'
  } disabled:opacity-40`;

  return (
    <tr className={`${darkMode ? 'hover:bg-almet-san-juan/20' : 'hover:bg-almet-mystic/30'} transition-colors ${isCancelled ? 'opacity-50' : ''}`}>
      <td className="px-4 py-3">
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold ${
          isCancelled 
            ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' 
            : 'bg-almet-sapphire/10 text-almet-sapphire dark:bg-almet-sapphire/20'
        }`}>
          {isCancelled ? <XCircle className="w-4 h-4" /> : index + 1}
        </div>
      </td>
      <td className="px-4 py-3">
        <input
          type="text"
          value={objective.title || ''}
          onChange={(e) => onUpdate(index, 'title', e.target.value)}
          disabled={!canEditGoals || isCancelled}
          className={`${inputClass} w-full ${isTitleMissing && canEditGoals ? 'border-red-500 dark:border-red-500' : ''}`}
          placeholder="Objective title..."
        />
      </td>
      <td className="px-4 py-3">
        <textarea
          value={objective.description || ''}
          onChange={(e) => onUpdate(index, 'description', e.target.value)}
          disabled={!canEditGoals || isCancelled}
          rows={2}
          className={`${inputClass} w-full resize-none py-2`}
          placeholder="Description..."
        />
      </td>
      <td className="px-4 py-3">
        <select
          value={objective.linked_department_objective || ''}
          onChange={(e) => onUpdate(index, 'linked_department_objective', e.target.value || null)}
          disabled={!canEditGoals || isCancelled}
          className={`${inputClass} w-full`}
        >
          <option value="">-- Optional --</option>
          {settings.departmentObjectives?.map(dept => (
            <option key={dept.id} value={dept.id}>{dept.title}</option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          min="0"
          max="100"
          value={objective.weight || 0}
          onChange={(e) => onUpdate(index, 'weight', parseFloat(e.target.value) || 0)}
          disabled={!canEditGoals || isCancelled}
          className={`${inputClass} w-full text-center font-semibold ${isWeightMissing && canEditGoals ? 'border-red-500' : ''}`}
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          min="0"
          max="100"
          value={objective.progress || 0}
          onChange={(e) => onUpdate(index, 'progress', parseInt(e.target.value) || 0)}
          disabled={isCancelled}
          className={`${inputClass} w-full text-center font-semibold`}
        />
      </td>
      <td className="px-4 py-3">
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
          className={`${inputClass} w-full`}
        >
          <option value="">-- Select --</option>
          {settings.evaluationScale?.map(scale => (
            <option key={scale.id} value={scale.id}>
              {scale.name} • {scale.value}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <div className={`px-3 py-2 text-xs font-bold text-center rounded-xl ${
          darkMode 
            ? 'bg-almet-sapphire/20 text-almet-sapphire border border-almet-sapphire/30' 
            : 'bg-almet-sapphire/5 text-almet-sapphire border border-almet-sapphire/20'
        }`}>
          {formatNumber(objective.calculated_score || 0)}
        </div>
      </td>
      <td className="px-4 py-3">
        <select
          value={objective.status || ''}
          onChange={(e) => onUpdate(index, 'status', e.target.value ? parseInt(e.target.value) : null)}
          disabled={isCancelled}
          className={`${inputClass} w-full ${isStatusMissing && canEditGoals ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : ''}`}
        >
          <option value="">⚠️ Select Status</option>
          {settings.statusTypes?.map(status => (
            <option key={status.id} value={status.id}>{status.label}</option>
          ))}
        </select>
      </td>
      {(canEditGoals || canCancelGoals) && (
        <td className="px-4 py-3 text-center">
          {canEditGoals && !isCancelled && (
            <button
              onClick={() => onDelete(index)}
              className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {canCancelGoals && !isCancelled && objective.id && (
            <button
              onClick={() => onCancel(objective.id, 'Cancelled during mid-year review')}
              className="p-2 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-xl transition-colors"
              title="Cancel Objective"
            >
              <XCircle className="w-4 h-4" />
            </button>
          )}
          {isCancelled && (
            <span className="text-xs text-red-600 dark:text-red-400 font-medium">Cancelled</span>
          )}
        </td>
      )}
    </tr>
  );
}