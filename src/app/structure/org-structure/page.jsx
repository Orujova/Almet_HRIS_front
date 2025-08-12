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

// React Flow imports
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

// Enhanced EmployeeNode component with proper visibility handling
const EmployeeNode = React.memo(({ data, id }) => {
    const employee = data.employee;
    const directReports = employee.direct_reports || 0;
    const hasChildren = directReports > 0;
    const isExpanded = data.isExpanded;
    const onToggleExpanded = data.onToggleExpanded;
    const onSelectEmployee = data.onSelectEmployee;

    // Position hierarchy colors
    const hierarchyColors = {
        'VC': { primary: '#4e7db5', bg: 'rgba(78, 125, 181, 0.1)', badge: '#30539b' },
        'DIRECTOR': { primary: '#336fa5', bg: 'rgba(51, 111, 165, 0.1)', badge: '#2d5a91' },
        'HEAD OF DEPARTMENT': { primary: '#38587d', bg: 'rgba(56, 88, 125, 0.1)', badge: '#324c6b' },
        'SENIOR SPECIALIST': { primary: '#7a829a', bg: 'rgba(122, 130, 154, 0.1)', badge: '#6b7280' },
        'SPECIALIST': { primary: '#90a0b9', bg: 'rgba(144, 160, 185, 0.1)', badge: '#74839c' },
        'JUNIOR SPECIALIST': { primary: '#9c9cb5', bg: 'rgba(156, 156, 181, 0.1)', badge: '#8b8ca3' },
        'Vice Chairman': { primary: '#4e7db5', bg: 'rgba(78, 125, 181, 0.1)', badge: '#30539b' }
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
                className="!bg-blue-500 !border-2 !border-white !w-3 !h-3 !opacity-100"
                style={{ top: -6 }}
            />
            
            <div 
                className="bg-white dark:bg-slate-800 border-2 rounded-xl shadow-lg transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-105 w-[280px] min-h-[140px]"
                style={{ borderColor: colors.primary }}
                onClick={() => onSelectEmployee?.(employee)}
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
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-blue-50 dark:bg-slate-700 text-gray-700 dark:text-gray-200">
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
                
                {/* Expand/Collapse Button - FIXED: Better positioning and styling */}
                {hasChildren && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            console.log('Toggle clicked for:', employee.employee_id, 'Current expanded:', isExpanded);
                            onToggleExpanded(employee.employee_id);
                        }}
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
            
            {/* Output handle for child connections - only show if has children */}
            {hasChildren && (
                <Handle 
                    type="source" 
                    position={Position.Bottom} 
                    className="!bg-blue-500 !border-2 !border-white !w-3 !h-3 !opacity-100"
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

    // Custom select styles for dark mode
    const selectStyles = {
        control: (provided, state) => ({
            ...provided,
            backgroundColor: darkMode ? '#334155' : '#ffffff',
            borderColor: darkMode ? '#475569' : '#d1d5db',
            color: darkMode ? '#e2e8f0' : '#374151',
            minHeight: '38px',
            boxShadow: state.isFocused ? (darkMode ? '0 0 0 1px #3b82f6' : '0 0 0 1px #3b82f6') : 'none',
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
                ? (darkMode ? '#3b82f6' : '#3b82f6')
                : state.isFocused 
                    ? (darkMode ? '#475569' : '#f3f4f6')
                    : 'transparent',
            color: state.isSelected 
                ? '#ffffff'
                : (darkMode ? '#e2e8f0' : '#374151'),
            '&:hover': {
                backgroundColor: state.isSelected 
                    ? (darkMode ? '#3b82f6' : '#3b82f6')
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
            'VC': { primary: darkMode ? '#4e7db5' : '#30539b', badge: darkMode ? '#30539b' : '#4e7db5' },
            'DIRECTOR': { primary: darkMode ? '#336fa5' : '#2d5a91', badge: darkMode ? '#2d5a91' : '#336fa5' },
            'HEAD OF DEPARTMENT': { primary: darkMode ? '#38587d' : '#324c6b', badge: darkMode ? '#324c6b' : '#38587d' },
            'SENIOR SPECIALIST': { primary: darkMode ? '#7a829a' : '#6b7280', badge: darkMode ? '#6b7280' : '#7a829a' },
            'SPECIALIST': { primary: darkMode ? '#90a0b9' : '#74839c', badge: darkMode ? '#74839c' : '#90a0b9' },
            'JUNIOR SPECIALIST': { primary: darkMode ? '#9c9cb5' : '#8b8ca3', badge: darkMode ? '#8b8ca3' : '#9c9cb5' },
            'Vice Chairman': { primary: darkMode ? '#4e7db5' : '#30539b', badge: darkMode ? '#30539b' : '#4e7db5' }
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

    // Build hierarchy and calculate visible nodes based on expanded state
    const buildOrgHierarchy = useCallback((employees, expandedNodeIds) => {
        console.log('Building hierarchy from', employees?.length, 'employees');
        
        if (!Array.isArray(employees) || employees.length === 0) {
            return { visibleNodes: [], edges: [] };
        }

        // Create employee map for quick lookup
        const employeeMap = new Map();
        employees.forEach(emp => {
            employeeMap.set(emp.employee_id, { ...emp, children: [], isVisible: false });
        });

        // Build parent-child relationships
        const rootEmployees = [];
        employees.forEach(emp => {
            const managerId = emp.line_manager_id || emp.manager_id || emp.parent_id;
            
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

        // If no roots found, use fallback strategies
        if (rootEmployees.length === 0) {
            // Strategy 1: Find by minimum level_to_ceo
            const levels = employees.map(emp => emp.level_to_ceo).filter(level => level !== undefined && level !== null);
            if (levels.length > 0) {
                const minLevel = Math.min(...levels);
                const candidates = employees.filter(emp => emp.level_to_ceo === minLevel);
                candidates.forEach(emp => rootEmployees.push(employeeMap.get(emp.employee_id)));
                console.log('Fallback: Found roots by level_to_ceo:', rootEmployees.length);
            }

            // Strategy 2: Find by maximum direct_reports
            if (rootEmployees.length === 0) {
                const maxReports = Math.max(...employees.map(emp => emp.direct_reports || 0));
                if (maxReports > 0) {
                    const candidates = employees.filter(emp => (emp.direct_reports || 0) === maxReports);
                    candidates.forEach(emp => rootEmployees.push(employeeMap.get(emp.employee_id)));
                    console.log('Fallback: Found roots by direct_reports:', rootEmployees.length);
                }
            }

            // Strategy 3: Use first few employees
            if (rootEmployees.length === 0) {
                employees.slice(0, 3).forEach(emp => rootEmployees.push(employeeMap.get(emp.employee_id)));
                console.log('Fallback: Using first 3 employees as roots');
            }
        }

        // Mark visible nodes based on expansion state
        const expandedSet = new Set(expandedNodeIds || []);
        const visibleEmployees = [];

        // Auto-expand roots if no nodes are expanded
        if (expandedNodeIds.length === 0) {
            rootEmployees.forEach(root => expandedSet.add(root.employee_id));
        }

        const markVisible = (employee, shouldShow = true) => {
            if (!employee) return;
            
            if (shouldShow) {
                employee.isVisible = true;
                visibleEmployees.push(employee);
                
                // If this node is expanded, show its children
                if (expandedSet.has(employee.employee_id) && employee.children.length > 0) {
                    employee.children.forEach(child => markVisible(child, true));
                }
            }
        };

        // Start with root employees
        rootEmployees.forEach(root => markVisible(root, true));

        console.log('Visible employees calculated:', visibleEmployees.length);

        // Create React Flow nodes
        const nodes = visibleEmployees.map(emp => ({
            id: emp.employee_id.toString(),
            type: 'employee',
            position: { x: 0, y: 0 },
            data: {
                employee: emp,
                isExpanded: expandedSet.has(emp.employee_id),
                onToggleExpanded: toggleExpandedNode,
                onSelectEmployee: setSelectedEmployee
            }
        }));

        // Create React Flow edges
        const edges = visibleEmployees
            .filter(emp => emp.parent && emp.parent.isVisible)
            .map(emp => ({
                id: `edge-${emp.parent.employee_id}-${emp.employee_id}`,
                source: emp.parent.employee_id.toString(),
                target: emp.employee_id.toString(),
                type: 'smoothstep',
                animated: false,
                style: { 
                    stroke: '#64748b', 
                    strokeWidth: 2,
                    opacity: 0.8
                },
                markerEnd: {
                    type: 'arrowclosed',
                    color: '#64748b',
                    width: 20,
                    height: 20
                }
            }));

        console.log('Hierarchy complete:', { nodes: nodes.length, edges: edges.length });
        return { visibleNodes: nodes, edges };
    }, [toggleExpandedNode, setSelectedEmployee]);

    // Main FlowComponent with proper hierarchy management
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
                    
                    setNodes(layoutedNodes);
                    setEdges(layoutedEdges);
                    
                    // Fit view after layout
                    setTimeout(() => fitView({ padding: 0.2 }), 100);
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
            setTimeout(() => fitView({ padding: 0.2 }), 0);
        }, [nodes, edges, setNodes, setEdges, fitView, getLayoutedElements, setLayoutDirection]);

        // Node types
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
                style={{ backgroundColor: darkMode ? '#0f172a' : '#f8fafc' }}
                fitViewOptions={{ padding: 0.2 }}
                defaultEdgeOptions={{
                    type: 'smoothstep',
                    animated: false,
                    style: { 
                        stroke: '#3b82f6', 
                        strokeWidth: 2,
                        opacity: 0.8
                    },
                    markerEnd: {
                        type: 'arrowclosed',
                        color: '#3b82f6',
                        width: 16,
                        height: 16
                    }
                }}
            >
                <Background color={darkMode ? '#334155' : '#e2e8f0'} gap={20} />
                <Controls className={darkMode ? 'react-flow__controls-dark' : ''} />
               
                <Panel position="top-right" className="space-x-2">
                    <button 
                        onClick={() => onLayout('TB')}
                        className={`px-3 py-2 ${bgCard} ${textPrimary} border ${borderColor} rounded-lg hover:${bgCardHover} transition-colors text-sm font-medium ${layoutDirection === 'TB' ? 'bg-blue-600 text-white' : ''}`}
                    >
                        Vertical
                    </button>
                    <button 
                        onClick={() => onLayout('LR')}
                        className={`px-3 py-2 ${bgCard} ${textPrimary} border ${borderColor} rounded-lg hover:${bgCardHover} transition-colors text-sm font-medium ${layoutDirection === 'LR' ? 'bg-blue-600 text-white' : ''}`}
                    >
                        Horizontal
                    </button>
                    <button 
                        onClick={() => {
                            console.log('Expand All clicked');
                            expandAllNodes();
                        }}
                        className={`px-3 py-2 ${bgCard} ${textPrimary} border ${borderColor} rounded-lg hover:${bgCardHover} transition-colors text-sm font-medium`}
                    >
                        Expand All
                    </button>
                    <button 
                        onClick={() => {
                            console.log('Collapse All clicked');
                            collapseAllNodes();
                        }}
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
        expandAllNodes, 
        collapseAllNodes,
        isLoading,
        textMuted,
        textSecondary
    ]);

    // Grid View Component
    const GridView = useCallback(() => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
            {filteredOrgChart.map(employee => (
                <div 
                    key={employee.employee_id}
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
                            <Building2 className="w-4 h-4 mr-2" />
                            <span>{employee.department}</span>
                        </div>
                        {employee.direct_reports > 0 && (
                            <div className={`flex items-center ${textSecondary} text-sm`}>
                                <Users className="w-4 h-4 mr-2" />
                                <span>{employee.direct_reports} Reports</span>
                            </div>
                        )}
                    </div>
                </div>
            ))}
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
            
            console.log('Final root employees:', rootEmployees.map(emp => ({
                id: emp.employee_id,
                name: emp.name,
                reports: emp.direct_reports || 0
            })));
            
            // Set initial expanded nodes (just the roots for now)
            const initialExpanded = rootEmployees.map(emp => emp.employee_id);
            console.log('Setting initial expanded nodes:', initialExpanded);
            setExpandedNodes(initialExpanded);
        }
    }, [orgChart, expandedNodes, setExpandedNodes]);

    // Debug logging
    useEffect(() => {
        console.log('Org Chart State:', {
            orgChartLength: orgChart?.length || 0,
            filteredOrgChartLength: filteredOrgChart?.length || 0,
            expandedNodesLength: expandedNodes?.length || 0,
            expandedNodes: expandedNodes,
            loading,
            errors
        });
    }, [orgChart, filteredOrgChart, expandedNodes, loading, errors]);

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
                                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center shadow-lg">
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
                                        className={`pl-8 pr-3 py-2 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-44 ${bgCard} ${textPrimary} text-sm transition-all duration-200 shadow-sm`} 
                                    />
                                </div>
                                
                                {/* Preset Filters */}
                                <div className={`flex rounded-lg border ${borderColor} ${bgCard} p-0.5 shadow-sm`}>
                                    <button 
                                        onClick={() => applyPresetFilter('all')} 
                                        className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${!hasActiveFilters() ? 'bg-blue-600 text-white shadow-sm' : `${textMuted} hover:${textPrimary} hover:${bgAccent}`}`}
                                    >
                                        All
                                    </button>
                                    <button 
                                        onClick={() => applyPresetFilter('managers_only')} 
                                        className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${filters.managers_only ? 'bg-blue-600 text-white shadow-sm' : `${textMuted} hover:${textPrimary} hover:${bgAccent}`}`}
                                    >
                                        Managers
                                    </button>
                                    <button 
                                        onClick={() => applyPresetFilter('executives')} 
                                        className={`px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200 ${filters.position_group?.includes('VC') || filters.position_group?.includes('DIRECTOR') ? 'bg-blue-600 text-white shadow-sm' : `${textMuted} hover:${textPrimary} hover:${bgAccent}`}`}
                                    >
                                        Executives
                                    </button>
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
                                    title="Advanced Filters"
                                    className={`p-2 border ${borderColor} rounded-lg hover:${bgAccent} transition-all duration-200 ${bgCard} ${textPrimary} shadow-sm relative`}
                                >
                                    <Filter size={14} />
                                    {hasActiveFilters() && (
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

                                <button 
                                    onClick={() => fetchOrgChart()}
                                    disabled={isLoading}
                                    title="Refresh"
                                    className={`p-2 border ${borderColor} rounded-lg hover:${bgAccent} transition-all duration-200 ${bgCard} ${textMuted} hover:${textPrimary} shadow-sm disabled:opacity-50`}
                                >
                                    <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                                </button>

                                {/* Enhanced Debug button */}
                                <button 
                                    onClick={() => {
                                        console.log('=== ENHANCED ORGCHART DEBUG ===');
                                        console.log('OrgChart length:', orgChart?.length);
                                        console.log('Filtered length:', filteredOrgChart?.length);
                                        console.log('Expanded nodes:', expandedNodes);
                                        
                                        if (orgChart?.length > 0) {
                                            console.log('Sample employees structure:');
                                            orgChart.slice(0, 3).forEach((emp, index) => {
                                                console.log(`Employee ${index + 1}:`, {
                                                    id: emp.employee_id,
                                                    name: emp.name,
                                                    line_manager_id: emp.line_manager_id,
                                                    manager_id: emp.manager_id,
                                                    direct_reports: emp.direct_reports,
                                                    level_to_ceo: emp.level_to_ceo,
                                                    position_group: emp.position_group
                                                });
                                            });
                                            
                                            // Force expand all managers
                                            const managers = orgChart.filter(emp => emp.direct_reports && emp.direct_reports > 0);
                                            const managerIds = managers.map(emp => emp.employee_id);
                                            console.log('Expanding all', managers.length, 'managers');
                                            setExpandedNodes(managerIds);
                                        }
                                    }}
                                    title="Enhanced Debug & Force Expand All Managers"
                                    className={`p-2 border border-orange-300 rounded-lg hover:bg-orange-50 transition-all duration-200 ${bgCard} text-orange-600 hover:text-orange-800 shadow-sm text-xs`}
                                >
                                    🔍🐛
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
                            
                            {/* Additional Search Fields */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                <div>
                                    <label className={`block text-xs font-medium ${textSecondary} mb-1.5`}>Employee Search</label>
                                    <input 
                                        type="text" 
                                        placeholder="Search by name, ID, email..." 
                                        value={filters.employee_search || ''} 
                                        onChange={(e) => updateFilter('employee_search', e.target.value)} 
                                        className={`w-full p-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${bgCard} ${textPrimary} shadow-sm text-sm`}
                                    />
                                </div>
                                
                                <div>
                                    <label className={`block text-xs font-medium ${textSecondary} mb-1.5`}>Job Title Search</label>
                                    <input 
                                        type="text" 
                                        placeholder="Search job titles..." 
                                        value={filters.job_title_search || ''} 
                                        onChange={(e) => updateFilter('job_title_search', e.target.value)} 
                                        className={`w-full p-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${bgCard} ${textPrimary} shadow-sm text-sm`}
                                    />
                                </div>
                                
                                <div>
                                    <label className={`block text-xs font-medium ${textSecondary} mb-1.5`}>Department Search</label>
                                    <input 
                                        type="text" 
                                        placeholder="Search departments..." 
                                        value={filters.department_search || ''} 
                                        onChange={(e) => updateFilter('department_search', e.target.value)} 
                                        className={`w-full p-2.5 border ${borderColor} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${bgCard} ${textPrimary} shadow-sm text-sm`}
                                    />
                                </div>
                            </div>

                            {/* Toggle Filters */}
                            <div className="flex items-center gap-6 mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={filters.show_top_level_only || false}
                                        onChange={(e) => updateFilter('show_top_level_only', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <span className={`text-sm ${textPrimary}`}>Show top level only</span>
                                </label>
                                
                                <label className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        checked={filters.managers_only || false}
                                        onChange={(e) => updateFilter('managers_only', e.target.checked)}
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <span className={`text-sm ${textPrimary}`}>Managers only</span>
                                </label>
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

                {/* Employee Detail Modal */}
                {selectedEmployee && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-200 ease-in-out">
                        <div className={`${bgCard} rounded-xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col border ${borderColor}`}>
                            <div className={`flex items-center justify-between p-4 border-b ${borderColor} sticky top-0 ${bgCard} rounded-t-xl z-10`}>
                                <div className="flex items-center gap-3">
                                    <Avatar employee={selectedEmployee} size="md" />
                                    <div>
                                        <h2 className={`text-lg font-semibold ${textHeader}`}>{selectedEmployee.name}</h2>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className={`${textSecondary} text-sm`}>{selectedEmployee.title}</p>
                                            {selectedEmployee.status_color && (
                                                <div 
                                                    className="w-2.5 h-2.5 rounded-full"
                                                    style={{ backgroundColor: selectedEmployee.status_color }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={clearSelectedEmployee} className={`${textMuted} hover:${textPrimary} p-1.5 hover:${bgAccent} rounded-lg transition-colors`}>
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
                                        <SmallDetailItem icon={<Award />} label="Grade" value={selectedEmployee.employee_details?.grading_display} />
                                        <SmallDetailItem icon={<Briefcase />} label="Position" value={selectedEmployee.position_group} />
                                        <SmallDetailItem icon={<MapPin />} label="Business Function" value={selectedEmployee.business_function} />
                                        <SmallDetailItem icon={<User />} label="Employee ID" value={selectedEmployee.employee_id} />
                                    </div>
                                </div>

                                {/* Team Metrics */}
                                <div className={`border-t ${borderColor} pt-4`}>
                                    <h4 className={`font-semibold ${textSecondary} mb-3 text-xs uppercase tracking-wider`}>Team Metrics</h4>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                        <SmallMetricItem 
                                            icon={<Target />} 
                                            label="Level to CEO" 
                                            value={selectedEmployee.level_to_ceo || 0} 
                                        />
                                        <SmallMetricItem 
                                            icon={<Users />} 
                                            label="Direct Reports" 
                                            value={selectedEmployee.direct_reports || 0} 
                                        />
                                        <SmallMetricItem 
                                            icon={<UsersRound />} 
                                            label="Total Team" 
                                            value={selectedEmployee.total_subordinates || 0} 
                                        />
                                        <SmallMetricItem 
                                            icon={<Building2 />} 
                                            label="Unit Colleagues" 
                                            value={selectedEmployee.colleagues_in_unit || 0} 
                                        />
                                        <SmallMetricItem 
                                            icon={<Briefcase />} 
                                            label="Function Colleagues" 
                                            value={selectedEmployee.colleagues_in_business_function || 0} 
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
                                {selectedEmployee.manager_info && (
                                    <div className={`border-t ${borderColor} pt-4`}>
                                        <h4 className={`font-semibold ${textSecondary} mb-3 text-xs uppercase tracking-wider`}>Reports To</h4>
                                        <div 
                                            className={`${bgCard} border ${borderColor} rounded-lg p-3 cursor-pointer hover:${bgCardHover} transition-colors flex items-center gap-3`}
                                            onClick={() => setSelectedEmployee(selectedEmployee.manager_info)}
                                        >
                                            <Avatar employee={selectedEmployee.manager_info} size="sm" />
                                            <div className="flex-1">
                                                <h5 className={`font-semibold ${textHeader} text-sm`}>{selectedEmployee.manager_info.name}</h5>
                                                <p className={`${textSecondary} text-xs`}>{selectedEmployee.manager_info.title}</p>
                                            </div>
                                            <ArrowUp className={`w-4 h-4 ${textMuted}`} />
                                        </div>
                                    </div>
                                )}

                                {/* Direct Reports List */}
                                {selectedEmployee.direct_reports_details && selectedEmployee.direct_reports_details.length > 0 && (
                                    <div className={`border-t ${borderColor} pt-4`}>
                                        <h4 className={`font-semibold ${textSecondary} mb-3 text-xs uppercase tracking-wider`}>
                                            Direct Reports ({selectedEmployee.direct_reports_details.length})
                                        </h4>
                                        <div className="space-y-2 max-h-60 overflow-y-auto">
                                            {selectedEmployee.direct_reports_details.map(report => (
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
                                                        <p className={`text-xs ${textMuted}`}>{report.department}</p>
                                                        <p className={`text-xs ${textSecondary}`}>{report.position_group}</p>
                                                    </div>
                                                    <ArrowDown className={`w-4 h-4 ${textMuted}`} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Employee Tags */}
                                {selectedEmployee.employee_details?.tags && selectedEmployee.employee_details.tags.length > 0 && (
                                    <div className={`border-t ${borderColor} pt-4`}>
                                        <h4 className={`font-semibold ${textSecondary} mb-3 text-xs uppercase tracking-wider`}>Tags</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedEmployee.employee_details.tags.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium`}
                                                    style={{ 
                                                        backgroundColor: tag.color || '#6b7280',
                                                        color: '#ffffff'
                                                    }}
                                                >
                                                    {tag.name}
                                                </span>
                                            ))}
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
                                {Object.entries({
                                    'VC': { primary: darkMode ? '#4e7db5' : '#30539b', badge: darkMode ? '#30539b' : '#4e7db5' },
                                    'DIRECTOR': { primary: darkMode ? '#336fa5' : '#2d5a91', badge: darkMode ? '#2d5a91' : '#336fa5' },
                                    'HEAD OF DEPARTMENT': { primary: darkMode ? '#38587d' : '#324c6b', badge: darkMode ? '#324c6b' : '#38587d' },
                                    'SENIOR SPECIALIST': { primary: darkMode ? '#7a829a' : '#6b7280', badge: darkMode ? '#6b7280' : '#7a829a' },
                                    'SPECIALIST': { primary: darkMode ? '#90a0b9' : '#74839c', badge: darkMode ? '#74839c' : '#90a0b9' },
                                    'JUNIOR SPECIALIST': { primary: darkMode ? '#9c9cb5' : '#8b8ca3', badge: darkMode ? '#8b8ca3' : '#9c9cb5' }
                                }).map(([group, colors]) => (
                                    <div key={group} className={`flex items-center gap-4 p-3 rounded-xl ${bgAccent}`}>
                                        <div 
                                            className="w-8 h-8 rounded-xl flex-shrink-0 ring-2 ring-white shadow-lg" 
                                            style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.badge} 100%)` }}
                                        />
                                        <div className="flex-1">
                                            <span className={`${textPrimary} text-sm font-semibold block`}>
                                                {group.replace(/([A-Z])/g, ' $1').trim()}
                                            </span>
                                            <span className={`${textSecondary} text-xs`}>
                                                {filterOptions.positionGroups?.find(pg => pg.value === group)?.count || 0} employees
                                            </span>
                                        </div>
                                    </div>
                                ))}
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

                {/* Enhanced Styles */}
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

                    /* Enhanced edge styling for better visibility */
                    .react-flow__edge-path {
                        stroke-width: 2;
                        stroke: #3b82f6;
                        opacity: 0.8;
                        filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1));
                    }

                    .react-flow__edge-path:hover {
                        stroke-width: 3;
                        opacity: 1;
                        stroke: #2563eb;
                    }

                    .org-chart-edge {
                        transition: all 0.2s ease-in-out;
                    }

                    .org-chart-edge:hover {
                        filter: drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3));
                    }

                    /* Handle styling for better connection points */
                    .react-flow__handle {
                        width: 12px !important;
                        height: 12px !important;
                        background: #3b82f6 !important;
                        border: 2px solid white !important;
                        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
                        opacity: 0.8 !important;
                    }

                    .react-flow__handle:hover {
                        background: #2563eb !important;
                        transform: scale(1.1);
                        opacity: 1 !important;
                    }

                    /* Node hover effects */
                    .react-flow__node:hover .react-flow__handle {
                        opacity: 1 !important;
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