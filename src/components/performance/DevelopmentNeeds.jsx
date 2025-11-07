import { useState } from 'react';
import { BookOpen, Plus, Trash2, Save, Send, Loader } from 'lucide-react';

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
  // ✅ Track if any changes were made
  const [hasChanges, setHasChanges] = useState(false);
  const [initialData, setInitialData] = useState(JSON.stringify(developmentNeeds));

  // ✅ Check if data changed
  const checkForChanges = (newNeeds) => {
    const currentData = JSON.stringify(newNeeds);
    setHasChanges(currentData !== initialData);
  };

  const handleUpdate = (index, field, value) => {
    onUpdate(index, field, value);
    
    // Check if changes were made
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
  };

  const handleDelete = (index) => {
    onDelete(index);
    setHasChanges(true);
  };

  const handleSaveDraft = async () => {
    await onSaveDraft();
    // ✅ Reset after save
    setInitialData(JSON.stringify(developmentNeeds));
    setHasChanges(false);
  };

  const handleSubmit = async () => {
    await onSubmit();
    setInitialData(JSON.stringify(developmentNeeds));
    setHasChanges(false);
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
                Identify gaps and development activities
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

      {/* Table */}
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${darkMode ? 'bg-almet-san-juan/30' : 'bg-almet-mystic/50'}`}>
              <tr className="text-xs font-semibold text-almet-waterloo dark:text-almet-bali-hai uppercase tracking-wide">
                <th className="px-4 py-3 text-left w-12">#</th>
                <th className="px-4 py-3 text-left min-w-[200px]">Competency Gap</th>
                <th className="px-4 py-3 text-left min-w-[250px]">Development Activity</th>
                <th className="px-4 py-3 text-center w-24">Progress %</th>
                <th className="px-4 py-3 text-left min-w-[200px]">Comment</th>
                {canEdit && <th className="px-4 py-3 text-center w-16">Action</th>}
              </tr>
            </thead>
            <tbody className={`divide-y ${darkMode ? 'divide-almet-comet/20' : 'divide-almet-mystic'}`}>
              {developmentNeeds.map((need, index) => (
                <DevelopmentNeedRow
                  key={index}
                  need={need}
                  index={index}
                  canEdit={canEdit}
                  darkMode={darkMode}
                  onUpdate={handleUpdate}
                  onDelete={handleDelete}
                />
              ))}
            </tbody>
          </table>
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

function DevelopmentNeedRow({ need, index, canEdit, darkMode, onUpdate, onDelete }) {
  const inputClass = `h-10 px-3 text-xs border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all ${
    darkMode 
      ? 'bg-almet-san-juan/30 border-almet-comet/30 text-white placeholder-almet-bali-hai/50' 
      : 'bg-white border-almet-bali-hai/20 text-almet-cloud-burst placeholder-almet-waterloo/50'
  } disabled:opacity-40`;

  return (
    <tr className={`${darkMode ? 'hover:bg-almet-san-juan/20' : 'hover:bg-almet-mystic/30'} transition-colors`}>
      <td className="px-4 py-3">
        <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
          {index + 1}
        </div>
      </td>
      <td className="px-4 py-3">
        <input
          type="text"
          value={need.competency_gap || ''}
          onChange={(e) => onUpdate(index, 'competency_gap', e.target.value)}
          disabled={!canEdit}
          className={`${inputClass} w-full`}
          placeholder="Identify competency gap..."
        />
      </td>
      <td className="px-4 py-3">
        <textarea
          value={need.development_activity || ''}
          onChange={(e) => onUpdate(index, 'development_activity', e.target.value)}
          disabled={!canEdit}
          rows={2}
          className={`${inputClass} w-full resize-none py-2`}
          placeholder="Describe development activity..."
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="number"
          min="0"
          max="100"
          value={need.progress || 0}
          onChange={(e) => onUpdate(index, 'progress', parseInt(e.target.value) || 0)}
          disabled={!canEdit}
          className={`${inputClass} w-full text-center font-semibold`}
        />
      </td>
      <td className="px-4 py-3">
        <input
          type="text"
          value={need.comment || ''}
          onChange={(e) => onUpdate(index, 'comment', e.target.value)}
          disabled={!canEdit}
          className={`${inputClass} w-full`}
          placeholder="Add comment..."
        />
      </td>
      {canEdit && (
        <td className="px-4 py-3 text-center">
          <button
            onClick={() => onDelete(index)}
            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </td>
      )}
    </tr>
  );
}