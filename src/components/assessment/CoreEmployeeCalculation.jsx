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

// Shared Components
const ActionButton = ({ onClick, icon: Icon, label, variant = 'primary', loading = false, disabled = false, size = 'sm' }) => {
  const variants = {
    primary: 'bg-almet-sapphire hover:bg-almet-astral text-white',
    secondary: 'bg-almet-bali-hai hover:bg-almet-waterloo text-white',
    success: 'bg-almet-steel-blue hover:bg-almet-astral text-white',
    danger: 'bg-red-400 hover:bg-red-500 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    outline: 'border border-almet-sapphire text-almet-sapphire hover:bg-almet-sapphire hover:text-white',
    info: 'bg-almet-astral hover:bg-almet-sapphire text-white'
  };

  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-3 py-2 text-sm'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`flex items-center gap-2 rounded-lg font-medium transition-all duration-200 hover:shadow ${variants[variant]} ${sizes[size]} ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
      {label}
    </button>
  );
};

const GapIndicator = ({ gap }) => {
  if (gap > 0) {
    return (
      <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
        <TrendingUp size={12} />
        +{gap}
      </span>
    );
  } else if (gap < 0) {
    return (
      <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-200">
        <TrendingDown size={12} />
        {gap}
      </span>
    );
  } else {
    return (
      <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
        <Minus size={12} />
        0
      </span>
    );
  }
};

const CompletionIndicator = ({ percentage }) => {
  const numPercentage = parseFloat(percentage) || 0;
  let colorClass = 'bg-red-100 text-red-700 border-red-200';
  
  if (numPercentage >= 100) {
    colorClass = 'bg-green-100 text-green-700 border-green-200';
  } else if (numPercentage >= 80) {
    colorClass = 'bg-blue-100 text-blue-700 border-blue-200';
  } else if (numPercentage >= 60) {
    colorClass = 'bg-yellow-100 text-yellow-700 border-yellow-200';
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
      {numPercentage.toFixed(0)}%
    </span>
  );
};

