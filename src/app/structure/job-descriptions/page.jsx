// pages/structure/job-descriptions/index.js - FIXED: Complete Employee Selection Integration
'use client'
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  FileText, 
  Clock,
  CheckCircle,
  Settings,
  Send,
  X,
  Users,
  AlertCircle
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
import StatCard from '@/components/jobDescription/StatCard';
import EmployeeSelectionModal from '@/components/jobDescription/EmployeeSelectionModal';

const JobDescriptionPage = () => {
  const { darkMode } = useTheme();
  const router = useRouter();
  
  // Theme-dependent classes using Almet colors
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
  
  // Enhanced submission workflow state
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [submissionComments, setSubmissionComments] = useState('');
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [createdJobsData, setCreatedJobsData] = useState(null);
  const [isExistingJobSubmission, setIsExistingJobSubmission] = useState(false);

  // Data states
  const [jobDescriptions, setJobDescriptions] = useState([]);
  const [stats, setStats] = useState({});
  
  // Dropdown data populated from employee list
  const [dropdownData, setDropdownData] = useState({
    employees: [],
    skillGroups: [],
    behavioralGroups: [],
    businessResources: [],
    accessMatrix: [],
    companyBenefits: []
  });

  // Enhanced form state
  const [formData, setFormData] = useState({
    job_title: '',
    job_purpose: '',
    business_function: '',
    department: '',
    unit: '',
    job_function: '',
    position_group: '',
    grading_level: '',
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

  // Employee matching state for display only
  const [matchingEmployees, setMatchingEmployees] = useState([]);

  // Enhanced notification state
  const [notification, setNotification] = useState(null);

  // FIXED: Employee selection workflow state - removed duplicate modal
  const [assignmentPreview, setAssignmentPreview] = useState(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

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

  // Filter matching employees for display based on job criteria
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

  // Auto-clear notifications after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Filter employees based on selected job criteria (for display only)
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

      if (formData.grading_level && employee.grading_level && 
          employee.grading_level !== formData.grading_level) {
        return false;
      }

      if (formData.job_title && employee.job_title && 
          !employee.job_title.toLowerCase().includes(formData.job_title.toLowerCase())) {
        return false;
      }

      return true;
    });

    console.log('🔍 Filtered matching employees for display:', filtered.length, 'out of', dropdownData.employees.length);
    setMatchingEmployees(filtered);
  };

  // Show notification helper
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
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
      showNotification('Error loading initial data', 'error');
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

      console.log('📄 Fetching dropdown data from employees...');

      const [
        employeesRes,
        skillGroupsRes,
        behavioralGroupsRes,
        businessResourcesRes,
        accessMatrixRes,
        companyBenefitsRes
      ] = await Promise.all([
        fetch(`${baseUrl}/employees/?page_size=1000`, fetchOptions()),
        competencyApi.skillGroups.getAll(),
        competencyApi.behavioralGroups.getAll(),
        jobDescriptionService.getBusinessResources({ page_size: 1000 }),
        jobDescriptionService.getAccessMatrix({ page_size: 1000 }),
        jobDescriptionService.getCompanyBenefits({ page_size: 1000 })
      ]);

      const employees = employeesRes.ok ? await employeesRes.json() : { results: [] };

      setDropdownData({
        employees: employees.results || [],
        skillGroups: skillGroupsRes.results || [],
        behavioralGroups: behavioralGroupsRes.results || [],
        businessResources: businessResourcesRes.results || [],
        accessMatrix: accessMatrixRes.results || [],
        companyBenefits: companyBenefitsRes.results || []
      });

      console.log('✅ Dropdown data loaded successfully from', employees.results?.length || 0, 'employees');
    } catch (error) {
      console.error('❌ Error fetching dropdown data:', error);
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

  const handleDownloadSinglePDF = async (jobId) => {
    try {
      setActionLoading(true);
      await jobDescriptionService.downloadJobDescriptionPDF(jobId);
      showNotification('PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading job description PDF:', error);
      showNotification('Error downloading PDF. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle direct submission for approval (for existing draft jobs)
  const handleDirectSubmissionForApproval = async (jobId) => {
    setCreatedJobsData({ id: jobId, isExisting: true });
    setIsExistingJobSubmission(true);
    setShowSubmissionModal(true);
  };

  // Enhanced submission handling for multiple jobs
  const handleSubmitForApproval = async () => {
    if (!createdJobsData) return;

    try {
      setSubmissionLoading(true);
      
      if (createdJobsData.isExisting) {
        // Single existing job submission
        await jobDescriptionService.submitForApproval(createdJobsData.id, {
          comments: submissionComments,
          submit_to_line_manager: true
        });
        
        showNotification('Job description submitted for approval successfully!');
      } else {
        // Multiple job submission handling
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
        
        showNotification(message);
      }
      
      await fetchJobDescriptions();
      await fetchStats();
      setShowSubmissionModal(false);
      setSubmissionComments('');
      setCreatedJobsData(null);
      setIsExistingJobSubmission(false);
      resetForm();
    } catch (error) {
      console.error('Error submitting for approval:', error);
      showNotification('Error submitting for approval. Please try again.', 'error');
    } finally {
      setSubmissionLoading(false);
    }
  };

  // Enhanced keep as draft handling
  const handleKeepAsDraft = async () => {
    const message = createdJobsData?.summary?.total_job_descriptions_created > 1 
      ? `${createdJobsData.summary.total_job_descriptions_created} job descriptions saved as drafts successfully!`
      : 'Job description saved as draft successfully!';
    
    showNotification(message);
    
    await fetchJobDescriptions();
    await fetchStats();

    setShowSubmissionModal(false);
    setSubmissionComments('');
    setCreatedJobsData(null);
    setIsExistingJobSubmission(false);
    resetForm();
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
    setMatchingEmployees([]);
    setAssignmentPreview(null);
  };

  const handleEdit = async (job) => {
    try {
      setActionLoading(true);
      const fullJob = await jobDescriptionService.getJobDescription(job.id);
      const transformedData = jobDescriptionService.transformJobDescriptionResponse(fullJob);
      setFormData(transformedData);
      setEditingJob(fullJob);
      
      if (transformedData.position_group) {
        setSelectedPositionGroup(transformedData.position_group);
      }
      
      setActiveView('create');
    } catch (error) {
      console.error('Error loading job for edit:', error);
      showNotification('Error loading job description. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this job description?')) {
      return;
    }

    try {
      setActionLoading(true);
      await jobDescriptionService.deleteJobDescription(id);
      await fetchJobDescriptions();
      await fetchStats();
      showNotification('Job description deleted successfully!');
    } catch (error) {
      console.error('Error deleting job description:', error);
      showNotification('Error deleting job description. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewJob = async (job) => {
    try {
      setActionLoading(true);
      const fullJob = await jobDescriptionService.getJobDescription(job.id);
      setSelectedJob(fullJob);
    } catch (error) {
      console.error('Error loading job for view:', error);
      showNotification('Error loading job description details. Please try again.', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // FIXED: Enhanced job creation handling
  const handleJobSubmit = (createdJob) => {
    console.log('📋 Job creation completed:', createdJob);
    
    // Store the created job(s) data for submission modal
    setCreatedJobsData(createdJob);
    setIsExistingJobSubmission(false);
    setShowSubmissionModal(true);
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
          
          {/* Enhanced Notification Banner */}
          {notification && (
            <div className={`mb-4 p-4 rounded-lg border ${
              notification.type === 'error' 
                ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'
                : 'bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {notification.type === 'error' ? (
                    <AlertCircle size={16} />
                  ) : (
                    <CheckCircle size={16} />
                  )}
                  <span className="font-medium text-sm">{notification.message}</span>
                </div>
                <button
                  onClick={() => setNotification(null)}
                  className="text-current opacity-70 hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
          
          {/* Enhanced Header Section */}
          <div className="mb-8">
            {/* Title and Action Buttons */}
            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-8">
              <div className="flex-1">
                <h1 className={`text-xl lg:text-2xl font-bold ${textPrimary} mb-2`}>
                  Job Descriptions
                </h1>
                <p className={`${textSecondary} text-sm lg:text-base leading-relaxed`}>
                  Create job descriptions with intelligent employee assignment based on your organizational structure and employee data
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

            {/* Enhanced Navigation Tabs */}
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

          {/* Main Content Area */}
          <div className="space-y-6">
            {activeView === 'list' ? (
              <div className="space-y-4">
                <JobDescriptionList
                  filteredJobs={filteredJobs}
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

          {/* Enhanced Submission Modal */}
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
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobDescriptionPage;