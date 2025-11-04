'use client';
import React, { useState, useEffect } from 'react';
import { Clock, Calendar, CheckCircle, XCircle, AlertCircle, Plus, Filter, RefreshCw, Eye, X, Check, Ban, Users } from 'lucide-react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import timeOffService from '@/services/timeOffService';
import { useToast } from '@/components/common/Toast';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { LoadingSpinner, ErrorDisplay } from '@/components/common/LoadingSpinner';
import Pagination from '@/components/common/Pagination';

const TimeOffPage = () => {
  const { theme } = useTheme();
  const darkMode = theme === 'dark';
  
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [permissions, setPermissions] = useState(null);
  const [error, setError] = useState(null);
  
  // Modals
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', requestId: null });

  // Form state
  const [formData, setFormData] = useState({
    date: '',
    start_time: '',
    end_time: '',
    reason: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const toast = useToast();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    if (!loading) {
      loadTabData();
    }
  }, [activeTab]);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [balanceRes, permissionsRes] = await Promise.all([
        timeOffService.getMyBalance(),
        timeOffService.getMyPermissions()
      ]);

      setBalance(balanceRes.data);
      setPermissions(permissionsRes.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load data');
      toast.showError('Failed to load time off data');
    } finally {
      setLoading(false);
    }
  };

  const loadTabData = async () => {
    try {
      if (activeTab === 'my-requests') {
        const res = await timeOffService.getMyRequests();
        setMyRequests(res.data.requests || []);
      } else if (activeTab === 'all-requests' && permissions?.capabilities?.can_view_all_requests) {
        const res = await timeOffService.getAllRequests();
        setAllRequests(res.data.results || []);
      } else if (activeTab === 'approvals' && permissions?.capabilities?.can_approve_as_manager) {
        const res = await timeOffService.getPendingApprovals();
        setPendingApprovals(res.data.requests || []);
      }
    } catch (err) {
      toast.showError('Failed to load requests');
    }
  };

  const validateForm = () => {
    const errors = {};
    const today = new Date().toISOString().split('T')[0];

    if (!formData.date) {
      errors.date = 'Date is required';
    } else if (formData.date < today) {
      errors.date = 'Cannot request time off for past dates';
    }

    if (!formData.start_time) {
      errors.start_time = 'Start time is required';
    }

    if (!formData.end_time) {
      errors.end_time = 'End time is required';
    }

    if (formData.start_time && formData.end_time && formData.start_time >= formData.end_time) {
      errors.end_time = 'End time must be after start time';
    }

    if (!formData.reason || formData.reason.trim().length < 10) {
      errors.reason = 'Reason must be at least 10 characters';
    }

    // Check duration
    if (formData.start_time && formData.end_time) {
      const start = new Date(`2000-01-01T${formData.start_time}`);
      const end = new Date(`2000-01-01T${formData.end_time}`);
      const duration = (end - start) / (1000 * 60 * 60);
      
      if (duration > 8) {
        errors.end_time = 'Maximum 8 hours per request';
      }
      
      if (balance && duration > parseFloat(balance.current_balance_hours)) {
        errors.duration = `Insufficient balance. Available: ${balance.current_balance_hours}h`;
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.showWarning('Please fix form errors');
      return;
    }

    setSubmitting(true);
    try {
      await timeOffService.createRequest({
        employee: permissions.employee_info.id,
        date: formData.date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        reason: formData.reason
      });

      toast.showSuccess('Time off request submitted successfully');
      setShowNewRequestModal(false);
      setFormData({ date: '', start_time: '', end_time: '', reason: '' });
      setFormErrors({});
      loadInitialData();
      loadTabData();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.detail || 'Failed to submit request';
      toast.showError(errorMsg);
      
      if (err.response?.data) {
        setFormErrors(err.response.data);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveRequest = async (requestId) => {
    setConfirmModal({ isOpen: false, type: '', requestId: null });
    try {
      await timeOffService.approveRequest(requestId);
      toast.showSuccess('Request approved successfully');
      loadInitialData();
      loadTabData();
    } catch (err) {
      toast.showError(err.response?.data?.error || 'Failed to approve request');
    }
  };

  const handleRejectRequest = async (requestId, reason) => {
    setConfirmModal({ isOpen: false, type: '', requestId: null });
    try {
      await timeOffService.rejectRequest(requestId, { rejection_reason: reason || 'No reason provided' });
      toast.showSuccess('Request rejected');
      loadInitialData();
      loadTabData();
    } catch (err) {
      toast.showError(err.response?.data?.error || 'Failed to reject request');
    }
  };

  const handleCancelRequest = async (requestId) => {
    setConfirmModal({ isOpen: false, type: '', requestId: null });
    try {
      await timeOffService.cancelRequest(requestId);
      toast.showSuccess('Request cancelled successfully');
      loadInitialData();
      loadTabData();
    } catch (err) {
      toast.showError(err.response?.data?.error || 'Failed to cancel request');
    }
  };

  const getStatusBadge = (status) => {
    const configs = {
      PENDING: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-400', icon: AlertCircle },
      APPROVED: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-400', icon: CheckCircle },
      REJECTED: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-400', icon: XCircle },
      CANCELLED: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-800 dark:text-gray-400', icon: Ban }
    };
    
    const config = configs[status] || configs.PENDING;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        <Icon size={12} />
        {status}
      </span>
    );
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatTime = (timeStr) => {
    return timeStr.substring(0, 5);
  };

  const calculateDuration = (start, end) => {
    const startDate = new Date(`2000-01-01T${start}`);
    const endDate = new Date(`2000-01-01T${end}`);
    return ((endDate - startDate) / (1000 * 60 * 60)).toFixed(1);
  };

  // Pagination logic
  const getCurrentPageData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  if (loading) return <LoadingSpinner message="Loading time off system..." />;
  if (error) return <ErrorDisplay error={error} onRetry={loadInitialData} />;

  return (
    <DashboardLayout>
      <div className="min-h-screen mx-auto">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Time Off Management</h1>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Manage your monthly leave hours
              </p>
            </div>
            {permissions?.capabilities?.can_create_request && (
              <button
                onClick={() => setShowNewRequestModal(true)}
                className="flex items-center gap-2 px-3 py-2 bg-almet-sapphire hover:bg-almet-astral text-white rounded-lg transition-colors text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                New Request
              </button>
            )}
          </div>

          {/* Balance Cards */}
          {balance && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-almet-sapphire to-almet-astral rounded-lg p-3 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs opacity-80">Current Balance</p>
                    <p className="text-2xl font-bold mt-1">{balance.current_balance_hours}h</p>
                  </div>
                  <Clock className="w-8 h-8 opacity-70" />
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Monthly Limit</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white mt-1">
                      {balance.monthly_allowance_hours}h
                    </p>
                  </div>
                  <Calendar className="w-7 h-7 text-almet-sapphire" />
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Used This Month</p>
                    <p className="text-xl font-semibold text-gray-900 dark:text-white mt-1">
                      {balance.used_hours_this_month}h
                    </p>
                  </div>
                  <CheckCircle className="w-7 h-7 text-green-500" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className=" mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-6">
            <button
              onClick={() => {setActiveTab('overview'); setCurrentPage(1);}}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-almet-sapphire text-almet-sapphire'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => {setActiveTab('my-requests'); setCurrentPage(1);}}
              className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'my-requests'
                  ? 'border-almet-sapphire text-almet-sapphire'
                  : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              My Requests
            </button>
            {permissions?.capabilities?.can_view_all_requests && (
              <button
                onClick={() => {setActiveTab('all-requests'); setCurrentPage(1);}}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'all-requests'
                    ? 'border-almet-sapphire text-almet-sapphire'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Users size={16} />
                All Requests
              </button>
            )}
            {permissions?.capabilities?.can_approve_as_manager && (
              <button
                onClick={() => {setActiveTab('approvals'); setCurrentPage(1);}}
                className={`pb-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'approvals'
                    ? 'border-almet-sapphire text-almet-sapphire'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Pending Approvals
                {pendingApprovals.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">
                    {pendingApprovals.length}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Recent Activity</h3>
                {myRequests.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">No requests yet</p>
                ) : (
                  <div className="space-y-2">
                    {myRequests.slice(0, 5).map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(req.date)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTime(req.start_time)} - {formatTime(req.end_time)} ({req.duration_hours}h)
                          </p>
                        </div>
                        {getStatusBadge(req.status)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Statistics</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Total Requests</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{myRequests.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Approved</span>
                    <span className="text-sm font-semibold text-green-600">{myRequests.filter(r => r.status === 'APPROVED').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Pending</span>
                    <span className="text-sm font-semibold text-yellow-600">{myRequests.filter(r => r.status === 'PENDING').length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Rejected</span>
                    <span className="text-sm font-semibold text-red-600">{myRequests.filter(r => r.status === 'REJECTED').length}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'my-requests' && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Time</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Duration</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Reason</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {getCurrentPageData(myRequests).map((req) => (
                        <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{formatDate(req.date)}</td>
                          <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                            {formatTime(req.start_time)} - {formatTime(req.end_time)}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{req.duration_hours}h</td>
                          <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 max-w-xs truncate">{req.reason}</td>
                          <td className="px-4 py-3">{getStatusBadge(req.status)}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {setSelectedRequest(req); setShowDetailModal(true);}}
                                className="p-1 text-almet-sapphire hover:bg-almet-mystic dark:hover:bg-gray-600 rounded"
                                title="View Details"
                              >
                                <Eye size={14} />
                              </button>
                              {req.can_cancel && (
                                <button
                                  onClick={() => setConfirmModal({ isOpen: true, type: 'cancel', requestId: req.id })}
                                  className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                  title="Cancel Request"
                                >
                                  <X size={14} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {myRequests.length > itemsPerPage && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(myRequests.length / itemsPerPage)}
                  totalItems={myRequests.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  darkMode={darkMode}
                />
              )}
            </div>
          )}

          {activeTab === 'all-requests' && permissions?.capabilities?.can_view_all_requests && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Employee</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Time</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Duration</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Reason</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Status</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {getCurrentPageData(allRequests).map((req) => (
                        <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">
                            <div>
                              <p className="font-medium">{req.employee_name}</p>
                              <p className="text-gray-500 dark:text-gray-400">{req.employee_id}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{formatDate(req.date)}</td>
                          <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                            {formatTime(req.start_time)} - {formatTime(req.end_time)}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{req.duration_hours}h</td>
                          <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 max-w-xs truncate">{req.reason}</td>
                          <td className="px-4 py-3">{getStatusBadge(req.status)}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {setSelectedRequest(req); setShowDetailModal(true);}}
                              className="p-1 text-almet-sapphire hover:bg-almet-mystic dark:hover:bg-gray-600 rounded"
                              title="View Details"
                            >
                              <Eye size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {allRequests.length > itemsPerPage && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(allRequests.length / itemsPerPage)}
                  totalItems={allRequests.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  darkMode={darkMode}
                />
              )}
            </div>
          )}

          {activeTab === 'approvals' && permissions?.capabilities?.can_approve_as_manager && (
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Employee</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Date</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Time</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Duration</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Reason</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {getCurrentPageData(pendingApprovals).map((req) => (
                        <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{req.employee_name}</td>
                          <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{formatDate(req.date)}</td>
                          <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400">
                            {formatTime(req.start_time)} - {formatTime(req.end_time)}
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-900 dark:text-white">{req.duration_hours}h</td>
                          <td className="px-4 py-3 text-xs text-gray-600 dark:text-gray-400 max-w-xs truncate">{req.reason}</td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setConfirmModal({ isOpen: true, type: 'approve', requestId: req.id })}
                                className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                                title="Approve"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={() => setConfirmModal({ isOpen: true, type: 'reject', requestId: req.id })}
                                className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                                title="Reject"
                              >
                                <X size={14} />
                              </button>
                              <button
                                onClick={() => {setSelectedRequest(req); setShowDetailModal(true);}}
                                className="p-1 text-almet-sapphire hover:bg-almet-mystic dark:hover:bg-gray-600 rounded"
                                title="View Details"
                              >
                                <Eye size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {pendingApprovals.length > itemsPerPage && (
                <Pagination
                  currentPage={currentPage}
                  totalPages={Math.ceil(pendingApprovals.length / itemsPerPage)}
                  totalItems={pendingApprovals.length}
                  itemsPerPage={itemsPerPage}
                  onPageChange={setCurrentPage}
                  darkMode={darkMode}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* New Request Modal */}
      {showNewRequestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">New Time Off Request</h3>
                <button
                  onClick={() => {setShowNewRequestModal(false); setFormErrors({}); setFormData({ date: '', start_time: '', end_time: '', reason: '' });}}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmitRequest} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                    formErrors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                {formErrors.date && <p className="mt-1 text-xs text-red-500">{formErrors.date}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      formErrors.start_time ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {formErrors.start_time && <p className="mt-1 text-xs text-red-500">{formErrors.start_time}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      formErrors.end_time ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  />
                  {formErrors.end_time && <p className="mt-1 text-xs text-red-500">{formErrors.end_time}</p>}
                </div>
              </div>

              {formData.start_time && formData.end_time && formData.start_time < formData.end_time && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Duration: <strong>{calculateDuration(formData.start_time, formData.end_time)} hours</strong>
                  </p>
                </div>
              )}

              {formErrors.duration && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-xs text-red-700 dark:text-red-300">{formErrors.duration}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.reason}
                  onChange={(e) => setFormData({...formData, reason: e.target.value})}
                  rows={4}
                  placeholder="Please provide a detailed reason for your time off request..."
                  className={`w-full px-3 py-2 text-sm border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 resize-none ${
                    formErrors.reason ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                  }`}
                />
                <div className="flex justify-between items-center mt-1">
                  {formErrors.reason && <p className="text-xs text-red-500">{formErrors.reason}</p>}
                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                    {formData.reason.length}/200
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 dark:text-gray-400">Current Balance:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{balance?.current_balance_hours}h</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {setShowNewRequestModal(false); setFormErrors({}); setFormData({ date: '', start_time: '', end_time: '', reason: '' });}}
                  className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 text-sm bg-almet-sapphire hover:bg-almet-astral text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 min-w-[100px] justify-center"
                >
                  {submitting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Submit Request'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-lg border border-gray-200 dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Request Details</h3>
                <button
                  onClick={() => {setShowDetailModal(false); setSelectedRequest(null);}}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Employee</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{selectedRequest.employee_name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Date</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{formatDate(selectedRequest.date)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Duration</p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{selectedRequest.duration_hours} hours</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Time</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">
                    {formatTime(selectedRequest.start_time)} - {formatTime(selectedRequest.end_time)}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-xs text-gray-600 dark:text-gray-400">Reason</p>
                <p className="text-sm text-gray-900 dark:text-white mt-2 leading-relaxed">{selectedRequest.reason}</p>
              </div>

              {selectedRequest.line_manager_name && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-xs text-gray-600 dark:text-gray-400">Line Manager</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white mt-1">{selectedRequest.line_manager_name}</p>
                </div>
              )}

              {selectedRequest.status === 'APPROVED' && selectedRequest.approved_by_name && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                  <p className="text-xs text-green-700 dark:text-green-300">
                    Approved by <strong>{selectedRequest.approved_by_name}</strong> on {formatDate(selectedRequest.approved_at)}
                  </p>
                </div>
              )}

              {selectedRequest.status === 'REJECTED' && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                  <p className="text-xs text-red-700 dark:text-red-300 font-medium mb-2">Rejection Reason:</p>
                  <p className="text-sm text-red-700 dark:text-red-300">{selectedRequest.rejection_reason || 'No reason provided'}</p>
                </div>
              )}

              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                <Clock size={12} className="mr-1" />
                Created {formatDate(selectedRequest.created_at)}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex justify-end">
              <button
                onClick={() => {setShowDetailModal(false); setSelectedRequest(null);}}
                className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen && confirmModal.type === 'approve'}
        onClose={() => setConfirmModal({ isOpen: false, type: '', requestId: null })}
        onConfirm={() => handleApproveRequest(confirmModal.requestId)}
        title="Approve Request"
        message="Are you sure you want to approve this time off request? The hours will be deducted from the employee's balance."
        confirmText="Approve"
        cancelText="Cancel"
        type="success"
        darkMode={darkMode}
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen && confirmModal.type === 'reject'}
        onClose={() => setConfirmModal({ isOpen: false, type: '', requestId: null })}
        onConfirm={() => {
          const reason = prompt('Please provide a rejection reason:');
          if (reason) handleRejectRequest(confirmModal.requestId, reason);
        }}
        title="Reject Request"
        message="Are you sure you want to reject this time off request? Please provide a reason when you click confirm."
        confirmText="Reject"
        cancelText="Cancel"
        type="danger"
        darkMode={darkMode}
      />

      <ConfirmationModal
        isOpen={confirmModal.isOpen && confirmModal.type === 'cancel'}
        onClose={() => setConfirmModal({ isOpen: false, type: '', requestId: null })}
        onConfirm={() => handleCancelRequest(confirmModal.requestId)}
        title="Cancel Request"
        message="Are you sure you want to cancel this request? If it was approved, the hours will be refunded to your balance."
        confirmText="Yes, Cancel"
        cancelText="No, Keep"
        type="danger"
        darkMode={darkMode}
      />
      </div>
    </DashboardLayout>
  );
};

export default TimeOffPage;