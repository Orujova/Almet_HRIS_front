'use client';
import React, { useState } from 'react';
import { 
  User, Briefcase, LogOut, Star, Calendar, AlertCircle, CheckCircle, 
  Clock, Send, FileText, Upload, Eye, Edit, Trash2, Settings,
  UserCheck, RefreshCw, Mail, Bell, ChevronRight, Download,
  XCircle, CheckSquare, Save , Award, MoreVertical,Building, MessageSquare
} from 'lucide-react';

export default function CompleteHRSystem() {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  
  // Mock data
  const [employees] = useState([
    { 
      id: 1, name: 'Ali Məmmədov', position: 'Software Developer', department: 'IT',
      startDate: '2024-09-15', contractType: 'Probation', probationEnd: '2024-12-15',
      contractEnd: '2025-09-15', manager: 'Rəşad Əliyev', status: 'Active',
      daysUntilAction: 5, actionType: 'probation'
    },
    { 
      id: 2, name: 'Leyla İbrahimova', position: 'Marketing Manager', department: 'Marketing',
      startDate: '2023-01-10', contractType: 'Fixed-term', probationEnd: null,
      contractEnd: '2025-01-10', manager: 'Nigar Həsənova', status: 'Active',
      daysUntilAction: 25, actionType: 'renewal'
    },
    { 
      id: 3, name: 'Vüsal Həsənov', position: 'Sales Executive', department: 'Sales',
      startDate: '2022-03-20', contractType: 'Permanent', probationEnd: null,
      contractEnd: null, manager: 'Elvin Quliyev', status: 'Resignation',
      daysUntilAction: 7, actionType: 'exit', lastWorkingDay: '2024-12-20'
    }
  ]);

  const [notifications] = useState([
    { id: 1, type: 'probation', employee: 'Ali Məmmədov', days: 5, urgent: true },
    { id: 2, type: 'renewal', employee: 'Leyla İbrahimova', days: 25, urgent: false },
    { id: 3, type: 'exit', employee: 'Vüsal Həsənov', days: 7, urgent: true }
  ]);

  const [resignations] = useState([
    { 
      id: 1, employee: 'Vüsal Həsənov', submittedDate: '2024-11-20', 
      noticePeriod: 30, lastDay: '2024-12-20', status: 'Pending Manager',
      reason: 'Career Growth', hasAttachment: true
    }
  ]);

  const [defaultHR, setDefaultHR] = useState('hr.department@company.com');

  // Dashboard Component
  const Dashboard = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-4xl font-bold mb-3">HR Management System</h1>
        <p className="text-blue-100 text-lg">Complete Employee Lifecycle Management</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={UserCheck} title="Probation Reviews" count={1} color="blue" onClick={() => setActiveView('probation')} />
        <StatCard icon={RefreshCw} title="Contract Renewals" count={1} color="green" onClick={() => setActiveView('renewal')} />
        <StatCard icon={LogOut} title="Exit Interviews" count={1} color="red" onClick={() => setActiveView('exit')} />
        <StatCard icon={FileText} title="Resignations" count={1} color="orange" onClick={() => setActiveView('resignation')} />
      </div>

      {/* Urgent Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Bell className="text-red-500" />
            Urgent Actions
          </h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Settings size={18} />
            Configure Notifications
          </button>
        </div>
        
        <div className="space-y-4">
          {notifications.map(notif => (
            <NotificationCard key={notif.id} data={notif} onAction={() => {
              if (notif.type === 'probation') setActiveView('probation');
              if (notif.type === 'renewal') setActiveView('renewal');
              if (notif.type === 'exit') setActiveView('exit');
            }} />
          ))}
        </div>
      </div>

      {/* Employee List */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Employee Overview</h2>
        <EmployeeTable employees={employees} onSelect={(emp) => {
          setSelectedEmployee(emp);
          setShowModal(true);
          setModalType('view');
        }} />
      </div>
    </div>
  );

  // Probation Evaluation View
  const ProbationView = () => {
    const [formData, setFormData] = useState({});
    const probationEmployee = employees.find(e => e.actionType === 'probation');

    return (
      <div className="space-y-6">
        <BackButton onClick={() => setActiveView('dashboard')} />
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b">
            <div className="p-4 bg-blue-100 rounded-full">
              <UserCheck className="text-blue-600" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Probation Evaluation</h1>
              <p className="text-gray-600 mt-1">Employee: {probationEmployee?.name}</p>
            </div>
          </div>

          {/* Employee Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-6 bg-gray-50 rounded-lg">
            <InfoItem label="Employee ID" value="EMP001" />
            <InfoItem label="Position" value={probationEmployee?.position} />
            <InfoItem label="Department" value={probationEmployee?.department} />
            <InfoItem label="Start Date" value={probationEmployee?.startDate} />
            <InfoItem label="Probation End" value={probationEmployee?.probationEnd} />
            <InfoItem label="Manager" value={probationEmployee?.manager} />
            <InfoItem label="Days Remaining" value={`${probationEmployee?.daysUntilAction} days`} />
            <InfoItem label="Status" value={<span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">Pending Review</span>} />
          </div>

          {/* Performance Evaluation */}
          <FormSection title="Performance Evaluation" icon={Star}>
            {[
              'Job Knowledge & Technical Skills',
              'Work Quality & Attention to Detail',
              'Productivity & Time Management',
              'Communication Skills',
              'Teamwork & Collaboration',
              'Initiative & Problem Solving',
              'Adaptability & Learning',
              'Attendance & Punctuality',
              'Policy Compliance',
              'Professionalism'
            ].map((criterion, idx) => (
              <div key={idx} className="pb-6 mb-6 border-b last:border-0">
                <label className="block text-sm font-medium text-gray-700 mb-3">{idx + 1}. {criterion}</label>
                <RatingStars value={formData[`rating_${idx}`]} onChange={(val) => setFormData({...formData, [`rating_${idx}`]: val})} />
                <textarea
                  placeholder="Comments..."
                  rows={2}
                  className="w-full mt-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  value={formData[`comment_${idx}`] || ''}
                  onChange={(e) => setFormData({...formData, [`comment_${idx}`]: e.target.value})}
                />
              </div>
            ))}
          </FormSection>

          {/* Key Achievements */}
          <FormSection title="Key Achievements & Strengths" icon={Award}>
            <textarea
              rows={4}
              placeholder="List major achievements and strengths demonstrated..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </FormSection>

          {/* Areas for Improvement */}
          <FormSection title="Areas for Improvement" icon={AlertCircle}>
            <textarea
              rows={4}
              placeholder="Identify areas needing development..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </FormSection>

          {/* Manager Decision */}
          <FormSection title="Manager Decision" icon={CheckSquare}>
            <div className="space-y-4">
              <textarea
                rows={4}
                placeholder="Manager summary and recommendation..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DecisionButton
                  icon={CheckCircle}
                  label="Confirm Employment"
                  description="Employee passed probation"
                  color="green"
                  onClick={() => setFormData({...formData, decision: 'confirm'})}
                  selected={formData.decision === 'confirm'}
                />
                <DecisionButton
                  icon={Clock}
                  label="Extend Probation"
                  description="Extend for additional period"
                  color="yellow"
                  onClick={() => setFormData({...formData, decision: 'extend'})}
                  selected={formData.decision === 'extend'}
                />
                <DecisionButton
                  icon={XCircle}
                  label="Terminate Employment"
                  description="End employment"
                  color="red"
                  onClick={() => setFormData({...formData, decision: 'terminate'})}
                  selected={formData.decision === 'terminate'}
                />
              </div>

              {formData.decision === 'extend' && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Extension Period (days)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="e.g., 30, 60, 90"
                  />
                  <textarea
                    rows={2}
                    className="w-full mt-3 px-4 py-2 border border-gray-300 rounded-lg"
                    placeholder="Reason for extension..."
                  />
                </div>
              )}
            </div>
          </FormSection>

          {/* Submit Buttons */}
          <div className="flex gap-4 justify-end mt-8">
            <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
              Save as Draft
            </button>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
              <Send size={20} />
              Submit to HR
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Contract Renewal View
  const RenewalView = () => {
    const [renewalForm, setRenewalForm] = useState({});
    const renewalEmployee = employees.find(e => e.actionType === 'renewal');

    return (
      <div className="space-y-6">
        <BackButton onClick={() => setActiveView('dashboard')} />
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b">
            <div className="p-4 bg-green-100 rounded-full">
              <RefreshCw className="text-green-600" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Contract Renewal Decision</h1>
              <p className="text-gray-600 mt-1">Employee: {renewalEmployee?.name}</p>
            </div>
          </div>

          {/* Employee Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-6 bg-gray-50 rounded-lg">
            <InfoItem label="Employee ID" value="EMP002" />
            <InfoItem label="Position" value={renewalEmployee?.position} />
            <InfoItem label="Current Contract End" value={renewalEmployee?.contractEnd} />
            <InfoItem label="Days Remaining" value={`${renewalEmployee?.daysUntilAction} days`} />
          </div>

          {/* Renewal Decision */}
          <FormSection title="Renewal Decision" icon={CheckSquare}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DecisionButton
                icon={CheckCircle}
                label="Renew Contract"
                description="Continue employment"
                color="green"
                onClick={() => setRenewalForm({...renewalForm, decision: 'renew'})}
                selected={renewalForm.decision === 'renew'}
              />
              <DecisionButton
                icon={XCircle}
                label="Do Not Renew"
                description="End employment"
                color="red"
                onClick={() => setRenewalForm({...renewalForm, decision: 'not_renew'})}
                selected={renewalForm.decision === 'not_renew'}
              />
            </div>
          </FormSection>

          {renewalForm.decision === 'renew' && (
            <>
              <FormSection title="New Contract Details" icon={FileText}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Contract Type</label>
                    <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                      <option>Fixed-term (1 year)</option>
                      <option>Fixed-term (2 years)</option>
                      <option>Permanent</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Contract Start Date</label>
                    <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                  </div>
                </div>
              </FormSection>

              <FormSection title="Compensation & Position Changes" icon={Award}>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <input type="checkbox" id="salaryIncrease" className="w-5 h-5" 
                      onChange={(e) => setRenewalForm({...renewalForm, salaryIncrease: e.target.checked})} />
                    <label htmlFor="salaryIncrease" className="text-sm font-medium text-gray-700">Salary Increase</label>
                  </div>
                  
                  {renewalForm.salaryIncrease && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-9">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">Current Salary</label>
                        <input type="number" placeholder="e.g., 2000" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">New Salary</label>
                        <input type="number" placeholder="e.g., 2300" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    <input type="checkbox" id="positionChange" className="w-5 h-5"
                      onChange={(e) => setRenewalForm({...renewalForm, positionChange: e.target.checked})} />
                    <label htmlFor="positionChange" className="text-sm font-medium text-gray-700">Position/Title Change</label>
                  </div>

                  {renewalForm.positionChange && (
                    <div className="ml-9">
                      <label className="block text-sm text-gray-600 mb-2">New Position/Title</label>
                      <input type="text" placeholder="e.g., Senior Marketing Manager" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                    </div>
                  )}
                </div>
              </FormSection>

              <FormSection title="Manager Comments" icon={MessageSquare}>
                <textarea
                  rows={4}
                  placeholder="Additional comments, reasons for renewal, performance highlights..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </FormSection>
            </>
          )}

          {renewalForm.decision === 'not_renew' && (
            <FormSection title="Reason for Not Renewing" icon={MessageSquare}>
              <textarea
                rows={4}
                placeholder="Provide reason for not renewing contract..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                <p className="text-sm text-red-700">
                  <strong>Note:</strong> Exit interview process will be automatically triggered. Employee will be notified 7 days before contract end date.
                </p>
              </div>
            </FormSection>
          )}

          <div className="flex gap-4 justify-end mt-8">
            <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
              Save as Draft
            </button>
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2">
              <Send size={20} />
              Submit to HR
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Resignation View
  const ResignationView = () => {
    return (
      <div className="space-y-6">
        <BackButton onClick={() => setActiveView('dashboard')} />
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-8 pb-6 border-b">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-orange-100 rounded-full">
                <FileText className="text-orange-600" size={32} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Resignation Requests</h1>
                <p className="text-gray-600 mt-1">Review and process employee resignations</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              New Resignation
            </button>
          </div>

          {/* Resignation List */}
          {resignations.map(resignation => (
            <div key={resignation.id} className="mb-6 border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">{resignation.employee}</h3>
                  <p className="text-sm text-gray-500 mt-1">Submitted: {resignation.submittedDate}</p>
                </div>
                <span className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                  {resignation.status}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <InfoItem label="Notice Period" value={`${resignation.noticePeriod} days`} />
                <InfoItem label="Last Working Day" value={resignation.lastWorkingDay} />
                <InfoItem label="Reason" value={resignation.reason} />
                <InfoItem label="Attachment" value={
                  resignation.hasAttachment ? (
                    <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700">
                      <Download size={16} />
                      <span className="text-sm">View Letter</span>
                    </button>
                  ) : 'None'
                } />
              </div>

              {/* Approval Flow */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Approval Flow</h4>
                <div className="flex items-center gap-2">
                  <ApprovalStep status="pending" label="Line Manager" />
                  <ChevronRight size={20} className="text-gray-400" />
                  <ApprovalStep status="waiting" label="HR Manager" />
                </div>
              </div>

              {/* Manager Actions */}
              <div className="flex gap-3">
                <button className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center gap-2">
                  <CheckCircle size={20} />
                  Approve
                </button>
                <button className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2">
                  <XCircle size={20} />
                  Reject
                </button>
                <button className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2">
                  <MessageSquare size={20} />
                  Add Comment
                </button>
              </div>
            </div>
          ))}

          {/* New Resignation Form */}
          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Submit New Resignation</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Employee Name</label>
                  <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Working Day</label>
                  <input type="date" className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason for Leaving</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option>Career Growth</option>
                  <option>Better Opportunity</option>
                  <option>Personal Reasons</option>
                  <option>Relocation</option>
                  <option>Health Issues</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Comments</label>
                <textarea rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer">
                <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-sm text-gray-600">Upload Resignation Letter (Optional)</p>
                <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX up to 5MB</p>
              </div>

              <button className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center justify-center gap-2">
                <Send size={20} />
                Submit Resignation
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Exit Interview View
  const ExitView = () => {
    const [exitForm, setExitForm] = useState({});
    const exitEmployee = employees.find(e => e.actionType === 'exit');

    return (
      <div className="space-y-6">
        <BackButton onClick={() => setActiveView('dashboard')} />
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b">
            <div className="p-4 bg-red-100 rounded-full">
              <LogOut className="text-red-600" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Exit Interview</h1>
              <p className="text-gray-600 mt-1">Employee: {exitEmployee?.name}</p>
            </div>
          </div>

          {/* Employee Info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-6 bg-gray-50 rounded-lg">
            <InfoItem label="Last Working Day" value={exitEmployee?.lastWorkingDay} />
            <InfoItem label="Days Remaining" value={`${exitEmployee?.daysUntilAction} days`} />
            <InfoItem label="Exit Type" value="Resignation" />
            <InfoItem label="Status" value={<span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">Pending Interview</span>} />
          </div>

          {/* Exit Interview Questions */}
          <FormSection title="Role & Responsibilities" icon={Briefcase}>
            <LikertQuestion question="How well did your job description reflect your actual duties?" />
            <LikertQuestion question="Were your responsibilities clearly defined?" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Main challenges faced in role</label>
              <textarea rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </FormSection>

          <FormSection title="Work Environment & Management" icon={User}>
            <LikertQuestion question="How would you rate your relationship with your manager?" />
            <LikertQuestion question="How would you rate collaboration across departments?" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Comments on leadership and management style</label>
              <textarea rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </FormSection>

          <FormSection title="Compensation & Career Development" icon={Award}>
            <LikertQuestion question="Were you satisfied with your salary and benefits?" />
            <LikertQuestion question="Did you have adequate opportunities for growth?" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">What could we have done to retain you?</label>
              <textarea rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
            </div>
          </FormSection>

          <FormSection title="Company Culture" icon={Building}>
            <LikertQuestion question="Did you feel aligned with company mission and values?" />
            <LikertQuestion question="Was the work atmosphere professional and respectful?" />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Three words to describe company culture</label>
              <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="e.g., Innovative, Collaborative, Fast-paced" />
            </div>
          </FormSection>

          <FormSection title="Final Comments & Suggestions" icon={MessageSquare}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">What would you change or improve?</label>
              <textarea rows={4} className="w-full px-4 py-2 border border-gray-300 rounded-lg" placeholder="Your honest feedback helps us improve..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Would you recommend our company to others?</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                <option>Yes, definitely</option>
                <option>Yes, with reservations</option>
                <option>Neutral</option>
                <option>Probably not</option>
                <option>Definitely not</option>
              </select>
            </div>
          </FormSection>

          <div className="flex gap-4 justify-end mt-8">
            <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
              Save as Draft
            </button>
            <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2">
              <Send size={20} />
              Submit Exit Interview
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Settings View - HR Configuration
  const SettingsView = () => {
    const [settings, setSettings] = useState({
      defaultHR: 'hr.department@company.com',
      probationDays: 90,
      probationNotificationDays: 14,
      renewalNotificationDays: 30,
      exitInterviewDays: 7
    });

    return (
      <div className="space-y-6">
        <BackButton onClick={() => setActiveView('dashboard')} />
        
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center gap-4 mb-8 pb-6 border-b">
            <div className="p-4 bg-purple-100 rounded-full">
              <Settings className="text-purple-600" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">System Settings</h1>
              <p className="text-gray-600 mt-1">Configure HR processes and notifications</p>
            </div>
          </div>

          {/* Default HR Configuration */}
          <FormSection title="Default HR Manager" icon={User}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default HR Email *</label>
                <input 
                  type="email" 
                  value={settings.defaultHR}
                  onChange={(e) => setSettings({...settings, defaultHR: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="hr@company.com"
                />
                <p className="text-sm text-gray-500 mt-2">All process notifications will be sent to this email by default</p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="text-sm font-medium text-blue-900 mb-2">API Configuration</h4>
                <p className="text-sm text-blue-700 mb-3">You can override the default HR email for specific processes via API</p>
                <div className="bg-white p-3 rounded border border-blue-200 font-mono text-xs">
                  POST /api/hr/set-default<br/>
                  {`{ "hrEmail": "custom.hr@company.com" }`}
                </div>
              </div>
            </div>
          </FormSection>

          {/* Probation Settings */}
          <FormSection title="Probation Period Settings" icon={UserCheck}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Standard Probation Period (days)</label>
                <select 
                  value={settings.probationDays}
                  onChange={(e) => setSettings({...settings, probationDays: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="14">14 days (2 weeks)</option>
                  <option value="30">30 days (1 month)</option>
                  <option value="60">60 days (2 months)</option>
                  <option value="90">90 days (3 months)</option>
                  <option value="180">180 days (6 months)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notification Timing (days before end)</label>
                <select 
                  value={settings.probationNotificationDays}
                  onChange={(e) => setSettings({...settings, probationNotificationDays: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="3">3 days before</option>
                  <option value="7">7 days before (1 week)</option>
                  <option value="14">14 days before (2 weeks)</option>
                  <option value="21">21 days before (3 weeks)</option>
                  <option value="30">30 days before (1 month)</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Current Configuration:</strong> Manager will be notified <strong>{settings.probationNotificationDays} days</strong> before the <strong>{settings.probationDays}-day</strong> probation period ends
              </p>
            </div>
          </FormSection>

          {/* Contract Renewal Settings */}
          <FormSection title="Contract Renewal Settings" icon={RefreshCw}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Notification (days before end)</label>
                <select 
                  value={settings.renewalNotificationDays}
                  onChange={(e) => setSettings({...settings, renewalNotificationDays: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="14">14 days (2 weeks)</option>
                  <option value="30">30 days (1 month)</option>
                  <option value="45">45 days (1.5 months)</option>
                  <option value="60">60 days (2 months)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Reminder</label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option value="7">7 days before</option>
                  <option value="14">14 days before</option>
                </select>
              </div>
            </div>
          </FormSection>

          {/* Exit Interview Settings */}
          <FormSection title="Exit Interview Settings" icon={LogOut}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Send Exit Form (days before last day)</label>
                <select 
                  value={settings.exitInterviewDays}
                  onChange={(e) => setSettings({...settings, exitInterviewDays: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="3">3 days before</option>
                  <option value="7">7 days before (1 week)</option>
                  <option value="14">14 days before (2 weeks)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Exit Types Requiring Interview</label>
                <div className="space-y-2 pt-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="text-sm">Resignation</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                    <span className="text-sm">Contract End</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="w-4 h-4" />
                    <span className="text-sm">Termination</span>
                  </label>
                </div>
              </div>
            </div>
          </FormSection>

          {/* Email Notifications */}
          <FormSection title="Email Notifications" icon={Mail}>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input type="checkbox" defaultChecked className="w-5 h-5" />
                <div>
                  <p className="font-medium text-gray-800">Send email to Manager</p>
                  <p className="text-sm text-gray-500">Notify manager when action is required</p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input type="checkbox" defaultChecked className="w-5 h-5" />
                <div>
                  <p className="font-medium text-gray-800">Send email to HR</p>
                  <p className="text-sm text-gray-500">Copy HR on all notifications</p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <input type="checkbox" defaultChecked className="w-5 h-5" />
                <div>
                  <p className="font-medium text-gray-800">Send reminder emails</p>
                  <p className="text-sm text-gray-500">Automatic reminders for pending actions</p>
                </div>
              </label>
            </div>
          </FormSection>

          {/* API Documentation */}
          <FormSection title="API Integration" icon={FileText}>
            <div className="space-y-4">
              <div className="p-4 bg-gray-900 text-gray-100 rounded-lg font-mono text-sm">
                <p className="text-green-400 mb-2">// Set Default HR Manager</p>
                <p>POST /api/settings/hr-default</p>
                <p className="text-gray-400">{`{ "email": "hr@company.com" }`}</p>
                
                <p className="text-green-400 mt-4 mb-2">// Update Probation Settings</p>
                <p>POST /api/settings/probation</p>
                <p className="text-gray-400">{`{ "days": 90, "notifyBefore": 14 }`}</p>
                
                <p className="text-green-400 mt-4 mb-2">// Get All Settings</p>
                <p>GET /api/settings</p>
              </div>
            </div>
          </FormSection>

          {/* Save Button */}
          <div className="flex gap-4 justify-end mt-8">
            <button className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium">
              Reset to Default
            </button>
            <button className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center gap-2">
              <Save size={20} />
              Save Settings
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Helper Components
  const StatCard = ({ icon: Icon, title, count, color, onClick }) => (
    <button
      onClick={onClick}
      className={`bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all border-l-4 border-${color}-500 text-left w-full`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-${color}-100`}>
          <Icon className={`text-${color}-600`} size={24} />
        </div>
        <span className="text-3xl font-bold text-gray-800">{count}</span>
      </div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
    </button>
  );

  const NotificationCard = ({ data, onAction }) => {
    const colors = {
      probation: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', icon: UserCheck },
      renewal: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', icon: RefreshCw },
      exit: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', icon: LogOut }
    };
    
    const config = colors[data.type];
    const Icon = config.icon;
    
    return (
      <div className={`${config.bg} ${config.border} border rounded-lg p-4 flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          <Icon className={config.text} size={24} />
          <div>
            <p className="font-medium text-gray-800">{data.employee}</p>
            <p className="text-sm text-gray-600 capitalize">{data.type} - {data.days} days remaining</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {data.urgent && <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">URGENT</span>}
          <button 
            onClick={onAction}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium"
          >
            Take Action
          </button>
        </div>
      </div>
    );
  };

  const EmployeeTable = ({ employees, onSelect }) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contract Type</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action Required</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {employees.map(emp => (
            <tr key={emp.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div>
                  <p className="font-medium text-gray-800">{emp.name}</p>
                  <p className="text-sm text-gray-500">{emp.department}</p>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{emp.position}</td>
              <td className="px-6 py-4">
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                  {emp.contractType}
                </span>
              </td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  emp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  {emp.status}
                </span>
              </td>
              <td className="px-6 py-4">
                {emp.actionType && (
                  <div className="text-sm">
                    <p className="font-medium text-gray-800 capitalize">{emp.actionType}</p>
                    <p className="text-gray-500">{emp.daysUntilAction} days</p>
                  </div>
                )}
              </td>
              <td className="px-6 py-4">
                <button 
                  onClick={() => onSelect(emp)}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1"
                >
                  <Eye size={16} />
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const BackButton = ({ onClick }) => (
    <button 
      onClick={onClick}
      className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium mb-4"
    >
      <ChevronRight size={20} className="rotate-180" />
      Back to Dashboard
    </button>
  );

  const FormSection = ({ title, icon: Icon, children }) => (
    <div className="bg-gray-50 rounded-xl p-6 mb-6">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gray-200">
        <Icon className="text-blue-600" size={24} />
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );

  const InfoItem = ({ label, value }) => (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );

  const RatingStars = ({ value, onChange }) => (
    <div className="flex gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star
            size={28}
            className={star <= (value || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
          />
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-600 font-medium">{value || 0}/5</span>
    </div>
  );

  const LikertQuestion = ({ question }) => (
    <div className="mb-4">
      <p className="text-sm font-medium text-gray-700 mb-3">{question}</p>
      <div className="flex flex-wrap gap-2">
        {['Strongly Agree', 'Agree', 'Neutral', 'Disagree', 'Strongly Disagree'].map((option, idx) => (
          <button
            key={idx}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );

  const DecisionButton = ({ icon: Icon, label, description, color, onClick, selected }) => {
    const colors = {
      green: selected ? 'bg-green-600 text-white' : 'bg-white border-2 border-green-600 text-green-600',
      yellow: selected ? 'bg-yellow-500 text-white' : 'bg-white border-2 border-yellow-500 text-yellow-600',
      red: selected ? 'bg-red-600 text-white' : 'bg-white border-2 border-red-600 text-red-600'
    };
    
    return (
      <button
        onClick={onClick}
        className={`${colors[color]} p-4 rounded-lg hover:shadow-lg transition-all`}
      >
        <Icon size={32} className="mx-auto mb-2" />
        <p className="font-semibold mb-1">{label}</p>
        <p className="text-xs opacity-90">{description}</p>
      </button>
    );
  };

  const ApprovalStep = ({ status, label }) => {
    const config = {
      completed: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Clock },
      waiting: { bg: 'bg-gray-100', text: 'text-gray-500', icon: Clock }
    };
    
    const { bg, text, icon: Icon } = config[status];
    
    return (
      <div className={`${bg} px-4 py-2 rounded-lg flex items-center gap-2`}>
        <Icon size={16} className={text} />
        <span className={`text-sm font-medium ${text}`}>{label}</span>
      </div>
    );
  };

  // Main Navigation
  const Navbar = () => (
    <div className="bg-white border-b shadow-sm mb-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold text-blue-600">My Almet HR</h1>
            <nav className="flex gap-6">
              <NavItem label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
              <NavItem label="Settings" active={activeView === 'settings'} onClick={() => setActiveView('settings')} icon={Settings} />
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-600 hover:text-gray-800">
              <Bell size={24} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                HR
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const NavItem = ({ label, active, onClick, icon: Icon }) => (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
        active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-800'
      }`}
    >
      {Icon && <Icon size={18} />}
      {label}
    </button>
  );

  // Main Render
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {activeView === 'dashboard' && <Dashboard />}
        {activeView === 'probation' && <ProbationView />}
        {activeView === 'renewal' && <RenewalView />}
        {activeView === 'resignation' && <ResignationView />}
        {activeView === 'exit' && <ExitView />}
        {activeView === 'settings' && <SettingsView />}
      </div>
    </div>
  );
}