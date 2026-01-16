// components/vacation/MySchedulesTab.jsx
import { Download, Edit, Trash, Check, Eye, Calendar } from 'lucide-react';
import { useState } from 'react';

export default function MySchedulesTab({
  userAccess,
  scheduleTabs,
  handleExportSchedules,
  handleEditSchedule,
  handleDeleteSchedule,
  handleRegisterSchedule,
  canEditSchedule,
  maxScheduleEdits,
  handleViewScheduleDetail
}) {
  const [activeSubTab, setActiveSubTab] = useState('upcoming');

  const getSubTabs = () => {
    const tabs = [
      { key: 'upcoming', label: 'My Upcoming', count: scheduleTabs.upcoming?.length || 0 }
    ];

    if (userAccess.is_manager || userAccess.is_admin) {
      tabs.push({ 
        key: 'peers', 
        label: 'My Team', 
        count: scheduleTabs.peers?.length || 0 
      });
    }

    tabs.push({ 
      key: 'all', 
      label: userAccess.is_admin ? 'All Schedules' : 'My Peers',
      count: scheduleTabs.all?.length || 0 
    });

    return tabs;
  };

  const subTabs = getSubTabs();
  const currentSchedules = scheduleTabs[activeSubTab] || [];

  const canDeleteSchedule = (schedule) => {
    return userAccess.is_admin;
  };

  const canRegisterSchedule = (schedule) => {
    return userAccess.is_admin && schedule.status === 'SCHEDULED';
  };

  return (
    <div className="space-y-4">
      {/* Sub-tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet shadow-sm">
        <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 p-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-almet-cloud-burst dark:text-white"> 
              My Schedules
            </h2>
            <button 
              onClick={handleExportSchedules} 
              className="px-2.5 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-1.5 shadow-sm" 
            >
              <Download className="w-3 h-3" />
              Export
            </button>
          </div>

          {/* Sub-tab buttons */}
          <div className="grid grid-cols-3 gap-2"> 
            {subTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveSubTab(tab.key)}
                className={`
                  relative px-4 py-2 rounded-lg font-medium text-xs transition-all 
                  ${activeSubTab === tab.key
                    ? 'bg-almet-sapphire text-white shadow-lg scale-105'
                    : 'bg-almet-mystic/30 dark:bg-gray-700 text-almet-cloud-burst dark:text-white hover:bg-almet-mystic/50 dark:hover:bg-gray-600'
                  }
                `}
              >
                <div className="flex items-center justify-between">
                  <span>{tab.label}</span>
                  <span className={`
                    px-2 py-0.5 rounded-full text-xs font-bold 
                    ${activeSubTab === tab.key
                      ? 'bg-white/20 text-white'
                      : 'bg-almet-sapphire/20 text-almet-sapphire dark:bg-almet-astral/20 dark:text-almet-astral'
                    }
                  `}>
                    {tab.count}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-almet-mystic/30 dark:divide-almet-comet">
            <thead className="bg-almet-mystic/50 dark:bg-gray-700/50">
              <tr>
                {['Employee', 'Type', 'Start', 'End', 'Days', 'Status', 'Edit Count', 'Actions'].map(h => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-almet-comet dark:text-almet-bali-hai uppercase tracking-wide"> 
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-almet-mystic/20 dark:divide-almet-comet/20">
              {currentSchedules.map(schedule => (
                <tr key={schedule.id} className="hover:bg-almet-mystic/20 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-3 py-2 text-xs font-medium text-almet-cloud-burst dark:text-white">
                    {schedule.employee_name}
                  </td>
                  <td className="px-3 py-2 text-xs text-almet-waterloo dark:text-almet-bali-hai">
                    {schedule.vacation_type_name}
                  </td>
                  <td className="px-3 py-2 text-xs text-almet-waterloo dark:text-almet-bali-hai">
                    {schedule.start_date}
                  </td>
                  <td className="px-3 py-2 text-xs text-almet-waterloo dark:text-almet-bali-hai">
                    {schedule.end_date}
                  </td>
                  <td className="px-3 py-2 text-xs font-semibold text-almet-cloud-burst dark:text-white">
                    {schedule.number_of_days}
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${ 
                      schedule.status === 'SCHEDULED' 
                        ? 'bg-blue-50 text-almet-sapphire dark:bg-blue-900/30 dark:text-almet-astral' 
                        : 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                      {schedule.status_display}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-center">
                    <span className={`font-semibold ${
                      schedule.edit_count >= maxScheduleEdits 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-almet-waterloo dark:text-almet-bali-hai'
                    }`}>
                      {schedule.edit_count}/{maxScheduleEdits}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs">
                    <div className="flex gap-1.5"> 
                      <button 
                        onClick={() => handleViewScheduleDetail(schedule.id)}
                        className="text-almet-sapphire hover:text-almet-cloud-burst dark:text-almet-astral flex items-center gap-1 font-medium"
                      >
                        <Eye className="w-3 h-3" />
                      </button>

                      {canEditSchedule(schedule) && (
                        <button 
                          onClick={() => handleEditSchedule(schedule)} 
                          className="text-almet-sapphire hover:text-almet-cloud-burst dark:text-almet-astral flex items-center gap-1 font-medium"
                        >
                          <Edit className="w-3 h-3" />
                        </button>
                      )}
                      
                      {canDeleteSchedule(schedule) && (
                        <button 
                          onClick={() => handleDeleteSchedule(schedule.id)} 
                          className="text-red-600 hover:text-red-800 dark:text-red-400 flex items-center gap-1 font-medium"
                        >
                          <Trash className="w-3 h-3" />
                        </button>
                      )}
                      
                      {canRegisterSchedule(schedule) && (
                        <button 
                          onClick={() => handleRegisterSchedule(schedule.id)} 
                          className="text-green-600 hover:text-green-800 dark:text-green-400 flex items-center gap-1 font-medium"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {currentSchedules.length === 0 && (
                <tr>
                  <td colSpan="8" className="px-3 py-8 text-center"> 
                    <Calendar className="w-8 h-8 text-almet-waterloo/30 dark:text-almet-bali-hai/30 mx-auto mb-2" /> 
                    <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                      No schedules found
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}