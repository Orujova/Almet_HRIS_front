// src/components/job-catalog/OverviewView.jsx

import React from 'react';
import { 
  Search, 
  Filter, 
  Users, 
  Briefcase, 
  Grid,
  List,
  Plus,
  Loader2,
  AlertCircle
} from 'lucide-react';
import JobCard from './JobCard';
import JobListItem from './JobListItem';

export default function OverviewView({ context }) {
  const {
    searchTerm, setSearchTerm,
    showFilters, setShowFilters,
    viewMode, setViewMode,
    selectedFilters, setSelectedFilters,
    filteredJobs, stats, filterOptions,
    loading, errors,
    clearFilters, openCrudModal
  } = context;

  return (
    <div>
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-almet-cloud-burst rounded-lg p-6 shadow-sm border border-gray-200 dark:border-almet-comet">
          <div className="flex items-center">
            <div className="p-3 bg-almet-sapphire/10 dark:bg-almet-sapphire/20 rounded-lg mr-4">
              <Briefcase className="h-6 w-6 text-almet-sapphire" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-almet-bali-hai">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading.statistics ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalJobs}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-almet-cloud-burst rounded-lg p-6 shadow-sm border border-gray-200 dark:border-almet-comet">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg mr-4">
              <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-almet-bali-hai">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {loading.statistics ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalEmployees}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-almet-cloud-burst rounded-lg p-6 mb-6 shadow-sm border border-gray-200 dark:border-almet-comet">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search jobs..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-almet-comet rounded-lg bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                showFilters ? 'bg-almet-sapphire text-white' : 'bg-gray-100 dark:bg-almet-comet text-gray-700 dark:text-almet-bali-hai hover:bg-gray-200 dark:hover:bg-almet-san-juan'
              }`}
            >
              <Filter size={16} />
              Filters
              {Object.values(selectedFilters).some(v => v) && (
                <span className="bg-red-500 text-white rounded-full w-2 h-2"></span>
              )}
            </button>

            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-gray-300 dark:border-almet-comet overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 ${viewMode === 'grid' ? 'bg-almet-sapphire text-white' : 'bg-white dark:bg-almet-san-juan text-gray-600 dark:text-almet-bali-hai hover:bg-gray-50 dark:hover:bg-almet-comet'} transition-colors`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 ${viewMode === 'list' ? 'bg-almet-sapphire text-white' : 'bg-white dark:bg-almet-san-juan text-gray-600 dark:text-almet-bali-hai hover:bg-gray-50 dark:hover:bg-almet-comet'} transition-colors`}
              >
                <List size={16} />
              </button>
            </div>

            <button
              onClick={() => openCrudModal('business_functions', 'create')}
              className="flex items-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus size={16} />
              Add New
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-almet-comet">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-almet-bali-hai mb-2">
                  Business Function
                </label>
                <select
                  value={selectedFilters.business_function}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, business_function: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-almet-comet rounded-lg bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
                >
                  <option value="">All</option>
                  {filterOptions.businessFunctions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-almet-bali-hai mb-2">
                  Department
                </label>
                <select
                  value={selectedFilters.department}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-almet-comet rounded-lg bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
                >
                  <option value="">All</option>
                  {filterOptions.departments.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-almet-bali-hai mb-2">
                  Unit
                </label>
                <select
                  value={selectedFilters.unit}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, unit: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-almet-comet rounded-lg bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
                >
                  <option value="">All</option>
                  {filterOptions.units.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-almet-bali-hai mb-2">
                  Job Function
                </label>
                <select
                  value={selectedFilters.job_function}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, job_function: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-almet-comet rounded-lg bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
                >
                  <option value="">All</option>
                  {filterOptions.jobFunctions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-almet-bali-hai mb-2">
                  Position Group
                </label>
                <select
                  value={selectedFilters.position_group}
                  onChange={(e) => setSelectedFilters(prev => ({ ...prev, position_group: e.target.value }))}
                  className="w-full p-3 border border-gray-300 dark:border-almet-comet rounded-lg bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
                >
                  <option value="">All</option>
                  {filterOptions.positionGroups.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {Object.values(selectedFilters).some(v => v) && (
              <div className="mt-4 flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-almet-bali-hai">
                  Showing {filteredJobs.length} / {context.jobCatalogData.length} jobs
                </span>
                <button
                  onClick={clearFilters}
                  className="text-sm text-almet-sapphire dark:text-almet-steel-blue hover:underline"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Display */}
      {errors.employees && (
        <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mr-2" />
            <span className="text-red-800 dark:text-red-200">{errors.employees}</span>
          </div>
        </div>
      )}

      {/* Job Listings */}
      {loading.employees ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-almet-sapphire" />
          <span className="ml-2 text-gray-600 dark:text-almet-bali-hai">Loading jobs...</span>
        </div>
      ) : (
        <>
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-4'}>
            {filteredJobs.map(job => (
              viewMode === 'grid' ? (
                <JobCard key={job.id} job={job} context={context} />
              ) : (
                <JobListItem key={job.id} job={job} context={context} />
              )
            ))}
          </div>

          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className="mx-auto h-12 w-12 text-gray-400 dark:text-almet-bali-hai mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Jobs Found</h3>
              <p className="text-gray-500 dark:text-almet-bali-hai">
                Adjust your search criteria or filters.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}