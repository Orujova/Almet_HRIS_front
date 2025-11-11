// components/orgChart/JobDescriptionModal.jsx - Part 1
'use client'
import React from 'react';
import { createPortal } from 'react-dom';
import { 
    X, Download, CheckCircle, Clock, AlertCircle, 
    Target, Briefcase, Award, Building2, Shield 
} from 'lucide-react';
import jobDescriptionService from '@/services/jobDescriptionService';

export const JobDescriptionModal = ({ 
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

    // Get Job Status Display
    const getJobStatusDisplay = (job) => {
        const statusInfo = jobDescriptionService.getStatusInfo(job.status);
        let statusColor = '';
        let statusBg = '';
        
        switch (job.status) {
            case 'DRAFT':
                statusColor = 'text-almet-waterloo dark:text-almet-santas-gray';
                statusBg = 'bg-gray-100 dark:bg-almet-comet/30';
                break;
            case 'PENDING_LINE_MANAGER':
            case 'PENDING_EMPLOYEE':
                statusColor = 'text-orange-600 dark:text-orange-400';
                statusBg = 'bg-orange-100 dark:bg-orange-900/20';
                break;
            case 'APPROVED':
            case 'ACTIVE':
                statusColor = 'text-green-600 dark:text-green-400';
                statusBg = 'bg-green-100 dark:bg-green-900/20';
                break;
            case 'REJECTED':
                statusColor = 'text-red-600 dark:text-red-400';
                statusBg = 'bg-red-100 dark:bg-red-900/20';
                break;
            default:
                statusColor = 'text-almet-waterloo dark:text-almet-santas-gray';
                statusBg = 'bg-gray-100 dark:bg-almet-comet/30';
        }

        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${statusColor} ${statusBg}`}>
                {job.status_display?.status || statusInfo.label}
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
                                {getJobStatusDisplay(jobDetail)}
                                <span className={`text-xs ${textMuted}`}>
                                    Created {jobDescriptionService.formatDate(jobDetail.created_at)}
                                </span>
                                <span className={`text-xs ${textMuted}`}>
                                    Employee: {jobDescriptionService.getEmployeeDisplayName(jobDetail)}
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
                            {/* Approval Status */}
                            <ApprovalStatusCard
                                jobDetail={jobDetail}
                                bgAccent={bgAccent}
                                bgCard={bgCard}
                                borderColor={borderColor}
                                textHeader={textHeader}
                                textMuted={textMuted}
                                textSecondary={textSecondary}
                            />

                            {/* Next Action Required */}
                            <NextActionCard
                                jobDetail={jobDetail}
                                bgAccent={bgAccent}
                                borderColor={borderColor}
                                textHeader={textHeader}
                                textSecondary={textSecondary}
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
            <InfoItem label="Grading Level" value={jobDetail.grading_level || 'N/A'} textMuted={textMuted} textPrimary={textPrimary} />
            <InfoItem label="Reports To" value={jobDetail.reports_to?.full_name || 'N/A'} textMuted={textMuted} textPrimary={textPrimary} />
            <InfoItem 
                label="Position Type" 
                value={jobDescriptionService.isVacantPosition(jobDetail) ? 'Vacant' : 'Assigned'}
                textMuted={textMuted} 
                textPrimary={textPrimary}
                isVacant={jobDescriptionService.isVacantPosition(jobDetail)}
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

// Job Purpose Card
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

// Job Sections Card
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

// Approval Status Card
export const ApprovalStatusCard = ({ 
    jobDetail, bgAccent, bgCard, borderColor, textHeader, textMuted, textSecondary 
}) => (
    <div className={`p-4 ${bgAccent} rounded-xl border ${borderColor}`}>
        <h4 className={`font-bold ${textHeader} mb-3 flex items-center gap-2 text-sm`}>
            <CheckCircle size={16} className="text-almet-sapphire" />
            Approval Status
        </h4>
        <div className="space-y-3">
            <ApprovalItem
                label="Line Manager"
                approved={!!jobDetail.line_manager_approved_at}
            />
            <ApprovalItem
                label="Employee"
                approved={!!jobDetail.employee_approved_at}
            />
            
            {jobDetail.line_manager_comments && (
                <CommentBox
                    title="Manager Comments"
                    comment={jobDetail.line_manager_comments}
                    bgCard={bgCard}
                    textMuted={textMuted}
                    textSecondary={textSecondary}
                />
            )}
            {jobDetail.employee_comments && (
                <CommentBox
                    title="Employee Comments"
                    comment={jobDetail.employee_comments}
                    bgCard={bgCard}
                    textMuted={textMuted}
                    textSecondary={textSecondary}
                />
            )}
        </div>
    </div>
);

const ApprovalItem = ({ label, approved }) => (
    <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-almet-waterloo dark:text-almet-santas-gray">
            {label}
        </span>
        <span className={`flex items-center gap-2 text-xs font-semibold ${
            approved 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-orange-600 dark:text-orange-400'
        }`}>
            {approved ? <CheckCircle size={12} /> : <Clock size={12} />}
            {approved ? 'Approved' : 'Pending'}
        </span>
    </div>
);

const CommentBox = ({ title, comment, bgCard, textMuted, textSecondary }) => (
    <div className={`mt-3 p-2.5 ${bgCard} rounded-lg`}>
        <span className={`text-xs font-semibold ${textMuted}`}>{title}:</span>
        <p className={`text-xs ${textSecondary} mt-1`}>{comment}</p>
    </div>
);

// Next Action Card
export const NextActionCard = ({ jobDetail, bgAccent, borderColor, textHeader, textSecondary }) => (
    <div className={`p-4 ${bgAccent} rounded-xl border ${borderColor}`}>
        <h4 className={`font-bold ${textHeader} mb-2 flex items-center gap-2 text-sm`}>
            <Target size={16} className="text-almet-sapphire" />
            Next Action
        </h4>
        <p className={`text-xs ${textSecondary} leading-relaxed`}>
            {jobDescriptionService.getNextAction(jobDetail)}
        </p>
    </div>
);

// Required Skills Card
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

// Generic List Card (for Business Resources, Access Rights, Company Benefits)
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
                    {item.name}
                </div>
            ))}
        </div>
    </div>
);

export default JobDescriptionModal;