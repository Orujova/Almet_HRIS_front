// src/components/job-catalog/JobCard.jsx

import React from 'react';
import { Users, Building2, Target, Eye, Edit, Star } from 'lucide-react';
import { hierarchyColors } from './HierarchyColors';

export default function JobCard({ job, context }) {
  const { setSelectedJob } = context;
  const colors = hierarchyColors[job.hierarchy] || hierarchyColors['SPECIALIST'];
  
  // Get hierarchy level for visual ranking
  const getHierarchyLevel = (hierarchy) => {
    const levels = {
      'VC': 1, 'Vice Chairman': 1,
      'DIRECTOR': 2,
      'HEAD OF DEPARTMENT': 3,
      'MANAGER': 4,
      'SENIOR SPECIALIST': 5,
      'SPECIALIST': 6,
      'JUNIOR SPECIALIST': 7,
      'BLUE COLLAR': 8
    };
    return levels[hierarchy] || 6;
  };

  const hierarchyLevel = getHierarchyLevel(job.hierarchy);
  
  return (
    <div 
      className={`bg-white dark:bg-almet-cloud-burst rounded-lg border border-gray-200 dark:border-almet-comet shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group relative overflow-hidden`}
      onClick={() => setSelectedJob(job)}
    >
      {/* Hierarchy Level Indicator */}
      <div className={`absolute top-0 left-0 w-full h-1 ${colors.border.replace('border-', 'bg-')}`}></div>
      
      {/* Hierarchy Stars */}
      <div className="absolute top-3 right-3 flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            size={8} 
            className={`${i < (6 - hierarchyLevel) ? `${colors.text.split(' ')[0]} fill-current` : 'text-gray-300 dark:text-almet-comet'}`}
          />
        ))}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text} mb-2`}>
              {job.hierarchy}
            </span>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight line-clamp-2">
              {job.title}
            </h3>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center text-xs text-gray-600 dark:text-almet-bali-hai">
            <Building2 size={10} className="mr-2 text-almet-sapphire flex-shrink-0" />
            <span className="truncate">{job.unit}</span>
          </div>
          <div className="flex items-center text-xs text-gray-600 dark:text-almet-bali-hai">
            <Target size={10} className="mr-2 text-green-500 flex-shrink-0" />
            <span className="truncate">{job.department}</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center text-xs text-gray-500 dark:text-almet-bali-hai">
            <Users size={10} className="mr-1" />
            <span>{job.currentEmployees}</span>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-almet-comet transition-colors">
              <Eye size={12} className="text-gray-400 dark:text-almet-bali-hai" />
            </button>
            <button className="p-1 rounded hover:bg-gray-100 dark:hover:bg-almet-comet transition-colors">
              <Edit size={12} className="text-gray-400 dark:text-almet-bali-hai" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

