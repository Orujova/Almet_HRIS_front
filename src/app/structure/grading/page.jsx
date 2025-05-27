"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout"; // Assuming this path is correct
import { useTheme } from "@/components/common/ThemeProvider"; // Assuming this path is correct

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
    // Add vertical and horizontal percentages (assuming 0 for initial display if not provided)
    initialGradeNamesOrder.forEach(gradeName => {
        if (data[gradeName]) {
            data[gradeName].vertical = data[gradeName].vertical || 0;
            data[gradeName].horizontal = data[gradeName].horizontal || 0;
        }
    });
    return {
        grades: data, // Nested grades for consistency with drafts
        gradeOrder: [...initialGradeNamesOrder],
        verticalAvg: 0.54, // Given
        horizontalAvg: 0.08, // Given
    };
  }, [initialExcelData, initialGradeNamesOrder]);
  
  const [currentData, setCurrentData] = useState(createInitialCurrentData);

  // State for user inputs only
  const [scenarioInputs, setScenarioInputs] = useState(() => {
    const inputs = {
      baseValue1: "",
      gradeOrder: [...initialGradeNamesOrder],
      grades: initialGradeNamesOrder.reduce((acc, gradeName) => {
        acc[gradeName] = { vertical: "", horizontal: "" };
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

  // Memoized object combining inputs and calculated outputs for display and saving
  const newScenarioDisplayData = useMemo(() => {
    const combinedGrades = {};
    scenarioInputs.gradeOrder.forEach(gradeName => {
      combinedGrades[gradeName] = {
        ...scenarioInputs.grades[gradeName], // User-typed vertical/horizontal
        ...calculatedOutputs[gradeName] // Calculated LD-UD values
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

  // Pure function to calculate grades based on inputs
  const calculateGrades = useCallback((inputs) => {
    const newCalculatedValues = {};
    const baseValue = parseFloat(inputs.baseValue1) || 0;
    const order = inputs.gradeOrder;

    let previousGradeFinalLD = 0;
    let previousGradeVerticalPercentageForCalc = 0; // This is the vertical % *of the previous grade*

    order.forEach((gradeName, index) => {
      const currentGradeInputs = inputs.grades[gradeName] || {};
      const vertical = parseFloat(currentGradeInputs.vertical) || 0;
      const horizontal = parseFloat(currentGradeInputs.horizontal) || 0;

      let baseForThisGradeLDCalc;
      if (index === 0) { // First grade in order (e.g., Blue Collar)
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
      previousGradeVerticalPercentageForCalc = vertical; // Current grade's vertical will be "previous" for the next iteration
    });
    return newCalculatedValues;
  }, []);

  // Validation logic
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
    return newValidationErrors; // Return errors for immediate use in saving logic
  }, []);
  
  // Effect to trigger calculations and validation when user inputs change
  useEffect(() => {
    const newCalculatedValues = calculateGrades(scenarioInputs);
    setCalculatedOutputs(newCalculatedValues);
    validateInputs(scenarioInputs);
  }, [scenarioInputs, calculateGrades, validateInputs]);


  const handleBaseValueChange = (value) => {
    setScenarioInputs(prev => ({ ...prev, baseValue1: value }));
  };

  const handleVerticalChange = (grade, value) => {
    setScenarioInputs(prev => ({
      ...prev,
      grades: {
        ...prev.grades,
        [grade]: { ...prev.grades[grade], vertical: value },
      },
    }));
  };

  const handleHorizontalChange = (grade, value) => {
    setScenarioInputs(prev => ({
      ...prev,
      grades: {
        ...prev.grades,
        [grade]: { ...prev.grades[grade], horizontal: value },
      },
    }));
  };

  const handleGradeNameChange = (oldName, newName) => {
    const trimmedNewName = newName.trim();
    if (!trimmedNewName) {
        alert("Grade name cannot be empty.");
        return;
    }
    if (trimmedNewName !== oldName && scenarioInputs.gradeOrder.includes(trimmedNewName)) {
        alert("Grade name already exists.");
        return;
    }

    setScenarioInputs(prev => {
        const newGradesInputs = { ...prev.grades };
        const gradeContent = newGradesInputs[oldName];
        delete newGradesInputs[oldName];
        newGradesInputs[trimmedNewName] = gradeContent;

        const newOrder = prev.gradeOrder.map(gn => (gn === oldName ? trimmedNewName : gn));
        return { ...prev, grades: newGradesInputs, gradeOrder: newOrder };
    });

    setCalculatedOutputs(prev => {
        const newCalculated = { ...prev };
        newCalculated[trimmedNewName] = newCalculated[oldName];
        delete newCalculated[oldName];
        return newCalculated;
    });
  };

  const handleSaveDraft = () => {
    const currentErrors = validateInputs(scenarioInputs); // Validate just before saving
    if (Object.keys(currentErrors).length === 0 && newScenarioDisplayData.baseValue1 && parseFloat(newScenarioDisplayData.baseValue1) > 0) {
      const verticalSum = newScenarioDisplayData.gradeOrder.reduce((sum, gradeName) => sum + (parseFloat(newScenarioDisplayData.grades[gradeName].vertical) || 0), 0);
      const horizontalSum = newScenarioDisplayData.gradeOrder.reduce((sum, gradeName) => sum + (parseFloat(newScenarioDisplayData.grades[gradeName].horizontal) || 0), 0);
      const numGrades = newScenarioDisplayData.gradeOrder.length;

      const newDraft = {
        id: Date.now(), // Use timestamp for unique ID
        data: {
          ...newScenarioDisplayData, // Contains baseValue1, gradeOrder, and grades (with all values)
          verticalAvg: numGrades > 0 ? (verticalSum / numGrades) / 100 : 0,
          horizontalAvg: numGrades > 0 ? (horizontalSum / numGrades) / 100 : 0,
        },
        status: "draft",
        createdAt: new Date().toISOString(),
      };
      setDraftScenarios([...draftScenarios, newDraft]);
      handleResetNewScenario(); // Reset form after saving
    } else if (Object.keys(currentErrors).length > 0) {
      alert("Please fix the input errors before saving.");
    } else if (!newScenarioDisplayData.baseValue1 || parseFloat(newScenarioDisplayData.baseValue1) <= 0) {
      alert("Please enter a valid positive base value before saving.");
    }
  };

  const handleResetNewScenario = () => {
    setScenarioInputs(() => {
        const inputs = {
            baseValue1: "",
            gradeOrder: [...initialGradeNamesOrder],
            grades: initialGradeNamesOrder.reduce((acc, gradeName) => {
              acc[gradeName] = { vertical: "", horizontal: "" };
              return acc;
            }, {}),
          };
          return inputs;
    });
    setCalculatedOutputs(() => {
        const outputs = {};
        initialGradeNamesOrder.forEach(gradeName => {
          outputs[gradeName] = { LD: "", LQ: "", M: "", UQ: "", UD: "" };
        });
        return outputs;
    });
    setErrors({}); // Clear errors on reset
  };

  const handleSaveAsCurrent = (draftId) => {
    const selectedDraft = draftScenarios.find((s) => s.id === draftId);
    if (selectedDraft) {
      // The draft's data already has the correct structure (grades, gradeOrder, verticalAvg, horizontalAvg)
      setCurrentData(selectedDraft.data);
      setDraftScenarios(draftScenarios.filter((s) => s.id !== draftId));
      // Optionally, you might want to archive the *previous* currentData here if you need its history
    }
  };

  const handleArchiveDraft = (draftId) => {
    const selectedDraft = draftScenarios.find((s) => s.id === draftId);
    if (selectedDraft) {
      setDraftScenarios(draftScenarios.filter((s) => s.id !== draftId));
      setArchivedScenarios([...archivedScenarios, { ...selectedDraft, status: "archived" }]);
    }
  };

  const handleSetAsCurrentFromArchive = (scenarioToMakeCurrent) => {
    setCurrentData(scenarioToMakeCurrent.data);
    // Optionally, remove from archived or change its status to not be duplicated
  };

  const handleViewDetails = (scenario) => {
    setSelectedScenario(scenario);
    setIsDetailOpen(true);
  };

  const getBalanceScore = useCallback((scenario) => {
    const verticalAvg = scenario.data.verticalAvg || 0;
    const horizontalAvg = scenario.data.horizontalAvg || 0;
    const deviation = Math.abs(verticalAvg - horizontalAvg);
    
    // Prioritize lower deviation and higher combined average
    // Adding 1 to deviation prevents division by zero if deviation is 0.
    // Score is higher if V+H is high and V-H deviation is low.
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
      <div className="p-4 text-sm">
        <h1 className="text-xl font-bold text-almet-sapphire dark:text-white mb-5">Employee Grading System</h1>

        {/* Current Situation */}
        <div className="bg-white dark:bg-almet-cloud-burst rounded-lg shadow-lg p-5 mb-6">
          <h2 className="text-lg font-semibold text-almet-cloud-burst dark:text-white mb-5">Current Grade Structure</h2>
          <div className="flex flex-col md:flex-row gap-5 mb-5">
            <div className="flex-1">
              <div className="bg-almet-mystic dark:bg-almet-comet p-3 rounded-lg text-center">
                <span className="text-xs font-medium text-almet-sapphire dark:text-white">Vertical Average</span>
                <p className="text-2xl font-bold">{(currentData.verticalAvg * 100).toFixed(0)}%</p>
              </div>
            </div>
            <div className="flex-1">
              <div className="bg-almet-mystic dark:bg-almet-comet p-3 rounded-lg text-center">
                <span className="text-xs font-medium text-almet-sapphire dark:text-white">Horizontal Average</span>
                <p className="text-2xl font-bold">{(currentData.horizontalAvg * 100).toFixed(0)}%</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-almet-mystic dark:bg-almet-comet text-almet-sapphire dark:text-white">
                  <th className="p-2 text-left">Grade</th>
                  <th className="p-2 text-right">Lower Decile (LD)</th>
                  <th className="p-2 text-right">Lower Quartile (LQ)</th>
                  <th className="p-2 text-right">Median (M)</th>
                  <th className="p-2 text-right">Upper Quartile (UQ)</th>
                  <th className="p-2 text-right">Upper Decile (UD)</th>
                </tr>
              </thead>
              <tbody>
                {currentData.gradeOrder.map((gradeName) => {
                  const values = currentData.grades[gradeName];
                  if (!values) return null; 
                  return (
                    <tr key={gradeName} className="border-t dark:border-almet-comet hover:bg-almet-mystic dark:hover:bg-almet-comet/50" 
                        onClick={() => handleViewDetails({ 
                            id: 'current', 
                            data: { ...currentData, baseValue1: initialExcelData["Blue Collar"].LD }, // Add a base value for consistency in detail view
                            status: "current" 
                        })}>
                      <td className="p-2 text-almet-cloud-burst dark:text-white cursor-pointer">{gradeName}</td>
                      <td className="p-2 text-right">${(values.LD || 0).toLocaleString()}</td>
                      <td className="p-2 text-right">${(values.LQ || 0).toLocaleString()}</td>
                      <td className="p-2 text-right">${(values.M || 0).toLocaleString()}</td>
                      <td className="p-2 text-right">${(values.UQ || 0).toLocaleString()}</td>
                      <td className="p-2 text-right">${(values.UD || 0).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create New Scenario */}
        <div className="bg-white dark:bg-almet-cloud-burst rounded-lg shadow-lg p-5 mb-6">
          <h2 className="text-lg font-semibold text-almet-cloud-burst dark:text-white mb-5">Create New Scenario</h2>
          <div className="space-y-5">
            <div className="flex items-start flex-col sm:flex-row sm:items-center space-x-0 sm:space-x-5">
              <input
                type="number"
                placeholder="Base Value (Blue Collar LD)"
                value={scenarioInputs.baseValue1}
                onChange={(e) => handleBaseValueChange(e.target.value)}
                className={`w-full sm:w-1/4 p-2 border rounded-lg dark:bg-almet-mystic dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-sapphire ${
                  errors.baseValue1 ? "border-red-500" : "dark:border-almet-santas-gray"
                }`}
              />
              {errors.baseValue1 && <p className="text-red-500 text-xs mt-1 sm:mt-0">{errors.baseValue1}</p>}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="bg-almet-mystic dark:bg-almet-comet text-almet-sapphire dark:text-white">
                    <th className="p-2 text-left">Original Grade</th>
                    <th className="p-2 text-left">New Grade Name</th>
                    <th className="p-2 text-right">Vertical %</th>
                    <th className="p-2 text-right">Horizontal %</th>
                    <th className="p-2 text-right">LD</th>
                    <th className="p-2 text-right">LQ</th>
                    <th className="p-2 text-right">M</th>
                    <th className="p-2 text-right">UQ</th>
                    <th className="p-2 text-right">UD</th>
                  </tr>
                </thead>
                <tbody>
                  {newScenarioDisplayData.gradeOrder.map((gradeName) => {
                    const originalNameIndex = initialGradeNamesOrder.indexOf(gradeName);
                    const originalNameForThisRow = originalNameIndex !== -1 ? initialGradeNamesOrder[originalNameIndex] : gradeName;

                    const inputs = scenarioInputs.grades[gradeName] || { vertical: "", horizontal: "" };
                    const outputs = calculatedOutputs[gradeName] || { LD: "", LQ: "", M: "", UQ: "", UD: "" };

                    return (
                    <tr key={originalNameForThisRow} className="border-t dark:border-almet-comet hover:bg-almet-mystic dark:hover:bg-almet-comet/50">
                      <td className="p-2 text-almet-cloud-burst dark:text-white">{originalNameForThisRow}</td>
                      <td className="p-2">
                        <input
                          type="text"
                          value={gradeName} // This is the current name, might be edited
                          onChange={(e) => {
                            // Temporary update to reflect typing for the current row's gradeName
                            const tempOrder = [...scenarioInputs.gradeOrder];
                            const tempGrades = {...scenarioInputs.grades};
                            const oldGradeName = tempOrder[tempOrder.indexOf(gradeName)]; // Find the original key
                            
                            if (e.target.value !== oldGradeName) { // Only if the name is actually changing
                              tempGrades[e.target.value] = tempGrades[oldGradeName];
                              delete tempGrades[oldGradeName];
                              tempOrder[tempOrder.indexOf(oldGradeName)] = e.target.value;
                            } else {
                                // If user types back to old name, ensure we use that for key
                                tempGrades[e.target.value] = tempGrades[gradeName];
                            }
                            
                            setScenarioInputs(prev => ({
                                ...prev, 
                                grades: tempGrades, 
                                gradeOrder: tempOrder
                            }));
                          }}
                          onBlur={(e) => handleGradeNameChange(gradeName, e.target.value)} // Finalize on blur
                          className="w-28 p-1 border rounded-lg dark:bg-almet-mystic dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-sapphire dark:border-almet-santas-gray"
                        />
                      </td>
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          value={inputs.vertical}
                          onChange={(e) => handleVerticalChange(gradeName, e.target.value)}
                          className={`w-16 p-1 border rounded-lg dark:bg-almet-mystic dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-sapphire ${
                            errors[`vertical-${gradeName}`] ? "border-red-500" : "dark:border-almet-santas-gray"
                          }`}
                          placeholder="0"
                        />
                        {errors[`vertical-${gradeName}`] && <p className="text-red-500 text-xs mt-1">{errors[`vertical-${gradeName}`]}</p>}
                      </td>
                      <td className="p-2 text-right">
                        <input
                          type="number"
                          value={inputs.horizontal}
                          onChange={(e) => handleHorizontalChange(gradeName, e.target.value)}
                          className={`w-16 p-1 border rounded-lg dark:bg-almet-mystic dark:text-white focus:outline-none focus:ring-2 focus:ring-almet-sapphire ${
                            errors[`horizontal-${gradeName}`] ? "border-red-500" : "dark:border-almet-santas-gray"
                          }`}
                          placeholder="0"
                        />
                        {errors[`horizontal-${gradeName}`] && <p className="text-red-500 text-xs mt-1">{errors[`horizontal-${gradeName}`]}</p>}
                      </td>
                      <td className="p-2 text-right">{outputs.LD ? `$${Number(outputs.LD).toLocaleString()}` : "-"}</td>
                      <td className="p-2 text-right">{outputs.LQ ? `$${Number(outputs.LQ).toLocaleString()}` : "-"}</td>
                      <td className="p-2 text-right">{outputs.M ? `$${Number(outputs.M).toLocaleString()}` : "-"}</td>
                      <td className="p-2 text-right">{outputs.UQ ? `$${Number(outputs.UQ).toLocaleString()}` : "-"}</td>
                      <td className="p-2 text-right">{outputs.UD ? `$${Number(outputs.UD).toLocaleString()}` : "-"}</td>
                    </tr>
                  )})}
                </tbody>
              </table>
            </div>
            <div className="flex space-x-5">
              <button
                onClick={handleSaveDraft}
                className="bg-almet-sapphire text-white px-5 py-2 rounded-lg hover:bg-almet-astral transition duration-200 disabled:opacity-50"
                disabled={Object.keys(errors).length > 0 || !newScenarioDisplayData.baseValue1 || parseFloat(newScenarioDisplayData.baseValue1) <= 0}
              >
                Save as Draft
              </button>
              <button
                onClick={handleResetNewScenario}
                className="bg-gray-300 dark:bg-almet-comet text-almet-cloud-burst dark:text-white px-5 py-2 rounded-lg hover:bg-gray-400 dark:hover:bg-almet-bali-hai transition duration-200"
              >
                Reset Values
              </button>
            </div>
          </div>
        </div>

        {/* Draft Scenarios */}
        <div className="bg-white dark:bg-almet-cloud-burst rounded-lg shadow-lg p-5 mb-6">
          <h2 className="text-lg font-semibold text-almet-cloud-burst dark:text-white mb-5">Draft Scenarios</h2>
          {draftScenarios.length > 0 && bestDraft && (
            <div className="mb-4 p-3 bg-almet-mystic dark:bg-almet-comet rounded-lg border-almet-sapphire border-l-4">
              <p className="text-sm font-medium text-almet-sapphire dark:text-white">
                Recommendation: This draft offers the best balance based on Vertical and Horizontal Averages.
              </p>
              <p className="text-xs text-almet-bali-hai dark:text-almet-santas-gray">
                 Draft created at {new Date(bestDraft.createdAt).toLocaleTimeString()} (Balance score: {getBalanceScore(bestDraft).toFixed(2)})
              </p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {draftScenarios.length > 0 ? (
                draftScenarios.map((scenario) => (
                    <div
                      key={scenario.id}
                      className={`p-4 rounded-lg border cursor-pointer ${
                        bestDraft && bestDraft.id === scenario.id ? "bg-almet-sapphire/10 border-almet-sapphire dark:border-almet-sapphire" : "bg-almet-mystic dark:bg-almet-comet border-almet-santas-gray dark:border-almet-comet"
                      }`}
                      onClick={() => handleViewDetails(scenario)}
                    >
                      <h3 className="text-base font-medium text-almet-sapphire dark:text-white mb-1">Draft (Created: {new Date(scenario.createdAt).toLocaleTimeString()})</h3>
                      <p className="text-xs text-almet-bali-hai dark:text-almet-santas-gray mb-3">Base: ${parseFloat(scenario.data.baseValue1).toLocaleString()}</p>
                      <div className="flex space-x-3 mb-3">
                        <div className="bg-white dark:bg-almet-cloud-burst p-2 rounded-lg text-center flex-1">
                          <span className="text-xs font-medium text-almet-sapphire dark:text-white">Vertical Avg</span>
                          <p className="text-lg font-bold">{(scenario.data.verticalAvg * 100).toFixed(0)}%</p>
                        </div>
                        <div className="bg-white dark:bg-almet-cloud-burst p-2 rounded-lg text-center flex-1">
                          <span className="text-xs font-medium text-almet-sapphire dark:text-white">Horizontal Avg</span>
                          <p className="text-lg font-bold">{(scenario.data.horizontalAvg * 100).toFixed(0)}%</p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSaveAsCurrent(scenario.id); }}
                          className="flex-1 bg-almet-sapphire text-white px-2 py-1 text-xs rounded-lg hover:bg-almet-astral transition duration-200"
                        >
                          Set as Current
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleArchiveDraft(scenario.id); }}
                          className="flex-1 bg-gray-300 dark:bg-almet-comet text-almet-cloud-burst dark:text-white px-2 py-1 text-xs rounded-lg hover:bg-gray-400 dark:hover:bg-almet-bali-hai transition duration-200"
                        >
                          Archive
                        </button>
                      </div>
                    </div>
                  ))
            ) : (
              <p className="text-center text-almet-bali-hai dark:text-almet-santas-gray col-span-full">No drafts yet. Create a new scenario above.</p>
            )}
          </div>
        </div>
        
        {/* Archived Scenarios */}
        <div className="bg-white dark:bg-almet-cloud-burst rounded-lg shadow-lg p-5">
          <h2 className="text-lg font-semibold text-almet-cloud-burst dark:text-white mb-5">Archived Scenarios</h2>
          {archivedScenarios.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {archivedScenarios.map((scenario) => (
                <div
                  key={scenario.id}
                  className="bg-almet-mystic dark:bg-almet-comet p-4 rounded-lg border border-almet-santas-gray dark:border-almet-comet cursor-pointer"
                  onClick={() => handleViewDetails(scenario)}
                >
                  <h3 className="text-base font-medium text-almet-sapphire dark:text-white mb-1">Archived (Created: {new Date(scenario.createdAt).toLocaleTimeString()})</h3>
                   <p className="text-xs text-almet-bali-hai dark:text-almet-santas-gray mb-3">Base: ${parseFloat(scenario.data.baseValue1).toLocaleString()}</p>
                  <div className="flex space-x-3 mb-3">
                     <div className="bg-white dark:bg-almet-cloud-burst p-2 rounded-lg text-center flex-1">
                      <span className="text-xs font-medium text-almet-sapphire dark:text-white">Vertical Avg</span>
                      <p className="text-lg font-bold">{(scenario.data.verticalAvg * 100).toFixed(0)}%</p>
                    </div>
                    <div className="bg-white dark:bg-almet-cloud-burst p-2 rounded-lg text-center flex-1">
                      <span className="text-xs font-medium text-almet-sapphire dark:text-white">Horizontal Avg</span>
                      <p className="text-lg font-bold">{(scenario.data.horizontalAvg * 100).toFixed(0)}%</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSetAsCurrentFromArchive(scenario); }}
                    className="w-full bg-almet-sapphire text-white px-3 py-2 rounded-lg text-xs hover:bg-almet-astral transition duration-200"
                  >
                    Re-activate as Current
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-almet-bali-hai dark:text-almet-santas-gray col-span-full">No archived scenarios.</p>
          )}
        </div>

        {/* Detail Modal */}
        {isDetailOpen && selectedScenario && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-almet-cloud-burst rounded-lg shadow-lg p-5 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-semibold text-almet-cloud-burst dark:text-white mb-4">
                {selectedScenario.status === "current" ? "Current Scenario" : selectedScenario.status.charAt(0).toUpperCase() + selectedScenario.status.slice(1) + " Scenario"} Details
              </h2>
              {selectedScenario.data.baseValue1 && <p className="mb-2 text-sm">Base Value: <strong>${parseFloat(selectedScenario.data.baseValue1).toLocaleString()}</strong></p>}
               <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 mb-3 text-sm">
                    <div>Vertical Avg: <strong>{(selectedScenario.data.verticalAvg * 100).toFixed(0)}%</strong></div>
                    <div>Horizontal Avg: <strong>{(selectedScenario.data.horizontalAvg * 100).toFixed(0)}%</strong></div>
               </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-almet-mystic dark:bg-almet-comet text-almet-sapphire dark:text-white">
                      <th className="p-2 text-left">Grade</th>
                      <th className="p-2 text-right">Vertical %</th>
                      <th className="p-2 text-right">Horizontal %</th>
                      <th className="p-2 text-right">LD</th>
                      <th className="p-2 text-right">LQ</th>
                      <th className="p-2 text-right">M</th>
                      <th className="p-2 text-right">UQ</th>
                      <th className="p-2 text-right">UD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedScenario.data.gradeOrder.map((gradeName) => {
                        const values = selectedScenario.data.grades[gradeName];
                        if (!values) return <tr key={gradeName}><td colSpan="8">Error: Grade data not found for {gradeName}</td></tr>;
                        return (
                            <tr key={gradeName} className="border-t dark:border-almet-comet hover:bg-almet-mystic dark:hover:bg-almet-comet/50">
                                <td className="p-2 text-almet-cloud-burst dark:text-white">{gradeName}</td>
                                <td className="p-2 text-right">{(parseFloat(values.vertical || "0") ).toFixed(0)}%</td>
                                <td className="p-2 text-right">{(parseFloat(values.horizontal || "0") ).toFixed(0)}%</td>
                                <td className="p-2 text-right">${(values.LD || 0).toLocaleString()}</td>
                                <td className="p-2 text-right">${(values.LQ || 0).toLocaleString()}</td>
                                <td className="p-2 text-right">${(values.M || 0).toLocaleString()}</td>
                                <td className="p-2 text-right">${(values.UQ || 0).toLocaleString()}</td>
                                <td className="p-2 text-right">${(values.UD || 0).toLocaleString()}</td>
                            </tr>
                        );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsDetailOpen(false)}
                  className="bg-almet-sapphire text-white px-4 py-2 rounded-lg hover:bg-almet-astral transition duration-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default GradingPage;