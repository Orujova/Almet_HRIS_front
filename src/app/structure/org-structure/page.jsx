'use client'
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
    ChevronDown, ChevronRight, Users, Building2, Award, User, Search, Phone, Mail, MapPin,
    Briefcase, Crown, Target, Layers, Filter, TreePine, Maximize2, Minimize2, Plus, Minus,
    ZoomIn, ZoomOut, RotateCcw, X, Grid, UsersRound, Archive, Puzzle, Info, Download,
    ArrowUp, ArrowDown, Expand, Shrink
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTheme } from '@/components/common/ThemeProvider';

// React Flow imports - modern org chart solution
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    ConnectionMode,
    Panel,
    MiniMap,
    Handle,
    Position,
    useReactFlow,
    ReactFlowProvider,
    getRectOfNodes,
    getTransformForBounds
} from 'reactflow';
import 'reactflow/dist/style.css';

// Dagre for automatic layout
import dagre from 'dagre';

const OrgChart = () => {
    const { darkMode } = useTheme();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [filters, setFilters] = useState({ department: 'all', grade: 'all', location: 'all' });
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState('tree');
    const [showLegend, setShowLegend] = useState(false);
    const [expandedNodes, setExpandedNodes] = useState(new Set(['HLD22'])); // CEO expanded by default
    const [isFullscreen, setIsFullscreen] = useState(false);
    
    const containerRef = useRef(null);

    // Enhanced theme colors
    const bgApp = darkMode ? "bg-slate-900" : "bg-gray-50";
    const bgCard = darkMode ? "bg-slate-800" : "bg-white";
    const bgCardHover = darkMode ? "bg-slate-700" : "bg-gray-50";
    const textHeader = darkMode ? "text-gray-100" : "text-gray-900";
    const textPrimary = darkMode ? "text-gray-200" : "text-gray-700";
    const textSecondary = darkMode ? "text-gray-400" : "text-gray-500";
    const textMuted = darkMode ? "text-gray-500" : "text-gray-400";
    const borderColor = darkMode ? "border-slate-600" : "border-gray-200";
    const bgAccent = darkMode ? "bg-slate-700" : "bg-blue-50";

    // Position hierarchy colors
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

    // Calculate enhanced employee metrics
    const enhancedEmployeeData = useMemo(() => {
        const hierarchyMap = {};
        
        // Build hierarchy map
        employeeData.forEach(emp => {
            hierarchyMap[emp.id] = { ...emp, children: [] };
        });
        
        employeeData.forEach(emp => {
            if (emp.lineManagerId && hierarchyMap[emp.lineManagerId]) {
                hierarchyMap[emp.lineManagerId].children.push(hierarchyMap[emp.id]);
            }
        });

        // Calculate metrics for each employee
        const calculateMetrics = (employee) => {
            // Level to CEO
            const getLevelToCeo = (empId) => {
                let level = 0;
                let current = hierarchyMap[empId];
                while (current && current.lineManagerId) {
                    level++;
                    current = hierarchyMap[current.lineManagerId];
                    if (level > 10) break; // Prevent infinite loops
                }
                return level;
            };

            // Total subordinates (recursive)
            const getTotalSubordinates = (empId) => {
                const emp = hierarchyMap[empId];
                if (!emp || !emp.children.length) return 0;
                
                let total = emp.children.length;
                emp.children.forEach(child => {
                    total += getTotalSubordinates(child.id);
                });
                return total;
            };

            // Colleagues in same unit
            const getColleaguesInUnit = (employee) => {
                return employeeData.filter(emp => 
                    emp.id !== employee.id && 
                    emp.unit === employee.unit
                ).length;
            };

            // Colleagues in same business function
            const getColleaguesInBusinessFunction = (employee) => {
                return employeeData.filter(emp => 
                    emp.id !== employee.id && 
                    emp.businessFunction === employee.businessFunction
                ).length;
            };

            return {
                ...employee,
                levelToCeo: getLevelToCeo(employee.id),
                directReports: hierarchyMap[employee.id]?.children?.length || 0,
                totalSubordinates: getTotalSubordinates(employee.id),
                colleaguesInUnit: getColleaguesInUnit(employee),
                colleaguesInBusinessFunction: getColleaguesInBusinessFunction(employee),
                manager: employee.lineManagerId ? hierarchyMap[employee.lineManagerId] : null
            };
        };

        return employeeData.map(calculateMetrics);
    }, [employeeData]);

    // Toggle node expansion
    const toggleNodeExpansion = useCallback((nodeId) => {
        setExpandedNodes(prev => {
            const newExpanded = new Set(prev);
            if (newExpanded.has(nodeId)) {
                newExpanded.delete(nodeId);
            } else {
                newExpanded.add(nodeId);
            }
            return newExpanded;
        });
    }, []);

    // Fullscreen functionality
    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen().then(() => {
                setIsFullscreen(true);
            }).catch(err => {
                console.error('Fullscreen request failed:', err);
            });
        } else {
            document.exitFullscreen().then(() => {
                setIsFullscreen(false);
            }).catch(err => {
                console.error('Exit fullscreen failed:', err);
            });
        }
    }, []);

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Enhanced Avatar Component
    const Avatar = ({ employee, size = 'md' }) => {
        const sizes = {
            sm: 'w-8 h-8 text-xs',
            md: 'w-12 h-12 text-sm',
            lg: 'w-16 h-16 text-base',
        };

        if (!employee) return <div className={`${sizes[size]} rounded-xl bg-gray-300 animate-pulse`}></div>;
        
        const colors = getEmployeeColor(employee);
        return (
            <div 
                className={`${sizes[size]} rounded-xl flex items-center justify-center font-bold text-white relative flex-shrink-0 ring-2 ring-white shadow-lg`}
                style={{ 
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.badge} 100%)`,
                }}
            >
                {employee.avatar || '?'}
            </div>
        );
    };

    // Custom React Flow Node Component with responsive sizing
    const EmployeeNode = ({ data }) => {
        const employee = data.employee;
        const colors = getEmployeeColor(employee);
        const directReports = data.directReports || 0;
        const hasChildren = directReports > 0;
        const isExpanded = expandedNodes.has(employee.id);
        const shouldShowChildren = hasChildren && isExpanded;

        return (
            <div className="relative">
                <Handle type="target" position={Position.Top} className="opacity-0" />
                
                <div 
                    className={`${bgCard} border-2 rounded-xl shadow-lg transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-105 w-[280px] min-h-[140px]`}
                    style={{ borderColor: colors.primary }}
                    onClick={() => data.onSelect && data.onSelect(employee)}
                >
                    {/* Compact Header */}
                    <div className="p-4 pb-2">
                        <div className="flex items-start gap-3">
                            <Avatar employee={employee} size="sm" />
                            <div className="flex-1 min-w-0">
                                <h3 className={`font-bold ${textHeader} text-sm leading-tight mb-1`}>
                                    {employee.name}
                                </h3>
                                <p className={`${textSecondary} text-xs leading-relaxed line-clamp-2`}>
                                    {employee.title}
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Compact Badges */}
                    <div className="flex items-center gap-2 px-4 mb-2">
                        <span 
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-bold text-white"
                            style={{ backgroundColor: colors.badge }}
                        >
                            G{employee.grade}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${bgAccent} ${textPrimary}`}>
                            {employee.department}
                        </span>
                    </div>

                    {/* Compact Details */}
                    <div className={`px-4 pb-4 border-t ${borderColor} pt-2 space-y-1`}>
                        <div className={`flex items-center ${textSecondary} text-xs`}>
                            <MapPin className="w-3 h-3 mr-2 flex-shrink-0" />
                            <span className="font-medium truncate">{employee.location}</span>
                        </div>
                        
                        {directReports > 0 && (
                            <div className={`flex items-center font-semibold text-xs`} style={{ color: colors.primary }}>
                                <Users className="w-3 h-3 mr-2 flex-shrink-0" />
                                <span>{directReports} Reports</span>
                            </div>
                        )}
                    </div>
                    
                    {/* Expand/Collapse Button */}
                    {hasChildren && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleNodeExpansion(employee.id);
                            }}
                            className={`
                                absolute -bottom-2.5 left-1/2 transform -translate-x-1/2 z-30 
                                w-6 h-6 rounded-full text-white
                                flex items-center justify-center hover:scale-110 transition-all duration-200
                                shadow-lg hover:shadow-xl
                                ring-2 ring-white
                            `}
                            style={{ 
                                background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.badge} 100%)`,
                            }}
                            aria-label={isExpanded ? "Collapse node" : "Expand node"}
                        >
                            {isExpanded ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        </button>
                    )}
                </div>
                
                {shouldShowChildren && <Handle type="source" position={Position.Bottom} className="opacity-0" />}
            </div>
        );
    };

    const nodeTypes = {
        employee: EmployeeNode,
    };

    // Enhanced Dagre layout function with better horizontal spacing
    const getLayoutedElements = (nodes, edges, direction = 'TB') => {
        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));
        
        // Different settings for horizontal vs vertical
        if (direction === 'LR') {
            dagreGraph.setGraph({ 
                rankdir: direction, 
                ranksep: 200, // More space between levels horizontally
                nodesep: 60,  // Less space between siblings
                edgesep: 20,
                marginx: 40,
                marginy: 40
            });
        } else {
            dagreGraph.setGraph({ 
                rankdir: direction, 
                ranksep: 120, // Good for vertical
                nodesep: 80,  // Good space between siblings
                edgesep: 20,
                marginx: 40,
                marginy: 40
            });
        }

        nodes.forEach((node) => {
            // Smaller width for horizontal to prevent overlap
            const nodeWidth = direction === 'LR' ? 300 : 320;
            const nodeHeight = direction === 'LR' ? 160 : 180;
            dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
        });

        edges.forEach((edge) => {
            dagreGraph.setEdge(edge.source, edge.target);
        });

        dagre.layout(dagreGraph);

        const layoutedNodes = nodes.map((node) => {
            const nodeWithPosition = dagreGraph.node(node.id);
            const nodeWidth = direction === 'LR' ? 300 : 320;
            const nodeHeight = direction === 'LR' ? 160 : 180;
            
            return {
                ...node,
                position: {
                    x: nodeWithPosition.x - (nodeWidth / 2),
                    y: nodeWithPosition.y - (nodeHeight / 2),
                },
            };
        });

        return { nodes: layoutedNodes, edges };
    };

    // Create nodes and edges from employee data with expand/collapse logic
    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        const hierarchyMap = {};
        
        // Build hierarchy map
        enhancedEmployeeData.forEach(emp => {
            hierarchyMap[emp.id] = { ...emp, children: [] };
        });
        
        enhancedEmployeeData.forEach(emp => {
            if (emp.lineManagerId && hierarchyMap[emp.lineManagerId]) {
                hierarchyMap[emp.lineManagerId].children.push(hierarchyMap[emp.id]);
            }
        });

        // Get visible nodes based on expansion state
        const getVisibleNodes = (nodeId, parentExpanded = true) => {
            const node = hierarchyMap[nodeId];
            if (!node) return [];
            
            const visibleNodes = parentExpanded ? [node] : [];
            const isExpanded = expandedNodes.has(nodeId);
            
            if (isExpanded && node.children) {
                node.children.forEach(child => {
                    visibleNodes.push(...getVisibleNodes(child.id, parentExpanded && isExpanded));
                });
            }
            
            return visibleNodes;
        };

        // Start from root nodes
        const rootNodes = enhancedEmployeeData.filter(emp => !emp.lineManagerId);
        const visibleEmployees = [];
        
        rootNodes.forEach(root => {
            visibleEmployees.push(...getVisibleNodes(root.id, true));
        });

        // Create nodes for visible employees
        const nodes = visibleEmployees.map(employee => ({
            id: employee.id,
            type: 'employee',
            position: { x: 0, y: 0 },
            data: {
                employee,
                directReports: hierarchyMap[employee.id]?.children?.length || 0,
                onSelect: setSelectedEmployee
            },
        }));

        // Create edges between visible nodes
        const edges = [];
        visibleEmployees.forEach(emp => {
            if (emp.lineManagerId && visibleEmployees.find(ve => ve.id === emp.lineManagerId)) {
                edges.push({
                    id: `${emp.lineManagerId}-${emp.id}`,
                    source: emp.lineManagerId,
                    target: emp.id,
                    type: 'smoothstep',
                    style: { 
                        stroke: darkMode ? '#64748b' : '#94a3b8', 
                        strokeWidth: 2,
                        opacity: 0.8 
                    },
                    animated: true,
                });
            }
        });

        return getLayoutedElements(nodes, edges);
    }, [enhancedEmployeeData, expandedNodes, darkMode]);

    // Filter logic
    const filteredEmployees = useMemo(() => {
        return enhancedEmployeeData.filter(emp => {
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
    }, [searchTerm, filters, enhancedEmployeeData]);

    const clearAllFilters = () => {
        setFilters({ department: 'all', grade: 'all', location: 'all' });
        setSearchTerm('');
    };

    const areFiltersActive = useMemo(() => 
        Object.values(filters).some(f => f !== 'all') || searchTerm !== ''
    , [filters, searchTerm]);

    // Enhanced Export to PNG functionality
    const exportToPNG = useCallback(async () => {
        try {
            // Show loading indicator
            const loadingToast = document.createElement('div');
            loadingToast.innerHTML = 'Exporting chart...';
            loadingToast.style.cssText = `
                position: fixed; top: 20px; right: 20px; z-index: 9999;
                background: #3b82f6; color: white; padding: 12px 24px;
                border-radius: 8px; font-size: 14px; font-weight: 500;
            `;
            document.body.appendChild(loadingToast);

            // Wait a bit for the chart to fully render
            await new Promise(resolve => setTimeout(resolve, 500));

            // Dynamically import html2canvas
            const html2canvas = (await import('html2canvas')).default;
            
            // Get the React Flow container
            const reactFlowElement = document.querySelector('.react-flow__viewport');
            if (!reactFlowElement) {
                throw new Error('Chart viewport not found');
            }

            // Get the parent container for better bounds
            const flowContainer = document.querySelector('.react-flow');
            const containerRect = flowContainer.getBoundingClientRect();

            // Create canvas with proper sizing
            const canvas = await html2canvas(flowContainer, {
                backgroundColor: darkMode ? '#0f172a' : '#f8fafc',
                scale: 1.5, // Good balance between quality and file size
                useCORS: true,
                allowTaint: true,
                scrollX: 0,
                scrollY: 0,
                width: containerRect.width,
                height: containerRect.height,
                onclone: (clonedDoc) => {
                    // Ensure all styles are preserved in clone
                    const clonedFlowElements = clonedDoc.querySelectorAll('.react-flow__node');
                    clonedFlowElements.forEach(node => {
                        node.style.transform = node.style.transform || '';
                    });
                }
            });

            // Remove loading indicator
            document.body.removeChild(loadingToast);

            // Create a new canvas with proper dimensions and title
            const finalCanvas = document.createElement('canvas');
            const ctx = finalCanvas.getContext('2d');
            const padding = 60;
            const titleHeight = 80;
            
            finalCanvas.width = canvas.width + (padding * 2);
            finalCanvas.height = canvas.height + titleHeight + (padding * 2);

            // Fill background
            ctx.fillStyle = darkMode ? '#0f172a' : '#f8fafc';
            ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

            // Add title
            ctx.fillStyle = darkMode ? '#e2e8f0' : '#1e293b';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Organizational Chart', finalCanvas.width / 2, 40);

            // Add subtitle with date
            ctx.font = '16px Arial';
            ctx.fillStyle = darkMode ? '#94a3b8' : '#64748b';
            const now = new Date();
            const dateStr = now.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
            ctx.fillText(`Generated on ${dateStr}`, finalCanvas.width / 2, 65);

            // Draw the chart
            ctx.drawImage(canvas, padding, titleHeight, canvas.width, canvas.height);

            // Create download link
            const link = document.createElement('a');
            link.download = `org-chart-${now.toISOString().split('T')[0]}.png`;
            link.href = finalCanvas.toDataURL('image/png', 0.95);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Success message
            const successToast = document.createElement('div');
            successToast.innerHTML = '✓ Chart exported successfully!';
            successToast.style.cssText = `
                position: fixed; top: 20px; right: 20px; z-index: 9999;
                background: #10b981; color: white; padding: 12px 24px;
                border-radius: 8px; font-size: 14px; font-weight: 500;
            `;
            document.body.appendChild(successToast);
            setTimeout(() => document.body.removeChild(successToast), 3000);
            
        } catch (error) {
            console.error('Export failed:', error);
            const errorToast = document.createElement('div');
            errorToast.innerHTML = '✗ Export failed. Please try again.';
            errorToast.style.cssText = `
                position: fixed; top: 20px; right: 20px; z-index: 9999;
                background: #ef4444; color: white; padding: 12px 24px;
                border-radius: 8px; font-size: 14px; font-weight: 500;
            `;
            document.body.appendChild(errorToast);
            setTimeout(() => document.body.removeChild(errorToast), 3000);
        }
    }, [darkMode]);

    // React Flow component with layout
    const FlowComponent = () => {
        const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
        const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
        const { fitView } = useReactFlow();

        // Update nodes when expansion changes
        useEffect(() => {
            setNodes(initialNodes);
            setEdges(initialEdges);
        }, [initialNodes, initialEdges, setNodes, setEdges]);

        const onLayout = useCallback((direction) => {
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                nodes,
                edges,
                direction
            );
            setNodes([...layoutedNodes]);
            setEdges([...layoutedEdges]);
            
            setTimeout(() => fitView(), 0);
        }, [nodes, edges, setNodes, setEdges, fitView]);

        useEffect(() => {
            setTimeout(() => fitView(), 100);
        }, [fitView]);

        return (
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                connectionMode={ConnectionMode.Strict}
                fitView
                className={darkMode ? 'dark' : ''}
                style={{ backgroundColor: darkMode ? '#0f172a' : '#f8fafc' }}
            >
                <Background color={darkMode ? '#334155' : '#e2e8f0'} gap={20} />
                <Controls className={darkMode ? 'react-flow__controls-dark' : ''} />
                <MiniMap 
                    className={darkMode ? 'react-flow__minimap-dark' : ''}
                    nodeColor={(node) => {
                        const employee = node.data?.employee;
                        return getEmployeeColor(employee).primary;
                    }}
                />
                <Panel position="top-right" className="space-x-2">
                    <button 
                        onClick={() => onLayout('TB')}
                        className={`px-3 py-2 ${bgCard} ${textPrimary} border ${borderColor} rounded-lg hover:${bgCardHover} transition-colors text-sm font-medium`}
                    >
                        Vertical
                    </button>
                    <button 
                        onClick={() => onLayout('LR')}
                        className={`px-3 py-2 ${bgCard} ${textPrimary} border ${borderColor} rounded-lg hover:${bgCardHover} transition-colors text-sm font-medium`}
                    >
                        Horizontal
                    </button>
                </Panel>
            </ReactFlow>
        );
    };

    // Grid View Component
    const GridView = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
            {filteredEmployees.map(employee => (
                <div 
                    key={employee.id}
                    className={`${bgCard} border ${borderColor} rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105`}
                    onClick={() => setSelectedEmployee(employee)}
                >
                    <div className="flex items-start gap-4 mb-4">
                        <Avatar employee={employee} size="md" />
                        <div className="flex-1 min-w-0">
                            <h3 className={`font-bold ${textHeader} text-base leading-tight mb-2`}>
                                {employee.name}
                            </h3>
                            <p className={`${textSecondary} text-sm`}>
                                {employee.title}
                            </p>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <div className={`flex items-center ${textSecondary} text-sm`}>
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{employee.location}</span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    const departments = useMemo(() => [...new Set(employeeData.map(emp => emp.department).filter(Boolean))].sort(), []);
    const grades = useMemo(() => [...new Set(employeeData.map(emp => emp.grade).filter(Boolean))].sort((a, b) => parseInt(b) - parseInt(a)), []);
    const locations = useMemo(() => [...new Set(employeeData.map(emp => emp.location).filter(Boolean))].sort(), []);

    return (
        <DashboardLayout>
            <div ref={containerRef} className={`${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'} ${bgApp} flex flex-col`}>
                {/* Smaller Header */}
                <div className={`${bgCard} shadow-lg border-b ${borderColor} sticky top-0 z-30 backdrop-blur-md`}>
                    <div className="px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                                    <Building2 className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h1 className={`text-base font-bold ${textHeader}`}>Organizational Chart</h1>
                                    <p className={`text-xs ${textSecondary}`}>
                                        Total: {employeeData.length} 
                                        {filteredEmployees.length !== employeeData.length && ` • Filtered: ${filteredEmployees.length}`}
                                    </p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {/* Search */}
                                <div className="relative">
                                    <Search className={`absolute left-2.5 top-1/2 transform -translate-y-1/2 ${textMuted} w-3.5 h-3.5 pointer-events-none`} />
                                    <input 
                                        type="text" 
                                        placeholder="Search..." 
                                        value={searchTerm} 
                                        onChange={(e) => setSearchTerm(e.target.value)} 
                                        className={`pl-8 pr-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-44 ${bgCard} ${textPrimary} text-sm transition-all duration-200 shadow-sm`} 
                                    />
                                </div>
                                
                                {/* View Mode Toggle */}
                                <div className={`flex rounded-lg border ${borderColor} ${bgCard} p-0.5 shadow-sm`}>
                                    <button 
                                        onClick={() => setViewMode('tree')} 
                                        className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${viewMode === 'tree' ? 'bg-blue-600 text-white shadow-sm' : `${textMuted} hover:${textPrimary} hover:${bgAccent}`}`}
                                    >
                                        <TreePine size={14} />Tree
                                    </button>
                                    <button 
                                        onClick={() => setViewMode('grid')} 
                                        className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm' : `${textMuted} hover:${textPrimary} hover:${bgAccent}`}`}
                                    >
                                        <Grid size={14} />Grid
                                    </button>
                                </div>
                                
                                {/* Control Buttons */}
                                <button 
                                    onClick={() => setShowFilters(!showFilters)} 
                                    title="Filters"
                                    className={`p-2 border ${borderColor} rounded-lg hover:${bgAccent} transition-all duration-200 ${bgCard} ${textPrimary} shadow-sm relative`}
                                >
                                    <Filter size={14} />
                                    {areFiltersActive && (
                                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-600 rounded-full border border-white"></div>
                                    )}
                                </button>
                                
                                <button 
                                    onClick={() => setShowLegend(true)} 
                                    title="Legend"
                                    className={`p-2 border ${borderColor} rounded-lg hover:${bgAccent} transition-all duration-200 ${bgCard} ${textMuted} hover:${textPrimary} shadow-sm`}
                                >
                                    <Info size={14} />
                                </button>

                                <button 
                                    onClick={exportToPNG} 
                                    title="Export PNG"
                                    className={`p-2 border ${borderColor} rounded-lg hover:${bgAccent} transition-all duration-200 ${bgCard} ${textMuted} hover:${textPrimary} shadow-sm`}
                                >
                                    <Download size={14} />
                                </button>
                                
                                <button 
                                    onClick={toggleFullscreen} 
                                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                                    className={`p-2 border ${borderColor} rounded-lg hover:${bgAccent} transition-all duration-200 ${bgCard} ${textMuted} hover:${textPrimary} shadow-sm`}
                                >
                                    {isFullscreen ? <Shrink size={14} /> : <Expand size={14} />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Smaller Filters Panel */}
                {showFilters && (
                    <div className={`${bgCard} border-b ${borderColor} shadow-md sticky ${isFullscreen ? 'top-[57px]' : 'top-[65px]'} z-20 backdrop-blur-sm`}>
                        <div className="px-4 py-3">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className={`text-sm font-semibold ${textHeader} flex items-center gap-2`}>
                                    <Filter size={16} />
                                    Filters
                                </h3>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={clearAllFilters} 
                                        className={`text-xs ${textMuted} hover:text-blue-600 transition-colors hover:underline font-medium`}
                                    >
                                        Clear All
                                    </button>
                                    <button 
                                        onClick={() => setShowFilters(false)} 
                                        className={`p-1 hover:${bgAccent} rounded-lg ${textMuted} hover:${textPrimary} transition-colors`}
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <div>
                                    <label className={`block text-xs font-medium ${textSecondary} mb-1.5`}>Department</label>
                                    <select 
                                        value={filters.department} 
                                        onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))} 
                                        className={`w-full p-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${bgCard} ${textPrimary} shadow-sm text-sm`}
                                    >
                                        <option value="all">All Departments</option>
                                        {departments.map(dept => (<option key={dept} value={dept}>{dept}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label className={`block text-xs font-medium ${textSecondary} mb-1.5`}>Grade</label>
                                    <select 
                                        value={filters.grade} 
                                        onChange={(e) => setFilters(prev => ({ ...prev, grade: e.target.value }))} 
                                        className={`w-full p-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${bgCard} ${textPrimary} shadow-sm text-sm`}
                                    >
                                        <option value="all">All Grades</option>
                                        {grades.map(grade => (<option key={grade} value={grade}>Grade {grade}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label className={`block text-xs font-medium ${textSecondary} mb-1.5`}>Location</label>
                                    <select 
                                        value={filters.location} 
                                        onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))} 
                                        className={`w-full p-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${bgCard} ${textPrimary} shadow-sm text-sm`}
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
                <div className="relative overflow-hidden flex-grow">
                    {viewMode === 'tree' ? (
                        <ReactFlowProvider>
                            <div className="w-full h-full">
                                <FlowComponent />
                            </div>
                        </ReactFlowProvider>
                    ) : (
                        <GridView />
                    )}
                </div>

                {/* Smaller Employee Detail Modal */}
                {selectedEmployee && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-200 ease-in-out">
                        <div className={`${bgCard} rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] flex flex-col border ${borderColor}`}>
                            <div className={`flex items-center justify-between p-4 border-b ${borderColor} sticky top-0 ${bgCard} rounded-t-xl z-10`}>
                                <div className="flex items-center gap-3">
                                    <Avatar employee={selectedEmployee} size="md" />
                                    <div>
                                        <h2 className={`text-lg font-semibold ${textHeader}`}>{selectedEmployee.name}</h2>
                                        <p className={`${textSecondary} text-sm mt-0.5`}>{selectedEmployee.title}</p>
                                    </div>
                                </div>
                                <button onClick={() => setSelectedEmployee(null)} className={`${textMuted} hover:${textPrimary} p-1.5 hover:${bgAccent} rounded-lg transition-colors`}>
                                    <X size={20} aria-label="Close modal"/>
                                </button>
                            </div>

                            <div className="p-4 overflow-y-auto flex-grow space-y-4">
                                {/* Basic Employee Details */}
                                <div>
                                    <h4 className={`font-semibold ${textSecondary} mb-3 text-xs uppercase tracking-wider`}>Employee Details</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        <SmallDetailItem icon={<Building2 />} label="Department" value={selectedEmployee.department} />
                                        <SmallDetailItem icon={<Layers />} label="Unit" value={selectedEmployee.unit} />
                                        <SmallDetailItem icon={<Award />} label="Grade" value={`G${selectedEmployee.grade}`} />
                                        <SmallDetailItem icon={<Briefcase />} label="Position" value={selectedEmployee.positionGroup} />
                                        <SmallDetailItem icon={<MapPin />} label="Location" value={selectedEmployee.location} />
                                        <SmallDetailItem icon={<Puzzle />} label="Function" value={selectedEmployee.businessFunction} />
                                    </div>
                                </div>

                                {/* Team Metrics */}
                                <div className={`border-t ${borderColor} pt-4`}>
                                    <h4 className={`font-semibold ${textSecondary} mb-3 text-xs uppercase tracking-wider`}>Team Metrics</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        <SmallMetricItem 
                                            icon={<Target />} 
                                            label="Level to CEO" 
                                            value={selectedEmployee.levelToCeo} 
                                        />
                                        <SmallMetricItem 
                                            icon={<Users />} 
                                            label="Direct Reports" 
                                            value={selectedEmployee.directReports} 
                                        />
                                        <SmallMetricItem 
                                            icon={<UsersRound />} 
                                            label="Total Team" 
                                            value={selectedEmployee.totalSubordinates} 
                                        />
                                        <SmallMetricItem 
                                            icon={<Building2 />} 
                                            label="Unit Colleagues" 
                                            value={selectedEmployee.colleaguesInUnit} 
                                        />
                                        <SmallMetricItem 
                                            icon={<Briefcase />} 
                                            label="Function Colleagues" 
                                            value={selectedEmployee.colleaguesInBusinessFunction} 
                                        />
                                    </div>
                                </div>
                                
                                {/* Contact */}
                                <div className={`border-t ${borderColor} pt-4`}>
                                    <h4 className={`font-semibold ${textSecondary} mb-3 text-xs uppercase tracking-wider`}>Contact</h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <SmallDetailItem icon={<Phone />} label="Phone" value={selectedEmployee.phone} />
                                        <SmallDetailItem icon={<Mail />} label="Email" value={selectedEmployee.email} />
                                    </div>
                                </div>

                                {/* Manager */}
                                {selectedEmployee.manager && (
                                    <div className={`border-t ${borderColor} pt-4`}>
                                        <h4 className={`font-semibold ${textSecondary} mb-3 text-xs uppercase tracking-wider`}>Reports To</h4>
                                        <div 
                                            className={`${bgCard} border ${borderColor} rounded-lg p-3 cursor-pointer hover:${bgCardHover} transition-colors flex items-center gap-3`}
                                            onClick={() => setSelectedEmployee(selectedEmployee.manager)}
                                        >
                                            <Avatar employee={selectedEmployee.manager} size="sm" />
                                            <div className="flex-1">
                                                <h5 className={`font-semibold ${textHeader} text-sm`}>{selectedEmployee.manager.name}</h5>
                                                <p className={`${textSecondary} text-xs`}>{selectedEmployee.manager.title}</p>
                                            </div>
                                            <ArrowUp className={`w-4 h-4 ${textMuted}`} />
                                        </div>
                                    </div>
                                )}

                                {/* Direct Reports List */}
                                {selectedEmployee.directReports > 0 && (
                                    <div className={`border-t ${borderColor} pt-4`}>
                                        <h4 className={`font-semibold ${textSecondary} mb-3 text-xs uppercase tracking-wider`}>
                                            Direct Reports ({selectedEmployee.directReports})
                                        </h4>
                                        <div className="space-y-2">
                                            {enhancedEmployeeData
                                                .filter(emp => emp.lineManagerId === selectedEmployee.id)
                                                .map(report => (
                                                    <div 
                                                        key={report.id}
                                                        className={`${bgCard} border ${borderColor} rounded-lg p-3 cursor-pointer hover:${bgCardHover} transition-colors flex items-center gap-3`}
                                                        onClick={() => setSelectedEmployee(report)}
                                                    >
                                                        <Avatar employee={report} size="sm" />
                                                        <div className="flex-1">
                                                            <h5 className={`font-semibold ${textHeader} text-sm`}>{report.name}</h5>
                                                            <p className={`${textSecondary} text-xs`}>{report.title}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className={`text-xs ${textMuted}`}>Grade {report.grade}</p>
                                                            <p className={`text-xs ${textSecondary}`}>{report.department}</p>
                                                        </div>
                                                        <ArrowDown className={`w-4 h-4 ${textMuted}`} />
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Position Legend Modal */}
                {showLegend && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className={`${bgCard} rounded-2xl shadow-2xl w-full max-w-sm flex flex-col border ${borderColor}`}>
                            <div className={`flex items-center justify-between p-6 border-b ${borderColor} sticky top-0 ${bgCard} rounded-t-2xl z-10`}>
                                <h2 className={`text-xl font-semibold ${textHeader}`}>Position Levels</h2>
                                <button onClick={() => setShowLegend(false)} className={`${textMuted} hover:${textHeader} p-2 hover:${bgAccent} rounded-xl transition-colors`}>
                                    <X size={20} aria-label="Close legend"/>
                                </button>
                            </div>
                            <div className="p-6 space-y-3 overflow-y-auto">
                                {Object.entries(hierarchyColors).map(([group, colors]) => (
                                    <div key={group} className={`flex items-center gap-4 p-3 rounded-xl ${bgAccent}`}>
                                        <div 
                                            className="w-8 h-8 rounded-xl flex-shrink-0 ring-2 ring-white shadow-lg" 
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
                )}

                {                                /* Enhanced Styles */}
                <style jsx>{`
                    /* Line clamp utility */
                    .line-clamp-2 { 
                        display: -webkit-box; 
                        -webkit-line-clamp: 2; 
                        -webkit-box-orient: vertical; 
                        overflow: hidden; 
                    }

                    /* React Flow Dark Mode Styles */
                    .react-flow__controls-dark {
                        background: #1e293b;
                        border: 1px solid #475569;
                    }
                    
                    .react-flow__controls-dark button {
                        background: #334155;
                        border-color: #475569;
                        color: #e2e8f0;
                    }
                    
                    .react-flow__controls-dark button:hover {
                        background: #475569;
                    }
                    
                    .react-flow__minimap-dark {
                        background: #1e293b;
                        border: 1px solid #475569;
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
                    
                    /* Enhanced Button Animations */
                    button:active {
                        transform: scale(0.98);
                    }
                    
                    /* Improved Focus Indicators */
                    button:focus-visible, 
                    input:focus-visible, 
                    select:focus-visible {
                        outline: 2px solid #3b82f6;
                        outline-offset: 2px;
                    }

                    /* Responsive node sizing for horizontal layout */
                    .react-flow[data-direction="LR"] .react-flow__node {
                        max-width: 280px;
                    }
                `}</style>
            </div>
        </DashboardLayout>
    );
};

// Small Detail Item Component for compact modal
const SmallDetailItem = ({ icon, label, value }) => (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-slate-700">
        <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            {React.cloneElement(icon, { className: "w-3 h-3 text-blue-600 dark:text-blue-400" })}
        </div>
        <div className="min-w-0 flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
            <p className="text-gray-800 dark:text-gray-200 font-semibold text-xs truncate" title={value || 'N/A'}>{value || 'N/A'}</p>
        </div>
    </div>
);

// Small Metric Item Component for compact display
const SmallMetricItem = ({ icon, label, value }) => (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
            {React.cloneElement(icon, { className: "w-3 h-3 text-blue-600 dark:text-blue-400" })}
        </div>
        <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{label}</p>
            <p className="text-gray-800 dark:text-gray-200 font-bold text-sm">{value}</p>
        </div>
    </div>
);

export default OrgChart;