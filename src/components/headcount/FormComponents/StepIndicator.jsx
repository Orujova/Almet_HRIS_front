// src/components/headcount/FormComponents/StepIndicator.jsx
import { Check } from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";

/**
 * Step indicator component for multi-step forms
 * @param {Object} props - Component props
 * @param {number} props.currentStep - Current active step
 * @param {number} props.totalSteps - Total number of steps
 * @param {Array<string>} props.stepLabels - Optional array of labels for each step
 * @returns {JSX.Element} - Step indicator component
 */
const StepIndicator = ({ currentStep, totalSteps, stepLabels = [] }) => {
  const { darkMode } = useTheme();

  // Theme-dependent classes
  const btnPrimary = darkMode
    ? "bg-blue-600 hover:bg-blue-700"
    : "bg-blue-500 hover:bg-blue-600";
  const btnSecondary = darkMode
    ? "bg-gray-700 hover:bg-gray-600"
    : "bg-gray-200 hover:bg-gray-300";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";

  return (
    <div className="flex items-center mb-6">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              index + 1 === currentStep
                ? btnPrimary + " text-white"
                : index + 1 < currentStep
                ? "bg-green-500 text-white"
                : btnSecondary + ` ${textPrimary}`
            }`}
          >
            {index + 1 < currentStep ? (
              <Check size={16} />
            ) : (
              <span>{index + 1}</span>
            )}
          </div>
          
          {stepLabels && stepLabels[index] && (
            <span className={`ml-2 text-xs ${textPrimary} hidden sm:inline`}>
              {stepLabels[index]}
            </span>
          )}
          
          {index < totalSteps - 1 && (
            <div
              className={`h-1 w-8 sm:w-12 mx-1 ${
                index + 1 < currentStep ? "bg-green-500" : borderColor
              }`}
            ></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;