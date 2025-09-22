"use client";
import { useState, useEffect } from 'react';
import { Calendar, Clock, Users, CheckCircle, XCircle, AlertCircle, Plus, FileText, Download } from 'lucide-react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";

// Mock data
const mockUser = {
  id: 1,
  name: "John Doe",
  businessFunction: "IT",
  department: "Development",
  unit: "Frontend Team",
  jobFunction: "Senior Developer",
  phoneNumber: "+994501234567",
  lineManager: "Jane Smith",
  hrRepresentative: "Sarah Johnson"
};

const mockBalances = {
  totalBalance: 28,
  yearlyBalance: 28,
  usedDays: 8,
  remainingBalance: 20,
  scheduledDays: 5,
  shouldBePlanned: 15
};

const mockNonWorkingDays = [
  "2025-01-01", "2025-01-20", "2025-03-08", "2025-03-20", "2025-03-21",
  "2025-05-09", "2025-05-28", "2025-06-15", "2025-06-26", "2025-11-09",
  "2025-11-10", "2025-12-31"
];

const mockScheduledLeaves = [
  { id: 1, employeeName: "Alice Brown", startDate: "2025-10-15", endDate: "2025-10-20", days: 4, status: "Scheduled" },
  { id: 2, employeeName: "Bob Wilson", startDate: "2025-10-18", endDate: "2025-10-25", days: 6, status: "Scheduled" }
];

const mockMySchedules = [
  { id: 1, leaveType: "Annual Leave", startDate: "2025-11-10", endDate: "2025-11-15", days: 4, status: "Scheduled" },
  { id: 2, leaveType: "Annual Leave", startDate: "2025-12-20", endDate: "2025-12-27", days: 6, status: "Scheduled" }
];

