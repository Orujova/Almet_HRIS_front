// src/components/job-catalog/JobDetailModal.jsx

import React from 'react';
import { X, Users, Building2, Target, Briefcase, ExternalLink, Boxes } from 'lucide-react';
import { hierarchyColors } from './HierarchyColors';

export default function JobDetailModal({ context }) {
  const { selectedJob, setSelectedJob, navigateToEmployee } = context;

  if (!selectedJob) return null;

  const colors = hierarchyColors[selectedJob.hierarchy] || hierarchyColors['SPECIALIST'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-almet-cloud-burst rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-almet-comet">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 dark:border-almet-comet">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {selectedJob.title}
              </h2>
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}`}>
                  {selectedJob.hierarchy}
                </span>
                <span className="flex items-center text-sm text-gray-600 dark:text-almet-bali-hai">
                  <Users size={16} className="mr-1" />
                  {selectedJob.currentEmployees} employee{selectedJob.currentEmployees !== 1 ? 's' : ''}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedJob(null)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-almet-comet rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-500 dark:text-almet-bali-hai" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          {/* Job Information Section */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Job Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center p-4 bg-gray-50 dark:bg-almet-san-juan rounded-lg">
                <Boxes size={20} className="mr-3 text-almet-sapphire flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-gray-500 dark:text-almet-bali-hai uppercase tracking-wide">Unit</div>
                  <div className="text-sm text-gray-900 dark:text-white font-medium truncate">{selectedJob.unit}</div>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 dark:bg-almet-san-juan rounded-lg">
                <Building2 size={20} className="mr-3 text-almet-sapphire flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-gray-500 dark:text-almet-bali-hai uppercase tracking-wide">Business Function</div>
                  <div className="text-sm text-gray-900 dark:text-white font-medium truncate">{selectedJob.businessFunction}</div>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 dark:bg-almet-san-juan rounded-lg">
                <Target size={20} className="mr-3 text-green-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-gray-500 dark:text-almet-bali-hai uppercase tracking-wide">Department</div>
                  <div className="text-sm text-gray-900 dark:text-white font-medium truncate">{selectedJob.department}</div>
                </div>
              </div>

              <div className="flex items-center p-4 bg-gray-50 dark:bg-almet-san-juan rounded-lg">
                <Briefcase size={20} className="mr-3 text-purple-500 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-gray-500 dark:text-almet-bali-hai uppercase tracking-wide">Job Function</div>
                  <div className="text-sm text-gray-900 dark:text-white font-medium truncate">{selectedJob.jobFunction}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Employee List Section */}
          {selectedJob.employees && selectedJob.employees.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Current Employees ({selectedJob.employees.length})
              </h3>
              <div className="bg-gray-50 dark:bg-almet-san-juan rounded-lg p-4">
                <div className="max-h-64 overflow-y-auto">
                  <div className="space-y-2">
                    {selectedJob.employees.slice(0, 10).map((employee, index) => (
                      <div 
                        key={employee.id || index} 
                        className="flex items-center justify-between p-3 bg-white dark:bg-almet-cloud-burst rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-almet-comet transition-colors border border-gray-200 dark:border-almet-comet group"
                        onClick={() => navigateToEmployee(employee.id)}
                      >
                        <div className="flex items-center min-w-0 flex-1">
                          <div className="w-10 h-10 bg-almet-sapphire text-white rounded-full flex items-center justify-center text-sm font-medium mr-3 flex-shrink-0">
                            {employee.name?.charAt(0)?.toUpperCase() || 'N'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {employee.name || 'No Name'}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-almet-bali-hai">
                              ID: {employee.employee_id || 'N/A'}
                            </div>
                          </div>
                        </div>
                        <ExternalLink size={16} className="text-gray-400 dark:text-almet-bali-hai group-hover:text-almet-sapphire transition-colors flex-shrink-0 ml-2" />
                      </div>
                    ))}
                  </div>
                  {selectedJob.employees.length > 10 && (
                    <div className="text-center py-3 mt-3 border-t border-gray-200 dark:border-almet-comet">
                      <span className="text-sm text-gray-500 dark:text-almet-bali-hai font-medium">
                        +{selectedJob.employees.length - 10} more employees
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* No Employees State */}
          {(!selectedJob.employees || selectedJob.employees.length === 0) && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Current Employees</h3>
              <div className="bg-gray-50 dark:bg-almet-san-juan rounded-lg p-8 text-center">
                <Users size={32} className="mx-auto text-gray-400 dark:text-almet-bali-hai mb-3" />
                <p className="text-gray-500 dark:text-almet-bali-hai">No employees assigned to this position</p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-almet-comet">
          <div className="flex justify-end">
            <button
              onClick={() => setSelectedJob(null)}
              className="px-6 py-2 text-gray-600 dark:text-almet-bali-hai hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-almet-comet rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}