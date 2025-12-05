// components/handovers/CreateHandoverModal.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, Plus, Trash2, Calendar, Users, FileText, 
  Save, Loader, AlertCircle, Key, Folder, 
  AlertTriangle, MessageSquare, Clock, Upload
} from 'lucide-react';
import handoverService from '@/services/handoverService';
import { useToast } from '@/components/common/Toast';
import SearchableDropdown from '@/components/common/SearchableDropdown';

const CreateHandoverModal = ({ onClose, onSuccess, currentUser }) => {
  // Form State
  const [formData, setFormData] = useState({
    handing_over_employee: currentUser?.employee?.id || '',
    taking_over_employee: '',
    handover_type: '',
    start_date: '',
    end_date: '',
    contacts: '',
    access_info: '',
    documents_info: '',
    open_issues: '',
    notes: '',
  });

  const [tasks, setTasks] = useState([
    { description: '', status: 'NOT_STARTED', comment: '' }
  ]);

  const [dates, setDates] = useState([
    { date: '', description: '' }
  ]);

  const [attachments, setAttachments] = useState([]);

  // Lookup Data
  const [employees, setEmployees] = useState([]);
  const [handoverTypes, setHandoverTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Validation errors
  const [errors, setErrors] = useState({});
  const [activeStep, setActiveStep] = useState(1);

  const { showSuccess, showError, showWarning } = useToast();

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && activeStep > 1 && !loading) {
        handlePrevStep();
      } else if (e.key === 'ArrowRight' && activeStep < 4 && !loading) {
        handleNextStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStep, loading]);

  const loadInitialData = async () => {
    try {
      const [employeesData, typesData] = await Promise.all([
        handoverService.getEmployees(),
        handoverService.getHandoverTypes()
      ]);
      setEmployees(employeesData);
      console.log(employeesData)
      setHandoverTypes(typesData);
    } catch (error) {
      showError('Error loading form data');
      console.error('Error loading initial data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle task changes
  const handleTaskChange = (index, field, value) => {
    const updatedTasks = [...tasks];
    updatedTasks[index][field] = value;
    setTasks(updatedTasks);
  };

  const addTask = () => {
    setTasks([...tasks, { description: '', status: 'NOT_STARTED', comment: '' }]);
  };

  const removeTask = (index) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter((_, i) => i !== index));
    } else {
      showWarning('At least one task is required');
    }
  };

  // Handle date changes
  const handleDateChange = (index, field, value) => {
    const updatedDates = [...dates];
    updatedDates[index][field] = value;
    setDates(updatedDates);
  };

  const addDate = () => {
    setDates([...dates, { date: '', description: '' }]);
  };

  const removeDate = (index) => {
    if (dates.length > 1) {
      setDates(dates.filter((_, i) => i !== index));
    } else {
      showWarning('At least one important date is required');
    }
  };

  // Handle file attachments
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    const validFiles = files.filter(file => {
      if (file.size > maxSize) {
        showWarning(`${file.name} is too large. Maximum file size is 10MB.`);
        return false;
      }
      return true;
    });

    const newAttachments = validFiles.map(file => ({
      file,
      name: file.name,
      size: file.size,
      type: file.type
    }));
    
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (index) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Validate form
  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.handing_over_employee) {
        newErrors.handing_over_employee = 'Handing over employee is required';
      }
      if (!formData.taking_over_employee) {
        newErrors.taking_over_employee = 'Taking over employee is required';
      }
      if (formData.handing_over_employee === formData.taking_over_employee) {
        newErrors.taking_over_employee = 'Cannot be the same as handing over employee';
      }
      if (!formData.handover_type) {
        newErrors.handover_type = 'Handover type is required';
      }
      if (!formData.start_date) {
        newErrors.start_date = 'Start date is required';
      }
      if (!formData.end_date) {
        newErrors.end_date = 'End date is required';
      }
      if (formData.start_date && formData.end_date && 
          new Date(formData.start_date) >= new Date(formData.end_date)) {
        newErrors.end_date = 'End date must be after start date';
      }
    }

    if (step === 2) {
      const validTasks = tasks.filter(t => t.description.trim());
      if (validTasks.length === 0) {
        newErrors.tasks = 'At least one task with description is required';
      }
    }

    if (step === 3) {
      const validDates = dates.filter(d => d.date && d.description.trim());
      if (validDates.length === 0) {
        newErrors.dates = 'At least one important date is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle next step
  const handleNextStep = () => {
    if (validateStep(activeStep)) {
      setActiveStep(prev => Math.min(prev + 1, 4));
    } else {
      showError('Please fix the errors before continuing');
    }
  };

  // Handle previous step
  const handlePrevStep = () => {
    setActiveStep(prev => Math.max(prev - 1, 1));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all steps
    let isValid = true;
    for (let step = 1; step <= 3; step++) {
      if (!validateStep(step)) {
        isValid = false;
        setActiveStep(step);
        showError('Please complete all required fields');
        return;
      }
    }

    if (!isValid) return;

    setLoading(true);
    try {
      // Prepare tasks data
      const tasks_data = tasks
        .filter(t => t.description.trim())
        .map(t => ({
          description: t.description,
          status: t.status,
          comment: t.comment
        }));

      // Prepare dates data
      const dates_data = dates
        .filter(d => d.date && d.description.trim())
        .map(d => ({
          date: d.date,
          description: d.description
        }));

      // Submit data
      const handoverData = {
        ...formData,
        tasks_data,
        dates_data
      };

      const result = await handoverService.createHandover(handoverData);

      // Upload attachments if any
      if (attachments.length > 0 && result.id) {
        await Promise.all(
          attachments.map(attachment => 
            handoverService.uploadAttachment(result.id, attachment.file)
          )
        );
      }

      showSuccess('Handover created successfully!');
      onSuccess();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Error creating handover';
      showError(errorMessage);
      console.error('Error creating handover:', error);
    } finally {
      setLoading(false);
    }
  };

  // Task status options
  const taskStatusOptions = [
    { value: 'NOT_STARTED', label: 'Not Started' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELED', label: 'Canceled' },
    { value: 'POSTPONED', label: 'Postponed' },
  ];

  // Steps configuration
  const steps = [
    { id: 1, label: 'Basic Info', icon: Users },
    { id: 2, label: 'Tasks', icon: FileText },
    { id: 3, label: 'Dates', icon: Calendar },
    { id: 4, label: 'Details', icon: Folder },
  ];

  // Step indicator
  const StepIndicator = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = activeStep === step.id;
          const isCompleted = activeStep > step.id;
          
          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  isCompleted 
                    ? 'bg-green-500 text-white' 
                    : isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
                }`}>
                  {isCompleted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`text-xs mt-2 font-medium ${
                  isActive ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
              </div>
              
              {index < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 -mt-5 transition-all ${
                  activeStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  if (loadingData) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Create New Handover</h2>
              <p className="text-sm text-gray-500">Step {activeStep} of {steps.length}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Step Indicator */}
          <StepIndicator />

          {/* Step 1: Basic Information */}
          {activeStep === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Basic Information
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Handing Over Employee */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Handing Over Employee *
                  </label>
                  <SearchableDropdown
                    options={employees.map(emp => ({
                      value: emp.id,
                      label: `${emp.name} - ${emp.job_title}`
                    }))}
                    value={formData.handing_over_employee}
                    onChange={(value) => {
                      setFormData(prev => ({ ...prev, handing_over_employee: value }));
                      if (errors.handing_over_employee) {
                        setErrors(prev => ({ ...prev, handing_over_employee: '' }));
                      }
                    }}
                    placeholder="Select handing over employee..."
                    searchPlaceholder="Search employees..."
                    icon={<Users className="w-4 h-4" />}
                    allowUncheck={false}
                  />
                  {errors.handing_over_employee && (
                    <p className="text-red-500 text-xs mt-1">{errors.handing_over_employee}</p>
                  )}
                </div>

                {/* Taking Over Employee */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Taking Over Employee *
                  </label>
                  <SearchableDropdown
                    options={employees
                      .filter(emp => emp.id !== formData.handing_over_employee)
                      .map(emp => ({
                        value: emp.id,
                        label: `${emp.name} - ${emp.job_title}`
                      }))}
                    value={formData.taking_over_employee}
                    onChange={(value) => {
                      setFormData(prev => ({ ...prev, taking_over_employee: value }));
                      if (errors.taking_over_employee) {
                        setErrors(prev => ({ ...prev, taking_over_employee: '' }));
                      }
                    }}
                    placeholder="Select taking over employee..."
                    searchPlaceholder="Search employees..."
                    icon={<Users className="w-4 h-4" />}
                    allowUncheck={false}
                  />
                  {errors.taking_over_employee && (
                    <p className="text-red-500 text-xs mt-1">{errors.taking_over_employee}</p>
                  )}
                </div>

                {/* Handover Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Handover Type *
                  </label>
                  <SearchableDropdown
                    options={handoverTypes.map(type => ({
                      value: type.id,
                      label: type.name
                    }))}
                    value={formData.handover_type}
                    onChange={(value) => {
                      setFormData(prev => ({ ...prev, handover_type: value }));
                      if (errors.handover_type) {
                        setErrors(prev => ({ ...prev, handover_type: '' }));
                      }
                    }}
                    placeholder="Select handover type..."
                    searchPlaceholder="Search types..."
                    icon={<FileText className="w-4 h-4" />}
                    allowUncheck={false}
                  />
                  {errors.handover_type && (
                    <p className="text-red-500 text-xs mt-1">{errors.handover_type}</p>
                  )}
                </div>

                <div></div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.start_date ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                  </div>
                  {errors.start_date && (
                    <p className="text-red-500 text-xs mt-1">{errors.start_date}</p>
                  )}
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date *
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleInputChange}
                      min={formData.start_date}
                      className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.end_date ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                  </div>
                  {errors.end_date && (
                    <p className="text-red-500 text-xs mt-1">{errors.end_date}</p>
                  )}
                </div>
              </div>

              {/* Date Range Info */}
              {formData.start_date && formData.end_date && new Date(formData.start_date) < new Date(formData.end_date) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-blue-900">Handover Period</p>
                      <p className="text-sm text-blue-700 mt-1">
                        Duration: {Math.ceil((new Date(formData.end_date) - new Date(formData.start_date)) / (1000 * 60 * 60 * 24))} days
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Tasks Section */}
          {activeStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Tasks & Responsibilities *
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={addTask}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </button>
              </div>

              {errors.tasks && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{errors.tasks}</p>
                </div>
              )}

              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Task Description *
                          </label>
                          <textarea
                            value={task.description}
                            onChange={(e) => handleTaskChange(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows="3"
                            placeholder="Enter detailed task description..."
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Initial Status
                            </label>
                            <select
                              value={task.status}
                              onChange={(e) => handleTaskChange(index, 'status', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              {taskStatusOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Comment (Optional)
                            </label>
                            <input
                              type="text"
                              value={task.comment}
                              onChange={(e) => handleTaskChange(index, 'comment', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Add comment..."
                            />
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeTask(index)}
                        disabled={tasks.length === 1}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={tasks.length === 1 ? 'At least one task is required' : 'Remove task'}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-yellow-900">Task Guidelines</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      • Be specific and detailed in task descriptions<br />
                      • Include any special instructions or considerations<br />
                      • Set appropriate initial status for each task
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Important Dates Section */}
          {activeStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Important Dates *
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={addDate}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Date
                </button>
              </div>

              {errors.dates && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{errors.dates}</p>
                </div>
              )}

              <div className="space-y-3">
                {dates.map((dateItem, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Date *
                          </label>
                          <input
                            type="date"
                            value={dateItem.date}
                            onChange={(e) => handleDateChange(index, 'date', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description *
                          </label>
                          <input
                            type="text"
                            value={dateItem.description}
                            onChange={(e) => handleDateChange(index, 'description', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter description..."
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeDate(index)}
                        disabled={dates.length === 1}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title={dates.length === 1 ? 'At least one date is required' : 'Remove date'}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Examples of Important Dates</p>
                    <p className="text-sm text-blue-700 mt-1">
                      • Project deadlines and milestones<br />
                      • Scheduled meetings or reviews<br />
                      • Important deliverable dates<br />
                      • Training or handover sessions
                    </p>
                  </div></div>
              </div>
            </div>
          )}

          {/* Step 4: Additional Information */}
          {activeStep === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Folder className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Additional Information
                </h3>
              </div>

              <div className="space-y-4">
                {/* Related Contacts */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    Related Contacts
                  </label>
                  <textarea
                    name="contacts"
                    value={formData.contacts}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="3"
                    placeholder="List important contacts with their roles and contact information..."
                  />
                </div>

                {/* Access Information */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Key className="w-4 h-4 text-gray-500" />
                    Access Information / Accounts
                  </label>
                  <textarea
                    name="access_info"
                    value={formData.access_info}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="3"
                    placeholder="System names, usernames, password locations, access levels..."
                  />
                </div>

                {/* Documents & Files */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Folder className="w-4 h-4 text-gray-500" />
                    Documents & Files
                  </label>
                  <textarea
                    name="documents_info"
                    value={formData.documents_info}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="3"
                    placeholder="File and folder locations, shared drives, important documents..."
                  />
                </div>

                {/* Open Issues */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <AlertTriangle className="w-4 h-4 text-gray-500" />
                    Open Issues
                  </label>
                  <textarea
                    name="open_issues"
                    value={formData.open_issues}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="3"
                    placeholder="Unresolved problems, pending actions, known issues..."
                  />
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <MessageSquare className="w-4 h-4 text-gray-500" />
                    Additional Notes
                  </label>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows="4"
                    placeholder="Additional notes, tips, recommendations, special considerations..."
                  />
                </div>

                {/* File Attachments */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Upload className="w-4 h-4 text-gray-500" />
                    File Attachments (Optional)
                  </label>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">
                        Click to upload or drag and drop
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        PDF, DOC, XLS, TXT, Images (Max 10MB per file)
                      </span>
                    </label>
                  </div>

                  {/* Attachment List */}
                  {attachments.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="w-5 h-5 text-gray-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {attachment.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(attachment.size)}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">Review Your Information</p>
                    <p className="text-sm text-blue-700 mt-1">
                      Please review all the information you've entered before submitting. 
                      You can go back to previous steps to make changes if needed.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Navigation */}
          <div className="flex items-center justify-between gap-4 pt-6 mt-6 border-t border-gray-200">
            {/* Back Button */}
            <button
              type="button"
              onClick={activeStep === 1 ? onClose : handlePrevStep}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {activeStep === 1 ? 'Cancel' : 'Back'}
            </button>

            {/* Progress Info */}
            <div className="flex-1 text-center">
              <div className="flex items-center justify-center gap-2">
                {steps.map((step) => (
                  <div
                    key={step.id}
                    className={`h-2 rounded-full transition-all ${
                      step.id === activeStep 
                        ? 'w-8 bg-blue-600' 
                        : step.id < activeStep 
                        ? 'w-2 bg-green-500' 
                        : 'w-2 bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Next/Submit Button */}
            {activeStep < steps.length ? (
              <button
                type="button"
                onClick={handleNextStep}
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px] justify-center"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Create Handover
                  </>
                )}
              </button>
            )}
          </div>
        </form>

        {/* Keyboard Shortcuts Info */}
        <div className="px-6 pb-4">
          <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
            <div className="flex items-center gap-4 justify-center flex-wrap">
              <span className="flex items-center gap-1">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">Esc</kbd>
                <span>Close</span>
              </span>
              {activeStep > 1 && (
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">←</kbd>
                  <span>Back</span>
                </span>
              )}
              {activeStep < steps.length && (
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-1 bg-white border border-gray-300 rounded">→</kbd>
                  <span>Next</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateHandoverModal;