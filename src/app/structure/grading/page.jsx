// src/app/structure/grading/page.jsx - ENHANCED: Redesigned with proper structure
"use client";
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import useGrading from "@/hooks/useGrading";

// Enhanced component imports
import GradingHeader from "@/components/grading/GradingHeader";
import CurrentStructureOverview from "@/components/grading/CurrentStructureOverview";
import ScenarioBuilder from "@/components/grading/ScenarioBuilder";
import ScenarioManager from "@/components/grading/ScenarioManager";
import ScenarioDetailModal from "@/components/grading/ScenarioDetailModal";
import { LoadingSpinner, ErrorDisplay } from "@/components/grading/LoadingSpinner";

const GradingPage = () => {
  const { darkMode } = useTheme();
  
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
    
    // Loading states
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
    refreshData,
    
    // Comparison helpers
    getVerticalInputValue,
    getHorizontalInputValues
  } = useGrading();

  // Show loading state
  if (isLoading && !isInitialized) {
    return (
      <DashboardLayout>
        <LoadingSpinner message="Initializing grading system..." />
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
          {/* Header */}
          <GradingHeader />

          {/* Current Structure Overview */}
          <CurrentStructureOverview 
            currentData={currentData}
            currentScenario={currentScenario}
            basePositionName={basePositionName}
          />

          {/* Scenario Builder */}
          <ScenarioBuilder 
            scenarioInputs={scenarioInputs}
            newScenarioDisplayData={newScenarioDisplayData}
            basePositionName={basePositionName}
            validationSummary={validationSummary}
            errors={errors}
            loading={loading}
            isCalculating={isCalculating}
            handleBaseValueChange={handleBaseValueChange}
            handleVerticalChange={handleVerticalChange}
            handleGlobalHorizontalChange={handleGlobalHorizontalChange}
            handleSaveDraft={handleSaveDraft}
          />

          {/* Scenario Manager */}
          <ScenarioManager 
            draftScenarios={draftScenarios}
            archivedScenarios={archivedScenarios}
            currentData={currentData}
            compareMode={compareMode}
            selectedForComparison={selectedForComparison}
            loading={loading}
            handleViewDetails={handleViewDetails}
            handleSaveAsCurrent={handleSaveAsCurrent}
            handleArchiveDraft={handleArchiveDraft}
            toggleCompareMode={toggleCompareMode}
            toggleScenarioForComparison={toggleScenarioForComparison}
            startComparison={startComparison}
          />

          {/* Detail Modal */}
          {isDetailOpen && (
            <ScenarioDetailModal 
              isOpen={isDetailOpen}
              onClose={() => setIsDetailOpen(false)}
              selectedScenario={selectedScenario}
              compareMode={compareMode}
              selectedForComparison={selectedForComparison}
              currentData={currentData}
              basePositionName={basePositionName}
              loading={loading}
              getScenarioForComparison={getScenarioForComparison}
              getVerticalInputValue={getVerticalInputValue}
              getHorizontalInputValues={getHorizontalInputValues}
              handleSaveAsCurrent={handleSaveAsCurrent}
              handleArchiveDraft={handleArchiveDraft}
            />
          )}

          {/* Error Toast */}
          {hasErrors && (
            <div className="fixed bottom-6 right-6 bg-red-500 text-white px-6 py-3 rounded-lg shadow-2xl max-w-md z-50 animate-slide-up border border-red-400">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">!</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm mb-1">System Error</h4>
                  <div className="text-xs space-y-1 opacity-90">
                    {Object.entries(errors).map(([key, message]) => (
                      <div key={key} className="flex items-start gap-1">
                        <span className="text-red-200">•</span>
                        <span>{message}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => window.location.reload()}
                  className="ml-2 text-xs bg-red-600 hover:bg-red-700 px-2 py-1 rounded transition-colors font-medium"
                >
                  Reload
                </button>
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {(loading.saving || loading.applying || loading.archiving) && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 backdrop-blur-sm">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-2xl border border-gray-200 dark:border-gray-700 max-w-sm mx-4">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-600 border-t-almet-sapphire rounded-full animate-spin mx-auto mb-4"></div>
                  <h3 className="font-medium text-almet-cloud-burst dark:text-white mb-2">
                    {loading.saving ? 'Saving Scenario' : 
                     loading.applying ? 'Applying Scenario' : 
                     loading.archiving ? 'Archiving Scenario' : 'Processing'}
                  </h3>
                  <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai">
                    {loading.saving ? 'Creating new draft scenario...' :
                     loading.applying ? 'Setting as current structure...' :
                     loading.archiving ? 'Moving to archive...' :
                     'Please wait while we process your request'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default GradingPage;