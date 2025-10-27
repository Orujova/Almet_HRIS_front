"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import performanceApi from "@/services/performanceService";
import competencyApi from "@/services/competencyApi";
import assessmentApi from "@/services/assessmentApi";
import { 
  ChevronDown, Plus, Trash2, Users, Target, Award, BarChart3, Save, Settings, 
  Calendar, FileText, TrendingUp, Star, AlertCircle, CheckCircle, XCircle, Send, 
  Loader, Download, RefreshCw, ArrowLeft, ExternalLink
} from 'lucide-react';

export default function PerformanceManagementPage() {
  const { darkMode } = useTheme();
  const router = useRouter();
  
  const [activeModule, setActiveModule] = useState('dashboard');
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedPerformanceId, setSelectedPerformanceId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationType, setNotificationType] = useState('success');

  const [activeYear, setActiveYear] = useState(null);
  const [performanceYears, setPerformanceYears] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [performanceData, setPerformanceData] = useState({});
  const [coreCompetencies, setCoreCompetencies] = useState([]);
  
  const [settings, setSettings] = useState({
    weightConfigs: [],
    goalLimits: { min: 3, max: 7 },
    departmentObjectives: [],
    evaluationScale: [],
    evaluationTargets: { objective_score_target: 21 },
    statusTypes: []
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedYear && activeYear) {
      loadDashboardStats();
    }
  }, [selectedYear]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await loadActiveYear();
      await loadSettings();
      await loadCoreCompetencies();
    } catch (error) {
      console.error('Error loading initial data:', error);
      showNotif('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadActiveYear = async () => {
    try {
      const yearData = await performanceApi.years.getActiveYear();
      setActiveYear(yearData);
      setSelectedYear(yearData.year);
      
      const allYears = await performanceApi.years.list();
      setPerformanceYears(allYears.results || allYears);
    } catch (error) {
      console.error('Error loading year:', error);
      showNotif('Error loading performance year', 'error');
    }
  };

  const loadSettings = async () => {
    try {
      const [weightsRes, limitsRes, deptObjRes, scalesRes, targetsRes, statusesRes] = await Promise.all([
        performanceApi.weightConfigs.list(),
        performanceApi.goalLimits.getActiveConfig(),
        performanceApi.departmentObjectives.list({}),
        performanceApi.evaluationScales.list(),
        performanceApi.evaluationTargets.getActiveConfig(),
        performanceApi.objectiveStatuses.list()
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
        statusTypes: statusesRes.results || statusesRes
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      showNotif('Error loading settings', 'error');
    }
  };

  const loadCoreCompetencies = async () => {
    try {
      const groupsResponse = await competencyApi.skillGroups.getAll();
      const groups = groupsResponse.results || groupsResponse;
      
      const formattedCompetencies = [];
      
      for (const group of groups) {
        try {
          const skillsResponse = await competencyApi.skillGroups.getSkills(group.id);
          const skills = skillsResponse || [];
          
          if (skills.length > 0) {
            formattedCompetencies.push({
              group: group.name,
              groupId: group.id,
              items: skills.map(skill => ({ 
                id: skill.id, 
                name: skill.name 
              }))
            });
          }
        } catch (error) {
          console.error(`Error loading skills for group ${group.id}:`, error);
        }
      }
      
      setCoreCompetencies(formattedCompetencies);
    } catch (error) {
      console.error('Error loading core competencies:', error);
      showNotif('Error loading core competencies', 'error');
    }
  };

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const response = await assessmentApi.employees.getAll({ page_size: 100 });
      const allEmployees = response.results || response;
      
      const perfsResponse = await performanceApi.performances.list({ 
        year: selectedYear 
      });
      const perfs = perfsResponse.results || perfsResponse;
      
      const employeesWithPerformance = allEmployees.map(emp => {
        const perf = perfs.find(p => p.employee === emp.id);
        return {
          id: emp.id,
          employee_id: emp.employee_id,
          name: emp.name,
          position: emp.position_group_name,
          department: emp.department_name,
          line_manager: emp.line_manager_name,
          performanceId: perf?.id || null,
          approval_status: perf?.approval_status || 'NOT_STARTED'
        };
      });
      
      setEmployees(employeesWithPerformance);
    } catch (error) {
      console.error('Error loading employees:', error);
      showNotif('Error loading employees', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardStats = async () => {
    try {
      const stats = await performanceApi.dashboard.getStatistics(selectedYear);
      setDashboardStats(stats);
      await loadEmployees();
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const loadPerformanceData = async (employeeId, year) => {
    const key = `${employeeId}_${year}`;
    
    if (performanceData[key]) {
      return performanceData[key];
    }
    
    setLoading(true);
    try {
      const response = await performanceApi.performances.list({
        employee_id: employeeId,
        year: year
      });
      
      const perfs = response.results || response;
      
      if (perfs.length > 0) {
        const performance = perfs[0];
        const detailData = await performanceApi.performances.get(performance.id);
        
        setPerformanceData(prev => ({
          ...prev,
          [key]: detailData
        }));
        
        setSelectedPerformanceId(performance.id);
        return detailData;
      } else {
        const initData = await performanceApi.performances.initialize({
          employee: employeeId,
          performance_year: activeYear.id
        });
        
        setPerformanceData(prev => ({
          ...prev,
          [key]: initData
        }));
        
        setSelectedPerformanceId(initData.id);
        return initData;
      }
    } catch (error) {
      console.error('Error loading performance data:', error);
      showNotif('Error loading performance data', 'error');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleSaveObjectivesDraft = async () => {
    if (!selectedPerformanceId) return;
    
    const key = `${selectedEmployee.id}_${selectedYear}`;
    const data = performanceData[key];
    
    setLoading(true);
    try {
      await performanceApi.performances.saveObjectivesDraft(
        selectedPerformanceId, 
        data.objectives || []
      );
      showNotif('Objectives draft saved successfully');
      await loadPerformanceData(selectedEmployee.id, selectedYear);
    } catch (error) {
      console.error('Error saving objectives:', error);
      showNotif(error.response?.data?.error || 'Error saving objectives', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitObjectives = async () => {
    if (!selectedPerformanceId) return;
    
    const key = `${selectedEmployee.id}_${selectedYear}`;
    const data = performanceData[key];
    const objectives = data.objectives || [];
    
    if (objectives.length < settings.goalLimits.min) {
      showNotif(`Minimum ${settings.goalLimits.min} objectives required`, 'error');
      return;
    }
    
    const totalWeight = calculateTotalWeight(objectives);
    if (totalWeight !== 100) {
      showNotif('Total weight must be 100%', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await performanceApi.performances.submitObjectives(selectedPerformanceId);
      showNotif('Objectives submitted successfully');
      await loadPerformanceData(selectedEmployee.id, selectedYear);
    } catch (error) {
      console.error('Error submitting objectives:', error);
      showNotif(error.response?.data?.error || 'Error submitting objectives', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddObjective = () => {
    const key = `${selectedEmployee.id}_${selectedYear}`;
    const data = performanceData[key];
    const objectives = data.objectives || [];
    
    if (!canAddObjective(objectives)) {
      showNotif('Cannot add more objectives', 'error');
      return;
    }
    
    const newObjective = {
      title: '',
      description: '',
      linked_department_objective: null,
      weight: 0,
      progress: 0,
      status: settings.statusTypes[0]?.id || null
    };
    
    setPerformanceData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        objectives: [...(prev[key].objectives || []), newObjective]
      }
    }));
  };

  const handleDeleteObjective = (index) => {
    const key = `${selectedEmployee.id}_${selectedYear}`;
    const data = performanceData[key];
    const newObjectives = [...(data.objectives || [])];
    newObjectives.splice(index, 1);
    
    setPerformanceData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        objectives: newObjectives
      }
    }));
  };

  const handleUpdateObjective = (index, field, value) => {
    const key = `${selectedEmployee.id}_${selectedYear}`;
    const data = performanceData[key];
    const newObjectives = [...(data.objectives || [])];
    newObjectives[index] = {
      ...newObjectives[index],
      [field]: value
    };
    
    setPerformanceData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        objectives: newObjectives
      }
    }));
  };

  const handleSaveCompetenciesDraft = async () => {
    if (!selectedPerformanceId) return;
    
    const key = `${selectedEmployee.id}_${selectedYear}`;
    const data = performanceData[key];
    
    setLoading(true);
    try {
      await performanceApi.performances.saveCompetenciesDraft(
        selectedPerformanceId,
        data.competency_ratings || []
      );
      showNotif('Competencies draft saved successfully');
      await loadPerformanceData(selectedEmployee.id, selectedYear);
    } catch (error) {
      console.error('Error saving competencies:', error);
      showNotif(error.response?.data?.error || 'Error saving competencies', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCompetencies = async () => {
    if (!selectedPerformanceId) return;
    
    setLoading(true);
    try {
      await performanceApi.performances.submitCompetencies(selectedPerformanceId);
      showNotif('Competencies submitted successfully');
      await loadPerformanceData(selectedEmployee.id, selectedYear);
    } catch (error) {
      console.error('Error submitting competencies:', error);
      showNotif(error.response?.data?.error || 'Error submitting competencies', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCompetency = (index, field, value) => {
    const key = `${selectedEmployee.id}_${selectedYear}`;
    const data = performanceData[key];
    const newCompetencies = [...(data.competency_ratings || [])];
    newCompetencies[index] = {
      ...newCompetencies[index],
      [field]: value
    };
    
    setPerformanceData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        competency_ratings: newCompetencies
      }
    }));
  };

  const handleSaveMidYearDraft = async (userRole) => {
    if (!selectedPerformanceId) return;
    
    const key = `${selectedEmployee.id}_${selectedYear}`;
    const data = performanceData[key];
    
    setLoading(true);
    try {
      await performanceApi.performances.saveMidYearDraft(
        selectedPerformanceId,
        userRole,
        userRole === 'employee' ? data.mid_year_employee_comment : data.mid_year_manager_comment
      );
      showNotif('Mid-year draft saved successfully');
    } catch (error) {
      console.error('Error saving mid-year:', error);
      showNotif('Error saving mid-year', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMidYear = async (userRole) => {
    if (!selectedPerformanceId) return;
    
    const key = `${selectedEmployee.id}_${selectedYear}`;
    const data = performanceData[key];
    
    setLoading(true);
    try {
      if (userRole === 'employee') {
        await performanceApi.performances.submitMidYearEmployee(
          selectedPerformanceId,
          data.mid_year_employee_comment
        );
      } else {
        await performanceApi.performances.submitMidYearManager(
          selectedPerformanceId,
          data.mid_year_manager_comment
        );
      }
      showNotif('Mid-year review submitted successfully');
      await loadPerformanceData(selectedEmployee.id, selectedYear);
    } catch (error) {
      console.error('Error submitting mid-year:', error);
      showNotif(error.response?.data?.error || 'Error submitting mid-year', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteEndYear = async () => {
    if (!selectedPerformanceId) return;
    
    const key = `${selectedEmployee.id}_${selectedYear}`;
    const data = performanceData[key];
    
    setLoading(true);
    try {
      await performanceApi.performances.completeEndYear(
        selectedPerformanceId,
        data.end_year_manager_comment
      );
      showNotif('End-year review completed successfully');
      await loadPerformanceData(selectedEmployee.id, selectedYear);
    } catch (error) {
      console.error('Error completing end-year:', error);
      showNotif(error.response?.data?.error || 'Error completing end-year', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDevelopmentNeeds = async () => {
    if (!selectedPerformanceId) return;
    
    const key = `${selectedEmployee.id}_${selectedYear}`;
    const data = performanceData[key];
    
    setLoading(true);
    try {
      await performanceApi.performances.saveDevelopmentNeedsDraft(
        selectedPerformanceId,
        data.development_needs || []
      );
      showNotif('Development needs saved successfully');
    } catch (error) {
      console.error('Error saving development needs:', error);
      showNotif('Error saving development needs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    if (!selectedPerformanceId) return;
    
    setLoading(true);
    try {
      await performanceApi.downloadExcel(
        selectedPerformanceId, 
        `performance_${selectedEmployee.employee_id}_${selectedYear}.xlsx`
      );
      showNotif('Export successful');
    } catch (error) {
      console.error('Error exporting:', error);
      showNotif('Error exporting', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotif = (message, type = 'success') => {
    setNotificationMessage(message);
    setNotificationType(type);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 3000);
  };

  const calculateTotalWeight = (objectives) => {
    return objectives.reduce((sum, obj) => sum + (parseFloat(obj.weight) || 0), 0);
  };

  const canAddObjective = (objectives) => {
    const totalWeight = calculateTotalWeight(objectives);
    return objectives.length < settings.goalLimits.max && totalWeight < 100;
  };

  const getCurrentPeriod = () => {
    if (!activeYear) return 'CLOSED';
    return activeYear.current_period || 'CLOSED';
  };

  const getPeriodLabel = (period) => {
    const labels = {
      'GOAL_SETTING': 'Goal Setting',
      'MID_YEAR_REVIEW': 'Mid-Year Review',
      'END_YEAR_REVIEW': 'End-Year Review',
      'CLOSED': 'Closed'
    };
    return labels[period] || period;
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      'DRAFT': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      'NOT_STARTED': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      'PENDING_EMPLOYEE_APPROVAL': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'PENDING_MANAGER_APPROVAL': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      'APPROVED': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'COMPLETED': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'NEED_CLARIFICATION': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const currentPeriod = getCurrentPeriod();

  // ==================== DASHBOARD RENDER ====================
  const renderDashboard = () => (
    <div className="space-y-5">
      {/* Header Card */}
      <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral rounded-xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold mb-1">Performance {selectedYear}</h2>
            <p className="text-xs opacity-90">
              Current Period: <span className="font-medium">{getPeriodLabel(currentPeriod)}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedYear || ''}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-1.5 text-xs rounded-lg bg-white text-almet-sapphire border-0 font-medium focus:ring-2 focus:ring-white/50"
            >
              {performanceYears.map(year => (
                <option key={year.id} value={year.year}>{year.year}</option>
              ))}
            </select>
            <button
              onClick={loadDashboardStats}
              disabled={loading}
              className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 disabled:opacity-50 transition-all"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Timeline */}
      {dashboardStats && (
        <div className={`rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm p-5`}>
          <h3 className="text-sm font-semibold mb-4 text-almet-cloud-burst dark:text-almet-mystic">Timeline</h3>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className={`w-3 h-3 rounded-full mt-0.5 ${currentPeriod === 'GOAL_SETTING' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
              <div className="flex-1">
                <h4 className="text-xs font-medium mb-1">Goal Setting</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Employee: {dashboardStats.timeline?.goal_setting?.employee_start} - {dashboardStats.timeline?.goal_setting?.employee_end}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Manager: {dashboardStats.timeline?.goal_setting?.manager_start} - {dashboardStats.timeline?.goal_setting?.manager_end}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className={`w-3 h-3 rounded-full mt-0.5 ${currentPeriod === 'MID_YEAR_REVIEW' ? 'bg-yellow-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
              <div className="flex-1">
                <h4 className="text-xs font-medium mb-1">Mid-Year Review</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {dashboardStats.timeline?.mid_year?.start} - {dashboardStats.timeline?.mid_year?.end}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className={`w-3 h-3 rounded-full mt-0.5 ${currentPeriod === 'END_YEAR_REVIEW' ? 'bg-blue-500' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
              <div className="flex-1">
                <h4 className="text-xs font-medium mb-1">End-Year Review</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {dashboardStats.timeline?.end_year?.start} - {dashboardStats.timeline?.end_year?.end}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm p-4`}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-almet-sapphire/10 flex items-center justify-center">
                <Target className="w-5 h-5 text-almet-sapphire" />
              </div>
              <span className="text-base font-bold text-almet-sapphire">
                {dashboardStats.objectives_completed}/{dashboardStats.total_employees}
              </span>
            </div>
            <h3 className="text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">Objectives Set</h3>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-almet-sapphire h-2 rounded-full transition-all" 
                style={{
                  width: `${dashboardStats.total_employees > 0 
                    ? (dashboardStats.objectives_completed / dashboardStats.total_employees) * 100 
                    : 0}%`
                }}
              ></div>
            </div>
          </div>

          <div className={`rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm p-4`}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-almet-steel-blue/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-almet-steel-blue" />
              </div>
              <span className="text-base font-bold text-almet-steel-blue">
                {dashboardStats.mid_year_completed}/{dashboardStats.total_employees}
              </span>
            </div>
            <h3 className="text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">Mid-Year Completed</h3>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-almet-steel-blue h-2 rounded-full transition-all" 
                style={{
                  width: `${dashboardStats.total_employees > 0 
                    ? (dashboardStats.mid_year_completed / dashboardStats.total_employees) * 100 
                    : 0}%`
                }}
              ></div>
            </div>
          </div>

          <div className={`rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm p-4`}>
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-almet-astral/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-almet-astral" />
              </div>
              <span className="text-base font-bold text-almet-astral">
                {dashboardStats.end_year_completed}/{dashboardStats.total_employees}
              </span>
            </div>
            <h3 className="text-xs font-medium mb-2 text-gray-700 dark:text-gray-300">End-Year Completed</h3>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-almet-astral h-2 rounded-full transition-all" 
                style={{
                  width: `${dashboardStats.total_employees > 0 
                    ? (dashboardStats.end_year_completed / dashboardStats.total_employees) * 100 
                    : 0}%`
                }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* My Team */}
      <div className={`rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm p-5`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-mystic flex items-center">
            <Users className="w-4 h-4 mr-2" />
            My Team
          </h3>
          <button
            onClick={loadEmployees}
            disabled={loading}
            className="px-3 py-1.5 text-xs bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral flex items-center disabled:opacity-50 transition-all shadow-sm"
          >
            <RefreshCw className={`w-3 h-3 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        
        {employees.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No team members found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {employees.map(employee => (
              <div
                key={employee.id}
                onClick={() => {
                  setSelectedEmployee(employee);
                  loadPerformanceData(employee.id, selectedYear);
                  setActiveModule('execute');
                }}
                className={`p-4 rounded-lg border ${darkMode ? 'border-gray-700 hover:border-almet-sapphire bg-gray-750' : 'border-gray-200 hover:border-almet-sapphire bg-gray-50'} cursor-pointer transition-all hover:shadow-md`}
              >
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 rounded-full bg-almet-sapphire text-white flex items-center justify-center text-xs font-medium mr-3">
                    {employee.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-medium truncate text-gray-900 dark:text-white">{employee.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{employee.position}</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs px-2 py-1 rounded-md font-medium ${getStatusBadgeColor(employee.approval_status)}`}>
                    {employee.approval_status?.replace(/_/g, ' ')}
                  </span>
                </div>
                
                <button className="w-full px-3 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral text-xs font-medium transition-all shadow-sm">
                  View Performance
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // ==================== EXECUTE RENDER ====================
  const renderExecute = () => {
    if (!selectedEmployee) {
      return (
        <div className={`rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm p-12 text-center`}>
          <Users className="w-16 h-16 mx-auto mb-3 text-gray-400" />
          <h3 className="text-sm font-semibold mb-2 text-gray-600 dark:text-gray-400">Select Employee</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Choose a team member to manage their performance</p>
          
          <button
            onClick={() => setActiveModule('dashboard')}
            className="px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral text-xs font-medium transition-all shadow-sm"
          >
            Go to Dashboard
          </button>
        </div>
      );
    }

    const key = `${selectedEmployee.id}_${selectedYear}`;
    const data = performanceData[key] || {};
    const objectives = data.objectives || [];
    const competencies = data.competency_ratings || [];
    const developmentNeeds = data.development_needs || [];
    
    const totalWeight = calculateTotalWeight(objectives);

    if (loading && !data.id) {
      return (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader className="w-10 h-10 animate-spin text-almet-sapphire mx-auto mb-2" />
            <p className="text-xs text-gray-500">Loading performance data...</p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        {/* Header */}
        <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => {
                  setSelectedEmployee(null);
                  setSelectedPerformanceId(null);
                  setActiveModule('dashboard');
                }}
                className="mr-3 p-1.5 hover:bg-white/20 rounded-lg transition-all"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 rounded-full bg-white text-almet-sapphire flex items-center justify-center text-sm font-bold mr-3">
                {selectedEmployee.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-sm font-semibold">{selectedEmployee.name}</h2>
                <p className="text-xs opacity-90">{selectedEmployee.position}</p>
                <p className="text-xs opacity-75">{selectedEmployee.department} • {selectedEmployee.employee_id}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExportExcel}
                disabled={loading}
                className="px-3 py-2 bg-white text-almet-sapphire rounded-lg hover:bg-gray-100 text-xs font-medium flex items-center disabled:opacity-50 transition-all shadow-sm"
              >
                <Download className="w-3 h-3 mr-1.5" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Evaluation Scale Reference */}
        <div className={`rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm overflow-hidden`}>
          <button
            onClick={(e) => {
              const elem = e.currentTarget.nextElementSibling;
              elem.classList.toggle('hidden');
            }}
            className={`w-full p-4 flex items-center justify-between text-left ${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'} transition-all`}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-almet-sapphire/10 flex items-center justify-center mr-3">
                <Star className="w-4 h-4 text-almet-sapphire" />
              </div>
              <h3 className="text-xs font-medium text-gray-900 dark:text-white">Evaluation Scale Reference</h3>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          
          <div className="hidden p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
              {settings.evaluationScale.map((scale) => (
                <div key={scale.id} className={`p-3 rounded-lg text-center ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="text-sm font-bold text-almet-sapphire mb-1">{scale.name}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">Value: {scale.value}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{scale.range_min}-{scale.range_max}%</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{scale.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Objectives Section */}
        <div className={`rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm p-5`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-almet-mystic flex items-center">
              <Target className="w-4 h-4 mr-2" />
              Employee Objectives
            </h3>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium px-2 py-1 rounded-md ${
                totalWeight === 100 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                totalWeight > 100 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 
                'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
              }`}>
                {totalWeight}%
              </span>
              <button
                onClick={handleAddObjective}
                disabled={!canAddObjective(objectives) || loading}
                className="px-3 py-1.5 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral text-xs font-medium disabled:opacity-50 flex items-center transition-all shadow-sm"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {objectives.map((objective, index) => (
              <div key={index} className={`p-4 border rounded-lg ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                  <div>
                    <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400 font-medium">Title</label>
                    <input
                      type="text"
                      value={objective.title || ''}
                      onChange={(e) => handleUpdateObjective(index, 'title', e.target.value)}
                      className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                      placeholder="Objective title"
                    />
                  </div>

                  <div>
                    <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400 font-medium">Department Objective</label>
                    <select
                      value={objective.linked_department_objective || ''}
                      onChange={(e) => handleUpdateObjective(index, 'linked_department_objective', e.target.value || null)}
                      className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      <option value="">Select (Optional)</option>
                      {settings.departmentObjectives
                        .filter(d => d.department_name === selectedEmployee.department)
                        .map(deptObj => (
                          <option key={deptObj.id} value={deptObj.id}>{deptObj.title}</option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400 font-medium">Description</label>
                  <textarea
                    value={objective.description || ''}
                    onChange={(e) => handleUpdateObjective(index, 'description', e.target.value)}
                    rows={2}
                    className={`w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    placeholder="Describe the objective"
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-3">
                  <div>
                    <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400 font-medium">Weight %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={objective.weight || 0}
                      onChange={(e) => handleUpdateObjective(index, 'weight', parseFloat(e.target.value) || 0)}
                      className={`w-full px-2 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400 font-medium">Rating</label>
                    <select
                      value={objective.end_year_rating || ''}
                      onChange={(e) => handleUpdateObjective(index, 'end_year_rating', e.target.value || null)}
                      disabled={currentPeriod !== 'END_YEAR_REVIEW'}
                      className={`w-full px-2 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} disabled:opacity-50`}
                    >
                      <option value="">--</option>
                      {settings.evaluationScale.map(scale => (
                        <option key={scale.id} value={scale.id}>{scale.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400 font-medium">Score</label>
                    <input
                      type="text"
                      value={typeof objective.calculated_score === 'number' 
                        ? objective.calculated_score.toFixed(2) 
                        : '0.00'}
                      readOnly
                      className={`w-full px-2 py-2 text-xs border rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-100 border-gray-300'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400 font-medium">Progress %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={objective.progress || 0}
                      onChange={(e) => handleUpdateObjective(index, 'progress', parseInt(e.target.value) || 0)}
                      className={`w-full px-2 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400 font-medium">Status</label>
                    <select
                      value={objective.status || ''}
                      onChange={(e) => handleUpdateObjective(index, 'status', e.target.value)}
                      className={`w-full px-2 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                    >
                      {settings.statusTypes.map(status => (
                        <option key={status.id} value={status.id}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => handleDeleteObjective(index)}
                    className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-medium transition-all shadow-sm"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}

            {objectives.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-xs">No objectives yet. Click "Add" to create objectives.</p>
              </div>
            )}
          </div>

          {objectives.length > 0 && (
            <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border`}>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">Objectives Score</h4>
                <div className="text-right">
                  <div className="text-sm font-bold text-almet-sapphire">
                    {typeof data.total_objectives_score === 'number' 
                      ? data.total_objectives_score.toFixed(2) 
                      : '0.00'} / {settings.evaluationTargets.objective_score_target}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {typeof data.objectives_percentage === 'number' 
                      ? data.objectives_percentage.toFixed(0) 
                      : '0'}%
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSaveObjectivesDraft}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center disabled:opacity-50 transition-all shadow-sm"
            >
              {loading ? <Loader className="w-3 h-3 mr-1.5 animate-spin" /> : <Save className="w-3 h-3 mr-1.5" />}
              Save Draft
            </button>
            
            <button
              onClick={handleSubmitObjectives}
              disabled={objectives.length < settings.goalLimits.min || totalWeight !== 100 || loading}
              className="px-4 py-2 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center transition-all shadow-sm"
            >
              <Send className="w-3 h-3 mr-1.5" />
              Submit
            </button>
          </div>
        </div>

        {/* Core Competencies Section */}
        <div className={`rounded-xl ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border shadow-sm p-5`}>
          <h3 className="text-sm font-semibold mb-4 text-almet-cloud-burst dark:text-almet-mystic flex items-center">
            <Award className="w-4 h-4 mr-2" />
             Competencies
          </h3>

          <div className="space-y-4">
            {coreCompetencies.map((group, groupIndex) => (
              <div key={groupIndex}>
                <h4 className="text-xs font-medium mb-3 text-almet-sapphire bg-almet-sapphire/5 px-3 py-2 rounded-lg">{group.group}</h4>
                <div className="space-y-2">
                  {competencies
                    .filter(c => c.competency_group === group.group || c.competency_name?.includes(group.group))
                    .map((comp, index) => {
                      const actualIndex = competencies.findIndex(c => c.id === comp.id);
                      
                      return (
                        <div key={comp.id || index} className={`grid grid-cols-3 gap-3 p-3 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                          <div>
                            <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400 font-medium">Competency</label>
                            <input
                              type="text"
                              value={comp.competency_name || comp.name || ''}
                              readOnly
                              className={`w-full px-2 py-2 text-xs border rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-100 border-gray-300'}`}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400 font-medium">Rating</label>
                            <select
                              value={comp.end_year_rating || ''}
                              onChange={(e) => handleUpdateCompetency(actualIndex, 'end_year_rating', e.target.value || null)}
                              disabled={currentPeriod !== 'END_YEAR_REVIEW'}
                              className={`w-full px-2 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-almet-sapphire/20 focus:border-almet-sapphire transition-all ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} disabled:opacity-50`}
                            >
                              <option value="">--</option>
                              {settings.evaluationScale.map(scale => (
                                <option key={scale.id} value={scale.id}>{scale.name}</option>
                              ))}
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-xs mb-1.5 text-gray-600 dark:text-gray-400 font-medium">Score</label>
                            <input
                              type="text"
                              value={comp.end_year_rating_value || '0'}
                              readOnly
                              className={`w-full px-2 py-2 text-xs border rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500' : 'bg-gray-100 border-gray-300'}`}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>

          {competencies.length > 0 && (
            <div className={`mt-4 p-4 rounded-lg ${darkMode ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border`}>
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300">Competencies Score</h4>
                <div className="text-right">
                  <div className="text-sm font-bold text-purple-600">
                    {typeof data.total_competencies_score === 'number' 
                      ? data.total_competencies_score.toFixed(2) 
                      : '0.00'}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {typeof data.competencies_percentage === 'number' 
                      ? data.competencies_percentage.toFixed(0) 
                      : '0'}%
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSaveCompetenciesDraft}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center disabled:opacity-50 transition-all shadow-sm"
            >
              {loading ? <Loader className="w-3 h-3 mr-1.5 animate-spin" /> : <Save className="w-3 h-3 mr-1.5" />}
              Save Draft
            </button>
            
            <button
              onClick={handleSubmitCompetencies}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center disabled:opacity-50 transition-all shadow-sm"
            >
              <Send className="w-3 h-3 mr-1.5" />
              Submit
            </button>
          </div>
        </div>

        {/* Final Summary */}
        {data.overall_weighted_percentage && (
          <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral rounded-xl p-5 text-white shadow-lg">
            <h3 className="text-sm font-semibold mb-4 flex items-center">
              <Star className="w-5 h-5 mr-2" />
              Final Performance Summary
            </h3>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <div className="opacity-75 mb-1">Obj Score</div>
                <div className="text-lg font-bold">
                  {typeof data.total_objectives_score === 'number' 
                    ? data.total_objectives_score.toFixed(2) 
                    : '0.00'}
                </div>
                <div className="opacity-75">
                  {typeof data.objectives_percentage === 'number' 
                    ? data.objectives_percentage.toFixed(0) 
                    : '0'}%
                </div>
              </div>
              
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <div className="opacity-75 mb-1">Comp Score</div>
                <div className="text-lg font-bold">
                  {typeof data.total_competencies_score === 'number' 
                    ? data.total_competencies_score.toFixed(2) 
                    : '0.00'}
                </div>
                <div className="opacity-75">
                  {typeof data.competencies_percentage === 'number' 
                    ? data.competencies_percentage.toFixed(0) 
                    : '0'}%
                </div>
              </div>
              
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <div className="opacity-75 mb-1">Obj Weight</div>
                <div className="text-lg font-bold">{data.weight_config?.objectives_weight || 70}%</div>
              </div>
              
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <div className="opacity-75 mb-1">Comp Weight</div>
                <div className="text-lg font-bold">{data.weight_config?.competencies_weight || 30}%</div>
              </div>
              
              <div className="bg-white/20 rounded-lg p-3 text-center">
                <div className="opacity-75 mb-1">Final</div>
                <div className="text-xl font-bold">{data.final_rating || 'N/A'}</div>
                <div className="opacity-75">
                  {typeof data.overall_weighted_percentage === 'number' 
                    ? data.overall_weighted_percentage.toFixed(0) 
                    : '0'}%
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ==================== MAIN RENDER ====================
  if (loading && !activeYear) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-almet-sapphire mx-auto mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading Performance Management System...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen p-4 max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-bold text-almet-cloud-burst dark:text-almet-mystic mb-1">
                Performance Management System
              </h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Comprehensive performance evaluation and tracking
              </p>
            </div>
            <button
              onClick={() => router.push('/efficiency/settings')}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-almet-comet text-white hover:bg-almet-waterloo transition-all shadow-sm flex items-center"
            >
              <Settings className="w-4 h-4 mr-1.5" />
              Settings
            </button>
          </div>
        </div>

        {/* Module Navigation */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setActiveModule('dashboard')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all shadow-sm ${
              activeModule === 'dashboard'
                ? 'bg-almet-sapphire text-white'
                : `${darkMode ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-white text-gray-700 border-gray-200'} border hover:bg-almet-mystic hover:text-almet-cloud-burst`
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-1.5" />
            Dashboard
          </button>
          
          <button
            onClick={() => setActiveModule('execute')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition-all shadow-sm ${
              activeModule === 'execute'
                ? 'bg-almet-sapphire text-white'
                : `${darkMode ? 'bg-gray-800 text-gray-300 border-gray-700' : 'bg-white text-gray-700 border-gray-200'} border hover:bg-almet-mystic hover:text-almet-cloud-burst`
            }`}
          >
            <Target className="w-4 h-4 inline mr-1.5" />
            Execute
          </button>
        </div>

        {/* Module Content */}
        {activeModule === 'dashboard' && renderDashboard()}
        {activeModule === 'execute' && renderExecute()}

        {/* Notification Toast */}
        {showNotification && (
          <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg ${
            notificationType === 'success' ? 'bg-green-600' :
            notificationType === 'error' ? 'bg-red-600' :
            'bg-blue-600'
          } text-white flex items-center gap-2 z-50 text-xs font-medium animate-slide-up`}>
            {notificationType === 'success' && <CheckCircle className="w-4 h-4" />}
            {notificationType === 'error' && <XCircle className="w-4 h-4" />}
            {notificationType === 'info' && <AlertCircle className="w-4 h-4" />}
            <span>{notificationMessage}</span>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}