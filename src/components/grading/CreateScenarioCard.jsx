import React from "react";
import { Plus, Target, Settings, Activity, CheckCircle, AlertTriangle, RefreshCw, Save } from "lucide-react";

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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
            <Plus size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-almet-cloud-burst dark:text-white">
              Create New Scenario
            </h2>
            <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai">
              Design and test new compensation structures
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Base Value Input */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm font-semibold text-almet-cloud-burst dark:text-white">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Target size={12} className="text-blue-600" />
            </div>
            Base Value ({basePositionName} LD)
          </label>
          <div className="max-w-md">
            <input
              type="number"
              value={scenarioInputs.baseValue1 || ''}
              onChange={(e) => handleBaseValueChange(e.target.value)}
              className={`w-full px-4 py-3 border rounded-xl text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-sapphire focus:border-transparent transition-all ${
                errors.baseValue1 ? "border-red-500 bg-red-50 dark:bg-red-900/10" : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder={`Enter base salary for ${basePositionName}`}
              min="1"
              step="1"
            />
            {errors.baseValue1 && (
              <p className="text-red-500 text-xs mt-2 flex items-center gap-1">
                <AlertTriangle size={12} />
                {errors.baseValue1}
              </p>
            )}
          </div>
        </div>

        {/* Global Horizontal Intervals */}
        <div className="border border-indigo-200 dark:border-indigo-800 rounded-xl p-5 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20">
          <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white mb-4 flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
              <Settings size={12} className="text-indigo-600" />
            </div>
            Global Horizontal Intervals 
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {['LD_to_LQ', 'LQ_to_M', 'M_to_UQ', 'UQ_to_UD'].map((intervalKey) => {
              const displayName = intervalKey.replace(/_to_/g, ' → ').replace(/_/g, ' ');
              const errorKey = `global-horizontal-${intervalKey}`;
              
              return (
                <div key={intervalKey} className="space-y-2">
                  <label className="block text-xs font-medium text-almet-cloud-burst dark:text-white">
                    {displayName}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={scenarioInputs.globalHorizontalIntervals?.[intervalKey] || ''}
                      onChange={(e) => handleGlobalHorizontalChange(intervalKey, e.target.value)}
                      className={`w-full px-3 py-2 text-sm border rounded-lg text-center dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-sapphire transition-all ${
                        errors[errorKey] ? "border-red-500 bg-red-50 dark:bg-red-900/10" : "border-gray-300 dark:border-gray-600"
                      }`}
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">%</span>
                  </div>
                  {errors[errorKey] && (
                    <p className="text-red-500 text-xs">{errors[errorKey]}</p>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai text-center">
              These intervals are applied uniformly across all {scenarioInputs.gradeOrder?.length || 0} position groups for consistent salary spreads
            </p>
          </div>
        </div>

        {/* Position Table */}
        {newScenarioDisplayData && (
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white flex items-center gap-2">
                <Activity size={16} />
                Real-time Calculation Results
                {isCalculating && (
                  <RefreshCw size={14} className="animate-spin text-blue-500" />
                )}
              </h3>
              {newScenarioDisplayData.calculationProgress && (
                <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                  Progress: {newScenarioDisplayData.calculationProgress.calculatedPositions}/
                  {newScenarioDisplayData.calculationProgress.totalPositions} positions calculated
                </div>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">
                      Grade Level
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">
                      Vertical %
                    </th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">LD</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">LQ</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">Median</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">UQ</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">UD</th>
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
                        className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors ${
                          isBasePosition ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                        }`}
                      >
                        <td className="py-4 px-4 text-xs font-medium text-almet-cloud-burst dark:text-white">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              isTopPosition ? 'bg-red-500' : isBasePosition ? 'bg-blue-500' : 'bg-gray-400'
                            }`} />
                            {gradeName}
                            {isTopPosition && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                                Top
                              </span>
                            )}
                            {isBasePosition && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                                <Target size={8} />
                                Base
                              </span>
                            )}
                          </div>
                        </td>
                        
                        {/* Vertical Input */}
                        <td className="py-4 px-4 text-center">
                          {!isBasePosition ? (
                            <div className="flex flex-col items-center space-y-1">
                              <div className="relative">
                                <input
                                  type="number"
                                  value={gradeData.vertical || ''}
                                  onChange={(e) => handleVerticalChange(gradeName, e.target.value)}
                                  className={`w-20 px-2 py-1 text-xs border rounded-lg text-center dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-almet-sapphire transition-colors ${
                                    errors[errorKey] ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                  }`}
                                  placeholder="0"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                />
                                <span className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">%</span>
                              </div>
                              {errors[errorKey] && (
                                <p className="text-red-500 text-xs text-center">{errors[errorKey]}</p>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <span className="text-xs text-gray-400 italic">N/A</span>
                              <span className="text-xs text-gray-400">(Base)</span>
                            </div>
                          )}
                        </td>
                        
                        {/* Status */}
                        <td className="py-4 px-4 text-center">
                          {gradeData.isCalculated ? (
                            <span className="text-xs text-green-600 font-medium flex items-center justify-center gap-1">
                              <CheckCircle size={10} />
                              Ready
                            </span>
                          ) : isBasePosition && scenarioInputs.baseValue1 > 0 ? (
                            <span className="text-xs text-blue-600 font-medium flex items-center justify-center gap-1">
                              <Target size={10} />
                              Base
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Pending</span>
                          )}
                        </td>
                        
                        {/* Calculated Values */}
                        <td className="py-4 px-4 text-xs text-right font-mono">
                          {ldValue > 0 ? (
                            <span className={`${
                              isBasePosition ? "font-bold text-blue-600" : 
                              gradeData.isCalculated ? "text-green-600" : "text-almet-waterloo"
                            }`}>
                              {formatCurrency(ldValue)}
                              {isBasePosition && scenarioInputs.baseValue1 > 0 && !gradeData.isCalculated && (
                                <span className="ml-1 text-xs text-blue-600">(Input)</span>
                              )}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-xs text-right font-mono">
                          <span className={gradeData.LQ && gradeData.LQ !== "" ? "text-green-600" : "text-gray-400"}>
                            {gradeData.LQ && gradeData.LQ !== "" ? formatCurrency(gradeData.LQ) : "-"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs text-right font-mono ">
                          <span className={gradeData.M && gradeData.M !== "" ? "text-green-600" : "text-gray-400"}>
                            {gradeData.M && gradeData.M !== "" ? formatCurrency(gradeData.M) : "-"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs text-right font-mono">
                          <span className={gradeData.UQ && gradeData.UQ !== "" ? "text-green-600" : "text-gray-400"}>
                            {gradeData.UQ && gradeData.UQ !== "" ? formatCurrency(gradeData.UQ) : "-"}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-xs text-right font-mono">
                          <span className={gradeData.UD && gradeData.UD !== "" ? "text-green-600" : "text-gray-400"}>
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

        {/* Save Button */}
        <div className="flex justify-end items-center p-5 bg-gray-50 dark:bg-gray-900/50 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
        
            
            <button
              onClick={handleSaveDraft}
              disabled={!validationSummary?.canSave || loading.saving}
              className={`px-6 py-3 text-sm font-medium rounded-xl transition-all flex items-center gap-2 ${
                validationSummary?.canSave && !loading.saving
                  ? "bg-almet-sapphire text-white hover:bg-almet-astral shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {loading.saving ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  Save as Draft
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateScenarioCard;