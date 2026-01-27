'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Clock, UserCheck, Calendar, AlertTriangle, TrendingUp, ArrowLeft } from 'lucide-react';
import { employeeService } from '@/services/newsService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { apiService } from '@/services/api';

export default function ProbationTrackingPage() {
  const [loading, setLoading] = useState(true);
  const [probationEmployees, setProbationEmployees] = useState([]);
  const [filter, setFilter] = useState('all');
  const [probationStatusId, setProbationStatusId] = useState(null);
  const [contractConfigs, setContractConfigs] = useState({});

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // 1️⃣ Get contract configurations first
      const contractResponse = await apiService.getContractConfigs();
      const contracts = contractResponse.data.results || contractResponse.data || [];
      
      console.log('📋 Contract Configs:', contracts);
      
      const configMap = {};
      contracts.forEach(config => {
        configMap[config.contract_type] = {
          probation_days: config.probation_days || 0,
          total_days_until_active: config.total_days_until_active || 0,
          display_name: config.display_name || config.contract_type
        };
      });
      
      setContractConfigs(configMap);

      
      // 2️⃣ Get probation status ID
      const statusesResponse = await apiService.getEmployeeStatuses();
      const statuses = statusesResponse.data.results || statusesResponse.data || [];
      

      
      const probationStatus = statuses.find(s => 
        s.status_type === 'PROBATION' || 
        s.name?.toUpperCase().includes('PROBATION')
      );
      
      if (!probationStatus) {
        console.error('❌ Probation status not found in:', statuses.map(s => s.name));
        // Try to get all employees and filter manually
        const response = await employeeService.getEmployees({ 
          page_size: 1000
        });
        const employees = response.results || [];
        
        const enrichedEmployees = employees
          .filter(emp => emp.status_name?.toUpperCase().includes('PROBATION'))
          .map(emp => ({
            ...emp,
            ...calculateProbationInfo(emp, configMap)
          }));
        
        enrichedEmployees.sort((a, b) => a.daysRemaining - b.daysRemaining);
        setProbationEmployees(enrichedEmployees);
        return;
      }

      setProbationStatusId(probationStatus.id);
      
      // 3️⃣ Get employees with probation status
      const response = await employeeService.getEmployees({ 
        page_size: 1000,
        status: probationStatus.id
      });
      
      const employees = response.results || [];
      console.log('👥 Probation Employees:', employees);
      
      // 4️⃣ Calculate probation info for each employee
      const enrichedEmployees = employees.map(emp => ({
        ...emp,
        ...calculateProbationInfo(emp, configMap)
      }));
      
      // 5️⃣ Sort by days remaining (urgent first)
      enrichedEmployees.sort((a, b) => a.daysRemaining - b.daysRemaining);
      setProbationEmployees(enrichedEmployees);
      
    } catch (error) {
      console.error('❌ Error loading probation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProbationInfo = (employee, configMap) => {
    if (!employee.start_date || !employee.contract_duration) {
      return {
        probationEndDate: null,
        daysRemaining: null,
        daysCompleted: null,
        totalProbationDays: null,
        progressPercent: 0,
        urgencyLevel: 'unknown'
      };
    }

    // ✅ Get probation days from contract config
    const contractConfig = configMap[employee.contract_duration];
    const totalProbationDays = contractConfig?.probation_days || 90; // Default 90 if not found
    
    const startDate = new Date(employee.start_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const probationEndDate = new Date(startDate);
    probationEndDate.setDate(probationEndDate.getDate() + totalProbationDays);
    
    const daysCompleted = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.ceil((probationEndDate - today) / (1000 * 60 * 60 * 24));
    const progressPercent = Math.min(100, Math.round((daysCompleted / totalProbationDays) * 100));
    
    let urgencyLevel = 'normal';
    if (daysRemaining <= 7) urgencyLevel = 'critical';
    else if (daysRemaining <= 14) urgencyLevel = 'warning';
    else if (daysRemaining <= 30) urgencyLevel = 'attention';
    
    return {
      probationEndDate: probationEndDate.toISOString().split('T')[0],
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      daysCompleted,
      totalProbationDays,
      progressPercent,
      urgencyLevel,
      contractType: employee.contract_duration
    };
  };

  const getUrgencyColor = (urgencyLevel) => {
    const colors = {
      'critical': 'bg-rose-50 border-rose-200 dark:bg-rose-900/20 dark:border-rose-800',
      'warning': 'bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800',
      'attention': 'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800',
      'normal': 'bg-almet-mystic border-almet-sapphire/30 dark:bg-almet-cloud-burst/20 dark:border-almet-sapphire/30',
      'unknown': 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600'
    };
    return colors[urgencyLevel] || colors.normal;
  };

  const getProgressBarColor = (urgencyLevel) => {
    const colors = {
      'critical': 'bg-rose-500',
      'warning': 'bg-amber-500',
      'attention': 'bg-orange-500',
      'normal': 'bg-almet-sapphire',
      'unknown': 'bg-gray-400'
    };
    return colors[urgencyLevel] || colors.normal;
  };

  const getContractDisplayName = (contractType) => {
    // ✅ Use display_name from contract config if available
    if (contractConfigs[contractType]?.display_name) {
      return contractConfigs[contractType].display_name;
    }
    
    // Fallback to formatted names
    const names = {
      'PERMANENT': 'Permanent Contract',
      '1_YEAR': '1 Year Contract',
      '6_MONTHS': '6 Months Contract',
      '3_MONTHS': '3 Months Contract'
    };
    return names[contractType] || contractType;
  };

  if (loading) return <LoadingSpinner message="Loading Probation Tracking..." />;

  const critical = probationEmployees.filter(e => e.urgencyLevel === 'critical').length;
  const warning = probationEmployees.filter(e => e.urgencyLevel === 'warning').length;
  const total = probationEmployees.length;

  const filteredEmployees = probationEmployees.filter(e => {
    if (filter === 'critical') return e.urgencyLevel === 'critical';
    if (filter === 'warning') return e.urgencyLevel === 'warning';
    return true;
  });

  return (
    <DashboardLayout>
      <div className="space-y-3">
        {/* Header */}
        <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral rounded-lg p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.history.back()}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h1 className="text-base font-bold">Probation Period Tracking</h1>
                <p className="text-blue-100 text-[10px]">Monitor employees in probation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <div className="bg-gradient-to-br from-almet-sapphire to-almet-astral rounded-lg p-3 text-white shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <UserCheck size={16} />
              <span className="text-xl font-bold">{total}</span>
            </div>
            <p className="text-[10px] font-medium opacity-90">Total in Probation</p>
          </div>

          <div className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-lg p-3 text-white shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <AlertTriangle size={16} />
              <span className="text-xl font-bold">{critical}</span>
            </div>
            <p className="text-[10px] font-medium opacity-90">Ending in 7 Days</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg p-3 text-white shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <Clock size={16} />
              <span className="text-xl font-bold">{warning}</span>
            </div>
            <p className="text-[10px] font-medium opacity-90">Ending in 14 Days</p>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-3 text-white shadow-sm">
            <div className="flex items-center justify-between mb-1">
              <TrendingUp size={16} />
              <span className="text-xl font-bold">{Math.round((critical + warning) / total * 100 || 0)}%</span>
            </div>
            <p className="text-[10px] font-medium opacity-90">Require Action</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                filter === 'all' ? 'bg-almet-sapphire text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              All ({total})
            </button>
            <button
              onClick={() => setFilter('critical')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                filter === 'critical' ? 'bg-rose-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Critical ({critical})
            </button>
            <button
              onClick={() => setFilter('warning')}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                filter === 'warning' ? 'bg-amber-600 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Warning ({warning})
            </button>
          </div>
        </div>

        {/* Employee List */}
        <div className="space-y-2">
          {filteredEmployees.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-xs">
              {total === 0 ? 'No employees in probation period' : 'No employees found for this filter'}
            </div>
          ) : (
            filteredEmployees.map(employee => (
              <div 
                key={employee.id} 
                className={`border-2 rounded-lg p-3 transition-all hover:shadow-sm ${getUrgencyColor(employee.urgencyLevel)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-2">
                    <div className="p-1.5 bg-white dark:bg-gray-800 rounded">
                      <UserCheck size={14} className="text-almet-sapphire" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-gray-900 dark:text-gray-100">
                        {employee.name}
                      </h3>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">
                        {employee.employee_id} • {employee.job_title}
                      </p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">
                        {employee.department_name} • {employee.business_function_name}
                      </p>
                      <p className="text-[10px] text-gray-600 dark:text-gray-400 mt-0.5">
                        Contract: {getContractDisplayName(employee.contract_duration)} 
                        ({employee.totalProbationDays} days probation)
                      </p>
                    </div>
                  </div>

                  <div className={`px-2 py-0.5 rounded text-[10px] font-bold text-white ${
                    employee.urgencyLevel === 'critical' ? 'bg-rose-500' :
                    employee.urgencyLevel === 'warning' ? 'bg-amber-500' :
                    employee.urgencyLevel === 'attention' ? 'bg-orange-500' :
                    'bg-almet-sapphire'
                  }`}>
                    {employee.daysRemaining}d left
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-2 p-2 bg-white dark:bg-gray-800 rounded">
                  <div>
                    <p className="text-[9px] text-gray-500 mb-0.5">Start Date</p>
                    <p className="text-[10px] font-medium text-gray-900 dark:text-gray-100">
                      {new Date(employee.start_date).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-500 mb-0.5">End Date</p>
                    <p className="text-[10px] font-medium text-gray-900 dark:text-gray-100">
                      {employee.probationEndDate ? new Date(employee.probationEndDate).toLocaleDateString('en-GB') : '-'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-500 mb-0.5">Progress</p>
                    <p className="text-[10px] font-medium text-gray-900 dark:text-gray-100">
                      {employee.daysCompleted} / {employee.totalProbationDays}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] text-gray-500 mb-0.5">Manager</p>
                    <p className="text-[10px] font-medium text-gray-900 dark:text-gray-100 truncate">
                      {employee.line_manager_name || '-'}
                    </p>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-medium text-gray-700 dark:text-gray-300">
                      Probation Progress
                    </span>
                    <span className="text-[10px] font-bold text-gray-900 dark:text-gray-100">
                      {employee.progressPercent}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                    <div 
                      className={`h-1.5 rounded-full transition-all ${getProgressBarColor(employee.urgencyLevel)}`}
                      style={{ width: `${employee.progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                {employee.urgencyLevel === 'critical' && (
                  <div className="flex items-center gap-1.5 p-2 bg-rose-50 dark:bg-rose-900/20 rounded border border-rose-200 dark:border-rose-700">
                    <AlertTriangle size={12} className="text-rose-600" />
                    <p className="text-[10px] text-rose-700 dark:text-rose-300 font-medium">
                      Urgent: Probation review must be completed within {employee.daysRemaining} days!
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}