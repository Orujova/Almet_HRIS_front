"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { 
  ChevronDown, Plus, Trash2, Users, Target, Award, BarChart3, Save, Settings, 
  Calendar, FileText, TrendingUp, Star, AlertCircle, Download, Upload, Search, 
  Filter, Eye, Edit, Clock, CheckCircle, XCircle, MessageSquare, Send, 
  RefreshCw, Bell, Flag, Archive, Activity, ChevronRight
} from 'lucide-react';

export default function PerformanceManagementSystem() {
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeModule, setActiveModule] = useState('settings'); // settings, execute, dashboard
  const [selectedYear, setSelectedYear] = useState(2025);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');

  // ==================== SETTINGS STATE ====================
  const [settings, setSettings] = useState({
    // 1. Date Ranges
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
    
    // 4. Performance Weighting by Position Group
    performanceWeights: [
      { positionGroup: 'Executive', objectivesWeight: 80, competenciesWeight: 20 },
      { positionGroup: 'Manager', objectivesWeight: 70, competenciesWeight: 30 },
      { positionGroup: 'Specialist', objectivesWeight: 60, competenciesWeight: 40 },
      { positionGroup: 'Officer', objectivesWeight: 50, competenciesWeight: 50 }
    ],
    
    // 5. Goals Min/Max
    goalLimits: {
      min: 3,
      max: 7
    },
    
    // 6. Notification Templates
    notificationTemplates: [
      { 
        type: 'goal_setting_start', 
        template: 'Goal setting period has started. Please create your objectives by {deadline}.', 
        daysBefore: 0 
      },
      { 
        type: 'goal_setting_reminder', 
        template: 'Reminder: Goal setting deadline is approaching in {days} days.', 
        daysBefore: 7 
      },
      { 
        type: 'mid_year_start', 
        template: 'Mid-year review period has begun. Please complete your review by {deadline}.', 
        daysBefore: 0 
      },
      { 
        type: 'mid_year_end', 
        template: 'Mid-year review period ends in {days} days.', 
        daysBefore: 7 
      },
      { 
        type: 'end_year_start', 
        template: 'End-year review period has started. Please finalize your evaluations.', 
        daysBefore: 0 
      },
      { 
        type: 'end_year_end', 
        template: 'Final deadline for end-year reviews is approaching.', 
        daysBefore: 7 
      },
      { 
        type: 'final_score_announced', 
        template: 'Your final performance score has been announced. Check your dashboard.', 
        daysBefore: 0 
      }
    ],
    
    // 7. Department Objectives
    departmentObjectives: [
      { 
        department: 'HR', 
        objectives: [
          'Bonus & Incentive Model & Performance Management System',
          'Bravo Leadership Journey',
          'Development of Collaborative Corporate Culture',
          'Digitalization and Process Automation',
          'Employee Training and Capability Development'
        ]
      },
      { 
        department: 'IT', 
        objectives: [
          'System Infrastructure Upgrade',
          'Cybersecurity Enhancement',
          'Digital Transformation Projects',
          'IT Support Excellence'
        ]
      },
      { 
        department: 'Sales', 
        objectives: [
          'Revenue Growth Targets',
          'Customer Acquisition',
          'Market Expansion',
          'Sales Process Optimization'
        ]
      }
    ],
    
    // 8. Evaluation Scale
    evaluationScale: [
      { name: 'E--', value: 0, rangeMin: 0, rangeMax: 20, description: 'Does not meet standards & expectations of the job' },
      { name: 'E-', value: 1, rangeMin: 21, rangeMax: 40, description: 'Below standards & expectations of the job' },
      { name: 'E', value: 3, rangeMin: 41, rangeMax: 70, description: 'Meets standards & expectations of the job' },
      { name: 'E+', value: 4, rangeMin: 71, rangeMax: 90, description: 'Exceeds most standards & expectations of the job' },
      { name: 'E++', value: 5, rangeMin: 91, rangeMax: 100, description: 'Outstanding, exceeds all standards & expectations of the job' }
    ],
    
    // 9. Evaluation Score Targets
    evaluationTargets: {
      objectiveScore: 21, // Target score for 100% achievement
      competencyScore: 25  // Target score for 100% achievement (5 competencies * 5 max points)
    },
    
    // 10. Status Types
    statusTypes: [
      { label: 'Not Started', value: 'not_started', color: 'gray' },
      { label: 'In Progress', value: 'in_progress', color: 'blue' },
      { label: 'On Hold', value: 'on_hold', color: 'yellow' },
      { label: 'Completed', value: 'completed', color: 'green' },
      { label: 'Cancelled', value: 'cancelled', color: 'red' }
    ]
  });

  // ==================== SAMPLE DATA ====================
  const employees = [
    { 
      id: 1, 
      name: 'Sultanlı Mədinə Habil qızı', 
      position: 'Senior HR Digitalization Specialist',
      positionGroup: 'Specialist',
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
      positionGroup: 'Specialist',
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
      positionGroup: 'Manager',
      manager: 'Həsənov Elçin Tərlan oğlu', 
      department: 'Sales', 
      division: 'Commercial Operations',
      unit: 'Sales Team',
      badge: 'ASL1914',
      avatar: 'https://ui-avatars.com/api/?name=Məmmədova+Günel&background=336fa5&color=fff'
    }
  ];

  const coreCompetencies = [
    { group: 'Leadership', items: ['Strategic Thinking', 'Decision Making', 'Team Leadership'] },
    { group: 'Professional', items: ['Result Orientation', 'Customer Focus', 'Innovation'] },
    { group: 'Personal', items: ['Integrity', 'Collaboration', 'Continuous Learning'] }
  ];

  // ==================== PERFORMANCE DATA STATE ====================
  const [performanceData, setPerformanceData] = useState({});

  // Initialize performance data for an employee
  const initializePerformanceData = (employeeId, year) => {
    const key = `${employeeId}_${year}`;
    if (!performanceData[key]) {
      const employee = employees.find(e => e.id === employeeId);
      const deptObjectives = settings.departmentObjectives.find(d => d.department === employee?.department)?.objectives || [];
      
      setPerformanceData(prev => ({
        ...prev,
        [key]: {
          year,
          employeeId,
          status: 'draft', // draft, submitted, approved, needs_clarification
          
          // Employee Objectives
          objectives: [
            { 
              id: 1,
              title: '',
              description: '',
              linkedDepartmentObjective: '',
              weight: 0,
              endYearRating: '',
              score: 0,
              progress: 0,
              status: 'not_started',
              isApproved: false,
              needsClarification: false,
              clarificationComments: []
            }
          ],
          
          // Core Competencies
          competencies: coreCompetencies.flatMap(group => 
            group.items.map(item => ({
              group: group.group,
              name: item,
              endYearRating: '',
              score: 0
            }))
          ),
          
          // Development Needs
          developmentNeeds: [],
          
          // Performance Reviews
          reviews: {
            midYear: {
              employeeComment: '',
              managerComment: '',
              submittedDate: null,
              status: 'pending'
            },
            endYear: {
              employeeComment: '',
              managerComment: '',
              submittedDate: null,
              status: 'pending'
            }
          },
          
          // Final Scores
          finalScores: {
            objectivesScore: 0,
            objectivesPercentage: 0,
            competenciesScore: 0,
            competenciesPercentage: 0,
            overallWeightedPercentage: 0,
            finalRating: ''
          },
          
          // Approval workflow
          approvalWorkflow: {
            goalApprovalStatus: 'pending', // pending, approved, needs_clarification
            goalApprovalDate: null,
            finalApprovalStatus: 'pending',
            finalApprovalDate: null,
            clarificationHistory: []
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

  // Calculate objective total weight
  const calculateTotalWeight = (objectives) => {
    return objectives.reduce((sum, obj) => sum + (parseFloat(obj.weight) || 0), 0);
  };

  // Check if can add new objective
  const canAddObjective = (objectives) => {
    const totalWeight = calculateTotalWeight(objectives);
    return objectives.length < settings.goalLimits.max && totalWeight < 100;
  };

  // Calculate objective score
  const calculateObjectiveScore = (objectives) => {
    return objectives.reduce((sum, obj) => {
      if (obj.endYearRating && obj.weight) {
        const rating = settings.evaluationScale.find(s => s.name === obj.endYearRating);
        return sum + ((rating?.value || 0) * (obj.weight / 100) * settings.evaluationTargets.objectiveScore / 5);
      }
      return sum;
    }, 0);
  };

  // Calculate competency score
  const calculateCompetencyScore = (competencies) => {
    return competencies.reduce((sum, comp) => {
      if (comp.endYearRating) {
        const rating = settings.evaluationScale.find(s => s.name === comp.endYearRating);
        return sum + (rating?.value || 0);
      }
      return sum;
    }, 0);
  };

  // Calculate final scores
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

  // Check current period
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

  // ==================== RENDER FUNCTIONS ====================

  // Settings Tab - Complete Admin Configuration
  const renderSettingsModule = () => (
    <div className="space-y-6">
      {/* 1. Date Ranges Configuration */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <h3 className="text-lg font-semibold mb-4 text-almet-cloud-burst dark:text-almet-mystic flex items-center">
          <Calendar className="w-5 h-5 mr-2" />
          1. Performance Period Configuration
        </h3>
        
        {/* Goal Setting Period */}
        <div className="mb-6">
          <h4 className="font-medium mb-3 text-almet-sapphire">Goal Setting Period</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Employee Start Date</label>
              <input
                type="date"
                value={settings.goalSetting.employeeStart}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  goalSetting: { ...prev.goalSetting, employeeStart: e.target.value }
                }))}
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Employee End Date</label>
              <input
                type="date"
                value={settings.goalSetting.employeeEnd}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  goalSetting: { ...prev.goalSetting, employeeEnd: e.target.value }
                }))}
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Manager Start Date</label>
              <input
                type="date"
                value={settings.goalSetting.managerStart}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  goalSetting: { ...prev.goalSetting, managerStart: e.target.value }
                }))}
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Manager End Date</label>
              <input
                type="date"
                value={settings.goalSetting.managerEnd}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  goalSetting: { ...prev.goalSetting, managerEnd: e.target.value }
                }))}
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        </div>

        {/* Mid-Year Review Period */}
        <div className="mb-6">
          <h4 className="font-medium mb-3 text-almet-sapphire">Mid-Year Review Period</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                value={settings.midYearReview.start}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  midYearReview: { ...prev.midYearReview, start: e.target.value }
                }))}
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="date"
                value={settings.midYearReview.end}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  midYearReview: { ...prev.midYearReview, end: e.target.value }
                }))}
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        </div>

        {/* End-Year Review Period */}
        <div>
          <h4 className="font-medium mb-3 text-almet-sapphire">End-Year Review Period</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Date</label>
              <input
                type="date"
                value={settings.endYearReview.start}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  endYearReview: { ...prev.endYearReview, start: e.target.value }
                }))}
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Date</label>
              <input
                type="date"
                value={settings.endYearReview.end}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  endYearReview: { ...prev.endYearReview, end: e.target.value }
                }))}
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Performance Weighting by Position Group */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <h3 className="text-lg font-semibold mb-4 text-almet-cloud-burst dark:text-almet-mystic flex items-center">
          <Target className="w-5 h-5 mr-2" />
          4. Performance Weighting (by Job Role)
        </h3>
        
        <div className="space-y-4">
          {settings.performanceWeights.map((weight, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div>
                <label className="block text-sm font-medium mb-2">Position Group</label>
                <input
                  type="text"
                  value={weight.positionGroup}
                  onChange={(e) => {
                    const newWeights = [...settings.performanceWeights];
                    newWeights[index].positionGroup = e.target.value;
                    setSettings(prev => ({ ...prev, performanceWeights: newWeights }));
                  }}
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Objectives Weight (%)</label>
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
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Competencies Weight (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={weight.competenciesWeight}
                  readOnly
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'} opacity-60`}
                />
              </div>
            </div>
          ))}
          
          <button
            onClick={() => {
              setSettings(prev => ({
                ...prev,
                performanceWeights: [...prev.performanceWeights, { positionGroup: '', objectivesWeight: 70, competenciesWeight: 30 }]
              }));
            }}
            className="flex items-center px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Position Group
          </button>
        </div>
      </div>

      {/* 5. Goal Limits */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <h3 className="text-lg font-semibold mb-4 text-almet-cloud-burst dark:text-almet-mystic flex items-center">
          <Flag className="w-5 h-5 mr-2" />
          5. Goal Configuration (Min/Max Objectives)
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Minimum Objectives</label>
            <input
              type="number"
              min="1"
              value={settings.goalLimits.min}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                goalLimits: { ...prev.goalLimits, min: parseInt(e.target.value) || 1 }
              }))}
              className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Maximum Objectives</label>
            <input
              type="number"
              min="1"
              value={settings.goalLimits.max}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                goalLimits: { ...prev.goalLimits, max: parseInt(e.target.value) || 10 }
              }))}
              className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
            />
          </div>
        </div>
      </div>

      {/* 7. Department Objectives */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <h3 className="text-lg font-semibold mb-4 text-almet-cloud-burst dark:text-almet-mystic flex items-center">
          <Users className="w-5 h-5 mr-2" />
          7. Department Objectives
        </h3>
        
        <div className="space-y-6">
          {settings.departmentObjectives.map((dept, deptIndex) => (
            <div key={deptIndex} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="flex items-center justify-between mb-3">
                <input
                  type="text"
                  value={dept.department}
                  onChange={(e) => {
                    const newDepts = [...settings.departmentObjectives];
                    newDepts[deptIndex].department = e.target.value;
                    setSettings(prev => ({ ...prev, departmentObjectives: newDepts }));
                  }}
                  placeholder="Department Name"
                  className={`flex-1 px-3 py-2 rounded-lg border font-medium ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'}`}
                />
                <button
                  onClick={() => {
                    const newDepts = settings.departmentObjectives.filter((_, i) => i !== deptIndex);
                    setSettings(prev => ({ ...prev, departmentObjectives: newDepts }));
                  }}
                  className="ml-2 p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
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
                      className={`flex-1 px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'}`}
                    />
                    <button
                      onClick={() => {
                        const newDepts = [...settings.departmentObjectives];
                        newDepts[deptIndex].objectives.splice(objIndex, 1);
                        setSettings(prev => ({ ...prev, departmentObjectives: newDepts }));
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
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
                  className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                departmentObjectives: [...prev.departmentObjectives, { department: '', objectives: [''] }]
              }));
            }}
            className="flex items-center px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Department
          </button>
        </div>
      </div>

      {/* 8. Evaluation Scale */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <h3 className="text-lg font-semibold mb-4 text-almet-cloud-burst dark:text-almet-mystic flex items-center">
          <Star className="w-5 h-5 mr-2" />
          8. Evaluation Scale
        </h3>
        
        <div className="space-y-3">
          {settings.evaluationScale.map((scale, index) => (
            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div>
                <label className="block text-xs font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={scale.name}
                  onChange={(e) => {
                    const newScale = [...settings.evaluationScale];
                    newScale[index].name = e.target.value;
                    setSettings(prev => ({ ...prev, evaluationScale: newScale }));
                  }}
                  className={`w-full px-2 py-1 text-sm rounded border ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Value</label>
                <input
                  type="number"
                  value={scale.value}
                  onChange={(e) => {
                    const newScale = [...settings.evaluationScale];
                    newScale[index].value = parseInt(e.target.value) || 0;
                    setSettings(prev => ({ ...prev, evaluationScale: newScale }));
                  }}
                  className={`w-full px-2 py-1 text-sm rounded border ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Range Min (%)</label>
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
                  className={`w-full px-2 py-1 text-sm rounded border ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Range Max (%)</label>
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
                  className={`w-full px-2 py-1 text-sm rounded border ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'}`}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Description</label>
                <input
                  type="text"
                  value={scale.description}
                  onChange={(e) => {
                    const newScale = [...settings.evaluationScale];
                    newScale[index].description = e.target.value;
                    setSettings(prev => ({ ...prev, evaluationScale: newScale }));
                  }}
                  className={`w-full px-2 py-1 text-sm rounded border ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'}`}
                />
              </div>
            </div>
          ))}
          
          <button
            onClick={() => {
              setSettings(prev => ({
                ...prev,
                evaluationScale: [...prev.evaluationScale, { name: '', value: 0, rangeMin: 0, rangeMax: 0, description: '' }]
              }));
            }}
            className="flex items-center px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Scale Item
          </button>
        </div>
      </div>

      {/* 9 & 10. Evaluation Targets and Status Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 9. Evaluation Targets */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <h3 className="text-lg font-semibold mb-4 text-almet-cloud-burst dark:text-almet-mystic flex items-center">
            <Target className="w-5 h-5 mr-2" />
            9. Evaluation Score Targets
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Objective Score Target</label>
              <input
                type="number"
                value={settings.evaluationTargets.objectiveScore}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  evaluationTargets: { ...prev.evaluationTargets, objectiveScore: parseInt(e.target.value) || 0 }
                }))}
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
              <p className="text-xs text-gray-500 mt-1">Target score for 100% achievement</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Competency Score Target</label>
              <input
                type="number"
                value={settings.evaluationTargets.competencyScore}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  evaluationTargets: { ...prev.evaluationTargets, competencyScore: parseInt(e.target.value) || 0 }
                }))}
                className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
              <p className="text-xs text-gray-500 mt-1">Target score for 100% achievement</p>
            </div>
          </div>
        </div>

        {/* 10. Status Types */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <h3 className="text-lg font-semibold mb-4 text-almet-cloud-burst dark:text-almet-mystic flex items-center">
            <Activity className="w-5 h-5 mr-2" />
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
                    setSettings(prev => ({ ...prev, statusTypes: newStatuses }));
                  }}
                  placeholder="Status Label"
                  className={`flex-1 px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                />
                <select
                  value={status.color}
                  onChange={(e) => {
                    const newStatuses = [...settings.statusTypes];
                    newStatuses[index].color = e.target.value;
                    setSettings(prev => ({ ...prev, statusTypes: newStatuses }));
                  }}
                  className={`px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                >
                  <option value="gray">Gray</option>
                  <option value="blue">Blue</option>
                  <option value="yellow">Yellow</option>
                  <option value="green">Green</option>
                  <option value="red">Red</option>
                </select>
                <button
                  onClick={() => {
                    const newStatuses = settings.statusTypes.filter((_, i) => i !== index);
                    setSettings(prev => ({ ...prev, statusTypes: newStatuses }));
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            
            <button
              onClick={() => {
                setSettings(prev => ({
                  ...prev,
                  statusTypes: [...prev.statusTypes, { label: '', value: '', color: 'gray' }]
                }));
              }}
              className="flex items-center px-3 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-sm w-full justify-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Status Type
            </button>
          </div>
        </div>
      </div>

      {/* 6. Notification Templates */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <h3 className="text-lg font-semibold mb-4 text-almet-cloud-burst dark:text-almet-mystic flex items-center">
          <Bell className="w-5 h-5 mr-2" />
          6. Notification Templates
        </h3>
        
        <div className="space-y-4">
          {settings.notificationTemplates.map((template, index) => (
            <div key={index} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">Template Type</label>
                  <input
                    type="text"
                    value={template.type}
                    readOnly
                    className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-200 border-gray-300'} opacity-60`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Days Before</label>
                  <input
                    type="number"
                    min="0"
                    value={template.daysBefore}
                    onChange={(e) => {
                      const newTemplates = [...settings.notificationTemplates];
                      newTemplates[index].daysBefore = parseInt(e.target.value) || 0;
                      setSettings(prev => ({ ...prev, notificationTemplates: newTemplates }));
                    }}
                    className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'}`}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Template Message</label>
                <textarea
                  value={template.template}
                  onChange={(e) => {
                    const newTemplates = [...settings.notificationTemplates];
                    newTemplates[index].template = e.target.value;
                    setSettings(prev => ({ ...prev, notificationTemplates: newTemplates }));
                  }}
                  rows={2}
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-white border-gray-300'}`}
                />
                <p className="text-xs text-gray-500 mt-1">Use {'{deadline}'} for dates and {'{days}'} for day count</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Save Settings Button */}
      <div className="flex justify-center">
        <button
          onClick={() => showNotif('All settings saved successfully!', 'success')}
          className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
        >
          <Save className="w-5 h-5 mr-2" />
          Save All Settings
        </button>
      </div>
    </div>
  );

  // Dashboard Module
  const renderDashboardModule = () => (
    <div className="space-y-6">
      {/* Current Period Indicator */}
      <div className={`${darkMode ? 'bg-gradient-to-r from-blue-900 to-purple-900' : 'bg-gradient-to-r from-blue-600 to-purple-600'} rounded-lg shadow-lg p-6 text-white`}>
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

      {/* Timeline */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <h3 className="text-lg font-semibold mb-4 text-almet-cloud-burst dark:text-almet-mystic flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Performance Timeline
        </h3>
        
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-300 dark:bg-gray-600"></div>
          
          {/* Timeline Items */}
          <div className="space-y-6">
            {/* Goal Setting */}
            <div className="relative flex items-start">
              <div className={`absolute left-8 -ml-3 w-6 h-6 rounded-full ${
                currentPeriod === 'goal_setting' ? 'bg-green-500' : 'bg-gray-400'
              } border-4 ${darkMode ? 'border-gray-800' : 'border-white'}`}></div>
              <div className="ml-20">
                <h4 className="font-semibold text-almet-sapphire">Goal Setting Period</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {settings.goalSetting.employeeStart} - {settings.goalSetting.managerEnd}
                </p>
                <div className="mt-2 text-sm">
                  <span className="text-green-600 font-medium">0 / {employees.length} Completed</span>
                </div>
              </div>
            </div>

            {/* Mid-Year Review */}
            <div className="relative flex items-start">
              <div className={`absolute left-8 -ml-3 w-6 h-6 rounded-full ${
                currentPeriod === 'mid_year' ? 'bg-yellow-500' : 'bg-gray-400'
              } border-4 ${darkMode ? 'border-gray-800' : 'border-white'}`}></div>
              <div className="ml-20">
                <h4 className="font-semibold text-almet-sapphire">Mid-Year Review</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {settings.midYearReview.start} - {settings.midYearReview.end}
                </p>
                <div className="mt-2 text-sm">
                  <span className="text-yellow-600 font-medium">0 / {employees.length} Completed</span>
                </div>
              </div>
            </div>

            {/* End-Year Review */}
            <div className="relative flex items-start">
              <div className={`absolute left-8 -ml-3 w-6 h-6 rounded-full ${
                currentPeriod === 'end_year' ? 'bg-blue-500' : 'bg-gray-400'
              } border-4 ${darkMode ? 'border-gray-800' : 'border-white'}`}></div>
              <div className="ml-20">
                <h4 className="font-semibold text-almet-sapphire">End-Year Review</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {settings.endYearReview.start} - {settings.endYearReview.end}
                </p>
                <div className="mt-2 text-sm">
                  <span className="text-blue-600 font-medium">0 / {employees.length} Completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Process Overview Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-blue-600">0/{employees.length}</span>
          </div>
          <h3 className="font-semibold mb-2">Objective Setting</h3>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{width: '0%'}}></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Employees Completed</p>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 text-yellow-600" />
            <span className="text-2xl font-bold text-yellow-600">0/{employees.length}</span>
          </div>
          <h3 className="font-semibold mb-2">Mid-Year Reviews</h3>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-yellow-600 h-2 rounded-full" style={{width: '0%'}}></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Employees Completed</p>
        </div>

        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex items-center justify-between mb-4">
            <Award className="w-8 h-8 text-green-600" />
            <span className="text-2xl font-bold text-green-600">0/{employees.length}</span>
          </div>
          <h3 className="font-semibold mb-2">End-Year Reviews</h3>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-green-600 h-2 rounded-full" style={{width: '0%'}}></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Employees Completed</p>
        </div>
      </div>

      {/* Employee Cards for Manager View */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
        <h3 className="text-lg font-semibold mb-4 text-almet-cloud-burst dark:text-almet-mystic flex items-center">
          <Users className="w-5 h-5 mr-2" />
          My Team Performance
        </h3>
        
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
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  darkMode ? 'bg-gray-700 border-gray-600 hover:border-almet-sapphire' : 'bg-white border-gray-200 hover:border-almet-sapphire'
                }`}
              >
                <div className="flex items-center mb-3">
                  <img
                    src={employee.avatar}
                    alt={employee.name}
                    className="w-12 h-12 rounded-full mr-3"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{employee.name}</h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{employee.position}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Goals:</span>
                    <span className={data ? 'text-green-600' : 'text-gray-400'}>
                      {data ? '✓ Set' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Mid-Year:</span>
                    <span className="text-gray-400">Pending</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">End-Year:</span>
                    <span className="text-gray-400">Pending</span>
                  </div>
                </div>
                
                <button className="w-full mt-3 px-3 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-sm">
                  View Performance
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Performance Execution Module - Main Performance Management Interface
  const renderExecuteModule = () => {
    if (!selectedEmployee) {
      return (
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-12 text-center`}>
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2 text-gray-600 dark:text-gray-400">
            Select an Employee
          </h3>
          <p className="text-gray-500 dark:text-gray-500 mb-6">
            Choose an employee from the list to manage their performance
          </p>
          
          <div className="max-w-md mx-auto space-y-3">
            {employees.map(employee => (
              <button
                key={employee.id}
                onClick={() => {
                  setSelectedEmployee(employee);
                  initializePerformanceData(employee.id, selectedYear);
                }}
                className={`w-full p-4 rounded-lg border-2 ${darkMode ? 'bg-gray-700 border-gray-600 hover:border-almet-sapphire' : 'bg-white border-gray-200 hover:border-almet-sapphire'} transition-all text-left`}
              >
                <div className="flex items-center">
                  <img
                    src={employee.avatar}
                    alt={employee.name}
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <h4 className="font-semibold">{employee.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{employee.position}</p>
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
    const weightConfig = settings.performanceWeights.find(w => w.positionGroup === selectedEmployee.positionGroup);
    const deptObjectives = settings.departmentObjectives.find(d => d.department === selectedEmployee.department)?.objectives || [];

    return (
      <div className="space-y-6">
        {/* Employee Header */}
        <div className={`${darkMode ? 'bg-gradient-to-r from-blue-900 to-indigo-900' : 'bg-gradient-to-r from-blue-600 to-indigo-600'} rounded-lg shadow-lg p-6 text-white`}>
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
              <div className="text-sm text-blue-200 mt-2">Performance Year</div>
              <div className="font-semibold">{selectedYear}</div>
            </div>
          </div>
        </div>

        {/* Evaluation Scale Reference (Collapsible) */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md overflow-hidden`}>
          <button
            onClick={() => {
              const elem = document.getElementById('eval-scale-content');
              elem.classList.toggle('hidden');
            }}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center">
              <Star className="w-5 h-5 mr-2 text-almet-sapphire" />
              <h3 className="font-semibold">Evaluation Scale Reference</h3>
            </div>
            <ChevronDown className="w-5 h-5" />
          </button>
          
          <div id="eval-scale-content" className="hidden p-4 border-t dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {settings.evaluationScale.map((scale, index) => (
                <div key={index} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700 text-center">
                  <div className={`text-2xl font-bold mb-2 ${
                    scale.name === 'E--' ? 'text-red-600' :
                    scale.name === 'E-' ? 'text-orange-600' :
                    scale.name === 'E' ? 'text-yellow-600' :
                    scale.name === 'E+' ? 'text-blue-600' :
                    'text-green-600'
                  }`}>
                    {scale.name}
                  </div>
                  <div className="text-sm font-semibold mb-1">Value: {scale.value}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                    {scale.rangeMin}% - {scale.rangeMax}%
                  </div>
                  <div className="text-xs">{scale.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 3. Employee Objectives */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-almet-cloud-burst dark:text-almet-mystic flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Employee Objectives
            </h3>
            <div className="flex items-center gap-3">
              <span className={`text-sm font-medium ${totalWeight === 100 ? 'text-green-600' : totalWeight > 100 ? 'text-red-600' : 'text-yellow-600'}`}>
                Total Weight: {totalWeight}% / 100%
              </span>
              {canAddObjective(objectives) && currentPeriod !== 'closed' && (
                <button
                  onClick={() => {
                    const newObjectives = [...objectives, {
                      id: objectives.length + 1,
                      title: '',
                      description: '',
                      linkedDepartmentObjective: '',
                      weight: 0,
                      endYearRating: '',
                      score: 0,
                      progress: 0,
                      status: 'not_started',
                      isApproved: false,
                      needsClarification: false,
                      clarificationComments: []
                    }];
                    
                    setPerformanceData(prev => ({
                      ...prev,
                      [key]: { ...prev[key], objectives: newObjectives }
                    }));
                  }}
                  disabled={totalWeight >= 100}
                  className="flex items-center px-3 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Objective
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {objectives.map((objective, index) => (
              <div key={objective.id} className={`p-4 rounded-lg border-2 ${
                objective.isApproved ? 'border-green-500 bg-green-50 dark:bg-green-900/20' :
                objective.needsClarification ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' :
                'border-gray-200 dark:border-gray-700'
              }`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                  {/* 1. Objective Title */}
                  <div>
                    <label className="block text-sm font-medium mb-2">1. Objective Title *</label>
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
                      disabled={objective.isApproved || currentPeriod === 'closed'}
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} disabled:opacity-60`}
                      placeholder="Enter objective title"
                    />
                  </div>

                  {/* 3. Linked Department Objective */}
                  <div>
                    <label className="block text-sm font-medium mb-2">3. Linked Department Objective</label>
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
                      disabled={objective.isApproved || currentPeriod === 'closed'}
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} disabled:opacity-60`}
                    >
                      <option value="">Select department objective</option>
                      {deptObjectives.map((deptObj, i) => (
                        <option key={i} value={deptObj}>{deptObj}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 2. Description */}
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-2">2. Description *</label>
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
                    disabled={objective.isApproved || currentPeriod === 'closed'}
                    rows={3}
                    className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} disabled:opacity-60`}
                    placeholder="Describe the objective in detail"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-3">
                  {/* 4. Weight */}
                  <div>
                    <label className="block text-sm font-medium mb-2">4. Weight (%)</label>
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
                      disabled={objective.isApproved || currentPeriod === 'closed'}
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} disabled:opacity-60`}
                    />
                  </div>

                  {/* 5. End-Year Rating */}
                  <div>
                    <label className="block text-sm font-medium mb-2">5. End Year Rating</label>
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
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} disabled:opacity-60`}
                    >
                      <option value="">Select rating</option>
                      {settings.evaluationScale.map(scale => (
                        <option key={scale.name} value={scale.name}>{scale.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* 6. Score */}
                  <div>
                    <label className="block text-sm font-medium mb-2">6. Score</label>
                    <input
                      type="text"
                      value={objective.score.toFixed(2)}
                      readOnly
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-100 border-gray-300'} opacity-60`}
                    />
                  </div>

                  {/* 7. Progress */}
                  <div>
                    <label className="block text-sm font-medium mb-2">7. Progress (%)</label>
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
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    />
                  </div>

                  {/* 8. Status */}
                  <div>
                    <label className="block text-sm font-medium mb-2">8. Status</label>
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
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    >
                      {settings.statusTypes.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Approval Section */}
                <div className="flex items-center justify-between pt-3 border-t dark:border-gray-600">
                  <div className="flex items-center gap-2">
                    {objective.isApproved && (
                      <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full text-xs font-medium flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approved
                      </span>
                    )}
                    {objective.needsClarification && (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 rounded-full text-xs font-medium flex items-center">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Needs Clarification
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {currentPeriod === 'mid_year' && !objective.isApproved && (
                      <button
                        onClick={() => {
                          // Manager can cancel this goal during mid-year
                          const newObjectives = objectives.filter((_, i) => i !== index);
                          setPerformanceData(prev => ({
                            ...prev,
                            [key]: { ...prev[key], objectives: newObjectives }
                          }));
                          showNotif('Objective cancelled', 'success');
                        }}
                        className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        Cancel Goal
                      </button>
                    )}
                    
                    {!objective.isApproved && currentPeriod !== 'closed' && (
                      <button
                        onClick={() => {
                          const newObjectives = [...objectives];
                          newObjectives.splice(index, 1);
                          setPerformanceData(prev => ({
                            ...prev,
                            [key]: { ...prev[key], objectives: newObjectives }
                          }));
                        }}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Clarification Comments */}
                {objective.clarificationComments && objective.clarificationComments.length > 0 && (
                  <div className="mt-3 pt-3 border-t dark:border-gray-600">
                    <h5 className="text-sm font-medium mb-2">Clarification History:</h5>
                    <div className="space-y-2">
                      {objective.clarificationComments.map((comment, i) => (
                        <div key={i} className="text-sm p-2 rounded bg-gray-50 dark:bg-gray-700">
                          <span className="font-medium">{comment.from}:</span> {comment.message}
                          <span className="text-xs text-gray-500 ml-2">{comment.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {objectives.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No objectives added yet. Click "Add Objective" to get started.
              </div>
            )}
          </div>

          {/* Objectives Score Summary */}
          {objectives.length > 0 && (
            <div className="mt-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200">Objectives Score</h4>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {calculateObjectiveScore(objectives).toFixed(2)} / {settings.evaluationTargets.objectiveScore}
                  </div>
                  <div className="text-sm text-blue-700 dark:text-blue-300">
                    {((calculateObjectiveScore(objectives) / settings.evaluationTargets.objectiveScore) * 100).toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Save Draft / Submit Buttons */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => {
                showNotif('Objectives saved as draft', 'success');
              }}
              disabled={currentPeriod === 'closed'}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                // Submit for approval
                setPerformanceData(prev => ({
                  ...prev,
                  [key]: { 
                    ...prev[key], 
                    status: 'submitted',
                    approvalWorkflow: {
                      ...prev[key].approvalWorkflow,
                      goalApprovalStatus: 'pending'
                    }
                  }
                }));
                showNotif('Objectives submitted for employee approval', 'success');
              }}
              disabled={currentPeriod === 'closed' || objectives.length < settings.goalLimits.min || totalWeight !== 100}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 mr-2" />
              Submit for Approval
            </button>
          </div>
        </div>

        {/* 4. Core Competencies */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <h3 className="text-lg font-semibold mb-4 text-almet-cloud-burst dark:text-almet-mystic flex items-center">
            <Award className="w-5 h-5 mr-2" />
            Core Competencies
          </h3>

          <div className="space-y-6">
            {coreCompetencies.map((group, groupIndex) => (
              <div key={groupIndex}>
                <h4 className="font-semibold mb-3 text-almet-sapphire">{group.group}</h4>
                <div className="space-y-3">
                  {competencies.filter(c => c.group === group.group).map((comp, index) => {
                    const actualIndex = competencies.findIndex(c => c.name === comp.name && c.group === comp.group);
                    const rating = settings.evaluationScale.find(s => s.name === comp.endYearRating);
                    
                    return (
                      <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-700">
                        <div>
                          <label className="block text-sm font-medium mb-1">Competency</label>
                          <input
                            type="text"
                            value={comp.name}
                            readOnly
                            className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-100 border-gray-300'} opacity-60`}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">End Year Rating</label>
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

                              // Auto-add to development needs if E-- or E-
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
                            className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} disabled:opacity-60`}
                          >
                            <option value="">Select rating</option>
                            {settings.evaluationScale.map(scale => (
                              <option key={scale.name} value={scale.name}>{scale.name}</option>
                            ))}
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium mb-1">Score</label>
                          <input
                            type="text"
                            value={comp.score}
                            readOnly
                            className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-100 border-gray-300'} opacity-60`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Competencies Score Summary */}
          <div className="mt-6 p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-purple-900 dark:text-purple-200">Competencies Score</h4>
              <div className="text-right">
                <div className="text-2xl font-bold text-purple-600">
                  {calculateCompetencyScore(competencies).toFixed(2)} / {settings.evaluationTargets.competencyScore}
                </div>
                <div className="text-sm text-purple-700 dark:text-purple-300">
                  {((calculateCompetencyScore(competencies) / settings.evaluationTargets.competencyScore) * 100).toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Performance Reviews */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <h3 className="text-lg font-semibold mb-4 text-almet-cloud-burst dark:text-almet-mystic flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Performance Reviews
          </h3>

          {/* Mid-Year Review */}
          <div className="mb-6">
            <h4 className="font-semibold mb-3 text-yellow-600 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              Mid-Year Review
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Employee Comment</label>
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
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} disabled:opacity-60`}
                  placeholder="Employee should write their mid-year comments here first..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Manager Comment</label>
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
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} disabled:opacity-60`}
                  placeholder="Manager responds after employee comment..."
                />
              </div>
            </div>
          </div>

          {/* End-Year Review */}
          <div>
            <h4 className="font-semibold mb-3 text-green-600 flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              End-Year Review
            </h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Employee Comment</label>
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
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} disabled:opacity-60`}
                  placeholder="Employee should write their end-year comments here first..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Manager Comment</label>
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
                  className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'} disabled:opacity-60`}
                  placeholder="Manager responds after employee comment..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* 6. Development Needs */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          <h3 className="text-lg font-semibold mb-4 text-almet-cloud-burst dark:text-almet-mystic flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Development Needs (E-- & E- Competencies)
          </h3>

          {developmentNeeds.length > 0 ? (
            <div className="space-y-4">
              {developmentNeeds.map((need, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800">
                  <div>
                    <label className="block text-sm font-medium mb-2">Competency Gap</label>
                    <input
                      type="text"
                      value={need.competencyGap}
                      readOnly
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-100 border-gray-300'} opacity-60`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Development Activity</label>
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
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                      placeholder="What needs to be done"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Progress (%)</label>
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
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Comment</label>
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
                      className={`w-full px-3 py-2 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                      placeholder="Additional notes"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No development needs identified. These will automatically appear when competencies are rated E-- or E-.
            </div>
          )}
        </div>

        {/* Final Performance Summary */}
        {objectives.length > 0 && competencies.some(c => c.endYearRating) && (
          <div className={`${darkMode ? 'bg-gradient-to-r from-indigo-900 to-purple-900' : 'bg-gradient-to-r from-indigo-600 to-purple-600'} rounded-lg shadow-lg p-6 text-white`}>
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Star className="w-6 h-6 mr-2" />
              Final Performance Summary
            </h3>
            
            {(() => {
              const finalScores = calculateFinalScores(data, selectedEmployee);
              
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-sm opacity-80 mb-1">Objectives Score</div>
                    <div className="text-2xl font-bold">{finalScores.objectivesScore}</div>
                    <div className="text-sm opacity-80">{finalScores.objectivesPercentage}%</div>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-sm opacity-80 mb-1">Competencies Score</div>
                    <div className="text-2xl font-bold">{finalScores.competenciesScore}</div>
                    <div className="text-sm opacity-80">{finalScores.competenciesPercentage}%</div>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-sm opacity-80 mb-1">Objectives Weight</div>
                    <div className="text-2xl font-bold">{weightConfig?.objectivesWeight || 70}%</div>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-4">
                    <div className="text-sm opacity-80 mb-1">Competencies Weight</div>
                    <div className="text-2xl font-bold">{weightConfig?.competenciesWeight || 30}%</div>
                  </div>
                  
                  <div className="bg-white/10 rounded-lg p-4">
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
            className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
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
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-almet-cloud-burst dark:text-almet-mystic mb-2">
            Performance Management System
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive performance evaluation and tracking system
          </p>
        </div>

        {/* Module Navigation */}
        <div className="mb-6 flex gap-3">
          <button
            onClick={() => setActiveModule('dashboard')}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
              activeModule === 'dashboard'
                ? 'bg-almet-sapphire text-white'
                : `${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'} hover:bg-almet-astral hover:text-white`
            }`}
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            Dashboard
          </button>
          
          <button
            onClick={() => setActiveModule('execute')}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
              activeModule === 'execute'
                ? 'bg-almet-sapphire text-white'
                : `${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'} hover:bg-almet-astral hover:text-white`
            }`}
          >
            <Target className="w-5 h-5 mr-2" />
            Performance Execution
          </button>
          
          <button
            onClick={() => setActiveModule('settings')}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
              activeModule === 'settings'
                ? 'bg-almet-sapphire text-white'
                : `${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'} hover:bg-almet-astral hover:text-white`
            }`}
          >
            <Settings className="w-5 h-5 mr-2" />
            Settings
          </button>
        </div>

        {/* Module Content */}
        {activeModule === 'dashboard' && renderDashboardModule()}
        {activeModule === 'execute' && renderExecuteModule()}
        {activeModule === 'settings' && renderSettingsModule()}

        {/* Notification Toast */}
        {showNotification && (
          <div className={`fixed bottom-6 right-6 px-6 py-4 rounded-lg shadow-lg ${
            notificationType === 'success' ? 'bg-green-600' :
            notificationType === 'error' ? 'bg-red-600' :
            'bg-blue-600'
          } text-white flex items-center gap-3 animate-slide-up z-50`}>
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