// pages/job-descriptions/JobDescriptionPage.jsx - Updated with Enhanced Competency Selection
'use client'
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Search, 
  FileText, 
  Users, 
  Target, 
  Download, 
  Upload, 
  ChevronDown, 
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  CheckSquare,
  User,
  Building,
  Briefcase,
  Filter,
  Save,
  X
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTheme } from '@/components/common/ThemeProvider';
import jobDescriptionService from '@/services/jobDescriptionService';
import competencyApi from '@/services/competencyApi';


const JobDescriptionPage = () => {
  const { darkMode } = useTheme();
  
  // Theme-dependent classes using Almet colors
  const bgApp = darkMode ? "bg-gray-900" : "bg-almet-mystic";
  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const bgCardHover = darkMode ? "bg-almet-san-juan" : "bg-gray-50";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";
  const bgAccent = darkMode ? "bg-almet-comet" : "bg-almet-mystic";

  // State management
  const [activeView, setActiveView] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  // State for submission workflow
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionComments, setSubmissionComments] = useState('');
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [createdJobId, setCreatedJobId] = useState(null);

  // Data states
  const [jobDescriptions, setJobDescriptions] = useState([]);
  const [stats, setStats] = useState({});
  const [dropdownData, setDropdownData] = useState({
    businessFunctions: [],
    departments: [],
    units: [],
    jobFunctions: [],
    positionGroups: [],
    employees: [],
    jobTitles: [],
    skillGroups: [],
    skills: [],
    behavioralGroups: [],
    competencies: [],
    businessResources: [],
    accessMatrix: [],
    companyBenefits: [],
    gradingLevels: []
  });

  // Enhanced competency selection state
  const [selectedSkillGroup, setSelectedSkillGroup] = useState('');
  const [selectedBehavioralGroup, setSelectedBehavioralGroup] = useState('');
  const [availableSkills, setAvailableSkills] = useState([]);
  const [availableCompetencies, setAvailableCompetencies] = useState([]);
  const [selectedPositionGroup, setSelectedPositionGroup] = useState('');

  // Form state with all fields
  const [formData, setFormData] = useState({
    job_title: '',
    job_purpose: '',
    business_function: '',
    department: '',
    unit: '',
    position_group: '',
    grading_level: '',
    reports_to: '',
    assigned_employee: '',
    manual_employee_name: '',
    manual_employee_phone: '',
    criticalDuties: [''],
    positionMainKpis: [''],
    jobDuties: [''],
    requirements: [''],
    required_skills_data: [],
    behavioral_competencies_data: [],
    business_resources_ids: [],
    access_rights_ids: [],
    company_benefits_ids: []
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  // Load grading levels when position group changes
  useEffect(() => {
    if (selectedPositionGroup) {
      fetchGradingLevels(selectedPositionGroup);
    } else {
      setDropdownData(prev => ({ ...prev, gradingLevels: [] }));
    }
  }, [selectedPositionGroup]);

  // Load skills when skill group changes
  useEffect(() => {
    if (selectedSkillGroup) {
      fetchSkillsForGroup(selectedSkillGroup);
    } else {
      setAvailableSkills([]);
    }
  }, [selectedSkillGroup]);

  // Load competencies when behavioral group changes
  useEffect(() => {
    if (selectedBehavioralGroup) {
      fetchCompetenciesForGroup(selectedBehavioralGroup);
    } else {
      setAvailableCompetencies([]);
    }
  }, [selectedBehavioralGroup]);

  // Prepare data for API submission
  const prepareJobDescriptionData = (formData) => {
    console.log('Preparing data for API:', formData);
    
    const apiData = {
      job_title: formData.job_title,
      job_purpose: formData.job_purpose,
      business_function: formData.business_function,
      department: formData.department,
      unit: formData.unit || null,
      position_group: formData.position_group,
      grading_level: formData.grading_level || null,
      reports_to: formData.reports_to || null,
      assigned_employee: formData.assigned_employee || null,
      manual_employee_name: formData.manual_employee_name || '',
     
      manual_employee_phone: formData.manual_employee_phone || '',
      sections: [],
      required_skills_data: [],
      behavioral_competencies_data: [],
      business_resources_ids: formData.business_resources_ids || [],
      access_rights_ids: formData.access_rights_ids || [],
      company_benefits_ids: formData.company_benefits_ids || []
    };

    // Process sections
    const sectionTypes = [
      { type: 'CRITICAL_DUTIES', title: 'Critical Duties', content: formData.criticalDuties },
      { type: 'POSITION_MAIN_KPIS', title: 'Position Main KPIs', content: formData.positionMainKpis },
      { type: 'JOB_DUTIES', title: 'Job Duties', content: formData.jobDuties },
      { type: 'REQUIREMENTS', title: 'Requirements', content: formData.requirements }
    ];

    sectionTypes.forEach((section, index) => {
      if (section.content && Array.isArray(section.content) && section.content.length > 0) {
        const validContent = section.content.filter(item => item && item.trim() !== '');
        if (validContent.length > 0) {
          apiData.sections.push({
            section_type: section.type,
            title: section.title,
            content: validContent.map(item => `• ${item.trim()}`).join('\n'),
            order: index + 1
          });
        }
      }
    });

    // Process required skills
    if (formData.required_skills_data && formData.required_skills_data.length > 0) {
      apiData.required_skills_data = formData.required_skills_data.map(skillId => ({
        skill_id: skillId,
        proficiency_level: "INTERMEDIATE", // Default proficiency
        is_mandatory: true // Default to mandatory
      }));
    }

    // Process behavioral competencies
    if (formData.behavioral_competencies_data && formData.behavioral_competencies_data.length > 0) {
      apiData.behavioral_competencies_data = formData.behavioral_competencies_data.map(competencyId => ({
        competency_id: competencyId,
        proficiency_level: "INTERMEDIATE", // Default proficiency
        is_mandatory: true // Default to mandatory
      }));
    }

    console.log('Prepared API data:', apiData);
    return apiData;
  };

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchJobDescriptions(),
        fetchStats(),
        fetchDropdownData()
      ]);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobDescriptions = async () => {
    try {
      const response = await jobDescriptionService.getJobDescriptions();
      setJobDescriptions(response.results || []);
    } catch (error) {
      console.error('Error fetching job descriptions:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await jobDescriptionService.getJobDescriptionStats();
      setStats(response);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchDropdownData = async () => {
    try {
      // Create separate API calls using direct endpoints
      const fetchOptions = (endpoint) => ({
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

      const [
        businessFunctionsRes,
        departmentsRes, 
        unitsRes,
        jobFunctionsRes,
        positionGroupsRes,
        employeesRes,
        skillGroupsRes,
        behavioralGroupsRes,
        businessResourcesRes,
        accessMatrixRes,
        companyBenefitsRes
      ] = await Promise.all([
        fetch(`${baseUrl}/business-functions/`, fetchOptions()),
        fetch(`${baseUrl}/departments/`, fetchOptions()),
        fetch(`${baseUrl}/units/`, fetchOptions()),
        fetch(`${baseUrl}/job-functions/`, fetchOptions()),
        fetch(`${baseUrl}/position-groups/`, fetchOptions()),
        fetch(`${baseUrl}/employees/?page_size=1000`, fetchOptions()), // Get all employees without pagination
        competencyApi.skillGroups.getAll(),
        competencyApi.behavioralGroups.getAll(),
        jobDescriptionService.getBusinessResources(),
        jobDescriptionService.getAccessMatrix(),
        jobDescriptionService.getCompanyBenefits()
      ]);

      // Parse JSON responses
      const businessFunctions = businessFunctionsRes.ok ? await businessFunctionsRes.json() : { results: [] };
      const departments = departmentsRes.ok ? await departmentsRes.json() : { results: [] };
      const units = unitsRes.ok ? await unitsRes.json() : { results: [] };
      const jobFunctions = jobFunctionsRes.ok ? await jobFunctionsRes.json() : { results: [] };
      const positionGroups = positionGroupsRes.ok ? await positionGroupsRes.json() : { results: [] };
      const employees = employeesRes.ok ? await employeesRes.json() : { results: [] };

      // Extract unique job titles from employees
      const uniqueJobTitles = [...new Set(
        (employees.results || [])
          .map(emp => emp.job_title)
          .filter(title => title && title.trim() !== '')
      )].map((title, index) => ({
        id: title,
        name: title,
        display_name: title
      }));

      setDropdownData({
        businessFunctions: businessFunctions.results || [],
        departments: departments.results || [],
        units: units.results || [],
        jobFunctions: jobFunctions.results || [],
        positionGroups: positionGroups.results || [],
        employees: employees.results || [],
        jobTitles: uniqueJobTitles,
        skillGroups: skillGroupsRes.results || [],
        behavioralGroups: behavioralGroupsRes.results || [],
        businessResources: businessResourcesRes.results || [],
        accessMatrix: accessMatrixRes.results || [],
        companyBenefits: companyBenefitsRes.results || [],
        gradingLevels: []
      });
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      // Set empty arrays to prevent crashes
      setDropdownData({
        businessFunctions: [],
        departments: [],
        units: [],
        jobFunctions: [],
        positionGroups: [],
        employees: [],
        jobTitles: [],
        skillGroups: [],
        behavioralGroups: [],
        businessResources: [],
        accessMatrix: [],
        companyBenefits: [],
        gradingLevels: []
      });
    }
  };

  const fetchGradingLevels = async (positionGroupId) => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${baseUrl}/position-groups/${positionGroupId}/grading_levels/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDropdownData(prev => ({
          ...prev,
          gradingLevels: data.levels || []
        }));
      }
    } catch (error) {
      console.error('Error fetching grading levels:', error);
      setDropdownData(prev => ({ ...prev, gradingLevels: [] }));
    }
  };

  const fetchSkillsForGroup = async (groupId) => {
    try {
      const response = await competencyApi.skillGroups.getSkills(groupId);
      console.log('Skills response:', response); // Debug log
      
      // Response is directly an array, not wrapped in an object
      const skills = Array.isArray(response) ? response : (response.skills || response.results || []);
      setAvailableSkills(skills);
    } catch (error) {
      console.error('Error fetching skills for group:', error);
      setAvailableSkills([]);
    }
  };

  const fetchCompetenciesForGroup = async (groupId) => {
    try {
      const response = await competencyApi.behavioralGroups.getCompetencies(groupId);
      console.log('Competencies response:', response); // Debug log
      
      // Response is directly an array, not wrapped in an object
      const competencies = Array.isArray(response) ? response : (response.competencies || response.results || []);
      setAvailableCompetencies(competencies);
    } catch (error) {
      console.error('Error fetching competencies for group:', error);
      setAvailableCompetencies([]);
    }
  };

  // Filter jobs based on search and department
  const filteredJobs = useMemo(() => {
    return jobDescriptions.filter(job => {
      const matchesSearch = !searchTerm || 
        job.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.employee_info?.name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = !selectedDepartment || job.department_name === selectedDepartment;
      
      return matchesSearch && matchesDepartment;
    });
  }, [jobDescriptions, searchTerm, selectedDepartment]);

  // Handle form submission
  const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Enhanced validation with detailed error messages
  const errors = [];
  
  if (!formData.job_title?.trim()) {
    errors.push('Job Title is required');
  }
  if (!formData.job_purpose?.trim()) {
    errors.push('Job Purpose is required');
  }
  if (!formData.business_function) {
    errors.push('Business Function is required');
  }
  if (!formData.department) {
    errors.push('Department is required');
  }
  if (!formData.position_group) {
    errors.push('Position Group is required');
  }
  
  // Check if at least one item exists in required arrays and has content
  const criticalDutiesValid = formData.criticalDuties && 
    formData.criticalDuties.some(duty => duty.trim() !== '');
  if (!criticalDutiesValid) {
    errors.push('At least one Critical Duty is required');
  }
  
  const positionMainKpisValid = formData.positionMainKpis && 
    formData.positionMainKpis.some(kpi => kpi.trim() !== '');
  if (!positionMainKpisValid) {
    errors.push('At least one Position Main KPI is required');
  }
  
  const jobDutiesValid = formData.jobDuties && 
    formData.jobDuties.some(duty => duty.trim() !== '');
  if (!jobDutiesValid) {
    errors.push('At least one Job Duty is required');
  }
  
  const requirementsValid = formData.requirements && 
    formData.requirements.some(req => req.trim() !== '');
  if (!requirementsValid) {
    errors.push('At least one Requirement is required');
  }

  if (errors.length > 0) {
    alert('Please fix the following errors:\n\n' + errors.join('\n'));
    return;
  }

  try {
    setActionLoading(true);
    
    console.log('Form data before processing:', formData); // Debug log
    
    // Call the prepareJobDescriptionData function and assign the result to apiData
    const apiData = prepareJobDescriptionData(formData);
    
    console.log('API data being sent:', apiData); // Debug log
    
    if (editingJob) {
      await jobDescriptionService.updateJobDescription(editingJob.id, apiData);
      alert('Job description updated successfully!');
      await fetchJobDescriptions();
      await fetchStats();
      resetForm();
    } else {
      // Create job description (will be in DRAFT status)
      const createdJob = await jobDescriptionService.createJobDescription(apiData);
      setCreatedJobId(createdJob.id);
      
      // Show submission modal to ask if they want to submit for approval
      setShowSubmissionModal(true);
    }
  } catch (error) {
    console.error('Error saving job description:', error);
    alert('Error saving job description: ' + (error.response?.data?.message || error.message || 'Please try again.'));
  } finally {
    setActionLoading(false);
  }
};

  // Handle submission for approval
  const handleSubmitForApproval = async () => {
    if (!createdJobId) return;

    try {
      setSubmissionLoading(true);
      
      await jobDescriptionService.submitForApproval(createdJobId, {
        comments: submissionComments
      });
      
      alert('Job description submitted for approval successfully!');
      
      // Refresh data and reset form
      await fetchJobDescriptions();
      await fetchStats();
      setShowSubmissionModal(false);
      setSubmissionComments('');
      setCreatedJobId(null);
      resetForm();
    } catch (error) {
      console.error('Error submitting for approval:', error);
      alert('Error submitting for approval. Please try again.');
    } finally {
      setSubmissionLoading(false);
    }
  };

  // Handle keeping as draft
  const handleKeepAsDraft = async () => {
    alert('Job description saved as draft successfully!');
    
    // Refresh data and reset form
    await fetchJobDescriptions();
    await fetchStats();
    setShowSubmissionModal(false);
    setSubmissionComments('');
    setCreatedJobId(null);
    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      job_title: '',
      job_purpose: '',
      business_function: '',
      department: '',
      unit: '',
      position_group: '',
      grading_level: '',
      reports_to: '',
      assigned_employee: '',
      manual_employee_name: '',
      manual_employee_phone: '',
      criticalDuties: [''],
      positionMainKpis: [''],
      jobDuties: [''],
      requirements: [''],
      required_skills_data: [],
      behavioral_competencies_data: [],
      business_resources_ids: [],
      access_rights_ids: [],
      company_benefits_ids: []
    });
    setEditingJob(null);
    setActiveView('list');
    setSelectedSkillGroup('');
    setSelectedBehavioralGroup('');
    setSelectedPositionGroup('');
    setAvailableSkills([]);
    setAvailableCompetencies([]);
    setDropdownData(prev => ({ ...prev, gradingLevels: [] }));
  };

  // Handle edit
  const handleEdit = async (job) => {
    try {
      setActionLoading(true);
      const fullJob = await jobDescriptionService.getJobDescription(job.id);
      const transformedData = jobDescriptionService.transformJobDescriptionResponse(fullJob);
      setFormData(transformedData);
      setEditingJob(fullJob);
      
      // Set selected groups for dependent dropdowns
      if (transformedData.position_group) {
        setSelectedPositionGroup(transformedData.position_group);
      }
      
      setActiveView('create');
    } catch (error) {
      console.error('Error loading job for edit:', error);
      alert('Error loading job description. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this job description?')) {
      return;
    }

    try {
      setActionLoading(true);
      await jobDescriptionService.deleteJobDescription(id);
      await fetchJobDescriptions();
      await fetchStats();
      alert('Job description deleted successfully!');
    } catch (error) {
      console.error('Error deleting job description:', error);
      alert('Error deleting job description. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle array field changes
  const handleArrayFieldChange = (fieldName, index, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].map((item, i) => i === index ? value : item)
    }));
  };

  // Add new item to array field
  const addArrayItem = (fieldName) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: [...prev[fieldName], '']
    }));
  };

  // Remove item from array field
  const removeArrayItem = (fieldName, index) => {
    if (formData[fieldName].length > 1) {
      setFormData(prev => ({
        ...prev,
        [fieldName]: prev[fieldName].filter((_, i) => i !== index)
      }));
    }
  };

  // Handle multi-select changes
  const handleMultiSelectChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].includes(value)
        ? prev[fieldName].filter(item => item !== value)
        : [...prev[fieldName], value]
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'PENDING_LINE_MANAGER':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'PENDING_EMPLOYEE':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'REVISION_REQUIRED':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'DRAFT':
        return <Edit size={16} />;
      case 'PENDING_LINE_MANAGER':
      case 'PENDING_EMPLOYEE':
        return <Clock size={16} />;
      case 'APPROVED':
        return <CheckCircle size={16} />;
      case 'REJECTED':
        return <XCircle size={16} />;
      case 'REVISION_REQUIRED':
        return <RotateCcw size={16} />;
      default:
        return <AlertCircle size={16} />;
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color = "almet-sapphire" }) => (
    <div className={`${bgCard} rounded-lg p-6 border ${borderColor} shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${textMuted}`}>{title}</p>
          <p className={`text-2xl font-bold text-${color}`}>{value}</p>
          {subtitle && <p className={`text-xs ${textMuted}`}>{subtitle}</p>}
        </div>
        <div className={`p-3 bg-${color}/10 rounded-lg`}>
          <Icon className={`h-6 w-6 text-${color}`} />
        </div>
      </div>
    </div>
  );

  // Enhanced Searchable Select component with custom value support
  const SearchableSelect = ({ options, value, onChange, placeholder, required = false, name, disabled = false, allowCustom = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredOptions = options.filter(option =>
      option.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      option.display_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const selectedOption = options.find(option => option.id === value);
    const displayValue = selectedOption ? (selectedOption.display_name || selectedOption.name) : value;

    return (
      <div className="relative">
        <div className="relative">
          {allowCustom ? (
            <input
              type="text"
              value={displayValue || ''}
              onChange={(e) => {
                onChange(e.target.value);
                setSearchTerm(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              disabled={disabled}
              className={`w-full px-3 py-2 pr-8 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-text'
              }`}
              placeholder={placeholder}
            />
          ) : (
            <button
              type="button"
              onClick={() => !disabled && setIsOpen(!isOpen)}
              disabled={disabled}
              className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-left flex items-center justify-between ${
                disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              <span>
                {displayValue || placeholder}
              </span>
            </button>
          )}
          
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
          >
            <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''} ${disabled ? 'opacity-50' : ''}`} />
          </button>
        </div>
        
        {isOpen && !disabled && filteredOptions.length > 0 && (
          <div className={`absolute top-full left-0 right-0 mt-1 ${bgCard} border ${borderColor} rounded-lg shadow-lg z-20`}>
            <div className="max-h-48 overflow-y-auto">
              {!allowCustom && (
                <button
                  type="button"
                  onClick={() => {
                    onChange('');
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full px-3 py-2 text-left hover:${bgCardHover} ${textMuted} text-sm`}
                >
                  {placeholder}
                </button>
              )}
              {filteredOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  className={`w-full px-3 py-2 text-left hover:${bgCardHover} ${textPrimary} text-sm ${
                    value === option.id ? 'bg-almet-sapphire text-white' : ''
                  }`}
                >
                  {option.display_name || option.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };
  const MultiSelect = ({ options, selected, onChange, placeholder, fieldName }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-left flex items-center justify-between`}
        >
          <span>
            {selected.length > 0 ? `${selected.length} selected` : placeholder}
          </span>
          <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className={`absolute top-full left-0 right-0 mt-1 ${bgCard} border ${borderColor} rounded-lg shadow-lg max-h-48 overflow-y-auto z-10`}>
            {options.map((option) => (
              <label key={option.id || option.value} className={`flex items-center px-3 py-2 hover:${bgCardHover} cursor-pointer`}>
                <input
                  type="checkbox"
                  checked={selected.includes(option.id || option.value)}
                  onChange={() => onChange(fieldName, option.id || option.value)}
                  className="mr-2 text-almet-sapphire focus:ring-almet-sapphire"
                />
                <span className={`text-sm ${textPrimary}`}>{option.name || option.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Enhanced Competency Selection Component
  const CompetencySelection = ({ type, groupOptions, availableItems, selectedGroup, onGroupChange, selectedItems, onItemChange, groupLabel, itemLabel }) => {
    
    // Debug log
    console.log(`${type} - selectedGroup:`, selectedGroup);
    console.log(`${type} - availableItems:`, availableItems);
    
    return (
      <div className="space-y-4">
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            {groupLabel}
          </label>
          <SearchableSelect
            options={groupOptions}
            value={selectedGroup}
            onChange={(value) => {
              console.log(`${type} - Group changed to:`, value);
              onGroupChange(value);
            }}
            placeholder={`Select ${groupLabel}`}
          />
        </div>

        {selectedGroup && (
          <div>
            <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
              {itemLabel} ({availableItems.length} available)
            </label>
            {availableItems.length > 0 ? (
              <MultiSelect
                options={availableItems}
                selected={selectedItems}
                onChange={onItemChange}
                placeholder={`Select ${itemLabel.toLowerCase()}...`}
                fieldName={type === 'skills' ? 'required_skills_data' : 'behavioral_competencies_data'}
              />
            ) : (
              <div className={`p-3 border ${borderColor} rounded-lg ${bgAccent} text-center`}>
                <p className={`text-sm ${textMuted}`}>
                  {selectedGroup ? 'Loading...' : `No ${itemLabel.toLowerCase()} available`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className={`min-h-screen ${bgApp} p-6`}>
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-almet-sapphire"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={`min-h-screen ${bgApp} p-6`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className={`text-3xl font-bold ${textPrimary}`}>Job Descriptions</h1>
                <p className={`${textSecondary} mt-1`}>
                  Create and manage job descriptions for all positions
                </p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Upload size={16} />
                  Import
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors">
                  <Download size={16} />
                  Export
                </button>
                <button
                  onClick={() => {
                    resetForm();
                    setActiveView('create');
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors"
                >
                  <Plus size={16} />
                  Create New
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <StatCard 
                title="Total Job Descriptions" 
                value={stats.total_job_descriptions || 0} 
                icon={FileText}
                color="almet-sapphire"
              />
              <StatCard 
                title="Pending Approvals" 
                value={stats.pending_approvals?.total || 0} 
                icon={Clock}
                color="yellow-600"
              />
              <StatCard 
                title="Approved" 
                value={stats.approval_workflow_summary?.approved || 0} 
                icon={CheckCircle}
                color="green-600"
              />
              <StatCard 
                title="Draft" 
                value={stats.approval_workflow_summary?.draft || 0} 
                icon={Edit}
                color="gray-600"
              />
            </div>

            {/* Navigation Tabs */}
            <div className={`flex space-x-1 ${bgAccent} rounded-lg p-1`}>
              {[
                { id: 'list', name: 'Job List', icon: FileText },
                { id: 'create', name: editingJob ? 'Edit Job' : 'Create New', icon: Plus }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveView(tab.id);
                    if (tab.id === 'list') {
                      setEditingJob(null);
                    }
                  }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                    activeView === tab.id
                      ? `${bgCard} text-almet-sapphire shadow-sm`
                      : `${textSecondary} hover:${textPrimary}`
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          {activeView === 'list' ? (
            <>
              {/* Search and Filter */}
              <div className={`${bgCard} rounded-lg p-6 mb-6 border ${borderColor} shadow-sm`}>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textMuted}`} size={20} />
                    <input
                      type="text"
                      placeholder="Search job titles, departments, or employees..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                    />
                  </div>
                  <select
                    value={selectedDepartment}
                    onChange={(e) => setSelectedDepartment(e.target.value)}
                    className={`px-4 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                  >
                    <option value="">All Departments</option>
                    {dropdownData.departments.map(dept => (
                      <option key={dept.id} value={dept.name}>{dept.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Job List */}
              <div className={`${bgCard} rounded-lg border ${borderColor} shadow-sm`}>
                <div className="p-6">
                  <div className="grid gap-4">
                    {filteredJobs.map(job => (
                      <div key={job.id} className={`p-4 ${bgCardHover} rounded-lg border ${borderColor} hover:shadow-sm transition-all`}>
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="bg-almet-sapphire text-white p-2 rounded-lg">
                              <FileText size={16} />
                            </div>
                            <div>
                              <h3 className={`text-lg font-semibold ${textPrimary}`}>{job.job_title}</h3>
                              <p className={`text-sm ${textSecondary}`}>
                                {job.business_function_name} • {job.department_name}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(job.status)}`}>
                              {getStatusIcon(job.status)}
                              {job.status_display?.status || job.status}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedJob(job);
                                setActiveView('view');
                              }}
                              className="p-2 text-almet-sapphire hover:bg-almet-sapphire/10 rounded transition-colors"
                              title="View"
                            >
                              <Eye size={16} />
                            </button>
                            {job.status === 'DRAFT' && (
                              <button
                                onClick={() => {
                                  setCreatedJobId(job.id);
                                  setShowSubmissionModal(true);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                                title="Submit for Approval"
                              >
                                <CheckSquare size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => handleEdit(job)}
                              disabled={actionLoading}
                              className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors disabled:opacity-50"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(job.id)}
                              disabled={actionLoading}
                              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors disabled:opacity-50"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className={`font-medium ${textMuted}`}>Employee: </span>
                            <span className={textPrimary}>{job.employee_info?.name || 'Unassigned'}</span>
                          </div>
                          <div>
                            <span className={`font-medium ${textMuted}`}>Reports to: </span>
                            <span className={textPrimary}>{job.manager_info?.name || 'N/A'}</span>
                          </div>
                          <div>
                            <span className={`font-medium ${textMuted}`}>Version: </span>
                            <span className={textPrimary}>{job.version}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {filteredJobs.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className={`mx-auto h-12 w-12 ${textMuted} mb-4`} />
                      <h3 className={`text-lg font-medium ${textPrimary} mb-2`}>No Job Descriptions Found</h3>
                      <p className={textMuted}>
                        {searchTerm || selectedDepartment ? 'Try adjusting your search criteria' : 'Create your first job description to get started'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Create/Edit Form */
            <div className={`${bgCard} rounded-lg border ${borderColor} shadow-sm`}>
              <div className="p-6">
                <div className="mb-6">
                  <h2 className={`text-2xl font-bold ${textPrimary} mb-2`}>
                    {editingJob ? 'Edit Job Description' : 'Create New Job Description'}
                  </h2>
                  <p className={`${textSecondary}`}>
                    Please ensure all information is filled out accurately
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Job Title <span className="text-red-500">*</span>
                      </label>
                      <SearchableSelect
                        options={dropdownData.jobTitles || []}
                        value={formData.job_title}
                        onChange={(value) => setFormData({...formData, job_title: value})}
                        placeholder="Select or type job title"
                        allowCustom={true}
                      />
                      <p className={`text-xs ${textMuted} mt-1`}>
                        {(dropdownData.jobTitles || []).length} unique job titles from existing employees
                      </p>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Business Function <span className="text-red-500">*</span>
                      </label>
                      <SearchableSelect
                        options={dropdownData.businessFunctions}
                        value={formData.business_function}
                        onChange={(value) => setFormData({...formData, business_function: value})}
                        placeholder="Select Business Function"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Department <span className="text-red-500">*</span>
                      </label>
                      <SearchableSelect
                        options={dropdownData.departments}
                        value={formData.department}
                        onChange={(value) => setFormData({...formData, department: value})}
                        placeholder="Select Department"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Unit
                      </label>
                      <SearchableSelect
                        options={dropdownData.units}
                        value={formData.unit}
                        onChange={(value) => setFormData({...formData, unit: value})}
                        placeholder="Select Unit"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Position Group <span className="text-red-500">*</span>
                      </label>
                      <SearchableSelect
                        options={dropdownData.positionGroups}
                        value={formData.position_group}
                        onChange={(value) => {
                          setFormData({...formData, position_group: value, grading_level: ''}); // Clear grading level when position group changes
                          setSelectedPositionGroup(value);
                        }}
                        placeholder="Select Position Group"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Grading Level
                      </label>
                      <SearchableSelect
                        options={(dropdownData.gradingLevels || []).map(level => ({
                          id: level.code,
                          name: `${level.display} - ${level.full_name}`,
                          display_name: `${level.display} - ${level.full_name}`
                        }))}
                        value={formData.grading_level}
                        onChange={(value) => setFormData({...formData, grading_level: value})}
                        placeholder={selectedPositionGroup ? "Select Grading Level" : "Select Position Group First"}
                        disabled={!selectedPositionGroup}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Reports To
                      </label>
                      <SearchableSelect
                        options={dropdownData.employees}
                        value={formData.reports_to}
                        onChange={(value) => setFormData({...formData, reports_to: value})}
                        placeholder="Select Manager"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Assigned Employee
                      </label>
                      <SearchableSelect
                        options={dropdownData.employees}
                        value={formData.assigned_employee}
                        onChange={(value) => setFormData({...formData, assigned_employee: value})}
                        placeholder="Select Employee"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Manual Employee Name
                      </label>
                      <input
                        type="text"
                        value={formData.manual_employee_name}
                        onChange={(e) => setFormData({...formData, manual_employee_name: e.target.value})}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                        placeholder="Enter employee name manually"
                      />
                    </div>

                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Manual Employee Phone
                      </label>
                      <input
                        type="text"
                        value={formData.manual_employee_phone}
                        onChange={(e) => setFormData({...formData, manual_employee_phone: e.target.value})}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                        placeholder="Enter employee phone manually"
                      />
                    </div>
                  </div>

                  {/* Job Purpose */}
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                      Job Purpose <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.job_purpose}
                      onChange={(e) => setFormData({...formData, job_purpose: e.target.value})}
                      rows="3"
                      className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                      placeholder="Describe the main purpose of this job..."
                    />
                  </div>

                  {/* Dynamic Sections */}
                  {[
                    { fieldName: 'criticalDuties', title: 'Critical Duties', required: true },
                    { fieldName: 'positionMainKpis', title: 'Position Main KPIs', required: true },
                    { fieldName: 'jobDuties', title: 'Job Duties', required: true },
                    { fieldName: 'requirements', title: 'Requirements', required: true }
                  ].map(({ fieldName, title, required }) => (
                    <div key={fieldName}>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        {title} {required && <span className="text-red-500">*</span>}
                      </label>
                      {formData[fieldName].map((item, index) => (
                        <div key={index} className="flex items-start gap-2 mb-2">
                          <textarea
                            value={item}
                            onChange={(e) => handleArrayFieldChange(fieldName, index, e.target.value)}
                            className={`flex-1 px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                            rows="2"
                            placeholder={`Enter ${title.toLowerCase()}...`}
                            required={required && index === 0}
                          />
                          {formData[fieldName].length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeArrayItem(fieldName, index)}
                              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayItem(fieldName)}
                        className="text-almet-sapphire hover:text-almet-astral font-medium text-sm flex items-center gap-1"
                      >
                        <Plus size={16} />
                        Add {title.slice(0, -1)}
                      </button>
                    </div>
                  ))}

                  {/* Enhanced Competency Selection */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <CompetencySelection
                      type="skills"
                      groupOptions={dropdownData.skillGroups}
                      availableItems={availableSkills}
                      selectedGroup={selectedSkillGroup}
                      onGroupChange={setSelectedSkillGroup}
                      selectedItems={formData.required_skills_data}
                      onItemChange={handleMultiSelectChange}
                      groupLabel="Skill Group"
                      itemLabel="Required Skills"
                    />
                    
                    <CompetencySelection
                      type="competencies"
                      groupOptions={dropdownData.behavioralGroups}
                      availableItems={availableCompetencies}
                      selectedGroup={selectedBehavioralGroup}
                      onGroupChange={setSelectedBehavioralGroup}
                      selectedItems={formData.behavioral_competencies_data}
                      onItemChange={handleMultiSelectChange}
                      groupLabel="Behavioral Group"
                      itemLabel="Behavioral Competencies"
                    />
                  </div>

                  {/* Resources and Access */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Business Resources
                      </label>
                      <MultiSelect
                        options={dropdownData.businessResources}
                        selected={formData.business_resources_ids}
                        onChange={handleMultiSelectChange}
                        placeholder="Select resources..."
                        fieldName="business_resources_ids"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Access Rights
                      </label>
                      <MultiSelect
                        options={dropdownData.accessMatrix}
                        selected={formData.access_rights_ids}
                        onChange={handleMultiSelectChange}
                        placeholder="Select access rights..."
                        fieldName="access_rights_ids"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Company Benefits
                      </label>
                      <MultiSelect
                        options={dropdownData.companyBenefits}
                        selected={formData.company_benefits_ids}
                        onChange={handleMultiSelectChange}
                        placeholder="Select benefits..."
                        fieldName="company_benefits_ids"
                      />
                    </div>
                  </div>

                  {/* Notes */}
                  <div className={`p-4 ${bgAccent} rounded-lg`}>
                    <div className="flex items-start gap-2">
                      <AlertCircle size={16} className="text-almet-sapphire mt-1 flex-shrink-0" />
                      <div>
                        <h4 className={`font-medium ${textPrimary} mb-1`}>Job Description Workflow:</h4>
                        <div className={`text-sm ${textSecondary} space-y-2`}>
                          <p>
                            <strong>Step 1:</strong> Create job description (saved as DRAFT)
                          </p>
                          <p>
                            <strong>Step 2:</strong> Submit for approval workflow (optional)
                          </p>
                          <p>
                            <strong>Step 3:</strong> Line Manager approval → Employee approval → ACTIVE
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400">
                            💡 You can keep job descriptions as drafts and submit them for approval later.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-almet-comet">
                    <button
                      type="button"
                      onClick={resetForm}
                      disabled={actionLoading}
                      className={`px-4 py-2 ${textSecondary} hover:${textPrimary} transition-colors disabled:opacity-50`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={actionLoading}
                      className="px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {actionLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                      <Save size={16} />
                      {editingJob ? 'Update Job Description' : 'Save as Draft'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Job View Modal */}
          {selectedJob && activeView === 'view' && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className={`${bgCard} rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto border ${borderColor}`}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className={`text-2xl font-bold ${textPrimary}`}>Job Description Details</h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          // Download functionality would go here
                          alert('Download functionality would be implemented here');
                        }}
                        className="flex items-center gap-2 px-3 py-1 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-sm"
                      >
                        <Download size={14} />
                        Download
                      </button>
                      <button
                        onClick={() => {
                          setSelectedJob(null);
                          setActiveView('list');
                        }}
                        className={`p-2 ${textMuted} hover:${textPrimary} transition-colors`}
                      >
                        <X size={24} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Header Information */}
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-4 ${bgAccent} rounded-lg`}>
                      <div>
                        <h3 className={`text-xl font-semibold ${textPrimary} mb-2`}>{selectedJob.job_title}</h3>
                        <p className={`${textSecondary}`}>
                          {selectedJob.business_function_name} • {selectedJob.department_name}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className={`font-medium ${textMuted}`}>Status:</span>
                          <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedJob.status)}`}>
                            {selectedJob.status_display?.status || selectedJob.status}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`font-medium ${textMuted}`}>Version:</span>
                          <span className={textPrimary}>{selectedJob.version}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`font-medium ${textMuted}`}>Employee:</span>
                          <span className={textPrimary}>{selectedJob.employee_info?.name || 'Unassigned'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Job Purpose */}
                    <div>
                      <h4 className={`text-lg font-semibold ${textPrimary} mb-3`}>Job Purpose</h4>
                      <p className={`${textSecondary} leading-relaxed`}>{selectedJob.job_purpose}</p>
                    </div>

                    {/* Sections would be displayed here - this would need the full job data */}
                    <div className={`text-center py-8 ${textMuted}`}>
                      <p className="text-sm">Full job description details would be displayed here...</p>
                      <p className="text-xs mt-2">This requires fetching the complete job description data.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Submission Modal */}
          {showSubmissionModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className={`${bgCard} rounded-lg w-full max-w-md border ${borderColor}`}>
                <div className="p-6">
                  <h3 className={`text-lg font-bold ${textPrimary} mb-4`}>
                    Job Description Created Successfully!
                  </h3>
                  
                  <p className={`text-sm ${textSecondary} mb-4`}>
                    Your job description has been saved as a draft. Would you like to submit it for approval workflow now?
                  </p>

                  <div className="mb-4">
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                      Comments (optional):
                    </label>
                    <textarea
                      value={submissionComments}
                      onChange={(e) => setSubmissionComments(e.target.value)}
                      rows="3"
                      className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                      placeholder="Add any comments for the approval workflow..."
                    />
                  </div>

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={handleKeepAsDraft}
                      disabled={submissionLoading}
                      className={`px-4 py-2 ${textSecondary} hover:${textPrimary} transition-colors disabled:opacity-50`}
                    >
                      Keep as Draft
                    </button>
                    <button
                      onClick={handleSubmitForApproval}
                      disabled={submissionLoading}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      {submissionLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                      Submit for Approval
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobDescriptionPage;