// app/handovers/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Calendar, FileText, Users, CheckCircle, AlertCircle, 
  Clock, TrendingUp, Plus, Search, Eye, X, ArrowRight,
  UserCheck, UserX, ClipboardCheck, Filter, RefreshCw
} from 'lucide-react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import handoverService from '@/services/handoverService';
import { useToast } from '@/components/common/Toast';
import Pagination from '@/components/common/Pagination';
import SearchableDropdown from '@/components/common/SearchableDropdown';
import HandoverDetailModal from '@/components/handovers/HandoverDetailModal';
import CreateHandoverModal from '@/components/handovers/CreateHandoverModal';

const HandoversDashboard = () => {
  const { theme } = useTheme();
  
  // State Management
  const [activeTab, setActiveTab] = useState('submission');
  const [myHandovers, setMyHandovers] = useState([]);
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [statistics, setStatistics] = useState({
    pending: 0,
    active: 0,
    completed: 0
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHandover, setSelectedHandover] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [handoverTypes, setHandoverTypes] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const { showSuccess, showError, showInfo } = useToast();

  // Fetch data on mount
  useEffect(() => {
    fetchInitialData();
  }, []);

  // Fetch all required data
  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [statsData, myHandoversData, pendingData, userData, typesData] = await Promise.all([
        handoverService.getStatistics(),
        handoverService.getMyHandovers(),
        handoverService.getPendingApprovals(),
        handoverService.getCurrentUser(),
        handoverService.getHandoverTypes()
      ]);
      
      setStatistics(statsData || { pending: 0, active: 0, completed: 0 });
      setMyHandovers(Array.isArray(myHandoversData) ? myHandoversData : []);
      setPendingApprovals(Array.isArray(pendingData) ? pendingData : []);
      
      if (userData && userData.user && userData.employee) {
        const processedUser = {
          ...userData.user,
          employee: userData.employee
        };
        setCurrentUser(processedUser);
      } else {
        showError('User data structure is invalid');
      }
      
      setHandoverTypes(Array.isArray(typesData) ? typesData : []);
    } catch (error) {
      showError('Error loading data');
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const refreshData = async () => {
    setRefreshing(true);
    try {
      await fetchInitialData();

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
        icon: <FileText className="w-3 h-3" />
      },
      'SIGNED_BY_HANDING_OVER': { 
        label: 'Signed by HO', 
        class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
        icon: <CheckCircle className="w-3 h-3" />
      },
      'SIGNED_BY_TAKING_OVER': { 
        label: 'Signed by TO', 
        class: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
        icon: <CheckCircle className="w-3 h-3" />
      },
      'APPROVED_BY_LINE_MANAGER': { 
        label: 'Approved by LM', 
        class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        icon: <CheckCircle className="w-3 h-3" />
      },
      'REJECTED': { 
        label: 'Rejected', 
        class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        icon: <X className="w-3 h-3" />
      },
      'NEED_CLARIFICATION': { 
        label: 'Need Clarification', 
        class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
        icon: <AlertCircle className="w-3 h-3" />
      },
      'RESUBMITTED': { 
        label: 'Resubmitted', 
        class: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
        icon: <FileText className="w-3 h-3" />
      },
      'TAKEN_OVER': { 
        label: 'Taken Over', 
        class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
        icon: <CheckCircle className="w-3 h-3" />
      },
      'TAKEN_BACK': { 
        label: 'Taken Back', 
        class: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
        icon: <CheckCircle className="w-3 h-3" />
      },
    };

    const config = statusConfig[status] || { 
      label: status, 
      class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
      icon: <Clock className="w-3 h-3" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.class}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  // Filter handovers based on search and filters
  const filterHandovers = (handoversList) => {
    let filtered = handoversList;

    if (searchTerm) {
      filtered = filtered.filter(h => 
        h.request_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.handing_over_employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.taking_over_employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        h.handover_type_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(h => h.status === statusFilter);
    }

    if (typeFilter) {
      filtered = filtered.filter(h => h.handover_type === typeFilter);
    }

    return filtered;
  };

  // Get paginated data
  const getPaginatedData = (data) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  };

  // Handle view details
  const handleViewDetails = async (handoverId) => {
    try {
      const detail = await handoverService.getHandoverDetail(handoverId);
      setSelectedHandover(detail);
      setShowDetailModal(true);
    } catch (error) {
      showError('Error loading details');
    }
  };

  // Handle create new handover
  const handleCreateHandover = () => {
    setShowCreateModal(true);
  };

  // Handle create success
  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    refreshData();
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm('');
    setStatusFilter(null);
    setTypeFilter(null);
    setCurrentPage(1);
  };

  // Status options for filter
  const statusOptions = [
    { value: 'CREATED', label: 'Created' },
    { value: 'SIGNED_BY_HANDING_OVER', label: 'Signed by HO' },
    { value: 'SIGNED_BY_TAKING_OVER', label: 'Signed by TO' },
    { value: 'APPROVED_BY_LINE_MANAGER', label: 'Approved by LM' },
    { value: 'REJECTED', label: 'Rejected' },
    { value: 'NEED_CLARIFICATION', label: 'Need Clarification' },
    { value: 'RESUBMITTED', label: 'Resubmitted' },
    { value: 'TAKEN_OVER', label: 'Taken Over' },
    { value: 'TAKEN_BACK', label: 'Taken Back' },
  ];

  // Render Statistics Cards
  const StatisticsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {/* Pending Card */}
      <div className="bg-gradient-to-br from-yellow-400 to-yellow-500 dark:from-yellow-600 dark:to-yellow-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-yellow-100 text-sm font-medium mb-1">Pending Approval</p>
            <p className="text-3xl font-bold">{statistics.pending}</p>
          </div>
          <div className="bg-white/20 p-3 rounded-lg">
            <Clock className="w-8 h-8" />
          </div>
        </div>
        <div className="flex items-center text-sm text-yellow-100">
          <TrendingUp className="w-4 h-4 mr-1" />
          Awaiting action
        </div>
      </div>

      {/* Active Card */}
      <div className="bg-gradient-to-br from-almet-sapphire to-almet-astral dark:from-almet-san-juan dark:to-almet-sapphire rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1">Active Handovers</p>
            <p className="text-3xl font-bold">{statistics.active}</p>
          </div>
          <div className="bg-white/20 p-3 rounded-lg">
            <Users className="w-8 h-8" />
          </div>
        </div>
        <div className="flex items-center text-sm text-blue-100">
          <TrendingUp className="w-4 h-4 mr-1" />
          In progress
        </div>
      </div>

      {/* Completed Card */}
      <div className="bg-gradient-to-br from-green-400 to-green-500 dark:from-green-600 dark:to-green-700 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-green-100 text-sm font-medium mb-1">Completed</p>
            <p className="text-3xl font-bold">{statistics.completed}</p>
          </div>
          <div className="bg-white/20 p-3 rounded-lg">
            <CheckCircle className="w-8 h-8" />
          </div>
        </div>
        <div className="flex items-center text-sm text-green-100">
          <CheckCircle className="w-4 h-4 mr-1" />
          Finished
        </div>
      </div>
    </div>
  );

  // Render Handover Table
  const HandoverTable = ({ handovers }) => {
    const filteredHandovers = filterHandovers(handovers);
    const paginatedHandovers = getPaginatedData(filteredHandovers);
    const totalPages = Math.ceil(filteredHandovers.length / itemsPerPage);

    if (filteredHandovers.length === 0) {
      return (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400 text-lg">No handovers found</p>
          {(searchTerm || statusFilter || typeFilter) && (
            <button
              onClick={resetFilters}
              className="mt-4 text-almet-sapphire hover:text-almet-cloud-burst dark:text-almet-steel-blue text-sm font-medium"
            >
              Clear filters
            </button>
          )}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Handing Over
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Taking Over
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Period
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {paginatedHandovers.map((handover) => (
                <tr key={handover.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                    #{handover.request_id?.substring(0, 10)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {handover.handover_type_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {handover.handing_over_employee_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {handover.handing_over_position}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                        <UserX className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {handover.taking_over_employee_name}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>
                        {new Date(handover.start_date).toLocaleDateString()} - {new Date(handover.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(handover.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(handover.id)}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredHandovers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    );
  };

  // Render Tabs
  const Tabs = () => (
    <div className="flex space-x-2 bg-white dark:bg-gray-900 rounded-xl p-2 shadow-sm mb-6">
      <button
        onClick={() => {
          setActiveTab('submission');
          resetFilters();
        }}
        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
          activeTab === 'submission'
            ? 'bg-almet-sapphire text-white shadow-md'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <FileText className="w-5 h-5" />
          New Handover
        </div>
      </button>
      <button
        onClick={() => {
          setActiveTab('my-requests');
          resetFilters();
        }}
        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
          activeTab === 'my-requests'
            ? 'bg-almet-sapphire text-white shadow-md'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <ClipboardCheck className="w-5 h-5" />
          My Handovers
        </div>
      </button>
      <button
        onClick={() => {
          setActiveTab('approval');
          resetFilters();
        }}
        className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
          activeTab === 'approval'
            ? 'bg-almet-sapphire text-white shadow-md'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        <div className="flex items-center justify-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Approval Center
        </div>
      </button>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-almet-sapphire mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Handover & Takeover System
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Manage work handovers efficiently
              </p>
            </div>
     
          </div>
        </div>

        {/* Statistics Cards */}
        <StatisticsCards />

        {/* Tabs */}
        <Tabs />

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm">
          {/* Submission Tab */}
          {activeTab === 'submission' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Create New Handover
                </h2>
                <button
                  onClick={handleCreateHandover}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-colors font-medium shadow-sm"
                >
                  <Plus className="w-5 h-5" />
                  Create Handover
                </button>
              </div>

              {/* Recent Handovers Preview */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Recent Handovers
                </h3>
                {myHandovers.slice(0, 5).length > 0 ? (
                  <div className="space-y-3">
                    {myHandovers.slice(0, 5).map((handover) => (
                      <div
                        key={handover.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                        onClick={() => handleViewDetails(handover.id)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-almet-mystic dark:bg-almet-cloud-burst/20 rounded-lg flex items-center justify-center">
                            <FileText className="w-6 h-6 text-almet-sapphire dark:text-almet-steel-blue" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {handover.request_id}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {handover.handing_over_employee_name} → {handover.taking_over_employee_name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(handover.status)}
                          <ArrowRight className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p>No recent handovers</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* My Requests Tab */}
          {activeTab === 'my-requests' && (
            <div className="p-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  My Handovers
                </h2>
                
                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                  {/* Search */}
                  <div className="relative flex-1 lg:flex-initial">
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search handovers..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent w-full lg:w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    />
                  </div>

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                    {(statusFilter || typeFilter) && (
                      <span className="ml-1 px-2 py-0.5 bg-almet-sapphire text-white rounded-full text-xs">
                        {[statusFilter, typeFilter].filter(Boolean).length}
                      </span>
                    )}
                  </button>

                  {/* Reset Filters */}
                  {(searchTerm || statusFilter || typeFilter) && (
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Filter Panel */}
              {showFilters && (
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Status Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Filter by Status
                      </label>
                      <SearchableDropdown
                        options={statusOptions}
                        value={statusFilter}
                        onChange={(value) => {
                          setStatusFilter(value);
                          setCurrentPage(1);
                        }}
                        placeholder="Select status..."
                        searchPlaceholder="Search status..."
                        allowUncheck={true}
                      />
                    </div>

                    {/* Type Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Filter by Type
                      </label>
                      <SearchableDropdown
                        options={handoverTypes.map(type => ({
                          value: type.id,
                          label: type.name
                        }))}
                        value={typeFilter}
                        onChange={(value) => {
                          setTypeFilter(value);
                          setCurrentPage(1);
                        }}
                        placeholder="Select type..."
                        searchPlaceholder="Search type..."
                        allowUncheck={true}
                      />
                    </div>
                  </div>
                </div>
              )}

              <HandoverTable handovers={myHandovers} />
            </div>
          )}

          {/* Approval Tab */}
          {activeTab === 'approval' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Pending Approvals
                </h2>
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <Clock className="w-5 h-5" />
                  <span className="font-medium">{pendingApprovals.length} Pending</span>
                </div>
              </div>

              <HandoverTable handovers={pendingApprovals} />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showDetailModal && selectedHandover && (
        <HandoverDetailModal
          handover={selectedHandover}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedHandover(null);
          }}
          onUpdate={refreshData}
          currentUser={currentUser}
        />
      )}

      {showCreateModal && (
        <CreateHandoverModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
          currentUser={currentUser}
        />
      )}
    </DashboardLayout>
  );
};

export default HandoversDashboard;