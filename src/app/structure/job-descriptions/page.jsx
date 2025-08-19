'use client'
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Search, 
  FileText, 
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  CheckSquare,
  UserCheck,
  UserX as UserVacant,
  AlertTriangle,
  Settings,
  Send,
  Download,
  Archive,
  ChevronDown,
  X,
  Filter
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTheme } from '@/components/common/ThemeProvider';
import jobDescriptionService from '@/services/jobDescriptionService';
import competencyApi from '@/services/competencyApi';

// Import child components
import JobDescriptionList from '@/components/jobDescription/JobDescriptionList';
import JobDescriptionForm from '@/components/jobDescription/JobDescriptionForm';
import JobViewModal from '@/components/jobDescription/JobViewModal';
import SubmissionModal from '@/components/jobDescription/SubmissionModal';
import BulkExportModal from '@/components/jobDescription/BulkExportModal';
import StatCard from '@/components/jobDescription/StatCard';


const JobDescriptionPage = () => {
  const { darkMode } = useTheme();
  const router = useRouter();
  
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
  const [exportLoading, setExportLoading] = useState(false);
  
  // State for submission workflow
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionComments, setSubmissionComments] = useState('');
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [createdJobId, setCreatedJobId] = useState(null);
  const [isExistingJobSubmission, setIsExistingJobSubmission] = useState(false);

  // State for bulk export
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [showBulkExportModal, setShowBulkExportModal] = useState(false);

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

  // Form state with all fields
  const [formData, setFormData] = useState({
    job_title: '',
    job_purpose: '',
    business_function: '',
    department: '',
    unit: '',
    job_function: '',
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

  // Enhanced competency selection state
  const [selectedSkillGroup, setSelectedSkillGroup] = useState('');
  const [selectedBehavioralGroup, setSelectedBehavioralGroup] = useState('');
  const [availableSkills, setAvailableSkills] = useState([]);
  const [availableCompetencies, setAvailableCompetencies] = useState([]);
  const [selectedPositionGroup, setSelectedPositionGroup] = useState('');

  // Position type state
  const [positionType, setPositionType] = useState('assigned');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [autoManager, setAutoManager] = useState(null);

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

  // Auto-populate manager when employee is selected
  useEffect(() => {
    if (selectedEmployee && positionType === 'assigned') {
      fetchEmployeeManager(selectedEmployee);
    } else {
      setAutoManager(null);
      setFormData(prev => ({ ...prev, reports_to: '' }));
    }
  }, [selectedEmployee, positionType]);

  // Get department-specific units using client-side filtering
  const departmentUnits = useMemo(() => {
    if (!formData.department || !dropdownData.units) {
      return [];
    }
    
    const filteredUnits = dropdownData.units.filter(unit => 
      unit.department === parseInt(formData.department)
    );
    
    return filteredUnits;
  }, [formData.department, dropdownData.units]);

  // Get departments for selected business function
  const businessFunctionDepartments = useMemo(() => {
    if (!formData.business_function || !dropdownData.departments) {
      return dropdownData.departments || [];
    }
    
    const filteredDepartments = dropdownData.departments.filter(dept => 
      dept.business_function === parseInt(formData.business_function)
    );
    
    return filteredDepartments;
  }, [formData.business_function, dropdownData.departments]);

  // Clear department and unit when business function changes
  useEffect(() => {
    if (formData.business_function) {
      if (formData.department) {
        const isValidDepartment = businessFunctionDepartments.some(dept => dept.id === parseInt(formData.department));
        if (!isValidDepartment) {
          setFormData(prev => ({ ...prev, department: '', unit: '' }));
        }
      }
    } else {
      setFormData(prev => ({ ...prev, department: '', unit: '' }));
    }
  }, [formData.business_function, businessFunctionDepartments]);

  // Clear unit when department changes
  useEffect(() => {
    if (formData.department) {
      if (formData.unit) {
        const isValidUnit = departmentUnits.some(unit => unit.id === parseInt(formData.unit));
        if (!isValidUnit) {
          setFormData(prev => ({ ...prev, unit: '' }));
        }
      }
    } else {
      setFormData(prev => ({ ...prev, unit: '' }));
    }
  }, [formData.department, departmentUnits]);

  // Fetch employee manager automatically
  const fetchEmployeeManager = async (employeeId) => {
    try {
      const manager = await jobDescriptionService.getEmployeeManager(employeeId);
      if (manager) {
        setAutoManager(manager);
        setFormData(prev => ({ ...prev, reports_to: manager.id }));
        console.log('✅ Auto-populated manager:', manager);
      } else {
        setAutoManager(null);
        console.log('ℹ️ No manager found for employee');
      }
    } catch (error) {
      console.error('❌ Error fetching employee manager:', error);
      setAutoManager(null);
    }
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
      const response = await jobDescriptionService.getJobDescriptions({ page_size: 1000 });
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
      const fetchOptions = (endpoint) => ({
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

      console.log('📄 Fetching dropdown data...');

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
        fetch(`${baseUrl}/employees/?page_size=1000`, fetchOptions()),
        competencyApi.skillGroups.getAll(),
        competencyApi.behavioralGroups.getAll(),
        jobDescriptionService.getBusinessResources({ page_size: 1000 }),
        jobDescriptionService.getAccessMatrix({ page_size: 1000 }),
        jobDescriptionService.getCompanyBenefits({ page_size: 1000 })
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

      console.log('✅ Dropdown data loaded successfully');
    } catch (error) {
      console.error('❌ Error fetching dropdown data:', error);
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

  // Export Functions
  const handleExportAll = async () => {
  if (!confirm('This will export all job descriptions to a single PDF file. This may take a few minutes for large datasets. Continue?')) {
    return;
  }

  try {
    setExportLoading(true);
    await jobDescriptionService.exportAllJobDescriptionsPDF();
    
    // Show success message
    alert('All job descriptions exported successfully! Check your downloads folder.');
  } catch (error) {
    console.error('Error exporting all job descriptions:', error);
    
    // Show user-friendly error message
    const errorMessage = error.message || 'Error exporting job descriptions. Please try again.';
    alert(errorMessage);
  } finally {
    setExportLoading(false);
  }
};

const handleBulkExport = async () => {
  if (selectedJobs.length === 0) {
    alert('Please select at least one job description to export.');
    return;
  }

  if (selectedJobs.length > 50) {
    if (!confirm(`You have selected ${selectedJobs.length} job descriptions. Large exports may take several minutes. Continue?`)) {
      return;
    }
  }

  try {
    setExportLoading(true);
    await jobDescriptionService.exportBulkJobDescriptionsPDF(selectedJobs);
    
    setShowBulkExportModal(false);
    setSelectedJobs([]);
    
    // Show success message
    alert(`${selectedJobs.length} job descriptions exported successfully! Check your downloads folder.`);
  } catch (error) {
    console.error('Error exporting selected job descriptions:', error);
    
    // Show user-friendly error message
    const errorMessage = error.message || 'Error exporting selected job descriptions. Please try again.';
    alert(errorMessage);
  } finally {
    setExportLoading(false);
  }
};

const handleDownloadSinglePDF = async (jobId) => {
  try {
    setActionLoading(true);
    await jobDescriptionService.downloadJobDescriptionPDF(jobId);
    
    // Optional: Show brief success message
    console.log('✅ PDF downloaded successfully');
  } catch (error) {
    console.error('Error downloading job description PDF:', error);
    
    // Show user-friendly error message
    const errorMessage = error.message || 'Error downloading PDF. Please try again.';
    alert(errorMessage);
  } finally {
    setActionLoading(false);
  }
};

  const toggleJobSelection = (jobId) => {
    setSelectedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const selectAllJobs = () => {
    if (selectedJobs.length === filteredJobs.length) {
      setSelectedJobs([]);
    } else {
      setSelectedJobs(filteredJobs.map(job => job.id));
    }
  };

  // Handle direct submission for approval (for existing draft jobs)
  const handleDirectSubmissionForApproval = async (jobId) => {
    setCreatedJobId(jobId);
    setIsExistingJobSubmission(true);
    setShowSubmissionModal(true);
  };

  // Handle submission for approval
  const handleSubmitForApproval = async () => {
    if (!createdJobId) return;

    try {
      setSubmissionLoading(true);
      
      await jobDescriptionService.submitForApproval(createdJobId, {
        comments: submissionComments,
        submit_to_line_manager: true
      });
      
      alert('Job description submitted for approval successfully!');
      
      await fetchJobDescriptions();
      await fetchStats();
      setShowSubmissionModal(false);
      setSubmissionComments('');
      setCreatedJobId(null);
      setIsExistingJobSubmission(false);
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
    
    await fetchJobDescriptions();
    await fetchStats();
    setShowSubmissionModal(false);
    setSubmissionComments('');
    setCreatedJobId(null);
    setIsExistingJobSubmission(false);
    resetForm();
  };

  // Reset form with new fields
  const resetForm = () => {
    setFormData({
      job_title: '',
      job_purpose: '',
      business_function: '',
      department: '',
      unit: '',
      job_function: '',
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
    setPositionType('assigned');
    setSelectedEmployee('');
    setAutoManager(null);
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
      
      // Set position type based on employee assignment
      if (transformedData.assigned_employee) {
        setPositionType('assigned');
        setSelectedEmployee(transformedData.assigned_employee);
      } else if (transformedData.manual_employee_name) {
        setPositionType('assigned');
      } else {
        setPositionType('vacant');
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

  // Handle view modal
  const handleViewJob = async (job) => {
    try {
      setActionLoading(true);
      const fullJob = await jobDescriptionService.getJobDescription(job.id);
      setSelectedJob(fullJob);
    } catch (error) {
      console.error('Error loading job for view:', error);
      alert('Error loading job description details. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className={`min-h-screen ${bgApp} p-4`}>
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
      <div className={`min-h-screen ${bgApp} transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto p-4 lg:p-6">
          
          {/* Enhanced Header Section */}
          <div className="mb-8">
            {/* Title and Action Buttons */}
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8">
              <div className="flex-1">
                <h1 className={`text-xl lg:text-2xl font-bold ${textPrimary} mb-2`}>
                  Job Descriptions
                </h1>
                <p className={`${textSecondary} text-sm lg:text-base leading-relaxed`}>
                  Create, manage, and track job descriptions across your organization
                </p>
              </div>
              
              {/* Action Buttons Container */}
              <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
                {/* Settings Button */}
                <button
                  onClick={() => router.push('/structure/job-descriptions/JobDescriptionSettings/')}
                  className={`flex items-center justify-center gap-2 px-5 py-3 
                    ${darkMode 
                      ? 'bg-almet-comet hover:bg-almet-san-juan border-almet-san-juan/50 text-almet-bali-hai hover:text-white' 
                      : 'bg-white hover:bg-almet-mystic border-gray-200 text-almet-waterloo hover:text-almet-cloud-burst'
                    } 
                    border rounded-xl transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md`}
                  title="Job Description Settings"
                >
                  <Settings size={16} />
                  <span className="hidden sm:inline">Settings</span>
                </button>
                
                {/* Export Dropdown */}
                <div className="relative group">
                  <button 
                    className={`flex items-center justify-center gap-2 px-5 py-3 
                      ${darkMode 
                        ? 'bg-almet-steel-blue hover:bg-almet-astral text-white' 
                        : 'bg-almet-steel-blue hover:bg-almet-astral text-white'
                      } 
                      rounded-xl transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md 
                      min-w-[120px]`}
                    disabled={exportLoading}
                  >
                    {exportLoading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download size={16} />
                    )}
                    <span className="hidden sm:inline">Export</span>
                    <ChevronDown size={14} className="transition-transform group-hover:rotate-180" />
                  </button>
                  
                  <div className={`absolute right-0 mt-2 w-56 
                    ${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} 
                    rounded-xl shadow-lg border opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                    transition-all duration-200 z-20 overflow-hidden`}>
                    <button
                      onClick={handleExportAll}
                      disabled={exportLoading}
                      className={`w-full px-4 py-3 text-left 
                        ${darkMode 
                          ? 'hover:bg-almet-san-juan text-almet-bali-hai hover:text-white' 
                          : 'hover:bg-almet-mystic text-almet-waterloo hover:text-almet-cloud-burst'
                        } 
                        flex items-center gap-3 text-sm transition-colors duration-150`}
                    >
                      <Download size={14} />
                      Export All Job Descriptions
                    </button>
                    <button
                      onClick={() => setShowBulkExportModal(true)}
                      disabled={exportLoading}
                      className={`w-full px-4 py-3 text-left 
                        ${darkMode 
                          ? 'hover:bg-almet-san-juan text-almet-bali-hai hover:text-white' 
                          : 'hover:bg-almet-mystic text-almet-waterloo hover:text-almet-cloud-burst'
                        } 
                        flex items-center gap-3 text-sm transition-colors duration-150`}
                    >
                      <Archive size={14} />
                      Export Selected Items
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Stats Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
              <StatCard 
                title="Total Jobs" 
                value={stats.total_job_descriptions || 0} 
                subtitle={`${filteredJobs.length} visible`}
                icon={FileText}
                color="almet-sapphire"
                darkMode={darkMode}
              />
              <StatCard 
                title="Pending Approvals" 
                value={stats.pending_approvals?.total || 0} 
                subtitle="Requires attention"
                icon={Clock}
                color="yellow-600"
                darkMode={darkMode}
              />
              <StatCard 
                title="Approved & Active" 
                value={stats.status_breakdown?.Approved || 0} 
                subtitle="Ready to use"
                icon={CheckCircle}
                color="green-600"
                darkMode={darkMode}
              />
              <StatCard 
                title="Draft Status" 
                value={stats.status_breakdown?.Draft || 0} 
                subtitle="In progress"
                icon={Edit}
                color="gray-600"
                darkMode={darkMode}
              />
            </div>

            {/* Simplified Navigation Tabs */}
            <div className={`flex items-center justify-between p-1 
              ${darkMode ? 'bg-almet-comet/50' : 'bg-gray-100'} rounded-lg shadow-inner`}>
              {[
                { 
                  id: 'list', 
                  name: 'Job Descriptions', 
                  icon: FileText, 
                  count: filteredJobs.length 
                },
                { 
                  id: 'create', 
                  name: editingJob ? 'Edit Job' : 'Create New', 
                  icon: editingJob ? Edit : Plus,
                  count: null 
                }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveView(tab.id);
                    if (tab.id === 'list') {
                      setEditingJob(null);
                    }
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-md font-medium 
                    transition-all duration-200 text-sm relative ${
                    activeView === tab.id
                      ? `${bgCard} text-almet-sapphire shadow-md border border-almet-sapphire/20`
                      : `${textSecondary} hover:${textPrimary} hover:${darkMode ? 'bg-almet-san-juan/50' : 'bg-white/50'}`
                  }`}
                >
                  <tab.icon size={16} />
                  <span className="font-semibold">{tab.name}</span>
                  {tab.count !== null && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold min-w-[20px] text-center
                      ${activeView === tab.id 
                        ? 'bg-almet-sapphire text-white' 
                        : darkMode ? 'bg-almet-san-juan text-almet-bali-hai' : 'bg-gray-200 text-gray-600'
                      }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Area with Enhanced Styling */}
          <div className="space-y-6">
            {activeView === 'list' ? (
              <div className="space-y-4">
                <JobDescriptionList
                  filteredJobs={filteredJobs}
                  selectedJobs={selectedJobs}
                  searchTerm={searchTerm}
                  selectedDepartment={selectedDepartment}
                  dropdownData={dropdownData}
                  onSearchChange={setSearchTerm}
                  onDepartmentChange={setSelectedDepartment}
                  onJobSelect={handleViewJob}
                  onJobView={() => setActiveView('view')}
                  onJobEdit={handleEdit}
                  onJobDelete={handleDelete}
                  onDirectSubmission={handleDirectSubmissionForApproval}
                  onToggleSelection={toggleJobSelection}
                  onSelectAll={selectAllJobs}
                  onBulkExport={() => setShowBulkExportModal(true)}
                  onDownloadPDF={handleDownloadSinglePDF}
                  actionLoading={actionLoading}
                  darkMode={darkMode}
                />
              </div>
            ) : (
              <div className="space-y-4">
                <JobDescriptionForm
                  formData={formData}
                  editingJob={editingJob}
                  dropdownData={dropdownData}
                  positionType={positionType}
                  selectedEmployee={selectedEmployee}
                  autoManager={autoManager}
                  selectedSkillGroup={selectedSkillGroup}
                  selectedBehavioralGroup={selectedBehavioralGroup}
                  availableSkills={availableSkills}
                  availableCompetencies={availableCompetencies}
                  selectedPositionGroup={selectedPositionGroup}
                  businessFunctionDepartments={businessFunctionDepartments}
                  departmentUnits={departmentUnits}
                  actionLoading={actionLoading}
                  onFormDataChange={setFormData}
                  onPositionTypeChange={setPositionType}
                  onEmployeeSelect={setSelectedEmployee}
                  onSkillGroupChange={setSelectedSkillGroup}
                  onBehavioralGroupChange={setSelectedBehavioralGroup}
                  onPositionGroupChange={setSelectedPositionGroup}
                  onSubmit={(createdJob) => {
                    setCreatedJobId(createdJob.id);
                    setIsExistingJobSubmission(false);
                    setShowSubmissionModal(true);
                  }}
                  onCancel={resetForm}
                  onUpdate={() => {
                    fetchJobDescriptions();
                    fetchStats();
                    resetForm();
                  }}
                  darkMode={darkMode}
                />
              </div>
            )}
          </div>

          {/* Job View Modal */}
          {selectedJob && (
            <JobViewModal
              job={selectedJob}
              onClose={() => setSelectedJob(null)}
              onDownloadPDF={() => handleDownloadSinglePDF(selectedJob.id)}
              darkMode={darkMode}
            />
          )}

          {/* Bulk Export Modal */}
          {showBulkExportModal && (
            <BulkExportModal
              selectedJobs={selectedJobs}
              onExport={handleBulkExport}
              onClose={() => setShowBulkExportModal(false)}
              exportLoading={exportLoading}
              darkMode={darkMode}
            />
          )}

          {/* Enhanced Submission Modal */}
          {showSubmissionModal && (
            <SubmissionModal
              createdJobId={createdJobId}
              isExistingJobSubmission={isExistingJobSubmission}
              submissionComments={submissionComments}
              submissionLoading={submissionLoading}
              onCommentsChange={setSubmissionComments}
              onSubmitForApproval={handleSubmitForApproval}
              onKeepAsDraft={handleKeepAsDraft}
              onClose={() => {
                setShowSubmissionModal(false);
                setSubmissionComments('');
                setCreatedJobId(null);
                setIsExistingJobSubmission(false);
              }}
              darkMode={darkMode}
            />
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobDescriptionPage;