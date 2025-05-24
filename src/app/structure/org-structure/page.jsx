"use client";
import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Users, Building2, Award, User, Search, Phone, Mail, MapPin, Star } from 'lucide-react';

const OrgChart = () => {
  const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'grid'
  const [expandedNodes, setExpandedNodes] = useState(new Set(['HLD22']));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Complete employee data from Excel
  const employeeData = [
    { id: 'HLD22', name: 'Şirin Camalli Rəşad Oğlu', title: 'BUSINESS DEVELOPMENT DIRECTOR', grade: 7, lineManagerId: null, department: 'Executive', unit: 'BUSINESS DEVELOPMENT', avatar: 'ŞC', phone: '+994 50 xxx xxxx', email: 'sirin.camalli@almet.az', location: 'Baku HQ' },
    { id: 'HLD1', name: 'Əli Orucov Məzahir Oğlu', title: 'DEPUTY CHAIRMAN ON FINANCE & BUSINESS DEVELOPMENT', grade: 8, lineManagerId: 'HLD22', department: 'Finance', unit: 'BUSINESS DEVELOPMENT', avatar: 'ƏO', phone: '+994 50 xxx xxxx', email: 'ali.orucov@almet.az', location: 'Baku HQ' },
    { id: 'HLD2', name: 'Şəfa Nəcəfova Məmməd Qizi', title: 'DEPUTY CHAIRMAN ON BUSINESS TRANSFORMATION & CULTURE', grade: 8, lineManagerId: 'HLD22', department: 'HR', unit: 'BUSINESS TRANSFORMATION', avatar: 'ŞN', phone: '+994 50 xxx xxxx', email: 'sefa.necefova@almet.az', location: 'Baku HQ' },
    { id: 'HLD3', name: 'Elvin Camalli Rəşad Oğlu', title: 'DEPUTY CHAIRMAN ON COMMERCIAL ACTIVITIES EUROPE REGION', grade: 8, lineManagerId: 'HLD22', department: 'Commercial', unit: 'EUROPE REGION', avatar: 'EC', phone: '+994 50 xxx xxxx', email: 'elvin.camalli@almet.az', location: 'Europe' },
    { id: 'HLD23', name: 'Əli Haciyev Kamal Oğlu', title: 'DIRECTOR', grade: 7, lineManagerId: 'HLD22', department: 'Operations', unit: 'BUSINESS DEVELOPMENT', avatar: 'ƏH', phone: '+994 50 xxx xxxx', email: 'ali.haciyev@almet.az', location: 'Baku HQ' },
    { id: 'HLD4', name: 'Ümid Mustafayev Azər Oğlu', title: 'DIRECTOR', grade: 7, lineManagerId: 'HLD1', department: 'Finance', unit: 'ACCOUNTING', avatar: 'ÜM', phone: '+994 50 xxx xxxx', email: 'umid.mustafayev@almet.az', location: 'Baku HQ' },
    { id: 'HLD16', name: 'Azad Nəzərov Zirəddin Oğlu', title: 'CHIEF ACCOUNTANT', grade: 5, lineManagerId: 'HLD4', department: 'Finance', unit: 'ACCOUNTING', avatar: 'AN', phone: '+994 50 xxx xxxx', email: 'azad.nezerov@almet.az', location: 'Baku HQ' },
    { id: 'HLD5', name: 'Müşfiq Quliyev Mehdi Oğlu', title: 'HEAD OF BUDGETING & CONTROLLING', grade: 7, lineManagerId: 'HLD4', department: 'Finance', unit: 'BUDGETING', avatar: 'MQ', phone: '+994 50 xxx xxxx', email: 'musfiq.quliyev@almet.az', location: 'Baku HQ' },
    { id: 'HLD17', name: 'Pənah Əliyev Əzizulla Oğlu', title: 'CHIEF ACCOUNTANT', grade: 5, lineManagerId: 'HLD4', department: 'Finance', unit: 'ACCOUNTING', avatar: 'PƏ', phone: '+994 50 xxx xxxx', email: 'penah.aliyev@almet.az', location: 'Baku HQ' },
    { id: 'HLD9', name: 'Səbuhi Isayev Samir Oğlu', title: 'HEAD OF LEGAL DEPARTMENT', grade: 6, lineManagerId: 'HLD2', department: 'Legal', unit: 'LEGAL', avatar: 'SI', phone: '+994 50 xxx xxxx', email: 'sebuhi.isayev@almet.az', location: 'Baku HQ' },
    { id: 'HLD10', name: 'Sevinj Asgarova', title: 'HR BUSINESS PARTNER', grade: 3, lineManagerId: 'HLD2', department: 'HR', unit: 'HUMAN RESOURCES', avatar: 'SA', phone: '+994 50 xxx xxxx', email: 'sevinj.asgarova@almet.az', location: 'Baku HQ' },
    { id: 'HLD11', name: 'Nigar Qəribova Habil Qizi', title: 'HR BUSINESS PARTNER', grade: 4, lineManagerId: 'HLD2', department: 'HR', unit: 'HUMAN RESOURCES', avatar: 'NQ', phone: '+994 50 xxx xxxx', email: 'nigar.qeribova@almet.az', location: 'Baku HQ' },
    { id: 'EUR1', name: 'Joseph Jesudas Babuji', title: 'CHIEF ACCOUNTANT', grade: 5, lineManagerId: 'HLD3', department: 'Finance', unit: 'EUROPE OPERATIONS', avatar: 'JJ', phone: '+44 xxx xxx xxxx', email: 'joseph.jesudas@almet.eu', location: 'London' },
    { id: 'EUR2', name: 'Nitika Nanda', title: 'OPERATIONS SPECIALIST', grade: 3, lineManagerId: 'HLD3', department: 'Operations', unit: 'EUROPE OPERATIONS', avatar: 'NN', phone: '+44 xxx xxx xxxx', email: 'nitika.nanda@almet.eu', location: 'London' },
    { id: 'EUR3', name: 'Richard Millard', title: 'OPERATIONS MANAGER', grade: 5, lineManagerId: 'HLD3', department: 'Operations', unit: 'EUROPE OPERATIONS', avatar: 'RM', phone: '+44 xxx xxx xxxx', email: 'richard.millard@almet.eu', location: 'London' },
    { id: 'EUR5', name: 'Michael Gilhooley', title: 'COMMERCIAL MANAGER', grade: 5, lineManagerId: 'HLD3', department: 'Commercial', unit: 'EUROPE REGION', avatar: 'MG', phone: '+44 xxx xxx xxxx', email: 'michael.gilhooley@almet.eu', location: 'London' },
    { id: 'COM1', name: 'Cavid Əliyev Cavanşir Oğlu', title: 'DIRECTOR OF COMMERCIAL', grade: 6, lineManagerId: 'HLD23', department: 'Commercial', unit: 'COMMERCIAL', avatar: 'CƏ', phone: '+994 50 xxx xxxx', email: 'cavid.aliyev@almet.az', location: 'Baku HQ' },
    { id: 'COM2', name: 'Seymur Jalalov', title: 'DIRECTOR OF COMMERCIAL', grade: 6, lineManagerId: 'HLD23', department: 'Commercial', unit: 'COMMERCIAL', avatar: 'SJ', phone: '+995 xxx xxx xxx', email: 'seymur.jalalov@almet.ge', location: 'Tbilisi' },
    { id: 'ACC1', name: 'Vacant', title: 'ACCOUNTANT', grade: 3, lineManagerId: 'HLD16', department: 'Finance', unit: 'ACCOUNTING', avatar: 'V', phone: '', email: '', location: 'Baku HQ' },
    { id: 'ACC2', name: 'Narin Piriyeva Tofiq Qizi', title: 'SENIOR ACCOUNTANT', grade: 4, lineManagerId: 'HLD16', department: 'Finance', unit: 'ACCOUNTING', avatar: 'NP', phone: '+994 50 xxx xxxx', email: 'narin.piriyeva@almet.az', location: 'Baku HQ' }
  ];

  // Build hierarchy from flat data
  const buildHierarchy = (data) => {
    const employeeMap = {};
    data.forEach(emp => {
      employeeMap[emp.id] = { ...emp, children: [] };
    });

    const roots = [];
    data.forEach(emp => {
      if (emp.lineManagerId && employeeMap[emp.lineManagerId]) {
        employeeMap[emp.lineManagerId].children.push(employeeMap[emp.id]);
      } else {
        roots.push(employeeMap[emp.id]);
      }
    });

    return roots;
  };

  const organizationTree = useMemo(() => buildHierarchy(employeeData), []);

  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getGradeColor = (grade) => {
    const colors = {
      8: { bg: 'bg-gradient-to-br from-purple-500 to-purple-600', border: 'border-purple-200', text: 'text-white' },
      7: { bg: 'bg-gradient-to-br from-blue-500 to-blue-600', border: 'border-blue-200', text: 'text-white' },
      6: { bg: 'bg-gradient-to-br from-green-500 to-green-600', border: 'border-green-200', text: 'text-white' },
      5: { bg: 'bg-gradient-to-br from-orange-400 to-orange-500', border: 'border-orange-200', text: 'text-white' },
      4: { bg: 'bg-gradient-to-br from-yellow-400 to-yellow-500', border: 'border-yellow-200', text: 'text-gray-900' },
      3: { bg: 'bg-gradient-to-br from-gray-400 to-gray-500', border: 'border-gray-200', text: 'text-white' },
      2: { bg: 'bg-gradient-to-br from-gray-300 to-gray-400', border: 'border-gray-100', text: 'text-gray-900' },
      1: { bg: 'bg-gradient-to-br from-gray-200 to-gray-300', border: 'border-gray-100', text: 'text-gray-900' }
    };
    return colors[grade] || colors[1];
  };

  const getDepartmentColor = (department) => {
    const colors = {
      'Executive': 'from-indigo-400 to-purple-500',
      'Finance': 'from-green-400 to-emerald-500',
      'HR': 'from-pink-400 to-rose-500',
      'Commercial': 'from-blue-400 to-cyan-500',
      'Operations': 'from-orange-400 to-amber-500',
      'Legal': 'from-gray-400 to-gray-600'
    };
    return colors[department] || 'from-gray-300 to-gray-400';
  };

  const searchInTree = (node, term) => {
    if (!term) return true;
    const searchLower = term.toLowerCase();
    return (
      node.name.toLowerCase().includes(searchLower) ||
      node.title.toLowerCase().includes(searchLower) ||
      (node.department && node.department.toLowerCase().includes(searchLower))
    );
  };

  const getDirectReports = (nodeId) => {
    return employeeData.filter(emp => emp.lineManagerId === nodeId).length;
  };

  const getTotalTeamSize = (node) => {
    return 1 + node.children.reduce((sum, child) => sum + getTotalTeamSize(child) - 1, 0);
  };

  // Avatar component
  const Avatar = ({ employee, size = 'md' }) => {
    const sizes = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-12 h-12 text-sm',
      lg: 'w-16 h-16 text-lg',
      xl: 'w-20 h-20 text-xl'
    };
    
    const gradeColor = getGradeColor(employee.grade);
    
    return (
      <div className={`${sizes[size]} ${gradeColor.bg} ${gradeColor.text} rounded-full flex items-center justify-center font-bold shadow-lg ring-4 ring-white`}>
        {employee.avatar}
      </div>
    );
  };

  // Employee Card Component
  const EmployeeCard = ({ employee, isCompact = false, onClick }) => {
    const directReports = getDirectReports(employee.id);
    const gradeColor = getGradeColor(employee.grade);
    
    return (
      <div 
        className={`bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105 border-2 ${gradeColor.border} ${isCompact ? 'p-4' : 'p-6'}`}
        onClick={onClick}
      >
        <div className="flex items-center gap-4 mb-4">
          <Avatar employee={employee} size={isCompact ? 'md' : 'lg'} />
          <div className="flex-1 min-w-0">
            <h3 className={`font-bold ${isCompact ? 'text-sm' : 'text-lg'} text-gray-900 truncate`}>
              {employee.name}
            </h3>
            <p className={`text-gray-600 ${isCompact ? 'text-xs' : 'text-sm'} font-medium mb-1 truncate`}>
              {employee.title}
            </p>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${gradeColor.bg} ${gradeColor.text}`}>
                Grade {employee.grade}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getDepartmentColor(employee.department)} text-white`}>
                {employee.department}
              </span>
            </div>
          </div>
        </div>
        
        {!isCompact && (
          <div className="space-y-2">
            <div className="flex items-center text-sm text-gray-600">
              <Building2 className="w-4 h-4 mr-2 text-gray-400" />
              {employee.unit}
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-gray-400" />
              {employee.location}
            </div>
            {directReports > 0 && (
              <div className="flex items-center text-sm text-blue-600">
                <Users className="w-4 h-4 mr-2" />
                {directReports} Direct Reports
              </div>
            )}
          </div>
        )}
        
        {isCompact && directReports > 0 && (
          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center">
              <Users className="w-3 h-3 mr-1" />
              {directReports}
            </span>
            <Star className="w-3 h-3 text-yellow-400" />
          </div>
        )}
      </div>
    );
  };

  // Tree View Component
  const TreeNode = ({ node, level = 0 }) => {
    if (!searchInTree(node, searchTerm)) return null;

    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);

    return (
      <div className="relative">
        {/* Connection Lines */}
        {level > 0 && (
          <>
            <div className="absolute left-[-32px] top-20 w-8 h-px bg-gray-300"></div>
            <div className="absolute left-[-32px] top-0 w-px h-20 bg-gray-300"></div>
          </>
        )}
        
        <div className={`${level > 0 ? 'ml-16' : ''} mb-8`}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-80">
              <EmployeeCard 
                employee={node} 
                onClick={() => setSelectedEmployee(node)}
              />
            </div>
            
            {hasChildren && (
              <button
                onClick={() => toggleNode(node.id)}
                className="mt-8 p-2 bg-white border-2 border-gray-200 rounded-full hover:bg-gray-50 transition-colors"
              >
                {isExpanded ? 
                  <ChevronDown className="w-5 h-5 text-gray-600" /> : 
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                }
              </button>
            )}
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="ml-8 space-y-4">
            {node.children.map(child => (
              <TreeNode key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Grid View Component
  const GridView = () => {
    const filteredEmployees = employeeData.filter(emp => searchInTree(emp, searchTerm));
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredEmployees.map(employee => (
          <EmployeeCard 
            key={employee.id}
            employee={employee}
            isCompact={true}
            onClick={() => setSelectedEmployee(employee)}
          />
        ))}
      </div>
    );
  };

  // Employee Detail Modal
  const EmployeeDetailModal = ({ employee, onClose }) => {
    if (!employee) return null;
    
    const directReports = employeeData.filter(emp => emp.lineManagerId === employee.id);
    const manager = employeeData.find(emp => emp.id === employee.lineManagerId);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Avatar employee={employee} size="xl" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{employee.name}</h2>
                  <p className="text-gray-600 font-medium">{employee.title}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <p className="text-gray-900">{employee.department}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Unit</label>
                  <p className="text-gray-900">{employee.unit}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Grade</label>
                  <p className="text-gray-900">Grade {employee.grade}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Location</label>
                  <p className="text-gray-900 flex items-center">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                    {employee.location}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-gray-900 flex items-center">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    {employee.phone || 'Not provided'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-gray-900 flex items-center">
                    <Mail className="w-4 h-4 mr-2 text-gray-400" />
                    {employee.email || 'Not provided'}
                  </p>
                </div>
              </div>
            </div>
            
            {manager && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Reports To</h3>
                <EmployeeCard employee={manager} isCompact={true} onClick={() => setSelectedEmployee(manager)} />
              </div>
            )}
            
            {directReports.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Direct Reports ({directReports.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {directReports.map(report => (
                    <EmployeeCard 
                      key={report.id}
                      employee={report} 
                      isCompact={true} 
                      onClick={() => setSelectedEmployee(report)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Almet HC</h1>
              <p className="text-gray-600">Təşkilati Struktur</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Axtarış..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                />
              </div>
              
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('tree')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'tree' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Tree View
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'grid' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Grid View
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {viewMode === 'tree' ? (
          <div className="space-y-8">
            {organizationTree.map(rootNode => (
              <TreeNode key={rootNode.id} node={rootNode} />
            ))}
          </div>
        ) : (
          <GridView />
        )}
      </div>

      {/* Employee Detail Modal */}
      <EmployeeDetailModal 
        employee={selectedEmployee} 
        onClose={() => setSelectedEmployee(null)} 
      />
    </div>
  );
};

export default OrgChart;