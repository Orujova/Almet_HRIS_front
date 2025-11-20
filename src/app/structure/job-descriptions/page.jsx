// pages/structure/job-descriptions/page.jsx - UPDATED handlers
'use client'
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, Edit, Eye, Trash2, FileText, Clock,
  CheckCircle, Settings, Send, X, Users,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTheme } from '@/components/common/ThemeProvider';
import { ToastProvider, useToast } from '@/components/common/Toast';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import Pagination from '@/components/common/Pagination';

import jobDescriptionService from '@/services/jobDescriptionService';
import competencyApi from '@/services/competencyApi';

import JobDescriptionList from '@/components/jobDescription/JobDescriptionList';
import JobDescriptionForm from '@/components/jobDescription/JobDescriptionForm';
import JobViewModal from '@/components/jobDescription/JobViewModal';
import SubmissionModal from '@/components/jobDescription/SubmissionModal';
import AssignmentsModal from '@/components/jobDescription/AssignmentsModal';
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
  
  // 🔥 Assignments modal state
  const [showAssignmentsModal, setShowAssignmentsModal] = useState(false);
  const [selectedJobForAssignments, setSelectedJobForAssignments] = useState(null);
  const [assignmentsData, setAssignmentsData] = useState(null);
  
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
  
  const [dropdownData, setDropdownData] = useState({
    employees: [],
    employeeMap: new Map(),
    skillGroups: [],
    behavioralGroups: [],
    leadershipMainGroups: [],
    businessResources: [],
    accessMatrix: [],
    companyBenefits: []
  });

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
    leadership_competencies_data: [],
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
        leadershipMainGroupsRes,
        businessResourcesRes,
        accessMatrixRes,
        companyBenefitsRes
      ] = await Promise.all([
        fetch(`${baseUrl}/employees/?page_size=1000`, fetchOptions()),
        competencyApi.skillGroups.getAll(),
        competencyApi.behavioralGroups.getAll(),
        competencyApi.leadershipMainGroups.getAll(),
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

      setDropdownData({
        employees: employeeList,
        employeeMap: employeeMap,
        skillGroups: skillGroupsRes.results || [],
        behavioralGroups: behavioralGroupsRes.results || [],
        leadershipMainGroups: leadershipMainGroupsRes.results || [],
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
        job.department_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
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

  // 🔥 NEW: View assignments for a job description
  const handleViewAssignments = async (job) => {
    try {
      setActionLoading(true);
      const response = await jobDescriptionService.getJobDescriptionAssignments(job.id);
      console.log('📥 Assignments response:', response);
      setAssignmentsData(response);
      setSelectedJobForAssignments(job);
      setShowAssignmentsModal(true);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      showError('Error loading assignments');
    } finally {
      setActionLoading(false);
    }
  };

  // 🔥 NEW: Submit single assignment for approval
  const handleSubmitAssignmentForApproval = async (jobId, assignmentId, comments = '') => {
    try {
      setActionLoading(true);
      await jobDescriptionService.submitAssignmentForApproval(jobId, assignmentId, {
        comments: comments
      });
      showSuccess('Assignment submitted for approval');
      
      // Refresh assignments
      if (selectedJobForAssignments) {
        const response = await jobDescriptionService.getJobDescriptionAssignments(jobId);
        setAssignmentsData(response);
      }
      
      await fetchJobDescriptions();
      await fetchStats();
    } catch (error) {
      console.error('Error submitting assignment:', error);
      showError(error.response?.data?.error || 'Error submitting for approval');
    } finally {
      setActionLoading(false);
    }
  };

  // 🔥 NEW: Approve assignment
  const handleApproveAssignment = async (jobId, assignmentId, approverType, comments = '') => {
    try {
      setActionLoading(true);
      
      if (approverType === 'line_manager') {
        await jobDescriptionService.approveAssignmentByLineManager(jobId, assignmentId, {
          comments: comments
        });
        showSuccess('Assignment approved as line manager');
      } else {
        await jobDescriptionService.approveAssignmentAsEmployee(jobId, assignmentId, {
          comments: comments
        });
        showSuccess('Assignment approved as employee');
      }
      
      // Refresh
      const response = await jobDescriptionService.getJobDescriptionAssignments(jobId);
      setAssignmentsData(response);
      await fetchJobDescriptions();
      await fetchStats();
    } catch (error) {
      console.error('Error approving assignment:', error);
      showError(error.response?.data?.error || 'Error approving assignment');
    } finally {
      setActionLoading(false);
    }
  };

  // 🔥 NEW: Reject assignment
  const handleRejectAssignment = async (jobId, assignmentId, reason) => {
    try {
      if (!reason || !reason.trim()) {
        showError('Please provide a reason for rejection');
        return;
      }
      
      setActionLoading(true);
      await jobDescriptionService.rejectAssignment(jobId, assignmentId, {
        reason: reason
      });
      showSuccess('Assignment rejected');
      
      // Refresh
      const response = await jobDescriptionService.getJobDescriptionAssignments(jobId);
      setAssignmentsData(response);
      await fetchJobDescriptions();
      await fetchStats();
    } catch (error) {
      console.error('Error rejecting assignment:', error);
      showError(error.response?.data?.error || 'Error rejecting assignment');
    } finally {
      setActionLoading(false);
    }
  };

  // 🔥 NEW: Submit all draft assignments
  const handleSubmitAllAssignments = async (jobId) => {
    try {
      setActionLoading(true);
      const response = await jobDescriptionService.submitAllAssignmentsForApproval(jobId);
      showSuccess(response.message || 'All assignments submitted for approval');
      
      if (selectedJobForAssignments) {
        const assignmentsResponse = await jobDescriptionService.getJobDescriptionAssignments(jobId);
        setAssignmentsData(assignmentsResponse);
      }
      
      await fetchJobDescriptions();
      await fetchStats();
    } catch (error) {
      console.error('Error submitting all assignments:', error);
      showError(error.response?.data?.error || 'Error submitting assignments');
    } finally {
      setActionLoading(false);
    }
  };

  // 🔥 NEW: Remove assignment
  const handleRemoveAssignment = async (jobId, assignmentId) => {
    setConfirmModal({
      isOpen: true,
      type: 'warning',
      title: 'Remove Assignment',
      message: 'Are you sure you want to remove this assignment? The employee will be unassigned from this job description.',
      onConfirm: async () => {
        try {
          setConfirmModal({ ...confirmModal, loading: true });
          await jobDescriptionService.removeAssignment(jobId, assignmentId);
          showSuccess('Assignment removed');
          
          // Refresh
          const response = await jobDescriptionService.getJobDescriptionAssignments(jobId);
          setAssignmentsData(response);
          await fetchJobDescriptions();
          await fetchStats();
          
          setConfirmModal({ ...confirmModal, isOpen: false, loading: false });
        } catch (error) {
          console.error('Error removing assignment:', error);
          showError('Error removing assignment');
          setConfirmModal({ ...confirmModal, loading: false });
        }
      }
    });
  };

  // 🔥 NEW: Reassign employee
  const handleReassignEmployee = async (assignmentId) => {
    showInfo('Reassignment feature coming soon');
    // TODO: Implement employee selection modal for reassignment
  };

  // 🔥 NEW: Refresh assignments
  const handleRefreshAssignments = async () => {
    if (!selectedJobForAssignments) return;
    
    try {
      setActionLoading(true);
      const response = await jobDescriptionService.getJobDescriptionAssignments(selectedJobForAssignments.id);
      setAssignmentsData(response);
    } catch (error) {
      console.error('Error refreshing assignments:', error);
      showError('Error refreshing assignments');
    } finally {
      setActionLoading(false);
    }
  };

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

  // 🔥 UPDATED: Direct submission now opens modal to submit all
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
        await jobDescriptionService.submitAllAssignmentsForApproval(createdJobsData.id);
        showSuccess('All assignments submitted for approval!');
      } else {
        const jobId = createdJobsData.id || createdJobsData.job_description_id;
        await jobDescriptionService.submitAllAssignmentsForApproval(jobId);
        showSuccess('Job description and assignments submitted for approval!');
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
      showError(error.response?.data?.error || 'Error submitting for approval. Please try again.');
    } finally {
      setSubmissionLoading(false);
    }
  };

  const handleKeepAsDraft = async () => {
    const totalAssignments = createdJobsData?.total_assignments || 
                            createdJobsData?.assignments_created?.length || 1;
    
    const message = totalAssignments > 1 
      ? `Job description with ${totalAssignments} assignments saved as draft!`
      : 'Job description saved as draft!';
    
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
          message: 'You have unsaved changes. Are you sure you want to leave?',
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

  // page.jsx - handleEdit funksiyasını bu versiya ilə əvəz edin

const handleEdit = async (job) => {
  try {
    setActionLoading(true);
    const fullJob = await jobDescriptionService.getJobDescription(job.id);
    
    console.log('🔍 Full job data for edit:', fullJob);
    
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
    
    // 🔥 Extract resource IDs - FIXED: Handle both nested and flat structures
    const extractResourceIds = (resourceArray) => {
      const allIds = [];
      if (!Array.isArray(resourceArray)) return [];
      
      resourceArray.forEach(item => {
        // Get specific items if they exist
        if (item.specific_items_detail && Array.isArray(item.specific_items_detail) && item.specific_items_detail.length > 0) {
          item.specific_items_detail.forEach(childItem => {
            if (childItem.id) allIds.push(String(childItem.id));
          });
        } else if (item.specific_items && Array.isArray(item.specific_items) && item.specific_items.length > 0) {
          item.specific_items.forEach(childItem => {
            const childId = typeof childItem === 'object' ? childItem.id : childItem;
            if (childId) allIds.push(String(childId));
          });
        } else {
          // If no specific items, add parent ID
          const parentId = item.resource || item.access_matrix || item.benefit || 
                          item.resource_id || item.access_matrix_id || item.benefit_id;
          if (parentId) allIds.push(String(parentId));
        }
      });
      
      return allIds;
    };
    
    const businessResourceIds = extractResourceIds(fullJob.business_resources);
    const accessRightIds = extractResourceIds(fullJob.access_rights);
    const companyBenefitIds = extractResourceIds(fullJob.company_benefits);
    
    console.log('📦 Extracted resource IDs:', { businessResourceIds, accessRightIds, companyBenefitIds });
    
    // Extract Skills
    const skillIds = [];
    if (fullJob.required_skills && Array.isArray(fullJob.required_skills)) {
      fullJob.required_skills.forEach(skill => {
        const id = skill.skill_id || skill.skill || skill.skill_detail?.id;
        if (id) skillIds.push(String(id));
      });
    }
    
    // Extract Behavioral Competencies
    const behavioralCompetencyIds = [];
    if (fullJob.behavioral_competencies && Array.isArray(fullJob.behavioral_competencies)) {
      fullJob.behavioral_competencies.forEach(comp => {
        const id = comp.competency_id || comp.competency || comp.competency_detail?.id;
        if (id) behavioralCompetencyIds.push(String(id));
      });
    }
    
    // Extract Leadership Competencies
    const leadershipCompetencyIds = [];
    if (fullJob.leadership_competencies && Array.isArray(fullJob.leadership_competencies)) {
      fullJob.leadership_competencies.forEach(item => {
        const id = item.leadership_item_id || item.leadership_item || item.leadership_item_detail?.id || item.id;
        if (id) leadershipCompetencyIds.push(String(id));
      });
    }
    
    // Handle grading levels
    let gradingLevels = [];
    if (fullJob.grading_levels && Array.isArray(fullJob.grading_levels) && fullJob.grading_levels.length > 0) {
      gradingLevels = fullJob.grading_levels;
    } else if (fullJob.grading_level) {
      gradingLevels = [fullJob.grading_level];
    }
    
    // 🔥 FIXED: Extract position information correctly
    // Backend might return objects or strings
    const getFieldValue = (field) => {
      if (!field) return '';
      if (typeof field === 'string') return field;
      if (typeof field === 'object') return field.name || field.display_name || '';
      return String(field);
    };
    
    const transformedData = {
      // 🔥 Position Information - FIXED
      job_title: fullJob.job_title || '',
      job_purpose: fullJob.job_purpose || '',
      
      // Handle both object and string formats
      business_function: getFieldValue(fullJob.business_function),
      department: getFieldValue(fullJob.department),
      unit: getFieldValue(fullJob.unit),
      job_function: getFieldValue(fullJob.job_function),
      position_group: getFieldValue(fullJob.position_group),
      
      grading_level: fullJob.grading_level || (gradingLevels.length > 0 ? gradingLevels[0] : ''),
      grading_levels: gradingLevels,
      
      // Sections
      criticalDuties: criticalDuties.length > 0 ? criticalDuties : [''],
      positionMainKpis: positionMainKpis.length > 0 ? positionMainKpis : [''],
      jobDuties: jobDuties.length > 0 ? jobDuties : [''],
      requirements: requirements.length > 0 ? requirements : [''],
      
      // Skills and Competencies
      required_skills_data: skillIds,
      behavioral_competencies_data: behavioralCompetencyIds,
      leadership_competencies_data: leadershipCompetencyIds,
      
      // Resources
      business_resources_ids: businessResourceIds,
      access_rights_ids: accessRightIds,
      company_benefits_ids: companyBenefitIds
    };
    
    console.log('✅ Transformed data for form:', transformedData);
    
    // Validate critical fields
    const missingFields = [];
    if (!transformedData.job_title) missingFields.push('job_title');
    if (!transformedData.business_function) missingFields.push('business_function');
    if (!transformedData.department) missingFields.push('department');
    if (!transformedData.job_function) missingFields.push('job_function');
    if (!transformedData.position_group) missingFields.push('position_group');
    
    if (missingFields.length > 0) {
      console.warn('⚠️ Missing fields after transform:', missingFields);
      console.warn('⚠️ Original fullJob fields:', {
        business_function: fullJob.business_function,
        department: fullJob.department,
        job_function: fullJob.job_function,
        position_group: fullJob.position_group
      });
    }
    
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
      grading_levels: [],
      criticalDuties: [''],
      positionMainKpis: [''],
      jobDuties: [''],
      requirements: [''],
      required_skills_data: [],
      behavioral_competencies_data: [],
      leadership_competencies_data: [],
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
      message: 'Are you sure you want to delete this job description? This will remove all assignments. This action cannot be undone.',
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
        <div className="mx-auto p-4 lg:p-6">
          
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8">
              <div className="flex-1">
                <h1 className={`text-xl lg:text-2xl font-bold ${textPrimary} mb-2`}>
                  Job Descriptions
                </h1>
                <p className={`${textSecondary} text-xs lg:text-base leading-relaxed`}>
                  Create job descriptions and assign to multiple employees
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

            {/* Stats Cards - Updated for multi-assignment */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
              <StatCard 
                title="Total Jobs" 
                value={stats.total_job_descriptions || 0} 
                subtitle={`${stats.total_assignments || 0} assignments`}
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
                title="Approved" 
                value={stats.assignment_status_breakdown?.Approved || 0} 
                subtitle="Assignments approved"
                icon={CheckCircle}
                color="green-600"
                darkMode={darkMode}
              />
              <StatCard 
                title="Draft Assignments" 
                     value={stats.assignment_status_breakdown?.Draft || 0} 
                subtitle="Assignments in draft"
                icon={Users}
                color="gray-600"
                darkMode={darkMode}
              />
            </div>

            {/* Tab Navigation */}
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
                  onViewAssignments={handleViewAssignments}
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
              onViewAssignments={() => {
                setSelectedJob(null);
                handleViewAssignments(selectedJob);
              }}
              darkMode={darkMode}
            />
          )}

          {/* 🔥 Assignments Modal */}
          {showAssignmentsModal && assignmentsData && selectedJobForAssignments && (
            <AssignmentsModal
              isOpen={showAssignmentsModal}
              onClose={() => {
                setShowAssignmentsModal(false);
                setSelectedJobForAssignments(null);
                setAssignmentsData(null);
              }}
              job={selectedJobForAssignments}
              assignmentsData={assignmentsData}
              onSubmitAssignment={handleSubmitAssignmentForApproval}
              onSubmitAll={handleSubmitAllAssignments}
              onApprove={handleApproveAssignment}
              onReject={handleRejectAssignment}
              onRemoveAssignment={handleRemoveAssignment}
              onReassignEmployee={handleReassignEmployee}
              onRefresh={handleRefreshAssignments}
              currentUser={{ id: 1 }} // TODO: Get from auth context
              actionLoading={actionLoading}
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