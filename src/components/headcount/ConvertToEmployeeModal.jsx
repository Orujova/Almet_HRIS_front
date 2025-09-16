// src/components/headcount/ConvertToEmployeeModal.jsx
import { useState, useEffect } from 'react';
import { X, UserPlus, Upload, AlertCircle, Calendar, User } from 'lucide-react';

const ConvertToEmployeeModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  position,
  darkMode = false 
}) => {
  // Form state
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    start_date: '',
    contract_duration: 'PERMANENT',
    father_name: '',
    date_of_birth: '',
    gender: '',
    address: '',
    phone: '',
    emergency_contact: '',
    end_date: '',
    contract_start_date: '',
    document_type: '',
    document_name: ''
  });

  const [files, setFiles] = useState({
    document: null,
    profile_photo: null
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

  // Contract duration options
  const contractDurations = [
    { value: 'PERMANENT', label: 'Permanent' },
    { value: '1_MONTH', label: '1 Month' },
    { value: '3_MONTHS', label: '3 Months' },
    { value: '6_MONTHS', label: '6 Months' },
    { value: '1_YEAR', label: '1 Year' },
    { value: '2_YEARS', label: '2 Years' },
    { value: '3_YEARS', label: '3 Years' }
  ];

  // Gender options
  const genderOptions = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' }
  ];

  // Document type options
  const documentTypes = [
    { value: 'CONTRACT', label: 'Contract' },
    { value: 'ID', label: 'ID Document' },
    { value: 'CERTIFICATE', label: 'Certificate' },
    { value: 'CV', label: 'CV/Resume' },
    { value: 'PERFORMANCE', label: 'Performance Review' },
    { value: 'MEDICAL', label: 'Medical Certificate' },
    { value: 'TRAINING', label: 'Training Certificate' },
    { value: 'OTHER', label: 'Other' }
  ];

  // Initialize form data
  useEffect(() => {
    if (isOpen) {
      // Set default dates
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({
        ...prev,
        start_date: today,
        contract_start_date: today
      }));
      setErrors({});
      setFiles({ document: null, profile_photo: null });
    }
  }, [isOpen]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Handle file changes
  const handleFileChange = (field, file) => {
    setFiles(prev => ({ ...prev, [field]: file }));
    
    // If document is uploaded, require document type and name
    if (field === 'document' && file) {
      if (!formData.document_type) {
        setFormData(prev => ({ ...prev, document_type: 'CONTRACT' }));
      }
      if (!formData.document_name) {
        setFormData(prev => ({ ...prev, document_name: file.name }));
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.first_name?.trim()) newErrors.first_name = 'First name is required';
    if (!formData.last_name?.trim()) newErrors.last_name = 'Last name is required';
    if (!formData.email?.trim()) newErrors.email = 'Email is required';
    if (!formData.start_date) newErrors.start_date = 'Start date is required';

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Field length validations
    if (formData.first_name && formData.first_name.length > 150) {
      newErrors.first_name = 'First name must be 150 characters or less';
    }
    if (formData.last_name && formData.last_name.length > 150) {
      newErrors.last_name = 'Last name must be 150 characters or less';
    }
    if (formData.father_name && formData.father_name.length > 200) {
      newErrors.father_name = 'Father name must be 200 characters or less';
    }
    if (formData.phone && formData.phone.length > 20) {
      newErrors.phone = 'Phone number must be 20 characters or less';
    }
    if (formData.document_name && formData.document_name.length > 255) {
      newErrors.document_name = 'Document name must be 255 characters or less';
    }

    // Date validations
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) >= new Date(formData.end_date)) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    if (formData.contract_start_date && formData.start_date) {
      if (new Date(formData.contract_start_date) < new Date(formData.start_date)) {
        newErrors.contract_start_date = 'Contract start date cannot be before employment start date';
      }
    }

    // Document validation
    if (files.document && !formData.document_type) {
      newErrors.document_type = 'Document type is required when uploading a document';
    }
    if (files.document && !formData.document_name?.trim()) {
      newErrors.document_name = 'Document name is required when uploading a document';
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
      await onSubmit(formData, files.document, files.profile_photo);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${bgModal} rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg mr-3">
              <UserPlus className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h2 className={`text-xl font-semibold ${textPrimary}`}>
                Convert to Employee
              </h2>
              <p className={`text-sm ${textSecondary}`}>
                Position: {position?.job_title} ({position?.position_id})
              </p>
            </div>
          </div>
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
            {/* Basic Information Section */}
            <div>
              <h3 className={`text-lg font-medium ${textPrimary} mb-4 flex items-center`}>
                <User className="w-5 h-5 mr-2" />
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    placeholder="Enter first name"
                    maxLength={150}
                    className={`w-full p-3 border ${errors.first_name ? 'border-red-500' : borderColor} rounded-lg ${bgInput} ${textPrimary} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    required
                  />
                  {errors.first_name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.first_name}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    placeholder="Enter last name"
                    maxLength={150}
                    className={`w-full p-3 border ${errors.last_name ? 'border-red-500' : borderColor} rounded-lg ${bgInput} ${textPrimary} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    required
                  />
                  {errors.last_name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.last_name}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="Enter email address"
                    className={`w-full p-3 border ${errors.email ? 'border-red-500' : borderColor} rounded-lg ${bgInput} ${textPrimary} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    required
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Father Name */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Father Name
                  </label>
                  <input
                    type="text"
                    value={formData.father_name}
                    onChange={(e) => handleInputChange('father_name', e.target.value)}
                    placeholder="Enter father's name"
                    maxLength={200}
                    className={`w-full p-3 border ${borderColor} rounded-lg ${bgInput} ${textPrimary} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  />
                  {errors.father_name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.father_name}
                    </p>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                    className={`w-full p-3 border ${borderColor} rounded-lg ${bgInput} ${textPrimary} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className={`w-full p-3 border ${borderColor} rounded-lg ${bgInput} ${textPrimary} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  >
                    <option value="">Select Gender</option>
                    {genderOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="Enter phone number"
                    maxLength={20}
                    className={`w-full p-3 border ${borderColor} rounded-lg ${bgInput} ${textPrimary} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.phone}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Enter address"
                    className={`w-full p-3 border ${borderColor} rounded-lg ${bgInput} ${textPrimary} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  />
                </div>

                {/* Emergency Contact */}
                <div className="md:col-span-2">
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    value={formData.emergency_contact}
                    onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                    placeholder="Enter emergency contact information"
                    className={`w-full p-3 border ${borderColor} rounded-lg ${bgInput} ${textPrimary} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  />
                </div>
              </div>
            </div>

            {/* Employment Details Section */}
            <div>
              <h3 className={`text-lg font-medium ${textPrimary} mb-4 flex items-center`}>
                <Calendar className="w-5 h-5 mr-2" />
                Employment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Start Date */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    className={`w-full p-3 border ${errors.start_date ? 'border-red-500' : borderColor} rounded-lg ${bgInput} ${textPrimary} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                    required
                  />
                  {errors.start_date && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.start_date}
                    </p>
                  )}
                </div>

                {/* Contract Duration */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Contract Duration
                  </label>
                  <select
                    value={formData.contract_duration}
                    onChange={(e) => handleInputChange('contract_duration', e.target.value)}
                    className={`w-full p-3 border ${borderColor} rounded-lg ${bgInput} ${textPrimary} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  >
                    {contractDurations.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Contract Start Date */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Contract Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.contract_start_date}
                    onChange={(e) => handleInputChange('contract_start_date', e.target.value)}
                    className={`w-full p-3 border ${errors.contract_start_date ? 'border-red-500' : borderColor} rounded-lg ${bgInput} ${textPrimary} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  />
                  {errors.contract_start_date && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.contract_start_date}
                    </p>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                    className={`w-full p-3 border ${errors.end_date ? 'border-red-500' : borderColor} rounded-lg ${bgInput} ${textPrimary} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  />
                  {errors.end_date && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle size={14} className="mr-1" />
                      {errors.end_date}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Documents Section */}
            <div>
              <h3 className={`text-lg font-medium ${textPrimary} mb-4 flex items-center`}>
                <Upload className="w-5 h-5 mr-2" />
                Documents
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Profile Photo */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Profile Photo
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange('profile_photo', e.target.files[0])}
                    className={`w-full p-3 border ${borderColor} rounded-lg ${bgInput} ${textPrimary} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  />
                  {files.profile_photo && (
                    <p className={`mt-1 text-sm ${textSecondary}`}>
                      Selected: {files.profile_photo.name}
                    </p>
                  )}
                </div>

                {/* Document */}
                <div>
                  <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                    Employee Document
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange('document', e.target.files[0])}
                    className={`w-full p-3 border ${borderColor} rounded-lg ${bgInput} ${textPrimary} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                  />
                  {files.document && (
                    <p className={`mt-1 text-sm ${textSecondary}`}>
                      Selected: {files.document.name}
                    </p>
                  )}
                </div>

                {/* Document Type - Show only if document is uploaded */}
                {files.document && (
                  <div>
                    <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                      Document Type *
                    </label>
                    <select
                      value={formData.document_type}
                      onChange={(e) => handleInputChange('document_type', e.target.value)}
                      className={`w-full p-3 border ${errors.document_type ? 'border-red-500' : borderColor} rounded-lg ${bgInput} ${textPrimary} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                      required
                    >
                      <option value="">Select Document Type</option>
                      {documentTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {errors.document_type && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors.document_type}
                      </p>
                    )}
                  </div>
                )}

                {/* Document Name - Show only if document is uploaded */}
                {files.document && (
                  <div>
                    <label className={`block text-sm font-medium ${textPrimary} mb-2`}>
                      Document Name *
                    </label>
                    <input
                      type="text"
                      value={formData.document_name}
                      onChange={(e) => handleInputChange('document_name', e.target.value)}
                      placeholder="Enter document name"
                      maxLength={255}
                      className={`w-full p-3 border ${errors.document_name ? 'border-red-500' : borderColor} rounded-lg ${bgInput} ${textPrimary} focus:ring-2 focus:ring-green-500 focus:border-transparent`}
                      required
                    />
                    {errors.document_name && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle size={14} className="mr-1" />
                        {errors.document_name}
                      </p>
                    )}
                  </div>
                )}
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
              disabled={isSubmitting}
              className="flex items-center px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                  Converting...
                </>
              ) : (
                <>
                  <UserPlus size={16} className="mr-2" />
                  Convert to Employee
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ConvertToEmployeeModal;