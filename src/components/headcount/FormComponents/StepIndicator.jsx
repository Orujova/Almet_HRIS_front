// src/components/headcount/FormComponents/StepIndicator.jsx - Enhanced with Validation Status
import { Check, AlertCircle, Clock } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";

/**
 * Enhanced step indicator component for multi-step forms with validation status
 * @param {Object} props - Component props
 * @param {number} props.currentStep - Current active step
 * @param {number} props.totalSteps - Total number of steps
 * @param {Array<string>} props.stepLabels - Optional array of labels for each step
 * @param {Function} props.getStepStatus - Function to get validation status of each step
 * @param {Function} props.onStepClick - Handler for step click
 * @param {boolean} props.allowNavigation - Whether to allow clicking on steps
 * @returns {JSX.Element} - Enhanced step indicator component
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

  // Theme-dependent classes
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-600";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";

  // Get step style based on status
  const getStepStyle = (step) => {
    const status = getStepStatus(step);
    const isActive = step === currentStep;
    const isClickable = allowNavigation && onStepClick && (step <= currentStep || status === 'completed');

    let baseClasses = "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ";
    
    if (isClickable) {
      baseClasses += "cursor-pointer ";
    }

    switch (status) {
      case 'completed':
        return baseClasses + "bg-green-500 text-white hover:bg-green-600 shadow-sm";
      case 'error':
        return baseClasses + "bg-red-500 text-white hover:bg-red-600 shadow-sm";
      case 'active':
        return baseClasses + "bg-almet-sapphire text-white shadow-lg ring-4 ring-almet-sapphire/20";
      case 'pending':
      default:
        if (isActive) {
          return baseClasses + "bg-almet-sapphire text-white shadow-lg ring-4 ring-almet-sapphire/20";
        }
        return baseClasses + (darkMode 
          ? "bg-gray-700 text-gray-300 hover:bg-gray-600" 
          : "bg-gray-200 text-gray-600 hover:bg-gray-300");
    }
  };

  // Get step icon
  const getStepIcon = (step) => {
    const status = getStepStatus(step);
    
    switch (status) {
      case 'completed':
        return <Check size={16} />;
      case 'error':
        return <AlertCircle size={16} />;
      case 'active':
        return <Clock size={16} />;
      default:
        return <span>{step}</span>;
    }
  };

  // Get connector line style
  const getConnectorStyle = (step) => {
    const status = getStepStatus(step);
    const nextStatus = step < totalSteps ? getStepStatus(step + 1) : 'pending';
    
    if (status === 'completed' || step < currentStep) {
      return "bg-green-500";
    }
    if (status === 'error') {
      return "bg-red-500";
    }
    return borderColor.replace('border-', 'bg-');
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
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-gray-800">
                    <AlertCircle className="w-2 h-2 text-white" />
                  </div>
                )}
              </div>
              
              {/* Step Label */}
              {stepLabels && stepLabels[index] && (
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${
                    step === currentStep ? 'text-almet-sapphire' : 
                    status === 'completed' ? 'text-green-600 dark:text-green-400' :
                    status === 'error' ? 'text-red-600 dark:text-red-400' :
                    textSecondary
                  }`}>
                    {stepLabels[index]}
                  </p>
                  <p className={`text-xs ${textMuted}`}>
                    {status === 'completed' ? 'Completed' :
                     status === 'error' ? 'Has errors' :
                     step === currentStep ? 'Current' :
                     step < currentStep ? 'Completed' : 'Pending'}
                  </p>
                </div>
              )}
              
              {/* Connector Line */}
              {!isLast && (
                <div className="flex-1 h-0.5 mx-4">
                  <div className={`h-full transition-all duration-300 ${getConnectorStyle(step)}`} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Step Labels */}
      <div className="sm:hidden mt-4">
        {stepLabels && stepLabels[currentStep - 1] && (
          <div className="text-center">
            <p className={`text-sm font-medium ${textPrimary}`}>
              {stepLabels[currentStep - 1]}
            </p>
            <p className={`text-xs ${textMuted}`}>
              Step {currentStep} of {totalSteps}
            </p>
          </div>
        )}
      </div>

      {/* Progress Summary */}
      <div className="mt-4 flex justify-between items-center text-xs">
        <div className={textMuted}>
          <span>Step {currentStep} of {totalSteps}</span>
          {stepLabels[currentStep - 1] && (
            <span className="hidden sm:inline"> - {stepLabels[currentStep - 1]}</span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          {/* Completed Steps */}
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-1" />
            <span className={textMuted}>
              {Array.from({ length: totalSteps }).filter((_, i) => getStepStatus(i + 1) === 'completed').length} completed
            </span>
          </div>
          
          {/* Error Steps */}
          {Array.from({ length: totalSteps }).some((_, i) => getStepStatus(i + 1) === 'error') && (
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-1" />
              <span className={`text-red-600 dark:text-red-400`}>
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