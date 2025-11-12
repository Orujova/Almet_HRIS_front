import { useState, useEffect,useRef  } from 'react';
import { BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Award, Users, Target, BarChart3, Loader, User, AlertCircle } from 'lucide-react';

export default function FixedAnalyticsDashboard({ 
  employees, 
  settings,
  darkMode,
  selectedYear,
  onLoadEmployeePerformance // ✅ NEW: Callback to load full performance data
}) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);
  const [loadingEmployeeData, setLoadingEmployeeData] = useState(false);

  useEffect(() => {
    if (employees && employees.length > 0 && settings?.evaluationScale) {
      calculateAnalytics();
    }
  }, [employees, settings]);

  // ✅ Load full employee performance data when selected
  useEffect(() => {
    if (selectedEmployeeId && onLoadEmployeePerformance) {
      loadEmployeePerformanceData(selectedEmployeeId);
    }
  }, [selectedEmployeeId]);

  const loadEmployeePerformanceData = async (employeeId) => {
    setLoadingEmployeeData(true);
    try {
      console.log('📊 Loading full performance data for employee:', employeeId);
      const performanceData = await onLoadEmployeePerformance(employeeId, selectedYear);
      
      if (performanceData && performanceData.competency_ratings) {
        console.log('✅ Loaded competency ratings:', performanceData.competency_ratings.length);
        setSelectedEmployeeData(performanceData);
      } else {
        console.warn('⚠️ No competency ratings found');
        setSelectedEmployeeData(null);
      }
    } catch (error) {
      console.error('❌ Error loading employee performance:', error);
      setSelectedEmployeeData(null);
    } finally {
      setLoadingEmployeeData(false);
    }
  };

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

    const sortedScales = [...settings.evaluationScale].sort((a, b) => b.value - a.value);
    
    const bellCurveDistribution = {
      5: 5,   // E++ = 5%
      4: 15,  // E+ = 15%
      3: 60,  // E = 60%
      2: 15,  // E- = 15%
      1: 5    // E-- = 5%
    };

    const gradeCounts = {};
    sortedScales.forEach(scale => {
      gradeCounts[scale.name] = 0;
    });

    let employeesWithRatings = 0;
    
    employees.forEach(emp => {
      const objPct = parseFloat(emp.objectives_percentage);
      const compPct = parseFloat(emp.competencies_percentage);
      
      if (!isNaN(objPct) && objPct > 0 && !isNaN(compPct) && compPct > 0) {
        employeesWithRatings++;
        
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

    const result = sortedScales.map((scale) => {
      const actualPercentage = employeesWithRatings > 0 
        ? Math.round((gradeCounts[scale.name] / employeesWithRatings) * 1000) / 10 
        : 0;
      
      const normPercentage = bellCurveDistribution[scale.value] || 0;
      
      return {
        grade: scale.name,
        norm: normPercentage,
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

  // ✅ FIXED: Get competency data from loaded performance data
  const getEmployeeCompetencyData = () => {
    if (!selectedEmployeeData?.competency_ratings) {
      console.warn('⚠️ No competency ratings in selected employee data');
      return [];
    }

    const groupMap = {};
    
    selectedEmployeeData.competency_ratings.forEach(comp => {
      // ✅ Handle both leadership and behavioral
      const groupName = comp.main_group_name || comp.competency_group_name || 'Other';
      
      if (!groupMap[groupName]) {
        groupMap[groupName] = {
          group: groupName,
          totalRequired: 0,
          totalActual: 0,
          count: 0
        };
      }
      
      const required = parseFloat(comp.required_level) || 0;
      const actual = parseFloat(comp.end_year_rating_value) || 0;
      
      groupMap[groupName].totalRequired += required;
      groupMap[groupName].totalActual += actual;
      groupMap[groupName].count++;
    });

    const result = Object.values(groupMap).map(group => ({
      competency: group.group,
      percentage: group.totalRequired > 0 
        ? Math.round((group.totalActual / group.totalRequired) * 100)
        : 0,
      required: group.totalRequired,
      actual: group.totalActual
    }));

    console.log('📊 Competency radar data:', result);
    return result;
  };

  const getEligibleEmployees = () => {
    return employees.filter(emp => {
      const objPct = parseFloat(emp.objectives_percentage);
      const compPct = parseFloat(emp.competencies_percentage);
      return !isNaN(objPct) && objPct > 0 && !isNaN(compPct) && compPct > 0;
    });
  };

  const employeeOptions = getEligibleEmployees().map(emp => ({
    value: emp.id,
    label: `${emp.employee_name || emp.name} - ${emp.employee_position_group || emp.position}`,
    id: emp.id
  }));

  const selectedEmployee = employees.find(e => e.id === selectedEmployeeId);

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

      {/* Employee Competency Selector */}
      <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} rounded-xl border p-6`}>
        <div className="mb-6">
          <label className={`block text-sm font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Select Employee for Competency Analysis
          </label>
          
          <SearchableDropdown
            options={employeeOptions}
            value={selectedEmployeeId}
            onChange={(value) => {
              console.log('Selected employee ID:', value);
              setSelectedEmployeeId(value);
              if (!value) {
                setSelectedEmployeeData(null);
              }
            }}
            placeholder="-- Search and select an employee --"
            searchPlaceholder="Search by name or position..."
            darkMode={darkMode}
            icon={<User size={16} />}
            portal={false}
            allowUncheck={true}
            className="w-full"
          />
          
          {employeeOptions.length === 0 && (
            <p className={`text-xs mt-2 ${darkMode ? 'text-amber-400' : 'text-amber-600'}`}>
              ⚠️ No employees with completed performance found
            </p>
          )}
        </div>

        {/* Loading State */}
        {loadingEmployeeData && (
          <div className="flex items-center justify-center py-12">
            <Loader className="w-8 h-8 animate-spin text-almet-sapphire mr-3" />
            <p className="text-sm text-gray-500">Loading competency data...</p>
          </div>
        )}

        {/* Radar Chart */}
        {!loadingEmployeeData && selectedEmployeeId && selectedEmployee && selectedEmployeeData && (
          <>
            <div className="mb-4">
              <h3 className={`text-lg font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                Competency Radar: {selectedEmployee.employee_name || selectedEmployee.name}
              </h3>
              <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                {selectedEmployee.employee_position_group || selectedEmployee.position} • {selectedEmployee.employee_department || selectedEmployee.department}
              </p>
              
              {/* ✅ Show competency type */}
              {selectedEmployeeData.metadata && (
                <div className="mt-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
                    selectedEmployeeData.metadata.competency_type === 'LEADERSHIP'
                      ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                      : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                  }`}>
                    {selectedEmployeeData.metadata.competency_type === 'LEADERSHIP' ? '👔 Leadership' : '🎯 Behavioral'} Competencies
                  </span>
                </div>
              )}
            </div>
            
            <ResponsiveContainer width="100%" height={500}>
              <RadarChart data={getEmployeeCompetencyData()}>
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

        {/* Empty State */}
        {!loadingEmployeeData && !selectedEmployeeId && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500">Select an employee to view their competency radar chart</p>
          </div>
        )}

        {/* Error State */}
        {!loadingEmployeeData && selectedEmployeeId && !selectedEmployeeData && (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 mx-auto mb-3 text-red-400" />
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">
              Failed to load competency data
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Please try selecting another employee
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ✅ SEARCHABLE DROPDOWN COMPONENT
function SearchableDropdown({ 
  options = [], 
  value, 
  onChange, 
  placeholder, 
  searchPlaceholder = "Search...",
  className = "",
  darkMode = false,
  icon = null,
  allowUncheck = true
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleOptionClick = (optionValue) => {
    if (allowUncheck && value === optionValue) {
      onChange(null);
    } else {
      onChange(optionValue);
    }
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-sm text-left flex items-center justify-between transition-all duration-200 hover:border-almet-sapphire/50`}
      >
        <div className="flex items-center">
          {icon && <span className="mr-2 text-almet-sapphire">{icon}</span>}
          <span className={selectedOption ? textPrimary : textMuted}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <svg className={`w-4 h-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className={`absolute z-50 w-full mt-1 ${bgCard} border ${borderColor} rounded-lg shadow-lg max-h-60 overflow-hidden`}
          ref={dropdownRef}
        >
          <div className={`p-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="relative">
              <svg className={`absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 ${textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-8 pr-2 py-1.5 outline-0 border ${borderColor} rounded focus:ring-1 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary} text-xs`}
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-44 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className={`px-3 py-2 ${textMuted} text-xs text-center`}>
                No options found
              </div>
            ) : (
              filteredOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option.value)}
                  className={`w-full px-3 py-2 text-left ${hoverBg} ${textPrimary} text-xs transition-colors duration-150 ${
                    value === option.value ? 'bg-almet-sapphire/10 text-almet-sapphire font-medium' : ''
                  }`}
                >
                  {option.label}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}