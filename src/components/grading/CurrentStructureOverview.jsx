// src/components/grading/CurrentStructureOverview.jsx - Enhanced current structure display
import React from "react";
import { BarChart3, Target, Calendar, User, TrendingUp } from "lucide-react";

const CurrentStructureOverview = ({ currentData, currentScenario, basePositionName }) => {
  const formatCurrency = (value) => {
    const numValue = value || 0;
    return numValue.toLocaleString();
  };

  const formatPercentage = (value, decimals = 1) => {
    const numValue = value || 0;
    return `${(numValue * 100).toFixed(decimals)}%`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-almet-mystic to-blue-50 dark:from-almet-cloud-burst/20 dark:to-blue-900/20 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-almet-sapphire rounded-lg flex items-center justify-center">
              <BarChart3 size={16} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-almet-cloud-burst dark:text-white">
                Current Grade Structure
              </h2>
              <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai">
                Active compensation structure with {currentData?.gradeOrder?.length || 0} position groups
              </p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Active
            </span>
          </div>
        </div>
      </div>
      
      <div className="p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="text-xl font-bold text-blue-600 mb-1">
              {formatPercentage(currentData?.verticalAvg)}
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Vertical Avg</div>
            <div className="text-xs text-gray-500 mt-1">Grade progression</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30 rounded-lg border border-green-200 dark:border-green-800">
            <div className="text-xl font-bold text-green-600 mb-1">
              {formatPercentage(currentData?.horizontalAvg)}
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Horizontal Avg</div>
            <div className="text-xs text-gray-500 mt-1">Salary spreads</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="text-xl font-bold text-purple-600 mb-1">
              {formatCurrency(currentData?.baseValue1)}
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Base Value</div>
            <div className="text-xs text-gray-500 mt-1">{basePositionName}</div>
          </div>

          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/30 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="text-xl font-bold text-orange-600 mb-1">
              {currentData?.gradeOrder?.length || 0}
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Positions</div>
            <div className="text-xs text-gray-500 mt-1">Grade levels</div>
          </div>
        </div>

        {/* Current Scenario Info */}
        {currentScenario && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white flex items-center gap-2">
                <TrendingUp size={16} className="text-almet-sapphire" />
                Current Scenario Details
              </h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-almet-waterloo dark:text-almet-bali-hai">Name:</span>
                <span className="font-medium text-almet-cloud-burst dark:text-white">{currentScenario.name}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-gray-400" />
                <span className="text-almet-waterloo dark:text-almet-bali-hai">Applied:</span>
                <span className="font-medium text-almet-cloud-burst dark:text-white">
                  {formatDate(currentScenario.applied_at)}
                </span>
              </div>
              
              {currentScenario.applied_by_name && (
                <div className="flex items-center gap-2">
                  <User size={14} className="text-gray-400" />
                  <span className="text-almet-waterloo dark:text-almet-bali-hai">By:</span>
                  <span className="font-medium text-almet-cloud-burst dark:text-white">
                    {currentScenario.applied_by_name}
                  </span>
                </div>
              )}
            </div>
            
            {currentScenario.description && (
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-almet-waterloo dark:text-almet-bali-hai">
                  {currentScenario.description}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Structure Table */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h3 className="text-sm font-semibold text-almet-cloud-burst dark:text-white mb-3">
            Grade Structure Details
          </h3>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-almet-waterloo dark:text-almet-bali-hai">
                    Grade Level
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-almet-waterloo dark:text-almet-bali-hai">
                    LD
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-almet-waterloo dark:text-almet-bali-hai">
                    LQ
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-almet-waterloo dark:text-almet-bali-hai bg-blue-50 dark:bg-blue-900/20 rounded">
                    Median
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-almet-waterloo dark:text-almet-bali-hai">
                    UQ
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-almet-waterloo dark:text-almet-bali-hai">
                    UD
                  </th>
                </tr>
              </thead>
              <tbody>
                {(currentData?.gradeOrder || []).map((gradeName, index) => {
                  const values = currentData?.grades?.[gradeName] || {};
                  const isBasePosition = gradeName === basePositionName;
                  const isTopPosition = index === 0;
                  
                  return (
                    <tr 
                      key={gradeName} 
                      className={`border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
                        isBasePosition ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                      }`}
                    >
                      <td className="py-3 px-4 text-sm font-medium text-almet-cloud-burst dark:text-white">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            isTopPosition ? 'bg-red-500' : isBasePosition ? 'bg-blue-500' : 'bg-gray-400'
                          }`} />
                          <span>{gradeName}</span>
                          {isTopPosition && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                              Top
                            </span>
                          )}
                          {isBasePosition && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium flex items-center gap-1">
                              <Target size={8} />
                              Base
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-mono text-almet-waterloo dark:text-almet-bali-hai">
                        {formatCurrency(values.LD)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-mono text-almet-waterloo dark:text-almet-bali-hai">
                        {formatCurrency(values.LQ)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-mono font-semibold text-blue-600 bg-blue-50 dark:bg-blue-900/20 rounded">
                        {formatCurrency(values.M)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-mono text-almet-waterloo dark:text-almet-bali-hai">
                        {formatCurrency(values.UQ)}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-mono text-almet-waterloo dark:text-almet-bali-hai">
                        {formatCurrency(values.UD)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentStructureOverview;