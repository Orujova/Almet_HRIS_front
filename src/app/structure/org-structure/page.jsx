'use client'
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Users, 
  Building2, 
  Award, 
  User, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Star,
  Briefcase,
  Crown,
  Shield,
  Target,
  Layers,
  Filter,
  Grid3X3,
  TreePine,
  Maximize2,
  Minimize2,
  Settings,
  UserPlus,
  Download,
  Eye,
  EyeOff,
  Plus,
  Minus,
  Clock,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  X,
  ChevronLeft,
  Maximize,
  Grid,
  List
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTheme } from '@/components/common/ThemeProvider';

const OrgChart = () => {
  const { darkMode } = useTheme();
  const [expandedNodes, setExpandedNodes] = useState(new Set(['HLD22']));
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [filters, setFilters] = useState({
    department: 'all',
    grade: 'all',
    status: 'all',
    location: 'all'
  });
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('tree'); // 'tree' or 'grid'
  const [isFullscreen, setIsFullscreen] = useState(false);
  const chartRef = useRef(null);
  const containerRef = useRef(null);

  // Simplified theme classes with project colors
  const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
  const textPrimary = darkMode ? "text-white" : "text-gray-900";
  const textSecondary = darkMode ? "text-gray-300" : "text-gray-600";
  const textMuted = darkMode ? "text-almet-bali-hai" : "text-gray-500";
  const borderColor = darkMode ? "border-almet-comet" : "border-gray-200";
  const bgAccent = darkMode ? "bg-almet-comet/30" : "bg-almet-mystic/50";

  // Simplified soft project colors for hierarchy
  const hierarchyColors = {
    'VC': {
      primary: '#30539b', // almet-sapphire
      light: '#4e7db5',   // almet-steel-blue
      bg: 'rgba(48, 83, 155, 0.08)'
    },
    'DIRECTOR': {
      primary: '#336fa5', // almet-astral
      light: '#4e7db5',   // almet-steel-blue
      bg: 'rgba(51, 111, 165, 0.08)'
    },
    'HEAD OF DEPARTMENT': {
      primary: '#38587d', // almet-san-juan
      light: '#4f5772',   // almet-comet
      bg: 'rgba(56, 88, 125, 0.08)'
    },
    'SENIOR SPECIALIST': {
      primary: '#7a829a', // almet-waterloo
      light: '#90a0b9',   // almet-bali-hai
      bg: 'rgba(122, 130, 154, 0.08)'
    },
    'SPECIALIST': {
      primary: '#4f5772', // almet-comet
      light: '#7a829a',   // almet-waterloo
      bg: 'rgba(79, 87, 114, 0.08)'
    },
    'JUNIOR SPECIALIST': {
      primary: '#9c9cb5', // almet-santas-gray
      light: '#90a0b9',   // almet-bali-hai
      bg: 'rgba(156, 156, 181, 0.08)'
    }
  };

  // Get color for employee
  const getEmployeeColor = (employee) => {
    return hierarchyColors[employee.positionGroup] || hierarchyColors['SPECIALIST'];
  };

  // Employee data with proper position groups
  const employeeData = [
    { 
      id: 'HLD22', 
      name: 'Şirin Camalli Rəşad Oğlu', 
      title: 'BUSINESS DEVELOPMENT DIRECTOR', 
      grade: '7', 
      lineManagerId: null, 
      department: 'Executive', 
      unit: 'BUSINESS DEVELOPMENT', 
      avatar: 'ŞC', 
      phone: '+994 50 xxx xxxx', 
      email: 'sirin.camalli@almet.az', 
      location: 'Baku HQ',
      businessFunction: 'Holding',
      positionGroup: 'DIRECTOR',
  
    },
    { 
      id: 'HLD1', 
      name: 'Əli Orucov Məzahir Oğlu', 
      title: 'DEPUTY CHAIRMAN ON FINANCE & BUSINESS DEVELOPMENT', 
      grade: '8', 
      lineManagerId: 'HLD22', 
      department: 'Finance', 
      unit: 'BUSINESS DEVELOPMENT', 
      avatar: 'ƏO', 
      phone: '+994 50 xxx xxxx', 
      email: 'ali.orucov@almet.az', 
      location: 'Baku HQ',
      businessFunction: 'Holding',
      positionGroup: 'VC',
 
    },
    { 
      id: 'HLD2', 
      name: 'Şəfa Nəcəfova Məmməd Qizi', 
      title: 'DEPUTY CHAIRMAN ON BUSINESS TRANSFORMATION & CULTURE', 
      grade: '8', 
      lineManagerId: 'HLD22', 
      department: 'HR', 
      unit: 'BUSINESS TRANSFORMATION', 
      avatar: 'ŞN', 
      phone: '+994 50 xxx xxxx', 
      email: 'sefa.necefova@almet.az', 
      location: 'Baku HQ',
      businessFunction: 'Holding',
      positionGroup: 'VC',
    
    },
    { 
      id: 'HLD3', 
      name: 'Elvin Camalli Rəşad Oğlu', 
      title: 'DEPUTY CHAIRMAN ON COMMERCIAL ACTIVITIES EUROPE REGION', 
      grade: '8', 
      lineManagerId: 'HLD22', 
      department: 'Commercial', 
      unit: 'EUROPE REGION', 
      avatar: 'EC', 
      phone: '+994 50 xxx xxxx', 
      email: 'elvin.camalli@almet.az', 
      location: 'Europe',
      businessFunction: 'UK',
      positionGroup: 'VC',
      
    },
    { 
      id: 'HLD23', 
      name: 'Əli Haciyev Kamal Oğlu', 
      title: 'DIRECTOR', 
      grade: '7', 
      lineManagerId: 'HLD22', 
      department: 'Operations', 
      unit: 'BUSINESS DEVELOPMENT', 
      avatar: 'ƏH', 
      phone: '+994 50 xxx xxxx', 
      email: 'ali.haciyev@almet.az', 
      location: 'Baku HQ',
      businessFunction: 'Holding',
      positionGroup: 'DIRECTOR',
      
    },
    { 
      id: 'HLD4', 
      name: 'Ümid Mustafayev Azər Oğlu', 
      title: 'DIRECTOR', 
      grade: '7', 
      lineManagerId: 'HLD1', 
      department: 'Finance', 
      unit: 'ACCOUNTING', 
      avatar: 'ÜM', 
      phone: '+994 50 xxx xxxx', 
      email: 'umid.mustafayev@almet.az', 
      location: 'Baku HQ',
      businessFunction: 'Holding',
      positionGroup: 'DIRECTOR',
      
    },
    { 
      id: 'HLD16', 
      name: 'Azad Nəzərov Zirəddin Oğlu', 
      title: 'CHIEF ACCOUNTANT', 
      grade: '5', 
      lineManagerId: 'HLD4', 
      department: 'Finance', 
      unit: 'ACCOUNTING', 
      avatar: 'AN', 
      phone: '+994 50 xxx xxxx', 
      email: 'azad.nezerov@almet.az', 
      location: 'Baku HQ',
      businessFunction: 'Holding',
      positionGroup: 'SENIOR SPECIALIST',
      
    },
    { 
      id: 'HLD5', 
      name: 'Müşfiq Quliyev Mehdi Oğlu', 
      title: 'HEAD OF BUDGETING & CONTROLLING', 
      grade: '7', 
      lineManagerId: 'HLD4', 
      department: 'Finance', 
      unit: 'BUDGETING', 
      avatar: 'MQ', 
      phone: '+994 50 xxx xxxx', 
      email: 'musfiq.quliyev@almet.az', 
      location: 'Baku HQ',
      businessFunction: 'Holding',
      positionGroup: 'HEAD OF DEPARTMENT',
      
    },
    { 
      id: 'HLD17', 
      name: 'Pənah Əliyev Əzizulla Oğlu', 
      title: 'CHIEF ACCOUNTANT',
      grade: '5', 
      lineManagerId: 'HLD4', 
      department: 'Finance', 
      unit: 'ACCOUNTING', 
      avatar: 'PƏ', 
      phone: '+994 50 xxx xxxx', 
      email: 'penah.aliyev@almet.az', 
      location: 'Baku HQ',
      businessFunction: 'Holding',
      positionGroup: 'SENIOR SPECIALIST',
      
    },
    { 
      id: 'HLD9', 
      name: 'Səbuhi Isayev Samir Oğlu', 
      title: 'HEAD OF LEGAL DEPARTMENT', 
      grade: '6', 
      lineManagerId: 'HLD2', 
      department: 'Legal', 
      unit: 'LEGAL', 
      avatar: 'SI', 
      phone: '+994 50 xxx xxxx', 
      email: 'sebuhi.isayev@almet.az', 
      location: 'Baku HQ',
      businessFunction: 'Holding',
      positionGroup: 'HEAD OF DEPARTMENT',
      
    },
    { 
      id: 'EUR1', 
      name: 'Joseph Jesudas Babuji', 
      title: 'CHIEF ACCOUNTANT', 
      grade: '5', 
      lineManagerId: 'HLD3', 
      department: 'Finance', 
      unit: 'EUROPE OPERATIONS', 
      avatar: 'JJ', 
      phone: '+44 xxx xxx xxxx', 
      email: 'joseph.jesudas@almet.eu', 
      location: 'London',
      businessFunction: 'UK',
      positionGroup: 'SENIOR SPECIALIST',
      
    },
    { 
      id: 'EUR2', 
      name: 'Nitika Nanda', 
      title: 'OPERATIONS SPECIALIST', 
      grade: '3', 
      lineManagerId: 'HLD3', 
      department: 'Operations', 
      unit: 'EUROPE OPERATIONS', 
      avatar: 'NN', 
      phone: '+44 xxx xxx xxxx', 
      email: 'nitika.nanda@almet.eu', 
      location: 'London',
      businessFunction: 'UK',
      positionGroup: 'SPECIALIST',
      
    }
  ];

  // Build hierarchical structure
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

  // Filter employees
  const filteredEmployees = useMemo(() => {
    return employeeData.filter(emp => {
      const matchesSearch = !searchTerm || 
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = filters.department === 'all' || emp.department === filters.department;
      const matchesGrade = filters.grade === 'all' || emp.grade === filters.grade;
      const matchesStatus = filters.status === 'all' || emp.status === filters.status;
      const matchesLocation = filters.location === 'all' || emp.location === filters.location;

      return matchesSearch && matchesDepartment && matchesGrade && matchesStatus && matchesLocation;
    });
  }, [employeeData, searchTerm, filters]);

  // Toggle node expansion
  const toggleNode = (nodeId) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  // Zoom controls
  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoomLevel(100);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      department: 'all',
      grade: 'all',
      status: 'all',
      location: 'all'
    });
    setSearchTerm('');
  };

  // Simplified Avatar component
  const Avatar = ({ employee, size = 'md' }) => {
    const sizes = {
      sm: 'w-5 h-5 text-xs',
      md: 'w-7 h-7 text-xs',
      lg: 'w-8 h-8 text-sm',
      xl: 'w-10 h-10 text-sm'
    };
    
    const colors = getEmployeeColor(employee);
    
    return (
      <div 
        className={`${sizes[size]} rounded-md flex items-center justify-center font-medium text-white shadow-sm relative`}
        style={{ 
          backgroundColor: colors.primary
        }}
      >
        {employee.avatar}
    
      </div>
    );
  };

  // Simplified Employee Card Component
  const EmployeeCard = ({ employee, onClick, hasChildren, isExpanded, onToggleExpand, level = 0 }) => {
    const directReports = employeeData.filter(emp => emp.lineManagerId === employee.id).length;
    const colors = getEmployeeColor(employee);

    return (
      <div className="relative group">
        <div 
          className={`
            ${bgCard} border ${borderColor} rounded-lg p-3 
            shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer
            hover:-translate-y-0.5 relative overflow-hidden
            min-w-[200px] max-w-[220px]
          `}
          style={{ 
            borderLeft: `3px solid ${colors.primary}`
          }}
          onClick={onClick}
        >
          <div className="flex items-start gap-2 mb-2">
            <Avatar employee={employee} size="lg" />
            <div className="flex-1 min-w-0">
              <h3 className={`font-medium ${textPrimary} text-xs leading-tight mb-1`}>
                {employee.name}
              </h3>
              <p className={`${textMuted} text-xs mb-1 line-clamp-2 leading-tight`}>
                {employee.title}
              </p>
              <div className="flex items-center gap-1">
                <span 
                  className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium text-white"
                  style={{ backgroundColor: colors.primary }}
                >
                  G{employee.grade}
                </span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs ${bgAccent} ${textSecondary}`}>
                  {employee.department}
                </span>
              </div>
            </div>
          </div>
          
          <div className="space-y-1 text-xs">
            <div className={`flex items-center ${textMuted}`}>
              <MapPin className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">{employee.location}</span>
            </div>
            {directReports > 0 && (
              <div className="flex items-center font-medium text-xs" style={{ color: colors.primary }}>
                <Users className="w-3 h-3 mr-1 flex-shrink-0" />
                <span>{directReports}</span>
              </div>
            )}
          </div>
          
         
        </div>

        {/* Expand/Collapse button */}
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleExpand();
            }}
            className={`
              absolute -bottom-2 left-1/2 transform -translate-x-1/2 z-20
              w-5 h-5 rounded-full text-white shadow-sm
              flex items-center justify-center hover:scale-110 transition-all duration-200
              border border-white
            `}
            style={{ backgroundColor: colors.primary }}
          >
            {isExpanded ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
          </button>
        )}
      </div>
    );
  };

  // Enhanced Tree Node with solid, clean connections
  const TreeNode = ({ node, level = 0 }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const nodeChildren = node.children || [];
    const colors = getEmployeeColor(node);

    // Calculate positions for connection lines
    const childCount = nodeChildren.length;
    const cardWidth = 210;
    const gapBetweenCards = 40;

    return (
      <div className="relative">
        {/* Vertical connection line from parent - SOLID */}
        {level > 0 && (
          <div className="absolute left-1/2 -top-10 transform -translate-x-px z-10">
            <div 
              style={{ 
                width: '2px',
                height: '40px',
                backgroundColor: colors.primary,
                opacity: 1
              }}
            ></div>
          </div>
        )}

        {/* Employee Card */}
        <div className="flex flex-col items-center mb-10">
          <EmployeeCard
            employee={node}
            onClick={() => setSelectedEmployee(node)}
            hasChildren={hasChildren}
            isExpanded={isExpanded}
            onToggleExpand={() => toggleNode(node.id)}
            level={level}
          />
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="relative">
            {/* Vertical line down to children level - SOLID */}
            <div className="absolute left-1/2 -top-5 transform -translate-x-px z-10">
              <div 
                style={{ 
                  width: '2px',
                  height: '40px',
                  backgroundColor: colors.primary,
                  opacity: 0.9
                }}
              ></div>
            </div>
            
            {/* Horizontal connection line for multiple children - SOLID */}
            {childCount > 1 && (
              <div className="absolute top-5 left-1/2 transform -translate-x-1/2 z-10">
                <div 
                  style={{
                    height: '2px',
                    backgroundColor: colors.primary,
                    opacity: 0.8,
                    width: `${(childCount - 1) * (cardWidth + gapBetweenCards)}px`
                  }}
                ></div>
              </div>
            )}

            {/* Children container */}
            <div className="pt-10">
              <div className="flex justify-center items-start gap-10">
                {nodeChildren.map((child, index) => (
                  <div key={child.id} className="relative">
                    {/* Individual connection line to child - SOLID */}
                    <div className="absolute left-1/2 -top-10 transform -translate-x-px z-10">
                      <div 
                        style={{ 
                          width: '2px',
                          height: '40px',
                          backgroundColor: getEmployeeColor(child).primary,
                          opacity: 1
                        }}
                      ></div>
                    </div>
                    
                    <TreeNode
                      node={child}
                      level={level + 1}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Grid View Component
  const GridView = () => {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 p-4">
        {filteredEmployees.map(employee => (
          <EmployeeCard 
            key={employee.id}
            employee={employee}
            onClick={() => setSelectedEmployee(employee)}
            hasChildren={employeeData.some(emp => emp.lineManagerId === employee.id)}
            isExpanded={false}
            onToggleExpand={() => {}}
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
    const colors = getEmployeeColor(employee);
    
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div className={`${bgCard} rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border ${borderColor}`}>
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <Avatar employee={employee} size="xl" />
                <div>
                  <h2 className={`text-2xl font-bold ${textPrimary}`}>{employee.name}</h2>
                  <p className={`${textSecondary} font-medium text-lg`}>{employee.title}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span 
                      className="px-3 py-1 rounded-lg text-sm font-medium text-white"
                      style={{ backgroundColor: colors.primary }}
                    >
                      Grade {employee.grade}
                    </span>
                    <span className={`px-3 py-1 rounded-lg text-sm ${bgAccent} ${textSecondary}`}>
                      {employee.department}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className={`${textMuted} hover:${textPrimary} p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors`}
              >
                <X size={24} />
              </button>
            </div>
            
            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <DetailItem icon={<Building2 />} label="Department" value={employee.department} colors={colors} />
                <DetailItem icon={<Layers />} label="Unit" value={employee.unit} colors={colors} />
                <DetailItem icon={<Award />} label="Grade" value={`Grade ${employee.grade}`} colors={colors} />
                <DetailItem icon={<MapPin />} label="Location" value={employee.location} colors={colors} />
              </div>
              <div className="space-y-4">
                <DetailItem icon={<Phone />} label="Phone" value={employee.phone} colors={colors} />
                <DetailItem icon={<Mail />} label="Email" value={employee.email} colors={colors} />
                <DetailItem icon={<Briefcase />} label="Position" value={employee.positionGroup} colors={colors} />
               
              </div>
            </div>
            
            {/* Manager */}
            {manager && (
              <div className="mb-6">
                <h3 className={`text-lg font-semibold ${textPrimary} mb-4 flex items-center`}>
                  <Crown className="w-5 h-5 mr-2" style={{ color: colors.primary }} />
                  Reports To
                </h3>
                <div className="w-80">
                  <EmployeeCard 
                    employee={manager} 
                    onClick={() => setSelectedEmployee(manager)}
                    hasChildren={false}
                    isExpanded={false}
                    onToggleExpand={() => {}}
                  />
                </div>
              </div>
            )}
            
            {/* Direct Reports */}
            {directReports.length > 0 && (
              <div>
                <h3 className={`text-lg font-semibold ${textPrimary} mb-4 flex items-center`}>
                  <Users className="w-5 h-5 mr-2" style={{ color: colors.primary }} />
                  Direct Reports ({directReports.length})
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {directReports.map(report => (
                    <div key={report.id} className="w-80">
                      <EmployeeCard 
                        employee={report}
                        onClick={() => setSelectedEmployee(report)}
                        hasChildren={false}
                        isExpanded={false}
                        onToggleExpand={() => {}}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Detail Item Component
  const DetailItem = ({ icon, label, value, colors }) => (
    <div className="flex items-start gap-3">
      <div 
        className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center`}
        style={{ backgroundColor: colors.bg }}
      >
        {React.cloneElement(icon, { 
          className: "w-5 h-5", 
          style: { color: colors.primary } 
        })}
      </div>
      <div>
        <p className={`text-xs font-medium ${textMuted} uppercase tracking-wider`}>{label}</p>
        <p className={`${textPrimary} font-medium`}>{value || 'Not specified'}</p>
      </div>
    </div>
  );

  // Get unique values for filters
  const departments = [...new Set(employeeData.map(emp => emp.department))];
  const grades = [...new Set(employeeData.map(emp => emp.grade))].sort((a, b) => b - a);
  const locations = [...new Set(employeeData.map(emp => emp.location))];


  // Stats
  const stats = {
    total: employeeData.length,

    departments: departments.length,
    locations: locations.length
  };

  return (
    <DashboardLayout>
      <div ref={containerRef} className={`h-full ${isFullscreen ? 'fixed inset-0 z-50' : ''} bg-almet-mystic dark:bg-almet-cloud-burst`}>
        {/* Enhanced Header */}
        <div className={`${bgCard} shadow-sm border-b ${borderColor} sticky top-0 z-40`}>
          <div className="px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-almet-sapphire rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h1 className={`text-lg font-semibold ${textPrimary}`}>
                      Organizational Chart
                    </h1>
                    <p className={`text-xs ${textMuted}`}>Almet Holding Structure</p>
                  </div>
                </div>
                
                {/* Simplified Stats */}
                <div className="hidden lg:flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-almet-sapphire">{stats.total}</div>
                      <div className={`text-xs ${textMuted}`}>Total</div>
                    </div>
               
               
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative">
                  <Search className={`absolute left-2.5 top-1/2 transform -translate-y-1/2 ${textMuted} w-4 h-4`} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`pl-9 pr-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent w-48 ${bgCard} ${textPrimary} text-sm`}
                  />
                </div>
                
                {/* View Toggle */}
                <div className={`flex rounded-lg border ${borderColor} ${bgCard} p-0.5`}>
                  <button
                    onClick={() => setViewMode('tree')}
                    className={`px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      viewMode === 'tree' 
                        ? 'bg-almet-sapphire text-white shadow-sm' 
                        : `${textMuted} hover:${textPrimary}`
                    }`}
                  >
                    <TreePine size={14} />
                    Tree
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                      viewMode === 'grid' 
                        ? 'bg-almet-sapphire text-white shadow-sm' 
                        : `${textMuted} hover:${textPrimary}`
                    }`}
                  >
                    <Grid size={14} />
                    Grid
                  </button>
                </div>
                
                {/* Filter Toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-3 py-2 border ${borderColor} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${bgCard} ${textPrimary} text-sm flex items-center gap-1.5`}
                >
                  <Filter size={14} />
                  Filter
                  {Object.values(filters).some(f => f !== 'all') && (
                    <div className="w-1.5 h-1.5 bg-almet-sapphire rounded-full"></div>
                  )}
                </button>

                {/* Controls */}
                <div className="flex items-center gap-1">
                  {/* Zoom Controls */}
                  <div className={`flex items-center border ${borderColor} rounded-lg ${bgCard}`}>
                    <button
                      onClick={handleZoomOut}
                      className={`p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${textMuted} hover:${textPrimary}`}
                      title="Zoom Out"
                    >
                      <ZoomOut size={14} />
                    </button>
                    <span className={`px-2 text-xs ${textMuted} min-w-[2.5rem] text-center border-x ${borderColor}`}>
                      {zoomLevel}%
                    </span>
                    <button
                      onClick={handleZoomIn}
                      className={`p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${textMuted} hover:${textPrimary}`}
                      title="Zoom In"
                    >
                      <ZoomIn size={14} />
                    </button>
                    <button
                      onClick={handleResetZoom}
                      className={`p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${textMuted} hover:${textPrimary} border-l ${borderColor}`}
                      title="Reset"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>

                  {/* Fullscreen Toggle */}
                  <button
                    onClick={toggleFullscreen}
                    className={`p-2 border ${borderColor} rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${bgCard} ${textMuted} hover:${textPrimary}`}
                    title="Fullscreen"
                  >
                    {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className={`${bgCard} border-b ${borderColor} shadow-sm`}>
            <div className="px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-sm font-semibold ${textPrimary}`}>Filters</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearAllFilters}
                    className={`text-xs ${textMuted} hover:${textPrimary} transition-colors hover:underline`}
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className={`p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded ${textMuted} hover:${textPrimary} transition-colors`}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className={`block text-xs font-medium ${textSecondary} mb-1`}>Department</label>
                  <select
                    value={filters.department}
                    onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                    className={`w-full p-2 text-sm border ${borderColor} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary}`}
                  >
                    <option value="all">All Departments</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className={`block text-xs font-medium ${textSecondary} mb-1`}>Grade</label>
                  <select
                    value={filters.grade}
                    onChange={(e) => setFilters(prev => ({ ...prev, grade: e.target.value }))}
                    className={`w-full p-2 text-sm border ${borderColor} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary}`}
                  >
                    <option value="all">All Grades</option>
                    {grades.map(grade => (
                      <option key={grade} value={grade}>Grade {grade}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-medium ${textSecondary} mb-1`}>Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                    className={`w-full p-2 text-sm border ${borderColor} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary}`}
                  >
                    <option value="all">All Status</option>
                    {statuses.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={`block text-xs font-medium ${textSecondary} mb-1`}>Location</label>
                  <select
                    value={filters.location}
                    onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                    className={`w-full p-2 text-sm border ${borderColor} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-transparent ${bgCard} ${textPrimary}`}
                  >
                    <option value="all">All Locations</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="relative overflow-auto" style={{ height: 'calc(100vh - 120px)' }}>
          {viewMode === 'tree' ? (
            <div 
              ref={chartRef}
              className="p-6 transition-transform duration-300 w-full min-h-full"
              style={{ 
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
                minWidth: 'max-content',
                minHeight: 'calc(100vh - 140px)'
              }}
            >
              <div className="flex justify-center h-full">
                <div className="space-y-12 org-chart">
                  {organizationTree.map(rootNode => (
                    <TreeNode key={rootNode.id} node={rootNode} />
                  ))}
                </div>
              </div>
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

        {/* Custom Styles */}
        <style jsx>{`
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          ::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          
          ::-webkit-scrollbar-track {
            background: rgba(144, 160, 185, 0.1);
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: rgba(48, 83, 155, 0.5);
            border-radius: 4px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(48, 83, 155, 0.7);
          }
          
          .backdrop-blur-sm {
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
          }
          
          .focus\\:ring-almet-sapphire:focus {
            --tw-ring-color: rgba(48, 83, 155, 0.5);
          }
          
          /* Enhanced connection lines - solid and smooth */
          .org-chart div[style*="backgroundColor"] {
            border-radius: 0 !important;
            box-shadow: none !important;
          }
          
          /* Prevent line breaks and dashed borders */
          .org-chart * {
            -webkit-transform: translateZ(0);
            transform: translateZ(0);
          }
          
          /* Ensure solid lines render properly */
          .org-chart div {
            image-rendering: -webkit-optimize-contrast;
            image-rendering: crisp-edges;
          }
          
          @media (max-width: 768px) {
            .grid.gap-10 {
              grid-template-columns: 1fr !important;
              gap: 1.5rem;
            }
            
            .flex.gap-10 {
              flex-direction: column;
              gap: 1.5rem;
            }
          }
        `}</style>
      </div>
    </DashboardLayout>
  );
};

export default OrgChart;