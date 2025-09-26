"use client";
import { useState } from 'react';
import { Plane, Car, Hotel, Plus, Trash2, Send, CheckCircle, XCircle, Clock, MapPin, Calendar, DollarSign } from 'lucide-react';
import DashboardLayout from "@/components/layout/DashboardLayout";
import { useTheme } from "@/components/common/ThemeProvider";

// Mock data
const mockUser = {
  id: 1,
  name: "Nizamo Tahirov",
  function: "IT",
  department: "Development",
  division: "Frontend Team",
  phoneNumber: "+994501234567",
  lineManager: "Jane Smith"
};

const mockStatistics = {
  pendingRequests: 3,
  approvedTrips: 12,
  totalDaysThisYear: 45,
  upcomingTrips: 2
};

const mockRequests = [
  { 
    id: 1, 
    type: "Domestic", 
    destination: "Ganja", 
    startDate: "2025-10-01", 
    endDate: "2025-10-03", 
    status: "Pending Line Manager",
    currentApprover: "Jane Smith"
  },
  { 
    id: 2, 
    type: "Overseas", 
    destination: "Istanbul, Turkey", 
    startDate: "2025-11-15", 
    endDate: "2025-11-20", 
    status: "Approved",
    amount: "2500 AZN"
  }
];

const mockPendingApprovals = [
  {
    id: 1,
    employeeName: "Tom Anderson",
    type: "Overseas",
    destination: "Dubai, UAE",
    startDate: "2025-10-10",
    endDate: "2025-10-15",
    status: "Pending Line Manager",
    timeline: ["Line Manager", "Finance/Payroll", "HR"],
    currentStep: 0
  },
  {
    id: 2,
    employeeName: "Lisa Martin",
    type: "Domestic",
    destination: "Ganja",
    startDate: "2025-10-05",
    endDate: "2025-10-07",
    status: "Pending Finance/Payroll",
    timeline: ["Line Manager ✓", "Finance/Payroll", "HR"],
    currentStep: 1,
    amount: ""
  }
];

