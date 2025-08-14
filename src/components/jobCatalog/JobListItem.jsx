// =================================================================
// src/components/job-catalog/JobListItem.jsx

import React from 'react';
import { Users, Building2, Target, Eye, Edit } from 'lucide-react';
import { hierarchyColors } from './HierarchyColors';

export default function JobListItem({ job, context }) {
  const { setSelectedJob } = context;
  const colors = hierarchyColors[job.hierarchy] || hierarchyColors['SPECIALIST'];
  
  return (
    <div 
      className={`bg-white dark:bg-almet-cloud-burst rounded-lg border-l-4 ${colors.border} p-6 hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 dark:border-almet-comet`}
      onClick={() => setSelectedJob(job)}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
              {job.title}
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
              {job.hierarchy}
            </span>
          </div>
          <div className="flex items-center gap-6 text-xs text-gray-600 dark:text-almet-bali-hai">
            <span className="flex items-center">
              <Building2 size={12} className="mr-1" />
              {job.unit}
            </span>
            <span className="flex items-center">
              <Target size={12} className="mr-1" />
              {job.department}
            </span>
            <span className="flex items-center">
              <Users size={12} className="mr-1" />
              {job.currentEmployees} employees
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-almet-comet transition-colors">
            <Eye size={16} className="text-gray-400 dark:text-almet-bali-hai" />
          </button>
          <button className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-almet-comet transition-colors">
            <Edit size={16} className="text-gray-400 dark:text-almet-bali-hai" />
          </button>
        </div>
      </div>
    </div>
  );
}