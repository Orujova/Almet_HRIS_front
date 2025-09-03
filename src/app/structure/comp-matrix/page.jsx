'use client';
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Save, X, Search, Grid, Target, BarChart3, 
  Download, Upload, ChevronDown, ChevronRight, Loader2, RefreshCw,
  AlertCircle, CheckCircle, Building, Users
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTheme } from '@/components/common/ThemeProvider';
import { competencyApi } from '@/services/competencyApi';
import AssessmentMatrix from './AssessmentMatrix';

// Button Component
const ActionButton = ({ onClick, icon: Icon, label, variant = 'primary', disabled = false, loading = false, size = 'md' }) => {
  const { darkMode } = useTheme();
  
  const variants = {
    primary: `bg-almet-sapphire hover:bg-almet-astral text-white`,
    secondary: `bg-almet-bali-hai hover:bg-almet-waterloo text-white`,
    success: `bg-green-500 hover:bg-green-600 text-white`,
    danger: `bg-red-500 hover:bg-red-600 text-white`,
    outline: `border-2 border-almet-sapphire text-almet-sapphire hover:bg-almet-sapphire hover:text-white bg-transparent`,
    warning: `bg-yellow-500 hover:bg-yellow-600 text-white`,
  };
  
  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-xs',
    lg: 'px-4 py-2 text-sm'
  };
  
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        flex items-center gap-2 rounded-lg font-medium transition-all duration-200 
        ${variants[variant]} ${sizes[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
      `}
    >
      {loading ? <Loader2 size={16} className="animate-spin" /> : <Icon size={16} />}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
};

const InputField = ({ label, value, onChange, placeholder, type = 'text', required = false, className = '', error = null }) => {
  const { darkMode } = useTheme();
  
  return (
    <div className="space-y-2">
      {label && (
        <label className={`block text-sm font-medium ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
          {label} {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`
          w-full px-3 py-2 rounded-lg border-2 text-xs font-medium transition-all duration-200
          ${error 
            ? 'border-red-400 focus:border-red-500' 
            : `border-gray-200 focus:border-almet-sapphire`
          }
          ${darkMode 
            ? 'bg-almet-cloud-burst text-white placeholder-almet-bali-hai border-almet-comet' 
            : 'bg-white text-almet-cloud-burst placeholder-almet-waterloo'
          }
          focus:outline-none ${className}
        `}
      />
      {error && (
        <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
          <AlertCircle size={12} />
          {error}
        </p>
      )}
    </div>
  );
};

// Loading Spinner Component
const LoadingSpinner = ({ message = 'Loading...' }) => {
  const { darkMode } = useTheme();
  
  return (
    <div className={`text-center py-12 px-6 rounded-xl ${darkMode ? 'bg-almet-cloud-burst' : 'bg-white'} shadow-lg border-2 ${darkMode ? 'border-almet-comet' : 'border-gray-200'}`}>
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-almet-mystic border-t-almet-sapphire rounded-full animate-spin"></div>
        <div className="space-y-2">
          <h3 className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
            {message}
          </h3>
          <p className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'}`}>
            Please wait while we fetch your data...
          </p>
        </div>
      </div>
    </div>
  );
};

