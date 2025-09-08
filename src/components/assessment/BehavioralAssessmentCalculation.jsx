'use client';
import React, { useState, useEffect } from 'react';
import { 
  Plus, Users, Target, Search, Filter, Eye, Edit, Trash2, 
  Download, AlertCircle, CheckCircle, Loader2, X, Save, 
  ChevronDown, ChevronRight, User, Building, RefreshCw, Info
} from 'lucide-react';
import { assessmentApi } from '@/services/assessmentApi';
import { competencyApi } from '@/services/competencyApi';
import StatusBadge from './StatusBadge';
import SuccessToast from './SuccessToast';
import ErrorToast from './ErrorToast';
import SearchableDropdown from './SearchableDropdown';

const BehavioralAssessmentCalculation = () => {
  // Basic States
  const [activeTab, setActiveTab] = useState('employee');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal States
  const [showCreatePositionModal, setShowCreatePositionModal] = useState(false);
  const [showEditPositionModal, setShowEditPositionModal] = useState(false);
  const [showCreateEmployeeModal, setShowCreateEmployeeModal] = useState(false);
  const [showEditEmployeeModal, setShowEditEmployeeModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showScalesInfo, setShowScalesInfo] = useState(false);
  const [showEmployeeScalesInfo, setShowEmployeeScalesInfo] = useState(false);
  const [templateError, setTemplateError] = useState(null);
  const [selectedEmployeeInfo, setSelectedEmployeeInfo] = useState(null);
  
  // Data States
  const [positionAssessments, setPositionAssessments] = useState([]);
  const [employeeAssessments, setEmployeeAssessments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [positionGroups, setPositionGroups] = useState([]);
  const [behavioralScales, setBehavioralScales] = useState([]);
  const [letterGrades, setLetterGrades] = useState([]);
  const [behavioralGroups, setBehavioralGroups] = useState([]);
  const [uniqueJobTitles, setUniqueJobTitles] = useState([]);
  
  // Form States
  const [positionFormData, setPositionFormData] = useState({
    position_group: '',
    job_title: '',
    competency_ratings: []
  });

  const [editPositionFormData, setEditPositionFormData] = useState({
    id: '',
    position_group: '',
    job_title: '',
    competency_ratings: []
  });
  
  const [employeeFormData, setEmployeeFormData] = useState({
    employee: '',
    position_assessment: '',
    assessment_date: new Date().toISOString().split('T')[0],
    competency_ratings: [],
    action_type: 'save_draft'
  });

  const [editFormData, setEditFormData] = useState({
    employee: '',
    position_assessment: '',
    assessment_date: '',
    competency_ratings: [],
    action_type: 'save_draft'
  });

  // Position-Job Title Relationship States
  const [filteredJobTitles, setFilteredJobTitles] = useState([]);
  const [editFilteredJobTitles, setEditFilteredJobTitles] = useState([]);

  // Helper function to filter job titles based on position group
  const getJobTitlesForPositionGroup = (positionGroupId) => {
    if (!positionGroupId) return uniqueJobTitles;
    
    // Filter employees by position group and extract unique job titles
    const employeesInGroup = employees.filter(emp => emp.position_group_level === positionGroupId);
    const jobTitlesInGroup = [...new Set(employeesInGroup.map(emp => emp.job_title).filter(Boolean))];
    console.log('Job Titles in Group:', jobTitlesInGroup);
    return jobTitlesInGroup.map(title => ({ 
      name: title
    }));
  };

  // Update filtered job titles when position group changes in create modal
  useEffect(() => {
    const filtered = getJobTitlesForPositionGroup(positionFormData.position_group);
    setFilteredJobTitles(filtered);
    
    
    // Reset job title if it's not in the filtered list
    if (positionFormData.job_title && !filtered.find(jt => jt.value === positionFormData.job_title)) {
      setPositionFormData(prev => ({ ...prev, job_title: '' }));
    }
  }, [positionFormData.position_group, employees, uniqueJobTitles]);
console.log('Filtered Job Titles:', filteredJobTitles);
console.log('Position Form Data:', positionFormData);
  // Update filtered job titles when position group changes in edit modal
  useEffect(() => {
    const filtered = getJobTitlesForPositionGroup(editPositionFormData.position_group);
    setEditFilteredJobTitles(filtered);
    
    // Reset job title if it's not in the filtered list
    if (editPositionFormData.job_title && !filtered.find(jt => jt.value === editPositionFormData.job_title)) {
      setEditPositionFormData(prev => ({ ...prev, job_title: '' }));
    }
  }, [editPositionFormData.position_group, employees, uniqueJobTitles]);

  // Helper components
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
        className={`
          flex items-center gap-2 rounded-lg font-medium
          transition-all duration-200 hover:shadow ${variants[variant]} ${sizes[size]}
          ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
        {label}
      </button>
    );
  };

  const GradeBadge = ({ grade, percentage }) => {
    const getGradeColor = (grade) => {
      switch (grade) {
        case 'A': return 'bg-green-100 text-green-800 border-green-200';
        case 'B': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'D': return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'E': return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'F': return 'bg-red-100 text-red-800 border-red-200';
        default: return 'bg-almet-mystic text-almet-waterloo border-almet-bali-hai';
      }
    };

    if (!grade || !percentage) {
      return <span className="text-xs text-almet-waterloo">Not graded</span>;
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${getGradeColor(grade)}`}>
        {grade} ({percentage}%)
      </span>
    );
  };

  // Position Group change handler for create modal
  const handlePositionGroupChange = (positionGroupId) => {
    setPositionFormData(prev => ({
      ...prev,
      position_group: positionGroupId,
      job_title: '' // Reset job title when position group changes
    }));
  };

  // Position Group change handler for edit modal
  const handleEditPositionGroupChange = (positionGroupId) => {
    setEditPositionFormData(prev => ({
      ...prev,
      position_group: positionGroupId,
      job_title: '' // Reset job title when position group changes
    }));
  };

  // Fetch all data
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const [
        positionAssessmentsRes, 
        employeeAssessmentsRes, 
        employeesRes, 
        positionGroupsRes,
        behavioralScalesRes,
        letterGradesRes,
        behavioralGroupsRes
      ] = await Promise.all([
        assessmentApi.positionBehavioral.getAll(),
        assessmentApi.employeeBehavioral.getAll(),
        assessmentApi.employees.getAll(),
        assessmentApi.positionGroups.getAll(),
        assessmentApi.behavioralScales.getAll(),
        assessmentApi.letterGrades.getAll(),
        competencyApi.behavioralGroups.getAll()
      ]);
      
      setPositionAssessments(positionAssessmentsRes.results || []);
      setEmployeeAssessments(employeeAssessmentsRes.results || []);
      const employeesList = employeesRes.results || [];
      setEmployees(employeesList);
      setPositionGroups(positionGroupsRes.results || []);
      setBehavioralScales(behavioralScalesRes.results || []);
      setLetterGrades(letterGradesRes.results || []);
      
      // Extract unique job titles from employees
      const jobTitles = [...new Set(employeesList.map(emp => emp.job_title).filter(Boolean))];
      setUniqueJobTitles(jobTitles.map(title => ({ name: title, value: title })));

      // Fetch behavioral groups with their competencies
      const behavioralGroupsList = behavioralGroupsRes.results || [];
      const groupsWithCompetencies = await Promise.all(
        behavioralGroupsList.map(async (group) => {
          try {
            const groupDetails = await competencyApi.behavioralGroups.getById(group.id);
            return {
              ...group,
              competencies: groupDetails.competencies || []
            };
          } catch (err) {
            console.error(`Error fetching competencies for group ${group.id}:`, err);
            return { ...group, competencies: [] };
          }
        })
      );
      setBehavioralGroups(groupsWithCompetencies);
      
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

  // Auto-select position assessment based on employee and handle template errors
  const handleEmployeeChange = async (employeeId) => {
    setTemplateError(null);
    const selectedEmployee = employees.find(e => e.id === employeeId);
    if (!selectedEmployee) return;

    setSelectedEmployeeInfo(selectedEmployee);
    
    // Check if employee already has an assessment
    const existingAssessment = employeeAssessments.find(
      assessment => assessment.employee === employeeId
    );
    
    if (existingAssessment) {
      setTemplateError({
        type: 'duplicate',
        message: `${selectedEmployee.name} already has a behavioral assessment. Each employee can only have one assessment.`,
        employee: selectedEmployee
      });
      setEmployeeFormData(prev => ({ ...prev, employee: employeeId, position_assessment: '' }));
      return;
    }

    setEmployeeFormData(prev => ({ ...prev, employee: employeeId }));
    
    try {
      const response = await assessmentApi.positionBehavioral.getForEmployee(employeeId);
      
      if (response.assessment_template) {
        setEmployeeFormData(prev => ({
          ...prev, 
          employee: employeeId,
          position_assessment: response.assessment_template.id,
          competency_ratings: response.assessment_template.competency_ratings?.map(rating => ({
            behavioral_competency_id: rating.behavioral_competency,
            actual_level: 0,
            notes: ''
          })) || []
        }));
        setTemplateError(null);
      }
    } catch (err) {
      console.error('Error fetching employee position template:', err);
      
      if (err.response?.data?.error) {
        setTemplateError({
          type: 'no_template',
          message: err.response.data.error,
          employee: selectedEmployee
        });
      } else {
        setTemplateError({
          type: 'api_error',
          message: 'Failed to load position template for this employee',
          employee: selectedEmployee
        });
      }
      
      setEmployeeFormData(prev => ({
        ...prev, 
        employee: employeeId,
        position_assessment: '',
        competency_ratings: []
      }));
    }
  };

  // Handle edit position assessment
  const handleEditPositionAssessment = async (assessment) => {
    try {
      const detailedAssessment = await assessmentApi.positionBehavioral.getById(assessment.id);
      
      setEditPositionFormData({
        id: assessment.id,
        position_group: assessment.position_group,
        job_title: assessment.job_title,
        competency_ratings: detailedAssessment.competency_ratings?.map(rating => ({
          behavioral_competency_id: rating.behavioral_competency,
          required_level: rating.required_level
        })) || []
      });
      
      setShowEditPositionModal(true);
    } catch (err) {
      console.error('Error loading position assessment for edit:', err);
      setError(err);
    }
  };

  // Handle edit employee assessment
  const handleEditAssessment = async (assessment) => {
    try {
      const detailedAssessment = await assessmentApi.employeeBehavioral.getById(assessment.id);
      
      setEditFormData({
        id: assessment.id,
        employee: assessment.employee,
        position_assessment: assessment.position_assessment,
        assessment_date: assessment.assessment_date,
        competency_ratings: detailedAssessment.competency_ratings?.map(rating => ({
          behavioral_competency_id: rating.behavioral_competency,
          actual_level: rating.actual_level || 0,
          notes: rating.notes || ''
        })) || [],
        action_type: 'save_draft'
      });
      
      const employee = employees.find(e => e.id === assessment.employee);
      setSelectedEmployeeInfo(employee);
      setShowEditEmployeeModal(true);
    } catch (err) {
      console.error('Error loading assessment for edit:', err);
      setError(err);
    }
  };

  // Handle position assessment creation
  const handleCreatePositionAssessment = async () => {
    if (!positionFormData.position_group || !positionFormData.job_title) {
      setError({ message: 'Please fill all required fields' });
      return;
    }

    if (positionFormData.competency_ratings.length === 0) {
      setError({ message: 'Please rate at least one competency' });
      return;
    }

    setIsSubmitting(true);
    try {
      await assessmentApi.positionBehavioral.create(positionFormData);
      await fetchData();
      setShowCreatePositionModal(false);
      setPositionFormData({ position_group: '', job_title: '', competency_ratings: [] });
      setSuccessMessage('Position assessment template created successfully');
    } catch (err) {
      console.error('Error creating position assessment:', err);
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle position assessment update
  const handleUpdatePositionAssessment = async () => {
    if (!editPositionFormData.position_group || !editPositionFormData.job_title) {
      setError({ message: 'Please fill all required fields' });
      return;
    }

    if (editPositionFormData.competency_ratings.length === 0) {
      setError({ message: 'Please rate at least one competency' });
      return;
    }

    setIsSubmitting(true);
    try {
      const updateData = {
        position_group: editPositionFormData.position_group,
        job_title: editPositionFormData.job_title,
        competency_ratings: editPositionFormData.competency_ratings
      };
      
      await assessmentApi.positionBehavioral.update(editPositionFormData.id, updateData);
      await fetchData();
      setShowEditPositionModal(false);
      setEditPositionFormData({ id: '', position_group: '', job_title: '', competency_ratings: [] });
      setSuccessMessage('Position assessment template updated successfully');
    } catch (err) {
      console.error('Error updating position assessment:', err);
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle employee assessment creation
  const handleCreateEmployeeAssessment = async (isDraft = true) => {
    if (!employeeFormData.employee || !employeeFormData.position_assessment) {
      setError({ message: 'Please select employee and ensure position template is loaded' });
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        ...employeeFormData,
        action_type: isDraft ? 'save_draft' : 'submit'
      };
      
      const response = await assessmentApi.employeeBehavioral.create(data);
      await fetchData();
      setShowCreateEmployeeModal(false);
      setEmployeeFormData({
        employee: '',
        position_assessment: '',
        assessment_date: new Date().toISOString().split('T')[0],
        competency_ratings: [],
        action_type: 'save_draft'
      });
      setTemplateError(null);
      setSelectedEmployeeInfo(null);
      setSuccessMessage(isDraft ? 'Employee assessment saved as draft' : 'Employee assessment submitted successfully');
    } catch (err) {
      console.error('Error creating employee assessment:', err);
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle employee assessment update
  const handleUpdateEmployeeAssessment = async (isDraft = true) => {
    if (!editFormData.id) return;

    setIsSubmitting(true);
    try {
      const data = {
        ...editFormData,
        action_type: isDraft ? 'save_draft' : 'submit'
      };
      
      await assessmentApi.employeeBehavioral.update(editFormData.id, data);
      await fetchData();
      setShowEditEmployeeModal(false);
      setEditFormData({
        employee: '',
        position_assessment: '',
        assessment_date: '',
        competency_ratings: [],
        action_type: 'save_draft'
      });
      setSelectedEmployeeInfo(null);
      setSuccessMessage(isDraft ? 'Assessment updated successfully' : 'Assessment submitted successfully');
    } catch (err) {
      console.error('Error updating employee assessment:', err);
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle export
  const handleExport = async (id, type) => {
    try {
      if (type === 'employee') {
        await assessmentApi.employeeBehavioral.exportDocument(id);
        setSuccessMessage('Assessment exported successfully');
      }
    } catch (err) {
      console.error('Export error:', err);
      setError(err);
    }
  };

  // Handle submit assessment
  const handleSubmitAssessment = async (id) => {
    if (!confirm('Are you sure you want to submit this assessment? It will be finalized and cannot be edited.')) return;
    
    try {
      await assessmentApi.employeeBehavioral.submit(id, { status: 'COMPLETED' });
      await fetchData();
      setSuccessMessage('Assessment submitted successfully');
    } catch (err) {
      console.error('Submit error:', err);
      setError(err);
    }
  };

  // Handle reopen assessment
  const handleReopenAssessment = async (id) => {
    if (!confirm('Are you sure you want to reopen this assessment for editing?')) return;
    
    try {
      await assessmentApi.employeeBehavioral.reopen(id, { status: 'DRAFT' });
      await fetchData();
      setSuccessMessage('Assessment reopened for editing');
    } catch (err) {
      console.error('Reopen error:', err);
      setError(err);
    }
  };

  // Handle delete
  const handleDelete = async (id, type) => {
    if (!confirm('Are you sure you want to delete this assessment?')) return;
    
    try {
      if (type === 'position') {
        await assessmentApi.positionBehavioral.delete(id);
      } else {
        await assessmentApi.employeeBehavioral.delete(id);
      }
      await fetchData();
      setSuccessMessage('Assessment deleted successfully');
    } catch (err) {
      console.error('Delete error:', err);
      setError(err);
    }
  };

  // Filter data
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
              <div className="text-xs opacity-75">Define behavioral competencies</div>
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
            <Users size={14} />
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
          // Position Assessments Table
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-almet-mystic border-b border-almet-bali-hai">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-almet-cloud-burst text-sm">Position Group</th>
                  <th className="text-left px-4 py-3 font-medium text-almet-cloud-burst text-sm">Job Title</th>
                  <th className="text-left px-4 py-3 font-medium text-almet-cloud-burst text-sm">Competencies</th>
                  <th className="text-left px-4 py-3 font-medium text-almet-cloud-burst text-sm">Created</th>
                  <th className="text-center px-4 py-3 font-medium text-almet-cloud-burst text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPositionAssessments.length > 0 ? (
                  filteredPositionAssessments.map((assessment) => (
                    <tr key={assessment.id} className="border-b border-almet-bali-hai hover:bg-almet-mystic transition-colors">
                      <td className="px-4 py-3 text-almet-cloud-burst font-medium text-sm">
                        {assessment.position_group_name}
                      </td>
                      <td className="px-4 py-3 text-almet-cloud-burst text-sm">
                        {assessment.job_title}
                      </td>
                      <td className="px-4 py-3 text-almet-waterloo text-sm">
                        {assessment.competency_ratings?.length || 0} competencies
                      </td>
                      <td className="px-4 py-3 text-almet-waterloo text-xs">
                        {new Date(assessment.created_at).toLocaleDateString()}
                      </td>
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
          // Employee Assessments Table
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-almet-mystic border-b border-almet-bali-hai">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-almet-cloud-burst text-sm">Employee</th>
                  <th className="text-left px-4 py-3 font-medium text-almet-cloud-burst text-sm">Position</th>
                  <th className="text-left px-4 py-3 font-medium text-almet-cloud-burst text-sm">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-almet-cloud-burst text-sm">Overall Grade</th>
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
                      <td className="px-4 py-3">
                        <StatusBadge status={assessment.status} />
                      </td>
                      <td className="px-4 py-3">
                        <GradeBadge 
                          grade={assessment.overall_letter_grade} 
                          percentage={parseFloat(assessment.overall_percentage || 0).toFixed(0)} 
                        />
                      </td>
                      <td className="px-4 py-3 text-almet-waterloo text-xs">
                        {new Date(assessment.assessment_date).toLocaleDateString()}
                      </td>
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
                            <ActionButton
                              onClick={() => handleEditAssessment(assessment)}
                              icon={Edit}
                              label=""
                              variant="info"
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
                          
                          {assessment.status === 'DRAFT' && (
                            <ActionButton
                              onClick={() => handleSubmitAssessment(assessment.id)}
                              icon={CheckCircle}
                              label=""
                              variant="success"
                              size="xs"
                            />
                          )}
                          
                          {assessment.status === 'COMPLETED' && assessment.can_edit && (
                            <ActionButton
                              onClick={() => handleReopenAssessment(assessment.id)}
                              icon={RefreshCw}
                              label=""
                              variant="warning"
                              size="xs"
                            />
                          )}
                          
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
                    <td colSpan="6" className="text-center py-8">
                      <Users className="w-8 h-8 mx-auto mb-3 text-almet-waterloo opacity-50" />
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

      {/* Create Position Assessment Modal */}
      {showCreatePositionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-6xl border border-almet-bali-hai shadow-lg max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-almet-cloud-burst flex items-center gap-2">
                <Building className="w-4 h-4 text-almet-sapphire" />
                Create Position Assessment Template
              </h3>
              <button
                onClick={() => setShowCreatePositionModal(false)}
                className="p-2 rounded-lg text-almet-waterloo hover:bg-almet-mystic transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 p-3 bg-almet-mystic rounded-lg border border-almet-bali-hai">
              <div>
                <label className="block text-sm font-medium text-almet-waterloo mb-2">
                  Position Group <span className="text-red-400">*</span>
                </label>
                <SearchableDropdown
                  options={positionGroups}
                  value={positionFormData.position_group}
                  onChange={handlePositionGroupChange}
                  placeholder="Select Position Group"
                  displayKey="name"
                  valueKey="id"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-almet-waterloo mb-2">
                  Job Title <span className="text-red-400">*</span>
                </label>
                <SearchableDropdown
                  options={filteredJobTitles}
                  value={positionFormData.job_title}
                  onChange={(value) => setPositionFormData({...positionFormData, job_title: value})}
                  placeholder={positionFormData.position_group ? "Select or type job title" : "Select position group first"}
                  displayKey="name"
                  valueKey="value"
                  allowStringOptions={true}
                  disabled={!positionFormData.position_group}
                />
                {positionFormData.position_group && filteredJobTitles.length === 0 && (
                  <p className="text-xs text-almet-waterloo mt-1">
                    No existing job titles for this position group. You can type a new one.
                  </p>
                )}
              </div>
            </div>

            {/* Behavioral Scales Info */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-base font-medium text-almet-cloud-burst">Assessment Scales</h4>
                <ActionButton
                  onClick={() => setShowScalesInfo(!showScalesInfo)}
                  icon={Info}
                  label={showScalesInfo ? "Hide Info" : "Show Info"}
                  variant="info"
                  size="sm"
                />
              </div>
              
              {showScalesInfo && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h5 className="font-medium text-blue-900 mb-3 text-sm">Behavioral Assessment Scale Definitions:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {behavioralScales.map(scale => (
                      <div key={scale.id} className="bg-white p-2 rounded border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-almet-sapphire text-white px-2 py-1 rounded text-xs font-medium">
                            {scale.scale}
                          </span>
                          <span className="text-xs font-medium text-blue-900">Level {scale.scale}</span>
                        </div>
                        <p className="text-xs text-blue-700">{scale.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Competency Assessment Matrix */}
            <div className="border border-almet-bali-hai rounded-lg overflow-hidden">
              <div className="bg-almet-sapphire text-white p-3">
                <h4 className="font-semibold text-center text-sm">Behavioral Competency Assessment Matrix</h4>
                <p className="text-center text-xs opacity-90 mt-1">Rate required competency levels for this position</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-almet-mystic border-b border-almet-bali-hai">
                      <th className="px-3 py-2 text-left font-medium text-almet-cloud-burst text-sm w-2/5">
                        COMPETENCY
                      </th>
                      <th className="px-3 py-2 text-center font-medium text-almet-cloud-burst text-sm w-32">
                        REQUIRED LEVEL
                      </th>
                    </tr>
                  </thead>
                  
                  <tbody>
                    {behavioralGroups.length > 0 ? (
                      behavioralGroups.map(group => (
                        <React.Fragment key={group.id}>
                          {/* Group Header */}
                          <tr className="bg-almet-sapphire text-white">
                            <td colSpan="2" className="px-3 py-2 font-semibold text-center uppercase text-sm">
                              {group.name}
                            </td>
                          </tr>
                          
                          {/* Group Competencies */}
                          {group.competencies && group.competencies.length > 0 ? (
                            group.competencies.map(competency => (
                              <tr key={competency.id} className="border-b border-almet-bali-hai hover:bg-almet-mystic">
                                <td className="px-3 py-2 font-medium text-almet-cloud-burst text-sm">
                                  <div className="flex flex-col">
                                    <span className="font-medium">{competency.name}</span>
                                    {competency.created_at && (
                                      <span className="text-xs text-almet-waterloo mt-1">
                                        Added: {new Date(competency.created_at).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <select
                                    value={positionFormData.competency_ratings.find(r => r.behavioral_competency_id === competency.id)?.required_level || ''}
                                    onChange={(e) => {
                                      const newRatings = [...positionFormData.competency_ratings];
                                      const existingIndex = newRatings.findIndex(r => r.behavioral_competency_id === competency.id);
                                      
                                      if (existingIndex >= 0) {
                                        if (e.target.value) {
                                          newRatings[existingIndex].required_level = parseInt(e.target.value);
                                        } else {
                                          newRatings.splice(existingIndex, 1);
                                        }
                                      } else if (e.target.value) {
                                        newRatings.push({
                                          behavioral_competency_id: competency.id,
                                          required_level: parseInt(e.target.value)
                                        });
                                      }
                                      
                                      setPositionFormData({...positionFormData, competency_ratings: newRatings});
                                    }}
                                    className="w-20 px-2 py-1 border border-almet-bali-hai rounded text-center font-medium bg-white focus:border-almet-sapphire focus:outline-none text-sm"
                                  >
                                    <option value="">-</option>
                                    {behavioralScales.map(scale => (
                                      <option key={scale.id} value={scale.scale}>{scale.scale}</option>
                                    ))}
                                  </select>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="2" className="px-3 py-2 text-center text-almet-waterloo text-sm italic">
                                No competencies found for this group
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="px-3 py-6 text-center text-almet-waterloo">
                          <AlertCircle className="w-6 h-6 mx-auto mb-2 text-almet-bali-hai" />
                          <p className="font-medium text-sm">No behavioral groups found</p>
                          <p className="text-xs mt-1">Please create behavioral competency groups first</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Rating Summary */}
            {positionFormData.competency_ratings.length > 0 && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <h5 className="font-medium text-green-900 mb-2 text-sm">Assessment Summary</h5>
                <p className="text-sm text-green-700">
                  {positionFormData.competency_ratings.length} competencies rated across {
                    [...new Set(positionFormData.competency_ratings.map(r => {
                      const comp = behavioralGroups.flatMap(g => g.competencies || []).find(c => c.id === r.behavioral_competency_id);
                      return comp ? behavioralGroups.find(g => g.competencies?.some(c => c.id === comp.id))?.name : null;
                    }).filter(Boolean))].length
                  } groups
                </p>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-almet-bali-hai">
              <ActionButton
                onClick={() => setShowCreatePositionModal(false)}
                icon={X}
                label="Cancel"
                disabled={isSubmitting}
                variant="outline"
                size="md"
              />
              <ActionButton
                onClick={handleCreatePositionAssessment}
                icon={Save}
                label="Create Template"
                disabled={!positionFormData.position_group || !positionFormData.job_title || positionFormData.competency_ratings.length === 0}
                loading={isSubmitting}
                variant="primary"
                size="md"
              />
            </div>
          </div>
        </div>
      )}

      {/* Edit Position Assessment Modal */}
      {showEditPositionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-6xl border border-almet-bali-hai shadow-lg max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-almet-cloud-burst flex items-center gap-2">
                <Edit className="w-4 h-4 text-almet-sapphire" />
                Edit Position Assessment Template
              </h3>
              <button
                onClick={() => {
                  setShowEditPositionModal(false);
                  setEditPositionFormData({ id: '', position_group: '', job_title: '', competency_ratings: [] });
                }}
                className="p-2 rounded-lg text-almet-waterloo hover:bg-almet-mystic transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 p-3 bg-almet-mystic rounded-lg border border-almet-bali-hai">
              <div>
                <label className="block text-sm font-medium text-almet-waterloo mb-2">
                  Position Group <span className="text-red-400">*</span>
                </label>
                <SearchableDropdown
                  options={positionGroups}
                  value={editPositionFormData.position_group}
                  onChange={handleEditPositionGroupChange}
                  placeholder="Select Position Group"
                  displayKey="name"
                  valueKey="id"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-almet-waterloo mb-2">
                  Job Title <span className="text-red-400">*</span>
                </label>
                <SearchableDropdown
                  options={editFilteredJobTitles}
                  value={editPositionFormData.job_title}
                  onChange={(value) => setEditPositionFormData({...editPositionFormData, job_title: value})}
                  placeholder={editPositionFormData.position_group ? "Select or type job title" : "Select position group first"}
                  displayKey="name"
                  valueKey="value"
                  allowStringOptions={true}
                  disabled={!editPositionFormData.position_group}
                />
                {editPositionFormData.position_group && editFilteredJobTitles.length === 0 && (
                  <p className="text-xs text-almet-waterloo mt-1">
                    No existing job titles for this position group. You can type a new one.
                  </p>
                )}
              </div>
            </div>

            {/* Behavioral Scales Info */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-3">
                <h4 className="text-base font-medium text-almet-cloud-burst">Assessment Scales</h4>
                <ActionButton
                  onClick={() => setShowScalesInfo(!showScalesInfo)}
                  icon={Info}
                  label={showScalesInfo ? "Hide Info" : "Show Info"}
                  variant="info"
                  size="sm"
                />
              </div>
              
              {showScalesInfo && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h5 className="font-medium text-blue-900 mb-3 text-sm">Behavioral Assessment Scale Definitions:</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {behavioralScales.map(scale => (
                      <div key={scale.id} className="bg-white p-2 rounded border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-almet-sapphire text-white px-2 py-1 rounded text-xs font-medium">
                            {scale.scale}
                          </span>
                          <span className="text-xs font-medium text-blue-900">Level {scale.scale}</span>
                        </div>
                        <p className="text-xs text-blue-700">{scale.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Competency Assessment Matrix */}
            <div className="border border-almet-bali-hai rounded-lg overflow-hidden">
              <div className="bg-almet-sapphire text-white p-3">
                <h4 className="font-semibold text-center text-sm">Edit Behavioral Competency Assessment Matrix</h4>
                <p className="text-center text-xs opacity-90 mt-1">Update required competency levels for this position</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-almet-mystic border-b border-almet-bali-hai">
                      <th className="px-3 py-2 text-left font-medium text-almet-cloud-burst text-sm w-2/5">
                        COMPETENCY
                      </th>
                      <th className="px-3 py-2 text-center font-medium text-almet-cloud-burst text-sm w-32">
                        REQUIRED LEVEL
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-almet-cloud-burst text-sm w-3/5">
                        DESCRIPTION
                      </th>
                    </tr>
                  </thead>
                  
                  <tbody>
                    {behavioralGroups.length > 0 ? (
                      behavioralGroups.map(group => (
                        <React.Fragment key={group.id}>
                          {/* Group Header */}
                          <tr className="bg-almet-sapphire text-white">
                            <td colSpan="3" className="px-3 py-2 font-semibold text-center uppercase text-sm">
                              {group.name}
                            </td>
                          </tr>
                          
                          {/* Group Competencies */}
                          {group.competencies && group.competencies.length > 0 ? (
                            group.competencies.map(competency => (
                              <tr key={competency.id} className="border-b border-almet-bali-hai hover:bg-almet-mystic">
                                <td className="px-3 py-2 font-medium text-almet-cloud-burst text-sm">
                                  <div className="flex flex-col">
                                    <span className="font-medium">{competency.name}</span>
                                    {competency.created_at && (
                                      <span className="text-xs text-almet-waterloo mt-1">
                                        Added: {new Date(competency.created_at).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <select
                                    value={editPositionFormData.competency_ratings.find(r => r.behavioral_competency_id === competency.id)?.required_level || ''}
                                    onChange={(e) => {
                                      const newRatings = [...editPositionFormData.competency_ratings];
                                      const existingIndex = newRatings.findIndex(r => r.behavioral_competency_id === competency.id);
                                      
                                      if (existingIndex >= 0) {
                                        if (e.target.value) {
                                          newRatings[existingIndex].required_level = parseInt(e.target.value);
                                        } else {
                                          newRatings.splice(existingIndex, 1);
                                        }
                                      } else if (e.target.value) {
                                        newRatings.push({
                                          behavioral_competency_id: competency.id,
                                          required_level: parseInt(e.target.value)
                                        });
                                      }
                                      
                                      setEditPositionFormData({...editPositionFormData, competency_ratings: newRatings});
                                    }}
                                    className="w-20 px-2 py-1 border border-almet-bali-hai rounded text-center font-medium bg-white focus:border-almet-sapphire focus:outline-none text-sm"
                                  >
                                    <option value="">-</option>
                                    {behavioralScales.map(scale => (
                                      <option key={scale.id} value={scale.scale}>{scale.scale}</option>
                                    ))}
                                  </select>
                                </td>
                                <td className="px-3 py-2 text-sm text-almet-waterloo">
                                  {competency.description || 'No description available'}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="3" className="px-3 py-2 text-center text-almet-waterloo text-sm italic">
                                No competencies found for this group
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="px-3 py-6 text-center text-almet-waterloo">
                          <AlertCircle className="w-6 h-6 mx-auto mb-2 text-almet-bali-hai" />
                          <p className="font-medium text-sm">No behavioral groups found</p>
                          <p className="text-xs mt-1">Please create behavioral competency groups first</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Rating Summary */}
            {editPositionFormData.competency_ratings.length > 0 && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <h5 className="font-medium text-green-900 mb-2 text-sm">Assessment Summary</h5>
                <p className="text-sm text-green-700">
                  {editPositionFormData.competency_ratings.length} competencies rated across {
                    [...new Set(editPositionFormData.competency_ratings.map(r => {
                      const comp = behavioralGroups.flatMap(g => g.competencies || []).find(c => c.id === r.behavioral_competency_id);
                      return comp ? behavioralGroups.find(g => g.competencies?.some(c => c.id === comp.id))?.name : null;
                    }).filter(Boolean))].length
                  } groups
                </p>
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-almet-bali-hai">
              <ActionButton
                onClick={() => {
                  setShowEditPositionModal(false);
                  setEditPositionFormData({ id: '', position_group: '', job_title: '', competency_ratings: [] });
                }}
                icon={X}
                label="Cancel"
                disabled={isSubmitting}
                variant="outline"
                size="md"
              />
              <ActionButton
                onClick={handleUpdatePositionAssessment}
                icon={Save}
                label="Update Template"
                disabled={!editPositionFormData.position_group || !editPositionFormData.job_title || editPositionFormData.competency_ratings.length === 0}
                loading={isSubmitting}
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
          <div className="bg-white rounded-lg p-4 w-full max-w-6xl border border-almet-bali-hai shadow-lg ">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-almet-cloud-burst flex items-center gap-2">
                <User className="w-4 h-4 text-almet-sapphire" />
                Create Employee Behavioral Assessment
              </h3>
              <button
                onClick={() => {
                  setShowCreateEmployeeModal(false);
                  setTemplateError(null);
                  setSelectedEmployeeInfo(null);
                }}
                className="p-2 rounded-lg text-almet-waterloo hover:bg-almet-mystic transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            {/* Employee Selection */}
            <div className="mb-4 p-3 bg-almet-mystic rounded-lg border border-almet-bali-hai">
              <div className="mb-3">
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
                />
              </div>

              {/* Employee Info Display */}
              {selectedEmployeeInfo && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <span className="text-xs font-medium text-blue-700">Employee:</span>
                      <p className="text-sm font-medium text-blue-900">{selectedEmployeeInfo.name}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-blue-700">Job Title:</span>
                      <p className="text-sm font-medium text-blue-900">{selectedEmployeeInfo.job_title}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-blue-700">Position Group:</span>
                      <p className="text-sm font-medium text-blue-900">{selectedEmployeeInfo.position_group}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Template Error Display */}
              {templateError && (
                <div className={`mt-3 p-3 rounded-lg border ${
                  templateError.type === 'duplicate' 
                    ? 'bg-yellow-50 border-yellow-300' 
                    : 'bg-red-50 border-red-300'
                }`}>
                  <div className="flex items-start gap-2">
                    <AlertCircle className={`w-4 h-4 mt-0.5 ${
                      templateError.type === 'duplicate' 
                        ? 'text-yellow-600' 
                        : 'text-red-600'
                    }`} />
                    <div>
                      <h4 className={`font-medium text-sm ${
                        templateError.type === 'duplicate' 
                          ? 'text-yellow-800' 
                          : 'text-red-800'
                      }`}>
                        {templateError.type === 'duplicate' 
                          ? 'Duplicate Assessment' 
                          : 'Template Not Found'}
                      </h4>
                      <p className={`text-sm mt-1 ${
                        templateError.type === 'duplicate' 
                          ? 'text-yellow-700' 
                          : 'text-red-700'
                      }`}>
                        {templateError.message}
                      </p>
                      {templateError.type === 'no_template' && (
                        <p className="text-xs text-red-600 mt-2">
                          Please create a position template for "{templateError.employee?.job_title}" first.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Behavioral Scales Info for Employee Assessment */}
            {employeeFormData.position_assessment && !templateError && (
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <h4 className="text-base font-medium text-almet-cloud-burst">Assessment Scales</h4>
                  <ActionButton
                    onClick={() => setShowEmployeeScalesInfo(!showEmployeeScalesInfo)}
                    icon={Info}
                    label={showEmployeeScalesInfo ? "Hide Info" : "Show Info"}
                    variant="info"
                    size="sm"
                  />
                </div>
                
                {showEmployeeScalesInfo && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <h5 className="font-medium text-blue-900 mb-3 text-sm">Behavioral Assessment Scale Definitions:</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {behavioralScales.map(scale => (
                        <div key={scale.id} className="bg-white p-2 rounded border border-blue-200">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="bg-almet-sapphire text-white px-2 py-1 rounded text-xs font-medium">
                              {scale.scale}
                            </span>
                            <span className="text-xs font-medium text-blue-900">Level {scale.scale}</span>
                          </div>
                          <p className="text-xs text-blue-700">{scale.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Assessment Matrix Table */}
            {employeeFormData.position_assessment && !templateError && (
              <div className="border border-almet-bali-hai rounded-lg overflow-hidden">
                <div className="bg-almet-sapphire text-white p-3">
                  <h4 className="font-semibold text-center text-sm">Employee Behavioral Assessment Matrix</h4>
                  <p className="text-center text-xs opacity-90">
                    Assess competency levels for {selectedEmployeeInfo?.name}
                  </p>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-almet-mystic border-b border-almet-bali-hai">
                        <th className="px-3 py-2 text-left font-medium text-almet-cloud-burst text-sm min-w-48">
                          BEHAVIORAL COMPETENCIES
                        </th>
                        <th className="px-3 py-2 text-center font-medium text-almet-cloud-burst text-sm min-w-24">
                          REQUIRED
                        </th>
                        <th className="px-3 py-2 text-center font-medium text-almet-cloud-burst text-sm min-w-24">
                          ACTUAL
                        </th>
                        <th className="px-3 py-2 text-center font-medium text-almet-cloud-burst text-sm min-w-24">
                          GAP
                        </th>
                        <th className="px-3 py-2 text-left font-medium text-almet-cloud-burst text-sm min-w-64">
                          ASSESSMENT NOTES
                        </th>
                      </tr>
                    </thead>
                    
                    <tbody>
                      {(() => {
                        const selectedPosition = positionAssessments.find(p => p.id === employeeFormData.position_assessment);
                        if (!selectedPosition) return null;

                        // Group competencies by group name
                        const groupedCompetencies = {};
                        selectedPosition.competency_ratings?.forEach(rating => {
                          const groupName = rating.competency_group_name || 'Other';
                          if (!groupedCompetencies[groupName]) {
                            groupedCompetencies[groupName] = [];
                          }
                          groupedCompetencies[groupName].push(rating);
                        });

                        return Object.entries(groupedCompetencies).map(([groupName, competencies]) => (
                          <React.Fragment key={groupName}>
                            <tr className="bg-almet-sapphire text-white">
                              <td colSpan="5" className="px-3 py-2 font-semibold text-center uppercase text-sm">
                                {groupName}
                              </td>
                            </tr>
                            
                            {competencies.map(competency => {
                              const employeeRating = employeeFormData.competency_ratings.find(
                                r => r.behavioral_competency_id === competency.behavioral_competency
                              );
                              
                              const actualLevel = employeeRating?.actual_level || 0;
                              const gap = actualLevel - competency.required_level;
                              
                              return (
                                <tr key={competency.id} className="border-b border-almet-bali-hai hover:bg-almet-mystic">
                                  <td className="px-3 py-2 font-medium text-almet-cloud-burst text-sm">
                                    {competency.competency_name}
                                  </td>
                                  <td className="px-3 py-2 text-center font-semibold text-almet-sapphire">
                                    {competency.required_level}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <select
                                      value={actualLevel}
                                      onChange={(e) => {
                                        const newRatings = [...employeeFormData.competency_ratings];
                                        const existingIndex = newRatings.findIndex(
                                          r => r.behavioral_competency_id === competency.behavioral_competency
                                        );
                                        
                                        if (existingIndex >= 0) {
                                          newRatings[existingIndex].actual_level = parseInt(e.target.value);
                                        } else {
                                          newRatings.push({
                                            behavioral_competency_id: competency.behavioral_competency,
                                            actual_level: parseInt(e.target.value),
                                            notes: ''
                                          });
                                        }
                                        
                                        setEmployeeFormData({
                                          ...employeeFormData, 
                                          competency_ratings: newRatings
                                        });
                                      }}
                                      className="w-full px-2 py-1 border border-almet-bali-hai rounded text-center font-medium focus:border-almet-sapphire focus:outline-none text-sm"
                                    >
                                      <option value={0}>-</option>
                                      {behavioralScales.map(scale => (
                                        <option key={scale.id} value={scale.scale}>{scale.scale}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                                      gap > 0 ? 'bg-green-100 text-green-800' :
                                      gap < 0 ? 'bg-red-100 text-red-800' :
                                      'bg-blue-100 text-blue-800'
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
                                          r => r.behavioral_competency_id === competency.behavioral_competency
                                        );
                                        
                                        if (existingIndex >= 0) {
                                          newRatings[existingIndex].notes = e.target.value;
                                        } else {
                                          newRatings.push({
                                            behavioral_competency_id: competency.behavioral_competency,
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
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-almet-bali-hai">
              <ActionButton
                onClick={() => {
                  setShowCreateEmployeeModal(false);
                  setTemplateError(null);
                  setSelectedEmployeeInfo(null);
                }}
                icon={X}
                label="Cancel"
                disabled={isSubmitting}
                variant="outline"
                size="md"
              />
              {employeeFormData.position_assessment && !templateError && (
                <>
                  <ActionButton
                    onClick={() => handleCreateEmployeeAssessment(true)}
                    icon={Save}
                    label="Save as Draft"
                    disabled={!employeeFormData.employee || !employeeFormData.position_assessment}
                    loading={isSubmitting}
                    variant="secondary"
                    size="md"
                  />
                  <ActionButton
                    onClick={() => handleCreateEmployeeAssessment(false)}
                    icon={CheckCircle}
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
      {showEditEmployeeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-6xl border border-almet-bali-hai shadow-lg max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-almet-cloud-burst flex items-center gap-2">
                <Edit className="w-4 h-4 text-almet-sapphire" />
                Edit Employee Behavioral Assessment
              </h3>
              <button
                onClick={() => {
                  setShowEditEmployeeModal(false);
                  setSelectedEmployeeInfo(null);
                }}
                className="p-2 rounded-lg text-almet-waterloo hover:bg-almet-mystic transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            
            {/* Employee Info Display */}
            {selectedEmployeeInfo && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <span className="text-xs font-medium text-blue-700">Employee:</span>
                    <p className="text-sm font-medium text-blue-900">{selectedEmployeeInfo.name}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-blue-700">Job Title:</span>
                    <p className="text-sm font-medium text-blue-900">{selectedEmployeeInfo.job_title}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-blue-700">Position Group:</span>
                    <p className="text-sm font-medium text-blue-900">{selectedEmployeeInfo.position_group_name}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Assessment Matrix Table */}
            <div className="border border-almet-bali-hai rounded-lg overflow-hidden">
              <div className="bg-almet-sapphire text-white p-3">
                <h4 className="font-semibold text-center text-sm">Edit Behavioral Assessment</h4>
                <p className="text-center text-xs opacity-90">
                  Update competency ratings for {selectedEmployeeInfo?.name}
                </p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-almet-mystic border-b border-almet-bali-hai">
                      <th className="px-3 py-2 text-left font-medium text-almet-cloud-burst text-sm min-w-48">
                        BEHAVIORAL COMPETENCIES
                      </th>
                      <th className="px-3 py-2 text-center font-medium text-almet-cloud-burst text-sm min-w-24">
                        REQUIRED
                      </th>
                      <th className="px-3 py-2 text-center font-medium text-almet-cloud-burst text-sm min-w-24">
                        ACTUAL
                      </th>
                      <th className="px-3 py-2 text-center font-medium text-almet-cloud-burst text-sm min-w-24">
                        GAP
                      </th>
                      <th className="px-3 py-2 text-left font-medium text-almet-cloud-burst text-sm min-w-64">
                        ASSESSMENT NOTES
                      </th>
                    </tr>
                  </thead>
                  
                  <tbody>
                    {(() => {
                      const selectedPosition = positionAssessments.find(p => p.id === editFormData.position_assessment);
                      if (!selectedPosition) return null;

                      // Group competencies by group name
                      const groupedCompetencies = {};
                      selectedPosition.competency_ratings?.forEach(rating => {
                        const groupName = rating.competency_group_name || 'Other';
                        if (!groupedCompetencies[groupName]) {
                          groupedCompetencies[groupName] = [];
                        }
                        groupedCompetencies[groupName].push(rating);
                      });

                      return Object.entries(groupedCompetencies).map(([groupName, competencies]) => (
                        <React.Fragment key={groupName}>
                          <tr className="bg-almet-sapphire text-white">
                            <td colSpan="5" className="px-3 py-2 font-semibold text-center uppercase text-sm">
                              {groupName}
                            </td>
                          </tr>
                          
                          {competencies.map(competency => {
                            const employeeRating = editFormData.competency_ratings.find(
                              r => r.behavioral_competency_id === competency.behavioral_competency
                            );
                            
                            const actualLevel = employeeRating?.actual_level || 0;
                            const gap = actualLevel - competency.required_level;
                            
                            return (
                              <tr key={competency.id} className="border-b border-almet-bali-hai hover:bg-almet-mystic">
                                <td className="px-3 py-2 font-medium text-almet-cloud-burst text-sm">
                                  {competency.competency_name}
                                </td>
                                <td className="px-3 py-2 text-center font-semibold text-almet-sapphire">
                                  {competency.required_level}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <select
                                    value={actualLevel}
                                    onChange={(e) => {
                                      const newRatings = [...editFormData.competency_ratings];
                                      const existingIndex = newRatings.findIndex(
                                        r => r.behavioral_competency_id === competency.behavioral_competency
                                      );
                                      
                                      if (existingIndex >= 0) {
                                        newRatings[existingIndex].actual_level = parseInt(e.target.value);
                                      } else {
                                        newRatings.push({
                                          behavioral_competency_id: competency.behavioral_competency,
                                          actual_level: parseInt(e.target.value),
                                          notes: ''
                                        });
                                      }
                                      
                                      setEditFormData({
                                        ...editFormData, 
                                        competency_ratings: newRatings
                                      });
                                    }}
                                    className="w-full px-2 py-1 border border-almet-bali-hai rounded text-center font-medium focus:border-almet-sapphire focus:outline-none text-sm"
                                  >
                                    <option value={0}>-</option>
                                    {behavioralScales.map(scale => (
                                      <option key={scale.id} value={scale.scale}>{scale.scale}</option>
                                    ))}
                                  </select>
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    gap > 0 ? 'bg-green-100 text-green-800' :
                                    gap < 0 ? 'bg-red-100 text-red-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {gap > 0 ? `+${gap}` : gap}
                                  </span>
                                </td>
                                <td className="px-3 py-2">
                                  <textarea
                                    value={employeeRating?.notes || ''}
                                    onChange={(e) => {
                                      const newRatings = [...editFormData.competency_ratings];
                                      const existingIndex = newRatings.findIndex(
                                        r => r.behavioral_competency_id === competency.behavioral_competency
                                      );
                                      
                                      if (existingIndex >= 0) {
                                        newRatings[existingIndex].notes = e.target.value;
                                      } else {
                                        newRatings.push({
                                          behavioral_competency_id: competency.behavioral_competency,
                                          actual_level: 0,
                                          notes: e.target.value
                                        });
                                      }
                                      
                                      setEditFormData({
                                        ...editFormData, 
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
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-almet-bali-hai">
              <ActionButton
                onClick={() => {
                  setShowEditEmployeeModal(false);
                  setSelectedEmployeeInfo(null);
                }}
                icon={X}
                label="Cancel"
                disabled={isSubmitting}
                variant="outline"
                size="md"
              />
              <ActionButton
                onClick={() => handleUpdateEmployeeAssessment(true)}
                icon={Save}
                label="Update Draft"
                disabled={!editFormData.id}
                loading={isSubmitting}
                variant="secondary"
                size="md"
              />
              <ActionButton
                onClick={() => handleUpdateEmployeeAssessment(false)}
                icon={CheckCircle}
                label="Update & Submit"
                disabled={!editFormData.id}
                loading={isSubmitting}
                variant="success"
                size="md"
              />
            </div>
          </div>
        </div>
      )}

      {/* View Assessment Modal */}
      {showViewModal && selectedAssessment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 w-full max-w-5xl border border-almet-bali-hai shadow-lg max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-almet-cloud-burst flex items-center gap-2">
                <Eye className="w-4 h-4 text-almet-sapphire" />
                {activeTab === 'position' ? 'Position Template Details' : 'Employee Assessment Details'}
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
              // Position Template View
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-almet-mystic rounded-lg border border-almet-bali-hai">
                  <div>
                    <label className="block text-sm font-medium text-almet-waterloo mb-1">Position Group</label>
                    <p className="text-base font-medium text-almet-cloud-burst">{selectedAssessment.position_group_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-almet-waterloo mb-1">Job Title</label>
                    <p className="text-base font-medium text-almet-cloud-burst">{selectedAssessment.job_title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-almet-waterloo mb-1">Created By</label>
                    <p className="text-sm text-almet-waterloo">{selectedAssessment.created_by_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-almet-waterloo mb-1">Created Date</label>
                    <p className="text-sm text-almet-waterloo">{new Date(selectedAssessment.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Competencies Table */}
                <div className="border border-almet-bali-hai rounded-lg overflow-hidden">
                  <div className="bg-almet-sapphire text-white p-3">
                    <h4 className="font-semibold text-center text-sm">Required Competency Levels</h4>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-almet-mystic border-b border-almet-bali-hai">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-almet-cloud-burst text-sm">Competency Group</th>
                          <th className="px-3 py-2 text-left font-medium text-almet-cloud-burst text-sm">Competency</th>
                          <th className="px-3 py-2 text-center font-medium text-almet-cloud-burst text-sm">Required Level</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedAssessment.competency_ratings?.length > 0 ? (
                          selectedAssessment.competency_ratings.map((rating, index) => (
                            <tr key={index} className="border-b border-almet-bali-hai hover:bg-almet-mystic">
                              <td className="px-3 py-2 text-almet-waterloo font-medium text-sm">
                                {rating.competency_group_name}
                              </td>
                              <td className="px-3 py-2 text-almet-cloud-burst font-medium text-sm">
                                {rating.competency_name}
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span className="bg-almet-sapphire text-white px-3 py-1 rounded-full font-medium text-sm">
                                  {rating.required_level}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" className="px-3 py-6 text-center text-almet-waterloo text-sm">
                              No competencies defined
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              // Employee Assessment View
              <div className="space-y-4">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-3 bg-almet-mystic rounded-lg border border-almet-bali-hai">
                  <div>
                    <label className="block text-sm font-medium text-almet-waterloo mb-1">Employee</label>
                    <p className="text-base font-medium text-almet-cloud-burst">{selectedAssessment.employee_name}</p>
                    <p className="text-xs text-almet-waterloo">ID: {selectedAssessment.employee_id}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-almet-waterloo mb-1">Position</label>
                    <p className="text-base font-medium text-almet-cloud-burst">{selectedAssessment.position_assessment_title}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-almet-waterloo mb-1">Status</label>
                    <StatusBadge status={selectedAssessment.status} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-almet-waterloo mb-1">Assessment Date</label>
                    <p className="text-sm text-almet-waterloo">{new Date(selectedAssessment.assessment_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-almet-waterloo mb-1">Overall Grade</label>
                    <GradeBadge 
                      grade={selectedAssessment.overall_letter_grade} 
                      percentage={parseFloat(selectedAssessment.overall_percentage || 0).toFixed(0)} 
                    />
                  </div>
                </div>

                {/* Notes */}
                {selectedAssessment.notes && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <label className="block text-sm font-medium text-almet-waterloo mb-2">Assessment Notes</label>
                    <p className="text-sm text-almet-cloud-burst">{selectedAssessment.notes}</p>
                  </div>
                )}

                {/* Group Scores Summary */}
                {selectedAssessment.group_scores && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <h5 className="font-medium text-green-900 mb-3 text-sm">Group Performance Summary</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {Object.entries(selectedAssessment.group_scores).map(([groupName, scores]) => (
                        <div key={groupName} className="bg-white p-3 rounded border">
                          <h6 className="font-medium text-almet-cloud-burst mb-2 text-sm">{groupName}</h6>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-sm text-almet-waterloo">Grade:</span>
                              <span className="text-sm font-medium">{scores.letter_grade}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-almet-waterloo">Score:</span>
                              <span className="text-sm font-medium">{scores.percentage}%</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-almet-waterloo">Points:</span>
                              <span className="text-sm font-medium">{scores.employee_total}/{scores.position_total}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed Competency Assessment */}
                <div className="border border-almet-bali-hai rounded-lg overflow-hidden">
                  <div className="bg-almet-sapphire text-white p-3">
                    <h4 className="font-semibold text-center text-sm">Detailed Competency Assessment</h4>
                  </div>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-almet-mystic border-b border-almet-bali-hai">
                        <tr>
                          <th className="px-3 py-2 text-left font-medium text-almet-cloud-burst text-sm">Group</th>
                          <th className="px-3 py-2 text-left font-medium text-almet-cloud-burst text-sm">Competency</th>
                          <th className="px-3 py-2 text-center font-medium text-almet-cloud-burst text-sm">Required</th>
                          <th className="px-3 py-2 text-center font-medium text-almet-cloud-burst text-sm">Actual</th>
                          <th className="px-3 py-2 text-center font-medium text-almet-cloud-burst text-sm">Gap</th>
                          <th className="px-3 py-2 text-left font-medium text-almet-cloud-burst text-sm">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedAssessment.competency_ratings?.length > 0 ? (
                          selectedAssessment.competency_ratings.map((rating, index) => {
                            const gap = rating.actual_level - rating.required_level;
                            return (
                              <tr key={index} className="border-b border-almet-bali-hai hover:bg-almet-mystic">
                                <td className="px-3 py-2 text-almet-waterloo text-sm">{rating.competency_group_name}</td>
                                <td className="px-3 py-2 text-almet-cloud-burst font-medium text-sm">{rating.competency_name}</td>
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
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    gap > 0 ? 'bg-green-100 text-green-800' :
                                    gap < 0 ? 'bg-red-100 text-red-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {gap > 0 ? `+${gap}` : gap}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-almet-waterloo text-sm">
                                  {rating.notes || '-'}
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="6" className="px-3 py-6 text-center text-almet-waterloo text-sm">
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

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-almet-bali-hai">
              {activeTab === 'employee' && selectedAssessment.status === 'COMPLETED' && (
                <ActionButton
                  onClick={() => handleExport(selectedAssessment.id, 'employee')}
                  icon={Download}
                  label="Export Assessment"
                  variant="secondary"
                  size="md"
                />
              )}
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

export default BehavioralAssessmentCalculation;