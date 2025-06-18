// src/components/grading/ScenarioBuilder.jsx - IMPROVED: Clean layout with inline vertical inputs
import React from "react";
import { Plus, Target, Settings, Activity, CheckCircle, AlertTriangle, RefreshCw, Save } from "lucide-react";

const ScenarioBuilder = ({
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Plus size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Create New Scenario
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Design and test new compensation structures
            </p>
          </div>
        </div>
      </div>
      
      <div className="p-6 space-y-6">
        {/* Configuration Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Base Value */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
              <Target size={14} className="text-blue-600" />
              Base Value ({basePositionName})
            </label>
            <input
              type="number"
              value={scenarioInputs.baseValue1 || ''}
              onChange={(e) => handleBaseValueChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.baseValue1 ? "border-red-500 bg-red-50 dark:bg-red-900/10" : "border-gray-300 dark:border-gray-600"
              }`}
              placeholder="Enter base value"
              min="1"
              step="1"
            />
            {errors.baseValue1 && (
              <p className="text-red-500 text-xs flex items-center gap-1">
                <AlertTriangle size={10} />
                {errors.baseValue1}
              </p>
            )}
          </div>

          {/* Global Horizontal Intervals */}
          {['LD_to_LQ', 'LQ_to_M', 'M_to_UQ', 'UQ_to_UD'].map((intervalKey) => {
            const displayName = intervalKey.replace(/_to_/g, '→').replace(/_/g, ' ');
            const errorKey = `global-horizontal-${intervalKey}`;
            
            return (
              <div key={intervalKey} className="space-y-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-white">
                  {displayName} %
                </label>
                <input
                  type="number"
                  value={scenarioInputs.globalHorizontalIntervals?.[intervalKey] || ''}
                  onChange={(e) => handleGlobalHorizontalChange(intervalKey, e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors[errorKey] ? "border-red-500 bg-red-50 dark:bg-red-900/10" : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.1"
                />
                {errors[errorKey] && (
                  <p className="text-red-500 text-xs">{errors[errorKey]}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Info Text */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <Settings size={14} className="inline mr-2" />
            Horizontal intervals apply to all positions. Enter vertical rates directly in the table below.
          </p>
        </div>

        {/* Real-time Calculation Results */}
        {newScenarioDisplayData && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <Activity size={16} />
                  Grade Structure & Vertical Inputs
                  {isCalculating && (
                    <RefreshCw size={14} className="animate-spin text-blue-500" />
                  )}
                </h3>
                {validationSummary?.canSave && (
                  <span className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle size={14} />
                    Ready to save
                  </span>
                )}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Position
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Vertical %
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">LD</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">LQ</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300 bg-blue-50 dark:bg-blue-900/20">Median</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">UQ</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">UD</th>
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
                        className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                          isBasePosition ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                        }`}
                      >
                        <td className="py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              isTopPosition ? 'bg-red-500' : isBasePosition ? 'bg-blue-500' : 'bg-gray-400'
                            }`} />
                            {gradeName}
                            {isBasePosition && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-medium">
                                Base
                              </span>
                            )}
                          </div>
                        </td>
                        
                        {/* Vertical Input - INLINE */}
                        <td className="py-3 px-4 text-center">
                          {!isBasePosition ? (
                            <div className="flex flex-col items-center">
                              <input
                                type="number"
                                value={gradeData.vertical || ''}
                                onChange={(e) => handleVerticalChange(gradeName, e.target.value)}
                                className={`w-16 px-2 py-1 text-xs border rounded text-center dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                                  errors[errorKey] ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                }`}
                                placeholder="0"
                                min="0"
                                max="100"
                                step="0.1"
                              />
                              {errors[errorKey] && (
                                <span className="text-red-500 text-xs mt-1">!</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">N/A</span>
                          )}
                        </td>
                        
                        {/* Calculated Values */}
                        <td className="py-3 px-4 text-sm text-right font-mono">
                          <span className={`${
                            isBasePosition ? "font-semibold text-blue-600" : 
                            gradeData.isCalculated ? "text-gray-900 dark:text-white" : "text-gray-400"
                          }`}>
                            {ldValue > 0 ? formatCurrency(ldValue) : "-"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-mono">
                          <span className={gradeData.LQ && gradeData.LQ !== "" ? "text-gray-900 dark:text-white" : "text-gray-400"}>
                            {gradeData.LQ && gradeData.LQ !== "" ? formatCurrency(gradeData.LQ) : "-"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-mono font-semibold bg-blue-50 dark:bg-blue-900/20">
                          <span className={gradeData.M && gradeData.M !== "" ? "text-blue-600" : "text-gray-400"}>
                            {gradeData.M && gradeData.M !== "" ? formatCurrency(gradeData.M) : "-"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-mono">
                          <span className={gradeData.UQ && gradeData.UQ !== "" ? "text-gray-900 dark:text-white" : "text-gray-400"}>
                            {gradeData.UQ && gradeData.UQ !== "" ? formatCurrency(gradeData.UQ) : "-"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-right font-mono">
                          <span className={gradeData.UD && gradeData.UD !== "" ? "text-gray-900 dark:text-white" : "text-gray-400"}>
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
        <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handleSaveDraft}
            disabled={!validationSummary?.canSave || loading.saving}
            className={`px-6 py-2 text-sm font-medium rounded-lg flex items-center gap-2 ${
              validationSummary?.canSave && !loading.saving
                ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
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
  );
};

export default ScenarioBuilder;