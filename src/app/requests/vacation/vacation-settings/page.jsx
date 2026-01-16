// app/requests/vacation/vacation-settings/page.jsx - COMPLETE VERSION
"use client";
import { useState, useEffect } from 'react';
import { Calendar, Users, Settings, Save, Plus, Trash2, AlertCircle, CheckCircle, Shield, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { useToast } from "@/components/common/Toast";
import { VacationService } from '@/services/vacationService';
import SearchableDropdown from "@/components/common/SearchableDropdown";

export default function VacationSettingsPage() {
  const { darkMode } = useTheme();
  const { showSuccess, showError } = useToast();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('calendar');
  
  // ✅ Dual Production Calendar States
  const [azHolidays, setAzHolidays] = useState([]);
  const [ukHolidays, setUkHolidays] = useState([]);
  const [newAzHoliday, setNewAzHoliday] = useState({ date: '', name: '' });
  const [newUkHoliday, setNewUkHoliday] = useState({ date: '', name: '' });
  
  // ✅ UK Additional Approver State
  const [ukApprover, setUkApprover] = useState(null);
  const [selectedApprover, setSelectedApprover] = useState(null);
  const [employees, setEmployees] = useState([]);
  
  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    allow_negative_balance: false,
    max_schedule_edits: 3,
    notification_days_before: 7,
    notification_frequency: 2
  });
  
  // HR Representative
  const [hrRepresentatives, setHrRepresentatives] = useState([]);
  const [defaultHR, setDefaultHR] = useState(null);
  const [selectedHR, setSelectedHR] = useState(null);

  useEffect(() => {
    fetchAllSettings();
    fetchEmployees();
  }, []);

  const fetchAllSettings = async () => {
    setLoading(true);
    try {
      const [calendarData, generalData, hrData, ukApproverData] = await Promise.all([
        VacationService.getProductionCalendar(),
        VacationService.getGeneralSettings(),
        VacationService.getHRRepresentatives(),
        VacationService.getUKAdditionalApprover()
      ]);
      
      // ✅ Set dual calendars
      setAzHolidays(calendarData.azerbaijan || []);
      setUkHolidays(calendarData.uk || []);
      
      setGeneralSettings(generalData);
      setHrRepresentatives(hrData.hr_representatives || []);
      setDefaultHR(hrData.current_default);
      if (hrData.current_default) {
        setSelectedHR(hrData.current_default.id);
      }
      
      // ✅ Set UK Approver
      setUkApprover(ukApproverData.uk_additional_approver);
      if (ukApproverData.uk_additional_approver) {
        setSelectedApprover(ukApproverData.uk_additional_approver.id);
      }
    } catch (error) {
      console.error('Settings fetch error:', error);
      showError('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await VacationService.searchEmployees();
      setEmployees(data.results || []);
    } catch (error) {
      console.error('Employees fetch error:', error);
    }
  };

  // ✅ Azerbaijan Holiday Handlers
  const handleAddAzHoliday = () => {
    if (!newAzHoliday.date || !newAzHoliday.name) {
      showError('Date and name are required');
      return;
    }
    
    if (azHolidays.some(h => h.date === newAzHoliday.date)) {
      showError('Holiday already exists for this date');
      return;
    }
    
    setAzHolidays([...azHolidays, newAzHoliday].sort((a, b) => a.date.localeCompare(b.date)));
    setNewAzHoliday({ date: '', name: '' });
  };

  const handleRemoveAzHoliday = (index) => {
    if (confirm('Are you sure you want to remove this holiday?')) {
      setAzHolidays(azHolidays.filter((_, i) => i !== index));
    }
  };

  // ✅ UK Holiday Handlers
  const handleAddUkHoliday = () => {
    if (!newUkHoliday.date || !newUkHoliday.name) {
      showError('Date and name are required');
      return;
    }
    
    if (ukHolidays.some(h => h.date === newUkHoliday.date)) {
      showError('Holiday already exists for this date');
      return;
    }
    
    setUkHolidays([...ukHolidays, newUkHoliday].sort((a, b) => a.date.localeCompare(b.date)));
    setNewUkHoliday({ date: '', name: '' });
  };

  const handleRemoveUkHoliday = (index) => {
    if (confirm('Are you sure you want to remove this holiday?')) {
      setUkHolidays(ukHolidays.filter((_, i) => i !== index));
    }
  };

  // ✅ Save Production Calendars
  const handleSaveCalendars = async () => {
    setLoading(true);
    try {
      await VacationService.updateNonWorkingDays({
        non_working_days_az: azHolidays,
        non_working_days_uk: ukHolidays
      });
      showSuccess('Production calendars updated successfully');
    } catch (error) {
      console.error('Calendar save error:', error);
      showError(error.response?.data?.error || 'Failed to save calendars');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Save UK Additional Approver
  const handleSaveUKApprover = async () => {
    if (!selectedApprover) {
      showError('Please select an approver');
      return;
    }
    
    setLoading(true);
    try {
      await VacationService.setUKAdditionalApprover({
        uk_additional_approver_id: selectedApprover
      });
      showSuccess('UK Additional Approver updated successfully');
      await fetchAllSettings();
    } catch (error) {
      console.error('UK Approver save error:', error);
      showError(error.response?.data?.error || 'Failed to save UK approver');
    } finally {
      setLoading(false);
    }
  };

  // Save General Settings
  const handleSaveGeneralSettings = async () => {
    setLoading(true);
    try {
      await VacationService.updateGeneralSettings(generalSettings);
      showSuccess('General settings updated successfully');
    } catch (error) {
      console.error('General settings save error:', error);
      showError(error.response?.data?.error || 'Failed to save general settings');
    } finally {
      setLoading(false);
    }
  };

  // Save HR Representative
  const handleSaveHR = async () => {
    if (!selectedHR) {
      showError('Please select an HR representative');
      return;
    }
    
    setLoading(true);
    try {
      await VacationService.updateDefaultHRRepresentative({
        default_hr_representative_id: selectedHR
      });
      showSuccess('HR representative updated successfully');
      await fetchAllSettings();
    } catch (error) {
      console.error('HR save error:', error);
      showError(error.response?.data?.error || 'Failed to save HR representative');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { key: 'calendar', label: 'Production Calendar', icon: Calendar },
    { key: 'uk-approver', label: 'UK Approver', icon: Shield },
    { key: 'general', label: 'General Settings', icon: Settings },
    { key: 'hr', label: 'HR Representative', icon: Users }
  ];

  // ✅ Filter UK employees for approver selection
  const ukEmployees = employees.filter(emp => 
    emp.business_function_name?.toUpperCase().includes('UK')
  );

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-almet-cloud-burst dark:text-white">Vacation Settings</h1>
            <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-1">Configure vacation system parameters</p>
          </div>
          <button
            onClick={() => router.push('/requests/vacation')}
            className="flex items-center gap-2 px-4 py-2 text-xs bg-almet-mystic dark:bg-gray-700 text-almet-cloud-burst dark:text-white rounded-lg hover:bg-almet-mystic/60 dark:hover:bg-gray-600 transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Vacation
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-almet-mystic dark:border-almet-comet">
          <div className="flex space-x-8">
            {tabs.map(tab => (
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

        {/* ✅ PRODUCTION CALENDAR TAB */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">Dual Calendar System</h3>
                  <p className="text-xs text-blue-800 dark:text-blue-300 mt-1">
                    <strong>Azerbaijan:</strong> Weekends (Saturday/Sunday) are working days, only holidays listed below are excluded from working days calculation.<br/>
                    <strong>UK:</strong> Both weekends (Saturday/Sunday) AND holidays listed below are excluded from working days calculation.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              {/* ✅ Azerbaijan Calendar */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">Azerbaijan Holidays</h3>
                  </div>
                  <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded text-xs font-medium">
                    {azHolidays.length} holidays
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newAzHoliday.date}
                      onChange={(e) => setNewAzHoliday({...newAzHoliday, date: e.target.value})}
                      className="w-full px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                      Holiday Name
                    </label>
                    <input
                      type="text"
                      value={newAzHoliday.name}
                      onChange={(e) => setNewAzHoliday({...newAzHoliday, name: e.target.value})}
                      placeholder="e.g., Novruz Bayramı"
                      className="w-full px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <button
                    onClick={handleAddAzHoliday}
                    className="w-full px-4 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Azerbaijan Holiday
                  </button>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {azHolidays.map((holiday, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-almet-cloud-burst dark:text-white truncate">{holiday.name}</p>
                        <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">{new Date(holiday.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveAzHoliday(index)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0 ml-2"
                        title="Remove holiday"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {azHolidays.length === 0 && (
                    <div className="text-center py-8 text-sm text-almet-waterloo dark:text-almet-bali-hai">
                      No Azerbaijan holidays added yet
                    </div>
                  )}
                </div>
              </div>

              {/* ✅ UK Calendar */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-red-600" />
                    <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">UK Holidays</h3>
                  </div>
                  <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded text-xs font-medium">
                    {ukHolidays.length} holidays
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newUkHoliday.date}
                      onChange={(e) => setNewUkHoliday({...newUkHoliday, date: e.target.value})}
                      className="w-full px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-almet-comet dark:text-almet-bali-hai mb-1.5">
                      Holiday Name
                    </label>
                    <input
                      type="text"
                      value={newUkHoliday.name}
                      onChange={(e) => setNewUkHoliday({...newUkHoliday, name: e.target.value})}
                      placeholder="e.g., Christmas Day"
                      className="w-full px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                  <button
                    onClick={handleAddUkHoliday}
                    className="w-full px-4 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add UK Holiday
                  </button>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {ukHolidays.map((holiday, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-almet-cloud-burst dark:text-white truncate">{holiday.name}</p>
                        <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">{new Date(holiday.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      </div>
                      <button
                        onClick={() => handleRemoveUkHoliday(index)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors flex-shrink-0 ml-2"
                        title="Remove holiday"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  {ukHolidays.length === 0 && (
                    <div className="text-center py-8 text-sm text-almet-waterloo dark:text-almet-bali-hai">
                      No UK holidays added yet
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveCalendars}
                disabled={loading}
                className="px-6 py-2.5 text-sm bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all flex items-center gap-2 disabled:opacity-50 shadow-md"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Production Calendars
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ✅ UK APPROVER TAB */}
        {activeTab === 'uk-approver' && (
          <div className="space-y-6">
            <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-orange-900 dark:text-orange-200">UK Additional Approver</h3>
                  <p className="text-xs text-orange-800 dark:text-orange-300 mt-1">
                    For UK employees requesting 5+ days vacation, an additional approval step is required after Line Manager approval.
                    <br/>
                    This approver should typically be from the <strong>Vice Chairman</strong> or senior management position group.
                    <br/>
                    <strong>Important:</strong> This applies only to UK employees. Azerbaijan employees follow the standard 2-step approval (Line Manager → HR).
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet p-6">
              <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white mb-4">Current UK Additional Approver</h3>
              
              {ukApprover ? (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-900 dark:text-green-200">{ukApprover.name}</p>
                      <div className="flex flex-wrap gap-2 mt-2 text-xs text-green-800 dark:text-green-300">
                        <span className="bg-green-100 dark:bg-green-800/50 px-2 py-0.5 rounded">
                          {ukApprover.employee_id}
                        </span>
                        <span className="bg-green-100 dark:bg-green-800/50 px-2 py-0.5 rounded">
                          {ukApprover.position_group}
                        </span>
                        <span className="bg-green-100 dark:bg-green-800/50 px-2 py-0.5 rounded">
                          {ukApprover.business_function}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">No UK Additional Approver Set</p>
                      <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                        UK employees requesting 5+ days vacation will not be able to proceed past Line Manager approval until an additional approver is configured.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                    Select UK Additional Approver
                  </label>
                  <SearchableDropdown
                    options={ukEmployees.map(emp => ({
                      value: emp.id,
                      label: `${emp.name} (${emp.employee_id}) - ${emp.position_group_name || 'N/A'}`,
                      badge: emp.position_group_name?.includes('Vice') ? 'Recommended' : null
                    }))}
                    value={selectedApprover}
                    onChange={setSelectedApprover}
                    placeholder="Select UK employee..."
                    darkMode={darkMode}
                    searchPlaceholder="Search UK employees..."
                    allowUncheck={true}
                  />
                  <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-1.5">
                    Only UK employees are shown in the list. Employees with "Vice Chairman" in their position group are recommended.
                  </p>
                </div>

                <button
                  onClick={handleSaveUKApprover}
                  disabled={loading || !selectedApprover}
                  className="w-full px-6 py-2.5 text-sm bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save UK Additional Approver
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ✅ GENERAL SETTINGS TAB */}
        {activeTab === 'general' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet p-6">
            <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white mb-6">General Settings</h3>
            
            <div className="space-y-6">
              {/* Allow Negative Balance */}
              <div className="flex items-start justify-between p-4 bg-almet-mystic/10 dark:bg-gray-900/20 rounded-lg border border-almet-mystic/30 dark:border-almet-comet/30">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-almet-cloud-burst dark:text-white mb-1">Allow Negative Balance</h4>
                  <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                    If enabled, employees can submit requests even if they don't have enough remaining balance.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input
                    type="checkbox"
                    checked={generalSettings.allow_negative_balance}
                    onChange={(e) => setGeneralSettings(prev => ({...prev, allow_negative_balance: e.target.checked}))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-almet-sapphire/30 dark:peer-focus:ring-almet-sapphire/50 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-almet-sapphire"></div>
                </label>
              </div>

              {/* Max Schedule Edits */}
              <div className="p-4 bg-almet-mystic/10 dark:bg-gray-900/20 rounded-lg border border-almet-mystic/30 dark:border-almet-comet/30">
                <label className="block text-sm font-medium text-almet-cloud-burst dark:text-white mb-2">
                  Maximum Schedule Edits
                </label>
                <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-3">
                  Number of times a scheduled vacation can be edited before it needs to be deleted and recreated.
                </p>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={generalSettings.max_schedule_edits}
                  onChange={(e) => setGeneralSettings(prev => ({...prev, max_schedule_edits: parseInt(e.target.value)}))}
                  className="w-full px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
/>
</div>
{/* Notification Settings */}
          <div className="p-4 bg-almet-mystic/10 dark:bg-gray-900/20 rounded-lg border border-almet-mystic/30 dark:border-almet-comet/30">
            <label className="block text-sm font-medium text-almet-cloud-burst dark:text-white mb-2">
              Notification Days Before
            </label>
            <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-3">
              Number of days before vacation starts to send reminder notifications.
            </p>
            <input
              type="number"
              min="1"
              max="30"
              value={generalSettings.notification_days_before}
              onChange={(e) => setGeneralSettings(prev => ({...prev, notification_days_before: parseInt(e.target.value)}))}
              className="w-full px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="p-4 bg-almet-mystic/10 dark:bg-gray-900/20 rounded-lg border border-almet-mystic/30 dark:border-almet-comet/30">
            <label className="block text-sm font-medium text-almet-cloud-burst dark:text-white mb-2">
              Notification Frequency (days)
            </label>
            <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-3">
              How often to send repeat notifications until vacation starts.
            </p>
            <input
              type="number"
              min="1"
              max="7"
              value={generalSettings.notification_frequency}
              onChange={(e) => setGeneralSettings(prev => ({...prev, notification_frequency: parseInt(e.target.value)}))}
              className="w-full px-3 py-2 text-sm border outline-0 border-almet-bali-hai/40 dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSaveGeneralSettings}
            disabled={loading}
            className="px-6 py-2.5 text-sm bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all flex items-center gap-2 disabled:opacity-50 shadow-md"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save General Settings
              </>
            )}
          </button>
        </div>
      </div>
    )}

    {/* ✅ HR REPRESENTATIVE TAB */}
    {activeTab === 'hr' && (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-almet-mystic/50 dark:border-almet-comet p-6">
        <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white mb-4">Default HR Representative</h3>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200">About HR Representative</h4>
              <p className="text-xs text-blue-800 dark:text-blue-300 mt-1">
                The HR Representative is responsible for the final approval of vacation requests after Line Manager (and UK Additional Approver for UK 5+ days) approval.
                <br/>
                This setting determines the default HR person who will be pre-selected when employees submit requests.
              </p>
            </div>
          </div>
        </div>

        {defaultHR && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-green-900 dark:text-green-200">Current Default HR</p>
                <p className="text-xs text-green-800 dark:text-green-300 mt-1">
                  {defaultHR.name} ({defaultHR.employee_id}) - {defaultHR.department}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
              Select Default HR Representative
            </label>
            <SearchableDropdown
              options={hrRepresentatives.map(hr => ({
                value: hr.id,
                label: `${hr.name} (${hr.employee_id}) - ${hr.department}`
              }))}
              value={selectedHR}
              onChange={setSelectedHR}
              placeholder="Select HR representative..."
              darkMode={darkMode}
              searchPlaceholder="Search HR representatives..."
            />
            <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-1.5">
              This HR representative will be automatically selected when employees submit vacation requests.
            </p>
          </div>

          <button
            onClick={handleSaveHR}
            disabled={loading || !selectedHR}
            className="w-full px-6 py-2.5 text-sm bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save HR Representative
              </>
            )}
          </button>
        </div>
      </div>
    )}
  </div>
</DashboardLayout>)}