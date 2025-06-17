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
  Activity,
  Database,
  Zap,
  Settings
} from "lucide-react";
import useGrading from "@/hooks/useGrading";

const GradingPage = () => {
  const { darkMode } = useTheme();
  
  // ENHANCED: Use complete hook with all functionality
  const {
    // Core data
    currentData,
    currentScenario,
    positionGroups,
    scenarioInputs,
    calculatedOutputs,
    newScenarioDisplayData,
    draftScenarios,
    archivedScenarios,
    selectedScenario,
    bestDraft,
    basePositionName,
    
    // Computed state
    validationSummary,
    inputSummary,
    dataAvailability,
    
    // UI state
    isDetailOpen,
    setIsDetailOpen,
    compareMode,
    selectedForComparison,
    isLoading,
    isCalculating,
    errors,
    hasErrors,
    isInitialized,
    
    // Loading states (direct access)
    loading,
    
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
    calculateGrades,
    refreshData
  } = useGrading();

  // ENHANCED: Safe value extraction with null handling
  const safeValue = (value, defaultValue = 0) => {
    if (value === null || value === undefined || value === '') {
      return defaultValue;
    }
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  };

  // ENHANCED: Safe percentage display
  const formatPercentage = (value, decimals = 1) => {
    const numValue = safeValue(value);
    return `${(numValue * 100).toFixed(decimals)}%`;
  };

  // ENHANCED: Safe currency display
  const formatCurrency = (value) => {
    const numValue = safeValue(value);
    return numValue.toLocaleString();
  };

  // FIXED: Get comparison data with proper input value extraction
  const getComparisonData = (scenarioId) => {
    if (scenarioId === 'current') {
      return {
        scenario: currentData,
        data: currentData,
        name: 'Current Structure',
        status: 'current'
      };
    }
    
    // Find scenario in all collections
    const allScenarios = [...draftScenarios, ...archivedScenarios];
    const scenario = allScenarios.find(s => s.id === scenarioId);
    
    if (!scenario) return null;
    
    return {
      scenario,
      data: scenario.data || scenario,
      name: scenario.name,
      status: scenario.status || 'draft'
    };
  };

  // FIXED: Get vertical input value for specific scenario and grade
  const getVerticalInputValue = (scenarioId, gradeName) => {
    if (scenarioId === 'current') {
      return null; // Current structure doesn't have input values
    }
    
    const allScenarios = [...draftScenarios, ...archivedScenarios];
    const scenario = allScenarios.find(s => s.id === scenarioId);
    
    if (!scenario) return null;
    
    // Try to get from input_rates first (backend data)
    if (scenario.input_rates && scenario.input_rates[gradeName] && scenario.input_rates[gradeName].vertical !== undefined) {
      return scenario.input_rates[gradeName].vertical;
    }
    
    // Try to get from data.positionVerticalInputs
    if (scenario.data && scenario.data.positionVerticalInputs && scenario.data.positionVerticalInputs[gradeName] !== undefined) {
      return scenario.data.positionVerticalInputs[gradeName];
    }
    
    // Try to get from grades data
    if (scenario.data && scenario.data.grades && scenario.data.grades[gradeName] && scenario.data.grades[gradeName].verticalInput !== undefined) {
      return scenario.data.grades[gradeName].verticalInput;
    }
    
    return null;
  };

  // FIXED: Get horizontal input values for specific scenario
  const getHorizontalInputValues = (scenarioId) => {
    if (scenarioId === 'current') {
      return {
        LD_to_LQ: 0,
        LQ_to_M: 0,
        M_to_UQ: 0,
        UQ_to_UD: 0
      };
    }
    
    const allScenarios = [...draftScenarios, ...archivedScenarios];
    const scenario = allScenarios.find(s => s.id === scenarioId);
    
    if (!scenario) return null;
    
    // Try to get from data.globalHorizontalIntervals first
    if (scenario.data && scenario.data.globalHorizontalIntervals) {
      return scenario.data.globalHorizontalIntervals;
    }
    
    // Try to get from input_rates (any position should have the same global intervals)
    if (scenario.input_rates) {
      for (const [gradeName, gradeData] of Object.entries(scenario.input_rates)) {
        if (gradeData && gradeData.horizontal_intervals) {
          return gradeData.horizontal_intervals;
        }
      }
    }
    
    return {
      LD_to_LQ: 0,
      LQ_to_M: 0,
      M_to_UQ: 0,
      UQ_to_UD: 0
    };
  };

  // ENHANCED: Metrics display component with safe data handling
  const MetricsDisplay = ({ scenario, size = "sm" }) => {
    if (!scenario || !scenario.metrics) return null;

    const sizeClasses = size === "lg" ? "px-3 py-2 text-sm" : "px-2 py-1 text-xs";
    const metrics = scenario.metrics;

    return (
      <div className={`space-y-1 ${sizeClasses}`}>
        <div className="flex justify-between">
          <span className="text-almet-waterloo dark:text-almet-bali-hai">Budget Impact:</span>
          <span className="font-medium text-xs">{formatCurrency(metrics.totalBudgetImpact)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-almet-waterloo dark:text-almet-bali-hai">Avg Increase:</span>
          <span className={`font-medium text-xs ${
            safeValue(metrics.avgSalaryIncrease) > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {safeValue(metrics.avgSalaryIncrease) > 0 ? '+' : ''}
            {safeValue(metrics.avgSalaryIncrease).toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-almet-waterloo dark:text-almet-bali-hai">Max Increase:</span>
          <span className="font-medium text-xs text-orange-600">
            {safeValue(metrics.maxSalaryIncrease).toFixed(1)}%
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-almet-waterloo dark:text-almet-bali-hai">Positions:</span>
          <span className="font-medium text-xs">{safeValue(metrics.positionsAffected, 0)}</span>
        </div>
      </div>
    );
  };

  // ENHANCED: Loading spinner with detailed messages
  const LoadingSpinner = ({ message = "Loading..." }) => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-almet-sapphire mx-auto mb-3"></div>
        <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai">{message}</p>
        {!isInitialized && (
          <p className="text-xs text-gray-500 mt-2">Initializing grading system...</p>
        )}
      </div>
    </div>
  );

  // ENHANCED: Error display with retry functionality
  const ErrorDisplay = ({ error, onRetry }) => (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center max-w-md">
        <div className="text-red-500 mb-3">
          <AlertTriangle size={32} className="mx-auto mb-2" />
          <h3 className="text-base font-medium">System Error</h3>
        </div>
        <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai mb-3">{error}</p>
        <p className="text-xs text-gray-500 mb-3">
          Please ensure the database is properly configured with position groups.
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-almet-sapphire text-white px-4 py-2 text-sm rounded-md hover:bg-almet-astral transition-colors flex items-center gap-2 mx-auto"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        )}
      </div>
    </div>
  );

  // Show loading state
  if (isLoading && !isInitialized) {
    return (
      <DashboardLayout>
        <LoadingSpinner message="Loading grading system..." />
      </DashboardLayout>
    );
  }

  // Show error if no current data
  if (errors.currentStructure || !dataAvailability.hasCurrentData) {
    return (
      <DashboardLayout>
        <ErrorDisplay 
          error={errors.currentStructure || "No grading structure found in database"} 
          onRetry={refreshData}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 space-y-4 max-w-7xl mx-auto">
        {/* ENHANCED: Header with system status */}
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
            
          </div>
        </div>

        {/* ENHANCED: Current Situation with safe data display */}
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
                  Active compensation structure with {currentData?.gradeOrder?.length || 0} position groups
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4">
            {/* ENHANCED: Key Metrics with safe calculations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md border border-blue-200 dark:border-blue-800">
                <div className="text-xl font-bold text-blue-600 mb-1">
                  {formatPercentage(currentData?.verticalAvg)}
                </div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Vertical Average</div>
                <div className="text-xs text-gray-500 mt-0.5">Position transitions</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                <div className="text-xl font-bold text-green-600 mb-1">
                  {formatPercentage(currentData?.horizontalAvg)}
                </div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Horizontal Average</div>
                <div className="text-xs text-gray-500 mt-0.5">Salary spreads</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-md border border-purple-200 dark:border-purple-800">
                <div className="text-xl font-bold text-purple-600 mb-1">
                  {formatCurrency(currentData?.baseValue1)}
                </div>
                <div className="text-xs font-medium text-gray-700 dark:text-gray-300">Base Value</div>
                <div className="text-xs text-gray-500 mt-0.5">{basePositionName}</div>
              </div>
            </div>

            {/* ENHANCED: Current Structure Table with safe data display */}
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
                    {(currentData?.gradeOrder || []).map((gradeName, index) => {
                      const values = currentData?.grades?.[gradeName] || {};
                      const isBasePosition = gradeName === basePositionName;
                      const isTopPosition = index === 0;
                      
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
                            {formatCurrency(values.LD)}
                          </td>
                          <td className="py-3 px-3 text-xs text-right font-mono text-almet-waterloo dark:text-almet-bali-hai">
                            {formatCurrency(values.LQ)}
                          </td>
                          <td className="py-3 px-3 text-xs text-right font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20">
                            {formatCurrency(values.M)}
                          </td>
                          <td className="py-3 px-3 text-xs text-right font-mono text-almet-waterloo dark:text-almet-bali-hai">
                            {formatCurrency(values.UQ)}
                          </td>
                          <td className="py-3 px-3 text-xs text-right font-mono text-almet-waterloo dark:text-almet-bali-hai">
                            {formatCurrency(values.UD)}
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

        {/* ENHANCED: Create New Scenario with validation feedback */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center justify-between">
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
          </div>
          
          <div className="p-4 space-y-6">
            {/* ENHANCED: Base Value Input with validation */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-almet-cloud-burst dark:text-white">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-md">
                  <Target size={12} className="text-blue-600" />
                </div>
                Base Value ({basePositionName} LD)
              </label>
              <div className="max-w-md">
                <input
                  type="number"
                  value={scenarioInputs.baseValue1 || ''}
                  onChange={(e) => handleBaseValueChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-sapphire focus:border-transparent transition-colors ${
                    errors.baseValue1 ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                  }`}
                  placeholder={`Enter base salary for ${basePositionName}`}
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

            {/* ENHANCED: Global Horizontal Intervals with validation */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-indigo-50 dark:bg-indigo-900/20">
              <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-md">
                  <Settings size={12} className="text-indigo-600" />
                </div>
                Global Horizontal Intervals 
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {['LD_to_LQ', 'LQ_to_M', 'M_to_UQ', 'UQ_to_UD'].map((intervalKey) => {
                  const displayName = intervalKey.replace(/_to_/g, ' → ').replace(/_/g, ' ');
                  const errorKey = `global-horizontal-${intervalKey}`;
                  
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
                            errors[errorKey] ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                          }`}
                          placeholder="0"
                          min="0"
                          max="100"
                          step="0.1"
                        />
                        <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">%</span>
                      </div>
                      {errors[errorKey] && (
                        <p className="text-red-500 text-xs">{errors[errorKey]}</p>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* ENHANCED: Global intervals explanation */}
              <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded-md border border-indigo-200 dark:border-indigo-800">
                <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai text-center">
                  These intervals are applied uniformly across all {scenarioInputs.gradeOrder?.length || 0} position groups for consistent salary spreads
                </p>
              </div>
            </div>

            {/* ENHANCED: Position Table with real-time calculation */}
            {newScenarioDisplayData && (
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white flex items-center gap-2">
                    <Activity size={14} />
                    Real-time Calculation Results
                    {isCalculating && (
                      <RefreshCw size={12} className="animate-spin text-blue-500" />
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
                        <th className="text-left py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">
                          Grade Level
                        </th>
                        <th className="text-center py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">
                          Vertical %
                        </th>
                        <th className="text-center py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">
                          Status
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
                        const gradeData = newScenarioDisplayData.grades[gradeName] || {};
                        const isBasePosition = gradeName === basePositionName;
                        const isTopPosition = index === 0;
                        const errorKey = `vertical-${gradeName}`;
                        
                        // Enhanced LD calculation for base position
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
                            
                            {/* ENHANCED: Vertical Input with validation feedback */}
                            <td className="py-3 px-3 text-center">
                              {!isBasePosition ? (
                                <div className="flex flex-col items-center space-y-1">
                                  <div className="relative">
                                    <input
                                      type="number"
                                      value={gradeData.vertical || ''}
                                      onChange={(e) => handleVerticalChange(gradeName, e.target.value)}
                                      className={`w-16 px-1.5 py-1 text-xs border rounded text-center dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-almet-sapphire transition-colors ${
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
                            
                            {/* ENHANCED: Status indicator */}
                            <td className="py-3 px-3 text-center">
                              {gradeData.isCalculated ? (
                                <span className="text-xs text-green-600 font-medium flex items-center justify-center gap-1">
                                  <CheckCircle size={8} />
                                  Ready
                                </span>
                              ) : isBasePosition && scenarioInputs.baseValue1 > 0 ? (
                                <span className="text-xs text-blue-600 font-medium flex items-center justify-center gap-1">
                                  <Target size={8} />
                                  Base
                                </span>
                              ) : (
                                <span className="text-xs text-gray-400 italic">Pending</span>
                              )}
                            </td>
                            
                            {/* ENHANCED: Calculated Values with proper formatting */}
                            <td className="py-3 px-3 text-xs text-right font-mono">
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
                            <td className="py-3 px-3 text-xs text-right font-mono">
                              <span className={gradeData.LQ && gradeData.LQ !== "" ? "text-green-600" : "text-gray-400"}>
                                {gradeData.LQ && gradeData.LQ !== "" ? formatCurrency(gradeData.LQ) : "-"}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-xs text-right font-mono font-bold bg-blue-50 dark:bg-blue-900/20">
                              <span className={gradeData.M && gradeData.M !== "" ? "text-green-600" : "text-gray-400"}>
                                {gradeData.M && gradeData.M !== "" ? formatCurrency(gradeData.M) : "-"}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-xs text-right font-mono">
                              <span className={gradeData.UQ && gradeData.UQ !== "" ? "text-green-600" : "text-gray-400"}>
                                {gradeData.UQ && gradeData.UQ !== "" ? formatCurrency(gradeData.UQ) : "-"}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-xs text-right font-mono">
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

            {/* ENHANCED: Save Button with detailed validation feedback */}
            <div className="flex justify-end items-end p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
           
              <button
                onClick={handleSaveDraft}
                disabled={!validationSummary?.canSave || loading.saving}
                className={`px-6 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                  validationSummary?.canSave && !loading.saving
                    ? "bg-almet-sapphire text-white hover:bg-almet-astral shadow-md hover:shadow-lg"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                {loading.saving ? (
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

        {/* ENHANCED: Draft Scenarios with improved data display */}
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
            {/* Current Structure for comparison */}
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
                        {formatPercentage(currentData?.verticalAvg)}
                      </div>
                      <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Vertical</div>
                    </div>
                    <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-md">
                      <div className="text-sm font-semibold text-almet-cloud-burst dark:text-white">
                        {formatPercentage(currentData?.horizontalAvg)}
                      </div>
                      <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Horizontal</div>
                    </div>
                    <div className="text-center p-2 bg-white dark:bg-gray-800 rounded-md">
                      <div className="text-sm font-semibold text-almet-cloud-burst dark:text-white">
                        {formatCurrency(currentData?.baseValue1)}
                      </div>
                      <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Base Value</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ENHANCED: Draft Scenarios Grid with safe data handling */}
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
                       
                      </div>
                    </div>

                    {/* ENHANCED: Scenario metrics with safe data handling */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/30 rounded-md">
                        <div className="text-sm font-semibold text-blue-600">
                          {formatPercentage(scenario.data?.verticalAvg)}
                        </div>
                        <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Vertical</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 dark:bg-green-900/30 rounded-md">
                        <div className="text-sm font-semibold text-green-600">
                          {formatPercentage(scenario.data?.horizontalAvg)}
                        </div>
                        <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Horizontal</div>
                      </div>
                      <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/30 rounded-md">
                        <div className="text-sm font-semibold text-purple-600">
                          {formatCurrency(scenario.data?.baseValue1)}
                        </div>
                        <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Base</div>
                      </div>
                    </div>

                    {/* ENHANCED: Metrics Display */}
                    <MetricsDisplay scenario={scenario} />

                    {!compareMode && (
                      <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSaveAsCurrent(scenario.id); }}
                          disabled={loading.applying}
                          className="flex-1 bg-almet-sapphire text-white px-2 py-1.5 text-xs rounded-md hover:bg-almet-astral transition-all shadow-md flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          {loading.applying ? (
                            <RefreshCw size={10} className="animate-spin" />
                          ) : (
                            <CheckCircle size={10} />
                          )}
                          Apply
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleArchiveDraft(scenario.id); }}
                          disabled={loading.archiving}
                          className="bg-gray-400 text-white px-2 py-1.5 text-xs rounded-md hover:bg-gray-500 transition-all shadow-md flex items-center justify-center gap-1 disabled:opacity-50"
                        >
                          {loading.archiving ? (
                            <RefreshCw size={10} className="animate-spin" />
                          ) : (
                            <Archive size={10} />
                          )}
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

        {/* ENHANCED: Archived Scenarios with safe data handling */}
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
                        <div className="text-xs font-semibold">{formatPercentage(scenario.data?.verticalAvg)}</div>
                        <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai">V</div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold">{formatPercentage(scenario.data?.horizontalAvg)}</div>
                        <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai">H</div>
                      </div>
                      <div>
                        <div className="text-xs font-semibold">{formatCurrency(scenario.data?.baseValue1)}</div>
                        <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Base</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FIXED: Detail Modal with enhanced comparison view */}
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
                      {compareMode ? 'Compare multiple scenarios with input data visualization' : 'Detailed view with comprehensive data analysis'}
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
                  // FIXED: Enhanced Comparison View with proper input data display
                  <div className="space-y-6">
                    {/* FIXED: Comparison Summary with input data */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {selectedForComparison.map(scenarioId => {
                        const comparisonData = getComparisonData(scenarioId);
                        if (!comparisonData) return null;
                        
                        const { scenario, data, name, status } = comparisonData;
                        const horizontalInputs = getHorizontalInputValues(scenarioId);
                        
                        return (
                          <div key={scenarioId} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <h3 className="font-bold text-sm mb-3 text-almet-cloud-burst dark:text-white">
                              {name}
                            </h3>
                            <div className="space-y-2">
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
                                  {status}
                                </span>
                              </div>
                            </div>
                            
                            {/* FIXED: Horizontal Input Display */}
                            {horizontalInputs && (
                              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                <div className="text-xs font-medium text-almet-cloud-burst dark:text-white mb-2">Horizontal Intervals:</div>
                                <div className="grid grid-cols-2 gap-1 text-xs">
                                  {Object.entries(horizontalInputs).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
                                      <span className="text-almet-waterloo dark:text-almet-bali-hai truncate">{key.replace(/_/g, '→').replace('to', '')}</span>
                                      <span className="font-mono">{safeValue(value).toFixed(1)}%</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* FIXED: Detailed Comparison Table with input data */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold mb-3">Position-by-Position Comparison</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                              <th className="text-left py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">Grade</th>
                              {selectedForComparison.map(scenarioId => {
                                const comparisonData = getComparisonData(scenarioId);
                                return comparisonData ? (
                                  <th key={scenarioId} className="text-center py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">
                                    <div className="font-medium">{comparisonData.name}</div>
                                    <div className="text-xs font-normal text-gray-500">Median | Vertical Input</div>
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
                                  <td className="py-2 px-3 text-xs font-medium">
                                    <div className="flex items-center gap-2">
                                      <div className={`w-2 h-2 rounded-full ${
                                        index === 0 ? 'bg-red-500' : isBasePosition ? 'bg-blue-500' : 'bg-gray-400'
                                      }`} />
                                      {gradeName}
                                      {isBasePosition && (
                                        <span className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded">Base</span>
                                      )}
                                    </div>
                                  </td>
                                  {selectedForComparison.map(scenarioId => {
                                    const comparisonData = getComparisonData(scenarioId);
                                    const data = comparisonData?.data;
                                    const gradeData = data?.grades?.[gradeName];
                                    const verticalInput = getVerticalInputValue(scenarioId, gradeName);
                                    
                                    return (
                                      <td key={scenarioId} className="py-2 px-3 text-center">
                                        {gradeData ? (
                                          <div>
                                            <div className="font-mono font-bold text-sm text-blue-600">
                                              {formatCurrency(gradeData.M)}
                                            </div>
                                            <div className="text-xs text-gray-500 mt-1">
                                              {!isBasePosition ? (
                                                verticalInput !== null && verticalInput !== undefined ? (
                                                  <span className="text-orange-600 font-medium">
                                                    V: {safeValue(verticalInput)}%
                                                  </span>
                                                ) : (
                                                  <span className="text-gray-400">V: N/A</span>
                                                )
                                              ) : (
                                                <span className="text-blue-600 font-medium">Base Position</span>
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

                    {/* FIXED: Horizontal Intervals Comparison */}
                    <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4">
                      <h3 className="text-sm font-semibold mb-3 text-almet-cloud-burst dark:text-white">
                        Horizontal Intervals Comparison
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-indigo-200 dark:border-indigo-800">
                              <th className="text-left py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">Interval</th>
                              {selectedForComparison.map(scenarioId => {
                                const comparisonData = getComparisonData(scenarioId);
                                return comparisonData ? (
                                  <th key={scenarioId} className="text-center py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">
                                    {comparisonData.name}
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
                                  <td className="py-2 px-3 text-xs font-medium">{displayName}</td>
                                  {selectedForComparison.map(scenarioId => {
                                    const horizontalInputs = getHorizontalInputValues(scenarioId);
                                    const intervalValue = horizontalInputs?.[intervalKey];
                                    
                                    return (
                                      <td key={scenarioId} className="py-2 px-3 text-center">
                                        <span className="font-mono text-sm text-green-600 font-bold">
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
                    </div>
                  </div>
                ) : selectedScenario ? (
                  // ENHANCED: Single Scenario Detail View with comprehensive data
                  <div className="space-y-6">
                    {/* ENHANCED: Scenario Overview with safe value extraction */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="text-xl font-bold text-blue-600 mb-2">
                          {formatCurrency(selectedScenario.data?.baseValue1 || selectedScenario.baseValue1)}
                        </div>
                        <div className="text-xs font-semibold text-almet-cloud-burst dark:text-white">Base Value</div>
                        <div className="text-xs text-gray-500 mt-1">{basePositionName}</div>
                      </div>
                      <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="text-xl font-bold text-green-600 mb-2">
                          {formatPercentage(selectedScenario.data?.verticalAvg !== undefined ? selectedScenario.data.verticalAvg : selectedScenario.vertical_avg)}
                        </div>
                        <div className="text-xs font-semibold text-almet-cloud-burst dark:text-white">Vertical Average</div>
                        <div className="text-xs text-gray-500 mt-1">Position transitions</div>
                      </div>
                      <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="text-xl font-bold text-purple-600 mb-2">
                          {formatPercentage(selectedScenario.data?.horizontalAvg !== undefined ? selectedScenario.data.horizontalAvg : selectedScenario.horizontal_avg)}
                        </div>
                        <div className="text-xs font-semibold text-almet-cloud-burst dark:text-white">Horizontal Average</div>
                        <div className="text-xs text-gray-500 mt-1">Global intervals</div>
                      </div>
                      {selectedScenario.metrics && (
                        <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <div className="text-xl font-bold text-yellow-600 mb-2">
                            {formatCurrency(selectedScenario.metrics.totalBudgetImpact)}
                          </div>
                          <div className="text-xs font-semibold text-almet-cloud-burst dark:text-white">Budget Impact</div>
                          <div className="text-xs text-gray-500 mt-1">Total cost</div>
                        </div>
                      )}
                    </div>

                    {/* ENHANCED: Global Intervals Display with safe data extraction */}
                    {(() => {
                      const globalIntervals = selectedScenario.data?.globalHorizontalIntervals || {};
                      const hasIntervals = Object.values(globalIntervals).some(v => safeValue(v) > 0);
                      
                      // Fallback: extract from input_rates if no global intervals
                      if (!hasIntervals && selectedScenario.input_rates) {
                        for (const [gradeName, gradeData] of Object.entries(selectedScenario.input_rates)) {
                          if (gradeData && gradeData.horizontal_intervals) {
                            Object.assign(globalIntervals, gradeData.horizontal_intervals);
                            break;
                          }
                        }
                      }
                      
                      return hasIntervals || Object.values(globalIntervals).some(v => safeValue(v) > 0) ? (
                        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-lg p-4 border border-indigo-200 dark:border-indigo-800">
                          <h3 className="font-semibold text-sm text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                            <span className="text-blue-600 text-lg">🌐</span>
                            Global Horizontal Intervals 
                          </h3>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.entries({
                              LD_to_LQ: globalIntervals.LD_to_LQ || 0,
                              LQ_to_M: globalIntervals.LQ_to_M || 0,
                              M_to_UQ: globalIntervals.M_to_UQ || 0,
                              UQ_to_UD: globalIntervals.UQ_to_UD || 0
                            }).map(([key, value]) => {
                              const displayName = key.replace(/_to_/g, ' → ').replace(/_/g, ' ');
                              return (
                                <div key={key} className="text-center p-3 bg-white dark:bg-gray-800 rounded-md border shadow-sm">
                                  <div className="font-bold text-lg text-blue-600 mb-1">{safeValue(value).toFixed(1)}%</div>
                                  <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai">{displayName}</div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="mt-3 p-2 bg-white dark:bg-gray-800 rounded-md border border-indigo-200 dark:border-indigo-800">
                            <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai text-center">
                              These intervals are applied uniformly across all {(currentData?.gradeOrder || []).length} position groups
                            </p>
                          </div>
                        </div>
                      ) : null;
                    })()}

                    {/* ENHANCED: Detailed Grade Table with comprehensive data display */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold mb-3">Detailed Grade Breakdown</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b-2 border-gray-200 dark:border-gray-700">
                              <th className="text-left py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">Grade</th>
                              <th className="text-center py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">Vertical Input %</th>
                              <th className="text-center py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">Horizontal</th>
                              <th className="text-right py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">LD</th>
                              <th className="text-right py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">LQ</th>
                              <th className="text-right py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai bg-blue-50 dark:bg-blue-900/20">Median</th>
                              <th className="text-right py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">UQ</th>
                              <th className="text-right py-2 px-3 text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai">UD</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(selectedScenario.data?.gradeOrder || selectedScenario.gradeOrder || currentData?.gradeOrder || []).map((gradeName, index) => {
                              const scenarioData = selectedScenario.data || selectedScenario;
                              const values = scenarioData.grades?.[gradeName] || {};
                              const isBasePosition = gradeName === basePositionName;
                              const isTopPosition = index === 0;
                              
                              // Extract vertical value with multiple fallbacks
                              let verticalValue = getVerticalInputValue(selectedScenario.id, gradeName);
                              
                              return (
                                <tr key={gradeName} className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800/50 ${
                                  isBasePosition ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                                }`}>
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
                                  
                                  {/* FIXED: Vertical Input Display */}
                                  <td className="py-3 px-3 text-xs text-center">
                                    {!isBasePosition ? (
                                      verticalValue !== null && verticalValue !== undefined ? (
                                        <span className="font-mono font-semibold text-sm text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded">
                                          {safeValue(verticalValue).toFixed(1)}%
                                        </span>
                                      ) : (
                                        <span className="text-gray-400 italic">No Input</span>
                                      )
                                    ) : (
                                      <span className="text-blue-600 font-medium text-xs">
                                        N/A (Base)
                                      </span>
                                    )}
                                  </td>
                                  
                                  {/* Horizontal Status */}
                                  <td className="py-3 px-3 text-xs text-center">
                                    <span className="text-xs text-blue-600 font-medium flex items-center justify-center gap-1">
                                      🌐 Global
                                    </span>
                                  </td>
                                  
                                  {/* Calculated Values with safe extraction */}
                                  <td className="py-3 px-3 text-xs text-right font-mono">{formatCurrency(values.LD)}</td>
                                  <td className="py-3 px-3 text-xs text-right font-mono">{formatCurrency(values.LQ)}</td>
                                  <td className="py-3 px-3 text-xs text-right font-mono font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/20">
                                    {formatCurrency(values.M)}
                                  </td>
                                  <td className="py-3 px-3 text-xs text-right font-mono">{formatCurrency(values.UQ)}</td>
                                  <td className="py-3 px-3 text-xs text-right font-mono">{formatCurrency(values.UD)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* ENHANCED: Action Buttons for Single Scenario */}
                    {selectedScenario.status === 'draft' && (
                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => {
                            handleSaveAsCurrent(selectedScenario.id);
                            setIsDetailOpen(false);
                          }}
                          disabled={loading.applying}
                          className="bg-green-600 text-white px-6 py-2 text-sm font-medium rounded-md hover:bg-green-700 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                        >
                          {loading.applying ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : (
                            <CheckCircle size={14} />
                          )}
                          Apply as Current
                        </button>
                        <button
                          onClick={() => {
                            handleArchiveDraft(selectedScenario.id);
                            setIsDetailOpen(false);
                          }}
                          disabled={loading.archiving}
                          className="bg-gray-500 text-white px-6 py-2 text-sm font-medium rounded-md hover:bg-gray-600 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                        >
                          {loading.archiving ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : (
                            <Archive size={14} />
                          )}
                          Archive
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  // No scenario selected fallback
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-3">
                      <Info size={48} className="mx-auto" />
                    </div>
                    <h3 className="text-base font-semibold text-almet-waterloo dark:text-almet-bali-hai mb-2">
                      No Scenario Selected
                    </h3>
                    <p className="text-xs text-gray-500">
                      Please select a scenario to view details
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ENHANCED: Error Toast for displaying errors */}
        {hasErrors && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-3 rounded-lg shadow-lg max-w-md z-50">
            <div className="flex items-start gap-2">
              <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-sm">System Error</h4>
                <div className="text-xs mt-1 space-y-1">
                  {Object.entries(errors).map(([key, message]) => (
                    <div key={key}>{message}</div>
                  ))}
                </div>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="ml-2 text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded transition-colors"
              >
                Reload
              </button>
            </div>
          </div>
        )}

        {/* ENHANCED: Loading overlay for specific operations */}
        {(loading.saving || loading.applying || loading.archiving) && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-40">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
              <div className="flex items-center gap-3">
                <RefreshCw size={24} className="animate-spin text-almet-sapphire" />
                <div>
                  <h3 className="font-semibold text-almet-cloud-burst dark:text-white">
                    {loading.saving ? 'Saving Scenario...' : 
                     loading.applying ? 'Applying Scenario...' : 
                     loading.archiving ? 'Archiving Scenario...' : 'Processing...'}
                  </h3>
                  <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-1">
                    Please wait while we process your request
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default GradingPage;