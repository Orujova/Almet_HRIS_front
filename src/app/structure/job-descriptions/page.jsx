// pages/job-descriptions/JobDescriptionPage.jsx - Updated with Real API Integration
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
import { employeeAPI } from '@/services/api';

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
    skills: [],
    competencies: [],
    businessResources: [],
    accessMatrix: [],
    companyBenefits: []
  });

  // Form state
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
    sections: [],
    required_skills_data: [],
    behavioral_competencies_data: [],
    business_resources_ids: [],
    access_rights_ids: [],
    company_benefits_ids: []
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

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
      const [
        businessFunctions,
        departments, 
        units,
        jobFunctions,
        positionGroups,
        employees,
        skills,
        competencies,
        businessResources,
        accessMatrix,
        companyBenefits
      ] = await Promise.all([
        employeeAPI.getBusinessFunctions(),
        employeeAPI.getDepartments(),
        employeeAPI.getUnits(),
        employeeAPI.getJobFunctions(),
        employeeAPI.getPositionGroups(),
        employeeAPI.getEmployees(),
        competencyApi.skills.getAll(),
        competencyApi.behavioralCompetencies.getAll(),
        jobDescriptionService.getBusinessResources(),
        jobDescriptionService.getAccessMatrix(),
        jobDescriptionService.getCompanyBenefits()
      ]);

      setDropdownData({
        businessFunctions: businessFunctions.data?.results || [],
        departments: departments.data?.results || [],
        units: units.data?.results || [],
        jobFunctions: jobFunctions.data?.results || [],
        positionGroups: positionGroups.data?.results || [],
        employees: employees.data?.results || [],
        skills: skills.results || [],
        competencies: competencies.results || [],
        businessResources: businessResources.results || [],
        accessMatrix: accessMatrix.results || [],
        companyBenefits: companyBenefits.results || []
      });
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
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
    
    // Validate required fields
    if (!formData.job_title || !formData.department || !formData.position_group || !formData.job_purpose) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setActionLoading(true);
      
      const apiData = jobDescriptionService.prepareJobDescriptionData(formData);
      
      if (editingJob) {
        await jobDescriptionService.updateJobDescription(editingJob.id, apiData);
        alert('Job description updated successfully!');
      } else {
        await jobDescriptionService.createJobDescription(apiData);
        alert('Job description created successfully!');
      }
      
      await fetchJobDescriptions();
      await fetchStats();
      resetForm();
    } catch (error) {
      console.error('Error saving job description:', error);
      alert('Error saving job description. Please try again.');
    } finally {
      setActionLoading(false);
    }
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
      sections: [],
      required_skills_data: [],
      behavioral_competencies_data: [],
      business_resources_ids: [],
      access_rights_ids: [],
      company_benefits_ids: []
    });
    setEditingJob(null);
    setActiveView('list');
  };

  // Handle edit
  const handleEdit = async (job) => {
    try {
      setActionLoading(true);
      const fullJob = await jobDescriptionService.getJobDescription(job.id);
      const transformedData = jobDescriptionService.transformJobDescriptionResponse(fullJob);
      setFormData(transformedData);
      setEditingJob(fullJob);
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

  // Multi-select component
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
                      <input
                        type="text"
                        value={formData.job_title}
                        onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                        placeholder="Enter job title"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Business Function <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.business_function}
                        onChange={(e) => setFormData({...formData, business_function: e.target.value})}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                        required
                      >
                        <option value="">Select Business Function</option>
                        {dropdownData.businessFunctions.map(bf => (
                          <option key={bf.id} value={bf.id}>{bf.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Department <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                        required
                      >
                        <option value="">Select Department</option>
                        {dropdownData.departments.map(dept => (
                          <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Position Group <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.position_group}
                        onChange={(e) => setFormData({...formData, position_group: e.target.value})}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                        required
                      >
                        <option value="">Select Position Group</option>
                        {dropdownData.positionGroups.map(pg => (
                          <option key={pg.id} value={pg.id}>{pg.display_name || pg.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Reports To
                      </label>
                      <select
                        value={formData.reports_to}
                        onChange={(e) => setFormData({...formData, reports_to: e.target.value})}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                      >
                        <option value="">Select Manager</option>
                        {dropdownData.employees.map(emp => (
                          <option key={emp.id} value={emp.id}>{emp.name || emp.full_name}</option>
                        ))}
                      </select>
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
                      required
                    />
                  </div>

                  {/* Dynamic Sections */}
                  {[
                    { type: 'CRITICAL_DUTIES', title: 'Critical Duties', required: true },
                    { type: 'MAIN_KPIS', title: 'Position Main KPIs', required: true },
                    { type: 'JOB_DUTIES', title: 'Job Duties', required: true },
                    { type: 'REQUIREMENTS', title: 'Requirements', required: true }
                  ].map(({ type, title, required }) => {
                    const sectionData = formData.sections.find(s => s.section_type === type) || { content: '' };
                    const contentLines = sectionData.content ? sectionData.content.split('\n• ').filter(line => line.trim()) : [''];
                    
                    return (
                      <div key={type}>
                        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                          {title} {required && <span className="text-red-500">*</span>}
                        </label>
                        {contentLines.map((line, index) => (
                          <div key={index} className="flex items-start gap-2 mb-2">
                            <textarea
                              value={line.replace(/^• /, '')}
                              onChange={(e) => {
                                const newLines = [...contentLines];
                                newLines[index] = e.target.value;
                                const newSections = formData.sections.filter(s => s.section_type !== type);
                                if (newLines.some(l => l.trim())) {
                                  newSections.push({
                                    section_type: type,
                                    title,
                                    content: newLines.filter(l => l.trim()).map(l => `• ${l}`).join('\n'),
                                    order: newSections.length + 1
                                  });
                                }
                                setFormData({...formData, sections: newSections});
                              }}
                              className={`flex-1 px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                              rows="2"
                              placeholder={`Enter ${title.toLowerCase()}...`}
                              required={required && index === 0}
                            />
                            {contentLines.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newLines = contentLines.filter((_, i) => i !== index);
                                  const newSections = formData.sections.filter(s => s.section_type !== type);
                                  if (newLines.some(l => l.trim())) {
                                    newSections.push({
                                      section_type: type,
                                      title,
                                      content: newLines.filter(l => l.trim()).map(l => `• ${l}`).join('\n'),
                                      order: newSections.length + 1
                                    });
                                  }
                                  setFormData({...formData, sections: newSections});
                                }}
                                className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                              >
                                <X size={16} />
                              </button>
                            )}
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            const newLines = [...contentLines, ''];
                            const newSections = formData.sections.filter(s => s.section_type !== type);
                            newSections.push({
                              section_type: type,
                              title,
                              content: newLines.filter(l => l.trim()).map(l => `• ${l}`).join('\n'),
                              order: newSections.length + 1
                            });
                            setFormData({...formData, sections: newSections});
                          }}
                          className="text-almet-sapphire hover:text-almet-astral font-medium text-sm flex items-center gap-1"
                        >
                          <Plus size={16} />
                          Add {title.slice(0, -1)}
                        </button>
                      </div>
                    );
                  })}

                  {/* Multi-select for Skills and Competencies */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Required Skills
                      </label>
                      <MultiSelect
                        options={dropdownData.skills}
                        selected={formData.required_skills_data}
                        onChange={handleMultiSelectChange}
                        placeholder="Select skills..."
                        fieldName="required_skills_data"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Behavioral Competencies
                      </label>
                      <MultiSelect
                        options={dropdownData.competencies}
                        selected={formData.behavioral_competencies_data}
                        onChange={handleMultiSelectChange}
                        placeholder="Select competencies..."
                        fieldName="behavioral_competencies_data"
                      />
                    </div>
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
                        <h4 className={`font-medium ${textPrimary} mb-1`}>Important Notes:</h4>
                        <p className={`text-sm ${textSecondary} mb-2`}>
                          After creating this job description, it will be submitted for approval workflow.
                        </p>
                        <p className={`text-sm ${textSecondary} mb-2`}>
                          The assigned employee will be notified to review and approve their job description.
                        </p>
                        <p className={`text-sm ${textSecondary}`}>
                          The line manager will also need to approve the job description before it becomes active.
                        </p>
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
                      {editingJob ? 'Update' : 'Create'} Job Description
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
        </div>
      </div>
    </DashboardLayout>
  );
};

export default JobDescriptionPage;
                       