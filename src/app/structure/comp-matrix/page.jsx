'use client';
import React, { useState, useMemo } from 'react';
import { Plus, Edit, Trash2, Save, X, Search, Grid, Target, BarChart3, Download, Upload, ChevronDown, ChevronRight } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTheme } from '@/components/common/ThemeProvider';

// Reusable Button Component
const ActionButton = ({ onClick, icon: Icon, label, color = 'almet-sapphire', disabled = false }) => {
  const { darkMode } = useTheme();
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-colors ${
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : `bg-${color} text-white hover:bg-${color === 'almet-sapphire' ? 'almet-astral' : 'green-700'}`
      } ${darkMode ? 'dark:bg-opacity-90' : ''}`}
      aria-label={label}
      title={label}
    >
      <Icon size={16} />
      {label}
    </button>
  );
};

// Reusable Input Component
const InputField = ({ label, value, onChange, placeholder, type = 'text', required = false, className = '' }) => {
  const { darkMode } = useTheme();
  const borderColor = darkMode ? 'border-almet-comet' : 'border-gray-200';
  return (
    <div className="space-y-1">
      <label className={`block text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-almet-cloud-burst'}`}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`w-full px-3 py-1.5 border ${borderColor} rounded-lg text-sm ${
          darkMode ? 'bg-almet-cloud-burst text-white' : 'bg-white text-almet-cloud-burst'
        } focus:outline-none focus:ring-2 focus:ring-almet-sapphire ${className}`}
      />
    </div>
  );
};

const CompetencyMatrixSystem = () => {
  const { darkMode } = useTheme();
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

  // Theme-dependent classes
  const bgApp = darkMode ? 'bg-gray-900' : 'bg-almet-mystic';
  const bgCard = darkMode ? 'bg-almet-cloud-burst' : 'bg-white';
  const bgCardHover = darkMode ? 'bg-almet-san-juan' : 'bg-gray-50';
  const textPrimary = darkMode ? 'text-white' : 'text-almet-cloud-burst';
  const textSecondary = darkMode ? 'text-almet-bali-hai' : 'text-gray-700';
  const textMuted = darkMode ? 'text-gray-400' : 'text-almet-waterloo';
  const borderColor = darkMode ? 'border-almet-comet' : 'border-gray-200';
  const bgAccent = darkMode ? 'bg-almet-comet' : 'bg-almet-mystic';

  // Sample data (unchanged)
  const [skillsData, setSkillsData] = useState({
    'GENERAL MANAGEMENT SKILLS': [
      'Strategy Setting',
      'Strategy delegation & execution',
      'Global Steel Market and factors impacting demand and price',
      'Local Steel Market and factors impacting demand and price',
      'Steel Products Portfolio Markets & Application',
      'Price Management',
      'P&L',
      'Project Management',
      'Sales Management & Techniques',
      'Supply Chain Management',
      'Investment Projects Feasibility Study',
      'Data Analysis',
      'Marketing Communications',
      'Management KPIs & Reports',
      'Financial Statements',
    ],
    'GENERAL PROFESSIONAL SKILLS': [
      'Policies & procedures design',
      'Process Flow Chart Design',
      'Policies & procedures control & adherence',
      'Professional correspondence & e-mailing',
      'Languages (eg English)',
      'MS Office',
      'ERPs (NETSUITE eq)',
      'Reporting',
      'Presentation',
      'QMS standards and processes',
      'Occupational Health & Safety',
      'Documents Administration & Control',
      'Office & Space Management',
    ],
    'COMMERCIAL': [
      'Consumer & Supplier market data',
      'Computer Data',
      'Sales performance KPIs management',
      'Sales Cost & Price Calculation',
      'Quotation Procedure',
      'Sales Skills (Negotiations and Communications)',
      'Accounts Receivable Management / Credit Control',
      'Trading software and platforms, including Bloomberg',
      'Contract Management',
      'Sales Order Creation and administration',
      'Credit Insurance Terms and Agreement',
      'Cargo Insurance Terms and Agreement',
      'Netsuite report creation and analysing',
      'Netsuite dashboards usage for Sales & Targets',
    ],
    'OPERATIONS': [],
    'FINANCE': [],
    'MARKETING': [],
    'PROCUREMENT': [],
    'INFORMATION TECHNOLOGIES': [],
    'HSE General': [],
    'SECURITY': [],
  });

  const [behavioralData, setBehavioralData] = useState({
    'RESULTS ORIENTATION': [
      'Sets goals and focuses on accomplishment',
      'Focuses on high-priority actions and does not become distracted by lower-priority activities',
      'Takes appropriate risks to reach tough goals',
      'Overcomes setbacks and adjusts the plan of action to realize goals',
      'Develops a sense of urgency in others to complete tasks',
      'Corrects actions if the result is below the expectation',
    ],
    'NEGOTIATION': [
      'Clearly knows own strengths & weaknesses',
      'Explores maximum information about the client\'s strengths & weaknesses prior to starting negotiations',
      'Creates a Win Win picture at the time',
      'Build Personal relations if has positive impact on negotiation outcome',
      'Keeps goals in mind at stages of negotiation',
    ],
    'BUILDING RELATIONS': [],
    'CUSTOMER FOCUS': [],
    'PLANNING & ORGANIZING': [],
    'PROBLEM SOLVING': [],
    'TEAM ORIENTATION': [],
    'CREATIVITY': [],
    'BUSINESS ETHICS': [],
    'INITIATIVE': [],
    'COMMUNICATION': [],
  });

  const [matrixData, setMatrixData] = useState({});

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
        const items = filtered[group].filter(
          (item) =>
            item.toLowerCase().includes(searchTerm.toLowerCase()) ||
            group.toLowerCase().includes(searchTerm.toLowerCase())
        );
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

  // Handlers
  const handleAddItem = () => {
    if (!newItem.group || !newItem.item) return;
    setIsLoading(true);
    setTimeout(() => {
      setCurrentData((prev) => ({
        ...prev,
        [newItem.group]: [...(prev[newItem.group] || []), newItem.item],
      }));
      setNewItem({ group: '', item: '', description: '' });
      setShowAddForm(false);
      setIsLoading(false);
    }, 500);
  };

  const handleAddGroup = () => {
    if (!newGroupName.trim()) return;
    setIsLoading(true);
    setTimeout(() => {
      setCurrentData((prev) => ({
        ...prev,
        [newGroupName.trim()]: [],
      }));
      setNewGroupName('');
      setShowAddGroupForm(false);
      setIsLoading(false);
    }, 500);
  };

  const handleDeleteGroup = (groupName) => {
    if (!confirm(`Are you sure you want to delete "${groupName}" and its items?`)) return;
    setIsLoading(true);
    setTimeout(() => {
      setCurrentData((prev) => {
        const newData = { ...prev };
        delete newData[groupName];
        return newData;
      });
      if (selectedGroup === groupName) setSelectedGroup('');
      setExpandedGroups((prev) => {
        const newExpanded = new Set(prev);
        newExpanded.delete(groupName);
        return newExpanded;
      });
      setIsLoading(false);
    }, 500);
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

  const handleDeleteItem = (group, itemIndex) => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentData((prev) => ({
        ...prev,
        [group]: prev[group].filter((_, index) => index !== itemIndex),
      }));
      setIsLoading(false);
    }, 500);
  };

  const handleEditItem = (group, itemIndex, newValue) => {
    setIsLoading(true);
    setTimeout(() => {
      setCurrentData((prev) => ({
        ...prev,
        [group]: prev[group].map((item, index) => (index === itemIndex ? newValue : item)),
      }));
      setEditMode(null);
      setIsLoading(false);
    }, 500);
  };

  // Stats
  const stats = useMemo(() => {
    const totalGroups = Object.keys(currentData).length;
    const totalItems = Object.values(currentData).reduce((sum, items) => sum + items.length, 0);
    const avgItemsPerGroup = totalGroups > 0 ? Math.round(totalItems / totalGroups * 10) / 10 : 0;
    return { totalGroups, totalItems, avgItemsPerGroup };
  }, [currentData]);

  // Stat Card Component
  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'almet-sapphire' }) => (
    <div className={`${bgCard} rounded-lg p-4 border ${borderColor} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-xs font-medium ${textMuted}`}>{title}</p>
          <p className={`text-xl font-bold text-${color} dark:text-${color}`}>{value}</p>
          {subtitle && <p className={`text-xs ${textMuted}`}>{subtitle}</p>}
        </div>
        <div className={`p-2 bg-${color}/10 dark:bg-${color}/20 rounded-lg`}>
          <Icon className={`h-5 w-5 text-${color} dark:text-${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className={`min-h-screen ${bgApp} p-4 sm:p-6`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <header className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
              <div>
                <h1 className={`text-2xl font-bold ${textPrimary}`}>Competency Matrix</h1>
                <p className={`text-sm ${textSecondary} mt-1`}>Manage employee skills and behavioral competencies</p>
              </div>
              <div className="flex gap-2 mt-4 sm:mt-0">
                <ActionButton icon={Upload} label="Import" color="green-600" />
                <ActionButton icon={Download} label="Export" />
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <StatCard title="Total Groups" value={stats.totalGroups} icon={Grid} color="almet-sapphire" />
              <StatCard title="Total Items" value={stats.totalItems} icon={Target} color="green-600" />
              <StatCard title="Avg Per Group" value={stats.avgItemsPerGroup} subtitle="items" icon={BarChart3} color="purple-600" />
            </div>

            {/* Navigation Tabs */}
            <nav className={`flex space-x-1 ${bgAccent} rounded-lg p-1`}>
              {[
                { id: 'skills', name: 'Core Skills', icon: Target },
                { id: 'behavioral', name: 'Behavioral Competencies', icon: Grid },
                { id: 'matrix', name: 'Competency Matrix', icon: Grid },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    activeView === tab.id
                      ? `${bgCard} text-almet-sapphire dark:text-almet-steel-blue shadow-sm`
                      : `${textSecondary} hover:${textPrimary}`
                  }`}
                  aria-label={`Switch to ${tab.name}`}
                >
                  <tab.icon size={16} />
                  {tab.name}
                </button>
              ))}
            </nav>
          </header>

          {/* Search and Filter */}
          {activeView !== 'matrix' && (
            <section className={`${bgCard} rounded-lg p-4 border ${borderColor} shadow-sm mb-6`}>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textMuted}`} size={16} />
                  <InputField
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="pl-9"
                  />
                </div>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className={`px-3 py-1.5 border ${borderColor} rounded-lg text-sm ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                  aria-label="Select group"
                >
                  <option value="">All Groups</option>
                  {Object.keys(currentData).map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
                <ActionButton icon={Plus} label="Add Item" onClick={() => setShowAddForm(true)} />
                <ActionButton icon={Plus} label="Add Group" color="green-600" onClick={() => setShowAddGroupForm(true)} />
              </div>
            </section>
          )}

          {/* Content */}
          <section className={`${bgCard} rounded-lg border ${borderColor} shadow-sm`}>
            {activeView === 'matrix' ? (
              <div className="p-4">
                <h2 className={`text-lg font-bold ${textPrimary} mb-3`}>Competency Matrix</h2>
                <p className={`text-sm ${textSecondary} mb-4`}>This section is for creating relationships between positions and competencies.</p>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                  <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                    🚧 This feature is under development. Matrix view will be added after the database structure is completed.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4">
                <h2 className={`text-lg font-bold ${textPrimary} mb-4`}>
                  {activeView === 'skills' ? 'Core Skills Groups' : 'Behavioral Competencies'}
                </h2>
                {Object.keys(filteredData).map((group) => {
                  const isExpanded = expandedGroups.has(group);
                  return (
                    <article key={group} className="mb-6 last:mb-0">
                      <div className="flex items-center justify-between mb-3">
                        <button
                          onClick={() => toggleGroupExpansion(group)}
                          className={`flex items-center gap-2 text-base font-semibold ${textPrimary} ${bgAccent} px-3 py-1.5 rounded-lg hover:${bgCardHover} transition-colors`}
                          aria-label={`Toggle ${group} group`}
                        >
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                          {group}
                        </button>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs ${textMuted} ${bgAccent} px-2 py-1 rounded-full`}>
                            {filteredData[group].length} items
                          </span>
                          <button
                            onClick={() => handleDeleteGroup(group)}
                            className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            aria-label={`Delete ${group} group`}
                            title="Delete Group"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      {isExpanded && (
                        <div className="grid gap-2 ml-6">
                          {filteredData[group].map((item, index) => (
                            <div
                              key={index}
                              className={`flex items-center justify-between p-3 ${bgCardHover} rounded-lg border ${borderColor} hover:shadow-sm transition-all`}
                            >
                              {editMode === `${group}-${index}` ? (
                                <div className="flex-1 flex items-center gap-2">
                                  <InputField
                                    value={item}
                                    onChange={(e) => {
                                      const newData = { ...currentData };
                                      newData[group][index] = e.target.value;
                                      setCurrentData(newData);
                                    }}
                                    className="flex-1"
                                  />
                                  <button
                                    onClick={() => handleEditItem(group, index, item)}
                                    className="p-1.5 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
                                    aria-label="Save changes"
                                    title="Save"
                                  >
                                    <Save size={16} />
                                  </button>
                                  <button
                                    onClick={() => setEditMode(null)}
                                    className={`p-1.5 ${textMuted} hover:${bgAccent} rounded transition-colors`}
                                    aria-label="Cancel edit"
                                    title="Cancel"
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <span className={`text-sm ${textPrimary} font-medium`}>{item}</span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => setEditMode(`${group}-${index}`)}
                                      className="p-1.5 text-almet-sapphire hover:bg-almet-sapphire/10 rounded transition-colors"
                                      aria-label={`Edit ${item}`}
                                      title="Edit"
                                    >
                                      <Edit size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteItem(group, index)}
                                      className="p-1.5 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                                      aria-label={`Delete ${item}`}
                                      title="Delete"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                          {filteredData[group].length === 0 && (
                            <div className={`text-center py-6 ${textMuted} text-sm ml-6`}>
                              No items in this group yet.{' '}
                              <button
                                onClick={() => setShowAddForm(true)}
                                className="text-almet-sapphire hover:underline"
                              >
                                Add one now
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      {!isExpanded && filteredData[group].length === 0 && (
                        <div className={`text-center py-3 ${textMuted} text-xs italic ml-6`}>
                          Click to expand - No items in this group yet
                        </div>
                      )}
                    </article>
                  );
                })}
                {Object.keys(filteredData).length === 0 && (
                  <div className="text-center py-10">
                    <Target className={`mx-auto h-10 w-10 ${textMuted} mb-3`} />
                    <h3 className={`text-base font-medium ${textPrimary} mb-2`}>No Results Found</h3>
                    <p className={`text-sm ${textMuted}`}>
                      Adjust your search or{' '}
                      <button
                        onClick={() => setShowAddForm(true)}
                        className="text-almet-sapphire hover:underline"
                      >
                        add new items
                      </button>
                      .
                    </p>
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Add Item Modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className={`${bgCard} rounded-lg p-5 w-full max-w-md border ${borderColor} shadow-lg`}>
                <h3 className={`text-base font-semibold ${textPrimary} mb-3`}>Add New Item</h3>
                <div className="space-y-3">
                  <div>
                    <label className={`block text-xs font-medium ${textSecondary}`}>
                      Group <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newItem.group}
                      onChange={(e) => setNewItem({ ...newItem, group: e.target.value })}
                      className={`w-full px-3 py-1.5 border ${borderColor} rounded-lg text-sm ${
                        darkMode ? 'bg-almet-cloud-burst text-white' : 'bg-white text-almet-cloud-burst'
                      } focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                      aria-label="Select group"
                    >
                      <option value="">Select group</option>
                      {Object.keys(currentData).map((group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ))}
                    </select>
                  </div>
                  <InputField
                    label="Item Name"
                    value={newItem.item}
                    onChange={(e) => setNewItem({ ...newItem, item: e.target.value })}
                    placeholder="Enter item name"
                    required
                  />
                  <div>
                    <label className={`block text-xs font-medium ${textSecondary}`}>Description (optional)</label>
                    <textarea
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      className={`w-full px-3 py-1.5 border ${borderColor} rounded-lg text-sm ${
                        darkMode ? 'bg-almet-cloud-burst text-white' : 'bg-white text-almet-cloud-burst'
                      } focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                      rows="3"
                      placeholder="Enter item description"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewItem({ group: '', item: '', description: '' });
                    }}
                    className={`px-3 py-1.5 text-sm ${textSecondary} hover:${textPrimary} transition-colors`}
                    aria-label="Cancel"
                  >
                    Cancel
                  </button>
                  <ActionButton
                    icon={Plus}
                    label="Add Item"
                    onClick={handleAddItem}
                    disabled={isLoading || !newItem.group || !newItem.item}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Add Group Modal */}
          {showAddGroupForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className={`${bgCard} rounded-lg p-5 w-full max-w-md border ${borderColor} shadow-lg`}>
                <h3 className={`text-base font-semibold ${textPrimary} mb-3`}>Add New Group</h3>
                <InputField
                  label="Group Name"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Enter group name"
                  required
                  onKeyPress={(e) => e.key === 'Enter' && handleAddGroup()}
                />
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => {
                      setShowAddGroupForm(false);
                      setNewGroupName('');
                    }}
                    className={`px-3 py-1.5 text-sm ${textSecondary} hover:${textPrimary} transition-colors`}
                    aria-label="Cancel"
                  >
                    Cancel
                  </button>
                  <ActionButton
                    icon={Plus}
                    label="Add Group"
                    color="green-600"
                    onClick={handleAddGroup}
                    disabled={isLoading || !newGroupName.trim()}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompetencyMatrixSystem;