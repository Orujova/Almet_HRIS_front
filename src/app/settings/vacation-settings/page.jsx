"use client";
import { useState } from 'react';
import { Calendar, Plus, Edit2, Trash2, Download, Upload, Bell, Users, Settings, Save, X } from 'lucide-react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";

// Mock data
const mockNonWorkingDays = [
  { id: 1, date: "2025-01-01", name: "New Year's Day", type: "Holiday" },
  { id: 2, date: "2025-01-20", name: "National Mourning Day", type: "Holiday" },
  { id: 3, date: "2025-03-08", name: "International Women's Day", type: "Holiday" },
  { id: 4, date: "2025-03-20", name: "Novruz", type: "Holiday" },
  { id: 5, date: "2025-03-21", name: "Novruz", type: "Holiday" }
];

const mockLeaveTypes = [
  { id: 1, name: "Annual Leave", description: "Regular paid vacation", maxDays: 28, isActive: true },
  { id: 2, name: "Sick Leave", description: "Medical leave", maxDays: 14, isActive: true },
  { id: 3, name: "Personal Leave", description: "Personal matters", maxDays: 5, isActive: true },
  { id: 4, name: "Maternity Leave", description: "Maternity leave", maxDays: 126, isActive: true }
];

const mockHRReps = [
  { id: 1, name: "Sarah Johnson", email: "sarah.j@company.com", isDefault: true },
  { id: 2, name: "Mike Brown", email: "mike.b@company.com", isDefault: false },
  { id: 3, name: "Anna Smith", email: "anna.s@company.com", isDefault: false }
];

const mockSettings = {
  allowRequestWhenZeroBalance: false,
  maxScheduleEdits: 3,
  notificationDaysBefore: 7,
  notificationFrequency: 2
};

