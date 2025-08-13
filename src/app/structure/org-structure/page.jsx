'use client'
import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
    ChevronDown, ChevronRight, Users, Building2, Award, User, Search, Phone, Mail, MapPin,
    Briefcase, Crown, Target, Layers, Filter, TreePine, Maximize2, Minimize2, Plus, Minus,
    ZoomIn, ZoomOut, RotateCcw, X, Grid, UsersRound, Archive, Puzzle, Info, Download,
    ArrowUp, ArrowDown, Expand, Shrink, RefreshCw, Settings
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTheme } from '@/components/common/ThemeProvider';
import { useOrgChart } from '@/hooks/useOrgChart';
import Select from 'react-select';
import html2canvas from 'html2canvas';
// React Flow imports
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    ConnectionMode,
    Panel,
   
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

// Clean employee data utility to prevent circular references
const cleanEmployeeData = (employee) => {
    if (!employee) return null;
    
    return {
        employee_id: employee.employee_id,
        name: employee.name,
        title: employee.title,
        department: employee.department,
        unit: employee.unit,
        business_function: employee.business_function,
        position_group: employee.position_group,
        direct_reports: employee.direct_reports || 0,
        line_manager_id: employee.line_manager_id,
        level_to_ceo: employee.level_to_ceo,
        email: employee.email,
        phone: employee.phone,
        profile_image_url: employee.profile_image_url,
        avatar: employee.avatar,
        status_color: employee.status_color,
        employee_details: employee.employee_details ? {
            grading_display: employee.employee_details.grading_display,
            tags: employee.employee_details.tags
        } : null
    };
};

