"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import performanceApi from "@/services/performanceService";
import competencyApi from "@/services/competencyApi";

// Component Imports
import PerformanceHeader from "@/components/performance/PerformanceHeader";
import PerformanceDashboard from "@/components/performance/PerformanceDashboard";
import EmployeePerformanceDetail from "@/components/performance/EmployeePerformanceDetail";

// Icons
import { Loader, CheckCircle, XCircle, AlertCircle, Users } from 'lucide-react';

export default function PerformanceManagementPage() {
  const { darkMode } = useTheme();
  const router = useRouter();
  
  // UI State
  const [activeView, setActiveView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  // User & Permissions
  const [permissions, setPermissions] = useState({
    is_admin: false,
    can_view_all: false,
    accessible_employee_count: 0,
    permissions: [],
    employee: null
  });

  // Performance Year Data
  const [activeYear, setActiveYear] = useState(null);
  const [selectedYear, setSelectedYear] = useState(null);
  const [performanceYears, setPerformanceYears] = useState([]);

  // Dashboard Data
  const [dashboardStats, setDashboardStats] = useState(null);
  const [employees, setEmployees] = useState([]);

  // Employee Detail
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedPerformanceId, setSelectedPerformanceId] = useState(null);
  const [performanceData, setPerformanceData] = useState({});

  // Settings & References
  const [settings, setSettings] = useState({
    weightConfigs: [],
    goalLimits: { min: 3, max: 7 },
    departmentObjectives: [],
    evaluationScale: [],
    evaluationTargets: { objective_score_target: 21 },
    statusTypes: []
  });

  // Competencies - Store all behavioral competencies with group info
  const [behavioralCompetencies, setBehavioralCompetencies] = useState([]);

  // ==================== INITIALIZATION ====================
  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (selectedYear && activeYear) {
      loadDashboardData();
    }
  }, [selectedYear]);

  const initializeApp = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPermissions(),
        loadActiveYear(),
        loadSettings(),
        loadBehavioralCompetencies()
      ]);
    } catch (error) {
      console.error('❌ Initialization error:', error);
      showNotification('Failed to load application data', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ==================== DATA LOADING ====================
  const loadPermissions = async () => {
    try {
      const permsData = await performanceApi.performances.getMyPermissions();
      console.log('✅ Permissions loaded:', permsData);
      setPermissions(permsData);
    } catch (error) {
      console.error('❌ Error loading permissions:', error);
      showNotification('Error loading permissions', 'error');
    }
  };

  const loadActiveYear = async () => {
    try {
      const yearData = await performanceApi.years.getActiveYear();
      console.log('✅ Active year loaded:', yearData);
      setActiveYear(yearData);
      setSelectedYear(yearData.year);
      
      const allYears = await performanceApi.years.list();
      setPerformanceYears(allYears.results || allYears);
    } catch (error) {
      console.error('❌ Error loading year:', error);
      showNotification('Error loading performance year', 'error');
    }
  };

  const loadSettings = async () => {
    try {
      const [weightsRes, limitsRes, deptObjRes, scalesRes, targetsRes, statusesRes] = 
        await Promise.all([
          performanceApi.weightConfigs.list(),
          performanceApi.goalLimits.getActiveConfig(),
          performanceApi.departmentObjectives.list({}),
          performanceApi.evaluationScales.list(),
          performanceApi.evaluationTargets.getActiveConfig(),
          performanceApi.objectiveStatuses.list()
        ]);
      
      console.log('✅ Evaluation Scales loaded:', scalesRes);
      
      setSettings({
        weightConfigs: weightsRes.results || weightsRes,
        goalLimits: {
          min: limitsRes.min_goals,
          max: limitsRes.max_goals
        },
        departmentObjectives: deptObjRes.results || deptObjRes,
        evaluationScale: scalesRes.results || scalesRes,
        evaluationTargets: {
          objective_score_target: targetsRes.objective_score_target
        },
        statusTypes: statusesRes.results || statusesRes
      });
    } catch (error) {
      console.error('❌ Error loading settings:', error);
      showNotification('Error loading settings', 'error');
    }
  };

  const loadBehavioralCompetencies = async () => {
    try {
      console.log('🔄 Loading behavioral competencies...');
      
      // 1. Load all behavioral groups
      const groupsResponse = await competencyApi.behavioralGroups.getAll();
      const groups = groupsResponse.results || groupsResponse;
      
      console.log('📦 Loaded behavioral groups:', groups);
      
      const allCompetencies = [];
      
      // 2. For each group, load its competencies
      for (const group of groups) {
        try {
          const competenciesResponse = await competencyApi.behavioralGroups.getCompetencies(group.id);
          const competencies = competenciesResponse || [];
          
          console.log(`📋 Competencies for group "${group.name}":`, competencies);
          
          // Add group info to each competency
          competencies.forEach(comp => {
            allCompetencies.push({
              id: comp.id,
              name: comp.name,
              description: comp.description || '',
              group_id: group.id,
              group_name: group.name
            });
          });
        } catch (error) {
          console.error(`❌ Error loading competencies for group ${group.name}:`, error);
        }
      }
      
      console.log('✅ Total behavioral competencies loaded:', allCompetencies.length);
      console.log('📊 Competencies by group:', 
        allCompetencies.reduce((acc, comp) => {
          acc[comp.group_name] = (acc[comp.group_name] || 0) + 1;
          return acc;
        }, {})
      );
      
      setBehavioralCompetencies(allCompetencies);
      return allCompetencies;
    } catch (error) {
      console.error('❌ Error loading behavioral competencies:', error);
      showNotification('Error loading competencies', 'error');
      return [];
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const stats = await performanceApi.dashboard.getStatistics(selectedYear);
      setDashboardStats(stats);
      await loadEmployees();
    } catch (error) {
      console.error('❌ Error loading dashboard:', error);
      showNotification('Error loading dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployees = async () => {
    try {
      let employeesResponse;
      
      if (permissions.can_view_all) {
        employeesResponse = await performanceApi.employees.list({ page_size: 1000 });
      } else {
        employeesResponse = await performanceApi.employees.list({ 
          page_size: 1000,
          line_manager_id: permissions.employee?.id
        });
      }
      
      const allEmployees = employeesResponse.results || employeesResponse;
      
      const perfsResponse = await performanceApi.performances.list({ 
        year: selectedYear 
      });
      const perfs = perfsResponse.results || perfsResponse;
      
      let filteredEmployees = allEmployees;
      
      if (!permissions.can_view_all && permissions.employee) {
        filteredEmployees = allEmployees.filter(emp => 
          emp.id === permissions.employee.id || 
          emp.line_manager_email === permissions.employee.email
        );
      }
      
      const employeesWithPerformance = filteredEmployees.map(emp => {
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
      console.error('❌ Error loading employees:', error);
      showNotification('Error loading employees', 'error');
    }
  };

  const loadPerformanceData = async (employeeId, year) => {
  const key = `${employeeId}_${year}`;
  
  if (performanceData[key]) {
    setSelectedPerformanceId(performanceData[key].id);
    return performanceData[key];
  }
  
  setLoading(true);
  try {
    const response = await performanceApi.performances.list({
      employee_id: employeeId,
      year: year
    });
    
    const perfs = response.results || response;
    let detailData;
    
    if (perfs.length > 0) {
      const performance = perfs[0];
      detailData = await performanceApi.performances.get(performance.id);
    } else {
      detailData = await performanceApi.performances.initialize({
        employee: employeeId,
        performance_year: activeYear.id
      });
    }
    
    console.log('📊 Raw performance data from API:', detailData);
    console.log('📋 Available behavioral competencies:', behavioralCompetencies);
    
    // ✅ CRITICAL FIX: Check if behavioralCompetencies is loaded
    if (!behavioralCompetencies || behavioralCompetencies.length === 0) {
      console.error('❌ PROBLEM: Behavioral competencies not loaded yet!');
      console.log('⏳ Reloading competencies...');
      await loadBehavioralCompetencies();
    }
    
    // ✅ Enrich competency ratings with group info
    if (detailData.competency_ratings && detailData.competency_ratings.length > 0) {
      console.log('🔄 Enriching competency ratings...');
      
      const enrichedRatings = detailData.competency_ratings.map((rating) => {
        const competencyInfo = behavioralCompetencies.find(
          comp => comp.id === rating.behavioral_competency
        );
        
        if (competencyInfo) {
          console.log(`✅ Enriched rating ${rating.id}:`, {
            id: rating.behavioral_competency,
            name: competencyInfo.name,
            group: competencyInfo.group_name
          });
          
          return {
            ...rating,
            competency_name: competencyInfo.name,
            competency_group_id: competencyInfo.group_id,
            competency_group_name: competencyInfo.group_name,
            description: competencyInfo.description
          };
        } else {
          console.warn(`⚠️ Competency ${rating.behavioral_competency} not found`);
          return {
            ...rating,
            competency_name: `Unknown Competency (ID: ${rating.behavioral_competency})`,
            competency_group_id: null,
            competency_group_name: 'Ungrouped'
          };
        }
      });
      
      detailData.competency_ratings = enrichedRatings;
      
      console.log('✅ Enrichment complete!');
      console.log('   Final ratings:', enrichedRatings);
      console.log('   Groups found:', [...new Set(enrichedRatings.map(r => r.competency_group_name))]);
      
    } else {
      console.log('⚠️ No competency ratings in performance data');
    }
    
    setPerformanceData(prev => ({
      ...prev,
      [key]: detailData
    }));
    
    setSelectedPerformanceId(detailData.id);
    
    console.log('✅ Performance data loaded successfully');
    
    return detailData;
    
  } catch (error) {
    console.error('❌ Error loading performance data:', error);
    showNotification('Error loading performance data', 'error');
    return null;
  } finally {
    setLoading(false);
  }
};


  // ==================== HELPER FUNCTIONS ====================
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const canViewEmployee = (employeeId) => {
    if (permissions.can_view_all) return true;
    if (!permissions.employee) return false;
    return employeeId === permissions.employee.id;
  };

  const canEditPerformance = (employeeId) => {
    if (permissions.is_admin) return true;
    if (!permissions.employee) return false;
    
    const employee = employees.find(e => e.id === employeeId);
    if (!employee) return false;
    
    return employee.line_manager === permissions.employee.name;
  };

  const getCurrentPeriod = () => {
    if (!activeYear) return 'CLOSED';
    return activeYear.current_period || 'CLOSED';
  };

  // ==================== OBJECTIVES HANDLERS ====================
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

  const handleAddObjective = () => {
    const key = `${selectedEmployee.id}_${selectedYear}`;
    const data = performanceData[key];
    const objectives = data.objectives || [];
    
    const totalWeight = objectives.reduce((sum, obj) => sum + (parseFloat(obj.weight) || 0), 0);
    
    if (objectives.length >= settings.goalLimits.max || totalWeight >= 100) {
      showNotification('Cannot add more objectives', 'error');
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
      showNotification('Objectives draft saved successfully');
      await loadPerformanceData(selectedEmployee.id, selectedYear);
    } catch (error) {
      console.error('❌ Error saving objectives:', error);
      showNotification(error.response?.data?.error || 'Error saving objectives', 'error');
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
      showNotification(`Minimum ${settings.goalLimits.min} objectives required`, 'error');
      return;
    }
    
    const totalWeight = objectives.reduce((sum, obj) => sum + (parseFloat(obj.weight) || 0), 0);
    if (totalWeight !== 100) {
      showNotification('Total weight must be 100%', 'error');
      return;
    }
    
    setLoading(true);
    try {
      await performanceApi.performances.submitObjectives(selectedPerformanceId);
      showNotification('Objectives submitted successfully');
      await loadPerformanceData(selectedEmployee.id, selectedYear);
    } catch (error) {
      console.error('❌ Error submitting objectives:', error);
      showNotification(error.response?.data?.error || 'Error submitting objectives', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ==================== COMPETENCIES HANDLERS ====================
  const handleUpdateCompetency = (index, field, value) => {
  const key = `${selectedEmployee.id}_${selectedYear}`;
  const data = performanceData[key];
  const newCompetencies = [...(data.competency_ratings || [])];
  
  newCompetencies[index] = {
    ...newCompetencies[index],
    [field]: value
  };
  
  console.log(`🔄 Updated competency [${index}][${field}] = ${value}`);
  console.log('   New competencies:', newCompetencies[index]);
  
  setPerformanceData(prev => ({
    ...prev,
    [key]: {
      ...prev[key],
      competency_ratings: newCompetencies
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
      showNotification('Competencies draft saved successfully');
      await loadPerformanceData(selectedEmployee.id, selectedYear);
    } catch (error) {
      console.error('❌ Error saving competencies:', error);
      showNotification(error.response?.data?.error || 'Error saving competencies', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCompetencies = async () => {
    if (!selectedPerformanceId) return;
    
    setLoading(true);
    try {
      await performanceApi.performances.submitCompetencies(selectedPerformanceId);
      showNotification('Competencies submitted successfully');
      await loadPerformanceData(selectedEmployee.id, selectedYear);
    } catch (error) {
      console.error('❌ Error submitting competencies:', error);
      showNotification(error.response?.data?.error || 'Error submitting competencies', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ==================== MID-YEAR REVIEW HANDLERS ====================
  const handleSaveMidYearDraft = async (userRole, comment, objectives = null) => {
    if (!selectedPerformanceId) return;
    
    setLoading(true);
    try {
      await performanceApi.performances.saveMidYearDraft(
        selectedPerformanceId,
        userRole,
        comment,
        objectives
      );
      showNotification(`Mid-year ${userRole} draft saved successfully`);
      await loadPerformanceData(selectedEmployee.id, selectedYear);
    } catch (error) {
      console.error('❌ Error saving mid-year draft:', error);
      showNotification(error.response?.data?.error || 'Error saving mid-year draft', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMidYearEmployee = async (comment, objectives = null) => {
    if (!selectedPerformanceId) return;
    
    setLoading(true);
    try {
      await performanceApi.performances.submitMidYearEmployee(
        selectedPerformanceId,
        comment,
        objectives
      );
      showNotification('Mid-year self-review submitted successfully');
      await loadPerformanceData(selectedEmployee.id, selectedYear);
    } catch (error) {
      console.error('❌ Error submitting mid-year employee review:', error);
      showNotification(error.response?.data?.error || 'Error submitting mid-year review', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMidYearManager = async (comment, objectives = null) => {
    if (!selectedPerformanceId) return;
    
    setLoading(true);
    try {
      await performanceApi.performances.submitMidYearManager(
        selectedPerformanceId,
        comment,
        objectives
      );
      showNotification('Mid-year review completed successfully');
      await loadPerformanceData(selectedEmployee.id, selectedYear);
    } catch (error) {
      console.error('❌ Error submitting mid-year manager review:', error);
      showNotification(error.response?.data?.error || 'Error completing mid-year review', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestMidYearClarification = async (comment) => {
    if (!selectedPerformanceId) return;
    
    setLoading(true);
    try {
      await performanceApi.performances.requestMidYearClarification(
        selectedPerformanceId,
        comment
      );
      showNotification('Clarification request sent successfully');
      await loadPerformanceData(selectedEmployee.id, selectedYear);
    } catch (error) {
      console.error('❌ Error requesting clarification:', error);
      showNotification(error.response?.data?.error || 'Error requesting clarification', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ==================== DEVELOPMENT NEEDS HANDLERS ====================
  const handleUpdateDevelopmentNeed = (index, field, value) => {
    const key = `${selectedEmployee.id}_${selectedYear}`;
    const data = performanceData[key];
    const newNeeds = [...(data.development_needs || [])];
    newNeeds[index] = {
      ...newNeeds[index],
      [field]: value
    };
    
    setPerformanceData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        development_needs: newNeeds
      }
    }));
  };

  const handleAddDevelopmentNeed = () => {
    const key = `${selectedEmployee.id}_${selectedYear}`;
    const newNeed = {
      competency_gap: '',
      development_activity: '',
      progress: 0,
      comment: ''
    };
    
    setPerformanceData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        development_needs: [...(prev[key].development_needs || []), newNeed]
      }
    }));
  };

  const handleDeleteDevelopmentNeed = (index) => {
    const key = `${selectedEmployee.id}_${selectedYear}`;
    const data = performanceData[key];
    const newNeeds = [...(data.development_needs || [])];
    newNeeds.splice(index, 1);
    
    setPerformanceData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        development_needs: newNeeds
      }
    }));
  };

  const handleSaveDevelopmentNeedsDraft = async () => {
    if (!selectedPerformanceId) return;
    
    const key = `${selectedEmployee.id}_${selectedYear}`;
    const data = performanceData[key];
    
    setLoading(true);
    try {
      await performanceApi.performances.saveDevelopmentNeedsDraft(
        selectedPerformanceId,
        data.development_needs || []
      );
      showNotification('Development needs draft saved successfully');
      await loadPerformanceData(selectedEmployee.id, selectedYear);
    } catch (error) {
      console.error('❌ Error saving development needs:', error);
      showNotification(error.response?.data?.error || 'Error saving development needs', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitDevelopmentNeeds = async () => {
    if (!selectedPerformanceId) return;
    
    setLoading(true);
    try {
      await performanceApi.performances.submitDevelopmentNeeds(selectedPerformanceId);
      showNotification('Development needs submitted successfully');
      await loadPerformanceData(selectedEmployee.id, selectedYear);
    } catch (error) {
      console.error('❌ Error submitting development needs:', error);
      showNotification(error.response?.data?.error || 'Error submitting development needs', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ==================== OTHER HANDLERS ====================
  const handleSelectEmployee = async (employee) => {
    if (!canViewEmployee(employee.id)) {
      showNotification('You do not have permission to view this employee', 'error');
      return;
    }
    
    setSelectedEmployee(employee);
    await loadPerformanceData(employee.id, selectedYear);
    setActiveView('detail');
  };

  const handleBackToDashboard = () => {
    setSelectedEmployee(null);
    setSelectedPerformanceId(null);
    setActiveView('dashboard');
  };

  const handleExportExcel = async () => {
    if (!selectedPerformanceId) return;
    
    setLoading(true);
    try {
      await performanceApi.downloadExcel(
        selectedPerformanceId, 
        `performance_${selectedEmployee.employee_id}_${selectedYear}.xlsx`
      );
      showNotification('Export successful');
    } catch (error) {
      console.error('❌ Error exporting:', error);
      showNotification('Error exporting', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ==================== RENDER ====================
  if (loading && !activeYear) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Loading Performance Management System...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const currentKey = selectedEmployee ? `${selectedEmployee.id}_${selectedYear}` : null;
  const currentPerformanceData = currentKey ? performanceData[currentKey] : null;

  return (
    <DashboardLayout>
      <div className="min-h-screen p-6 max-w-[1600px] mx-auto">
        {/* Header */}
        <PerformanceHeader
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          performanceYears={performanceYears}
          currentPeriod={getCurrentPeriod()}
          loading={loading}
          onRefresh={loadDashboardData}
          onSettings={() => router.push('/efficiency/settings')}
          darkMode={darkMode}
        />

        {/* Main Content */}
        {activeView === 'dashboard' ? (
          <PerformanceDashboard
            dashboardStats={dashboardStats}
            employees={employees}
            permissions={permissions}
            onSelectEmployee={handleSelectEmployee}
            canViewEmployee={canViewEmployee}
            darkMode={darkMode}
          />
        ) : (
          selectedEmployee && currentPerformanceData ? (
            <EmployeePerformanceDetail
              employee={selectedEmployee}
              performanceData={currentPerformanceData}
              settings={settings}
              currentPeriod={getCurrentPeriod()}
              permissions={permissions}
              loading={loading}
              darkMode={darkMode}
              onBack={handleBackToDashboard}
              onExport={handleExportExcel}
              
              // Objectives
              onUpdateObjective={handleUpdateObjective}
              onAddObjective={handleAddObjective}
              onDeleteObjective={handleDeleteObjective}
              onSaveObjectivesDraft={handleSaveObjectivesDraft}
              onSubmitObjectives={handleSubmitObjectives}
              
              // Competencies
              onUpdateCompetency={handleUpdateCompetency}
              onSaveCompetenciesDraft={handleSaveCompetenciesDraft}
              onSubmitCompetencies={handleSubmitCompetencies}
              
              // Mid-Year Review
              onSaveMidYearDraft={handleSaveMidYearDraft}
              onSubmitMidYearEmployee={handleSubmitMidYearEmployee}
              onSubmitMidYearManager={handleSubmitMidYearManager}
              onRequestMidYearClarification={handleRequestMidYearClarification}
              
              // Development Needs
              onUpdateDevelopmentNeed={handleUpdateDevelopmentNeed}
              onAddDevelopmentNeed={handleAddDevelopmentNeed}
              onDeleteDevelopmentNeed={handleDeleteDevelopmentNeed}
              onSaveDevelopmentNeedsDraft={handleSaveDevelopmentNeedsDraft}
              onSubmitDevelopmentNeeds={handleSubmitDevelopmentNeeds}
            />
          ) : (
            <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-2xl border shadow-sm p-16 text-center`}>
              <Users className="w-20 h-20 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-semibold mb-2 text-gray-600 dark:text-gray-400">
                No Employee Selected
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Select a team member from the dashboard to view their performance
              </p>
              <button
                onClick={handleBackToDashboard}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm font-medium transition-all shadow-sm"
              >
                Back to Dashboard
              </button>
            </div>
          )
        )}

        {/* Notification Toast */}
        {notification.show && (
          <div className={`fixed bottom-6 right-6 px-5 py-4 rounded-xl shadow-2xl ${
            notification.type === 'success' ? 'bg-green-600' :
            notification.type === 'error' ? 'bg-red-600' :
            'bg-blue-600'
          } text-white flex items-center gap-3 z-50 text-sm font-medium animate-slide-up max-w-md`}>
            {notification.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
            {notification.type === 'error' && <XCircle className="w-5 h-5 flex-shrink-0" />}
            {notification.type === 'info' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
            <span>{notification.message}</span>
          </div>
        )}
      </div>

      {/* Global Loading Overlay */}
      {loading && activeYear && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-2xl p-8`}>
            <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Processing...</p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}