'use client'
import React, { useState, useMemo } from 'react';
import { Plus, Edit, Eye, Trash2, Save, X, Search, Filter, FileText, Users, Target, Download, Upload, ChevronDown, AlertCircle } from 'lucide-react';
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
  const [activeView, setActiveView] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);

  // Mock data for dropdowns (normally from headcount/competencies)
  const mockHeadcountData = {
    jobTitles: ['Sales Manager', 'Marketing Specialist', 'HR Manager', 'Finance Analyst', 'Operations Manager'],
    hierarchyGrades: ['Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12'],
    departments: ['Commercial', 'Marketing', 'Finance', 'Operations', 'HR', 'IT', 'Procurement', 'HSE General', 'Security'],
    positions: ['CEO', 'Regional Director', 'Department Manager', 'Team Lead', 'Senior Specialist', 'Specialist'],
    employees: ['John Smith', 'Jane Doe', 'Ali Mammadov', 'Aysel Aliyeva', 'Rashad Hasanov', 'Sabina Ismayilova']
  };

  const mockCompetenciesData = {
    generalProfessional: [
      'Strategy Setting', 'Strategy delegation & execution', 'Global Steel Market and factors impacting demand and price',
      'Local Steel Market and factors impacting demand and price', 'Steel Products Portfolio Markets & Application',
      'Price Management', 'P&L', 'Project Management', 'Sales Management & Techniques', 'Supply Chain Management',
      'Investment Projects Feasibility Study', 'Data Analysis', 'Marketing Communications', 'Management KPIs & Reports',
      'Financial Statements', 'Policies & procedures design', 'Process Flow Chart Design', 'Professional correspondence & e-mailing',
      'Languages (eg English)', 'MS Office', 'ERPs (NETSUITE eq)', 'Reporting', 'Presentation', 'QMS standards and processes',
      'Occupational Health & Safety', 'Documents Administration & Control', 'Office & Space Management'
    ],
    technical: [
      'Consumer & Supplier market data', 'Computer Data', 'Sales performance KPIs management', 'Sales Cost & Price Calculation',
      'Quotation Procedure', 'Sales Skills (Negotiations and Communications)', 'Accounts Receivable Management / Credit Control',
      'Trading software and platforms, including Bloomberg', 'Contract Management', 'Sales Order Creation and administration',
      'Credit Insurance Terms and Agreement', 'Cargo Insurance Terms and Agreement', 'Netsuite report creation and analysing',
      'Netsuite dashboards usage for Sales & Targets'
    ],
    behavioral: [
      'Sets goals and focuses on accomplishment', 'Focuses on high-priority actions and does not become distracted by lower-priority activities',
      'Takes appropriate risks to reach tough goals', 'Overcomes setbacks and adjusts the plan of action to realize goals',
      'Develops a sense of urgency in others to complete tasks', 'Corrects actions if the result is below the expectation',
      'Clearly knows own strengths & weaknesses', 'Explores maximum information about the client strengths & weaknesses prior to starting negotiations',
      'Creates a Win Win picture at the time', 'Build Personal relations if has positive impact on negotiation outcome',
      'Keeps goals in mind at stages of negotiation'
    ]
  };

  const mockResourcesData = [
    'CRM System Access', 'Marketing Tools', 'Sales Analytics Platform', 'Financial Software', 'Project Management Tools',
    'Communication Platforms', 'Training Resources', 'Budget Management System', 'Reporting Tools', 'Database Access'
  ];

  const mockAccessRightsData = [
    'Sales Database', 'Client Information System', 'Financial Reports', 'Marketing Platforms', 'HR Systems',
    'Operations Dashboard', 'Analytics Tools', 'Content Management System', 'Budget Planning', 'Performance Metrics'
  ];

  const mockCompanyBenefitsData = [
    'Health Insurance', 'Life Insurance', 'Dental Coverage', 'Vision Coverage', 'Retirement Plan',
    'Performance Bonuses', 'Stock Options', 'Flexible Work Hours', 'Remote Work Options', 'Professional Development Budget',
    'Training Programs', 'Conference Attendance', 'Gym Membership', 'Meal Allowance', 'Transportation Allowance',
    'Annual Leave', 'Sick Leave', 'Maternity/Paternity Leave', 'Personal Days', 'Sabbatical Leave'
  ];

  // Sample job descriptions data
  const [jobDescriptions, setJobDescriptions] = useState([
    {
      id: 1,
      jobTitle: 'Sales Manager',
      hierarchyGrade: 'Grade 12',
      department: 'Commercial',
      reportsTo: 'Regional Director',
      employee: 'John Smith',
      jobPurpose: 'To lead the sales team and drive revenue growth in the assigned territory while maintaining strong client relationships and achieving sales targets.',
      criticalDuties: [
        'Develop and implement sales strategies to achieve quarterly and annual targets',
        'Manage and mentor junior sales staff',
        'Build and maintain relationships with key clients'
      ],
      positionMainKpis: [
        'Quarterly sales revenue target achievement',
        'Client retention rate above 95%',
        'Team performance metrics'
      ],
      jobDuties: [
        'Conduct regular sales meetings and reviews',
        'Prepare sales forecasts and reports',
        'Participate in strategic planning sessions'
      ],
      requirements: [
        'Bachelor degree in Business Administration or related field',
        'Minimum 5 years of sales experience',
        'Strong leadership and communication skills'
      ],
      generalProfessionalCompetencies: ['Sales Management & Techniques', 'Project Management', 'Data Analysis'],
      technicalCompetencies: ['Sales performance KPIs management', 'CRM Systems', 'Contract Management'],
      behavioralCompetencies: ['Sets goals and focuses on accomplishment', 'Takes appropriate risks to reach tough goals'],
      resourcesForJobBusiness: ['CRM System Access', 'Sales Analytics Platform', 'Marketing Tools'],
      accessRights: ['Sales Database', 'Client Information System', 'Reporting Tools'],
      companyBenefits: ['Health Insurance', 'Performance Bonuses', 'Professional Development Budget'],
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
      reportsTo: 'Department Manager',
      employee: 'Jane Doe',
      jobPurpose: 'To develop and execute marketing campaigns that drive brand awareness and lead generation.',
      criticalDuties: [
        'Create and manage digital marketing campaigns',
        'Develop marketing content and materials'
      ],
      positionMainKpis: [
        'Campaign ROI above 15%',
        'Lead generation targets'
      ],
      jobDuties: [
        'Manage social media presence',
        'Create marketing reports'
      ],
      requirements: [
        'Bachelor degree in Marketing',
        'Experience with digital marketing tools'
      ],
      generalProfessionalCompetencies: ['Marketing Communications', 'Data Analysis'],
      technicalCompetencies: ['Sales performance KPIs management', 'Computer Data'],
      behavioralCompetencies: ['Focuses on high-priority actions and does not become distracted by lower-priority activities'],
      resourcesForJobBusiness: ['Marketing Tools', 'Communication Platforms'],
      accessRights: ['Marketing Platforms', 'Analytics Tools'],
      companyBenefits: ['Health Insurance', 'Flexible Work Hours', 'Training Programs'],
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
    
    // Validate required fields
    if (!formData.jobTitle || !formData.department || !formData.hierarchyGrade || !formData.jobPurpose) {
      alert('Please fill in all required fields');
      return;
    }

    // Filter out empty strings from array fields
    const cleanedFormData = {
      ...formData,
      criticalDuties: formData.criticalDuties.filter(duty => duty.trim() !== ''),
      positionMainKpis: formData.positionMainKpis.filter(kpi => kpi.trim() !== ''),
      jobDuties: formData.jobDuties.filter(duty => duty.trim() !== ''),
      requirements: formData.requirements.filter(req => req.trim() !== ''),
    };
    
    if (editingJob) {
      // Update existing job
      setJobDescriptions(prev => prev.map(job => 
        job.id === editingJob.id 
          ? { ...job, ...cleanedFormData, updatedAt: new Date().toISOString().split('T')[0] }
          : job
      ));
    } else {
      // Create new job
      const newJob = {
        id: Date.now(),
        ...cleanedFormData,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setJobDescriptions(prev => [...prev, newJob]);
    }
    
    resetForm();
    alert(editingJob ? 'Job description updated successfully!' : 'Job description created successfully!');
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
    setEditingJob(null);
    setActiveView('list');
  };

  // Handle edit
  const handleEdit = (job) => {
    setFormData(job);
    setEditingJob(job);
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
    if (formData[fieldName].length > 1) {
      setFormData(prev => ({
        ...prev,
        [fieldName]: prev[fieldName].filter((_, i) => i !== index)
      }));
    }
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
              <label key={option} className={`flex items-center px-3 py-2 hover:${bgCardHover} cursor-pointer`}>
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => onChange(fieldName, option)}
                  className="mr-2 text-almet-sapphire focus:ring-almet-sapphire"
                />
                <span className={`text-sm ${textPrimary}`}>{option}</span>
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };

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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <StatCard 
                title="Total Job Descriptions" 
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
                    {mockHeadcountData.departments.map(dept => (
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
                              title="View"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleEdit(job)}
                              className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
                              title="Edit"
                            >
                              <Edit size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(job.id)}
                              className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                              title="Delete"
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
                      <select
                        value={formData.jobTitle}
                        onChange={(e) => setFormData({...formData, jobTitle: e.target.value})}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                        required
                      >
                        <option value="">Select job title</option>
                        {mockHeadcountData.jobTitles.map(title => (
                          <option key={title} value={title}>{title}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Hierarchy & Grade <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.hierarchyGrade}
                        onChange={(e) => setFormData({...formData, hierarchyGrade: e.target.value})}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                        required
                      >
                        <option value="">Select grade</option>
                        {mockHeadcountData.hierarchyGrades.map(grade => (
                          <option key={grade} value={grade}>{grade}</option>
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
                        {mockHeadcountData.departments.map(dept => (
                          <option key={dept} value={dept}>{dept}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Reports To
                      </label>
                      <select
                        value={formData.reportsTo}
                        onChange={(e) => setFormData({...formData, reportsTo: e.target.value})}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                      >
                        <option value="">Select Position</option>
                        {mockHeadcountData.positions.map(position => (
                          <option key={position} value={position}>{position}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Employee
                      </label>
                      <select
                        value={formData.employee}
                        onChange={(e) => setFormData({...formData, employee: e.target.value})}
                        className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                      >
                        <option value="">Select Employee or Keep Blank</option>
                        {mockHeadcountData.employees.map(employee => (
                          <option key={employee} value={employee}>{employee}</option>
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
                      value={formData.jobPurpose}
                      onChange={(e) => setFormData({...formData, jobPurpose: e.target.value})}
                      rows="3"
                      className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                      placeholder="Describe the main purpose of this job..."
                      required
                    />
                  </div>

                  {/* Dynamic Array Fields */}
                  {[
                    { field: 'criticalDuties', label: 'Critical Duties', required: true },
                    { field: 'positionMainKpis', label: 'Position Main KPIs', required: true },
                    { field: 'jobDuties', label: 'Job Duties', required: true },
                    { field: 'requirements', label: 'Requirements', required: true }
                  ].map(({ field, label, required }) => (
                    <div key={field}>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        {label} {required && <span className="text-red-500">*</span>}
                      </label>
                      {formData[field].map((item, index) => (
                        <div key={index} className="flex items-start gap-2 mb-2">
                          <textarea
                            value={item}
                            onChange={(e) => handleArrayFieldChange(field, index, e.target.value)}
                            className={`flex-1 px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                            rows="2"
                            placeholder={`Enter ${label.toLowerCase()}...`}
                            required={required}
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
                        className="text-almet-sapphire hover:text-almet-astral font-medium text-sm flex items-center gap-1"
                      >
                        <Plus size={16} />
                        Add {label.slice(0, -1)}
                      </button>
                    </div>
                  ))}

                  {/* Multi-select Competencies */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        General Professional Competencies
                      </label>
                      <MultiSelect
                        options={mockCompetenciesData.generalProfessional}
                        selected={formData.generalProfessionalCompetencies}
                        onChange={handleMultiSelectChange}
                        placeholder="Select competencies..."
                        fieldName="generalProfessionalCompetencies"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Technical Competencies
                      </label>
                      <MultiSelect
                        options={mockCompetenciesData.technical}
                        selected={formData.technicalCompetencies}
                        onChange={handleMultiSelectChange}
                        placeholder="Select competencies..."
                        fieldName="technicalCompetencies"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Behavioral Competencies
                      </label>
                      <MultiSelect
                        options={mockCompetenciesData.behavioral}
                        selected={formData.behavioralCompetencies}
                        onChange={handleMultiSelectChange}
                        placeholder="Select competencies..."
                        fieldName="behavioralCompetencies"
                      />
                    </div>
                  </div>

                  {/* Resources and Access */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Resources for Job Business
                      </label>
                      <MultiSelect
                        options={mockResourcesData}
                        selected={formData.resourcesForJobBusiness}
                        onChange={handleMultiSelectChange}
                        placeholder="Select resources..."
                        fieldName="resourcesForJobBusiness"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Access Rights
                      </label>
                      <MultiSelect
                        options={mockAccessRightsData}
                        selected={formData.accessRights}
                        onChange={handleMultiSelectChange}
                        placeholder="Select access rights..."
                        fieldName="accessRights"
                      />
                    </div>
                    
                    <div>
                      <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                        Company Benefits
                      </label>
                      <MultiSelect
                        options={mockCompanyBenefitsData}
                        selected={formData.companyBenefits}
                        onChange={handleMultiSelectChange}
                        placeholder="Select benefits..."
                        fieldName="companyBenefits"
                      />
                    </div>
                  </div>

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

                  {/* Notes */}
                  <div className={`p-4 ${bgAccent} rounded-lg`}>
                    <div className="flex items-start gap-2">
                      <AlertCircle size={16} className="text-almet-sapphire mt-1 flex-shrink-0" />
                      <div>
                        <h4 className={`font-medium ${textPrimary} mb-1`}>Notes:</h4>
                        <p className={`text-sm ${textSecondary} mb-2`}>
                          The last two columns are action-oriented. Selected employees will see this in their profile and confirm it.
                        </p>
                        <p className={`text-sm ${textSecondary} mb-2`}>
                          Managers will see each of their employees separately in their profile and confirm them.
                        </p>
                        <p className={`text-sm ${textSecondary}`}>
                          It should be possible to view and download each of these as a document.
                        </p>
                      </div>
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
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          // Download as PDF functionality would go here
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                      <div>
                        <h4 className={`text-lg font-semibold ${textPrimary} mb-3`}>Company Benefits</h4>
                        <ul className={`list-disc list-inside space-y-1 ${textSecondary}`}>
                          {selectedJob.companyBenefits.map((benefit, index) => (
                            <li key={index}>{benefit}</li>
                          ))}
                        </ul>
                      </div>
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