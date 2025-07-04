// src/components/headcount/FormSteps/FormStep3AdditionalInfo.jsx - Enhanced with Full API Integration
import { useState, useEffect, useCallback } from "react";
import { 
  Users, 
  Tag, 
  Search, 
  Plus, 
  X, 
  Eye, 
  EyeOff, 
  Loader, 
  AlertCircle, 
  Check,
  ChevronDown,
  Filter,
  UserCheck,
  Building,
  Mail,
  Phone
} from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";
import FormField from "../FormComponents/FormField";

const FormStep3AdditionalInfo = ({
  formData,
  handleInputChange,
  validationErrors,
  lineManagerOptions = [],
  lineManagerSearch,
  setLineManagerSearch,
  loadingLineManagers = false,
  tagOptions = [],
  onAddTag,
  onRemoveTag,
  loading = {}
}) => {
  const { darkMode } = useTheme();
  
  // Local state
  const [showLineManagerDropdown, setShowLineManagerDropdown] = useState(false);
  const [tagSearchTerm, setTagSearchTerm] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagType, setNewTagType] = useState("OTHER");
  const [creatingTag, setCreatingTag] = useState(false);

  // Theme classes
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const bgInput = darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const bgAccent = darkMode ? "bg-gray-700" : "bg-gray-50";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const focusRing = "focus:ring-2 focus:ring-almet-sapphire focus:border-almet-sapphire";
  const errorBorder = "border-red-500 focus:border-red-500 focus:ring-red-500";

  // Get selected tags
  const selectedTags = tagOptions.filter(tag => 
    formData.tag_ids && formData.tag_ids.includes(tag.value)
  );

  // Filter available tags
  const availableTags = tagOptions.filter(tag => {
    const isNotSelected = !formData.tag_ids || !formData.tag_ids.includes(tag.value);
    const matchesSearch = !tagSearchTerm || 
      tag.label.toLowerCase().includes(tagSearchTerm.toLowerCase());
    const matchesFilter = tagFilter === "all" || tag.tag_type === tagFilter;
    
    return isNotSelected && matchesSearch && matchesFilter;
  });

  // Find selected line manager
  const selectedLineManager = lineManagerOptions.find(manager => 
    manager.id === formData.line_manager
  );

  // Tag types for filtering
  const tagTypes = [
    { value: "all", label: "All Types" },
    { value: "SKILL", label: "Skills" },
    { value: "DEPARTMENT", label: "Department" },
    { value: "PROJECT", label: "Projects" },
    { value: "CERTIFICATION", label: "Certifications" },
    { value: "LEAVE", label: "Leave Types" },
    { value: "OTHER", label: "Other" }
  ];

  // Handle line manager selection
  const handleLineManagerSelect = (manager) => {
    handleInputChange({
      target: { name: 'line_manager', value: manager.id }
    });
    setLineManagerSearch("");
    setShowLineManagerDropdown(false);
  };

  // Handle line manager search
  const handleLineManagerSearchChange = (e) => {
    const value = e.target.value;
    setLineManagerSearch(value);
    setShowLineManagerDropdown(value.length >= 2);
  };

  // Clear line manager
  const clearLineManager = () => {
    handleInputChange({
      target: { name: 'line_manager', value: '' }
    });
    setLineManagerSearch("");
  };

  // Handle tag creation
  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    
    setCreatingTag(true);
    try {
      // Create new tag via API
      const newTag = {
        name: newTagName.trim(),
        tag_type: newTagType,
        color: getRandomTagColor(),
        is_active: true
      };
      
      // This would be handled by the parent component
      if (onAddTag) {
        await onAddTag(newTag);
      }
      
      // Reset form
      setNewTagName("");
      setNewTagType("OTHER");
      setShowCreateTag(false);
    } catch (error) {
      console.error('Failed to create tag:', error);
    } finally {
      setCreatingTag(false);
    }
  };

  // Get random color for new tags
  const getRandomTagColor = () => {
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
      '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Get tag color classes
  const getTagColorClasses = (color, isSelected = false) => {
    if (!color) {
      return isSelected 
        ? 'bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200'
        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600';
    }
    
    // Convert hex to Tailwind-like classes (simplified)
    const baseColor = color.startsWith('#') ? color.slice(1) : color;
    return isSelected
      ? `bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700`
      : `bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-600`;
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center space-x-2 pb-4 border-b border-gray-200 dark:border-gray-700">
        <Users className="text-purple-500" size={20} />
        <h3 className={`text-lg font-semibold ${textPrimary}`}>
          Management & Additional Information
        </h3>
        <span className={`text-xs ${textMuted} bg-purple-100 dark:bg-purple-900/20 px-2 py-1 rounded-full`}>
          Optional
        </span>
      </div>

      {/* Line Manager Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="text-blue-500" size={16} />
            <h4 className={`text-sm font-medium ${textPrimary}`}>Line Manager Assignment</h4>
          </div>
          {selectedLineManager && (
            <button
              type="button"
              onClick={clearLineManager}
              className="text-xs text-red-500 hover:text-red-600 transition-colors"
            >
              Clear Selection
            </button>
          )}
        </div>

        {/* Line Manager Search */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search for line manager by name, employee ID, or department..."
              value={lineManagerSearch}
              onChange={handleLineManagerSearchChange}
              className={`w-full pl-10 pr-10 py-3 rounded-lg border transition-colors duration-200 ${bgInput} ${focusRing} ${textPrimary} text-sm`}
            />
            {loadingLineManagers && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <Loader size={16} className="animate-spin text-gray-400" />
              </div>
            )}
          </div>

          {/* Line Manager Dropdown */}
          {showLineManagerDropdown && lineManagerOptions.length > 0 && (
            <div className={`absolute z-20 w-full mt-1 ${bgCard} border ${borderColor} rounded-lg shadow-lg max-h-64 overflow-y-auto`}>
              {lineManagerOptions.map((manager) => (
                <button
                  key={manager.id}
                  type="button"
                  onClick={() => handleLineManagerSelect(manager)}
                  className={`w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users size={16} className="text-almet-sapphire" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium ${textPrimary} text-sm`}>{manager.name}</p>
                      <p className={`text-xs ${textMuted} mt-1`}>
                        {manager.employee_id} • {manager.job_title}
                      </p>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className={`text-xs ${textMuted}`}>
                          <Building size={12} className="inline mr-1" />
                          {manager.department}
                        </span>
                        {manager.direct_reports_count > 0 && (
                          <span className={`text-xs ${textMuted}`}>
                            <UserCheck size={12} className="inline mr-1" />
                            {manager.direct_reports_count} reports
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results message */}
          {showLineManagerDropdown && lineManagerSearch && lineManagerOptions.length === 0 && !loadingLineManagers && (
            <div className={`absolute z-20 w-full mt-1 ${bgCard} border ${borderColor} rounded-lg p-4 text-center`}>
              <p className={`text-sm ${textMuted}`}>
                No line managers found. Try a different search term.
              </p>
            </div>
          )}
        </div>

        {/* Selected Line Manager Display */}
        {selectedLineManager && (
          <div className={`p-4 rounded-lg border border-green-200 dark:border-green-800 ${bgAccent}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Users size={18} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className={`font-medium ${textPrimary}`}>{selectedLineManager.name}</p>
                  <p className={`text-sm ${textMuted}`}>
                    {selectedLineManager.employee_id} • {selectedLineManager.job_title}
                  </p>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className={`text-xs ${textMuted}`}>
                      <Building size={10} className="inline mr-1" />
                      {selectedLineManager.department}
                    </span>
                    {selectedLineManager.email && (
                      <span className={`text-xs ${textMuted}`}>
                        <Mail size={10} className="inline mr-1" />
                        {selectedLineManager.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={clearLineManager}
                className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full text-red-500 hover:text-red-600 transition-colors"
                title="Remove line manager"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Employee Tags Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Tag className="text-green-500" size={16} />
            <h4 className={`text-sm font-medium ${textPrimary}`}>Employee Tags</h4>
          </div>
          <button
            type="button"
            onClick={() => setShowCreateTag(!showCreateTag)}
            className="text-xs text-blue-500 hover:text-blue-600 transition-colors flex items-center"
          >
            <Plus size={12} className="mr-1" />
            Create New Tag
          </button>
        </div>

        {/* Create New Tag Form */}
        {showCreateTag && (
          <div className={`p-4 border ${borderColor} rounded-lg ${bgAccent}`}>
            <h5 className={`text-sm font-medium ${textPrimary} mb-3`}>Create New Tag</h5>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Tag name"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                className={`px-3 py-2 rounded border ${bgInput} ${textPrimary} text-sm ${focusRing}`}
              />
              <select
                value={newTagType}
                onChange={(e) => setNewTagType(e.target.value)}
                className={`px-3 py-2 rounded border ${bgInput} ${textPrimary} text-sm ${focusRing}`}
              >
                {tagTypes.slice(1).map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim() || creatingTag}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  {creatingTag ? <Loader size={14} className="animate-spin mx-auto" /> : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateTag(false)}
                  className="px-3 py-2 bg-gray-500 text-white rounded text-sm hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tag Filter and Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search tags..."
              value={tagSearchTerm}
              onChange={(e) => setTagSearchTerm(e.target.value)}
              className={`w-full pl-9 pr-3 py-2 text-sm rounded border ${bgInput} ${textPrimary} ${focusRing}`}
            />
          </div>
          <select
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className={`px-3 py-2 rounded border ${bgInput} ${textPrimary} text-sm ${focusRing}`}
          >
            {tagTypes.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        {/* Selected Tags */}
        {selectedTags.length > 0 && (
          <div className="space-y-2">
            <p className={`text-xs font-medium ${textSecondary}`}>
              Selected Tags ({selectedTags.length}):
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <span
                  key={tag.value}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors ${getTagColorClasses(tag.color, true)}`}
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
            <p className={`text-xs font-medium ${textSecondary}`}>
              Available Tags ({availableTags.length}):
            </p>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {availableTags.map((tag) => (
                <button
                  key={tag.value}
                  type="button"
                  onClick={() => onAddTag(tag.value)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium transition-colors hover:shadow-sm ${getTagColorClasses(tag.color, false)}`}
                >
                  <Plus size={10} className="mr-1" />
                  {tag.label}
                  {tag.tag_type && (
                    <span className={`ml-1 text-[10px] opacity-75`}>
                      ({tag.tag_type})
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No tags message */}
        {availableTags.length === 0 && selectedTags.length === 0 && (
          <div className={`text-center py-6 ${bgAccent} rounded-lg border ${borderColor}`}>
            <Tag size={32} className={`mx-auto mb-3 ${textMuted} opacity-50`} />
            <p className={`text-sm ${textMuted}`}>
              No tags available. Create a new tag to get started.
            </p>
          </div>
        )}
      </div>

      {/* Organizational Chart Visibility */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Eye className="text-indigo-500" size={16} />
          <h4 className={`text-sm font-medium ${textPrimary}`}>Organization Chart Visibility</h4>
        </div>

        <div className={`p-4 rounded-lg border ${borderColor} ${bgAccent}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => handleInputChange({
                  target: { name: 'is_visible_in_org_chart', value: !formData.is_visible_in_org_chart }
                })}
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
                    ? 'Employee will appear in organization chart' 
                    : 'Employee will be hidden from organization chart'
                  }
                </span>
              </div>
            </div>
          </div>
          
          <div className={`mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded text-xs ${textMuted}`}>
            <p>
              <strong>Note:</strong> Hiding an employee from the org chart will not affect their 
              reporting relationships or access to systems. This setting only controls visibility 
              in organizational hierarchy displays.
            </p>
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <AlertCircle className="text-orange-500" size={16} />
          <h4 className={`text-sm font-medium ${textPrimary}`}>Additional Notes</h4>
        </div>

        <FormField
          label=""
          name="notes"
          type="textarea"
          value={formData.notes || ""}
          onChange={handleInputChange}
          placeholder="Enter any additional notes, special instructions, or relevant information about the employee..."
          rows={4}
          validationError={validationErrors.notes}
          helpText="These notes are visible to HR administrators and can include onboarding instructions, special accommodations, or other relevant information."
        />
      </div>

      {/* Information Panel */}
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <AlertCircle className="text-purple-500 mt-0.5 flex-shrink-0" size={16} />
          <div className="space-y-2">
            <h4 className={`text-sm font-medium text-purple-800 dark:text-purple-300`}>
              Additional Information Guidelines
            </h4>
            <ul className="text-xs text-purple-700 dark:text-purple-400 space-y-1">
              <li>• All fields in this section are completely optional</li>
              <li>• Line manager assignment helps establish clear reporting relationships</li>
              <li>• Tags are useful for filtering, categorizing, and managing employees</li>
              <li>• Organization chart visibility can be toggled anytime after creation</li>
              <li>• Notes are private and only visible to authorized HR personnel</li>
              <li>• You can modify all these settings after employee creation</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Click outside handler for line manager dropdown */}
      {showLineManagerDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowLineManagerDropdown(false)}
        />
      )}
    </div>
  );
};

export default FormStep3AdditionalInfo;