"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import performanceApi from "@/services/performanceService";
import { 
  Save, Plus, Trash2, Loader, AlertCircle, CheckCircle, 
  XCircle, Calendar, Target, Award, Settings as SettingsIcon
} from 'lucide-react';

export default function PerformanceSettingsPage() {
  const { darkMode } = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');
  const [activeTab, setActiveTab] = useState('periods');

  const [activeYear, setActiveYear] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [positionGroups, setPositionGroups] = useState([]);
  
  const [settings, setSettings] = useState({
    weightConfigs: [],
    goalLimits: { min: 3, max: 7 },
    departmentObjectives: [],
    evaluationScale: [],
    evaluationTargets: { objective_score_target: 21 },
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadActiveYear(),
        loadDepartments(),
        loadPositionGroups(),
        loadSettings(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      showNotif('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadActiveYear = async () => {
    try {
      const yearData = await performanceApi.years.getActiveYear();
      setActiveYear(yearData);
    } catch (error) {
      console.error('Error loading year:', error);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await performanceApi.departments.list();
      setDepartments(response.results || response);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadPositionGroups = async () => {
    try {
      const response = await performanceApi.positionGroups.list();
      setPositionGroups(response.results || response);
    } catch (error) {
      console.error('Error loading position groups:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const [weightsRes, limitsRes, deptObjRes, scalesRes, targetsRes] = await Promise.all([
        performanceApi.weightConfigs.list(),
        performanceApi.goalLimits.getActiveConfig(),
        performanceApi.departmentObjectives.list({}),
        performanceApi.evaluationScales.list(),
        performanceApi.evaluationTargets.getActiveConfig(),
      ]);
      
      setSettings({
        weightConfigs: weightsRes.results || weightsRes,
        goalLimits: {
          min: limitsRes.min_goals,
          max: limitsRes.max_goals
        },
        departmentObjectives: deptObjRes.results || deptObjRes,
        evaluationScale: scalesRes.results || scalesRes,
        evaluationTargets: {
          objective_score_target: targetsRes.objective_score_target,
        },
      });
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const showNotif = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const handleSaveYear = async () => {
    setLoading(true);
    try {
      if (activeYear?.id) {
        await performanceApi.years.update(activeYear.id, {
          ...activeYear,
          is_active: true
        });
        showNotif('Period dates saved successfully');
        await loadActiveYear();
      }
    } catch (error) {
      console.error('Error saving year:', error);
      showNotif('Error saving dates', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddWeightConfig = async () => {
    if (positionGroups.length === 0) {
      showNotif('No position groups available', 'error');
      return;
    }
    
    const existingGroupIds = settings.weightConfigs.map(w => w.position_group);
    const availableGroups = positionGroups.filter(pg => !existingGroupIds.includes(pg.id));
    
    if (availableGroups.length === 0) {
      showNotif('All position groups already configured', 'info');
      return;
    }
    
    try {
      setLoading(true);
      await performanceApi.weightConfigs.create({
        position_group: availableGroups[0].id,
        objectives_weight: 70,
        competencies_weight: 30,
        is_active: true
      });
      await loadSettings();
      showNotif('Weight configuration added');
    } catch (error) {
      showNotif('Error adding configuration', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateWeightConfig = async (id, field, value) => {
    try {
      setLoading(true);
      const config = settings.weightConfigs.find(w => w.id === id);
      await performanceApi.weightConfigs.update(id, {
        ...config,
        [field]: value
      });
      await loadSettings();
      showNotif('Updated successfully');
    } catch (error) {
      showNotif('Error updating', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWeightConfig = async (id) => {
    if (!confirm('Delete this configuration?')) return;
    
    try {
      setLoading(true);
      await performanceApi.weightConfigs.delete(id);
      await loadSettings();
      showNotif('Configuration deleted');
    } catch (error) {
      showNotif('Error deleting', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoalLimits = async () => {
    setLoading(true);
    try {
      const limitsConfig = await performanceApi.goalLimits.getActiveConfig();
      await performanceApi.goalLimits.update(limitsConfig.id, {
        min_goals: settings.goalLimits.min,
        max_goals: settings.goalLimits.max,
        is_active: true
      });
      showNotif('Goal limits saved');
      await loadSettings();
    } catch (error) {
      showNotif('Error saving limits', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDepartmentObjective = async () => {
    if (departments.length === 0) {
      showNotif('No departments available', 'error');
      return;
    }
    
    try {
      setLoading(true);
      await performanceApi.departmentObjectives.create({
        department: departments[0].id,
        title: 'New Objective',
        weight: 0,
        is_active: true
      });
      await loadSettings();
      showNotif('Objective added');
    } catch (error) {
      showNotif('Error adding objective', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDepartmentObjective = async (id, field, value) => {
    try {
      setLoading(true);
      const obj = settings.departmentObjectives.find(o => o.id === id);
      await performanceApi.departmentObjectives.update(id, {
        ...obj,
        [field]: value
      });
      await loadSettings();
      showNotif('Updated successfully');
    } catch (error) {
      showNotif('Error updating', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDepartmentObjective = async (id) => {
    if (!confirm('Delete this objective?')) return;
    
    try {
      setLoading(true);
      await performanceApi.departmentObjectives.delete(id);
      await loadSettings();
      showNotif('Objective deleted');
    } catch (error) {
      showNotif('Error deleting', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvaluationScale = async () => {
    try {
      setLoading(true);
      await performanceApi.evaluationScales.create({
        name: 'NEW',
        value: 0,
        range_min: 0,
        range_max: 0,
        description: '',
        is_active: true
      });
      await loadSettings();
      showNotif('Scale added');
    } catch (error) {
      showNotif('Error adding scale', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateEvaluationScale = async (id, field, value) => {
    try {
      setLoading(true);
      const scale = settings.evaluationScale.find(s => s.id === id);
      await performanceApi.evaluationScales.update(id, {
        ...scale,
        [field]: value
      });
      await loadSettings();
    } catch (error) {
      showNotif('Error updating', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvaluationScale = async (id) => {
    if (!confirm('Delete this scale?')) return;
    
    try {
      setLoading(true);
      await performanceApi.evaluationScales.delete(id);
      await loadSettings();
      showNotif('Scale deleted');
    } catch (error) {
      showNotif('Error deleting', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEvaluationTargets = async () => {
    setLoading(true);
    try {
      const targetsConfig = await performanceApi.evaluationTargets.getActiveConfig();
      await performanceApi.evaluationTargets.update(targetsConfig.id, {
        objective_score_target: settings.evaluationTargets.objective_score_target,
        is_active: true
      });
      showNotif('Targets saved');
      await loadSettings();
    } catch (error) {
      showNotif('Error saving targets', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !activeYear) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader className="w-10 h-10 animate-spin text-almet-sapphire mx-auto mb-2" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading settings...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen p-4 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-almet-sapphire to-almet-astral flex items-center justify-center">
              <SettingsIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-almet-cloud-burst dark:text-almet-mystic">
                Performance Settings
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Configure performance management system
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 border-b border-gray-200 dark:border-gray-700">
          {[
            { id: 'periods', label: 'Periods', icon: Calendar },
            { id: 'weights', label: 'Weighting', icon: Award },
            { id: 'limits', label: 'Limits', icon: Target },
            { id: 'departments', label: 'Departments', icon: SettingsIcon },
            { id: 'scales', label: 'Scales', icon: Award },
            { id: 'targets', label: 'Targets', icon: Target },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-t-lg text-xs font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-almet-sapphire text-white shadow-sm'
                    : `${darkMode ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`
                }`}
              >
                <Icon className="w-4 h-4 inline mr-1.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* 1. PERIODS */}
          {activeTab === 'periods' && activeYear && (
            <div className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-mystic">
                  Performance Period Configuration
                </h3>
                <p className="text-xs text-gray-500 mt-1">Define start and end dates for each period</p>
              </div>
              
              <div className="p-5 space-y-6">
                {/* Goal Setting */}
                <div>
                  <h4 className="text-xs font-medium mb-3 text-almet-sapphire flex items-center">
                    <div className="w-6 h-6 rounded bg-almet-sapphire/10 flex items-center justify-center mr-2">
                      <Target className="w-3 h-3 text-almet-sapphire" />
                    </div>
                    Goal Setting Period
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400 font-medium">Employee Start</label>
                      <input
                        type="date"
                        value={activeYear.goal_setting_employee_start || ''}
                        onChange={(e) => setActiveYear(prev => ({ ...prev, goal_setting_employee_start: e.target.value }))}
                        className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400 font-medium">Employee End</label>
                      <input
                        type="date"
                        value={activeYear.goal_setting_employee_end || ''}
                        onChange={(e) => setActiveYear(prev => ({ ...prev, goal_setting_employee_end: e.target.value }))}
                        className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400 font-medium">Manager Start</label>
                      <input
                        type="date"
                        value={activeYear.goal_setting_manager_start || ''}
                        onChange={(e) => setActiveYear(prev => ({ ...prev, goal_setting_manager_start: e.target.value }))}
                        className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400 font-medium">Manager End</label>
                      <input
                        type="date"
                        value={activeYear.goal_setting_manager_end || ''}
                        onChange={(e) => setActiveYear(prev => ({ ...prev, goal_setting_manager_end: e.target.value }))}
                        className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Mid-Year */}
                <div>
                  <h4 className="text-xs font-medium mb-3 text-almet-sapphire flex items-center">
                    <div className="w-6 h-6 rounded bg-almet-sapphire/10 flex items-center justify-center mr-2">
                      <Calendar className="w-3 h-3 text-almet-sapphire" />
                    </div>
                    Mid-Year Review
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400 font-medium">Start Date</label>
                      <input
                        type="date"
                        value={activeYear.mid_year_review_start || ''}
                        onChange={(e) => setActiveYear(prev => ({ ...prev, mid_year_review_start: e.target.value }))}
                        className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400 font-medium">End Date</label>
                      <input
                        type="date"
                        value={activeYear.mid_year_review_end || ''}
                        onChange={(e) => setActiveYear(prev => ({ ...prev, mid_year_review_end: e.target.value }))}
                        className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                  </div>
                </div>

                {/* End-Year */}
                <div>
                  <h4 className="text-xs font-medium mb-3 text-almet-sapphire flex items-center">
                    <div className="w-6 h-6 rounded bg-almet-sapphire/10 flex items-center justify-center mr-2">
                      <Award className="w-3 h-3 text-almet-sapphire" />
                    </div>
                    End-Year Review
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400 font-medium">Start Date</label>
                      <input
                        type="date"
                        value={activeYear.end_year_review_start || ''}
                        onChange={(e) => setActiveYear(prev => ({ ...prev, end_year_review_start: e.target.value }))}
                        className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400 font-medium">End Date</label>
                      <input
                        type="date"
                        value={activeYear.end_year_review_end || ''}
                        onChange={(e) => setActiveYear(prev => ({ ...prev, end_year_review_end: e.target.value }))}
                        className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
                <button
                  onClick={handleSaveYear}
                  disabled={loading}
                  className="px-4 py-2 text-xs font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-all shadow-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
                  Save Periods
                </button>
              </div>
            </div>
          )}

          {/* 2. WEIGHTS */}
          {activeTab === 'weights' && (
            <div className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
              <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-mystic">
                    Performance Weighting by Position Group
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Configure objective and competency weights</p>
                </div>
                <button
                  onClick={handleAddWeightConfig}
                  disabled={loading}
                  className="px-3 py-2 text-xs font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-all shadow-sm flex items-center disabled:opacity-50"
                >
                  <Plus className="w-3 h-3 mr-1.5" />
                  Add Configuration
                </button>
              </div>
              
              <div className="p-5 space-y-3">
                {settings.weightConfigs.map((weight) => (
                  <div key={weight.id} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div>
                        <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400 font-medium">
                          Position Group
                        </label>
                        <select
                          value={weight.position_group}
                          onChange={(e) => handleUpdateWeightConfig(weight.id, 'position_group', parseInt(e.target.value))}
                          className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire transition-all ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                        >
                          {positionGroups.map(pg => (
                            <option key={pg.id} value={pg.id}>{pg.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400 font-medium">Objectives %</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={weight.objectives_weight}
                          onChange={(e) => {
                            const newWeights = [...settings.weightConfigs];
                            const index = newWeights.findIndex(w => w.id === weight.id);
                            const objWeight = parseInt(e.target.value) || 0;
                            newWeights[index].objectives_weight = objWeight;
                            newWeights[index].competencies_weight = 100 - objWeight;
                            setSettings(prev => ({ ...prev, weightConfigs: newWeights }));
                          }}
                          onBlur={() => handleUpdateWeightConfig(weight.id, 'objectives_weight', weight.objectives_weight)}
                          className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire transition-all ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400 font-medium">Competencies %</label>
                        <input
                          type="number"
                          value={weight.competencies_weight}
                          readOnly
                          className={`w-full px-3 py-2 text-xs border rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-100 border-gray-300'}`}
                        />
                      </div>

                      <div>
                        <button
                          onClick={() => handleDeleteWeightConfig(weight.id)}
                          disabled={loading}
                          className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs disabled:opacity-50 transition-all shadow-sm"
                        >
                          <Trash2 className="w-3 h-3 mx-auto" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {settings.weightConfigs.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No configurations yet. Click "Add Configuration" to create one.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 3. LIMITS */}
          {activeTab === 'limits' && (
            <div className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-mystic">
                  Goal Limits
                </h3>
                <p className="text-xs text-gray-500 mt-1">Set minimum and maximum objectives per employee</p>
              </div>
              
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
                  <div>
                    <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400 font-medium">Minimum Objectives</label>
                    <input
                      type="number"
                      min="1"
                      value={settings.goalLimits.min}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        goalLimits: { ...prev.goalLimits, min: parseInt(e.target.value) || 1 }
                      }))}
                      className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400 font-medium">Maximum Objectives</label>
                    <input
                      type="number"
                      min="1"
                      value={settings.goalLimits.max}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        goalLimits: { ...prev.goalLimits, max: parseInt(e.target.value) || 10 }
                      }))}
                      className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>
                </div>
              </div>

              <div className="p-5 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
                <button
                  onClick={handleSaveGoalLimits}
                  disabled={loading}
                  className="px-4 py-2 text-xs font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-all shadow-sm flex items-center disabled:opacity-50"
                >
                  {loading ? <Loader className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
                  Save Limits
                </button>
              </div>
            </div>
          )}

          {/* 4. DEPARTMENTS */}
          {activeTab === 'departments' && (
            <div className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
              <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-mystic">
                    Department Objectives
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Define objectives for each department</p>
                </div>
                <button
                  onClick={handleAddDepartmentObjective}
                  disabled={loading}
                  className="px-3 py-2 text-xs font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-all shadow-sm flex items-center disabled:opacity-50"
                >
                  <Plus className="w-3 h-3 mr-1.5" />
                  Add Objective
                </button>
              </div>

              <div className="p-5 space-y-3">
                {settings.departmentObjectives.map((obj) => (
                  <div key={obj.id} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div>
                        <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400 font-medium">
                          Department
                        </label>
                        <select
                          value={obj.department}
                          onChange={(e) => handleUpdateDepartmentObjective(obj.id, 'department', parseInt(e.target.value))}
                          className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire transition-all ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                        >
                          {departments.map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400 font-medium">Title</label>
                        <input
                          type="text"
                          value={obj.title}
                          onChange={(e) => {
                            const newObjs = settings.departmentObjectives.map(o => 
                              o.id === obj.id ? { ...o, title: e.target.value } : o
                            );
                            setSettings(prev => ({ ...prev, departmentObjectives: newObjs }));
                          }}
                          onBlur={(e) => handleUpdateDepartmentObjective(obj.id, 'title', e.target.value)}
                          className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire transition-all ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                          placeholder="Objective title"
                        />
                      </div>

                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400 font-medium">Weight %</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={obj.weight}
                            onChange={(e) => {
                              const newObjs = settings.departmentObjectives.map(o => 
                                o.id === obj.id ? { ...o, weight: parseInt(e.target.value) || 0 } : o
                              );
                              setSettings(prev => ({ ...prev, departmentObjectives: newObjs }));
                            }}
                            onBlur={() => handleUpdateDepartmentObjective(obj.id, 'weight', obj.weight)}
                            className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire transition-all ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1.5 opacity-0">Delete</label>
                          <button
                            onClick={() => handleDeleteDepartmentObjective(obj.id)}
                            disabled={loading}
                            className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs disabled:opacity-50 transition-all shadow-sm"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {settings.departmentObjectives.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No objectives yet. Click "Add Objective" to create one.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. SCALES */}
          {activeTab === 'scales' && (
            <div className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
              <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-mystic">
                    Evaluation Scale
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Configure rating scales for performance evaluation</p>
                </div>
                <button
                  onClick={handleAddEvaluationScale}
                  disabled={loading}
                  className="px-3 py-2 text-xs font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-all shadow-sm flex items-center disabled:opacity-50"
                >
                  <Plus className="w-3 h-3 mr-1.5" />
                  Add Scale
                </button>
              </div>
              
              <div className="p-5 space-y-3">
                {settings.evaluationScale.map((scale) => (
                  <div key={scale.id} className={`p-4 rounded-lg ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'} border ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                    <div className="grid grid-cols-6 gap-3 items-end">
                      <div>
                        <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400 font-medium">Name</label>
                        <input
                          type="text"
                          value={scale.name}
                          onChange={(e) => {
                            const newScales = settings.evaluationScale.map(s => 
                              s.id === scale.id ? { ...s, name: e.target.value } : s
                            );
                            setSettings(prev => ({ ...prev, evaluationScale: newScales }));
                          }}
                          onBlur={(e) => handleUpdateEvaluationScale(scale.id, 'name', e.target.value)}
                          placeholder="E+"
                          className={`w-full px-2 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire transition-all ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400 font-medium">Value</label>
                        <input
                          type="number"
                          value={scale.value}
                          onChange={(e) => {
                            const newScales = settings.evaluationScale.map(s => 
                              s.id === scale.id ? { ...s, value: parseInt(e.target.value) || 0 } : s
                            );
                            setSettings(prev => ({ ...prev, evaluationScale: newScales }));
                          }}
                          onBlur={() => handleUpdateEvaluationScale(scale.id, 'value', scale.value)}
                          placeholder="5"
                          className={`w-full px-2 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire transition-all ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400 font-medium">Min %</label>
                        <input
                          type="number"
                          value={scale.range_min}
                          onChange={(e) => {
                            const newScales = settings.evaluationScale.map(s => 
                              s.id === scale.id ? { ...s, range_min: parseInt(e.target.value) || 0 } : s
                            );
                            setSettings(prev => ({ ...prev, evaluationScale: newScales }));
                          }}
                          onBlur={() => handleUpdateEvaluationScale(scale.id, 'range_min', scale.range_min)}
                          placeholder="71"
                          className={`w-full px-2 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire transition-all ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400 font-medium">Max %</label>
                        <input
                          type="number"
                          value={scale.range_max}
                          onChange={(e) => {
                            const newScales = settings.evaluationScale.map(s => 
                              s.id === scale.id ? { ...s, range_max: parseInt(e.target.value) || 0 } : s
                            );
                            setSettings(prev => ({ ...prev, evaluationScale: newScales }));
                          }}
                          onBlur={() => handleUpdateEvaluationScale(scale.id, 'range_max', scale.range_max)}
                          placeholder="90"
                          className={`w-full px-2 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire transition-all ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400 font-medium">Description</label>
                        <input
                          type="text"
                          value={scale.description}
                          onChange={(e) => {
                            const newScales = settings.evaluationScale.map(s => 
                              s.id === scale.id ? { ...s, description: e.target.value } : s
                            );
                            setSettings(prev => ({ ...prev, evaluationScale: newScales }));
                          }}
                          onBlur={(e) => handleUpdateEvaluationScale(scale.id, 'description', e.target.value)}
                          placeholder="Exceeds standards"
                          className={`w-full px-2 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire transition-all ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                        />
                      </div>
                      <div>
                        <button
                          onClick={() => handleDeleteEvaluationScale(scale.id)}
                          disabled={loading}
                          className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs disabled:opacity-50 transition-all shadow-sm"
                        >
                          <Trash2 className="w-3 h-3 mx-auto" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {settings.evaluationScale.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    <Award className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-xs">No scales yet. Click "Add Scale" to create one.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 6. TARGETS */}
          {activeTab === 'targets' && (
            <div className={`rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
              <div className="p-5 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-mystic">
                  Evaluation Targets
                </h3>
                <p className="text-xs text-gray-500 mt-1">Set target scores for objectives and competencies</p>
              </div>
              
              <div className="p-5">
                <div className="max-w-md">
                  <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400 font-medium">Objective Score Target</label>
                  <input
                    type="number"
                    value={settings.evaluationTargets.objective_score_target}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      evaluationTargets: { ...prev.evaluationTargets, objective_score_target: parseInt(e.target.value) || 0 }
                    }))}
                    className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                  />
                  <p className="text-xs text-gray-500 mt-1.5">Maximum possible score for objectives</p>
                </div>
              </div>

              <div className="p-5 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
                <button
                  onClick={handleSaveEvaluationTargets}
                  disabled={loading}
                  className="px-4 py-2 text-xs font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-all shadow-sm flex items-center disabled:opacity-50"
                >
                  {loading ? <Loader className="w-4 h-4 mr-1.5 animate-spin" /> : <Save className="w-4 h-4 mr-1.5" />}
                  Save Targets
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notification Toast */}
        {showNotification && (
          <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg ${
            notificationType === 'success' ? 'bg-green-600' :
            notificationType === 'error' ? 'bg-red-600' :
            'bg-blue-600'
          } text-white flex items-center gap-2 z-50 text-xs animate-slide-up`}>
            {notificationType === 'success' && <CheckCircle className="w-4 h-4" />}
            {notificationType === 'error' && <XCircle className="w-4 h-4" />}
            {notificationType === 'info' && <AlertCircle className="w-4 h-4" />}
            <span className="font-medium">{notificationMessage}</span>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}