export default function VacationSettingsPage() {
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('calendar');
  const [nonWorkingDays, setNonWorkingDays] = useState(mockNonWorkingDays);
  const [leaveTypes, setLeaveTypes] = useState(mockLeaveTypes);
  const [hrReps, setHRReps] = useState(mockHRReps);
  const [settings, setSettings] = useState(mockSettings);
  
  // Modals
  const [showNonWorkingDayModal, setShowNonWorkingDayModal] = useState(false);
  const [showLeaveTypeModal, setShowLeaveTypeModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [nonWorkingDayForm, setNonWorkingDayForm] = useState({ date: '', name: '', type: 'Holiday' });
  const [leaveTypeForm, setLeaveTypeForm] = useState({ name: '', description: '', maxDays: '', isActive: true });

  const handleAddNonWorkingDay = () => {
    if (editingItem) {
      setNonWorkingDays(nonWorkingDays.map(day => 
        day.id === editingItem.id ? { ...nonWorkingDayForm, id: editingItem.id } : day
      ));
    } else {
      setNonWorkingDays([...nonWorkingDays, { ...nonWorkingDayForm, id: Date.now() }]);
    }
    setShowNonWorkingDayModal(false);
    setNonWorkingDayForm({ date: '', name: '', type: 'Holiday' });
    setEditingItem(null);
  };

  const handleEditNonWorkingDay = (day) => {
    setEditingItem(day);
    setNonWorkingDayForm(day);
    setShowNonWorkingDayModal(true);
  };

  const handleDeleteNonWorkingDay = (id) => {
    setNonWorkingDays(nonWorkingDays.filter(day => day.id !== id));
  };

  const handleAddLeaveType = () => {
    if (editingItem) {
      setLeaveTypes(leaveTypes.map(type => 
        type.id === editingItem.id ? { ...leaveTypeForm, id: editingItem.id } : type
      ));
    } else {
      setLeaveTypes([...leaveTypes, { ...leaveTypeForm, id: Date.now() }]);
    }
    setShowLeaveTypeModal(false);
    setLeaveTypeForm({ name: '', description: '', maxDays: '', isActive: true });
    setEditingItem(null);
  };

  const handleEditLeaveType = (type) => {
    setEditingItem(type);
    setLeaveTypeForm(type);
    setShowLeaveTypeModal(true);
  };

  const handleDeleteLeaveType = (id) => {
    setLeaveTypes(leaveTypes.filter(type => type.id !== id));
  };

  const handleSetDefaultHR = (id) => {
    setHRReps(hrReps.map(rep => ({ ...rep, isDefault: rep.id === id })));
  };

  const handleExportTemplate = () => {
    // CSV template structure
    const csvContent = "Employee Name,Employee ID,Start Balance,Yearly Balance,Year\nJohn Doe,EMP001,0,28,2025\n";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vacation_balance_template.csv';
    a.click();
  };

  const handleImportBalances = (e) => {
    const file = e.target.files[0];
    if (file) {
      alert('File uploaded: ' + file.name + '\nThis will be processed by the backend.');
    }
  };

  const handleSaveSettings = () => {
    alert('Settings saved successfully!');
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-almet-cloud-burst dark:text-white mb-2">Vacation Settings</h1>
          <p className="text-almet-waterloo dark:text-almet-bali-hai">Configure vacation policies and parameters</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 border-b border-almet-bali-hai dark:border-almet-comet">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'calendar'
                  ? 'border-almet-sapphire text-almet-sapphire dark:text-almet-astral'
                  : 'border-transparent text-almet-waterloo hover:text-almet-cloud-burst dark:text-almet-bali-hai'
              }`}
            >
              Production Calendar
            </button>
            <button
              onClick={() => setActiveTab('leave-types')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'leave-types'
                  ? 'border-almet-sapphire text-almet-sapphire dark:text-almet-astral'
                  : 'border-transparent text-almet-waterloo hover:text-almet-cloud-burst dark:text-almet-bali-hai'
              }`}
            >
              Leave Types
            </button>
            <button
              onClick={() => setActiveTab('hr-reps')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'hr-reps'
                  ? 'border-almet-sapphire text-almet-sapphire dark:text-almet-astral'
                  : 'border-transparent text-almet-waterloo hover:text-almet-cloud-burst dark:text-almet-bali-hai'
              }`}
            >
              HR Representatives
            </button>
            <button
              onClick={() => setActiveTab('balances')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'balances'
                  ? 'border-almet-sapphire text-almet-sapphire dark:text-almet-astral'
                  : 'border-transparent text-almet-waterloo hover:text-almet-cloud-burst dark:text-almet-bali-hai'
              }`}
            >
              Vacation Balances
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'settings'
                  ? 'border-almet-sapphire text-almet-sapphire dark:text-almet-astral'
                  : 'border-transparent text-almet-waterloo hover:text-almet-cloud-burst dark:text-almet-bali-hai'
              }`}
            >
              General Settings
            </button>
          </div>
        </div>

        {/* Production Calendar Tab */}
        {activeTab === 'calendar' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-almet-mystic dark:border-almet-comet">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-almet-cloud-burst dark:text-white">Non-Working Days</h2>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setNonWorkingDayForm({ date: '', name: '', type: 'Holiday' });
                  setShowNonWorkingDayModal(true);
                }}
                className="px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Non-Working Day
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-almet-bali-hai dark:divide-almet-comet">
                <thead className="bg-almet-mystic dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-almet-bali-hai dark:divide-almet-comet">
                  {nonWorkingDays.map(day => (
                    <tr key={day.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">
                        {day.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">
                        {day.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">
                        {day.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditNonWorkingDay(day)}
                            className="text-almet-sapphire hover:text-almet-cloud-burst"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteNonWorkingDay(day.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Leave Types Tab */}
        {activeTab === 'leave-types' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-almet-mystic dark:border-almet-comet">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-almet-cloud-burst dark:text-white">Leave Types</h2>
              <button
                onClick={() => {
                  setEditingItem(null);
                  setLeaveTypeForm({ name: '', description: '', maxDays: '', isActive: true });
                  setShowLeaveTypeModal(true);
                }}
                className="px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Leave Type
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-almet-bali-hai dark:divide-almet-comet">
                <thead className="bg-almet-mystic dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                      Max Days
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-almet-bali-hai dark:divide-almet-comet">
                  {leaveTypes.map(type => (
                    <tr key={type.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-almet-cloud-burst dark:text-white">
                        {type.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-almet-waterloo dark:text-almet-bali-hai">
                        {type.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">
                        {type.maxDays}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          type.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {type.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditLeaveType(type)}
                            className="text-almet-sapphire hover:text-almet-cloud-burst"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteLeaveType(type.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* HR Representatives Tab */}
        {activeTab === 'hr-reps' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-almet-mystic dark:border-almet-comet">
            <h2 className="text-xl font-semibold text-almet-cloud-burst dark:text-white mb-6">HR Representatives</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-almet-bali-hai dark:divide-almet-comet">
                <thead className="bg-almet-mystic dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                      Default
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-almet-bali-hai dark:divide-almet-comet">
                  {hrReps.map(rep => (
                    <tr key={rep.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-almet-cloud-burst dark:text-white">
                        {rep.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-waterloo dark:text-almet-bali-hai">
                        {rep.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {rep.isDefault ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-almet-sapphire text-white">
                            Default
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSetDefaultHR(rep.id)}
                            className="text-almet-waterloo hover:text-almet-sapphire text-xs"
                          >
                            Set as Default
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-almet-sapphire hover:text-almet-cloud-burst">
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Vacation Balances Tab */}
        {activeTab === 'balances' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-almet-mystic dark:border-almet-comet">
            <h2 className="text-xl font-semibold text-almet-cloud-burst dark:text-white mb-6">Vacation Balances Management</h2>
            
            <div className="space-y-6">
              <div className="bg-almet-mystic dark:bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-almet-cloud-burst dark:text-white mb-4">Bulk Upload/Download</h3>
                <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai mb-4">
                  Upload employee vacation balances using Excel template. Download template, fill in employee data, and upload.
                </p>
                
                <div className="flex gap-4">
                  <button
                    onClick={handleExportTemplate}
                    className="px-4 py-2 bg-white dark:bg-gray-600 text-almet-cloud-burst dark:text-white border border-almet-bali-hai dark:border-almet-comet rounded-lg hover:bg-almet-mystic dark:hover:bg-gray-500 transition-colors flex items-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Template
                  </button>
                  
                  <label className="px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-colors flex items-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    Upload Balances
                    <input
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      onChange={handleImportBalances}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

             

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4">
                <p className="text-sm text-almet-comet dark:text-yellow-200">
                  <strong>Note:</strong> Start Balance is the remaining balance from previous year. Yearly Balance is the new allocation for current year.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* General Settings Tab */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-almet-mystic dark:border-almet-comet">
            <h2 className="text-xl font-semibold text-almet-cloud-burst dark:text-white mb-6">General Settings</h2>
            
            <div className="space-y-6">
              <div className="border-b border-almet-bali-hai dark:border-almet-comet pb-6">
                <label className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-almet-cloud-burst dark:text-white">Allow Request When Zero Balance</p>
                    <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mt-1">
                      Allow employees to request vacation even when remaining balance is 0
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.allowRequestWhenZeroBalance}
                    onChange={(e) => setSettings({...settings, allowRequestWhenZeroBalance: e.target.checked})}
                    className="w-5 h-5 text-almet-sapphire border-almet-bali-hai rounded focus:ring-almet-sapphire"
                  />
                </label>
              </div>

              <div className="border-b border-almet-bali-hai dark:border-almet-comet pb-6">
                <label className="block">
                  <p className="text-sm font-medium text-almet-cloud-burst dark:text-white mb-2">Maximum Schedule Edits</p>
                  <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-3">
                    Number of times an employee can edit a scheduled vacation
                  </p>
                  <input
                    type="number"
                    value={settings.maxScheduleEdits}
                    onChange={(e) => setSettings({...settings, maxScheduleEdits: parseInt(e.target.value)})}
                    className="w-32 px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                    min="0"
                  />
                </label>
              </div>

              <div className="border-b border-almet-bali-hai dark:border-almet-comet pb-6">
                <label className="block">
                  <p className="text-sm font-medium text-almet-cloud-burst dark:text-white mb-2">Notification Days Before</p>
                  <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-3">
                    Send notification X days before vacation starts
                  </p>
                  <input
                    type="number"
                    value={settings.notificationDaysBefore}
                    onChange={(e) => setSettings({...settings, notificationDaysBefore: parseInt(e.target.value)})}
                    className="w-32 px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                    min="1"
                  />
                </label>
              </div>

              <div className="pb-6">
                <label className="block">
                  <p className="text-sm font-medium text-almet-cloud-burst dark:text-white mb-2">Notification Frequency</p>
                  <p className="text-xs text-almet-waterloo dark:text-almet-bali-hai mb-3">
                    How many times to send reminder notifications
                  </p>
                  <input
                    type="number"
                    value={settings.notificationFrequency}
                    onChange={(e) => setSettings({...settings, notificationFrequency: parseInt(e.target.value)})}
                    className="w-32 px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                    min="1"
                  />
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveSettings}
                  className="px-6 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-colors flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Non-Working Day Modal */}
        {showNonWorkingDayModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md border border-almet-mystic dark:border-almet-comet">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-almet-cloud-burst dark:text-white">
                  {editingItem ? 'Edit Non-Working Day' : 'Add Non-Working Day'}
                </h3>
                <button
                  onClick={() => {
                    setShowNonWorkingDayModal(false);
                    setEditingItem(null);
                  }}
                  className="text-almet-waterloo hover:text-almet-cloud-burst"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={nonWorkingDayForm.date}
                    onChange={(e) => setNonWorkingDayForm({...nonWorkingDayForm, date: e.target.value})}
                    className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={nonWorkingDayForm.name}
                    onChange={(e) => setNonWorkingDayForm({...nonWorkingDayForm, name: e.target.value})}
                    placeholder="e.g., New Year's Day"
                    className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                    Type
                  </label>
                  <select
                    value={nonWorkingDayForm.type}
                    onChange={(e) => setNonWorkingDayForm({...nonWorkingDayForm, type: e.target.value})}
                    className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                  >
                    <option value="Holiday">Holiday</option>
                    <option value="National Day">National Day</option>
                    <option value="Religious">Religious</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowNonWorkingDayModal(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg text-almet-cloud-burst dark:text-almet-mystic hover:bg-almet-mystic dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNonWorkingDay}
                  className="px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-colors"
                >
                  {editingItem ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Leave Type Modal */}
        {showLeaveTypeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md border border-almet-mystic dark:border-almet-comet">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-almet-cloud-burst dark:text-white">
                  {editingItem ? 'Edit Leave Type' : 'Add Leave Type'}
                </h3>
                <button
                  onClick={() => {
                    setShowLeaveTypeModal(false);
                    setEditingItem(null);
                  }}
                  className="text-almet-waterloo hover:text-almet-cloud-burst"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={leaveTypeForm.name}
                    onChange={(e) => setLeaveTypeForm({...leaveTypeForm, name: e.target.value})}
                    placeholder="e.g., Annual Leave"
                    className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                    Description
                  </label>
                  <textarea
                    value={leaveTypeForm.description}
                    onChange={(e) => setLeaveTypeForm({...leaveTypeForm, description: e.target.value})}
                    placeholder="Brief description"
                    rows={3}
                    className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                    Maximum Days
                  </label>
                  <input
                    type="number"
                    value={leaveTypeForm.maxDays}
                    onChange={(e) => setLeaveTypeForm({...leaveTypeForm, maxDays: e.target.value})}
                    placeholder="28"
                    className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={leaveTypeForm.isActive}
                      onChange={(e) => setLeaveTypeForm({...leaveTypeForm, isActive: e.target.checked})}
                      className="w-4 h-4 text-almet-sapphire border-almet-bali-hai rounded focus:ring-almet-sapphire"
                    />
                    <span className="ml-2 text-sm text-almet-comet dark:text-almet-bali-hai">Active</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowLeaveTypeModal(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg text-almet-cloud-burst dark:text-almet-mystic hover:bg-almet-mystic dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddLeaveType}
                  className="px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-colors"
                >
                  {editingItem ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}