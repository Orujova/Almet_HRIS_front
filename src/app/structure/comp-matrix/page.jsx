'use client'
import React, { useState, useMemo, use } from 'react';
import { Plus, Edit, Eye, Trash2, Save, X, Search, Filter, BarChart3, Users, Target, Grid, List, Download, Upload, ChevronDown, ChevronRight } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTheme } from '@/components/common/ThemeProvider';

const CompetencyMatrixSystem = () => {
  const { darkMode } = useTheme();
  const [activeView, setActiveView] = useState('skills'); // skills, behavioral, matrix
  const [editMode, setEditMode] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddGroupForm, setShowAddGroupForm] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  // Theme-dependent classes using Almet colors
  const bgApp = darkMode ? "bg-gray-900" : "bg-almet-mystic";
  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const bgCardHover = darkMode ? "bg-almet-san-juan" : "bg-gray-50";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";
  const bgAccent = darkMode ? "bg-almet-comet" : "bg-almet-mystic";

  // Core Skills Groups (from first image)
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
      'Financial Statements'
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
      'Office & Space Management'
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
      'Netsuite dashboards usage for Sales & Targets'
    ],
    'OPERATIONS': [],
    'FINANCE': [],
    'MARKETING': [],
    'PROCUREMENT': [],
    'INFORMATION TECHNOLOGIES': [],
    'HSE General': [],
    'SECURITY': []
  });

  // Behavioral Competencies (from second image)
  const [behavioralData, setBehavioralData] = useState({
    'RESULTS ORIENTATION': [
      'Sets goals and focuses on accomplishment',
      'Focuses on high-priority actions and does not become distracted by lower-priority activities',
      'Takes appropriate risks to reach tough goals',
      'Overcomes setbacks and adjusts the plan of action to realize goals',
      'Develops a sense of urgency in others to complete tasks',
      'Corrects actions if the result is below the expectation'
    ],
    'NEGOTIATION': [
      'Clearly knows own strengths & weaknesses',
      'Explores maximum information about the client\'s strengths & weaknesses prior to starting negotiations',
      'Creates a Win Win picture at the time',
      'Build Personal relations if has positive impact on negotiation outcome',
      'Keeps goals in mind at stages of negotiation'
    ],
    'BUILDING RELATIONS': [],
    'CUSTOMER FOCUS': [],
    'PLANNING & ORGANIZING': [],
    'PROBLEM SOLVING': [],
    'TEAM ORIENTATION': [],
    'CREATIVITY': [],
    'BUSINESS ETHICS': [],
    'INITIATIVE': [],
    'COMMUNICATION': []
  });

  // Matrix data for positions vs competencies
  const [matrixData, setMatrixData] = useState({});

  // Add new item form
  const [newItem, setNewItem] = useState({ group: '', item: '', description: '' });

  // Filter data based on search and selected group
  const getFilteredData = (data) => {
    if (!data) return {};
    
    let filtered = { ...data };
    
    if (selectedGroup) {
      filtered = { [selectedGroup]: data[selectedGroup] || [] };
    }
    
    if (searchTerm) {
      const searchFiltered = {};
      Object.keys(filtered).forEach(group => {
        const items = filtered[group].filter(item => 
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

  // Add new item
  const handleAddItem = () => {
    if (!newItem.group || !newItem.item) return;
    
    setCurrentData(prev => ({
      ...prev,
      [newItem.group]: [...(prev[newItem.group] || []), newItem.item]
    }));
    
    setNewItem({ group: '', item: '', description: '' });
    setShowAddForm(false);
  };

  // Add new group
  const handleAddGroup = () => {
    if (!newGroupName.trim()) return;
    
    setCurrentData(prev => ({
      ...prev,
      [newGroupName.trim()]: []
    }));
    
    setNewGroupName('');
    setShowAddGroupForm(false);
  };

  // Delete group
  const handleDeleteGroup = (groupName) => {
    if (!confirm(`Are you sure you want to delete the group "${groupName}" and all its items?`)) return;
    
    setCurrentData(prev => {
      const newData = { ...prev };
      delete newData[groupName];
      return newData;
    });
    
    // Clear selected group if it was deleted
    if (selectedGroup === groupName) {
      setSelectedGroup('');
    }
    
    // Remove from expanded groups
    setExpandedGroups(prev => {
      const newExpanded = new Set(prev);
      newExpanded.delete(groupName);
      return newExpanded;
    });
  };

  // Toggle group expansion
  const toggleGroupExpansion = (groupName) => {
    setExpandedGroups(prev => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(groupName)) {
        newExpanded.delete(groupName);
      } else {
        newExpanded.add(groupName);
      }
      return newExpanded;
    });
  };

  // Delete item
  const handleDeleteItem = (group, itemIndex) => {
    setCurrentData(prev => ({
      ...prev,
      [group]: prev[group].filter((_, index) => index !== itemIndex)
    }));
  };

  // Edit item
  const handleEditItem = (group, itemIndex, newValue) => {
    setCurrentData(prev => ({
      ...prev,
      [group]: prev[group].map((item, index) => 
        index === itemIndex ? newValue : item
      )
    }));
    setEditMode(null);
  };

  // Stats
  const stats = useMemo(() => {
    const totalGroups = Object.keys(currentData).length;
    const totalItems = Object.values(currentData).reduce((sum, items) => sum + items.length, 0);
    const avgItemsPerGroup = totalGroups > 0 ? Math.round(totalItems / totalGroups * 10) / 10 : 0;
    
    return { totalGroups, totalItems, avgItemsPerGroup };
  }, [currentData]);

  const StatCard = ({ title, value, subtitle, icon: Icon, color = "almet-sapphire" }) => (
    <div className={`${bgCard} rounded-lg p-6 border ${borderColor} shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${textMuted}`}>{title}</p>
          <p className={`text-2xl font-bold text-${color} dark:text-${color}`}>{value}</p>
          {subtitle && <p className={`text-xs ${textMuted}`}>{subtitle}</p>}
        </div>
        <div className={`p-3 bg-${color}/10 dark:bg-${color}/20 rounded-lg`}>
          <Icon className={`h-6 w-6 text-${color} dark:text-${color}`} />
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className={`min-h-screen ${bgApp} p-6`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className={`text-3xl font-bold ${textPrimary}`}>Competency Matrix</h1>
                <p className={`${textSecondary} mt-1`}>
                  Manage employee skills and behavioral competencies
                </p>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <Upload size={16} />
                  Import
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors">
                  <Download size={16} />
                  Export
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <StatCard 
                title="Total Groups" 
                value={stats.totalGroups} 
                icon={Grid}
                color="almet-sapphire"
              />
              <StatCard 
                title="Total Items" 
                value={stats.totalItems} 
                icon={Target}
                color="green-600"
              />
              <StatCard 
                title="Avg Per Group" 
                value={stats.avgItemsPerGroup} 
                subtitle="items"
                icon={BarChart3}
                color="purple-600"
              />
            </div>

            {/* Navigation Tabs */}
            <div className={`flex space-x-1 ${bgAccent} rounded-lg p-1`}>
              {[
                { id: 'skills', name: 'Core Skills', icon: Target },
                { id: 'behavioral', name: 'Behavioral Competencies', icon: Users },
                { id: 'matrix', name: 'Competency Matrix', icon: Grid }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                    activeView === tab.id
                      ? `${bgCard} text-almet-sapphire dark:text-almet-steel-blue shadow-sm`
                      : `${textSecondary} hover:${textPrimary}`
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.name}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Filter */}
          {activeView !== 'matrix' && (
            <div className={`${bgCard} rounded-lg p-6 mb-6 border ${borderColor} shadow-sm`}>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textMuted}`} size={20} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                  />
                </div>
                <select
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className={`px-4 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                >
                  <option value="">All Groups</option>
                  {Object.keys(currentData).map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors"
                >
                  <Plus size={16} />
                  Add Item
                </button>
                <button
                  onClick={() => setShowAddGroupForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus size={16} />
                  Add Group
                </button>
              </div>
            </div>
          )}

          {/* Content */}
          <div className={`${bgCard} rounded-lg border ${borderColor} shadow-sm`}>
            {activeView === 'matrix' ? (
              <div className="p-6">
                <h2 className={`text-xl font-bold ${textPrimary} mb-4`}>Competency Matrix</h2>
                <p className={`${textSecondary} mb-6`}>
                  This section is for creating relationships between positions and competencies. 
                  Currently working with fake data.
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                  <p className="text-yellow-800 dark:text-yellow-200">
                    🚧 This feature is under development. Matrix view will be added after the database structure is completed.
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <h2 className={`text-xl font-bold ${textPrimary} mb-6`}>
                  {activeView === 'skills' ? 'Core Skills Groups' : 'Behavioral Competencies'}
                </h2>
                
                {Object.keys(filteredData).map(group => {
                  const isExpanded = expandedGroups.has(group);
                  
                  return (
                    <div key={group} className="mb-8 last:mb-0">
                      <div className="flex items-center justify-between mb-4">
                        <button
                          onClick={() => toggleGroupExpansion(group)}
                          className={`flex items-center gap-3 text-lg font-semibold ${textPrimary} ${bgAccent} px-4 py-2 rounded-lg hover:${bgCardHover} transition-colors`}
                        >
                          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                          {group}
                        </button>
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${textMuted} ${bgAccent} px-3 py-1 rounded-full`}>
                            {filteredData[group].length} items
                          </span>
                          <button
                            onClick={() => handleDeleteGroup(group)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            title="Delete Group"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      {isExpanded && (
                        <div className="grid gap-3 ml-8">
                          {filteredData[group].map((item, index) => (
                            <div key={index} className={`flex items-center justify-between p-4 ${bgCardHover} rounded-lg border ${borderColor} hover:shadow-sm transition-all`}>
                              {editMode === `${group}-${index}` ? (
                                <div className="flex-1 flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={item}
                                    onChange={(e) => {
                                      const newData = { ...currentData };
                                      newData[group][index] = e.target.value;
                                      setCurrentData(newData);
                                    }}
                                    className={`flex-1 px-3 py-2 border ${borderColor} rounded ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                                  />
                                  <button
                                    onClick={() => handleEditItem(group, index, item)}
                                    className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded transition-colors"
                                  >
                                    <Save size={16} />
                                  </button>
                                  <button
                                    onClick={() => setEditMode(null)}
                                    className={`p-2 ${textMuted} hover:${bgAccent} rounded transition-colors`}
                                  >
                                    <X size={16} />
                                  </button>
                                </div>
                              ) : (
                                <>
                                  <span className={`${textPrimary} font-medium`}>{item}</span>
                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => setEditMode(`${group}-${index}`)}
                                      className="p-2 text-almet-sapphire hover:bg-almet-sapphire/10 rounded transition-colors"
                                    >
                                      <Edit size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteItem(group, index)}
                                      className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                          
                          {filteredData[group].length === 0 && (
                            <div className={`text-center py-8 ${textMuted} ml-8`}>
                              No items in this group yet
                            </div>
                          )}
                        </div>
                      )}
                      
                      {!isExpanded && filteredData[group].length === 0 && (
                        <div className={`text-center py-4 ${textMuted} text-sm italic ml-8`}>
                          Click to expand - No items in this group yet
                        </div>
                      )}
                    </div>
                  );
                })}
                
                {Object.keys(filteredData).length === 0 && (
                  <div className="text-center py-12">
                    <Target className={`mx-auto h-12 w-12 ${textMuted} mb-4`} />
                    <h3 className={`text-lg font-medium ${textPrimary} mb-2`}>No Results Found</h3>
                    <p className={textMuted}>
                      Adjust your search criteria or add new items.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Add Item Modal */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className={`${bgCard} rounded-lg p-6 w-full max-w-md border ${borderColor}`}>
                <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Add New Item</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                      Group
                    </label>
                    <select
                      value={newItem.group}
                      onChange={(e) => setNewItem({...newItem, group: e.target.value})}
                      className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                    >
                      <option value="">Select group</option>
                      {Object.keys(currentData).map(group => (
                        <option key={group} value={group}>{group}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                      Item Name
                    </label>
                    <input
                      type="text"
                      value={newItem.item}
                      onChange={(e) => setNewItem({...newItem, item: e.target.value})}
                      className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                      placeholder="Enter item name"
                    />
                  </div>
                  
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                      Description (optional)
                    </label>
                    <textarea
                      value={newItem.description}
                      onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                      className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                      rows="3"
                      placeholder="Enter item description"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setNewItem({ group: '', item: '', description: '' });
                    }}
                    className={`px-4 py-2 ${textSecondary} hover:${textPrimary} transition-colors`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddItem}
                    disabled={!newItem.group || !newItem.item}
                    className="px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Add Item
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Add Group Modal */}
          {showAddGroupForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className={`${bgCard} rounded-lg p-6 w-full max-w-md border ${borderColor}`}>
                <h3 className={`text-lg font-semibold ${textPrimary} mb-4`}>Add New Group</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
                      Group Name
                    </label>
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className={`w-full px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire`}
                      placeholder="Enter group name"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddGroup()}
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowAddGroupForm(false);
                      setNewGroupName('');
                    }}
                    className={`px-4 py-2 ${textSecondary} hover:${textPrimary} transition-colors`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddGroup}
                    disabled={!newGroupName.trim()}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Add Group
                  </button>
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