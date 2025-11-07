import { useState } from 'react';
import { Users, Target, FileText, Award, Lock, ChevronRight, Calendar, TrendingUp, PieChart, BarChart3 } from 'lucide-react';
import Pagination from '@/components/common/Pagination';
import PerformanceAnalyticsDashboard from './PerformanceAnalyticsDashboard';

export default function PerformanceDashboard({ 
  dashboardStats, 
  employees, 
  permissions,
  settings,
  selectedYear,
  onSelectEmployee,
  canViewEmployee,
  darkMode 
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const getStatusBadge = (status) => {
    const badges = {
      'DRAFT': { text: 'Draft', class: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300' },
      'NOT_STARTED': { text: 'Not Started', class: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' },
      'PENDING_EMPLOYEE_APPROVAL': { text: 'Pending', class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
      'PENDING_MANAGER_APPROVAL': { text: 'Review', class: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
      'APPROVED': { text: 'Approved', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
      'COMPLETED': { text: 'Completed', class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      'NEED_CLARIFICATION': { text: 'Clarification', class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' }
    };
    return badges[status] || badges['NOT_STARTED'];
  };

  const calcProgress = (completed, total) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const completedCount = employees.filter(e => e.approval_status === 'COMPLETED').length;
  const totalEmployees = employees.length;

  const statusDistribution = {
    'NOT_STARTED': employees.filter(e => e.approval_status === 'NOT_STARTED' || !e.approval_status).length,
    'DRAFT': employees.filter(e => e.approval_status === 'DRAFT').length,
    'PENDING': employees.filter(e => ['PENDING_EMPLOYEE_APPROVAL', 'PENDING_MANAGER_APPROVAL'].includes(e.approval_status)).length,
    'NEED_CLARIFICATION': employees.filter(e => e.approval_status === 'NEED_CLARIFICATION').length,
    'APPROVED': employees.filter(e => e.approval_status === 'APPROVED').length,
    'COMPLETED': completedCount
  };

  // Pagination
  const totalPages = Math.ceil(employees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = employees.slice(startIndex, endIndex);

  // Tab configuration
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: Target,
      badge: null
    },
    {
      id: 'employees',
      label: 'Team Members',
      icon: Users,
      badge: totalEmployees
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      badge: null
    }
  ];

  const StatCard = ({ icon: Icon, title, value, total, subtitle, color }) => {
    const progress = calcProgress(value, total);
    
    return (
      <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} border rounded-xl p-5 hover:shadow-lg transition-all`}>
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${
            color === 'blue' ? 'bg-almet-sapphire/10 dark:bg-almet-sapphire/20' : 
            color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' : 
            color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
            'bg-emerald-100 dark:bg-emerald-900/30'
          }`}>
            <Icon className={`w-6 h-6 ${
              color === 'blue' ? 'text-almet-sapphire' : 
              color === 'orange' ? 'text-orange-600 dark:text-orange-400' : 
              color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
              'text-emerald-600 dark:text-emerald-400'
            }`} />
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
              {value}
              {total && <span className="text-base text-almet-waterloo dark:text-almet-bali-hai">/{total}</span>}
            </div>
          </div>
        </div>
        
        <h3 className={`text-sm font-bold mb-1 ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
          {title}
        </h3>
        
        {subtitle && (
          <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-3">
            {subtitle}
          </p>
        )}
        
        {total && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-almet-waterloo dark:text-almet-bali-hai">
              <span>Progress</span>
              <span className="font-bold">{progress}%</span>
            </div>
            <div className={`w-full h-2 rounded-full ${darkMode ? 'bg-almet-comet' : 'bg-gray-200'}`}>
              <div 
                className={`h-2 rounded-full transition-all duration-500 ${
                  color === 'blue' ? 'bg-almet-sapphire' : 
                  color === 'orange' ? 'bg-orange-500' : 
                  color === 'purple' ? 'bg-purple-500' :
                  'bg-emerald-500'
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };



  const TimelineItem = ({ label, data, color, isLast }) => (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className={`w-3 h-3 rounded-full ${color} ring-4 ${darkMode ? 'ring-almet-cloud-burst' : 'ring-white'}`} />
        {!isLast && <div className={`w-0.5 h-full ${darkMode ? 'bg-almet-comet' : 'bg-gray-200'} mt-1`} />}
      </div>
      
      <div className="flex-1 pb-6">
        <h4 className={`text-sm font-semibold mb-2 ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
          {label}
        </h4>
        
        {data.employee_start ? (
          <div className="grid grid-cols-2 gap-2">
            <div className={`${darkMode ? 'bg-almet-san-juan' : 'bg-almet-mystic'} rounded-lg p-2`}>
              <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Employee Period</div>
              <div className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                {data.employee_start} → {data.employee_end}
              </div>
            </div>
            <div className={`${darkMode ? 'bg-almet-san-juan' : 'bg-almet-mystic'} rounded-lg p-2`}>
              <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Manager Period</div>
              <div className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                {data.manager_start} → {data.manager_end}
              </div>
            </div>
          </div>
        ) : (
          <div className={`${darkMode ? 'bg-almet-san-juan' : 'bg-almet-mystic'} rounded-lg p-2`}>
            <div className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">Period</div>
            <div className={`text-xs font-medium ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
              {data.start} → {data.end}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Access Notice */}
      {!permissions.can_view_all && permissions.employee && (
        <div className={`${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border rounded-xl p-3`}>
          <div className="flex gap-2">
            <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-0.5">
                Limited Access Mode
              </h3>
              <p className="text-xs text-blue-700 dark:text-blue-400">
                Viewing {employees.length} employees (you and direct reports)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} rounded-xl border shadow-sm p-3`}>
        <div className="flex gap-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all flex-1 ${
                  isActive 
                    ? darkMode 
                      ? 'bg-almet-sapphire text-white shadow-lg' 
                      : 'bg-almet-sapphire text-white shadow-lg'
                    : darkMode
                      ? 'bg-almet-san-juan/30 text-almet-bali-hai hover:bg-almet-san-juan/50'
                      : 'bg-almet-mystic text-almet-waterloo hover:bg-almet-mystic/80'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                <span className="font-semibold text-sm">{tab.label}</span>
                
                {tab.badge !== null && (
                  <span className={`ml-auto px-2 py-0.5 rounded-lg text-xs font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : darkMode
                        ? 'bg-almet-comet/30 text-almet-bali-hai'
                        : 'bg-white text-almet-waterloo'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Stats Grid */}
            {dashboardStats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={Users}
                  title="Total Employees"
                  value={totalEmployees}
                  subtitle="Total employees in system"
                  color="blue"
                />
                <StatCard
                  icon={Target}
                  title="Objectives Set"
                  value={dashboardStats.objectives_completed}
                  total={totalEmployees}
                  subtitle="Employees with objectives"
                  color="blue"
                />
                {/* <StatCard
                  icon={FileText}
                  title="Mid-Year Reviews"
                  value={dashboardStats.mid_year_completed}
                  total={totalEmployees}
                  subtitle="Completed mid-year"
                  color="orange"
                />
                <StatCard
                  icon={Award}
                  title="Completed"
                  value={completedCount}
                  total={totalEmployees}
                  subtitle="Fully completed reviews"
                  color="green"
                /> */}
              </div>
            )}

       

            {/* Timeline */}
            {dashboardStats?.timeline && (
              <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} border rounded-xl p-5`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-xl bg-blue-500/10 dark:bg-blue-500/20">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                      Performance Timeline
                    </h3>
                    <p className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'}`}>
                      Key dates and periods
                    </p>
                  </div>
                </div>
                
                <div>
                  <TimelineItem
                    label="Goal Setting"
                    data={dashboardStats.timeline.goal_setting}
                    color="bg-almet-sapphire"
                    isLast={false}
                  />
                  <TimelineItem
                    label="Mid-Year Review"
                    data={dashboardStats.timeline.mid_year}
                    color="bg-orange-500"
                    isLast={false}
                  />
                  <TimelineItem
                    label="End-Year Review"
                    data={dashboardStats.timeline.end_year}
                    color="bg-purple-500"
                    isLast={true}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} border rounded-xl p-5`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20">
                <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                  Team Members
                </h3>
                <p className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'}`}>
                  {employees.length} total employees
                </p>
              </div>
            </div>
            
            {employees.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto mb-3 text-almet-waterloo dark:text-almet-comet" />
                <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai">No team members</p>
              </div>
            ) : (
              <>
                <div className="space-y-2 mb-4">
                  {currentEmployees.map(employee => {
                    const hasAccess = canViewEmployee(employee.id);
                    const badge = getStatusBadge(employee.approval_status);
                    
                    return (
                      <div
                        key={employee.id}
                        onClick={() => hasAccess && onSelectEmployee(employee)}
                        className={`${
                          darkMode ? 'bg-almet-san-juan hover:bg-almet-comet' : 'bg-almet-mystic hover:bg-gray-100'
                        } rounded-xl p-4 transition-all ${hasAccess ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-almet-sapphire to-almet-astral text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                              {employee.name.charAt(0)}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={`text-sm font-semibold truncate ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                                  {employee.name}
                                </h4>
                                {!hasAccess && <Lock className="w-3 h-3 text-almet-waterloo flex-shrink-0" />}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-almet-waterloo dark:text-almet-bali-hai">
                                <span className="truncate">{employee.position}</span>
                                <span>•</span>
                                <span className="truncate">{employee.department}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`px-2 py-1 rounded-lg text-xs font-medium ${badge.class}`}>
                              {badge.text}
                            </span>
                            {hasAccess && (
                              <ChevronRight className="w-4 h-4 text-almet-waterloo dark:text-almet-bali-hai" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={employees.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  darkMode={darkMode}
                />
              </>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <PerformanceAnalyticsDashboard
            employees={employees}
            settings={settings}
            darkMode={darkMode}
            selectedYear={selectedYear}
          />
        )}
      </div>
    </div>
  );
}