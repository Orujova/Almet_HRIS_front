// src/components/headcount/FormSteps/FormStep3AdditionalInfo.jsx - Enhanced with Multi-Select Tags and Image Upload
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
  Phone,
  Camera,
  Upload,
  Image as ImageIcon,
  Trash2
} from "lucide-react";
import { useTheme } from "../../common/ThemeProvider";
import FormField from "../FormComponents/FormField";
import MultiSelectDropdown from "../MultiSelectDropdown";

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
  const [showCreateTag, setShowCreateTag] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagType, setNewTagType] = useState("OTHER");
  const [creatingTag, setCreatingTag] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Theme classes
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-gray-500";
  const bgInput = darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const bgAccent = darkMode ? "bg-gray-700" : "bg-gray-50";
  const borderColor = darkMode ? "border-gray-700" : "border-gray-200";
  const focusRing = "focus:ring-2 focus:ring-almet-sapphire focus:border-almet-sapphire";

  // Initialize image preview if editing
  useEffect(() => {
    if (formData.profile_image && typeof formData.profile_image === 'string') {
      setImagePreview(formData.profile_image);
    }
  }, [formData.profile_image]);

  // Find selected line manager
  const selectedLineManager = Array.isArray(lineManagerOptions) 
    ? lineManagerOptions.find(manager => manager.id === parseInt(formData.line_manager))
    : null;

  // Tag types for filtering and creation
  const tagTypes = [
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
      target: { name: 'line_manager', value: manager.id.toString() }
    });
    setLineManagerSearch("");
    setShowLineManagerDropdown(false);
  };

  // Handle line manager search with proper debouncing
  const handleLineManagerSearchChange = useCallback((e) => {
    const value = e.target.value;
    setLineManagerSearch(value);
    setShowLineManagerDropdown(value.length >= 1);
  }, [setLineManagerSearch]);

  // Auto-trigger search when search term changes
  useEffect(() => {
    if (lineManagerSearch && lineManagerSearch.length >= 2) {
      setShowLineManagerDropdown(true);
    } else if (lineManagerSearch.length === 0) {
      setShowLineManagerDropdown(false);
    }
  }, [lineManagerSearch]);

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
      const newTag = {
        name: newTagName.trim(),
        tag_type: newTagType,
        color: getRandomTagColor(),
        is_active: true
      };
      
      if (onAddTag) {
        await onAddTag(newTag);
      }
      
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

  // Handle tag selection change from MultiSelectDropdown
  const handleTagSelectionChange = (selectedTagIds) => {
    handleInputChange({
      target: { 
        name: 'tag_ids', 
        value: selectedTagIds
      }
    });
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setUploadingImage(true);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageUrl = e.target.result;
      setImagePreview(imageUrl);
      
      // Store the file in form data
      handleInputChange({
        target: { name: 'profile_image', value: file }
      });
      
      setUploadingImage(false);
    };
    reader.readAsDataURL(file);
  };

  // Remove image
  const handleRemoveImage = () => {
    setImagePreview(null);
    handleInputChange({
      target: { name: 'profile_image', value: null }
    });
    
    // Clear file input
    const fileInput = document.getElementById('profile-image-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Format tag options for MultiSelectDropdown
  const formattedTagOptions = (tagOptions || []).map(tag => ({
    value: tag.value,
    label: tag.label,
    color: tag.color,
    description: tag.tag_type ? `Type: ${tag.tag_type}` : undefined,
    tag_type: tag.tag_type
  }));

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

      {/* Profile Image Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Camera className="text-blue-500" size={16} />
          <h4 className={`text-sm font-medium ${textPrimary}`}>Profile Image</h4>
        </div>

        <div className="flex items-start space-x-6">
          {/* Image Preview */}
          <div className="relative">
            <div className={`w-24 h-24 rounded-lg border-2 border-dashed ${borderColor} flex items-center justify-center overflow-hidden`}>
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Profile preview" 
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <ImageIcon size={24} className={textMuted} />
                  <p className={`text-xs ${textMuted} mt-1`}>No Image</p>
                </div>
              )}
              
              {/* Loading overlay */}
              {uploadingImage && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <Loader size={16} className="text-white animate-spin" />
                </div>
              )}
            </div>

            {/* Remove button */}
            {imagePreview && !uploadingImage && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                title="Remove image"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Upload controls */}
          <div className="flex-1">
            <input
              type="file"
              id="profile-image-upload"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploadingImage}
            />
            
            <div className="space-y-3">
              <label
                htmlFor="profile-image-upload"
                className={`inline-flex items-center px-4 py-2 rounded-lg border transition-colors cursor-pointer ${
                  uploadingImage 
                    ? 'opacity-50 cursor-not-allowed' 
                    : `${bgInput} ${textSecondary} hover:bg-gray-100 dark:hover:bg-gray-600`
                }`}
              >
                <Upload size={16} className="mr-2" />
                {imagePreview ? 'Change Image' : 'Upload Image'}
              </label>
              
              <div className={`text-xs ${textMuted} space-y-1`}>
                <p>• Recommended size: 400x400 pixels</p>
                <p>• Supported formats: JPG, PNG, GIF</p>
                <p>• Maximum file size: 5MB</p>
              </div>
            </div>
          </div>
        </div>
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
              value={lineManagerSearch || ""}
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
          {showLineManagerDropdown && Array.isArray(lineManagerOptions) && lineManagerOptions.length > 0 && (
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
                      <p className={`font-medium ${textPrimary} text-sm`}>{manager.name || 'Unknown'}</p>
                      <p className={`text-xs ${textMuted} mt-1`}>
                        {manager.employee_id || 'N/A'} • {manager.job_title || 'No Title'}
                      </p>
                      <div className="flex items-center space-x-3 mt-1">
                        <span className={`text-xs ${textMuted}`}>
                          <Building size={12} className="inline mr-1" />
                          {manager.department || 'N/A'}
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
          {showLineManagerDropdown && lineManagerSearch && Array.isArray(lineManagerOptions) && lineManagerOptions.length === 0 && !loadingLineManagers && (
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
                  <p className={`font-medium ${textPrimary}`}>{selectedLineManager.name || 'Unknown'}</p>
                  <p className={`text-sm ${textMuted}`}>
                    {selectedLineManager.employee_id || 'N/A'} • {selectedLineManager.job_title || 'No Title'}
                  </p>
                  <div className="flex items-center space-x-3 mt-1">
                    <span className={`text-xs ${textMuted}`}>
                      <Building size={10} className="inline mr-1" />
                      {selectedLineManager.department || 'N/A'}
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
        
        </div>

     

        {/* Multi-Select Tags Dropdown */}
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            Select Tags
          </label>
          <MultiSelectDropdown
            options={formattedTagOptions}
            selectedValues={formData.tag_ids || []}
            onChange={handleTagSelectionChange}
            placeholder="Search and select tags..."
            showColors={true}
            showDescriptions={true}
            searchable={true}
            className="w-full"
          />
          
          {formData.tag_ids && formData.tag_ids.length > 0 && (
            <div className={`text-xs ${textMuted} mt-2`}>
              {formData.tag_ids.length} tag{formData.tag_ids.length !== 1 ? 's' : ''} selected
            </div>
          )}
        </div>

        {/* No tags message */}
        {(!formattedTagOptions || formattedTagOptions.length === 0) && (
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