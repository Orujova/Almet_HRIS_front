"use client";
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { 
  ChevronDown, Plus, Trash2, Users, Target, Award, BarChart3, Save, Settings, 
  Calendar, FileText, TrendingUp, Star, AlertCircle, CheckCircle, XCircle, Send
} from 'lucide-react';

export default function PerformanceManagementSystem() {
  const { darkMode } = useTheme();
  const [activeModule, setActiveModule] = useState('dashboard');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');

  const [settings, setSettings] = useState({
    goalSetting: {
      employeeStart: '2025-01-01',
      employeeEnd: '2025-01-31',
      managerStart: '2025-01-01',
      managerEnd: '2025-02-15'
    },
    midYearReview: {
      start: '2025-06-01',
      end: '2025-06-30'
    },
    endYearReview: {
      start: '2025-11-01',
      end: '2025-12-31'
    },
    performanceWeights: [
      { positionGroup: 'Executive', objectivesWeight: 80, competenciesWeight: 20 },
      { positionGroup: 'Manager', objectivesWeight: 70, competenciesWeight: 30 },
      { positionGroup: 'Specialist', objectivesWeight: 60, competenciesWeight: 40 },
      { positionGroup: 'Officer', objectivesWeight: 50, competenciesWeight: 50 }
    ],
    goalLimits: {
      min: 3,
      max: 7
    },
    departmentObjectives: [
      { 
        department: 'HR', 
        objectives: [
          { title: 'Bonus & Incentive Model', weight: 30 },
          { title: 'Leadership Development', weight: 25 },
          { title: 'Corporate Culture', weight: 25 },
          { title: 'Process Automation', weight: 20 }
        ]
      },
      { 
        department: 'IT', 
        objectives: [
          { title: 'Infrastructure Upgrade', weight: 40 },
          { title: 'Cybersecurity Enhancement', weight: 30 },
          { title: 'Digital Transformation', weight: 30 }
        ]
      }
    ],
    evaluationScale: [
      { name: 'E--', value: 0, rangeMin: 0, rangeMax: 20, description: 'Does not meet standards' },
      { name: 'E-', value: 1, rangeMin: 21, rangeMax: 40, description: 'Below standards' },
      { name: 'E', value: 3, rangeMin: 41, rangeMax: 70, description: 'Meets standards' },
      { name: 'E+', value: 4, rangeMin: 71, rangeMax: 90, description: 'Exceeds standards' },
      { name: 'E++', value: 5, rangeMin: 91, rangeMax: 100, description: 'Outstanding' }
    ],
    evaluationTargets: {
      objectiveScore: 21,
      competencyScore: 25
    },
    statusTypes: [
      { label: 'Not Started', value: 'not_started' },
      { label: 'In Progress', value: 'in_progress' },
      { label: 'Completed', value: 'completed' }
    ]
  });

  const departments = ['HR', 'IT', 'Sales', 'Finance', 'Operations'];
  const positionGroups = ['Executive', 'Manager', 'Specialist', 'Officer'];

  const employees = [
  
    { 
      id: 2, 
      name: 'Əhmədov Rəşad Məmməd oğlu', 
      position: 'Software Developer',
      positionGroup: 'Specialist',
      manager: 'İsmayılov Fərid Kamil oğlu', 
      department: 'IT', 
      badge: 'ASL1913'
    },
    { 
      id: 3, 
      name: 'Məmmədova Günəl Ramiz qızı', 
      position: 'Sales Manager',
      positionGroup: 'Manager',
      manager: 'Həsənov Elçin Tərlan oğlu', 
      department: 'Sales', 
      badge: 'ASL1914'
    }
  ];

  const coreCompetencies = [
    { group: 'Leadership', items: ['Strategic Thinking', 'Decision Making', 'Team Leadership'] },
    { group: 'Professional', items: ['Result Orientation', 'Customer Focus', 'Innovation'] },
    { group: 'Personal', items: ['Integrity', 'Collaboration', 'Continuous Learning'] }
  ];

  const [performanceData, setPerformanceData] = useState({});

  const initializePerformanceData = (employeeId, year) => {
    const key = `${employeeId}_${year}`;
    if (!performanceData[key]) {
      setPerformanceData(prev => ({
        ...prev,
        [key]: {
          year,
          employeeId,
          objectives: [],
          competencies: coreCompetencies.flatMap(group => 
            group.items.map(item => ({
              group: group.group,
              name: item,
              endYearRating: '',
              score: 0
            }))
          ),
          developmentNeeds: [],
          reviews: {
            midYear: { employeeComment: '', managerComment: '' },
            endYear: { employeeComment: '', managerComment: '' }
          }
        }
      }));
    }
  };

  const showNotif = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const calculateTotalWeight = (objectives) => {
    return objectives.reduce((sum, obj) => sum + (parseFloat(obj.weight) || 0), 0);
  };

  const calculateDeptObjectivesWeight = (objectives) => {
    return objectives.reduce((sum, obj) => sum + (parseFloat(obj.weight) || 0), 0);
  };

  const canAddObjective = (objectives) => {
    const totalWeight = calculateTotalWeight(objectives);
    return objectives.length < settings.goalLimits.max && totalWeight < 100;
  };

  const calculateObjectiveScore = (objectives) => {
    return objectives.reduce((sum, obj) => {
      if (obj.endYearRating && obj.weight) {
        const rating = settings.evaluationScale.find(s => s.name === obj.endYearRating);
        return sum + ((rating?.value || 0) * (obj.weight / 100) * settings.evaluationTargets.objectiveScore / 5);
      }
      return sum;
    }, 0);
  };

  const calculateCompetencyScore = (competencies) => {
    return competencies.reduce((sum, comp) => {
      if (comp.endYearRating) {
        const rating = settings.evaluationScale.find(s => s.name === comp.endYearRating);
        return sum + (rating?.value || 0);
      }
      return sum;
    }, 0);
  };

  const calculateFinalScores = (data, employee) => {
    const objectivesScore = calculateObjectiveScore(data.objectives);
    const competenciesScore = calculateCompetencyScore(data.competencies);
    
    const objectivesPercentage = (objectivesScore / settings.evaluationTargets.objectiveScore) * 100;
    const competenciesPercentage = (competenciesScore / settings.evaluationTargets.competencyScore) * 100;
    
    const weightConfig = settings.performanceWeights.find(w => w.positionGroup === employee.positionGroup);
    const objectivesWeight = weightConfig?.objectivesWeight || 70;
    const competenciesWeight = weightConfig?.competenciesWeight || 30;
    
    const overallWeightedPercentage = 
      (objectivesPercentage * objectivesWeight / 100) + 
      (competenciesPercentage * competenciesWeight / 100);
    
    const finalRating = settings.evaluationScale.find(
      scale => overallWeightedPercentage >= scale.rangeMin && overallWeightedPercentage <= scale.rangeMax
    );
    
    return {
      objectivesScore: objectivesScore.toFixed(2),
      objectivesPercentage: objectivesPercentage.toFixed(2),
      competenciesScore: competenciesScore.toFixed(2),
      competenciesPercentage: competenciesPercentage.toFixed(2),
      overallWeightedPercentage: overallWeightedPercentage.toFixed(2),
      finalRating: finalRating?.name || 'N/A'
    };
  };

  const getCurrentPeriod = () => {
    const today = new Date();
    const currentDate = today.toISOString().split('T')[0];
    
    if (currentDate >= settings.goalSetting.employeeStart && currentDate <= settings.goalSetting.managerEnd) {
      return 'goal_setting';
    } else if (currentDate >= settings.midYearReview.start && currentDate <= settings.midYearReview.end) {
      return 'mid_year';
    } else if (currentDate >= settings.endYearReview.start && currentDate <= settings.endYearReview.end) {
      return 'end_year';
    }
    return 'closed';
  };

  const currentPeriod = getCurrentPeriod();

  // ==================== SETTINGS MODULE ====================
  const renderSettingsModule = () => (
    <div className="space-y-6">
      {/* 1. Date Ranges */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-5`}>
        <h3 className="text-sm font-semibold mb-4 pb-3 border-b text-almet-cloud-burst dark:text-almet-mystic">
          1. Performance Period Configuration
        </h3>
        
        <div className="space-y-5">
          <div>
            <h4 className="text-xs font-medium mb-3 text-almet-sapphire">Goal Setting Period</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400">Employee Start</label>
                <input
                  type="date"
                  value={settings.goalSetting.employeeStart}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    goalSetting: { ...prev.goalSetting, employeeStart: e.target.value }
                  }))}
                  className={`w-full px-3 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400">Employee End</label>
                <input
                  type="date"
                  value={settings.goalSetting.employeeEnd}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    goalSetting: { ...prev.goalSetting, employeeEnd: e.target.value }
                  }))}
                  className={`w-full px-3 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400">Manager Start</label>
                <input
                  type="date"
                  value={settings.goalSetting.managerStart}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    goalSetting: { ...prev.goalSetting, managerStart: e.target.value }
                  }))}
                  className={`w-full px-3 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400">Manager End</label>
                <input
                  type="date"
                  value={settings.goalSetting.managerEnd}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    goalSetting: { ...prev.goalSetting, managerEnd: e.target.value }
                  }))}
                  className={`w-full px-3 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-medium mb-3 text-almet-sapphire">Mid-Year Review</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400">Start Date</label>
                <input
                  type="date"
                  value={settings.midYearReview.start}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    midYearReview: { ...prev.midYearReview, start: e.target.value }
                  }))}
                  className={`w-full px-3 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400">End Date</label>
                <input
                  type="date"
                  value={settings.midYearReview.end}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    midYearReview: { ...prev.midYearReview, end: e.target.value }
                  }))}
                  className={`w-full px-3 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-medium mb-3 text-almet-sapphire">End-Year Review</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400">Start Date</label>
                <input
                  type="date"
                  value={settings.endYearReview.start}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    endYearReview: { ...prev.endYearReview, start: e.target.value }
                  }))}
                  className={`w-full px-3 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400">End Date</label>
                <input
                  type="date"
                  value={settings.endYearReview.end}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    endYearReview: { ...prev.endYearReview, end: e.target.value }
                  }))}
                  className={`w-full px-3 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => showNotif('Date ranges saved')}
            className="px-4 py-1.5 text-xs bg-almet-sapphire text-white rounded hover:bg-almet-astral transition-colors flex items-center"
          >
            <Save className="w-3 h-3 mr-1.5" />
            Save Dates
          </button>
        </div>
      </div>

      {/* 4. Performance Weighting */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-5`}>
        <h3 className="text-sm font-semibold mb-4 pb-3 border-b text-almet-cloud-burst dark:text-almet-mystic">
          4. Performance Weighting
        </h3>
        
        <div className="space-y-3">
          {settings.performanceWeights.map((weight, index) => (
            <div key={index} className={`grid grid-cols-1 md:grid-cols-4 gap-3 p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div>
                <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400">Position Group</label>
                <select
                  value={weight.positionGroup}
                  onChange={(e) => {
                    const newWeights = [...settings.performanceWeights];
                    newWeights[index].positionGroup = e.target.value;
                    setSettings(prev => ({ ...prev, performanceWeights: newWeights }));
                  }}
                  className={`w-full px-2 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                >
                  {positionGroups.map(pg => (
                    <option key={pg} value={pg}>{pg}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400">Objectives %</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={weight.objectivesWeight}
                  onChange={(e) => {
                    const newWeights = [...settings.performanceWeights];
                    const objWeight = parseInt(e.target.value) || 0;
                    newWeights[index].objectivesWeight = objWeight;
                    newWeights[index].competenciesWeight = 100 - objWeight;
                    setSettings(prev => ({ ...prev, performanceWeights: newWeights }));
                  }}
                  className={`w-full px-2 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400">Competencies %</label>
                <input
                  type="number"
                  value={weight.competenciesWeight}
                  readOnly
                  className={`w-full px-2 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-100 border-gray-300'}`}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    const newWeights = settings.performanceWeights.filter((_, i) => i !== index);
                    setSettings(prev => ({ ...prev, performanceWeights: newWeights }));
                  }}
                  className="px-2 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
          
          <button
            onClick={() => {
              setSettings(prev => ({
                ...prev,
                performanceWeights: [...prev.performanceWeights, { positionGroup: positionGroups[0], objectivesWeight: 70, competenciesWeight: 30 }]
              }));
            }}
            className="px-3 py-1.5 text-xs bg-almet-comet text-white rounded hover:bg-almet-waterloo transition-colors flex items-center"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Group
          </button>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => showNotif('Weights saved')}
            className="px-4 py-1.5 text-xs bg-almet-sapphire text-white rounded hover:bg-almet-astral transition-colors flex items-center"
          >
            <Save className="w-3 h-3 mr-1.5" />
            Save Weights
          </button>
        </div>
      </div>

      {/* 5. Goal Limits */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-5`}>
        <h3 className="text-sm font-semibold mb-4 pb-3 border-b text-almet-cloud-burst dark:text-almet-mystic">
          5. Goal Limits
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400">Minimum</label>
            <input
              type="number"
              min="1"
              value={settings.goalLimits.min}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                goalLimits: { ...prev.goalLimits, min: parseInt(e.target.value) || 1 }
              }))}
              className={`w-full px-3 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div>
            <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400">Maximum</label>
            <input
              type="number"
              min="1"
              value={settings.goalLimits.max}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                goalLimits: { ...prev.goalLimits, max: parseInt(e.target.value) || 10 }
              }))}
              className={`w-full px-3 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => showNotif('Limits saved')}
            className="px-4 py-1.5 text-xs bg-almet-sapphire text-white rounded hover:bg-almet-astral transition-colors flex items-center"
          >
            <Save className="w-3 h-3 mr-1.5" />
            Save Limits
          </button>
        </div>
      </div>

      {/* 7. Department Objectives WITH WEIGHT */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-5`}>
        <h3 className="text-sm font-semibold mb-4 pb-3 border-b text-almet-cloud-burst dark:text-almet-mystic">
          7. Department Objectives
        </h3>
        
        <div className="space-y-5">
          {settings.departmentObjectives.map((dept, deptIndex) => {
            const deptTotalWeight = calculateDeptObjectivesWeight(dept.objectives);
            
            return (
              <div key={deptIndex} className={`p-4 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-3">
                  <select
                    value={dept.department}
                    onChange={(e) => {
                      const newDepts = [...settings.departmentObjectives];
                      newDepts[deptIndex].department = e.target.value;
                      setSettings(prev => ({ ...prev, departmentObjectives: newDepts }));
                    }}
                    className={`flex-1 px-3 py-1.5 text-xs border rounded font-medium ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                  >
                    {departments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                  <span className={`ml-3 px-2 py-1 text-xs rounded ${deptTotalWeight === 100 ? 'bg-green-100 text-green-700' : deptTotalWeight > 100 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {deptTotalWeight}%
                  </span>
                  <button
                    onClick={() => {
                      const newDepts = settings.departmentObjectives.filter((_, i) => i !== deptIndex);
                      setSettings(prev => ({ ...prev, departmentObjectives: newDepts }));
                    }}
                    className="ml-2 px-2 py-1.5 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="space-y-2">
                  {dept.objectives.map((obj, objIndex) => (
                    <div key={objIndex} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={obj.title}
                        onChange={(e) => {
                          const newDepts = [...settings.departmentObjectives];
                          newDepts[deptIndex].objectives[objIndex].title = e.target.value;
                          setSettings(prev => ({ ...prev, departmentObjectives: newDepts }));
                        }}
                        placeholder="Objective title"
                        className={`flex-1 px-2 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                      />
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={obj.weight}
                        onChange={(e) => {
                          const newDepts = [...settings.departmentObjectives];
                          newDepts[deptIndex].objectives[objIndex].weight = parseInt(e.target.value) || 0;
                          setSettings(prev => ({ ...prev, departmentObjectives: newDepts }));
                        }}
                        placeholder="%"
                        className={`w-16 px-2 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                      />
                      <button
                        onClick={() => {
                          const newDepts = [...settings.departmentObjectives];
                          newDepts[deptIndex].objectives.splice(objIndex, 1);
                          setSettings(prev => ({ ...prev, departmentObjectives: newDepts }));
                        }}
                        className="px-2 py-1.5 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        <XCircle className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  
                  <button
                    onClick={() => {
                      const newDepts = [...settings.departmentObjectives];
                      newDepts[deptIndex].objectives.push({ title: '', weight: 0 });
                      setSettings(prev => ({ ...prev, departmentObjectives: newDepts }));
                    }}
                    className="px-2 py-1.5 text-xs bg-almet-comet text-white rounded hover:bg-almet-waterloo flex items-center"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Objective
                  </button>
                </div>
              </div>
            );
          })}
          
          <button
            onClick={() => {
              setSettings(prev => ({
                ...prev,
                departmentObjectives: [...prev.departmentObjectives, { department: departments[0], objectives: [{ title: '', weight: 0 }] }]
              }));
            }}
            className="px-3 py-1.5 text-xs bg-almet-comet text-white rounded hover:bg-almet-waterloo flex items-center"
          >
            <Plus className="w-3 h-3 mr-1" />
            Add Department
          </button>
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => showNotif('Department objectives saved')}
            className="px-4 py-1.5 text-xs bg-almet-sapphire text-white rounded hover:bg-almet-astral transition-colors flex items-center"
          >
            <Save className="w-3 h-3 mr-1.5" />
            Save Departments
          </button>
        </div>
      </div>

      {/* 8. Evaluation Scale */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-5`}>
        <h3 className="text-sm font-semibold mb-4 pb-3 border-b text-almet-cloud-burst dark:text-almet-mystic">
          8. Evaluation Scale
        </h3>
        
        <div className="space-y-2">
          {settings.evaluationScale.map((scale, index) => (
            <div key={index} className={`grid grid-cols-5 gap-2 p-2 rounded text-xs ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <input
                type="text"
                value={scale.name}
                onChange={(e) => {
                  const newScale = [...settings.evaluationScale];
                  newScale[index].name = e.target.value;
                  setSettings(prev => ({ ...prev, evaluationScale: newScale }));
                }}
                placeholder="Name"
                className={`px-2 py-1 border rounded ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
              />
              <input
                type="number"
                value={scale.value}
                onChange={(e) => {
                  const newScale = [...settings.evaluationScale];
                  newScale[index].value = parseInt(e.target.value) || 0;
                  setSettings(prev => ({ ...prev, evaluationScale: newScale }));
                }}
                placeholder="Value"
                className={`px-2 py-1 border rounded ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
              />
              <input
                type="number"
                value={scale.rangeMin}
                onChange={(e) => {
                  const newScale = [...settings.evaluationScale];
                  newScale[index].rangeMin = parseInt(e.target.value) || 0;
                  setSettings(prev => ({ ...prev, evaluationScale: newScale }));
                }}
                placeholder="Min%"
                className={`px-2 py-1 border rounded ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
              />
              <input
                type="number"
                value={scale.rangeMax}
                onChange={(e) => {
                  const newScale = [...settings.evaluationScale];
                  newScale[index].rangeMax = parseInt(e.target.value) || 0;
                  setSettings(prev => ({ ...prev, evaluationScale: newScale }));
                }}
                placeholder="Max%"
                className={`px-2 py-1 border rounded ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
              />
              <input
                type="text"
                value={scale.description}
                onChange={(e) => {
                  const newScale = [...settings.evaluationScale];
                  newScale[index].description = e.target.value;
                  setSettings(prev => ({ ...prev, evaluationScale: newScale }));
                }}
                placeholder="Description"
                className={`px-2 py-1 border rounded ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          ))}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => showNotif('Scale saved')}
            className="px-4 py-1.5 text-xs bg-almet-sapphire text-white rounded hover:bg-almet-astral transition-colors flex items-center"
          >
            <Save className="w-3 h-3 mr-1.5" />
            Save Scale
          </button>
        </div>
      </div>

      {/* 9 & 10 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-5`}>
          <h3 className="text-sm font-semibold mb-4 pb-3 border-b text-almet-cloud-burst dark:text-almet-mystic">
            9. Evaluation Targets
          </h3>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400">Objective Score</label>
              <input
                type="number"
                value={settings.evaluationTargets.objectiveScore}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  evaluationTargets: { ...prev.evaluationTargets, objectiveScore: parseInt(e.target.value) || 0 }
                }))}
                className={`w-full px-3 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div>
              <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400">Competency Score</label>
              <input
                type="number"
                value={settings.evaluationTargets.competencyScore}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  evaluationTargets: { ...prev.evaluationTargets, competencyScore: parseInt(e.target.value) || 0 }
                }))}
                className={`w-full px-3 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => showNotif('Targets saved')}
              className="px-4 py-1.5 text-xs bg-almet-sapphire text-white rounded hover:bg-almet-astral transition-colors flex items-center"
            >
              <Save className="w-3 h-3 mr-1.5" />
              Save
            </button>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-5`}>
          <h3 className="text-sm font-semibold mb-4 pb-3 border-b text-almet-cloud-burst dark:text-almet-mystic">
            10. Status Types
          </h3>
          
          <div className="space-y-2">
            {settings.statusTypes.map((status, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="text"
                  value={status.label}
                  onChange={(e) => {
                    const newStatuses = [...settings.statusTypes];
                    newStatuses[index].label = e.target.value;
                    newStatuses[index].value = e.target.value.toLowerCase().replace(/\s+/g, '_');
                    setSettings(prev => ({ ...prev, statusTypes: newStatuses }));
                  }}
                  placeholder="Status"
                  className={`flex-1 px-2 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                />
                <button
                  onClick={() => {
                    const newStatuses = settings.statusTypes.filter((_, i) => i !== index);
                    setSettings(prev => ({ ...prev, statusTypes: newStatuses }));
                  }}
                  className="px-2 py-1.5 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
            
            <button
              onClick={() => {
                setSettings(prev => ({
                  ...prev,
                  statusTypes: [...prev.statusTypes, { label: '', value: '' }]
                }));
              }}
              className="px-2 py-1.5 text-xs bg-almet-comet text-white rounded hover:bg-almet-waterloo flex items-center w-full justify-center"
            >
              <Plus className="w-3 h-3 mr-1" />
              Add Status
            </button>
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={() => showNotif('Statuses saved')}
              className="px-4 py-1.5 text-xs bg-almet-sapphire text-white rounded hover:bg-almet-astral transition-colors flex items-center"
            >
              <Save className="w-3 h-3 mr-1.5" />
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ==================== DASHBOARD ====================
  const renderDashboardModule = () => (
    <div className="space-y-5">
      <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral rounded-lg p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold mb-1">Performance {selectedYear}</h2>
            <p className="text-xs opacity-90">
              Period: <span className="font-medium">
                {currentPeriod === 'goal_setting' && 'Goal Setting'}
                {currentPeriod === 'mid_year' && 'Mid-Year Review'}
                {currentPeriod === 'end_year' && 'End-Year Review'}
                {currentPeriod === 'closed' && 'Closed'}
              </span>
            </p>
          </div>
          <Calendar className="w-12 h-12 opacity-50" />
        </div>
      </div>

      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-5`}>
        <h3 className="text-sm font-semibold mb-4 text-almet-cloud-burst dark:text-almet-mystic">Timeline</h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className={`w-3 h-3 rounded-full mt-0.5 ${currentPeriod === 'goal_setting' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className="flex-1">
              <h4 className="text-xs font-medium">Goal Setting</h4>
              <p className="text-xs text-gray-500">{settings.goalSetting.employeeStart} - {settings.goalSetting.managerEnd}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className={`w-3 h-3 rounded-full mt-0.5 ${currentPeriod === 'mid_year' ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
            <div className="flex-1">
              <h4 className="text-xs font-medium">Mid-Year Review</h4>
              <p className="text-xs text-gray-500">{settings.midYearReview.start} - {settings.midYearReview.end}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className={`w-3 h-3 rounded-full mt-0.5 ${currentPeriod === 'end_year' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            <div className="flex-1">
              <h4 className="text-xs font-medium">End-Year Review</h4>
              <p className="text-xs text-gray-500">{settings.endYearReview.start} - {settings.endYearReview.end}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
          <div className="flex items-center justify-between mb-3">
            <Target className="w-6 h-6 text-almet-sapphire" />
            <span className="text-lg font-bold text-almet-sapphire">0/{employees.length}</span>
          </div>
          <h3 className="text-xs font-medium mb-2">Objectives</h3>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-almet-sapphire h-1.5 rounded-full" style={{width: '0%'}}></div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
          <div className="flex items-center justify-between mb-3">
            <FileText className="w-6 h-6 text-almet-steel-blue" />
            <span className="text-lg font-bold text-almet-steel-blue">0/{employees.length}</span>
          </div>
          <h3 className="text-xs font-medium mb-2">Mid-Year</h3>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-almet-steel-blue h-1.5 rounded-full" style={{width: '0%'}}></div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
          <div className="flex items-center justify-between mb-3">
            <Award className="w-6 h-6 text-almet-astral" />
            <span className="text-lg font-bold text-almet-astral">0/{employees.length}</span>
          </div>
          <h3 className="text-xs font-medium mb-2">End-Year</h3>
          <div className="w-full bg-gray-200 rounded-full h-1.5">
            <div className="bg-almet-astral h-1.5 rounded-full" style={{width: '0%'}}></div>
          </div>
        </div>
      </div>

      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-5`}>
        <h3 className="text-sm font-semibold mb-4 text-almet-cloud-burst dark:text-almet-mystic">My Team</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {employees.map(employee => {
            const key = `${employee.id}_${selectedYear}`;
            const data = performanceData[key];
            
            return (
              <div
                key={employee.id}
                onClick={() => {
                  setSelectedEmployee(employee);
                  initializePerformanceData(employee.id, selectedYear);
                  setActiveModule('execute');
                }}
                className={`p-3 rounded-lg border ${darkMode ? 'border-gray-700 hover:border-almet-sapphire' : 'border-gray-200 hover:border-almet-sapphire'} cursor-pointer transition-all`}
              >
                <div className="flex items-center mb-2">
                  <div className="w-8 h-8 rounded-full bg-almet-sapphire text-white flex items-center justify-center text-xs font-medium mr-2">
                    {employee.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium truncate">{employee.name}</h4>
                    <p className="text-xs text-gray-500 truncate">{employee.position}</p>
                  </div>
                </div>
                
                <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                  <div className="flex justify-between">
                    <span>Goals:</span>
                    <span className={data ? 'text-green-600' : 'text-gray-400'}>
                      {data ? '✓' : '○'}
                    </span>
                  </div>
                </div>
                
                <button className="w-full px-3 py-1.5 bg-almet-sapphire text-white rounded hover:bg-almet-astral text-xs">
                  View
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ==================== EXECUTE ====================
  const renderExecuteModule = () => {
    if (!selectedEmployee) {
      return (
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-8 text-center`}>
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <h3 className="text-sm font-semibold mb-2 text-gray-600">Select Employee</h3>
          
          <div className="max-w-md mx-auto space-y-2 mt-4">
            {employees.map(employee => (
              <button
                key={employee.id}
                onClick={() => {
                  setSelectedEmployee(employee);
                  initializePerformanceData(employee.id, selectedYear);
                }}
                className={`w-full p-3 rounded-lg border ${darkMode ? 'border-gray-700 hover:border-almet-sapphire' : 'border-gray-200 hover:border-almet-sapphire'} transition-all text-left`}
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-almet-sapphire text-white flex items-center justify-center text-xs font-medium mr-3">
                    {employee.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-medium">{employee.name}</h4>
                    <p className="text-xs text-gray-500">{employee.position}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }

    const key = `${selectedEmployee.id}_${selectedYear}`;
    const data = performanceData[key] || {};
    const objectives = data.objectives || [];
    const competencies = data.competencies || [];
    const developmentNeeds = data.developmentNeeds || [];
    const reviews = data.reviews || { midYear: {}, endYear: {} };
    
    const totalWeight = calculateTotalWeight(objectives);
    const deptObjectives = settings.departmentObjectives.find(d => d.department === selectedEmployee.department)?.objectives || [];

    return (
      <div className="space-y-5">
        {/* Header */}
        <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-white text-almet-sapphire flex items-center justify-center text-sm font-bold mr-3">
                {selectedEmployee.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-sm font-semibold">{selectedEmployee.name}</h2>
                <p className="text-xs opacity-90">{selectedEmployee.position}</p>
                <p className="text-xs opacity-75">{selectedEmployee.department} • {selectedEmployee.badge}</p>
              </div>
            </div>
            <div className="text-right text-xs">
              <div className="opacity-75">Manager</div>
              <div className="font-medium">{selectedEmployee.manager}</div>
            </div>
          </div>
        </div>

        {/* Scale Reference */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border`}>
          <button
            onClick={() => {
              const elem = document.getElementById('scale');
              elem.classList.toggle('hidden');
            }}
            className={`w-full p-3 flex items-center justify-between text-left ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
          >
            <div className="flex items-center">
              <Star className="w-4 h-4 mr-2 text-almet-sapphire" />
              <h3 className="text-xs font-medium">Evaluation Scale</h3>
            </div>
            <ChevronDown className="w-4 h-4" />
          </button>
          
          <div id="scale" className="hidden p-3 border-t">
            <div className="grid grid-cols-5 gap-2">
              {settings.evaluationScale.map((scale, index) => (
                <div key={index} className={`p-2 rounded text-center ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="text-sm font-bold text-almet-sapphire">{scale.name}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Val: {scale.value}</div>
                  <div className="text-xs text-gray-500">{scale.rangeMin}-{scale.rangeMax}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Objectives */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-mystic">Employee Objectives</h3>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${totalWeight === 100 ? 'bg-green-100 text-green-700' : totalWeight > 100 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {totalWeight}%
              </span>
              <button
                onClick={() => {
                  if (!canAddObjective(objectives)) {
                    showNotif('Cannot add more', 'error');
                    return;
                  }
                  const newObjectives = [...objectives, {
                    id: Date.now(),
                    title: '',
                    description: '',
                    linkedDepartmentObjective: '',
                    weight: 0,
                    endYearRating: '',
                    score: 0,
                    progress: 0,
                    status: 'not_started'
                  }];
                  
                  setPerformanceData(prev => ({
                    ...prev,
                    [key]: { ...prev[key], objectives: newObjectives }
                  }));
                }}
                disabled={!canAddObjective(objectives)}
                className="px-2 py-1 bg-almet-sapphire text-white rounded hover:bg-almet-astral text-xs disabled:opacity-50 flex items-center"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {objectives.map((objective, index) => (
              <div key={objective.id} className={`p-3 border rounded ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                  <div>
                    <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Title</label>
                    <input
                      type="text"
                      value={objective.title}
                      onChange={(e) => {
                        const newObjectives = [...objectives];
                        newObjectives[index].title = e.target.value;
                        setPerformanceData(prev => ({
                          ...prev,
                          [key]: { ...prev[key], objectives: newObjectives }
                        }));
                      }}
                      className={`w-full px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      placeholder="Objective title"
                    />
                  </div>

                  <div>
                    <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Department Objective</label>
                    <select
                      value={objective.linkedDepartmentObjective}
                      onChange={(e) => {
                        const newObjectives = [...objectives];
                        newObjectives[index].linkedDepartmentObjective = e.target.value;
                        setPerformanceData(prev => ({
                          ...prev,
                          [key]: { ...prev[key], objectives: newObjectives }
                        }));
                      }}
                      className={`w-full px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="">Select</option>
                      {deptObjectives.map((deptObj, i) => (
                        <option key={i} value={deptObj.title}>{deptObj.title}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-2">
                  <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Description</label>
                  <textarea
                    value={objective.description}
                    onChange={(e) => {
                      const newObjectives = [...objectives];
                      newObjectives[index].description = e.target.value;
                      setPerformanceData(prev => ({
                        ...prev,
                        [key]: { ...prev[key], objectives: newObjectives }
                      }));
                    }}
                    rows={2}
                    className={`w-full px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder="Description"
                  />
                </div>

                <div className="grid grid-cols-5 gap-2 mb-2">
                  <div>
                    <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Weight %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={objective.weight}
                      onChange={(e) => {
                        const newWeight = parseFloat(e.target.value) || 0;
                        if (newWeight + totalWeight - objective.weight <= 100) {
                          const newObjectives = [...objectives];
                          newObjectives[index].weight = newWeight;
                          setPerformanceData(prev => ({
                            ...prev,
                            [key]: { ...prev[key], objectives: newObjectives }
                          }));
                        } else {
                          showNotif('Total cannot exceed 100%', 'error');
                        }
                      }}
                      className={`w-full px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Rating</label>
                    <select
                      value={objective.endYearRating}
                      onChange={(e) => {
                        const rating = settings.evaluationScale.find(s => s.name === e.target.value);
                        const newObjectives = [...objectives];
                        newObjectives[index].endYearRating = e.target.value;
                        newObjectives[index].score = rating ? (rating.value * (objective.weight / 100) * settings.evaluationTargets.objectiveScore / 5) : 0;
                        setPerformanceData(prev => ({
                          ...prev,
                          [key]: { ...prev[key], objectives: newObjectives }
                        }));
                      }}
                      disabled={currentPeriod !== 'end_year' && currentPeriod !== 'closed'}
                      className={`w-full px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} disabled:opacity-50`}
                    >
                      <option value="">--</option>
                      {settings.evaluationScale.map(scale => (
                        <option key={scale.name} value={scale.name}>{scale.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Score</label>
                    <input
                      type="text"
                      value={objective.score.toFixed(2)}
                      readOnly
                      className={`w-full px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-100 border-gray-300'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Progress %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={objective.progress}
                      onChange={(e) => {
                        const newObjectives = [...objectives];
                        newObjectives[index].progress = parseInt(e.target.value) || 0;
                        setPerformanceData(prev => ({
                          ...prev,
                          [key]: { ...prev[key], objectives: newObjectives }
                        }));
                      }}
                      className={`w-full px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Status</label>
                    <select
                      value={objective.status}
                      onChange={(e) => {
                        const newObjectives = [...objectives];
                        newObjectives[index].status = e.target.value;
                        setPerformanceData(prev => ({
                          ...prev,
                          [key]: { ...prev[key], objectives: newObjectives }
                        }));
                      }}
                      className={`w-full px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      {settings.statusTypes.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      const newObjectives = objectives.filter((_, i) => i !== index);
                      setPerformanceData(prev => ({
                        ...prev,
                        [key]: { ...prev[key], objectives: newObjectives }
                      }));
                    }}
                    className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}

            {objectives.length === 0 && (
              <div className="text-center py-6 text-gray-500 text-xs">
                No objectives. Click "Add" to create.
              </div>
            )}
          </div>

          {objectives.length > 0 && (
            <div className={`mt-3 p-3 rounded ${darkMode ? 'bg-blue-900/20 border-almet-sapphire' : 'bg-blue-50 border-blue-200'} border`}>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-medium">Objectives Score</h4>
                <div className="text-right">
                  <div className="text-sm font-bold text-almet-sapphire">
                    {calculateObjectiveScore(objectives).toFixed(2)} / {settings.evaluationTargets.objectiveScore}
                  </div>
                  <div className="text-xs text-gray-600">
                    {((calculateObjectiveScore(objectives) / settings.evaluationTargets.objectiveScore) * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => showNotif('Saved as draft')}
              className="px-3 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center"
            >
              <Save className="w-3 h-3 mr-1" />
              Save Draft
            </button>
            
            <button
              onClick={() => {
                if (objectives.length < settings.goalLimits.min) {
                  showNotif(`Min ${settings.goalLimits.min} required`, 'error');
                  return;
                }
                if (totalWeight !== 100) {
                  showNotif('Total must be 100%', 'error');
                  return;
                }
                showNotif('Submitted for approval');
              }}
              disabled={objectives.length < settings.goalLimits.min || totalWeight !== 100}
              className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center"
            >
              <Send className="w-3 h-3 mr-1" />
              Submit
            </button>
          </div>
        </div>

        {/* Competencies */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
          <h3 className="text-sm font-semibold mb-3 text-almet-cloud-burst dark:text-almet-mystic">Core Competencies</h3>

          <div className="space-y-4">
            {coreCompetencies.map((group, groupIndex) => (
              <div key={groupIndex}>
                <h4 className="text-xs font-medium mb-2 text-almet-sapphire">{group.group}</h4>
                <div className="space-y-2">
                  {competencies.filter(c => c.group === group.group).map((comp, index) => {
                    const actualIndex = competencies.findIndex(c => c.name === comp.name && c.group === comp.group);
                    
                    return (
                      <div key={index} className={`grid grid-cols-3 gap-2 p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div>
                          <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Competency</label>
                          <input
                            type="text"
                            value={comp.name}
                            readOnly
                            className={`w-full px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-100 border-gray-300'}`}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Rating</label>
                          <select
                            value={comp.endYearRating}
                            onChange={(e) => {
                              const rating = settings.evaluationScale.find(s => s.name === e.target.value);
                              const newCompetencies = [...competencies];
                              newCompetencies[actualIndex].endYearRating = e.target.value;
                              newCompetencies[actualIndex].score = rating?.value || 0;
                              setPerformanceData(prev => ({
                                ...prev,
                                [key]: { ...prev[key], competencies: newCompetencies }
                              }));

                              if (rating && (rating.name === 'E--' || rating.name === 'E-')) {
                                const existingDevNeed = developmentNeeds.find(d => d.competencyGap === comp.name);
                                if (!existingDevNeed) {
                                  const newDevNeeds = [...developmentNeeds, {
                                    competencyGap: comp.name,
                                    developmentActivity: '',
                                    progress: 0,
                                    comment: ''
                                  }];
                                  setPerformanceData(prev => ({
                                    ...prev,
                                    [key]: { ...prev[key], developmentNeeds: newDevNeeds }
                                  }));
                                }
                              }
                            }}
                            disabled={currentPeriod !== 'end_year' && currentPeriod !== 'closed'}
                            className={`w-full px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} disabled:opacity-50`}
                          >
                            <option value="">--</option>
                            {settings.evaluationScale.map(scale => (
                              <option key={scale.name} value={scale.name}>{scale.name}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Score</label>
                          <input
                            type="text"
                            value={comp.score}
                            readOnly
                            className={`w-full px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-100 border-gray-300'}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className={`mt-3 p-3 rounded ${darkMode ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-medium">Competencies Score</h4>
              <div className="text-right">
                <div className="text-sm font-bold text-purple-600">
                  {calculateCompetencyScore(competencies).toFixed(2)} / {settings.evaluationTargets.competencyScore}
                </div>
                <div className="text-xs text-gray-600">
                  {((calculateCompetencyScore(competencies) / settings.evaluationTargets.competencyScore) * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex gap-2">
            <button
              onClick={() => showNotif('Competencies saved')}
              className="px-3 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center"
            >
              <Save className="w-3 h-3 mr-1" />
              Save Draft
            </button>
            
            <button
              onClick={() => showNotif('Submitted')}
              className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 flex items-center"
            >
              <Send className="w-3 h-3 mr-1" />
              Submit
            </button>
          </div>
        </div>

        {/* Reviews */}
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
          <h3 className="text-sm font-semibold mb-3 text-almet-cloud-burst dark:text-almet-mystic">Performance Reviews</h3>

          <div className="mb-4">
            <h4 className="text-xs font-medium mb-2 text-almet-sapphire">Mid-Year Review</h4>
            
            <div className="space-y-2">
              <div>
                <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Employee Comment</label>
                <textarea
                  value={reviews.midYear.employeeComment || ''}
                  onChange={(e) => {
                    setPerformanceData(prev => ({
                      ...prev,
                      [key]: {
                        ...prev[key],
                        reviews: {
                          ...prev[key].reviews,
                          midYear: { ...prev[key].reviews.midYear, employeeComment: e.target.value }
                        }
                      }
                    }));
                  }}
                  disabled={currentPeriod !== 'mid_year'}
                  rows={3}
                  className={`w-full px-2 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} disabled:opacity-50`}
                  placeholder="Employee writes first..."
                />
              </div>
              
              <div>
                <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Manager Comment</label>
                <textarea
                  value={reviews.midYear.managerComment || ''}
                  onChange={(e) => {
                    setPerformanceData(prev => ({
                      ...prev,
                      [key]: {
                        ...prev[key],
                        reviews: {
                          ...prev[key].reviews,
                          midYear: { ...prev[key].reviews.midYear, managerComment: e.target.value }
                        }
                      }
                    }));
                  }}
                  disabled={currentPeriod !== 'mid_year'}
                  rows={3}
                  className={`w-full px-2 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} disabled:opacity-50`}
                  placeholder="Manager responds..."
                />
              </div>
            </div>

            <div className="mt-2 flex gap-2">
              <button
                onClick={() => showNotif('Mid-year saved')}
                disabled={currentPeriod !== 'mid_year'}
                className="px-3 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 flex items-center"
              >
                <Save className="w-3 h-3 mr-1" />
                Save
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-medium mb-2 text-almet-sapphire">End-Year Review</h4>
            
            <div className="space-y-2">
              <div>
                <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Employee Comment</label>
                <textarea
                  value={reviews.endYear.employeeComment || ''}
                  onChange={(e) => {
                    setPerformanceData(prev => ({
                      ...prev,
                      [key]: {
                        ...prev[key],
                        reviews: {
                          ...prev[key].reviews,
                          endYear: { ...prev[key].reviews.endYear, employeeComment: e.target.value }
                        }
                      }
                    }));
                  }}
                  disabled={currentPeriod !== 'end_year'}
                  rows={3}
                  className={`w-full px-2 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} disabled:opacity-50`}
                  placeholder="Employee writes first..."
                />
              </div>
              
              <div>
                <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Manager Comment</label>
                <textarea
                  value={reviews.endYear.managerComment || ''}
                  onChange={(e) => {
                    setPerformanceData(prev => ({
                      ...prev,
                      [key]: {
                        ...prev[key],
                        reviews: {
                          ...prev[key].reviews,
                          endYear: { ...prev[key].reviews.endYear, managerComment: e.target.value }
                        }
                      }
                    }));
                  }}
                  disabled={currentPeriod !== 'end_year'}
                  rows={3}
                  className={`w-full px-2 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} disabled:opacity-50`}
                  placeholder="Manager responds..."
                />
              </div>
            </div>

            <div className="mt-2 flex gap-2">
              <button
                onClick={() => showNotif('End-year saved')}
                disabled={currentPeriod !== 'end_year'}
                className="px-3 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 flex items-center"
              >
                <Save className="w-3 h-3 mr-1" />
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Development Needs */}
        {developmentNeeds.length > 0 && (
          <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
            <h3 className="text-sm font-semibold mb-3 text-almet-cloud-burst dark:text-almet-mystic">Development Needs</h3>

            <div className="space-y-2">
              {developmentNeeds.map((need, index) => (
                <div key={index} className={`grid grid-cols-4 gap-2 p-2 rounded ${darkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border`}>
                  <div>
                    <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Gap</label>
                    <input
                      type="text"
                      value={need.competencyGap}
                      readOnly
                      className={`w-full px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-100 border-gray-300'}`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Activity</label>
                    <input
                      type="text"
                      value={need.developmentActivity}
                      onChange={(e) => {
                        const newNeeds = [...developmentNeeds];
                        newNeeds[index].developmentActivity = e.target.value;
                        setPerformanceData(prev => ({
                          ...prev,
                          [key]: { ...prev[key], developmentNeeds: newNeeds }
                        }));
                      }}
                      className={`w-full px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      placeholder="What to do"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Progress %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={need.progress}
                      onChange={(e) => {
                        const newNeeds = [...developmentNeeds];
                        newNeeds[index].progress = parseInt(e.target.value) || 0;
                        setPerformanceData(prev => ({
                          ...prev,
                          [key]: { ...prev[key], developmentNeeds: newNeeds }
                        }));
                      }}
                      className={`w-full px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Comment</label>
                    <input
                      type="text"
                      value={need.comment}
                      onChange={(e) => {
                        const newNeeds = [...developmentNeeds];
                        newNeeds[index].comment = e.target.value;
                        setPerformanceData(prev => ({
                          ...prev,
                          [key]: { ...prev[key], developmentNeeds: newNeeds }
                        }));
                      }}
                      className={`w-full px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      placeholder="Notes"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-3">
              <button
                onClick={() => showNotif('Development needs saved')}
                className="px-3 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center"
              >
                <Save className="w-3 h-3 mr-1" />
                Save
              </button>
            </div>
          </div>
        )}

        {/* Final Summary */}
        {objectives.length > 0 && competencies.some(c => c.endYearRating) && (
          <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral rounded-lg p-4 text-white">
            <h3 className="text-sm font-semibold mb-3 flex items-center">
              <Star className="w-4 h-4 mr-2" />
              Final Performance Summary
            </h3>
            
            {(() => {
              const finalScores = calculateFinalScores(data, selectedEmployee);
              const weightConfig = settings.performanceWeights.find(w => w.positionGroup === selectedEmployee.positionGroup);
              
              return (
                <div className="grid grid-cols-5 gap-2 text-xs">
                  <div className="bg-white bg-opacity-20 rounded p-2 text-center">
                    <div className="opacity-75 mb-1">Obj Score</div>
                    <div className="text-lg font-bold">{finalScores.objectivesScore}</div>
                    <div className="opacity-75">{finalScores.objectivesPercentage}%</div>
                  </div>
                  
                  <div className="bg-white bg-opacity-20 rounded p-2 text-center">
                    <div className="opacity-75 mb-1">Comp Score</div>
                    <div className="text-lg font-bold">{finalScores.competenciesScore}</div>
                    <div className="opacity-75">{finalScores.competenciesPercentage}%</div>
                  </div>
                  
                  <div className="bg-white bg-opacity-20 rounded p-2 text-center">
                    <div className="opacity-75 mb-1">Obj Weight</div>
                    <div className="text-lg font-bold">{weightConfig?.objectivesWeight || 70}%</div>
                  </div>
                  
                  <div className="bg-white bg-opacity-20 rounded p-2 text-center">
                    <div className="opacity-75 mb-1">Comp Weight</div>
                    <div className="text-lg font-bold">{weightConfig?.competenciesWeight || 30}%</div>
                  </div>
                  
                  <div className="bg-white bg-opacity-20 rounded p-2 text-center">
                    <div className="opacity-75 mb-1">Final</div>
                    <div className="text-xl font-bold">{finalScores.finalRating}</div>
                    <div className="opacity-75">{finalScores.overallWeightedPercentage}%</div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Back */}
        <div className="flex justify-center">
          <button
            onClick={() => {
              setSelectedEmployee(null);
              setActiveModule('dashboard');
            }}
            className="px-4 py-2 bg-almet-comet text-white rounded hover:bg-almet-waterloo text-xs"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  };

  // ==================== MAIN ====================
  return (
    <DashboardLayout>
      <div className={`min-h-screen p-4`}>
        <div className="mb-4">
          <h1 className="text-lg font-bold text-almet-cloud-burst dark:text-almet-mystic mb-1">
            Performance Management System
          </h1>
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Comprehensive performance evaluation
          </p>
        </div>

        <div className="mb-4 flex gap-2">
          <button
            onClick={() => setActiveModule('dashboard')}
            className={`px-4 py-2 rounded text-xs font-medium transition-colors ${
              activeModule === 'dashboard'
                ? 'bg-almet-sapphire text-white'
                : `${darkMode ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-white text-gray-700 border-gray-200'} border hover:bg-almet-mystic`
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-1" />
            Dashboard
          </button>
          
          <button
            onClick={() => setActiveModule('execute')}
            className={`px-4 py-2 rounded text-xs font-medium transition-colors ${
              activeModule === 'execute'
                ? 'bg-almet-sapphire text-white'
                : `${darkMode ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-white text-gray-700 border-gray-200'} border hover:bg-almet-mystic`
            }`}
          >
            <Target className="w-4 h-4 inline mr-1" />
            Execute
          </button>
          
          <button
            onClick={() => setActiveModule('settings')}
            className={`px-4 py-2 rounded text-xs font-medium transition-colors ${
              activeModule === 'settings'
                ? 'bg-almet-sapphire text-white'
                : `${darkMode ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-white text-gray-700 border-gray-200'} border hover:bg-almet-mystic`
            }`}
          >
            <Settings className="w-4 h-4 inline mr-1" />
            Settings
          </button>
        </div>

        {activeModule === 'dashboard' && renderDashboardModule()}
        {activeModule === 'execute' && renderExecuteModule()}
        {activeModule === 'settings' && renderSettingsModule()}

        {showNotification && (
          <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg ${
            notificationType === 'success' ? 'bg-green-600' :
            notificationType === 'error' ? 'bg-red-600' :
            'bg-blue-600'
          } text-white flex items-center gap-2 z-50 text-xs`}>
            {notificationType === 'success' && <CheckCircle className="w-4 h-4" />}
            {notificationType === 'error' && <XCircle className="w-4 h-4" />}
            {notificationType === 'info' && <AlertCircle className="w-4 h-4" />}
            <span>{notificationMessage}</span>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}



// "use client";
// import { useState, useEffect } from "react";
// import DashboardLayout from "@/components/layout/DashboardLayout";
// import { useTheme } from "@/components/common/ThemeProvider";
// import performanceApi from "@/services/performanceService";
// import competencyApi from "@/services/competencyApi";
// import { 
//   ChevronDown, Plus, Trash2, Users, Target, Award, BarChart3, Save, Settings, 
//   Calendar, FileText, TrendingUp, Star, AlertCircle, CheckCircle, XCircle, Send, 
//   Loader, Download, RefreshCw
// } from 'lucide-react';

// export default function PerformanceManagementSystem() {
//   const { darkMode } = useTheme();
  
//   // UI State
//   const [activeModule, setActiveModule] = useState('dashboard');
//   const [selectedYear, setSelectedYear] = useState(2025);
//   const [selectedEmployee, setSelectedEmployee] = useState(null);
//   const [selectedPerformanceId, setSelectedPerformanceId] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [showNotification, setShowNotification] = useState(false);
//   const [notificationMessage, setNotificationMessage] = useState('');
//   const [notificationType, setNotificationType] = useState('success');

//   // API Data State
//   const [activeYear, setActiveYear] = useState(null);
//   const [performanceYears, setPerformanceYears] = useState([]);
//   const [dashboardStats, setDashboardStats] = useState(null);
//   const [employees, setEmployees] = useState([]);
//   const [performanceData, setPerformanceData] = useState({});
//   const [coreCompetencies, setCoreCompetencies] = useState([]);
  
//   // Settings State
//   const [settings, setSettings] = useState({
//     goalSetting: {
//       employeeStart: '2025-01-01',
//       employeeEnd: '2025-01-31',
//       managerStart: '2025-01-01',
//       managerEnd: '2025-02-15'
//     },
//     midYearReview: {
//       start: '2025-06-01',
//       end: '2025-06-30'
//     },
//     endYearReview: {
//       start: '2025-11-01',
//       end: '2025-12-31'
//     },
//     performanceWeights: [],
//     goalLimits: { min: 3, max: 7 },
//     departmentObjectives: [],
//     evaluationScale: [],
//     evaluationTargets: { objectiveScore: 21, competencyScore: 25 },
//     statusTypes: []
//   });

//   // ==================== LIFECYCLE ====================
  
//   useEffect(() => {
//     loadInitialData();
//   }, []);

//   useEffect(() => {
//     if (selectedYear && activeYear) {
//       loadDashboardStats();
//     }
//   }, [selectedYear, activeYear]);

//   // ==================== DATA LOADING ====================
  
//   const loadInitialData = async () => {
//     setLoading(true);
//     try {
//       await Promise.all([
//         loadActiveYear(),
//         loadSettings(),
//         loadCompetencies()
//       ]);
//       await loadEmployees();
//     } catch (error) {
//       console.error('Error loading initial data:', error);
//       showNotif('Error loading data', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadActiveYear = async () => {
//     try {
//       const yearResponse = await performanceApi.years.getActiveYear();
//       setActiveYear(yearResponse.data);
//       setSelectedYear(yearResponse.data.year);
      
//       if (yearResponse.data) {
//         setSettings(prev => ({
//           ...prev,
//           goalSetting: {
//             employeeStart: yearResponse.data.goal_setting_employee_start,
//             employeeEnd: yearResponse.data.goal_setting_employee_end,
//             managerStart: yearResponse.data.goal_setting_manager_start,
//             managerEnd: yearResponse.data.goal_setting_manager_end
//           },
//           midYearReview: {
//             start: yearResponse.data.mid_year_review_start,
//             end: yearResponse.data.mid_year_review_end
//           },
//           endYearReview: {
//             start: yearResponse.data.end_year_review_start,
//             end: yearResponse.data.end_year_review_end
//           }
//         }));
//       }
      
//       const yearsResponse = await performanceApi.years.list();
//       setPerformanceYears(yearsResponse.data);
//     } catch (error) {
//       console.error('Error loading year:', error);
//     }
//   };

//   const loadSettings = async () => {
//     try {
//       const [weightsRes, limitsRes, deptObjRes, scalesRes, targetsRes, statusesRes] = await Promise.all([
//         performanceApi.weightConfigs.list(),
//         performanceApi.goalLimits.getActiveConfig(),
//         performanceApi.departmentObjectives.list(),
//         performanceApi.evaluationScales.list(),
//         performanceApi.evaluationTargets.getActiveConfig(),
//         performanceApi.objectiveStatuses.list()
//       ]);
      
//       setSettings(prev => ({
//         ...prev,
//         performanceWeights: weightsRes.data,
//         goalLimits: {
//           min: limitsRes.data.min_goals,
//           max: limitsRes.data.max_goals
//         },
//         departmentObjectives: deptObjRes.data,
//         evaluationScale: scalesRes.data,
//         evaluationTargets: {
//           objectiveScore: targetsRes.data.objective_score_target,
//           competencyScore: targetsRes.data.competency_score_target
//         },
//         statusTypes: statusesRes.data
//       }));
//     } catch (error) {
//       console.error('Error loading settings:', error);
//     }
//   };

//   const loadCompetencies = async () => {
//     try {
//       const groupsResponse = await competencyApi.skillGroups.getAll();
//       const formattedCompetencies = groupsResponse.data.map(group => ({
//         group: group.name,
//         items: group.skills || []
//       }));
//       setCoreCompetencies(formattedCompetencies);
//     } catch (error) {
//       console.error('Error loading competencies:', error);
//     }
//   };

//   const loadEmployees = async () => {
//     try {
//       // const response = await performanceApi.performances.list({ 
//       //   my_team: true,
//       //   year: selectedYear 
//       // });
//       const response = await employeeService.getEmployees({ page_size: 100 });
//       const uniqueEmployees = response.data.map(perf => ({
//         id: perf.employee,
//         employee_id: perf.employee_id,
//         name: perf.name,
//         position: perf.position_group_name,
//         department: perf.department_name,
//         performanceId: perf.id,
//         approval_status: perf.approval_status
//       }));
      
//       setEmployees(uniqueEmployees);
//     } catch (error) {
//       console.error('Error loading employees:', error);
//     }
//   };

//   const loadDashboardStats = async () => {
//     try {
//       const response = await performanceApi.dashboard.getStatistics(selectedYear);
//       setDashboardStats(response.data);
//     } catch (error) {
//       console.error('Error loading dashboard stats:', error);
//     }
//   };

//   const loadPerformanceData = async (employeeId, year) => {
//     const key = `${employeeId}_${year}`;
    
//     if (performanceData[key]) {
//       return;
//     }
    
//     setLoading(true);
//     try {
//       const response = await performanceApi.performances.list({
//         employee_id: employeeId,
//         year: year
//       });
      
//       if (response.data.length > 0) {
//         const performance = response.data[0];
//         const detailResponse = await performanceApi.performances.get(performance.id);
        
//         setPerformanceData(prev => ({
//           ...prev,
//           [key]: detailResponse.data
//         }));
        
//         setSelectedPerformanceId(performance.id);
//       } else {
//         const initResponse = await performanceApi.performances.initialize({
//           employee: employeeId,
//           performance_year: activeYear.id
//         });
        
//         setPerformanceData(prev => ({
//           ...prev,
//           [key]: initResponse.data
//         }));
        
//         setSelectedPerformanceId(initResponse.data.id);
//       }
//     } catch (error) {
//       console.error('Error loading performance data:', error);
//       showNotif('Error loading performance data', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ==================== OBJECTIVES OPERATIONS ====================
  
//   const handleSaveObjectivesDraft = async () => {
//     if (!selectedPerformanceId) return;
    
//     const key = `${selectedEmployee.id}_${selectedYear}`;
//     const data = performanceData[key];
    
//     setLoading(true);
//     try {
//       await performanceApi.performances.saveObjectivesDraft(selectedPerformanceId, {
//         objectives: data.objectives
//       });
//       showNotif('Objectives draft saved successfully');
//     } catch (error) {
//       console.error('Error saving objectives:', error);
//       showNotif('Error saving objectives', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmitObjectives = async () => {
//     if (!selectedPerformanceId) return;
    
//     const key = `${selectedEmployee.id}_${selectedYear}`;
//     const data = performanceData[key];
//     const objectives = data.objectives || [];
    
//     if (objectives.length < settings.goalLimits.min) {
//       showNotif(`Minimum ${settings.goalLimits.min} objectives required`, 'error');
//       return;
//     }
    
//     const totalWeight = calculateTotalWeight(objectives);
//     if (totalWeight !== 100) {
//       showNotif('Total weight must be 100%', 'error');
//       return;
//     }
    
//     setLoading(true);
//     try {
//       await performanceApi.performances.submitObjectives(selectedPerformanceId);
//       showNotif('Objectives submitted successfully');
//       await loadPerformanceData(selectedEmployee.id, selectedYear);
//     } catch (error) {
//       console.error('Error submitting objectives:', error);
//       showNotif(error.response?.data?.error || 'Error submitting objectives', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ==================== COMPETENCIES OPERATIONS ====================
  
//   const handleSaveCompetenciesDraft = async () => {
//     if (!selectedPerformanceId) return;
    
//     const key = `${selectedEmployee.id}_${selectedYear}`;
//     const data = performanceData[key];
    
//     setLoading(true);
//     try {
//       await performanceApi.performances.saveCompetenciesDraft(selectedPerformanceId, {
//         competencies: data.competency_ratings
//       });
//       showNotif('Competencies draft saved successfully');
//     } catch (error) {
//       console.error('Error saving competencies:', error);
//       showNotif('Error saving competencies', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmitCompetencies = async () => {
//     if (!selectedPerformanceId) return;
    
//     setLoading(true);
//     try {
//       await performanceApi.performances.submitCompetencies(selectedPerformanceId);
//       showNotif('Competencies submitted successfully');
//       await loadPerformanceData(selectedEmployee.id, selectedYear);
//     } catch (error) {
//       console.error('Error submitting competencies:', error);
//       showNotif('Error submitting competencies', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ==================== MID-YEAR OPERATIONS ====================
  
//   const handleSaveMidYearDraft = async (userRole) => {
//     if (!selectedPerformanceId) return;
    
//     const key = `${selectedEmployee.id}_${selectedYear}`;
//     const data = performanceData[key];
    
//     setLoading(true);
//     try {
//       await performanceApi.performances.saveMidYearDraft(selectedPerformanceId, {
//         user_role: userRole,
//         comment: userRole === 'employee' ? data.mid_year_employee_comment : data.mid_year_manager_comment
//       });
//       showNotif('Mid-year draft saved successfully');
//     } catch (error) {
//       console.error('Error saving mid-year:', error);
//       showNotif('Error saving mid-year', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmitMidYear = async (userRole) => {
//     if (!selectedPerformanceId) return;
    
//     const key = `${selectedEmployee.id}_${selectedYear}`;
//     const data = performanceData[key];
    
//     setLoading(true);
//     try {
//       if (userRole === 'employee') {
//         await performanceApi.performances.submitMidYearEmployee(selectedPerformanceId, {
//           comment: data.mid_year_employee_comment
//         });
//       } else {
//         await performanceApi.performances.submitMidYearManager(selectedPerformanceId, {
//           comment: data.mid_year_manager_comment
//         });
//       }
//       showNotif('Mid-year review submitted successfully');
//       await loadPerformanceData(selectedEmployee.id, selectedYear);
//     } catch (error) {
//       console.error('Error submitting mid-year:', error);
//       showNotif('Error submitting mid-year', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ==================== END-YEAR OPERATIONS ====================
  
//   const handleSaveEndYearDraft = async (userRole) => {
//     if (!selectedPerformanceId) return;
    
//     const key = `${selectedEmployee.id}_${selectedYear}`;
//     const data = performanceData[key];
    
//     setLoading(true);
//     try {
//       await performanceApi.performances.saveEndYearDraft(selectedPerformanceId, {
//         user_role: userRole,
//         comment: userRole === 'employee' ? data.end_year_employee_comment : data.end_year_manager_comment
//       });
//       showNotif('End-year draft saved successfully');
//     } catch (error) {
//       console.error('Error saving end-year:', error);
//       showNotif('Error saving end-year', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCompleteEndYear = async () => {
//     if (!selectedPerformanceId) return;
    
//     const key = `${selectedEmployee.id}_${selectedYear}`;
//     const data = performanceData[key];
    
//     setLoading(true);
//     try {
//       await performanceApi.performances.completeEndYear(selectedPerformanceId, {
//         comment: data.end_year_manager_comment
//       });
//       showNotif('End-year review completed successfully');
//       await loadPerformanceData(selectedEmployee.id, selectedYear);
//     } catch (error) {
//       console.error('Error completing end-year:', error);
//       showNotif(error.response?.data?.error || 'Error completing end-year', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ==================== DEVELOPMENT NEEDS ====================
  
//   const handleSaveDevelopmentNeeds = async () => {
//     if (!selectedPerformanceId) return;
    
//     const key = `${selectedEmployee.id}_${selectedYear}`;
//     const data = performanceData[key];
    
//     setLoading(true);
//     try {
//       await performanceApi.performances.saveDevelopmentNeedsDraft(selectedPerformanceId, {
//         development_needs: data.development_needs
//       });
//       showNotif('Development needs saved successfully');
//     } catch (error) {
//       console.error('Error saving development needs:', error);
//       showNotif('Error saving development needs', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ==================== EXPORT ====================
  
//   const handleExportExcel = async () => {
//     if (!selectedPerformanceId) return;
    
//     setLoading(true);
//     try {
//       await performanceApi.downloadExcel(
//         selectedPerformanceId, 
//         `performance_${selectedEmployee.employee_id}_${selectedYear}.xlsx`
//       );
//       showNotif('Export successful');
//     } catch (error) {
//       console.error('Error exporting:', error);
//       showNotif('Error exporting', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ==================== SETTINGS SAVE ====================
  
//   const handleSaveYear = async () => {
//     setLoading(true);
//     try {
//       if (activeYear?.id) {
//         await performanceApi.years.update(activeYear.id, {
//           year: activeYear.year,
//           is_active: true,
//           goal_setting_employee_start: settings.goalSetting.employeeStart,
//           goal_setting_employee_end: settings.goalSetting.employeeEnd,
//           goal_setting_manager_start: settings.goalSetting.managerStart,
//           goal_setting_manager_end: settings.goalSetting.managerEnd,
//           mid_year_review_start: settings.midYearReview.start,
//           mid_year_review_end: settings.midYearReview.end,
//           end_year_review_start: settings.endYearReview.start,
//           end_year_review_end: settings.endYearReview.end
//         });
//         showNotif('Year configuration saved successfully');
//         await loadActiveYear();
//       }
//     } catch (error) {
//       console.error('Error saving year:', error);
//       showNotif('Error saving year', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveWeights = async () => {
//     setLoading(true);
//     try {
//       for (const weight of settings.performanceWeights) {
//         if (weight.id) {
//           await performanceApi.weightConfigs.update(weight.id, weight);
//         }
//       }
//       showNotif('Weights saved successfully');
//       await loadSettings();
//     } catch (error) {
//       console.error('Error saving weights:', error);
//       showNotif('Error saving weights', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveGoalLimits = async () => {
//     setLoading(true);
//     try {
//       const limitsResponse = await performanceApi.goalLimits.getActiveConfig();
//       await performanceApi.goalLimits.update(limitsResponse.data.id, {
//         min_goals: settings.goalLimits.min,
//         max_goals: settings.goalLimits.max,
//         is_active: true
//       });
//       showNotif('Goal limits saved successfully');
//       await loadSettings();
//     } catch (error) {
//       console.error('Error saving limits:', error);
//       showNotif('Error saving limits', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveDepartmentObjectives = async () => {
//     setLoading(true);
//     try {
//       for (const dept of settings.departmentObjectives) {
//         if (dept.id) {
//           await performanceApi.departmentObjectives.update(dept.id, dept);
//         } else {
//           await performanceApi.departmentObjectives.create(dept);
//         }
//       }
//       showNotif('Department objectives saved successfully');
//       await loadSettings();
//     } catch (error) {
//       console.error('Error saving department objectives:', error);
//       showNotif('Error saving department objectives', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveEvaluationScale = async () => {
//     setLoading(true);
//     try {
//       for (const scale of settings.evaluationScale) {
//         if (scale.id) {
//           await performanceApi.evaluationScales.update(scale.id, scale);
//         }
//       }
//       showNotif('Evaluation scale saved successfully');
//       await loadSettings();
//     } catch (error) {
//       console.error('Error saving scale:', error);
//       showNotif('Error saving scale', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSaveEvaluationTargets = async () => {
//     setLoading(true);
//     try {
//       const targetsResponse = await performanceApi.evaluationTargets.getActiveConfig();
//       await performanceApi.evaluationTargets.update(targetsResponse.data.id, {
//         objective_score_target: settings.evaluationTargets.objectiveScore,
//         competency_score_target: settings.evaluationTargets.competencyScore,
//         is_active: true
//       });
//       showNotif('Evaluation targets saved successfully');
//       await loadSettings();
//     } catch (error) {
//       console.error('Error saving targets:', error);
//       showNotif('Error saving targets', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ==================== UTILITY FUNCTIONS ====================
  
//   const showNotif = (message, type = 'success') => {
//     setNotificationMessage(message);
//     setNotificationType(type);
//     setShowNotification(true);
//     setTimeout(() => setShowNotification(false), 3000);
//   };

//   const calculateTotalWeight = (objectives) => {
//     return objectives.reduce((sum, obj) => sum + (parseFloat(obj.weight) || 0), 0);
//   };

//   const canAddObjective = (objectives) => {
//     const totalWeight = calculateTotalWeight(objectives);
//     return objectives.length < settings.goalLimits.max && totalWeight < 100;
//   };

//   const getCurrentPeriod = () => {
//     if (!activeYear) return 'CLOSED';
//     return activeYear.current_period || 'CLOSED';
//   };

//   const currentPeriod = getCurrentPeriod();

//   // ==================== DASHBOARD MODULE ====================
  
//   const renderDashboardModule = () => (
//     <div className="space-y-5">
//       <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral rounded-lg p-5 text-white">
//         <div className="flex items-center justify-between">
//           <div>
//             <h2 className="text-lg font-semibold mb-1">Performance {selectedYear}</h2>
//             <p className="text-xs opacity-90">
//               Period: <span className="font-medium">
//                 {currentPeriod === 'GOAL_SETTING' && 'Goal Setting'}
//                 {currentPeriod === 'MID_YEAR_REVIEW' && 'Mid-Year Review'}
//                 {currentPeriod === 'END_YEAR_REVIEW' && 'End-Year Review'}
//                 {currentPeriod === 'CLOSED' && 'Closed'}
//               </span>
//             </p>
//           </div>
//           <div className="flex items-center gap-2">
//             <select
//               value={selectedYear}
//               onChange={(e) => setSelectedYear(parseInt(e.target.value))}
//               className="px-3 py-1.5 text-xs rounded bg-white text-almet-sapphire border-0"
//             >
//               {performanceYears.map(year => (
//                 <option key={year.id} value={year.year}>{year.year}</option>
//               ))}
//             </select>
//             <button
//               onClick={loadDashboardStats}
//               className="p-1.5 bg-white bg-opacity-20 rounded hover:bg-opacity-30"
//             >
//               <RefreshCw className="w-4 h-4" />
//             </button>
//           </div>
//         </div>
//       </div>

//       {dashboardStats && (
//         <>
//           <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-5`}>
//             <h3 className="text-sm font-semibold mb-4 text-almet-cloud-burst dark:text-almet-mystic">Timeline</h3>
            
//             <div className="space-y-4">
//               <div className="flex items-start gap-3">
//                 <div className={`w-3 h-3 rounded-full mt-0.5 ${currentPeriod === 'GOAL_SETTING' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
//                 <div className="flex-1">
//                   <h4 className="text-xs font-medium">Goal Setting</h4>
//                   <p className="text-xs text-gray-500">
//                     {dashboardStats.timeline?.goal_setting?.employee_start} - {dashboardStats.timeline?.goal_setting?.manager_end}
//                   </p>
//                 </div>
//               </div>

//               <div className="flex items-start gap-3">
//                 <div className={`w-3 h-3 rounded-full mt-0.5 ${currentPeriod === 'MID_YEAR_REVIEW' ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
//                 <div className="flex-1">
//                   <h4 className="text-xs font-medium">Mid-Year Review</h4>
//                   <p className="text-xs text-gray-500">
//                     {dashboardStats.timeline?.mid_year?.start} - {dashboardStats.timeline?.mid_year?.end}
//                   </p>
//                 </div>
//               </div>

//               <div className="flex items-start gap-3">
//                 <div className={`w-3 h-3 rounded-full mt-0.5 ${currentPeriod === 'END_YEAR_REVIEW' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
//                 <div className="flex-1">
//                   <h4 className="text-xs font-medium">End-Year Review</h4>
//                   <p className="text-xs text-gray-500">
//                     {dashboardStats.timeline?.end_year?.start} - {dashboardStats.timeline?.end_year?.end}
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
//               <div className="flex items-center justify-between mb-3">
//                 <Target className="w-6 h-6 text-almet-sapphire" />
//                 <span className="text-lg font-bold text-almet-sapphire">
//                   {dashboardStats.objectives_completed}/{dashboardStats.total_employees}
//                 </span>
//               </div>
//               <h3 className="text-xs font-medium mb-2">Objectives Set</h3>
//               <div className="w-full bg-gray-200 rounded-full h-1.5">
//                 <div 
//                   className="bg-almet-sapphire h-1.5 rounded-full" 
//                   style={{width: `${dashboardStats.total_employees > 0 ? (dashboardStats.objectives_completed/dashboardStats.total_employees)*100 : 0}%`}}
//                 ></div>
//               </div>
//             </div>

//             <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
//               <div className="flex items-center justify-between mb-3">
//                 <FileText className="w-6 h-6 text-almet-steel-blue" />
//                 <span className="text-lg font-bold text-almet-steel-blue">
//                   {dashboardStats.mid_year_completed}/{dashboardStats.total_employees}
//                 </span>
//               </div>
//               <h3 className="text-xs font-medium mb-2">Mid-Year Completed</h3>
//               <div className="w-full bg-gray-200 rounded-full h-1.5">
//                 <div 
//                   className="bg-almet-steel-blue h-1.5 rounded-full" 
//                   style={{width: `${dashboardStats.total_employees > 0 ? (dashboardStats.mid_year_completed/dashboardStats.total_employees)*100 : 0}%`}}
//                 ></div>
//               </div>
//             </div>

//             <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
//               <div className="flex items-center justify-between mb-3">
//                 <Award className="w-6 h-6 text-almet-astral" />
//                 <span className="text-lg font-bold text-almet-astral">
//                   {dashboardStats.end_year_completed}/{dashboardStats.total_employees}
//                 </span>
//               </div>
//               <h3 className="text-xs font-medium mb-2">End-Year Completed</h3>
//               <div className="w-full bg-gray-200 rounded-full h-1.5">
//                 <div 
//                   className="bg-almet-astral h-1.5 rounded-full" 
//                   style={{width: `${dashboardStats.total_employees > 0 ? (dashboardStats.end_year_completed/dashboardStats.total_employees)*100 : 0}%`}}
//                 ></div>
//               </div>
//             </div>
//           </div>
//         </>
//       )}

//       <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-5`}>
//         <div className="flex items-center justify-between mb-4">
//           <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-mystic">My Team</h3>
//           <button
//             onClick={loadEmployees}
//             className="px-2 py-1 text-xs bg-almet-sapphire text-white rounded hover:bg-almet-astral flex items-center"
//           >
//             <RefreshCw className="w-3 h-3 mr-1" />
//             Refresh
//           </button>
//         </div>
        
//         {employees.length === 0 ? (
//           <div className="text-center py-8 text-gray-500">
//             <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
//             <p className="text-xs">No team members found</p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
//             {employees.map(employee => (
//               <div
//                 key={employee.id}
//                 onClick={() => {
//                   setSelectedEmployee(employee);
//                   loadPerformanceData(employee.id, selectedYear);
//                   setActiveModule('execute');
//                 }}
//                 className={`p-3 rounded-lg border ${darkMode ? 'border-gray-700 hover:border-almet-sapphire' : 'border-gray-200 hover:border-almet-sapphire'} cursor-pointer transition-all`}
//               >
//                 <div className="flex items-center mb-2">
//                   <div className="w-8 h-8 rounded-full bg-almet-sapphire text-white flex items-center justify-center text-xs font-medium mr-2">
//                     {employee.name.charAt(0)}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <h4 className="text-xs font-medium truncate">{employee.name}</h4>
//                     <p className="text-xs text-gray-500 truncate">{employee.position}</p>
//                   </div>
//                 </div>
                
//                 <div className="flex items-center justify-between mb-2">
//                   <span className={`text-xs px-2 py-0.5 rounded ${
//                     employee.approval_status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
//                     employee.approval_status === 'APPROVED' ? 'bg-blue-100 text-blue-700' :
//                     employee.approval_status === 'PENDING_MANAGER_APPROVAL' ? 'bg-yellow-100 text-yellow-700' :
//                     'bg-gray-100 text-gray-700'
//                   }`}>
//                     {employee.approval_status?.replace(/_/g, ' ')}
//                   </span>
//                 </div>
                
//                 <button className="w-full px-3 py-1.5 bg-almet-sapphire text-white rounded hover:bg-almet-astral text-xs">
//                   View Performance
//                 </button>
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );

//   // ==================== EXECUTE MODULE ====================
  
//   const renderExecuteModule = () => {
//     if (!selectedEmployee) {
//       return (
//         <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-8 text-center`}>
//           <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
//           <h3 className="text-sm font-semibold mb-2 text-gray-600">Select Employee</h3>
          
//           <div className="max-w-md mx-auto space-y-2 mt-4">
//             {employees.map(employee => (
//               <button
//                 key={employee.id}
//                 onClick={() => {
//                   setSelectedEmployee(employee);
//                   loadPerformanceData(employee.id, selectedYear);
//                 }}
//                 className={`w-full p-3 rounded-lg border ${darkMode ? 'border-gray-700 hover:border-almet-sapphire' : 'border-gray-200 hover:border-almet-sapphire'} transition-all text-left`}
//               >
//                 <div className="flex items-center">
//                   <div className="w-8 h-8 rounded-full bg-almet-sapphire text-white flex items-center justify-center text-xs font-medium mr-3">
//                     {employee.name.charAt(0)}
//                   </div>
//                   <div>
//                     <h4 className="text-xs font-medium">{employee.name}</h4>
//                     <p className="text-xs text-gray-500">{employee.position}</p>
//                   </div>
//                 </div>
//               </button>
//             ))}
//           </div>
//         </div>
//       );
//     }

//     const key = `${selectedEmployee.id}_${selectedYear}`;
//     const data = performanceData[key] || {};
//     const objectives = data.objectives || [];
//     const competencies = data.competency_ratings || [];
//     const developmentNeeds = data.development_needs || [];
    
//     const totalWeight = calculateTotalWeight(objectives);

//     if (loading && !data.id) {
//       return (
//         <div className="flex items-center justify-center py-20">
//           <Loader className="w-8 h-8 animate-spin text-almet-sapphire" />
//         </div>
//       );
//     }

//     return (
//       <div className="space-y-5">
//         {/* Header */}
//         <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral rounded-lg p-4 text-white">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center">
//               <div className="w-10 h-10 rounded-full bg-white text-almet-sapphire flex items-center justify-center text-sm font-bold mr-3">
//                 {selectedEmployee.name.charAt(0)}
//               </div>
//               <div>
//                 <h2 className="text-sm font-semibold">{selectedEmployee.name}</h2>
//                 <p className="text-xs opacity-90">{selectedEmployee.position}</p>
//                 <p className="text-xs opacity-75">{selectedEmployee.department} • {selectedEmployee.employee_id}</p>
//               </div>
//             </div>
//             <div className="flex gap-2">
//               <button
//                 onClick={handleExportExcel}
//                 disabled={loading}
//                 className="px-3 py-1.5 bg-white text-almet-sapphire rounded hover:bg-gray-100 text-xs flex items-center disabled:opacity-50"
//               >
//                 <Download className="w-3 h-3 mr-1" />
//                 Export
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Scale Reference */}
//         <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border`}>
//           <button
//             onClick={(e) => {
//               const elem = e.currentTarget.nextElementSibling;
//               elem.classList.toggle('hidden');
//             }}
//             className={`w-full p-3 flex items-center justify-between text-left ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
//           >
//             <div className="flex items-center">
//               <Star className="w-4 h-4 mr-2 text-almet-sapphire" />
//               <h3 className="text-xs font-medium">Evaluation Scale</h3>
//             </div>
//             <ChevronDown className="w-4 h-4" />
//           </button>
          
//           <div className="hidden p-3 border-t">
//             <div className="grid grid-cols-5 gap-2">
//               {settings.evaluationScale.map((scale, index) => (
//                 <div key={index} className={`p-2 rounded text-center ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
//                   <div className="text-sm font-bold text-almet-sapphire">{scale.name}</div>
//                   <div className="text-xs text-gray-600 dark:text-gray-400">Val: {scale.value}</div>
//                   <div className="text-xs text-gray-500">{scale.range_min}-{scale.range_max}%</div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Objectives */}
//         <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
//           <div className="flex items-center justify-between mb-3">
//             <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-mystic">Employee Objectives</h3>
//             <div className="flex items-center gap-2">
//               <span className={`text-xs font-medium px-2 py-0.5 rounded ${totalWeight === 100 ? 'bg-green-100 text-green-700' : totalWeight > 100 ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
//                 {totalWeight}%
//               </span>
//               <button
//                 onClick={() => {
//                   if (!canAddObjective(objectives)) {
//                     showNotif('Cannot add more objectives', 'error');
//                     return;
//                   }
                  
//                   const newObjective = {
//                     id: Date.now(),
//                     title: '',
//                     description: '',
//                     linked_department_objective: null,
//                     weight: 0,
//                     end_year_rating: null,
//                     calculated_score: 0,
//                     progress: 0,
//                     status: settings.statusTypes[0]?.id || null
//                   };
                  
//                   setPerformanceData(prev => ({
//                     ...prev,
//                     [key]: {
//                       ...prev[key],
//                       objectives: [...(prev[key].objectives || []), newObjective]
//                     }
//                   }));
//                 }}
//                 disabled={!canAddObjective(objectives) || loading}
//                 className="px-2 py-1 bg-almet-sapphire text-white rounded hover:bg-almet-astral text-xs disabled:opacity-50 flex items-center"
//               >
//                 <Plus className="w-3 h-3 mr-1" />
//                 Add
//               </button>
//             </div>
//           </div>

//           <div className="space-y-3">
//             {objectives.map((objective, index) => (
//               <div key={objective.id} className={`p-3 border rounded ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
//                   <div>
//                     <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Title</label>
//                     <input
//                       type="text"
//                       value={objective.title}
//                       onChange={(e) => {
//                         const newObjectives = [...objectives];
//                         newObjectives[index].title = e.target.value;
//                         setPerformanceData(prev => ({
//                           ...prev,
//                           [key]: { ...prev[key], objectives: newObjectives }
//                         }));
//                       }}
//                       className={`w-full px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
//                       placeholder="Objective title"
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Department Objective</label>
//                     <select
//                       value={objective.linked_department_objective || ''}
//                       onChange={(e) => {
//                         const newObjectives = [...objectives];
//                         newObjectives[index].linked_department_objective = e.target.value || null;
//                         setPerformanceData(prev => ({
//                           ...prev,
//                           [key]: { ...prev[key], objectives: newObjectives }
//                         }));
//                       }}
//                       className={`w-full px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
//                     >
//                       <option value="">Select</option>
//                       {settings.departmentObjectives
//                         .filter(d => d.department_name === selectedEmployee.department)
//                         .map(deptObj => (
//                           <option key={deptObj.id} value={deptObj.id}>{deptObj.title}</option>
//                         ))}
//                     </select>
//                   </div>
//                 </div>

//                 <div className="mb-2">
//                   <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Description</label>
//                   <textarea
//                     value={objective.description}
//                     onChange={(e) => {
//                       const newObjectives = [...objectives];
//                       newObjectives[index].description = e.target.value;
//                       setPerformanceData(prev => ({
//                         ...prev,
//                         [key]: { ...prev[key], objectives: newObjectives }
//                       }));
//                     }}
//                     rows={2}
//                     className={`w-full px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
//                     placeholder="Description"
//                   />
//                 </div>

//                 <div className="grid grid-cols-5 gap-2 mb-2">
//                   <div>
//                     <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Weight %</label>
//                     <input
//                       type="number"
//                       min="0"
//                       max="100"
//                       value={objective.weight}
//                       onChange={(e) => {
//                         const newObjectives = [...objectives];
//                         newObjectives[index].weight = parseFloat(e.target.value) || 0;
//                         setPerformanceData(prev => ({
//                           ...prev,
//                           [key]: { ...prev[key], objectives: newObjectives }
//                         }));
//                       }}
//                       className={`w-full px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Rating</label>
//                     <select
//                       value={objective.end_year_rating || ''}
//                       onChange={(e) => {
//                         const newObjectives = [...objectives];
//                         newObjectives[index].end_year_rating = e.target.value || null;
//                         setPerformanceData(prev => ({
//                           ...prev,
//                           [key]: { ...prev[key], objectives: newObjectives }
//                         }));
//                       }}
//                       disabled={currentPeriod !== 'END_YEAR_REVIEW'}
//                       className={`w-full px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} disabled:opacity-50`}
//                     >
//                       <option value="">--</option>
//                       {settings.evaluationScale.map(scale => (
//                         <option key={scale.id} value={scale.id}>{scale.name}</option>
//                       ))}
//                     </select>
//                   </div>

//                   <div>
//                     <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Score</label>
//                     <input
//                       type="text"
//                       value={objective.calculated_score?.toFixed(2) || '0.00'}
//                       readOnly
//                       className={`w-full px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-100 border-gray-300'}`}
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Progress %</label>
//                     <input
//                       type="number"
//                       min="0"
//                       max="100"
//                       value={objective.progress}
//                       onChange={(e) => {
//                         const newObjectives = [...objectives];
//                         newObjectives[index].progress = parseInt(e.target.value) || 0;
//                         setPerformanceData(prev => ({
//                           ...prev,
//                           [key]: { ...prev[key], objectives: newObjectives }
//                         }));
//                       }}
//                       className={`w-full px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
//                     />
//                   </div>

//                   <div>
//                     <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Status</label>
//                     <select
//                       value={objective.status || ''}
//                       onChange={(e) => {
//                         const newObjectives = [...objectives];
//                         newObjectives[index].status = e.target.value;
//                         setPerformanceData(prev => ({
//                           ...prev,
//                           [key]: { ...prev[key], objectives: newObjectives }
//                         }));
//                       }}
//                       className={`w-full px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
//                     >
//                       {settings.statusTypes.map(status => (
//                         <option key={status.id} value={status.id}>{status.label}</option>
//                       ))}
//                     </select>
//                   </div>
//                 </div>

//                 <div className="flex justify-end">
//                   <button
//                     onClick={() => {
//                       const newObjectives = objectives.filter((_, i) => i !== index);
//                       setPerformanceData(prev => ({
//                         ...prev,
//                         [key]: { ...prev[key], objectives: newObjectives }
//                       }));
//                     }}
//                     className="px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-xs"
//                   >
//                     <Trash2 className="w-3 h-3" />
//                   </button>
//                 </div>
//               </div>
//             ))}

//             {objectives.length === 0 && (
//               <div className="text-center py-6 text-gray-500 text-xs">
//                 No objectives. Click "Add" to create.
//               </div>
//             )}
//           </div>

//           {objectives.length > 0 && (
//             <div className={`mt-3 p-3 rounded ${darkMode ? 'bg-blue-900/20 border-almet-sapphire' : 'bg-blue-50 border-blue-200'} border`}>
//               <div className="flex items-center justify-between">
//                 <h4 className="text-xs font-medium">Objectives Score</h4>
//                 <div className="text-right">
//                   <div className="text-sm font-bold text-almet-sapphire">
//                     {data.total_objectives_score || '0.00'} / {settings.evaluationTargets.objectiveScore}
//                   </div>
//                   <div className="text-xs text-gray-600">
//                     {data.objectives_percentage || '0'}%
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           <div className="mt-3 flex gap-2">
//             <button
//               onClick={handleSaveObjectivesDraft}
//               disabled={loading}
//               className="px-3 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center disabled:opacity-50"
//             >
//               {loading ? <Loader className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
//               Save Draft
//             </button>
            
//             <button
//               onClick={handleSubmitObjectives}
//               disabled={objectives.length < settings.goalLimits.min || totalWeight !== 100 || loading}
//               className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center"
//             >
//               <Send className="w-3 h-3 mr-1" />
//               Submit
//             </button>
//           </div>
//         </div>

//         {/* Competencies */}
//         <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
//           <h3 className="text-sm font-semibold mb-3 text-almet-cloud-burst dark:text-almet-mystic">Core Competencies</h3>

//           <div className="space-y-4">
//             {coreCompetencies.map((group, groupIndex) => (
//               <div key={groupIndex}>
//                 <h4 className="text-xs font-medium mb-2 text-almet-sapphire">{group.group}</h4>
//                 <div className="space-y-2">
//                   {competencies.filter(c => c.competency_group === group.group).map((comp) => {
//                     const actualIndex = competencies.findIndex(c => c.id === comp.id);
                    
//                     return (
//                       <div key={comp.id} className={`grid grid-cols-3 gap-2 p-2 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
//                         <div>
//                           <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Competency</label>
//                           <input
//                             type="text"
//                             value={comp.competency_name}
//                             readOnly
//                             className={`w-full px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-100 border-gray-300'}`}
//                           />
//                         </div>
                        
//                         <div>
//                           <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Rating</label>
//                           <select
//                             value={comp.end_year_rating || ''}
//                             onChange={(e) => {
//                               const newCompetencies = [...competencies];
//                               newCompetencies[actualIndex].end_year_rating = e.target.value || null;
//                               setPerformanceData(prev => ({
//                                 ...prev,
//                                 [key]: { ...prev[key], competency_ratings: newCompetencies }
//                               }));
//                             }}
//                             disabled={currentPeriod !== 'END_YEAR_REVIEW'}
//                             className={`w-full px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} disabled:opacity-50`}
//                           >
//                             <option value="">--</option>
//                             {settings.evaluationScale.map(scale => (
//                               <option key={scale.id} value={scale.id}>{scale.name}</option>
//                             ))}
//                           </select>
//                         </div>
                        
//                         <div>
//                           <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Score</label>
//                           <input
//                             type="text"
//                             value={comp.end_year_rating_value || '0'}
//                             readOnly
//                             className={`w-full px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-100 border-gray-300'}`}
//                           />
//                         </div>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             ))}
//           </div>

//           <div className={`mt-3 p-3 rounded ${darkMode ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
//             <div className="flex items-center justify-between">
//               <h4 className="text-xs font-medium">Competencies Score</h4>
//               <div className="text-right">
//                 <div className="text-sm font-bold text-purple-600">
//                   {data.total_competencies_score || '0.00'} / {settings.evaluationTargets.competencyScore}
//                 </div>
//                 <div className="text-xs text-gray-600">
//                   {data.competencies_percentage || '0'}%
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="mt-3 flex gap-2">
//             <button
//               onClick={handleSaveCompetenciesDraft}
//               disabled={loading}
//               className="px-3 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center disabled:opacity-50"
//             >
//               {loading ? <Loader className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
//               Save Draft
//             </button>
            
//             <button
//               onClick={handleSubmitCompetencies}
//               disabled={loading}
//               className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 flex items-center disabled:opacity-50"
//             >
//               <Send className="w-3 h-3 mr-1" />
//               Submit
//             </button>
//           </div>
//         </div>

//         {/* Reviews */}
//         <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
//           <h3 className="text-sm font-semibold mb-3 text-almet-cloud-burst dark:text-almet-mystic">Performance Reviews</h3>

//           <div className="mb-4">
//             <h4 className="text-xs font-medium mb-2 text-almet-sapphire">Mid-Year Review</h4>
            
//             <div className="space-y-2">
//               <div>
//                 <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Employee Comment</label>
//                 <textarea
//                   value={data.mid_year_employee_comment || ''}
//                   onChange={(e) => {
//                     setPerformanceData(prev => ({
//                       ...prev,
//                       [key]: { ...prev[key], mid_year_employee_comment: e.target.value }
//                     }));
//                   }}
//                   disabled={currentPeriod !== 'MID_YEAR_REVIEW'}
//                   rows={3}
//                   className={`w-full px-2 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} disabled:opacity-50`}
//                   placeholder="Employee writes first..."
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Manager Comment</label>
//                 <textarea
//                   value={data.mid_year_manager_comment || ''}
//                   onChange={(e) => {
//                     setPerformanceData(prev => ({
//                       ...prev,
//                       [key]: { ...prev[key], mid_year_manager_comment: e.target.value }
//                     }));
//                   }}
//                   disabled={currentPeriod !== 'MID_YEAR_REVIEW'}
//                   rows={3}
//                   className={`w-full px-2 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} disabled:opacity-50`}
//                   placeholder="Manager responds..."
//                 />
//               </div>
//             </div>

//             <div className="mt-2 flex gap-2">
//               <button
//                 onClick={() => handleSaveMidYearDraft('employee')}
//                 disabled={currentPeriod !== 'MID_YEAR_REVIEW' || loading}
//                 className="px-3 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 flex items-center"
//               >
//                 {loading ? <Loader className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
//                 Save Draft
//               </button>
              
//               <button
//                 onClick={() => handleSubmitMidYear('employee')}
//                 disabled={currentPeriod !== 'MID_YEAR_REVIEW' || loading}
//                 className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center"
//               >
//                 <Send className="w-3 h-3 mr-1" />
//                 Submit Employee
//               </button>
              
//               <button
//                 onClick={() => handleSubmitMidYear('manager')}
//                 disabled={currentPeriod !== 'MID_YEAR_REVIEW' || loading}
//                 className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center"
//               >
//                 <Send className="w-3 h-3 mr-1" />
//                 Submit Manager
//               </button>
//             </div>
//           </div>

//           <div>
//             <h4 className="text-xs font-medium mb-2 text-almet-sapphire">End-Year Review</h4>
            
//             <div className="space-y-2">
//               <div>
//                 <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Employee Comment</label>
//                 <textarea
//                   value={data.end_year_employee_comment || ''}
//                   onChange={(e) => {
//                     setPerformanceData(prev => ({
//                       ...prev,
//                       [key]: { ...prev[key], end_year_employee_comment: e.target.value }
//                     }));
//                   }}
//                   disabled={currentPeriod !== 'END_YEAR_REVIEW'}
//                   rows={3}
//                   className={`w-full px-2 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} disabled:opacity-50`}
//                   placeholder="Employee writes first..."
//                 />
//               </div>
              
//               <div>
//                 <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Manager Comment</label>
//                 <textarea
//                   value={data.end_year_manager_comment || ''}
//                   onChange={(e) => {
//                     setPerformanceData(prev => ({
//                       ...prev,
//                       [key]: { ...prev[key], end_year_manager_comment: e.target.value }
//                     }));
//                   }}
//                   disabled={currentPeriod !== 'END_YEAR_REVIEW'}
//                   rows={3}
//                   className={`w-full px-2 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} disabled:opacity-50`}
//                   placeholder="Manager responds..."
//                 />
//               </div>
//             </div>

//             <div className="mt-2 flex gap-2">
//               <button
//                 onClick={() => handleSaveEndYearDraft('manager')}
//                 disabled={currentPeriod !== 'END_YEAR_REVIEW' || loading}
//                 className="px-3 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50 flex items-center"
//               >
//                 {loading ? <Loader className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
//                 Save Draft
//               </button>
              
//               <button
//                 onClick={handleCompleteEndYear}
//                 disabled={currentPeriod !== 'END_YEAR_REVIEW' || loading}
//                 className="px-3 py-1.5 text-xs bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 flex items-center"
//               >
//                 <Send className="w-3 h-3 mr-1" />
//                 Complete End-Year
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Development Needs */}
//         {developmentNeeds.length > 0 && (
//           <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-4`}>
//             <h3 className="text-sm font-semibold mb-3 text-almet-cloud-burst dark:text-almet-mystic">Development Needs</h3>

//             <div className="space-y-2">
//               {developmentNeeds.map((need, index) => (
//                 <div key={need.id} className={`grid grid-cols-4 gap-2 p-2 rounded ${darkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'} border`}>
//                   <div>
//                     <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Gap</label>
//                     <input
//                       type="text"
//                       value={need.competency_gap}
//                       readOnly
//                       className={`w-full px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-100 border-gray-300'}`}
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Activity</label>
//                     <input
//                       type="text"
//                       value={need.development_activity}
//                       onChange={(e) => {
//                         const newNeeds = [...developmentNeeds];
//                         newNeeds[index].development_activity = e.target.value;
//                         setPerformanceData(prev => ({
//                           ...prev,
//                           [key]: { ...prev[key], development_needs: newNeeds }
//                         }));
//                       }}
//                       className={`w-full px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
//                       placeholder="What to do"
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Progress %</label>
//                     <input
//                       type="number"
//                       min="0"
//                       max="100"
//                       value={need.progress}
//                       onChange={(e) => {
//                         const newNeeds = [...developmentNeeds];
//                         newNeeds[index].progress = parseInt(e.target.value) || 0;
//                         setPerformanceData(prev => ({
//                           ...prev,
//                           [key]: { ...prev[key], development_needs: newNeeds }
//                         }));
//                       }}
//                       className={`w-full px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block text-xs mb-1 text-gray-600 dark:text-gray-400">Comment</label>
//                     <input
//                       type="text"
//                       value={need.comment}
//                       onChange={(e) => {
//                         const newNeeds = [...developmentNeeds];
//                         newNeeds[index].comment = e.target.value;
//                         setPerformanceData(prev => ({
//                           ...prev,
//                           [key]: { ...prev[key], development_needs: newNeeds }
//                         }));
//                       }}
//                       className={`w-full px-2 py-1 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
//                       placeholder="Notes"
//                     />
//                   </div>
//                 </div>
//               ))}
//             </div>

//             <div className="mt-3">
//               <button
//                 onClick={handleSaveDevelopmentNeeds}
//                 disabled={loading}
//                 className="px-3 py-1.5 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center disabled:opacity-50"
//               >
//                 {loading ? <Loader className="w-3 h-3 mr-1 animate-spin" /> : <Save className="w-3 h-3 mr-1" />}
//                 Save
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Final Summary */}
//         {data.overall_weighted_percentage && (
//           <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral rounded-lg p-4 text-white">
//             <h3 className="text-sm font-semibold mb-3 flex items-center">
//               <Star className="w-4 h-4 mr-2" />
//               Final Performance Summary
//             </h3>
            
//             <div className="grid grid-cols-5 gap-2 text-xs">
//               <div className="bg-white bg-opacity-20 rounded p-2 text-center">
//                 <div className="opacity-75 mb-1">Obj Score</div>
//                 <div className="text-lg font-bold">{data.total_objectives_score}</div>
//                 <div className="opacity-75">{data.objectives_percentage}%</div>
//               </div>
              
//               <div className="bg-white bg-opacity-20 rounded p-2 text-center">
//                 <div className="opacity-75 mb-1">Comp Score</div>
//                 <div className="text-lg font-bold">{data.total_competencies_score}</div>
//                 <div className="opacity-75">{data.competencies_percentage}%</div>
//               </div>
              
//               <div className="bg-white bg-opacity-20 rounded p-2 text-center">
//                 <div className="opacity-75 mb-1">Obj Weight</div>
//                 <div className="text-lg font-bold">{data.weight_config?.objectives_weight || 70}%</div>
//               </div>
              
//               <div className="bg-white bg-opacity-20 rounded p-2 text-center">
//                 <div className="opacity-75 mb-1">Comp Weight</div>
//                 <div className="text-lg font-bold">{data.weight_config?.competencies_weight || 30}%</div>
//               </div>
              
//               <div className="bg-white bg-opacity-20 rounded p-2 text-center">
//                 <div className="opacity-75 mb-1">Final</div>
//                 <div className="text-xl font-bold">{data.final_rating}</div>
//                 <div className="opacity-75">{data.overall_weighted_percentage}%</div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Back */}
//         <div className="flex justify-center">
//           <button
//             onClick={() => {
//               setSelectedEmployee(null);
//               setSelectedPerformanceId(null);
//               setActiveModule('dashboard');
//             }}
//             className="px-4 py-2 bg-almet-comet text-white rounded hover:bg-almet-waterloo text-xs"
//           >
//             Back to Dashboard
//           </button>
//         </div>
//       </div>
//     );
//   };

//   // ==================== SETTINGS MODULE ====================
  
//   const renderSettingsModule = () => (
//     <div className="space-y-6">
//       {/* 1. Date Ranges */}
//       <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-5`}>
//         <h3 className="text-sm font-semibold mb-4 pb-3 border-b text-almet-cloud-burst dark:text-almet-mystic">
//           1. Performance Period Configuration
//         </h3>
        
//         <div className="space-y-5">
//           <div>
//             <h4 className="text-xs font-medium mb-3 text-almet-sapphire">Goal Setting Period</h4>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//               <div>
//                 <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400">Employee Start</label>
//                 <input
//                   type="date"
//                   value={settings.goalSetting.employeeStart}
//                   onChange={(e) => setSettings(prev => ({
//                     ...prev,
//                     goalSetting: { ...prev.goalSetting, employeeStart: e.target.value }
//                   }))}
//                   className={`w-full px-3 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400">Employee End</label>
//                 <input
//                   type="date"
//                   value={settings.goalSetting.employeeEnd}
//                   onChange={(e) => setSettings(prev => ({
//                     ...prev,
//                     goalSetting: { ...prev.goalSetting, employeeEnd: e.target.value }
//                   }))}
//                   className={`w-full px-3 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400">Manager Start</label>
//                 <input
//                   type="date"
//                   value={settings.goalSetting.managerStart}
//                   onChange={(e) => setSettings(prev => ({
//                     ...prev,
//                     goalSetting: { ...prev.goalSetting, managerStart: e.target.value }
//                   }))}
//                   className={`w-full px-3 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400">Manager End</label>
//                 <input
//                   type="date"
//                   value={settings.goalSetting.managerEnd}
//                   onChange={(e) => setSettings(prev => ({
//                     ...prev,
//                     goalSetting: { ...prev.goalSetting, managerEnd: e.target.value }
//                   }))}
//                   className={`w-full px-3 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
//                 />
//               </div>
//             </div>
//           </div>

//           <div>
//             <h4 className="text-xs font-medium mb-3 text-almet-sapphire">Mid-Year Review</h4>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//               <div>
//                 <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400">Start Date</label>
//                 <input
//                   type="date"
//                   value={settings.midYearReview.start}
//                   onChange={(e) => setSettings(prev => ({
//                     ...prev,
//                     midYearReview: { ...prev.midYearReview, start: e.target.value }
//                   }))}
//                   className={`w-full px-3 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400">End Date</label>
//                 <input
//                   type="date"
//                   value={settings.midYearReview.end}
//                   onChange={(e) => setSettings(prev => ({
//                     ...prev,
//                     midYearReview: { ...prev.midYearReview, end: e.target.value }
//                   }))}
//                   className={`w-full px-3 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
//                 />
//               </div>
//             </div>
//           </div>

//           <div>
//             <h4 className="text-xs font-medium mb-3 text-almet-sapphire">End-Year Review</h4>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//               <div>
//                 <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400">Start Date</label>
//                 <input
//                   type="date"
//                   value={settings.endYearReview.start}
//                   onChange={(e) => setSettings(prev => ({
//                     ...prev,
//                     endYearReview: { ...prev.endYearReview, start: e.target.value }
//                   }))}
//                   className={`w-full px-3 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400">End Date</label>
//                 <input
//                   type="date"
//                   value={settings.endYearReview.end}
//                   onChange={(e) => setSettings(prev => ({
//                     ...prev,
//                     endYearReview: { ...prev.endYearReview, end: e.target.value }
//                   }))}
//                   className={`w-full px-3 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
//                 />
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="mt-4 flex justify-end">
//           <button
//             onClick={handleSaveYear}
//             disabled={loading}
//             className="px-4 py-1.5 text-xs bg-almet-sapphire text-white rounded hover:bg-almet-astral transition-colors flex items-center disabled:opacity-50"
//           >
//             {loading ? <Loader className="w-3 h-3 mr-1.5 animate-spin" /> : <Save className="w-3 h-3 mr-1.5" />}
//             Save Dates
//           </button>
//         </div>
//       </div>

//       {/* 2. Performance Weighting */}
//       <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-5`}>
//         <h3 className="text-sm font-semibold mb-4 pb-3 border-b text-almet-cloud-burst dark:text-almet-mystic">
//           2. Performance Weighting by Position Group
//         </h3>
        
//         <div className="space-y-3">
//           {settings.performanceWeights.map((weight, index) => (
//             <div key={index} className={`grid grid-cols-1 md:grid-cols-4 gap-3 p-3 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
//               <div>
//                 <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400">Position Group</label>
//                 <input
//                   type="text"
//                   value={weight.position_group_name || ''}
//                   readOnly
//                   className={`w-full px-2 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-100 border-gray-300'}`}
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400">Objectives %</label>
//                 <input
//                   type="number"
//                   min="0"
//                   max="100"
//                   value={weight.objectives_weight}
//                   onChange={(e) => {
//                     const newWeights = [...settings.performanceWeights];
//                     const objWeight = parseInt(e.target.value) || 0;
//                     newWeights[index].objectives_weight = objWeight;
//                     newWeights[index].competencies_weight = 100 - objWeight;
//                     setSettings(prev => ({ ...prev, performanceWeights: newWeights }));
//                   }}
//                   className={`w-full px-2 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
//                 />
//               </div>
//               <div>
//                 <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400">Competencies %</label>
//                 <input
//                   type="number"
//                   value={weight.competencies_weight}
//                   readOnly
//                   className={`w-full px-2 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-100 border-gray-300'}`}
//                 />
//               </div>
//               <div className="flex items-end">
//                 <span className="text-xs text-gray-500">ID: {weight.id}</span>
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="mt-4 flex justify-end">
//           <button
//             onClick={handleSaveWeights}
//             disabled={loading}
//             className="px-4 py-1.5 text-xs bg-almet-sapphire text-white rounded hover:bg-almet-astral transition-colors flex items-center disabled:opacity-50"
//           >
//             {loading ? <Loader className="w-3 h-3 mr-1.5 animate-spin" /> : <Save className="w-3 h-3 mr-1.5" />}
//             Save Weights
//           </button>
//         </div>
//       </div>

//       {/* 3. Goal Limits */}
//       <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-5`}>
//         <h3 className="text-sm font-semibold mb-4 pb-3 border-b text-almet-cloud-burst dark:text-almet-mystic">
//           3. Goal Limits
//         </h3>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//           <div>
//             <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400">Minimum Objectives</label>
//             <input
//               type="number"
//               min="1"
//               value={settings.goalLimits.min}
//               onChange={(e) => setSettings(prev => ({
//                 ...prev,
//                 goalLimits: { ...prev.goalLimits, min: parseInt(e.target.value) || 1 }
//               }))}
//               className={`w-full px-3 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
//             />
//           </div>
//           <div>
//             <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400">Maximum Objectives</label>
//             <input
//               type="number"
//               min="1"
//               value={settings.goalLimits.max}
//               onChange={(e) => setSettings(prev => ({
//                 ...prev,
//                 goalLimits: { ...prev.goalLimits, max: parseInt(e.target.value) || 10 }
//               }))}
//               className={`w-full px-3 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
//             />
//           </div>
//         </div>

//         <div className="mt-4 flex justify-end">
//           <button
//             onClick={handleSaveGoalLimits}
//             disabled={loading}
//             className="px-4 py-1.5 text-xs bg-almet-sapphire text-white rounded hover:bg-almet-astral transition-colors flex items-center disabled:opacity-50"
//           >
//             {loading ? <Loader className="w-3 h-3 mr-1.5 animate-spin" /> : <Save className="w-3 h-3 mr-1.5" />}
//             Save Limits
//           </button>
//         </div>
//       </div>

//       {/* 4. Evaluation Scale */}
//       <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-5`}>
//         <h3 className="text-sm font-semibold mb-4 pb-3 border-b text-almet-cloud-burst dark:text-almet-mystic">
//           4. Evaluation Scale
//         </h3>
        
//         <div className="space-y-2">
//           {settings.evaluationScale.map((scale, index) => (
//             <div key={index} className={`grid grid-cols-5 gap-2 p-2 rounded text-xs ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
//               <input
//                 type="text"
//                 value={scale.name}
//                 readOnly
//                 placeholder="Name"
//                 className={`px-2 py-1 border rounded ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-100 border-gray-300'}`}
//               />
//               <input
//                 type="number"
//                 value={scale.value}
//                 onChange={(e) => {
//                   const newScale = [...settings.evaluationScale];
//                   newScale[index].value = parseInt(e.target.value) || 0;
//                   setSettings(prev => ({ ...prev, evaluationScale: newScale }));
//                 }}
//                 placeholder="Value"
//                 className={`px-2 py-1 border rounded ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
//               />
//               <input
//                 type="number"
//                 value={scale.range_min}
//                 onChange={(e) => {
//                   const newScale = [...settings.evaluationScale];
//                   newScale[index].range_min = parseInt(e.target.value) || 0;
//                   setSettings(prev => ({ ...prev, evaluationScale: newScale }));
//                 }}
//                 placeholder="Min%"
//                 className={`px-2 py-1 border rounded ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
//               />
//               <input
//                 type="number"
//                 value={scale.range_max}
//                 onChange={(e) => {
//                   const newScale = [...settings.evaluationScale];
//                   newScale[index].range_max = parseInt(e.target.value) || 0;
//                   setSettings(prev => ({ ...prev, evaluationScale: newScale }));
//                 }}
//                 placeholder="Max%"
//                 className={`px-2 py-1 border rounded ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
//               />
//               <input
//                 type="text"
//                 value={scale.description}
//                 onChange={(e) => {
//                   const newScale = [...settings.evaluationScale];
//                   newScale[index].description = e.target.value;
//                   setSettings(prev => ({ ...prev, evaluationScale: newScale }));
//                 }}
//                 placeholder="Description"
//                 className={`px-2 py-1 border rounded ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
//               />
//             </div>
//           ))}
//         </div>

//         <div className="mt-4 flex justify-end">
//           <button
//             onClick={handleSaveEvaluationScale}
//             disabled={loading}
//             className="px-4 py-1.5 text-xs bg-almet-sapphire text-white rounded hover:bg-almet-astral transition-colors flex items-center disabled:opacity-50"
//           >
//             {loading ? <Loader className="w-3 h-3 mr-1.5 animate-spin" /> : <Save className="w-3 h-3 mr-1.5" />}
//             Save Scale
//           </button>
//         </div>
//       </div>

//       {/* 5. Evaluation Targets */}
//       <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-5`}>
//         <h3 className="text-sm font-semibold mb-4 pb-3 border-b text-almet-cloud-burst dark:text-almet-mystic">
//           5. Evaluation Targets
//         </h3>
        
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
//           <div>
//             <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400">Objective Score Target</label>
//             <input
//               type="number"
//               value={settings.evaluationTargets.objectiveScore}
//               onChange={(e) => setSettings(prev => ({
//                 ...prev,
//                 evaluationTargets: { ...prev.evaluationTargets, objectiveScore: parseInt(e.target.value) || 0 }
//               }))}
//               className={`w-full px-3 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
//             />
//           </div>
//           <div>
//             <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400">Competency Score Target</label>
//             <input
//               type="number"
//               value={settings.evaluationTargets.competencyScore}
//               onChange={(e) => setSettings(prev => ({
//                 ...prev,
//                 evaluationTargets: { ...prev.evaluationTargets, competencyScore: parseInt(e.target.value) || 0 }
//               }))}
//               className={`w-full px-3 py-1.5 text-xs border rounded ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
//             />
//           </div>
//         </div>

//         <div className="mt-4 flex justify-end">
//           <button
//             onClick={handleSaveEvaluationTargets}
//             disabled={loading}
//             className="px-4 py-1.5 text-xs bg-almet-sapphire text-white rounded hover:bg-almet-astral transition-colors flex items-center disabled:opacity-50"
//           >
//             {loading ? <Loader className="w-3 h-3 mr-1.5 animate-spin" /> : <Save className="w-3 h-3 mr-1.5" />}
//             Save Targets
//           </button>
//         </div>
//       </div>
//     </div>
//   );

//   // ==================== MAIN RENDER ====================
  
//   if (loading && !activeYear) {
//     return (
//       <DashboardLayout>
//         <div className="flex items-center justify-center min-h-screen">
//           <div className="text-center">
//             <Loader className="w-12 h-12 animate-spin text-almet-sapphire mx-auto mb-3" />
//             <p className="text-sm text-gray-600">Loading Performance Management System...</p>
//           </div>
//         </div>
//       </DashboardLayout>
//     );
//   }

//   return (
//     <DashboardLayout>
//       <div className={`min-h-screen p-4`}>
//         <div className="mb-4">
//           <h1 className="text-lg font-bold text-almet-cloud-burst dark:text-almet-mystic mb-1">
//             Performance Management System
//           </h1>
//           <p className="text-xs text-gray-600 dark:text-gray-400">
//             Comprehensive performance evaluation and tracking
//           </p>
//         </div>

//         <div className="mb-4 flex gap-2">
//           <button
//             onClick={() => setActiveModule('dashboard')}
//             className={`px-4 py-2 rounded text-xs font-medium transition-colors ${
//               activeModule === 'dashboard'
//                 ? 'bg-almet-sapphire text-white'
//                 : `${darkMode ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-white text-gray-700 border-gray-200'} border hover:bg-almet-mystic`
//             }`}
//           >
//             <BarChart3 className="w-4 h-4 inline mr-1" />
//             Dashboard
//           </button>
          
//           <button
//             onClick={() => setActiveModule('execute')}
//             className={`px-4 py-2 rounded text-xs font-medium transition-colors ${
//               activeModule === 'execute'
//                 ? 'bg-almet-sapphire text-white'
//                 : `${darkMode ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-white text-gray-700 border-gray-200'} border hover:bg-almet-mystic`
//             }`}
//           >
//             <Target className="w-4 h-4 inline mr-1" />
//             Execute
//           </button>
          
//           <button
//             onClick={() => setActiveModule('settings')}
//             className={`px-4 py-2 rounded text-xs font-medium transition-colors ${
//               activeModule === 'settings'
//                 ? 'bg-almet-sapphire text-white'
//                 : `${darkMode ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-white text-gray-700 border-gray-200'} border hover:bg-almet-mystic`
//             }`}
//           >
//             <Settings className="w-4 h-4 inline mr-1" />
//             Settings
//           </button>
//         </div>

//         {activeModule === 'dashboard' && renderDashboardModule()}
//         {activeModule === 'execute' && renderExecuteModule()}
//         {activeModule === 'settings' && renderSettingsModule()}

//         {showNotification && (
//           <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg ${
//             notificationType === 'success' ? 'bg-green-600' :
//             notificationType === 'error' ? 'bg-red-600' :
//             'bg-blue-600'
//           } text-white flex items-center gap-2 z-50 text-xs animate-slide-up`}>
//             {notificationType === 'success' && <CheckCircle className="w-4 h-4" />}
//             {notificationType === 'error' && <XCircle className="w-4 h-4" />}
//             {notificationType === 'info' && <AlertCircle className="w-4 h-4" />}
//             <span>{notificationMessage}</span>
//           </div>
//         )}
//       </div>
//     </DashboardLayout>
//   );
// }