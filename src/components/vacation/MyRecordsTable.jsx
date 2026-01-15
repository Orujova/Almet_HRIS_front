import { Download, Eye, Edit, Check, Paperclip, FileText } from 'lucide-react';

export default function MyRecordsTable({
  myAllRecords,
  handleExportMyVacations,
  handleViewDetails,
  handleViewAttachments,
  handleViewScheduleDetail,
  handleEditSchedule,
  handleRegisterSchedule,
  userAccess
}) {
  
  const canEditSchedule = (record) => {
    // Can edit if it's a schedule, status is SCHEDULED, and under edit limit
    return record.type === 'schedule' && record.can_edit;
  };

  const canRegisterSchedule = (record) => {
    // Only admin can register schedules
    return userAccess.is_admin && record.type === 'schedule' && record.status === 'Scheduled';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet shadow-sm">
      <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white">My All Records</h2>
        <button 
          onClick={handleExportMyVacations} 
          className="px-3 py-1.5 text-xs bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all flex items-center gap-1.5 shadow-sm"
        >
          <Download className="w-3 h-3" />
          My Vacations
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-almet-mystic/30 dark:divide-almet-comet">
          <thead className="bg-almet-mystic/50 dark:bg-gray-700/50">
            <tr>
              {['Type', 'Leave', 'Start', 'End', 'Days', 'Status', 'Attachments', 'Actions'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-almet-comet dark:text-almet-bali-hai uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-almet-mystic/20 dark:divide-almet-comet/20">
            {myAllRecords.map(record => (
              <tr key={`${record.type}-${record.id}`} className="hover:bg-almet-mystic/20 dark:hover:bg-gray-700/30 transition-colors">
                <td className="px-4 py-3 text-xs">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    record.type === 'schedule' 
                      ? 'bg-blue-50 text-almet-sapphire dark:bg-blue-900/30 dark:text-almet-astral' 
                      : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                  }`}>
                    {record.type === 'schedule' ? 'Schedule' : 'Request'}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{record.vacation_type}</td>
                <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{record.start_date}</td>
                <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{record.end_date}</td>
                <td className="px-4 py-3 text-xs font-semibold text-almet-cloud-burst dark:text-white">{record.days}</td>
                <td className="px-4 py-3">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                    record.status === 'Scheduled' || record.status === 'Registered' ? 'bg-blue-50 text-almet-sapphire dark:bg-blue-900/30 dark:text-almet-astral' : 
                    record.status === 'Pending HR' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 
                    record.status === 'Pending Line Manager' ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' : 
                    record.status === 'Approved' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                    'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                  }`}>
                    {record.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">
                  {record.type === 'request' && record.has_attachments ? (
                    <button
                      onClick={() => handleViewAttachments(record.request_id, record.request_id)}
                      className="flex items-center gap-1 text-almet-sapphire hover:text-almet-cloud-burst dark:text-almet-astral font-medium"
                    >
                      <Paperclip className="w-3 h-3" />
                    </button>
                  ) : (
                    <span className="text-almet-waterloo/50 dark:text-almet-bali-hai/50">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs">
                  {record.type === 'request' ? (
                    // Requests - Only View
                    <button 
                      onClick={() => handleViewDetails(record.id)}
                      className="text-almet-sapphire hover:text-almet-cloud-burst dark:text-almet-astral flex items-center gap-1 font-medium"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                  ) : (
                    // Schedules
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleViewScheduleDetail(record.id)} 
                        className="text-almet-sapphire hover:text-almet-cloud-burst dark:text-almet-astral flex items-center gap-1 font-medium"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                      
                      {canEditSchedule(record) && (
                        <button 
                          onClick={() => handleEditSchedule(record)} 
                          className="text-almet-sapphire hover:text-almet-cloud-burst dark:text-almet-astral flex items-center gap-1 font-medium"
                        >
                          <Edit className="w-3 h-3" />
                          Edit
                        </button>
                      )}
                      
                      {canRegisterSchedule(record) && (
                        <button 
                          onClick={() => handleRegisterSchedule(record.id)} 
                          className="text-green-600 hover:text-green-800 dark:text-green-400 flex items-center gap-1 font-medium"
                          title="Register (Admin Only)"
                        >
                          <Check className="w-3 h-3" />
                          Register
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
            {myAllRecords.length === 0 && (
              <tr>
                <td colSpan="8" className="px-4 py-12 text-center">
                  <FileText className="w-10 h-10 text-almet-waterloo/30 dark:text-almet-bali-hai/30 mx-auto mb-3" />
                  <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai">No records found</p>
                  <p className="text-xs text-almet-waterloo/70 dark:text-almet-bali-hai/70 mt-1">Your vacation history will appear here</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}