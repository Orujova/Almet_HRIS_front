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

  // Fetch dashboard data - with better error handling
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      // Try to fetch dashboard data, but don't fail if endpoints don't exist
      const dashboardResults = await Promise.allSettled([
        assessmentApi.dashboard.getSummary().catch(err => {
          console.warn('Dashboard summary endpoint not available:', err);
          return { data: null };
        }),
        assessmentApi.dashboard.getEmployeeOverview().catch(err => {
          console.warn('Employee overview endpoint not available:', err);
          return { data: null };
        })
      ]);
      
      const [summaryResult, employeeOverviewResult] = dashboardResults;
      
      setDashboardData({
        summary: summaryResult.status === 'fulfilled' ? summaryResult.value : null,
        employeeOverview: employeeOverviewResult.status === 'fulfilled' ? employeeOverviewResult.value : null
      });
      
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Don't show error to user for dashboard data - it's not critical
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

  if (showSettings) {
    return <AssessmentSettings onBack={() => setShowSettings(false)} />;
  }

  return (
    <div className={`min-h-screen ${bgApp} py-6`}>
      <div className="mx-auto space-y-6">
        
        {/* Header */}
        <header className={`${bgCard} rounded-xl p-6 shadow-lg border-2 ${borderColor}`}>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <h1 className={`text-xl font-bold ${textPrimary} flex items-center gap-3`}>
                <div className="p-2 bg-almet-sapphire bg-opacity-10 rounded-lg">
                  <BarChart3 className="w-4 h-6 text-almet-sapphire" />
                </div>
                Assessment Matrix
              </h1>
              <p className={`text-xs ${textSecondary}`}>
                Comprehensive employee competency assessment and evaluation system
              </p>
            </div>
            
            <div className="flex items-center gap-3 mt-4 lg:mt-0">
              <ActionButton
                onClick={() => setShowSettings(true)}
                icon={Settings}
                label="Settings"
                variant="outline"
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