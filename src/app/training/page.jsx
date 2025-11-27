'use client'
import React, { useState, useEffect } from 'react';
import { Search, Plus, BookOpen, Users, ExternalLink , Clock, TrendingUp, FileText, Upload, CheckCircle, AlertCircle, Calendar, X, Download, Eye, Settings, Edit, Trash2, Save, Filter, Building, Briefcase } from 'lucide-react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import trainingService from '@/services/trainingService';
import { employeeService } from '@/services/newsService';
import { useToast } from '@/components/common/Toast';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import Pagination from '@/components/common/Pagination';
import MultiSelect from '@/components/common/MultiSelect';

const TrainingManagement = () => {
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  const toast = useToast();
  
  const [activeTab, setActiveTab] = useState('all-trainings');
  const [trainings, setTrainings] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [myTrainings, setMyTrainings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [employees, setEmployees] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    page_size: 10,
    total: 0
  });
  
  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTraining, setSelectedTraining] = useState(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showPdfViewerModal, setShowPdfViewerModal] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [selectedTrainingIds, setSelectedTrainingIds] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, id: null });
  
  // Form states
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_active: true,
    requires_completion: false,
    completion_deadline_days: '',
    materials: []
  });
  
  const [materialForm, setMaterialForm] = useState({
    file: null,
  });
  
  const [assignFormData, setAssignFormData] = useState({
    training_ids: [],
    employee_ids: [],
    due_date: '',
    is_mandatory: false
  });
  
  const [errors, setErrors] = useState({});
  const [submitLoading, setSubmitLoading] = useState(false);

  // Theme colors
  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const bgCardHover = darkMode ? "bg-almet-san-juan" : "bg-gray-50";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";

  useEffect(() => {
    loadData();
  }, [activeTab, pagination.page]);

  useEffect(() => {
    if (activeTab === 'all-trainings') {
      loadStatistics();
    }
  }, [activeTab]);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      const response = await employeeService.getEmployees({ page_size: 100 });
      setEmployees(response.results || []);
    } catch (error) {
      console.error('Failed to load employees:', error);
      toast.showError('Failed to load employees');
    }
  };

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'all-trainings') {
        const params = {
          search: searchTerm,
          page: pagination.page,
          page_size: pagination.page_size
        };
        Object.keys(params).forEach(key => {
          if (params[key] === '' || params[key] === null) delete params[key];
        });
        
        const data = await trainingService.trainings.getAll(params);
        setTrainings(data.results || []);
        setPagination(prev => ({ ...prev, total: data.count || 0 }));
      } else if (activeTab === 'my-trainings') {
        const data = await trainingService.assignments.getMyTrainings();
        setMyTrainings(data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.showError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadStatistics = async () => {
    try {
      const data = await trainingService.trainings.getStatistics();
      setStatistics(data);
    } catch (error) {
      console.error('Error loading statistics:', error);
    }
  };

  const handleSearch = () => {
    setPagination({ ...pagination, page: 1 });
    loadData();
  };

  const handleViewDetails = async (trainingId) => {
    try {
      const data = await trainingService.trainings.getById(trainingId);
      setSelectedTraining(data);
      setShowDetailModal(true);
    } catch (error) {
      console.error('Error loading training details:', error);
      toast.showError('Failed to load training details');
    }
  };

  const handleCreateTraining = () => {
    setFormData({
      title: '',
      description: '',
      is_active: true,
      requires_completion: false,
      completion_deadline_days: '',
      materials: []
    });
    setErrors({});
    setShowCreateModal(true);
  };

  const handleEditTraining = async (training) => {
    setFormData({
      title: training.title,
      description: training.description,
      is_active: training.is_active,
      requires_completion: training.requires_completion,
      completion_deadline_days: training.completion_deadline_days || '',
      materials: []
    });
    setSelectedTraining(training);
    setErrors({});
    setShowEditModal(true);
  };

  const handleAddMaterial = () => {
    const newErrors = {};
  
 
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setFormData({
      ...formData,
      materials: [...formData.materials, { ...materialForm, tempId: Date.now() }]
    });
    
    setMaterialForm({

      file: null,

    });
    
    setErrors({});
    toast.showSuccess('Material added to list');
  };

  const handleRemoveMaterial = (tempId) => {
    setFormData({
      ...formData,
      materials: formData.materials.filter(m => m.tempId !== tempId)
    });
    toast.showInfo('Material removed');
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Replace the handleSubmitTraining function in page.jsx

const handleSubmitTraining = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    toast.showError('Please fill in all required fields');
    return;
  }
  
  setSubmitLoading(true);
  try {
    const submitData = new FormData();
    
    // Add basic fields
    submitData.append('title', formData.title);
    submitData.append('description', formData.description);
    submitData.append('is_active', formData.is_active);
    submitData.append('requires_completion', formData.requires_completion);
    
    if (formData.completion_deadline_days) {
      submitData.append('completion_deadline_days', parseInt(formData.completion_deadline_days));
    }
    
    // Collect all materials (both added and current)
    const allMaterials = [...formData.materials];
    
    // If there's a material in the form that hasn't been added to the list yet
    if (materialForm.file) {
      allMaterials.push({
        ...materialForm,
        tempId: Date.now()
      });
    }
    
    // Process materials
    if (allMaterials.length > 0) {
      const materialsData = [];
      
      for (let i = 0; i < allMaterials.length; i++) {
        const material = allMaterials[i];
        const materialObj = {};
        
        // Add file to FormData
        if (material.file) {
          submitData.append(`material_${i}_file`, material.file);
          materialObj.file_index = i;
        }
        
        materialsData.push(materialObj);
      }
      
      // Add materials_data as JSON string
      submitData.append('materials_data', JSON.stringify(materialsData));
    }
    
    // Debug: Log FormData contents
    console.log('📦 FormData contents:');
    for (let [key, value] of submitData.entries()) {
      console.log(`  ${key}:`, value instanceof File ? `File(${value.name}, ${value.size} bytes)` : value);
    }
    
    // Send request
    if (showEditModal && selectedTraining) {
      await trainingService.trainings.update(selectedTraining.id, submitData);
      toast.showSuccess('Training updated successfully!');
    } else {
      await trainingService.trainings.create(submitData);
      toast.showSuccess('Training created successfully!');
    }
    
    setShowCreateModal(false);
    setShowEditModal(false);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      is_active: true,
      requires_completion: false,
      completion_deadline_days: '',
      materials: []
    });
    setMaterialForm({
      file: null,
    });
    
    loadData();
  } catch (error) {
    console.error('Error submitting training:', error);
    console.error('Error response:', error.response?.data);
    toast.showError('Error submitting training: ' + (error.response?.data?.error || error.message));
  } finally {
    setSubmitLoading(false);
  }
};

  const handleDeleteTraining = async (trainingId) => {
    setDeleteConfirm({ show: true, id: trainingId });
  };

  const confirmDelete = async () => {
    try {
      await trainingService.trainings.delete(deleteConfirm.id);
      toast.showSuccess('Training deleted successfully!');
      setDeleteConfirm({ show: false, id: null });
      loadData();
    } catch (error) {
      console.error('Error deleting training:', error);
      toast.showError('Error deleting training: ' + (error.response?.data?.error || error.message));
    }
  };

  const handleAssignTraining = () => {
    if (selectedTrainingIds.length === 0) {
      toast.showWarning('Please select at least one training');
      return;
    }
    
    setAssignFormData({
      training_ids: selectedTrainingIds,
      employee_ids: [],
      due_date: '',
      is_mandatory: false
    });
    setErrors({});
    setShowAssignModal(true);
  };

  const handleAssignSingleTraining = (trainingId) => {
    setAssignFormData({
      training_ids: [trainingId],
      employee_ids: [],
      due_date: '',
      is_mandatory: false
    });
    setErrors({});
    setShowAssignModal(true);
  };

  const handleToggleTraining = (trainingId) => {
    setSelectedTrainingIds(prev => {
      if (prev.includes(trainingId)) {
        return prev.filter(id => id !== trainingId);
      } else {
        return [...prev, trainingId];
      }
    });
  };

  const handleToggleAllTrainings = () => {
    if (selectedTrainingIds.length === trainings.length) {
      setSelectedTrainingIds([]);
    } else {
      setSelectedTrainingIds(trainings.map(t => t.id));
    }
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    
    if (assignFormData.training_ids.length === 0) {
      toast.showError('Select at least one training');
      return;
    }
    
    if (assignFormData.employee_ids.length === 0) {
      toast.showError('Select at least one employee');
      return;
    }
    
    setSubmitLoading(true);
    try {
      const submitData = {
        training_ids: assignFormData.training_ids.map(id => parseInt(id)),
        employee_ids: assignFormData.employee_ids.map(id => parseInt(id)),
        due_date: assignFormData.due_date || null,
        is_mandatory: assignFormData.is_mandatory
      };
      
      const result = await trainingService.trainings.bulk_assign(submitData);
      toast.showSuccess(`Successfully assigned! Created: ${result.summary.created}, Skipped: ${result.summary.skipped}`);
      setShowAssignModal(false);
      setSelectedTrainingIds([]);
      loadData();
    } catch (error) {
      console.error('Error assigning training:', error);
      toast.showError('Error assigning training: ' + (error.response?.data?.error || error.message));
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleViewPdf = (url) => {
    setPdfUrl(url);
    setShowPdfViewerModal(true);
  };

  const handleCompleteMaterial = async (assignmentId, materialId) => {
    try {
      await trainingService.assignments.completeMaterial(assignmentId, materialId);
      toast.showSuccess('Material completed successfully!');
      loadData();
    } catch (error) {
      console.error('Error completing material:', error);
      toast.showError('Error completing material');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'ASSIGNED': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'IN_PROGRESS': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'COMPLETED': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'OVERDUE': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  };

  // Prepare employee options for MultiSelect
  const employeeOptions = employees.map(emp => ({
    id: emp.id,
    name: `${emp.name}  (${emp.employee_id})`,
    label: `${emp.name} `,
    value: emp.id


    
  }));



  const handleEmployeeChange = (fieldName, value) => {
    setAssignFormData(prev => {
      const currentIds = prev.employee_ids || [];
      const newIds = currentIds.includes(value)
        ? currentIds.filter(id => id !== value)
        : [...currentIds, value];
      return { ...prev, employee_ids: newIds };
    });
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen p-6">
        <div className="mx-auto">
          {/* Header */}
          <div className={`${bgCard} rounded-xl shadow-sm p-6 mb-6 border ${borderColor}`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className={`text-xl font-bold ${textPrimary} flex items-center gap-3`}>
                  <div className="p-2 bg-almet-sapphire/10 rounded-lg">
                    <BookOpen className="text-almet-sapphire" size={24} />
                  </div>
                  Training Management System
                </h1>
                <p className={`${textSecondary} text-xs mt-2`}>Employee training and development platform</p>
              </div>
              <div className="flex gap-3">
                {selectedTrainingIds.length > 0 && (
                  <button
                    onClick={handleAssignTraining}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg transition-all shadow-sm hover:shadow text-sm font-medium"
                  >
                    <Users size={18} />
                    Assign Selected ({selectedTrainingIds.length})
                  </button>
                )}
                <button
                  onClick={handleCreateTraining}
                  className="flex items-center gap-2 bg-almet-sapphire hover:bg-almet-astral text-white px-4 py-2.5 rounded-lg transition-all shadow-sm hover:shadow text-sm font-medium"
                >
                  <Plus size={18} />
                  New Training
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className={`flex gap-2 border-b ${borderColor}`}>
              {[
                { id: 'all-trainings', label: 'All Trainings', icon: BookOpen },
                { id: 'my-trainings', label: 'My Trainings', icon: Users },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 font-medium transition-all text-sm ${
                    activeTab === tab.id
                      ? 'text-almet-sapphire border-b-2 border-almet-sapphire -mb-px'
                      : `${textSecondary} hover:${textPrimary}`
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Statistics Cards */}
          {activeTab === 'all-trainings' && statistics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className={`${bgCard} rounded-xl shadow-sm p-6 border ${borderColor} hover:shadow-md transition-shadow`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs ${textSecondary} mb-1`}>Total Trainings</p>
                    <p className={`text-2xl font-bold ${textPrimary}`}>{statistics.overview.total_trainings}</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <BookOpen className="text-blue-600 dark:text-blue-400" size={24} />
                  </div>
                </div>
              </div>
              <div className={`${bgCard} rounded-xl shadow-sm p-6 border ${borderColor} hover:shadow-md transition-shadow`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs ${textSecondary} mb-1`}>Active Trainings</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">{statistics.overview.active_trainings}</p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                    <CheckCircle className="text-green-600 dark:text-green-400" size={24} />
                  </div>
                </div>
              </div>
              <div className={`${bgCard} rounded-xl shadow-sm p-6 border ${borderColor} hover:shadow-md transition-shadow`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs ${textSecondary} mb-1`}>Total Assignments</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{statistics.assignments.total}</p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Users className="text-blue-600 dark:text-blue-400" size={24} />
                  </div>
                </div>
              </div>
              <div className={`${bgCard} rounded-xl shadow-sm p-6 border ${borderColor} hover:shadow-md transition-shadow`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-xs ${textSecondary} mb-1`}>Completion Rate</p>
                    <p className="text-2xl font-bold text-almet-sapphire">{statistics.assignments.completion_rate}%</p>
                  </div>
                  <div className="p-3 bg-almet-sapphire/10 rounded-xl">
                    <TrendingUp className="text-almet-sapphire" size={24} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* All Trainings Tab */}
          {activeTab === 'all-trainings' && (
            <div className="space-y-6">
              {/* Search & Filters */}
              <div className={`${bgCard} rounded-xl shadow-sm p-4 border ${borderColor}`}>
                <div className="flex gap-4 flex-wrap items-center">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={trainings.length > 0 && selectedTrainingIds.length === trainings.length}
                      onChange={handleToggleAllTrainings}
                      className="w-4 h-4 text-almet-sapphire border-gray-300 rounded focus:ring-almet-sapphire"
                    />
                    <span className={`text-sm ${textSecondary} font-medium`}>Select All</span>
                  </div>
                  
                  <div className="flex-1 min-w-[300px]">
                    <div className="relative">
                      <Search className={`absolute left-3 top-3 ${textMuted}`} size={20} />
                      <input
                        type="text"
                        placeholder="Search trainings..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className={`w-full pl-10 pr-4 py-2.5 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:ring-2 focus:ring-almet-sapphire focus:border-transparent outline-none text-xs`}
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={handleSearch}
                    className="px-5 py-2.5 bg-almet-sapphire hover:bg-almet-astral text-white rounded-lg transition-all shadow-sm hover:shadow text-sm font-medium"
                  >
                    Search
                  </button>
                </div>
              </div>

              {/* Trainings Grid */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-almet-sapphire"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {trainings.map(training => (
                      <div key={training.id} className={`${bgCard} rounded-xl shadow-sm hover:shadow-md transition-all p-6 border ${borderColor}`}>
                        <div className="flex items-start gap-3 mb-4">
                          <input
                            type="checkbox"
                            checked={selectedTrainingIds.includes(training.id)}
                            onChange={() => handleToggleTraining(training.id)}
                            className="mt-1 w-4 h-4 text-almet-sapphire border-gray-300 rounded focus:ring-almet-sapphire"
                          />
                          
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <span className={`text-xs ${textMuted} font-medium`}>{training.training_id}</span>
                                <h3 className={`text-lg font-semibold ${textPrimary} mt-1`}>{training.title}</h3>
                              </div>
                            </div>

                            <p className={`${textSecondary} text-sm mb-4 line-clamp-2`}>{training.description}</p>

                            <div className="grid grid-cols-2 gap-4 mb-4">
                              <div className="flex items-center gap-2 text-sm">
                                <FileText size={16} className={textMuted} />
                                <span className={textSecondary}>{training.materials_count} Materials</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm">
                                <Users size={16} className={textMuted} />
                                <span className={textSecondary}>{training.assignments_count} Assigned</span>
                              </div>
                            </div>

                            <div className={`flex items-center justify-between pt-4 border-t ${borderColor}`}>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm ${textSecondary}`}>Completion:</span>
                                <span className="text-sm font-semibold text-almet-sapphire">{training.completion_rate}%</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleAssignSingleTraining(training.id)}
                                  className={`p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors`}
                                  title="Assign"
                                >
                                  <Users size={16} />
                                </button>
                                <button
                                  onClick={() => handleEditTraining(training)}
                                  className={`p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors`}
                                  title="Edit"
                                >
                                  <Edit size={16} />
                                </button>
                                <button
                                  onClick={() => handleViewDetails(training.id)}
                                  className={`p-2 text-almet-sapphire hover:${bgCardHover} rounded-lg transition-colors`}
                                  title="View Details"
                                >
                                  <Eye size={16} />
                                </button>
                                <button
                                  onClick={() => handleDeleteTraining(training.id)}
                                  className={`p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors`}
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {pagination.total > pagination.page_size && (
                    <Pagination
                      currentPage={pagination.page}
                      totalPages={Math.ceil(pagination.total / pagination.page_size)}
                      totalItems={pagination.total}
                      itemsPerPage={pagination.page_size}
                      onPageChange={(page) => setPagination({ ...pagination, page })}
                      darkMode={darkMode}
                    />
                  )}
                </>
              )}
            </div>
          )}

          {/* My Trainings Tab */}
          {activeTab === 'my-trainings' && myTrainings && (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className={`${bgCard} rounded-xl shadow-sm p-6 border ${borderColor}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs ${textSecondary} mb-1`}>Total</p>
                      <p className={`text-2xl font-bold ${textPrimary}`}>{myTrainings.summary.total}</p>
                    </div>
                    <BookOpen className="text-almet-sapphire" size={28} />
                  </div>
                </div>
                <div className={`${bgCard} rounded-xl shadow-sm p-6 border ${borderColor}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs ${textSecondary} mb-1`}>In Progress</p>
                      <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{myTrainings.summary.in_progress}</p>
                    </div>
                    <Clock className="text-yellow-600" size={28} />
                  </div>
                </div>
                <div className={`${bgCard} rounded-xl shadow-sm p-6 border ${borderColor}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs ${textSecondary} mb-1`}>Completed</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">{myTrainings.summary.completed}</p>
                    </div>
                    <CheckCircle className="text-green-600" size={28} />
                  </div>
                </div>
                <div className={`${bgCard} rounded-xl shadow-sm p-6 border ${borderColor}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-xs ${textSecondary} mb-1`}>Overdue</p>
                      <p className="text-2xl font-bold text-red-600 dark:text-red-400">{myTrainings.summary.overdue}</p>
                    </div>
                    <AlertCircle className="text-red-600" size={28} />
                  </div>
                </div>
              </div>

              {/* My Assignments Table */}
              <div className={`${bgCard} rounded-xl shadow-sm overflow-hidden border ${borderColor}`}>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className={`${darkMode ? 'bg-almet-san-juan' : 'bg-gray-50'}`}>
                      <tr>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>Training</th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>Status</th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>Progress</th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>Due Date</th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${textMuted} uppercase tracking-wider`}>Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`${bgCard} divide-y divide-gray-200 dark:divide-gray-700`}>
                      {myTrainings.assignments.map(assignment => (
                        <tr key={assignment.id} className={`hover:${bgCardHover} transition-colors`}>
                          <td className="px-6 py-4">
                            <div>
                              <div className={`text-sm font-medium ${textPrimary}`}>{assignment.training_title}</div>
                              <div className={`text-sm ${textMuted}`}>{assignment.training_id}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                              {assignment.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                <div
                                  className="bg-almet-sapphire h-2 rounded-full transition-all"
                                  style={{ width: `${assignment.progress_percentage}%` }}
                                ></div>
                              </div>
                              <span className={`text-sm ${textSecondary}`}>{assignment.progress_percentage}%</span>
                            </div>
                          </td>
                          <td className={`px-6 py-4 text-sm ${textPrimary}`}>
                            {assignment.due_date || 'No deadline'}
                          </td>
                          <td className="px-6 py-4">
                            <button className="text-almet-sapphire hover:text-almet-astral text-sm font-medium">
                              Continue
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Training Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className={`${bgCard} rounded-xl shadow-xl max-w-4xl w-full my-8 max-h-[90vh] overflow-y-auto border ${borderColor}`}>
            <div className={`flex items-center justify-between px-4 py-2 border-b ${borderColor} sticky top-0 ${bgCard} z-10`}>
              <h3 className={`text-xl font-semibold ${textPrimary}`}>
                {showEditModal ? 'Edit Training' : 'Create New Training'}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                }}
                className={`${textMuted} hover:${textPrimary} transition-colors p-2 hover:${bgCardHover} rounded-lg`}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitTraining} className="p-6 space-y-6">
              {/* Basic Info Section */}
              <div className="space-y-4">
          
                
                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className={`w-full px-4 py-2.5 border rounded-lg ${bgCard} ${textPrimary} focus:ring-2 focus:ring-almet-sapphire focus:border-transparent outline-none text-sm ${
                      errors.title ? 'border-red-500' : borderColor
                    }`}
                    placeholder="Enter training title"
                  />
                  {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
                </div>

                <div>
                  <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={4}
                    className={`w-full px-4 py-2.5 border rounded-lg ${bgCard} ${textPrimary} focus:ring-2 focus:ring-almet-sapphire focus:border-transparent outline-none text-sm ${
                      errors.description ? 'border-red-500' : borderColor
                    }`}
                    placeholder="Enter training description"
                  />
                  {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>

                <div className="grid grid-cols-2 gap-12 items-center">
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                      Completion Deadline (days)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.completion_deadline_days}
                      onChange={(e) => setFormData({...formData, completion_deadline_days: e.target.value})}
                      className={`w-full px-4 py-2.5 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:ring-2 focus:ring-almet-sapphire outline-none text-sm`}
                      placeholder="e.g., 30"
                    />
                  </div>

                  <div className='mt-3' >
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.requires_completion}
                      onChange={(e) => setFormData({...formData, requires_completion: e.target.checked})}
                      className="w-4 h-4 text-almet-sapphire border-gray-300 rounded focus:ring-almet-sapphire"
                    />
                    <span className={`text-sm ${textSecondary}`}>Requires Completion</span>
                  </label>
                </div>
                </div>

        
              </div>

              {/* Materials Section */}
              <div className={`space-y-4 border-t ${borderColor} pt-6`}>
                <div className="flex items-center justify-between">
                  <h4 className={`text-lg font-semibold ${textPrimary}`}>Training Materials</h4>
                  {formData.materials.length > 0 && (
                    <span className={`text-sm ${textMuted}`}>
                      {formData.materials.length} material{formData.materials.length !== 1 ? 's' : ''} added
                    </span>
                  )}
                </div>
                
                {/* Materials List */}
                {formData.materials.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {formData.materials.map((material) => (
                      <div key={material.tempId} className={`flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800`}>
                        <div className="flex items-center gap-3">
                          <FileText size={20} className="text-green-600" />
                          <div>
               
                            <div className={`text-xs ${textMuted}`}>
                          
                              {material.file && ` • ${material.file.name} (${(material.file.size / 1024).toFixed(2)} KB)`}
                          
                 
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveMaterial(material.tempId)}
                          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Material Form */}
                <div className={`${darkMode ? 'bg-almet-san-juan' : 'bg-gray-50'} rounded-lg p-4 space-y-4 border ${borderColor}`}>
                  <p className={`text-sm ${textSecondary}`}>
                    Fill in the fields below to add materials. You can add multiple materials before creating the training.
                  </p>
                  
                

                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                      Upload File
                    </label>
                    <input
                      type="file"
                      id="material-file-input"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        setMaterialForm({...materialForm, file: file});
                      }}
                      className={`w-full px-4 py-2.5 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:ring-2 focus:ring-almet-sapphire outline-none text-sm`}
                    />
                  </div>


                

                  {( materialForm.file ) && (
                    <button
                      type="button"
                      onClick={handleAddMaterial}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                    >
                      <Plus size={16} />
                      Add to List
                    </button>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`flex items-center justify-end gap-3 pt-3 border-t ${borderColor}`}>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                  }}
                  className={`px-4 py-2 ${textSecondary} hover:${bgCardHover} rounded-lg transition-colors text-xs`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex items-center gap-2 px-6 py-2 bg-almet-sapphire hover:bg-almet-astral text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                >
                  {submitLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      {showEditModal ? 'Update Training' : 'Create Training'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


{/* Training Detail Modal */}
{showDetailModal && selectedTraining && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
    <div className={`${bgCard} rounded-xl shadow-xl max-w-4xl w-full my-8 border ${borderColor}`}>
      <div className={`flex items-center justify-between px-4 py-3 border-b ${borderColor}`}>
        <h3 className={`text-xl font-semibold ${textPrimary}`}>
          Training Details
        </h3>
        <button
          onClick={() => setShowDetailModal(false)}
          className={`${textMuted} hover:${textPrimary} transition-colors p-2 hover:${bgCardHover} rounded-lg`}
        >
          <X size={24} />
        </button>
      </div>

      <div className="p-4 space-y-6 max-h-[70vh] overflow-y-auto">
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <span className={`text-xs ${textMuted}`}>{selectedTraining.training_id}</span>
              <h4 className={`text-xl font-bold ${textPrimary} `}>{selectedTraining.title}</h4>
            </div>
          </div>
          <p className={textSecondary}>{selectedTraining.description}</p>
        </div>

        {/* Statistics */}
        <div>
          <h5 className={`text-lg font-semibold ${textPrimary} mb-3`}>Statistics</h5>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="text-xs text-blue-600 dark:text-blue-400">Total Assignments</div>
              <div className="text-sm font-bold text-blue-700 dark:text-blue-300 mt-1">
                {selectedTraining.total_assignments}
              </div>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
              <div className="text-xs text-green-600 dark:text-green-400">Completed</div>
              <div className="text-sm font-bold text-green-700 dark:text-green-300 mt-1">
                {selectedTraining.completed_assignments}
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
              <div className="text-xs text-yellow-600 dark:text-yellow-400">In Progress</div>
              <div className="text-sm font-bold text-yellow-700 dark:text-yellow-300 mt-1">
                {selectedTraining.in_progress_assignments}
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
              <div className="text-xs text-red-600 dark:text-red-400">Overdue</div>
              <div className="text-sm font-bold text-red-700 dark:text-red-300 mt-1">
                {selectedTraining.overdue_assignments}
              </div>
            </div>
          </div>
        </div>

        {/* Materials - UPDATED SECTION */}
        {selectedTraining.materials && selectedTraining.materials.length > 0 && (
          <div>
            <h5 className={`text-lg font-semibold ${textPrimary} mb-3`}>Training Materials</h5>
            <div className="space-y-3">
              {selectedTraining.materials.map(material => (
                <div key={material.id} className={`p-4 ${darkMode ? 'bg-almet-san-juan' : 'bg-gray-50'} rounded-lg border ${borderColor}`}>
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={20} className={textMuted} />
                    <div className={`text-sm font-semibold ${textPrimary}`}>
                    File
                    </div>
                  </div>
                  
                  {/* File Section */}
                  {material.file && (
                    <div className="mb-3 pl-7">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className={`text-xs ${textMuted} mb-1`}>📄 Uploaded File</div>
                          <div className={`text-sm ${textSecondary} font-medium`}>
                            {material.file_url && material.file_url.split('/').pop()}
                          </div>
                          {material.file_size_display && (
                            <div className={`text-xs ${textMuted} mt-1`}>
                              Size: {material.file_size_display.split(' • ')[0]}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleViewPdf(material.file_url)}
                            className="text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-2 rounded-lg transition-colors"
                            title="View File"
                          >
                            <Eye size={18} />
                          </button>
                          <a
                            href={material.file_url}
                            download
                            className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 p-2 rounded-lg transition-colors"
                            title="Download File"
                          >
                            <Download size={18} />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                  
              
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
)}
      {/* Bulk Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className={`${bgCard} rounded-xl shadow-xl max-w-2xl w-full my-8 border ${borderColor}`}>
            <div className={`flex items-center justify-between px-4 py-3 border-b ${borderColor}`}>
              <h3 className={`text-xl font-semibold ${textPrimary}`}>
                Bulk Assign Trainings
              </h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className={`${textMuted} hover:${textPrimary} transition-colors p-2 hover:${bgCardHover} rounded-lg`}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmitAssignment} className="p-4 space-y-4">
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 mb-4">
                <p className="text-xs text-sky-800 dark:text-blue-200">
                  <strong>Selected Trainings:</strong> {assignFormData.training_ids.length}
                </p>
                <p className="text-xs text-sky-600 dark:text-blue-300 mt-1">
                  These trainings will be assigned to all selected employees
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Select Employees *
                </label>
                <MultiSelect
                  options={employeeOptions}
                  selected={assignFormData.employee_ids}
                  onChange={handleEmployeeChange}
                  placeholder="Select employees..."
                  fieldName="employee_ids"
                  darkMode={darkMode}
                />
                {errors.employee_ids && <p className="mt-1 text-sm text-red-600">{errors.employee_ids}</p>}
                <p className={`mt-1 text-xs ${textMuted}`}>
                  Search and select employees to assign trainings
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                  Due Date
                </label>
                <input
                  type="date"
                  value={assignFormData.due_date}
                  onChange={(e) => setAssignFormData({...assignFormData, due_date: e.target.value})}
                  className={`w-full px-4 py-2.5 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:ring-2 focus:ring-almet-sapphire outline-none text-sm`}
                />
              </div>

              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={assignFormData.is_mandatory}
                    onChange={(e) => setAssignFormData({...assignFormData, is_mandatory: e.target.checked})}
                    className="w-4 h-4 text-almet-sapphire border-gray-300 rounded focus:ring-almet-sapphire"
                  />
                  <span className={`text-sm ${textSecondary}`}>Mandatory Training</span>
                </label>
              </div>

              <div className={`flex items-center justify-end gap-3 pt-4 border-t ${borderColor}`}>
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className={`px-4 py-2 ${textSecondary} hover:${bgCardHover} rounded-lg transition-colors text-sm`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex items-center gap-2 px-6 py-2 bg-almet-sapphire hover:bg-almet-astral text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {submitLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Assigning...
                    </>
                  ) : (
                    <>
                      <Users size={18} />
                      Assign Trainings
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

{showPdfViewerModal && pdfUrl && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className={`${bgCard} rounded-xl shadow-xl w-full max-w-6xl h-[90vh] flex flex-col border ${borderColor}`}>
      <div className={`flex items-center justify-between p-4 border-b ${borderColor}`}>
        <h3 className={`text-lg font-semibold ${textPrimary}`}>PDF Viewer</h3>
        <div className="flex items-center gap-3">
          <a
            href={pdfUrl}
            download
            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
          >
            <Download size={16} />
            Download
          </a>
          <button
            onClick={() => {
              setShowPdfViewerModal(false);
              setPdfUrl('');
            }}
            className={`${textMuted} hover:${textPrimary} transition-colors p-2 hover:${bgCardHover} rounded-lg`}
          >
            <X size={24} />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-900">
        {/* Loading indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-almet-sapphire mx-auto mb-4"></div>
            <p className={textSecondary}>Loading PDF...</p>
          </div>
        </div>
        {/* PDF iframe with better loading */}
        <iframe
          src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1&view=FitH`}
          className="w-full h-full"
          title="PDF Viewer"
          onLoad={(e) => {
            // Hide loading indicator when PDF loads
            e.target.previousSibling?.remove();
          }}
        />
      </div>
    </div>
  </div>
)}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteConfirm.show}
        onClose={() => setDeleteConfirm({ show: false, id: null })}
        onConfirm={confirmDelete}
        title="Delete Training"
        message="Are you sure you want to delete this training? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        loading={false}
        darkMode={darkMode}
      />
    </DashboardLayout>
  );
};

export default TrainingManagement;