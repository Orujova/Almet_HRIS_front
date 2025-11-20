// components/jobDescription/WorkConditionsTab.jsx - FIXED Double Selection Issue
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
      business_resources_ids: formData?.business_resources_ids || [],
      access_rights_ids: formData?.access_rights_ids || [],
      company_benefits_ids: formData?.company_benefits_ids || []
    });
  }, [dropdownData, formData]);

  // 🔥 Handle selection changes - NO PREFIX needed anymore
  // HierarchicalMultiSelect artıq öz daxilində prefix idarə edir
  const handleResourcesChange = (selectedIds) => {
    console.log('✅ Resources selected:', selectedIds);
    onFormDataChange(prev => ({
      ...prev,
      business_resources_ids: selectedIds
    }));
  };

  const handleAccessChange = (selectedIds) => {
    console.log('✅ Access selected:', selectedIds);
    onFormDataChange(prev => ({
      ...prev,
      access_rights_ids: selectedIds
    }));
  };

  const handleBenefitsChange = (selectedIds) => {
    console.log('✅ Benefits selected:', selectedIds);
    onFormDataChange(prev => ({
      ...prev,
      company_benefits_ids: selectedIds
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

  // Selected IDs - direct usage, no prefix manipulation needed here
  const selectedResourceIds = formData?.business_resources_ids || [];
  const selectedAccessIds = formData?.access_rights_ids || [];
  const selectedBenefitIds = formData?.company_benefits_ids || [];

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
            idPrefix="res"
          />
          <p className={`mt-2 text-xs ${textSecondary}`}>
            {selectedResourceIds.length} item(s) selected
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
            idPrefix="acc"
          />
          <p className={`mt-2 text-xs ${textSecondary}`}>
            {selectedAccessIds.length} item(s) selected
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
            idPrefix="ben"
          />
          <p className={`mt-2 text-xs ${textSecondary}`}>
            {selectedBenefitIds.length} item(s) selected
          </p>
        </div>
      </div>
    </div>
  );
};

export default WorkConditionsTab;