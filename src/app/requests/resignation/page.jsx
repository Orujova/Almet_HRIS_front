'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  FileText, LogOut, RefreshCw, UserCheck, Settings, Plus,
  Search, Calendar, TrendingUp, Clock, Eye, Trash2, AlertTriangle,
  CheckCircle2, XCircle, Building
} from 'lucide-react';
import resignationExitService from '@/services/resignationExitService';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// Modal Imports
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
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [respondentType, setRespondentType] = useState('EMPLOYEE');
  
  const [data, setData] = useState({
    resignations: [],
    exitInterviews: [],
    contractRenewals: [],
    probationReviews: []
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [deleteModal, setDeleteModal] = useState({ show: false, item: null, type: '' });

  useEffect(() => {
    loadUserAndData();
  }, []);

  const loadUserAndData = async () => {
    try {
      setLoading(true);
      
      const userInfo = await resignationExitService.getCurrentUser();
      const userProfile = await resignationExitService.getUser();
      
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
    } finally {
      setLoading(false);
    }
  };

  const determineUserRole = (userInfo) => {
    if (userInfo.is_admin || userInfo.role === 'admin' || userInfo.is_superuser) return 'admin';
    if (userInfo.has_direct_reports || userInfo.is_manager) return 'manager';
    return 'employee';
  };

  const loadDataForRole = async (role) => {
    try {
      if (role === 'admin' || role === 'manager') {
        const [resigs, exits, contracts, probations] = await Promise.all([
          resignationExitService.resignation.getResignations().catch(() => ({ results: [] })),
          resignationExitService.exitInterview.getExitInterviews().catch(() => ({ results: [] })),
          resignationExitService.contractRenewal.getContractRenewals().catch(() => ({ results: [] })),
          resignationExitService.probationReview.getProbationReviews().catch(() => ({ results: [] }))
        ]);
        
        setData({
          resignations: resigs.results || [],
          exitInterviews: exits.results || [],
          contractRenewals: contracts.results || [],
          probationReviews: probations.results || []
        });
      } else {
        const [resigs, exits] = await Promise.all([
          resignationExitService.resignation.getResignations().catch(() => ({ results: [] })),
          resignationExitService.exitInterview.getExitInterviews().catch(() => ({ results: [] }))
        ]);
        
        setData({
          resignations: resigs.results || [],
          exitInterviews: exits.results || [],
          contractRenewals: [],
          probationReviews: []
        });
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleDelete = async () => {
    const { item, type } = deleteModal;
    try {
      switch (type) {
        case 'resignation':
          await resignationExitService.resignation.deleteResignation(item.id);
          break;
        case 'exit':
          await resignationExitService.exitInterview.deleteExitInterview(item.id);
          break;
        case 'contract':
          await resignationExitService.contractRenewal.deleteContractRenewal(item.id);
          break;
        case 'probation':
          await resignationExitService.probationReview.deleteProbationReview(item.id);
          break;
      }
      await loadDataForRole(userRole);
      setDeleteModal({ show: false, item: null, type: '' });
    } catch (error) {
      console.error('Error deleting:', error);
      alert('Failed to delete. Please try again.');
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

  // Tab Configuration
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: TrendingUp, roles: ['employee', 'manager', 'admin'] },
    { id: 'resignations', label: 'Resignations', icon: FileText, count: data.resignations.length, roles: ['employee', 'manager', 'admin'] },
    { id: 'exit-interviews', label: 'Exit Interviews', icon: LogOut, count: data.exitInterviews.length, roles: ['employee', 'manager', 'admin'] },
    { id: 'contracts', label: 'Contracts', icon: RefreshCw, count: data.contractRenewals.length, roles: ['manager', 'admin'] },
    { id: 'probation', label: 'Probation', icon: UserCheck, count: data.probationReviews.length, roles: ['manager', 'admin'] }
  ];

  const visibleTabs = tabs.filter(tab => tab.roles.includes(userRole));

  // Components
  const StatsCard = ({ icon: Icon, title, value, color, onClick }) => (
    <button 
      onClick={onClick}
      className={`${color} rounded-lg p-3 text-white shadow-sm hover:shadow-md transition-all text-left w-full`}
    >
      <div className="flex items-center justify-between mb-2">
        <Icon size={18} />
        <span className="text-xl font-bold">{value}</span>
      </div>
      <p className="text-[10px] font-medium opacity-90">{title}</p>
    </button>
  );

  const StatusBadge = ({ status }) => (
    <span className={`px-2 py-0.5 rounded text-[10px] font-medium border ${resignationExitService.helpers.getStatusColor(status)}`}>
      {resignationExitService.helpers.getStatusText(status)}
    </span>
  );

  const ListItem = ({ item, type, onView, onDelete }) => {
    const icons = { resignation: FileText, exit: LogOut, contract: RefreshCw, probation: UserCheck };
    const Icon = icons[type];

    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:shadow-sm transition-all">
        <div className="flex items-start gap-2">
          <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
            <Icon size={14} className="text-gray-600 dark:text-gray-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100">{item.employee_name}</h4>
                <p className="text-[10px] text-gray-500 dark:text-gray-400">{item.employee_id} • {item.position}</p>
              </div>
              <StatusBadge status={item.status} />
            </div>
            <div className="flex items-center gap-3 text-[10px] text-gray-500 dark:text-gray-400 mb-2">
              <span>{item.department}</span>
              {item.last_working_day && <span>Last: {resignationExitService.helpers.formatDate(item.last_working_day)}</span>}
              {item.days_remaining !== undefined && (
                <span className={`font-medium ${item.days_remaining <= 7 ? 'text-rose-600' : item.days_remaining <= 14 ? 'text-amber-600' : ''}`}>
                  {item.days_remaining}d
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => onView(item)}
                className="flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-[10px] font-medium hover:bg-blue-100 transition-colors"
              >
                <Eye size={11} />
                View
              </button>
              {userRole === 'admin' && (
                <button 
                  onClick={() => onDelete(item)}
                  className="flex items-center gap-1 px-2 py-1 bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 rounded text-[10px] font-medium hover:bg-rose-100 transition-colors"
                >
                  <Trash2 size={11} />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Views
  const DashboardView = () => {
    const pendingResignations = data.resignations.filter(r => ['PENDING_MANAGER', 'PENDING_HR'].includes(r.status));
    const pendingExits = data.exitInterviews.filter(e => e.status === 'PENDING');
    const urgentContracts = data.contractRenewals.filter(c => c.days_until_expiry <= 14);
    const pendingReviews = data.probationReviews.filter(p => p.status === 'PENDING');

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <StatsCard icon={FileText} title="Resignations" value={pendingResignations.length} color="bg-gradient-to-br from-rose-500 to-rose-600" onClick={() => setActiveTab('resignations')} />
          <StatsCard icon={LogOut} title="Exit Interviews" value={pendingExits.length} color="bg-gradient-to-br from-blue-500 to-blue-600" onClick={() => setActiveTab('exit-interviews')} />
          <StatsCard icon={RefreshCw} title="Contracts" value={urgentContracts.length} color="bg-gradient-to-br from-emerald-500 to-emerald-600" onClick={() => setActiveTab('contracts')} />
          <StatsCard icon={UserCheck} title="Probation" value={pendingReviews.length} color="bg-gradient-to-br from-amber-500 to-amber-600" onClick={() => setActiveTab('probation')} />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
          <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {userRole === 'employee' || userRole === 'admin' && (
              <button 
                onClick={() => { setModalType('submit_resignation'); setShowModal(true); }}
                className="flex items-center gap-2 p-2 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg hover:bg-rose-100 transition-colors"
              >
                <Plus size={14} className="text-rose-600" />
                <span className="text-[10px] font-medium text-gray-900 dark:text-gray-100">Submit Resignation</span>
              </button>
            )}
            {userRole === 'admin' && (
              <>
                <button 
                  onClick={() => { setModalType('create_exit_interview'); setShowModal(true); }}
                  className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Plus size={14} className="text-blue-600" />
                  <span className="text-[10px] font-medium text-gray-900">Exit Interview</span>
                </button>
                <button 
                  onClick={() => window.location.href = 'question-management'}
                  className="flex items-center gap-2 p-2 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <Settings size={14} className="text-purple-600" />
                  <span className="text-[10px] font-medium text-gray-900">Questions</span>
                </button>
                <button 
                  onClick={() => window.location.href = 'probation-tracking'}
                  className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                >
                  <Clock size={14} className="text-amber-600" />
                  <span className="text-[10px] font-medium text-gray-900">Tracking</span>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3">
          <h3 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2">Recent Activity</h3>
          <div className="space-y-2">
            {data.resignations.slice(0, 3).map(item => (
              <div key={item.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded transition-colors">
                <div className="p-1.5 bg-rose-50 dark:bg-rose-900/30 rounded">
                  <FileText size={12} className="text-rose-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-medium text-gray-900 dark:text-gray-100 truncate">{item.employee_name}</p>
                  <p className="text-[9px] text-gray-500">{resignationExitService.helpers.formatDate(item.submission_date)}</p>
                </div>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const ListView = ({ items, type, emptyMessage }) => {
    const filtered = items.filter(item => {
      const matchesSearch = item.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    return (
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="w-full pl-8 pr-2 py-1.5 text-[10px] border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2 py-1.5 text-[10px] border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="all">All</option>
            <option value="PENDING_MANAGER">Pending Manager</option>
            <option value="PENDING_HR">Pending HR</option>
            <option value="APPROVED">Approved</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-[10px]">{emptyMessage}</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(item => (
              <ListItem 
                key={item.id} 
                item={item} 
                type={type}
                onView={(item) => {
                  setSelectedItem(item);
                  setModalType(type === 'resignation' ? 'resignation_detail' : type === 'exit' ? 'exit_interview' : type === 'contract' ? 'contract_renewal' : 'probation_review');
                  setShowModal(true);
                }}
                onDelete={(item) => setDeleteModal({ show: true, item, type })}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <LoadingSpinner message="Loading Resignation & Exit Management..." />;

  return (
    <DashboardLayout>
      <div className="space-y-3">
        <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral rounded-lg p-4 text-white shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building size={20} />
              <div>
                <h1 className="text-base font-bold">Resignation & Exit Management</h1>
               
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {visibleTabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 text-[10px] font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-almet-sapphire text-almet-sapphire bg-almet-mystic dark:bg-almet-cloud-burst/20'
                      : 'border-transparent text-gray-600 dark:text-gray-400'
                  }`}
                >
                  <Icon size={12} />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`px-1 py-0.5 rounded-full text-[9px] font-bold ${
                      activeTab === tab.id ? 'bg-almet-sapphire text-white' : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-3">
            {activeTab === 'dashboard' && <DashboardView />}
            {activeTab === 'resignations' && <ListView items={data.resignations} type="resignation" emptyMessage="No resignations found" />}
            {activeTab === 'exit-interviews' && <ListView items={data.exitInterviews} type="exit" emptyMessage="No exit interviews found" />}
            {activeTab === 'contracts' && <ListView items={data.contractRenewals} type="contract" emptyMessage="No contract renewals found" />}
            {activeTab === 'probation' && <ListView items={data.probationReviews} type="probation" emptyMessage="No probation reviews found" />}
          </div>
        </div>

        {/* Modals */}
        {showModal && (
          <>
            {modalType === 'submit_resignation' && (
              <ResignationSubmissionModal onClose={handleModalClose} onSuccess={handleModalSuccess} currentEmployee={currentUser} />
            )}
            {modalType === 'resignation_detail' && selectedItem && (
              <ResignationDetailModal resignation={selectedItem} onClose={handleModalClose} onSuccess={handleModalSuccess} userRole={userRole} />
            )}
            {modalType === 'exit_interview' && selectedItem && (
              <ExitInterviewModal interview={selectedItem} onClose={handleModalClose} onSuccess={handleModalSuccess} />
            )}
            {modalType === 'create_exit_interview' && (
              <CreateExitInterviewModal onClose={handleModalClose} onSuccess={handleModalSuccess} />
            )}
            {modalType === 'contract_renewal' && selectedItem && (
              <ContractRenewalModal contract={selectedItem} onClose={handleModalClose} onSuccess={handleModalSuccess} userRole={userRole} />
            )}
            {modalType === 'probation_review' && selectedItem && (
              <ProbationReviewModal review={selectedItem} onClose={handleModalClose} onSuccess={handleModalSuccess} respondentType={respondentType} />
            )}
          </>
        )}

        {/* Delete Confirmation */}
        <ConfirmationModal
          isOpen={deleteModal.show}
          onClose={() => setDeleteModal({ show: false, item: null, type: '' })}
          onConfirm={handleDelete}
          title="Delete Item"
          message={`Are you sure you want to delete this ${deleteModal.type}? This action cannot be undone.`}
          confirmText="Delete"
          type="danger"
        />
      </div>
    </DashboardLayout>
  );
}