// Error Display Component
const ErrorDisplay = ({ error, onRetry }) => {
  const { darkMode } = useTheme();
  
  return (
    <div className={`text-center py-8 px-4 rounded-lg ${darkMode ? 'bg-almet-cloud-burst' : 'bg-white'} border border-red-200 shadow-md`}>
      <div className="w-12 h-12 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center">
        <X className="w-6 h-6 text-red-500" />
      </div>
      <h3 className={`text-base font-bold mb-2 ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
        Something went wrong
      </h3>
      <p className={`text-xs mb-4 ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} max-w-sm mx-auto`}>
        {error?.message || 'An unexpected error occurred.'}
      </p>
      {onRetry && (
        <ActionButton
          icon={RefreshCw}
          label="Try Again"
          onClick={onRetry}
          variant="primary"
          size="lg"
        />
      )}
    </div>
  );
};

// Success Toast Component
const SuccessToast = ({ message, onClose }) => {
  const { darkMode } = useTheme();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className="fixed bottom-6 right-6 bg-green-50 border-2 border-green-200 rounded-xl p-4 shadow-2xl z-50 max-w-sm">
      <div className="flex items-start gap-3">
        <div className="p-1 bg-green-100 rounded-lg">
          <CheckCircle className="h-5 w-5 text-green-600" />
        </div>
        <div className="flex-1">
          <h4 className="text-green-800 font-bold text-sm">Success!</h4>
          <p className="text-green-700 text-sm mt-1">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-green-600 hover:text-green-800 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

// Main Component
const CompetencyMatrixSystem = () => {
  const { darkMode } = useTheme();
  
  // States
  const [activeView, setActiveView] = useState('skills');
  const [editMode, setEditMode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddGroupForm, setShowAddGroupForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [expandedGroups, setExpandedGroups] = useState(new Set());
  const [newItem, setNewItem] = useState({ group: '', item: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [editValue, setEditValue] = useState('');

  // Data States
  const [skillGroups, setSkillGroups] = useState([]);
  const [behavioralGroups, setBehavioralGroups] = useState([]);
  const [skillsData, setSkillsData] = useState({});
  const [behavioralData, setBehavioralData] = useState({});

  // Theme classes
  const bgApp = darkMode ? 'bg-gray-900' : 'bg-almet-mystic';
  const bgCard = darkMode ? 'bg-almet-cloud-burst' : 'bg-white';
  const bgCardHover = darkMode ? 'bg-almet-san-juan' : 'bg-gray-50';
  const textPrimary = darkMode ? 'text-white' : 'text-almet-cloud-burst';
  const textSecondary = darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo';
  const borderColor = darkMode ? 'border-almet-comet' : 'border-gray-200';
  const bgAccent = darkMode ? 'bg-almet-comet' : 'bg-almet-mystic';

  // Data fetching
  const fetchData = async () => {
    setDataLoading(true);
    setError(null);
    
    try {
      const [skillGroupsResponse, behavioralGroupsResponse] = await Promise.all([
        competencyApi.skillGroups.getAll(),
        competencyApi.behavioralGroups.getAll()
      ]);

      const skillGroupsList = skillGroupsResponse.results || [];
      const behavioralGroupsList = behavioralGroupsResponse.results || [];

      setSkillGroups(skillGroupsList);
      setBehavioralGroups(behavioralGroupsList);

      // Fetch detailed data for each group
      const skillGroupsDetails = await Promise.all(
        skillGroupsList.map(group => competencyApi.skillGroups.getById(group.id))
      );

      const behavioralGroupsDetails = await Promise.all(
        behavioralGroupsList.map(group => competencyApi.behavioralGroups.getById(group.id))
      );

      // Transform data
      const transformedSkillsData = {};
      skillGroupsDetails.forEach(group => {
        transformedSkillsData[group.name] = group.skills?.map(skill => ({
          id: skill.id,
          name: skill.name,
          created_at: skill.created_at,
          updated_at: skill.updated_at
        })) || [];
      });

      const transformedBehavioralData = {};
      behavioralGroupsDetails.forEach(group => {
        transformedBehavioralData[group.name] = group.competencies?.map(comp => ({
          id: comp.id,
          name: comp.name,
          created_at: comp.created_at,
          updated_at: comp.updated_at
        })) || [];
      });

      setSkillsData(transformedSkillsData);
      setBehavioralData(transformedBehavioralData);

    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Helper functions
  const showSuccess = (message) => {
    setSuccessMessage(message);
  };

  const findGroupByName = (groupName) => {
    const groups = activeView === 'skills' ? skillGroups : behavioralGroups;
    return groups.find(g => g.name === groupName);
  };

  // Filter data
  const getFilteredData = (data) => {
    if (!data) return {};
    let filtered = { ...data };
    
    if (selectedGroup) {
      filtered = { [selectedGroup]: data[selectedGroup] || [] };
    }
    
    if (searchTerm) {
      const searchFiltered = {};
      Object.keys(filtered).forEach((group) => {
        const items = filtered[group].filter((item) => {
          const itemName = typeof item === 'string' ? item : item.name;
          return (
            itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            group.toLowerCase().includes(searchTerm.toLowerCase())
          );
        });
        if (items.length > 0) {
          searchFiltered[group] = items;
        }
      });
      filtered = searchFiltered;
    }
    
    return filtered;
  };

  const currentData = activeView === 'skills' ? skillsData : behavioralData;
  const setCurrentData = activeView === 'skills' ? setSkillsData : setBehavioralData;
  const filteredData = getFilteredData(currentData);

  // Event handlers
  const handleAddItem = async () => {
    if (!newItem.group || !newItem.item) return;
    
    setIsLoading(true);
    try {
      const group = findGroupByName(newItem.group);
      if (!group) {
        throw new Error('Group not found');
      }

      if (activeView === 'skills') {
        await competencyApi.skills.create({
          group: group.id,
          name: newItem.item
        });
      } else {
        await competencyApi.behavioralCompetencies.create({
          group: group.id,
          name: newItem.item
        });
      }

      await fetchData();
      setNewItem({ group: '', item: '', description: '' });
      setShowAddForm(false);
      showSuccess(`${newItem.item} successfully added to ${newItem.group}`);
    } catch (error) {
      console.error('Error adding item:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return;
    
    setIsLoading(true);
    try {
      if (activeView === 'skills') {
        await competencyApi.skillGroups.create({ name: newGroupName.trim() });
      } else {
        await competencyApi.behavioralGroups.create({ name: newGroupName.trim() });
      }

      await fetchData();
      setNewGroupName('');
      setShowAddGroupForm(false);
      showSuccess(`Group "${newGroupName.trim()}" successfully created`);
    } catch (error) {
      console.error('Error adding group:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGroup = async (groupName) => {
    if (!confirm(`Are you sure you want to delete "${groupName}" and all its items?`)) return;
    
    setIsLoading(true);
    try {
      const group = findGroupByName(groupName);
      if (!group) {
        throw new Error('Group not found');
      }

      if (activeView === 'skills') {
        await competencyApi.skillGroups.delete(group.id);
      } else {
        await competencyApi.behavioralGroups.delete(group.id);
      }

      await fetchData();
      if (selectedGroup === groupName) setSelectedGroup('');
      setExpandedGroups((prev) => {
        const newExpanded = new Set(prev);
        newExpanded.delete(groupName);
        return newExpanded;
      });
      showSuccess(`Group "${groupName}" successfully deleted`);
    } catch (error) {
      console.error('Error deleting group:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (group, itemIndex) => {
    const item = currentData[group][itemIndex];
    const itemId = typeof item === 'object' ? item.id : null;
    
    if (!itemId) {
      setCurrentData((prev) => ({
        ...prev,
        [group]: prev[group].filter((_, index) => index !== itemIndex),
      }));
      return;
    }

    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) return;

    setIsLoading(true);
    try {
      if (activeView === 'skills') {
        await competencyApi.skills.delete(itemId);
      } else {
        await competencyApi.behavioralCompetencies.delete(itemId);
      }
      
      await fetchData();
      showSuccess('Item successfully deleted');
    } catch (error) {
      console.error('Error deleting item:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditItem = async (group, itemIndex, newValue) => {
    const item = currentData[group][itemIndex];
    const itemId = typeof item === 'object' ? item.id : null;
    
    if (!itemId) {
      setCurrentData((prev) => ({
        ...prev,
        [group]: prev[group].map((item, index) => 
          index === itemIndex ? newValue : item
        ),
      }));
      setEditMode(null);
      return;
    }

    setIsLoading(true);
    try {
      const groupObj = findGroupByName(group);
      if (!groupObj) {
        throw new Error('Group not found');
      }

      const updateData = {
        group: groupObj.id,
        name: newValue
      };

      if (activeView === 'skills') {
        await competencyApi.skills.update(itemId, updateData);
      } else {
        await competencyApi.behavioralCompetencies.update(itemId, updateData);
      }
      
      await fetchData();
      setEditMode(null);
      setEditingItem(null);
      setEditValue('');
      showSuccess('Item successfully updated');
    } catch (error) {
      console.error('Error updating item:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const startEdit = (group, itemIndex) => {
    const item = currentData[group][itemIndex];
    const itemName = typeof item === 'object' ? item.name : item;
    
    setEditMode(`${group}-${itemIndex}`);
    setEditingItem({ group, itemIndex });
    setEditValue(itemName);
  };

  const cancelEdit = () => {
    setEditMode(null);
    setEditingItem(null);
    setEditValue('');
  };

  const saveEdit = () => {
    if (!editingItem || !editValue.trim()) return;
    handleEditItem(editingItem.group, editingItem.itemIndex, editValue.trim());
  };

  const toggleGroupExpansion = (groupName) => {
    setExpandedGroups((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(groupName)) {
        newExpanded.delete(groupName);
      } else {
        newExpanded.add(groupName);
      }
      return newExpanded;
    });
  };

  // Statistics
  const stats = useMemo(() => {
    const totalGroups = Object.keys(currentData).length;
    const totalItems = Object.values(currentData).reduce((sum, items) => sum + items.length, 0);
    const avgItemsPerGroup = totalGroups > 0 ? Math.round(totalItems / totalGroups * 10) / 10 : 0;
    return { totalGroups, totalItems, avgItemsPerGroup };
  }, [currentData]);

  // Show loading state
  if (dataLoading) {
    return (
      <DashboardLayout>
        <div className={`min-h-screen ${bgApp} p-6`}>
          <div className="max-w-7xl mx-auto">
            <LoadingSpinner message="Loading competency data..." />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Show error state
  if (error && !dataLoading) {
    return (
      <DashboardLayout>
        <div className={`min-h-screen ${bgApp} p-6`}>
          <div className="max-w-7xl mx-auto">
            <ErrorDisplay error={error} onRetry={fetchData} />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className={`min-h-screen ${bgApp} p-6`}>
        <div className="max-w-7xl mx-auto ">
          {/* Header */}
          <header className={`${bgCard} rounded-lg p-4 mb-6 shadow-md border ${borderColor}`}>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4">
              <div className="space-y-1">
                <h1 className={`text-xl font-bold ${textPrimary} flex items-center gap-2`}>
                  <div className="p-1.5 bg-almet-mystic rounded-md">
                    <Target className="w-5 h-5 text-almet-sapphire" />
                  </div>
                  Competency Matrix
                </h1>
                <p className={`text-xs ${textSecondary}`}>
                  Manage skills and behavioral competencies
                </p>
              </div>
              
              <div className="flex items-center gap-2 mt-2 lg:mt-0">
                <div className={`px-3 py-1 ${bgAccent} rounded-md`}>
                  <span className={`text-xs font-medium ${textSecondary}`}>
                    {stats.totalGroups} groups, {stats.totalItems} items
                  </span>
                </div>
              </div>
            </div>
          </header>

          {/* Navigation Tabs */}
          <nav className={`${bgCard} rounded-lg mb-6 p-1.5 shadow-md border ${borderColor}`}>
            <div className="flex space-x-1">
              {[
                { id: 'skills', name: 'Skills', icon: Target },
                { id: 'behavioral', name: 'Behavioral', icon: Users },
                { id: 'matrix', name: 'Assessment Matrix', icon: BarChart3 },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-200 ${
                    activeView === tab.id
                      ? `bg-almet-sapphire text-white shadow-md`
                      : `${textSecondary} hover:${textPrimary} hover:bg-almet-mystic`
                  }`}
                >
                  <tab.icon size={16} />
                  <span className="hidden sm:block text-xs">{tab.name}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Search and Filter */}
          {activeView !== 'matrix' && (
            <section className={`${bgCard} rounded-lg p-4 mb-6 shadow-md border ${borderColor}`}>
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textSecondary} pointer-events-none`} size={16} />
                  <InputField
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="pl-10 text-xs"
                  />
                </div>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className={`px-3 py-2 border rounded-lg text-xs font-medium ${bgCard} ${textPrimary} focus:outline-none focus:border-almet-sapphire transition-all duration-200 min-w-40`}
                >
                  <option value="">All Groups</option>
                  {Object.keys(currentData).map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <ActionButton 
                    icon={Plus} 
                    label="Add Item" 
                    onClick={() => setShowAddForm(true)} 
                    loading={isLoading}
                    variant="primary"
                    size="sm"
                  />
                  <ActionButton 
                    icon={Plus} 
                    label="Add Group" 
                    onClick={() => setShowAddGroupForm(true)}
                    loading={isLoading}
                    variant="success"
                    size="sm"
                  />
                </div>
              </div>
            </section>
          )}

          {/* Content */}
          <section className={`${activeView === 'matrix' ? '' : bgCard + ' border ' + borderColor + ' shadow-md'} rounded-lg mb-6 overflow-hidden`}>
            {activeView === 'matrix' ? (
              <AssessmentMatrix />
            ) : (
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-base font-bold ${textPrimary} flex items-center gap-2`}>
                    {activeView === 'skills' ? (
                      <>
                        <Target className="w-4 h-4 text-almet-sapphire" />
                        Skills Groups
                      </>
                    ) : (
                      <>
                        <Users className="w-4 h-4 text-almet-sapphire" />
                        Behavioral Competencies
                      </>
                    )}
                  </h2>
                  <div className={`px-3 py-1 ${bgAccent} rounded-md`}>
                    <span className={`text-xs font-medium ${textSecondary}`}>
                      {Object.keys(filteredData).length} groups
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {Object.keys(filteredData).map((group) => {
                    const isExpanded = expandedGroups.has(group);
                    return (
                      <article key={group} className={`border-2 ${borderColor} rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200`}>
                        <div className={`flex items-center justify-between p-4 ${bgAccent} border-b-2 ${borderColor}`}>
                          <button
                            onClick={() => toggleGroupExpansion(group)}
                            className={`flex items-center gap-3 text-base font-bold ${textPrimary} hover:text-almet-sapphire transition-colors`}
                          >
                            <div className={`p-2 rounded-lg ${isExpanded ? 'bg-almet-sapphire text-white' : 'bg-gray-200'}`}>
                              {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                            </div>
                            <span className="truncate">{group}</span>
                          </button>
                          <div className="flex items-center gap-3">
                            <div className={`px-3 py-1 ${bgCard} rounded-full border-2 ${borderColor}`}>
                              <span className={`text-sm font-semibold ${textPrimary}`}>
                                {filteredData[group].length} items
                              </span>
                            </div>
                            <ActionButton
                              onClick={() => handleDeleteGroup(group)}
                              icon={Trash2}
                              label="Delete"
                              disabled={isLoading}
                              loading={isLoading}
                              variant="danger"
                              size="sm"
                            />
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className="p-4 space-y-3">
                            {filteredData[group].length > 0 ? (
                              filteredData[group].map((item, index) => {
                                const itemName = typeof item === 'string' ? item : item.name;
                                const editKey = `${group}-${index}`;
                                return (
                                  <div
                                    key={index}
                                    className={`flex items-center justify-between p-4 ${bgCardHover} rounded-lg border-2 ${borderColor} hover:shadow-md transition-all duration-200`}
                                  >
                                    {editMode === editKey ? (
                                      <div className="flex-1 flex items-center gap-3">
                                        <InputField
                                          value={editValue}
                                          onChange={(e) => setEditValue(e.target.value)}
                                          className="flex-1"
                                          placeholder="Enter item name"
                                        />
                                        <div className="flex gap-2">
                                          <ActionButton
                                            onClick={saveEdit}
                                            icon={Save}
                                            label="Save"
                                            variant="success"
                                            size="sm"
                                            loading={isLoading}
                                          />
                                          <ActionButton
                                            onClick={cancelEdit}
                                            icon={X}
                                            label="Cancel"
                                            variant="outline"
                                            size="sm"
                                          />
                                        </div>
                                      </div>
                                    ) : (
                                      <>
                                        <div className="flex items-center gap-3 flex-1">
                                          <div className="w-2 h-2 bg-almet-sapphire rounded-full"></div>
                                          <span className={`text-sm font-medium ${textPrimary}`}>{itemName}</span>
                                          {typeof item === 'object' && item.created_at && (
                                            <span className={`text-xs ${textSecondary} ml-2`}>
                                              Added {new Date(item.created_at).toLocaleDateString()}
                                            </span>
                                          )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <ActionButton
                                            onClick={() => startEdit(group, index)}
                                            icon={Edit}
                                            label="Edit"
                                            variant="outline"
                                            size="sm"
                                          />
                                          <ActionButton
                                            onClick={() => handleDeleteItem(group, index)}
                                            icon={Trash2}
                                            label="Delete"
                                            variant="danger"
                                            size="sm"
                                            loading={isLoading}
                                          />
                                        </div>
                                      </>
                                    )}
                                  </div>
                                );
                              })
                            ) : (
                              <div className={`text-center py-8 ${textSecondary}`}>
                                <Target className="w-10 h-10 mx-auto mb-3 opacity-50" />
                                <p className="text-sm font-medium mb-2">No items in this group yet</p>
                                <ActionButton
                                  onClick={() => setShowAddForm(true)}
                                  icon={Plus}
                                  label="Add First Item"
                                  variant="primary"
                                  size="sm"
                                />
                              </div>
                            )}
                          </div>
                        )}
                        
                        {!isExpanded && filteredData[group].length === 0 && (
                          <div className={`p-4 text-center ${textSecondary} text-sm italic border-t-2 ${borderColor}`}>
                            Click to expand - No items in this group yet
                          </div>
                        )}
                      </article>
                    );
                  })}
                  
                  {Object.keys(filteredData).length === 0 && (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 mx-auto mb-4 bg-almet-mystic rounded-full flex items-center justify-center">
                        <Search className={`w-8 h-8 ${textSecondary}`} />
                      </div>
                      <h3 className={`text-lg font-bold ${textPrimary} mb-2`}>No Results Found</h3>
                      <p className={`text-sm ${textSecondary} mb-6 max-w-md mx-auto`}>
                        We couldn't find any groups or items matching your search criteria. Try adjusting your filters or create new content.
                      </p>
                      <div className="flex gap-3 justify-center">
                        <ActionButton
                          onClick={() => {
                            setSearchTerm('');
                            setSelectedGroup('');
                          }}
                          icon={X}
                          label="Clear Filters"
                          variant="outline"
                        />
                        <ActionButton
                          onClick={() => setShowAddForm(true)}
                          icon={Plus}
                          label="Add New Item"
                          variant="primary"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* Add Item Modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className={`${bgCard} rounded-xl p-6 w-full max-w-md border-2 ${borderColor} shadow-2xl`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-lg font-bold ${textPrimary} flex items-center gap-2`}>
                    <Plus className="w-4 h-4 text-almet-sapphire" />
                    Add New {activeView === 'skills' ? 'Skill' : 'Competency'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewItem({ group: '', item: '', description: '' });
                    }}
                    className={`p-2 rounded-lg ${textSecondary} hover:${bgCardHover} transition-colors`}
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                      Group <span className="text-red-500 ml-1">*</span>
                    </label>
                    <select
                      value={newItem.group}
                      onChange={(e) => setNewItem({ ...newItem, group: e.target.value })}
                      className={`w-full px-4 py-3 border-2 border-gray-200 rounded-lg text-sm font-medium ${
                        darkMode ? 'bg-almet-cloud-burst text-white border-almet-comet' : 'bg-white text-almet-cloud-burst'
                      } focus:outline-none focus:border-almet-sapphire transition-all duration-200`}
                    >
                      <option value="">Select a group</option>
                      {Object.keys(currentData).map((group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <InputField
                    label={`${activeView === 'skills' ? 'Skill' : 'Competency'} Name`}
                    value={newItem.item}
                    onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
                    placeholder={`Enter ${activeView === 'skills' ? 'skill' : 'competency'} name`}
                    required
                  />
                  
                
                </div>
                
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t-2 border-gray-200">
                  <ActionButton
                    onClick={() => {
                      setShowAddForm(false);
                      setNewItem({ group: '', item: '', description: '' });
                    }}
                    icon={X}
                    label="Cancel"
                    disabled={isLoading}
                    variant="outline"
                  />
                  <ActionButton
                    icon={Plus}
                    label={`Add ${activeView === 'skills' ? 'Skill' : 'Competency'}`}
                    onClick={handleAddItem}
                    disabled={!newItem.group || !newItem.item}
                    loading={isLoading}
                    variant="primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Add Group Modal */}
          {showAddGroupForm && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className={`${bgCard} rounded-xl p-6 w-full max-w-md border-2 ${borderColor} shadow-2xl`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-lg font-bold ${textPrimary} flex items-center gap-2`}>
                    <Building className="w-4 h-4 text-almet-sapphire" />
                    Add New Group
                  </h3>
                  <button
                    onClick={() => {
                      setShowAddGroupForm(false);
                      setNewGroupName('');
                    }}
                    className={`p-2 rounded-lg ${textSecondary} hover:${bgCardHover} transition-colors`}
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <InputField
                  label="Group Name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder={`Enter ${activeView === 'skills' ? 'skill' : 'behavioral'} group name`}
                  required
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && newGroupName.trim() && handleAddGroup()}
                />
                
                <div className="flex justify-end gap-3 mt-6 pt-4 border-t-2 border-gray-200">
                  <ActionButton
                    onClick={() => {
                      setShowAddGroupForm(false);
                      setNewGroupName('');
                    }}
                    icon={X}
                    label="Cancel"
                    disabled={isLoading}
                    variant="outline"
                  />
                  <ActionButton
                    icon={Plus}
                    label="Add Group"
                    onClick={handleAddGroup}
                    disabled={!newGroupName.trim()}
                    loading={isLoading}
                    variant="success"
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
                <div className="p-1 bg-red-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <div className="flex-1">
                  <h4 className="text-red-800 font-bold text-sm">Error Occurred</h4>
                  <p className="text-red-700 text-sm mt-1">
                    {error?.message || 'An unexpected error occurred'}
                  </p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="p-1 text-red-600 hover:text-red-800 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompetencyMatrixSystem;