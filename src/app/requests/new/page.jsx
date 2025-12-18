'use client';
import React, { useState } from 'react';
import { 
  User, Briefcase, LogOut, Star, Calendar, AlertCircle, CheckCircle, 
  Clock, Send, FileText, Upload, Eye, Edit, Trash2, Settings,
  UserCheck, RefreshCw, Mail, Bell, ChevronRight, Download,
  XCircle, CheckSquare, Filter, Search, MoreVertical, X, Plus,
  MessageSquare, Award, Building, Phone, TrendingUp
} from 'lucide-react';

export default function CompleteHRSystem() {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [uploadedFile, setUploadedFile] = useState(null);
  const [userRole, setUserRole] = useState('manager'); // 'manager', 'hr', 'employee'
  const [showEmployeeResignation, setShowEmployeeResignation] = useState(false);
  
  // Mock data
  const [employees] = useState([
    { 
      id: 1, name: 'Ali Məmmədov', empId: 'EMP001', position: 'Software Developer', 
      department: 'IT', email: 'ali.mammadov@company.com',
      startDate: '2024-09-15', contractType: 'Probation', probationEnd: '2024-12-15',
      contractEnd: '2025-09-15', manager: 'Rəşad Əliyev', managerEmail: 'rashad@company.com',
      status: 'Active', daysUntilAction: 5, actionType: 'probation'
    },
    { 
      id: 2, name: 'Leyla İbrahimova', empId: 'EMP002', position: 'Marketing Manager', 
      department: 'Marketing', email: 'leyla@company.com',
      startDate: '2023-01-10', contractType: 'Fixed-term', probationEnd: null,
      contractEnd: '2025-01-10', manager: 'Nigar Həsənova', managerEmail: 'nigar@company.com',
      status: 'Active', daysUntilAction: 25, actionType: 'renewal'
    },
    { 
      id: 3, name: 'Vüsal Həsənov', empId: 'EMP003', position: 'Sales Executive', 
      department: 'Sales', email: 'vusal@company.com',
      startDate: '2022-03-20', contractType: 'Permanent', probationEnd: null,
      contractEnd: null, manager: 'Elvin Quliyev', managerEmail: 'elvin@company.com',
      status: 'Resignation', daysUntilAction: 7, actionType: 'exit', 
      lastWorkingDay: '2024-12-20'
    },
    { 
      id: 4, name: 'Səbinə Quliyeva', empId: 'EMP004', position: 'HR Specialist', 
      department: 'HR', email: 'sabina@company.com',
      startDate: '2021-05-15', contractType: 'Permanent', probationEnd: null,
      contractEnd: null, manager: 'Aynur Məmmədova', managerEmail: 'aynur@company.com',
      status: 'Active', daysUntilAction: null, actionType: null
    }
  ]);

  const [resignations, setResignations] = useState([
    { 
      id: 1, 
      employee: 'Vüsal Həsənov', 
      empId: 'EMP003',
      position: 'Sales Executive',
      department: 'Sales',
      submittedDate: '2024-11-20', 
      noticePeriod: 30, 
      lastDay: '2024-12-20', 
      status: 'Pending Manager',
      reason: 'Career Growth',
      reasonDetails: 'Accepted position at larger company with better career advancement opportunities.',
      hasAttachment: true,
      fileName: 'resignation_letter.pdf',
      manager: 'Elvin Quliyev',
      managerEmail: 'elvin@company.com',
      comments: []
    }
  ]);

  const [defaultHR] = useState('hr.department@company.com');

  // Resignation Form State
  const [resignationForm, setResignationForm] = useState({
    employeeId: '',
    lastWorkingDay: '',
    reason: '',
    reasonDetails: '',
    noticePeriod: 30,
    attachment: null
  });

  // Dashboard Component
  const Dashboard = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl">
        <h1 className="text-4xl font-bold mb-3">HR Management System</h1>
        <p className="text-blue-100 text-lg">Complete Employee Lifecycle Management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={UserCheck} title="Probation Reviews" count={1} color="blue" onClick={() => setActiveView('probation')} />
        <StatCard icon={RefreshCw} title="Contract Renewals" count={1} color="green" onClick={() => setActiveView('renewal')} />
        <StatCard icon={LogOut} title="Exit Interviews" count={1} color="red" onClick={() => setActiveView('exit')} />
        <StatCard icon={FileText} title="Resignations" count={resignations.length} color="orange" onClick={() => setActiveView('resignation')} />
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Bell className="text-red-500" />
            Urgent Actions
          </h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
            <Settings size={18} />
            Settings
          </button>
        </div>
        
        <div className="space-y-4">
          {resignations.filter(r => r.status === 'Pending Manager').map(resignation => (
            <div key={resignation.id} className="bg-orange-50 border-orange-200 border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <FileText className="text-orange-600" size={24} />
                <div>
                  <p className="font-medium text-gray-800">{resignation.employee} - Resignation</p>
                  <p className="text-sm text-gray-600">Last day: {resignation.lastDay} ({resignation.noticePeriod} days notice)</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">ACTION REQUIRED</span>
                <button 
                  onClick={() => setActiveView('resignation')}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors text-sm font-medium"
                >
                  Review
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Employee Overview</h2>
        <EmployeeTable employees={employees} />
      </div>
    </div>
  );

  // MAIN RESIGNATION VIEW - Complete Redesign
  const ResignationView = () => {
    const [activeTab, setActiveTab] = useState('pending');
    const [showNewResignation, setShowNewResignation] = useState(false);
    const [selectedResignation, setSelectedResignation] = useState(null);

    return (
      <div className="space-y-6">
        <BackButton onClick={() => setActiveView('dashboard')} />
        
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-white bg-opacity-20 rounded-full">
                  <FileText size={32} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Resignation Management</h1>
                  <p className="text-orange-100 mt-1">Process and track employee resignations</p>
                </div>
              </div>
              <button 
                onClick={() => setShowNewResignation(true)}
                className="px-6 py-3 bg-white text-orange-600 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center gap-2 shadow-lg"
              >
                <Plus size={20} />
                New Resignation
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b bg-gray-50">
            <div className="flex">
              <TabButton 
                active={activeTab === 'pending'} 
                onClick={() => setActiveTab('pending')}
                label="Pending Approval"
                count={resignations.filter(r => r.status.includes('Pending')).length}
              />
              <TabButton 
                active={activeTab === 'approved'} 
                onClick={() => setActiveTab('approved')}
                label="Approved"
                count={0}
              />
              <TabButton 
                active={activeTab === 'completed'} 
                onClick={() => setActiveTab('completed')}
                label="Completed"
                count={0}
              />
              <TabButton 
                active={activeTab === 'all'} 
                onClick={() => setActiveTab('all')}
                label="All Resignations"
                count={resignations.length}
              />
            </div>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input 
                  type="text"
                  placeholder="Search by employee name, ID, or department..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
                <Filter size={18} />
                Filter
              </button>
            </div>

            {/* Resignation Cards */}
            {activeTab === 'pending' && (
              <div className="space-y-4">
                {resignations.filter(r => r.status.includes('Pending')).map(resignation => (
                  <ResignationCard 
                    key={resignation.id} 
                    resignation={resignation}
                    onView={() => setSelectedResignation(resignation)}
                  />
                ))}
              </div>
            )}

            {activeTab === 'all' && (
              <div className="space-y-4">
                {resignations.map(resignation => (
                  <ResignationCard 
                    key={resignation.id} 
                    resignation={resignation}
                    onView={() => setSelectedResignation(resignation)}
                  />
                ))}
              </div>
            )}

            {(activeTab === 'approved' || activeTab === 'completed') && (
              <div className="text-center py-12">
                <FileText className="mx-auto text-gray-300 mb-4" size={64} />
                <p className="text-gray-500">No {activeTab} resignations</p>
              </div>
            )}
          </div>
        </div>

        {/* New Resignation Modal */}
        {showNewResignation && (
          <NewResignationModal 
            employees={employees}
            onClose={() => setShowNewResignation(false)}
            onSubmit={(data) => {
              console.log('New resignation:', data);
              setShowNewResignation(false);
            }}
          />
        )}

        {/* View/Process Resignation Modal */}
        {selectedResignation && (
          <ResignationDetailModal 
            resignation={selectedResignation}
            onClose={() => setSelectedResignation(null)}
            onApprove={() => {
              console.log('Approved:', selectedResignation.id);
              setSelectedResignation(null);
            }}
            onReject={() => {
              console.log('Rejected:', selectedResignation.id);
              setSelectedResignation(null);
            }}
          />
        )}
      </div>
    );
  };

  // Resignation Card Component
  const ResignationCard = ({ resignation, onView }) => {
    const statusColors = {
      'Pending Manager': 'bg-yellow-100 text-yellow-700 border-yellow-300',
      'Pending HR': 'bg-blue-100 text-blue-700 border-blue-300',
      'Approved': 'bg-green-100 text-green-700 border-green-300',
      'Rejected': 'bg-red-100 text-red-700 border-red-300'
    };

    const daysRemaining = Math.ceil((new Date(resignation.lastDay) - new Date()) / (1000 * 60 * 60 * 24));

    return (
      <div className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all bg-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <User className="text-orange-600" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">{resignation.employee}</h3>
              <p className="text-sm text-gray-500">{resignation.empId} • {resignation.position}</p>
              <p className="text-sm text-gray-500">{resignation.department} Department</p>
            </div>
          </div>
          <span className={`px-4 py-2 rounded-full text-sm font-medium border ${statusColors[resignation.status]}`}>
            {resignation.status}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
          <InfoItem label="Submitted" value={resignation.submittedDate} />
          <InfoItem label="Last Working Day" value={resignation.lastDay} />
          <InfoItem label="Days Remaining" value={
            <span className={`font-semibold ${daysRemaining <= 7 ? 'text-red-600' : 'text-gray-800'}`}>
              {daysRemaining} days
            </span>
          } />
          <InfoItem label="Notice Period" value={`${resignation.noticePeriod} days`} />
        </div>

        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm font-medium text-gray-700 mb-1">Reason for Leaving:</p>
          <p className="text-sm text-gray-600">{resignation.reason}</p>
          {resignation.reasonDetails && (
            <p className="text-sm text-gray-500 mt-2">{resignation.reasonDetails}</p>
          )}
        </div>

        {resignation.hasAttachment && (
          <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
            <FileText size={16} />
            <span>Resignation letter attached: </span>
            <button className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              <Download size={14} />
              {resignation.fileName}
            </button>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            <p><strong>Manager:</strong> {resignation.manager}</p>
            <p>{resignation.managerEmail}</p>
          </div>
          <button 
            onClick={onView}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center gap-2"
          >
            <Eye size={18} />
            View & Process
          </button>
        </div>
      </div>
    );
  };

  // New Resignation Modal
  const NewResignationModal = ({ employees, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
      employeeId: '',
      lastWorkingDay: '',
      reason: '',
      reasonDetails: '',
      noticePeriod: 30
    });
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert('File size must be less than 5MB');
          return;
        }
        setSelectedFile(file);
      }
    };

    const handleSubmit = () => {
      if (!formData.employeeId || !formData.lastWorkingDay || !formData.reason) {
        alert('Please fill in all required fields');
        return;
      }
      onSubmit({ ...formData, attachment: selectedFile });
    };

    const selectedEmployee = employees.find(e => e.id === parseInt(formData.employeeId));

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Submit New Resignation</h2>
              <p className="text-orange-100 mt-1">Complete the form below to process resignation</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Employee Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Employee <span className="text-red-500">*</span>
              </label>
              <select 
                value={formData.employeeId}
                onChange={(e) => setFormData({...formData, employeeId: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Choose an employee...</option>
                {employees.filter(e => e.status === 'Active').map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} - {emp.empId} ({emp.position})
                  </option>
                ))}
              </select>
            </div>

            {/* Employee Details (if selected) */}
            {selectedEmployee && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-medium text-gray-800 mb-3">Employee Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <InfoItem label="Department" value={selectedEmployee.department} />
                  <InfoItem label="Manager" value={selectedEmployee.manager} />
                  <InfoItem label="Start Date" value={selectedEmployee.startDate} />
                  <InfoItem label="Contract Type" value={selectedEmployee.contractType} />
                </div>
              </div>
            )}

            {/* Notice Period */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notice Period (days) <span className="text-red-500">*</span>
                </label>
                <select 
                  value={formData.noticePeriod}
                  onChange={(e) => setFormData({...formData, noticePeriod: parseInt(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                >
                  <option value="14">14 days (2 weeks)</option>
                  <option value="30">30 days (1 month)</option>
                  <option value="45">45 days (1.5 months)</option>
                  <option value="60">60 days (2 months)</option>
                  <option value="90">90 days (3 months)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Working Day <span className="text-red-500">*</span>
                </label>
                <input 
                  type="date"
                  value={formData.lastWorkingDay}
                  onChange={(e) => setFormData({...formData, lastWorkingDay: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Leaving <span className="text-red-500">*</span>
              </label>
              <select 
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select reason...</option>
                <option value="Career Growth">Career Growth / Better Opportunity</option>
                <option value="Salary">Compensation / Salary</option>
                <option value="Personal Reasons">Personal / Family Reasons</option>
                <option value="Relocation">Relocation</option>
                <option value="Work Environment">Work Environment</option>
                <option value="Health">Health Issues</option>
                <option value="Further Education">Further Education / Studies</option>
                <option value="Retirement">Retirement</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Additional Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Details
              </label>
              <textarea 
                value={formData.reasonDetails}
                onChange={(e) => setFormData({...formData, reasonDetails: e.target.value})}
                rows={4}
                placeholder="Provide more context about the resignation..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resignation Letter (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                <input 
                  type="file"
                  id="fileUpload"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="fileUpload" className="cursor-pointer">
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="text-orange-600" size={32} />
                      <div className="text-left">
                        <p className="font-medium text-gray-800">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedFile(null);
                        }}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-sm text-gray-600 font-medium">Click to upload resignation letter</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX (Max 5MB)</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Warning Notice */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex gap-3">
                <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Please Note:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>This resignation will require manager approval</li>
                    <li>After manager approval, it will be sent to HR for final processing</li>
                    <li>Exit interview will be automatically scheduled 7 days before last working day</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-4 justify-end border-t">
            <button 
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center gap-2"
            >
              <Send size={20} />
              Submit Resignation
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Resignation Detail Modal
  const ResignationDetailModal = ({ resignation, onClose, onApprove, onReject }) => {
    const [comment, setComment] = useState('');
    const [showCommentBox, setShowCommentBox] = useState(false);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Resignation Details</h2>
              <p className="text-orange-100 mt-1">{resignation.employee} - {resignation.empId}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Status Banner */}
            <div className={`p-4 rounded-lg border-2 ${
              resignation.status === 'Pending Manager' ? 'bg-yellow-50 border-yellow-300' :
              resignation.status === 'Pending HR' ? 'bg-blue-50 border-blue-300' :
              'bg-green-50 border-green-300'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-800">Status: {resignation.status}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {resignation.status === 'Pending Manager' && 'Awaiting manager approval'}
                    {resignation.status === 'Pending HR' && 'Manager approved - awaiting HR review'}
                  </p>
                </div>
                {resignation.status.includes('Pending') && (
                  <Clock className="text-gray-400" size={24} />
                )}
              </div>
            </div>

            {/* Employee Information */}
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <User size={20} />
                Employee Information
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InfoItem label="Full Name" value={resignation.employee} />
                <InfoItem label="Employee ID" value={resignation.empId} />
                <InfoItem label="Position" value={resignation.position} />
                <InfoItem label="Department" value={resignation.department} />
                <InfoItem label="Manager" value={resignation.manager} />
                <InfoItem label="Manager Email" value={resignation.managerEmail} />
              </div>
            </div>

            {/* Resignation Details */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Calendar size={20} />
                Resignation Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <InfoItem label="Submitted Date" value={resignation.submittedDate} />
                <InfoItem label="Notice Period" value={`${resignation.noticePeriod} days`} />
                <InfoItem label="Last Working Day" value={resignation.lastDay} />
                <InfoItem label="Days Remaining" value={
                  <span className="font-semibold text-red-600">
                    {Math.ceil((new Date(resignation.lastDay) - new Date()) / (1000 * 60 * 60 * 24))} days
                  </span>
                } />
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Reason for Leaving:</p>
                <p className="text-gray-800 font-semibold mb-2">{resignation.reason}</p>
                {resignation.reasonDetails && (
                  <p className="text-sm text-gray-600">{resignation.reasonDetails}</p>
                )}
              </div>
            </div>

            {/* Attached Document */}
            {resignation.hasAttachment && (
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText size={20} />
                  Attached Document
                </h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-100 rounded-lg">
                      <FileText className="text-red-600" size={24} />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{resignation.fileName}</p>
                      <p className="text-sm text-gray-500">PDF Document</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                    <Download size={18} />
                    Download
                  </button>
                </div>
              </div>
            )}

            {/* Approval Flow */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <CheckSquare size={20} />
                Approval Workflow
              </h3>
              <div className="flex items-center gap-3">
                <ApprovalStep 
                  status={resignation.status === 'Pending Manager' ? 'pending' : 'completed'} 
                  label="Line Manager"
                  name={resignation.manager}
                />
                <ChevronRight size={20} className="text-gray-400" />
                <ApprovalStep 
                  status={resignation.status === 'Pending HR' ? 'pending' : resignation.status === 'Approved' ? 'completed' : 'waiting'} 
                  label="HR Manager"
                  name="HR Department"
                />
                <ChevronRight size={20} className="text-gray-400" />
                <ApprovalStep 
                  status={resignation.status === 'Approved' ? 'completed' : 'waiting'} 
                  label="Exit Process"
                  name="Final Steps"
                />
              </div>
            </div>

            {/* Comments Section */}
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MessageSquare size={20} />
                Comments & Notes
              </h3>
              
              {resignation.comments && resignation.comments.length > 0 ? (
                <div className="space-y-3 mb-4">
                  {resignation.comments.map((comment, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-800">{comment.author}</span>
                        <span className="text-sm text-gray-500">{comment.date}</span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-4">No comments yet</p>
              )}

              {!showCommentBox ? (
                <button 
                  onClick={() => setShowCommentBox(true)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2"
                >
                  <Plus size={18} />
                  Add Comment
                </button>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    placeholder="Add your comment or notes..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  />
                  <div className="flex gap-2">
                    <button 
                      onClick={() => {
                        console.log('Comment added:', comment);
                        setComment('');
                        setShowCommentBox(false);
                      }}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Post Comment
                    </button>
                    <button 
                      onClick={() => {
                        setComment('');
                        setShowCommentBox(false);
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Next Steps Info */}
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex gap-3">
                <CheckCircle className="text-green-600 flex-shrink-0" size={20} />
                <div className="text-sm text-green-800">
                  <p className="font-medium mb-2">What happens after approval?</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Manager approval → sent to HR for final review</li>
                    <li>HR approval → exit interview scheduled (7 days before last day)</li>
                    <li>Employee notified via email and system notification</li>
                    <li>Asset return checklist will be activated</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          {resignation.status === 'Pending Manager' && (
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-4 justify-end border-t">
              <button 
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  if (window.confirm('Are you sure you want to reject this resignation?')) {
                    onReject();
                  }
                }}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
              >
                <XCircle size={20} />
                Reject
              </button>
              <button 
                onClick={() => {
                  if (window.confirm('Approve this resignation and forward to HR?')) {
                    onApprove();
                  }
                }}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
              >
                <CheckCircle size={20} />
                Approve & Forward to HR
              </button>
            </div>
          )}

          {resignation.status === 'Pending HR' && (
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-4 justify-end border-t">
              <button 
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  if (window.confirm('Soft delete this employee record?')) {
                    console.log('Soft delete employee');
                  }
                }}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
              >
                <Trash2 size={20} />
                Soft Delete Employee
              </button>
              <button 
                onClick={() => {
                  window.location.href = `/employee/edit/${resignation.empId}`;
                }}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              >
                <Edit size={20} />
                Edit Employee Record
              </button>
            </div>
          )}

          {resignation.status === 'Approved' && (
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-4 justify-end border-t">
              <button 
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Close
              </button>
              <button 
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
              >
                <Calendar size={20} />
                View Exit Interview
              </button>
            </div>
          )}
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

  const EmployeeTable = ({ employees }) => (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50 border-b">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Contract</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {employees.map(emp => (
            <tr key={emp.id} className="hover:bg-gray-50">
              <td className="px-6 py-4">
                <div>
                  <p className="font-medium text-gray-800">{emp.name}</p>
                  <p className="text-sm text-gray-500">{emp.empId}</p>
                </div>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{emp.position}</td>
              <td className="px-6 py-4 text-sm text-gray-600">{emp.department}</td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  emp.status === 'Active' ? 'bg-green-100 text-green-700' : 
                  emp.status === 'Resignation' ? 'bg-orange-100 text-orange-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {emp.status}
                </span>
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">{emp.contractType}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const BackButton = ({ onClick }) => (
    <button 
      onClick={onClick}
      className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-medium mb-4 transition-colors"
    >
      <ChevronRight size={20} className="rotate-180" />
      Back to Dashboard
    </button>
  );

  const InfoItem = ({ label, value }) => (
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-800">{value}</p>
    </div>
  );

  const TabButton = ({ active, onClick, label, count }) => (
    <button
      onClick={onClick}
      className={`px-6 py-4 font-medium transition-colors border-b-2 ${
        active 
          ? 'border-orange-500 text-orange-600 bg-white' 
          : 'border-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100'
      }`}
    >
      {label} {count !== undefined && (
        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
          active ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-600'
        }`}>
          {count}
        </span>
      )}
    </button>
  );

  const ApprovalStep = ({ status, label, name }) => {
    const config = {
      completed: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-300', icon: CheckCircle },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-300', icon: Clock },
      waiting: { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-300', icon: Clock }
    };
    
    const { bg, text, border, icon: Icon } = config[status];
    
    return (
      <div className={`${bg} ${border} border-2 px-4 py-3 rounded-lg flex-1`}>
        <div className="flex items-center gap-2 mb-1">
          <Icon size={18} className={text} />
          <span className={`text-sm font-semibold ${text}`}>{label}</span>
        </div>
        <p className="text-xs text-gray-600">{name}</p>
      </div>
    );
  };

  // Main Navigation
  const Navbar = () => (
    <div className="bg-white border-b shadow-sm mb-6">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center gap-8">
            
            <nav className="flex gap-6">
              {userRole === 'employee' ? (
                <>
                  <NavItem label="My Profile" active={activeView === 'profile'} onClick={() => setActiveView('profile')} icon={User} />
                  <NavItem label="My Requests" active={activeView === 'my-requests'} onClick={() => setActiveView('my-requests')} icon={FileText} />
                </>
              ) : (
                <>
                  <NavItem label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
                  <NavItem label="Resignations" active={activeView === 'resignation'} onClick={() => setActiveView('resignation')} icon={FileText} />
                  <NavItem label="Settings" active={activeView === 'settings'} onClick={() => setActiveView('settings')} icon={Settings} />
                </>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {/* Role Switcher (Demo purposes) */}
            <select 
              value={userRole}
              onChange={(e) => {
                setUserRole(e.target.value);
                setActiveView(e.target.value === 'employee' ? 'profile' : 'dashboard');
              }}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="manager">Manager View</option>
              <option value="hr">HR View</option>
              <option value="employee">Employee View</option>
            </select>
       
           
          </div>
        </div>
      </div>
    </div>
  );

  const NavItem = ({ label, active, onClick, icon: Icon }) => (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
        active ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
      }`}
    >
      {Icon && <Icon size={18} />}
      {label}
    </button>
  );

  // Employee Self-Service Portal
  const EmployeePortal = () => {
    const currentEmployee = employees[3]; // Səbinə Quliyeva
    
    return (
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-xl">
          <h1 className="text-3xl font-bold mb-2">Welcome, {currentEmployee.name}</h1>
          <p className="text-blue-100 text-lg">{currentEmployee.position} • {currentEmployee.department}</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ActionCard
            icon={FileText}
            title="Submit Resignation"
            description="Start resignation process"
            color="orange"
            onClick={() => setShowEmployeeResignation(true)}
          />
          <ActionCard
            icon={Calendar}
            title="Request Leave"
            description="Submit vacation request"
            color="blue"
            onClick={() => alert('Leave request coming soon')}
          />
          <ActionCard
            icon={User}
            title="My Profile"
            description="View and update info"
            color="green"
            onClick={() => alert('Profile view coming soon')}
          />
        </div>

        {/* My Requests */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">My Requests</h2>
          <div className="text-center py-12">
            <FileText className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500">No active requests</p>
            <button 
              onClick={() => setShowEmployeeResignation(true)}
              className="mt-4 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Submit New Request
            </button>
          </div>
        </div>

        {/* Employee Resignation Modal */}
        {showEmployeeResignation && (
          <EmployeeResignationModal
            employee={currentEmployee}
            onClose={() => setShowEmployeeResignation(false)}
            onSubmit={(data) => {
              console.log('Employee resignation submitted:', data);
              alert('Resignation submitted successfully! Your manager will be notified.');
              setShowEmployeeResignation(false);
            }}
          />
        )}
      </div>
    );
  };

  // Employee Resignation Modal (Simplified for Employee)
  const EmployeeResignationModal = ({ employee, onClose, onSubmit }) => {
    const [formData, setFormData] = useState({
      lastWorkingDay: '',
      reason: '',
      reasonDetails: '',
      noticePeriod: 30
    });
    const [selectedFile, setSelectedFile] = useState(null);

    const handleFileChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          alert('File size must be less than 5MB');
          return;
        }
        setSelectedFile(file);
      }
    };

    const handleSubmit = () => {
      if (!formData.lastWorkingDay || !formData.reason) {
        alert('Please fill in all required fields');
        return;
      }
      onSubmit({ ...formData, attachment: selectedFile });
    };

    const today = new Date();
    const minLastDay = new Date(today);
    minLastDay.setDate(minLastDay.getDate() + formData.noticePeriod);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Submit Resignation</h2>
              <p className="text-orange-100 mt-1">Please complete all required information</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Your Information */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="font-medium text-gray-800 mb-3">Your Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <InfoItem label="Name" value={employee.name} />
                <InfoItem label="Employee ID" value={employee.empId} />
                <InfoItem label="Position" value={employee.position} />
                <InfoItem label="Department" value={employee.department} />
                <InfoItem label="Manager" value={employee.manager} />
                <InfoItem label="Start Date" value={employee.startDate} />
              </div>
            </div>

            {/* Notice Period */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notice Period <span className="text-red-500">*</span>
              </label>
              <select 
                value={formData.noticePeriod}
                onChange={(e) => setFormData({...formData, noticePeriod: parseInt(e.target.value)})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="14">14 days (2 weeks)</option>
                <option value="30">30 days (1 month) - Standard</option>
                <option value="45">45 days (1.5 months)</option>
                <option value="60">60 days (2 months)</option>
                <option value="90">90 days (3 months)</option>
              </select>
              <p className="text-sm text-gray-500 mt-2">
                Your last working day must be at least {formData.noticePeriod} days from today
              </p>
            </div>

            {/* Last Working Day */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proposed Last Working Day <span className="text-red-500">*</span>
              </label>
              <input 
                type="date"
                value={formData.lastWorkingDay}
                onChange={(e) => setFormData({...formData, lastWorkingDay: e.target.value})}
                min={minLastDay.toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
              <p className="text-sm text-gray-500 mt-2">
                Minimum date: {minLastDay.toLocaleDateString()}
              </p>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Leaving <span className="text-red-500">*</span>
              </label>
              <select 
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Select your reason...</option>
                <option value="Career Growth">Career Growth / Better Opportunity</option>
                <option value="Salary">Compensation / Salary</option>
                <option value="Personal Reasons">Personal / Family Reasons</option>
                <option value="Relocation">Relocation</option>
                <option value="Work Environment">Work Environment</option>
                <option value="Health">Health Issues</option>
                <option value="Further Education">Further Education / Studies</option>
                <option value="Retirement">Retirement</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Additional Details */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Details (Optional)
              </label>
              <textarea 
                value={formData.reasonDetails}
                onChange={(e) => setFormData({...formData, reasonDetails: e.target.value})}
                rows={4}
                placeholder="You may provide additional context if you wish..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resignation Letter (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-orange-500 transition-colors">
                <input 
                  type="file"
                  id="employeeFileUpload"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="employeeFileUpload" className="cursor-pointer">
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="text-orange-600" size={32} />
                      <div className="text-left">
                        <p className="font-medium text-gray-800">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          setSelectedFile(null);
                        }}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-sm text-gray-600 font-medium">Click to upload resignation letter</p>
                      <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX (Max 5MB)</p>
                    </>
                  )}
                </label>
              </div>
            </div>

            {/* Important Notice */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex gap-3">
                <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-2">What happens next?</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Your resignation will be sent to your manager for review</li>
                    <li>You will receive email notification when it's approved or if any changes are needed</li>
                    <li>Exit interview will be scheduled closer to your last working day</li>
                    <li>HR will contact you regarding asset return and final procedures</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Confirmation */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-1 w-5 h-5" required />
                <span className="text-sm text-yellow-900">
                  I confirm that I wish to resign from my position and understand that this resignation is subject to approval by my manager and HR department. I will work professionally during my notice period.
                </span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex gap-4 justify-end border-t">
            <button 
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium flex items-center gap-2"
            >
              <Send size={20} />
              Submit Resignation
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ActionCard = ({ icon: Icon, title, description, color, onClick }) => {
    const colors = {
      orange: 'border-orange-500 hover:bg-orange-50',
      blue: 'border-blue-500 hover:bg-blue-50',
      green: 'border-green-500 hover:bg-green-50'
    };
    
    return (
      <button
        onClick={onClick}
        className={`bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition-all border-l-4 ${colors[color]} text-left w-full`}
      >
        <div className={`p-3 rounded-lg bg-${color}-100 w-fit mb-4`}>
          <Icon className={`text-${color}-600`} size={32} />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </button>
    );
  };

  // Main Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 pb-8">
        {userRole === 'employee' ? (
          <>
            {activeView === 'profile' && <EmployeePortal />}
            {activeView === 'my-requests' && <EmployeePortal />}
          </>
        ) : (
          <>
            {activeView === 'dashboard' && <Dashboard />}
            {activeView === 'resignation' && <ResignationView />}
            {activeView === 'settings' && (
              <div className="space-y-6">
                <BackButton onClick={() => setActiveView('dashboard')} />
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <h1 className="text-3xl font-bold text-gray-800 mb-2">System Settings</h1>
                  <p className="text-gray-600">Configure HR process settings</p>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}