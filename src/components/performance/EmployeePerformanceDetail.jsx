import { ArrowLeft, Download, Star, TrendingUp, Award, Target } from 'lucide-react';
import ObjectivesSection from './ObjectivesSection';
import CompetenciesSection from './CompetenciesSection';
import PerformanceReviews from './PerformanceReviews';
import DevelopmentNeeds from './DevelopmentNeeds';

export default function EmployeePerformanceDetail({
  employee,
  performanceData,
  settings,
  currentPeriod,
  permissions,
  loading,
  darkMode,
  onBack,
  onExport,
  onUpdateObjective,
  onAddObjective,
  onDeleteObjective,
  onSaveObjectivesDraft,
  onSubmitObjectives,
  onUpdateCompetency,
  onSaveCompetenciesDraft,
  onSubmitCompetencies,
  onUpdateDevelopmentNeed,
  onAddDevelopmentNeed,
  onDeleteDevelopmentNeed,
  onSaveDevelopmentNeedsDraft,
  onSubmitDevelopmentNeeds
}) {
  const canEdit = permissions.is_admin || 
    (permissions.employee && employee.line_manager === permissions.employee.name);

  const calculateTotalWeight = (objectives) => {
    return objectives?.reduce((sum, obj) => sum + (parseFloat(obj.weight) || 0), 0) || 0;
  };

  const totalWeight = calculateTotalWeight(performanceData.objectives);
  
  // Safe number formatting helper
  const formatNumber = (value, decimals = 2) => {
    const num = parseFloat(value);
    return isNaN(num) ? '0.00' : num.toFixed(decimals);
  };

  return (
    <div className="space-y-4">
      {/* Employee Header - Sadələşdirilmiş */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg p-4 shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
            >
              <ArrowLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-almet-sapphire to-almet-astral text-white flex items-center justify-center text-sm font-semibold">
              {employee.name.charAt(0)}
            </div>
            
            <div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">{employee.name}</h2>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{employee.position}</span>
                <span>•</span>
                <span>{employee.department}</span>
                <span>•</span>
                <span className="font-mono">{employee.employee_id}</span>
              </div>
            </div>
          </div>
          
          {canEdit && (
            <button
              onClick={onExport}
              disabled={loading}
              className="px-3 py-2 bg-almet-sapphire hover:bg-almet-astral text-white rounded-lg text-xs font-medium flex items-center gap-2 disabled:opacity-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export
            </button>
          )}
        </div>
      </div>

      {/* Performance Metrics Summary - Kompakt */}
      {performanceData.overall_weighted_percentage && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MetricCard
            icon={Target}
            title="Objectives"
            value={formatNumber(performanceData.total_objectives_score)}
            subtitle={`${formatNumber(performanceData.objectives_percentage, 0)}%`}
            color="blue"
            darkMode={darkMode}
          />
          <MetricCard
            icon={Award}
            title="Competencies"
            value={`${performanceData.total_competencies_actual_score || 0}/${performanceData.total_competencies_required_score || 0}`}
            subtitle={`${formatNumber(performanceData.competencies_percentage, 0)}% • ${performanceData.competencies_letter_grade || 'N/A'}`}
            color="purple"
            darkMode={darkMode}
          />
          <MetricCard
            icon={TrendingUp}
            title="Overall"
            value={`${formatNumber(performanceData.overall_weighted_percentage, 0)}%`}
            subtitle="Weighted Avg"
            color="green"
            darkMode={darkMode}
          />
          <MetricCard
            icon={Star}
            title="Rating"
            value={performanceData.final_rating || 'N/A'}
            subtitle="Final Grade"
            color="yellow"
            darkMode={darkMode}
          />
        </div>
      )}

      {/* Evaluation Scale Reference - Kompakt */}
      <EvaluationScaleReference scales={settings.evaluationScale} darkMode={darkMode} />

      {/* Main Content Sections */}
      <ObjectivesSection
        objectives={performanceData.objectives || []}
        settings={settings}
        currentPeriod={currentPeriod}
        canEdit={canEdit}
        loading={loading}
        darkMode={darkMode}
        totalWeight={totalWeight}
        totalScore={performanceData.total_objectives_score}
        percentage={performanceData.objectives_percentage}
        targetScore={settings.evaluationTargets?.objective_score_target}
        onUpdate={onUpdateObjective}
        onAdd={onAddObjective}
        onDelete={onDeleteObjective}
        onSaveDraft={onSaveObjectivesDraft}
        onSubmit={onSubmitObjectives}
      />

      <CompetenciesSection
        competencies={performanceData.competency_ratings || []}
        groupScores={performanceData.group_competency_scores}
        settings={settings}
        currentPeriod={currentPeriod}
        canEdit={canEdit}
        loading={loading}
        darkMode={darkMode}
        totalRequired={performanceData.total_competencies_required_score}
        totalActual={performanceData.total_competencies_actual_score}
        percentage={performanceData.competencies_percentage}
        letterGrade={performanceData.competencies_letter_grade}
        onUpdate={onUpdateCompetency}
        onSaveDraft={onSaveCompetenciesDraft}
        onSubmit={onSubmitCompetencies}
      />

      <PerformanceReviews
        midYearEmployee={performanceData.mid_year_employee_comment}
        midYearManager={performanceData.mid_year_manager_comment}
        endYearEmployee={performanceData.end_year_employee_comment}
        endYearManager={performanceData.end_year_manager_comment}
        currentPeriod={currentPeriod}
        canEdit={canEdit}
        darkMode={darkMode}
      />

      <DevelopmentNeeds
        developmentNeeds={performanceData.development_needs || []}
        competencies={performanceData.competency_ratings || []}
        canEdit={canEdit}
        loading={loading}
        darkMode={darkMode}
        onUpdate={onUpdateDevelopmentNeed}
        onAdd={onAddDevelopmentNeed}
        onDelete={onDeleteDevelopmentNeed}
        onSaveDraft={onSaveDevelopmentNeedsDraft}
        onSubmit={onSubmitDevelopmentNeeds}
      />
    </div>
  );
}

