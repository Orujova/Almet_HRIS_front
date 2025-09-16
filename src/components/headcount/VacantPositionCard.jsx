// src/components/headcount/VacantPositionCard.jsx
import { useState } from 'react';
import { 
  MoreVertical, 
  Briefcase, 
  Users, 
  Building, 
  Calendar,
  Edit,
  Trash2,
  UserPlus,
  MapPin,
  Star
} from 'lucide-react';

const VacantPositionCard = ({ 
  position, 
  onEdit, 
  onDelete, 
  onConvert, 
  darkMode = false 
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Theme styles
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-600";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const hoverBg = darkMode ? "hover:bg-gray-700" : "hover:bg-gray-50";

  const handleEdit = () => {
    setIsDropdownOpen(false);
    onEdit(position);
  };

  const handleDelete = () => {
    setIsDropdownOpen(false);
    onDelete(position.id);
  };

  const handleConvert = () => {
    setIsDropdownOpen(false);
    onConvert(position);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getGradingLevelDisplay = (level) => {
    if (!level) return 'N/A';
    return level.replace('_', '-');
  };

  return (
    <div className={`${bgCard} rounded-lg border ${borderColor} shadow-sm hover:shadow-md transition-shadow relative`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Briefcase className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className={`text-lg font-semibold ${textPrimary} truncate`}>
                {position.job_title || 'Untitled Position'}
              </h3>
              <p className={`text-sm ${textSecondary}`}>
                Position ID: {position.position_id || position.employee_id}
              </p>
            </div>
          </div>

          {/* Actions Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`p-2 rounded-lg ${hoverBg} transition-colors`}
            >
              <MoreVertical size={16} className={textMuted} />
            </button>

            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-20">
                  <div className="py-1">
                    <button
                      onClick={handleConvert}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
                    >
                      <UserPlus size={16} className="mr-3 text-green-600" />
                      <span className={textPrimary}>Convert to Employee</span>
                    </button>
                    <button
                      onClick={handleEdit}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
                    >
                      <Edit size={16} className="mr-3 text-blue-600" />
                      <span className={textPrimary}>Edit Position</span>
                    </button>
                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center"
                    >
                      <Trash2 size={16} className="mr-3 text-red-600" />
                      <span className="text-red-600 dark:text-red-400">Delete Position</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Organizational Information */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center mb-2">
              <Building size={14} className={`${textMuted} mr-2`} />
              <span className={`text-xs font-medium ${textMuted} uppercase tracking-wider`}>
                Business Function
              </span>
            </div>
            <p className={`text-sm ${textSecondary} truncate`}>
              {position.business_function_name} ({position.business_function_code})
            </p>
          </div>

          <div>
            <div className="flex items-center mb-2">
              <MapPin size={14} className={`${textMuted} mr-2`} />
              <span className={`text-xs font-medium ${textMuted} uppercase tracking-wider`}>
                Department
              </span>
            </div>
            <p className={`text-sm ${textSecondary} truncate`}>
              {position.department_name || 'N/A'}
            </p>
          </div>
        </div>

        {/* Position Details */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center mb-2">
              <Star size={14} className={`${textMuted} mr-2`} />
              <span className={`text-xs font-medium ${textMuted} uppercase tracking-wider`}>
                Position Group
              </span>
            </div>
            <p className={`text-sm ${textSecondary} truncate`}>
              {position.position_group_name || 'N/A'}
            </p>
          </div>

          <div>
            <div className="flex items-center mb-2">
              <Briefcase size={14} className={`${textMuted} mr-2`} />
              <span className={`text-xs font-medium ${textMuted} uppercase tracking-wider`}>
                Grade Level
              </span>
            </div>
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              position.grading_level 
                ? 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
            }`}>
              {getGradingLevelDisplay(position.grading_level)}
            </span>
          </div>
        </div>

        {/* Management Information */}
        {position.reporting_to_name && (
          <div>
            <div className="flex items-center mb-2">
              <Users size={14} className={`${textMuted} mr-2`} />
              <span className={`text-xs font-medium ${textMuted} uppercase tracking-wider`}>
                Reports To
              </span>
            </div>
            <p className={`text-sm ${textSecondary}`}>
              {position.reporting_to_name} ({position.reporting_to_hc_number})
            </p>
          </div>
        )}

        {/* Job Function */}
        {position.job_function_name && (
          <div>
            <div className="flex items-center mb-2">
              <Briefcase size={14} className={`${textMuted} mr-2`} />
              <span className={`text-xs font-medium ${textMuted} uppercase tracking-wider`}>
                Job Function
              </span>
            </div>
            <p className={`text-sm ${textSecondary}`}>
              {position.job_function_name}
            </p>
          </div>
        )}

        {/* Notes */}
        {position.notes && (
          <div>
            <div className="flex items-center mb-2">
              <span className={`text-xs font-medium ${textMuted} uppercase tracking-wider`}>
                Notes
              </span>
            </div>
            <p className={`text-sm ${textSecondary} italic`}>
              {position.notes}
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center">
              <Calendar size={12} className={`${textMuted} mr-1`} />
              <span className={textMuted}>
                Created: {formatDate(position.created_at)}
              </span>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center space-x-2">
            {position.is_visible_in_org_chart && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200">
                Visible in Org Chart
              </span>
            )}
            {position.include_in_headcount && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200">
                In Headcount
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VacantPositionCard;