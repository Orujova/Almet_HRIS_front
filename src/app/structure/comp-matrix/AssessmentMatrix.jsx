'use client';
import React, { useState, useEffect } from 'react';
import { 
  Users, Target, ArrowRight, Loader2, AlertCircle, Settings,
  RefreshCw, ChevronRight, Home, BarChart3, 
  TrendingUp, Award, Crown
} from 'lucide-react';
import { useTheme } from '@/components/common/ThemeProvider';
import BehavioralAssessmentCalculation from '@/components/assessment/BehavioralAssessmentCalculation';
import CoreEmployeeCalculation from '@/components/assessment/CoreEmployeeCalculation';
import LeadershipAssessmentCalculation from '@/components/assessment/LeadershipAssessmentCalculation';
import AssessmentSettings from '@/components/assessment/AssessmentSettings';
import { assessmentApi } from '@/services/assessmentApi';
import { ToastProvider, useToast } from '@/components/common/Toast';
import ConfirmationModal from '@/components/common/ConfirmationModal';

// Breadcrumb Component
const Breadcrumb = ({ items }) => (
  <nav className="flex items-center space-x-2 text-xs text-almet-waterloo mb-4" aria-label="Breadcrumb">
    {items.map((item, index) => (
      <React.Fragment key={index}>
        {index > 0 && <ChevronRight size={12} className="text-almet-bali-hai opacity-60" />}
        {item.onClick ? (
          <button
            onClick={item.onClick}
            className="hover:text-almet-sapphire transition-colors duration-200 font-medium text-xs px-2 py-1 rounded hover:bg-almet-mystic"
            aria-label={`Navigate to ${item.label}`}
          >
            {item.label}
          </button>
        ) : (
          <span className={`text-xs px-2 py-1 ${
            index === items.length - 1 
              ? 'text-almet-cloud-burst font-semibold bg-almet-mystic rounded' 
              : 'text-almet-waterloo'
          }`}>
            {item.label}
          </span>
        )}
      </React.Fragment>
    ))}
  </nav>
);

