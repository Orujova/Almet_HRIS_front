// src/components/job-catalog/MatrixView.jsx

import React from 'react';
import { Users, Loader2 } from 'lucide-react';
import { hierarchyColors } from './HierarchyColors';

export default function MatrixView({ context }) {
  const {
    matrixView, setMatrixView,
    matrixData, jobCatalogData, departments, jobFunctions, 
    businessFunctions, positionGroups, loading, setSelectedJob
  } = context;

  const columns = matrixView === 'department' ? departments.map(d => d.label || d.name) : 
                 matrixView === 'function' ? jobFunctions.map(jf => jf.label || jf.name) : 
                 businessFunctions.map(bf => bf.label || bf.name);

  return (
    <div className="bg-white dark:bg-almet-cloud-burst rounded-lg p-6 shadow-sm border border-gray-200 dark:border-almet-comet">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Hierarchy Matrix</h2>
            <p className="text-gray-600 dark:text-almet-bali-hai">
              Distribution of jobs by hierarchy levels based on real employee data
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-700 dark:text-almet-bali-hai">
              Matrix View:
            </label>
            <select
              value={matrixView}
              onChange={(e) => setMatrixView(e.target.value)}
              className="p-3 border border-gray-300 dark:border-almet-comet rounded-lg bg-white dark:bg-almet-san-juan text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-almet-sapphire focus:border-transparent"
            >
              <option value="department">By Department</option>
              <option value="function">By Job Function</option>
              <option value="unit">By Business Function</option>
            </select>
          </div>
        </div>
      </div>

      {loading.hierarchy ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-almet-sapphire" />
          <span className="ml-2 text-gray-600 dark:text-almet-bali-hai">Loading hierarchy matrix...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-gray-100 dark:bg-almet-san-juan border border-gray-300 dark:border-almet-comet p-4 text-left font-semibold text-gray-900 dark:text-white min-w-[180px] z-10">
                    Hierarchy
                  </th>
                  {columns.map((col, colIndex) => (
                    <th key={`col-${colIndex}-${col}`} className="border border-gray-300 dark:border-almet-comet p-3 text-center font-medium text-gray-900 dark:text-white text-xs min-w-[140px]">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positionGroups.map(pg => {
                  const hierarchyName = pg.label || pg.name;
                  const colors = hierarchyColors[hierarchyName] || hierarchyColors['SPECIALIST'];
                  return (
                    <tr key={pg.value || pg.id}>
                      <td className={`sticky left-0 border border-gray-300 dark:border-almet-comet p-4 font-medium ${colors.bg} ${colors.text} min-w-[180px] z-10`}>
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${colors.border.replace('border-', 'bg-')}`}></span>
                          {hierarchyName}
                        </div>
                      </td>
                      {columns.map((col, colIndex) => {
                        const jobs = matrixData[hierarchyName]?.[col] || [];
                        return (
                          <td key={`${pg.value || pg.id}-${colIndex}-${col}`} className="border border-gray-300 dark:border-almet-comet p-3 text-center">
                            {jobs.length > 0 ? (
                              <div className="space-y-2">
                                {jobs.map((job, jobIndex) => (
                                  <div 
                                    key={`${job.id}-${jobIndex}`}
                                    className="bg-almet-sapphire/10 dark:bg-almet-sapphire/20 text-almet-sapphire dark:text-almet-steel-blue text-xs p-2 rounded cursor-pointer hover:bg-almet-sapphire/20 dark:hover:bg-almet-sapphire/30 transition-colors border border-almet-sapphire/20"
                                    onClick={() => setSelectedJob(job)}
                                    title={job.title}
                                  >
                                    <div className="font-medium truncate mb-1">{job.title}</div>
                                    <div className="flex items-center justify-center gap-1 text-xs opacity-75">
                                      <Users size={10} />
                                      <span>{job.currentEmployees}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-gray-400 dark:text-almet-bali-hai text-xs">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Summary */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-almet-san-juan rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {jobCatalogData.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-almet-bali-hai">Total Jobs</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {positionGroups.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-almet-bali-hai">Hierarchy Levels</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {columns.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-almet-bali-hai">
                  {matrixView === 'department' ? 'Departments' : 
                   matrixView === 'function' ? 'Job Functions' : 'Business Functions'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}