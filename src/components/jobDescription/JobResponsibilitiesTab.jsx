// components/jobDescription/JobResponsibilitiesTab.jsx - FIXED: Show selected groups in edit mode
import React, { useState, useEffect } from 'react';
import { Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import SearchableDropdown from '../common/SearchableDropdown';
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

  // State for multiple skill groups
  const [selectedSkillGroups, setSelectedSkillGroups] = useState([]);
  const [skillsByGroup, setSkillsByGroup] = useState({});
  const [expandedSkillGroups, setExpandedSkillGroups] = useState(new Set());

  // State for multiple behavioral groups
  const [selectedBehavioralGroups, setSelectedBehavioralGroups] = useState([]);
  const [competenciesByGroup, setCompetenciesByGroup] = useState({});
  const [expandedBehavioralGroups, setExpandedBehavioralGroups] = useState(new Set());

  // ADDED: Track if we've initialized from formData (for edit mode)
  const [initialized, setInitialized] = useState(false);

  // ADDED: Initialize selected groups from formData (for edit mode)
  useEffect(() => {
    const initializeSelectedGroups = async () => {
      if (initialized || !dropdownData.skillGroups || !dropdownData.behavioralGroups) {
        return;
      }

      // Only initialize if we have selected skills/competencies in formData
      if (formData.required_skills_data?.length > 0 || formData.behavioral_competencies_data?.length > 0) {
   

        try {
          const competencyApi = (await import('@/services/competencyApi')).default;
          
          // Find which skill groups contain the selected skills
          if (formData.required_skills_data?.length > 0) {
            const groupsToAdd = new Set();
            
            for (const skillGroup of dropdownData.skillGroups) {
              try {
                const response = await competencyApi.skillGroups.getSkills(skillGroup.id);
                const skills = Array.isArray(response) ? response : (response.skills || response.results || []);
                
                // Check if any selected skill is in this group
                const hasSelectedSkill = skills.some(skill => 
                  formData.required_skills_data.includes(skill.id) || 
                  formData.required_skills_data.includes(String(skill.id))
                );
                
                if (hasSelectedSkill) {
                  groupsToAdd.add(skillGroup.id);
                  
                  // Store skills for this group
                  setSkillsByGroup(prev => ({
                    ...prev,
                    [skillGroup.id]: skills
                  }));
                  
                
                }
              } catch (error) {
                console.error(`Error loading skills for group ${skillGroup.id}:`, error);
              }
            }
            
            if (groupsToAdd.size > 0) {
              const groupsArray = Array.from(groupsToAdd);
              setSelectedSkillGroups(groupsArray);
              setExpandedSkillGroups(new Set(groupsArray));

            }
          }

          // Find which behavioral groups contain the selected competencies
          if (formData.behavioral_competencies_data?.length > 0) {
            const groupsToAdd = new Set();
            
            for (const behavioralGroup of dropdownData.behavioralGroups) {
              try {
                const response = await competencyApi.behavioralGroups.getCompetencies(behavioralGroup.id);
                const competencies = Array.isArray(response) ? response : (response.competencies || response.results || []);
                
                // Check if any selected competency is in this group
                const hasSelectedCompetency = competencies.some(comp => 
                  formData.behavioral_competencies_data.includes(comp.id) || 
                  formData.behavioral_competencies_data.includes(String(comp.id))
                );
                
                if (hasSelectedCompetency) {
                  groupsToAdd.add(behavioralGroup.id);
                  
                  // Store competencies for this group
                  setCompetenciesByGroup(prev => ({
                    ...prev,
                    [behavioralGroup.id]: competencies
                  }));
                  
         
                }
              } catch (error) {
                console.error(`Error loading competencies for group ${behavioralGroup.id}:`, error);
              }
            }
            
            if (groupsToAdd.size > 0) {
              const groupsArray = Array.from(groupsToAdd);
              setSelectedBehavioralGroups(groupsArray);
              setExpandedBehavioralGroups(new Set(groupsArray));
            
            }
          }
          
          setInitialized(true);

          
        } catch (error) {
          console.error('Error initializing groups:', error);
        }
      } else {
        // No selected skills/competencies, mark as initialized
        setInitialized(true);
      }
    };

    initializeSelectedGroups();
  }, [formData.required_skills_data, formData.behavioral_competencies_data, dropdownData.skillGroups, dropdownData.behavioralGroups, initialized]);

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

  // Handle skill selection across all groups
  const handleSkillToggle = (skillId) => {
    onFormDataChange(prev => ({
      ...prev,
      required_skills_data: prev.required_skills_data.includes(skillId)
        ? prev.required_skills_data.filter(id => id !== skillId)
        : [...prev.required_skills_data, skillId]
    }));
  };

  // Handle competency selection across all groups
  const handleCompetencyToggle = (competencyId) => {
    onFormDataChange(prev => ({
      ...prev,
      behavioral_competencies_data: prev.behavioral_competencies_data.includes(competencyId)
        ? prev.behavioral_competencies_data.filter(id => id !== competencyId)
        : [...prev.behavioral_competencies_data, competencyId]
    }));
  };

  // Add skill group
  const handleAddSkillGroup = async (groupId) => {
    if (!groupId || selectedSkillGroups.includes(groupId)) return;
    
    setSelectedSkillGroups(prev => [...prev, groupId]);
    setExpandedSkillGroups(prev => new Set([...prev, groupId]));
    
    // Fetch skills for this group
    await fetchSkillsForGroup(groupId);
  };

  // Remove skill group
  const handleRemoveSkillGroup = (groupId) => {
    setSelectedSkillGroups(prev => prev.filter(id => id !== groupId));
    setExpandedSkillGroups(prev => {
      const newSet = new Set(prev);
      newSet.delete(groupId);
      return newSet;
    });
    
    // Remove skills from this group from selection
    const groupSkills = skillsByGroup[groupId] || [];
    const skillIdsToRemove = groupSkills.map(skill => String(skill.id));
    
    onFormDataChange(prev => ({
      ...prev,
      required_skills_data: prev.required_skills_data.filter(
        id => !skillIdsToRemove.includes(String(id))
      )
    }));
  };

  // Add behavioral group
  const handleAddBehavioralGroup = async (groupId) => {
    if (!groupId || selectedBehavioralGroups.includes(groupId)) return;
    
    setSelectedBehavioralGroups(prev => [...prev, groupId]);
    setExpandedBehavioralGroups(prev => new Set([...prev, groupId]));
    
    // Fetch competencies for this group
    await fetchCompetenciesForGroup(groupId);
  };

  // Remove behavioral group
  const handleRemoveBehavioralGroup = (groupId) => {
    setSelectedBehavioralGroups(prev => prev.filter(id => id !== groupId));
    setExpandedBehavioralGroups(prev => {
      const newSet = new Set(prev);
      newSet.delete(groupId);
      return newSet;
    });
    
    // Remove competencies from this group from selection
    const groupCompetencies = competenciesByGroup[groupId] || [];
    const competencyIdsToRemove = groupCompetencies.map(comp => String(comp.id));
    
    onFormDataChange(prev => ({
      ...prev,
      behavioral_competencies_data: prev.behavioral_competencies_data.filter(
        id => !competencyIdsToRemove.includes(String(id))
      )
    }));
  };

  // Fetch skills for a specific group
  const fetchSkillsForGroup = async (groupId) => {
    try {
      const competencyApi = (await import('@/services/competencyApi')).default;
      const response = await competencyApi.skillGroups.getSkills(groupId);
      const skills = Array.isArray(response) ? response : (response.skills || response.results || []);
      
      setSkillsByGroup(prev => ({
        ...prev,
        [groupId]: skills
      }));
      

    } catch (error) {
      console.error(`Error fetching skills for group ${groupId}:`, error);
    }
  };

  // Fetch competencies for a specific group
  const fetchCompetenciesForGroup = async (groupId) => {
    try {
      const competencyApi = (await import('@/services/competencyApi')).default;
      const response = await competencyApi.behavioralGroups.getCompetencies(groupId);
      const competencies = Array.isArray(response) ? response : (response.competencies || response.results || []);
      
      setCompetenciesByGroup(prev => ({
        ...prev,
        [groupId]: competencies
      }));
      

    } catch (error) {
      console.error(`Error fetching competencies for group ${groupId}:`, error);
    }
  };

  // Toggle group expansion
  const toggleSkillGroupExpansion = (groupId) => {
    setExpandedSkillGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const toggleBehavioralGroupExpansion = (groupId) => {
    setExpandedBehavioralGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  // Get group name by ID
  const getSkillGroupName = (groupId) => {
    const group = dropdownData.skillGroups?.find(g => g.id === groupId);
    return group?.name || group?.display_name || `Group ${groupId}`;
  };

  const getBehavioralGroupName = (groupId) => {
    const group = dropdownData.behavioralGroups?.find(g => g.id === groupId);
    return group?.name || group?.display_name || `Group ${groupId}`;
  };

  // Transform options for SearchableDropdown
  const skillGroupOptions = (dropdownData.skillGroups || [])
    .filter(group => !selectedSkillGroups.includes(group.id))
    .map(group => ({
      value: group.id,
      label: group.name || group.display_name || `Group ${group.id}`
    }));

  const behavioralGroupOptions = (dropdownData.behavioralGroups || [])
    .filter(group => !selectedBehavioralGroups.includes(group.id))
    .map(group => ({
      value: group.id,
      label: group.name || group.display_name || `Group ${group.id}`
    }));

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

      {/* Technical Skills with Multiple Groups */}
      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
          Technical Skills
        </label>
        
        {/* ADDED: Show loading indicator during initialization */}
        {!initialized && formData.required_skills_data?.length > 0 && (
          <div className={`mb-3 p-3 ${bgAccent} rounded-lg border ${borderColor}`}>
            <div className="flex items-center gap-2 text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-almet-sapphire"></div>
              <span className={textSecondary}>Loading skill groups...</span>
            </div>
          </div>
        )}
        
        {/* Add Skill Group Dropdown */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <SearchableDropdown
                options={skillGroupOptions}
                value=""
                onChange={(value) => {
                  if (value) {
                    handleAddSkillGroup(value);
                  }
                }}
                placeholder="Add skill group..."
                darkMode={darkMode}
              />
            </div>
          </div>
          {selectedSkillGroups.length === 0 && initialized && (
            <p className={`text-xs ${textMuted} mt-1`}>
              Select one or more skill groups to add technical skills
            </p>
          )}
        </div>

        {/* Selected Skill Groups */}
        {selectedSkillGroups.map(groupId => {
          const groupSkills = skillsByGroup[groupId] || [];
          const isExpanded = expandedSkillGroups.has(groupId);
          const selectedCount = groupSkills.filter(skill => 
            formData.required_skills_data.includes(skill.id) || 
            formData.required_skills_data.includes(String(skill.id))
          ).length;

          return (
            <div key={groupId} className={`mb-3 border ${borderColor} rounded-lg overflow-hidden`}>
              {/* Group Header */}
              <div 
                className={`p-3 ${bgAccent} flex items-center justify-between cursor-pointer hover:bg-opacity-80 transition-colors`}
                onClick={() => toggleSkillGroupExpansion(groupId)}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${textPrimary}`}>
                    {getSkillGroupName(groupId)}
                  </span>
                  {selectedCount > 0 && (
                    <span className="px-2 py-0.5 bg-almet-sapphire text-white text-xs rounded-full">
                      {selectedCount} selected
                    </span>
                  )}
                  <span className={`text-xs ${textMuted}`}>
                    ({groupSkills.length} available)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveSkillGroup(groupId);
                    }}
                    className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                    title="Remove this skill group"
                  >
                    <X size={16} />
                  </button>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {/* Group Skills */}
              {isExpanded && (
                <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {groupSkills.length > 0 ? (
                    groupSkills.map(skill => {
                      const isSelected = formData.required_skills_data.includes(skill.id) || 
                                       formData.required_skills_data.includes(String(skill.id));
                      
                      return (
                        <label 
                          key={skill.id}
                          className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-almet-sapphire/10 border border-almet-sapphire' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleSkillToggle(skill.id)}
                            className="rounded border-gray-300 text-almet-sapphire focus:ring-almet-sapphire"
                          />
                          <span className={`text-sm ${textPrimary}`}>{skill.name}</span>
                        </label>
                      );
                    })
                  ) : (
                    <p className={`text-sm ${textMuted} col-span-2 text-center py-4`}>
                      Loading skills...
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Behavioral Competencies with Multiple Groups */}
      <div>
        <label className={`block text-sm font-medium ${textSecondary} mb-2`}>
          Behavioral Competencies
        </label>
        
        {/* ADDED: Show loading indicator during initialization */}
        {!initialized && formData.behavioral_competencies_data?.length > 0 && (
          <div className={`mb-3 p-3 ${bgAccent} rounded-lg border ${borderColor}`}>
            <div className="flex items-center gap-2 text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
              <span className={textSecondary}>Loading competency groups...</span>
            </div>
          </div>
        )}
        
        {/* Add Behavioral Group Dropdown */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <SearchableDropdown
                options={behavioralGroupOptions}
                value=""
                onChange={(value) => {
                  if (value) {
                    handleAddBehavioralGroup(value);
                  }
                }}
                placeholder="Add competency group..."
                darkMode={darkMode}
              />
            </div>
          </div>
          {selectedBehavioralGroups.length === 0 && initialized && (
            <p className={`text-xs ${textMuted} mt-1`}>
              Select one or more competency groups to add behavioral competencies
            </p>
          )}
        </div>

        {/* Selected Behavioral Groups */}
        {selectedBehavioralGroups.map(groupId => {
          const groupCompetencies = competenciesByGroup[groupId] || [];
          const isExpanded = expandedBehavioralGroups.has(groupId);
          const selectedCount = groupCompetencies.filter(comp => 
            formData.behavioral_competencies_data.includes(comp.id) || 
            formData.behavioral_competencies_data.includes(String(comp.id))
          ).length;

          return (
            <div key={groupId} className={`mb-3 border ${borderColor} rounded-lg overflow-hidden`}>
              {/* Group Header */}
              <div 
                className={`p-3 ${bgAccent} flex items-center justify-between cursor-pointer hover:bg-opacity-80 transition-colors`}
                onClick={() => toggleBehavioralGroupExpansion(groupId)}
              >
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-semibold ${textPrimary}`}>
                    {getBehavioralGroupName(groupId)}
                  </span>
                  {selectedCount > 0 && (
                    <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
                      {selectedCount} selected
                    </span>
                  )}
                  <span className={`text-xs ${textMuted}`}>
                    ({groupCompetencies.length} available)
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveBehavioralGroup(groupId);
                    }}
                    className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                    title="Remove this competency group"
                  >
                    <X size={16} />
                  </button>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </div>

              {/* Group Competencies */}
              {isExpanded && (
                <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                  {groupCompetencies.length > 0 ? (
                    groupCompetencies.map(competency => {
                      const isSelected = formData.behavioral_competencies_data.includes(competency.id) || 
                                       formData.behavioral_competencies_data.includes(String(competency.id));
                      
                      return (
                        <label 
                          key={competency.id}
                          className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors ${
                            isSelected 
                              ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-600' 
                              : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleCompetencyToggle(competency.id)}
                            className="rounded border-gray-300 text-purple-600 focus:ring-purple-600"
                          />
                          <span className={`text-sm ${textPrimary}`}>{competency.name}</span>
                        </label>
                      );
                    })
                  ) : (
                    <p className={`text-sm ${textMuted} col-span-2 text-center py-4`}>
                      Loading competencies...
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

    
    </div>
  );
};

export default JobResponsibilitiesTab;