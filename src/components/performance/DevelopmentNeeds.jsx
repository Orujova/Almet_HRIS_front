import { useState } from 'react';
import { BookOpen, Plus, Trash2, Save, Send, Loader, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';

export default function DevelopmentNeeds({
  developmentNeeds,
  competencies,
  canEdit,
  loading,
  darkMode,
  onUpdate,
  onAdd,
  onDelete,
  onSaveDraft,
  onSubmit
}) {
  const [hasChanges, setHasChanges] = useState(false);
  const [initialData, setInitialData] = useState(JSON.stringify(developmentNeeds));
  const [expandedRows, setExpandedRows] = useState({});

  const checkForChanges = (newNeeds) => {
    const currentData = JSON.stringify(newNeeds);
    setHasChanges(currentData !== initialData);
  };

  const handleUpdate = (index, field, value) => {
    onUpdate(index, field, value);
    
    const updatedNeeds = [...developmentNeeds];
    updatedNeeds[index] = {
      ...updatedNeeds[index],
      [field]: value
    };
    checkForChanges(updatedNeeds);
  };

  const handleAdd = () => {
    onAdd();
    setHasChanges(true);
    // ✅ Auto-expand the newly added row (last index)
    const newIndex = developmentNeeds.length;
    setExpandedRows(prev => ({
      ...prev,
      [newIndex]: true
    }));
  };

  const handleDelete = (index) => {
    onDelete(index);
    setHasChanges(true);
  };

  const handleSaveDraft = async () => {
    await onSaveDraft();
    setInitialData(JSON.stringify(developmentNeeds));
    setHasChanges(false);
  };

  const handleSubmit = async () => {
    await onSubmit();
    setInitialData(JSON.stringify(developmentNeeds));
    setHasChanges(false);
  };

  const toggleRow = (index) => {
    setExpandedRows(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const DevelopmentNeedRow = ({ need, index }) => {
    const isExpanded = expandedRows[index];

    const inputClass = `h-10 px-3 text-xs border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all ${
      darkMode 
        ? 'bg-almet-san-juan/30 border-almet-comet/30 text-white placeholder-almet-bali-hai/50' 
        : 'bg-white border-almet-bali-hai/20 text-almet-cloud-burst placeholder-almet-waterloo/50'
    } disabled:opacity-40`;

    return (
      <div className={`border-b ${darkMode ? 'border-almet-comet/20' : 'border-almet-mystic'}`}>
        {/* Compact Row */}
        <div className={`p-4 ${darkMode ? 'hover:bg-almet-san-juan/20' : 'hover:bg-almet-mystic/30'} transition-colors`}>
          <div className="flex items-start gap-4">
            {/* Index Badge */}
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
              {index + 1}
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Title Row */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  {canEdit && isExpanded ? (
                    <input
                      type="text"
                      value={need.competency_gap || ''}
                      onChange={(e) => handleUpdate(index, 'competency_gap', e.target.value)}
                      className={`${inputClass} w-full font-medium`}
                      placeholder="Identify competency gap..."
                    />
                  ) : (
                    <>
                      <h4 className={`text-sm font-bold mb-1 ${darkMode ? 'text-white' : 'text-almet-cloud-burst'} ${isExpanded ? '' : 'line-clamp-1'}`}>
                        {need.competency_gap || 'Untitled Development Need'}
                      </h4>
                      {!isExpanded && (
                        <p className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} line-clamp-2`}>
                          {need.development_activity || 'No development activity described'}
                        </p>
                      )}
                    </>
                  )}
                </div>

                {/* Expand/Collapse Button */}
                <button
                  onClick={() => toggleRow(index)}
                  className={`p-2 rounded-lg ${darkMode ? 'hover:bg-almet-comet/30' : 'hover:bg-gray-100'} transition-colors flex-shrink-0`}
                  title={isExpanded ? 'Collapse' : 'Expand'}
                >
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-almet-waterloo" />
                  )}
                </button>
              </div>

              {/* Stats Grid - Always Visible */}
              <div className="grid grid-cols-2 gap-3">
                {/* Progress */}
                <div className={`${darkMode ? 'bg-almet-san-juan/30' : 'bg-almet-mystic/50'} rounded-lg p-2.5`}>
                  <div className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} mb-1 flex items-center gap-1.5`}>
                    <TrendingUp className="w-3.5 h-3.5" />
                    Progress
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`text-base font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                      {need.progress || 0}%
                    </div>
                    <div className={`flex-1 h-2 rounded-full ${darkMode ? 'bg-almet-comet' : 'bg-gray-200'}`}>
                      <div 
                        className="h-2 rounded-full bg-indigo-500 transition-all duration-300"
                        style={{ width: `${need.progress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Comment Preview */}
                <div className={`${darkMode ? 'bg-almet-san-juan/30' : 'bg-almet-mystic/50'} rounded-lg p-2.5`}>
                  <div className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} mb-1`}>
                    Comment
                  </div>
                  <div className={`text-xs ${darkMode ? 'text-white' : 'text-almet-cloud-burst'} ${isExpanded ? '' : 'line-clamp-1'}`}>
                    {need.comment || <span className="italic text-almet-waterloo/70">No comment</span>}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className={`mt-4 ${darkMode ? 'bg-almet-san-juan/20 border-almet-comet/30' : 'bg-gray-50 border-gray-200'} border rounded-xl p-4 space-y-4`}>
                  {/* Development Activity */}
                  <div>
                    <h5 className={`text-xs font-semibold ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} uppercase tracking-wide mb-2`}>
                      Development Activity
                    </h5>
                    {canEdit ? (
                      <textarea
                        value={need.development_activity || ''}
                        onChange={(e) => handleUpdate(index, 'development_activity', e.target.value)}
                        rows={4}
                        className={`${inputClass} w-full resize-none py-2 leading-relaxed`}
                        placeholder="Describe development activity in detail (e.g., training courses, mentorship, workshops, certifications)..."
                      />
                    ) : (
                      <p className={`text-sm ${darkMode ? 'text-white' : 'text-almet-cloud-burst'} leading-relaxed whitespace-pre-wrap`}>
                        {need.development_activity || 'No development activity described'}
                      </p>
                    )}
                  </div>

                  {/* Edit Controls Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={`block text-xs font-semibold ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} mb-1.5`}>
                        Progress %
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={need.progress || 0}
                        onChange={(e) => handleUpdate(index, 'progress', parseInt(e.target.value) || 0)}
                        disabled={!canEdit}
                        className={`${inputClass} w-full text-center font-semibold`}
                      />
                    </div>

                    <div>
                      <label className={`block text-xs font-semibold ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} mb-1.5`}>
                        Comment
                      </label>
                      <input
                        type="text"
                        value={need.comment || ''}
                        onChange={(e) => handleUpdate(index, 'comment', e.target.value)}
                        disabled={!canEdit}
                        className={`${inputClass} w-full`}
                        placeholder="Additional notes..."
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  {canEdit && (
                    <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-almet-comet/30">
                      <button
                        onClick={() => handleDelete(index)}
                        className="h-9 px-4 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-colors flex items-center gap-2 text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`${darkMode ? 'bg-almet-cloud-burst/60 border-almet-comet/30' : 'bg-white border-almet-mystic'} rounded-xl border shadow-sm overflow-hidden`}>
      {/* Header */}
      <div className={`p-5 border-b ${darkMode ? 'border-almet-comet/30' : 'border-almet-mystic'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-indigo-600/10 dark:bg-indigo-600/20">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                Development Needs
              </h3>
              <p className={`text-xs ${darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo'} mt-0.5`}>
                Identify competency gaps and plan development activities
              </p>
            </div>
          </div>
          
          {canEdit && (
            <button
              onClick={handleAdd}
              disabled={loading}
              className="h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium disabled:opacity-50 flex items-center gap-2 transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add Need
            </button>
          )}
        </div>
      </div>

      {/* Development Needs List */}
      {developmentNeeds.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-almet-waterloo/30" />
          <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai font-medium mb-1">
            No development needs identified
          </p>
          {canEdit && (
            <p className="text-xs text-almet-waterloo/60 dark:text-almet-bali-hai/60">
              Click "Add Need" to create development plan
            </p>
          )}
        </div>
      ) : (
        <div>
          {developmentNeeds.map((need, index) => (
            <DevelopmentNeedRow key={index} need={need} index={index} />
          ))}
        </div>
      )}

      {/* Actions - Only show if changes were made */}
      {developmentNeeds.length > 0 && canEdit && hasChanges && (
        <div className={`p-5 border-t flex gap-3 ${darkMode ? 'border-almet-comet/30 bg-amber-900/10' : 'border-almet-mystic bg-amber-50'}`}>
          <div className="flex items-center gap-2 flex-1">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></div>
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
              Unsaved changes
            </span>
          </div>
          
          <button
            onClick={handleSaveDraft}
            disabled={loading}
            className={`h-10 px-4 rounded-xl text-sm font-medium flex items-center gap-2 transition-all ${
              darkMode 
                ? 'bg-almet-comet/50 hover:bg-almet-comet text-white' 
                : 'bg-almet-waterloo/10 hover:bg-almet-waterloo/20 text-almet-cloud-burst'
            } disabled:opacity-40`}
          >
            {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save Draft
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="h-10 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-medium flex items-center gap-2 disabled:opacity-40 transition-all shadow-sm"
          >
            <Send className="w-4 h-4" />
            Submit
          </button>
        </div>
      )}
    </div>
  );
}