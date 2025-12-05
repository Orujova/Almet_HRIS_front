// components/handovers/HandoverDetailModal.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, CheckCircle, XCircle, AlertCircle, Clock, 
  FileText, Users, Calendar, Key, Folder, 
  AlertTriangle, MessageSquare, History, Download,
  Edit, Trash2, Plus, Loader, ChevronDown, ChevronUp,
  Send, RefreshCw, Eye, Share2, Printer
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

  const { showSuccess, showError, showInfo } = useToast();

  // Determine user role in this handover
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
        class: 'bg-gray-100 text-gray-700',
        icon: <FileText className="w-4 h-4" />
      },
      'SIGNED_BY_HANDING_OVER': { 
        label: 'Signed by HO', 
        class: 'bg-blue-100 text-blue-700',
        icon: <CheckCircle className="w-4 h-4" />
      },
      'SIGNED_BY_TAKING_OVER': { 
        label: 'Signed by TO', 
        class: 'bg-cyan-100 text-cyan-700',
        icon: <CheckCircle className="w-4 h-4" />
      },
      'APPROVED_BY_LINE_MANAGER': { 
        label: 'Approved by LM', 
        class: 'bg-green-100 text-green-700',
        icon: <CheckCircle className="w-4 h-4" />
      },
      'REJECTED': { 
        label: 'Rejected', 
        class: 'bg-red-100 text-red-700',
        icon: <XCircle className="w-4 h-4" />
      },
      'NEED_CLARIFICATION': { 
        label: 'Need Clarification', 
        class: 'bg-yellow-100 text-yellow-700',
        icon: <AlertCircle className="w-4 h-4" />
      },
      'RESUBMITTED': { 
        label: 'Resubmitted', 
        class: 'bg-purple-100 text-purple-700',
        icon: <FileText className="w-4 h-4" />
      },
      'TAKEN_OVER': { 
        label: 'Taken Over', 
        class: 'bg-green-100 text-green-700',
        icon: <CheckCircle className="w-4 h-4" />
      },
      'TAKEN_BACK': { 
        label: 'Taken Back', 
        class: 'bg-indigo-100 text-indigo-700',
        icon: <CheckCircle className="w-4 h-4" />
      },
    };

    const config = statusConfig[status] || { 
      label: status, 
      class: 'bg-gray-100 text-gray-700',
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
      'NOT_STARTED': { label: 'Not Started', class: 'bg-yellow-100 text-yellow-700' },
      'IN_PROGRESS': { label: 'In Progress', class: 'bg-blue-100 text-blue-700' },
      'COMPLETED': { label: 'Completed', class: 'bg-green-100 text-green-700' },
      'CANCELED': { label: 'Canceled', class: 'bg-gray-100 text-gray-700' },
      'POSTPONED': { label: 'Postponed', class: 'bg-orange-100 text-orange-700' },
    };

    const statusInfo = config[status] || config['NOT_STARTED'];

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.class}`}>
        {statusInfo.label}
      </span>
    );
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

  // Export/Print handlers
  const handleExport = () => {
    showInfo('Export functionality coming soon...');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Handover: ${handover.request_id}`,
        text: `Handover from ${handover.handing_over_employee_name} to ${handover.taking_over_employee_name}`,
        url: window.location.href
      }).catch(() => showError('Error sharing'));
    } else {
      navigator.clipboard.writeText(window.location.href);
      showSuccess('Link copied to clipboard');
    }
  };

  // Render action buttons based on status and role
  const renderActionButtons = () => {
    const buttons = [];

    // Handing Over - needs to sign
    if (isHandingOver && handover.status === 'CREATED' && !handover.ho_signed) {
      buttons.push(
        <button
          key="sign_ho"
          onClick={() => handleAction('sign_ho')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-sm"
        >
          <CheckCircle className="w-5 h-5" />
          Sign as Handing Over
        </button>
      );
    }

    // Taking Over - needs to sign
    if (isTakingOver && handover.status === 'SIGNED_BY_HANDING_OVER' && !handover.to_signed) {
      buttons.push(
        <button
          key="sign_to"
          onClick={() => handleAction('sign_to')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium shadow-sm"
        >
          <CheckCircle className="w-5 h-5" />
          Sign as Taking Over
        </button>
      );
    }

    // Line Manager - needs to approve
    if (isLineManager && handover.status === 'SIGNED_BY_TAKING_OVER' && !handover.lm_approved) {
      buttons.push(
        <button
          key="approve"
          onClick={() => handleAction('approve')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
        >
          <CheckCircle className="w-5 h-5" />
          Approve
        </button>,
        <button
          key="reject"
          onClick={() => handleAction('reject')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-sm"
        >
          <XCircle className="w-5 h-5" />
          Reject
        </button>,
        <button
          key="clarify"
          onClick={() => handleAction('clarify')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium shadow-sm"
        >
          <AlertCircle className="w-5 h-5" />
          Request Clarification
        </button>
      );
    }

    // Handing Over - needs to resubmit after clarification
    if (isHandingOver && handover.status === 'NEED_CLARIFICATION') {
      buttons.push(
        <button
          key="resubmit"
          onClick={() => handleAction('resubmit')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium shadow-sm"
        >
          <Send className="w-5 h-5" />
          Resubmit
        </button>
      );
    }

    // Taking Over - needs to takeover
    if (isTakingOver && handover.status === 'APPROVED_BY_LINE_MANAGER' && !handover.taken_over) {
      buttons.push(
        <button
          key="takeover"
          onClick={() => handleAction('takeover')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-sm"
        >
          <CheckCircle className="w-5 h-5" />
          Take Over
        </button>
      );
    }

    // Handing Over - needs to takeback
    if (isHandingOver && handover.status === 'TAKEN_OVER' && !handover.taken_back) {
      buttons.push(
        <button
          key="takeback"
          onClick={() => handleAction('takeback')}
          className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium shadow-sm"
        >
          <CheckCircle className="w-5 h-5" />
          Take Back
        </button>
      );
    }

    return buttons;
  };

  // Section tabs
  const sections = [
    { id: 'overview', label: 'Overview', icon: Eye },
    { id: 'tasks', label: 'Tasks', icon: CheckCircle },
    { id: 'details', label: 'Details', icon: Folder },
    { id: 'activity', label: 'Activity Log', icon: History }
  ];

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Handover Details
                  </h2>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium">
                    #{handover.request_id}
                  </span>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {getStatusBadge(handover.status)}
                  <span className="text-sm text-gray-500">
                    {handover.handover_type_name}
                  </span>
                  <span className="text-sm text-gray-400">•</span>
                  <span className="text-sm text-gray-500">
                    Created: {new Date(handover.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={refreshHandover}
                  disabled={refreshing}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className={`w-5 h-5 text-gray-500 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Share"
                >
                  <Share2 className="w-5 h-5 text-gray-500" />
                </button>
                <button
                  onClick={handlePrint}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Print"
                >
                  <Printer className="w-5 h-5 text-gray-500" />
                </button>
                <button
                  onClick={handleExport}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Export"
                >
                  <Download className="w-5 h-5 text-gray-500" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-500" />
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
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                {/* General Information */}
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    General Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Handing Over */}
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <label className="block text-sm font-medium text-gray-500 mb-2">
                        Handing Over
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {handover.handing_over_employee_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {handover.handing_over_position}
                          </p>
                          <p className="text-xs text-gray-500">
                            {handover.handing_over_department}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Taking Over */}
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <label className="block text-sm font-medium text-gray-500 mb-2">
                        Taking Over
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Users className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {handover.taking_over_employee_name}
                          </p>
                          <p className="text-sm text-gray-600">
                            {handover.taking_over_position}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Line Manager */}
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <label className="block text-sm font-medium text-gray-500 mb-2">
                        Line Manager
                      </label>
                      <p className="font-semibold text-gray-900">
                        {handover.line_manager_name || 'Not assigned'}
                      </p>
                    </div>

                    {/* Period */}
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                      <label className="block text-sm font-medium text-gray-500 mb-2">
                        Handover Period
                      </label>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <div>
                          <p className="font-semibold text-gray-900">
                            {new Date(handover.start_date).toLocaleDateString()} - {new Date(handover.end_date).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            {Math.ceil((new Date(handover.end_date) - new Date(handover.start_date)) / (1000 * 60 * 60 * 24))} days
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Signatures Status */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    Signature Status
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* HO Signature */}
                    <div className={`p-5 rounded-xl border-2 transition-all ${
                      handover.ho_signed 
                        ? 'border-green-300 bg-green-50 shadow-sm' 
                        : 'border-gray-200 bg-white'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-gray-900">
                          {handover.handing_over_employee_name}
                        </p>
                        {handover.ho_signed ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <Clock className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className={`flex items-center gap-2 text-sm font-medium ${
                        handover.ho_signed ? 'text-green-600' : 'text-gray-500'
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

                    {/* TO Signature */}
                    <div className={`p-5 rounded-xl border-2 transition-all ${
                      handover.to_signed 
                        ? 'border-green-300 bg-green-50 shadow-sm' 
                        : 'border-gray-200 bg-white'
                    }`}>
                      <div className="flex items-center justify-between mb-3">
                        <p className="font-semibold text-gray-900">
                          {handover.taking_over_employee_name}
                        </p>
                        {handover.to_signed ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <Clock className="w-6 h-6 text-gray-400" />
                        )}
                      </div>
                      <div className={`flex items-center gap-2 text-sm font-medium ${
                        handover.to_signed ? 'text-green-600' : 'text-gray-500'
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
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-green-900 mb-2">
                          Approved by Line Manager
                        </h4>
                        <p className="text-green-700 text-sm mb-2">
                          Approved on: {new Date(handover.lm_approved_date).toLocaleString()}
                        </p>
                        {handover.lm_comment && (
                          <div className="bg-white/50 rounded-lg p-3 mt-2">
                            <p className="text-green-800 text-sm">
                              "{handover.lm_comment}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* LM Clarification Message */}
                {handover.status === 'NEED_CLARIFICATION' && handover.lm_clarification_comment && (
                  <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-yellow-900 mb-2">
                          Clarification Required
                        </h4>
                        <div className="bg-white/50 rounded-lg p-4">
                          <p className="text-yellow-800">
                            {handover.lm_clarification_comment}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rejection Reason */}
                {handover.status === 'REJECTED' && handover.rejection_reason && (
                  <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-xl p-6 border border-red-200">
                    <div className="flex items-start gap-3">
                      <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-red-900 mb-2">
                          Rejection Reason
                        </h4>
                        <div className="bg-white/50 rounded-lg p-4">
                          <p className="text-red-800">
                            {handover.rejection_reason}
                          </p>
                        </div>
                        {handover.rejected_at && (
                          <p className="text-red-600 text-sm mt-2">
                            Rejected on: {new Date(handover.rejected_at).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Takeover Status */}
                {handover.taken_over && (
                  <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 border border-green-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-green-900 mb-2">
                          Responsibilities Taken Over
                        </h4>
                        <p className="text-green-700 text-sm">
                          Taken over on: {new Date(handover.taken_over_date).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {handover.taken_back && (
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-200">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-indigo-900 mb-2">
                          Responsibilities Taken Back
                        </h4>
                        <p className="text-indigo-700 text-sm">
                          Taken back on: {new Date(handover.taken_back_date).toLocaleString()}
                        </p>
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
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    Tasks & Responsibilities ({handover.tasks?.length || 0})
                  </h3>
                  
                  {/* Task Summary */}
                  {handover.tasks && handover.tasks.length > 0 && (
                    <div className="flex items-center gap-2">
                      {['COMPLETED', 'IN_PROGRESS', 'NOT_STARTED'].map(status => {
                        const count = handover.tasks.filter(t => t.current_status === status).length;
                        if (count === 0) return null;
                        return (
                          <div key={status} className="flex items-center gap-1 text-xs">
                            {getTaskStatusBadge(status)}
                            <span className="text-gray-500">({count})</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {handover.tasks && handover.tasks.length > 0 ? (
                  <div className="space-y-3">
                    {handover.tasks.map((task, index) => (
                      <div key={task.id} className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-start gap-3 mb-2">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold">
                                  {index + 1}
                                </span>
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 mb-2 leading-relaxed">
                                    {task.description}
                                  </p>
                                  <div className="flex items-center gap-3 flex-wrap">
                                    {getTaskStatusBadge(task.current_status)}
                                    {task.initial_comment && (
                                      <span className="text-xs text-gray-500 italic">
                                        "{task.initial_comment}"
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {task.activity_log && task.activity_log.length > 0 && (
                              <button
                                onClick={() => toggleTask(task.id)}
                                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                              >
                                {expandedTasks[task.id] ? (
                                  <ChevronUp className="w-5 h-5 text-gray-600" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-gray-600" />
                                )}
                              </button>
                            )}
                          </div>

                          {/* Task Activity Log */}
                          {expandedTasks[task.id] && task.activity_log && task.activity_log.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                <History className="w-4 h-4" />
                                Activity History
                              </h4>
                              <div className="space-y-3 pl-4">
                                {task.activity_log.map((log, logIndex) => (
                                  <div key={logIndex} className="relative pl-6 pb-3 border-l-2 border-blue-200 last:border-transparent last:pb-0">
                                    <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
                                    <div className="bg-white rounded-lg p-3 shadow-sm">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-gray-900 text-sm">
                                          {log.actor_name}
                                        </span>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-xs text-gray-500">
                                          {new Date(log.timestamp).toLocaleString()}
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-600 mb-1">
                                        <span className="font-medium">{log.action}:</span>{' '}
                                        <span className="text-gray-500">{log.old_status}</span> → <span className="text-blue-600 font-medium">{log.new_status}</span>
                                      </p>
                                      {log.comment && log.comment !== '-' && (
                                        <p className="text-sm text-gray-600 mt-2 italic bg-gray-50 p-2 rounded">
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
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No tasks defined</p>
                  </div>
                )}
              </div>
            )}

            {/* Details Section */}
            {activeSection === 'details' && (
              <div className="space-y-6">
                {/* Important Dates */}
                {handover.important_dates && handover.important_dates.length > 0 && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Important Dates
                    </h4>
                    <div className="space-y-2">
                      {handover.important_dates.map((dateItem, index) => (
                        <div key={index} className="flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex flex-col items-center justify-center">
                              <span className="text-xs font-medium text-blue-600">
                                {new Date(dateItem.date).toLocaleDateString('en-US', { month: 'short' })}
                              </span>
                              <span className="text-lg font-bold text-blue-700">
                                {new Date(dateItem.date).getDate()}
                              </span>
                            </div>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {dateItem.description}
                            </p>
                            <p className="text-sm text-gray-500">
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
                  </div>
                )}

                {/* Related Contacts */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Related Contacts
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {handover.contacts || 'No contact information provided'}
                    </p>
                  </div>
                </div>

                {/* Access Information */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Key className="w-5 h-5 text-blue-600" />
                    Access Information / Accounts
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {handover.access_info || 'No access information provided'}
                    </p>
                  </div>
                </div>

                {/* Documents & Files */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Folder className="w-5 h-5 text-blue-600" />
                    Documents & Files
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {handover.documents_info || 'No document information provided'}
                    </p>
                  </div>
                </div>

                {/* Open Issues */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    Open Issues
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {handover.open_issues || 'No open issues reported'}
                    </p>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="bg-white rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Additional Notes
                  </h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {handover.notes || 'No additional notes'}
                    </p>
                  </div>
                </div>

                {/* Attachments */}
                {handover.attachments && handover.attachments.length > 0 && (
                  <div className="bg-white rounded-xl p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      Attachments ({handover.attachments.length})
                    </h4>
                    <div className="space-y-2">
                      {handover.attachments.map((attachment) => (
                        <div key={attachment.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {attachment.original_filename}
                              </p>
                              <p className="text-sm text-gray-500">
                                {attachment.file_size_display} • Uploaded by {attachment.uploaded_by_name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {new Date(attachment.uploaded_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <a
                            href={attachment.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Download className="w-5 h-5 text-blue-600" />
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
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-600" />
                  Activity History
                </h3>

                {loadingLog ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                ) : activityLog.length > 0 ? (
                  <div className="space-y-4">
                    {activityLog.map((log, index) => (
                      <div key={log.id || index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <History className="w-5 h-5 text-blue-600" />
                          </div>
                          {index < activityLog.length - 1 && (
                            <div className="w-0.5 flex-1 bg-gray-200 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-gray-900">
                                  {log.actor_name || 'System'}
                                </span>
                                {log.status && (
                                  <>
                                    <span className="text-gray-400">•</span>
                                    {getStatusBadge(log.status)}
                                  </>
                                )}
                              </div>
                              <span className="text-sm text-gray-500">
                                {new Date(log.timestamp).toLocaleString()}
                              </span>
                            </div>
                            <p className="text-gray-700 font-medium mb-1">
                              {log.action}
                            </p>
                            {log.comment && log.comment !== '-' && (
                              <div className="mt-2 bg-white rounded-lg p-3 border border-gray-200">
                                <p className="text-gray-600 text-sm italic">
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
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <History className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No activity recorded yet</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer with Action Buttons */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
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
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {confirmationConfig.title}
              </h3>
              
              <div className="mb-4">
                <p className="text-gray-600 mb-4">
                  {confirmationConfig.message}
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {actionType === 'reject' ? 'Rejection Reason *' : 
                     actionType === 'clarify' ? 'Clarification Request *' : 
                     actionType === 'resubmit' ? 'Response to Clarification *' : 
                     'Comment *'}
                  </label>
                  <textarea
                    value={actionComment}
                    onChange={(e) => setActionComment(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
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
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
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
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
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