'use client';
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Settings, Users, Target, TrendingUp, Award,
  ChevronRight, Calendar, FileText, Download
} from 'lucide-react';
import { useTheme } from '@/components/common/ThemeProvider';
import BehavioralAssessmentCalculation from '@/components/assessment/BehavioralAssessmentCalculation';
import CoreEmployeeCalculation from '@/components/assessment/CoreEmployeeCalculation';
import AssessmentSettings from '@/components/assessment/AssessmentSettings';
import { assessmentApi } from '@/services/assessmentApi';

const AssessmentMatrix = () => {
  const { darkMode } = useTheme();
  const [activeView, setActiveView] = useState('behavioral');
  const [showSettings, setShowSettings] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Theme classes
  const bgApp = darkMode ? 'bg-gray-900' : 'bg-almet-mystic';
  const bgCard = darkMode ? 'bg-almet-cloud-burst' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-almet-cloud-burst';
  const textSecondary = darkMode ? 'text-almet-bali-hai' : 'text-almet-waterloo';
  const borderColor = darkMode ? 'border-almet-comet' : 'border-gray-200';

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [summary, employeeOverview] = await Promise.all([
        assessmentApi.dashboard.getSummary(),
        assessmentApi.dashboard.getEmployeeOverview()
      ]);
      
      setDashboardData({ summary, employeeOverview });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Default statistics if data not loaded
  const stats = {
    behavioral: {
      totalAssessments: dashboardData?.summary?.behavioral_assessments_total || 0,
      completedAssessments: dashboardData?.summary?.behavioral_assessments_completed || 0,
      averageScore: dashboardData?.summary?.behavioral_average_score || 0,
      topPerformers: dashboardData?.summary?.behavioral_top_performers || 0
    },
    core: {
      totalAssessments: dashboardData?.summary?.core_assessments_total || 0,
      completedAssessments: dashboardData?.summary?.core_assessments_completed || 0,
      averageGap: dashboardData?.summary?.core_average_gap || 0,
      skillsEvaluated: dashboardData?.summary?.core_skills_evaluated || 0
    }
  };

  const StatCard = ({ title, value, subtitle, icon: Icon, color = 'almet-sapphire' }) => (
    <div className={`${bgCard} rounded-xl p-4 border-2 ${borderColor} hover:shadow-lg transition-all duration-200`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg bg-${color} bg-opacity-10`}>
          <Icon className={`w-5 h-5 text-${color}`} />
        </div>
        <div className="text-right">
          <div className={`text-lg font-bold ${textPrimary}`}>{value}</div>
          <div className={`text-xs ${textSecondary}`}>{subtitle}</div>
        </div>
      </div>
      <h3 className={`text-sm font-semibold ${textPrimary}`}>{title}</h3>
    </div>
  );

  const ActionButton = ({ onClick, icon: Icon, label, variant = 'primary', className = '' }) => {
    const variants = {
      primary: 'bg-almet-sapphire hover:bg-almet-astral text-white',
      secondary: 'bg-almet-bali-hai hover:bg-almet-waterloo text-white',
      outline: 'border-2 border-almet-sapphire text-almet-sapphire hover:bg-almet-sapphire hover:text-white'
    };

    return (
      <button
        onClick={onClick}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm
          transition-all duration-200 hover:shadow-md ${variants[variant]} ${className}
        `}
      >
        <Icon size={16} />
        {label}
      </button>
    );
  };

  // Handle export
  const handleExportReport = async () => {
    try {
      // You can implement a combined report export here
      const reportData = {
        type: 'assessment_matrix_report',
        activeView,
        timestamp: new Date().toISOString(),
        statistics: stats
      };
      
      const blob = new Blob([JSON.stringify(reportData, null, 2)], {
        type: 'application/json'
      });
      
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `assessment_matrix_report_${new Date().toISOString().split('T')[0]}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  if (showSettings) {
    return <AssessmentSettings onBack={() => setShowSettings(false)} />;
  }

  return (
    <div className={`min-h-screen ${bgApp} p-6`}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <header className={`${bgCard} rounded-xl p-6 shadow-lg border-2 ${borderColor}`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <h1 className={`text-2xl font-bold ${textPrimary} flex items-center gap-3`}>
                <div className="p-2 bg-almet-sapphire bg-opacity-10 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-almet-sapphire" />
                </div>
                Assessment Matrix
              </h1>
              <p className={`text-sm ${textSecondary}`}>
                Comprehensive employee competency assessment and evaluation system
              </p>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <Calendar className={`w-4 h-4 ${textSecondary}`} />
                  <span className={`text-xs ${textSecondary}`}>
                    Last updated: {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 mt-4 lg:mt-0">
              <ActionButton
                onClick={() => setShowSettings(true)}
                icon={Settings}
                label="Settings"
                variant="outline"
              />
              <ActionButton
                onClick={handleExportReport}
                icon={Download}
                label="Export Report"
                variant="secondary"
              />
            </div>
          </div>
        </header>

        {/* Navigation Tabs */}
        <nav className={`${bgCard} rounded-xl p-2 shadow-lg border-2 ${borderColor}`}>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveView('behavioral')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeView === 'behavioral'
                  ? 'bg-almet-sapphire text-white shadow-md'
                  : `${textSecondary} hover:${textPrimary} hover:bg-almet-mystic`
              }`}
            >
              <Users size={18} />
              <div className="text-left">
                <div className="text-sm font-semibold">Behavioral Assessment</div>
                <div className="text-xs opacity-75">Employee behavioral competencies</div>
              </div>
              <ChevronRight size={16} className={activeView === 'behavioral' ? 'rotate-90' : ''} />
            </button>
            
            <button
              onClick={() => setActiveView('core')}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeView === 'core'
                  ? 'bg-almet-sapphire text-white shadow-md'
                  : `${textSecondary} hover:${textPrimary} hover:bg-almet-mystic`
              }`}
            >
              <Target size={18} />
              <div className="text-left">
                <div className="text-sm font-semibold">Core Employee Assessment</div>
                <div className="text-xs opacity-75">Technical skills evaluation</div>
              </div>
              <ChevronRight size={16} className={activeView === 'core' ? 'rotate-90' : ''} />
            </button>
          </div>
        </nav>

        {/* Statistics Overview */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeView === 'behavioral' ? (
            <>
              <StatCard
                title="Total Assessments"
                value={stats.behavioral.totalAssessments}
                subtitle="All time"
                icon={FileText}
                color="almet-sapphire"
              />
              <StatCard
                title="Completed"
                value={stats.behavioral.completedAssessments}
                subtitle="This month"
                icon={Award}
                color="green-500"
              />
              <StatCard
                title="Average Score"
                value={`${stats.behavioral.averageScore}%`}
                subtitle="Team average"
                icon={TrendingUp}
                color="blue-500"
              />
              <StatCard
                title="Top Performers"
                value={stats.behavioral.topPerformers}
                subtitle="Above 80%"
                icon={Users}
                color="purple-500"
              />
            </>
          ) : (
            <>
              <StatCard
                title="Total Assessments"
                value={stats.core.totalAssessments}
                subtitle="All time"
                icon={FileText}
                color="almet-sapphire"
              />
              <StatCard
                title="Completed"
                value={stats.core.completedAssessments}
                subtitle="This month"
                icon={Award}
                color="green-500"
              />
              <StatCard
                title="Average Gap"
                value={stats.core.averageGap}
                subtitle="Skills gap"
                icon={TrendingUp}
                color="orange-500"
              />
              <StatCard
                title="Skills Evaluated"
                value={stats.core.skillsEvaluated}
                subtitle="Unique skills"
                icon={Target}
                color="purple-500"
              />
            </>
          )}
        </section>

        {/* Main Content */}
        <section className="space-y-6">
          {activeView === 'behavioral' ? (
            <BehavioralAssessmentCalculation />
          ) : (
            <CoreEmployeeCalculation />
          )}
        </section>
      </div>
    </div>
  );
};

export default AssessmentMatrix;