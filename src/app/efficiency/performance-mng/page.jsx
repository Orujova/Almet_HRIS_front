"use client";
import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { 
  ChevronDown, Plus, Trash2, Users, Target, Award, BarChart3, Save, Settings, 
  Calendar, FileText, TrendingUp, Star, AlertCircle, CheckCircle, XCircle, 
  MessageSquare, Send, Bell, Flag, Activity, Edit2, Clock
} from 'lucide-react';

export default function PerformanceManagementSystem() {
  const { darkMode } = useTheme();
  const [activeModule, setActiveModule] = useState('dashboard');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');

  // ==================== SETTINGS STATE ====================
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
    notificationTemplates: [
      { type: 'goal_setting_start', template: 'Goal setting period has started.', daysBefore: 0 },
      { type: 'mid_year_start', template: 'Mid-year review period has begun.', daysBefore: 0 },
      { type: 'end_year_start', template: 'End-year review period has started.', daysBefore: 0 }
    ],
    departmentObjectives: [
      { 
        department: 'HR', 
        objectives: [
          'Bonus & Incentive Model & Performance Management System',
          'Bravo Leadership Journey',
          'Development of Collaborative Corporate Culture'
        ]
      },
      { 
        department: 'IT', 
        objectives: [
          'System Infrastructure Upgrade',
          'Cybersecurity Enhancement',
          'Digital Transformation Projects'
        ]
      },
      { 
        department: 'Sales', 
        objectives: [
          'Revenue Growth Targets',
          'Customer Acquisition',
          'Market Expansion'
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
      { label: 'On Hold', value: 'on_hold' },
      { label: 'Completed', value: 'completed' },
      { label: 'Cancelled', value: 'cancelled' }
    ]
  });

  // ==================== SAMPLE DATA ====================
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
      badge: 'ASL1913',
      avatar: 'https://ui-avatars.com/api/?name=Ahmadov+Rashad&background=4A90E2&color=fff'
    },
    { 
      id: 3, 
      name: 'Məmmədova Günəl Ramiz qızı', 
      position: 'Sales Manager',
      positionGroup: 'Manager',
      manager: 'Həsənov Elçin Tərlan oğlu', 
      department: 'Sales', 
      badge: 'ASL1914',
      avatar: 'https://ui-avatars.com/api/?name=Mammadova+Gunal&background=4A90E2&color=fff'
    }
  ];

  const coreCompetencies = [
    { group: 'Leadership', items: ['Strategic Thinking', 'Decision Making', 'Team Leadership'] },
    { group: 'Professional', items: ['Result Orientation', 'Customer Focus', 'Innovation'] },
    { group: 'Personal', items: ['Integrity', 'Collaboration', 'Continuous Learning'] }
  ];

  // ==================== PERFORMANCE DATA STATE ====================
  const [performanceData, setPerformanceData] = useState({});

  const initializePerformanceData = (employeeId, year) => {
    const key = `${employeeId}_${year}`;
    if (!performanceData[key]) {
      setPerformanceData(prev => ({
        ...prev,
        [key]: {
          year,
          employeeId,
          status: 'draft',
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
            midYear: { employeeComment: '', managerComment: '', status: 'pending' },
            endYear: { employeeComment: '', managerComment: '', status: 'pending' }
          },
          finalScores: {
            objectivesScore: 0,
            objectivesPercentage: 0,
            competenciesScore: 0,
            competenciesPercentage: 0,
            overallWeightedPercentage: 0,
            finalRating: ''
          }
        }
      }));
    }
  };

  // ==================== HELPER FUNCTIONS ====================
  
  const showNotif = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const calculateTotalWeight = (objectives) => {
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
    <div className="space-y-8">
      {/* Date Ranges */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-6`}>
        <h3 className="text-lg font-semibold mb-4 border-b pb-3">1. Performance Period Configuration</h3>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-medium mb-3">Goal Setting Period</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Employee Start Date</label>
                <input
                  type="date"
                  value={settings.goalSetting.employeeStart}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    goalSetting: { ...prev.goalSetting, employeeStart: e.target.value }
                  }))}
                  className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Employee End Date</label>
                <input
                  type="date"
                  value={settings.goalSetting.employeeEnd}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    goalSetting: { ...prev.goalSetting, employeeEnd: e.target.value }
                  }))}
                  className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Manager Start Date</label>
                <input
                  type="date"
                  value={settings.goalSetting.managerStart}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    goalSetting: { ...prev.goalSetting, managerStart: e.target.value }
                  }))}
                  className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Manager End Date</label>
                <input
                  type="date"
                  value={settings.goalSetting.managerEnd}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    goalSetting: { ...prev.goalSetting, managerEnd: e.target.value }
                  }))}
                  className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">Mid-Year Review Period</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Start Date</label>
                <input
                  type="date"
                  value={settings.midYearReview.start}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    midYearReview: { ...prev.midYearReview, start: e.target.value }
                  }))}
                  className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-sm mb-2">End Date</label>
                <input
                  type="date"
                  value={settings.midYearReview.end}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    midYearReview: { ...prev.midYearReview, end: e.target.value }
                  }))}
                  className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                />
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">End-Year Review Period</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-2">Start Date</label>
                <input
                  type="date"
                  value={settings.endYearReview.start}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    endYearReview: { ...prev.endYearReview, start: e.target.value }
                  }))}
                  className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-sm mb-2">End Date</label>
                <input
                  type="date"
                  value={settings.endYearReview.end}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    endYearReview: { ...prev.endYearReview, end: e.target.value }
                  }))}
                  className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => showNotif('Date ranges saved successfully')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Date Ranges
          </button>
        </div>
      </div>

      {/* Performance Weighting */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-6`}>
        <h3 className="text-lg font-semibold mb-4 border-b pb-3">4. Performance Weighting</h3>
        
        <div className="space-y-4">
          {settings.performanceWeights.map((weight, index) => (
            <div key={index} className={`grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div>
                <label className="block text-sm mb-2">Position Group</label>
                <select
                  value={weight.positionGroup}
                  onChange={(e) => {
                    const newWeights = [...settings.performanceWeights];
                    newWeights[index].positionGroup = e.target.value;
                    setSettings(prev => ({ ...prev, performanceWeights: newWeights }));
                  }}
                  className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-600 border-gray-500' : 'border-gray-300'}`}
                >
                  {positionGroups.map(pg => (
                    <option key={pg} value={pg}>{pg}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm mb-2">Objectives Weight (%)</label>
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
                  className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-600 border-gray-500' : 'border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-sm mb-2">Competencies Weight (%)</label>
                <input
                  type="number"
                  value={weight.competenciesWeight}
                  readOnly
                  className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-100 border-gray-300'}`}
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => {
                    const newWeights = settings.performanceWeights.filter((_, i) => i !== index);
                    setSettings(prev => ({ ...prev, performanceWeights: newWeights }));
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4" />
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
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Position Group
          </button>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => showNotif('Performance weights saved')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Weights
          </button>
        </div>
      </div>

      {/* Goal Limits */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-6`}>
        <h3 className="text-lg font-semibold mb-4 border-b pb-3">5. Goal Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-2">Minimum Objectives</label>
            <input
              type="number"
              min="1"
              value={settings.goalLimits.min}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                goalLimits: { ...prev.goalLimits, min: parseInt(e.target.value) || 1 }
              }))}
              className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
            />
          </div>
          <div>
            <label className="block text-sm mb-2">Maximum Objectives</label>
            <input
              type="number"
              min="1"
              value={settings.goalLimits.max}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                goalLimits: { ...prev.goalLimits, max: parseInt(e.target.value) || 10 }
              }))}
              className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => showNotif('Goal limits saved')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Limits
          </button>
        </div>
      </div>

      {/* Department Objectives */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-6`}>
        <h3 className="text-lg font-semibold mb-4 border-b pb-3">7. Department Objectives</h3>
        
        <div className="space-y-6">
          {settings.departmentObjectives.map((dept, deptIndex) => (
            <div key={deptIndex} className={`p-4 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-3">
                <select
                  value={dept.department}
                  onChange={(e) => {
                    const newDepts = [...settings.departmentObjectives];
                    newDepts[deptIndex].department = e.target.value;
                    setSettings(prev => ({ ...prev, departmentObjectives: newDepts }));
                  }}
                  className={`flex-1 px-3 py-2 border rounded-md font-medium ${darkMode ? 'bg-gray-600 border-gray-500' : 'border-gray-300'}`}
                >
                  {departments.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <button
                  onClick={() => {
                    const newDepts = settings.departmentObjectives.filter((_, i) => i !== deptIndex);
                    setSettings(prev => ({ ...prev, departmentObjectives: newDepts }));
                  }}
                  className="ml-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              
              <div className="space-y-2">
                {dept.objectives.map((obj, objIndex) => (
                  <div key={objIndex} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={obj}
                      onChange={(e) => {
                        const newDepts = [...settings.departmentObjectives];
                        newDepts[deptIndex].objectives[objIndex] = e.target.value;
                        setSettings(prev => ({ ...prev, departmentObjectives: newDepts }));
                      }}
                      placeholder="Objective"
                      className={`flex-1 px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-600 border-gray-500' : 'border-gray-300'}`}
                    />
                    <button
                      onClick={() => {
                        const newDepts = [...settings.departmentObjectives];
                        newDepts[deptIndex].objectives.splice(objIndex, 1);
                        setSettings(prev => ({ ...prev, departmentObjectives: newDepts }));
                      }}
                      className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <button
                  onClick={() => {
                    const newDepts = [...settings.departmentObjectives];
                    newDepts[deptIndex].objectives.push('');
                    setSettings(prev => ({ ...prev, departmentObjectives: newDepts }));
                  }}
                  className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm flex items-center"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Objective
                </button>
              </div>
            </div>
          ))}
          
          <button
            onClick={() => {
              setSettings(prev => ({
                ...prev,
                departmentObjectives: [...prev.departmentObjectives, { department: departments[0], objectives: [''] }]
              }));
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Department
          </button>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => showNotif('Department objectives saved')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Departments
          </button>
        </div>
      </div>

      {/* Evaluation Scale */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-6`}>
        <h3 className="text-lg font-semibold mb-4 border-b pb-3">8. Evaluation Scale</h3>
        
        <div className="space-y-3">
          {settings.evaluationScale.map((scale, index) => (
            <div key={index} className={`grid grid-cols-1 md:grid-cols-5 gap-3 p-3 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div>
                <label className="block text-xs mb-1">Name</label>
                <input
                  type="text"
                  value={scale.name}
                  onChange={(e) => {
                    const newScale = [...settings.evaluationScale];
                    newScale[index].name = e.target.value;
                    setSettings(prev => ({ ...prev, evaluationScale: newScale }));
                  }}
                  className={`w-full px-2 py-1 text-sm border rounded-md ${darkMode ? 'bg-gray-600 border-gray-500' : 'border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Value</label>
                <input
                  type="number"
                  value={scale.value}
                  onChange={(e) => {
                    const newScale = [...settings.evaluationScale];
                    newScale[index].value = parseInt(e.target.value) || 0;
                    setSettings(prev => ({ ...prev, evaluationScale: newScale }));
                  }}
                  className={`w-full px-2 py-1 text-sm border rounded-md ${darkMode ? 'bg-gray-600 border-gray-500' : 'border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Range Min (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scale.rangeMin}
                  onChange={(e) => {
                    const newScale = [...settings.evaluationScale];
                    newScale[index].rangeMin = parseInt(e.target.value) || 0;
                    setSettings(prev => ({ ...prev, evaluationScale: newScale }));
                  }}
                  className={`w-full px-2 py-1 text-sm border rounded-md ${darkMode ? 'bg-gray-600 border-gray-500' : 'border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Range Max (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={scale.rangeMax}
                  onChange={(e) => {
                    const newScale = [...settings.evaluationScale];
                    newScale[index].rangeMax = parseInt(e.target.value) || 0;
                    setSettings(prev => ({ ...prev, evaluationScale: newScale }));
                  }}
                  className={`w-full px-2 py-1 text-sm border rounded-md ${darkMode ? 'bg-gray-600 border-gray-500' : 'border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-xs mb-1">Description</label>
                <input
                  type="text"
                  value={scale.description}
                  onChange={(e) => {
                    const newScale = [...settings.evaluationScale];
                    newScale[index].description = e.target.value;
                    setSettings(prev => ({ ...prev, evaluationScale: newScale }));
                  }}
                  className={`w-full px-2 py-1 text-sm border rounded-md ${darkMode ? 'bg-gray-600 border-gray-500' : 'border-gray-300'}`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => showNotif('Evaluation scale saved')}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Scale
          </button>
        </div>
      </div>

      {/* Evaluation Targets & Status Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-6`}>
          <h3 className="text-lg font-semibold mb-4 border-b pb-3">9. Evaluation Targets</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm mb-2">Objective Score Target</label>
              <input
                type="number"
                value={settings.evaluationTargets.objectiveScore}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  evaluationTargets: { ...prev.evaluationTargets, objectiveScore: parseInt(e.target.value) || 0 }
                }))}
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
              />
            </div>
            <div>
              <label className="block text-sm mb-2">Competency Score Target</label>
              <input
                type="number"
                value={settings.evaluationTargets.competencyScore}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  evaluationTargets: { ...prev.evaluationTargets, competencyScore: parseInt(e.target.value) || 0 }
                }))}
                className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => showNotif('Evaluation targets saved')}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Targets
            </button>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-6`}>
          <h3 className="text-lg font-semibold mb-4 border-b pb-3">10. Status Types</h3>
          
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
                  placeholder="Status Label"
                  className={`flex-1 px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                />
                <button
                  onClick={() => {
                    const newStatuses = settings.statusTypes.filter((_, i) => i !== index);
                    setSettings(prev => ({ ...prev, statusTypes: newStatuses }));
                  }}
                  className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  <Trash2 className="w-4 h-4" />
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
              className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm flex items-center w-full justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Status Type
            </button>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => showNotif('Status types saved')}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Statuses
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ==================== DASHBOARD MODULE ====================
  const renderDashboardModule = () => (
    <div className="space-y-6">
      <div className={`${darkMode ? 'bg-blue-900' : 'bg-blue-600'} rounded-lg p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Performance Management {selectedYear}</h2>
            <p className="text-blue-100">
              Current Period: <span className="font-semibold">
                {currentPeriod === 'goal_setting' && 'Goal Setting'}
                {currentPeriod === 'mid_year' && 'Mid-Year Review'}
                {currentPeriod === 'end_year' && 'End-Year Review'}
                {currentPeriod === 'closed' && 'Closed'}
              </span>
            </p>
          </div>
          <Calendar className="w-16 h-16 opacity-50" />
        </div>
      </div>

      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-6`}>
        <h3 className="text-lg font-semibold mb-6">Performance Timeline</h3>
        
        <div className="space-y-6">
          <div className="flex items-start gap-4">
            <div className={`w-4 h-4 rounded-full mt-1 ${currentPeriod === 'goal_setting' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className="flex-1">
              <h4 className="font-semibold">Goal Setting Period</h4>
              <p className="text-sm text-gray-600">{settings.goalSetting.employeeStart} - {settings.goalSetting.managerEnd}</p>
              <div className="mt-2 text-sm">
                <span className="text-green-600 font-medium">0 / {employees.length} Completed</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className={`w-4 h-4 rounded-full mt-1 ${currentPeriod === 'mid_year' ? 'bg-yellow-500' : 'bg-gray-300'}`}></div>
            <div className="flex-1">
              <h4 className="font-semibold">Mid-Year Review</h4>
              <p className="text-sm text-gray-600">{settings.midYearReview.start} - {settings.midYearReview.end}</p>
              <div className="mt-2 text-sm">
                <span className="text-yellow-600 font-medium">0 / {employees.length} Completed</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className={`w-4 h-4 rounded-full mt-1 ${currentPeriod === 'end_year' ? 'bg-blue-500' : 'bg-gray-300'}`}></div>
            <div className="flex-1">
              <h4 className="font-semibold">End-Year Review</h4>
              <p className="text-sm text-gray-600">{settings.endYearReview.start} - {settings.endYearReview.end}</p>
              <div className="mt-2 text-sm">
                <span className="text-blue-600 font-medium">0 / {employees.length} Completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">0/{employees.length}</span>
          </div>
          <h3 className="font-semibold mb-2">Objective Setting</h3>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{width: '0%'}}></div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 text-yellow-600" />
            <span className="text-2xl font-bold text-yellow-600">0/{employees.length}</span>
          </div>
          <h3 className="font-semibold mb-2">Mid-Year Reviews</h3>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-yellow-600 h-2 rounded-full" style={{width: '0%'}}></div>
          </div>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <Award className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-600">0/{employees.length}</span>
          </div>
          <h3 className="font-semibold mb-2">End-Year Reviews</h3>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full" style={{width: '0%'}}></div>
          </div>
        </div>
      </div>

      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-6`}>
        <h3 className="text-lg font-semibold mb-4">My Team Performance</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 hover:border-blue-500' : 'border-gray-200 hover:border-blue-500'} cursor-pointer transition-all`}
              >
                <div className="flex items-center mb-3">
                  <img
                    src={employee.avatar}
                    alt={employee.name}
                    className="w-12 h-12 rounded-full mr-3"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{employee.name}</h4>
                    <p className="text-xs text-gray-600">{employee.position}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Goals:</span>
                    <span className={data ? 'text-green-600' : 'text-gray-400'}>
                      {data ? '✓ Set' : 'Pending'}
                    </span>
                  </div>
                </div>
                
                <button className="w-full mt-3 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                  View Performance
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // ==================== EXECUTE MODULE ====================
  const renderExecuteModule = () => {
    if (!selectedEmployee) {
      return (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-12 text-center`}>
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2 text-gray-600">Select an Employee</h3>
          <p className="text-gray-500 mb-6">Choose an employee to manage their performance</p>
          
          <div className="max-w-md mx-auto space-y-3">
            {employees.map(employee => (
              <button
                key={employee.id}
                onClick={() => {
                  setSelectedEmployee(employee);
                  initializePerformanceData(employee.id, selectedYear);
                }}
                className={`w-full p-4 rounded-lg border ${darkMode ? 'border-gray-700 hover:border-blue-500' : 'border-gray-200 hover:border-blue-500'} transition-all text-left`}
              >
                <div className="flex items-center">
                  <img
                    src={employee.avatar}
                    alt={employee.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <h4 className="font-semibold">{employee.name}</h4>
                    <p className="text-sm text-gray-600">{employee.position}</p>
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
      <div className="space-y-6">
        {/* Employee Header */}
        <div className={`${darkMode ? 'bg-blue-900' : 'bg-blue-600'} rounded-lg p-6 text-white`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img
                src={selectedEmployee.avatar}
                alt={selectedEmployee.name}
                className="w-16 h-16 rounded-full mr-4 border-4 border-white"
              />
              <div>
                <h2 className="text-2xl font-bold">{selectedEmployee.name}</h2>
                <p className="text-blue-100">{selectedEmployee.position}</p>
                <p className="text-sm text-blue-200">{selectedEmployee.department} • {selectedEmployee.badge}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-200">Manager</div>
              <div className="font-semibold">{selectedEmployee.manager}</div>
              <div className="text-sm text-blue-200 mt-2">Year</div>
              <div className="font-semibold">{selectedYear}</div>
            </div>
          </div>
        </div>

        {/* Evaluation Scale Reference */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
          <button
            onClick={() => {
              const elem = document.getElementById('eval-scale');
              elem.classList.toggle('hidden');
            }}
            className={`w-full p-4 flex items-center justify-between ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}
          >
            <div className="flex items-center">
              <Star className="w-5 h-5 mr-2" />
              <h3 className="font-semibold">Evaluation Scale Reference</h3>
            </div>
            <ChevronDown className="w-5 h-5" />
          </button>
          
          <div id="eval-scale" className="hidden p-4 border-t">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {settings.evaluationScale.map((scale, index) => (
                <div key={index} className={`p-3 rounded-md text-center ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="text-2xl font-bold mb-2">{scale.name}</div>
                  <div className="text-sm font-semibold mb-1">Value: {scale.value}</div>
                  <div className="text-xs text-gray-600 mb-2">{scale.rangeMin}% - {scale.rangeMax}%</div>
                  <div className="text-xs">{scale.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Employee Objectives */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Employee Objectives</h3>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${totalWeight === 100 ? 'text-green-600' : totalWeight > 100 ? 'text-red-600' : 'text-yellow-600'}`}>
                Total Weight: {totalWeight}% / 100%
              </span>
              <button
                onClick={() => {
                  if (!canAddObjective(objectives)) {
                    showNotif('Cannot add more objectives', 'error');
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
                // disabled={!canAddObjective(objectives) || currentPeriod === 'closed'}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Objective
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {objectives.map((objective, index) => (
              <div key={objective.id} className={`p-4 border rounded-lg ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
  <div>
                    <label className="block text-sm mb-2">1. Objective Title *</label>
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
                      className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                      placeholder="Enter objective title"
                    />
                  </div>
                <div className="mb-3">
                  <label className="block text-sm mb-2">2. Description *</label>
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
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                    placeholder="Describe the objective"
                  />
                </div>
                

                  <div>
                    <label className="block text-sm mb-2">3. Linked Department Objective</label>
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
                      className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                    >
                      <option value="">Select department objective</option>
                      {deptObjectives.map((deptObj, i) => (
                        <option key={i} value={deptObj}>{deptObj}</option>
                      ))}
                    </select>
                  </div>
                </div>


                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                  <div>
                    <label className="block text-sm mb-2">4. Weight (%)</label>
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
                          showNotif('Total weight cannot exceed 100%', 'error');
                        }
                      }}
                      className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">5. End Year Rating</label>
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
                      className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'} disabled:opacity-60`}
                    >
                      <option value="">Select rating</option>
                      {settings.evaluationScale.map(scale => (
                        <option key={scale.name} value={scale.name}>{scale.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm mb-2">6. Score</label>
                    <input
                      type="text"
                      value={objective.score.toFixed(2)}
                      readOnly
                      className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-100 border-gray-300'}`}
                    />
                  </div>

                  
                  <div>
                    <label className="block text-sm mb-2">7. Progress (%)</label>
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
                      className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2">8. Status</label>
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
                      className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                    >
                      {settings.statusTypes.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  {currentPeriod === 'mid_year' && (
                    <button
                      onClick={() => {
                        const newObjectives = objectives.filter((_, i) => i !== index);
                        setPerformanceData(prev => ({
                          ...prev,
                          [key]: { ...prev[key], objectives: newObjectives }
                        }));
                        showNotif('Objective cancelled', 'success');
                      }}
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                    >
                      Cancel Goal
                    </button>
                  )}
                  
                  {currentPeriod !== 'closed' && (
                    <button
                      onClick={() => {
                        const newObjectives = objectives.filter((_, i) => i !== index);
                        setPerformanceData(prev => ({
                          ...prev,
                          [key]: { ...prev[key], objectives: newObjectives }
                        }));
                      }}
                      className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {objectives.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No objectives added yet. Click "Add Objective" to get started.
              </div>
            )}
          </div>

          {objectives.length > 0 && (
            <div className={`mt-6 p-4 rounded-lg border-2 ${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Objectives Score</h4>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {calculateObjectiveScore(objectives).toFixed(2)} / {settings.evaluationTargets.objectiveScore}
                  </div>
                  <div className="text-sm text-gray-600">
                    {((calculateObjectiveScore(objectives) / settings.evaluationTargets.objectiveScore) * 100).toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => {
                showNotif('Objectives saved as draft', 'success');
              }}
              disabled={currentPeriod === 'closed'}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </button>
            
            <button
              onClick={() => {
                if (objectives.length < settings.goalLimits.min) {
                  showNotif(`Minimum ${settings.goalLimits.min} objectives required`, 'error');
                  return;
                }
                if (totalWeight !== 100) {
                  showNotif('Total weight must equal 100%', 'error');
                  return;
                }
                showNotif('Objectives submitted for approval', 'success');
              }}
              disabled={currentPeriod === 'closed' || objectives.length < settings.goalLimits.min || totalWeight !== 100}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit for Approval
            </button>
          </div>
        </div>

        {/* Core Competencies */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-6`}>
          <h3 className="text-lg font-semibold mb-4">Core Competencies</h3>

          <div className="space-y-6">
            {coreCompetencies.map((group, groupIndex) => (
              <div key={groupIndex}>
                <h4 className="font-medium mb-3">{group.group}</h4>
                <div className="space-y-3">
                  {competencies.filter(c => c.group === group.group).map((comp, index) => {
                    const actualIndex = competencies.findIndex(c => c.name === comp.name && c.group === comp.group);
                    
                    return (
                      <div key={index} className={`grid grid-cols-1 md:grid-cols-3 gap-4 p-3 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                        <div>
                          <label className="block text-sm mb-1">Competency</label>
                          <input
                            type="text"
                            value={comp.name}
                            readOnly
                            className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-100 border-gray-300'}`}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm mb-1">End Year Rating</label>
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
                            className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'} disabled:opacity-60`}
                          >
                            <option value="">Select rating</option>
                            {settings.evaluationScale.map(scale => (
                              <option key={scale.name} value={scale.name}>{scale.name}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm mb-1">Score</label>
                          <input
                            type="text"
                            value={comp.score}
                            readOnly
                            className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-100 border-gray-300'}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className={`mt-6 p-4 rounded-lg border-2 ${darkMode ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'}`}>
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Competencies Score</h4>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">
                  {calculateCompetencyScore(competencies).toFixed(2)} / {settings.evaluationTargets.competencyScore}
                </div>
                <div className="text-sm text-gray-600">
                  {((calculateCompetencyScore(competencies) / settings.evaluationTargets.competencyScore) * 100).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => showNotif('Competencies saved as draft', 'success')}
              disabled={currentPeriod === 'closed'}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 flex items-center"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Draft
            </button>
            
            <button
              onClick={() => showNotif('Competencies submitted', 'success')}
              disabled={currentPeriod === 'closed'}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit
            </button>
          </div>
        </div>

        {/* Performance Reviews */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-6`}>
          <h3 className="text-lg font-semibold mb-4">Performance Reviews</h3>

          <div className="mb-6">
            <h4 className="font-medium mb-3">Mid-Year Review</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Employee Comment</label>
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
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'} disabled:opacity-60`}
                  placeholder="Employee writes comment first..."
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2">Manager Comment</label>
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
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'} disabled:opacity-60`}
                  placeholder="Manager responds after employee..."
                />
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => showNotif('Mid-year review saved as draft', 'success')}
                disabled={currentPeriod !== 'mid_year'}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </button>
              
              <button
                onClick={() => showNotif('Mid-year review submitted', 'success')}
                disabled={currentPeriod !== 'mid_year'}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Review
              </button>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-3">End-Year Review</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-2">Employee Comment</label>
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
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'} disabled:opacity-60`}
                  placeholder="Employee writes comment first..."
                />
              </div>
              
              <div>
                <label className="block text-sm mb-2">Manager Comment</label>
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
                  rows={4}
                  className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'} disabled:opacity-60`}
                  placeholder="Manager responds after employee..."
                />
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              <button
                onClick={() => showNotif('End-year review saved as draft', 'success')}
                disabled={currentPeriod !== 'end_year'}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Draft
              </button>
              
              <button
                onClick={() => showNotif('End-year review submitted', 'success')}
                disabled={currentPeriod !== 'end_year'}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Review
              </button>
            </div>
          </div>
        </div>

        {/* Development Needs */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-6`}>
          <h3 className="text-lg font-semibold mb-4">Development Needs (E-- & E- Competencies)</h3>

          {developmentNeeds.length > 0 ? (
            <div className="space-y-4">
              {developmentNeeds.map((need, index) => (
                <div key={index} className={`grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-lg border-2 ${darkMode ? 'bg-yellow-900/20 border-yellow-800' : 'bg-yellow-50 border-yellow-200'}`}>
                  <div>
                    <label className="block text-sm mb-2">Competency Gap</label>
                    <input
                      type="text"
                      value={need.competencyGap}
                      readOnly
                      className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-100 border-gray-300'}`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-2">Development Activity</label>
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
                      className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                      placeholder="What needs to be done"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-2">Progress (%)</label>
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
                      className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm mb-2">Comment</label>
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
                      className={`w-full px-3 py-2 border rounded-md ${darkMode ? 'bg-gray-700 border-gray-600' : 'border-gray-300'}`}
                      placeholder="Additional notes"
                    />
                  </div>
                </div>
              ))}

              <div className="mt-4">
                <button
                  onClick={() => showNotif('Development needs saved', 'success')}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Development Needs
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No development needs. These will automatically appear when competencies are rated E-- or E-.
            </div>
          )}
        </div>

        {/* Final Performance Summary */}
        {objectives.length > 0 && competencies.some(c => c.endYearRating) && (
          <div className={`${darkMode ? 'bg-blue-900' : 'bg-blue-600'} rounded-lg p-6 text-white`}>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Star className="w-6 h-6 mr-2" />
              Final Performance Summary
            </h3>
            
            {(() => {
              const finalScores = calculateFinalScores(data, selectedEmployee);
              const weightConfig = settings.performanceWeights.find(w => w.positionGroup === selectedEmployee.positionGroup);
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="text-sm opacity-80 mb-1">Objectives Score</div>
                    <div className="text-2xl font-bold">{finalScores.objectivesScore}</div>
                    <div className="text-sm opacity-80">{finalScores.objectivesPercentage}%</div>
                  </div>
                  
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="text-sm opacity-80 mb-1">Competencies Score</div>
                    <div className="text-2xl font-bold">{finalScores.competenciesScore}</div>
                    <div className="text-sm opacity-80">{finalScores.competenciesPercentage}%</div>
                  </div>
                  
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="text-sm opacity-80 mb-1">Objectives Weight</div>
                    <div className="text-2xl font-bold">{weightConfig?.objectivesWeight || 70}%</div>
                  </div>
                  
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="text-sm opacity-80 mb-1">Competencies Weight</div>
                    <div className="text-2xl font-bold">{weightConfig?.competenciesWeight || 30}%</div>
                  </div>
                  
                  <div className="bg-white bg-opacity-20 rounded-lg p-4">
                    <div className="text-sm opacity-80 mb-1">Overall Score</div>
                    <div className="text-3xl font-bold">{finalScores.finalRating}</div>
                    <div className="text-sm opacity-80">{finalScores.overallWeightedPercentage}%</div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Back Button */}
        <div className="flex justify-center">
          <button
            onClick={() => {
              setSelectedEmployee(null);
              setActiveModule('dashboard');
            }}
            className="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  };

  // ==================== MAIN RENDER ====================
  return (
    <DashboardLayout>
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} p-6`}>
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Performance Management System</h1>
          <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
            Comprehensive performance evaluation and tracking system
          </p>
        </div>

        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setActiveModule('dashboard')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeModule === 'dashboard'
                ? 'bg-blue-600 text-white'
                : `${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} hover:bg-gray-50`
            }`}
          >
            <BarChart3 className="w-5 h-5 inline mr-2" />
            Dashboard
          </button>
          
          <button
            onClick={() => setActiveModule('execute')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeModule === 'execute'
                ? 'bg-blue-600 text-white'
                : `${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} hover:bg-gray-50`
            }`}
          >
            <Target className="w-5 h-5 inline mr-2" />
            Performance Execution
          </button>
          
          <button
            onClick={() => setActiveModule('settings')}
            className={`px-6 py-3 rounded-md font-medium transition-colors ${
              activeModule === 'settings'
                ? 'bg-blue-600 text-white'
                : `${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'} border ${darkMode ? 'border-gray-700' : 'border-gray-200'} hover:bg-gray-50`
            }`}
          >
            <Settings className="w-5 h-5 inline mr-2" />
            Settings
          </button>
        </div>

        {activeModule === 'dashboard' && renderDashboardModule()}
        {activeModule === 'execute' && renderExecuteModule()}
        {activeModule === 'settings' && renderSettingsModule()}

        {showNotification && (
          <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-lg ${
            notificationType === 'success' ? 'bg-green-600' :
            notificationType === 'error' ? 'bg-red-600' :
            'bg-blue-600'
          } text-white flex items-center gap-3 z-50`}>
            {notificationType === 'success' && <CheckCircle className="w-5 h-5" />}
            {notificationType === 'error' && <XCircle className="w-5 h-5" />}
            {notificationType === 'info' && <AlertCircle className="w-5 h-5" />}
            <span>{notificationMessage}</span>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 
                   


 