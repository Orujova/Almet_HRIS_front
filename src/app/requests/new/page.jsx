'use client';
import React, { useState } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { 
  UserCheck, RefreshCw, FileText, LogOut, User, Send, X, 
  Eye, CheckCircle, XCircle, Clock, ChevronRight, Search,
  Filter, Download, AlertCircle, Briefcase, Award, Building,
  TrendingUp, MessageSquare, Save
} from 'lucide-react';

export default function HRAdminManagement() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('probation');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [showEvaluationForm, setShowEvaluationForm] = useState(false);
  const [showContractForm, setShowContractForm] = useState(false);

  // DEFAULT ADMIN ROLE
  const currentUserRole = 'admin';

  // Mock data
  const [probationReviews, setProbationReviews] = useState([
    {
      id: 1,
      employee: 'Ali Mammadov',
      empId: 'EMP001',
      position: 'Software Developer',
      department: 'IT',
      startDate: '2024-09-15',
      probationEnd: '2024-12-15',
      daysRemaining: 5,
      manager: 'Rashad Aliyev',
      status: 'Pending Review',
      submittedDate: null
    },
    {
      id: 2,
      employee: 'Aysel Hasanova',
      empId: 'EMP005',
      position: 'Marketing Specialist',
      department: 'Marketing',
      startDate: '2024-10-01',
      probationEnd: '2025-01-01',
      daysRemaining: 15,
      manager: 'Nigar Hasanova',
      status: 'Submitted',
      submittedDate: '2024-12-20',
      evaluation: {
        jobKnowledge: { rating: 4, comments: 'Strong technical knowledge' },
        workQuality: { rating: 5, comments: 'Excellent quality work' },
        productivity: { rating: 4, comments: 'Very productive' },
        communication: { rating: 4, comments: 'Good communication skills' },
        teamwork: { rating: 5, comments: 'Great team player' },
        initiative: { rating: 4, comments: 'Shows good initiative' },
        attendance: { rating: 5, comments: 'Perfect attendance' },
        policyCompliance: { rating: 5, comments: 'Follows all policies' },
        achievements: 'Successfully completed 3 major projects ahead of schedule',
        improvementAreas: 'Could improve documentation skills',
        overallRating: 4,
        managerSummary: 'Excellent performance during probation period. Highly recommended for confirmation.',
        recommendation: 'confirm'
      }
    }
  ]);

  const [contractRenewals, setContractRenewals] = useState([
    {
      id: 1,
      employee: 'Leyla Ibrahimova',
      empId: 'EMP002',
      position: 'Marketing Manager',
      department: 'Marketing',
      contractType: 'Fixed-term',
      contractEnd: '2025-01-10',
      daysRemaining: 25,
      manager: 'Nigar Hasanova',
      status: 'Pending Decision',
      submittedDate: null
    },
    {
      id: 2,
      employee: 'Kamran Aliyev',
      empId: 'EMP006',
      position: 'Sales Manager',
      department: 'Sales',
      contractType: 'Fixed-term',
      contractEnd: '2025-02-15',
      daysRemaining: 60,
      manager: 'Elvin Guliyev',
      status: 'Submitted',
      submittedDate: '2024-12-22',
      decision: {
        decision: 'renew',
        newContractType: 'Permanent',
        salaryChange: true,
        newSalary: '5000',
        positionChange: false,
        comments: 'Excellent performance, recommend permanent contract with salary increase'
      }
    }
  ]);

  const [resignations] = useState([
    {
      id: 1,
      employee: 'Vusal Hasanov',
      empId: 'EMP003',
      position: 'Sales Executive',
      department: 'Sales',
      submittedDate: '2024-11-20',
      noticePeriod: 30,
      lastDay: '2024-12-20',
      status: 'Pending Manager',
      reason: 'Career Growth',
      reasonDetails: 'Accepted position at larger company with better career advancement opportunities.',
      willingToStay: 'no',
      projectsStatus: 'All projects handed over to team members',
      manager: 'Elvin Guliyev',
      daysRemaining: 7
    },
    {
      id: 2,
      employee: 'Sabina Quliyeva',
      empId: 'EMP007',
      position: 'HR Specialist',
      department: 'HR',
      submittedDate: '2024-12-15',
      noticePeriod: 30,
      lastDay: '2025-01-15',
      status: 'Manager Approved',
      reason: 'Relocation',
      reasonDetails: 'Moving to another city due to family reasons.',
      willingToStay: 'maybe',
      retentionOffer: 'Remote work option would be helpful',
      projectsStatus: 'Currently documenting all HR processes',
      manager: 'Aynur Mammadova',
      daysRemaining: 30,
      managerApprovalDate: '2024-12-16',
      managerComments: 'Sad to see her go, excellent employee'
    }
  ]);

  const [exitInterviews] = useState([
    {
      id: 1,
      employee: 'Vusal Hasanov',
      empId: 'EMP003',
      position: 'Sales Executive',
      department: 'Sales',
      lastDay: '2024-12-20',
      submittedDate: '2024-12-18',
      status: 'Completed',
      reasonForLeaving: 'Career Growth',
      responses: {
        jobReflection: 4,
        responsibilitiesClear: 4,
        challenges: 'Limited growth opportunities in current role',
        managerRelationship: 3,
        teamCollaboration: 4,
        feedbackReceived: 3,
        leadershipComments: 'Good leadership but could improve career development support',
        salaryBenefits: 2,
        growthOpportunities: 2,
        retentionSuggestions: 'Better career path planning and salary adjustments',
        workingConditions: 4,
        systemsEfficiency: 3,
        improvements: 'Need better CRM system and more training opportunities',
        companyValues: 4,
        professionalAtmosphere: 4,
        culturalWords: 'Supportive, Professional, Traditional',
        finalComments: 'Great company culture, but need to work on career development and compensation'
      }
    }
  ]);

  const InfoItem = ({ label, value }) => (
    <div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{label}</p>
      <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{value || '-'}</p>
    </div>
  );

  const StatusBadge = ({ status }) => {
    const colors = {
      'Pending Review': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      'Pending Decision': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      'Pending Manager': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
      'Submitted': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
      'Manager Approved': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      'HR Approved': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      'Completed': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
      'Rejected': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-700'}`}>
        {status}
      </span>
    );
  };

  const TabButton = ({ active, onClick, icon: Icon, label, count }) => (
    <button
      onClick={onClick}
      className={`flex-1 px-4 py-3 font-medium transition-colors border-b-2 ${
        active
          ? 'border-almet-sapphire text-almet-sapphire bg-blue-50 dark:bg-blue-900/20'
          : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
      }`}
    >
      <div className="flex items-center justify-center gap-2">
        <Icon size={18} />
        <span className="text-sm">{label}</span>
        {count !== undefined && (
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            active ? 'bg-almet-sapphire text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
          }`}>
            {count}
          </span>
        )}
      </div>
    </button>
  );

  // Rating Field Component
  const RatingField = ({ label, value, onChange, labels }) => (
    <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
      {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">{label}</label>}
      <div className="flex items-center gap-3">
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => onChange(rating)}
              className={`w-12 h-12 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${
                value >= rating
                  ? 'bg-almet-sapphire text-white shadow-md scale-105'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {rating}
            </button>
          ))}
        </div>
        <div className="flex-1">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {labels[value - 1]}
          </span>
        </div>
      </div>
    </div>
  );

  // Probation Evaluation Form Modal
  const ProbationEvaluationModal = ({ review, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    jobKnowledge: 3,
    workQuality: 3,
    productivity: 3,
    communication: 3,
    teamwork: 3,
    initiative: 3,
    attendance: 3,
    policyCompliance: 3,
    achievements: '',
    improvementAreas: '',
    overallRating: 3,
    managerSummary: '',
    recommendation: '',
    extendDays: 30
  });

  const ratingLabels = ['Poor', 'Below Average', 'Average', 'Good', 'Excellent'];

  const handleSubmit = () => {
    if (!formData.recommendation) {
      alert('Please select a recommendation');
      return;
    }
    if (!formData.managerSummary.trim()) {
      alert('Please provide manager summary');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-almet-sapphire to-almet-astral p-5 text-white flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold">Probation Period Evaluation</h2>
            <p className="text-blue-100 mt-0.5 text-sm">{review.employee} - {review.empId}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Employee Info */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Employee Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <InfoItem label="Name" value={review.employee} />
              <InfoItem label="Position" value={review.position} />
              <InfoItem label="Department" value={review.department} />
              <InfoItem label="Probation Period" value={`${review.startDate} to ${review.probationEnd}`} />
            </div>
          </div>

          {/* Performance Ratings */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Performance Evaluation (1-5 Scale)</h3>
            <div className="space-y-3">
              <RatingField 
                label="Job Knowledge & Skills"
                value={formData.jobKnowledge}
                onChange={(val) => setFormData({...formData, jobKnowledge: val})}
                labels={ratingLabels}
              />
              <RatingField 
                label="Work Quality"
                value={formData.workQuality}
                onChange={(val) => setFormData({...formData, workQuality: val})}
                labels={ratingLabels}
              />
              <RatingField 
                label="Productivity"
                value={formData.productivity}
                onChange={(val) => setFormData({...formData, productivity: val})}
                labels={ratingLabels}
              />
              <RatingField 
                label="Communication Skills"
                value={formData.communication}
                onChange={(val) => setFormData({...formData, communication: val})}
                labels={ratingLabels}
              />
              <RatingField 
                label="Teamwork & Collaboration"
                value={formData.teamwork}
                onChange={(val) => setFormData({...formData, teamwork: val})}
                labels={ratingLabels}
              />
              <RatingField 
                label="Initiative & Proactivity"
                value={formData.initiative}
                onChange={(val) => setFormData({...formData, initiative: val})}
                labels={ratingLabels}
              />
              <RatingField 
                label="Attendance & Punctuality"
                value={formData.attendance}
                onChange={(val) => setFormData({...formData, attendance: val})}
                labels={ratingLabels}
              />
              <RatingField 
                label="Policy Compliance"
                value={formData.policyCompliance}
                onChange={(val) => setFormData({...formData, policyCompliance: val})}
                labels={ratingLabels}
              />
            </div>
          </div>

          {/* Achievements */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Key Achievements During Probation
            </label>
            <textarea
              value={formData.achievements}
              onChange={(e) => setFormData({...formData, achievements: e.target.value})}
              rows={3}
              placeholder="List main achievements and contributions..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
            />
          </div>

          {/* Improvement Areas */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Areas for Improvement
            </label>
            <textarea
              value={formData.improvementAreas}
              onChange={(e) => setFormData({...formData, improvementAreas: e.target.value})}
              rows={3}
              placeholder="Identify areas where improvement is needed..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
            />
          </div>

          {/* Overall Rating */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Overall Rating <span className="text-red-500">*</span>
            </label>
            <RatingField 
              label=""
              value={formData.overallRating}
              onChange={(val) => setFormData({...formData, overallRating: val})}
              labels={ratingLabels}
            />
          </div>

          {/* Manager Summary */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Manager Summary <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.managerSummary}
              onChange={(e) => setFormData({...formData, managerSummary: e.target.value})}
              rows={3}
              placeholder="Provide overall assessment and comments..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
            />
          </div>

          {/* Recommendation */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Recommendation <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-start p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-500 transition-all">
                <input 
                  type="radio" 
                  name="recommendation" 
                  value="confirm"
                  checked={formData.recommendation === 'confirm'}
                  onChange={(e) => setFormData({...formData, recommendation: e.target.value})}
                  className="w-4 h-4 text-green-600 mt-0.5"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">✅ Confirm Employment</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Employee successfully completed probation period</p>
                </div>
              </label>

              <label className="flex items-start p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-yellow-50 dark:hover:bg-yellow-900/20 hover:border-yellow-500 transition-all">
                <input 
                  type="radio" 
                  name="recommendation" 
                  value="extend"
                  checked={formData.recommendation === 'extend'}
                  onChange={(e) => setFormData({...formData, recommendation: e.target.value})}
                  className="w-4 h-4 text-yellow-600 mt-0.5"
                />
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">⏱️ Extend Probation Period</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Additional time needed for evaluation</p>
                </div>
              </label>

              {formData.recommendation === 'extend' && (
                <div className="ml-7 mt-2">
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Extension Period (days)
                  </label>
                  <select 
                    value={formData.extendDays}
                    onChange={(e) => setFormData({...formData, extendDays: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
                  >
                    <option value="14">14 days (2 weeks)</option>
                    <option value="30">30 days (1 month)</option>
                    <option value="45">45 days (1.5 months)</option>
                    <option value="60">60 days (2 months)</option>
                  </select>
                </div>
              )}

              <label className="flex items-start p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-500 transition-all">
                <input 
                  type="radio" 
                  name="recommendation" 
                  value="not-confirm"
                  checked={formData.recommendation === 'not-confirm'}
                  onChange={(e) => setFormData({...formData, recommendation: e.target.value})}
                  className="w-4 h-4 text-red-600 mt-0.5"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">❌ Do Not Confirm</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Terminate employment at end of probation</p>
                </div>
              </label>
            </div>
          </div>

          {/* Warning */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <div className="flex gap-2">
              <AlertCircle className="text-almet-sapphire dark:text-blue-400 flex-shrink-0" size={16} />
              <div className="text-xs text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">After Submission:</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  <li>Evaluation will be sent to HR for review</li>
                  <li>Employee will be notified of the decision</li>
                  <li>If confirmed: Employee status will be updated to permanent</li>
                  <li>If not confirmed: HR will initiate termination process</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 px-5 py-3 flex gap-3 justify-end border-t border-gray-200 dark:border-gray-600">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            className="px-4 py-2 text-sm bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors font-medium flex items-center gap-2"
          >
            <Send size={16} />
            Submit Evaluation
          </button>
        </div>
      </div>
    </div>
  );
};

  // Contract Renewal Form Modal
  const ContractRenewalModal = ({ contract, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    decision: '',
    newContractType: 'Permanent',
    contractDuration: 12,
    salaryChange: false,
    newSalary: '',
    positionChange: false,
    newPosition: '',
    comments: ''
  });

  const handleSubmit = () => {
    if (!formData.decision) {
      alert('Please select a decision');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-green-600 to-emerald-600 p-5 text-white flex items-center justify-between z-10">
          <div>
            <h2 className="text-lg font-bold">Contract Renewal Decision</h2>
            <p className="text-green-100 mt-0.5 text-sm">{contract.employee} - {contract.empId}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Employee Info */}
          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Employee Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <InfoItem label="Name" value={contract.employee} />
              <InfoItem label="Position" value={contract.position} />
              <InfoItem label="Department" value={contract.department} />
              <InfoItem label="Current Contract" value={contract.contractType} />
              <InfoItem label="Contract Expires" value={contract.contractEnd} />
              <InfoItem label="Days Remaining" value={`${contract.daysRemaining} days`} />
            </div>
          </div>

          {/* Decision */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Renewal Decision <span className="text-red-500">*</span>
            </label>
            <div className="space-y-2">
              <label className="flex items-start p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-500 transition-all">
                <input 
                  type="radio" 
                  name="decision" 
                  value="renew"
                  checked={formData.decision === 'renew'}
                  onChange={(e) => setFormData({...formData, decision: e.target.value})}
                  className="w-4 h-4 text-green-600 mt-0.5"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">✅ Renew Contract</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Continue employment with new terms</p>
                </div>
              </label>

              <label className="flex items-start p-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-500 transition-all">
                <input 
                  type="radio" 
                  name="decision" 
                  value="not-renew"
                  checked={formData.decision === 'not-renew'}
                  onChange={(e) => setFormData({...formData, decision: e.target.value})}
                  className="w-4 h-4 text-red-600 mt-0.5"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">❌ Do Not Renew</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Let contract expire</p>
                </div>
              </label>
            </div>
          </div>

          {/* Renewal Terms (only if renewing) */}
          {formData.decision === 'renew' && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Contract Type <span className="text-red-500">*</span>
                </label>
                <select 
                  value={formData.newContractType}
                  onChange={(e) => setFormData({...formData, newContractType: e.target.value})}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="Permanent">Permanent Contract</option>
                  <option value="Fixed-term">Fixed-term Contract</option>
                  <option value="Part-time">Part-time Contract</option>
                </select>
              </div>

              {formData.newContractType === 'Fixed-term' && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Contract Duration (months)
                  </label>
                  <select 
                    value={formData.contractDuration}
                    onChange={(e) => setFormData({...formData, contractDuration: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="6">6 months</option>
                    <option value="12">12 months</option>
                    <option value="18">18 months</option>
                    <option value="24">24 months</option>
                  </select>
                </div>
              )}

              {/* Salary Change */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={formData.salaryChange}
                    onChange={(e) => setFormData({...formData, salaryChange: e.target.checked})}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Salary Adjustment</span>
                </label>
              </div>

              {formData.salaryChange && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Salary Amount (AZN)
                  </label>
                  <input 
                    type="number"
                    value={formData.newSalary}
                    onChange={(e) => setFormData({...formData, newSalary: e.target.value})}
                    placeholder="Enter new salary..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              )}

              {/* Position Change */}
              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox"
                    checked={formData.positionChange}
                    onChange={(e) => setFormData({...formData, positionChange: e.target.checked})}
                    className="w-4 h-4 text-green-600 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Position Change</span>
                </label>
              </div>

              {formData.positionChange && (
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                    New Position Title
                  </label>
                  <input 
                    type="text"
                    value={formData.newPosition}
                    onChange={(e) => setFormData({...formData, newPosition: e.target.value})}
                    placeholder="Enter new position..."
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              )}
            </>
          )}

          {/* Comments */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Comments / Notes
            </label>
            <textarea
              value={formData.comments}
              onChange={(e) => setFormData({...formData, comments: e.target.value})}
              rows={3}
              placeholder="Add any additional notes or comments..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Info */}
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
            <div className="flex gap-2">
              <AlertCircle className="text-almet-sapphire dark:text-blue-400 flex-shrink-0" size={16} />
              <div className="text-xs text-blue-800 dark:text-blue-200">
                <p className="font-medium mb-1">After Submission:</p>
                <ul className="list-disc list-inside space-y-0.5 text-xs">
                  <li>Decision will be forwarded to HR department</li>
                  <li>HR will update employee contract and salary information</li>
                  <li>Employee will be notified via email</li>
                  {formData.decision === 'not-renew' && (
                    <li className="text-red-600 dark:text-red-400 font-medium">HR will initiate exit process</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 px-5 py-3 flex gap-3 justify-end border-t border-gray-200 dark:border-gray-600">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
          >
            <Send size={16} />
            Submit Decision
          </button>
        </div>
      </div>
    </div>
  );
};

  // Probation Detail Modal (View submitted evaluations)
  const ProbationDetailModal = ({ review, onClose }) => {

if (review.status === 'Pending Review') {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full">
        <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral p-5 text-white flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">Probation Review</h2>
            <p className="text-blue-100 mt-0.5 text-sm">{review.employee} - {review.empId}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 text-center">
          <Clock className="mx-auto text-yellow-500 mb-4" size={48} />
          <p className="text-gray-700 dark:text-gray-300 text-lg mb-2">Awaiting Manager Evaluation</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Manager <strong>{review.manager}</strong> has not submitted the evaluation yet.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Probation ends in <strong>{review.daysRemaining} days</strong> on {review.probationEnd}
          </p>
        </div>
        
        {/* Footer with action button */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-between">
          <button 
            onClick={onClose} 
            className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 text-sm"
          >
            Close
          </button>
          <button 
            onClick={() => {
              onClose();                        // Bu modal-ı bağlayır
              setShowEvaluationForm(true);      // Evaluation form-unu açır
              setSelectedItem(review);           // Seçilmiş review-u set edir
            }}
            className="px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral text-sm flex items-center gap-2"
          >
            <FileText size={16} />
            Fill Evaluation Form
          </button>
        </div>
      </div>
    </div>
  );
}

    const evaluation = review.evaluation;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-gradient-to-r from-almet-sapphire to-almet-astral p-5 text-white flex items-center justify-between z-10">
            <div>
              <h2 className="text-xl font-bold">Probation Period Evaluation</h2>
              <p className="text-blue-100 mt-0.5 text-sm">{review.employee} - {review.empId}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Employee Info */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 text-sm">Employee Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <InfoItem label="Name" value={review.employee} />
                <InfoItem label="Position" value={review.position} />
                <InfoItem label="Department" value={review.department} />
                <InfoItem label="Manager" value={review.manager} />
                <InfoItem label="Start Date" value={review.startDate} />
                <InfoItem label="Probation End" value={review.probationEnd} />
                <InfoItem label="Submitted" value={review.submittedDate} />
                <InfoItem label="Status" value={review.status} />
              </div>
            </div>

            {/* Performance Ratings */}
            <div>
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 text-sm">Performance Evaluation (1-5 Scale)</h3>
              <div className="space-y-3">
                {Object.entries({
                  'Job Knowledge': evaluation.jobKnowledge,
                  'Work Quality': evaluation.workQuality,
                  'Productivity': evaluation.productivity,
                  'Communication': evaluation.communication,
                  'Teamwork': evaluation.teamwork,
                  'Initiative': evaluation.initiative,
                  'Attendance': evaluation.attendance,
                  'Policy Compliance': evaluation.policyCompliance
                }).map(([key, value]) => (
                  <div key={key} className="border-b border-gray-100 dark:border-gray-700 pb-3">
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{key}</label>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold ${
                              i <= value.rating ? 'bg-almet-sapphire text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                            }`}>
                              {i}
                            </div>
                          ))}
                        </div>
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200 ml-2">{value.rating}/5</span>
                      </div>
                    </div>
                    {value.comments && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{value.comments}"</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 text-sm">Key Achievements</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">{evaluation.achievements}</p>
            </div>

            {/* Improvement Areas */}
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 text-sm">Areas for Improvement</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">{evaluation.improvementAreas}</p>
            </div>

            {/* Overall Rating */}
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 text-sm">Overall Rating</h3>
              <div className="flex items-center gap-4">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={`w-10 h-10 rounded flex items-center justify-center text-sm font-bold ${
                      i <= evaluation.overallRating ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    }`}>
                      {i}
                    </div>
                  ))}
                </div>
                <span className="text-xl font-bold text-gray-800 dark:text-gray-200">{evaluation.overallRating}/5</span>
              </div>
            </div>

            {/* Manager Summary */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 text-sm">Manager Summary</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">{evaluation.managerSummary}</p>
            </div>

            {/* Recommendation */}
            <div className="p-4 rounded-lg border-2" style={{
              backgroundColor: evaluation.recommendation === 'confirm' ? '#d1fae5' : evaluation.recommendation === 'extend' ? '#fef3c7' : '#fee2e2',
              borderColor: evaluation.recommendation === 'confirm' ? '#10b981' : evaluation.recommendation === 'extend' ? '#f59e0b' : '#ef4444'
            }}>
              <h3 className="font-semibold text-gray-800 mb-2 text-sm">Manager Recommendation</h3>
              <p className="text-lg font-bold" style={{
                color: evaluation.recommendation === 'confirm' ? '#059669' : evaluation.recommendation === 'extend' ? '#d97706' : '#dc2626'
              }}>
                {evaluation.recommendation === 'confirm' ? '✅ Confirm Employment' :
                 evaluation.recommendation === 'extend' ? '⏱️ Extend Probation Period' :
                 '❌ Do Not Confirm'}
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 px-6 py-4 flex gap-3 justify-end border-t border-gray-200 dark:border-gray-600">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 text-sm">
              Close
            </button>
            <button onClick={() => alert('Rejected!')} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center gap-2">
              <XCircle size={16} />
              Reject
            </button>
            <button onClick={() => alert('Approved & Confirmed!')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-2">
              <CheckCircle size={16} />
              Approve & Confirm Employee
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Contract Detail Modal (View submitted decisions)
  const ContractDetailModal = ({ contract, onClose }) => {
    if (contract.status === 'Pending Decision') {
  
return (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full">
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-5 text-white flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Contract Renewal</h2>
          <p className="text-green-100 mt-0.5 text-sm">{contract.employee} - {contract.empId}</p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg">
          <X size={20} />
        </button>
      </div>
      
      <div className="p-6 text-center">
        <Clock className="mx-auto text-yellow-500 mb-4" size={48} />
        <p className="text-gray-700 dark:text-gray-300 text-lg mb-2">Awaiting Manager Decision</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Manager <strong>{contract.manager}</strong> has not made a renewal decision yet.
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
          Contract expires in <strong>{contract.daysRemaining} days</strong> on {contract.contractEnd}
        </p>
      </div>
      
      {/* Footer with action button */}
      <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex justify-between">
        <button 
          onClick={onClose} 
          className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 text-sm"
        >
          Close
        </button>
        <button 
          onClick={() => {
            onClose();
            setShowContractForm(true);      // Bu form-u açır
            setSelectedItem(contract);
          }}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-2"
        >
          <FileText size={16} />
          Make Renewal Decision
        </button>
      </div>
    </div>
  </div>
);
    }

    const dec = contract.decision;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-gradient-to-r from-green-500 to-emerald-600 p-5 text-white flex items-center justify-between z-10">
            <div>
              <h2 className="text-xl font-bold">Contract Renewal Decision</h2>
              <p className="text-green-100 mt-0.5 text-sm">{contract.employee} - {contract.empId}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Employee Info */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 text-sm">Employee Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <InfoItem label="Name" value={contract.employee} />
                <InfoItem label="Position" value={contract.position} />
                <InfoItem label="Department" value={contract.department} />
                <InfoItem label="Manager" value={contract.manager} />
                <InfoItem label="Current Contract" value={contract.contractType} />
                <InfoItem label="Expires" value={contract.contractEnd} />
                <InfoItem label="Submitted" value={contract.submittedDate} />
                <InfoItem label="Days Remaining" value={`${contract.daysRemaining} days`} />
              </div>
            </div>

            {/* Decision */}
            <div className="p-4 rounded-lg border-2" style={{
              backgroundColor: dec.decision === 'renew' ? '#d1fae5' : '#fee2e2',
              borderColor: dec.decision === 'renew' ? '#10b981' : '#ef4444'
            }}>
              <h3 className="font-semibold text-gray-800 mb-2 text-sm">Manager Decision</h3>
              <p className="text-lg font-bold" style={{
                color: dec.decision === 'renew' ? '#059669' : '#dc2626'
              }}>
                {dec.decision === 'renew' ? '✅ Renew Contract' : '❌ Do Not Renew'}
              </p>
            </div>

            {dec.decision === 'renew' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 text-sm">New Contract Type</h3>
                    <p className="text-base font-bold text-gray-800 dark:text-gray-200">{dec.newContractType}</p>
                  </div>

                  {dec.salaryChange && (
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 text-sm">New Salary</h3>
                      <p className="text-base font-bold text-green-600 dark:text-green-400">{dec.newSalary} AZN</p>
                    </div>
                  )}
                </div>

                {dec.positionChange && (
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 text-sm">New Position</h3>
                    <p className="text-base font-bold text-gray-800 dark:text-gray-200">{dec.newPosition}</p>
                  </div>
                )}
              </>
            )}

            {/* Comments */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 text-sm">Manager Comments</h3>
              <p className="text-sm text-gray-700 dark:text-gray-300">{dec.comments}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 px-6 py-4 flex gap-3 justify-end border-t border-gray-200 dark:border-gray-600">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 text-sm">
              Close
            </button>
            {dec.decision === 'renew' ? (
              <button onClick={() => alert('Contract renewed!')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-2">
                <CheckCircle size={16} />
                Process Contract Renewal
              </button>
            ) : (
              <button onClick={() => alert('Contract termination processed')} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center gap-2">
                <XCircle size={16} />
                Process Termination
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Resignation Detail Modal
  const ResignationDetailModal = ({ resignation, onClose }) => {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 p-5 text-white flex items-center justify-between z-10">
            <div>
              <h2 className="text-xl font-bold">Resignation Details</h2>
              <p className="text-orange-100 mt-0.5 text-sm">{resignation.employee} - {resignation.empId}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-5">
            {/* Employee Info */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 text-sm">Employee Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <InfoItem label="Name" value={resignation.employee} />
                <InfoItem label="Employee ID" value={resignation.empId} />
                <InfoItem label="Position" value={resignation.position} />
                <InfoItem label="Department" value={resignation.department} />
                <InfoItem label="Manager" value={resignation.manager} />
              </div>
            </div>

            {/* Resignation Details */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 text-sm">Resignation Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                <InfoItem label="Submitted Date" value={resignation.submittedDate} />
                <InfoItem label="Notice Period" value={`${resignation.noticePeriod} days`} />
                <InfoItem label="Last Working Day" value={resignation.lastDay} />
                <InfoItem label="Days Remaining" value={`${resignation.daysRemaining} days`} />
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason for Leaving:</p>
                <p className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">{resignation.reason}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{resignation.reasonDetails}</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="space-y-3">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-700">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 text-sm">Willing to Stay?</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {resignation.willingToStay === 'yes' ? '✅ Yes, would consider staying' :
                   resignation.willingToStay === 'maybe' ? '⚠️ Maybe, depends on offer' :
                   '❌ No, decision is final'}
                </p>
                {resignation.retentionOffer && (
                  <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Retention Conditions:</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{resignation.retentionOffer}</p>
                  </div>
                )}
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 text-sm">Projects & Handover Status</h3>
                <p className="text-sm text-gray-700 dark:text-gray-300">{resignation.projectsStatus || 'Not provided'}</p>
              </div>
            </div>

            {/* Manager Approval (if approved) */}
            {resignation.status === 'Manager Approved' && (
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 text-sm flex items-center gap-2">
                  <CheckCircle size={16} className="text-green-600" />
                  Manager Approval
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Approved by:</strong> {resignation.manager}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Approved on:</strong> {resignation.managerApprovalDate}
                  </p>
                  {resignation.managerComments && (
                    <div className="mt-2 p-2 bg-white dark:bg-gray-800 rounded">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Manager Comments:</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{resignation.managerComments}"</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 px-6 py-4 flex gap-3 justify-end border-t border-gray-200 dark:border-gray-600">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 text-sm">
              Close
            </button>
            {resignation.status === 'Pending Manager' ? (
              <>
                <button onClick={() => alert('Resignation rejected')} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center gap-2">
                  <XCircle size={16} />
                  Reject
                </button>
                <button onClick={() => alert('Resignation approved!')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-2">
                  <CheckCircle size={16} />
                  Approve & Forward to HR
                </button>
              </>
            ) : (
              <button onClick={() => alert('Exit process initiated')} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm flex items-center gap-2">
                <Send size={16} />
                Initiate Exit Process
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Exit Interview Detail Modal (keeping original)
  const ExitInterviewDetailModal = ({ exit, onClose }) => {
    const resp = exit.responses;
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-gradient-to-r from-red-500 to-pink-600 p-5 text-white flex items-center justify-between z-10">
            <div>
              <h2 className="text-xl font-bold">Exit Interview</h2>
              <p className="text-red-100 mt-0.5 text-sm">{exit.employee} - {exit.empId}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg">
              <X size={20} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* General Info */}
            <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 text-sm">General Information</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <InfoItem label="Employee Name" value={exit.employee} />
                <InfoItem label="Department" value={exit.department} />
                <InfoItem label="Position" value={exit.position} />
                <InfoItem label="Reason for Leaving" value={exit.reasonForLeaving} />
                <InfoItem label="Last Working Day" value={exit.lastDay} />
                <InfoItem label="Interview Completed" value={exit.submittedDate} />
              </div>
            </div>

            {/* Section 1: Role & Responsibilities */}
            <section>
              <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                <Briefcase size={20} className="text-red-600" />
                Role & Responsibilities
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">How well did your job description reflect your actual duties?</p>
                    <span className="text-lg font-bold text-almet-sapphire">{resp.jobReflection}/5</span>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Were your responsibilities clearly defined?</p>
                    <span className="text-lg font-bold text-almet-sapphire">{resp.responsibilitiesClear}/5</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Main challenges faced in role:</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{resp.challenges}"</p>
                </div>
              </div>
            </section>

            {/* Remaining sections abbreviated for space - keep full version in final code */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 text-sm">Overall Satisfaction Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: 'Job Fit', value: resp.jobReflection },
                  { label: 'Management', value: resp.managerRelationship },
                  { label: 'Salary', value: resp.salaryBenefits },
                  { label: 'Conditions', value: resp.workingConditions },
                  { label: 'Culture', value: resp.companyValues }
                ].map(item => (
                  <div key={item.label} className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{item.label}</p>
                    <p className={`text-2xl font-bold ${
                      item.value <= 2 ? 'text-red-600' :
                      item.value === 3 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {item.value}/5
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-700 px-6 py-4 flex gap-3 justify-end border-t border-gray-200 dark:border-gray-600">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 text-sm">
              Close
            </button>
            <button onClick={() => alert('Report downloaded')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm flex items-center gap-2">
              <Download size={16} />
              Download PDF Report
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Probation Reviews Tab
  const ProbationTab = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search by employee name, ID, or department..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-almet-sapphire text-sm"
          />
        </div>
        <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm flex items-center gap-2">
          <Filter size={18} />
          Filter
        </button>
      </div>

      {probationReviews.map(review => (
        <div key={review.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <User className="text-almet-sapphire" size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">{review.employee}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{review.empId} • {review.position}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{review.department} Department</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={review.status} />
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                review.daysRemaining <= 3 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                review.daysRemaining <= 7 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
              }`}>
                {review.daysRemaining} days left
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <InfoItem label="Start Date" value={review.startDate} />
            <InfoItem label="Probation End" value={review.probationEnd} />
            <InfoItem label="Manager" value={review.manager} />
            <InfoItem label="Status" value={review.status} />
            {review.submittedDate && <InfoItem label="Submitted" value={review.submittedDate} />}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {review.status === 'Pending Review' ? (
                <p className="text-yellow-600 dark:text-yellow-400 font-medium">⚠️ Awaiting manager evaluation</p>
              ) : (
                <p className="text-blue-600 dark:text-blue-400 font-medium">✓ Evaluation submitted, awaiting HR review</p>
              )}
            </div>
            <button 
              onClick={() => {
                setSelectedItem(review);
                setModalType('probation');
                setShowModal(true);
              }}
              className="px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Eye size={16} />
              {review.status === 'Submitted' ? 'Review & Approve' : 'View Details'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  // Contract Renewals Tab
  const ContractTab = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search by employee name, ID, or department..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-almet-sapphire text-sm"
          />
        </div>
      </div>

      {contractRenewals.map(contract => (
        <div key={contract.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <User className="text-green-600" size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">{contract.employee}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{contract.empId} • {contract.position}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{contract.department} Department</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={contract.status} />
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                contract.daysRemaining <= 7 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                contract.daysRemaining <= 14 ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400' :
                'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              }`}>
                {contract.daysRemaining} days
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <InfoItem label="Contract Type" value={contract.contractType} />
            <InfoItem label="Expires" value={contract.contractEnd} />
            <InfoItem label="Manager" value={contract.manager} />
            <InfoItem label="Status" value={contract.status} />
            {contract.submittedDate && <InfoItem label="Submitted" value={contract.submittedDate} />}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {contract.status === 'Pending Decision' ? (
                <p className="text-yellow-600 dark:text-yellow-400 font-medium">⚠️ Awaiting manager decision</p>
              ) : (
                <p className="text-blue-600 dark:text-blue-400 font-medium">✓ Decision submitted, awaiting HR processing</p>
              )}
            </div>
            <button 
              onClick={() => {
                setSelectedItem(contract);
                setModalType('contract');
                setShowModal(true);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Eye size={16} />
              {contract.status === 'Submitted' ? 'Process Renewal' : 'View Details'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  // Resignations Tab
  const ResignationTab = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search by employee name, ID, or department..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-almet-sapphire text-sm"
          />
        </div>
      </div>

      {resignations.map(resignation => {
        const daysRemaining = Math.ceil((new Date(resignation.lastDay) - new Date()) / (1000 * 60 * 60 * 24));
        
        return (
          <div key={resignation.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                  <User className="text-orange-600" size={20} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">{resignation.employee}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{resignation.empId} • {resignation.position}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{resignation.department} Department</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={resignation.status} />
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  daysRemaining <= 7 ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' :
                  'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                }`}>
                  {daysRemaining} days
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <InfoItem label="Submitted" value={resignation.submittedDate} />
              <InfoItem label="Last Working Day" value={resignation.lastDay} />
              <InfoItem label="Notice Period" value={`${resignation.noticePeriod} days`} />
              <InfoItem label="Manager" value={resignation.manager} />
            </div>

            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason for Leaving:</p>
              <p className="text-sm text-gray-800 dark:text-gray-200 font-semibold">{resignation.reason}</p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-600 dark:text-gray-400">
                {resignation.status === 'Pending Manager' ? (
                  <p className="text-yellow-600 dark:text-yellow-400 font-medium">⚠️ Awaiting manager approval</p>
                ) : (
                  <p className="text-green-600 dark:text-green-400 font-medium">✓ Manager approved, processing exit</p>
                )}
              </div>
              <button 
                onClick={() => {
                  setSelectedItem(resignation);
                  setModalType('resignation');
                  setShowModal(true);
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Eye size={16} />
                {resignation.status === 'Pending Manager' ? 'Approve/Reject' : 'View Details'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );

  // Exit Interviews Tab
  const ExitTab = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search by employee name, ID, or department..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-almet-sapphire text-sm"
          />
        </div>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2">
          <Download size={18} />
          Export Report
        </button>
      </div>

      {exitInterviews.map(exit => (
        <div key={exit.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-md transition-all">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-red-50 dark:bg-red-900/30 rounded-lg">
                <User className="text-red-600" size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">{exit.employee}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{exit.empId} • {exit.position}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{exit.department} Department</p>
              </div>
            </div>
            <StatusBadge status={exit.status} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <InfoItem label="Last Working Day" value={exit.lastDay} />
            <InfoItem label="Interview Completed" value={exit.submittedDate} />
            <InfoItem label="Overall Satisfaction" value={`${exit.responses.companyValues}/5`} />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-2 mb-4">
            {Object.entries({
              'Job Fit': exit.responses.jobReflection,
              'Management': exit.responses.managerRelationship,
              'Salary': exit.responses.salaryBenefits,
              'Conditions': exit.responses.workingConditions,
              'Culture': exit.responses.companyValues
            }).map(([key, value]) => (
              <div key={key} className="p-2 bg-gray-100 dark:bg-gray-700 rounded text-center">
                <p className="text-xs text-gray-600 dark:text-gray-400">{key}</p>
                <p className={`text-sm font-bold ${
                  value <= 2 ? 'text-red-600' :
                  value === 3 ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {value}/5
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <button 
              onClick={() => {
                setSelectedItem(exit);
                setModalType('exit');
                setShowModal(true);
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <Eye size={16} />
              View Full Interview
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="space-y-5">
     

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            <TabButton
              active={activeTab === 'probation'}
              onClick={() => setActiveTab('probation')}
              icon={UserCheck}
              label="Probation Reviews"
              count={probationReviews.length}
            />
            <TabButton
              active={activeTab === 'contracts'}
              onClick={() => setActiveTab('contracts')}
              icon={RefreshCw}
              label="Contract Renewals"
              count={contractRenewals.length}
            />
            <TabButton
              active={activeTab === 'resignations'}
              onClick={() => setActiveTab('resignations')}
              icon={FileText}
              label="Resignations"
              count={resignations.length}
            />
            <TabButton
              active={activeTab === 'exits'}
              onClick={() => setActiveTab('exits')}
              icon={LogOut}
              label="Exit Interviews"
              count={exitInterviews.length}
            />
          </div>

          <div className="p-6">
            {activeTab === 'probation' && <ProbationTab />}
            {activeTab === 'contracts' && <ContractTab />}
            {activeTab === 'resignations' && <ResignationTab />}
            {activeTab === 'exits' && <ExitTab />}
          </div>
        </div>

        {/* Modals - View Details */}
        {showModal && selectedItem && (
          <>
            {modalType === 'probation' && (
              <ProbationDetailModal 
                review={selectedItem}
                onClose={() => setShowModal(false)}
              />
            )}
            {modalType === 'contract' && (
              <ContractDetailModal 
                contract={selectedItem}
                onClose={() => setShowModal(false)}
              />
            )}
            {modalType === 'resignation' && (
              <ResignationDetailModal 
                resignation={selectedItem}
                onClose={() => setShowModal(false)}
              />
            )}
            {modalType === 'exit' && (
              <ExitInterviewDetailModal 
                exit={selectedItem}
                onClose={() => setShowModal(false)}
              />
            )}
          </>
        )}

        {/* Modals - Forms */}
        {showEvaluationForm && selectedItem && (
          <ProbationEvaluationModal
            review={selectedItem}
            onClose={() => {
              setShowEvaluationForm(false);
              setSelectedItem(null);
            }}
            onSubmit={(formData) => {
              console.log('Probation evaluation submitted:', formData);
              alert('Evaluation submitted successfully!');
              setShowEvaluationForm(false);
              setSelectedItem(null);
              // Here you would update the state or call an API
            }}
          />
        )}

        {showContractForm && selectedItem && (
          <ContractRenewalModal
            contract={selectedItem}
            onClose={() => {
              setShowContractForm(false);
              setSelectedItem(null);
            }}
            onSubmit={(formData) => {
              console.log('Contract decision submitted:', formData);
              alert('Contract decision submitted successfully!');
              setShowContractForm(false);
              setSelectedItem(null);
              // Here you would update the state or call an API
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}