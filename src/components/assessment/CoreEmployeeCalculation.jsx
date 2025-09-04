'use client';
import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, Target, Search, Eye, Edit, Trash2, 
  Download, Calendar, Award, AlertCircle, CheckCircle,
  Loader2, X, Save, ChevronDown, User, Building,
  TrendingUp, TrendingDown, Minus, Info, Send, RotateCcw
} from 'lucide-react';
import { assessmentApi } from '@/services/assessmentApi';
import { competencyApi } from '@/services/competencyApi';
import SuccessToast from './SuccessToast';
import ErrorToast from './ErrorToast';
import SearchableDropdown from './SearchableDropdown';
import StatusBadge from './StatusBadge';

// ActionButton Component
const ActionButton = ({ onClick, icon: Icon, label, variant = 'primary', loading = false, disabled = false, size = 'sm' }) => {
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white',
    danger: 'bg-red-500 hover:bg-red-600 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white',
    info: 'bg-blue-500 hover:bg-blue-600 text-white'
  };

  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        flex items-center gap-2 rounded-lg font-medium
        transition-all duration-200 hover:shadow-md ${variants[variant]} ${sizes[size]}
        ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
      {label}
    </button>
  );
};

// GapIndicator Component
const GapIndicator = ({ gap }) => {
  if (gap > 0) {
    return (
      <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
        <TrendingUp size={12} />
        +{gap}
      </span>
    );
  } else if (gap < 0) {
    return (
      <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
        <TrendingDown size={12} />
        {gap}
      </span>
    );
  } else {
    return (
      <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
        <Minus size={12} />
        0
      </span>
    );
  }
};

