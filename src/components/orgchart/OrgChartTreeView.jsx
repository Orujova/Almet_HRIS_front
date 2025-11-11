// components/orgChart/OrgChartTreeView.jsx - Complete Single File
'use client'
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import ReactFlow, {
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    ConnectionMode,
    Panel,
    useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { ZoomIn, ZoomOut, Maximize2, Target, RefreshCw } from 'lucide-react';
import EmployeeNode from './EmployeeNode';

// Clean employee data utility
const cleanEmployeeData = (employee) => {
    if (!employee) return null;
    return {
        id: employee.id,
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
        vacant: employee.vacant || employee.name?.toLowerCase().includes('vacant'),
        employee_details: employee.employee_details
    };
};
// Layout algorithm using Dagre
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
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
};

// Build hierarchy from flat employee list
const buildOrgHierarchy = (employees, expandedNodeIds, toggleExpandedNode, setSelectedEmployee, navigateToEmployee) => {
    if (!Array.isArray(employees) || employees.length === 0) {
        console.log('❌ No employees to build hierarchy');
        return { visibleNodes: [], edges: [] };
    }

    const cleanEmployees = employees.map(cleanEmployeeData).filter(Boolean);
    
    console.log('🏗️ Building hierarchy for', cleanEmployees.length, 'employees');
    
    // Group by company to understand structure
    const companiesMap = new Map();
    cleanEmployees.forEach(emp => {
        const company = emp.business_function || 'Unknown';
        if (!companiesMap.has(company)) {
            companiesMap.set(company, []);
        }
        companiesMap.get(company).push(emp);
    });

    console.log('🏢 Companies in data:', Array.from(companiesMap.keys()));
    
    // Build employee map
    const employeeMap = new Map();
    cleanEmployees.forEach(emp => {
        employeeMap.set(emp.employee_id, { 
            ...emp, 
            children: [], 
            isVisible: false 
        });
    });

    // Find root employees
    // Root = no line_manager_id OR manager not in this filtered dataset
    const rootEmployees = [];
    const managersInDataset = new Set(cleanEmployees.map(emp => emp.employee_id));
    
    cleanEmployees.forEach(emp => {
        const managerId = emp.line_manager_id;
        
        if (managerId && employeeMap.has(managerId)) {
            // Has manager in dataset - add as child
            const manager = employeeMap.get(managerId);
            const employee = employeeMap.get(emp.employee_id);
            manager.children.push(employee);
            employee.parent = manager;
        } else {
            // Root: no manager OR manager not in filtered data
            const employee = employeeMap.get(emp.employee_id);
            rootEmployees.push(employee);
            console.log('🌳 Root found:', employee.name, '(', employee.business_function, ')');
        }
    });

    console.log('✅ Root employees:', rootEmployees.length);

    // If no roots found, find by other criteria
    if (rootEmployees.length === 0) {
        console.warn('⚠️ No roots found by line_manager_id, trying fallback methods...');
        
        // Fallback 1: Find by max direct reports
        const maxReports = Math.max(...cleanEmployees.map(emp => emp.direct_reports || 0));
        if (maxReports > 0) {
            const candidates = cleanEmployees.filter(emp => (emp.direct_reports || 0) === maxReports);
            console.log('📊 Found by max reports:', candidates.length, 'candidates');
            candidates.forEach(emp => {
                const employee = employeeMap.get(emp.employee_id);
                if (employee && !rootEmployees.includes(employee)) {
                    rootEmployees.push(employee);
                }
            });
        }
        
        // Fallback 2: Find by level_to_ceo
        if (rootEmployees.length === 0) {
            const minLevel = Math.min(...cleanEmployees.map(emp => emp.level_to_ceo || 999));
            if (minLevel < 999) {
                const candidates = cleanEmployees.filter(emp => (emp.level_to_ceo || 999) === minLevel);
                console.log('📊 Found by min level:', candidates.length, 'candidates');
                candidates.forEach(emp => {
                    const employee = employeeMap.get(emp.employee_id);
                    if (employee && !rootEmployees.includes(employee)) {
                        rootEmployees.push(employee);
                    }
                });
            }
        }
        
        // Fallback 3: Take first few employees
        if (rootEmployees.length === 0) {
            console.warn('⚠️ Using first 3 employees as roots');
            cleanEmployees.slice(0, 3).forEach(emp => {
                const employee = employeeMap.get(emp.employee_id);
                if (employee) {
                    rootEmployees.push(employee);
                }
            });
        }
    }

    const expandedSet = new Set(expandedNodeIds || []);
    const visibleEmployees = [];

    // Mark visible employees based on expansion
    const markVisible = (employee, shouldShow = true) => {
        if (!employee) return;
        
        if (shouldShow) {
            employee.isVisible = true;
            visibleEmployees.push(employee);
            
            // If expanded and has children, show them
            if (expandedSet.has(employee.employee_id) && employee.children.length > 0) {
                employee.children.forEach(child => {
                    markVisible(child, true);
                });
            }
        }
    };

    // Start from roots
    rootEmployees.forEach(root => {
        markVisible(root, true);
    });

    console.log('👁️ Visible employees:', visibleEmployees.length);

    // Create React Flow nodes
    const nodes = visibleEmployees.map(emp => ({
        id: emp.employee_id.toString(),
        type: 'employee',
        position: { x: 0, y: 0 },
        data: {
            employee: emp,
            isExpanded: expandedSet.has(emp.employee_id),
            onToggleExpanded: toggleExpandedNode,
            onSelectEmployee: setSelectedEmployee,
            onNavigateToEmployee: navigateToEmployee
        }
    }));

    // Create edges between visible employees
    const edges = visibleEmployees
        .filter(emp => emp.parent && emp.parent.isVisible)
        .map(emp => ({
            id: `edge-${emp.parent.employee_id}-${emp.employee_id}`,
            source: emp.parent.employee_id.toString(),
            target: emp.employee_id.toString(),
            type: 'smoothstep',
            animated: false,
            style: { 
                stroke: emp.vacant ? '#ef4444' : '#30539b', 
                strokeWidth: emp.vacant ? 3 : 2,
                opacity: emp.vacant ? 1 : 0.8,
                strokeDasharray: emp.vacant ? '5,5' : 'none'
            },
            markerEnd: {
                type: 'arrowclosed',
                color: emp.vacant ? '#ef4444' : '#30539b',
                width: 20,
                height: 20
            }
        }));

    console.log('📊 Result:', nodes.length, 'nodes,', edges.length, 'edges');

    return { visibleNodes: nodes, edges };
};

