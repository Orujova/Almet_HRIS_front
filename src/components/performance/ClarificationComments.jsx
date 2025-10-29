import { useState } from 'react';
import { MessageSquare, AlertCircle, ChevronDown, ChevronRight, User, Calendar, CheckCircle } from 'lucide-react';

export default function ClarificationComments({ comments, darkMode }) {
  const [isExpanded, setIsExpanded] = useState(true);

  const getCommentTypeLabel = (type) => {
    const types = {
      'OBJECTIVES': { label: 'Objectives', color: 'blue' },
      'COMPETENCIES': { label: 'Competencies', color: 'purple' },
      'MID_YEAR': { label: 'Mid-Year Review', color: 'orange' },
      'END_YEAR': { label: 'End-Year Review', color: 'green' },
      'DEVELOPMENT': { label: 'Development Needs', color: 'yellow' },
      'GENERAL': { label: 'General', color: 'gray' }
    };
    return types[type] || types['GENERAL'];
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
      purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800',
      orange: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800',
      green: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
      yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
      gray: 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/30 dark:text-gray-400 dark:border-gray-800'
    };
    return colors[color] || colors['gray'];
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!comments || comments.length === 0) {
    return null;
  }

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border shadow-sm overflow-hidden`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full p-4 flex items-center justify-between ${darkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'} transition-colors`}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Clarification Requests
            </h3>
            <p className="text-[10px] text-gray-600 dark:text-gray-400">
              {comments.length} clarification{comments.length !== 1 ? 's' : ''} requested
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-xs font-semibold">
            {comments.length}
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          <div className="p-4 space-y-3">
            {comments.map((comment, index) => {
              const typeInfo = getCommentTypeLabel(comment.comment_type);
              const colorClasses = getColorClasses(typeInfo.color);
              
              return (
                <div 
                  key={comment.id || index}
                  className={`${darkMode ? 'bg-gray-750' : 'bg-gray-50'} rounded-lg p-3 border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-semibold border ${colorClasses}`}>
                        {typeInfo.label}
                      </span>
                      {comment.is_resolved && (
                        <span className="px-2 py-1 rounded-md text-[10px] font-semibold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Resolved
                        </span>
                      )}
                    </div>
                  </div>

                  <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-md p-3 mb-2`}>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                        {comment.comment}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-[10px] text-gray-500 dark:text-gray-400">
                    {comment.requested_by_name && (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>Requested by: <span className="font-medium">{comment.requested_by_name}</span></span>
                      </div>
                    )}
                    {comment.created_at && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(comment.created_at)}</span>
                      </div>
                    )}
                  </div>

                  {comment.resolution_comment && (
                    <div className={`mt-2 p-2 rounded-md ${darkMode ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'} border`}>
                      <p className="text-[10px] font-semibold text-green-700 dark:text-green-400 mb-1">
                        Resolution:
                      </p>
                      <p className="text-xs text-gray-700 dark:text-gray-300">
                        {comment.resolution_comment}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}