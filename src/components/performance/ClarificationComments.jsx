import { useState } from 'react';
import { MessageSquare, AlertCircle, ChevronDown, ChevronRight, User, Calendar, CheckCircle, Edit2, X, Send } from 'lucide-react';

export default function ClarificationComments({ comments, darkMode, canRespond, onRespond }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [respondingTo, setRespondingTo] = useState(null);
  const [response, setResponse] = useState('');

  const getCommentTypeLabel = (type) => {
    const types = {
      'OBJECTIVES': { label: 'Objectives', color: 'blue' },
      'COMPETENCIES': { label: 'Competencies', color: 'purple' },
      'MID_YEAR': { label: 'Mid-Year Review', color: 'orange' },
      'END_YEAR': { label: 'End-Year Review', color: 'green' },
      'DEVELOPMENT': { label: 'Development Needs', color: 'indigo' },
      'GENERAL': { label: 'General', color: 'gray' }
    };
    return types[type] || types['GENERAL'];
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30',
      purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800/30',
      orange: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/30',
      green: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/30',
      indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800/30',
      gray: 'bg-almet-waterloo/10 text-almet-waterloo border-almet-waterloo/20'
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

  const handleRespond = async (commentId) => {
    if (!response.trim()) return;
    
    await onRespond(commentId, response);
    setRespondingTo(null);
    setResponse('');
  };

  if (!comments || comments.length === 0) {
    return null;
  }

  const textareaClass = `w-full px-4 py-3 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-almet-sapphire/30 resize-none transition-all ${
    darkMode 
      ? 'bg-almet-san-juan/30 border-almet-comet/30 text-white placeholder-almet-bali-hai/50' 
      : 'bg-white border-almet-bali-hai/20 text-almet-cloud-burst placeholder-almet-waterloo/50'
  }`;

  return (
    <div className={`${darkMode ? 'bg-almet-cloud-burst/60 border-almet-comet/30' : 'bg-white border-almet-mystic'} rounded-xl border shadow-sm overflow-hidden`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full p-5 flex items-center justify-between ${darkMode ? 'hover:bg-almet-san-juan/20' : 'hover:bg-almet-mystic/30'} transition-colors`}
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-red-600/10 dark:bg-red-600/20">
            <MessageSquare className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="text-left">
            <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
              Clarification Requests
            </h3>
            <p className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} mt-0.5`}>
              {comments.length} clarification{comments.length !== 1 ? 's' : ''} requested
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800/30 text-xs font-semibold">
            {comments.length}
          </div>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-almet-waterloo" />
          ) : (
            <ChevronRight className="w-5 h-5 text-almet-waterloo" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className={`border-t ${darkMode ? 'border-almet-comet/30' : 'border-almet-mystic'}`}>
          <div className="p-5 space-y-4">
            {comments.map((comment, index) => {
              const typeInfo = getCommentTypeLabel(comment.comment_type);
              const colorClasses = getColorClasses(typeInfo.color);
              const isResponding = respondingTo === comment.id;
              
              return (
                <div 
                  key={comment.id || index}
                  className={`${darkMode ? 'bg-almet-san-juan/30 border-almet-comet/30' : 'bg-almet-mystic/50 border-almet-bali-hai/10'} rounded-xl p-4 border`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${colorClasses}`}>
                        {typeInfo.label}
                      </span>
                      {comment.is_resolved && (
                        <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/30 flex items-center gap-1.5">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Resolved
                        </span>
                      )}
                    </div>
                    
                    {canRespond && !comment.is_resolved && !isResponding && (
                      <button
                        onClick={() => setRespondingTo(comment.id)}
                        className="h-9 px-3 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 flex items-center gap-2 text-xs font-medium transition-all"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Respond
                      </button>
                    )}
                  </div>

                  <div className={`${darkMode ? 'bg-almet-cloud-burst/60 border-almet-comet/30' : 'bg-white border-almet-bali-hai/10'} rounded-xl p-4 mb-3 border`}>
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                      <p className={`text-sm ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} leading-relaxed`}>
                        {comment.comment}
                      </p>
                    </div>
                  </div>

                  <div className={`flex items-center gap-3 text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} mb-3`}>
                    {comment.requested_by_name && (
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span>Requested by: <span className="font-medium">{comment.requested_by_name}</span></span>
                      </div>
                    )}
                    {comment.created_at && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{formatDate(comment.created_at)}</span>
                      </div>
                    )}
                  </div>

                  {isResponding && (
                    <div className="space-y-3">
                      <textarea
                        value={response}
                        onChange={(e) => setResponse(e.target.value)}
                        placeholder="Enter your response..."
                        className={textareaClass}
                        rows={3}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRespond(comment.id)}
                          disabled={!response.trim()}
                          className="flex-1 h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-40 transition-all shadow-sm"
                        >
                          <Send className="w-4 h-4" />
                          Submit Response
                        </button>
                        <button
                          onClick={() => {
                            setRespondingTo(null);
                            setResponse('');
                          }}
                          className="h-10 px-4 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 rounded-xl transition-all"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {comment.resolution_comment && (
                    <div className={`mt-3 p-3 rounded-xl ${darkMode ? 'bg-emerald-900/20 border-emerald-800/30' : 'bg-emerald-50 border-emerald-200'} border`}>
                      <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                        Manager Response:
                      </p>
                      <p className={`text-sm ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'}`}>
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