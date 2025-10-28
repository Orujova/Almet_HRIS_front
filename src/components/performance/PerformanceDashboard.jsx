import { Users, Target, FileText, Award, Lock, TrendingUp } from 'lucide-react';

export default function PerformanceDashboard({ 
  dashboardStats, 
  employees, 
  permissions,
  onSelectEmployee,
  canViewEmployee,
  darkMode 
}) {
  const getStatusBadgeColor = (status) => {
    const colors = {
      'DRAFT': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      'NOT_STARTED': 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
      'PENDING_EMPLOYEE_APPROVAL': 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      'PENDING_MANAGER_APPROVAL': 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      'APPROVED': 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      'COMPLETED': 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      'NEED_CLARIFICATION': 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const calculatePercentage = (completed, total) => {
    return total > 0 ? ((completed / total) * 100).toFixed(0) : 0;
  };

  const StatCard = ({ icon: Icon, title, completed, total, color, bgColor }) => (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border shadow-sm p-4 hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {completed}
            <span className="text-sm text-gray-500 dark:text-gray-400">/{total}</span>
          </p>
        </div>
      </div>
      
      <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">{title}</h3>
      
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-gray-500 dark:text-gray-400">Progress</span>
          <span className={`font-semibold ${color}`}>
            {calculatePercentage(completed, total)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${color.replace('text-', 'bg-')}`}
            style={{ width: `${calculatePercentage(completed, total)}%` }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Access Notice - Kompakt */}
      {!permissions.can_view_all && permissions.employee && (
        <div className={`rounded-lg ${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border p-3`}>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <Lock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-xs font-semibold text-blue-900 dark:text-blue-300 mb-0.5">
                Limited Access Mode
              </h3>
              <p className="text-[10px] text-blue-700 dark:text-blue-400">
                You can view your own performance and your direct reports. 
                Accessible: <span className="font-semibold">
                  {permissions.accessible_employee_count === 'all' ? 'All Employees' : `${employees.length} Employees`}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards - Kompakt */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={Target}
            title="Objectives Set"
            completed={dashboardStats.objectives_completed}
            total={dashboardStats.total_employees}
            color="text-almet-sapphire"
            bgColor="bg-almet-mystic dark:bg-almet-cloud-burst/20"
          />
          <StatCard
            icon={FileText}
            title="Mid-Year Reviews"
            completed={dashboardStats.mid_year_completed}
            total={dashboardStats.total_employees}
            color="text-orange-600"
            bgColor="bg-orange-50 dark:bg-orange-900/20"
          />
          <StatCard
            icon={Award}
            title="End-Year Reviews"
            completed={dashboardStats.end_year_completed}
            total={dashboardStats.total_employees}
            color="text-purple-600"
            bgColor="bg-purple-50 dark:bg-purple-900/20"
          />
        </div>
      )}

      {/* Timeline Section - Kompakt */}
      {dashboardStats?.timeline && (
        <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border shadow-sm p-4`}>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-almet-sapphire" />
            Performance Timeline
          </h3>
          
          <div className="space-y-3">
            {[
              { label: 'Goal Setting', data: dashboardStats.timeline.goal_setting, color: 'almet-sapphire' },
              { label: 'Mid-Year Review', data: dashboardStats.timeline.mid_year, color: 'orange-500' },
              { label: 'End-Year Review', data: dashboardStats.timeline.end_year, color: 'purple-500' }
            ].map((period, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full bg-${period.color} mt-1.5 flex-shrink-0`} />
                <div className="flex-1">
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-1.5">
                    {period.label}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    {period.data.employee_start && (
                      <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-2`}>
                        <p className="text-gray-500 dark:text-gray-400 mb-0.5">Employee Period</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {period.data.employee_start} → {period.data.employee_end}
                        </p>
                      </div>
                    )}
                    {period.data.manager_start && (
                      <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-2`}>
                        <p className="text-gray-500 dark:text-gray-400 mb-0.5">Manager Period</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {period.data.manager_start} → {period.data.manager_end}
                        </p>
                      </div>
                    )}
                    {!period.data.employee_start && (
                      <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-2 col-span-2`}>
                        <p className="text-gray-500 dark:text-gray-400 mb-0.5">Period</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {period.data.start} → {period.data.end}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Members Grid - Kompakt */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border shadow-sm p-4`}>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="w-4 h-4 text-almet-sapphire" />
          Team Members
        </h3>
        
        {employees.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-xs text-gray-500 dark:text-gray-400">No team members found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {employees.map(employee => {
              const hasAccess = canViewEmployee(employee.id);
              
              return (
                <div
                  key={employee.id}
                  onClick={() => hasAccess && onSelectEmployee(employee)}
                  className={`${darkMode ? 'bg-gray-750 border-gray-700 hover:border-almet-sapphire' : 'bg-gray-50 border-gray-200 hover:border-almet-sapphire'} 
                    border rounded-lg p-3 transition-all duration-200 
                    ${hasAccess ? 'cursor-pointer hover:shadow-md' : 'opacity-50 cursor-not-allowed'}`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-almet-sapphire to-almet-astral text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {employee.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-gray-900 dark:text-white truncate mb-0.5">
                        {employee.name}
                      </h4>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">
                        {employee.position}
                      </p>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                        {employee.department} • {employee.employee_id}
                      </p>
                    </div>
                    {!hasAccess && (
                      <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <span className={`inline-flex items-center text-[10px] px-2 py-1 rounded-md font-medium ${getStatusBadgeColor(employee.approval_status)}`}>
                      {employee.approval_status?.replace(/_/g, ' ')}
                    </span>
                    
                    {hasAccess && (
                      <button 
                        className="w-full px-3 py-2 bg-gradient-to-r from-almet-sapphire to-almet-astral text-white rounded-lg hover:from-almet-astral hover:to-almet-steel-blue text-xs font-medium transition-all"
                      >
                        View Performance
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}