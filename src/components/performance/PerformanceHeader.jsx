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
      'GOAL_SETTING': 'Goal Setting Period',
      'MID_YEAR_REVIEW': 'Mid-Year Review Period',
      'END_YEAR_REVIEW': 'End-Year Review Period',
      'CLOSED': 'Performance Cycle Closed'
    };
    return labels[period] || 'Unknown Period';
  };

  const getPeriodColors = (period) => {
    const colors = {
      'GOAL_SETTING': {
        bg: 'from-almet-sapphire to-almet-astral',
        badge: 'bg-blue-500/20 text-white'
      },
      'MID_YEAR_REVIEW': {
        bg: 'from-yellow-500 to-orange-500',
        badge: 'bg-orange-500/20 text-white'
      },
      'END_YEAR_REVIEW': {
        bg: 'from-purple-500 to-purple-600',
        badge: 'bg-purple-500/20 text-white'
      },
      'CLOSED': {
        bg: 'from-gray-500 to-gray-600',
        badge: 'bg-gray-500/20 text-white'
      }
    };
    return colors[period] || colors['CLOSED'];
  };

  const periodColors = getPeriodColors(currentPeriod);

  return (
    <div className={`bg-gradient-to-r ${periodColors.bg} rounded-lg p-4 text-white shadow-sm mb-4`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1.5">
            <Calendar className="w-5 h-5" />
            <h1 className="text-lg font-bold">Performance Management {selectedYear}</h1>
          </div>
          <div className="flex items-center gap-2 text-xs opacity-90">
            <span className={`px-2 py-1 rounded-md font-medium ${periodColors.badge}`}>
              {getPeriodLabel(currentPeriod)}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <select
            value={selectedYear || ''}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="px-3 py-2 text-xs rounded-lg bg-white/20 backdrop-blur-sm text-white border border-white/30 font-medium focus:ring-2 focus:ring-white/50 focus:outline-none transition-all hover:bg-white/30"
          >
            {performanceYears.map(year => (
              <option key={year.id} value={year.year} className="text-gray-900">
                {year.year}
              </option>
            ))}
          </select>
          
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 disabled:opacity-50 transition-all border border-white/30"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={onSettings}
            className="px-3 py-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-all border border-white/30 flex items-center gap-1.5 font-medium text-xs"
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </button>
        </div>
      </div>
    </div>
  );
}