import { Settings, RefreshCw, Calendar } from 'lucide-react';

export default function PerformanceHeader({ 
  selectedYear, 
  setSelectedYear, 
  performanceYears, 
  currentPeriod, 
  loading, 
  onRefresh,
  onSettings,
  darkMode 
}) {
  const getPeriodLabel = (period) => {
    const labels = {
      'GOAL_SETTING': 'Goal Setting',
      'MID_YEAR_REVIEW': 'Mid-Year Review',
      'END_YEAR_REVIEW': 'End-Year Review',
      'CLOSED': 'Closed'
    };
    return labels[period] || 'Unknown';
  };

  const getPeriodColors = (period) => {
    const colors = {
      'GOAL_SETTING': {
        bg: 'bg-gradient-to-r from-almet-sapphire to-almet-astral',
        badge: 'bg-almet-mystic text-almet-sapphire dark:bg-almet-san-juan dark:text-almet-bali-hai'
      },
      'MID_YEAR_REVIEW': {
        bg: 'bg-gradient-to-r from-orange-500 to-orange-600',
        badge: 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
      },
      'END_YEAR_REVIEW': {
        bg: 'bg-gradient-to-r from-purple-500 to-purple-600',
        badge: 'bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
      },
      'CLOSED': {
        bg: 'bg-gradient-to-r from-almet-waterloo to-almet-comet',
        badge: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
      }
    };
    return colors[period] || colors['CLOSED'];
  };

  const periodColors = getPeriodColors(currentPeriod);

  return (
    <div className="mb-5">
      <div className={`${periodColors.bg} rounded-xl p-4 shadow-lg`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <Calendar className="w-6 h-6 text-white" />
              <div>
                <h1 className="text-xl font-bold text-white">
                  Performance {selectedYear}
                </h1>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-lg text-xs font-medium ${periodColors.badge}`}>
                  {getPeriodLabel(currentPeriod)}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <select
              value={selectedYear || ''}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-3 py-2 text-sm rounded-lg bg-white text-gray-900 border-0 font-medium focus:ring-2 focus:ring-white/50 shadow-sm"
            >
              {performanceYears.map(year => (
                <option key={year.id} value={year.year}>
                  {year.year}
                </option>
              ))}
            </select>
            
   
            <button
              onClick={onSettings}
              className="px-3 py-2 bg-white rounded-lg hover:bg-white/90 transition-colors flex items-center gap-2 text-sm font-medium text-gray-700 shadow-sm"
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}