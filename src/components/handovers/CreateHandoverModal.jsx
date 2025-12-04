// components/handovers/CreateHandoverModal.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, Plus, Trash2, Calendar, Users, FileText, 
  Save, Loader, AlertCircle 
} from 'lucide-react';
import handoverService from '@/services/handoverService';
import { toast } from 'react-hot-toast';

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

  // Lookup Data
  const [employees, setEmployees] = useState([]);
  const [handoverTypes, setHandoverTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [employeesData, typesData] = await Promise.all([
        handoverService.getEmployees(),
        handoverService.getHandoverTypes()
      ]);
      setEmployees(employeesData);
      setHandoverTypes(typesData);
    } catch (error) {
      toast.error('Error loading form data');
    } finally {
      setLoadingData(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      toast.error('At least one task is required');
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
      toast.error('At least one important date is required');
    }
  };

  // Validate form
  const validateForm = () => {
    if (!formData.handing_over_employee) {
      toast.error('Please select handing over employee');
      return false;
    }
    if (!formData.taking_over_employee) {
      toast.error('Please select taking over employee');
      return false;
    }
    if (!formData.handover_type) {
      toast.error('Please select handover type');
      return false;
    }
    if (!formData.start_date || !formData.end_date) {
      toast.error('Please select start and end dates');
      return false;
    }
    if (new Date(formData.start_date) >= new Date(formData.end_date)) {
      toast.error('End date must be after start date');
      return false;
    }

    // Validate tasks
    const validTasks = tasks.filter(t => t.description.trim());
    if (validTasks.length === 0) {
      toast.error('At least one task with description is required');
      return false;
    }

    // Validate dates
    const validDates = dates.filter(d => d.date && d.description.trim());
    if (validDates.length === 0) {
      toast.error('At least one important date is required');
      return false;
    }

    return true;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

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
      await handoverService.createHandover({
        ...formData,
        tasks_data,
        dates_data
      });

      toast.success('Handover created successfully!');
      onSuccess();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          'Error creating handover';
      toast.error(errorMessage);
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
              <p className="text-sm text-gray-500">Fill in the details below</p>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Basic Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Handing Over Employee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Handing Over Employee *
                </label>
                <select
                  name="handing_over_employee"
                  value={formData.handing_over_employee}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select...</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name} - {emp.job_title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Taking Over Employee */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taking Over Employee *
                </label>
                <select
                  name="taking_over_employee"
                  value={formData.taking_over_employee}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select...</option>
                  {employees
                    .filter(emp => emp.id !== formData.handing_over_employee)
                    .map(emp => (
                      <option key={emp.id} value={emp.id}>
                        {emp.full_name} - {emp.job_title}
                      </option>
                    ))}
                </select>
              </div>

              {/* Handover Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Handover Type *
                </label>
                <select
                  name="handover_type"
                  value={formData.handover_type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select...</option>
                  {handoverTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date *
                </label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date *
                </label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          </div>

          {/* Tasks Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                Tasks & Responsibilities *
              </h3>
              <button
                type="button"
                onClick={addTask}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            </div>

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
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows="2"
                          placeholder="Enter task description..."
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
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Important Dates Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-600" />
                Important Dates *
              </h3>
              <button
                type="button"
                onClick={addDate}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Date
              </button>
            </div>

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
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Additional Information</h3>

            <div className="grid grid-cols-1 gap-4">
              {/* Related Contacts */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Related Contacts
                </label>
                <textarea
                  name="contacts"
                  value={formData.contacts}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Name, position, contact information..."
                />
              </div>

              {/* Access Information */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Information / Accounts
                </label>
                <textarea
                  name="access_info"
                  value={formData.access_info}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="System name, username, password location..."
                />
              </div>

              {/* Documents */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Documents & Files
                </label>
                <textarea
                  name="documents_info"
                  value={formData.documents_info}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="File and folder locations..."
                />
              </div>

              {/* Open Issues */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Open Issues
                </label>
                <textarea
                  name="open_issues"
                  value={formData.open_issues}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Unresolved problems..."
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="Additional notes and explanations..."
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateHandoverModal;