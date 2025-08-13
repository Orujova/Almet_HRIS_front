// src/components/headcount/FormComponents/StepIndicator.jsx - Compact with Soft Colors
import { Check, AlertCircle, Clock } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";

/**
 * Enhanced step indicator component with soft colors and Almet theming
 */
const StepIndicator = ({ 
  currentStep, 
  totalSteps, 
  stepLabels = [],
  getStepStatus = () => 'pending',
  onStepClick = null,
  allowNavigation = true
}) => {
  const { darkMode } = useTheme();

  // Theme-dependent classes with Almet colors
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-gray-300" : "text-almet-waterloo";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-comet";
  const borderColor = darkMode ? "border-gray-700" : "border-almet-bali-hai";

  // Get step style based on status
  const getStepStyle = (step) => {
    const status = getStepStatus(step);
    const isActive = step === currentStep;
    const isClickable = allowNavigation && onStepClick && (step <= currentStep || status === 'completed');

    let baseClasses = "w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all duration-200 ";
    
    if (isClickable) {
      baseClasses += "cursor-pointer ";
    }

    switch (status) {
      case 'completed':
        return baseClasses + "bg-emerald-400 dark:bg-emerald-500 text-white hover:bg-emerald-500 dark:hover:bg-emerald-600 shadow-sm";
      case 'error':
        return baseClasses + "bg-rose-400 dark:bg-rose-500 text-white hover:bg-rose-500 dark:hover:bg-rose-600 shadow-sm";
      case 'active':
        return baseClasses + "bg-almet-sapphire text-white shadow-md ring-3 ring-almet-sapphire/20";
      case 'pending':
      default:
        if (isActive) {
          return baseClasses + "bg-almet-sapphire text-white shadow-md ring-3 ring-almet-sapphire/20";
        }
        return baseClasses + (darkMode 
          ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
          : "bg-almet-mystic text-almet-comet hover:bg-almet-bali-hai/50");
    }
  };

  // Get step icon
  const getStepIcon = (step) => {
    const status = getStepStatus(step);
    
    switch (status) {
      case 'completed':
        return <Check size={12} />;
      case 'error':
        return <AlertCircle size={12} />;
      case 'active':
        return <Clock size={12} />;
      default:
        return <span className="text-[10px] font-bold">{step}</span>;
    }
  };

  // Get connector line style
  const getConnectorStyle = (step) => {
    const status = getStepStatus(step);
    
    if (status === 'completed' || step < currentStep) {
      return "bg-emerald-300 dark:bg-emerald-400";
    }
    if (status === 'error') {
      return "bg-rose-300 dark:bg-rose-400";
    }
    return darkMode ? "bg-gray-700" : "bg-almet-bali-hai";
  };

  // Handle step click
  const handleStepClick = (step) => {
    if (!allowNavigation || !onStepClick) return;
    
    const status = getStepStatus(step);
    if (step <= currentStep || status === 'completed') {
      onStepClick(step);
    }
  };

  return (
    <div className="w-full">
      {/* Steps Container */}
      <div className="flex items-center justify-between">
        {Array.from({ length: totalSteps }).map((_, index) => {
          const step = index + 1;
          const isLast = step === totalSteps;
          const status = getStepStatus(step);
          
          return (
            <div key={step} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="relative flex items-center">
                <div
                  className={getStepStyle(step)}
                  onClick={() => handleStepClick(step)}
                  title={stepLabels[index] || `Step ${step}`}
                >
                  {getStepIcon(step)}
                </div>
                
                {/* Step Status Indicator */}
                {status === 'error' && (
                  <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-rose-400 rounded-full border border-white dark:border-gray-800">
                  </div>
                )}
              </div>
              
              {/* Step Label */}
              {stepLabels && stepLabels[index] && (
                <div className="ml-2 hidden sm:block">
                  <p className={`text-xs font-medium ${
                    step === currentStep ? 'text-almet-sapphire' : 
                    status === 'completed' ? 'text-emerald-600 dark:text-emerald-400' :
                    status === 'error' ? 'text-rose-600 dark:text-rose-400' :
                    textSecondary
                  }`}>
                    {stepLabels[index]}
                  </p>
                  <p className={`text-[10px] ${textMuted}`}>
                    {status === 'completed' ? 'Completed' :
                     status === 'error' ? 'Has errors' :
                     step === currentStep ? 'Current' :
                     step < currentStep ? 'Completed' : 'Pending'}
                  </p>
                </div>
              )}
              
              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-3">
                  <div className={`h-full transition-all duration-300 ${getConnectorStyle(step)}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Step Labels */}
      <div className="sm:hidden mt-3">
        {stepLabels && stepLabels[currentStep - 1] && (
          <div className="text-center">
            <p className={`text-xs font-medium ${textPrimary}`}>
              {stepLabels[currentStep - 1]}
            </p>
            <p className={`text-[10px] ${textMuted}`}>
              Step {currentStep} of {totalSteps}
            </p>
          </div>
        )}
      </div>

      {/* Progress Summary */}
      <div className="mt-3 flex justify-between items-center text-[10px]">
        <div className={textMuted}>
          <span>Step {currentStep} of {totalSteps}</span>
          {stepLabels[currentStep - 1] && (
            <span className="hidden sm:inline"> - {stepLabels[currentStep - 1]}</span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Completed Steps */}
          <div className="flex items-center">
            <div className="w-2 h-2 bg-emerald-400 dark:bg-emerald-500 rounded-full mr-1" />
            <span className={textMuted}>
              {Array.from({ length: totalSteps }).filter((_, i) => getStepStatus(i + 1) === 'completed').length} completed
            </span>
          </div>
          
          {/* Error Steps */}
          {Array.from({ length: totalSteps }).some((_, i) => getStepStatus(i + 1) === 'error') && (
            <div className="flex items-center">
              <div className="w-2 h-2 bg-rose-400 dark:bg-rose-500 rounded-full mr-1" />
              <span className={`text-rose-600 dark:text-rose-400`}>
                {Array.from({ length: totalSteps }).filter((_, i) => getStepStatus(i + 1) === 'error').length} with errors
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StepIndicator;