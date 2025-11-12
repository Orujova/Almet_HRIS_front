import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award, Users, Target, BarChart3, Loader } from 'lucide-react';

export default function FixedAnalyticsDashboard({ 
  employees, 
  settings,
  darkMode,
  selectedYear 
}) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  useEffect(() => {
    if (employees && employees.length > 0 && settings?.evaluationScale) {
      calculateAnalytics();
    }
  }, [employees, settings]);

  const calculateAnalytics = () => {
    setLoading(true);
    try {
      console.log('📊 Starting analytics calculation for', employees.length, 'employees');
      
      const gradeDistribution = calculateGradeDistribution();
      const departmentStats = calculateDepartmentStats();
      const positionStats = calculatePositionStats();
      
      setAnalyticsData({
        gradeDistribution,
        departmentStats,
        positionStats,
        totalEmployees: employees.length
      });
      
      console.log('✅ Analytics calculated successfully');
    } catch (error) {
      console.error('❌ Analytics error:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateGradeDistribution = () => {
    if (!settings?.evaluationScale || !employees || employees.length === 0) {
      return [];
    }

    // ✅ Sort scales by value descending
    const sortedScales = [...settings.evaluationScale].sort((a, b) => b.value - a.value);
    
    // ✅ Calculate normal distribution
    const totalRange = 100;
    const normalDist = sortedScales.map(scale => {
      const rangeSize = (parseFloat(scale.range_max) - parseFloat(scale.range_min)) + 1;
      const normalPercentage = (rangeSize / totalRange) * 100;
      return {
        grade: scale.name,
        norm: Math.round(normalPercentage * 10) / 10,
        value: scale.value
      };
    });

    // ✅ Count actual distribution - FIXED LOGIC
    const gradeCounts = {};
    sortedScales.forEach(scale => {
      gradeCounts[scale.name] = 0;
    });

    let employeesWithRatings = 0;
    
    employees.forEach(emp => {
      const objPct = parseFloat(emp.objectives_percentage);
      const compPct = parseFloat(emp.competencies_percentage);
      
      // ✅ Only count if BOTH percentages exist and > 0 (COMPLETED status)
      if (!isNaN(objPct) && objPct > 0 && !isNaN(compPct) && compPct > 0) {
        employeesWithRatings++;
        
        // ✅ Use final_rating if available, otherwise calculate from overall_weighted_percentage
        let grade = emp.final_rating;
        
        if (!grade) {
          const overallPct = parseFloat(emp.overall_weighted_percentage) || 
                           ((objPct * 70 + compPct * 30) / 100);
          
          const matchingScale = sortedScales.find(s => 
            overallPct >= parseFloat(s.range_min) && 
            overallPct <= parseFloat(s.range_max)
          );
          
          grade = matchingScale?.name || 'N/A';
        }
        
        if (gradeCounts[grade] !== undefined) {
          gradeCounts[grade]++;
        }
      }
    });

    console.log('📊 Grade counts:', gradeCounts);
    console.log('📊 Employees with ratings:', employeesWithRatings);

    // ✅ Build final distribution
    const result = sortedScales.map(scale => {
      const actualPercentage = employeesWithRatings > 0 
        ? Math.round((gradeCounts[scale.name] / employeesWithRatings) * 1000) / 10 
        : 0;
      
      return {
        grade: scale.name,
        norm: normalDist.find(n => n.grade === scale.name)?.norm || 0,
        actual: actualPercentage,
        employeeCount: gradeCounts[scale.name],
        value: scale.value
      };
    });

    return result;
  };

  const calculateDepartmentStats = () => {
    if (!employees || employees.length === 0) return [];

    const deptMap = {};
    
    employees.forEach(emp => {
      const dept = emp.employee_department || emp.department || 'Unknown';
      
      if (!deptMap[dept]) {
        deptMap[dept] = {
          department: dept,
          totalEmployees: 0,
          completedCount: 0,
          totalScore: 0,
          scores: []
        };
      }
      
      deptMap[dept].totalEmployees++;
      
      // ✅ Check if COMPLETED
      const objPct = parseFloat(emp.objectives_percentage);
      const compPct = parseFloat(emp.competencies_percentage);
      
      if (!isNaN(objPct) && objPct > 0 && !isNaN(compPct) && compPct > 0) {
        deptMap[dept].completedCount++;
        
        const overallPct = parseFloat(emp.overall_weighted_percentage) || 
                          ((objPct * 70 + compPct * 30) / 100);
        
        if (!isNaN(overallPct) && overallPct > 0) {
          deptMap[dept].totalScore += overallPct;
          deptMap[dept].scores.push(overallPct);
        }
      }
    });

    const result = Object.values(deptMap).map(dept => ({
      department: dept.department,
      employeeCount: dept.totalEmployees,
      completedCount: dept.completedCount,
      avgScore: dept.scores.length > 0 
        ? parseFloat((dept.totalScore / dept.scores.length).toFixed(1))
        : 0
    })).sort((a, b) => b.avgScore - a.avgScore);

    return result;
  };

  const calculatePositionStats = () => {
    if (!employees || employees.length === 0) return [];

    const posMap = {};
    
    employees.forEach(emp => {
      const pos = emp.employee_position_group || emp.position || 'Unknown';
      
      if (!posMap[pos]) {
        posMap[pos] = {
          position: pos,
          totalEmployees: 0,
          completedCount: 0,
          totalScore: 0,
          scores: []
        };
      }
      
      posMap[pos].totalEmployees++;
      
      const objPct = parseFloat(emp.objectives_percentage);
      const compPct = parseFloat(emp.competencies_percentage);
      
      if (!isNaN(objPct) && objPct > 0 && !isNaN(compPct) && compPct > 0) {
        posMap[pos].completedCount++;
        
        const overallPct = parseFloat(emp.overall_weighted_percentage) || 
                          ((objPct * 70 + compPct * 30) / 100);
        
        if (!isNaN(overallPct) && overallPct > 0) {
          posMap[pos].totalScore += overallPct;
          posMap[pos].scores.push(overallPct);
        }
      }
    });

    const result = Object.values(posMap).map(pos => ({
      position: pos.position,
      employeeCount: pos.totalEmployees,
      completedCount: pos.completedCount,
      avgScore: pos.scores.length > 0 
        ? parseFloat((pos.totalScore / pos.scores.length).toFixed(1))
        : 0
    })).sort((a, b) => b.avgScore - a.avgScore);

    return result;
  };

  const getEmployeeCompetencyData = (employee) => {
    if (!employee?.competency_ratings) return [];

    const groupMap = {};
    
    employee.competency_ratings.forEach(comp => {
      const groupName = comp.competency_group_name || comp.main_group_name || 'Other';
      
      if (!groupMap[groupName]) {
        groupMap[groupName] = {
          group: groupName,
          totalRequired: 0,
          totalActual: 0,
          count: 0
        };
      }
      
      groupMap[groupName].totalRequired += parseFloat(comp.required_level) || 0;
      groupMap[groupName].totalActual += parseFloat(comp.end_year_rating_value) || 0;
      groupMap[groupName].count++;
    });

    return Object.values(groupMap).map(group => ({
      competency: group.group,
      percentage: group.totalRequired > 0 
        ? Math.round((group.totalActual / group.totalRequired) * 100)
        : 0,
      required: group.totalRequired,
      actual: group.totalActual
    }));
  };

  if (loading) {
    return (
      <div className={`${darkMode ? 'bg-almet-cloud-burst' : 'bg-white'} rounded-xl p-8 flex items-center justify-center`}>
        <Loader className="w-8 h-8 animate-spin text-almet-sapphire" />
      </div>
    );
  }

  if (!analyticsData || !analyticsData.gradeDistribution || analyticsData.gradeDistribution.length === 0) {
    return (
      <div className={`${darkMode ? 'bg-almet-cloud-burst' : 'bg-white'} rounded-xl p-8 text-center`}>
        <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-500 font-medium mb-2">No analytics data available</p>
        <p className="text-sm text-gray-400">Complete some performance reviews to see analytics</p>
      </div>
    );
  }

  const COLORS = {
    norm: '#10b981',
    actual: '#ef4444',
    primary: '#0ea5e9',
    secondary: '#8b5cf6'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} rounded-xl border p-5`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-purple-500/10">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Performance Analytics Dashboard
              </h2>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {selectedYear} • {analyticsData.totalEmployees} Employees
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grade Distribution Chart */}
      <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
        <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
          Normal Distribution vs Real Distribution
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={analyticsData.gradeDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
            <XAxis 
              dataKey="grade" 
              stroke={darkMode ? '#9ca3af' : '#6b7280'}
            />
            <YAxis 
              stroke={darkMode ? '#9ca3af' : '#6b7280'}
              label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                borderRadius: '8px'
              }}
              formatter={(value, name) => {
                if (name === 'norm') return [`${value}%`, 'Expected Distribution'];
                if (name === 'actual') return [`${value}%`, 'Actual Distribution'];
                return [value, name];
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="norm" 
              stroke={COLORS.norm} 
              strokeWidth={3}
              name="Expected Distribution"
              dot={{ r: 5 }}
            />
            <Line 
              type="monotone" 
              dataKey="actual" 
              stroke={COLORS.actual} 
              strokeWidth={3}
              name="Actual Distribution"
              dot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
        
        {/* Distribution Table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={`${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <tr>
                <th className="px-4 py-2 text-left font-semibold">Grade</th>
                <th className="px-4 py-2 text-right font-semibold">Expected %</th>
                <th className="px-4 py-2 text-right font-semibold">Actual %</th>
                <th className="px-4 py-2 text-right font-semibold">Employees</th>
                <th className="px-4 py-2 text-right font-semibold">Variance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {analyticsData.gradeDistribution.map((item) => {
                const variance = (item.actual - item.norm).toFixed(1);
                return (
                  <tr key={item.grade} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-4 py-2 font-bold text-almet-sapphire">{item.grade}</td>
                    <td className="px-4 py-2 text-right">{item.norm}%</td>
                    <td className="px-4 py-2 text-right font-semibold">{item.actual}%</td>
                    <td className="px-4 py-2 text-right">{item.employeeCount}</td>
                    <td className={`px-4 py-2 text-right font-semibold ${
                      variance > 0 ? 'text-red-600' : variance < 0 ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {variance > 0 ? '+' : ''}{variance}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Department Performance */}
      {analyticsData.departmentStats && analyticsData.departmentStats.length > 0 && (
        <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
          <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Performance by Department
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={analyticsData.departmentStats} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis type="number" stroke={darkMode ? '#9ca3af' : '#6b7280'} />
              <YAxis 
                dataKey="department" 
                type="category" 
                width={150}
                stroke={darkMode ? '#9ca3af' : '#6b7280'}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                  border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px'
                }}
                formatter={(value, name) => {
                  if (name === 'avgScore') return [`${value}%`, 'Average Score'];
                  if (name === 'completedCount') return [value, 'Completed'];
                  return [value, name];
                }}
              />
              <Legend />
              <Bar dataKey="avgScore" fill={COLORS.primary} name="Average Score (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Position Performance */}
      {analyticsData.positionStats && analyticsData.positionStats.length > 0 && (
        <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
          <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Performance by Position
          </h3>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={analyticsData.positionStats}>
              <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
              <XAxis 
                dataKey="position" 
                stroke={darkMode ? '#9ca3af' : '#6b7280'}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                  border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="avgScore" fill={COLORS.secondary} name="Average Score (%)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Employee Selector */}
      <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
        <div className="mb-4">
          <label className={`block text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Select Employee for Competency Analysis
          </label>
          <select
            value={selectedEmployee?.id || ''}
            onChange={(e) => {
              const emp = employees.find(emp => emp.id === e.target.value);
              setSelectedEmployee(emp);
            }}
            className={`w-full px-4 py-2 rounded-xl border ${
              darkMode 
                ? 'bg-gray-800 border-gray-700 text-white' 
                : 'bg-white border-gray-300 text-gray-900'
            }`}
          >
            <option value="">-- Select Employee --</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>
                {emp.employee_name || emp.name} - {emp.employee_position_group || emp.position}
              </option>
            ))}
          </select>
        </div>

        {selectedEmployee && (
          <>
            <h3 className={`text-lg font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
              Competency Radar: {selectedEmployee.employee_name || selectedEmployee.name}
            </h3>
            <ResponsiveContainer width="100%" height={500}>
              <RadarChart data={getEmployeeCompetencyData(selectedEmployee)}>
                <PolarGrid stroke={darkMode ? '#374151' : '#e5e7eb'} />
                <PolarAngleAxis 
                  dataKey="competency" 
                  stroke={darkMode ? '#9ca3af' : '#6b7280'}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]}
                  stroke={darkMode ? '#9ca3af' : '#6b7280'}
                />
                <Radar 
                  name="Competency Score" 
                  dataKey="percentage" 
                  stroke={COLORS.primary} 
                  fill={COLORS.primary} 
                  fillOpacity={0.6}
                  strokeWidth={2}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                    border: `1px solid ${darkMode ? '#374151' : '#e5e7eb'}`,
                    borderRadius: '8px'
                  }}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </>
        )}
      </div>
    </div>
  );
}