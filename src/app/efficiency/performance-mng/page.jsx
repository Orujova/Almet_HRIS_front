"use client";
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { ChevronDown, Plus, Trash2, Users, Target, Award, BarChart3, Save, Settings } from 'lucide-react';

export default function PerformanceManagementPage() {
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('performance-form');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employeeData, setEmployeeData] = useState({});

  // Sample data - in a real app, this would come from an API
  const employees = [
    { 
      id: 1, 
      name: 'Sultanlı Mədinə Habil qızı', 
      position: 'Senior HR Digitalization Specialist', 
      manager: 'Tahirov Nizami Bəylər oğlu', 
      department: 'HR', 
      division: 'HR Governance, Reward & Systems',
      unit: 'HRIS',
      badge: 'ASL1912' 
    },
    { 
      id: 2, 
      name: 'Əhmədov Rəşad Məmməd oğlu', 
      position: 'Software Developer', 
      manager: 'İsmayılov Fərid Kamil oğlu', 
      department: 'IT', 
      division: 'Technology Solutions',
      unit: 'Development',
      badge: 'ASL1913' 
    },
    { 
      id: 3, 
      name: 'Məmmədova Günel Ramiz qızı', 
      position: 'Sales Manager', 
      manager: 'Həsənov Elçin Tərlan oğlu', 
      department: 'Sales', 
      division: 'Commercial Operations',
      unit: 'Sales Team',
      badge: 'ASL1914' 
    }
  ];

  const departmentObjectives = [
    'Bonus & Incentive Model & Performance Management System',
    'Bravo Leadership Journey',
    'Development of Collaborative Corporate Culture',
    'Digitalization and Process Automation',
    'Employee Training and Capability Development',
    'Internal Communication',
    'Introduction of Succession Plan',
    'Optimization of HQ Structure & Cost of Organization',
    'Turnover Management'
  ];

  const competencies = [
    { name: 'Collaboration', description: 'Makes productive contributions to own team. Solicits input from others. Acknowledges others\' efforts, advice, and contributions.' },
    { name: 'Customer Focus', description: 'Seeks to understand the reasons for customers\' choices. Asks questions to accurately identify customer needs.' },
    { name: 'Entrepreneurship', description: 'Displays a can-do attitude and enthusiasm. Identifies what needs to be done and does it.' },
    { name: 'Integrity', description: 'Follows stated policies and practices. Displays consistency between words and actions.' },
    { name: 'Result Orientation', description: 'Consistently achieves work objectives. Maintains work focus despite obstacles or setbacks.' }
  ];

  const evaluationScale = [
    { value: 'E--', points: 0, description: 'Does not meet standards & expectations of the job' },
    { value: 'E-', points: 1, description: 'Below standards & expectations of the job' },
    { value: 'E', points: 3, description: 'Meets standards & expectations of the job' },
    { value: 'E+', points: 4, description: 'Exceeds most standards & expectations of the job' },
    { value: 'E++', points: 5, description: 'Outstanding, exceeds all standards & expectations of the job' }
  ];

  const [adminSettings, setAdminSettings] = useState({
    minObjectives: 2,
    maxObjectives: 7,
    weights: {
      objectives: 70,
      competencies: 30
    }
  });

  // Initialize employee data
  const initializeEmployeeData = (employeeId) => {
    if (!employeeData[employeeId]) {
      setEmployeeData(prev => ({
        ...prev,
        [employeeId]: {
          departmentObjectives: departmentObjectives.map(obj => ({
            objective: obj,
            deadline: '',
            weight: 0,
            evaluation: ''
          })),
          employeeObjectives: [
            { objective: '', deadline: '', weight: 0, evaluation: '' },
            { objective: '', deadline: '', weight: 0, evaluation: '' }
          ],
          competencies: competencies.map(comp => ({
            name: comp.name,
            description: comp.description,
            evaluation: ''
          })),
          developmentObjectives: [
            { competencyGap: 'Result Orientation', developmentActivity: '', progress: '', comment: '' },
            { competencyGap: '', developmentActivity: '', progress: '', comment: '' },
            { competencyGap: '', developmentActivity: '', progress: '', comment: '' }
          ]
        }
      }));
    }
  };

  const handleEmployeeSelect = (employeeId) => {
    setSelectedEmployee(employeeId);
    if (employeeId) {
      initializeEmployeeData(employeeId);
    }
  };

  const updateEmployeeData = (section, index, field, value) => {
    if (!selectedEmployee) return;

    setEmployeeData(prev => ({
      ...prev,
      [selectedEmployee]: {
        ...prev[selectedEmployee],
        [section]: prev[selectedEmployee][section].map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  const addEmployeeObjective = () => {
    if (!selectedEmployee || !employeeData[selectedEmployee]) return;
    
    const currentObjectives = employeeData[selectedEmployee].employeeObjectives;
    if (currentObjectives.length >= adminSettings.maxObjectives) return;

    setEmployeeData(prev => ({
      ...prev,
      [selectedEmployee]: {
        ...prev[selectedEmployee],
        employeeObjectives: [
          ...prev[selectedEmployee].employeeObjectives,
          { objective: '', deadline: '', weight: 0, evaluation: '' }
        ]
      }
    }));
  };

  const removeEmployeeObjective = (index) => {
    if (!selectedEmployee || !employeeData[selectedEmployee]) return;
    
    const currentObjectives = employeeData[selectedEmployee].employeeObjectives;
    if (currentObjectives.length <= adminSettings.minObjectives) return;

    setEmployeeData(prev => ({
      ...prev,
      [selectedEmployee]: {
        ...prev[selectedEmployee],
        employeeObjectives: prev[selectedEmployee].employeeObjectives.filter((_, i) => i !== index)
      }
    }));
  };

  const calculateRating = (objectives, isEmployeeObjectives = false) => {
    if (!objectives) return { weight: 0, rating: 0 };
    
    let totalWeight = 0;
    let totalPoints = 0;

    objectives.forEach(obj => {
      const weight = parseFloat(obj.weight) || 0;
      const evaluation = evaluationScale.find(scale => scale.value === obj.evaluation);
      const points = evaluation ? evaluation.points : 0;
      
      totalWeight += weight;
      totalPoints += (weight / 100) * points;
    });

    let rating = 0;
    if (totalPoints === 3) {
      rating = 100;
    } else {
      rating = (totalPoints / 3) * 100;
    }

    return { weight: totalWeight, rating: Math.round(rating) };
  };

  const calculateOverallRating = () => {
    if (!selectedEmployee || !employeeData[selectedEmployee]) return 'E--';

    const empObjectivesRating = calculateRating(employeeData[selectedEmployee].employeeObjectives, true);
    const competenciesRating = 80; // Fixed as per original logic

    const avgPerformance = ((empObjectivesRating.rating / 100) + (competenciesRating / 100)) / 2;

    if (avgPerformance > 1.15) return 'E++';
    if (avgPerformance > 1) return 'E+';
    if (avgPerformance > 0.9) return 'E';
    if (avgPerformance > 0.75) return 'E-';
    return 'E--';
  };

  const selectedEmployeeData = selectedEmployee ? employees.find(e => e.id.toString() === selectedEmployee) : null;
  const currentEmployeeData = selectedEmployee ? employeeData[selectedEmployee] : null;

  const deptRating = currentEmployeeData ? calculateRating(currentEmployeeData.departmentObjectives) : { weight: 0, rating: 0 };
  const empRating = currentEmployeeData ? calculateRating(currentEmployeeData.employeeObjectives, true) : { weight: 0, rating: 0 };

  return (
    <DashboardLayout>
      <div className={`min-h-screen p-6`}>
        {/* Header */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'} rounded-lg`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-3xl font-bold text-almet-cloud-burst dark:text-almet-mystic">
                PERFORMANCE APPRAISAL FORM - 2025
              </h1>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className=" mx-auto ">
          <div className="flex space-x-1 mt-6">
            {[
              { id: 'performance-form', label: 'Performance Form', icon: Target },
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'admin', label: 'Admin Panel', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-4 py-2 rounded-t-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-almet-sapphire text-white'
                      : darkMode
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mx-auto py-6">
          
          {/* Performance Form Tab */}
          {activeTab === 'performance-form' && (
            <div className="space-y-6">
              {/* Employee Selection */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Employee</label>
                    <select
                      value={selectedEmployee}
                      onChange={(e) => handleEmployeeSelect(e.target.value)}
                      className={`w-full p-3 border rounded-lg ${
                        darkMode
                          ? 'bg-gray-700 border-gray-600 text-white'
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                    >
                      <option value="">-- Select an Employee --</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  {selectedEmployeeData && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><span className="font-medium">Department:</span> {selectedEmployeeData.department}</div>
                        <div><span className="font-medium">Badge:</span> {selectedEmployeeData.badge}</div>
                        <div><span className="font-medium">Division:</span> {selectedEmployeeData.division}</div>
                        <div><span className="font-medium">Position:</span> {selectedEmployeeData.position}</div>
                        <div><span className="font-medium">Unit:</span> {selectedEmployeeData.unit}</div>
                        <div><span className="font-medium">Manager:</span> {selectedEmployeeData.manager}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Evaluation Scale */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                <h2 className="text-xl font-bold mb-4 text-almet-sapphire">EVALUATION SCALE</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {evaluationScale.map(scale => (
                    <div key={scale.value} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="font-bold text-almet-cloud-burst dark:text-almet-mystic">{scale.value}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">{scale.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedEmployee && currentEmployeeData && (
                <>
                  {/* Department Objectives */}
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                    <h2 className="text-xl font-bold mb-4 text-almet-sapphire">DEPARTMENT OBJECTIVES</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <th className="text-left p-3">OBJECTIVE</th>
                            <th className="text-left p-3 w-32">DEADLINE</th>
                            <th className="text-left p-3 w-24">WEIGHT</th>
                            <th className="text-left p-3 w-32">EVALUATION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentEmployeeData.departmentObjectives.map((obj, index) => (
                            <tr key={index} className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                              <td className="p-3">{obj.objective}</td>
                              <td className="p-3">
                                <input
                                  type="text"
                                  value={obj.deadline}
                                  onChange={(e) => updateEmployeeData('departmentObjectives', index, 'deadline', e.target.value)}
                                  className={`w-full p-2 border rounded ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                  }`}
                                />
                              </td>
                              <td className="p-3">
                                <input
                                  type="number"
                                  value={obj.weight}
                                  onChange={(e) => updateEmployeeData('departmentObjectives', index, 'weight', e.target.value)}
                                  className={`w-full p-2 border rounded ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                  }`}
                                />
                              </td>
                              <td className="p-3">
                                <select
                                  value={obj.evaluation}
                                  onChange={(e) => updateEmployeeData('departmentObjectives', index, 'evaluation', e.target.value)}
                                  className={`w-full p-2 border rounded ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                  }`}
                                >
                                  <option value="">Select</option>
                                  {evaluationScale.map(scale => (
                                    <option key={scale.value} value={scale.value}>{scale.value}</option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          ))}
                          <tr className={`border-t-2 ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100'} font-bold`}>
                            <td className="p-3" colSpan={2}>DEPARTMENT PERFORMANCE RATING</td>
                            <td className="p-3">{deptRating.weight}%</td>
                            <td className="p-3">{deptRating.rating}%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Employee Job Objectives */}
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-almet-sapphire">
                        EMPLOYEE JOB OBJECTIVES (MIN {adminSettings.minObjectives} - MAX {adminSettings.maxObjectives})
                      </h2>
                      <button
                        onClick={addEmployeeObjective}
                        disabled={currentEmployeeData.employeeObjectives.length >= adminSettings.maxObjectives}
                        className="flex items-center px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Objective
                      </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <th className="text-left p-3">OBJECTIVE</th>
                            <th className="text-left p-3 w-32">DEADLINE</th>
                            <th className="text-left p-3 w-24">WEIGHT</th>
                            <th className="text-left p-3 w-32">EVALUATION</th>
                            <th className="text-left p-3 w-16">ACTION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentEmployeeData.employeeObjectives.map((obj, index) => (
                            <tr key={index} className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                              <td className="p-3">
                                <input
                                  type="text"
                                  value={obj.objective}
                                  onChange={(e) => updateEmployeeData('employeeObjectives', index, 'objective', e.target.value)}
                                  placeholder="Enter objective"
                                  className={`w-full p-2 border rounded ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                  }`}
                                />
                              </td>
                              <td className="p-3">
                                <input
                                  type="text"
                                  value={obj.deadline}
                                  onChange={(e) => updateEmployeeData('employeeObjectives', index, 'deadline', e.target.value)}
                                  className={`w-full p-2 border rounded ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                  }`}
                                />
                              </td>
                              <td className="p-3">
                                <input
                                  type="number"
                                  value={obj.weight}
                                  onChange={(e) => updateEmployeeData('employeeObjectives', index, 'weight', e.target.value)}
                                  className={`w-full p-2 border rounded ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                  }`}
                                />
                              </td>
                              <td className="p-3">
                                <select
                                  value={obj.evaluation}
                                  onChange={(e) => updateEmployeeData('employeeObjectives', index, 'evaluation', e.target.value)}
                                  className={`w-full p-2 border rounded ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                  }`}
                                >
                                  <option value="">Select</option>
                                  {evaluationScale.map(scale => (
                                    <option key={scale.value} value={scale.value}>{scale.value}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="p-3">
                                <button
                                  onClick={() => removeEmployeeObjective(index)}
                                  disabled={currentEmployeeData.employeeObjectives.length <= adminSettings.minObjectives}
                                  className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))}
                          <tr className={`border-t-2 ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100'} font-bold`}>
                            <td className="p-3" colSpan={2}>EMPLOYEE JOB PERFORMANCE RATING</td>
                            <td className="p-3">{empRating.weight}%</td>
                            <td className="p-3">{empRating.rating}%</td>
                            <td className="p-3"></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Leadership Competencies */}
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                    <h2 className="text-xl font-bold mb-4 text-almet-sapphire">LEADERSHIP COMPETENCIES EVALUATION</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <th className="text-left p-3 w-40">COMPETENCY</th>
                            <th className="text-left p-3">DESCRIPTION</th>
                            <th className="text-left p-3 w-32">EVALUATION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentEmployeeData.competencies.map((comp, index) => (
                            <tr key={index} className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                              <td className="p-3 font-medium text-almet-cloud-burst dark:text-almet-mystic">
                                {comp.name}
                              </td>
                              <td className="p-3 text-sm">{comp.description}</td>
                              <td className="p-3">
                                <select
                                  value={comp.evaluation}
                                  onChange={(e) => updateEmployeeData('competencies', index, 'evaluation', e.target.value)}
                                  className={`w-full p-2 border rounded ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                  }`}
                                >
                                  <option value="">Select</option>
                                  {evaluationScale.map(scale => (
                                    <option key={scale.value} value={scale.value}>{scale.value}</option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          ))}
                          <tr className={`border-t-2 ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-100'} font-bold`}>
                            <td className="p-3" colSpan={2}>TOTAL LEADERSHIP COMPETENCIES RATING</td>
                            <td className="p-3">80%</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Development Objectives */}
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                    <h2 className="text-xl font-bold mb-4 text-almet-sapphire">
                      DEVELOPMENT OBJECTIVES FOR THE YEAR (max 3 per year)
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <th className="text-left p-3">Competency Gap</th>
                            <th className="text-left p-3">Development Activity</th>
                            <th className="text-left p-3">Progress</th>
                            <th className="text-left p-3">Comment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentEmployeeData.developmentObjectives.map((dev, index) => (
                            <tr key={index} className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                              <td className="p-3">
                                <input
                                  type="text"
                                  value={dev.competencyGap}
                                  onChange={(e) => updateEmployeeData('developmentObjectives', index, 'competencyGap', e.target.value)}
                                  className={`w-full p-2 border rounded ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                  }`}
                                  readOnly={index === 0}
                                />
                              </td>
                              <td className="p-3">
                                <input
                                  type="text"
                                  value={dev.developmentActivity}
                                  onChange={(e) => updateEmployeeData('developmentObjectives', index, 'developmentActivity', e.target.value)}
                                  className={`w-full p-2 border rounded ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                  }`}
                                />
                              </td>
                              <td className="p-3">
                                <input
                                  type="text"
                                  value={dev.progress}
                                  onChange={(e) => updateEmployeeData('developmentObjectives', index, 'progress', e.target.value)}
                                  className={`w-full p-2 border rounded ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                  }`}
                                />
                              </td>
                              <td className="p-3">
                                <input
                                  type="text"
                                  value={dev.comment}
                                  onChange={(e) => updateEmployeeData('developmentObjectives', index, 'comment', e.target.value)}
                                  className={`w-full p-2 border rounded ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                  }`}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Overall Rating */}
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                    <h2 className="text-xl font-bold mb-4 text-almet-sapphire">
                      OVERALL EMPLOYEE PERFORMANCE RATING FOR THE YEAR
                    </h2>
                    <div className="flex justify-center">
                      <div className="bg-almet-sapphire text-white rounded-full w-32 h-32 flex items-center justify-center">
                        <span className="text-4xl font-bold">{calculateOverallRating()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sign Off */}
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                    <h2 className="text-xl font-bold mb-4 text-almet-sapphire">SIGN OFF</h2>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <th className="text-left p-3 w-32">ROLE</th>
                            <th className="text-left p-3">OBJECTIVE SETTING</th>
                            <th className="text-left p-3">MID YEAR REVIEW</th>
                            <th className="text-left p-3">YEAR END REVIEW</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <td className="p-3 font-medium">Employee</td>
                            <td className="p-3">
                              <input
                                type="text"
                                className={`w-full p-2 border rounded ${
                                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="text"
                                className={`w-full p-2 border rounded ${
                                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="text"
                                className={`w-full p-2 border rounded ${
                                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                              />
                            </td>
                          </tr>
                          <tr className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <td className="p-3 font-medium">Line Manager</td>
                            <td className="p-3">
                              <input
                                type="text"
                                className={`w-full p-2 border rounded ${
                                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="text"
                                className={`w-full p-2 border rounded ${
                                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                              />
                            </td>
                            <td className="p-3">
                              <input
                                type="text"
                                className={`w-full p-2 border rounded ${
                                  darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                }`}
                              />
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-almet-sapphire">Performance Management Dashboard</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-almet-cloud-burst dark:text-almet-mystic">
                        Total Employees
                      </h3>
                      <p className="text-3xl font-bold text-almet-sapphire">{employees.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-almet-bali-hai" />
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-almet-cloud-burst dark:text-almet-mystic">
                        Completed Reviews
                      </h3>
                      <p className="text-3xl font-bold text-green-600">
                        {Object.keys(employeeData).length}
                      </p>
                    </div>
                    <Award className="w-8 h-8 text-almet-bali-hai" />
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-almet-cloud-burst dark:text-almet-mystic">
                        Pending Reviews
                      </h3>
                      <p className="text-3xl font-bold text-orange-600">
                        {employees.length - Object.keys(employeeData).length}
                      </p>
                    </div>
                    <Target className="w-8 h-8 text-almet-bali-hai" />
                  </div>
                </div>
              </div>

              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                <h3 className="text-lg font-semibold mb-4 text-almet-cloud-burst dark:text-almet-mystic">
                  Employee Performance Overview
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <th className="text-left p-3">Employee</th>
                        <th className="text-left p-3">Department</th>
                        <th className="text-left p-3">Manager</th>
                        <th className="text-left p-3">Status</th>
                        <th className="text-left p-3">Overall Rating</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map(employee => {
                        const hasData = employeeData[employee.id];
                        const status = hasData ? 'Completed' : 'Pending';
                        return (
                          <tr key={employee.id} className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                            <td className="p-3">{employee.name}</td>
                            <td className="p-3">{employee.department}</td>
                            <td className="p-3">{employee.manager}</td>
                            <td className="p-3">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                status === 'Completed' 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                              }`}>
                                {status}
                              </span>
                            </td>
                            <td className="p-3">
                              {hasData ? (
                                <span className="font-semibold text-almet-sapphire">
                                  {/* Calculate rating for this employee */}
                                  E
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Admin Panel Tab */}
          {activeTab === 'admin' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-almet-sapphire">Admin Settings</h2>
              
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                <h3 className="text-lg font-semibold mb-4 text-almet-cloud-burst dark:text-almet-mystic">
                  Objective Settings
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Minimum Objectives</label>
                    <input
                      type="number"
                      min="1"
                      value={adminSettings.minObjectives}
                      onChange={(e) => setAdminSettings(prev => ({
                        ...prev,
                        minObjectives: parseInt(e.target.value) || 1
                      }))}
                      className={`w-full p-3 border rounded-lg ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Maximum Objectives</label>
                    <input
                      type="number"
                      min="1"
                      value={adminSettings.maxObjectives}
                      onChange={(e) => setAdminSettings(prev => ({
                        ...prev,
                        maxObjectives: parseInt(e.target.value) || 1
                      }))}
                      className={`w-full p-3 border rounded-lg ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                <h3 className="text-lg font-semibold mb-4 text-almet-cloud-burst dark:text-almet-mystic">
                  Performance Weights
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Objectives Weight (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={adminSettings.weights.objectives}
                      onChange={(e) => {
                        const objectiveWeight = parseInt(e.target.value) || 0;
                        setAdminSettings(prev => ({
                          ...prev,
                          weights: {
                            objectives: objectiveWeight,
                            competencies: 100 - objectiveWeight
                          }
                        }));
                      }}
                      className={`w-full p-3 border rounded-lg ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Competencies Weight (%)
                    </label>
                    <input
                      type="number"
                      value={adminSettings.weights.competencies}
                      readOnly
                      className={`w-full p-3 border rounded-lg bg-gray-100 ${
                        darkMode ? 'bg-gray-600 border-gray-600' : 'bg-gray-100 border-gray-300'
                      }`}
                    />
                  </div>
                </div>
                
                <div className="mt-4">
                  <button
                    onClick={() => {
                      // Save settings logic here
                      alert('Settings saved successfully!');
                    }}
                    className="flex items-center px-6 py-3 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </button>
                </div>
              </div>

              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6`}>
                <h3 className="text-lg font-semibold mb-4 text-almet-cloud-burst dark:text-almet-mystic">
                  System Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <div className="mb-3">
                      <span className="font-medium">Total Departments:</span>
                      <span className="ml-2 text-almet-sapphire">3</span>
                    </div>
                    <div className="mb-3">
                      <span className="font-medium">Total Employees:</span>
                      <span className="ml-2 text-almet-sapphire">{employees.length}</span>
                    </div>
                    <div className="mb-3">
                      <span className="font-medium">Active Reviews:</span>
                      <span className="ml-2 text-almet-sapphire">{Object.keys(employeeData).length}</span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="mb-3">
                      <span className="font-medium">Current Period:</span>
                      <span className="ml-2 text-almet-sapphire">2025</span>
                    </div>
                    <div className="mb-3">
                      <span className="font-medium">Review Cycle:</span>
                      <span className="ml-2 text-almet-sapphire">Annual</span>
                    </div>
                    <div className="mb-3">
                      <span className="font-medium">System Status:</span>
                      <span className="ml-2 text-green-600">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}