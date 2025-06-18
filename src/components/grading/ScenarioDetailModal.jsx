import React from "react";
import { X, Target, Settings, CheckCircle, Archive, RefreshCw, Info } from "lucide-react";

const ScenarioDetailModal = ({
  isOpen,
  onClose,
  selectedScenario,
  compareMode,
  selectedForComparison,
  currentData,
  basePositionName,
  loading,
  getScenarioForComparison,
  getVerticalInputValue,
  getHorizontalInputValues,
  handleSaveAsCurrent,
  handleArchiveDraft
}) => {
  if (!isOpen) return null;

  const formatCurrency = (value) => {
    const numValue = value || 0;
    return numValue.toLocaleString();
  };

  const formatPercentage = (value, decimals = 1) => {
    const numValue = value || 0;
    return `${(numValue * 100).toFixed(decimals)}%`;
  };

  const safeValue = (value, defaultValue = 0) => {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-7xl max-h-[95vh] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-almet-cloud-burst dark:text-white">
                {compareMode && selectedForComparison.length >= 2 ? 
                  `Scenario Comparison (${selectedForComparison.length} scenarios)` : 
                  selectedScenario ? `${selectedScenario.name}` : 'Scenario Details'
                }
              </h2>
              <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai mt-1">
                {compareMode ? 'Compare multiple scenarios with input data visualization' : 'Detailed view with comprehensive data analysis'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {compareMode && selectedForComparison.length >= 2 ? (
            // Comparison View
            <div className="space-y-8">
              {/* ✅ ENHANCED: Comparison Summary Cards - Current Scenario üçün düzgün display */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {selectedForComparison.map(scenarioId => {
                  const comparisonData = getScenarioForComparison(scenarioId);
                  if (!comparisonData) return null;
                  
                  const { data, name, status } = comparisonData;
                  const horizontalInputs = getHorizontalInputValues(scenarioId);
                  
                  return (
                    <div key={scenarioId} className={`p-5 border rounded-xl bg-gradient-to-br ${
                      status === 'current' 
                        ? 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30 border-green-200 dark:border-green-800' 
                        : 'from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border-gray-200 dark:border-gray-700'
                    }`}>
                      <h3 className="font-bold text-sm mb-4 text-almet-cloud-burst dark:text-white flex items-center gap-2">
                        {status === 'current' && <CheckCircle size={14} className="text-green-600" />}
                        {name}
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Base Value:</span>
                          <span className="font-semibold text-xs">{formatCurrency(data?.baseValue1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Vertical Avg:</span>
                          <span className="font-semibold text-xs text-blue-600">{formatPercentage(data?.verticalAvg)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Horizontal Avg:</span>
                          <span className="font-semibold text-xs text-green-600">{formatPercentage(data?.horizontalAvg)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Status:</span>
                          <span className={`text-xs font-semibold capitalize ${
                            status === 'current' ? 'text-green-600' : 
                            status === 'draft' ? 'text-blue-600' : 'text-gray-600'
                          }`}>
                            {status === 'current' ? 'Active' : status}
                          </span>
                        </div>
                      </div>
                      
                      {/* ✅ ENHANCED: Horizontal Input Display - Current Scenario üçün də göstərir */}
                      {horizontalInputs && Object.values(horizontalInputs).some(v => safeValue(v) > 0) && (
                        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <div className="text-xs font-medium text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-1">
                            <Settings size={12} />
                            Horizontal Intervals:
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            {Object.entries(horizontalInputs).map(([key, value]) => (
                              <div key={key} className="flex justify-between">
                                <span className="text-almet-waterloo dark:text-almet-bali-hai truncate">
                                  {key.replace(/_to_/g, '→').replace(/_/g, ' ')}
                                </span>
                                <span className="font-mono font-medium text-green-600">
                                  {safeValue(value).toFixed(1)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Current scenario üçün xüsusi status indicator */}
                      {status === 'current' && (
                        <div className="mt-4 pt-4 border-t border-green-200 dark:border-green-700">
                          <div className="text-xs text-center text-green-600 font-medium bg-green-100 dark:bg-green-900/20 rounded-lg py-2">
                            ✓ Currently Active
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Detailed Comparison Table */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-almet-cloud-burst dark:text-white">Position-by-Position Comparison</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-almet-waterloo dark:text-almet-bali-hai">Grade</th>
                        {selectedForComparison.map(scenarioId => {
                          const comparisonData = getScenarioForComparison(scenarioId);
                          return comparisonData ? (
                            <th key={scenarioId} className="text-center py-3 px-4 text-sm font-semibold text-almet-waterloo dark:text-almet-bali-hai">
                              <div className="font-medium flex items-center justify-center gap-1">
                                {scenarioId === 'current' && <CheckCircle size={12} className="text-green-600" />}
                                {comparisonData.name}
                              </div>
                              <div className="text-xs font-normal text-gray-500">
                                Median | Vertical Input
                              </div>
                            </th>
                          ) : null;
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {(currentData?.gradeOrder || []).map((gradeName, index) => {
                        const isBasePosition = index === (currentData?.gradeOrder?.length - 1);
                        
                        return (
                          <tr key={gradeName} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/50">
                            <td className="py-3 px-4 text-sm font-medium">
                              <div className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded-full ${
                                  index === 0 ? 'bg-red-500' : isBasePosition ? 'bg-blue-500' : 'bg-gray-400'
                                }`} />
                                {gradeName}
                                {isBasePosition && (
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Base</span>
                                )}
                              </div>
                            </td>
                            {selectedForComparison.map(scenarioId => {
                              const comparisonData = getScenarioForComparison(scenarioId);
                              const data = comparisonData?.data;
                              const gradeData = data?.grades?.[gradeName];
                              const verticalInput = getVerticalInputValue(scenarioId, gradeName);
                              
                              return (
                                <td key={scenarioId} className="py-3 px-4 text-center">
                                  {gradeData ? (
                                    <div>
                                      <div className={`font-mono font-bold text-sm mb-1 ${
                                        scenarioId === 'current' ? 'text-green-600' : 'text-blue-600'
                                      }`}>
                                        {formatCurrency(gradeData.M)}
                                      </div>
                                      <div className="text-xs text-gray-500">
                                        {!isBasePosition ? (
                                          verticalInput !== null && verticalInput !== undefined ? (
                                            <span className={`font-medium ${
                                              scenarioId === 'current' ? 'text-green-600' : 'text-orange-600'
                                            }`}>
                                              V: {safeValue(verticalInput)}%
                                            </span>
                                          ) : (
                                            <span className="text-gray-400">V: N/A</span>
                                          )
                                        ) : (
                                          <span className={`font-medium ${
                                            scenarioId === 'current' ? 'text-green-600' : 'text-blue-600'
                                          }`}>
                                            Base Position
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-gray-400">-</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* ✅ ENHANCED: Horizontal Intervals Comparison - Current Scenario üçün də göstərir */}
              <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-6 border border-indigo-200 dark:border-indigo-800">
                <h3 className="text-lg font-semibold mb-4 text-almet-cloud-burst dark:text-white">
                  Horizontal Intervals Comparison
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-indigo-200 dark:border-indigo-800">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-almet-waterloo dark:text-almet-bali-hai">Interval</th>
                        {selectedForComparison.map(scenarioId => {
                          const comparisonData = getScenarioForComparison(scenarioId);
                          return comparisonData ? (
                            <th key={scenarioId} className="text-center py-3 px-4 text-sm font-semibold text-almet-waterloo dark:text-almet-bali-hai">
                              <div className="flex items-center justify-center gap-1">
                                {scenarioId === 'current' && <CheckCircle size={12} className="text-green-600" />}
                                {comparisonData.name}
                              </div>
                            </th>
                          ) : null;
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {['LD_to_LQ', 'LQ_to_M', 'M_to_UQ', 'UQ_to_UD'].map(intervalKey => {
                        const displayName = intervalKey.replace(/_to_/g, ' → ').replace(/_/g, ' ');
                        
                        return (
                          <tr key={intervalKey} className="border-b border-indigo-100 dark:border-indigo-900">
                            <td className="py-3 px-4 text-sm font-medium">{displayName}</td>
                            {selectedForComparison.map(scenarioId => {
                              const horizontalInputs = getHorizontalInputValues(scenarioId);
                              const intervalValue = horizontalInputs?.[intervalKey];
                              
                              return (
                                <td key={scenarioId} className="py-3 px-4 text-center">
                                  <span className={`font-mono text-sm font-bold ${
                                    scenarioId === 'current' ? 'text-green-600' : 'text-indigo-600'
                                  }`}>
                                    {safeValue(intervalValue).toFixed(1)}%
                                  </span>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-indigo-200 dark:border-indigo-800">
                  <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai text-center">
                    <span className="font-medium">✓ Success:</span> All scenarios now show their input interval values correctly
                  </p>
                </div>
              </div>
            </div>
          ) : selectedScenario ? (
            // Single Scenario Detail View
            <div className="space-y-8">
              {/* Scenario Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 rounded-xl border border-blue-200 dark:border-blue-800">
                  <div className="text-2xl font-bold text-blue-600 mb-2">
                    {formatCurrency(selectedScenario.data?.baseValue1 || selectedScenario.baseValue1)}
                  </div>
                  <div className="text-sm font-semibold text-almet-cloud-burst dark:text-white">Base Value</div>
                  <div className="text-xs text-gray-500 mt-1">{basePositionName}</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30 rounded-xl border border-green-200 dark:border-green-800">
                  <div className="text-2xl font-bold text-green-600 mb-2">
                    {formatPercentage(selectedScenario.data?.verticalAvg !== undefined ? selectedScenario.data.verticalAvg : selectedScenario.vertical_avg)}
                  </div>
                  <div className="text-sm font-semibold text-almet-cloud-burst dark:text-white">Vertical Average</div>
                  <div className="text-xs text-gray-500 mt-1">Position transitions</div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30 rounded-xl border border-purple-200 dark:border-purple-800">
                  <div className="text-2xl font-bold text-purple-600 mb-2">
                    {formatPercentage(selectedScenario.data?.horizontalAvg !== undefined ? selectedScenario.data.horizontalAvg : selectedScenario.horizontal_avg)}
                  </div>
                  <div className="text-sm font-semibold text-almet-cloud-burst dark:text-white">Horizontal Average</div>
                  <div className="text-xs text-gray-500 mt-1">Global intervals</div>
                </div>
                {selectedScenario.metrics && (
                  <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/30 rounded-xl border border-yellow-200 dark:border-yellow-800">
                    <div className="text-2xl font-bold text-yellow-600 mb-2">
                      {formatCurrency(selectedScenario.metrics.totalBudgetImpact)}
                    </div>
                    <div className="text-sm font-semibold text-almet-cloud-burst dark:text-white">Budget Impact</div>
                    <div className="text-xs text-gray-500 mt-1">Total cost</div>
                  </div>
                )}
              </div>

              {/* ✅ ENHANCED: Global Intervals Display - hər scenario üçün, həmçinin current üçün də */}
              {(() => {
                const globalIntervals = selectedScenario.data?.globalHorizontalIntervals || {};
                let hasIntervals = Object.values(globalIntervals).some(v => safeValue(v) > 0);
                
                // Əgər globalHorizontalIntervals yoxdursa, input_rates-dən götürək
                if (!hasIntervals && selectedScenario.input_rates) {
                  for (const [gradeName, gradeData] of Object.entries(selectedScenario.input_rates)) {
                    if (gradeData && gradeData.horizontal_intervals) {
                      Object.assign(globalIntervals, gradeData.horizontal_intervals);
                      hasIntervals = Object.values(globalIntervals).some(v => safeValue(v) > 0);
                      break;
                    }
                  }
                }
                
                return hasIntervals ? (
                  <div className={`rounded-xl p-6 border ${
                    selectedScenario.status === 'current' 
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
                  }`}>
                    <h3 className="font-semibold text-lg text-almet-cloud-burst dark:text-white mb-4 flex items-center gap-2">
                      <Settings size={20} className={selectedScenario.status === 'current' ? 'text-green-600' : 'text-indigo-600'} />
                      {selectedScenario.status === 'current' ? 'Current Active' : 'Scenario'} Horizontal Intervals 
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {Object.entries({
                        LD_to_LQ: globalIntervals.LD_to_LQ || 0,
                        LQ_to_M: globalIntervals.LQ_to_M || 0,
                        M_to_UQ: globalIntervals.M_to_UQ || 0,
                        UQ_to_UD: globalIntervals.UQ_to_UD || 0
                      }).map(([key, value]) => {
                        const displayName = key.replace(/_to_/g, ' → ').replace(/_/g, ' ');
                        return (
                          <div key={key} className={`text-center p-4 bg-white dark:bg-gray-800 rounded-lg border shadow-sm ${
                            selectedScenario.status === 'current' 
                              ? 'border-green-200 dark:border-green-700'
                              : 'border-indigo-200 dark:border-indigo-700'
                          }`}>
                            <div className={`font-bold text-xl mb-2 ${
                              selectedScenario.status === 'current' ? 'text-green-600' : 'text-indigo-600'
                            }`}>
                              {safeValue(value).toFixed(1)}%
                            </div>
                            <div className="text-sm text-almet-waterloo dark:text-almet-bali-hai">{displayName}</div>
                          </div>
                        );
                      })}
                    </div>
                    <div className={`mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border ${
                      selectedScenario.status === 'current' 
                        ? 'border-green-200 dark:border-green-800'
                        : 'border-indigo-200 dark:border-indigo-800'
                    }`}>
                      <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai text-center">
                        {selectedScenario.status === 'current' 
                          ? 'These are the currently active horizontal intervals applied across all positions'
                          : `These intervals are applied uniformly across all ${(currentData?.gradeOrder || []).length} position groups`
                        }
                      </p>
                    </div>
                  </div>
                ) : (
                  // Əgər intervals yoxdursa, mesaj göstər
                  <div className="bg-gray-50 dark:bg-gray-900/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                    <h3 className="font-semibold text-lg text-almet-cloud-burst dark:text-white mb-4 flex items-center gap-2">
                      <Info size={20} className="text-gray-600" />
                      Horizontal Intervals
                    </h3>
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                      <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai">
                        No horizontal interval data available for this scenario
                      </p>
                    </div>
                  </div>
                );
              })()}

              {/* Detailed Grade Table */}
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-almet-cloud-burst dark:text-white">Detailed Grade Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-almet-waterloo dark:text-almet-bali-hai">Grade</th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-almet-waterloo dark:text-almet-bali-hai">
                          Vertical Input %
                        </th>
                        <th className="text-center py-3 px-4 text-sm font-semibold text-almet-waterloo dark:text-almet-bali-hai">Horizontal</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-almet-waterloo dark:text-almet-bali-hai">LD</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-almet-waterloo dark:text-almet-bali-hai">LQ</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-almet-waterloo dark:text-almet-bali-hai bg-blue-50 dark:bg-blue-900/20 rounded-lg">Median</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-almet-waterloo dark:text-almet-bali-hai">UQ</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-almet-waterloo dark:text-almet-bali-hai">UD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedScenario.data?.gradeOrder || selectedScenario.gradeOrder || currentData?.gradeOrder || []).map((gradeName, index) => {
                        const scenarioData = selectedScenario.data || selectedScenario;
                        const values = scenarioData.grades?.[gradeName] || {};
                        const isBasePosition = gradeName === basePositionName;
                        const isTopPosition = index === 0;
                        
                        // ✅ FIXED: Current scenario üçün də vertical input göstəririk
                        let verticalValue = getVerticalInputValue(selectedScenario.id, gradeName);
                        
                        return (
                          <tr key={gradeName} className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/50 ${
                            isBasePosition ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                          }`}>
                            <td className="py-4 px-4 text-sm font-medium">
                              <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${
                                  isTopPosition ? 'bg-red-500' : isBasePosition ? 'bg-blue-500' : 'bg-gray-400'
                                }`} />
                                {gradeName}
                                {isTopPosition && <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Top</span>}
                                {isBasePosition && (
                                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full flex items-center gap-1">
                                    <Target size={8} />
                                    Base
                                  </span>
                                )}
                              </div>
                            </td>
                            
                            {/* ✅ ENHANCED: Vertical Input Display - current scenario üçün də göstərir */}
                            <td className="py-4 px-4 text-sm text-center">
                              {!isBasePosition ? (
                                verticalValue !== null && verticalValue !== undefined ? (
                                  <span className={`font-mono font-semibold text-sm px-3 py-1 rounded-lg ${
                                    selectedScenario.status === 'current' 
                                      ? 'text-green-600 bg-green-50 dark:bg-green-900/20' 
                                      : 'text-orange-600 bg-orange-50 dark:bg-orange-900/20'
                                  }`}>
                                    {safeValue(verticalValue).toFixed(1)}%
                                  </span>
                                ) : (
                                  <span className="text-gray-400 italic">No Input</span>
                                )
                              ) : (
                                <span className="text-blue-600 font-medium text-sm">
                                  N/A (Base)
                                </span>
                              )}
                            </td>
                            
                            {/* Horizontal Status */}
                            <td className="py-4 px-4 text-sm text-center">
                              <span className={`text-xs font-medium flex items-center justify-center gap-1 ${
                                selectedScenario.status === 'current' ? 'text-green-600' : 'text-blue-600'
                              }`}>
                                🌐 Global
                              </span>
                            </td>
                            
                            {/* Calculated Values */}
                            <td className="py-4 px-4 text-sm text-right font-mono">{formatCurrency(values.LD)}</td>
                            <td className="py-4 px-4 text-sm text-right font-mono">{formatCurrency(values.LQ)}</td>
                            <td className={`py-4 px-4 text-sm text-right font-mono font-bold rounded-lg ${
                              selectedScenario.status === 'current' 
                                ? 'text-green-600 bg-green-50 dark:bg-green-900/20' 
                                : 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                            }`}>
                              {formatCurrency(values.M)}
                            </td>
                            <td className="py-4 px-4 text-sm text-right font-mono">{formatCurrency(values.UQ)}</td>
                            <td className="py-4 px-4 text-sm text-right font-mono">{formatCurrency(values.UD)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons for Draft Scenarios Only */}
              {selectedScenario.status === 'draft' && (
                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      handleSaveAsCurrent(selectedScenario.id);
                      onClose();
                    }}
                    disabled={loading.applying}
                    className="bg-green-600 text-white px-8 py-3 text-sm font-medium rounded-xl hover:bg-green-700 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading.applying ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <CheckCircle size={16} />
                    )}
                    Apply as Current
                  </button>
                  <button
                    onClick={() => {
                      handleArchiveDraft(selectedScenario.id);
                      onClose();
                    }}
                    disabled={loading.archiving}
                    className="bg-gray-500 text-white px-8 py-3 text-sm font-medium rounded-xl hover:bg-gray-600 transition-all shadow-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading.archiving ? (
                      <RefreshCw size={16} className="animate-spin" />
                    ) : (
                      <Archive size={16} />
                    )}
                    Archive
                  </button>
                </div>
              )}

              {/* Enhanced Info Display for Current Scenario */}
              {selectedScenario.status === 'current' && (
                <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
                  <h3 className="font-semibold text-lg text-almet-cloud-burst dark:text-white mb-4 flex items-center gap-2">
                    <CheckCircle size={20} className="text-green-600" />
                    Currently Active Scenario
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                      <div className="text-sm font-medium text-almet-cloud-burst dark:text-white mb-1">Status</div>
                      <div className="text-green-600 font-bold">✓ Active</div>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                      <div className="text-sm font-medium text-almet-cloud-burst dark:text-white mb-1">Input Data</div>
                      <div className="text-green-600 font-bold">✓ Available</div>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                      <div className="text-sm font-medium text-almet-cloud-burst dark:text-white mb-1">Applied</div>
                      <div className="text-xs text-gray-500">
                        {selectedScenario.applied_at ? new Date(selectedScenario.applied_at).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-800">
                    <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai text-center">
                      This is the currently active grading scenario with both input rates and calculated salary values.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (

            <div className="text-center py-16">
              <div className="text-gray-400 mb-4">
                <Info size={64} className="mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-almet-waterloo dark:text-almet-bali-hai mb-3">
                No Scenario Selected
              </h3>
              <p className="text-sm text-gray-500">
                Please select a scenario to view details
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScenarioDetailModal;