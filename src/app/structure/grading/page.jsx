// src/app/structure/grading/page.jsx - Modern Tab-based Layout
"use client";
import React, { useState } from "react";
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

// Icons
import { 
  BarChart3, 
  Plus, 
  Calculator, 
  Archive,
  TrendingUp,
  Settings
} from "lucide-react";

// Tab Navigation Component
const TabNavigation = ({ activeTab, setActiveTab, tabs }) => {
  return (
    <div className="border-b border-almet-mystic dark:border-almet-comet mb-6">
      <nav className="flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-4 px-2 border-b-3 font-medium text-sm transition-all duration-300 flex items-center gap-2 ${
              activeTab === tab.id
                ? 'border-almet-sapphire text-almet-sapphire bg-gradient-to-t from-almet-mystic/30 to-transparent'
                : 'border-transparent text-almet-waterloo hover:text-almet-cloud-burst hover:border-almet-bali-hai dark:text-almet-bali-hai dark:hover:text-white'
            }`}
          >
            <tab.icon size={18} />
            {tab.name}
            {tab.count && (
              <span className={`ml-2 px-2 py-1 text-xs rounded-full font-medium ${
                activeTab === tab.id 
                  ? 'bg-almet-sapphire text-white' 
                  : 'bg-almet-mystic text-almet-waterloo dark:bg-almet-comet dark:text-almet-bali-hai'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

// Current Structure Tab Content
const CurrentStructureTab = ({ 
  currentData, 
  basePositionName, 
  currentScenario 
}) => {
  const formatCurrency = (value) => {
    const numValue = value || 0;
    return numValue.toLocaleString();
  };

  const formatPercentage = (value, decimals = 1) => {
    const numValue = value || 0;
    return `${(numValue * 100).toFixed(decimals)}%`;
  };

  return (
    <div className="space-y-6">
   

      {/* Current Structure Card */}
      <CurrentStructureCard 
        currentData={currentData}
        basePositionName={basePositionName}
      />
    </div>
  );
};

// Create Scenario Tab Content
const CreateScenarioTab = ({ 
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
  return (
    <div className="space-y-6">
     

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
    </div>
  );
};

// Draft Scenarios Tab Content
const DraftScenariosTab = ({
  draftScenarios,
  currentData,
  compareMode,
  selectedForComparison,
  loading,
  handleViewDetails,
  handleSaveAsCurrent,
  handleArchiveDraft,
  toggleCompareMode,
  toggleScenarioForComparison,
  startComparison
}) => {
  return (
    <div className="space-y-6">
   

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
    </div>
  );
};

// Archive Tab Content
const ArchiveTab = ({ archivedScenarios, handleViewDetails }) => {
  return (
    <div className="space-y-6">


      {archivedScenarios.length > 0 ? (
        <ArchivedScenariosCard 
          archivedScenarios={archivedScenarios}
          handleViewDetails={handleViewDetails}
        />
      ) : (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-gray-400 mb-4">
            <Archive size={64} className="mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-almet-waterloo dark:text-almet-bali-hai mb-2">
            No Archived Scenarios
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Archived scenarios will appear here for historical reference
          </p>
        </div>
      )}
    </div>
  );
};

const GradingPage = () => {
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('current');
  
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

  // Tab configuration
  const tabs = [
    {
      id: 'current',
      name: 'Current Structure',
      icon: BarChart3,
      count: currentData?.gradeOrder?.length
    },
    {
      id: 'create',
      name: 'Create Scenario',
      icon: Plus
    },
    {
      id: 'drafts',
      name: 'Draft Scenarios',
      icon: Calculator,
      count: draftScenarios.length
    },
    {
      id: 'archive',
      name: 'Archive',
      icon: Archive,
      count: archivedScenarios.length
    }
  ];

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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'current':
        return (
          <CurrentStructureTab 
            currentData={currentData}
            basePositionName={basePositionName}
            currentScenario={currentScenario}
          />
        );
      case 'create':
        return (
          <CreateScenarioTab 
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
        );
      case 'drafts':
        return (
          <DraftScenariosTab 
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
        );
      case 'archive':
        return (
          <ArchiveTab 
            archivedScenarios={archivedScenarios}
            handleViewDetails={handleViewDetails}
          />
        );
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gradient-to-br ">
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-almet-mystic dark:border-almet-comet p-6">
            <GradingHeader />
          </div>

          {/* Tab Navigation */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-almet-mystic dark:border-almet-comet p-6">
            <TabNavigation 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              tabs={tabs} 
            />

            {/* Tab Content */}
            <div className="mt-6">
              {renderTabContent()}
            </div>
          </div>

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
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border border-almet-mystic dark:border-almet-comet max-w-sm mx-4">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-almet-mystic dark:border-gray-600 border-t-almet-sapphire rounded-full animate-spin mx-auto mb-4"></div>
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
        
        .animation-delay-200 {
          animation-delay: 200ms;
        }
        
        .animation-delay-400 {
          animation-delay: 400ms;
        }
        
        .border-b-3 {
          border-bottom-width: 3px;
        }
      `}</style>
    </DashboardLayout>
  );
};

export default GradingPage;