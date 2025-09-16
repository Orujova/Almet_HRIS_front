// src/components/headcount/VacantPositionModal.jsx
import { useState, useEffect } from 'react';
import { useReferenceData } from '../../hooks/useReferenceData';
import { X, Save, AlertCircle } from 'lucide-react';

const VacantPositionModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  mode = 'create', // 'create' or 'edit'
  initialData = null,
  darkMode = false 
}) => {
  // Reference data
  const {
    businessFunctions,
    departments,
    units,
    jobFunctions,
    positionGroups,
    employees, // For reporting_to field
    loading: refLoading
  } = useReferenceData();

  // Form state
  const [formData, setFormData] = useState({
    business_function: '',
    department: '',
    unit: '',
    job_function: '',
    position_group: '',
    job_title: '',
    grading_level: '',
    reporting_to: '',
    is_visible_in_org_chart: true,
    include_in_headcount: true,
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Theme styles
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-600";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const bgModal = darkMode ? "bg-gray-800" : "bg-white";
  const bgInput = darkMode ? "bg-gray-700" : "bg-white";
  const borderColor = darkMode ? "border-gray-600" : "border-gray-300";

  // Grading levels options
  const gradingLevels = [
    { value: '_LD', label: 'Lower Decile (-LD)' },
    { value: '_LQ', label: 'Lower Quartile (-LQ)' },
    { value: '_M', label: 'Median (-M)' },
    { value: '_UQ', label: 'Upper Quartile (-UQ)' },
    { value: '_UD', label: 'Upper Decile (-UD)' }
  ];

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && initialData) {
        setFormData({
          business_function: initialData.business_function_detail?.id || '',
          department: initialData.department_detail?.id || '',
          unit: initialData.unit_detail?.id || '',
          job_function: initialData.job_function_detail?.id || '',
          position_group: initialData.position_group_detail?.id || '',
          job_title: initialData.job_title || '',
          grading_level: initialData.grading_level || '',
          reporting_to: initialData.reporting_to_detail?.id || '',
          is_visible_in_org_chart: initialData.is_visible_in_org_chart !== false,
          include_in_headcount: initialData.include_in_headcount !== false,
          notes: initialData.notes || ''
        });
      } else {
        // Reset form for create mode
        setFormData({
          business_function: '',
          department: '',
          unit: '',
          job_function: '',
          position_group: '',
          job_title: '',
          grading_level: '',
          reporting_to: '',
          is_visible_in_org_chart: true,
          include_in_headcount: true,
          notes: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, mode, initialData]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.business_function) newErrors.business_function = 'Business function is required';
    if (!formData.department) newErrors.department = 'Department is required';
    if (!formData.job_function) newErrors.job_function = 'Job function is required';
    if (!formData.position_group) newErrors.position_group = 'Position group is required';
    if (!formData.job_title?.trim()) newErrors.job_title = 'Job title is required';
    if (!formData.grading_level) newErrors.grading_level = 'Grading level is required';

    // Job title length
    if (formData.job_title && formData.job_title.length > 200) {
      newErrors.job_title = 'Job title must be 200 characters or less';
    }

    // Notes length
    if (formData.notes && formData.notes.length > 1000) {
      newErrors.notes = 'Notes must be 1000 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Prepare data for API
      const submitData = {
        business_function: parseInt(formData.business_function),
        department: parseInt(formData.department),
        unit: formData.unit ? parseInt(formData.unit) : null,
        job_function: parseInt(formData.job_function),
        position_group: parseInt(formData.position_group),
        job_title: formData.job_title.trim(),
        grading_level: formData.grading_level,
        reporting_to: formData.reporting_to ? parseInt(formData.reporting_to) : null,
        is_visible_in_org_chart: formData.is_visible_in_org_chart,
        include_in_headcount: formData.include_in_headcount,
        notes: formData.notes.trim()
      };

      await onSubmit(submitData);
    } catch (error) {
      console.error('Form submission error:', error);
      // Handle API errors
      if (error.response?.data) {
        const apiErrors = {};
        Object.keys(error.response.data).forEach(key => {
          if (Array.isArray(error.response.data[key])) {
            apiErrors[key] = error.response.data[key][0];
          } else {
            apiErrors[key] = error.response.data[key];
          }
        });
        setErrors(apiErrors);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter departments by selected business function
  const filteredDepartments = departments?.filter(dept => 
    !formData.business_function || dept.business_function === parseInt(formData.business_function)
  ) || [];

  // Filter units by selected department
  const filteredUnits = units?.filter(unit => 
    !formData.department || unit.department === parseInt(formData.department)
  ) || [];

  // Filter employees for reporting_to (exclude current position if editing)
  const availableManagers = employees?.filter(emp => 
    emp.is_active && (!initialData || emp.id !== initialData.id)
  ) || [];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${bgModal} rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className={`text-xl font-semibold ${textPrimary}`}>
            {mode === 'create' ? 'Create Vacant Position' : 'Edit Vacant Position'}
          </h2>
          <button
            onClick={onClose}
            className={`p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${textMuted}`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Organizational Structure Section */}
            <div>
              <h3 className={`text-lg font-medium ${textPrimary} mb-4`}>
                Organizational Structure
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Business Function */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Business Function *
                  </label>
                  <select
                    value={formData.business_function}
                    onChange={(e) => {
                      handleInputChange('business_function', e.target.value);
                      // Reset dependent fields
                      handleInputChange('department', '');
                      handleInputChange('unit', '');
                    }}
                    className={`w-full p-3 border ${errors.business_function ? 'border-red-500' : borderColor} rounded-lg ${bgInput} ${textPrimary} focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    required
                  >
                    <option value="">Select Business Function</option>
                    {businessFunctions?.map(bf => (
                      <option key={bf.id} value={bf.id}>
                        {bf.name} ({bf.code})
                      </option>
                    ))}
                  </select>
                  {errors.business_function && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.business_function}
                    </p>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Department *
                  </label>
                  <select
                    value={formData.department}
                    onChange={(e) => {
                      handleInputChange('department', e.target.value);
                      // Reset unit when department changes
                      handleInputChange('unit', '');
                    }}
                    className={`w-full p-3 border ${errors.department ? 'border-red-500' : borderColor} rounded-lg ${bgInput} ${textPrimary} focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    required
                    disabled={!formData.business_function}
                  >
                    <option value="">Select Department</option>
                    {filteredDepartments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.department}
                    </p>
                  )}
                </div>

                {/* Unit (Optional) */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Unit
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => handleInputChange('unit', e.target.value)}
                    className={`w-full p-3 border ${borderColor} rounded-lg ${bgInput} ${textPrimary} focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    disabled={!formData.department}
                  >
                    <option value="">Select Unit (Optional)</option>
                    {filteredUnits.map(unit => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Job Function */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Job Function *
                  </label>
                  <select
                    value={formData.job_function}
                    onChange={(e) => handleInputChange('job_function', e.target.value)}
                    className={`w-full p-3 border ${errors.job_function ? 'border-red-500' : borderColor} rounded-lg ${bgInput} ${textPrimary} focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    required
                  >
                    <option value="">Select Job Function</option>
                    {jobFunctions?.map(jf => (
                      <option key={jf.id} value={jf.id}>
                        {jf.name}
                      </option>
                    ))}
                  </select>
                  {errors.job_function && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.job_function}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Position Details Section */}
            <div>
              <h3 className={`text-lg font-medium ${textPrimary} mb-4`}>
                Position Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Position Group */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Position Group *
                  </label>
                  <select
                    value={formData.position_group}
                    onChange={(e) => handleInputChange('position_group', e.target.value)}
                    className={`w-full p-3 border ${errors.position_group ? 'border-red-500' : borderColor} rounded-lg ${bgInput} ${textPrimary} focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    required
                  >
                    <option value="">Select Position Group</option>
                    {positionGroups?.map(pg => (
                      <option key={pg.id} value={pg.id}>
                        {pg.display_name} (Level {pg.hierarchy_level})
                      </option>
                    ))}
                  </select>
                  {errors.position_group && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.position_group}
                    </p>
                  )}
                </div>

                {/* Grading Level */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Grading Level *
                  </label>
                  <select
                    value={formData.grading_level}
                    onChange={(e) => handleInputChange('grading_level', e.target.value)}
                    className={`w-full p-3 border ${errors.grading_level ? 'border-red-500' : borderColor} rounded-lg ${bgInput} ${textPrimary} focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    required
                  >
                    <option value="">Select Grading Level</option>
                    {gradingLevels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                  {errors.grading_level && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.grading_level}
                    </p>
                  )}
                </div>

                {/* Job Title */}
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Job Title *
                  </label>
                  <input
                    type="text"
                    value={formData.job_title}
                    onChange={(e) => handleInputChange('job_title', e.target.value)}
                    placeholder="Enter job title"
                    maxLength={200}
                    className={`w-full p-3 border ${errors.job_title ? 'border-red-500' : borderColor} rounded-lg ${bgInput} ${textPrimary} focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                    required
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.job_title ? (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors.job_title}
                      </p>
                    ) : (
                      <span></span>
                    )}
                    <span className={`text-xs ${textMuted}`}>
                      {formData.job_title.length}/200
                    </span>
                  </div>
                </div>

                {/* Reporting To */}
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Reports To
                  </label>
                  <select
                    value={formData.reporting_to}
                    onChange={(e) => handleInputChange('reporting_to', e.target.value)}
                    className={`w-full p-3 border ${borderColor} rounded-lg ${bgInput} ${textPrimary} focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                  >
                    <option value="">Select Manager (Optional)</option>
                    {availableManagers.map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.name} ({emp.employee_id}) - {emp.job_title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Settings Section */}
            <div>
              <h3 className={`text-lg font-medium ${textPrimary} mb-4`}>
                Settings
              </h3>
              <div className="space-y-4">
                {/* Checkboxes */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_visible_in_org_chart"
                    checked={formData.is_visible_in_org_chart}
                    onChange={(e) => handleInputChange('is_visible_in_org_chart', e.target.checked)}
                    className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="is_visible_in_org_chart" className={`ml-2 text-sm ${textPrimary}`}>
                    Visible in organizational chart
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="include_in_headcount"
                    checked={formData.include_in_headcount}
                    onChange={(e) => handleInputChange('include_in_headcount', e.target.checked)}
                    className="w-4 h-4 text-orange-600 bg-gray-100 border-gray-300 rounded focus:ring-orange-500 dark:focus:ring-orange-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="include_in_headcount" className={`ml-2 text-sm ${textPrimary}`}>
                    Include in headcount calculations
                  </label>
                </div>

                {/* Notes */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Additional notes about this position..."
                    maxLength={1000}
                    rows={4}
                    className={`w-full p-3 border ${errors.notes ? 'border-red-500' : borderColor} rounded-lg ${bgInput} ${textPrimary} focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.notes ? (
                      <p className="text-sm text-red-600 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors.notes}
                      </p>
                    ) : (
                      <span></span>
                    )}
                    <span className={`text-xs ${textMuted}`}>
                      {formData.notes.length}/1000
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg ${textSecondary} hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors`}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || refLoading}
              className="flex items-center px-4 py-2 text-sm font-medium bg-orange-600 text-white rounded-lg hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  {mode === 'create' ? 'Creating...' : 'Updating...'}
                </>
              ) : (
                <>
                  <Save size={16} className="mr-2" />
                  {mode === 'create' ? 'Create Position' : 'Update Position'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VacantPositionModal;