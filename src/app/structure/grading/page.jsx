// src/app/structure/grading/page.jsx - ENHANCED: Complete redesigned grading page
"use client";
import React from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import useGrading from "@/hooks/useGrading";

// Enhanced component imports
import GradingHeader from "@/components/grading/GradingHeader";
import CurrentStructureCard from "@/components/grading/CurrentStructureCard";
import CreateScenarioCard from "@/components/grading/CreateScenarioCard";
import DraftScenariosCard from "@/components/grading/DraftScenariosCard";
import ArchivedScenariosCard from "@/components/grading/ArchivedScenariosCard";
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
      <div className="min-h-screen ">
        <div className="p-4 space-y-4 max-w-7xl mx-auto">
          <div className="space-y-8">
            {/* Header with System Stats */}
            <GradingHeader 
            />

         

            {/* Current Structure Overview */}
            <CurrentStructureCard 
              currentData={currentData}
              basePositionName={basePositionName}
            />

            {/* Create New Scenario */}
            <CreateScenarioCard 
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

            {/* Draft Scenarios with Pagination */}
            <DraftScenariosCard 
              draftScenarios={draftScenarios}
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

            {/* Archived Scenarios with Pagination */}
            {archivedScenarios.length > 0 && (
              <ArchivedScenariosCard 
                archivedScenarios={archivedScenarios}
                handleViewDetails={handleViewDetails}
              />
            )}

            {/* Enhanced Detail Modal */}
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

            {/* Enhanced Error Toast */}
            {hasErrors && (
              <div className="fixed bottom-6 right-6 bg-red-500 text-white px-6 py-4 rounded-xl shadow-2xl max-w-md z-50 animate-slide-up border border-red-400">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">!</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">System Error Detected</h4>
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
                    className="ml-2 text-xs bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-lg transition-colors font-medium"
                  >
                    Reload Page
                  </button>
                </div>
              </div>
            )}

            {/* Enhanced Loading Overlay */}
            {(loading.saving || loading.applying || loading.archiving) && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-40 backdrop-blur-sm">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700 max-w-sm mx-4">
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-600 border-t-almet-sapphire rounded-full animate-spin mx-auto mb-4"></div>
                    <h3 className="font-semibold text-almet-cloud-burst dark:text-white text-lg mb-2">
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
                    <div className="mt-4 flex justify-center">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-almet-sapphire rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-almet-sapphire rounded-full animate-bounce animation-delay-200"></div>
                        <div className="w-2 h-2 bg-almet-sapphire rounded-full animate-bounce animation-delay-400"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom Styles for Animations */}
      <style jsx>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
        
        .animation-delay-150 {
          animation-delay: 150ms;
        }
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default GradingPage;