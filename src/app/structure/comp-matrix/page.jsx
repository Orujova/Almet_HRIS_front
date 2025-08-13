'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Save, X, Search, Grid, Target, BarChart3, 
  Download, Upload, ChevronDown, ChevronRight, Loader2, RefreshCw,
  AlertCircle, CheckCircle, Users, FileText, Calendar, Award,
  TrendingUp, Eye, Calculator, Clock, Settings, List
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTheme } from '@/components/common/ThemeProvider';
import { competencyApi } from '@/services/competencyApi';

// Button Component
const ActionButton = ({ onClick, icon: Icon, label, variant = 'primary', disabled = false, loading = false, size = 'md' }) => {
  const { darkMode } = useTheme();
  
  const variants = {
    primary: `bg-almet-sapphire hover:bg-almet-astral text-white`,
    secondary: `bg-almet-bali-hai hover:bg-almet-waterloo text-white`,
    success: `bg-almet-steel-blue hover:bg-almet-astral text-white`,
    danger: `bg-red-500 hover:bg-red-600 text-white`,
    outline: `border-2 border-almet-sapphire text-almet-sapphire hover:bg-almet-sapphire hover:text-white bg-transparent`,
    warning: `bg-yellow-500 hover:bg-yellow-600 text-white`,
  };
  
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-3 py-1.5 text-xs'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        flex items-center gap-2 rounded-lg font-medium transition-all duration-200 
        ${variants[variant]} ${sizes[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
      `}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Icon size={16} />}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

// Input Field Component
const InputField = ({ label, value, onChange, placeholder, type = 'text', required = false, className = '', error = null }) => {
  const { darkMode } = useTheme();
  
  return (
    <div className="space-y-2">
      {label && (
        <label className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
          {label} {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`
          w-full px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all duration-200
          ${error 
            ? 'border-red-400 focus:border-red-500' 
            : `border-gray-200 focus:border-almet-sapphire`
          }
          ${darkMode 
            ? 'bg-almet-cloud-burst text-white placeholder-almet-bali-hai border-almet-comet' 
            : 'bg-white text-almet-cloud-burst placeholder-almet-waterloo'
          }
          focus:outline-none ${className}
        `}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
};

// Select Field Component
const SelectField = ({ label, value, onChange, options, placeholder, required = false, error = null }) => {
  const { darkMode } = useTheme();
  
  return (
    <div className="space-y-2">
      {label && (
        <label className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
          {label} {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        required={required}
        className={`
          w-full px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all duration-200
          ${error 
            ? 'border-red-400 focus:border-red-500' 
            : 'border-gray-200 focus:border-almet-sapphire'
          }
          ${darkMode 
            ? 'bg-almet-cloud-burst text-white border-almet-comet' 
            : 'bg-white text-almet-cloud-burst'
          }
          focus:outline-none
        `}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
};

// Loading Spinner Component
const LoadingSpinner = ({ message = 'Loading...' }) => {
  const { darkMode } = useTheme();
  
  return (
    <div className={`text-center py-12 px-6 rounded-xl ${darkMode ? 'bg-almet-cloud-burst' : 'bg-white'} shadow-lg border-2 ${darkMode ? 'border-almet-comet' : 'border-gray-200'}`}>
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-almet-mystic border-t-almet-sapphire rounded-full animate-spin"></div>
        <div className="space-y-2">
          <h3 className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
            {message}
          </h3>
          <p className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'}`}>
            Please wait while we fetch your data...
          </p>
        </div>
      </div>
    </div>
  );
};

// Error Display Component
const ErrorDisplay = ({ error, onRetry }) => {
  const { darkMode } = useTheme();
  
  return (
    <div className={`text-center py-8 px-4 rounded-lg ${darkMode ? 'bg-almet-cloud-burst' : 'bg-white'} border border-red-200 shadow-md`}>
      <div className="w-12 h-12 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center">
        <X className="w-6 h-6 text-red-500" />
      </div>
      <h3 className={`text-base font-bold mb-2 ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
        Something went wrong
      </h3>
      <p className={`text-xs mb-4 ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} max-w-sm mx-auto`}>
        {error?.message || 'An unexpected error occurred.'}
      </p>
      {onRetry && (
        <ActionButton
          icon={RefreshCw}
          label="Try Again"
          onClick={onRetry}
          variant="primary"
          size="lg"
        />
      )}
    </div>
  );
};

// Stat Card Component
const StatCard = ({ title, value, icon: Icon }) => {
  const { darkMode } = useTheme();
  
  return (
    <div className={`${darkMode ? 'bg-almet-cloud-burst' : 'bg-white'} rounded-lg p-4 border ${darkMode ? 'border-almet-comet' : 'border-gray-200'} shadow-md transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className={`text-xs font-medium ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} uppercase tracking-wide`}>{title}</p>
          <p className={`text-xl font-bold text-almet-sapphire`}>{value}</p>
        </div>
        <div className={`p-2 ${darkMode ? 'bg-almet-comet' : 'bg-almet-mystic'} rounded-lg`}>
          <Icon className={`h-5 w-5 text-almet-sapphire`} />
        </div>
      </div>
    </div>
  );
};

