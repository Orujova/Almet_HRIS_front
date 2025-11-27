'use client';
import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTheme } from '@/components/common/ThemeProvider';

// Utility function to generate unique IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

// Status badge component
const StatusBadge = ({ status }) => {
  const statusConfig = {
    'Created': { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', label: 'Created' },
    'Signed by Handing Over': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300', label: 'Signed by HO' },
    'Signed by Taking Over': { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-800 dark:text-cyan-300', label: 'Signed by TO' },
    'Approved by Line Manager': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', label: 'Approved by LM' },
    'Rejected': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-800 dark:text-red-300', label: 'Rejected' },
    'Need Clarification': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', label: 'Need Clarification' },
    'Taken Over': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', label: 'Taken Over' },
    'Taken Back': { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-800 dark:text-indigo-300', label: 'Taken Back' },
    'Resubmitted': { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-800 dark:text-purple-300', label: 'Resubmitted' },
    'Not started': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', label: 'Not Started' },
    'In progress': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-800 dark:text-blue-300', label: 'In Progress' },
    'Completed': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-800 dark:text-green-300', label: 'Completed' },
    'Canceled': { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', label: 'Canceled' },
    'Postponed': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-800 dark:text-yellow-300', label: 'Postponed' },
  };

  const config = statusConfig[status] || statusConfig['Created'];
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
};

// Stat Card Component
const StatCard = ({ value, label, variant = 'default' }) => {
  const variants = {
    default: 'from-almet-sapphire to-almet-astral',
    warning: 'from-yellow-500 to-yellow-600',
    success: 'from-green-500 to-green-600',
    info: 'from-almet-astral to-almet-steel-blue',
  };

  return (
    <div className={`bg-gradient-to-br ${variants[variant]} text-white p-6 rounded-xl shadow-lg`}>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm opacity-90">{label}</div>
    </div>
  );
};

// Task Item Component
const TaskItem = ({ task, onRemove, showRemove = true }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-3">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Task Description
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-almet-sapphire dark:focus:ring-almet-astral focus:border-transparent"
            rows="2"
            value={task.description}
            onChange={(e) => task.onChange && task.onChange('description', e.target.value)}
            required
          />
        </div>
        {showRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-3 text-red-500 hover:text-red-700 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Initial Status
          </label>
          <select
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-almet-sapphire dark:focus:ring-almet-astral focus:border-transparent"
            value={task.currentStatus}
            onChange={(e) => task.onChange && task.onChange('currentStatus', e.target.value)}
          >
            <option value="Not started">Not Started</option>
            <option value="In progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="Canceled">Canceled</option>
            <option value="Postponed">Postponed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Comment (Optional)
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-almet-sapphire dark:focus:ring-almet-astral focus:border-transparent"
            value={task.initialComment || ''}
            onChange={(e) => task.onChange && task.onChange('initialComment', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

// Date Item Component
const DateItem = ({ date, onRemove, showRemove = true }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-3">
      <div className="flex justify-between items-start">
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-almet-sapphire dark:focus:ring-almet-astral focus:border-transparent"
              value={date.date}
              onChange={(e) => date.onChange && date.onChange('date', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <input
              type="text"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-almet-sapphire dark:focus:ring-almet-astral focus:border-transparent"
              value={date.description}
              onChange={(e) => date.onChange && date.onChange('description', e.target.value)}
              required
            />
          </div>
        </div>
        {showRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-3 text-red-500 hover:text-red-700 transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-4">
          {children}
        </div>
        {footer && (
          <div className="sticky bottom-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end gap-3 flex-wrap">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Main Component
const HandoverSystem = () => {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState('submission');
  const [handovers, setHandovers] = useState([]);
  const [currentHandover, setCurrentHandover] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [logData, setLogData] = useState({ logs: [], title: '', isTaskLog: false });

  // Current user info
  const currentUser = 'Thomas Gepsan';
  const currentUserRole = 'Line Manager';

  // Employee data
  const employees = [
    { name: 'Thomas Gepsan', position: 'Super Admin', department: 'IT', manager: 'John Doe' },
    { name: 'John Doe', position: 'Line Manager', department: 'IT', manager: 'Emily Wang' },
    { name: 'Jane Smith', position: 'Project Manager', department: 'Marketing', manager: 'John Doe' },
    { name: 'David Kim', position: 'Analyst', department: 'Finance', manager: 'Sarah Lee' },
    { name: 'Sarah Lee', position: 'Finance Lead', department: 'Finance', manager: 'Emily Wang' },
    { name: 'Emily Wang', position: 'HR Manager', department: 'HR', manager: null }
  ];

  // Form state
  const [formData, setFormData] = useState({
    handingOver: 'me',
    position: 'Super Admin',
    department: 'IT',
    handoverType: '',
    startDate: '',
    endDate: '',
    handoverTo: '',
    tasks: [{ id: generateId(), description: '', currentStatus: 'Not started', initialComment: '' }],
    contacts: '',
    dates: [{ id: generateId(), date: '', description: '' }],
    access: '',
    documents: '',
    issues: '',
    notes: ''
  });

  // Load sample data on mount
  useEffect(() => {
    loadSampleData();
  }, []);

  const loadSampleData = () => {
    const sampleHandovers = [
      {
        id: generateId(),
        handingOver: 'Thomas Gepsan',
        handingOverInfo: employees.find(e => e.name === 'Thomas Gepsan'),
        handoverTo: 'Jane Smith',
        handoverToInfo: employees.find(e => e.name === 'Jane Smith'),
        type: 'Vacation',
        startDate: '2024-07-01',
        endDate: '2024-07-15',
        tasks: [
          { 
            id: generateId(), 
            description: 'Daily reporting for Project Alpha', 
            currentStatus: 'In progress', 
            initialComment: 'Current work. Check data in CRM.',
            activityLog: [{ 
              timestamp: new Date(2024, 5, 20, 10, 0, 0).toLocaleString('en-US'), 
              actor: 'Thomas Gepsan', 
              role: 'Handing Over Employee', 
              action: 'Initial Status Set', 
              oldStatus: '-', 
              newStatus: 'In progress', 
              comment: 'Current work. Check data in CRM.' 
            }] 
          },
          { 
            id: generateId(), 
            description: 'Q2 final reports analysis', 
            currentStatus: 'Not started', 
            initialComment: 'Must be completed by July 10.',
            activityLog: [{ 
              timestamp: new Date(2024, 5, 20, 10, 5, 0).toLocaleString('en-US'), 
              actor: 'Thomas Gepsan', 
              role: 'Handing Over Employee', 
              action: 'Initial Status Set', 
              oldStatus: '-', 
              newStatus: 'Not started', 
              comment: 'Must be completed by July 10.' 
            }] 
          }
        ],
        contacts: 'Client X (email@example.com)\nVendor Y (vendor@example.com, tel: 050-111-22-33)',
        dates: [{ date: '2024-07-05', description: 'Project Alpha checkpoint' }],
        access: 'CRM system access (username: thomasg, password: [check vault])\nJIRA account (thomasg)',
        documents: 'Shared Drive/Projects/Alpha folder\nSharePoint/Reports directory',
        issues: 'Bug report #123 is active, must coordinate with developer team.',
        notes: 'Monitor daily Teams meetings. Project documents are updated weekly.',
        status: 'Created',
        hoSigned: false, 
        hoSignedDate: null,
        toSigned: false, 
        toSignedDate: null,
        lmApproved: false, 
        lmComment: '', 
        lmClarificationNeeded: false,
        takenOver: false, 
        takenBack: false,
        createdDate: '2024-06-20',
        approvers: { lineManager: 'John Doe' },
        activityLog: [{ 
          timestamp: new Date(2024, 5, 20, 10, 10, 0).toLocaleString('en-US'), 
          actor: 'Thomas Gepsan', 
          role: 'Super Admin', 
          action: 'Handover created', 
          comment: 'New handover form created.', 
          status: 'Created' 
        }]
      }
    ];
    setHandovers(sampleHandovers);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const handingOver = formData.handingOver === 'me' ? currentUser : formData.handingOver;
    const handingOverInfo = employees.find(emp => emp.name === handingOver);
    const handoverToInfo = employees.find(emp => emp.name === formData.handoverTo);

    if (!handingOverInfo || !handoverToInfo || formData.tasks.length === 0 || formData.dates.length === 0) {
      alert('Please fill all required fields.');
      return;
    }

    const newHandover = {
      id: generateId(),
      handingOver: handingOver,
      handingOverInfo: handingOverInfo,
      handoverTo: formData.handoverTo,
      handoverToInfo: handoverToInfo,
      type: formData.handoverType,
      startDate: formData.startDate,
      endDate: formData.endDate,
      tasks: formData.tasks.map(task => ({
        ...task,
        activityLog: [{
          timestamp: new Date().toLocaleString('en-US'),
          actor: handingOver,
          role: 'Handing Over Employee',
          action: 'Initial Status Set',
          oldStatus: '-',
          newStatus: task.currentStatus,
          comment: task.initialComment || '-'
        }]
      })),
      contacts: formData.contacts,
      dates: formData.dates,
      access: formData.access,
      documents: formData.documents,
      issues: formData.issues,
      notes: formData.notes,
      status: 'Created',
      hoSigned: false,
      hoSignedDate: null,
      toSigned: false,
      toSignedDate: null,
      lmApproved: false,
      lmComment: '',
      lmClarificationNeeded: false,
      takenOver: false,
      takenBack: false,
      createdDate: new Date().toISOString().split('T')[0],
      approvers: { lineManager: handingOverInfo.manager },
      activityLog: [{
        timestamp: new Date().toLocaleString('en-US'),
        actor: currentUser,
        action: 'Handover created',
        comment: 'New handover form created.',
        status: 'Created'
      }]
    };

    setHandovers([...handovers, newHandover]);
    alert('Handover successfully created!');
    
    // Reset form
    setFormData({
      handingOver: 'me',
      position: 'Super Admin',
      department: 'IT',
      handoverType: '',
      startDate: '',
      endDate: '',
      handoverTo: '',
      tasks: [{ id: generateId(), description: '', currentStatus: 'Not started', initialComment: '' }],
      contacts: '',
      dates: [{ id: generateId(), date: '', description: '' }],
      access: '',
      documents: '',
      issues: '',
      notes: ''
    });
  };

  // Calculate stats
  const getStats = () => {
    const myHandovers = handovers.filter(h => 
      h.handingOver === currentUser || 
      h.handoverTo === currentUser || 
      (h.handingOverInfo && h.handingOverInfo.manager === currentUser)
    );

    const pending = myHandovers.filter(h => 
      (h.handingOver === currentUser && h.status === 'Created' && !h.hoSigned) ||
      (h.handoverTo === currentUser && h.status === 'Signed by Handing Over' && !h.toSigned) ||
      (h.handingOverInfo && h.handingOverInfo.manager === currentUser && h.status === 'Signed by Taking Over' && !h.lmApproved) ||
      (h.handingOver === currentUser && h.status === 'Need Clarification') ||
      (h.handoverTo === currentUser && h.status === 'Approved by Line Manager' && !h.takenOver) ||
      (h.handingOver === currentUser && h.status === 'Taken Over' && !h.takenBack)
    ).length;

    const active = myHandovers.filter(h => 
      !['Rejected', 'Taken Over', 'Taken Back'].includes(h.status)
    ).length;

    const completed = myHandovers.filter(h => 
      ['Taken Over', 'Taken Back', 'Rejected'].includes(h.status) && 
      h.handingOver === currentUser
    ).length;

    return { pending, active, completed };
  };

  const stats = getStats();

  // Render handover table
  const renderHandoverTable = (filterFn) => {
    const filtered = handovers.filter(filterFn);

    if (filtered.length === 0) {
      return (
        <tr>
          <td colSpan="7" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
            No handovers found
          </td>
        </tr>
      );
    }

    return filtered.map(h => (
      <tr key={h.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">#{h.id.substring(0, 6)}</td>
        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{h.type}</td>
        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{h.handingOver}</td>
        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{h.handoverTo}</td>
        <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{h.startDate} / {h.endDate}</td>
        <td className="px-4 py-3 text-sm"><StatusBadge status={h.status} /></td>
        <td className="px-4 py-3 text-sm">
          <button
            onClick={() => openDetailModal(h)}
            className="px-3 py-1.5 bg-almet-sapphire hover:bg-almet-astral text-white rounded-lg text-xs font-medium transition-colors inline-flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View
          </button>
        </td>
      </tr>
    ));
  };

  // Open detail modal
  const openDetailModal = (handover) => {
    setCurrentHandover(handover);
    setModalOpen(true);
  };

  // Show task log modal
  const showTaskLog = (taskId) => {
    const task = currentHandover.tasks.find(t => t.id === taskId);
    if (task) {
      setLogData({
        logs: task.activityLog,
        title: `Task: "${task.description}" - History`,
        isTaskLog: true
      });
      setLogModalOpen(true);
    }
  };

  // Show full history
  const showFullHistory = () => {
    if (currentHandover) {
      setLogData({
        logs: currentHandover.activityLog,
        title: `Handover #${currentHandover.id.substring(0, 6)} - Activity History`,
        isTaskLog: false
      });
      setLogModalOpen(true);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-2 mb-6">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('submission')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'submission'
                  ? 'bg-almet-sapphire text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              New Handover
            </button>
            <button
              onClick={() => setActiveTab('my-requests')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'my-requests'
                  ? 'bg-almet-sapphire text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              My Handovers
            </button>
            <button
              onClick={() => setActiveTab('approval')}
              className={`flex-1 px-6 py-3 rounded-lg font-medium text-sm transition-all ${
                activeTab === 'approval'
                  ? 'bg-almet-sapphire text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Approval Center
            </button>
          </div>
        </div>

        {/* Submission Tab */}
        {activeTab === 'submission' && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <StatCard value={stats.pending} label="Pending Approval" variant="warning" />
              <StatCard value={stats.active} label="Active Handovers" variant="info" />
              <StatCard value={stats.completed} label="Completed" variant="success" />
            </div>

            {/* Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <svg className="w-5 h-5 text-almet-sapphire" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Create New Handover
              </h3>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Handing Over Employee
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-almet-sapphire dark:focus:ring-almet-astral focus:border-transparent"
                      value={formData.handingOver}
                      onChange={(e) => {
                        const value = e.target.value;
                        const empName = value === 'me' ? currentUser : value;
                        const emp = employees.find(e => e.name === empName);
                        setFormData({
                          ...formData,
                          handingOver: value,
                          position: emp?.position || '',
                          department: emp?.department || ''
                        });
                      }}
                    >
                      <option value="me">Me </option>
                      {employees.filter(e => e.manager === currentUser && e.name !== currentUser).map(emp => (
                        <option key={emp.name} value={emp.name}>{emp.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Position
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      value={formData.position}
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      value={formData.department}
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Handover Type
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-almet-sapphire dark:focus:ring-almet-astral focus:border-transparent"
                      value={formData.handoverType}
                      onChange={(e) => setFormData({ ...formData, handoverType: e.target.value })}
                      required
                    >
                      <option value="">Select...</option>
                      <option value="Vacation">Vacation</option>
                      <option value="Business Trip">Business Trip</option>
                      <option value="Resignation">Resignation</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-almet-sapphire dark:focus:ring-almet-astral focus:border-transparent"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      End Date
                    </label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-almet-sapphire dark:focus:ring-almet-astral focus:border-transparent"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Taking Over Employee
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-almet-sapphire dark:focus:ring-almet-astral focus:border-transparent"
                      value={formData.handoverTo}
                      onChange={(e) => setFormData({ ...formData, handoverTo: e.target.value })}
                      required
                    >
                      <option value="">Select...</option>
                      {employees.filter(e => e.name !== currentUser).map(emp => (
                        <option key={emp.name} value={emp.name}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tasks Section */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-almet-sapphire" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    Tasks & Responsibilities
                  </h4>
                  {formData.tasks.map((task, index) => (
                    <TaskItem
                      key={task.id}
                      task={{
                        ...task,
                        onChange: (field, value) => {
                          const newTasks = [...formData.tasks];
                          newTasks[index][field] = value;
                          setFormData({ ...formData, tasks: newTasks });
                        }
                      }}
                      onRemove={() => {
                        if (formData.tasks.length > 1) {
                          setFormData({
                            ...formData,
                            tasks: formData.tasks.filter((_, i) => i !== index)
                          });
                        } else {
                          alert('At least one task is required.');
                        }
                      }}
                      showRemove={formData.tasks.length > 1}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      tasks: [...formData.tasks, { id: generateId(), description: '', currentStatus: 'Not started', initialComment: '' }]
                    })}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors inline-flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Task
                  </button>
                </div>

                {/* Contacts Section */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-almet-sapphire" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Related Contacts
                  </h4>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-almet-sapphire dark:focus:ring-almet-astral focus:border-transparent"
                    rows="4"
                    placeholder="Name, position, contact information..."
                    value={formData.contacts}
                    onChange={(e) => setFormData({ ...formData, contacts: e.target.value })}
                  />
                </div>

                {/* Important Dates Section */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-almet-sapphire" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Important Dates
                  </h4>
                  {formData.dates.map((date, index) => (
                    <DateItem
                      key={date.id}
                      date={{
                        ...date,
                        onChange: (field, value) => {
                          const newDates = [...formData.dates];
                          newDates[index][field] = value;
                          setFormData({ ...formData, dates: newDates });
                        }
                      }}
                      onRemove={() => {
                        if (formData.dates.length > 1) {
                          setFormData({
                            ...formData,
                            dates: formData.dates.filter((_, i) => i !== index)
                          });
                        } else {
                          alert('At least one important date is required.');
                        }
                      }}
                      showRemove={formData.dates.length > 1}
                    />
                  ))}
                  <button
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      dates: [...formData.dates, { id: generateId(), date: '', description: '' }]
                    })}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors inline-flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Date
                  </button>
                </div>

                {/* Access / Accounts Section */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-almet-sapphire" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    Access / Accounts
                  </h4>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-almet-sapphire dark:focus:ring-almet-astral focus:border-transparent"
                    rows="4"
                    placeholder="System name, username, password location..."
                    value={formData.access}
                    onChange={(e) => setFormData({ ...formData, access: e.target.value })}
                  />
                </div>

                {/* Documents & Files Section */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-almet-sapphire" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    Documents & Files
                  </h4>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-almet-sapphire dark:focus:ring-almet-astral focus:border-transparent"
                    rows="4"
                    placeholder="File and folder locations..."
                    value={formData.documents}
                    onChange={(e) => setFormData({ ...formData, documents: e.target.value })}
                  />
                </div>

                {/* Open Issues Section */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-almet-sapphire" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Open Issues
                  </h4>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-almet-sapphire dark:focus:ring-almet-astral focus:border-transparent"
                    rows="4"
                    placeholder="Unresolved problems..."
                    value={formData.issues}
                    onChange={(e) => setFormData({ ...formData, issues: e.target.value })}
                  />
                </div>

                {/* Notes Section */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-almet-sapphire" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    Notes
                  </h4>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-almet-sapphire dark:focus:ring-almet-astral focus:border-transparent"
                    rows="4"
                    placeholder="Additional notes and explanations..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>

                {/* Form Actions */}
                <div className="flex gap-3 flex-wrap">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-almet-sapphire hover:bg-almet-astral text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                    Save
                  </button>
                  <button
                    type="reset"
                    onClick={() => setFormData({
                      handingOver: 'me',
                      position: 'Super Admin',
                      department: 'IT',
                      handoverType: '',
                      startDate: '',
                      endDate: '',
                      handoverTo: '',
                      tasks: [{ id: generateId(), description: '', currentStatus: 'Not started', initialComment: '' }],
                      contacts: '',
                      dates: [{ id: generateId(), date: '', description: '' }],
                      access: '',
                      documents: '',
                      issues: '',
                      notes: ''
                    })}
                    className="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors inline-flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Reset
                  </button>
                </div>
              </form>
            </div>
          </>
        )}

        {/* My Requests Tab */}
        {activeTab === 'my-requests' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-almet-sapphire" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                My Handovers
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Handing Over</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Taking Over</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Period</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {renderHandoverTable(h => h.handingOver === currentUser || h.handoverTo === currentUser)}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Approval Tab */}
        {activeTab === 'approval' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-almet-sapphire" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pending Approvals
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">ID</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Handing Over</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Taking Over</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Period</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {renderHandoverTable(h => {
                    const isHandingOver = h.handingOver === currentUser;
                    const isTakingOver = h.handoverTo === currentUser;
                    const isLM = (h.handingOverInfo && h.handingOverInfo.manager === currentUser);

                    return (
                      (isHandingOver && h.status === 'Created' && !h.hoSigned) ||
                      (isTakingOver && h.status === 'Signed by Handing Over' && !h.toSigned) ||
                      (isLM && h.status === 'Signed by Taking Over' && !h.lmApproved) ||
                      (isHandingOver && h.status === 'Need Clarification') ||
                      (isTakingOver && h.status === 'Approved by Line Manager' && !h.takenOver) ||
                      (isHandingOver && h.status === 'Taken Over' && !h.takenBack)
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {currentHandover && (
          <Modal
            isOpen={modalOpen}
            onClose={() => setModalOpen(false)}
            title={`Handover Details #${currentHandover.id.substring(0, 6)}`}
            footer={
              <>
                <button
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={showFullHistory}
                  className="px-4 py-2 bg-almet-sapphire hover:bg-almet-astral text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  View Full History
                </button>
              </>
            }
          >
            {/* General Information */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-almet-sapphire mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                General Information
              </h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Type:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100 font-medium">{currentHandover.type}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Status:</span>
                  <span className="ml-2"><StatusBadge status={currentHandover.status} /></span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Handing Over:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100 font-medium">{currentHandover.handingOver}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Position:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100">{currentHandover.handingOverInfo.position}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Department:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100">{currentHandover.handingOverInfo.department}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Taking Over:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100 font-medium">{currentHandover.handoverTo}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Period:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100">{currentHandover.startDate} / {currentHandover.endDate}</span>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Line Manager:</span>
                  <span className="ml-2 text-gray-900 dark:text-gray-100">{currentHandover.approvers.lineManager}</span>
                </div>
              </div>
            </div>

            {/* Tasks */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-almet-sapphire mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Tasks & Responsibilities
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 dark:border-gray-700 rounded-lg">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Description</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Status</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Comment</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Log</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {currentHandover.tasks.map(task => (
                      <tr key={task.id}>
                        <td className="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">{task.description}</td>
                        <td className="px-3 py-2 text-sm"><StatusBadge status={task.currentStatus} /></td>
                        <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{task.initialComment || '-'}</td>
                        <td className="px-3 py-2 text-sm">
                          <button
                            onClick={() => showTaskLog(task.id)}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors inline-flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Log
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Contacts */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-almet-sapphire mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Related Contacts
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap min-h-[60px]">
                {currentHandover.contacts || 'No information.'}
              </div>
            </div>

            {/* Important Dates */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-almet-sapphire mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Important Dates
              </h4>
              {currentHandover.dates.length > 0 ? (
                <ul className="space-y-2">
                  {currentHandover.dates.map((d, idx) => (
                    <li key={idx} className="text-sm text-gray-700 dark:text-gray-300">
                      <strong className="text-gray-900 dark:text-gray-100">{d.date}:</strong> {d.description}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">No information.</p>
              )}
            </div>

            {/* Access / Accounts */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-almet-sapphire mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                Access / Accounts
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap min-h-[60px]">
                {currentHandover.access || 'No information.'}
              </div>
            </div>

            {/* Documents & Files */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-almet-sapphire mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                </svg>
                Documents & Files
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap min-h-[60px]">
                {currentHandover.documents || 'No information.'}
              </div>
            </div>

            {/* Open Issues */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-almet-sapphire mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Open Issues
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap min-h-[60px]">
                {currentHandover.issues || 'No information.'}
              </div>
            </div>

            {/* Notes */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-almet-sapphire mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                Notes
              </h4>
              <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg p-3 text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap min-h-[60px]">
                {currentHandover.notes || 'No information.'}
              </div>
            </div>

            {/* Signatures */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-almet-sapphire mb-3 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Signatures
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`border-2 rounded-lg p-4 text-center ${currentHandover.hoSigned ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-dashed border-gray-300 dark:border-gray-600'}`}>
                  <div className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{currentHandover.handingOver}</div>
                  <div className={`text-sm ${currentHandover.hoSigned ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {currentHandover.hoSigned ? `Signed: ${currentHandover.hoSignedDate}` : 'Awaiting signature'}
                  </div>
                </div>
                <div className={`border-2 rounded-lg p-4 text-center ${currentHandover.toSigned ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-dashed border-gray-300 dark:border-gray-600'}`}>
                  <div className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{currentHandover.handoverTo}</div>
                  <div className={`text-sm ${currentHandover.toSigned ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                    {currentHandover.toSigned ? `Signed: ${currentHandover.toSignedDate}` : 'Awaiting signature'}
                  </div>
                </div>
              </div>
            </div>
          </Modal>
        )}

        {/* Log Modal */}
        <Modal
          isOpen={logModalOpen}
          onClose={() => setLogModalOpen(false)}
          title={logData.title}
          footer={
            <button
              onClick={() => setLogModalOpen(false)}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          }
        >
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg max-h-96">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Date & Time</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Actor</th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Action</th>
                  {logData.isTaskLog && (
                    <>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Old Status</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">New Status</th>
                    </>
                  )}
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 dark:text-gray-400">Comment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {logData.logs && logData.logs.length > 0 ? (
                  logData.logs.map((log, idx) => (
                    <tr key={idx} className="text-sm">
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{log.timestamp}</td>
                      <td className="px-3 py-2 text-gray-900 dark:text-gray-100">{log.actor}</td>
                      <td className="px-3 py-2">
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded text-xs">
                          {log.action}
                        </span>
                      </td>
                      {logData.isTaskLog && (
                        <>
                          <td className="px-3 py-2">{log.oldStatus ? <StatusBadge status={log.oldStatus} /> : '-'}</td>
                          <td className="px-3 py-2">{log.newStatus ? <StatusBadge status={log.newStatus} /> : '-'}</td>
                        </>
                      )}
                      <td className="px-3 py-2 text-gray-700 dark:text-gray-300">{log.comment || '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={logData.isTaskLog ? 6 : 4} className="px-3 py-8 text-center text-gray-500 dark:text-gray-400">
                      No log entries found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default HandoverSystem;