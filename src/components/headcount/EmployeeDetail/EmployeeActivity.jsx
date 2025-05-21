// src/components/headcount/EmployeeDetail/EmployeeActivity.jsx
import { useTheme } from "../../common/ThemeProvider";

/**
 * Activity timeline component for employee detail page
 * @param {Object} props - Component props
 * @param {Array} props.activities - Employee activities
 * @returns {JSX.Element} - Employee activity component
 */
const EmployeeActivity = ({ activities = [] }) => {
  const { darkMode } = useTheme();

  // Theme-dependent classes
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const shadowClass = darkMode ? "" : "shadow-md";

  // Define activity colors based on type
  const getActivityColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'promotion':
        return {
          bg: 'bg-purple-500',
          text: 'text-purple-500 dark:text-purple-400',
          border: 'border-purple-500'
        };
      case 'training':
        return {
          bg: 'bg-blue-500',
          text: 'text-blue-500 dark:text-blue-400',
          border: 'border-blue-500'
        };
      case 'performance':
        return {
          bg: 'bg-green-500',
          text: 'text-green-500 dark:text-green-400',
          border: 'border-green-500'
        };
      case 'leave':
        return {
          bg: 'bg-yellow-500',
          text: 'text-yellow-500 dark:text-yellow-400',
          border: 'border-yellow-500'
        };
      case 'joining':
        return {
          bg: 'bg-teal-500',
          text: 'text-teal-500 dark:text-teal-400',
          border: 'border-teal-500'
        };
      default:
        return {
          bg: 'bg-gray-500',
          text: 'text-gray-500 dark:text-gray-400',
          border: 'border-gray-500'
        };
    }
  };

  // Default activities if none provided
  const defaultActivities = [
    {
      id: 1,
      type: 'joining',
      title: 'Joined Company',
      description: 'Started as ' + (activities[0]?.position || 'Employee'),
      date: activities[0]?.date || new Date().toISOString()
    }
  ];

  // Use provided activities or default ones
  const displayActivities = activities.length > 0 ? activities : defaultActivities;

  return (
    <div className={`${bgCard} rounded-lg p-6 ${shadowClass}`}>
      <h3 className={`text-lg font-medium ${textPrimary} mb-4 border-b ${borderColor} pb-2`}>
        Recent Activity
      </h3>

      <div className="space-y-2">
        {displayActivities.map((activity, index) => {
          const colors = getActivityColor(activity.type);
          
          // Determine if this is the last item
          const isLastItem = index === displayActivities.length - 1;
          
          return (
            <div 
              key={activity.id || index} 
              className={`relative pl-6 pb-4 ${!isLastItem ? `border-l-2 ${colors.border}` : ''}`}
            >
              {/* Activity dot */}
              <div className={`absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full ${colors.bg}`}></div>
              
              {/* Activity content */}
              <div>
                <p className={`font-medium ${textPrimary}`}>
                  {activity.title}
                </p>
                <p className={`${textSecondary}`}>
                  {activity.description}
                </p>
                <p className={`text-sm ${textMuted}`}>
                  {new Date(activity.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Add Activity Button */}
      <div className="mt-4 flex justify-center">
        <button className="text-sm text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
          + Add Activity
        </button>
      </div>
    </div>
  );
};

export default EmployeeActivity;