// src/components/headcount/FormSteps/FormStep3AdditionalInfo.jsx - Enhanced with tag management
import { Users, Tag, Search, Plus, X, Eye, EyeOff, Loader, AlertCircle } from "lucide-react";

const FormStep3AdditionalInfo = ({
  formData,
  validationErrors,
  onChange,
  lineManagerOptions = [],
  lineManagerSearch,
  setLineManagerSearch,
  loadingLineManagers = false,
  tagOptions = [],
  onAddTag,
  onRemoveTag,
  darkMode = false
}) => {
  // Theme classes
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const bgInput = darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const focusRing = "focus:ring-2 focus:ring-almet-sapphire focus:border-almet-sapphire";
  const errorBorder = "border-red-500 focus:border-red-500 focus:ring-red-500";

  // Get selected tags
  const selectedTags = tagOptions.filter(tag => formData.tag_ids.includes(tag.value));
  const availableTags = tagOptions.filter(tag => !formData.tag_ids.includes(tag.value));

  // Find selected line manager
  const selectedLineManager = lineManagerOptions.find(manager => manager.id === formData.line_manager);

  // Input component
  const FormInput = ({ label, name, type = "text", required = false, children, error, ...props }) => (
    <div className="space-y-1">
      <label className={`block text-sm font-medium ${textPrimary}`}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children || (
        <input
          type={type}
          name={name}
          value={formData[name] || ""}
          onChange={(e) => onChange(name, e.target.value)}
          className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 ${
            error ? errorBorder : `${bgInput} ${focusRing}`
          } ${textPrimary}`}
          {...props}
        />
      )}
      {error && (
        <div className="flex items-center text-red-500 text-xs mt-1">
          <AlertCircle size={12} className="mr-1" />
          {error}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center space-x-2 pb-4 border-b border-gray-200 dark:border-gray-700">
        <Users className="text-purple-500" size={20} />
        <h3 className={`text-lg font-semibold ${textPrimary}`}>Management & Additional Information</h3>
      </div>

      {/* Line Manager Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Users className="text-blue-500" size={16} />
          <h4 className={`text-sm font-medium ${textPrimary}`}>Line Manager</h4>
          <span className={`text-xs ${textMuted}`}>(Optional)</span>
        </div>

        {/* Line Manager Search */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search for line manager..."
              value={lineManagerSearch}
              onChange={(e) => setLineManagerSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors duration-200 ${bgInput} ${focusRing} ${textPrimary}`}
            />
            {loadingLineManagers && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader size={14} className="animate-spin text-gray-400" />
              </div>
            )}
          </div>

          {/* Selected Line Manager */}
          {selectedLineManager && (
            <div className={`p-3 rounded-lg border border-green-200 dark:border-green-800 ${bgCard}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`font-medium ${textPrimary}`}>{selectedLineManager.name}</p>
                  <p className={`text-sm ${textMuted}`}>
                    {selectedLineManager.job_title} • {selectedLineManager.department}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onChange('line_manager', '')}
                  className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full text-red-500 hover:text-red-600 transition-colors"
                  title="Remove line manager"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Line Manager Options */}
          {lineManagerSearch && lineManagerOptions.length > 0 && !selectedLineManager && (
            <div className={`border rounded-lg ${borderColor} max-h-48 overflow-y-auto`}>
              {lineManagerOptions.map((manager) => (
                <button
                  key={manager.id}
                  type="button"
                  onClick={() => {
                    onChange('line_manager', manager.id);
                    setLineManagerSearch('');
                  }}
                  className={`w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors`}
                >
                  <p className={`font-medium ${textPrimary}`}>{manager.name}</p>
                  <p className={`text-sm ${textMuted}`}>
                    {manager.job_title} • {manager.department}
                  </p>
                </button>
              ))}
            </div>
          )}

          {lineManagerSearch && lineManagerOptions.length === 0 && !loadingLineManagers && (
            <div className={`text-sm ${textMuted} text-center py-3`}>
              No line managers found. Try a different search term.
            </div>
          )}
        </div>
      </div>

      {/* Employee Tags Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Tag className="text-green-500" size={16} />
          <h4 className={`text-sm font-medium ${textPrimary}`}>Employee Tags</h4>
          <span className={`text-xs ${textMuted}`}>(Optional)</span>
        </div>

        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div className="space-y-2">
            <p className={`text-xs font-medium ${textSecondary}`}>Selected Tags:</p>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <span
                  key={tag.value}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-colors
                    ${tag.color 
                      ? `bg-${tag.color}-100 dark:bg-${tag.color}-900/30 text-${tag.color}-800 dark:text-${tag.color}-200 border-${tag.color}-200 dark:border-${tag.color}-700`
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-600'
                    }`}
                >
                  {tag.label}
                  <button
                    type="button"
                    onClick={() => onRemoveTag(tag.value)}
                    className="ml-2 hover:text-red-500 transition-colors"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Available Tags */}
        {availableTags.length > 0 && (
          <div className="space-y-2">
            <p className={`text-xs font-medium ${textSecondary}`}>Available Tags:</p>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => (
                <button
                  key={tag.value}
                  type="button"
                  onClick={() => onAddTag(tag.value)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border transition-colors hover:shadow-sm
                    ${tag.color 
                      ? `bg-${tag.color}-50 dark:bg-${tag.color}-900/20 text-${tag.color}-700 dark:text-${tag.color}-300 border-${tag.color}-200 dark:border-${tag.color}-600 hover:bg-${tag.color}-100 dark:hover:bg-${tag.color}-900/40`
                      : `bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600`
                    }`}
                >
                  <Plus size={12} className="mr-1" />
                  {tag.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {availableTags.length === 0 && selectedTags.length === 0 && (
          <div className={`text-sm ${textMuted} text-center py-3 bg-gray-50 dark:bg-gray-800 rounded-lg`}>
            No tags available. Contact your administrator to add employee tags.
          </div>
        )}
      </div>

      {/* Organizational Chart Visibility */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Eye className="text-indigo-500" size={16} />
          <h4 className={`text-sm font-medium ${textPrimary}`}>Organizational Chart Visibility</h4>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => onChange('is_visible_in_org_chart', !formData.is_visible_in_org_chart)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-almet-sapphire focus:ring-offset-2 ${
              formData.is_visible_in_org_chart ? 'bg-almet-sapphire' : 'bg-gray-200 dark:bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.is_visible_in_org_chart ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <div className="flex items-center space-x-2">
            {formData.is_visible_in_org_chart ? (
              <Eye className="text-green-500" size={16} />
            ) : (
              <EyeOff className="text-gray-400" size={16} />
            )}
            <span className={`text-sm ${textSecondary}`}>
              {formData.is_visible_in_org_chart 
                ? 'Visible in organizational chart' 
                : 'Hidden from organizational chart'
              }
            </span>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <FormInput
        label="Additional Notes"
        name="notes"
        required={false}
        error={validationErrors.notes}
      >
        <textarea
          name="notes"
          value={formData.notes || ""}
          onChange={(e) => onChange('notes', e.target.value)}
          rows={4}
          placeholder="Enter any additional notes about the employee..."
          className={`w-full px-3 py-2 rounded-lg border transition-colors duration-200 resize-none ${
            validationErrors.notes ? errorBorder : `${bgInput} ${focusRing}`
          } ${textPrimary}`}
        />
      </FormInput>

      {/* Information Panel */}
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="text-purple-500 mt-0.5" size={16} />
          <div className="space-y-2">
            <h4 className={`text-sm font-medium text-purple-800 dark:text-purple-300`}>
              Additional Information
            </h4>
            <ul className="text-xs text-purple-700 dark:text-purple-400 space-y-1">
              <li>• All fields in this section are optional</li>
              <li>• Line manager assignment helps establish reporting relationships</li>
              <li>• Tags can be used for filtering and categorizing employees</li>
              <li>• Org chart visibility controls whether the employee appears in visual hierarchy</li>
              <li>• Tags can be easily added or removed after employee creation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormStep3AdditionalInfo;