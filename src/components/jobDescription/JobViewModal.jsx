import React, { useState } from 'react';
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
  ChevronUp
} from 'lucide-react';

const JobViewModal = ({ job, onClose, onDownloadPDF, darkMode }) => {
  const [expandedSections, setExpandedSections] = useState({
    sections: true,
    skills: false,
    competencies: false,
    resources: false,
    benefits: false
  });

  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-almet-cloud-burst";
  const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-700";
  const textMuted = darkMode ? "text-gray-400" : "text-almet-waterloo";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";
  const bgAccent = darkMode ? "bg-almet-comet" : "bg-almet-mystic";

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
                <h3 className={`text-lg font-semibold ${textPrimary} mb-2`}>{job.job_title}</h3>
                <div className={`${textSecondary} text-sm space-y-1`}>
                  <p className="flex items-center gap-2">
                    <Building size={14} />
                    {job.business_function_name} • {job.department_name}
                    {job.unit_name && ` • ${job.unit_name}`}
                  </p>
                  {job.job_function_name && (
                    <p className="flex items-center gap-2">
                      <Target size={14} />
                      {job.job_function_name}
                    </p>
                  )}
                  {job.position_group_name && (
                    <p className="flex items-center gap-2">
                      <User size={14} />
                      {job.position_group_name}
                      {job.grading_level && ` - ${job.grading_level}`}
                    </p>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${textMuted} text-sm`}>Status:</span>
                  <span className={`px-3 py-1 rounded-full text-xs flex items-center gap-2 ${getStatusColor(job.status)}`}>
                    {getStatusIcon(job.status)}
                    {job.status_display?.status || job.status}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${textMuted} text-sm`}>Version:</span>
                  <span className={`${textPrimary} text-sm font-medium`}>v{job.version || 1}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`font-medium ${textMuted} text-sm`}>Employee:</span>
                  {job.assigned_employee_name || job.manual_employee_name ? (
                    <div className="flex items-center gap-2">
                      <UserCheck size={12} className="text-green-600" />
                      <span className={`${textPrimary} text-sm`}>
                        {job.assigned_employee_name || job.manual_employee_name}
                      </span>
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
                    {job.reports_to_name || 'N/A'}
                  </span>
                </div>
                {job.manual_employee_phone && (
                  <div className="flex justify-between items-center">
                    <span className={`font-medium ${textMuted} text-sm`}>Contact:</span>
                    <span className={`${textPrimary} text-sm`}>{job.manual_employee_phone}</span>
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
                <p className={`${textSecondary} leading-relaxed text-sm`}>{job.job_purpose}</p>
              </div>
            </div>

            {/* Job Sections */}
            {job.sections && job.sections.length > 0 && (
              <CollapsibleSection
                title="Job Sections"
                icon={BookOpen}
                isExpanded={expandedSections.sections}
                onToggle={() => toggleSection('sections')}
                count={job.sections.length}
              >
                <div className="space-y-4">
                  {job.sections.map((section, index) => (
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
            {job.required_skills && job.required_skills.length > 0 && (
              <CollapsibleSection
                title="Required Skills"
                icon={Target}
                isExpanded={expandedSections.skills}
                onToggle={() => toggleSection('skills')}
                count={job.required_skills.length}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {job.required_skills.map((skillItem, index) => (
                    <div key={index} className={`p-3 ${bgAccent} rounded-lg`}>
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${textPrimary} text-sm`}>
                          {skillItem.skill?.name || skillItem.name}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          skillItem.is_mandatory 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {skillItem.is_mandatory ? 'Required' : 'Optional'}
                        </span>
                      </div>
                      <p className={`text-xs ${textMuted} mt-1`}>
                        Level: {skillItem.proficiency_level || 'Not specified'}
                      </p>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Behavioral Competencies */}
            {job.behavioral_competencies && job.behavioral_competencies.length > 0 && (
              <CollapsibleSection
                title="Behavioral Competencies"
                icon={User}
                isExpanded={expandedSections.competencies}
                onToggle={() => toggleSection('competencies')}
                count={job.behavioral_competencies.length}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {job.behavioral_competencies.map((compItem, index) => (
                    <div key={index} className={`p-3 ${bgAccent} rounded-lg`}>
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${textPrimary} text-sm`}>
                          {compItem.competency?.name || compItem.name}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          compItem.is_mandatory 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {compItem.is_mandatory ? 'Required' : 'Optional'}
                        </span>
                      </div>
                      <p className={`text-xs ${textMuted} mt-1`}>
                        Level: {compItem.proficiency_level || 'Not specified'}
                      </p>
                      {compItem.competency?.description && (
                        <p className={`text-xs ${textSecondary} mt-2`}>
                          {compItem.competency.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Business Resources */}
            {job.business_resources && job.business_resources.length > 0 && (
              <CollapsibleSection
                title="Business Resources"
                icon={Package}
                isExpanded={expandedSections.resources}
                onToggle={() => toggleSection('resources')}
                count={job.business_resources.length}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {job.business_resources.map((resource, index) => (
                    <div key={index} className={`p-3 border ${borderColor} rounded-lg`}>
                      <h6 className={`font-medium ${textPrimary} text-sm mb-1`}>
                        {resource.name}
                      </h6>
                      {resource.description && (
                        <p className={`text-xs ${textSecondary}`}>
                          {resource.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Access Rights */}
            {job.access_rights && job.access_rights.length > 0 && (
              <CollapsibleSection
                title="Access Rights"
                icon={Shield}
                isExpanded={expandedSections.access}
                onToggle={() => toggleSection('access')}
                count={job.access_rights.length}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {job.access_rights.map((access, index) => (
                    <div key={index} className={`p-3 border ${borderColor} rounded-lg`}>
                      <h6 className={`font-medium ${textPrimary} text-sm mb-1`}>
                        {access.name}
                      </h6>
                      {access.description && (
                        <p className={`text-xs ${textSecondary}`}>
                          {access.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Company Benefits */}
            {job.company_benefits && job.company_benefits.length > 0 && (
              <CollapsibleSection
                title="Company Benefits"
                icon={Gift}
                isExpanded={expandedSections.benefits}
                onToggle={() => toggleSection('benefits')}
                count={job.company_benefits.length}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {job.company_benefits.map((benefit, index) => (
                    <div key={index} className={`p-3 border ${borderColor} rounded-lg`}>
                      <h6 className={`font-medium ${textPrimary} text-sm mb-1`}>
                        {benefit.name}
                      </h6>
                      {benefit.description && (
                        <p className={`text-xs ${textSecondary}`}>
                          {benefit.description}
                        </p>
                      )}
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
                    {job.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className={`font-medium ${textMuted}`}>Last Updated:</span>
                  <span className={`${textSecondary} ml-2`}>
                    {job.updated_at ? new Date(job.updated_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                {job.created_by_name && (
                  <div>
                    <span className={`font-medium ${textMuted}`}>Created by:</span>
                    <span className={`${textSecondary} ml-2`}>{job.created_by_name}</span>
                  </div>
                )}
                {job.line_manager_approved && (
                  <div>
                    <span className={`font-medium ${textMuted}`}>Line Manager Approved:</span>
                    <span className={`text-green-600 ml-2`}>Yes</span>
                  </div>
                )}
                {job.employee_approved && (
                  <div>
                    <span className={`font-medium ${textMuted}`}>Employee Approved:</span>
                    <span className={`text-green-600 ml-2`}>Yes</span>
                  </div>
                )}
              </div>
            </div>

            {/* Comments Section */}
            {(job.line_manager_comments || job.employee_comments) && (
              <div className="space-y-3">
                <h5 className={`font-semibold ${textPrimary} text-sm`}>Comments</h5>
                {job.line_manager_comments && (
                  <div className={`p-3 border ${borderColor} rounded-lg`}>
                    <h6 className={`font-medium ${textSecondary} text-xs mb-1`}>Line Manager Comments:</h6>
                    <p className={`text-xs ${textSecondary}`}>{job.line_manager_comments}</p>
                  </div>
                )}
                {job.employee_comments && (
                  <div className={`p-3 border ${borderColor} rounded-lg`}>
                    <h6 className={`font-medium ${textSecondary} text-xs mb-1`}>Employee Comments:</h6>
                    <p className={`text-xs ${textSecondary}`}>{job.employee_comments}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobViewModal;