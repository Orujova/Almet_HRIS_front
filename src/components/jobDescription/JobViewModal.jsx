import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  UserCheck, 
  UserX as UserVacant,
  Clock,
  CheckCircle,
  XCircle,
  RotateCcw,
  AlertCircle,
  Edit,
  Building,
  User,
  Target,
  BookOpen,
  Shield,
  Package,
  Gift,
  ChevronDown,
  ChevronUp,
  Bug
} from 'lucide-react';

const JobViewModal = ({ job, onClose, onDownloadPDF, darkMode }) => {
  const [expandedSections, setExpandedSections] = useState({
    sections: true,
    skills: false,
    competencies: false,
    resources: false,
    benefits: false,
    debug: false
  });

  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";
  const bgAccent = darkMode ? "bg-almet-comet" : "bg-almet-mystic";

  // Debug: Log the job data to console
  useEffect(() => {
    console.log('=== JOB VIEW MODAL DEBUG ===');
    console.log('Job object received:', job);
    console.log('Job keys:', Object.keys(job || {}));
    console.log('=== END DEBUG ===');
  }, [job]);

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
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
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

  const handleDownloadPDF = () => {
    if (onDownloadPDF) {
      onDownloadPDF();
    }
  };

  const formatSectionContent = (content) => {
    if (!content) return '';
    
    // Split by lines and clean up
    const lines = content.split('\n').filter(line => line.trim());
    
    return lines.map((line, index) => {
      // Remove existing bullet points and add consistent formatting
      const cleanLine = line.replace(/^[•\-\*]\s*/, '').trim();
      return cleanLine ? `• ${cleanLine}` : '';
    }).filter(line => line).join('\n');
  };

  const CollapsibleSection = ({ title, icon: Icon, isExpanded, onToggle, children, count = null }) => (
    <div className={`border ${borderColor} rounded-lg overflow-hidden`}>
      <button
        onClick={onToggle}
        className={`w-full px-4 py-3 ${bgAccent} hover:opacity-80 transition-all duration-200 
          flex items-center justify-between text-left`}
      >
        <div className="flex items-center gap-3">
          <Icon size={16} className={textPrimary} />
          <span className={`font-medium ${textPrimary} text-sm`}>{title}</span>
          {count !== null && (
            <span className={`px-2 py-1 rounded-full text-xs ${bgCard} ${textMuted}`}>
              {count}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp size={16} className={textMuted} />
        ) : (
          <ChevronDown size={16} className={textMuted} />
        )}
      </button>
      {isExpanded && (
        <div className="p-4">
          {children}
        </div>
      )}
    </div>
  );

  // Safe data extraction with fallbacks - Updated for actual API structure
  const safeJobData = {
    // Basic info
    job_title: job?.job_title || 'No Title',
    job_purpose: job?.job_purpose || 'No purpose specified',
    
    // Organization info - using actual API structure
    business_function_name: job?.business_function?.name || 'N/A',
    department_name: job?.department?.name || 'N/A',
    unit_name: job?.unit?.name || null,
    job_function_name: job?.job_function?.name || null,
    position_group_name: job?.position_group?.name || null,
    grading_level: job?.grading_level || null,
    
    // Employee info - using actual API structure
    assigned_employee_name: job?.assigned_employee?.full_name || job?.employee_info?.name || null,
    assigned_employee_id: job?.assigned_employee?.employee_id || job?.employee_info?.employee_id || null,
    assigned_employee_phone: job?.employee_info?.phone || null,
    manual_employee_name: job?.manual_employee_name || null,
    manual_employee_phone: job?.manual_employee_phone || null,
    reports_to_name: job?.reports_to?.full_name || job?.manager_info?.name || null,
    reports_to_title: job?.reports_to?.job_title || job?.manager_info?.job_title || null,
    reports_to_id: job?.reports_to?.employee_id || job?.manager_info?.employee_id || null,
    
    // Status and version
    status: job?.status || 'UNKNOWN',
    status_display: job?.status_display || { status: job?.status || 'UNKNOWN' },
    version: job?.version || 1,
    
    // Arrays - ensure they exist
    sections: job?.sections || [],
    required_skills: job?.required_skills || [],
    behavioral_competencies: job?.behavioral_competencies || [],
    business_resources: job?.business_resources || [],
    access_rights: job?.access_rights || [],
    company_benefits: job?.company_benefits || [],
    
    // Metadata
    created_at: job?.created_at || null,
    updated_at: job?.updated_at || null,
    created_by_name: job?.created_by_detail?.first_name || job?.created_by_name || null,
    line_manager_approved: !!job?.line_manager_approved_at,
    employee_approved: !!job?.employee_approved_at,
    line_manager_comments: job?.line_manager_comments || null,
    employee_comments: job?.employee_comments || null,
    
    // Permissions
    can_edit: job?.can_edit || false,
    can_approve_as_line_manager: job?.can_approve_as_line_manager || false,
    can_approve_as_employee: job?.can_approve_as_employee || false
  };

  // Check if we have minimal required data
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
      <div className={`${bgCard} rounded-lg w-full max-w-5xl max-h-[90vh] overflow-y-auto border ${borderColor}`}>
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-xl font-bold ${textPrimary}`}>Job Description Details</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadPDF}
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
                      {/* <div className="text-xs text-gray-500 mt-0.5">
                        ID: {safeJobData.assigned_employee_id}
                        {safeJobData.assigned_employee_phone && ` • ${safeJobData.assigned_employee_phone}`}
                      </div> */}
                    </div>
                  ) : safeJobData.manual_employee_name ? (
                    <div className="flex flex-col items-end">
                      <div className="flex items-center gap-2">
                        <UserCheck size={12} className="text-blue-600" />
                        <span className={`${textPrimary} text-sm font-medium`}>
                          {safeJobData.manual_employee_name}
                        </span>
                      </div>
                      {safeJobData.manual_employee_phone && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {safeJobData.manual_employee_phone}
                        </div>
                      )}
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
                  {safeJobData.reports_to_name ? (
                    <div className="flex flex-col items-end">
                      <span className={`${textPrimary} text-sm font-medium`}>
                        {safeJobData.reports_to_name}
                      </span>
                      {/* <div className="text-xs text-gray-500 mt-0.5">
                        {safeJobData.reports_to_title} • ID: {safeJobData.reports_to_id}
                      </div> */}
                    </div>
                  ) : (
                    <span className={`${textPrimary} text-sm`}>N/A</span>
                  )}
                </div>
                {safeJobData.manual_employee_phone && (
                  <div className="flex justify-between items-center">
                    <span className={`font-medium ${textMuted} text-sm`}>Contact:</span>
                    <span className={`${textPrimary} text-sm`}>{safeJobData.manual_employee_phone}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Job Purpose */}
            <div>
              <h4 className={`text-md font-semibold ${textPrimary} mb-3 flex items-center gap-2`}>
                <BookOpen size={16} />
                Job Purpose
              </h4>
              <div className={`p-4 ${bgAccent} rounded-lg`}>
                <p className={`${textSecondary} leading-relaxed  text-wrap text-sm`}>{safeJobData.job_purpose}</p>
              </div>
            </div>

          

            {/* Job Sections */}
            {safeJobData.sections && safeJobData.sections.length > 0 && (
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
            {safeJobData.required_skills && safeJobData.required_skills.length > 0 && (
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
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          skillItem.is_mandatory 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {skillItem.is_mandatory ? 'Required' : 'Optional'}
                        </span>
                      </div>
                      <div className={`text-xs ${textMuted} space-y-1`}>
                        <p>Level: <span className="font-medium">{skillItem.proficiency_level || 'Not specified'}</span></p>
                        <p>Group: <span className="font-medium">{skillItem.skill_detail?.group_name || 'N/A'}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Behavioral Competencies */}
            {safeJobData.behavioral_competencies && safeJobData.behavioral_competencies.length > 0 && (
              <CollapsibleSection
                title="Behavioral Competencies"
                icon={User}
                isExpanded={expandedSections.competencies}
                onToggle={() => toggleSection('competencies')}
                count={safeJobData.behavioral_competencies.length}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {safeJobData.behavioral_competencies.map((compItem, index) => (
                    <div key={compItem.id || index} className={`p-3 ${bgAccent} rounded-lg`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`font-medium ${textPrimary} text-sm`}>
                          {compItem.competency_detail?.name || `Competency ${index + 1}`}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          compItem.is_mandatory 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {compItem.is_mandatory ? 'Required' : 'Optional'}
                        </span>
                      </div>
                      <div className={`text-xs ${textMuted} space-y-1`}>
                        <p>Level: <span className="font-medium">{compItem.proficiency_level || 'Not specified'}</span></p>
                        <p>Group: <span className="font-medium">{compItem.competency_detail?.group_name || 'N/A'}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Business Resources */}
            {safeJobData.business_resources && safeJobData.business_resources.length > 0 && (
              <CollapsibleSection
                title="Business Resources"
                icon={Package}
                isExpanded={expandedSections.resources}
                onToggle={() => toggleSection('resources')}
                count={safeJobData.business_resources.length}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {safeJobData.business_resources.map((resourceItem, index) => (
                    <div key={resourceItem.id || index} className={`p-4 border ${borderColor} rounded-lg`}>
                      <h6 className={`font-medium ${textPrimary} text-sm mb-2`}>
                        {resourceItem.resource_detail?.name || `Resource ${index + 1}`}
                      </h6>
                      {resourceItem.resource_detail?.description && (
                        <p className={`text-xs ${textSecondary} mb-2`}>
                          {resourceItem.resource_detail.description}
                        </p>
                      )}
                      <div className={`text-xs ${textMuted}`}>
                        <p>Status: <span className={`font-medium ${resourceItem.resource_detail?.is_active ? 'text-green-600' : 'text-red-600'}`}>
                          {resourceItem.resource_detail?.is_active ? 'Active' : 'Inactive'}
                        </span></p>
                        {resourceItem.resource_detail?.created_by_name && (
                          <p>Created by: <span className="font-medium">{resourceItem.resource_detail.created_by_name}</span></p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Access Rights */}
            {safeJobData.access_rights && safeJobData.access_rights.length > 0 && (
              <CollapsibleSection
                title="Access Rights"
                icon={Shield}
                isExpanded={expandedSections.access}
                onToggle={() => toggleSection('access')}
                count={safeJobData.access_rights.length}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {safeJobData.access_rights.map((accessItem, index) => (
                    <div key={accessItem.id || index} className={`p-4 border ${borderColor} rounded-lg`}>
                      <h6 className={`font-medium ${textPrimary} text-sm mb-2`}>
                        {accessItem.access_detail?.name || `Access ${index + 1}`}
                      </h6>
                      {accessItem.access_detail?.description && (
                        <p className={`text-xs ${textSecondary} mb-2`}>
                          {accessItem.access_detail.description}
                        </p>
                      )}
                      <div className={`text-xs ${textMuted}`}>
                        <p>Status: <span className={`font-medium ${accessItem.access_detail?.is_active ? 'text-green-600' : 'text-red-600'}`}>
                          {accessItem.access_detail?.is_active ? 'Active' : 'Inactive'}
                        </span></p>
                        {accessItem.access_detail?.created_by_name && (
                          <p>Created by: <span className="font-medium">{accessItem.access_detail.created_by_name}</span></p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Company Benefits */}
            {safeJobData.company_benefits && safeJobData.company_benefits.length > 0 && (
              <CollapsibleSection
                title="Company Benefits"
                icon={Gift}
                isExpanded={expandedSections.benefits}
                onToggle={() => toggleSection('benefits')}
                count={safeJobData.company_benefits.length}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {safeJobData.company_benefits.map((benefitItem, index) => (
                    <div key={benefitItem.id || index} className={`p-4 border ${borderColor} rounded-lg`}>
                      <h6 className={`font-medium ${textPrimary} text-sm mb-2`}>
                        {benefitItem.benefit_detail?.name || `Benefit ${index + 1}`}
                      </h6>
                      {benefitItem.benefit_detail?.description && (
                        <p className={`text-xs ${textSecondary} mb-2`}>
                          {benefitItem.benefit_detail.description}
                        </p>
                      )}
                      <div className={`text-xs ${textMuted}`}>
                        <p>Status: <span className={`font-medium ${benefitItem.benefit_detail?.is_active ? 'text-green-600' : 'text-red-600'}`}>
                          {benefitItem.benefit_detail?.is_active ? 'Active' : 'Inactive'}
                        </span></p>
                        {benefitItem.benefit_detail?.created_by_name && (
                          <p>Created by: <span className="font-medium">{benefitItem.benefit_detail.created_by_name}</span></p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Metadata */}
            <div className={`p-4 ${bgAccent} rounded-lg border-l-4 border-almet-sapphire`}>
              <h5 className={`font-semibold ${textPrimary} mb-2 text-sm`}>Document Information</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className={`font-medium ${textMuted}`}>Created:</span>
                  <span className={`${textSecondary} ml-2`}>
                    {safeJobData.created_at ? new Date(safeJobData.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className={`font-medium ${textMuted}`}>Last Updated:</span>
                  <span className={`${textSecondary} ml-2`}>
                    {safeJobData.updated_at ? new Date(safeJobData.updated_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                {safeJobData.created_by_name && (
                  <div>
                    <span className={`font-medium ${textMuted}`}>Created by:</span>
                    <span className={`${textSecondary} ml-2`}>{safeJobData.created_by_name}</span>
                  </div>
                )}
                {safeJobData.line_manager_approved && (
                  <div>
                    <span className={`font-medium ${textMuted}`}>Line Manager Approved:</span>
                    <span className={`text-green-600 ml-2`}>Yes</span>
                  </div>
                )}
                {safeJobData.employee_approved && (
                  <div>
                    <span className={`font-medium ${textMuted}`}>Employee Approved:</span>
                    <span className={`text-green-600 ml-2`}>Yes</span>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            {(safeJobData.line_manager_comments || safeJobData.employee_comments) && (
              <div className="space-y-3">
                <h5 className={`font-semibold ${textPrimary} text-sm`}>Comments</h5>
                {safeJobData.line_manager_comments && (
                  <div className={`p-3 border ${borderColor} rounded-lg`}>
                    <h6 className={`font-medium ${textSecondary} text-xs mb-1`}>Line Manager Comments:</h6>
                    <p className={`text-xs ${textSecondary}`}>{safeJobData.line_manager_comments}</p>
                  </div>
                )}
                {safeJobData.employee_comments && (
                  <div className={`p-3 border ${borderColor} rounded-lg`}>
                    <h6 className={`font-medium ${textSecondary} text-xs mb-1`}>Employee Comments:</h6>
                    <p className={`text-xs ${textSecondary}`}>{safeJobData.employee_comments}</p>
                  </div>
                )}
              </div>
            )}

            {/* No Data Warning */}
            {!safeJobData.sections?.length && !safeJobData.required_skills?.length && 
             !safeJobData.behavioral_competencies?.length && !safeJobData.business_resources?.length && (
              <div className={`p-4 border border-orange-300 rounded-lg bg-orange-50 dark:bg-orange-900/20`}>
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-orange-600 mt-0.5" />
                  <div>
                    <p className={`text-sm font-medium text-orange-800 dark:text-orange-300`}>
                      Limited Data Available
                    </p>
                    <p className={`text-xs text-orange-700 dark:text-orange-400 mt-1`}>
                      This job description appears to have minimal data. It may still be in draft state or missing key information.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobViewModal;