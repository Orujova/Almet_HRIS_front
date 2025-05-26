'use client'
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    ChevronDown, ChevronRight, Users, Building2, Award, User, Search, Phone, Mail, MapPin,
    Briefcase, Crown, Target, Layers, Filter, TreePine, Maximize2, Minimize2, Plus, Minus,
    ZoomIn, ZoomOut, RotateCcw, X, Grid, UsersRound, Archive, Puzzle, Link2
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
    const chartRef = useRef(null);
    const containerRef = useRef(null);

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

    // cardGap-i burada təyin edirik ki, həm OrgChart-da, həm də TreeNode-da istifadə olunsun
    const cardGap = 40; 

    const getHierarchyMap = (employees) => {
        const map = {};
        if (!employees || !Array.isArray(employees)) {
            // console.error("getHierarchyMap: 'employees' is not a valid array", employees);
            return map;
        }
        employees.forEach(emp => {
            if (emp && emp.id != null) {
                map[emp.id] = { ...emp, children: [] };
            } else {
                // console.warn("getHierarchyMap: Skipping employee due to missing id or invalid emp object (first loop):", emp);
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
                // console.error("getLevelToCeoRecursive: Potential infinite loop detected for employeeId:", employeeId);
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
        // console.log("--- Recalculating augmentedAndMappedData ---");

        const validEmployeeData = employeeData.filter(emp => emp && emp.id != null);
        // console.log("validEmployeeData count:", validEmployeeData.length);
        // validEmployeeData.forEach((emp, index) => console.log(`validEmployeeData[${index}].id:`, emp.id));

        const flatMapForCeoLevel = {};
        validEmployeeData.forEach(emp => flatMapForCeoLevel[emp.id] = { ...emp });

        const hierarchyMapForSubordinates = getHierarchyMap(validEmployeeData);
        // console.log("hierarchyMapForSubordinates keys:", Object.keys(hierarchyMapForSubordinates));
        // if (hierarchyMapForSubordinates.hasOwnProperty('HLD22')) {
        //     console.log("HLD22 IS in hierarchyMapForSubordinates.");
        // } else {
        //     console.warn("HLD22 IS NOT in hierarchyMapForSubordinates.");
        // }

        const augmented = validEmployeeData.map((emp, index) => {
            // console.log(`Processing emp index ${index}, id: '${emp.id}'`);
            if (!hierarchyMapForSubordinates.hasOwnProperty(emp.id)) {
                console.error(`CRITICAL ERROR: emp.id '${emp.id}' (type: ${typeof emp.id}) NOT FOUND as a key in hierarchyMapForSubordinates.`);
                // console.log("All keys in hierarchyMapForSubordinates:", Object.keys(hierarchyMapForSubordinates));
                // try {
                //     console.log("Problematic emp object:", JSON.parse(JSON.stringify(emp)));
                // } catch (e) {
                //     console.log("Problematic emp object (could not stringify):", emp);
                // }
                return { 
                    ...emp, 
                    totalSubordinates: 0, 
                    levelToCeo: -1, 
                    colleaguesInUnitCount: 0, 
                    colleaguesInBusinessFunctionCount: 0,
                    _error: `ID '${emp.id}' not in map` 
                };
            }
            
            const employeeNodeInHierarchy = hierarchyMapForSubordinates[emp.id];
            
            if (!employeeNodeInHierarchy) { // Bu, yuxarıdakı if-ə görə baş verməməlidir
                 console.warn(`Secondary check: employeeNodeInHierarchy is undefined for emp.id '${emp.id}', though hasOwnProperty was true. This is unexpected.`);
            }

            return {
                ...emp,
                totalSubordinates: employeeNodeInHierarchy ? countAllSubordinatesRecursive(employeeNodeInHierarchy, hierarchyMapForSubordinates) : 0,
                levelToCeo: getLevelToCeoRecursive(emp.id, flatMapForCeoLevel),
                colleaguesInUnitCount: getColleaguesInUnitCount(emp, validEmployeeData),
                colleaguesInBusinessFunctionCount: getColleaguesInBusinessFunctionCount(emp, validEmployeeData),
            };
        });

        const erroredAugmentedItems = augmented.filter(item => item._error);
        if (erroredAugmentedItems.length > 0) {
            // console.warn("Some items had errors during augmentation:", erroredAugmentedItems);
        }

        const finalHierarchyMap = getHierarchyMap(augmented.filter(item => !item._error));
        const finalRoots = augmented.filter(item => !item._error && (!item.lineManagerId || !finalHierarchyMap[item.lineManagerId]));
        
        const augmentedFlatMap = {};
        augmented.filter(item => !item._error).forEach(emp => augmentedFlatMap[emp.id] = emp);

        return {
            augmentedDataList: augmented.filter(item => !item._error),
            hierarchyMap: finalHierarchyMap,
            roots: finalRoots.map(r => finalHierarchyMap[r.id]).filter(Boolean),
            augmentedFlatMap: augmentedFlatMap,
        };
    }, [employeeData]); // employeeData-nı asılılıq kimi saxlayırıq

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
        const directReportsCount = employee.children ? employee.children.length : (hierarchyMap[employee.id]?.children?.length || 0) ;
        const colors = getEmployeeColor(employee);

        const isDetailVariant = variant === 'detail';
        const isGridVariant = variant === 'grid';
        const isTreeVariant = variant === 'tree';

        const cardBaseStyle = `${bgCard} border ${borderColor} rounded-lg transition-all duration-200 overflow-hidden`;
        const interactiveStyle = onClick ? `cursor-pointer hover:border-almet-sapphire/70 dark:hover:border-almet-sapphire ${shadowCard} hover:shadow-lg` : "";
        
        let cardPadding = 'p-3';
        let minCardWidth = 'min-w-[200px]';

        if (isGridVariant) {
            cardPadding = 'p-4';
            minCardWidth = 'min-w-[240px]';
        } else if (isTreeVariant) {
            minCardWidth = 'min-w-[220px]';
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
    
    const TreeNode = ({ node, level = 0 }) => {
        if (!node || !node.id) return null;
        const hasChildren = node.children && node.children.length > 0;
        const isExpanded = expandedNodes.has(node.id);
        const nodeChildren = node.children || [];
        const colors = getEmployeeColor(node);
        const verticalConnectorLength = '15px';
        const cardApproxWidth = 230; 
        // cardGap yuxarıda OrgChart scope-unda təyin edilib

        return (
            <div className="relative">
                {level > 0 && (
                    <div className="absolute left-1/2 transform -translate-x-px z-0" style={{ top: `-${parseInt(verticalConnectorLength) + 5}px`}}>
                        <div style={{ width: '1.5px', height: verticalConnectorLength, backgroundColor: colors.primary, opacity: 0.7 }}></div>
                    </div>
                )}
                <div className="flex flex-col items-center" style={{ marginBottom: `${cardGap}px`}}>
                    <EmployeeCard
                        employee={node}
                        onClick={() => augmentedFlatMap[node.id] ? setSelectedEmployee(augmentedFlatMap[node.id]) : null}
                        hasChildren={hasChildren}
                        isExpanded={isExpanded}
                        onToggleExpand={() => toggleNode(node.id)}
                        variant="tree"
                    />
                </div>
                {hasChildren && isExpanded && (
                    <div className="relative">
                        <div className="absolute left-1/2 transform -translate-x-px z-0" style={{ top: `-${cardGap - 5}px`}}>
                            <div style={{ width: '1.5px', height: `${cardGap - 10}px`, backgroundColor: colors.primary, opacity: 0.7 }}></div>
                        </div>
                        {nodeChildren.length > 1 && (
                            <div className="absolute left-1/2 transform -translate-x-1/2 z-0" style={{ top: '-5px' }}>
                                <div style={{ height: '1.5px', backgroundColor: colors.primary, opacity: 0.7, width: `${(nodeChildren.length - 1) * (cardApproxWidth + cardGap)}px` }}></div>
                            </div>
                        )}
                        <div style={{ paddingTop: `${cardGap - 10}px`}}>
                            <div className={`flex justify-center items-start`} style={{gap: `${cardGap}px`}}>
                                {nodeChildren.map((childNode) => (
                                    <div key={childNode.id} className="relative">
                                        <TreeNode node={childNode} level={level + 1} />
                                    </div>
                                ))}
                            </div>
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

    const EmployeeDetailModal = ({ employee: currentSelectedEmployee, onClose }) => {
        const detailModalRef = useRef(null);
        useEffect(() => { if (detailModalRef.current) detailModalRef.current.scrollTop = 0; }, [currentSelectedEmployee]);

        if (!currentSelectedEmployee || !augmentedFlatMap[currentSelectedEmployee.id]) return null;
        
        const detailedEmployee = augmentedFlatMap[currentSelectedEmployee.id];
        const directReports = hierarchyMap[detailedEmployee.id]?.children || [];
        const manager = detailedEmployee.lineManagerId ? augmentedFlatMap[detailedEmployee.lineManagerId] : null;
        const colors = getEmployeeColor(detailedEmployee);

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
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <DetailItem icon={<Building2 />} label="Department" value={detailedEmployee.department} colors={colors} />
                            <DetailItem icon={<Layers />} label="Unit" value={detailedEmployee.unit} colors={colors} />
                            <DetailItem icon={<Award />} label="Grade" value={`G${detailedEmployee.grade}`} colors={colors} />
                            <DetailItem icon={<Briefcase />} label="Position Group" value={detailedEmployee.positionGroup} colors={colors} />
                            <DetailItem icon={<MapPin />} label="Location" value={detailedEmployee.location} colors={colors} />
                            <DetailItem icon={<Puzzle />} label="Business Function" value={detailedEmployee.businessFunction} colors={colors} />
                        </div>
                        
                         <div className="pt-3 border-t ${borderColor}">
                             <h4 className={`text-xs font-semibold ${textSecondary} mb-1.5 uppercase tracking-wider`}>Contact & Hierarchy</h4>
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                <DetailItem icon={<Phone />} label="Phone" value={detailedEmployee.phone} colors={colors} />
                                <DetailItem icon={<Mail />} label="Email" value={detailedEmployee.email} colors={colors} />
                                <DetailItem icon={<Target />} label="Level to CEO" value={detailedEmployee.levelToCeo >= 0 ? detailedEmployee.levelToCeo.toString() : 'N/A'} colors={colors} />
                                {directReports.length > 0 && <DetailItem icon={<Users />} label="Direct Reports" value={directReports.length.toString()} colors={colors} />}
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
                                    {directReports.length > 3 && <p className={`text-xs ${textMuted}`}>...and {directReports.length - 3} more.</p>}
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

    const departments = [...new Set(augmentedDataList.map(emp => emp.department).filter(Boolean))].sort();
    const grades = [...new Set(augmentedDataList.map(emp => emp.grade).filter(Boolean))].sort((a, b) => parseInt(b) - parseInt(a));
    const locations = [...new Set(augmentedDataList.map(emp => emp.location).filter(Boolean))].sort();

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
                                    <p className={`text-xs ${textSecondary}`}>Almet Holding Structure</p>
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
                                    {Object.values(filters).some(f => f !== 'all') && (<div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-almet-sapphire rounded-full border border-white dark:border-almet-cloud-burst"></div>)}
                                </button>
                                <div className={`flex items-center border ${borderColor} rounded-md ${bgCard} shadow-sm`}>
                                    <button onClick={handleZoomOut} className={`p-1.5 hover:${bgAccent} transition-colors ${textMuted} hover:${textPrimary}`} title="Zoom Out"><ZoomOut size={14} /></button>
                                    <span className={`px-2 text-2xs ${textMuted} min-w-[2.5rem] text-center border-x ${borderColor}`}>{zoomLevel}%</span>
                                    <button onClick={handleZoomIn} className={`p-1.5 hover:${bgAccent} transition-colors ${textMuted} hover:${textPrimary}`} title="Zoom In"><ZoomIn size={14} /></button>
                                </div>
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

                <div className="relative overflow-auto flex-grow">
                    {viewMode === 'tree' ? (
                        <div ref={chartRef} className="p-8 md:p-12 transition-transform duration-300 w-full min-h-full" style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center', minWidth: 'max-content' }}>
                            <div className="flex justify-center">
                                <div className="org-chart" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: `${cardGap * 1.5}px`}}>
                                    {organizationTree.map(rootNode => (rootNode && rootNode.id ? <TreeNode key={rootNode.id} node={rootNode} /> : null))}
                                </div>
                            </div>
                        </div>
                    ) : <GridView />}
                </div>

                <EmployeeDetailModal
                    employee={selectedEmployee}
                    onClose={() => setSelectedEmployee(null)}
                />

                <style jsx>{`
                  .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
                  ::-webkit-scrollbar { width: 6px; height: 6px; }
                  ::-webkit-scrollbar-track { background: ${darkMode ? 'rgba(79, 87, 114, 0.05)' : 'rgba(144, 160, 185, 0.03)'}; border-radius: 3px; }
                  ::-webkit-scrollbar-thumb { background: ${darkMode ? 'rgba(122, 130, 154, 0.3)' : 'rgba(48, 83, 155, 0.3)'}; border-radius: 3px; }
                  ::-webkit-scrollbar-thumb:hover { background: ${darkMode ? 'rgba(122, 130, 154, 0.5)' : 'rgba(48, 83, 155, 0.5)'}; }
                  .backdrop-blur-sm { backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
                  .focus\\:ring-almet-sapphire:focus { --tw-ring-color: rgba(48, 83, 155, 0.5); }
                  .focus\\:border-almet-sapphire:focus { border-color: #30539b; }
                  .org-chart div[style*="backgroundColor"] { 
                    border-radius: 0 !important; 
                    box-shadow: none !important;
                  }
                  .text-2xs { font-size: 0.625rem; line-height: 0.875rem; }
                `}</style>
            </div>
        </DashboardLayout>
    );
};

export default OrgChart;