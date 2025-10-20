// src/components/news/TargetGroupManagement.jsx - Complete with DashboardLayout & Theme
"use client";

import React, { useState } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { Users, Plus, Search, Edit, Trash2, UserPlus, Tag, Calendar, X, Save, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

// Sample Employee Data - Sənin strukturuna uyğun
const sampleEmployees = [
  { id: 1, name: 'Narmin Orujova', department: 'HR', unit: '', jobFunction: 'STRATEGY EXECUTION', businessFunction: 'Holding', email: 'narmin@company.com', phone: '+1 (613) 701-7937' },
  { id: 2, name: 'John Smith', department: 'IT', unit: 'Software Development', jobFunction: 'Development', businessFunction: 'Technology', email: 'john@company.com', phone: '+1 (555) 123-4567' },
  { id: 3, name: 'Sarah Johnson', department: 'Marketing', unit: 'Brand', jobFunction: 'Brand Management', businessFunction: 'Marketing', email: 'sarah@company.com', phone: '+1 (555) 987-6543' },
  { id: 4, name: 'Mike Brown', department: 'Sales', unit: 'Enterprise', jobFunction: 'Account Management', businessFunction: 'Sales', email: 'mike@company.com', phone: '+1 (555) 456-7890' },
  { id: 5, name: 'Emma Davis', department: 'Finance', unit: 'Analysis', jobFunction: 'Financial Analysis', businessFunction: 'Finance', email: 'emma@company.com', phone: '+1 (555) 321-0987' },
  { id: 6, name: 'David Lee', department: 'HR', unit: 'Talent', jobFunction: 'Recruitment', businessFunction: 'Holding', email: 'david@company.com', phone: '+1 (555) 654-3210' },
  { id: 7, name: 'Lisa Wang', department: 'IT', unit: 'Infrastructure', jobFunction: 'System Administration', businessFunction: 'Technology', email: 'lisa@company.com', phone: '+1 (555) 789-0123' },
  { id: 8, name: 'Tom Wilson', department: 'Sales', unit: 'SMB', jobFunction: 'Sales Executive', businessFunction: 'Sales', email: 'tom@company.com', phone: '+1 (555) 234-5678' }
];

// Sample Target Groups
const initialGroups = [
  {
    id: 1,
    name: 'Leadership Team',
    description: 'Senior leadership and executive team members',
    members: [1, 2, 5],


    createdAt: '2024-01-15',
    isActive: true
  },
  {
    id: 2,
    name: 'Technology Division',
    description: 'All IT and technology department employees',
    members: [2, 7],


    createdAt: '2024-01-20',
    isActive: true
  },
  {
    id: 3,
    name: 'Sales Force',
    description: 'Sales and account management team',
    members: [4, 8],


    createdAt: '2024-01-25',
    isActive: true
  }
];

// Target Group Form Modal
function TargetGroupFormModal({ isOpen, onClose, onSave, group = null, darkMode = false }) {
  const [formData, setFormData] = useState({
    name: group?.name || '',
    description: group?.description || '',
    members: group?.members || [],

    isActive: group?.isActive ?? true
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

  React.useEffect(() => {
    if (group) {
      setFormData({
        name: group.name,
        description: group.description,
        members: group.members,


        isActive: group.isActive
      });
    }
  }, [group, isOpen]);

  if (!isOpen) return null;

  const departments = ['all', ...new Set(sampleEmployees.map(e => e.department))];

  const filteredEmployees = sampleEmployees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDepartment === 'all' || emp.department === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Group name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.members.length === 0) newErrors.members = 'Please select at least one member';

    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      setErrors({ submit: 'Failed to save target group' });
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (employeeId) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.includes(employeeId)
        ? prev.members.filter(id => id !== employeeId)
        : [...prev.members, employeeId]
    }));
    setErrors(prev => ({ ...prev, members: null }));
  };



  const inputClass = `w-full px-3 py-2.5 text-sm border outline-none rounded-lg transition-colors
    ${darkMode 
      ? 'bg-almet-san-juan border-almet-comet text-white focus:border-almet-sapphire' 
      : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
    }`;

  const labelClass = `block text-sm font-medium mb-1.5 ${
    darkMode ? 'text-almet-bali-hai' : 'text-gray-700'
  }`;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className={`rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl ${
        darkMode ? 'bg-almet-cloud-burst' : 'bg-white'
      }`}>
        
        {/* Header */}
        <div className={`px-6 py-4 border-b sticky top-0 z-10 ${
          darkMode 
            ? 'border-almet-comet bg-almet-cloud-burst' 
            : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <h2 className={`text-lg font-semibold ${
              darkMode ? 'text-white' : 'text-gray-900'
            }`}>
              {group ? 'Edit Target Group' : 'Create Target Group'}
            </h2>
            <button
              onClick={onClose}
              disabled={loading}
              className={`p-2 rounded-lg transition-colors ${
                darkMode 
                  ? 'hover:bg-almet-comet text-almet-bali-hai' 
                  : 'hover:bg-gray-100 text-gray-500'
              }`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-5">
            
            {/* Group Name */}
            <div>
              <label className={labelClass}>
                Group Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={inputClass}
                placeholder="Enter group name"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className={labelClass}>
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={inputClass}
                rows="3"
                placeholder="Brief description of the group"
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">{errors.description}</p>
              )}
            </div>

            {/* Owner & Active Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         

              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className={`text-sm font-medium ${
                    darkMode ? 'text-almet-bali-hai' : 'text-gray-700'
                  }`}>
                    Active Group
                  </span>
                </label>
              </div>
            </div>


            {/* Members Selection */}
            <div>
              <label className={labelClass}>
                Group Members <span className="text-red-500">*</span>
              </label>
              
              {/* Search & Filter */}
              <div className="flex gap-2 mb-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search employees..."
                    className={inputClass}
                    style={{ paddingLeft: '2.5rem' }}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className={inputClass}
                  style={{ width: 'auto', minWidth: '150px' }}
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept === 'all' ? 'All Departments' : dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Employee List */}
              <div className={`border rounded-lg max-h-80 overflow-y-auto ${
                darkMode ? 'border-almet-comet' : 'border-gray-300'
              }`}>
                {filteredEmployees.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <Users className={`h-12 w-12 mx-auto mb-2 ${
                      darkMode ? 'text-almet-bali-hai' : 'text-gray-400'
                    }`} />
                    <p className="text-sm">No employees found</p>
                  </div>
                ) : (
                  <div className={`divide-y ${
                    darkMode ? 'divide-almet-comet' : 'divide-gray-200'
                  }`}>
                    {filteredEmployees.map(employee => (
                      <label
                        key={employee.id}
                        className={`flex items-center gap-3 p-3 cursor-pointer transition-colors ${
                          darkMode ? 'hover:bg-almet-comet' : 'hover:bg-gray-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={formData.members.includes(employee.id)}
                          onChange={() => toggleMember(employee.id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                          {employee.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {employee.name}
                          </p>
                          <p className={`text-xs truncate ${
                            darkMode ? 'text-almet-bali-hai' : 'text-gray-500'
                          }`}>
                            {employee.department} • {employee.jobFunction}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`text-xs ${
                            darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                          }`}>
                            {employee.businessFunction}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              
              {errors.members && (
                <p className="text-red-500 text-xs mt-1">{errors.members}</p>
              )}
              
              <p className={`text-xs mt-2 ${
                darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
              }`}>
                {formData.members.length} member(s) selected
              </p>
            </div>

            {/* Error Display */}
            {errors.submit && (
              <div className={`p-3 rounded-lg border flex items-center gap-2 ${
                darkMode 
                  ? 'bg-red-900/20 border-red-800 text-red-400' 
                  : 'bg-red-50 border-red-200 text-red-600'
              }`}>
                <AlertCircle size={16} />
                <span className="text-sm">{errors.submit}</span>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className={`flex justify-end gap-3 mt-6 pt-4 border-t ${
            darkMode ? 'border-almet-comet' : 'border-gray-200'
          }`}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={`px-4 py-2.5 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 ${
                darkMode
                  ? 'border border-almet-comet text-almet-bali-hai hover:bg-almet-comet'
                  : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  {group ? 'Update' : 'Create'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main Target Group Management Component
export default function TargetGroupManagement({ onBack }) {
  const { darkMode } = useTheme();
  const [groups, setGroups] = useState(initialGroups);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.description.toLowerCase().includes(searchTerm.toLowerCase())

  );

  const handleCreateGroup = () => {
    setEditingGroup(null);
    setShowFormModal(true);
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group);
    setShowFormModal(true);
  };

  const handleSaveGroup = (formData) => {
    if (editingGroup) {
      setGroups(prev => prev.map(g =>
        g.id === editingGroup.id
          ? { ...g, ...formData, updatedAt: new Date().toISOString() }
          : g
      ));
    } else {
      const newGroup = {
        ...formData,
        id: Date.now(),
        createdAt: new Date().toISOString()
      };
      setGroups(prev => [newGroup, ...prev]);
    }
    setShowFormModal(false);
    setEditingGroup(null);
  };

  const handleDeleteGroup = (group) => {
    setSelectedGroup(group);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setGroups(prev => prev.filter(g => g.id !== selectedGroup.id));
    setShowDeleteModal(false);
    setSelectedGroup(null);
  };

  const getEmployeesByIds = (ids) => {
    return sampleEmployees.filter(emp => ids.includes(emp.id));
  };

  return (
    <DashboardLayout>
      <div className={`p-6 min-h-screen ${
        darkMode ? 'bg-gray-900' : 'bg-almet-mystic'
      }`}>
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                {onBack && (
                  <button
                    onClick={onBack}
                    className={`flex items-center gap-2 text-sm mb-3 transition-colors ${
                      darkMode 
                        ? 'text-almet-bali-hai hover:text-white' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <ArrowLeft size={16} />
                    Back to News
                  </button>
                )}
                <h1 className={`text-2xl font-bold mb-2 ${
                  darkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  Target Groups
                </h1>
                <p className={`text-sm ${
                  darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                }`}>
                  Manage and organize employee groups for targeted communications
                </p>
              </div>
              <button
                onClick={handleCreateGroup}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm shadow-sm"
              >
                <Plus size={18} />
                Create Group
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className={`rounded-xl p-4 border ${
              darkMode 
                ? 'bg-almet-cloud-burst border-almet-comet' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs mb-1 ${
                    darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                  }`}>
                    Total Groups
                  </p>
                  <p className={`text-2xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {groups.length}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${
                  darkMode ? 'bg-blue-900/30' : 'bg-blue-100'
                }`}>
                  <Users className={`h-6 w-6 ${
                    darkMode ? 'text-blue-400' : 'text-blue-600'
                  }`} />
                </div>
              </div>
            </div>

            <div className={`rounded-xl p-4 border ${
              darkMode 
                ? 'bg-almet-cloud-burst border-almet-comet' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs mb-1 ${
                    darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                  }`}>
                    Active Groups
                  </p>
                  <p className={`text-2xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {groups.filter(g => g.isActive).length}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${
                  darkMode ? 'bg-green-900/30' : 'bg-green-100'
                }`}>
                  <Tag className={`h-6 w-6 ${
                    darkMode ? 'text-green-400' : 'text-green-600'
                  }`} />
                </div>
              </div>
            </div>

            <div className={`rounded-xl p-4 border ${
              darkMode 
                ? 'bg-almet-cloud-burst border-almet-comet' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs mb-1 ${
                    darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                  }`}>
                    Total Members
                  </p>
                  <p className={`text-2xl font-bold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {groups.reduce((sum, g) => sum + g.members.length, 0)}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${
                  darkMode ? 'bg-purple-900/30' : 'bg-purple-100'
                }`}>
                  <UserPlus className={`h-6 w-6 ${
                    darkMode ? 'text-purple-400' : 'text-purple-600'
                  }`} />
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className={`rounded-xl p-4 mb-4 border ${
            darkMode 
              ? 'bg-almet-cloud-burst border-almet-comet' 
              : 'bg-white border-gray-200'
          }`}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search groups by name, description"
                className={`w-full pl-10 pr-4 py-2.5 text-sm border rounded-lg outline-none transition-colors ${
                  darkMode
                    ? 'bg-almet-san-juan border-almet-comet text-white focus:border-almet-sapphire'
                    : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500'
                }`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Groups List */}
          {filteredGroups.length === 0 ? (
            <div className={`rounded-xl p-12 text-center border ${
              darkMode 
                ? 'bg-almet-cloud-burst border-almet-comet' 
                : 'bg-white border-gray-200'
            }`}>
              <Users className={`h-16 w-16 mx-auto mb-4 ${
                darkMode ? 'text-almet-bali-hai' : 'text-gray-400'
              }`} />
              <h3 className={`text-lg font-semibold mb-2 ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                No Groups Found
              </h3>
              <p className={`text-sm mb-4 ${
                darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
              }`}>
                {searchTerm ? 'Try adjusting your search' : 'Get started by creating your first target group'}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleCreateGroup}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  <Plus size={16} />
                  Create Group
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredGroups.map(group => {
                const members = getEmployeesByIds(group.members);
                
                return (
                  <div
                    key={group.id}
                    className={`rounded-xl p-5 border transition-shadow ${
                      darkMode
                        ? 'bg-almet-cloud-burst border-almet-comet hover:shadow-lg hover:shadow-almet-sapphire/10'
                        : 'bg-white border-gray-200 hover:shadow-md'
                    }`}
                  >
                    {/* Group Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className={`text-lg font-semibold ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {group.name}
                          </h3>
                          {group.isActive ? (
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              darkMode 
                                ? 'bg-green-900/30 text-green-400' 
                                : 'bg-green-100 text-green-700'
                            }`}>
                              Active
                            </span>
                          ) : (
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                              darkMode 
                                ? 'bg-gray-700 text-gray-400' 
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              Inactive
                            </span>
                          )}
                        </div>
                        <p className={`text-sm ${
                          darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                        }`}>
                          {group.description}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleEditGroup(group)}
                          className={`p-2 rounded-lg transition-colors ${
                            darkMode 
                              ? 'hover:bg-almet-comet text-almet-bali-hai' 
                              : 'hover:bg-gray-100 text-gray-600'
                          }`}
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(group)}
                          className={`p-2 rounded-lg transition-colors ${
                            darkMode 
                              ? 'hover:bg-red-900/30 text-red-400' 
                              : 'hover:bg-red-50 text-red-600'
                          }`}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

         

                    {/* Members Preview */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Users size={14} className={
                          darkMode ? 'text-almet-bali-hai' : 'text-gray-500'
                        } />
                        <span className={`text-xs font-medium ${
                          darkMode ? 'text-almet-bali-hai' : 'text-gray-700'
                        }`}>
                          {members.length} Member{members.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {members.slice(0, 4).map(member => (
                          <div
                            key={member.id}
                            className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg ${
                              darkMode 
                                ? 'bg-almet-san-juan' 
                                : 'bg-gray-50'
                            }`}
                          >
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-medium">
                              {member.name.charAt(0)}
                            </div>
                            <span className={`text-xs ${
                              darkMode ? 'text-almet-bali-hai' : 'text-gray-700'
                            }`}>
                              {member.name}
                            </span>
                          </div>
                        ))}
                        {members.length > 4 && (
                          <div className={`flex items-center px-2.5 py-1.5 rounded-lg ${
                            darkMode 
                              ? 'bg-almet-comet' 
                              : 'bg-gray-100'
                          }`}>
                            <span className={`text-xs font-medium ${
                              darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                            }`}>
                              +{members.length - 4} more
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Meta Info */}
                    <div className={`pt-3 border-t flex items-center justify-between text-xs ${
                      darkMode 
                        ? 'border-almet-comet text-almet-bali-hai' 
                        : 'border-gray-200 text-gray-600'
                    }`}>
                      <div className="flex items-center gap-1">
                        <Calendar size={12} />
                        Created {new Date(group.createdAt).toLocaleDateString()}
                      </div>
                    
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Form Modal */}
          <TargetGroupFormModal
            isOpen={showFormModal}
            onClose={() => {
              setShowFormModal(false);
              setEditingGroup(null);
            }}
            onSave={handleSaveGroup}
            group={editingGroup}
            darkMode={darkMode}
          />

          {/* Delete Confirmation Modal */}
          {showDeleteModal && selectedGroup && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className={`rounded-xl max-w-md w-full p-6 shadow-xl ${
                darkMode ? 'bg-almet-cloud-burst' : 'bg-white'
              }`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`p-3 rounded-lg ${
                    darkMode ? 'bg-red-900/30' : 'bg-red-100'
                  }`}>
                    <AlertCircle className={`h-6 w-6 ${
                      darkMode ? 'text-red-400' : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <h3 className={`text-lg font-semibold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Delete Group
                    </h3>
                    <p className={`text-sm ${
                      darkMode ? 'text-almet-bali-hai' : 'text-gray-600'
                    }`}>
                      This action cannot be undone
                    </p>
                  </div>
                </div>
                
                <p className={`text-sm mb-6 ${
                  darkMode ? 'text-almet-bali-hai' : 'text-gray-700'
                }`}>
                  Are you sure you want to delete <span className={`font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    "{selectedGroup.name}"
                  </span>? 
                  This will remove the group but will not affect the member employees.
                </p>
                
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedGroup(null);
                    }}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      darkMode
                        ? 'border border-almet-comet text-almet-bali-hai hover:bg-almet-comet'
                        : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete Group
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}