import React from 'react';
import { Plus, X } from 'lucide-react';
import SearchableSelect from './SearchableSelect';
import MultiSelect from '../common/MultiSelect';

const JobResponsibilitiesTab = ({
  formData,
  selectedSkillGroup,
  selectedBehavioralGroup,
  availableSkills,
  availableCompetencies,
  dropdownData,
  validationErrors,
  onFormDataChange,
  onSkillGroupChange,
  onBehavioralGroupChange,
  darkMode
}) => {
  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";
  const bgAccent = darkMode ? "bg-almet-comet" : "bg-almet-mystic";

  // Handle array field changes
  const handleArrayFieldChange = (fieldName, index, value) => {
    onFormDataChange(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].map((item, i) => i === index ? value : item)
    }));
  };

  // Add new item to array field
  const addArrayItem = (fieldName) => {
    onFormDataChange(prev => ({
      ...prev,
      [fieldName]: [...prev[fieldName], '']
    }));
  };

  // Remove item from array field
  const removeArrayItem = (fieldName, index) => {
    if (formData[fieldName].length > 1) {
      onFormDataChange(prev => ({
        ...prev,
        [fieldName]: prev[fieldName].filter((_, i) => i !== index)
      }));
    }
  };

  // Handle multi-select changes
  const handleMultiSelectChange = (fieldName, value) => {
    onFormDataChange(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].includes(value)
        ? prev[fieldName].filter(item => item !== value)
        : [...prev[fieldName], value]
    }));
  };

  // Enhanced Competency Selection Component
  const CompetencySelection = ({ 
    type, 
    groupOptions, 
    availableItems, 
    selectedGroup, 
    onGroupChange, 
    selectedItems, 
    onItemChange, 
    groupLabel, 
    itemLabel 
  }) => {
    return (
      <div className="space-y-4">
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            {groupLabel}
          </label>
          <SearchableSelect
            options={groupOptions}
            value={selectedGroup}
            onChange={(value) => onGroupChange(value)}
            placeholder={`Select ${groupLabel}`}
            darkMode={darkMode}
          />
        </div>

        {selectedGroup && (
          <div>
            <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
              {itemLabel} ({availableItems.length} available)
            </label>
            {availableItems.length > 0 ? (
              <MultiSelect
                options={availableItems}
                selected={selectedItems}
                onChange={onItemChange}
                placeholder={`Select ${itemLabel.toLowerCase()}...`}
                fieldName={type === 'skills' ? 'required_skills_data' : 'behavioral_competencies_data'}
                darkMode={darkMode}
              />
            ) : (
              <div className={`p-3 border ${borderColor} rounded-lg ${bgAccent} text-center`}>
                <p className={`text-sm ${textMuted}`}>
                  {selectedGroup ? 'Loading...' : `No ${itemLabel.toLowerCase()} available`}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Sections */}
      {[
        { fieldName: 'criticalDuties', title: 'Critical Duties', required: true },
        { fieldName: 'positionMainKpis', title: 'Position Main KPIs', required: true },
        { fieldName: 'jobDuties', title: 'Job Duties', required: true },
        { fieldName: 'requirements', title: 'Requirements', required: true }
      ].map(({ fieldName, title, required }) => (
        <div key={fieldName}>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            {title} {required && <span className="text-red-500">*</span>}
          </label>
          {formData[fieldName].map((item, index) => (
            <div key={index} className="flex items-start gap-2 mb-2">
              <textarea
                value={item}
                onChange={(e) => handleArrayFieldChange(fieldName, index, e.target.value)}
                className={`flex-1 px-3 py-2 border ${borderColor} rounded-lg ${bgCard} ${textPrimary} focus:outline-none focus:ring-2 focus:ring-almet-sapphire text-sm ${
                  validationErrors[fieldName] ? 'border-red-500' : ''
                }`}
                rows="2"
                placeholder={`Enter ${title.toLowerCase()}...`}
                required={required && index === 0}
              />
              {formData[fieldName].length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem(fieldName, index)}
                  className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayItem(fieldName)}
            className="text-almet-sapphire hover:text-almet-astral font-medium text-sm flex items-center gap-1"
          >
            <Plus size={14} />
            Add {title.slice(0, -1)}
          </button>
          {validationErrors[fieldName] && (
            <p className="text-red-500 text-xs mt-1">{validationErrors[fieldName]}</p>
          )}
        </div>
      ))}

      {/* Enhanced Competency Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CompetencySelection
          type="skills"
          groupOptions={dropdownData.skillGroups}
          availableItems={availableSkills}
          selectedGroup={selectedSkillGroup}
          onGroupChange={onSkillGroupChange}
          selectedItems={formData.required_skills_data}
          onItemChange={handleMultiSelectChange}
          groupLabel="Skill Group"
          itemLabel="Required Skills"
        />
        
        <CompetencySelection
          type="competencies"
          groupOptions={dropdownData.behavioralGroups}
          availableItems={availableCompetencies}
          selectedGroup={selectedBehavioralGroup}
          onGroupChange={onBehavioralGroupChange}
          selectedItems={formData.behavioral_competencies_data}
          onItemChange={handleMultiSelectChange}
          groupLabel="Behavioral Group"
          itemLabel="Behavioral Competencies"
        />
      </div>
    </div>
  );
};

export default JobResponsibilitiesTab;