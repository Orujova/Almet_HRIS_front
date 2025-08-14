// =================================================================
// src/components/job-catalog/NavigationTabs.jsx

import React from 'react';
import { BarChart3, Layers, Grid } from 'lucide-react';

export default function NavigationTabs({ activeView, setActiveView }) {
  return (
    <div className="flex space-x-1 bg-white dark:bg-almet-cloud-burst rounded-lg p-1 shadow-sm mb-6">
      <button
        onClick={() => setActiveView('overview')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          activeView === 'overview' 
            ? 'bg-almet-sapphire text-white' 
            : 'text-gray-600 dark:text-almet-bali-hai hover:bg-gray-100 dark:hover:bg-almet-comet'
        }`}
      >
        <BarChart3 size={16} />
        Job Catalog Overview
      </button>
      <button
        onClick={() => setActiveView('structure')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          activeView === 'structure' 
            ? 'bg-almet-sapphire text-white' 
            : 'text-gray-600 dark:text-almet-bali-hai hover:bg-gray-100 dark:hover:bg-almet-comet'
        }`}
      >
        <Layers size={16} />
        Reference Data
      </button>
      <button
        onClick={() => setActiveView('matrix')}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
          activeView === 'matrix' 
            ? 'bg-almet-sapphire text-white' 
            : 'text-gray-600 dark:text-almet-bali-hai hover:bg-gray-100 dark:hover:bg-almet-comet'
        }`}
      >
        <Grid size={16} />
        Hierarchy Matrix
      </button>
    </div>
  );
}