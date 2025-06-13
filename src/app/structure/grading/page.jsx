// src/app/structure/grading/page.jsx - SIMPLIFIED ADAPTED VERSION

"use client";
import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { 
  BarChart3, 
  TrendingUp, 
  Calculator, 
  Save, 
  Archive, 
  Eye, 
  Trash2, 
  Plus, 
  X, 
  GitCompare, 
  Info, 
  AlertTriangle, 
  CheckCircle, 
  Target, 
  RefreshCw,
  Calendar,
  User,
  DollarSign,
  TrendingDown,
  Activity
} from "lucide-react";
import useGrading from "@/hooks/useGrading";

const GradingPage = () => {
  const { darkMode } = useTheme();
  const [selectedBasePosition, setSelectedBasePosition] = useState(null);
  
  // Use the enhanced hook
  const {
    // Data
    currentData,
    scenarioInputs,
    calculatedOutputs,
    newScenarioDisplayData,
    draftScenarios,
    archivedScenarios,
    selectedScenario,
    bestDraft,
    inputSummary,
    validationSummary,
    
    // UI State
    isDetailOpen,
    setIsDetailOpen,
    compareMode,
    selectedForComparison,
    loading,
    errors,
    canSaveDraft,
    
    // Actions
    handleBaseValueChange,
    handleVerticalChange,
    handleGlobalHorizontalChange,
    handleSaveDraft,
    handleSaveAsCurrent,
    handleArchiveDraft,
    handleViewDetails,
    toggleCompareMode,
    toggleScenarioForComparison,
    startComparison,
    getScenarioForComparison,
    calculateGrades
  } = useGrading();

  // Determine base position automatically
  useEffect(() => {
    if (currentData && currentData.gradeOrder && currentData.gradeOrder.length > 0) {
      const basePos = currentData.gradeOrder[currentData.gradeOrder.length - 1];
      setSelectedBasePosition(basePos);
    }
  }, [currentData]);

  // Get position for base value display
  const getBasePositionName = () => {
    if (selectedBasePosition) return selectedBasePosition;
    if (currentData && currentData.gradeOrder && currentData.gradeOrder.length > 0) {
      return currentData.gradeOrder[currentData.gradeOrder.length - 1];
    }
    return "Base Position";
  };

  // Simplified metrics display component
  const MetricsDisplay = ({ scenario, size = "sm" }) => {
    if (!scenario || !scenario.metrics) return null;

    const sizeClasses = size === "lg" ? "px-3 py-2 text-sm" : "px-2 py-1 text-xs";

    return (
      <div className={`space-y-1 ${sizeClasses}`}>
        <div className="flex justify-between">
          <span className="text-almet-waterloo dark:text-almet-bali-hai">Budget Impact:</span>
          <span className="font-medium text-xs">{(scenario.metrics.totalBudgetImpact || 0).toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-almet-waterloo dark:text-almet-bali-hai">Avg Increase:</span>
          <span className={`font-medium text-xs ${(scenario.metrics.avgSalaryIncrease || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {(scenario.metrics.avgSalaryIncrease || 0) > 0 ? '+' : ''}{(scenario.metrics.avgSalaryIncrease || 0).toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-almet-waterloo dark:text-almet-bali-hai">Max Increase:</span>
          <span className="font-medium text-xs text-orange-600">
            {(scenario.metrics.maxSalaryIncrease || 0).toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-almet-waterloo dark:text-almet-bali-hai">Positions:</span>
          <span className="font-medium text-xs">{scenario.metrics.positionsAffected || 0}</span>
        </div>
      </div>
    );
  };



  // Simplified loading component
  const LoadingSpinner = ({ message = "Loading..." }) => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-almet-sapphire mx-auto mb-3"></div>
        <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai">{message}</p>
      </div>
    </div>
  );

  // Simplified error component
  const ErrorDisplay = ({ error, onRetry }) => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md">
        <div className="text-red-500 mb-3">
          <Archive size={32} className="mx-auto mb-2" />
          <h3 className="text-base font-medium">Database Error</h3>
        </div>
        <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai mb-3">{error}</p>
        <p className="text-xs text-gray-500 mb-3">
          Please ensure position groups are configured in the database.
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-almet-sapphire text-white px-4 py-2 text-sm rounded-md hover:bg-almet-astral transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );

  // Show loading state
  if (loading && !currentData) {
    return (
      <DashboardLayout>
        <LoadingSpinner message="Loading grading system..." />
      </DashboardLayout>
    );
  }

  // Show error
  if (errors.load) {
    return (
      <DashboardLayout>
        <ErrorDisplay error={errors.load} />
      </DashboardLayout>
    );
  }

  // Show no data state
  if (!currentData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Calculator size={32} className="mx-auto mb-3 text-gray-400" />
            <h3 className="text-base font-medium text-almet-waterloo dark:text-almet-bali-hai mb-2">No Grading Structure Found</h3>
            <p className="text-xs text-gray-500">Please configure position groups in the database first.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 space-y-4 max-w-7xl mx-auto">
        {/* Simplified Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-xl font-bold text-almet-cloud-burst dark:text-white">
                Employee Grading System
              </h1>
              <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai mt-1">
                Manage salary grades and compensation structures
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right text-xs">
                <p className="text-gray-500">Last Updated</p>
                <p className="font-medium text-xs">{new Date().toLocaleDateString()}</p>
              </div>
              <div className="p-2 bg-almet-sapphire rounded-md">
                <Activity size={16} className="text-white" />
              </div>
            </div>
          </div>

         
        </div>

        {/* Current Situation - Simplified */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-almet-mystic/50 dark:bg-almet-cloud-burst/20">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-almet-sapphire rounded-md">
                <BarChart3 size={16} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white">
                  Current Grade Structure
                </h2>
                <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                  Active compensation structure with {currentData.gradeOrder.length} position groups
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            {/* Simplified Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                <div className="text-xl font-bold text-blue-600 mb-1">
                  {(currentData.verticalAvg * 100).toFixed(1)}%
                </div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Vertical Average</div>
                <div className="text-xs text-gray-500 mt-0.5">Position transitions</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                <div className="text-xl font-bold text-green-600 mb-1">
                  {(currentData.horizontalAvg * 100).toFixed(1)}%
                </div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Horizontal Average</div>
                <div className="text-xs text-gray-500 mt-0.5">Salary spreads</div>
              </div>
          
            </div>

            {/* Simplified Grades Table */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-md p-3">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">
                        Grade Level
                      </th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">
                        LD
                      </th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">
                        LQ
                      </th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai bg-blue-50 dark:bg-blue-900/20">
                        Median
                      </th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">
                        UQ
                      </th>
                      <th className="text-right py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">
                        UD
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.gradeOrder.map((gradeName, index) => {
                      const values = currentData.grades[gradeName];
                      const isBasePosition = gradeName === getBasePositionName();
                      const isTopPosition = index === 0;
                      
                      if (!values) return null;
                      return (
                        <tr 
                          key={gradeName} 
                          className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                            isBasePosition ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                          }`}
                        >
                          <td className="py-3 px-3 text-xs font-medium text-almet-cloud-burst dark:text-white">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                isTopPosition ? 'bg-red-500' : isBasePosition ? 'bg-blue-500' : 'bg-gray-400'
                              }`} />
                              {gradeName}
                              {isTopPosition && (
                                <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">
                                  Top
                                </span>
                              )}
                              {isBasePosition && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                                  <Target size={8} />
                                  Base
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-xs text-right font-mono text-almet-waterloo dark:text-almet-bali-hai">
                            {(values.LD || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-xs text-right font-mono text-almet-waterloo dark:text-almet-bali-hai">
                            {(values.LQ || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-xs text-right font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20">
                            {(values.M || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-xs text-right font-mono text-almet-waterloo dark:text-almet-bali-hai">
                            {(values.UQ || 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-xs text-right font-mono text-almet-waterloo dark:text-almet-bali-hai">
                            {(values.UD || 0).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Create New Scenario - Simplified */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-green-600 rounded-md">
                <Plus size={16} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white">
                  Create New Scenario
                </h2>
                <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                  Design and test new compensation structures
                </p>
              </div>
            </div>
            
     
          </div>
          
          <div className="p-4 space-y-6">
            {/* Base Value Input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-almet-cloud-burst dark:text-white">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                  <Target size={12} className="text-blue-600" />
                </div>
                Base Value ({getBasePositionName()} LD)
              </label>
              <div className="max-w-md">
                <input
                  type="number"
                  value={scenarioInputs.baseValue1}
                  onChange={(e) => handleBaseValueChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-sapphire focus:border-transparent transition-colors ${
                    errors.baseValue1 ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder={`Enter base salary for ${getBasePositionName()}`}
                  min="1"
                  step="1"
                />
                {errors.baseValue1 && (
                  <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                    <AlertTriangle size={12} />
                    {errors.baseValue1}
                  </p>
                )}
              </div>
            </div>

       
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-indigo-50 dark:bg-indigo-900/20">
              <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-md">
                  <Calculator size={12} className="text-indigo-600" />
                </div>
                 Horizontal Intervals
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {['LD_to_LQ', 'LQ_to_M', 'M_to_UQ', 'UQ_to_UD'].map((intervalKey) => {
                  const displayName = intervalKey.replace(/_to_/g, ' → ').replace(/_/g, ' ');
                  return (
                    <div key={intervalKey} className="space-y-1">
                      <label className="block text-xs font-medium text-almet-cloud-burst dark:text-white">
                        {displayName}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={scenarioInputs.globalHorizontalIntervals?.[intervalKey] || ''}
                          onChange={(e) => handleGlobalHorizontalChange(intervalKey, e.target.value)}
                          className={`w-full px-2 py-1.5 text-xs border rounded-md text-center dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-sapphire transition-colors ${
                            errors[`global-horizontal-${intervalKey}`] ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                          }`}
                          placeholder="0"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">%</span>
                      </div>
                      {errors[`global-horizontal-${intervalKey}`] && (
                        <p className="text-red-500 text-xs">{errors[`global-horizontal-${intervalKey}`]}</p>
                      )}
                    </div>
                  );
                })}
              </div>
             
            </div>

            {/* Position Table */}
            {newScenarioDisplayData && (
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                  <Activity size={14} />
                  Real-time Calculation Results
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">
                          Grade Level
                        </th>
                        <th className="text-center py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">
                          <div>Vertical %</div>
                        </th>
                       
                        <th className="text-right py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">LD</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">LQ</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai bg-blue-50 dark:bg-blue-900/20">Median</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">UQ</th>
                        <th className="text-right py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">UD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {newScenarioDisplayData.gradeOrder.map((gradeName, index) => {
                        const inputs = scenarioInputs.grades[gradeName] || {};
                        const outputs = calculatedOutputs[gradeName] || { LD: "", LQ: "", M: "", UQ: "", UD: "" };

                        const isBasePosition = gradeName === getBasePositionName();
                        const isTopPosition = index === 0;
                        
                        // Enhanced LD value logic
                        const ldValue = isBasePosition && scenarioInputs.baseValue1 > 0 
                          ? Math.round(scenarioInputs.baseValue1) 
                          : outputs.LD;

                        return (
                          <tr 
                            key={gradeName} 
                            className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors ${
                              isBasePosition ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                            }`}
                          >
                            <td className="py-3 px-3 text-xs font-medium text-almet-cloud-burst dark:text-white">
                              <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  isTopPosition ? 'bg-red-500' : isBasePosition ? 'bg-blue-500' : 'bg-gray-400'
                                }`} />
                                {gradeName}
                                {isTopPosition && (
                                  <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">
                                    Top
                                  </span>
                                )}
                                {isBasePosition && (
                                  <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full font-medium flex items-center gap-1">
                                    <Target size={8} />
                                    Base
                                  </span>
                                )}
                              </div>
                            </td>
                            
                            {/* Vertical Input */}
                            <td className="py-3 px-3 text-center">
                              {inputs.vertical !== null ? (
                                <div className="flex flex-col items-center space-y-1">
                                  <div className="relative">
                                    <input
                                      type="number"
                                      value={inputs.vertical}
                                      onChange={(e) => handleVerticalChange(gradeName, e.target.value)}
                                      className={`w-16 px-1.5 py-1 text-xs border rounded text-center dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-almet-sapphire transition-colors ${
                                        errors[`vertical-${gradeName}`] ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                      }`}
                                      placeholder="0"
                                      min="0"
                                      max="100"
                                      step="0.1"
                                    />
                                    <span className="absolute right-1 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">%</span>
                                  </div>
                                  {errors[`vertical-${gradeName}`] && (
                                    <p className="text-red-500 text-xs">{errors[`vertical-${gradeName}`]}</p>
                                  )}
                                </div>
                              ) : (
                                <div className="flex flex-col items-center">
                                  <span className="text-xs text-gray-400 italic">N/A</span>
                                </div>
                              )}
                            </td>
                           
                            
                            {/* Calculated Values */}
                            <td className="py-3 px-3 text-xs text-right font-mono">
                              {ldValue ? (
                                <span className={`${isBasePosition ? "font-bold text-blue-600" : ""} ${outputs.LD ? "text-green-600" : "text-almet-waterloo"}`}>
                                  {Number(ldValue).toLocaleString()}
                                  {isBasePosition && scenarioInputs.baseValue1 > 0 && !outputs.LD && (
                                    <span className="ml-1 text-xs text-blue-600">(Input)</span>
                                  )}
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="py-3 px-3 text-xs text-right font-mono">
                              <span className={outputs.LQ ? "text-green-600" : "text-gray-400"}>
                                {outputs.LQ ? Number(outputs.LQ).toLocaleString() : "-"}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-xs text-right font-mono font-bold bg-blue-50 dark:bg-blue-900/20">
                              <span className={outputs.M ? "text-green-600" : "text-gray-400"}>
                                {outputs.M ? Number(outputs.M).toLocaleString() : "-"}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-xs text-right font-mono">
                              <span className={outputs.UQ ? "text-green-600" : "text-gray-400"}>
                                {outputs.UQ ? Number(outputs.UQ).toLocaleString() : "-"}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-xs text-right font-mono">
                              <span className={outputs.UD ? "text-green-600" : "text-gray-400"}>
                                {outputs.UD ? Number(outputs.UD).toLocaleString() : "-"}
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
            <div className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                {!canSaveDraft ? (
                  <div className="flex items-center gap-2 text-amber-600">
                    <AlertTriangle size={12} />
                    <div>
                      {!validationSummary?.hasBaseValue && "Base value required. "}
                      {!validationSummary?.hasCalculatedOutputs && "Calculation required. "}
                      {validationSummary?.hasErrors && "Fix validation errors."}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle size={12} />
                    <span>Ready to save draft scenario</span>
                  </div>
                )}
              </div>
              <button
                onClick={handleSaveDraft}
                disabled={!canSaveDraft || loading}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                  canSaveDraft && !loading
                    ? "bg-almet-sapphire text-white hover:bg-almet-astral shadow-md hover:shadow-lg"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw size={12} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={12} />
                    Save as Draft
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Draft Scenarios */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900/20">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-yellow-600 rounded-md">
                  <Calculator size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white">
                    Draft Scenarios
                  </h2>
                  <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                    {draftScenarios.length} scenarios available for testing and application
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {compareMode && selectedForComparison.length >= 2 && (
                  <button
                    onClick={startComparison}
                    className="bg-green-600 text-white px-3 py-1.5 text-xs rounded-md hover:bg-green-700 transition-colors flex items-center gap-1 shadow-md"
                  >
                    <Eye size={12} />
                    Compare ({selectedForComparison.length})
                  </button>
                )}
                <button
                  onClick={toggleCompareMode}
                  className={`px-3 py-1.5 text-xs rounded-md border transition-all flex items-center gap-1 shadow-md ${
                    compareMode 
                      ? 'bg-red-500 text-white border-red-500 hover:bg-red-600' 
                      : 'bg-almet-sapphire text-white border-almet-sapphire hover:bg-almet-astral'
                  }`}
                >
                  <GitCompare size={12} />
                  {compareMode ? 'Cancel Compare' : 'Compare Scenarios'}
                </button>
              </div>
            </div>
          </div>

          <div className="p-4">
        
            {/* Current Structure in comparison mode */}
            {compareMode && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white mb-3">Include Current Structure:</h3>
                <div 
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedForComparison.includes('current')
                      ? "border-almet-sapphire bg-blue-50 dark:bg-blue-900/20 shadow-md"
                      : "border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-gray-300"
                  }`}
                  onClick={() => toggleScenarioForComparison('current')}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-sm text-almet-cloud-burst dark:text-white">Current Structure</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Active grade structure from database</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedForComparison.includes('current')}
                      onChange={() => toggleScenarioForComparison('current')}
                      className="w-4 h-4 text-almet-sapphire rounded focus:ring-almet-sapphire"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-md">
                      <div className="text-sm font-semibold text-almet-cloud-burst dark:text-white">
                        {(currentData.verticalAvg * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Vertical</div>
                    </div>
                    <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-md">
                      <div className="text-sm font-semibold text-almet-cloud-burst dark:text-white">
                        {(currentData.horizontalAvg * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Horizontal</div>
                    </div>
                    <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-md">
                      <div className="text-sm font-semibold text-almet-cloud-burst dark:text-white">
                        {currentData.baseValue1 > 0 ? currentData.baseValue1.toLocaleString() : 'Not Set'}
                      </div>
                      <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Base Value</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Draft Scenarios Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {draftScenarios.length > 0 ? (
                draftScenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                      bestDraft && bestDraft.id === scenario.id && !compareMode
                        ? "border-green-400 bg-green-50 dark:bg-green-900/20 shadow-md"
                        : compareMode && selectedForComparison.includes(scenario.id)
                        ? "border-almet-sapphire bg-blue-50 dark:bg-blue-900/20 shadow-md"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                    onClick={() => compareMode ? toggleScenarioForComparison(scenario.id) : handleViewDetails(scenario)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-sm text-almet-cloud-burst dark:text-white mb-1">
                          {scenario.name}
                        </h3>
                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Calendar size={10} />
                          {new Date(scenario.createdAt).toLocaleDateString()}
                        </div>
                        {scenario.createdBy && (
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            <User size={10} />
                            {scenario.createdBy}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {compareMode && (
                          <input
                            type="checkbox"
                            checked={selectedForComparison.includes(scenario.id)}
                            onChange={() => toggleScenarioForComparison(scenario.id)}
                            className="w-4 h-4 text-almet-sapphire rounded focus:ring-almet-sapphire"
                          />
                        )}
                        {bestDraft && bestDraft.id === scenario.id && !compareMode && (
                          <span className="text-xs bg-green-600 text-white px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                            ★ Best
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                        <div className="text-sm font-semibold text-blue-600">
                          {((scenario.data?.verticalAvg || 0) * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Vertical</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 dark:bg-green-900/30 rounded-md">
                        <div className="text-sm font-semibold text-green-600">
                          {((scenario.data?.horizontalAvg || 0) * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Horizontal</div>
                      </div>
                      <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/30 rounded-md">
                        <div className="text-sm font-semibold text-purple-600">
                          {(scenario.data?.baseValue1 || 0).toLocaleString()}
                        </div>
                        <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Base</div>
                      </div>
                    </div>

                    {/* Metrics Display */}
                    <MetricsDisplay scenario={scenario} />

                    {!compareMode && (
                      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSaveAsCurrent(scenario.id); }}
                          className="flex-1 bg-almet-sapphire text-white px-2 py-1.5 text-xs rounded-md hover:bg-almet-astral transition-all shadow-md flex items-center justify-center gap-1"
                        >
                          <CheckCircle size={10} />
                          Apply
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleArchiveDraft(scenario.id); }}
                          className="bg-gray-400 text-white px-2 py-1.5 text-xs rounded-md hover:bg-gray-500 transition-all shadow-md flex items-center justify-center gap-1"
                        >
                          <Archive size={10} />
                          Archive
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-400 mb-3">
                    <Calculator size={48} className="mx-auto" />
                  </div>
                  <h3 className="text-base font-semibold text-almet-waterloo dark:text-almet-bali-hai mb-2">No Draft Scenarios</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-3">
                    Create your first scenario above with enhanced calculations
                  </p>
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="bg-almet-sapphire text-white px-4 py-2 text-sm rounded-md hover:bg-almet-astral transition-colors inline-flex items-center gap-2"
                  >
                    <Plus size={12} />
                    Create First Scenario
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Archived Scenarios */}
        {archivedScenarios.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gray-600 rounded-md">
                  <Archive size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white">
                    Archived Scenarios
                  </h2>
                  <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                    {archivedScenarios.length} previous scenarios for reference
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {archivedScenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className="p-3 rounded-md border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-all opacity-75 hover:opacity-100"
                    onClick={() => handleViewDetails(scenario)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-medium text-almet-cloud-burst dark:text-white text-xs">
                          {scenario.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(scenario.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-xs bg-gray-500 text-white px-1.5 py-0.5 rounded">Archived</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-xs font-semibold">{((scenario.data?.verticalAvg || 0) * 100).toFixed(1)}%</div>
                        <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai">V</div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold">{((scenario.data?.horizontalAvg || 0) * 100).toFixed(1)}%</div>
                        <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai">H</div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold">{(scenario.data?.baseValue1 || 0).toLocaleString()}</div>
                        <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Base</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Detail Modal */}
        {isDetailOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl max-h-[95vh] overflow-y-auto border border-gray-200 dark:border-gray-700 shadow-2xl">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-bold text-almet-cloud-burst dark:text-white">
                      {compareMode && selectedForComparison.length >= 2 ? 
                        `Scenario Comparison (${selectedForComparison.length} scenarios)` : 
                        selectedScenario ? `${selectedScenario.name}` : 'Scenario Details'
                      }
                    </h2>
                    <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-1">
                      {compareMode ? 'Compare multiple scenarios side by side' : 'Detailed view with global horizontal intervals'}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsDetailOpen(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-4">
                {compareMode && selectedForComparison.length >= 2 ? (
                  // Enhanced Comparison View
                  <div className="space-y-6">
                    {/* Comparison Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {selectedForComparison.map(scenarioId => {
                        const scenario = getScenarioForComparison(scenarioId);
                        if (!scenario) return null;
                        
                        const scenarioData = scenario.data || scenario;
                        return (
                          <div key={scenarioId} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <h3 className="font-bold text-sm mb-3 text-almet-cloud-burst dark:text-white">{scenario.name}</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Base Value:</span>
                                <span className="font-semibold text-xs">{(scenarioData.baseValue1 || 0).toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Vertical Avg:</span>
                                <span className="font-semibold text-xs text-blue-600">{((scenarioData.verticalAvg || 0) * 100).toFixed(1)}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Horizontal Avg:</span>
                                <span className="font-semibold text-xs text-green-600">{((scenarioData.horizontalAvg || 0) * 100).toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Detailed Comparison Table */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold mb-3">Position-by-Position Comparison</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                              <th className="text-left py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">Grade</th>
                              {selectedForComparison.map(scenarioId => {
                                const scenario = getScenarioForComparison(scenarioId);
                                return scenario ? (
                                  <th key={scenarioId} className="text-center py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">
                                    <div className="font-medium">{scenario.name}</div>
                                    <div className="text-xs font-normal text-gray-500">Median Values</div>
                                  </th>
                                ) : null;
                              })}
                            </tr>
                          </thead>
                          <tbody>
                            {currentData.gradeOrder.map(gradeName => (
                              <tr key={gradeName} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/50">
                                <td className="py-2 px-3 text-xs font-medium">{gradeName}</td>
                                {selectedForComparison.map(scenarioId => {
                                  const scenario = getScenarioForComparison(scenarioId);
                                  const scenarioData = scenario?.data || scenario;
                                  const gradeData = scenarioData?.grades?.[gradeName];
                                  return (
                                    <td key={scenarioId} className="py-2 px-3 text-center">
                                      {gradeData ? (
                                        <div>
                                          <div className="font-mono font-bold text-sm text-blue-600">{(gradeData.M || 0).toLocaleString()}</div>
                                          <div className="text-xs text-gray-500">
                                            V: {gradeData.vertical || 0}% | H: Global
                                          </div>
                                        </div>
                                      ) : (
                                        <span className="text-gray-400">-</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                ) : selectedScenario ? (
                  // Enhanced Single Scenario Detail View
                  <div className="space-y-6">
                    {/* Scenario Overview - FIXED values display */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="text-xl font-bold text-blue-600 mb-2">
                          {parseFloat(selectedScenario.data?.baseValue1 || selectedScenario.baseValue1 || 0).toLocaleString()}
                        </div>
                        <div className="text-xs font-semibold text-almet-cloud-burst dark:text-white">Base Value</div>
                        <div className="text-xs text-gray-500 mt-1">{getBasePositionName()}</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="text-xl font-bold text-green-600 mb-2">
                          {((selectedScenario.data?.verticalAvg !== undefined ? selectedScenario.data.verticalAvg : selectedScenario.vertical_avg || 0) * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs font-semibold text-almet-cloud-burst dark:text-white">Vertical Average</div>
                        <div className="text-xs text-gray-500 mt-1">Position transitions</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="text-xl font-bold text-purple-600 mb-2">
                          {((selectedScenario.data?.horizontalAvg !== undefined ? selectedScenario.data.horizontalAvg : selectedScenario.horizontal_avg || 0) * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs font-semibold text-almet-cloud-burst dark:text-white">Horizontal Average</div>
                        <div className="text-xs text-gray-500 mt-1">Global intervals</div>
                      </div>
                      {selectedScenario.metrics && (
                        <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <div className="text-xl font-bold text-yellow-600 mb-2">
                            {(selectedScenario.metrics.totalBudgetImpact || 0).toLocaleString()}
                          </div>
                          <div className="text-xs font-semibold text-almet-cloud-burst dark:text-white">Budget Impact</div>
                          <div className="text-xs text-gray-500 mt-1">Total cost</div>
                        </div>
                      )}
                    </div>

                    {/* Global Intervals Display */}
                    {(selectedScenario.data?.globalHorizontalIntervals || 
                      (selectedScenario.input_rates && Object.keys(selectedScenario.input_rates).length > 0)) && (
                      <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
                        <h3 className="font-semibold text-sm text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                          <span className="text-blue-600 text-lg">🌐</span>
                          Global Horizontal Intervals (Applied to All Positions)
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {(() => {
                            let intervals = selectedScenario.data?.globalHorizontalIntervals;
                            
                            if (!intervals || Object.values(intervals).every(v => v === 0)) {
                              intervals = { LD_to_LQ: 0, LQ_to_M: 0, M_to_UQ: 0, UQ_to_UD: 0 };
                              
                              if (selectedScenario.input_rates) {
                                for (const [gradeName, gradeData] of Object.entries(selectedScenario.input_rates)) {
                                  if (gradeData && gradeData.horizontal_intervals) {
                                    intervals = { ...gradeData.horizontal_intervals };
                                    break;
                                  }
                                }
                              }
                            }
                            
                            return Object.entries(intervals).map(([key, value]) => {
                              const displayName = key.replace(/_to_/g, ' → ').replace(/_/g, ' ');
                              return (
                                <div key={key} className="text-center p-3 bg-white dark:bg-gray-800 rounded-md border shadow-sm">
                                  <div className="font-bold text-lg text-blue-600 mb-1">{value || 0}%</div>
                                  <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai">{displayName}</div>
                                </div>
                              );
                            });
                          })()}
                        </div>
                        <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded-md border border-indigo-200 dark:border-indigo-800">
                          <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai text-center">
                            These intervals are applied uniformly across all {currentData.gradeOrder.length} position groups
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Simplified Metrics Display */}
                    {selectedScenario.metrics && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                          <h4 className="font-semibold text-sm text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                            <DollarSign size={16} className="text-green-600" />
                            Financial Impact
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Average Salary Increase:</span>
                              <span className={`font-semibold text-sm ${(selectedScenario.metrics.avgSalaryIncrease || 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {(selectedScenario.metrics.avgSalaryIncrease || 0) > 0 ? '+' : ''}{(selectedScenario.metrics.avgSalaryIncrease || 0).toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Max Salary Increase:</span>
                              <span className="font-semibold text-sm text-orange-600">
                                {(selectedScenario.metrics.maxSalaryIncrease || 0).toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Positions Affected:</span>
                              <span className="font-semibold text-sm text-blue-600">{selectedScenario.metrics.positionsAffected || 0}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                          <h4 className="font-semibold text-sm text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                            <Info size={16} className="text-blue-600" />
                            Scenario Information
                          </h4>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Created:</span>
                              <span className="font-semibold text-xs">{new Date(selectedScenario.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Status:</span>
                              <span className={`font-semibold capitalize px-2 py-0.5 rounded-full text-xs ${
                                selectedScenario.status === 'current' ? 'bg-green-100 text-green-700' : 
                                selectedScenario.status === 'draft' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {selectedScenario.status || 'Draft'}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Calculated:</span>
                              <span className={`font-semibold text-xs ${selectedScenario.isCalculated ? 'text-green-600' : 'text-orange-600'}`}>
                                {selectedScenario.isCalculated ? 'Yes' : 'No'}
                              </span>
                            </div>
                            {selectedScenario.createdBy && (
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Created By:</span>
                                <span className="font-semibold text-xs">{selectedScenario.createdBy}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Enhanced Detailed Grade Table */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold mb-3">Detailed Grade Breakdown</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                              <th className="text-left py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">Grade</th>
                              <th className="text-center py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">
                                <div>Vertical %</div>
                              </th>
                              <th className="text-center py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">
                                <div>Horizontal</div>
                              </th>
                              <th className="text-right py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">LD</th>
                              <th className="text-right py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">LQ</th>
                              <th className="text-right py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai bg-blue-50 dark:bg-blue-900/20">Median</th>
                              <th className="text-right py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">UQ</th>
                              <th className="text-right py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">UD</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(selectedScenario.data?.gradeOrder || selectedScenario.gradeOrder || currentData.gradeOrder).map((gradeName, index) => {
                              const scenarioData = selectedScenario.data || selectedScenario;
                              const values = scenarioData.grades?.[gradeName];
                              const isBasePosition = gradeName === getBasePositionName();
                              const isTopPosition = index === 0;
                              
                              let verticalValue = null;
                              if (selectedScenario.input_rates && selectedScenario.input_rates[gradeName]) {
                                const gradeInput = selectedScenario.input_rates[gradeName];
                                if (gradeInput.vertical !== null && gradeInput.vertical !== undefined) {
                                  verticalValue = gradeInput.vertical;
                                }
                              }
                              
                              if (!values) return null;
                              
                              return (
                                <tr key={gradeName} className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/50 ${isBasePosition ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}>
                                  <td className="py-3 px-3 text-xs font-medium">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${
                                        isTopPosition ? 'bg-red-500' : isBasePosition ? 'bg-blue-500' : 'bg-gray-400'
                                      }`} />
                                      {gradeName}
                                      {isTopPosition && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full">Top</span>}
                                      {isBasePosition && (
                                        <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                          <Target size={8} />
                                          Base
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  
                                  {/* Vertical Input Display */}
                                  <td className="py-3 px-3 text-xs text-center">
                                    {!isBasePosition && verticalValue !== null && verticalValue !== undefined ? (
                                      <span className="font-mono font-semibold text-sm text-blue-600">{parseFloat(verticalValue || "0").toFixed(1)}%</span>
                                    ) : (
                                      <span className="text-gray-400 italic">N/A {isBasePosition ? '(Base)' : ''}</span>
                                    )}
                                  </td>
                                  
                                  {/* Horizontal - Global Status */}
                                  <td className="py-3 px-3 text-xs text-center">
                                    <span className="text-xs text-blue-600 font-medium flex items-center justify-center gap-1">
                                      🌐 Global
                                    </span>
                                  </td>
                                  
                                  {/* Calculated Values */}
                                  <td className="py-3 px-3 text-xs text-right font-mono">{(values.LD || 0).toLocaleString()}</td>
                                  <td className="py-3 px-3 text-xs text-right font-mono">{(values.LQ || 0).toLocaleString()}</td>
                                  <td className="py-3 px-3 text-xs text-right font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20">{(values.M || 0).toLocaleString()}</td>
                                  <td className="py-3 px-3 text-xs text-right font-mono">{(values.UQ || 0).toLocaleString()}</td>
                                  <td className="py-3 px-3 text-xs text-right font-mono">{(values.UD || 0).toLocaleString()}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Action Buttons for Single Scenario */}
                    {selectedScenario.status === 'draft' && (
                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => {
                            handleSaveAsCurrent(selectedScenario.id);
                            setIsDetailOpen(false);
                          }}
                          className="bg-green-600 text-white px-6 py-2 text-sm font-medium rounded-md hover:bg-green-700 transition-all shadow-md flex items-center gap-2"
                        >
                          <CheckCircle size={14} />
                          Apply as Current
                        </button>
                        <button
                          onClick={() => {
                            handleArchiveDraft(selectedScenario.id);
                            setIsDetailOpen(false);
                          }}
                          className="bg-gray-500 text-white px-6 py-2 text-sm font-medium rounded-md hover:bg-gray-600 transition-all shadow-md flex items-center gap-2"
                        >
                          <Archive size={14} />
                          Archive
                        </button>
                      </div>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default GradingPage;