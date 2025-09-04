'use client';
import React, { useState, useEffect } from 'react';
import { 
  Users, Target, ArrowRight, Loader2, AlertCircle, Settings,
  RefreshCw, X
} from 'lucide-react';
import { useTheme } from '@/components/common/ThemeProvider';
import BehavioralAssessmentCalculation from '@/components/assessment/BehavioralAssessmentCalculation';
import CoreEmployeeCalculation from '@/components/assessment/CoreEmployeeCalculation';
import AssessmentSettings from '@/components/assessment/AssessmentSettings';
import { assessmentApi } from '@/services/assessmentApi';

const AssessmentMatrix = () => {
  const { darkMode } = useTheme();
  const [activeView, setActiveView] = useState('dashboard');
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    behavioralAssessments: 0,
    coreAssessments: 0,
    totalAssessments: 0,
    completedAssessments: 0
  });

  // Theme classes
  const bgApp = darkMode ? 'bg-gray-900' : 'bg-almet-mystic';
  const bgCard = darkMode ? 'bg-almet-cloud-burst' : 'bg-white';
  const textPrimary = darkMode ? 'text-almet-bali-hai' : 'text-almet-cloud-burst';
  const textSecondary = darkMode ? 'text-almet-santas-gray' : 'text-almet-waterloo';
  const borderColor = darkMode ? 'border-almet-comet' : 'border-almet-bali-hai';

  // Fetch basic dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [behavioralRes, coreRes] = await Promise.all([
        assessmentApi.employeeBehavioral.getAll(),
        assessmentApi.employeeCore.getAll()
      ]);

      const behavioralAssessments = behavioralRes.results || [];
      const coreAssessments = coreRes.results || [];
      const allAssessments = [...behavioralAssessments, ...coreAssessments];
      const completed = allAssessments.filter(a => a.status === 'COMPLETED').length;

      setDashboardData({
        behavioralAssessments: behavioralAssessments.length,
        coreAssessments: coreAssessments.length,
        totalAssessments: allAssessments.length,
        completedAssessments: completed
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeView === 'dashboard') {
      fetchDashboardData();
    }
  }, [activeView]);

  // Shared Components
  const ActionButton = ({ onClick, icon: Icon, label, variant = 'primary', loading = false, disabled = false, size = 'sm' }) => {
    const variants = {
      primary: 'bg-almet-sapphire hover:bg-almet-astral text-white',
      secondary: 'bg-almet-bali-hai hover:bg-almet-waterloo text-white',
      outline: 'border border-almet-sapphire text-almet-sapphire hover:bg-almet-sapphire hover:text-white',
      success: 'bg-almet-steel-blue hover:bg-almet-astral text-white',
      info: 'bg-almet-astral hover:bg-almet-sapphire text-white'
    };

    const sizes = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-3 py-2 text-sm'
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`flex items-center gap-2 rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow ${variants[variant]} ${sizes[size]} ${(disabled || loading) ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        {loading ? <RefreshCw size={14} className="animate-spin" /> : <Icon size={14} />}
        {label}
      </button>
    );
  };

  const NavigationCard = ({ icon: Icon, title, subtitle, isActive, onClick, color, count }) => (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-lg text-left transition-all duration-200 hover:shadow group ${
        isActive
          ? `bg-gradient-to-r ${color} text-white shadow-lg`
          : `${bgCard} border ${borderColor} ${textPrimary} hover:border-almet-sapphire`
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${
          isActive ? 'bg-white/20' : 'bg-almet-sapphire bg-opacity-10'
        }`}>
          <Icon className={`w-5 h-5 ${
            isActive ? 'text-white' : 'text-almet-sapphire'
          }`} />
        </div>
        <div className="flex items-center gap-2">
          {count !== undefined && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              isActive ? 'bg-white/20 text-white' : 'bg-almet-sapphire bg-opacity-10 text-almet-sapphire'
            }`}>
              {count}
            </span>
          )}
          <ArrowRight className={`w-4 h-4 transition-transform duration-200 ${
            isActive ? 'rotate-0' : 'group-hover:translate-x-1'
          }`} />
        </div>
      </div>
      
      <h3 className="font-semibold text-sm mb-1">{title}</h3>
      <p className={`text-sm ${
        isActive ? 'text-white/80' : textSecondary
      }`}>
        {subtitle}
      </p>
    </button>
  );

  // Handle settings display
  if (showSettings) {
    return <AssessmentSettings onBack={() => setShowSettings(false)} />;
  }

  if (loading && activeView === 'dashboard') {
    return (
      <div className="space-y-4">
        <div className={`${bgCard} border ${borderColor} rounded-lg p-4 shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`font-semibold ${textPrimary}`}>Assessment Matrix</h2>
              <p className={`text-sm ${textSecondary}`}>Employee competency assessment system</p>
            </div>
            <ActionButton
              onClick={() => setShowSettings(true)}
              icon={Settings}
              label="Settings"
              variant="outline"
            />
          </div>
        </div>
        
        <div className={`min-h-96 flex items-center justify-center ${bgCard} border ${borderColor} rounded-lg p-8`}>
          <div className="text-center">
            <Loader2 className="w-6 h-6 mx-auto mb-3 animate-spin text-almet-sapphire" />
            <p className={`${textPrimary} font-medium text-sm`}>Loading assessment data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && activeView === 'dashboard') {
    return (
      <div className="space-y-4">
        <div className={`${bgCard} border ${borderColor} rounded-lg p-4 shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`font-semibold ${textPrimary}`}>Assessment Matrix</h2>
              <p className={`text-sm ${textSecondary}`}>Employee competency assessment system</p>
            </div>
            <div className="flex items-center gap-2">
              <ActionButton
                onClick={fetchDashboardData}
                icon={RefreshCw}
                label="Refresh"
                variant="secondary"
                loading={loading}
              />
              <ActionButton
                onClick={() => setShowSettings(true)}
                icon={Settings}
                label="Settings"
                variant="outline"
              />
            </div>
          </div>
        </div>
        
        <div className={`${bgCard} border border-red-200 rounded-lg p-6 shadow-sm`}>
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-500" size={20}/>
            <div>
              <h3 className="text-red-700 font-semibold text-sm">Error Loading Data</h3>
              <p className="text-sm text-red-600 mt-1">{error?.message || 'Failed to load assessment data.'}</p>
            </div>
            <div className="ml-auto">
              <ActionButton 
                icon={RefreshCw} 
                label="Try Again" 
                onClick={fetchDashboardData}
                variant="outline"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className={`${bgCard} border ${borderColor} rounded-lg p-4 shadow-sm`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className={`font-semibold ${textPrimary}`}>Assessment Matrix</h2>
            <p className={`text-sm ${textSecondary}`}>Employee competency assessment system</p>
          </div>
          <div className="flex items-center gap-2">
            {activeView !== 'dashboard' && (
              <button
                onClick={() => setActiveView('dashboard')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${darkMode ? 'bg-almet-comet hover:bg-almet-cloud-burst' : 'bg-almet-mystic hover:bg-almet-bali-hai'} ${textPrimary}`}
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                Back
              </button>
            )}
            {activeView === 'dashboard' && (
              <ActionButton
                onClick={fetchDashboardData}
                icon={RefreshCw}
                label="Refresh"
                variant="secondary"
                loading={loading}
              />
            )}
            <ActionButton
              onClick={() => setShowSettings(true)}
              icon={Settings}
              label="Settings"
              variant="outline"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {activeView === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <NavigationCard
            icon={Users}
            title="Behavioral Assessment"
            subtitle="Employee behavioral competencies evaluation"
            color="from-purple-500 to-purple-600"
            count={dashboardData.behavioralAssessments}
            isActive={false}
            onClick={() => setActiveView('behavioral')}
          />
          
          <NavigationCard
            icon={Target}
            title="Core Employee Assessment"
            subtitle="Technical skills and core competencies"
            color="from-blue-500 to-blue-600"
            count={dashboardData.coreAssessments}
            isActive={false}
            onClick={() => setActiveView('core')}
          />
        </div>
      )}

      {/* Assessment Components */}
      {activeView === 'behavioral' && (
        <div className="space-y-4">
          <BehavioralAssessmentCalculation />
        </div>
      )}

      {activeView === 'core' && (
        <div className="space-y-4">
          <CoreEmployeeCalculation />
        </div>
      )}
    </div>
  );
};

export default AssessmentMatrix;