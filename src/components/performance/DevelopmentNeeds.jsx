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
  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border shadow-sm overflow-hidden`}>
      {/* Header - Kompakt */}
      <div className={`p-4 border-b ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Development Needs
              </h3>
              <p className="text-[10px] text-gray-600 dark:text-gray-400">
                Identify gaps and development activities
              </p>
            </div>
          </div>
          
          {canEdit && (
            <button
              onClick={onAdd}
              disabled={loading}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-xs font-medium disabled:opacity-50 flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {developmentNeeds.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">No development needs identified</p>
          {canEdit && (
            <p className="text-[10px] text-gray-400 dark:text-gray-500">
              Click "Add" to create development plan
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${darkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
              <tr className="text-[10px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                <th className="px-3 py-2 text-left w-10">#</th>
                <th className="px-3 py-2 text-left min-w-[200px]">Competency Gap</th>
                <th className="px-3 py-2 text-left min-w-[250px]">Development Activity</th>
                <th className="px-3 py-2 text-center w-24">Progress %</th>
                <th className="px-3 py-2 text-left min-w-[200px]">Comment</th>
                {canEdit && <th className="px-3 py-2 text-center w-16">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {developmentNeeds.map((need, index) => (
                <DevelopmentNeedRow
                  key={index}
                  need={need}
                  index={index}
                  canEdit={canEdit}
                  darkMode={darkMode}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Actions - Kompakt */}
      {developmentNeeds.length > 0 && canEdit && (
        <div className={`p-4 border-t ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
          <div className="flex gap-2">
            <button
              onClick={onSaveDraft}
              disabled={loading}
              className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-xs font-medium disabled:opacity-50 flex items-center gap-1.5 transition-colors"
            >
              {loading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Draft
            </button>
            
            <button
              onClick={onSubmit}
              disabled={loading}
              className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium flex items-center gap-1.5 disabled:opacity-50 transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
              Submit
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function DevelopmentNeedRow({ need, index, canEdit, darkMode, onUpdate, onDelete }) {
  return (
    <tr className={`${darkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'} transition-colors`}>
      <td className="px-3 py-2.5">
        <div className="w-6 h-6 rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold">
          {index + 1}
        </div>
      </td>
      <td className="px-3 py-2.5">
        <input
          type="text"
          value={need.competency_gap || ''}
          onChange={(e) => onUpdate(index, 'competency_gap', e.target.value)}
          disabled={!canEdit}
          className={`w-full px-2 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
          } disabled:opacity-50 transition-colors`}
          placeholder="Identify competency gap..."
        />
      </td>
      <td className="px-3 py-2.5">
        <textarea
          value={need.development_activity || ''}
          onChange={(e) => onUpdate(index, 'development_activity', e.target.value)}
          disabled={!canEdit}
          rows={2}
          className={`w-full px-2 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
          } disabled:opacity-50 transition-colors resize-none`}
          placeholder="Describe development activity..."
        />
      </td>
      <td className="px-3 py-2.5">
        <input
          type="number"
          min="0"
          max="100"
          value={need.progress || 0}
          onChange={(e) => onUpdate(index, 'progress', parseInt(e.target.value) || 0)}
          disabled={!canEdit}
          className={`w-full px-2 py-1.5 text-xs border rounded-md text-center font-semibold focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
          } disabled:opacity-50 transition-colors`}
        />
      </td>
      <td className="px-3 py-2.5">
        <input
          type="text"
          value={need.comment || ''}
          onChange={(e) => onUpdate(index, 'comment', e.target.value)}
          disabled={!canEdit}
          className={`w-full px-2 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 ${
            darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
          } disabled:opacity-50 transition-colors`}
          placeholder="Add comment..."
        />
      </td>
      {canEdit && (
        <td className="px-3 py-2.5 text-center">
          <button
            onClick={() => onDelete(index)}
            className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </td>
      )}
    </tr>
  );
}