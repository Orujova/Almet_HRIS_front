'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Save, X, Search, Grid, Target, BarChart3, 
  Download, Upload, ChevronDown, ChevronRight, Loader2, RefreshCw,
  AlertCircle, CheckCircle, User, Users, FileText, TrendingUp, Calculator,
  ArrowLeft, Settings
} from 'lucide-react';

// Mock data (this will come from real API)
const mockPositions = [
  { id: 1, name: 'Sales Specialist' },
  { id: 2, name: 'HR Manager' },
  { id: 3, name: 'Software Developer' },
  { id: 4, name: 'Project Manager' },
  { id: 5, name: 'Marketing Manager' }
];

const mockEmployees = [
  { id: 1, name: 'Andrew Roberts', position: 'Sales Specialist' },
  { id: 2, name: 'Emma Wilson', position: 'HR Manager' },
  { id: 3, name: 'John Smith', position: 'Software Developer' },
  { id: 4, name: 'Sarah Johnson', position: 'Project Manager' },
  { id: 5, name: 'Michael Brown', position: 'Marketing Manager' }
];

const mockSkillGroups = {
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
    'Supply Chain Management',
    'Investment Projects Feasibility Study'
  ],
  'IT Skills': [
    'Software Development',
    'Netsuite Customisation and Optimisation',
    'Netsuite Development (Script, SQL, Workflows)',
    'System Administration',
    'Database Administration'
  ],
  'HSE General': [
    'OHS&E procedures and relevant legislation (local and international standards)',
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

// Button Component
const ActionButton = ({ onClick, icon: Icon, label, variant = 'primary', disabled = false, loading = false, size = 'md' }) => {
  const variants = {
    primary: `bg-blue-600 hover:bg-blue-700 text-white`,
    secondary: `bg-gray-600 hover:bg-gray-700 text-white`,
    success: `bg-green-600 hover:bg-green-700 text-white`,
    danger: `bg-red-500 hover:bg-red-600 text-white`,
    outline: `border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white bg-transparent`,
  };
  
  const sizes = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
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
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
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
          w-full px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-200
          ${error 
            ? 'border-red-400 focus:border-red-500' 
            : 'border-gray-200 focus:border-blue-500'
          }
          bg-white text-gray-900 placeholder-gray-500
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

// Scale Guide Component
const ScaleGuide = () => {
  const scaleDescriptions = [
    { level: '0', description: 'Not applicable / no skill' },
    { level: '1', description: 'Elementary skill / applies rarely' },
    { level: '2', description: 'Intermediate skill / applies under control' },
    { level: '3', description: 'Proficient skills / applies independently' },
    { level: '4', description: 'Profound skill / applies, delegates and controls others' },
    { level: '5', description: 'Expert level / coaches others' }
  ];

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
        <FileText size={16} />
        Assessment Scale Guide
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {scaleDescriptions.map((item) => (
          <div key={item.level} className="flex items-start gap-2 text-xs">
            <span className="bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-xs">
              {item.level}
            </span>
            <span className="text-blue-700">{item.description}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Assessment Table Component
const AssessmentTable = ({ 
  competencies, 
  positionScores, 
  employeeScores, 
  onPositionScoreChange, 
  onEmployeeScoreChange,
  selectedPosition,
  selectedEmployee
}) => {
  const calculateGap = (positionScore, employeeScore) => {
    if (positionScore === 0 && employeeScore === 0) return 'FALSE';
    return employeeScore - positionScore;
  };

  const getGapColor = (gap) => {
    if (gap === 'FALSE') return 'bg-green-100 text-green-800';
    if (gap > 0) return 'bg-blue-100 text-blue-800';
    if (gap < 0) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  const totalPositionScore = Object.values(positionScores).reduce((sum, score) => sum + score, 0);
  const totalEmployeeScore = Object.values(employeeScores).reduce((sum, score) => sum + score, 0);
  const totalGap = totalEmployeeScore - totalPositionScore;

  return (
    <div className="space-y-4">
      {/* Assessment Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide">Position Assessment</p>
            <p className="text-lg font-bold text-blue-600">{selectedPosition}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide">Employee Assessment</p>
            <p className="text-lg font-bold text-green-600">{selectedEmployee}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase tracking-wide">Assessment Scale</p>
            <p className="text-lg font-bold text-gray-900">0 - 5</p>
          </div>
        </div>
      </div>

      {/* Assessment Table */}
      <div className="overflow-x-auto border rounded-lg shadow-sm">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="p-3 text-left font-bold min-w-96">LIST OF COMPETENCIES / ASSESSMENT SCALE</th>
              <th className="p-3 text-center font-bold w-32">POSITION ASSESSMENT<br/><span className="text-blue-200 text-xs font-normal">5</span></th>
              <th className="p-3 text-center font-bold w-32">EMPLOYEE ASSESSMENT<br/><span className="text-blue-200 text-xs font-normal">5</span></th>
              <th className="p-3 text-center font-bold w-32">GAP ANALYSIS<br/><span className="text-blue-200 text-xs font-normal">5</span></th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(competencies).map(([groupName, items]) => {
              const groupPositionTotal = items.reduce((sum, _, index) => {
                const key = `${groupName}-${index}`;
                return sum + (positionScores[key] || 0);
              }, 0);
              
              const groupEmployeeTotal = items.reduce((sum, _, index) => {
                const key = `${groupName}-${index}`;
                return sum + (employeeScores[key] || 0);
              }, 0);
              
              const groupGap = groupEmployeeTotal - groupPositionTotal;
              
              return (
                <React.Fragment key={groupName}>
                  <tr className="bg-blue-800 text-white">
                    <td className="p-2 font-bold">{groupName.toUpperCase()}</td>
                    <td className="p-2 text-center font-bold">{groupPositionTotal}</td>
                    <td className="p-2 text-center font-bold">{groupEmployeeTotal}</td>
                    <td className="p-2 text-center font-bold">{groupGap}</td>
                  </tr>
                  {items.map((item, index) => {
                    const key = `${groupName}-${index}`;
                    const positionScore = positionScores[key] || 0;
                    const employeeScore = employeeScores[key] || 0;
                    const gap = calculateGap(positionScore, employeeScore);
                    
                    return (
                      <tr key={key} className="border-b hover:bg-gray-50">
                        <td className="p-2 border-r">{item}</td>
                        <td className="p-2 border-r text-center">
                          <select
                            value={positionScore}
                            onChange={(e) => onPositionScoreChange(key, parseInt(e.target.value))}
                            className="w-full px-2 py-1 border rounded text-center focus:outline-none focus:border-blue-500"
                          >
                            {[0, 1, 2, 3, 4, 5].map(num => (
                              <option key={num} value={num}>{num}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2 border-r text-center">
                          <select
                            value={employeeScore}
                            onChange={(e) => onEmployeeScoreChange(key, parseInt(e.target.value))}
                            className="w-full px-2 py-1 border rounded text-center focus:outline-none focus:border-blue-500"
                          >
                            {[0, 1, 2, 3, 4, 5].map(num => (
                              <option key={num} value={num}>{num}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-2 text-center">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getGapColor(gap)}`}>
                            {gap}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
            <tr className="bg-gray-100 font-bold text-sm">
              <td className="p-3">TOTAL</td>
              <td className="p-3 text-center">{totalPositionScore}</td>
              <td className="p-3 text-center">{totalEmployeeScore}</td>
              <td className="p-3 text-center">
                <span className={`px-2 py-1 rounded font-bold ${
                  totalGap > 0 ? 'bg-blue-600 text-white' :
                  totalGap < 0 ? 'bg-red-600 text-white' : 'bg-gray-600 text-white'
                }`}>
                  {totalGap}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Position Assessment Setup Component
const PositionAssessmentSetup = ({ onNext }) => {
  const [positions, setPositions] = useState(mockPositions.map(p => ({ ...p, scale: 5 })));
  const [newPosition, setNewPosition] = useState('');

  const addPosition = () => {
    if (newPosition.trim()) {
      setPositions([...positions, { 
        id: Date.now(), 
        name: newPosition.trim(), 
        scale: 5 
      }]);
      setNewPosition('');
    }
  };

  const updateScale = (id, scale) => {
    setPositions(positions.map(p => p.id === id ? { ...p, scale } : p));
  };

  const deletePosition = (id) => {
    setPositions(positions.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 border shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-blue-600" />
          Create Position Assessment
        </h3>
        
        <div className="space-y-4">
          {/* Add New Position */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-bold text-blue-800 mb-3">Add New Position</h4>
            <div className="flex gap-3">
              <InputField
                value={newPosition}
                onChange={(e) => setNewPosition(e.target.value)}
                placeholder="Enter position name"
                className="flex-1"
              />
              <ActionButton
                icon={Plus}
                label="Add"
                onClick={addPosition}
                disabled={!newPosition.trim()}
              />
            </div>
          </div>

          {/* Positions List */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-gray-800">Positions and Assessment Scales</h4>
            {positions.map((position) => (
              <div key={position.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                <div>
                  <span className="font-medium text-gray-900">{position.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">Scale:</span>
                    <select
                      value={position.scale}
                      onChange={(e) => updateScale(position.id, parseInt(e.target.value))}
                      className="px-2 py-1 border rounded text-sm focus:outline-none focus:border-blue-500"
                    >
                      {[3, 4, 5].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                  <ActionButton
                    icon={Trash2}
                    label=""
                    variant="danger"
                    size="sm"
                    onClick={() => deletePosition(position.id)}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <ActionButton
              icon={TrendingUp}
              label="Continue to Employee Assessment"
              onClick={() => onNext(positions)}
              disabled={positions.length === 0}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Assessment Component
const CompetencyAssessmentSystem = ({ onBack }) => {
  const [currentStep, setCurrentStep] = useState('position-setup'); // position-setup, employee-assessment
  const [selectedPosition, setSelectedPosition] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [positionScores, setPositionScores] = useState({});
  const [employeeScores, setEmployeeScores] = useState({});
  const [assessmentTitle, setAssessmentTitle] = useState('');
  const [assessments, setAssessments] = useState([]);
  const [availablePositions, setAvailablePositions] = useState([]);

  const handlePositionScoreChange = (key, score) => {
    setPositionScores(prev => ({ ...prev, [key]: score }));
  };

  const handleEmployeeScoreChange = (key, score) => {
    setEmployeeScores(prev => ({ ...prev, [key]: score }));
  };

  const handlePositionSetupComplete = (positions) => {
    setAvailablePositions(positions);
    setCurrentStep('employee-assessment');
  };

  const handleStartAssessment = () => {
    if (!selectedPosition || !selectedEmployee) {
      alert('Please select both position and employee');
      return;
    }
    // Initialize scores based on selected position's data or previous assessments
    // This is where you'd load any existing assessment data
  };

  const handleSaveAssessment = () => {
    const newAssessment = {
      id: Date.now(),
      title: assessmentTitle || `${selectedEmployee} - ${selectedPosition}`,
      position: selectedPosition,
      employee: selectedEmployee,
      positionScores: { ...positionScores },
      employeeScores: { ...employeeScores },
      date: new Date().toLocaleDateString(),
      totalPositionScore: Object.values(positionScores).reduce((sum, score) => sum + score, 0),
      totalEmployeeScore: Object.values(employeeScores).reduce((sum, score) => sum + score, 0),
      totalGap: Object.values(employeeScores).reduce((sum, score) => sum + score, 0) - 
                Object.values(positionScores).reduce((sum, score) => sum + score, 0)
    };
    
    setAssessments(prev => [...prev, newAssessment]);
    
    // Reset form
    setSelectedPosition('');
    setSelectedEmployee('');
    setPositionScores({});
    setEmployeeScores({});
    setAssessmentTitle('');
    
    alert('Assessment saved successfully!');
  };

  const renderEmployeeAssessment = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg p-6 border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-600" />
              Create Employee Assessment
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Select position and employee to start assessment
            </p>
          </div>
          <ActionButton
            icon={ArrowLeft}
            label="Back to Position Setup"
            onClick={() => setCurrentStep('position-setup')}
            variant="outline"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Position <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedPosition}
              onChange={(e) => setSelectedPosition(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">Select position...</option>
              {availablePositions.map(position => (
                <option key={position.id} value={position.name}>{position.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Employee <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            >
              <option value="">Select employee...</option>
              {mockEmployees.map(employee => (
                <option key={employee.id} value={employee.name}>{employee.name} ({employee.position})</option>
              ))}
            </select>
          </div>
        </div>

        <InputField
          label="Assessment Title (Optional)"
          value={assessmentTitle}
          onChange={(e) => setAssessmentTitle(e.target.value)}
          placeholder="e.g., Q1 2024 Performance Assessment"
          className="mb-6"
        />

        {selectedPosition && selectedEmployee && (
          <div className="space-y-6">
            <ScaleGuide />
            
            <AssessmentTable
              competencies={mockSkillGroups}
              positionScores={positionScores}
              employeeScores={employeeScores}
              onPositionScoreChange={handlePositionScoreChange}
              onEmployeeScoreChange={handleEmployeeScoreChange}
              selectedPosition={selectedPosition}
              selectedEmployee={selectedEmployee}
            />

            <div className="flex justify-end gap-3 pt-4 border-t">
              <ActionButton
                icon={Download}
                label="Export Assessment"
                variant="outline"
              />
              <ActionButton
                icon={Save}
                label="Save Assessment"
                onClick={handleSaveAssessment}
                variant="success"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <header className="bg-white rounded-lg p-6 shadow-sm border">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                Core Competency Assessment
              </h1>
              <p className="text-gray-600">
                Create and manage position and employee competency assessments
              </p>
            </div>
            <div className="flex gap-3 mt-4 lg:mt-0">
              <ActionButton 
                icon={ArrowLeft} 
                label="Back to Matrix" 
                onClick={onBack}
                variant="outline"
              />
              <ActionButton 
                icon={Download} 
                label="Export All" 
                variant="secondary"
              />
            </div>
          </div>
        </header>

        {/* Content */}
        {currentStep === 'position-setup' && (
          <PositionAssessmentSetup onNext={handlePositionSetupComplete} />
        )}
        
        {currentStep === 'employee-assessment' && renderEmployeeAssessment()}

        {/* Assessment History */}
        {assessments.length > 0 && (
          <div className="bg-white rounded-lg p-6 border shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Assessment History
            </h3>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 text-left font-medium">Title</th>
                    <th className="p-3 text-left font-medium">Position</th>
                    <th className="p-3 text-left font-medium">Employee</th>
                    <th className="p-3 text-left font-medium">Date</th>
                    <th className="p-3 text-center font-medium">Total Gap</th>
                    <th className="p-3 text-center font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assessments.map((assessment) => (
                    <tr key={assessment.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">{assessment.title}</td>
                      <td className="p-3">{assessment.position}</td>
                      <td className="p-3">{assessment.employee}</td>
                      <td className="p-3">{assessment.date}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          assessment.totalGap > 0 ? 'bg-blue-100 text-blue-800' :
                          assessment.totalGap < 0 ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {assessment.totalGap}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center gap-1">
                          <ActionButton
                            icon={Download}
                            label=""
                            variant="outline"
                            size="sm"
                          />
                          <ActionButton
                            icon={Trash2}
                            label=""
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this assessment?')) {
                                setAssessments(prev => prev.filter(a => a.id !== assessment.id));
                              }
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompetencyAssessmentSystem;