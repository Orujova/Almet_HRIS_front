import { useState } from 'react';
import { Users, Target, FileText, Award, Lock, ChevronRight, Calendar, TrendingUp, BarChart3, Search, X } from 'lucide-react';
import Pagination from '@/components/common/Pagination';

// ✅ Import New Components
import TeamMembersWithSearch from './TeamMembersWithSearch';
import FixedStatCards from './FixedStatCards';
import FixedAnalyticsDashboard from './PerformanceAnalyticsDashboard';

export default function PerformanceDashboard({ 
  dashboardStats, 
  employees, 
  permissions,
  settings,
  selectedYear,
  onSelectEmployee,
  canViewEmployee,
  onLoadEmployeePerformance,
  darkMode 
}) {
  const [activeTab, setActiveTab] = useState('overview');








  const totalEmployees = employees?.length || 0;

  

  // ✅ Tab configuration
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Target, badge: null },
    { id: 'employees', label: 'Team Members', icon: Users, badge: totalEmployees },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null }
  ];

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
                Viewing {totalEmployees} employees (you and direct reports)
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
                    ? 'bg-almet-sapphire text-white shadow-lg' 
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
        {/* ✅ OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* ✅ Stats Grid - Using New Component */}
            <FixedStatCards employees={employees} darkMode={darkMode} />

        

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

        {/* ✅ EMPLOYEES TAB - Using New Component */}
        {activeTab === 'employees' && (
          <TeamMembersWithSearch
            employees={employees}
            currentUserId={permissions.employee?.id}
            canViewEmployee={canViewEmployee}
            onSelectEmployee={onSelectEmployee}
            darkMode={darkMode}
          />
        )}

        {/* ✅ ANALYTICS TAB - Using New Component */}
        {activeTab === 'analytics' && (
          <FixedAnalyticsDashboard
            employees={employees}
            settings={settings}
            darkMode={darkMode}
            onLoadEmployeePerformance={onLoadEmployeePerformance}
            selectedYear={selectedYear}
          />
        )}
      </div>
    </div>
  );
}