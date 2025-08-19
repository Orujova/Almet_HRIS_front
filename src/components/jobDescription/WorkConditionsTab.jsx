import React from 'react';
import MultiSelect from './MultiSelect';

const WorkConditionsTab = ({
  formData,
  dropdownData,
  onFormDataChange,
  darkMode
}) => {
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";

  // Handle multi-select changes
  const handleMultiSelectChange = (fieldName, value) => {
    onFormDataChange(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].includes(value)
        ? prev[fieldName].filter(item => item !== value)
        : [...prev[fieldName], value]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Resources and Access */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            Business Resources
          </label>
          <MultiSelect
            options={dropdownData.businessResources}
            selected={formData.business_resources_ids}
            onChange={handleMultiSelectChange}
            placeholder="Select resources..."
            fieldName="business_resources_ids"
            darkMode={darkMode}
          />
          <p className={`text-xs ${textSecondary} mt-1`}>
            Select equipment, tools, and resources needed for this position
          </p>
        </div>
        
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            Access Rights
          </label>
          <MultiSelect
            options={dropdownData.accessMatrix}
            selected={formData.access_rights_ids}
            onChange={handleMultiSelectChange}
            placeholder="Select access rights..."
            fieldName="access_rights_ids"
            darkMode={darkMode}
          />
          <p className={`text-xs ${textSecondary} mt-1`}>
            Define system access and security clearance levels
          </p>
        </div>
        
        <div>
          <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
            Company Benefits
          </label>
          <MultiSelect
            options={dropdownData.companyBenefits}
            selected={formData.company_benefits_ids}
            onChange={handleMultiSelectChange}
            placeholder="Select benefits..."
            fieldName="company_benefits_ids"
            darkMode={darkMode}
          />
          <p className={`text-xs ${textSecondary} mt-1`}>
            Choose applicable company benefits and perks
          </p>
        </div>
      </div>

     
    </div>
  );
};

export default WorkConditionsTab;