export default function BusinessTripPage() {
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('request');
  const [requester, setRequester] = useState('for_me');
  const [formData, setFormData] = useState({
    employeeName: mockUser.name,
    businessFunction: mockUser.function,
    department: mockUser.department,
    unit: mockUser.division,
    jobFunction: mockUser.function,
    phoneNumber: mockUser.phoneNumber,
    travelType: 'Domestic',
    transportType: 'Airplane',
    purpose: 'Conference',
    lineManager: mockUser.lineManager,
    financeApprover: '',
    hrApprover: ''
  });

  const [schedules, setSchedules] = useState([
    { id: 1, date: '', from: '', to: '' }
  ]);

  const [hotels, setHotels] = useState([
    { id: 1, hotelName: '', checkIn: '', checkOut: '' }
  ]);

  const [approvalAmount, setApprovalAmount] = useState('');
  const [approvalNote, setApprovalNote] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const handleAddSchedule = () => {
    setSchedules([...schedules, { id: Date.now(), date: '', from: '', to: '' }]);
  };

  const handleRemoveSchedule = (id) => {
    setSchedules(schedules.filter(s => s.id !== id));
  };

  const handleScheduleChange = (id, field, value) => {
    setSchedules(schedules.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const handleAddHotel = () => {
    setHotels([...hotels, { id: Date.now(), hotelName: '', checkIn: '', checkOut: '' }]);
  };

  const handleRemoveHotel = (id) => {
    setHotels(hotels.filter(h => h.id !== id));
  };

  const handleHotelChange = (id, field, value) => {
    setHotels(hotels.map(h => 
      h.id === id ? { ...h, [field]: value } : h
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Business trip request submitted successfully!');
  };

  const handleApprove = () => {
    alert(`Request approved${approvalAmount ? ` with amount: ${approvalAmount} AZN` : ''}`);
    setShowApprovalModal(false);
    setApprovalAmount('');
    setApprovalNote('');
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    alert('Request rejected: ' + rejectionReason);
    setShowRejectionModal(false);
    setRejectionReason('');
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-almet-mystic dark:border-almet-comet">
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
          <h1 className="text-3xl font-bold text-almet-cloud-burst dark:text-white mb-2">Business Trip Management</h1>
          <p className="text-almet-waterloo dark:text-almet-bali-hai">Manage business trip requests and approvals</p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 border-b border-almet-bali-hai dark:border-almet-comet">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('request')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'request'
                  ? 'border-almet-sapphire text-almet-sapphire dark:text-almet-astral'
                  : 'border-transparent text-almet-waterloo hover:text-almet-cloud-burst dark:text-almet-bali-hai'
              }`}
            >
              Request Submission
            </button>
            <button
              onClick={() => setActiveTab('approval')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'approval'
                  ? 'border-almet-sapphire text-almet-sapphire dark:text-almet-astral'
                  : 'border-transparent text-almet-waterloo hover:text-almet-cloud-burst dark:text-almet-bali-hai'
              }`}
            >
              Approval
            </button>
          </div>
        </div>

        {/* Request Submission Tab */}
        {activeTab === 'request' && (
          <>
            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard title="Pending Requests" value={mockStatistics.pendingRequests} icon={Clock} color="text-orange-600" />
              <StatCard title="Approved Trips" value={mockStatistics.approvedTrips} icon={CheckCircle} color="text-green-600" />
              <StatCard title="Total Days This Year" value={mockStatistics.totalDaysThisYear} icon={Calendar} color="text-almet-sapphire" />
              <StatCard title="Upcoming Trips" value={mockStatistics.upcomingTrips} icon={Plane} color="text-almet-astral" />
            </div>

            {/* Request Form */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-almet-mystic dark:border-almet-comet mb-8">
              <h2 className="text-xl font-semibold text-almet-cloud-burst dark:text-white mb-6">New Business Trip Request</h2>

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

                {/* Travel Information */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-almet-cloud-burst dark:text-white mb-4">Travel Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                        Type of Travel
                      </label>
                      <select
                        value={formData.travelType}
                        onChange={(e) => setFormData({...formData, travelType: e.target.value})}
                        className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                      >
                        <option value="Domestic">Domestic</option>
                        <option value="Overseas">Overseas</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                        Transport Type
                      </label>
                      <select
                        value={formData.transportType}
                        onChange={(e) => setFormData({...formData, transportType: e.target.value})}
                        className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                      >
                        <option value="Taxi">Taxi</option>
                        <option value="Private car">Private car</option>
                        <option value="Corporate car">Corporate car</option>
                        <option value="Train">Train</option>
                        <option value="Airplane">Airplane</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                        Purpose
                      </label>
                      <select
                        value={formData.purpose}
                        onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                        className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                      >
                        <option value="Conference">Conference</option>
                        <option value="Meeting">Meeting</option>
                        <option value="Training">Training</option>
                        <option value="Site Visit">Site Visit</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Schedule Details */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-almet-cloud-burst dark:text-white">Schedule Details</h3>
                    <button
                      type="button"
                      onClick={handleAddSchedule}
                      className="px-3 py-1 bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-colors flex items-center gap-1 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Schedule
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {schedules.map((schedule) => (
                      <div key={schedule.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                        <div>
                          <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                            Date
                          </label>
                          <input
                            type="date"
                            value={schedule.date}
                            onChange={(e) => handleScheduleChange(schedule.id, 'date', e.target.value)}
                            className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                            From
                          </label>
                          <input
                            type="text"
                            value={schedule.from}
                            onChange={(e) => handleScheduleChange(schedule.id, 'from', e.target.value)}
                            placeholder="City/Location"
                            className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                            To
                          </label>
                          <input
                            type="text"
                            value={schedule.to}
                            onChange={(e) => handleScheduleChange(schedule.id, 'to', e.target.value)}
                            placeholder="City/Location"
                            className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          {schedules.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveSchedule(schedule.id)}
                              className="px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hotel Details */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-almet-cloud-burst dark:text-white">Hotel Details</h3>
                    <button
                      type="button"
                      onClick={handleAddHotel}
                      className="px-3 py-1 bg-almet-sapphire text-white rounded-lg hover:bg-almet-cloud-burst transition-colors flex items-center gap-1 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Hotel
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {hotels.map((hotel) => (
                      <div key={hotel.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                        <div>
                          <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                            Hotel Name
                          </label>
                          <input
                            type="text"
                            value={hotel.hotelName}
                            onChange={(e) => handleHotelChange(hotel.id, 'hotelName', e.target.value)}
                            placeholder="Hotel name"
                            className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                            Check-in
                          </label>
                          <input
                            type="date"
                            value={hotel.checkIn}
                            onChange={(e) => handleHotelChange(hotel.id, 'checkIn', e.target.value)}
                            className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                            Check-out
                          </label>
                          <input
                            type="date"
                            value={hotel.checkOut}
                            onChange={(e) => handleHotelChange(hotel.id, 'checkOut', e.target.value)}
                            className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                        <div>
                          {hotels.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveHotel(hotel.id)}
                              className="px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Approver Details */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-almet-cloud-burst dark:text-white mb-4">Approver Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                        Finance/Payroll
                      </label>
                      <select
                        value={formData.financeApprover}
                        onChange={(e) => setFormData({...formData, financeApprover: e.target.value})}
                        className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select Finance Approver</option>
                        <option value="Michael Scott">Michael Scott</option>
                        <option value="David Wallace">David Wallace</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                        HR Representative
                      </label>
                      <select
                        value={formData.hrApprover}
                        onChange={(e) => setFormData({...formData, hrApprover: e.target.value})}
                        className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                      >
                        <option value="">Select HR Approver</option>
                        <option value="Sarah Johnson">Sarah Johnson</option>
                        <option value="Mike Brown">Mike Brown</option>
                      </select>
                    </div>
                  </div>
                </div>

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
                    <Send className="w-4 h-4" />
                    Submit Request
                  </button>
                </div>
              </form>
            </div>

            {/* My Requests List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-almet-mystic dark:border-almet-comet">
              <h2 className="text-xl font-semibold text-almet-cloud-burst dark:text-white mb-6">My Requests</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-almet-bali-hai dark:divide-almet-comet">
                  <thead className="bg-almet-mystic dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                        Destination
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                        Start Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                        End Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-almet-bali-hai dark:divide-almet-comet">
                    {mockRequests.map(request => (
                      <tr key={request.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">
                          {request.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">
                          {request.destination}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">
                          {request.startDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">
                          {request.endDate}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            request.status === 'Approved' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : request.status.includes('Pending')
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-waterloo dark:text-almet-bali-hai">
                          {request.amount || request.currentApprover}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {/* Approval Tab */}
        {activeTab === 'approval' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-almet-mystic dark:border-almet-comet">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-almet-cloud-burst dark:text-white">Pending Approvals</h2>
                <span className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 px-3 py-1 rounded-full text-sm font-medium">
                  {mockPendingApprovals.length} Pending
                </span>
              </div>

              <div className="space-y-4">
                {mockPendingApprovals.map(request => (
                  <div key={request.id} className="border border-almet-bali-hai dark:border-almet-comet rounded-lg p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-medium text-almet-cloud-burst dark:text-white text-lg">{request.employeeName}</h3>
                        <div className="flex items-center gap-4 mt-2 text-sm text-almet-waterloo dark:text-almet-bali-hai">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {request.type}: {request.destination}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {request.startDate} to {request.endDate}
                          </span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        request.status.includes('Line Manager')
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : request.status.includes('Finance')
                          ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {request.status}
                      </span>
                    </div>

                    {/* Timeline */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between">
                        {request.timeline.map((step, index) => (
                          <div key={index} className="flex items-center">
                            <div className={`flex flex-col items-center ${index <= request.currentStep ? 'text-almet-sapphire' : 'text-almet-waterloo dark:text-almet-bali-hai'}`}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                index < request.currentStep 
                                  ? 'bg-green-500 text-white'
                                  : index === request.currentStep
                                  ? 'bg-almet-sapphire text-white'
                                  : 'bg-almet-mystic dark:bg-gray-700 text-almet-waterloo'
                              }`}>
                                {index < request.currentStep ? <CheckCircle className="w-5 h-5" /> : index + 1}
                              </div>
                              <span className="text-xs mt-1 text-center max-w-24">{step}</span>
                            </div>
                            {index < request.timeline.length - 1 && (
                              <div className={`h-0.5 w-16 mx-2 ${index < request.currentStep ? 'bg-green-500' : 'bg-almet-mystic dark:bg-gray-700'}`} />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-2">
                      {request.status.includes('Finance') && (
                        <div className="flex-1 max-w-xs mr-4">
                          <input
                            type="number"
                            placeholder="Enter amount (AZN)"
                            className="w-full px-3 py-2 text-sm border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                          />
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowApprovalModal(true);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowRejectionModal(true);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Approval History */}
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
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                        Destination
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                        Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-almet-comet dark:text-almet-bali-hai uppercase tracking-wider">
                        Amount
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-almet-bali-hai dark:divide-almet-comet">
                    {[
                      { id: 1, employee: "Emma Wilson", type: "Overseas", destination: "London", period: "Sep 10-15", status: "Approved", amount: "3500 AZN" },
                      { id: 2, employee: "James Lee", type: "Domestic", destination: "Ganja", period: "Sep 05-07", status: "Approved", amount: "450 AZN" },
                      { id: 3, employee: "Olivia Brown", type: "Overseas", destination: "Dubai", period: "Aug 20-25", status: "Rejected", amount: "-" }
                    ].map(history => (
                      <tr key={history.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">
                          {history.employee}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">
                          {history.type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-almet-cloud-burst dark:text-white">
                          {history.destination}
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
                          {history.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Approval Modal */}
        {showApprovalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md border border-almet-mystic dark:border-almet-comet">
              <h3 className="text-lg font-semibold text-almet-cloud-burst dark:text-white mb-4">
                Approve Business Trip Request
              </h3>

              <div className="space-y-4">
                {selectedRequest?.status.includes('Finance') && (
                  <div>
                    <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                      Trip Amount (AZN) *
                    </label>
                    <input
                      type="number"
                      value={approvalAmount}
                      onChange={(e) => setApprovalAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                    Note (Optional)
                  </label>
                  <textarea
                    value={approvalNote}
                    onChange={(e) => setApprovalNote(e.target.value)}
                    placeholder="Add any notes"
                    rows={3}
                    className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setApprovalAmount('');
                    setApprovalNote('');
                  }}
                  className="px-4 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg text-almet-cloud-burst dark:text-almet-mystic hover:bg-almet-mystic dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApprove}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Confirm Approval
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rejection Modal */}
        {showRejectionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md border border-almet-mystic dark:border-almet-comet">
              <h3 className="text-lg font-semibold text-almet-cloud-burst dark:text-white mb-4">
                Reject Business Trip Request
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-almet-comet dark:text-almet-bali-hai mb-2">
                    Reason for Rejection *
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Please provide a reason for rejection"
                    rows={4}
                    className="w-full px-3 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg focus:ring-2 focus:ring-almet-sapphire dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowRejectionModal(false);
                    setRejectionReason('');
                  }}
                  className="px-4 py-2 border border-almet-bali-hai dark:border-almet-comet rounded-lg text-almet-cloud-burst dark:text-almet-mystic hover:bg-almet-mystic dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}