const AssessmentMatrixInner = () => {
  const { darkMode } = useTheme();
  const { showSuccess, showError } = useToast();
  
  // TAB STATE with persistence
  const [activeView, setActiveView] = useState(() => {
    if (typeof window !== 'undefined') {
      return sessionStorage.getItem('assessmentMatrixView') || 'dashboard';
    }
    return 'dashboard';
  });
  
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dashboardData, setDashboardData] = useState({
    behavioralAssessments: 0,
    coreAssessments: 0,
    leadershipAssessments: 0,
    totalAssessments: 0,
    completedAssessments: 0,
    draftAssessments: 0,
    completionRate: 0
  });

  // Confirmation modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'default'
  });

  // Tab persistence
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('assessmentMatrixView', activeView);
    }
  }, [activeView]);

  // Theme classes
  const bgApp = darkMode ? 'bg-gray-900' : 'bg-almet-mystic';
  const bgCard = darkMode ? 'bg-almet-cloud-burst' : 'bg-white';
  const textPrimary = darkMode ? 'text-almet-bali-hai' : 'text-almet-cloud-burst';
  const textSecondary = darkMode ? 'text-almet-santas-gray' : 'text-almet-waterloo';
  const borderColor = darkMode ? 'border-almet-comet' : 'border-almet-bali-hai/30';

  // Fetch basic dashboard data
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [behavioralRes, coreRes, leadershipRes] = await Promise.all([
        assessmentApi.employeeBehavioral.getAll(),
        assessmentApi.employeeCore.getAll(),
        assessmentApi.employeeLeadership.getAll()
      ]);

      const behavioralAssessments = behavioralRes.results || [];
      const coreAssessments = coreRes.results || [];
      const leadershipAssessments = leadershipRes.results || [];
      const allAssessments = [...behavioralAssessments, ...coreAssessments, ...leadershipAssessments];
      const completed = allAssessments.filter(a => a.status === 'COMPLETED').length;
      const draft = allAssessments.filter(a => a.status === 'DRAFT').length;
      const completionRate = allAssessments.length > 0 ? ((completed / allAssessments.length) * 100) : 0;

      setDashboardData({
        behavioralAssessments: behavioralAssessments.length,
        coreAssessments: coreAssessments.length,
        leadershipAssessments: leadershipAssessments.length,
        totalAssessments: allAssessments.length,
        completedAssessments: completed,
        draftAssessments: draft,
        completionRate: completionRate
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error);
      showError('Failed to load dashboard data');
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
  const ActionButton = ({ 
    onClick, 
    icon: Icon, 
    label, 
    variant = 'primary', 
    loading = false, 
    disabled = false, 
    size = 'sm',
    ...props
  }) => {
    const variants = {
      primary: 'bg-almet-sapphire hover:bg-almet-astral text-white shadow-sm hover:shadow-md',
      secondary: 'bg-almet-bali-hai hover:bg-almet-waterloo text-white shadow-sm hover:shadow-md',
      outline: 'border border-almet-sapphire text-almet-sapphire hover:bg-almet-sapphire/10 bg-transparent',
      success: 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:shadow-md',
      info: 'bg-sky-500 hover:bg-sky-600 text-white shadow-sm hover:shadow-md',
      ghost: 'text-almet-sapphire hover:bg-almet-sapphire/5 hover:text-almet-cloud-burst border border-transparent'
    };

    const sizes = {
      xs: 'px-2 py-1 text-xs',
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2 text-sm'
    };

    return (
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`
          flex items-center justify-center gap-2 rounded-lg font-medium 
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-almet-sapphire/50
          ${variants[variant]} ${sizes[size]} 
          ${(disabled || loading) ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}
        `}
        {...props}
      >
        {loading ? (
          <Loader2 size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} className="animate-spin" />
        ) : (
          <Icon size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} />
        )}
        <span className="font-medium">{label}</span>
      </button>
    );
  };

  const NavigationCard = ({ 
    icon: Icon, 
    title, 
    subtitle, 
    isActive, 
    onClick, 
    color, 
    count, 
    stats 
  }) => (
    <div
      className={`
        relative rounded-xl text-left transition-all duration-300 group cursor-pointer
        transform hover:scale-[1.02] active:scale-[0.98]
        ${isActive
          ? `bg-gradient-to-br ${color} text-white shadow-xl ring-2 ring-white/20`
          : `${bgCard} border ${borderColor} ${textPrimary} hover:border-almet-sapphire/50 hover:shadow-lg`
        }
      `}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className={`
            p-3 rounded-xl transition-all duration-200
            ${isActive 
              ? 'bg-white/20 backdrop-blur-sm' 
              : 'bg-almet-mystic group-hover:bg-almet-sapphire/10'
            }
          `}>
            <Icon className={`w-5 h-5 ${
              isActive ? 'text-white' : 'text-almet-sapphire'
            }`} />
          </div>
          <div className="flex items-center gap-2">
            {count !== undefined && (
              <span className={`
                px-3 py-1 rounded-full text-base font-bold transition-all duration-200
                ${isActive 
                  ? 'bg-white/20 text-white backdrop-blur-sm' 
                  : 'bg-almet-mystic text-almet-sapphire group-hover:bg-almet-sapphire/10'
                }
              `}>
                {count}
              </span>
            )}
            <ArrowRight className={`
              w-4 h-4 transition-all duration-200
              ${isActive ? 'rotate-0' : 'group-hover:translate-x-1 group-hover:text-almet-sapphire'}
            `} />
          </div>
        </div>
        
        <h3 className="font-bold text-base mb-2">{title}</h3>
        <p className={`text-xs leading-relaxed ${
          isActive ? 'text-white/90' : textSecondary
        }`}>
          {subtitle}
        </p>
      </div>
    </div>
  );

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => {
    const colors = {
      blue: 'bg-slate-50 border-slate-200 text-almet-cloud-burst',
      green: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      purple: 'bg-violet-50 border-violet-200 text-violet-700',
      orange: 'bg-amber-50 border-amber-200 text-amber-700',
      almet: 'bg-blue-50 border-blue-200 text-almet-cloud-burst'
    };

    const iconColors = {
      blue: 'bg-slate-100 text-almet-sapphire',
      green: 'bg-emerald-100 text-emerald-600',
      purple: 'bg-violet-100 text-violet-600',
      orange: 'bg-amber-100 text-amber-600',
      almet: 'bg-blue-100 text-almet-sapphire'
    };

    return (
      <div className={`
        ${colors[color]} border rounded-xl p-4 shadow-sm 
        transition-all duration-200 hover:shadow-md hover:scale-[1.01]
      `}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-xs font-medium uppercase tracking-wide opacity-70">{title}</h3>
            <div className="text-xl font-bold mt-1 mb-1">{value}</div>
            {subtitle && (
              <p className="text-xs leading-tight opacity-80">{subtitle}</p>
            )}
          </div>
          <div className={`${iconColors[color]} p-2 rounded-lg`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </div>
    );
  };

  // Get breadcrumb items based on current view
  const getBreadcrumbs = () => {
    const items = [
      { label: 'Assessment Matrix', onClick: () => setActiveView('dashboard') }
    ];

    if (activeView === 'behavioral') {
      items.push({ label: 'Behavioral Competency Assessment' });
    } else if (activeView === 'core') {
      items.push({ label: 'Core Competency Assessment' });
    } else if (activeView === 'leadership') {
      items.push({ label: 'Leadership Assessment' });
    } else if (showSettings) {
      items.push({ label: 'Settings' });
    }

    return items;
  };

  // Handle settings display
  if (showSettings) {
    return (
      <div className="space-y-4">
        <Breadcrumb items={getBreadcrumbs()} />
        <AssessmentSettings onBack={() => setShowSettings(false)} />
      </div>
    );
  }

  if (loading && activeView === 'dashboard') {
    return (
      <div className="space-y-4">
        <div className={`${bgCard} border ${borderColor} rounded-xl p-5 shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-lg font-bold ${textPrimary}`}>Assessment Matrix</h2>
              <p className={`text-xs ${textSecondary} mt-1`}>Employee competency assessment system</p>
            </div>
            <ActionButton
              onClick={() => setShowSettings(true)}
              icon={Settings}
              label="Settings"
              variant="outline"
            />
          </div>
        </div>
        
        <div className={`
          min-h-96 flex items-center justify-center ${bgCard} border ${borderColor} 
          rounded-xl p-12 shadow-sm
        `}>
          <div className="text-center">
            <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-almet-sapphire" />
            <p className={`${textPrimary} font-semibold text-sm`}>Loading assessment data...</p>
            <p className={`${textSecondary} text-xs mt-1`}>Please wait</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && activeView === 'dashboard') {
    return (
      <div className="space-y-4">
        <div className={`${bgCard} border ${borderColor} rounded-xl p-5 shadow-sm`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-lg font-bold ${textPrimary}`}>Assessment Matrix</h2>
              <p className={`text-xs ${textSecondary} mt-1`}>Employee competency assessment system</p>
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
        
        <div className={`${bgCard} border border-red-200 rounded-xl p-5 shadow-sm`}>
          <div className="flex items-start gap-3">
            <AlertCircle className="text-red-500 flex-shrink-0" size={20}/>
            <div className="flex-1">
              <h3 className="text-red-700 font-bold text-sm">Error Loading Data</h3>
              <p className="text-xs text-red-600 mt-1 leading-relaxed">
                {error?.message || 'Failed to load assessment data.'}
              </p>
            </div>
            <ActionButton 
              icon={RefreshCw} 
              label="Try Again" 
              onClick={fetchDashboardData}
              variant="outline"
              size="xs"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Breadcrumb */}
      <Breadcrumb items={getBreadcrumbs()} />

      {/* Header */}
      <div className={`${bgCard} border ${borderColor} rounded-xl p-5 shadow-sm`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-almet-sapphire/10 rounded-lg shadow-sm">
              <BarChart3 className="w-5 h-5 text-almet-sapphire" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${textPrimary}`}>Assessment Matrix</h1>
              <p className={`text-xs ${textSecondary} mt-1`}>
                Comprehensive employee competency assessment and management system
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {activeView !== 'dashboard' && (
              <ActionButton
                onClick={() => setActiveView('dashboard')}
                icon={Home}
                label="Dashboard"
                variant="ghost"
                size="sm"
              />
            )}
            
            <ActionButton
              onClick={() => setShowSettings(true)}
              icon={Settings}
              label="Settings"
              variant="outline"
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* Content */}
      {activeView === 'dashboard' && (
        <div className="space-y-5">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              icon={BarChart3}
              title="Total Assessments"
              value={dashboardData.totalAssessments}
              subtitle="All assessments"
              color="almet"
            />
            <StatCard
              icon={TrendingUp}
              title="Completed"
              value={dashboardData.completedAssessments}
              subtitle={`${dashboardData.completionRate.toFixed(1)}% completion rate`}
              color="green"
            />
            <StatCard
              icon={Users}
              title="Behavioral"
              value={dashboardData.behavioralAssessments}
              subtitle="Soft skills assessments"
              color="purple"
            />
            <StatCard
              icon={Target}
              title="Core Competency"
              value={dashboardData.coreAssessments}
              subtitle="Technical skills assessments"
              color="orange"
            />
            <StatCard
              icon={Crown}
              title="Leadership"
              value={dashboardData.leadershipAssessments}
              subtitle="Senior position assessments"
              color="blue"
            />
          </div>

          {/* Assessment Types Navigation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
           
                  <NavigationCard
              icon={Crown}
              title="Leadership Assessment"
              subtitle="Comprehensive leadership evaluation for senior positions including Manager, Vice Chairman, Director, Vice President, and HOD"
              color="from-amber-100 via-amber-200 to-amber-300"
              count={dashboardData.leadershipAssessments}
              isActive={false}
              onClick={() => setActiveView('leadership')}
            />
            <NavigationCard
              icon={Users}
              title="Behavioral Competency Assessment"
              subtitle="Evaluate employee behavioral competencies, soft skills, and interpersonal abilities through structured assessments"
              color="from-violet-100 via-violet-200 to-violet-300"
              count={dashboardData.behavioralAssessments}
              isActive={false}
              onClick={() => setActiveView('behavioral')}
            />
            
            <NavigationCard
              icon={Target}
              title="Core Competency Assessment"
              subtitle="Assess technical skills, core competencies, and job-specific requirements for comprehensive employee evaluation"
              color="from-blue-100 via-blue-200 to-blue-300"
              count={dashboardData.coreAssessments}
              isActive={false}
              onClick={() => setActiveView('core')}
            />
            
     
          </div>
        </div>
      )}
 {activeView === 'leadership' && (
        <div className="space-y-4">
          <LeadershipAssessmentCalculation />
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

     
      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText="Confirm"
        cancelText="Cancel"
        type={confirmModal.type}
        darkMode={darkMode}
      />
    </div>
  );
};

// Wrap with ToastProvider
const AssessmentMatrix = () => {
  return (
    <ToastProvider>
      <AssessmentMatrixInner />
    </ToastProvider>
  );
};

export default AssessmentMatrix;