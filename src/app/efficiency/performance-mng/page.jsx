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

  // Competencies
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
      setPermissions(permsData);
    } catch (error) {
      console.error('❌ Error loading permissions:', error);
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
      console.error('❌ Error loading year:', error);
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
    }
  };

  const loadBehavioralCompetencies = async () => {
    try {
      const groupsResponse = await competencyApi.behavioralGroups.getAll();
      const groups = groupsResponse.results || groupsResponse;
      
      const allCompetencies = [];
      
      for (const group of groups) {
        try {
          const competenciesResponse = await competencyApi.behavioralGroups.getCompetencies(group.id);
          const competencies = competenciesResponse || [];
          
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
      
      setBehavioralCompetencies(allCompetencies);
      return allCompetencies;
    } catch (error) {
      console.error('❌ Error loading behavioral competencies:', error);
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
    }
  };

  const loadPerformanceData = async (employeeId, year) => {
    const key = `${employeeId}_${year}`;
    
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
      
      if (!behavioralCompetencies || behavioralCompetencies.length === 0) {
        await loadBehavioralCompetencies();
      }
      
      if (detailData.competency_ratings && detailData.competency_ratings.length > 0) {
        const enrichedRatings = detailData.competency_ratings.map((rating) => {
          const competencyInfo = behavioralCompetencies.find(
            comp => comp.id === rating.behavioral_competency
          );
          
          if (competencyInfo) {
            return {
              ...rating,
              competency_name: competencyInfo.name,
              competency_group_id: competencyInfo.group_id,
              competency_group_name: competencyInfo.group_name,
              description: competencyInfo.description
            };
          } else {
            return {
              ...rating,
              competency_name: `Unknown Competency (ID: ${rating.behavioral_competency})`,
              competency_group_id: null,
              competency_group_name: 'Ungrouped'
            };
          }
        });
        
        detailData.competency_ratings = enrichedRatings;
      }
      
      console.log('✅ Performance data loaded:', {
        performanceId: detailData.id,
        objectives: detailData.objectives?.length || 0,
        competencies: detailData.competency_ratings?.length || 0,
        total_objectives_score: detailData.total_objectives_score,
        objectives_percentage: detailData.objectives_percentage,
        competencies_percentage: detailData.competencies_percentage,
        overall_percentage: detailData.overall_weighted_percentage,
        final_rating: detailData.final_rating
      });
      
      setPerformanceData(prev => ({
        ...prev,
        [key]: detailData
      }));
      
      setSelectedPerformanceId(detailData.id);
      
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
    
    // ✅ Immediately save to backend when end_year_rating changes
    if (field === 'end_year_rating') {
      const selectedScale = settings.evaluationScale?.find(s => s.id === value);
      if (selectedScale && newObjectives[index].weight) {
        const weight = parseFloat(newObjectives[index].weight) || 0;
        const targetScore = settings.evaluationTargets?.objective_score_target || 21;
        const calculatedScore = (selectedScale.value * weight * targetScore) / (5 * 100);
        
        newObjectives[index].calculated_score = calculatedScore;
        
        console.log('🎯 Objective rating updated:', {
          index,
          rating: value,
          scale_value: selectedScale.value,
          weight,
          calculated_score: calculatedScore
        });
      }
    }
    
    // Recalculate total
    let totalScore = 0;
    let totalWeight = 0;
    
    newObjectives.forEach((obj) => {
      totalWeight += parseFloat(obj.weight) || 0;
      if (obj.calculated_score) {
        totalScore += parseFloat(obj.calculated_score);
      }
    });
    
    const targetScore = settings.evaluationTargets?.objective_score_target || 21;
    const percentage = targetScore > 0 ? (totalScore / targetScore) * 100 : 0;
    
    setPerformanceData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        objectives: newObjectives,
        total_objectives_score: totalScore,
        objectives_percentage: percentage
      }
    }));
    
    // ✅ Auto-save after 1 second of no changes
    if (field === 'end_year_rating' && selectedPerformanceId) {
      setTimeout(async () => {
        try {
          await performanceApi.performances.saveObjectivesDraft(
            selectedPerformanceId,
            newObjectives
          );
          console.log('✅ Auto-saved objectives');
        } catch (error) {
          console.error('❌ Auto-save failed:', error);
        }
      }, 1000);
    }
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
      status: settings.statusTypes[0]?.id || null,
      end_year_rating: null,
      calculated_score: 0
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
    
    let totalScore = 0;
    let totalWeight = 0;
    
    newObjectives.forEach(obj => {
      if (obj.calculated_score) {
        totalScore += parseFloat(obj.calculated_score) || 0;
      }
      totalWeight += parseFloat(obj.weight) || 0;
    });
    
    const targetScore = settings.evaluationTargets?.objective_score_target || 21;
    const percentage = targetScore > 0 ? (totalScore / targetScore) * 100 : 0;
    
    setPerformanceData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        objectives: newObjectives,
        total_objectives_score: totalScore,
        objectives_percentage: percentage
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

  const handleCancelObjective = async (objectiveId, reason) => {
    if (!selectedPerformanceId) return;
    
    setLoading(true);
    try {
      await performanceApi.performances.cancelObjective(
        selectedPerformanceId,
        objectiveId,
        reason
      );
      showNotification('Objective cancelled successfully');
      await loadPerformanceData(selectedEmployee.id, selectedYear);
    } catch (error) {
      console.error('❌ Error cancelling objective:', error);
      showNotification(error.response?.data?.error || 'Error cancelling objective', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ==================== COMPETENCIES HANDLERS ====================
  const handleUpdateCompetency = (index, field, value) => {
    const key = `${selectedEmployee.id}_${selectedYear}`;
    const data = performanceData[key];
    const newCompetencies = [...(data.competency_ratings || [])];
    
    // ✅ When updating end_year_rating, also update the value
    if (field === 'end_year_rating') {
      const selectedScale = settings.evaluationScale?.find(s => s.id === value);
      
      newCompetencies[index] = {
        ...newCompetencies[index],
        end_year_rating: value,
        end_year_rating_value: selectedScale ? selectedScale.value : 0
      };
      
      console.log('🎯 Competency rating updated:', {
        index,
        competency: newCompetencies[index].competency_name,
        rating_id: value,
        rating_value: selectedScale ? selectedScale.value : 0,
        scale_name: selectedScale ? selectedScale.name : 'None'
      });
    } else {
      newCompetencies[index] = {
        ...newCompetencies[index],
        [field]: value
      };
    }
    
    // ✅ Recalculate scores immediately
    const totalRequired = newCompetencies.reduce((sum, comp) => 
      sum + (parseFloat(comp.required_level) || 0), 0
    );
    
    const totalActual = newCompetencies.reduce((sum, comp) => 
      sum + (parseFloat(comp.end_year_rating_value) || 0), 0
    );
    
    const percentage = totalRequired > 0 ? (totalActual / totalRequired) * 100 : 0;
    
    const getLetterGradeFromScale = (percentage) => {
      if (!settings.evaluationScale || settings.evaluationScale.length === 0) {
        return 'N/A';
      }
      
      const matchingScale = settings.evaluationScale.find(scale => 
        percentage >= scale.range_min && percentage <= scale.range_max
      );
      
      return matchingScale ? matchingScale.name : 'N/A';
    };
    
    const letterGrade = getLetterGradeFromScale(percentage);
    
    setPerformanceData(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        competency_ratings: newCompetencies,
        total_competencies_required_score: totalRequired,
        total_competencies_actual_score: totalActual,
        competencies_percentage: percentage,
        competencies_letter_grade: letterGrade
      }
    }));
    
    console.log('📊 Competency scores updated:', {
      totalRequired,
      totalActual,
      percentage: percentage.toFixed(2),
      letterGrade,
      competencies: newCompetencies.map(c => ({
        name: c.competency_name,
        required: c.required_level,
        rating_id: c.end_year_rating,
        rating_value: c.end_year_rating_value
      }))
    });
    
    // ✅ Auto-save after 1 second
    if (field === 'end_year_rating' && selectedPerformanceId) {
      setTimeout(async () => {
        try {
          const payload = newCompetencies.map(comp => ({
            id: comp.id,
            end_year_rating: comp.end_year_rating || null,
            notes: comp.notes || ''
          }));
          
          await performanceApi.performances.saveCompetenciesDraft(
            selectedPerformanceId,
            payload
          );
          console.log('✅ Auto-saved competencies');
        } catch (error) {
          console.error('❌ Auto-save failed:', error);
        }
      }, 1000);
    }
  };

  const handleSaveCompetenciesDraft = async () => {
    if (!selectedPerformanceId) return;
    
    const key = `${selectedEmployee.id}_${selectedYear}`;
    const data = performanceData[key];
    
    setLoading(true);
    try {
      const competenciesPayload = (data.competency_ratings || []).map(comp => ({
        id: comp.id,
        end_year_rating: comp.end_year_rating || null,
        notes: comp.notes || ''
      }));
      
      console.log('💾 Saving competencies draft:', {
        performance_id: selectedPerformanceId,
        competencies: competenciesPayload
      });
      
      const response = await performanceApi.performances.saveCompetenciesDraft(
        selectedPerformanceId,
        competenciesPayload
      );
      
      console.log('✅ Competencies saved:', response);
      
      showNotification('Competencies draft saved successfully');
      
      // ✅ Reload to get updated data from backend
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
    
    const key = `${selectedEmployee.id}_${selectedYear}`;
    const data = performanceData[key];
    const competencies = data.competency_ratings || [];
    
    // ✅ Validate all competencies have ratings
    const missingRatings = competencies.filter(comp => !comp.end_year_rating);
    
    if (missingRatings.length > 0) {
      showNotification(
        `${missingRatings.length} competencies missing ratings. Please rate all competencies.`,
        'error'
      );
      console.log('❌ Missing ratings:', missingRatings.map(c => c.competency_name));
      return;
    }
    
    setLoading(true);
    try {
      console.log('📤 Submitting competencies...');
      
      const response = await performanceApi.performances.submitCompetencies(selectedPerformanceId);
      
      console.log('✅ Competencies submitted:', response);
      
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

  // ==================== RENDER SECTION ====================
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
              
              onUpdateObjective={handleUpdateObjective}
              onAddObjective={handleAddObjective}
              onDeleteObjective={handleDeleteObjective}
              onSaveObjectivesDraft={handleSaveObjectivesDraft}
              onSubmitObjectives={handleSubmitObjectives}
              onCancelObjective={handleCancelObjective}
              
              onUpdateCompetency={handleUpdateCompetency}
              onSaveCompetenciesDraft={handleSaveCompetenciesDraft}
              onSubmitCompetencies={handleSubmitCompetencies}
              
              onSaveMidYearDraft={handleSaveMidYearDraft}
              onSubmitMidYearEmployee={handleSubmitMidYearEmployee}
              onSubmitMidYearManager={handleSubmitMidYearManager}
              
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

