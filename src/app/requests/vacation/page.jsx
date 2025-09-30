"use client";
import { useState, useEffect } from 'react';
import { 
  Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle, Plus, 
  FileText, Download, Check, Search, Edit, Trash, UserPlus, User
} from 'lucide-react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { useToast } from "@/components/common/Toast";
import SearchableDropdown from "@/components/common/SearchableDropdown";
import { VacationService, VacationHelpers } from '@/services/vacationService';

export default function VacationRequestsPage() {
  const { darkMode } = useTheme();
  const { showSuccess, showError, showInfo } = useToast();
  
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
  const [myAllRecords, setMyAllRecords] = useState([]);
  const [employeeSearchResults, setEmployeeSearchResults] = useState([]);

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

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchDashboard(),
        fetchVacationTypes(),
        fetchHRRepresentatives()
      ]);
    } catch (error) {
      console.error('Initialization error:', error);
      showError('Failed to load initial data');
    } finally {
      setLoading(false);
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

  const fetchMyAllRecords = async () => {
    try {
      const data = await VacationService.getMyAllVacations();
      setMyAllRecords(data.records || []);
    } catch (error) {
      console.error('My records fetch error:', error);
    }
  };

  useEffect(() => {
    if (activeTab === 'approval') {
      fetchPendingRequests();
    } else if (activeTab === 'all') {
      fetchMyAllRecords();
    } else if (activeSection === 'scheduling') {
      fetchScheduleTabs();
    }
  }, [activeTab, activeSection]);

  const handleEmployeeSearch = async (query) => {
    if (!query || query.length < 2) {
      setEmployeeSearchResults([]);
      return;
    }
    try {
      const data = await VacationService.searchEmployees(query);
      setEmployeeSearchResults(data.results || []);
    } catch (error) {
      console.error('Employee search error:', error);
    }
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
        setFormData(prev => ({ ...prev, numberOfDays: days, dateOfReturn: endDate.toISOString().split('T')[0] }));
      }
    };
    updateWorkingDays();
  }, [formData.start_date, formData.end_date]);

  useEffect(() => {
    if (requester === 'for_me') {
      setFormData(prev => ({ ...prev, requester_type: 'for_me', employee_id: null, employee_manual: null }));
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
  }, [requester]);

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      if (activeSection === 'immediate') {
        if (formData.hr_representative_id) {
          requestData.hr_representative_id = formData.hr_representative_id;
        }
        await VacationService.createImmediateRequest(requestData);
        showSuccess('Request submitted successfully for approval');
      } else {
        await VacationService.createSchedule(requestData);
        showSuccess('Schedule saved successfully - no approval needed');
        fetchScheduleTabs();
        fetchDashboard();
      }

      setFormData(prev => ({ ...prev, start_date: '', end_date: '', dateOfReturn: '', numberOfDays: 0, comment: '' }));
    } catch (error) {
      console.error('Submit error:', error);
      showError(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReject = async (requestId, action, comment = '', reason = '') => {
    try {
      await VacationService.approveRejectRequest(requestId, {
        action,
        comment: action === 'approve' ? comment : undefined,
        reason: action === 'reject' ? reason : undefined
      });
      showSuccess(`Request ${action}d successfully`);
      fetchPendingRequests();
    } catch (error) {
      console.error('Approval error:', error);
      showError(`Failed to ${action} request`);
    }
  };

  const handleRegisterSchedule = async (scheduleId) => {
    try {
      await VacationService.registerSchedule(scheduleId);
      showSuccess('Schedule registered successfully');
      fetchScheduleTabs();
      fetchDashboard();
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
    } catch (error) {
      console.error('Delete error:', error);
      showError('Failed to delete schedule');
    }
  };

  const handleExportMyVacations = async () => {
    try {
      const blob = await VacationService.exportMyVacations();
      VacationHelpers.downloadBlobFile(blob, 'my_vacations.xlsx');
      showSuccess('Export completed successfully');
    } catch (error) {
      console.error('Export error:', error);
      showError('Export failed');
    }
  };

  const handleExportSchedules = async () => {
    try {
      const blob = await VacationService.exportAllVacationRecords();
      VacationHelpers.downloadBlobFile(blob, 'vacation_schedules.xlsx');
      showSuccess('Export completed successfully');
    } catch (error) {
      console.error('Export error:', error);
      showError('Export failed');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-almet-mystic dark:border-almet-comet hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value || 0}</p>
        </div>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
    </div>
  );

  if (loading && !balances) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-almet-sapphire"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-almet-cloud-burst dark:text-white mb-2">Vacation Management</h1>
          <p className="text-almet-waterloo dark:text-almet-bali-hai">Manage your vacation requests and schedules</p>
        </div>

        <div className="mb-6 border-b border-almet-bali-hai dark:border-almet-comet">
          <div className="flex space-x-8">
            {['request', 'approval', 'all'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-almet-sapphire text-almet-sapphire dark:text-almet-astral'
                    : 'border-transparent text-almet-waterloo hover:text-almet-cloud-burst dark:text-almet-bali-hai dark:hover:text-almet-mystic'
                }`}>
                {tab === 'request' ? 'Request Submission' : tab === 'approval' ? 'Approval' : 'My All Requests & Schedules'}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'request' && (
          <>
            {balances && (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                <StatCard title="Total Balance" value={balances.total_balance} icon={Calendar} color="text-almet-sapphire" />
                <StatCard title="Yearly Balance" value={balances.yearly_balance} icon={Calendar} color="text-almet-astral" />
                <StatCard title="Used Days" value={balances.used_days} icon={CheckCircle} color="text-orange-600" />
                <StatCard title="Remaining Balance" value={balances.remaining_balance} icon={Clock} color="text-almet-steel-blue" />
                <StatCard title="Scheduled Days" value={balances.scheduled_days} icon={Users} color="text-almet-san-juan" />
                <StatCard title="Should be Planned" value={balances.should_be_planned} icon={AlertCircle} color="text-red-600" />
              </div>
            )}

            <div className="mb-6 flex space-x-4">
              {['immediate', 'scheduling'].map(section => (
                <button key={section} onClick={() => setActiveSection(section)}
                  className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                    activeSection === section
                      ? 'bg-almet-sapphire text-white hover:bg-almet-cloud-burst'
                      : 'bg-white text-almet-cloud-burst border border-almet-bali-hai hover:bg-almet-mystic dark:bg-gray-700 dark:text-almet-mystic dark:border-almet-comet'
                  }`}>
                  {section === 'immediate' ? 'Request Immediately (Requires Approval)' : 'Scheduling (No Approval Needed)'}
                </button>
              ))}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-almet-mystic dark:border-almet-comet">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-almet-cloud-burst dark:text-white">
                  {activeSection === 'immediate' ? 'Request Immediately' : 'Schedule Vacation'}
                </h2>
                {activeSection === 'scheduling' && (
                  <div className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                    No Approval Required
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-almet-cloud-burst dark:text-white mb-4">Employee Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">Requester</label>
                      <select value={requester} onChange={(e) => setRequester(e.target.value)}
                        className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white">
                        <option value="for_me">For Me</option>
                        <option value="for_my_employee">For My Employee</option>
                      </select>
                    </div>

                    {requester === 'for_my_employee' && (
                      <div>
                        <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">Search Employee</label>
                        <SearchableDropdown
                          options={employeeSearchResults.map(emp => ({ value: emp.id, label: `${emp.name} (${emp.employee_id})`, ...emp }))}
                          value={formData.employee_id}
                          onChange={(value) => {
                            const selectedEmployee = employeeSearchResults.find(emp => emp.id === value);
                            if (selectedEmployee) {
                              setFormData(prev => ({
                                ...prev,
                                employee_id: value,
                                employeeName: selectedEmployee.name,
                                businessFunction: selectedEmployee.business_function_name || '',
                                department: selectedEmployee.department_name || '',
                                unit: selectedEmployee.unit_name || '',
                                jobFunction: selectedEmployee.job_function || '',
                                phoneNumber: selectedEmployee.phone || '',
                                line_manager: selectedEmployee.line_manager || ''
                              }));
                            }
                          }}
                          placeholder="Select employee"
                          searchPlaceholder="Search employee..."
                          onSearchChange={handleEmployeeSearch}
                          darkMode={darkMode}
                        />
                      </div>
                    )}

                    {['employeeName', 'businessFunction', 'department', 'unit', 'jobFunction', 'phoneNumber'].map(field => (
                      <div key={field}>
                        <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                          {field === 'employeeName' ? 'Employee Name' : field === 'businessFunction' ? 'Business Function' : 
                           field === 'department' ? 'Department' : field === 'unit' ? 'Unit' : 
                           field === 'jobFunction' ? 'Job Function' : 'Phone Number'}
                        </label>
                        <input type={field === 'phoneNumber' ? 'tel' : 'text'}
                          value={formData[field]}
                          onChange={(e) => setFormData(prev => ({...prev, [field]: e.target.value}))}
                          disabled={requester === 'for_me'}
                          className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white disabled:bg-almet-mystic dark:disabled:bg-gray-600"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-medium text-almet-cloud-burst dark:text-white mb-4">Leave Request Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">Leave Type</label>
                      <SearchableDropdown
                        options={vacationTypes.map(type => ({ value: type.id, label: type.name }))}
                        value={formData.vacation_type_id}
                        onChange={(value) => setFormData(prev => ({...prev, vacation_type_id: value}))}
                        placeholder="Select leave type"
                        darkMode={darkMode}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">Start Date</label>
                      <input type="date" value={formData.start_date}
                        onChange={(e) => setFormData(prev => ({...prev, start_date: e.target.value}))}
                        className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white" required />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">End Date</label>
                      <input type="date" value={formData.end_date}
                        onChange={(e) => setFormData(prev => ({...prev, end_date: e.target.value}))}
                        className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white" required />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">Date of Return</label>
                      <input type="date" value={formData.dateOfReturn} disabled
                        className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg dark:text-white bg-almet-mystic dark:bg-gray-600" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">Number of Days</label>
                      <input type="number" value={formData.numberOfDays} disabled
                        className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg dark:text-white bg-almet-mystic dark:bg-gray-600" />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">Comment (Optional)</label>
                      <textarea value={formData.comment}
                        onChange={(e) => setFormData(prev => ({...prev, comment: e.target.value}))} rows={3}
                        className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white" />
                    </div>
                  </div>
                </div>

                {activeSection === 'immediate' && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-almet-cloud-burst dark:text-white mb-4">Approval</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">Line Manager</label>
                        <input type="text" value={formData.line_manager}
                          onChange={(e) => setFormData(prev => ({...prev, line_manager: e.target.value}))}
                          disabled={requester === 'for_me'} placeholder="Line Manager Name"
                          className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white disabled:bg-almet-mystic dark:disabled:bg-gray-600" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">HR Representative</label>
                        <SearchableDropdown
                          options={hrRepresentatives.map(hr => ({ value: hr.id, label: `${hr.name} (${hr.department})` }))}
                          value={formData.hr_representative_id}
                          onChange={(value) => setFormData(prev => ({...prev, hr_representative_id: value}))}
                          placeholder="Select HR representative"
                          darkMode={darkMode}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <button type="button"
                    onClick={() => setFormData(prev => ({ ...prev, start_date: '', end_date: '', dateOfReturn: '', numberOfDays: 0, comment: '' }))}
                    className="px-6 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg text-almet-cloud-burst dark:text-almet-mystic hover:bg-almet-mystic dark:hover:bg-gray-700 transition-colors">
                    Clear
                  </button>
                  <button type="submit"
                    disabled={loading || !formData.start_date || !formData.end_date || !formData.vacation_type_id}
                    className="px-6 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> :
                      activeSection === 'immediate' ? <><CheckCircle className="w-4 h-4" />Submit for Approval</> :
                      <><Plus className="w-4 h-4" />Save Schedule</>}
                  </button>
                </div>
              </form>

              {activeSection === 'scheduling' && (
                <div className="mt-8 pt-8 border-t border-almet-bali-hai dark:border-almet-comet">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex space-x-8 border-b border-almet-bali-hai dark:border-almet-comet">
                      {['upcoming', 'peers', 'all'].map(tab => (
                        <button key={tab} onClick={() => setSchedulesTab(tab)}
                          className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                            schedulesTab === tab
                              ? 'border-almet-sapphire text-almet-sapphire dark:text-almet-astral'
                              : 'border-transparent text-almet-waterloo hover:text-almet-cloud-burst dark:text-almet-bali-hai'
                          }`}>
                          {tab === 'upcoming' ? 'My Upcoming Schedules' : tab === 'peers' ? 'My Peers and Team Schedule' : 'All Schedules'}
                        </button>
                      ))}
                    </div>
                    <button onClick={handleExportSchedules}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                      <Download className="w-4 h-4" />Export Schedules
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-almet-bali-hai dark:divide-almet-comet">
                      <thead className="bg-almet-mystic dark:bg-gray-700">
                        <tr>
                          {['Employee Name', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status', 'Actions'].map(header => (
                            <th key={header} className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-almet-bali-hai dark:divide-almet-comet">
                        {scheduleTabs[schedulesTab]?.map(schedule => (
                          <tr key={schedule.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">{schedule.employee_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">{schedule.vacation_type_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">{schedule.start_date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">{schedule.end_date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">{schedule.number_of_days}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                schedule.status === 'SCHEDULED' ? 'bg-blue-100 text-almet-sapphire dark:bg-blue-900 dark:text-almet-astral' : 
                                'bg-gray-100 text-almet-waterloo dark:bg-gray-700 dark:text-almet-bali-hai'}`}>
                                {schedule.status_display}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {schedule.can_edit && (
                                <div className="flex gap-2">
                                  <button onClick={() => showInfo('Edit functionality coming soon')}
                                    className="text-almet-sapphire hover:text-almet-cloud-burst dark:text-almet-astral dark:hover:text-almet-steel-blue flex items-center gap-1">
                                    <Edit className="w-3 h-3" />Edit
                                  </button>
                                  <button onClick={() => handleDeleteSchedule(schedule.id)}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1">
                                    <Trash className="w-3 h-3" />Delete
                                  </button>
                                  <button onClick={() => handleRegisterSchedule(schedule.id)}
                                    className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 flex items-center gap-1">
                                    <Check className="w-3 h-3" />Register
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                        {scheduleTabs[schedulesTab]?.length === 0 && (
                          <tr>
                            <td colSpan="7" className="px-6 py-4 text-center text-almet-waterloo dark:text-almet-bali-hai">No schedules found</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'approval' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-almet-mystic dark:border-almet-comet">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-almet-cloud-burst dark:text-white">Pending Approvals</h2>
                <span className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 px-3 py-1 rounded-full text-sm font-medium">
                  {(pendingRequests.line_manager_requests?.length || 0) + (pendingRequests.hr_requests?.length || 0)} Pending
                </span>
              </div>
              
              <div className="space-y-4">
                {pendingRequests.line_manager_requests?.map(request => (
                  <div key={request.id} className="border border-almet-bali-hai dark:border-almet-comet rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-almet-cloud-burst dark:text-white">{request.employee_name}</h3>
                        <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai mt-1">
                          {request.vacation_type_name} • {request.start_date} to {request.end_date} ({request.number_of_days} days)
                        </p>
                        <p className="text-xs text-almet-comet dark:text-almet-bali-hai mt-1">Status: {request.status_display}</p>
                        {request.comment && <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-1">Comment: {request.comment}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleApproveReject(request.id, 'approve', 'Approved by line manager')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />Approve
                        </button>
                        <button onClick={() => {
                            const reason = prompt('Please provide a reason for rejection:');
                            if (reason) handleApproveReject(request.id, 'reject', '', reason);
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1">
                          <XCircle className="w-4 h-4" />Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {pendingRequests.hr_requests?.map(request => (
                  <div key={request.id} className="border border-almet-bali-hai dark:border-almet-comet rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-almet-cloud-burst dark:text-white">
                          {request.employee_name} <span className="text-xs bg-blue-100 dark:bg-blue-800 px-2 py-1 rounded">HR Review</span>
                        </h3>
                        <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai mt-1">
                          {request.vacation_type_name} • {request.start_date} to {request.end_date} ({request.number_of_days} days)
                        </p>
                        <p className="text-xs text-almet-comet dark:text-almet-bali-hai mt-1">Status: {request.status_display}</p>
                        {request.comment && <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-1">Comment: {request.comment}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleApproveReject(request.id, 'approve', 'Approved by HR')}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />Approve
                        </button>
                        <button onClick={() => {
                            const reason = prompt('Please provide a reason for rejection:');
                            if (reason) handleApproveReject(request.id, 'reject', '', reason);
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1">
                          <XCircle className="w-4 h-4" />Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {(pendingRequests.line_manager_requests?.length === 0 && pendingRequests.hr_requests?.length === 0) && (
                  <div className="text-center py-8">
                    <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <p className="text-almet-waterloo dark:text-almet-bali-hai">No pending approval requests</p>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-almet-mystic dark:border-almet-comet">
              <h2 className="text-xl font-semibold text-almet-cloud-burst dark:text-white mb-6">Approval History</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-almet-bali-hai dark:divide-almet-comet">
                  <thead className="bg-almet-mystic dark:bg-gray-700">
                    <tr>
                      {['Employee', 'Leave Type', 'Period', 'Status', 'Date'].map(header => (
                        <th key={header} className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-almet-bali-hai dark:divide-almet-comet">
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-almet-waterloo dark:text-almet-bali-hai">No approval history available</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'all' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-almet-mystic dark:border-almet-comet">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-almet-cloud-burst dark:text-white">My All Requests & Schedules</h2>
              <button onClick={handleExportMyVacations}
                className="px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />Export
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-almet-bali-hai dark:divide-almet-comet">
                <thead className="bg-almet-mystic dark:bg-gray-700">
                  <tr>
                    {['Type', 'Leave Type', 'Start Date', 'End Date', 'Days', 'Status', 'Actions'].map(header => (
                      <th key={header} className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-almet-bali-hai dark:divide-almet-comet">
                  {myAllRecords.map(record => (
                    <tr key={`${record.type}-${record.id}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.type === 'schedule' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                          {record.type === 'schedule' ? 'Schedule' : 'Request'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">{record.vacation_type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">{record.start_date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">{record.end_date}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">{record.days}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.status === 'Scheduled' ? 'bg-blue-100 text-almet-sapphire dark:bg-blue-900 dark:text-almet-astral' :
                          record.status === 'Pending HR' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          record.status === 'Pending Line Manager' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200' :
                          'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {record.type === 'schedule' && record.can_edit && (
                          <div className="flex gap-2">
                            <button onClick={() => showInfo('Edit functionality coming soon')}
                              className="text-almet-sapphire hover:text-almet-cloud-burst dark:text-almet-astral dark:hover:text-almet-steel-blue flex items-center gap-1">
                              <Edit className="w-3 h-3" />Edit
                            </button>
                            <button onClick={() => handleRegisterSchedule(record.id)}
                              className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 flex items-center gap-1">
                              <Check className="w-3 h-3" />Register
                            </button>
                          </div>
                        )}
                        {record.type === 'request' && <span className="text-almet-waterloo dark:text-almet-bali-hai text-xs">View Only</span>}
                      </td>
                    </tr>
                  ))}
                  {myAllRecords.length === 0 && (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-almet-waterloo dark:text-almet-bali-hai">No records found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}