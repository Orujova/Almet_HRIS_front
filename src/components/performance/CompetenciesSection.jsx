import { useState, useEffect } from "react";
import {
  Award,
  ChevronDown,
  ChevronRight,
  Save,
  Send,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader,
} from "lucide-react";

export default function CompetenciesSection({
  competencies = [],
  settings,
  currentPeriod,
  canEdit,
  loading,
  darkMode,
  onUpdate,
  onSaveDraft,
  onSubmit,
}) {
  const [expandedGroups, setExpandedGroups] = useState({});
  const [groupScores, setGroupScores] = useState({});
  const [overallScore, setOverallScore] = useState({
    totalRequired: 0,
    totalActual: 0,
    percentage: 0,
    grade: "N/A",
  });

  // qruplar default: closed
  useEffect(() => {
    if (competencies && competencies.length > 0) {
      const groups = {};
      competencies.forEach((c) => {
        const g = c.competency_group_name || "Ungrouped";
        if (!groups[g]) groups[g] = false;
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

    competencies.forEach((comp) => {
      const groupName = comp.competency_group_name || "Ungrouped";
      if (!groupedData[groupName]) {
        groupedData[groupName] = {
          requiredTotal: 0,
          actualTotal: 0,
          count: 0,
        };
      }
      const required = parseFloat(comp.required_level) || 0;
      const actual = parseFloat(comp.end_year_rating_value) || 0;

      groupedData[groupName].requiredTotal += required;
      groupedData[groupName].actualTotal += actual;
      groupedData[groupName].count += 1;

      totalRequiredSum += required;
      totalActualSum += actual;
    });

    const getLetterGradeFromScale = (percentage) => {
      if (!settings.evaluationScale || settings.evaluationScale.length === 0) {
        return "N/A";
      }
      const match = settings.evaluationScale.find(
        (s) => percentage >= s.range_min && percentage <= s.range_max
      );
      return match ? match.name : "N/A";
    };

    const calculated = {};
    Object.entries(groupedData).forEach(([groupName, data]) => {
      const percentage =
        data.requiredTotal > 0
          ? (data.actualTotal / data.requiredTotal) * 100
          : 0;
      calculated[groupName] = {
        requiredTotal: data.requiredTotal,
        actualTotal: data.actualTotal,
        count: data.count,
        percentage: percentage.toFixed(1),
        grade: getLetterGradeFromScale(percentage),
      };
    });

    const overallPercentage =
      totalRequiredSum > 0
        ? (totalActualSum / totalRequiredSum) * 100
        : 0;

    setGroupScores(calculated);
    setOverallScore({
      totalRequired: totalRequiredSum,
      totalActual: totalActualSum,
      percentage: overallPercentage.toFixed(1),
      grade: getLetterGradeFromScale(overallPercentage),
    });
  };

  const getGradeColor = (grade) => {
    if (!settings.evaluationScale || settings.evaluationScale.length === 0)
      return "text-gray-600 dark:text-gray-400";

    const item = settings.evaluationScale.find((s) => s.name === grade);
    if (!item) return "text-gray-600 dark:text-gray-400";

    const sorted = [...settings.evaluationScale].sort(
      (a, b) => b.value - a.value
    );
    const gradeIndex = sorted.findIndex((s) => s.name === grade);
    const total = sorted.length;

    if (gradeIndex === 0) return "text-emerald-600 dark:text-emerald-400";
    if (gradeIndex === 1 && total > 2)
      return "text-blue-600 dark:text-blue-400";
    if (gradeIndex < total / 2) return "text-yellow-600 dark:text-yellow-400";
    if (gradeIndex < total * 0.75)
      return "text-orange-600 dark:text-orange-400";
    if (gradeIndex < total - 1) return "text-purple-600 dark:text-purple-400";
    return "text-red-600 dark:text-red-400";
  };

  const toggleGroup = (groupName) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

  const getGapIcon = (gap) => {
    if (gap > 0) return TrendingUp;
    if (gap < 0) return TrendingDown;
    return Minus;
  };

  const getGapColor = (gap) => {
    if (gap > 0)
      return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20";
    if (gap < 0)
      return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";
    return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700";
  };

  const formatNumber = (value, decimals = 2) => {
    const num = parseFloat(value);
    return Number.isNaN(num) ? "0" : num.toFixed(decimals);
  };

  const groupedCompetencies = (competencies || []).reduce((acc, comp) => {
    const groupName = comp.competency_group_name || "Ungrouped";
    if (!acc[groupName]) acc[groupName] = [];
    acc[groupName].push(comp);
    return acc;
  }, {});

  if (!Array.isArray(competencies)) {
    return (
      <div
        className={`rounded-lg border shadow-sm p-4 ${
          darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        }`}
      >
        <div className="text-center text-red-600">
          Error: Invalid competencies data
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-lg border shadow-sm overflow-hidden ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      {/* Header */}
      <div
        className={`p-4 border-b ${
          darkMode ? "border-gray-700 bg-gray-750" : "border-gray-200 bg-gray-50"
        }`}
      >
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
                Evaluate competencies based on required levels •{" "}
                {competencies.length} total
              </p>
            </div>
          </div>

          <div
            className={`px-3 py-2 rounded-lg ${
              darkMode ? "bg-purple-900/30" : "bg-purple-50"
            }`}
          >
            <div className="text-xs text-gray-600 dark:text-gray-400 mb-0.5">
              Overall Score
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {overallScore.totalActual}/{overallScore.totalRequired}
              </span>
              <span
                className={`text-sm font-semibold ${getGradeColor(
                  overallScore.grade
                )}`}
              >
                {overallScore.percentage}% • {overallScore.grade}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Empty state */}
      {Object.keys(groupedCompetencies).length === 0 ? (
        <div className="text-center py-10">
          <Award className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-xs text-gray-500 dark:text-gray-400">
            No competencies configured
          </p>
          <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1">
            Competencies will appear here once they are assigned
          </p>
        </div>
      ) : (
        <div
          className={
            darkMode
              ? "divide-y divide-gray-700"
              : "divide-y divide-gray-200"
          }
        >
          {Object.entries(groupedCompetencies).map(([groupName, groupComps]) => {
            const isExpanded = expandedGroups[groupName];
            const groupScore = groupScores[groupName];

            return (
              <div key={groupName}>
                <button
                  type="button"
                  onClick={() => toggleGroup(groupName)}
                  className={`w-full p-3 flex items-center justify-between text-left text-xs transition-colors ${
                    darkMode ? "hover:bg-gray-750" : "hover:bg-gray-50"
                  }`}
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
                    <div className="text-right">
                      <p className="text-xs font-bold text-gray-900 dark:text-white">
                        {groupScore.actualTotal}/{groupScore.requiredTotal}
                      </p>
                      <p
                        className={`text-[10px] font-semibold ${getGradeColor(
                          groupScore.grade
                        )}`}
                      >
                        {groupScore.percentage}% • {groupScore.grade}
                      </p>
                    </div>
                  )}
                </button>

                {isExpanded && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead
                        className={darkMode ? "bg-gray-750" : "bg-gray-50"}
                      >
                        <tr className="text-[10px] font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                          <th className="px-3 py-2 text-left w-10">#</th>
                          <th className="px-3 py-2 text-left min-w-[180px]">
                            Competency
                          </th>
                          <th className="px-3 py-2 text-center w-24">
                            Required
                          </th>
                          <th className="px-3 py-2 text-center w-32">
                            End Year Rating
                          </th>
                          <th className="px-3 py-2 text-center w-24">
                            Actual
                          </th>
                          <th className="px-3 py-2 text-center w-24">Gap</th>
                          <th className="px-3 py-2 text-left min-w-[200px]">
                            Notes
                          </th>
                        </tr>
                      </thead>
                      <tbody
                        className={
                          darkMode
                            ? "divide-y divide-gray-700"
                            : "divide-y divide-gray-200"
                        }
                      >
                        {groupComps.map((comp, idx) => {
                          const globalIndex = competencies.findIndex(
                            (c) => c.id === comp.id
                          );
                          const required = parseFloat(comp.required_level) || 0;
                          const actual =
                            parseFloat(comp.end_year_rating_value) || 0;
                          const gap = actual - required;
                          const GapIcon = getGapIcon(gap);
                          const gapColor = getGapColor(gap);

                          const inputBase =
                            "w-full px-2 h-9 text-xs rounded-md border focus:ring-1 focus:ring-almet-sapphire focus:border-almet-sapphire transition-colors";
                          const inputTheme = darkMode
                            ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                            : "bg-white border-gray-300 text-gray-900 placeholder-gray-400";

                          const handleChange = (field, value) => {
                            onUpdate(globalIndex, field, value);
                          };

                          return (
                            <tr
                              key={comp.id || idx}
                              className={`text-xs ${
                                darkMode
                                  ? "hover:bg-gray-750"
                                  : "hover:bg-gray-50"
                              }`}
                            >
                              <td className="px-3 py-2">
                                <div className="w-6 h-6 rounded-md bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-300 flex items-center justify-center text-[11px] font-semibold">
                                  {idx + 1}
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <div className="flex flex-col gap-0.5">
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {comp.competency_name}
                                  </span>
                                  <span className="text-[10px] text-gray-500 dark:text-gray-400">
                                    {comp.competency_code}
                                  </span>
                                </div>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                  {formatNumber(required, 1)}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <select
                                  value={comp.end_year_rating || ""}
                                  disabled={!canEdit}
                                  onChange={(e) =>
                                    handleChange(
                                      "end_year_rating",
                                      e.target.value
                                    )
                                  }
                                  className={`${inputBase} ${inputTheme}`}
                                >
                                  <option value="">Select...</option>
                                  {settings.evaluationScale?.map((s) => (
                                    <option
                                      key={s.id}
                                      value={s.value}
                                    >{`${s.name} (${s.value})`}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                  {formatNumber(actual, 1)}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <div
                                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] ${gapColor}`}
                                >
                                  <GapIcon className="w-3 h-3" />
                                  <span>{formatNumber(gap, 1)}</span>
                                </div>
                              </td>
                              <td className="px-3 py-2">
                                <textarea
                                  rows={2}
                                  value={comp.notes || ""}
                                  disabled={!canEdit}
                                  onChange={(e) =>
                                    handleChange("notes", e.target.value)
                                  }
                                  className={`${inputBase} ${inputTheme} resize-none py-1.5`}
                                  placeholder="Comments, examples..."
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

      {/* Action buttons – kompakt */}
      {competencies.length > 0 && canEdit && (
        <div
          className={`p-3 border-t flex gap-2 ${
            darkMode ? "border-gray-700 bg-gray-750" : "border-gray-200 bg-gray-50"
          }`}
        >
          <button
            type="button"
            onClick={() => onSaveDraft(competencies)}
            disabled={loading}
            className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-xs font-medium disabled:opacity-50 flex items-center gap-1.5 transition-colors"
          >
            {loading ? (
              <Loader className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => onSubmit(competencies)}
            disabled={loading}
            className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-xs font-medium disabled:opacity-50 flex items-center gap-1.5 transition-colors"
          >
            <Send className="w-3.5 h-3.5" />
            Submit
          </button>
        </div>
      )}
    </div>
  );
}
