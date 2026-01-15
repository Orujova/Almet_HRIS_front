import { Download, Edit, Trash, Check, Eye } from 'lucide-react';

export default function ScheduleList({
  schedulesTab,
  setSchedulesTab,
  scheduleTabs,
  handleExportSchedules,
  handleEditSchedule,
  handleDeleteSchedule,
  handleRegisterSchedule,
  canEditSchedule,
  maxScheduleEdits,
  userAccess
}) {
  
  const tabs = [
    { key: 'upcoming', label: 'My Upcoming' },
    ...(userAccess.is_manager || userAccess.is_admin ? [{ key: 'peers', label: 'Team Schedule' }] : []),
    ...(userAccess.is_admin ? [{ key: 'all', label: 'All Schedules' }] : [])
  ];

  const canDeleteSchedule = (schedule) => {
    // Only admin can delete schedules (even registered ones)
    return userAccess.is_admin;
  };

  const canRegisterSchedule = (schedule) => {
    // Only admin can register schedules
    return userAccess.is_admin && schedule.status === 'SCHEDULED';
  };

  const canEditThisSchedule = (schedule) => {
    // Can edit if status is SCHEDULED and under edit limit
    return canEditSchedule(schedule);
  };

  return (
    <div className="border-t border-almet-mystic/30 dark:border-almet-comet/30 p-5 bg-almet-mystic/10 dark:bg-gray-900/20">
      <div className="flex items-center justify-between mb-4">
        <div className="flex space-x-6">
          {tabs.map(tab => (
            <button 
              key={tab.key} 
              onClick={() => setSchedulesTab(tab.key)} 
              className={`pb-2 px-1 border-b-2 font-medium text-xs transition-all ${
                schedulesTab === tab.key 
                  ? 'border-almet-sapphire text-almet-sapphire dark:text-almet-astral' 
                  : 'border-transparent text-almet-waterloo hover:text-almet-cloud-burst dark:text-almet-bali-hai'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button 
          onClick={handleExportSchedules} 
          className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Download className="w-3 h-3" />
          Export
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-almet-mystic/30 dark:border-almet-comet">
        <table className="min-w-full divide-y divide-almet-mystic/30 dark:divide-almet-comet">
          <thead className="bg-almet-mystic/50 dark:bg-gray-700/50">
            <tr>
              {['Employee', 'Type', 'Start', 'End', 'Days', 'Status', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-almet-comet dark:text-almet-bali-hai uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-almet-mystic/20 dark:divide-almet-comet/20">
            {scheduleTabs[schedulesTab]?.map(schedule => (
              <tr key={schedule.id} className="hover:bg-almet-mystic/20 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-4 py-3 text-xs font-medium text-almet-cloud-burst dark:text-white">{schedule.employee_name}</td>
                <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{schedule.vacation_type_name}</td>
                <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{schedule.start_date}</td>
                <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{schedule.end_date}</td>
                <td className="px-4 py-3 text-xs font-semibold text-almet-cloud-burst dark:text-white">{schedule.number_of_days}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    schedule.status === 'SCHEDULED' 
                      ? 'bg-blue-50 text-almet-sapphire dark:bg-blue-900/30 dark:text-almet-astral' 
                      : schedule.status === 'REGISTERED'
                      ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-gray-50 text-almet-waterloo dark:bg-gray-700 dark:text-almet-bali-hai'
                  }`}>
                    {schedule.status_display}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">
                  <div className="flex gap-2">
                    {/* Delete - Only Admin */}
                    {canDeleteSchedule(schedule) && (
                      <button 
                        onClick={() => handleDeleteSchedule(schedule.id)} 
                        className="text-red-600 hover:text-red-800 dark:text-red-400 flex items-center gap-1"
                        title="Delete (Admin Only)"
                      >
                        <Trash className="w-3 h-3" />
                      </button>
                    )}
                    
                    {/* Edit - If SCHEDULED and under edit limit */}
                    {canEditThisSchedule(schedule) && (
                      <button 
                        onClick={() => handleEditSchedule(schedule)} 
                        className="text-almet-sapphire hover:text-almet-cloud-burst dark:text-almet-astral flex items-center gap-1 font-medium"
                      >
                        <Edit className="w-3 h-3" />
                        Edit ({schedule.edit_count}/{maxScheduleEdits})
                      </button>
                    )}
                    
                    {/* Register - Only Admin and if SCHEDULED */}
                    {canRegisterSchedule(schedule) && (
                      <button 
                        onClick={() => handleRegisterSchedule(schedule.id)} 
                        className="text-green-600 hover:text-green-800 dark:text-green-400 flex items-center gap-1 font-medium"
                        title="Register (Admin Only)"
                      >
                        <Check className="w-3 h-3" />
                        Register
                      </button>
                    )}

                    {/* If no actions available */}
                    {!canDeleteSchedule(schedule) && !canEditThisSchedule(schedule) && !canRegisterSchedule(schedule) && (
                      <span className="text-almet-waterloo/50 dark:text-almet-bali-hai/50 text-xs">
                        {schedule.status === 'SCHEDULED' 
                          ? 'Max edits reached' 
                          : schedule.status === 'REGISTERED'
                          ? 'Registered'
                          : 'N/A'}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {scheduleTabs[schedulesTab]?.length === 0 && (
              <tr>
                <td colSpan="7" className="px-4 py-8 text-center text-sm text-almet-waterloo dark:text-almet-bali-hai">
                  No schedules found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}