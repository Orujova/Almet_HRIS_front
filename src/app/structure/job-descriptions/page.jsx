'use client'
import React, { useState, useMemo } from 'react';
import { Plus, Edit, Eye, Trash2, Save, X, Search, Filter, FileText, Users, Target, Download, Upload, ChevronDown } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTheme } from '@/components/common/ThemeProvider';

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
  const [activeView, setActiveView] = useState('list'); // list, create, edit, view
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  // Sample data structure based on your requirements
  const [jobDescriptions, setJobDescriptions] = useState([
    {
      id: 1,
      jobTitle: 'Senior Sales Manager',
      hierarchyGrade: 'Grade 12',
      department: 'Commercial',
      reportsTo: 'Regional Sales Director',
      employee: 'John Smith',
      jobPurpose: 'To lead the sales team and drive revenue growth in the assigned territory while maintaining strong client relationships and achieving sales targets.',
      criticalDuties: [
        'Develop and implement sales strategies to achieve quarterly and annual targets',
        'Manage and mentor junior sales staff',
        'Build and maintain relationships with key clients',
        'Analyze market trends and competitive landscape'
      ],
      positionMainKpis: [
        'Quarterly sales revenue target achievement',
        'Client retention rate',
        'Team performance metrics',
        'New client acquisition rate'
      ],
      jobDuties: [
        'Conduct regular sales meetings and reviews',
        'Prepare sales forecasts and reports',
        'Participate in strategic planning sessions',
        'Coordinate with marketing team for campaigns'
      ],
      requirements: [
        'Bachelor\'s degree in Business Administration or related field',
        'Minimum 5 years of sales experience',
        'Strong leadership and communication skills',
        'Proficiency in CRM software'
      ],
      generalProfessionalCompetencies: [
        'Strategic Planning',
        'Team Leadership',
        'Client Management',
        'Data Analysis'
      ],
      technicalCompetencies: [
        'CRM Systems',
        'Sales Analytics',
        'Market Research',
        'Contract Negotiation'
      ],
      behavioralCompetencies: [
        'Results Orientation',
        'Communication',
        'Team Orientation',
        'Customer Focus'
      ],
      resourcesForJobBusiness: [
        'Access to CRM system',
        'Marketing materials',
        'Sales tools and software',
        'Training resources'
      ],
      accessRights: [
        'Sales database access',
        'Client information system',
        'Reporting tools',
        'Budget management system'
      ],
      companyBenefits: [
        'Health insurance',
        'Performance bonuses',
        'Professional development budget',
        'Flexible working arrangements'
      ],
      signedByLineManager: 'Signed digitally',
      signedByEmployee: 'Not signed yet',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: 2,
      jobTitle: 'Marketing Specialist',
      hierarchyGrade: 'Grade 8',
      department: 'Marketing',
      reportsTo: 'Marketing Manager',
      employee: '',
      jobPurpose: 'To develop and execute marketing campaigns that drive brand awareness and lead generation.',
      criticalDuties: [
        'Create and manage digital marketing campaigns',
        'Develop marketing content and materials',
        'Analyze campaign performance and ROI'
      ],
      positionMainKpis: [
        'Campaign ROI',
        'Lead generation targets',
        'Brand awareness metrics'
      ],
      jobDuties: [
        'Manage social media presence',
        'Create marketing reports',
        'Coordinate with design team'
      ],
      requirements: [
        'Bachelor\'s degree in Marketing',
        'Experience with digital marketing tools',
        'Strong analytical skills'
      ],
      generalProfessionalCompetencies: [
        'Digital Marketing',
        'Content Creation',
        'Analytics'
      ],
      technicalCompetencies: [
        'Google Analytics',
        'Social Media Platforms',
        'Marketing Automation'
      ],
      behavioralCompetencies: [
        'Creativity',
        'Communication',
        'Planning & Organizing'
      ],
      resourcesForJobBusiness: [
        'Marketing tools access',
        'Design software',
        'Budget allocation'
      ],
      accessRights: [
        'Marketing platforms',
        'Analytics tools',
        'Content management system'
      ],
      companyBenefits: [
        'Health insurance',
        'Learning opportunities',
        'Remote work options'
      ],
      signedByLineManager: 'Signed digitally',
      signedByEmployee: 'Signed digitally',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-12'
    }
  ]);

  // Form state
  const [formData, setFormData] = useState({
    jobTitle: '',
    hierarchyGrade: '',
    department: '',
    reportsTo: '',
    employee: '',
    jobPurpose: '',
    criticalDuties: [''],
    positionMainKpis: [''],
    jobDuties: [''],
    requirements: [''],
    generalProfessionalCompetencies: [],
    technicalCompetencies: [],
    behavioralCompetencies: [],
    resourcesForJobBusiness: [],
    accessRights: [],
    companyBenefits: [],
    signedByLineManager: 'Not signed yet',
    signedByEmployee: 'Not signed yet'
  });

  // Dropdown options
  const departmentOptions = ['Commercial', 'Marketing', 'Finance', 'Operations', 'HR', 'IT'];
  const gradeOptions = ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'];
  const competencyOptions = {
    general: ['Strategic Planning', 'Team Leadership', 'Client Management', 'Data Analysis', 'Project Management', 'Communication'],
    technical: ['CRM Systems', 'Sales Analytics', 'Market Research', 'Contract Negotiation', 'Digital Marketing', 'Financial Analysis'],
    behavioral: ['Results Orientation', 'Communication', 'Team Orientation', 'Customer Focus', 'Creativity', 'Planning & Organizing']
  };

  // Filter jobs based on search and department
  const filteredJobs = useMemo(() => {
    return jobDescriptions.filter(job => {
      const matchesSearch = !searchTerm || 
        job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.employee && job.employee.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesDepartment = !selectedDepartment || job.department === selectedDepartment;
      
      return matchesSearch && matchesDepartment;
    });
  }, [jobDescriptions, searchTerm, selectedDepartment]);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (editingJob) {
      // Update existing job
      setJobDescriptions(prev => prev.map(job => 
        job.id === editingJob.id 
          ? { ...job, ...formData, updatedAt: new Date().toISOString().split('T')[0] }
          : job
      ));
    } else {
      // Create new job
      const newJob = {
        id: Date.now(),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setJobDescriptions(prev => [...prev, newJob]);
    }
    
    resetForm();
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      jobTitle: '',
      hierarchyGrade: '',
      department: '',
      reportsTo: '',
      employee: '',
      jobPurpose: '',
      criticalDuties: [''],
      positionMainKpis: [''],
      jobDuties: [''],
      requirements: [''],
      generalProfessionalCompetencies: [],
      technicalCompetencies: [],
      behavioralCompetencies: [],
      resourcesForJobBusiness: [],
      accessRights: [],
      companyBenefits: [],
      signedByLineManager: 'Not signed yet',
      signedByEmployee: 'Not signed yet'
    });
    setShowForm(false);
    setEditingJob(null);
    setActiveView('list');
  };

  // Handle edit
  const handleEdit = (job) => {
    setFormData(job);
    setEditingJob(job);
    setShowForm(true);
    setActiveView('create');
  };

  // Handle delete
  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this job description?')) {
      setJobDescriptions(prev => prev.filter(job => job.id !== id));
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
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
  };

  // Handle multi-select for competencies
  const handleMultiSelectChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].includes(value)
        ? prev[fieldName].filter(item => item !== value)
        : [...prev[fieldName], value]
    }));
  };

  // Stats
  const stats = useMemo(() => {
    const totalJobs = jobDescriptions.length;
    const assignedJobs = jobDescriptions.filter(job => job.employee).length;
    const signedJobs = jobDescriptions.filter(job => job.signedByEmployee === 'Signed digitally').length;
    
    return { totalJobs, assignedJobs, signedJobs };
  }, [jobDescriptions]);

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
                    setShowForm(true);
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <StatCard 
                title="Total Jobs" 
                value={stats.totalJobs} 
                icon={FileText}
                color="almet-sapphire"
              />
              <StatCard 
                title="Assigned Jobs" 
                value={stats.assignedJobs} 
                icon={Users}
                color="green-600"
              />
              <StatCard 
                title="Signed Jobs" 
                value={stats.signedJobs} 
                icon={Target}
                color="purple-600"
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
                      setShowForm(false);
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
                    {departmentOptions.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
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
                              <h3 className={`text-lg font-semibold ${textPrimary}`}>{job.jobTitle}</h3>
                              <p className={`text-sm ${textSecondary}`}>
                                {job.department} • {job.hierarchyGrade}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedJob(job);
                                setActiveView('view');
                              }}
                              className="p-2 text-almet-sapphire hover:bg-almet-sapphire/10 rounded transition-colors"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleEdit(job)}
                              className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(job.id)}
                              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className={`font-medium ${textMuted}`}>Employee: </span>
                            <span className={textPrimary}>{job.employee || 'Unassigned'}</span>
                          </div>
                          <div>
                            <span className={`font-medium ${textMuted}`}>Reports to: </span>
                            <span className={textPrimary}>{job.reportsTo}</span>
                          </div>
                          <div>
                            <span className={`font-medium ${textMuted}`}>Status: </span>
                            <span className={`px-2 py-1 rounded text-xs ${
                              job.signedByEmployee === 'Signed digitally' 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                            }`}>
                              {job.signedByEmployee === 'Signed digitally' ? 'Signed' : 'Pending'}
                            </span>
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
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Job Title *
                      </label>
                      <input
                        type="text"
                        value={formData.jobTitle}
                        onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Hierarchy & Grade *
                      </label>
                      <select
                        value={formData.hierarchyGrade}
                        onChange={(e) => setFormData({...formData, hierarchyGrade: e.target.value})}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                        required
                      >
                        <option value="">Select Grade</option>
                        {gradeOptions.map(grade => (
                          <option key={grade} value={grade}>{grade}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Department *
                      </label>
                      <select
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                        required
                      >
                        <option value="">Select Department</option>
                        {departmentOptions.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Reports To
                      </label>
                      <input
                        type="text"
                        value={formData.reportsTo}
                        onChange={(e) => setFormData({...formData, reportsTo: e.target.value})}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Employee
                      </label>
                      <input
                        type="text"
                        value={formData.employee}
                        onChange={(e) => setFormData({...formData, employee: e.target.value})}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                      />
                    </div>
                  </div>

                  {/* Job Purpose */}
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                      Job Purpose *
                    </label>
                    <textarea
                      value={formData.jobPurpose}
                      onChange={(e) => setFormData({...formData, jobPurpose: e.target.value})}
                      rows="3"
                      className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                      required
                    />
                  </div>

                  {/* Dynamic Array Fields */}
                  {[
                    { field: 'criticalDuties', label: 'Critical Duties' },
                    { field: 'positionMainKpis', label: 'Position Main KPIs' },
                    { field: 'jobDuties', label: 'Job Duties' },
                    { field: 'requirements', label: 'Requirements' }
                  ].map(({ field, label }) => (
                    <div key={field}>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        {label} *
                      </label>
                      {formData[field].map((item, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={item}
                            onChange={(e) => handleArrayFieldChange(field, index, e.target.value)}
                            className={`flex-1 px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                            required
                          />
                          {formData[field].length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeArrayItem(field, index)}
                              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                            >
                              <X size={16} />
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addArrayItem(field)}
                        className="text-almet-sapphire hover:text-almet-astral font-medium text-sm"
                      >
                        + Add {label.slice(0, -1)}
                      </button>
                    </div>
                  ))}

                  {/* Multi-select Competencies */}
                  {[
                    { field: 'generalProfessionalCompetencies', label: 'General Professional Competencies', options: competencyOptions.general },
                    { field: 'technicalCompetencies', label: 'Technical Competencies', options: competencyOptions.technical },
                    { field: 'behavioralCompetencies', label: 'Behavioral Competencies', options: competencyOptions.behavioral }
                  ].map(({ field, label, options }) => (
                    <div key={field}>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        {label}
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {options.map(option => (
                          <label key={option} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData[field].includes(option)}
                              onChange={() => handleMultiSelectChange(field, option)}
                              className="mr-2 text-almet-sapphire focus:ring-almet-sapphire"
                            />
                            <span className={`text-sm ${textPrimary}`}>{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Signature Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Signed by Line Manager
                      </label>
                      <select
                        value={formData.signedByLineManager}
                        onChange={(e) => setFormData({...formData, signedByLineManager: e.target.value})}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                      >
                        <option value="Not signed yet">Not signed yet</option>
                        <option value="Signed digitally">Signed digitally</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Signed by Employee
                      </label>
                      <select
                        value={formData.signedByEmployee}
                        onChange={(e) => setFormData({...formData, signedByEmployee: e.target.value})}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                      >
                        <option value="Not signed yet">Not signed yet</option>
                        <option value="Signed digitally">Signed digitally</option>
                      </select>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-almet-comet">
                    <button
                      type="button"
                      onClick={resetForm}
                      className={`px-4 py-2 ${textSecondary} hover:${textPrimary} transition-colors`}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors"
                    >
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
                    <h2 className={`text-2xl font-bold ${textPrimary}`}>Job Description</h2>
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

                  <div className="space-y-6">
                    {/* Header Information */}
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-4 ${bgAccent} rounded-lg`}>
                      <div>
                        <h3 className={`text-xl font-semibold ${textPrimary} mb-2`}>{selectedJob.jobTitle}</h3>
                        <p className={`${textSecondary}`}>{selectedJob.department} • {selectedJob.hierarchyGrade}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className={`font-medium ${textMuted}`}>Reports to:</span>
                          <span className={textPrimary}>{selectedJob.reportsTo}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className={`font-medium ${textMuted}`}>Employee:</span>
                          <span className={textPrimary}>{selectedJob.employee || 'Unassigned'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Job Purpose */}
                    <div>
                      <h4 className={`text-lg font-semibold ${textPrimary} mb-3`}>Job Purpose</h4>
                      <p className={`${textSecondary} leading-relaxed`}>{selectedJob.jobPurpose}</p>
                    </div>

                    {/* Critical Duties */}
                    <div>
                      <h4 className={`text-lg font-semibold ${textPrimary} mb-3`}>Critical Duties</h4>
                      <ul className={`list-disc list-inside space-y-1 ${textSecondary}`}>
                        {selectedJob.criticalDuties.map((duty, index) => (
                          <li key={index}>{duty}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Main KPIs */}
                    <div>
                      <h4 className={`text-lg font-semibold ${textPrimary} mb-3`}>Main KPIs</h4>
                      <ul className={`list-disc list-inside space-y-1 ${textSecondary}`}>
                        {selectedJob.positionMainKpis.map((kpi, index) => (
                          <li key={index}>{kpi}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Job Duties */}
                    <div>
                      <h4 className={`text-lg font-semibold ${textPrimary} mb-3`}>Job Duties</h4>
                      <ul className={`list-disc list-inside space-y-1 ${textSecondary}`}>
                        {selectedJob.jobDuties.map((duty, index) => (
                          <li key={index}>{duty}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Requirements */}
                    <div>
                      <h4 className={`text-lg font-semibold ${textPrimary} mb-3`}>Requirements</h4>
                      <ul className={`list-disc list-inside space-y-1 ${textSecondary}`}>
                        {selectedJob.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Competencies */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className={`text-lg font-semibold ${textPrimary} mb-3`}>General Professional</h4>
                        <div className="space-y-2">
                          {selectedJob.generalProfessionalCompetencies.map((comp, index) => (
                            <span key={index} className={`inline-block px-3 py-1 ${bgAccent} ${textSecondary} text-sm rounded-full mr-2 mb-2`}>
                              {comp}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className={`text-lg font-semibold ${textPrimary} mb-3`}>Technical</h4>
                        <div className="space-y-2">
                          {selectedJob.technicalCompetencies.map((comp, index) => (
                            <span key={index} className={`inline-block px-3 py-1 ${bgAccent} ${textSecondary} text-sm rounded-full mr-2 mb-2`}>
                              {comp}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className={`text-lg font-semibold ${textPrimary} mb-3`}>Behavioral</h4>
                        <div className="space-y-2">
                          {selectedJob.behavioralCompetencies.map((comp, index) => (
                            <span key={index} className={`inline-block px-3 py-1 ${bgAccent} ${textSecondary} text-sm rounded-full mr-2 mb-2`}>
                              {comp}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Resources and Access */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className={`text-lg font-semibold ${textPrimary} mb-3`}>Resources for Job Business</h4>
                        <ul className={`list-disc list-inside space-y-1 ${textSecondary}`}>
                          {selectedJob.resourcesForJobBusiness.map((resource, index) => (
                            <li key={index}>{resource}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className={`text-lg font-semibold ${textPrimary} mb-3`}>Access Rights</h4>
                        <ul className={`list-disc list-inside space-y-1 ${textSecondary}`}>
                          {selectedJob.accessRights.map((access, index) => (
                            <li key={index}>{access}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Company Benefits */}
                    <div>
                      <h4 className={`text-lg font-semibold ${textPrimary} mb-3`}>Company Benefits</h4>
                      <ul className={`list-disc list-inside space-y-1 ${textSecondary}`}>
                        {selectedJob.companyBenefits.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Signature Status */}
                    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 p-4 ${bgAccent} rounded-lg`}>
                      <div className="flex justify-between items-center">
                        <span className={`font-medium ${textMuted}`}>Line Manager:</span>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          selectedJob.signedByLineManager === 'Signed digitally' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {selectedJob.signedByLineManager}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className={`font-medium ${textMuted}`}>Employee:</span>
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          selectedJob.signedByEmployee === 'Signed digitally' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {selectedJob.signedByEmployee}
                        </span>
                      </div>
                    </div>

                    {/* Timestamps */}
                    <div className={`text-sm ${textMuted} text-center pt-4 border-t ${borderColor}`}>
                      Created: {selectedJob.createdAt} • Last Updated: {selectedJob.updatedAt}
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