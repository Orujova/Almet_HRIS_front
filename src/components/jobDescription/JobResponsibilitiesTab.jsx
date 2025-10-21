// components/jobDescription/JobResponsibilitiesTab.jsx - WITH Hierarchical Multi-Select
import React, { useState, useEffect } from 'react';
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import SearchableDropdown from '../common/SearchableDropdown';
import HierarchicalMultiSelect from '../common/HierarchicalMultiSelect';

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

  // State for hierarchical data
  const [skillGroupsHierarchical, setSkillGroupsHierarchical] = useState([]);
  const [behavioralGroupsHierarchical, setBehavioralGroupsHierarchical] = useState([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(false);
  const [isLoadingCompetencies, setIsLoadingCompetencies] = useState(false);

  // Load skills in hierarchical format
  useEffect(() => {
    const loadSkillsHierarchical = async () => {
      if (!dropdownData.skillGroups?.length) return;
      
      setIsLoadingSkills(true);
      try {
        const competencyApi = (await import('@/services/competencyApi')).default;
        
        const hierarchicalData = await Promise.all(
          dropdownData.skillGroups.map(async (group) => {
            try {
              const response = await competencyApi.skillGroups.getSkills(group.id);
              const skills = Array.isArray(response) ? response : (response.skills || response.results || []);
              
              return {
                id: String(group.id),
                name: group.name || group.display_name || `Group ${group.id}`,
                description: group.description || `${skills.length} skills available`,
                items: skills.map(skill => ({
                  id: String(skill.id),
                  name: skill.name,
                  description: skill.description || '',
                  full_path: skill.full_path || ''
                }))
              };
            } catch (error) {
              console.error(`Error loading skills for group ${group.id}:`, error);
              return {
                id: String(group.id),
                name: group.name || group.display_name || `Group ${group.id}`,
                description: 'Error loading skills',
                items: []
              };
            }
          })
        );
        
        setSkillGroupsHierarchical(hierarchicalData);
      } catch (error) {
        console.error('Error loading skill groups:', error);
      } finally {
        setIsLoadingSkills(false);
      }
    };

    loadSkillsHierarchical();
  }, [dropdownData.skillGroups]);

  // Load competencies in hierarchical format
  useEffect(() => {
    const loadCompetenciesHierarchical = async () => {
      if (!dropdownData.behavioralGroups?.length) return;
      
      setIsLoadingCompetencies(true);
      try {
        const competencyApi = (await import('@/services/competencyApi')).default;
        
        const hierarchicalData = await Promise.all(
          dropdownData.behavioralGroups.map(async (group) => {
            try {
              const response = await competencyApi.behavioralGroups.getCompetencies(group.id);
              const competencies = Array.isArray(response) ? response : (response.competencies || response.results || []);
              
              return {
                id: String(group.id),
                name: group.name || group.display_name || `Group ${group.id}`,
                description: group.description || `${competencies.length} competencies available`,
                items: competencies.map(comp => ({
                  id: String(comp.id),
                  name: comp.name,
                  description: comp.description || '',
                  full_path: comp.full_path || ''
                }))
              };
            } catch (error) {
              console.error(`Error loading competencies for group ${group.id}:`, error);
              return {
                id: String(group.id),
                name: group.name || group.display_name || `Group ${group.id}`,
                description: 'Error loading competencies',
                items: []
              };
            }
          })
        );
        
        setBehavioralGroupsHierarchical(hierarchicalData);
      } catch (error) {
        console.error('Error loading behavioral groups:', error);
      } finally {
        setIsLoadingCompetencies(false);
      }
    };

    loadCompetenciesHierarchical();
  }, [dropdownData.behavioralGroups]);

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

  // Handle skill selection change
  const handleSkillsChange = (selectedIds) => {
    onFormDataChange(prev => ({
      ...prev,
      required_skills_data: selectedIds
    }));
  };

  // Handle competency selection change
  const handleCompetenciesChange = (selectedIds) => {
    onFormDataChange(prev => ({
      ...prev,
      behavioral_competencies_data: selectedIds
    }));
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

      {/* Technical Skills - Hierarchical Multi-Select */}
      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
          Technical Skills <span className="text-red-500">*</span>
        </label>
        
        {isLoadingSkills ? (
          <div className={`p-4 ${bgAccent} rounded-lg border ${borderColor} flex items-center justify-center gap-2`}>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-almet-sapphire"></div>
            <span className={`text-sm ${textSecondary}`}>Loading skill groups...</span>
          </div>
        ) : (
          <HierarchicalMultiSelect
            title="Skills"
            icon={() => (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
              </svg>
            )}
            data={skillGroupsHierarchical}
            selectedIds={formData.required_skills_data || []}
            onChange={handleSkillsChange}
            searchPlaceholder="Search skills and groups..."
            emptyMessage="No skill groups available"
            darkMode={darkMode}
          />
        )}
        
        {validationErrors.required_skills_data && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.required_skills_data}</p>
        )}
        
     
      </div>

      {/* Behavioral Competencies - Hierarchical Multi-Select */}
      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
          Behavioral Competencies <span className="text-red-500">*</span>
        </label>
        
        {isLoadingCompetencies ? (
          <div className={`p-4 ${bgAccent} rounded-lg border ${borderColor} flex items-center justify-center gap-2`}>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
            <span className={`text-sm ${textSecondary}`}>Loading competency groups...</span>
          </div>
        ) : (
          <HierarchicalMultiSelect
            title="Competencies"
            icon={() => (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            )}
            data={behavioralGroupsHierarchical}
            selectedIds={formData.behavioral_competencies_data || []}
            onChange={handleCompetenciesChange}
            searchPlaceholder="Search competencies and groups..."
            emptyMessage="No competency groups available"
            darkMode={darkMode}
          />
        )}
        
        {validationErrors.behavioral_competencies_data && (
          <p className="text-red-500 text-xs mt-1">{validationErrors.behavioral_competencies_data}</p>
        )}
        
  
      </div>
    </div>
  );
};

export default JobResponsibilitiesTab;