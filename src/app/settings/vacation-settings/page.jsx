"use client";
import { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, Download, Upload, Bell, Users, Settings, Save, X, Mail, AlertCircle, Check, Clock, FileSpreadsheet } from 'lucide-react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";
import { VacationService, VacationHelpers } from '@/services/vacationService';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import { LoadingSpinner, ErrorDisplay } from '@/components/common/LoadingSpinner';
import { useToast } from '@/components/common/Toast';
import CustomCheckbox from '@/components/common/CustomCheckbox';

export default function VacationSettingsPage() {
  const { darkMode } = useTheme();
  const { showSuccess, showError, showWarning } = useToast();
  const [activeTab, setActiveTab] = useState('calendar');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data states
  const [nonWorkingDays, setNonWorkingDays] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [hrReps, setHRReps] = useState([]);
  const [settings, setSettings] = useState({
    allow_negative_balance: false,
    max_schedule_edits: 3,
    notification_days_before: 7,
    notification_frequency: 2
  });
  const [notificationTemplates, setNotificationTemplates] = useState([]);
  
  // Modals
  const [showNonWorkingDayModal, setShowNonWorkingDayModal] = useState(false);
  const [showLeaveTypeModal, setShowLeaveTypeModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [nonWorkingDayForm, setNonWorkingDayForm] = useState({ 
    date: '', 
    name: '', 
    type: 'Holiday' 
  });
  const [leaveTypeForm, setLeaveTypeForm] = useState({ 
    name: '', 
    description: '', 
    is_active: true 
  });
  const [notificationForm, setNotificationForm] = useState({ 
    request_type: 'Vacation Request', 
    stage: 'Submitted', 
    subject: '', 
    body: '',
    is_active: true 
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setInitialLoading(true);
      setError(null);

      const [
        calendarData,
        typesData,
        hrData,
        settingsData,
        templatesData
      ] = await Promise.allSettled([
        VacationService.getProductionCalendar(),
        VacationService.getVacationTypes(),
        VacationService.getHRRepresentatives(),
        VacationService.getGeneralSettings(),
        VacationService.getNotificationTemplates()
      ]);

      // Handle calendar data
      if (calendarData.status === 'fulfilled') {
  const formattedDays = calendarData.value.non_working_days?.map((dayData, index) => ({
    id: index + 1,
    date: typeof dayData === 'string' ? dayData : dayData.date,
    name: typeof dayData === 'string' ? 'Holiday' : (dayData.name || 'Holiday'),
    type: typeof dayData === 'string' ? 'Holiday' : (dayData.type || 'Holiday')
  })) || [];
  setNonWorkingDays(formattedDays);
}

      // Handle vacation types
      if (typesData.status === 'fulfilled') {
        setLeaveTypes(typesData.value.results || []);
      }

      // Handle HR representatives
      if (hrData.status === 'fulfilled') {
        const hrList = hrData.value.hr_representatives || [];
        setHRReps(hrList);
      }

      // Handle settings
      if (settingsData.status === 'fulfilled') {
        setSettings({
          allow_negative_balance: settingsData.value.allow_negative_balance || false,
          max_schedule_edits: settingsData.value.max_schedule_edits || 3,
          notification_days_before: settingsData.value.notification_days_before || 7,
          notification_frequency: settingsData.value.notification_frequency || 2
        });
      }

      // Handle notification templates
      if (templatesData.status === 'fulfilled') {
        setNotificationTemplates(templatesData.value.results || []);
      }

    } catch (err) {
      setError(err.message || 'Failed to load settings data');
      showError('Failed to load settings data');
    } finally {
      setInitialLoading(false);
    }
  };


  // Non-working days handlers
  const handleAddNonWorkingDay = async () => {
    if (!nonWorkingDayForm.date || !nonWorkingDayForm.name) {
      showWarning('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      
      let updatedDays;
      if (editingItem) {
        updatedDays = nonWorkingDays.map(day => 
          day.id === editingItem.id ? { ...nonWorkingDayForm, id: editingItem.id } : day
        );
      } else {
        updatedDays = [...nonWorkingDays, { ...nonWorkingDayForm, id: Date.now() }];
      }

      const apiData = {
        non_working_days: updatedDays.map(day => ({
          date: day.date,
          name: day.name
        }))
      };

      await VacationService.updateNonWorkingDays(apiData);
      setNonWorkingDays(updatedDays);
      setShowNonWorkingDayModal(false);
      setNonWorkingDayForm({ date: '', name: '', type: 'Holiday' });
      setEditingItem(null);
      showSuccess(editingItem ? 'Non-working day updated' : 'Non-working day added');
    } catch (err) {
      showError(err.message || 'Failed to save non-working day');
    } finally {
      setLoading(false);
    }
  };

  const handleEditNonWorkingDay = (day) => {
    setEditingItem(day);
    setNonWorkingDayForm(day);
    setShowNonWorkingDayModal(true);
  };

  const handleDeleteNonWorkingDay = (day) => {
    setDeleteTarget({ type: 'nonWorkingDay', item: day });
    setShowDeleteConfirm(true);
  };

  // Leave types handlers
  const handleAddLeaveType = async () => {
    if (!leaveTypeForm.name) {
      showWarning('Please enter leave type name');
      return;
    }

    try {
      setLoading(true);
      
      if (editingItem) {
        const updatedType = await VacationService.updateVacationType(editingItem.id, leaveTypeForm);
        setLeaveTypes(leaveTypes.map(type => 
          type.id === editingItem.id ? updatedType : type
        ));
        showSuccess('Leave type updated');
      } else {
        const newType = await VacationService.createVacationType(leaveTypeForm);
        setLeaveTypes([...leaveTypes, newType]);
        showSuccess('Leave type created');
      }

      setShowLeaveTypeModal(false);
      setLeaveTypeForm({ name: '', description: '', is_active: true });
      setEditingItem(null);
    } catch (err) {
      showError(err.message || 'Failed to save leave type');
    } finally {
      setLoading(false);
    }
  };

  const handleEditLeaveType = (type) => {
    setEditingItem(type);
    setLeaveTypeForm(type);
    setShowLeaveTypeModal(true);
  };

  const handleDeleteLeaveType = (type) => {
    setDeleteTarget({ type: 'leaveType', item: type });
    setShowDeleteConfirm(true);
  };

  // HR Representatives handlers
  const handleSetDefaultHR = async (rep) => {
    try {
      setLoading(true);
      await VacationService.setDefaultHRRepresentative({
        default_hr_representative_id: rep.id
      });
      
      setHRReps(hrReps.map(r => ({ ...r, is_default: r.id === rep.id })));
      showSuccess(`${rep.name} set as default HR representative`);
    } catch (err) {
      showError(err.message || 'Failed to set default HR representative');
    } finally {
      setLoading(false);
    }
  };

  // Notification templates handlers
  const handleAddNotificationTemplate = async () => {
    if (!notificationForm.subject || !notificationForm.body) {
      showWarning('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      
      if (editingItem) {
        const updatedTemplate = await VacationService.updateNotificationTemplate(
          editingItem.id, 
          notificationForm
        );
        setNotificationTemplates(notificationTemplates.map(template => 
          template.id === editingItem.id ? updatedTemplate : template
        ));
        showSuccess('Notification template updated');
      } else {
        const newTemplate = await VacationService.createNotificationTemplate(notificationForm);
        setNotificationTemplates([...notificationTemplates, newTemplate]);
        showSuccess('Notification template created');
      }

      setShowNotificationModal(false);
      setNotificationForm({ 
        request_type: 'Vacation Request', 
        stage: 'Submitted', 
        subject: '', 
        body: '', 
        is_active: true 
      });
      setEditingItem(null);
    } catch (err) {
      showError(err.message || 'Failed to save notification template');
    } finally {
      setLoading(false);
    }
  };

  const handleEditNotificationTemplate = (template) => {
    setEditingItem(template);
    setNotificationForm(template);
    setShowNotificationModal(true);
  };

  const handleDeleteNotificationTemplate = (template) => {
    setDeleteTarget({ type: 'notificationTemplate', item: template });
    setShowDeleteConfirm(true);
  };

  // Settings handlers
  const handleSaveSettings = async () => {
    try {
      setLoading(true);
      await VacationService.updateGeneralSettings(settings);
      showSuccess('Settings saved successfully');
    } catch (err) {
      showError(err.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  // Balance management handlers
  const handleExportTemplate = async () => {
    try {
      setLoading(true);
      const blob = await VacationService.downloadBalanceTemplate();
      VacationHelpers.downloadBlobFile(blob, 'vacation_balance_template.xlsx');
      showSuccess('Template downloaded');
    } catch (err) {
      showError(err.message || 'Failed to download template');
    } finally {
      setLoading(false);
    }
  };

  const handleImportBalances = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('year', new Date().getFullYear());

      const result = await VacationService.bulkUploadBalances(formData);
      showSuccess(`Balances uploaded: ${result.success_count || 0} successful`);
      
      if (result.errors && result.errors.length > 0) {
        showWarning(`${result.errors.length} records had errors`);
      }
    } catch (err) {
      showError(err.message || 'Failed to upload balances');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  // Delete confirmation handler
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setLoading(true);
      
      switch (deleteTarget.type) {
        case 'nonWorkingDay':
          const updatedDays = nonWorkingDays.filter(day => day.id !== deleteTarget.item.id);
          const apiData = {
            non_working_days: updatedDays.map(day => ({
              date: day.date,
              name: day.name
            }))
          };
          await VacationService.updateNonWorkingDays(apiData);
          setNonWorkingDays(updatedDays);
          showSuccess('Non-working day deleted');
          break;
          
        case 'leaveType':
          await VacationService.deleteVacationType(deleteTarget.item.id);
          setLeaveTypes(leaveTypes.filter(type => type.id !== deleteTarget.item.id));
          showSuccess('Leave type deleted');
          break;
          
        case 'notificationTemplate':
          await VacationService.deleteNotificationTemplate(deleteTarget.item.id);
          setNotificationTemplates(notificationTemplates.filter(template => 
            template.id !== deleteTarget.item.id
          ));
          showSuccess('Notification template deleted');
          break;
      }
    } catch (err) {
      showError(err.message || 'Failed to delete item');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
      setDeleteTarget(null);
    }
  };

  const getRequestTypeTemplates = (requestType) => {
    return notificationTemplates.filter(t => t.request_type === requestType);
  };

  // Loading and error states
  if (initialLoading) {
    return <LoadingSpinner message="Loading vacation settings..." />;
  }

  if (error && !nonWorkingDays.length && !leaveTypes.length) {
    return <ErrorDisplay error={error} onRetry={loadInitialData} />;
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen p-6">
        {/* Header Section */}
        <div className="bg-white rounded-lg dark:bg-almet-cloud-burst border-b border-gray-200 dark:border-almet-comet">
          <div className="px-6 py-6">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-almet-cloud-burst dark:text-white">
                    Vacation Settings
                  </h1>
                  <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai mt-1">
                    Configure vacation policies and system parameters
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                      Last Updated
                    </p>
                    <p className="text-sm font-medium text-almet-cloud-burst dark:text-white">
                      {new Date().toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto  py-6">
          {/* Navigation Tabs */}
          <div className="mb-8">
            <nav className="flex space-x-1 bg-white dark:bg-almet-cloud-burst p-1 rounded-xl shadow-sm border border-gray-200 dark:border-almet-comet">
              {[
                { id: 'calendar', icon: Calendar, label: 'Calendar', count: nonWorkingDays.length },
                { id: 'leave-types', icon: Clock, label: 'Leave Types', count: leaveTypes.length },
                { id: 'hr-reps', icon: Users, label: 'HR Team', count: hrReps.length },
                { id: 'balances', icon: FileSpreadsheet, label: 'Balances' },
                { id: 'notifications', icon: Bell, label: 'Templates', count: notificationTemplates.length },
                { id: 'settings', icon: Settings, label: 'Settings' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium transition-all relative ${
                    activeTab === tab.id
                      ? 'bg-almet-sapphire text-white shadow-sm'
                      : 'text-almet-waterloo hover:text-almet-cloud-burst dark:text-almet-bali-hai hover:bg-gray-100 dark:hover:bg-almet-comet/50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:block">{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                      activeTab === tab.id 
                        ? 'bg-white/20 text-white' 
                        : 'bg-gray-100 dark:bg-almet-comet text-almet-waterloo dark:text-almet-bali-hai'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="bg-white dark:bg-almet-cloud-burst rounded-xl shadow-sm border border-gray-200 dark:border-almet-comet overflow-hidden">
            
            {/* Production Calendar Tab */}
            {activeTab === 'calendar' && (
              <div>
                <div className="p-4 border-b border-gray-200 dark:border-almet-comet">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white">
                        Production Calendar
                      </h2>
                      <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-1">
                        Manage public holidays and non-working days
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setNonWorkingDayForm({ date: '', name: '', type: 'Holiday' });
                        setShowNonWorkingDayModal(true);
                      }}
                      className="inline-flex items-center gap-2 text-xs px-4 py-2 bg-almet-sapphire text-white  font-medium rounded-lg hover:bg-almet-astral transition-colors shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Holiday
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {nonWorkingDays.length === 0 ? (
                    <div className="text-center py-4">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-almet-comet rounded-full flex items-center justify-center mx-auto mb-4">
                        <Calendar className="w-6 h-6 text-almet-waterloo" />
                      </div>
                      <h3 className="text-sm font-medium text-almet-cloud-burst dark:text-white mb-2">
                        No holidays configured
                      </h3>
                      <p className="text-almet-waterloo dark:text-almet-bali-hai text-xs ">
                        Add your first holiday to get started with the production calendar
                      </p>
                     
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {nonWorkingDays.map(day => (
                        <div key={day.id} className="bg-gray-50 dark:bg-almet-comet/30 rounded-lg p-4 border border-gray-200 dark:border-almet-comet">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full font-medium">
                                  {day.type}
                                </span>
                              </div>
                              <h3 className="font-medium text-almet-cloud-burst dark:text-white text-sm mb-1">
                                {day.name}
                              </h3>
                              <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai">
                                {VacationHelpers.formatDate(day.date)}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEditNonWorkingDay(day)}
                                className="p-1.5 text-almet-sapphire hover:text-almet-astral hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteNonWorkingDay(day)}
                                className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Leave Types Tab */}
            {activeTab === 'leave-types' && (
              <div>
                <div className="p-4 border-b border-gray-200 dark:border-almet-comet">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white">
                        Leave Types
                      </h2>
                      <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-1">
                        Manage different types of vacation and leave categories
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setLeaveTypeForm({ name: '', description: '', is_active: true });
                        setShowLeaveTypeModal(true);
                      }}
                      className="inline-flex items-center text-xs gap-2 px-4 py-2 bg-almet-sapphire text-white  font-medium rounded-lg hover:bg-almet-astral transition-colors shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Leave Type
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {leaveTypes.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-almet-comet rounded-full flex items-center justify-center mx-auto mb-4">
                        <Clock className="w-6 h-6 text-almet-waterloo" />
                      </div>
                      <h3 className="text-sm font-medium text-almet-cloud-burst dark:text-white mb-2">
                        No leave types configured
                      </h3>
                      <p className="text-almet-waterloo dark:text-almet-bali-hai text-xs ">
                        Create your first leave type to organize vacation requests
                      </p>
                     
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {leaveTypes.map(type => (
                        <div key={type.id} className="bg-gray-50 dark:bg-almet-comet/30 rounded-lg p-4 border border-gray-200 dark:border-almet-comet">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                  type.is_active 
                                    ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                                    : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200'
                                }`}>
                                  {type.is_active ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <h3 className="font-medium text-almet-cloud-burst dark:text-white text-sm mb-1">
                                {type.name}
                              </h3>
                              {type.description && (
                                <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai line-clamp-2">
                                  {type.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleEditLeaveType(type)}
                                className="p-1.5 text-almet-sapphire hover:text-almet-astral hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteLeaveType(type)}
                                className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Delete"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* HR Representatives Tab */}
            {activeTab === 'hr-reps' && (
              <div>
                <div className="p-4 border-b border-gray-200 dark:border-almet-comet">
                  <div>
                    <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white">
                      HR Representatives
                    </h2>
                    <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-1">
                      Manage HR team members responsible for vacation approvals
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  {hrReps.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-almet-comet rounded-full flex items-center justify-center mx-auto mb-4">
                        <Users className="w-6 h-6 text-almet-waterloo" />
                      </div>
                      <h3 className="text-sm font-medium text-almet-cloud-burst dark:text-white mb-2">
                        No HR representatives configured
                      </h3>
                      <p className="text-almet-waterloo dark:text-almet-bali-hai text-xs">
                        HR representatives will be automatically managed by the system
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {hrReps.map(rep => (
                        <div key={rep.id} className="bg-gray-50 dark:bg-almet-comet/30 rounded-lg p-4 border border-gray-200 dark:border-almet-comet">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {rep.is_default && (
                                  <span className="flex items-center gap-1 text-xs px-2 py-1 bg-almet-sapphire text-white rounded-full font-medium">
                                    <Check className="w-3 h-3" />
                                    Default
                                  </span>
                                )}
                              </div>
                              <h3 className="font-medium text-almet-cloud-burst dark:text-white text-sm mb-1">
                                {rep.name}
                              </h3>
                              <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai mb-1">
                                {rep.email}
                              </p>
                              {rep.department && (
                                <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                                  {rep.department}
                                </p>
                              )}
                            </div>
                            {!rep.is_default && (
                              <button
                                onClick={() => handleSetDefaultHR(rep)}
                                disabled={loading}
                                className="text-xs px-3 py-1 bg-white dark:bg-almet-cloud-burst border border-gray-200 dark:border-almet-comet rounded-lg text-almet-waterloo hover:text-almet-sapphire hover:border-almet-sapphire transition-colors disabled:opacity-50"
                              >
                                Set Default
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Vacation Balances Tab */}
            {activeTab === 'balances' && (
              <div>
                <div className="p-4 border-b border-gray-200 dark:border-almet-comet">
                  <div>
                    <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white">
                      Vacation Balances
                    </h2>
                    <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-1">
                      Bulk manage employee vacation balance data
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  <div >
                    {/* Upload/Download Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800 mb-6">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileSpreadsheet className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-almet-cloud-burst dark:text-white text-sm mb-2">
                            Bulk Balance Management
                          </h3>
                          <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-4">
                            Download the Excel template, fill in employee vacation balances, and upload the file to update all balances at once.
                          </p>
                          
                          <div className="flex flex-col sm:flex-row gap-3">
                            <button
                              onClick={handleExportTemplate}
                              disabled={loading}
                              className="inline-flex text-xs items-center gap-2 px-4 py-2 bg-white dark:bg-almet-comet text-almet-cloud-burst dark:text-white border border-gray-300 dark:border-almet-comet rounded-lg hover:bg-gray-50 dark:hover:bg-almet-san-juan/50 transition-colors  font-medium disabled:opacity-50"
                            >
                              <Download className="w-4 h-4" />
                              Download Template
                            </button>
                            
                            <label className="inline-flex text-xs items-center gap-2 px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors cursor-pointer  font-medium disabled:opacity-50">
                              <Upload className="w-4 h-4" />
                              Upload Balances
                              <input
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleImportBalances}
                                className="hidden"
                                disabled={loading}
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Important Notes */}
                    <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-700">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
                            Important Guidelines
                          </h4>
                          <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                            <div>• <strong>Start Balance:</strong> Remaining days from previous year</div>
                            <div>• <strong>Yearly Balance:</strong> New allocation for current year</div>
                            <div>• <strong>Employee IDs:</strong> Must match existing system records</div>
                            <div>• <strong>Data Overwrite:</strong> Upload will replace existing balance data</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Templates Tab */}
            {activeTab === 'notifications' && (
              <div>
                <div className="p-4 border-b border-gray-200 dark:border-almet-comet">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-almet-cloud-burst dark:text-white">
                        Notification Templates
                      </h2>
                      <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-1">
                        Customize email templates for vacation notifications
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingItem(null);
                        setNotificationForm({ 
                          request_type: 'Vacation Request', 
                          stage: 'Submitted', 
                          subject: '', 
                          body: '', 
                          is_active: true 
                        });
                        setShowNotificationModal(true);
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-almet-sapphire text-white text-xs font-medium rounded-lg hover:bg-almet-astral transition-colors shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Template
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {notificationTemplates.length === 0 ? (
                    <div className="text-center py-6">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-almet-comet rounded-full flex items-center justify-center mx-auto mb-4">
                        <Bell className="w-4 h-4 text-almet-waterloo" />
                      </div>
                      <h3 className="text-sm font-medium text-almet-cloud-burst dark:text-white mb-2">
                        No notification templates
                      </h3>
                      <p className="text-almet-waterloo dark:text-almet-bali-hai text-xs ">
                        Create email templates to automate vacation notifications
                      </p>
                    
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Vacation Request Templates */}
                      <div>
                        <h3 className="text-sm font-medium text-almet-cloud-burst dark:text-white mb-4 flex items-center gap-2">
                          <Mail className="w-3 h-4" />
                          Vacation Request Templates
                        </h3>
                        <div className="grid gap-4">
                          {getRequestTypeTemplates('Vacation Request').length > 0 ? (
                            getRequestTypeTemplates('Vacation Request').map(template => (
                              <div key={template.id} className="bg-gray-50 dark:bg-almet-comet/30 rounded-lg p-4 border border-gray-200 dark:border-almet-comet">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                      <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 rounded-full font-medium">
                                        {template.stage}
                                      </span>
                                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                                        template.is_active 
                                          ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
                                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                                      }`}>
                                        {template.is_active ? 'Active' : 'Inactive'}
                                      </span>
                                    </div>
                                    <h4 className="font-medium text-almet-cloud-burst dark:text-white text-sm mb-1">
                                      {template.subject}
                                    </h4>
                                    <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai line-clamp-2">
                                      {template.body.length > 100 ? template.body.substring(0, 100) + '...' : template.body}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1 ml-4">
                                    <button
                                      onClick={() => handleEditNotificationTemplate(template)}
                                      className="p-1.5 text-almet-sapphire hover:text-almet-astral hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                                      title="Edit"
                                    >
                                      <Edit2 className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteNotificationTemplate(template)}
                                      className="p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 border border-dashed border-gray-300 dark:border-almet-comet rounded-lg">
                              <Mail className="w-8 h-8 text-almet-waterloo mx-auto mb-2" />
                              <p className="text-almet-waterloo dark:text-almet-bali-hai text-sm">
                                No vacation request templates yet
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* General Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <div className="p-4 border-b border-gray-200 dark:border-almet-comet">
                  <div>
                    <h2 className="text-sm font-semibold text-almet-cloud-burst dark:text-white">
                      General Settings
                    </h2>
                    <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-1">
                      Configure global vacation system parameters
                    </p>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-6">
                    {/* Allow Negative Balance */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-almet-comet/30 rounded-lg border border-gray-200 dark:border-almet-comet">
                      <div className="flex-1 pr-4">
                        <h3 className="text-sm font-medium text-almet-cloud-burst dark:text-white mb-1">
                          Allow Zero Balance Requests
                        </h3>
                        <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                          Enable employees to request vacation when their balance is zero
                        </p>
                      </div>
                      <CustomCheckbox
                        checked={settings.allow_negative_balance}
                        onChange={() => setSettings({
                          ...settings, 
                          allow_negative_balance: !settings.allow_negative_balance
                        })}
                      />
                    </div>

                    {/* Max Schedule Edits */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-almet-comet/30 rounded-lg border border-gray-200 dark:border-almet-comet">
                      <div className="flex-1 pr-4">
                        <h3 className="text-sm font-medium text-almet-cloud-burst dark:text-white mb-1">
                          Maximum Schedule Edits
                        </h3>
                        <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                          Number of times employees can modify scheduled vacation
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={settings.max_schedule_edits}
                          onChange={(e) => setSettings({
                            ...settings, 
                            max_schedule_edits: parseInt(e.target.value) || 0
                          })}
                          className="w-16 px-2 py-1 outline-0 text-sm border border-gray-300 dark:border-almet-comet rounded focus:ring-2 focus:ring-almet-sapphire dark:bg-almet-comet dark:text-white text-center"
                          min="0"
                          max="10"
                        />
                        <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">times</span>
                      </div>
                    </div>

                    {/* Notification Days Before */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-almet-comet/30 rounded-lg border border-gray-200 dark:border-almet-comet">
                      <div className="flex-1 pr-4">
                        <h3 className="text-sm font-medium text-almet-cloud-burst dark:text-white mb-1">
                          Notification Lead Time
                        </h3>
                        <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                          Send reminders this many days before vacation starts
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={settings.notification_days_before}
                          onChange={(e) => setSettings({
                            ...settings, 
                            notification_days_before: parseInt(e.target.value) || 1
                          })}
                          className="w-16 px-2 py-1 outline-0  text-sm border border-gray-300 dark:border-almet-comet rounded focus:ring-2 focus:ring-almet-sapphire dark:bg-almet-comet dark:text-white text-center"
                          min="1"
                          max="30"
                        />
                        <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">days</span>
                      </div>
                    </div>

                    {/* Notification Frequency */}
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-almet-comet/30 rounded-lg border border-gray-200 dark:border-almet-comet">
                      <div className="flex-1 pr-4">
                        <h3 className="text-sm font-medium text-almet-cloud-burst dark:text-white mb-1">
                          Notification Frequency
                        </h3>
                        <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai">
                          Maximum number of reminder notifications to send
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={settings.notification_frequency}
                          onChange={(e) => setSettings({
                            ...settings, 
                            notification_frequency: parseInt(e.target.value) || 1
                          })}
                          className="w-16 px-2 py-1 outline-0  text-sm border border-gray-300 dark:border-almet-comet rounded focus:ring-2 focus:ring-almet-sapphire dark:bg-almet-comet dark:text-white text-center"
                          min="1"
                          max="5"
                        />
                        <span className="text-xs text-almet-waterloo dark:text-almet-bali-hai">times</span>
                      </div>
                    </div>

                    {/* Save Button */}
                    <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-almet-comet">
                      <button
                        onClick={handleSaveSettings}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-6 py-2 bg-almet-sapphire text-white text-sm font-medium rounded-lg hover:bg-almet-astral transition-colors disabled:opacity-50"
                      >
                        {loading ? (
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        Save Settings
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}

        {/* Non-Working Day Modal */}
        {showNonWorkingDayModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-almet-cloud-burst rounded-xl w-full max-w-md shadow-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-semibold text-almet-cloud-burst dark:text-white">
                    {editingItem ? 'Edit Holiday' : 'Add Holiday'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowNonWorkingDayModal(false);
                      setEditingItem(null);
                    }}
                    className="p-1 text-almet-waterloo hover:text-almet-cloud-burst dark:hover:text-white hover:bg-gray-100 dark:hover:bg-almet-comet rounded transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-almet-cloud-burst dark:text-white mb-2">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={nonWorkingDayForm.date}
                      onChange={(e) => setNonWorkingDayForm({...nonWorkingDayForm, date: e.target.value})}
                      className="w-full px-3 py-2 text-sm outline-0 border border-gray-300 dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent dark:bg-almet-comet dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-almet-cloud-burst dark:text-white mb-2">
                      Holiday Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={nonWorkingDayForm.name}
                      onChange={(e) => setNonWorkingDayForm({...nonWorkingDayForm, name: e.target.value})}
                      placeholder="e.g., New Year's Day"
                      className="w-full px-3 py-2 text-sm border outline-0  border-gray-300 dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent dark:bg-almet-comet dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-almet-cloud-burst dark:text-white mb-2">
                      Type
                    </label>
                    <select
                      value={nonWorkingDayForm.type}
                      onChange={(e) => setNonWorkingDayForm({...nonWorkingDayForm, type: e.target.value})}
                      className="w-full px-3 py-2 outline-0 inset-0  text-sm border border-gray-300 dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent dark:bg-almet-comet dark:text-white"
                    >
                      <option value="Holiday">Holiday</option>
                      <option value="National Day">National Day</option>
                      <option value="Religious">Religious</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200 dark:border-almet-comet">
                  <button
                    onClick={() => {
                      setShowNonWorkingDayModal(false);
                      setEditingItem(null);
                    }}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-almet-cloud-burst dark:text-almet-bali-hai border border-gray-300 dark:border-almet-comet rounded-lg hover:bg-gray-50 dark:hover:bg-almet-comet/50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddNonWorkingDay}
                    disabled={loading || !nonWorkingDayForm.date || !nonWorkingDayForm.name}
                    className="px-4 py-2 text-sm font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {editingItem ? 'Update' : 'Add'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notification Template Modal */}
        {showNotificationModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-almet-cloud-burst rounded-xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-almet-cloud-burst dark:text-white">
                    {editingItem ? 'Edit Notification Template' : 'Add Notification Template'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowNotificationModal(false);
                      setEditingItem(null);
                    }}
                    className="p-1 text-almet-waterloo hover:text-almet-cloud-burst dark:hover:text-white hover:bg-gray-100 dark:hover:bg-almet-comet rounded transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm  font-medium text-almet-cloud-burst dark:text-white mb-2">
                        Request Type
                      </label>
                      <select
                        value={notificationForm.request_type}
                        onChange={(e) => setNotificationForm({...notificationForm, request_type: e.target.value})}
                        className="w-full px-3 py-2 outline-0 inset-0 text-sm border border-gray-300 dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent dark:bg-almet-comet dark:text-white"
                      >
                        <option value="Vacation Request">Vacation Request</option>
                        <option value="Business Trip">Vacation Scheduled</option>
                      
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-almet-cloud-burst dark:text-white mb-2">
                        Stage
                      </label>
                      <select
                        value={notificationForm.stage}
                        onChange={(e) => setNotificationForm({...notificationForm, stage: e.target.value})}
                        className="w-full px-3 py-2 text-sm outline-0 inset-0 border border-gray-300 dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent dark:bg-almet-comet dark:text-white"
                      >
                        <option value="Submitted">Submitted</option>
                        <option value="Approved">Approved</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Upcoming Reminder">Upcoming Reminder</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-almet-cloud-burst dark:text-white mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={notificationForm.subject}
                      onChange={(e) => setNotificationForm({...notificationForm, subject: e.target.value})}
                      placeholder="Email subject line"
                      className="w-full px-3 py-2 text-sm border outline-0 border-gray-300 dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent dark:bg-almet-comet dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-almet-cloud-burst dark:text-white mb-2">
                      Message Body <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={notificationForm.body}
                      onChange={(e) => setNotificationForm({...notificationForm, body: e.target.value})}
                      placeholder="Write..."
                      rows={10}
                      className="w-full px-3 py-2 text-sm border outline-0 border-gray-300 dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent dark:bg-almet-comet dark:text-white font-mono resize-none"
                      required
                    />
                    <p className="text-xs text-almet-waterloo  dark:text-almet-bali-hai mt-2">
                      Available variables: <code className="bg-gray-100 dark:bg-almet-comet px-1 py-0.5 rounded text-xs">
                      {'{employee_name}, {start_date}, {end_date}, {duration}, {remaining_balance}, {approver_name}, {approval_date}, {rejection_reason}'}
                      </code>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <CustomCheckbox
                      checked={notificationForm.is_active}
                      onChange={() => setNotificationForm({
                        ...notificationForm, 
                        is_active: !notificationForm.is_active
                      })}
                    />
                    <label className="text-sm font-medium text-almet-cloud-burst dark:text-white">
                      Active
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200 dark:border-almet-comet">
                  <button
                    onClick={() => {
                      setShowNotificationModal(false);
                      setEditingItem(null);
                    }}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-almet-cloud-burst dark:text-almet-bali-hai border border-gray-300 dark:border-almet-comet rounded-lg hover:bg-gray-50 dark:hover:bg-almet-comet/50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddNotificationTemplate}
                    disabled={loading || !notificationForm.subject || !notificationForm.body}
                    className="px-4 py-2 text-sm font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {editingItem ? 'Update' : 'Add'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Leave Type Modal */}
        {showLeaveTypeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-almet-cloud-burst rounded-xl w-full max-w-md shadow-2xl">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-almet-cloud-burst dark:text-white">
                    {editingItem ? 'Edit Leave Type' : 'Add Leave Type'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowLeaveTypeModal(false);
                      setEditingItem(null);
                    }}
                    className="p-1 text-almet-waterloo hover:text-almet-cloud-burst dark:hover:text-white hover:bg-gray-100 dark:hover:bg-almet-comet rounded transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium  text-almet-cloud-burst dark:text-white mb-2">
                      Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={leaveTypeForm.name}
                      onChange={(e) => setLeaveTypeForm({...leaveTypeForm, name: e.target.value})}
                      placeholder="e.g., Annual Leave"
                      className="w-full px-3 py-2 text-sm border outline-0 border-gray-300 dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent dark:bg-almet-comet dark:text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-almet-cloud-burst dark:text-white mb-2">
                      Description
                    </label>
                    <textarea
                      value={leaveTypeForm.description}
                      onChange={(e) => setLeaveTypeForm({...leaveTypeForm, description: e.target.value})}
                      placeholder="Brief description of this leave type"
                      rows={3}
                      className="w-full px-3 py-2 text-sm border outline-0 border-gray-300 dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent dark:bg-almet-comet dark:text-white resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <CustomCheckbox
                      checked={leaveTypeForm.is_active}
                      onChange={() => setLeaveTypeForm({
                        ...leaveTypeForm, 
                        is_active: !leaveTypeForm.is_active
                      })}
                    />
                    <label className="text-sm font-medium text-almet-cloud-burst dark:text-white">
                      Active
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200 dark:border-almet-comet">
                  <button
                    onClick={() => {
                      setShowLeaveTypeModal(false);
                      setEditingItem(null);
                    }}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-almet-cloud-burst dark:text-almet-bali-hai border border-gray-300 dark:border-almet-comet rounded-lg hover:bg-gray-50 dark:hover:bg-almet-comet/50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddLeaveType}
                    disabled={loading || !leaveTypeForm.name}
                    className="px-4 py-2 text-sm font-medium bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    {editingItem ? 'Update' : 'Add'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setDeleteTarget(null);
          }}
          onConfirm={handleConfirmDelete}
          title="Confirm Deletion"
          message={`Are you sure you want to delete this ${
            deleteTarget?.type === 'nonWorkingDay' ? 'holiday' : 
            deleteTarget?.type === 'leaveType' ? 'leave type' : 'notification template'
          }? This action cannot be undone.`}
          confirmText="Delete"
          type="danger"
          loading={loading}
          darkMode={darkMode}
        />
      </div>
    </DashboardLayout>
  );
}
        
