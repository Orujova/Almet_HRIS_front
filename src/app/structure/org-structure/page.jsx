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
    const [showLegend, setShowLegend] = useState(false); // New state for legend visibility

    const chartRef = useRef(null); // Ref for the scalable content
    const containerRef = useRef(null); // Ref for the fullscreen container
    const scrollContainerRef = useRef(null); // Ref for the pannable/scrollable area

    // Panning states
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [scrollLeftStart, setScrollLeftStart] = useState(0);
    const [scrollTopStart, setScrollTopStart] = useState(0);

    const bgApp = darkMode ? "bg-almet-shark" : "bg-almet-mystic/30";
    const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
    const textHeader = darkMode ? "text-gray-100" : "text-gray-800";
    const textPrimary = darkMode ? "text-gray-200" : "text-gray-700";
    const textSecondary = darkMode ? "text-gray-400" : "text-gray-500";
    const textMuted = darkMode ? "text-almet-bali-hai/80" : "text-gray-400";
    const borderColor = darkMode ? "border-almet-comet/50" : "border-gray-200/80";
    const bgAccent = darkMode ? "bg-almet-comet/20" : "bg-almet-mystic/40";
    const shadowCard = darkMode ? "shadow-md" : "shadow";

    const hierarchyColors = {
        'VC': { primary: '#30539b', light: '#4e7db5', bg: darkMode ? 'rgba(48, 83, 155, 0.1)' : 'rgba(48, 83, 155, 0.05)' },
        'DIRECTOR': { primary: '#336fa5', light: '#4e7db5', bg: darkMode ? 'rgba(51, 111, 165, 0.1)' : 'rgba(51, 111, 165, 0.05)' },
        'HEAD OF DEPARTMENT': { primary: '#38587d', light: '#4f5772', bg: darkMode ? 'rgba(56, 88, 125, 0.1)' : 'rgba(56, 88, 125, 0.05)' },
        'SENIOR SPECIALIST': { primary: '#7a829a', light: '#90a0b9', bg: darkMode ? 'rgba(122, 130, 154, 0.1)' : 'rgba(122, 130, 154, 0.05)' },
        'SPECIALIST': { primary: '#4f5772', light: '#7a829a', bg: darkMode ? 'rgba(79, 87, 114, 0.1)' : 'rgba(79, 87, 114, 0.05)' },
        'JUNIOR SPECIALIST': { primary: '#9c9cb5', light: '#90a0b9', bg: darkMode ? 'rgba(156, 156, 181, 0.1)' : 'rgba(156, 156, 181, 0.05)' }
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

    const cardGap = 40; // Total vertical and horizontal spacing between elements
    const connectorThickness = 1.5; // Thickness of connection lines
    const halfCardGap = cardGap / 2; // Half of the vertical gap for line segments
    const cardVisualWidth = 260; // Max width of an employee card for horizontal line calculation (from CSS min-w-[220px] and max-w-[260px])

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
        // Loop until lineManagerId is null, meaning we reached the top (CEO)
        while (currentEmployee && currentEmployee.lineManagerId && flatEmployeeMap[currentEmployee.lineManagerId]) {
            currentEmployee = flatEmployeeMap[currentEmployee.lineManagerId];
            level++;
            // Safety break for potential infinite loops (e.g., circular references)
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
        
        // Create a flat map for quick lookups for CEO level calculation
        const flatMapForCeoLevel = {};
        validEmployeeData.forEach(emp => flatMapForCeoLevel[emp.id] = { ...emp });

        // Create initial hierarchy map to count subordinates
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

        // Re-create the final hierarchy map and root nodes with augmented data
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
    // Check if any filters are active for the filter icon dot
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
                scrollContainerRef.current.style.cursor = 'grab'; // Reset cursor
            }
        };

        // Attach listeners to window for better UX (can drag outside container)
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, startX, startY, scrollLeftStart, scrollTopStart]);

    const handleMouseDown = (e) => {
        if (e.button !== 0) return; // Only left click
        // Prevent dragging if clicking on an interactive element within the card
        if (e.target.closest('.employee-card-action') || e.target.closest('button')) { 
            return;
        }

        setIsDragging(true);
        setStartX(e.clientX);
        setStartY(e.clientY);
        setScrollLeftStart(scrollContainerRef.current.scrollLeft);
        setScrollTopStart(scrollContainerRef.current.scrollTop);
        scrollContainerRef.current.style.cursor = 'grabbing';
        e.preventDefault(); // Prevent default browser drag behaviors (e.g., text selection)
    };

    const resetPan = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollLeft = 0;
            scrollContainerRef.current.scrollTop = 0;
        }
    };

    const Avatar = ({ employee, size = 'md', variant = 'default' }) => {
        const sizes = {
            sm: 'w-8 h-8 text-xs',
            md: 'w-10 h-10 text-sm',
            lg: 'w-12 h-12 text-base',
        };
        const avatarSize = variant === 'grid' ? 'md' : (variant === 'detail' ? 'sm' : 'sm');

        if (!employee) return <div className={`${sizes[avatarSize]} rounded-lg bg-gray-300 animate-pulse`}></div>;
        const colors = getEmployeeColor(employee);
        return (
            <div 
                className={`${sizes[avatarSize]} rounded-lg flex items-center justify-center font-semibold text-white relative flex-shrink-0`}
                style={{ backgroundColor: colors.primary, boxShadow: `0 2px 4px ${colors.primary}50` }}
            >
                {employee.avatar || '?'}
            </div>
        );
    };

    const EmployeeCard = ({ employee, onClick, hasChildren, isExpanded, onToggleExpand, variant = 'tree' }) => {
        if (!employee) return null;
        const directReportsCount = hierarchyMap[employee.id]?.children?.length || 0;
        const colors = getEmployeeColor(employee);

        const isDetailVariant = variant === 'detail';
        const isGridVariant = variant === 'grid';
        const isTreeVariant = variant === 'tree';

        const cardBaseStyle = `${bgCard} border ${borderColor} rounded-lg transition-all duration-200 overflow-hidden`;
        // Added 'employee-card-action' class for event delegation in panning
        const interactiveStyle = onClick ? `cursor-pointer hover:border-almet-sapphire/70 dark:hover:border-almet-sapphire ${shadowCard} hover:shadow-lg employee-card-action` : "";
        
        let cardPadding = 'p-3';
        let minCardWidth = 'min-w-[200px]';

        if (isGridVariant) {
            cardPadding = 'p-4';
            minCardWidth = 'min-w-[240px]';
        } else if (isTreeVariant) {
            minCardWidth = 'min-w-[220px]'; // Match cardVisualWidth more closely if possible, or ensure cardVisualWidth is max-w
        }

        if (isDetailVariant) {
            return (
                <div
                    className={`${cardBaseStyle} ${interactiveStyle} ${cardPadding} flex items-center gap-3 ${minCardWidth} max-w-xs`}
                    style={{ borderLeft: `3px solid ${colors.primary}`}}
                    onClick={onClick}
                >
                    <Avatar employee={employee} variant="detail" />
                    <div className="flex-1 min-w-0">
                        <h4 className={`font-medium ${textPrimary} text-sm truncate`} title={employee.name}>{employee.name}</h4>
                        <p className={`${textSecondary} text-xs truncate`} title={employee.title}>{employee.title}</p>
                    </div>
                </div>
            );
        }

        return (
            <div className="relative group">
                <div
                    className={`${cardBaseStyle} ${interactiveStyle} ${cardPadding} ${minCardWidth} max-w-[260px] flex flex-col`}
                    style={{ borderLeft: `3px solid ${colors.primary}` }}
                    onClick={onClick}
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Avatar employee={employee} variant={isGridVariant ? 'grid' : 'tree'} />
                        <div className="flex-1 min-w-0">
                            <h3 className={`font-medium ${textPrimary} ${isGridVariant ? 'text-base' : 'text-sm'} leading-tight truncate`} title={employee.name}>{employee.name}</h3>
                            <p className={`${textSecondary} text-xs line-clamp-2 leading-snug`} title={employee.title}>{employee.title}</p>
                        </div>
                    </div>
                    
                    {isGridVariant && (
                         <div className="flex items-center gap-1.5 flex-wrap my-1.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium text-white" style={{ backgroundColor: colors.primary }}>G{employee.grade}</span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs ${bgAccent} ${textPrimary}`}>{employee.department}</span>
                        </div>
                    )}

                    <div className={`mt-auto pt-2 border-t ${borderColor} space-y-1 text-xs`}>
                        <div className={`flex items-center ${textMuted}`}>
                            <MapPin className="w-3 h-3 mr-1.5 flex-shrink-0" style={{ color: colors.light }} />
                            <span className="truncate" title={employee.location}>{employee.location}</span>
                        </div>
                        {directReportsCount > 0 && (
                            <div className="flex items-center font-medium" style={{ color: colors.primary }}>
                                <Users className="w-3 h-3 mr-1.5 flex-shrink-0" />
                                <span>{directReportsCount} Direct Report{directReportsCount !== 1 ? 's' : ''}</span>
                            </div>
                        )}
                        {isGridVariant && employee.totalSubordinates > directReportsCount && (
                            <div className="flex items-center" style={{ color: colors.light }}>
                                <UsersRound className="w-3 h-3 mr-1.5 flex-shrink-0" />
                                <span>{employee.totalSubordinates} Total Subordinate{employee.totalSubordinates !== 1 ? 's' : ''}</span>
                            </div>
                        )}
                         {isGridVariant && (
                            <div className="flex items-center" style={{ color: colors.light }}>
                                <Target className="w-3 h-3 mr-1.5 flex-shrink-0" />
                                <span>Level to CEO: {employee.levelToCeo >= 0 ? employee.levelToCeo : 'N/A'}</span>
                            </div>
                         )}
                    </div>
                </div>
                {hasChildren && onToggleExpand && isTreeVariant && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleExpand(); }}
                        className={`
                            employee-card-action // Important for panning logic
                            absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 z-20 
                            w-5 h-5 rounded-full text-white
                            flex items-center justify-center hover:scale-110 transition-transform duration-200
                            border-2 ${darkMode ? 'border-almet-cloud-burst' : 'border-white'}
                        `}
                        style={{ backgroundColor: colors.primary, boxShadow: `0 1px 3px ${colors.primary}70` }}
                        aria-label={isExpanded ? "Collapse node" : "Expand node"}
                    >
                        {isExpanded ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    </button>
                )}
            </div>
        );
    };
    
    // --- REVISED TREENODE COMPONENT ---
    const TreeNode = ({ node, level = 0 }) => {
        if (!node || !node.id) return null;
        const nodeChildren = hierarchyMap[node.id]?.children || [];
        const hasChildren = nodeChildren.length > 0;
        const isExpanded = expandedNodes.has(node.id);
        const colors = getEmployeeColor(node);

        // Calculate horizontal line width only if there are multiple children
        const horizontalLineWidth = (nodeChildren.length > 1 ? (nodeChildren.length - 1) * (cardVisualWidth + cardGap) : 0);

        return (
            <div className="flex flex-col items-center relative">
                {/* 1. Incoming Vertical Line (from parent's horizontal line) */}
                {/* This line fills the space above the card. It is positioned at top:0 of this TreeNode's div. */}
                {level > 0 && (
                    <div 
                        className="absolute top-0 left-1/2 transform -translate-x-px"
                        style={{
                            height: `${halfCardGap}px`, // This line segment connects to the center of the card
                            width: `${connectorThickness}px`,
                            backgroundColor: colors.primary,
                            opacity: 0.7,
                            zIndex: 1 // Ensure lines are behind cards
                        }}
                    ></div>
                )}

                {/* 2. Employee Card */}
                <EmployeeCard
                    employee={node}
                    onClick={() => augmentedFlatMap[node.id] ? setSelectedEmployee(augmentedFlatMap[node.id]) : null}
                    hasChildren={hasChildren}
                    isExpanded={isExpanded}
                    onToggleExpand={() => toggleNode(node.id)}
                    variant="tree"
                />

                {/* 3. Outgoing lines (vertical to horizontal, then horizontal, then vertical to children) */}
                {hasChildren && isExpanded && (
                    <div 
                        className="relative flex flex-col items-center w-full"
                        // This margin creates the space *below* the current card and *above* the horizontal line.
                        style={{ marginTop: `${halfCardGap}px` }} 
                    >
                        {/* Vertical line from current card's bottom to horizontal line */}
                        <div 
                            className="absolute top-0 left-1/2 transform -translate-x-px"
                            style={{
                                height: `${halfCardGap}px`,
                                width: `${connectorThickness}px`,
                                backgroundColor: colors.primary,
                                opacity: 0.7,
                                zIndex: 1
                            }}
                        ></div>

                        {/* Horizontal line connecting children */}
                        {nodeChildren.length > 0 && ( // Show horizontal line even for 1 child, for visual consistency with vertical
                            <div 
                                className="absolute left-1/2 transform -translate-x-1/2"
                                style={{
                                    top: `${halfCardGap}px`, // This positions it at the end of the vertical line segment from the parent
                                    height: `${connectorThickness}px`,
                                    backgroundColor: colors.primary,
                                    opacity: 0.7,
                                    width: `${Math.max(connectorThickness, horizontalLineWidth)}px`, // Ensure minimum width for single child
                                    zIndex: 1
                                }}
                            ></div>
                        )}
                        
                        {/* Children nodes container */}
                        <div 
                            className="flex justify-center items-start" 
                            // This padding creates the space *below* the horizontal line and *above* the children cards.
                            style={{ 
                                paddingTop: `${halfCardGap}px`, 
                                gap: `${cardGap}px`, // Horizontal gap between children
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-4">
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
        const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
        const textHeader = darkMode ? "text-gray-100" : "text-gray-800";
        const textMuted = darkMode ? "text-almet-bali-hai/80" : "text-gray-400";
        const borderColor = darkMode ? "border-almet-comet/50" : "border-gray-200/80";

        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 z-50">
                <div className={`${bgCard} rounded-lg shadow-xl w-full max-w-lg flex flex-col border ${borderColor} max-h-[85vh]`}>
                    <div className={`flex items-center justify-between p-4 border-b ${borderColor} sticky top-0 ${bgCard} rounded-t-lg z-10`}>
                        <h2 className={`text-lg font-semibold ${textHeader}`}>All Direct Reports ({reports.length})</h2>
                        <button onClick={onClose} className={`${textMuted} hover:${textHeader} p-1.5 hover:bg-almet-sapphire/20 rounded-full transition-colors`}>
                            <X size={20} aria-label="Close direct reports modal"/>
                        </button>
                    </div>
                    <div className="p-4 space-y-2 overflow-y-auto">
                        {reports.map(report => (
                            <EmployeeCard
                                key={report.id}
                                employee={report}
                                onClick={() => {
                                    onSelectEmployee(report.id);
                                    onClose(); // Close this modal after selecting
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

        // Hierarchy path for breadcrumbs
        const getHierarchyPath = (empId, flatMap) => {
            const path = [];
            let current = flatMap[empId];
            while(current) {
                path.unshift(current);
                if (!current.lineManagerId) break; // Reached top-level
                current = flatMap[current.lineManagerId];
            }
            return path;
        };
        const hierarchyPath = getHierarchyPath(detailedEmployee.id, augmentedFlatMap);


        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 z-50 transition-opacity duration-200 ease-in-out">
                <div className={`${bgCard} rounded-lg ${shadowCard} max-w-2xl w-full max-h-[85vh] flex flex-col border ${borderColor}`}>
                    <div className={`flex items-center justify-between p-4 border-b ${borderColor} sticky top-0 ${bgCard} rounded-t-lg z-10`}>
                        <div className="flex items-center gap-3">
                            <Avatar employee={detailedEmployee} size="lg" />
                            <div>
                                <h2 className={`text-lg font-semibold ${textHeader}`}>{detailedEmployee.name}</h2>
                                <p className={`${textSecondary} text-sm`}>{detailedEmployee.title}</p>
                            </div>
                        </div>
                        <button onClick={onClose} className={`${textMuted} hover:${textPrimary} p-1.5 hover:${bgAccent} rounded-full transition-colors`}>
                            <X size={20} aria-label="Close modal"/>
                        </button>
                    </div>

                    <div ref={detailModalRef} className="p-4 overflow-y-auto flex-grow space-y-4">
                        {/* Hierarchy Path / Breadcrumbs */}
                        {hierarchyPath.length > 1 && (
                            <div className={`text-xs ${textMuted} mb-3 border-b ${borderColor} pb-2`}>
                                <h4 className={`font-semibold ${textSecondary} mb-1.5 uppercase tracking-wider`}>Hierarchy Path</h4>
                                <div className="flex flex-wrap items-center gap-1">
                                    {hierarchyPath.map((emp, index) => (
                                        <React.Fragment key={emp.id}>
                                            <span 
                                                className={`cursor-pointer hover:underline ${emp.id === detailedEmployee.id ? textPrimary : textMuted}`}
                                                onClick={() => navigateToEmployee(emp.id)}
                                            >
                                                {emp.name.split(' ')[0]}
                                            </span>
                                            {index < hierarchyPath.length - 1 && <span className="mx-0.5"></span>}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <DetailItem icon={<Building2 />} label="Department" value={detailedEmployee.department} colors={colors} />
                            <DetailItem icon={<Layers />} label="Unit" value={detailedEmployee.unit} colors={colors} />
                            <DetailItem icon={<Award />} label="Grade" value={`G${detailedEmployee.grade}`} colors={colors} />
                            <DetailItem icon={<Briefcase />} label="Position Group" value={detailedEmployee.positionGroup} colors={colors} />
                            <DetailItem icon={<MapPin />} label="Location" value={detailedEmployee.location} colors={colors} />
                            <DetailItem icon={<Puzzle />} label="Business Function" value={detailedEmployee.businessFunction} colors={colors} />
                        </div>
                        
                        <div className="pt-3 border-t ${borderColor}">
                            <h4 className={`text-xs font-semibold ${textSecondary} mb-1.5 uppercase tracking-wider`}>Team & Network</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                {detailedEmployee.levelToCeo >= 0 && <DetailItem icon={<Target />} label="Level to CEO" value={detailedEmployee.levelToCeo.toString()} colors={colors} />}
                                {directReports.length > 0 && <DetailItem icon={<Users />} label="Direct Reports" value={directReports.length.toString()} colors={colors} />}
                                {detailedEmployee.totalSubordinates > 0 && <DetailItem icon={<UsersRound />} label="Total Subordinates" value={detailedEmployee.totalSubordinates.toString()} colors={colors} />}
                                {detailedEmployee.colleaguesInUnitCount >= 0 && <DetailItem icon={<Building2 />} label="Colleagues in Unit" value={detailedEmployee.colleaguesInUnitCount.toString()} colors={colors} />}
                                {detailedEmployee.colleaguesInBusinessFunctionCount >= 0 && <DetailItem icon={<Briefcase />} label="Colleagues in Business Function" value={detailedEmployee.colleaguesInBusinessFunctionCount.toString()} colors={colors} />}
                            </div>
                        </div>
                        
                        {manager && (
                            <div className="pt-3 border-t ${borderColor}">
                                <h4 className={`text-xs font-semibold ${textSecondary} mb-2 uppercase tracking-wider`}>Reports To</h4>
                                <EmployeeCard 
                                    employee={manager} 
                                    onClick={() => navigateToEmployee(manager.id)}
                                    variant="detail"
                                />
                            </div>
                        )}
                        
                        {directReports.length > 0 && (
                            <div className="pt-3 border-t ${borderColor}">
                                <h4 className={`text-xs font-semibold ${textSecondary} mb-2 uppercase tracking-wider`}>Direct Reports ({directReports.length})</h4>
                                <div className="space-y-2">
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
                                            className={`text-xs ${textMuted} hover:text-almet-sapphire dark:hover:text-almet-steel-blue transition-colors hover:underline`}
                                        >
                                            ...and {directReports.length - 3} more. View All
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
        <div className="flex items-center gap-2">
            <div className={`flex-shrink-0 w-7 h-7 rounded-md flex items-center justify-center`} style={{ backgroundColor: colors.bg }}>
                {React.cloneElement(icon, { className: "w-3.5 h-3.5", style: { color: colors.primary } })}
            </div>
            <div className="min-w-0">
                <p className={`text-xs ${textMuted} truncate`}>{label}</p>
                <p className={`${textPrimary} font-medium text-xs truncate`} title={value || 'N/A'}>{value || 'N/A'}</p>
            </div>
        </div>
    );

    const ColorLegend = ({ hierarchyColors, onClose, darkMode }) => {
        const bgCard = darkMode ? "bg-almet-cloud-burst" : "bg-white";
        const textHeader = darkMode ? "text-gray-100" : "text-gray-800";
        const textPrimary = darkMode ? "text-gray-200" : "text-gray-700";
        const textMuted = darkMode ? "text-almet-bali-hai/80" : "text-gray-400";
        const borderColor = darkMode ? "border-almet-comet/50" : "border-gray-200/80";

        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 z-50">
                <div className={`${bgCard} rounded-lg shadow-xl w-full max-w-sm flex flex-col border ${borderColor}`}>
                    <div className={`flex items-center justify-between p-4 border-b ${borderColor} sticky top-0 ${bgCard} rounded-t-lg z-10`}>
                        <h2 className={`text-lg font-semibold ${textHeader}`}>Color Legend</h2>
                        <button onClick={onClose} className={`${textMuted} hover:${textHeader} p-1.5 hover:bg-almet-sapphire/20 rounded-full transition-colors`}>
                            <X size={20} aria-label="Close legend"/>
                        </button>
                    </div>
                    <div className="p-4 space-y-2 overflow-y-auto">
                        {Object.entries(hierarchyColors).map(([group, colors]) => (
                            <div key={group} className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-md flex-shrink-0" style={{ backgroundColor: colors.primary }}></div>
                                <span className={`${textPrimary} text-sm font-medium`}>{group.replace(/([A-Z])/g, ' $1').trim()}</span>
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

        // Temporarily adjust scale for export for better resolution
        const originalTransform = chartRef.current.style.transform;
        const originalTransformOrigin = chartRef.current.style.transformOrigin;
        const currentScrollLeft = scrollContainerRef.current.scrollLeft;
        const currentScrollTop = scrollContainerRef.current.scrollTop;

        // Reset scroll and zoom for full capture
        scrollContainerRef.current.scrollLeft = 0;
        scrollContainerRef.current.scrollTop = 0;
        chartRef.current.style.transform = 'scale(1)'; // Render at 100% for capture
        chartRef.current.style.transformOrigin = 'top left';

        // Wait for re-render if any
        await new Promise(resolve => setTimeout(resolve, 50)); 

        try {
            const domToImage = (await import('dom-to-image')).default;
            const dataUrl = await domToImage.toPng(chartRef.current, {
                quality: 0.95,
                // Capture the entire scrollable content area
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
            // Restore original transform and scroll properties
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
                 <div className={`${bgCard} shadow border-b ${borderColor} sticky top-0 z-30`}>
                    <div className="px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 ${darkMode ? 'bg-almet-sapphire/80' : 'bg-almet-sapphire'} rounded-md flex items-center justify-center shadow-sm`}>
                                    <Building2 className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h1 className={`text-md font-semibold ${textHeader}`}>Organizational Chart</h1>
                                    <p className={`text-xs ${textSecondary}`}>Total Employees: {augmentedDataList.length} {filteredEmployees.length !== augmentedDataList.length && `(Filtered: ${filteredEmployees.length})`}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <Search className={`absolute left-2.5 top-1/2 transform -translate-y-1/2 ${textMuted} w-3.5 h-3.5 pointer-events-none`} />
                                    <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`pl-8 pr-2.5 py-1.5 border ${borderColor} rounded-md focus:ring-1 focus:ring-almet-sapphire focus:border-almet-sapphire w-44 ${bgCard} ${textPrimary} text-xs transition-all duration-200 focus:w-52`} />
                                </div>
                                <div className={`flex rounded-md border ${borderColor} ${bgCard} p-0.5 shadow-sm`}>
                                    <button onClick={() => setViewMode('tree')} title="Tree View" className={`px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${viewMode === 'tree' ? 'bg-almet-sapphire text-white' : `${textMuted} hover:${textPrimary}`}`}><TreePine size={14} />Tree</button>
                                    <button onClick={() => setViewMode('grid')} title="Grid View" className={`px-2 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${viewMode === 'grid' ? 'bg-almet-sapphire text-white' : `${textMuted} hover:${textPrimary}`}`}><Grid size={14} />Grid</button>
                                </div>
                                <button onClick={() => setShowFilters(!showFilters)} title="Filters" className={`p-1.5 border ${borderColor} rounded-md hover:${bgAccent} transition-colors ${bgCard} ${textPrimary} text-xs flex items-center shadow-sm relative`}>
                                    <Filter size={14} />
                                    {areFiltersActive && (<div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-almet-sapphire rounded-full border border-white dark:border-almet-cloud-burst"></div>)}
                                </button>
                                <button onClick={() => setShowLegend(true)} title="Color Legend" className={`p-1.5 border ${borderColor} rounded-md hover:${bgAccent} transition-colors ${bgCard} ${textMuted} hover:${textPrimary} shadow-sm`}>
                                    <Info size={14} />
                                </button>
                                <div className={`flex items-center border ${borderColor} rounded-md ${bgCard} shadow-sm`}>
                                    <button onClick={handleZoomOut} className={`p-1.5 hover:${bgAccent} transition-colors ${textMuted} hover:${textPrimary}`} title="Zoom Out"><ZoomOut size={14} /></button>
                                    <span className={`px-2 text-2xs ${textMuted} min-w-[2.5rem] text-center border-x ${borderColor}`}>{zoomLevel}%</span>
                                    <button onClick={handleZoomIn} className={`p-1.5 hover:${bgAccent} transition-colors ${textMuted} hover:${textPrimary}`} title="Zoom In"><ZoomIn size={14} /></button>
                                </div>
                                <button onClick={handleResetZoom} title="Reset Zoom" className={`p-1.5 border ${borderColor} rounded-md hover:${bgAccent} transition-colors ${bgCard} ${textMuted} hover:${textPrimary} shadow-sm`}>
                                    <RotateCcw size={14} />
                                </button>
                                <button onClick={resetPan} title="Reset Pan" className={`p-1.5 border ${borderColor} rounded-md hover:${bgAccent} transition-colors ${bgCard} ${textMuted} hover:${textPrimary} shadow-sm`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mouse-pointer-2"><path d="m4 4 7.07 17.68 2.51-7.07 7.07-2.51L4 4Z"/><path d="m13 13 6 6"/></svg> {/* Better icon for reset pan/center */}
                                </button>
                                <button onClick={exportChart} title="Export as PNG" className={`p-1.5 border ${borderColor} rounded-md hover:${bgAccent} transition-colors ${bgCard} ${textMuted} hover:${textPrimary} shadow-sm`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-file-image"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><circle cx="10" cy="13" r="2"/><path d="m20 17-1.29-1.29a1 1 0 0 0-1.32-.08L13 19"/><path d="m13 19-2.5-2.5"/></svg>
                                </button>
                                <button onClick={toggleFullscreen} className={`p-1.5 border ${borderColor} rounded-md hover:${bgAccent} transition-colors ${bgCard} ${textMuted} hover:${textPrimary} shadow-sm`} title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>{isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}</button>
                            </div>
                        </div>
                    </div>
                </div>

                {showFilters && (
                    <div className={`${bgCard} border-b ${borderColor} shadow sticky ${isFullscreen ? 'top-0' : 'top-[53px]'} z-20`}>
                        <div className="px-3 py-2.5">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className={`text-sm font-medium ${textHeader}`}>Filters</h3>
                                <div className="flex items-center gap-1.5">
                                    <button onClick={clearAllFilters} className={`text-xs ${textMuted} hover:text-almet-sapphire dark:hover:text-almet-steel-blue transition-colors hover:underline`}>Clear All</button>
                                    <button onClick={() => setShowFilters(false)} className={`p-1 hover:${bgAccent} rounded-full ${textMuted} hover:${textPrimary} transition-colors`}><X size={14} /></button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                                <div>
                                    <label htmlFor="department-filter" className={`block text-2xs font-medium ${textSecondary} mb-0.5`}>Department</label>
                                    <select id="department-filter" value={filters.department} onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))} className={`w-full p-1.5 border ${borderColor} rounded-md focus:ring-1 focus:ring-almet-sapphire focus:border-almet-sapphire ${bgCard} ${textPrimary}`}>
                                        <option value="all">All</option>{departments.map(dept => (<option key={dept} value={dept}>{dept}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="grade-filter" className={`block text-2xs font-medium ${textSecondary} mb-0.5`}>Grade</label>
                                    <select id="grade-filter" value={filters.grade} onChange={(e) => setFilters(prev => ({ ...prev, grade: e.target.value }))} className={`w-full p-1.5 border ${borderColor} rounded-md focus:ring-1 focus:ring-almet-sapphire focus:border-almet-sapphire ${bgCard} ${textPrimary}`}>
                                        <option value="all">All</option>{grades.map(grade => (<option key={grade} value={grade}>G{grade}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="location-filter" className={`block text-2xs font-medium ${textSecondary} mb-0.5`}>Location</label>
                                    <select id="location-filter" value={filters.location} onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))} className={`w-full p-1.5 border ${borderColor} rounded-md focus:ring-1 focus:ring-almet-sapphire focus:border-almet-sapphire ${bgCard} ${textPrimary}`}>
                                        <option value="all">All</option>{locations.map(location => (<option key={location} value={location}>{location}</option>))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div 
                    ref={scrollContainerRef} 
                    className="relative overflow-auto flex-grow"
                    style={{ cursor: isDragging ? 'grabbing' : 'grab' }} // Set cursor based on dragging state
                    onMouseDown={handleMouseDown}
                >
                    {viewMode === 'tree' ? (
                        <div ref={chartRef} className="p-8 md:p-12 w-full min-h-full" style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center', minWidth: 'max-content' }}>
                            <div className="flex justify-center flex-col items-center">
                                {organizationTree.map(rootNode => (rootNode && rootNode.id ? <TreeNode key={rootNode.id} node={rootNode} /> : null))}
                            </div>
                        </div>
                    ) : <GridView />}
                </div>

                <EmployeeDetailModal
                    employee={selectedEmployee}
                    onClose={() => setSelectedEmployee(null)}
                />
                
                {showLegend && <ColorLegend hierarchyColors={hierarchyColors} onClose={() => setShowLegend(false)} darkMode={darkMode} />}
                {showAllReportsModal && (
                    <AllDirectReportsModal
                        reports={reportsToShow}
                        onClose={() => setShowAllReportsModal(false)}
                        onSelectEmployee={navigateToEmployee}
                        darkMode={darkMode}
                    />
                )}

                <style jsx>{`
                  .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                  ::-webkit-scrollbar { width: 6px; height: 6px; }
                  ::-webkit-scrollbar-track { background: ${darkMode ? 'rgba(79, 87, 114, 0.05)' : 'rgba(144, 160, 185, 0.03)'}; border-radius: 3px; }
                  ::-webkit-scrollbar-thumb { background: ${darkMode ? 'rgba(122, 130, 154, 0.3)' : 'rgba(48, 83, 155, 0.3)'}; border-radius: 3px; }
                  ::-webkit-scrollbar-thumb:hover { background: ${darkMode ? 'rgba(122, 130, 154, 0.5)' : 'rgba(48, 83, 155, 0.5)'}; }
                  .backdrop-blur-sm { backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
                  .focus\\:ring-almet-sapphire:focus { --tw-ring-color: rgba(48, 83, 155, 0.5); }
                  .focus\\:border-almet-sapphire:focus { border-color: #30539b; }
                  .text-2xs { font-size: 0.625rem; line-height: 0.875rem; }
                `}</style>
            </div>
        </DashboardLayout>
    );
};

export default OrgChart;