// CompletionIndicator Component
const CompletionIndicator = ({ percentage }) => {
  const numPercentage = parseFloat(percentage) || 0;
  let colorClass = 'bg-red-100 text-red-800 border-red-200';
  
  if (numPercentage >= 100) {
    colorClass = 'bg-green-100 text-green-800 border-green-200';
  } else if (numPercentage >= 80) {
    colorClass = 'bg-blue-100 text-blue-800 border-blue-200';
  } else if (numPercentage >= 60) {
    colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-bold border ${colorClass}`}>
      {numPercentage.toFixed(0)}%
    </span>
  );
};

// DuplicateAssessmentWarning Component
const DuplicateAssessmentWarning = ({ employeeName, onClose }) => {
  return (
    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-red-800 mb-1">Duplicate Assessment</h4>
          <p className="text-red-700 text-sm">
            {employeeName} already has a core assessment. Each employee can only have one assessment.
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-red-600 hover:text-red-800 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// NoTemplateWarning Component
const NoTemplateWarning = ({ jobTitle, onClose }) => {
  return (
    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-semibold text-yellow-800 mb-1">No Assessment Template Found</h4>
          <p className="text-yellow-700 text-sm">
            No core assessment template found for <strong>{jobTitle}</strong>. Please create a position assessment template first.
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-yellow-600 hover:text-yellow-800 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// Main Component
const CoreEmployeeCalculation = () => {
  // ====================================
  // STATE DEFINITIONS
  // ====================================
  
  // Basic states
  const [activeTab, setActiveTab] = useState('employee');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal states
  const [showCreatePositionModal, setShowCreatePositionModal] = useState(false);
  const [showCreateEmployeeModal, setShowCreateEmployeeModal] = useState(false);
  const [showEditEmployeeModal, setShowEditEmployeeModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCoreScalesInfo, setShowCoreScalesInfo] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [editingAssessment, setEditingAssessment] = useState(null);
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [noTemplateWarning, setNoTemplateWarning] = useState(null);
  
  // Data states
  const [positionAssessments, setPositionAssessments] = useState([]);
  const [employeeAssessments, setEmployeeAssessments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [positionGroups, setPositionGroups] = useState([]);
  const [coreScales, setCoreScales] = useState([]);
  const [skillGroups, setSkillGroups] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  
  // Form states
  const [positionFormData, setPositionFormData] = useState({
    position_group: '',
    job_title: '',
    competency_ratings: []
  });
  
  const [employeeFormData, setEmployeeFormData] = useState({
    employee: '',
    position_assessment: '',
    notes: '',
    competency_ratings: []
  });

  // Selected employee info state
  const [selectedEmployeeInfo, setSelectedEmployeeInfo] = useState(null);

  // ====================================
  // DATA FETCHING
  // ====================================

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [
        positionAssessmentsRes, 
        employeeAssessmentsRes, 
        employeesRes, 
        positionGroupsRes,
        coreScalesRes,
        skillGroupsRes
      ] = await Promise.all([
        assessmentApi.positionCore.getAll(),
        assessmentApi.employeeCore.getAll(),
        assessmentApi.employees.getAll(),
        assessmentApi.positionGroups.getAll(),
        assessmentApi.coreScales.getAll(),
        competencyApi.skillGroups.getAll()
      ]);
      
      setPositionAssessments(positionAssessmentsRes.results || []);
      setEmployeeAssessments(employeeAssessmentsRes.results || []);
      setEmployees(employeesRes.results || []);
      setPositionGroups(positionGroupsRes.results || []);
      setCoreScales(coreScalesRes.results || []);
      
      // Fetch detailed skill groups with skills
      const skillGroupsList = skillGroupsRes.results || [];
      const skillGroupsDetails = await Promise.all(
        skillGroupsList.map(group => competencyApi.skillGroups.getById(group.id))
      );
      setSkillGroups(skillGroupsDetails);
      
      // Extract unique job titles from employees
      const uniqueJobTitles = [...new Set(employeesRes.results?.map(emp => emp.job_title).filter(Boolean))];
      setJobTitles(uniqueJobTitles);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ====================================
  // EVENT HANDLERS
  // ====================================

  // Employee selection handler
  const handleEmployeeChange = async (employeeId) => {
    const selectedEmployee = employees.find(e => e.id === employeeId);
    if (!selectedEmployee) return;
    
    // Clear previous warnings
    setDuplicateWarning(null);
    setNoTemplateWarning(null);
    
    // Check if this employee already has an assessment
    const existingAssessment = employeeAssessments.find(a => a.employee === employeeId);
    if (existingAssessment) {
      setDuplicateWarning({
        employeeName: selectedEmployee.name,
        type: 'core'
      });
      setError({ 
        message: `Employee ${selectedEmployee.name} already has an assessment. Each employee can only have one assessment.`,
        type: 'duplicate_assessment',
        employeeName: selectedEmployee.name
      });
      return;
    }
    
    setSelectedEmployeeInfo(selectedEmployee);
    setEmployeeFormData(prev => ({...prev, employee: employeeId}));
    
    // Try to get position assessment for this employee from API
    try {
      const response = await assessmentApi.positionCore.getForEmployee(employeeId);
      if (response.assessment_template) {
        setEmployeeFormData(prev => ({
          ...prev, 
          employee: employeeId,
          position_assessment: response.assessment_template.id
        }));
      }
    } catch (err) {
      console.error('Error fetching employee position template:', err);
      // Show warning in modal instead of error toast
      setNoTemplateWarning({
        jobTitle: selectedEmployee.job_title
      });
      
      setEmployeeFormData(prev => ({
        ...prev, 
        employee: employeeId,
        position_assessment: ''
      }));
    }
  };

  // Position assessment handlers
  const handleCreatePositionAssessment = async () => {
    if (!positionFormData.position_group || !positionFormData.job_title || positionFormData.competency_ratings.length === 0) {
      setError({ message: 'Please fill all required fields and add at least one competency rating' });
      return;
    }

    setIsSubmitting(true);
    try {
      await assessmentApi.positionCore.create(positionFormData);
      await fetchData();
      setShowCreatePositionModal(false);
      setPositionFormData({ position_group: '', job_title: '', competency_ratings: [] });
      setEditingAssessment(null);
      setSuccessMessage('Position assessment template created successfully');
    } catch (err) {
      console.error('Error creating position assessment:', err);
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPositionAssessment = async (assessment) => {
    try {
      setPositionFormData({
        position_group: assessment.position_group,
        job_title: assessment.job_title,
        competency_ratings: assessment.competency_ratings?.map(rating => ({
          skill_id: rating.skill,
          required_level: rating.required_level
        })) || []
      });
      
      setEditingAssessment(assessment);
      setShowCreatePositionModal(true);
    } catch (err) {
      console.error('Error loading position assessment for edit:', err);
      setError(err);
    }
  };

  const handleUpdatePositionAssessment = async () => {
    if (!positionFormData.position_group || !positionFormData.job_title || positionFormData.competency_ratings.length === 0) {
      setError({ message: 'Please fill all required fields and add at least one competency rating' });
      return;
    }

    setIsSubmitting(true);
    try {
      await assessmentApi.positionCore.update(editingAssessment.id, positionFormData);
      await fetchData();
      setShowCreatePositionModal(false);
      setPositionFormData({ position_group: '', job_title: '', competency_ratings: [] });
      setEditingAssessment(null);
      setSuccessMessage('Position assessment template updated successfully');
    } catch (err) {
      console.error('Error updating position assessment:', err);
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Employee assessment handlers
  const handleEditAssessment = async (assessment) => {
    try {
      const fullAssessment = await assessmentApi.employeeCore.getById(assessment.id);
      setEditingAssessment(fullAssessment);
      
      const employeeInfo = employees.find(e => e.id === fullAssessment.employee);
      setSelectedEmployeeInfo(employeeInfo);
      
      setEmployeeFormData({
        employee: fullAssessment.employee,
        position_assessment: fullAssessment.position_assessment,
        notes: fullAssessment.notes || '',
        competency_ratings: fullAssessment.competency_ratings?.map(rating => ({
          skill_id: rating.skill,
          actual_level: rating.actual_level,
          notes: rating.notes || ''
        })) || []
      });
      
      setShowEditEmployeeModal(true);
    } catch (err) {
      console.error('Error loading assessment for edit:', err);
      setError(err);
    }
  };

  const handleUpdateAssessment = async (actionType = 'save_draft') => {
    if (!editingAssessment) return;

    setIsSubmitting(true);
    try {
      const data = {
        ...employeeFormData,
        action_type: 'save_draft'
      };
      
      await assessmentApi.employeeCore.update(editingAssessment.id, data);
      
      if (actionType === 'submit') {
        await assessmentApi.employeeCore.submit(editingAssessment.id, {});
      }
      
      await fetchData();
      setShowEditEmployeeModal(false);
      setEditingAssessment(null);
      setEmployeeFormData({
        employee: '',
        position_assessment: '',
        notes: '',
        competency_ratings: []
      });
      setSelectedEmployeeInfo(null);
      const actionMessage = actionType === 'save_draft' ? 'Assessment updated successfully' : 'Assessment updated and submitted successfully';
      setSuccessMessage(actionMessage);
    } catch (err) {
      console.error('Error updating assessment:', err);
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmployeeAssessmentAction = async (actionType = 'save_draft') => {
    if (!employeeFormData.employee) {
      setError({ message: 'Please select employee' });
      return;
    }

    setIsSubmitting(true);
    try {
      // First, always save as draft
      const data = {
        ...employeeFormData,
        action_type: 'save_draft'
      };
      
      const response = await assessmentApi.employeeCore.create(data);
      
      // If action type is 'submit', then submit the newly created assessment
      if (actionType === 'submit' && response.id) {
        await assessmentApi.employeeCore.submit(response.id, {});
      }
      
      await fetchData();
      setShowCreateEmployeeModal(false);
      setEmployeeFormData({
        employee: '',
        position_assessment: '',
        notes: '',
        competency_ratings: []
      });
      setSelectedEmployeeInfo(null);
      setDuplicateWarning(null);
      setNoTemplateWarning(null);
      const actionMessage = actionType === 'save_draft' ? 'Employee assessment saved as draft' : 'Employee assessment created and submitted successfully';
      setSuccessMessage(actionMessage);
    } catch (err) {
      console.error('Error with employee assessment:', err);
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Other action handlers
  const handleSubmitAssessment = async (id) => {
    try {
      await assessmentApi.employeeCore.submit(id, {});
      await fetchData();
      setSuccessMessage('Assessment submitted successfully');
    } catch (err) {
      console.error('Error submitting assessment:', err);
      setError(err);
    }
  };

  const handleReopenAssessment = async (id) => {
    try {
      await assessmentApi.employeeCore.reopen(id, {});
      await fetchData();
      setSuccessMessage('Assessment reopened for editing');
    } catch (err) {
      console.error('Error reopening assessment:', err);
      setError(err);
    }
  };

  const handleExport = async (id, type) => {
    try {
      if (type === 'employee') {
        await assessmentApi.employeeCore.exportDocument(id);
        setSuccessMessage('Assessment exported successfully');
      }
    } catch (err) {
      console.error('Export error:', err);
      setError(err);
    }
  };

  const handleDelete = async (id, type) => {
    if (!confirm('Are you sure you want to delete this assessment?')) return;
    
    try {
      if (type === 'position') {
        await assessmentApi.positionCore.delete(id);
      } else {
        await assessmentApi.employeeCore.delete(id);
      }
      await fetchData();
      setSuccessMessage('Assessment deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      setError(err);
    }
  };

  // ====================================
  // DATA FILTERING
  // ====================================

  const filteredPositionAssessments = positionAssessments.filter(assessment => 
    assessment.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.position_group_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEmployeeAssessments = employeeAssessments.filter(assessment => 
    (assessment.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     assessment.position_assessment_title?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedStatus === '' || assessment.status === selectedStatus)
  );

  // ====================================
  // RENDER
  // ====================================

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl p-1.5 shadow-lg border-2 border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('position')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'position'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Building size={16} />
            <div className="text-left">
              <div className="text-sm font-semibold">Position Assessment Templates</div>
              <div className="text-xs opacity-75">Define skill requirements for positions</div>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('employee')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'employee'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Target size={16} />
            <div className="text-left">
              <div className="text-sm font-semibold">Employee Assessments</div>
              <div className="text-xs opacity-75">Assess individual employee skills</div>
            </div>
          </button>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder={`Search ${activeTab === 'position' ? 'positions' : 'employees'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg text-sm bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            {activeTab === 'employee' && (
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm bg-white focus:border-blue-500 focus:outline-none min-w-40"
              >
                <option value="">All Statuses</option>
                <option value="DRAFT">Draft</option>
                <option value="COMPLETED">Completed</option>
              </select>
            )}
          </div>
          
          <ActionButton
            onClick={() => activeTab === 'position' ? setShowCreatePositionModal(true) : setShowCreateEmployeeModal(true)}
            icon={Plus}
            label={`Create ${activeTab === 'position' ? 'Position Template' : 'Employee Assessment'}`}
            variant="primary"
            size="md"
          />
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="bg-white rounded-xl p-8 text-center border-2 border-gray-200">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading assessments...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
          {activeTab === 'position' ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900 text-sm">Position Group</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900 text-sm">Job Title</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900 text-sm">Skills</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900 text-sm">Created</th>
                    <th className="text-center px-6 py-4 font-semibold text-gray-900 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPositionAssessments.length > 0 ? (
                    filteredPositionAssessments.map((assessment) => (
                      <tr key={assessment.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-gray-900 font-medium">{assessment.position_group_name}</td>
                        <td className="px-6 py-4 text-gray-900">{assessment.job_title}</td>
                        <td className="px-6 py-4 text-gray-600">{assessment.competency_ratings?.length || 0} skills</td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{new Date(assessment.created_at).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <ActionButton
                              onClick={() => {
                                setSelectedAssessment(assessment);
                                setShowViewModal(true);
                              }}
                              icon={Eye}
                              label="View"
                              variant="outline"
                              size="xs"
                            />
                            <ActionButton
                              onClick={() => handleEditPositionAssessment(assessment)}
                              icon={Edit}
                              label="Edit"
                              variant="info"
                              size="xs"
                            />
                            <ActionButton
                              onClick={() => handleDelete(assessment.id, 'position')}
                              icon={Trash2}
                              label="Delete"
                              variant="danger"
                              size="xs"
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-12">
                        <Building className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
                        <p className="text-gray-600 font-medium">No position templates found</p>
                        <p className="text-gray-500 text-sm mt-2">Create your first position assessment template</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900 text-sm">Employee</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900 text-sm">Position</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900 text-sm">Status</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900 text-sm">Gap Score</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900 text-sm">Completion</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900 text-sm">Date</th>
                    <th className="text-center px-6 py-4 font-semibold text-gray-900 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployeeAssessments.length > 0 ? (
                    filteredEmployeeAssessments.map((assessment) => (
                      <tr key={assessment.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-gray-900 font-medium">
                          <div>
                            <div>{assessment.employee_name}</div>
                            <div className="text-xs text-gray-500">ID: {assessment.employee_id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-900">{assessment.position_assessment_title}</td>
                        <td className="px-6 py-4"><StatusBadge status={assessment.status} /></td>
                        <td className="px-6 py-4"><GapIndicator gap={assessment.gap_score || 0} /></td>
                        <td className="px-6 py-4"><CompletionIndicator percentage={assessment.completion_percentage} /></td>
                        <td className="px-6 py-4 text-gray-600 text-sm">{new Date(assessment.assessment_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <ActionButton
                              onClick={() => {
                                setSelectedAssessment(assessment);
                                setShowViewModal(true);
                              }}
                              icon={Eye}
                              label="View"
                              variant="outline"
                              size="xs"
                            />
                            {assessment.status === 'DRAFT' && (
                              <>
                                <ActionButton
                                  onClick={() => handleEditAssessment(assessment)}
                                  icon={Edit}
                                  label="Edit"
                                  variant="info"
                                  size="xs"
                                />
                                <ActionButton
                                  onClick={() => handleSubmitAssessment(assessment.id)}
                                  icon={Send}
                                  label="Submit"
                                  variant="success"
                                  size="xs"
                                />
                              </>
                            )}
                            {assessment.status === 'COMPLETED' && (
                              <ActionButton
                                onClick={() => handleReopenAssessment(assessment.id)}
                                icon={RotateCcw}
                                label="Reopen"
                                variant="warning"
                                size="xs"
                                />
                            )}
                            <ActionButton
                              onClick={() => handleExport(assessment.id, 'employee')}
                              icon={Download}
                              label="Export"
                              variant="secondary"
                              size="xs"
                            />
                            <ActionButton
                              onClick={() => handleDelete(assessment.id, 'employee')}
                              icon={Trash2}
                              label="Delete"
                              variant="danger"
                              size="xs"
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-12">
                        <Target className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
                        <p className="text-gray-600 font-medium">No employee assessments found</p>
                        <p className="text-gray-500 text-sm mt-2">Create your first employee assessment</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* View Assessment Modal */}
      {showViewModal && selectedAssessment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-6xl border-2 border-gray-200 shadow-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                {activeTab === 'position' ? (
                  <>
                    <Building className="w-5 h-5 text-blue-600" />
                    Position Assessment Template Details
                  </>
                ) : (
                  <>
                    <User className="w-5 h-5 text-blue-600" />
                    Employee Assessment Details
                  </>
                )}
              </h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedAssessment(null);
                }}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {activeTab === 'position' ? (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position Group</label>
                    <div className="text-gray-900 font-medium">{selectedAssessment.position_group_name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                    <div className="text-gray-900 font-medium">{selectedAssessment.job_title}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created By</label>
                    <div className="text-gray-900">{selectedAssessment.created_by_name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
                    <div className="text-gray-900">{new Date(selectedAssessment.created_at).toLocaleDateString()}</div>
                  </div>
                </div>

                {/* Competency Requirements */}
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-blue-900 text-white p-3">
                    <h4 className="font-bold text-center">Required Competency Levels</h4>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="text-left px-4 py-3 font-semibold text-gray-900">Skill Group</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-900">Skill Name</th>
                          <th className="text-center px-4 py-3 font-semibold text-gray-900">Required Level</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedAssessment.competency_ratings?.length > 0 ? (
                          selectedAssessment.competency_ratings.map((rating, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-3 text-gray-600">{rating.skill_group_name}</td>
                              <td className="px-4 py-3 text-gray-900 font-medium">{rating.skill_name}</td>
                              <td className="px-4 py-3 text-center">
                                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                                  {rating.required_level}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="text-center py-8 text-gray-500">
                              No competency requirements defined
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Employee Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
                    <div className="text-gray-900 font-medium">{selectedAssessment.employee_name}</div>
                    <div className="text-xs text-gray-500">ID: {selectedAssessment.employee_id}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                    <div className="text-gray-900 font-medium">{selectedAssessment.position_assessment_title}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <StatusBadge status={selectedAssessment.status} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Date</label>
                    <div className="text-gray-900">{new Date(selectedAssessment.assessment_date).toLocaleDateString()}</div>
                  </div>
                
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gap Score</label>
                    <GapIndicator gap={selectedAssessment.gap_score || 0} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Completion</label>
                    <CompletionIndicator percentage={selectedAssessment.completion_percentage} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Scores</label>
                    <div className="text-sm text-gray-600">
                      Employee: {selectedAssessment.total_employee_score} | Position: {selectedAssessment.total_position_score}
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedAssessment.notes && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Notes</label>
                    <p className="text-gray-900">{selectedAssessment.notes}</p>
                  </div>
                )}

                {/* Gap Analysis Summary */}
                {selectedAssessment.gap_analysis && Object.keys(selectedAssessment.gap_analysis).length > 0 && (
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-green-600 text-white p-3">
                      <h4 className="font-bold text-center">Gap Analysis Summary</h4>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {Object.entries(selectedAssessment.gap_analysis).map(([groupName, analysis]) => (
                          <div key={groupName} className="bg-gray-50 rounded-lg p-3 border">
                            <h5 className="font-semibold text-gray-900 mb-2">{groupName}</h5>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span>Total Skills:</span>
                                <span className="font-medium">{analysis.skills_count}</span>
                              </div>
                              <div className="flex justify-between text-green-600">
                                <span>Exceeds:</span>
                                <span className="font-medium">{analysis.exceeds_count}</span>
                              </div>
                              <div className="flex justify-between text-blue-600">
                                <span>Meets:</span>
                                <span className="font-medium">{analysis.meets_count}</span>
                              </div>
                              <div className="flex justify-between text-red-600">
                                <span>Below:</span>
                                <span className="font-medium">{analysis.below_count}</span>
                              </div>
                              <div className="flex justify-between border-t pt-1 mt-2">
                                <span>Total Gap:</span>
                                <GapIndicator gap={analysis.total_gap} />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Competency Ratings Details */}
                <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-blue-900 text-white p-3">
                    <h4 className="font-bold text-center">Detailed Assessment Results</h4>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="text-left px-4 py-3 font-semibold text-gray-900">Skill Group</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-900">Skill Name</th>
                          <th className="text-center px-4 py-3 font-semibold text-gray-900">Required</th>
                          <th className="text-center px-4 py-3 font-semibold text-gray-900">Actual</th>
                          <th className="text-center px-4 py-3 font-semibold text-gray-900">Gap</th>
                          <th className="text-left px-4 py-3 font-semibold text-gray-900">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedAssessment.competency_ratings?.length > 0 ? (
                          selectedAssessment.competency_ratings.map((rating, index) => (
                            <tr key={index} className="border-b hover:bg-gray-50">
                              <td className="px-4 py-3 text-gray-600">{rating.skill_group_name}</td>
                              <td className="px-4 py-3 text-gray-900 font-medium">{rating.skill_name}</td>
                              <td className="px-4 py-3 text-center">
                                <span className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                                  {rating.required_level}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="bg-gray-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                                  {rating.actual_level}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <GapIndicator gap={rating.gap} />
                              </td>
                              <td className="px-4 py-3 text-gray-600 text-sm">
                                {rating.notes || '-'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="text-center py-8 text-gray-500">
                              No assessment data available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
              <ActionButton
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedAssessment(null);
                }}
                icon={X}
                label="Close"
                variant="outline"
                size="md"
              />
            </div>
          </div>
        </div>
      )}

      {/* Create Position Assessment Modal */}
      {showCreatePositionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-5xl border-2 border-gray-200 shadow-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <Building className="w-5 h-5 text-blue-600" />
                {editingAssessment ? 'Edit' : 'Create'} Core Competency Position Template
              </h3>
              <button
                onClick={() => {
                  setShowCreatePositionModal(false);
                  setEditingAssessment(null);
                  setPositionFormData({ position_group: '', job_title: '', competency_ratings: [] });
                }}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position Group <span className="text-red-500">*</span>
                </label>
                <SearchableDropdown
                  options={positionGroups}
                  value={positionFormData.position_group}
                  onChange={(value) => setPositionFormData({...positionFormData, position_group: value})}
                  placeholder="Select Position Group"
                  displayKey="name"
                  valueKey="id"
                  searchPlaceholder="Search position groups..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <SearchableDropdown
                  options={jobTitles}
                  value={positionFormData.job_title}
                  onChange={(value) => setPositionFormData({...positionFormData, job_title: value})}
                  placeholder="Select Job Title"
                  allowStringOptions={true}
                  searchPlaceholder="Search job titles..."
                />
              </div>
            </div>

            {/* Core Scales Information Button */}
            <div className="mb-4 flex justify-center">
              <ActionButton
                onClick={() => setShowCoreScalesInfo(true)}
                icon={Info}
                label="View Core Competency Assessment Scale Information"
                variant="info"
                size="md"
              />
            </div>

            {/* Skills Assessment Matrix */}
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-blue-900 text-white p-3">
                <h4 className="font-bold text-center">Skills Assessment Matrix</h4>
                <p className="text-center text-sm opacity-90 mt-1">Select required skill levels for this position</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b-2 border-gray-200">
                      <th className="px-4 py-3 text-left font-semibold text-gray-900">Skill Name</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-900 min-w-32">Required Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skillGroups.length > 0 ? skillGroups.map(group => (
                      <React.Fragment key={group.id}>
                        <tr className="bg-blue-900 text-white">
                          <td colSpan="2" className="px-4 py-2 font-bold text-center uppercase text-sm">
                            {group.name}
                          </td>
                        </tr>
                        
                        {group.skills && group.skills.length > 0 ? group.skills.map(skill => (
                          <tr key={skill.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div>
                                <div className="font-medium text-gray-900">{skill.name}</div>
                                {skill.description && (
                                  <div className="text-sm text-gray-600 mt-1">{skill.description}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              <select
                                value={positionFormData.competency_ratings.find(r => r.skill_id === skill.id)?.required_level || ''}
                                onChange={(e) => {
                                  const newRatings = [...positionFormData.competency_ratings];
                                  const existingIndex = newRatings.findIndex(r => r.skill_id === skill.id);
                                  
                                  if (existingIndex >= 0) {
                                    if (e.target.value) {
                                      newRatings[existingIndex].required_level = parseInt(e.target.value);
                                    } else {
                                      newRatings.splice(existingIndex, 1);
                                    }
                                  } else if (e.target.value) {
                                    newRatings.push({
                                      skill_id: skill.id,
                                      required_level: parseInt(e.target.value)
                                    });
                                  }
                                  
                                  setPositionFormData({...positionFormData, competency_ratings: newRatings});
                                }}
                                className="w-full max-w-24 px-3 py-2 border border-gray-300 rounded-lg text-center focus:border-blue-500 focus:outline-none font-semibold"
                              >
                                <option value="">-</option>
                                {coreScales.map(scale => (
                                  <option key={scale.id} value={scale.scale}>{scale.scale}</option>
                                ))}
                              </select>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="2" className="px-4 py-3 text-center text-gray-500 text-sm italic">
                              No skills found in this group
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )) : (
                      <tr>
                        <td colSpan="2" className="px-4 py-8 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <AlertCircle className="w-8 h-8 mb-2 text-gray-400" />
                            <p className="font-medium">No skill groups available</p>
                            <p className="text-sm mt-1">Please configure skill groups first</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Selected Skills Summary */}
              {positionFormData.competency_ratings.length > 0 && (
                <div className="bg-blue-50 border-t-2 border-gray-200 p-4">
                  <h5 className="font-semibold text-gray-900 mb-2">Selected Skills ({positionFormData.competency_ratings.length})</h5>
                  <div className="flex flex-wrap gap-2">
                    {positionFormData.competency_ratings.map(rating => {
                      const skill = skillGroups.flatMap(g => g.skills || []).find(s => s.id === rating.skill_id);
                      return skill ? (
                        <div key={skill.id} className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                          {skill.name}: Level {rating.required_level}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t-2 border-gray-200">
              <ActionButton
                onClick={() => {
                  setShowCreatePositionModal(false);
                  setEditingAssessment(null);
                  setPositionFormData({ position_group: '', job_title: '', competency_ratings: [] });
                }}
                icon={X}
                label="Cancel"
                disabled={isSubmitting}
                variant="outline"
                size="md"
              />
              <ActionButton
                onClick={editingAssessment ? handleUpdatePositionAssessment : handleCreatePositionAssessment}
                icon={Save}
                label={editingAssessment ? 'Update Template' : 'Create Template'}
                disabled={!positionFormData.position_group || !positionFormData.job_title || positionFormData.competency_ratings.length === 0}
                loading={isSubmitting}
                variant="primary"
                size="md"
              />
            </div>
          </div>
        </div>
      )}

      {/* Core Scales Information Modal */}
      {showCoreScalesInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl border-2 border-gray-200 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <Info className="w-5 h-5 text-blue-600" />
                Core Competency Assessment Scale Information
              </h3>
              <button
                onClick={() => setShowCoreScalesInfo(false)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">Assessment Scale Definitions</h4>
                <div className="space-y-3">
                  {coreScales.length > 0 ? coreScales.map(scale => (
                    <div key={scale.id} className="bg-white p-3 rounded border">
                      <div className="flex items-start gap-3">
                        <span className="bg-blue-600 text-white px-2 py-1 rounded font-bold text-sm min-w-8 text-center">
                          {scale.scale}
                        </span>
                        <div>
                          <p className="text-gray-900 font-medium">{scale.description}</p>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-gray-500 text-center py-4">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>No core scales configured</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">How to Use</h4>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    Select the appropriate scale level for each skill based on the position requirements
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    Higher numbers indicate higher skill level requirements
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    Leave blank (-) for skills that are not required for this position
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
              <ActionButton
                onClick={() => setShowCoreScalesInfo(false)}
                icon={CheckCircle}
                label="Got it"
                variant="primary"
                size="md"
              />
            </div>
          </div>
        </div>
      )}

      {/* Create Employee Assessment Modal */}
      {showCreateEmployeeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-6xl border-2 border-gray-200 shadow-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <User className="w-5 h-5 text-blue-600" />
                Create Employee Core Competency Assessment
              </h3>
              <button
                onClick={() => {
                  setShowCreateEmployeeModal(false);
                  setSelectedEmployeeInfo(null);
                  setDuplicateWarning(null);
                  setNoTemplateWarning(null);
                  setEmployeeFormData({
                    employee: '',
                    position_assessment: '',
                    notes: '',
                    competency_ratings: []
                  });
                }}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Duplicate Assessment Warning */}
            {duplicateWarning && (
              <DuplicateAssessmentWarning
                employeeName={duplicateWarning.employeeName}
                onClose={() => setDuplicateWarning(null)}
              />
            )}
            
            {/* No Template Warning */}
            {noTemplateWarning && (
              <NoTemplateWarning
                jobTitle={noTemplateWarning.jobTitle}
                onClose={() => setNoTemplateWarning(null)}
              />
            )}
            
            {/* Employee Selection */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Employee <span className="text-red-500">*</span>
                  </label>
                  <SearchableDropdown
                    options={employees}
                    value={employeeFormData.employee}
                    onChange={handleEmployeeChange}
                    placeholder="Select Employee"
                    displayKey="name"
                    valueKey="id"
                    searchPlaceholder="Search employees..."
                  />
                </div>
              </div>
              
              {/* Employee Info Display */}
              {selectedEmployeeInfo && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-blue-900">Employee:</span>
                      <span className="ml-2 text-blue-700">{selectedEmployeeInfo.name}</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-900">Job Title:</span>
                      <span className="ml-2 text-blue-700">{selectedEmployeeInfo.job_title}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Core Scales Information Button */}
            <div className="mb-4 flex justify-center">
              <ActionButton
                onClick={() => setShowCoreScalesInfo(true)}
                icon={Info}
                label="View Core Competency Assessment Scale Information"
                variant="info"
                size="md"
              />
            </div>

            {/* Assessment Matrix Table */}
            {employeeFormData.position_assessment && (
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-blue-900 text-white p-3">
                  <h4 className="font-bold text-center">Employee Core Competency Assessment Matrix</h4>
                  <p className="text-center text-sm opacity-90">
                    Based on: {positionAssessments.find(p => p.id === employeeFormData.position_assessment)?.job_title}
                  </p>
                </div>
                
                {/* Assessment Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100 border-b">
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 min-w-48">
                          CORE COMPETENCIES 
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-900 min-w-24">
                          REQUIRED
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-900 min-w-24">
                          ACTUAL
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-900 min-w-24">
                          GAP
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 min-w-64">
                          ASSESSMENT NOTES
                        </th>
                      </tr>
                    </thead>
                    
                    <tbody>
                      {(() => {
                        const selectedPosition = positionAssessments.find(p => p.id === employeeFormData.position_assessment);
                        if (!selectedPosition) return null;

                        const groupedSkills = {};
                        selectedPosition.competency_ratings?.forEach(rating => {
                          const groupName = rating.skill_group_name || 'Other';
                          if (!groupedSkills[groupName]) {
                            groupedSkills[groupName] = [];
                          }
                          groupedSkills[groupName].push(rating);
                        });

                        return Object.entries(groupedSkills).map(([groupName, skills]) => (
                          <React.Fragment key={groupName}>
                            <tr className="bg-blue-900 text-white">
                              <td colSpan="5" className="px-4 py-2 font-bold text-center uppercase">
                                {groupName}
                              </td>
                            </tr>
                            
                            {skills.map(skill => {
                              const employeeRating = employeeFormData.competency_ratings.find(
                                r => r.skill_id === skill.skill
                              );
                              
                              const actualLevel = employeeRating?.actual_level || 0;
                              const gap = actualLevel - skill.required_level;
                              
                              return (
                                <tr key={skill.id} className="border-b hover:bg-gray-50">
                                  <td className="px-4 py-3 font-medium text-gray-900">
                                    {skill.skill_name}
                                  </td>
                                  <td className="px-4 py-3 text-center font-bold text-blue-600">
                                    {skill.required_level}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <select
                                      value={actualLevel}
                                      onChange={(e) => {
                                        const newRatings = [...employeeFormData.competency_ratings];
                                        const existingIndex = newRatings.findIndex(
                                          r => r.skill_id === skill.skill
                                        );
                                        
                                        if (existingIndex >= 0) {
                                          newRatings[existingIndex].actual_level = parseInt(e.target.value);
                                        } else {
                                          newRatings.push({
                                            skill_id: skill.skill,
                                            actual_level: parseInt(e.target.value),
                                            notes: ''
                                          });
                                        }
                                        
                                        setEmployeeFormData({
                                          ...employeeFormData, 
                                          competency_ratings: newRatings
                                        });
                                      }}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-center font-bold focus:border-blue-500 focus:outline-none"
                                    >
                                      {coreScales.map(scale => (
                                        <option key={scale.id} value={scale.scale}>{scale.scale}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                      gap > 0 ? 'bg-green-100 text-green-800' :
                                      gap < 0 ? 'bg-red-100 text-red-800' :
                                      'bg-blue-100 text-blue-800'
                                    }`}>
                                      {gap > 0 ? `+${gap}` : gap}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <textarea
                                      value={employeeRating?.notes || ''}
                                      onChange={(e) => {
                                        const newRatings = [...employeeFormData.competency_ratings];
                                        const existingIndex = newRatings.findIndex(
                                          r => r.skill_id === skill.skill
                                        );
                                        
                                        if (existingIndex >= 0) {
                                          newRatings[existingIndex].notes = e.target.value;
                                        } else {
                                          newRatings.push({
                                            skill_id: skill.skill,
                                            actual_level: 0,
                                            notes: e.target.value
                                          });
                                        }
                                        
                                        setEmployeeFormData({
                                          ...employeeFormData, 
                                          competency_ratings: newRatings
                                        });
                                      }}
                                      placeholder="Assessment notes..."
                                      rows="2"
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none focus:border-blue-500 focus:outline-none"
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t-2 border-gray-200">
              <ActionButton
                onClick={() => {
                  setShowCreateEmployeeModal(false);
                  setSelectedEmployeeInfo(null);
                  setDuplicateWarning(null);
                  setNoTemplateWarning(null);
                  setEmployeeFormData({
                    employee: '',
                    position_assessment: '',
                    notes: '',
                    competency_ratings: []
                  });
                }}
                icon={X}
                label="Cancel"
                disabled={isSubmitting}
                variant="outline"
                size="md"
              />
              <ActionButton
                onClick={() => handleEmployeeAssessmentAction('save_draft')}
                icon={Save}
                label="Save as Draft"
                disabled={!employeeFormData.employee || !employeeFormData.position_assessment || duplicateWarning || noTemplateWarning}
                loading={isSubmitting}
                variant="secondary"
                size="md"
              />
              <ActionButton
                onClick={() => handleEmployeeAssessmentAction('submit')}
                icon={Send}
                label="Save & Submit"
                disabled={!employeeFormData.employee || !employeeFormData.position_assessment || duplicateWarning || noTemplateWarning}
                loading={isSubmitting}
                variant="success"
                size="md"
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Assessment Modal */}
      {showEditEmployeeModal && editingAssessment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-6xl border-2 border-gray-200 shadow-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <Edit className="w-5 h-5 text-blue-600" />
                Edit Employee Core Competency Assessment
              </h3>
              <button
                onClick={() => {
                  setShowEditEmployeeModal(false);
                  setEditingAssessment(null);
                  setSelectedEmployeeInfo(null);
                  setEmployeeFormData({
                    employee: '',
                    position_assessment: '',
                    notes: '',
                    competency_ratings: []
                  });
                }}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Employee Info Display */}
            {selectedEmployeeInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 mb-6 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-1 gap-3 text-sm">
                    <div>
                      <span className="font-medium text-blue-900">Employee:</span>
                      <span className="ml-2 text-blue-700">{selectedEmployeeInfo.name}</span>
                    </div>
                    <div>
                      <span className="font-medium text-blue-900">Job Title:</span>
                      <span className="ml-2 text-blue-700">{selectedEmployeeInfo.job_title}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg border">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assessment Notes</label>
                  <textarea
                    value={employeeFormData.notes}
                    onChange={(e) => setEmployeeFormData({...employeeFormData, notes: e.target.value})}
                    placeholder="Additional assessment notes..."
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {/* Core Scales Information Button */}
            <div className="mb-4 flex justify-center">
              <ActionButton
                onClick={() => setShowCoreScalesInfo(true)}
                icon={Info}
                label="View Core Competency Assessment Scale Information"
                variant="info"
                size="md"
              />
            </div>

            {/* Assessment Matrix Table */}
            {employeeFormData.position_assessment && (
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-blue-900 text-white p-3">
                  <h4 className="font-bold text-center">Employee Core Competency Assessment Matrix</h4>
                  <p className="text-center text-sm opacity-90">
                    Based on: {positionAssessments.find(p => p.id === employeeFormData.position_assessment)?.job_title}
                  </p>
                </div>
                
                {/* Assessment Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100 border-b">
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 min-w-48">
                          CORE COMPETENCIES 
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-900 min-w-24">
                          REQUIRED
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-900 min-w-24">
                          ACTUAL
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-900 min-w-24">
                          GAP
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 min-w-64">
                          ASSESSMENT NOTES
                        </th>
                      </tr>
                    </thead>
                    
                    <tbody>
                      {(() => {
                        const selectedPosition = positionAssessments.find(p => p.id === employeeFormData.position_assessment);
                        if (!selectedPosition) return null;

                        const groupedSkills = {};
                        selectedPosition.competency_ratings?.forEach(rating => {
                          const groupName = rating.skill_group_name || 'Other';
                          if (!groupedSkills[groupName]) {
                            groupedSkills[groupName] = [];
                          }
                          groupedSkills[groupName].push(rating);
                        });

                        return Object.entries(groupedSkills).map(([groupName, skills]) => (
                          <React.Fragment key={groupName}>
                            <tr className="bg-blue-900 text-white">
                              <td colSpan="5" className="px-4 py-2 font-bold text-center uppercase">
                                {groupName}
                              </td>
                            </tr>
                            
                            {skills.map(skill => {
                              const employeeRating = employeeFormData.competency_ratings.find(
                                r => r.skill_id === skill.skill
                              );
                              
                              const actualLevel = employeeRating?.actual_level || 0;
                              const gap = actualLevel - skill.required_level;
                              
                              return (
                                <tr key={skill.id} className="border-b hover:bg-gray-50">
                                  <td className="px-4 py-3 font-medium text-gray-900">
                                    {skill.skill_name}
                                  </td>
                                  <td className="px-4 py-3 text-center font-bold text-blue-600">
                                    {skill.required_level}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <select
                                      value={actualLevel}
                                      onChange={(e) => {
                                        const newRatings = [...employeeFormData.competency_ratings];
                                        const existingIndex = newRatings.findIndex(
                                          r => r.skill_id === skill.skill
                                        );
                                        
                                        if (existingIndex >= 0) {
                                          newRatings[existingIndex].actual_level = parseInt(e.target.value);
                                        } else {
                                          newRatings.push({
                                            skill_id: skill.skill,
                                            actual_level: parseInt(e.target.value),
                                            notes: ''
                                          });
                                        }
                                        
                                        setEmployeeFormData({
                                          ...employeeFormData, 
                                          competency_ratings: newRatings
                                        });
                                      }}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-center font-bold focus:border-blue-500 focus:outline-none"
                                    >
                                      {coreScales.map(scale => (
                                        <option key={scale.id} value={scale.scale}>{scale.scale}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                      gap > 0 ? 'bg-green-100 text-green-800' :
                                      gap < 0 ? 'bg-red-100 text-red-800' :
                                      'bg-blue-100 text-blue-800'
                                    }`}>
                                      {gap > 0 ? `+${gap}` : gap}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <textarea
                                      value={employeeRating?.notes || ''}
                                      onChange={(e) => {
                                        const newRatings = [...employeeFormData.competency_ratings];
                                        const existingIndex = newRatings.findIndex(
                                          r => r.skill_id === skill.skill
                                        );
                                        
                                        if (existingIndex >= 0) {
                                          newRatings[existingIndex].notes = e.target.value;
                                        } else {
                                          newRatings.push({
                                            skill_id: skill.skill,
                                            actual_level: 0,
                                            notes: e.target.value
                                          });
                                        }
                                        
                                        setEmployeeFormData({
                                          ...employeeFormData, 
                                          competency_ratings: newRatings
                                        });
                                      }}
                                      placeholder="Assessment notes..."
                                      rows="2"
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none focus:border-blue-500 focus:outline-none"
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </React.Fragment>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t-2 border-gray-200">
              <ActionButton
                onClick={() => {
                  setShowEditEmployeeModal(false);
                  setEditingAssessment(null);
                  setSelectedEmployeeInfo(null);
                  setEmployeeFormData({
                    employee: '',
                    position_assessment: '',
                    notes: '',
                    competency_ratings: []
                  });
                }}
                icon={X}
                label="Cancel"
                disabled={isSubmitting}
                variant="outline"
                size="md"
              />
              <ActionButton
                onClick={handleUpdateAssessment}
                icon={Save}
                label="Update Assessment"
                loading={isSubmitting}
                variant="primary"
                size="md"
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
        <ErrorToast 
          error={error} 
          onClose={() => setError(null)} 
        />
      )}
    </div>
  );
};

export default CoreEmployeeCalculation;