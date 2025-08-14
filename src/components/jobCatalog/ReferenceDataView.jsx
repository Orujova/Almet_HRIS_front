// src/components/job-catalog/ReferenceDataView.jsx

import React, { useState } from 'react';
import { Plus, Edit, Trash2, Loader2, Users, Building, Briefcase, Target, Award } from 'lucide-react';

export default function ReferenceDataView({ context }) {
  const {
    businessFunctions, departments, units, jobFunctions, positionGroups,
    loading, openCrudModal, handleDelete
  } = context;

  const [activeTab, setActiveTab] = useState('business_functions');

  const getTabIcon = (tabId) => {
    const icons = {
      business_functions: Building,
      departments: Target,
      units: Briefcase,
      job_functions: Users,
      position_groups: Award
    };
    return icons[tabId] || Building;
  };

  const renderDataCards = (data, type) => {
    if (loading.referenceData) {
      return (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-almet-sapphire" />
          <span className="ml-2 text-gray-600 dark:text-almet-bali-hai text-sm">Loading...</span>
        </div>
      );
    }

    if (data.length === 0) {
      return (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-gray-100 dark:bg-almet-san-juan rounded-full flex items-center justify-center mx-auto mb-4">
            {React.createElement(getTabIcon(type), { size: 24, className: "text-gray-400 dark:text-almet-bali-hai" })}
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Data Available</h3>
          <p className="text-gray-500 dark:text-almet-bali-hai text-sm mb-4">Get started by adding your first item.</p>
          <button
            onClick={() => openCrudModal(type, 'create')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-almet-sapphire text-white rounded-lg hover:bg-almet-astral transition-colors text-sm"
          >
            <Plus size={16} />
            Add First Item
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map((item, index) => (
          <div key={item.id || index} className="bg-white dark:bg-almet-cloud-burst rounded-lg border border-gray-200 dark:border-almet-comet p-4 hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                  {item.label || item.name}
                </h3>
                {item.code && (
                  <span className="inline-block mt-1 px-2 py-1 bg-gray-100 dark:bg-almet-san-juan text-gray-600 dark:text-almet-bali-hai text-xs rounded">
                    {item.code}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 ml-2">
                <button
                  onClick={() => openCrudModal(type, 'edit', item)}
                  className="p-1.5 rounded hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                  title="Edit"
                >
                  <Edit size={12} className="text-blue-600 dark:text-blue-400" />
                </button>
                <button
                  onClick={() => handleDelete(type, item)}
                  className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                  title="Delete"
                  disabled={loading.crud}
                >
                  <Trash2 size={12} className="text-red-600 dark:text-red-400" />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-xs text-gray-600 dark:text-almet-bali-hai">
              {type === 'departments' && item.business_function_name && (
                <div className="flex items-center">
                  <Building size={10} className="mr-1.5 text-almet-sapphire" />
                  <span className="truncate">{item.business_function_name}</span>
                </div>
              )}
              {type === 'units' && item.department_name && (
                <div className="flex items-center">
                  <Target size={10} className="mr-1.5 text-green-500" />
                  <span className="truncate">{item.department_name}</span>
                </div>
              )}
              {type === 'position_groups' && item.hierarchy_level && (
                <div className="flex items-center">
                  <Award size={10} className="mr-1.5 text-purple-500" />
                  <span>Level {item.hierarchy_level}</span>
                </div>
              )}
              <div className="flex items-center">
                <Users size={10} className="mr-1.5 text-gray-400" />
                <span>{item.employee_count || 0} employees</span>
              </div>
            </div>

            {item.description && (
              <p className="mt-2 text-xs text-gray-500 dark:text-almet-waterloo line-clamp-2">
                {item.description}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  };

  const tabs = [
    { 
      id: 'business_functions', 
      label: 'Business Functions', 
      data: businessFunctions,
      description: 'Manage organizational business functions'
    },
    { 
      id: 'departments', 
      label: 'Departments', 
      data: departments,
      description: 'Organize departments within business functions'
    },
    { 
      id: 'units', 
      label: 'Units', 
      data: units,
      description: 'Manage operational units within departments'
    },
    { 
      id: 'job_functions', 
      label: 'Job Functions', 
      data: jobFunctions,
      description: 'Define job function categories'
    },
    { 
      id: 'position_groups', 
      label: 'Position Groups', 
      data: positionGroups,
      description: 'Hierarchy levels and position groups'
    }
  ];

  const activeTabData = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-almet-comet">
        <nav className="flex space-x-8 overflow-x-auto">
          {tabs.map((tab) => {
            const IconComponent = getTabIcon(tab.id);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-almet-sapphire text-almet-sapphire'
                    : 'border-transparent text-gray-500 dark:text-almet-bali-hai hover:text-gray-700 dark:hover:text-white hover:border-gray-300 dark:hover:border-almet-comet'
                }`}
              >
                <IconComponent size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {activeTabData?.label}
          </h2>
          <p className="text-gray-600 dark:text-almet-bali-hai text-sm mt-1">
            {activeTabData?.description}
          </p>
        </div>
        <button
          onClick={() => openCrudModal(activeTab, 'create')}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
        >
          <Plus size={16} />
          Add New
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-gray-50 dark:bg-almet-san-juan rounded-lg p-6">
        {renderDataCards(activeTabData?.data || [], activeTab)}
      </div>
    </div>
  );
}