function MetricCard({ icon: Icon, title, value, subtitle, color, darkMode }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600'
  };

  return (
    <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border p-3 hover:shadow-md transition-shadow`}>
      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center mb-2`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <h3 className="text-[10px] font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">{title}</h3>
      <p className="text-lg font-bold text-gray-900 dark:text-white mb-0.5">{value}</p>
      <p className="text-[10px] text-gray-600 dark:text-gray-400">{subtitle}</p>
    </div>
  );
}

function EvaluationScaleReference({ scales, darkMode }) {
  return (
    <details className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border overflow-hidden group`}>
      <summary className="p-3 cursor-pointer flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-almet-mystic dark:bg-almet-cloud-burst/20 flex items-center justify-center">
            <Star className="w-3.5 h-3.5 text-almet-sapphire" />
          </div>
          <h3 className="text-xs font-semibold text-gray-900 dark:text-white">
            Evaluation Scale Reference
          </h3>
        </div>
        <svg className="w-4 h-4 text-gray-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      
      <div className="p-3 border-t border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {scales?.map((scale) => (
            <div key={scale.id} className={`${darkMode ? 'bg-gray-750' : 'bg-gray-50'} rounded-lg p-2.5 text-center`}>
              <div className="text-sm font-bold text-almet-sapphire dark:text-almet-astral mb-1">
                {scale.name}
              </div>
              <div className="text-xs font-semibold text-gray-900 dark:text-white mb-0.5">
                Value: {scale.value}
              </div>
              <div className="text-[10px] text-gray-500 dark:text-gray-400">
                {scale.range_min}-{scale.range_max}%
              </div>
              {scale.description && (
                <div className="text-[10px] text-gray-600 dark:text-gray-400 mt-1.5 pt-1.5 border-t border-gray-200 dark:border-gray-700">
                  {scale.description}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}