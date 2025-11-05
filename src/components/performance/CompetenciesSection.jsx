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
    if (competencies?.length > 0) {
      const groups = {};
      competencies.forEach(comp => {
        const groupName = comp.competency_group_name || 'Ungrouped';
        groups[groupName] = true;
      });
      setExpandedGroups(groups);
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
        groupedData[groupName] = { requiredTotal: 0, actualTotal: 0, count: 0 };
      }

      const required = parseFloat(comp.required_level) || 0;
      const actual = parseFloat(comp.end_year_rating_value) || 0;

      groupedData[groupName].requiredTotal += required;
      groupedData[groupName].actualTotal += actual;
      groupedData[groupName].count += 1;

      totalRequiredSum += required;
      totalActualSum += actual;
    });

    const getLetterGrade = (percentage) => {
      if (!settings.evaluationScale?.length) return 'N/A';
      const match = settings.evaluationScale.find(s => 
        percentage >= s.range_min && percentage <= s.range_max
      );
      return match ? match.name : 'N/A';
    };

    const calculatedGroupScores = {};
    Object.entries(groupedData).forEach(([groupName, data]) => {
      const percentage = data.requiredTotal > 0 ? (data.actualTotal / data.requiredTotal) * 100 : 0;
      calculatedGroupScores[groupName] = {
        requiredTotal: data.requiredTotal,
        actualTotal: data.actualTotal,
        count: data.count,
        percentage: percentage.toFixed(1),
        grade: getLetterGrade(percentage)
      };
    });

    const overallPercentage = totalRequiredSum > 0 ? (totalActualSum / totalRequiredSum) * 100 : 0;

    setGroupScores(calculatedGroupScores);
    setOverallScore({
      totalRequired: totalRequiredSum,
      totalActual: totalActualSum,
      percentage: overallPercentage.toFixed(1),
      grade: getLetterGrade(overallPercentage)
    });
  };

  const getGradeColor = (grade) => {
    if (!settings.evaluationScale?.length) {
      return darkMode ? 'text-almet-santas-gray' : 'text-gray-600';
    }
    
    const scaleItem = settings.evaluationScale.find(s => s.name === grade);
    if (!scaleItem) {
      return darkMode ? 'text-almet-santas-gray' : 'text-gray-600';
    }
    
    const sortedScales = [...settings.evaluationScale].sort((a, b) => b.value - a.value);
    const gradeIndex = sortedScales.findIndex(s => s.name === grade);
    const totalGrades = sortedScales.length;
    
    if (gradeIndex === 0) return 'text-emerald-600 dark:text-emerald-400';
    if (gradeIndex === 1 && totalGrades > 2) return 'text-blue-600 dark:text-blue-400';
    if (gradeIndex < totalGrades / 2) return 'text-yellow-600 dark:text-yellow-400';
    if (gradeIndex < totalGrades * 0.75) return 'text-orange-600 dark:text-orange-400';
    if (gradeIndex < totalGrades - 1) return 'text-purple-600 dark:text-purple-400';
    return 'text-red-600 dark:text-red-400';
  };

  const toggleGroup = (groupName) => {
    setExpandedGroups(prev => ({ ...prev, [groupName]: !prev[groupName] }));
  };

  const getGapIcon = (gap) => {
    if (gap > 0) return TrendingUp;
    if (gap < 0) return TrendingDown;
    return Minus;
  };

  const getGapColor = (gap) => {
    if (gap > 0) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20';
    if (gap < 0) return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20';
    return darkMode ? 'text-almet-santas-gray bg-almet-comet' : 'text-gray-600 bg-gray-50';
  };

  const formatNumber = (value) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0' : num.toFixed(0);
  };

  const groupedCompetencies = (competencies || []).reduce((acc, comp) => {
    const groupName = comp.competency_group_name || 'Ungrouped';
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(comp);
    return acc;
  }, {});

  if (!Array.isArray(competencies)) {
    return (
      <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} rounded-xl border p-4`}>
        <div className="text-center text-red-600">Error: Invalid data</div>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? 'bg-almet-cloud-burst border-almet-comet' : 'bg-white border-gray-200'} rounded-xl border overflow-hidden`}>
      <div className={`p-4 border-b ${darkMode ? 'border-almet-comet bg-almet-san-juan' : 'border-gray-200 bg-purple-50'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${darkMode ? 'bg-purple-500/20' : 'bg-purple-100'}`}>
              <Award className={`w-5 h-5 ${darkMode ? 'text-purple-400' : 'text-purple-600'}`} />
            </div>
            <div>
              <h3 className={`text-base font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                Competencies
              </h3>
              <p className={`text-xs ${darkMode ? 'text-almet-santas-gray' : 'text-almet-waterloo'}`}>
                {competencies.length} total competencies
              </p>
            </div>
          </div>
          
          <div className={`px-3 py-2 rounded-lg ${darkMode ? 'bg-purple-900/30' : 'bg-purple-100'}`}>
            <div className={`text-xs ${darkMode ? 'text-almet-santas-gray' : 'text-gray-600'} mb-0.5`}>Overall</div>
            <div className="flex items-center gap-2">
              <span className={`text-lg font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
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
        <div className="text-center py-10">
          <Award className={`w-12 h-12 mx-auto mb-2 ${darkMode ? 'text-almet-comet' : 'text-gray-300'}`} />
          <p className={`text-sm ${darkMode ? 'text-almet-santas-gray' : 'text-gray-500'}`}>No competencies</p>
        </div>
      ) : (
        <div className={`divide-y ${darkMode ? 'divide-almet-comet' : 'divide-gray-200'}`}>
          {Object.entries(groupedCompetencies).map(([groupName, groupComps]) => {
            const isExpanded = expandedGroups[groupName];
            const groupScore = groupScores[groupName];

            return (
              <div key={groupName}>
                <button
                  onClick={() => toggleGroup(groupName)}
                  className={`w-full p-3 flex items-center justify-between ${
                    darkMode ? 'hover:bg-almet-san-juan' : 'hover:bg-gray-50'
                  } transition-colors`}
                >
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className={`w-4 h-4 ${darkMode ? 'text-almet-santas-gray' : 'text-gray-400'}`} />
                    ) : (
                      <ChevronRight className={`w-4 h-4 ${darkMode ? 'text-almet-santas-gray' : 'text-gray-400'}`} />
                    )}
                    <h4 className={`text-sm font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                      {groupName}
                    </h4>
                    <span className={`text-xs ${darkMode ? 'text-almet-santas-gray' : 'text-gray-500'}`}>
                      ({groupComps.length})
                    </span>
                  </div>
                  
                  {groupScore && (
                    <div className="text-right">
                      <p className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'}`}>
                        {groupScore.actualTotal}/{groupScore.requiredTotal}
                      </p>
                      <p className={`text-xs font-semibold ${getGradeColor(groupScore.grade)}`}>
                        {groupScore.percentage}% • {groupScore.grade}
                      </p>
                    </div>
                  )}
                </button>

                {isExpanded && (
                  <div className="p-3 space-y-2">
                    {groupComps.map((comp, idx) => {
                      const required = parseFloat(comp.required_level) || 0;
                      const actual = parseFloat(comp.end_year_rating_value) || 0;
                      const gap = actual - required;
                      const GapIcon = getGapIcon(gap);

                      return (
                        <div key={comp.id || idx} className={`${darkMode ? 'bg-almet-san-juan' : 'bg-gray-50'} rounded-lg p-3`}>
                          <div className="flex items-start gap-2 mb-2">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                              darkMode ? 'bg-purple-500/20 text-purple-400' : 'bg-purple-100 text-purple-600'
                            }`}>
                              {idx + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-almet-cloud-burst'} truncate`}>
                                {comp.competency_name || comp.name || 'N/A'}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-4 gap-2">
                            <div>
                              <label className={`block text-xs ${darkMode ? 'text-almet-santas-gray' : 'text-gray-500'} mb-1`}>Required</label>
                              <div className={`px-2 py-1 text-sm font-bold text-center rounded-lg ${
                                darkMode ? 'bg-blue-900/30 text-blue-400 border border-blue-800' : 'bg-blue-50 text-blue-700 border border-blue-300'
                              }`}>
                                {required}
                              </div>
                            </div>

                            <div className="col-span-2">
                              <label className={`block text-xs ${darkMode ? 'text-almet-santas-gray' : 'text-gray-500'} mb-1`}>Rating</label>
                              <select
                                value={comp.end_year_rating || ''}
                                onChange={(e) => {
                                  const selectedScaleId = e.target.value ? parseInt(e.target.value) : null;
                                  const globalIndex = competencies.findIndex(c => c.id === comp.id);
                                  
                                  if (selectedScaleId) {
                                    const selectedScale = settings.evaluationScale?.find(s => s.id === selectedScaleId);
                                    if (selectedScale) {
                                      onUpdate(globalIndex, 'end_year_rating', selectedScaleId);
                                    }
                                  } else {
                                    onUpdate(globalIndex, 'end_year_rating', null);
                                  }
                                }}
                                disabled={currentPeriod !== 'END_YEAR_REVIEW' || !canEdit}
                                className={`w-full px-2 py-1 text-xs border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                                  darkMode ? 'bg-almet-comet border-almet-waterloo text-white' : 'bg-white border-gray-300'
                                } disabled:opacity-50`}
                              >
                                <option value="">Select</option>
                                {settings.evaluationScale?.map(scale => (
                                  <option key={scale.id} value={scale.id}>
                                    {scale.name} ({scale.value})
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className={`block text-xs ${darkMode ? 'text-almet-santas-gray' : 'text-gray-500'} mb-1`}>Gap</label>
                              <div className={`px-2 py-1 text-sm font-bold text-center rounded-lg flex items-center justify-center gap-1 ${getGapColor(gap)}`}>
                                <GapIcon className="w-3 h-3" />
                                {gap > 0 ? `+${formatNumber(gap)}` : formatNumber(gap)}
                              </div>
                            </div>
                          </div>

                          {comp.notes !== undefined && (
                            <div className="mt-2">
                              <input
                                type="text"
                                value={comp.notes || ''}
                                onChange={(e) => {
                                  const globalIndex = competencies.findIndex(c => c.id === comp.id);
                                  onUpdate(globalIndex, 'notes', e.target.value);
                                }}
                                disabled={!canEdit}
                                className={`w-full px-2 py-1 text-xs border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                                  darkMode ? 'bg-almet-comet border-almet-waterloo text-white' : 'bg-white border-gray-300'
                                } disabled:opacity-50`}
                                placeholder="Notes..."
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {competencies.length > 0 && (
        <div className={`p-4 border-t ${darkMode ? 'border-almet-comet bg-almet-san-juan' : 'border-gray-200 bg-purple-50'}`}>
          <div className={`p-3 rounded-lg mb-3 ${
            darkMode ? 'bg-purple-900/20 border border-purple-800' : 'bg-purple-100 border border-purple-200'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h4 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-almet-cloud-burst'} mb-0.5`}>
                  Total Score
                </h4>
                <p className={`text-xs ${darkMode ? 'text-almet-santas-gray' : 'text-almet-waterloo'}`}>
                  All competencies
                </p>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>
                  {overallScore.totalActual} <span className={`text-base ${darkMode ? 'text-almet-bali-hai' : 'text-gray-500'}`}>/ {overallScore.totalRequired}</span>
                </div>
                <div className={`text-xs font-semibold ${getGradeColor(overallScore.grade)}`}>
                  {overallScore.percentage}% • {overallScore.grade}
                </div>
              </div>
            </div>
          </div>

          {canEdit && (
            <div className="flex gap-2">
              <button
                onClick={() => onSaveDraft(competencies)}
                disabled={loading}
                className={`px-3 py-2 rounded-lg text-xs font-medium disabled:opacity-50 flex items-center gap-1.5 transition-colors ${
                  darkMode ? 'bg-almet-comet text-white hover:bg-almet-waterloo' : 'bg-gray-600 text-white hover:bg-gray-700'
                }`}
              >
                {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
              
              <button
                onClick={() => onSubmit()}
                disabled={loading}
                className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium flex items-center justify-center gap-1.5 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
                Submit
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}