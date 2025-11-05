import { Users, Target, FileText, Award, Lock, TrendingUp, ChevronRight } from 'lucide-react';

export default function PerformanceDashboard({ 
  dashboardStats, 
  employees, 
  permissions,
  onSelectEmployee,
  canViewEmployee,
  darkMode 
}) {
  const getStatusBadge = (status) => {
    const badges = {
      'DRAFT': { text: 'Draft', class: 'bg-gray-50 text-gray-700 dark:bg-almet-san-juan dark:text-almet-bali-hai' },
      'NOT_STARTED': { text: 'Not Started', class: 'bg-gray-50 text-gray-600 dark:bg-almet-san-juan dark:text-almet-santas-gray' },
      'PENDING_EMPLOYEE_APPROVAL': { text: 'Pending', class: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' },
      'PENDING_MANAGER_APPROVAL': { text: 'Review', class: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
      'APPROVED': { text: 'Approved', class: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
      'COMPLETED': { text: 'Completed', class: 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
      'NEED_CLARIFICATION': { text: 'Clarification', class: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' }
    };
    return badges[status] || badges['NOT_STARTED'];
  };

  const calcProgress = (completed, total) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  const StatCard = ({ icon: Icon, title, value, total, color }) => {
    const progress = calcProgress(value, total);
    
    const colorClasses = {
      'sapphire': {
        iconBg: 'bg-almet-mystic dark:bg-almet-san-juan',
        iconColor: 'text-almet-sapphire dark:text-almet-astral',
        progressBg: 'bg-almet-sapphire'
      },
      'orange': {
        iconBg: 'bg-orange-50 dark:bg-orange-900/30',
        iconColor: 'text-orange-600 dark:text-orange-400',
        progressBg: 'bg-orange-500'
      },
      'purple': {
        iconBg: 'bg-purple-50 dark:bg-purple-900/30',
        iconColor: 'text-purple-600 dark:text-purple-400',
        progressBg: 'bg-purple-500'
      }
    };
    
    const colorClass = colorClasses[color] || colorClasses['sapphire'];
    
    return (
      <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} border rounded-xl p-4`}>
        <div className="flex items-start justify-between mb-3">
          <div className={`p-2.5 rounded-lg ${colorClass.iconBg}`}>
            <Icon className={`w-5 h-5 ${colorClass.iconColor}`} />
          </div>
          <div className="text-right">
            <div className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
              {value}<span className={`text-base ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'}`}>/{total}</span>
            </div>
          </div>
        </div>
        
        <h3 className={`text-sm font-medium ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} mb-2`}>{title}</h3>
        
        <div className="space-y-1.5">
          <div className={`flex justify-between text-xs ${darkMode ? 'text-almet-santas-gray' : 'text-gray-500'}`}>
            <span>Progress</span>
            <span className="font-bold">{progress}%</span>
          </div>
          <div className={`w-full ${darkMode ? 'bg-almet-comet' : 'bg-gray-100'} rounded-full h-2`}>
            <div 
              className={`h-2 rounded-full ${colorClass.progressBg}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {!permissions.can_view_all && permissions.employee && (
        <div className={`${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-200'} border rounded-xl p-3.5`}>
          <div className="flex gap-3">
            <Lock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-0.5">
                Limited Access
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Viewing {employees.length} employees (you and direct reports)
              </p>
            </div>
          </div>
        </div>
      )}

      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={Target}
            title="Objectives Set"
            value={dashboardStats.objectives_completed}
            total={dashboardStats.total_employees}
            color="sapphire"
          />
          <StatCard
            icon={FileText}
            title="Mid-Year Reviews"
            value={dashboardStats.mid_year_completed}
            total={dashboardStats.total_employees}
            color="orange"
          />
          <StatCard
            icon={Award}
            title="End-Year Reviews"
            value={dashboardStats.end_year_completed}
            total={dashboardStats.total_employees}
            color="purple"
          />
        </div>
      )}

      {dashboardStats?.timeline && (
        <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} border rounded-xl p-4`}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className={`w-5 h-5 ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'}`} />
            <h3 className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
              Performance Timeline
            </h3>
          </div>
          
          <div className="space-y-3">
            {[
              { label: 'Goal Setting', data: dashboardStats.timeline.goal_setting, dot: 'bg-almet-sapphire' },
              { label: 'Mid-Year Review', data: dashboardStats.timeline.mid_year, dot: 'bg-orange-500' },
              { label: 'End-Year Review', data: dashboardStats.timeline.end_year, dot: 'bg-purple-500' }
            ].map((period, idx) => (
              <div key={idx} className="flex gap-3">
                <div className={`w-2 h-2 rounded-full ${period.dot} mt-1.5 flex-shrink-0`} />
                <div className="flex-1">
                  <div className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-almet-cloud-burst'} mb-1.5`}>
                    {period.label}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {period.data.employee_start ? (
                      <>
                        <div className={`${darkMode ? 'bg-almet-san-juan' : 'bg-almet-mystic'} rounded-lg p-2`}>
                          <div className={`${darkMode ? 'text-almet-santas-gray' : 'text-almet-waterloo'} mb-0.5`}>Employee</div>
                          <div className={`font-medium ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                            {period.data.employee_start} → {period.data.employee_end}
                          </div>
                        </div>
                        <div className={`${darkMode ? 'bg-almet-san-juan' : 'bg-almet-mystic'} rounded-lg p-2`}>
                          <div className={`${darkMode ? 'text-almet-santas-gray' : 'text-almet-waterloo'} mb-0.5`}>Manager</div>
                          <div className={`font-medium ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                            {period.data.manager_start} → {period.data.manager_end}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className={`${darkMode ? 'bg-almet-san-juan' : 'bg-almet-mystic'} rounded-lg p-2 col-span-2`}>
                        <div className={`${darkMode ? 'text-almet-santas-gray' : 'text-almet-waterloo'} mb-0.5`}>Period</div>
                        <div className={`font-medium ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                          {period.data.start} → {period.data.end}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} border rounded-xl p-4`}>
        <div className="flex items-center gap-2 mb-3">
          <Users className={`w-5 h-5 ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'}`} />
          <h3 className={`text-base font-semibold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
            Team Members
          </h3>
          <span className={`text-sm ${darkMode ? 'text-almet-santas-gray' : 'text-almet-waterloo'}`}>
            ({employees.length})
          </span>
        </div>
        
        {employees.length === 0 ? (
          <div className="text-center py-10">
            <Users className={`w-12 h-12 mx-auto mb-2 ${darkMode ? 'text-almet-comet' : 'text-gray-300'}`} />
            <p className={`text-sm ${darkMode ? 'text-almet-santas-gray' : 'text-gray-500'}`}>No team members</p>
          </div>
        ) : (
          <div className="space-y-2">
            {employees.map(employee => {
              const hasAccess = canViewEmployee(employee.id);
              const badge = getStatusBadge(employee.approval_status);
              
              return (
                <div
                  key={employee.id}
                  onClick={() => hasAccess && onSelectEmployee(employee)}
                  className={`${darkMode ? 'bg-almet-san-juan hover:bg-almet-comet' : 'bg-almet-mystic hover:bg-gray-100'} 
                    rounded-lg p-3 transition-colors
                    ${hasAccess ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-almet-sapphire to-almet-astral text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {employee.name.charAt(0)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'} truncate`}>
                            {employee.name}
                          </h4>
                          {!hasAccess && <Lock className={`w-3 h-3 ${darkMode ? 'text-almet-santas-gray' : 'text-gray-400'} flex-shrink-0`} />}
                        </div>
                        <div className={`flex items-center gap-2 text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'}`}>
                          <span className="truncate">{employee.position}</span>
                          <span>•</span>
                          <span className="truncate">{employee.department}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${badge.class}`}>
                        {badge.text}
                      </span>
                      {hasAccess && (
                        <ChevronRight className={`w-4 h-4 ${darkMode ? 'text-almet-santas-gray' : 'text-gray-400'}`} />
                      )}
                    </div>
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