const DuplicateAssessmentWarning = ({ employeeName, onClose }) => {
  return (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-red-800 text-sm mb-1">Duplicate Assessment</h4>
          <p className="text-red-700 text-sm">
            {employeeName} already has a core assessment. Each employee can only have one assessment.
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-red-500 hover:text-red-700 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

const NoTemplateWarning = ({ jobTitle, onClose }) => {
  return (
    <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-start gap-2">
        <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h4 className="font-medium text-yellow-800 text-sm mb-1">No Assessment Template Found</h4>
          <p className="text-yellow-700 text-sm">
            No core assessment template found for <strong>{jobTitle}</strong>. Please create a position assessment template first.
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-yellow-600 hover:text-yellow-800 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};

// Main Component
const CoreEmployeeCalculation = () => {
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

  const [selectedEmployeeInfo, setSelectedEmployeeInfo] = useState(null);

  // Data fetching
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
      
      const skillGroupsList = skillGroupsRes.results || [];
      const skillGroupsDetails = await Promise.all(
        skillGroupsList.map(group => competencyApi.skillGroups.getById(group.id))
      );
      setSkillGroups(skillGroupsDetails);
      
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

  // Employee selection handler
  const handleEmployeeChange = async (employeeId) => {
    const selectedEmployee = employees.find(e => e.id === employeeId);
    if (!selectedEmployee) return;
    
    setDuplicateWarning(null);
    setNoTemplateWarning(null);
    
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
      const data = {
        ...employeeFormData,
        action_type: 'save_draft'
      };
      
      const response = await assessmentApi.employeeCore.create(data);
      
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

  // Data filtering
  const filteredPositionAssessments = positionAssessments.filter(assessment => 
    assessment.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assessment.position_group_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEmployeeAssessments = employeeAssessments.filter(assessment => 
    (assessment.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     assessment.position_assessment_title?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedStatus === '' || assessment.status === selectedStatus)
  );

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-8 text-center border border-almet-bali-hai">
        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-almet-sapphire" />
        <p className="text-almet-waterloo font-medium text-sm">Loading assessments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg p-1 shadow-sm border border-almet-bali-hai">
        <div className="flex space-x-1">
          <button
            onClick={() => setActiveTab('position')}
            className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-all duration-200 ${
              activeTab === 'position'
                ? 'bg-almet-sapphire text-white shadow-sm'
                : 'text-almet-waterloo hover:text-almet-cloud-burst hover:bg-almet-mystic'
            }`}
          >
            <Building size={14} />
            <div className="text-left">
              <div className="font-medium">Position Templates</div>
              <div className="text-xs opacity-75">Define skill requirements</div>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('employee')}
            className={`flex items-center gap-2 px-3 py-2 rounded text-sm font-medium transition-all duration-200 ${
              activeTab === 'employee'
                ? 'bg-almet-sapphire text-white shadow-sm'
                : 'text-almet-waterloo hover:text-almet-cloud-burst hover:bg-almet-mystic'
            }`}
          >
            <Target size={14} />
            <div className="text-left">
              <div className="font-medium">Employee Assessments</div>
              <div className="text-xs opacity-75">Assess individual employees</div>
            </div>
          </button>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg p-3 shadow-sm border border-almet-bali-hai">
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-almet-waterloo" size={14} />
              <input
                type="text"
                placeholder={`Search ${activeTab === 'position' ? 'positions' : 'employees'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-almet-bali-hai rounded-lg text-sm bg-white focus:border-almet-sapphire focus:outline-none"
              />
            </div>
            
            {activeTab === 'employee' && (
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-almet-bali-hai rounded-lg text-sm bg-white focus:border-almet-sapphire focus:outline-none min-w-32"
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
      <div className="bg-white rounded-lg shadow-sm border border-almet-bali-hai overflow-hidden">
        {activeTab === 'position' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-almet-mystic border-b border-almet-bali-hai">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-almet-cloud-burst text-sm">Position Group</th>
                  <th className="text-left px-4 py-3 font-medium text-almet-cloud-burst text-sm">Job Title</th>
                  <th className="text-left px-4 py-3 font-medium text-almet-cloud-burst text-sm">Skills</th>
                  <th className="text-left px-4 py-3 font-medium text-almet-cloud-burst text-sm">Created</th>
                  <th className="text-center px-4 py-3 font-medium text-almet-cloud-burst text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPositionAssessments.length > 0 ? (
                  filteredPositionAssessments.map((assessment) => (
                    <tr key={assessment.id} className="border-b border-almet-bali-hai hover:bg-almet-mystic transition-colors">
                      <td className="px-4 py-3 text-almet-cloud-burst font-medium text-sm">{assessment.position_group_name}</td>
                      <td className="px-4 py-3 text-almet-cloud-burst text-sm">{assessment.job_title}</td>
                      <td className="px-4 py-3 text-almet-waterloo text-sm">{assessment.competency_ratings?.length || 0} skills</td>
                      <td className="px-4 py-3 text-almet-waterloo text-xs">{new Date(assessment.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <ActionButton
                            onClick={() => {
                              setSelectedAssessment(assessment);
                              setShowViewModal(true);
                            }}
                            icon={Eye}
                            label=""
                            variant="outline"
                            size="xs"
                          />
                          <ActionButton
                            onClick={() => handleEditPositionAssessment(assessment)}
                            icon={Edit}
                            label=""
                            variant="info"
                            size="xs"
                          />
                          <ActionButton
                            onClick={() => handleDelete(assessment.id, 'position')}
                            icon={Trash2}
                            label=""
                            variant="danger"
                            size="xs"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-8">
                      <Building className="w-8 h-8 mx-auto mb-3 text-almet-waterloo opacity-50" />
                      <p className="text-almet-waterloo font-medium text-sm">No position templates found</p>
                      <p className="text-almet-santas-gray text-xs mt-1">Create your first position assessment template</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-almet-mystic border-b border-almet-bali-hai">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-almet-cloud-burst text-sm">Employee</th>
                  <th className="text-left px-4 py-3 font-medium text-almet-cloud-burst text-sm">Position</th>
                  <th className="text-left px-4 py-3 font-medium text-almet-cloud-burst text-sm">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-almet-cloud-burst text-sm">Gap Score</th>
                  <th className="text-left px-4 py-3 font-medium text-almet-cloud-burst text-sm">Completion</th>
                  <th className="text-left px-4 py-3 font-medium text-almet-cloud-burst text-sm">Date</th>
                  <th className="text-center px-4 py-3 font-medium text-almet-cloud-burst text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployeeAssessments.length > 0 ? (
                  filteredEmployeeAssessments.map((assessment) => (
                    <tr key={assessment.id} className="border-b border-almet-bali-hai hover:bg-almet-mystic transition-colors">
                      <td className="px-4 py-3 text-almet-cloud-burst font-medium text-sm">
                        <div>
                          <div>{assessment.employee_name}</div>
                          <div className="text-xs text-almet-waterloo">ID: {assessment.employee_id}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-almet-cloud-burst text-sm">{assessment.position_assessment_title}</td>
                      <td className="px-4 py-3"><StatusBadge status={assessment.status} /></td>
                      <td className="px-4 py-3"><GapIndicator gap={assessment.gap_score || 0} /></td>
                      <td className="px-4 py-3"><CompletionIndicator percentage={assessment.completion_percentage} /></td>
                      <td className="px-4 py-3 text-almet-waterloo text-xs">{new Date(assessment.assessment_date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          <ActionButton
                            onClick={() => {
                              setSelectedAssessment(assessment);
                              setShowViewModal(true);
                            }}
                            icon={Eye}
                            label=""
                            variant="outline"
                            size="xs"
                          />
                          {assessment.status === 'DRAFT' && (
                            <>
                              <ActionButton
                                onClick={() => handleEditAssessment(assessment)}
                                icon={Edit}
                                label=""
                                variant="info"
                                size="xs"
                              />
                              <ActionButton
                                onClick={() => handleSubmitAssessment(assessment.id)}
                                icon={Send}
                                label=""
                                variant="success"
                                size="xs"
                              />
                            </>
                          )}
                          {assessment.status === 'COMPLETED' && (
                            <ActionButton
                              onClick={() => handleReopenAssessment(assessment.id)}
                              icon={RotateCcw}
                              label=""
                              variant="warning"
                              size="xs"
                            />
                          )}
                          <ActionButton
                            onClick={() => handleExport(assessment.id, 'employee')}
                            icon={Download}
                            label=""
                            variant="secondary"
                            size="xs"
                          />
                          <ActionButton
                            onClick={() => handleDelete(assessment.id, 'employee')}
                            icon={Trash2}
                            label=""
                            variant="danger"
                            size="xs"
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-8">
                      <Target className="w-8 h-8 mx-auto mb-3 text-almet-waterloo opacity-50" />
                      <p className="text-almet-waterloo font-medium text-sm">No employee assessments found</p>
                      <p className="text-almet-santas-gray text-xs mt-1">Create your first employee assessment</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Assessment Modal */}
      {showViewModal && selectedAssessment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-5xl border border-almet-bali-hai shadow-lg max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-almet-cloud-burst flex items-center gap-2">
                {activeTab === 'position' ? (
                  <>
                    <Building className="w-4 h-4 text-almet-sapphire" />
                    Position Assessment Template Details
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 text-almet-sapphire" />
                    Employee Assessment Details
                  </>
                )}
              </h3>
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedAssessment(null);
                }}
                className="p-2 rounded-lg text-almet-waterloo hover:bg-almet-mystic transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {activeTab === 'position' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-almet-mystic rounded-lg border border-almet-bali-hai">
                  <div>
                    <label className="block text-sm font-medium text-almet-waterloo mb-1">Position Group</label>
                    <div className="text-almet-cloud-burst font-medium text-sm">{selectedAssessment.position_group_name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-almet-waterloo mb-1">Job Title</label>
                    <div className="text-almet-cloud-burst font-medium text-sm">{selectedAssessment.job_title}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-almet-waterloo mb-1">Created By</label>
                    <div className="text-almet-cloud-burst text-sm">{selectedAssessment.created_by_name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-almet-waterloo mb-1">Created Date</label>
                    <div className="text-almet-cloud-burst text-sm">{new Date(selectedAssessment.created_at).toLocaleDateString()}</div>
                  </div>
                </div>

                <div className="border border-almet-bali-hai rounded-lg overflow-hidden">
                  <div className="bg-almet-sapphire text-white p-3">
                    <h4 className="font-semibold text-center text-sm">Required Competency Levels</h4>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-almet-mystic border-b border-almet-bali-hai">
                          <th className="text-left px-3 py-2 font-medium text-almet-cloud-burst text-sm">Skill Group</th>
                          <th className="text-left px-3 py-2 font-medium text-almet-cloud-burst text-sm">Skill Name</th>
                          <th className="text-center px-3 py-2 font-medium text-almet-cloud-burst text-sm">Required Level</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedAssessment.competency_ratings?.length > 0 ? (
                          selectedAssessment.competency_ratings.map((rating, index) => (
                            <tr key={index} className="border-b border-almet-bali-hai hover:bg-almet-mystic">
                              <td className="px-3 py-2 text-almet-waterloo text-sm">{rating.skill_group_name}</td>
                              <td className="px-3 py-2 text-almet-cloud-burst font-medium text-sm">{rating.skill_name}</td>
                              <td className="px-3 py-2 text-center">
                                <span className="bg-almet-sapphire text-white px-2 py-1 rounded-full text-xs font-medium">
                                  {rating.required_level}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="text-center py-6 text-almet-waterloo text-sm">
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
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 p-3 bg-almet-mystic rounded-lg border border-almet-bali-hai">
                  <div>
                    <label className="block text-sm font-medium text-almet-waterloo mb-1">Employee</label>
                    <div className="text-almet-cloud-burst font-medium text-sm">{selectedAssessment.employee_name}</div>
                    <div className="text-xs text-almet-waterloo">ID: {selectedAssessment.employee_id}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-almet-waterloo mb-1">Position</label>
                    <div className="text-almet-cloud-burst font-medium text-sm">{selectedAssessment.position_assessment_title}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-almet-waterloo mb-1">Status</label>
                    <StatusBadge status={selectedAssessment.status} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-almet-waterloo mb-1">Assessment Date</label>
                    <div className="text-almet-cloud-burst text-sm">{new Date(selectedAssessment.assessment_date).toLocaleDateString()}</div>
                  </div>
                
                  <div>
                    <label className="block text-sm font-medium text-almet-waterloo mb-1">Gap Score</label>
                    <GapIndicator gap={selectedAssessment.gap_score || 0} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-almet-waterloo mb-1">Completion</label>
                    <CompletionIndicator percentage={selectedAssessment.completion_percentage} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-almet-waterloo mb-1">Total Scores</label>
                    <div className="text-sm text-almet-waterloo">
                      Employee: {selectedAssessment.total_employee_score} | Position: {selectedAssessment.total_position_score}
                    </div>
                  </div>
                </div>

                {selectedAssessment.notes && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <label className="block text-sm font-medium text-almet-waterloo mb-2">Assessment Notes</label>
                    <p className="text-almet-cloud-burst text-sm">{selectedAssessment.notes}</p>
                  </div>
                )}

                <div className="border border-almet-bali-hai rounded-lg overflow-hidden">
                  <div className="bg-almet-sapphire text-white p-3">
                    <h4 className="font-semibold text-center text-sm">Detailed Assessment Results</h4>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-almet-mystic border-b border-almet-bali-hai">
                          <th className="text-left px-3 py-2 font-medium text-almet-cloud-burst text-sm">Skill Group</th>
                          <th className="text-left px-3 py-2 font-medium text-almet-cloud-burst text-sm">Skill Name</th>
                          <th className="text-center px-3 py-2 font-medium text-almet-cloud-burst text-sm">Required</th>
                          <th className="text-center px-3 py-2 font-medium text-almet-cloud-burst text-sm">Actual</th>
                          <th className="text-center px-3 py-2 font-medium text-almet-cloud-burst text-sm">Gap</th>
                          <th className="text-left px-3 py-2 font-medium text-almet-cloud-burst text-sm">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedAssessment.competency_ratings?.length > 0 ? (
                          selectedAssessment.competency_ratings.map((rating, index) => (
                            <tr key={index} className="border-b border-almet-bali-hai hover:bg-almet-mystic">
                              <td className="px-3 py-2 text-almet-waterloo text-sm">{rating.skill_group_name}</td>
                              <td className="px-3 py-2 text-almet-cloud-burst font-medium text-sm">{rating.skill_name}</td>
                              <td className="px-3 py-2 text-center">
                                <span className="bg-almet-sapphire text-white px-2 py-1 rounded-full text-xs font-medium">
                                  {rating.required_level}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span className="bg-almet-bali-hai text-white px-2 py-1 rounded-full text-xs font-medium">
                                  {rating.actual_level}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <GapIndicator gap={rating.gap} />
                              </td>
                              <td className="px-3 py-2 text-almet-waterloo text-sm">
                                {rating.notes || '-'}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="text-center py-6 text-almet-waterloo text-sm">
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

            <div className="flex justify-end mt-4 pt-4 border-t border-almet-bali-hai">
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
          <div className="bg-white rounded-lg p-4 w-full max-w-4xl border border-almet-bali-hai shadow-lg max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-almet-cloud-burst flex items-center gap-2">
                <Building className="w-4 h-4 text-almet-sapphire" />
                {editingAssessment ? 'Edit' : 'Create'} Core Competency Position Template
              </h3>
              <button
                onClick={() => {
                  setShowCreatePositionModal(false);
                  setEditingAssessment(null);
                  setPositionFormData({ position_group: '', job_title: '', competency_ratings: [] });
                }}
                className="p-2 rounded-lg text-almet-waterloo hover:bg-almet-mystic transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 p-3 bg-almet-mystic rounded-lg border border-almet-bali-hai">
              <div>
                <label className="block text-sm font-medium text-almet-waterloo mb-2">
                  Position Group <span className="text-red-400">*</span>
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
                <label className="block text-sm font-medium text-almet-waterloo mb-2">
                  Job Title <span className="text-red-400">*</span>
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

            <div className="mb-3 flex justify-center">
              <ActionButton
                onClick={() => setShowCoreScalesInfo(true)}
                icon={Info}
                label="View Core Competency Assessment Scale Information"
                variant="info"
                size="md"
              />
            </div>

            <div className="border border-almet-bali-hai rounded-lg overflow-hidden">
              <div className="bg-almet-sapphire text-white p-3">
                <h4 className="font-semibold text-center text-sm">Skills Assessment Matrix</h4>
                <p className="text-center text-xs opacity-90 mt-1">Select required skill levels for this position</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-almet-mystic border-b border-almet-bali-hai">
                      <th className="px-3 py-2 text-left font-medium text-almet-cloud-burst text-sm">Skill Name</th>
                      <th className="px-3 py-2 text-center font-medium text-almet-cloud-burst text-sm min-w-24">Required Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {skillGroups.length > 0 ? skillGroups.map(group => (
                      <React.Fragment key={group.id}>
                        <tr className="bg-almet-sapphire text-white">
                          <td colSpan="2" className="px-3 py-2 font-semibold text-center uppercase text-sm">
                            {group.name}
                          </td>
                        </tr>
                        
                        {group.skills && group.skills.length > 0 ? group.skills.map(skill => (
                          <tr key={skill.id} className="border-b border-almet-bali-hai hover:bg-almet-mystic">
                            <td className="px-3 py-2">
                              <div>
                                <div className="font-medium text-almet-cloud-burst text-sm">{skill.name}</div>
                                {skill.description && (
                                  <div className="text-sm text-almet-waterloo mt-1">{skill.description}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center">
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
                                className="w-full max-w-20 px-2 py-1 border border-almet-bali-hai rounded text-center focus:border-almet-sapphire focus:outline-none font-medium text-sm"
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
                            <td colSpan="2" className="px-3 py-2 text-center text-almet-waterloo text-sm italic">
                              No skills found in this group
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )) : (
                      <tr>
                        <td colSpan="2" className="px-3 py-6 text-center text-almet-waterloo">
                          <div className="flex flex-col items-center">
                            <AlertCircle className="w-6 h-6 mb-2 text-almet-bali-hai" />
                            <p className="font-medium text-sm">No skill groups available</p>
                            <p className="text-xs mt-1">Please configure skill groups first</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

             
            </div>
            
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-almet-bali-hai">
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
          <div className="bg-white rounded-lg p-4 w-full max-w-3xl border border-almet-bali-hai shadow-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-almet-cloud-burst flex items-center gap-2">
                <Info className="w-4 h-4 text-almet-sapphire" />
                Core Competency Assessment Scale Information
              </h3>
              <button
                onClick={() => setShowCoreScalesInfo(false)}
                className="p-2 rounded-lg text-almet-waterloo hover:bg-almet-mystic transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-medium text-blue-900 mb-3 text-sm">Assessment Scale Definitions</h4>
                <div className="space-y-2">
                  {coreScales.length > 0 ? coreScales.map(scale => (
                    <div key={scale.id} className="bg-white p-3 rounded border">
                      <div className="flex items-start gap-2">
                        <span className="bg-almet-sapphire text-white px-2 py-1 rounded font-medium text-sm min-w-8 text-center">
                          {scale.scale}
                        </span>
                        <div>
                          <p className="text-almet-cloud-burst font-medium text-sm">{scale.description}</p>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-almet-waterloo text-center py-3">
                      <AlertCircle className="w-6 h-6 mx-auto mb-2 text-almet-bali-hai" />
                      <p className="text-sm">No core scales configured</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-almet-mystic border border-almet-bali-hai rounded-lg p-3">
                <h4 className="font-medium text-almet-cloud-burst mb-3 text-sm">How to Use</h4>
                <ul className="space-y-2 text-almet-waterloo text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-almet-bali-hai rounded-full mt-2 flex-shrink-0"></span>
                    Select the appropriate scale level for each skill based on the position requirements
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-almet-bali-hai rounded-full mt-2 flex-shrink-0"></span>
                    Higher numbers indicate higher skill level requirements
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-almet-bali-hai rounded-full mt-2 flex-shrink-0"></span>
                    Leave blank (-) for skills that are not required for this position
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end mt-4 pt-3 border-t border-almet-bali-hai">
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
          <div className="bg-white rounded-lg p-4 w-full max-w-5xl max-h-[60vh] overflow-auto border border-almet-bali-hai shadow-lg  ">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-almet-cloud-burst flex items-center gap-2">
                <User className="w-4 h-4 text-almet-sapphire" />
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
                className="p-2 rounded-lg text-almet-waterloo hover:bg-almet-mystic transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            {duplicateWarning && (
              <DuplicateAssessmentWarning
                employeeName={duplicateWarning.employeeName}
                onClose={() => setDuplicateWarning(null)}
              />
            )}
            
            {noTemplateWarning && (
              <NoTemplateWarning
                jobTitle={noTemplateWarning.jobTitle}
                onClose={() => setNoTemplateWarning(null)}
              />
            )}
            
            <div className="mb-4 p-3 bg-almet-mystic rounded-lg border border-almet-bali-hai">
              <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
                <div>
                  <label className="block text-sm font-medium text-almet-waterloo mb-2">
                    Employee <span className="text-red-400">*</span>
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
              
              {selectedEmployeeInfo && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-2 gap-3 text-sm">
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

            <div className="mb-3 flex justify-center">
              <ActionButton
                onClick={() => setShowCoreScalesInfo(true)}
                icon={Info}
                label="View Core Competency Assessment Scale Information"
                variant="info"
                size="md"
              />
            </div>

            {employeeFormData.position_assessment && !duplicateWarning && !noTemplateWarning && (
              <div className="border border-almet-bali-hai rounded-lg overflow-hidden">
                <div className="bg-almet-sapphire text-white p-3">
                  <h4 className="font-semibold text-center text-sm">Employee Core Competency Assessment Matrix</h4>
                  <p className="text-center text-xs opacity-90">
                    Based on: {positionAssessments.find(p => p.id === employeeFormData.position_assessment)?.job_title}
                  </p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-almet-mystic border-b border-almet-bali-hai">
                        <th className="px-3 py-2 text-left font-medium text-almet-cloud-burst text-sm min-w-40">
                          CORE COMPETENCIES 
                        </th>
                        <th className="px-3 py-2 text-center font-medium text-almet-cloud-burst text-sm min-w-20">
                          REQUIRED
                        </th>
                        <th className="px-3 py-2 text-center font-medium text-almet-cloud-burst text-sm min-w-20">
                          ACTUAL
                        </th>
                        <th className="px-3 py-2 text-center font-medium text-almet-cloud-burst text-sm min-w-20">
                          GAP
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-almet-cloud-burst text-sm min-w-48">
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
                            <tr className="bg-almet-sapphire text-white">
                              <td colSpan="5" className="px-3 py-2 font-semibold text-center uppercase text-sm">
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
                                <tr key={skill.id} className="border-b border-almet-bali-hai hover:bg-almet-mystic">
                                  <td className="px-3 py-2 font-medium text-almet-cloud-burst text-sm">
                                    {skill.skill_name}
                                  </td>
                                  <td className="px-3 py-2 text-center font-semibold text-almet-sapphire">
                                    {skill.required_level}
                                  </td>
                                  <td className="px-3 py-2 text-center">
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
                                      className="w-full px-2 py-1 border border-almet-bali-hai rounded text-center font-semibold focus:border-almet-sapphire focus:outline-none text-sm"
                                    >
                                      {coreScales.map(scale => (
                                        <option key={scale.id} value={scale.scale}>{scale.scale}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      gap > 0 ? 'bg-green-100 text-green-700' :
                                      gap < 0 ? 'bg-red-100 text-red-700' :
                                      'bg-blue-100 text-blue-700'
                                    }`}>
                                      {gap > 0 ? `+${gap}` : gap}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2">
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
                                      className="w-full px-2 py-1 border border-almet-bali-hai rounded text-sm resize-none focus:border-almet-sapphire focus:outline-none"
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
            
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-almet-bali-hai">
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
              {employeeFormData.position_assessment && !duplicateWarning && !noTemplateWarning && (
                <>
                  <ActionButton
                    onClick={() => handleEmployeeAssessmentAction('save_draft')}
                    icon={Save}
                    label="Save as Draft"
                    disabled={!employeeFormData.employee || !employeeFormData.position_assessment}
                    loading={isSubmitting}
                    variant="secondary"
                    size="md"
                  />
                  <ActionButton
                    onClick={() => handleEmployeeAssessmentAction('submit')}
                    icon={Send}
                    label="Save & Submit"
                    disabled={!employeeFormData.employee || !employeeFormData.position_assessment}
                    loading={isSubmitting}
                    variant="success"
                    size="md"
                  />
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Assessment Modal */}
      {showEditEmployeeModal && editingAssessment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-5xl border border-almet-bali-hai shadow-lg max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-almet-cloud-burst flex items-center gap-2">
                <Edit className="w-4 h-4 text-almet-sapphire" />
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
                className="p-2 rounded-lg text-almet-waterloo hover:bg-almet-mystic transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            {selectedEmployeeInfo && (
              <div className="grid grid-cols-1 md:grid-cols-2 mb-4 gap-3">
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex justify-between text-sm">
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
                      <div className="mb-3 flex justify-center">
              <ActionButton
                onClick={() => setShowCoreScalesInfo(true)}
                icon={Info}
                label="View Core Competency Assessment Scale Information"
                variant="info"
                size="md"
              />
            </div>
              </div>
            )}

      

            {employeeFormData.position_assessment && (
              <div className="border border-almet-bali-hai rounded-lg overflow-hidden">
                <div className="bg-almet-sapphire text-white p-3">
                  <h4 className="font-semibold text-center text-sm">Employee Core Competency Assessment Matrix</h4>
                  <p className="text-center text-xs opacity-90">
                    Based on: {positionAssessments.find(p => p.id === employeeFormData.position_assessment)?.job_title}
                  </p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-almet-mystic border-b border-almet-bali-hai">
                        <th className="px-3 py-2 text-left font-medium text-almet-cloud-burst text-sm min-w-40">
                          CORE COMPETENCIES 
                        </th>
                        <th className="px-3 py-2 text-center font-medium text-almet-cloud-burst text-sm min-w-20">
                          REQUIRED
                        </th>
                        <th className="px-3 py-2 text-center font-medium text-almet-cloud-burst text-sm min-w-20">
                          ACTUAL
                        </th>
                        <th className="px-3 py-2 text-center font-medium text-almet-cloud-burst text-sm min-w-20">
                          GAP
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-almet-cloud-burst text-sm min-w-48">
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
                            <tr className="bg-almet-sapphire text-white">
                              <td colSpan="5" className="px-3 py-2 font-semibold text-center uppercase text-sm">
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
                                <tr key={skill.id} className="border-b border-almet-bali-hai hover:bg-almet-mystic">
                                  <td className="px-3 py-2 font-medium text-almet-cloud-burst text-sm">
                                    {skill.skill_name}
                                  </td>
                                  <td className="px-3 py-2 text-center font-semibold text-almet-sapphire">
                                    {skill.required_level}
                                  </td>
                                  <td className="px-3 py-2 text-center">
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
                                      className="w-full px-2 py-1 border border-almet-bali-hai rounded text-center font-semibold focus:border-almet-sapphire focus:outline-none text-sm"
                                    >
                                      {coreScales.map(scale => (
                                        <option key={scale.id} value={scale.scale}>{scale.scale}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      gap > 0 ? 'bg-green-100 text-green-700' :
                                      gap < 0 ? 'bg-red-100 text-red-700' :
                                      'bg-blue-100 text-blue-700'
                                    }`}>
                                      {gap > 0 ? `+${gap}` : gap}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2">
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
                                      className="w-full px-2 py-1 border border-almet-bali-hai rounded text-sm resize-none focus:border-almet-sapphire focus:outline-none"
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
            
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-almet-bali-hai">
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