"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { BarChart3, TrendingUp, Calculator, Save, Archive, Eye, Trash2, Plus, X, GitCompare } from "lucide-react";

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
      id: 'current',
      name: 'Current Structure',
      grades: data,
      gradeOrder: [...initialGradeNamesOrder],
      verticalAvg: 0.54,
      horizontalAvg: 0.08,
      baseValue1: 30000,
      status: 'current'
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
      setCurrentData({...selectedDraft.data, id: 'current', name: 'Current Structure', status: 'current'});
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
      } else if (prev.length < 4) { // Limit to 4 scenarios (3 drafts + current)
        return [...prev, scenarioId];
      }
      return prev;
    });
  };

  const startComparison = () => {
    if (selectedForComparison.length >= 2) {
      setIsDetailOpen(true);
    }
  };

  const getBalanceScore = useCallback((scenario) => {
    const verticalAvg = scenario.data ? scenario.data.verticalAvg || 0 : scenario.verticalAvg || 0;
    const horizontalAvg = scenario.data ? scenario.data.horizontalAvg || 0 : scenario.horizontalAvg || 0;
    const deviation = Math.abs(verticalAvg - horizontalAvg);
    return (verticalAvg + horizontalAvg) / (1 + deviation); 
  }, []);

  const bestDraft = useMemo(() => {
    if (draftScenarios.length === 0) return null;
    return draftScenarios.reduce((best, scenario) => {
      return getBalanceScore(scenario) > getBalanceScore(best) ? scenario : best;
    }, draftScenarios[0]);
  }, [draftScenarios, getBalanceScore]);

  // Get scenarios for comparison (including current)
  const getScenarioForComparison = (scenarioId) => {
    if (scenarioId === 'current') {
      return currentData;
    }
    return draftScenarios.find(s => s.id === scenarioId) || archivedScenarios.find(s => s.id === scenarioId);
  };

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
              Manage salary grades and compensation structures
            </p>
          </div>
        </div>

        {/* Current Situation */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-almet-cloud-burst dark:text-white">Current Grade Structure</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-almet-sapphire">{(currentData.verticalAvg * 100).toFixed(1)}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Vertical Average</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-almet-sapphire">{(currentData.horizontalAvg * 100).toFixed(1)}%</div>
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
                        <td className="py-3 text-sm font-medium text-almet-cloud-burst dark:text-white">{gradeName}</td>
                        <td className="py-3 text-sm text-right">${(values.LD || 0).toLocaleString()}</td>
                        <td className="py-3 text-sm text-right">${(values.LQ || 0).toLocaleString()}</td>
                        <td className="py-3 text-sm text-right font-medium">${(values.M || 0).toLocaleString()}</td>
                        <td className="py-3 text-sm text-right">${(values.UQ || 0).toLocaleString()}</td>
                        <td className="py-3 text-sm text-right">${(values.UD || 0).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Create New Scenario */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-medium text-almet-cloud-burst dark:text-white">Create New Scenario</h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Base Value (Blue Collar LD)
              </label>
              <input
                type="number"
                value={scenarioInputs.baseValue1}
                onChange={(e) => handleBaseValueChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg text-sm dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${
                  errors.baseValue1 ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                }`}
                placeholder="Enter base salary value"
              />
              {errors.baseValue1 && <p className="text-red-500 text-sm mt-1">{errors.baseValue1}</p>}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Grade</th>
                    <th className="text-center py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Vertical %</th>
                    <th className="text-center py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Horizontal %</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-600 dark:text-gray-400">LD</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-600 dark:text-gray-400">LQ</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Median</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-600 dark:text-gray-400">UQ</th>
                    <th className="text-right py-3 text-sm font-medium text-gray-600 dark:text-gray-400">UD</th>
                  </tr>
                </thead>
                <tbody>
                  {newScenarioDisplayData.gradeOrder.map((gradeName) => {
                    const inputs = scenarioInputs.grades[gradeName] || { vertical: 0, horizontal: 0 };
                    const outputs = calculatedOutputs[gradeName] || { LD: "", LQ: "", M: "", UQ: "", UD: "" };

                    return (
                      <tr key={gradeName} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-3 text-sm font-medium text-almet-cloud-burst dark:text-white">{gradeName}</td>
                        <td className="py-3 text-center">
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
                        </td>
                        <td className="py-3 text-center">
                          <input
                            type="number"
                            value={inputs.horizontal}
                            onChange={(e) => handleHorizontalChange(gradeName, e.target.value)}
                            className={`w-20 px-2 py-1 text-sm border rounded text-center dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-almet-sapphire ${
                              errors[`horizontal-${gradeName}`] ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                            }`}
                            placeholder="0"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                        </td>
                        <td className="py-3 text-sm text-right font-mono">{outputs.LD ? `$${Number(outputs.LD).toLocaleString()}` : "-"}</td>
                        <td className="py-3 text-sm text-right font-mono">{outputs.LQ ? `$${Number(outputs.LQ).toLocaleString()}` : "-"}</td>
                        <td className="py-3 text-sm text-right font-mono font-medium">{outputs.M ? `$${Number(outputs.M).toLocaleString()}` : "-"}</td>
                        <td className="py-3 text-sm text-right font-mono">{outputs.UQ ? `$${Number(outputs.UQ).toLocaleString()}` : "-"}</td>
                        <td className="py-3 text-sm text-right font-mono">{outputs.UD ? `$${Number(outputs.UD).toLocaleString()}` : "-"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveDraft}
                className="bg-almet-sapphire text-white px-6 py-2 text-sm rounded-lg hover:bg-almet-astral transition-colors disabled:opacity-50"
                disabled={Object.keys(errors).length > 0 || !newScenarioDisplayData.baseValue1 || parseFloat(newScenarioDisplayData.baseValue1) <= 0}
              >
                Save as Draft
              </button>
            </div>
          </div>
        </div>

        {/* Draft Scenarios */}
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
                      {bestDraft.name} - Balance score: {getBalanceScore(bestDraft).toFixed(2)}
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

            {/* Add Current Structure to comparison mode */}
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
                      <p className="text-xs text-gray-500 dark:text-gray-400">Active grade structure</p>
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

                    {scenario.metrics && (
                      <div className="space-y-2 mb-4 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Budget Impact:</span>
                          <span className="font-medium">${scenario.metrics.totalBudgetImpact.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Avg Increase:</span>
                          <span className={`font-medium ${scenario.metrics.avgSalaryIncrease > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {scenario.metrics.avgSalaryIncrease > 0 ? '+' : ''}{scenario.metrics.avgSalaryIncrease.toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Risk Level:</span>
                          <span className={`font-medium ${
                            scenario.metrics.riskLevel === 'High' ? 'text-red-600' :
                            scenario.metrics.riskLevel === 'Medium' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {scenario.metrics.riskLevel}
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

        {/* Detail Modal */}
        {isDetailOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
              <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-almet-cloud-burst dark:text-white">
                    {compareMode && selectedForComparison.length >= 2 ? 
                      `Scenario Comparison (${selectedForComparison.length} scenarios)` : 
                      selectedScenario ? `${selectedScenario.name} Details` : 'Scenario Details'
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
                  // Comparison View
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
                              {scenario.metrics && (
                                <>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Budget Impact:</span>
                                    <span className="font-medium">${scenario.metrics.totalBudgetImpact.toLocaleString()}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Risk Level:</span>
                                    <span className={`font-medium ${
                                      scenario.metrics.riskLevel === 'High' ? 'text-red-600' :
                                      scenario.metrics.riskLevel === 'Medium' ? 'text-yellow-600' :
                                      'text-green-600'
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
                          {initialGradeNamesOrder.map(gradeName => (
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
                                        <div className="font-mono font-semibold">${(gradeData.M || 0).toLocaleString()}</div>
                                        <div className="text-xs text-gray-500">
                                          V: {gradeData.vertical || 0}% / H: {gradeData.horizontal || 0}%
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
                      <div className="text-center">
                        <div className="text-2xl font-bold text-almet-sapphire">${parseFloat(selectedScenario.data?.baseValue1 || selectedScenario.baseValue1 || 0).toLocaleString()}</div>
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

                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-gray-200 dark:border-gray-700">
                            <th className="text-left py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Grade</th>
                            <th className="text-center py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Vertical %</th>
                            <th className="text-center py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Horizontal %</th>
                            <th className="text-right py-3 text-sm font-medium text-gray-600 dark:text-gray-400">LD</th>
                            <th className="text-right py-3 text-sm font-medium text-gray-600 dark:text-gray-400">LQ</th>
                            <th className="text-right py-3 text-sm font-medium text-gray-600 dark:text-gray-400">Median</th>
                            <th className="text-right py-3 text-sm font-medium text-gray-600 dark:text-gray-400">UQ</th>
                            <th className="text-right py-3 text-sm font-medium text-gray-600 dark:text-gray-400">UD</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(selectedScenario.data?.gradeOrder || selectedScenario.gradeOrder || []).map((gradeName) => {
                            const scenarioData = selectedScenario.data || selectedScenario;
                            const values = scenarioData.grades[gradeName];
                            if (!values) return null;
                            return (
                              <tr key={gradeName} className="border-b border-gray-100 dark:border-gray-700">
                                <td className="py-3 text-sm font-medium">{gradeName}</td>
                                <td className="py-3 text-sm text-center">{(parseFloat(values.vertical || "0")).toFixed(1)}%</td>
                                <td className="py-3 text-sm text-center">{(parseFloat(values.horizontal || "0")).toFixed(1)}%</td>
                                <td className="py-3 text-sm text-right font-mono">${(values.LD || 0).toLocaleString()}</td>
                                <td className="py-3 text-sm text-right font-mono">${(values.LQ || 0).toLocaleString()}</td>
                                <td className="py-3 text-sm text-right font-mono font-semibold">${(values.M || 0).toLocaleString()}</td>
                                <td className="py-3 text-sm text-right font-mono">${(values.UQ || 0).toLocaleString()}</td>
                                <td className="py-3 text-sm text-right font-mono">${(values.UD || 0).toLocaleString()}</td>
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