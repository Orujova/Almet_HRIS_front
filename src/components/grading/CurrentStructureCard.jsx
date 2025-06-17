import React from "react";
import { BarChart3, Target } from "lucide-react";

const CurrentStructureCard = ({ currentData, basePositionName }) => {
  const formatCurrency = (value) => {
    const numValue = value || 0;
    return numValue.toLocaleString();
  };

  const formatPercentage = (value, decimals = 1) => {
    const numValue = value || 0;
    return `${(numValue * 100).toFixed(decimals)}%`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-almet-mystic to-blue-50 dark:from-almet-cloud-burst/20 dark:to-blue-900/20 border-b border-gray-200 dark:border-gray-700">
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
      </div>
      
      <div className="p-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 rounded-xl border border-blue-200 dark:border-blue-800">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {formatPercentage(currentData?.verticalAvg)}
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Vertical Average</div>
            <div className="text-xs text-gray-500 mt-1">Position transitions</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30 rounded-xl border border-green-200 dark:border-green-800">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {formatPercentage(currentData?.horizontalAvg)}
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Horizontal Average</div>
            <div className="text-xs text-gray-500 mt-1">Salary spreads</div>
          </div>
          
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30 rounded-xl border border-purple-200 dark:border-purple-800">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {formatCurrency(currentData?.baseValue1)}
            </div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Base Value</div>
            <div className="text-xs text-gray-500 mt-1">{basePositionName}</div>
          </div>
        </div>

        {/* Structure Table */}
        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-almet-waterloo dark:text-almet-bali-hai">
                    Grade Level
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-almet-waterloo dark:text-almet-bali-hai">
                    LD
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-almet-waterloo dark:text-almet-bali-hai">
                    LQ
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-almet-waterloo dark:text-almet-bali-hai ">
                    Median
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-almet-waterloo dark:text-almet-bali-hai">
                    UQ
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-almet-waterloo dark:text-almet-bali-hai">
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
                      <td className="py-4 px-4 text-sm font-medium text-almet-cloud-burst dark:text-white">
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
                              <Target size={10} />
                              Base
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-sm text-right font-mono text-almet-waterloo dark:text-almet-bali-hai">
                        {formatCurrency(values.LD)}
                      </td>
                      <td className="py-4 px-4 text-sm text-right font-mono text-almet-waterloo dark:text-almet-bali-hai">
                        {formatCurrency(values.LQ)}
                      </td>
                      <td className="py-4 px-4 text-sm text-right font-mono font-bold text-almet-waterloo dark:text-almet-bali-hai">
                        {formatCurrency(values.M)}
                      </td>
                      <td className="py-4 px-4 text-sm text-right font-mono text-almet-waterloo dark:text-almet-bali-hai">
                        {formatCurrency(values.UQ)}
                      </td>
                      <td className="py-4 px-4 text-sm text-right font-mono text-almet-waterloo dark:text-almet-bali-hai">
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

export default CurrentStructureCard;