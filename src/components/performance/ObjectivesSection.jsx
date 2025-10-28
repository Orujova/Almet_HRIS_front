import { Target, Plus, Trash2, Save, Send, AlertCircle, CheckCircle, Loader } from 'lucide-react';

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
  onUpdate,
  onAdd,
  onDelete,
  onSaveDraft,
  onSubmit
}) {
  const canAddMore = objectives.length < settings.goalLimits?.max && totalWeight < 100;
  const isValidForSubmit = objectives.length >= settings.goalLimits?.min && totalWeight === 100;

  // Safe number formatting
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

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border shadow-sm overflow-hidden`}>
      {/* Header - Kompakt */}
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
            
            {canEdit && (
              <button
                onClick={onAdd}
                disabled={!canAddMore || loading}
                className="px-3 py-1.5 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral text-xs font-medium disabled:opacity-50 flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      {objectives.length === 0 ? (
        <div className="text-center py-12">
          <Target className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">No objectives created yet</p>
          {canEdit && (
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
                <th className="px-3 py-2 text-left min-w-[180px]">Title</th>
                <th className="px-3 py-2 text-left min-w-[200px]">Description</th>
                <th className="px-3 py-2 text-left min-w-[150px]">Dept. Objective</th>
                <th className="px-3 py-2 text-center w-20">Weight %</th>
                <th className="px-3 py-2 text-center w-20">Progress %</th>
                <th className="px-3 py-2 text-center w-28">End Year Rating</th>
                <th className="px-3 py-2 text-center w-20">Score</th>
                <th className="px-3 py-2 text-center w-24">Status</th>
                {canEdit && <th className="px-3 py-2 text-center w-16">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {objectives.map((objective, index) => (
                <ObjectiveRow
                  key={index}
                  objective={objective}
                  index={index}
                  settings={settings}
                  currentPeriod={currentPeriod}
                  canEdit={canEdit}
                  darkMode={darkMode}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Summary & Actions - Kompakt */}
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
                  {formatNumber(totalScore)} <span className="text-xs text-gray-500">/ {targetScore || 21}</span>
                </div>
                <div className="text-[10px] font-semibold text-gray-600 dark:text-gray-400">
                  {formatNumber(percentage, 0)}% Achievement
                </div>
              </div>
            </div>
          </div>

          {canEdit && (
            <div className="flex gap-2">
              <button
                onClick={onSaveDraft}
                disabled={loading}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-xs font-medium disabled:opacity-50 flex items-center gap-1.5 transition-colors"
              >
                {loading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Draft
              </button>
              
              <button
                onClick={onSubmit}
                disabled={!isValidForSubmit || loading}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Submit
              </button>
              
              {!isValidForSubmit && (
                <div className="flex items-center gap-1.5 px-2.5 py-2 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-lg text-[10px]">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {objectives.length < settings.goalLimits?.min 
                    ? `Add ${settings.goalLimits.min - objectives.length} more`
                    : 'Total weight must be 100%'}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ObjectiveRow({ objective, index, settings, currentPeriod, canEdit, darkMode, onUpdate, onDelete }) {
  const formatNumber = (value, decimals = 2) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(decimals);
  };

  return (
    <tr className={`${darkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'} transition-colors`}>
      <td className="px-3 py-2.5">
        <div className="w-6 h-6 rounded-md bg-almet-mystic dark:bg-almet-cloud-burst/30 text-almet-sapphire dark:text-almet-astral flex items-center justify-center text-xs font-bold">
          {index + 1}
        </div>
      </td>
      <td className="px-3 py-2.5">
        <input
          type="text"
          value={objective.title || ''}
          onChange={(e) => onUpdate(index, 'title', e.target.value)}
          disabled={!canEdit}
          className={`w-full px-2 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-almet-sapphire focus:border-almet-sapphire ${
            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
          } disabled:opacity-50 transition-colors`}
          placeholder="Objective title"
        />
      </td>
      <td className="px-3 py-2.5">
        <textarea
          value={objective.description || ''}
          onChange={(e) => onUpdate(index, 'description', e.target.value)}
          disabled={!canEdit}
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
          disabled={!canEdit}
          className={`w-full px-2 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-almet-sapphire focus:border-almet-sapphire ${
            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
          } disabled:opacity-50 transition-colors`}
        >
          <option value="">-- Select --</option>
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
          disabled={!canEdit}
          className={`w-full px-2 py-1.5 text-xs border rounded-md text-center font-semibold focus:ring-1 focus:ring-almet-sapphire focus:border-almet-sapphire ${
            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
          } disabled:opacity-50 transition-colors`}
        />
      </td>
      <td className="px-3 py-2.5">
        <input
          type="number"
          min="0"
          max="100"
          value={objective.progress || 0}
          onChange={(e) => onUpdate(index, 'progress', parseInt(e.target.value) || 0)}
          disabled={!canEdit}
          className={`w-full px-2 py-1.5 text-xs border rounded-md text-center font-semibold focus:ring-1 focus:ring-almet-sapphire focus:border-almet-sapphire ${
            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
          } disabled:opacity-50 transition-colors`}
        />
      </td>
      <td className="px-3 py-2.5">
        <select
          value={objective.end_year_rating || ''}
          onChange={(e) => onUpdate(index, 'end_year_rating', e.target.value || null)}
          disabled={currentPeriod !== 'END_YEAR_REVIEW' }
          className={`w-full px-2 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-almet-sapphire focus:border-almet-sapphire ${
            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
          } disabled:opacity-50 transition-colors`}
        >
          <option value="">-- Select --</option>
          {settings.evaluationScale?.map(scale => (
            <option key={scale.id} value={scale.id}>{scale.name}</option>
          ))}
        </select>
      </td>
      <td className="px-3 py-2.5">
        <div className={`px-2 py-1.5 text-xs font-bold text-center rounded-md ${
          darkMode ? 'bg-almet-cloud-burst/30 text-almet-astral border border-almet-sapphire/30' : 'bg-almet-mystic text-almet-sapphire border border-almet-sapphire/20'
        }`}>
          {formatNumber(objective.calculated_score)}
        </div>
      </td>
      <td className="px-3 py-2.5">
        <select
          value={objective.status || ''}
          onChange={(e) => onUpdate(index, 'status', e.target.value)}
          disabled={!canEdit}
          className={`w-full px-2 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-almet-sapphire focus:border-almet-sapphire ${
            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
          } disabled:opacity-50 transition-colors`}
        >
          <option value="">-- Status --</option>
          {settings.statusTypes?.map(status => (
            <option key={status.id} value={status.id}>{status.label}</option>
          ))}
        </select>
      </td>
      {canEdit && (
        <td className="px-3 py-2.5 text-center">
          <button
            onClick={() => onDelete(index)}
            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </td>
      )}
    </tr>
  );
}