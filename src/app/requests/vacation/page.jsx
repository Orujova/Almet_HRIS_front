"use client";
import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle, Download, Check, Edit, Trash, Lock, Settings, X, FileText, Upload, Paperclip, Eye, Filter } from 'lucide-react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { useToast } from "@/components/common/Toast";
import SearchableDropdown from "@/components/common/SearchableDropdown";
import { VacationService, VacationHelpers } from '@/services/vacationService';
import { useRouter } from 'next/navigation';
import { ApprovalModal } from '@/components/business-trip/ApprovalModal';
import { RejectionModal } from '@/components/business-trip/RejectionModal';
import { AttachmentsModal } from '@/components/vacation/AttachmentsModal';
import { RequestDetailModal } from '@/components/vacation/RequestDetailModal';
import { ScheduleDetailModal } from '@/components/vacation/ScheduleDetailModal';
export default function VacationRequestsPage() {
  const { darkMode } = useTheme();
  const { showSuccess, showError, showInfo } = useToast();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState('request');
  const [activeSection, setActiveSection] = useState('immediate');
  const [requester, setRequester] = useState('for_me');
  const [loading, setLoading] = useState(false);
  const [schedulesTab, setSchedulesTab] = useState('upcoming');
  
  const [balances, setBalances] = useState(null);
  const [vacationTypes, setVacationTypes] = useState([]);
  const [hrRepresentatives, setHrRepresentatives] = useState([]);
  const [scheduleTabs, setScheduleTabs] = useState({ upcoming: [], peers: [], all: [] });
  const [pendingRequests, setPendingRequests] = useState({ line_manager_requests: [], hr_requests: [] });
  const [approvalHistory, setApprovalHistory] = useState([]);
  const [myAllRecords, setMyAllRecords] = useState([]);
  const [allVacationRecords, setAllVacationRecords] = useState([]);
  const [employeeSearchResults, setEmployeeSearchResults] = useState([]);
  const [userPermissions, setUserPermissions] = useState({ is_admin: false, permissions: [] });
  
  // Modal states
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showAttachmentsModal, setShowAttachmentsModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedRequestNumber, setSelectedRequestNumber] = useState(null);
  const [approvalComment, setApprovalComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  
  // File upload states
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [fileErrors, setFileErrors] = useState('');
  const [showScheduleDetailModal, setShowScheduleDetailModal] = useState(false);
const [selectedScheduleId, setSelectedScheduleId] = useState(null);

// Handler function:
const handleViewScheduleDetail = (scheduleId) => {
  setSelectedScheduleId(scheduleId);
  setShowScheduleDetailModal(true);
};
  // Filter states for all records
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    vacation_type_id: '',
    department_id: '',
    start_date: '',
    end_date: '',
    employee_name: '',
    year: ''
  });
  
  const [vacationSettings, setVacationSettings] = useState({
    allow_negative_balance: false,
    max_schedule_edits: 3,
    notification_days_before: 7,
    notification_frequency: 2
  });
  
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [canExportAll, setCanExportAll] = useState(false);
  const [canExportTeam, setCanExportTeam] = useState(false);
  const [canApprove, setCanApprove] = useState(false);

  const [formErrors, setFormErrors] = useState({
    start_date: '',
    end_date: ''
  });
  
  const [formData, setFormData] = useState({
    requester_type: 'for_me',
    employeeName: '',
    businessFunction: '',
    department: '',
    unit: '',
    jobFunction: '',
    phoneNumber: '',
    vacation_type_id: '',
    start_date: '',
    end_date: '',
    dateOfReturn: '',
    numberOfDays: 0,
    comment: '',
    employee_id: null,
    employee_manual: null,
    hr_representative_id: null,
    line_manager: ''
  });

  // File constants
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_FILE_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];
  const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xls', '.xlsx'];

  useEffect(() => {
    initializeData();
  }, []);

  useEffect(() => {
    if (userPermissions.permissions) {
      const hasExportAll = userPermissions.permissions.includes('vacation.request.export_all');
      const hasExportTeam = userPermissions.permissions.includes('vacation.request.export_team');
      const hasApproveLineManager = userPermissions.permissions.includes('vacation.request.approve_as_line_manager');
      const hasApproveHR = userPermissions.permissions.includes('vacation.request.approve_as_hr');
      
      setCanExportAll(userPermissions.is_admin || hasExportAll);
      setCanExportTeam(hasExportTeam);
      setCanApprove(userPermissions.is_admin || hasApproveLineManager || hasApproveHR);
    }
  }, [userPermissions]);

  const initializeData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDashboard(),
        fetchVacationTypes(),
        fetchHRRepresentatives(),
        fetchUserPermissions(),
        fetchVacationSettings()
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
      const data = await VacationService.getMyPermissions();
      setUserPermissions(data);
    } catch (error) {
      console.error('Permissions fetch error:', error);
    }
  };

  const fetchVacationSettings = async () => {
    try {
      const data = await VacationService.getGeneralSettings();
      setVacationSettings(data);
    } catch (error) {
      console.error('Settings fetch error:', error);
    }
  };

  const fetchDashboard = async () => {
    try {
      const data = await VacationService.getDashboard();
      setBalances(data.balance);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    }
  };

  const fetchVacationTypes = async () => {
    try {
      const data = await VacationService.getVacationTypes();
      setVacationTypes(data.results || []);
      if (data.results?.length > 0) {
        setFormData(prev => ({ ...prev, vacation_type_id: data.results[0].id }));
      }
    } catch (error) {
      console.error('Vacation types fetch error:', error);
    }
  };

  const fetchHRRepresentatives = async () => {
    try {
      const data = await VacationService.getHRRepresentatives();
      setHrRepresentatives(data.hr_representatives || []);
      if (data.current_default) {
        setFormData(prev => ({ ...prev, hr_representative_id: data.current_default.id }));
      }
    } catch (error) {
      console.error('HR representatives fetch error:', error);
    }
  };

  const fetchScheduleTabs = async () => {
    try {
      const data = await VacationService.getScheduleTabs();
      setScheduleTabs(data);
    } catch (error) {
      console.error('Schedule tabs fetch error:', error);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const data = await VacationService.getPendingRequests();
      setPendingRequests(data);
    } catch (error) {
      console.error('Pending requests fetch error:', error);
    }
  };

  const fetchApprovalHistory = async () => {
    try {
      const data = await VacationService.getApprovalHistory();
      setApprovalHistory(data.history || []);
    } catch (error) {
      console.error('Approval history fetch error:', error);
    }
  };

  const fetchMyAllRecords = async () => {
    try {
      const data = await VacationService.getMyAllVacations();
      const mappedRecords = data.records?.map(record => ({
        ...record,
        attachments_count: record.attachments?.length || 0
      })) || [];
      setMyAllRecords(mappedRecords);
    } catch (error) {
      console.error('My records fetch error:', error);
    }
  };

  const fetchAllVacationRecords = async () => {
    try {
      const data = await VacationService.getAllVacationRecords(filters);
      setAllVacationRecords(data.records || []);
    } catch (error) {
      console.error('All records fetch error:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'approval') {
      fetchPendingRequests();
      fetchApprovalHistory();
    } else if (activeTab === 'all') {
      fetchMyAllRecords();
    } else if (activeTab === 'records') {
      fetchAllVacationRecords();
    } else if (activeSection === 'scheduling') {
      fetchScheduleTabs();
    }
  }, [activeTab, activeSection]);

  const handleEmployeeSearch = async () => {
    try {
      const data = await VacationService.searchEmployees();
      setEmployeeSearchResults(data.results || []);
    } catch (error) {
      console.error('Employee search error:', error);
    }
  };

  useEffect(() => {
    handleEmployeeSearch();
  }, []);

  // File handling functions
  const validateFile = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      return `File "${file.name}" exceeds 10MB limit`;
    }
    
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      if (!ALLOWED_EXTENSIONS.includes(extension)) {
        return `File "${file.name}" has unsupported format. Allowed: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX`;
      }
    }
    
    return null;
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newFiles = [];
    const errors = [];
    
    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        newFiles.push(file);
      }
    }
    
    if (errors.length > 0) {
      setFileErrors(errors.join('. '));
      showError('Some files could not be added');
    } else {
      setFileErrors('');
    }
    
    setSelectedFiles(prev => [...prev, ...newFiles]);
    e.target.value = '';
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFileErrors('');
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleStartDateChange = (e) => {
    const selectedDate = e.target.value;
    const today = new Date().toISOString().split('T')[0];
    
    if (selectedDate < today) {
      setFormErrors(prev => ({
        ...prev,
        start_date: 'Start date cannot be in the past'
      }));
      return;
    }
    
    setFormErrors(prev => ({ ...prev, start_date: '' }));
    
    if (formData.end_date && selectedDate > formData.end_date) {
      setFormErrors(prev => ({
        ...prev,
        end_date: 'End date must be after start date'
      }));
    } else {
      setFormErrors(prev => ({ ...prev, end_date: '' }));
    }
    
    setFormData(prev => ({ ...prev, start_date: selectedDate }));
  };

  const handleEndDateChange = (e) => {
    const selectedDate = e.target.value;
    
    if (formData.start_date && selectedDate < formData.start_date) {
      setFormErrors(prev => ({
        ...prev,
        end_date: 'End date must be after start date'
      }));
    } else {
      setFormErrors(prev => ({ ...prev, end_date: '' }));
    }
    
    setFormData(prev => ({ ...prev, end_date: selectedDate }));
  };

  const calculateWorkingDays = async (startDate, endDate) => {
    if (!startDate || !endDate) return 0;
    try {
      const data = await VacationService.calculateWorkingDays({ start_date: startDate, end_date: endDate });
      return data.working_days || 0;
    } catch (error) {
      console.error('Working days calculation error:', error);
      return 0;
    }
  };

  useEffect(() => {
    const updateWorkingDays = async () => {
      if (formData.start_date && formData.end_date) {
        const days = await calculateWorkingDays(formData.start_date, formData.end_date);
        const endDate = new Date(formData.end_date);
        endDate.setDate(endDate.getDate() + 1);
        setFormData(prev => ({ 
          ...prev, 
          numberOfDays: days, 
          dateOfReturn: endDate.toISOString().split('T')[0] 
        }));
      }
    };
    updateWorkingDays();
  }, [formData.start_date, formData.end_date]);

  useEffect(() => {
    const loadCurrentUserData = async () => {
      if (requester === 'for_me') {
        const userEmail = VacationService.getCurrentUserEmail();
        
        if (userEmail && employeeSearchResults.length > 0) {
          const currentEmployee = employeeSearchResults.find(emp => 
            emp.email?.toLowerCase() === userEmail.toLowerCase()
          );
          
          if (currentEmployee) {
            setFormData(prev => ({ 
              ...prev, 
              requester_type: 'for_me',
              employee_id: null,
              employee_manual: null,
              employeeName: currentEmployee.name || '',
              businessFunction: currentEmployee.business_function_name || '',
              department: currentEmployee.department_name || '',
              unit: currentEmployee.unit_name || '',
              jobFunction: currentEmployee.job_function_name || '',
              phoneNumber: currentEmployee.phone || '',
              line_manager: currentEmployee.line_manager_name || ''
            }));
          } else {
            setFormData(prev => ({ 
              ...prev, 
              requester_type: 'for_me', 
              employee_id: null, 
              employee_manual: null,
              employeeName: '',
              businessFunction: '',
              department: '',
              unit: '',
              jobFunction: '',
              phoneNumber: '',
              line_manager: ''
            }));
          }
        }
      } else {
        setFormData(prev => ({ 
          ...prev, 
          requester_type: 'for_my_employee', 
          employeeName: '', 
          businessFunction: '', 
          department: '', 
          unit: '', 
          jobFunction: '', 
          phoneNumber: '', 
          line_manager: '' 
        }));
      }
    };
    
    loadCurrentUserData();
  }, [requester, employeeSearchResults]);

  const handleExportAllRecords = async () => {
    try {
      const blob = await VacationService.exportAllVacationRecords(filters);
      const filename = canExportAll 
        ? 'all_vacation_records.xlsx' 
        : 'team_vacation_records.xlsx';
      VacationHelpers.downloadBlobFile(blob, filename);
      showSuccess('Export completed successfully');
    } catch (error) {
      console.error('Export error:', error);
      showError('Export failed');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formErrors.start_date || formErrors.end_date) {
      showError('Please fix the date errors before submitting');
      return;
    }

    if (!vacationSettings.allow_negative_balance && balances) {
      if (formData.numberOfDays > balances.remaining_balance) {
        showError(`Insufficient balance. You have ${balances.remaining_balance} days remaining.`);
        return;
      }
    }

    setLoading(true);
    try {
      let requestData = {
        requester_type: formData.requester_type,
        vacation_type_id: parseInt(formData.vacation_type_id),
        start_date: formData.start_date,
        end_date: formData.end_date,
        comment: formData.comment
      };

      if (formData.requester_type === 'for_my_employee') {
        if (formData.employee_id) {
          requestData.employee_id = formData.employee_id;
        } else {
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

      let response;
      
      if (activeSection === 'immediate') {
        if (formData.hr_representative_id) {
          requestData.hr_representative_id = formData.hr_representative_id;
        }
        response = await VacationService.createImmediateRequest(requestData, selectedFiles);
        showSuccess('Request submitted successfully');
        setSelectedFiles([]);
      } else {
        response = await VacationService.createSchedule(requestData);
        showSuccess('Schedule saved successfully');
        fetchScheduleTabs();
      }

      if (response.balance) {
        setBalances(response.balance);
      } else {
        await fetchDashboard();
      }

      setFormData(prev => ({ 
        ...prev, 
        start_date: '', 
        end_date: '', 
        dateOfReturn: '', 
        numberOfDays: 0, 
        comment: '' 
      }));
      setFileErrors('');
    } catch (error) {
      console.error('Submit error:', error);
      const errorMsg = error.response?.data?.error || error.response?.data?.detail || 'Failed to submit';
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSchedule = (schedule) => {
    setEditingSchedule({
      id: schedule.id,
      vacation_type_id: schedule.vacation_type_id || vacationTypes[0]?.id,
      start_date: schedule.start_date,
      end_date: schedule.end_date,
      comment: schedule.comment || '',
      numberOfDays: schedule.number_of_days,
      edit_count: schedule.edit_count
    });
    setEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingSchedule) return;

    if (editingSchedule.edit_count >= vacationSettings.max_schedule_edits) {
      showError(`Maximum edit limit (${vacationSettings.max_schedule_edits}) reached`);
      return;
    }

    setLoading(true);
    try {
      const editData = {
        vacation_type_id: editingSchedule.vacation_type_id,
        start_date: editingSchedule.start_date,
        end_date: editingSchedule.end_date,
        comment: editingSchedule.comment
      };
      
      await VacationService.editSchedule(editingSchedule.id, editData);
      showSuccess('Schedule updated successfully');
      setEditModalOpen(false);
      setEditingSchedule(null);
      fetchScheduleTabs();
      fetchMyAllRecords();
    } catch (error) {
      console.error('Edit error:', error);
      showError(error.response?.data?.error || 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const handleOpenApprovalModal = (request) => {
    setSelectedRequest(request);
    setApprovalComment('');
    setShowApprovalModal(true);
  };

  const handleOpenRejectionModal = (request) => {
    setSelectedRequest(request);
    setRejectionReason('');
    setShowRejectionModal(true);
  };

  const handleConfirmApproval = async () => {
    if (!selectedRequest) return;
    
    setLoading(true);
    try {
      await VacationService.approveRejectRequest(selectedRequest.id, { 
        action: 'approve',
        comment: approvalComment || 'Approved'
      });
      showSuccess('Request approved successfully');
      setShowApprovalModal(false);
      setSelectedRequest(null);
      setApprovalComment('');
      fetchPendingRequests();
      fetchApprovalHistory();
    } catch (error) {
      console.error('Approval error:', error);
      showError(error.response?.data?.error || 'Failed to approve');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmRejection = async () => {
    if (!selectedRequest) return;
    
    if (!rejectionReason.trim()) {
      showError('Rejection reason is required');
      return;
    }
    
    setLoading(true);
    try {
      await VacationService.approveRejectRequest(selectedRequest.id, { 
        action: 'reject',
        reason: rejectionReason
      });
      showSuccess('Request rejected successfully');
      setShowRejectionModal(false);
      setSelectedRequest(null);
      setRejectionReason('');
      fetchPendingRequests();
      fetchApprovalHistory();
    } catch (error) {
      console.error('Rejection error:', error);
      showError(error.response?.data?.error || 'Failed to reject');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (requestId) => {
    setSelectedRequestId(requestId);
    setShowDetailModal(true);
  };

  const handleViewAttachments = (requestId, requestNumber) => {
    setSelectedRequestId(requestId);
    setSelectedRequestNumber(requestNumber);
    setShowAttachmentsModal(true);
  };

  const handleRegisterSchedule = async (scheduleId) => {
    try {
      await VacationService.registerSchedule(scheduleId);
      showSuccess('Schedule registered successfully');
      fetchScheduleTabs();
      fetchDashboard();
      fetchMyAllRecords();
    } catch (error) {
      console.error('Register error:', error);
      showError('Failed to register schedule');
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    try {
      await VacationService.deleteSchedule(scheduleId);
      showSuccess('Schedule deleted successfully');
      fetchScheduleTabs();
      fetchDashboard();
      fetchMyAllRecords();
    } catch (error) {
      console.error('Delete error:', error);
      showError('Failed to delete schedule');
    }
  };

  const handleExportMyVacations = async () => {
    try {
      const blob = await VacationService.exportMyVacations();
      VacationHelpers.downloadBlobFile(blob, 'my_vacations.xlsx');
      showSuccess('Export completed');
    } catch (error) {
      console.error('Export error:', error);
      showError('Export failed');
    }
  };

  const handleExportSchedules = async () => {
    try {
      const blob = await VacationService.exportAllVacationRecords();
      VacationHelpers.downloadBlobFile(blob, 'schedules.xlsx');
      showSuccess('Export completed');
    } catch (error) {
      console.error('Export error:', error);
      showError('Export failed');
    }
  };

  const canEditSchedule = (schedule) => {
    if (schedule.status !== 'SCHEDULED') return false;
    if (schedule.edit_count >= vacationSettings.max_schedule_edits) return false;
    return true;
  };

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/30 dark:border-almet-comet/30 p-3 hover:border-almet-sapphire/50 dark:hover:border-almet-astral/50 transition-all duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-1">{title}</p>
          <p className={`text-xl font-semibold ${color}`}>{value || 0}</p>
          {subtitle && <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-0.5">{subtitle}</p>}
        </div>
        <div className={`p-2 rounded-lg ${color.replace('text-', 'bg-')}/10`}>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
      </div>
    </div>
  );

  if (loading && !balances) {
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
        
        <div className="mb-5 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-almet-cloud-burst dark:text-white">Vacation Management</h1>
            <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-1">Manage requests and schedules</p>
          </div>
          
          <div className="flex items-center gap-2 flex-wrap">
            {userPermissions.is_admin && (
              <>
                <button
                  onClick={() => router.push('/requests/vacation/vacation-settings')}
                  className="flex items-center gap-1.5 bg-almet-sapphire hover:bg-almet-cloud-burst text-white px-3 py-1.5 rounded-md transition-all shadow-sm"
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium">Settings</span>
                </button>
                
                <div className="flex items-center gap-1.5 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700/50 px-2.5 py-1.5 rounded-md">
                  <Lock className="w-3 h-3 text-purple-600 dark:text-purple-400" />
                  <span className="text-xs font-medium text-purple-600 dark:text-purple-400">Admin Access</span>
                </div>
              </>
            )}
            
            <div className="bg-almet-mystic dark:bg-almet-comet/20 border border-almet-bali-hai/30 dark:border-almet-comet px-2.5 py-1.5 rounded-md">
              <div className="flex items-center gap-2 text-xs text-almet-waterloo dark:text-almet-bali-hai">
                <Settings className="w-3 h-3" />
                <span>Max Edits: {vacationSettings.max_schedule_edits}</span>
                <span className="mx-0.5">•</span>
                <span>{vacationSettings.allow_negative_balance ? 'Negative OK' : 'No Negative'}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-5 border-b border-almet-mystic dark:border-almet-comet">
          <div className="flex space-x-8">
            {[
              { key: 'request', label: 'Request', icon: FileText },
              ...(canApprove ? [{ key: 'approval', label: 'Approval', icon: CheckCircle }] : []),
              { key: 'all', label: 'My Records', icon: Calendar },
              ...(canExportAll || canExportTeam ? [{ key: 'records', label: 'All Records', icon: Users }] : [])
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

        {activeTab === 'request' && (
          <div className="space-y-5">
            
            {balances && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatCard 
                  title="Total Balance" 
                  value={balances.total_balance} 
                  icon={Calendar} 
                  color="text-almet-sapphire" 
                />
                <StatCard 
                  title="Yearly Balance" 
                  value={balances.yearly_balance} 
                  icon={Calendar} 
                  color="text-almet-astral" 
                />
                <StatCard 
                  title="Used Days" 
                  value={balances.used_days} 
                  icon={CheckCircle} 
                  color="text-orange-600" 
                />
                <StatCard 
                  title="Remaining" 
                  value={balances.remaining_balance} 
                  icon={Clock} 
                  color="text-green-600" 
                  subtitle="Available now"
                />
                <StatCard 
                  title="Scheduled" 
                  value={balances.scheduled_days} 
                  icon={Users} 
                  color="text-almet-steel-blue" 
                  subtitle="Future plans"
                />
                <StatCard 
                  title="To Plan" 
                  value={balances.should_be_planned} 
                  icon={AlertCircle} 
                  color="text-red-600" 
                  subtitle="Must schedule"
                />
              </div>
            )}

            {!vacationSettings.allow_negative_balance && balances && balances.remaining_balance < 5 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 dark:border-amber-600 rounded-r-lg p-3">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-amber-900 dark:text-amber-200">Low Balance Warning</h3>
                    <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                      You have only <strong>{balances.remaining_balance} days</strong> remaining. 
                      {balances.remaining_balance <= 0 && ' Negative balance is not allowed.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button 
                onClick={() => setActiveSection('immediate')}
                className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeSection === 'immediate' 
                    ? 'bg-almet-sapphire text-white shadow-md' 
                    : 'bg-white dark:bg-gray-800 text-almet-cloud-burst dark:text-white border border-almet-mystic dark:border-almet-comet hover:border-almet-sapphire dark:hover:border-almet-astral'
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                Request (Approval Required)
              </button>
              <button 
                onClick={() => setActiveSection('scheduling')}
                className={`flex-1 px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeSection === 'scheduling' 
                    ? 'bg-almet-sapphire text-white shadow-md' 
                    : 'bg-white dark:bg-gray-800 text-almet-cloud-burst dark:text-white border border-almet-mystic dark:border-almet-comet hover:border-almet-sapphire dark:hover:border-almet-astral'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Schedule (No Approval)
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet shadow-sm">
              <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white">
                    {activeSection === 'immediate' ? 'Submit Request' : 'Create Schedule'}
                  </h2>
                  {activeSection === 'scheduling' && (
                    <span className="bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      No Approval
                    </span>
                  )}
                </div>
              </div>

              <div className="p-5">
                <div className="grid lg:grid-cols-2 gap-6">
                  
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
                            value:emp.id, 
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
                                line_manager: ''
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
                                line_manager: selectedEmployee.line_manager_name || ''
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
                      {['employeeName', 'phoneNumber'].map(field => (
                        <div key={field}>
                          <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                            {field === 'employeeName' ? 'Name' : 'Phone'}
                          </label>
                          <input 
                            type={field === 'phoneNumber' ? 'tel' : 'text'} 
                            value={formData[field]} 
                            onChange={(e) => setFormData(prev => ({...prev, [field]: e.target.value}))} 
                            disabled={requester === 'for_me'} 
                            className="w-full px-3 py-2.5 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-almet-mystic/30 dark:disabled:bg-gray-600" 
                          />
                        </div>
                      ))}
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

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-almet-sapphire" />
                      <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">Leave Information</h3>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Leave Type</label>
                      <SearchableDropdown 
                        options={vacationTypes.map(type => ({ value: type.id, label: type.name }))} 
                        value={formData.vacation_type_id} 
                        onChange={(value) => setFormData(prev => ({...prev, vacation_type_id: value}))} 
                        placeholder="Select type" 
                        darkMode={darkMode} 
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Start Date</label>
                      <input 
                        type="date" 
                        value={formData.start_date} 
                        onChange={handleStartDateChange}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-3 py-2.5 text-sm border outline-0 rounded-lg focus:ring-1 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all ${
                          formErrors.start_date 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-almet-bali-hai/40 dark:border-almet-comet focus:ring-almet-sapphire'
                        }`}
                        required 
                      />
                      {formErrors.start_date && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.start_date}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">End Date</label>
                      <input 
                        type="date" 
                        value={formData.end_date} 
                        onChange={handleEndDateChange}
                        min={formData.start_date || new Date().toISOString().split('T')[0]}
                        className={`w-full px-3 py-2.5 text-sm outline-0 border rounded-lg focus:ring-1 focus:border-transparent dark:bg-gray-700 dark:text-white transition-all ${
                          formErrors.end_date 
                            ? 'border-red-500 focus:ring-red-500' 
                            : 'border-almet-bali-hai/40 dark:border-almet-comet focus:ring-almet-sapphire'
                        }`}
                        required 
                      />
                      {formErrors.end_date && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{formErrors.end_date}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Return Date</label>
                        <input 
                          type="date" 
                          value={formData.dateOfReturn} 
                          disabled 
                          className="w-full px-3 py-2.5 outline-0 text-sm border border-almet-bali-hai/40 dark:border-almet-comet rounded-lg bg-almet-mystic/30 dark:bg-gray-600 dark:text-white" 
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Number of days</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            value={formData.numberOfDays} 
                            disabled 
                            className="w-full px-3 py-2.5 text-sm outline-0 border border-almet-bali-hai/40 dark:border-almet-comet rounded-lg bg-almet-mystic/30 dark:bg-gray-600 dark:text-white font-semibold" 
                          />
                          <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-almet-waterloo" />
                        </div>
                      </div>
                    </div>
                    
                

                    {activeSection === 'immediate' && (
                      <>
                        <div>
                          <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                            Attachments (Optional)
                          </label>
                          <div className="space-y-2">
                            <div className="relative">
                              <input
                                type="file"
                                id="file-upload"
                                multiple
                                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                                onChange={handleFileSelect}
                                className="hidden"
                              />
                              <label
                                htmlFor="file-upload"
                                className="flex items-center justify-center gap-2 w-full px-4 py-3 text-sm border-2 border-dashed border-almet-bali-hai/40 dark:border-almet-comet rounded-lg hover:border-almet-sapphire dark:hover:border-almet-astral hover:bg-almet-mystic/20 dark:hover:bg-gray-700/30 transition-all cursor-pointer"
                              >
                                <Upload className="w-4 h-4 text-almet-waterloo dark:text-almet-bali-hai" />
                                <span className="text-almet-waterloo dark:text-almet-bali-hai">
                                  Click to upload or drag files here
                                </span>
                              </label>
                            </div>
                            
                            <p className="text-xs text-almet-waterloo/70 dark:text-almet-bali-hai/70">
                              Supported formats: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX (Max 10MB each)
                            </p>
                            
                            {fileErrors && (
                              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-2">
                                <p className="text-xs text-red-600 dark:text-red-400">{fileErrors}</p>
                              </div>
                            )}
                            
                            {selectedFiles.length > 0 && (
                              <div className="space-y-2">
                                {selectedFiles.map((file, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between gap-3 p-2.5 bg-almet-mystic/20 dark:bg-gray-700/30 border border-almet-mystic/40 dark:border-almet-comet rounded-lg"
                                  >
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <FileText className="w-4 h-4 text-almet-sapphire flex-shrink-0" />
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium text-almet-cloud-burst dark:text-white truncate">
                                          {file.name}
                                        </p>
                                        <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                                          {formatFileSize(file.size)}
                                        </p>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => removeFile(index)}
                                      className="p-1.5 text-red-600 hover:text-red-800 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="border-t border-almet-mystic/30 dark:border-almet-comet/30 pt-4 mt-2">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="w-4 h-4 text-almet-sapphire" />
                            <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">Approval Required</h3>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Line Manager</label>
                          <input 
                            type="text" 
                            value={formData.line_manager} 
                            onChange={(e) => setFormData(prev => ({...prev, line_manager: e.target.value}))} 
                            disabled={requester === 'for_me'} 
                            placeholder="Line Manager Name" 
                            className="w-full px-3 py-2.5 outline-0 text-sm border border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire focus:border-transparent dark:bg-gray-700 dark:text-white disabled:bg-almet-mystic/30 dark:disabled:bg-gray-600" 
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">HR Representative</label>
                          <SearchableDropdown 
                            options={hrRepresentatives.map(hr => ({ value: hr.id, label: `${hr.name} (${hr.department})` }))} 
                            value={formData.hr_representative_id} 
                            onChange={(value) => setFormData(prev => ({...prev, hr_representative_id: value}))} 
                            placeholder="Select HR" 
                            darkMode={darkMode} 
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-almet-mystic/30 dark:border-almet-comet/30">
                  <button 
                    type="button" 
                    onClick={() => {
                      setFormData(prev => ({ ...prev, start_date: '', end_date: '', dateOfReturn: '', numberOfDays: 0, comment: '' }));
                      setSelectedFiles([]);
                      setFileErrors('');
                    }} 
                    className="px-5 py-2.5 text-sm border border-almet-bali-hai/40 dark:border-almet-comet rounded-lg text-almet-cloud-burst dark:text-white hover:bg-almet-mystic/30 dark:hover:bg-gray-700 transition-all"
                  >
                    Clear
                  </button>
                  <button 
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading || !formData.start_date || !formData.end_date || !formData.vacation_type_id} 
                    className="px-6 py-2.5 text-sm bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        {activeSection === 'immediate' ? 'Submit Request' : 'Save Schedule'}
                      </>
                    )}
                  </button>
                </div>
              </div>

              {activeSection === 'scheduling' && (
                <div className="border-t border-almet-mystic/30 dark:border-almet-comet/30 p-5 bg-almet-mystic/10 dark:bg-gray-900/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex space-x-6">
                      {['upcoming', 'peers', 'all'].map(tab => (
                        <button 
                          key={tab} 
                          onClick={() => setSchedulesTab(tab)} 
                          className={`pb-2 px-1 border-b-2 font-medium text-xs transition-all ${
                            schedulesTab === tab 
                              ? 'border-almet-sapphire text-almet-sapphire dark:text-almet-astral' 
                              : 'border-transparent text-almet-waterloo hover:text-almet-cloud-burst dark:text-almet-bali-hai'
                          }`}
                        >
                          {tab === 'upcoming' ? 'My Upcoming' : tab === 'peers' ? 'Team Schedule' : 'All Schedules'}
                        </button>
                      ))}
                    </div>
                    <button 
                      onClick={handleExportSchedules} 
                      className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Download className="w-3 h-3" />
                      Export
                    </button>
                  </div>

                  <div className="overflow-x-auto rounded-lg border border-almet-mystic/30 dark:border-almet-comet">
                    <table className="min-w-full divide-y divide-almet-mystic/30 dark:divide-almet-comet">
                      <thead className="bg-almet-mystic/50 dark:bg-gray-700/50">
                        <tr>
                          {['Employee', 'Type', 'Start', 'End', 'Days', 'Status', 'Actions'].map(h => (
                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-almet-comet dark:text-almet-bali-hai uppercase tracking-wide">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-almet-mystic/20 dark:divide-almet-comet/20">
                        {scheduleTabs[schedulesTab]?.map(schedule => (
                          <tr key={schedule.id} className="hover:bg-almet-mystic/20 dark:hover:bg-gray-700/30 transition-colors">
                            <td className="px-4 py-3 text-xs font-medium text-almet-cloud-burst dark:text-white">{schedule.employee_name}</td>
                            <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{schedule.vacation_type_name}</td>
                            <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{schedule.start_date}</td>
                            <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{schedule.end_date}</td>
                            <td className="px-4 py-3 text-xs font-semibold text-almet-cloud-burst dark:text-white">{schedule.number_of_days}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                                schedule.status === 'SCHEDULED' 
                                  ? 'bg-blue-50 text-almet-sapphire dark:bg-blue-900/30 dark:text-almet-astral' 
                                  : 'bg-gray-50 text-almet-waterloo dark:bg-gray-700 dark:text-almet-bali-hai'
                              }`}>
                                {schedule.status_display}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs">
                              {canEditSchedule(schedule) ? (
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleDeleteSchedule(schedule.id)} 
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 flex items-center gap-1"
                                  >
                                    <Trash className="w-3 h-3" />
                                  </button>
                                  <button 
                                    onClick={() => handleEditSchedule(schedule)} 
                                    className="text-almet-sapphire hover:text-almet-cloud-burst dark:text-almet-astral flex items-center gap-1 font-medium"
                                  >
                                    <Edit className="w-3 h-3" />
                                    Edit ({schedule.edit_count}/{vacationSettings.max_schedule_edits})
                                  </button>
                                  <button 
                                    onClick={() => handleRegisterSchedule(schedule.id)} 
                                    className="text-green-600 hover:text-green-800 dark:text-green-400 flex items-center gap-1 font-medium"
                                  >
                                    <Check className="w-3 h-3" />
                                    Register
                                  </button>
                                </div>
                              ) : (
                                <span className="text-almet-waterloo/50 dark:text-almet-bali-hai/50 text-xs">
                                  {schedule.status === 'SCHEDULED' ? 'Max edits reached' : 'N/A'}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {scheduleTabs[schedulesTab]?.length === 0 && (
                          <tr>
                            <td colSpan="7" className="px-4 py-8 text-center text-sm text-almet-waterloo dark:text-almet-bali-hai">
                              No schedules found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'approval' && (
          <div className="space-y-4">
            {userPermissions.is_admin && (
              <div className="bg-purple-50 dark:bg-purple-900/20 border-l-4 border-purple-500 dark:border-purple-600 rounded-r-lg p-4">
                <div className="flex items-start gap-3">
                  <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-purple-900 dark:text-purple-200">Admin Mode Active</h3>
                    <p className="text-xs text-purple-800 dark:text-purple-300 mt-1">
                      You can approve/reject requests as both Line Manager and HR representative.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet shadow-sm">
              <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white">Pending Approvals</h2>
                <span className="bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 px-3 py-1 rounded-full text-xs font-semibold">
                  {(pendingRequests.line_manager_requests?.length || 0) + (pendingRequests.hr_requests?.length || 0)} Pending
                </span>
              </div>
              
              <div className="p-5 space-y-5">
                {pendingRequests.line_manager_requests?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4 text-almet-sapphire" />
                      Line Manager Approvals
                    </h3>
                    <div className="space-y-3">
                      {pendingRequests.line_manager_requests?.map(request => (
                        <div key={request.id} className="border border-almet-mystic/40 dark:border-almet-comet rounded-lg p-4 hover:border-almet-sapphire/50 dark:hover:border-almet-astral/50 transition-all">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h4 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">{request.employee_name}</h4>
                              <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-1">
                                {request.vacation_type_name} • {request.start_date} to {request.end_date} • <strong>{request.number_of_days} days</strong>
                              </p>
                              {request.comment && (
                                <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-2 italic">"{request.comment}"</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleViewDetails(request.id)}
                                className="px-3 py-2 text-xs bg-almet-sapphire/10 text-almet-sapphire rounded-lg hover:bg-almet-sapphire/20 transition-all flex items-center gap-1.5 font-medium"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Details
                              </button>
                              <button 
                                onClick={() => handleOpenApprovalModal(request)} 
                                className="px-4 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-1.5 font-medium shadow-sm"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Approve
                              </button>
                              <button 
                                onClick={() => handleOpenRejectionModal(request)} 
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

                {pendingRequests.hr_requests?.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white mb-3 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-almet-astral" />
                      HR Approvals
                    </h3>
                    <div className="space-y-3">
                      {pendingRequests.hr_requests?.map(request => (
                        <div key={request.id} className="border border-blue-200/60 dark:border-blue-800/40 rounded-lg p-4 bg-blue-50/30 dark:bg-blue-900/10 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">{request.employee_name}</h4>
                                <span className="text-xs bg-blue-100 dark:bg-blue-800/50 px-2 py-0.5 rounded font-medium text-blue-700 dark:text-blue-300">HR Review</span>
                              </div>
                              <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                                {request.vacation_type_name} • {request.start_date} to {request.end_date} • <strong>{request.number_of_days} days</strong>
                              </p>
                              {request.comment && (
                                <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-2 italic">"{request.comment}"</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleViewDetails(request.id)}
                                className="px-3 py-2 text-xs bg-almet-sapphire/10 text-almet-sapphire rounded-lg hover:bg-almet-sapphire/20 transition-all flex items-center gap-1.5 font-medium"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Details
                              </button>
                              <button 
                                onClick={() => handleOpenApprovalModal(request)} 
                                className="px-4 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-1.5 font-medium shadow-sm"
                              >
                                <CheckCircle className="w-3.5 h-3.5" />
                                Approve
                              </button>
                              <button 
                                onClick={() => handleOpenRejectionModal(request)} 
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

                {(pendingRequests.line_manager_requests?.length === 0 && pendingRequests.hr_requests?.length === 0) && (
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

            {/* Approval History */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet shadow-sm">
              <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4">
                <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white">Approval History</h2>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-almet-mystic/30 dark:divide-almet-comet">
                  <thead className="bg-almet-mystic/50 dark:bg-gray-700/50">
                    <tr>
                      {['Request ID', 'Employee', 'Type', 'Period', 'Days', 'Action', 'Comment', 'Date'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-almet-comet dark:text-almet-bali-hai uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-almet-mystic/20 dark:divide-almet-comet/20">
                    {approvalHistory.map((item, index) => (
                      <tr key={index} className="hover:bg-almet-mystic/20 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-4 py-3 text-xs font-medium text-almet-sapphire">{item.request_id}</td>
                        <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{item.employee_name}</td>
                        <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{item.vacation_type}</td>
                        <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{item.start_date} - {item.end_date}</td>
                        <td className="px-4 py-3 text-xs font-semibold text-almet-cloud-burst dark:text-white">{item.days}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                            item.action === 'Approved' 
                              ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                              : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                          }`}>
                            {item.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai italic max-w-xs truncate">
                          {item.comment || '-'}
                        </td>
                        <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">
                          {new Date(item.date).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                    {approvalHistory.length === 0 && (
                      <tr>
                        <td colSpan="8" className="px-4 py-12 text-center text-sm text-almet-waterloo dark:text-almet-bali-hai">
                          No approval history found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'all' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet shadow-sm">
            <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white">My All Records</h2>
              <div className="flex gap-2">
                <button 
                  onClick={handleExportMyVacations} 
                  className="px-3 py-1.5 text-xs bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3 h-3" />
                  My Vacations
                </button>
                
                {(canExportAll || canExportTeam) && (
                  <button 
                    onClick={handleExportAllRecords} 
                    className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-1.5 shadow-sm"
                  >
                    <Download className="w-3 h-3" />
                    {canExportAll ? 'All Records' : 'Team Records'}
                  </button>
                )}
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-almet-mystic/30 dark:divide-almet-comet">
                <thead className="bg-almet-mystic/50 dark:bg-gray-700/50">
                  <tr>
                    {['Type', 'Leave', 'Start', 'End', 'Days', 'Status', 'Attachments', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-almet-comet dark:text-almet-bali-hai uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-almet-mystic/20 dark:divide-almet-comet/20">
                  {myAllRecords.map(record => (
                    <tr key={`${record.type}-${record.id}`} className="hover:bg-almet-mystic/20 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 text-xs">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          record.type === 'schedule' 
                            ? 'bg-blue-50 text-almet-sapphire dark:bg-blue-900/30 dark:text-almet-astral' 
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                        }`}>
                          {record.type === 'schedule' ? 'Schedule' : 'Request'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{record.vacation_type}</td>
                      <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{record.start_date}</td>
                      <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{record.end_date}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-almet-cloud-burst dark:text-white">{record.days}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          record.status === 'Scheduled' || record.status === 'Registered' ? 'bg-blue-50 text-almet-sapphire dark:bg-blue-900/30 dark:text-almet-astral' : 
                          record.status === 'Pending HR' ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 
                          record.status === 'Pending Line Manager' ? 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' : 
                          record.status === 'Approved' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                          'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs">
                        {record.type === 'request' && record.has_attachments ? (
                          <button
                            onClick={() => handleViewAttachments(record.request_id, record.request_id)}
                            className="flex items-center gap-1 text-almet-sapphire hover:text-almet-cloud-burst dark:text-almet-astral font-medium"
                          >
                            <Paperclip className="w-3 h-3" />
                            {/* {record.attachments_count} */}
                          </button>
                        ) : (
                          <span className="text-almet-waterloo/50 dark:text-almet-bali-hai/50">-</span>
                        )}
                      </td>
                     <td className="px-4 py-3 text-xs">
  {record.type === 'request' ? (
    <button 
      onClick={() => handleViewDetails(record.id)}
      className="text-almet-sapphire hover:text-almet-cloud-burst dark:text-almet-astral flex items-center gap-1 font-medium"
    >
      <Eye className="w-3 h-3" />
      View
    </button>
  ) : record.can_edit ? (
    <div className="flex gap-2">
      <button 
        onClick={() => handleViewScheduleDetail(record.id)} 
        className="text-almet-sapphire hover:text-almet-cloud-burst dark:text-almet-astral flex items-center gap-1 font-medium"
      >
        <Eye className="w-3 h-3" />
        View
      </button>
      <button 
        onClick={() => handleEditSchedule(record)} 
        className="text-almet-sapphire hover:text-almet-cloud-burst dark:text-almet-astral flex items-center gap-1 font-medium"
      >
        <Edit className="w-3 h-3" />
        Edit
      </button>
      <button 
        onClick={() => handleRegisterSchedule(record.id)} 
        className="text-green-600 hover:text-green-800 dark:text-green-400 flex items-center gap-1 font-medium"
      >
        <Check className="w-3 h-3" />
        Register
      </button>
    </div>
  ) : (
    <button 
      onClick={() => handleViewScheduleDetail(record.id)}
      className="text-almet-sapphire hover:text-almet-cloud-burst dark:text-almet-astral flex items-center gap-1 font-medium"
    >
      <Eye className="w-3 h-3" />
      View
    </button>
  )}
</td>
                    </tr>
                  ))}
                  {myAllRecords.length === 0 && (
                    <tr>
                      <td colSpan="8" className="px-4 py-12 text-center">
                        <FileText className="w-10 h-10 text-almet-waterloo/30 dark:text-almet-bali-hai/30 mx-auto mb-3" />
                        <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai">No records found</p>
                        <p className="text-xs text-almet-waterloo/70 dark:text-almet-bali-hai/70 mt-1">Your vacation history will appear here</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'records' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet shadow-sm">
            <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white">All Vacation Records</h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-3 py-1.5 text-xs bg-almet-mystic dark:bg-gray-700 text-almet-cloud-burst dark:text-white rounded-lg hover:bg-almet-mystic/60 dark:hover:bg-gray-600 transition-all flex items-center gap-1.5"
                >
                  <Filter className="w-3 h-3" />
                  Filters
                </button>
                <button 
                  onClick={handleExportAllRecords} 
                  className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Download className="w-3 h-3" />
                  Export
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="border-b border-almet-mystic/30 dark:border-almet-comet/30 p-5 bg-almet-mystic/10 dark:bg-gray-900/20">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Employee Name</label>
                    <input 
                      type="text" 
                      value={filters.employee_name}
                      onChange={(e) => setFilters(prev => ({...prev, employee_name: e.target.value}))}
                      placeholder="Search name"
                      className="w-full px-3 py-2 text-xs border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Start Date</label>
                    <input 
                      type="date" 
                      value={filters.start_date}
                      onChange={(e) => setFilters(prev => ({...prev, start_date: e.target.value}))}
                      className="w-full px-3 py-2 text-xs border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">End Date</label>
                    <input 
                      type="date" 
                      value={filters.end_date}
                      onChange={(e) => setFilters(prev => ({...prev, end_date: e.target.value}))}
                      className="w-full px-3 py-2 text-xs border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">Year</label>
                    <input 
                      type="number" 
                      value={filters.year}
                      onChange={(e) => setFilters(prev => ({...prev, year: e.target.value}))}
                      placeholder="2025"
                      className="w-full px-3 py-2 text-xs border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button 
                    onClick={fetchAllVacationRecords}
                    className="px-4 py-2 text-xs bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all"
                  >
                    Apply Filters
                  </button>
                  <button 
                    onClick={() => {
                      setFilters({ status: '', vacation_type_id: '', department_id: '', start_date: '', end_date: '', employee_name: '', year: '' });
                      fetchAllVacationRecords();
                    }}
                    className="px-4 py-2 text-xs border border-almet-mystic dark:border-almet-comet text-almet-cloud-burst dark:text-white rounded-lg hover:bg-almet-mystic/30 dark:hover:bg-gray-700 transition-all"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-almet-mystic/30 dark:divide-almet-comet">
                <thead className="bg-almet-mystic/50 dark:bg-gray-700/50">
                  <tr>
                    {['Request ID', 'Employee', 'Type', 'Period', 'Days', 'Status', 'Attachments', 'Actions'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-almet-comet dark:text-almet-bali-hai uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-almet-mystic/20 dark:divide-almet-comet/20">
                  {allVacationRecords.map(record => (
                    <tr key={`${record.type}-${record.id}`} className="hover:bg-almet-mystic/20 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 text-xs font-medium text-almet-sapphire">{record.request_id}</td>
                      <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{record.employee_name}</td>
                      <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{record.vacation_type}</td>
                      <td className="px-4 py-3 text-xs text-almet-waterloo dark:text-almet-bali-hai">{record.start_date} - {record.end_date}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-almet-cloud-burst dark:text-white">{record.days}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          record.status === 'Scheduled' || record.status === 'Registered' ? 'bg-blue-50 text-almet-sapphire dark:bg-blue-900/30 dark:text-almet-astral' : 
                          record.status.includes('Pending') ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' : 
                          record.status === 'Approved' ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                          'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                                            <td className="px-4 py-3 text-xs">
                        {record.type === 'request' && record.has_attachments ? (
                          <button
                            onClick={() => handleViewAttachments(record.request_id, record.request_id)}
                            className="flex items-center gap-1 text-almet-sapphire hover:text-almet-cloud-burst dark:text-almet-astral font-medium"
                          >
                            <Paperclip className="w-3 h-3" />
                            {record.attachments_count}
                          </button>
                        ) : (
                          <span className="text-almet-waterloo/50 dark:text-almet-bali-hai/50">-</span>
                        )}
                      </td>
                     <td className="px-4 py-3 text-xs">
  {record.type === 'request' ? (
    <button 
      onClick={() => handleViewDetails(record.id)}
      className="text-almet-sapphire hover:text-almet-cloud-burst dark:text-almet-astral flex items-center gap-1 font-medium"
    >
      <Eye className="w-3 h-3" />
      View
    </button>
  ) : record.can_edit ? (
    <div className="flex gap-2">
      <button 
        onClick={() => handleViewScheduleDetail(record.id)} 
        className="text-almet-sapphire hover:text-almet-cloud-burst dark:text-almet-astral flex items-center gap-1 font-medium"
      >
        <Eye className="w-3 h-3" />
        View
      </button>
      <button 
        onClick={() => handleEditSchedule(record)} 
        className="text-almet-sapphire hover:text-almet-cloud-burst dark:text-almet-astral flex items-center gap-1 font-medium"
      >
        <Edit className="w-3 h-3" />
        Edit
      </button>
      <button 
        onClick={() => handleRegisterSchedule(record.id)} 
        className="text-green-600 hover:text-green-800 dark:text-green-400 flex items-center gap-1 font-medium"
      >
        <Check className="w-3 h-3" />
        Register
      </button>
    </div>
  ) : (
    <button 
      onClick={() => handleViewScheduleDetail(record.id)}
      className="text-almet-sapphire hover:text-almet-cloud-burst dark:text-almet-astral flex items-center gap-1 font-medium"
    >
      <Eye className="w-3 h-3" />
      View
    </button>
  )}
</td>
                    </tr>
                  ))}
                  {allVacationRecords.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-4 py-12 text-center">
                        <FileText className="w-10 h-10 text-almet-waterloo/30 dark:text-almet-bali-hai/30 mx-auto mb-3" />
                        <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai">No records found</p>
                        <p className="text-xs text-almet-waterloo/70 dark:text-almet-bali-hai/70 mt-1">Try adjusting your filters</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Edit Schedule Modal */}
      {editModalOpen && editingSchedule && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-almet-mystic/50 dark:border-almet-comet">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4 flex items-center justify-between z-10">
              <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white flex items-center gap-2">
                <Edit className="w-4 h-4 text-almet-sapphire" />
                Edit Schedule (Edit {editingSchedule.edit_count + 1}/{vacationSettings.max_schedule_edits})
              </h2>
              <button
                onClick={() => {
                  setEditModalOpen(false);
                  setEditingSchedule(null);
                }}
                className="text-almet-waterloo hover:text-almet-cloud-burst dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-almet-mystic/30 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                  Leave Type
                </label>
                <SearchableDropdown
                  options={vacationTypes.map(type => ({ value: type.id, label: type.name }))}
                  value={editingSchedule.vacation_type_id}
                  onChange={(value) => setEditingSchedule(prev => ({...prev, vacation_type_id: value}))}
                  placeholder="Select type"
                  darkMode={darkMode}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                  Start Date
                </label>
                <input
                  type="date"
                  value={editingSchedule.start_date}
                  onChange={(e) => setEditingSchedule(prev => ({...prev, start_date: e.target.value}))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2.5 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                  End Date
                </label>
                <input
                  type="date"
                  value={editingSchedule.end_date}
                  onChange={(e) => setEditingSchedule(prev => ({...prev, end_date: e.target.value}))}
                  min={editingSchedule.start_date}
                  className="w-full px-3 py-2.5 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                  Comment (Optional)
                </label>
                <textarea
                  value={editingSchedule.comment}
                  onChange={(e) => setEditingSchedule(prev => ({...prev, comment: e.target.value}))}
                  rows={3}
                  placeholder="Add any notes..."
                  className="w-full px-3 py-2.5 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg focus:ring-1 focus:ring-almet-sapphire focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-almet-mystic/30 dark:bg-gray-900/30 border-t border-almet-mystic/30 dark:border-almet-comet/30 px-5 py-4 flex justify-end gap-3">
              <button
                onClick={() => {
                  setEditModalOpen(false);
                  setEditingSchedule(null);
                }}
                className="px-5 py-2.5 text-sm border border-almet-bali-hai/40 dark:border-almet-comet rounded-lg text-almet-cloud-burst dark:text-white hover:bg-white dark:hover:bg-gray-700 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={loading}
                className="px-6 py-2.5 text-sm bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all flex items-center gap-2 disabled:opacity-50 shadow-md"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Approval Modal */}
      <ApprovalModal
        show={showApprovalModal}
        onClose={() => {
          setShowApprovalModal(false);
          setSelectedRequest(null);
          setApprovalComment('');
        }}
        selectedRequest={selectedRequest}
        approvalAmount=""
        setApprovalAmount={() => {}}
        approvalNote={approvalComment}
        setApprovalNote={setApprovalComment}
        onApprove={handleConfirmApproval}
        loading={loading}
      />

      {/* Rejection Modal */}
      <RejectionModal
        show={showRejectionModal}
        onClose={() => {
          setShowRejectionModal(false);
          setSelectedRequest(null);
          setRejectionReason('');
        }}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        onReject={handleConfirmRejection}
        loading={loading}
      />

      {/* Attachments Modal */}
      <AttachmentsModal
        show={showAttachmentsModal}
        onClose={() => {
          setShowAttachmentsModal(false);
          setSelectedRequestId(null);
          setSelectedRequestNumber(null);
        }}
        requestId={selectedRequestNumber}
        requestNumber={selectedRequestNumber}
        canUpload={false}
        canDelete={false}
        onUpdate={() => {
          if (activeTab === 'all') {
            fetchMyAllRecords();
          }
        }}
      />

      {/* Request Detail Modal */}
      <RequestDetailModal
        show={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedRequestId(null);
        }}
        requestId={selectedRequestId}
        onAttachmentsClick={(requestId, requestNumber) => {
          setShowDetailModal(false);
          handleViewAttachments(requestId, requestNumber);
        }}
      />
      <ScheduleDetailModal
  show={showScheduleDetailModal}
  onClose={() => {
    setShowScheduleDetailModal(false);
    setSelectedScheduleId(null);
  }}
  scheduleId={selectedScheduleId}
/>
    </DashboardLayout>
  );
}                                  

                            