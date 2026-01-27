'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  FileText, LogOut, RefreshCw, UserCheck, Settings, Plus,
  Search, TrendingUp, Clock, Eye, Trash2, Building2, Calendar, ArrowLeft, User, Briefcase
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
import ViewExitInterviewModal from '@/components/resignation/ViewExitInterviewModal';

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
      setUserRole(userInfo);
      await loadDataForRole(userInfo);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDataForRole = async (role) => {
    try {
      if (role.is_admin || role.is_manager) {
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
      className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-sm hover:border-almet-sapphire dark:hover:border-almet-sapphire transition-all text-left w-full"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
        <div className={`p-3 ${color} rounded-lg`}>
          <Icon size={20} />
        </div>
      </div>
    </button>
  );

  const StatusBadge = ({ status }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${resignationExitService.helpers.getStatusColor(status)}`}>
      {resignationExitService.helpers.getStatusText(status)}
    </span>
  );

  const ListItem = ({ item, type, onView, onDelete }) => {
    const icons = { 
      resignation: FileText, 
      exit: LogOut, 
      contract: RefreshCw, 
      probation: UserCheck 
    };
    const Icon = icons[type];

    return (
      <button
        onClick={() => onView(item)}
        className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-sm hover:border-almet-sapphire dark:hover:border-almet-sapphire transition-all text-left"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-almet-mystic dark:bg-almet-cloud-burst/20 rounded-lg">
            <Icon size={16} className="text-almet-sapphire" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{item.employee_name}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  {item.employee_id} • {item.position}
                </p>
              </div>
              <StatusBadge status={item.status} />
            </div>
            
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mb-3">
              <div className="flex items-center gap-1">
                <Building2 size={12} />
                <span>{item.department}</span>
              </div>
              {item.last_working_day && (
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{resignationExitService.helpers.formatDate(item.last_working_day)}</span>
                </div>
              )}
              {item.days_remaining !== undefined && (
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span className={`font-medium ${
                    item.days_remaining <= 7 ? 'text-red-600 dark:text-red-400' : 
                    item.days_remaining <= 14 ? 'text-amber-600 dark:text-amber-400' : ''
                  }`}>
                    {item.days_remaining}d remaining
                  </span>
                </div>
              )}
            </div>
            
            {userRole.is_admin && (
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(item); }}
                className="flex items-center gap-1 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
              >
                <Trash2 size={12} />
                Delete
              </button>
            )}
          </div>
        </div>
      </button>
    );
  };

  // Views
  const DashboardView = () => {
    const pendingResignations = data.resignations.filter(r => ['PENDING_MANAGER', 'PENDING_HR'].includes(r.status));
    const pendingExits = data.exitInterviews.filter(e => e.status === 'PENDING');
    const urgentContracts = data.contractRenewals.filter(c => c.days_until_expiry <= 14);
    const pendingReviews = data.probationReviews.filter(p => p.status === 'PENDING');

    return (
      <div className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatsCard 
            icon={FileText} 
            title="Pending Resignations" 
            value={pendingResignations.length} 
            color="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
            onClick={() => setActiveTab('resignations')} 
          />
          <StatsCard 
            icon={LogOut} 
            title="Exit Interviews" 
            value={pendingExits.length} 
            color="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
            onClick={() => setActiveTab('exit-interviews')} 
          />
          <StatsCard 
            icon={RefreshCw} 
            title="Contract Renewals" 
            value={urgentContracts.length} 
            color="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
            onClick={() => setActiveTab('contracts')} 
          />
          <StatsCard 
            icon={UserCheck} 
            title="Probation Reviews" 
            value={pendingReviews.length} 
            color="bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
            onClick={() => setActiveTab('probation')} 
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <button 
              onClick={() => { setModalType('submit_resignation'); setShowModal(true); }}
              className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              <Plus size={16} className="text-red-600 dark:text-red-400" />
              <span className="text-xs font-medium text-gray-900 dark:text-white">Submit Resignation</span>
            </button>

            {userRole.is_admin && (
              <>
                <button 
                  onClick={() => { setModalType('create_exit_interview'); setShowModal(true); }}
                  className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                  <Plus size={16} className="text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-medium text-gray-900 dark:text-white">Exit Interview</span>
                </button>
                <button 
                  onClick={() => window.location.href = 'question-management'}
                  className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                >
                  <Settings size={16} className="text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-medium text-gray-900 dark:text-white">Questions</span>
                </button>
                <button 
                  onClick={() => window.location.href = 'probation-tracking'}
                  className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                >
                  <Clock size={16} className="text-amber-600 dark:text-amber-400" />
                  <span className="text-xs font-medium text-gray-900 dark:text-white">Tracking</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Recent Activity</h3>
          <div className="space-y-2">
            {data.resignations.slice(0, 5).map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setSelectedItem(item);
                  setModalType('resignation_detail');
                  setShowModal(true);
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors text-left"
              >
                <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
                  <FileText size={14} className="text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{item.employee_name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{resignationExitService.helpers.formatDate(item.submission_date)}</p>
                </div>
                <StatusBadge status={item.status} />
              </button>
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
      <div className="space-y-3">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or employee ID..."
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="PENDING_MANAGER">Pending Manager</option>
            <option value="PENDING_HR">Pending HR</option>
            <option value="APPROVED">Approved</option>
          </select>
        </div>

        {/* List */}
        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <FileText size={48} className="mx-auto text-gray-400 mb-3" />
            <p className="text-sm text-gray-600 dark:text-gray-400">{emptyMessage}</p>
          </div>
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
      <div className="space-y-4">
        {/* Breadcrumb - only show when not on dashboard */}
        {activeTab !== 'dashboard' && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="hover:text-almet-sapphire transition-colors"
            >
              Dashboard
            </button>
            <span>/</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {tabs.find(t => t.id === activeTab)?.label}
            </span>
          </div>
        )}

        {/* Header */}
        <div className="bg-gradient-to-r from-almet-sapphire to-almet-astral rounded-lg p-4 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Resignation & Exit Management</h1>
              <p className="text-blue-100 text-xs mt-0.5">Manage employee resignations, exits, and transitions</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
            {visibleTabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-almet-sapphire text-almet-sapphire bg-almet-mystic dark:bg-almet-cloud-burst/20'
                      : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                  {tab.count !== undefined && (
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                      activeTab === tab.id 
                        ? 'bg-almet-sapphire text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="p-4">
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
              selectedItem.status === 'COMPLETED' ? (
                <ViewExitInterviewModal interview={selectedItem} onClose={handleModalClose} />
              ) : (
                <ExitInterviewModal interview={selectedItem} onClose={handleModalClose} onSuccess={handleModalSuccess} />
              )
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