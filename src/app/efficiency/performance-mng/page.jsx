"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { ChevronDown, Plus, Trash2, Users, Target, Award, BarChart3, Save, Settings, Calendar, FileText, TrendingUp, Star, AlertCircle, Download, Upload, Search, Filter, Eye, Edit } from 'lucide-react';

export default function PerformanceManagementPage() {
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('performance-form');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employeeData, setEmployeeData] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');

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
      badge: 'ASL1912',
      avatar: 'https://ui-avatars.com/api/?name=Sultanlı+Mədinə&background=2346A8&color=fff'
    },
    { 
      id: 2, 
      name: 'Əhmədov Rəşad Məmməd oğlu', 
      position: 'Software Developer', 
      manager: 'İsmayılov Fərid Kamil oğlu', 
      department: 'IT', 
      division: 'Technology Solutions',
      unit: 'Development',
      badge: 'ASL1913',
      avatar: 'https://ui-avatars.com/api/?name=Əhmədov+Rəşad&background=30539b&color=fff'
    },
    { 
      id: 3, 
      name: 'Məmmədova Günel Ramiz qızı', 
      position: 'Sales Manager', 
      manager: 'Həsənov Elçin Tərlan oğlu', 
      department: 'Sales', 
      division: 'Commercial Operations',
      unit: 'Sales Team',
      badge: 'ASL1914',
      avatar: 'https://ui-avatars.com/api/?name=Məmmədova+Günel&background=336fa5&color=fff'
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
    { value: 'E--', points: 0, description: 'Does not meet standards & expectations of the job', color: 'bg-red-500' },
    { value: 'E-', points: 1, description: 'Below standards & expectations of the job', color: 'bg-orange-500' },
    { value: 'E', points: 3, description: 'Meets standards & expectations of the job', color: 'bg-yellow-500' },
    { value: 'E+', points: 4, description: 'Exceeds most standards & expectations of the job', color: 'bg-blue-500' },
    { value: 'E++', points: 5, description: 'Outstanding, exceeds all standards & expectations of the job', color: 'bg-green-500' }
  ];

  const [adminSettings, setAdminSettings] = useState({
    minObjectives: 2,
    maxObjectives: 7,
    weights: {
      objectives: 70,
      competencies: 30
    }
  });

  // Show notification helper
  const showNotif = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

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
          ],
          reviews: {
            midYearEmployee: '',
            midYearManager: '',
            endYearEmployee: '',
            endYearManager: '',
            developmentPlan: ''
          }
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

  const updateEmployeeReview = (field, value) => {
    if (!selectedEmployee) return;

    setEmployeeData(prev => ({
      ...prev,
      [selectedEmployee]: {
        ...prev[selectedEmployee],
        reviews: {
          ...prev[selectedEmployee].reviews,
          [field]: value
        }
      }
    }));
  };

  const addEmployeeObjective = () => {
    if (!selectedEmployee || !employeeData[selectedEmployee]) return;
    
    const currentObjectives = employeeData[selectedEmployee].employeeObjectives;
    if (currentObjectives.length >= adminSettings.maxObjectives) {
      showNotif(`Maximum ${adminSettings.maxObjectives} objectives reached!`);
      return;
    }

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
    showNotif('New objective added successfully!');
  };

  const removeEmployeeObjective = (index) => {
    if (!selectedEmployee || !employeeData[selectedEmployee]) return;
    
    const currentObjectives = employeeData[selectedEmployee].employeeObjectives;
    if (currentObjectives.length <= adminSettings.minObjectives) {
      showNotif(`Minimum ${adminSettings.minObjectives} objectives required!`);
      return;
    }

    setEmployeeData(prev => ({
      ...prev,
      [selectedEmployee]: {
        ...prev[selectedEmployee],
        employeeObjectives: prev[selectedEmployee].employeeObjectives.filter((_, i) => i !== index)
      }
    }));
    showNotif('Objective removed successfully!');
  };

  const calculateRating = (objectives) => {
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

  const calculateCompetenciesRating = (competencies) => {
    if (!competencies || competencies.length === 0) return 0;
    
    let totalPoints = 0;
    let evaluatedCompetencies = 0;

    competencies.forEach(comp => {
      if (comp.evaluation) {
        const evaluation = evaluationScale.find(scale => scale.value === comp.evaluation);
        const points = evaluation ? evaluation.points : 0;
        totalPoints += points;
        evaluatedCompetencies++;
      }
    });

    if (evaluatedCompetencies === 0) return 0;
    
    const avgPoints = totalPoints / evaluatedCompetencies;
    return Math.round((avgPoints / 5) * 100); // Convert to percentage of maximum possible (E++)
  };

  const calculateOverallRating = () => {
    if (!selectedEmployee || !employeeData[selectedEmployee]) return 'E--';

    const empObjectivesRating = calculateRating(employeeData[selectedEmployee].employeeObjectives);
    const competenciesRating = calculateCompetenciesRating(employeeData[selectedEmployee].competencies);

    const objectiveScore = (empObjectivesRating.rating / 100) * (adminSettings.weights.objectives / 100);
    const competencyScore = (competenciesRating / 100) * (adminSettings.weights.competencies / 100);
    
    const avgPerformance = objectiveScore + competencyScore;

    if (avgPerformance > 0.8) return 'E++';
    if (avgPerformance > 0.6) return 'E+';
    if (avgPerformance > 0.4) return 'E';
    if (avgPerformance > 0.2) return 'E-';
    return 'E--';
  };

  const getProgressStats = () => {
    const totalEmployees = employees.length;
    const reviewsStarted = Object.keys(employeeData).length;
    const reviewsCompleted = Object.keys(employeeData).filter(id => {
      const data = employeeData[id];
      const objectivesComplete = data.employeeObjectives.some(obj => obj.objective && obj.evaluation);
      const competenciesComplete = data.competencies.some(comp => comp.evaluation);
      return objectivesComplete && competenciesComplete;
    }).length;

    return { totalEmployees, reviewsStarted, reviewsCompleted };
  };

  const selectedEmployeeData = selectedEmployee ? employees.find(e => e.id.toString() === selectedEmployee) : null;
  const currentEmployeeData = selectedEmployee ? employeeData[selectedEmployee] : null;

  const deptRating = currentEmployeeData ? calculateRating(currentEmployeeData.departmentObjectives) : { weight: 0, rating: 0 };
  const empRating = currentEmployeeData ? calculateRating(currentEmployeeData.employeeObjectives) : { weight: 0, rating: 0 };
  const compRating = currentEmployeeData ? calculateCompetenciesRating(currentEmployeeData.competencies) : 0;

  // Filter employees for dashboard
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.badge.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filterDepartment || emp.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const stats = getProgressStats();

  return (
    <DashboardLayout>
      <div className={`min-h-screen p-4 text-sm`}>
        {/* Notification */}
        {showNotification && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-pulse">
            {notificationMessage}
          </div>
        )}

        {/* Header */}
        <div className={`${darkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-white to-gray-50'} shadow-lg border ${darkMode ? 'border-gray-600' : 'border-gray-200'} rounded-xl mb-4`}>
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-almet-cloud-burst dark:text-almet-mystic">
                  PERFORMANCE APPRAISAL FORM - 2025
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Comprehensive employee evaluation and development planning system
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <div className={`px-3 py-1 rounded-full text-xs ${darkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'}`}>
                  System Active
                </div>
                <Calendar className="w-5 h-5 text-almet-bali-hai" />
                <span className="text-xs text-gray-500">2025 Cycle</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-4">
          <div className="flex space-x-1">
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
                  className={`flex items-center px-4 py-2 rounded-t-lg text-sm font-medium transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-almet-sapphire text-white shadow-lg transform scale-105'
                      : darkMode
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900'
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
        <div className="space-y-4">
          
          {/* Performance Form Tab */}
          {activeTab === 'performance-form' && (
            <div className="space-y-4">
              {/* Employee Selection */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Employee</label>
                    <select
                      value={selectedEmployee}
                      onChange={(e) => handleEmployeeSelect(e.target.value)}
                      className={`w-full p-2 text-sm border rounded-lg ${
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
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={selectedEmployeeData.avatar} 
                          alt="Avatar" 
                          className="w-12 h-12 rounded-full"
                        />
                        <div>
                          <h3 className="font-semibold text-almet-cloud-burst dark:text-almet-mystic">
                            {selectedEmployeeData.name}
                          </h3>
                          <p className="text-xs text-gray-500">{selectedEmployeeData.position}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div><span className="font-medium">Department:</span> {selectedEmployeeData.department}</div>
                        <div><span className="font-medium">Badge:</span> {selectedEmployeeData.badge}</div>
                        <div><span className="font-medium">Division:</span> {selectedEmployeeData.division}</div>
                        <div><span className="font-medium">Unit:</span> {selectedEmployeeData.unit}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Evaluation Scale */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                <h2 className="text-lg font-bold mb-3 text-almet-sapphire flex items-center">
                  <Star className="w-5 h-5 mr-2" />
                  EVALUATION SCALE
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                  {evaluationScale.map(scale => (
                    <div key={scale.value} className={`p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'} border-l-4 ${scale.color}`}>
                      <div className="font-bold text-almet-cloud-burst dark:text-almet-mystic text-sm">{scale.value}</div>
                      <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">{scale.description}</div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedEmployee && currentEmployeeData && (
                <>
                  {/* Department Objectives */}
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                    <h2 className="text-lg font-bold mb-3 text-almet-sapphire flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      DEPARTMENT OBJECTIVES
                      <div className="ml-auto text-sm font-normal">
                        Weight: <span className="font-bold">{deptRating.weight}%</span> | 
                        Rating: <span className="font-bold text-almet-sapphire">{deptRating.rating}%</span>
                      </div>
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <th className="text-left p-2 text-xs">OBJECTIVE</th>
                            <th className="text-left p-2 w-24 text-xs">DEADLINE</th>
                            <th className="text-left p-2 w-20 text-xs">WEIGHT</th>
                            <th className="text-left p-2 w-24 text-xs">EVALUATION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentEmployeeData.departmentObjectives.map((obj, index) => (
                            <tr key={index} className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                              <td className="p-2 text-xs">{obj.objective}</td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={obj.deadline}
                                  onChange={(e) => updateEmployeeData('departmentObjectives', index, 'deadline', e.target.value)}
                                  className={`w-full p-1 text-xs border rounded ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                  }`}
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={obj.weight}
                                  onChange={(e) => updateEmployeeData('departmentObjectives', index, 'weight', e.target.value)}
                                  className={`w-full p-1 text-xs border rounded ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                  }`}
                                />
                              </td>
                              <td className="p-2">
                                <select
                                  value={obj.evaluation}
                                  onChange={(e) => updateEmployeeData('departmentObjectives', index, 'evaluation', e.target.value)}
                                  className={`w-full p-1 text-xs border rounded ${
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
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Employee Job Objectives */}
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                    <div className="flex justify-between items-center mb-3">
                      <h2 className="text-lg font-bold text-almet-sapphire flex items-center">
                        <FileText className="w-5 h-5 mr-2" />
                        EMPLOYEE JOB OBJECTIVES (MIN {adminSettings.minObjectives} - MAX {adminSettings.maxObjectives})
                        <div className="ml-4 text-sm font-normal">
                          Weight: <span className="font-bold">{empRating.weight}%</span> | 
                          Rating: <span className="font-bold text-almet-sapphire">{empRating.rating}%</span>
                        </div>
                      </h2>
                      <button
                        onClick={addEmployeeObjective}
                        disabled={currentEmployeeData.employeeObjectives.length >= adminSettings.maxObjectives}
                        className="flex items-center px-3 py-1 text-xs bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        <Plus className="w-3 h-3 mr-1" />
                        Add Objective
                      </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <th className="text-left p-2 text-xs">OBJECTIVE</th>
                            <th className="text-left p-2 w-24 text-xs">DEADLINE</th>
                            <th className="text-left p-2 w-20 text-xs">WEIGHT</th>
                            <th className="text-left p-2 w-24 text-xs">EVALUATION</th>
                            <th className="text-left p-2 w-16 text-xs">ACTION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentEmployeeData.employeeObjectives.map((obj, index) => (
                            <tr key={index} className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={obj.objective}
                                  onChange={(e) => updateEmployeeData('employeeObjectives', index, 'objective', e.target.value)}
                                  placeholder="Enter objective"
                                  className={`w-full p-1 text-xs border rounded ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                  }`}
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={obj.deadline}
                                  onChange={(e) => updateEmployeeData('employeeObjectives', index, 'deadline', e.target.value)}
                                  className={`w-full p-1 text-xs border rounded ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                  }`}
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="number"
                                  value={obj.weight}
                                  onChange={(e) => updateEmployeeData('employeeObjectives', index, 'weight', e.target.value)}
                                  className={`w-full p-1 text-xs border rounded ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                  }`}
                                />
                              </td>
                              <td className="p-2">
                                <select
                                  value={obj.evaluation}
                                  onChange={(e) => updateEmployeeData('employeeObjectives', index, 'evaluation', e.target.value)}
                                  className={`w-full p-1 text-xs border rounded ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                  }`}
                                >
                                  <option value="">Select</option>
                                  {evaluationScale.map(scale => (
                                    <option key={scale.value} value={scale.value}>{scale.value}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="p-2">
                                <button
                                  onClick={() => removeEmployeeObjective(index)}
                                  disabled={currentEmployeeData.employeeObjectives.length <= adminSettings.minObjectives}
                                  className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Leadership Competencies */}
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                    <h2 className="text-lg font-bold mb-3 text-almet-sapphire flex items-center">
                      <Award className="w-5 h-5 mr-2" />
                      LEADERSHIP COMPETENCIES EVALUATION
                      <div className="ml-auto text-sm font-normal">
                        Rating: <span className="font-bold text-almet-sapphire">{compRating}%</span>
                      </div>
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <th className="text-left p-2 w-32 text-xs">COMPETENCY</th>
                            <th className="text-left p-2 text-xs">DESCRIPTION</th>
                            <th className="text-left p-2 w-24 text-xs">EVALUATION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentEmployeeData.competencies.map((comp, index) => (
                            <tr key={index} className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                              <td className="p-2 font-medium text-almet-cloud-burst dark:text-almet-mystic text-xs">
                                {comp.name}
                              </td>
                              <td className="p-2 text-xs">{comp.description}</td>
                              <td className="p-2">
                                <select
                                  value={comp.evaluation}
                                  onChange={(e) => updateEmployeeData('competencies', index, 'evaluation', e.target.value)}
                                  className={`w-full p-1 text-xs border rounded ${
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
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Performance Reviews Section */}
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                    <h2 className="text-lg font-bold mb-3 text-almet-sapphire flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      PERFORMANCE REVIEWS
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="font-semibold mb-2 text-sm">Mid-Year Review</h3>
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-medium mb-1">Employee's Self-Assessment:</label>
                            <textarea
                              value={currentEmployeeData.reviews?.midYearEmployee || ''}
                              onChange={(e) => updateEmployeeReview('midYearEmployee', e.target.value)}
                              placeholder="Employee's mid-year reflections..."
                              rows={3}
                              className={`w-full p-2 text-xs border rounded ${
                                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">Manager's Comments:</label>
                            <textarea
                              value={currentEmployeeData.reviews?.midYearManager || ''}
                              onChange={(e) => updateEmployeeReview('midYearManager', e.target.value)}
                              placeholder="Provide mid-year feedback and progress notes..."
                              rows={3}
                              className={`w-full p-2 text-xs border rounded ${
                                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-semibold mb-2 text-sm">End-Year Review</h3>
                        <div className="space-y-2">
                          <div>
                            <label className="block text-xs font-medium mb-1">Employee's Self-Assessment:</label>
                            <textarea
                              value={currentEmployeeData.reviews?.endYearEmployee || ''}
                              onChange={(e) => updateEmployeeReview('endYearEmployee', e.target.value)}
                              placeholder="Employee's final self-assessment..."
                              rows={3}
                              className={`w-full p-2 text-xs border rounded ${
                                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium mb-1">Manager's Summary Comments:</label>
                            <textarea
                              value={currentEmployeeData.reviews?.endYearManager || ''}
                              onChange={(e) => updateEmployeeReview('endYearManager', e.target.value)}
                              placeholder="Provide a final summary of the year's performance..."
                              rows={3}
                              className={`w-full p-2 text-xs border rounded ${
                                darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Development Objectives */}
                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                    <h2 className="text-lg font-bold mb-3 text-almet-sapphire flex items-center">
                      <TrendingUp className="w-5 h-5 mr-2" />
                      DEVELOPMENT OBJECTIVES FOR THE YEAR (max 3 per year)
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                            <th className="text-left p-2 text-xs">Competency Gap</th>
                            <th className="text-left p-2 text-xs">Development Activity</th>
                            <th className="text-left p-2 text-xs">Progress</th>
                            <th className="text-left p-2 text-xs">Comment</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentEmployeeData.developmentObjectives.map((dev, index) => (
                            <tr key={index} className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={dev.competencyGap}
                                  onChange={(e) => updateEmployeeData('developmentObjectives', index, 'competencyGap', e.target.value)}
                                  className={`w-full p-1 text-xs border rounded ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                  } ${index === 0 ? 'bg-gray-100 dark:bg-gray-600' : ''}`}
                                  readOnly={index === 0}
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={dev.developmentActivity}
                                  onChange={(e) => updateEmployeeData('developmentObjectives', index, 'developmentActivity', e.target.value)}
                                  placeholder="Enter development activity"
                                  className={`w-full p-1 text-xs border rounded ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                  }`}
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={dev.progress}
                                  onChange={(e) => updateEmployeeData('developmentObjectives', index, 'progress', e.target.value)}
                                  placeholder="Progress status"
                                  className={`w-full p-1 text-xs border rounded ${
                                    darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                                  }`}
                                />
                              </td>
                              <td className="p-2">
                                <input
                                  type="text"
                                  value={dev.comment}
                                  onChange={(e) => updateEmployeeData('developmentObjectives', index, 'comment', e.target.value)}
                                  placeholder="Additional comments"
                                  className={`w-full p-1 text-xs border rounded ${
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
                  <div className={`${darkMode ? 'bg-gradient-to-r from-gray-800 to-gray-700' : 'bg-gradient-to-r from-white to-gray-50'} rounded-lg shadow-lg p-6 border-2 border-almet-sapphire`}>
                    <h2 className="text-lg font-bold mb-4 text-almet-sapphire flex items-center justify-center">
                      <Award className="w-6 h-6 mr-2" />
                      OVERALL EMPLOYEE PERFORMANCE RATING FOR THE YEAR
                    </h2>
                    <div className="flex flex-col items-center space-y-4">
                      <div className="bg-gradient-to-br from-almet-sapphire to-almet-astral text-white rounded-full w-24 h-24 flex items-center justify-center shadow-xl">
                        <span className="text-2xl font-bold">{calculateOverallRating()}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-center text-xs">
                        <div>
                          <div className="font-semibold text-almet-cloud-burst dark:text-almet-mystic">Objectives</div>
                          <div className="text-lg font-bold text-almet-sapphire">{empRating.rating}%</div>
                        </div>
                        <div>
                          <div className="font-semibold text-almet-cloud-burst dark:text-almet-mystic">Competencies</div>
                          <div className="text-lg font-bold text-almet-sapphire">{compRating}%</div>
                        </div>
                        <div>
                          <div className="font-semibold text-almet-cloud-burst dark:text-almet-mystic">Overall</div>
                          <div className="text-lg font-bold text-almet-sapphire">{calculateOverallRating()}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-center space-x-3">
                    <button
                      onClick={() => showNotif('Performance data saved successfully!')}
                      className="flex items-center px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-sm"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Progress
                    </button>
                    <button
                      onClick={() => showNotif('Report exported successfully!')}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export Report
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Enhanced Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-almet-sapphire flex items-center">
                  <BarChart3 className="w-6 h-6 mr-2" />
                  Performance Management Dashboard
                </h2>
                
                {/* Search and Filter */}
                <div className="flex space-x-3">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search employees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`pl-8 pr-3 py-1 text-xs border rounded-lg ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  <select
                    value={filterDepartment}
                    onChange={(e) => setFilterDepartment(e.target.value)}
                    className={`px-3 py-1 text-xs border rounded-lg ${
                      darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                    }`}
                  >
                    <option value="">All Departments</option>
                    <option value="HR">HR</option>
                    <option value="IT">IT</option>
                    <option value="Sales">Sales</option>
                  </select>
                </div>
              </div>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className={`${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-700' : 'bg-gradient-to-br from-white to-gray-50'} rounded-lg shadow-md p-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-mystic">
                        Total Employees
                      </h3>
                      <p className="text-2xl font-bold text-almet-sapphire">{stats.totalEmployees}</p>
                    </div>
                    <Users className="w-8 h-8 text-almet-bali-hai" />
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-700' : 'bg-gradient-to-br from-white to-gray-50'} rounded-lg shadow-md p-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-mystic">
                        Reviews Started
                      </h3>
                      <p className="text-2xl font-bold text-blue-600">{stats.reviewsStarted}</p>
                      <p className="text-xs text-gray-500">{Math.round((stats.reviewsStarted / stats.totalEmployees) * 100)}% of total</p>
                    </div>
                    <Edit className="w-8 h-8 text-almet-bali-hai" />
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-700' : 'bg-gradient-to-br from-white to-gray-50'} rounded-lg shadow-md p-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-mystic">
                        Completed Reviews
                      </h3>
                      <p className="text-2xl font-bold text-green-600">{stats.reviewsCompleted}</p>
                      <p className="text-xs text-gray-500">{Math.round((stats.reviewsCompleted / stats.totalEmployees) * 100)}% of total</p>
                    </div>
                    <Award className="w-8 h-8 text-almet-bali-hai" />
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-700' : 'bg-gradient-to-br from-white to-gray-50'} rounded-lg shadow-md p-4`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-mystic">
                        Pending Reviews
                      </h3>
                      <p className="text-2xl font-bold text-orange-600">{stats.totalEmployees - stats.reviewsStarted}</p>
                      <p className="text-xs text-gray-500">{Math.round(((stats.totalEmployees - stats.reviewsStarted) / stats.totalEmployees) * 100)}% remaining</p>
                    </div>
                    <Target className="w-8 h-8 text-almet-bali-hai" />
                  </div>
                </div>
              </div>

              {/* Progress Bars */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                <h3 className="text-lg font-semibold mb-4 text-almet-cloud-burst dark:text-almet-mystic flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Review Progress
                </h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Reviews Started</span>
                      <span>{stats.reviewsStarted}/{stats.totalEmployees}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(stats.reviewsStarted / stats.totalEmployees) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span>Reviews Completed</span>
                      <span>{stats.reviewsCompleted}/{stats.totalEmployees}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(stats.reviewsCompleted / stats.totalEmployees) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Employee Overview Table */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                <h3 className="text-lg font-semibold mb-4 text-almet-cloud-burst dark:text-almet-mystic flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Employee Performance Overview ({filteredEmployees.length} employees)
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <th className="text-left p-2">Employee</th>
                        <th className="text-left p-2">Department</th>
                        <th className="text-left p-2">Manager</th>
                        <th className="text-left p-2">Status</th>
                        <th className="text-left p-2">Overall Rating</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.map(employee => {
                        const hasData = employeeData[employee.id];
                        const empData = hasData ? employeeData[employee.id] : null;
                        const status = hasData ? 'In Progress' : 'Not Started';
                        const isCompleted = empData && 
                          empData.employeeObjectives.some(obj => obj.objective && obj.evaluation) &&
                          empData.competencies.some(comp => comp.evaluation);
                        
                        return (
                          <tr key={employee.id} className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} hover:bg-gray-50 dark:hover:bg-gray-700`}>
                            <td className="p-2">
                              <div className="flex items-center space-x-2">
                                <img src={employee.avatar} alt="Avatar" className="w-6 h-6 rounded-full" />
                                <div>
                                  <div className="font-medium">{employee.name}</div>
                                  <div className="text-gray-500">{employee.badge}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-2">{employee.department}</td>
                            <td className="p-2">{employee.manager}</td>
                            <td className="p-2">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                isCompleted 
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                  : hasData 
                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                              }`}>
                                {isCompleted ? 'Completed' : status}
                              </span>
                            </td>
                            <td className="p-2">
                              {isCompleted ? (
                                <span className="font-semibold text-almet-sapphire">
                                  {/* Would calculate actual rating here */}
                                  E+
                                </span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="p-2">
                              <button
                                onClick={() => {
                                  setSelectedEmployee(employee.id.toString());
                                  setActiveTab('performance-form');
                                  if (!hasData) initializeEmployeeData(employee.id);
                                }}
                                className="text-almet-sapphire hover:text-almet-astral text-xs"
                              >
                                {hasData ? 'Edit' : 'Start'} Review
                              </button>
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

          {/* Enhanced Admin Panel Tab */}
          {activeTab === 'admin' && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-almet-sapphire flex items-center">
                <Settings className="w-6 h-6 mr-2" />
                Admin Settings
              </h2>
              
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                <h3 className="text-lg font-semibold mb-3 text-almet-cloud-burst dark:text-almet-mystic">
                  Objective Settings
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Minimum Objectives</label>
                    <input
                      type="number"
                      min="1"
                      value={adminSettings.minObjectives}
                      onChange={(e) => setAdminSettings(prev => ({
                        ...prev,
                        minObjectives: parseInt(e.target.value) || 1
                      }))}
                      className={`w-full p-2 text-sm border rounded-lg ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Maximum Objectives</label>
                    <input
                      type="number"
                      min="1"
                      value={adminSettings.maxObjectives}
                      onChange={(e) => setAdminSettings(prev => ({
                        ...prev,
                        maxObjectives: parseInt(e.target.value) || 1
                      }))}
                      className={`w-full p-2 text-sm border rounded-lg ${
                        darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                      }`}
                    />
                  </div>
                </div>
              </div>

              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                <h3 className="text-lg font-semibold mb-3 text-almet-cloud-burst dark:text-almet-mystic">
                  Performance Weights
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Objectives Weight (%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={adminSettings.weights.objectives}
                      onChange={(e) => {
                        const objectiveWeight = parseInt(e.target.value);
                        setAdminSettings(prev => ({
                          ...prev,
                          weights: {
                            objectives: objectiveWeight,
                            competencies: 100 - objectiveWeight
                          }
                        }));
                      }}
                      className="w-full"
                    />
                    <div className="text-center text-lg font-bold text-almet-sapphire mt-1">
                      {adminSettings.weights.objectives}%
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Competencies Weight (%)
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={adminSettings.weights.competencies}
                      readOnly
                      className="w-full opacity-50"
                    />
                    <div className="text-center text-lg font-bold text-almet-sapphire mt-1">
                      {adminSettings.weights.competencies}%
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-center">
                  <button
                    onClick={() => showNotif('Settings saved successfully!')}
                    className="flex items-center px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-sm"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                  <h3 className="text-lg font-semibold mb-3 text-almet-cloud-burst dark:text-almet-mystic">
                    System Information
                  </h3>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Total Departments:</span>
                      <span className="text-almet-sapphire">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Total Employees:</span>
                      <span className="text-almet-sapphire">{employees.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Active Reviews:</span>
                      <span className="text-almet-sapphire">{Object.keys(employeeData).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Current Period:</span>
                      <span className="text-almet-sapphire">2025</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Review Cycle:</span>
                      <span className="text-almet-sapphire">Annual</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">System Status:</span>
                      <span className="text-green-600">Active</span>
                    </div>
                  </div>
                </div>

                <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                  <h3 className="text-lg font-semibold mb-3 text-almet-cloud-burst dark:text-almet-mystic">
                    Quick Actions
                  </h3>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => showNotif('Bulk export initiated!')}
                      className="w-full flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export All Reviews
                    </button>
                    <button
                      onClick={() => showNotif('Import template downloaded!')}
                      className="w-full flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Import Template
                    </button>
                    <button
                      onClick={() => showNotif('Notifications sent to all managers!')}
                      className="w-full flex items-center justify-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                    >
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Send Reminders
                    </button>
                    <button
                      onClick={() => {
                        // Clear all data for testing
                        setEmployeeData({});
                        showNotif('All data cleared successfully!');
                      }}
                      className="w-full flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Reset All Data
                    </button>
                  </div>
                </div>
              </div>

              {/* Performance Analytics */}
              <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-4`}>
                <h3 className="text-lg font-semibold mb-3 text-almet-cloud-burst dark:text-almet-mystic flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Performance Analytics
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800">
                    <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {Object.keys(employeeData).filter(id => {
                        const data = employeeData[id];
                        const rating = calculateOverallRating();
                        return rating === 'E++' || rating === 'E+';
                      }).length}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">High Performers</div>
                  </div>
                  
                  <div className="text-center p-3 rounded-lg bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900 dark:to-yellow-800">
                    <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                      {Object.keys(employeeData).filter(id => {
                        const data = employeeData[id];
                        return data.employeeObjectives.reduce((sum, obj) => sum + (parseFloat(obj.weight) || 0), 0) === 100;
                      }).length}
                    </div>
                    <div className="text-xs text-yellow-600 dark:text-yellow-400">Complete Weight Allocation</div>
                  </div>
                  
                  <div className="text-center p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800">
                    <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {Object.keys(employeeData).filter(id => {
                        const data = employeeData[id];
                        return data.reviews.midYearManager && data.reviews.endYearManager;
                      }).length}
                    </div>
                    <div className="text-xs text-blue-600 dark:text-blue-400">Reviews Complete</div>
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