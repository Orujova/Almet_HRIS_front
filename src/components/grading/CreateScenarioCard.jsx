// src/components/grading/CreateScenarioCard.jsx - Dark mode düzəldilmiş
import React from "react";
import { Plus, Target, Settings, CheckCircle, AlertTriangle, RefreshCw, Save } from "lucide-react";

const CreateScenarioCard = ({
  scenarioInputs,
  newScenarioDisplayData,
  basePositionName,
  validationSummary,
  errors,
  loading,
  isCalculating,
  handleBaseValueChange,
  handleVerticalChange,
  handleGlobalHorizontalChange,
  handleSaveDraft
}) => {
  const formatCurrency = (value) => {
    const numValue = value || 0;
    return numValue.toLocaleString();
  };

  const safeValue = (value, defaultValue = 0) => {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic dark:border-gray-700">
      {/* Simplified Header */}
      <div className="px-4 py-3 border-b border-almet-mystic dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Plus size={16} className="text-green-600 dark:text-green-400" />
          <h3 className="text-sm font-medium text-almet-cloud-burst dark:text-white">
            Create New Scenario
          </h3>
          {isCalculating && (
            <RefreshCw size={12} className="animate-spin text-almet-sapphire dark:text-almet-sapphire ml-auto" />
          )}
        </div>
      </div>
      
      <div className="p-4 space-y-4">
        {/* Base Value Input - Compact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-almet-cloud-burst dark:text-white mb-2">
              <Target size={12} className="text-almet-sapphire dark:text-almet-sapphire" />
              Base Value ({basePositionName})
            </label>
            <input
              type="number"
              value={scenarioInputs.baseValue1 || ''}
              onChange={(e) => handleBaseValueChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-almet-sapphire dark:focus:ring-almet-sapphire ${
                errors.baseValue1 ? "border-red-300 bg-red-50 dark:bg-red-900/10 dark:border-red-600" : "border-almet-mystic dark:border-gray-600"
              }`}
              placeholder="Enter base salary"
            />
            {errors.baseValue1 && (
              <p className="text-red-500 dark:text-red-400 text-xs mt-1 flex items-center gap-1">
                <AlertTriangle size={10} />
                {errors.baseValue1}
              </p>
            )}
          </div>

          {/* Save Button - Moved to top for better UX */}
          <div className="flex items-end">
            <button
              onClick={handleSaveDraft}
              disabled={!validationSummary?.canSave || loading.saving}
              className={`w-full px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
                validationSummary?.canSave && !loading.saving
                  ? "bg-almet-sapphire dark:bg-almet-sapphire text-white hover:bg-almet-astral dark:hover:bg-almet-astral"
                  : "bg-almet-mystic dark:bg-gray-600 text-almet-waterloo dark:text-gray-400 cursor-not-allowed"
              }`}
            >
              {loading.saving ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save Draft
                </>
              )}
            </button>
          </div>
        </div>

        {/* Global Horizontal Intervals - Compact */}
        <div className="bg-almet-mystic/30 dark:bg-gray-700/30 rounded-lg p-3">
          <h4 className="text-xs font-medium text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
            <Settings size={12} className="text-almet-sapphire dark:text-almet-sapphire" />
            Global Horizontal Intervals
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['LD_to_LQ', 'LQ_to_M', 'M_to_UQ', 'UQ_to_UD'].map((intervalKey) => {
              const displayName = intervalKey.replace(/_to_/g, '→').replace(/_/g, ' ');
              const errorKey = `global-horizontal-${intervalKey}`;
              
              return (
                <div key={intervalKey}>
                  <label className="block text-xs font-medium text-almet-waterloo dark:text-gray-300 mb-1">
                    {displayName}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={scenarioInputs.globalHorizontalIntervals?.[intervalKey] || ''}
                      onChange={(e) => handleGlobalHorizontalChange(intervalKey, e.target.value)}
                      className={`w-full px-2 py-1 text-xs border rounded text-center dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-almet-sapphire dark:focus:ring-almet-sapphire ${
                        errors[errorKey] ? "border-red-300 dark:border-red-600" : "border-almet-mystic dark:border-gray-600"
                      }`}
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs text-almet-waterloo dark:text-gray-400">%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Position Table - Compact */}
        {newScenarioDisplayData && (
          <div className="bg-almet-mystic/30 dark:bg-gray-700/30 rounded-lg p-3">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-medium text-almet-cloud-burst dark:text-white">
                Real-time Results
              </h4>
              {newScenarioDisplayData.calculationProgress && (
                <div className="text-xs text-almet-waterloo dark:text-gray-300">
                  {newScenarioDisplayData.calculationProgress.calculatedPositions}/
                  {newScenarioDisplayData.calculationProgress.totalPositions}
                </div>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-almet-mystic dark:border-gray-600">
                    <th className="text-left py-2 px-2 text-xs font-medium text-almet-waterloo dark:text-gray-300">Grade</th>
                    <th className="text-center py-2 px-2 text-xs font-medium text-almet-waterloo dark:text-gray-300">Vertical %</th>
                    <th className="text-center py-2 px-2 text-xs font-medium text-almet-waterloo dark:text-gray-300">Status</th>
                    <th className="text-right py-2 px-2 text-xs font-medium text-almet-waterloo dark:text-gray-300">LD</th>
                    <th className="text-right py-2 px-2 text-xs font-medium text-almet-waterloo dark:text-gray-300">LQ</th>
                    <th className="text-right py-2 px-2 text-xs font-medium text-almet-waterloo dark:text-gray-300">Median</th>
                    <th className="text-right py-2 px-2 text-xs font-medium text-almet-waterloo dark:text-gray-300">UQ</th>
                    <th className="text-right py-2 px-2 text-xs font-medium text-almet-waterloo dark:text-gray-300">UD</th>
                  </tr>
                </thead>
                <tbody>
                  {newScenarioDisplayData.gradeOrder.map((gradeName, index) => {
                    const gradeData = newScenarioDisplayData.grades[gradeName] || {};
                    const isBasePosition = gradeName === basePositionName;
                    const isTopPosition = index === 0;
                    const errorKey = `vertical-${gradeName}`;
                    
                    const ldValue = isBasePosition && scenarioInputs.baseValue1 > 0 
                      ? Math.round(parseFloat(scenarioInputs.baseValue1)) 
                      : safeValue(gradeData.LD);

                    return (
                      <tr 
                        key={gradeName} 
                        className={`border-b border-almet-mystic/30 dark:border-gray-600/30 hover:bg-white/50 dark:hover:bg-gray-700/50 ${
                          isBasePosition ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                        }`}
                      >
                        <td className="py-2 px-2 text-xs">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              isTopPosition ? 'bg-red-500' : isBasePosition ? 'bg-almet-sapphire' : 'bg-almet-waterloo dark:bg-gray-500'
                            }`} />
                            <span className="font-medium text-almet-cloud-burst dark:text-white">{gradeName}</span>
                            {isBasePosition && <Target size={8} className="text-almet-sapphire dark:text-almet-sapphire" />}
                          </div>
                        </td>
                        
                        <td className="py-2 px-2 text-center">
                          {!isBasePosition ? (
                            <div className="relative">
                              <input
                                type="number"
                                value={gradeData.vertical || ''}
                                onChange={(e) => handleVerticalChange(gradeName, e.target.value)}
                                className={`w-16 px-1 py-1 text-xs border rounded text-center dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-almet-sapphire dark:focus:ring-almet-sapphire ${
                                  errors[errorKey] ? "border-red-300 dark:border-red-600" : "border-almet-mystic dark:border-gray-600"
                                }`}
                                placeholder="0"
                                min="0"
                                max="100"
                                step="0.1"
                              />
                              <span className="absolute right-0 top-1/2 transform -translate-y-1/2 text-xs text-almet-waterloo dark:text-gray-400">%</span>
                            </div>
                          ) : (
                            <span className="text-xs text-almet-waterloo dark:text-gray-400 italic">Base</span>
                          )}
                        </td>
                        
                        <td className="py-2 px-2 text-center">
                          {gradeData.isCalculated ? (
                            <CheckCircle size={10} className="text-green-500 dark:text-green-400 mx-auto" />
                          ) : isBasePosition && scenarioInputs.baseValue1 > 0 ? (
                            <Target size={10} className="text-almet-sapphire dark:text-almet-sapphire mx-auto" />
                          ) : (
                            <div className="w-2 h-2 bg-almet-waterloo dark:bg-gray-500 rounded-full mx-auto"></div>
                          )}
                        </td>
                        
                        {/* Calculated Values */}
                        <td className="py-2 px-2 text-xs text-right font-mono">
                          {ldValue > 0 ? (
                            <span className={`${
                              isBasePosition ? "font-semibold text-almet-sapphire dark:text-almet-sapphire" : 
                              gradeData.isCalculated ? "text-green-600 dark:text-green-400" : "text-almet-waterloo dark:text-gray-400"
                            }`}>
                              {formatCurrency(ldValue)}
                              {isBasePosition && scenarioInputs.baseValue1 > 0 && !gradeData.isCalculated && (
                                <span className="ml-1 text-xs text-almet-sapphire dark:text-almet-sapphire">(Input)</span>
                              )}
                            </span>
                          ) : (
                            <span className="text-almet-waterloo dark:text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-2 px-2 text-xs text-right font-mono">
                          <span className={gradeData.LQ && gradeData.LQ !== "" ? "text-green-600 dark:text-green-400" : "text-almet-waterloo dark:text-gray-400"}>
                            {gradeData.LQ && gradeData.LQ !== "" ? formatCurrency(gradeData.LQ) : "-"}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-xs text-right font-mono font-semibold">
                          <span className={gradeData.M && gradeData.M !== "" ? "text-green-600 dark:text-green-400" : "text-almet-waterloo dark:text-gray-400"}>
                            {gradeData.M && gradeData.M !== "" ? formatCurrency(gradeData.M) : "-"}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-xs text-right font-mono">
                          <span className={gradeData.UQ && gradeData.UQ !== "" ? "text-green-600 dark:text-green-400" : "text-almet-waterloo dark:text-gray-400"}>
                            {gradeData.UQ && gradeData.UQ !== "" ? formatCurrency(gradeData.UQ) : "-"}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-xs text-right font-mono">
                          <span className={gradeData.UD && gradeData.UD !== "" ? "text-green-600 dark:text-green-400" : "text-almet-waterloo dark:text-gray-400"}>
                            {gradeData.UD && gradeData.UD !== "" ? formatCurrency(gradeData.UD) : "-"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateScenarioCard;