// components/orgChart/EmployeeNode.jsx
'use client'
import React, { useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { Users, Layers, Plus, Minus, ArrowUp, AlertCircle, XCircle } from 'lucide-react';
import Avatar from './Avatar';

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
        vacant: employee.vacant,
        employee_details: employee.employee_details
    };
};

export const EmployeeNode = React.memo(({ data, id }) => {
    const employee = data.employee;
    const directReports = employee.direct_reports || 0;
    const hasChildren = directReports > 0;
    const isExpanded = data.isExpanded;
    const isVacant = employee.vacant;
    
    const handleToggleExpanded = useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();
        data.onToggleExpanded(employee.employee_id);
    }, [employee.employee_id, data.onToggleExpanded]);
    
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

    // Vacant position colors
    const vacantColors = {
        primary: '#dc2626',
        bg: 'rgba(220, 38, 38, 0.05)',
        badge: '#991b1b',
        border: '#ef4444'
    };

    const colors = isVacant ? vacantColors : (hierarchyColors[employee.position_group] || hierarchyColors['SPECIALIST']);

    return (
        <div className="relative">
            <Handle 
                type="target" 
                position={Position.Top} 
                className="!bg-almet-sapphire !border-2 !border-white !w-3 !h-3 !opacity-100"
                style={{ top: -6 }}
            />
            
            <div 
                className={`bg-white dark:bg-slate-800 rounded-xl shadow-lg transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-105 w-[280px] min-h-[140px] ${
                    isVacant 
                        ? 'border-3 border-red-500 bg-red-50 dark:bg-red-900/20 animate-pulse-border' 
                        : 'border-2'
                }`}
                style={{ 
                    borderColor: isVacant ? '#ef4444' : colors.primary,
                    borderWidth: isVacant ? '3px' : '2px'
                }}
                onClick={handleSelectEmployee}
            >
                {/* Vacant Badge */}
                {isVacant && (
                    <div className="absolute -top-2 -right-2 z-10">
                        <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 animate-bounce">
                            <AlertCircle className="w-3 h-3" />
                            VACANT
                        </div>
                    </div>
                )}

                {/* Header */}
                <div className="p-4 pb-2">
                    <div className="flex items-start gap-3">
                        <Avatar employee={employee} size="sm" />
                        <div className="flex-1 min-w-0">
                            <h3 className={`font-bold text-sm leading-tight mb-1 ${
                                isVacant 
                                    ? 'text-red-700 dark:text-red-400' 
                                    : 'text-gray-900 dark:text-gray-100'
                            }`}>
                                {employee.name || 'Vacant Position'}
                            </h3>
                            <p className={`text-xs leading-relaxed line-clamp-2 ${
                                isVacant 
                                    ? 'text-red-600 dark:text-red-300 italic' 
                                    : 'text-gray-500 dark:text-gray-400'
                            }`}>
                                {employee.title || 'No Title'}
                            </p>
                        </div>
                        {employee.line_manager_id && !isVacant && (
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
                            style={{ backgroundColor: isVacant ? '#dc2626' : colors.badge }}
                        >
                            {employee.employee_details.grading_display}
                        </span>
                    )}
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-semibold ${
                        isVacant 
                            ? 'bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 border border-red-300' 
                            : 'bg-almet-mystic dark:bg-slate-700 text-almet-cloud-burst dark:text-gray-200'
                    }`}>
                        {employee.department || 'No Department'}
                    </span>
                    {employee.status_color && !isVacant && (
                        <div 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: employee.status_color }}
                            title="Employee Status"
                        />
                    )}
                </div>

                {/* Details */}
                <div className={`px-4 pb-4 border-t pt-2 space-y-1 ${
                    isVacant 
                        ? 'border-red-200 dark:border-red-700' 
                        : 'border-gray-200 dark:border-slate-600'
                }`}>
                    {employee.unit && (
                        <div className={`flex items-center text-xs ${
                            isVacant 
                                ? 'text-red-600 dark:text-red-400' 
                                : 'text-gray-500 dark:text-gray-400'
                        }`}>
                            <Layers className="w-3 h-3 mr-2 flex-shrink-0" />
                            <span className="font-medium truncate">{employee.unit}</span>
                        </div>
                    )}
                    
                    {isVacant ? (
                        <div className="flex items-center font-semibold text-xs text-red-600 dark:text-red-400">
                            <XCircle className="w-3 h-3 mr-2 flex-shrink-0" />
                            <span>Position Open</span>
                        </div>
                    ) : directReports > 0 && (
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
                            background: isVacant 
                                ? (isExpanded 
                                    ? 'linear-gradient(135deg, #991b1b 0%, #7f1d1d 100%)' 
                                    : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)')
                                : (isExpanded 
                                    ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
                                    : `linear-gradient(135deg, ${colors.primary} 0%, ${colors.badge} 100%)`),
                        }}
                        aria-label={isExpanded ? "Collapse node" : "Expand node"}
                    >
                        {isExpanded ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                )}
            </div>
            
            {hasChildren && (
                <Handle 
                    type="source" 
                    position={Position.Bottom} 
                    className="!bg-almet-sapphire !border-2 !border-white !w-3 !h-3 !opacity-100"
                    style={{ 
                        bottom: -6,
                        background: isVacant ? 'linear-gradient(135deg, #ef4444, #dc2626)' : undefined
                    }}
                />
            )}
        </div>
    );
});

EmployeeNode.displayName = 'EmployeeNode';

export default EmployeeNode;