// components/orgChart/JobDescriptionModal.jsx - UPDATED with Comments Display
'use client'
import React from 'react';
import { createPortal } from 'react-dom';
import { 
    X, Download, CheckCircle, Clock, AlertCircle, 
    Target, Briefcase, Award, Building2, Shield, Crown, User,
    UserCheck, UserX as UserVacant, Users, MessageSquare, XCircle
} from 'lucide-react';
import jobDescriptionService from '@/services/jobDescriptionService';

const JobDescriptionModal = ({ 
    showJobDescriptionModal,
    setShowJobDescriptionModal,
    jobDetail,
    setJobDetail,
    darkMode
}) => {
    if (!showJobDescriptionModal || !jobDetail) return null;

    const bgCard = darkMode ? "bg-slate-800" : "bg-white";
    const borderColor = darkMode ? "border-slate-600" : "border-gray-200";
    const textHeader = darkMode ? "text-gray-100" : "text-almet-cloud-burst";
    const textSecondary = darkMode ? "text-gray-400" : "text-almet-waterloo";
    const textMuted = darkMode ? "text-gray-500" : "text-almet-bali-hai";
    const textPrimary = darkMode ? "text-gray-200" : "text-almet-comet";
    const bgAccent = darkMode ? "bg-slate-700" : "bg-almet-mystic";
    const bgHover = darkMode ? "bg-slate-600" : "bg-gray-50";

    // 🔥 Get Overall Status Display for multi-assignment
    const getOverallStatusDisplay = (job) => {
        const overallStatus = job.overall_status || 'UNKNOWN';
        let statusColor = '';
        let statusBg = '';
        
        switch (overallStatus) {
            case 'ALL_APPROVED':
                statusColor = 'text-green-600 dark:text-green-400';
                statusBg = 'bg-green-100 dark:bg-green-900/20';
                break;
            case 'ALL_DRAFT':
                statusColor = 'text-gray-600 dark:text-gray-400';
                statusBg = 'bg-gray-100 dark:bg-gray-900/20';
                break;
            case 'PENDING_APPROVALS':
                statusColor = 'text-orange-600 dark:text-orange-400';
                statusBg = 'bg-orange-100 dark:bg-orange-900/20';
                break;
            case 'HAS_REJECTIONS':
                statusColor = 'text-red-600 dark:text-red-400';
                statusBg = 'bg-red-100 dark:bg-red-900/20';
                break;
            case 'MIXED':
                statusColor = 'text-blue-600 dark:text-blue-400';
                statusBg = 'bg-blue-100 dark:bg-blue-900/20';
                break;
            default:
                statusColor = 'text-gray-600 dark:text-gray-400';
                statusBg = 'bg-gray-100 dark:bg-gray-900/20';
        }

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${statusColor} ${statusBg}`}>
                {overallStatus.replace(/_/g, ' ')}
            </span>
        );
    };

    const handleClose = () => {
        setShowJobDescriptionModal(false);
        setJobDetail(null);
    };

    return createPortal(
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100000] p-4">
            <div className={`${bgCard} rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto border ${borderColor} shadow-2xl`}>
                <div className="p-5">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-200 dark:border-slate-600">
                        <div>
                            <h2 className={`text-xl font-bold ${textHeader} mb-2`}>
                                Job Description Details
                            </h2>
                            <div className="flex items-center gap-3 flex-wrap">
                                {getOverallStatusDisplay(jobDetail)}
                                <span className={`text-xs ${textMuted}`}>
                                    Created {jobDescriptionService.formatDate(jobDetail.created_at)}
                                </span>
                                {/* 🔥 Show total assignments count */}
                                <span className={`text-xs ${textMuted} flex items-center gap-1`}>
                                    <Users size={12} />
                                    {jobDetail.total_assignments || jobDetail.assignments?.length || 0} Assignments
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    jobDescriptionService.downloadJobDescriptionPDF(jobDetail.id);
                                }}
                                className="flex items-center gap-2 px-3.5 py-2 bg-almet-sapphire text-white rounded-xl hover:bg-almet-astral transition-colors text-xs font-semibold"
                            >
                                <Download size={14} />
                                Download PDF
                            </button>
                            <button
                                onClick={handleClose}
                                className={`p-2 ${textMuted} hover:${textPrimary} transition-colors rounded-xl hover:bg-gray-100 dark:hover:bg-slate-700`}
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Job Overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
                        {/* Left Column - Main Content */}
                        <div className="lg:col-span-2 space-y-5">
                            {/* Basic Information */}
                            <BasicInfoCard
                                jobDetail={jobDetail}
                                bgAccent={bgAccent}
                                textHeader={textHeader}
                                textMuted={textMuted}
                                textPrimary={textPrimary}
                            />

                            {/* 🔥 Assignments Summary with Comments */}
                            {jobDetail.assignments && jobDetail.assignments.length > 0 && (
                                <AssignmentsSummaryCard
                                    assignments={jobDetail.assignments}
                                    bgAccent={bgAccent}
                                    bgHover={bgHover}
                                    borderColor={borderColor}
                                    textHeader={textHeader}
                                    textMuted={textMuted}
                                    textPrimary={textPrimary}
                                    textSecondary={textSecondary}
                                />
                            )}

                            {/* Job Purpose */}
                            <JobPurposeCard
                                jobDetail={jobDetail}
                                bgAccent={bgAccent}
                                textHeader={textHeader}
                                textSecondary={textSecondary}
                            />

                            {/* Job Sections */}
                            {jobDetail.sections && jobDetail.sections.length > 0 && (
                                <JobSectionsCard
                                    sections={jobDetail.sections}
                                    bgAccent={bgAccent}
                                    textHeader={textHeader}
                                    textSecondary={textSecondary}
                                />
                            )}
                        </div>

                        {/* Right Column - Sidebar */}
                        <div className="space-y-5">
                            {/* 🔥 Assignment Statistics */}
                            <AssignmentStatsCard
                                jobDetail={jobDetail}
                                bgAccent={bgAccent}
                                borderColor={borderColor}
                                textHeader={textHeader}
                                textMuted={textMuted}
                            />

                            {/* Required Skills */}
                            {jobDetail.required_skills && jobDetail.required_skills.length > 0 && (
                                <RequiredSkillsCard
                                    skills={jobDetail.required_skills}
                                    bgAccent={bgAccent}
                                    borderColor={borderColor}
                                    textHeader={textHeader}
                                />
                            )}

                            {/* Behavioral Competencies */}
                            {jobDetail.behavioral_competencies && jobDetail.behavioral_competencies.length > 0 && (
                                <BehavioralCompetenciesCard
                                    competencies={jobDetail.behavioral_competencies}
                                    bgAccent={bgAccent}
                                    borderColor={borderColor}
                                    textHeader={textHeader}
                                />
                            )}

                            {/* Leadership Competencies */}
                            {jobDetail.leadership_competencies && jobDetail.leadership_competencies.length > 0 && (
                                <LeadershipCompetenciesCard
                                    competencies={jobDetail.leadership_competencies}
                                    bgAccent={bgAccent}
                                    borderColor={borderColor}
                                    textHeader={textHeader}
                                    textMuted={textMuted}
                                />
                            )}

                            {/* Business Resources */}
                            {jobDetail.business_resources && jobDetail.business_resources.length > 0 && (
                                <ListCard
                                    title="Business Resources"
                                    icon={Building2}
                                    items={jobDetail.business_resources}
                                    bgAccent={bgAccent}
                                    borderColor={borderColor}
                                    textHeader={textHeader}
                                    textSecondary={textSecondary}
                                />
                            )}

                            {/* Access Rights */}
                            {jobDetail.access_rights && jobDetail.access_rights.length > 0 && (
                                <ListCard
                                    title="Access Rights"
                                    icon={Shield}
                                    items={jobDetail.access_rights}
                                    bgAccent={bgAccent}
                                    borderColor={borderColor}
                                    textHeader={textHeader}
                                    textSecondary={textSecondary}
                                />
                            )}

                            {/* Company Benefits */}
                            {jobDetail.company_benefits && jobDetail.company_benefits.length > 0 && (
                                <ListCard
                                    title="Company Benefits"
                                    icon={Award}
                                    items={jobDetail.company_benefits}
                                    bgAccent={bgAccent}
                                    borderColor={borderColor}
                                    textHeader={textHeader}
                                    textSecondary={textSecondary}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

export const BasicInfoCard = ({ jobDetail, bgAccent, textHeader, textMuted, textPrimary }) => (
    <div className={`p-4 ${bgAccent} rounded-xl`}>
        <h3 className={`text-lg font-bold ${textHeader} mb-3`}>{jobDetail.job_title}</h3>
        <div className="grid grid-cols-2 gap-3 text-xs">
            <InfoItem label="Company" value={jobDetail.business_function?.name} textMuted={textMuted} textPrimary={textPrimary} />
            <InfoItem label="Department" value={jobDetail.department?.name} textMuted={textMuted} textPrimary={textPrimary} />
            <InfoItem label="Unit" value={jobDetail.unit?.name || 'N/A'} textMuted={textMuted} textPrimary={textPrimary} />
            <InfoItem label="Job Function" value={jobDetail.job_function?.name || 'N/A'} textMuted={textMuted} textPrimary={textPrimary} />
            <InfoItem 
                label="Hierarchy" 
                value={jobDetail.position_group?.display_name || jobDetail.position_group?.name} 
                textMuted={textMuted} 
                textPrimary={textPrimary} 
            />
            <InfoItem 
                label="Grading Levels" 
                value={jobDetail.grading_levels?.length > 0 ? jobDetail.grading_levels.join(', ') : jobDetail.grading_level || 'N/A'} 
                textMuted={textMuted} 
                textPrimary={textPrimary} 
            />
        </div>
    </div>
);

const InfoItem = ({ label, value, textMuted, textPrimary, isVacant }) => (
    <div>
        <span className={`font-semibold ${textMuted}`}>{label}:</span>
        <p className={`${textPrimary} mt-1 ${isVacant ? 'text-orange-600 dark:text-orange-400 font-semibold' : ''}`}>
            {isVacant && <AlertCircle size={14} className="inline mr-1" />}
            {value}
        </p>
    </div>
);

// 🔥 UPDATED: Assignments Summary Card with Comments
export const AssignmentsSummaryCard = ({ 
    assignments, bgAccent, bgHover, borderColor, textHeader, textMuted, textPrimary, textSecondary 
}) => (
    <div className={`p-4 ${bgAccent} rounded-xl border ${borderColor}`}>
        <h4 className={`text-base font-bold ${textHeader} mb-3 flex items-center gap-2`}>
            <Users size={16} className="text-almet-sapphire" />
            Assignments ({assignments.length})
        </h4>
        <div className="space-y-3 max-h-96 overflow-y-auto">
            {assignments.map((assignment, index) => {
                const isVacant = assignment.is_vacancy || assignment.employee_name === 'VACANT';
                const employeeName = isVacant 
                    ? (assignment.vacancy_position?.position_id || 'VACANT')
                    : (assignment.employee?.full_name || assignment.employee_name || 'Unknown');
                
                // Check if has comments
                const hasComments = assignment.line_manager_comments || assignment.employee_comments;
                
                return (
                    <div key={assignment.id || index} className={`p-3 ${bgHover} rounded-lg border ${borderColor}`}>
                        {/* Employee/Vacancy Info */}
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 flex-1">
                                {isVacant ? (
                                    <UserVacant size={14} className="text-orange-600 flex-shrink-0" />
                                ) : (
                                    <UserCheck size={14} className="text-green-600 flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <p className={`text-xs font-semibold ${textPrimary} truncate`}>
                                        {employeeName}
                                    </p>
                                    {assignment.employee?.employee_id && (
                                        <p className={`text-[10px] ${textMuted}`}>
                                            ID: {assignment.employee.employee_id}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Comment indicator */}
                                {hasComments && (
                                    <MessageSquare size={12} className="text-blue-600" />
                                )}
                                {/* Status icon */}
                                {assignment.status === 'APPROVED' ? (
                                    <CheckCircle size={12} className="text-green-600" />
                                ) : assignment.status === 'REJECTED' ? (
                                    <XCircle size={12} className="text-red-600" />
                                ) : (
                                    <Clock size={12} className="text-orange-600" />
                                )}
                            </div>
                        </div>

                        {/* Status Badge */}
                        {assignment.status_display && (
                            <div className="mb-2">
                                <span 
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium"
                                    style={{
                                        color: assignment.status_display.color,
                                        backgroundColor: assignment.status_display.color + '20'
                                    }}
                                >
                                    {assignment.status_display.status}
                                </span>
                            </div>
                        )}

                        {/* ✅ APPROVAL DATES */}
                        {(assignment.line_manager_approved_at || assignment.employee_approved_at) && (
                            <div className={`text-[10px] ${textMuted} space-y-1 mb-2`}>
                                {assignment.line_manager_approved_at && (
                                    <div className="flex items-center gap-1">
                                        <CheckCircle size={8} className="text-green-500" />
                                        <span>Manager: {jobDescriptionService.formatDateTime(assignment.line_manager_approved_at)}</span>
                                    </div>
                                )}
                                {assignment.employee_approved_at && (
                                    <div className="flex items-center gap-1">
                                        <CheckCircle size={8} className="text-green-500" />
                                        <span>Employee: {jobDescriptionService.formatDateTime(assignment.employee_approved_at)}</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ✅ LINE MANAGER COMMENTS */}
                        {assignment.line_manager_comments && (
                            <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                <div className="flex items-start gap-2 mb-1">
                                    <User size={10} className="text-blue-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-[10px] font-semibold text-blue-700 dark:text-blue-300">
                                        Manager Comment:
                                    </span>
                                </div>
                                <p className={`text-[10px] ${textSecondary} leading-relaxed ml-4`}>
                                    {assignment.line_manager_comments}
                                </p>
                            </div>
                        )}

                        {/* ✅ EMPLOYEE COMMENTS */}
                        {assignment.employee_comments && (
                            <div className="mt-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                <div className="flex items-start gap-2 mb-1">
                                    <UserCheck size={10} className="text-green-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-[10px] font-semibold text-green-700 dark:text-green-300">
                                        Employee Comment:
                                    </span>
                                </div>
                                <p className={`text-[10px] ${textSecondary} leading-relaxed ml-4`}>
                                    {assignment.employee_comments}
                                </p>
                            </div>
                        )}
                    </div>
                );
            })}
            
            {assignments.length > 10 && (
                <p className={`text-center text-[10px] ${textMuted} pt-2`}>
                    +{assignments.length - 10} more assignments
                </p>
            )}
        </div>
    </div>
);

// 🔥 Assignment Statistics Card
export const AssignmentStatsCard = ({ jobDetail, bgAccent, borderColor, textHeader, textMuted }) => {
    const totalAssignments = jobDetail.total_assignments || jobDetail.assignments?.length || 0;
    const employeeCount = jobDetail.employee_assignments_count || 0;
    const vacancyCount = jobDetail.vacancy_assignments_count || 0;
    const approvedCount = jobDetail.approved_count || 0;
    const pendingCount = jobDetail.pending_count || 0;

    return (
        <div className={`p-4 ${bgAccent} rounded-xl border ${borderColor}`}>
            <h4 className={`font-bold ${textHeader} mb-3 flex items-center gap-2 text-sm`}>
                <Users size={16} className="text-almet-sapphire" />
                Assignment Statistics
            </h4>
            <div className="space-y-2">
                <StatItem
                    label="Total Assignments"
                    value={totalAssignments}
                    textMuted={textMuted}
                />
                <StatItem
                    label="Employees"
                    value={employeeCount}
                    icon={<UserCheck size={12} className="text-green-600" />}
                    textMuted={textMuted}
                />
                <StatItem
                    label="Vacancies"
                    value={vacancyCount}
                    icon={<UserVacant size={12} className="text-orange-600" />}
                    textMuted={textMuted}
                />
                <StatItem
                    label="Approved"
                    value={approvedCount}
                    icon={<CheckCircle size={12} className="text-green-600" />}
                    textMuted={textMuted}
                />
                <StatItem
                    label="Pending"
                    value={pendingCount}
                    icon={<Clock size={12} className="text-orange-600" />}
                    textMuted={textMuted}
                />
            </div>
        </div>
    );
};

const StatItem = ({ label, value, icon, textMuted }) => (
    <div className="flex items-center justify-between">
        <span className={`text-xs font-semibold ${textMuted} flex items-center gap-1`}>
            {icon}
            {label}
        </span>
        <span className="text-xs font-bold text-almet-sapphire dark:text-almet-steel-blue">
            {value}
        </span>
    </div>
);

export const JobPurposeCard = ({ jobDetail, bgAccent, textHeader, textSecondary }) => (
    <div>
        <h4 className={`text-base font-bold ${textHeader} mb-2 flex items-center gap-2`}>
            <Target size={16} className="text-almet-sapphire" />
            Job Purpose
        </h4>
        <div className={`p-4 ${bgAccent} rounded-xl`}>
            <p className={`${textSecondary} leading-relaxed text-xs`}>{jobDetail.job_purpose}</p>
        </div>
    </div>
);

export const JobSectionsCard = ({ sections, bgAccent, textHeader, textSecondary }) => (
    <div className="space-y-5">
        {sections.map((section, index) => (
            <div key={index}>
                <h4 className={`text-base font-bold ${textHeader} mb-2 flex items-center gap-2`}>
                    <Briefcase size={16} className="text-almet-sapphire" />
                    {section.title}
                </h4>
                <div className={`p-4 ${bgAccent} rounded-xl`}>
                    <div className={`${textSecondary} leading-relaxed whitespace-pre-line text-xs`}>
                        {section.content}
                    </div>
                </div>
            </div>
        ))}
    </div>
);

export const RequiredSkillsCard = ({ skills, bgAccent, borderColor, textHeader }) => (
    <div className={`p-4 ${bgAccent} rounded-xl border ${borderColor}`}>
        <h4 className={`font-bold ${textHeader} mb-3 flex items-center gap-2 text-sm`}>
            <Award size={16} className="text-almet-sapphire" />
            Required Skills
        </h4>
        <div className="space-y-2">
            {skills.map((skill, index) => (
                <div key={index} className="flex items-center justify-between py-0.5">
                    <span className="inline-block bg-blue-100 dark:bg-almet-sapphire/20 text-blue-800 dark:text-blue-300 px-2.5 py-1 rounded-full text-[10px] font-semibold">
                        {skill.skill_detail?.name || skill.name}
                    </span>
                </div>
            ))}
        </div>
    </div>
);

export const BehavioralCompetenciesCard = ({ competencies, bgAccent, borderColor, textHeader }) => (
    <div className={`p-4 ${bgAccent} rounded-xl border ${borderColor}`}>
        <h4 className={`font-bold ${textHeader} mb-3 flex items-center gap-2 text-sm`}>
            <User size={16} className="text-blue-600" />
            Behavioral Competencies
        </h4>
        <div className="space-y-2">
            {competencies.map((comp, index) => (
                <div key={index} className="flex items-center justify-between py-0.5">
                    <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-2.5 py-1 rounded-full text-[10px] font-semibold">
                        {comp.competency_detail?.name || comp.name}
                    </span>
                </div>
            ))}
        </div>
    </div>
);

export const LeadershipCompetenciesCard = ({ competencies, bgAccent, borderColor, textHeader, textMuted }) => (
    <div className={`p-4 ${bgAccent} rounded-xl border ${borderColor} border-l-4 border-l-purple-500`}>
        <h4 className={`font-bold ${textHeader} mb-3 flex items-center gap-2 text-sm`}>
            <Crown size={16} className="text-purple-600" />
            Leadership Competencies
        </h4>
        <div className="space-y-2">
            {competencies.map((comp, index) => (
                <div key={index} className="space-y-1">
                    <span className="inline-block bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 px-2.5 py-1 rounded-full text-[10px] font-semibold">
                        <Crown size={10} className="inline mr-1" />
                        {comp.leadership_item_detail?.name || comp.item_detail?.name || comp.name}
                    </span>
                    {(comp.leadership_item_detail?.child_group_name || comp.leadership_item_detail?.main_group_name) && (
                        <div className={`text-[9px] ${textMuted} pl-2`}>
                            {comp.leadership_item_detail?.main_group_name && (
                                <span>{comp.leadership_item_detail.main_group_name}</span>
                            )}
                            {comp.leadership_item_detail?.child_group_name && (
                                <span> › {comp.leadership_item_detail.child_group_name}</span>
                            )}
                        </div>
                    )}
                </div>
            ))}
        </div>
    </div>
);

export const ListCard = ({ title, icon: Icon, items, bgAccent, borderColor, textHeader, textSecondary }) => (
    <div className={`p-4 ${bgAccent} rounded-xl border ${borderColor}`}>
        <h4 className={`font-bold ${textHeader} mb-3 flex items-center gap-2 text-sm`}>
            <Icon size={16} className="text-almet-sapphire" />
            {title}
        </h4>
        <div className="space-y-1.5">
            {items.map((item, index) => (
                <div key={index} className={`text-xs ${textSecondary} flex items-center gap-2`}>
                    <div className="w-1 h-1 bg-almet-sapphire rounded-full flex-shrink-0"></div>
                    {item.resource_detail?.name || item.access_detail?.name || item.benefit_detail?.name || item.name}
                </div>
            ))}
        </div>
    </div>
);

export default JobDescriptionModal;