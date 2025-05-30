'use client'
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    ChevronDown, ChevronRight, Users, Building2, Award, User, Search, Phone, Mail, MapPin,
    Briefcase, Crown, Target, Layers, Filter, TreePine, Maximize2, Minimize2, Plus, Minus,
    ZoomIn, ZoomOut, RotateCcw, X, Grid, UsersRound, Archive, Puzzle, Info
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTheme } from '@/components/common/ThemeProvider';

const OrgChart = () => {
    const { darkMode } = useTheme();
    const [expandedNodes, setExpandedNodes] = useState(new Set(['HLD22']));
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [filters, setFilters] = useState({ department: 'all', grade: 'all', location: 'all' });
    const [zoomLevel, setZoomLevel] = useState(100);
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('tree');
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showLegend, setShowLegend] = useState(false);

    const chartRef = useRef(null);
    const containerRef = useRef(null);
    const scrollContainerRef = useRef(null);

    // Panning states
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [scrollLeftStart, setScrollLeftStart] = useState(0);
    const [scrollTopStart, setScrollTopStart] = useState(0);

    // Enhanced theme colors
    const bgApp = darkMode ? "bg-almet-cloud-burst" : "bg-gray-50";
    const bgCard = darkMode ? "bg-almet-san-juan" : "bg-white";
    const bgCardHover = darkMode ? "bg-almet-comet" : "bg-gray-50";
    const textHeader = darkMode ? "text-gray-100" : "text-gray-900";
    const textPrimary = darkMode ? "text-gray-200" : "text-gray-700";
    const textSecondary = darkMode ? "text-almet-bali-hai" : "text-gray-500";
    const textMuted = darkMode ? "text-almet-waterloo" : "text-gray-400";
    const borderColor = darkMode ? "border-almet-comet/30" : "border-gray-200";
    const bgAccent = darkMode ? "bg-almet-comet/30" : "bg-almet-mystic/50";
    const shadowCard = "shadow-sm";
    const connectionColor = darkMode ? "rgb(122, 130, 154)" : "rgb(156, 163, 175)";

    // Simplified position hierarchy colors - using project colors
    const hierarchyColors = {
        'VC': { 
            primary: darkMode ? '#4e7db5' : '#30539b', 
            bg: darkMode ? 'rgba(78, 125, 181, 0.1)' : 'rgba(48, 83, 155, 0.08)',
            badge: darkMode ? '#30539b' : '#4e7db5'
        },
        'DIRECTOR': { 
            primary: darkMode ? '#336fa5' : '#2d5a91', 
            bg: darkMode ? 'rgba(51, 111, 165, 0.1)' : 'rgba(45, 90, 145, 0.08)',
            badge: darkMode ? '#2d5a91' : '#336fa5'
        },
        'HEAD OF DEPARTMENT': { 
            primary: darkMode ? '#38587d' : '#324c6b', 
            bg: darkMode ? 'rgba(56, 88, 125, 0.1)' : 'rgba(50, 76, 107, 0.08)',
            badge: darkMode ? '#324c6b' : '#38587d'
        },
        'SENIOR SPECIALIST': { 
            primary: darkMode ? '#7a829a' : '#6b7280', 
            bg: darkMode ? 'rgba(122, 130, 154, 0.1)' : 'rgba(107, 114, 128, 0.08)',
            badge: darkMode ? '#6b7280' : '#7a829a'
        },
        'SPECIALIST': { 
            primary: darkMode ? '#90a0b9' : '#74839c', 
            bg: darkMode ? 'rgba(144, 160, 185, 0.1)' : 'rgba(116, 131, 156, 0.08)',
            badge: darkMode ? '#74839c' : '#90a0b9'
        },
        'JUNIOR SPECIALIST': { 
            primary: darkMode ? '#9c9cb5' : '#8b8ca3', 
            bg: darkMode ? 'rgba(156, 156, 181, 0.1)' : 'rgba(139, 140, 163, 0.08)',
            badge: darkMode ? '#8b8ca3' : '#9c9cb5'
        }
    };

    const getEmployeeColor = (employee) => {
        if (!employee || !employee.positionGroup) return hierarchyColors['SPECIALIST'];
        return hierarchyColors[employee.positionGroup] || hierarchyColors['SPECIALIST'];
    };

    const employeeData = [ 
        { id: 'HLD22', name: 'Şirin Camalli Rəşad Oğlu', title: 'BUSINESS DEVELOPMENT DIRECTOR', grade: '7', lineManagerId: null, department: 'Executive', unit: 'BUSINESS DEVELOPMENT', avatar: 'ŞC', phone: '+994 50 xxx xxxx', email: 'sirin.camalli@almet.az', location: 'Baku HQ', businessFunction: 'Holding', positionGroup: 'DIRECTOR' },
        { id: 'HLD1', name: 'Əli Orucov Məzahir Oğlu', title: 'DEPUTY CHAIRMAN ON FINANCE & BUSINESS DEVELOPMENT', grade: '8', lineManagerId: 'HLD22', department: 'Finance', unit: 'BUSINESS DEVELOPMENT', avatar: 'ƏO', phone: '+994 50 xxx xxxx', email: 'ali.orucov@almet.az', location: 'Baku HQ', businessFunction: 'Holding', positionGroup: 'VC' },
        { id: 'HLD2', name: 'Şəfa Nəcəfova Məmməd Qizi', title: 'DEPUTY CHAIRMAN ON BUSINESS TRANSFORMATION & CULTURE', grade: '8', lineManagerId: 'HLD22', department: 'HR', unit: 'BUSINESS TRANSFORMATION', avatar: 'ŞN', phone: '+994 50 xxx xxxx', email: 'sefa.necefova@almet.az', location: 'Baku HQ', businessFunction: 'Holding', positionGroup: 'VC' },
        { id: 'HLD3', name: 'Elvin Camalli Rəşad Oğlu', title: 'DEPUTY CHAIRMAN ON COMMERCIAL ACTIVITIES EUROPE REGION', grade: '8', lineManagerId: 'HLD22', department: 'Commercial', unit: 'EUROPE REGION', avatar: 'EC', phone: '+994 50 xxx xxxx', email: 'elvin.camalli@almet.az', location: 'Europe', businessFunction: 'UK', positionGroup: 'VC' },
        { id: 'HLD23', name: 'Əli Haciyev Kamal Oğlu', title: 'DIRECTOR', grade: '7', lineManagerId: 'HLD22', department: 'Operations', unit: 'BUSINESS DEVELOPMENT', avatar: 'ƏH', phone: '+994 50 xxx xxxx', email: 'ali.haciyev@almet.az', location: 'Baku HQ', businessFunction: 'Holding', positionGroup: 'DIRECTOR' },
        { id: 'HLD4', name: 'Ümid Mustafayev Azər Oğlu', title: 'DIRECTOR', grade: '7', lineManagerId: 'HLD1', department: 'Finance', unit: 'ACCOUNTING', avatar: 'ÜM', phone: '+994 50 xxx xxxx', email: 'umid.mustafayev@almet.az', location: 'Baku HQ', businessFunction: 'Holding', positionGroup: 'DIRECTOR' },
        { id: 'HLD16', name: 'Azad Nəzərov Zirəddin Oğlu', title: 'CHIEF ACCOUNTANT', grade: '5', lineManagerId: 'HLD4', department: 'Finance', unit: 'ACCOUNTING', avatar: 'AN', phone: '+994 50 xxx xxxx', email: 'azad.nezerov@almet.az', location: 'Baku HQ', businessFunction: 'Holding', positionGroup: 'SENIOR SPECIALIST' },
        { id: 'HLD5', name: 'Müşfiq Quliyev Mehdi Oğlu', title: 'HEAD OF BUDGETING & CONTROLLING', grade: '7', lineManagerId: 'HLD4', department: 'Finance', unit: 'BUDGETING', avatar: 'MQ', phone: '+994 50 xxx xxxx', email: 'musfiq.quliyev@almet.az', location: 'Baku HQ', businessFunction: 'Holding', positionGroup: 'HEAD OF DEPARTMENT' },
        { id: 'HLD17', name: 'Pənah Əliyev Əzizulla Oğlu', title: 'CHIEF ACCOUNTANT', grade: '5', lineManagerId: 'HLD4', department: 'Finance', unit: 'ACCOUNTING', avatar: 'PƏ', phone: '+994 50 xxx xxxx', email: 'penah.aliyev@almet.az', location: 'Baku HQ', businessFunction: 'Holding', positionGroup: 'SENIOR SPECIALIST' },
        { id: 'HLD9', name: 'Səbuhi Isayev Samir Oğlu', title: 'HEAD OF LEGAL DEPARTMENT', grade: '6', lineManagerId: 'HLD2', department: 'Legal', unit: 'LEGAL', avatar: 'SI', phone: '+994 50 xxx xxxx', email: 'sebuhi.isayev@almet.az', location: 'Baku HQ', businessFunction: 'Holding', positionGroup: 'HEAD OF DEPARTMENT' },
        { id: 'EUR1', name: 'Joseph Jesudas Babuji', title: 'CHIEF ACCOUNTANT', grade: '5', lineManagerId: 'HLD3', department: 'Finance', unit: 'EUROPE OPERATIONS', avatar: 'JJ', phone: '+44 xxx xxx xxxx', email: 'joseph.jesudas@almet.eu', location: 'London', businessFunction: 'UK', positionGroup: 'SENIOR SPECIALIST' },
        { id: 'EUR2', name: 'Nitika Nanda', title: 'OPERATIONS SPECIALIST', grade: '3', lineManagerId: 'HLD3', department: 'Operations', unit: 'EUROPE OPERATIONS', avatar: 'NN', phone: '+44 xxx xxx xxxx', email: 'nitika.nanda@almet.eu', location: 'London', businessFunction: 'UK', positionGroup: 'SPECIALIST' }
    ];

    // Improved spacing and dimensions
    const cardGap = 50;
    const connectorThickness = 2;
    const halfCardGap = cardGap / 2;
    const cardWidth = 280; // Standardized card width

    const getHierarchyMap = (employees) => {
        const map = {};
        if (!employees || !Array.isArray(employees)) return map;
        employees.forEach(emp => {
            if (emp && emp.id != null) {
                map[emp.id] = { ...emp, children: [] };
            }
        });
        employees.forEach(emp => {
            if (emp && emp.lineManagerId && map[emp.lineManagerId] && map[emp.id]) {
                map[emp.lineManagerId].children.push(map[emp.id]);
            }
        });
        return map;
    };

    const countAllSubordinatesRecursive = (employeeNode, hierarchyMap) => {
        if (!employeeNode || !employeeNode.children || employeeNode.children.length === 0) {
            return 0;
        }
        let count = employeeNode.children.length;
        for (const childRef of employeeNode.children) {
            const childNode = hierarchyMap[childRef.id];
            if (childNode) {
                 count += countAllSubordinatesRecursive(childNode, hierarchyMap);
            }
        }
        return count;
    };

    const getLevelToCeoRecursive = (employeeId, flatEmployeeMap) => {
        let level = 0;
        if (!employeeId || !flatEmployeeMap[employeeId]) return -1;
        let currentEmployee = flatEmployeeMap[employeeId];
        while (currentEmployee && currentEmployee.lineManagerId && flatEmployeeMap[currentEmployee.lineManagerId]) {
            currentEmployee = flatEmployeeMap[currentEmployee.lineManagerId];
            level++;
            if (level > employeeData.length + 5) {
                console.error("getLevelToCeoRecursive: Potential infinite loop detected for employeeId:", employeeId);
                return -2; 
            }
        }
        return level;
    };

    const getColleaguesInUnitCount = (currentEmployee, allEmployees) => {
        if (!currentEmployee || !currentEmployee.unit) return 0;
        return allEmployees.filter(emp => emp && emp.id !== currentEmployee.id && emp.unit === currentEmployee.unit).length;
    };

    const getColleaguesInBusinessFunctionCount = (currentEmployee, allEmployees) => {
        if (!currentEmployee || !currentEmployee.businessFunction) return 0;
        return allEmployees.filter(emp => emp && emp.id !== currentEmployee.id && emp.businessFunction === currentEmployee.businessFunction).length;
    };

    const augmentedAndMappedData = useMemo(() => {
        const validEmployeeData = employeeData.filter(emp => emp && emp.id != null);
        
        const flatMapForCeoLevel = {};
        validEmployeeData.forEach(emp => flatMapForCeoLevel[emp.id] = { ...emp });

        const hierarchyMapForSubordinates = getHierarchyMap(validEmployeeData);

        const augmented = validEmployeeData.map((emp) => {
            const employeeNodeInHierarchy = hierarchyMapForSubordinates[emp.id];
            
            return {
                ...emp,
                totalSubordinates: employeeNodeInHierarchy ? countAllSubordinatesRecursive(employeeNodeInHierarchy, hierarchyMapForSubordinates) : 0,
                levelToCeo: getLevelToCeoRecursive(emp.id, flatMapForCeoLevel),
                colleaguesInUnitCount: getColleaguesInUnitCount(emp, validEmployeeData),
                colleaguesInBusinessFunctionCount: getColleaguesInBusinessFunctionCount(emp, validEmployeeData),
            };
        });

        const finalHierarchyMap = getHierarchyMap(augmented);
        const finalRoots = augmented.filter(item => (!item.lineManagerId || !finalHierarchyMap[item.lineManagerId]));
        
        const augmentedFlatMap = {};
        augmented.forEach(emp => augmentedFlatMap[emp.id] = emp);

        return {
            augmentedDataList: augmented,
            hierarchyMap: finalHierarchyMap,
            roots: finalRoots.map(r => finalHierarchyMap[r.id]).filter(Boolean),
            augmentedFlatMap: augmentedFlatMap,
        };
    }, [employeeData]);
    
    const { augmentedDataList, hierarchyMap, roots: organizationTree, augmentedFlatMap } = augmentedAndMappedData;
    
    const filteredEmployees = useMemo(() => { 
        return augmentedDataList.filter(emp => {
            if (!emp) return false;
            const empName = emp.name || "";
            const empTitle = emp.title || "";
            const empDepartment = emp.department || "";
            const matchesSearch = !searchTerm ||
                empName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                empTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                empDepartment.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDepartment = filters.department === 'all' || empDepartment === filters.department;
            const matchesGrade = filters.grade === 'all' || (emp.grade && emp.grade.toString() === filters.grade);
            const matchesLocation = filters.location === 'all' || (emp.location && emp.location === filters.location);
            return matchesSearch && matchesDepartment && matchesGrade && matchesLocation;
        });
    }, [augmentedDataList, searchTerm, filters]);
    
    const toggleNode = (nodeId) => {
        setExpandedNodes(prev => {
            const newExpanded = new Set(prev);
            if (newExpanded.has(nodeId)) newExpanded.delete(nodeId);
            else newExpanded.add(nodeId);
            return newExpanded;
        });
    };

    const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 25, 200));
    const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 25, 50));
    const handleResetZoom = () => setZoomLevel(100);
    
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().then(() => setIsFullscreen(true)).catch(err => console.error("Fullscreen request failed:", err));
        } else {
            document.exitFullscreen().then(() => setIsFullscreen(false)).catch(err => console.error("Exit fullscreen failed:", err));
        }
    };
    
    const clearAllFilters = () => {
        setFilters({ department: 'all', grade: 'all', location: 'all' });
        setSearchTerm('');
    };

    const areFiltersActive = useMemo(() => 
        Object.values(filters).some(f => f !== 'all') || searchTerm !== ''
    , [filters, searchTerm]);

    // Panning logic
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDragging || !scrollContainerRef.current) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            scrollContainerRef.current.scrollLeft = scrollLeftStart - dx;
            scrollContainerRef.current.scrollTop = scrollTopStart - dy;
        };

        const handleMouseUp = () => {
            setIsDragging(false);
            if (scrollContainerRef.current) {
                scrollContainerRef.current.style.cursor = 'grab';
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, startX, startY, scrollLeftStart, scrollTopStart]);

    const handleMouseDown = (e) => {
        if (e.button !== 0) return;
        if (e.target.closest('.employee-card-action') || e.target.closest('button')) { 
            return;
        }

        setIsDragging(true);
        setStartX(e.clientX);
        setStartY(e.clientY);
        setScrollLeftStart(scrollContainerRef.current.scrollLeft);
        setScrollTopStart(scrollContainerRef.current.scrollTop);
        scrollContainerRef.current.style.cursor = 'grabbing';
        e.preventDefault();
    };

    const resetPan = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = 0;
            scrollContainerRef.current.scrollTop = 0;
        }
    };

    // Enhanced Avatar Component
    const Avatar = ({ employee, size = 'md' }) => {
        const sizes = {
            sm: 'w-8 h-8 text-xs',
            md: 'w-10 h-10 text-sm',
            lg: 'w-12 h-12 text-base',
        };

        if (!employee) return <div className={`${sizes[size]} rounded-xl bg-gray-300 animate-pulse`}></div>;
        
        const colors = getEmployeeColor(employee);
        return (
            <div 
                className={`${sizes[size]} rounded-xl flex items-center justify-center font-semibold text-white relative flex-shrink-0 ring-2 ring-white dark:ring-almet-san-juan`}
                style={{ 
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.badge} 100%)`,
                    boxShadow: `0 4px 12px rgba(0,0,0,0.15)`
                }}
            >
                {employee.avatar || '?'}
            </div>
        );
    };

    // Enhanced Employee Card Component
    const EmployeeCard = ({ employee, onClick, hasChildren, isExpanded, onToggleExpand, variant = 'tree' }) => {
        if (!employee) return null;
        const directReportsCount = hierarchyMap[employee.id]?.children?.length || 0;
        const colors = getEmployeeColor(employee);

        const isDetailVariant = variant === 'detail';
        const isGridVariant = variant === 'grid';
        const isTreeVariant = variant === 'tree';

        const cardBaseStyle = `${bgCard} border ${borderColor} rounded-2xl transition-all duration-300 overflow-hidden backdrop-blur-sm`;
        const interactiveStyle = onClick ? `cursor-pointer hover:${bgCardHover} hover:border-almet-sapphire/40 ${shadowCard} hover:shadow-lg hover:-translate-y-1 employee-card-action` : "";
        
        let cardPadding = 'p-4';
        let cardWidth = 'w-72'; // Standardized width

        if (isGridVariant) {
            cardPadding = 'p-5';
            cardWidth = 'w-80';
        } else if (isDetailVariant) {
            cardWidth = 'w-64';
            cardPadding = 'p-3';
        }

        if (isDetailVariant) {
            return (
                <div
                    className={`${cardBaseStyle} ${interactiveStyle} ${cardPadding} flex items-center gap-3 ${cardWidth}`}
                    onClick={onClick}
                >
                    <Avatar employee={employee} size="sm" />
                    <div className="flex-1 min-w-0">
                        <h4 className={`font-semibold ${textPrimary} text-sm truncate`} title={employee.name}>{employee.name}</h4>
                        <p className={`${textSecondary} text-xs truncate mt-0.5`} title={employee.title}>{employee.title}</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="relative group">
                <div
                    className={`${cardBaseStyle} ${interactiveStyle} ${cardPadding} ${cardWidth} flex flex-col relative`}
                    onClick={onClick}
                >
                    {/* Header with Avatar and Name */}
                    <div className="flex items-start gap-4 mb-4">
                        <Avatar employee={employee} size={isGridVariant ? 'lg' : 'md'} />
                        <div className="flex-1 min-w-0">
                            <h3 className={`font-semibold ${textHeader} ${isGridVariant ? 'text-base' : 'text-sm'} leading-tight truncate mb-1`} title={employee.name}>
                                {employee.name}
                            </h3>
                            <p className={`${textSecondary} text-xs leading-relaxed line-clamp-2`} title={employee.title}>
                                {employee.title}
                            </p>
                        </div>
                    </div>
                    
                    {/* Badges */}
                    <div className="flex items-center gap-2 mb-4">
                        <span 
                            className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium text-white"
                            style={{ backgroundColor: colors.badge }}
                        >
                            Grade {employee.grade}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${bgAccent} ${textPrimary}`}>
                            {employee.department}
                        </span>
                    </div>

                    {/* Details */}
                    <div className={`mt-auto pt-4 border-t ${borderColor} space-y-3 text-xs`}>
                        <div className={`flex items-center ${textSecondary}`}>
                            <MapPin className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                            <span className="truncate font-medium" title={employee.location}>{employee.location}</span>
                        </div>
                        
                        {directReportsCount > 0 && (
                            <div className={`flex items-center font-semibold`} style={{ color: colors.primary }}>
                                <Users className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                                <span>{directReportsCount} Direct Report{directReportsCount !== 1 ? 's' : ''}</span>
                            </div>
                        )}
                        
                        {isGridVariant && employee.totalSubordinates > directReportsCount && (
                            <div className={`flex items-center ${textSecondary}`}>
                                <UsersRound className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                                <span>{employee.totalSubordinates} Total Subordinate{employee.totalSubordinates !== 1 ? 's' : ''}</span>
                            </div>
                        )}
                        
                        {isGridVariant && (
                            <div className={`flex items-center ${textSecondary}`}>
                                <Target className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
                                <span>Level to CEO: {employee.levelToCeo >= 0 ? employee.levelToCeo : 'N/A'}</span>
                            </div>
                         )}
                    </div>
                </div>
                
                {/* Enhanced Expand/Collapse Button */}
                {hasChildren && onToggleExpand && isTreeVariant && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
                        className={`
                            employee-card-action
                            absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-20 
                            w-6 h-6 rounded-full text-white
                            flex items-center justify-center hover:scale-110 transition-all duration-200
                            shadow-lg hover:shadow-xl
                            ${darkMode ? 'ring-2 ring-almet-san-juan' : 'ring-2 ring-white'}
                        `}
                        style={{ 
                            background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.badge} 100%)`,
                        }}
                        aria-label={isExpanded ? "Collapse node" : "Expand node"}
                    >
                        {isExpanded ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    </button>
                )}
            </div>
        );
    };
    
    // Enhanced Tree Node Component with Better Connection Lines
    const TreeNode = ({ node, level = 0 }) => {
        if (!node || !node.id) return null;
        const nodeChildren = hierarchyMap[node.id]?.children || [];
        const hasChildren = nodeChildren.length > 0;
        const isExpanded = expandedNodes.has(node.id);

        const horizontalLineWidth = nodeChildren.length > 1 ? (nodeChildren.length - 1) * (cardWidth + cardGap) : 0;

        return (
            <div className="flex flex-col items-center relative">
                {/* Incoming Vertical Line */}
                {level > 0 && (
                    <div 
                        className="absolute top-0 left-1/2 transform -translate-x-0.5"
                        style={{
                            height: `${halfCardGap}px`,
                            width: `${connectorThickness}px`,
                            backgroundColor: connectionColor,
                            opacity: 0.8,
                            zIndex: 1
                        }}
                    />
                )}

                {/* Employee Card */}
                <EmployeeCard
                    employee={node}
                    onClick={() => augmentedFlatMap[node.id] ? setSelectedEmployee(augmentedFlatMap[node.id]) : null}
                    hasChildren={hasChildren}
                    isExpanded={isExpanded}
                    onToggleExpand={() => toggleNode(node.id)}
                    variant="tree"
                />

                {/* Outgoing Connection Lines */}
                {hasChildren && isExpanded && (
                    <div 
                        className="relative flex flex-col items-center w-full"
                        style={{ marginTop: `${halfCardGap}px` }} 
                    >
                        {/* Vertical line from card to horizontal line */}
                        <div 
                            className="absolute top-0 left-1/2 transform -translate-x-0.5"
                            style={{
                                height: `${halfCardGap}px`,
                                width: `${connectorThickness}px`,
                                backgroundColor: connectionColor,
                                opacity: 0.8,
                                zIndex: 1
                            }}
                        />

                        {/* Horizontal connecting line */}
                        {nodeChildren.length > 0 && (
                            <div 
                                className="absolute left-1/2 transform -translate-x-1/2"
                                style={{
                                    top: `${halfCardGap}px`,
                                    height: `${connectorThickness}px`,
                                    backgroundColor: connectionColor,
                                    opacity: 0.8,
                                    width: `${Math.max(connectorThickness, horizontalLineWidth)}px`,
                                    zIndex: 1
                                }}
                            />
                        )}
                        
                        {/* Children nodes container */}
                        <div 
                            className="flex justify-center items-start" 
                            style={{ 
                                paddingTop: `${halfCardGap}px`, 
                                gap: `${cardGap}px`,
                            }}
                        >
                            {nodeChildren.map((childNode) => (
                                <TreeNode key={childNode.id} node={childNode} level={level + 1} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const GridView = () => (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 p-6">
            {filteredEmployees.map(employee => (
                <EmployeeCard
                    key={employee.id}
                    employee={employee}
                    onClick={() => setSelectedEmployee(employee)}
                    variant="grid"
                />
            ))}
        </div>
    );

    const navigateToEmployee = (employeeId) => {
        if (!employeeId) return;
        const employeeToShow = augmentedFlatMap[employeeId];
        if (employeeToShow) {
            setSelectedEmployee(employeeToShow);
        }
    };

    // New state for All Direct Reports modal
    const [showAllReportsModal, setShowAllReportsModal] = useState(false);
    const [reportsToShow, setReportsToShow] = useState([]);

    const AllDirectReportsModal = ({ reports, onClose, onSelectEmployee, darkMode }) => {
        const bgCard = darkMode ? "bg-almet-san-juan" : "bg-white";
        const textHeader = darkMode ? "text-gray-100" : "text-gray-800";
        const textMuted = darkMode ? "text-almet-bali-hai" : "text-gray-400";
        const borderColor = darkMode ? "border-almet-comet/30" : "border-gray-200";

        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className={`${bgCard} rounded-2xl shadow-2xl w-full max-w-lg flex flex-col border ${borderColor} max-h-[85vh]`}>
                    <div className={`flex items-center justify-between p-6 border-b ${borderColor} sticky top-0 ${bgCard} rounded-t-2xl z-10`}>
                        <h2 className={`text-xl font-semibold ${textHeader}`}>All Direct Reports ({reports.length})</h2>
                        <button onClick={onClose} className={`${textMuted} hover:${textHeader} p-2 hover:bg-gray-100 dark:hover:bg-almet-comet/30 rounded-xl transition-colors`}>
                            <X size={20} aria-label="Close direct reports modal"/>
                        </button>
                    </div>
                    <div className="p-6 space-y-3 overflow-y-auto">
                        {reports.map(report => (
                            <EmployeeCard
                                key={report.id}
                                employee={report}
                                onClick={() => {
                                    onSelectEmployee(report.id);
                                    onClose();
                                }}
                                variant="detail"
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const EmployeeDetailModal = ({ employee: currentSelectedEmployee, onClose }) => {
        const detailModalRef = useRef(null);
        useEffect(() => { if (detailModalRef.current) detailModalRef.current.scrollTop = 0; }, [currentSelectedEmployee]);

        if (!currentSelectedEmployee || !augmentedFlatMap[currentSelectedEmployee.id]) return null;
        
        const detailedEmployee = augmentedFlatMap[currentSelectedEmployee.id];
        const directReports = hierarchyMap[detailedEmployee.id]?.children || [];
        const manager = detailedEmployee.lineManagerId ? augmentedFlatMap[detailedEmployee.lineManagerId] : null;
        const colors = getEmployeeColor(detailedEmployee);

        const getHierarchyPath = (empId, flatMap) => {
            const path = [];
            let current = flatMap[empId];
            while(current) {
                path.unshift(current);
                if (!current.lineManagerId) break;
                current = flatMap[current.lineManagerId];
            }
            return path;
        };
        const hierarchyPath = getHierarchyPath(detailedEmployee.id, augmentedFlatMap);

        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-200 ease-in-out">
                <div className={`${bgCard} rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col border ${borderColor}`}>
                    <div className={`flex items-center justify-between p-6 border-b ${borderColor} sticky top-0 ${bgCard} rounded-t-2xl z-10`}>
                        <div className="flex items-center gap-4">
                            <Avatar employee={detailedEmployee} size="lg" />
                            <div>
                                <h2 className={`text-xl font-semibold ${textHeader}`}>{detailedEmployee.name}</h2>
                                <p className={`${textSecondary} text-sm mt-1`}>{detailedEmployee.title}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className={`${textMuted} hover:${textPrimary} p-2 hover:${bgAccent} rounded-xl transition-colors`}>
                            <X size={24} aria-label="Close modal"/>
                        </button>
                    </div>

                    <div ref={detailModalRef} className="p-6 overflow-y-auto flex-grow space-y-6">
                        {/* Hierarchy Path */}
                        {hierarchyPath.length > 1 && (
                            <div className={`border-b ${borderColor} pb-4`}>
                                <h4 className={`font-semibold ${textSecondary} mb-3 text-sm uppercase tracking-wider`}>Hierarchy Path</h4>
                                <div className="flex flex-wrap items-center gap-2">
                                    {hierarchyPath.map((emp, index) => (
                                        <React.Fragment key={emp.id}>
                                            <span 
                                                className={`cursor-pointer hover:underline px-2 py-1 rounded-lg transition-colors ${emp.id === detailedEmployee.id ? 'bg-almet-sapphire text-white' : `${textMuted} hover:${textPrimary} hover:${bgAccent}`}`}
                                                onClick={() => navigateToEmployee(emp.id)}
                                            >
                                                {emp.name.split(' ')[0]}
                                            </span>
                                            {index < hierarchyPath.length - 1 && <span className="mx-1 text-gray-400">→</span>}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Employee Details Grid */}
                        <div>
                            <h4 className={`font-semibold ${textSecondary} mb-4 text-sm uppercase tracking-wider`}>Employee Details</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <DetailItem icon={<Building2 />} label="Department" value={detailedEmployee.department} colors={colors} />
                                <DetailItem icon={<Layers />} label="Unit" value={detailedEmployee.unit} colors={colors} />
                                <DetailItem icon={<Award />} label="Grade" value={`G${detailedEmployee.grade}`} colors={colors} />
                                <DetailItem icon={<Briefcase />} label="Position Group" value={detailedEmployee.positionGroup} colors={colors} />
                                <DetailItem icon={<MapPin />} label="Location" value={detailedEmployee.location} colors={colors} />
                                <DetailItem icon={<Puzzle />} label="Business Function" value={detailedEmployee.businessFunction} colors={colors} />
                            </div>
                        </div>
                        
                        {/* Team & Network */}
                        <div className={`border-t ${borderColor} pt-4`}>
                            <h4 className={`font-semibold ${textSecondary} mb-4 text-sm uppercase tracking-wider`}>Team & Network</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {detailedEmployee.levelToCeo >= 0 && <DetailItem icon={<Target />} label="Level to CEO" value={detailedEmployee.levelToCeo.toString()} colors={colors} />}
                                {directReports.length > 0 && <DetailItem icon={<Users />} label="Direct Reports" value={directReports.length.toString()} colors={colors} />}
                                {detailedEmployee.totalSubordinates > 0 && <DetailItem icon={<UsersRound />} label="Total Subordinates" value={detailedEmployee.totalSubordinates.toString()} colors={colors} />}
                                {detailedEmployee.colleaguesInUnitCount >= 0 && <DetailItem icon={<Building2 />} label="Colleagues in Unit" value={detailedEmployee.colleaguesInUnitCount.toString()} colors={colors} />}
                                {detailedEmployee.colleaguesInBusinessFunctionCount >= 0 && <DetailItem icon={<Briefcase />} label="Colleagues in Business Function" value={detailedEmployee.colleaguesInBusinessFunctionCount.toString()} colors={colors} />}
                            </div>
                        </div>
                        
                        {/* Manager */}
                        {manager && (
                            <div className={`border-t ${borderColor} pt-4`}>
                                <h4 className={`font-semibold ${textSecondary} mb-4 text-sm uppercase tracking-wider`}>Reports To</h4>
                                <EmployeeCard 
                                    employee={manager} 
                                    onClick={() => navigateToEmployee(manager.id)}
                                    variant="detail"
                                />
                            </div>
                        )}
                        
                        {/* Direct Reports */}
                        {directReports.length > 0 && (
                            <div className={`border-t ${borderColor} pt-4`}>
                                <h4 className={`font-semibold ${textSecondary} mb-4 text-sm uppercase tracking-wider`}>Direct Reports ({directReports.length})</h4>
                                <div className="space-y-3">
                                    {directReports.slice(0, 3).map(report => (
                                        <EmployeeCard
                                            key={report.id}
                                            employee={report}
                                            onClick={() => navigateToEmployee(report.id)}
                                            variant="detail"
                                        />
                                    ))}
                                    {directReports.length > 3 && (
                                        <button 
                                            onClick={() => { 
                                                setReportsToShow(directReports); 
                                                setShowAllReportsModal(true); 
                                            }}
                                            className={`text-sm ${textMuted} hover:text-almet-sapphire dark:hover:text-almet-steel-blue transition-colors hover:underline px-2 py-1 rounded-lg hover:${bgAccent}`}
                                        >
                                            View all {directReports.length} reports →
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const DetailItem = ({ icon, label, value, colors }) => (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-almet-comet/20">
            <div className={`flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center`} style={{ backgroundColor: colors.bg }}>
                {React.cloneElement(icon, { className: "w-4 h-4", style: { color: colors.primary } })}
            </div>
            <div className="min-w-0 flex-1">
                <p className={`text-xs ${textMuted} font-medium`}>{label}</p>
                <p className={`${textPrimary} font-semibold text-sm truncate mt-0.5`} title={value || 'N/A'}>{value || 'N/A'}</p>
            </div>
        </div>
    );

    const ColorLegend = ({ hierarchyColors, onClose, darkMode }) => {
        const bgCard = darkMode ? "bg-almet-san-juan" : "bg-white";
        const textHeader = darkMode ? "text-gray-100" : "text-gray-800";
        const textPrimary = darkMode ? "text-gray-200" : "text-gray-700";
        const textMuted = darkMode ? "text-almet-bali-hai" : "text-gray-400";
        const borderColor = darkMode ? "border-almet-comet/30" : "border-gray-200";

        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className={`${bgCard} rounded-2xl shadow-2xl w-full max-w-sm flex flex-col border ${borderColor}`}>
                    <div className={`flex items-center justify-between p-6 border-b ${borderColor} sticky top-0 ${bgCard} rounded-t-2xl z-10`}>
                        <h2 className={`text-xl font-semibold ${textHeader}`}>Position Levels</h2>
                        <button onClick={onClose} className={`${textMuted} hover:${textHeader} p-2 hover:bg-gray-100 dark:hover:bg-almet-comet/30 rounded-xl transition-colors`}>
                            <X size={20} aria-label="Close legend"/>
                        </button>
                    </div>
                    <div className="p-6 space-y-3 overflow-y-auto">
                        {Object.entries(hierarchyColors).map(([group, colors]) => (
                            <div key={group} className="flex items-center gap-4 p-3 rounded-xl bg-gray-50 dark:bg-almet-comet/20">
                                <div 
                                    className="w-8 h-8 rounded-xl flex-shrink-0 ring-2 ring-white dark:ring-almet-san-juan" 
                                    style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.badge} 100%)` }}
                                />
                                <span className={`${textPrimary} text-sm font-semibold`}>
                                    {group.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Export to PNG Functionality
    const exportChart = async () => {
        if (!chartRef.current) return;

        const originalTransform = chartRef.current.style.transform;
        const originalTransformOrigin = chartRef.current.style.transformOrigin;
        const currentScrollLeft = scrollContainerRef.current.scrollLeft;
        const currentScrollTop = scrollContainerRef.current.scrollTop;

        scrollContainerRef.current.scrollLeft = 0;
        scrollContainerRef.current.scrollTop = 0;
        chartRef.current.style.transform = 'scale(1)';
        chartRef.current.style.transformOrigin = 'top left';

        await new Promise(resolve => setTimeout(resolve, 50)); 

        try {
            const domToImage = (await import('dom-to-image')).default;
            const dataUrl = await domToImage.toPng(chartRef.current, {
                quality: 0.95,
                width: chartRef.current.scrollWidth,
                height: chartRef.current.scrollHeight,
            });

            const link = document.createElement('a');
            link.download = 'org-chart.png';
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

        } catch (error) {
            console.error('Error exporting chart:', error);
            alert('Failed to export chart. Please try again.');
        } finally {
            chartRef.current.style.transform = originalTransform;
            chartRef.current.style.transformOrigin = originalTransformOrigin;
            scrollContainerRef.current.scrollLeft = currentScrollLeft;
            scrollContainerRef.current.scrollTop = currentScrollTop;
        }
    };

    const departments = useMemo(() => [...new Set(augmentedDataList.map(emp => emp.department).filter(Boolean))].sort(), [augmentedDataList]);
    const grades = useMemo(() => [...new Set(augmentedDataList.map(emp => emp.grade).filter(Boolean))].sort((a, b) => parseInt(b) - parseInt(a)), [augmentedDataList]);
    const locations = useMemo(() => [...new Set(augmentedDataList.map(emp => emp.location).filter(Boolean))].sort(), [augmentedDataList]);

    return (
        <DashboardLayout>
            <div ref={containerRef} className={`h-full ${isFullscreen ? `fixed inset-0 z-40 ${bgApp}` : bgApp} flex flex-col`}>
                {/* Enhanced Header */}
                <div className={`${bgCard} shadow-lg border-b ${borderColor} sticky top-0 z-30 backdrop-blur-md`}>
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 bg-gradient-to-br from-almet-sapphire to-almet-astral rounded-xl flex items-center justify-center shadow-lg`}>
                                    <Building2 className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h1 className={`text-lg font-bold ${textHeader}`}>Organizational Chart</h1>
                                    <p className={`text-sm ${textSecondary}`}>
                                        Total Employees: {augmentedDataList.length} 
                                        {filteredEmployees.length !== augmentedDataList.length && ` • Filtered: ${filteredEmployees.length}`}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3">
                                {/* Enhanced Search */}
                                <div className="relative">
                                    <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${textMuted} w-4 h-4 pointer-events-none`} />
                                    <input 
                                        type="text" 
                                        placeholder="Search employees..." 
                                        value={searchTerm} 
                                        onChange={(e) => setSearchTerm(e.target.value)} 
                                        className={`pl-10 pr-4 py-2.5 border ${borderColor} rounded-xl focus:ring-2 focus:ring-almet-sapphire/50 focus:border-almet-sapphire w-56 ${bgCard} ${textPrimary} text-sm transition-all duration-200 focus:w-64 shadow-sm`} 
                                    />
                                </div>
                                
                                {/* View Mode Toggle */}
                                <div className={`flex rounded-xl border ${borderColor} ${bgCard} p-1 shadow-sm`}>
                                    <button 
                                        onClick={() => setViewMode('tree')} 
                                        title="Tree View" 
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${viewMode === 'tree' ? 'bg-almet-sapphire text-white shadow-sm' : `${textMuted} hover:${textPrimary} hover:${bgAccent}`}`}
                                    >
                                        <TreePine size={16} />Tree
                                    </button>
                                    <button 
                                        onClick={() => setViewMode('grid')} 
                                        title="Grid View" 
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${viewMode === 'grid' ? 'bg-almet-sapphire text-white shadow-sm' : `${textMuted} hover:${textPrimary} hover:${bgAccent}`}`}
                                    >
                                        <Grid size={16} />Grid
                                    </button>
                                </div>
                                
                                {/* Control Buttons */}
                                <button 
                                    onClick={() => setShowFilters(!showFilters)} 
                                    title="Filters" 
                                    className={`p-2.5 border ${borderColor} rounded-xl hover:${bgAccent} transition-all duration-200 ${bgCard} ${textPrimary} shadow-sm relative`}
                                >
                                    <Filter size={16} />
                                    {areFiltersActive && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-almet-sapphire rounded-full border-2 border-white dark:border-almet-san-juan"></div>
                                    )}
                                </button>
                                
                                <button 
                                    onClick={() => setShowLegend(true)} 
                                    title="Position Legend" 
                                    className={`p-2.5 border ${borderColor} rounded-xl hover:${bgAccent} transition-all duration-200 ${bgCard} ${textMuted} hover:${textPrimary} shadow-sm`}
                                >
                                    <Info size={16} />
                                </button>
                                
                                {/* Zoom Controls */}
                                <div className={`flex items-center border ${borderColor} rounded-xl ${bgCard} shadow-sm`}>
                                    <button 
                                        onClick={handleZoomOut} 
                                        className={`p-2.5 hover:${bgAccent} transition-colors ${textMuted} hover:${textPrimary} rounded-l-xl`} 
                                        title="Zoom Out"
                                    >
                                        <ZoomOut size={16} />
                                    </button>
                                    <span className={`px-3 text-sm ${textMuted} min-w-[3rem] text-center border-x ${borderColor}`}>
                                        {zoomLevel}%
                                    </span>
                                    <button 
                                        onClick={handleZoomIn} 
                                        className={`p-2.5 hover:${bgAccent} transition-colors ${textMuted} hover:${textPrimary} rounded-r-xl`} 
                                        title="Zoom In"
                                    >
                                        <ZoomIn size={16} />
                                    </button>
                                </div>
                                
                                <button 
                                    onClick={handleResetZoom} 
                                    title="Reset Zoom" 
                                    className={`p-2.5 border ${borderColor} rounded-xl hover:${bgAccent} transition-all duration-200 ${bgCard} ${textMuted} hover:${textPrimary} shadow-sm`}
                                >
                                    <RotateCcw size={16} />
                                </button>
                                
                                <button 
                                    onClick={resetPan} 
                                    title="Reset Position" 
                                    className={`p-2.5 border ${borderColor} rounded-xl hover:${bgAccent} transition-all duration-200 ${bgCard} ${textMuted} hover:${textPrimary} shadow-sm`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="m4 4 7.07 17.68 2.51-7.07 7.07-2.51L4 4Z"/>
                                        <path d="m13 13 6 6"/>
                                    </svg>
                                </button>
                                
                                <button 
                                    onClick={exportChart} 
                                    title="Export as PNG" 
                                    className={`p-2.5 border ${borderColor} rounded-xl hover:${bgAccent} transition-all duration-200 ${bgCard} ${textMuted} hover:${textPrimary} shadow-sm`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
                                        <polyline points="14 2 14 8 20 8"/>
                                        <circle cx="10" cy="13" r="2"/>
                                        <path d="m20 17-1.29-1.29a1 1 0 0 0-1.32-.08L13 19"/>
                                        <path d="m13 19-2.5-2.5"/>
                                    </svg>
                                </button>
                                
                                <button 
                                    onClick={toggleFullscreen} 
                                    className={`p-2.5 border ${borderColor} rounded-xl hover:${bgAccent} transition-all duration-200 ${bgCard} ${textMuted} hover:${textPrimary} shadow-sm`} 
                                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                                >
                                    {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Enhanced Filters Panel */}
                {showFilters && (
                    <div className={`${bgCard} border-b ${borderColor} shadow-md sticky ${isFullscreen ? 'top-0' : 'top-[73px]'} z-20 backdrop-blur-sm`}>
                        <div className="px-6 py-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className={`text-base font-semibold ${textHeader} flex items-center gap-2`}>
                                    <Filter size={18} />
                                    Filters
                                </h3>
                                <div className="flex items-center gap-3">
                                    <button 
                                        onClick={clearAllFilters} 
                                        className={`text-sm ${textMuted} hover:text-almet-sapphire dark:hover:text-almet-steel-blue transition-colors hover:underline font-medium`}
                                    >
                                        Clear All
                                    </button>
                                    <button 
                                        onClick={() => setShowFilters(false)} 
                                        className={`p-1.5 hover:${bgAccent} rounded-xl ${textMuted} hover:${textPrimary} transition-colors`}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <label htmlFor="department-filter" className={`block text-sm font-medium ${textSecondary} mb-2`}>Department</label>
                                    <select 
                                        id="department-filter" 
                                        value={filters.department} 
                                        onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))} 
                                        className={`w-full p-3 border ${borderColor} rounded-xl focus:ring-2 focus:ring-almet-sapphire/50 focus:border-almet-sapphire ${bgCard} ${textPrimary} shadow-sm`}
                                    >
                                        <option value="all">All Departments</option>
                                        {departments.map(dept => (<option key={dept} value={dept}>{dept}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="grade-filter" className={`block text-sm font-medium ${textSecondary} mb-2`}>Grade</label>
                                    <select 
                                        id="grade-filter" 
                                        value={filters.grade} 
                                        onChange={(e) => setFilters(prev => ({ ...prev, grade: e.target.value }))} 
                                        className={`w-full p-3 border ${borderColor} rounded-xl focus:ring-2 focus:ring-almet-sapphire/50 focus:border-almet-sapphire ${bgCard} ${textPrimary} shadow-sm`}
                                    >
                                        <option value="all">All Grades</option>
                                        {grades.map(grade => (<option key={grade} value={grade}>Grade {grade}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="location-filter" className={`block text-sm font-medium ${textSecondary} mb-2`}>Location</label>
                                    <select 
                                        id="location-filter" 
                                        value={filters.location} 
                                        onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))} 
                                        className={`w-full p-3 border ${borderColor} rounded-xl focus:ring-2 focus:ring-almet-sapphire/50 focus:border-almet-sapphire ${bgCard} ${textPrimary} shadow-sm`}
                                    >
                                        <option value="all">All Locations</option>
                                        {locations.map(location => (<option key={location} value={location}>{location}</option>))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Main Chart Container */}
                <div 
                    ref={scrollContainerRef} 
                    className="relative overflow-auto flex-grow"
                    style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                    onMouseDown={handleMouseDown}
                >
                    {viewMode === 'tree' ? (
                        <div 
                            ref={chartRef} 
                            className="p-12 w-full min-h-full" 
                            style={{ 
                                transform: `scale(${zoomLevel / 100})`, 
                                transformOrigin: 'top center', 
                                minWidth: 'max-content' 
                            }}
                        >
                            <div className="flex justify-center flex-col items-center">
                                {organizationTree.map(rootNode => (
                                    rootNode && rootNode.id ? 
                                    <TreeNode key={rootNode.id} node={rootNode} /> : null
                                ))}
                            </div>
                        </div>
                    ) : (
                        <GridView />
                    )}
                </div>

                {/* Modals */}
                <EmployeeDetailModal
                    employee={selectedEmployee}
                    onClose={() => setSelectedEmployee(null)}
                />
                
                {showLegend && (
                    <ColorLegend 
                        hierarchyColors={hierarchyColors} 
                        onClose={() => setShowLegend(false)} 
                        darkMode={darkMode} 
                    />
                )}
                
                {showAllReportsModal && (
                    <AllDirectReportsModal
                        reports={reportsToShow}
                        onClose={() => setShowAllReportsModal(false)}
                        onSelectEmployee={navigateToEmployee}
                        darkMode={darkMode}
                    />
                )}

                {/* Enhanced Styles */}
                <style jsx>{`
                    .line-clamp-2 { 
                        display: -webkit-box; 
                        -webkit-line-clamp: 2; 
                        -webkit-box-orient: vertical; 
                        overflow: hidden; 
                    }
                    
                    /* Enhanced Scrollbar Styling */
                    ::-webkit-scrollbar { 
                        width: 8px; 
                        height: 8px; 
                    }
                    ::-webkit-scrollbar-track { 
                        background: ${darkMode ? 'rgba(56, 88, 125, 0.1)' : 'rgba(156, 163, 175, 0.1)'}; 
                        border-radius: 6px; 
                    }
                    ::-webkit-scrollbar-thumb { 
                        background: ${darkMode ? 'rgba(122, 130, 154, 0.4)' : 'rgba(48, 83, 155, 0.4)'}; 
                        border-radius: 6px; 
                        border: 2px solid transparent;
                        background-clip: content-box;
                    }
                    ::-webkit-scrollbar-thumb:hover { 
                        background: ${darkMode ? 'rgba(122, 130, 154, 0.6)' : 'rgba(48, 83, 155, 0.6)'}; 
                        background-clip: content-box;
                    }
                    
                    /* Backdrop Blur */
                    .backdrop-blur-sm { 
                        backdrop-filter: blur(8px); 
                        -webkit-backdrop-filter: blur(8px); 
                    }
                    .backdrop-blur-md { 
                        backdrop-filter: blur(12px); 
                        -webkit-backdrop-filter: blur(12px); 
                    }
                    
                    /* Focus Styles */
                    .focus\\:ring-almet-sapphire\\/50:focus { 
                        --tw-ring-color: rgba(48, 83, 155, 0.5); 
                    }
                    .focus\\:border-almet-sapphire:focus { 
                        border-color: #30539b; 
                    }
                    
                    /* Custom Gradient Backgrounds */
                    .bg-gradient-to-br { 
                        background-image: linear-gradient(to bottom right, var(--tw-gradient-stops)); 
                    }
                    
                    /* Smooth Transitions */
                    * {
                        transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
                        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
                        transition-duration: 200ms;
                    }
                    
                    /* Enhanced Card Hover Effects */
                    .employee-card-action:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                    }
                    
                    /* Enhanced Button Animations */
                    button:active {
                        transform: scale(0.98);
                    }
                    
                    /* Improved Focus Indicators */
                    button:focus-visible, 
                    input:focus-visible, 
                    select:focus-visible {
                        outline: 2px solid #30539b;
                        outline-offset: 2px;
                    }
                `}</style>
            </div>
        </DashboardLayout>
    );
};

export default OrgChart;