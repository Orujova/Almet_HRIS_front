import { useState, useEffect } from 'react';
import { Award, ChevronDown, ChevronRight, Save, Send, TrendingUp, TrendingDown, Minus, Loader } from 'lucide-react';



export default function CompetenciesSection({
  competencies = [],
  settings,
  currentPeriod,
  canEdit,
  loading,
  darkMode,
  onUpdate,
  onSaveDraft,
  onSubmit
}) {
  const [expandedGroups, setExpandedGroups] = useState({});
  const [groupScores, setGroupScores] = useState({});
  const [overallScore, setOverallScore] = useState({ 
    totalRequired: 0, 
    totalActual: 0, 
    percentage: 0, 
    grade: 'N/A' 
  });

  useEffect(() => {
    if (competencies && competencies.length > 0) {
      const groups = {};
      competencies.forEach(comp => {
        const groupName = comp.competency_group_name || 'Ungrouped';
        groups[groupName] = true;
      });
      setExpandedGroups(groups);
    }
  }, [competencies]);

  useEffect(() => {
    if (competencies && competencies.length > 0) {
      calculateAllScores();
    }
  }, [competencies, settings.evaluationScale]);

  const calculateAllScores = () => {
    const groupedData = {};
    let totalRequiredSum = 0;
    let totalActualSum = 0;

    competencies.forEach(comp => {
      const groupName = comp.competency_group_name || 'Ungrouped';
      
      if (!groupedData[groupName]) {
        groupedData[groupName] = {
          requiredTotal: 0,
          actualTotal: 0,
          count: 0
        };
      }

      const required = parseFloat(comp.required_level) || 0;
      // ✅ FIX: Use end_year_rating_value from backend
      const actual = parseFloat(comp.end_year_rating_value) || 0;

      groupedData[groupName].requiredTotal += required;
      groupedData[groupName].actualTotal += actual;
      groupedData[groupName].count += 1;

      totalRequiredSum += required;
      totalActualSum += actual;
    });

    const getLetterGradeFromScale = (percentage) => {
      if (!settings.evaluationScale || settings.evaluationScale.length === 0) {
        return 'N/A';
      }
      
      const matchingScale = settings.evaluationScale.find(scale => 
        percentage >= scale.range_min && percentage <= scale.range_max
      );
      
      return matchingScale ? matchingScale.name : 'N/A';
    };

    const calculatedGroupScores = {};
    Object.entries(groupedData).forEach(([groupName, data]) => {
      const percentage = data.requiredTotal > 0 
        ? (data.actualTotal / data.requiredTotal) * 100 
        : 0;

      calculatedGroupScores[groupName] = {
        requiredTotal: data.requiredTotal,
        actualTotal: data.actualTotal,
        count: data.count,
        percentage: percentage.toFixed(1),
        grade: getLetterGradeFromScale(percentage)
      };
    });

    const overallPercentage = totalRequiredSum > 0 
      ? (totalActualSum / totalRequiredSum) * 100 
      : 0;

    setGroupScores(calculatedGroupScores);
    setOverallScore({
      totalRequired: totalRequiredSum,
      totalActual: totalActualSum,
      percentage: overallPercentage.toFixed(1),
      grade: getLetterGradeFromScale(overallPercentage)
    });
  };

  const getGradeColor = (grade) => {
    if (!settings.evaluationScale || settings.evaluationScale.length === 0) {
      return 'text-gray-600 dark:text-gray-400';
    }
    
    const scaleItem = settings.evaluationScale.find(scale => scale.name === grade);
    
    if (!scaleItem) {
      return 'text-gray-600 dark:text-gray-400';
    }
    
    const sortedScales = [...settings.evaluationScale].sort((a, b) => b.value - a.value);
    const gradeIndex = sortedScales.findIndex(scale => scale.name === grade);
    const totalGrades = sortedScales.length;
    
    if (gradeIndex === 0) return 'text-emerald-600 dark:text-emerald-400';
    if (gradeIndex === 1 && totalGrades > 2) return 'text-blue-600 dark:text-blue-400';
    if (gradeIndex < totalGrades / 2) return 'text-yellow-600 dark:text-yellow-400';
    if (gradeIndex < totalGrades * 0.75) return 'text-orange-600 dark:text-orange-400';
    if (gradeIndex < totalGrades - 1) return 'text-purple-600 dark:text-purple-400';
    return 'text-red-600 dark:text-red-400';
  };

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

  const getGapIcon = (gap) => {
    if (gap > 0) return TrendingUp;
    if (gap < 0) return TrendingDown;
    return Minus;
  };

  const getGapColor = (gap) => {
    if (gap > 0) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
    if (gap < 0) return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
    return 'text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700';
  };

  const formatNumber = (value, decimals = 2) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0' : num.toFixed(decimals);
  };

  const groupedCompetencies = (competencies || []).reduce((acc, comp) => {
    const groupName = comp.competency_group_name || 'Ungrouped';
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(comp);
    return acc;
  }, {});

  if (!Array.isArray(competencies)) {
    return (
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border shadow-sm overflow-hidden p-4`}>
        <div className="text-center text-red-600">
          Error: Invalid competencies data
        </div>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border shadow-sm overflow-hidden`}>
      <div className={`p-4 border-b ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
              <Award className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Behavioral Competencies Assessment
              </h3>
              <p className="text-[10px] text-gray-600 dark:text-gray-400">
                Evaluate competencies based on required levels • {competencies.length} total
              </p>
            </div>
          </div>
          
          <div className={`px-3 py-2 rounded-lg ${darkMode ? 'bg-purple-900/30' : 'bg-purple-50'}`}>
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">Overall Score</div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {overallScore.totalActual}/{overallScore.totalRequired}
              </span>
              <span className={`text-sm font-semibold ${getGradeColor(overallScore.grade)}`}>
                {overallScore.percentage}% • {overallScore.grade}
              </span>
            </div>
          </div>
        </div>
      </div>

      {Object.keys(groupedCompetencies).length === 0 ? (
        <div className="text-center py-12">
          <Award className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-xs text-gray-500 dark:text-gray-400">No competencies configured</p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
            Competencies will appear here once they are assigned
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {Object.entries(groupedCompetencies).map(([groupName, groupComps]) => {
            const isExpanded = expandedGroups[groupName];
            const groupScore = groupScores[groupName];

            return (
              <div key={groupName}>
                <button
                  onClick={() => toggleGroup(groupName)}
                  className={`w-full p-3 flex items-center justify-between text-left ${
                    darkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'
                  } transition-colors`}
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                    <h4 className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                      {groupName}
                    </h4>
                    <span className="text-[10px] text-gray-500 dark:text-gray-400">
                      ({groupComps.length} competencies)
                    </span>
                  </div>
                  
                  {groupScore && (
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-900 dark:text-white">
                          {groupScore.actualTotal}/{groupScore.requiredTotal}
                        </p>
                        <p className={`text-[10px] font-semibold ${getGradeColor(groupScore.grade)}`}>
                          {groupScore.percentage}% • {groupScore.grade}
                        </p>
                      </div>
                    </div>
                  )}
                </button>

                {isExpanded && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className={`${darkMode ? 'bg-gray-750' : 'bg-gray-50'}`}>
                        <tr className="text-[10px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                          <th className="px-3 py-2 text-left w-10">#</th>
                          <th className="px-3 py-2 text-left min-w-[180px]">Competency</th>
                          <th className="px-3 py-2 text-center w-24">Required</th>
                          <th className="px-3 py-2 text-center w-32">End Year Rating</th>
                          <th className="px-3 py-2 text-center w-24">Actual</th>
                          <th className="px-3 py-2 text-center w-24">Gap</th>
                          <th className="px-3 py-2 text-left min-w-[200px]">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {groupComps.map((comp, idx) => {
                          const globalIndex = competencies.findIndex(c => c.id === comp.id);
                          const required = parseFloat(comp.required_level) || 0;
                          // ✅ FIX: Use end_year_rating_value
                          const actual = parseFloat(comp.end_year_rating_value) || 0;
                          const gap = actual - required;
                          const GapIcon = getGapIcon(gap);

                          return (
                            <tr key={comp.id || idx} className={`${darkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'} transition-colors`}>
                              <td className="px-3 py-2.5">
                                <div className="w-6 h-6 rounded-md bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center text-xs font-bold">
                                  {idx + 1}
                                </div>
                              </td>
                              <td className="px-3 py-2.5">
                                <p className="text-xs font-medium text-gray-900 dark:text-white">
                                  {comp.competency_name || comp.name || 'N/A'}
                                </p>
                              </td>
                              <td className="px-3 py-2.5">
                                <div className={`px-2 py-1.5 text-xs font-bold text-center rounded-md ${
                                  darkMode ? 'bg-blue-900/30 text-blue-400 border border-blue-800' : 'bg-blue-50 text-blue-700 border border-blue-300'
                                }`}>
                                  {required}
                                </div>
                              </td>
                              <td className="px-3 py-2.5">
                               <select
  value={comp.end_year_rating || ''}
  onChange={(e) => {
    const selectedScaleId = e.target.value ? parseInt(e.target.value) : null;
    const globalIndex = competencies.findIndex(c => c.id === comp.id);
    
    if (selectedScaleId) {
      const selectedScale = settings.evaluationScale?.find(s => s.id === selectedScaleId);
      
      if (selectedScale) {
        // ✅ Update both values in a single call by updating the parent state properly
        onUpdate(globalIndex, 'end_year_rating', selectedScaleId);
        
        console.log('🎯 Updated competency:', {
          id: comp.id,
          name: comp.competency_name,
          rating_id: selectedScaleId,
          rating_value: selectedScale.value,
          scale_name: selectedScale.name
        });
      }
    } else {
      onUpdate(globalIndex, 'end_year_rating', null);
    }
  }}
  disabled={currentPeriod !== 'END_YEAR_REVIEW' || !canEdit}
  className={`w-full px-2 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
  } disabled:opacity-50 transition-colors`}
>
  <option value="">Select</option>
  {settings.evaluationScale?.map(scale => (
    <option key={scale.id} value={scale.id}>
      {scale.name} ({scale.value})
    </option>
  ))}
</select>
                              </td>
                              <td className="px-3 py-2.5">
                                <div className={`px-2 py-1.5 text-xs font-bold text-center rounded-md ${
                                  darkMode ? 'bg-purple-900/30 text-purple-400 border border-purple-800' : 'bg-purple-50 text-purple-700 border border-purple-300'
                                }`}>
                                  {actual}
                                </div>
                              </td>
                              <td className="px-3 py-2.5">
                                <div className={`px-2 py-1.5 text-xs font-bold text-center rounded-md flex items-center justify-center gap-1 ${getGapColor(gap)}`}>
                                  <GapIcon className="w-3 h-3" />
                                  {gap > 0 ? `+${formatNumber(gap, 0)}` : formatNumber(gap, 0)}
                                </div>
                              </td>
                              <td className="px-3 py-2.5">
                                <input
                                  type="text"
                                  value={comp.notes || ''}
                                  onChange={(e) => onUpdate(globalIndex, 'notes', e.target.value)}
                                  disabled={!canEdit}
                                  className={`w-full px-2 py-1.5 text-xs border rounded-md focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
                                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                                  } disabled:opacity-50 transition-colors`}
                                  placeholder="Add notes..."
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {competencies.length > 0 && (
        <div className={`p-4 border-t ${darkMode ? 'border-gray-700 bg-gray-750' : 'border-gray-200 bg-gray-50'}`}>
          <div className={`p-3 rounded-lg ${darkMode ? 'bg-purple-900/20 border-purple-800' : 'bg-purple-50 border-purple-200'} border mb-3`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-gray-900 dark:text-white mb-0.5">
                  Total Competencies Score
                </h4>
                <p className="text-[10px] text-gray-600 dark:text-gray-400">
                  Based on all competency evaluations
                </p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {overallScore.totalActual} <span className="text-xs text-gray-500">/ {overallScore.totalRequired}</span>
                </div>
                <div className={`text-[10px] font-semibold ${getGradeColor(overallScore.grade)}`}>
                  {overallScore.percentage}% • Grade: {overallScore.grade}
                </div>
              </div>
            </div>
          </div>

          {canEdit && (
            <div className="flex gap-2">
              <button
                onClick={() => onSaveDraft(competencies)}
                disabled={loading}
                className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-xs font-medium disabled:opacity-50 flex items-center gap-1.5 transition-colors"
              >
                {loading ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save Draft
              </button>
              
              <button
                onClick={() => onSubmit()}
                disabled={loading}
                className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium flex items-center gap-1.5 disabled:opacity-50 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Submit
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}