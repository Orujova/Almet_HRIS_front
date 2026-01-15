'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  UserCheck, RefreshCw, FileText, LogOut, User, Eye, Plus,
  Clock, Search, Download, Building, AlertCircle, Calendar, Settings
} from 'lucide-react';
import resignationExitService from '@/services/resignationExitService';

// Import all modals
import ResignationSubmissionModal from '@/components/resignation/ResignationSubmissionModal';
import ResignationDetailModal from '@/components/resignation/ResignationDetailModal';
import ExitInterviewModal from '@/components/resignation/ExitInterviewModal';
import ContractRenewalModal from '@/components/resignation/ContractRenewalModal';
import ProbationReviewModal from '@/components/resignation/ProbationReviewModal';
import CreateExitInterviewModal from '@/components/resignation/CreateExitInterviewModal';

export default function ResignationExitManagement() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('employee');
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [respondentType, setRespondentType] = useState('EMPLOYEE');
  
  // Data states - ✅ Initialize as empty arrays
  const [resignations, setResignations] = useState([]);
  const [exitInterviews, setExitInterviews] = useState([]);
  const [contractRenewals, setContractRenewals] = useState([]);
  const [probationReviews, setProbationReviews] = useState([]);
  
  // Search/Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    loadUserAndData();
  }, []);

  const loadUserAndData = async () => {
    try {
      setLoading(true);
      
      // Get current user access info
      const userInfo = await resignationExitService.getCurrentUser();
      setCurrentUser(userInfo);
      
      // Get full user profile (includes employee data)
      const userProfile = await resignationExitService.getUser();
      
      // Merge user info with profile
      const fullUserData = {
        ...userInfo,
        ...userProfile,
        id: userProfile.employee?.id || userInfo.id,
        employee_id: userProfile.employee?.employee_id || userInfo.username,
        full_name: userProfile.employee?.full_name || `${userInfo.first_name} ${userInfo.last_name}`,
        job_title: userProfile.employee?.job_title || '',
        department_name: userProfile.employee?.department?.name || '',
        line_manager_name: userProfile.employee?.line_manager?.full_name || ''
      };
      
      setCurrentUser(fullUserData);
      
      const role = determineUserRole(userInfo);
      setUserRole(role);
      
      await loadDataForRole(role);
      
    } catch (error) {
      console.error('Error loading data:', error);
      // ✅ Even on error, keep arrays empty instead of undefined
      setResignations([]);
      setExitInterviews([]);
      setContractRenewals([]);
      setProbationReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const determineUserRole = (userInfo) => {
    if (userInfo.is_admin || userInfo.role === 'admin' || userInfo.is_superuser) {
      return 'admin';
    }
    if (userInfo.has_direct_reports || userInfo.is_manager) {
      return 'manager';
    }
    return 'employee';
  };

  const loadDataForRole = async (role) => {
    try {
      if (role === 'admin' || role === 'manager') {
        const [resigs, exits, contracts, probations] = await Promise.all([
          resignationExitService.resignation.getResignations().catch(() => []),
          resignationExitService.exitInterview.getExitInterviews().catch(() => []),
          resignationExitService.contractRenewal.getContractRenewals().catch(() => []),
          resignationExitService.probationReview.getProbationReviews().catch(() => [])
        ]);
        
        // ✅ Ensure arrays even if API returns something else
        setResignations(Array.isArray(resigs) ? resigs : []);
        setExitInterviews(Array.isArray(exits) ? exits : []);
        setContractRenewals(Array.isArray(contracts) ? contracts : []);
        setProbationReviews(Array.isArray(probations) ? probations : []);
      } else {
        const [resigs, exits] = await Promise.all([
          resignationExitService.resignation.getResignations().catch(() => []),
          resignationExitService.exitInterview.getExitInterviews().catch(() => [])
        ]);
        
        // ✅ Ensure arrays
        setResignations(Array.isArray(resigs) ? resigs : []);
        setExitInterviews(Array.isArray(exits) ? exits : []);
        setContractRenewals([]);
        setProbationReviews([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // ✅ Set empty arrays on error
      setResignations([]);
      setExitInterviews([]);
      setContractRenewals([]);
      setProbationReviews([]);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedItem(null);
    setModalType('');
  };

  const handleModalSuccess = () => {
    loadDataForRole(userRole);
  };

  // UI Components
  const StatusBadge = ({ status }) => {
    const colorClass = resignationExitService.helpers.getStatusColor(status);
    const statusText = resignationExitService.helpers.getStatusText(status);
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {statusText}
      </span>
    );
  };

  const UrgencyBadge = ({ days }) => {
    const colorClass = resignationExitService.helpers.getUrgencyColor(days);
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        {days} days
      </span>
    );
  };

  const InfoItem = ({ label, value }) => (
    <div>
      <p className="text-[10px] text-almet-waterloo dark:text-almet-bali-hai mb-0.5">{label}</p>
      <p className="text-xs font-medium text-almet-cloud-burst dark:text-gray-200">{value || '-'}</p>
    </div>
  );

  const TabButton = ({ active, onClick, icon: Icon, label, count, show = true }) => {
    if (!show) return null;
    
    return (
      <button
        onClick={onClick}
        className={`flex-1 px-3 py-2.5 font-medium transition-colors border-b-2 text-xs ${
          active
            ? 'border-almet-sapphire text-almet-sapphire bg-almet-mystic dark:bg-almet-cloud-burst/20'
            : 'border-transparent text-almet-waterloo dark:text-almet-bali-hai hover:text-almet-cloud-burst dark:hover:text-gray-200'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <Icon size={16} />
          <span>{label}</span>
          {count !== undefined && (
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              active ? 'bg-almet-sapphire text-white' : 'bg-gray-200 dark:bg-gray-700'
            }`}>
              {count}
            </span>
          )}
        </div>
      </button>
    );
  };

  // Overview Dashboard
  const OverviewSection = () => {
    // ✅ Safe array operations with fallback
    const myResignations = (resignations || []).filter(r => 
      ['PENDING_MANAGER', 'PENDING_HR', 'MANAGER_APPROVED'].includes(r.status)
    );
    const myExitInterviews = (exitInterviews || []).filter(e => e.status === 'PENDING');
    const pendingContracts = (contractRenewals || []).filter(c => c.status === 'PENDING_MANAGER');
    const pendingProbations = (probationReviews || []).filter(p => p.status === 'PENDING');

    return (
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(userRole !== 'employee' || myResignations.length > 0) && (
            <div className="bg-gradient-to-br from-red-500 to-pink-600 rounded-lg p-4 text-white shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                 onClick={() => setActiveTab('resignations')}>
              <div className="flex items-center justify-between mb-2">
                <FileText size={24} />
                <span className="text-2xl font-bold">{myResignations.length}</span>
              </div>
              <h3 className="text-sm font-medium mb-1">Resignations</h3>
              <p className="text-xs opacity-90">
                {userRole === 'employee' ? 'Your active resignations' : 'Pending approvals'}
              </p>
            </div>
          )}

          {(userRole !== 'employee' || myExitInterviews.length > 0) && (
            <div className="bg-gradient-to-br from-almet-sapphire to-almet-astral rounded-lg p-4 text-white shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                 onClick={() => setActiveTab('exit_interviews')}>
              <div className="flex items-center justify-between mb-2">
                <LogOut size={24} />
                <span className="text-2xl font-bold">{myExitInterviews.length}</span>
              </div>
              <h3 className="text-sm font-medium mb-1">Exit Interviews</h3>
              <p className="text-xs opacity-90">
                {userRole === 'employee' ? 'Pending completion' : 'Total interviews'}
              </p>
            </div>
          )}

          {userRole !== 'employee' && (
            <>
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg p-4 text-white shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                   onClick={() => setActiveTab('contracts')}>
                <div className="flex items-center justify-between mb-2">
                  <RefreshCw size={24} />
                  <span className="text-2xl font-bold">{pendingContracts.length}</span>
                </div>
                <h3 className="text-sm font-medium mb-1">Contract Renewals</h3>
                <p className="text-xs opacity-90">Awaiting decision</p>
              </div>

              <div className="bg-gradient-to-br from-almet-steel-blue to-almet-san-juan rounded-lg p-4 text-white shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                   onClick={() => setActiveTab('probations')}>
                <div className="flex items-center justify-between mb-2">
                  <UserCheck size={24} />
                  <span className="text-2xl font-bold">{pendingProbations.length}</span>
                </div>
                <h3 className="text-sm font-medium mb-1">Probation Reviews</h3>
                <p className="text-xs opacity-90">Pending review</p>
              </div>
            </>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-gray-200 mb-3 flex items-center gap-2">
            <AlertCircle size={16} className="text-almet-sapphire" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Employee: Submit Resignation */}
            {userRole === 'employee' && (
              <button
                onClick={() => {
                  setModalType('submit_resignation');
                  setShowModal(true);
                }}
                className="flex flex-col items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors border border-red-200 dark:border-red-700"
              >
                <FileText className="text-red-600 dark:text-red-400" size={20} />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                  Submit Resignation
                </span>
              </button>
            )}
            
            {/* Employee: Complete Exit Interview */}
            {myExitInterviews.length > 0 && (
              <button
                onClick={() => setActiveTab('exit_interviews')}
                className="flex flex-col items-center gap-2 p-3 bg-almet-mystic dark:bg-almet-cloud-burst/20 rounded-lg hover:bg-almet-mystic/80 dark:hover:bg-almet-cloud-burst/30 transition-colors border border-almet-sapphire/30"
              >
                <LogOut className="text-almet-sapphire dark:text-almet-steel-blue" size={20} />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                  Complete Exit Interview
                </span>
              </button>
            )}

            {/* Admin: Create Exit Interview */}
            {userRole === 'admin' && (
              <button
                onClick={() => {
                  setModalType('create_exit_interview');
                  setShowModal(true);
                }}
                className="flex flex-col items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors border border-purple-200 dark:border-purple-700"
              >
                <Plus className="text-purple-600 dark:text-purple-400" size={20} />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                  Create Exit Interview
                </span>
              </button>
            )}

            {/* Admin: Question Management */}
            {userRole === 'admin' && (
              <button
                onClick={() => window.location.href = '/question-management'}
                className="flex flex-col items-center gap-2 p-3 bg-almet-mystic dark:bg-almet-cloud-burst/20 rounded-lg hover:bg-almet-mystic/80 dark:hover:bg-almet-cloud-burst/30 transition-colors border border-almet-sapphire/30"
              >
                <Settings className="text-almet-sapphire dark:text-almet-steel-blue" size={20} />
                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                  Manage Questions
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-gray-200 mb-3">
            Recent Activity
          </h3>
          <div className="space-y-2">
            {/* ✅ Safe array operations */}
            {[...(resignations || []).slice(0, 3), ...(exitInterviews || []).slice(0, 2)]
              .slice(0, 5)
              .map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-almet-mystic dark:bg-almet-cloud-burst/30 rounded">
                      {item.employee_name ? (
                        <FileText size={14} className="text-almet-sapphire" />
                      ) : (
                        <LogOut size={14} className="text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-medium text-almet-cloud-burst dark:text-gray-200">
                        {item.employee_name || 'Exit Interview'}
                      </p>
                      <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                        {item.submission_date 
                          ? resignationExitService.helpers.formatDate(item.submission_date) 
                          : 'Recent'}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            {(resignations || []).length === 0 && (exitInterviews || []).length === 0 && (
              <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai text-center py-4">
                No recent activity
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Resignations List
  const ResignationsSection = () => {
    // ✅ Safe filtering
    const filteredResignations = (resignations || []).filter(r => {
      const matchesSearch = r.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           r.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    return (
      <div className="space-y-3">
        {/* Search and Filter */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-almet-waterloo" size={16} />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or ID..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-almet-sapphire"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg focus:ring-2 focus:ring-almet-sapphire"
          >
            <option value="all">All Status</option>
            <option value="PENDING_MANAGER">Pending Manager</option>
            <option value="PENDING_HR">Pending HR</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        {/* List */}
        {filteredResignations.length === 0 ? (
          <div className="text-center py-8 text-almet-waterloo dark:text-almet-bali-hai text-sm">
            No resignations found
          </div>
        ) : (
          filteredResignations.map(resignation => (
            <div key={resignation.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-2">
                  <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-lg">
                    <User className="text-red-600" size={16} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-gray-200">
                      {resignation.employee_name}
                    </h3>
                    <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                      {resignation.employee_id} • {resignation.position}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={resignation.status} />
                  <UrgencyBadge days={resignation.days_remaining} />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
                <InfoItem 
                  label="Submitted" 
                  value={resignationExitService.helpers.formatDate(resignation.submission_date)} 
                />
                <InfoItem 
                  label="Last Day" 
                  value={resignationExitService.helpers.formatDate(resignation.last_working_day)} 
                />
                <InfoItem label="Department" value={resignation.department} />
                <InfoItem label="Manager" value={resignation.manager_name} />
              </div>

              <div className="flex justify-end">
                <button 
                  onClick={() => {
                    setSelectedItem(resignation);
                    setModalType('resignation_detail');
                    setShowModal(true);
                  }}
                  className="px-3 py-1.5 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-xs font-medium flex items-center gap-1.5"
                >
                  <Eye size={14} />
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  // Exit Interviews Section  
  const ExitInterviewsSection = () => (
    <div className="space-y-3">
      {/* Create Button for Admin */}
      {userRole === 'admin' && (
        <div className="flex justify-end">
          <button
            onClick={() => {
              setModalType('create_exit_interview');
              setShowModal(true);
            }}
            className="px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-sm font-medium flex items-center gap-2"
          >
            <Plus size={16} />
            Create Exit Interview
          </button>
        </div>
      )}

      {exitInterviews.length === 0 ? (
        <div className="text-center py-8 text-almet-waterloo dark:text-almet-bali-hai text-sm">
          No exit interviews found
        </div>
      ) : (
        exitInterviews.map(interview => (
          <div key={interview.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-2">
                <div className="p-2 bg-almet-mystic dark:bg-almet-cloud-burst/30 rounded-lg">
                  <LogOut className="text-almet-sapphire" size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-gray-200">
                    {interview.employee_name}
                  </h3>
                  <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                    {interview.employee_id} • {interview.position}
                  </p>
                </div>
              </div>
              <StatusBadge status={interview.status} />
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
              <InfoItem label="Last Working Day" value={resignationExitService.helpers.formatDate(interview.last_working_day)} />
              <InfoItem label="Department" value={interview.department} />
              <InfoItem label="Started" value={interview.started_at ? resignationExitService.helpers.formatDate(interview.started_at) : '-'} />
            </div>

            <div className="flex justify-end">
              <button 
                onClick={() => {
                  setSelectedItem(interview);
                  setModalType('exit_interview');
                  setShowModal(true);
                }}
                className="px-3 py-1.5 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-xs font-medium flex items-center gap-1.5"
              >
                <Eye size={14} />
                {interview.status === 'PENDING' ? 'Complete Interview' : 'View Details'}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // Contracts Section
  const ContractsSection = () => (
    <div className="space-y-3">
      {contractRenewals.length === 0 ? (
        <div className="text-center py-8 text-almet-waterloo dark:text-almet-bali-hai text-sm">
          No contract renewals found
        </div>
      ) : (
        contractRenewals.map(contract => (
          <div key={contract.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-2">
                <div className="p-2 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <RefreshCw className="text-green-600" size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-gray-200">
                    {contract.employee_name}
                  </h3>
                  <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                    {contract.employee_id} • {contract.position}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={contract.status} />
                <UrgencyBadge days={contract.days_until_expiry} />
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 mb-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
              <InfoItem label="Current Contract" value={contract.current_contract_type} />
              <InfoItem label="Expires" value={resignationExitService.helpers.formatDate(contract.current_contract_end_date)} />
              <InfoItem label="Department" value={contract.department} />
              <InfoItem label="Manager" value={contract.manager_name} />
            </div>

            <div className="flex justify-end">
              <button 
                onClick={() => {
                  setSelectedItem(contract);
                  setModalType('contract_renewal');
                  setShowModal(true);
                }}
                className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-medium flex items-center gap-1.5"
              >
                <Eye size={14} />
                {contract.status === 'PENDING_MANAGER' ? 'Make Decision' : 'View Details'}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  // Probations Section
  const ProbationsSection = () => (
    <div className="space-y-3">
      {probationReviews.length === 0 ? (
        <div className="text-center py-8 text-almet-waterloo dark:text-almet-bali-hai text-sm">
          No probation reviews found
        </div>
      ) : (
        probationReviews.map(review => (
          <div key={review.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-2">
                <div className="p-2 bg-almet-mystic dark:bg-almet-cloud-burst/30 rounded-lg">
                  <UserCheck className="text-almet-sapphire" size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-gray-200">
                    {review.employee_name}
                  </h3>
                  <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                    {review.employee_id} • {review.position}
                  </p>
                </div>
              </div>
              <StatusBadge status={review.status} />
            </div>

            <div className="grid grid-cols-4 gap-2 mb-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded">
              <InfoItem label="Review Period" value={review.review_period?.replace('_', ' ')} />
              <InfoItem label="Due Date" value={resignationExitService.helpers.formatDate(review.due_date)} />
              <InfoItem label="Department" value={review.department} />
              <InfoItem label="Completed" value={review.completed_at ? resignationExitService.helpers.formatDate(review.completed_at) : '-'} />
            </div>

            <div className="flex justify-end gap-2">
              {review.status === 'PENDING' && userRole === 'employee' && (
                <button 
                  onClick={() => {
                    setSelectedItem(review);
                    setRespondentType('EMPLOYEE');
                    setModalType('probation_review');
                    setShowModal(true);
                  }}
                  className="px-3 py-1.5 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-xs font-medium flex items-center gap-1.5"
                >
                  <Eye size={14} />
                  Complete Self Assessment
                </button>
              )}
              {review.status === 'PENDING' && (userRole === 'manager' || userRole === 'admin') && (
                <button 
                  onClick={() => {
                    setSelectedItem(review);
                    setRespondentType('MANAGER');
                    setModalType('probation_review');
                    setShowModal(true);
                  }}
                  className="px-3 py-1.5 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-xs font-medium flex items-center gap-1.5"
                >
                  <Eye size={14} />
                  Complete Manager Evaluation
                </button>
              )}
              <button 
                onClick={() => {
                  setSelectedItem(review);
                  setModalType('probation_view');
                  setShowModal(true);
                }}
                className="px-3 py-1.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-xs font-medium flex items-center gap-1.5"
              >
                <Eye size={14} />
                View Details
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-almet-sapphire mx-auto mb-4"></div>
            <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral rounded-lg p-5 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white bg-opacity-20 rounded-lg">
                <FileText size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold">Resignation & Exit Management</h1>
                <p className="text-blue-100 text-xs">
                  {userRole === 'admin' ? 'HR Admin Dashboard' : 
                   userRole === 'manager' ? 'Manager Dashboard' : 
                   'Employee Dashboard'}
                </p>
              </div>
            </div>
            
            {/* Quick Action Buttons in Header */}
            <div className="flex gap-2">
              {userRole === 'employee' && (
                <button
                  onClick={() => {
                    setModalType('submit_resignation');
                    setShowModal(true);
                  }}
                  className="px-4 py-2 bg-white text-almet-sapphire rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium flex items-center gap-2"
                >
                  <FileText size={16} />
                  Submit Resignation
                </button>
              )}
              
              {userRole === 'admin' && (
                <>
                  <button
                    onClick={() => {
                      setModalType('create_exit_interview');
                      setShowModal(true);
                    }}
                    className="px-4 py-2 bg-white text-almet-sapphire rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <Plus size={16} />
                    Create Exit Interview
                  </button>
                  <button
                    onClick={() => window.location.href = '/question-management'}
                    className="px-4 py-2 bg-white text-almet-sapphire rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <Settings size={16} />
                    Manage Questions
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            <TabButton
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
              icon={Building}
              label="Overview"
            />
            <TabButton
              active={activeTab === 'resignations'}
              onClick={() => setActiveTab('resignations')}
              icon={FileText}
              label="Resignations"
              count={resignations.length}
            />
            <TabButton
              active={activeTab === 'exit_interviews'}
              onClick={() => setActiveTab('exit_interviews')}
              icon={LogOut}
              label="Exit Interviews"
              count={exitInterviews.length}
            />
            <TabButton
              active={activeTab === 'contracts'}
              onClick={() => setActiveTab('contracts')}
              icon={RefreshCw}
              label="Contracts"
              count={contractRenewals.length}
              show={userRole !== 'employee'}
            />
            <TabButton
              active={activeTab === 'probations'}
              onClick={() => setActiveTab('probations')}
              icon={UserCheck}
              label="Probations"
              count={probationReviews.length}
              show={userRole !== 'employee'}
            />
          </div>

          <div className="p-5">
            {activeTab === 'overview' && <OverviewSection />}
            {activeTab === 'resignations' && <ResignationsSection />}
            {activeTab === 'exit_interviews' && <ExitInterviewsSection />}
            {activeTab === 'contracts' && userRole !== 'employee' && <ContractsSection />}
            {activeTab === 'probations' && userRole !== 'employee' && <ProbationsSection />}
          </div>
        </div>

        {/* Modals */}
        {showModal && (
          <>
            {/* Employee Submit Resignation */}
            {modalType === 'submit_resignation' && (
              <ResignationSubmissionModal
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
                currentEmployee={currentUser}
              />
            )}

            {/* View/Approve Resignation Details */}
            {modalType === 'resignation_detail' && selectedItem && (
              <ResignationDetailModal
                resignation={selectedItem}
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
                userRole={userRole}
              />
            )}

            {/* Complete/View Exit Interview */}
            {modalType === 'exit_interview' && selectedItem && (
              <ExitInterviewModal
                interview={selectedItem}
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
              />
            )}

            {/* Admin Create Exit Interview */}
            {modalType === 'create_exit_interview' && (
              <CreateExitInterviewModal
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
              />
            )}

            {/* Manager Contract Renewal Decision */}
            {modalType === 'contract_renewal' && selectedItem && (
              <ContractRenewalModal
                contract={selectedItem}
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
                userRole={userRole}
              />
            )}

            {/* Complete Probation Review */}
            {modalType === 'probation_review' && selectedItem && (
              <ProbationReviewModal
                review={selectedItem}
                onClose={handleModalClose}
                onSuccess={handleModalSuccess}
                respondentType={respondentType}
              />
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}