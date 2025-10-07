"use client";
import { useState, useEffect } from 'react';
import { Plane, Car, Hotel, Plus, Trash2, Send, CheckCircle, XCircle, Clock, MapPin, Calendar, DollarSign, Settings, Lock, Download, FileText, Users, Edit, X, Save } from 'lucide-react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { useToast } from "@/components/common/Toast";
import SearchableDropdown from "@/components/common/SearchableDropdown";
import { BusinessTripService, BusinessTripHelpers } from '@/services/businessTripService';
import { useRouter } from 'next/navigation';

export default function BusinessTripPage() {
  const { darkMode } = useTheme();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('request');
  const [requester, setRequester] = useState('for_me');
  const [loading, setLoading] = useState(false);
  
  // User & Permissions
  const [userPermissions, setUserPermissions] = useState({ is_admin: false, permissions: [] });
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  
  // Dashboard Stats
  const [dashboardStats, setDashboardStats] = useState({
    pending_requests: 0,
    approved_trips: 0,
    total_days_this_year: 0,
    upcoming_trips: 0
  });
  
  // Configuration Options
  const [travelTypes, setTravelTypes] = useState([]);
  const [transportTypes, setTransportTypes] = useState([]);
  const [tripPurposes, setTripPurposes] = useState([]);
  const [hrRepresentatives, setHrRepresentatives] = useState([]);
  const [financeApprovers, setFinanceApprovers] = useState([]);
  const [userDefaults, setUserDefaults] = useState(null);
  
  // Trip Requests
  const [myRequests, setMyRequests] = useState([]);
  const [allRequests, setAllRequests] = useState([]);
  
  // Pending Approvals
  const [pendingApprovals, setPendingApprovals] = useState({
    line_manager_requests: [],
    finance_requests: [],
    hr_requests: [],
    total_pending: 0
  });
  
  // Employee Search
  const [employeeSearchResults, setEmployeeSearchResults] = useState([]);
  
  // Form Data
  const [formData, setFormData] = useState({
    requester_type: 'for_me',
    employee_id: null,
    employee_manual: null,
    employeeName: '',
    businessFunction: '',
    department: '',
    unit: '',
    jobFunction: '',
    phoneNumber: '',
    lineManager: '',
    travel_type_id: '',
    transport_type_id: '',
    purpose_id: '',
    start_date: '',
    end_date: '',
    comment: '',
    finance_approver_id: null,
    hr_representative_id: null
  });
  
  const [schedules, setSchedules] = useState([
    { id: 1, date: '', from_location: '', to_location: '', notes: '' }
  ]);
  
  const [hotels, setHotels] = useState([
    { id: 1, hotel_name: '', check_in_date: '', check_out_date: '', location: '', notes: '' }
  ]);
  
  // Approval Modals
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approvalAmount, setApprovalAmount] = useState('');
  const [approvalNote, setApprovalNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    setLoading(true);
    try {
      const email = BusinessTripService.getCurrentUserEmail();
      setCurrentUserEmail(email);
      
      await Promise.all([
        fetchUserPermissions(),
        fetchDashboard(),
        fetchAllOptions(),
        fetchEmployees()
      ]);
    } catch (error) {
      console.error('Initialization error:', error);
      showError('Failed to load initial data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserPermissions = async () => {
    try {
      const data = await BusinessTripService.getMyPermissions();
      setUserPermissions(data);
    } catch (error) {
      console.error('Permissions fetch error:', error);
    }
  };

  const fetchDashboard = async () => {
    try {
      const data = await BusinessTripService.getDashboard();
      setDashboardStats(data);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    }
  };

  const fetchAllOptions = async () => {
    try {
      const data = await BusinessTripService.getAllOptions();
      setTravelTypes(data.travel_types || []);
      setTransportTypes(data.transport_types || []);
      setTripPurposes(data.trip_purposes || []);
      setUserDefaults(data.user_defaults);
      
      if (data.travel_types?.length > 0) {
        setFormData(prev => ({ ...prev, travel_type_id: data.travel_types[0].id }));
      }
      if (data.transport_types?.length > 0) {
        setFormData(prev => ({ ...prev, transport_type_id: data.transport_types[0].id }));
      }
      if (data.trip_purposes?.length > 0) {
        setFormData(prev => ({ ...prev, purpose_id: data.trip_purposes[0].id }));
      }
    } catch (error) {
      console.error('Options fetch error:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await BusinessTripService.searchEmployees();
      setEmployeeSearchResults(data.results || []);
    } catch (error) {
      console.error('Employee search error:', error);
    }
  };

  const fetchMyRequests = async () => {
    try {
      const data = await BusinessTripService.getMyTripRequests();
      setMyRequests(data.requests || []);
    } catch (error) {
      console.error('My requests fetch error:', error);
    }
  };

  const fetchAllRequests = async () => {
    try {
      const data = await BusinessTripService.getAllTripRequests();
      setAllRequests(data.requests || []);
    } catch (error) {
      console.error('All requests fetch error:', error);
    }
  };

  const fetchPendingApprovals = async () => {
    try {
      const data = await BusinessTripService.getPendingApprovals();
      setPendingApprovals(data);
    } catch (error) {
      console.error('Pending approvals fetch error:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'request') {
      fetchMyRequests();
    } else if (activeTab === 'approval') {
      fetchPendingApprovals();
    } else if (activeTab === 'all') {
      fetchAllRequests();
    }
  }, [activeTab]);

  useEffect(() => {
    const loadCurrentUserData = async () => {
      if (requester === 'for_me' && userDefaults) {
        setFormData(prev => ({
          ...prev,
          requester_type: 'for_me',
          employee_id: null,
          employee_manual: null,
          employeeName: userDefaults.employee_name || '',
          businessFunction: userDefaults.business_function || '',
          department: userDefaults.department || '',
          unit: userDefaults.unit || '',
          jobFunction: userDefaults.job_function || '',
          phoneNumber: userDefaults.phone_number || '',
          lineManager: userDefaults.line_manager?.name || ''
        }));
      } else if (requester === 'for_my_employee') {
        setFormData(prev => ({
          ...prev,
          requester_type: 'for_my_employee',
          employee_id: null,
          employee_manual: null,
          employeeName: '',
          businessFunction: '',
          department: '',
          unit: '',
          jobFunction: '',
          phoneNumber: '',
          lineManager: ''
        }));
      }
    };
    
    loadCurrentUserData();
  }, [requester, userDefaults]);

  const handleAddSchedule = () => {
    setSchedules([...schedules, { id: Date.now(), date: '', from_location: '', to_location: '', notes: '' }]);
  };

  const handleRemoveSchedule = (id) => {
    if (schedules.length > 1) {
      setSchedules(schedules.filter(s => s.id !== id));
    }
  };

  const handleScheduleChange = (id, field, value) => {
    setSchedules(schedules.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleAddHotel = () => {
    setHotels([...hotels, { id: Date.now(), hotel_name: '', check_in_date: '', check_out_date: '', location: '', notes: '' }]);
  };

  const handleRemoveHotel = (id) => {
    if (hotels.length > 1) {
      setHotels(hotels.filter(h => h.id !== id));
    }
  };

  const handleHotelChange = (id, field, value) => {
    setHotels(hotels.map(h => h.id === id ? { ...h, [field]: value } : h));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const scheduleErrors = BusinessTripHelpers.validateScheduleDates(schedules);
    if (scheduleErrors.length > 0) {
      showError(scheduleErrors[0]);
      return;
    }

    const hotelErrors = BusinessTripHelpers.validateHotelDates(hotels);
    if (hotelErrors.length > 0) {
      showError(hotelErrors[0]);
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        requester_type: formData.requester_type,
        travel_type_id: parseInt(formData.travel_type_id),
        transport_type_id: parseInt(formData.transport_type_id),
        purpose_id: parseInt(formData.purpose_id),
        start_date: formData.start_date,
        end_date: formData.end_date,
        comment: formData.comment || '',
        schedules: schedules.map(({ id, ...rest }) => rest),
        hotels: hotels.filter(h => h.hotel_name).map(({ id, ...rest }) => rest)
      };

      if (formData.requester_type === 'for_my_employee') {
        if (formData.employee_id) {
          requestData.employee_id = formData.employee_id;
        } else if (formData.employeeName) {
          requestData.employee_manual = {
            name: formData.employeeName,
            phone: formData.phoneNumber,
            department: formData.department,
            business_function: formData.businessFunction,
            unit: formData.unit,
            job_function: formData.jobFunction
          };
        }
      }

      if (formData.finance_approver_id) {
        requestData.finance_approver_id = formData.finance_approver_id;
      }
      if (formData.hr_representative_id) {
        requestData.hr_representative_id = formData.hr_representative_id;
      }

      await BusinessTripService.createTripRequest(requestData);
      showSuccess('Trip request submitted successfully');
      
      setFormData(prev => ({
        ...prev,
        start_date: '',
        end_date: '',
        comment: ''
      }));
      setSchedules([{ id: 1, date: '', from_location: '', to_location: '', notes: '' }]);
      setHotels([{ id: 1, hotel_name: '', check_in_date: '', check_out_date: '', location: '', notes: '' }]);
      
      fetchDashboard();
      fetchMyRequests();
    } catch (error) {
      console.error('Submit error:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.detail || 'Failed to submit request';
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    
    if (selectedRequest.status === 'PENDING_FINANCE' && !approvalAmount) {
      showError('Please enter the trip amount');
      return;
    }

    setLoading(true);
    try {
      const data = {
        action: 'approve',
        comment: approvalNote || undefined,
        amount: approvalAmount ? parseFloat(approvalAmount) : undefined
      };

      await BusinessTripService.approveRejectRequest(selectedRequest.id, data);
      showSuccess('Request approved successfully');
      setShowApprovalModal(false);
      setApprovalAmount('');
      setApprovalNote('');
      setSelectedRequest(null);
      fetchPendingApprovals();
    } catch (error) {
      console.error('Approval error:', error);
      showError(error.response?.data?.error || 'Failed to approve');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      showError('Please provide a reason for rejection');
      return;
    }

    setLoading(true);
    try {
      await BusinessTripService.approveRejectRequest(selectedRequest.id, {
        action: 'reject',
        reason: rejectionReason
      });
      showSuccess('Request rejected');
      setShowRejectionModal(false);
      setRejectionReason('');
      setSelectedRequest(null);
      fetchPendingApprovals();
    } catch (error) {
      console.error('Rejection error:', error);
      showError('Failed to reject');
    } finally {
      setLoading(false);
    }
  };

  const handleExportMyTrips = async () => {
    try {
      const blob = await BusinessTripService.exportMyTrips();
      BusinessTripHelpers.downloadBlobFile(blob, `my_trips_${new Date().toISOString().split('T')[0]}.xlsx`);
      showSuccess('Export completed');
    } catch (error) {
      console.error('Export error:', error);
      showError('Export failed');
    }
  };

  const handleExportAllTrips = async () => {
    try {
      const blob = await BusinessTripService.exportAllTrips();
      BusinessTripHelpers.downloadBlobFile(blob, `all_trips_${new Date().toISOString().split('T')[0]}.xlsx`);
      showSuccess('Export completed');
    } catch (error) {
      console.error('Export error:', error);
      showError('Export failed');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/30 dark:border-almet-comet/30 p-3 hover:border-almet-sapphire/50 dark:hover:border-almet-astral/50 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">{title}</p>
          <p className={`text-xl font-semibold ${color}`}>{value || 0}</p>
        </div>
        <div className={`p-2 rounded-lg ${color.replace('text-', 'bg-')}/10`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
    </div>
  );

  if (loading && !dashboardStats) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-almet-sapphire border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
        
        {/* Header */}
        <div className="mb-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-almet-cloud-burst dark:text-white">Business Trip Management</h1>
            <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-1">Manage business trip requests and approvals</p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {userPermissions.is_admin && (
              <>
                <button
                  onClick={() => router.push('/requests/business-trip/settings')}
                  className="flex items-center gap-1.5 bg-almet-sapphire hover:bg-almet-cloud-burst text-white px-3 py-1.5 rounded-md transition-all shadow-sm text-xs font-medium"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Settings
                </button>
                
                <div className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700/50 px-2.5 py-1.5 rounded-md">
                  <Lock className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Admin Access</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-5 border-b border-almet-mystic dark:border-almet-comet">
          <div className="flex space-x-8">
            {[
              { key: 'request', label: 'Request Submission', icon: FileText },
              { key: 'approval', label: 'Approval', icon: CheckCircle },
              { key: 'all', label: 'All Requests', icon: Calendar }
            ].map(tab => (
              <button 
                key={tab.key} 
                onClick={() => setActiveTab(tab.key)} 
                className={`pb-3 px-1 border-b-2 font-medium text-sm transition-all duration-200 flex items-center gap-2 ${
                  activeTab === tab.key 
                    ? 'border-almet-sapphire text-almet-sapphire dark:text-almet-astral' 
                    : 'border-transparent text-almet-waterloo hover:text-almet-cloud-burst dark:text-almet-bali-hai dark:hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Request Submission Tab */}
        {activeTab === 'request' && (
          <div className="space-y-5">
            
            {/* Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatCard title="Pending Requests" value={dashboardStats.pending_requests} icon={Clock} color="text-orange-600" />
              <StatCard title="Approved Trips" value={dashboardStats.approved_trips} icon={CheckCircle} color="text-green-600" />
              <StatCard title="Total Days This Year" value={dashboardStats.total_days_this_year} icon={Calendar} color="text-almet-sapphire" />
              <StatCard title="Upcoming Trips" value={dashboardStats.upcoming_trips} icon={Plane} color="text-almet-astral" />
            </div>

            {/* Request Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet shadow-sm">
              <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4">
                <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white">New Business Trip Request</h2>
              </div>

              <form onSubmit={handleSubmit} className="p-5">
                <div className="grid lg:grid-cols-2 gap-6">
                  
                  {/* Employee Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Users className="w-4 h-4 text-almet-sapphire" />
                      <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">Employee Information</h3>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Requester</label>
                      <select 
                        value={requester} 
                        onChange={(e) => setRequester(e.target.value)} 
                        className="w-full px-3 py-2.5 outline-0 text-sm border border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire focus:border-transparent dark:bg-gray-700 dark:text-white transition-all"
                      >
                        <option value="for_me">For Me</option>
                        <option value="for_my_employee">For My Employee</option>
                      </select>
                    </div>

                    {requester === 'for_my_employee' && (
                      <div>
                        <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Search Employee</label>
                        <SearchableDropdown
                          options={employeeSearchResults.map(emp => ({ 
                            value: emp.id, 
                            label: `${emp.name} (${emp.employee_id})`, 
                            ...emp 
                          }))}
                          value={formData.employee_id}
                          onChange={(value) => {
                            const selectedEmployee = employeeSearchResults.find(emp => emp.id === value);
                            if (value === null) {
                              setFormData(prev => ({
                                ...prev,
                                employee_id: null,
                                employeeName: '',
                                businessFunction: '',
                                department: '',
                                unit: '',
                                jobFunction: '',
                                phoneNumber: '',
                                lineManager: ''
                              }));
                            } else if (selectedEmployee) {
                              setFormData(prev => ({
                                ...prev,
                                employee_id: value,
                                employeeName: selectedEmployee.name,
                                businessFunction: selectedEmployee.business_function_name || '',
                                department: selectedEmployee.department_name || '',
                                unit: selectedEmployee.unit_name || '',
                                jobFunction: selectedEmployee.job_function_name || '',
                                phoneNumber: selectedEmployee.phone || '',
                                lineManager: selectedEmployee.line_manager_name || ''
                              }));
                            }
                          }}
                          placeholder="Select employee"
                          allowUncheck={true}
                          searchPlaceholder="Search..."
                          darkMode={darkMode}
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Name</label>
                        <input 
                          type="text" 
                          value={formData.employeeName} 
                          onChange={(e) => setFormData(prev => ({...prev, employeeName: e.target.value}))} 
                          disabled={requester === 'for_me'} 
                          className="w-full px-3 py-2.5 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-almet-mystic/30 dark:disabled:bg-gray-600" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Phone</label>
                        <input 
                          type="tel" 
                          value={formData.phoneNumber} 
                          onChange={(e) => setFormData(prev => ({...prev, phoneNumber: e.target.value}))} 
                          disabled={requester === 'for_me'} 
                          className="w-full px-3 py-2.5 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-almet-mystic/30 dark:disabled:bg-gray-600" 
                        />
                      </div>
                    </div>

                    {['businessFunction', 'department', 'unit', 'jobFunction'].map(field => (
                      <div key={field}>
                        <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                          {field === 'businessFunction' ? 'Business Function' : 
                           field === 'department' ? 'Department' : 
                           field === 'unit' ? 'Unit' : 'Job Function'}
                        </label>
                        <input 
                          type="text" 
                          value={formData[field]} 
                          onChange={(e) => setFormData(prev => ({...prev, [field]: e.target.value}))} 
                          disabled={requester === 'for_me'} 
                          className="w-full px-3 py-2.5 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-almet-mystic/30 dark:disabled:bg-gray-600" 
                        />
                      </div>
                    ))}

                    <div>
                      <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Line Manager</label>
                      <input 
                        type="text" 
                        value={formData.lineManager} 
                        onChange={(e) => setFormData(prev => ({...prev, lineManager: e.target.value}))} 
                        disabled={requester === 'for_me'} 
                        className="w-full px-3 py-2.5 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-almet-mystic/30 dark:disabled:bg-gray-600" 
                      />
                    </div>
                  </div>

                  {/* Travel Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Plane className="w-4 h-4 text-almet-sapphire" />
                      <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">Travel Information</h3>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Type of Travel</label>
                      <SearchableDropdown 
                        options={travelTypes.map(type => ({ value: type.id, label: type.name }))} 
                        value={formData.travel_type_id} 
                        onChange={(value) => setFormData(prev => ({...prev, travel_type_id: value}))} 
                        placeholder="Select travel type" 
                        darkMode={darkMode} 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Transport Type</label>
                      <SearchableDropdown 
                        options={transportTypes.map(type => ({ value: type.id, label: type.name }))} 
                        value={formData.transport_type_id} 
                        onChange={(value) => setFormData(prev => ({...prev, transport_type_id: value}))} 
                        placeholder="Select transport type" 
                        darkMode={darkMode} 
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Purpose</label>
                      <SearchableDropdown 
                        options={tripPurposes.map(purpose => ({ value: purpose.id, label: purpose.name }))} 
                        value={formData.purpose_id} 
                        onChange={(value) => setFormData(prev => ({...prev, purpose_id: value}))} 
                        placeholder="Select purpose" 
                        darkMode={darkMode} 
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Start Date</label>
                        <input 
                          type="date" 
                          value={formData.start_date} 
                          onChange={(e) => setFormData(prev => ({...prev, start_date: e.target.value}))}
                          min={new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2.5 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire focus:border-transparent dark:bg-gray-700 dark:text-white"
                          required 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">End Date</label>
                        <input 
                          type="date" 
                          value={formData.end_date} 
                          onChange={(e) => setFormData(prev => ({...prev, end_date: e.target.value}))}
                          min={formData.start_date || new Date().toISOString().split('T')[0]}
                          className="w-full px-3 py-2.5 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire focus:border-transparent dark:bg-gray-700 dark:text-white"
                          required 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Comment (Optional)</label>
                      <textarea 
                        value={formData.comment} 
                        onChange={(e) => setFormData(prev => ({...prev, comment: e.target.value}))} 
                        rows={3} 
                        placeholder="Add any additional notes..."
                        className="w-full px-3 py-2.5 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire focus:border-transparent dark:bg-gray-700 dark:text-white resize-none" 
                      />
                    </div>
                  </div>
                </div>

                {/* Schedule Details */}
                <div className="mt-6 pt-6 border-t border-almet-mystic/30 dark:border-almet-comet/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-almet-sapphire" />
                      <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">Schedule Details</h3>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSchedule}
                      className="px-3 py-1.5 text-xs bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Schedule
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {schedules.map((schedule) => (
                      <div key={schedule.id} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end p-3 bg-almet-mystic/10 dark:bg-gray-900/20 rounded-lg border border-almet-mystic/30 dark:border-almet-comet/30">
                        <div>
                          <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Date *</label>
                          <input
                            type="date"
                            value={schedule.date}
                            onChange={(e) => handleScheduleChange(schedule.id, 'date', e.target.value)}
                            className="w-full px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">From *</label>
                          <input
                            type="text"
                            value={schedule.from_location}
                            onChange={(e) => handleScheduleChange(schedule.id, 'from_location', e.target.value)}
                            placeholder="Location"
                            className="w-full px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">To *</label>
                          <input
                            type="text"
                            value={schedule.to_location}
                            onChange={(e) => handleScheduleChange(schedule.id, 'to_location', e.target.value)}
                            placeholder="Location"
                            className="w-full px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Notes</label>
                          <input
                            type="text"
                            value={schedule.notes}
                            onChange={(e) => handleScheduleChange(schedule.id, 'notes', e.target.value)}
                            placeholder="Optional"
                            className="w-full px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          {schedules.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSchedule(schedule.id)}
                              className="px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hotel Details */}
                <div className="mt-6 pt-6 border-t border-almet-mystic/30 dark:border-almet-comet/30">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Hotel className="w-4 h-4 text-almet-sapphire" />
                      <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">Hotel Details (Optional)</h3>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddHotel}
                      className="px-3 py-1.5 text-xs bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Hotel
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {hotels.map((hotel) => (
                      <div key={hotel.id} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end p-3 bg-almet-mystic/10 dark:bg-gray-900/20 rounded-lg border border-almet-mystic/30 dark:border-almet-comet/30">
                        <div>
                          <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Hotel Name</label>
                          <input
                            type="text"
                            value={hotel.hotel_name}
                            onChange={(e) => handleHotelChange(hotel.id, 'hotel_name', e.target.value)}
                            placeholder="Hotel name"
                            className="w-full px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Check-in</label>
                          <input
                            type="date"
                            value={hotel.check_in_date}
                            onChange={(e) => handleHotelChange(hotel.id, 'check_in_date', e.target.value)}
                            className="w-full px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Check-out</label>
                          <input
                            type="date"
                            value={hotel.check_out_date}
                            onChange={(e) => handleHotelChange(hotel.id, 'check_out_date', e.target.value)}
                            className="w-full px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Location</label>
                          <input
                            type="text"
                            value={hotel.location}
                            onChange={(e) => handleHotelChange(hotel.id, 'location', e.target.value)}
                            placeholder="City/Area"
                            className="w-full px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Notes</label>
                          <input
                            type="text"
                            value={hotel.notes}
                            onChange={(e) => handleHotelChange(hotel.id, 'notes', e.target.value)}
                            placeholder="Optional"
                            className="w-full px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          {hotels.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveHotel(hotel.id)}
                              className="px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-almet-mystic/30 dark:border-almet-comet/30">
                  <button 
                    type="button" 
                    onClick={() => {
                      setFormData(prev => ({ ...prev, start_date: '', end_date: '', comment: '' }));
                      setSchedules([{ id: 1, date: '', from_location: '', to_location: '', notes: '' }]);
                      setHotels([{ id: 1, hotel_name: '', check_in_date: '', check_out_date: '', location: '', notes: '' }]);
                    }}
                    className="px-5 py-2.5 text-sm border border-almet-bali-hai/40 dark:border-almet-comet rounded-lg text-almet-cloud-burst dark:text-white hover:bg-almet-mystic/30 dark:hover:bg-gray-700 transition-all"
                  >
                    Clear
                  </button>
                  <button 
                    type="submit"
                    disabled={loading || !formData.start_date || !formData.end_date || !formData.travel_type_id || !formData.transport_type_id || !formData.purpose_id} 
                    className="px-6 py-2.5 text-sm bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* My Requests List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet shadow-sm">
              <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white">My Requests</h2>
                <button 
                  onClick={handleExportMyTrips} 
                  className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3 h-3" />
                  Export
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-almet-mystic/30 dark:divide-almet-comet">
                  <thead className="bg-almet-mystic/50 dark:bg-gray-700/50">
                    <tr>
                      {['Request ID', 'Type', 'Destination', 'Start Date', 'End Date', 'Days', 'Status'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-almet-comet dark:text-almet-bali-hai uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-almet-mystic/20 dark:divide-almet-comet/20">
                    {myRequests.map(request => (
                      <tr key={request.id} className="hover:bg-almet-mystic/20 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-3 text-xs font-medium text-almet-cloud-burst dark:text-white">{request.request_id}</td>
                        <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{request.travel_type_name}</td>
                        <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">
                          {request.schedules?.[0]?.to_location || '-'}
                        </td>
                        <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{request.start_date}</td>
                        <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{request.end_date}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-almet-cloud-burst dark:text-white">{request.number_of_days}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            request.status === 'APPROVED' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                            request.status.includes('PENDING') ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                            request.status.includes('REJECTED') ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                            'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                          }`}>
                            {request.status_display}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {myRequests.length === 0 && (
                      <tr>
                        <td colSpan="7" className="px-4 py-12 text-center">
                          <FileText className="w-10 h-10 text-almet-waterloo/30 dark:text-almet-bali-hai/30 mx-auto mb-3" />
                          <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai">No requests found</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Approval Tab */}
        {activeTab === 'approval' && (
          <div className="space-y-4">
            {userPermissions.is_admin && (
              <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 dark:border-purple-600 rounded-r-lg p-4">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-200">Admin Mode Active</h3>
                    <p className="text-xs text-purple-800 dark:text-purple-300 mt-1">
                      You can approve/reject requests as Line Manager, Finance, and HR.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet shadow-sm">
              <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white">Pending Approvals</h2>
                <span className="bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-3 py-1 rounded-full text-xs font-semibold">
                  {pendingApprovals.total_pending} Pending
                </span>
              </div>
              
              <div className="p-5 space-y-5">
                {/* Line Manager Requests */}
                {pendingApprovals.line_manager_requests?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-almet-sapphire" />
                      Line Manager Approvals
                    </h3>
                    <div className="space-y-3">
                      {pendingApprovals.line_manager_requests.map(request => (
                        <div key={request.id} className="border border-almet-mystic/40 dark:border-almet-comet rounded-lg p-4 hover:border-almet-sapphire/50 dark:hover:border-almet-astral/50 transition-all">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">{request.employee_name}</h4>
                              <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-1">
                                {request.travel_type_name} • {request.transport_type_name} • {request.start_date} to {request.end_date} • <strong>{request.number_of_days} days</strong>
                              </p>
                              {request.comment && (
                                <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-2 italic">"{request.comment}"</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowApprovalModal(true);
                                }}
                                className="px-4 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-1.5 font-medium shadow-sm"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Approve
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowRejectionModal(true);
                                }}
                                className="px-4 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-1.5 font-medium shadow-sm"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                        {/* Finance Requests */}
                {pendingApprovals.finance_requests?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      Finance Approvals
                    </h3>
                    <div className="space-y-3">
                      {pendingApprovals.finance_requests.map(request => (
                        <div key={request.id} className="border border-green-200/60 dark:border-green-800/40 rounded-lg p-4 bg-green-50/30 dark:bg-green-900/10 hover:border-green-300 dark:hover:border-green-700 transition-all">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">{request.employee_name}</h4>
                                <span className="text-xs bg-green-100 dark:bg-green-800/50 px-2 py-0.5 rounded font-medium text-green-700 dark:text-green-300">Finance Review</span>
                              </div>
                              <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                                {request.travel_type_name} • {request.transport_type_name} • {request.start_date} to {request.end_date} • <strong>{request.number_of_days} days</strong>
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowApprovalModal(true);
                                }}
                                className="px-4 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-1.5 font-medium shadow-sm"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Approve
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowRejectionModal(true);
                                }}
                                className="px-4 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-1.5 font-medium shadow-sm"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* HR Requests */}
                {pendingApprovals.hr_requests?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-almet-astral" />
                      HR Approvals
                    </h3>
                    <div className="space-y-3">
                      {pendingApprovals.hr_requests.map(request => (
                        <div key={request.id} className="border border-blue-200/60 dark:border-blue-800/40 rounded-lg p-4 bg-blue-50/30 dark:bg-blue-900/10 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">{request.employee_name}</h4>
                                <span className="text-xs bg-blue-100 dark:bg-blue-800/50 px-2 py-0.5 rounded font-medium text-blue-700 dark:text-blue-300">HR Review</span>
                              </div>
                              <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                                {request.travel_type_name} • {request.start_date} to {request.end_date} • <strong>{request.number_of_days} days</strong>
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowApprovalModal(true);
                                }}
                                className="px-4 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-1.5 font-medium shadow-sm"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Approve
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setShowRejectionModal(true);
                                }}
                                className="px-4 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-1.5 font-medium shadow-sm"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {pendingApprovals.total_pending === 0 && (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 dark:bg-green-900/20 mb-4">
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-sm font-medium text-almet-waterloo dark:text-almet-bali-hai">No pending approval requests</p>
                    <p className="text-xs text-almet-waterloo/70 dark:text-almet-bali-hai/70 mt-1">All requests have been processed</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* All Requests Tab */}
        {activeTab === 'all' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet shadow-sm">
            <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white">All Requests</h2>
              {userPermissions.is_admin && (
                <button 
                  onClick={handleExportAllTrips} 
                  className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3 h-3" />
                  Export All
                </button>
              )}
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-almet-mystic/30 dark:divide-almet-comet">
                <thead className="bg-almet-mystic/50 dark:bg-gray-700/50">
                  <tr>
                    {['Request ID', 'Employee', 'Department', 'Type', 'Destination', 'Start', 'End', 'Days', 'Status', 'Amount'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-almet-comet dark:text-almet-bali-hai uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-almet-mystic/20 dark:divide-almet-comet/20">
                  {allRequests.map(request => (
                    <tr key={request.id} className="hover:bg-almet-mystic/20 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 text-xs font-medium text-almet-cloud-burst dark:text-white">{request.request_id}</td>
                      <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{request.employee_name}</td>
                      <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{request.department_name}</td>
                      <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{request.travel_type_name}</td>
                      <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">
                        {request.schedules?.[0]?.to_location || '-'}
                      </td>
                      <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{request.start_date}</td>
                      <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{request.end_date}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-almet-cloud-burst dark:text-white">{request.number_of_days}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          request.status === 'APPROVED' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                          request.status.includes('PENDING') ? 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                          request.status.includes('REJECTED') ? 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                          'bg-gray-50 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300'
                        }`}>
                          {request.status_display}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">
                        {request.finance_amount ? `${request.finance_amount} AZN` : '-'}
                      </td>
                    </tr>
                  ))}
                  {allRequests.length === 0 && (
                    <tr>
                      <td colSpan="10" className="px-4 py-12 text-center">
                        <FileText className="w-10 h-10 text-almet-waterloo/30 dark:text-almet-bali-hai/30 mx-auto mb-3" />
                        <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai">No requests found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-almet-mystic/50 dark:border-almet-comet">
            <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Approve Business Trip Request
              </h2>
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setApprovalAmount('');
                  setApprovalNote('');
                  setSelectedRequest(null);
                }}
                className="text-almet-waterloo hover:text-almet-cloud-burst dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-almet-mystic/30 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {selectedRequest.status === 'PENDING_FINANCE' && (
                <div>
                  <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                    Trip Amount (AZN) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={approvalAmount}
                    onChange={(e) => setApprovalAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="w-full px-3 py-2.5 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                  Note (Optional)
                </label>
                <textarea
                  value={approvalNote}
                  onChange={(e) => setApprovalNote(e.target.value)}
                  placeholder="Add any notes"
                  rows={3}
                  className="w-full px-3 py-2.5 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>
            </div>

            <div className="border-t border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowApprovalModal(false);
                  setApprovalAmount('');
                  setApprovalNote('');
                  setSelectedRequest(null);
                }}
                className="px-5 py-2.5 text-sm border border-almet-bali-hai/40 dark:border-almet-comet rounded-lg text-almet-cloud-burst dark:text-white hover:bg-almet-mystic/30 dark:hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={loading}
                className="px-6 py-2.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 disabled:opacity-50 shadow-md"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Confirm Approval
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectionModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full border border-almet-mystic/50 dark:border-almet-comet">
            <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-600" />
                Reject Business Trip Request
              </h2>
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setRejectionReason('');
                  setSelectedRequest(null);
                }}
                className="text-almet-waterloo hover:text-almet-cloud-burst dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-almet-mystic/30 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              <div>
                <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                  Reason for Rejection *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Please provide a reason for rejection"
                  rows={4}
                  className="w-full px-3 py-2.5 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>
            </div>

            <div className="border-t border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowRejectionModal(false);
                  setRejectionReason('');
                  setSelectedRequest(null);
                }}
                className="px-5 py-2.5 text-sm border border-almet-bali-hai/40 dark:border-almet-comet rounded-lg text-almet-cloud-burst dark:text-white hover:bg-almet-mystic/30 dark:hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={loading}
                className="px-6 py-2.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center gap-2 disabled:opacity-50 shadow-md"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <XCircle className="w-4 h-4" />
                    Confirm Rejection
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

        