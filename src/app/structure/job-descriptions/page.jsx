// pages/structure/job-descriptions/page.jsx - COMPLETE WITH LEADERSHIP SUPPORT
'use client'
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Edit, Eye, Trash2, FileText, Clock,
  CheckCircle, Settings, Send, X, Users, AlertCircle, FileSpreadsheet
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTheme } from '@/components/common/ThemeProvider';
import { ToastProvider, useToast } from '@/components/common/Toast';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import Pagination from '@/components/common/Pagination';

import jobDescriptionService from '@/services/jobDescriptionService';
import competencyApi from '@/services/competencyApi';

// Import child components
import JobDescriptionList from '@/components/jobDescription/JobDescriptionList';
import JobDescriptionForm from '@/components/jobDescription/JobDescriptionForm';
import JobViewModal from '@/components/jobDescription/JobViewModal';
import SubmissionModal from '@/components/jobDescription/SubmissionModal';

import StatCard from '@/components/jobDescription/StatCard';

const JobDescriptionPageContent = () => {
  const { darkMode } = useTheme();
  const router = useRouter();
  const { showSuccess, showError, showWarning, showInfo } = useToast();
  
  const bgApp = darkMode ? "bg-gray-900" : "bg-almet-mystic";
  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";

  // State management
  const [activeView, setActiveView] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  

  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionComments, setSubmissionComments] = useState('');
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [createdJobsData, setCreatedJobsData] = useState(null);
  const [isExistingJobSubmission, setIsExistingJobSubmission] = useState(false);
  
  const [selectedSkillGroup, setSelectedSkillGroup] = useState('');
  const [selectedBehavioralGroup, setSelectedBehavioralGroup] = useState('');
  const [availableSkills, setAvailableSkills] = useState([]);
  const [availableCompetencies, setAvailableCompetencies] = useState([]);
  
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    type: 'default',
    title: '',
    message: '',
    onConfirm: null,
    loading: false
  });

  const [jobDescriptions, setJobDescriptions] = useState([]);
  const [stats, setStats] = useState({});
  
  // 🔥 Enhanced dropdown data with leadership groups
  const [dropdownData, setDropdownData] = useState({
    employees: [],
    employeeMap: new Map(),
    skillGroups: [],
    behavioralGroups: [],
    leadershipMainGroups: [], // 🔥 NEW
    businessResources: [],
    accessMatrix: [],
    companyBenefits: []
  });

  // 🔥 Enhanced form state with leadership competencies
  const [formData, setFormData] = useState({
    job_title: '',
    job_purpose: '',
    business_function: '',
    department: '',
    unit: '',
    job_function: '',
    position_group: '',
    grading_level: '',
    grading_levels: [],
    criticalDuties: [''],
    positionMainKpis: [''],
    jobDuties: [''],
    requirements: [''],
    required_skills_data: [],
    behavioral_competencies_data: [],
    leadership_competencies_data: [], // 🔥 NEW
    business_resources_ids: [],
    access_rights_ids: [],
    company_benefits_ids: []
  });

  const [selectedPositionGroup, setSelectedPositionGroup] = useState('');
  const [matchingEmployees, setMatchingEmployees] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedSkillGroup) {
      fetchSkillsForGroup(selectedSkillGroup);
    } else {
      setAvailableSkills([]);
    }
  }, [selectedSkillGroup]);

  useEffect(() => {
    if (selectedBehavioralGroup) {
      fetchCompetenciesForGroup(selectedBehavioralGroup);
    } else {
      setAvailableCompetencies([]);
    }
  }, [selectedBehavioralGroup]);

  useEffect(() => {
    filterMatchingEmployees();
  }, [
    formData.business_function,
    formData.department,
    formData.unit,
    formData.job_function,
    formData.position_group,
    formData.grading_level,
    formData.job_title,
    dropdownData.employees
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDepartment]);

  const filterMatchingEmployees = () => {
    if (!dropdownData.employees || dropdownData.employees.length === 0) {
      setMatchingEmployees([]);
      return;
    }

    const hasBasicCriteria = formData.business_function && formData.department && 
                           formData.job_function && formData.position_group;
    
    if (!hasBasicCriteria) {
      setMatchingEmployees([]);
      return;
    }

    let filtered = dropdownData.employees.filter(employee => {
      if (formData.business_function && 
          employee.business_function_name !== formData.business_function) {
        return false;
      }

      if (formData.department && 
          employee.department_name !== formData.department) {
        return false;
      }

      if (formData.unit && 
          employee.unit_name !== formData.unit) {
        return false;
      }

      if (formData.job_function && employee.job_function_name && 
          employee.job_function_name !== formData.job_function) {
        return false;
      }

      if (formData.position_group && employee.position_group_name && 
          employee.position_group_name !== formData.position_group) {
        return false;
      }

      if (formData.grading_levels && Array.isArray(formData.grading_levels) && formData.grading_levels.length > 0) {
        if (!employee.grading_level || !formData.grading_levels.includes(employee.grading_level)) {
          return false;
        }
      } else if (formData.grading_level && employee.grading_level) {
        if (employee.grading_level !== formData.grading_level) {
          return false;
        }
      }

      if (formData.job_title && employee.job_title && 
          !employee.job_title.toLowerCase().includes(formData.job_title.toLowerCase())) {
        return false;
      }

      return true;
    });

    setMatchingEmployees(filtered);
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
      showError('Error loading initial data');
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
      const statsData = await jobDescriptionService.getJobDescriptionStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // 🔥 UPDATED: Fetch dropdown data with leadership groups
  const fetchDropdownData = async () => {
    try {
      const fetchOptions = (endpoint) => ({
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });

      const baseUrl = process.env.NEXT_PUBLIC_API_URL;

      const [
        employeesRes,
        skillGroupsRes,
        behavioralGroupsRes,
        leadershipMainGroupsRes, // 🔥 NEW
        businessResourcesRes,
        accessMatrixRes,
        companyBenefitsRes
      ] = await Promise.all([
        fetch(`${baseUrl}/employees/?page_size=1000`, fetchOptions()),
        competencyApi.skillGroups.getAll(),
        competencyApi.behavioralGroups.getAll(),
        competencyApi.leadershipMainGroups.getAll(), // 🔥 NEW
        jobDescriptionService.getBusinessResources({ page_size: 1000 }),
        jobDescriptionService.getAccessMatrix({ page_size: 1000 }),
        jobDescriptionService.getCompanyBenefits({ page_size: 1000 })
      ]);

      const employees = employeesRes.ok ? await employeesRes.json() : { results: [] };
      const employeeList = employees.results || [];

      const employeeMap = new Map();
      employeeList.forEach(emp => {
        if (emp.business_function_name) {
          employeeMap.set(`bf_${emp.business_function_name}`, emp);
        }
        if (emp.department_name) {
          employeeMap.set(`dept_${emp.department_name}`, emp);
        }
        if (emp.job_function_name) {
          employeeMap.set(`jf_${emp.job_function_name}`, emp);
        }
        if (emp.position_group_name) {
          employeeMap.set(`pg_${emp.position_group_name}`, emp);
        }
      });

      console.log('📚 Dropdown Data Loaded:', {
        employees: employeeList.length,
        skillGroups: skillGroupsRes.results?.length || 0,
        behavioralGroups: behavioralGroupsRes.results?.length || 0,
        leadershipMainGroups: leadershipMainGroupsRes.results?.length || 0, // 🔥 NEW
        businessResources: businessResourcesRes.results?.length || 0,
        accessMatrix: accessMatrixRes.results?.length || 0,
        companyBenefits: companyBenefitsRes.results?.length || 0
      });

      setDropdownData({
        employees: employeeList,
        employeeMap: employeeMap,
        skillGroups: skillGroupsRes.results || [],
        behavioralGroups: behavioralGroupsRes.results || [],
        leadershipMainGroups: leadershipMainGroupsRes.results || [], // 🔥 NEW
        businessResources: businessResourcesRes.results || [],
        accessMatrix: accessMatrixRes.results || [],
        companyBenefits: companyBenefitsRes.results || []
      });

    } catch (error) {
      console.error('Error fetching dropdown data:', error);
      showError('Error loading employee data');
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

  const paginatedJobs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredJobs.slice(startIndex, endIndex);
  }, [filteredJobs, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredJobs.length / itemsPerPage);

  const handleDownloadSinglePDF = async (jobId) => {
    try {
      setActionLoading(true);
      await jobDescriptionService.downloadJobDescriptionPDF(jobId);
      showSuccess('PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading job description PDF:', error);
      showError('Error downloading PDF. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDirectSubmissionForApproval = async (jobId) => {
    setCreatedJobsData({ id: jobId, isExisting: true });
    setIsExistingJobSubmission(true);
    setShowSubmissionModal(true);
  };

 

  const handleSubmitForApproval = async () => {
    if (!createdJobsData) return;

    try {
      setSubmissionLoading(true);
      
      if (createdJobsData.isExisting) {
        await jobDescriptionService.submitForApproval(createdJobsData.id, {
          comments: submissionComments,
          submit_to_line_manager: true
        });
        
        showSuccess('Job description submitted for approval successfully!');
      } else {
        const jobsToSubmit = createdJobsData.created_job_descriptions || [{ id: createdJobsData.id }];
        
        for (const job of jobsToSubmit) {
          await jobDescriptionService.submitForApproval(job.id, {
            comments: submissionComments,
            submit_to_line_manager: true
          });
        }
        
        const message = jobsToSubmit.length > 1 
          ? `${jobsToSubmit.length} job descriptions submitted for approval successfully!`
          : 'Job description submitted for approval successfully!';
        
        showSuccess(message);
      }
      
      await fetchJobDescriptions();
      await fetchStats();
      setShowSubmissionModal(false);
      setSubmissionComments('');
      setCreatedJobsData(null);
      setIsExistingJobSubmission(false);
      resetForm();
      
      setActiveView('list');
    } catch (error) {
      console.error('Error submitting for approval:', error);
      showError('Error submitting for approval. Please try again.');
    } finally {
      setSubmissionLoading(false);
    }
  };

  const handleKeepAsDraft = async () => {
    const message = createdJobsData?.summary?.total_job_descriptions_created > 1 
      ? `${createdJobsData.summary.total_job_descriptions_created} job descriptions saved as drafts successfully!`
      : 'Job description saved as draft successfully!';
    
    showSuccess(message);
    
    await fetchJobDescriptions();
    await fetchStats();

    setShowSubmissionModal(false);
    setSubmissionComments('');
    setCreatedJobsData(null);
    setIsExistingJobSubmission(false);
    resetForm();
    
    setActiveView('list');
  };

  const handleTabNavigation = (targetView) => {
    if (targetView === 'create') {
      if (activeView === 'list' || editingJob) {
        resetForm();
      }
      setActiveView('create');
    } else if (targetView === 'list') {
      const hasFormData = formData.job_title?.trim() || 
                         formData.job_purpose?.trim() || 
                         formData.criticalDuties?.some(d => d?.trim()) ||
                         formData.required_skills_data?.length > 0;
      
      if (hasFormData && !editingJob) {
        setConfirmModal({
          isOpen: true,
          type: 'warning',
          title: 'Unsaved Changes',
          message: 'You have unsaved changes. Are you sure you want to leave? All changes will be lost.',
          onConfirm: () => {
            setConfirmModal({ ...confirmModal, isOpen: false });
            resetForm();
            setActiveView('list');
          }
        });
        return;
      }
      
      resetForm();
      setActiveView('list');
    }
  };

  // 🔥 UPDATED: handleEdit with Leadership competencies support
  const handleEdit = async (job) => {
    try {
      setActionLoading(true);
      
      console.log('\n' + '='.repeat(80));
      console.log('🚀 STARTING EDIT PROCESS');
      console.log('='.repeat(80));
      console.log('Job ID:', job.id);
      console.log('Job Title:', job.job_title);
      
      const fullJob = await jobDescriptionService.getJobDescription(job.id);
      
      console.log('\n📋 FULL JOB DATA RECEIVED');
      
      // Extract sections
      const criticalDuties = [];
      const positionMainKpis = [];
      const jobDuties = [];
      const requirements = [];
      
      if (fullJob.sections && Array.isArray(fullJob.sections)) {
        fullJob.sections.forEach(section => {
          const content = section.content || '';
          const lines = content.split('\n')
            .map(line => line.replace(/^\d+\.\s*/, '').trim())
            .filter(line => line);
          
          switch(section.section_type) {
            case 'CRITICAL_DUTIES':
              criticalDuties.push(...lines);
              break;
            case 'MAIN_KPIS':
              positionMainKpis.push(...lines);
              break;
            case 'JOB_DUTIES':
              jobDuties.push(...lines);
              break;
            case 'REQUIREMENTS':
              requirements.push(...lines);
              break;
          }
        });
      }
      
      // Extract resource IDs
      const extractAllIds = (resourceArray, parentFieldName) => {
        const allIds = new Set();
        if (!Array.isArray(resourceArray)) return [];
        
        resourceArray.forEach(item => {
          const parentId = item[parentFieldName] || item.resource || item.access_matrix || item.benefit;
          if (parentId) allIds.add(String(parentId));
          
          if (item.specific_items_detail && Array.isArray(item.specific_items_detail)) {
            item.specific_items_detail.forEach(childItem => {
              if (childItem.id) allIds.add(String(childItem.id));
            });
          }
        });
        
        return Array.from(allIds);
      };
      
      const businessResourceIds = extractAllIds(fullJob.business_resources, 'resource');
      const accessRightIds = extractAllIds(fullJob.access_rights, 'access_matrix');
      const companyBenefitIds = extractAllIds(fullJob.company_benefits, 'benefit');
      
      // 🔥 Extract Skills IDs
      const skillIds = [];
      if (fullJob.required_skills && Array.isArray(fullJob.required_skills)) {
        fullJob.required_skills.forEach(skill => {
          if (skill.skill_id) {
            skillIds.push(String(skill.skill_id));
          } else if (skill.skill) {
            skillIds.push(String(skill.skill));
          }
        });
      }
      
      console.log('🎯 Extracted Skill IDs:', skillIds);
      
      // 🔥 NEW: Extract Behavioral Competencies IDs
      const behavioralCompetencyIds = [];
      if (fullJob.behavioral_competencies && Array.isArray(fullJob.behavioral_competencies)) {
        fullJob.behavioral_competencies.forEach(comp => {
          if (comp.competency_id) {
            behavioralCompetencyIds.push(String(comp.competency_id));
          } else if (comp.competency) {
            behavioralCompetencyIds.push(String(comp.competency));
          }
        });
      }
      
      console.log('🎯 Extracted Behavioral Competency IDs:', behavioralCompetencyIds);
      
      // 🔥 NEW: Extract Leadership Competencies IDs (from leadership_items)
      const leadershipCompetencyIds = [];
      if (fullJob.leadership_competencies && Array.isArray(fullJob.leadership_competencies)) {
        fullJob.leadership_competencies.forEach(item => {
          // Leadership competencies point to leadership_items
          if (item.leadership_item_id) {
            leadershipCompetencyIds.push(String(item.leadership_item_id));
          } else if (item.leadership_item) {
            leadershipCompetencyIds.push(String(item.leadership_item));
          } else if (item.id) {
            leadershipCompetencyIds.push(String(item.id));
          }
        });
      }
      
      console.log('🎯 Extracted Leadership Competency IDs:', leadershipCompetencyIds);
      
      // Handle grading levels
      let gradingLevels = [];
      if (fullJob.grading_levels && Array.isArray(fullJob.grading_levels)) {
        gradingLevels = fullJob.grading_levels;
        console.log('📊 Using grading_levels array:', gradingLevels);
      } else if (fullJob.grading_level) {
        gradingLevels = [fullJob.grading_level];
        console.log('📊 Converting single grading_level to array:', gradingLevels);
      }
      
      // 🔥 Build form data
      const transformedData = {
        job_title: fullJob.job_title || '',
        job_purpose: fullJob.job_purpose || '',
        business_function: fullJob.business_function?.name || '',
        department: fullJob.department?.name || '',
        unit: fullJob.unit?.name || '',
        job_function: fullJob.job_function?.name || '',
        position_group: fullJob.position_group?.name || '',
        grading_level: fullJob.grading_level || '',
        grading_levels: gradingLevels,
        
        criticalDuties: criticalDuties.length > 0 ? criticalDuties : [''],
        positionMainKpis: positionMainKpis.length > 0 ? positionMainKpis : [''],
        jobDuties: jobDuties.length > 0 ? jobDuties : [''],
        requirements: requirements.length > 0 ? requirements : [''],
        
        required_skills_data: skillIds,
        behavioral_competencies_data: behavioralCompetencyIds, // 🔥 Behavioral
        leadership_competencies_data: leadershipCompetencyIds, // 🔥 Leadership
        
        business_resources_ids: businessResourceIds,
        access_rights_ids: accessRightIds,
        company_benefits_ids: companyBenefitIds
      };
      
      console.log('\n✅ TRANSFORMED DATA:');
      console.log('- Behavioral Competencies:', transformedData.behavioral_competencies_data.length);
      console.log('- Leadership Competencies:', transformedData.leadership_competencies_data.length);
      console.log('='.repeat(80) + '\n');
      
      setFormData(transformedData);
      setEditingJob(fullJob);
      
      if (transformedData.position_group) {
        setSelectedPositionGroup(transformedData.position_group);
      }
      
      setActiveView('create');
      
    } catch (error) {
      console.error('❌ Error loading job for edit:', error);
      showError('Error loading job description. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // 🔥 UPDATED: resetForm with leadership_competencies_data
  const resetForm = () => {
    console.log('🔄 Resetting form to initial state');
    
    setFormData({
      job_title: '',
      job_purpose: '',
      business_function: '',
      department: '',
      unit: '',
      job_function: '',
      position_group: '',
      grading_level: '',
      grading_levels: [],
      criticalDuties: [''],
      positionMainKpis: [''],
      jobDuties: [''],
      requirements: [''],
      required_skills_data: [],
      behavioral_competencies_data: [],
      leadership_competencies_data: [], // 🔥 Reset leadership
      business_resources_ids: [],
      access_rights_ids: [],
      company_benefits_ids: []
    });
    
    setEditingJob(null);
    setSelectedSkillGroup('');
    setSelectedBehavioralGroup('');
    setSelectedPositionGroup('');
    setAvailableSkills([]);
    setAvailableCompetencies([]);
    setMatchingEmployees([]);
  };

  const handleDelete = async (id) => {
    setConfirmModal({
      isOpen: true,
      type: 'danger',
      title: 'Delete Job Description',
      message: 'Are you sure you want to delete this job description? This action cannot be undone.',
      onConfirm: async () => {
        try {
          setConfirmModal({ ...confirmModal, loading: true });
          
          await jobDescriptionService.deleteJobDescription(id);
          await fetchJobDescriptions();
          await fetchStats();
          
          setConfirmModal({ ...confirmModal, isOpen: false, loading: false });
          showSuccess('Job description deleted successfully!');
        } catch (error) {
          console.error('Error deleting job description:', error);
          setConfirmModal({ ...confirmModal, loading: false });
          showError('Error deleting job description. Please try again.');
        }
      }
    });
  };

  const handleViewJob = async (job) => {
    try {
      setActionLoading(true);
      const fullJob = await jobDescriptionService.getJobDescription(job.id);
      setSelectedJob(fullJob);
    } catch (error) {
      console.error('Error loading job for view:', error);
      showError('Error loading job description details. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleJobSubmit = (createdJob) => {
    setCreatedJobsData(createdJob);
    setIsExistingJobSubmission(false);
    setShowSubmissionModal(true);
  };

  const closeConfirmModal = () => {
    if (!confirmModal.loading) {
      setConfirmModal({ ...confirmModal, isOpen: false });
    }
  };

  return (
    <DashboardLayout>
      <div className={`min-h-screen ${bgApp} transition-colors duration-300`}>
        <div className=" mx-auto p-4 lg:p-6">
          
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8">
              <div className="flex-1">
                <h1 className={`text-xl lg:text-2xl font-bold ${textPrimary} mb-2`}>
                  Job Descriptions
                </h1>
                <p className={`${textSecondary} text-xs lg:text-base leading-relaxed`}>
                  Create job descriptions based on your organizational structure and employee data
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 min-w-fit">
                

                <button
                  onClick={() => router.push('/structure/job-descriptions/JobDescriptionSettings/')}
                  className={`flex items-center justify-center gap-2 px-5 py-3 
                    ${darkMode 
                      ? 'bg-almet-comet hover:bg-almet-san-juan border-almet-san-juan/50 text-almet-bali-hai hover:text-white' 
                      : 'bg-white hover:bg-almet-mystic border-gray-200 text-almet-waterloo hover:text-almet-cloud-burst'
                    } 
                    border rounded-xl transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md`}
                >
                  <Settings size={16} />
                  <span className="hidden sm:inline">Settings</span>
                </button>
              </div>
            </div>

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
                  onClick={() => handleTabNavigation(tab.id)}
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

          {/* Main Content Area */}
          <div className="space-y-6">
            {activeView === 'list' ? (
              <div className="space-y-4">
                <JobDescriptionList
                  filteredJobs={paginatedJobs} 
                  searchTerm={searchTerm}
                  selectedDepartment={selectedDepartment}
                  dropdownData={dropdownData}
                  onSearchChange={setSearchTerm}
                  onDepartmentChange={setSelectedDepartment}
                  onJobSelect={handleViewJob}
                  onJobEdit={handleEdit}
                  onJobDelete={handleDelete}
                  onDirectSubmission={handleDirectSubmissionForApproval}
                  onDownloadPDF={handleDownloadSinglePDF}
                  actionLoading={actionLoading}
                  darkMode={darkMode}
                />
                
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredJobs.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={(page) => setCurrentPage(page)}
                    darkMode={darkMode}
                  />
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <JobDescriptionForm
                  formData={formData}
                  editingJob={editingJob}
                  dropdownData={dropdownData}
                  selectedSkillGroup={selectedSkillGroup}
                  selectedBehavioralGroup={selectedBehavioralGroup}
                  availableSkills={availableSkills}
                  availableCompetencies={availableCompetencies}
                  selectedPositionGroup={selectedPositionGroup}
                  matchingEmployees={matchingEmployees}
                  actionLoading={actionLoading}
                  onFormDataChange={setFormData}
                  onSkillGroupChange={setSelectedSkillGroup}
                  onBehavioralGroupChange={setSelectedBehavioralGroup}
                  onPositionGroupChange={setSelectedPositionGroup}
                  onSubmit={handleJobSubmit}
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

          {/* Submission Modal */}
          {showSubmissionModal && (
            <SubmissionModal
              createdJobsData={createdJobsData}
              isExistingJobSubmission={isExistingJobSubmission}
              submissionComments={submissionComments}
              submissionLoading={submissionLoading}
              onCommentsChange={setSubmissionComments}
              onSubmitForApproval={handleSubmitForApproval}
              onKeepAsDraft={handleKeepAsDraft}
              onClose={() => {
                setShowSubmissionModal(false);
                setSubmissionComments('');
                setCreatedJobsData(null);
                setIsExistingJobSubmission(false);
              }}
              darkMode={darkMode}
            />
          )}

        

          {/* Confirmation Modal */}
          <ConfirmationModal
            isOpen={confirmModal.isOpen}
            onClose={closeConfirmModal}
            onConfirm={confirmModal.onConfirm}
            title={confirmModal.title}
            message={confirmModal.message}
            type={confirmModal.type}
            loading={confirmModal.loading}
            darkMode={darkMode}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

// Wrap with ToastProvider
const JobDescriptionPage = () => {
  return (
    <ToastProvider>
      <JobDescriptionPageContent />
    </ToastProvider>
  );
};

export default JobDescriptionPage;