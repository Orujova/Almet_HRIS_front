// Updated app/(dashboard)/resignation-exit/page.jsx
'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { 
  FileText, LogOut, Plus, Search, Clock, Eye, Trash2, 
  Building2, Calendar, ArrowLeft, ChevronRight, Home, Settings,
  RefreshCw, UserCheck, TrendingUp
} from 'lucide-react';
import resignationExitService from '@/services/resignationExitService';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

// Modal Imports
import ResignationSubmissionModal from '@/components/resignation/ResignationSubmissionModal';
import ResignationDetailModal from '@/components/resignation/ResignationDetailModal';
import ExitInterviewModal from '@/components/resignation/ExitInterviewModal';
import CreateExitInterviewModal from '@/components/resignation/CreateExitInterviewModal';
import ViewExitInterviewModal from '@/components/resignation/ViewExitInterviewModal';

export default function ResignationExitManagement() {
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('employee');
  
  const [currentView, setCurrentView] = useState('home');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  
  const [data, setData] = useState({
    resignations: [],
    exitInterviews: []
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
      const [resigs, exits] = await Promise.all([
        resignationExitService.resignation.getResignations().catch(() => ({ results: [] })),
        resignationExitService.exitInterview.getExitInterviews().catch(() => ({ results: [] }))
      ]);
      
      setData({
        resignations: resigs.results || [],
        exitInterviews: exits.results || []
      });
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

  const navigateToView = (view, item = null) => {
    setCurrentView(view);
    if (item) setSelectedItem(item);
    setSearchTerm('');
    setFilterStatus('all');
  };

  const navigateToHome = () => {
    setCurrentView('home');
    setSelectedItem(null);
  };

  const openDetailModal = (item, type) => {
    setSelectedItem(item);
    setModalType(type);
    setShowModal(true);
  };

  const Breadcrumb = ({ path }) => (
    <div className="flex items-center gap-2 text-sm mb-4">
      <button 
        onClick={navigateToHome}
        className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-almet-sapphire transition-colors"
      >
        <Home size={16} />
        <span>Home</span>
      </button>
      {path.map((item, idx) => (
        <React.Fragment key={idx}>
          <ChevronRight size={14} className="text-gray-400" />
          <span className={idx === path.length - 1 ? "text-gray-900 dark:text-white font-medium" : "text-gray-600 dark:text-gray-400"}>
            {item}
          </span>
        </React.Fragment>
      ))}
    </div>
  );

  const StatusBadge = ({ status }) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${resignationExitService.helpers.getStatusColor(status)}`}>
      {resignationExitService.helpers.getStatusText(status)}
    </span>
  );

  const ActionCard = ({ icon: Icon, title, description, count, color, onClick }) => (
    <button
      onClick={onClick}
      className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-gray-200 dark:border-gray-700 hover:border-almet-sapphire dark:hover:border-almet-sapphire hover:shadow-lg transition-all text-left group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 ${color} rounded-xl group-hover:scale-110 transition-transform`}>
          <Icon size={24} />
        </div>
        {count !== undefined && (
          <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-full text-sm font-bold">
            {count}
          </span>
        )}
      </div>
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
      <div className="flex items-center gap-1 text-almet-sapphire mt-3 text-sm font-medium">
        <span>View details</span>
        <ChevronRight size={16} />
      </div>
    </button>
  );

  const ListItem = ({ item, type, onView, onDelete }) => {
    const icons = { 
      resignation: FileText, 
      exit: LogOut
    };
    const Icon = icons[type];

    return (
      <button
        onClick={() => onView(item)}
        className="w-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md hover:border-almet-sapphire dark:hover:border-almet-sapphire transition-all text-left group"
      >
        <div className="flex items-start gap-3">
          <div className="p-3 bg-almet-mystic dark:bg-almet-cloud-burst/20 rounded-lg group-hover:bg-almet-sapphire group-hover:text-white transition-colors">
            <Icon size={18} className="text-almet-sapphire group-hover:text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">{item.employee_name}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
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
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-almet-sapphire text-xs font-medium">
                <span>View details</span>
                <ChevronRight size={14} />
              </div>
              {userRole.is_admin && (
                <button 
                  onClick={(e) => { e.stopPropagation(); onDelete(item); }}
                  className="ml-auto flex items-center gap-1 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-medium hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <Trash2 size={12} />
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      </button>
    );
  };

  const HomeView = () => {
    const pendingResignations = data.resignations.filter(r => ['PENDING_MANAGER', 'PENDING_HR'].includes(r.status));
    const pendingExits = data.exitInterviews.filter(e => e.status === 'PENDING');

    return (
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="bg-gradient-to-br from-almet-sapphire via-almet-astral to-almet-steel-blue rounded-xl p-6 text-white">
          <h2 className="text-xl font-bold mb-2">Employee Offboarding</h2>
          <p className="text-blue-100 text-sm">
            Manage resignations and exit interviews
          </p>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Plus size={18} className="text-almet-sapphire" />
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button 
              onClick={() => { setModalType('submit_resignation'); setShowModal(true); }}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-red-500 dark:hover:border-red-500 hover:shadow-lg transition-all group"
            >
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg mb-3 group-hover:bg-red-500 group-hover:text-white transition-colors inline-flex">
                <Plus size={20} className="text-red-600 dark:text-red-400 group-hover:text-white" />
              </div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Submit Resignation</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Start resignation process</p>
            </button>

            {userRole.is_admin && (
              <>
                <button 
                  onClick={() => { setModalType('create_exit_interview'); setShowModal(true); }}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all group"
                >
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg mb-3 group-hover:bg-blue-500 group-hover:text-white transition-colors inline-flex">
                    <Plus size={20} className="text-blue-600 dark:text-blue-400 group-hover:text-white" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Create Exit Interview</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Schedule new interview</p>
                </button>

                <button 
                  onClick={() => window.location.href = 'question-management/'}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 hover:shadow-lg transition-all group"
                >
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg mb-3 group-hover:bg-purple-500 group-hover:text-white transition-colors inline-flex">
                    <TrendingUp size={20} className="text-purple-600 dark:text-purple-400 group-hover:text-white" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Manage Questions</h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Configure interview questions</p>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Main Categories */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Categories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ActionCard
              icon={FileText}
              title="Resignations"
              description="View and manage employee resignations and approvals"
              count={pendingResignations.length}
              color="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
              onClick={() => navigateToView('resignations')}
            />
            <ActionCard
              icon={LogOut}
              title="Exit Interviews"
              description="Conduct and review exit interview responses"
              count={pendingExits.length}
              color="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
              onClick={() => navigateToView('exits')}
            />
          </div>
        </div>
      </div>
    );
  };

  const ListView = ({ items, type, title, icon: Icon }) => {
    const filtered = items.filter(item => {
      const matchesSearch = item.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           item.employee_id?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    return (
      <div className="space-y-4">
        <Breadcrumb path={[title]} />

        <div className="bg-gradient-to-br from-almet-sapphire to-almet-astral rounded-xl p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Icon size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold">{title}</h2>
              <p className="text-blue-100 text-sm mt-1">
                {filtered.length} {filtered.length === 1 ? 'item' : 'items'} found
              </p>
            </div>
          </div>
          <button
            onClick={navigateToHome}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back to Home
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or employee ID..."
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-almet-sapphire focus:border-transparent min-w-[200px]"
            >
              <option value="all">All Status</option>
              <option value="PENDING_MANAGER">Pending Manager</option>
              <option value="PENDING_HR">Pending HR</option>
              <option value="APPROVED">Approved</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <Icon size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No items found</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              {searchTerm || filterStatus !== 'all' ? 'Try adjusting your filters' : 'No data available'}
            </p>
            <button
              onClick={navigateToHome}
              className="px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-sm font-medium"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(item => (
              <ListItem 
                key={item.id} 
                item={item} 
                type={type}
                onView={(item) => openDetailModal(item, type === 'resignation' ? 'resignation_detail' : 'exit_interview')}
                onDelete={(item) => setDeleteModal({ show: true, item, type })}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) return <LoadingSpinner message="Loading Employee Offboarding System..." />;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {currentView === 'home' && <HomeView />}
        {currentView === 'resignations' && <ListView items={data.resignations} type="resignation" title="Resignations" icon={FileText} />}
        {currentView === 'exits' && <ListView items={data.exitInterviews} type="exit" title="Exit Interviews" icon={LogOut} />}

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
          </>
        )}

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