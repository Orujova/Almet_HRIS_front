import { useState } from 'react';
import { Users, Target, FileText, Award, Lock, ChevronRight, Calendar } from 'lucide-react';
import Pagination from '@/components/common/Pagination';

export default function PerformanceDashboard({ 
  dashboardStats, 
  employees, 
  permissions,
  onSelectEmployee,
  canViewEmployee,
  darkMode 
}) {
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

  // Pagination
  const totalPages = Math.ceil(employees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = employees.slice(startIndex, endIndex);

  const StatCard = ({ icon: Icon, title, value, total, color }) => {
    const progress = calcProgress(value, total);
    
    return (
      <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} border rounded-xl p-4`}>
        <div className="flex items-center justify-between mb-3">
          <div className={`p-2 rounded-lg ${
            color === 'blue' ? 'bg-almet-sapphire/10 dark:bg-almet-sapphire/20' : 
            color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/30' : 
            'bg-purple-100 dark:bg-purple-900/30'
          }`}>
            <Icon className={`w-5 h-5 ${
              color === 'blue' ? 'text-almet-sapphire' : 
              color === 'orange' ? 'text-orange-600 dark:text-orange-400' : 
              'text-purple-600 dark:text-purple-400'
            }`} />
          </div>
          <div className="text-right">
            <div className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
              {value}<span className="text-sm text-almet-waterloo dark:text-almet-bali-hai">/{total}</span>
            </div>
          </div>
        </div>
        
        <h3 className="text-xs font-medium text-almet-waterloo dark:text-almet-bali-hai mb-2">{title}</h3>
        
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-almet-waterloo dark:text-almet-bali-hai">
            <span>Progress</span>
            <span className="font-bold">{progress}%</span>
          </div>
          <div className={`w-full h-1.5 rounded-full ${darkMode ? 'bg-almet-comet' : 'bg-gray-200'}`}>
            <div 
              className={`h-1.5 rounded-full ${
                color === 'blue' ? 'bg-almet-sapphire' : 
                color === 'orange' ? 'bg-orange-500' : 
                'bg-purple-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
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

      {/* Stats Grid */}
      {dashboardStats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={Target}
            title="Objectives Set"
            value={dashboardStats.objectives_completed}
            total={dashboardStats.total_employees}
            color="blue"
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

      {/* Timeline */}
      {dashboardStats?.timeline && (
        <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} border rounded-xl p-4`}>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-4 h-4 text-almet-sapphire" />
            <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
              Performance Timeline
            </h3>
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

      {/* Team Members */}
      <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} border rounded-xl p-4`}>
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-almet-sapphire" />
          <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
            Team Members
          </h3>
          <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
            ({employees.length} total)
          </span>
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
                    } rounded-lg p-3 transition-colors ${hasAccess ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-almet-sapphire to-almet-astral text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                          {employee.name.charAt(0)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h4 className={`text-sm font-semibold truncate ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                              {employee.name}
                            </h4>
                            {!hasAccess && <Lock className="w-3 h-3 text-almet-waterloo flex-shrink-0" />}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-almet-waterloo dark:text-almet-bali-hai">
                            <span className="truncate">{employee.position}</span>
                            <span>•</span>
                            <span className="truncate">{employee.department}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${badge.class}`}>
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

            {/* Pagination */}
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
    </div>
  );
}