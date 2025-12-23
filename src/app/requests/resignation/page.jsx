'use client';
import React, { useState } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { 
  FileText, Calendar, AlertCircle, Send, Upload, X, User, Briefcase,
  LogOut, MessageSquare, Award, Building, TrendingUp, Save, CheckCircle
} from 'lucide-react';

export default function EmployeeResignationExit() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('resignation');
  const [selectedFile, setSelectedFile] = useState(null);
  
  // Current logged-in employee (simulated)
  const currentEmployee = {
    id: 1,
    name: 'Ali Mammadov',
    empId: 'EMP001',
    position: 'Software Developer',
    department: 'IT',
    manager: 'Rashad Aliyev',
    email: 'ali.mammadov@company.com',
    startDate: '2024-01-15'
  };

  const [resignationForm, setResignationForm] = useState({
    submissionDate: new Date().toISOString().split('T')[0],
    lastWorkingDay: '',
    noticePeriod: 30,
    reason: '',
    reasonDetails: '',
    willingToStay: '',
    retentionOffer: '',
    projectsStatus: '',
    acknowledgeResponsibilities: false,
    acknowledgeAssets: false,
    acknowledgeConfidentiality: false
  });

  const [exitForm, setExitForm] = useState({
    jobReflection: 3,
    responsibilitiesClear: 3,
    challenges: '',
    managerRelationship: 3,
    teamCollaboration: 3,
    feedbackReceived: 3,
    leadershipComments: '',
    salaryBenefits: 3,
    growthOpportunities: 3,
    retentionSuggestions: '',
    workingConditions: 3,
    systemsEfficiency: 3,
    improvements: '',
    companyValues: 3,
    professionalAtmosphere: 3,
    culturalWords: '',
    finalComments: ''
  });

  const calculateLastWorkingDay = (noticePeriod) => {
    const today = new Date();
    const lastDay = new Date(today.setDate(today.getDate() + parseInt(noticePeriod)));
    return lastDay.toISOString().split('T')[0];
  };

  const handleNoticePeriodChange = (period) => {
    const lastDay = calculateLastWorkingDay(period);
    setResignationForm({
      ...resignationForm,
      noticePeriod: period,
      lastWorkingDay: lastDay
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      setSelectedFile(file);
    } else {
      alert('File size must be less than 5MB');
    }
  };

  const handleResignationSubmit = () => {
    if (!resignationForm.reason || !resignationForm.reasonDetails.trim()) {
      alert('Please fill in all required fields');
      return;
    }
    if (!resignationForm.acknowledgeResponsibilities || 
        !resignationForm.acknowledgeAssets || 
        !resignationForm.acknowledgeConfidentiality) {
      alert('Please acknowledge all required items');
      return;
    }
    console.log('Resignation submitted:', resignationForm, selectedFile);
    alert('Resignation submitted successfully! Your manager will be notified.');
  };

  const handleExitSubmit = () => {
    console.log('Exit interview submitted:', exitForm);
    alert('Exit interview completed successfully! Thank you for your feedback.');
  };

  const RatingField = ({ label, value, onChange, labels }) => (
    <div className="border-b border-gray-100 dark:border-gray-700 pb-3">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
      <div className="flex items-center gap-3">
        {[1, 2, 3, 4, 5].map((rating) => (
          <label key={rating} className="flex flex-col items-center cursor-pointer">
            <input
              type="radio"
              checked={value === rating}
              onChange={() => onChange(rating)}
              className="w-4 h-4 text-almet-sapphire mb-1.5"
            />
            <span className="text-xs text-gray-600 dark:text-gray-400 text-center">{labels[rating - 1]}</span>
          </label>
        ))}
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="mx-auto space-y-5">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white bg-opacity-20 rounded-lg">
              <FileText size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Resignation & Exit Process</h1>
              <p className="text-orange-100 text-sm">Submit your resignation and complete exit interview</p>
            </div>
          </div>
        </div>

        {/* Employee Info Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-almet-sapphire/10 rounded-lg">
              <User className="text-almet-sapphire" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 dark:text-gray-200">{currentEmployee.name}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {currentEmployee.empId} • {currentEmployee.position} • {currentEmployee.department}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Manager</p>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{currentEmployee.manager}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('resignation')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'resignation'
                  ? 'border-b-2 border-orange-500 text-orange-600 bg-orange-50 dark:bg-orange-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <FileText size={18} />
                Submit Resignation
              </div>
            </button>
            <button
              onClick={() => setActiveTab('exit')}
              className={`flex-1 px-6 py-4 font-medium transition-colors ${
                activeTab === 'exit'
                  ? 'border-b-2 border-red-500 text-red-600 bg-red-50 dark:bg-red-900/20'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <LogOut size={18} />
                Exit Interview
              </div>
            </button>
          </div>

          {/* Resignation Form */}
          {activeTab === 'resignation' && (
            <div className="p-6 space-y-5">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle className="text-blue-600 dark:text-blue-400 flex-shrink-0" size={18} />
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    <p className="font-medium mb-1">Important Information:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Your resignation will be sent to {currentEmployee.manager} for approval</li>
                      <li>Standard notice period is 30 days unless specified in your contract</li>
                      <li>You will be required to complete handover procedures</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Notice Period (days) <span className="text-red-500">*</span>
                  </label>
                  <select 
                    value={resignationForm.noticePeriod}
                    onChange={(e) => handleNoticePeriodChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
                  >
                    <option value="14">14 days (2 weeks)</option>
                    <option value="30">30 days (1 month)</option>
                    <option value="45">45 days (1.5 months)</option>
                    <option value="60">60 days (2 months)</option>
                    <option value="90">90 days (3 months)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Last Working Day <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date"
                  value={resignationForm.lastWorkingDay}
                  onChange={(e) => setResignationForm({...resignationForm, lastWorkingDay: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
                />
              </div>

            

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Additional Details 
                </label>
                <textarea 
                  value={resignationForm.reasonDetails}
                  onChange={(e) => setResignationForm({...resignationForm, reasonDetails: e.target.value})}
                  rows={4}
                  placeholder="Please provide more details about your decision to resign..."
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
                />
              </div>

      

              {resignationForm.willingToStay === 'yes' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    What would it take for you to stay?
                  </label>
                  <textarea 
                    value={resignationForm.retentionOffer}
                    onChange={(e) => setResignationForm({...resignationForm, retentionOffer: e.target.value})}
                    rows={3}
                    placeholder="Describe what changes or offers would make you reconsider..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
                  />
                </div>
              )}

             

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Attach Resignation Letter (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
                  {!selectedFile ? (
                    <label className="flex flex-col items-center cursor-pointer">
                      <Upload className="text-gray-400 mb-2" size={32} />
                      <span className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        Click to upload or drag and drop
                      </span>
                      <span className="text-xs text-gray-500">PDF, DOC, DOCX (Max 5MB)</span>
                      <input 
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="text-orange-600" size={24} />
                        <div>
                          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{selectedFile.name}</p>
                          <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setSelectedFile(null)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                      >
                        <X size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

             

              <div className="flex justify-end pt-4">
                <button 
                  onClick={handleResignationSubmit}
                  className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center gap-2 text-sm"
                >
                  <Send size={18} />
                  Submit Resignation
                </button>
              </div>
            </div>
          )}

          {/* Exit Interview Form */}
          {activeTab === 'exit' && (
            <div className="p-6 space-y-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  <strong>Thank you for your feedback.</strong> Your honest insights will help us improve our workplace and better support our employees.
                </p>
              </div>

              {/* Section 1 */}
              <section>
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <Briefcase size={20} className="text-red-600" />
                  Role & Responsibilities
                </h3>
                <div className="space-y-3">
                  <RatingField 
                    label="How well did your job description reflect your actual duties?"
                    value={exitForm.jobReflection}
                    onChange={(val) => setExitForm({...exitForm, jobReflection: val})}
                    labels={['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']}
                  />
                  <RatingField 
                    label="Were your responsibilities clearly defined?"
                    value={exitForm.responsibilitiesClear}
                    onChange={(val) => setExitForm({...exitForm, responsibilitiesClear: val})}
                    labels={['Not Clear', 'Somewhat', 'Clear', 'Very Clear', 'Extremely Clear']}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      What were the main challenges you faced in your role?
                    </label>
                    <textarea
                      value={exitForm.challenges}
                      onChange={(e) => setExitForm({...exitForm, challenges: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
                    />
                  </div>
                </div>
              </section>

              {/* Section 2 */}
              <section>
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <User size={20} className="text-red-600" />
                  Work Environment & Management
                </h3>
                <div className="space-y-3">
                  <RatingField 
                    label="How would you rate your relationship with your manager and colleagues?"
                    value={exitForm.managerRelationship}
                    onChange={(val) => setExitForm({...exitForm, managerRelationship: val})}
                    labels={['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']}
                  />
                  <RatingField 
                    label="How effective was team collaboration?"
                    value={exitForm.teamCollaboration}
                    onChange={(val) => setExitForm({...exitForm, teamCollaboration: val})}
                    labels={['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']}
                  />
                  <RatingField 
                    label="Did you receive adequate guidance and feedback?"
                    value={exitForm.feedbackReceived}
                    onChange={(val) => setExitForm({...exitForm, feedbackReceived: val})}
                    labels={['Never', 'Rarely', 'Sometimes', 'Often', 'Always']}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Comments on leadership and management style
                    </label>
                    <textarea
                      value={exitForm.leadershipComments}
                      onChange={(e) => setExitForm({...exitForm, leadershipComments: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
                    />
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section>
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <TrendingUp size={20} className="text-red-600" />
                  Compensation & Career Development
                </h3>
                <div className="space-y-3">
                  <RatingField 
                    label="How satisfied were you with your salary and benefits?"
                    value={exitForm.salaryBenefits}
                    onChange={(val) => setExitForm({...exitForm, salaryBenefits: val})}
                    labels={['Very Dissatisfied', 'Dissatisfied', 'Neutral', 'Satisfied', 'Very Satisfied']}
                  />
                  <RatingField 
                    label="Did you have opportunities for professional growth?"
                    value={exitForm.growthOpportunities}
                    onChange={(val) => setExitForm({...exitForm, growthOpportunities: val})}
                    labels={['None', 'Very Few', 'Some', 'Many', 'Excellent']}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      What could we have done to retain you?
                    </label>
                    <textarea
                      value={exitForm.retentionSuggestions}
                      onChange={(e) => setExitForm({...exitForm, retentionSuggestions: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
                    />
                  </div>
                </div>
              </section>

              {/* Section 4 */}
              <section>
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <Building size={20} className="text-red-600" />
                  Work Conditions
                </h3>
                <div className="space-y-3">
                  <RatingField 
                    label="How would you rate the working conditions?"
                    value={exitForm.workingConditions}
                    onChange={(val) => setExitForm({...exitForm, workingConditions: val})}
                    labels={['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']}
                  />
                  <RatingField 
                    label="How efficient were our systems and processes?"
                    value={exitForm.systemsEfficiency}
                    onChange={(val) => setExitForm({...exitForm, systemsEfficiency: val})}
                    labels={['Poor', 'Fair', 'Good', 'Very Good', 'Excellent']}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Suggestions for improvement
                    </label>
                    <textarea
                      value={exitForm.improvements}
                      onChange={(e) => setExitForm({...exitForm, improvements: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
                    />
                  </div>
                </div>
              </section>

              {/* Section 5 */}
              <section>
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <Award size={20} className="text-red-600" />
                  Company Culture & Values
                </h3>
                <div className="space-y-3">
                  <RatingField 
                    label="Did you feel aligned with the company mission and values?"
                    value={exitForm.companyValues}
                    onChange={(val) => setExitForm({...exitForm, companyValues: val})}
                    labels={['Not at all', 'Slightly', 'Moderately', 'Very Much', 'Completely']}
                  />
                  <RatingField 
                    label="Was there a professional and respectful atmosphere?"
                    value={exitForm.professionalAtmosphere}
                    onChange={(val) => setExitForm({...exitForm, professionalAtmosphere: val})}
                    labels={['Never', 'Rarely', 'Sometimes', 'Often', 'Always']}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Describe our company culture in three words
                    </label>
                    <input
                      type="text"
                      value={exitForm.culturalWords}
                      onChange={(e) => setExitForm({...exitForm, culturalWords: e.target.value})}
                      placeholder="e.g., Collaborative, Innovative, Supportive"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
                    />
                  </div>
                </div>
              </section>

              {/* Section 6 */}
              <section>
                <h3 className="text-base font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                  <MessageSquare size={20} className="text-red-600" />
                  Final Comments
                </h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    What would you change or improve about the company?
                  </label>
                  <textarea
                    value={exitForm.finalComments}
                    onChange={(e) => setExitForm({...exitForm, finalComments: e.target.value})}
                    rows={4}
                    placeholder="Share any final thoughts, suggestions, or feedback..."
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>
              </section>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={handleExitSubmit}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2 text-sm"
                >
                  <Save size={18} />
                  Submit Exit Interview
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}