'use client';
import React, { useState, useEffect } from 'react';
import { 
  Plus, Users, Target, Search, Eye, Edit, Trash2, 
  Download, AlertCircle, CheckCircle, Loader2, X, Save, 
  User, Building, RefreshCw, Info
} from 'lucide-react';
import { assessmentApi } from '@/services/assessmentApi';
import { competencyApi } from '@/services/competencyApi';

// Import common components
import StatusBadge from './StatusBadge';
import ActionButton from './ActionButton';
import SearchableDropdown from '@/components/common/SearchableDropdown';
import CollapsibleGroup from './CollapsibleGroup';
import { useToast } from '@/components/common/Toast';
import ConfirmationModal from '@/components/common/ConfirmationModal';

const BehavioralAssessmentCalculation = () => {
  const { showSuccess, showError } = useToast();

  // Basic States
  const [activeTab, setActiveTab] = useState('employee');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal States
  const [showCreatePositionModal, setShowCreatePositionModal] = useState(false);
  const [showEditPositionModal, setShowEditPositionModal] = useState(false);
  const [showCreateEmployeeModal, setShowCreateEmployeeModal] = useState(false);
  const [showEditEmployeeModal, setShowEditEmployeeModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [showScalesInfo, setShowScalesInfo] = useState(false);
  const [templateError, setTemplateError] = useState(null);
  const [selectedEmployeeInfo, setSelectedEmployeeInfo] = useState(null);
  const [positionDuplicateError, setPositionDuplicateError] = useState(null);
  
  // Confirmation Modal States
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    type: 'default'
  });
  
  // Collapsible states for create modals
  const [expandedGroups, setExpandedGroups] = useState({});
  
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
    
    const employeesInGroup = employees.filter(emp => emp.position_group_level === positionGroupId);
    const jobTitlesInGroup = [...new Set(employeesInGroup.map(emp => emp.job_title).filter(Boolean))];
    
    return jobTitlesInGroup.map((title, index) => ({ 
      value: title,
      name: title,
      uniqueId: `${positionGroupId}-${title}-${index}`
    }));
  };

  // Update filtered job titles when position group changes
  useEffect(() => {
    const filtered = getJobTitlesForPositionGroup(positionFormData.position_group);
    setFilteredJobTitles(filtered);
    
    if (positionFormData.job_title && !filtered.find(jt => jt.value === positionFormData.job_title)) {
      setPositionFormData(prev => ({ ...prev, job_title: '' }));
    }
  }, [positionFormData.position_group, employees, uniqueJobTitles]);

  useEffect(() => {
    const filtered = getJobTitlesForPositionGroup(editPositionFormData.position_group);
    setEditFilteredJobTitles(filtered);
    
    if (editPositionFormData.job_title && !filtered.find(jt => jt.value === editPositionFormData.job_title)) {
      setEditPositionFormData(prev => ({ ...prev, job_title: '' }));
    }
  }, [editPositionFormData.position_group, employees, uniqueJobTitles]);

  // Grade Badge Component
  const GradeBadge = ({ grade, percentage }) => {
    const getGradeColor = (grade) => {
      switch (grade) {
        case 'A': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
        case 'B': return 'bg-blue-50 text-blue-700 border-blue-200';
        case 'C': return 'bg-amber-50 text-amber-700 border-amber-200';
        case 'D': return 'bg-orange-50 text-orange-700 border-orange-200';
        case 'E': return 'bg-purple-50 text-purple-700 border-purple-200';
        case 'F': return 'bg-red-50 text-red-700 border-red-200';
        default: return 'bg-gray-50 text-gray-700 border-gray-200';
      }
    };

    if (!grade || !percentage) {
      return <span className="text-xs text-gray-500">Not graded</span>;
    }

    return (
      <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium border ${getGradeColor(grade)}`}>
        {grade} ({percentage}%)
      </span>
    );
  };

  // Fetch all data
  const fetchData = async () => {
    setIsLoading(true);
    
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
      
      // Extract unique job titles
      const jobTitles = [...new Set(employeesList.map(emp => emp.job_title).filter(Boolean))];
      setUniqueJobTitles(jobTitles.map(title => ({ name: title, value: title })));

      // Fetch behavioral groups with competencies
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
      showError('Failed to load assessment data');
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-select position assessment for employee
  const handleEmployeeChange = async (employeeId) => {
    setTemplateError(null);
    const selectedEmployee = employees.find(e => e.id === employeeId);
    if (!selectedEmployee) return;

    setSelectedEmployeeInfo(selectedEmployee);
    
    // Check for existing assessment
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

  // CRUD Operations
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
      showError('Failed to load position assessment for editing');
    }
  };

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
      showError('Failed to load assessment for editing');
    }
  };

  const handleCreatePositionAssessment = async () => {
    if (!positionFormData.position_group || !positionFormData.job_title) {
      showError('Please fill all required fields');
      return;
    }

    if (positionFormData.competency_ratings.length === 0) {
      showError('Please rate at least one competency');
      return;
    }

    setIsSubmitting(true);
    setPositionDuplicateError(null);
    
    try {
      await assessmentApi.positionBehavioral.create(positionFormData);
      setShowCreatePositionModal(false);
      setPositionFormData({ position_group: '', job_title: '', competency_ratings: [] });
      setPositionDuplicateError(null);
      showSuccess('Position assessment template created successfully');
      await fetchData();
    } catch (err) {
      console.error('Error creating position assessment:', err);
      
      if (err.response?.data?.non_field_errors) {
        setPositionDuplicateError({
          message: 'A template for this Position Group and Job Title combination already exists. Please use a different combination or edit the existing template.',
          positionGroup: positionGroups.find(pg => pg.id === positionFormData.position_group)?.name,
          jobTitle: positionFormData.job_title
        });
      } else {
        showError('Failed to create position assessment');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePositionAssessment = async () => {
    if (!editPositionFormData.position_group || !editPositionFormData.job_title) {
      showError('Please fill all required fields');
      return;
    }

    if (editPositionFormData.competency_ratings.length === 0) {
      showError('Please rate at least one competency');
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
      setShowEditPositionModal(false);
      setEditPositionFormData({ id: '', position_group: '', job_title: '', competency_ratings: [] });
      showSuccess('Position assessment template updated successfully');
      await fetchData();
    } catch (err) {
      showError('Failed to update position assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateEmployeeAssessment = async (isDraft = true) => {
    if (!employeeFormData.employee || !employeeFormData.position_assessment) {
      showError('Please select employee and ensure position template is loaded');
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        ...employeeFormData,
        action_type: isDraft ? 'save_draft' : 'submit'
      };
      
      await assessmentApi.employeeBehavioral.create(data);
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
      showSuccess(isDraft ? 'Employee assessment saved as draft' : 'Employee assessment submitted successfully');
      await fetchData();
    } catch (err) {
      showError('Failed to create employee assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateEmployeeAssessment = async (isDraft = true) => {
    if (!editFormData.id) return;

    setIsSubmitting(true);
    try {
      const data = {
        ...editFormData,
        action_type: isDraft ? 'save_draft' : 'submit'
      };
      
      await assessmentApi.employeeBehavioral.update(editFormData.id, data);
      setShowEditEmployeeModal(false);
      setEditFormData({
        employee: '',
        position_assessment: '',
        assessment_date: '',
        competency_ratings: [],
        action_type: 'save_draft'
      });
      setSelectedEmployeeInfo(null);
      showSuccess(isDraft ? 'Assessment updated successfully' : 'Assessment submitted successfully');
      await fetchData();
    } catch (err) {
      showError('Failed to update employee assessment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = async (id) => {
    try {
      await assessmentApi.employeeBehavioral.exportDocument(id);
      showSuccess('Assessment exported successfully');
    } catch (err) {
      showError('Failed to export assessment');
    }
  };

  const handleSubmitAssessment = async (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Submit Assessment',
      message: 'Are you sure you want to submit this assessment? It will be finalized and cannot be edited.',
      type: 'warning',
      onConfirm: async () => {
        try {
          await assessmentApi.employeeBehavioral.submit(id, { status: 'COMPLETED' });
          showSuccess('Assessment submitted successfully');
          await fetchData();
        } catch (err) {
          showError('Failed to submit assessment');
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      }
    });
  };

  const handleReopenAssessment = async (id) => {
    setConfirmModal({
      isOpen: true,
      title: 'Reopen Assessment',
      message: 'Are you sure you want to reopen this assessment for editing?',
      type: 'info',
      onConfirm: async () => {
        try {
          await assessmentApi.employeeBehavioral.reopen(id, { status: 'DRAFT' });
          showSuccess('Assessment reopened for editing');
          await fetchData();
        } catch (err) {
          showError('Failed to reopen assessment');
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      }
    });
  };

  const handleDelete = async (id, type) => {
    setConfirmModal({
      isOpen: true,
      title: 'Delete Assessment',
      message: 'Are you sure you want to delete this assessment? This action cannot be undone.',
      type: 'danger',
      onConfirm: async () => {
        try {
          if (type === 'position') {
            await assessmentApi.positionBehavioral.delete(id);
          } else {
            await assessmentApi.employeeBehavioral.delete(id);
          }
          showSuccess('Assessment deleted successfully');
          await fetchData();
        } catch (err) {
          showError('Failed to delete assessment');
        }
        setConfirmModal({ ...confirmModal, isOpen: false });
      }
    });
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

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-almet-sapphire" />
        <p className="text-gray-600 text-sm">Loading behavioral assessments...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg p-1 shadow-sm border border-gray-200">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('position')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'position'
                ? 'bg-almet-sapphire text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Building size={16} />
            <span>Position Templates</span>
          </button>
          
          <button
            onClick={() => setActiveTab('employee')}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'employee'
                ? 'bg-almet-sapphire text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Users size={16} />
            <span>Employee Assessments</span>
          </button>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-2 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder={`Search ${activeTab === 'position' ? 'positions' : 'employees'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border outline-0 border-gray-300 rounded-md text-sm bg-white focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none"
              />
            </div>
            
            {activeTab === 'employee' && (
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none min-w-[140px]"
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
            label={`New ${activeTab === 'position' ? 'Template' : 'Assessment'}`}
            variant="primary"
            size="md"
          />
        </div>
      </div>

      {/* Main Content Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {activeTab === 'position' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Position Group</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Job Title</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Competencies</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Created</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPositionAssessments.length > 0 ? (
                  filteredPositionAssessments.map((assessment) => (
                    <tr key={assessment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{assessment.position_group_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{assessment.job_title}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{assessment.competency_ratings?.length || 0} competencies</td>
                      <td className="px-4 py-3 text-xs text-gray-500">{new Date(assessment.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <ActionButton onClick={() => { setSelectedAssessment(assessment); setShowViewModal(true); }} icon={Eye} label="" variant="outline" size="xs" />
                          <ActionButton onClick={() => handleEditPositionAssessment(assessment)} icon={Edit} label="" variant="info" size="xs" />
                          <ActionButton onClick={() => handleDelete(assessment.id, 'position')} icon={Trash2} label="" variant="danger" size="xs" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-12">
                      <Building className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-600 font-medium text-sm">No position templates found</p>
                      <p className="text-gray-400 text-xs mt-1">Create your first position assessment template</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Employee</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Position</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Overall Grade</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEmployeeAssessments.length > 0 ? (
                  filteredEmployeeAssessments.map((assessment) => (
                    <tr key={assessment.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{assessment.employee_name}</div>
                        <div className="text-xs text-gray-500">ID: {assessment.employee_id}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">{assessment.position_assessment_title}</td>
                      <td className="px-4 py-3"><StatusBadge status={assessment.status} /></td>
                      <td className="px-4 py-3">
                        <GradeBadge grade={assessment.overall_letter_grade} percentage={parseFloat(assessment.overall_percentage || 0).toFixed(0)} />
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">{new Date(assessment.assessment_date).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          <ActionButton onClick={() => { setSelectedAssessment(assessment); setShowViewModal(true); }} icon={Eye} label="" variant="outline" size="xs" />
                            {assessment.status === 'DRAFT' && <ActionButton onClick={() => handleEditAssessment(assessment)} icon={Edit} label="" variant="info" size="xs" />}
                          <ActionButton onClick={() => handleExport(assessment.id)} icon={Download} label="" variant="secondary" size="xs" />
                          {assessment.status === 'DRAFT' && <ActionButton onClick={() => handleSubmitAssessment(assessment.id)} icon={CheckCircle} label="" variant="success" size="xs" />}
                          {assessment.status === 'COMPLETED' && <ActionButton onClick={() => handleReopenAssessment(assessment.id)} icon={RefreshCw} label="" variant="warning" size="xs" />}
                          <ActionButton onClick={() => handleDelete(assessment.id, 'employee')} icon={Trash2} label="" variant="danger" size="xs" />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-12">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-gray-600 font-medium text-sm">No employee assessments found</p>
                      <p className="text-gray-400 text-xs mt-1">Create your first employee assessment</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Position Modal */}
      {showCreatePositionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh]  shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Building className="w-5 h-5 text-almet-sapphire" />
                Create Position Template
              </h3>
              <button onClick={() => { setShowCreatePositionModal(false); setPositionDuplicateError(null); }} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Position Group <span className="text-red-500">*</span></label>
                  <SearchableDropdown options={positionGroups} value={positionFormData.position_group} onChange={(value) => setPositionFormData({...positionFormData, position_group: value, job_title: ''})} placeholder="Select Position Group"  portal={true}
                   allowUncheck={true}
                  zIndex="z-[60]" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Job Title <span className="text-red-500">*</span></label>
                  <SearchableDropdown options={filteredJobTitles} value={positionFormData.job_title} onChange={(value) => setPositionFormData({...positionFormData, job_title: value})} placeholder="Select or type job title" disabled={!positionFormData.position_group}  portal={true}
                   allowUncheck={true}
                  zIndex="z-[60]" />
                </div>
              </div>
    
              {positionDuplicateError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 mt-0.5 text-red-600 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-red-800">Duplicate Template</h4>
                      <p className="text-xs text-red-700 mt-1">{positionDuplicateError.message}</p>
                      <div className="mt-2 text-xs text-red-600">
                        <strong>Position Group:</strong> {positionDuplicateError.positionGroup}<br />
                        <strong>Job Title:</strong> {positionDuplicateError.jobTitle}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-gray-900">Competency Ratings</h4>
                <button onClick={() => setShowScalesInfo(!showScalesInfo)} className="text-xs text-almet-sapphire hover:text-almet-astral flex items-center gap-1">
                  <Info size={14} />
                  {showScalesInfo ? 'Hide' : 'Show'} Scale Info
                </button>
              </div>

              {showScalesInfo && (
                <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h5 className="text-xs font-medium text-blue-900 mb-2">Behavioral Assessment Scales:</h5>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                    {behavioralScales.map(scale => (
                      <div key={scale.id} className="bg-white p-2 rounded-md border border-blue-100">
                        <div className="text-xs font-semibold text-blue-900 mb-1">Level {scale.scale}</div>
                        <div className="text-xs text-blue-700">{scale.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {behavioralGroups.map(group => (
                  <CollapsibleGroup key={group.id} title={`${group.name} (${group.competencies?.length || 0} competencies)`} isOpen={expandedGroups[group.id]} onToggle={() => toggleGroup(group.id)}>
                    <div className="divide-y divide-gray-100">
                      {group.competencies?.map(competency => (
                        <div key={competency.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                          <div className="flex-1 pr-4">
                            <div className="text-sm font-medium text-gray-900">{competency.name}</div>
                            {competency.description && <div className="text-xs text-gray-600 mt-0.5">{competency.description}</div>}
                          </div>
                          <select value={positionFormData.competency_ratings.find(r => r.behavioral_competency_id === competency.id)?.required_level || ''} onChange={(e) => {
                            const newRatings = [...positionFormData.competency_ratings].filter(r => r.behavioral_competency_id !== competency.id);
                            if (e.target.value) newRatings.push({ behavioral_competency_id: competency.id, required_level: parseInt(e.target.value) });
                            setPositionFormData({...positionFormData, competency_ratings: newRatings});
                          }} className="w-20 px-2 py-1 border border-gray-300 rounded-md text-center text-sm bg-white focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none">
                            <option value="">-</option>
                            {behavioralScales.map(scale => <option key={scale.id} value={scale.scale}>{scale.scale}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  </CollapsibleGroup>
                ))}
              </div>

              {positionFormData.competency_ratings.length > 0 && (
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                  <p className="text-sm text-emerald-700">✓ {positionFormData.competency_ratings.length} competencies rated</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
              <ActionButton onClick={() => { setShowCreatePositionModal(false); setPositionDuplicateError(null); }} icon={X} label="Cancel" variant="outline" size="md" />
              <ActionButton onClick={handleCreatePositionAssessment} icon={Save} label="Create Template" variant="primary" size="md" loading={isSubmitting} disabled={!positionFormData.position_group || !positionFormData.job_title || positionFormData.competency_ratings.length === 0} />
            </div>
          </div>
        </div>
      )}

      {/* Edit Position Modal */}
      {showEditPositionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-almet-sapphire" />
                Edit Position Template
              </h3>
              <button onClick={() => { setShowEditPositionModal(false); setEditPositionFormData({ id: '', position_group: '', job_title: '', competency_ratings: [] }); }} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Position Group <span className="text-red-500">*</span></label>
                  <SearchableDropdown options={positionGroups} portal={true}
                  zIndex="z-[60]" value={editPositionFormData.position_group} onChange={(value) => setEditPositionFormData({...editPositionFormData, position_group: value, job_title: ''})} placeholder="Select Position Group" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Job Title <span className="text-red-500">*</span></label>
                  <SearchableDropdown options={editFilteredJobTitles}  portal={true}
                  zIndex="z-[60]" value={editPositionFormData.job_title} onChange={(value) => setEditPositionFormData({...editPositionFormData, job_title: value})} placeholder="Select or type job title" disabled={!editPositionFormData.position_group} />
                </div>
              </div>

              <div className="space-y-2">
                {behavioralGroups.map(group => (
                  <CollapsibleGroup key={group.id} title={`${group.name} (${group.competencies?.length || 0} competencies)`} isOpen={expandedGroups[group.id]} onToggle={() => toggleGroup(group.id)}>
                    <div className="divide-y divide-gray-100">
                      {group.competencies?.map(competency => (
                        <div key={competency.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                          <div className="flex-1 pr-4">
                            <div className="text-sm font-medium text-gray-900">{competency.name}</div>
                            {competency.description && <div className="text-xs text-gray-600 mt-0.5">{competency.description}</div>}
                          </div>
                          <select value={editPositionFormData.competency_ratings.find(r => r.behavioral_competency_id === competency.id)?.required_level || ''} onChange={(e) => {
                            const newRatings = [...editPositionFormData.competency_ratings].filter(r => r.behavioral_competency_id !== competency.id);
                            if (e.target.value) newRatings.push({ behavioral_competency_id: competency.id, required_level: parseInt(e.target.value) });
                            setEditPositionFormData({...editPositionFormData, competency_ratings: newRatings});
                          }} className="w-20 px-2 py-1 border border-gray-300 rounded-md text-center text-sm bg-white focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none">
                            <option value="">-</option>
                            {behavioralScales.map(scale => <option key={scale.id} value={scale.scale}>{scale.scale}</option>)}
                          </select>
                        </div>
                      ))}
                    </div>
                  </CollapsibleGroup>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
              <ActionButton onClick={() => { setShowEditPositionModal(false); setEditPositionFormData({ id: '', position_group: '', job_title: '', competency_ratings: [] }); }} icon={X} label="Cancel" variant="outline" size="md" />
              <ActionButton onClick={handleUpdatePositionAssessment} icon={Save} label="Update Template" variant="primary" size="md" loading={isSubmitting} disabled={!editPositionFormData.position_group || !editPositionFormData.job_title || editPositionFormData.competency_ratings.length === 0} />
            </div>
          </div>
        </div>
      )}

      {/* Create Employee Assessment Modal */}
      {showCreateEmployeeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-almet-sapphire" />
                Create Employee Assessment
              </h3>
              <button onClick={() => { setShowCreateEmployeeModal(false); setTemplateError(null); setSelectedEmployeeInfo(null); }} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Select Employee <span className="text-red-500">*</span></label>
                <SearchableDropdown options={employees} portal={true} zIndex="z-[60]" value={employeeFormData.employee} onChange={handleEmployeeChange} placeholder="Select Employee" />
              </div>

              {selectedEmployeeInfo && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <div className="text-xs font-medium text-blue-700">Employee</div>
                      <div className="text-sm font-semibold text-blue-900">{selectedEmployeeInfo.name}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-blue-700">Job Title</div>
                      <div className="text-sm font-semibold text-blue-900">{selectedEmployeeInfo.job_title}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-blue-700">Position Group</div>
                      <div className="text-sm font-semibold text-blue-900">{selectedEmployeeInfo.position_group}</div>
                    </div>
                  </div>
                </div>
              )}

              {templateError && (
                <div className={`mb-4 p-3 rounded-lg border ${templateError.type === 'duplicate' ? 'bg-amber-50 border-amber-300' : 'bg-red-50 border-red-300'}`}>
                  <div className="flex items-start gap-2">
                    <AlertCircle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${templateError.type === 'duplicate' ? 'text-amber-600' : 'text-red-600'}`} />
                    <div>
                      <h4 className={`text-sm font-medium ${templateError.type === 'duplicate' ? 'text-amber-800' : 'text-red-800'}`}>
                        {templateError.type === 'duplicate' ? 'Duplicate Assessment' : 'Template Not Found'}
                      </h4>
                      <p className={`text-xs mt-1 ${templateError.type === 'duplicate' ? 'text-amber-700' : 'text-red-700'}`}>{templateError.message}</p>
                    </div>
                  </div>
                </div>
              )}

              {employeeFormData.position_assessment && !templateError && (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900">Competency Assessment</h4>
                    <button onClick={() => setShowScalesInfo(!showScalesInfo)} className="text-xs text-almet-sapphire hover:text-almet-astral flex items-center gap-1">
                      <Info size={14} />
                      {showScalesInfo ? 'Hide' : 'Show'} Scale Info
                    </button>
                  </div>

                  {showScalesInfo && (
                    <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h5 className="text-xs font-medium text-blue-900 mb-2">Behavioral Assessment Scales:</h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                        {behavioralScales.map(scale => (
                          <div key={scale.id} className="bg-white p-2 rounded-md border border-blue-100">
                            <div className="text-xs font-semibold text-blue-900 mb-1">Level {scale.scale}</div>
                            <div className="text-xs text-blue-700">{scale.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Competency</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-24">Required</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-24">Actual</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-20">Gap</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {(() => {
                            const selectedPosition = positionAssessments.find(p => p.id === employeeFormData.position_assessment);
                            if (!selectedPosition) return null;

                            const groupedCompetencies = {};
                            selectedPosition.competency_ratings?.forEach(rating => {
                              const groupName = rating.competency_group_name || 'Other';
                              if (!groupedCompetencies[groupName]) groupedCompetencies[groupName] = [];
                              groupedCompetencies[groupName].push(rating);
                            });

                            return Object.entries(groupedCompetencies).map(([groupName, competencies]) => (
                              <React.Fragment key={groupName}>
                                <tr className="bg-gray-100">
                                  <td colSpan="5" className="px-3 py-2 text-xs font-semibold text-gray-700">{groupName}</td>
                                </tr>
                                {competencies.map(competency => {
                                  const employeeRating = employeeFormData.competency_ratings.find(r => r.behavioral_competency_id === competency.behavioral_competency);
                                  const actualLevel = employeeRating?.actual_level || 0;
                                  const gap = actualLevel - competency.required_level;
                                  
                                  return (
                                    <tr key={competency.id} className="hover:bg-gray-50">
                                      <td className="px-3 py-2 text-sm text-gray-900">{competency.competency_name}</td>
                                      <td className="px-3 py-2 text-center">
                                        <span className="inline-flex px-2 py-0.5 bg-almet-sapphire text-white rounded-md text-xs font-medium">{competency.required_level}</span>
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        <select value={actualLevel} onChange={(e) => {
                                          const newRatings = [...employeeFormData.competency_ratings].filter(r => r.behavioral_competency_id !== competency.behavioral_competency);
                                          newRatings.push({ behavioral_competency_id: competency.behavioral_competency, actual_level: parseInt(e.target.value), notes: employeeRating?.notes || '' });
                                          setEmployeeFormData({...employeeFormData, competency_ratings: newRatings});
                                        }} className="w-full px-2 py-1 border border-gray-300 rounded-md text-center text-sm bg-white focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none">
                                          <option value={0}>-</option>
                                          {behavioralScales.map(scale => <option key={scale.id} value={scale.scale}>{scale.scale}</option>)}
                                        </select>
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${gap > 0 ? 'bg-emerald-50 text-emerald-700' : gap < 0 ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                                          {gap > 0 ? `+${gap}` : gap}
                                        </span>
                                      </td>
                                      <td className="px-3 py-2">
                                        <textarea value={employeeRating?.notes || ''} onChange={(e) => {
                                          const newRatings = [...employeeFormData.competency_ratings].filter(r => r.behavioral_competency_id !== competency.behavioral_competency);
                                          newRatings.push({ behavioral_competency_id: competency.behavioral_competency, actual_level: actualLevel, notes: e.target.value });
                                          setEmployeeFormData({...employeeFormData, competency_ratings: newRatings});
                                        }} placeholder="Assessment notes..." rows="2" className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm resize-none focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none" />
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
                </>
              )}
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
              <ActionButton onClick={() => { setShowCreateEmployeeModal(false); setTemplateError(null); setSelectedEmployeeInfo(null); }} icon={X} label="Cancel" variant="outline" size="md" />
              {employeeFormData.position_assessment && !templateError && (
                <>
                  <ActionButton onClick={() => handleCreateEmployeeAssessment(true)} icon={Save} label="Save Draft" variant="secondary" size="md" loading={isSubmitting} />
                  <ActionButton onClick={() => handleCreateEmployeeAssessment(false)} icon={CheckCircle} label="Submit" variant="success" size="md" loading={isSubmitting} />
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Edit Employee Assessment Modal */}
      {showEditEmployeeModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Edit className="w-5 h-5 text-almet-sapphire" />
                Edit Employee Assessment
              </h3>
              <button onClick={() => { setShowEditEmployeeModal(false); setSelectedEmployeeInfo(null); }} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              {selectedEmployeeInfo && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <div className="text-xs font-medium text-blue-700">Employee</div>
                      <div className="text-sm font-semibold text-blue-900">{selectedEmployeeInfo.name}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-blue-700">Job Title</div>
                      <div className="text-sm font-semibold text-blue-900">{selectedEmployeeInfo.job_title}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-blue-700">Position Group</div>
                      <div className="text-sm font-semibold text-blue-900">{selectedEmployeeInfo.position_group_name}</div>
                    </div>
                  </div>
                </div>
              )}

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Competency</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-24">Required</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-24">Actual</th>
                        <th className="px-3 py-2 text-center text-xs font-medium text-gray-600 w-20">Gap</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {(() => {
                        const selectedPosition = positionAssessments.find(p => p.id === editFormData.position_assessment);
                        if (!selectedPosition) return null;

                        const groupedCompetencies = {};
                        selectedPosition.competency_ratings?.forEach(rating => {
                          const groupName = rating.competency_group_name || 'Other';
                          if (!groupedCompetencies[groupName]) groupedCompetencies[groupName] = [];
                          groupedCompetencies[groupName].push(rating);
                        });

                        return Object.entries(groupedCompetencies).map(([groupName, competencies]) => (
                          <React.Fragment key={groupName}>
                            <tr className="bg-gray-100">
                              <td colSpan="5" className="px-3 py-2 text-xs font-semibold text-gray-700">{groupName}</td>
                            </tr>
                            {competencies.map(competency => {
                              const employeeRating = editFormData.competency_ratings.find(r => r.behavioral_competency_id === competency.behavioral_competency);
                              const actualLevel = employeeRating?.actual_level || 0;
                              const gap = actualLevel - competency.required_level;
                              
                              return (
                                <tr key={competency.id} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 text-sm text-gray-900">{competency.competency_name}</td>
                                  <td className="px-3  py-2 text-center">
                                    <span className="inline-flex px-2 py-0.5 bg-almet-sapphire text-white rounded-md text-xs font-medium">{competency.required_level}</span>
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <select value={actualLevel} onChange={(e) => {
                                      const newRatings = [...editFormData.competency_ratings].filter(r => r.behavioral_competency_id !== competency.behavioral_competency);
                                      newRatings.push({ behavioral_competency_id: competency.behavioral_competency, actual_level: parseInt(e.target.value), notes: employeeRating?.notes || '' });
                                      setEditFormData({...editFormData, competency_ratings: newRatings});
                                    }} className="w-full px-2 py-1 border border-gray-300 rounded-md text-center text-sm bg-white focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none">
                                      <option value={0}>-</option>
                                      {behavioralScales.map(scale => <option key={scale.id} value={scale.scale}>{scale.scale}</option>)}
                                    </select>
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${gap > 0 ? 'bg-emerald-50 text-emerald-700' : gap < 0 ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                                      {gap > 0 ? `+${gap}` : gap}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2">
                                    <textarea value={employeeRating?.notes || ''} onChange={(e) => {
                                      const newRatings = [...editFormData.competency_ratings].filter(r => r.behavioral_competency_id !== competency.behavioral_competency);
                                      newRatings.push({ behavioral_competency_id: competency.behavioral_competency, actual_level: actualLevel, notes: e.target.value });
                                      setEditFormData({...editFormData, competency_ratings: newRatings});
                                    }} placeholder="Assessment notes..." rows="2" className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm resize-none focus:border-almet-sapphire focus:ring-1 focus:ring-almet-sapphire focus:outline-none" />
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
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
              <ActionButton onClick={() => { setShowEditEmployeeModal(false); setSelectedEmployeeInfo(null); }} icon={X} label="Cancel" variant="outline" size="md" />
              <ActionButton onClick={() => handleUpdateEmployeeAssessment(true)} icon={Save} label="Update Draft" variant="secondary" size="md" loading={isSubmitting} />
              <ActionButton onClick={() => handleUpdateEmployeeAssessment(false)} icon={CheckCircle} label="Submit" variant="success" size="md" loading={isSubmitting} />
            </div>
          </div>
        </div>
      )}

      {/* View Assessment Modal */}
      {showViewModal && selectedAssessment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Eye className="w-5 h-5 text-almet-sapphire" />
                {activeTab === 'position' ? 'Position Template Details' : 'Assessment Details'}
              </h3>
              <button onClick={() => { setShowViewModal(false); setSelectedAssessment(null); }} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[calc(90vh-140px)]">
              {activeTab === 'position' ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-xs font-medium text-gray-600">Position Group</div>
                      <div className="text-sm font-medium text-gray-900 mt-1">{selectedAssessment.position_group_name}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-600">Job Title</div>
                      <div className="text-sm font-medium text-gray-900 mt-1">{selectedAssessment.job_title}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-600">Created By</div>
                      <div className="text-sm text-gray-700 mt-1">{selectedAssessment.created_by_name}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-600">Created Date</div>
                      <div className="text-sm text-gray-700 mt-1">{new Date(selectedAssessment.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 p-3 border-b border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900">Required Competency Levels</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Group</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Competency</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Required Level</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {selectedAssessment.competency_ratings?.map((rating, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-xs text-gray-600">{rating.competency_group_name}</td>
                              <td className="px-3 py-2 text-sm font-medium text-gray-900">{rating.competency_name}</td>
                              <td className="px-3 py-2 text-center">
                                <span className="inline-flex px-2 py-0.5 bg-almet-sapphire text-white rounded-md text-xs font-medium">{rating.required_level}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-xs font-medium text-gray-600">Employee</div>
                      <div className="text-sm font-medium text-gray-900 mt-1">{selectedAssessment.employee_name}</div>
                      <div className="text-xs text-gray-500">ID: {selectedAssessment.employee_id}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-600">Position</div>
                      <div className="text-sm text-gray-700 mt-1">{selectedAssessment.position_assessment_title}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-600">Status</div>
                      <div className="mt-1"><StatusBadge status={selectedAssessment.status} /></div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-600">Assessment Date</div>
                      <div className="text-sm text-gray-700 mt-1">{new Date(selectedAssessment.assessment_date).toLocaleDateString()}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-600">Overall Grade</div>
                      <div className="mt-1">
                        <GradeBadge grade={selectedAssessment.overall_letter_grade} percentage={parseFloat(selectedAssessment.overall_percentage || 0).toFixed(0)} />
                      </div>
                    </div>
                  </div>

                  {selectedAssessment.group_scores && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                      <h5 className="text-xs font-medium text-emerald-900 mb-2">Group Performance Summary</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {Object.entries(selectedAssessment.group_scores).map(([groupName, scores]) => (
                          <div key={groupName} className="bg-white p-2 rounded-md border border-emerald-100">
                            <h6 className="text-xs font-medium text-gray-900 mb-1">{groupName}</h6>
                            <div className="space-y-0.5 text-xs">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Grade:</span>
                                <span className="font-medium">{scores.letter_grade}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Score:</span>
                                <span className="font-medium">{scores.percentage}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Points:</span>
                                <span className="font-medium">{scores.employee_total}/{scores.position_total}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-100 p-3 border-b border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900">Detailed Assessment Results</h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Group</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Competency</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Required</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Actual</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-600">Gap</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-600">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {selectedAssessment.competency_ratings?.map((rating, index) => {
                            const gap = rating.actual_level - rating.required_level;
                            return (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-3 py-2 text-xs text-gray-600">{rating.competency_group_name}</td>
                                <td className="px-3 py-2 text-sm font-medium text-gray-900">{rating.competency_name}</td>
                                <td className="px-3 py-2 text-center">
                                  <span className="inline-flex px-2 py-0.5 bg-almet-sapphire text-white rounded-md text-xs font-medium">{rating.required_level}</span>
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <span className="inline-flex px-2 py-0.5 bg-gray-500 text-white rounded-md text-xs font-medium">{rating.actual_level}</span>
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${gap > 0 ? 'bg-emerald-50 text-emerald-700' : gap < 0 ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'}`}>
                                    {gap > 0 ? `+${gap}` : gap}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-xs text-gray-600">{rating.notes || '-'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 p-4 border-t border-gray-200 bg-gray-50">
              {activeTab === 'employee' && selectedAssessment.status === 'COMPLETED' && (
                <ActionButton onClick={() => handleExport(selectedAssessment.id)} icon={Download} label="Export" variant="secondary" size="md" />
              )}
              <ActionButton onClick={() => { setShowViewModal(false); setSelectedAssessment(null); }} icon={X} label="Close" variant="outline" size="md" />
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </div>
  );
};

export default BehavioralAssessmentCalculation;