// Enhanced Controls Panel
const EnhancedControlsPanel = ({ darkMode }) => {
    const { zoomIn, zoomOut, fitView, getViewport } = useReactFlow();
    const [currentZoom, setCurrentZoom] = useState(1);
    
    const bgCard = darkMode ? "bg-slate-800" : "bg-white";
    const borderColor = darkMode ? "border-slate-600" : "border-gray-200";
    const textPrimary = darkMode ? "text-gray-200" : "text-almet-comet";
    const textMuted = darkMode ? "text-gray-500" : "text-almet-bali-hai";
    const bgCardHover = darkMode ? "bg-slate-700" : "bg-gray-50";
    
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
    
    return (
        <Panel position="top-left" className="space-y-2">
            <div className={`${bgCard} border ${borderColor} rounded-lg shadow-lg p-2 space-y-1`}>
                <div className={`text-center text-xs ${textMuted} font-mono pb-1 border-b ${borderColor}`}>
                    {Math.round(currentZoom * 100)}%
                </div>
                
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

// Main TreeView Component
export const TreeView = ({ 
    filteredOrgChart, 
    expandedNodes, 
    layoutDirection, 
    setLayoutDirection,
    toggleExpandedNode, 
    setSelectedEmployee,
    navigateToEmployee,
    orgChart,
    setExpandedNodes,
    isLoading,
    darkMode
}) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const { fitView } = useReactFlow();

    const bgCard = darkMode ? "bg-slate-800" : "bg-white";
    const borderColor = darkMode ? "border-slate-600" : "border-gray-200";
    const textPrimary = darkMode ? "text-gray-200" : "text-almet-comet";
    const bgCardHover = darkMode ? "bg-slate-700" : "bg-gray-50";
    const textMuted = darkMode ? "text-gray-500" : "text-almet-bali-hai";
    const textSecondary = darkMode ? "text-gray-400" : "text-almet-waterloo";

    useEffect(() => {
        if (Array.isArray(filteredOrgChart) && filteredOrgChart.length > 0) {
            const hierarchy = buildOrgHierarchy(
                filteredOrgChart, 
                expandedNodes || [], 
                toggleExpandedNode,
                setSelectedEmployee,
                navigateToEmployee
            );
            
            if (hierarchy.visibleNodes.length > 0) {
                const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                    hierarchy.visibleNodes,
                    hierarchy.edges,
                    layoutDirection
                );
                
                setNodes(layoutedNodes);
                setEdges(layoutedEdges);
                
                setTimeout(() => fitView({ padding: 0.1, minZoom: 0.1, maxZoom: 1.5 }), 100);
            } else {
                setNodes([]);
                setEdges([]);
            }
        } else {
            setNodes([]);
            setEdges([]);
        }
    }, [filteredOrgChart, expandedNodes, layoutDirection, toggleExpandedNode, setSelectedEmployee, navigateToEmployee, setNodes, setEdges, fitView]);

    const onLayout = useCallback((direction) => {
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            nodes,
            edges,
            direction
        );
        setNodes([...layoutedNodes]);
        setEdges([...layoutedEdges]);
        setLayoutDirection(direction);
        setTimeout(() => fitView({ padding: 0.1, minZoom: 0.1, maxZoom: 1.5 }), 0);
    }, [nodes, edges, setNodes, setEdges, fitView, setLayoutDirection]);

    const handleExpandAll = useCallback(() => {
        if (orgChart && orgChart.length > 0) {
            const managersWithReports = orgChart
                .filter(emp => emp.direct_reports && emp.direct_reports > 0)
                .map(emp => emp.employee_id);
            
            setExpandedNodes(managersWithReports);
        }
    }, [orgChart, setExpandedNodes]);

    const handleCollapseAll = useCallback(() => {
        if (orgChart && orgChart.length > 0) {
            const rootEmployees = orgChart.filter(emp => 
                !emp.line_manager_id && !emp.manager_id && !emp.parent_id
            );
            
            if (rootEmployees.length === 0) {
                const maxReports = Math.max(...orgChart.map(emp => emp.direct_reports || 0));
                const fallbackRoots = orgChart
                    .filter(emp => (emp.direct_reports || 0) === maxReports)
                    .map(emp => emp.employee_id);
            
                setExpandedNodes(fallbackRoots);
            } else {
                const rootIds = rootEmployees.map(emp => emp.employee_id);
                setExpandedNodes(rootIds);
            }
        }
    }, [orgChart, setExpandedNodes]);

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
            
            <EnhancedControlsPanel darkMode={darkMode} />
            
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
};

export default TreeView;