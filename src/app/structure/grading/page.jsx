// src/app/structure/grading/page.jsx - GLOBAL HORIZONTAL INTERVALS UI

"use client";
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { BarChart3, TrendingUp, Calculator, Save, Archive, Eye, Trash2, Plus, X, GitCompare, Info } from "lucide-react";
import useGrading from "@/hooks/useGrading";

const GradingPage = () => {
  const { darkMode } = useTheme();
  
  // Use the database-integrated hook with GLOBAL horizontal intervals
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
    
    // UI State
    isDetailOpen,
    setIsDetailOpen,
    compareMode,
    selectedForComparison,
    loading,
    errors,
    
    // Actions
    handleBaseValueChange,
    handleVerticalChange,
    handleGlobalHorizontalChange, // NEW: Global horizontal handler
    handleSaveDraft,
    handleSaveAsCurrent,
    handleArchiveDraft,
    handleViewDetails,
    toggleCompareMode,
    toggleScenarioForComparison,
    startComparison,
    getScenarioForComparison
  } = useGrading();

  // Show loading state while data is being fetched from database
  if (loading && !currentData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-almet-sapphire mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading grading system from database...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error if no position groups found in database
  if (errors.load) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <Archive size={48} className="mx-auto mb-2" />
              <h3 className="text-lg font-medium">Database Error</h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{errors.load}</p>
            <p className="text-sm text-gray-500">Please ensure position groups are configured in the database.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Don't render if no current data loaded yet
  if (!currentData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-400">No grading structure found in database.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4">
          <div>
            <h1 className="text-2xl font-semibold text-almet-cloud-burst dark:text-white">
              Employee Grading System
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Manage salary grades and compensation structures (Global Horizontal Intervals)
            </p>
            {inputSummary && (
              <div className="mt-2 flex items-center gap-4 text-xs">
                <span className="text-blue-600 font-medium">
                  📊 {inputSummary.totalPositions} Positions
                </span>
                <span className="text-green-600">
                  🌐 {inputSummary.horizontalInputs} Global Horizontal Intervals (Apply to All)
                </span>
                <span className="text-orange-600">
                  📊 {inputSummary.verticalInputs} Vertical Transitions (Per Position)
                </span>
                <span className="text-purple-600">
                  🎯 Base: {inputSummary.basePosition}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Current Situation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-almet-cloud-burst dark:text-white">Current Grade Structure</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {currentData.gradeOrder.length} position groups loaded from database
            </p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-almet-sapphire">
                  {(currentData.verticalAvg * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Vertical Average</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-almet-sapphire">
                  {(currentData.horizontalAvg * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Horizontal Average</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Grade</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Lower Decile</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Lower Quartile</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Median</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Upper Quartile</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Upper Decile</th>
                  </tr>
                </thead>
                <tbody>
                  {currentData.gradeOrder.map((gradeName, index) => {
                    const values = currentData.grades[gradeName];
                    if (!values) return null;
                    return (
                      <tr key={gradeName} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-3 text-sm font-medium text-almet-cloud-burst dark:text-white">
                          {gradeName}
                          {index === 0 && <span className="ml-2 text-xs text-red-600">(Highest)</span>}
                          {index === currentData.gradeOrder.length - 1 && <span className="ml-2 text-xs text-blue-600">(Base Position)</span>}
                        </td>
                        <td className="py-3 text-sm text-right">{(values.LD || 0).toLocaleString()}</td>
                        <td className="py-3 text-sm text-right">{(values.LQ || 0).toLocaleString()}</td>
                        <td className="py-3 text-sm text-right font-medium">{(values.M || 0).toLocaleString()}</td>
                        <td className="py-3 text-sm text-right">{(values.UQ || 0).toLocaleString()}</td>
                        <td className="py-3 text-sm text-right">{(values.UD || 0).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Create New Scenario - UPDATED FOR GLOBAL INTERVALS */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-almet-cloud-burst dark:text-white">Create New Scenario</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Using {scenarioInputs.gradeOrder.length} position groups with 4 GLOBAL horizontal intervals
            </p>
            
            {/* UPDATED Input Logic Explanation for GLOBAL intervals */}
            {inputSummary && (
              <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <Info size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-800 dark:text-blue-200">
                    <div className="font-semibold mb-1">GLOBAL Horizontal Logic for {inputSummary.totalPositions} Positions:</div>
                    <div className="space-y-1">
                      <div>• <strong>Vertical rates:</strong> {inputSummary.verticalInputs} inputs (transitions between positions)</div>
                      <div>• <strong>Horizontal intervals:</strong> {inputSummary.horizontalInputs} GLOBAL inputs (apply to ALL positions)</div>
                      <div>• <strong>Global intervals:</strong> {inputSummary.horizontalIntervals.join(', ')}</div>
                      <div>• <strong>Logic:</strong> Set once, applies to all {inputSummary.totalPositions} positions</div>
                      <div>• <strong>Base position:</strong> {inputSummary.basePosition} - no vertical input</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-6 space-y-6">
            {/* Base Value Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Base Value ({inputSummary?.basePosition} LD) - Entry Level Position
              </label>
              <input
                type="number"
                value={scenarioInputs.baseValue1}
                onChange={(e) => handleBaseValueChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${
                  errors.baseValue1 ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Enter base salary for entry level position"
                min="1"
                step="1"
              />
              {errors.baseValue1 && <p className="text-red-500 text-sm mt-1">{errors.baseValue1}</p>}
              <p className="text-xs text-gray-500 mt-1">
                Lower Decile salary for {inputSummary?.basePosition} (lowest hierarchy level)
              </p>
            </div>

            {/* NEW: Global Horizontal Intervals Section */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
              <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <span className="text-blue-600">🌐</span>
                Global Horizontal Intervals (Apply to All {inputSummary?.totalPositions} Positions)
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    LD → LQ %
                  </label>
                  <input
                    type="number"
                    value={scenarioInputs.globalHorizontalIntervals?.LD_to_LQ || ''}
                    onChange={(e) => handleGlobalHorizontalChange('LD_to_LQ', e.target.value)}
                    className={`w-full px-2 py-1 text-sm border rounded text-center dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-almet-sapphire ${
                      errors['global-horizontal-LD_to_LQ'] ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  {errors['global-horizontal-LD_to_LQ'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['global-horizontal-LD_to_LQ']}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    LQ → M %
                  </label>
                  <input
                    type="number"
                    value={scenarioInputs.globalHorizontalIntervals?.LQ_to_M || ''}
                    onChange={(e) => handleGlobalHorizontalChange('LQ_to_M', e.target.value)}
                    className={`w-full px-2 py-1 text-sm border rounded text-center dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-almet-sapphire ${
                      errors['global-horizontal-LQ_to_M'] ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  {errors['global-horizontal-LQ_to_M'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['global-horizontal-LQ_to_M']}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    M → UQ %
                  </label>
                  <input
                    type="number"
                    value={scenarioInputs.globalHorizontalIntervals?.M_to_UQ || ''}
                    onChange={(e) => handleGlobalHorizontalChange('M_to_UQ', e.target.value)}
                    className={`w-full px-2 py-1 text-sm border rounded text-center dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-almet-sapphire ${
                      errors['global-horizontal-M_to_UQ'] ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  {errors['global-horizontal-M_to_UQ'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['global-horizontal-M_to_UQ']}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    UQ → UD %
                  </label>
                  <input
                    type="number"
                    value={scenarioInputs.globalHorizontalIntervals?.UQ_to_UD || ''}
                    onChange={(e) => handleGlobalHorizontalChange('UQ_to_UD', e.target.value)}
                    className={`w-full px-2 py-1 text-sm border rounded text-center dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-almet-sapphire ${
                      errors['global-horizontal-UQ_to_UD'] ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    }`}
                    placeholder="0"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  {errors['global-horizontal-UQ_to_UD'] && (
                    <p className="text-red-500 text-xs mt-1">{errors['global-horizontal-UQ_to_UD']}</p>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                🌐 These percentages will apply to ALL positions in the grading structure
              </p>
            </div>

            {/* UPDATED Position Table - Only Vertical Inputs + Results */}
            {newScenarioDisplayData && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Grade</th>
                      <th className="text-center py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                        Vertical %
                        <div className="text-xs font-normal text-gray-500">({inputSummary?.verticalTransitions} transitions)</div>
                      </th>
                      <th className="text-center py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                        Horizontal
                        <div className="text-xs font-normal text-gray-500">(Global intervals apply)</div>
                      </th>
                      <th className="text-right py-3 text-sm font-medium text-gray-600 dark:text-gray-400">LD</th>
                      <th className="text-right py-3 text-sm font-medium text-gray-600 dark:text-gray-400">LQ</th>
                      <th className="text-right py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Median</th>
                      <th className="text-right py-3 text-sm font-medium text-gray-600 dark:text-gray-400">UQ</th>
                      <th className="text-right py-3 text-sm font-medium text-gray-600 dark:text-gray-400">UD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {newScenarioDisplayData.gradeOrder.map((gradeName, index) => {
                      const inputs = scenarioInputs.grades[gradeName] || {};
                      const outputs = calculatedOutputs[gradeName] || { LD: "", LQ: "", M: "", UQ: "", UD: "" };

                      const isBasePosition = index === (newScenarioDisplayData.gradeOrder.length - 1);
                      const isTopPosition = index === 0;
                      
                      // LD VALUE LOGIC: Base value shows in base position LD
                      const ldValue = isBasePosition && scenarioInputs.baseValue1 > 0 
                        ? Math.round(scenarioInputs.baseValue1) 
                        : outputs.LD;

                      return (
                        <tr key={gradeName} className="border-b border-gray-100 dark:border-gray-700">
                          <td className="py-3 text-sm font-medium text-almet-cloud-burst dark:text-white">
                            {gradeName}
                            {isTopPosition && (
                              <span className="ml-2 text-xs text-red-600 font-medium">(Highest Level)</span>
                            )}
                            {isBasePosition && (
                              <span className="ml-2 text-xs text-blue-600 font-medium">(Base Position)</span>
                            )}
                          </td>
                          
                          {/* VERTICAL INPUT - TRANSITIONS ONLY */}
                          <td className="py-3 text-center">
                            {inputs.vertical !== null ? (
                              <div className="flex flex-col items-center">
                                <input
                                  type="number"
                                  value={inputs.vertical}
                                  onChange={(e) => handleVerticalChange(gradeName, e.target.value)}
                                  className={`w-20 px-2 py-1 text-sm border rounded text-center dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-almet-sapphire ${
                                    errors[`vertical-${gradeName}`] ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                                  }`}
                                  placeholder="0"
                                  min="0"
                                  max="100"
                                  step="0.1"
                                />
                                <span className="text-xs text-gray-400 mt-1">transition</span>
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <span className="text-xs text-gray-400 italic">N/A</span>
                                <span className="text-xs text-gray-400">base</span>
                              </div>
                            )}
                          </td>
                          
                          {/* HORIZONTAL - SHOWS GLOBAL STATUS */}
                          <td className="py-3 text-center">
                            <div className="flex flex-col items-center">
                              <span className="text-xs text-blue-600 font-medium">🌐 Global</span>
                              <span className="text-xs text-gray-400">applies</span>
                            </div>
                          </td>
                          
                          {/* CALCULATED COLUMNS */}
                          <td className="py-3 text-sm text-right font-mono">
                            {ldValue ? (
                              <span className={isBasePosition ? "font-bold text-blue-600" : ""}>
                                {Number(ldValue).toLocaleString()}
                                {isBasePosition && scenarioInputs.baseValue1 > 0 && !outputs.LD && (
                                  <span className="ml-1 text-xs text-blue-600">(Base)</span>
                                )}
                              </span>
                            ) : "-"}
                          </td>
                          <td className="py-3 text-sm text-right font-mono">{outputs.LQ ? Number(outputs.LQ).toLocaleString() : "-"}</td>
                          <td className="py-3 text-sm text-right font-mono font-medium">{outputs.M ? Number(outputs.M).toLocaleString() : "-"}</td>
                          <td className="py-3 text-sm text-right font-mono">{outputs.UQ ? Number(outputs.UQ).toLocaleString() : "-"}</td>
                          <td className="py-3 text-sm text-right font-mono">{outputs.UD ? Number(outputs.UD).toLocaleString() : "-"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={handleSaveDraft}
                className="bg-almet-sapphire text-white px-6 py-2 text-sm rounded-lg hover:bg-almet-astral transition-colors disabled:opacity-50"
                disabled={Object.keys(errors).length > 0 || !scenarioInputs.baseValue1 || scenarioInputs.baseValue1 <= 0}
              >
                Save as Draft
              </button>
            </div>
          </div>
        </div>

        {/* Draft Scenarios - Same as before */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h2 className="text-lg font-medium text-almet-cloud-burst dark:text-white">Draft Scenarios</h2>
            <div className="flex gap-3">
              {compareMode && selectedForComparison.length >= 2 && (
                <button
                  onClick={startComparison}
                  className="bg-green-600 text-white px-4 py-2 text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Eye size={16} />
                  Compare ({selectedForComparison.length})
                </button>
              )}
              <button
                onClick={toggleCompareMode}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors flex items-center gap-2 ${
                  compareMode 
                    ? 'bg-red-500 text-white border-red-500 hover:bg-red-600' 
                    : 'bg-almet-sapphire text-white border-almet-sapphire hover:bg-almet-astral'
                }`}
              >
                <GitCompare size={16} />
                {compareMode ? 'Cancel' : 'Compare'}
              </button>
            </div>
          </div>

          <div className="p-6">
            {bestDraft && !compareMode && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-almet-sapphire">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-almet-cloud-burst dark:text-white">Recommended Scenario</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {bestDraft.name} - Database-driven calculation with global intervals
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSaveAsCurrent(bestDraft.id)}
                      className="bg-almet-sapphire text-white px-3 py-1 text-sm rounded hover:bg-almet-astral transition-colors"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => handleViewDetails(bestDraft)}
                      className="bg-gray-500 text-white px-3 py-1 text-sm rounded hover:bg-gray-600 transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Current Structure in comparison mode */}
            {compareMode && (
              <div className="mb-6">
                <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Include Current Structure in Comparison:</h3>
                <div 
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedForComparison.includes('current')
                      ? "border-almet-sapphire bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:shadow-md"
                  }`}
                  onClick={() => toggleScenarioForComparison('current')}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-medium text-almet-cloud-burst dark:text-white">Current Structure</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Active grade structure from database</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedForComparison.includes('current')}
                      onChange={() => toggleScenarioForComparison('current')}
                      className="w-4 h-4 text-almet-sapphire rounded focus:ring-almet-sapphire"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-almet-cloud-burst dark:text-white">
                        {(currentData.verticalAvg * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Vertical</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-almet-cloud-burst dark:text-white">
                        {(currentData.horizontalAvg * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Horizontal</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {draftScenarios.length > 0 ? (
                draftScenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      bestDraft && bestDraft.id === scenario.id && !compareMode
                        ? "border-almet-sapphire bg-blue-50 dark:bg-blue-900/20"
                        : compareMode && selectedForComparison.includes(scenario.id)
                        ? "border-almet-sapphire bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 hover:shadow-md"
                    }`}
                    onClick={() => compareMode ? toggleScenarioForComparison(scenario.id) : handleViewDetails(scenario)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-medium text-almet-cloud-burst dark:text-white">{scenario.name}</h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(scenario.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {compareMode && (
                        <input
                          type="checkbox"
                          checked={selectedForComparison.includes(scenario.id)}
                          onChange={() => toggleScenarioForComparison(scenario.id)}
                          className="w-4 h-4 text-almet-sapphire rounded focus:ring-almet-sapphire"
                        />
                      )}
                      {bestDraft && bestDraft.id === scenario.id && !compareMode && (
                        <span className="text-xs bg-almet-sapphire text-white px-2 py-1 rounded">★ Best</span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-semibold text-almet-cloud-burst dark:text-white">
                          {(scenario.data.verticalAvg * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Vertical</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-semibold text-almet-cloud-burst dark:text-white">
                          {(scenario.data.horizontalAvg * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Horizontal</div>
                      </div>
                    </div>

                    {/* Metrics display */}
                    {scenario.metrics && (
                      <div className="space-y-2 mb-4 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Budget Impact:</span>
                          <span className="font-medium">{(scenario.metrics?.totalBudgetImpact ?? 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Avg Increase:</span>
                          <span className={`font-medium ${(scenario.metrics?.avgSalaryIncrease ?? 0) > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {(scenario.metrics?.avgSalaryIncrease ?? 0) > 0 ? '+' : ''}{(scenario.metrics?.avgSalaryIncrease ?? 0).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Risk Level:</span>
                          <span className={`font-medium ${
                            (scenario.metrics?.riskLevel ?? 'Low') === 'High' ? 'text-red-600' :
                            (scenario.metrics?.riskLevel ?? 'Low') === 'Medium' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {scenario.metrics?.riskLevel ?? 'Low'}
                          </span>
                        </div>
                      </div>
                    )}

                    {!compareMode && (
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSaveAsCurrent(scenario.id); }}
                          className="flex-1 bg-almet-sapphire text-white px-3 py-1 text-xs rounded hover:bg-almet-astral transition-colors"
                        >
                          Apply
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleArchiveDraft(scenario.id); }}
                          className="bg-gray-400 text-white px-3 py-1 text-xs rounded hover:bg-gray-500 transition-colors"
                        >
                          Archive
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="text-gray-400 mb-2">
                    <Archive size={48} className="mx-auto" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No Draft Scenarios</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-500">Create your first scenario above to get started</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Archived Scenarios */}
        {archivedScenarios.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-almet-cloud-burst dark:text-white">Archived Scenarios</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Previous current scenarios and manually archived scenarios</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {archivedScenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-all"
                    onClick={() => handleViewDetails(scenario)}
                  >
                    <h3 className="font-medium text-almet-cloud-burst dark:text-white mb-2">{scenario.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                      {new Date(scenario.createdAt).toLocaleDateString()}
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-sm font-semibold">{(scenario.data.verticalAvg * 100).toFixed(1)}%</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Vertical</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm font-semibold">{(scenario.data.horizontalAvg * 100).toFixed(1)}%</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Horizontal</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal - Updated for global intervals display */}
        {isDetailOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-almet-cloud-burst dark:text-white">
                    {compareMode && selectedForComparison.length >= 2 ? 
                      `Scenario Comparison (${selectedForComparison.length} scenarios) - Global Intervals` : 
                      selectedScenario ? `${selectedScenario.name} Details - Global Intervals` : 'Scenario Details'
                    }
                  </h2>
                  <button
                    onClick={() => setIsDetailOpen(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {compareMode && selectedForComparison.length >= 2 ? (
                  // Comparison View - Updated for global intervals
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {selectedForComparison.map(scenarioId => {
                        const scenario = getScenarioForComparison(scenarioId);
                        if (!scenario) return null;
                        
                        const scenarioData = scenario.data || scenario;
                        return (
                          <div key={scenarioId} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                            <h3 className="font-semibold text-lg mb-3">{scenario.name}</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Vertical Avg:</span>
                                <span className="font-medium">{(scenarioData.verticalAvg * 100).toFixed(1)}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Horizontal Avg:</span>
                                <span className="font-medium">{(scenarioData.horizontalAvg * 100).toFixed(1)}%</span>
                              </div>
                              {scenarioData.globalHorizontalIntervals && (
                                <div className="text-xs text-gray-500 mt-2">
                                  <div>Global Intervals:</div>
                                  <div>LD→LQ: {scenarioData.globalHorizontalIntervals.LD_to_LQ}%</div>
                                  <div>LQ→M: {scenarioData.globalHorizontalIntervals.LQ_to_M}%</div>
                                  <div>M→UQ: {scenarioData.globalHorizontalIntervals.M_to_UQ}%</div>
                                  <div>UQ→UD: {scenarioData.globalHorizontalIntervals.UQ_to_UD}%</div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Grade</th>
                            {selectedForComparison.map(scenarioId => {
                              const scenario = getScenarioForComparison(scenarioId);
                              return scenario ? (
                                <th key={scenarioId} className="text-center py-3 text-sm font-medium text-gray-600 dark:text-gray-400">
                                  {scenario.name}
                                </th>
                              ) : null;
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {currentData.gradeOrder.map(gradeName => (
                            <tr key={gradeName} className="border-b border-gray-100 dark:border-gray-700">
                              <td className="py-3 text-sm font-medium">{gradeName}</td>
                              {selectedForComparison.map(scenarioId => {
                                const scenario = getScenarioForComparison(scenarioId);
                                const scenarioData = scenario?.data || scenario;
                                const gradeData = scenarioData?.grades[gradeName];
                                return (
                                  <td key={scenarioId} className="py-3 text-center">
                                    {gradeData ? (
                                      <div>
                                        <div className="font-mono font-semibold">{(gradeData.M || 0).toLocaleString()}</div>
                                        <div className="text-xs text-gray-500">
                                          V: {gradeData.vertical || 0}% | H: Global
                                        </div>
                                      </div>
                                    ) : '-'}
                                  </td>
                                );
                              })}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : selectedScenario ? (
                  // Single Scenario Detail View - Updated for global intervals
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-almet-sapphire">{parseFloat(selectedScenario.data?.baseValue1 || selectedScenario.baseValue1 || 0).toLocaleString()}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Base Value</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-almet-sapphire">{((selectedScenario.data?.verticalAvg || selectedScenario.verticalAvg || 0) * 100).toFixed(1)}%</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Vertical Average</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-almet-sapphire">{((selectedScenario.data?.horizontalAvg || selectedScenario.horizontalAvg || 0) * 100).toFixed(1)}%</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">Horizontal Average</div>
                      </div>
                      {selectedScenario.metrics && (
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${
                            selectedScenario.metrics.riskLevel === 'High' ? 'text-red-600' :
                            selectedScenario.metrics.riskLevel === 'Medium' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {selectedScenario.metrics.riskLevel}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Risk Level</div>
                        </div>
                      )}
                    </div>

                    {/* Global Intervals Display */}
                    {selectedScenario.data?.globalHorizontalIntervals && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                        <h3 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Global Horizontal Intervals</h3>
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-bold">{selectedScenario.data.globalHorizontalIntervals.LD_to_LQ}%</div>
                            <div className="text-xs text-gray-500">LD → LQ</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold">{selectedScenario.data.globalHorizontalIntervals.LQ_to_M}%</div>
                            <div className="text-xs text-gray-500">LQ → M</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold">{selectedScenario.data.globalHorizontalIntervals.M_to_UQ}%</div>
                            <div className="text-xs text-gray-500">M → UQ</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold">{selectedScenario.data.globalHorizontalIntervals.UQ_to_UD}%</div>
                            <div className="text-xs text-gray-500">UQ → UD</div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Grade</th>
                            <th className="text-center py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Vertical %</th>
                            <th className="text-center py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Horizontal</th>
                            <th className="text-right py-3 text-sm font-medium text-gray-600 dark:text-gray-400">LD</th>
                            <th className="text-right py-3 text-sm font-medium text-gray-600 dark:text-gray-400">LQ</th>
                            <th className="text-right py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Median</th>
                            <th className="text-right py-3 text-sm font-medium text-gray-600 dark:text-gray-400">UQ</th>
                            <th className="text-right py-3 text-sm font-medium text-gray-600 dark:text-gray-400">UD</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(selectedScenario.data?.gradeOrder || selectedScenario.gradeOrder || currentData.gradeOrder).map((gradeName) => {
                            const scenarioData = selectedScenario.data || selectedScenario;
                            const values = scenarioData.grades[gradeName];
                            if (!values) return null;
                            
                            return (
                              <tr key={gradeName} className="border-b border-gray-100 dark:border-gray-700">
                                <td className="py-3 text-sm font-medium">{gradeName}</td>
                                <td className="py-3 text-sm text-center">{(parseFloat(values.vertical || "0")).toFixed(1)}%</td>
                                <td className="py-3 text-sm text-center">
                                  <span className="text-xs text-blue-600">🌐 Global</span>
                                </td>
                                <td className="py-3 text-sm text-right font-mono">{(values.LD || 0).toLocaleString()}</td>
                                <td className="py-3 text-sm text-right font-mono">{(values.LQ || 0).toLocaleString()}</td>
                                <td className="py-3 text-sm text-right font-mono font-semibold">{(values.M || 0).toLocaleString()}</td>
                                <td className="py-3 text-sm text-right font-mono">{(values.UQ || 0).toLocaleString()}</td>
                                <td className="py-3 text-sm text-right font-mono">{(values.UD || 0).toLocaleString()}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
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