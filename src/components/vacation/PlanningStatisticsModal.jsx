// components/vacation/PlanningStatisticsModal.jsx

import { useState, useEffect } from 'react';
import { 
  X,
  TrendingUp,
  TrendingDown,
  Calendar,
  Download,
  CheckCircle,
  AlertCircle,
  Users,
  Search,
  BarChart3
} from 'lucide-react';
import { VacationService } from '@/services/vacationService';
import Pagination from '@/components/common/Pagination';

export default function PlanningStatisticsModal({
  show,
  onClose,
  darkMode,
  userAccess,
  showSuccess,
  showError
}) {
  const [statistics, setStatistics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (show) {
      fetchStatistics();
    }
  }, [show]);

  const fetchStatistics = async () => {
    setLoading(true);
    try {
      // Get balances
      const balanceResponse = await VacationService.getAllBalances({
        year: new Date().getFullYear()
      });
      
      // Get schedule tabs for pending schedules
      const scheduleResponse = await VacationService.getScheduleTabs();
      
      if (balanceResponse?.balances) {
        // Group pending schedules by employee
        const pendingByEmployee = {};
        if (scheduleResponse?.upcoming) {
          scheduleResponse.upcoming
            .filter(s => s.status === 'PENDING_MANAGER')
            .forEach(schedule => {
              const empName = schedule.employee_name;
              if (!pendingByEmployee[empName]) {
                pendingByEmployee[empName] = 0;
              }
              pendingByEmployee[empName] += parseFloat(schedule.number_of_days || 0);
            });
        }
        
        // Calculate statistics
        const stats = balanceResponse.balances.map(balance => {
          const scheduledDays = parseFloat(balance.scheduled_days);
          const usedDays = parseFloat(balance.used_days);
          const pendingDays = pendingByEmployee[balance.employee_name] || 0;
          
          // ✅ Total planned = used + scheduled + pending
          const totalPlanned = usedDays + scheduledDays + pendingDays;
          
          // ✅ Available = remaining - pending
          const availableForPlanning = parseFloat(balance.remaining_balance) - pendingDays;
          
          // ✅ Should plan = yearly - (used + scheduled + pending)
          const shouldPlan = Math.max(0, parseFloat(balance.yearly_balance) - totalPlanned);
          
          const planningRate = balance.yearly_balance > 0 
            ? ((totalPlanned / balance.yearly_balance) * 100).toFixed(1)
            : 0;
          
          return {
            ...balance,
            used_days: usedDays,
            scheduled_days: scheduledDays,
            pending_days: pendingDays,
            total_planned: totalPlanned,
            available_for_planning: availableForPlanning,
            should_plan: shouldPlan,
            planning_rate: parseFloat(planningRate),
            is_fully_planned: shouldPlan === 0,
            is_under_planned: shouldPlan > 0
          };
        });
        
        // Sort by should_plan DESC (most urgent first)
        stats.sort((a, b) => b.should_plan - a.should_plan);
        
        setStatistics(stats);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
      showError?.('Failed to load planning statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const blob = await VacationService.exportBalances({
        year: new Date().getFullYear()
      });
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `planning_statistics_${new Date().getFullYear()}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showSuccess?.('Export completed successfully');
    } catch (error) {
      console.error('Export error:', error);
      showError?.('Export failed');
    }
  };

  // Filter by search
  const filteredStats = statistics.filter(stat => 
    stat.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stat.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stat.department_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredStats.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedStats = filteredStats.slice(startIndex, endIndex);

  // Summary calculations
  const totalEmployees = statistics.length;
  const fullyPlanned = statistics.filter(s => s.is_fully_planned).length;
  const underPlanned = statistics.filter(s => s.is_under_planned).length;
  const averagePlanningRate = statistics.length > 0
    ? (statistics.reduce((sum, s) => sum + s.planning_rate, 0) / statistics.length).toFixed(1)
    : 0;
  const totalShouldPlan = statistics.reduce((sum, s) => sum + s.should_plan, 0);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col border border-almet-mystic/50 dark:border-almet-comet">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-almet-mystic/30 dark:border-almet-comet/30">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-almet-sapphire/10 rounded-lg">
              <BarChart3 className="w-5 h-5 text-almet-sapphire" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-almet-cloud-burst dark:text-white">
                Planning Statistics
              </h2>
              <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                Employee vacation planning overview for {new Date().getFullYear()}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-almet-mystic/30 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-almet-waterloo dark:text-almet-bali-hai" />
          </button>
        </div>

        {/* Summary Cards */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-almet-mystic/30 dark:border-almet-comet/30">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-almet-mystic/30 dark:border-almet-comet/30">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-almet-sapphire" />
                <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Total Employees</span>
              </div>
              <p className="text-xl font-bold text-almet-cloud-burst dark:text-white">{totalEmployees}</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-almet-mystic/30 dark:border-almet-comet/30">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Fully Planned</span>
              </div>
              <p className="text-xl font-bold text-green-600">{fullyPlanned}</p>
              <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                {totalEmployees > 0 ? ((fullyPlanned / totalEmployees) * 100).toFixed(0) : 0}%
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-almet-mystic/30 dark:border-almet-comet/30">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Under Planned</span>
              </div>
              <p className="text-xl font-bold text-amber-600">{underPlanned}</p>
              <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                {totalEmployees > 0 ? ((underPlanned / totalEmployees) * 100).toFixed(0) : 0}%
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-almet-mystic/30 dark:border-almet-comet/30">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-almet-sapphire" />
                <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Avg Planning Rate</span>
              </div>
              <p className="text-xl font-bold text-almet-sapphire">{averagePlanningRate}%</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-almet-mystic/30 dark:border-almet-comet/30">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-red-600" />
                <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">Total Must Plan</span>
              </div>
              <p className="text-xl font-bold text-red-600">{totalShouldPlan.toFixed(1)}</p>
              <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">days</p>
            </div>
          </div>
        </div>

        {/* Search & Actions */}
        <div className="px-6 py-3 border-b border-almet-mystic/30 dark:border-almet-comet/30">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-almet-waterloo dark:text-almet-bali-hai" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search by name, ID, or department..."
                className="w-full pl-10 pr-4 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
              />
            </div>

            <button
              onClick={handleExport}
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 shadow-sm"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-almet-sapphire border-t-transparent"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-almet-mystic/30 dark:divide-almet-comet">
              <thead className="bg-almet-mystic/50 dark:bg-gray-700/50 sticky top-0">
                <tr>
                  {['Employee', 'Department', 'Used', 'Scheduled', 'Pending', 'Total Planned', 'Available', 'Must Plan', 'Rate', 'Status'].map(h => (
                    <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-almet-comet dark:text-almet-bali-hai uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-almet-mystic/20 dark:divide-almet-comet/20">
                {paginatedStats.map((stat) => (
                  <tr key={stat.id} className="hover:bg-almet-mystic/20 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-3 py-2">
                      <div>
                        <p className="text-sm font-medium text-almet-cloud-burst dark:text-white">
                          {stat.employee_name}
                        </p>
                        <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                          {stat.employee_id}
                        </p>
                      </div>
                    </td>
                    <td className="px-3 py-2 text-sm text-almet-waterloo dark:text-almet-bali-hai">
                      {stat.department_name}
                    </td>
                    
                    {/* ✅ Used Days */}
                    <td className="px-3 py-2">
                      <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                        {stat.used_days}
                      </span>
                    </td>
                    
                    {/* ✅ Scheduled Days (Approved) */}
                    <td className="px-3 py-2">
                      <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                        {stat.scheduled_days}
                      </span>
                    </td>
                    
                    {/* ✅ Pending Days (Awaiting Approval) */}
                    <td className="px-3 py-2">
                      <span className={`text-sm font-semibold ${
                        stat.pending_days > 0 
                          ? 'text-amber-600 dark:text-amber-400' 
                          : 'text-gray-400 dark:text-gray-600'
                      }`}>
                        {stat.pending_days > 0 ? stat.pending_days : '-'}
                      </span>
                    </td>
                    
                    {/* ✅ Total Planned */}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold text-almet-cloud-burst dark:text-white">
                          {stat.total_planned}
                        </span>
                        <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                          / {stat.yearly_balance}
                        </span>
                      </div>
                    </td>
                    
                    {/* ✅ Available for Planning */}
                    <td className="px-3 py-2">
                      <span className={`text-sm font-semibold ${
                        stat.available_for_planning > 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-gray-400 dark:text-gray-600'
                      }`}>
                        {stat.available_for_planning > 0 ? stat.available_for_planning : '-'}
                      </span>
                    </td>
                    
                    {/* ✅ Must Plan */}
                    <td className="px-3 py-2">
                      <span className={`text-sm font-bold ${
                        stat.should_plan > 0 
                          ? 'text-red-600 dark:text-red-400' 
                          : 'text-green-600 dark:text-green-400'
                      }`}>
                        {stat.should_plan > 0 ? stat.should_plan : '✓'}
                      </span>
                    </td>
                    
                    {/* ✅ Planning Rate */}
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden min-w-[60px]">
                          <div 
                            className={`h-full transition-all ${
                              stat.planning_rate >= 100 
                                ? 'bg-green-500' 
                                : stat.planning_rate >= 70 
                                ? 'bg-blue-500' 
                                : stat.planning_rate >= 50 
                                ? 'bg-amber-500' 
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(stat.planning_rate, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-almet-cloud-burst dark:text-white w-10 text-right">
                          {stat.planning_rate}%
                        </span>
                      </div>
                    </td>
                    
                    {/* ✅ Status */}
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                        stat.is_fully_planned
                          ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          : stat.should_plan > 5
                          ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                      }`}>
                        {stat.is_fully_planned ? (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Complete
                          </span>
                        ) : stat.should_plan > 5 ? (
                          <span className="flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Urgent
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <TrendingDown className="w-3 h-3" />
                            Needs Plan
                          </span>
                        )}
                      </span>
                    </td>
                  </tr>
                ))}
                {paginatedStats.length === 0 && (
                  <tr>
                    <td colSpan="10" className="px-3 py-12 text-center">
                      <Users className="w-10 h-10 text-almet-waterloo/30 dark:text-almet-bali-hai/30 mx-auto mb-3" />
                      <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai">
                        {searchTerm ? 'No employees match your search' : 'No statistics available'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {filteredStats.length > itemsPerPage && (
          <div className="px-6 py-4 border-t border-almet-mystic/30 dark:border-almet-comet/30">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredStats.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              darkMode={darkMode}
            />
          </div>
        )}
      </div>
    </div>
  );
}