// Success Toast Component
const SuccessToast = ({ message, onClose }) => {
  const { darkMode } = useTheme();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className="fixed bottom-6 right-6 bg-green-50 border-2 border-green-200 rounded-xl p-4 shadow-2xl z-50 max-w-sm">
      <div className="flex items-start gap-3">
        <div className="p-1 bg-green-100 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
        </div>
        <div className="flex-1">
          <h4 className="text-green-800 font-bold text-sm">Success!</h4>
          <p className="text-green-700 text-sm mt-1">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-green-600 hover:text-green-800 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// Assessment Scale Guide Component
const AssessmentScaleGuide = () => {
  const { darkMode } = useTheme();
  
  return (
    <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
      <h4 className={`font-semibold mb-3 flex items-center gap-2 ${darkMode ? 'text-white' : 'text-blue-900'}`}>
        <Award className="w-4 h-4" />
        Assessment Scale Guide
      </h4>
      <div className="space-y-2 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-gray-300 rounded text-center text-xs font-bold">0</span>
          <span className={darkMode ? 'text-almet-bali-hai' : 'text-gray-700'}>Not applicable / No skill</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-red-300 rounded text-center text-xs font-bold">1</span>
          <span className={darkMode ? 'text-almet-bali-hai' : 'text-gray-700'}>Elementary skill / Applies rarely</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-yellow-300 rounded text-center text-xs font-bold">2</span>
          <span className={darkMode ? 'text-almet-bali-hai' : 'text-gray-700'}>Intermediate skill / Applies under control</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-blue-300 rounded text-center text-xs font-bold">3</span>
          <span className={darkMode ? 'text-almet-bali-hai' : 'text-gray-700'}>Proficient skills / Applies independently</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-green-300 rounded text-center text-xs font-bold">4</span>
          <span className={darkMode ? 'text-almet-bali-hai' : 'text-gray-700'}>Profound skill / Applies, delegates and controls others</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 bg-purple-300 rounded text-center text-xs font-bold">5</span>
          <span className={darkMode ? 'text-almet-bali-hai' : 'text-gray-700'}>Expert level / Coaches others</span>
        </div>
      </div>
    </div>
  );
};

// Mock data for demonstration
const mockEmployees = [
  { value: 'john-doe', label: 'John Doe' },
  { value: 'jane-smith', label: 'Jane Smith' },
  { value: 'andrew-roberts', label: 'Andrew Roberts' },
  { value: 'sarah-wilson', label: 'Sarah Wilson' },
];

const mockCompetencyGroups = {
  'GENERAL MANAGEMENT SKILLS': [
    'Strategy Setting',
    'Strategy delegation & execution',
    'Global Steel Market and factors impacting demand and price',
    'Local Steel Market and factors impacting demand and price',
    'Steel Products Portfolio Markets & Application',
    'Price Management',
    'P&L',
    'Project Management',
    'Sales Management & Techniques',
    'Supply Chain Management'
  ],
  'TECHNICAL SKILLS': [
    'Product Knowledge',
    'Quality Control',
    'Manufacturing Processes',
    'Technical Documentation',
    'Equipment Operation'
  ],
  'IT SKILLS': [
    'Software Development',
    'Netsuite Customisation and Optimisation',
    'Netsuite Development (Script, SQL, Workflows)',
    'System Administration',
    'Database Administration'
  ],
  'HSE General': [
    'OHS&E procedures and relevant legislation',
    'Incident investigation / Audit / Reporting',
    'HSE Controls Management',
    'HSE Risk assessment'
  ],
  'SECURITY': [
    'Security risks assessment',
    'Security management systems and software',
    'Security Monitoring',
    'Incident management',
    'Security Control mechanisms',
    'Post incident analysis and mitigation planning'
  ]
};

// Mock saved position assessments
const mockSavedPositionAssessments = [
  {
    id: 'sales-specialist-v1',
    name: 'Sales Specialist',
    createdAt: '2024-01-15',
    lastModified: '2024-01-20',
    scales: {
      'GENERAL MANAGEMENT SKILLS-Strategy Setting': 0,
      'GENERAL MANAGEMENT SKILLS-Strategy delegation & execution': 0,
      'GENERAL MANAGEMENT SKILLS-Global Steel Market and factors impacting demand and price': 3,
      'GENERAL MANAGEMENT SKILLS-Local Steel Market and factors impacting demand and price': 5,
      'GENERAL MANAGEMENT SKILLS-Steel Products Portfolio Markets & Application': 5,
      'GENERAL MANAGEMENT SKILLS-Price Management': 5,
      'GENERAL MANAGEMENT SKILLS-P&L': 3,
      'GENERAL MANAGEMENT SKILLS-Project Management': 3,
      'GENERAL MANAGEMENT SKILLS-Sales Management & Techniques': 5,
      'GENERAL MANAGEMENT SKILLS-Supply Chain Management': 0,
      'TECHNICAL SKILLS-Product Knowledge': 4,
      'TECHNICAL SKILLS-Quality Control': 3,
      'IT SKILLS-Software Development': 0,
      'IT SKILLS-Netsuite Customisation and Optimisation': 0,
      'IT SKILLS-System Administration': 0,
      'HSE General-OHS&E procedures and relevant legislation': 0,
      'SECURITY-Security risks assessment': 0
    }
  },
  {
    id: 'project-manager-v1',
    name: 'Project Manager',
    createdAt: '2024-01-10',
    lastModified: '2024-01-18',
    scales: {
      'GENERAL MANAGEMENT SKILLS-Strategy Setting': 3,
      'GENERAL MANAGEMENT SKILLS-Strategy delegation & execution': 4,
      'GENERAL MANAGEMENT SKILLS-Project Management': 5,
      'GENERAL MANAGEMENT SKILLS-P&L': 4,
      'TECHNICAL SKILLS-Product Knowledge': 3,
      'IT SKILLS-Software Development': 2,
      'HSE General-OHS&E procedures and relevant legislation': 3
    }
  }
];

// Assessment System Component
const CompetencyAssessmentSystem = () => {
  const { darkMode } = useTheme();
  const [currentStep, setCurrentStep] = useState('position-management');
  const [assessmentView, setAssessmentView] = useState('list-positions');
  
  // Position Management States
  const [savedPositionAssessments, setSavedPositionAssessments] = useState(mockSavedPositionAssessments);
  const [isCreatingPosition, setIsCreatingPosition] = useState(false);
  const [newPositionName, setNewPositionName] = useState('');
  const [editingPositionId, setEditingPositionId] = useState(null);
  const [currentPositionScales, setCurrentPositionScales] = useState({});
  
  // Employee Assessment States
  const [selectedPositionAssessment, setSelectedPositionAssessment] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employeeRatings, setEmployeeRatings] = useState({});
  const [expandedGroups, setExpandedGroups] = useState(new Set(['GENERAL MANAGEMENT SKILLS']));

  // Theme classes
  const bgApp = darkMode ? 'bg-gray-900' : 'bg-almet-mystic';
  const bgCard = darkMode ? 'bg-almet-cloud-burst' : 'bg-white';
  const bgCardHover = darkMode ? 'bg-almet-san-juan' : 'bg-gray-50';
  const textPrimary = darkMode ? 'text-white' : 'text-almet-cloud-burst';
  const textSecondary = darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo';
  const borderColor = darkMode ? 'border-almet-comet' : 'border-gray-200';
  const bgAccent = darkMode ? 'bg-almet-comet' : 'bg-almet-mystic';

  // Get current position assessment data
  const currentPositionData = selectedPositionAssessment ? 
    savedPositionAssessments.find(p => p.id === selectedPositionAssessment) : null;

  // Calculate gap analysis
  const gapAnalysis = useMemo(() => {
    if (!currentPositionData) return {};
    
    const gaps = {};
    Object.keys(mockCompetencyGroups).forEach(group => {
      gaps[group] = {};
      mockCompetencyGroups[group].forEach(skill => {
        const positionRating = currentPositionData.scales[`${group}-${skill}`] || 0;
        const employeeRating = employeeRatings[`${group}-${skill}`] || 0;
        gaps[group][skill] = employeeRating - positionRating;
      });
    });
    return gaps;
  }, [currentPositionData, employeeRatings]);

  // Calculate totals
  const totals = useMemo(() => {
    if (!currentPositionData) return { positionTotal: 0, employeeTotal: 0, gapTotal: 0 };
    
    let positionTotal = 0;
    let employeeTotal = 0;
    let gapTotal = 0;

    Object.keys(mockCompetencyGroups).forEach(group => {
      mockCompetencyGroups[group].forEach(skill => {
        const positionRating = currentPositionData.scales[`${group}-${skill}`] || 0;
        const employeeRating = employeeRatings[`${group}-${skill}`] || 0;
        positionTotal += positionRating;
        employeeTotal += employeeRating;
        gapTotal += (employeeRating - positionRating);
      });
    });

    return { positionTotal, employeeTotal, gapTotal };
  }, [currentPositionData, employeeRatings]);

  const handleScaleChange = (group, skill, value, type) => {
    const key = `${group}-${skill}`;
    if (type === 'position') {
      setCurrentPositionScales(prev => ({ ...prev, [key]: parseInt(value) || 0 }));
    } else {
      setEmployeeRatings(prev => ({ ...prev, [key]: parseInt(value) || 0 }));
    }
  };

  const toggleGroupExpansion = (groupName) => {
    setExpandedGroups(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(groupName)) {
        newExpanded.delete(groupName);
      } else {
        newExpanded.add(groupName);
      }
      return newExpanded;
    });
  };

  const getScaleCellStyle = (value) => {
    if (value === 0) return darkMode ? 'bg-almet-comet' : 'bg-gray-100';
    if (value === 1) return 'bg-red-100';
    if (value === 2) return 'bg-yellow-100';
    if (value === 3) return 'bg-blue-100';
    if (value === 4) return 'bg-green-100';
    if (value === 5) return 'bg-purple-100';
    return bgCard;
  };

  const getGapCellStyle = (gap) => {
    if (gap > 0) return 'bg-green-100 text-green-800';
    if (gap < 0) return 'bg-red-100 text-red-800';
    return darkMode ? 'bg-almet-comet text-almet-bali-hai' : 'bg-gray-100 text-gray-800';
  };

  const handleSavePositionAssessment = () => {
    if (!newPositionName.trim()) return;
    
    const newAssessment = {
      id: `${newPositionName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name: newPositionName.trim(),
      createdAt: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      scales: { ...currentPositionScales }
    };
    
    setSavedPositionAssessments(prev => [...prev, newAssessment]);
    setIsCreatingPosition(false);
    setNewPositionName('');
    setCurrentPositionScales({});
    setAssessmentView('list-positions');
  };

  const handleEditPositionAssessment = (positionId) => {
    const position = savedPositionAssessments.find(p => p.id === positionId);
    if (position) {
      setEditingPositionId(positionId);
      setNewPositionName(position.name);
      setCurrentPositionScales(position.scales);
      setIsCreatingPosition(true);
      setAssessmentView('create-position');
    }
  };

  const handleUpdatePositionAssessment = () => {
    if (!editingPositionId || !newPositionName.trim()) return;
    
    setSavedPositionAssessments(prev => prev.map(p => 
      p.id === editingPositionId 
        ? { ...p, name: newPositionName.trim(), scales: { ...currentPositionScales }, lastModified: new Date().toISOString().split('T')[0] }
        : p
    ));
    
    setEditingPositionId(null);
    setIsCreatingPosition(false);
    setNewPositionName('');
    setCurrentPositionScales({});
    setAssessmentView('list-positions');
  };

  const handleDeletePositionAssessment = (positionId) => {
    if (confirm('Are you sure you want to delete this position assessment?')) {
      setSavedPositionAssessments(prev => prev.filter(p => p.id !== positionId));
    }
  };

  const renderPositionManagement = () => {
    if (assessmentView === 'list-positions') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold ${textPrimary}`}>Position Assessment Management</h2>
              <p className={textSecondary}>Create and manage position assessment scales</p>
            </div>
            <ActionButton
              icon={Plus}
              label="Create New Position Assessment"
              onClick={() => {
                setIsCreatingPosition(true);
                setAssessmentView('create-position');
              }}
              variant="primary"
            />
          </div>

          <div className="grid gap-4">
            {savedPositionAssessments.map((position) => (
              <div key={position.id} className={`${bgCard} border ${borderColor} rounded-lg p-6 hover:shadow-md transition-shadow`}>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className={`text-lg font-semibold ${textPrimary}`}>{position.name}</h3>
                    <div className={`flex items-center gap-4 mt-2 text-sm ${textSecondary}`}>
                      <span>Created: {position.createdAt}</span>
                      <span>Modified: {position.lastModified}</span>
                      <span>Competencies: {Object.keys(position.scales).length}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ActionButton
                      icon={Eye}
                      label="Use for Assessment"
                      onClick={() => {
                        setSelectedPositionAssessment(position.id);
                        setCurrentStep('employee-assessment');
                        setAssessmentView('select-employee');
                      }}
                      variant="outline"
                      size="sm"
                    />
                    <ActionButton
                      icon={Edit}
                      label="Edit"
                      onClick={() => handleEditPositionAssessment(position.id)}
                      variant="secondary"
                      size="sm"
                    />
                    <ActionButton
                      icon={Trash2}
                      label="Delete"
                      onClick={() => handleDeletePositionAssessment(position.id)}
                      variant="danger"
                      size="sm"
                    />
                  </div>
                </div>
              </div>
            ))}

            {savedPositionAssessments.length === 0 && (
              <div className={`text-center py-12 ${bgAccent} rounded-lg border-2 border-dashed ${borderColor}`}>
                <Settings className={`w-12 h-12 ${textSecondary} mx-auto mb-4`} />
                <h3 className={`text-lg font-semibold ${textPrimary} mb-2`}>No Position Assessments</h3>
                <p className={`${textSecondary} mb-4`}>Create your first position assessment to get started</p>
                <ActionButton
                  icon={Plus}
                  label="Create Position Assessment"
                  onClick={() => {
                    setIsCreatingPosition(true);
                    setAssessmentView('create-position');
                  }}
                  variant="primary"
                />
              </div>
            )}
          </div>
        </div>
      );
    }

    if (assessmentView === 'create-position') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold ${textPrimary}`}>
                {editingPositionId ? 'Edit Position Assessment' : 'Create Position Assessment'}
              </h2>
              <p className={textSecondary}>Define competency requirements for this position</p>
            </div>
            <div className="flex gap-2">
              <ActionButton
                icon={X}
                label="Cancel"
                onClick={() => {
                  setIsCreatingPosition(false);
                  setEditingPositionId(null);
                  setNewPositionName('');
                  setCurrentPositionScales({});
                  setAssessmentView('list-positions');
                }}
                variant="outline"
              />
              <ActionButton
                icon={Save}
                label={editingPositionId ? 'Update' : 'Save'}
                onClick={editingPositionId ? handleUpdatePositionAssessment : handleSavePositionAssessment}
                disabled={!newPositionName.trim()}
                variant="success"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <InputField
                label="Position Name"
                value={newPositionName}
                onChange={(e) => setNewPositionName(e.target.value)}
                placeholder="Enter position name"
                required
              />
              <div className="mt-4">
                <AssessmentScaleGuide />
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className={`${bgCard} rounded-lg border ${borderColor} overflow-hidden`}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className={bgAccent}>
                      <tr>
                        <th className={`px-4 py-3 text-left text-sm font-semibold ${textPrimary} border-r ${borderColor}`}>
                          Competency
                        </th>
                        <th className={`px-4 py-3 text-center text-sm font-semibold ${textPrimary} w-32`}>
                          Required Level
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${borderColor}`}>
                      {Object.keys(mockCompetencyGroups).map(group => (
                        <React.Fragment key={group}>
                          <tr className="bg-almet-sapphire text-white">
                            <td colSpan="2" className="px-4 py-3">
                              <button
                                onClick={() => toggleGroupExpansion(group)}
                                className="flex items-center gap-2 w-full text-left font-semibold"
                              >
                                {expandedGroups.has(group) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                {group}
                              </button>
                            </td>
                          </tr>
                          {expandedGroups.has(group) && mockCompetencyGroups[group].map(skill => (
                            <tr key={`${group}-${skill}`} className={`hover:${bgCardHover}`}>
                              <td className={`px-4 py-3 text-sm ${textPrimary} border-r ${borderColor}`}>
                                {skill}
                              </td>
                              <td className={`px-4 py-3 text-center ${getScaleCellStyle(currentPositionScales[`${group}-${skill}`])}`}>
                                <select
                                  value={currentPositionScales[`${group}-${skill}`] || 0}
                                  onChange={(e) => handleScaleChange(group, skill, e.target.value, 'position')}
                                  className={`w-20 px-2 py-1 border ${borderColor} rounded text-sm text-center ${bgCard} ${textPrimary}`}
                                >
                                  {[0, 1, 2, 3, 4, 5].map(num => (
                                    <option key={num} value={num}>{num}</option>
                                  ))}
                                </select>
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderEmployeeAssessment = () => {
    if (assessmentView === 'select-employee') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className={`text-2xl font-bold ${textPrimary} mb-2`}>Create Employee Assessment</h2>
            <p className={textSecondary}>
              Position: <span className="font-semibold text-almet-sapphire">
                {currentPositionData?.name}
              </span>
            </p>
          </div>

          <div className="max-w-md mx-auto space-y-4">
            <SelectField
              label="Select Employee"
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              options={mockEmployees}
              placeholder="Choose an employee"
              required
            />

            <AssessmentScaleGuide />

            <div className="flex gap-3">
              <ActionButton
                icon={ChevronRight}
                label="Start Assessment"
                onClick={() => setAssessmentView('conduct-assessment')}
                disabled={!selectedEmployee}
                variant="primary"
                size="lg"
              />
            </div>
          </div>
        </div>
      );
    }

    if (assessmentView === 'conduct-assessment') {
      return (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold ${textPrimary}`}>Employee Assessment</h2>
              <p className={textSecondary}>
                Position: <span className="font-semibold text-almet-sapphire">{currentPositionData?.name}</span> | 
                Employee: <span className="font-semibold text-almet-sapphire">
                  {mockEmployees.find(e => e.value === selectedEmployee)?.label}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <ActionButton
                icon={Download}
                label="Export Results"
                variant="outline"
              />
            </div>
          </div>

          <div className={`${bgCard} rounded-lg border ${borderColor} overflow-hidden`}>
            <div className="bg-almet-sapphire text-white p-4">
              <h3 className="font-semibold">Position Assessment</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className={bgAccent}>
                  <tr>
                    <th className={`px-4 py-3 text-left text-sm font-semibold ${textPrimary} border-r ${borderColor}`}>
                      LIST OF COMPETENCIES / ASSESSMENT SCALE
                    </th>
                    <th className={`px-4 py-3 text-center text-sm font-semibold ${textPrimary} w-32 border-r ${borderColor}`}>
                      POSITION ASSESSMENT<br/>
                      <span className="text-xs font-normal">5</span>
                    </th>
                    <th className={`px-4 py-3 text-center text-sm font-semibold ${textPrimary} w-32 border-r ${borderColor}`}>
                      EMPLOYEES ASSESSMENT<br/>
                      <span className="text-xs font-normal">5</span>
                    </th>
                    <th className={`px-4 py-3 text-center text-sm font-semibold ${textPrimary} w-32`}>
                      GAP ANALYSIS<br/>
                      <span className="text-xs font-normal">5</span>
                    </th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${borderColor}`}>
                  <tr className={bgAccent}>
                    <td className={`px-4 py-2 text-xs ${textSecondary} border-r ${borderColor}`}>
                      <div className="space-y-1">
                        <div>"0" - not applicable / no skill</div>
                        <div>"1" - elementary skill / applies rarely</div>
                        <div>"2" - intermediate skill / applies under control</div>
                        <div>"3" - proficient skills / applies independently</div>
                        <div>"4" - profound skill / applies, delegates and controls others</div>
                        <div>"5" - expert level / coaches others</div>
                      </div>
                    </td>
                    <td className={`border-r ${borderColor}`}></td>
                    <td className={`border-r ${borderColor} text-center text-sm`}>
                      <div className="transform -rotate-90 py-8">
                        {mockEmployees.find(e => e.value === selectedEmployee)?.label}
                      </div>
                    </td>
                    <td className="text-center text-sm">
                      <div className="transform -rotate-90 py-8">
                        {mockEmployees.find(e => e.value === selectedEmployee)?.label}
                      </div>
                    </td>
                  </tr>
                  
                  {Object.keys(mockCompetencyGroups).map(group => {
                    const groupPositionTotal = mockCompetencyGroups[group].reduce((sum, skill) => 
                      sum + (currentPositionData?.scales[`${group}-${skill}`] || 0), 0);
                    const groupEmployeeTotal = mockCompetencyGroups[group].reduce((sum, skill) => 
                      sum + (employeeRatings[`${group}-${skill}`] || 0), 0);
                    const groupGap = groupEmployeeTotal - groupPositionTotal;
                    
                    return (
                      <React.Fragment key={group}>
                        <tr className="bg-almet-sapphire text-white">
                          <td className={`px-4 py-3 font-semibold border-r ${borderColor}`}>
                            <button
                              onClick={() => toggleGroupExpansion(group)}
                              className="flex items-center gap-2 w-full text-left"
                            >
                              {expandedGroups.has(group) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                              {group}
                            </button>
                          </td>
                          <td className={`px-4 py-3 text-center font-bold border-r ${borderColor}`}>
                            {groupPositionTotal}
                          </td>
                          <td className={`px-4 py-3 text-center font-bold border-r ${borderColor}`}>
                            {groupEmployeeTotal}
                          </td>
                          <td className="px-4 py-3 text-center font-bold">
                            {groupGap > 0 ? '+' : ''}{groupGap}
                          </td>
                        </tr>
                        {expandedGroups.has(group) && mockCompetencyGroups[group].map(skill => {
                          const positionValue = currentPositionData?.scales[`${group}-${skill}`] || 0;
                          const employeeValue = employeeRatings[`${group}-${skill}`] || 0;
                          const gap = employeeValue - positionValue;
                          
                          return (
                            <tr key={`${group}-${skill}`} className={`hover:${bgCardHover}`}>
                              <td className={`px-4 py-3 text-sm ${textPrimary} border-r ${borderColor}`}>
                                {skill}
                              </td>
                              <td className={`px-4 py-3 text-center border-r ${borderColor} ${getScaleCellStyle(positionValue)}`}>
                                <span className="font-semibold">{positionValue}</span>
                              </td>
                              <td className={`px-4 py-3 text-center border-r ${borderColor} ${getScaleCellStyle(employeeValue)}`}>
                                <select
                                  value={employeeValue}
                                  onChange={(e) => handleScaleChange(group, skill, e.target.value, 'employee')}
                                  className={`w-20 px-2 py-1 border ${borderColor} rounded text-sm text-center ${bgCard} ${textPrimary}`}
                                >
                                  {[0, 1, 2, 3, 4, 5].map(num => (
                                    <option key={num} value={num}>{num}</option>
                                  ))}
                                </select>
                              </td>
                              <td className={`px-4 py-3 text-center font-semibold ${getGapCellStyle(gap)}`}>
                                {positionValue === 0 && employeeValue === 0 ? 'FALSE' : 
                                 (gap > 0 ? '+' : '') + gap}
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                  
                  <tr className={`${bgAccent} font-bold`}>
                    <td className={`px-4 py-3 border-r ${borderColor}`}>TOTAL</td>
                    <td className={`px-4 py-3 text-center border-r ${borderColor}`}>{totals.positionTotal}</td>
                    <td className={`px-4 py-3 text-center border-r ${borderColor}`}>{totals.employeeTotal}</td>
                    <td className={`px-4 py-3 text-center ${getGapCellStyle(totals.gapTotal)}`}>
                      {totals.gapTotal > 0 ? '+' : ''}{totals.gapTotal}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const renderBehavioralAssessment = () => (
    <div className="text-center py-16">
      <div className="max-w-md mx-auto space-y-6">
        <div className={`w-24 h-24 mx-auto ${bgAccent} rounded-full flex items-center justify-center`}>
          <Grid className={`w-12 h-12 ${textSecondary}`} />
        </div>
        <div className="space-y-3">
          <h2 className={`text-2xl font-bold ${textPrimary}`}>Behavioral Competency Assessment</h2>
          <p className={textSecondary}>
            Create comprehensive behavioral competency assessments for employee development
          </p>
        </div>
        <div className={`${darkMode ? 'bg-yellow-900 border-yellow-700' : 'bg-yellow-50 border-yellow-200'} border rounded-lg p-6`}>
          <div className="flex items-center gap-3 justify-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="text-left">
              <h3 className="font-semibold text-yellow-800">Coming Soon</h3>
              <p className="text-sm text-yellow-700">
                Behavioral competency assessment functionality is under development
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <ActionButton
            icon={Target}
            label="Switch to Core Competencies"
            onClick={() => setCurrentStep('position-management')}
            variant="primary"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Assessment Navigation */}
      <nav className={`${bgCard} rounded-lg p-2 shadow-sm border ${borderColor}`}>
        <div className="flex space-x-2">
          <button
            onClick={() => {
              setCurrentStep('position-management');
              setAssessmentView('list-positions');
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              currentStep === 'position-management'
                ? 'bg-almet-sapphire text-white shadow-md'
                : `${textSecondary} hover:${textPrimary} hover:${bgCardHover}`
            }`}
          >
            <Settings size={20} />
            <span>Position Assessment Management</span>
          </button>
          <button
            onClick={() => {
              setCurrentStep('employee-assessment');
              setAssessmentView('select-position');
            }}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              currentStep === 'employee-assessment'
                ? 'bg-almet-sapphire text-white shadow-md'
                : `${textSecondary} hover:${textPrimary} hover:${bgCardHover}`
            }`}
          >
            <Target size={20} />
            <span>Create Employee Assessment</span>
          </button>
          <button
            onClick={() => setCurrentStep('behavioral-assessment')}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              currentStep === 'behavioral-assessment'
                ? 'bg-almet-sapphire text-white shadow-md'
                : `${textSecondary} hover:${textPrimary} hover:${bgCardHover}`
            }`}
          >
            <Grid size={20} />
            <span>Behavioral Competencies</span>
          </button>
        </div>
      </nav>

      {/* Breadcrumb for Employee Assessment */}
      {currentStep === 'employee-assessment' && (
        <nav className={`${bgCard} rounded-lg p-4 shadow-sm border ${borderColor}`}>
          <div className="flex items-center space-x-2 text-sm">
            <button
              onClick={() => setAssessmentView('select-position')}
              className={`px-3 py-1 rounded ${assessmentView === 'select-position' ? 'bg-almet-sapphire text-white' : textSecondary + ' hover:' + textPrimary}`}
            >
              1. Select Position Assessment
            </button>
            <ChevronRight size={16} className={textSecondary} />
            <button
              onClick={() => assessmentView !== 'select-position' && setAssessmentView('select-employee')}
              className={`px-3 py-1 rounded ${assessmentView === 'select-employee' ? 'bg-almet-sapphire text-white' : 
                (assessmentView === 'select-position' ? textSecondary + ' cursor-not-allowed' : textSecondary + ' hover:' + textPrimary)}`}
              disabled={assessmentView === 'select-position'}
            >
              2. Select Employee
            </button>
            <ChevronRight size={16} className={textSecondary} />
            <span className={`px-3 py-1 rounded ${assessmentView === 'conduct-assessment' ? 'bg-green-600 text-white' : textSecondary}`}>
              3. Conduct Assessment
            </span>
          </div>
        </nav>
      )}

      {/* Content */}
      <div>
        {currentStep === 'position-management' && renderPositionManagement()}
        {currentStep === 'employee-assessment' && (
          <>
            {assessmentView === 'select-position' && (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className={`text-2xl font-bold ${textPrimary} mb-2`}>Select Position Assessment</h2>
                  <p className={textSecondary}>Choose from existing position assessments</p>
                </div>

                <div className="max-w-2xl mx-auto space-y-4">
                  <SelectField
                    label="Select Position Assessment"
                    value={selectedPositionAssessment}
                    onChange={(e) => setSelectedPositionAssessment(e.target.value)}
                    options={savedPositionAssessments.map(p => ({ value: p.id, label: p.name }))}
                    placeholder="Choose a position assessment"
                    required
                  />

                  {selectedPositionAssessment && (
                    <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
                      <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-blue-900'}`}>Assessment Details</h4>
                      <div className={`text-sm space-y-1 ${darkMode ? 'text-almet-bali-hai' : 'text-blue-800'}`}>
                        <p>Position: {currentPositionData?.name}</p>
                        <p>Created: {currentPositionData?.createdAt}</p>
                        <p>Competencies defined: {Object.keys(currentPositionData?.scales || {}).length}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3 justify-center">
                    <ActionButton
                      icon={ChevronRight}
                      label="Next: Select Employee"
                      onClick={() => setAssessmentView('select-employee')}
                      disabled={!selectedPositionAssessment}
                      variant="primary"
                      size="lg"
                    />
                  </div>
                </div>
              </div>
            )}
            {assessmentView !== 'select-position' && renderEmployeeAssessment()}
          </>
        )}
        {currentStep === 'behavioral-assessment' && renderBehavioralAssessment()}
      </div>

      {/* Footer Notes */}
      {currentStep === 'employee-assessment' && assessmentView === 'conduct-assessment' && (
        <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-blue-50 border-blue-200'} border rounded-lg p-4`}>
          <h4 className={`font-semibold mb-2 ${darkMode ? 'text-white' : 'text-blue-900'}`}>Notes:</h4>
          <ul className={`text-sm space-y-1 ${darkMode ? 'text-almet-bali-hai' : 'text-blue-800'}`}>
            <li>• Position Assessment scales are pre-defined and reusable across multiple employee assessments.</li>
            <li>• After employee assessment, skill gaps will emerge automatically.</li>
            <li>• Assessment Scale guide is displayed to show evaluation criteria.</li>
            <li>• Export functionality is available for reports and documentation.</li>
          </ul>
        </div>
      )}
    </div>
  );
};


// Main Component
const CompetencyMatrixSystem = () => {
  const { darkMode } = useTheme();
  
  // States
  const [activeView, setActiveView] = useState('skills');
  const [editMode, setEditMode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddGroupForm, setShowAddGroupForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [newItem, setNewItem] = useState({ group: '', item: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Data States
  const [skillGroups, setSkillGroups] = useState([]);
  const [behavioralGroups, setBehavioralGroups] = useState([]);
  const [skillsData, setSkillsData] = useState({});
  const [behavioralData, setBehavioralData] = useState({});

  // Theme classes
  const bgApp = darkMode ? 'bg-gray-900' : 'bg-almet-mystic';
  const bgCard = darkMode ? 'bg-almet-cloud-burst' : 'bg-white';
  const bgCardHover = darkMode ? 'bg-almet-san-juan' : 'bg-gray-50';
  const textPrimary = darkMode ? 'text-white' : 'text-almet-cloud-burst';
  const textSecondary = darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo';
  const borderColor = darkMode ? 'border-almet-comet' : 'border-gray-200';
  const bgAccent = darkMode ? 'bg-almet-comet' : 'bg-almet-mystic';

  // Data fetching
  const fetchData = async () => {
    setDataLoading(true);
    setError(null);
    
    try {
      const [skillGroupsResponse, behavioralGroupsResponse] = await Promise.all([
        competencyApi.skillGroups.getAll(),
        competencyApi.behavioralGroups.getAll()
      ]);

      const skillGroupsList = skillGroupsResponse.results || [];
      const behavioralGroupsList = behavioralGroupsResponse.results || [];

      setSkillGroups(skillGroupsList);
      setBehavioralGroups(behavioralGroupsList);

      // Fetch detailed data for each group
      const skillGroupsDetails = await Promise.all(
        skillGroupsList.map(group => competencyApi.skillGroups.getById(group.id))
      );

      const behavioralGroupsDetails = await Promise.all(
        behavioralGroupsList.map(group => competencyApi.behavioralGroups.getById(group.id))
      );

      // Transform data
      const transformedSkillsData = {};
      skillGroupsDetails.forEach(group => {
        transformedSkillsData[group.name] = group.skills?.map(skill => ({
          id: skill.id,
          name: skill.name,
          created_at: skill.created_at,
          updated_at: skill.updated_at
        })) || [];
      });

      const transformedBehavioralData = {};
      behavioralGroupsDetails.forEach(group => {
        transformedBehavioralData[group.name] = group.competencies?.map(comp => ({
          id: comp.id,
          name: comp.name,
          created_at: comp.created_at,
          updated_at: comp.updated_at
        })) || [];
      });

      setSkillsData(transformedSkillsData);
      setBehavioralData(transformedBehavioralData);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper functions
  const showSuccess = (message) => {
    setSuccessMessage(message);
  };

  const findGroupByName = (groupName) => {
    const groups = activeView === 'skills' ? skillGroups : behavioralGroups;
    return groups.find(g => g.name === groupName);
  };

  // Filter data
  const getFilteredData = (data) => {
    if (!data) return {};
    let filtered = { ...data };
    
    if (selectedGroup) {
      filtered = { [selectedGroup]: data[selectedGroup] || [] };
    }
    
    if (searchTerm) {
      const searchFiltered = {};
      Object.keys(filtered).forEach((group) => {
        const items = filtered[group].filter((item) => {
          const itemName = typeof item === 'string' ? item : item.name;
          return (
            itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            group.toLowerCase().includes(searchTerm.toLowerCase())
          );
        });
        if (items.length > 0) {
          searchFiltered[group] = items;
        }
      });
      filtered = searchFiltered;
    }
    
    return filtered;
  };

  const currentData = activeView === 'skills' ? skillsData : behavioralData;
  const setCurrentData = activeView === 'skills' ? setSkillsData : setBehavioralData;
  const filteredData = getFilteredData(currentData);

  // Event handlers
  const handleAddItem = async () => {
    if (!newItem.group || !newItem.item) return;
    
    setIsLoading(true);
    try {
      const group = findGroupByName(newItem.group);
      if (!group) {
        throw new Error('Group not found');
      }

      if (activeView === 'skills') {
        await competencyApi.skills.create({
          group: group.id,
          name: newItem.item
        });
      } else {
        await competencyApi.behavioralCompetencies.create({
          group: group.id,
          name: newItem.item
        });
      }

      await fetchData();
      setNewItem({ group: '', item: '', description: '' });
      setShowAddForm(false);
      showSuccess(`${newItem.item} successfully added to ${newItem.group}`);
    } catch (error) {
      console.error('Error adding item:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return;
    
    setIsLoading(true);
    try {
      if (activeView === 'skills') {
        await competencyApi.skillGroups.create({ name: newGroupName.trim() });
      } else {
        await competencyApi.behavioralGroups.create({ name: newGroupName.trim() });
      }

      await fetchData();
      setNewGroupName('');
      setShowAddGroupForm(false);
      showSuccess(`Group "${newGroupName.trim()}" successfully created`);
    } catch (error) {
      console.error('Error adding group:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGroup = async (groupName) => {
    if (!confirm(`Are you sure you want to delete "${groupName}" and all its items?`)) return;
    
    setIsLoading(true);
    try {
      const group = findGroupByName(groupName);
      if (!group) {
        throw new Error('Group not found');
      }

      if (activeView === 'skills') {
        await competencyApi.skillGroups.delete(group.id);
      } else {
        await competencyApi.behavioralGroups.delete(group.id);
      }

      await fetchData();
      if (selectedGroup === groupName) setSelectedGroup('');
      setExpandedGroups((prev) => {
        const newExpanded = new Set(prev);
        newExpanded.delete(groupName);
        return newExpanded;
      });
      showSuccess(`Group "${groupName}" successfully deleted`);
    } catch (error) {
      console.error('Error deleting group:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (group, itemIndex) => {
    const item = currentData[group][itemIndex];
    const itemId = typeof item === 'object' ? item.id : null;
    
    if (!itemId) {
      setCurrentData((prev) => ({
        ...prev,
        [group]: prev[group].filter((_, index) => index !== itemIndex),
      }));
      return;
    }

    setIsLoading(true);
    try {
      if (activeView === 'skills') {
        await competencyApi.skills.delete(itemId);
      } else {
        await competencyApi.behavioralCompetencies.delete(itemId);
      }
      
      await fetchData();
      showSuccess('Item successfully deleted');
    } catch (error) {
      console.error('Error deleting item:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditItem = async (group, itemIndex, newValue) => {
    const item = currentData[group][itemIndex];
    const itemId = typeof item === 'object' ? item.id : null;
    
    if (!itemId) {
      setCurrentData((prev) => ({
        ...prev,
        [group]: prev[group].map((item, index) => 
          index === itemIndex ? newValue : item
        ),
      }));
      setEditMode(null);
      return;
    }

    setIsLoading(true);
    try {
      const groupObj = findGroupByName(group);
      if (!groupObj) {
        throw new Error('Group not found');
      }

      const updateData = {
        group: groupObj.id,
        name: newValue
      };

      if (activeView === 'skills') {
        await competencyApi.skills.update(itemId, updateData);
      } else {
        await competencyApi.behavioralCompetencies.update(itemId, updateData);
      }
      
      await fetchData();
      setEditMode(null);
      showSuccess('Item successfully updated');
    } catch (error) {
      console.error('Error updating item:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGroupExpansion = (groupName) => {
    setExpandedGroups((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(groupName)) {
        newExpanded.delete(groupName);
      } else {
        newExpanded.add(groupName);
      }
      return newExpanded;
    });
  };

  // Statistics
  const stats = useMemo(() => {
    const totalGroups = Object.keys(currentData).length;
    const totalItems = Object.values(currentData).reduce((sum, items) => sum + items.length, 0);
    const avgItemsPerGroup = totalGroups > 0 ? Math.round(totalItems / totalGroups * 10) / 10 : 0;
    return { totalGroups, totalItems, avgItemsPerGroup };
  }, [currentData]);

  // Show loading state
  if (dataLoading) {
    return (
      <DashboardLayout>
        <div className={`min-h-screen ${bgApp} p-6`}>
          <div className="max-w-7xl mx-auto">
            <LoadingSpinner message="Loading competency data..." />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state
  if (error && !dataLoading) {
    return (
      <DashboardLayout>
        <div className={`min-h-screen ${bgApp} p-6`}>
          <div className="max-w-7xl mx-auto">
            <ErrorDisplay error={error} onRetry={fetchData} />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={`min-h-screen ${bgApp} p-6`}>
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <header className={`${bgCard} rounded-lg p-4 shadow-md border ${borderColor}`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
              <div className="space-y-1">
                <h1 className={`text-xl font-bold ${textPrimary} flex items-center gap-2`}>
                  <div className="p-1.5 bg-almet-mystic rounded-md">
                    <Target className="w-5 h-5 text-almet-sapphire" />
                  </div>
                  Competency Matrix
                </h1>
                <p className={`text-xs ${textSecondary}`}>
                  Manage skills and behavioral competencies
                </p>
              </div>
              <div className="flex flex-wrap gap-2 mt-3 lg:mt-0">
                <ActionButton 
                  icon={RefreshCw} 
                  label="Refresh" 
                  onClick={fetchData} 
                  loading={dataLoading}
                  variant="outline"
                  size="sm"
                />
                <ActionButton 
                  icon={Upload} 
                  label="Import" 
                  variant="secondary"
                  size="sm"
                />
                <ActionButton 
                  icon={Download} 
                  label="Export" 
                  variant="primary"
                  size="sm"
                />
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <StatCard 
                title="Groups" 
                value={stats.totalGroups} 
                icon={Grid} 
              />
              <StatCard 
                title="Items" 
                value={stats.totalItems} 
                icon={Target} 
              />
              <StatCard 
                title="Average" 
                value={stats.avgItemsPerGroup} 
                icon={BarChart3} 
              />
            </div>
          </header>

          {/* Navigation Tabs */}
          <nav className={`${bgCard} rounded-lg p-1.5 shadow-md border ${borderColor}`}>
            <div className="flex space-x-1">
              {[
                { id: 'skills', name: 'Skills', icon: Target },
                { id: 'behavioral', name: 'Behavioral', icon: Grid },
                { id: 'matrix', name: 'Assessment Matrix', icon: BarChart3 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                    activeView === tab.id
                      ? `bg-almet-sapphire text-white shadow-md`
                      : `${textSecondary} hover:${textPrimary} hover:bg-almet-mystic`
                  }`}
                >
                  <tab.icon size={16} />
                  <span className="hidden sm:block text-xs">{tab.name}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Search and Filter */}
          {activeView !== 'matrix' && (
            <section className={`${bgCard} rounded-lg p-4 shadow-md border ${borderColor}`}>
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textSecondary} pointer-events-none`} size={16} />
                  <InputField
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="pl-10 text-xs"
                  />
                </div>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className={`px-3 py-2 border rounded-lg text-xs font-medium ${bgCard} ${textPrimary} focus:outline-none focus:border-almet-sapphire transition-all duration-200 min-w-40`}
                >
                  <option value="">All Groups</option>
                  {Object.keys(currentData).map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <ActionButton 
                    icon={Plus} 
                    label="Add Item" 
                    onClick={() => setShowAddForm(true)} 
                    loading={isLoading}
                    variant="primary"
                    size="sm"
                  />
                  <ActionButton 
                    icon={Plus} 
                    label="Add Group" 
                    onClick={() => setShowAddGroupForm(true)}
                    loading={isLoading}
                    variant="success"
                    size="sm"
                  />
                </div>
              </div>
            </section>
          )}

          {/* Content */}
          <section className={`${activeView === 'matrix' ? '' : bgCard + ' border ' + borderColor + ' shadow-md'} rounded-lg overflow-hidden`}>
            {activeView === 'matrix' ? (
              <div className="p-0">
                <CompetencyAssessmentSystem />
              </div>
            ) : (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
                    {activeView === 'skills' ? (
                      <>
                        <Target className="w-4 h-4 text-almet-sapphire" />
                        Skills Groups
                      </>
                    ) : (
                      <>
                        <Grid className="w-4 h-4 text-almet-sapphire" />
                        Behavioral Competencies
                      </>
                    )}
                  </h2>
                  <div className={`px-3 py-1 ${bgAccent} rounded-md`}>
                    <span className={`text-xs font-medium ${textSecondary}`}>
                      {Object.keys(filteredData).length} groups
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {Object.keys(filteredData).map((group) => {
                    const isExpanded = expandedGroups.has(group);
                    return (
                      <article key={group} className={`border-2 ${borderColor} rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200`}>
                        <div className={`flex items-center justify-between p-4 ${bgAccent} border-b-2 ${borderColor}`}>
                          <button
                            onClick={() => {
                              const newExpanded = new Set(expandedGroups);
                              if (newExpanded.has(group)) {
                                newExpanded.delete(group);
                              } else {
                                newExpanded.add(group);
                              }
                              setExpandedGroups(newExpanded);
                            }}
                            className={`flex items-center gap-3 text-base font-bold ${textPrimary} hover:text-almet-sapphire transition-colors`}
                          >
                            <div className={`p-2 rounded-lg ${isExpanded ? 'bg-almet-sapphire text-white' : 'bg-gray-200'}`}>
                              {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            </div>
                            <span className="truncate">{group}</span>
                          </button>
                          <div className="flex items-center gap-3">
                            <div className={`px-3 py-1 ${bgCard} rounded-full border-2 ${borderColor}`}>
                              <span className={`text-sm font-semibold ${textPrimary}`}>
                                {filteredData[group].length} items
                              </span>
                            </div>
                            <ActionButton
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete "${group}" and all its items?`)) {
                                  // Handle delete group
                                }
                              }}
                              icon={Trash2}
                              label="Delete"
                              disabled={isLoading}
                              loading={isLoading}
                              variant="danger"
                              size="sm"
                            />
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className="p-4 space-y-3">
                            {filteredData[group].length > 0 ? (
                              filteredData[group].map((item, index) => {
                                const itemName = typeof item === 'string' ? item : item.name;
                                return (
                                  <div
                                    key={index}
                                    className={`flex items-center justify-between p-4 ${bgCardHover} rounded-lg border-2 ${borderColor} hover:shadow-md transition-all duration-200`}
                                  >
                                    {editMode === `${group}-${index}` ? (
                                      <div className="flex-1 flex items-center gap-3">
                                        <InputField
                                          value={itemName}
                                          onChange={(e) => {
                                            // Handle edit
                                          }}
                                          className="flex-1"
                                          placeholder="Enter item name"
                                        />
                                        <div className="flex gap-2">
                                          <ActionButton
                                            onClick={() => {
                                              // Handle save
                                              setEditMode(null);
                                            }}
                                            icon={Save}
                                            label="Save"
                                            variant="success"
                                            size="sm"
                                          />
                                          <ActionButton
                                            onClick={() => setEditMode(null)}
                                            icon={X}
                                            label="Cancel"
                                            variant="outline"
                                            size="sm"
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <div className="flex items-center gap-3 flex-1">
                                          <div className="w-2 h-2 bg-almet-sapphire rounded-full"></div>
                                          <span className={`text-sm font-medium ${textPrimary}`}>{itemName}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <ActionButton
                                            onClick={() => setEditMode(`${group}-${index}`)}
                                            icon={Edit}
                                            label="Edit"
                                            variant="outline"
                                            size="sm"
                                          />
                                          <ActionButton
                                            onClick={() => {
                                              // Handle delete item
                                            }}
                                            icon={Trash2}
                                            label="Delete"
                                            variant="danger"
                                            size="sm"
                                          />
                                        </div>
                                      </>
                                    )}
                                  </div>
                                );
                              })
                            ) : (
                              <div className={`text-center py-8 ${textSecondary}`}>
                                <Target className="w-10 h-10 mx-auto mb-3 opacity-50" />
                                <p className="text-sm font-medium mb-2">No items in this group yet</p>
                                <ActionButton
                                  onClick={() => setShowAddForm(true)}
                                  icon={Plus}
                                  label="Add First Item"
                                  variant="primary"
                                  size="sm"
                                />
                              </div>
                            )}
                          </div>
                        )}
                        
                        {!isExpanded && filteredData[group].length === 0 && (
                          <div className={`p-4 text-center ${textSecondary} text-sm italic border-t-2 ${borderColor}`}>
                            Click to expand - No items in this group yet
                          </div>
                        )}
                      </article>
                    );
                  })}
                  
                  {Object.keys(filteredData).length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-almet-mystic rounded-full flex items-center justify-center">
                        <Search className={`w-8 h-8 ${textSecondary}`} />
                      </div>
                      <h3 className={`text-lg font-bold ${textPrimary} mb-2`}>No Results Found</h3>
                      <p className={`text-sm ${textSecondary} mb-6 max-w-md mx-auto`}>
                        We couldn't find any groups or items matching your search criteria. Try adjusting your filters or create new content.
                      </p>
                      <div className="flex gap-3 justify-center">
                        <ActionButton
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedGroup('');
                          }}
                          icon={X}
                          label="Clear Filters"
                          variant="outline"
                        />
                        <ActionButton
                          onClick={() => setShowAddForm(true)}
                          icon={Plus}
                          label="Add New Item"
                          variant="primary"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Add Item Modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className={`${bgCard} rounded-xl p-6 w-full max-w-md border-2 ${borderColor} shadow-2xl`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-lg font-bold ${textPrimary} flex items-center gap-2`}>
                    <Plus className="w-4 h-4 text-almet-sapphire" />
                    Add New Item
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewItem({ group: '', item: '', description: '' });
                    }}
                    className={`p-2 rounded-lg ${textSecondary} hover:${bgCardHover} transition-colors`}
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                      Group <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      value={newItem.group}
                      onChange={(e) => setNewItem({ ...newItem, group: e.target.value })}
                      className={`w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm font-medium ${
                        darkMode ? 'bg-almet-cloud-burst text-white border-almet-comet' : 'bg-white text-almet-cloud-burst'
                      } focus:outline-none focus:border-almet-sapphire transition-all duration-200`}
                    >
                      <option value="">Select a group</option>
                      {Object.keys(currentData).map((group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <InputField
                    label="Item Name"
                    value={newItem.item}
                    onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
                    placeholder="Enter item name"
                    required
                  />
                  
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                      Description (optional)
                    </label>
                    <textarea
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      className={`w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm font-medium resize-none ${
                        darkMode ? 'bg-almet-cloud-burst text-white border-almet-comet' : 'bg-white text-almet-cloud-burst'
                      } focus:outline-none focus:border-almet-sapphire transition-all duration-200`}
                      rows="3"
                      placeholder="Enter item description (optional)"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t-2 border-gray-200">
                  <ActionButton
                    onClick={() => {
                      setShowAddForm(false);
                      setNewItem({ group: '', item: '', description: '' });
                    }}
                    icon={X}
                    label="Cancel"
                    disabled={isLoading}
                    variant="outline"
                  />
                  <ActionButton
                    icon={Plus}
                    label="Add Item"
                    onClick={() => {
                      // Handle add item
                      setShowAddForm(false);
                      setNewItem({ group: '', item: '', description: '' });
                      showSuccess(`${newItem.item} successfully added to ${newItem.group}`);
                    }}
                    disabled={!newItem.group || !newItem.item}
                    loading={isLoading}
                    variant="primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Add Group Modal */}
          {showAddGroupForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className={`${bgCard} rounded-xl p-6 w-full max-w-md border-2 ${borderColor} shadow-2xl`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-lg font-bold ${textPrimary} flex items-center gap-2`}>
                    <Plus className="w-4 h-4 text-almet-sapphire" />
                    Add New Group
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddGroupForm(false);
                      setNewGroupName('');
                    }}
                    className={`p-2 rounded-lg ${textSecondary} hover:${bgCardHover} transition-colors`}
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <InputField
                  label="Group Name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter group name"
                  required
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && newGroupName.trim() && setShowAddGroupForm(false)}
                />
                
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t-2 border-gray-200">
                  <ActionButton
                    onClick={() => {
                      setShowAddGroupForm(false);
                      setNewGroupName('');
                    }}
                    icon={X}
                    label="Cancel"
                    disabled={isLoading}
                    variant="outline"
                  />
                  <ActionButton
                    icon={Plus}
                    label="Add Group"
                    onClick={() => {
                      // Handle add group
                      setShowAddGroupForm(false);
                      setNewGroupName('');
                      showSuccess(`Group "${newGroupName.trim()}" successfully created`);
                    }}
                    disabled={!newGroupName.trim()}
                    loading={isLoading}
                    variant="success"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Success Toast */}
          {successMessage && (
            <SuccessToast 
              message={successMessage} 
              onClose={() => setSuccessMessage('')} 
            />
          )}

          {/* Error Toast */}
          {error && (
            <div className="fixed bottom-6 right-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 shadow-2xl z-50 max-w-sm">
              <div className="flex items-start gap-3">
                <div className="p-1 bg-red-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-red-800 font-bold text-sm">Error Occurred</h4>
                  <p className="text-red-700 text-sm mt-1">
                    {error?.message || 'An unexpected error occurred'}
                  </p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="p-1 text-red-600 hover:text-red-800 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompetencyMatrixSystem;
                