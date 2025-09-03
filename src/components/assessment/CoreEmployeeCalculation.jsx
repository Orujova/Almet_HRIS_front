'use client';
import React, { useState, useEffect } from 'react';
import { 
  Plus, Target, Search, Filter, Eye, Edit, Trash2, 
  Download, FileText, Calendar, Award, AlertCircle, CheckCircle,
  Loader2, X, Save, ChevronDown, ChevronRight, User, Building,
  TrendingUp, TrendingDown, Minus, Info
} from 'lucide-react';
import { assessmentApi } from '@/services/assessmentApi';
import { competencyApi } from '@/services/competencyApi';

const CoreEmployeeCalculation = () => {
  // States
  const [activeTab, setActiveTab] = useState('employee');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Modal states
  const [showCreatePositionModal, setShowCreatePositionModal] = useState(false);
  const [showCreateEmployeeModal, setShowCreateEmployeeModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCoreScalesInfo, setShowCoreScalesInfo] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  
  // Data states
  const [positionAssessments, setPositionAssessments] = useState([]);
  const [employeeAssessments, setEmployeeAssessments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [positionGroups, setPositionGroups] = useState([]);
  const [coreScales, setCoreScales] = useState([]);
  const [skillGroups, setSkillGroups] = useState([]);
  const [jobTitles, setJobTitles] = useState([]);
  
  // Form states
  const [positionFormData, setPositionFormData] = useState({
    position_group: '',
    job_title: '',
    competency_ratings: []
  });
  
  const [employeeFormData, setEmployeeFormData] = useState({
    employee: '',
    position_assessment: '',
    assessment_date: new Date().toISOString().split('T')[0],
    notes: '',
    competency_ratings: []
  });

  // SearchableDropdown Component
  const SearchableDropdown = ({ 
    options, 
    value, 
    onChange, 
    placeholder, 
    displayKey = 'name', 
    valueKey = 'id',
    disabled = false 
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    
    const filteredOptions = options.filter(option =>
      option[displayKey]?.toLowerCase().includes(searchValue.toLowerCase())
    );
    
    const selectedOption = options.find(opt => opt[valueKey] === value);
    
    return (
      <div className="relative">
        <button
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-left flex items-center justify-between ${
            disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white hover:border-blue-500'
          } focus:border-blue-500 focus:outline-none`}
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {selectedOption ? selectedOption[displayKey] : placeholder}
          </span>
          <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div className="p-2">
              <input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="max-h-40 overflow-y-auto">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <button
                    key={option[valueKey]}
                    onClick={() => {
                      onChange(option[valueKey]);
                      setIsOpen(false);
                      setSearchValue('');
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                  >
                    {option[displayKey]}
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500 text-sm">No options found</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Job Title Dropdown (for string values)
  const JobTitleDropdown = ({ value, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    
    const filteredTitles = jobTitles.filter(title =>
      title?.toLowerCase().includes(searchValue.toLowerCase())
    );
    
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-left flex items-center justify-between bg-white hover:border-blue-500 focus:border-blue-500 focus:outline-none"
        >
          <span className={value ? 'text-gray-900' : 'text-gray-500'}>
            {value || placeholder}
          </span>
          <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            <div className="p-2">
              <input
                type="text"
                placeholder="Search job titles..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="max-h-40 overflow-y-auto">
              {filteredTitles.length > 0 ? (
                filteredTitles.map((title, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      onChange(title);
                      setIsOpen(false);
                      setSearchValue('');
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                  >
                    {title}
                  </button>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-500 text-sm">No job titles found</div>
              )}
            </div>
          </div>
        )}
      </div>
    );
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
        coreScalesRes,
        skillGroupsRes
      ] = await Promise.all([
        assessmentApi.positionCore.getAll(),
        assessmentApi.employeeCore.getAll(),
        assessmentApi.employees.getAll(),
        assessmentApi.positionGroups.getAll(),
        assessmentApi.coreScales.getAll(),
        competencyApi.skillGroups.getAll()
      ]);
      
      setPositionAssessments(positionAssessmentsRes.results || []);
      setEmployeeAssessments(employeeAssessmentsRes.results || []);
      setEmployees(employeesRes.results || []);
      setPositionGroups(positionGroupsRes.results || []);
      setCoreScales(coreScalesRes.results || []);
      setSkillGroups(skillGroupsRes.results || []);
      
      // Extract unique job titles from employees
      const uniqueJobTitles = [...new Set(employeesRes.results?.map(emp => emp.job_title).filter(Boolean))];
      setJobTitles(uniqueJobTitles);
      
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

  // Auto-select position assessment based on employee
  const handleEmployeeChange = async (employeeId) => {
    setEmployeeFormData({...employeeFormData, employee: employeeId});
    
    // Find selected employee
    const selectedEmployee = employees.find(e => e.id === employeeId);
    if (!selectedEmployee) return;
    
    // Try to find matching position assessment by job title and position group
    let matchingPosition = positionAssessments.find(p => 
      p.job_title?.toLowerCase() === selectedEmployee.job_title?.toLowerCase()
    );
    
    // If no exact job title match, try to get position assessment for this employee from API
    if (!matchingPosition) {
      try {
        const response = await assessmentApi.positionCore.getForEmployee(employeeId);
        if (response.assessment_template) {
          matchingPosition = response.assessment_template;
        }
      } catch (err) {
        console.error('Error fetching employee position template:', err);
      }
    }
    
    if (matchingPosition) {
      setEmployeeFormData(prev => ({
        ...prev, 
        employee: employeeId,
        position_assessment: matchingPosition.id
      }));
    } else {
      setEmployeeFormData(prev => ({
        ...prev, 
        employee: employeeId,
        position_assessment: ''
      }));
    }
  };

  // Helper components
  const ActionButton = ({ onClick, icon: Icon, label, variant = 'primary', loading = false, disabled = false, size = 'sm' }) => {
    const variants = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
      success: 'bg-green-500 hover:bg-green-600 text-white',
      danger: 'bg-red-500 hover:bg-red-600 text-white',
      warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
      outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white',
      info: 'bg-blue-500 hover:bg-blue-600 text-white'
    };

    const sizes = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm'
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`
          flex items-center gap-2 rounded-lg font-medium
          transition-all duration-200 hover:shadow-md ${variants[variant]} ${sizes[size]}
          ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
        {label}
      </button>
    );
  };

  const StatusBadge = ({ status }) => {
    const statusConfig = {
      'DRAFT': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Draft' },
      'COMPLETED': { color: 'bg-green-100 text-green-800 border-green-200', label: 'Completed' }
    };

    const config = statusConfig[status] || statusConfig['DRAFT'];
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const GapIndicator = ({ gap }) => {
    if (gap > 0) {
      return (
        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
          <TrendingUp size={12} />
          +{gap}
        </span>
      );
    } else if (gap < 0) {
      return (
        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
          <TrendingDown size={12} />
          {gap}
        </span>
      );
    } else {
      return (
        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
          <Minus size={12} />
          0
        </span>
      );
    }
  };

  const CompletionIndicator = ({ percentage }) => {
    const numPercentage = parseFloat(percentage) || 0;
    let colorClass = 'bg-red-100 text-red-800 border-red-200';
    
    if (numPercentage >= 100) {
      colorClass = 'bg-green-100 text-green-800 border-green-200';
    } else if (numPercentage >= 80) {
      colorClass = 'bg-blue-100 text-blue-800 border-blue-200';
    } else if (numPercentage >= 60) {
      colorClass = 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${colorClass}`}>
        {numPercentage.toFixed(0)}%
      </span>
    );
  };

  // Handle position assessment creation
  const handleCreatePositionAssessment = async () => {
    if (!positionFormData.position_group || !positionFormData.job_title || positionFormData.competency_ratings.length === 0) {
      setError({ message: 'Please fill all required fields and add at least one competency rating' });
      return;
    }

    setIsSubmitting(true);
    try {
      await assessmentApi.positionCore.create(positionFormData);
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

  // Handle employee assessment creation
  const handleCreateEmployeeAssessment = async () => {
    if (!employeeFormData.employee || !employeeFormData.position_assessment) {
      setError({ message: 'Please select employee and position assessment' });
      return;
    }

    setIsSubmitting(true);
    try {
      const data = {
        ...employeeFormData,
        action_type: 'save_draft'
      };
      await assessmentApi.employeeCore.create(data);
      await fetchData();
      setShowCreateEmployeeModal(false);
      setEmployeeFormData({
        employee: '',
        position_assessment: '',
        assessment_date: new Date().toISOString().split('T')[0],
        notes: '',
        competency_ratings: []
      });
      setSuccessMessage('Employee assessment created successfully');
    } catch (err) {
      console.error('Error creating employee assessment:', err);
      setError(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle export
  const handleExport = async (id, type) => {
    try {
      if (type === 'employee') {
        await assessmentApi.employeeCore.exportDocument(id);
        setSuccessMessage('Assessment exported successfully');
      }
    } catch (err) {
      console.error('Export error:', err);
      setError(err);
    }
  };

  // Handle delete
  const handleDelete = async (id, type) => {
    if (!confirm('Are you sure you want to delete this assessment?')) return;
    
    try {
      if (type === 'position') {
        await assessmentApi.positionCore.delete(id);
      } else {
        await assessmentApi.employeeCore.delete(id);
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

  // Success Toast
  const SuccessToast = ({ message, onClose }) => {
    useEffect(() => {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }, [onClose]);

    return (
      <div className="fixed bottom-6 right-6 bg-green-50 border-2 border-green-200 rounded-xl p-4 shadow-2xl z-50 max-w-sm">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-green-800 font-bold text-sm">Success!</h4>
            <p className="text-green-700 text-sm mt-1">{message}</p>
          </div>
          <button onClick={onClose} className="text-green-600 hover:text-green-800">
            <X size={16} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="bg-white rounded-xl p-1.5 shadow-lg border-2 border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('position')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'position'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Building size={16} />
            <div className="text-left">
              <div className="text-sm font-semibold">Position Assessment Templates</div>
              <div className="text-xs opacity-75">Define skill requirements for positions</div>
            </div>
          </button>
          
          <button
            onClick={() => setActiveTab('employee')}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              activeTab === 'employee'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            <Target size={16} />
            <div className="text-left">
              <div className="text-sm font-semibold">Employee Assessments</div>
              <div className="text-xs opacity-75">Assess individual employee skills</div>
            </div>
          </button>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-xl p-4 shadow-lg border-2 border-gray-200">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder={`Search ${activeTab === 'position' ? 'positions' : 'employees'}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg text-sm bg-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            {activeTab === 'employee' && (
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg text-sm bg-white focus:border-blue-500 focus:outline-none min-w-40"
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
      {isLoading ? (
        <div className="bg-white rounded-xl p-8 text-center border-2 border-gray-200">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading assessments...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
          {activeTab === 'position' ? (
            // Position Assessments Table
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900 text-sm">Position Group</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900 text-sm">Job Title</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900 text-sm">Skills</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900 text-sm">Created</th>
                    <th className="text-center px-6 py-4 font-semibold text-gray-900 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPositionAssessments.length > 0 ? (
                    filteredPositionAssessments.map((assessment) => (
                      <tr key={assessment.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-gray-900 font-medium">
                          {assessment.position_group_name}
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {assessment.job_title}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {assessment.competency_ratings?.length || 0} skills
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {new Date(assessment.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <ActionButton
                              onClick={() => {
                                setSelectedAssessment(assessment);
                                setShowViewModal(true);
                              }}
                              icon={Eye}
                              label="View"
                              variant="outline"
                              size="xs"
                            />
                            <ActionButton
                              onClick={() => handleDelete(assessment.id, 'position')}
                              icon={Trash2}
                              label="Delete"
                              variant="danger"
                              size="xs"
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-12">
                        <Building className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
                        <p className="text-gray-600 font-medium">No position templates found</p>
                        <p className="text-gray-500 text-sm mt-2">Create your first position assessment template</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Create Position Assessment Modal */}
      {showCreatePositionModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-6xl border-2 border-gray-200 shadow-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <Building className="w-5 h-5 text-blue-600" />
                Create Core Competency Position Template
              </h3>
              <button
                onClick={() => setShowCreatePositionModal(false)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position Group <span className="text-red-500">*</span>
                </label>
                <SearchableDropdown
                  options={positionGroups}
                  value={positionFormData.position_group}
                  onChange={(value) => setPositionFormData({...positionFormData, position_group: value})}
                  placeholder="Select Position Group"
                  displayKey="name"
                  valueKey="id"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <JobTitleDropdown
                  value={positionFormData.job_title}
                  onChange={(value) => setPositionFormData({...positionFormData, job_title: value})}
                  placeholder="Select Job Title"
                />
              </div>
            </div>

            {/* Core Scales Information Button */}
            <div className="mb-4 flex justify-center">
              <ActionButton
                onClick={() => setShowCoreScalesInfo(true)}
                icon={Info}
                label="View Core Competency Assessment Scale Information"
                variant="info"
                size="md"
              />
            </div>

            {/* Skills Matrix Table */}
            <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-blue-900 text-white p-3">
                <h4 className="font-bold text-center">Core Competency Assessment Matrix</h4>
              </div>
              
              {/* Table Header */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-100 border-b">
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 min-w-48">
                        LIST OF SKILLS / ASSESSMENT SCALE
                      </th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-900 min-w-32">
                        POSITION ASSESSMENT
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900 min-w-64">
                        DESCRIPTION
                      </th>
                    </tr>
                  </thead>
                  
                  {/* Skills by Groups */}
                  <tbody>
                    {skillGroups.length > 0 ? skillGroups.map(group => (
                      <React.Fragment key={group.id}>
                        <tr className="bg-blue-900 text-white">
                          <td colSpan="3" className="px-4 py-2 font-bold text-center uppercase">
                            {group.name}
                          </td>
                        </tr>
                        
                        {/* Group skills */}
                        {group.skills && group.skills.length > 0 ? group.skills.map(skill => (
                          <tr key={skill.id} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-900">
                              {skill.name}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <select
                                value={positionFormData.competency_ratings.find(r => r.skill_id === skill.id)?.required_level || ''}
                                onChange={(e) => {
                                  const newRatings = [...positionFormData.competency_ratings];
                                  const existingIndex = newRatings.findIndex(r => r.skill_id === skill.id);
                                  
                                  if (existingIndex >= 0) {
                                    if (e.target.value) {
                                      newRatings[existingIndex].required_level = parseInt(e.target.value);
                                    } else {
                                      newRatings.splice(existingIndex, 1);
                                    }
                                  } else if (e.target.value) {
                                    newRatings.push({
                                      skill_id: skill.id,
                                      required_level: parseInt(e.target.value)
                                    });
                                  }
                                  
                                  setPositionFormData({...positionFormData, competency_ratings: newRatings});
                                }}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-center focus:border-blue-500 focus:outline-none"
                              >
                                <option value="">-</option>
                                {coreScales.map(scale => (
                                  <option key={scale.id} value={scale.scale}>{scale.scale}</option>
                                ))}
                              </select>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {skill.description || 'No description available'}
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="3" className="px-4 py-3 text-center text-gray-500 text-sm">
                              No skills found for this group
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    )) : (
                      <tr>
                        <td colSpan="3" className="px-4 py-8 text-center text-gray-500">
                          <div className="flex flex-col items-center">
                            <AlertCircle className="w-8 h-8 mb-2 text-gray-400" />
                            <p className="font-medium">No skill groups available</p>
                            <p className="text-sm">Please configure skill groups first</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t-2 border-gray-200">
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

      {/* Core Scales Information Modal */}
      {showCoreScalesInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl border-2 border-gray-200 shadow-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <Info className="w-5 h-5 text-blue-600" />
                Core Competency Assessment Scale Information
              </h3>
              <button
                onClick={() => setShowCoreScalesInfo(false)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-3">Assessment Scale Definitions</h4>
                <div className="space-y-3">
                  {coreScales.length > 0 ? coreScales.map(scale => (
                    <div key={scale.id} className="bg-white p-3 rounded border">
                      <div className="flex items-start gap-3">
                        <span className="bg-blue-600 text-white px-2 py-1 rounded font-bold text-sm min-w-8 text-center">
                          {scale.scale}
                        </span>
                        <div>
                          <p className="text-gray-900 font-medium">{scale.description}</p>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-gray-500 text-center py-4">
                      <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <p>No core scales configured</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">How to Use</h4>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    Select the appropriate scale level for each skill based on the position requirements
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    Higher numbers indicate higher skill level requirements
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></span>
                    Leave blank (-) for skills that are not required for this position
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
              <ActionButton
                onClick={() => setShowCoreScalesInfo(false)}
                icon={CheckCircle}
                label="Got it"
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
          <div className="bg-white rounded-xl p-6 w-full max-w-7xl border-2 border-gray-200 shadow-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                <User className="w-5 h-5 text-blue-600" />
                Create Employee Core Competency Assessment
              </h3>
              <button
                onClick={() => setShowCreateEmployeeModal(false)}
                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            {/* Employee Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee <span className="text-red-500">*</span>
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position Template <span className="text-red-500">*</span>
                </label>
                <SearchableDropdown
                  options={positionAssessments}
                  value={employeeFormData.position_assessment}
                  onChange={(value) => setEmployeeFormData({...employeeFormData, position_assessment: value})}
                  placeholder="Select Position Template"
                  displayKey="job_title"
                  valueKey="id"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assessment Date
                </label>
                <input
                  type="date"
                  value={employeeFormData.assessment_date}
                  onChange={(e) => setEmployeeFormData({...employeeFormData, assessment_date: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              
              <div className="md:col-span-3">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assessment Notes
                </label>
                <textarea
                  value={employeeFormData.notes}
                  onChange={(e) => setEmployeeFormData({...employeeFormData, notes: e.target.value})}
                  placeholder="Enter assessment notes and observations..."
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm resize-none bg-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Assessment Matrix Table */}
            {employeeFormData.position_assessment && (
              <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-blue-900 text-white p-3">
                  <h4 className="font-bold text-center">Employee Core Competency Assessment Matrix</h4>
                  <p className="text-center text-sm opacity-90">
                    Based on: {positionAssessments.find(p => p.id === employeeFormData.position_assessment)?.job_title}
                  </p>
                </div>
                
                {/* Assessment Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100 border-b">
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 min-w-48">
                          CORE COMPETENCIES / SKILLS
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-900 min-w-24">
                          REQUIRED
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-900 min-w-24">
                          ACTUAL
                        </th>
                        <th className="px-4 py-3 text-center font-semibold text-gray-900 min-w-24">
                          GAP
                        </th>
                        <th className="px-4 py-3 text-left font-semibold text-gray-900 min-w-64">
                          ASSESSMENT NOTES
                        </th>
                      </tr>
                    </thead>
                    
                    <tbody>
                      {/* Scale descriptions */}
                      <tr className="bg-blue-50">
                        <td colSpan="5" className="px-4 py-2">
                          <div className="text-sm text-gray-700 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {coreScales.map(scale => (
                              <div key={scale.id}>
                                <span className="font-medium">"{scale.scale}"</span> - {scale.description}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>

                      {/* Selected position's skills */}
                      {(() => {
                        const selectedPosition = positionAssessments.find(p => p.id === employeeFormData.position_assessment);
                        if (!selectedPosition) return null;

                        // Group skills by group name
                        const groupedSkills = {};
                        selectedPosition.competency_ratings?.forEach(rating => {
                          const groupName = rating.skill_group_name || 'Other';
                          if (!groupedSkills[groupName]) {
                            groupedSkills[groupName] = [];
                          }
                          groupedSkills[groupName].push(rating);
                        });

                        return Object.entries(groupedSkills).map(([groupName, skills]) => (
                          <React.Fragment key={groupName}>
                            <tr className="bg-blue-900 text-white">
                              <td colSpan="5" className="px-4 py-2 font-bold text-center uppercase">
                                {groupName}
                              </td>
                            </tr>
                            
                            {skills.map(skill => {
                              const employeeRating = employeeFormData.competency_ratings.find(
                                r => r.skill_id === skill.skill
                              );
                              
                              const actualLevel = employeeRating?.actual_level || 0;
                              const gap = actualLevel - skill.required_level;
                              
                              return (
                                <tr key={skill.id} className="border-b hover:bg-gray-50">
                                  <td className="px-4 py-3 font-medium text-gray-900">
                                    {skill.skill_name}
                                  </td>
                                  <td className="px-4 py-3 text-center font-bold text-blue-600">
                                    {skill.required_level}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <select
                                      value={actualLevel}
                                      onChange={(e) => {
                                        const newRatings = [...employeeFormData.competency_ratings];
                                        const existingIndex = newRatings.findIndex(
                                          r => r.skill_id === skill.skill
                                        );
                                        
                                        if (existingIndex >= 0) {
                                          newRatings[existingIndex].actual_level = parseInt(e.target.value);
                                        } else {
                                          newRatings.push({
                                            skill_id: skill.skill,
                                            actual_level: parseInt(e.target.value),
                                            notes: ''
                                          });
                                        }
                                        
                                        setEmployeeFormData({
                                          ...employeeFormData, 
                                          competency_ratings: newRatings
                                        });
                                      }}
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-center font-bold focus:border-blue-500 focus:outline-none"
                                    >
                                      {coreScales.map(scale => (
                                        <option key={scale.id} value={scale.scale}>{scale.scale}</option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                                      gap > 0 ? 'bg-green-100 text-green-800' :
                                      gap < 0 ? 'bg-red-100 text-red-800' :
                                      'bg-blue-100 text-blue-800'
                                    }`}>
                                      {gap > 0 ? `+${gap}` : gap}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <textarea
                                      value={employeeRating?.notes || ''}
                                      onChange={(e) => {
                                        const newRatings = [...employeeFormData.competency_ratings];
                                        const existingIndex = newRatings.findIndex(
                                          r => r.skill_id === skill.skill
                                        );
                                        
                                        if (existingIndex >= 0) {
                                          newRatings[existingIndex].notes = e.target.value;
                                        } else {
                                          newRatings.push({
                                            skill_id: skill.skill,
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
                                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none focus:border-blue-500 focus:outline-none"
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
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t-2 border-gray-200">
              <ActionButton
                onClick={() => setShowCreateEmployeeModal(false)}
                icon={X}
                label="Cancel"
                disabled={isSubmitting}
                variant="outline"
                size="md"
              />
              <ActionButton
                onClick={handleCreateEmployeeAssessment}
                icon={Save}
                label="Create Assessment"
                disabled={!employeeFormData.employee || !employeeFormData.position_assessment}
                loading={isSubmitting}
                variant="primary"
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
        <div className="fixed bottom-6 right-6 bg-red-50 border-2 border-red-200 rounded-xl p-4 shadow-2xl z-50 max-w-sm">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-red-800 font-bold text-sm">Error</h4>
              <p className="text-red-700 text-sm mt-1">{error.message}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoreEmployeeCalculation;
                </tbody>
              </table>
            </div>
          ) : (
            // Employee Assessments Table
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b-2 border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900 text-sm">Employee</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900 text-sm">Position</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900 text-sm">Status</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900 text-sm">Gap Score</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900 text-sm">Completion</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-900 text-sm">Date</th>
                    <th className="text-center px-6 py-4 font-semibold text-gray-900 text-sm">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployeeAssessments.length > 0 ? (
                    filteredEmployeeAssessments.map((assessment) => (
                      <tr key={assessment.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 text-gray-900 font-medium">
                          <div>
                            <div>{assessment.employee_name}</div>
                            <div className="text-xs text-gray-500">ID: {assessment.employee_id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {assessment.position_assessment_title}
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={assessment.status} />
                        </td>
                        <td className="px-6 py-4">
                          <GapIndicator gap={assessment.gap_score || 0} />
                        </td>
                        <td className="px-6 py-4">
                          <CompletionIndicator percentage={assessment.completion_percentage} />
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-sm">
                          {new Date(assessment.assessment_date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <ActionButton
                              onClick={() => {
                                setSelectedAssessment(assessment);
                                setShowViewModal(true);
                              }}
                              icon={Eye}
                              label="View"
                              variant="outline"
                              size="xs"
                            />
                            <ActionButton
                              onClick={() => handleExport(assessment.id, 'employee')}
                              icon={Download}
                              label="Export"
                              variant="secondary"
                              size="xs"
                            />
                            <ActionButton
                              onClick={() => handleDelete(assessment.id, 'employee')}
                              icon={Trash2}
                              label="Delete"
                              variant="danger"
                              size="xs"
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="text-center py-12">
                        <Target className="w-12 h-12 mx-auto mb-4 text-gray-400 opacity-50" />
                        <p className="text-gray-600 font-medium">No employee assessments found</p>
                        <p className="text-gray-500 text-sm mt-2">Create your first employee assessment</p>
                      </td>
                    </tr>
                  )}