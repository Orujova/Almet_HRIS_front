"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import performanceApi from "@/services/performanceService";
import competencyApi from "@/services/competencyApi";
import { useCallback, useRef } from 'react';

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
  const [leadershipCompetencies, setLeadershipCompetencies] = useState([]);
const [leadershipMainGroups, setLeadershipMainGroups] = useState([]);
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
        loadBehavioralCompetencies(),
        loadLeadershipCompetencies() 
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
      
      console.log('✅ Settings loaded:', {
        evaluationScale: scalesRes.results || scalesRes,
        weightConfigs: weightsRes.results
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
const loadLeadershipCompetencies = async () => {
  try {
    const mainGroupsResponse = await competencyApi.leadershipMainGroups.getAll();
    const mainGroups = mainGroupsResponse.results || mainGroupsResponse;
    
    const allLeadershipItems = [];
    
    for (const mainGroup of mainGroups) {
      try {
        const mainGroupDetail = await competencyApi.leadershipMainGroups.getById(mainGroup.id);
        const childGroups = mainGroupDetail.child_groups || [];
        
        for (const childGroup of childGroups) {
          try {
            const childGroupDetail = await competencyApi.leadershipChildGroups.getById(childGroup.id);
            const items = childGroupDetail.items || [];
            
            items.forEach(item => {
              allLeadershipItems.push({
                id: item.id,
                name: item.name,
                description: item.description || '',
                child_group_id: childGroup.id,
                child_group_name: childGroup.name,
                main_group_id: mainGroup.id,
                main_group_name: mainGroup.name
              });
            });
          } catch (error) {
            console.error(`❌ Error loading items for child group ${childGroup.name}:`, error);
          }
        }
      } catch (error) {
        console.error(`❌ Error loading child groups for main group ${mainGroup.name}:`, error);
      }
    }
    
    setLeadershipCompetencies(allLeadershipItems);
    setLeadershipMainGroups(mainGroups);
    console.log('✅ Loaded leadership competencies:', allLeadershipItems.length);
    return allLeadershipItems;
  } catch (error) {
    console.error('❌ Error loading leadership competencies:', error);
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
  
// src/app/efficiency/performance-mng/page.jsx - loadPerformanceData

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
    
    // ✅ Get employee info
    const employee = employees.find(e => e.id === employeeId);
    const positionName = employee?.position?.toUpperCase().replace('_', ' ').trim() || '';
    
    // ✅ Check if leadership position (EXPECTED type based on position)
    const leadershipKeywords = [
      'MANAGER', 'VICE_CHAIRMAN', 'VICE CHAIRMAN', 
      'DIRECTOR', 'VICE', 'HOD', 'HEAD OF DEPARTMENT'
    ];
    
    const isLeadershipPosition = leadershipKeywords.some(keyword => 
      positionName === keyword.toUpperCase() ||
      positionName.includes(keyword.toUpperCase())
    );
    
    console.log('📍 Position Check:', {
      employee: employee?.name,
      position: positionName,
      expectedType: isLeadershipPosition ? 'LEADERSHIP' : 'BEHAVIORAL'
    });
    
    // ✅✅✅ CRITICAL FIX: Detect ACTUAL competency type from data
    if (detailData.competency_ratings && detailData.competency_ratings.length > 0) {
      
      const firstRating = detailData.competency_ratings[0];
      
      // ✅ Detect actual type from data (NOT from position)
      const hasLeadershipItem = firstRating.leadership_item !== null && firstRating.leadership_item !== undefined;
      const hasBehavioralCompetency = firstRating.behavioral_competency !== null && firstRating.behavioral_competency !== undefined;
      
      const actualType = hasLeadershipItem ? 'LEADERSHIP' : 
                        hasBehavioralCompetency ? 'BEHAVIORAL' : 
                        'UNKNOWN';
      
      console.log('🎯 Competency Type Detection:', {
        hasLeadershipItem,
        hasBehavioralCompetency,
        actualType,
        firstRating: {
          leadership_item: firstRating.leadership_item,
          behavioral_competency: firstRating.behavioral_competency
        }
      });
      
      // ✅ WARNING: If type mismatch
      if (isLeadershipPosition && actualType === 'BEHAVIORAL') {
        console.error('❌ ERROR: Expected LEADERSHIP but got BEHAVIORAL competencies!');
        console.error(`This ${positionName} position should have a Leadership Assessment Template.`);
        
        showNotification(
          `⚠️ ERROR: ${employee.name} is a ${positionName} but has BEHAVIORAL competencies. ` +
          `Please create a Leadership Assessment Template for this position.`,
          'error'
        );
        
        setLoading(false);
        return null;
      }
      
      if (!isLeadershipPosition && actualType === 'LEADERSHIP') {
        console.warn('⚠️ WARNING: Expected BEHAVIORAL but got LEADERSHIP competencies!');
        console.warn(`Position ${positionName} has leadership assessment but shouldn't.`);
      }
      
      // ============ ENRICH BASED ON ACTUAL TYPE ============
      
      if (actualType === 'LEADERSHIP') {
        // ✅ LEADERSHIP COMPETENCIES
        if (!leadershipCompetencies || leadershipCompetencies.length === 0) {
          await loadLeadershipCompetencies();
        }
        
        console.log('🎯 Enriching LEADERSHIP competencies...');
        
        const enrichedRatings = detailData.competency_ratings.map((rating) => {
          const leadershipItem = leadershipCompetencies.find(
            item => item.id === rating.leadership_item
          );
          
          if (!leadershipItem) {
            console.warn(`⚠️ Leadership item not found: ID ${rating.leadership_item}`);
          }
          
          let ratingValue = 0;
          if (rating.end_year_rating_value !== null && rating.end_year_rating_value !== undefined) {
            ratingValue = parseFloat(rating.end_year_rating_value);
          } else if (rating.end_year_rating) {
            const selectedScale = settings.evaluationScale?.find(
              s => s.id === rating.end_year_rating
            );
            if (selectedScale) {
              ratingValue = selectedScale.value;
            }
          }
          
          return {
            ...rating,
            // ✅ PRIMARY NAME
            competency_name: leadershipItem?.name || `Leadership Item ${rating.leadership_item}`,
            
            // ✅ Leadership fields
            leadership_item_id: rating.leadership_item,
            leadership_item_name: leadershipItem?.name || 'Unknown',
            main_group_id: leadershipItem?.main_group_id || null,
            main_group_name: leadershipItem?.main_group_name || 'Ungrouped',
            child_group_id: leadershipItem?.child_group_id || null,
            child_group_name: leadershipItem?.child_group_name || 'Ungrouped',
            
            description: leadershipItem?.description || '',
            end_year_rating_value: ratingValue,
            
            // ✅ CORRECT type
            competency_type: 'LEADERSHIP'
          };
        });
        
        detailData.competency_ratings = enrichedRatings;
        detailData.is_leadership_assessment = true;
        
        console.log('✅ Enriched LEADERSHIP competencies:', enrichedRatings.length);
        
      } else if (actualType === 'BEHAVIORAL') {
        // ✅ BEHAVIORAL COMPETENCIES
        if (!behavioralCompetencies || behavioralCompetencies.length === 0) {
          await loadBehavioralCompetencies();
        }
        
        console.log('🎯 Enriching BEHAVIORAL competencies...');
        
        const enrichedRatings = detailData.competency_ratings.map((rating) => {
          const competency = behavioralCompetencies.find(
            comp => comp.id === rating.behavioral_competency
          );
          
          if (!competency) {
            console.warn(`⚠️ Behavioral competency not found: ID ${rating.behavioral_competency}`);
          }
          
          let ratingValue = 0;
          if (rating.end_year_rating_value !== null && rating.end_year_rating_value !== undefined) {
            ratingValue = parseFloat(rating.end_year_rating_value);
          } else if (rating.end_year_rating) {
            const selectedScale = settings.evaluationScale?.find(
              s => s.id === rating.end_year_rating
            );
            if (selectedScale) {
              ratingValue = selectedScale.value;
            }
          }
          
          return {
            ...rating,
            // ✅ PRIMARY NAME
            competency_name: competency?.name || `Behavioral Competency ${rating.behavioral_competency}`,
            
            // ✅ Behavioral fields
            behavioral_competency_id: rating.behavioral_competency,
            behavioral_competency_name: competency?.name || 'Unknown',
            competency_group_id: competency?.group_id || null,
            competency_group_name: competency?.group_name || 'Ungrouped',
            
            description: competency?.description || '',
            end_year_rating_value: ratingValue,
            
            // ✅ CORRECT type
            competency_type: 'BEHAVIORAL'
          };
        });
        
        detailData.competency_ratings = enrichedRatings;
        detailData.is_leadership_assessment = false;
        
        console.log('✅ Enriched BEHAVIORAL competencies:', enrichedRatings.length);
        
      } else {
        console.error('❌ ERROR: Could not detect competency type!');
        showNotification('Error: Unknown competency type', 'error');
        setLoading(false);
        return null;
      }
    }
    
    const recalculatedData = recalculateScores(detailData);
    
    setPerformanceData(prev => ({
      ...prev,
      [key]: recalculatedData
    }));
    
    setSelectedPerformanceId(recalculatedData.id);
    
    return recalculatedData;
    
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

  const getLetterGradeFromScale = (percentage) => {
    if (!settings.evaluationScale || settings.evaluationScale.length === 0) {
      return 'N/A';
    }
    
    const matchingScale = settings.evaluationScale.find(scale => 
      percentage >= scale.range_min && percentage <= scale.range_max
    );
    
    return matchingScale ? matchingScale.name : 'N/A';
  };

  const recalculateScores = (data) => {
    if (!data) return data;
    
    const newData = { ...data };
    
    let totalObjectivesScore = 0;
    (newData.objectives || []).forEach(obj => {
      if (!obj.is_cancelled) {
        totalObjectivesScore += parseFloat(obj.calculated_score) || 0;
      }
    });
    
    const targetScore = settings.evaluationTargets?.objective_score_target || 21;
    const objectivesPercentage = targetScore > 0 
      ? (totalObjectivesScore / targetScore) * 100 
      : 0;
    
    newData.total_objectives_score = totalObjectivesScore;
    newData.objectives_percentage = objectivesPercentage;
    newData.objectives_letter_grade = getLetterGradeFromScale(objectivesPercentage);

    let totalRequired = 0;
    let totalActual = 0;
    (newData.competency_ratings || []).forEach(comp => {
      const required = parseFloat(comp.required_level) || 0;
      const actual = parseFloat(comp.end_year_rating_value) || 0;
      totalRequired += required;
      totalActual += actual;
    });
    
    const competenciesPercentage = totalRequired > 0 
      ? (totalActual / totalRequired) * 100 
      : 0;
    
    newData.total_competencies_required_score = totalRequired;
    newData.total_competencies_actual_score = totalActual;
    newData.competencies_percentage = competenciesPercentage;
    newData.competencies_letter_grade = getLetterGradeFromScale(competenciesPercentage);

    const objectivesWeight = parseFloat(newData.objectives_weight) || 70;
    const competenciesWeight = parseFloat(newData.competencies_weight) || 30;
    
    const overallPercentage = 
      (objectivesPercentage * objectivesWeight / 100) + 
      (competenciesPercentage * competenciesWeight / 100);
    
    newData.overall_weighted_percentage = overallPercentage;
    
    if (!newData.final_rating) {
      newData.final_rating = getLetterGradeFromScale(overallPercentage);
    }
    
    return newData;
  };

  // ==================== OBJECTIVE HANDLERS ====================
  const saveObjectivesTimeoutRef = useRef(null);

  const debouncedSaveObjectives = useCallback((performanceId, objectives) => {
    if (saveObjectivesTimeoutRef.current) {
      clearTimeout(saveObjectivesTimeoutRef.current);
    }
    
    saveObjectivesTimeoutRef.current = setTimeout(async () => {
      try {
        console.log('🔄 Auto-saving objectives...');
        await performanceApi.performances.saveObjectivesDraft(performanceId, objectives);
        console.log('✅ Objectives auto-saved');
        showNotification('Changes saved', 'info');
      } catch (error) {
        console.error('❌ Auto-save error:', error);
      }
    }, 1000);
  }, []);

  const handleUpdateObjective = (index, field, value) => {
    const key = `${selectedEmployee.id}_${selectedYear}`;
    const data = performanceData[key];
    const newObjectives = [...(data.objectives || [])];
    newObjectives[index] = {
      ...newObjectives[index],
      [field]: value
    };
    
    if (field === 'end_year_rating') {
      const selectedScaleId = value ? parseInt(value) : null;
      if (selectedScaleId) {
        const selectedScale = settings.evaluationScale?.find(s => s.id === selectedScaleId);
        if (selectedScale) {
          const weight = parseFloat(newObjectives[index].weight) || 0;
          const targetScore = settings.evaluationTargets?.objective_score_target || 21;
          const calculatedScore = (selectedScale.value * weight * targetScore) / (5 * 100);
          newObjectives[index].calculated_score = calculatedScore;
        }
      } else {
        newObjectives[index].calculated_score = 0;
      }
    }
    
    const updatedData = {
      ...data,
      objectives: newObjectives
    };
    
    const recalculatedData = recalculateScores(updatedData);
    
    setPerformanceData(prev => ({
      ...prev,
      [key]: recalculatedData
    }));
    
    if (selectedPerformanceId) {
      debouncedSaveObjectives(selectedPerformanceId, newObjectives);
    }
  };

  const handleAddObjective = () => {
    const key = `${selectedEmployee.id}_${selectedYear}`;
    
    const defaultStatus = settings.statusTypes && settings.statusTypes.length > 0 
      ? settings.statusTypes[0].id 
      : null;
    
    const newObjective = {
      title: '',
      description: '',
      weight: 0,
      linked_department_objective: null,
      progress: 0,
      status: defaultStatus,
      end_year_rating: null,
      calculated_score: 0,
      is_cancelled: false
    };
    
    const updatedData = {
      ...performanceData[key],
      objectives: [...(performanceData[key].objectives || []), newObjective]
    };
    
    const recalculatedData = recalculateScores(updatedData);
    
    setPerformanceData(prev => ({
      ...prev,
      [key]: recalculatedData
    }));
  };

  const handleDeleteObjective = (index) => {
    const key = `${selectedEmployee.id}_${selectedYear}`;
    const data = performanceData[key];
    const newObjectives = [...(data.objectives || [])];
    newObjectives.splice(index, 1);
    
    const updatedData = {
      ...data,
      objectives: newObjectives
    };
    
    const recalculatedData = recalculateScores(updatedData);
    
    setPerformanceData(prev => ({
      ...prev,
      [key]: recalculatedData
    }));
  };

  const handleSaveObjectivesDraft = async (objectives) => {
    if (!selectedPerformanceId) return;
    
    setLoading(true);
    try {
      await performanceApi.performances.saveObjectivesDraft(selectedPerformanceId, objectives);
      showNotification('Objectives draft saved successfully');
      await loadPerformanceData(selectedEmployee.id, selectedYear);
    } catch (error) {
      console.error('❌ Error saving objectives:', error);
      showNotification(error.response?.data?.error || 'Error saving objectives', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitObjectives = async (objectives) => {
    if (!selectedPerformanceId) return;
    
    setLoading(true);
    try {
      await performanceApi.performances.submitObjectives(
        selectedPerformanceId,
        objectives
      );
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
      await performanceApi.performances.cancelObjective(selectedPerformanceId, objectiveId, reason);
      showNotification('Objective cancelled successfully');
      await loadPerformanceData(selectedEmployee.id, selectedYear);
    } catch (error) {
      console.error('❌ Error cancelling objective:', error);
      showNotification(error.response?.data?.error || 'Error cancelling objective', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ==================== COMPETENCY HANDLERS ====================
  const handleUpdateCompetency = (index, field, value) => {
    const key = `${selectedEmployee.id}_${selectedYear}`;
    const data = performanceData[key];
    const newCompetencies = [...(data.competency_ratings || [])];
    
    const updatedCompetency = {
      ...newCompetencies[index],
      [field]: value
    };
    
    if (field === 'end_year_rating') {
      const selectedScaleId = value ? parseInt(value) : null;
      if (selectedScaleId) {
        const selectedScale = settings.evaluationScale?.find(s => s.id === selectedScaleId);
        if (selectedScale) {
          updatedCompetency.end_year_rating_value = selectedScale.value;
        }
      } else {
        updatedCompetency.end_year_rating_value = 0;
      }
    }
    
    newCompetencies[index] = updatedCompetency;
    
    const updatedData = {
      ...data,
      competency_ratings: newCompetencies
    };
    
    const recalculatedData = recalculateScores(updatedData);
    
    setPerformanceData(prev => ({
      ...prev,
      [key]: recalculatedData
    }));
  };

  // src/app/performance-management/page.jsx

const handleSaveCompetenciesDraft = async (competencies) => {
  if (!selectedPerformanceId) {
    showNotification('No performance record selected', 'error');
    return;
  }
  
  setLoading(true);
  try {
    const preparedCompetencies = competencies.map(comp => ({
      id: comp.id,
      behavioral_competency: comp.behavioral_competency,
      required_level: comp.required_level,
      end_year_rating: comp.end_year_rating,
      notes: comp.notes || ''
    }));
    
    const response = await performanceApi.performances.saveCompetenciesDraft(
      selectedPerformanceId, 
      preparedCompetencies
    );
    
    console.log('💾 Save response:', response);
    
    // ✅ Show detailed sync status
    if (response.synced_to_behavioral_assessment) {
      showNotification(
        `✓ Competencies saved and synced to behavioral assessment (${response.sync_message})`,
        'success'
      );
    } else {
      if (response.sync_message) {
        showNotification(
          `Competencies saved • ${response.sync_message}`,
          'info'
        );
      } else {
        showNotification('Competencies draft saved successfully', 'success');
      }
    }
    
    await loadPerformanceData(selectedEmployee.id, selectedYear);
    
  } catch (error) {
    console.error('❌ Error saving competencies:', error);
    showNotification(
      error.response?.data?.error || 'Error saving competencies', 
      'error'
    );
  } finally {
    setLoading(false);
  }
};

  // src/app/performance-management/page.jsx

const handleSubmitCompetencies = async (competencies) => {
  if (!selectedPerformanceId) {
    showNotification('No performance record selected', 'error');
    return;
  }
  
  setLoading(true);
  try {
    // ✅ Prepare competencies data to send
    const preparedCompetencies = competencies.map(comp => ({
      id: comp.id,
      behavioral_competency: comp.behavioral_competency,
      required_level: comp.required_level,
      end_year_rating: comp.end_year_rating,
      notes: comp.notes || ''
    }));
    
    // ✅ Submit with competencies data
    const response = await performanceApi.performances.submitCompetencies(
      selectedPerformanceId,
      preparedCompetencies
    );
    
    console.log('✅ Submit response:', response);
    
    // ✅ Show sync status notification
    if (response.synced_to_behavioral_assessment) {
      const syncResult = response.sync_result;
      const wasCompleted = syncResult?.was_completed;
      
      let message = 'Competencies submitted successfully';
      
      if (wasCompleted) {
        message += ` and synced to COMPLETED behavioral assessment`;
      } else {
        message += ` and synced to behavioral assessment`;
      }
      
      showNotification(message, 'success');
      
      // Show sync details
      if (syncResult?.synced_count > 0 || syncResult?.updated_count > 0) {
        setTimeout(() => {
          showNotification(
            `${syncResult.synced_count} created, ${syncResult.updated_count} updated in assessment`,
            'info'
          );
        }, 1500);
      }
    } else {
      const reason = response.sync_result?.message || 'No behavioral assessment found';
      showNotification(
        `Competencies submitted • ${reason}`,
        'warning'
      );
    }
    
    await loadPerformanceData(selectedEmployee.id, selectedYear);
  } catch (error) {
    console.error('❌ Error submitting competencies:', error);
    showNotification(
      error.response?.data?.error || 'Error submitting competencies', 
      'error'
    );
  } finally {
    setLoading(false);
  }
};

  // ==================== MID-YEAR HANDLERS ====================
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
      <div className="min-h-screen p-6 mx-auto">
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
            settings={settings}
            selectedYear={selectedYear}
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
              activeYear={activeYear}
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