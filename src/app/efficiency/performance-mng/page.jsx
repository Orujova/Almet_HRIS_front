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
      
      // ✅ FIX: Enrich competencies with proper end_year_rating_value
      if (detailData.competency_ratings && detailData.competency_ratings.length > 0) {
        console.log('🔍 RAW competencies from backend:', detailData.competency_ratings);
        
        const enrichedRatings = detailData.competency_ratings.map((rating) => {
          const competencyInfo = behavioralCompetencies.find(
            comp => comp.id === rating.behavioral_competency
          );
          
          // ✅ CRITICAL: Get the rating value from the scale
          let ratingValue = 0;
          
          // Check if backend provided the value
          if (rating.end_year_rating_value !== null && rating.end_year_rating_value !== undefined) {
            ratingValue = parseFloat(rating.end_year_rating_value);
            console.log('✅ Backend provided value:', {
              id: rating.id,
              end_year_rating: rating.end_year_rating,
              end_year_rating_value: ratingValue
            });
          } 
          // If not, calculate from scale
          else if (rating.end_year_rating) {
            const selectedScale = settings.evaluationScale?.find(
              s => s.id === rating.end_year_rating
            );
            if (selectedScale) {
              ratingValue = selectedScale.value;
              console.log('🔧 Calculated missing rating value:', {
                competency_id: rating.behavioral_competency,
                rating_id: rating.end_year_rating,
                scale_name: selectedScale.name,
                calculated_value: ratingValue
              });
            } else {
              console.warn('⚠️ Could not find scale for rating:', rating.end_year_rating);
            }
          }
          
          const enriched = {
            ...rating,
            competency_name: competencyInfo?.name || `Unknown Competency (ID: ${rating.behavioral_competency})`,
            competency_group_id: competencyInfo?.group_id || null,
            competency_group_name: competencyInfo?.group_name || 'Ungrouped',
            description: competencyInfo?.description || '',
            end_year_rating_value: ratingValue
          };
          
          console.log('📦 Enriched competency:', {
            id: enriched.id,
            name: enriched.competency_name,
            end_year_rating: enriched.end_year_rating,
            end_year_rating_value: enriched.end_year_rating_value,
            required_level: enriched.required_level
          });
          
          return enriched;
        });
        
        detailData.competency_ratings = enrichedRatings;
        
        console.log('✅ ALL Competencies after enrichment:', 
          enrichedRatings.map(r => ({
            id: r.id,
            name: r.competency_name,
            rating_id: r.end_year_rating,
            rating_value: r.end_year_rating_value,
            required: r.required_level
          }))
        );
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
      
      // ✅ Recalculate scores after loading to ensure consistency
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

  // ✅ NEW: Grade calculation function (shared)
  const getLetterGradeFromScale = (percentage) => {
    if (!settings.evaluationScale || settings.evaluationScale.length === 0) {
      return 'N/A';
    }
    
    const matchingScale = settings.evaluationScale.find(scale => 
      percentage >= scale.range_min && percentage <= scale.range_max
    );
    
    return matchingScale ? matchingScale.name : 'N/A';
  };

  // ✅ NEW: Recalculate all scores and aggregates
  const recalculateScores = (data) => {
    if (!data) return data;
    
    const newData = { ...data };
    
    // Calculate objectives totals
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
    newData.objectives_letter_grade = getLetterGradeFromScale(objectivesPercentage); // Optional if needed

    // Calculate competencies totals
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

    // Calculate overall
    const objectivesWeight = parseFloat(newData.objectives_weight) || 70;
    const competenciesWeight = parseFloat(newData.competencies_weight) || 30;
    
    const overallPercentage = 
      (objectivesPercentage * objectivesWeight / 100) + 
      (competenciesPercentage * competenciesWeight / 100);
    
    newData.overall_weighted_percentage = overallPercentage;
    
    // Set final rating if not set (or always recalculate?)
    if (!newData.final_rating) {
      newData.final_rating = getLetterGradeFromScale(overallPercentage);
    }

    console.log('🔄 Recalculated scores:', {
      objectives: {
        total: totalObjectivesScore,
        percentage: objectivesPercentage,
        grade: newData.objectives_letter_grade
      },
      competencies: {
        totalActual,
        totalRequired,
        percentage: competenciesPercentage,
        grade: newData.competencies_letter_grade
      },
      overall: {
        percentage: overallPercentage,
        final_rating: newData.final_rating
      }
    });
    
    return newData;
  };

  // ==================== OBJECTIVE HANDLERS ====================

  const saveObjectivesTimeoutRef = useRef(null);

const debouncedSaveObjectives = useCallback((performanceId, objectives) => {
  // Clear existing timeout
  if (saveObjectivesTimeoutRef.current) {
    clearTimeout(saveObjectivesTimeoutRef.current);
  }
  
  // Set new timeout to save after 1 second of no changes
  saveObjectivesTimeoutRef.current = setTimeout(async () => {
    try {
      console.log('🔄 Auto-saving objectives...');
      await performanceApi.performances.saveObjectivesDraft(performanceId, objectives);
      console.log('✅ Objectives auto-saved');
      showNotification('Changes saved', 'info');
    } catch (error) {
      console.error('❌ Auto-save error:', error);
    }
  }, 1000); // Wait 1 second after last change
}, []);
  const handleUpdateObjective = (index, field, value) => {
  const key = `${selectedEmployee.id}_${selectedYear}`;
  const data = performanceData[key];
  const newObjectives = [...(data.objectives || [])];
  newObjectives[index] = {
    ...newObjectives[index],
    [field]: value
  };
  
  // If updating end_year_rating, recalculate calculated_score
  if (field === 'end_year_rating') {
    const selectedScaleId = value ? parseInt(value) : null;
    if (selectedScaleId) {
      const selectedScale = settings.evaluationScale?.find(s => s.id === selectedScaleId);
      if (selectedScale) {
        const weight = parseFloat(newObjectives[index].weight) || 0;
        const targetScore = settings.evaluationTargets?.objective_score_target || 21;
        const calculatedScore = (selectedScale.value * weight * targetScore) / (5 * 100);
        newObjectives[index].calculated_score = calculatedScore;
        
        console.log('✅ Objective rating updated:', {
          index,
          title: newObjectives[index].title,
          rating_id: selectedScaleId,
          rating_name: selectedScale.name,
          rating_value: selectedScale.value,
          weight: weight,
          calculated_score: calculatedScore
        });
      }
    } else {
      newObjectives[index].calculated_score = 0;
    }
  }
  
  const updatedData = {
    ...data,
    objectives: newObjectives
  };
  
  // Recalculate aggregates
  const recalculatedData = recalculateScores(updatedData);
  
  setPerformanceData(prev => ({
    ...prev,
    [key]: recalculatedData
  }));
  
  // ✅ FIX #6 & #7: Auto-save objectives after update
  if (selectedPerformanceId) {
    debouncedSaveObjectives(selectedPerformanceId, newObjectives);
  }
};

  const handleAddObjective = () => {
    const key = `${selectedEmployee.id}_${selectedYear}`;
    
    // Get the first status as default (usually "Not Started" or similar)
    const defaultStatus = settings.statusTypes && settings.statusTypes.length > 0 
      ? settings.statusTypes[0].id 
      : null;
    
    const newObjective = {
      title: '',
      description: '',
      weight: 0,
      linked_department_objective: null,
      progress: 0,
      status: defaultStatus,  // ✅ Set default status
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
    
    console.log('✅ New objective added with default status:', defaultStatus);
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
    // ✅ Log what we're sending
    console.log('📋 Saving objectives:', objectives.map(obj => ({
      id: obj.id,
      title: obj.title,
      status: obj.status,
      weight: obj.weight,
      end_year_rating: obj.end_year_rating,  // ✅ Make sure this is included
      calculated_score: obj.calculated_score
    })));
    
    await performanceApi.performances.saveObjectivesDraft(selectedPerformanceId, objectives);
    showNotification('Objectives draft saved successfully');
    await loadPerformanceData(selectedEmployee.id, selectedYear);
  } catch (error) {
    console.error('❌ Error saving objectives:', error);
    console.error('❌ Error response:', error.response?.data);
    showNotification(error.response?.data?.error || 'Error saving objectives', 'error');
  } finally {
    setLoading(false);
  }
};

  const handleSubmitObjectives = async (objectives) => {
  if (!selectedPerformanceId) return;
  
  setLoading(true);
  try {
    // ✅ FIX #1: Send objectives data with submit request
    await performanceApi.performances.submitObjectives(
      selectedPerformanceId,
      objectives  // Pass objectives array
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



const handleUpdateCompetency = (index, field, value) => {
  const key = `${selectedEmployee.id}_${selectedYear}`;
  const data = performanceData[key];
  const newCompetencies = [...(data.competency_ratings || [])];
  
  // Create updated competency object
  const updatedCompetency = {
    ...newCompetencies[index],
    [field]: value
  };
  
  // ✅ If updating end_year_rating, ALSO set end_year_rating_value immediately
  if (field === 'end_year_rating') {
    const selectedScaleId = value ? parseInt(value) : null;
    if (selectedScaleId) {
      const selectedScale = settings.evaluationScale?.find(s => s.id === selectedScaleId);
      if (selectedScale) {
        updatedCompetency.end_year_rating_value = selectedScale.value;
        
        console.log('✅ Competency updated with both values:', {
          index,
          name: updatedCompetency.competency_name,
          rating_id: selectedScaleId,
          rating_value: selectedScale.value
        });
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
  
  // Recalculate aggregates
  const recalculatedData = recalculateScores(updatedData);
  
  setPerformanceData(prev => ({
    ...prev,
    [key]: recalculatedData
  }));
};

 // Replace the handleSaveCompetenciesDraft function in page.jsx:

const handleSaveCompetenciesDraft = async (competencies) => {
  if (!selectedPerformanceId) {
    showNotification('No performance record selected', 'error');
    return;
  }
  
  // ✅ Validate competencies array
  if (!Array.isArray(competencies)) {
    console.error('❌ Invalid competencies data:', competencies);
    showNotification('Invalid competencies data', 'error');
    return;
  }
  
  setLoading(true);
  try {
    // ✅ Log current state BEFORE saving
    console.log('📋 BEFORE SAVE - Current competencies state:', 
      competencies.map(c => ({
        id: c.id,
        name: c.competency_name,
        end_year_rating: c.end_year_rating,
        end_year_rating_value: c.end_year_rating_value,
        required_level: c.required_level
      }))
    );
    
    // ✅ Prepare data - Include end_year_rating_value if backend accepts it
    const preparedCompetencies = competencies.map(comp => {
      const payload = {
        id: comp.id,
        behavioral_competency: comp.behavioral_competency,
        required_level: comp.required_level,
        end_year_rating: comp.end_year_rating,
        notes: comp.notes || ''
      };
      
      // ✅ CRITICAL: Include rating value if it exists
      // The backend should calculate this, but we send it to ensure consistency
      if (comp.end_year_rating_value !== null && comp.end_year_rating_value !== undefined) {
        payload.end_year_rating_value = comp.end_year_rating_value;
      }
      
      return payload;
    });
    
    console.log('📤 SENDING to backend:', preparedCompetencies);
    
    const response = await performanceApi.performances.saveCompetenciesDraft(
      selectedPerformanceId, 
      preparedCompetencies
    );
    
    console.log('📥 RESPONSE from backend:', response);
    
    showNotification('Competencies draft saved successfully');
    
    // ✅ Reload to get fresh data from backend
    console.log('🔄 Reloading performance data...');
    const reloadedData = await loadPerformanceData(selectedEmployee.id, selectedYear);
    
    console.log('📋 AFTER RELOAD - Competencies state:', 
      reloadedData?.competency_ratings?.map(c => ({
        id: c.id,
        name: c.competency_name,
        end_year_rating: c.end_year_rating,
        end_year_rating_value: c.end_year_rating_value,
        required_level: c.required_level
      }))
    );
    
  } catch (error) {
    console.error('❌ Error saving competencies:', error);
    console.error('❌ Error response:', error.response?.data);
    showNotification(
      error.response?.data?.error || 'Error saving competencies', 
      'error'
    );
  } finally {
    setLoading(false);
  }
};

  const handleSubmitCompetencies = async () => {
    if (!selectedPerformanceId) {
      showNotification('No performance record selected', 'error');
      return;
    }
    
    setLoading(true);
    try {
      console.log('📤 Submitting competencies for performance:', selectedPerformanceId);
      
      await performanceApi.performances.submitCompetencies(selectedPerformanceId);
      
      showNotification('Competencies submitted successfully');
      await loadPerformanceData(selectedEmployee.id, selectedYear);
    } catch (error) {
      console.error('❌ Error submitting competencies:', error);
      console.error('❌ Error response data:', error.response?.data);
      console.error('❌ Error response status:', error.response?.status);
      
      // Get detailed error message
      let errorMessage = 'Error submitting competencies';
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.data.detail) {
          errorMessage = error.response.data.detail;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else {
          errorMessage = JSON.stringify(error.response.data);
        }
      }
      
      showNotification(errorMessage, 'error');
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
      <div className="min-h-screen p-6  mx-auto">
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