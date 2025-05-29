"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { BarChart3, TrendingUp, Calculator, Save, Archive, Eye, Trash2, Plus, X } from "lucide-react";

const GradingPage = () => {
  const { darkMode } = useTheme();

  const initialGradeNamesOrder = useMemo(() => [
    "Blue Collar", "Junior Specialist", "Specialist", "Manager", "HOD", "Director", "VC"
  ], []);

  // Initial data from Excel (Current Situation)
  const initialExcelData = useMemo(() => ({
    "Blue Collar": { LD: 30000, LQ: 35000, M: 40000, UQ: 45000, UD: 50000 },
    "Junior Specialist": { LD: 40000, LQ: 45000, M: 50000, UQ: 55000, UD: 60000 },
    "Specialist": { LD: 50000, LQ: 55000, M: 60000, UQ: 65000, UD: 70000 },
    "Manager": { LD: 60000, LQ: 65000, M: 70000, UQ: 75000, UD: 80000 },
    "HOD": { LD: 70000, LQ: 75000, M: 80000, UQ: 85000, UD: 90000 },
    "Director": { LD: 80000, LQ: 85000, M: 90000, UQ: 95000, UD: 100000 },
    "VC": { LD: 90000, LQ: 95000, M: 100000, UQ: 105000, UD: 110000 },
  }), []);

  const createInitialCurrentData = useCallback(() => {
    const data = { ...initialExcelData };
    initialGradeNamesOrder.forEach(gradeName => {
      if (data[gradeName]) {
        data[gradeName].vertical = data[gradeName].vertical || 0;
        data[gradeName].horizontal = data[gradeName].horizontal || 0;
      }
    });
    return {
      grades: data,
      gradeOrder: [...initialGradeNamesOrder],
      verticalAvg: 0.54,
      horizontalAvg: 0.08,
    };
  }, [initialExcelData, initialGradeNamesOrder]);
  
  const [currentData, setCurrentData] = useState(createInitialCurrentData);

  // State for user inputs only
  const [scenarioInputs, setScenarioInputs] = useState(() => {
    const inputs = {
      baseValue1: 30000, // Set default base value
      gradeOrder: [...initialGradeNamesOrder],
      grades: initialGradeNamesOrder.reduce((acc, gradeName) => {
        acc[gradeName] = { vertical: 15, horizontal: 8 }; // Set default values
        return acc;
      }, {}),
    };
    return inputs;
  });

  // State for calculated outputs only
  const [calculatedOutputs, setCalculatedOutputs] = useState(() => {
    const outputs = {};
    initialGradeNamesOrder.forEach(gradeName => {
      outputs[gradeName] = { LD: "", LQ: "", M: "", UQ: "", UD: "" };
    });
    return outputs;
  });

  // Enhanced scenario display data
  const newScenarioDisplayData = useMemo(() => {
    const combinedGrades = {};
    scenarioInputs.gradeOrder.forEach(gradeName => {
      combinedGrades[gradeName] = {
        ...scenarioInputs.grades[gradeName],
        ...calculatedOutputs[gradeName]
      };
    });
    return {
      baseValue1: scenarioInputs.baseValue1,
      gradeOrder: scenarioInputs.gradeOrder,
      grades: combinedGrades,
    };
  }, [scenarioInputs, calculatedOutputs]);

  const [draftScenarios, setDraftScenarios] = useState([]);
  const [archivedScenarios, setArchivedScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [compareMode, setCompareMode] = useState(false);
  const [selectedForComparison, setSelectedForComparison] = useState([]);

  // Enhanced calculation function
  const calculateGrades = useCallback((inputs) => {
    const newCalculatedValues = {};
    const baseValue = parseFloat(inputs.baseValue1) || 30000;
    const order = inputs.gradeOrder;

    let previousGradeFinalLD = 0;
    let previousGradeVerticalPercentageForCalc = 0;

    order.forEach((gradeName, index) => {
      const currentGradeInputs = inputs.grades[gradeName] || {};
      const vertical = parseFloat(currentGradeInputs.vertical) || 0;
      const horizontal = parseFloat(currentGradeInputs.horizontal) || 0;

      let baseForThisGradeLDCalc;
      if (index === 0) {
        baseForThisGradeLDCalc = baseValue;
      } else {
        baseForThisGradeLDCalc = previousGradeFinalLD * (1 + previousGradeVerticalPercentageForCalc / 100);
      }

      const ld = Math.round(baseForThisGradeLDCalc);
      
      newCalculatedValues[gradeName] = {
        LD: ld > 0 ? ld : "",
        LQ: ld > 0 ? Math.round(ld * (1 + (horizontal / 100) * 0.5)) : "",
        M: ld > 0 ? Math.round(ld * (1 + (horizontal / 100) * 1)) : "",
        UQ: ld > 0 ? Math.round(ld * (1 + (horizontal / 100) * 1.5)) : "",
        UD: ld > 0 ? Math.round(ld * (1 + (horizontal / 100) * 2)) : "",
      };
      
      previousGradeFinalLD = ld;
      previousGradeVerticalPercentageForCalc = vertical;
    });
    return newCalculatedValues;
  }, []);

  // Enhanced validation logic
  const validateInputs = useCallback((inputs) => {
    const newValidationErrors = {};
    if (!inputs.baseValue1 || parseFloat(inputs.baseValue1) <= 0) {
      newValidationErrors.baseValue1 = "Base value must be a positive number.";
    }
    inputs.gradeOrder.forEach((gradeName) => {
      const grade = inputs.grades[gradeName];
      if (grade) {
        const verticalStr = grade.vertical;
        const horizontalStr = grade.horizontal;
        if (verticalStr !== "" && (parseFloat(verticalStr) < 0 || parseFloat(verticalStr) > 100 || isNaN(parseFloat(verticalStr)))) {
          newValidationErrors[`vertical-${gradeName}`] = "Value must be 0-100.";
        }
        if (horizontalStr !== "" && (parseFloat(horizontalStr) < 0 || parseFloat(horizontalStr) > 100 || isNaN(parseFloat(horizontalStr)))) {
          newValidationErrors[`horizontal-${gradeName}`] = "Value must be 0-100.";
        }
      }
    });
    setErrors(newValidationErrors);
    return newValidationErrors;
  }, []);
  
  // Effect to trigger calculations and validation when user inputs change
  useEffect(() => {
    const newCalculatedValues = calculateGrades(scenarioInputs);
    setCalculatedOutputs(newCalculatedValues);
    validateInputs(scenarioInputs);
  }, [scenarioInputs, calculateGrades, validateInputs]);

  const handleBaseValueChange = (value) => {
    setScenarioInputs(prev => ({ ...prev, baseValue1: parseFloat(value) || 0 }));
  };

  const handleVerticalChange = (grade, value) => {
    setScenarioInputs(prev => ({
      ...prev,
      grades: {
        ...prev.grades,
        [grade]: { ...prev.grades[grade], vertical: parseFloat(value) || 0 },
      },
    }));
  };

  const handleHorizontalChange = (grade, value) => {
    setScenarioInputs(prev => ({
      ...prev,
      grades: {
        ...prev.grades,
        [grade]: { ...prev.grades[grade], horizontal: parseFloat(value) || 0 },
      },
    }));
  };

  const handleSaveDraft = () => {
    const currentErrors = validateInputs(scenarioInputs);
    if (Object.keys(currentErrors).length === 0 && newScenarioDisplayData.baseValue1 && parseFloat(newScenarioDisplayData.baseValue1) > 0) {
      const verticalSum = newScenarioDisplayData.gradeOrder.reduce((sum, gradeName) => sum + (parseFloat(newScenarioDisplayData.grades[gradeName].vertical) || 0), 0);
      const horizontalSum = newScenarioDisplayData.gradeOrder.reduce((sum, gradeName) => sum + (parseFloat(newScenarioDisplayData.grades[gradeName].horizontal) || 0), 0);
      const numGrades = newScenarioDisplayData.gradeOrder.length;

      const newDraft = {
        id: Date.now(),
        name: `Scenario ${draftScenarios.length + 1}`,
        data: {
          ...newScenarioDisplayData,
          verticalAvg: numGrades > 0 ? (verticalSum / numGrades) / 100 : 0,
          horizontalAvg: numGrades > 0 ? (horizontalSum / numGrades) / 100 : 0,
        },
        status: "draft",
        createdAt: new Date().toISOString(),
        metrics: calculateScenarioMetrics(newScenarioDisplayData)
      };
      setDraftScenarios([...draftScenarios, newDraft]);
      alert("Scenario saved as draft!");
    } else {
      alert("Please fix the input errors before saving.");
    }
  };

  // Calculate scenario metrics for comparison
  const calculateScenarioMetrics = (scenarioData) => {
    const totalBudgetImpact = scenarioData.gradeOrder.reduce((total, gradeName) => {
      const grade = scenarioData.grades[gradeName];
      return total + (grade.M || 0);
    }, 0);

    const avgSalaryIncrease = scenarioData.gradeOrder.reduce((total, gradeName) => {
      const grade = scenarioData.grades[gradeName];
      const currentGrade = currentData.grades[gradeName];
      const increase = ((grade.M || 0) - (currentGrade.M || 0)) / (currentGrade.M || 1);
      return total + increase;
    }, 0) / scenarioData.gradeOrder.length;

    return {
      totalBudgetImpact,
      avgSalaryIncrease: avgSalaryIncrease * 100,
      competitiveness: calculateCompetitiveness(scenarioData),
      riskLevel: calculateRiskLevel(scenarioData)
    };
  };

  const calculateCompetitiveness = (scenarioData) => {
    // Simple competitiveness calculation based on market standards
    const marketMultiplier = 1.2; // Assuming market is 20% higher
    let competitiveGrades = 0;
    
    scenarioData.gradeOrder.forEach(gradeName => {
      const grade = scenarioData.grades[gradeName];
      const currentGrade = currentData.grades[gradeName];
      const marketTarget = currentGrade.M * marketMultiplier;
      
      if (grade.M >= marketTarget * 0.9) { // Within 10% of market
        competitiveGrades++;
      }
    });
    
    return (competitiveGrades / scenarioData.gradeOrder.length) * 100;
  };

  const calculateRiskLevel = (scenarioData) => {
    const maxIncrease = scenarioData.gradeOrder.reduce((max, gradeName) => {
      const grade = scenarioData.grades[gradeName];
      const currentGrade = currentData.grades[gradeName];
      const increase = ((grade.M || 0) - (currentGrade.M || 0)) / (currentGrade.M || 1);
      return Math.max(max, increase);
    }, 0);

    if (maxIncrease > 0.3) return "High";
    if (maxIncrease > 0.15) return "Medium";
    return "Low";
  };

  const handleSaveAsCurrent = (draftId) => {
    const selectedDraft = draftScenarios.find((s) => s.id === draftId);
    if (selectedDraft) {
      setCurrentData(selectedDraft.data);
      setDraftScenarios(draftScenarios.filter((s) => s.id !== draftId));
      alert("Scenario has been set as current grade structure!");
    }
  };

  const handleArchiveDraft = (draftId) => {
    const selectedDraft = draftScenarios.find((s) => s.id === draftId);
    if (selectedDraft) {
      setDraftScenarios(draftScenarios.filter((s) => s.id !== draftId));
      setArchivedScenarios([...archivedScenarios, { ...selectedDraft, status: "archived" }]);
    }
  };

  const handleViewDetails = (scenario) => {
    setSelectedScenario(scenario);
    setIsDetailOpen(true);
  };

  // Comparison functionality
  const toggleCompareMode = () => {
    setCompareMode(!compareMode);
    setSelectedForComparison([]);
  };

  const toggleScenarioForComparison = (scenarioId) => {
    setSelectedForComparison(prev => {
      if (prev.includes(scenarioId)) {
        return prev.filter(id => id !== scenarioId);
      } else if (prev.length < 3) { // Limit to 3 scenarios for comparison
        return [...prev, scenarioId];
      }
      return prev;
    });
  };

  const getBalanceScore = useCallback((scenario) => {
    const verticalAvg = scenario.data.verticalAvg || 0;
    const horizontalAvg = scenario.data.horizontalAvg || 0;
    const deviation = Math.abs(verticalAvg - horizontalAvg);
    return (verticalAvg + horizontalAvg) / (1 + deviation); 
  }, []);

  const bestDraft = useMemo(() => {
    if (draftScenarios.length === 0) return null;
    return draftScenarios.reduce((best, scenario) => {
      return getBalanceScore(scenario) > getBalanceScore(best) ? scenario : best;
    }, draftScenarios[0]);
  }, [draftScenarios, getBalanceScore]);

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-almet-sapphire dark:text-white flex items-center">
            <BarChart3 className="mr-3" size={32} />
            Employee Grading System
          </h1>
          <div className="flex gap-3">
            <button
              onClick={toggleCompareMode}
              className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center ${
                compareMode 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              <TrendingUp size={16} className="mr-2" />
              {compareMode ? 'Exit Compare' : 'Compare Scenarios'}
            </button>
          </div>
        </div>

        {/* Current Situation - Enhanced */}
        <div className="bg-white dark:bg-almet-cloud-burst rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mr-4">
              <Eye className="text-green-600 dark:text-green-400" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-almet-cloud-burst dark:text-white">Current Grade Structure</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active salary grades and compensation levels</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Vertical Average</div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{(currentData.verticalAvg * 100).toFixed(1)}%</div>
              <div className="text-xs text-blue-600 dark:text-blue-400">Grade progression rate</div>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
              <div className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">Horizontal Average</div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">{(currentData.horizontalAvg * 100).toFixed(1)}%</div>
              <div className="text-xs text-green-600 dark:text-green-400">Within-grade variation</div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
              <div className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Total Budget</div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                ${currentData.gradeOrder.reduce((total, gradeName) => total + (currentData.grades[gradeName]?.M || 0), 0).toLocaleString()}
              </div>
              <div className="text-xs text-purple-600 dark:text-purple-400">Median salary total</div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300">Grade</th>
                  <th className="p-3 text-right font-semibold text-gray-700 dark:text-gray-300">Lower Decile</th>
                  <th className="p-3 text-right font-semibold text-gray-700 dark:text-gray-300">Lower Quartile</th>
                  <th className="p-3 text-right font-semibold text-gray-700 dark:text-gray-300">Median</th>
                  <th className="p-3 text-right font-semibold text-gray-700 dark:text-gray-300">Upper Quartile</th>
                  <th className="p-3 text-right font-semibold text-gray-700 dark:text-gray-300">Upper Decile</th>
                </tr>
              </thead>
              <tbody>
                {currentData.gradeOrder.map((gradeName, index) => {
                  const values = currentData.grades[gradeName];
                  if (!values) return null;
                  return (
                    <tr key={gradeName} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="p-3 font-medium text-almet-cloud-burst dark:text-white">{gradeName}</td>
                      <td className="p-3 text-right">${(values.LD || 0).toLocaleString()}</td>
                      <td className="p-3 text-right">${(values.LQ || 0).toLocaleString()}</td>
                      <td className="p-3 text-right font-semibold">${(values.M || 0).toLocaleString()}</td>
                      <td className="p-3 text-right">${(values.UQ || 0).toLocaleString()}</td>
                      <td className="p-3 text-right">${(values.UD || 0).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create New Scenario - Enhanced */}
        <div className="bg-white dark:bg-almet-cloud-burst rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mr-4">
              <Calculator className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-almet-cloud-burst dark:text-white">Create New Scenario</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">Design and test new compensation structures</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Base Value (Blue Collar LD) *
              </label>
              <input
                type="number"
                value={scenarioInputs.baseValue1}
                onChange={(e) => handleBaseValueChange(e.target.value)}
                className={`w-full p-3 border rounded-lg dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-sapphire ${
                  errors.baseValue1 ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Enter base salary value"
              />
              {errors.baseValue1 && <p className="text-red-500 text-sm mt-1">{errors.baseValue1}</p>}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <th className="p-3 text-left font-semibold text-gray-700 dark:text-gray-300">Grade</th>
                    <th className="p-3 text-center font-semibold text-gray-700 dark:text-gray-300">Vertical %</th>
                    <th className="p-3 text-center font-semibold text-gray-700 dark:text-gray-300">Horizontal %</th>
                    <th className="p-3 text-right font-semibold text-gray-700 dark:text-gray-300">LD</th>
                    <th className="p-3 text-right font-semibold text-gray-700 dark:text-gray-300">LQ</th>
                    <th className="p-3 text-right font-semibold text-gray-700 dark:text-gray-300">M</th>
                    <th className="p-3 text-right font-semibold text-gray-700 dark:text-gray-300">UQ</th>
                    <th className="p-3 text-right font-semibold text-gray-700 dark:text-gray-300">UD</th>
                  </tr>
                </thead>
                <tbody>
                  {newScenarioDisplayData.gradeOrder.map((gradeName) => {
                    const inputs = scenarioInputs.grades[gradeName] || { vertical: 0, horizontal: 0 };
                    const outputs = calculatedOutputs[gradeName] || { LD: "", LQ: "", M: "", UQ: "", UD: "" };

                    return (
                      <tr key={gradeName} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="p-3 font-medium text-almet-cloud-burst dark:text-white">{gradeName}</td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            value={inputs.vertical}
                            onChange={(e) => handleVerticalChange(gradeName, e.target.value)}
                            className={`w-20 p-2 border rounded-lg text-center dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-sapphire ${
                              errors[`vertical-${gradeName}`] ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                            }`}
                            placeholder="0"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                          {errors[`vertical-${gradeName}`] && <p className="text-red-500 text-xs mt-1">{errors[`vertical-${gradeName}`]}</p>}
                        </td>
                        <td className="p-3 text-center">
                          <input
                            type="number"
                            value={inputs.horizontal}
                            onChange={(e) => handleHorizontalChange(gradeName, e.target.value)}
                            className={`w-20 p-2 border rounded-lg text-center dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-sapphire ${
                              errors[`horizontal-${gradeName}`] ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                            }`}
                            placeholder="0"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                          {errors[`horizontal-${gradeName}`] && <p className="text-red-500 text-xs mt-1">{errors[`horizontal-${gradeName}`]}</p>}
                        </td>
                        <td className="p-3 text-right font-mono">{outputs.LD ? `$${Number(outputs.LD).toLocaleString()}` : "-"}</td>
                        <td className="p-3 text-right font-mono">{outputs.LQ ? `$${Number(outputs.LQ).toLocaleString()}` : "-"}</td>
                        <td className="p-3 text-right font-mono font-semibold">{outputs.M ? `$${Number(outputs.M).toLocaleString()}` : "-"}</td>
                        <td className="p-3 text-right font-mono">{outputs.UQ ? `$${Number(outputs.UQ).toLocaleString()}` : "-"}</td>
                        <td className="p-3 text-right font-mono">{outputs.UD ? `$${Number(outputs.UD).toLocaleString()}` : "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveDraft}
                className="bg-almet-sapphire text-white px-6 py-3 rounded-lg hover:bg-almet-astral transition duration-200 disabled:opacity-50 flex items-center"
                disabled={Object.keys(errors).length > 0 || !newScenarioDisplayData.baseValue1 || parseFloat(newScenarioDisplayData.baseValue1) <= 0}
              >
                <Save size={16} className="mr-2" />
                Save as Draft
              </button>
            </div>
          </div>
        </div>

        {/* Draft Scenarios - Enhanced with Comparison */}
        <div className="bg-white dark:bg-almet-cloud-burst rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mr-4">
                <Archive className="text-purple-600 dark:text-purple-400" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-almet-cloud-burst dark:text-white">Draft Scenarios</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {compareMode ? 'Select up to 3 scenarios to compare' : `${draftScenarios.length} draft scenarios available`}
                </p>
              </div>
            </div>
            {compareMode && selectedForComparison.length >= 2 && (
              <button
                onClick={() => setIsDetailOpen(true)}
                className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors flex items-center"
              >
                <TrendingUp size={16} className="mr-2" />
                Compare Selected ({selectedForComparison.length})
              </button>
            )}
          </div>

          {bestDraft && !compareMode && (
            <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-700">
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-xs">★</span>
                </div>
                <h3 className="font-semibold text-green-800 dark:text-green-300">Recommended Scenario</h3>
              </div>
              <p className="text-sm text-green-700 dark:text-green-400 mb-3">
                {bestDraft.name} offers the best balance based on your criteria (Balance score: {getBalanceScore(bestDraft).toFixed(2)})
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSaveAsCurrent(bestDraft.id)}
                  className="bg-green-600 text-white px-3 py-1 text-sm rounded hover:bg-green-700 transition-colors"
                >
                  Apply Now
                </button>
                <button
                  onClick={() => handleViewDetails(bestDraft)}
                  className="bg-gray-600 text-white px-3 py-1 text-sm rounded hover:bg-gray-700 transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {draftScenarios.length > 0 ? (
              draftScenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer relative ${
                    bestDraft && bestDraft.id === scenario.id && !compareMode
                      ? "bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border-green-300 dark:border-green-600 shadow-md"
                      : compareMode && selectedForComparison.includes(scenario.id)
                      ? "bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-600"
                      : "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:shadow-md"
                  }`}
                  onClick={() => compareMode ? toggleScenarioForComparison(scenario.id) : handleViewDetails(scenario)}
                >
                  {compareMode && (
                    <div className="absolute top-2 right-2">
                      <input
                        type="checkbox"
                        checked={selectedForComparison.includes(scenario.id)}
                        onChange={() => toggleScenarioForComparison(scenario.id)}
                        className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                      />
                    </div>
                  )}
                  
                  {bestDraft && bestDraft.id === scenario.id && !compareMode && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">
                      ★
                    </div>
                  )}

                  <div className="mb-3">
                    <h3 className="font-semibold text-almet-sapphire dark:text-white text-lg">
                      {scenario.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Created: {new Date(scenario.createdAt).toLocaleDateString()}
                      {scenario.metrics && (
                        <span className="ml-2 px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                          Risk: {scenario.metrics.riskLevel}
                        </span>
                      )}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="text-center p-2 bg-white dark:bg-gray-700 rounded border">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Vertical Avg</div>
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {(scenario.data.verticalAvg * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="text-center p-2 bg-white dark:bg-gray-700 rounded border">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Horizontal Avg</div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {(scenario.data.horizontalAvg * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {scenario.metrics && (
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Budget Impact:</span>
                        <span className="font-medium">${scenario.metrics.totalBudgetImpact.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Avg Increase:</span>
                        <span className={`font-medium ${scenario.metrics.avgSalaryIncrease > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {scenario.metrics.avgSalaryIncrease > 0 ? '+' : ''}{scenario.metrics.avgSalaryIncrease.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Market Competitive:</span>
                        <span className="font-medium">{scenario.metrics.competitiveness.toFixed(0)}%</span>
                      </div>
                    </div>
                  )}

                  {!compareMode && (
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleSaveAsCurrent(scenario.id); }}
                        className="flex-1 bg-almet-sapphire text-white px-3 py-1.5 text-xs rounded hover:bg-almet-astral transition-colors"
                      >
                        Apply
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleArchiveDraft(scenario.id); }}
                        className="bg-gray-400 text-white px-3 py-1.5 text-xs rounded hover:bg-gray-500 transition-colors"
                      >
                        Archive
                      </button>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Archive className="text-gray-400" size={24} />
                </div>
                <h3 className="text-lg font-medium text-gray-600 dark:text-gray-400 mb-2">No Draft Scenarios</h3>
                <p className="text-sm text-gray-500 dark:text-gray-500">Create your first scenario above to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Archived Scenarios */}
        {archivedScenarios.length > 0 && (
          <div className="bg-white dark:bg-almet-cloud-burst rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-almet-cloud-burst dark:text-white mb-4">Archived Scenarios</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {archivedScenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:shadow-md transition-all"
                  onClick={() => handleViewDetails(scenario)}
                >
                  <h3 className="font-medium text-almet-sapphire dark:text-white mb-2">{scenario.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                    Archived: {new Date(scenario.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex gap-2">
                    <div className="text-center p-2 bg-white dark:bg-gray-700 rounded flex-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400">V-Avg</div>
                      <div className="font-bold text-sm">{(scenario.data.verticalAvg * 100).toFixed(1)}%</div>
                    </div>
                    <div className="text-center p-2 bg-white dark:bg-gray-700 rounded flex-1">
                      <div className="text-xs text-gray-500 dark:text-gray-400">H-Avg</div>
                      <div className="font-bold text-sm">{(scenario.data.horizontalAvg * 100).toFixed(1)}%</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detail Modal - Enhanced for Comparison */}
        {isDetailOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-almet-cloud-burst rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
              <div className="sticky top-0 bg-white dark:bg-almet-cloud-burst border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-xl">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-almet-cloud-burst dark:text-white">
                    {compareMode && selectedForComparison.length >= 2 ? 
                      `Scenario Comparison (${selectedForComparison.length} scenarios)` : 
                      selectedScenario ? `${selectedScenario.name} Details` : 'Scenario Details'
                    }
                  </h2>
                  <button
                    onClick={() => setIsDetailOpen(false)}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {compareMode && selectedForComparison.length >= 2 ? (
                  // Comparison View
                  <div className="space-y-6">
                    {/* Comparison Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {selectedForComparison.map(scenarioId => {
                        const scenario = draftScenarios.find(s => s.id === scenarioId);
                        if (!scenario) return null;
                        return (
                          <div key={scenarioId} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border">
                            <h3 className="font-semibold text-lg mb-3">{scenario.name}</h3>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">V-Avg:</span>
                                <span className="font-medium">{(scenario.data.verticalAvg * 100).toFixed(1)}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">H-Avg:</span>
                                <span className="font-medium">{(scenario.data.horizontalAvg * 100).toFixed(1)}%</span>
                              </div>
                              {scenario.metrics && (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Budget:</span>
                                    <span className="font-medium">${scenario.metrics.totalBudgetImpact.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Risk:</span>
                                    <span className={`font-medium px-2 py-0.5 rounded text-xs ${
                                      scenario.metrics.riskLevel === 'High' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                                      scenario.metrics.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                      'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                    }`}>
                                      {scenario.metrics.riskLevel}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Detailed Comparison Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse border border-gray-200 dark:border-gray-700">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-800">
                            <th className="p-3 text-left border border-gray-200 dark:border-gray-700">Grade</th>
                            {selectedForComparison.map(scenarioId => {
                              const scenario = draftScenarios.find(s => s.id === scenarioId);
                              return scenario ? (
                                <th key={scenarioId} className="p-3 text-center border border-gray-200 dark:border-gray-700">
                                  {scenario.name}
                                </th>
                              ) : null;
                            })}
                          </tr>
                        </thead>
                        <tbody>
                          {initialGradeNamesOrder.map(gradeName => (
                            <tr key={gradeName} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                              <td className="p-3 font-medium border border-gray-200 dark:border-gray-700">{gradeName}</td>
                              {selectedForComparison.map(scenarioId => {
                                const scenario = draftScenarios.find(s => s.id === scenarioId);
                                const gradeData = scenario?.data.grades[gradeName];
                                return (
                                  <td key={scenarioId} className="p-3 text-center border border-gray-200 dark:border-gray-700">
                                    {gradeData ? (
                                      <div className="space-y-1">
                                        <div className="font-mono font-semibold">${(gradeData.M || 0).toLocaleString()}</div>
                                        <div className="text-xs text-gray-500">
                                          V: {gradeData.vertical}% / H: {gradeData.horizontal}%
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
                  // Single Scenario Detail View
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">Base Value</div>
                        <div className="text-xl font-bold">${parseFloat(selectedScenario.data.baseValue1).toLocaleString()}</div>
                      </div>
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <div className="text-sm text-green-600 dark:text-green-400 mb-1">Vertical Avg</div>
                        <div className="text-xl font-bold">{(selectedScenario.data.verticalAvg * 100).toFixed(1)}%</div>
                      </div>
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                        <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">Horizontal Avg</div>
                        <div className="text-xl font-bold">{(selectedScenario.data.horizontalAvg * 100).toFixed(1)}%</div>
                      </div>
                      {selectedScenario.metrics && (
                        <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                          <div className="text-sm text-orange-600 dark:text-orange-400 mb-1">Risk Level</div>
                          <div className={`text-xl font-bold ${
                            selectedScenario.metrics.riskLevel === 'High' ? 'text-red-600' :
                            selectedScenario.metrics.riskLevel === 'Medium' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {selectedScenario.metrics.riskLevel}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                            <th className="p-3 text-left">Grade</th>
                            <th className="p-3 text-center">Vertical %</th>
                            <th className="p-3 text-center">Horizontal %</th>
                            <th className="p-3 text-right">LD</th>
                            <th className="p-3 text-right">LQ</th>
                            <th className="p-3 text-right">Median</th>
                            <th className="p-3 text-right">UQ</th>
                            <th className="p-3 text-right">UD</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedScenario.data.gradeOrder.map((gradeName) => {
                            const values = selectedScenario.data.grades[gradeName];
                            if (!values) return null;
                            return (
                              <tr key={gradeName} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                <td className="p-3 font-medium">{gradeName}</td>
                                <td className="p-3 text-center">{(parseFloat(values.vertical || "0")).toFixed(1)}%</td>
                                <td className="p-3 text-center">{(parseFloat(values.horizontal || "0")).toFixed(1)}%</td>
                                <td className="p-3 text-right font-mono">${(values.LD || 0).toLocaleString()}</td>
                                <td className="p-3 text-right font-mono">${(values.LQ || 0).toLocaleString()}</td>
                                <td className="p-3 text-right font-mono font-semibold">${(values.M || 0).toLocaleString()}</td>
                                <td className="p-3 text-right font-mono">${(values.UQ || 0).toLocaleString()}</td>
                                <td className="p-3 text-right font-mono">${(values.UD || 0).toLocaleString()}</td>
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