'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Clock, UserCheck, Calendar, AlertCircle, TrendingUp, CheckCircle } from 'lucide-react';
import { employeeService } from '@/services/newsService';
import resignationExitService from '@/services/resignationExitService';

export default function ProbationTrackingPage() {
  const [loading, setLoading] = useState(true);
  const [probationEmployees, setProbationEmployees] = useState([]);
  const [userAccess, setUserAccess] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Get user access info
      const accessInfo = await resignationExitService.getCurrentUser();
      setUserAccess(accessInfo);
      
      // Load employees in probation
      const response = await employeeService.getEmployees({ 
        page_size: 1000,
        status__status_type: 'PROBATION'
      });
      
      const employees = response.results || [];
      
      // Calculate probation end dates for each employee
      const enrichedEmployees = employees.map(emp => {
        const probationInfo = calculateProbationInfo(emp);
        return { ...emp, ...probationInfo };
      });
      
      // Sort by days remaining (urgent first)
      enrichedEmployees.sort((a, b) => a.daysRemaining - b.daysRemaining);
      
      setProbationEmployees(enrichedEmployees);
      
    } catch (error) {
      console.error('Error loading probation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProbationInfo = (employee) => {
    if (!employee.start_date) {
      return {
        probationEndDate: null,
        daysRemaining: null,
        daysCompleted: null,
        totalProbationDays: null,
        progressPercent: 0,
        urgencyLevel: 'unknown'
      };
    }

    // Get probation days based on contract type (default 90 days)
    const probationDaysMap = {
      'PERMANENT': 90,
      '1_YEAR': 90,
      '6_MONTHS': 60,
      '3_MONTHS': 30,
      '2_YEARS': 90,
    };
    
    const totalProbationDays = probationDaysMap[employee.contract_duration] || 90;
    
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
      urgencyLevel
    };
  };

  const getUrgencyColor = (urgencyLevel) => {
    const colors = {
      'critical': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-300',
      'warning': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-300',
      'attention': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-300',
      'normal': 'bg-almet-mystic text-almet-sapphire dark:bg-almet-cloud-burst/30 dark:text-almet-steel-blue border-almet-sapphire/30',
      'unknown': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400 border-gray-300'
    };
    return colors[urgencyLevel] || colors.normal;
  };

  const getProgressBarColor = (urgencyLevel) => {
    const colors = {
      'critical': 'bg-red-500',
      'warning': 'bg-yellow-500',
      'attention': 'bg-orange-500',
      'normal': 'bg-almet-sapphire',
      'unknown': 'bg-gray-400'
    };
    return colors[urgencyLevel] || colors.normal;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-almet-sapphire mx-auto mb-4"></div>
            <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai">Loading probation data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Statistics
  const critical = probationEmployees.filter(e => e.urgencyLevel === 'critical').length;
  const warning = probationEmployees.filter(e => e.urgencyLevel === 'warning').length;
  const total = probationEmployees.length;

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white bg-opacity-20 rounded-lg">
              <UserCheck size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Probation Period Tracking</h1>
              <p className="text-blue-100 text-xs">Monitor employees in probation period</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-almet-sapphire to-almet-astral rounded-lg p-4 text-white shadow-md">
            <div className="flex items-center justify-between mb-2">
              <UserCheck size={24} />
              <span className="text-2xl font-bold">{total}</span>
            </div>
            <h3 className="text-sm font-medium opacity-90">Total in Probation</h3>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-4 text-white shadow-md">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle size={24} />
              <span className="text-2xl font-bold">{critical}</span>
            </div>
            <h3 className="text-sm font-medium opacity-90">Ending in 7 Days</h3>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-4 text-white shadow-md">
            <div className="flex items-center justify-between mb-2">
              <Clock size={24} />
              <span className="text-2xl font-bold">{warning}</span>
            </div>
            <h3 className="text-sm font-medium opacity-90">Ending in 14 Days</h3>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 text-white shadow-md">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp size={24} />
              <span className="text-2xl font-bold">{Math.round((critical + warning) / total * 100 || 0)}%</span>
            </div>
            <h3 className="text-sm font-medium opacity-90">Require Action</h3>
          </div>
        </div>

        {/* Employee List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-sm font-semibold text-almet-cloud-burst dark:text-gray-200">
              Employees in Probation Period
            </h2>
          </div>

          <div className="p-4 space-y-3">
            {probationEmployees.length === 0 ? (
              <div className="text-center py-8 text-almet-waterloo dark:text-almet-bali-hai text-sm">
                No employees currently in probation period
              </div>
            ) : (
              probationEmployees.map(employee => (
                <div 
                  key={employee.id} 
                  className={`border-2 rounded-lg p-4 transition-all hover:shadow-md ${getUrgencyColor(employee.urgencyLevel)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-white dark:bg-gray-800 rounded-lg">
                        <UserCheck size={20} className="text-almet-sapphire" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-almet-cloud-burst dark:text-gray-200">
                          {employee.full_name}
                        </h3>
                        <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                          {employee.employee_id} • {employee.job_title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">
                          {employee.department?.name} • {employee.business_function?.name}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                        employee.urgencyLevel === 'critical' ? 'bg-red-500 text-white' :
                        employee.urgencyLevel === 'warning' ? 'bg-yellow-500 text-white' :
                        employee.urgencyLevel === 'attention' ? 'bg-orange-500 text-white' :
                        'bg-almet-sapphire text-white'
                      }`}>
                        {employee.daysRemaining} days left
                      </div>
                    </div>
                  </div>

                  {/* Progress Information */}
                  <div className="grid grid-cols-4 gap-3 mb-3 p-2 bg-white dark:bg-gray-800 rounded">
                    <div>
                      <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mb-0.5">Start Date</p>
                      <p className="text-xs font-medium text-almet-cloud-burst dark:text-gray-200">
                        {new Date(employee.start_date).toLocaleDateString('en-GB')}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mb-0.5">End Date</p>
                      <p className="text-xs font-medium text-almet-cloud-burst dark:text-gray-200">
                        {employee.probationEndDate ? new Date(employee.probationEndDate).toLocaleDateString('en-GB') : '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mb-0.5">Days Completed</p>
                      <p className="text-xs font-medium text-almet-cloud-burst dark:text-gray-200">
                        {employee.daysCompleted} / {employee.totalProbationDays}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mb-0.5">Manager</p>
                      <p className="text-xs font-medium text-almet-cloud-burst dark:text-gray-200">
                        {employee.line_manager?.full_name || '-'}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-almet-cloud-burst dark:text-gray-300">
                        Probation Progress
                      </span>
                      <span className="text-xs font-bold text-almet-cloud-burst dark:text-gray-200">
                        {employee.progressPercent}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${getProgressBarColor(employee.urgencyLevel)}`}
                        style={{ width: `${employee.progressPercent}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Action Indicator */}
                  {employee.urgencyLevel === 'critical' && (
                    <div className="flex items-center gap-2 mt-3 p-2 bg-red-50 dark:bg-red-900/20 rounded border border-red-200 dark:border-red-700">
                      <AlertCircle size={14} className="text-red-600 dark:text-red-400" />
                      <p className="text-xs text-red-700 dark:text-red-300 font-medium">
                        🔥 Urgent: Probation review must be completed soon!
                      </p>
                    </div>
                  )}

                  {employee.urgencyLevel === 'warning' && (
                    <div className="flex items-center gap-2 mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-700">
                      <Clock size={14} className="text-yellow-600 dark:text-yellow-400" />
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 font-medium">
                        ⚠️ Attention: Probation ending soon - prepare review
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}