export default function VacationRequestsPage() {
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('request');
  const [activeSection, setActiveSection] = useState('immediate');
  const [requester, setRequester] = useState('for_me');
  const [formData, setFormData] = useState({
    employeeName: mockUser.name,
    businessFunction: mockUser.businessFunction,
    department: mockUser.department,
    unit: mockUser.unit,
    jobFunction: mockUser.jobFunction,
    phoneNumber: mockUser.phoneNumber,
    leaveType: 'Annual Leave',
    startDate: '',
    endDate: '',
    dateOfReturn: '',
    numberOfDays: 0,
    comment: '',
    lineManager: mockUser.lineManager,
    hrRepresentative: mockUser.hrRepresentative
  });
  const [schedulesTab, setSchedulesTab] = useState('upcoming');

  useEffect(() => {
    if (requester === 'for_me') {
      setFormData({
        ...formData,
        employeeName: mockUser.name,
        businessFunction: mockUser.businessFunction,
        department: mockUser.department,
        unit: mockUser.unit,
        jobFunction: mockUser.jobFunction,
        phoneNumber: mockUser.phoneNumber,
        lineManager: mockUser.lineManager
      });
    } else {
      setFormData({
        ...formData,
        employeeName: '',
        businessFunction: '',
        department: '',
        unit: '',
        jobFunction: '',
        phoneNumber: ''
      });
    }
  }, [requester]);

  const calculateWorkingDays = (start, end) => {
    if (!start || !end) return 0;
    
    const startDate = new Date(start);
    const endDate = new Date(end);
    let count = 0;
    
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const dayOfWeek = currentDate.getDay();
      
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !mockNonWorkingDays.includes(dateStr)) {
        count++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return count;
  };

  const calculateReturnDate = (endDate) => {
    if (!endDate) return '';
    
    const date = new Date(endDate);
    date.setDate(date.getDate() + 1);
    
    while (true) {
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay();
      
      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !mockNonWorkingDays.includes(dateStr)) {
        return dateStr;
      }
      date.setDate(date.getDate() + 1);
    }
  };

  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const days = calculateWorkingDays(formData.startDate, formData.endDate);
      const returnDate = calculateReturnDate(formData.endDate);
      setFormData(prev => ({
        ...prev,
        numberOfDays: days,
        dateOfReturn: returnDate
      }));
    }
  }, [formData.startDate, formData.endDate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (activeSection === 'immediate') {
      alert('Request submitted for approval');
    } else {
      alert('Schedule saved successfully');
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-almet-mystic dark:border-almet-comet hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
        </div>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-almet-cloud-burst dark:text-white mb-2">Vacation Management</h1>
          <p className="text-almet-waterloo dark:text-almet-bali-hai">Manage your vacation requests and schedules</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 border-b border-almet-bali-hai dark:border-almet-comet">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('request')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'request'
                  ? 'border-almet-sapphire text-almet-sapphire dark:text-almet-astral'
                  : 'border-transparent text-almet-waterloo hover:text-almet-cloud-burst dark:text-almet-bali-hai dark:hover:text-almet-mystic'
              }`}
            >
              Request Submission
            </button>
            <button
              onClick={() => setActiveTab('approval')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'approval'
                  ? 'border-almet-sapphire text-almet-sapphire dark:text-almet-astral'
                  : 'border-transparent text-almet-waterloo hover:text-almet-cloud-burst dark:text-almet-bali-hai dark:hover:text-almet-mystic'
              }`}
            >
              Approval
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'all'
                  ? 'border-almet-sapphire text-almet-sapphire dark:text-almet-astral'
                  : 'border-transparent text-almet-waterloo hover:text-almet-cloud-burst dark:text-almet-bali-hai dark:hover:text-almet-mystic'
              }`}
            >
              My All Requests & Schedules
            </button>
          </div>
        </div>

        {activeTab === 'request' && (
          <>
            {/* Balance Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <StatCard title="Total Balance" value={mockBalances.totalBalance} icon={Calendar} color="text-almet-sapphire" />
              <StatCard title="Yearly Balance" value={mockBalances.yearlyBalance} icon={Calendar} color="text-almet-astral" />
              <StatCard title="Used Days" value={mockBalances.usedDays} icon={CheckCircle} color="text-orange-600" />
              <StatCard title="Remaining Balance" value={mockBalances.remainingBalance} icon={Clock} color="text-almet-steel-blue" />
              <StatCard title="Scheduled Days" value={mockBalances.scheduledDays} icon={Users} color="text-almet-san-juan" />
              <StatCard title="Should be Planned" value={mockBalances.shouldBePlanned} icon={AlertCircle} color="text-red-600" />
            </div>

            {/* Section Toggle */}
            <div className="mb-6 flex space-x-4">
              <button
                onClick={() => setActiveSection('immediate')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeSection === 'immediate'
                    ? 'bg-almet-sapphire text-white hover:bg-almet-cloud-burst'
                    : 'bg-white text-almet-cloud-burst border border-almet-bali-hai hover:bg-almet-mystic dark:bg-gray-700 dark:text-almet-mystic dark:border-almet-comet'
                }`}
              >
                Request Immediately
              </button>
              <button
                onClick={() => setActiveSection('scheduling')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeSection === 'scheduling'
                    ? 'bg-almet-sapphire text-white hover:bg-almet-cloud-burst'
                    : 'bg-white text-almet-cloud-burst border border-almet-bali-hai hover:bg-almet-mystic dark:bg-gray-700 dark:text-almet-mystic dark:border-almet-comet'
                }`}
              >
                Scheduling
              </button>
            </div>

            {/* Request Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-almet-mystic dark:border-almet-comet">
              <h2 className="text-xl font-semibold text-almet-cloud-burst dark:text-white mb-6">
                {activeSection === 'immediate' ? 'Request Immediately' : 'Schedule Vacation'}
              </h2>

              <form onSubmit={handleSubmit}>
                {/* Employee Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-almet-cloud-burst dark:text-white mb-4">Employee Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                        Requester
                      </label>
                      <select
                        value={requester}
                        onChange={(e) => setRequester(e.target.value)}
                        className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                      >
                        <option value="for_me">For Me</option>
                        <option value="for_employee">For My Employee</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                        Employee Name
                      </label>
                      <input
                        type="text"
                        value={formData.employeeName}
                        onChange={(e) => setFormData({...formData, employeeName: e.target.value})}
                        disabled={requester === 'for_me'}
                        className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white disabled:bg-almet-mystic dark:disabled:bg-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                        Business Function
                      </label>
                      <input
                        type="text"
                        value={formData.businessFunction}
                        onChange={(e) => setFormData({...formData, businessFunction: e.target.value})}
                        disabled={requester === 'for_me'}
                        className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white disabled:bg-almet-mystic dark:disabled:bg-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                        Department
                      </label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        disabled={requester === 'for_me'}
                        className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white disabled:bg-almet-mystic dark:disabled:bg-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                        Unit
                      </label>
                      <input
                        type="text"
                        value={formData.unit}
                        onChange={(e) => setFormData({...formData, unit: e.target.value})}
                        disabled={requester === 'for_me'}
                        className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white disabled:bg-almet-mystic dark:disabled:bg-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                        Job Function
                      </label>
                      <input
                        type="text"
                        value={formData.jobFunction}
                        onChange={(e) => setFormData({...formData, jobFunction: e.target.value})}
                        disabled={requester === 'for_me'}
                        className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white disabled:bg-almet-mystic dark:disabled:bg-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})}
                        disabled={requester === 'for_me'}
                        className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white disabled:bg-almet-mystic dark:disabled:bg-gray-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Leave Request Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-almet-cloud-burst dark:text-white mb-4">Leave Request Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                        Leave Type
                      </label>
                      <select
                        value={formData.leaveType}
                        onChange={(e) => setFormData({...formData, leaveType: e.target.value})}
                        className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                      >
                        <option value="Annual Leave">Annual Leave</option>
                        <option value="Sick Leave">Sick Leave</option>
                        <option value="Personal Leave">Personal Leave</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                        className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                        className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                        Date of Return
                      </label>
                      <input
                        type="date"
                        value={formData.dateOfReturn}
                        disabled
                        className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white bg-almet-mystic dark:bg-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                        Number of Days
                      </label>
                      <input
                        type="number"
                        value={formData.numberOfDays}
                        disabled
                        className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg dark:bg-gray-700 dark:text-white bg-almet-mystic dark:bg-gray-600"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                        Comment (Optional)
                      </label>
                      <textarea
                        value={formData.comment}
                        onChange={(e) => setFormData({...formData, comment: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Approval Section */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-almet-cloud-burst dark:text-white mb-4">Approval</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                        Line Manager
                      </label>
                      <input
                        type="text"
                        value={formData.lineManager}
                        onChange={(e) => setFormData({...formData, lineManager: e.target.value})}
                        disabled={requester === 'for_me'}
                        className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white disabled:bg-almet-mystic dark:disabled:bg-gray-600"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                        HR Representative
                      </label>
                      <select
                        value={formData.hrRepresentative}
                        onChange={(e) => setFormData({...formData, hrRepresentative: e.target.value})}
                        className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                      >
                        <option value="Sarah Johnson">Sarah Johnson</option>
                        <option value="Mike Brown">Mike Brown</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Overlapping Schedules for Scheduling */}
                {activeSection === 'scheduling' && formData.startDate && formData.endDate && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium text-almet-cloud-burst dark:text-white mb-4">Team Schedule Conflicts</h3>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4">
                      <p className="text-sm text-almet-comet dark:text-yellow-200 mb-2">
                        The following team members have overlapping vacation schedules:
                      </p>
                      {mockScheduledLeaves.map(leave => (
                        <div key={leave.id} className="text-sm text-almet-cloud-burst dark:text-yellow-300">
                          • {leave.employeeName}: {leave.startDate} to {leave.endDate} ({leave.days} days)
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    className="px-6 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg text-almet-cloud-burst dark:text-almet-mystic hover:bg-almet-mystic dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-colors flex items-center gap-2"
                  >
                    {activeSection === 'immediate' ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Submit Request
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Save Schedule
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Schedules Tabs */}
              {activeSection === 'scheduling' && (
                <div className="mt-8 pt-8 border-t border-almet-bali-hai dark:border-almet-comet">
                  <div className="mb-4 border-b border-almet-bali-hai dark:border-almet-comet">
                    <div className="flex space-x-8">
                      <button
                        onClick={() => setSchedulesTab('upcoming')}
                        className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                          schedulesTab === 'upcoming'
                            ? 'border-almet-sapphire text-almet-sapphire dark:text-almet-astral'
                            : 'border-transparent text-almet-waterloo hover:text-almet-cloud-burst dark:text-almet-bali-hai'
                        }`}
                      >
                        My Upcoming Schedules
                      </button>
                      <button
                        onClick={() => setSchedulesTab('team')}
                        className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                          schedulesTab === 'team'
                            ? 'border-almet-sapphire text-almet-sapphire dark:text-almet-astral'
                            : 'border-transparent text-almet-waterloo hover:text-almet-cloud-burst dark:text-almet-bali-hai'
                        }`}
                      >
                        My Peers and Team Schedule
                      </button>
                      <button
                        onClick={() => setSchedulesTab('all')}
                        className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                          schedulesTab === 'all'
                            ? 'border-almet-sapphire text-almet-sapphire dark:text-almet-astral'
                            : 'border-transparent text-almet-waterloo hover:text-almet-cloud-burst dark:text-almet-bali-hai'
                        }`}
                      >
                        My All Schedules
                      </button>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-almet-bali-hai dark:divide-almet-comet">
                      <thead className="bg-almet-mystic dark:bg-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                            Employee
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                            Leave Type
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                            Start Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                            End Date
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                            Days
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-almet-bali-hai dark:divide-almet-comet">
                        {schedulesTab === 'upcoming' && mockMySchedules.map(schedule => (
                          <tr key={schedule.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">
                              {mockUser.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">
                              {schedule.leaveType}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">
                              {schedule.startDate}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">
                              {schedule.endDate}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">
                              {schedule.days}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-almet-sapphire dark:bg-blue-900 dark:text-almet-astral">
                                {schedule.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {schedulesTab === 'team' && mockScheduledLeaves.map(leave => (
                          <tr key={leave.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">
                              {leave.employeeName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">
                              Annual Leave
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">
                              {leave.startDate}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">
                              {leave.endDate}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">
                              {leave.days}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-almet-sapphire dark:bg-blue-900 dark:text-almet-astral">
                                {leave.status}
                              </span>
                            </td>
                          </tr>
                        ))}
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
                  3 Pending
                </span>
              </div>
              <div className="space-y-4">
                {[
                  { id: 1, employee: "Tom Anderson", type: "Annual Leave", start: "2025-10-01", end: "2025-10-05", days: 5, status: "Pending Line Manager" },
                  { id: 2, employee: "Lisa Martin", type: "Annual Leave", start: "2025-10-10", end: "2025-10-12", days: 3, status: "Pending HR" },
                  { id: 3, employee: "David Chen", type: "Personal Leave", start: "2025-10-15", end: "2025-10-17", days: 3, status: "Pending Line Manager" }
                ].map(request => (
                  <div key={request.id} className="border border-almet-bali-hai dark:border-almet-comet rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-medium text-almet-cloud-burst dark:text-white">{request.employee}</h3>
                        <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai mt-1">
                          {request.type} • {request.start} to {request.end} ({request.days} days)
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1">
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-almet-mystic dark:border-almet-comet">
              <h2 className="text-xl font-semibold text-almet-cloud-burst dark:text-white mb-6">Approval History</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-almet-bali-hai dark:divide-almet-comet">
                  <thead className="bg-almet-mystic dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                        Employee
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                        Leave Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-almet-bali-hai dark:divide-almet-comet">
                    {[
                      { id: 1, employee: "Emma Wilson", type: "Annual Leave", period: "Sep 15-20", status: "Approved", date: "2025-09-10" },
                      { id: 2, employee: "James Lee", type: "Sick Leave", period: "Sep 05-07", status: "Approved", date: "2025-09-05" },
                      { id: 3, employee: "Olivia Brown", type: "Annual Leave", period: "Aug 20-25", status: "Rejected", date: "2025-08-15" }
                    ].map(history => (
                      <tr key={history.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">
                          {history.employee}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">
                          {history.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">
                          {history.period}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            history.status === 'Approved' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {history.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">
                          {history.date}
                        </td>
                      </tr>
                    ))}
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
              <button className="px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-almet-bali-hai dark:divide-almet-comet">
                <thead className="bg-almet-mystic dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                      Leave Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                      Start Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                      End Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                      Days
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
                  {[
                    { id: 1, type: "Annual Leave", start: "2025-11-10", end: "2025-11-15", days: 4, status: "Scheduled" },
                    { id: 2, type: "Annual Leave", start: "2025-12-20", end: "2025-12-27", days: 6, status: "Scheduled" },
                    { id: 3, type: "Annual Leave", start: "2025-09-05", end: "2025-09-10", days: 4, status: "Approved" },
                    { id: 4, type: "Sick Leave", start: "2025-08-15", end: "2025-08-17", days: 3, status: "Approved" },
                    { id: 5, type: "Annual Leave", start: "2025-07-01", end: "2025-07-10", days: 8, status: "Completed" }
                  ].map(record => (
                    <tr key={record.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">
                        {record.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">
                        {record.start}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">
                        {record.end}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">
                        {record.days}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          record.status === 'Scheduled' 
                            ? 'bg-blue-100 text-almet-sapphire dark:bg-blue-900 dark:text-almet-astral'
                            : record.status === 'Approved'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : record.status === 'Completed'
                            ? 'bg-gray-100 text-almet-waterloo dark:bg-gray-700 dark:text-almet-bali-hai'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {record.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {record.status === 'Scheduled' && (
                          <div className="flex gap-2">
                            <button className="text-almet-sapphire hover:text-almet-cloud-burst dark:text-almet-astral dark:hover:text-almet-steel-blue">
                              Edit
                            </button>
                            <button className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300">
                              Register
                            </button>
                          </div>
                        )}
                        {record.status !== 'Scheduled' && record.status !== 'Completed' && (
                          <button className="text-almet-waterloo hover:text-almet-cloud-burst dark:text-almet-bali-hai dark:hover:text-almet-mystic">
                            View
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}