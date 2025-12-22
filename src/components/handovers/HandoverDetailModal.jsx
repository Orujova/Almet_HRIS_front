// components/handovers/HandoverDetailModal.jsx - COMPLETE WITH ADMIN ACCESS
'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, CheckCircle, XCircle, AlertCircle, Clock, 
  FileText, Users, Calendar, Key, Folder, 
  AlertTriangle, MessageSquare, History, Download,
  Loader, ChevronDown, ChevronUp,
  Send, RefreshCw, Eye, Share2, Printer, Edit, Shield
} from 'lucide-react';
import handoverService from '@/services/handoverService';
import { useToast } from '@/components/common/Toast';
import ConfirmationModal from '@/components/common/ConfirmationModal';

const HandoverDetailModal = ({ handover: initialHandover, onClose, onUpdate, currentUser }) => {
  const [handover, setHandover] = useState(initialHandover);
  const [activeSection, setActiveSection] = useState('overview');
  const [activityLog, setActivityLog] = useState([]);
  const [loadingLog, setLoadingLog] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationConfig, setConfirmationConfig] = useState({});
  const [actionType, setActionType] = useState('');
  const [actionComment, setActionComment] = useState('');
  const [expandedTasks, setExpandedTasks] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  
  // Task status update states
  const [editingTask, setEditingTask] = useState(null);
  const [taskStatus, setTaskStatus] = useState('');
  const [taskComment, setTaskComment] = useState('');
  const [taskLoading, setTaskLoading] = useState(false);

  const { showSuccess, showError, showInfo } = useToast();

  // ⭐ Determine user role - ADMIN CHECK FIRST
  const isAdmin = currentUser?.user?.is_staff || currentUser?.user?.is_superuser;
  const isHandingOver = handover.handing_over_employee === currentUser?.employee?.id;
  const isTakingOver = handover.taking_over_employee === currentUser?.employee?.id;
  const isLineManager = handover.line_manager === currentUser?.employee?.id;

  // Load activity log
  useEffect(() => {
    if (activeSection === 'activity') {
      loadActivityLog();
    }
  }, [activeSection]);

  const loadActivityLog = async () => {
    setLoadingLog(true);
    try {
      const log = await handoverService.getActivityLog(handover.id);
      setActivityLog(log);
    } catch (error) {
      showError('Error loading activity log');
    } finally {
      setLoadingLog(false);
    }
  };

  // Refresh handover data
  const refreshHandover = async () => {
    setRefreshing(true);
    try {
      const updated = await handoverService.getHandoverDetail(handover.id);
      setHandover(updated);
      onUpdate();
      showSuccess('Data refreshed successfully');
    } catch (error) {
      showError('Error refreshing data');
    } finally {
      setRefreshing(false);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const statusConfig = {
      'CREATED': { 
        label: 'Created', 
        class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        icon: <FileText className="w-4 h-4" />
      },
      'SIGNED_BY_HANDING_OVER': { 
        label: 'Signed by HO', 
        class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        icon: <CheckCircle className="w-4 h-4" />
      },
      'SIGNED_BY_TAKING_OVER': { 
        label: 'Signed by TO', 
        class: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
        icon: <CheckCircle className="w-4 h-4" />
      },
      'APPROVED_BY_LINE_MANAGER': { 
        label: 'Approved by LM', 
        class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        icon: <CheckCircle className="w-4 h-4" />
      },
      'REJECTED': { 
        label: 'Rejected', 
        class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        icon: <XCircle className="w-4 h-4" />
      },
      'NEED_CLARIFICATION': { 
        label: 'Need Clarification', 
        class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: <AlertCircle className="w-4 h-4" />
      },
      'RESUBMITTED': { 
        label: 'Resubmitted', 
        class: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        icon: <FileText className="w-4 h-4" />
      },
      'TAKEN_OVER': { 
        label: 'Taken Over', 
        class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        icon: <CheckCircle className="w-4 h-4" />
      },
      'TAKEN_BACK': { 
        label: 'Taken Back', 
        class: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
        icon: <CheckCircle className="w-4 h-4" />
      },
    };

    const config = statusConfig[status] || { 
      label: status, 
      class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      icon: <Clock className="w-4 h-4" />
    };

    return (
      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium ${config.class}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  // Get task status badge
  const getTaskStatusBadge = (status) => {
    const config = {
      'NOT_STARTED': { label: 'Not Started', class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
      'IN_PROGRESS': { label: 'In Progress', class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
      'COMPLETED': { label: 'Completed', class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
      'CANCELED': { label: 'Canceled', class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
      'POSTPONED': { label: 'Postponed', class: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    };

    const statusInfo = config[status] || config['NOT_STARTED'];

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    );
  };

  // Task status options
  const taskStatusOptions = [
    { value: 'NOT_STARTED', label: 'Not Started' },
    { value: 'IN_PROGRESS', label: 'In Progress' },
    { value: 'COMPLETED', label: 'Completed' },
    { value: 'CANCELED', label: 'Canceled' },
    { value: 'POSTPONED', label: 'Postponed' },
  ];

  // Handle task status update
  const handleTaskStatusEdit = (task) => {
    setEditingTask(task.id);
    setTaskStatus(task.current_status);
    setTaskComment('');
  };

  const handleTaskStatusCancel = () => {
    setEditingTask(null);
    setTaskStatus('');
    setTaskComment('');
  };

  const handleTaskStatusSave = async (taskId) => {
    if (!taskStatus) {
      showError('Please select a status');
      return;
    }

    setTaskLoading(true);
    try {
      await handoverService.updateTaskStatus(taskId, taskStatus, taskComment);
      showSuccess('Task status updated successfully');
      setEditingTask(null);
      setTaskStatus('');
      setTaskComment('');
      await refreshHandover();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Error updating task status';
      showError(errorMessage);
    } finally {
      setTaskLoading(false);
    }
  };

  // Handle actions
  const handleAction = async (type) => {
    const configs = {
      'sign_ho': {
        title: 'Sign Handover',
        message: 'Are you sure you want to sign this handover as Handing Over employee?',
        type: 'info',
        confirmText: 'Sign',
        requiresComment: false
      },
      'sign_to': {
        title: 'Sign Handover',
        message: 'Are you sure you want to sign this handover as Taking Over employee?',
        type: 'info',
        confirmText: 'Sign',
        requiresComment: false
      },
      'approve': {
        title: 'Approve Handover',
        message: 'Are you sure you want to approve this handover?',
        type: 'success',
        confirmText: 'Approve',
        requiresComment: false
      },
      'reject': {
        title: 'Reject Handover',
        message: 'Please provide a reason for rejection:',
        type: 'danger',
        confirmText: 'Reject',
        requiresComment: true
      },
      'clarify': {
        title: 'Request Clarification',
        message: 'Please provide clarification request:',
        type: 'warning',
        confirmText: 'Request',
        requiresComment: true
      },
      'resubmit': {
        title: 'Resubmit Handover',
        message: 'Please provide your response to the clarification:',
        type: 'info',
        confirmText: 'Resubmit',
        requiresComment: true
      },
      'takeover': {
        title: 'Take Over',
        message: 'Are you sure you want to take over these responsibilities?',
        type: 'success',
        confirmText: 'Take Over',
        requiresComment: false
      },
      'takeback': {
        title: 'Take Back',
        message: 'Are you sure you want to take back these responsibilities?',
        type: 'info',
        confirmText: 'Take Back',
        requiresComment: false
      }
    };

    const config = configs[type];
    setActionType(type);
    setActionComment('');
    setConfirmationConfig(config);
    
    if (config.requiresComment) {
      setShowActionModal(true);
    } else {
      setShowConfirmation(true);
    }
  };

  // Execute action
  const executeAction = async () => {
    if ((actionType === 'reject' || actionType === 'clarify' || actionType === 'resubmit') && !actionComment.trim()) {
      showError('Comment is required for this action');
      return;
    }

    setActionLoading(true);
    try {
      let result;
      switch (actionType) {
        case 'sign_ho':
          result = await handoverService.signAsHandingOver(handover.id, actionComment);
          break;
        case 'sign_to':
          result = await handoverService.signAsTakingOver(handover.id, actionComment);
          break;
        case 'approve':
          result = await handoverService.approveAsLineManager(handover.id, actionComment);
          break;
        case 'reject':
          result = await handoverService.rejectAsLineManager(handover.id, actionComment);
          break;
        case 'clarify':
          result = await handoverService.requestClarification(handover.id, actionComment);
          break;
        case 'resubmit':
          result = await handoverService.resubmit(handover.id, actionComment);
          break;
        case 'takeover':
          result = await handoverService.takeover(handover.id, actionComment);
          break;
        case 'takeback':
          result = await handoverService.takeback(handover.id, actionComment);
          break;
      }

      showSuccess(result.message || 'Action completed successfully');
      setShowActionModal(false);
      setShowConfirmation(false);
      await refreshHandover();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Action failed';
      showError(errorMessage);
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle task details
  const toggleTask = (taskId) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // ⭐ NEW: Get available actions based on status and role
  const getAvailableActions = () => {
    const actions = [];

    // ⭐ ADMIN CAN DO ANYTHING AT ANY STATUS
    if (isAdmin) {
      // Sign HO (if not signed yet)
      if (!handover.ho_signed) {
        actions.push({
          key: 'sign_ho',
          label: 'Sign as HO',
          icon: Shield,
          className: 'bg-blue-600 hover:bg-blue-700',
          badge: 'Admin'
        });
      }

      // Sign TO (if HO signed but TO not signed)
      if (handover.ho_signed && !handover.to_signed) {
        actions.push({
          key: 'sign_to',
          label: 'Sign as TO',
          icon: Shield,
          className: 'bg-cyan-600 hover:bg-cyan-700',
          badge: 'Admin'
        });
      }

      // LM Actions (if both signed)
      if (handover.ho_signed && handover.to_signed && !handover.lm_approved) {
        if (handover.status === 'SIGNED_BY_TAKING_OVER' || handover.status === 'RESUBMITTED') {
          actions.push(
            {
              key: 'approve',
              label: 'Approve',
              icon: CheckCircle,
              className: 'bg-green-600 hover:bg-green-700',
              badge: 'Admin'
            },
            {
              key: 'reject',
              label: 'Reject',
              icon: XCircle,
              className: 'bg-red-600 hover:bg-red-700',
              badge: 'Admin'
            },
            {
              key: 'clarify',
              label: 'Request Clarification',
              icon: AlertCircle,
              className: 'bg-yellow-600 hover:bg-yellow-700',
              badge: 'Admin'
            }
          );
        }
      }

      // Resubmit (if need clarification)
      if (handover.status === 'NEED_CLARIFICATION') {
        actions.push({
          key: 'resubmit',
          label: 'Resubmit',
          icon: Send,
          className: 'bg-purple-600 hover:bg-purple-700',
          badge: 'Admin'
        });
      }

      // Takeover (if approved)
      if (handover.status === 'APPROVED_BY_LINE_MANAGER' && !handover.taken_over) {
        actions.push({
          key: 'takeover',
          label: 'Take Over',
          icon: CheckCircle,
          className: 'bg-green-600 hover:bg-green-700',
          badge: 'Admin'
        });
      }

      // Takeback (if taken over)
      if (handover.status === 'TAKEN_OVER' && !handover.taken_back) {
        actions.push({
          key: 'takeback',
          label: 'Take Back',
          icon: CheckCircle,
          className: 'bg-indigo-600 hover:bg-indigo-700',
          badge: 'Admin'
        });
      }

      return actions;
    }

    // ⭐ REGULAR USER ACTIONS (non-admin)
    // Sign HO
    if (isHandingOver && handover.status === 'CREATED' && !handover.ho_signed) {
      actions.push({
        key: 'sign_ho',
        label: 'Sign as Handing Over',
        icon: CheckCircle,
        className: 'bg-almet-sapphire hover:bg-almet-cloud-burst'
      });
    }

    // Sign TO
    if (isTakingOver && handover.status === 'SIGNED_BY_HANDING_OVER' && !handover.to_signed) {
      actions.push({
        key: 'sign_to',
        label: 'Sign as Taking Over',
        icon: CheckCircle,
        className: 'bg-cyan-600 hover:bg-cyan-700'
      });
    }

    // LM Actions
    if (isLineManager && (handover.status === 'SIGNED_BY_TAKING_OVER' || handover.status === 'RESUBMITTED') && !handover.lm_approved) {
      actions.push(
        {
          key: 'approve',
          label: 'Approve',
          icon: CheckCircle,
          className: 'bg-green-600 hover:bg-green-700'
        },
        {
          key: 'reject',
          label: 'Reject',
          icon: XCircle,
          className: 'bg-red-600 hover:bg-red-700'
        },
        {
          key: 'clarify',
          label: 'Request Clarification',
          icon: AlertCircle,
          className: 'bg-yellow-600 hover:bg-yellow-700'
        }
      );
    }

    // Resubmit
    if (isHandingOver && handover.status === 'NEED_CLARIFICATION') {
      actions.push({
        key: 'resubmit',
        label: 'Resubmit',
        icon: Send,
        className: 'bg-purple-600 hover:bg-purple-700'
      });
    }

    // Takeover
    if (isTakingOver && handover.status === 'APPROVED_BY_LINE_MANAGER' && !handover.taken_over) {
      actions.push({
        key: 'takeover',
        label: 'Take Over',
        icon: CheckCircle,
        className: 'bg-green-600 hover:bg-green-700'
      });
    }

    // Takeback
    if (isHandingOver && handover.status === 'TAKEN_OVER' && !handover.taken_back) {
      actions.push({
        key: 'takeback',
        label: 'Take Back',
        icon: CheckCircle,
        className: 'bg-indigo-600 hover:bg-indigo-700'
      });
    }

    return actions;
  };

  // ⭐ Render action buttons - SIMPLIFIED
  const renderActionButtons = () => {
    const availableActions = getAvailableActions();

    if (availableActions.length === 0) {
      return null;
    }

    return availableActions.map(action => {
      const Icon = action.icon;
      return (
        <button
          key={action.key}
          onClick={() => handleAction(action.key)}
          className={`inline-flex items-center gap-2 px-6 py-3 ${action.className} text-white rounded-lg transition-colors font-medium shadow-sm`}
        >
          <Icon className="w-5 h-5" />
          {action.label}
          {action.badge && (
            <span className="ml-1 px-2 py-0.5 bg-white/20 rounded text-xs font-bold">
              {action.badge}
            </span>
          )}
        </button>
      );
    });
  };

  // Section tabs
  const sections = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle },
    { id: 'details', label: 'Details', icon: Folder },
    { id: 'activity', label: 'Activity Log', icon: History }
  ];

  // ⭐ Can user edit task status? - ADMIN OR TAKING OVER
  const canEditTaskStatus = (isAdmin || isTakingOver) && !['REJECTED'].includes(handover.status);

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-almet-mystic dark:border-gray-700 px-6 py-4 z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-almet-cloud-burst dark:text-white">
                    Handover Details
                  </h2>
                  <span className="px-3 py-1 bg-almet-mystic dark:bg-almet-cloud-burst/20 text-almet-sapphire dark:text-almet-steel-blue rounded-lg text-sm font-medium">
                    #{handover.request_id}
                  </span>
                  {isAdmin && (
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-bold flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      ADMIN ACCESS
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {getStatusBadge(handover.status)}
                  <span className="text-sm text-almet-waterloo dark:text-gray-400">
                    {handover.handover_type_name}
                  </span>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-almet-waterloo dark:text-gray-400">
                    Created: {new Date(handover.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={refreshHandover}
                  disabled={refreshing}
                  className="p-2 hover:bg-almet-mystic dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className={`w-5 h-5 text-almet-waterloo dark:text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-almet-mystic dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-almet-waterloo dark:text-gray-400" />
                </button>
              </div>
            </div>

            {/* Section Tabs */}
            <div className="flex gap-2 overflow-x-auto">
              {sections.map(section => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                      activeSection === section.id
                        ? 'bg-almet-sapphire text-white'
                        : 'bg-almet-mystic dark:bg-gray-800 text-almet-waterloo dark:text-gray-400 hover:bg-almet-bali-hai/20 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {section.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Overview Section */}
            {activeSection === 'overview' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-br from-almet-mystic to-almet-bali-hai/20 dark:from-gray-800 dark:to-gray-800/50 rounded-xl p-6 border border-almet-bali-hai dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-almet-cloud-burst dark:text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-almet-sapphire" />
                    General Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                      <label className="block text-sm font-medium text-almet-waterloo dark:text-gray-400 mb-2">
                        Handing Over
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-almet-mystic dark:bg-almet-sapphire/20 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-almet-sapphire" />
                        </div>
                        <div>
                          <p className="font-semibold text-almet-cloud-burst dark:text-white">
                            {handover.handing_over_employee_name}
                          </p>
                          <p className="text-sm text-almet-waterloo dark:text-gray-400">
                            {handover.handing_over_position}
                          </p>
                          <p className="text-xs text-almet-waterloo dark:text-gray-500">
                            {handover.handing_over_department}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                      <label className="block text-sm font-medium text-almet-waterloo dark:text-gray-400 mb-2">
                        Taking Over
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-almet-cloud-burst dark:text-white">
                            {handover.taking_over_employee_name}
                          </p>
                          <p className="text-sm text-almet-waterloo dark:text-gray-400">
                            {handover.taking_over_position}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                      <label className="block text-sm font-medium text-almet-waterloo dark:text-gray-400 mb-2">
                        Line Manager
                      </label>
                      <p className="font-semibold text-almet-cloud-burst dark:text-white">
                        {handover.line_manager_name || 'Not assigned'}
                      </p>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm">
                      <label className="block text-sm font-medium text-almet-waterloo dark:text-gray-400 mb-2">
                        Handover Period
                      </label>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-almet-sapphire" />
                        <div>
                          <p className="font-semibold text-almet-cloud-burst dark:text-white">
                            {new Date(handover.start_date).toLocaleDateString()} - {new Date(handover.end_date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-almet-waterloo dark:text-gray-400">
                            {Math.ceil((new Date(handover.end_date) - new Date(handover.start_date)) / (1000 * 60 * 60 * 24))} days
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signature Status */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-semibold text-almet-cloud-burst dark:text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-almet-sapphire" />
                    Signature Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className={`p-5 rounded-xl border-2 transition-all ${
                      handover.ho_signed 
                        ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 shadow-sm' 
                        : 'border-almet-bali-hai dark:border-gray-700 bg-white dark:bg-gray-900'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-almet-cloud-burst dark:text-white">
                          {handover.handing_over_employee_name}
                        </p>
                        {handover.ho_signed ? (
                          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        ) : (
                          <Clock className="w-6 h-6 text-almet-waterloo dark:text-gray-400" />
                        )}
                      </div>
                      <div className={`flex items-center gap-2 text-sm font-medium ${
                        handover.ho_signed ? 'text-green-600 dark:text-green-400' : 'text-almet-waterloo dark:text-gray-400'
                      }`}>
                        {handover.ho_signed ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Signed: {new Date(handover.ho_signed_date).toLocaleString()}
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4" />
                            Awaiting signature
                          </>
                        )}
                      </div>
                    </div>

                    <div className={`p-5 rounded-xl border-2 transition-all ${
                      handover.to_signed 
                        ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 shadow-sm' 
                        : 'border-almet-bali-hai dark:border-gray-700 bg-white dark:bg-gray-900'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-almet-cloud-burst dark:text-white">
                          {handover.taking_over_employee_name}
                        </p>
                        {handover.to_signed ? (
                          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                        ) : (
                          <Clock className="w-6 h-6 text-almet-waterloo dark:text-gray-400" />
                        )}
                      </div>
                      <div className={`flex items-center gap-2 text-sm font-medium ${
                        handover.to_signed ? 'text-green-600 dark:text-green-400' : 'text-almet-waterloo dark:text-gray-400'
                      }`}>
                        {handover.to_signed ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Signed: {new Date(handover.to_signed_date).toLocaleString()}
                          </>
                        ) : (
                          <>
                            <Clock className="w-4 h-4" />
                            Awaiting signature
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* LM Approval Status */}
                {handover.lm_approved && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-xl p-6 border border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-green-900 dark:text-green-300 mb-2">
                          Approved by Line Manager
                        </h4>
                        <p className="text-green-700 dark:text-green-400 text-sm mb-2">
                          Approved on: {new Date(handover.lm_approved_date).toLocaleString()}
                        </p>
                        {handover.lm_comment && (
                          <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-3 mt-2">
                            <p className="text-green-800 dark:text-green-300 text-sm">
                              "{handover.lm_comment}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Clarification Request */}
                {handover.status === 'NEED_CLARIFICATION' && handover.lm_clarification_comment && (
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2">
                          Clarification Required
                        </h4>
                        <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-3">
                          <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                            "{handover.lm_clarification_comment}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rejection */}
                {handover.status === 'REJECTED' && handover.rejection_reason && (
                  <div className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/10 dark:to-rose-900/10 rounded-xl p-6 border border-red-200 dark:border-red-800">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-900 dark:text-red-300 mb-2">
                          Rejected by Line Manager
                        </h4>
                        <p className="text-red-700 dark:text-red-400 text-sm mb-2">
                          Rejected on: {new Date(handover.rejected_at).toLocaleString()}
                        </p>
                        <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg p-3">
                          <p className="text-red-800 dark:text-red-300 text-sm">
                            "{handover.rejection_reason}"
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tasks Section */}
            {activeSection === 'tasks' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-almet-cloud-burst dark:text-white flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-almet-sapphire" />
                    Tasks & Responsibilities ({handover.tasks?.length || 0})
                  </h3>
                  
                  {canEditTaskStatus && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg text-sm">
                      {isAdmin && <Shield className="w-4 h-4" />}
                      <Edit className="w-4 h-4" />
                      <span>You can update task statuses</span>
                    </div>
                  )}
                </div>

                {handover.tasks && handover.tasks.length > 0 ? (
                  <div className="space-y-3">
                    {handover.tasks.map((task, index) => (
                      <div key={task.id} className="bg-almet-mystic dark:bg-gray-800 rounded-xl border border-almet-bali-hai dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-start gap-3 mb-2">
                                <span className="flex-shrink-0 w-6 h-6 bg-almet-sapphire/20 dark:bg-almet-sapphire/30 text-almet-sapphire rounded-full flex items-center justify-center text-xs font-semibold">
                                  {index + 1}
                                </span>
                                <div className="flex-1">
                                  <p className="font-medium text-almet-cloud-burst dark:text-white mb-2 leading-relaxed">
                                    {task.description}
                                  </p>
                                  
                                  {/* Task Status - Editable */}
                                  {editingTask === task.id ? (
                                    <div className="mt-3 p-3 bg-white dark:bg-gray-900 rounded-lg border-2 border-almet-sapphire">
                                      <div className="space-y-3">
                                        <div>
                                          <label className="block text-sm font-medium text-almet-cloud-burst dark:text-white mb-2">
                                            Update Status
                                          </label>
                                          <select
                                            value={taskStatus}
                                            onChange={(e) => setTaskStatus(e.target.value)}
                                            className="w-full px-3 py-2 border border-almet-bali-hai dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                          >
                                            {taskStatusOptions.map(option => (
                                              <option key={option.value} value={option.value}>
                                                {option.label}
                                              </option>
                                            ))}
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-almet-cloud-burst dark:text-white mb-2">
                                            Comment (Optional)
                                          </label>
                                          <textarea
                                            value={taskComment}
                                            onChange={(e) => setTaskComment(e.target.value)}
                                            className="w-full px-3 py-2 border border-almet-bali-hai dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                            rows="2"
                                            placeholder="Add a comment about this status change..."
                                          />
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <button
                                            onClick={() => handleTaskStatusSave(task.id)}
                                            disabled={taskLoading}
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-colors disabled:opacity-50"
                                          >
                                            {taskLoading ? (
                                              <>
                                                <Loader className="w-4 h-4 animate-spin" />
                                                Saving...
                                              </>
                                            ) : (
                                              <>
                                                <CheckCircle className="w-4 h-4" />
                                                Save
                                              </>
                                            )}
                                          </button>
                                          <button
                                            onClick={handleTaskStatusCancel}
                                            disabled={taskLoading}
                                            className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                                          >
                                            Cancel
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-3 flex-wrap">
                                      {getTaskStatusBadge(task.current_status)}
                                      {task.initial_comment && (
                                        <span className="text-xs text-almet-waterloo dark:text-gray-400 italic">
                                          "{task.initial_comment}"
                                        </span>
                                      )}
                                      {canEditTaskStatus && (
                                        <button
                                          onClick={() => handleTaskStatusEdit(task)}
                                          className="inline-flex items-center gap-1 px-2 py-1 text-xs text-almet-sapphire hover:bg-almet-mystic dark:hover:bg-gray-700 rounded transition-colors"
                                        >
                                          <Edit className="w-3 h-3" />
                                          Update Status
                                        </button>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            {task.activity_log && task.activity_log.length > 0 && (
                              <button
                                onClick={() => toggleTask(task.id)}
                                className="p-2 hover:bg-almet-bali-hai/20 dark:hover:bg-gray-700 rounded-lg transition-colors"
                              >
                                {expandedTasks[task.id] ? (
                                  <ChevronUp className="w-5 h-5 text-almet-waterloo dark:text-gray-400" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-almet-waterloo dark:text-gray-400" />
                                )}
                              </button>
                            )}
                          </div>

                          {/* Task Activity Log */}
                          {expandedTasks[task.id] && task.activity_log && task.activity_log.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-almet-bali-hai dark:border-gray-700">
                              <h4 className="text-sm font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                                <History className="w-4 h-4" />
                                Activity History
                              </h4>
                              <div className="space-y-3 pl-4">
                                {task.activity_log.map((log, logIndex) => (
                                  <div key={logIndex} className="relative pl-6 pb-3 border-l-2 border-almet-sapphire/30 dark:border-almet-sapphire/50 last:border-transparent last:pb-0">
                                    <div className="absolute -left-2 top-0 w-4 h-4 bg-almet-sapphire rounded-full border-2 border-white dark:border-gray-800"></div>
                                    <div className="bg-white dark:bg-gray-900 rounded-lg p-3 shadow-sm">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-almet-cloud-burst dark:text-white text-sm">
                                          {log.actor_name}
                                        </span>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-xs text-almet-waterloo dark:text-gray-400">
                                          {new Date(log.timestamp).toLocaleString()}
                                        </span>
                                      </div>
                                      <p className="text-sm text-almet-waterloo dark:text-gray-300 mb-1">
                                        <span className="font-medium">{log.action}:</span>{' '}
                                        <span className="text-almet-waterloo dark:text-gray-400">{log.old_status}</span> → <span className="text-almet-sapphire font-medium">{log.new_status}</span>
                                      </p>
                                      {log.comment && log.comment !== '-' && (
                                        <p className="text-sm text-almet-waterloo dark:text-gray-300 mt-2 italic bg-almet-mystic dark:bg-gray-800 p-2 rounded">
                                          "{log.comment}"
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-almet-mystic dark:bg-gray-800 rounded-xl">
                    <CheckCircle className="w-16 h-16 text-almet-bali-hai dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-almet-waterloo dark:text-gray-400">No tasks defined</p>
                  </div>
                )}
              </div>
            )}

            {/* Details Section */}
            {activeSection === 'details' && (
              <div className="space-y-6">
                {/* Important Dates */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-almet-bali-hai dark:border-gray-700">
                  <h4 className="text-lg font-semibold text-almet-cloud-burst dark:text-white mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-almet-sapphire" />
                    Important Dates
                  </h4>
                  {handover.important_dates && handover.important_dates.length > 0 ? (
                    <div className="space-y-3">
                      {handover.important_dates.map((dateItem, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-almet-mystic dark:bg-gray-800 rounded-lg">
                          <div className="flex-shrink-0 w-16 text-center">
                            <div className="bg-almet-sapphire text-white rounded-lg p-2">
                              <div className="text-xs font-medium">
                                {new Date(dateItem.date).toLocaleDateString('en-US', { month: 'short' })}
                              </div>
                              <div className="text-lg font-bold">
                                {new Date(dateItem.date).getDate()}
                              </div>
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-almet-cloud-burst dark:text-white">
                              {dateItem.description}
                            </p>
                            <p className="text-sm text-almet-waterloo dark:text-gray-400 mt-1">
                              {new Date(dateItem.date).toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-almet-waterloo dark:text-gray-400 text-center py-4">
                      No important dates specified
                    </p>
                  )}
                </div>

                {/* Related Contacts */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-almet-bali-hai dark:border-gray-700">
                  <h4 className="text-lg font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-almet-sapphire" />
                    Related Contacts
                  </h4>
                  <div className="bg-almet-mystic dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-almet-cloud-burst dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {handover.contacts || 'No contact information provided'}
                    </p>
                  </div>
                </div>

                {/* Access Information */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-almet-bali-hai dark:border-gray-700">
                  <h4 className="text-lg font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                    <Key className="w-5 h-5 text-almet-sapphire" />
                    Access Information
                  </h4>
                  <div className="bg-almet-mystic dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-almet-cloud-burst dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {handover.access_info || 'No access information provided'}
                    </p>
                  </div>
                </div>

                {/* Documents & Files */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-almet-bali-hai dark:border-gray-700">
                  <h4 className="text-lg font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                    <Folder className="w-5 h-5 text-almet-sapphire" />
                    Documents & Files
                  </h4>
                  <div className="bg-almet-mystic dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-almet-cloud-burst dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {handover.documents_info || 'No documents information provided'}
                    </p>
                  </div>
                </div>

                {/* Open Issues */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-almet-bali-hai dark:border-gray-700">
                  <h4 className="text-lg font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-almet-sapphire" />
                    Open Issues
                  </h4>
                  <div className="bg-almet-mystic dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-almet-cloud-burst dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {handover.open_issues || 'No open issues reported'}
                    </p>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-almet-bali-hai dark:border-gray-700">
                  <h4 className="text-lg font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-almet-sapphire" />
                    Additional Notes
                  </h4>
                  <div className="bg-almet-mystic dark:bg-gray-800 rounded-lg p-4">
                    <p className="text-almet-cloud-burst dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                      {handover.notes || 'No additional notes'}
                    </p>
                  </div>
                </div>

                {/* Attachments */}
                {handover.attachments && handover.attachments.length > 0 && (
                  <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-almet-bali-hai dark:border-gray-700">
                    <h4 className="text-lg font-semibold text-almet-cloud-burst dark:text-white mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-almet-sapphire" />
                      Attachments ({handover.attachments.length})
                    </h4>
                    <div className="space-y-2">
                      {handover.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className="flex items-center justify-between p-3 bg-almet-mystic dark:bg-gray-800 rounded-lg hover:bg-almet-bali-hai/20 dark:hover:bg-gray-700 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <FileText className="w-5 h-5 text-almet-sapphire flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-almet-cloud-burst dark:text-white truncate">
                                {attachment.file.split('/').pop()}
                              </p>
                              <p className="text-xs text-almet-waterloo dark:text-gray-400">
                                {attachment.file_size_display} • {new Date(attachment.uploaded_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <a
                            href={attachment.file_url}
                            download
                            className="flex-shrink-0 p-2 text-almet-sapphire hover:bg-almet-mystic dark:hover:bg-gray-700 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download className="w-5 h-5" />
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Activity Log Section */}
            {activeSection === 'activity' && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-almet-cloud-burst dark:text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-almet-sapphire" />
                  Activity History
                </h3>

                {loadingLog ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader className="w-8 h-8 text-almet-sapphire animate-spin" />
                  </div>
                ) : activityLog.length > 0 ? (
                  <div className="space-y-4">
                    {activityLog.map((log, index) => (
                      <div key={log.id || index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 bg-almet-mystic dark:bg-almet-sapphire/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <History className="w-5 h-5 text-almet-sapphire" />
                          </div>
                          {index < activityLog.length - 1 && (
                            <div className="w-0.5 flex-1 bg-almet-bali-hai dark:bg-gray-700 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="bg-gradient-to-br from-almet-mystic to-almet-bali-hai/20 dark:from-gray-800 dark:to-gray-800/50 rounded-xl p-4 border border-almet-bali-hai dark:border-gray-700 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-almet-cloud-burst dark:text-white">
                                  {log.actor_name || 'System'}
                                </span>
                                {log.status && (
                                  <>
                                    <span className="text-gray-400">•</span>
                                    {getStatusBadge(log.status)}
                                  </>
                                )}
                              </div>
                              <span className="text-sm text-almet-waterloo dark:text-gray-400">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-almet-cloud-burst dark:text-gray-300 font-medium mb-1">
                              {log.action}
                            </p>
                            {log.comment && log.comment !== '-' && (
                              <div className="mt-2 bg-white dark:bg-gray-900 rounded-lg p-3 border border-almet-bali-hai dark:border-gray-700">
                                <p className="text-almet-waterloo dark:text-gray-300 text-sm italic">
                                  "{log.comment}"
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-almet-mystic dark:bg-gray-800 rounded-xl">
                    <History className="w-16 h-16 text-almet-bali-hai dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-almet-waterloo dark:text-gray-400">No activity recorded yet</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer with Action Buttons */}
          <div className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-almet-mystic dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-almet-bali-hai dark:border-gray-700 text-almet-cloud-burst dark:text-white rounded-lg hover:bg-almet-mystic dark:hover:bg-gray-800 transition-colors font-medium"
              >
                Close
              </button>
              <div className="flex items-center gap-3 flex-wrap">
                {renderActionButtons()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Comment Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-almet-cloud-burst dark:text-white mb-4">
                {confirmationConfig.title}
              </h3>
              
              <div className="mb-4">
                <p className="text-almet-waterloo dark:text-gray-300 mb-4">
                  {confirmationConfig.message}
                </p>

                <div>
                  <label className="block text-sm font-medium text-almet-cloud-burst dark:text-gray-200 mb-2">
                    {actionType === 'reject' ? 'Rejection Reason *' : 
                     actionType === 'clarify' ? 'Clarification Request *' : 
                     actionType === 'resubmit' ? 'Response to Clarification *' : 
                     'Comment *'}
                  </label>
                  <textarea
                    value={actionComment}
                    onChange={(e) => setActionComment(e.target.value)}
                    className="w-full px-4 py-2 border border-almet-bali-hai dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent resize-none bg-white dark:bg-gray-800 text-almet-cloud-burst dark:text-white"
                    rows="4"
                    placeholder={
                      actionType === 'reject' ? 'Enter rejection reason...' :
                      actionType === 'clarify' ? 'Enter clarification request...' :
                      actionType === 'resubmit' ? 'Enter your response...' :
                      'Add your comment...'
                    }
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowActionModal(false)}
                  disabled={actionLoading}
                  className="px-6 py-2 border border-almet-bali-hai dark:border-gray-700 text-almet-cloud-burst dark:text-white rounded-lg hover:bg-almet-mystic dark:hover:bg-gray-800 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={executeAction}
                  disabled={actionLoading || !actionComment.trim()}
                  className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
                    actionType === 'reject' 
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : actionType === 'clarify'
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                      : 'bg-almet-sapphire hover:bg-almet-cloud-burst text-white'
                  }`}
                >
                  {actionLoading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      {confirmationConfig.confirmText}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Simple Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={executeAction}
        title={confirmationConfig.title}
        message={confirmationConfig.message}
        confirmText={confirmationConfig.confirmText}
        type={confirmationConfig.type}
        loading={actionLoading}
      />
    </>
  );
};

export default HandoverDetailModal;