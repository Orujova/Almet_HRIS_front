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