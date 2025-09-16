// components/jobDescription/EmployeeSelectionModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  X, 
  Users, 
  UserCheck, 
  ChevronDown, 
  ChevronUp,
  Search,
  AlertCircle,
  CheckCircle,
  User,
  Building,
  Briefcase,
  Target
} from 'lucide-react';

const EmployeeSelectionModal = ({
  isOpen,
  onClose,
  eligibleEmployees = [],
  jobCriteria = {},
  onEmployeeSelect,
  loading = false,
  darkMode = false
}) => {
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedEmployee, setExpandedEmployee] = useState(null);
  const [selectAll, setSelectAll] = useState(false);

  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const bgModal = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";
  const bgAccent = darkMode ? "bg-almet-comet" : "bg-almet-mystic";

  // Reset selections when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setSelectedEmployees([]);
      setSearchTerm('');
      setSelectAll(false);
      setExpandedEmployee(null);
    }
  }, [isOpen]);

  // Filter employees based on search
  const filteredEmployees = eligibleEmployees.filter(emp => 
    emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle individual employee selection
  const handleEmployeeToggle = (employeeId) => {
    setSelectedEmployees(prev => {
      const isSelected = prev.includes(employeeId);
      const newSelection = isSelected 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId];
      
      // Update select all state
      setSelectAll(newSelection.length === filteredEmployees.length);
      
      return newSelection;
    });
  };

  // Handle select all toggle
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees([]);
      setSelectAll(false);
    } else {
      setSelectedEmployees(filteredEmployees.map(emp => emp.id));
      setSelectAll(true);
    }
  };

  // Handle employee details toggle
  const toggleEmployeeDetails = (employeeId) => {
    setExpandedEmployee(prev => prev === employeeId ? null : employeeId);
  };

  // Handle final selection
  const handleConfirmSelection = () => {
    if (selectedEmployees.length === 0) {
      alert('Please select at least one employee');
      return;
    }

    const selectedEmployeeData = eligibleEmployees.filter(emp => 
      selectedEmployees.includes(emp.id)
    );

    onEmployeeSelect(selectedEmployees, selectedEmployeeData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${bgModal} rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden border ${borderColor} shadow-xl`}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-almet-comet">
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-xl font-bold ${textPrimary} mb-2`}>
                Select Employees for Job Assignment
              </h2>
              <p className={`${textSecondary} text-sm`}>
                {eligibleEmployees.length} employees match your job criteria. 
                Select which employees should receive job descriptions.
              </p>
            </div>
            <button
              onClick={onClose}
              className={`p-2 ${textMuted} hover:${textPrimary} transition-colors rounded-lg`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Job Criteria Display */}
        <div className={`p-4 ${bgAccent} border-b ${borderColor}`}>
          <h3 className={`text-sm font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
            <Target size={14} />
            Job Criteria
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            {jobCriteria.job_title && (
              <div>
                <span className={`font-medium ${textMuted}`}>Job Title:</span>
                <span className={`${textPrimary} ml-2`}>{jobCriteria.job_title}</span>
              </div>
            )}
            {jobCriteria.business_function?.name && (
              <div>
                <span className={`font-medium ${textMuted}`}>Business Function:</span>
                <span className={`${textPrimary} ml-2`}>{jobCriteria.business_function.name}</span>
              </div>
            )}
            {jobCriteria.department?.name && (
              <div>
                <span className={`font-medium ${textMuted}`}>Department:</span>
                <span className={`${textPrimary} ml-2`}>{jobCriteria.department.name}</span>
              </div>
            )}
            {jobCriteria.job_function?.name && (
              <div>
                <span className={`font-medium ${textMuted}`}>Job Function:</span>
                <span className={`${textPrimary} ml-2`}>{jobCriteria.job_function.name}</span>
              </div>
            )}
            {jobCriteria.position_group?.name && (
              <div>
                <span className={`font-medium ${textMuted}`}>Position Group:</span>
                <span className={`${textPrimary} ml-2`}>{jobCriteria.position_group.name}</span>
              </div>
            )}
            {jobCriteria.grading_level && (
              <div>
                <span className={`font-medium ${textMuted}`}>Grading Level:</span>
                <span className={`${textPrimary} ml-2`}>{jobCriteria.grading_level}</span>
              </div>
            )}
          </div>
        </div>

        {/* Search and Controls */}
        <div className="p-4 border-b border-gray-200 dark:border-almet-comet">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textMuted}`} size={16} />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} 
                  focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-sm`}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="selectAll"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-almet-sapphire focus:ring-almet-sapphire"
                />
                <label htmlFor="selectAll" className={`text-sm ${textSecondary}`}>
                  Select All ({filteredEmployees.length})
                </label>
              </div>

              <div className={`text-sm ${textSecondary}`}>
                {selectedEmployees.length} selected
              </div>
            </div>
          </div>
        </div>

        {/* Employee List */}
        <div className="flex-1 overflow-y-auto p-4 max-h-96">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-almet-sapphire"></div>
              <span className={`ml-3 ${textSecondary}`}>Loading employees...</span>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <Users className={`mx-auto h-12 w-12 ${textMuted} mb-4`} />
              <h3 className={`text-lg font-semibold ${textPrimary} mb-2`}>
                {searchTerm ? 'No employees found' : 'No eligible employees'}
              </h3>
              <p className={`${textMuted}`}>
                {searchTerm 
                  ? `No employees match "${searchTerm}"`
                  : 'No employees match the job criteria'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEmployees.map((employee) => {
                const isSelected = selectedEmployees.includes(employee.id);
                const isExpanded = expandedEmployee === employee.id;

                return (
                  <div 
                    key={employee.id}
                    className={`border ${borderColor} rounded-lg overflow-hidden transition-all duration-200 ${
                      isSelected ? 'border-almet-sapphire bg-blue-50 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    {/* Employee Summary */}
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 flex-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleEmployeeToggle(employee.id)}
                            className="rounded border-gray-300 text-almet-sapphire focus:ring-almet-sapphire"
                          />
                          
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${isSelected ? 'bg-almet-sapphire text-white' : `${bgAccent} ${textPrimary}`}`}>
                              <User size={16} />
                            </div>
                            <div>
                              <h4 className={`font-semibold ${textPrimary} text-sm`}>
                                {employee.full_name}
                              </h4>
                              <div className={`${textSecondary} text-xs space-y-1`}>
                                <p>ID: {employee.employee_id} • {employee.job_title}</p>
                                <div className="flex items-center gap-1">
                                  <Building size={10} />
                                  <span>{employee.department_name}</span>
                                  {employee.unit_name && (
                                    <>
                                      <span>•</span>
                                      <span>{employee.unit_name}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {employee.has_line_manager && (
                            <div className="flex items-center gap-1 text-green-600 text-xs">
                              <CheckCircle size={12} />
                              <span>Has Manager</span>
                            </div>
                          )}
                          
                          <button
                            onClick={() => toggleEmployeeDetails(employee.id)}
                            className={`p-2 ${textMuted} hover:${textPrimary} transition-colors rounded-lg`}
                          >
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Employee Details (Expanded) */}
                    {isExpanded && (
                      <div className={`px-4 pb-4 border-t ${borderColor} ${bgAccent}`}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-4">
                          <div>
                            <h5 className={`font-semibold ${textSecondary} mb-2`}>Contact Information</h5>
                            <div className="space-y-1">
                              <p><span className={`font-medium ${textMuted}`}>Phone:</span> <span className={textPrimary}>{employee.phone || 'N/A'}</span></p>
                              <p><span className={`font-medium ${textMuted}`}>Email:</span> <span className={textPrimary}>{employee.email || 'N/A'}</span></p>
                            </div>
                          </div>
                          
                          <div>
                            <h5 className={`font-semibold ${textSecondary} mb-2`}>Organization</h5>
                            <div className="space-y-1">
                              <p><span className={`font-medium ${textMuted}`}>Business Function:</span> <span className={textPrimary}>{employee.business_function_name}</span></p>
                              <p><span className={`font-medium ${textMuted}`}>Job Function:</span> <span className={textPrimary}>{employee.job_function_name}</span></p>
                              <p><span className={`font-medium ${textMuted}`}>Position Group:</span> <span className={textPrimary}>{employee.position_group_name}</span></p>
                              <p><span className={`font-medium ${textMuted}`}>Grading Level:</span> <span className={textPrimary}>{employee.grading_level}</span></p>
                            </div>
                          </div>

                          <div>
                            <h5 className={`font-semibold ${textSecondary} mb-2`}>Reporting</h5>
                            <div className="space-y-1">
                              <p><span className={`font-medium ${textMuted}`}>Line Manager:</span> 
                                <span className={textPrimary}> {employee.line_manager_name || 'None'}</span>
                              </p>
                              {employee.organizational_path && (
                                <p><span className={`font-medium ${textMuted}`}>Path:</span> <span className={textPrimary}>{employee.organizational_path}</span></p>
                              )}
                            </div>
                          </div>

                          <div>
                            <h5 className={`font-semibold ${textSecondary} mb-2`}>Matching</h5>
                            <div className="space-y-1">
                              <p><span className={`font-medium ${textMuted}`}>Score:</span> <span className={textPrimary}>{employee.matching_score || 100}%</span></p>
                              <div className="flex items-center gap-1">
                                <CheckCircle size={12} className="text-green-600" />
                                <span className="text-green-600">Perfect Match</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`p-4 border-t ${borderColor} ${bgAccent}`}>
          <div className="flex items-center justify-between">
            <div className={`text-sm ${textSecondary}`}>
              {selectedEmployees.length > 0 && (
                <>
                  <span className="font-semibold text-almet-sapphire">{selectedEmployees.length}</span>
                  <span> employee{selectedEmployees.length === 1 ? '' : 's'} selected.</span>
                  <span className="ml-2">Each will receive a separate job description.</span>
                </>
              )}
              {selectedEmployees.length === 0 && (
                <span>Select employees to create job descriptions for.</span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className={`px-4 py-2 border ${borderColor} rounded-lg ${textSecondary} hover:${textPrimary} 
                  transition-colors text-sm`}
              >
                Cancel
              </button>
              
              <button
                onClick={handleConfirmSelection}
                disabled={selectedEmployees.length === 0 || loading}
                className="px-6 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral 
                  transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium
                  flex items-center gap-2"
              >
                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                Create Job Descriptions ({selectedEmployees.length})
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSelectionModal;