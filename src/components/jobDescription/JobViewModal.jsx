// components/jobDescription/JobViewModal.jsx - WITH Leadership Competencies Support
import React, { useState } from 'react';
import { 
  X, Download, UserCheck, UserX as UserVacant, Clock, CheckCircle, XCircle, RotateCcw,
  AlertCircle, Edit, Building, User, Target, BookOpen, Shield, Package, Gift,
  ChevronDown, ChevronUp, Check, Layers, Award, Crown
} from 'lucide-react';

const JobViewModal = ({ job, onClose, onDownloadPDF, darkMode }) => {
  const [expandedSections, setExpandedSections] = useState({
    sections: true,
    skills: true,
    behavioral: true,
    leadership: true,
    resources: true,
    access: true,
    benefits: true
  });

  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";
  const bgAccent = darkMode ? "bg-almet-comet" : "bg-almet-mystic";
  const bgHover = darkMode ? "bg-almet-san-juan" : "bg-gray-50";

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
      case 'PENDING_LINE_MANAGER':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'PENDING_EMPLOYEE':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400';
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'REVISION_REQUIRED':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'DRAFT':
        return <Edit size={14} />;
      case 'PENDING_LINE_MANAGER':
      case 'PENDING_EMPLOYEE':
        return <Clock size={14} />;
      case 'APPROVED':
        return <CheckCircle size={14} />;
      case 'REJECTED':
        return <XCircle size={14} />;
      case 'REVISION_REQUIRED':
        return <RotateCcw size={14} />;
      default:
        return <AlertCircle size={14} />;
    }
  };

  const formatSectionContent = (content) => {
    if (!content) return '';
    const lines = content.split('\n').filter(line => line.trim());
    return lines.map((line) => {
      const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
      return cleanLine ? `• ${cleanLine}` : '';
    }).filter(line => line).join('\n');
  };

  const CollapsibleSection = ({ title, icon: Icon, isExpanded, onToggle, children, count = null, isEmpty = false, color = 'almet-sapphire' }) => (
    <div className={`border ${borderColor} rounded-lg overflow-hidden`}>
      <button
        onClick={onToggle}
        className={`w-full px-4 py-3 ${bgAccent} hover:opacity-80 transition-all duration-200 
          flex items-center justify-between text-left`}
      >
        <div className="flex items-center gap-3">
          <Icon size={16} className={isEmpty ? textMuted : `text-${color}`} />
          <span className={`font-medium ${textPrimary} text-sm`}>{title}</span>
          {count !== null && count > 0 && (
            <span className={`px-2 py-1 rounded-full text-xs font-semibold bg-${color} text-white`}>
              {count}
            </span>
          )}
          {isEmpty && (
            <span className={`text-xs ${textMuted} italic`}>No data</span>
          )}
        </div>
        {!isEmpty && (isExpanded ? (
          <ChevronUp size={16} className={textMuted} />
        ) : (
          <ChevronDown size={16} className={textMuted} />
        ))}
      </button>
      {isExpanded && !isEmpty && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  );

  // Safe data extraction
  const safeJobData = {
    job_title: job?.job_title || 'No Title',
    job_purpose: job?.job_purpose || 'No purpose specified',
    business_function_name: job?.business_function?.name || 'N/A',
    department_name: job?.department?.name || 'N/A',
    unit_name: job?.unit?.name || null,
    job_function_name: job?.job_function?.name || null,
    position_group_name: job?.position_group?.name || null,
    grading_level: job?.grading_level || null,
    assigned_employee_name: job?.assigned_employee?.full_name || job?.employee_info?.name || null,
    assigned_employee_id: job?.assigned_employee?.employee_id || job?.employee_info?.employee_id || null,
    reports_to_name: job?.reports_to?.full_name || job?.manager_info?.name || null,
    reports_to_title: job?.reports_to?.job_title || job?.manager_info?.job_title || null,
    status: job?.status || 'UNKNOWN',
    status_display: job?.status_display || { status: job?.status || 'UNKNOWN' },
    sections: job?.sections || [],
    required_skills: job?.required_skills || [],
    behavioral_competencies: job?.behavioral_competencies || [],
    leadership_competencies: job?.leadership_competencies || [], // 🔥 NEW
    business_resources: job?.business_resources || [],
    access_rights: job?.access_rights || [],
    company_benefits: job?.company_benefits || [],
    created_at: job?.created_at || null,
    updated_at: job?.updated_at || null
  };

  if (!job || !job.id) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className={`${bgCard} rounded-lg w-full max-w-md p-6 border ${borderColor}`}>
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 text-red-500" size={48} />
            <h3 className={`text-lg font-bold ${textPrimary} mb-2`}>Error Loading Job Description</h3>
            <p className={`${textSecondary} mb-4`}>
              The job description data could not be loaded. Please try again.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`${bgCard} rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto border ${borderColor}`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${textPrimary}`}>Job Description Details</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={onDownloadPDF}
                className="flex items-center gap-2 px-3 py-1 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-sm"
              >
                <Download size={12} />
                Download PDF
              </button>
              <button
                onClick={onClose}
                className={`p-2 ${textMuted} hover:${textPrimary} transition-colors`}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="space-y-6">
            {/* Header Information */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-4 ${bgAccent} rounded-lg`}>
              <div>
                <h3 className={`text-lg font-semibold ${textPrimary} mb-2`}>{safeJobData.job_title}</h3>
                <div className={`${textSecondary} text-sm space-y-1`}>
                  <p className="flex items-center gap-2">
                    <Building size={14} />
                    {safeJobData.business_function_name} • {safeJobData.department_name}
                    {safeJobData.unit_name && ` • ${safeJobData.unit_name}`}
                  </p>
                  {safeJobData.job_function_name && (
                    <p className="flex items-center gap-2">
                      <Target size={14} />
                      {safeJobData.job_function_name}
                    </p>
                  )}
                  {safeJobData.position_group_name && (
                    <p className="flex items-center gap-2">
                      <User size={14} />
                      {safeJobData.position_group_name}
                      {safeJobData.grading_level && ` - ${safeJobData.grading_level}`}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${textMuted} text-sm`}>Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs flex items-center gap-2 ${getStatusColor(safeJobData.status)}`}>
                    {getStatusIcon(safeJobData.status)}
                    {safeJobData.status_display?.status || safeJobData.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${textMuted} text-sm`}>Employee:</span>
                  {safeJobData.assigned_employee_name ? (
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        <UserCheck size={12} className="text-green-600" />
                        <span className={`${textPrimary} text-sm font-medium`}>
                          {safeJobData.assigned_employee_name}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <UserVacant size={12} className="text-orange-600" />
                      <span className="text-orange-600 text-sm">Vacant Position</span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${textMuted} text-sm`}>Reports to:</span>
                  <span className={`${textPrimary} text-sm`}>
                    {safeJobData.reports_to_name || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Job Purpose */}
            <div>
              <h4 className={`text-md font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
                <BookOpen size={16} />
                Job Purpose
              </h4>
              <div className={`p-4 ${bgAccent} rounded-lg`}>
                <p className={`${textSecondary} leading-relaxed text-wrap text-sm`}>{safeJobData.job_purpose}</p>
              </div>
            </div>

            {/* Job Sections */}
            {safeJobData.sections.length > 0 && (
              <CollapsibleSection
                title="Job Sections"
                icon={BookOpen}
                isExpanded={expandedSections.sections}
                onToggle={() => toggleSection('sections')}
                count={safeJobData.sections.length}
              >
                <div className="space-y-4">
                  {safeJobData.sections.map((section, index) => (
                    <div key={index} className={`p-4 border ${borderColor} rounded-lg`}>
                      <h5 className={`font-semibold ${textPrimary} mb-2 text-sm`}>
                        {section.title}
                      </h5>
                      <div className={`${textSecondary} text-sm whitespace-pre-line`}>
                        {formatSectionContent(section.content)}
                      </div>
                    </div>
                  ))}
              </div>
            </CollapsibleSection>
            )} 

             {/* Required Skills */}
            {safeJobData.required_skills.length > 0 && (
              <CollapsibleSection
                title="Required Skills"
                icon={Target}
                isExpanded={expandedSections.skills}
                onToggle={() => toggleSection('skills')}
                count={safeJobData.required_skills.length}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {safeJobData.required_skills.map((skillItem, index) => (
                    <div key={skillItem.id || index} className={`p-3 ${bgAccent} rounded-lg`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-medium ${textPrimary} text-sm`}>
                          {skillItem.skill_detail?.name || `Skill ${index + 1}`}
                        </span>
                      </div>
                      <div className={`text-xs ${textMuted}`}>
                        <p>Group: <span className="font-medium">{skillItem.skill_detail?.group_name || 'N/A'}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* 🔥 Behavioral Competencies */}
            {safeJobData.behavioral_competencies.length > 0 && (
              <CollapsibleSection
                title="Behavioral Competencies"
                icon={User}
                isExpanded={expandedSections.behavioral}
                onToggle={() => toggleSection('behavioral')}
                count={safeJobData.behavioral_competencies.length}
                color="blue-600"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {safeJobData.behavioral_competencies.map((compItem, index) => (
                    <div key={compItem.id || index} className={`p-3 ${bgAccent} rounded-lg border-l-2 border-blue-500`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-medium ${textPrimary} text-sm`}>
                          {compItem.competency_detail?.name || `Competency ${index + 1}`}
                        </span>
                      </div>
                      <div className={`text-xs ${textMuted}`}>
                        <p>Group: <span className="font-medium">{compItem.competency_detail?.group_name || 'N/A'}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* 🔥 Leadership Competencies */}
            {safeJobData.leadership_competencies.length > 0 && (
              <CollapsibleSection
                title="Leadership Competencies"
                icon={Crown}
                isExpanded={expandedSections.leadership}
                onToggle={() => toggleSection('leadership')}
                count={safeJobData.leadership_competencies.length}
                color="purple-600"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {safeJobData.leadership_competencies.map((leadershipItem, index) => (
                    <div key={leadershipItem.id || index} className={`p-3 ${bgAccent} rounded-lg border-l-2 border-purple-500`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-medium ${textPrimary} text-sm flex items-center gap-1`}>
                          <Crown size={14} className="text-purple-600" />
                          {leadershipItem.leadership_item_detail?.name || 
                           leadershipItem.item_detail?.name || 
                           `Leadership Item ${index + 1}`}
                        </span>
                      </div>
                      <div className={`text-xs ${textMuted} space-y-1`}>
                        {leadershipItem.leadership_item_detail?.child_group_name && (
                          <p>
                            Category: <span className="font-medium">{leadershipItem.leadership_item_detail.child_group_name}</span>
                          </p>
                        )}
                        {leadershipItem.leadership_item_detail?.main_group_name && (
                          <p>
                            Main Group: <span className="font-medium">{leadershipItem.leadership_item_detail.main_group_name}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Business Resources */}
            <CollapsibleSection
              title="Business Resources"
              icon={Package}
              isExpanded={expandedSections.resources}
              onToggle={() => toggleSection('resources')}
              count={safeJobData.business_resources.length}
              isEmpty={safeJobData.business_resources.length === 0}
            >
              <div className="space-y-4">
                {safeJobData.business_resources.map((resourceItem, index) => (
                  <div key={resourceItem.id || index} className={`p-4 border ${borderColor} rounded-lg ${bgHover}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h6 className={`font-semibold ${textPrimary} text-sm mb-1 flex items-center gap-2`}>
                          <Package size={14} className="text-almet-sapphire" />
                          {resourceItem.resource_detail?.name || `Resource ${index + 1}`}
                        </h6>
                        {resourceItem.resource_detail?.description && (
                          <p className={`text-xs ${textSecondary} mb-2`}>
                            {resourceItem.resource_detail.description}
                          </p>
                        )}
                      </div>
                      {resourceItem.has_specific_items ? (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full font-medium">
                          Specific Items
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-medium">
                          All Items
                        </span>
                      )}
                    </div>
                    
                    {resourceItem.has_specific_items && resourceItem.specific_items_detail && resourceItem.specific_items_detail.length > 0 ? (
                      <div className={`mt-3 pt-3 border-t ${borderColor}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Layers size={12} className={textMuted} />
                          <span className={`text-xs font-medium ${textMuted}`}>Selected Items:</span>
                        </div>
                        <div className="space-y-2">
                          {resourceItem.specific_items_detail.map((item) => (
                            <div key={item.id} className={`flex items-center gap-2 p-2 rounded ${bgAccent}`}>
                              <Check size={12} className="text-green-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-medium ${textPrimary}`}>{item.name}</p>
                                {item.description && (
                                  <p className={`text-xs ${textMuted} truncate`}>{item.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className={`mt-3 pt-3 border-t ${borderColor}`}>
                        <div className="flex items-center gap-2">
                          <Check size={12} className="text-green-600" />
                          <span className={`text-xs ${textSecondary}`}>
                            All items included ({resourceItem.resource_detail?.items_count || 0} items)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Access Rights */}
            <CollapsibleSection
              title="Access Rights"
              icon={Shield}
              isExpanded={expandedSections.access}
              onToggle={() => toggleSection('access')}
              count={safeJobData.access_rights.length}
              isEmpty={safeJobData.access_rights.length === 0}
            >
              <div className="space-y-4">
                {safeJobData.access_rights.map((accessItem, index) => (
                  <div key={accessItem.id || index} className={`p-4 border ${borderColor} rounded-lg ${bgHover}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h6 className={`font-semibold ${textPrimary} text-sm mb-1 flex items-center gap-2`}>
                          <Shield size={14} className="text-almet-sapphire" />
                          {accessItem.access_detail?.name || `Access ${index + 1}`}
                        </h6>
                        {accessItem.access_detail?.description && (
                          <p className={`text-xs ${textSecondary} mb-2`}>
                            {accessItem.access_detail.description}
                          </p>
                        )}
                      </div>
                      {accessItem.has_specific_items ? (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full font-medium">
                          Specific Items
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-medium">
                          Full Access
                        </span>
                      )}
                    </div>
                    
                    {accessItem.has_specific_items && accessItem.specific_items_detail && accessItem.specific_items_detail.length > 0 ? (
                      <div className={`mt-3 pt-3 border-t ${borderColor}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Layers size={12} className={textMuted} />
                          <span className={`text-xs font-medium ${textMuted}`}>Access Granted To:</span>
                        </div>
                        <div className="space-y-2">
                          {accessItem.specific_items_detail.map((item) => (
                            <div key={item.id} className={`flex items-center gap-2 p-2 rounded ${bgAccent}`}>
                              <Check size={12} className="text-green-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-medium ${textPrimary}`}>{item.name}</p>
                                {item.description && (
                                  <p className={`text-xs ${textMuted} truncate`}>{item.description}</p>
                                )}
                                {item.full_path && (
                                  <p className={`text-xs ${textMuted} font-mono mt-1`}>{item.full_path}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className={`mt-3 pt-3 border-t ${borderColor}`}>
                        <div className="flex items-center gap-2">
                          <Check size={12} className="text-green-600" />
                          <span className={`text-xs ${textSecondary}`}>
                            Full access granted ({accessItem.access_detail?.items_count || 0} items)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* Company Benefits */}
            <CollapsibleSection
              title="Company Benefits"
              icon={Gift}
              isExpanded={expandedSections.benefits}
              onToggle={() => toggleSection('benefits')}
              count={safeJobData.company_benefits.length}
              isEmpty={safeJobData.company_benefits.length === 0}
            >
              <div className="space-y-4">
                {safeJobData.company_benefits.map((benefitItem, index) => (
                  <div key={benefitItem.id || index} className={`p-4 border ${borderColor} rounded-lg ${bgHover}`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h6 className={`font-semibold ${textPrimary} text-sm mb-1 flex items-center gap-2`}>
                          <Gift size={14} className="text-almet-sapphire" />
                          {benefitItem.benefit_detail?.name || `Benefit ${index + 1}`}
                        </h6>
                        {benefitItem.benefit_detail?.description && (
                          <p className={`text-xs ${textSecondary} mb-2`}>
                            {benefitItem.benefit_detail.description}
                          </p>
                        )}
                      </div>
                      {benefitItem.has_specific_items ? (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full font-medium">
                          Specific Items
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-medium">
                          All Items
                        </span>
                      )}
                    </div>
                    
                    {benefitItem.has_specific_items && benefitItem.specific_items_detail && benefitItem.specific_items_detail.length > 0 ? (
                      <div className={`mt-3 pt-3 border-t ${borderColor}`}>
                        <div className="flex items-center gap-2 mb-2">
                          <Layers size={12} className={textMuted} />
                          <span className={`text-xs font-medium ${textMuted}`}>Selected Benefits:</span>
                        </div>
                        <div className="space-y-2">
                          {benefitItem.specific_items_detail.map((item) => (
                            <div key={item.id} className={`flex items-center gap-2 p-2 rounded ${bgAccent}`}>
                              <Check size={12} className="text-green-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-medium ${textPrimary}`}>{item.name}</p>
                                {item.description && (
                                  <p className={`text-xs ${textMuted} truncate`}>{item.description}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className={`mt-3 pt-3 border-t ${borderColor}`}>
                        <div className="flex items-center gap-2">
                          <Check size={12} className="text-green-600" />
                          <span className={`text-xs ${textSecondary}`}>
                            All benefits included ({benefitItem.benefit_detail?.items_count || 0} items)
                          </span>
                        </div>
                      </div>
                     )}
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobViewModal;
                
           
 