// Enhanced EmployeeNode component
const EmployeeNode = React.memo(({ data, id }) => {
    const employee = data.employee;
    const directReports = employee.direct_reports || 0;
    const hasChildren = directReports > 0;
    const isExpanded = data.isExpanded;
    
    const handleToggleExpanded = useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log('Toggle clicked for:', employee.employee_id, 'Current expanded:', isExpanded);
        data.onToggleExpanded(employee.employee_id);
    }, [employee.employee_id, isExpanded, data.onToggleExpanded]);
    
    const handleSelectEmployee = useCallback((e) => {
        e.stopPropagation();
        const cleanEmployee = cleanEmployeeData(employee);
        data.onSelectEmployee(cleanEmployee);
    }, [employee, data.onSelectEmployee]);

    const handleNavigateToManager = useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();
        if (employee.line_manager_id) {
            data.onNavigateToEmployee(employee.line_manager_id);
        }
    }, [employee.line_manager_id, data.onNavigateToEmployee]);

    // Almet color palette
    const hierarchyColors = {
        'VC': { primary: '#30539b', bg: 'rgba(48, 83, 155, 0.1)', badge: '#253360' },
        'DIRECTOR': { primary: '#336fa5', bg: 'rgba(51, 111, 165, 0.1)', badge: '#30539b' },
        'HEAD OF DEPARTMENT': { primary: '#38587d', bg: 'rgba(56, 88, 125, 0.1)', badge: '#253360' },
        'SENIOR SPECIALIST': { primary: '#7a829a', bg: 'rgba(122, 130, 154, 0.1)', badge: '#4f5772' },
        'SPECIALIST': { primary: '#90a0b9', bg: 'rgba(144, 160, 185, 0.1)', badge: '#7a829a' },
        'JUNIOR SPECIALIST': { primary: '#9c9cb5', bg: 'rgba(156, 156, 181, 0.1)', badge: '#7a829a' },
        'Vice Chairman': { primary: '#2346A8', bg: 'rgba(35, 70, 168, 0.1)', badge: '#253360' }
    };

    const colors = hierarchyColors[employee.position_group] || hierarchyColors['SPECIALIST'];
    
    const Avatar = ({ employee, size = 'sm' }) => {
        const sizes = {
            sm: 'w-8 h-8 text-xs',
            md: 'w-12 h-12 text-sm',
            lg: 'w-16 h-16 text-base',
        };

        if (!employee) return <div className={`${sizes[size]} rounded-xl bg-gray-300 animate-pulse`}></div>;
        
        if (employee.profile_image_url) {
            return (
                <img
                    src={employee.profile_image_url}
                    alt={employee.name}
                    className={`${sizes[size]} rounded-xl object-cover ring-2 ring-white shadow-lg flex-shrink-0`}
                />
            );
        }
        
        const initials = employee.avatar || employee.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?';
        
        return (
            <div 
                className={`${sizes[size]} rounded-xl flex items-center justify-center font-bold text-white relative flex-shrink-0 ring-2 ring-white shadow-lg`}
                style={{ 
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.badge} 100%)`,
                }}
            >
                {initials}
            </div>
        );
    };

    return (
        <div className="relative">
            {/* Input handle for parent connections */}
            <Handle 
                type="target" 
                position={Position.Top} 
                className="!bg-almet-sapphire !border-2 !border-white !w-3 !h-3 !opacity-100"
                style={{ top: -6 }}
            />
            
            <div 
                className="bg-white dark:bg-slate-800 border-2 rounded-xl shadow-lg transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-105 w-[280px] min-h-[140px]"
                style={{ borderColor: colors.primary }}
                onClick={handleSelectEmployee}
            >
                {/* Header */}
                <div className="p-4 pb-2">
                    <div className="flex items-start gap-3">
                        <Avatar employee={employee} size="sm" />
                        <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight mb-1">
                                {employee.name || 'Unknown Employee'}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed line-clamp-2">
                                {employee.title || 'No Title'}
                            </p>
                        </div>
                        {/* Navigate to Manager Button */}
                        {employee.line_manager_id && (
                            <button
                                onClick={handleNavigateToManager}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
                                title="Go to Manager"
                            >
                                <ArrowUp className="w-3 h-3 text-gray-500" />
                            </button>
                        )}
                    </div>
                </div>
                
                {/* Badges */}
                <div className="flex items-center gap-2 px-4 mb-2">
                    {employee.employee_details?.grading_display && (
                        <span 
                            className="inline-flex items-center px-2 py-1 rounded text-xs font-bold text-white"
                            style={{ backgroundColor: colors.badge }}
                        >
                            {employee.employee_details.grading_display}
                        </span>
                    )}
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-almet-mystic dark:bg-slate-700 text-almet-cloud-burst dark:text-gray-200">
                        {employee.department || 'No Department'}
                    </span>
                    {employee.status_color && (
                        <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: employee.status_color }}
                            title="Employee Status"
                        />
                    )}
                </div>

                {/* Details */}
                <div className="px-4 pb-4 border-t border-gray-200 dark:border-slate-600 pt-2 space-y-1">
                    {employee.unit && (
                        <div className="flex items-center text-gray-500 dark:text-gray-400 text-xs">
                            <Layers className="w-3 h-3 mr-2 flex-shrink-0" />
                            <span className="font-medium truncate">{employee.unit}</span>
                        </div>
                    )}
                    
                    {directReports > 0 && (
                        <div className="flex items-center font-semibold text-xs" style={{ color: colors.primary }}>
                            <Users className="w-3 h-3 mr-2 flex-shrink-0" />
                            <span>{directReports} Reports</span>
                        </div>
                    )}
                </div>
                
                {/* Expand/Collapse Button */}
                {hasChildren && (
                    <button
                        onClick={handleToggleExpanded}
                        className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 z-40 w-7 h-7 rounded-full text-white flex items-center justify-center hover:scale-110 transition-all duration-200 shadow-lg hover:shadow-xl ring-3 ring-white"
                        style={{ 
                            background: isExpanded 
                                ? `linear-gradient(135deg, #ef4444 0%, #dc2626 100%)` 
                                : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.badge} 100%)`,
                        }}
                        aria-label={isExpanded ? "Collapse node" : "Expand node"}
                    >
                        {isExpanded ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                )}
            </div>
            
            {/* Output handle for child connections */}
            {hasChildren && (
                <Handle 
                    type="source" 
                    position={Position.Bottom} 
                    className="!bg-almet-sapphire !border-2 !border-white !w-3 !h-3 !opacity-100"
                    style={{ bottom: -6 }}
                />
            )}
        </div>
    );
});

EmployeeNode.displayName = 'EmployeeNode';

const OrgChart = () => {
    const { darkMode } = useTheme();
    const containerRef = useRef(null);
    
    // Use the org chart hook
    const {
        orgChart,
        filteredOrgChart,
        reactFlowData,
        statistics,
        selectedEmployee,
        summary,
        filters,
        activeFilters,
        filterOptions,
        viewMode,
        showFilters,
        showLegend,
        isFullscreen,
        expandedNodes,
        layoutDirection,
        loading,
        isLoading,
        errors,
        hasErrors,
        fetchOrgChart,
        setFilters,
        updateFilter,
        clearFilters,
        setViewMode,
        setShowFilters,
        setShowLegend,
        setIsFullscreen,
        setLayoutDirection,
        toggleExpandedNode,
        setSelectedEmployee,
        clearSelectedEmployee,
        expandAllNodes,
        collapseAllNodes,
        applyPresetFilter,
        hasActiveFilters,
        exportToPNG,
        toggleFullscreen,
        setExpandedNodes
    } = useOrgChart();

    // Enhanced theme colors using Almet palette
    const bgApp = darkMode ? "bg-slate-900" : "bg-almet-mystic";
    const bgCard = darkMode ? "bg-slate-800" : "bg-white";
    const bgCardHover = darkMode ? "bg-slate-700" : "bg-gray-50";
    const textHeader = darkMode ? "text-gray-100" : "text-almet-cloud-burst";
    const textPrimary = darkMode ? "text-gray-200" : "text-almet-comet";
    const textSecondary = darkMode ? "text-gray-400" : "text-almet-waterloo";
    const textMuted = darkMode ? "text-gray-500" : "text-almet-bali-hai";
    const borderColor = darkMode ? "border-slate-600" : "border-gray-200";
    const bgAccent = darkMode ? "bg-slate-700" : "bg-almet-mystic";

   
  

    // Custom select styles for dark mode
    const selectStyles = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: darkMode ? '#334155' : '#ffffff',
            borderColor: darkMode ? '#475569' : '#d1d5db',
            color: darkMode ? '#e2e8f0' : '#374151',
            minHeight: '38px',
            boxShadow: state.isFocused ? (darkMode ? '0 0 0 1px #30539b' : '0 0 0 1px #30539b') : 'none',
            '&:hover': {
                borderColor: darkMode ? '#64748b' : '#9ca3af'
            }
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: darkMode ? '#334155' : '#ffffff',
            borderColor: darkMode ? '#475569' : '#d1d5db',
            boxShadow: darkMode ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
        }),
        option: (provided, state) => ({
            ...provided,
            backgroundColor: state.isSelected 
                ? (darkMode ? '#30539b' : '#30539b')
                : state.isFocused 
                    ? (darkMode ? '#475569' : '#f3f4f6')
                    : 'transparent',
            color: state.isSelected 
                ? '#ffffff'
                : (darkMode ? '#e2e8f0' : '#374151'),
            '&:hover': {
                backgroundColor: state.isSelected 
                    ? (darkMode ? '#30539b' : '#30539b')
                    : (darkMode ? '#475569' : '#f3f4f6')
            }
        }),
        multiValue: (provided) => ({
            ...provided,
            backgroundColor: darkMode ? '#475569' : '#e5e7eb',
            color: darkMode ? '#e2e8f0' : '#374151'
        }),
        multiValueLabel: (provided) => ({
            ...provided,
            color: darkMode ? '#e2e8f0' : '#374151',
            fontSize: '12px'
        }),
        multiValueRemove: (provided) => ({
            ...provided,
            color: darkMode ? '#94a3b8' : '#6b7280',
            '&:hover': {
                backgroundColor: darkMode ? '#ef4444' : '#ef4444',
                color: '#ffffff'
            }
        }),
        singleValue: (provided) => ({
            ...provided,
            color: darkMode ? '#e2e8f0' : '#374151'
        }),
        input: (provided) => ({
            ...provided,
            color: darkMode ? '#e2e8f0' : '#374151'
        }),
        placeholder: (provided) => ({
            ...provided,
            color: darkMode ? '#94a3b8' : '#9ca3af'
        })
    };

    // Enhanced Avatar Component
    const Avatar = ({ employee, size = 'md' }) => {
        const sizes = {
            sm: 'w-8 h-8 text-xs',
            md: 'w-12 h-12 text-sm',
            lg: 'w-16 h-16 text-base',
        };

        if (!employee) return <div className={`${sizes[size]} rounded-xl bg-gray-300 animate-pulse`}></div>;
        
        if (employee.profile_image_url) {
            return (
                <img
                    src={employee.profile_image_url}
                    alt={employee.name}
                    className={`${sizes[size]} rounded-xl object-cover ring-2 ring-white shadow-lg flex-shrink-0`}
                />
            );
        }
        
        const hierarchyColors = {
            'VC': { primary: darkMode ? '#4e7db5' : '#30539b', badge: darkMode ? '#30539b' : '#253360' },
            'DIRECTOR': { primary: darkMode ? '#336fa5' : '#2d5a91', badge: darkMode ? '#2d5a91' : '#336fa5' },
            'HEAD OF DEPARTMENT': { primary: darkMode ? '#38587d' : '#253360', badge: darkMode ? '#253360' : '#38587d' },
            'SENIOR SPECIALIST': { primary: darkMode ? '#7a829a' : '#4f5772', badge: darkMode ? '#4f5772' : '#7a829a' },
            'SPECIALIST': { primary: darkMode ? '#90a0b9' : '#7a829a', badge: darkMode ? '#7a829a' : '#90a0b9' },
            'JUNIOR SPECIALIST': { primary: darkMode ? '#9c9cb5' : '#7a829a', badge: darkMode ? '#7a829a' : '#9c9cb5' },
            'Vice Chairman': { primary: darkMode ? '#2346A8' : '#30539b', badge: darkMode ? '#253360' : '#2346A8' }
        };

        const getEmployeeColor = (employee) => {
            if (!employee || !employee.position_group) return hierarchyColors['SPECIALIST'];
            return hierarchyColors[employee.position_group] || hierarchyColors['SPECIALIST'];
        };

        const colors = getEmployeeColor(employee);
        const initials = employee.avatar || employee.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || '?';
        
        return (
            <div 
                className={`${sizes[size]} rounded-xl flex items-center justify-center font-bold text-white relative flex-shrink-0 ring-2 ring-white shadow-lg`}
                style={{ 
                    background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.badge} 100%)`,
                }}
            >
                {initials}
            </div>
        );
    };

    // Enhanced Dagre layout function
    const getLayoutedElements = useCallback((nodes, edges, direction = 'TB') => {
        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));
        
        if (direction === 'LR') {
            dagreGraph.setGraph({ 
                rankdir: direction, 
                ranksep: 200,
                nodesep: 80,
                edgesep: 20,
                marginx: 40,
                marginy: 40
            });
        } else {
            dagreGraph.setGraph({ 
                rankdir: direction, 
                ranksep: 150,
                nodesep: 100,
                edgesep: 20,
                marginx: 40,
                marginy: 40
            });
        }

        nodes.forEach((node) => {
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
    }, []);

    // Navigate to specific employee
    const navigateToEmployee = useCallback((employeeId) => {
        const employee = orgChart?.find(emp => emp.employee_id === employeeId);
        if (employee) {
            const cleanEmployee = cleanEmployeeData(employee);
            setSelectedEmployee(cleanEmployee);
            
            // Ensure the employee's path is expanded
            const pathToEmployee = [];
            let current = employee;
            while (current && current.line_manager_id) {
                pathToEmployee.push(current.line_manager_id);
                current = orgChart.find(emp => emp.employee_id === current.line_manager_id);
            }
            
            // Expand all nodes in the path
            const newExpandedNodes = [...new Set([...expandedNodes, ...pathToEmployee])];
            setExpandedNodes(newExpandedNodes);
        }
    }, [orgChart, expandedNodes, setExpandedNodes, setSelectedEmployee]);

    // Fixed hierarchy building with better expansion logic
    const buildOrgHierarchy = useCallback((employees, expandedNodeIds) => {
        console.log('Building hierarchy from', employees?.length, 'employees, expanded:', expandedNodeIds?.length);
        
        if (!Array.isArray(employees) || employees.length === 0) {
            return { visibleNodes: [], edges: [] };
        }

        const cleanEmployees = employees.map(cleanEmployeeData).filter(Boolean);
        
        // Create employee map for quick lookup
        const employeeMap = new Map();
        cleanEmployees.forEach(emp => {
            employeeMap.set(emp.employee_id, { 
                ...emp, 
                children: [], 
                isVisible: false 
            });
        });

        // Build parent-child relationships
        const rootEmployees = [];
        cleanEmployees.forEach(emp => {
            const managerId = emp.line_manager_id;
            
            if (managerId && employeeMap.has(managerId)) {
                const manager = employeeMap.get(managerId);
                const employee = employeeMap.get(emp.employee_id);
                manager.children.push(employee);
                employee.parent = manager;
            } else {
                const employee = employeeMap.get(emp.employee_id);
                rootEmployees.push(employee);
            }
        });

        console.log('Root employees found:', rootEmployees.length);

        // Fallback strategies if no roots found
        if (rootEmployees.length === 0) {
            const maxReports = Math.max(...cleanEmployees.map(emp => emp.direct_reports || 0));
            if (maxReports > 0) {
                const candidates = cleanEmployees.filter(emp => (emp.direct_reports || 0) === maxReports);
                candidates.forEach(emp => rootEmployees.push(employeeMap.get(emp.employee_id)));
                console.log('Fallback: Found roots by direct_reports:', rootEmployees.length);
            }

            if (rootEmployees.length === 0) {
                cleanEmployees.slice(0, 3).forEach(emp => rootEmployees.push(employeeMap.get(emp.employee_id)));
                console.log('Fallback: Using first 3 employees as roots');
            }
        }

        // Mark visible nodes based on expansion state
        const expandedSet = new Set(expandedNodeIds || []);
        const visibleEmployees = [];

        // Always show root employees
        const markVisible = (employee, shouldShow = true) => {
            if (!employee) return;
            
            if (shouldShow) {
                employee.isVisible = true;
                visibleEmployees.push(employee);
                
                // FIXED: If this node is expanded AND has children, show ALL children
                if (expandedSet.has(employee.employee_id) && employee.children.length > 0) {
                    console.log(`Expanding ${employee.name} (${employee.employee_id}) - showing ${employee.children.length} children`);
                    employee.children.forEach(child => {
                        markVisible(child, true);  // Show all direct children
                    });
                }
            }
        };

        // Start with root employees - always visible
        rootEmployees.forEach(root => {
            markVisible(root, true);
        });

        console.log('Visible employees calculated:', visibleEmployees.length);

        // Create React Flow nodes with navigation support
        const nodes = visibleEmployees.map(emp => ({
            id: emp.employee_id.toString(),
            type: 'employee',
            position: { x: 0, y: 0 },
            data: {
                employee: emp,
                isExpanded: expandedSet.has(emp.employee_id),
                onToggleExpanded: (employeeId) => {
                    console.log('Toggle requested for:', employeeId);
                    toggleExpandedNode(employeeId);
                },
                onSelectEmployee: setSelectedEmployee,
                onNavigateToEmployee: navigateToEmployee
            }
        }));

        // Create React Flow edges with enhanced styling
        const edges = visibleEmployees
            .filter(emp => emp.parent && emp.parent.isVisible)
            .map(emp => ({
                id: `edge-${emp.parent.employee_id}-${emp.employee_id}`,
                source: emp.parent.employee_id.toString(),
                target: emp.employee_id.toString(),
                type: 'smoothstep',
                animated: false,
                style: { 
                    stroke: '#30539b', 
                    strokeWidth: 2,
                    opacity: 0.8
                },
                markerEnd: {
                    type: 'arrowclosed',
                    color: '#30539b',
                    width: 20,
                    height: 20
                }
            }));

        console.log('Hierarchy complete:', { nodes: nodes.length, edges: edges.length });
        return { visibleNodes: nodes, edges };
    }, [toggleExpandedNode, setSelectedEmployee, navigateToEmployee]);


  const handleExportToPNG = useCallback(async () => {
    try {
        // Find the chart container
        const chartContainer = containerRef.current?.querySelector('.react-flow') || 
                              containerRef.current?.querySelector('[class*="react-flow"]') ||
                              containerRef.current;
        
        if (!chartContainer) {
            console.error('Chart container not found');
            return;
        }

        // Take screenshot with html2canvas
        const canvas = await html2canvas(chartContainer, {
            allowTaint: false,
            useCORS: true,
            backgroundColor: darkMode ? '#0f172a' : '#e7ebf1',
            scale: 2, // High resolution
            scrollX: 0,
            scrollY: 0,
            width: chartContainer.scrollWidth,
            height: chartContainer.scrollHeight,
            logging: false,
            removeContainer: true,
            foreignObjectRendering: true,
            imageTimeout: 10000
        });

        // Convert to blob and auto-download
        canvas.toBlob((blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `org-chart-${new Date().toISOString().slice(0, 10)}.png`;
                
                // Auto-click download
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Cleanup
                URL.revokeObjectURL(url);
                
                console.log('Screenshot downloaded successfully');
            }
        }, 'image/png', 0.9);

    } catch (error) {
        console.error('Screenshot failed:', error);
        // Silent fallback - try with different options
        fallbackScreenshot();
    }
}, [darkMode, containerRef]);
const fallbackScreenshot = useCallback(async () => {
    try {
        const element = containerRef.current;
        if (!element) return;

        const canvas = await html2canvas(element, {
            backgroundColor: darkMode ? '#0f172a' : '#e7ebf1',
            scale: 1,
            logging: false,
            useCORS: true,
            allowTaint: false
        });

        canvas.toBlob((blob) => {
            if (blob) {
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `org-chart-fallback-${Date.now()}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }
        }, 'image/png', 0.8);

    } catch (error) {
        console.error('Fallback screenshot also failed:', error);
    }
}, [darkMode, containerRef]);

    // Enhanced Controls Panel
    const EnhancedControlsPanel = () => {
        const { zoomIn, zoomOut, fitView, getViewport } = useReactFlow();
        const [currentZoom, setCurrentZoom] = useState(1);
        
        useEffect(() => {
            const updateZoom = () => {
                const viewport = getViewport();
                setCurrentZoom(Math.round(viewport.zoom * 100) / 100);
            };
            
            updateZoom();
            const interval = setInterval(updateZoom, 100);
            return () => clearInterval(interval);
        }, [getViewport]);
        
        const handleZoomToFit = useCallback(() => {
            fitView({ 
                duration: 800,
                padding: 0.1,
                includeHiddenNodes: false,
                minZoom: 0.1,
                maxZoom: 1.5
            });
        }, [fitView]);
        
        const handleSmartZoom = useCallback(() => {
            const viewport = getViewport();
            
            if (viewport.zoom > 1) {
                zoomOut({ duration: 500 });
            } else if (viewport.zoom < 0.3) {
                fitView({ padding: 0.2, duration: 500 });
            } else {
                handleZoomToFit();
            }
        }, [getViewport, zoomOut, fitView, handleZoomToFit]);
        
        const setZoomLevel = useCallback((level) => {
            const { zoomTo } = useReactFlow();
            zoomTo(level, { duration: 300 });
        }, []);
        
        return (
            <Panel position="top-left" className="space-y-2">
                <div className={`${bgCard} border ${borderColor} rounded-lg shadow-lg p-2 space-y-1`}>
                    {/* Zoom Level Display */}
                    <div className={`text-center text-xs ${textMuted} font-mono pb-1 border-b ${borderColor}`}>
                        {Math.round(currentZoom * 100)}%
                    </div>
                    
                    
                    
                    {/* Traditional Controls */}
                    <button 
                        onClick={() => zoomIn({ duration: 300 })}
                        className={`w-full h-8 p-2 ${bgCard} ${textPrimary} border ${borderColor} rounded-md hover:${bgCardHover} transition-colors flex items-center justify-center`}
                        title="Zoom In"
                    >
                        <ZoomIn size={16} />
                    </button>
                    <button 
                        onClick={() => zoomOut({ duration: 300 })}
                        className={`w-full h-8 ${bgCard} ${textPrimary} border ${borderColor} rounded-md hover:${bgCardHover} transition-colors flex items-center justify-center`}
                        title="Zoom Out"
                    >
                        <ZoomOut size={16} />
                    </button>
                    <button 
                        onClick={handleZoomToFit}
                        className={`w-full h-8 ${bgCard} ${textPrimary} border ${borderColor} rounded-md hover:${bgCardHover} transition-colors flex items-center justify-center`}
                        title="Fit to View"
                    >
                        <Maximize2 size={16} />
                    </button>
                    <button 
                        onClick={handleSmartZoom}
                        className={`w-full h-8 ${bgCard} ${textPrimary} border ${borderColor} rounded-md hover:${bgCardHover} transition-colors flex items-center justify-center`}
                        title="Smart Zoom"
                    >
                        <Target size={16} />
                    </button>
                </div>
            </Panel>
        );
    };

  

    // Main FlowComponent
    const FlowComponent = useCallback(() => {
        const [nodes, setNodes, onNodesChange] = useNodesState([]);
        const [edges, setEdges, onEdgesChange] = useEdgesState([]);
        const { fitView } = useReactFlow();

        // Process data when filteredOrgChart or expandedNodes change
        useEffect(() => {
            console.log('FlowComponent effect triggered:', {
                hasData: !!filteredOrgChart,
                dataLength: filteredOrgChart?.length || 0,
                expandedCount: expandedNodes?.length || 0
            });

            if (Array.isArray(filteredOrgChart) && filteredOrgChart.length > 0) {
                const hierarchy = buildOrgHierarchy(filteredOrgChart, expandedNodes || []);
                
                if (hierarchy.visibleNodes.length > 0) {
                    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                        hierarchy.visibleNodes,
                        hierarchy.edges,
                        layoutDirection
                    );
                    
                    console.log('Setting nodes and edges:', layoutedNodes.length, layoutedEdges.length);
                    setNodes(layoutedNodes);
                    setEdges(layoutedEdges);
                    
                    // Fit view after layout
                    setTimeout(() => fitView({ padding: 0.1, minZoom: 0.1, maxZoom: 1.5 }), 100);
                } else {
                    console.log('No visible nodes to display');
                    setNodes([]);
                    setEdges([]);
                }
            } else {
                setNodes([]);
                setEdges([]);
            }
        }, [filteredOrgChart, expandedNodes, layoutDirection, buildOrgHierarchy, getLayoutedElements, setNodes, setEdges, fitView]);

        const onLayout = useCallback((direction) => {
            console.log('Layout change requested:', direction);
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                nodes,
                edges,
                direction
            );
            setNodes([...layoutedNodes]);
            setEdges([...layoutedEdges]);
            setLayoutDirection(direction);
            setTimeout(() => fitView({ padding: 0.1, minZoom: 0.1, maxZoom: 1.5 }), 0);
        }, [nodes, edges, setNodes, setEdges, fitView, getLayoutedElements, setLayoutDirection]);

        // Fixed expand/collapse handlers
        const handleExpandAll = useCallback(() => {
            console.log('Expand All clicked - expanding all employees');
            if (orgChart && orgChart.length > 0) {
                // Get all employees who have direct reports
                const managersWithReports = orgChart
                    .filter(emp => emp.direct_reports && emp.direct_reports > 0)
                    .map(emp => emp.employee_id);
                
                console.log('Expanding managers:', managersWithReports.length);
                setExpandedNodes(managersWithReports);
            }
        }, [orgChart, setExpandedNodes]);

        const handleCollapseAll = useCallback(() => {
            console.log('Collapse All clicked - collapsing to roots only');
            // Find root employees and keep only them expanded
            if (orgChart && orgChart.length > 0) {
                const rootEmployees = orgChart.filter(emp => 
                    !emp.line_manager_id && !emp.manager_id && !emp.parent_id
                );
                
                if (rootEmployees.length === 0) {
                    // Fallback: find by highest level or most reports
                    const maxReports = Math.max(...orgChart.map(emp => emp.direct_reports || 0));
                    const fallbackRoots = orgChart
                        .filter(emp => (emp.direct_reports || 0) === maxReports)
                        .map(emp => emp.employee_id);
                    
                    console.log('Collapsing to fallback roots:', fallbackRoots);
                    setExpandedNodes(fallbackRoots);
                } else {
                    const rootIds = rootEmployees.map(emp => emp.employee_id);
                    console.log('Collapsing to root employees:', rootIds);
                    setExpandedNodes(rootIds);
                }
            }
        }, [orgChart, setExpandedNodes]);

        // Memoized node types to prevent recreation warning
        const nodeTypes = useMemo(() => ({
            employee: EmployeeNode,
        }), []);

        if (!nodes || nodes.length === 0) {
            return (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <RefreshCw className={`w-8 h-8 ${textMuted} animate-spin mx-auto mb-4`} />
                        <p className={`${textSecondary}`}>
                            {isLoading ? 'Loading organizational chart...' : 'No data available'}
                        </p>
                        {filteredOrgChart?.length > 0 && expandedNodes?.length === 0 && (
                            <p className={`${textMuted} text-sm mt-2`}>
                                Click "Expand All" or the + buttons to see the organization structure
                            </p>
                        )}
                    </div>
                </div>
            );
        }

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
                style={{ backgroundColor: darkMode ? '#0f172a' : '#e7ebf1' }}
                fitViewOptions={{ padding: 0.1, minZoom: 0.1, maxZoom: 1.5 }}
                defaultEdgeOptions={{
                    type: 'smoothstep',
                    animated: false,
                    style: { 
                        stroke: '#30539b', 
                        strokeWidth: 2,
                        opacity: 0.8
                    },
                    markerEnd: {
                        type: 'arrowclosed',
                        color: '#30539b',
                        width: 16,
                        height: 16
                    }
                }}
            >
                <Background 
                    color={darkMode ? '#334155' : '#90a0b9'} 
                    gap={20} 
                    variant="dots"
                />
                
                {/* Enhanced Controls */}
                <EnhancedControlsPanel />
                
             
                
                {/* Layout Controls */}
                <Panel position="top-right" className="space-x-2">
                    <button 
                        onClick={() => onLayout('TB')}
                        className={`px-3 py-2 ${bgCard} ${textPrimary} border ${borderColor} rounded-lg hover:${bgCardHover} transition-colors text-sm font-medium ${layoutDirection === 'TB' ? 'bg-almet-sapphire text-white' : ''}`}
                    >
                        Vertical
                    </button>
                    <button 
                        onClick={() => onLayout('LR')}
                        className={`px-3 py-2 ${bgCard} ${textPrimary} border ${borderColor} rounded-lg hover:${bgCardHover} transition-colors text-sm font-medium ${layoutDirection === 'LR' ? 'bg-almet-sapphire text-white' : ''}`}
                    >
                        Horizontal
                    </button>
                    <button 
                        onClick={handleExpandAll}
                        className={`px-3 py-2 ${bgCard} ${textPrimary} border ${borderColor} rounded-lg hover:${bgCardHover} transition-colors text-sm font-medium`}
                    >
                        Expand All
                    </button>
                    <button 
                        onClick={handleCollapseAll}
                        className={`px-3 py-2 ${bgCard} ${textPrimary} border ${borderColor} rounded-lg hover:${bgCardHover} transition-colors text-sm font-medium`}
                    >
                        Collapse All
                    </button>
                </Panel>

            </ReactFlow>
        );
    }, [
        filteredOrgChart,
        expandedNodes, 
        layoutDirection, 
        buildOrgHierarchy,
        getLayoutedElements, 
        setLayoutDirection,
        darkMode, 
        bgCard, 
        textPrimary, 
        borderColor, 
        bgCardHover, 
        isLoading,
        textMuted,
        textSecondary,
        orgChart,
        setExpandedNodes
    ]);

    // Grid View Component
    const GridView = useCallback(() => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
            {filteredOrgChart.map(employee => {
                const cleanEmployee = cleanEmployeeData(employee);
                return (
                    <div 
                        key={employee.employee_id}
                        className={`${bgCard} border ${borderColor} rounded-2xl p-6 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105`}
                        onClick={() => setSelectedEmployee(cleanEmployee)}
                    >
                        <div className="flex items-start gap-4 mb-4">
                            <Avatar employee={cleanEmployee} size="md" />
                            <div className="flex-1 min-w-0">
                                <h3 className={`font-bold ${textHeader} text-base leading-tight mb-2`}>
                                    {cleanEmployee.name}
                                </h3>
                                <p className={`${textSecondary} text-sm`}>
                                    {cleanEmployee.title}
                                </p>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <div className={`flex items-center ${textSecondary} text-sm`}>
                                <Building2 className="w-4 h-4 mr-2" />
                                <span>{cleanEmployee.department}</span>
                            </div>
                            {cleanEmployee.direct_reports > 0 && (
                                <div className={`flex items-center ${textSecondary} text-sm`}>
                                    <Users className="w-4 h-4 mr-2" />
                                    <span>{cleanEmployee.direct_reports} Reports</span>
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    ), [filteredOrgChart, bgCard, borderColor, textHeader, textSecondary, setSelectedEmployee]);

    // Auto-expand initial nodes when org chart loads
    useEffect(() => {
        if (Array.isArray(orgChart) && orgChart.length > 0 && (!expandedNodes || expandedNodes.length === 0)) {
            console.log('Auto-expanding initial nodes for', orgChart.length, 'employees');
            
            // Find root employees using multiple strategies
            let rootEmployees = [];
            
            // Strategy 1: Find employees without any manager
            rootEmployees = orgChart.filter(emp => 
                !emp.line_manager_id && !emp.manager_id && !emp.parent_id
            );
            console.log('Strategy 1 - No manager ID:', rootEmployees.length);
            
            // Strategy 2: Find by minimum level_to_ceo
            if (rootEmployees.length === 0) {
                const levels = orgChart.map(emp => emp.level_to_ceo).filter(level => level !== undefined && level !== null);
                if (levels.length > 0) {
                    const minLevel = Math.min(...levels);
                    rootEmployees = orgChart.filter(emp => emp.level_to_ceo === minLevel);
                    console.log(`Strategy 2 - Min level ${minLevel}:`, rootEmployees.length);
                }
            }
            
            // Strategy 3: Find by maximum direct_reports
            if (rootEmployees.length === 0) {
                const maxReports = Math.max(...orgChart.map(emp => emp.direct_reports || 0));
                if (maxReports > 0) {
                    rootEmployees = orgChart.filter(emp => (emp.direct_reports || 0) === maxReports);
                    console.log(`Strategy 3 - Max reports ${maxReports}:`, rootEmployees.length);
                }
            }
            
            // Strategy 4: Find by position hierarchy
            if (rootEmployees.length === 0) {
                const topPositions = ['VC', 'CEO', 'CHAIRMAN', 'PRESIDENT', 'DIRECTOR'];
                for (const position of topPositions) {
                    rootEmployees = orgChart.filter(emp => 
                        emp.position_group?.toUpperCase().includes(position) || 
                        emp.title?.toUpperCase().includes(position)
                    );
                    if (rootEmployees.length > 0) {
                        console.log(`Strategy 4 - Position ${position}:`, rootEmployees.length);
                        break;
                    }
                }
            }
            
            // Strategy 5: Use first few employees as fallback
            if (rootEmployees.length === 0) {
                rootEmployees = orgChart.slice(0, Math.min(3, orgChart.length));
                console.log('Strategy 5 - Fallback to first 3:', rootEmployees.length);
            }
            
            // Set initial expanded nodes
            const initialExpanded = rootEmployees.map(emp => emp.employee_id);
            console.log('Setting initial expanded nodes:', initialExpanded);
            setExpandedNodes(initialExpanded);
        }
    }, [orgChart, expandedNodes, setExpandedNodes]);

    // Loading overlay
    if (loading.orgChart && (!orgChart || orgChart.length === 0)) {
        return (
            <DashboardLayout>
                <div className={`h-full ${bgApp} flex items-center justify-center`}>
                    <div className="text-center">
                        <RefreshCw className={`w-8 h-8 ${textMuted} animate-spin mx-auto mb-4`} />
                        <p className={`${textSecondary}`}>Loading organizational chart...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div ref={containerRef} className={`${isFullscreen ? 'fixed inset-0 z-50' : 'h-full'} ${bgApp} flex flex-col org-chart-container`}>
                {/* Header */}
                <div className={`${bgCard} shadow-lg border-b ${borderColor} sticky top-0 z-30 backdrop-blur-md`}>
                    <div className="px-4 py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gradient-to-br from-almet-sapphire to-almet-cloud-burst rounded-lg flex items-center justify-center shadow-lg">
                                    <Building2 className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                    <h1 className={`text-base font-bold ${textHeader}`}>Organizational Chart</h1>
                                    <div className="flex items-center gap-4 text-xs">
                                        <p className={`${textSecondary}`}>
                                            Total: {summary.totalEmployees || orgChart?.length || 0}
                                        </p>
                                        <p className={`${textSecondary}`}>
                                            Managers: {summary.totalManagers || 0}
                                        </p>
                                        {filteredOrgChart.length !== orgChart?.length && (
                                            <p className={`${textSecondary}`}>
                                                Filtered: {filteredOrgChart.length}
                                            </p>
                                        )}
                                        {expandedNodes?.length > 0 && (
                                            <p className={`${textSecondary}`}>
                                                Expanded: {expandedNodes.length}
                                            </p>
                                        )}
                                        {isLoading && (
                                            <RefreshCw className={`w-3 h-3 ${textMuted} animate-spin`} />
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                {/* Search */}
                                <div className="relative">
                                    <Search className={`absolute left-2.5 top-1/2 transform -translate-y-1/2 ${textMuted} w-3.5 h-3.5 pointer-events-none`} />
                                    <input 
                                        type="text" 
                                        placeholder="Search employees..." 
                                        value={filters.search || ''} 
                                        onChange={(e) => updateFilter('search', e.target.value)} 
                                        className={`pl-8 pr-7 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-almet-sapphire focus:border-almet-sapphire w-44 ${bgCard} ${textPrimary} text-sm transition-all duration-200 shadow-sm`} 
                                    />
                                </div>
                               
                                
                                {/* View Mode Toggle */}
                                <div className={`flex rounded-lg border ${borderColor} ${bgCard} p-0.5 shadow-sm`}>
                                    <button 
                                        onClick={() => setViewMode('tree')} 
                                        className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${viewMode === 'tree' ? 'bg-almet-sapphire text-white shadow-sm' : `${textMuted} hover:${textPrimary} hover:${bgAccent}`}`}
                                    >
                                        <TreePine size={14} />Tree
                                    </button>
                                    <button 
                                        onClick={() => setViewMode('grid')} 
                                        className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 ${viewMode === 'grid' ? 'bg-almet-sapphire text-white shadow-sm' : `${textMuted} hover:${textPrimary} hover:${bgAccent}`}`}
                                    >
                                        <Grid size={14} />Grid
                                    </button>
                                </div>
                                
                                {/* Control Buttons */}
                                <button 
                                    onClick={() => setShowFilters(!showFilters)} 
                                    title="Advanced Filters"
                                    className={`p-2 border ${borderColor} rounded-lg hover:${bgAccent} transition-all duration-200 ${bgCard} ${textPrimary} shadow-sm relative`}
                                >
                                    <Filter size={14} />
                                    {hasActiveFilters() && (
                                        <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-almet-sapphire rounded-full border border-white"></div>
                                    )}
                                </button>
                                
                                <button 
                                    onClick={handleExportToPNG} 
                                    title="Export Chart (SVG)"
                                    className={`p-2 border ${borderColor} rounded-lg hover:${bgAccent} transition-all duration-200 ${bgCard} ${textMuted} hover:${textPrimary} shadow-sm flex items-center gap-1`}
                                >
                                    <Download size={14} />
                                    <span className="text-xs hidden sm:inline">Export</span>
                                </button>
                                
                                <button 
                                    onClick={toggleFullscreen} 
                                    title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                                    className={`p-2 border ${borderColor} rounded-lg hover:${bgAccent} transition-all duration-200 ${bgCard} ${textMuted} hover:${textPrimary} shadow-sm`}
                                >
                                    {isFullscreen ? <Shrink size={14} /> : <Expand size={14} />}
                                </button>

                                <button 
                                    onClick={() => fetchOrgChart()}
                                    disabled={isLoading}
                                    title="Refresh"
                                    className={`p-2 border ${borderColor} rounded-lg hover:${bgAccent} transition-all duration-200 ${bgCard} ${textMuted} hover:${textPrimary} shadow-sm disabled:opacity-50`}
                                >
                                    <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Advanced Filters Panel */}
                {showFilters && (
                    <div className={`${bgCard} border-b ${borderColor} shadow-md sticky ${isFullscreen ? 'top-[57px]' : 'top-[65px]'} z-20 backdrop-blur-sm`}>
                        <div className="px-4 py-3">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className={`text-sm font-semibold ${textHeader} flex items-center gap-2`}>
                                    <Filter size={16} />
                                    Advanced Filters
                                </h3>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={clearFilters} 
                                        className={`text-xs ${textMuted} hover:text-almet-sapphire transition-colors hover:underline font-medium`}
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
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                {/* Business Functions */}
                                <div>
                                    <label className={`block text-xs font-medium ${textSecondary} mb-1.5`}>Business Functions</label>
                                    <Select
                                        isMulti
                                        placeholder="Select functions..."
                                        options={filterOptions.businessFunctions}
                                        value={filterOptions.businessFunctions?.filter(opt => 
                                            filters.business_function?.includes(opt.value)
                                        )}
                                        onChange={(selected) => 
                                            updateFilter('business_function', selected ? selected.map(s => s.value) : [])
                                        }
                                        styles={selectStyles}
                                        className="text-sm"
                                    />
                                </div>

                                {/* Departments */}
                                <div>
                                    <label className={`block text-xs font-medium ${textSecondary} mb-1.5`}>Departments</label>
                                    <Select
                                        isMulti
                                        placeholder="Select departments..."
                                        options={filterOptions.departments}
                                        value={filterOptions.departments?.filter(opt => 
                                            filters.department?.includes(opt.value)
                                        )}
                                        onChange={(selected) => 
                                            updateFilter('department', selected ? selected.map(s => s.value) : [])
                                        }
                                        styles={selectStyles}
                                        className="text-sm"
                                    />
                                </div>

                                {/* Position Groups */}
                                <div>
                                    <label className={`block text-xs font-medium ${textSecondary} mb-1.5`}>Position Groups</label>
                                    <Select
                                        isMulti
                                        placeholder="Select positions..."
                                        options={filterOptions.positionGroups}
                                        value={filterOptions.positionGroups?.filter(opt => 
                                            filters.position_group?.includes(opt.value)
                                        )}
                                        onChange={(selected) => 
                                            updateFilter('position_group', selected ? selected.map(s => s.value) : [])
                                        }
                                        styles={selectStyles}
                                        className="text-sm"
                                    />
                                </div>

                                {/* Managers */}
                                <div>
                                    <label className={`block text-xs font-medium ${textSecondary} mb-1.5`}>Line Managers</label>
                                    <Select
                                        isMulti
                                        placeholder="Select managers..."
                                        options={filterOptions.managers}
                                        value={filterOptions.managers?.filter(opt => 
                                            filters.line_manager?.includes(opt.value)
                                        )}
                                        onChange={(selected) => 
                                            updateFilter('line_manager', selected ? selected.map(s => s.value) : [])
                                        }
                                        styles={selectStyles}
                                        className="text-sm"
                                    />
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

                {/* Enhanced Employee Detail Modal - More compact */}
                {selectedEmployee && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-200 ease-in-out">
                        <div className={`${bgCard} rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col border ${borderColor}`}>
                            {/* Compact Header */}
                            <div className={`flex items-center justify-between p-4 border-b ${borderColor} sticky top-0 ${bgCard} rounded-t-xl z-10`}>
                                <div className="flex items-center gap-3">
                                    <Avatar employee={selectedEmployee} size="md" />
                                    <div>
                                        <h2 className={`text-lg font-bold ${textHeader} mb-1`}>{selectedEmployee.name}</h2>
                                        <p className={`${textSecondary} text-sm mb-1`}>{selectedEmployee.title}</p>
                                        <div className="flex items-center gap-2">
                                            {selectedEmployee.employee_details?.grading_display && (
                                                <span className="inline-flex items-center px-2 py-1 rounded text-xs font-bold text-white bg-almet-sapphire">
                                                    {selectedEmployee.employee_details.grading_display}
                                                </span>
                                            )}
                                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${bgAccent} ${textPrimary}`}>
                                                {selectedEmployee.department || 'No Department'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={clearSelectedEmployee} className={`${textMuted} hover:${textPrimary} p-2 hover:${bgAccent} rounded-lg transition-colors`}>
                                    <X size={20} aria-label="Close modal"/>
                                </button>
                            </div>

                            <div className="p-4 overflow-y-auto flex-grow">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                    {/* Left Column - Basic Details */}
                                    <div className="space-y-4">
                                        {/* Employee Details Card */}
                                        <div className={`${bgAccent} rounded-lg p-3 border ${borderColor}`}>
                                            <h4 className={`font-bold ${textHeader} mb-3 text-sm uppercase tracking-wider flex items-center gap-2`}>
                                                <User size={14} />
                                                Employee Details
                                            </h4>
                                            <div className="space-y-2">
                                                <DetailRow 
                                                    icon={<Target />} 
                                                    label="Level to CEO" 
                                                    value={selectedEmployee.level_to_ceo || 0} 
                                                />
                                                <DetailRow 
                                                    icon={<Building2 />} 
                                                    label="Department" 
                                                    value={selectedEmployee.department || 'N/A'} 
                                                />
                                                <DetailRow 
                                                    icon={<Layers />} 
                                                    label="Unit" 
                                                    value={selectedEmployee.unit || 'N/A'} 
                                                />
                                                <DetailRow 
                                                    icon={<Briefcase />} 
                                                    label="Position Group" 
                                                    value={selectedEmployee.position_group || 'N/A'} 
                                                />
                                            </div>
                                        </div>
                                        
                                        {/* Contact Information Card */}
                                        <div className={`${bgAccent} rounded-lg p-3 border ${borderColor}`}>
                                            <h4 className={`font-bold ${textHeader} mb-3 text-sm uppercase tracking-wider flex items-center gap-2`}>
                                                <Phone size={14} />
                                                Contact
                                            </h4>
                                            <div className="space-y-2">
                                                <DetailRow 
                                                    icon={<Phone />} 
                                                    label="Phone" 
                                                    value={selectedEmployee.phone || 'Not provided'} 
                                                />
                                                <DetailRow 
                                                    icon={<Mail />} 
                                                    label="Email" 
                                                    value={selectedEmployee.email || 'Not provided'} 
                                                />
                                            </div>
                                        </div>

                                        {/* Team Metrics Card */}
                                        <div className={`${bgAccent} rounded-lg p-3 border ${borderColor}`}>
                                            <h4 className={`font-bold ${textHeader} mb-3 text-sm uppercase tracking-wider flex items-center gap-2`}>
                                                <Users size={14} />
                                                Team Metrics
                                            </h4>
                                            <div className="grid grid-cols-2 gap-2">
                                                <MetricCard 
                                                    icon={<Users />} 
                                                    label="Direct Reports" 
                                                    value={selectedEmployee.direct_reports || 0}
                                                    color="blue"
                                                />
                                                <MetricCard 
                                                    icon={<UsersRound />} 
                                                    label="Total Team" 
                                                    value={(() => {
                                                        const calculateTeamSize = (managerId, visited = new Set()) => {
                                                            if (visited.has(managerId)) return 0;
                                                            visited.add(managerId);
                                                            
                                                            const directReports = orgChart?.filter(emp => emp.line_manager_id === managerId) || [];
                                                            let total = directReports.length;
                                                            
                                                            directReports.forEach(report => {
                                                                total += calculateTeamSize(report.employee_id, visited);
                                                            });
                                                            
                                                            return total;
                                                        };
                                                        return calculateTeamSize(selectedEmployee.employee_id);
                                                    })()}
                                                    color="green"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column - Organizational Relationships */}
                                    <div className="space-y-4">
                                        {/* Reports To (Manager) Section */}
                                        {selectedEmployee.line_manager_id && (
                                            <div className={`${bgAccent} rounded-lg p-3 border ${borderColor}`}>
                                                <h4 className={`font-bold ${textHeader} mb-3 text-sm uppercase tracking-wider flex items-center gap-2`}>
                                                    <Crown size={14} />
                                                    Reports To
                                                </h4>
                                                {(() => {
                                                    const manager = orgChart?.find(emp => emp.employee_id === selectedEmployee.line_manager_id);
                                                    return manager ? (
                                                        <div 
                                                            className={`flex items-center gap-3 p-3 ${bgCard} rounded-lg cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.01] border ${borderColor}`}
                                                            onClick={() => {
                                                                const cleanManager = cleanEmployeeData(manager);
                                                                setSelectedEmployee(cleanManager);
                                                            }}
                                                        >
                                                            <Avatar employee={manager} size="sm" />
                                                            <div className="flex-1 min-w-0">
                                                                <h5 className={`font-bold ${textHeader} text-sm mb-1`}>{manager.name}</h5>
                                                                <p className={`${textSecondary} text-xs mb-1`}>{manager.title}</p>
                                                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${bgAccent} ${textPrimary}`}>
                                                                    {manager.department}
                                                                </span>
                                                            </div>
                                                            <ArrowUp className={`w-4 h-4 text-almet-sapphire`} />
                                                        </div>
                                                    ) : (
                                                        <p className={`${textMuted} text-sm italic`}>Manager information not available</p>
                                                    );
                                                })()}
                                            </div>
                                        )}

                                        {/* Direct Reports Section */}
                                        {selectedEmployee.direct_reports > 0 && (
                                            <div className={`${bgAccent} rounded-lg p-3 border ${borderColor}`}>
                                                <h4 className={`font-bold ${textHeader} mb-3 text-sm uppercase tracking-wider flex items-center gap-2`}>
                                                    <Users size={14} />
                                                    Direct Reports ({selectedEmployee.direct_reports})
                                                </h4>
                                                <div className="space-y-2 max-h-64 overflow-y-auto">
                                                    {orgChart?.filter(emp => emp.line_manager_id === selectedEmployee.employee_id).map(report => (
                                                        <div 
                                                            key={report.employee_id}
                                                            className={`flex items-center gap-2 p-2 ${bgCard} rounded-lg cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.01] border ${borderColor}`}
                                                            onClick={() => {
                                                                const cleanReport = cleanEmployeeData(report);
                                                                setSelectedEmployee(cleanReport);
                                                            }}
                                                        >
                                                            <Avatar employee={report} size="sm" />
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`font-bold ${textPrimary} text-xs mb-1 truncate`}>{report.name}</p>
                                                                <p className={`${textSecondary} text-xs truncate`}>{report.title}</p>
                                                            </div>
                                                            <ArrowDown className={`w-3 h-3 text-almet-sapphire flex-shrink-0`} />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Unit Colleagues */}
                                        {selectedEmployee.unit && (
                                            <div className={`${bgAccent} rounded-lg p-3 border ${borderColor}`}>
                                                <h4 className={`font-bold ${textHeader} mb-3 text-sm uppercase tracking-wider flex items-center gap-2`}>
                                                    <Building2 size={14} />
                                                    Unit Colleagues
                                                </h4>
                                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                                    {orgChart?.filter(emp => 
                                                        emp.unit === selectedEmployee.unit && 
                                                        emp.employee_id !== selectedEmployee.employee_id
                                                    ).slice(0, 6).map(colleague => (
                                                        <div 
                                                            key={colleague.employee_id}
                                                            className={`flex items-center gap-2 p-2 ${bgCard} rounded-lg cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-[1.01] border ${borderColor}`}
                                                            onClick={() => {
                                                                const cleanColleague = cleanEmployeeData(colleague);
                                                                setSelectedEmployee(cleanColleague);
                                                            }}
                                                        >
                                                            <Avatar employee={colleague} size="sm" />
                                                            <div className="flex-1 min-w-0">
                                                                <p className={`font-semibold ${textPrimary} text-xs truncate`}>{colleague.name}</p>
                                                                <p className={`${textSecondary} text-xs truncate`}>{colleague.title}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {hasErrors && (
                    <div className="fixed bottom-4 right-4 z-50">
                        <div className={`${bgCard} border border-red-300 rounded-lg shadow-lg p-4 max-w-sm`}>
                            <div className="flex items-start gap-3">
                                <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <X className="w-3 h-3 text-red-600" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-red-800 dark:text-red-400">Error Loading Data</h4>
                                    <p className="text-xs text-red-600 dark:text-red-300 mt-1">
                                        {errors.orgChart || errors.search || 'An error occurred while loading the organizational chart.'}
                                    </p>
                                </div>
                                <button 
                                    onClick={() => {/* clearErrors() */}}
                                    className="text-red-400 hover:text-red-600 p-1"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Enhanced Styles with Almet colors */}
                <style jsx>{`
                    .line-clamp-2 { 
                        display: -webkit-box; 
                        -webkit-line-clamp: 2; 
                        -webkit-box-orient: vertical; 
                        overflow: hidden; 
                    }

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
                    
                    ::-webkit-scrollbar { 
                        width: 6px; 
                        height: 6px; 
                    }
                    ::-webkit-scrollbar-track { 
                        background: ${darkMode ? 'rgba(56, 88, 125, 0.1)' : 'rgba(231, 235, 241, 0.5)'}; 
                        border-radius: 6px; 
                    }
                    ::-webkit-scrollbar-thumb { 
                        background: ${darkMode ? 'rgba(122, 130, 154, 0.4)' : 'rgba(48, 83, 155, 0.3)'}; 
                        border-radius: 6px; 
                        border: 1px solid transparent;
                        background-clip: content-box;
                    }
                    ::-webkit-scrollbar-thumb:hover { 
                        background: ${darkMode ? 'rgba(122, 130, 154, 0.6)' : 'rgba(48, 83, 155, 0.5)'}; 
                        background-clip: content-box;
                    }
                    
                    button:active {
                        transform: scale(0.98);
                    }
                    
                    button:focus-visible, 
                    input:focus-visible, 
                    select:focus-visible {
                        outline: 2px solid #30539b;
                        outline-offset: 2px;
                    }

                    .react-flow__edge-path {
                        stroke-width: 2;
                        stroke: #30539b;
                        opacity: 0.8;
                        filter: drop-shadow(0 2px 4px rgba(48, 83, 155, 0.2));
                        transition: all 0.3s ease;
                    }

                    .react-flow__edge-path:hover {
                        stroke-width: 3;
                        opacity: 1;
                        stroke: #253360;
                        filter: drop-shadow(0 4px 8px rgba(37, 51, 96, 0.4));
                    }

                    .react-flow__handle {
                        width: 12px !important;
                        height: 12px !important;
                        background: linear-gradient(135deg, #30539b, #253360) !important;
                        border: 2px solid white !important;
                        box-shadow: 0 3px 10px rgba(48, 83, 155, 0.3) !important;
                        opacity: 0.8 !important;
                        transition: all 0.3s ease !important;
                    }

                    .react-flow__handle:hover {
                        background: linear-gradient(135deg, #253360, #2346A8) !important;
                        transform: scale(1.2);
                        opacity: 1 !important;
                        box-shadow: 0 5px 15px rgba(48, 83, 155, 0.5) !important;
                    }

                    .react-flow__node:hover .react-flow__handle {
                        opacity: 1 !important;
                        transform: scale(1.1);
                    }

                    .react-flow__node {
                        animation: float 8s ease-in-out infinite;
                    }

                    @keyframes float {
                        0%, 100% {
                            transform: translateY(0px);
                        }
                        50% {
                            transform: translateY(-1px);
                        }
                    }
                `}</style>
            </div>
        </DashboardLayout>
    );
};

// Enhanced Detail Row Component with Almet colors
const DetailRow = ({ icon, label, value }) => (
    <div className="flex items-center gap-2 py-1.5">
        <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-almet-mystic dark:bg-almet-cloud-burst flex items-center justify-center">
            {React.cloneElement(icon, { className: "w-3 h-3 text-almet-sapphire dark:text-almet-bali-hai" })}
        </div>
        <div className="flex-1 min-w-0">
            <p className="text-xs text-almet-waterloo dark:text-gray-400 font-medium uppercase tracking-wider">{label}</p>
            <p className="text-almet-cloud-burst dark:text-gray-200 font-semibold text-sm truncate" title={value}>{value}</p>
        </div>
    </div>
);

// Enhanced Metric Card Component with Almet colors
const MetricCard = ({ icon, label, value, color = 'blue' }) => {
    const colorClasses = {
        blue: 'bg-almet-mystic dark:bg-almet-cloud-burst/20 border-almet-sapphire/20 dark:border-almet-sapphire/40 text-almet-sapphire dark:text-almet-bali-hai',
        green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400',
        purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400',
        orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400'
    };

    return (
        <div className={`p-2 rounded-lg border ${colorClasses[color]} text-center`}>
            <div className="flex items-center justify-center mb-1">
                {React.cloneElement(icon, { className: "w-4 h-4" })}
            </div>
            <p className="text-lg font-bold mb-1">{value}</p>
            <p className="text-xs font-medium opacity-80">{label}</p>
        </div>
    );
};

export default OrgChart;