// src/components/headcount/FormSteps/FormStep3AdditionalInfo.jsx - Compact & User-Friendly Design
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
  Trash2,
  Calendar,
  Award
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

  // Theme classes with Almet colors
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-gray-300" : "text-almet-waterloo";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-comet";
  const bgInput = darkMode ? "bg-gray-700 border-gray-600" : "bg-white border-almet-bali-hai";
  const bgCard = darkMode ? "bg-gray-800" : "bg-white";
  const bgAccent = darkMode ? "bg-gray-700" : "bg-almet-mystic";
  const borderColor = darkMode ? "border-gray-700" : "border-almet-bali-hai";
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
    <div className="space-y-4 relative">
      {/* Section Header */}
      <div className="flex justify-between items-center border-b border-almet-bali-hai dark:border-gray-700 pb-2 mb-4">
        <h2 className={`text-base font-bold ${textPrimary}`}>
          Additional Information
        </h2>
        <div className="text-[10px] px-2 py-1 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 text-almet-sapphire rounded font-medium">
          Step 3 of 4 (Optional)
        </div>
      </div>

      {/* Profile Image Section */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <Camera className="text-almet-sapphire" size={12} />
          <h4 className={`text-xs font-medium ${textPrimary}`}>Profile Image</h4>
          <span className={`text-[10px] ${textMuted} ml-auto`}>Optional</span>
        </div>

        <div className="flex items-center space-x-4">
          {/* Image Preview */}
          <div className="relative flex-shrink-0">
            <div className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
              imagePreview 
                ? 'border-almet-sapphire/30 shadow-md' 
                : `border-dashed ${borderColor} bg-almet-mystic/50 dark:bg-gray-800`
            }`}>
              {imagePreview ? (
                <div className="relative w-full h-full group">
                  <img 
                    src={imagePreview} 
                    alt="Profile preview" 
                    className="w-full h-full object-cover"
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                    <Camera size={12} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center">
                  <ImageIcon size={14} className={`${textMuted} mb-1`} />
                  <p className={`text-[9px] ${textMuted} font-medium`}>No Image</p>
                </div>
              )}
              
              {/* Loading overlay */}
              {uploadingImage && (
                <div className="absolute inset-0 bg-almet-sapphire/90 flex items-center justify-center">
                  <Loader size={12} className="text-white animate-spin" />
                </div>
              )}
            </div>

            {/* Remove button */}
            {imagePreview && !uploadingImage && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-1 -right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-sm"
                title="Remove image"
              >
                <X size={8} />
              </button>
            )}
          </div>

          {/* Upload Controls */}
          <div className="flex-1">
            <input
              type="file"
              id="profile-image-upload"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploadingImage}
            />
            
            <div className="space-y-2">
              {/* Upload Button */}
              <label
                htmlFor="profile-image-upload"
                className={`inline-flex items-center px-3 py-1.5 rounded-md transition-all duration-200 cursor-pointer text-xs font-medium ${
                  uploadingImage 
                    ? 'opacity-50 cursor-not-allowed bg-gray-300 text-gray-500' 
                    : 'bg-almet-sapphire hover:bg-almet-astral text-white shadow-sm hover:shadow-md'
                }`}
              >
                <Upload size={10} className="mr-1.5" />
                {uploadingImage ? 'Uploading...' : imagePreview ? 'Change Image' : 'Upload Image'}
              </label>
              
              {/* File Info */}
              <div className={`text-[10px] ${textMuted} leading-relaxed`}>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                  <span>• Max: 5MB</span>
                  <span>• Recommended: 400×400px</span>
                  <span>• Formats: JPG, PNG, GIF</span>
                </div>
              </div>

              {/* Success Message */}
              {imagePreview && formData.profile_image && !uploadingImage && (
                <div className="flex items-center space-x-1">
                  <Check size={10} className="text-green-600 dark:text-green-400" />
                  <span className="text-[10px] text-green-700 dark:text-green-400 font-medium">
                    {formData.profile_image instanceof File 
                      ? `${formData.profile_image.name.length > 20 ? formData.profile_image.name.substring(0, 20) + '...' : formData.profile_image.name}`
                      : 'Image uploaded'
                    }
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Line Manager Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="text-almet-steel-blue" size={12} />
            <h4 className={`text-xs font-medium ${textPrimary}`}>Line Manager</h4>
          </div>
          {selectedLineManager && (
            <button
              type="button"
              onClick={clearLineManager}
              className="text-[10px] text-red-500 hover:text-red-600 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Line Manager Search */}
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={12} />
            <input
              type="text"
              placeholder="Search employees by name, ID, or department..."
              value={lineManagerSearch || ""}
              onChange={handleLineManagerSearchChange}
              className={`w-full pl-8 pr-8 py-2 rounded-md border transition-colors duration-200 ${bgInput} ${focusRing} ${textPrimary} text-xs`}
            />
            {loadingLineManagers && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                <Loader size={12} className="animate-spin text-gray-400" />
              </div>
            )}
          </div>

          {/* Line Manager Dropdown */}
          {showLineManagerDropdown && Array.isArray(lineManagerOptions) && lineManagerOptions.length > 0 && (
            <div className={`absolute z-30 w-full mt-1 ${bgCard} border ${borderColor} rounded-md shadow-lg max-h-48 overflow-y-auto`}>
              {lineManagerOptions.map((manager) => (
                <button
                  key={manager.id}
                  type="button"
                  onClick={() => handleLineManagerSelect(manager)}
                  className={`w-full p-3 text-left hover:bg-almet-mystic dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors`}
                >
                  <div className="flex items-start space-x-2">
                    <div className="w-8 h-8 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users size={12} className="text-almet-sapphire" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <p className={`font-medium ${textPrimary} text-xs`}>{manager.name || 'Unknown'}</p>
                        {manager.grading_level && (
                          <span className="px-1 py-0.5 text-[9px] bg-almet-sapphire/10 text-almet-sapphire rounded">
                            {manager.grading_level}
                          </span>
                        )}
                      </div>
                      <p className={`text-[10px] ${textMuted} mb-1`}>
                        <span className="font-medium">ID:</span> {manager.employee_id || 'N/A'} • 
                        <span className="font-medium"> Title:</span> {manager.job_title || 'No Title'}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className={`text-[10px] ${textMuted} flex items-center`}>
                          <Building size={8} className="inline mr-1" />
                          {manager.business_function || 'N/A'} / {manager.department || 'N/A'}
                        </span>
                        {manager.position_group_name && (
                          <span className={`text-[10px] ${textMuted}`}>
                            <Award size={8} className="inline mr-1" />
                            {manager.position_group_name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 mt-1">
                        {manager.email && (
                          <span className={`text-[10px] ${textMuted}`}>
                            <Mail size={8} className="inline mr-1" />
                            {manager.email}
                          </span>
                        )}
                        {manager.phone && (
                          <span className={`text-[10px] ${textMuted}`}>
                            <Phone size={8} className="inline mr-1" />
                            {manager.phone}
                          </span>
                        )}
                      </div>
                      {manager.start_date && (
                        <div className={`text-[10px] ${textMuted} mt-1`}>
                          <Calendar size={8} className="inline mr-1" />
                          Started: {new Date(manager.start_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No results message */}
          {showLineManagerDropdown && lineManagerSearch && Array.isArray(lineManagerOptions) && lineManagerOptions.length === 0 && !loadingLineManagers && (
            <div className={`absolute z-30 w-full mt-1 ${bgCard} border ${borderColor} rounded-md p-3 text-center`}>
              <p className={`text-xs ${textMuted}`}>
                No managers found. Try different search terms.
              </p>
            </div>
          )}
        </div>

        {/* Selected Line Manager Display */}
        {selectedLineManager && (
          <div className={`p-3 rounded-md border border-green-200 dark:border-green-800 ${bgAccent}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                  <Users size={12} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <p className={`font-medium ${textPrimary} text-xs`}>{selectedLineManager.name || 'Unknown'}</p>
                    {selectedLineManager.grading_level && (
                      <span className="px-1 py-0.5 text-[9px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                        {selectedLineManager.grading_level}
                      </span>
                    )}
                  </div>
                  <p className={`text-[10px] ${textMuted} mb-1`}>
                    <span className="font-medium">ID:</span> {selectedLineManager.employee_id || 'N/A'} • 
                    <span className="font-medium"> Title:</span> {selectedLineManager.job_title || 'No Title'}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-1">
                    <span className={`text-[10px] ${textMuted}`}>
                      <Building size={8} className="inline mr-1" />
                      {selectedLineManager.business_function || 'N/A'} / {selectedLineManager.department || 'N/A'}
                    </span>
                    {selectedLineManager.position_group_name && (
                      <span className={`text-[10px] ${textMuted}`}>
                        <Award size={8} className="inline mr-1" />
                        {selectedLineManager.position_group_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={clearLineManager}
                className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full text-red-500 hover:text-red-600 transition-colors"
                title="Remove line manager"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Employee Tags Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Tag className="text-almet-san-juan" size={12} />
            <h4 className={`text-xs font-medium ${textPrimary}`}>Employee Tags</h4>
          </div>
        </div>

        {/* Multi-Select Tags Dropdown */}
        <div>
          <label className={`block text-xs font-medium ${textSecondary} mb-1`}>
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
            size="sm"
          />
          
          {formData.tag_ids && formData.tag_ids.length > 0 && (
            <div className={`text-[10px] ${textMuted} mt-1`}>
              {formData.tag_ids.length} tag{formData.tag_ids.length !== 1 ? 's' : ''} selected
            </div>
          )}
        </div>

        {/* No tags message */}
        {(!formattedTagOptions || formattedTagOptions.length === 0) && (
          <div className={`text-center py-4 ${bgAccent} rounded-md border ${borderColor}`}>
            <Tag size={24} className={`mx-auto mb-2 ${textMuted} opacity-50`} />
            <p className={`text-xs ${textMuted}`}>
              No tags available. Contact administrator.
            </p>
          </div>
        )}
      </div>

      {/* Organizational Chart Visibility */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Eye className="text-indigo-500" size={12} />
          <h4 className={`text-xs font-medium ${textPrimary}`}>Org Chart Visibility</h4>
        </div>

        <div className={`p-3 rounded-md border ${borderColor} ${bgAccent}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => handleInputChange({
                  target: { name: 'is_visible_in_org_chart', value: !formData.is_visible_in_org_chart }
                })}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-almet-sapphire focus:ring-offset-2 ${
                  formData.is_visible_in_org_chart ? 'bg-almet-sapphire' : 'bg-gray-200 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                    formData.is_visible_in_org_chart ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
              <div className="flex items-center space-x-2">
                {formData.is_visible_in_org_chart ? (
                  <Eye className="text-green-500" size={12} />
                ) : (
                  <EyeOff className="text-gray-400" size={12} />
                )}
                <span className={`text-xs ${textSecondary}`}>
                  {formData.is_visible_in_org_chart 
                    ? 'Visible in org chart' 
                    : 'Hidden from org chart'
                  }
                </span>
              </div>
            </div>
          </div>
          
          <div className={`mt-2 p-2 bg-almet-sapphire/5 dark:bg-blue-900/20 rounded text-[10px] ${textMuted}`}>
            <p>
              <strong>Note:</strong> This only affects visibility in org chart displays. 
              Reporting relationships and system access remain unchanged.
            </p>
          </div>
        </div>
      </div>

      {/* Additional Notes */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <AlertCircle className="text-orange-500" size={12} />
          <h4 className={`text-xs font-medium ${textPrimary}`}>Additional Notes</h4>
        </div>

        <FormField
          label=""
          name="notes"
          type="textarea"
          value={formData.notes || ""}
          onChange={handleInputChange}
          placeholder="Enter additional notes, special instructions, or relevant information..."
          rows={3}
          validationError={validationErrors.notes}
          helpText="Notes for HR administrators (onboarding instructions, accommodations, etc.)"
        />
      </div>

      {/* Click outside handler for line manager dropdown */}
      {showLineManagerDropdown && (
        <div
          className="fixed inset-0 z-20"
          onClick={() => setShowLineManagerDropdown(false)}
        />
      )}

      {/* Progress Indicator */}
      <div className="bg-almet-mystic dark:bg-gray-700 rounded-md p-3 border border-almet-bali-hai dark:border-gray-600">
        <div className="flex items-center justify-between mb-1">
          <span className={`text-xs font-medium ${textSecondary}`}>Optional Info Completion</span>
          <span className={`text-xs font-medium ${textPrimary}`}>
            {Math.round(([
              formData.profile_image,
              formData.line_manager,
              formData.tag_ids?.length > 0 ? formData.tag_ids : null,
              formData.notes
            ].filter(Boolean).length / 4) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
          <div 
            className="bg-almet-sapphire h-1.5 rounded-full transition-all duration-300"
            style={{ 
              width: `${([
                formData.profile_image,
                formData.line_manager,
                formData.tag_ids?.length > 0 ? formData.tag_ids : null,
                formData.notes
              ].filter(Boolean).length / 4) * 100}%` 
            }}
          />
        </div>
        <div className="text-[10px] text-gray-500 dark:text-gray-400 mt-1">
          All fields in this step are optional
        </div>
      </div>
    </div>
  );
};

export default FormStep3AdditionalInfo;