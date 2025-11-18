// components/jobDescription/WorkConditionsTab.jsx - FIXED with ID Prefixes
import React, { useEffect } from 'react';
import { Package, Shield, Gift } from 'lucide-react';
import HierarchicalMultiSelect from '../common/HierarchicalMultiSelect';

const WorkConditionsTab = ({
  formData,
  dropdownData,
  onFormDataChange,
  darkMode
}) => {
  const textSecondary = darkMode ? "text-gray-400" : "text-gray-600";

  // Debug: Log incoming data
  useEffect(() => {
    console.log('📦 WorkConditionsTab - dropdownData:', {
      businessResources: dropdownData?.businessResources?.length || 0,
      accessMatrix: dropdownData?.accessMatrix?.length || 0,
      companyBenefits: dropdownData?.companyBenefits?.length || 0
    });

    console.log('📝 WorkConditionsTab - formData:', {
      business_resources_ids: formData?.business_resources_ids?.length || 0,
      access_rights_ids: formData?.access_rights_ids?.length || 0,
      company_benefits_ids: formData?.company_benefits_ids?.length || 0
    });
  }, [dropdownData, formData]);

  // 🔥 Helper function to remove prefix from IDs
  const removePrefix = (ids, prefix) => {
    return ids.map(id => {
      const strId = String(id);
      if (strId.startsWith(`${prefix}_`)) {
        return strId.replace(`${prefix}_`, '');
      }
      return strId;
    });
  };

  // 🔥 Handle selection changes for each category
  const handleResourcesChange = (selectedIds) => {
    // Remove 'res_' prefix before saving
    const cleanIds = removePrefix(selectedIds, 'res');
    console.log('✅ Resources selected (cleaned):', cleanIds);
    onFormDataChange(prev => ({
      ...prev,
      business_resources_ids: cleanIds
    }));
  };

  const handleAccessChange = (selectedIds) => {
    // Remove 'acc_' prefix before saving
    const cleanIds = removePrefix(selectedIds, 'acc');
    console.log('✅ Access selected (cleaned):', cleanIds);
    onFormDataChange(prev => ({
      ...prev,
      access_rights_ids: cleanIds
    }));
  };

  const handleBenefitsChange = (selectedIds) => {
    // Remove 'ben_' prefix before saving
    const cleanIds = removePrefix(selectedIds, 'ben');
    console.log('✅ Benefits selected (cleaned):', cleanIds);
    onFormDataChange(prev => ({
      ...prev,
      company_benefits_ids: cleanIds
    }));
  };

  // Safe data extraction with fallbacks
  const businessResources = Array.isArray(dropdownData?.businessResources) 
    ? dropdownData.businessResources 
    : [];
    
  const accessMatrix = Array.isArray(dropdownData?.accessMatrix) 
    ? dropdownData.accessMatrix 
    : [];
    
  const companyBenefits = Array.isArray(dropdownData?.companyBenefits) 
    ? dropdownData.companyBenefits 
    : [];

  // 🔥 Add prefixes to selected IDs for display
  const addPrefix = (ids, prefix) => {
    if (!Array.isArray(ids)) return [];
    return ids.map(id => `${prefix}_${id}`);
  };

  const selectedResourceIds = addPrefix(formData?.business_resources_ids || [], 'res');
  const selectedAccessIds = addPrefix(formData?.access_rights_ids || [], 'acc');
  const selectedBenefitIds = addPrefix(formData?.company_benefits_ids || [], 'ben');

  return (
    <div className="space-y-6">
      {/* Three Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Business Resources */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Business Resources
          </label>
          <HierarchicalMultiSelect
            title="Resources"
            icon={Package}
            data={businessResources}
            selectedIds={selectedResourceIds}
            onChange={handleResourcesChange}
            searchPlaceholder="Search resources..."
            emptyMessage="No business resources available"
            darkMode={darkMode}
            idPrefix="res" // 🔥 Unique prefix
          />
          <p className={`mt-2 text-xs ${textSecondary}`}>
            {formData?.business_resources_ids?.length || 0} item(s) selected
          </p>
        </div>

        {/* Access Rights */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Access Rights
          </label>
          <HierarchicalMultiSelect
            title="Access"
            icon={Shield}
            data={accessMatrix}
            selectedIds={selectedAccessIds}
            onChange={handleAccessChange}
            searchPlaceholder="Search access rights..."
            emptyMessage="No access rights available"
            darkMode={darkMode}
            idPrefix="acc" // 🔥 Unique prefix
          />
          <p className={`mt-2 text-xs ${textSecondary}`}>
            {formData?.access_rights_ids?.length || 0} item(s) selected
          </p>
        </div>

        {/* Company Benefits */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Company Benefits
          </label>
          <HierarchicalMultiSelect
            title="Benefits"
            icon={Gift}
            data={companyBenefits}
            selectedIds={selectedBenefitIds}
            onChange={handleBenefitsChange}
            searchPlaceholder="Search benefits..."
            emptyMessage="No company benefits available"
            darkMode={darkMode}
            idPrefix="ben" // 🔥 Unique prefix
          />
          <p className={`mt-2 text-xs ${textSecondary}`}>
            {formData?.company_benefits_ids?.length || 0} item(s) selected
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkConditionsTab;